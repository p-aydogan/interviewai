const { test } = require('node:test')
const assert = require('node:assert/strict')
const { load } = require('../diagnostics/test-loader.cjs')
const { createBootstrap } = load(require.resolve('./bootstrap.ts'))
const tick = () => new Promise(resolve => setTimeout(resolve, 15))
function fixture(getUser) {
  let event, cleared = 0
  const states = []
  const session = { access_token: 'test-token', user: { id: 'user-a' } }
  const auth = {
    async getSession() { return { data: { session }, error: null } },
    getUser,
    onAuthStateChange(callback) { event = callback; return { data: { subscription: { unsubscribe() {} } } } },
    async signOut() { return { error: null } },
  }
  const bootstrap = createBootstrap(auth, async () => { cleared++ }, state => states.push(state))
  return { bootstrap, states, change: () => event('SIGNED_IN', session), cleared: () => cleared }
}
test('cached session is not sufficient; successful user verification opens private boundary', async () => {
  const f = fixture(async () => ({ data: { user: { id: 'user-a' } }, error: null }))
  assert.equal(f.states.at(-1).status, 'checking')
  await tick()
  assert.equal(f.states.at(-1).status, 'authenticated')
  await f.bootstrap.logout()
  assert.equal(f.cleared(), 1)
  assert.equal(f.states.at(-1).status, 'unauthenticated')
  f.change()
  await tick()
  assert.equal(f.states.at(-1).status, 'unauthenticated')
  f.bootstrap.dispose()
})
test('invalid identity fails closed', async () => {
  const f = fixture(async () => ({ data: { user: { id: 'other' } }, error: null }))
  await tick()
  assert.equal(f.states.at(-1).status, 'auth-error')
  f.bootstrap.dispose()
})
test('old verification after account event cannot publish authenticated state', async () => {
  let resolve
  const f = fixture(() => new Promise(r => { resolve = r }))
  await tick()
  const old = resolve
  f.change()
  old({ data: { user: { id: 'user-a' } }, error: null })
  await tick()
  assert.ok(!f.states.some(state => state.status === 'authenticated'))
  f.bootstrap.dispose()
})
