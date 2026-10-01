// Uses the real renderer. Set REPORT_PDF_PYTHON to an existing Python with pypdf;
// no parser or test package is installed. No browser, credentials, DB or network.
const { test, before } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const { spawnSync } = require('node:child_process')
const ts = require('typescript')
const { NextResponse } = require('next/server')
const root = path.resolve(__dirname, '../..')
let render, filename
const id = '11111111-1111-4111-8111-111111111111'
const fixture = Object.freeze({ id, owner_id: 'SECRET_OWNER_UUID', interviewerKey: 'SECRET_INTERVIEWER_KEY',
  role: 'Persisted Engineer', company: 'Saved Company', level: 'senior', interviewType: 'technical',
  persona: 'formal', language: 'tr', score: 83, summary: 'Persisted assessment marker.',
  durationSeconds: 125, createdAt: '2026-10-01T12:34:56+03:00',
  answers: Object.freeze([{ q: 'FIRST_QUESTION', a: 'FIRST_ANSWER' }, { q: 'SECOND_QUESTION', a: 'SECOND_ANSWER' }].map(Object.freeze)) })

function loader(overrides = {}) {
  const cache = new Map()
  function load(file) {
    if (cache.has(file)) return cache.get(file)
    const compiled = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: {
      module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
    } }).outputText
    const scope = { exports: {}, Buffer, URL, Response, process, Uint8Array,
      require(name) {
        if (Object.hasOwn(overrides, name)) return overrides[name]
        if (name === 'server-only') return {}
        if (name === 'next/server') return { NextResponse }
        if (name.startsWith('@/') || name.startsWith('.')) {
          const base = name.startsWith('@/') ? path.join(root, name.slice(2)) : path.resolve(path.dirname(file), name)
          const target = ['.ts', '.tsx'].map(ext => base + ext).find(fs.existsSync)
          assert.ok(target, `Unresolved module ${name}`)
          assert.ok(!target.includes(`${path.sep}supabase${path.sep}`), 'No real database imports allowed')
          return load(target)
        }
        assert.ok(['jspdf', 'node:fs', 'node:path'].includes(name), `Unexpected dependency ${name}`)
        return require(name)
      },
    }
    vm.runInNewContext(compiled, scope, { filename: file })
    cache.set(file, scope.exports)
    return scope.exports
  }
  return file => load(path.join(root, file))
}
before(async () => {
  const module = loader()('lib/reports/render-interview-report.ts')
  render = module.renderInterviewReport; filename = module.reportFilename
})
function inspect(buffer) {
  const python = process.env.REPORT_PDF_PYTHON || 'python'
  const result = spawnSync(python, ['-I', '-B', path.join(__dirname, 'inspect-report-pdf.py')],
    { input: buffer, maxBuffer: 16 * 1024 * 1024 })
  assert.ifError(result.error)
  assert.equal(result.status, 0, result.stderr?.toString())
  const parsed = JSON.parse(result.stdout.toString())
  assert.deepEqual(parsed.mappingErrors, [], 'Every used CID must map to nonempty Unicode')
  return { pages: parsed.pages, text: parsed.pages.join('\n') }
}
const compact = value => value.replace(/\s+/g, '')
function route(result, customRender = render) {
  const calls = []
  const module = loader({
    '@/lib/interviews/read-owned-interview': { async readOwnedInterview(requestedId) { calls.push(requestedId); return result } },
    '@/lib/reports/render-interview-report': { renderInterviewReport: customRender, reportFilename: filename },
  })('app/api/interviews/[id]/pdf/route.ts')
  return { ...module, calls }
}
const request = suffix => new Request(`https://example.test/api/interviews/${id}/pdf${suffix}`)

