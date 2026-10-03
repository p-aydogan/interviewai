// Test-only fixtures and isolated loader. No real auth, database or network imports.
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')
const root = path.resolve(__dirname, '../..')
const plain = value => JSON.parse(JSON.stringify(value))
function load(file, imports, globals = {}) {
  const source = fs.readFileSync(path.join(root, file), 'utf8')
  const compiled = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020,
  } }).outputText
  const scope = { exports: {}, Buffer, ...globals, require(name) {
    assert.ok(Object.hasOwn(imports, name), `Unapproved test import: ${name}`)
    return imports[name]
  } }
  vm.runInNewContext(compiled, scope, { filename: file })
  return scope.exports
}
const uuid = n => `00000000-0000-4000-8000-${n.toString(16).padStart(12, '0')}`
const OWNER_A = uuid(10001), OWNER_B = uuid(10002)
const FIXTURE = Object.freeze(Array.from({ length: 41 }, (_, i) => Object.freeze({
  id: uuid((41 - i) * 2), owner_id: OWNER_A, role: 'Synthetic Engineer', company: 'Fixture Company',
  level: 'mid', interview_type: 'technical', language: 'en', score: 80, duration_seconds: 60,
  created_at: `2026-10-01T12:00:${String(41 - i).padStart(2, '0')}.123456Z`,
})))
function fixture(mode = 'normal', owner = OWNER_A) {
  return FIXTURE.map((row, i) => ({ ...row, owner_id: owner,
    id: owner === OWNER_A ? row.id : uuid((41 - i) * 2 + 1),
    created_at: mode === 'equal' ? '2026-10-01T12:00:00.123456Z' : mode === 'micro'
      ? `2026-10-01T12:00:00.${String(123499 - i)}Z` : row.created_at,
  }))
}
const item = row => ({ id: row.id, role: row.role, company: row.company, level: row.level,
  interviewType: row.interview_type, language: row.language, score: row.score,
  durationSeconds: row.duration_seconds, createdAt: row.created_at })
const cursor = load('lib/interviews/history-cursor.ts', { 'server-only': {} })
const token = row => cursor.encodeHistoryCursor(row.created_at, row.id)
module.exports = { load, plain, uuid, OWNER_A, OWNER_B, FIXTURE, fixture, item, cursor, token }
