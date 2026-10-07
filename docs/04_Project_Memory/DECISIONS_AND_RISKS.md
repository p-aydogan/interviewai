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

Latest safe remote checkpoint as of 2026-08-29:

`79d8b02 feat(api): add owner-scoped interview reads`

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

Interview read/history implementation

Potential failure:

One authenticated user reads another user's interviews.

Mitigation:

Server-side ownership enforcement.
Never trust client owner IDs.
Test non-owner denial before exposing UI.

Current status:

Write ownership is secure.
The authenticated list GET now enforces server-derived ownership and passed real cross-user isolation testing.
The owner-authorized detail GET combines interview ID with server-derived ownership and passed real cross-user isolation and not-found privacy testing.
Result and Full My Interviews are implemented; the owner-filtered server APIs remain mandatory for every detail/list request, including cursor continuation. Runtime acceptance covers 13 records, not >20-record pagination. Dashboard recent-history presentation has been removed.

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

Status: MITIGATED — ID-BASED RESULT RUNTIME PASS

Area:

Result data boundary

Previous behavior:

Score and summary come from URL query parameters.

Potential impact:

- user can edit score
- summary text appears in URL/history
- no ownership verification
- direct route access is disconnected from persistence

Implemented mitigation:

- legacy `/result` redirects to `/` and cannot render supplied query values;
- successful Interview completion requires valid evaluation, successful persistence, and a validated returned UUID;
- `/result/[id]` loads persisted data only through owner-authorized `GET /api/interviews/[id]`;
- unauthenticated access redirects to `/login`;
- invalid, nonexistent, and non-owner IDs do not disclose Result data;
- malformed API responses are not rendered.

Runtime validation:

- forged query-string Result → denied by redirect → PASS
- owner Result and direct refresh → PASS
- cross-user UUID access → safe unavailable state → PASS
- invalid/nonexistent IDs → uniform unavailable state → PASS
- unauthenticated Result → `/login` → PASS
- persistence failure → no successful Result → PASS

Remaining boundary:

The UUID remains an identifier, not authorization. Server-enforced owner filtering must remain intact in all future Result and history work.

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

`6569572 feat(interviews): add paginated history and simplify dashboard`

Remote:

`origin/feature/auth-foundation`

Current uncommitted completed stage:

User Menu / Profile app-shell — main-flow runtime acceptance and production build PASS; unstaged and uncommitted

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

During Live Interview runtime validation, simultaneous Next development servers also produced confusing port, cache, hot-reload, and route-state observations. Next.js 14.2.5 development/HMR route-state instability remains an environment risk even though the production build passed.

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

Run only one Next development server for this repository during controlled acceptance.

---

## DECISION-016 — Register / OTP Uses Canonical Supabase Email OTP Semantics

Status: IMPLEMENTED — PASS

Date:

2026-08-28

Decision:

The permanent registration flow is:

`/register`
→ `supabase.auth.signUp`
→ tab-scoped pending-email handoff
→ `/verify`
→ `verifyOtp` with `type: 'email'`
→ authenticated session
→ `/dashboard`

Signup confirmation resend uses:

`supabase.auth.resend({ type: 'signup', email })`

Rationale:

The exact installed `@supabase/supabase-js` and `@supabase/auth-js` 2.110.8 stack documents `email` as the preferred verification type for signup email OTPs. The same installed stack documents `signup` as the correct resend type.

Email handoff decision:

Use tab-scoped `sessionStorage` rather than query parameters or a global auth store. This keeps the email out of the URL and limits its lifetime and scope.

Provider acceptance:

- fresh signup → PASS
- real six-digit email OTP → PASS
- invalid OTP rejection → PASS
- signup resend → PASS
- valid OTP and session → PASS
- Dashboard redirect and refresh persistence → PASS

Remote configuration:

The Confirm signup template was manually updated to include `{{ .Token }}` and retain `{{ .ConfirmationURL }}` as a fallback. No other remote Supabase configuration was changed.

---

## RISK-011 — Authentication Email Deliverability

Severity: MEDIUM-HIGH

Status: DEFERRED — PRODUCTION READINESS

Observation:

Talentry/Supabase authentication emails were delivered during acceptance testing but appeared in the recipient's Junk/Spam folder.

Impact:

Users may miss signup, resend, or recovery emails even when the application and provider flow are functioning correctly.

Current assessment:

This does not invalidate the Register / OTP functional PASS.

Deferred mitigation:

- review sender/domain reputation
- verify SPF, DKIM, and DMARC alignment
- review production SMTP/provider configuration
- monitor delivery, bounce, and spam-placement behavior

Operating rule:

Do not make SMTP, sender-domain, or provider changes during unrelated development stages. Treat deliverability work as a controlled production-readiness task.

---

## DECISION-017 — Interview List Reads Use a Narrow Server-Owned Boundary

Status: IMPLEMENTED — PASS

Date:

2026-08-29

Decision:

`GET /api/interviews` must:

1. resolve the authenticated user through `getAuthenticatedUser()`;
2. create the server-only privileged client only after authentication succeeds;
3. enforce `owner_id = auth.user.id`;
4. ignore all client-provided ownership identity;
5. select only the fields required by the public list DTO;
6. omit ownership, answers, summary, persona, and interviewer-key fields;
7. return newest-first records with deterministic ID tie-breaking.

Rationale:

The privileged client bypasses browser table restrictions, so server-derived ownership filtering and explicit data minimization form the critical read boundary.

Runtime validation:

- unauthenticated denial → PASS
- empty authenticated owner → PASS
- POST regression → PASS
- owner list read → PASS
- ownership-spoof query parameters ignored → PASS
- real User A / User B isolation → PASS
- session refresh preserved owner scope → PASS
- observed newest-first ordering → PASS

Sequencing clarification:

`DECISION-010` originally listed single-record read before list read. This explicitly approved stage delivered and validated the bounded list read first. It does not authorize Result migration. The next required dependency remains an owner-authorized interview detail-by-ID boundary.

---

## RISK-012 — Interview List Scalability and Database Typing Debt

Severity: LOW-MEDIUM

Status: DEFERRED — NON-BLOCKING

Current state:

- `GET /api/interviews` is intentionally unpaginated.
- No `(owner_id, created_at)` index exists.
- Generated database TypeScript types are not present.
- The list and detail routes use local row annotations matching the current migration.
- The detail route runtime-validates answers because the database `jsonb` column does not enforce q/a object structure.

Current assessment:

These constraints do not block the validated owner-isolation boundary at the current scale.

Deferred mitigation:

- introduce pagination before owner histories become large
- add an owner/time index when query volume and execution plans justify it
- adopt generated database types in a dedicated schema-typing stage

Operating rule:

Do not combine these scalability/type-system changes with the owner-authorized detail route unless measurements or correctness require them.

---

## DECISION-018 — Interview Detail Reads Preserve Owner Privacy and Validate JSONB

Status: IMPLEMENTED — PASS

Date:

2026-08-29

Decision:

`GET /api/interviews/[id]` must:

1. authenticate before UUID validation and privileged access;
2. read the interview ID only from the dynamic route parameter;
3. reject malformed UUID syntax before querying;
4. combine `id = requested ID` with `owner_id = auth.user.id`;
5. return the same `404` body for nonexistent and non-owner records;
6. explicitly select the persisted detail fields without `owner_id`;
7. runtime-validate answers as `Array<{ q: string; a: string }>`;
8. return generic client-safe errors without Supabase/internal details.

Rationale:

The privileged admin client makes the combined ID/owner filter the critical authorization boundary. Uniform not-found semantics prevent cross-user existence disclosure, while local JSONB validation prevents malformed persisted answer data from crossing the public API boundary.

Runtime validation:

- unauthenticated detail denial → PASS
- User A own detail → PASS
- User B own detail → PASS
- User B request for User A detail → privacy-preserving 404 → PASS
- nonexistent UUID → identical 404 → PASS
- invalid UUID → 400 before query → PASS
- ownership-spoof query parameters ignored → PASS
- existing list GET regression → PASS
- existing POST regression → PASS
- POST UUID → matching detail GET → PASS

Accuracy boundary:

Database failure, malformed historical answers, fake ownership headers/bodies, and direct browser/RLS access were not destructively runtime-tested. Their behavior was established by static architecture review.

Result boundary:

This decision completes the authenticated read prerequisite but does not migrate Result. Legacy Result still trusts score/summary query parameters, and Interview still ignores the persisted POST UUID.

---

## DECISION-019 — Result Uses Persisted UUID Handoff and Owner-Authorized Reads

Status: IMPLEMENTED — PASS

Date:

2026-08-30

Decision:

The permanent Result data flow is:

completed Interview
→ validated final evaluation
→ successful authenticated `POST /api/interviews`
→ validated persisted UUID
→ `/result/<UUID>`
→ owner-authorized `GET /api/interviews/[id]`
→ runtime-validated persisted Result rendering

Rules:

1. score and summary must never be trusted from Result query parameters;
2. persistence must succeed before Result navigation;
3. zero-answer and failed-evaluation flows must not fabricate a Result;
4. the client must not supply ownership identity;
5. Result must read through the established same-origin API boundary, not Supabase directly;
6. invalid, nonexistent, and non-owner records must remain privacy-preserving;
7. malformed API responses must not render as trusted Result data;
8. duplicate completion work must be synchronously guarded;
9. explicit retry may reuse current Interview state after a recoverable failure;
10. zero-answer termination intentionally creates no persisted Result.

Rationale:

The persisted UUID identifies the record while the authenticated API enforces ownership. This removes browser-controlled Result values and makes direct refresh compatible with the stored interview record without moving privileged credentials or authorization logic into the client.

Runtime validation:

- real Interview → persisted UUID Result → PASS
- Result refresh → PASS
- forged legacy query values → not rendered → PASS
- cross-user UUID access → denied without data disclosure → PASS
- invalid/nonexistent UUID → uniform unavailable UI → PASS
- unauthenticated Result → `/login` → PASS
- zero-answer completion → no evaluation/POST/Result → PASS
- duplicate completion → one POST → PASS
- persistence failure → remains on Interview → PASS
- explicit persistence retry → PASS
- detail network failure and same-ID Retry → PASS

Design boundary:

This stage migrated Result data trust and routing. It did not perform the future Talentry Result visual redesign.

---

## RISK-013 — Ambiguous Persistence Retry Can Duplicate an Interview

Severity: MEDIUM

Status: DEFERRED — NON-BLOCKING

Scenario:

The server may commit an interview successfully while the client never receives the response. A later explicit completion retry could then create a second persisted record.

Acceptance boundary:

The runtime persistence-failure test blocked the POST before server submission. It proved safe client failure and retry behavior but did not reproduce an ambiguous committed-but-response-lost condition.

Current assessment:

This does not invalidate the ID-Based Result Migration PASS. The current stage deliberately added no automatic retry and no idempotency architecture.

Deferred mitigation:

Design a server-recognized idempotency key or equivalent completion identity in a dedicated persistence-hardening stage before retry ambiguity becomes operationally significant.

Operating rule:

Do not claim idempotency is solved, and do not add ad hoc client-only duplicate suppression during unrelated UI migration.

---

## DECISION-020 — Interview Setup Is a Canonical Authenticated Route

Status: IMPLEMENTED — PASS

Date:

2026-09-01

Decision:

The permanent Setup route is:

`/interview/setup`

It is an authenticated product step in this journey:

Welcome
→ Sign In / Create Account / Verify
→ Dashboard
→ Interview Setup
→ Live Interview
→ persisted Result
→ Dashboard / History

Rules:

1. `/interview/setup` authenticates server-side through the existing `getAuthenticatedUser()` primitive.
2. Unauthorized requests redirect to `/login` before the client Setup form renders.
3. The client Setup form does not perform session detection, subscribe to auth changes, or provide Sign In, Create Account, or Logout controls.
4. The Setup header contains only Talentry branding, independent application-language selection, and a localized Back to Dashboard action.
5. Setup preserves the exact `iv`, `role`, `company`, `level`, `itype`, `persona`, `language`, and `cv` handoff to the existing Live Interview.
6. Application language and interview language remain independent.
7. Role/company remain optional and are trimmed; CV remains hidden and is emitted only as empty `cv=` compatibility data.
8. `/` temporarily redirects to `/interview/setup` until the separate Welcome/root cutover stage.
9. Dashboard wiring to Setup remains deferred to Dashboard / History / Sidebar integration.

Rationale:

Setup belongs after authenticated Dashboard entry and before Live Interview. Enforcing authentication at the server route reuses the established session boundary, avoids client-only access control, and keeps identity out of the query handoff. A stable canonical route prevents future Dashboard and Welcome work from depending on the temporary root location.

Runtime validation:

- unauthenticated Setup denial → `/login` → PASS
- authenticated Setup render → PASS
- localized Dashboard return → PASS
- UI/interview language independence → PASS
- exact non-default and whitespace query handoffs → PASS
- tablet/mobile responsiveness → PASS
- full Setup → Live Interview → persisted UUID Result → PASS
- persisted Result refresh → PASS

Temporary root boundary:

Until Welcome is implemented, `/` redirects to `/interview/setup`; unauthenticated root access consequently reaches `/login` through the Setup auth guard. This is intentional temporary route debt, not the permanent Welcome behavior.

Live Interview boundary:

This decision changes Setup presentation and routing only. The validated Live Interview engine, persistence, authenticated ownership, UUID Result handoff, retry, and failure behavior remain protected for the next Talentry Live Interview migration.

---

## DECISION-021 — Mobile Live Interview Uses a Three-Panel Pager

Status: IMPLEMENTED AND RUNTIME VALIDATED — PASS

Date:

2026-09-06

Decision:

At `<=640px`, Live Interview uses a native horizontal scroll-snap pager with exactly three conceptual panels:

1. Interviewer
2. Question / Answer / Notes / Controls
3. Feedback

Rules:

1. Mobile opens silently on the Interviewer panel.
2. First actual entry into the Question panel through CTA, swipe, or pagination triggers Q1/TTS exactly once.
3. `initialQuestionTriggeredRef` prevents duplicate generation and replay across navigation paths.
4. The Feedback panel is gated until the existing feedback state is ready.
5. The third pagination dot is visible but disabled until feedback exists.
6. Feedback is not rendered inside the mobile Question panel; that panel shows a compact localized ready cue and explicit View Feedback action.
7. The Feedback panel is review-only and cannot generate the next question.
8. The user returns to the Question panel through button, swipe, or pagination before continuing with Next Question.
9. Starting the next question clears old feedback and gates the third panel again.
10. Desktop/tablet retain the existing Talentry Live Interview layout and automatic initial-question behavior.

Rationale:

The three-panel structure keeps interviewer presence, answer work, and evaluation readable within a normal phone viewport without placing detailed feedback below a long question form. Native scroll snap preserves familiar swipe behavior, while buttons and pagination ensure that critical navigation is not swipe-only.

Runtime acceptance:

- 390×844 three-panel layout and pagination → PASS
- silent Panel 1 and one-time Panel 2 Q1/TTS trigger → PASS
- swipe, pagination, and explicit actions → PASS
- structured/fallback feedback presentation → PASS
- return to Panel 2 and Q2 feedback reset → PASS
- post-submit cue, controls, and pagination visible without scrolling → PASS

---

## DECISION-022 — API Route Segments Use Consistent Lowercase Casing

Status: IMPLEMENTED — PASS

Date:

2026-09-06

Decision:

Application API directory segments and their callers must use consistent lowercase casing. The Claude route is:

`app/api/claude/route.ts` → `/api/claude`

Evidence:

Git history originally tracked `app/api/Claude/route.ts` while the client called lowercase `/api/claude`. Next route matching is case-sensitive. The mismatch caused an HTML 404 response and a downstream JSON parse failure. The defect existed from the initial route history and predates the new-computer migration.

Implementation:

The correction is a 100%-similar, content-identical, case-only Git rename. Production build exposes `ƒ /api/claude`, and runtime question/TTS behavior passed.

Operating rule:

Treat route-segment case differences as cross-platform deployment defects even when a case-insensitive Windows working tree resolves both spellings locally.

---

## RISK-014 — Live Interview Provider Latency and Speech Variability

Severity: LOW / MEDIUM

Status: ACTIVE / NON-BLOCKING

Observed:

- ElevenLabs commonly begins playback about 5–6 seconds after the written question appears.
- Final feedback generation may take several seconds depending on provider/network latency.
- One runtime acceptance run confirmed that visible, requested, and audible question text matched.

Mitigation:

- Written question rendering no longer waits for TTS.
- Speech-state messaging communicates preparation and playback state.
- Stale TTS requests cannot replace the current request, and object URLs are revoked.

Boundary:

Do not claim that provider TTS can never introduce extra words or variation. Keep INTERVIEW-012 open until repeated diagnostics establish the provider behavior.

---

## DECISION-023 — Talentry Result Review Preserves Persisted Data and Independent UI Language

Status: IMPLEMENTED, RUNTIME ACCEPTED AND PRODUCTION BUILD VALIDATED — PASS

Date: 2026-09-16

Decision:

The light Talentry Result presentation at `/result/[id]` remains a view of the existing persisted, owner-filtered detail response. Existing auth/login redirect, retry, refresh stability, and score/summary persistence contract remain intact. Score is displayed explicitly as persisted score `/100`; the persisted summary remains the assessment. Do not derive pass/fail tiers, percentiles, gamification, charts, new scoring, or invented AI insights.

Metadata displays role, company, level, interview type, interview language, persona/style, duration, and date/time using localized labels/fallbacks. Do not invent interviewer identity or expose owner data. Preserve all persisted Q&A and restart through `/` → Interview Setup.

TR/EN/DE interface copy follows existing `interviewai_uilang`, independently of interview language. Persisted summary/questions/answers are never translated by the presentation.

Evidence:

The user supplied verified desktop visual, refresh persistence, restart, mobile acceptance and production-build PASS results for closure. The memory update records that evidence without rerunning it.

Trust boundary:

Owner-authorized persisted reading does not make scoring server-authoritative. The existing browser-submitted score/summary persistence trust boundary and Claude proxy auth/privacy debt are unchanged. PDF/report download, HeyGen/live avatar and TTS/provider latency remain deferred. Dashboard / Recent History integration has since passed runtime/build acceptance without schema/RLS/auth redesign; Interview Setup mobile redesign has since passed runtime/build acceptance; see DECISION-028.

---

## DECISION-024 — Mobile Result Uses Three Review Panels Without Refetching

Status: IMPLEMENTED AND RUNTIME VALIDATED — PASS

Date: 2026-09-16

At `<=640px`, Result uses Evaluation, Interview Details, and Questions & Answers panels, with Evaluation initially active. Exactly three localized accessible dot buttons and left/right swipes provide navigation. Panel switches are presentation-only and do not issue API refetches or duplicate persisted state.

Long content remains readable through one vertical scroll region inside the active panel. The transcript panel retains the restart action. Above 640px, the existing non-pager desktop/tablet Result layout remains unchanged.

Runtime evidence supplied for closure: 390×844 initial panel, forward swipes to both remaining panels, backward swipe, dot navigation, transcript/restart accessibility, and restart → Setup all passed. No visible horizontal overflow was observed. Do not extrapolate this test to untested viewport sizes.

---

## DECISION-025 — Interview Mobile Controls Remain Hidden Above Their Breakpoint

Status: IMPLEMENTED AND RUNTIME VALIDATED — PASS

Date: 2026-09-16

A desktop regression exposed `.mobilePanelAction` and `.mobilePanelBack` because shared `.talentry-button { display:inline-flex }` could override their local hiding rule. Keep the minimal guard in `app/interview/interview.module.css` that forces these controls hidden above 640px.

Runtime verified restoration of the desktop Interview grid. This is a CSS-only containment fix; Interview logic/state/TTS/API behavior and the approved `<=640px` mobile three-panel pager remain unchanged. Future styling must preserve this breakpoint guard without changing shared Talentry button behavior.

---

## DECISION-026 — Dashboard Reuses Owner-Scoped Listing with an Optional Limit (historical; Dashboard usage superseded by DECISION-029)

Status: IMPLEMENTED, RUNTIME ACCEPTED AND PRODUCTION BUILD VALIDATED — PASS

Date: 2026-09-16

Dashboard stays server-auth-protected and requests `/api/interviews?limit=5` from the existing list endpoint. The optional limit is validated as a positive integer up to 100; invalid values return 400. No limit preserves existing default listing behavior. Newest-first ordering is retained, with `created_at DESC` and `id DESC`. GET responses use `Cache-Control: private, no-store`.

Owner identity is derived from the authenticated server user. No client-supplied owner/user identifier is trusted. The privileged server query must retain its explicit owner predicate for both limited and default reads; no schema/RLS/auth redesign or direct browser data access was introduced.

Recent rows display persisted role/company, score `/100`, date/time, interview type, language and duration. History → persisted `/result/<id>`, Result → `/dashboard`, Start New Interview → `/interview/setup`, and freshness after a new completed interview passed. Restart through `/` remains unchanged. Loading, empty, error/retry, 401 redirect, cancellation and freshness behavior are implemented.

TR/EN/DE Dashboard and Result return copy use `interviewai_uilang`; persisted role/company are not translated and interview language stays independent.

Evidence: user-supplied verified runtime/static/build PASS results for closure; this memory-only update does not rerun them. Full My Interviews and full-history pagination/search/filter remain deferred. Default listing behavior is preserved, not a promise of unlimited provider result volume. Scoring trust, Claude proxy security/privacy, persistence idempotency and TTS/provider latency debt remain unchanged.

---

## DECISION-027 — Final Mobile Dashboard Uses Home/Menu, Recent Interviews and Actions (historical; superseded by DECISION-029)

Status: IMPLEMENTED AND RUNTIME ACCEPTED — PASS

Date: 2026-09-16

At `<=640px`, the approved initial page is Home/Menu (index 0): read-only search, compact Welcome and the mobile equivalent of the desktop Sidebar. Existing unavailable menu destinations remain disabled, without invented routes. Page 2 contains Recent Interviews and its existing loading/empty/error/retry states and Result links. Page 3 contains Quick Actions/Start New Interview, Recommended Jobs and existing placeholder modules. This final grouping supersedes intermediate Menu-first or Dashboard-at-index-1 proposals.

Exactly three accessible localized dots and left/right swipes navigate the pages. Pager position is stable in a separate footer, outside the active content's single vertical scroll region. The old decorative mobile bottom navigation is hidden. Page navigation does not refetch history. Above 640px, existing desktop/tablet Dashboard layout is preserved.

User-verified 390×844 acceptance passed all three pages, swipe back, dot navigation, mobile Start Interview → Setup, mobile History → Result and desktop regression. No fabricated recommendation/AI data or delete/edit/favorites/tags/analytics were added. Dashboard modules remain placeholders until separately authorized.

Interview Setup mobile redesign has since passed runtime/build acceptance under DECISION-028. Full history, PDF/download and HeyGen/avatar remain deferred. Dashboard is committed at 3dbaca7; Setup mobile work remains unstaged and uncommitted. A new Git checkpoint requires separate authorization.

---

## DECISION-028 — Mobile Setup Uses Two Controlled Panels

Date: 2026-09-18
Status: IMPLEMENTED, RUNTIME ACCEPTED AND PRODUCTION BUILD VALIDATED — PASS.

At <=640px, Panel 1 groups introduction, interviewer selection, persona and interview language; Panel 2 groups optional role/company, level, interview type and one Start Interview action. Exactly two dots and left/right swipes navigate freely. The stable pager is outside the active panel's single vertical scroll region. Above 640px, original desktop/tablet composition and document scrolling remain preserved.

InterviewSetupForm remains the sole owner of setup state. Preserve defaults f / mid / behavioral / formal / tr and empty role/company; do not add required validation. Application language uses interviewai_uilang independently of interview language. Keep iv, role, company, level, itype, persona, language, cv; trim role/company on submit, preserve empty cv and empty query keys, and retain router.push. No duplicate business state, API/schema/auth or Interview logic change.

User-verified acceptance confirms panel/dot/swipe behavior, all selected values, role/company preservation, 390 -> 641 state preservation, optional empty submission and query contract, language independence, refresh defaults, desktop/tablet regression and production build. Existing Live Interview feedback-panel gating was observed working, not modified.

Refresh persists only UI language, not a Setup draft. Receiver validation and unrelated hardcoded copy remain deferred. No next stage or Git mutation is authorized.

## RISK-015 — Setup Mobile Keyboard and Browser Viewport Edge Cases

Status: KNOWN / BROWSER-SPECIFIC
Date: 2026-09-18

The supplied 390x844 acceptance passed. This does not establish every virtual-keyboard, browser chrome, safe-area, zoom or viewport combination. Retain browser-specific keyboard/reachability checks as a risk without claiming a reproduced defect or changing code during memory closure.

## DECISION-029 — Full My Interviews Is the Sole History Surface

Date: 2026-09-20
Status: IMPLEMENTED; available-data runtime acceptance and production build PASS, based on user-supplied verified results.

Canonical server-authenticated /interviews redirects unauthorized users to /login. Sidebar/mobile menu links to My Interviews. Rows -> persisted /result/<id>; Start -> /interview/setup; Back -> /dashboard. Result keeps its existing Dashboard return; no second return action is added.
Dashboard recent-history section, fetch hook and duplicate mobile page are removed. Dashboard retains Welcome, Quick Actions/Start and existing placeholder modules; its mobile pager is now Home/Menu and Actions, exactly two pages. This supersedes DECISION-026's Dashboard fetch and DECISION-027's three-page design, not the API ownership boundary.
History uses compact persisted-data rows and normal document scrolling at 390x844, not a pager. No fake total or duplicate Result summary/answers. Fixed newest-first; search/filter/sort deferred. TR/EN/DE uses interviewai_uilang; user text is untranslated and interview language stays separate.
Runtime PASS covers desktop/mobile navigation and visuals, Dashboard cleanup/two-page pager, and 13 real newest-first records with Load more correctly absent. Build PASS includes static generation 19/19. No >20-record runtime acceptance claim.