test('real PDF opens, contains persisted score/summary/metadata and ordered complete Q&A', async () => {
  const bytes = await render(fixture, 'en')
  assert.equal(bytes.subarray(0, 5).toString(), '%PDF-')
  assert.match(bytes.subarray(-30).toString(), /%%EOF/)
  const { text, pages } = inspect(bytes)
  for (const value of ['Talentry', 'Interview Report', id, '83 / 100', fixture.summary, fixture.role,
    fixture.company, 'senior', 'technical', 'formal', 'tr', '2:05', '2026-10-01 09:34:56 UTC']) {
    assert.ok(compact(text).includes(compact(value)), `Missing persisted value: ${value}`)
  }
  const ordered = fixture.answers.flatMap(({ q, a }) => [q, a])
  let previous = -1
  for (const value of ordered) { const index = compact(text).indexOf(value); assert.ok(index > previous); previous = index }
  assert.ok(!text.includes(fixture.owner_id)); assert.ok(!text.includes(fixture.interviewerKey))
  pages.forEach((page, index) => assert.ok(compact(page).includes(`Page${index + 1}/${pages.length}`)))
  if (process.env.REPORT_PDF_QA_DIR) { fs.mkdirSync(process.env.REPORT_PDF_QA_DIR, { recursive: true }); fs.writeFileSync(path.join(process.env.REPORT_PDF_QA_DIR, 'report.pdf'), bytes) }
})
test('both static font weights preserve exact required glyphs through actual encoding', () => {
  const { jsPDF } = require('jspdf')
  const sample = 'ÇĞİÖŞÜ çğıöşü ÄÖÜ äöü ß ẞ'
  for (const [name, weight] of [['Inter-Regular.ttf', 400], ['Inter-SemiBold.ttf', 600]]) {
    const doc = new jsPDF({ putOnlyUsedFonts: true })
    doc.addFileToVFS(name, fs.readFileSync(path.join(root, 'assets/fonts', name)).toString('base64'))
    doc.addFont(name, 'Inter', 'normal', weight); doc.setFont('Inter', 'normal', weight)
    doc.text(sample, 15, 20)
    assert.equal(inspect(Buffer.from(doc.output('arraybuffer'))).text, sample)
  }
})

