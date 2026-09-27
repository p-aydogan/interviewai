// Run with: node --test components/auth/recovery-session.test.cjs
// Compile in memory; no browser, credentials, generated files, or network requests.
const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')

const compiled = ts.transpileModule(
  fs.readFileSync(path.join(__dirname, 'recovery-session.ts'), 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } },
).outputText
const session = (id = 'recovery-session', user = 'user-a') => ({
  access_token: id, user: { id: user },
})

function harness(sharedStorage = new Map()) {
  let now = 1_000_000
  let nextTimer = 0
  const timers = new Map()
  const scope = {
    exports: {}, Date: class extends Date { static now() { return now } },
    setTimeout(fn, delay) { const id = ++nextTimer; timers.set(id, { fn, at: now + delay }); return id },
    clearTimeout(id) { timers.delete(id) },
  }
  vm.runInNewContext(compiled, scope)
  const { createRecoverySession, RECOVERY_CONTEXT_KEY: key, RECOVERY_LIFETIME_MS: lifetime } = scope.exports
  let listener
  let activeSession = session()
  const verifiedTokens = new Map()
  const claimCalls = []
  const userCalls = []
  function remember(value, claims = {}) {
    if (value) verifiedTokens.set(value.access_token, {
      user: value.user,
      claims: { session_id: value.access_token.replace('-refreshed', ''), sub: value.user.id,
        amr: [{ method: value.access_token.startsWith('ordinary') ? 'password' : 'recovery', timestamp: 1000 }], ...claims },
    })
  }
  remember(activeSession)
  let callback = false
  let userError = null
  let claimsError = null
  let updates = 0
  let updateImpl = async () => ({ error: null })
  let userImpl
  let status = 'checking'
  const auth = {
    onAuthStateChange(fn) { listener = fn; return { data: { subscription: { unsubscribe() { listener = null } } } } },
    async getSession() { return { data: { session: activeSession }, error: null } },
    async getClaims(token) {
      claimCalls.push(token)
      return { data: { claims: verifiedTokens.get(token)?.claims }, error: claimsError }
    },
    async getUser(token) {
      userCalls.push(token)
      return userImpl ? userImpl(token) : { data: { user: verifiedTokens.get(token)?.user }, error: userError }
    },
    async updateUser() { updates++; return updateImpl() },
  }
  const storage = {
    getItem: (name) => sharedStorage.get(name) ?? null,
    setItem: (name, value) => sharedStorage.set(name, value),
    removeItem: (name) => sharedStorage.delete(name),
  }
  const controller = createRecoverySession({ auth, storage, hasCallback: () => callback, onStatus: (value) => { status = value } })
  async function flush() {
    for (let i = 0; i < 40; i++) {
      for (const [id, timer] of timers) {
        if (timer.at <= now) { timers.delete(id); timer.fn() }
      }
      await Promise.resolve()
    }
  }
  return {
    controller, sharedStorage, key, lifetime, storage, flush, claimCalls, userCalls,
    get status() { return status }, get updates() { return updates },
    marker() { return JSON.parse(sharedStorage.get(key) ?? 'null') },
    emit(event, value = activeSession) { listener?.(event, value) },
    setSession(value, claims) { activeSession = value; remember(value, claims) },
    setCallback(value) { callback = value },
    failUser() { userError = { code: 'session_not_found' } },
    failClaims() { claimsError = { code: 'invalid_jwt' } },
    delayUser(fn) { userImpl = fn },
    update(fn) { updateImpl = fn },
    async advance(ms) { now += ms; await flush() },
  }
}

async function ready(h) {
  h.emit('PASSWORD_RECOVERY')
  await h.flush()
  assert.equal(h.status, 'ready')
}

