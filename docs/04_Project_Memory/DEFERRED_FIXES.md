# Talentry / InterviewAI — Deferred Fixes Register

This file records known issues that are intentionally deferred.

Rules:

- Do not fix these opportunistically inside unrelated stages.
- Each item should be closed only in its planned stage.
- When an item is resolved, mark it as RESOLVED and record the commit.
- Do not silently delete historical items.

---

## AUTH-001 — Verify Route Mismatch

Status: RESOLVED

Previous state:

`AUTH_ROUTES.verifyCode`

points to:

`/verify-code`

but the implemented route is:

`/verify`

Resolved stage:

Register / OTP integration

Resolution:

`AUTH_ROUTES.verifyCode` now resolves to `/verify`.

No `/verify-code` route was created.

Runtime validation: PASS

---

## AUTH-002 — Register Is Local-Only

Status: RESOLVED

Previous state:

`/register`

has Talentry UI and local validation but does not create a Supabase account.

Resolved stage:

Registration integration

Resolution:

`/register` now performs real `supabase.auth.signUp`, preserves validation, prevents duplicate submits, presents loading/provider errors, hands off the pending email, and navigates to `/verify`.

Runtime validation: PASS

---

## AUTH-003 — OTP Verification Is Local-Only

Status: RESOLVED

Previous state:

`/verify`

contains OTP UI behavior but does not verify a real provider code.

Resolved stage:

Registration / OTP integration

Resolution:

`/verify` now displays the pending signup email, verifies the six-digit code with `type: 'email'`, resends signup confirmation with `type: 'signup'`, establishes the authenticated session, and continues to `/dashboard`.

Invalid codes, resend failures, missing email handoff, loading, and duplicate submits are handled safely.

Runtime validation: PASS

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

Status: RESOLVED

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

Resolved:

2026-08-28

Resolution:

Legacy multi-mode `/login` was replaced by the focused Talentry Sign In architecture.

Runtime validation:

PASS

Commit:

Resolution commit is recorded in Git history.

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

The canonical authenticated Setup route now exists at `/interview/setup`, but no Dashboard Quick Action currently links to it.

Planned stage:

Dashboard / History / Sidebar integration

Important:

Do not connect Quick Actions to a temporary legacy route if that connection will immediately be replaced.

---

## DASH-003 — Interview History Not Implemented

Status: DEFERRED

Current state:

Authenticated owner-scoped list and detail APIs now exist and passed cross-user isolation testing.

Remaining:

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

The Talentry Setup UI no longer displays a CV control and does not read, expose, mutate, or delete legacy `interviewai_cv` storage.

For exact Live Interview compatibility, Setup continues to emit an empty `cv=` query parameter. The active interview engine does not consume CV content.

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

## INTERVIEW-009 — End Interview Control Is Not Explicitly Labeled

Status: DEFERRED UX / ACCESSIBILITY

Observed:

2026-08-30 during ID-Based Result runtime acceptance.

Current state:

The red circular `📵` control ends the interview, but it has no clear visible `End Interview` / `Mülakatı Bitir` label and no explicit `aria-label`, title, or tooltip.

Impact:

Users must infer the action from the icon, and assistive-technology naming is not sufficiently explicit.

Planned stage:

Talentry Live Interview UX/accessibility migration.

Required direction:

Provide a visible action label and appropriate accessible naming/tooltip while preserving the validated completion behavior.

---

## INTERVIEW-010 — Obsolete Completion Error Can Remain Visible

Status: DEFERRED UX

Observed:

After the zero-answer warning was shown, the user submitted an answer and received feedback while the earlier warning remained visible.

Current behavior:

`completionError` clears when a new completion attempt begins, so persistence and Result correctness are unaffected.

Deferred refinement:

Clear obsolete completion errors when productive interview activity resumes, if consistent with the future Talentry Live Interview interaction design.

Do not alter the validated completion guard or persistence flow opportunistically.

---

## INTERVIEW-011 — Question Presentation and Written/Spoken Delivery Need One Canonical Source

Status: DEFERRED LIVE INTERVIEW MIGRATION

Current state:

The generated question is displayed in both the dark interview canvas and the right-side panel. Written and spoken delivery can diverge because the future Talentry presentation boundary has not yet established one canonical normalized question string for both UI and ElevenLabs.

Planned stage:

Talentry Live Interview migration

Required direction:

- remove unintended duplicate question presentation;
- normalize the generated question once;
- feed the same canonical string to visible question UI and ElevenLabs;
- preserve question generation, answer collection, feedback, persistence, and Result behavior.

---

## INTERVIEW-012 — Extra Spoken TTS Words Need Investigation

Status: DEFERRED INVESTIGATION

Current state:

Runtime observation indicates that spoken question output may contain extra words beyond the intended written question.

Planned stage:

Talentry Live Interview migration / TTS diagnostics

Required boundary:

Identify whether the cause is prompt output, text normalization, request construction, or provider behavior before changing code. Do not apply speculative ElevenLabs or Claude changes.

---

## RESULT-001 — Result Trusts Query Parameters

Status: RESOLVED — ID-BASED RESULT PASS

Previous contract:

`/result?score=<score>&summary=<summary>`

The page trusts URL values directly.

Risks:

- tampering
- generated evaluation text in URL/history
- no ownership validation
- no database-backed refresh

Resolved stage:

ID-Based Result Migration

Resolution:

- `app/result/page.tsx` is now a server redirect to `/`;
- query-supplied score and summary are never rendered;
- `/result/[id]` renders runtime-validated persisted data from the owner-authorized detail API;
- forged query-string, cross-user, invalid, nonexistent, and unauthenticated access tests passed.

