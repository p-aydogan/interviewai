const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')
const { load, plain } = require('../../lib/interviews/history-test-helpers.cjs')
const input = load('lib/interviews/interview-setup-input.ts', {})
const config = load('components/interview/interview-setup-config.ts', {})

function harness({ mobile = false, language = 'tr' } = {}) {
  const states = [], effects = [], routes = []
  let cursor = 0, mounting = true, tree
  const jsx = (type, props, key) => ({ type, props: { ...props, key } })
  const imports = {
    'react/jsx-runtime': { jsx, jsxs: jsx },
    react: { useState(value) { const i = cursor++; if (mounting) states[i] = value
      return [states[i], next => { states[i] = typeof next === 'function' ? next(states[i]) : next }] },
    useEffect(effect) { cursor++; if (mounting) effects.push(effect) } },
    'next/link': { default: 'Link' },
    'next/navigation': { useRouter: () => ({ push: route => routes.push(route) }) },
    '@/components/ui': { SectionHeader: 'SectionHeader', TalentryButton: 'Button', TalentryCard: 'Card' },
    '@/lib/auth/auth-constants': { AUTH_ROUTES: { dashboard: '/dashboard' }, DEFAULT_APP_LANGUAGE: 'tr', SUPPORTED_APP_LANGUAGES: ['tr', 'en', 'de'] },
    '@/lib/interviews/interview-setup-input': input,
    './InterviewSetupMobile': { default: 'Mobile' },
    './interview-setup-config': config,
  }
  const source = fs.readFileSync(path.join(__dirname, 'InterviewSetupForm.tsx'), 'utf8')
  const compiled = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX,
  } }).outputText
  const scope = { exports: {}, URLSearchParams, window: {
    matchMedia: () => ({ matches: mobile, addEventListener() {}, removeEventListener() {} }),
    localStorage: { getItem: () => language, setItem() {} },
  }, require(name) { assert.ok(Object.hasOwn(imports, name), name); return imports[name] } }
  vm.runInNewContext(compiled, scope)
  function render() { cursor = 0; tree = scope.exports.default(); mounting = false; return tree }
  function all(predicate, node = tree) {
    if (!node || typeof node !== 'object') return []
    if (Array.isArray(node)) return node.flatMap(child => all(predicate, child))
    return [...(predicate(node) ? [node] : []), ...all(predicate, node.props?.children ?? null)]
  }
  render(); effects.forEach(effect => effect()); render()
  return { routes, render, all,
    change(key, value) {
      if (mobile) all(node => node.type === 'Mobile')[0].props.changes[key](value)
      else {
        const id = { role: 'role', company: 'company', level: 'level', interviewType: 'type', persona: 'persona', interviewLanguage: 'language' }[key]
        if (key === 'interviewer') all(node => node.props?.id === `setup-interviewer-${value}`)[0].props.onChange()
        else all(node => node.props?.id === `setup-${id}`)[0].props.onChange({ target: { value } })
      }
      render()
    },
    submit() { all(node => node.type === 'form')[0].props.onSubmit({ preventDefault() {} }); render() },
    parsed() {
      const params = new URL(routes.at(-1), 'https://fixture.invalid').searchParams
      return { params, config: input.parseInterviewSetupInput(Object.fromEntries(params)) }
    },
  }
}
for (const mobile of [false, true]) {
  const mode = mobile ? 'mobile' : 'desktop'
  test(`${mode} valid optional blank Setup goes directly to parser-valid Live URL`, () => {
    const h = harness({ mobile }); h.submit()
    assert.equal(h.routes.length, 1); assert.ok(h.routes[0].startsWith('/interview?'))
    assert.equal(h.parsed().config.role, 'Genel'); assert.equal(h.parsed().config.company, 'Genel')
    assert.equal(h.parsed().params.get('cv'), '')
    assert.equal(h.routes.some(route => route === '/login'), false)
  })
  test(`${mode} trims optional role/company and preserves Unicode`, () => {
    const h = harness({ mobile }); h.change('role', ' Çağrı Développeur 日本語 😀 '); h.change('company', ' Example + Co '); h.submit()
    assert.equal(h.parsed().config.role, 'Çağrı Développeur 日本語 😀')
    assert.equal(h.parsed().config.company, 'Example + Co')
  })
  test(`${mode} whitespace optional values remain accepted`, () => {
    const h = harness({ mobile }); h.change('role', '   '); h.change('company', '\u2003'); h.submit()
    assert.equal(h.parsed().config.role, 'Genel'); assert.equal(h.parsed().config.company, 'Genel')
  })
  for (const key of ['role', 'company']) {
    test(`${mode} ${key} accepts 200 emoji code points`, () => {
      const h = harness({ mobile }); h.change(key, '😀'.repeat(200)); h.submit()
      assert.equal(h.parsed().config[key], '😀'.repeat(200))
    })
    for (const value of ['😀'.repeat(201), ' '.repeat(201), ' A\nB ', 'A\u0080B']) {
      test(`${mode} invalid ${key} prevents navigation and exposes associated alert`, () => {
        const h = harness({ mobile }); h.change(key, value); h.submit()
        assert.equal(h.routes.length, 0)
        const alert = h.all(node => node.props?.role === 'alert')[0]
        assert.equal(alert.props.id, 'setup-validation-error'); assert.ok(alert.props.children)
        assert.equal(h.all(node => node.type === 'form')[0].props['aria-describedby'], alert.props.id)
      })
    }
  }
  test(`${mode} correcting invalid input permits navigation and clears error`, () => {
    const h = harness({ mobile }); h.change('role', 'A\nB'); h.submit(); h.change('role', 'Engineer'); h.submit()
    assert.equal(h.routes.length, 1); assert.equal(h.all(node => node.props?.role === 'alert').length, 0)
  })
  for (const [key, values] of Object.entries({ interviewer: ['f', 'm'], level: ['junior', 'mid', 'senior'],
    interviewType: ['behavioral', 'technical', 'mixed', 'case'], persona: ['friendly', 'formal', 'tough', 'curious'],
    interviewLanguage: ['tr', 'en', 'de'] })) {
    test(`${mode} canonical ${key} options generate parser-valid URLs`, () => {
      for (const value of values) { const h = harness({ mobile }); h.change(key, value); h.submit(); assert.ok(h.parsed().config) }
    })
  }
}
for (const language of ['tr', 'en', 'de']) test(`${language} uses localized validation feedback without changing interview language`, () => {
  const h = harness({ language }); h.change('role', '\u0000'); h.submit()
  assert.equal(h.all(node => node.props?.role === 'alert')[0].props.children, config.COPY[language].validationError)
  assert.equal(h.all(node => node.type === 'main')[0].props.lang, language)
  h.change('role', 'Engineer'); h.submit(); assert.equal(h.parsed().config.language, 'tr')
})
