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
