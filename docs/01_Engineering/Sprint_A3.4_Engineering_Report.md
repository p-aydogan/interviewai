# Sprint A3.4 Engineering Report

## 1. Report Identity

- Sprint: A3.4
- Title: Reset Password Screen
- Branch: `feature/auth-foundation`
- Status: Approved
- Date: 2026-08-06

## 2. Sprint Objective and Boundaries

Sprint A3.4 implements only the local Reset Password screen at `/reset-password`. It provides controlled password fields, approved local validation presentation, independent password visibility controls, and a disabled-until-valid Reset password action.

The sprint does not implement a real password update, reset-token parsing or validation, API calls, Supabase calls, database access, authentication mutation, email delivery, success state, fake loading, simulated delay, or post-submit navigation. Submit calls only `event.preventDefault()`.

## 3. Repository State Before Implementation

The mandatory pre-implementation checks produced:

```text
git branch --show-current
feature/auth-foundation

git status --short
[no output]

git log -1 --oneline
45af00f fix(auth): align password visibility icons
```

The expected branch and HEAD matched, and the working tree was clean before implementation.

## 4. Architecture and Implementation Decisions

- The route composes the existing `AuthShell` with its explicit `centered` presentation.
- Back navigation uses the existing `AUTH_ROUTES.forgotPassword` constant and the approved Back to Forgot Password label.
- The form reuses `TalentryCard`, `TalentryButton`, `SectionHeader`, `PasswordRequirements`, and `getPasswordRequirementStatus`.
- Password validity is derived from the existing minimum-length, uppercase, lowercase, and number checks. The recommended special character remains non-blocking.
- Confirm-password mismatch presentation is derived from local value and blur state. No extra effect or synchronization state was introduced.
- The exact approved visibility SVG moved into one auth-local `PasswordVisibilityIcon` component. Both Create Account and Reset Password use this renderer.
- The existing centered auth-card sizing hook is reused to retain approved responsive border-box behavior without introducing a reset-specific CSS rule.
- Microsoft Edge browser acceptance exposed a duplicate native password control beside the custom icon. Two narrowly scoped CSS pseudo-element rules hide only Edge's native reveal and clear controls inside the existing password wrapper.
- Mobile browser acceptance at 390 × 844 exposed `/register` right-edge clipping caused by `width: 100%` plus padding and border under content-box sizing. The existing mobile card rule now adds only `box-sizing: border-box`.
- No shared validation architecture, global state, service boundary, or future integration layer was introduced.

## 5. Created and Modified Files

### Created

- `app/reset-password/page.tsx`
- `components/auth/ResetPasswordForm.tsx`
- `components/auth/PasswordVisibilityIcon.tsx`
- `docs/01_Engineering/Sprint_A3.4_Summary.md`
- `docs/01_Engineering/Sprint_A3.4_Engineering_Report.md`

### Modified

- `components/auth/CreateAccountForm.tsx`
- `styles/talentry-auth.css`

## 6. Responsibility of Each File

- `app/reset-password/page.tsx`: Defines the `/reset-password` route and composes centered `AuthShell`, approved back navigation, and `ResetPasswordForm`.
- `components/auth/ResetPasswordForm.tsx`: Owns the local reset-password field values, blur-gated mismatch presentation, independent visibility state, required-rule evaluation, disabled-button state, and prevented submission.
- `components/auth/PasswordVisibilityIcon.tsx`: Provides the single approved hidden/visible eye SVG renderer for auth password controls.
- `components/auth/CreateAccountForm.tsx`: Imports the shared icon renderer instead of defining a duplicate local renderer; all existing form behavior is preserved.
- `styles/talentry-auth.css`: Hides Microsoft Edge's native `::-ms-reveal` and `::-ms-clear` controls only inside `.talentry-auth-password-control` and applies border-box sizing to the existing shared auth card rule only below 36rem.
- `docs/01_Engineering/Sprint_A3.4_Summary.md`: Provides the concise sprint acceptance record.
- `docs/01_Engineering/Sprint_A3.4_Engineering_Report.md`: Provides the complete implementation, validation, scope, and diff record.

