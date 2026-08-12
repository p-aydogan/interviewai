# Sprint A3.6 Engineering Report

## 1. Report Identity

- Sprint: A3.6
- Gate: Gate 2
- Title: Real Password Recovery Integration
- Branch: `feature/auth-foundation`
- Starting HEAD: `eaa1945 feat(auth): implement password reset success screen`
- Status: **IMPLEMENTATION COMPLETE — REAL PROVIDER ACCEPTANCE PASSED — FINAL REGRESSION PASSED — AWAITING USER APPROVAL AND LOCAL COMMIT**
- Date: 2026-08-12

## 2. Objective and Boundaries

Gate 2 implements a bounded client-only Supabase password-recovery flow. It connects Forgot Password to `resetPasswordForEmail`, authorizes Reset Password only through `PASSWORD_RECOVERY` plus successful `getUser()`, executes `updateUser({ password })`, and navigates to the existing success route only after provider-confirmed mutation success.

The implementation does not introduce middleware, `createServerClient`, server auth, callback routes, token-hash routes, manual URL token handling, package changes, CSS changes, dashboard protection, or changes to unrelated auth screens.

No development server or real remote auth operation was executed during the implementation and static-validation steps. Controlled real-provider acceptance was performed afterward and is recorded in this final report.

## 3. Repository State Before Implementation

```text
git branch --show-current
feature/auth-foundation

git status --short
[no output]

git log -1 --oneline
eaa1945 feat(auth): implement password reset success screen
```

The required branch, HEAD, commit message, and clean working tree all matched before editing.

## 4. Gate 1 Architecture Result

Gate 1 classified the repository as **D. Mixed/inconsistent Supabase architecture**. It found one active client-side `createBrowserClient` path, no server client, no auth middleware, no callback infrastructure, and a mix of real legacy `/login` auth with local-only A3.x auth screens.

Gate 1 approved one optimal recovery path: remain client-only, use the existing `lib/supabase.ts` factory unchanged, require `PASSWORD_RECOVERY`, validate the returned user through `getUser()`, fail closed otherwise, and stop if resumed-project testing proves this browser-client path unreliable.

## 5. Remote Preconditions

The user confirmed these settings were manually verified before Gate 2:

- Supabase project Healthy.
- Email provider enabled.
- Confirm email enabled.
- Custom SMTP enabled through Resend.
- Resend sending domain verified.
- `http://localhost:3000/reset-password` allow-listed.
- Production `/reset-password` URL allow-listed.
- Reset Password template uses `{{ .ConfirmationURL }}`.
- Resend click/open tracking rewriting disabled.

No remote setting was queried or changed by this implementation.

## 6. Architecture Decision

The recovery integration remains bounded and client-only:

1. Forgot Password uses one stable instance from the existing browser factory.
2. Recovery redirect is the trusted current origin plus fixed `/reset-password`.
3. The browser Supabase client owns callback URL detection and exchange.
4. `PasswordRecoveryFlow` subscribes locally to auth events.
5. Only `PASSWORD_RECOVERY` records recovery authorization.
6. A separate effect validates the user with `getUser()`.
7. `ResetPasswordForm` renders only after both gates pass.
8. The controller calls `updateUser` and navigates only after success.

No session or token is parsed, copied, logged, stored, or exposed by application code.

## 7. Exact File Scope and Responsibilities

### Modified

- `components/auth/ForgotPasswordForm.tsx`: sends the real recovery request, controls pending/error/acknowledgment UI, and constructs the fixed redirect.
- `components/auth/ResetPasswordForm.tsx`: retains local password rules while exposing the typed provider-submit contract and pending/error presentation.
- `app/reset-password/page.tsx`: preserves centered `AuthShell` and replaces unconditional form exposure with `PasswordRecoveryFlow`.
- `lib/auth/auth-constants.ts`: adds `resetPasswordSuccess: '/reset-password/success'`.

### Created

