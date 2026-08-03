# Sprint A3.2 Engineering Report

## 1. Report Identity

- Sprint ID: A3.2
- Title: OTP Verification Screen
- Branch: `feature/auth-foundation`
- Status: Awaiting approval
- Report scope: Sprint A3.2 only

## 2. Sprint Objective and Boundaries

The objective was to add only the six-digit OTP verification UI immediately after Create Account. The implementation contains local state and interaction behavior only. It does not call an API or Supabase, send email, verify a code, authenticate a user, write to a database, navigate after submission, show success, or simulate loading.

Acceptance review found that the initial implementation omitted the approved recipient context and resend behavior. Subsequent visual and architecture reviews added the approved presentation-only language menu, explicit centered AuthShell layout, and final shared authentication background. Final visual acceptance and technical validation passed; the sprint remains open pending explicit approval.

## 3. Repository State Before Implementation

- Branch: `feature/auth-foundation`
- Initial working tree: clean.
- `app/verify/page.tsx` and `components/auth/OtpVerificationForm.tsx` did not exist.
- Existing `AuthShell`, UI Kit components, auth constants, auth stylesheet, and design tokens were inspected and preserved.

## 4. Architecture and Implementation Decisions

- `/verify` is a thin server page that composes the shared `AuthShell` and the client-only OTP form.
- `OtpVerificationForm` owns six controlled digits, input refs, keyboard/paste handling, and the local countdown.
- `OTP_LENGTH` comes from the existing auth constants instead of duplicating the approved value.
- Input advancement uses refs after a valid digit; Backspace on an empty field returns focus to the previous field.
- Paste strips non-digits, accepts at most six digits, distributes them across the inputs, and focuses the final populated input.
- A one-second timeout decrements the local 119-second resend countdown and is cleaned up on each effect cycle.
- The masked `p***@example.com` address is a presentation-only placeholder, not account data.
- While time remains, resend is text-only and non-interactive. At zero, the existing ghost button locally resets 119 seconds, clears the six digits, and focuses the first input.
- `handleSubmit` performs only `event.preventDefault()`.
- Existing auth classes and UI Kit public APIs were preserved; all approved styling changes remain contained in `styles/talentry-auth.css`.
- The earlier shared 6% indigo / 4% purple background was visually insufficient and appeared too flat.
- The final approved background correction exists only in `styles/talentry-auth.css` and is shared by `/register` and `/verify`.
- `.talentry-auth-shell` owns positioning/isolation, the softened premium navy tonal canvas, and decorative overflow clipping.
- `.talentry-auth-shell::before` owns the oversized blurred upper-right purple atmospheric layer; `.talentry-auth-shell::after` owns the oversized blurred lower-left indigo atmospheric layer.
- AuthShell topbar and content use controlled stacking so application content remains above the decorative layers.
- `.talentry-auth-shell--centered` remains layout-only and contains no background declaration.

## 5. Created and Modified Files

Created:

- `app/verify/page.tsx`
- `components/auth/OtpVerificationForm.tsx`
- `docs/01_Engineering/Sprint_A3.2_Summary.md`
- `docs/01_Engineering/Sprint_A3.2_Engineering_Report.md`

Modified:

- `components/auth/AuthShell.tsx`
- `styles/talentry-auth.css`
- `components/auth/OtpVerificationForm.tsx`
- `docs/01_Engineering/Sprint_A3.2_Summary.md`
- `docs/01_Engineering/Sprint_A3.2_Engineering_Report.md`

## 6. Responsibility of Each File

- `app/verify/page.tsx`: Declares the `/verify` route and composes the shared authentication shell with back navigation to registration.
- `components/auth/OtpVerificationForm.tsx`: Renders and controls the local six-digit OTP UI, focus behavior, paste support, countdown, prevented submit, and OTP-specific presentation hooks.
- `components/auth/AuthShell.tsx`: Replaces the inert-looking language placeholder with a semantic presentation-only dropdown shared by authentication screens.
- `styles/talentry-auth.css`: Adds token-derived dropdown and OTP-only responsive presentation, and owns the final approved shared premium navy, purple, and indigo authentication background used by `/register` and `/verify`.
- `Sprint_A3.2_Summary.md`: Provides the concise sprint acceptance record.
- `Sprint_A3.2_Engineering_Report.md`: Provides the detailed technical and diff record.

## 7. Public Interfaces, Props, or Types