## DECISION-030 — Compatible Owner-Scoped Cursor Pagination

Date: 2026-09-20
Status: IMPLEMENTED; statically reviewed and production-build validated.

Full History explicitly requests limit=20. Omitted-limit GET behavior remains unchanged; no global default limit is imposed. GET returns interviews and nextCursor. Explicit limits use one extra row to establish continuation; no-limit response may have null nextCursor.
Versioned opaque base64url cursor contains exact createdAt plus UUID. Preserve database timestamp precision and created_at DESC / id DESC ordering: older timestamp OR equal timestamp with lower UUID. Invalid/malformed/duplicate cursor inputs return 400.
The explicit owner_id = authenticated user id predicate remains mandatory AND applies to the entire continuation condition. Identity remains server-derived; a cursor is never authorization. No schema/RLS/auth redesign or direct browser Supabase interview query.
Existing RISK-012 is partially mitigated for explicit-limit Full History reads, not resolved for no-limit reads, database typing or unmeasured query performance.

## RISK-016 — Full History Pagination Runtime Boundary Not Yet Exercised

Date: 2026-09-20
Status: DEFERRED ACCEPTANCE — NOT A REPORTED FAILURE.

The accepted account had 13 real records. All loaded newest-first and Load more was correctly absent. More-than-20-record runtime pagination was NOT tested. Static review and build validation do not prove multi-page behavior.
Defer 20/21/>20-record boundaries, tie ordering, append/end behavior, retries, deduplication and continuation under new inserts until suitable authorized data is available. Never describe Load more runtime acceptance as passed on the current evidence.
Search/filter/sort, persistent pagination/scroll restoration, virtualization and measured query/index optimization remain deferred. Existing PDF/avatar, scoring trust, Claude proxy hardening and other debt remain unchanged.
User Menu / Profile app-shell has since closed under DECISION-031. Splash / Onboarding pre-auth is planned next, not implemented or authorized by this closure.
---

## DECISION-031 — Shared Account Menu and Real Auth Identity

Date: 2026-09-20. Status: IMPLEMENTED; main-flow runtime and production build PASS, based on user-supplied verified closure evidence.

Preserve Sidebar/product navigation, Topbar/global controls and avatar/account menu. Dashboard remains post-login home, /interviews canonical history and Result individual detail. Shared menu works on desktop/mobile/history/narrow/tablet rail without broad shell rewrite. /profile, /account/settings and /help use server auth guards and fixed /login redirects.

Only projected email/displayName/initials reach clients; no raw User/metadata, inferred name, secret-bearing imports or profile schema. Profile is read-only. Settings expose application language and existing password recovery only. Help describes real flows, without fabricated support channels. Profile editing/persistence requires a later real requirement/schema.

interviewai_uilang (tr/en/de) updates shell immediately; TR update, refresh and logout/login persistence passed runtime. Interview language stays separate. Local-scope Sign Out and browser Back privacy passed. Centralized duplicate/stale-session and cross-tab handling exist in source; fixed internal navigation and no identity logging. No all-device revocation claim.

Menu Escape/focus return/outside-click/underlying-target behavior passed. Desktop, 390x844 account/history surfaces, 641–767 menu and 768px rail/menu passed with no obvious overflow/clipping. Mobile account pages scroll normally; Dashboard two-panel pager, history layout and Result navigation remain intact. Build PASS: Next.js 14.2.5, static generation 22/22, compilation/types/page data/traces/optimization. Full evidence is in STAGE_LOG and CURRENT_STATE closure.

Current recovery HEAD is 6569572; account work remains uncommitted. Next planned stage is pre-auth Splash + Onboarding preserving Sign In / Create Account, not yet implemented or authorized.

## RISK-017 — Account Edge Cases Not Manually Exercised

Date: 2026-09-20. Status: UNTESTED EDGE CASES — not current blockers based on source/static/build review.

Cross-tab logout, forced sign-out network failure, missing-email/malformed-name metadata and unavailable storage were not manually reproduced. Every intermediate breakpoint was not exhaustively tested. Source handling is not runtime acceptance. Existing >20-record history acceptance limitation remains.

Keep separate existing debt: /interview lacks page guard; provider endpoints need security hardening; Claude/private-content logging; Result uses protected API rather than server page guard; fragmented localization/root html lang; decorative AuthShell language selector. This account closure resolves none of those concerns.

---

## DECISION-032 — Canonical Pre-auth Entry and Stage Closure

Date: 2026-09-22. PREAUTH_ONBOARDING_01 implementation/runtime/build ACCEPTED,
based on user-supplied verified evidence recorded in the canonical stage reports
and STAGE_LOG. Earlier next-stage and recovery statements are historical snapshots.

- `/` is the canonical public pre-auth entry. Server-authenticated users redirect
  to `/dashboard`; unauthenticated users receive Splash/onboarding or repeat entry.
- Browser completion is a UX preference, not authentication or security state.
  Skip/final auth actions complete onboarding; replay does not clear completion.
- Application language TR/EN/DE uses `interviewai_uilang` independently of interview
  language. Neutral unresolved-language rendering prevents persisted EN/DE flashes.
- Result restart routes explicitly target `/interview/setup`, never public `/`.
- Ocean-swell motion has a reduced-motion static fallback in source. Manual
  reduced-motion runtime verification remains pending.
- Shared mobile centering, Pointer Events swipe and Skip keyboard focus are accepted
  runtime fixes; no broader auth, interview or localization architecture change.

Current committed recovery checkpoint: 1ca9982 (account stage committed).
Pre-auth remains UNCOMMITTED. Update recovery separately after an authorized commit.
Next stage is not started. No runtime tests/build were rerun during this closure.

## RISK-018 — Pre-auth Untested Acceptance Boundaries

Status: UNTESTED / DEFERRED ACCEPTANCE, not reported defects.

Storage unavailable/denied and malformed preferences have not been runtime-exercised.
Exhaustive screen-reader announcements, reduced-motion runtime behavior, the full
browser/device matrix, very short landscape, browser zoom and unusually long text
remain unverified. Source safeguards are not runtime acceptance.
Full auth recovery email delivery remains outside this stage. More-than-20-record
History pagination remains pending (RISK-016). Existing security/technical debt,
including account edge cases in RISK-017, remains unchanged. Supplied route PASS
results do not establish full recovery-email delivery or resolve provider security.

---

## DECISION-033 — Verified Recovery Provenance and Bounded Continuity

Recorded: 2026-09-27. AUTH_RECOVERY_01: IMPLEMENTED; automated validation and user-supplied browser runtime acceptance PASS. Chrome normal profile is the successful acceptance environment.

### Final recovery architecture

- Preserve Supabase automatic PKCE flow; no manual exchangeCodeForSession().
- Recovery eligibility requires a verified Supabase session, verified user, verified JWT session_id, verified AMR entry with method exactly "recovery", and bounded tab-scoped sessionStorage workflow continuity. The verified PASSWORD_RECOVERY establishment path creates the marker; refresh restoration requires that valid marker.
- Marker alone is never authorization. It stores only userId, sessionId, expiresAt; no credentials, raw JWT or AMR payload.
- The 15-minute local continuity window is fixed and not renewed by refresh or token rotation.
- TOKEN_REFRESHED uses verified user/session identity and recovery AMR, not access-token string equality as an identity requirement.
- SIGNED_OUT/session loss revokes eligibility. No periodic 15-second polling; retain auth events, focus/pageshow/visibility, pre-submit validation and bounded timers.
- Direct reset access and different-browser/profile PKCE recovery remain fail-closed by design.

Evidence: all ten runtime checks are recorded in the AUTH_RECOVERY_01 reports and STAGE_LOG. Live recovery confirms the deployed session passes recovery-AMR validation. Same-profile cross-tab Dashboard logout revokes the recovery form. Edge-to-Chrome links rejected because Outlook used default-browser Chrome are expected PKCE boundary enforcement, not implementation failure. The acceptance updates RISK-017 only for the tested recovery cross-tab scenario and RISK-018 only for the supplied full recovery-email flow; unrelated boundaries remain untested.

Remaining limits: marker/local TTL is client-controlled workflow continuity, not server-enforced one-use authorization. Verified AMR records session authentication history. Silent remote revocation still depends on retained checks; arbitrary browser/hook configurations are not asserted covered. The 1–2 second Check your email flash on refresh is minor deferred UX polish, not a security issue or functional blocker; separate approval required to fix.

