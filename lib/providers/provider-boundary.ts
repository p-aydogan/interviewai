import 'server-only'

export class BoundaryError extends Error {
  constructor(public readonly code: string, public readonly status: number) { super(code) }
}

export function publicFailure(error: unknown): Response {
  const failure = error instanceof BoundaryError ? error : new BoundaryError('provider_failure', 502)
  return Response.json({ error: failure.code }, { status: failure.status, headers: { 'Cache-Control': 'private, no-store' } })
}

export async function readLimited(body: ReadableStream<Uint8Array> | null, limit: number, signal?: AbortSignal): Promise<Uint8Array> {
  if (!body) throw new BoundaryError('invalid_body', 400)
  const reader = body.getReader()
  const cancel = () => { void reader.cancel().catch(() => {}) }
  signal?.addEventListener('abort', cancel, { once: true })
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    while (true) {
      if (signal?.aborted) throw new BoundaryError('provider_timeout', 504)
      const { done, value } = await reader.read()
      if (signal?.aborted) throw new BoundaryError('provider_timeout', 504)
      if (done) break
      size += value.byteLength
      if (size > limit) throw new BoundaryError('body_too_large', 413)
      chunks.push(value)
    }
  } catch (error) {
    void reader.cancel().catch(() => {})
    throw error
  } finally { signal?.removeEventListener('abort', cancel); reader.releaseLock() }
  const result = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.byteLength }
  return result
}

export async function readRequest(request: Request): Promise<unknown> {
  const bytes = await readLimited(request.body, 32 * 1024)
  try { return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)) }
  catch { throw new BoundaryError('invalid_json', 400) }
}

// Process-local only: 4 total paid operations, at most 1 per verified user.
export function createAdmissionGuard(maximum = 4, perUser = 1) {
  const active = new Map<string, number>()
  let total = 0
  return (user: string) => {
    if (total >= maximum || (active.get(user) ?? 0) >= perUser) throw new BoundaryError('provider_busy', 429)
    total++; active.set(user, (active.get(user) ?? 0) + 1)
    let released = false
    return () => {
      if (released) return
      released = true; total--
      const remaining = (active.get(user) ?? 1) - 1
      if (remaining) active.set(user, remaining)
      else active.delete(user)
    }
  }
}
export const admitProvider = createAdmissionGuard()

export async function consumeProvider<T>(
  url: string, init: RequestInit, milliseconds: number, limit: number,
  consume: (bytes: Uint8Array, response: Response) => T,
): Promise<T> {
  const controller = new AbortController()
  let response: Response | undefined
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort()
      void response?.body?.cancel().catch(() => {})
      reject(new BoundaryError('provider_timeout', 504))
    }, milliseconds)
  })
  try {
    return await Promise.race([timeout, (async () => {
      response = await fetch(url, { ...init, signal: controller.signal })
      if (controller.signal.aborted) {
        void response.body?.cancel().catch(() => {})
        throw new BoundaryError('provider_timeout', 504)
      }
      if (!response.ok) {
        void response.body?.cancel().catch(() => {})
        throw new BoundaryError('provider_failure', 502)
      }
      const bytes = await readLimited(response.body, limit, controller.signal)
      return consume(bytes, response)
    })()])
  } catch (error) {
    if (error instanceof BoundaryError && error.code === 'provider_timeout') throw error
    throw new BoundaryError('provider_failure', 502)
  } finally { clearTimeout(timer); controller.abort() }
}
