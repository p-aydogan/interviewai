# Sprint AUTH_RECOVERY_01 Engineering Report

## 1. Report identity

Date: 2026-09-25. Repository: C:/Users/p-ayd/interviewai. Branch: feature/auth-foundation. Pre-implementation HEAD: ff67db4.
Title: Recovery reliability with verified recovery provenance and refresh continuity.
Status: Implementation and automated validation complete; browser runtime acceptance COMPLETE — PASS. Acceptance documentation updated 2026-09-27 from user-supplied verified results.
The user explicitly authorized updating these existing reports in place, superseding their earlier design description. No duplicate reports created.

## 2. Objective and boundaries

Continue the existing working tree. Implement only verified recovery AMR, verified identity continuity across token rotation, and removal of 15-second polling, with associated tests and reports. Preserve automatic SDK PKCE exchange and existing fail-closed recovery workflow. No dependency, configuration, middleware, database, routes, styling, or unrelated product changes. Browser acceptance was subsequently completed successfully by the user; this documentation update records it without rerunning tests.

## 3. Repository state before hardening

Branch feature/auth-foundation; HEAD ff67db4. Before hardening the same five paths below were already modified/untracked. The earlier implementation was preserved and hardened; no reset, discard, branch operation, stage, commit or push occurred. The dev server was already stopped. No process operation or automatic restart occurred this turn.

~~~text
 M components/auth/PasswordRecoveryFlow.tsx
?? components/auth/recovery-session.test.cjs
?? components/auth/recovery-session.ts
?? docs/01_Engineering/Sprint_AUTH_RECOVERY_01_Engineering_Report.md
?? docs/01_Engineering/Sprint_AUTH_RECOVERY_01_Summary.md
~~~

## 4. Architecture and implementation decisions

The controller remains separate from the React UI. Installed Supabase automatic callback handling remains the only PKCE exchange path; no manual exchangeCodeForSession is added.

### Historical PKCE diagnosis

The original PKCE failures were attributed to provider flow-state expiry/timing, not a missing verifier cookie; verifier generation/storage was runtime-verified. The core automatic Supabase recovery PKCE happy path worked when a fresh link was opened promptly. Implementation addressed two separate reliability issues: refresh continuity and stale recovery UI after same-profile cross-tab logout. Later Edge-to-Chrome failures were separate, expected different-browser/profile PKCE rejection.

### Verified provenance

verifyRecoveryIdentity calls auth.getClaims(access_token) and auth.getUser(access_token). Both must succeed. Require a nonempty string session_id, claims.sub equal to provider user.id and session.user.id, and Array.isArray(claims.amr) containing a non-null object with method exactly 'recovery'. Other methods, a string 'recovery', absent or malformed AMR do not qualify. No manual JWT parsing or trust in unverified claims is introduced.

This corrects the previous report's overly broad conclusion about transient recovery provenance. Upstream Supabase Auth internal/api/verify.go and internal/api/token.go propagate PKCE recovery authentication method; internal/models/amr.go stores it against the session; internal/tokens/service.go emits session AMR in signed JWTs. The installed SDK's transient PASSWORD_RECOVERY event is distinct from durable JWT AMR. Upstream source evidence does not establish the deployed project's version or custom hook behavior. The user-supplied live Chrome recovery PASS now confirms the deployed session satisfies the hardened recovery-AMR validation; absence of the exact claim still fails closed. No raw claims or tokens were exposed.

### Marker and restoration

sessionStorage key talentry.password-recovery.v1 stores exactly userId, sessionId, expiresAt. No access/refresh token, password, OTP, verifier, callback code, raw JWT, AMR payload, or email is persisted by this controller. Tokens are passed only in memory to SDK verification.

PASSWORD_RECOVERY establishes eligibility only after verification. Restoration requires a syntactically valid non-expired marker (expiry no more than 15 minutes ahead), no callback/error/access_token parameter remaining in query or fragment, a current session, verified recovery AMR and matching authenticated user/session ID. An ordinary session with a forged matching marker is rejected for missing recovery AMR. An unmarked direct visit is rejected even if authenticated. The marker supplies bounded workflow continuity, not server authorization or tamper-proof local storage.

Expiry remains fixed at first successful establishment plus 15 minutes. Duplicate events, TOKEN_REFRESHED and reload do not renew it. The same fixed deadline is checked after asynchronous verification, before writing/publishing ready.

### Token rotation and races

Token equality is used only to detect whether another verification is required, never as the identity rejection rule. Initial verification yields userId/sessionId and confirms recovery AMR. If the pending recovery event has an older token, its identity is separately verified and must match the current verified identity.

Before ready, getSession is re-read. A changed token is verified with getClaims and getUser and must preserve userId/sessionId and recovery AMR. The session is re-read again to catch another rotation during verification. This is an event-driven validation operation within the existing 10-second timeout, not scheduled periodic polling. Verification failures, session loss or changed identity revoke.

Generation/ticket guards follow asynchronous steps. Logout, disposal, newer auth events and timeout invalidate stale work. In particular, neither a late initial verification nor a late rotated-token verification can recreate a marker after logout.

### Events, deadlines and submit

SIGNED_OUT/null session synchronously invoke revoke, clear pending/in-memory context and timers, remove the marker where possible, and publish unavailable. User mismatch, invalid identity/provenance, expiry and an external USER_UPDATED also revoke. SDK BroadcastChannel propagation remains untouched. Failed storage access/write fails closed; removal failures still revoke in-memory eligibility.

Retained triggers: PASSWORD_RECOVERY, INITIAL_SESSION, SIGNED_IN, TOKEN_REFRESHED, USER_UPDATED; focus, pageshow and visibilitychange; pre-submit validation; fixed expiry timer; bounded initialization/validation/update deadlines. Removed the visible-page 15-second interval and its cleanup, with no replacement periodic loop.