test('Turkish and German survive actual PDF encoding; labels do not translate stored values', async () => {
  const text = 'ÇĞİÖŞÜ çğıöşü ÄÖÜ äöü ß ẞ'
  for (const language of ['tr', 'de']) {
    const report = { ...fixture, summary: text, role: text, answers: [{ q: text, a: text }] }
    const bytes = await render(report, language)
    const decoded = inspect(bytes).text
    assert.ok(decoded.split('\n').includes(text), 'Exact Unicode line')
    const extracted = compact(decoded)
    assert.ok(extracted.includes(compact(text)))
    assert.ok(extracted.includes('senior')); assert.ok(extracted.includes('formal'))
    assert.ok(extracted.includes(language === 'tr' ? 'MülakatRaporu' : 'Interviewbericht'))
    if (process.env.REPORT_PDF_QA_DIR) fs.writeFileSync(path.join(process.env.REPORT_PDF_QA_DIR, `report-${language}.pdf`), bytes)
  }
})
test('long single answer and many answers span pages without truncating any marker', async () => {
  const paragraphs = Array.from({ length: 140 }, (_, i) => `PARAGRAPH_${String(i).padStart(3, '0')} Saved interview answer with Turkish ş and German ü.`)
  const answers = [{ q: 'LONG_QUESTION', a: paragraphs.join('\n') }, ...Array.from({ length: 12 }, (_, i) => ({ q: `QUESTION_${i}`, a: `ANSWER_${i}` }))]
  const bytes = await render({ ...fixture, answers }, 'en')
  const { text, pages } = inspect(bytes)
  assert.ok(pages.length >= 4)
  assert.deepEqual([...text.matchAll(/PARAGRAPH_(\d{3})/g)].map(match => match[1]), Array.from({ length: 140 }, (_, i) => String(i).padStart(3, '0')))
  pages.forEach((page, index) => assert.ok(compact(page).includes(`Page${index + 1}/${pages.length}`)))
  const extracted = compact(text)
  let position = -1
  for (const value of ['LONG_QUESTION', ...paragraphs, ...answers.slice(1).flatMap(({ q, a }) => [q, a])]) {
    const next = extracted.indexOf(compact(value), position + 1)
    assert.ok(next > position, `Truncated/reordered: ${value}`); position = next
  }
  if (process.env.REPORT_PDF_QA_DIR) fs.writeFileSync(path.join(process.env.REPORT_PDF_QA_DIR, 'report-long.pdf'), bytes)
})
test('empty historical fields use honest fallbacks', async () => {
  const { text } = inspect(await render({ ...fixture, role: '', company: '', summary: '', answers: [] }, 'en'))
  assert.ok(text.includes('Not provided')); assert.ok(text.includes('No assessment text'))
  assert.ok(text.includes('No questions and answers'))
})
test('repeated render preserves input and cannot call database or network providers', async () => {
  const snapshot = JSON.stringify(fixture), previousFetch = global.fetch
  global.fetch = () => { throw new Error('Unexpected network/provider call') }
  try {
    const first = inspect(await render(fixture, 'en')).text
    const second = inspect(await render(fixture, 'en')).text
    assert.equal(first, second); assert.equal(JSON.stringify(fixture), snapshot)
  } finally { global.fetch = previousFetch }
})
test('filename uses saved UTC date and rejects header-injection references', () => {
  assert.equal(filename(fixture), `interview-report_2026-10-01_${id}.pdf`)
  assert.throws(() => filename({ ...fixture, id: `${id}\r\nX-Evil: yes` }))
})
test('route returns real PDF, safe disposition, private/no-store, nosniff and Node runtime', async () => {
  const h = route({ status: 'ready', interview: fixture })
  assert.equal(h.runtime, 'nodejs'); assert.equal(h.dynamic, 'force-dynamic')
  const response = await h.GET(request('?language=en'), { params: { id } })
  assert.equal(response.status, 200); assert.equal(response.headers.get('Content-Type'), 'application/pdf')
  assert.equal(response.headers.get('Cache-Control'), 'private, no-store')
  assert.equal(response.headers.get('X-Content-Type-Options'), 'nosniff')
  assert.equal(response.headers.get('Content-Disposition'), `attachment; filename="interview-report_2026-10-01_${id}.pdf"`)
  assert.equal(Buffer.from(await response.arrayBuffer()).subarray(0, 5).toString(), '%PDF-')
  assert.deepEqual(h.calls, [id])
})
test('route derives labels from persisted language and ignores all legacy language queries', async () => {
  const sample = 'ÇĞİÖŞÜ çğıöşü ÄÖÜ äöü ß ẞ'
  for (const [language, title] of [['en', 'Interview Report'], ['tr', 'Mülakat Raporu'], ['de', 'Interviewbericht']]) {
    const interview = { ...fixture, language, summary: fixture.summary + '\n' + sample }
    const snapshot = JSON.stringify(interview)
    const h = route({ status: 'ready', interview })
    const response = await h.GET(request('?language=' + (language === 'en' ? 'tr' : 'en')), { params: { id } })
    assert.equal(response.status, 200)
    const bytes = Buffer.from(await response.arrayBuffer())
    const { text } = inspect(bytes)
    assert.ok(text.split('\n').includes(title))
    for (const value of [fixture.summary, sample, fixture.role, fixture.company, ...fixture.answers.flatMap(({q,a})=>[q,a])]) {
      assert.ok(text.split('\n').some(line => line === value || line.endsWith(': ' + value)), value)
    }
    assert.equal(JSON.stringify(interview), snapshot)
    if (process.env.REPORT_PDF_QA_DIR) fs.writeFileSync(path.join(process.env.REPORT_PDF_QA_DIR, 'persisted-' + language + '.pdf'), bytes)
  }
  let received
  const h = route({ status: 'ready', interview: { ...fixture, language: 'en' } }, async (_, language) => { received = language; return Buffer.from('%PDF-test') })
  for (const suffix of ['', '?language=', '?language=fr', '?language=en&language=de', '?language=TR']) {
    assert.equal((await h.GET(request(suffix), { params: { id } })).status, 200)
    assert.equal(received, 'en')
  }
})
test('unsupported persisted language fails generically and cannot be rescued by a query', async () => {
  for (const language of ['', 'fr', 'EN']) {
    const h = route({ status: 'ready', interview: { ...fixture, language } }, () => { throw new Error('Must not render') })
    const response = await h.GET(request('?language=en'), { params: { id } })
    assert.equal(response.status, 500)
    assert.deepEqual(await response.json(), { error: 'Failed to generate PDF' })
    assert.equal(response.headers.get('Content-Disposition'), null)
  }
})
test('auth/read outcomes precede language validation; errors never expose internals or attachments', async () => {
  const cases = [['unauthorized', 401, 'Unauthorized'], ['invalidId', 400, 'Invalid interview id'],
    ['notFound', 404, 'Interview not found'], ['readError', 500, 'Failed to load interview']]
  for (const [status, code, message] of cases) {
    const h = route({ status }, () => { throw new Error('Must not render') })
    const response = await h.GET(request('?language=invalid&ownerId=spoof'), { params: { id } })
    assert.equal(response.status, code); assert.deepEqual(await response.json(), { error: message })
    assert.equal(response.headers.get('Content-Disposition'), null)
    assert.equal(response.headers.get('Cache-Control'), 'private, no-store')
  }
  const wrong = await route({ status: 'notFound' }).GET(request(''), { params: { id } })
  const missing = await route({ status: 'notFound' }).GET(request(''), { params: { id } })
  assert.equal(await wrong.text(), await missing.text())
})
test('generation/font exceptions yield generic JSON 500', async () => {
  const h = route({ status: 'ready', interview: fixture }, async () => { throw new Error('SECRET FONT PATH') })
  const response = await h.GET(request(''), { params: { id } })
  assert.equal(response.status, 500); assert.deepEqual(await response.json(), { error: 'Failed to generate PDF' })
  assert.equal(response.headers.get('Content-Disposition'), null)
})

