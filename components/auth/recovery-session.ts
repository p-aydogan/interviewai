import type { Session, SupabaseClient } from '@supabase/supabase-js'

export type RecoveryStatus = 'checking' | 'ready' | 'unavailable'
export type RecoverySubmitResult = 'success' | 'failed' | 'unavailable'
type RecoveryAuth = SupabaseClient['auth']
interface RecoveryContext { userId: string; sessionId: string; expiresAt: number }
interface RecoveryOptions {
  auth: RecoveryAuth
  storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>
  hasCallback: () => boolean
  onStatus: (status: RecoveryStatus) => void
}

export const RECOVERY_CONTEXT_KEY = 'talentry.password-recovery.v1'
export const RECOVERY_LIFETIME_MS = 15 * 60 * 1000
const VALIDATION_TIMEOUT_MS = 10_000

function readContext(storage: RecoveryOptions['storage']): RecoveryContext | null {
  try {
    const value: unknown = JSON.parse(storage.getItem(RECOVERY_CONTEXT_KEY) ?? 'null')
    if (!value || typeof value !== 'object') return null
    const context = value as Partial<RecoveryContext>
    if (typeof context.userId !== 'string' || !context.userId ||
        typeof context.sessionId !== 'string' || !context.sessionId ||
        typeof context.expiresAt !== 'number' || !Number.isFinite(context.expiresAt) ||
        context.expiresAt <= Date.now() ||
        context.expiresAt > Date.now() + RECOVERY_LIFETIME_MS) return null
    return context as RecoveryContext
  } catch { return null }
}

async function verifyRecoveryIdentity(auth: RecoveryAuth, session: Session) {
  const [{ data: claimData, error: claimsError }, { data: userData, error: userError }] =
    await Promise.all([auth.getClaims(session.access_token), auth.getUser(session.access_token)])
  const claims = claimData?.claims
  const user = userData?.user
  if (claimsError || userError || !user || !claims ||
      typeof claims.session_id !== 'string' || !claims.session_id ||
      claims.sub !== user.id || user.id !== session.user.id ||
      !Array.isArray(claims.amr) || !claims.amr.some((entry: unknown) =>
        entry !== null && typeof entry === 'object' && 'method' in entry && entry.method === 'recovery')) {
    throw new Error('Recovery identity verification failed')
  }
  return { userId: user.id, sessionId: claims.session_id }
}

