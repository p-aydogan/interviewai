import 'server-only'
import type { User } from '@supabase/supabase-js'

export interface UserIdentity {
  email?: string
  displayName?: string
  initials?: string
}

function normalizedText(value: unknown, maximum: number): string | undefined {
  if (typeof value !== 'string') return undefined
  const text = value.trim().replace(/\s+/g, ' ')
  return text ? Array.from(text).slice(0, maximum).join('') : undefined
}

// Metadata is untrusted display text, never authorization evidence.
export function projectUserIdentity(user: User): UserIdentity {
  const metadata: Record<string, unknown> = user.user_metadata ?? {}
  const displayName = normalizedText(metadata.display_name, 80)
    ?? normalizedText(metadata.full_name, 80) ?? normalizedText(metadata.name, 80)
  const email = normalizedText(user.email, 254)
  const initials = displayName
    ? displayName.split(' ').slice(0, 2).map(part => Array.from(part)[0]).join('').toLocaleUpperCase()
    : email ? Array.from(email)[0].toLocaleUpperCase() : undefined
  return { email, displayName, initials }
}
