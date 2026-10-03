const { test } = require('node:test')
const assert = require('node:assert/strict')
const { cursor, plain, uuid } = require('./history-test-helpers.cjs')
const valid = { version: 1, createdAt: '2026-10-01T12:00:00.123456+03:00', id: uuid(42) }
const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url')
test('round trip preserves exact timezone, microseconds and UUID', () => {
  const token = cursor.encodeHistoryCursor(valid.createdAt, valid.id)
  assert.equal(token, encode(valid))
  assert.deepEqual(plain(cursor.decodeHistoryCursor(token)), valid)
})
for (const [name, token] of [
  ['empty', ''], ['padding', encode(valid) + '='], ['malformed JSON', Buffer.from('{').toString('base64url')],
  ['wrong version', encode({ ...valid, version: 2 })], ['invalid UUID', encode({ ...valid, id: 'invalid' })],
  ['invalid calendar date', encode({ ...valid, createdAt: '2026-02-30T00:00:00Z' })],
  ['missing timezone', encode({ ...valid, createdAt: '2026-10-01T12:00:00' })],
  ['excess precision', encode({ ...valid, createdAt: '2026-10-01T12:00:00.1234567Z' })],
  ['extra keys', encode({ ...valid, owner: 'synthetic' })], ['over 512 characters', 'A'.repeat(513)],
  ['missing key', encode({ version: 1, id: valid.id })], ['array', encode([])],
]) test(`rejects ${name}`, () => assert.equal(cursor.decodeHistoryCursor(token), null))
test('rejects noncanonical trailing base64 bits even when bytes decode identically', () => {
  const canonical = ['2026-10-01T12:00:00Z', '2026-10-01T12:00:00.1Z']
    .map(createdAt => encode({ ...valid, createdAt })).find(value => value.length % 4 !== 0)
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
  assert.notEqual(canonical.length % 4, 0)
  const changed = canonical.slice(0, -1) + alphabet[alphabet.indexOf(canonical.at(-1)) + 1]
  assert.deepEqual(Buffer.from(changed, 'base64url'), Buffer.from(canonical, 'base64url'))
  assert.equal(cursor.decodeHistoryCursor(changed), null)
})
test('encoder rejects invalid positions', () => {
  assert.throws(() => cursor.encodeHistoryCursor('invalid', valid.id), /Invalid history position/)
})