Runtime validation: PASS

---

## RESULT-002 — Persistence UUID Is Ignored by Client

Status: RESOLVED — UUID HANDOFF PASS

Previous state:

`POST /api/interviews`

returns an interview UUID.

The client ignored that UUID and navigated using score/summary query parameters.

Previous handoff gaps:

- persistence failures did not prevent legacy Result navigation
- zero-answer sessions bypassed persistence and navigated directly to legacy Result

Resolution:

- completion is synchronously guarded;
- final evaluation is validated;
- persistence must succeed;
- the returned UUID is parsed and validated;
- successful navigation is only `/result/<UUID>`;
- failures remain on Interview for explicit retry;
- zero-answer termination creates no fake record.

Runtime validation: PASS

---

## RESULT-003 — No Authenticated Interview Read API

Status: RESOLVED — LIST AND DETAIL BOUNDARIES PASS

Previous state:

Write API exists.

Read API does not exist.

Resolved:

`GET /api/interviews` now returns a narrowed owner-scoped list after server-side authentication.

Runtime validation passed for:

- unauthenticated → 401
- empty authenticated owner → 200 with an empty list
- owner list read → success
- ownership-spoof query parameters → ignored
- real cross-user list isolation → PASS
- refreshed authenticated session → same owner-scoped records

Detail boundary resolution:

`GET /api/interviews/[id]` now returns the complete owner-authorized persisted detail DTO without `owner_id`.

Runtime validation passed for:

- unauthenticated detail → 401
- owner detail → 200
- non-owner detail → privacy-preserving 404
- nonexistent valid UUID → identical 404
- invalid UUID → 400 before database access
- ownership-spoof query parameters → ignored
- POST-returned UUID → matching detail response
- answers and summary → persisted values

The ID-Based Result Migration is complete and runtime-validated.

---

## RESULT-004 — No Interview History UI

Status: DEFERRED

Current state:

Owner-authorized list and detail data boundaries exist, but no interview history UI consumes them.

Planned stage:

Dashboard history integration

---

## RESULT-005 — Completion Persistence Is Not Idempotent

Status: DEFERRED PERSISTENCE HARDENING

Current state:

Recoverable completion failures preserve Interview state and allow explicit retry. No automatic POST retry exists.

Remaining risk:

If the server commits successfully but the client never receives the response, an explicit retry may create a duplicate persisted interview.

Runtime-test boundary:

The accepted blocked-POST test failed before server submission and therefore did not reproduce the ambiguous committed-but-response-lost case.

Planned stage:

Interview persistence idempotency / completion hardening.

Related risk:

`RISK-013`

Do not claim idempotency is solved or add ad hoc client-only retry identity during unrelated UI work.

---

## ROOT-001 — Legacy Root Still Acts as Interview Setup

Status: PARTIALLY RESOLVED — WELCOME CUTOVER DEFERRED

Current route:

`/`

Current behavior:

Temporary server redirect to the canonical authenticated `/interview/setup` route.

Unauthenticated root access therefore continues to `/login` through the Setup server auth guard.

Approved Welcome blueprint is referenced in project governance, but no Talentry Welcome implementation exists.

Planned order:

1. Talentry Sign In
2. registration / OTP connection
3. authenticated interview read boundary
4. ID-based Result
5. Talentry Interview Setup — COMPLETE / PASS
6. Talentry Live Interview
7. Dashboard integrations
8. Welcome cutover at `/`

Do not replace the temporary root redirect until the Welcome/root cutover stage is explicitly approved.

---

## ROOT-002 — Legacy Home Session Header Is Temporary Legacy Functionality

Status: RESOLVED IN TALENTRY SETUP STAGE — COMMIT PENDING

Current state:

The legacy root Setup and its browser session-aware header are no longer active. `/` now redirects to the server-protected `/interview/setup` route, whose header intentionally contains no Sign In, Create Account, or Logout actions.

Commit:

`3941426 fix(auth): reflect session state in home header`

Historical commit retained for recovery context. The current Setup stage remains uncommitted until authorized stage closure.

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

Current stage closure:

Talentry Interview Setup — COMPLETED / PASS

Next planned stage:

Talentry Live Interview migration/redesign

Do not work on deferred items above unless a future stage explicitly requires one of them.
---

## AUTH-006 — Authenticated User Can Still Open `/login`

Status: DEFERRED

Observed:

2026-08-28

Current state:

An already-authenticated user can manually navigate to:

`/login`

and the Talentry Sign In screen still renders.

Current impact:

This does not block the authenticated product flow.

Successful authentication still redirects to:

`/dashboard`

and `/dashboard` remains server-protected.

Decision:

Do not introduce a login-route guard, middleware migration, or broader auth redirect architecture opportunistically inside another stage.

Planned stage:

Auth route hardening / authenticated navigation cleanup

Future validation should determine the preferred permanent behavior for authenticated access to `/login`, such as redirecting to `/dashboard`, without creating redirect loops or weakening existing session behavior.

---

## AUTH-007 — Authentication Email Deliverability

Status: DEFERRED — PRODUCTION READINESS

Observed:

2026-08-28

Current state:

Talentry/Supabase authentication emails were received successfully during real Register / OTP acceptance testing, but they landed in the recipient's Junk/Spam folder.

Current impact:

Register, resend, OTP verification, authenticated redirect, and session persistence all passed. This is not a functional auth-flow failure.

Deferred review:

- sender identity and domain reputation
- SPF, DKIM, and DMARC alignment
- production SMTP/provider configuration
- email content and deliverability monitoring

Do not change SMTP, domain, sender, or provider configuration opportunistically during unrelated stages.
