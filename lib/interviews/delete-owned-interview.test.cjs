const { test } = require('node:test')
const assert = require('node:assert/strict')
const { NextResponse } = require('next/server')
const { load, plain, fixture, OWNER_A, OWNER_B } = require('./history-test-helpers.cjs')
const id = fixture()[0].id
function harness({ owner = OWNER_A, rows = [{ id, owner_id: OWNER_A }], error = null, thrown = false } = {}) {
  const calls = []
  const helper = load('lib/interviews/delete-owned-interview.ts', {
    'server-only': {},
    '@/lib/auth/get-authenticated-user': { async getAuthenticatedUser() {
      calls.push(['auth']); return owner ? { status: 'authenticated', user: { id: owner } } : { status: 'unauthorized' }
    } },
    '@/lib/supabase/admin': { createAdminClient() {
      if (thrown) throw new Error('Private provider failure')
      calls.push(['admin'])
      return { from(table) {
        calls.push(['from', table]); const filters = []
        return {
          delete() { calls.push(['delete']); return this },
          eq(key, value) { filters.push([key, value]); calls.push(['eq', key, value]); return this },
          select(columns) { calls.push(['select', columns]); return this },
          async maybeSingle() {
            calls.push(['maybeSingle'])
            const index = rows.findIndex(row => filters.every(([key, value]) => row[key] === value))
            return { error, data: !error && index >= 0 ? { id: rows.splice(index, 1)[0].id } : null }
          },
        }
      } }
    } },
  })
  const route = load('app/api/interviews/[id]/route.ts', {
    'next/server': { NextResponse }, '@/lib/interviews/delete-owned-interview': helper,
    '@/lib/interviews/read-owned-interview': { readOwnedInterview: async () => ({ status: 'notFound' }) },
  })
  return { ...helper, ...route, calls, rows }
}
test('unauthenticated wins over malformed ID and never accesses admin', async () => {
  const h = harness({ owner: null }); assert.equal((await h.deleteOwnedInterview('bad')).status, 'unauthorized')
  assert.deepEqual(h.calls, [['auth']])
})
test('authenticated malformed UUID never accesses admin', async () => {
  const h = harness(); assert.equal((await h.deleteOwnedInterview('bad')).status, 'invalidId')
  assert.deepEqual(h.calls, [['auth']])
})
test('single delete uses exact owner and ID predicates and only ID evidence', async () => {
  const h = harness(); assert.equal((await h.deleteOwnedInterview(id, OWNER_B)).status, 'deleted')
  assert.deepEqual(h.calls, [['auth'], ['admin'], ['from', 'interviews'], ['delete'],
    ['eq', 'id', id], ['eq', 'owner_id', OWNER_A], ['select', 'id'], ['maybeSingle']])
})
for (const [name, options] of [['wrong owner', { owner: OWNER_B }], ['nonexistent', { rows: [] }]]) {
  test(name + ' returns notFound and preserves other records', async () => {
    const h = harness(options), before = plain(h.rows)
    assert.equal((await h.deleteOwnedInterview(id)).status, 'notFound'); assert.deepEqual(h.rows, before)
  })
}
test('repeated delete has no row evidence and returns notFound', async () => {
  const h = harness(); assert.equal((await h.deleteOwnedInterview(id)).status, 'deleted')
  assert.equal((await h.deleteOwnedInterview(id)).status, 'notFound')
})
test('database error and thrown client failure are generic deleteError', async () => {
  for (const options of [{ error: { message: 'Private' } }, { thrown: true }]) {
    assert.equal((await harness(options).deleteOwnedInterview(id)).status, 'deleteError')
  }
})
test('invalid returned row cannot establish success', async () => {
  const helper = load('lib/interviews/delete-owned-interview.ts', {
    'server-only': {}, '@/lib/auth/get-authenticated-user': { getAuthenticatedUser: async () => ({ status: 'authenticated', user: { id: OWNER_A } }) },
    '@/lib/supabase/admin': { createAdminClient: () => ({ from: () => ({ delete() { return this }, eq() { return this }, select() { return this }, maybeSingle: async () => ({ data: {}, error: null }) }) }) },
  })
  assert.equal((await helper.deleteOwnedInterview(id)).status, 'deleteError')
})
test('DELETE contract maps every result, ignores request ownership, and sets no-store', async () => {
  const cases = [[{}, id, 200, { deleted: true }], [{ owner: null }, 'bad', 401, { error: 'Unauthorized' }],
    [{}, 'bad', 400, { error: 'Invalid interview id' }], [{ rows: [] }, id, 404, { error: 'Interview not found' }],
    [{ owner: OWNER_B }, id, 404, { error: 'Interview not found' }], [{ thrown: true }, id, 500, { error: 'Failed to delete interview' }]]
  for (const [options, requested, status, body] of cases) {
    const h = harness(options)
    const response = await h.DELETE({ json() { throw new Error('Must not consume body') }, url: '?owner_id=spoof' }, { params: { id: requested } })
    assert.equal(response.status, status); assert.deepEqual(await response.json(), body)
    assert.equal(response.headers.get('Cache-Control'), 'private, no-store')
  }
})
test('unexpected route exception returns generic no-store 500', async () => {
  const route = load('app/api/interviews/[id]/route.ts', {
    'next/server': { NextResponse }, '@/lib/interviews/read-owned-interview': {},
    '@/lib/interviews/delete-owned-interview': { deleteOwnedInterview() { throw new Error('Private') } },
  })
  const response = await route.DELETE({}, { params: { id } })
  assert.equal(response.status, 500); assert.deepEqual(await response.json(), { error: 'Failed to delete interview' })
  assert.equal(response.headers.get('Cache-Control'), 'private, no-store')
})
const { NextRequest } = require('next/server')
const { item, cursor, token } = require('./history-test-helpers.cjs')
function paginationHarness(rows, owner = OWNER_A) {
  const calls = []
  const route = load('app/api/interviews/route.ts', {
    'next/server': { NextResponse }, '@/lib/interviews/history-cursor': cursor,
    '@/lib/auth/get-authenticated-user': { async getAuthenticatedUser() {
      return owner ? { status: 'authenticated', user: { id: owner } } : { status: 'unauthorized' }
    } },
    '@/lib/supabase/admin': { createAdminClient() { return { from(table) {
      assert.equal(table, 'interviews')
      const call = { filters: [], orders: [] }; calls.push(call)
      return {
        select(columns) { call.columns = columns; return this },
        eq(key, value) { call.filters.push([key, value]); return this },
        order(key, options) { call.orders.push([key, options.ascending]); return this },
        or(expression) { call.expression = expression; return this },
        limit(count) { call.limit = count; return this },
        then(resolve, reject) {
          return Promise.resolve().then(() => {
            let selected = rows.filter(row => call.filters.every(([key, value]) => row[key] === value))
            if (call.expression) {
              const match = /^created_at\.lt\.([^,]+),and\(created_at\.eq\.([^,]+),id\.lt\.([^)]+)\)$/.exec(call.expression)
              assert.ok(match, 'Expected grouped timestamp/UUID continuation')
              assert.equal(match[1], match[2])
              selected = selected.filter(row => row.created_at < match[1] ||
                (row.created_at === match[2] && row.id < match[3]))
            }
            selected.sort((a, b) => {
              for (const [key, ascending] of call.orders) {
                if (a[key] !== b[key]) return (a[key] < b[key] ? -1 : 1) * (ascending ? 1 : -1)
              }
              return 0
            })
            if (call.limit !== undefined) selected = selected.slice(0, call.limit)
            return { data: selected, error: null }
          }).then(resolve, reject)
        },
      }
    } } } },
  })
  return { calls, async request(query = 'limit=20') {
    return route.GET(new NextRequest(`https://example.test/api/interviews?${query}`))
  }, async page(position) {
    const response = await this.request('limit=20' + (position ? `&cursor=${position}` : ''))
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('Cache-Control'), 'private, no-store')
    return response.json()
  } }
}
async function traverse(h, expected, start = null) {
  const seen = [], sizes = []; let position = start
  do {
    assert.ok(sizes.length < 5, 'Traversal must terminate')
    const page = await h.page(position); sizes.push(page.interviews.length); seen.push(...page.interviews)
    const call = h.calls.at(-1)
    assert.equal(call.limit, 21)
    assert.deepEqual(call.orders, [['created_at', false], ['id', false]])
    assert.deepEqual(call.filters, [['owner_id', OWNER_A]])
    assert.equal(call.columns, 'id, role, company, level, interview_type, language, score, duration_seconds, created_at')
    if (seen.length < expected.length) {
      assert.equal(page.nextCursor, token(expected[seen.length - 1]), 'Cursor uses last returned row')
      assert.notEqual(page.nextCursor, token(expected[seen.length]), 'Never use lookahead row')
    } else assert.equal(page.nextCursor, null)
    position = page.nextCursor
  } while (position)
  assert.deepEqual(seen, expected.map(item))
  assert.equal(new Set(seen.map(row => row.id)).size, expected.length)
  for (let i = 1; i < seen.length; i++) assert.ok(seen[i - 1].createdAt > seen[i].createdAt ||
    (seen[i - 1].createdAt === seen[i].createdAt && seen[i - 1].id > seen[i].id))
  return sizes
}
for (const count of [21, 41]) test('fresh pagination after actual helper deletion: ' + count, async () => {
  const rows = fixture().slice(0, count), boundaryId = rows[19].id
  const h = harness({ rows }); assert.equal((await h.deleteOwnedInterview(boundaryId)).status, 'deleted')
  assert.deepEqual(await traverse(paginationHarness(rows), rows), count === 21 ? [20] : [20, 20])
})
test('deleted prior cursor boundary preserves continuation and fresh traversal', async () => {
  const rows = fixture(), p = paginationHarness(rows), first = await p.page()
  const boundaryId = rows[19].id
  assert.equal((await harness({ rows }).deleteOwnedInterview(boundaryId)).status, 'deleted')
  const rest = await p.page(first.nextCursor)
  assert.deepEqual(rest.interviews, rows.slice(19, 39).map(item))
  assert.deepEqual(await traverse(paginationHarness(rows), rows), [20, 20])
})
