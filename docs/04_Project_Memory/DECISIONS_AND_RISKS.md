# Talentry / InterviewAI — Decisions and Risks

This file records approved architectural decisions, their rationale, associated risks, and rollback points.

Rules:

- Do not silently reverse a recorded decision.
- If a decision changes, append a new decision entry explaining why.
- Major architectural changes require explicit risk review before implementation.
- Prefer one approved migration path at a time.
- Preserve working runtime contracts before visual migration.

---

## DECISION-001 — Active Development Branch Is `feature/auth-foundation`

Status: APPROVED

Decision:

Use:

`feature/auth-foundation`

as the canonical active development branch.

Remote recovery:

`origin/feature/auth-foundation`

Do not treat `origin/main` as the latest source of truth until an explicit merge stage is approved.

Rationale:

All current Talentry auth, dashboard, persistence, and recovery work is present on the feature branch.

Risk if ignored:

A developer may incorrectly compare against or restore from an outdated `origin/main` state.

Rollback reference:

Latest safe remote checkpoint as of 2026-08-27:

`eb38e15 feat(dashboard): protect dashboard route`

---

## DECISION-002 — Server-Verified Supabase User Owns Interviews

Status: APPROVED

Decision:

Canonical interview ownership is:

`supabase.auth.users.id`

Ownership must be derived server-side from:

`supabase.auth.getUser()`

Client-supplied owner or user identifiers must never determine database ownership.

Rationale:

This prevents client-side owner spoofing.

Validated behavior:

A client-supplied fake owner identifier did not override the authenticated Supabase user.

Risk if violated:

Critical cross-user data ownership vulnerability.

Rollback reference:

- `860687f`
- `c716643`
- `05e777f`
- `beb3168`

---

## DECISION-003 — Preserve the Existing Interview Runtime Core During UI Migration

Status: APPROVED

Decision:

The existing legacy `/interview` runtime logic is protected functionality.

Future Talentry UI migration must preserve:

- interviewer configuration
- role
- company
- level
- interview type
- persona
- interview language
- Claude question generation
- Claude feedback
- ElevenLabs TTS
- webcam lifecycle
- answer collection
- five-question flow
- scoring
- summary generation
- duration
- authenticated persistence
- server-enforced ownership
- Result handoff

Rationale:

The current interview engine is functional and persistence has passed runtime validation.

Risk if violated:

Critical regression in the main product workflow.

Rollback reference:

`7e644fb feat(interview): persist completed interviews`

---

## DECISION-004 — Do Not Patch Legacy Screens Opportunistically

Status: APPROVED

Decision:

Do not continue small cosmetic fixes on legacy:

- `/`
- `/login`
- `/interview`
- `/result`

unless required for runtime safety.

Instead, migrate each route deliberately into the Talentry architecture.

Examples of avoided temporary work:

- adding isolated legacy password-eye styling
- redesigning legacy Result before ID-based data access exists
- linking Dashboard Quick Actions to a temporary route that will immediately be replaced

Rationale:

Temporary patches create duplicate logic and migration debt.

Risk if ignored:

UI duplication, inconsistent behavior, harder rollback, and confused navigation.

---

## DECISION-005 — Talentry Sign In Is the Next Active Migration Stage

Status:  IMPLEMENTED — PASS

Decision:

Create a new Talentry Sign In implementation at:

`/login`

using the existing shared Talentry auth system.

Expected component:

`components/auth/SignInForm.tsx`

Required primitives:

- `AuthShell`
- `TalentryCard`
- `TalentryButton`
- `SectionHeader`
- `PasswordVisibilityIcon`
- generic Talentry auth field styles
- `AUTH_ROUTES`
- browser Supabase client

Functional contract to preserve:

`supabase.auth.signInWithPassword({ email, password })`

Rationale:

Sign In has an approved blueprint reference but no Talentry implementation exists.

Risk:

Breaking successful authentication while changing presentation.

Rollback reference:

Legacy:

`app/login/page.tsx`

Latest safe branch checkpoint:

`eb38e15`

Validation required before commit:

- valid login
- invalid credentials
- loading state
- password visibility
- Create Account link
- Forgot Password link
- session persistence
- logout compatibility
- redirect behavior
- TypeScript
- diff cleanliness

Implementation completed:

2026-08-28

Implemented architecture:

`/login`
→ `AuthShell`
→ `SignInForm`
→ Supabase `signInWithPassword`
→ `/dashboard`

Runtime validation:

- Talentry Sign In render → PASS
- invalid credentials → PASS
- password visibility → PASS
- Forgot Password navigation → PASS
- Create Account navigation → PASS
- valid Supabase credentials → PASS
- successful `/dashboard` redirect → PASS
- authenticated Dashboard render → PASS
- session persistence after refresh → PASS
- compatibility with existing logout → PASS

Files:

- `app/login/page.tsx`
- `components/auth/SignInForm.tsx`
- `styles/talentry-auth.css`

Stage commit:

Pending final stage-close commit.

---

## DECISION-006 — Successful Talentry Sign In Redirects to `/dashboard`

Status: APPROVED

Decision:

Permanent flow:

`/login`
→ successful Supabase Sign In
→ `/dashboard`

Do NOT create a temporary redirect to legacy `/`.

Rationale:

The user explicitly chose a clean permanent migration path instead of transitional navigation.

Prerequisite already completed:

`/dashboard` is protected server-side.

Commit:

`eb38e15 feat(dashboard): protect dashboard route`

Risk:

If Dashboard auth/session behavior is incorrect, users could enter a redirect loop.

Current validation:

- unauthenticated `/dashboard` → `307 /login`
- authenticated `/dashboard` → renders Dashboard

PASS

---

## DECISION-007 — Dashboard Must Be Server-Protected

Status: IMPLEMENTED

Decision:

Authentication protection for `/dashboard` must be enforced server-side through:

`getAuthenticatedUser()`

Unauthorized access redirects to:

`AUTH_ROUTES.login`

Do not rely only on client-side state.

Rationale:

Client-only protection can flash protected UI or be bypassed.

Implementation:

`app/dashboard/page.tsx`

Commit:

`eb38e15 feat(dashboard): protect dashboard route`

Validation:

PASS

Rollback:

Parent commit:

`3941426`

---

## DECISION-008 — Registration and OTP Are Separate from Sign In Migration

Status: APPROVED

Decision:

Do not combine Register/OTP provider integration into the Talentry Sign In stage.

Current state:

`/register`
→ UI only

`/verify`
→ UI only

Known route mismatch:

`AUTH_ROUTES.verifyCode = /verify-code`

while actual route is:

`/verify`

Planned stage:

Registration / OTP integration

Rationale:

Sign In migration should preserve one focused runtime contract.

Risk if combined:

A larger auth change could make failures harder to isolate and rollback.

---

## DECISION-009 — Password Recovery Flow Must Be Preserved

Status: APPROVED

Decision:

The current Talentry recovery flow is already substantially connected and must not be rewritten during Sign In migration.

Working routes:

`/forgot-password`
→ reset email

`/reset-password`
→ recovery-session-aware password update

`/reset-password/success`
→ success state

Rationale:

This flow already contains real Supabase provider integration.

Risk if changed unnecessarily:

Regression in a previously integrated auth path.

Rollback reference:

`c9da8e1 feat(auth): integrate password recovery flow`

---

## DECISION-010 — Result Migration Requires Owner-Authorized Reads First

Status: APPROVED

Decision:

Do not migrate Result directly to database-backed ID navigation until an authenticated read boundary exists.

Required order:

1. owner-authorized single interview read
2. owner-authorized interview list
3. security validation
4. ID-based Result
5. history UI

Rationale:

Current write API is secure, but there is no read authorization path.

Risk if ignored:

Critical cross-user interview data exposure.

Validation required later:

- unauthenticated → denied
- owner → allowed
- non-owner → denied
- invalid UUID → rejected

---

## DECISION-011 — The Current Mixed UI Is an Unfinished Migration, Not Lost Work

Status: CONFIRMED BY FORENSIC AUDIT

Decision:

Treat legacy and Talentry screens as coexisting generations.

Do not attempt recovery of Talentry Interview/Result screens that do not exist in Git history.

Confirmed:

Talentry implementations exist for:

- design tokens
- UI Kit
- Dashboard foundation
- Create Account
- OTP UI
- Forgot Password
- Reset Password
- Reset Password Success
- password visibility
- auth recovery
- navigation shell

Not found as prior implementations:

- Talentry Welcome
- Talentry Sign In
- Talentry Interview Setup
- Talentry Live Interview
- Talentry Result
- Interview History

Rationale:

Forensic Git audit found no deleted or reverted implementations.

Risk if misunderstood:

Time may be wasted trying to restore work that was never implemented.

---

## DECISION-012 — Welcome Root Cutover Happens Late

Status: APPROVED

Decision:

Do not replace legacy `/` with the Talentry Welcome screen until the authenticated product path is stable.

Preferred migration order:

1. Talentry Sign In
2. Register / OTP integration
3. authenticated interview read boundary
4. ID-based Result
5. Talentry Interview Setup
6. Talentry Live Interview
7. Dashboard functional integrations
8. Welcome cutover at `/`

Rationale:

Legacy `/` is currently the only working Interview Setup entry point.

Risk if replaced early:

The main interview workflow could become unreachable.

---

## DECISION-013 — Project Memory Must Be Updated Before Every New Stage

Status: APPROVED

Decision:

Before beginning a new stage:

1. close the current stage
2. validate runtime behavior
3. update `CURRENT_STATE.md`
4. append `STAGE_LOG.md`
5. update `DEFERRED_FIXES.md`
6. update `DECISIONS_AND_RISKS.md` if required
7. commit
8. push
9. confirm local/remote synchronization
10. confirm clean working tree
11. only then start the next stage

Rationale:

This prevents lost context, forgotten technical debt, and ambiguous rollback points.

Canonical Project Memory folder:

`docs/04_Project_Memory`

---

# Current Major Risks

## RISK-001 — Authentication Regression

Severity: HIGH

Area:

Talentry Sign In migration

Potential failure:

- valid credentials stop working
- session is not persisted
- redirect loop between `/login` and `/dashboard`
- logout no longer works

Mitigation:

Preserve `signInWithPassword`.
Test both valid and invalid credentials.
Verify authenticated Dashboard access.

Rollback:

`eb38e15`

---

## RISK-002 — Cross-User Interview Data Exposure

Severity: CRITICAL

Area:

Future read/history implementation

Potential failure:

One authenticated user reads another user's interviews.

Mitigation:

Server-side ownership enforcement.
Never trust client owner IDs.
Test non-owner denial before exposing UI.

Current status:

Write ownership is secure.
Read API does not yet exist.

---

## RISK-003 — Live Interview Functional Regression

Severity: CRITICAL

Area:

Future Talentry Live Interview migration

Potential failure:

- question generation breaks
- feedback breaks
- TTS breaks
- camera lifecycle breaks
- answer state is lost
- final score/summary fails
- persistence fails

Mitigation:

Separate runtime behavior from presentation carefully.
Validate full five-question flow before commit.
Keep current legacy engine as rollback.

---

## RISK-004 — Temporary Route Debt

Severity: MEDIUM-HIGH

Area:

Navigation

Potential failure:

Temporary links become permanent and create duplicated routes.

Mitigation:

Use permanent destinations when architecture is already known.

Current example:

Talentry Sign In will go directly to `/dashboard`, not legacy `/`.

---

## RISK-005 — Result Tampering / Privacy

Severity: HIGH

Area:

Current `/result`

Current behavior:

Score and summary come from URL query parameters.

Potential impact:

- user can edit score
- summary text appears in URL/history
- no ownership verification
- direct route access is disconnected from persistence

Mitigation:

Move to authenticated ID-based Result only after read API exists.

---

## RISK-006 — Interview Media State Is Incomplete

Severity: MEDIUM

Known issues:

- `audio:false` while mic toggle exists
- `connected` never becomes true
- `videoRef` unused
- incomplete HeyGen path
- object URLs not revoked

Mitigation:

Treat as a dedicated interview media/runtime stage.
Do not opportunistically refactor during auth work.

---

## RISK-007 — No Automated Test Suite Protects Core Flow

Severity: HIGH

Area:

Auth + interview + persistence

Current mitigation:

Manual runtime validation and small commits.

Future need:

Introduce automated coverage around:

- auth boundaries
- persistence
- ownership
- interview state transitions
- Result reads

Do not let test infrastructure work block the current focused migration stage unless required for safety.

---

## RISK-008 — Large Unrelated Diffs

Severity: MEDIUM

Cause:

- global formatting
- Windows line-ending normalization
- broad refactors

Mitigation:

- one focused file/change at a time
- avoid global formatter in legacy files
- use `git --no-pager diff`
- use `git diff --check`
- treat LF → CRLF warning as non-blocking unless real diff noise appears

---

# Current Recovery Point

Latest safe commit:

`eb38e15 feat(dashboard): protect dashboard route`

Remote:

`origin/feature/auth-foundation`

Current next stage:

Talentry Sign In

---

## DECISION-014 — Stage-Level Commit and Push Protocol

Status: APPROVED

Decision:

Do not commit or push after every micro-step.

Normal development protocol:

1. Start a stage from a clean working tree.
2. Perform the stage in small controlled steps.
3. Do not create commits for each small edit.
4. Complete static and runtime validation for the whole stage.
5. Update only the Project Memory files affected by that stage.
6. Review the complete diff.
7. Create one stage-level commit containing the approved code and relevant Project Memory updates.
8. Push once.
9. Confirm local/remote synchronization.
10. Confirm the working tree is clean before starting the next stage.