- `components/auth/PasswordRecoveryFlow.tsx`: owns recovery-event validation, user validation, mutation, invalid-state handling, and provider-confirmed success navigation.
- `docs/01_Engineering/Sprint_A3.6_Summary.md`: concise Gate 2 acceptance record.
- `docs/01_Engineering/Sprint_A3.6_Engineering_Report.md`: complete implementation and validation record.

## 8. Forgot Password Implementation

`ForgotPasswordForm` preserves its existing local regex, trim behavior, blur-gated invalid-email message, semantic labels, card, and responsive classes.

The component creates one stable client with lazy React state initialization. Valid submission prevents default, rejects duplicate pending work, trims the email, and constructs:

```ts
new URL(AUTH_ROUTES.resetPassword, window.location.origin).toString()
```

It then calls:

```ts
supabase.auth.resetPasswordForEmail(trimmedEmail, { redirectTo })
```

No user/query-provided redirect is read. The screen does not navigate after sending; the provider email is the only path to the recovery page.

## 9. Account-Enumeration and Error Mitigation

Success renders:

- Heading: `Check your email`
- Message: `If an account exists for this email address, we've sent a password reset link.`
- Action: `Back to Sign In` → `/login`

Neither success nor failure exposes account existence. Provider-returned errors and thrown failures are normalized to:

```text
We couldn't send the reset link. Please try again.
```

The UI does not display raw provider messages, codes, IDs, users, sessions, or tokens.

## 10. PasswordRecoveryFlow State Model

Primary state:

| State | Meaning | Rendered result |
|---|---|---|
| `checking` | Supabase auth initialization or recovery-user validation is unresolved | Neutral `Checking reset link` card |
| `ready` | `PASSWORD_RECOVERY` observed and `getUser()` returned a valid user | Operational `ResetPasswordForm` |
| `unavailable` | Direct, ordinary-session, invalid, expired, or failed recovery context | Non-operational unavailable card |

Provider mutation state is separately represented by `providerPending` and `providerError` so recovery authorization is not conflated with update progress.

## 11. PASSWORD_RECOVERY Listener and Cleanup

The controller creates one stable browser client and registers a component-local `onAuthStateChange` listener.

- `PASSWORD_RECOVERY` sets both a ref and state flag, then begins controlled user validation.
- `INITIAL_SESSION` and `SIGNED_IN` without the recovery flag resolve to unavailable and never authorize reset.
- An ordinary pre-existing session is insufficient.
- Provider work is not awaited inside the auth callback.
- Cleanup calls `subscription.unsubscribe()`.
- No global listener was introduced.

## 12. getUser Validation

After the recovery event flag changes, a separate effect calls `supabase.auth.getUser()`.

The form becomes ready only when:

- recovery was observed;
- `getUser()` completed without error;
- a non-null user was returned.

The effect uses an active flag so a late result cannot update an unmounted controller. The user object is never logged or rendered.

## 13. ResetPasswordForm Contract

The added interface is:

```ts
export interface ResetPasswordFormProps {
  onPasswordSubmit: (password: string) => Promise<void>
  providerError?: string
  providerPending: boolean
}
```

The form continues owning password, confirmation, visibility, blur, password-rule, and match state. It passes only the validated new password string to the parent. It never passes the DOM event or duplicates recovery/session logic.

The callback is invoked only when required rules pass, passwords match, and provider work is not already pending.

## 14. Real updateUser Mutation

`PasswordRecoveryFlow` owns:

```ts
supabase.auth.updateUser({ password })
```

The controller rechecks `status === 'ready'` and `providerPending === false` before calling it. During mutation, inputs, visibility controls, and the action are disabled without clearing values. Failure preserves the form and normalizes the message to:

```text
We couldn't update your password. Please try again.
```

Only a provider response without error triggers:

```ts
router.replace(AUTH_ROUTES.resetPasswordSuccess)
```

No optimistic success, fake timeout, or premature navigation exists.

## 15. Invalid, Direct, and Expired Access

`/reset-password` no longer renders an operational form unconditionally. A direct route visit, ordinary session, failed validation, invalid callback, or expired context renders:

- Heading: `Reset link unavailable`
- Description: `This password reset link is invalid or has expired. Request a new link to continue.`
- Action: `Request a new reset link` → `/forgot-password`

