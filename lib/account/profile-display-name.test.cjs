// Compile source in memory, matching the existing recovery test approach.
// No provider requests, credentials, browser, or generated files.
const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')
const root = path.resolve(__dirname, '../..')

function load(file, imports = {}, globals = {}) {
  const source = fs.readFileSync(path.join(root, file), 'utf8')
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText
  const scope = { exports: {}, ...globals, require(name) {
    if (!(name in imports)) throw new Error(`Unexpected import: ${name}`)
    return imports[name]
  } }
  vm.runInNewContext(compiled, scope)
  return scope.exports
}
const validation = load('lib/account/profile-display-name.ts')
const { validateDisplayName } = validation
const { createProfileEditor } = load('components/account/useProfileEditor.ts', {
  react: {}, 'next/navigation': {}, '@/lib/supabase': {},
  '@/lib/account/profile-display-name': validation,
})
const plain = value => JSON.parse(JSON.stringify(value))

for (const [description, input, expected] of [
  ['ASCII', 'Ada Lovelace', 'Ada Lovelace'],
  ['Turkish', 'Çağrı Işık Şener', 'Çağrı Işık Şener'],
  ['German', 'Jürgen Weiß', 'Jürgen Weiß'],
  ['Japanese', '山田 太郎', '山田 太郎'],
  ['Arabic', 'ليلى حسن', 'ليلى حسن'],
  ['trim', '  Ada  ', 'Ada'],
  ['collapse whitespace', 'Ada\t\n  Lovelace\u00a0 Byron', 'Ada Lovelace Byron'],
  ['80 code points', 'é'.repeat(80), 'é'.repeat(80)],
  ['surrogate pairs count once', '𠮷'.repeat(80), '𠮷'.repeat(80)],
  ['punctuation', "Anne-Marie O’Neill, Jr.", "Anne-Marie O’Neill, Jr."],
  ['combining diacritics retained', 'Jose\u0301', 'Jose\u0301'],
]) {
  test(`normalization: ${description}`, () => {
    assert.deepEqual(plain(validateDisplayName(input)), { valid: true, value: expected })
  })
}
for (const [description, input, error] of [
  ['81 code points', 'a'.repeat(81), 'tooLong'],
  ['81 surrogate pairs', '𠮷'.repeat(81), 'tooLong'],
  ['blank', '', 'required'], ['whitespace only', ' \t\n ', 'required'],
  ['NUL control', 'Ada\u0000Name', 'invalid'], ['DEL control', 'Ada\u007f', 'invalid'],
  ['C1 control', 'Ada\u0085Name', 'invalid'],
  ['non-string', 123, 'invalid'], ['null', null, 'invalid'],
]) {
  test(`validation: ${description}`, () => {
    assert.deepEqual(plain(validateDisplayName(input)), { valid: false, error })
  })
}
test('validation does not mutate input or transliterate', () => {
  const input = Object.freeze({ name: '  Çağrı Weiß  ' })
  validateDisplayName(input.name)
  assert.equal(input.name, '  Çağrı Weiß  ')
  assert.equal(validateDisplayName(input.name).value, 'Çağrı Weiß')
})

function harness(initial = 'Ada', version = 'V1') {
  const calls = []
  let refreshes = 0
  let implementation = async value => ({ data: { user: { updated_at: 'V2', user_metadata: { display_name: value } } }, error: null })
  const editor = createProfileEditor(initial, { updateUser(payload) {
    calls.push(plain(payload))
    return implementation(payload.data.display_name)
  } }, () => refreshes++, version)
  return { editor, calls, get state() { return editor.getSnapshot() },
    get refreshes() { return refreshes }, provider(fn) { implementation = fn } }
}
function deferred() {
  let resolve
  const promise = new Promise(done => { resolve = done })
  return { promise, resolve }
}
const success = (value, version = 'V2') => ({ data: { user: { updated_at: version, user_metadata: { display_name: value } } }, error: null })

