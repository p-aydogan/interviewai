# Talentry / InterviewAI — Current Project State

Last updated: 2026-09-18

## 1. Canonical Repository State

Project path:

C:\Users\p-ayd\interviewai

Active branch:

feature/auth-foundation

Latest safe committed checkpoint:

3dbaca7 feat(dashboard): integrate recent interview history and mobile navigation

Remote recovery branch:

origin/feature/auth-foundation

The recovery checkpoint before Live Interview was `bbffe9b`; Result started from `ef18af9` and is now committed at `c36c15a`. Dashboard / Recent History was subsequently committed at 3dbaca7 after starting from `c36c15a`.

Dashboard / Recent Interview History Integration, including the final mobile three-page architecture, is complete, runtime-accepted, and production-build validated. Interview Setup mobile redesign is also complete, runtime-accepted and production-build validated; Setup mobile changes remain uncommitted; nothing is staged. This closure updates Project Memory only and does not authorize commit or push. Remote checkpoint freshness was not checked in this step.

Do not use `origin/main` as the current recovery reference. The active development and latest safe work are on `feature/auth-foundation`.

---

## 2. Current Product Architecture

The repository currently contains two UI generations.

### New Talentry generation

Implemented:

- Talentry design tokens
- Talentry UI Kit
- AuthShell
- Provider-integrated Create Account flow
- Provider-integrated OTP Verification flow
- Forgot Password UI
- Reset Password flow
- Password Reset Success UI
- Password visibility component
- Responsive Dashboard shell
- Dashboard sidebar / topbar foundation
- Dashboard latest-five persisted interview history, Setup action, localized Result return navigation, and final mobile Home/Menu, Recent Interviews, Actions pager
- Server-side authentication helper
- Authenticated interview persistence API
- Authenticated owner-scoped interview list API
- Authenticated owner-authorized interview detail API
- Persisted UUID-based Result handoff and owner-authorized Result rendering
- Supabase interviews table and ownership model
- Server-protected `/dashboard`
- Authenticated canonical `/interview/setup` route with responsive Talentry UI
- Talentry Live Interview UI with responsive desktop/tablet layout and mobile three-panel pager
- Talentry light Result review with localized TR/EN/DE copy and a mobile three-panel pager
- Temporary `/` redirect to `/interview/setup`

### Result migration and remaining navigation work

`/result/[id]` now uses the Talentry light visual system over the existing persisted owner-filtered detail fetch. Auth/login redirect, retry, refresh stability, and persisted score/summary contract remain intact. Legacy `/result` still redirects safely to `/` and does not render query-controlled score or summary values.

These legacy routes are not evidence of lost Talentry work.

A forensic Git audit confirmed that the previously missing Talentry screens were not implemented and later lost. Sign In, Interview Setup, Live Interview, Result, and Dashboard / Recent History have since been implemented. Welcome remains outstanding; Interview Setup mobile redesign is complete and runtime/build accepted.

The project is in an unfinished migration state.

---

## 3. Completed Auth / Persistence Foundation

Canonical authenticated owner:

`supabase.auth.users.id`

Server authentication chain:

request cookies
→ request-scoped Supabase SSR client
→ `supabase.auth.getUser()`
→ verified authenticated user

Important files:

- `lib/auth/get-authenticated-user.ts`
- `lib/supabase/server.ts`
- `lib/supabase/admin.ts`
- `app/api/interviews/route.ts`
- `app/api/interviews/[id]/route.ts`
- `supabase/migrations/20260818_create_interviews.sql`

Authenticated interview persistence and list-read runtime tests have passed.

Confirmed behavior:

