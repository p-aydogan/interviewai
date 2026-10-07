const { test } = require('node:test')
const assert = require('node:assert/strict')
const { load, plain } = require('./history-test-helpers.cjs')
const input = load('lib/interviews/interview-setup-input.ts', {})
const valid = () => ({ iv: 'f', level: 'mid', itype: 'behavioral', persona: 'formal', language: 'tr' })
const parse = overrides => input.parseInterviewSetupInput({ ...valid(), ...overrides })

test('valid config normalizes absent optional text', () => assert.deepEqual(plain(parse()), {
  interviewerKey: 'f', role: 'Genel', company: 'Genel', level: 'mid',
  interviewType: 'behavioral', persona: 'formal', language: 'tr',
}))
for (const [key, values] of Object.entries({ iv: ['f', 'm'], level: ['junior', 'mid', 'senior'],
  itype: ['behavioral', 'technical', 'mixed', 'case'], persona: ['friendly', 'formal', 'tough', 'curious'],
  language: ['tr', 'en', 'de'] })) {
  for (const value of values) test(`${key} accepts ${value}`, () => assert.ok(parse({ [key]: value })))
  for (const value of [undefined, '', 'garbage', 'constructor', '__proto__', values[0].toUpperCase()]) {
    test(`${key} rejects ${String(value)}`, () => assert.equal(parse({ [key]: value }), null))
  }
}
for (const key of ['role', 'company']) {
  for (const value of [undefined, '', '   ', '\u2003']) test(`${key} optional blank ${JSON.stringify(value)}`, () => {
    assert.equal(parse({ [key]: value })[key], 'Genel')
  })
  for (const value of ['a'.repeat(200), '😀'.repeat(200)]) test(`${key} accepts 200 code points ${value[0]}`, () => {
    assert.equal(parse({ [key]: value })[key], value)
  })
  for (const value of ['a'.repeat(201), '😀'.repeat(201), ' '.repeat(201), ' ' + 'a'.repeat(200)]) {
    test(`${key} rejects raw decoded length before trim`, () => assert.equal(parse({ [key]: value }), null))
  }
  test(`${key} preserves Unicode and trims only surrounding whitespace`, () => {
    const value = 'Çağrı Mühendislik Développeur 日本語 😀 e\u0301'
    assert.equal(parse({ [key]: ` ${value} ` })[key], value)
  })
  for (const code of [0, 9, 10, 13, 31, 127, 128, 159]) test(`${key} rejects control U+${code.toString(16)}`, () => {
    assert.equal(parse({ [key]: `A${String.fromCharCode(code)}B` }), null)
  })
  for (const value of ['Team Lead', 'A+B', '%ZZ', '\uFFFD', '<b>ordinary text</b>']) {
    test(`${key} validates delivered decoded text ${value}`, () => assert.equal(parse({ [key]: value })[key], value))
  }
}
for (const key of ['iv', 'role', 'company', 'level', 'itype', 'persona', 'language']) {
  for (const values of [['mid', 'senior'], ['mid', 'mid'], ['mid'], []]) {
    test(`${key} array representation rejected ${JSON.stringify(values)}`, () => assert.equal(parse({ [key]: values }), null))
  }
}
test('cv and arbitrary extra params including duplicates are ignored', () => {
  assert.deepEqual(plain(parse({ cv: ['private text', 'other'], extra: ['x', 'y'] })), plain(parse()))
})
test('canonical POST text accepts Unicode without rewriting', () => {
  for (const value of ['Genel', 'Çağrı 😀', '😀'.repeat(200)]) assert.equal(input.isCanonicalSetupText(value), true)
})
test('canonical POST text rejects noncanonical or invalid input', () => {
  for (const value of [null, undefined, 1, '', ' ', ' padded', 'padded ', '\nA', '\u0080', '😀'.repeat(201)]) {
    assert.equal(input.isCanonicalSetupText(value), false)
  }
})
test('lifecycle key is stable for equivalent configs and ignored query extras', () => {
  assert.equal(input.interviewSetupKey(parse()), input.interviewSetupKey(parse({ role: ' ', cv: 'ignored' })))
})
for (const [key, value] of Object.entries({ iv: 'm', role: 'Engineer', company: 'Example', level: 'senior',
  itype: 'technical', persona: 'tough', language: 'de' })) {
  test(`changed ${key} starts distinct lifecycle key`, () => {
    assert.notEqual(input.interviewSetupKey(parse()), input.interviewSetupKey(parse({ [key]: value })))
  })
}
