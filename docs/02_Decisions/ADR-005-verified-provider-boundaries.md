# ADR-005 — Verified provider API boundaries

- Status: Frozen decisions explicitly approved by user; implementation awaiting acceptance.
- Date: 2026-10-20 (Europe/Istanbul).
- Related sprint: SECURITY_PRIVACY_01_PHASE_2.

## Context

The approved Phase 1 audit identified provider routes without verified identity and public arbitrary Claude prompts. APP API access requires a verified bearer path while WEB cookie authentication and frozen completion ownership remain supported.

## Decision

Retain Supabase cookie `auth.getUser()` and add explicit bearer `auth.getUser(jwt)` through the same trust boundary. Invalid explicit bearer fails closed even with a valid cookie; two valid different users fail closed; same verified user is accepted. Caller owner IDs are never authority.

Claude accepts only validated question/feedback/evaluation operations with structured data; instructions, model and token budget are server-owned. Maximum provider request is 32 KiB; answers are limited to 4,000 Unicode code points, prior questions and Q&A to five. Question text is bounded to 2,000 code points. Canonical setup validators remain authoritative. Zero-answer client completion performs no evaluation/save; partial submitted Q&A remain supported.

ElevenLabs accepts only the current app's two voices and up to 2,000 text code points. Claude timeout/consumed-response cap: 30 seconds/256 KiB. ElevenLabs: 20 seconds/5 MiB. Validate upstream status and payload; no automatic paid retries. Return stable sanitized errors and remove private/raw provider logging. HeyGen token route remains disabled with deterministic 503 and zero upstream requests; retain packages.

Shared provider admission allows four concurrent operations per process, one per verified user; excess returns 429. Release is idempotent and occurs after success, failure and timeout. This is not durable/distributed protection or time-window rate limiting.

## Alternatives considered

The stage follows the user's frozen decisions. No alternative architecture, dependency, external limiter, schema or vendor was selected during implementation.

## Consequences and risks

Explicit native bearer API requests can be verified without replacing WEB cookies. Other existing cookie-only consumers are retained. Local guards reset on process restart and multiply across instances; durable quotas remain mandatory before production launch. Prompt isolation does not establish model immunity to prompt injection. Basic MP3 signature checking is not full decoding. Abort stops local consumption but cannot undo upstream work already billed. Browser and live-provider/runtime acceptance remain open.

## Rollback approach

Any rollback requires explicit authorization. Preserve current uncommitted work and immutable reports. Do not silently restore unauthenticated provider access, enable HeyGen or weaken conflict handling. Stage review/Git closure remains separate.

## Evidence

[Summary](../01_Engineering/Sprint_SECURITY_PRIVACY_01_PHASE_2_Summary.md) and [Engineering Report](../01_Engineering/Sprint_SECURITY_PRIVACY_01_PHASE_2_Engineering_Report.md).


## Acceptance reconciliation — 2026-10-20

The user accepted FUNCTIONAL WEB BROWSER ACCEPTANCE: PASS following normal WEB login/Dashboard, interview/Q1/TTS, one answer/feedback and Q2 without duplicates; console 0 warnings/errors. Implementation and recorded 69/69 focused tests, 455/455 regressions, TypeScript and build PASS are approvable for Git closure, which remains unauthorized/unperformed.

MANUAL DEVTOOLS NETWORK/PRIVACY INSPECTION: NOT AVAILABLE / NOT VERIFIED because usable Network history was not exposed. This accepted evidence limitation is not an implementation defect; no claim of manually absent bearer headers, raw provider bodies, HeyGen requests or persistence POSTs is made. User did not intentionally complete/save; no save action was initiated; no completion/save or live HeyGen acceptance. No Supabase mutation by test automation. HeyGen zero-upstream and privacy sentinels remain deterministic evidence, not manual Network proof. No further live calls recreated history.

The explicitly approved acceptance server shutdown was performed only on tracked session 94239; no port-3000 listener remained. The frozen decisions above are unchanged. Process-local 4-total/1-user admission is not durable distributed rate/quota protection; that production-launch gate remains OPEN. See the [Reconciliation Report](../01_Engineering/Sprint_SECURITY_PRIVACY_01_ACCEPTANCE_RECONCILIATION_Engineering_Report.md) for the current acceptance classification; prior report-time pending statements remain historical.
