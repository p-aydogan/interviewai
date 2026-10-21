import 'server-only'

import type { AuthError, User } from '@supabase/supabase-js'

import { createClient } from '@/lib/supabase/server'

export type AuthenticatedUserResult =
  | { error: null; status: 'authenticated'; user: User }
  | { error: AuthError | null; status: 'unauthorized'; user: null }

export async function getAuthenticatedUser(request?: { headers?: Headers }): Promise<AuthenticatedUserResult> {
  const denied: AuthenticatedUserResult = { error: null, status: 'unauthorized', user: null }
  try {
    const supabase = await createClient()
    const authorization = request?.headers?.get('authorization')
    if (authorization !== null && authorization !== undefined && !/^Bearer [^\s]+$/i.test(authorization)) return denied
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (authorization) {
      // getUser(jwt) verifies with Supabase Auth; decoded claims are never authority.
      const bearer = await supabase.auth.getUser(authorization.slice(7))
      if (bearer.error || !bearer.data.user || (user && !error && user.id !== bearer.data.user.id)) return denied
      return { error: null, status: 'authenticated', user: bearer.data.user }
    }
    if (error || !user) {
      return { error, status: 'unauthorized', user: null }
    }

    return { error: null, status: 'authenticated', user }
  } catch {
    return denied
  }
}