Project Memory update behavior:

- `CURRENT_STATE.md` is refreshed to represent the latest project state.
- `STAGE_LOG.md` is append-only.
- `DEFERRED_FIXES.md` is changed only when a deferred item is added, resolved, or materially updated.
- `DECISIONS_AND_RISKS.md` is changed only when a decision or risk is added or materially changed.

Exceptions:

A separate checkpoint commit may be created when:

- a major recovery point is needed,
- a high-risk architectural change is about to begin,
- governance/project-memory infrastructure changes,
- work must stop before a stage can safely be completed.

Rationale:

This preserves clean recovery points without creating unnecessary commit/push overhead.

---

## RISK-009 — Supabase Project Pause / Availability

Severity: HIGH

Status: ACTIVE MONITORING RISK

Observation:

A recent Supabase email warned that the project may be paused.

Potential impact:

If the Supabase project becomes paused or unavailable:

- Sign In runtime tests may fail.
- Dashboard authentication may appear broken.
- Password recovery may fail.
- Interview persistence may fail.
- Database read/write tests may fail.
- Provider/network failures could be incorrectly diagnosed as application-code regressions.

Required operating rule:

Before Supabase-dependent runtime validation, confirm that the Supabase project is active and reachable.

If authentication or persistence suddenly fails without a related code change:

1. check Supabase project status first,
2. distinguish provider/project availability from application regression,
3. do not modify working code until infrastructure status is confirmed.

Do not treat a Supabase pause as evidence that the authenticated ownership or persistence implementation is broken.

Current known safe code checkpoint before the next auth migration stage:

`9f0594b docs(project): add project memory checkpoint`

---

## DECISION-015 — Codex Interruption / Recovery Protocol

Status: APPROVED

Date:

2026-08-28

Purpose:

Prevent duplicate edits, accidental re-runs, or unnecessary recovery actions when Codex disappears, restarts, loses its visible panel, or requests a new local permission.

Operating rule:

If Codex unexpectedly disappears, closes, restarts, or loses its visible session during an active stage:

1. Do NOT immediately rerun the original implementation prompt.
2. Do NOT reinstall or reset the repository as the first response.
3. Do NOT use `git restore`, `git reset`, `git stash`, or branch changes before checking the working tree.
4. First run:

   `git status --short`

5. If stage files are already modified, treat those changes as potentially valid in-progress work.
6. Inspect the existing diff before asking Codex to continue.
7. Reopen the Codex desktop application or existing conversation if available.
8. If the original Codex conversation cannot be resumed, use a continuation prompt that explicitly tells Codex to inspect and continue the existing working-tree changes rather than recreating them.
9. Re-run validation after recovery.
10. Commit only after the whole stage passes normal stage-close validation.

Permission rule:

When Codex requests permission for a local generated-cache or development-process operation, prefer one-time permission unless a broader permanent permission is explicitly required and reviewed.

Do not grant broad permanent permissions casually.

Primary Codex working surface:

Use the Codex desktop application as the main agent surface for repo-wide implementation stages.

VS Code Codex integration may remain available as a secondary tool, but do not run two Codex agents against the same stage concurrently.

Rationale:

During the 2026-08-28 Talentry Sign In stage, the Codex desktop/permission flow temporarily disappeared from view after a local Next.js process/cache operation.

The implementation itself was not lost.

Working-tree inspection confirmed the in-progress Sign In files were still present:

- `app/login/page.tsx`
- `styles/talentry-auth.css`
- `components/auth/SignInForm.tsx`

The existing work was successfully recovered without re-running the original implementation prompt.

---

## RISK-010 — Next.js Build / Dev `.next` Concurrency

Severity: MEDIUM

Status: ACTIVE OPERATING RISK

Observed:

2026-08-28

During Talentry Sign In validation, a production build and an older development process used the same generated `.next` output concurrently.

Result:

A generated runtime/cache mismatch occurred.

Important:

No application source code was damaged or lost.

Recovery required only:

- stopping/restarting the verified local Next.js process
- regenerating `.next`

Operating rule:

Do not run:

`npm run build`

and the development server concurrently against the same `.next` output during controlled validation.

If a `.next` runtime mismatch occurs:

1. treat `.next` as generated cache,
2. verify the working tree before changing source,
3. stop conflicting Next.js processes,
4. regenerate the cache,
5. do not restore source files unless Git evidence shows a source regression.
