# Sprint A3.3 Engineering Report

## 1. Report Identity

- Sprint ID: A3.3
- Title: Forgot Password Screen
- Branch: `feature/auth-foundation`
- Date: 2026-08-04
- Status: Awaiting approval
- Report scope: Sprint A3.3 only

## 2. Sprint Objective and Boundaries

The sprint objective was to add only the local Forgot Password UI at `/forgot-password` as the next approved authentication screen after Sign In. The screen accepts a locally controlled email value and provides local validation presentation only.

No real password-reset request, email delivery, API call, Supabase call, authentication or verification behavior, success state, simulated loading, database access, or post-submit navigation was implemented. Reset Password and later journey steps remain out of scope.

## 3. Repository State Before Implementation

- Current branch: `feature/auth-foundation`.
- HEAD before implementation: `fd9231a feat(auth): implement OTP verification screen`.
- Working tree before implementation: clean.
- `AUTH_ROUTES.login` existed with the approved `/login` value.
- The approved `AuthShell`, Create Account form, OTP form, UI Kit, authentication constants, login route, design tokens, and authentication stylesheet were inspected before editing.

## 4. Architecture and Implementation Decisions

- `app/forgot-password/page.tsx` remains a thin server route that composes the existing shared `AuthShell` and the client-only form.
- The route opts into the explicit `centered` AuthShell presentation and uses `AUTH_ROUTES.login` for the Back to Sign In control.
- `ForgotPasswordForm` owns only the email value and whether the field has been blurred.
- No approved shared email-validation helper existed. A small file-local regular-expression helper trims surrounding whitespace before syntactic validation, avoiding a new shared validation architecture.
- The visible error state requires a prior blur, a non-empty trimmed value, and an invalid result.
- Submission performs only `event.preventDefault()`.
- Existing `talentry-create-account`, form, field, input, error, and submit classes provide the approved visual design.
- Acceptance correction added only the scoped `talentry-forgot-password-card` class and responsive box-model rules needed to keep the card inside its centered mobile/tablet track.
- The tablet centered shell uses border-box sizing, a viewport-safe minimum height, and symmetric centered-content margins to eliminate excess document height without changing AuthShell logic.
- The existing OTP card hook shares the tablet border-box correction so the approved `/verify` regression layout remains centered.

## 5. Created and Modified Files

Created:

- `app/forgot-password/page.tsx`
- `components/auth/ForgotPasswordForm.tsx`
- `docs/01_Engineering/Sprint_A3.3_Summary.md`
- `docs/01_Engineering/Sprint_A3.3_Engineering_Report.md`

Modified:

- `components/auth/ForgotPasswordForm.tsx`
- `styles/talentry-auth.css`
- `docs/01_Engineering/Sprint_A3.3_Summary.md`
- `docs/01_Engineering/Sprint_A3.3_Engineering_Report.md`

## 6. Responsibility of Each File

- `app/forgot-password/page.tsx`: Declares `/forgot-password` and composes the centered shared authentication shell, login back control, and Forgot Password form.
- `components/auth/ForgotPasswordForm.tsx`: Renders the scoped Forgot Password card, controls the email field, applies blur-gated local validation, disables the submit action until valid, and prevents native submission.
- `styles/talentry-auth.css`: Applies the approved mobile card border-box correction and tablet centered-shell/content/card sizing corrections without changing shared background or visual styling.
- `docs/01_Engineering/Sprint_A3.3_Summary.md`: Provides the concise sprint acceptance record.
- `docs/01_Engineering/Sprint_A3.3_Engineering_Report.md`: Provides the complete technical, validation, scope, and diff record.

## 7. Public Interfaces, Props, or Types

No public shared interface, prop contract, route constant, validation helper, or UI Kit type changed. `ForgotPasswordForm` has no props and is exported as the component default. No `any` was introduced.

## 8. Validation Behavior

- The controlled raw email value is preserved in the input.
- Surrounding whitespace is removed only for validation through `value.trim()`.
- The local pattern requires non-whitespace content on both sides of `@` and a dotted suffix.
- Empty and whitespace-only values keep the primary button disabled without showing an error.
- A non-empty invalid value shows `Enter a valid email address.` only after the field loses focus.
- A subsequent valid value removes the visible error immediately.
- The primary button is enabled only for a syntactically valid trimmed email.
- Submit has no effect beyond `event.preventDefault()`.

## 9. Accessibility Decisions

- The visible Email label is associated with `forgot-password-email` through `htmlFor` and `id`.
- The input uses native `type="email"`, `autoComplete="email"`, `inputMode="email"`, and `required` semantics.
- `aria-invalid` is present only while the visible invalid state is active.
- `aria-describedby` points to the stable `forgot-password-email-error` id only while the error is rendered.
- The existing error class combines a visible `!` indicator and explanatory text, so color is not the only signal.
- The native disabled button state, keyboard form behavior, shared focus-visible treatment, and approved control sizing are preserved.