test('ten alternating reports preserve Unicode, sequences, full long content and input', async t => {
  const sample = 'ÇĞİÖŞÜ çğıöşü ÄÖÜ äöü ß ẞ'
  const paragraphs = Array.from({ length: 140 }, (_, i) => 'PARAGRAPH_' + String(i).padStart(3, '0') + ' Saved interview answer with Turkish ş and German ü.')
  const longAnswers = [{ q: 'LONG_QUESTION', a: paragraphs.join('\n') }, ...Array.from({ length: 12 }, (_, i) => ({ q: 'QUESTION_' + i, a: 'ANSWER_' + i }))]
  const seen = new Map(), measurements = [], snapshot = JSON.stringify(fixture)
  const previousFetch = global.fetch
  global.fetch = () => { throw new Error('Unexpected provider call') }
  try {
    for (let i = 0; i < 10; i++) {
      const long = i % 2 === 1, reversed = Math.floor(i / 2) % 2 === 1
      const sequence = reversed ? ['G', 'Ğ', 'ı', 'i'] : ['Ğ', 'G', 'i', 'ı']
      const report = { ...fixture, summary: sample + '\n' + sequence.join('\n'), answers: long ? longAnswers : fixture.answers }
      const before = process.memoryUsage().rss, start = performance.now()
      const bytes = await render(report, 'en'), ms = performance.now() - start, after = process.memoryUsage().rss
      const { text, pages } = inspect(bytes)
      assert.equal(bytes.subarray(0, 5).toString(), '%PDF-'); assert.match(bytes.subarray(-30).toString(), /%%EOF/)
      assert.ok(text.includes(sample + '\n' + sequence.join('\n')))
      if (long) {
        assert.ok(pages.length > 1)
        const body = pages.flatMap((page, index) => {
          const lines = page.split('\n')
          assert.equal(lines.at(-1), `Page ${index + 1} / ${pages.length}`)
          return lines.slice(0, -1)
        })
        const start = body.indexOf('LONG_QUESTION')
        assert.ok(start >= 0, 'Exact LONG_QUESTION must exist')
        const expected = ['LONG_QUESTION', 'Answer', ...paragraphs,
          ...longAnswers.slice(1).flatMap(({ q, a }, index) =>
            [`Question ${index + 2}`, q, 'Answer', a])]
        assert.deepEqual(body.slice(start), expected, 'Exact complete ordered Q&A without page footers')
      }
      pages.forEach((page, index) => assert.ok(compact(page).includes('Page' + (index + 1) + '/' + pages.length)))
      const key = long + ':' + reversed
      if (seen.has(key)) assert.equal(text, seen.get(key))
      seen.set(key, text)
      assert.equal(JSON.stringify(fixture), snapshot)
      measurements.push({ index: i + 1, long, ms, bytes: bytes.length, pages: pages.length, rssBefore: before, rssAfter: after })
      if (process.env.REPORT_PDF_QA_DIR) fs.writeFileSync(path.join(process.env.REPORT_PDF_QA_DIR, 'sequence-' + (i + 1) + '.pdf'), bytes)
    }
  } finally { global.fetch = previousFetch }
  t.diagnostic(JSON.stringify({ measurements, maxRSSKiB: process.resourceUsage().maxRSS }))
  if (process.env.REPORT_PDF_QA_DIR) fs.writeFileSync(path.join(process.env.REPORT_PDF_QA_DIR, 'measurements.json'), JSON.stringify(measurements, null, 2))
})

test('renderer rejects invalid language and invalid persisted numbers safely', async () => {
  await assert.rejects(render(fixture, 'fr'), /Invalid report language/)
  await assert.rejects(render({ ...fixture, score: 101 }, 'en'), /Invalid persisted report numbers/)
  await assert.rejects(render({ ...fixture, durationSeconds: -1 }, 'en'), /Invalid persisted report numbers/)
})
