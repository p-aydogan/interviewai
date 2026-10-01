# ADR-003: jsPDF for persisted interview PDF export

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

### Renderer and corrective-work history

1. Initial React-PDF implementation failed validation: empty ToUnicode mappings, fontkit sequential glyph/codepoint contamination and Turkish/German extraction corruption; inherited numeric line-height also broke long-report pagination.
2. Layout had a clean application-level candidate correction. Unicode had no acceptable maintainable correction; upstream issue/PR remained unresolved at that audit. React-PDF was rejected, not accepted retroactively.
3. fpdf2 was investigated and technically suitable, but production Python deployment was not established. Node-first remained preferred; Node-native alternatives were audited.
4. jsPDF 4.2.1 isolated spike passed Unicode, mappings, composite/base sequences, sequential documents and long pagination; repository migration followed.
5. A multipage contiguous-answer assertion was proven invalid because legitimate page footers interrupted extraction. Its replacement strengthened exact per-page footer and ordered semantic-body checks.
6. TypeScript API mismatch was corrected from direct getPageWidth/getPageHeight to doc.internal.pageSize.getWidth()/getHeight(), without changing pagination.
7. Full automated/build/post-build validation passed. PDF language source then changed from UI language to persisted interview.language; automated validation and browser re-acceptance passed.

## Historical implementation and validation record

The following earlier statuses, pending-browser statements and contracts describe their dated checkpoints. The final status and language contract above supersede them; historical diffs remain intact.

- Status: Architecture approved by user; implementation partial, validation blocked.
- Date: 2026-10-01
- Supersedes: ADR-002-interview-pdf-export.md (preserved as historical evidence).
- Related sprint: REPORT_EXPORT_01; corrective implementation REPORT_EXPORT_01_JSPDF_MIGRATION.

## Context
The initial React-PDF implementation was partial and unaccepted. Diagnosis established empty ToUnicode mappings associated with fontkit glyph caching, including Turkish dotless i and composite/base sequences. Visual glyph rendering did not establish searchable/copyable fidelity. Numeric inherited line-height also caused inflated spacing and unacceptable pagination; that layout issue was independently repairable, but no maintainable documented Unicode repair was established.

The accepted isolated jsPDF 4.2.1 spike rendered 16 PDFs in one Node process, including ten alternating glyph/long reports. Inter Regular/SemiBold preserved exact Turkish/German text and nonempty used-glyph mappings. Long fixtures produced five A4 pages with complete ordered content and visual acceptance. No patches, hidden text, cache warming or internal mutation were needed. This is historical spike evidence, not proof that repository integration has passed.

## Decision
Use exact jspdf 4.2.1 with Node direct-text APIs, local Inter 4.1 static Regular 400/SemiBold 600 fonts and per-document VFS registration. Cache only immutable font bytes. Own wrapping, vertical flow and footer reservation in application code. Keep Node-first Next.js deployment and the existing authenticated owner-scoped read as the security boundary. Render only allowlisted persisted report data with localized labels; never translate saved values. No Python production runtime, DOM, canvas, headless browser, schema change, new AI call, database write or PDF storage.

## Alternatives considered
React-PDF rejected after validation; fpdf2 remains out-of-scope Plan B because it adds runtime/deployment responsibilities. No additional renderer is introduced.

## Consequences and risks
Explicit pagination is maintained by this application. Local fonts and token CSS require deployment tracing. Actual deployed packaging/resources and browser download/search/copy remain acceptance gates. Current migration passed owner tests 8/8 and PDF tests 12/13, then stopped. The new sequential long-answer assertion failed; a footer interrupting a contiguous extraction search is suspected but unconfirmed. The ten-document integration sequence, TypeScript and production build are not accepted.

## Rollback approach
Do not reset or discard the pre-existing owner/API/UI work. Any rollback needs explicit authorization; returning to rejected React-PDF would not create an accepted production renderer. Preserve initial reports and this decision history.


## Approved follow-up completion — 2026-10-01

This dated update supersedes the earlier blocked status above while preserving its history. Current status: automated/build/static-PDF acceptance PASS; browser/deployed-runtime acceptance and user approval pending.

The multipage failure was confirmed as an invalid assertion: Page 1 / 6 interrupted the extracted answer between paragraphs 008 and 009. No semantic content was missing. The approved test fix verifies each exact trailing page footer, excludes only that verified line, and compares the complete Q&A line array exactly, including 140 full paragraph strings and subsequent content through ANSWER_11. Spaces, Unicode, order, duplicates and unexpected body text are checked; no renderer fix was required for that failure.

The subsequent TypeScript mismatch was corrected only at four sites in interview-report-flow.ts: doc.getPageWidth()/getPageHeight() became doc.internal.pageSize.getWidth()/getHeight(). These are typed read-only accessors; no internal mutation, casts, suppression, augmentation, hard-coded dimensions or pagination logic change was introduced.

