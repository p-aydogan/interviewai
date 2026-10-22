const { test } = require('node:test')
const assert = require('node:assert/strict')
const { load } = require('../diagnostics/test-loader.cjs')
test('native auth config uses secure async storage and one foreground-only refresh registration', async () => {
  let configuration, listener, registrations = 0, removals = 0, starts = 0, stops = 0
  const values = new Map()
  const { createNativeAuth } = load(require.resolve('./client.ts'), {
    'react-native-url-polyfill/auto': {},
    '@supabase/supabase-js': { processLock: () => {}, createClient(_url, _key, options) {
      configuration = options.auth
      return { auth: { startAutoRefresh() { starts++ }, stopAutoRefresh() { stops++ } } }
    } },
    'expo-secure-store': {
      async getItemAsync(key) { return values.get(key) ?? null },
      async setItemAsync(key, value) { values.set(key, value) },
      async deleteItemAsync(key) { values.delete(key) },
    },
    'react-native': { AppState: { currentState: 'background', addEventListener(type, callback) {
      assert.equal(type, 'change'); registrations++; listener = callback
      return { remove() { removals++ } }
    } } },
  })
  const native = createNativeAuth({ supabaseUrl: 'https://auth.example', publishableKey: 'sb_publishable_test' })
  assert.equal(configuration.persistSession, true)
  assert.equal(configuration.autoRefreshToken, true)
  assert.equal(configuration.detectSessionInUrl, false)
  native.start(); native.start()
  assert.equal(registrations, 1); assert.equal(starts, 0); assert.equal(stops, 1)
  listener('active'); assert.equal(starts, 1)
  listener('inactive'); assert.equal(stops, 2)
  await configuration.storage.setItem(configuration.storageKey, 'test-session')
  await native.clear(); assert.equal(values.size, 0)
  native.stop(); assert.equal(removals, 1); assert.equal(stops, 3)
})