- unauthenticated POST → 401
- authenticated malformed JSON → 400
- authenticated invalid payload → 400
- authenticated valid payload → 201
- client-supplied fake owner identity cannot override server owner
- persisted `owner_id` matches authenticated Supabase user
- unauthenticated GET → 401
- authenticated owner with no rows → 200 with `{ "interviews": [] }`
- authenticated GET returns only the signed-in owner's records
- client ownership query parameters cannot alter the owner scope
- cross-user isolation → PASS
- returned list DTO omits `owner_id`, answers, summary, persona, and interviewer key
- unauthenticated detail GET → 401
- invalid detail UUID → 400 without a database query
- owner detail read → 200 with the persisted detail DTO
- non-owner and nonexistent valid UUIDs → identical 404 responses
- detail ownership-spoof query parameters cannot alter authorization
- detail response excludes `owner_id` and runtime-validates persisted answers
- existing list GET and POST regression checks → PASS

Do not weaken or bypass this ownership boundary during UI migration.

---

## 4. Completed Client Persistence Integration

Legacy `/interview` persists completed interviews through:

`POST /api/interviews`

Current saved fields:

- interviewerKey
- role
- company
- level
- interviewType
- persona
- language
- answers
- score
- summary
- durationSeconds

Client does not send owner identity.

Server derives ownership from the authenticated session.

Completion requires a valid final evaluation, successful persistence, and a valid returned UUID before navigating to `/result/<UUID>`.

Persistence, network, or response-validation failures remain on Interview and preserve the current state for explicit retry. Zero-answer completion creates no fake Result and preserves media.

Latest related safe commit:

`7e644fb feat(interview): persist completed interviews`

---

## 5. Historical Home Session-State Fix

The behavior below is preserved as implementation history but is no longer active because `/` now redirects to the authenticated `/interview/setup` route.

Legacy `/` header now reflects Supabase session state.

Authenticated:

`Çıkış Yap`

Unauthenticated:

`Giriş Yap / Kayıt Ol`

Runtime tests passed for:

- authenticated header
- logout
- unauthenticated header
- login again

Commit:

`3941426 fix(auth): reflect session state in home header`

---

## 6. Completed Stage — Dashboard Authentication Guard

Date completed:

2026-08-27

File changed:

`app/dashboard/page.tsx`

Implementation:

- Dashboard page became an async server component.
- It calls `getAuthenticatedUser()`.
- Unauthorized access redirects to `AUTH_ROUTES.login`.
- Authenticated access renders the existing Talentry Dashboard.

Runtime validation:

Unauthenticated request:

`GET /dashboard`
→ `307 Temporary Redirect`
→ `Location: /login`

Authenticated browser session:

`/dashboard`
→ Talentry Dashboard rendered successfully

Static validation:

- `npx tsc --noEmit --incremental false` → PASS
- `git diff --check` → PASS
- Windows LF → CRLF warning only; no whitespace failure

Commit:

`eb38e15 feat(dashboard): protect dashboard route`

Push:

PASS

Remote:

`origin/feature/auth-foundation`

Status after push:

local and remote synchronized

This is the latest safe recovery checkpoint.

---

## 7. Current Auth Journey Status

### Talentry Sign In

`/login` performs real:

`supabase.auth.signInWithPassword({ email, password })`

and redirects successful authentication to `/dashboard`.

### New Talentry auth screens

`/register`
- polished Talentry UI
- real Supabase `auth.signUp`
- normalized email and password submission
- provider-safe loading and error states
- pending verification email handoff through tab-scoped `sessionStorage`
- successful signup navigation to `/verify`

`/verify`
- polished OTP UI
- actual pending recipient email display
- six-digit verification through `verifyOtp` with `type: 'email'`
- signup confirmation resend through `resend` with `type: 'signup'`
- successful authenticated continuation to `/dashboard`
- safe missing-handoff and provider-error handling

`/forgot-password`
- real Supabase reset email integration

`/reset-password`
- real recovery-session-aware Supabase password update

`/reset-password/success`
- connected success state

`/dashboard`
- now server-protected

---

## 8. Approved Migration Decision

Do NOT create temporary navigation that will immediately be replaced.

New Talentry Sign In must use the permanent intended destination:

successful Sign In
→ `/dashboard`

Do not temporarily redirect new Sign In to legacy `/`.

The new Sign In stage must preserve:

- real `signInWithPassword`
- loading state
- provider error state
- session compatibility
- logout compatibility