// The marker provides bounded workflow continuity, never recovery provenance.
// Every validation requires SDK-verified recovery AMR and a provider-verified user.
export function createRecoverySession({ auth, storage, hasCallback, onStatus }: RecoveryOptions) {
  let disposed = false
  let generation = 0
  let status: RecoveryStatus = 'checking'
  let pendingRecovery: Session | null = null
  let context: RecoveryContext | null = null
  let submitting = false
  let finished = false
  let scheduled: ReturnType<typeof setTimeout> | undefined
  let expiry: ReturnType<typeof setTimeout> | undefined
  const initialization = setTimeout(revoke, VALIDATION_TIMEOUT_MS)

  function publish(next: RecoveryStatus) {
    status = next
    if (!disposed) onStatus(next)
  }

  function revoke() {
    generation++
    pendingRecovery = null
    context = null
    clearTimeout(scheduled)
    clearTimeout(expiry)
    clearTimeout(initialization)
    try { storage.removeItem(RECOVERY_CONTEXT_KEY) } catch { /* Fail closed in memory. */ }
    publish('unavailable')
  }

  async function validate(): Promise<boolean> {
    if (disposed || finished) return false
    const ticket = ++generation
    const recovery = pendingRecovery
    const remembered = context ?? readContext(storage)
    const current = () => !disposed && !finished && ticket === generation
    const timeout = setTimeout(() => { if (current()) revoke() }, VALIDATION_TIMEOUT_MS)
    try {
      if (!recovery && (!remembered || hasCallback())) {
        revoke()
        return false
      }
      const { data: { session }, error: sessionError } = await auth.getSession()
      if (!current()) return false
      if (sessionError || !session) {
        revoke()
        return false
      }
      const identity = await verifyRecoveryIdentity(auth, session)
      if (!current()) return false
      if (recovery && recovery.access_token !== session.access_token) {
        const origin = await verifyRecoveryIdentity(auth, recovery)
        if (!current()) return false
        if (origin.userId !== identity.userId || origin.sessionId !== identity.sessionId) {
          revoke()
          return false
        }
      }
      const sameContext = remembered?.userId === identity.userId && remembered.sessionId === identity.sessionId
      if (!recovery && (!sameContext || remembered.expiresAt <= Date.now())) {
        revoke()
        return false
      }
      // Do not let duplicate SDK events or token refresh extend the recovery window.
      const next: RecoveryContext = sameContext ? remembered : {
        ...identity, expiresAt: Date.now() + RECOVERY_LIFETIME_MS,
      }
      let verifiedSession = session
      // Reverify rotations within this validation's existing deadline, not on a polling timer.
      while (current()) {
        const { data: latest, error: latestError } = await auth.getSession()
        if (!current()) return false
        if (latestError || !latest.session) { revoke(); return false }
        if (latest.session.access_token === verifiedSession.access_token) break
        const latestIdentity = await verifyRecoveryIdentity(auth, latest.session)
        if (!current()) return false
        if (latestIdentity.userId !== identity.userId || latestIdentity.sessionId !== identity.sessionId) {
          revoke()
          return false
        }
        verifiedSession = latest.session
      }
      if (!current()) return false
      if (next.expiresAt <= Date.now()) { revoke(); return false }
      storage.setItem(RECOVERY_CONTEXT_KEY, JSON.stringify(next))
      context = next
      pendingRecovery = null
      clearTimeout(initialization)
      clearTimeout(expiry)
      expiry = setTimeout(revoke, next.expiresAt - Date.now())
      publish('ready')
      return true
    } catch {
      if (current()) revoke()
      return false
    } finally { clearTimeout(timeout) }
  }

  function scheduleValidation() {
    if (disposed || finished) return
    generation++
    clearTimeout(scheduled)
    // Never await Auth calls inside its auth-state callback (SDK lock safety).
    scheduled = setTimeout(() => { void validate() }, 0)
  }

  const { data: { subscription } } = auth.onAuthStateChange((event, session) => {
    if (disposed || finished) return
    if (event === 'SIGNED_OUT' || !session) { revoke(); return }
    // An update elsewhere may have completed the password reset. Do not retain
    // recovery eligibility in this tab after another tab updates the user.
    if (event === 'USER_UPDATED' && !submitting) { revoke(); return }
    if (context && session.user.id !== context.userId) revoke()
    if (event === 'PASSWORD_RECOVERY') {
      pendingRecovery = session
      publish('checking')
    }
    if (event === 'SIGNED_IN') publish('checking')
    if (event === 'PASSWORD_RECOVERY' || event === 'INITIAL_SESSION' || event === 'SIGNED_IN' ||
        event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
      scheduleValidation()
    }
  })

  return {
    recheck() {
      if (status === 'ready' || context || pendingRecovery) scheduleValidation()
    },
    async submit(password: string): Promise<RecoverySubmitResult> {
      if (status !== 'ready' || submitting || finished || disposed) return 'unavailable'
      submitting = true
      let updateTimeout: ReturnType<typeof setTimeout> | undefined
      try {
        if (!await validate() || status !== 'ready' || disposed) return 'unavailable'
        const ticket = generation
        updateTimeout = setTimeout(revoke, VALIDATION_TIMEOUT_MS)
        const { error } = await auth.updateUser({ password })
        if (!error) {
          const stillReady = !disposed && status === 'ready'
          finished = true
          revoke()
          return stillReady ? 'success' : 'unavailable'
        }
        if (disposed || status !== 'ready') return 'unavailable'
        if (ticket !== generation || !await validate()) return 'unavailable'
        return 'failed'
      } catch {
        return await validate() ? 'failed' : 'unavailable'
      } finally { clearTimeout(updateTimeout); submitting = false }
    },
    dispose() {
      disposed = true
      generation++
      clearTimeout(scheduled)
      clearTimeout(expiry)
      clearTimeout(initialization)
      subscription.unsubscribe()
    },
  }
}