## 7. Public Interfaces and Types

`PasswordVisibilityIcon.tsx` exports:

```ts
export interface PasswordVisibilityIconProps {
  visible: boolean
}
```

Its default component renders the exact approved SVG and conditionally includes the existing diagonal path when `visible` is true.

`ResetPasswordForm` and `ResetPasswordPage` expose only default React component exports and accept no public props.

## 8. Validation Behavior

- New password and Confirm new password are controlled local inputs.
- Both use `autoComplete="new-password"`.
- Both visibility controls operate independently.
- Required password validity matches Create Account: minimum 8 characters, uppercase, lowercase, and number.
- A special character remains recommended and does not gate the button.
- The mismatch error appears only when confirmation is non-empty, has been blurred, and differs from the new password.
- The mismatch error disappears immediately when the values match.
- Reset password remains disabled until required rules pass and the two values match exactly.
- Form submit performs only `event.preventDefault()`.

## 9. Accessibility Decisions

- Both fields have visible labels connected through matching `htmlFor` and `id` values.
- Both inputs use the appropriate password/text type based on their independent visibility state.
- Visibility controls are native buttons with accurate dynamic accessible labels.
- Existing keyboard interaction, focus-visible styling, and minimum control sizing are preserved.
- `aria-invalid` is present only while the blur-gated mismatch error is visible.
- `aria-describedby` references the stable `reset-password-confirm-error` id only while that error exists.
- The mismatch message includes both the `!` marker and explicit text, so meaning does not rely on color alone.
- The New password input references the existing `password-requirements` description.
- The shared visibility SVG remains hidden from assistive technology because the button label carries its meaning.

## 10. Styling and Token Usage

For Microsoft Edge compatibility, `styles/talentry-auth.css` received these two separate, narrowly scoped rules:

```css
.talentry-auth-password-control input::-ms-reveal {
  display: none;
}

.talentry-auth-password-control input::-ms-clear {
  display: none;
}
```

No design token, spacing, dimension, position, transform, color, focus style, or existing CSS rule changed. The shared custom Talentry visibility icon remains unchanged.

The existing mobile rule now includes one additional sizing declaration:

```css
@media (max-width: 36rem) {
  .talentry-create-account.talentry-card {
    box-sizing: border-box;
    padding: var(--talentry-space-5);
  }
}
```

No width, padding, margin, overflow, transform, component behavior, validation, accessibility, routing, API, or Supabase logic changed. Desktop and tablet behavior are unaffected because the declaration is limited to `max-width: 36rem`.

The screen reuses the approved authentication classes and therefore inherits the shared premium navy canvas, purple and indigo atmospheric layers, Talentry header, Language menu, translucent card, typography, inputs, password-toggle styling, primary button treatment, responsive layout, and reduced-motion behavior.

The existing `talentry-forgot-password-card` sizing hook is used alongside `talentry-create-account` to preserve the already approved centered-card border-box behavior on mobile and tablet without introducing a route-specific style or changing the visual treatment.

## 11. Validation Commands and Exact Results

The development server was not started. Both commands were re-run after the mobile card overflow correction.

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

> interviewai@1.0.0 build
> next build

▲ Next.js 14.2.5
- Environments: .env.local

Creating an optimized production build ...
✓ Compiled successfully
Linting and checking validity of types ...
Collecting page data ...
✓ Generating static pages (15/15)
Finalizing page optimization ...
Collecting build traces ...

○ /reset-password  2.47 kB  96.4 kB First Load JS
```

Result: Passed. The route appeared in the build output, all static pages generated successfully, and no unresolved error was reported.

## 12. Git Status

Expected final `git status --short` after creating both reports:

```text
 M components/auth/CreateAccountForm.tsx
 M styles/talentry-auth.css