At documentation closure, the checkpoint was ff67db4 on feature/auth-foundation and AUTH_RECOVERY_01 was uncommitted; earlier checkpoint/next-stage statements are historical. No staging, commit, push, next stage or runtime rerun authorized by this documentation closure.


## Final status — REPORT_EXPORT_01 — 2026-10-01

**IMPLEMENTATION + AUTOMATED VALIDATION + LOCAL BROWSER ACCEPTANCE: PASS**

**DEPLOYED RUNTIME SMOKE ACCEPTANCE: PENDING**

At this documentation/pre-commit checkpoint, HEAD and origin/feature/auth-foundation were b08f446 on feature/auth-foundation, and REPORT_EXPORT_01 work was uncommitted. No future commit hash is asserted. Local runtime acceptance is user-verified in Chrome normal profile; it was not rerun during this documentation-only closure. The user reported the dev server manually stopped.

Final renderer: exact jsPDF 4.2.1; React-PDF rejected. Node-first / managed Next.js, owner-authorized Node PDF route, shared owner-reader security boundary, persisted-data-only direct-text report, application-owned pagination and local static Inter Regular/SemiBold fonts. Auth/recovery architecture and DB/schema remain unchanged. Export makes no AI/provider call, stores no PDF, offers no public sharing, and introduces no Python production runtime, DOM or headless browser.

Final endpoint: GET /api/interviews/[id]/pdf. PDF label language is derived server-side from persisted interview.language AFTER the authenticated owner-scoped read (en -> English, tr -> Turkish, de -> German). UI language controls browser button/loading/status/error copy only. Summary, questions, answers, role, company and other saved free text are never translated. Legacy language query parameters are ignored and cannot override saved language; unsupported persisted language fails through the generic PDF-generation error path. The previous client-selected language query contract is superseded.

Recorded final validation: PDF 14/14 PASS; owner-reader 8/8 PASS; recovery 34/34 PASS; TypeScript PASS; git diff --check PASS; production build PASS with static generation 22/22; post-build PDF tests 14/14 PASS. Exact Turkish/German Unicode, nonempty used-glyph ToUnicode mappings, composite/base sequences, ten alternating reports, exact LONG_QUESTION, 140 ordered paragraphs, content through ANSWER_11, six-page long reports and all footers passed. Recorded visual inspection found no overlap, clipping, off-page text, missing glyphs or footer collision.

Representative local observations from the accepted post-build run: approximately 94 KB long PDF, 80–135 ms rendering, RSS around 380 MiB and whole-process peak around 407 MiB. These are local observations only, not production concurrency capacity or proof of memory-leak absence.

Deployed packaging/resource smoke remains a deployment acceptance / operational follow-up, not a local functional blocker. Host font/jsPDF packaging, production render duration, sustained/concurrent memory, response-size/resource limits and long reports under host limits have not been verified. Full production closure is not claimed. Concurrency/resource profiling is deferred only if future usage scale requires it.

### Renderer and corrective-work history

1. Initial React-PDF implementation failed validation: empty ToUnicode mappings, fontkit sequential glyph/codepoint contamination and Turkish/German extraction corruption; inherited numeric line-height also broke long-report pagination.
2. Layout had a clean application-level candidate correction. Unicode had no acceptable maintainable correction; upstream issue/PR remained unresolved at that audit. React-PDF was rejected, not accepted retroactively.
3. fpdf2 was investigated and technically suitable, but production Python deployment was not established. Node-first remained preferred; Node-native alternatives were audited.
4. jsPDF 4.2.1 isolated spike passed Unicode, mappings, composite/base sequences, sequential documents and long pagination; repository migration followed.
5. A multipage contiguous-answer assertion was proven invalid because legitimate page footers interrupted extraction. Its replacement strengthened exact per-page footer and ordered semantic-body checks.
6. TypeScript API mismatch was corrected from direct getPageWidth/getPageHeight to doc.internal.pageSize.getWidth()/getHeight(), without changing pagination.
7. Full automated/build/post-build validation passed. PDF language source then changed from UI language to persisted interview.language; automated validation and browser re-acceptance passed.

User-verified historical/repeated/mobile export, live Unicode search and signed-out/wrong-owner boundaries passed; see STAGE_LOG. The incomplete-logout attempt was invalid, not an auth failure. ADR-003 supersedes ADR-002, which remains unchanged historical evidence.


## DECISION-034 — PROFILE_EDIT_01 display-name-only metadata editing — 2026-10-02

Status: IMPLEMENTATION + AUTOMATED VALIDATION + LOCAL BROWSER ACCEPTANCE: PASS.

At the 2026-10-02 documentation/pre-commit checkpoint, HEAD and local origin/feature/auth-foundation were 56b9cdf on feature/auth-foundation; PROFILE_EDIT_01 work was uncommitted. No future commit hash is asserted. The user reported the dev server manually stopped. No tests/build or browser checks were rerun during this documentation-only update; no server restart or Git mutation was performed. No next stage is authorized.

Display-name-only V1 writes user_metadata.display_name through authenticated browser supabase.auth.updateUser({ data: { display_name: normalizedValue } }). No target user ID, app_metadata, service-role/admin mutation, profile table, application profile API, schema/RLS, dependency or configuration change. Email remains read-only; email/password/avatar changes are outside scope. Server projection remains defensive: display_name -> full_name -> name -> honest fallback. Metadata is display text only, never authorization.

The name contract trims leading/trailing whitespace, collapses internal whitespace runs, requires 1-80 Unicode code points and rejects remaining control characters. International Unicode, accents/diacritics and punctuation are preserved. No transliteration, first/last-name split, email-derived name or clear-name action. Existing missing-name fallback remains valid until edited.

The server-projected editor snapshot contains projected display name and the authenticated user's top-level user.updated_at as identityVersion. This server-controlled value is separate from user_metadata and used only for identity reconciliation, never authorization. No random or client-generated version token is used.

A/V1 -> local save B/V2 -> later external/server A/V3 is recognized as a NEW snapshot even when the name repeats. Clean editors accept the fresh snapshot and update confirmed/displayed name. Dirty editors preserve the draft, detect external changes, block Save, and require explicit Use latest / Cancel reconciliation. Successful saves use the provider-returned user for confirmed name and updated_at baseline, avoiding a false conflict when that same saved snapshot returns through refresh.

USER_UPDATED schedules bounded refresh outside the auth callback; focus refresh is a bounded fallback, with no polling. Existing SIGNED_OUT/session-loss navigation is preserved. Server-projected identity remains authoritative; shared menu and clean profile views update after metadata changes.

PROFILE_EDIT_01 did NOT modify recovery code. A successful profile metadata update emits USER_UPDATED. An open recovery form in another same-profile tab therefore remains fail-closed and becomes unavailable. This intentional behavior was LIVE-VERIFIED: the recovery tab transitioned to Reset link unavailable. It is not a regression.

This supersedes DECISION-031's read-only-profile/editing-deferral wording for display-name-only V1. Its auth guards, shared shell and defensive identity rules remain preserved. User-verified acceptance A-Q is recorded in STAGE_LOG; provider failure/retry and duplicate submission prevention have automated coverage only. No broader profile requirement/schema or next stage is authorized.

## RISK-019 — PROFILE_EDIT_01 accepted V1 reconciliation limits

- user.updated_at is a whole-auth-user version, not an atomic profile revision; unrelated auth-user changes may conservatively trigger reconciliation.
- No atomic multi-device conflict guarantee exists.
- Drafts are memory-only and discarded on navigation.
- External changes are observed through auth events/focus/refresh behavior.
- Deployed Supabase project behavior was live-tested only for the exercised flows.
- No profile-schema enforcement exists because V1 intentionally uses auth metadata.

These limitations are not blockers for the accepted V1. REPORT_EXPORT_01 deployed packaging/resource smoke remains PENDING as a deployment/operations follow-up, not a local functional blocker; PDF implementation remains closed. Unrelated deferred work remains unchanged.

## DECISION-035 — HISTORY_PAGINATION_01 automated closure and seeding prerequisite — 2026-10-03

AUTOMATED ACCEPTANCE: PASS. Production pagination implementation: UNCHANGED. No source-level pagination defect demonstrated. Preserve DECISION-030's owner-scoped position-only cursor, exact timestamp/UUID ordering and live-keyset semantics.

Recorded prior results: cursor 15/15, server 24/24, hook 12/12, recovery 34/34, profile 49/49, PDF 14/14; total 148 PASS. TypeScript/whitespace PASS; build PASS, 22/22. Deterministic 0/1/19/20/21/40/41 boundaries, UUID timestamp ties, microseconds, owner isolation, retry/dedupe, rapid Load More protection, terminal cursor and live-keyset inserts: PASS. No reruns during documentation closure.