test('unchanged normalized value closes without provider mutation', async () => {
  const h = harness(); h.editor.edit(); h.editor.change('  Ada '); await h.editor.save()
  assert.equal(h.calls.length, 0); assert.equal(h.state.editing, false); assert.equal(h.state.saved, false)
})
test('valid save sends only display_name and confirms returned identity', async () => {
  const h = harness(); h.editor.edit(); h.editor.change('  Çağrı   Weiß '); await h.editor.save()
  assert.deepEqual(h.calls, [{ data: { display_name: 'Çağrı Weiß' } }])
  assert.equal(h.state.confirmed, 'Çağrı Weiß'); assert.equal(h.state.editing, false)
  assert.equal(h.state.saved, true); assert.equal(h.refreshes, 1)
})
test('duplicate synchronous saves produce one mutation and a saving state', async () => {
  const h = harness(); const pending = deferred(); h.provider(() => pending.promise)
  h.editor.edit(); h.editor.change('Grace'); const saving = h.editor.save(); void h.editor.save()
  assert.equal(h.calls.length, 1); assert.equal(h.state.saving, true)
  h.editor.change('Blocked'); h.editor.cancel(); assert.equal(h.state.draft, 'Grace')
  pending.resolve(success('Grace')); await saving; assert.equal(h.state.saving, false)
})
for (const [name, provider] of [
  ['provider error', async () => ({ data: { user: null }, error: { message: 'Private provider detail' } })],
  ['network exception', async () => { throw new Error('Offline') }],
  ['unconfirmed response', async () => success('Unexpected')],
]) {
  test(`${name} preserves editable draft without success or refresh`, async () => {
    const h = harness(); h.provider(provider); h.editor.edit(); h.editor.change('Grace'); await h.editor.save()
    assert.equal(h.state.draft, 'Grace'); assert.equal(h.state.confirmed, 'Ada')
    assert.equal(h.state.editing, true); assert.equal(h.state.error, 'saveFailed')
    assert.equal(h.state.saved, false); assert.equal(h.state.saving, false); assert.equal(h.refreshes, 0)
  })
}
test('provider failure permits explicit retry', async () => {
  const h = harness(); h.provider(async () => { throw new Error('Offline') })
  h.editor.edit(); h.editor.change('Grace'); await h.editor.save()
  h.provider(async value => success(value)); await h.editor.save()
  assert.equal(h.calls.length, 2); assert.equal(h.state.saved, true); assert.equal(h.state.error, null)
})
test('invalid save fails locally and cancel resets draft/errors without mutation', async () => {
  const h = harness(); h.editor.edit(); h.editor.change('   '); await h.editor.save()
  assert.equal(h.state.error, 'required'); assert.equal(h.calls.length, 0)
  h.editor.cancel(); assert.equal(h.state.draft, 'Ada'); assert.equal(h.state.error, null)
  assert.equal(h.state.editing, false)
})
test('missing name stays missing until an explicit valid save', async () => {
  const h = harness(''); assert.equal(h.state.confirmed, '')
  h.editor.edit(); await h.editor.save(); assert.equal(h.calls.length, 0)
  h.editor.change('山田'); await h.editor.save(); assert.equal(h.state.confirmed, '山田')
})
test('clean view and clean editor follow external identity', () => {
  const h = harness(); h.editor.reconcile('Grace', 'V2'); assert.equal(h.state.confirmed, 'Grace')
  h.editor.edit(); h.editor.reconcile('Lin', 'V3'); assert.equal(h.state.draft, 'Lin')
  assert.equal(h.state.conflict, false)
})
test('dirty draft survives external updates and save waits for Use latest', async () => {
  const h = harness(); h.editor.edit(); h.editor.change('My draft'); h.editor.reconcile('Grace', 'V2')
  assert.equal(h.state.draft, 'My draft'); assert.equal(h.state.confirmed, 'Grace')
  assert.equal(h.state.conflict, true); await h.editor.save(); assert.equal(h.calls.length, 0)
  h.editor.change('Another draft'); await h.editor.save(); assert.equal(h.calls.length, 0)
  h.editor.reconcile('Lin', 'V3'); h.editor.useLatest(); assert.equal(h.state.draft, 'Lin')
  assert.equal(h.state.conflict, false); h.editor.change('My choice'); await h.editor.save()
  assert.equal(h.state.confirmed, 'My choice')
})
test('cancel after conflict restores latest confirmed value', () => {
  const h = harness(); h.editor.edit(); h.editor.change('Draft'); h.editor.reconcile('Latest', 'V2')
  h.editor.cancel(); assert.equal(h.state.draft, 'Latest'); assert.equal(h.state.conflict, false)
  assert.equal(h.calls.length, 0)
})
test('own save refresh before provider completion does not create a conflict', async () => {
  const h = harness(); const pending = deferred(); h.provider(() => pending.promise)
  h.editor.edit(); h.editor.change('Grace'); const saving = h.editor.save()
  h.editor.reconcile('Grace', 'V2'); pending.resolve(success('Grace')); await saving
  assert.equal(h.state.conflict, false); assert.equal(h.state.saved, true)
})
test('external conflicting update during save is not silently overwritten', async () => {
  const h = harness(); const pending = deferred(); h.provider(() => pending.promise)
  h.editor.edit(); h.editor.change('Grace'); const saving = h.editor.save()
  h.editor.reconcile('Lin', 'V3'); pending.resolve(success('Grace')); await saving
  assert.equal(h.state.confirmed, 'Lin'); assert.equal(h.state.draft, 'Grace')
  assert.equal(h.state.conflict, true); assert.equal(h.state.saved, false)
})
test('disposed editor ignores a late provider response and refresh', async () => {
  const h = harness(); const pending = deferred(); h.provider(() => pending.promise)
  h.editor.edit(); h.editor.change('Grace'); const saving = h.editor.save()
  h.editor.dispose(); pending.resolve(success('Grace')); await saving
  assert.equal(h.refreshes, 0); assert.equal(h.state.confirmed, 'Ada')
})

