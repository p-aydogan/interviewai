# Sprint A3.4 Summary

- Title: Reset Password Screen
- Branch: `feature/auth-foundation`
- Status: Approved
- Goal: Implement the local-only `/reset-password` UI and extract the approved password-visibility SVG into one shared auth component.

## Created Files

- `app/reset-password/page.tsx`
- `components/auth/ResetPasswordForm.tsx`
- `components/auth/PasswordVisibilityIcon.tsx`
- `docs/01_Engineering/Sprint_A3.4_Summary.md`
- `docs/01_Engineering/Sprint_A3.4_Engineering_Report.md`

## Modified Files

- `components/auth/CreateAccountForm.tsx`
- `styles/talentry-auth.css`

## Implemented Local Behavior

- Added controlled New password and Confirm new password fields.
- Preserved independent show/hide state and accessible dynamic labels for both fields.
- Shows `Passwords do not match.` only after the non-empty confirmation field has blurred and the values differ.
- Removes the mismatch state immediately when the values match.
- Keeps Reset password disabled until the required rules pass and both values match exactly.
- Submit calls only `event.preventDefault()`.
- Added a centered AuthShell route with Back to Forgot Password navigation through `AUTH_ROUTES.forgotPassword`.

## Password Requirements

The form reuses the approved `PasswordRequirements` component and its existing validation helper:

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- Special character recommended, not required

## Shared-Icon Extraction

The exact approved SVG was moved from the local Create Account renderer into `PasswordVisibilityIcon.tsx`. Create Account and Reset Password now use the same component for hidden and visible states. Create Account validation, state, labels, layout, and submission behavior were not changed.

## Microsoft Edge Native-Control Correction

Microsoft Edge browser acceptance exposed its native password-reveal control alongside the custom Talentry visibility button. Two separate, narrowly scoped rules now hide `::-ms-reveal` and `::-ms-clear` only for inputs inside `.talentry-auth-password-control`. Final Edge verification with populated and focused password inputs passed: only one custom icon appeared in each field. The shared Talentry icon, layout, validation, accessibility, routing, API/Supabase boundaries, and form behavior were not changed.

## Register Mobile Overflow Correction

Browser acceptance at 390 × 844 exposed right-edge clipping on `/register`. The card combined `width: 100%`, mobile padding, and a border under the default content-box model, making its rendered border box wider than its parent. The existing mobile `.talentry-create-account.talentry-card` rule now adds only `box-sizing: border-box`. No width, padding, margin, overflow, transform, component behavior, validation, accessibility, routing, API, or Supabase logic changed. Desktop and tablet are unaffected because the correction is limited to `max-width: 36rem`.

## Validation Results

- `npx.cmd tsc --noEmit --incremental false`: Re-run after the mobile overflow correction; passed, exit code 0, no output.
- `npm.cmd run build`: Re-run after the mobile overflow correction; passed, exit code 0.
- Next.js compiled successfully; linting and type checking passed.
- Static pages generated successfully: 15/15.
- `/reset-password`: generated as static content, 2.47 kB, 96.4 kB First Load JS.
- Technical validation did not start the development server. Browser/UX acceptance was completed separately and passed.

## Final Browser Acceptance

- Reset Password desktop: PASS. The card, shared background, fields, password-requirements panel, disabled action, clipping, and horizontal overflow checks passed.
- Local validation: PASS. `Passwords do not match.` appeared only after blur for differing non-empty values, disappeared immediately on a match, and the action enabled only when required rules passed and values matched. Special characters remained recommended and non-blocking.
- Password visibility: PASS. Both controls operated independently, both fields could be revealed simultaneously, shared icons stayed aligned, and no layout shift occurred.
- Microsoft Edge: PASS. Native reveal controls remained hidden for populated, focused inputs; each field displayed only the custom Talentry icon.
- Submit behavior: PASS. Reset password caused no navigation, cleared no values, and produced no loading, success state, mutation, or route change; submission remained `event.preventDefault()` only.
- Desktop: PASS.
- Tablet 768 × 1024: PASS. The card remained centered with balanced margins and no clipping or horizontal overflow.
- Mobile 390 × 844: PASS. The full card, all four corners, fields, and action remained inside the viewport with no horizontal overflow.
- Mobile route regression at 390 × 844: `/register`, `/reset-password`, `/forgot-password`, and `/verify` all passed. Register margins were balanced; Reset and Forgot stayed centered; all six Verify OTP inputs remained inside the centered card.
- Navigation: PASS. The `/reset-password` back control navigated to `/forgot-password`.

## Risks and Limitations

- No real password update or authentication mutation exists.
- No reset-token parsing or validation exists.
- No API, Supabase, database, email, success state, loading state, delay, or post-submit navigation exists.
- The form reuses the existing centered auth-card sizing hook; no design token was changed.
- The existing `talentry-forgot-password-card` sizing-class dependency remains semantic technical debt.

## Approval Status

Approved.

Final approval was granted after technical validation and final browser/UX acceptance passed. The local Sprint A3.4 commit is authorized. Push remains unauthorized, and Sprint A3.5 was not started.
