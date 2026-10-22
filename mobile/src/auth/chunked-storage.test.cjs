const { test } = require('node:test')
const assert = require('node:assert/strict')
const { load } = require('../diagnostics/test-loader.cjs')
const { createChunkedStorage } = load(require.resolve('./chunked-storage.ts'))
function fixture() {
  const values = new Map()
  let failSet = 0
  const backend = {
    async getItemAsync(key) { return values.get(key) ?? null },
    async setItemAsync(key, value) { if (failSet && --failSet === 0) throw Error('native'); values.set(key, value) },
    async deleteItemAsync(key) { values.delete(key) },
  }
  return { values, backend, storage: createChunkedStorage(backend), failWriteAt: value => { failSet = value } }
}
test('large Unicode sessions round trip with bounded native values; rotate and logout remove all chunks', async () => {
  const f = fixture(), value = JSON.stringify({ token: '😀é'.repeat(6000) })
  await f.storage.setItem('session', value)
  assert.equal(await f.storage.getItem('session'), value)
  for (const part of f.values.values()) assert.ok(Buffer.byteLength(part) <= 1200)
  await f.storage.setItem('session', 'replacement')
  assert.equal(await f.storage.getItem('session'), 'replacement')
  assert.equal(f.values.size, 2)
  await f.storage.removeItem('session')
  assert.equal(f.values.size, 0)
})
test('partial write fails closed and cleans both banks', async () => {
  const f = fixture()
  await f.storage.setItem('session', 'old')
  f.failWriteAt(2)
  await assert.rejects(f.storage.setItem('session', 'x'.repeat(4000)), /Secure session/)
  assert.equal(f.values.size, 0)
})
test('incomplete or corrupted committed set is rejected and removed', async () => {
  for (const corrupt of [true, false]) {
    const f = fixture()
    await f.storage.setItem('session', 'x'.repeat(2000))
    const key = [...f.values.keys()].find(k => k.endsWith('.0.0'))
    if (corrupt) f.values.set(key, 'wrong'); else f.values.delete(key)
    await assert.rejects(f.storage.getItem('session'), /Secure session/)
    assert.equal(f.values.size, 0)
  }
})
test('oversize data, read failures and deletion failures are explicit', async () => {
  const f = fixture()
  await assert.rejects(f.storage.setItem('session', 'x'.repeat(78000)))
  const broken = createChunkedStorage({ ...f.backend, async getItemAsync() { throw Error() } })
  await assert.rejects(broken.getItem('session'))
  const deletion = createChunkedStorage({ ...f.backend, async deleteItemAsync() { throw Error() } })
  await assert.rejects(deletion.removeItem('session'))
})
test('orphan inactive writes after process death are cleaned, committed bank remains readable', async () => {
  const f = fixture()
  await f.storage.setItem('session', 'committed')
  f.values.set('talentry.auth.v1.session.1.0', 'unfinished')
  assert.equal(await f.storage.getItem('session'), 'committed')
  assert.equal(f.values.size, 2)
})