// Render the real hook with persistent state and React-style dependency comparison.
// This covers the effect wiring that controller-only tests cannot exercise.
function profileHookHarness() {
  let stored, rendered, name = 'A', version = 'V1', effectIndex = 0, refreshes = 0
  const effects = [], pending = [], calls = []
  const router = { refresh() { refreshes++ } }
  const react = {
    useState(init) { if (!stored) stored = init(); return [stored, () => {}] },
    useSyncExternalStore(subscribe, getSnapshot) { return getSnapshot() },
    useEffect(fn, deps) {
      const index = effectIndex++, previous = effects[index]
      if (!previous || deps.some((value, i) => !Object.is(value, previous.deps[i]))) {
        pending.push(() => { previous?.cleanup?.(); effects[index] = { deps, cleanup: fn() } })
      }
    },
  }
  const hook = load('components/account/useProfileEditor.ts', {
    react, 'next/navigation': { useRouter: () => router },
    '@/lib/supabase': { createClient: () => ({ auth: { async updateUser(payload) {
      calls.push(plain(payload)); return success(payload.data.display_name, 'V2')
    } } }) }, '@/lib/account/profile-display-name': validation,
  }).useProfileEditor
  function render(nextName = name, nextVersion = version) {
    name = nextName; version = nextVersion; effectIndex = 0
    rendered = hook(name, version)
    while (pending.length) pending.shift()()
  }
  render()
  return { render, calls, get editor() { return rendered.editor },
    get state() { return rendered.editor.getSnapshot() }, get refreshes() { return refreshes } }
}
test('hook: A/V1 -> local B/V2 -> server A/V3 reconciles the clean view', async () => {
  const h = profileHookHarness(); h.editor.edit(); h.editor.change('B'); await h.editor.save()
  assert.equal(h.state.confirmed, 'B'); assert.equal(h.state.version, 'V2')
  // No server render with B occurs: both adjacent server name props remain A.
  h.render('A', 'V3')
  assert.equal(h.state.confirmed, 'A'); assert.equal(h.state.draft, 'A')
  assert.equal(h.state.version, 'V3'); assert.equal(h.state.conflict, false)
})
for (const reconcile of ['useLatest', 'cancel']) {
  test(`hook: repeated A/V3 preserves dirty draft and blocks Save until ${reconcile}`, async () => {
    const h = profileHookHarness(); h.editor.edit(); h.editor.change('B'); await h.editor.save()
    h.editor.edit(); h.editor.change('My draft'); h.render('A', 'V3')
    assert.equal(h.state.draft, 'My draft'); assert.equal(h.state.draftVersion, 'V2')
    assert.equal(h.state.confirmed, 'A'); assert.equal(h.state.version, 'V3')
    assert.equal(h.state.conflict, true); await h.editor.save(); assert.equal(h.calls.length, 1)
    h.editor[reconcile](); assert.equal(h.state.draft, 'A'); assert.equal(h.state.draftVersion, 'V3')
    assert.equal(h.state.conflict, false); assert.equal(h.state.editing, reconcile === 'useLatest')
  })
}
test('hook: own saved snapshot V2 is the baseline for the next draft', async () => {
  const h = profileHookHarness(); h.editor.edit(); h.editor.change('B'); await h.editor.save()
  h.editor.edit(); h.editor.change('Next draft'); h.render('B', 'V2')
  assert.equal(h.state.version, 'V2'); assert.equal(h.state.draftVersion, 'V2')
  assert.equal(h.state.draft, 'Next draft'); assert.equal(h.state.conflict, false)
  assert.deepEqual(h.calls, [{ data: { display_name: 'B' } }]); assert.equal(h.refreshes, 1)
})
test('hook: same name with a new version conflicts, identical snapshot does not', () => {
  const h = profileHookHarness(); h.editor.edit(); h.editor.change('Draft'); h.render('A', 'V1')
  assert.equal(h.state.conflict, false)
  h.render('A', 'V3'); assert.equal(h.state.conflict, true); assert.equal(h.state.draft, 'Draft')
})
test('missing initial server version blocks mutation without inventing a version', async () => {
  const h = harness('Ada', ''); h.editor.edit(); h.editor.change('Grace'); await h.editor.save()
  assert.equal(h.calls.length, 0); assert.equal(h.state.error, 'saveFailed'); assert.equal(h.state.version, '')
})
test('missing provider version preserves draft and never claims confirmed success', async () => {
  const h = harness()
  h.provider(async value => ({ data: { user: { user_metadata: { display_name: value } } }, error: null }))
  h.editor.edit(); h.editor.change('Grace'); await h.editor.save()
  assert.equal(h.state.saved, false); assert.equal(h.state.editing, true)
  assert.equal(h.state.draft, 'Grace'); assert.equal(h.state.version, 'V1'); assert.equal(h.state.error, 'saveFailed')
})
test('a matching name from another version during save still requires reconciliation', async () => {
  const h = harness(); const pending = deferred(); h.provider(() => pending.promise)
  h.editor.edit(); h.editor.change('Grace'); const saving = h.editor.save()
  h.editor.reconcile('Grace', 'V3'); pending.resolve(success('Grace', 'V2')); await saving
  assert.equal(h.state.conflict, true); assert.equal(h.state.version, 'V3')
  assert.equal(h.state.draftVersion, 'V1'); assert.equal(h.state.saved, false)
})