?? app/reset-password/
?? components/auth/PasswordVisibilityIcon.tsx
?? components/auth/ResetPasswordForm.tsx
?? docs/01_Engineering/Sprint_A3.4_Engineering_Report.md
?? docs/01_Engineering/Sprint_A3.4_Summary.md
```

No file was staged, committed, or pushed.

## 13. Complete Implementation Diffs

The complete final diffs for the five implementation files follow. The two reports are self-describing and cannot recursively contain their own final diffs.

### `app/reset-password/page.tsx`

```diff
diff --git a/app/reset-password/page.tsx b/app/reset-password/page.tsx
new file mode 100644
index 0000000..5d75fd0
--- /dev/null
+++ b/app/reset-password/page.tsx
@@ -0,0 +1,15 @@
+import AuthShell from '@/components/auth/AuthShell'
+import ResetPasswordForm from '@/components/auth/ResetPasswordForm'
+import { AUTH_ROUTES } from '@/lib/auth/auth-constants'
+
+export default function ResetPasswordPage() {
+  return (
+    <AuthShell
+      backHref={AUTH_ROUTES.forgotPassword}
+      backLabel="Back to Forgot Password"
+      centered
+    >
+      <ResetPasswordForm />
+    </AuthShell>
+  )
+}
```

### `components/auth/PasswordVisibilityIcon.tsx`

```diff
diff --git a/components/auth/PasswordVisibilityIcon.tsx b/components/auth/PasswordVisibilityIcon.tsx
new file mode 100644
index 0000000..eb8f12c
--- /dev/null
+++ b/components/auth/PasswordVisibilityIcon.tsx
@@ -0,0 +1,13 @@
+export interface PasswordVisibilityIconProps {
+  visible: boolean
+}
+
+export default function PasswordVisibilityIcon({ visible }: PasswordVisibilityIconProps) {
+  return (
+    <svg aria-hidden="true" viewBox="0 0 24 24">
+      <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" />
+      <circle cx="12" cy="12" r="2.5" />
+      {visible && <path d="m4 4 16 16" />}
+    </svg>
+  )
+}
```

### `components/auth/ResetPasswordForm.tsx`

```diff
diff --git a/components/auth/ResetPasswordForm.tsx b/components/auth/ResetPasswordForm.tsx
new file mode 100644
index 0000000..75a5f91
--- /dev/null
+++ b/components/auth/ResetPasswordForm.tsx
@@ -0,0 +1,131 @@
+'use client'
+
+import { useState } from 'react'
+import type { FormEvent } from 'react'
+
+import { SectionHeader, TalentryButton, TalentryCard } from '@/components/ui'
+
+import PasswordRequirements, { getPasswordRequirementStatus } from './PasswordRequirements'
+import PasswordVisibilityIcon from './PasswordVisibilityIcon'
+
+const CONFIRM_PASSWORD_ERROR_ID = 'reset-password-confirm-error'
+
+export default function ResetPasswordForm() {
+  const [password, setPassword] = useState('')
+  const [confirmPassword, setConfirmPassword] = useState('')
+  const [confirmPasswordWasBlurred, setConfirmPasswordWasBlurred] = useState(false)
+  const [showPassword, setShowPassword] = useState(false)
+  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
+
+  const passwordStatus = getPasswordRequirementStatus(password)
+  const passwordIsValid =
+    passwordStatus.minimumLength &&
+    passwordStatus.uppercase &&
+    passwordStatus.lowercase &&
+    passwordStatus.number
+  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword
+  const showMismatch =
+    confirmPasswordWasBlurred && confirmPassword.length > 0 && !passwordsMatch
+
+  function handleSubmit(event: FormEvent<HTMLFormElement>) {
+    event.preventDefault()
+  }
+
+  return (
+    <TalentryCard
+      className="talentry-create-account talentry-forgot-password-card"
+      padding="standard"
+    >
+      <SectionHeader
+        description="Choose a strong password for your account."
+        headingAs="h1"
+        title="Create a new password"
+      />
+
+      <form className="talentry-create-account__form" noValidate onSubmit={handleSubmit}>
+        <div className="talentry-auth-field">
+          <label htmlFor="reset-password-new">New password</label>
+          <div className="talentry-auth-input-control talentry-auth-password-control">
+            <span className="talentry-auth-input-control__icon" aria-hidden="true">
+              <svg viewBox="0 0 24 24">
+                <path d="M7 10V8a5 5 0 0 1 10 0v2" />
+                <rect height="10" rx="2" width="16" x="4" y="10" />
+              </svg>
+            </span>
+            <input
+              aria-describedby="password-requirements"
+              autoComplete="new-password"
+              id="reset-password-new"
+              onChange={(event) => setPassword(event.target.value)}
+              required
+              type={showPassword ? 'text' : 'password'}
+              value={password}
+            />
+            <button
+              aria-label={showPassword ? 'Hide new password' : 'Show new password'}
+              className="talentry-auth-password-toggle"
+              onClick={() => setShowPassword((visible) => !visible)}
+              type="button"
+            >
+              <PasswordVisibilityIcon visible={showPassword} />
+            </button>
+          </div>
+          <PasswordRequirements password={password} />
+        </div>
+
+        <div className="talentry-auth-field">
+          <label htmlFor="reset-password-confirm">Confirm new password</label>
+          <div className="talentry-auth-input-control talentry-auth-password-control">
+            <span className="talentry-auth-input-control__icon" aria-hidden="true">
+              <svg viewBox="0 0 24 24">
+                <path d="M7 10V8a5 5 0 0 1 10 0v2" />
+                <rect height="10" rx="2" width="16" x="4" y="10" />
+              </svg>
+            </span>
+            <input
+              aria-describedby={showMismatch ? CONFIRM_PASSWORD_ERROR_ID : undefined}
+              aria-invalid={showMismatch || undefined}
+              autoComplete="new-password"
+              id="reset-password-confirm"
+              onBlur={() => setConfirmPasswordWasBlurred(true)}
+              onChange={(event) => setConfirmPassword(event.target.value)}
+              required
+              type={showConfirmPassword ? 'text' : 'password'}
+              value={confirmPassword}
+            />
+            <button
+              aria-label={
+                showConfirmPassword
+                  ? 'Hide confirmed new password'
+                  : 'Show confirmed new password'
+              }
+              className="talentry-auth-password-toggle"
+              onClick={() => setShowConfirmPassword((visible) => !visible)}
+              type="button"
+            >
+              <PasswordVisibilityIcon visible={showConfirmPassword} />
+            </button>
+          </div>
+          {showMismatch && (
+            <p
+              className="talentry-auth-field__message talentry-auth-field__message--error"
+              id={CONFIRM_PASSWORD_ERROR_ID}
+            >
+              <span aria-hidden="true">!</span> Passwords do not match.
+            </p>
+          )}
+        </div>
+
+        <TalentryButton
+          className="talentry-create-account__submit"
+          disabled={!passwordIsValid || !passwordsMatch}
+          size="large"
+          type="submit"
+        >
+          <span>Reset password</span>
+          <span aria-hidden="true">→</span>
+        </TalentryButton>
+      </form>
+    </TalentryCard>
+  )
+}
```

### `components/auth/CreateAccountForm.tsx`

```diff
diff --git a/components/auth/CreateAccountForm.tsx b/components/auth/CreateAccountForm.tsx
index 8f9a60a..2a038af 100644
--- a/components/auth/CreateAccountForm.tsx
+++ b/components/auth/CreateAccountForm.tsx
@@ -6,19 +6,10 @@ import type { FormEvent } from 'react'
 import { SectionHeader, TalentryButton, TalentryCard } from '@/components/ui'
 
 import PasswordRequirements, { getPasswordRequirementStatus } from './PasswordRequirements'