LIVE <20 BROWSER CHECK: USER-VERIFIED PASS — authenticated page displayed 13 records / Load More hidden. REAL 21+ RECORD SUPABASE/BROWSER ACCEPTANCE: PENDING because the account has only 13 records. RISK-016 now has automated coverage, but its real multi-page acceptance gap remains open; no deployed page-two PASS is claimed.

Existing authenticated POST can create synthetic owner-scoped completed records without AI/provider calls. Connected Supabase environment classification is UNKNOWN and the application has no supported interview DELETE path. Accordingly no synthetic records were created/deleted.

Product decision: implement a separately scoped DELETE_INTERVIEW_01 feature before seeding pagination fixtures. It should allow users and acceptance cleanup to remove specific owned interviews through the application. This records future sequencing only: DELETE_INTERVIEW_01 is NOT implemented or authorized by this documentation update and is outside HISTORY_PAGINATION_01. Environment confirmation and explicit seed authorization remain required before future data creation.

Historical documentation/pre-commit checkpoint: committed base before stage 96bd04c on feature/auth-foundation; stage tests/reports were uncommitted. No future commit hash asserted. No auth/recovery/profile/PDF/Result/scoring/schema/RLS/source/test changes or Git mutation in this closure.

## DELETE_INTERVIEW_01 — Final runtime acceptance closure — 2026-10-03

**IMPLEMENTATION + AUTOMATED VALIDATION + LOCAL BROWSER ACCEPTANCE: PASS**, with explicit qualification: wrong-owner live DELETE was NOT COMPLETED / NOT USER-VERIFIED; deterministic automated coverage remains.

Historical/pre-commit checkpoint: branch feature/auth-foundation; committed base before DELETE_INTERVIEW_01 faac5e2. At this documentation checkpoint the stage work was uncommitted. No future commit hash is asserted. This update records user-provided browser evidence; no tests/build or browser checks were rerun, no server restarted, and no Git mutation or Supabase operation was performed by the agent during this documentation turn.

Recorded automated results: server deletion 13/13, client deletion 10/10, pagination 51/51, recovery 34/34, profile 49/49, PDF 14/14; total 171 PASS. TypeScript PASS; git diff --check PASS; production build PASS, 22/22 pages. Initial PDF regression failures were environmental: default/user Python lacked pypdf; invocation-local Codex-bundled Python with pypdf 6.10.0 passed. No production PDF regression found; no persistent env/config or package change. Unused outer loop cleanup reduced 25 misleading registrations to 13 unique server deletion tests without losing assertions. Prior webpack cache snapshot warnings, LF-to-CRLF and npm update notices remain recorded in the Engineering Report.

USER-VERIFIED PASS:
- A. Cancel: opened confirmation; Cancel preserved the interview.
- B. Owner hard delete: confirmed permanent deletion, navigated to /interviews, History count 13 -> 12.
- C. Persistence: closed/reopened/fresh-loaded History; deleted record remained absent and 12 remained.
- D. Mobile: approximately 400x690 viewport; usable confirmation, no overflow, accessible Cancel/destructive controls.
- E. Focus: opening confirmation focused Cancel; cancelling returned focus to Delete interview trigger.
- F. Repeated-delete fail-safe: later DELETE for an already-deleted interview returned 404.
- G. Deleted Result: deleted interview URL displayed existing unavailable state.

Manual acceptance procedure incident: one additional real interview, ID 19c2c248-b4b7-4b99-b9c2-ce0ef316b39e, was unintentionally deleted by a DevTools Console DELETE fetch while the original owner account remained authenticated. Promise {<pending>} was incorrectly interpreted as if the request had not completed. The DELETE actually succeeded; a second DELETE returned 404 because the record was already deleted. Subsequent Result was unavailable; History became 11 and remained 11 after fresh refresh. This was a MANUAL ACCEPTANCE PROCEDURE ERROR, not an application authorization defect. No restoration is claimed or attempted.

Wrong-owner live DELETE was NOT COMPLETED / NOT USER-VERIFIED: the intended second-account test was not performed before the accidental owner DELETE. Do not infer wrong-owner or second-account browser isolation from this incident. Wrong-owner DELETE, database/provider failure and retry, rapid duplicate prevention, malformed success payload, and deleted PDF 404 behavior are recorded as automated-test-covered only, not browser-tested. PDF automated tests cover owner-read notFound -> 404; no live deletion-to-PDF integration claim is made.

Final architecture: permanent HARD DELETE; Result page only; inline confirmation; DELETE /api/interviews/[id]; server-derived authenticated identity; both id and owner_id predicates; wrong-owner and nonexistent indistinguishable; confirmed success router.replace('/interviews'); fresh History mount/refetch. No History-row delete action, schema/RLS change, new dependency, polling or realtime deletion synchronization.

Exact delete chain:
```ts
.delete()
.eq('id', id)
.eq('owner_id', auth.user.id)
.select('id')
.maybeSingle()
```

API contract: 200 {"deleted":true}; 401 {"error":"Unauthorized"}; 400 {"error":"Invalid interview id"}; identical 404 {"error":"Interview not found"} for wrong-owner/nonexistent/repeated requests; generic 500 {"error":"Failed to delete interview"}. DELETE responses private, no-store. Auth precedes UUID validation; request ownership inputs are not consumed.

Current user-reported real account count after both deletions: 11. HISTORY_PAGINATION_01 real 21+ browser acceptance remains PENDING. Minimum future seed count is now 10 synthetic records to reach exactly 21; previous 13+8 planning is historical. Future seeding requires explicit authorization and environment confirmation, recording exact new IDs, then exact-ID cleanup and verification of the original 11-ID set. No seeding authorized or performed here.

Remaining limitations: hard deletion is irreversible; stale rendered tabs may retain content until navigation/refresh; downloaded PDFs and backups are outside the row deletion guarantee; live schema parity and unexercised browser cases remain unverified. Auth/recovery/profile/scoring/PDF/history foundations remain frozen. No next stage, staging, commit or push is authorized by this closure.

## ROADMAP_FREEZE_01 — Planning decisions and launch risks — 2026-10-06

Documentation implementation complete; freeze review/acceptance pending. [Master roadmap](../03_Roadmap/WEB_V1_MASTER_ROADMAP.md) owns WEB V1 scope/order. Each stage needs its own audit and explicit approval. WEB release precedes native APP architecture/implementation.

HISTORY_PAGINATION_01: NATURAL-RECORD DEFERRED ACCEPTANCE. User-verified live baseline on 2026-10-06: 11 real records. Do NOT create synthetic interviews merely to reach 21. Deterministic pagination tests and existing <20 browser behavior remain accepted. Real 21+ browser acceptance waits until ordinary project testing/development naturally produces at least 21 records. This acceptance gap does NOT block unrelated WEB development. Earlier synthetic seed plans are historical/superseded for current planning; preserve historical entries and old reports. No Supabase query or mutation performed in this stage.

Product gates before dependent coding: session resume storage/restart/privacy/device contract; account password/deletion/retention boundaries; realistic-avatar V1 inclusion; optional CV inclusion/input/storage/retention; MFA; free/paid launch; hosting/runtime limits; dev/staging/production separation. Native architecture is post-launch. Conditional features do not become requirements from stage names.

Technical launch risks: Cost-bearing Claude / ElevenLabs / HeyGen-token route protection; Claude client-supplied prompts/private-content logging/request constraints; ambiguous completion retry can duplicate records; interview transition race / stale async risks; invalid interviewer input can create undefined interviewer state; fragmented application localization / root lang; microphone UI currently implies capture although acquisition uses audio:false. These are audited unresolved risks, not fixes completed by this documentation stage.

Operational follow-ups: environment purpose unknown, email delivery, deployed PDF packaging/resources, provider/cost controls and staging/release evidence. Frozen PKCE/recovery, profile reconciliation/dirty drafts, owner-authorized jsPDF/persisted language, ownership privacy, keyset History and Result-page hard deletion remain protected. Next technical stage planned only, NOT STARTED. Existing acceptance limitations retained.


## INTERVIEW_RELIABILITY_01 — Accepted bounded reliability decision and risks — 2026-10-06

### Current roadmap progress and Git boundary