## 10. Styling and Token Usage

The screen reuses `AuthShell`, `TalentryCard`, `TalentryButton`, `SectionHeader`, and `styles/talentry-auth.css`. It therefore inherits the approved shared premium navy canvas, upper-right purple atmosphere, lower-left indigo atmosphere, brand header, Language menu, translucent card, typography, controls, responsive rules, and reduced-motion behavior.

Acceptance CSS changes are limited to box-sizing, viewport-safe centered-shell height, and symmetric centered-content margins at the approved mobile/tablet breakpoints. No route-specific background, inline style, styled-jsx, Tailwind, design token, icon package, or dependency was added.

## 11. Validation Commands and Exact Results

The development server was stopped before final technical validation.

```text
npx.cmd tsc --noEmit --incremental false
Exit code: 0
```

Result: no TypeScript errors and no output.

```text
npm.cmd run build
Exit code: 0
```

Final build result:

```text
- Compiled successfully
- Linting and type checking passed
- Static pages generated: 14/14
- /forgot-password: 1.79 kB, 95.7 kB First Load JS
- /verify: 2.27 kB, 96.2 kB First Load JS
```

No warning appeared in the final build output.

## 12. Git Status

The expected final short status contains only the approved A3.3 source, CSS, and report files:

```text
 M styles/talentry-auth.css
?? app/forgot-password/page.tsx
?? components/auth/ForgotPasswordForm.tsx
?? docs/01_Engineering/Sprint_A3.3_Engineering_Report.md
?? docs/01_Engineering/Sprint_A3.3_Summary.md
```

Nothing was staged, committed, or pushed.

## 13. Complete Implementation Diffs

The two source files are new. Their complete final diffs follow together with the complete acceptance-correction CSS additions. The reports are self-describing and cannot recursively include their own final diffs.

### `app/forgot-password/page.tsx`

```diff
diff --git a/app/forgot-password/page.tsx b/app/forgot-password/page.tsx
new file mode 100644
--- /dev/null
+++ b/app/forgot-password/page.tsx
@@ -0,0 +1,11 @@
+import AuthShell from '@/components/auth/AuthShell'
+import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'
+import { AUTH_ROUTES } from '@/lib/auth/auth-constants'
+
+export default function ForgotPasswordPage() {
+  return (
+    <AuthShell backHref={AUTH_ROUTES.login} backLabel="Back to Sign In" centered>
+      <ForgotPasswordForm />
+    </AuthShell>
+  )
+}
```

### `components/auth/ForgotPasswordForm.tsx`

```diff
diff --git a/components/auth/ForgotPasswordForm.tsx b/components/auth/ForgotPasswordForm.tsx
new file mode 100644
--- /dev/null
+++ b/components/auth/ForgotPasswordForm.tsx
@@ -0,0 +1,79 @@
+'use client'
+
+import { useState } from 'react'
+import type { FormEvent } from 'react'
+
+import { SectionHeader, TalentryButton, TalentryCard } from '@/components/ui'
+
+const EMAIL_ERROR_ID = 'forgot-password-email-error'
+const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
+
+function isValidEmail(value: string) {
+  return EMAIL_PATTERN.test(value.trim())
+}
+
+export default function ForgotPasswordForm() {
+  const [email, setEmail] = useState('')
+  const [emailWasBlurred, setEmailWasBlurred] = useState(false)
+
+  const trimmedEmail = email.trim()
+  const emailIsValid = isValidEmail(email)
+  const showEmailError = emailWasBlurred && trimmedEmail.length > 0 && !emailIsValid
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
+        description="Enter the email associated with your account and we’ll send you a verification code."
+        headingAs="h1"
+        title="Forgot your password?"
+      />
+
+      <form className="talentry-create-account__form" noValidate onSubmit={handleSubmit}>
+        <div className="talentry-auth-field">
+          <label htmlFor="forgot-password-email">Email</label>
+          <div className="talentry-auth-input-control">
+            <span className="talentry-auth-input-control__icon" aria-hidden="true">@</span>
+            <input
+              aria-describedby={showEmailError ? EMAIL_ERROR_ID : undefined}
+              aria-invalid={showEmailError || undefined}
+              autoComplete="email"
+              id="forgot-password-email"
+              inputMode="email"
+              onBlur={() => setEmailWasBlurred(true)}
+              onChange={(event) => setEmail(event.target.value)}
+              placeholder="you@example.com"
+              required
+              type="email"
+              value={email}
+            />
+          </div>
+          {showEmailError && (
+            <p
+              className="talentry-auth-field__message talentry-auth-field__message--error"
+              id={EMAIL_ERROR_ID}
+            >
+              <span aria-hidden="true">!</span> Enter a valid email address.
+            </p>
+          )}
+        </div>
+
+        <TalentryButton
+          className="talentry-create-account__submit"
+          disabled={!emailIsValid}
+          size="large"
+          type="submit"
+        >
+          <span>Send reset code</span>
+          <span aria-hidden="true">→</span>
+        </TalentryButton>
+      </form>
+    </TalentryCard>
+  )
+}
```