// Exercise the real account hook's subscription/timer effect with minimal React bindings.
function accountHarness() {
  let callback, cleanup, refreshes = 0, unsubscribed = false, time = 10000, stateIndex = 0
  let insideCallback = false
  const events = new Map(), timers = new Map(), navigations = []
  let nextTimer = 0
  const supabase = { auth: {
    onAuthStateChange(fn) { callback = fn; return { data: { subscription: { unsubscribe() { unsubscribed = true } } } } },
    async getSession() { return { data: { session: null }, error: null } },
  } }
  const react = {
    useState(initial) { const value = stateIndex++ === 0 ? supabase : initial; return [value, () => {}] },
    useRef(value) { return { current: value } }, useEffect(fn) { cleanup = fn() },
  }
  const mod = load('components/account/useAccountSession.ts', {
    react, '@/lib/supabase': { createClient: () => supabase },
    'next/navigation': { useRouter: () => ({ refresh() { assert.equal(insideCallback, false); refreshes++ } }) },
  }, {
    Date: { now: () => time },
    setTimeout(fn) { const id = ++nextTimer; timers.set(id, fn); return id },
    clearTimeout(id) { timers.delete(id) },
    window: { location: { replace(url) { navigations.push(url) } },
      addEventListener(name, fn) { events.set(name, fn) }, removeEventListener(name) { events.delete(name) } },
  })
  mod.useAccountSession()
  return { emit(event, session = { user: {} }) { insideCallback = true; callback(event, session); insideCallback = false },
    flush() { for (const [id, fn] of timers) { timers.delete(id); fn() } },
    focus() { events.get('focus')?.() }, advance() { time += 2000 }, cleanup: () => cleanup(),
    get refreshes() { return refreshes }, get unsubscribed() { return unsubscribed }, events, navigations }
}
test('USER_UPDATED coalesces events and refreshes outside the Auth callback', () => {
  const h = accountHarness(); h.emit('USER_UPDATED'); h.emit('USER_UPDATED')
  assert.equal(h.refreshes, 0); h.flush(); assert.equal(h.refreshes, 1)
})
test('focus refresh is bounded and has no polling', () => {
  const h = accountHarness(); h.focus(); h.flush(); h.focus(); h.flush(); assert.equal(h.refreshes, 1)
  h.advance(); h.focus(); h.flush(); assert.equal(h.refreshes, 2); h.flush(); assert.equal(h.refreshes, 2)
})
test('account cleanup cancels scheduled refresh and removes listeners', () => {
  const h = accountHarness(); h.emit('USER_UPDATED'); h.cleanup(); h.flush()
  assert.equal(h.refreshes, 0); assert.equal(h.unsubscribed, true); assert.equal(h.events.size, 0)
})
test('sign-out preserves login navigation and suppresses pending refresh', () => {
  const h = accountHarness(); h.emit('USER_UPDATED'); h.emit('SIGNED_OUT', null); h.flush()
  assert.deepEqual(h.navigations, ['/login']); assert.equal(h.refreshes, 0)
})
test('initial missing session still redirects to login', () => {
  const h = accountHarness(); h.emit('INITIAL_SESSION', null); assert.deepEqual(h.navigations, ['/login'])
})