+import PasswordVisibilityIcon from './PasswordVisibilityIcon'
 
 const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
 
-function PasswordVisibilityIcon({ visible }: { visible: boolean }) {
-  return (
-    <svg aria-hidden="true" viewBox="0 0 24 24">
-      <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" />
-      <circle cx="12" cy="12" r="2.5" />
-      {visible && <path d="m4 4 16 16" />}
-    </svg>
-  )
-}
-
export default function CreateAccountForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
```

### `styles/talentry-auth.css`

```diff
diff --git a/styles/talentry-auth.css b/styles/talentry-auth.css
index 95b5067..937e378 100644
--- a/styles/talentry-auth.css
+++ b/styles/talentry-auth.css
@@ -359,6 +359,14 @@
   padding-inline-end: var(--talentry-space-16);
 }
 
+.talentry-auth-password-control input::-ms-reveal {
+  display: none;
+}
+
+.talentry-auth-password-control input::-ms-clear {
+  display: none;
+}
+
 .talentry-auth-password-toggle {
   position: absolute;
   inset-block: 0;
@@ -528,6 +536,7 @@
   }
 
   .talentry-create-account.talentry-card {
+    box-sizing: border-box;
     padding: var(--talentry-space-5);
   }
 
```

## 13A. Final Browser and UX Acceptance

### Reset Password desktop

- PASS. The initial desktop layout was visually correct.
- The card, shared navy/purple/indigo background, fields, password-requirements panel, and disabled action rendered correctly.
- No clipping or horizontal overflow was observed.

### Local validation behavior

- PASS. Mismatching valid values displayed `Passwords do not match.` only after the confirmation field blurred.
- The mismatch error disappeared immediately when the values matched.
- Reset password remained disabled for invalid or mismatching values and became enabled when all required rules passed and the values matched.
- The special-character requirement remained recommended and non-blocking.

### Password visibility controls

- PASS. New password and Confirm new password visibility controls operated independently.
- Both fields could be revealed simultaneously.
- Shared hidden and visible icons remained visually aligned, with no layout shift.

### Microsoft Edge compatibility

- PASS. Edge's native password-reveal control no longer appeared beside the custom Talentry icon.
- Verification passed with populated and focused password inputs; only one custom icon appeared in each field.

### Submit behavior

- PASS. Selecting Reset password did not navigate and the form values remained present.
- No loading indicator, success message, mutation, or route change occurred.
- Local submit behavior remained `event.preventDefault()` only.

### Responsive acceptance

- Desktop: PASS.
- Tablet 768 × 1024: PASS. The card remained centered with balanced side margins and no clipping or horizontal overflow.
- Mobile 390 × 844: PASS. All four card corners, fields, and action remained inside the viewport with no horizontal overflow.

### Mobile regression verification at 390 × 844

- `/register`: PASS. Content-box right-edge clipping was corrected, margins became balanced, and password icons remained correct.
- `/reset-password`: PASS. No clipping or overflow; the layout remained centered.
- `/forgot-password`: PASS. No clipping or overflow; the layout remained centered.
- `/verify`: PASS. All six OTP inputs remained inside the centered card with no clipping or overflow.

### Navigation

- PASS. The application back control on `/reset-password` navigated to `/forgot-password`.

Final browser and UX acceptance: PASSED.

## 14. Risks, Limitations, and Technical Debt

- The form is intentionally local-only and cannot update a password.
- Reset-token and authenticated recovery-context handling must be designed in a future approved integration sprint.
- Reusing the existing route-named centered-card sizing hook avoids a separate layout CSS change but leaves a semantic CSS naming dependency that may be generalized only in a separately approved cleanup.
- No success/loading/error response model exists because external mutation is out of scope.

## 15. Untouched-Module Confirmation

`components/auth/AuthShell.tsx`, `components/auth/PasswordRequirements.tsx`, Forgot Password behavior, OTP behavior, UI Kit, auth constants, design tokens, Dashboard, Interview, Jobs, Profile, Settings, API routes, Supabase files, package files, environment files, and prior sprint reports were not modified.

The Edge correction changed no layout, validation, accessibility, routing, API, Supabase, or form behavior. The shared custom Talentry visibility icon was not changed.

No package was installed. No development server was started during this documentation-only update. Browser acceptance was completed before this update. No file was staged, committed, or pushed. Sprint A3.5 was not started.

## 16. Final Approval

Sprint A3.4 passed technical validation and final browser/UX acceptance and is Approved. Explicit final approval granted authorization for the local Sprint A3.4 commit.

Push remains unauthorized. Sprint A3.5 was not started.