The page-level back action was removed within `app/reset-password/page.tsx`; invalid-state recovery is provided by the explicit semantic action. `AuthShell`, centered layout, background, language control, and responsive behavior remain unchanged.

## 16. Accessibility

- Existing visible form labels and password visibility aria-labels remain.
- Password mismatch retains `aria-invalid` and `aria-describedby`.
- Provider errors use existing error styling, IDs, `aria-describedby`, and `role="alert"`.
- Checking/unavailable cards use `aria-live="polite"`.
- All actions remain semantic buttons or links.
- Native disabled state prevents duplicate pending actions.
- Pending meaning is explicit through `Sending reset link...` and `Updating password...`.
- Existing focus-visible behavior and minimum control sizing are reused.
- No click-only element or focus trap was introduced.

## 17. Styling and Token Usage

No CSS, design-token, inline-style, Tailwind, or styled-jsx change was made.

The new states reuse existing `TalentryCard`, `SectionHeader`, Talentry button classes, auth error classes, compact empty-state classes, centered `AuthShell`, and responsive card sizing.

## 18. Technical Validation

### TypeScript

```text
Command: npx.cmd tsc --noEmit --incremental false
Exit code: 0
Output: none
Result: Passed
```

### Production build

```text
Command: npm.cmd run build
Exit code: 0

Next.js 14.2.5
Compiled successfully
Linting and checking validity of types passed
Generating static pages: 16/16

/forgot-password         2.42 kB  163 kB First Load JS
/reset-password          3.52 kB  164 kB First Load JS
/reset-password/success  740 B    94.7 kB First Load JS
```

Result: Passed. All required recovery routes remain present and no unresolved error was reported.

These final cleanup checks passed after all temporary diagnostic instrumentation was removed. The development server was not started by the cleanup step, and no real Supabase operation was executed during static validation.

### Diff check

```text
Command: git diff --check
Exit code: 0
Result: Passed; no whitespace errors
```

Existing LF→CRLF notices for tracked A3.6 files are informational working-tree warnings, not TypeScript, build, or whitespace failures.

## 19. Real Provider Acceptance

Final controlled real-provider recovery chain: **PASS**.

```text
resetPasswordForEmail
→ recovery email delivered
→ recovery link opened in the same Edge profile/device
→ PKCE verifier available
→ PASSWORD_RECOVERY observed
→ callback code consumed
→ PKCE verifier consumed
→ getUser() succeeded
→ ResetPasswordForm became ready
→ mismatch validation tested and passed
→ matching valid password enabled Reset password
→ updateUser({ password })
→ USER_UPDATED observed
→ update succeeded
→ /reset-password/success rendered
```

No email address, callback code, PKCE verifier, token, session, user data, SMTP credential, API key, or environment value is included in this record.

## 20. First Failed Attempt and Diagnostic History

The first genuine recovery attempt delivered a recovery email and reached `/reset-password` with a callback code. `PASSWORD_RECOVERY` was not observed, the callback code remained present after initialization, and the UI correctly failed closed as `Reset link unavailable`. No password update was attempted.

Temporary diagnostic instrumentation was added only to distinguish callback-code presence, PKCE-verifier presence, auth event names, and local state transitions. It established that `resetPasswordForEmail` creates and persists the expected PKCE verifier. On a later fresh controlled attempt, the verifier reached the callback page, successful exchange consumed both the callback code and verifier, `PASSWORD_RECOVERY` was emitted, `getUser()` succeeded, and the recovery flow completed normally.

The exact cause of the first failure was not conclusively proven. It is not classified as a confirmed application race, Supabase bug, or package defect. The later test proves that the approved client-only architecture can complete a genuine recovery flow under the tested same-browser/profile conditions. No package upgrade or callback/server architecture was required.

## 21. Temporary Diagnostic Cleanup

All temporary diagnostic instrumentation was removed before final acceptance. Final production code contains:

- zero `[A3.6 recovery diagnostic]` strings or logs;
- zero PKCE-verifier inspection helpers;
- zero callback-code presence helpers;
- zero diagnostic auth-event or state-transition console instrumentation.

