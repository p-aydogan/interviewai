import 'server-only'

type HistoryCursor = { version: 1; createdAt: string; id: string }
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const TIMESTAMP = /^(\d{4})-(\d{2})-(\d{2})T([01]\d|2[0-3]):([0-5]\d):([0-5]\d)(?:\.\d{1,6})?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/

function validTimestamp(value: unknown): value is string {
  if (typeof value !== 'string') return false
  const match = TIMESTAMP.exec(value)
  if (!match || !Number.isFinite(Date.parse(value))) return false
  const year = Number(match[1]), month = Number(match[2]), day = Number(match[3])
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  return year > 0 && month >= 1 && month <= 12 && day >= 1 && day <= days[month - 1]
}

function isCursor(value: unknown): value is HistoryCursor {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const item = value as Record<string, unknown>
  return Object.keys(item).length === 3 && item.version === 1 &&
    validTimestamp(item.createdAt) && typeof item.id === 'string' && UUID.test(item.id)
}

export function encodeHistoryCursor(createdAt: string, id: string): string {
  const payload = { version: 1, createdAt, id }
  if (!isCursor(payload)) throw new Error('Invalid history position')
  // Preserve the database string, including microseconds, without Date conversion.
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
}

export function decodeHistoryCursor(token: string): HistoryCursor | null {
  if (!token || token.length > 512 || !/^[A-Za-z0-9_-]+$/.test(token)) return null
  try {
    const bytes = Buffer.from(token, 'base64url')
    if (bytes.toString('base64url') !== token) return null
    const payload: unknown = JSON.parse(bytes.toString('utf8'))
    return isCursor(payload) ? payload : null
  } catch { return null }
}
