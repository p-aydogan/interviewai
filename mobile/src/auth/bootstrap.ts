import type { Session, SupabaseClient } from '@supabase/supabase-js'
export type BootstrapState =
  | { status: 'checking' | 'unauthenticated' | 'configuration-error' | 'auth-error'; generation: number }
  | { status: 'authenticated'; generation: number; userId: string; accessToken: string }

/** Verification and stale-response ownership live outside the presentation layer. */
export function createBootstrap(auth: SupabaseClient['auth'], clear: () => Promise<void>, publish: (state: BootstrapState) => void) {
  let disposed = false, generation = 0
  let loggedOut = false
  let task: ReturnType<typeof setTimeout> | undefined
  let deadline: ReturnType<typeof setTimeout> | undefined
  const emit = (state: BootstrapState) => { if (!disposed) publish(state) }
  async function verify(ticket: number) {
    try {
      const { data: { session }, error } = await auth.getSession()
      if (disposed || ticket !== generation) return
      if (error) throw Error()
      if (!session) { emit({ status: 'unauthenticated', generation: ticket }); return }
      const result = await auth.getUser(session.access_token)
      if (disposed || ticket !== generation) return
      if (result.error || !result.data.user || result.data.user.id !== session.user.id) throw Error()
      emit({ status: 'authenticated', generation: ticket, userId: result.data.user.id, accessToken: session.access_token })
    } catch {
      if (!disposed && ticket === generation) emit({ status: 'auth-error', generation: ticket })
    } finally { if (ticket === generation) clearTimeout(deadline) }
  }
  function schedule(_session?: Session | null) {
    if (loggedOut || disposed) return
    const ticket = ++generation
    clearTimeout(task); clearTimeout(deadline)
    emit({ status: 'checking', generation: ticket }) // Unmount old account's private tree immediately.
    deadline = setTimeout(() => {
      if (ticket !== generation || disposed) return
      ++generation
      emit({ status: 'auth-error', generation })
    }, 12000)
    // Avoid SDK auth lock re-entry inside the synchronous auth callback.
    task = setTimeout(() => { void verify(ticket) }, 0)
  }
  const { data: { subscription } } = auth.onAuthStateChange((_event, session) => schedule(session))
  schedule()
  return {
    async logout() {
      loggedOut = true
      const ticket = ++generation
      clearTimeout(task); clearTimeout(deadline)
      emit({ status: 'checking', generation: ticket })
      let failed = false
      try { const result = await auth.signOut({ scope: 'local' }); failed = !!result.error } catch { failed = true }
      try { await clear() } catch { failed = true }
      clearTimeout(task); clearTimeout(deadline)
      emit({ status: failed ? 'auth-error' : 'unauthenticated', generation: ++generation })
    },
    dispose() { disposed = true; ++generation; clearTimeout(task); clearTimeout(deadline); subscription.unsubscribe() },
  }
}