The initial OTP form introduced no public prop interface or shared type. The component is exported as a default component and uses existing UI Kit interfaces. No `any` is used.

Final architecture correction extends the existing `AuthShellProps` with optional `centered?: boolean`, defaulting to `false`. This is a presentation-only API; `/verify` explicitly opts in.

## 8. Accessibility Decisions

- The six inputs are grouped with `role="group"` and an accessible group label.
- Every digit input has a position-specific accessible label.
- Inputs use `inputMode="numeric"`, `[0-9]*`, and a one-character maximum.
- The first input uses `autoComplete="one-time-code"`.
- Native keyboard input, Backspace focus movement, and paste are supported.
- Countdown/resend availability uses `aria-live="polite"`.
- The zero-state resend action is a native accessible button using the existing ghost treatment.
- The native Verify button stays disabled until all six controlled positions contain digits.
- Shared AuthShell/UI Kit focus-visible behavior and 44px control sizing are reused.

## 9. Styling and Token Usage

The screen reuses `talentry-auth.css`, `TalentryCard`, `TalentryButton`, `SectionHeader`, `AuthShell`, and their Talentry token-backed styles. Scoped OTP and language rules use the existing design tokens. The final shared AuthShell background uses the approved navy, navy-soft, interview-canvas, primary-purple, indigo, and spacing tokens; no design-token file changed. The shell supplies the tonal base and isolated decorative canvas, its pseudo-elements supply the oversized blurred atmospheric layers, and controlled z-index values keep the topbar, Language menu, and content above those layers. The centered modifier remains layout-only. No inline style, styled-jsx, Tailwind, external icon, or package was added or changed.

## 10. Validation Commands and Exact Results

Final validation was performed manually after stopping the development server.

```text
npx tsc --noEmit --incremental false
Exit code: 0
```

Passed with no output.

```text
npm run build
Exit code: 0
```

Final build output:

```text
- Compiled successfully
- Linting and type checking passed
- Static pages generated: 13/13
- /register: 2.56 kB, 96.5 kB First Load JS
- /verify: 2.27 kB, 96.2 kB First Load JS
```

No webpack cache warning appeared in the final build output.

## 11. Git Status

The final short status contains the A3.2 route/component/reports plus the explicitly approved AuthShell and auth stylesheet corrections. Nothing was staged, committed, or pushed.

## 12. Complete Diffs for Sprint Files

The implementation files are new; their complete new-file diffs follow. The two reports are self-describing and cannot recursively contain their own final diffs.

### `app/verify/page.tsx`

```diff
--- /dev/null
+++ b/app/verify/page.tsx
@@ -0,0 +1,11 @@
+import AuthShell from '@/components/auth/AuthShell'
+import OtpVerificationForm from '@/components/auth/OtpVerificationForm'
+import { AUTH_ROUTES } from '@/lib/auth/auth-constants'
+
+export default function VerifyPage() {
+  return (
+    <AuthShell backHref={AUTH_ROUTES.register} backLabel="Back to Create Account" centered>
+      <OtpVerificationForm />
+    </AuthShell>
+  )
+}
```

### `components/auth/OtpVerificationForm.tsx`