Submit revalidates before updateUser and blocks duplicate submissions. Success marks the controller finished and revokes before navigation. Session loss before submit blocks updateUser. Late mutation completion after logout or timeout cannot restore ready or navigate. UI timeouts do not cancel an already submitted provider mutation.

## 5. Created and modified files / responsibilities

- components/auth/PasswordRecoveryFlow.tsx: tracked modification; controller lifecycle, retained browser event listeners, existing UI and navigation; interval removed.
- components/auth/recovery-session.ts: existing untracked implementation hardened; persistence, verified recovery identity, race handling, revocation and submit.
- components/auth/recovery-session.test.cjs: existing untracked suite expanded; in-memory deterministic tests, no credentials/network/browser.
- docs/01_Engineering/Sprint_AUTH_RECOVERY_01_Summary.md: existing untracked summary updated in place.
- docs/01_Engineering/Sprint_AUTH_RECOVERY_01_Engineering_Report.md: existing untracked engineering record updated in place.

## 6. Public interfaces, props and types

No existing form/route contracts changed. Controller exports RecoveryStatus, RecoverySubmitResult, RECOVERY_CONTEXT_KEY, RECOVERY_LIFETIME_MS, createRecoverySession({ auth, storage, hasCallback, onStatus }). Controller methods: recheck(), submit(password), dispose(). Internal verifyRecoveryIdentity returns verified userId/sessionId. No any types added. React component remains below 150 lines.

## 7. Accessibility decisions

Existing form semantics, loading/disabled state, keyboard controls, error alert and aria-live state cards preserved. Revocation unmounts the form and renders the existing unavailable card. No new motion. Browser focus/screen-reader acceptance remains pending.

## 8. Styling and token usage

No styling or token changes. Existing Talentry UI components and approved classes retained.

## 9. Validation commands and exact results

Performed in the requested order after code changes:

1. npx tsc --noEmit --incremental false: exit 0; no TypeScript diagnostics.
2. node --test components/auth/recovery-session.test.cjs: exit 0; tests 34, pass 34, fail 0, cancelled 0, skipped 0, todo 0.
3. git diff --check: exit 0; no whitespace errors. Git warning: in the working copy of 'components/auth/PasswordRecoveryFlow.tsx', LF will be replaced by CRLF the next time Git touches it.
4. npm run build: exit 0; Next.js 14.2.5 compiled successfully; lint/type validation completed; static page generation 22/22; final optimization and build traces completed. /reset-password is static, 5.03 kB, First Load JS 166 kB.

npm printed an optional update notice (11.16.0 -> 12.1.0) during TypeScript/build commands. No packages installed/updated. No errors suppressed or bypassed. Final whitespace/status inspection follows report updates; no code changes after successful validation.

The suite retains the prior 24 tests and adds ten cases covering strict/malformed AMR rejection, mixed AMR with recovery, forged ordinary-session marker, restoration mismatches, refreshed-session AMR/identity rejection, pending-event rotation continuity and mismatch, in-flight rotation success and rejection, and logout during latest-token verification. Token mocks now bind claims/user to each token independently of the active session. The 34 tests cover all 15 requested behaviors, including existing expiry, callback replay, pre-submit loss and successful cleanup cases.

## 10. Historical implementation-validation Git diff --stat and status

Tracked-only git diff --stat (Git does not include untracked new files):

~~~text
 components/auth/PasswordRecoveryFlow.tsx | 97 +++++++++++---------------------
 1 file changed, 32 insertions(+), 65 deletions(-)
~~~

~~~text
 M components/auth/PasswordRecoveryFlow.tsx
?? components/auth/recovery-session.test.cjs
?? components/auth/recovery-session.ts
?? docs/01_Engineering/Sprint_AUTH_RECOVERY_01_Engineering_Report.md
?? docs/01_Engineering/Sprint_AUTH_RECOVERY_01_Summary.md
~~~

## 11. Complete implementation diffs

Tracked component diff is against HEAD; untracked code/test files are shown as complete new-file diffs. Both report files contain their final review record; self-referential report diffs are not embedded recursively.

~~~diff
diff --git a/components/auth/PasswordRecoveryFlow.tsx b/components/auth/PasswordRecoveryFlow.tsx
index 297a67e..4a9c4eb 100644
--- a/components/auth/PasswordRecoveryFlow.tsx
+++ b/components/auth/PasswordRecoveryFlow.tsx
@@ -10,8 +10,8 @@ import { AUTH_ROUTES } from '@/lib/auth/auth-constants'
 import { createClient } from '@/lib/supabase'

 import ResetPasswordForm from './ResetPasswordForm'