The cleanup preserved the stable client, recovery event subscription, `PASSWORD_RECOVERY` requirement, `getUser()` gate, ordinary-session rejection, mutation behavior, success navigation, and subscription cleanup.

## 22. Final Browser Regression

### A. `/forgot-password` desktop initial view — PASS

- Correct password-reset-link copy rendered.
- `Send reset link` CTA rendered.
- Approved layout remained intact.
- No diagnostic UI regression was observed.

### B. Direct `/reset-password` access — PASS

- The operational password form did not open.
- `Reset link unavailable` rendered.
- `Request a new reset link` CTA rendered.
- Fail-closed behavior remained intact.

### C. `/reset-password/success` — PASS

- `Password updated` screen rendered.
- `Continue to dashboard` CTA rendered.
- Approved layout remained intact.

### D. Continue to dashboard — PASS

The CTA navigated successfully to `/dashboard`. This verifies only the A3.6 success-route navigation destination; it does not claim that dashboard functionality passed acceptance.

## 23. Final Security Decisions

- `PASSWORD_RECOVERY` remains mandatory.
- Successful `getUser()` remains mandatory after the recovery event.
- `INITIAL_SESSION`, `SIGNED_IN`, and an ordinary persisted session are insufficient reset authorization.
- Fail-closed direct access is intentional.
- Account-enumeration-safe Forgot Password acknowledgement is intentional.
- Application code does not persist auth tokens or recovery secrets.
- Callback-code presence never authorizes recovery.
- No token parsing, manual `exchangeCodeForSession`, application recovery flag, middleware, callback route, or server Supabase client was added.
- No package upgrade was required.
- Temporary diagnostic instrumentation was fully removed.
- Dashboard implementation remains a separate boundary.

## 24. Complete Implementation Diffs

### `lib/auth/auth-constants.ts`

```diff
@@
   forgotPassword: '/forgot-password',
   verifyCode: '/verify-code',
   resetPassword: '/reset-password',
+  resetPasswordSuccess: '/reset-password/success',
   dashboard: '/dashboard',
```

### `app/reset-password/page.tsx`

```diff
@@
 import AuthShell from '@/components/auth/AuthShell'
-import ResetPasswordForm from '@/components/auth/ResetPasswordForm'
-import { AUTH_ROUTES } from '@/lib/auth/auth-constants'
+import PasswordRecoveryFlow from '@/components/auth/PasswordRecoveryFlow'

 export default function ResetPasswordPage() {
   return (
-    <AuthShell
-      backHref={AUTH_ROUTES.forgotPassword}
-      backLabel="Back to Forgot Password"
-      centered
-    >
-      <ResetPasswordForm />
+    <AuthShell centered>
+      <PasswordRecoveryFlow />
     </AuthShell>
   )
 }
```

### `components/auth/ForgotPasswordForm.tsx`

