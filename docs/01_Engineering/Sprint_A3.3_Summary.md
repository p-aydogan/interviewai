# Sprint A3.3 Summary

- Sprint ID: A3.3
- Title: Forgot Password Screen
- Branch: `feature/auth-foundation`
- Status: Awaiting approval
- Goal: Implement the local-only Forgot Password screen at `/forgot-password` using the approved shared authentication system.

## Created files

- `app/forgot-password/page.tsx`
- `components/auth/ForgotPasswordForm.tsx`
- `docs/01_Engineering/Sprint_A3.3_Summary.md`
- `docs/01_Engineering/Sprint_A3.3_Engineering_Report.md`

## Modified files

- `components/auth/ForgotPasswordForm.tsx`
- `styles/talentry-auth.css`
- `docs/01_Engineering/Sprint_A3.3_Summary.md`
- `docs/01_Engineering/Sprint_A3.3_Engineering_Report.md`

## Implemented local behavior

- Added the centered `/forgot-password` route with the existing `AuthShell`, Language dropdown, shared authentication background, and back navigation to `AUTH_ROUTES.login`.
- Added a controlled email field with `type="email"`, `autoComplete="email"`, and trimmed syntactic validation.
- The primary action remains disabled while the trimmed email is empty or invalid.
- The validation message appears only after blur for a non-empty invalid value and disappears when the email becomes valid.
- Submit only calls `event.preventDefault()`.
- No real password-reset request, email delivery, API, Supabase, success state, loading state, account mutation, or post-submit navigation was implemented.

## Final acceptance corrections

- Added the scoped `talentry-forgot-password-card` hook.
- At 390 × 844, mobile border-box sizing keeps the approximately 327.2px card within the approximately 327.2px content track, from x=24px to x=351.2px with approximately 24px equal gutters.
- At 768 × 1024, the centered shell uses tablet-only border-box sizing and a viewport-safe minimum height; centered content uses symmetric block margins.
- At the tablet breakpoint, both `.talentry-forgot-password-card.talentry-card` and `.talentry-otp-card.talentry-card` use border-box sizing.
- Final tablet Forgot Password and OTP card width is 448px with 160px equal gutters, centered in the usable area below the topbar.
- Tablet client and scroll height both measure 1024px; no page overflow or clipping remains.

## Final manual visual acceptance

- Desktop: shared navy, purple, and indigo background displayed correctly; the card was centered; the Language menu stayed inside the viewport; no clipping or horizontal overflow occurred.
- Form: empty email kept the CTA disabled; invalid non-empty email showed the approved message after blur; valid email removed the error and enabled the CTA.
- Clicking Send reset code caused no navigation, loading, success state, or network request.
- Mobile 390 × 844: the complete card, all four rounded corners, equal side gutters, and Language menu remained inside the viewport without horizontal overflow.
- Tablet 768 × 1024: Forgot Password and OTP regression checks passed with centered cards, equal gutters, no page scrollbar, and no clipping.
- Final browser/UX acceptance: PASSED.

## Validation results

- The development server was stopped before final validation.
- `npx.cmd tsc --noEmit --incremental false`: passed with exit code 0, no TypeScript errors, and no output.
- `npm.cmd run build`: passed with exit code 0.
- The final build compiled successfully, passed linting and type checking, and generated 14/14 static pages.
- `/forgot-password`: 1.79 kB, 95.7 kB First Load JS.
- `/verify`: 2.27 kB, 96.2 kB First Load JS.
- No warning appeared in the final build output.

## Risks and limitations

- Email validation is intentionally syntactic and local; authoritative validation belongs to a future integration boundary.
- The route is not connected to a real reset service and intentionally provides no success state.
- Integration with a real reset flow remains future approved work.

## Approval status

Awaiting approval.

No stage, commit, push, or subsequent sprint is authorized until explicit approval.