```diff
--- /dev/null
+++ b/components/auth/OtpVerificationForm.tsx
@@ -0,0 +1,130 @@
+'use client'
+
+import { useEffect, useRef, useState } from 'react'
+import type { ChangeEvent, ClipboardEvent, FormEvent, KeyboardEvent } from 'react'
+
+import { TalentryButton, TalentryCard, SectionHeader } from '@/components/ui'
+import { OTP_LENGTH } from '@/lib/auth/auth-constants'
+
+const COUNTDOWN_SECONDS = 119
+
+export default function OtpVerificationForm() {
+  const [digits, setDigits] = useState(() => Array<string>(OTP_LENGTH).fill(''))
+  const [secondsRemaining, setSecondsRemaining] = useState(COUNTDOWN_SECONDS)
+  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
+
+  useEffect(() => {
+    if (secondsRemaining === 0) return
+
+    const timer = window.setTimeout(() => {
+      setSecondsRemaining((seconds) => Math.max(0, seconds - 1))
+    }, 1000)
+
+    return () => window.clearTimeout(timer)
+  }, [secondsRemaining])
+
+  const codeIsComplete = digits.every(Boolean)
+  const countdown = `${Math.floor(secondsRemaining / 60)
+    .toString()
+    .padStart(2, '0')}:${(secondsRemaining % 60).toString().padStart(2, '0')}`
+
+  function updateDigit(index: number, value: string) {
+    const digit = value.replace(/\D/g, '').slice(-1)
+    setDigits((current) => current.map((item, position) => (position === index ? digit : item)))
+
+    if (digit && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus()
+  }
+
+  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
+    if (event.key === 'Backspace' && !digits[index] && index > 0) {
+      inputRefs.current[index - 1]?.focus()
+    }
+  }
+
+  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
+    const pastedDigits = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
+    if (!pastedDigits) return
+
+    event.preventDefault()
+    const nextDigits = Array.from({ length: OTP_LENGTH }, (_, index) => pastedDigits[index] ?? '')
+    setDigits(nextDigits)
+    inputRefs.current[Math.min(pastedDigits.length, OTP_LENGTH) - 1]?.focus()
+  }
+
+  function handleSubmit(event: FormEvent<HTMLFormElement>) {
+    event.preventDefault()
+  }
+
+  function handleResend() {
+    setDigits(Array<string>(OTP_LENGTH).fill(''))
+    setSecondsRemaining(COUNTDOWN_SECONDS)
+    inputRefs.current[0]?.focus()
+  }
+
+  return (
+    <TalentryCard className="talentry-create-account talentry-otp-card" padding="standard">
+      <SectionHeader
+        description={
+          <span className="talentry-otp-recipient">
+            <span>We&apos;ve sent a 6-digit verification code to</span>
+            <strong>p***@example.com</strong>
+          </span>
+        }
+        headingAs="h1"
+        title="Verify your email"
+      />
+
+      <form className="talentry-create-account__form" noValidate onSubmit={handleSubmit}>
+        <div className="talentry-auth-field">
+          <label id="otp-code-label">Verification code</label>
+          <div
+            aria-labelledby="otp-code-label"
+            className="talentry-auth-input-control talentry-otp-inputs"
+            role="group"
+          >
+            {digits.map((digit, index) => (
+              <input
+                aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
+                autoComplete={index === 0 ? 'one-time-code' : 'off'}
+                inputMode="numeric"
+                key={index}
+                maxLength={1}
+                className="talentry-otp-input"
+                onChange={(event: ChangeEvent<HTMLInputElement>) =>
+                  updateDigit(index, event.target.value)
+                }
+                onKeyDown={(event) => handleKeyDown(index, event)}
+                onPaste={handlePaste}
+                pattern="[0-9]*"
+                ref={(element) => {
+                  inputRefs.current[index] = element
+                }}
+                type="text"
+                value={digit}
+              />
+            ))}
+          </div>
+        </div>
+
+        <div className="talentry-otp-resend" aria-live="polite">
+          {secondsRemaining > 0 ? (
+            <p className="talentry-password-requirements__title">Resend in {countdown}</p>
+          ) : (
+            <TalentryButton onClick={handleResend} size="small" variant="ghost">
+              Resend code
+            </TalentryButton>
+          )}
+        </div>
+
+        <TalentryButton
+          className="talentry-otp-submit"
+          disabled={!codeIsComplete}
+          size="large"
+          type="submit"
+        >
+          Verify
+        </TalentryButton>
+      </form>
+    </TalentryCard>
+  )
+}
```

### Visual acceptance history: `components/auth/AuthShell.tsx`

This intermediate `<details>/<summary>` correction is retained as review history and is superseded by the final architecture diff in Section 12B.

```diff
@@ -30,11 +30,18 @@
-        <div className="talentry-auth-shell__languages" aria-label="Language control placeholder">
-          <span aria-hidden="true">◎</span>
-          <span>Language</span>
-          <span aria-hidden="true">⌄</span>
-        </div>
+        <details className="talentry-auth-shell__language-menu">
+          <summary className="talentry-auth-shell__languages">
+            <span aria-hidden="true">◎</span>
+            <span>Language</span>
+            <span aria-hidden="true">⌄</span>
+          </summary>
+          <div className="talentry-auth-shell__language-options" aria-label="Language options">
+            <span>English</span>
+            <span>Türkçe</span>
+            <span>Deutsch</span>
+          </div>
+        </details>
```

### Visual acceptance history: `styles/talentry-auth.css`

This intermediate `:has()` correction is retained as review history and is superseded by the explicit class diff in Section 12B.

