import 'server-only'

import type { AuthError, User } from '@supabase/supabase-js'

import { createClient } from '@/lib/supabase/server'

export type AuthenticatedUserResult =
  | { error: null; status: 'authenticated'; user: User }
  | { error: AuthError | null; status: 'unauthorized'; user: null }

export async function getAuthenticatedUser(): Promise<AuthenticatedUserResult> {
  const supabase = createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return { error, status: 'unauthorized', user: null }
  }

  return { error: null, status: 'authenticated', user }
}