and use:

- `AuthShell`
- `TalentryCard`
- `TalentryButton`
- `SectionHeader`
- generic Talentry auth field styles
- `PasswordVisibilityIcon`
- `AUTH_ROUTES`

---

## 9. Deferred Fixes — Do Not Forget

This section summarizes resolved auth migration items and remaining deferred work.

### Authentication

1. `AUTH_ROUTES.verifyCode` now resolves to `/verify`. RESOLVED.

2. `/register` now performs real Supabase signup. RESOLVED.

3. `/verify` now performs real OTP verification and signup resend. RESOLVED.

4. AuthShell Language selector remains presentation-only. DEFERRED.

5. Talentry Sign In is implemented and runtime-validated. RESOLVED.

6. Supabase authentication emails were observed in Junk/Spam during acceptance testing. Production deliverability review is DEFERRED.

### Dashboard

7. Recent Interviews now displays persisted data and Quick Actions is functional. Welcome remains compact; Recommended Jobs, AI Insights, Daily Tip and Premium remain placeholders.

8. Quick Actions links to `/interview/setup`. RESOLVED.

9. Latest-five Dashboard history integration is complete. Full My Interviews and full-history pagination/search/filter remain deferred.

10. Jobs, AI Coach, Reports, Saved Roles, Settings, Premium remain unavailable placeholders.

11. Dashboard currently has its own embedded CSS / palette instead of full Talentry token convergence.

Do not refactor this during unrelated stages.

### Interview

12. Talentry Live Interview UI is implemented and runtime-validated. RESOLVED.

13. Interview business/runtime logic must be preserved during future migration.

14. `getUserMedia` currently requests:

`video: true`
`audio: false`

while microphone toggle logic searches for audio tracks.

15. `connected` state is never set to true.

16. `videoRef` is currently unused.

17. Real HeyGen/live-avatar integration remains deferred.

18. Generated audio object URLs are revoked during replacement, completion, playback failure, and cleanup. RESOLVED.

19. The Talentry Setup UI no longer reads or displays legacy CV data. It preserves an empty `cv=` compatibility parameter, while the interview engine still does not consume CV content.

20. Interview answer count behavior should later be reviewed; one runtime test produced four persisted answers while UI reached question 5.

21. Live Interview renders one canonical written question. RESOLVED.

22. UI, TTS, current-question reference, and persisted answer pair use one trimmed canonical question. RESOLVED.

23. Extra spoken TTS words require investigation without speculative engine changes.

Do not allow these issues to derail unrelated stages; they belong to the Talentry Live Interview migration.

### Result / History

24. Legacy `/result` query-string trust is removed. RESOLVED.

25. Interview now validates and uses the UUID returned by persistence. RESOLVED.

26. `/result/[id]` now renders persisted data through the owner-authorized detail API. RESOLVED.

27. Authenticated owner-scoped list and owner-authorized detail-by-ID GET boundaries exist and are runtime-validated.

28. Dashboard Recent Interviews and persisted Result navigation are complete. Full-history UI remains deferred.

29. Live Interview provides an explicit localized End Interview action. RESOLVED.

30. A stale completion warning clears when a valid answer is submitted. RESOLVED.

31. An ambiguous committed-but-response-lost persistence retry can still create a duplicate record. Idempotency remains DEFERRED.

The ID-based Result flow and Dashboard Recent History integration are complete and runtime-accepted.

---

## 10. Protected Legacy Interview Core

Future UI migration must preserve:

- setup parameters
- interviewer selection
- role
- company
- level
- interview type
- persona
- separate interview language
- Claude question generation
- Claude answer feedback
- ElevenLabs TTS
- webcam lifecycle
- answer collection
- five-question interview flow
- scoring
- summary generation
- duration
- authenticated persistence
- server-enforced ownership
- Result handoff

Do not redesign and refactor the engine at the same time unless a specific stage explicitly approves it.

---

## 11. Register / OTP Provider Integration

Status:

COMPLETED — PASS

Permanent flow:

