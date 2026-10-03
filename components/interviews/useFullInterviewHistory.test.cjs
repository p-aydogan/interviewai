const { test } = require('node:test')
const assert = require('node:assert/strict')
const { load, plain, fixture, item, token } = require('../../lib/interviews/history-test-helpers.cjs')
const rows = fixture(), items = rows.map(item)
const page = (start, end, more = end < 41) => ({ interviews: items.slice(start, end),
  nextCursor: more ? token(rows[end - 1]) : null })
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
    useCallback(fn, deps) {
      const i = index++; if (!same(slots[i]?.deps, deps)) slots[i] = { fn, deps }; return slots[i].fn
    },
    useEffect(fn, deps) {
      const i = index++, previous = effects[i]
      if (!same(previous?.deps, deps)) pending.push(() => { previous?.cleanup?.(); effects[i] = { deps, cleanup: fn() } })
    },
  }
  const { AUTH_ROUTES } = load('lib/auth/auth-constants.ts', {})
  const hook = load('components/interviews/useFullInterviewHistory.ts', {
    react, 'next/navigation': { useRouter: () => router }, '@/lib/auth/auth-constants': { AUTH_ROUTES },
  }, { AbortController, fetch(url, options) {
    const d = deferred(); requests.push({ url, options, ...d }); return d.promise
  } }).useFullInterviewHistory
  function render() { index = 0; view = hook(); while (pending.length) pending.shift()() }
  render()
  return { requests, navigation, get state() { return plain(view.state) }, get updates() { return updates },
    more() { view.loadMore() }, retry() { view.retry() },
    unmount() { disposed = true; effects.forEach(effect => effect?.cleanup?.()) },
    async respond(i, payload, status = 200) {
      requests[i].resolve({ status, ok: status >= 200 && status < 300, json: async () => payload }); await tick()
    },
    async fail(i) { requests[i].reject(new Error('Synthetic network failure')); await tick() },
  }
}
test('initial success validates and displays page one with continuation', async () => {
  const h = harness(); assert.equal(h.state.status, 'loading')
  assert.equal(h.requests[0].url, '/api/interviews?limit=20')
  assert.equal(h.requests[0].options.cache, 'no-store')
  await h.respond(0, page(0, 20))
  assert.deepEqual(h.state.interviews, items.slice(0, 20)); assert.equal(h.state.nextCursor, token(rows[19]))
  assert.equal(h.state.status, 'ready'); h.unmount()
})
test('initial network failure retries page one', async () => {
  const h = harness(); await h.fail(0); assert.equal(h.state.status, 'error')
  h.retry(); assert.equal(h.requests[1].url, h.requests[0].url)
  await h.respond(1, page(0, 1, false)); assert.equal(h.state.status, 'ready'); h.unmount()
})
test('page-two failure preserves rows/cursor and successful retry appends exactly once', async () => {
  const h = harness(); await h.respond(0, page(0, 20)); const previous = h.state
  h.more(); await tick(); assert.deepEqual(h.state.interviews, previous.interviews); assert.equal(h.state.more, 'loading')
  await h.respond(1, {}, 500)
  assert.deepEqual(h.state, { ...previous, more: 'error' })
  h.more(); assert.equal(h.requests[2].url, h.requests[1].url)
  assert.equal(h.requests[2].url, '/api/interviews?limit=20&cursor=' + token(rows[19]))
  await h.respond(2, page(20, 40))
  assert.deepEqual(h.state.interviews, items.slice(0, 40)); assert.equal(h.state.nextCursor, token(rows[39]))
  assert.equal(h.state.more, 'idle'); h.unmount()
})
test('overlap and replay suppress duplicate IDs while preserving existing row values', async () => {
  const h = harness(); await h.respond(0, page(0, 20)); h.more()
  const overlap = page(10, 30); overlap.interviews = overlap.interviews.map(row => ({ ...row, role: 'Replay value' }))
  await h.respond(1, overlap)
  assert.equal(h.state.interviews.length, 30); assert.equal(h.state.interviews[10].role, items[10].role)
  h.more(); await h.respond(2, { interviews: overlap.interviews, nextCursor: null })
  assert.equal(h.state.interviews.length, 30); assert.equal(new Set(h.state.interviews.map(row => row.id)).size, 30)
  assert.equal(h.state.nextCursor, null); h.unmount()
})
test('nonadvancing cursor is rejected without cursor advance or automatic loop', async () => {
  const h = harness(); await h.respond(0, page(0, 20)); const previous = h.state
  h.more(); await h.respond(1, { ...page(20, 40), nextCursor: previous.nextCursor })
  assert.deepEqual(h.state, { ...previous, more: 'error' }); assert.equal(h.requests.length, 2); h.unmount()
})
test('rapid repeated activation issues one request until completion', async () => {
  const h = harness(); await h.respond(0, page(0, 20))
  for (let i = 0; i < 10; i++) h.more()
  assert.equal(h.requests.length, 2)
  await h.respond(1, page(20, 40)); assert.equal(h.state.interviews.length, 40); h.unmount()
})
for (const total of [0, 20, 40]) test(`${total} terminal rows: null continuation and no extra empty request`, async () => {
  const h = harness(); await h.respond(0, page(0, Math.min(20, total), total > 20))
  if (total > 20) { h.more(); await h.respond(1, page(20, 40, false)) }
  const count = h.requests.length; assert.equal(h.state.nextCursor, null)
  h.more(); await tick(); assert.equal(h.requests.length, count); assert.equal(h.state.interviews.length, total); h.unmount()
})
test('unmount aborts fetch and late response cannot update disposed instance', async () => {
  const h = harness(), before = h.updates; h.unmount()
  assert.equal(h.requests[0].options.signal.aborted, true)
  await h.respond(0, page(0, 20)); assert.equal(h.updates, before)
})
test('late JSON completion after unmount cannot update state', async () => {
  const h = harness(), body = deferred()
  h.requests[0].resolve({ status: 200, ok: true, json: () => body.promise }); await tick()
  h.unmount(); const before = h.updates; body.resolve(page(0, 20)); await tick()
  assert.equal(h.updates, before)
})
test('401 clears loaded history, navigates to login and blocks subsequent requests', async () => {
  const h = harness(); await h.respond(0, page(0, 20)); h.more(); await h.respond(1, {}, 401)
  assert.deepEqual(h.state, { status: 'loading', interviews: [], nextCursor: null, more: 'idle' })
  assert.deepEqual(h.navigation, ['/login']); h.more(); h.retry(); assert.equal(h.requests.length, 2); h.unmount()
})