```diff
@@ -108,6 +108,39 @@
   font-weight: var(--talentry-font-weight-medium);
+  cursor: pointer;
+  list-style: none;
+}
+
+.talentry-auth-shell__languages::-webkit-details-marker {
+  display: none;
+}
+
+.talentry-auth-shell__language-menu {
+  position: relative;
+  justify-self: end;
+}
+
+.talentry-auth-shell__language-options {
+  position: absolute;
+  z-index: 10;
+  inset-block-start: calc(100% + var(--talentry-space-2));
+  inset-inline-end: 0;
+  display: grid;
+  min-width: calc(var(--talentry-space-16) * 2);
+  padding: var(--talentry-space-2);
+  gap: var(--talentry-space-1);
+  border: 1px solid color-mix(in srgb, var(--talentry-color-interview-text) 12%, transparent);
+  border-radius: var(--talentry-radius-md);
+  background: var(--talentry-color-interview-surface);
+  box-shadow: var(--talentry-shadow-elevated);
+  color: var(--talentry-color-interview-muted);
+  font-size: var(--talentry-font-size-sm);
+}
+
+.talentry-auth-shell__language-options span {
+  padding: var(--talentry-space-2) var(--talentry-space-3);
+  border-radius: var(--talentry-radius-sm);
 }
@@ -116,6 +149,16 @@
   margin: var(--talentry-space-6) auto var(--talentry-space-8);
 }
+
+.talentry-auth-shell:has(.talentry-otp-card) {
+  display: grid;
+  grid-template-rows: auto 1fr;
+}
+
+.talentry-auth-shell__content:has(.talentry-otp-card) {
+  align-self: center;
+  margin-block: var(--talentry-space-6);
+}
@@ -153,6 +196,50 @@
   margin-block-start: var(--talentry-space-6);
 }
+
+.talentry-otp-recipient {
+  display: grid;
+  gap: var(--talentry-space-1);
+}
+
+.talentry-otp-recipient strong {
+  color: var(--talentry-color-interview-text);
+  font-size: var(--talentry-font-size-base);
+  font-weight: var(--talentry-font-weight-semibold);
+}
+
+.talentry-otp-inputs {
+  justify-content: center;
+  gap: var(--talentry-space-2);
+}
+
+.talentry-auth-field .talentry-otp-input {
+  width: calc(var(--talentry-space-12) + var(--talentry-space-2));
+  min-height: var(--talentry-button-height-lg);
+  flex: 0 1 auto;
+  padding: 0;
+  text-align: center;
+  font-size: var(--talentry-font-size-xl);
+  font-weight: var(--talentry-font-weight-semibold);
+}
+
+.talentry-otp-resend {
+  min-height: var(--talentry-button-height-sm);
+  display: flex;
+  align-items: center;
+  justify-content: center;
+  color: var(--talentry-color-interview-muted);
+  text-align: center;
+}
+
+.talentry-otp-resend .talentry-password-requirements__title {
+  margin: 0;
+  font-size: var(--talentry-font-size-sm);
+}
+
+.talentry-otp-submit.talentry-button {
+  width: 100%;
+}
@@ -375,6 +462,10 @@
     display: none;
   }
+
+  .talentry-auth-field .talentry-otp-input {
+    width: calc((100% - (var(--talentry-space-2) * 5)) / 6);
+  }
```

## 12A. Initial Visual Acceptance Verification

- Desktop 1440px: the 498px card was vertically centered; recipient, six 58 x 54px OTP controls, resend text, and full-width Verify button were balanced; no overflow. Later acceptance review found the shared ambient background appeared too flat on `/verify`; Section 12C records the correction.
- Language dropdown: the semantic control opened and visibly displayed English, Türkçe, and Deutsch without changing route, language, persistence, or global state.
- Tablet 768px: card remained centered, all six OTP controls stayed horizontally aligned, and no overflow occurred.
- Mobile 390px: card remained centered, six responsive approximately 48 x 54px inputs remained in one aligned row, and no overflow occurred.
- Browser console: no errors or warnings.
- At this intermediate checkpoint the shared A3.1 background declaration and token values were not modified.

## 12B. Final Architecture Correction Diff