`/register`
→ Supabase `auth.signUp`
→ `/verify`
→ Supabase six-digit email OTP verification
→ `/dashboard`

Real provider acceptance, invalid-code handling, resend, authenticated Dashboard redirect, and session persistence all passed.

---

## 12. Stage Close Protocol

Before starting every new stage:

1. Confirm previous stage runtime PASS.
2. Update Project Memory.
3. Record deliberately deferred fixes.
4. Record decisions and risks.
5. Confirm rollback commit.
6. Commit documentation/code as appropriate.
7. Push.
8. Confirm local/remote synchronization.
9. Confirm working tree clean.
10. Only then begin the next stage.

Do not silently carry temporary fixes into later stages.

---

## 13. Updated Stage / Commit Protocol

Normal rule:

Do not commit or push after every micro-step.

For each development stage:

1. start from a clean working tree
2. work in small controlled steps
3. complete static and runtime validation
4. update only the relevant Project Memory files
5. review the complete stage diff
6. create one stage-level commit
7. push once
8. confirm local/remote synchronization
9. confirm clean working tree
10. begin the next stage

Separate checkpoint commits are reserved for major recovery points, high-risk changes, governance changes, or interrupted stages that require a safe recovery point.

Project Memory behavior:

- `CURRENT_STATE.md` → refresh/update current state
- `STAGE_LOG.md` → append-only
- `DEFERRED_FIXES.md` → update only when deferred items change
- `DECISIONS_AND_RISKS.md` → update only when decisions or risks change

---

## 14. Supabase Availability Warning

Operational risk noted:

A recent Supabase email warned that the project may be paused.

Before any Supabase-dependent runtime validation, confirm that the Supabase project is active and reachable.

This applies especially to:

- Sign In
- Dashboard authentication
- password recovery
- registration / OTP
- interview persistence
- future interview read/history APIs

If auth or persistence suddenly fails without a corresponding code change, check Supabase project availability before modifying application code.

Do not diagnose a paused/unavailable Supabase project as an application regression.

---

## 15. Talentry Sign In — Completed and Runtime Validated

Status:

COMPLETED — PASS

Date:

2026-08-28

Route:

`/login`

Implementation:

The legacy multi-mode InterviewAI login page has been replaced by a focused Talentry Sign In architecture.

Current structure:

`app/login/page.tsx`
→ `AuthShell`
→ `SignInForm`

New component:

`components/auth/SignInForm.tsx`

Styling:

`styles/talentry-auth.css`

Functional authentication contract:

`supabase.auth.signInWithPassword({ email, password })`

Permanent successful-login destination:

`/dashboard`

The new Sign In does NOT redirect to legacy `/`.

### Sign In capabilities now validated

- Talentry Sign In screen renders at `/login`
- email field works
- password field works
- shared password visibility icon works
- invalid credentials display a visible provider error
- loading state is implemented
- Forgot Password links to `/forgot-password`
- Create Account links to `/register`
- valid Supabase credentials authenticate successfully
- successful Sign In redirects to `/dashboard`
- server-protected Dashboard renders for the authenticated session
- Dashboard remains authenticated after browser refresh
- the same authenticated session is recognized by legacy `/`
- legacy `/` displays `Çıkış Yap` while authenticated
- existing logout remains compatible with the new Sign In
- after logout, legacy `/` returns to `Giriş Yap / Kayıt Ol`

### Static validation

`npx tsc --noEmit --incremental false`

PASS

`git diff --check`

PASS

`npm run build`

PASS

Build generated all static pages successfully.

### Current Sign In stage files

Modified:

- `app/login/page.tsx`
- `styles/talentry-auth.css`

Added:

- `components/auth/SignInForm.tsx`

No unrelated source file was changed.

### Scope intentionally preserved

The following were NOT changed during this stage:

- Register provider behavior
- OTP provider behavior
- `/verify-code` versus `/verify` mismatch
- Dashboard authentication guard
- Interview
- Result
- password recovery flow
- interview persistence
- Supabase schema
- ownership logic

