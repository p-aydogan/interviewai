# Sprint REPORT_EXPORT_01 Summary

## Final status — REPORT_EXPORT_01 — 2026-10-01

**IMPLEMENTATION + AUTOMATED VALIDATION + LOCAL BROWSER ACCEPTANCE: PASS**

**DEPLOYED RUNTIME SMOKE ACCEPTANCE: PENDING**

At this documentation/pre-commit checkpoint, HEAD and origin/feature/auth-foundation were b08f446 on feature/auth-foundation, and REPORT_EXPORT_01 work was uncommitted. No future commit hash is asserted. Local runtime acceptance is user-verified in Chrome normal profile; it was not rerun during this documentation-only closure. The user reported the dev server manually stopped.

Final renderer: exact jsPDF 4.2.1; React-PDF rejected. Node-first / managed Next.js, owner-authorized Node PDF route, shared owner-reader security boundary, persisted-data-only direct-text report, application-owned pagination and local static Inter Regular/SemiBold fonts. Auth/recovery architecture and DB/schema remain unchanged. Export makes no AI/provider call, stores no PDF, offers no public sharing, and introduces no Python production runtime, DOM or headless browser.

Final endpoint: GET /api/interviews/[id]/pdf. PDF label language is derived server-side from persisted interview.language AFTER the authenticated owner-scoped read (en -> English, tr -> Turkish, de -> German). UI language controls browser button/loading/status/error copy only. Summary, questions, answers, role, company and other saved free text are never translated. Legacy language query parameters are ignored and cannot override saved language; unsupported persisted language fails through the generic PDF-generation error path. The previous client-selected language query contract is superseded.

Recorded final validation: PDF 14/14 PASS; owner-reader 8/8 PASS; recovery 34/34 PASS; TypeScript PASS; git diff --check PASS; production build PASS with static generation 22/22; post-build PDF tests 14/14 PASS. Exact Turkish/German Unicode, nonempty used-glyph ToUnicode mappings, composite/base sequences, ten alternating reports, exact LONG_QUESTION, 140 ordered paragraphs, content through ANSWER_11, six-page long reports and all footers passed. Recorded visual inspection found no overlap, clipping, off-page text, missing glyphs or footer collision.

Representative local observations from the accepted post-build run: approximately 94 KB long PDF, 80–135 ms rendering, RSS around 380 MiB and whole-process peak around 407 MiB. These are local observations only, not production concurrency capacity or proof of memory-leak absence.

Deployed packaging/resource smoke remains a deployment acceptance / operational follow-up, not a local functional blocker. Host font/jsPDF packaging, production render duration, sustained/concurrent memory, response-size/resource limits and long reports under host limits have not been verified. Full production closure is not claimed. Concurrency/resource profiling is deferred only if future usage scale requires it.

### User-verified local Chrome acceptance — PASS

- Historical Result: interview 19c2c248-b4b7-4b99-b9c2-ce0ef316b39e downloaded and opened in Chrome; score 12 / 100, role/company Genel / Genel, saved assessment and Q&A correct.
- English saved interview while UI remained Turkish: English PDF labels and unchanged English content. User-reported labels included Interview Report, Score, Performance Assessment, Interview Details, Questions and Answers, Question, Answer and Page. These are user-supplied acceptance observations, not a fresh source-copy assertion.
- Query override attempt: the same interview's /pdf?language=tr still produced English labels from persisted en.
- Turkish saved interview: Turkish labels verified (Mülakat Raporu, Puan, Performans değerlendirmesi, Görüşme bilgileri, Sorular ve cevaplar, Soru, Cevap, Sayfa).
- Unicode visual/search: saved answer "ı don't panik everything gonna be ok" displayed dotless ı correctly; Chrome Ctrl+F found "ı don't panik".
- Repeated historical export succeeded without stuck loading or a remaining request lock.
- /api/interviews/not-a-valid-id/pdf returned {"error":"Invalid interview id"}.
- /api/interviews/00000000-0000-4000-8000-000000000000/pdf returned {"error":"Interview not found"}.
- Signed-out: after completed logout and visibly reaching login, the historical PDF endpoint returned {"error":"Unauthorized"} (401); no download.
- Earlier attempted unauthorized check was INVALID: logout had not completed, PDF/detail data and Dashboard still worked. This is not recorded as an authorization failure.
- Wrong owner: a second authenticated account received {"error":"Interview not found"} (404), with no download; indistinguishable from nonexistent record.
- Mobile Chrome 400 × 690: action reachable with a small downward scroll, no horizontal overflow or overlapping controls, Result remained usable. Download and repeated export passed.

German labels/Unicode have automated fixture evidence; no additional live German-record acceptance is invented. Deployed runtime acceptance remains pending.

Historical rejection/correction details are preserved below and in the companion Engineering Report.

## Historical implementation and validation record

The following earlier statuses, pending-browser statements and contracts describe their dated checkpoints. The final status and language contract above supersede them; historical diffs remain intact.

- Title: Persisted interview PDF export
- Date: 2026-10-01
- Branch: feature/auth-foundation
- Starting HEAD and origin/feature/auth-foundation: b08f446; working tree initially clean.
- Status: PARTIAL IMPLEMENTATION - STOPPED after PDF validation failure. Not accepted or ready to commit.
- Goal: One owner-authorized Result-page PDF download using persisted interview data.
- Modified files: package.json; package-lock.json; next.config.js; app/api/interviews/[id]/route.ts; components/result/ResultContent.tsx; components/result/result-copy.ts; app/result/result.module.css.
- Created files: lib/interviews/read-owned-interview.ts; lib/interviews/read-owned-interview.test.cjs; app/api/interviews/[id]/pdf/route.ts; lib/reports/interview-report-document.tsx; lib/reports/interview-report-styles.ts; lib/reports/render-interview-report.ts; lib/reports/interview-report.test.cjs; components/result/ResultPdfDownload.tsx; assets/fonts/Inter-Regular.ttf; assets/fonts/Inter-SemiBold.ttf; assets/fonts/LICENSE.txt; docs/02_Decisions/ADR-002-interview-pdf-export.md; this Summary; Sprint_REPORT_EXPORT_01_Engineering_Report.md.
- Dependency: exact @react-pdf/renderer 4.4.1; 63 new lockfile package entries; no changes to existing entries. No other direct dependency added.
- Fonts: official Inter 4.1 release, static Regular/SemiBold and original LICENSE.txt, non-empty. SIL OFL 1.1.
- Validation: owner-reader 8 passed/0 failed; PDF 9 passed/2 failed (11 total). PDF failures concern extracted Turkish/German content and long-report content/order. No changes or later validation after failure; reports only.
- Not run: recovery regression, TypeScript, git diff --check, production build. Page count: unavailable. No browser acceptance or dev server started.
- Warnings/problems: initial npm-cache permission and font HTTPS transport failures resolved through approved escalation; npm pending install-script notice for existing core-js@3.49.0 (not approved/run); Git LF-to-CRLF warnings. Visual correctness, deployed packaging, resource limits and UI runtime remain unverified.
- Approval status: Architecture/implementation scope approved; implementation acceptance NOT approved. Explicit approval required to diagnose and fix the failed PDF checks. No stage/commit/push performed.

The approved server/client/template code is present but is not reported as complete or production-ready. Details, exact validation output and full changes are in the accompanying Engineering Report. Project Memory closure files remain untouched.
