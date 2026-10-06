# Sprint COMPLETION_IDEMPOTENCY_01 Summary

- Title: Stable completion persistence identity and owner-scoped replay recovery.
- Date: 2026-10-06 (Europe/Istanbul).
- Branch: feature/auth-foundation.
- Safe committed base: `229faf678c22f2ed89497fc3a97ae3b477eafba5`.
- Status: IMPLEMENTATION + AUTOMATED VALIDATION + LOCAL FIRST-SAVE BROWSER ACCEPTANCE: PASS; UNCOMMITTED / pending final Git closure.
- Goal: prevent a second persisted interview when an earlier save committed but its response was lost/unusable.
- Approval status: user-provided first-save browser acceptance PASS; documentation/final pre-commit review pending. No commit/push approval claimed.

## Created files

- `lib/interviews/interview-completion-state.ts`
- `lib/interviews/interview-completion-state.test.cjs`
- `lib/interviews/persist-owned-interview.ts`
- `lib/interviews/persist-owned-interview.test.cjs`
- `docs/01_Engineering/Sprint_COMPLETION_IDEMPOTENCY_01_Summary.md`
- `docs/01_Engineering/Sprint_COMPLETION_IDEMPOTENCY_01_Engineering_Report.md`

## Modified files

- `app/api/interviews/route.ts`
- `app/interview/page.tsx`
- `lib/interviews/interview-session-state.test.cjs`
- `docs/04_Project_Memory/CURRENT_STATE.md`
- `docs/04_Project_Memory/STAGE_LOG.md`
- `docs/04_Project_Memory/DEFERRED_FIXES.md`
- `docs/04_Project_Memory/DECISIONS_AND_RISKS.md`

## Completed behavior and evidence

Browser-native UUID v4 completionId is stable for one nonempty intent and stored as existing interview ID. Evaluation output, metadata, submitted answers and duration freeze once. Save retry reuses that payload without reevaluation; returned ID must match. Server inserts first and uses the existing primary key, with owner-scoped recovery only for recognized interviews_pkey/23505 conflict. Matching replay returns original ID; conflicting/foreign unavailable identity returns generic 409 without overwrite/disclosure. No migration/dependency.

Primary deterministic proof: first route/helper request commits X/P in a stateful double; client observes response loss; explicit retry sends X/P again, retains duration and one evaluation, recovers X with one logical row, and navigates to /result/X.

User-verified ordinary browser completion: POST 201 / replayed false; request completionId, response id and Result URL ID all identical. Actual UUID omitted. No deliberate live replay/response-loss test. Concurrency, conflict, foreign collision and retry invariants remain automated evidence; actual PostgreSQL concurrency integration not run.

## Validation results

Recorded, not rerun here: completion-state 14/14; persistence/helper/route 31/31; session/page 55/55; relevant regressions 96/96, all exit 0. TypeScript and implementation whitespace PASS. Production build exit 0, 22/22 pages. Two webpack cache snapshot warnings, npm update notice, and informational LF-to-CRLF notice; no product regression established. Documentation validation: git diff --check PASS, exit 0; full scope/diff inspected. No tests/build/browser rerun.

## Risks and qualifications

In-memory only; refresh/tab close recovery deferred to SESSION_RESUME_01. Hard deletion removes replay evidence; indefinite protection needs separate tombstone/retention decision. Actual PostgreSQL concurrency integration and deployed-schema parity unverified. Provider security/privacy and scoring trust remain later work. Changed live answers do not replace a failed save's original frozen intent.

HISTORY_PAGINATION_01 remains NATURAL-RECORD DEFERRED ACCEPTANCE. Historical verified baseline 11 on 2026-10-06; reliability acceptance added one natural persisted interview and this stage added one further natural interview. History not recounted; no current verified total. No synthetic seeding.

Next after Git closure: ROUTE_INPUT_HARDENING_01, planned / NOT STARTED / NOT IMPLEMENTED / NOT YET AUTHORIZED. Stop for final review; no staging/commit/push authority.
