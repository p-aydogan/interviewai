# Sprint ROUTE_INPUT_HARDENING_01 Summary

- Title: Fail-closed Live route and shared input contract.
- Date recorded: 2026-10-07 (Europe/Istanbul).
- **IMPLEMENTATION + AUTOMATED VALIDATION + LOCAL BROWSER ACCEPTANCE: PASS**.
- Current stage: **UNCOMMITTED / pending final Git closure**; final documentation/pre-commit review required. No commit/push approval or future hash asserted.
- Branch: feature/auth-foundation. Safe committed base and local origin ref: 1ce03bae7a002b4b68e274e2dfbfb872300e9d3b (fix(interviews): make completion persistence idempotent).
- **COMPLETION_IDEMPOTENCY_01: complete / committed / pushed**; closure supplied by user and committed HEAD verified locally; no remote fetch.
- Next roadmap stage AFTER Git closure: **SECURITY_PRIVACY_01 — planned / NOT STARTED / NOT IMPLEMENTED / NOT YET AUTHORIZED**. No automatic next-stage authority.
- Goal: prevent unauthenticated/invalid Live entry and enforce canonical new write inputs while preserving the valid flow and historical reads.
- Approval status: implementation scope approved; user-supervised local browser acceptance PASS; final documentation/pre-commit review pending. No Git mutation authorized.

## Created files

- `lib/interviews/interview-setup-input.ts`
- `components/interview/LiveInterviewClient.tsx`
- `lib/interviews/interview-setup-input.test.cjs`
- `lib/interviews/interview-route-input.test.cjs`
- `components/interview/InterviewSetupForm.test.cjs`
- `docs/01_Engineering/Sprint_ROUTE_INPUT_HARDENING_01_Summary.md`
- `docs/01_Engineering/Sprint_ROUTE_INPUT_HARDENING_01_Engineering_Report.md`

## Modified files

- `app/interview/page.tsx`
- `components/interview/InterviewSetupForm.tsx`
- `components/interview/interview-setup-config.ts`
- `app/api/interviews/route.ts`
- `lib/interviews/interview-session-state.test.cjs`
- `lib/interviews/persist-owned-interview.test.cjs`
- `docs/04_Project_Memory/CURRENT_STATE.md`
- `docs/04_Project_Memory/STAGE_LOG.md`
- `docs/04_Project_Memory/DEFERRED_FIXES.md`
- `docs/04_Project_Memory/DECISIONS_AND_RISKS.md`

## Completed route/input decision

Server /interview order: existing trusted getAuthenticatedUser -> signed-out /login redirect -> parse decoded searchParams -> invalid/missing config /interview/setup redirect -> typed LiveInterviewClient. No middleware or auth redesign. Valid authenticated Setup and direct valid Live URLs remain usable without login detours.

The framework-independent, dependency-free interview-setup-input helper owns runtime sets and derived types: interviewer f/m; level junior/mid/senior; type behavioral/technical/mixed/case; persona friendly/formal/tough/curious; interview language tr/en/de. Membership uses exact array comparison, never truthy object lookup: unknown, wrong-case, constructor and __proto__ values are rejected.

Consumed query keys: iv, role, company, level, itype, persona, language. iv/level/itype/persona/language are required exactly once. role/company are optional at most once. Array representations of any consumed key are rejected, including same-value duplicates. cv and arbitrary unused extras remain ignored. Next-decoded values are validated without manual URL decoding.

Role/company remain optional. Raw decoded length is checked before trim: <=200 Unicode code points using Array.from, with C0 U+0000-U+001F and C1/DEL U+007F-U+009F rejected. Surrounding whitespace is trimmed; missing/empty/whitespace-only values become Genel. Ordinary Unicode, accents and emoji remain unchanged after trim. Setup uses the same helper and localized TR/EN/DE accessible validation feedback.

Live logic is extracted into components/interview/LiveInterviewClient.tsx with an InterviewSetupInput config prop, no URLSearchParams parsing and no required-config defaults. A deterministic key derived from all validated config fields prevents different configurations mixing old session state. Existing effects, provider/prompt/TTS, transition, completion and render behavior remain semantically preserved; typed mappings replace the former any interviewer lookup.

POST /api/interviews validates interviewerKey, level, interviewType, persona and language membership plus role/company canonical text. Incoming POST text must already be trimmed, nonempty, bounded and control-free; no server defaulting/normalization changes replay payload content. Invalid payload returns existing 400 Invalid interview payload before persistence. Existing answers/score/summary/duration/identity validation is preserved.

COMPLETION_IDEMPOTENCY_01 architecture is unchanged: auth first; server-derived owner; UUID v4 completionId; insert-first; 201 first insert; 200 matching replay; generic 409 conflict; no overwrite; owner-scoped replay; private/no-store. Reliability and response-loss retry regressions passed.

## Recorded automated validation — not rerun in this documentation turn

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

## User-supervised local browser acceptance — USER-VERIFIED PASS

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

## Accepted remaining boundaries / untouched foundations

Result/detail/delete/PDF IDs: **ALREADY HARDENED / OUT OF IMPLEMENTATION SCOPE**. Authentication precedes UUID validation/ownership work; malformed signed-in UUID -> 400; foreign/nonexistent -> same 404; reads/deletes are owner-scoped; PDF uses the protected reader. No source changes there. New write validation is not applied to historical reads; older unsupported persisted values remain readable, without migration/backfill. Existing historical unsupported-language PDF limitations are unchanged.

Direct provider endpoint auth/rate limiting, prompt injection/privacy/private-content logging, and provider resource/cost abuse controls remain SECURITY_PRIVACY_01. Page gating is not provider-endpoint security. Live UI/interview-language coupling remains LOCALIZATION_V1_01; session resume remains SESSION_RESUME_01; Media/device truthfulness and later provider/media work remain MEDIA_PROVIDER_V1_01. These are deferred boundaries, not regressions introduced here.

No migration, package/dependency/configuration/CSS changes; no History/Result/PDF/Profile/Auth implementation changes; no scoring redesign or answer/summary resource policy. No secrets or environment-variable values recorded. No Supabase mutation, browser rerun, tests/build rerun, staging, commit or push in this documentation turn.

## Documentation validation

Documentation-only git diff --check: PASS, exit 0; final scope/content/full-diff review completed. Exactly 17 approved files (11 implementation/test plus 6 documentation). Stop for final pre-commit review; do not begin SECURITY_PRIVACY_01 automatically.