```diff
@@
 'use client'

+import Link from 'next/link'
 import { useState } from 'react'
 import type { FormEvent } from 'react'

 import { SectionHeader, TalentryButton, TalentryCard } from '@/components/ui'
+import { AUTH_ROUTES } from '@/lib/auth/auth-constants'
+import { createClient } from '@/lib/supabase'

 const EMAIL_ERROR_ID = 'forgot-password-email-error'
+const PROVIDER_ERROR_ID = 'forgot-password-provider-error'
 const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
@@
 export default function ForgotPasswordForm() {
+  const [supabase] = useState(createClient)
   const [email, setEmail] = useState('')
   const [emailWasBlurred, setEmailWasBlurred] = useState(false)
+  const [isPending, setIsPending] = useState(false)
+  const [requestSent, setRequestSent] = useState(false)
+  const [providerError, setProviderError] = useState('')
@@
-  function handleSubmit(event: FormEvent<HTMLFormElement>) {
+  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
     event.preventDefault()
+
+    if (!emailIsValid || isPending) return
+
+    setIsPending(true)
+    setProviderError('')
+
+    try {
+      const redirectTo = new URL(AUTH_ROUTES.resetPassword, window.location.origin).toString()
+      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, { redirectTo })
+
+      if (error) {
+        setProviderError("We couldn't send the reset link. Please try again.")
+        return
+      }
+
+      setRequestSent(true)
+    } catch {
+      setProviderError("We couldn't send the reset link. Please try again.")
+    } finally {
+      setIsPending(false)
+    }
+  }
+
+  if (requestSent) {
+    return (
+      <TalentryCard
+        className="talentry-create-account talentry-forgot-password-card talentry-empty-state talentry-empty-state--compact"
+        padding="standard"
+      >
+        <SectionHeader
+          description={
+            <>
+              If an account exists for this email address,
+              <br />
+              we&apos;ve sent a password reset link.
+            </>
+          }
+          headingAs="h1"
+          title="Check your email"
+        />
+        <div className="talentry-empty-state__action">
+          <Link
+            className="talentry-button talentry-button--primary talentry-button--large"
+            href={AUTH_ROUTES.login}
+          >
+            <span className="talentry-button__content">Back to Sign In</span>
+          </Link>
+        </div>
+      </TalentryCard>
+    )
   }
@@
-        description="Enter the email associated with your account and we’ll send you a verification code."
+        description="Enter the email associated with your account and we’ll send you a password reset link."
@@
-      <form className="talentry-create-account__form" noValidate onSubmit={handleSubmit}>
+      <form
+        aria-describedby={providerError ? PROVIDER_ERROR_ID : undefined}
+        className="talentry-create-account__form"
+        noValidate
+        onSubmit={handleSubmit}
+      >
@@
+        {providerError && (
+          <p
+            className="talentry-auth-field__message talentry-auth-field__message--error"
+            id={PROVIDER_ERROR_ID}
+            role="alert"
+          >
+            <span aria-hidden="true">!</span> {providerError}
+          </p>
+        )}

         <TalentryButton
           className="talentry-create-account__submit"
-          disabled={!emailIsValid}
+          disabled={!emailIsValid || isPending}
+          loading={isPending}
+          loadingText="Sending reset link..."
@@
-          <span>Send reset code</span>
+          <span>Send reset link</span>
```

### `components/auth/ResetPasswordForm.tsx`

```diff
@@
 const CONFIRM_PASSWORD_ERROR_ID = 'reset-password-confirm-error'
+const PROVIDER_ERROR_ID = 'reset-password-provider-error'

-export default function ResetPasswordForm() {
+export interface ResetPasswordFormProps {
+  onPasswordSubmit: (password: string) => Promise<void>
+  providerError?: string
+  providerPending: boolean
+}
+
+export default function ResetPasswordForm({
+  onPasswordSubmit,
+  providerError,
+  providerPending,
+}: ResetPasswordFormProps) {
@@
-  function handleSubmit(event: FormEvent<HTMLFormElement>) {
+  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
     event.preventDefault()
+    if (!passwordIsValid || !passwordsMatch || providerPending) return
+    await onPasswordSubmit(password)
   }
@@
-      <form className="talentry-create-account__form" noValidate onSubmit={handleSubmit}>
+      <form
+        aria-describedby={providerError ? PROVIDER_ERROR_ID : undefined}
+        className="talentry-create-account__form"
+        noValidate
+        onSubmit={handleSubmit}
+      >
@@
+              disabled={providerPending}
               id="reset-password-new"
@@
+              disabled={providerPending}
               onClick={() => setShowPassword((visible) => !visible)}
@@
+              disabled={providerPending}
               id="reset-password-confirm"
@@
+              disabled={providerPending}
               onClick={() => setShowConfirmPassword((visible) => !visible)}
@@
+        {providerError && (
+          <p
+            className="talentry-auth-field__message talentry-auth-field__message--error"
+            id={PROVIDER_ERROR_ID}
+            role="alert"
+          >
+            <span aria-hidden="true">!</span> {providerError}
+          </p>
+        )}

         <TalentryButton
           className="talentry-create-account__submit"
-          disabled={!passwordIsValid || !passwordsMatch}
+          disabled={!passwordIsValid || !passwordsMatch || providerPending}
+          loading={providerPending}
+          loadingText="Updating password..."
```

