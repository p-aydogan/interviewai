import 'server-only'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, options, value }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error: unknown) {
            if (
              error instanceof Error &&
              error.message.startsWith(
                'Cookies can only be modified in a Server Action or Route Handler.',
              )
            ) {
              return
            }

            throw error
          }
        },
      },
    },
  )
}