### Expected legacy behavior still visible

Opening:

`/`

still shows the legacy Interview Setup screen.

This is expected.

The root Welcome migration has not started and remains intentionally deferred.

---

## 16. New Operational Observations

### Next.js generated-cache concurrency

Do not run the production build and development server against the same `.next` output concurrently.

During Sign In validation, a production build running beside an older development process caused a generated `.next` runtime mismatch.

Recovery required only:

- stopping/restarting the verified local Next.js process
- regenerating `.next`

No source-code recovery was required.

Treat `.next` as generated cache, not project source.

### Authenticated `/login` access

An already-authenticated user can still manually open `/login`.

No login-route guard or broader auth middleware was introduced during the Sign In stage.

This is not currently blocking the authenticated product flow and should not be opportunistically expanded during unrelated stages.

### Authentication email deliverability

During Register / OTP acceptance testing, Talentry/Supabase authentication emails were observed in the recipient's Junk/Spam folder.

This is a production-readiness and email-deliverability risk, not a functional Register / OTP failure.

No SMTP, domain, sender, or provider configuration change was attempted during this stage.

---

## 17. Current Stage Position

### Interview Setup Mobile Redesign — Closure (2026-09-18)

Status: COMPLETED, RUNTIME ACCEPTED AND PRODUCTION BUILD VALIDATED — PASS.

Evidence source: verified acceptance and build results supplied by the user. This memory-only update does not rerun runtime acceptance or production build.

- At <=640px, exactly two panels: Panel 1 contains introduction, interviewer selection, persona and interview language. Panel 2 contains optional role, optional company/sector, level, interview type and one Start Interview action.
- InterviewSetupForm retains all setup state; no duplicate business state. Defaults remain interviewer=f, role='', company='', level=mid, interviewType=behavioral, persona=formal, interviewLanguage=tr.
- Application UI language remains independent through interviewai_uilang. Query keys remain iv, role, company, level, itype, persona, language, cv. Role/company trim-on-submit, empty cv and existing URLSearchParams/router.push flow remain unchanged.
- Exactly two dots, left/right swipe and direct dot navigation work. Pager stays outside the active content's single vertical scroll region when needed. State survives panel switching and 390 -> 641 viewport transitions, including interviewer/persona/interview-language selections.
- Refresh retains application UI language but resets the form draft to defaults. Blank role/company submit successfully with empty query keys.
- Runtime PASS: 390x844 Panel 1; Panel 2; swipe back; dot navigation; role/company preservation; 390 -> 641 state preservation; query contract; interviewer/persona/language preservation; optional empty submission; UI/interview-language independence; refresh; desktop regression; tablet regression.
- Existing Live Interview mobile feedback-panel gating was also observed working during acceptance; no Interview logic changes were introduced.
- Validation PASS: npx.cmd tsc --noEmit; git diff --check; npm.cmd run build. Compilation, lint/type checking, page-data collection, static generation 18/18, build traces and final page optimization all passed.
- Existing desktop/tablet composition is preserved. Above 640px, normal document scrolling remains acceptable and no mobile pager is shown.
- Deferred: receiver validation gaps, hardcoded copy outside mobile additions, Setup draft persistence, and browser-specific mobile keyboard edge cases.
- Dashboard, Result, Interview logic, APIs, schema, auth, scoring, prompts, HeyGen/avatar, PDF, history and root routing were not changed by this stage.
- Setup work remains unstaged and uncommitted at recovery HEAD 3dbaca7 on feature/auth-foundation. No next stage, commit or push is authorized. This closure supersedes earlier pending runtime/build statements without rewriting implementation reports.

### Previously completed Dashboard foundation

Dashboard / Recent Interview History Integration, including final mobile three-page Dashboard:

COMPLETED, RUNTIME ACCEPTED AND PRODUCTION BUILD VALIDATED — PASS

Closure evidence: user-supplied verified runtime/static/build results recorded on 2026-09-16; acceptance and build were not rerun in this memory-only step.