```diff
--- components/auth/AuthShell.tsx (intermediate)
+++ components/auth/AuthShell.tsx (final)
@@
+'use client'
+
 import Link from 'next/link'
+import { useState } from 'react'
@@
   backLabel?: string
+  centered?: boolean
 }
@@
-export default function AuthShell({ children, backHref, backLabel }: AuthShellProps) {
+export default function AuthShell({ children, backHref, backLabel, centered = false }: AuthShellProps) {
+  const [languageMenuOpen, setLanguageMenuOpen] = useState(false)
+  const shellClassName = ['talentry-auth-shell', centered && 'talentry-auth-shell--centered']
+    .filter(Boolean).join(' ')
+  const contentClassName = [
+    'talentry-auth-shell__content',
+    centered && 'talentry-auth-shell__content--centered',
+  ].filter(Boolean).join(' ')
@@
-    <main className="talentry-auth-shell">
+    <main className={shellClassName}>
@@
-        <details className="talentry-auth-shell__language-menu">
-          <summary className="talentry-auth-shell__languages">
+        <div className="talentry-auth-shell__language-menu">
+          <button
+            aria-expanded={languageMenuOpen}
+            aria-haspopup="menu"
+            className="talentry-auth-shell__languages"
+            onClick={() => setLanguageMenuOpen((open) => !open)}
+            type="button"
+          >
             <span aria-hidden="true">◎</span>
             <span>Language</span>
             <span aria-hidden="true">⌄</span>
-          </summary>
-          <div className="talentry-auth-shell__language-options" aria-label="Language options">
-            <span>English</span>
-            <span>Türkçe</span>
-            <span>Deutsch</span>
-          </div>
-        </details>
+          </button>
+          {languageMenuOpen && (
+            <div aria-label="Language options" className="talentry-auth-shell__language-options" role="menu">
+              <button role="menuitem" type="button">English</button>
+              <button role="menuitem" type="button">Türkçe</button>
+              <button role="menuitem" type="button">Deutsch</button>
+            </div>
+          )}
+        </div>
@@
-      <div className="talentry-auth-shell__content">{children}</div>
+      <div className={contentClassName}>{children}</div>

--- app/verify/page.tsx (intermediate)
+++ app/verify/page.tsx (final)
@@
-    <AuthShell backHref={AUTH_ROUTES.register} backLabel="Back to Create Account">
+    <AuthShell backHref={AUTH_ROUTES.register} backLabel="Back to Create Account" centered>

--- styles/talentry-auth.css (intermediate)
+++ styles/talentry-auth.css (final)
@@
   color: var(--talentry-color-interview-muted);
+  font-family: inherit;
@@
-.talentry-auth-shell__languages::-webkit-details-marker {
-  display: none;
-}
-
@@
-.talentry-auth-shell__language-options span {
+.talentry-auth-shell__language-options button {
+  width: 100%;
   padding: var(--talentry-space-2) var(--talentry-space-3);
+  border: 0;
   border-radius: var(--talentry-radius-sm);
+  background: transparent;
+  color: inherit;
+  font: inherit;
+  text-align: start;
 }
@@
-.talentry-auth-shell:has(.talentry-otp-card) {
+.talentry-auth-shell--centered {
@@
-.talentry-auth-shell__content:has(.talentry-otp-card) {
+.talentry-auth-shell__content--centered {
```

Final browser evidence:

- Rendered language trigger tag: `BUTTON`.
- Trigger exposed `aria-expanded=true` when opened; popup exposed `role="menu"` with English, Türkçe, and Deutsch.
- CSSOM inspection found zero selectors containing `:has(`.
- Desktop card geometry remained approximately 498 x 364px and centered; mobile geometry and overflow remained unchanged.
- Browser console contained no errors or warnings.

## 12C. Final Shared Background Correction and Verification

The earlier shared 6% indigo / 4% purple background was visually insufficient and appeared too flat. An intermediate centered-only 12%/9% override was also rejected because background and centered-layout concerns must remain separate. The final approved correction was implemented only in `styles/talentry-auth.css` and is shared by `/register` and `/verify`.