### `styles/talentry-auth.css`

```diff
@@
+@media (min-width: 48rem) and (max-width: 64rem) {
+  .talentry-auth-shell--centered {
+    box-sizing: border-box;
+    min-height: calc(100vh - var(--talentry-space-4));
+    min-height: calc(100dvh - var(--talentry-space-4));
+  }
+
+  .talentry-auth-shell__content--centered {
+    margin-block: var(--talentry-space-6);
+  }
+
+  .talentry-forgot-password-card.talentry-card,
+  .talentry-otp-card.talentry-card {
+    box-sizing: border-box;
+  }
+}
@@
 @media (max-width: 36rem) {
@@
+  .talentry-forgot-password-card.talentry-card {
+    box-sizing: border-box;
+  }
 }
```

## 13A. Final Acceptance Corrections and Browser Evidence

### Mobile card correction

At 390 × 844, the Forgot Password card initially used content-box sizing. Its 100% used width excluded padding and borders, so the rendered outer box exceeded the approximately 327.2px content track and clipped the right border and rounded corners.

The scoped `talentry-forgot-password-card` class and mobile-only border-box rule produced the final geometry:

- Content width: approximately 327.2px.
- Card width: approximately 327.2px.
- Card bounds: approximately x=24px to x=351.2px.
- Left and right gutters: approximately 24px.
- All borders and rounded corners visible; no horizontal overflow.

### Tablet centered-layout correction

At 768 × 1024, the centered shell’s content-box height produced excess document height, centered-content margins were asymmetric, and the Forgot Password and OTP cards expanded beyond the intended 448px track because their padding and borders were outside the used width.

The tablet media query now applies:

- Border-box sizing and viewport-safe minimum height to `.talentry-auth-shell--centered`.
- Symmetric block margins to `.talentry-auth-shell__content--centered`.
- Border-box sizing to `.talentry-forgot-password-card.talentry-card` and `.talentry-otp-card.talentry-card`.

Final tablet evidence:

- Forgot Password card: 448px wide with 160px left and right gutters, centered horizontally and in the usable area below the topbar.
- OTP card: 448px wide with 160px left and right gutters, centered horizontally and vertically.
- Client height and scroll height: 1024px.
- No horizontal or vertical document overflow, clipping, or hidden border/corner.
- Language menu remained inside the viewport.

### Final manual visual and behavior acceptance

- Desktop displayed the shared navy, purple, and indigo authentication background correctly; the card was centered; the Language menu opened inside the viewport; no clipping or horizontal overflow occurred.
- Empty email kept the CTA disabled.
- A non-empty invalid email displayed `Enter a valid email address.` after blur.
- A valid email removed the error and enabled the CTA.
- Clicking Send reset code did not navigate, load, display success, mutate account state, or send a request.
- Mobile 390 × 844 displayed the complete card with equal gutters, all rounded corners, and an in-viewport Language menu without horizontal overflow.
- Tablet 768 × 1024 passed Forgot Password and OTP regression checks without page scrollbar or clipping.
- Final browser/UX acceptance: PASSED.

## 14. Risks, Limitations, and Technical Debt

- Email validation is intentionally syntactic and local; authoritative validation belongs at a future approved server/integration boundary.
- The screen intentionally has no success state because no reset request is sent.
- The current legacy Sign In page was explicitly out of scope and was not changed to link to the new route.
- Browser and visual acceptance passed; real password-reset delivery and account mutation remain future integration work.

## 15. Untouched-Module Confirmation

`components/auth/AuthShell.tsx`, Create Account behavior, OTP component and behavior, Login, shared UI Kit components, design tokens, auth constants, Reset Password, Dashboard, Interview, Jobs, Profile, Settings, API, Supabase, packages, environment files, and all prior sprint reports were not modified.

No package was installed. The development server was used only for the approved manual browser/UX acceptance and was stopped before final technical validation. No stage, commit, or push occurred.

## 16. Approval Required

Sprint A3.3 has passed final browser/UX acceptance and final technical validation and remains Awaiting approval.

No stage, commit, push, or subsequent sprint is authorized until explicit approval.