- ROADMAP_FREEZE_01: complete / committed / pushed. Recovery point: `50e4da96e00a9f4c70979b5bada1ca71f3a68403` (`docs(roadmap): freeze web v1 critical path`). Pushed status records user-provided checkpoint evidence; no network fetch performed in this documentation turn.
- INTERVIEW_RELIABILITY_01: **IMPLEMENTATION + AUTOMATED VALIDATION + LOCAL BROWSER ACCEPTANCE: PASS**. Current uncommitted stage; acceptance PASS pending final Git closure. No stage commit hash exists or is invented here.
- Next planned stage AFTER commit: COMPLETION_IDEMPOTENCY_01, **planned / NOT STARTED / NOT AUTHORIZED**.
- Branch: feature/auth-foundation. Final pre-commit review pending. No staging, commit, push or automatic next-stage work authorized by this documentation closure.

Decision: a small framework-independent synchronous session helper owns operation identity/admission, accepted question identity/ordinal, one-answer consumption, frozen completion snapshots and disposal. React busy state presents the invariant; helper admission enforces it independently of paint. End disabled during generation/feedback; no queued End. Valid trimmed question accepted before ordinal commit; five-question limit. Feedback-only retry reuses the committed question/answer. Same frozen answer set feeds evaluation and persistence; completion invalidates audio. Existing provider architecture, prompts, payload/UUID handoff and zero/partial contracts preserved.

User-verified browser evidence supersedes the initial generation-End visual concern: visible native button MutationObserver disabled false -> true -> false; timing/paint observation, no proven defect or production correction. Initial TTS 500 classified EXTERNAL PROVIDER / ACCOUNT BILLING INCIDENT, resolved by user correcting ElevenLabs billing. Starter, 90,000 / 90,000 credits reported; Q2 TTS worked with unchanged Talentry code. No payment/card details.

### Automated-only qualifications

Immediate double-submit handler race; submit + End same-callback race; submit + Skip overlap; stale feedback/question continuations after completion; obsolete TTS continuation after completion; disposal/unmount invalidation; immutable completion snapshot mutation attacks; synchronous handler rejection independent of UI paint; and one-completion-attempt admission remain automated/deterministic coverage, not browser-tested claims.

### Deliberately deferred boundaries — non-blocking for this stage

- Underlying provider requests are not necessarily physically cancelled; correctness relies on operation/session identity invalidation.
- Committed-but-response-lost POST duplicate persistence remains unresolved: COMPLETION_IDEMPOTENCY_01.
- Session resume remains deferred.
- Provider auth/privacy hardening and scoring trust remain later roadmap work.
- Microphone acquisition truthfulness remains MEDIA_PROVIDER_V1_01.
- No synthetic pagination seeding; natural-record acceptance policy remains unchanged.

History natural-record policy preserved: historical directly verified 11-record baseline on 2026-10-06; one natural persisted acceptance interview afterward; no re-count or new verified total. Second session not completed, no second persisted record claimed. No synthetic seeding. Existing frozen foundations and prior deployed PDF/wrong-owner live DELETE qualifications remain protected.

## COMPLETION_IDEMPOTENCY_01 — Acceptance closure — 2026-10-06

- **IMPLEMENTATION + AUTOMATED VALIDATION + LOCAL FIRST-SAVE BROWSER ACCEPTANCE: PASS**.
- Current stage: **UNCOMMITTED / pending final Git closure**. Acceptance evidence is complete; documentation/final pre-commit review remains pending. No stage commit hash is asserted.
- INTERVIEW_RELIABILITY_01: **complete / committed / pushed**. Safe committed recovery point before this stage: `229faf678c22f2ed89497fc3a97ae3b477eafba5` (`fix(interview): harden session transitions`). Pushed status includes user-provided closure evidence; no fetch performed here.
- Branch: `feature/auth-foundation`.
- Next roadmap stage AFTER Git closure: **ROUTE_INPUT_HARDENING_01 — planned / NOT STARTED / NOT IMPLEMENTED / NOT YET AUTHORIZED**. No automatic next-stage authority.

### Completed bounded persistence decision

One browser-generated UUID v4 `completionId` per nonempty completion intent is persisted directly as existing `interviews.id`. No schema migration or dependency. Insert-first persistence uses the existing primary key; no read-before-insert or upsert overwrite. Only PostgreSQL `23505` naming `interviews_pkey` enters replay recovery. Recovery reads both `id = completionId` and `owner_id = authenticated server-derived owner`. Matching persisted content returns the same ID: first insert `201 { id, replayed: false }`, matching replay `200 { id, replayed: true }`. Conflicting content or unavailable identity returns generic `409 { error: "Completion conflict" }`; no overwrite or foreign row/details returned. The client never supplies trusted ownership. POST validates required UUID v4 identity and sets `Cache-Control: private, no-store`; GET behavior is preserved.

Client persistence payload freezes once after valid evaluation, including ordered submitted answers, metadata, score/summary and duration. After POST attempt, explicit retry uses the same identity and frozen payload; evaluation is not rerun, duration not recalculated, and changed live answers do not replace the original intent. Returned ID must validate and equal completionId. A known saved ID supports navigation-only retry. State is in-memory and resets on session disposal/new lifecycle. Zero answers create no identity, evaluation, save or Result and retain the existing warning/session behavior. Partial completion includes only submitted answers.

### Recorded automated validation — not rerun in this documentation turn

- Completion-state tests: **14/14 PASS**, exit 0.
- Persistence/helper/route tests: **31/31 PASS**, exit 0.
- Session/page tests: **55/55 PASS**, exit 0.
- Relevant regressions (detail reads, deletion, pagination, History loading, Result deletion and PDF): **96/96 PASS**, exit 0.
- TypeScript and implementation `git diff --check`: **PASS**, exit 0.
- Production build: **PASS**, exit 0; **22/22** generated pages. Dev-server process recheck found zero matching repository dev processes before build; dev server was not restarted.
- Two webpack dependency-cache snapshot warnings, npm update notice and informational Git LF-to-CRLF notice were recorded. No product regression established by those warnings.

### Primary deterministic response-loss evidence

One identity X and frozen payload P: final evaluation executes once; the actual POST route/helper against a stateful persistence double commits row X/P; the client experiences a lost response. Explicit retry retains X/P and frozen duration, skips reevaluation, recovers the matching original row, returns original ID X, creates no second logical row and navigates to `/result/X`. This is automated/deterministic PASS, not a browser replay claim.

Same-ID replay, no duplicate logical row, `replayed: true`, controlled concurrent application requests, conflicting replay, foreign-owner collision, wrong returned-ID rejection, immutable payload/duration and no reevaluation are automated-only evidence. Actual PostgreSQL concurrency integration was NOT run. Race safety relies on the repository migration's UUID PRIMARY KEY definition and deployed-model assumption; no real/test Supabase concurrency writes were performed.

### User-verified browser first-save acceptance

User completed one ordinary interview through the current application. Network showed POST `/api/interviews`, **201**, `replayed: false`. User manually compared request completionId, response id and Result URL id: **all three UUID values identical**. **FIRST-SAVE IDENTITY CONTRACT: PASS**. Actual UUID is unnecessary and omitted. This is user-verified evidence, not an agent-performed browser run in this documentation turn.

No deliberate live response-loss/duplicate replay was performed against real Supabase: the central replay behavior is proven deterministically, and forced live failure/replay would add unnecessary real-data risk.

### History qualification

**HISTORY_PAGINATION_01: NATURAL-RECORD DEFERRED ACCEPTANCE**. Historical directly verified baseline: **11 records on 2026-10-06**. INTERVIEW_RELIABILITY_01 later created one natural persisted interview; COMPLETION_IDEMPOTENCY_01 browser acceptance created one additional ordinary/natural persisted interview. Neither is synthetic. History was not re-queried/recounted after those writes; no current verified total is asserted. No synthetic seeding; natural 21+ acceptance remains deferred.

### Accepted remaining boundaries

- Completion state is in-memory only; refresh/tab close loses retry identity/state. Cross-refresh recovery belongs to SESSION_RESUME_01.
- Hard deletion removes the row supplying replay evidence. Indefinite replay protection after deletion requires a separate tombstone/retention product decision.
- Actual PostgreSQL concurrency integration was not performed; deployed-schema parity remains later environment/release verification.
- Provider security/privacy and scoring trust remain later roadmap work.
- After failed save, retry targets the original frozen intent even if live answers change; no automatic second identity is created.

These qualifications do not block local closure. Existing reliability state-machine protection and approved zero/partial behavior remain preserved. No History/Result/PDF/Profile/Auth implementation, schema, dependency or configuration changes. This entry supersedes earlier pending idempotency/reliability Git status only; historical entries/reports remain unchanged. No staging, commit, push, Supabase mutation, browser rerun, tests/build rerun or next-stage implementation in this documentation turn.

## ROUTE_INPUT_HARDENING_01 — Acceptance closure — 2026-10-07

