export type Environment = Readonly<{ apiBaseUrl: string; supabaseUrl: string; publishableKey: string }>
export type Configuration = { ok: true; value: Environment } | { ok: false; message: string }

function localHostname(host: string) {
  return host === 'localhost' || host === '127.0.0.1' || host === '[::1]' ||
    /^10\.(?:\d{1,3}\.){2}\d{1,3}$/.test(host) || /^192\.168\.\d{1,3}\.\d{1,3}$/.test(host) ||
    /^172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/.test(host)
}

export function validateEnvironment(values: readonly (string | undefined)[], development: boolean): Configuration {
  try {
    const [api, supabase, key] = values
    if (!api || !supabase || !key?.trim()) throw Error()
    const urls = [api, supabase].map(value => {
      const url = new URL(value)
      if (url.username || url.password || url.search || url.hash ||
          (url.protocol !== 'https:' && !(development && url.protocol === 'http:' && localHostname(url.hostname)))) throw Error()
      return url.toString().replace(/\/$/, '')
    })
    // Public keys only: reject legacy JWT keys carrying a privileged role.
    if (!key.startsWith('sb_publishable_')) throw Error()
    return { ok: true, value: { apiBaseUrl: urls[0], supabaseUrl: urls[1], publishableKey: key } }
  } catch { return { ok: false, message: 'Mobile public configuration is missing or invalid. No backend fallback is used.' } }
}

export function readEnvironment(): Configuration {
  return validateEnvironment([
    process.env.EXPO_PUBLIC_TALENTRY_API_BASE_URL,
    process.env.EXPO_PUBLIC_SUPABASE_URL,
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  ], __DEV__)
}
