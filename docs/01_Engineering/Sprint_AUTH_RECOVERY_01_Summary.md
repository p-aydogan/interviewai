# Sprint AUTH_RECOVERY_01 Summary

- Title: Recovery reliability with verified recovery provenance and refresh continuity
- Branch: feature/auth-foundation; Pre-implementation HEAD: ff67db4.
- Status: Hardened implementation and automated validation complete; browser runtime acceptance COMPLETE — PASS (user-supplied verified results recorded 2026-09-27).
- Goal: Preserve recovery across refresh, revoke stale reset UI, require verified recovery AMR, tolerate legitimate token rotation, and remove periodic polling.
- Starting state for hardening: Existing uncommitted controller, tests, component changes, and both reports preserved. No reset/discard. These reports updated in place under the user's explicit instruction.
- Modified tracked file: components/auth/PasswordRecoveryFlow.tsx.
- Existing untracked files updated: components/auth/recovery-session.ts; components/auth/recovery-session.test.cjs; this Summary; Sprint_AUTH_RECOVERY_01_Engineering_Report.md.
- Provenance: SDK auth.getClaims(token) must verify claims with an AMR object whose method is exactly recovery. auth.getUser(token) must succeed; claim sub, provider user ID and session user ID must match. Required for establishment, restoration and each rotated token.
- Continuity: sessionStorage key talentry.password-recovery.v1 stores only userId, sessionId, expiresAt. Fixed 15-minute lifetime. A marker never proves recovery. Restoration also requires no residual callback/error parameters and the same verified user/session identity.
- Rotation: Token differences trigger verification of latest claims/user/AMR and matching stable identity. Recheck the current session after verification. Generation cancellation and the existing validation deadline prevent stale work from restoring eligibility.
- Revocation: SIGNED_OUT/null session synchronously clear marker and ready state. Identity/provenance failures, expiry, successful update, and external USER_UPDATED revoke. Focus/pageshow/visibility, auth events and pre-submit checks remain. No periodic interval remains.
- TypeScript: npx tsc --noEmit --incremental false exited 0; no diagnostics.
- Regression tests: node --test components/auth/recovery-session.test.cjs exited 0; 34 passed, 0 failed/cancelled/skipped/todo. Ten new test cases plus token-specific realistic AMR/user mocks.
- Whitespace: git diff --check exited 0; no whitespace errors. Git warned about future LF-to-CRLF conversion for PasswordRecoveryFlow.tsx.
- Production build: npm run build exited 0; Next.js 14.2.5 compiled, linted/type-checked and generated 22/22 pages. /reset-password: 5.03 kB; First Load JS 166 kB.
- Notices: npm advertised optional 11.16.0 -> 12.1.0 upgrade. No dependency update/install performed.
- Dev server: Already stopped at the start of hardening; no process stopped or restarted this turn.
- Risks: The supplied Chrome live flow confirms recovery-AMR acceptance and same-profile cross-tab logout revocation; this is not exhaustive browser or custom-hook configuration coverage. Missing recovery AMR fails closed. sessionStorage is client controlled; local TTL is UX continuity, not a server-enforced one-use credential. Silent remote revocation is found on the next retained check. Provider requests may complete after UI timeout; late results cannot restore ready/navigation.
- Acceptance: Browser runtime acceptance COMPLETE — PASS, supplied by the user. Prior automated validation results above are retained, not rerun. This documentation-only update modifies the existing reports and four project-memory files; no application/test edits, staging, commit or push. At documentation closure, AUTH_RECOVERY_01 was uncommitted against base ff67db4.


## Historical PKCE diagnosis

The original PKCE failures were attributed to provider flow-state expiry/timing, not a missing verifier cookie; verifier generation/storage was runtime-verified. The core automatic Supabase recovery PKCE happy path worked when a fresh link was opened promptly. Implementation addressed two separate reliability issues: refresh continuity and stale recovery UI after same-profile cross-tab logout. Later Edge-to-Chrome failures were separate, expected different-browser/profile PKCE rejection.

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