- Date recorded: 2026-10-07 (Europe/Istanbul).
- **IMPLEMENTATION + AUTOMATED VALIDATION + LOCAL BROWSER ACCEPTANCE: PASS**.
- Current stage: **UNCOMMITTED / pending final Git closure**; final documentation/pre-commit review required. No commit/push approval or future hash asserted.
- Branch: feature/auth-foundation. Safe committed base and local origin ref: 1ce03bae7a002b4b68e274e2dfbfb872300e9d3b (fix(interviews): make completion persistence idempotent).
- **COMPLETION_IDEMPOTENCY_01: complete / committed / pushed**; closure supplied by user and committed HEAD verified locally; no remote fetch.
- Next roadmap stage AFTER Git closure: **SECURITY_PRIVACY_01 — planned / NOT STARTED / NOT IMPLEMENTED / NOT YET AUTHORIZED**. No automatic next-stage authority.

### Completed route/input decision

Server /interview order: existing trusted getAuthenticatedUser -> signed-out /login redirect -> parse decoded searchParams -> invalid/missing config /interview/setup redirect -> typed LiveInterviewClient. No middleware or auth redesign. Valid authenticated Setup and direct valid Live URLs remain usable without login detours.

The framework-independent, dependency-free interview-setup-input helper owns runtime sets and derived types: interviewer f/m; level junior/mid/senior; type behavioral/technical/mixed/case; persona friendly/formal/tough/curious; interview language tr/en/de. Membership uses exact array comparison, never truthy object lookup: unknown, wrong-case, constructor and __proto__ values are rejected.

Consumed query keys: iv, role, company, level, itype, persona, language. iv/level/itype/persona/language are required exactly once. role/company are optional at most once. Array representations of any consumed key are rejected, including same-value duplicates. cv and arbitrary unused extras remain ignored. Next-decoded values are validated without manual URL decoding.

Role/company remain optional. Raw decoded length is checked before trim: <=200 Unicode code points using Array.from, with C0 U+0000-U+001F and C1/DEL U+007F-U+009F rejected. Surrounding whitespace is trimmed; missing/empty/whitespace-only values become Genel. Ordinary Unicode, accents and emoji remain unchanged after trim. Setup uses the same helper and localized TR/EN/DE accessible validation feedback.

Live logic is extracted into components/interview/LiveInterviewClient.tsx with an InterviewSetupInput config prop, no URLSearchParams parsing and no required-config defaults. A deterministic key derived from all validated config fields prevents different configurations mixing old session state. Existing effects, provider/prompt/TTS, transition, completion and render behavior remain semantically preserved; typed mappings replace the former any interviewer lookup.

POST /api/interviews validates interviewerKey, level, interviewType, persona and language membership plus role/company canonical text. Incoming POST text must already be trimmed, nonempty, bounded and control-free; no server defaulting/normalization changes replay payload content. Invalid payload returns existing 400 Invalid interview payload before persistence. Existing answers/score/summary/duration/identity validation is preserved.

COMPLETION_IDEMPOTENCY_01 architecture is unchanged: auth first; server-derived owner; UUID v4 completionId; insert-first; 201 first insert; 200 matching replay; generic 409 conflict; no overwrite; owner-scoped replay; private/no-store. Reliability and response-loss retry regressions passed.

### Recorded automated validation — not rerun in this documentation turn

| Suite / command | Result |
|---|---|
| node --test lib/interviews/interview-setup-input.test.cjs | 134/134 PASS, exit 0 |
| node --test lib/interviews/interview-route-input.test.cjs | 46/46 PASS, exit 0 |
| node --test components/interview/InterviewSetupForm.test.cjs | 41/41 PASS, exit 0 |
| node --test lib/interviews/interview-session-state.test.cjs | 55/55 PASS, exit 0 |
| node --test lib/interviews/persist-owned-interview.test.cjs | 71/71 PASS, exit 0 |
| node --test lib/interviews/interview-completion-state.test.cjs | 14/14 PASS, exit 0 |
| Result ownership, deletion, pagination, History loading and PDF regressions | 96/96 PASS, exit 0 |
| Total deterministic tests | **457/457 PASS**; no skipped tests |
| npx.cmd tsc --noEmit --incremental false | PASS, exit 0 |
| Implementation git diff --check and new-file whitespace check | PASS, exit 0 |
| npm.cmd run build | PASS, exit 0; **22/22** generated pages |

Regression command: node --test lib/interviews/read-owned-interview.test.cjs lib/interviews/delete-owned-interview.test.cjs lib/interviews/history-cursor.test.cjs lib/interviews/history-pagination.test.cjs components/interviews/useFullInterviewHistory.test.cjs components/result/useInterviewDeletion.test.cjs lib/reports/interview-report.test.cjs. PDF inspector used invocation-local REPORT_PDF_PYTHON pointing to the existing bundled Python; no persistent configuration or installation.

Initial Setup tests exposed test-harness traversal errors and a missing desktop form error-description association. Both were corrected; final Setup run passed. Existing reliability/idempotency assertions were preserved. Build preceded only removal of inherited trailing whitespace in the extracted client; no semantic change followed validation.

Before build, sandbox process inspection returned Access denied. Authorized read-only retry succeeded: **0 repository Next dev/start processes**. No process was terminated; dev server was not restarted. Two webpack dependency-cache snapshot warnings, npm update notice and informational LF-to-CRLF notices were recorded. No product regression was established by those warnings.

### User-supervised local browser acceptance — USER-VERIFIED PASS

Evidence source: the user's acceptance report supplied for this documentation turn. These checks were not executed or rerun by the agent.

| Check | User-observed behavior | Result |
|---|---|---|
| A. Clean/incognito signed-out /interview | Redirected to /login; Live did not open | PASS |
| B. Authenticated /interview, no params | Redirected to /interview/setup; no unnecessary login | PASS |
| C. iv=unknown, otherwise valid query | Redirected to Setup; Live did not open | PASS |
| D. level=garbage, otherwise valid query | Redirected to Setup | PASS |
| E. level=junior&level=senior | Redirected to Setup | PASS |
| F. Authenticated normal Setup -> Live | No login redirect; valid query; Live loaded; Q1 generated; TTS worked | PASS |
| G. Ctrl+R on valid authenticated Live URL | No login/Setup redirect; Live reloaded; Q1 generated; TTS worked | PASS |
| H. Browser Back from valid Live | Returned to Setup | PASS |

Invalid/missing config never renders/mounts LiveInterviewClient. Deterministic harnesses prove zero Claude question requests, ElevenLabs TTS requests, Live camera acquisition and persistence POST. **This exact zero-activity condition was not manually measured in browser Network.** Real Q1/TTS behavior was user-verified only for valid Setup/refresh flows.

Authenticated testing remains Setup -> valid submit -> Live, without forced re-login. A fully valid bookmarked Live URL remains directly usable while authenticated (deterministic route proof). No dev-only auth bypass exists.

No answer/completion flow was executed during this stage's browser acceptance; no Result or persisted interview was created, no persistence was intentionally triggered, and History count was not changed by this acceptance, per user evidence. History was not queried/recounted by the agent. No new History record or current count is asserted. **HISTORY_PAGINATION_01: NATURAL-RECORD DEFERRED ACCEPTANCE** remains; no synthetic seeding.

### Accepted remaining boundaries / untouched foundations

Result/detail/delete/PDF IDs: **ALREADY HARDENED / OUT OF IMPLEMENTATION SCOPE**. Authentication precedes UUID validation/ownership work; malformed signed-in UUID -> 400; foreign/nonexistent -> same 404; reads/deletes are owner-scoped; PDF uses the protected reader. No source changes there. New write validation is not applied to historical reads; older unsupported persisted values remain readable, without migration/backfill. Existing historical unsupported-language PDF limitations are unchanged.

Direct provider endpoint auth/rate limiting, prompt injection/privacy/private-content logging, and provider resource/cost abuse controls remain SECURITY_PRIVACY_01. Page gating is not provider-endpoint security. Live UI/interview-language coupling remains LOCALIZATION_V1_01; session resume remains SESSION_RESUME_01; Media/device truthfulness and later provider/media work remain MEDIA_PROVIDER_V1_01. These are deferred boundaries, not regressions introduced here.

No migration, package/dependency/configuration/CSS changes; no History/Result/PDF/Profile/Auth implementation changes; no scoring redesign or answer/summary resource policy. No secrets or environment-variable values recorded. No Supabase mutation, browser rerun, tests/build rerun, staging, commit or push in this documentation turn.

This entry supersedes earlier pending route-input and completion Git-status statements for current planning only. INTERVIEW-013 (direct Live auth gate) and INTERVIEW-014 (interviewer key validation) are locally resolved by this stage, pending Git closure. Historical entries and immutable prior reports remain unchanged. ROADMAP_FREEZE_01 critical-path ordering remains unchanged.
