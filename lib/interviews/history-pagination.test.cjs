const { test } = require('node:test')
const assert = require('node:assert/strict')
const { NextRequest, NextResponse } = require('next/server')
const { load, fixture, item, cursor, token, uuid, OWNER_A, OWNER_B } = require('./history-test-helpers.cjs')
// Fixtures use canonical fixed-width UTC timestamps: string comparison retains microseconds.
// This double interprets the actual emitted query; it is not a PostgreSQL integration test.
function harness(rows, owner = OWNER_A) {
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
for (const total of [0, 1, 19, 20, 21, 40, 41]) test(`${total} records: exact pages, order, cursors and terminal state`, async () => {
  const expected = fixture().slice(0, total)
  assert.deepEqual(await traverse(harness([...expected].reverse()), expected),
    total === 0 ? [0] : Array.from({ length: Math.ceil(total / 20) }, (_, i) => Math.min(20, total - i * 20)))
})
for (const mode of ['equal', 'micro']) test(`${mode}: 41 rows retain tie order and exact precision`, async () => {
  const rows = fixture(mode)
  assert.deepEqual(await traverse(harness([...rows].reverse()), rows), [20, 20, 1])
  assert.equal(cursor.decodeHistoryCursor(token(rows[19])).createdAt, rows[19].created_at)
})
test('interleaved owners remain isolated across all continuation pages', async () => {
  const a = fixture('equal'), b = fixture('equal', OWNER_B)
  await traverse(harness(a.flatMap((row, i) => [b[i], row])), a)
})
test('foreign and nonexistent valid anchors are positions, never owner selectors', async () => {
  const a = fixture('equal'), b = fixture('equal', OWNER_B), rows = [...a, ...b]
  for (const anchor of [b[19], { ...a[19], id: uuid(1000) }]) {
    await traverse(harness(rows), a.filter(row => row.id < anchor.id), token(anchor))
  }
})
for (const query of ['cursor=!', 'cursor=', 'cursor=a&cursor=b', 'limit=0', 'limit=101',
  'limit=-1', 'limit=1.5', 'limit=', 'limit=20&limit=20']) test(`invalid query: ${query}`, async () => {
  const h = harness(fixture()), response = await h.request(query)
  assert.equal(response.status, 400); assert.equal(h.calls.length, 0)
})
test('authentication precedes malformed input and privileged access', async () => {
  const h = harness(fixture(), null), response = await h.request('cursor=!&limit=0')
  assert.equal(response.status, 401); assert.equal(h.calls.length, 0)
})
for (const side of ['ahead', 'behind']) test(`new insert ${side} of cursor follows live keyset semantics`, async () => {
  const rows = fixture(), h = harness(rows), first = await h.page()
  const inserted = { ...rows[0], id: uuid(999), created_at: side === 'ahead'
    ? '2026-10-01T12:01:00.123456Z' : '2026-10-01T12:00:21.500000Z' }
  rows.push(inserted)
  const expected = side === 'ahead' ? rows.slice(20, 41) : [inserted, ...rows.slice(20, 41)]
  await traverse(h, expected, first.nextCursor)
  assert.equal(first.interviews.some(row => row.id === inserted.id), false)
  if (side === 'ahead') assert.equal((await h.page()).interviews[0].id, inserted.id)
})
test('equal timestamp insert uses UUID to choose the cursor side', async () => {
  const rows = fixture('equal'), h = harness(rows), first = await h.page()
  const ahead = { ...rows[0], id: uuid(45) }, behind = { ...rows[0], id: uuid(43) }
  rows.push(ahead, behind)
  await traverse(h, [behind, ...rows.slice(20, 41)], first.nextCursor)
  assert.ok((await h.page()).interviews.some(row => row.id === ahead.id))
})
