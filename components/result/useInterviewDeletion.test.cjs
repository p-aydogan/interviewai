const { test } = require('node:test')
const assert = require('node:assert/strict')
const { load, plain, fixture, item } = require('../../lib/interviews/history-test-helpers.cjs')
const rows = fixture(), items = rows.map(item)
const tick = () => new Promise(resolve => setImmediate(resolve))
function deferred() { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no }); return { promise, resolve, reject } }
// Minimal persistent-slot hook harness: rerenders state, compares dependencies,
// runs effect cleanup, and leaves fetch promises under each test's control.
// No DOM/React scheduling or browser-visibility claim is made by this harness.
function harness() {
  const slots = [], effects = [], pending = [], requests = [], navigation = []
  let index = 0, view, disposed = false, updates = 0, scheduled = false
  const router = { replace: destination => navigation.push(destination) }
  const same = (a, b) => a && a.length === b.length && a.every((value, i) => Object.is(value, b[i]))
  const react = {
    useState(initial) {
      const i = index++; if (!(i in slots)) slots[i] = initial
      return [slots[i], value => {
        updates++; slots[i] = value
        if (!scheduled && !disposed) { scheduled = true; queueMicrotask(() => { scheduled = false; if (!disposed) render() }) }
      }]
    },
    useRef(initial) { const i = index++; return slots[i] || (slots[i] = { current: initial }) },
    useEffect(fn, deps) {
      const i = index++, previous = effects[i]
      if (!same(previous?.deps, deps)) pending.push(() => { previous?.cleanup?.(); effects[i] = { deps, cleanup: fn() } })
    },
  }
  const { AUTH_ROUTES } = load('lib/auth/auth-constants.ts', {})
  const hook = load('components/result/useInterviewDeletion.ts', {
    react, 'next/navigation': { useRouter: () => router }, '@/lib/auth/auth-constants': { AUTH_ROUTES },
  }, { AbortController, fetch(url, options) {
    const d = deferred(); requests.push({ url, options, ...d }); return d.promise
  } }).useInterviewDeletion
  function render() { index = 0; view = hook(items[0].id); while (pending.length) pending.shift()() }
  render()
  return { requests, navigation, get state() { return plain(view.state) }, get updates() { return updates },
    open() { view.open() }, cancel() { view.cancel() }, confirm() { return view.confirm() },
    unmount() { disposed = true; effects.forEach(effect => effect?.cleanup?.()) },
    async respond(i, payload, status = 200) {
      requests[i].resolve({ status, ok: status >= 200 && status < 300, json: async () => payload }); await tick()
    },
    async fail(i) { requests[i].reject(new Error('Synthetic network failure')); await tick() },
  }
}

test('confirmation required and Cancel sends no request', async () => {
  const h = harness(); await h.confirm(); assert.equal(h.requests.length, 0)
  h.open(); await tick(); assert.equal(h.state.confirming, true)
  h.cancel(); await tick(); await h.confirm(); assert.equal(h.requests.length, 0)
  assert.equal(h.state.confirming, false); h.unmount()
})
test('synchronous duplicate guard, request options and loading state', async () => {
  const h = harness(); h.open(); const first = h.confirm(); void h.confirm(); await tick()
  assert.equal(h.requests.length, 1); assert.equal(h.state.deleting, true)
  assert.equal(h.requests[0].url, '/api/interviews/' + items[0].id)
  assert.equal(h.requests[0].options.method, 'DELETE'); assert.equal(h.requests[0].options.credentials, 'same-origin')
  assert.equal(h.requests[0].options.cache, 'no-store'); assert.equal('body' in h.requests[0].options, false)
  h.cancel(); await tick(); assert.equal(h.state.confirming, true)
  await h.respond(0, { deleted: true }); await first; await h.confirm()
  assert.deepEqual(h.navigation, ['/interviews']); assert.equal(h.requests.length, 1); h.unmount()
})
test('status alone or malformed success never navigates', async () => {
  for (const body of [null, {}, { deleted: false }, { deleted: 'true' }]) {
    const h = harness(); h.open(); void h.confirm(); await h.respond(0, body)
    assert.deepEqual(h.navigation, []); assert.equal(h.state.error, 'failed')
    assert.equal(h.state.confirming, true); assert.equal(h.state.deleting, false); h.unmount()
  }
})
test('401 uses existing login route', async () => {
  const h = harness(); h.open(); void h.confirm(); await h.respond(0, {}, 401)
  assert.deepEqual(h.navigation, ['/login']); h.unmount()
})
for (const status of [400, 404]) test(status + ' becomes unavailable without false success', async () => {
  const h = harness(); h.open(); void h.confirm(); await h.respond(0, {}, status)
  assert.equal(h.state.error, 'unavailable'); assert.equal(h.state.deleting, false)
  assert.deepEqual(h.navigation, []); await h.confirm(); assert.equal(h.requests.length, 1); h.unmount()
})
for (const kind of ['server', 'network']) test(kind + ' failure retains confirmation and retries', async () => {
  const h = harness(); h.open(); void h.confirm()
  if (kind === 'server') await h.respond(0, {}, 500); else await h.fail(0)
  assert.equal(h.state.confirming, true); assert.equal(h.state.error, 'failed'); assert.equal(h.state.deleting, false)
  assert.deepEqual(h.navigation, []); void h.confirm(); await h.respond(1, { deleted: true })
  assert.deepEqual(h.navigation, ['/interviews']); h.unmount()
})
test('unmount aborts and late completion cannot update or navigate', async () => {
  const h = harness(); h.open(); void h.confirm(); await tick()
  const updates = h.updates; h.unmount(); assert.equal(h.requests[0].options.signal.aborted, true)
  await h.respond(0, { deleted: true }); assert.equal(h.updates, updates); assert.deepEqual(h.navigation, [])
})
test('late network rejection after disposal cannot update state', async () => {
  const h = harness(); h.open(); void h.confirm(); await tick(); h.unmount(); const updates = h.updates
  await h.fail(0); assert.equal(h.updates, updates); assert.deepEqual(h.navigation, [])
})