```diff
 .talentry-auth-shell {
+  position: relative;
+  isolation: isolate;
   min-height: 100vh;
   min-height: 100dvh;
   padding: var(--talentry-space-4);
-  overflow-x: hidden;
-  background:
-    radial-gradient(
-      circle at top right,
-      color-mix(in srgb, var(--talentry-color-indigo) 6%, transparent),
-      transparent 42%
-    ),
-    radial-gradient(
-      circle at bottom left,
-      color-mix(in srgb, var(--talentry-color-primary) 4%, transparent),
-      transparent 46%
-    ),
-    color-mix(
-      in srgb,
-      var(--talentry-color-interview-canvas) 85%,
-      var(--talentry-color-interview-surface)
-    );
+  overflow: hidden;
+  background: linear-gradient(
+    145deg,
+    color-mix(
+      in srgb,
+      var(--talentry-color-navy-soft) 24%,
+      var(--talentry-color-navy)
+    ) 0%,
+    var(--talentry-color-navy) 48%,
+    color-mix(
+      in srgb,
+      var(--talentry-color-interview-canvas) 14%,
+      var(--talentry-color-navy)
+    ) 100%
+  );
 }

+.talentry-auth-shell::before,
+.talentry-auth-shell::after {
+  position: absolute;
+  z-index: 0;
+  width: 125vw;
+  height: 115vh;
+  content: '';
+  pointer-events: none;
+  filter: blur(calc(var(--talentry-space-16) * 1.5));
+}

+.talentry-auth-shell::before {
+  inset-block-start: -55vh;
+  inset-inline-end: -45vw;
+  background: radial-gradient(
+    ellipse at center,
+    color-mix(in srgb, var(--talentry-color-primary) 36%, transparent) 0%,
+    color-mix(in srgb, var(--talentry-color-primary) 18%, transparent) 34%,
+    transparent 70%
+  );
+  transform: rotate(-10deg) scale(1.06);
+}

+.talentry-auth-shell::after {
+  inset-block-end: -55vh;
+  inset-inline-start: -45vw;
+  background: radial-gradient(
+    ellipse at center,
+    color-mix(in srgb, var(--talentry-color-indigo) 32%, transparent) 0%,
+    color-mix(in srgb, var(--talentry-color-indigo) 16%, transparent) 36%,
+    transparent 72%
+  );
+  transform: rotate(10deg) scale(1.08);
+}

+.talentry-auth-shell__topbar,
+.talentry-auth-shell__content {
+  position: relative;
+  z-index: 1;
+}

 .talentry-auth-shell--centered {
   display: grid;
   grid-template-rows: auto 1fr;
-  background:
-    radial-gradient(
-      ellipse 72% 58% at 96% 4%,
-      color-mix(in srgb, var(--talentry-color-indigo) 12%, transparent),
-      transparent 72%
-    ),
-    radial-gradient(
-      ellipse 70% 60% at 4% 96%,
-      color-mix(in srgb, var(--talentry-color-primary) 9%, transparent),
-      transparent 74%
-    ),
-    color-mix(
-      in srgb,
-      var(--talentry-color-interview-canvas) 85%,
-      var(--talentry-color-interview-surface)
-    );
 }
```

Final manual visual acceptance:

- `/register` and `/verify` display the same shared premium navy, purple, and indigo atmospheric background.
- Broad, smooth transitions are visibly present without harsh spots, neon appearance, or distracting brightness.
- The `/register` Create Account layout is unchanged.
- The `/verify` card remains vertically centered.
- The Language dropdown opens above the decorative background and is not clipped.
- No horizontal overflow was observed and no browser console errors were present.
- The countdown reached zero and `Resend code` appeared correctly with the approved local-only behavior.
- Final visual acceptance: PASSED.
- Final TypeScript and build validation results are recorded in Section 10; both passed with exit code 0 and the final build emitted no webpack cache warning.

## 13. Risks, Limitations, and Technical Debt

- The timer and resend behavior are presentation-only, begin at 119 seconds, and reset on remount.
- The masked email is intentionally static local UI copy and must be replaced only in a future approved integration sprint.
- Non-digit paste content is sanitized locally; no trust-boundary validation exists because there is no integration.
- OTP-specific CSS is scoped through `talentry-otp-*` classes; explicit `AuthShell` modifier classes confine vertical centering to opted-in screens.
- The presentation-only language options are static text and intentionally have no selection behavior.

## 14. Untouched-Module Confirmation

Only `app/verify/page.tsx`, `components/auth/AuthShell.tsx`, `components/auth/OtpVerificationForm.tsx`, `styles/talentry-auth.css`, and the two pending A3.2 reports were modified. Design tokens, UI Kit public APIs, Create Account form behavior, Dashboard, unrelated routes, API, Supabase, package, environment, and prior sprint reports were not modified. No email, verification, authentication, database, success, routing-after-submit, fake loading, package installation, stage, commit, or push occurred.

## 15. Approval Required

Sprint A3.2 is complete and awaiting approval.

No stage, commit, push, or subsequent sprint is authorized until explicit approval.