- Dashboard remains server-auth-protected. The existing owner-scoped `GET /api/interviews` is reused with optional validated `limit` (1–100); `/api/interviews?limit=5` returns the latest five owner-scoped interviews. No-limit behavior remains preserved. GET responses use `Cache-Control: private, no-store`.
- Owner identity remains derived server-side; no client-supplied owner/user identifier is trusted. No schema/RLS/auth redesign was introduced.
- Recent rows retain newest-first ordering and show persisted role/company, score `/100`, date/time, interview type, language and duration. Loading, empty, error/retry, 401 redirect, cancellation and freshness behavior are implemented. A newly completed interview appears first when returning to Dashboard.
- Start New Interview → `/interview/setup`; history row → persisted `/result/<id>`; localized Result Back to Dashboard → `/dashboard`. Existing Restart through `/` is unchanged.
- Dashboard supports TR/EN/DE through `interviewai_uilang`; persisted role/company remain untranslated and interview language stays independent. Result return copy is localized.
- At `<=640px`, initial Page 1 is Home/Menu: search, Welcome, mobile equivalent of desktop Sidebar; unavailable destinations stay disabled. Page 2 is Recent Interviews with existing states and Result links. Page 3 is Actions: Quick Actions/Start New Interview, Recommended Jobs and existing placeholders.
- Exactly three dots, left/right swipe and direct dot navigation use a stable pager footer. Active content has one vertical scroll region when needed. Old decorative bottom navigation is hidden; page navigation does not refetch history. Above 640px, desktop/tablet Dashboard layout is preserved.
- Runtime PASS: desktop Dashboard; latest five/newest-first; History → Result; Result → Dashboard; fresh history after completion; all three 390×844 pages; swipe back; dot navigation; mobile Start Interview → Setup; mobile History → Result; desktop regression.
- Validation PASS: `npx.cmd tsc --noEmit`, `git diff --check`, `npm.cmd run build`; successful compilation, lint/type checking, page-data collection, static generation 18/18, build traces and final optimization. Routes present: `/dashboard`, `/api/interviews`, `/api/interviews/[id]`, `/interview/setup`, `/result/[id]`.

Interview Setup mobile redesign is complete; no next stage is authorized. Full My Interviews, full-history pagination/search/filter, PDF/download and HeyGen/avatar remain deferred. Dashboard placeholders, scoring trust boundary, Claude proxy security/privacy debt and TTS/provider latency debt remain unchanged. No delete/edit/favorites/tags/analytics were added.

### Previously completed Result foundation

Talentry Result Visual Migration + mobile three-panel pager + Interview desktop CSS guard:

COMPLETED, RUNTIME ACCEPTED AND PRODUCTION BUILD VALIDATED — PASS

Closure evidence: the user supplied verified runtime and production-build results on 2026-09-16. This memory-only update records those results; it does not rerun acceptance or build.

- Persisted score is displayed explicitly as score `/100`; the persisted summary remains the assessment. No pass/fail tier, percentile, gamification, chart, new scoring logic, or invented AI insight was added.
- Metadata includes role, company, level, interview type, interview language, persona/style, duration, and date/time with localized labels/fallbacks. Interviewer identity is not invented.
- The full persisted Q&A transcript remains accessible. `Yeniden Başla` retains navigation through `/`, returning to Interview Setup.
- TR/EN/DE interface copy uses the existing `interviewai_uilang` preference. Interview language remains independent; persisted summary/questions/answers are not translated.
- At `<=640px`, Result opens on Evaluation, followed by Interview Details and Questions & Answers. Exactly three pagination dots support direct navigation, alongside left/right swipe. Panel changes do not refetch the API.
- Long content is accessible through one vertical scroll region inside the active panel. Restart remains accessible in the transcript panel. Above 640px, the existing non-pager desktop/tablet layout is preserved.
- Desktop visual, refresh persistence, 390×844 Panel 1, forward/back swipes, dot navigation, transcript/restart accessibility, and restart → Setup all passed. No visible horizontal overflow was observed at 390×844.
- The Interview desktop CSS guard forces `.mobilePanelAction` and `.mobilePanelBack` hidden above 640px, preventing shared `.talentry-button { display:inline-flex }` from exposing mobile controls in the desktop grid. Desktop runtime returned to normal. Interview logic/state/TTS/API behavior and the approved `<=640px` Interview pager are unchanged.
- `npx.cmd tsc --noEmit`, `git diff --check`, and `npm.cmd run build` passed. Production compilation, lint/type validation, page-data collection, static generation 18/18, build tracing, and final optimization all passed. Routes include `/api/claude`, `/api/interviews`, `/api/interviews/[id]`, `/interview`, `/interview/setup`, and `/result/[id]`.