### `components/auth/PasswordRecoveryFlow.tsx`

```diff
@@ -0,0 +1,153 @@
+'use client'
+
+import Link from 'next/link'
+import { useRouter } from 'next/navigation'
+import { useEffect, useRef, useState } from 'react'
+import type { ReactNode } from 'react'
+
+import { SectionHeader, TalentryCard } from '@/components/ui'
+import { AUTH_ROUTES } from '@/lib/auth/auth-constants'
+import { createClient } from '@/lib/supabase'
+
+import ResetPasswordForm from './ResetPasswordForm'
+
+type RecoveryStatus = 'checking' | 'ready' | 'unavailable'
+
+interface RecoveryStateCardProps {
+  action?: ReactNode
+  description: ReactNode
+  title: string
+}
+
+function RecoveryStateCard({ action, description, title }: RecoveryStateCardProps) {
+  return (
+    <TalentryCard
+      aria-live="polite"
+      className="talentry-create-account talentry-forgot-password-card talentry-empty-state talentry-empty-state--compact"
+      padding="standard"
+    >
+      <SectionHeader description={description} headingAs="h1" title={title} />
+      {action && <div className="talentry-empty-state__action">{action}</div>}
+    </TalentryCard>
+  )
+}
+
+export default function PasswordRecoveryFlow() {
+  const router = useRouter()
+  const [supabase] = useState(createClient)
+  const [status, setStatus] = useState<RecoveryStatus>('checking')
+  const [recoveryObserved, setRecoveryObserved] = useState(false)
+  const [providerPending, setProviderPending] = useState(false)
+  const [providerError, setProviderError] = useState('')
+  const recoveryObservedRef = useRef(false)
+
+  useEffect(() => {
+    const {
+      data: { subscription },
+    } = supabase.auth.onAuthStateChange((event) => {
+      if (event === 'PASSWORD_RECOVERY') {
+        recoveryObservedRef.current = true
+        setRecoveryObserved(true)
+        setStatus('checking')
+        return
+      }
+
+      if (
+        !recoveryObservedRef.current &&
+        (event === 'INITIAL_SESSION' || event === 'SIGNED_IN')
+      ) {
+        setStatus('unavailable')
+      }
+    })
+
+    return () => subscription.unsubscribe()
+  }, [supabase])
+
+  useEffect(() => {
+    if (!recoveryObserved) return
+    let active = true
+
+    async function validateRecoveryUser() {
+      try {
+        const {
+          data: { user },
+          error,
+        } = await supabase.auth.getUser()
+
+        if (!active) return
+        if (!error && user) {
+          setStatus('ready')
+          return
+        }
+
+        setStatus('unavailable')
+      } catch {
+        if (active) {
+          setStatus('unavailable')
+        }
+      }
+    }
+
+    void validateRecoveryUser()
+    return () => {
+      active = false
+    }
+  }, [recoveryObserved, supabase])
+
+  async function handlePasswordSubmit(password: string) {
+    if (status !== 'ready' || providerPending) return
+    setProviderPending(true)
+    setProviderError('')
+
+    try {
+      const { error } = await supabase.auth.updateUser({ password })
+      if (error) {
+        setProviderError("We couldn't update your password. Please try again.")
+        setProviderPending(false)
+        return
+      }
+      router.replace(AUTH_ROUTES.resetPasswordSuccess)
+    } catch {
+      setProviderError("We couldn't update your password. Please try again.")
+      setProviderPending(false)
+    }
+  }
+
+  if (status === 'ready') {
+    return (
+      <ResetPasswordForm
+        onPasswordSubmit={handlePasswordSubmit}
+        providerError={providerError}
+        providerPending={providerPending}
+      />
+    )
+  }
+
+  if (status === 'unavailable') {
+    return (
+      <RecoveryStateCard
+        action={
+          <Link
+            className="talentry-button talentry-button--primary talentry-button--large"
+            href={AUTH_ROUTES.forgotPassword}
+          >
+            <span className="talentry-button__content">Request a new reset link</span>
+          </Link>
+        }
+        description={
+          <>
+            This password reset link is invalid or has expired.
+            <br />
+            Request a new link to continue.
+          </>
+        }
+        title="Reset link unavailable"
+      />
+    )
+  }
+
+  return (
+    <RecoveryStateCard
+      description="Please wait while we verify your password reset link."
+      title="Checking reset link"
+    />
+  )
+}
```