-
-type RecoveryStatus = 'checking' | 'ready' | 'unavailable'
+import { createRecoverySession } from './recovery-session'
+import type { RecoveryStatus } from './recovery-session'

 interface RecoveryStateCardProps {
   action?: ReactNode
@@ -36,65 +36,39 @@ export default function PasswordRecoveryFlow() {
   const router = useRouter()
   const [supabase] = useState(createClient)
   const [status, setStatus] = useState<RecoveryStatus>('checking')
-  const [recoveryObserved, setRecoveryObserved] = useState(false)
   const [providerPending, setProviderPending] = useState(false)
   const [providerError, setProviderError] = useState('')
-  const recoveryObservedRef = useRef(false)
-
-  useEffect(() => {
-    const {
-      data: { subscription },
-    } = supabase.auth.onAuthStateChange((event) => {
-      if (event === 'PASSWORD_RECOVERY') {
-        recoveryObservedRef.current = true
-        setRecoveryObserved(true)
-        setStatus('checking')
-        return
-      }
-
-      if (
-        !recoveryObservedRef.current &&
-        (event === 'INITIAL_SESSION' || event === 'SIGNED_IN')
-      ) {
-        setStatus('unavailable')
-      }
-    })
-
-    return () => subscription.unsubscribe()
-  }, [supabase])
+  const recovery = useRef<ReturnType<typeof createRecoverySession> | null>(null)

   useEffect(() => {
-    if (!recoveryObserved) return
-
-    let active = true
-
-    async function validateRecoveryUser() {
-      try {
-        const {
-          data: { user },
-          error,
-        } = await supabase.auth.getUser()
-
-        if (!active) return
-        if (!error && user) {
-          setStatus('ready')
-          return
-        }
-
-        setStatus('unavailable')
-      } catch {
-        if (active) {
-          setStatus('unavailable')
-        }
-      }
+    try {
+      recovery.current = createRecoverySession({
+        auth: supabase.auth,
+        storage: window.sessionStorage,
+        hasCallback: () => {
+          const url = new URL(window.location.href)
+          const hash = new URLSearchParams(url.hash.slice(1))
+          return ['code', 'error', 'error_code', 'error_description', 'access_token'].some(
+            (key) => url.searchParams.has(key) || hash.has(key),
+          )
+        },
+        onStatus: setStatus,
+      })
+    } catch { setStatus('unavailable'); return }
+    const recheck = () => {
+      if (document.visibilityState === 'visible') recovery.current?.recheck()
     }
-
-    void validateRecoveryUser()
-
+    window.addEventListener('focus', recheck)
+    window.addEventListener('pageshow', recheck)
+    document.addEventListener('visibilitychange', recheck)
     return () => {
-      active = false
+      window.removeEventListener('focus', recheck)
+      window.removeEventListener('pageshow', recheck)
+      document.removeEventListener('visibilitychange', recheck)
+      recovery.current?.dispose()
+      recovery.current = null
     }
-  }, [recoveryObserved, supabase])
+  }, [supabase])

   async function handlePasswordSubmit(password: string) {
     if (status !== 'ready' || providerPending) return
@@ -102,20 +76,13 @@ export default function PasswordRecoveryFlow() {
     setProviderPending(true)
     setProviderError('')

-    try {
-      const { error } = await supabase.auth.updateUser({ password })
-
-      if (error) {
-        setProviderError("We couldn't update your password. Please try again.")
-        setProviderPending(false)
-        return
-      }
-
+    const result = await recovery.current?.submit(password)
+    if (result === 'success') {
       router.replace(AUTH_ROUTES.resetPasswordSuccess)
-    } catch {
+    } else if (result === 'failed') {
       setProviderError("We couldn't update your password. Please try again.")
-      setProviderPending(false)
     }
+    setProviderPending(false)
   }

   if (status === 'ready') {

diff --git a/components/auth/recovery-session.ts b/components/auth/recovery-session.ts
new file mode 100644
--- /dev/null
+++ b/components/auth/recovery-session.ts
@@ -0,0 +1,206 @@
+import type { Session, SupabaseClient } from '@supabase/supabase-js'
+
+export type RecoveryStatus = 'checking' | 'ready' | 'unavailable'
+export type RecoverySubmitResult = 'success' | 'failed' | 'unavailable'
+type RecoveryAuth = SupabaseClient['auth']
+interface RecoveryContext { userId: string; sessionId: string; expiresAt: number }
+interface RecoveryOptions {
+  auth: RecoveryAuth
+  storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>
+  hasCallback: () => boolean
+  onStatus: (status: RecoveryStatus) => void
+}
+
+export const RECOVERY_CONTEXT_KEY = 'talentry.password-recovery.v1'
+export const RECOVERY_LIFETIME_MS = 15 * 60 * 1000
+const VALIDATION_TIMEOUT_MS = 10_000
+
+function readContext(storage: RecoveryOptions['storage']): RecoveryContext | null {
+  try {
+    const value: unknown = JSON.parse(storage.getItem(RECOVERY_CONTEXT_KEY) ?? 'null')
+    if (!value || typeof value !== 'object') return null
+    const context = value as Partial<RecoveryContext>
+    if (typeof context.userId !== 'string' || !context.userId ||
+        typeof context.sessionId !== 'string' || !context.sessionId ||
+        typeof context.expiresAt !== 'number' || !Number.isFinite(context.expiresAt) ||
+        context.expiresAt <= Date.now() ||
+        context.expiresAt > Date.now() + RECOVERY_LIFETIME_MS) return null
+    return context as RecoveryContext
+  } catch { return null }
+}
+
+async function verifyRecoveryIdentity(auth: RecoveryAuth, session: Session) {
+  const [{ data: claimData, error: claimsError }, { data: userData, error: userError }] =
+    await Promise.all([auth.getClaims(session.access_token), auth.getUser(session.access_token)])
+  const claims = claimData?.claims
+  const user = userData?.user
+  if (claimsError || userError || !user || !claims ||
+      typeof claims.session_id !== 'string' || !claims.session_id ||
+      claims.sub !== user.id || user.id !== session.user.id ||
+      !Array.isArray(claims.amr) || !claims.amr.some((entry: unknown) =>
+        entry !== null && typeof entry === 'object' && 'method' in entry && entry.method === 'recovery')) {
+    throw new Error('Recovery identity verification failed')
+  }
+  return { userId: user.id, sessionId: claims.session_id }
+}
+
+// The marker provides bounded workflow continuity, never recovery provenance.
+// Every validation requires SDK-verified recovery AMR and a provider-verified user.
+export function createRecoverySession({ auth, storage, hasCallback, onStatus }: RecoveryOptions) {
+  let disposed = false
+  let generation = 0
+  let status: RecoveryStatus = 'checking'
+  let pendingRecovery: Session | null = null
+  let context: RecoveryContext | null = null
+  let submitting = false
+  let finished = false
+  let scheduled: ReturnType<typeof setTimeout> | undefined
+  let expiry: ReturnType<typeof setTimeout> | undefined
+  const initialization = setTimeout(revoke, VALIDATION_TIMEOUT_MS)
+
+  function publish(next: RecoveryStatus) {
+    status = next
+    if (!disposed) onStatus(next)
+  }
+
+  function revoke() {
+    generation++
+    pendingRecovery = null
+    context = null
+    clearTimeout(scheduled)
+    clearTimeout(expiry)
+    clearTimeout(initialization)
+    try { storage.removeItem(RECOVERY_CONTEXT_KEY) } catch { /* Fail closed in memory. */ }
+    publish('unavailable')
+  }
+
+  async function validate(): Promise<boolean> {
+    if (disposed || finished) return false
+    const ticket = ++generation
+    const recovery = pendingRecovery
+    const remembered = context ?? readContext(storage)
+    const current = () => !disposed && !finished && ticket === generation
+    const timeout = setTimeout(() => { if (current()) revoke() }, VALIDATION_TIMEOUT_MS)
+    try {
+      if (!recovery && (!remembered || hasCallback())) {
+        revoke()
+        return false
+      }
+      const { data: { session }, error: sessionError } = await auth.getSession()
+      if (!current()) return false
+      if (sessionError || !session) {
+        revoke()
+        return false
+      }
+      const identity = await verifyRecoveryIdentity(auth, session)
+      if (!current()) return false
+      if (recovery && recovery.access_token !== session.access_token) {
+        const origin = await verifyRecoveryIdentity(auth, recovery)
+        if (!current()) return false
+        if (origin.userId !== identity.userId || origin.sessionId !== identity.sessionId) {
+          revoke()
+          return false
+        }
+      }
+      const sameContext = remembered?.userId === identity.userId && remembered.sessionId === identity.sessionId
+      if (!recovery && (!sameContext || remembered.expiresAt <= Date.now())) {
+        revoke()
+        return false
+      }
+      // Do not let duplicate SDK events or token refresh extend the recovery window.
+      const next: RecoveryContext = sameContext ? remembered : {
+        ...identity, expiresAt: Date.now() + RECOVERY_LIFETIME_MS,
+      }
+      let verifiedSession = session
+      // Reverify rotations within this validation's existing deadline, not on a polling timer.
+      while (current()) {
+        const { data: latest, error: latestError } = await auth.getSession()
+        if (!current()) return false
+        if (latestError || !latest.session) { revoke(); return false }
+        if (latest.session.access_token === verifiedSession.access_token) break
+        const latestIdentity = await verifyRecoveryIdentity(auth, latest.session)
+        if (!current()) return false
+        if (latestIdentity.userId !== identity.userId || latestIdentity.sessionId !== identity.sessionId) {
+          revoke()
+          return false
+        }
+        verifiedSession = latest.session
+      }
+      if (!current()) return false
+      if (next.expiresAt <= Date.now()) { revoke(); return false }
+      storage.setItem(RECOVERY_CONTEXT_KEY, JSON.stringify(next))
+      context = next
+      pendingRecovery = null
+      clearTimeout(initialization)
+      clearTimeout(expiry)
+      expiry = setTimeout(revoke, next.expiresAt - Date.now())
+      publish('ready')
+      return true
+    } catch {
+      if (current()) revoke()
+      return false
+    } finally { clearTimeout(timeout) }
+  }
+
+  function scheduleValidation() {
+    if (disposed || finished) return
+    generation++
+    clearTimeout(scheduled)
+    // Never await Auth calls inside its auth-state callback (SDK lock safety).
+    scheduled = setTimeout(() => { void validate() }, 0)
+  }
+
+  const { data: { subscription } } = auth.onAuthStateChange((event, session) => {
+    if (disposed || finished) return
+    if (event === 'SIGNED_OUT' || !session) { revoke(); return }
+    // An update elsewhere may have completed the password reset. Do not retain
+    // recovery eligibility in this tab after another tab updates the user.
+    if (event === 'USER_UPDATED' && !submitting) { revoke(); return }
+    if (context && session.user.id !== context.userId) revoke()
+    if (event === 'PASSWORD_RECOVERY') {
+      pendingRecovery = session
+      publish('checking')
+    }
+    if (event === 'SIGNED_IN') publish('checking')
+    if (event === 'PASSWORD_RECOVERY' || event === 'INITIAL_SESSION' || event === 'SIGNED_IN' ||
+        event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
+      scheduleValidation()
+    }
+  })
+
+  return {
+    recheck() {
+      if (status === 'ready' || context || pendingRecovery) scheduleValidation()
+    },
+    async submit(password: string): Promise<RecoverySubmitResult> {
+      if (status !== 'ready' || submitting || finished || disposed) return 'unavailable'
+      submitting = true
+      let updateTimeout: ReturnType<typeof setTimeout> | undefined
+      try {
+        if (!await validate() || status !== 'ready' || disposed) return 'unavailable'
+        const ticket = generation
+        updateTimeout = setTimeout(revoke, VALIDATION_TIMEOUT_MS)
+        const { error } = await auth.updateUser({ password })
+        if (!error) {
+          const stillReady = !disposed && status === 'ready'
+          finished = true
+          revoke()
+          return stillReady ? 'success' : 'unavailable'
+        }
+        if (disposed || status !== 'ready') return 'unavailable'
+        if (ticket !== generation || !await validate()) return 'unavailable'
+        return 'failed'
+      } catch {
+        return await validate() ? 'failed' : 'unavailable'
+      } finally { clearTimeout(updateTimeout); submitting = false }
+    },
+    dispose() {
+      disposed = true
+      generation++
+      clearTimeout(scheduled)
+      clearTimeout(expiry)
+      clearTimeout(initialization)
+      subscription.unsubscribe()
+    },
+  }
+}

diff --git a/components/auth/recovery-session.test.cjs b/components/auth/recovery-session.test.cjs
new file mode 100644
--- /dev/null
+++ b/components/auth/recovery-session.test.cjs
@@ -0,0 +1,310 @@
+// Run with: node --test components/auth/recovery-session.test.cjs
+// Compile in memory; no browser, credentials, generated files, or network requests.
+const { test } = require('node:test')
+const assert = require('node:assert/strict')
+const fs = require('node:fs')
+const path = require('node:path')
+const vm = require('node:vm')
+const ts = require('typescript')
+
+const compiled = ts.transpileModule(
+  fs.readFileSync(path.join(__dirname, 'recovery-session.ts'), 'utf8'),
+  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } },
+).outputText
+const session = (id = 'recovery-session', user = 'user-a') => ({
+  access_token: id, user: { id: user },
+})
+
+function harness(sharedStorage = new Map()) {
+  let now = 1_000_000
+  let nextTimer = 0
+  const timers = new Map()
+  const scope = {
+    exports: {}, Date: class extends Date { static now() { return now } },
+    setTimeout(fn, delay) { const id = ++nextTimer; timers.set(id, { fn, at: now + delay }); return id },
+    clearTimeout(id) { timers.delete(id) },
+  }
+  vm.runInNewContext(compiled, scope)
+  const { createRecoverySession, RECOVERY_CONTEXT_KEY: key, RECOVERY_LIFETIME_MS: lifetime } = scope.exports
+  let listener
+  let activeSession = session()
+  const verifiedTokens = new Map()
+  const claimCalls = []
+  const userCalls = []
+  function remember(value, claims = {}) {
+    if (value) verifiedTokens.set(value.access_token, {
+      user: value.user,
+      claims: { session_id: value.access_token.replace('-refreshed', ''), sub: value.user.id,
+        amr: [{ method: value.access_token.startsWith('ordinary') ? 'password' : 'recovery', timestamp: 1000 }], ...claims },
+    })
+  }
+  remember(activeSession)
+  let callback = false
+  let userError = null
+  let claimsError = null
+  let updates = 0
+  let updateImpl = async () => ({ error: null })
+  let userImpl
+  let status = 'checking'
+  const auth = {
+    onAuthStateChange(fn) { listener = fn; return { data: { subscription: { unsubscribe() { listener = null } } } } },
+    async getSession() { return { data: { session: activeSession }, error: null } },
+    async getClaims(token) {
+      claimCalls.push(token)
+      return { data: { claims: verifiedTokens.get(token)?.claims }, error: claimsError }
+    },
+    async getUser(token) {
+      userCalls.push(token)
+      return userImpl ? userImpl(token) : { data: { user: verifiedTokens.get(token)?.user }, error: userError }
+    },
+    async updateUser() { updates++; return updateImpl() },
+  }
+  const storage = {
+    getItem: (name) => sharedStorage.get(name) ?? null,
+    setItem: (name, value) => sharedStorage.set(name, value),
+    removeItem: (name) => sharedStorage.delete(name),
+  }
+  const controller = createRecoverySession({ auth, storage, hasCallback: () => callback, onStatus: (value) => { status = value } })
+  async function flush() {
+    for (let i = 0; i < 40; i++) {
+      for (const [id, timer] of timers) {
+        if (timer.at <= now) { timers.delete(id); timer.fn() }
+      }
+      await Promise.resolve()
+    }
+  }
+  return {
+    controller, sharedStorage, key, lifetime, storage, flush, claimCalls, userCalls,
+    get status() { return status }, get updates() { return updates },
+    marker() { return JSON.parse(sharedStorage.get(key) ?? 'null') },
+    emit(event, value = activeSession) { listener?.(event, value) },
+    setSession(value, claims) { activeSession = value; remember(value, claims) },
+    setCallback(value) { callback = value },
+    failUser() { userError = { code: 'session_not_found' } },
+    failClaims() { claimsError = { code: 'invalid_jwt' } },
+    delayUser(fn) { userImpl = fn },
+    update(fn) { updateImpl = fn },
+    async advance(ms) { now += ms; await flush() },
+  }
+}
+
+async function ready(h) {
+  h.emit('PASSWORD_RECOVERY')
+  await h.flush()
+  assert.equal(h.status, 'ready')
+}
+
+test('ordinary authenticated and signed-out direct access stay unavailable', async () => {
+  for (const value of [session('ordinary-session'), null]) {
+    const h = harness(); h.setSession(value); h.emit('INITIAL_SESSION'); await h.flush()
+    assert.equal(h.status, 'unavailable'); assert.equal(h.marker(), null)
+  }
+})
+test('verified recovery persists only identity, session binding, and bounded expiry', async () => {
+  const h = harness(); await ready(h)
+  assert.deepEqual(Object.keys(h.marker()).sort(), ['expiresAt', 'sessionId', 'userId'])
+  assert.equal(h.marker().expiresAt, 1_000_000 + h.lifetime)
+})
+test('refresh restores the established recovery session', async () => {
+  const first = harness(); await ready(first); first.controller.dispose()
+  const next = harness(first.sharedStorage); next.emit('INITIAL_SESSION'); await next.flush()
+  assert.equal(next.status, 'ready')
+})
+test('callback replay cannot use an existing marker', async () => {
+  const first = harness(); await ready(first); first.controller.dispose()
+  const next = harness(first.sharedStorage); next.setCallback(true)
+  next.emit('INITIAL_SESSION'); await next.flush()
+  assert.equal(next.status, 'unavailable'); assert.equal(next.marker(), null)
+})
+test('another profile without recovery context fails closed', async () => {
+  const h = harness(); h.setCallback(true); h.emit('SIGNED_IN'); await h.flush()
+  assert.equal(h.status, 'unavailable')
+})
+test('new ordinary session for the same user cannot reuse the marker', async () => {
+  const h = harness(); await ready(h); h.setSession(session('ordinary-session'))
+  h.emit('SIGNED_IN'); assert.notEqual(h.status, 'ready'); await h.flush()
+  assert.equal(h.status, 'unavailable'); assert.equal(h.marker(), null)
+})
+test('user mismatch revokes ready synchronously', async () => {
+  const h = harness(); await ready(h); h.setSession(session('other-session', 'user-b'))
+  h.emit('TOKEN_REFRESHED'); assert.equal(h.status, 'unavailable'); await h.flush()
+  assert.equal(h.marker(), null)
+})
+test('SIGNED_OUT and missing auth session revoke ready synchronously', async () => {
+  for (const event of ['SIGNED_OUT', 'TOKEN_REFRESHED', 'INITIAL_SESSION']) {
+    const h = harness(); await ready(h); h.setSession(null); h.emit(event)
+    assert.equal(h.status, 'unavailable'); assert.equal(h.marker(), null)
+  }
+})
+test('token refresh retains binding without extending expiry', async () => {
+  const h = harness(); await ready(h); const expiry = h.marker().expiresAt
+  await h.advance(1000); h.setSession(session('recovery-session-refreshed'))
+  h.emit('TOKEN_REFRESHED'); await h.flush()
+  assert.equal(h.status, 'ready'); assert.equal(h.marker().expiresAt, expiry)
+})
+test('a user update in another tab revokes recovery eligibility', async () => {
+  const h = harness(); await ready(h); h.emit('USER_UPDATED')
+  assert.equal(h.status, 'unavailable'); assert.equal(h.marker(), null)
+})
+test('duplicate recovery notifications do not extend expiry', async () => {
+  const h = harness(); await ready(h); const expiry = h.marker().expiresAt
+  await h.advance(1000); h.emit('PASSWORD_RECOVERY'); await h.flush()
+  assert.equal(h.marker().expiresAt, expiry)
+})
+test('expiry revokes an open form and removes persisted context', async () => {
+  const h = harness(); await ready(h); await h.advance(h.lifetime)
+  assert.equal(h.status, 'unavailable'); assert.equal(h.marker(), null)
+})
+test('expired, malformed and excessively long-lived records fail closed', async () => {
+  for (const value of ['invalid-json', '{}', JSON.stringify({ userId: 'user-a', sessionId: 'recovery-session', expiresAt: 0 }),
+    JSON.stringify({ userId: 'user-a', sessionId: 'recovery-session', expiresAt: 9e15 })]) {
+    const h = harness(); h.sharedStorage.set(h.key, value); h.emit('INITIAL_SESSION'); await h.flush()
+    assert.equal(h.status, 'unavailable'); assert.equal(h.marker(), null)
+  }
+})
+test('claims and provider user validation are both mandatory', async () => {
+  for (const failure of ['failClaims', 'failUser']) {
+    const h = harness(); h[failure](); h.emit('PASSWORD_RECOVERY'); await h.flush()
+    assert.equal(h.status, 'unavailable'); assert.equal(h.marker(), null)
+  }
+})
+test('late validation cannot resurrect ready after logout', async () => {
+  const h = harness(); let resolve
+  h.delayUser(() => new Promise((done) => { resolve = done }))
+  h.emit('PASSWORD_RECOVERY'); await h.flush()
+  h.setSession(null); h.emit('SIGNED_OUT'); resolve({ data: { user: { id: 'user-a' } }, error: null })
+  await h.flush(); assert.equal(h.status, 'unavailable'); assert.equal(h.marker(), null)
+})
+test('INITIAL_SESSION does not discard an in-flight recovery event', async () => {
+  const h = harness(); h.emit('PASSWORD_RECOVERY'); h.emit('INITIAL_SESSION'); await h.flush()
+  assert.equal(h.status, 'ready')
+})
+test('initialization and provider validation have bounded UI waiting', async () => {
+  const h = harness(); await h.advance(10_000); assert.equal(h.status, 'unavailable')
+  const next = harness(); next.delayUser(() => new Promise(() => {}))
+  next.emit('PASSWORD_RECOVERY'); await next.flush(); await next.advance(10_000)
+  assert.equal(next.status, 'unavailable')
+})
+test('successful update clears eligibility and cannot be submitted twice', async () => {
+  const h = harness(); await ready(h)
+  h.update(async () => { h.emit('USER_UPDATED'); return { error: null } })
+  assert.equal(await h.controller.submit('test-password'), 'success')
+  assert.equal(h.marker(), null); assert.equal(h.status, 'unavailable')
+  assert.equal(await h.controller.submit('test-password'), 'unavailable'); assert.equal(h.updates, 1)
+})
+test('session loss before submit blocks updateUser entirely', async () => {
+  const h = harness(); await ready(h); h.setSession(null)
+  assert.equal(await h.controller.submit('test-password'), 'unavailable')
+  assert.equal(h.updates, 0); assert.equal(h.status, 'unavailable')
+})
+test('provider update failure keeps generic failure only while authorization remains valid', async () => {
+  const h = harness(); await ready(h); h.update(async () => ({ error: { status: 500 } }))
+  assert.equal(await h.controller.submit('test-password'), 'failed'); assert.equal(h.status, 'ready')
+  h.update(async () => { h.setSession(null); return { error: { status: 401 } } })
+  assert.equal(await h.controller.submit('test-password'), 'unavailable'); assert.equal(h.marker(), null)
+})
+test('storage denial fails closed without persisting a marker', async () => {
+  const h = harness(); h.storage.setItem = () => { throw new Error('storage denied') }
+  h.emit('PASSWORD_RECOVERY'); await h.flush()
+  assert.equal(h.status, 'unavailable'); assert.equal(h.marker(), null)
+})
+test('silent session loss is detected by revalidation', async () => {
+  const h = harness(); await ready(h); h.setSession(null); h.controller.recheck(); await h.flush()
+  assert.equal(h.status, 'unavailable'); assert.equal(h.marker(), null)
+})
+test('late successful update after sign-out cannot restore the form or navigate', async () => {
+  const h = harness(); await ready(h); let resolve
+  h.update(() => new Promise((done) => { resolve = done }))
+  const result = h.controller.submit('test-password'); await h.flush()
+  h.setSession(null); h.emit('SIGNED_OUT'); resolve({ error: null })
+  assert.equal(await result, 'unavailable'); assert.equal(h.marker(), null)
+})
+test('a stalled password update cannot leave an actionable form indefinitely', async () => {
+  const h = harness(); await ready(h); let resolve
+  h.update(() => new Promise((done) => { resolve = done }))
+  const result = h.controller.submit('test-password'); await h.flush(); await h.advance(10_000)
+  assert.equal(h.status, 'unavailable'); resolve({ error: null })
+  assert.equal(await result, 'unavailable')
+})
+
+test('PASSWORD_RECOVERY rejects absent, malformed, and every non-recovery AMR', async () => {
+  for (const amr of [undefined, null, [], ['recovery'], [null], [{ method: 'otp' }],
+    [{ method: 'magiclink' }], [{ method: 'password' }], [{ method: 'email' }], [{ method: 'other' }]]) {
+    const h = harness(); h.setSession(session(), { amr }); h.emit('PASSWORD_RECOVERY'); await h.flush()
+    assert.equal(h.status, 'unavailable'); assert.equal(h.marker(), null)
+  }
+})
+test('recovery AMR may coexist with other authentication methods', async () => {
+  const h = harness(); h.setSession(session(), { amr: [{ method: 'password' }, { method: 'recovery' }] })
+  await ready(h)
+})
+test('forged matching marker cannot restore ordinary password session', async () => {
+  const h = harness(); h.setSession(session('ordinary-session'))
+  h.sharedStorage.set(h.key, JSON.stringify({ userId: 'user-a', sessionId: 'ordinary-session', expiresAt: 1_100_000 }))
+  h.emit('INITIAL_SESSION'); await h.flush()
+  assert.equal(h.status, 'unavailable'); assert.equal(h.marker(), null)
+})
+test('restoration requires matching verified user, session ID, and recovery AMR', async () => {
+  for (const [value, claims] of [[session('different-session'), {}], [session('recovery-session', 'user-b'), {}],
+    [session(), { amr: [{ method: 'password' }] }]]) {
+    const first = harness(); await ready(first); first.controller.dispose()
+    const next = harness(first.sharedStorage); next.setSession(value, claims); next.emit('INITIAL_SESSION'); await next.flush()
+    assert.equal(next.status, 'unavailable'); assert.equal(next.marker(), null)
+  }
+})
+test('TOKEN_REFRESHED rejects changed session identity or missing recovery AMR', async () => {
+  for (const claims of [{ session_id: 'different-session' }, { amr: [{ method: 'otp' }] }]) {
+    const h = harness(); await ready(h); h.setSession(session('recovery-session-refreshed'), claims)
+    h.emit('TOKEN_REFRESHED'); await h.flush()
+    assert.equal(h.status, 'unavailable'); assert.equal(h.marker(), null)
+  }
+})
+test('pending recovery event accepts a rotated token with verified identity continuity', async () => {
+  const h = harness(); h.emit('PASSWORD_RECOVERY')
+  h.setSession(session('recovery-session-refreshed')); h.emit('TOKEN_REFRESHED'); await h.flush()
+  assert.equal(h.status, 'ready')
+  for (const token of ['recovery-session', 'recovery-session-refreshed']) {
+    assert.ok(h.claimCalls.includes(token)); assert.ok(h.userCalls.includes(token))
+  }
+})
+test('pending recovery event cannot authorize a different verified recovery session', async () => {
+  const h = harness(); h.emit('PASSWORD_RECOVERY'); h.setSession(session('different-session')); await h.flush()
+  assert.equal(h.status, 'unavailable'); assert.equal(h.marker(), null)
+})
+test('rotation during validation verifies latest claims and user without extending expiry', async () => {
+  const h = harness(); await ready(h); const expiry = h.marker().expiresAt; let resolve
+  h.delayUser(() => new Promise((done) => { resolve = done }))
+  h.controller.recheck(); await h.flush()
+  h.setSession(session('recovery-session-refreshed')); h.delayUser(undefined)
+  resolve({ data: { user: { id: 'user-a' } }, error: null }); await h.flush()
+  assert.equal(h.status, 'ready'); assert.equal(h.marker().expiresAt, expiry)
+  assert.ok(h.claimCalls.includes('recovery-session-refreshed'))
+  assert.ok(h.userCalls.includes('recovery-session-refreshed'))
+})
+test('rotation during validation rejects identity changes, missing AMR, or verification failure', async () => {
+  for (const scenario of ['user', 'session', 'amr', 'claims-error', 'user-error']) {
+    const h = harness(); await ready(h); let resolve
+    h.delayUser(() => new Promise((done) => { resolve = done })); h.controller.recheck(); await h.flush()
+    h.setSession(session('recovery-session-refreshed', scenario === 'user' ? 'user-b' : 'user-a'),
+      scenario === 'session' ? { session_id: 'different-session' } : scenario === 'amr' ? { amr: [] } : {})
+    h.delayUser(undefined)
+    if (scenario === 'claims-error') h.failClaims()
+    if (scenario === 'user-error') h.failUser()
+    resolve({ data: { user: { id: 'user-a' } }, error: null }); await h.flush()
+    assert.equal(h.status, 'unavailable'); assert.equal(h.marker(), null)
+  }
+})
+test('logout while latest rotated token is being verified cannot resurrect ready', async () => {
+  const h = harness(); await ready(h); let resolve
+  h.delayUser((token) => {
+    if (token === 'recovery-session') {
+      h.setSession(session('recovery-session-refreshed'))
+      return { data: { user: { id: 'user-a' } }, error: null }
+    }
+    return new Promise((done) => { resolve = done })
+  })
+  h.controller.recheck(); await h.flush()
+  assert.equal(typeof resolve, 'function')
+  h.setSession(null); h.emit('SIGNED_OUT'); resolve({ data: { user: { id: 'user-a' } }, error: null })
+  await h.flush(); assert.equal(h.status, 'unavailable'); assert.equal(h.marker(), null)
+})
~~~

## 12. Risks, limitations and technical debt

- Live Chrome recovery passed the hardened AMR check; arbitrary custom-hook configurations and the full browser matrix are not asserted tested. Strict recovery AMR fails closed if absent.
- User-supplied runtime acceptance passed refresh, consumed-link replay rejection, cross-browser rejection and same-profile cross-tab logout. The brief 1–2 second Check your email refresh flicker is minor deferred UX polish, not a security issue or functional blocker.
- SDK BroadcastChannel events revoke immediately when delivered. Suspended pages/channel availability affect delivery; silent server-side revocation is found at the next retained check or submission. No periodic polling remains.
- sessionStorage is client controlled and tab scoped, with browser opener/duplicate-tab copying behavior possible. Local expiry is continuity, not server-enforced one-use authorization. Verified AMR proves session authentication history, not reset-link freshness or consumption.
- Verifying an older pending-event token can fail closed if it has already expired. No unsafe fallback to unverified claims is added.
- getClaims can use provider verification fallback; explicit getUser remains mandatory. Removing periodic polling removes its repeated background calls, not event-driven requests.
- A provider mutation may complete after the UI deadline, although stale completions cannot restore ready/navigation.

## 13. Untouched-module confirmation

During implementation, only the five authorized paths changed. The subsequent 2026-09-27 documentation update changes only these two reports and CURRENT_STATE.md, STAGE_LOG.md, DEFERRED_FIXES.md and DECISIONS_AND_RISKS.md under docs/04_Project_Memory; application code and tests are untouched. No dependency, configuration, styling, auth provider setup, middleware, database, API or other product module edits. No real credentials or environment values were displayed. No live browser/provider actions were performed by the assistant in this documentation update. The user has supplied completed live email, password reset and browser acceptance results, recorded below.

## 14. Approval required

Browser runtime acceptance is COMPLETE — PASS. Documentation review and any Git checkpoint remain separate: no staging, commit, push or next sprint is authorized by this report. Prior TypeScript, 34-test and 22/22-page build PASS results are historical evidence; none were rerun for this documentation update.


## AUTH_RECOVERY_01 — Verified Browser Runtime Acceptance

Recorded: 2026-09-27. Status: COMPLETE — PASS. Evidence: verified runtime results supplied by the user; no browser tests, TypeScript, regression tests or production build rerun during this documentation update. Successful acceptance browser: Chrome normal profile.

| Check | Verified result | Status |
| --- | --- | --- |
| Fresh recovery | Request in Chrome normal profile; email received; link opened promptly in the same profile; Create a new password form opened. Confirms the deployed live recovery session satisfies the hardened recovery-AMR validation. | PASS |
| Refresh continuity | Ctrl+R before submission briefly showed Check your email for 1–2 seconds, then restored the usable recovery form. | PASS |
| Reset happy path | New password submitted; reset success / password updated / Continue to dashboard screen appeared; Dashboard opened. | PASS |
| Same-profile cross-tab logout | Fresh recovery form open; Dashboard opened in a second Chrome tab; Logout made the recovery tab non-actionable and returned it to Forgot Password state. Stale recovery form issue resolved. | PASS |
| Signed-out direct access | Direct /reset-password showed Reset link unavailable. | PASS |
| Ordinary authenticated direct access | Normal login with new password followed by direct /reset-password showed Reset link unavailable. | PASS |
| Old password | Rejected after reset. | PASS |
| New password | Accepted after reset; Dashboard opened. | PASS |
| Consumed recovery link replay | Reusing the successful recovery email link showed Reset link unavailable. | PASS |
| Different browser/profile boundary | Recovery initiated in Edge; email link opened in Chrome; Reset link unavailable. | PASS — expected fail-closed behavior |

Earlier unavailable results arose because Outlook opened the email link in default-browser Chrome after recovery was initiated in Edge. These are expected different-browser/profile PKCE failures, not implementation failures.

Minor deferred UX note: Ctrl+R on a valid recovery form can briefly show Check your email for 1–2 seconds before restoring the form. This is not a security issue or functional blocker. Do not fix during AUTH_RECOVERY_01 closure without separate approval.

### Final recovery architecture

- Preserve Supabase automatic PKCE flow; no manual exchangeCodeForSession().
- Recovery eligibility requires a verified Supabase session, verified user, verified JWT session_id, verified AMR entry with method exactly "recovery", and bounded tab-scoped sessionStorage workflow continuity. The verified PASSWORD_RECOVERY establishment path creates the marker; refresh restoration requires that valid marker.
- Marker alone is never authorization. It stores only userId, sessionId, expiresAt; no credentials, raw JWT or AMR payload.
- The 15-minute local continuity window is fixed and not renewed by refresh or token rotation.
- TOKEN_REFRESHED uses verified user/session identity and recovery AMR, not access-token string equality as an identity requirement.
- SIGNED_OUT/session loss revokes eligibility. No periodic 15-second polling; retain auth events, focus/pageshow/visibility, pre-submit validation and bounded timers.
- Direct reset access and different-browser/profile PKCE recovery remain fail-closed by design.
