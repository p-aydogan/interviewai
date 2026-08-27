# Talentry / InterviewAI — Deferred Fixes Register

This file records known issues that are intentionally deferred.

Rules:

- Do not fix these opportunistically inside unrelated stages.
- Each item should be closed only in its planned stage.
- When an item is resolved, mark it as RESOLVED and record the commit.
- Do not silently delete historical items.

---

## AUTH-001 — Verify Route Mismatch

Status: DEFERRED

Current state:

`AUTH_ROUTES.verifyCode`

points to:

`/verify-code`

but the implemented route is:

`/verify`

Planned stage:

Register / OTP integration

Risk:

Broken navigation once registration and OTP become functional.

Do not fix during Talentry Sign In unless the Sign In implementation directly depends on it.

---

## AUTH-002 — Register Is Local-Only

Status: DEFERRED

Current state:

`/register`

has Talentry UI and local validation but does not create a Supabase account.

Planned stage:

Registration integration

Required later:

- real `supabase.auth.signUp`
- provider errors
- loading state
- post-submit OTP journey
- validation parity
- no duplicate account flow

---

## AUTH-003 — OTP Verification Is Local-Only

Status: DEFERRED

Current state:

`/verify`

contains OTP UI behavior but does not verify a real provider code.

Planned stage:

Registration / OTP integration

Required later:

- recipient email state
- real OTP verification
- resend behavior
- expired code behavior
- invalid code behavior
- successful authenticated continuation

---

## AUTH-004 — AuthShell Language Menu Is Presentation-Only

Status: DEFERRED

Current state:

Language menu visually offers:

- English
- Türkçe
- Deutsch

but does not change application language.

Planned stage:

App language integration

Important:

Application language and interview language must remain separate concepts.

---

## AUTH-005 — Legacy Login Contains Obsolete Multi-Mode Auth UI

Status: ACTIVE UNTIL SIGN IN MIGRATION

Current state:

Legacy `/login` contains:

- login
- signup
- reset
- verify
- new password

inside one page.

This must not be copied into the new Talentry Sign In architecture.

Planned stage:

Talentry Sign In

Permanent target:

`/login`
→ real `signInWithPassword`
→ `/dashboard`

Create Account and Forgot Password must use their dedicated Talentry routes.

---

## DASH-001 — Dashboard Cards Are Placeholders

Status: DEFERRED

Current state:

Dashboard contains title-only cards:

- Welcome
- Quick Actions
- Recent Interviews
- Recommended Jobs
- AI Insights
- Daily Tip
- Premium

No real data/actions are connected.

Planned stage:

Dashboard functional integration

---

## DASH-002 — Quick Actions Not Connected to Interview Setup

Status: DEFERRED

Current state:

No Dashboard Quick Action currently starts the interview setup flow.

Planned stage:

Talentry Interview Setup integration

Important:

Do not connect Quick Actions to a temporary legacy route if that connection will immediately be replaced.

---

## DASH-003 — Interview History Not Implemented

Status: DEFERRED

Current state:

Recent Interviews / My Interviews have no authenticated read data source.

Missing:

- owner-authorized interview list API
- interview detail read API
- dashboard history data
- history UI

Planned stage:

Interview read boundary + history

Security requirement:

Cross-user reads must be denied before exposing history UI.

---

## DASH-004 — Dashboard Styling Has Separate Embedded Palette

Status: DEFERRED

Current state:

`DashboardLayout.tsx`

contains a large embedded CSS block and its own dashboard palette.

It has not been fully converged with the shared Talentry token system.

Planned stage:

Design-system convergence

Do not refactor during auth or interview migration unless required for correctness.

---

## INTERVIEW-001 — Microphone UI Has No Audio Track

Status: DEFERRED

Current state:

Media acquisition uses:

`getUserMedia({ video: true, audio: false })`

while microphone toggle code looks for audio tracks.

Impact:

Mic button does not represent real microphone capture.

Planned stage:

Interview media/device behavior

---

## INTERVIEW-002 — `connected` State Is Never Activated

Status: DEFERRED

Current state:

`connected` starts false and is not set true in the active interview component.

Impact:

Interviewer connection/spinner behavior is incomplete.

Planned stage:

Live Interview engine audit / HeyGen integration

---

## INTERVIEW-003 — `videoRef` Is Unused

Status: DEFERRED

Current state:

`videoRef` exists in the interview component but is not used.

Likely origin:

Incomplete HeyGen/live-avatar integration.

Planned stage:

Live Interview engine cleanup after behavior is fully mapped.

Do not remove blindly before confirming intended avatar architecture.

---

## INTERVIEW-004 — HeyGen Integration Is Incomplete

Status: DEFERRED

Current state:

A HeyGen-related API/token capability exists in the project, but the active legacy interview component does not complete a live-avatar flow.

Planned stage:

AI avatar architecture

Important:

The final product requirement includes a realistic human-like AI interviewer avatar.

Do not replace the current working Claude / ElevenLabs flow until the new avatar flow is validated.

---

## INTERVIEW-005 — Audio Object URLs Are Not Revoked

Status: DEFERRED

Current state:

ElevenLabs response blobs create object URLs.

The current code does not revoke those URLs.

Risk:

Potential memory/resource leak over repeated use.

Planned stage:

Interview media lifecycle cleanup

---

## INTERVIEW-006 — CV Contract Is Incomplete

Status: DEFERRED

Current state:

CV-related data is carried from setup/local storage/navigation but the active interview engine does not consume it.

Planned stage:

CV-based interview question integration

Important:

CV-based questions are an intended product feature but should remain optional.

---

## INTERVIEW-007 — Persisted Answer Count Observation

Status: DEFERRED INVESTIGATION

Observed runtime behavior:

One validated interview reached question 5 in the UI but persisted:

`jsonb_array_length(answers) = 4`

Current interpretation:

This may be normal legacy flow behavior because only four answers were actually submitted.

It is not currently considered a persistence failure.

Planned stage:

Interview state-machine validation

Required later:

Test all combinations:

- answer all questions
- skip one question
- skip final question
- submit final answer
- end manually
- zero answers

---

## INTERVIEW-008 — Legacy Interview UI Still Active

Status: DEFERRED MIGRATION

Current route:

`/interview`

Current UI:

Legacy InterviewAI

Current runtime core is functional and must be protected.

Planned stage:

Talentry Live Interview migration

Do not combine visual redesign with uncontrolled runtime refactoring.

---

## RESULT-001 — Result Trusts Query Parameters

Status: DEFERRED

Current contract:

`/result?score=<score>&summary=<summary>`

The page trusts URL values directly.

Risks:

- tampering
- generated evaluation text in URL/history
- no ownership validation
- no database-backed refresh

Planned stage:

ID-based Result

Prerequisite:

Authenticated owner-authorized interview read API.

---

## RESULT-002 — Persistence UUID Is Ignored by Client

Status: DEFERRED

Current state:

`POST /api/interviews`

returns an interview UUID.

The client currently ignores that UUID and navigates using score/summary query parameters.

Planned stage:

ID-based Result handoff

---

## RESULT-003 — No Authenticated Interview Read API

Status: DEFERRED — SECURITY PREREQUISITE

Current state:

Write API exists.

Read API does not exist.

Required before:

- Result by interview ID
- Interview History
- Recent Interviews
- My Interviews
- Reports based on saved interviews

Security tests required later:

- unauthenticated → 401
- owner read → success
- non-owner read → denied
- malformed UUID → rejected
- list returns only authenticated owner rows

---

## RESULT-004 — No Interview History UI

Status: DEFERRED

Current state:

No owner-backed interview list/detail UI exists.

Planned stage:

Dashboard history integration

---

## ROOT-001 — Legacy Root Still Acts as Interview Setup

Status: DEFERRED MIGRATION

Current route:

`/`

Current behavior:

Legacy Interview Setup

Approved Welcome blueprint is referenced in project governance, but no Talentry Welcome implementation exists.

Planned order:

1. Talentry Sign In
2. registration / OTP connection
3. authenticated interview read boundary
4. ID-based Result
5. Talentry Interview Setup
6. Talentry Live Interview
7. Dashboard integrations
8. Welcome cutover at `/`

Do not replace `/` prematurely.

---

## ROOT-002 — Legacy Home Session Header Is Temporary Legacy Functionality

Status: KEEP UNTIL ROOT CUTOVER

Current state:

Legacy `/` correctly reflects authenticated session state.

Commit:

`3941426 fix(auth): reflect session state in home header`

Do not remove until the legacy root is intentionally retired.

---

## REPO-001 — `origin/main` Is Behind Active Feature Development

Status: KNOWN

Current active recovery branch:

`feature/auth-foundation`

Current remote recovery branch:

`origin/feature/auth-foundation`

Do not treat `origin/main` as the canonical latest recovery point until an explicit merge stage is approved.

---

## REPO-002 — Windows LF → CRLF Warning

Status: KNOWN / NON-BLOCKING

Observed during:

- `git diff --check`
- `git add`
- Git diff operations

Message:

`LF will be replaced by CRLF the next time Git touches it`

Current assessment:

Informational Windows line-ending behavior.

Do not perform global line-ending normalization during unrelated stages because it may create noisy diffs.

---

# Current Priority

Next active stage:

Talentry Sign In

Do not work on deferred items above unless the current stage explicitly requires one of them.