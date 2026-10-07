const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')
const { load, plain } = require('./history-test-helpers.cjs')
const input = load('lib/interviews/interview-setup-input.ts', {})
const valid = () => ({ iv: 'f', level: 'mid', itype: 'behavioral', persona: 'formal', language: 'en' })

function pageHarness(authenticated = true, file = 'app/interview/page.tsx') {
  const events = [], rendered = [], activities = { claude: 0, tts: 0, camera: 0, persistence: 0 }
  function Live(props) {
    // A mount-capable boundary: executing it would start all four kinds of activity.
    for (const key of Object.keys(activities)) activities[key]++
    return props
  }
  const imports = {
    'react/jsx-runtime': { jsx(type, props, key) { rendered.push({ type, props, key }); return { type, props, key } } },
    'next/navigation': { redirect(route) { events.push(['redirect', route]); throw Object.assign(Error('redirect'), { route }) } },
    '@/components/interview/LiveInterviewClient': { default: Live },
    '@/components/interview/InterviewSetupForm': { default: 'SetupForm' },
    '@/styles/talentry-interview-setup.css': {},
    '@/lib/auth/auth-constants': { AUTH_ROUTES: { login: '/login' } },
    '@/lib/auth/get-authenticated-user': { async getAuthenticatedUser() { events.push(['auth']); return { status: authenticated ? 'authenticated' : 'unauthorized' } } },
    '@/lib/interviews/interview-setup-input': { ...input, parseInterviewSetupInput(params) { events.push(['parse']); return input.parseInterviewSetupInput(params) } },
  }
  const source = fs.readFileSync(path.join(__dirname, '../..', file), 'utf8')
  const compiled = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX,
  } }).outputText
  const scope = { exports: {}, require(name) { assert.ok(Object.hasOwn(imports, name), name); return imports[name] } }
  vm.runInNewContext(compiled, scope)
  return { events, rendered, activities, async run(params) {
    try { return { tree: await scope.exports.default({ searchParams: params }) } }
    catch (error) { if (error.route) return { redirect: error.route }; throw error }
  } }
}
async function rejected(params, authenticated = true) {
  const h = pageHarness(authenticated), result = await h.run(params)
  assert.equal(result.redirect, authenticated ? '/interview/setup' : '/login')
  assert.equal(h.rendered.length, 0, 'Live boundary must not even be rendered')
  assert.deepEqual(h.activities, { claude: 0, tts: 0, camera: 0, persistence: 0 })
  assert.equal(h.events[0][0], 'auth')
  return h
}
test('signed-out direct route redirects before parsing or Live rendering', async () => {
  assert.deepEqual((await rejected({}, false)).events, [['auth'], ['redirect', '/login']])
})
test('signed-out fully valid query still cannot mount Live', async () => { await rejected(valid(), false) })
test('signed-in no params redirects to Setup', async () => { await rejected({}) })
test('signed-in partial required config redirects to Setup', async () => { await rejected({ iv: 'f' }) })
for (const key of ['iv', 'level', 'itype', 'persona', 'language']) {
  for (const value of ['garbage', '', undefined, 'constructor', '__proto__']) {
    test(`malformed ${key} ${String(value)} has zero activity`, async () => { await rejected({ ...valid(), [key]: value }) })
  }
}
for (const key of ['iv', 'role', 'company', 'level', 'itype', 'persona', 'language']) {
  test(`duplicate ${key} cannot mount Live`, async () => { await rejected({ ...valid(), [key]: ['same', 'same'] }) })
}
for (const key of ['role', 'company']) {
  for (const value of ['😀'.repeat(201), 'A\nB', 'A\u0080B']) {
    test(`invalid text ${key} cannot mount Live`, async () => { await rejected({ ...valid(), [key]: value }) })
  }
}
test('authenticated fully valid bookmark renders Live once with normalized config, never login', async () => {
  const h = pageHarness(), result = await h.run({ ...valid(), role: ' Çağrı 😀 ', company: ' Example ' })
  assert.equal(result.redirect, undefined)
  assert.equal(h.rendered.length, 1)
  assert.deepEqual(h.events, [['auth'], ['parse']])
  assert.deepEqual(plain(result.tree.props.config), { interviewerKey: 'f', role: 'Çağrı 😀', company: 'Example',
    level: 'mid', interviewType: 'behavioral', persona: 'formal', language: 'en' })
  assert.equal(result.tree.key, input.interviewSetupKey(result.tree.props.config))
  result.tree.type(result.tree.props)
  assert.deepEqual(h.activities, { claude: 1, tts: 1, camera: 1, persistence: 1 }, 'mock mount is activity capable')
})
test('empty optional text and ignored extras remain valid', async () => {
  const h = pageHarness(), { tree } = await h.run({ ...valid(), role: '', company: '  ', cv: ['x', 'y'], extra: 'ignored' })
  assert.equal(tree.props.config.role, 'Genel'); assert.equal(tree.props.config.company, 'Genel')
  assert.equal(h.rendered.length, 1)
})
test('wrapper key changes for new config and is stable for equivalent normalized query', async () => {
  const h = pageHarness()
  const a = (await h.run(valid())).tree, b = (await h.run({ ...valid(), role: 'Engineer' })).tree
  const c = (await h.run({ ...valid(), role: ' Engineer ', extra: 'ignored' })).tree
  assert.notEqual(a.key, b.key); assert.equal(b.key, c.key)
})
test('authenticated Setup server page remains directly usable', async () => {
  const h = pageHarness(true, 'app/interview/setup/page.tsx'), { tree } = await h.run({})
  assert.equal(tree.type, 'SetupForm'); assert.deepEqual(h.events, [['auth']])
  assert.equal(h.rendered.length, 1)
})