The report files are self-describing and are not recursively embedded in their own diff section.

## 25. Git Status

Expected final scope before approval:

```text
 M app/reset-password/page.tsx
 M components/auth/ForgotPasswordForm.tsx
 M components/auth/ResetPasswordForm.tsx
 M lib/auth/auth-constants.ts
?? components/auth/PasswordRecoveryFlow.tsx
?? docs/01_Engineering/Sprint_A3.6_Engineering_Report.md
?? docs/01_Engineering/Sprint_A3.6_Summary.md
```

No file was staged, committed, or pushed.

## 26. Security and Risk Register

| Risk | Control implemented | Remaining risk |
|---|---|---|
| Account enumeration | Generic acknowledgment; no account-existence copy | No raw provider detail is exposed; remote provider behavior remains external |
| Open redirect | Trusted current origin plus fixed reset route only | Remote allow-list must remain exact |
| Direct/ordinary-session access | `PASSWORD_RECOVERY` plus `getUser()` required | Final direct-access regression passed |
| Expired/invalid link | Fail-closed unavailable state | Link lifetime and provider delivery remain externally controlled |
| Duplicate submit | State guard, disabled action, loading text | None known locally |
| Raw provider disclosure | Normalized error strings only | Internal logging remains provider-owned |
| Premature success | Navigation only after successful `updateUser` | Success route itself remains directly accessible |
| Session/reload mismatch | Recovery proof is not persisted manually; missing recovery context fails closed | Same-browser/profile behavior is the validated path |
| Callback/PKCE mismatch | Existing browser client owns detection; no manual token handling | First failed attempt remains historically unexplained despite later successful validation |
| Broader authorization | Scope intentionally excludes middleware/dashboard protection | `/dashboard` remains unprotected |

## 27. Known Limitations

- The recovery flow remains client-only; no middleware, server callback, or server-session architecture was added.
- The successful controlled path was validated in the same Edge profile/device that initiated the request; cross-profile and cross-device recovery were not established by this acceptance.
- No sessionStorage/localStorage recovery flag or cross-device workaround exists.
- The exact cause of the first failed real recovery attempt remains historically unexplained.
- The later controlled success proves that the approved client-only architecture works under the tested same-browser/profile conditions.
- The broader mixed `/login` versus dedicated-auth architecture remains unchanged.
- `/reset-password/success` remains directly accessible; success-route protection was outside A3.6.
- `/dashboard` remains unprotected; dashboard access protection was outside A3.6.

## 28. Dashboard Boundary

A separate read-only dashboard audit was performed after recovery acceptance. It established that the current dashboard is a static shell and that sidebar navigation is not implemented. This is not an A3.6 defect. No dashboard source was modified, and dashboard work remains a separate future implementation boundary.

## 29. Untouched-Module Confirmation

`lib/supabase.ts`, Forgot Password route wrapper, success route/card, `AuthShell`, Create Account, OTP, Login, Register, Verify, Dashboard, styles, design tokens, package files, environment files, middleware, API routes, Interview, Result, `Recovered_From_Vercel`, remote Supabase, and Resend configuration were not modified.

No package was installed. No server/callback architecture was introduced. No secret, token, session, or raw user data was printed.

## 30. Approval Required

Status is **IMPLEMENTATION COMPLETE — REAL PROVIDER ACCEPTANCE PASSED — FINAL REGRESSION PASSED — AWAITING USER APPROVAL AND LOCAL COMMIT**.

A3.6 has not been committed, pushed, or deployed. No stage, commit, push, remote-setting change, or Sprint A3.7 work has been performed or authorized. Local commit requires explicit user approval.
