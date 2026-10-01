const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')
const { NextResponse } = require('next/server')
const root = path.resolve(__dirname, '../..')
const id = '11111111-1111-4111-8111-111111111111'
const row = { id, owner_id: 'owner-a', interviewer_key: 'internal-key', role: 'Developer', company: 'Example',
  level: 'senior', interview_type: 'technical', persona: 'formal', language: 'tr',
  answers: [{ q: 'Question', a: 'Answer' }], score: 81, summary: 'Saved summary', duration_seconds: 123,
  created_at: '2026-10-01T10:20:30Z' }
const expected = { id, interviewerKey: row.interviewer_key, role: row.role, company: row.company,
  level: row.level, interviewType: row.interview_type, persona: row.persona, language: row.language,
  answers: row.answers, score: row.score, summary: row.summary, durationSeconds: row.duration_seconds, createdAt: row.created_at }

function load(file, imports) {
  const source = fs.readFileSync(path.join(root, file), 'utf8')
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText
  const scope = { exports: {}, console: { error() {} }, require(name) {
    assert.ok(Object.hasOwn(imports, name), `Unexpected import ${name}`)
    return imports[name]
  } }
  vm.runInNewContext(compiled, scope, { filename: file })
  return scope.exports
}
function harness({ user = 'owner-a', data = row, error = null } = {}) {
  const calls = [], filters = []
  const query = {
    select(columns) { calls.push(['select', columns]); return this },
    eq(key, value) { filters.push([key, value]); return this },
    async maybeSingle() {
      calls.push(['maybeSingle'])
      return { error, data: data && filters.every(([key, value]) => data[key] === value) ? data : null }
    },
  }
  const reader = load('lib/interviews/read-owned-interview.ts', {
    'server-only': {},
    '@/lib/auth/get-authenticated-user': { async getAuthenticatedUser() {
      calls.push(['auth']); return user ? { status: 'authenticated', user: { id: user } } : { status: 'unauthorized' }
    } },
    '@/lib/supabase/admin': { createAdminClient() {
      calls.push(['admin']); return { from(table) { calls.push(['from', table]); return query } }
    } },
  })
  const route = load('app/api/interviews/[id]/route.ts', {
    'next/server': { NextResponse }, '@/lib/interviews/read-owned-interview': reader,
  })
  return { ...reader, ...route, calls, filters }
}

test('unauthenticated wins over malformed ID without privileged access', async () => {
  const h = harness({ user: null })
  assert.equal((await h.readOwnedInterview('bad')).status, 'unauthorized')
  assert.deepEqual(h.calls, [['auth']])
})
test('authenticated malformed UUID is rejected before admin access', async () => {
  const h = harness()
  assert.equal((await h.readOwnedInterview('bad')).status, 'invalidId')
  assert.deepEqual(h.calls, [['auth']])
})
test('correct owner: exact selection, both filters, maybeSingle and public mapping', async () => {
  const h = harness(), result = await h.readOwnedInterview(id)
  assert.equal(result.status, 'ready')
  assert.deepEqual(JSON.parse(JSON.stringify(result.interview)), expected)
  assert.deepEqual(h.filters, [['id', id], ['owner_id', 'owner-a']])
  assert.deepEqual(h.calls, [['auth'], ['admin'], ['from', 'interviews'], ['select',
    'id, interviewer_key, role, company, level, interview_type, persona, language, answers, score, summary, duration_seconds, created_at'], ['maybeSingle']])
  assert.equal('owner_id' in result.interview, false)
})
test('wrong owner and missing record have identical outcomes', async () => {
  const wrong = await harness({ user: 'owner-b' }).readOwnedInterview(id)
  const missing = await harness({ data: null }).readOwnedInterview(id)
  assert.equal(wrong.status, 'notFound'); assert.equal(missing.status, wrong.status)
})
test('malformed answers and handled database error fail closed', async () => {
  for (const answers of [null, {}, [{ q: 'Q', a: 1 }], [null]]) {
    assert.equal((await harness({ data: { ...row, answers } }).readOwnedInterview(id)).status, 'readError')
  }
  assert.equal((await harness({ error: { message: 'private error' } }).readOwnedInterview(id)).status, 'readError')
})
test('empty historical arrays and summary preserve the existing contract', async () => {
  const result = await harness({ data: { ...row, answers: [], summary: '' } }).readOwnedInterview(id)
  assert.equal(result.status, 'ready'); assert.equal(result.interview.summary, '')
})
test('existing UUID regex semantics remain unchanged (case accepted, no trimming)', async () => {
  const uppercase = 'AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA'
  assert.equal((await harness({ data: { ...row, id: uppercase } }).readOwnedInterview(uppercase)).status, 'ready')
  assert.equal((await harness().readOwnedInterview(` ${id}`)).status, 'invalidId')
})
test('detail route preserves every status/body and adds no cache/disposition headers', async () => {
  const cases = [
    [{ user: null }, 'bad', 401, { error: 'Unauthorized' }],
    [{}, 'bad', 400, { error: 'Invalid interview id' }],
    [{ user: 'owner-b' }, id, 404, { error: 'Interview not found' }],
    [{ data: null }, id, 404, { error: 'Interview not found' }],
    [{ error: {} }, id, 500, { error: 'Failed to load interview' }],
    [{}, id, 200, { interview: expected }],
  ]
  for (const [options, requestedId, status, body] of cases) {
    const response = await harness(options).GET(new Request(`https://example.test/api/interviews/${requestedId}?ownerId=owner-a`), { params: { id: requestedId } })
    assert.equal(response.status, status); assert.deepEqual(await response.json(), body)
    assert.equal(response.headers.get('Cache-Control'), null)
    assert.equal(response.headers.get('Content-Disposition'), null)
  }
})
