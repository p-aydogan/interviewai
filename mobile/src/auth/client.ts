import 'react-native-url-polyfill/auto'
import { createClient, processLock } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'
import { AppState } from 'react-native'
import type { Environment } from '../config/environment'
import { createChunkedStorage } from './chunked-storage'

export function createNativeAuth(config: Environment) {
  const storage = createChunkedStorage({
    getItemAsync: key => SecureStore.getItemAsync(key),
    setItemAsync: (key, value) => SecureStore.setItemAsync(key, value),
    deleteItemAsync: key => SecureStore.deleteItemAsync(key),
  })
  const storageKey = 'talentry-session'
  const client = createClient(config.supabaseUrl, config.publishableKey, {
    auth: { storage, storageKey, persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, lock: processLock },
  })
  let registration: ReturnType<typeof AppState.addEventListener> | undefined
  return {
    client,
    clear: () => storage.removeItem(storageKey),
    start() {
      if (registration) return
      const sync = (state: string | null | undefined) => {
        if (state === 'active') client.auth.startAutoRefresh()
        else client.auth.stopAutoRefresh()
      }
      sync(AppState.currentState)
      registration = AppState.addEventListener('change', sync)
    },
    stop() { registration?.remove(); registration = undefined; client.auth.stopAutoRefresh() },
  }
}