Dashboard / History integration has now closed as recorded above. PDF/report download, HeyGen/live avatar, scoring trust-boundary changes, Claude proxy auth/privacy debt, and TTS/provider latency remain deferred. No next stage, commit, or push is authorized by this closure.

### Previously completed Live Interview foundation

Talentry Live Interview:

COMPLETED AND RUNTIME VALIDATED — PASS

The Live Interview now uses the Talentry visual system. Header, interviewer stage, question workspace, and controls are separated into presentational components while orchestration remains in `app/interview/page.tsx`.

The engine uses one trimmed canonical question for the visible question, TTS, current-question reference, and persisted answer pair. A synchronous generation guard prevents overlapping question requests. UI question delivery no longer waits for ElevenLabs latency, and stale audio requests are invalidated while object URLs are revoked. Claude receives prior question texts to reduce repeated competencies and near-duplicate topics.

Structured feedback accepts valid or fenced JSON with `strength`, `improvement`, and `suggestion`, retains a readable fallback, and uses localized TR/EN/DE labels. Notes remain controlled and transient across tab changes.

At `<=640px`, Live Interview uses three horizontal panels: Interviewer, Question/Answer, and Feedback. Mobile opens silently on Panel 1. First entry into Panel 2 through CTA, swipe, or pagination triggers Q1/TTS exactly once. Panel 3 remains gated until feedback exists, is review-only, and returns the user to Panel 2 for the existing Next Question flow. The post-submit Panel 2 layout is compact at 390×844 while preserving the pre-submit textarea and accessible controls.

Zero-answer completion performs no evaluation, persistence, or Result navigation. The localized warning offers Return to Interview and Leave Without Saving. Leaving invalidates and stops TTS, revokes audio resources, stops media, returns to `/dashboard`, and creates no record. Generic completion failure exposes the same escape path. Failure → return → retry → persisted Result passed runtime validation.

The historical `app/api/Claude` versus `/api/claude` mismatch was fixed through a content-identical case-only rename to `app/api/claude`. The defect predates the new-computer migration. Production build now exposes `ƒ /api/claude`, and runtime question generation and TTS are restored.

Production validation passed compilation, lint/type validation, page-data collection, 18/18 static generation, build tracing, and final optimization. Relevant routes include `/api/claude`, `/api/interviews`, `/api/interviews/[id]`, `/interview`, `/interview/setup`, and `/result/[id]`.

Next planned sequence:

1. Dashboard / Recent History is complete and committed at 3dbaca7.
2. Interview Setup mobile redesign is complete, runtime/build accepted and uncommitted; commit requires separate authorization.
3. Welcome/root cutover and full-history work remain deferred.

Do not begin the next stage automatically.

---

## 18. Current Recovery / Environment

- Repository: `C:\Users\p-ayd\interviewai`
- Branch: `feature/auth-foundation`
- Current safe committed checkpoint: `3dbaca7 feat(dashboard): integrate recent interview history and mobile navigation`; Setup mobile closure remains uncommitted.
- New-computer migration: completed successfully
- Node.js: `24.18.0`
- npm: `11.16.0`
- Git: `2.55.0.windows.3`
- VS Code: `1.135.0`
- `.env.local`: restored locally and Git-ignored; contents must never be recorded in Project Memory

The separate USB recovery bundle remains outside the repository and contains no information that should be copied into Project Memory.
