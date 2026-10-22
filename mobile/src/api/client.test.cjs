const { test } = require('node:test')
const assert = require('node:assert/strict')
const { load } = require('../diagnostics/test-loader.cjs')
const { createApiClient } = load(require.resolve('./client.ts'))
const valid = value => value?.ready === true
test('bearer restricted to base API and redirects rejected; no implicit retries', async () => {
  let calls = 0
  const client = createApiClient('https://talentry.example', async (url, init) => {
    calls++
    assert.equal(url, 'https://talentry.example/api/probe')
    assert.equal(init.redirect, 'error')
    assert.equal(init.headers.Authorization, 'Bearer test-token')
    return Response.json({ ready: true })
  })
  assert.deepEqual(await client.request('api/probe', 'test-token', valid), { ok: true, data: { ready: true } })
  for (const path of ['https://evil.example/api/probe', '//evil.example/api/probe', 'api/../../secret', 'api/\\evil']) {
    assert.equal((await client.request(path, 'test-token', valid)).error, 'invalid-request')
  }
  assert.equal(calls, 1)
})
test('401, malformed response, oversized stream and HTTP failure are sanitized', async () => {
  for (const [response, expected] of [
    [new Response('private raw', { status: 401 }), 'auth-expired'],
    [new Response('private raw', { status: 503 }), 'http-error'],
    [new Response('{', { headers: { 'content-type': 'application/json' } }), 'invalid-response'],
    [Response.json({ private: 'x'.repeat(270000) }), 'invalid-response'],
  ]) {
    let calls = 0
    const client = createApiClient('https://talentry.example', async () => { calls++; return response })
    const result = await client.request('api/probe', 'token', valid)
    assert.equal(result.error, expected); assert.equal(calls, 1)
    assert.ok(!JSON.stringify(result).includes('private'))
  }
})
test('timeout and caller cancellation terminate transport without retry', async () => {
  const client = createApiClient('https://talentry.example', (_url, init) => new Promise((_resolve, reject) => {
    init.signal.addEventListener('abort', () => reject(Error()), { once: true })
  }))
  assert.equal((await client.request('api/probe', 'token', valid, { timeoutMs: 5 })).error, 'timeout')
  const controller = new AbortController()
  const pending = client.request('api/probe', 'token', valid, { signal: controller.signal })
  controller.abort()
  assert.equal((await pending).error, 'cancelled')
})