Validation ran in order, all exit 0:
- PDF focused tests: 13/13 PASS.
- Owner-reader tests: 8/8 PASS.
- Recovery regression: 34/34 PASS.
- npx tsc --noEmit --incremental false: PASS.
- git diff --check: PASS (existing LF/CRLF notices only).
- Read-only Windows process check: no repository dev server found. Initial sandbox access denial was retried with permission; no server was started/stopped.
- npm run build: PASS, Next.js 14.2.5, static generation 22/22. Dynamic /api/interviews/[id]/pdf route included. No jsPDF-specific or font-bundling warnings. Two webpack cache snapshot warnings: Unable to snapshot resolve dependencies; build nevertheless completed successfully. npm upgrade notice ignored.
- PDF suite rerun after build with TEMP output enabled: 13/13 PASS. Uses final repository source renderer; not an authenticated deployed HTTP test.

Post-build output: TEMP/talentry-jspdf-final-acceptance contains report.pdf, report-tr.pdf, report-de.pdf, report-long.pdf, ten sequence PDFs, measurements.json and rendered QA images. Exact Turkish/German sample and both weights passed, used-CID ToUnicode mappings were nonempty, forward/reverse composite/base sequences and ten-document stability passed. All 140 paragraphs and terminal ANSWER_11 passed. Both long-report variants have six pages, with every footer verified. All six pages of each representative long variant were visually inspected (12 images): no overlap, clipping, off-page text, missing glyphs or footer collisions; margins/spacing stable. Natural Q&A continuation may cross a page boundary.

Build trace includes assets/fonts/Inter-Regular.ttf, Inter-SemiBold.ttf and styles/talentry-tokens.css (both path-separator variants appear in the Windows trace). Actual deployed filesystem/resource behavior still requires smoke acceptance.

Post-build sequential resource observations: glyph/short reports 1 page, 89,112 bytes, 92–139ms; long reports 6 pages, 94,223 bytes, 80–135ms. Sequence process RSS approximately 282MiB before first to 380MiB after final render, with intermediate decreases; whole test-process peak approximately 407MiB (417,140KiB). No failed render or obvious abrupt runaway behavior in this bounded sample. This does not establish sustained memory stability, production concurrency capacity or a leak-free process; no hard memory threshold imposed.

Remaining acceptance: current completed Result download; historical History -> Result download; open PDF and compare persisted score/summary/metadata/Q&A; Turkish/German search/copy; long pagination; repeated export; unauthorized/wrong-owner/malformed UUID/invalid-language requests; mobile Result panel; deployed packaging/resource smoke. No browser acceptance, Project Memory closure, Git stage/commit/push or dev-server restart performed. Request user acceptance before further work.


## Final persisted-language contract — 2026-10-01

Approved bounded behavior correction after user-reported browser acceptance: PDF label language is derived server-side from the authenticated owner-scoped record's interview.language. Current UI language controls browser button/status/error copy only. Persisted summary, Q&A, role/company and other saved values are never translated.

Final endpoint: GET /api/interviews/[id]/pdf. Legacy language query parameters are ignored completely, including duplicate/empty/unsupported values; they cannot override saved language. This supersedes the earlier client-selected query contract and its Invalid language 400 requirement. InterviewDetail.language is a string, so the route narrows against the existing SUPPORTED_APP_LANGUAGES list. Unsupported saved values fail with 500 {"error":"Failed to generate PDF"}, no attachment and no fallback translation. Authentication/read outcomes remain prior to language derivation; authorization logic is unchanged.

Changed code: app/api/interviews/[id]/pdf/route.ts; components/result/ResultPdfDownload.tsx; components/result/ResultContent.tsx; lib/reports/interview-report.test.cjs. Removed only export-language prop/request plumbing; ResultContent keeps uiLanguage for browser date formatting and copy remains localized. No renderer/font/pagination, owner-reader/detail/auth/recovery, dependency or config changes.

Validation in required order: PDF 14/14 PASS; owner-reader 8/8 PASS; recovery 34/34 PASS; npx tsc --noEmit --incremental false PASS; git diff --check PASS; read-only process check found no repository dev server; npm run build exit 0, Next.js 14.2.5 static generation 22/22 with dynamic PDF endpoint. Two webpack cache snapshot warnings persisted; no renderer-specific error or workaround. Existing LF/CRLF and npm upgrade notices only; no upgrades performed.

Post-build PDF suite: 14/14 PASS. TEMP/talentry-pdf-persisted-language/persisted-en.pdf, persisted-tr.pdf and persisted-de.pdf were generated through the real route with an owner-reader fixture and actual renderer. Labels match saved language despite conflicting queries; full saved fixture content and exact multilingual sample preserved; used-glyph ToUnicode mappings valid. Existing six-page long-report and ten alternating-render checks passed with complete ordered paragraphs/Q&A/footers. No pagination code changed. No live DB or browser acceptance is claimed by these fixture checks.

Manual re-acceptance remains pending: English historical record while UI is Turkish; Turkish record; German record if available; unchanged saved content; download/repeated export; unauthorized/wrong-owner boundaries. Unsupported historical language values intentionally fail safely. Deployed runtime/resources and actual browser behavior remain acceptance risks. Do not update Project Memory or close runtime acceptance yet. No Git mutation or dev-server restart.
