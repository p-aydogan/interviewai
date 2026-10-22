export type ApiError = 'auth-expired' | 'cancelled' | 'timeout' | 'network' | 'invalid-response' | 'http-error' | 'invalid-request'
export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiError; status?: number }
export type Transport = (url: string, init: RequestInit) => Promise<Response>

/** No retries. Transport must enforce redirect:error natively (Expo fetch, not RN global fetch). */
export function createApiClient(baseUrl: string, transport: Transport) {
  const base = new URL(`${baseUrl.replace(/\/$/, '')}/`)
  return {
    async request<T>(path: string, token: string, validate: (value: unknown) => value is T,
      options: { signal?: AbortSignal; timeoutMs?: number; method?: 'GET' | 'POST'; body?: unknown } = {}): Promise<ApiResult<T>> {
      const controller = new AbortController()
      let timedOut = false
      const abort = () => controller.abort()
      const timeoutMs = options.timeoutMs ?? 15000
      if (!token || /\s/.test(token) || !Number.isFinite(timeoutMs) || timeoutMs < 1 || timeoutMs > 60000 ||
          !path.startsWith('api/') || path.includes('\\') || path.includes('#')) return { ok: false, error: 'invalid-request' }
      let url: URL
      try { url = new URL(path, base) } catch { return { ok: false, error: 'invalid-request' } }
      if (url.origin !== base.origin || !url.pathname.startsWith(`${base.pathname}api/`)) return { ok: false, error: 'invalid-request' }
      if (options.signal?.aborted) return { ok: false, error: 'cancelled' }
      options.signal?.addEventListener('abort', abort, { once: true })
      const timer = setTimeout(() => { timedOut = true; controller.abort() }, timeoutMs)
      try {
        const response = await transport(url.toString(), {
          method: options.method ?? 'GET', redirect: 'error', credentials: 'omit', signal: controller.signal,
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json' },
          body: options.body === undefined ? undefined : JSON.stringify(options.body),
        })
        if (response.redirected || (response.url && new URL(response.url).origin !== base.origin)) return { ok: false, error: 'invalid-response' }
        if (response.status === 401) return { ok: false, error: 'auth-expired', status: 401 }
        if (!response.ok) return { ok: false, error: 'http-error', status: response.status }
        if (!response.headers.get('content-type')?.includes('application/json') || !response.body) return { ok: false, error: 'invalid-response' }
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let bytes = 0, text = ''
        try {
          while (true) {
            const chunk = await reader.read()
            if (chunk.done) break
            bytes += chunk.value.byteLength
            if (bytes > 256 * 1024) return { ok: false, error: 'invalid-response' }
            text += decoder.decode(chunk.value, { stream: true })
          }
          text += decoder.decode()
        } finally { await reader.cancel().catch(() => {}); reader.releaseLock() }
        if (controller.signal.aborted) return { ok: false, error: timedOut ? 'timeout' : 'cancelled' }
        let value: unknown
        try { value = JSON.parse(text) } catch { return { ok: false, error: 'invalid-response' } }
        return validate(value) ? { ok: true, data: value } : { ok: false, error: 'invalid-response' }
      } catch {
        return { ok: false, error: controller.signal.aborted ? (timedOut ? 'timeout' : 'cancelled') : 'network' }
      } finally { clearTimeout(timer); options.signal?.removeEventListener('abort', abort); controller.abort() }
    },
  }
}