test('ordinary authenticated and signed-out direct access stay unavailable', async () => {
  for (const value of [session('ordinary-session'), null]) {
    const h = harness(); h.setSession(value); h.emit('INITIAL_SESSION'); await h.flush()
    assert.equal(h.status, 'unavailable'); assert.equal(h.marker(), null)
  }
})
test('verified recovery persists only identity, session binding, and bounded expiry', async () => {
  const h = harness(); await ready(h)
  assert.deepEqual(Object.keys(h.marker()).sort(), ['expiresAt', 'sessionId', 'userId'])
  assert.equal(h.marker().expiresAt, 1_000_000 + h.lifetime)
})
test('refresh restores the established recovery session', async () => {
  const first = harness(); await ready(first); first.controller.dispose()
  const next = harness(first.sharedStorage); next.emit('INITIAL_SESSION'); await next.flush()
  assert.equal(next.status, 'ready')
})
test('callback replay cannot use an existing marker', async () => {
  const first = harness(); await ready(first); first.controller.dispose()
  const next = harness(first.sharedStorage); next.setCallback(true)
  next.emit('INITIAL_SESSION'); await next.flush()
  assert.equal(next.status, 'unavailable'); assert.equal(next.marker(), null)
})
test('another profile without recovery context fails closed', async () => {
  const h = harness(); h.setCallback(true); h.emit('SIGNED_IN'); await h.flush()
  assert.equal(h.status, 'unavailable')
})
test('new ordinary session for the same user cannot reuse the marker', async () => {
  const h = harness(); await ready(h); h.setSession(session('ordinary-session'))
  h.emit('SIGNED_IN'); assert.notEqual(h.status, 'ready'); await h.flush()
  assert.equal(h.status, 'unavailable'); assert.equal(h.marker(), null)
})
test('user mismatch revokes ready synchronously', async () => {
  const h = harness(); await ready(h); h.setSession(session('other-session', 'user-b'))
  h.emit('TOKEN_REFRESHED'); assert.equal(h.status, 'unavailable'); await h.flush()
  assert.equal(h.marker(), null)
})
test('SIGNED_OUT and missing auth session revoke ready synchronously', async () => {
  for (const event of ['SIGNED_OUT', 'TOKEN_REFRESHED', 'INITIAL_SESSION']) {
    const h = harness(); await ready(h); h.setSession(null); h.emit(event)
    assert.equal(h.status, 'unavailable'); assert.equal(h.marker(), null)
  }
})
test('token refresh retains binding without extending expiry', async () => {
  const h = harness(); await ready(h); const expiry = h.marker().expiresAt
  await h.advance(1000); h.setSession(session('recovery-session-refreshed'))
  h.emit('TOKEN_REFRESHED'); await h.flush()
  assert.equal(h.status, 'ready'); assert.equal(h.marker().expiresAt, expiry)
})
test('a user update in another tab revokes recovery eligibility', async () => {
  const h = harness(); await ready(h); h.emit('USER_UPDATED')
  assert.equal(h.status, 'unavailable'); assert.equal(h.marker(), null)
})
test('duplicate recovery notifications do not extend expiry', async () => {
  const h = harness(); await ready(h); const expiry = h.marker().expiresAt
  await h.advance(1000); h.emit('PASSWORD_RECOVERY'); await h.flush()
  assert.equal(h.marker().expiresAt, expiry)
})
test('expiry revokes an open form and removes persisted context', async () => {
  const h = harness(); await ready(h); await h.advance(h.lifetime)
  assert.equal(h.status, 'unavailable'); assert.equal(h.marker(), null)
})
test('expired, malformed and excessively long-lived records fail closed', async () => {
  for (const value of ['invalid-json', '{}', JSON.stringify({ userId: 'user-a', sessionId: 'recovery-session', expiresAt: 0 }),
    JSON.stringify({ userId: 'user-a', sessionId: 'recovery-session', expiresAt: 9e15 })]) {
    const h = harness(); h.sharedStorage.set(h.key, value); h.emit('INITIAL_SESSION'); await h.flush()
    assert.equal(h.status, 'unavailable'); assert.equal(h.marker(), null)
  }
})
test('claims and provider user validation are both mandatory', async () => {
  for (const failure of ['failClaims', 'failUser']) {
    const h = harness(); h[failure](); h.emit('PASSWORD_RECOVERY'); await h.flush()
    assert.equal(h.status, 'unavailable'); assert.equal(h.marker(), null)
  }
})
test('late validation cannot resurrect ready after logout', async () => {
  const h = harness(); let resolve
  h.delayUser(() => new Promise((done) => { resolve = done }))
  h.emit('PASSWORD_RECOVERY'); await h.flush()
  h.setSession(null); h.emit('SIGNED_OUT'); resolve({ data: { user: { id: 'user-a' } }, error: null })
  await h.flush(); assert.equal(h.status, 'unavailable'); assert.equal(h.marker(), null)
})
test('INITIAL_SESSION does not discard an in-flight recovery event', async () => {
  const h = harness(); h.emit('PASSWORD_RECOVERY'); h.emit('INITIAL_SESSION'); await h.flush()
  assert.equal(h.status, 'ready')
})
test('initialization and provider validation have bounded UI waiting', async () => {
  const h = harness(); await h.advance(10_000); assert.equal(h.status, 'unavailable')
  const next = harness(); next.delayUser(() => new Promise(() => {}))
  next.emit('PASSWORD_RECOVERY'); await next.flush(); await next.advance(10_000)
  assert.equal(next.status, 'unavailable')
})
test('successful update clears eligibility and cannot be submitted twice', async () => {
  const h = harness(); await ready(h)
  h.update(async () => { h.emit('USER_UPDATED'); return { error: null } })
  assert.equal(await h.controller.submit('test-password'), 'success')
  assert.equal(h.marker(), null); assert.equal(h.status, 'unavailable')
  assert.equal(await h.controller.submit('test-password'), 'unavailable'); assert.equal(h.updates, 1)
})
test('session loss before submit blocks updateUser entirely', async () => {
  const h = harness(); await ready(h); h.setSession(null)
  assert.equal(await h.controller.submit('test-password'), 'unavailable')
  assert.equal(h.updates, 0); assert.equal(h.status, 'unavailable')
})
test('provider update failure keeps generic failure only while authorization remains valid', async () => {
  const h = harness(); await ready(h); h.update(async () => ({ error: { status: 500 } }))
  assert.equal(await h.controller.submit('test-password'), 'failed'); assert.equal(h.status, 'ready')
  h.update(async () => { h.setSession(null); return { error: { status: 401 } } })
  assert.equal(await h.controller.submit('test-password'), 'unavailable'); assert.equal(h.marker(), null)
})
test('storage denial fails closed without persisting a marker', async () => {
  const h = harness(); h.storage.setItem = () => { throw new Error('storage denied') }
  h.emit('PASSWORD_RECOVERY'); await h.flush()
  assert.equal(h.status, 'unavailable'); assert.equal(h.marker(), null)
})
test('silent session loss is detected by revalidation', async () => {
  const h = harness(); await ready(h); h.setSession(null); h.controller.recheck(); await h.flush()
  assert.equal(h.status, 'unavailable'); assert.equal(h.marker(), null)
})
test('late successful update after sign-out cannot restore the form or navigate', async () => {
  const h = harness(); await ready(h); let resolve
  h.update(() => new Promise((done) => { resolve = done }))
  const result = h.controller.submit('test-password'); await h.flush()
  h.setSession(null); h.emit('SIGNED_OUT'); resolve({ error: null })
  assert.equal(await result, 'unavailable'); assert.equal(h.marker(), null)
})
test('a stalled password update cannot leave an actionable form indefinitely', async () => {
  const h = harness(); await ready(h); let resolve
  h.update(() => new Promise((done) => { resolve = done }))
  const result = h.controller.submit('test-password'); await h.flush(); await h.advance(10_000)
  assert.equal(h.status, 'unavailable'); resolve({ error: null })
  assert.equal(await result, 'unavailable')
})

