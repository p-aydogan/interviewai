export interface SecureBackend {
  getItemAsync(key: string): Promise<string | null>
  setItemAsync(key: string, value: string): Promise<void>
  deleteItemAsync(key: string): Promise<void>
}
const MAX_CHUNKS = 64
const CHUNK_BYTES = 1200
type Manifest = { version: 1; bank: 0 | 1; count: number; length: number; checksum: number }
export class AuthStorageError extends Error {
  constructor() { super('Secure session storage unavailable or incomplete') }
}
function checksum(value: string) {
  let hash = 2166136261
  for (let i = 0; i < value.length; i++) hash = Math.imul(hash ^ value.charCodeAt(i), 16777619)
  return hash >>> 0 // Corruption detection only; SecureStore supplies confidentiality.
}
function chunksOf(value: string) {
  const chunks: string[] = []
  let chunk = '', bytes = 0
  for (const char of value) {
    const code = char.codePointAt(0)!
    const size = code <= 127 ? 1 : code <= 2047 ? 2 : code <= 65535 ? 3 : 4
    if (bytes + size > CHUNK_BYTES) { chunks.push(chunk); chunk = ''; bytes = 0 }
    chunk += char; bytes += size
    if (chunks.length >= MAX_CHUNKS) throw new AuthStorageError()
  }
  chunks.push(chunk)
  return chunks
}
function parseManifest(raw: string): Manifest {
  const item: unknown = JSON.parse(raw)
  if (!item || typeof item !== 'object') throw new AuthStorageError()
  const m = item as Partial<Manifest>
  if (m.version !== 1 || (m.bank !== 0 && m.bank !== 1) || !Number.isInteger(m.count) ||
      m.count! < 1 || m.count! > MAX_CHUNKS || !Number.isInteger(m.length) || m.length! < 0 ||
      m.length! > MAX_CHUNKS * CHUNK_BYTES || !Number.isInteger(m.checksum)) throw new AuthStorageError()
  return m as Manifest
}

/** Serialized, two-bank storage. Manifest replacement is the commit point, not a filesystem transaction. */
export function createChunkedStorage(backend: SecureBackend) {
  let queue: Promise<unknown> = Promise.resolve()
  const prefix = (key: string) => {
    if (!/^[a-zA-Z0-9._-]{1,180}$/.test(key)) throw new AuthStorageError()
    return `talentry.auth.v1.${key}`
  }
  const part = (base: string, bank: number, index: number) => `${base}.${bank}.${index}`
  async function clear(base: string, bank?: number) {
    let failed = false
    const keys = bank === undefined ? [base, ...[0, 1].flatMap(b => Array.from({ length: MAX_CHUNKS }, (_, i) => part(base, b, i)))]
      : Array.from({ length: MAX_CHUNKS }, (_, i) => part(base, bank, i))
    for (const key of keys) {
      try { await backend.deleteItemAsync(key) } catch { failed = true }
    }
    if (failed) throw new AuthStorageError()
  }
  function serialized<T>(work: () => Promise<T>): Promise<T> {
    const result = queue.then(work)
    queue = result.catch(() => {})
    return result
  }
  async function guarded<T>(key: string, work: (base: string) => Promise<T>) {
    const base = prefix(key)
    try { return await work(base) }
    catch {
      try { await clear(base) } catch { /* Still fail closed; no credentials returned. */ }
      throw new AuthStorageError()
    }
  }
  return {
    getItem(key: string): Promise<string | null> {
      return serialized(() => guarded(key, async base => {
        const raw = await backend.getItemAsync(base)
        if (raw === null) { await clear(base); return null }
        const manifest = parseManifest(raw)
        const chunks: string[] = []
        for (let i = 0; i < manifest.count; i++) {
          const chunk = await backend.getItemAsync(part(base, manifest.bank, i))
          if (chunk === null || chunk.length > CHUNK_BYTES) throw new AuthStorageError()
          chunks.push(chunk)
        }
        const value = chunks.join('')
        if (value.length !== manifest.length || checksum(value) !== manifest.checksum) throw new AuthStorageError()
        await clear(base, manifest.bank === 0 ? 1 : 0)
        return value
      }))
    },
    setItem(key: string, value: string): Promise<void> {
      return serialized(() => guarded(key, async base => {
        const chunks = chunksOf(value)
        const old = await backend.getItemAsync(base)
        const bank = old === null || parseManifest(old).bank === 1 ? 0 : 1
        await clear(base, bank)
        for (let i = 0; i < chunks.length; i++) await backend.setItemAsync(part(base, bank, i), chunks[i])
        await backend.setItemAsync(base, JSON.stringify({ version: 1, bank, count: chunks.length,
          length: value.length, checksum: checksum(value) } satisfies Manifest))
        await clear(base, bank === 0 ? 1 : 0)
      }))
    },
    removeItem(key: string): Promise<void> { return serialized(() => guarded(key, clear)) },
  }
}