test('PASSWORD_RECOVERY rejects absent, malformed, and every non-recovery AMR', async () => {
  for (const amr of [undefined, null, [], ['recovery'], [null], [{ method: 'otp' }],
    [{ method: 'magiclink' }], [{ method: 'password' }], [{ method: 'email' }], [{ method: 'other' }]]) {
    const h = harness(); h.setSession(session(), { amr }); h.emit('PASSWORD_RECOVERY'); await h.flush()
    assert.equal(h.status, 'unavailable'); assert.equal(h.marker(), null)
  }
})
test('recovery AMR may coexist with other authentication methods', async () => {
  const h = harness(); h.setSession(session(), { amr: [{ method: 'password' }, { method: 'recovery' }] })
  await ready(h)
})
test('forged matching marker cannot restore ordinary password session', async () => {
  const h = harness(); h.setSession(session('ordinary-session'))
  h.sharedStorage.set(h.key, JSON.stringify({ userId: 'user-a', sessionId: 'ordinary-session', expiresAt: 1_100_000 }))
  h.emit('INITIAL_SESSION'); await h.flush()
  assert.equal(h.status, 'unavailable'); assert.equal(h.marker(), null)
})
test('restoration requires matching verified user, session ID, and recovery AMR', async () => {
  for (const [value, claims] of [[session('different-session'), {}], [session('recovery-session', 'user-b'), {}],
    [session(), { amr: [{ method: 'password' }] }]]) {
    const first = harness(); await ready(first); first.controller.dispose()
    const next = harness(first.sharedStorage); next.setSession(value, claims); next.emit('INITIAL_SESSION'); await next.flush()
    assert.equal(next.status, 'unavailable'); assert.equal(next.marker(), null)
  }
})
test('TOKEN_REFRESHED rejects changed session identity or missing recovery AMR', async () => {
  for (const claims of [{ session_id: 'different-session' }, { amr: [{ method: 'otp' }] }]) {
    const h = harness(); await ready(h); h.setSession(session('recovery-session-refreshed'), claims)
    h.emit('TOKEN_REFRESHED'); await h.flush()
    assert.equal(h.status, 'unavailable'); assert.equal(h.marker(), null)
  }
})
test('pending recovery event accepts a rotated token with verified identity continuity', async () => {
  const h = harness(); h.emit('PASSWORD_RECOVERY')
  h.setSession(session('recovery-session-refreshed')); h.emit('TOKEN_REFRESHED'); await h.flush()
  assert.equal(h.status, 'ready')
  for (const token of ['recovery-session', 'recovery-session-refreshed']) {
    assert.ok(h.claimCalls.includes(token)); assert.ok(h.userCalls.includes(token))
  }
})
test('pending recovery event cannot authorize a different verified recovery session', async () => {
  const h = harness(); h.emit('PASSWORD_RECOVERY'); h.setSession(session('different-session')); await h.flush()
  assert.equal(h.status, 'unavailable'); assert.equal(h.marker(), null)
})
test('rotation during validation verifies latest claims and user without extending expiry', async () => {
  const h = harness(); await ready(h); const expiry = h.marker().expiresAt; let resolve
  h.delayUser(() => new Promise((done) => { resolve = done }))
  h.controller.recheck(); await h.flush()
  h.setSession(session('recovery-session-refreshed')); h.delayUser(undefined)
  resolve({ data: { user: { id: 'user-a' } }, error: null }); await h.flush()
  assert.equal(h.status, 'ready'); assert.equal(h.marker().expiresAt, expiry)
  assert.ok(h.claimCalls.includes('recovery-session-refreshed'))
  assert.ok(h.userCalls.includes('recovery-session-refreshed'))
})
test('rotation during validation rejects identity changes, missing AMR, or verification failure', async () => {
  for (const scenario of ['user', 'session', 'amr', 'claims-error', 'user-error']) {
    const h = harness(); await ready(h); let resolve
    h.delayUser(() => new Promise((done) => { resolve = done })); h.controller.recheck(); await h.flush()
    h.setSession(session('recovery-session-refreshed', scenario === 'user' ? 'user-b' : 'user-a'),
      scenario === 'session' ? { session_id: 'different-session' } : scenario === 'amr' ? { amr: [] } : {})
    h.delayUser(undefined)
    if (scenario === 'claims-error') h.failClaims()
    if (scenario === 'user-error') h.failUser()
    resolve({ data: { user: { id: 'user-a' } }, error: null }); await h.flush()
    assert.equal(h.status, 'unavailable'); assert.equal(h.marker(), null)
  }
})
test('logout while latest rotated token is being verified cannot resurrect ready', async () => {
  const h = harness(); await ready(h); let resolve
  h.delayUser((token) => {
    if (token === 'recovery-session') {
      h.setSession(session('recovery-session-refreshed'))
      return { data: { user: { id: 'user-a' } }, error: null }
    }
    return new Promise((done) => { resolve = done })
  })
  h.controller.recheck(); await h.flush()
  assert.equal(typeof resolve, 'function')
  h.setSession(null); h.emit('SIGNED_OUT'); resolve({ data: { user: { id: 'user-a' } }, error: null })
  await h.flush(); assert.equal(h.status, 'unavailable'); assert.equal(h.marker(), null)
})
