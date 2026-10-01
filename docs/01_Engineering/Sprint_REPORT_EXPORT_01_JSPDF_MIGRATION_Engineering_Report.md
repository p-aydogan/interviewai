# Sprint REPORT_EXPORT_01_JSPDF_MIGRATION Engineering Report

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

## 1. Report identity
2026-10-01. Partial corrective implementation of REPORT_EXPORT_01. Architecture approved, implementation awaiting acceptance. This new immutable report preserves the earlier reports without rewriting the rejected renderer's history.

## 2. Objective and boundaries
Replace React-PDF with exact jsPDF 4.2.1 through documented Node direct-text APIs. Preserve owner authorization, route contracts, UI, localized labels, persisted model, fonts and filename validation. No Python production runtime, schema changes, provider calls, database writes, browser acceptance, Git mutations or Project Memory closure.

## 3. Repository before implementation
C:\Users\p-ayd\interviewai; feature/auth-foundation; HEAD = origin/feature/auth-foundation = b08f446. Existing uncommitted REPORT_EXPORT_01 files matched the expected state. Initial tracked diff: 7 files, 645 insertions, 141 deletions; untracked implementation files also existed. All 191 nonignored tracked/untracked files were snapshotted by path, content and SHA-256 in TEMP/talentry-jspdf-migration/before.json before edits.

## 4. Architecture and evidence stages
A. Initial React-PDF attempt: owner tests 8/8, PDF tests 9/11; partial/unaccepted.
B. Historical diagnosis: empty ToUnicode mappings/fontkit composite-cache behavior corrupted searchable/copyable Unicode. Inherited numeric line-height inflated layout. React-PDF rejected; do not reinterpret historical results as successful.
C. Isolated jsPDF spike: 16 same-process PDFs, exact glyph/mapping checks and ten alternating reports passed. Long report five A4 pages, 94,338 bytes, visual acceptance; approximately 47–58ms, peak process RSS approximately 313MiB for the sequence.
D. Current integration: direct-text builder, token-derived layout, explicit per-line wrapping/page flow and second-pass footers implemented. Owner tests pass, PDF suite has one failure. Integration is NOT accepted. No production build or post-build artifacts have been validated.

## 5–6. Files and responsibilities
Modified package.json/package-lock.json: replace direct @react-pdf/renderer with exact jspdf 4.2.1. npm added 19, removed 62 packages. Common lockfile entries retain identical versions and integrity hashes; React/Next unchanged. Optional browser helper dependencies are in jsPDF's dependency tree, not used by the renderer.
Modified render-interview-report.ts: public Node adapter, UUID/date/numeric validation, runtime language guard, immutable font-byte caching, per-document VFS registration and Buffer output.
Modified interview-report-styles.ts: token-derived points, palette, dimensions and explicit line-height multiplier.
Removed interview-report-document.tsx; created interview-report-document.ts: allowlisted persisted report content, localized labels, no JSX.
Created interview-report-flow.ts: width wrapping, current Y, page threshold, footer reserve, heading/label presence and second-pass numbering.
Modified interview-report.test.cjs: retain contract/content checks, replace fontkit coverage with actual encoded font output, add mapping checks, ten-report diagnostic and invalid-input tests.
Created inspect-report-pdf.py: diagnostic pypdf extraction and used-CID/ToUnicode checks only; not imported by production.
Created ADR-003: superseding renderer decision and partial integration status.
Created new Summary and this Engineering Report; previous reports and ADR-002 unchanged.

## 7. Interfaces
renderInterviewReport(InterviewDetail, AppLanguage): Promise<Buffer> and reportFilename remain public and compatible. Internal buildInterviewReport(jsPDF, InterviewDetail, AppLanguage) composes reportFlow and reportStyles. PDF endpoint remains GET /api/interviews/[id]/pdf?language=tr|en|de, nodejs, force-dynamic. Focused route tests passed success headers/filename, language handling, generic errors and auth/read outcomes. Owner tests passed actual shared-reader owner filters and wrong-owner/nonexistent equivalence.

## 8–9. Accessibility and design
Result UI and accessibility behavior unchanged. PDFs contain real searchable text, exact multilingual sample checks passed in both weights, and used-CID mappings passed for inspected generated outputs. Tagged-PDF/PDF-UA compliance is not claimed. Approved CSS tokens supply typography, spacing and colors; no second palette. Inter Regular 400/SemiBold 600 and LICENSE unchanged. Persisted values are not translated. Existing font/token tracing remains unchanged and has NOT yet been verified by a production build.

## 10. Validation and exact stop
1. node --test lib/interviews/read-owned-interview.test.cjs: exit 0; 8 tests PASS.
2. REPORT_PDF_PYTHON set to existing bundled diagnostic Python; node --test lib/reports/interview-report.test.cjs: exit 1; 13 tests, 12 PASS, 1 FAIL; duration 4663.9632ms.
Failure: ten alternating reports preserve Unicode, sequences, full long content and input. AssertionError: Sequential long content complete and ordered, lib/reports/interview-report.test.cjs:214:18. It failed on the first long report in the alternating sequence. The assertion seeks an entire multi-page answer contiguously after whitespace normalization; page footer text may interrupt it. This is an unconfirmed test-defect hypothesis, not a diagnosis or permission to weaken coverage. No correction/retest performed.
Passing checks: actual PDF signature/EOF and persisted content, both font weights exact Unicode, Turkish/German labels vs values, independent long fixture ordered paragraph content and footers, historical fallbacks, repeated input preservation/no network, filename, route success, invalid language, auth/read statuses, generic generation errors and invalid persisted numbers. Separate long test asserts at least four pages; exact page count was not recorded before stop.
3. Recovery regression: NOT RUN.
4. npx tsc --noEmit --incremental false: NOT RUN.
5. git diff --check: NOT RUN.
6. Dev-server check: NOT RUN.
7. npm run build: NOT RUN; generated application page count unknown.
8. Post-build artifacts/extraction/visual inspection: NOT RUN.
Resource diagnostic aborted before final measurements were emitted; no integrated resource claim is made.
The Node test runner completed the already-started suite; no further validation command was run after its failure.

## 11. Warnings and tooling
Initial TEMP lockfile resolution failed EPERM on npm cache. A permission-requested retry succeeded; repository files were not modified by that failure. A read-only PowerShell JSON comparison required -AsHashtable because npm lockfiles have an empty-string key; corrected comparison succeeded. An apply_patch request was rejected before writing for duplicate target operations; subsequent scoped edits succeeded. npm notice offered 11.16.0 -> 12.2.0; no npm upgrade performed. Git emitted existing LF-to-CRLF working-copy warnings. No force/legacy-peer-deps/native setup/framework changes.

## 12. Complete migration diffs
Diffs below compare the pre-migration uncommitted content snapshot with current files, rather than hiding that work behind HEAD. New documentation files are recorded in full through their own contents; this Engineering Report excludes its own recursive diff. Git status and tracked diff stat follow the code/ADR/Summary diffs.

## 13–15. Risks, untouched modules and approval
Sequential integration fidelity remains unaccepted until the failed assertion is diagnosed without weakening content checks. No complete resource sequence, TypeScript/build/deployed tracing or visual acceptance exists for this integration. Broader scripts/emoji and arbitrary report sizes were not certified. Compare snapshot hashes: owner reader/tests, detail and PDF routes, Result UI/copy/CSS, font files/license, token CSS, next.config.js, ADR-002 and initial reports are unchanged. No secrets or environment values were read/displayed.
Next action requires user authorization to diagnose the stopped validation, correct only a confirmed defect and resume the required ordered gates. Do not automatically start acceptance or commit.
Manual acceptance prepared, NOT executed: current Result download; historical History -> Result download; open PDF; verify saved score/summary/metadata/Q&A; Turkish/German search/copy; long pagination; repeated export; unauthenticated request; wrong-owner UUID; malformed UUID; invalid language; mobile Result panel; deployed packaging/resource smoke. Implementation approval remains pending.

### package.json

```diff
--- before/package.json
+++ after/package.json
@@ -1,26 +1,26 @@
-{

-  "name": "interviewai",

-  "version": "1.0.0",

-  "private": true,

-  "scripts": {

-    "dev": "next dev",

-    "build": "next build",

-    "start": "next start"

-  },

-  "dependencies": {

-    "@heygen/liveavatar-web-sdk": "^0.0.18",

-    "@heygen/streaming-avatar": "^1.0.11",

-    "@react-pdf/renderer": "4.4.1",

-    "@supabase/ssr": "^0.12.3",

-    "@supabase/supabase-js": "^2.108.2",

-    "next": "^14.2.5",

-    "react": "^18",

-    "react-dom": "^18"

-  },

-  "devDependencies": {

-    "@types/node": "^20",

-    "@types/react": "^18",

-    "@types/react-dom": "^18",

-    "typescript": "^5"

-  }

-}

+{
+  "name": "interviewai",
+  "version": "1.0.0",
+  "private": true,
+  "scripts": {
+    "dev": "next dev",
+    "build": "next build",
+    "start": "next start"
+  },
+  "dependencies": {
+    "@heygen/liveavatar-web-sdk": "^0.0.18",
+    "@heygen/streaming-avatar": "^1.0.11",
+    "@supabase/ssr": "^0.12.3",
+    "@supabase/supabase-js": "^2.108.2",
+    "jspdf": "4.2.1",
+    "next": "^14.2.5",
+    "react": "^18",
+    "react-dom": "^18"
+  },
+  "devDependencies": {
+    "@types/node": "^20",
+    "@types/react": "^18",
+    "@types/react-dom": "^18",
+    "typescript": "^5"
+  }
+}
```

### package-lock.json

```diff
--- before/package-lock.json
+++ after/package-lock.json
@@ -1,3783 +1,3390 @@
-{

-  "name": "interviewai",

-  "version": "1.0.0",

-  "lockfileVersion": 3,

-  "requires": true,

-  "packages": {

-    "": {

-      "name": "interviewai",

-      "version": "1.0.0",

-      "dependencies": {

-        "@heygen/liveavatar-web-sdk": "^0.0.18",

-        "@heygen/streaming-avatar": "^1.0.11",

-        "@react-pdf/renderer": "4.4.1",

-        "@supabase/ssr": "^0.12.3",

-        "@supabase/supabase-js": "^2.108.2",

-        "next": "^14.2.5",

-        "react": "^18",

-        "react-dom": "^18"

-      },

-      "devDependencies": {

-        "@types/node": "^20",

-        "@types/react": "^18",

-        "@types/react-dom": "^18",

-        "typescript": "^5"

-      }

-    },

-    "node_modules/@babel/code-frame": {

-      "version": "7.29.7",

-      "resolved": "https://registry.npmjs.org/@babel/code-frame/-/code-frame-7.29.7.tgz",

-      "integrity": "sha512-Aup7aUOfpbAUg2ROOJN6Iw5f9DMBlzu0mIkm/malLQFN/YQgO48wCj0Kxa3sEHJvPVFg7siR+qRInwXd2qhQKw==",

-      "license": "MIT",

-      "dependencies": {

-        "@babel/helper-validator-identifier": "^7.29.7",

-        "js-tokens": "^4.0.0",

-        "picocolors": "^1.1.1"

-      },

-      "engines": {

-        "node": ">=6.9.0"

-      }

-    },

-    "node_modules/@babel/helper-validator-identifier": {

-      "version": "7.29.7",

-      "resolved": "https://registry.npmjs.org/@babel/helper-validator-identifier/-/helper-validator-identifier-7.29.7.tgz",

-      "integrity": "sha512-qehxGkRj55h/ff8EMaJ+cYhyaKlHIxqYDn682wQD7RNp9UujOQsHog2uS0r2vzr4pW+sXf90NeeayjcNaX3fFg==",

-      "license": "MIT",

-      "engines": {

-        "node": ">=6.9.0"

-      }

-    },

-    "node_modules/@babel/runtime": {

-      "version": "7.29.7",

-      "resolved": "https://registry.npmjs.org/@babel/runtime/-/runtime-7.29.7.tgz",

-      "integrity": "sha512-Nq8OhGWiZIZGV6hLHoyAKLLcJihP/xFeBMGJoUrxTX2psI8dCifzLhZISFb+VWS3wFMRDmCGw5R+dOySCqPLhw==",

-      "license": "MIT",

-      "engines": {

-        "node": ">=6.9.0"

-      }

-    },

-    "node_modules/@bufbuild/protobuf": {

-      "version": "1.10.1",

-      "resolved": "https://registry.npmjs.org/@bufbuild/protobuf/-/protobuf-1.10.1.tgz",

-      "integrity": "sha512-wJ8ReQbHxsAfXhrf9ixl0aYbZorRuOWpBNzm8pL8ftmSxQx/wnJD5Eg861NwJU/czy2VXFIebCeZnZrI9rktIQ==",

-      "license": "(Apache-2.0 AND BSD-3-Clause)"

-    },

-    "node_modules/@exodus/schemasafe": {

-      "version": "1.3.0",

-      "resolved": "https://registry.npmjs.org/@exodus/schemasafe/-/schemasafe-1.3.0.tgz",

-      "integrity": "sha512-5Aap/GaRupgNx/feGBwLLTVv8OQFfv3pq2lPRzPg9R+IOBnDgghTGW7l7EuVXOvg5cc/xSAlRW8rBrjIC3Nvqw==",

-      "license": "MIT"

-    },

-    "node_modules/@heygen/liveavatar-web-sdk": {

-      "version": "0.0.18",

-      "resolved": "https://registry.npmjs.org/@heygen/liveavatar-web-sdk/-/liveavatar-web-sdk-0.0.18.tgz",

-      "integrity": "sha512-5acXQbqYLc7GXymutTXSrp4KSrk2/NRCf8UIU7JVuO76O8InVOM3YpwhdZBmTWuB+6Mght/vg07ljKZM2D1FcQ==",

-      "license": "MIT",

-      "dependencies": {

-        "events": "3.3.0",

-        "livekit-client": "2.15.7",

-        "typed-emitter": "2.1.0",

-        "webrtc-issue-detector": "1.16.3"

-      }

-    },

-    "node_modules/@heygen/streaming-avatar": {

-      "version": "1.0.16",

-      "resolved": "https://registry.npmjs.org/@heygen/streaming-avatar/-/streaming-avatar-1.0.16.tgz",

-      "integrity": "sha512-ucJdE2iYTALKRglB/2ztWEp9nu5ygBf/pZlf8kfxGXFKG+W98LPtdTB+v66rXRuPG+vuRFf6XYuxnloiKgPAzA==",

-      "deprecated": "Deprecated. Migrate to @heygen/liveavatar-web-sdk — run: npm i @heygen/liveavatar-web-sdk",

-      "license": "MIT",

-      "dependencies": {

-        "a-sync-waterfall": "^1.0.1",

-        "ajv": "^6.12.6",

-        "ansi-regex": "^3.0.1",

-        "ansi-styles": "^3.2.1",

-        "asap": "^2.0.6",

-        "asn1": "^0.2.6",

-        "assert-plus": "^1.0.0",

-        "asynckit": "^0.4.0",

-        "aws-sign2": "^0.7.0",

-        "aws4": "^1.13.0",

-        "bcrypt-pbkdf": "^1.0.2",

-        "better-ajv-errors": "^0.6.7",

-        "call-me-maybe": "^1.0.2",

-        "camelcase": "^5.3.1",

-        "caseless": "^0.12.0",

-        "chalk": "^2.4.2",

-        "cliui": "^4.1.0",

-        "co": "^4.6.0",

-        "code-error-fragment": "^0.0.230",

-        "code-point-at": "^1.1.0",

-        "color-convert": "^1.9.3",

-        "color-name": "^1.1.3",

-        "colorful": "^2.1.0",

-        "combined-stream": "^1.0.8",

-        "commander": "^2.20.3",

-        "core-js": "^3.37.1",

-        "core-util-is": "^1.0.2",

-        "cross-spawn": "^6.0.5",

-        "dashdash": "^1.14.1",

-        "debug": "^4.3.5",

-        "decamelize": "^1.2.0",

-        "delayed-stream": "^1.0.0",

-        "ecc-jsbn": "^0.1.2",

-        "emoji-regex": "^8.0.0",

-        "end-of-stream": "^1.4.4",

-        "es6-promise": "^3.3.1",

-        "escalade": "^3.1.2",

-        "escape-string-regexp": "^1.0.5",

-        "execa": "^1.0.0",

-        "extend": "^3.0.2",

-        "extsprintf": "^1.3.0",

-        "fast-deep-equal": "^3.1.3",

-        "fast-json-stable-stringify": "^2.1.0",

-        "fast-safe-stringify": "^2.1.1",

-        "find-up": "^3.0.0",

-        "forever-agent": "^0.6.1",

-        "form-data": "^2.5.1",

-        "get-caller-file": "^1.0.3",

-        "get-stream": "^4.1.0",

-        "getpass": "^0.1.7",

-        "grapheme-splitter": "^1.0.4",

-        "har-schema": "^2.0.0",

-        "har-validator": "^5.1.5",

-        "has-flag": "^3.0.0",

-        "http-signature": "^1.2.0",

-        "http2-client": "^1.3.5",

-        "invert-kv": "^2.0.0",

-        "is-fullwidth-code-point": "^2.0.0",

-        "is-stream": "^1.1.0",

-        "is-typedarray": "^1.0.0",

-        "isexe": "^2.0.0",

-        "isstream": "^0.1.2",

-        "js-tokens": "^4.0.0",

-        "jsbn": "^0.1.1",

-        "json-schema": "^0.4.0",

-        "json-schema-traverse": "^0.4.1",

-        "json-stringify-safe": "^5.0.1",

-        "json-to-ast": "^2.1.0",

-        "jsonpointer": "^4.1.0",

-        "jsprim": "^1.4.2",

-        "lcid": "^2.0.0",

-        "leven": "^3.1.0",

-        "locate-path": "^3.0.0",

-        "map-age-cleaner": "^0.1.3",

-        "mem": "^4.3.0",

-        "mime-db": "^1.52.0",

-        "mime-types": "^2.1.35",

-        "mimic-fn": "^2.1.0",

-        "ms": "^2.1.2",

-        "nice-try": "^1.0.5",

-        "node-fetch-h2": "^2.3.0",

-        "node-readfiles": "^0.2.0",

-        "npm-run-path": "^2.0.2",

-        "number-is-nan": "^1.0.1",

-        "nunjucks": "^3.2.4",

-        "oas-kit-common": "^1.0.8",

-        "oas-linter": "^3.2.2",

-        "oas-resolver": "^2.5.6",

-        "oas-schema-walker": "^1.1.5",

-        "oas-validator": "^3.4.0",

-        "oauth-sign": "^0.9.0",

-        "once": "^1.4.0",

-        "openapi-generator": "^0.1.39",

-        "openapi3-ts": "^1.4.0",

-        "os-locale": "^3.1.0",

-        "p-defer": "^1.0.0",

-        "p-finally": "^1.0.0",

-        "p-is-promise": "^2.1.0",

-        "p-limit": "^2.3.0",

-        "p-locate": "^3.0.0",

-        "p-try": "^2.2.0",

-        "path-exists": "^3.0.0",

-        "path-key": "^2.0.1",

-        "performance-now": "^2.1.0",

-        "picocolors": "^1.0.1",

-        "psl": "^1.9.0",

-        "pump": "^3.0.0",

-        "punycode": "^2.3.1",

-        "qs": "^6.5.3",

-        "reftools": "^1.1.9",

-        "regenerator-runtime": "^0.14.1",

-        "request": "^2.88.2",

-        "require-directory": "^2.1.1",

-        "require-main-filename": "^1.0.1",

-        "safe-buffer": "^5.2.1",

-        "safer-buffer": "^2.1.2",

-        "semver": "^5.7.2",

-        "set-blocking": "^2.0.0",

-        "shebang-command": "^1.2.0",

-        "shebang-regex": "^1.0.0",

-        "should": "^13.2.3",

-        "should-equal": "^2.0.0",

-        "should-format": "^3.0.3",

-        "should-type": "^1.4.0",

-        "should-type-adaptors": "^1.1.0",

-        "should-util": "^1.0.1",

-        "signal-exit": "^3.0.7",

-        "sshpk": "^1.18.0",

-        "string-width": "^2.1.1",

-        "strip-ansi": "^4.0.0",

-        "strip-eof": "^1.0.0",

-        "supports-color": "^5.5.0",

-        "swagger2openapi": "^5.4.0",

-        "tough-cookie": "^2.5.0",

-        "tslib": "^1.14.1",

-        "tunnel-agent": "^0.6.0",

-        "tweetnacl": "^0.14.5",

-        "undici-types": "^5.26.5",

-        "uri-js": "^4.4.1",

-        "uuid": "^3.4.0",

-        "verror": "^1.10.0",

-        "which": "^1.3.1",

-        "which-module": "^2.0.1",

-        "wrap-ansi": "^2.1.0",

-        "wrappy": "^1.0.2",

-        "y18n": "^4.0.3",

-        "yaml": "^1.10.2",

-        "yargs": "^12.0.5",

-        "yargs-parser": "^11.1.1"

-      }

-    },

-    "node_modules/@livekit/mutex": {

-      "version": "1.1.1",

-      "resolved": "https://registry.npmjs.org/@livekit/mutex/-/mutex-1.1.1.tgz",

-      "integrity": "sha512-EsshAucklmpuUAfkABPxJNhzj9v2sG7JuzFDL4ML1oJQSV14sqrpTYnsaOudMAw9yOaW53NU3QQTlUQoRs4czw==",

-      "license": "Apache-2.0"

-    },

-    "node_modules/@livekit/protocol": {

-      "version": "1.39.3",

-      "resolved": "https://registry.npmjs.org/@livekit/protocol/-/protocol-1.39.3.tgz",

-      "integrity": "sha512-hfOnbwPCeZBEvMRdRhU2sr46mjGXavQcrb3BFRfG+Gm0Z7WUSeFdy5WLstXJzEepz17Iwp/lkGwJ4ZgOOYfPuA==",

-      "license": "Apache-2.0",

-      "dependencies": {

-        "@bufbuild/protobuf": "^1.10.0"

-      }

-    },

-    "node_modules/@next/env": {

-      "version": "14.2.5",

-      "resolved": "https://registry.npmjs.org/@next/env/-/env-14.2.5.tgz",

-      "integrity": "sha512-/zZGkrTOsraVfYjGP8uM0p6r0BDT6xWpkjdVbcz66PJVSpwXX3yNiRycxAuDfBKGWBrZBXRuK/YVlkNgxHGwmA==",

-      "license": "MIT"

-    },

-    "node_modules/@next/swc-darwin-arm64": {

-      "version": "14.2.5",

-      "resolved": "https://registry.npmjs.org/@next/swc-darwin-arm64/-/swc-darwin-arm64-14.2.5.tgz",

-      "integrity": "sha512-/9zVxJ+K9lrzSGli1///ujyRfon/ZneeZ+v4ptpiPoOU+GKZnm8Wj8ELWU1Pm7GHltYRBklmXMTUqM/DqQ99FQ==",

-      "cpu": [

-        "arm64"

-      ],

-      "license": "MIT",

-      "optional": true,

-      "os": [

-        "darwin"

-      ],

-      "engines": {

-        "node": ">= 10"

-      }

-    },

-    "node_modules/@next/swc-darwin-x64": {

-      "version": "14.2.5",

-      "resolved": "https://registry.npmjs.org/@next/swc-darwin-x64/-/swc-darwin-x64-14.2.5.tgz",

-      "integrity": "sha512-vXHOPCwfDe9qLDuq7U1OYM2wUY+KQ4Ex6ozwsKxp26BlJ6XXbHleOUldenM67JRyBfVjv371oneEvYd3H2gNSA==",

-      "cpu": [

-        "x64"

-      ],

-      "license": "MIT",

-      "optional": true,

-      "os": [

-        "darwin"

-      ],

-      "engines": {

-        "node": ">= 10"

-      }

-    },

-    "node_modules/@next/swc-linux-arm64-gnu": {

-      "version": "14.2.5",

-      "resolved": "https://registry.npmjs.org/@next/swc-linux-arm64-gnu/-/swc-linux-arm64-gnu-14.2.5.tgz",

-      "integrity": "sha512-vlhB8wI+lj8q1ExFW8lbWutA4M2ZazQNvMWuEDqZcuJJc78iUnLdPPunBPX8rC4IgT6lIx/adB+Cwrl99MzNaA==",

-      "cpu": [

-        "arm64"

-      ],

-      "libc": [

-        "glibc"

-      ],

-      "license": "MIT",

-      "optional": true,

-      "os": [

-        "linux"

-      ],

-      "engines": {

-        "node": ">= 10"

-      }

-    },

-    "node_modules/@next/swc-linux-arm64-musl": {

-      "version": "14.2.5",

-      "resolved": "https://registry.npmjs.org/@next/swc-linux-arm64-musl/-/swc-linux-arm64-musl-14.2.5.tgz",

-      "integrity": "sha512-NpDB9NUR2t0hXzJJwQSGu1IAOYybsfeB+LxpGsXrRIb7QOrYmidJz3shzY8cM6+rO4Aojuef0N/PEaX18pi9OA==",

-      "cpu": [

-        "arm64"

-      ],

-      "libc": [

-        "musl"

-      ],

-      "license": "MIT",

-      "optional": true,

-      "os": [

-        "linux"

-      ],

-      "engines": {

-        "node": ">= 10"

-      }

-    },

-    "node_modules/@next/swc-linux-x64-gnu": {

-      "version": "14.2.5",

-      "resolved": "https://registry.npmjs.org/@next/swc-linux-x64-gnu/-/swc-linux-x64-gnu-14.2.5.tgz",

-      "integrity": "sha512-8XFikMSxWleYNryWIjiCX+gU201YS+erTUidKdyOVYi5qUQo/gRxv/3N1oZFCgqpesN6FPeqGM72Zve+nReVXQ==",

-      "cpu": [

-        "x64"

-      ],

-      "libc": [

-        "glibc"

-      ],

-      "license": "MIT",

-      "optional": true,

-      "os": [

-        "linux"

-      ],

-      "engines": {

-        "node": ">= 10"

-      }

-    },

-    "node_modules/@next/swc-linux-x64-musl": {

-      "version": "14.2.5",

-      "resolved": "https://registry.npmjs.org/@next/swc-linux-x64-musl/-/swc-linux-x64-musl-14.2.5.tgz",

-      "integrity": "sha512-6QLwi7RaYiQDcRDSU/os40r5o06b5ue7Jsk5JgdRBGGp8l37RZEh9JsLSM8QF0YDsgcosSeHjglgqi25+m04IQ==",

-      "cpu": [

-        "x64"

-      ],

-      "libc": [

-        "musl"

-      ],

-      "license": "MIT",

-      "optional": true,

-      "os": [

-        "linux"

-      ],

-      "engines": {

-        "node": ">= 10"

-      }

-    },

-    "node_modules/@next/swc-win32-arm64-msvc": {

-      "version": "14.2.5",

-      "resolved": "https://registry.npmjs.org/@next/swc-win32-arm64-msvc/-/swc-win32-arm64-msvc-14.2.5.tgz",

-      "integrity": "sha512-1GpG2VhbspO+aYoMOQPQiqc/tG3LzmsdBH0LhnDS3JrtDx2QmzXe0B6mSZZiN3Bq7IOMXxv1nlsjzoS1+9mzZw==",

-      "cpu": [

-        "arm64"

-      ],

-      "license": "MIT",

-      "optional": true,

-      "os": [

-        "win32"

-      ],

-      "engines": {

-        "node": ">= 10"

-      }

-    },

-    "node_modules/@next/swc-win32-ia32-msvc": {

-      "version": "14.2.5",

-      "resolved": "https://registry.npmjs.org/@next/swc-win32-ia32-msvc/-/swc-win32-ia32-msvc-14.2.5.tgz",

-      "integrity": "sha512-Igh9ZlxwvCDsu6438FXlQTHlRno4gFpJzqPjSIBZooD22tKeI4fE/YMRoHVJHmrQ2P5YL1DoZ0qaOKkbeFWeMg==",

-      "cpu": [

-        "ia32"

-      ],

-      "license": "MIT",

-      "optional": true,

-      "os": [

-        "win32"

-      ],

-      "engines": {

-        "node": ">= 10"

-      }

-    },

-    "node_modules/@next/swc-win32-x64-msvc": {

-      "version": "14.2.5",

-      "resolved": "https://registry.npmjs.org/@next/swc-win32-x64-msvc/-/swc-win32-x64-msvc-14.2.5.tgz",

-      "integrity": "sha512-tEQ7oinq1/CjSG9uSTerca3v4AZ+dFa+4Yu6ihaG8Ud8ddqLQgFGcnwYls13H5X5CPDPZJdYxyeMui6muOLd4g==",

-      "cpu": [

-        "x64"

-      ],

-      "license": "MIT",

-      "optional": true,

-      "os": [

-        "win32"

-      ],

-      "engines": {

-        "node": ">= 10"

-      }

-    },

-    "node_modules/@noble/ciphers": {

-      "version": "1.3.0",

-      "resolved": "https://registry.npmjs.org/@noble/ciphers/-/ciphers-1.3.0.tgz",

-      "integrity": "sha512-2I0gnIVPtfnMw9ee9h1dJG7tp81+8Ob3OJb3Mv37rx5L40/b0i7djjCVvGOVqc9AEIQyvyu1i6ypKdFw8R8gQw==",

-      "license": "MIT",

-      "engines": {

-        "node": "^14.21.3 || >=16"

-      },

-      "funding": {

-        "url": "https://paulmillr.com/funding/"

-      }

-    },

-    "node_modules/@noble/hashes": {

-      "version": "1.8.0",

-      "resolved": "https://registry.npmjs.org/@noble/hashes/-/hashes-1.8.0.tgz",

-      "integrity": "sha512-jCs9ldd7NwzpgXDIf6P3+NrHh9/sD6CQdxHyjQI+h/6rDNo88ypBxxz45UDuZHz9r3tNz7N/VInSVoVdtXEI4A==",

-      "license": "MIT",

-      "engines": {

-        "node": "^14.21.3 || >=16"

-      },

-      "funding": {

-        "url": "https://paulmillr.com/funding/"

-      }

-    },

-    "node_modules/@react-pdf/fns": {

-      "version": "3.1.3",

-      "resolved": "https://registry.npmjs.org/@react-pdf/fns/-/fns-3.1.3.tgz",

-      "integrity": "sha512-0I7pApDr1/RLAKbizuLy/IHTEa93LSPy/bEwYniboC3Xqnp6Od8xFJKbKEzGw2wh/5zKFFwl00g4t9RwgIMc3w==",

-      "license": "MIT"

-    },

-    "node_modules/@react-pdf/font": {

-      "version": "4.1.2",

-      "resolved": "https://registry.npmjs.org/@react-pdf/font/-/font-4.1.2.tgz",

-      "integrity": "sha512-RT/jiGWIRjIC9c4S9NiqhEyfuA6YL+DtWL3Rm+k+zQhfeHYvHwGzFxr7ZJzThIMrT8sIQy+mpvFvfYyitEei/Q==",

-      "license": "MIT",

-      "dependencies": {

-        "@react-pdf/types": "^2.14.0",

-        "fontkit": "^2.0.2",

-        "is-url": "^1.2.4",

-        "pdfkit": "0.20.1"

-      }

-    },

-    "node_modules/@react-pdf/hyphenate": {

-      "version": "0.1.0",

-      "resolved": "https://registry.npmjs.org/@react-pdf/hyphenate/-/hyphenate-0.1.0.tgz",

-      "integrity": "sha512-CWulbuusHh2Lnos9ZffT3ZYfjCt332Yl8wjSyCKWbwhbTpe/VdFt53fM5elPp3HU3R6tzH6j3oYlLXDwC2WEHQ==",

-      "license": "MIT",

-      "dependencies": {

-        "hyphen": "~1.6.4"

-      }

-    },

-    "node_modules/@react-pdf/image": {

-      "version": "3.1.2",

-      "resolved": "https://registry.npmjs.org/@react-pdf/image/-/image-3.1.2.tgz",

-      "integrity": "sha512-89vlvZCCv1hPunFtyeS2rJTRL8h2yYmTI97AM4ppibS79zGsPFbqz/YrAunndcHB9uwGdn5S3+5k18mj0L2vkg==",

-      "license": "MIT",

-      "dependencies": {

-        "@react-pdf/svg": "^1.1.1",

-        "jay-peg": "^1.1.1",

-        "png-js": "^2.0.0"

-      }

-    },

-    "node_modules/@react-pdf/layout": {

-      "version": "4.7.1",

-      "resolved": "https://registry.npmjs.org/@react-pdf/layout/-/layout-4.7.1.tgz",

-      "integrity": "sha512-Aa6hqB2+ytvxkGgWpxFb8PyMKndXW38bOrpdZq6fjtwYRkgDQlG3mng9paqoY+qQl5A2XiHpiNiXFEphGlVAhA==",

-      "license": "MIT",

-      "dependencies": {

-        "@react-pdf/fns": "3.1.3",

-        "@react-pdf/image": "^3.1.1",

-        "@react-pdf/primitives": "^4.3.0",

-        "@react-pdf/stylesheet": "^6.2.3",

-        "@react-pdf/textkit": "^6.4.1",

-        "@react-pdf/types": "^2.11.3",

-        "emoji-regex-xs": "^1.0.0",

-        "queue": "^6.0.1",

-        "yoga-layout": "^3.2.1"

-      }

-    },

-    "node_modules/@react-pdf/pdfkit": {

-      "version": "5.1.1",

-      "resolved": "https://registry.npmjs.org/@react-pdf/pdfkit/-/pdfkit-5.1.1.tgz",

-      "integrity": "sha512-wNcdSsNlNYyGHGAgIdt453egBF7fiF9UxpRlklUfVvu8OWCrUppG9xiUrPLVoKiqWet5tMi0w6LmuFUJuYqjEg==",

-      "license": "MIT",

-      "dependencies": {

-        "@babel/runtime": "^7.20.13",

-        "@noble/ciphers": "^1.0.0",

-        "@noble/hashes": "^1.6.0",

-        "browserify-zlib": "^0.2.0",

-        "fontkit": "^2.0.2",

-        "jay-peg": "^1.1.1",

-        "js-md5": "^0.8.3",

-        "linebreak": "^1.1.0",

-        "png-js": "^2.0.0",

-        "vite-compatible-readable-stream": "^3.6.1"

-      }

-    },

-    "node_modules/@react-pdf/primitives": {

-      "version": "4.4.0",

-      "resolved": "https://registry.npmjs.org/@react-pdf/primitives/-/primitives-4.4.0.tgz",

-      "integrity": "sha512-BFpuhNH6ffSFjTTMnpdUoZxWoXdhPmFDdrSVBl0i/zMR4yDTEfYOW3AcfjjmNIOpm9+LnIXbgELLklQJ+nD3oA==",

-      "license": "MIT"

-    },

-    "node_modules/@react-pdf/reconciler": {

-      "version": "2.0.0",

-      "resolved": "https://registry.npmjs.org/@react-pdf/reconciler/-/reconciler-2.0.0.tgz",

-      "integrity": "sha512-7zaPRujpbHSmCpIrZ+b9HSTJHthcVZzX0Wx7RzvQGsGBUbHP4p6s5itXrAIOuQuPvDepoHGNOvf6xUuMVvdoyw==",

-      "license": "MIT",

-      "dependencies": {

-        "object-assign": "^4.1.1",

-        "scheduler": "0.25.0-rc-603e6108-20241029"

-      },

-      "peerDependencies": {

-        "react": "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0"

-      }

-    },

-    "node_modules/@react-pdf/reconciler/node_modules/scheduler": {

-      "version": "0.25.0-rc-603e6108-20241029",

-      "resolved": "https://registry.npmjs.org/scheduler/-/scheduler-0.25.0-rc-603e6108-20241029.tgz",

-      "integrity": "sha512-pFwF6H1XrSdYYNLfOcGlM28/j8CGLu8IvdrxqhjWULe2bPcKiKW4CV+OWqR/9fT52mywx65l7ysNkjLKBda7eA==",

-      "license": "MIT"

-    },

-    "node_modules/@react-pdf/render": {

-      "version": "4.7.0",

-      "resolved": "https://registry.npmjs.org/@react-pdf/render/-/render-4.7.0.tgz",

-      "integrity": "sha512-UEMgR7gBmCJiKpuu9alY6QeZVNB+7b4DGHc7Hi8QIl+5PfHvyq+TV70N7+ngZ6wN7hF3XSiWz7GDuYxPIx5eRw==",

-      "license": "MIT",

-      "dependencies": {

-        "@babel/runtime": "^7.20.13",

-        "@react-pdf/fns": "3.1.3",

-        "@react-pdf/primitives": "^4.4.0",

-        "@react-pdf/textkit": "^7.0.1",

-        "@react-pdf/types": "^2.14.0",

-        "abs-svg-path": "^0.1.1",

-        "color-string": "^2.1.4",

-        "normalize-svg-path": "^1.1.0",

-        "parse-svg-path": "^0.1.2",

-        "svg-arc-to-cubic-bezier": "^3.2.0"

-      }

-    },

-    "node_modules/@react-pdf/render/node_modules/@react-pdf/textkit": {

-      "version": "7.0.1",

-      "resolved": "https://registry.npmjs.org/@react-pdf/textkit/-/textkit-7.0.1.tgz",

-      "integrity": "sha512-ljY/YoEETIOR/+zxWdLLmKlupz8/nBsbmxglM3mDRco62UEzEPnIeMEzYVVVraovCAJC2t+50gKFNSV17FYxbw==",

-      "license": "MIT",

-      "dependencies": {

-        "@react-pdf/fns": "3.1.3",

-        "@react-pdf/hyphenate": "^0.1.0",

-        "bidi-js": "^1.0.2",

-        "unicode-properties": "^1.4.1"

-      }

-    },

-    "node_modules/@react-pdf/renderer": {

-      "version": "4.4.1",

-      "resolved": "https://registry.npmjs.org/@react-pdf/renderer/-/renderer-4.4.1.tgz",

-      "integrity": "sha512-mK7xyCdDUagO1kg8jraad3aUzdVAGBru08qyjjp8FMhGsh4BcuPGa0SycQ8Pv8EDEdyEOfmiE+XI1sBybSLwaQ==",

-      "license": "MIT",

-      "dependencies": {

-        "@babel/runtime": "^7.20.13",

-        "@react-pdf/fns": "3.1.3",

-        "@react-pdf/font": "^4.0.6",

-        "@react-pdf/layout": "^4.5.1",

-        "@react-pdf/pdfkit": "^5.0.0",

-        "@react-pdf/primitives": "^4.2.0",

-        "@react-pdf/reconciler": "^2.0.0",

-        "@react-pdf/render": "^4.4.1",

-        "@react-pdf/types": "^2.10.0",

-        "events": "^3.3.0",

-        "object-assign": "^4.1.1",

-        "prop-types": "^15.6.2",

-        "queue": "^6.0.1"

-      },

-      "peerDependencies": {

-        "react": "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0"

-      }

-    },

-    "node_modules/@react-pdf/stylesheet": {

-      "version": "6.3.2",

-      "resolved": "https://registry.npmjs.org/@react-pdf/stylesheet/-/stylesheet-6.3.2.tgz",

-      "integrity": "sha512-UR247sNBx2k3RdL8JUCpUiyx39yQsUABagv3uAi91iMZCORE+fSCsOh7MOcEImmpms4GihydLGudbngI5g14PA==",

-      "license": "MIT",

-      "dependencies": {

-        "@react-pdf/fns": "3.1.3",

-        "@react-pdf/types": "^2.14.0",

-        "color-string": "^2.1.4",

-        "hsl-to-hex": "^1.0.0",

-        "media-engine": "^2.0.0",

-        "postcss-value-parser": "^4.1.0"

-      }

-    },

-    "node_modules/@react-pdf/svg": {

-      "version": "1.1.1",

-      "resolved": "https://registry.npmjs.org/@react-pdf/svg/-/svg-1.1.1.tgz",

-      "integrity": "sha512-m1GmGxV2wg/3VpoQ0aCJ598fBedCCfN+HtxKx1lq5kdwUWEaTbfXI1DGFAUedprFDd/i24okKFaUhV/KVZIqIQ==",

-      "license": "MIT",

-      "dependencies": {

-        "@react-pdf/primitives": "^4.4.0"

-      }

-    },

-    "node_modules/@react-pdf/textkit": {

-      "version": "6.4.2",

-      "resolved": "https://registry.npmjs.org/@react-pdf/textkit/-/textkit-6.4.2.tgz",

-      "integrity": "sha512-NcyM2/HKud/JSNxnq7gLrp0Y9gm7+WKKv3hAZsXPDMvywERLEUk41QPphhSGj4nEdjfCPlMr3v8LDSqe06vUow==",

-      "license": "MIT",

-      "dependencies": {

-        "@react-pdf/fns": "3.1.3",

-        "@react-pdf/hyphenate": "^0.1.0",

-        "bidi-js": "^1.0.2",

-        "unicode-properties": "^1.4.1"

-      }

-    },

-    "node_modules/@react-pdf/types": {

-      "version": "2.14.0",

-      "resolved": "https://registry.npmjs.org/@react-pdf/types/-/types-2.14.0.tgz",

-      "integrity": "sha512-TYHpThdf2sz/d1g+CP9nWjYCJ8BYBUN5ORL6+60A85Js9S/YouK8OXzi+hDpYUSZJTOdYXdRxUNeG2oW8//Ulg==",

-      "license": "MIT",

-      "dependencies": {

-        "@react-pdf/font": "^4.1.2",

-        "@react-pdf/primitives": "^4.4.0",

-        "@react-pdf/stylesheet": "^6.3.2"

-      }

-    },

-    "node_modules/@supabase/auth-js": {

-      "version": "2.110.8",

-      "resolved": "https://registry.npmjs.org/@supabase/auth-js/-/auth-js-2.110.8.tgz",

-      "integrity": "sha512-TQ5neTUDX2C2WmyYa03yGhLMkhdE/SkHXtK8/qxO/APUy3rsymsJCBP48p4jcN6iO2G0ow6RRexQd2mX+dSyJg==",

-      "license": "MIT",

-      "dependencies": {

-        "tslib": "2.8.1"

-      },

-      "engines": {

-        "node": ">=22.0.0"

-      }

-    },

-    "node_modules/@supabase/auth-js/node_modules/tslib": {

-      "version": "2.8.1",

-      "resolved": "https://registry.npmjs.org/tslib/-/tslib-2.8.1.tgz",

-      "integrity": "sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w==",

-      "license": "0BSD"

-    },

-    "node_modules/@supabase/functions-js": {

-      "version": "2.110.8",

-      "resolved": "https://registry.npmjs.org/@supabase/functions-js/-/functions-js-2.110.8.tgz",

-      "integrity": "sha512-5yB9TLYzvv2oSQxwb0gamEvIAsuH66pVt7AM/pz03S7wN6ehD34GNgbShrccetqPedXQSz7e/1hAJ9NeEhoZVg==",

-      "license": "MIT",

-      "dependencies": {

-        "tslib": "2.8.1"

-      },

-      "engines": {

-        "node": ">=22.0.0"

-      }

-    },

-    "node_modules/@supabase/functions-js/node_modules/tslib": {

-      "version": "2.8.1",

-      "resolved": "https://registry.npmjs.org/tslib/-/tslib-2.8.1.tgz",

-      "integrity": "sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w==",

-      "license": "0BSD"

-    },

-    "node_modules/@supabase/phoenix": {

-      "version": "0.4.5",

-      "resolved": "https://registry.npmjs.org/@supabase/phoenix/-/phoenix-0.4.5.tgz",

-      "integrity": "sha512-aAn9H9ovVyeApKy11OWOrrOGq8DV68yWeH4ud2lN9fzn4aO8Zb5GLL9m1pUg9nLqIcT+ZDfAcsZe0E/nqdv2lw==",

-      "license": "MIT"

-    },

-    "node_modules/@supabase/postgrest-js": {

-      "version": "2.110.8",

-      "resolved": "https://registry.npmjs.org/@supabase/postgrest-js/-/postgrest-js-2.110.8.tgz",

-      "integrity": "sha512-QeRROxl1PpOZw5Jzi7BwdN9icsycMrLlCCvsjS0hYLW+nZoaT46zdagz/glJirj8jHF4jSd5Jyipuae2cBClCw==",

-      "license": "MIT",

-      "dependencies": {

-        "tslib": "2.8.1"

-      },

-      "engines": {

-        "node": ">=22.0.0"

-      }

-    },

-    "node_modules/@supabase/postgrest-js/node_modules/tslib": {

-      "version": "2.8.1",

-      "resolved": "https://registry.npmjs.org/tslib/-/tslib-2.8.1.tgz",

-      "integrity": "sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w==",

-      "license": "0BSD"

-    },

-    "node_modules/@supabase/realtime-js": {

-      "version": "2.110.8",

-      "resolved": "https://registry.npmjs.org/@supabase/realtime-js/-/realtime-js-2.110.8.tgz",

-      "integrity": "sha512-mwX7ituX6O31fLf+0g65rpLlNxqgnMaPltPsQwzox6jfmbfVl3tCxXrfr3HEsQcCRjpjuJG1+A0vFzP1yVjKHA==",

-      "license": "MIT",

-      "dependencies": {

-        "@supabase/phoenix": "0.4.5",

-        "tslib": "2.8.1"

-      },

-      "engines": {

-        "node": ">=22.0.0"

-      }

-    },

-    "node_modules/@supabase/realtime-js/node_modules/tslib": {

-      "version": "2.8.1",

-      "resolved": "https://registry.npmjs.org/tslib/-/tslib-2.8.1.tgz",

-      "integrity": "sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w==",

-      "license": "0BSD"

-    },

-    "node_modules/@supabase/ssr": {

-      "version": "0.12.3",

-      "resolved": "https://registry.npmjs.org/@supabase/ssr/-/ssr-0.12.3.tgz",

-      "integrity": "sha512-qWXJ/dI7CiYDKyTgIPqJ4Qkh8y5edh2LdF/nkN48z47mmEVzAO2OE+YErYeQ/UemVfonn/F4kFz+lhLqoVMdpw==",

-      "license": "MIT",

-      "dependencies": {

-        "cookie": "^1.0.2"

-      },

-      "peerDependencies": {

-        "@supabase/supabase-js": "^2.110.5"

-      }

-    },

-    "node_modules/@supabase/storage-js": {

-      "version": "2.110.8",

-      "resolved": "https://registry.npmjs.org/@supabase/storage-js/-/storage-js-2.110.8.tgz",

-      "integrity": "sha512-CcfhkZFBLxsthgUabZKxwfsoXdrikIGsL3LsGoV3FZTqCMx/s1y49taT4jT/oya5+1IuB0sFFHw6pF0o0iJniQ==",

-      "license": "MIT",

-      "dependencies": {

-        "iceberg-js": "^0.8.1",

-        "tslib": "2.8.1"

-      },

-      "engines": {

-        "node": ">=22.0.0"

-      }

-    },

-    "node_modules/@supabase/storage-js/node_modules/tslib": {

-      "version": "2.8.1",

-      "resolved": "https://registry.npmjs.org/tslib/-/tslib-2.8.1.tgz",

-      "integrity": "sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w==",

-      "license": "0BSD"

-    },

-    "node_modules/@supabase/supabase-js": {

-      "version": "2.110.8",

-      "resolved": "https://registry.npmjs.org/@supabase/supabase-js/-/supabase-js-2.110.8.tgz",

-      "integrity": "sha512-E5qzoe74zhJRv4wRcbO9eMYzeQDb/+h6c603pL8shcxLGBjTKsIF7XXj05IcNj23TLDgJN1WkMw7mwAPyu5dZg==",

-      "license": "MIT",

-      "dependencies": {

-        "@supabase/auth-js": "2.110.8",

-        "@supabase/functions-js": "2.110.8",

-        "@supabase/postgrest-js": "2.110.8",

-        "@supabase/realtime-js": "2.110.8",

-        "@supabase/storage-js": "2.110.8"

-      },

-      "engines": {

-        "node": ">=22.0.0"

-      }

-    },

-    "node_modules/@swc/counter": {

-      "version": "0.1.3",

-      "resolved": "https://registry.npmjs.org/@swc/counter/-/counter-0.1.3.tgz",

-      "integrity": "sha512-e2BR4lsJkkRlKZ/qCHPw9ZaSxc0MVUd7gtbtaB7aMvHeJVYe8sOB8DBZkP2DtISHGSku9sCK6T6cnY0CtXrOCQ==",

-      "license": "Apache-2.0"

-    },

-    "node_modules/@swc/helpers": {

-      "version": "0.5.5",

-      "resolved": "https://registry.npmjs.org/@swc/helpers/-/helpers-0.5.5.tgz",

-      "integrity": "sha512-KGYxvIOXcceOAbEk4bi/dVLEK9z8sZ0uBB3Il5b1rhfClSpcX0yfRO0KmTkqR2cnQDymwLB+25ZyMzICg/cm/A==",

-      "license": "Apache-2.0",

-      "dependencies": {

-        "@swc/counter": "^0.1.3",

-        "tslib": "^2.4.0"

-      }

-    },

-    "node_modules/@swc/helpers/node_modules/tslib": {

-      "version": "2.8.1",

-      "resolved": "https://registry.npmjs.org/tslib/-/tslib-2.8.1.tgz",

-      "integrity": "sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w==",

-      "license": "0BSD"

-    },

-    "node_modules/@types/caseless": {

-      "version": "0.12.5",

-      "resolved": "https://registry.npmjs.org/@types/caseless/-/caseless-0.12.5.tgz",

-      "integrity": "sha512-hWtVTC2q7hc7xZ/RLbxapMvDMgUnDvKvMOpKal4DrMyfGBUfB1oKaZlIRr6mJL+If3bAP6sV/QneGzF6tJjZDg==",

-      "license": "MIT"

-    },

-    "node_modules/@types/dom-mediacapture-record": {

-      "version": "1.0.22",

-      "resolved": "https://registry.npmjs.org/@types/dom-mediacapture-record/-/dom-mediacapture-record-1.0.22.tgz",

-      "integrity": "sha512-mUMZLK3NvwRLcAAT9qmcK+9p7tpU2FHdDsntR3YI4+GY88XrgG4XiE7u1Q2LAN2/FZOz/tdMDC3GQCR4T8nFuw==",

-      "license": "MIT",

-      "peer": true

-    },

-    "node_modules/@types/node": {

-      "version": "20.19.43",

-      "resolved": "https://registry.npmjs.org/@types/node/-/node-20.19.43.tgz",

-      "integrity": "sha512-6oYBAi5ikg4Pl+kGsoYtawUMBT2zZMCvPNF7pVLnHZfd1zf38DRiWn/gT01RYCdUqkv7Fhr+C9ot4/tb+2sVvA==",

-      "license": "MIT",

-      "dependencies": {

-        "undici-types": "~6.21.0"

-      }

-    },

-    "node_modules/@types/node/node_modules/undici-types": {

-      "version": "6.21.0",

-      "resolved": "https://registry.npmjs.org/undici-types/-/undici-types-6.21.0.tgz",

-      "integrity": "sha512-iwDZqg0QAGrg9Rav5H4n0M64c3mkR59cJ6wQp+7C4nI0gsmExaedaYLNO44eT4AtBBwjbTiGPMlt2Md0T9H9JQ==",

-      "license": "MIT"

-    },

-    "node_modules/@types/nunjucks": {

-      "version": "3.2.6",

-      "resolved": "https://registry.npmjs.org/@types/nunjucks/-/nunjucks-3.2.6.tgz",

-      "integrity": "sha512-pHiGtf83na1nCzliuAdq8GowYiXvH5l931xZ0YEHaLMNFgynpEqx+IPStlu7UaDkehfvl01e4x/9Tpwhy7Ue3w==",

-      "license": "MIT"

-    },

-    "node_modules/@types/prop-types": {

-      "version": "15.7.15",

-      "resolved": "https://registry.npmjs.org/@types/prop-types/-/prop-types-15.7.15.tgz",

-      "integrity": "sha512-F6bEyamV9jKGAFBEmlQnesRPGOQqS2+Uwi0Em15xenOxHaf2hv6L8YCVn3rPdPJOiJfPiCnLIRyvwVaqMY3MIw==",

-      "dev": true,

-      "license": "MIT"

-    },

-    "node_modules/@types/react": {

-      "version": "18.3.31",

-      "resolved": "https://registry.npmjs.org/@types/react/-/react-18.3.31.tgz",

-      "integrity": "sha512-vfEqpXTvwT91yhmwdfouStN2hSKwTvyRs8qpLfADyrq/kxDw0hZM7Wk9Ug1FELj8hIby+S/+kQCSRFF32nv2Qw==",

-      "dev": true,

-      "license": "MIT",

-      "dependencies": {

-        "@types/prop-types": "*",

-        "csstype": "^3.2.2"

-      }

-    },

-    "node_modules/@types/react-dom": {

-      "version": "18.3.7",

-      "resolved": "https://registry.npmjs.org/@types/react-dom/-/react-dom-18.3.7.tgz",

-      "integrity": "sha512-MEe3UeoENYVFXzoXEWsvcpg6ZvlrFNlOQ7EOsvhI3CfAXwzPfO8Qwuxd40nepsYKqyyVQnTdEfv68q91yLcKrQ==",

-      "dev": true,

-      "license": "MIT",

-      "peerDependencies": {

-        "@types/react": "^18.0.0"

-      }

-    },

-    "node_modules/@types/request": {

-      "version": "2.48.13",

-      "resolved": "https://registry.npmjs.org/@types/request/-/request-2.48.13.tgz",

-      "integrity": "sha512-FGJ6udDNUCjd19pp0Q3iTiDkwhYup7J8hpMW9c4k53NrccQFFWKRho6hvtPPEhnXWKvukfwAlB6DbDz4yhH5Gg==",

-      "license": "MIT",

-      "dependencies": {

-        "@types/caseless": "*",

-        "@types/node": "*",

-        "@types/tough-cookie": "*",

-        "form-data": "^2.5.5"

-      }

-    },

-    "node_modules/@types/tough-cookie": {

-      "version": "4.0.5",

-      "resolved": "https://registry.npmjs.org/@types/tough-cookie/-/tough-cookie-4.0.5.tgz",

-      "integrity": "sha512-/Ad8+nIOV7Rl++6f1BdKxFSMgmoqEoYbHRpPcx3JEfv8VRsQe9Z4mCXeJBzxs7mbHY/XOZZuXlRNfhpVPbs6ZA==",

-      "license": "MIT"

-    },

-    "node_modules/a-sync-waterfall": {

-      "version": "1.0.1",

-      "resolved": "https://registry.npmjs.org/a-sync-waterfall/-/a-sync-waterfall-1.0.1.tgz",

-      "integrity": "sha512-RYTOHHdWipFUliRFMCS4X2Yn2X8M87V/OpSqWzKKOGhzqyUxzyVmhHDH9sAvG+ZuQf/TAOFsLCpMw09I1ufUnA==",

-      "license": "MIT"

-    },

-    "node_modules/abs-svg-path": {

-      "version": "0.1.1",

-      "resolved": "https://registry.npmjs.org/abs-svg-path/-/abs-svg-path-0.1.1.tgz",

-      "integrity": "sha512-d8XPSGjfyzlXC3Xx891DJRyZfqk5JU0BJrDQcsWomFIV1/BIzPW5HDH5iDdWpqWaav0YVIEzT1RHTwWr0FFshA==",

-      "license": "MIT"

-    },

-    "node_modules/ajv": {

-      "version": "6.15.0",

-      "resolved": "https://registry.npmjs.org/ajv/-/ajv-6.15.0.tgz",

-      "integrity": "sha512-fgFx7Hfoq60ytK2c7DhnF8jIvzYgOMxfugjLOSMHjLIPgenqa7S7oaagATUq99mV6IYvN2tRmC0wnTYX6iPbMw==",

-      "license": "MIT",

-      "dependencies": {

-        "fast-deep-equal": "^3.1.1",

-        "fast-json-stable-stringify": "^2.0.0",

-        "json-schema-traverse": "^0.4.1",

-        "uri-js": "^4.2.2"

-      },

-      "funding": {

-        "type": "github",

-        "url": "https://github.com/sponsors/epoberezkin"

-      }

-    },

-    "node_modules/ansi-regex": {

-      "version": "3.0.1",

-      "resolved": "https://registry.npmjs.org/ansi-regex/-/ansi-regex-3.0.1.tgz",

-      "integrity": "sha512-+O9Jct8wf++lXxxFc4hc8LsjaSq0HFzzL7cVsw8pRDIPdjKD2mT4ytDZlLuSBZ4cLKZFXIrMGO7DbQCtMJJMKw==",

-      "license": "MIT",

-      "engines": {

-        "node": ">=4"

-      }

-    },

-    "node_modules/ansi-styles": {

-      "version": "3.2.1",

-      "resolved": "https://registry.npmjs.org/ansi-styles/-/ansi-styles-3.2.1.tgz",

-      "integrity": "sha512-VT0ZI6kZRdTh8YyJw3SMbYm/u+NqfsAxEpWO0Pf9sq8/e94WxxOpPKx9FR1FlyCtOVDNOQ+8ntlqFxiRc+r5qA==",

-      "license": "MIT",

-      "dependencies": {

-        "color-convert": "^1.9.0"

-      },

-      "engines": {

-        "node": ">=4"

-      }

-    },

-    "node_modules/asap": {

-      "version": "2.0.6",

-      "resolved": "https://registry.npmjs.org/asap/-/asap-2.0.6.tgz",

-      "integrity": "sha512-BSHWgDSAiKs50o2Re8ppvp3seVHXSRM44cdSsT9FfNEUUZLOGWVCsiWaRPWM1Znn+mqZ1OfVZ3z3DWEzSp7hRA==",

-      "license": "MIT"

-    },

-    "node_modules/asn1": {

-      "version": "0.2.6",

-      "resolved": "https://registry.npmjs.org/asn1/-/asn1-0.2.6.tgz",

-      "integrity": "sha512-ix/FxPn0MDjeyJ7i/yoHGFt/EX6LyNbxSEhPPXODPL+KB0VPk86UYfL0lMdy+KCnv+fmvIzySwaK5COwqVbWTQ==",

-      "license": "MIT",

-      "dependencies": {

-        "safer-buffer": "~2.1.0"

-      }

-    },

-    "node_modules/assert-plus": {

-      "version": "1.0.0",

-      "resolved": "https://registry.npmjs.org/assert-plus/-/assert-plus-1.0.0.tgz",

-      "integrity": "sha512-NfJ4UzBCcQGLDlQq7nHxH+tv3kyZ0hHQqF5BO6J7tNJeP5do1llPr8dZ8zHonfhAu0PHAdMkSo+8o0wxg9lZWw==",

-      "license": "MIT",

-      "engines": {

-        "node": ">=0.8"

-      }

-    },

-    "node_modules/asynckit": {

-      "version": "0.4.0",

-      "resolved": "https://registry.npmjs.org/asynckit/-/asynckit-0.4.0.tgz",

-      "integrity": "sha512-Oei9OH4tRh0YqU3GxhX79dM/mwVgvbZJaSNaRk+bshkj0S5cfHcgYakreBjrHwatXKbz+IoIdYLxrKim2MjW0Q==",

-      "license": "MIT"

-    },

-    "node_modules/aws-sign2": {

-      "version": "0.7.0",

-      "resolved": "https://registry.npmjs.org/aws-sign2/-/aws-sign2-0.7.0.tgz",

-      "integrity": "sha512-08kcGqnYf/YmjoRhfxyu+CLxBjUtHLXLXX/vUfx9l2LYzG3c1m61nrpyFUZI6zeS+Li/wWMMidD9KgrqtGq3mA==",

-      "license": "Apache-2.0",

-      "engines": {

-        "node": "*"

-      }

-    },

-    "node_modules/aws4": {

-      "version": "1.13.2",

-      "resolved": "https://registry.npmjs.org/aws4/-/aws4-1.13.2.tgz",

-      "integrity": "sha512-lHe62zvbTB5eEABUVi/AwVh0ZKY9rMMDhmm+eeyuuUQbQ3+J+fONVQOZyj+DdrvD4BY33uYniyRJ4UJIaSKAfw==",

-      "license": "MIT"

-    },

-    "node_modules/base64-js": {

-      "version": "1.5.1",

-      "resolved": "https://registry.npmjs.org/base64-js/-/base64-js-1.5.1.tgz",

-      "integrity": "sha512-AKpaYlHn8t4SVbOHCy+b5+KKgvR4vrsD8vbvrbiQJps7fKDTkjkDry6ji0rUJjC0kzbNePLwzxq8iypo41qeWA==",

-      "funding": [

-        {

-          "type": "github",

-          "url": "https://github.com/sponsors/feross"

-        },

-        {

-          "type": "patreon",

-          "url": "https://www.patreon.com/feross"

-        },

-        {

-          "type": "consulting",

-          "url": "https://feross.org/support"

-        }

-      ],

-      "license": "MIT"

-    },

-    "node_modules/bcrypt-pbkdf": {

-      "version": "1.0.2",

-      "resolved": "https://registry.npmjs.org/bcrypt-pbkdf/-/bcrypt-pbkdf-1.0.2.tgz",

-      "integrity": "sha512-qeFIXtP4MSoi6NLqO12WfqARWWuCKi2Rn/9hJLEmtB5yTNr9DqFWkJRCf2qShWzPeAMRnOgCrq0sg/KLv5ES9w==",

-      "license": "BSD-3-Clause",

-      "dependencies": {

-        "tweetnacl": "^0.14.3"

-      }

-    },

-    "node_modules/better-ajv-errors": {

-      "version": "0.6.7",

-      "resolved": "https://registry.npmjs.org/better-ajv-errors/-/better-ajv-errors-0.6.7.tgz",

-      "integrity": "sha512-PYgt/sCzR4aGpyNy5+ViSQ77ognMnWq7745zM+/flYO4/Yisdtp9wDQW2IKCyVYPUxQt3E/b5GBSwfhd1LPdlg==",

-      "license": "Apache-2.0",

-      "dependencies": {

-        "@babel/code-frame": "^7.0.0",

-        "@babel/runtime": "^7.0.0",

-        "chalk": "^2.4.1",

-        "core-js": "^3.2.1",

-        "json-to-ast": "^2.0.3",

-        "jsonpointer": "^4.0.1",

-        "leven": "^3.1.0"

-      },

-      "peerDependencies": {

-        "ajv": "4.11.8 - 6"

-      }

-    },

-    "node_modules/bidi-js": {

-      "version": "1.1.0",

-      "resolved": "https://registry.npmjs.org/bidi-js/-/bidi-js-1.1.0.tgz",

-      "integrity": "sha512-fX1Onk0tdVPC7obPWB5EbJ1z7NVhLq4m2xZLq2YXBkxzMXIGRpNMU88n0EPgWseKl12J7zXs7qrDxPK4sRs2fg==",

-      "license": "MIT",

-      "dependencies": {

-        "require-from-string": "^2.0.2"

-      }

-    },

-    "node_modules/brotli": {

-      "version": "1.3.3",

-      "resolved": "https://registry.npmjs.org/brotli/-/brotli-1.3.3.tgz",

-      "integrity": "sha512-oTKjJdShmDuGW94SyyaoQvAjf30dZaHnjJ8uAF+u2/vGJkJbJPJAT1gDiOJP5v1Zb6f9KEyW/1HpuaWIXtGHPg==",

-      "license": "MIT",

-      "dependencies": {

-        "base64-js": "^1.1.2"

-      }

-    },

-    "node_modules/browserify-zlib": {

-      "version": "0.2.0",

-      "resolved": "https://registry.npmjs.org/browserify-zlib/-/browserify-zlib-0.2.0.tgz",

-      "integrity": "sha512-Z942RysHXmJrhqk88FmKBVq/v5tqmSkDz7p54G/MGyjMnCFFnC79XWNbg+Vta8W6Wb2qtSZTSxIGkJrRpCFEiA==",

-      "license": "MIT",

-      "dependencies": {

-        "pako": "~1.0.5"

-      }

-    },

-    "node_modules/busboy": {

-      "version": "1.6.0",

-      "resolved": "https://registry.npmjs.org/busboy/-/busboy-1.6.0.tgz",

-      "integrity": "sha512-8SFQbg/0hQ9xy3UNTB0YEnsNBbWfhf7RtnzpL7TkBiTBRfrQ9Fxcnz7VJsleJpyp6rVLvXiuORqjlHi5q+PYuA==",

-      "dependencies": {

-        "streamsearch": "^1.1.0"

-      },

-      "engines": {

-        "node": ">=10.16.0"

-      }

-    },

-    "node_modules/call-bind-apply-helpers": {

-      "version": "1.0.2",

-      "resolved": "https://registry.npmjs.org/call-bind-apply-helpers/-/call-bind-apply-helpers-1.0.2.tgz",

-      "integrity": "sha512-Sp1ablJ0ivDkSzjcaJdxEunN5/XvksFJ2sMBFfq6x0ryhQV/2b/KwFe21cMpmHtPOSij8K99/wSfoEuTObmuMQ==",

-      "license": "MIT",

-      "dependencies": {

-        "es-errors": "^1.3.0",

-        "function-bind": "^1.1.2"

-      },

-      "engines": {

-        "node": ">= 0.4"

-      }

-    },

-    "node_modules/call-bound": {

-      "version": "1.0.4",

-      "resolved": "https://registry.npmjs.org/call-bound/-/call-bound-1.0.4.tgz",

-      "integrity": "sha512-+ys997U96po4Kx/ABpBCqhA9EuxJaQWDQg7295H4hBphv3IZg0boBKuwYpt4YXp6MZ5AmZQnU/tyMTlRpaSejg==",

-      "license": "MIT",

-      "dependencies": {

-        "call-bind-apply-helpers": "^1.0.2",

-        "get-intrinsic": "^1.3.0"

-      },

-      "engines": {

-        "node": ">= 0.4"

-      },

-      "funding": {

-        "url": "https://github.com/sponsors/ljharb"

-      }

-    },

-    "node_modules/call-me-maybe": {

-      "version": "1.0.2",

-      "resolved": "https://registry.npmjs.org/call-me-maybe/-/call-me-maybe-1.0.2.tgz",

-      "integrity": "sha512-HpX65o1Hnr9HH25ojC1YGs7HCQLq0GCOibSaWER0eNpgJ/Z1MZv2mTc7+xh6WOPxbRVcmgbv4hGU+uSQ/2xFZQ==",

-      "license": "MIT"

-    },

-    "node_modules/camelcase": {

-      "version": "5.3.1",

-      "resolved": "https://registry.npmjs.org/camelcase/-/camelcase-5.3.1.tgz",

-      "integrity": "sha512-L28STB170nwWS63UjtlEOE3dldQApaJXZkOI1uMFfzf3rRuPegHaHesyee+YxQ+W6SvRDQV6UrdOdRiR153wJg==",

-      "license": "MIT",

-      "engines": {

-        "node": ">=6"

-      }

-    },

-    "node_modules/caniuse-lite": {

-      "version": "1.0.30001799",

-      "resolved": "https://registry.npmjs.org/caniuse-lite/-/caniuse-lite-1.0.30001799.tgz",

-      "integrity": "sha512-hG1bReV+OUU+MOqK4t/ZWI0tZOyz3rqS9XuhOUz1cIcbwBKjOyJEJuw9ER5JuNyqxNk8u/JUVbGibBOL1yrjFw==",

-      "funding": [

-        {

-          "type": "opencollective",

-          "url": "https://opencollective.com/browserslist"

-        },

-        {

-          "type": "tidelift",

-          "url": "https://tidelift.com/funding/github/npm/caniuse-lite"

-        },

-        {

-          "type": "github",

-          "url": "https://github.com/sponsors/ai"

-        }

-      ],

-      "license": "CC-BY-4.0"

-    },

-    "node_modules/caseless": {

-      "version": "0.12.0",

-      "resolved": "https://registry.npmjs.org/caseless/-/caseless-0.12.0.tgz",

-      "integrity": "sha512-4tYFyifaFfGacoiObjJegolkwSU4xQNGbVgUiNYVUxbQ2x2lUsFvY4hVgVzGiIe6WLOPqycWXA40l+PWsxthUw==",

-      "license": "Apache-2.0"

-    },

-    "node_modules/chalk": {

-      "version": "2.4.2",

-      "resolved": "https://registry.npmjs.org/chalk/-/chalk-2.4.2.tgz",

-      "integrity": "sha512-Mti+f9lpJNcwF4tWV8/OrTTtF1gZi+f8FqlyAdouralcFWFQWF2+NgCHShjkCb+IFBLq9buZwE1xckQU4peSuQ==",

-      "license": "MIT",

-      "dependencies": {

-        "ansi-styles": "^3.2.1",

-        "escape-string-regexp": "^1.0.5",

-        "supports-color": "^5.3.0"

-      },

-      "engines": {

-        "node": ">=4"

-      }

-    },

-    "node_modules/client-only": {

-      "version": "0.0.1",

-      "resolved": "https://registry.npmjs.org/client-only/-/client-only-0.0.1.tgz",

-      "integrity": "sha512-IV3Ou0jSMzZrd3pZ48nLkT9DA7Ag1pnPzaiQhpW7c3RbcqqzvzzVu+L8gfqMp/8IM2MQtSiqaCxrrcfu8I8rMA==",

-      "license": "MIT"

-    },

-    "node_modules/cliui": {

-      "version": "4.1.0",

-      "resolved": "https://registry.npmjs.org/cliui/-/cliui-4.1.0.tgz",

-      "integrity": "sha512-4FG+RSG9DL7uEwRUZXZn3SS34DiDPfzP0VOiEwtUWlE+AR2EIg+hSyvrIgUUfhdgR/UkAeW2QHgeP+hWrXs7jQ==",

-      "license": "ISC",

-      "dependencies": {

-        "string-width": "^2.1.1",

-        "strip-ansi": "^4.0.0",

-        "wrap-ansi": "^2.0.0"

-      }

-    },

-    "node_modules/clone": {

-      "version": "2.1.2",

-      "resolved": "https://registry.npmjs.org/clone/-/clone-2.1.2.tgz",

-      "integrity": "sha512-3Pe/CF1Nn94hyhIYpjtiLhdCoEoz0DqQ+988E9gmeEdQZlojxnOb74wctFyuwWQHzqyf9X7C7MG8juUpqBJT8w==",

-      "license": "MIT",

-      "engines": {

-        "node": ">=0.8"

-      }

-    },

-    "node_modules/co": {

-      "version": "4.6.0",

-      "resolved": "https://registry.npmjs.org/co/-/co-4.6.0.tgz",

-      "integrity": "sha512-QVb0dM5HvG+uaxitm8wONl7jltx8dqhfU33DcqtOZcLSVIKSDDLDi7+0LbAKiyI8hD9u42m2YxXSkMGWThaecQ==",

-      "license": "MIT",

-      "engines": {

-        "iojs": ">= 1.0.0",

-        "node": ">= 0.12.0"

-      }

-    },

-    "node_modules/code-error-fragment": {

-      "version": "0.0.230",

-      "resolved": "https://registry.npmjs.org/code-error-fragment/-/code-error-fragment-0.0.230.tgz",

-      "integrity": "sha512-cadkfKp6932H8UkhzE/gcUqhRMNf8jHzkAN7+5Myabswaghu4xABTgPHDCjW+dBAJxj/SpkTYokpzDqY4pCzQw==",

-      "license": "MIT",

-      "engines": {

-        "node": ">= 4"

-      }

-    },

-    "node_modules/code-point-at": {

-      "version": "1.1.0",

-      "resolved": "https://registry.npmjs.org/code-point-at/-/code-point-at-1.1.0.tgz",

-      "integrity": "sha512-RpAVKQA5T63xEj6/giIbUEtZwJ4UFIc3ZtvEkiaUERylqe8xb5IvqcgOurZLahv93CLKfxcw5YI+DZcUBRyLXA==",

-      "license": "MIT",

-      "engines": {

-        "node": ">=0.10.0"

-      }

-    },

-    "node_modules/color-convert": {

-      "version": "1.9.3",

-      "resolved": "https://registry.npmjs.org/color-convert/-/color-convert-1.9.3.tgz",

-      "integrity": "sha512-QfAUtd+vFdAtFQcC8CCyYt1fYWxSqAiK2cSD6zDB8N3cpsEBAvRxp9zOGg6G/SHHJYAT88/az/IuDGALsNVbGg==",

-      "license": "MIT",

-      "dependencies": {

-        "color-name": "1.1.3"

-      }

-    },

-    "node_modules/color-convert/node_modules/color-name": {

-      "version": "1.1.3",

-      "resolved": "https://registry.npmjs.org/color-name/-/color-name-1.1.3.tgz",

-      "integrity": "sha512-72fSenhMw2HZMTVHeCA9KCmpEIbzWiQsjN+BHcBbS9vr1mtt+vJjPdksIBNUmKAW8TFUDPJK5SUU3QhE9NEXDw==",

-      "license": "MIT"

-    },

-    "node_modules/color-name": {

-      "version": "1.1.4",

-      "resolved": "https://registry.npmjs.org/color-name/-/color-name-1.1.4.tgz",

-      "integrity": "sha512-dOy+3AuW3a2wNbZHIuMZpTcgjGuLU/uBL/ubcZF9OXbDo8ff4O8yVp5Bf0efS8uEoYo5q4Fx7dY9OgQGXgAsQA==",

-      "license": "MIT"

-    },

-    "node_modules/color-string": {

-      "version": "2.1.4",

-      "resolved": "https://registry.npmjs.org/color-string/-/color-string-2.1.4.tgz",

-      "integrity": "sha512-Bb6Cq8oq0IjDOe8wJmi4JeNn763Xs9cfrBcaylK1tPypWzyoy2G3l90v9k64kjphl/ZJjPIShFztenRomi8WTg==",

-      "license": "MIT",

-      "dependencies": {

-        "color-name": "^2.0.0"

-      },

-      "engines": {

-        "node": ">=18"

-      }

-    },

-    "node_modules/color-string/node_modules/color-name": {

-      "version": "2.1.1",

-      "resolved": "https://registry.npmjs.org/color-name/-/color-name-2.1.1.tgz",

-      "integrity": "sha512-p2FdgwVx1a9yWBHP2wI0VgShkDpgN4kZISkxdNipGBJWpa5G6b04OINlVWCyJj0JmfvcPrgqt95E9k8yvaOJFg==",

-      "license": "MIT",

-      "engines": {

-        "node": ">=12.20"

-      }

-    },

-    "node_modules/colorful": {

-      "version": "2.1.0",

-      "resolved": "https://registry.npmjs.org/colorful/-/colorful-2.1.0.tgz",

-      "integrity": "sha512-DpDLDvi/vPzqoPX7Dw44ZZf004DCdEcCx1pf5hq5aipVHXjwgRSYGCz3m17rA2XCduW91wJUapge8/3qLvjYcg=="

-    },

-    "node_modules/combined-stream": {

-      "version": "1.0.8",

-      "resolved": "https://registry.npmjs.org/combined-stream/-/combined-stream-1.0.8.tgz",

-      "integrity": "sha512-FQN4MRfuJeHf7cBbBMJFXhKSDq+2kAArBlmRBvcvFE5BB1HZKXtSFASDhdlz9zOYwxh8lDdnvmMOe/+5cdoEdg==",

-      "license": "MIT",

-      "dependencies": {

-        "delayed-stream": "~1.0.0"

-      },

-      "engines": {

-        "node": ">= 0.8"

-      }

-    },

-    "node_modules/commander": {

-      "version": "2.20.3",

-      "resolved": "https://registry.npmjs.org/commander/-/commander-2.20.3.tgz",

-      "integrity": "sha512-GpVkmM8vF2vQUkj2LvZmD35JxeJOLCwJ9cUkugyk2nuhbv3+mJvpLYYt+0+USMxE+oj+ey/lJEnhZw75x/OMcQ==",

-      "license": "MIT"

-    },

-    "node_modules/cookie": {

-      "version": "1.1.1",

-      "resolved": "https://registry.npmjs.org/cookie/-/cookie-1.1.1.tgz",

-      "integrity": "sha512-ei8Aos7ja0weRpFzJnEA9UHJ/7XQmqglbRwnf2ATjcB9Wq874VKH9kfjjirM6UhU2/E5fFYadylyhFldcqSidQ==",

-      "license": "MIT",

-      "engines": {

-        "node": ">=18"

-      },

-      "funding": {

-        "type": "opencollective",

-        "url": "https://opencollective.com/express"

-      }

-    },

-    "node_modules/core-js": {

-      "version": "3.49.0",

-      "resolved": "https://registry.npmjs.org/core-js/-/core-js-3.49.0.tgz",

-      "integrity": "sha512-es1U2+YTtzpwkxVLwAFdSpaIMyQaq0PBgm3YD1W3Qpsn1NAmO3KSgZfu+oGSWVu6NvLHoHCV/aYcsE5wiB7ALg==",

-      "hasInstallScript": true,

-      "license": "MIT",

-      "funding": {

-        "type": "opencollective",

-        "url": "https://opencollective.com/core-js"

-      }

-    },

-    "node_modules/core-util-is": {

-      "version": "1.0.3",

-      "resolved": "https://registry.npmjs.org/core-util-is/-/core-util-is-1.0.3.tgz",

-      "integrity": "sha512-ZQBvi1DcpJ4GDqanjucZ2Hj3wEO5pZDS89BWbkcrvdxksJorwUDDZamX9ldFkp9aw2lmBDLgkObEA4DWNJ9FYQ==",

-      "license": "MIT"

-    },

-    "node_modules/cross-spawn": {

-      "version": "6.0.6",

-      "resolved": "https://registry.npmjs.org/cross-spawn/-/cross-spawn-6.0.6.tgz",

-      "integrity": "sha512-VqCUuhcd1iB+dsv8gxPttb5iZh/D0iubSP21g36KXdEuf6I5JiioesUVjpCdHV9MZRUfVFlvwtIUyPfxo5trtw==",

-      "license": "MIT",

-      "dependencies": {

-        "nice-try": "^1.0.4",

-        "path-key": "^2.0.1",

-        "semver": "^5.5.0",

-        "shebang-command": "^1.2.0",

-        "which": "^1.2.9"

-      },

-      "engines": {

-        "node": ">=4.8"

-      }

-    },

-    "node_modules/csstype": {

-      "version": "3.2.3",

-      "resolved": "https://registry.npmjs.org/csstype/-/csstype-3.2.3.tgz",

-      "integrity": "sha512-z1HGKcYy2xA8AGQfwrn0PAy+PB7X/GSj3UVJW9qKyn43xWa+gl5nXmU4qqLMRzWVLFC8KusUX8T/0kCiOYpAIQ==",

-      "dev": true,

-      "license": "MIT"

-    },

-    "node_modules/dashdash": {

-      "version": "1.14.1",

-      "resolved": "https://registry.npmjs.org/dashdash/-/dashdash-1.14.1.tgz",

-      "integrity": "sha512-jRFi8UDGo6j+odZiEpjazZaWqEal3w/basFjQHQEwVtZJGDpxbH1MeYluwCS8Xq5wmLJooDlMgvVarmWfGM44g==",

-      "license": "MIT",

-      "dependencies": {

-        "assert-plus": "^1.0.0"

-      },

-      "engines": {

-        "node": ">=0.10"

-      }

-    },

-    "node_modules/debug": {

-      "version": "4.4.3",

-      "resolved": "https://registry.npmjs.org/debug/-/debug-4.4.3.tgz",

-      "integrity": "sha512-RGwwWnwQvkVfavKVt22FGLw+xYSdzARwm0ru6DhTVA3umU5hZc28V3kO4stgYryrTlLpuvgI9GiijltAjNbcqA==",

-      "license": "MIT",

-      "dependencies": {

-        "ms": "^2.1.3"

-      },

-      "engines": {

-        "node": ">=6.0"

-      },

-      "peerDependenciesMeta": {

-        "supports-color": {

-          "optional": true

-        }

-      }

-    },

-    "node_modules/decamelize": {

-      "version": "1.2.0",

-      "resolved": "https://registry.npmjs.org/decamelize/-/decamelize-1.2.0.tgz",

-      "integrity": "sha512-z2S+W9X73hAUUki+N+9Za2lBlun89zigOyGrsax+KUQ6wKW4ZoWpEYBkGhQjwAjjDCkWxhY0VKEhk8wzY7F5cA==",

-      "license": "MIT",

-      "engines": {

-        "node": ">=0.10.0"

-      }

-    },

-    "node_modules/delayed-stream": {

-      "version": "1.0.0",

-      "resolved": "https://registry.npmjs.org/delayed-stream/-/delayed-stream-1.0.0.tgz",

-      "integrity": "sha512-ZySD7Nf91aLB0RxL4KGrKHBXl7Eds1DAmEdcoVawXnLD7SDhpNgtuII2aAkg7a7QS41jxPSZ17p4VdGnMHk3MQ==",

-      "license": "MIT",

-      "engines": {

-        "node": ">=0.4.0"

-      }

-    },

-    "node_modules/dfa": {

-      "version": "1.2.0",

-      "resolved": "https://registry.npmjs.org/dfa/-/dfa-1.2.0.tgz",

-      "integrity": "sha512-ED3jP8saaweFTjeGX8HQPjeC1YYyZs98jGNZx6IiBvxW7JG5v492kamAQB3m2wop07CvU/RQmzcKr6bgcC5D/Q==",

-      "license": "MIT"

-    },

-    "node_modules/dunder-proto": {

-      "version": "1.0.1",

-      "resolved": "https://registry.npmjs.org/dunder-proto/-/dunder-proto-1.0.1.tgz",

-      "integrity": "sha512-KIN/nDJBQRcXw0MLVhZE9iQHmG68qAVIBg9CqmUYjmQIhgij9U5MFvrqkUL5FbtyyzZuOeOt0zdeRe4UY7ct+A==",

-      "license": "MIT",

-      "dependencies": {

-        "call-bind-apply-helpers": "^1.0.1",

-        "es-errors": "^1.3.0",

-        "gopd": "^1.2.0"

-      },

-      "engines": {

-        "node": ">= 0.4"

-      }

-    },

-    "node_modules/ecc-jsbn": {

-      "version": "0.1.2",

-      "resolved": "https://registry.npmjs.org/ecc-jsbn/-/ecc-jsbn-0.1.2.tgz",

-      "integrity": "sha512-eh9O+hwRHNbG4BLTjEl3nw044CkGm5X6LoaCf7LPp7UU8Qrt47JYNi6nPX8xjW97TKGKm1ouctg0QSpZe9qrnw==",

-      "license": "MIT",

-      "dependencies": {

-        "jsbn": "~0.1.0",

-        "safer-buffer": "^2.1.0"

-      }

-    },

-    "node_modules/emoji-regex": {

-      "version": "8.0.0",

-      "resolved": "https://registry.npmjs.org/emoji-regex/-/emoji-regex-8.0.0.tgz",

-      "integrity": "sha512-MSjYzcWNOA0ewAHpz0MxpYFvwg6yjy1NG3xteoqz644VCo/RPgnr1/GGt+ic3iJTzQ8Eu3TdM14SawnVUmGE6A==",

-      "license": "MIT"

-    },

-    "node_modules/emoji-regex-xs": {

-      "version": "1.0.0",

-      "resolved": "https://registry.npmjs.org/emoji-regex-xs/-/emoji-regex-xs-1.0.0.tgz",

-      "integrity": "sha512-LRlerrMYoIDrT6jgpeZ2YYl/L8EulRTt5hQcYjy5AInh7HWXKimpqx68aknBFpGL2+/IcogTcaydJEgaTmOpDg==",

-      "license": "MIT"

-    },

-    "node_modules/end-of-stream": {

-      "version": "1.4.5",

-      "resolved": "https://registry.npmjs.org/end-of-stream/-/end-of-stream-1.4.5.tgz",

-      "integrity": "sha512-ooEGc6HP26xXq/N+GCGOT0JKCLDGrq2bQUZrQ7gyrJiZANJ/8YDTxTpQBXGMn+WbIQXNVpyWymm7KYVICQnyOg==",

-      "license": "MIT",

-      "dependencies": {

-        "once": "^1.4.0"

-      }

-    },

-    "node_modules/es-define-property": {

-      "version": "1.0.1",

-      "resolved": "https://registry.npmjs.org/es-define-property/-/es-define-property-1.0.1.tgz",

-      "integrity": "sha512-e3nRfgfUZ4rNGL232gUgX06QNyyez04KdjFrF+LTRoOXmrOgFKDg4BCdsjW8EnT69eqdYGmRpJwiPVYNrCaW3g==",

-      "license": "MIT",

-      "engines": {

-        "node": ">= 0.4"

-      }

-    },

-    "node_modules/es-errors": {

-      "version": "1.3.0",

-      "resolved": "https://registry.npmjs.org/es-errors/-/es-errors-1.3.0.tgz",

-      "integrity": "sha512-Zf5H2Kxt2xjTvbJvP2ZWLEICxA6j+hAmMzIlypy4xcBg1vKVnx89Wy0GbS+kf5cwCVFFzdCFh2XSCFNULS6csw==",

-      "license": "MIT",

-      "engines": {

-        "node": ">= 0.4"

-      }

-    },

-    "node_modules/es-object-atoms": {

-      "version": "1.1.2",

-      "resolved": "https://registry.npmjs.org/es-object-atoms/-/es-object-atoms-1.1.2.tgz",

-      "integrity": "sha512-HWcBoN6NileqtSydK2FqHbS/LoDd2pqrnQHLyJzBj4kOp/ky2MWMN694xOfkK8/SnUsW2DH7EfyVlydKCsm1Zw==",

-      "license": "MIT",

-      "dependencies": {

-        "es-errors": "^1.3.0"

-      },

-      "engines": {

-        "node": ">= 0.4"

-      }

-    },

-    "node_modules/es-set-tostringtag": {

-      "version": "2.1.0",

-      "resolved": "https://registry.npmjs.org/es-set-tostringtag/-/es-set-tostringtag-2.1.0.tgz",

-      "integrity": "sha512-j6vWzfrGVfyXxge+O0x5sh6cvxAog0a/4Rdd2K36zCMV5eJ+/+tOAngRO8cODMNWbVRdVlmGZQL2YS3yR8bIUA==",

-      "license": "MIT",

-      "dependencies": {

-        "es-errors": "^1.3.0",

-        "get-intrinsic": "^1.2.6",

-        "has-tostringtag": "^1.0.2",

-        "hasown": "^2.0.2"

-      },

-      "engines": {

-        "node": ">= 0.4"

-      }

-    },

-    "node_modules/es6-promise": {

-      "version": "3.3.1",

-      "resolved": "https://registry.npmjs.org/es6-promise/-/es6-promise-3.3.1.tgz",

-      "integrity": "sha512-SOp9Phqvqn7jtEUxPWdWfWoLmyt2VaJ6MpvP9Comy1MceMXqE6bxvaTu4iaxpYYPzhny28Lc+M87/c2cPK6lDg==",

-      "license": "MIT"

-    },

-    "node_modules/escalade": {

-      "version": "3.2.0",

-      "resolved": "https://registry.npmjs.org/escalade/-/escalade-3.2.0.tgz",

-      "integrity": "sha512-WUj2qlxaQtO4g6Pq5c29GTcWGDyd8itL8zTlipgECz3JesAiiOKotd8JU6otB3PACgG6xkJUyVhboMS+bje/jA==",

-      "license": "MIT",

-      "engines": {

-        "node": ">=6"

-      }

-    },

-    "node_modules/escape-string-regexp": {

-      "version": "1.0.5",

-      "resolved": "https://registry.npmjs.org/escape-string-regexp/-/escape-string-regexp-1.0.5.tgz",

-      "integrity": "sha512-vbRorB5FUQWvla16U8R/qgaFIya2qGzwDrNmCZuYKrbdSUMG6I1ZCGQRefkRVhuOkIGVne7BQ35DSfo1qvJqFg==",

-      "license": "MIT",

-      "engines": {

-        "node": ">=0.8.0"

-      }

-    },

-    "node_modules/events": {

-      "version": "3.3.0",

-      "resolved": "https://registry.npmjs.org/events/-/events-3.3.0.tgz",

-      "integrity": "sha512-mQw+2fkQbALzQ7V0MY0IqdnXNOeTtP4r0lN9z7AAawCXgqea7bDii20AYrIBrFd/Hx0M2Ocz6S111CaFkUcb0Q==",

-      "license": "MIT",

-      "engines": {

-        "node": ">=0.8.x"

-      }

-    },

-    "node_modules/execa": {

-      "version": "1.0.0",

-      "resolved": "https://registry.npmjs.org/execa/-/execa-1.0.0.tgz",

-      "integrity": "sha512-adbxcyWV46qiHyvSp50TKt05tB4tK3HcmF7/nxfAdhnox83seTDbwnaqKO4sXRy7roHAIFqJP/Rw/AuEbX61LA==",

-      "license": "MIT",

-      "dependencies": {

-        "cross-spawn": "^6.0.0",

-        "get-stream": "^4.0.0",

-        "is-stream": "^1.1.0",

-        "npm-run-path": "^2.0.0",

-        "p-finally": "^1.0.0",

-        "signal-exit": "^3.0.0",

-        "strip-eof": "^1.0.0"

-      },

-      "engines": {

-        "node": ">=6"

-      }

-    },

-    "node_modules/extend": {

-      "version": "3.0.2",

-      "resolved": "https://registry.npmjs.org/extend/-/extend-3.0.2.tgz",

-      "integrity": "sha512-fjquC59cD7CyW6urNXK0FBufkZcoiGG80wTuPujX590cB5Ttln20E2UB4S/WARVqhXffZl2LNgS+gQdPIIim/g==",

-      "license": "MIT"

-    },

-    "node_modules/extsprintf": {

-      "version": "1.4.1",

-      "resolved": "https://registry.npmjs.org/extsprintf/-/extsprintf-1.4.1.tgz",

-      "integrity": "sha512-Wrk35e8ydCKDj/ArClo1VrPVmN8zph5V4AtHwIuHhvMXsKf73UT3BOD+azBIW+3wOJ4FhEH7zyaJCFvChjYvMA==",

-      "engines": [

-        "node >=0.6.0"

-      ],

-      "license": "MIT"

-    },

-    "node_modules/fast-deep-equal": {

-      "version": "3.1.3",

-      "resolved": "https://registry.npmjs.org/fast-deep-equal/-/fast-deep-equal-3.1.3.tgz",

-      "integrity": "sha512-f3qQ9oQy9j2AhBe/H9VC91wLmKBCCU/gDOnKNAYG5hswO7BLKj09Hc5HYNz9cGI++xlpDCIgDaitVs03ATR84Q==",

-      "license": "MIT"

-    },

-    "node_modules/fast-json-stable-stringify": {

-      "version": "2.1.0",

-      "resolved": "https://registry.npmjs.org/fast-json-stable-stringify/-/fast-json-stable-stringify-2.1.0.tgz",

-      "integrity": "sha512-lhd/wF+Lk98HZoTCtlVraHtfh5XYijIjalXck7saUtuanSDyLMxnHhSXEDJqHxD7msR8D0uCmqlkwjCV8xvwHw==",

-      "license": "MIT"

-    },

-    "node_modules/fast-safe-stringify": {

-      "version": "2.1.1",

-      "resolved": "https://registry.npmjs.org/fast-safe-stringify/-/fast-safe-stringify-2.1.1.tgz",

-      "integrity": "sha512-W+KJc2dmILlPplD/H4K9l9LcAHAfPtP6BY84uVLXQ6Evcz9Lcg33Y2z1IVblT6xdY54PXYVHEv+0Wpq8Io6zkA==",

-      "license": "MIT"

-    },

-    "node_modules/fflate": {

-      "version": "0.8.3",

-      "resolved": "https://registry.npmjs.org/fflate/-/fflate-0.8.3.tgz",

-      "integrity": "sha512-tbZNuJrLwGUp3zshBtdy4W+ORxZuIh8a5ilyIEQDC5rY1f3U20JMry0Ll3WBzU58EZKsEuJFXhb5gwv8CsPvgA==",

-      "license": "MIT"

-    },

-    "node_modules/find-up": {

-      "version": "3.0.0",

-      "resolved": "https://registry.npmjs.org/find-up/-/find-up-3.0.0.tgz",

-      "integrity": "sha512-1yD6RmLI1XBfxugvORwlck6f75tYL+iR0jqwsOrOxMZyGYqUuDhJ0l4AXdO1iX/FTs9cBAMEk1gWSEx1kSbylg==",

-      "license": "MIT",

-      "dependencies": {

-        "locate-path": "^3.0.0"

-      },

-      "engines": {

-        "node": ">=6"

-      }

-    },

-    "node_modules/fontkit": {

-      "version": "2.0.4",

-      "resolved": "https://registry.npmjs.org/fontkit/-/fontkit-2.0.4.tgz",

-      "integrity": "sha512-syetQadaUEDNdxdugga9CpEYVaQIxOwk7GlwZWWZ19//qW4zE5bknOKeMBDYAASwnpaSHKJITRLMF9m1fp3s6g==",

-      "license": "MIT",

-      "dependencies": {

-        "@swc/helpers": "^0.5.12",

-        "brotli": "^1.3.2",

-        "clone": "^2.1.2",

-        "dfa": "^1.2.0",

-        "fast-deep-equal": "^3.1.3",

-        "restructure": "^3.0.0",

-        "tiny-inflate": "^1.0.3",

-        "unicode-properties": "^1.4.0",

-        "unicode-trie": "^2.0.0"

-      }

-    },

-    "node_modules/fontkit/node_modules/@swc/helpers": {

-      "version": "0.5.23",

-      "resolved": "https://registry.npmjs.org/@swc/helpers/-/helpers-0.5.23.tgz",

-      "integrity": "sha512-5lSsMOTXURePglDfvuAQUqkGek9Hg2kksOYay2m0+XR++b2NWYL/4sWyuvVBIs8oKnJaxkdi9whaL/sqN13afw==",

-      "license": "Apache-2.0",

-      "dependencies": {

-        "tslib": "^2.8.0"

-      }

-    },

-    "node_modules/fontkit/node_modules/tslib": {

-      "version": "2.8.1",

-      "resolved": "https://registry.npmjs.org/tslib/-/tslib-2.8.1.tgz",

-      "integrity": "sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w==",

-      "license": "0BSD"

-    },

-    "node_modules/forever-agent": {

-      "version": "0.6.1",

-      "resolved": "https://registry.npmjs.org/forever-agent/-/forever-agent-0.6.1.tgz",

-      "integrity": "sha512-j0KLYPhm6zeac4lz3oJ3o65qvgQCcPubiyotZrXqEaG4hNagNYO8qdlUrX5vwqv9ohqeT/Z3j6+yW067yWWdUw==",

-      "license": "Apache-2.0",

-      "engines": {

-        "node": "*"

-      }

-    },

-    "node_modules/form-data": {

-      "version": "2.5.6",

-      "resolved": "https://registry.npmjs.org/form-data/-/form-data-2.5.6.tgz",

-      "integrity": "sha512-Ogz/E85h9tlfJzpI6TuFpGcHZFhLrb9Gw8wq9v40CxSCPnv7ahKr6Xgtkn0KYCDQJ8DNn5VoMO8EXr9V5PadyA==",

-      "license": "MIT",

-      "dependencies": {

-        "asynckit": "^0.4.0",

-        "combined-stream": "^1.0.8",

-        "es-set-tostringtag": "^2.1.0",

-        "hasown": "^2.0.4",

-        "mime-types": "^2.1.35",

-        "safe-buffer": "^5.2.1"

-      },

-      "engines": {

-        "node": ">= 0.12"

-      }

-    },

-    "node_modules/function-bind": {

-      "version": "1.1.2",

-      "resolved": "https://registry.npmjs.org/function-bind/-/function-bind-1.1.2.tgz",

-      "integrity": "sha512-7XHNxH7qX9xG5mIwxkhumTox/MIRNcOgDrxWsMt2pAr23WHp6MrRlN7FBSFpCpr+oVO0F744iUgR82nJMfG2SA==",

-      "license": "MIT",

-      "funding": {

-        "url": "https://github.com/sponsors/ljharb"

-      }

-    },

-    "node_modules/get-caller-file": {

-      "version": "1.0.3",

-      "resolved": "https://registry.npmjs.org/get-caller-file/-/get-caller-file-1.0.3.tgz",

-      "integrity": "sha512-3t6rVToeoZfYSGd8YoLFR2DJkiQrIiUrGcjvFX2mDw3bn6k2OtwHN0TNCLbBO+w8qTvimhDkv+LSscbJY1vE6w==",

-      "license": "ISC"

-    },

-    "node_modules/get-intrinsic": {

-      "version": "1.3.0",

-      "resolved": "https://registry.npmjs.org/get-intrinsic/-/get-intrinsic-1.3.0.tgz",

-      "integrity": "sha512-9fSjSaos/fRIVIp+xSJlE6lfwhES7LNtKaCBIamHsjr2na1BiABJPo0mOjjz8GJDURarmCPGqaiVg5mfjb98CQ==",

-      "license": "MIT",

-      "dependencies": {

-        "call-bind-apply-helpers": "^1.0.2",

-        "es-define-property": "^1.0.1",

-        "es-errors": "^1.3.0",

-        "es-object-atoms": "^1.1.1",

-        "function-bind": "^1.1.2",

-        "get-proto": "^1.0.1",

-        "gopd": "^1.2.0",

-        "has-symbols": "^1.1.0",

-        "hasown": "^2.0.2",

-        "math-intrinsics": "^1.1.0"

-      },

-      "engines": {

-        "node": ">= 0.4"

-      },

-      "funding": {

-        "url": "https://github.com/sponsors/ljharb"

-      }

-    },

-    "node_modules/get-proto": {

-      "version": "1.0.1",

-      "resolved": "https://registry.npmjs.org/get-proto/-/get-proto-1.0.1.tgz",

-      "integrity": "sha512-sTSfBjoXBp89JvIKIefqw7U2CCebsc74kiY6awiGogKtoSGbgjYE/G/+l9sF3MWFPNc9IcoOC4ODfKHfxFmp0g==",

-      "license": "MIT",

-      "dependencies": {

-        "dunder-proto": "^1.0.1",

-        "es-object-atoms": "^1.0.0"

-      },

-      "engines": {

-        "node": ">= 0.4"

-      }

-    },

-    "node_modules/get-stream": {

-      "version": "4.1.0",

-      "resolved": "https://registry.npmjs.org/get-stream/-/get-stream-4.1.0.tgz",

-      "integrity": "sha512-GMat4EJ5161kIy2HevLlr4luNjBgvmj413KaQA7jt4V8B4RDsfpHk7WQ9GVqfYyyx8OS/L66Kox+rJRNklLK7w==",

-      "license": "MIT",

-      "dependencies": {

-        "pump": "^3.0.0"

-      },

-      "engines": {

-        "node": ">=6"

-      }

-    },

-    "node_modules/getpass": {

-      "version": "0.1.7",

-      "resolved": "https://registry.npmjs.org/getpass/-/getpass-0.1.7.tgz",

-      "integrity": "sha512-0fzj9JxOLfJ+XGLhR8ze3unN0KZCgZwiSSDz168VERjK8Wl8kVSdcu2kspd4s4wtAa1y/qrVRiAA0WclVsu0ng==",

-      "license": "MIT",

-      "dependencies": {

-        "assert-plus": "^1.0.0"

-      }

-    },

-    "node_modules/gopd": {

-      "version": "1.2.0",

-      "resolved": "https://registry.npmjs.org/gopd/-/gopd-1.2.0.tgz",

-      "integrity": "sha512-ZUKRh6/kUFoAiTAtTYPZJ3hw9wNxx+BIBOijnlG9PnrJsCcSjs1wyyD6vJpaYtgnzDrKYRSqf3OO6Rfa93xsRg==",

-      "license": "MIT",

-      "engines": {

-        "node": ">= 0.4"

-      },

-      "funding": {

-        "url": "https://github.com/sponsors/ljharb"

-      }

-    },

-    "node_modules/graceful-fs": {

-      "version": "4.2.11",

-      "resolved": "https://registry.npmjs.org/graceful-fs/-/graceful-fs-4.2.11.tgz",

-      "integrity": "sha512-RbJ5/jmFcNNCcDV5o9eTnBLJ/HszWV0P73bc+Ff4nS/rJj+YaS6IGyiOL0VoBYX+l1Wrl3k63h/KrH+nhJ0XvQ==",

-      "license": "ISC"

-    },

-    "node_modules/grapheme-splitter": {

-      "version": "1.0.4",

-      "resolved": "https://registry.npmjs.org/grapheme-splitter/-/grapheme-splitter-1.0.4.tgz",

-      "integrity": "sha512-bzh50DW9kTPM00T8y4o8vQg89Di9oLJVLW/KaOGIXJWP/iqCN6WKYkbNOF04vFLJhwcpYUh9ydh/+5vpOqV4YQ==",

-      "license": "MIT"

-    },

-    "node_modules/har-schema": {

-      "version": "2.0.0",

-      "resolved": "https://registry.npmjs.org/har-schema/-/har-schema-2.0.0.tgz",

-      "integrity": "sha512-Oqluz6zhGX8cyRaTQlFMPw80bSJVG2x/cFb8ZPhUILGgHka9SsokCCOQgpveePerqidZOrT14ipqfJb7ILcW5Q==",

-      "license": "ISC",

-      "engines": {

-        "node": ">=4"

-      }

-    },

-    "node_modules/har-validator": {

-      "version": "5.1.5",

-      "resolved": "https://registry.npmjs.org/har-validator/-/har-validator-5.1.5.tgz",

-      "integrity": "sha512-nmT2T0lljbxdQZfspsno9hgrG3Uir6Ks5afism62poxqBM6sDnMEuPmzTq8XN0OEwqKLLdh1jQI3qyE66Nzb3w==",

-      "deprecated": "this library is no longer supported",

-      "license": "MIT",

-      "dependencies": {

-        "ajv": "^6.12.3",

-        "har-schema": "^2.0.0"

-      },

-      "engines": {

-        "node": ">=6"

-      }

-    },

-    "node_modules/has-flag": {

-      "version": "3.0.0",

-      "resolved": "https://registry.npmjs.org/has-flag/-/has-flag-3.0.0.tgz",

-      "integrity": "sha512-sKJf1+ceQBr4SMkvQnBDNDtf4TXpVhVGateu0t918bl30FnbE2m4vNLX+VWe/dpjlb+HugGYzW7uQXH98HPEYw==",

-      "license": "MIT",

-      "engines": {

-        "node": ">=4"

-      }

-    },

-    "node_modules/has-symbols": {

-      "version": "1.1.0",

-      "resolved": "https://registry.npmjs.org/has-symbols/-/has-symbols-1.1.0.tgz",

-      "integrity": "sha512-1cDNdwJ2Jaohmb3sg4OmKaMBwuC48sYni5HUw2DvsC8LjGTLK9h+eb1X6RyuOHe4hT0ULCW68iomhjUoKUqlPQ==",

-      "license": "MIT",

-      "engines": {

-        "node": ">= 0.4"

-      },

-      "funding": {

-        "url": "https://github.com/sponsors/ljharb"

-      }

-    },

-    "node_modules/has-tostringtag": {

-      "version": "1.0.2",

-      "resolved": "https://registry.npmjs.org/has-tostringtag/-/has-tostringtag-1.0.2.tgz",

-      "integrity": "sha512-NqADB8VjPFLM2V0VvHUewwwsw0ZWBaIdgo+ieHtK3hasLz4qeCRjYcqfB6AQrBggRKppKF8L52/VqdVsO47Dlw==",

-      "license": "MIT",

-      "dependencies": {

-        "has-symbols": "^1.0.3"

-      },

-      "engines": {

-        "node": ">= 0.4"

-      },

-      "funding": {

-        "url": "https://github.com/sponsors/ljharb"

-      }

-    },

-    "node_modules/hasown": {

-      "version": "2.0.4",

-      "resolved": "https://registry.npmjs.org/hasown/-/hasown-2.0.4.tgz",

-      "integrity": "sha512-T2UbfbBEF32wiepXIsMlTW9+dDYC6wMh/t/vYA4tuOMKqWz/n3vr1NFSxQiyP+zk2mXsoMA/i/7qV6LKut1t1A==",

-      "license": "MIT",

-      "dependencies": {

-        "function-bind": "^1.1.2"

-      },

-      "engines": {

-        "node": ">= 0.4"

-      }

-    },

-    "node_modules/hsl-to-hex": {

-      "version": "1.0.0",

-      "resolved": "https://registry.npmjs.org/hsl-to-hex/-/hsl-to-hex-1.0.0.tgz",

-      "integrity": "sha512-K6GVpucS5wFf44X0h2bLVRDsycgJmf9FF2elg+CrqD8GcFU8c6vYhgXn8NjUkFCwj+xDFb70qgLbTUm6sxwPmA==",

-      "license": "MIT",

-      "dependencies": {

-        "hsl-to-rgb-for-reals": "^1.1.0"

-      }

-    },

-    "node_modules/hsl-to-rgb-for-reals": {

-      "version": "1.1.1",

-      "resolved": "https://registry.npmjs.org/hsl-to-rgb-for-reals/-/hsl-to-rgb-for-reals-1.1.1.tgz",

-      "integrity": "sha512-LgOWAkrN0rFaQpfdWBQlv/VhkOxb5AsBjk6NQVx4yEzWS923T07X0M1Y0VNko2H52HeSpZrZNNMJ0aFqsdVzQg==",

-      "license": "ISC"

-    },

-    "node_modules/http-signature": {

-      "version": "1.4.0",

-      "resolved": "https://registry.npmjs.org/http-signature/-/http-signature-1.4.0.tgz",

-      "integrity": "sha512-G5akfn7eKbpDN+8nPS/cb57YeA1jLTVxjpCj7tmm3QKPdyDy7T+qSC40e9ptydSWvkwjSXw1VbkpyEm39ukeAg==",

-      "license": "MIT",

-      "dependencies": {

-        "assert-plus": "^1.0.0",

-        "jsprim": "^2.0.2",

-        "sshpk": "^1.18.0"

-      },

-      "engines": {

-        "node": ">=0.10"

-      }

-    },

-    "node_modules/http-signature/node_modules/core-util-is": {

-      "version": "1.0.2",

-      "resolved": "https://registry.npmjs.org/core-util-is/-/core-util-is-1.0.2.tgz",

-      "integrity": "sha512-3lqz5YjWTYnW6dlDa5TLaTCcShfar1e40rmcJVwCBJC6mWlFuj0eCHIElmG1g5kyuJ/GD+8Wn4FFCcz4gJPfaQ==",

-      "license": "MIT"

-    },

-    "node_modules/http-signature/node_modules/extsprintf": {

-      "version": "1.3.0",

-      "resolved": "https://registry.npmjs.org/extsprintf/-/extsprintf-1.3.0.tgz",

-      "integrity": "sha512-11Ndz7Nv+mvAC1j0ktTa7fAb0vLyGGX+rMHNBYQviQDGU0Hw7lhctJANqbPhu9nV9/izT/IntTgZ7Im/9LJs9g==",

-      "engines": [

-        "node >=0.6.0"

-      ],

-      "license": "MIT"

-    },

-    "node_modules/http-signature/node_modules/jsprim": {

-      "version": "2.0.2",

-      "resolved": "https://registry.npmjs.org/jsprim/-/jsprim-2.0.2.tgz",

-      "integrity": "sha512-gqXddjPqQ6G40VdnI6T6yObEC+pDNvyP95wdQhkWkg7crHH3km5qP1FsOXEkzEQwnz6gz5qGTn1c2Y52wP3OyQ==",

-      "engines": [

-        "node >=0.6.0"

-      ],

-      "license": "MIT",

-      "dependencies": {

-        "assert-plus": "1.0.0",

-        "extsprintf": "1.3.0",

-        "json-schema": "0.4.0",

-        "verror": "1.10.0"

-      }

-    },

-    "node_modules/http-signature/node_modules/verror": {

-      "version": "1.10.0",

-      "resolved": "https://registry.npmjs.org/verror/-/verror-1.10.0.tgz",

-      "integrity": "sha512-ZZKSmDAEFOijERBLkmYfJ+vmk3w+7hOLYDNkRCuRuMJGEmqYNCNLyBBFwWKVMhfwaEF3WOd0Zlw86U/WC/+nYw==",

-      "engines": [

-        "node >=0.6.0"

-      ],

-      "license": "MIT",

-      "dependencies": {

-        "assert-plus": "^1.0.0",

-        "core-util-is": "1.0.2",

-        "extsprintf": "^1.2.0"

-      }

-    },

-    "node_modules/http2-client": {

-      "version": "1.3.5",

-      "resolved": "https://registry.npmjs.org/http2-client/-/http2-client-1.3.5.tgz",

-      "integrity": "sha512-EC2utToWl4RKfs5zd36Mxq7nzHHBuomZboI0yYL6Y0RmBgT7Sgkq4rQ0ezFTYoIsSs7Tm9SJe+o2FcAg6GBhGA==",

-      "license": "MIT"

-    },

-    "node_modules/hyphen": {

-      "version": "1.6.6",

-      "resolved": "https://registry.npmjs.org/hyphen/-/hyphen-1.6.6.tgz",

-      "integrity": "sha512-XtqmnT+b9n5MX+MsqluFAVTIenbtC25iskW0Z+jLd+awfhA+ZbWKWQMIvLJccGoa2bM1R6juWJ27cZxIFOmkWw==",

-      "license": "ISC"

-    },

-    "node_modules/iceberg-js": {

-      "version": "0.8.1",

-      "resolved": "https://registry.npmjs.org/iceberg-js/-/iceberg-js-0.8.1.tgz",

-      "integrity": "sha512-1dhVQZXhcHje7798IVM+xoo/1ZdVfzOMIc8/rgVSijRK38EDqOJoGula9N/8ZI5RD8QTxNQtK/Gozpr+qUqRRA==",

-      "license": "MIT",

-      "engines": {

-        "node": ">=20.0.0"

-      }

-    },

-    "node_modules/inherits": {

-      "version": "2.0.4",

-      "resolved": "https://registry.npmjs.org/inherits/-/inherits-2.0.4.tgz",

-      "integrity": "sha512-k/vGaX4/Yla3WzyMCvTQOXYeIHvqOKtnqBduzTHpzpQZzAskKMhZ2K+EnBiSM9zGSoIFeMpXKxa4dYeZIQqewQ==",

-      "license": "ISC"

-    },

-    "node_modules/invert-kv": {

-      "version": "2.0.0",

-      "resolved": "https://registry.npmjs.org/invert-kv/-/invert-kv-2.0.0.tgz",

-      "integrity": "sha512-wPVv/y/QQ/Uiirj/vh3oP+1Ww+AWehmi1g5fFWGPF6IpCBCDVrhgHRMvrLfdYcwDh3QJbGXDW4JAuzxElLSqKA==",

-      "license": "MIT",

-      "engines": {

-        "node": ">=4"

-      }

-    },

-    "node_modules/is-fullwidth-code-point": {

-      "version": "2.0.0",

-      "resolved": "https://registry.npmjs.org/is-fullwidth-code-point/-/is-fullwidth-code-point-2.0.0.tgz",

-      "integrity": "sha512-VHskAKYM8RfSFXwee5t5cbN5PZeq1Wrh6qd5bkyiXIf6UQcN6w/A0eXM9r6t8d+GYOh+o6ZhiEnb88LN/Y8m2w==",

-      "license": "MIT",

-      "engines": {

-        "node": ">=4"

-      }

-    },

-    "node_modules/is-stream": {

-      "version": "1.1.0",

-      "resolved": "https://registry.npmjs.org/is-stream/-/is-stream-1.1.0.tgz",

-      "integrity": "sha512-uQPm8kcs47jx38atAcWTVxyltQYoPT68y9aWYdV6yWXSyW8mzSat0TL6CiWdZeCdF3KrAvpVtnHbTv4RN+rqdQ==",

-      "license": "MIT",

-      "engines": {

-        "node": ">=0.10.0"

-      }

-    },

-    "node_modules/is-typedarray": {

-      "version": "1.0.0",

-      "resolved": "https://registry.npmjs.org/is-typedarray/-/is-typedarray-1.0.0.tgz",

-      "integrity": "sha512-cyA56iCMHAh5CdzjJIa4aohJyeO1YbwLi3Jc35MmRU6poroFjIGZzUzupGiRPOjgHg9TLu43xbpwXk523fMxKA==",

-      "license": "MIT"

-    },

-    "node_modules/is-url": {

-      "version": "1.2.4",

-      "resolved": "https://registry.npmjs.org/is-url/-/is-url-1.2.4.tgz",

-      "integrity": "sha512-ITvGim8FhRiYe4IQ5uHSkj7pVaPDrCTkNd3yq3cV7iZAcJdHTUMPMEHcqSOy9xZ9qFenQCvi+2wjH9a1nXqHww==",

-      "license": "MIT"

-    },

-    "node_modules/isexe": {

-      "version": "2.0.0",

-      "resolved": "https://registry.npmjs.org/isexe/-/isexe-2.0.0.tgz",

-      "integrity": "sha512-RHxMLp9lnKHGHRng9QFhRCMbYAcVpn69smSGcq3f36xjgVVWThj4qqLbTLlq7Ssj8B+fIQ1EuCEGI2lKsyQeIw==",

-      "license": "ISC"

-    },

-    "node_modules/isstream": {

-      "version": "0.1.2",

-      "resolved": "https://registry.npmjs.org/isstream/-/isstream-0.1.2.tgz",

-      "integrity": "sha512-Yljz7ffyPbrLpLngrMtZ7NduUgVvi6wG9RJ9IUcyCd59YQ911PBJphODUcbOVbqYfxe1wuYf/LJ8PauMRwsM/g==",

-      "license": "MIT"

-    },

-    "node_modules/jay-peg": {

-      "version": "1.1.1",

-      "resolved": "https://registry.npmjs.org/jay-peg/-/jay-peg-1.1.1.tgz",

-      "integrity": "sha512-D62KEuBxz/ip2gQKOEhk/mx14o7eiFRaU+VNNSP4MOiIkwb/D6B3G1Mfas7C/Fit8EsSV2/IWjZElx/Gs6A4ww==",

-      "license": "MIT",

-      "dependencies": {

-        "restructure": "^3.0.0"

-      }

-    },

-    "node_modules/js-md5": {

-      "version": "0.8.3",

-      "resolved": "https://registry.npmjs.org/js-md5/-/js-md5-0.8.3.tgz",

-      "integrity": "sha512-qR0HB5uP6wCuRMrWPTrkMaev7MJZwJuuw4fnwAzRgP4J4/F8RwtodOKpGp4XpqsLBFzzgqIO42efFAyz2Et6KQ==",

-      "license": "MIT"

-    },

-    "node_modules/js-tokens": {

-      "version": "4.0.0",

-      "resolved": "https://registry.npmjs.org/js-tokens/-/js-tokens-4.0.0.tgz",

-      "integrity": "sha512-RdJUflcE3cUzKiMqQgsCu06FPu9UdIJO0beYbPhHN4k6apgJtifcoCtT9bcxOpYBtpD2kCM6Sbzg4CausW/PKQ==",

-      "license": "MIT"

-    },

-    "node_modules/jsbn": {

-      "version": "0.1.1",

-      "resolved": "https://registry.npmjs.org/jsbn/-/jsbn-0.1.1.tgz",

-      "integrity": "sha512-UVU9dibq2JcFWxQPA6KCqj5O42VOmAY3zQUfEKxU0KpTGXwNoCjkX1e13eHNvw/xPynt6pU0rZ1htjWTNTSXsg==",

-      "license": "MIT"

-    },

-    "node_modules/json-schema": {

-      "version": "0.4.0",

-      "resolved": "https://registry.npmjs.org/json-schema/-/json-schema-0.4.0.tgz",

-      "integrity": "sha512-es94M3nTIfsEPisRafak+HDLfHXnKBhV3vU5eqPcS3flIWqcxJWgXHXiey3YrpaNsanY5ei1VoYEbOzijuq9BA==",

-      "license": "(AFL-2.1 OR BSD-3-Clause)"

-    },

-    "node_modules/json-schema-traverse": {

-      "version": "0.4.1",

-      "resolved": "https://registry.npmjs.org/json-schema-traverse/-/json-schema-traverse-0.4.1.tgz",

-      "integrity": "sha512-xbbCH5dCYU5T8LcEhhuh7HJ88HXuW3qsI3Y0zOZFKfZEHcpWiHU/Jxzk629Brsab/mMiHQti9wMP+845RPe3Vg==",

-      "license": "MIT"

-    },

-    "node_modules/json-stringify-safe": {

-      "version": "5.0.1",

-      "resolved": "https://registry.npmjs.org/json-stringify-safe/-/json-stringify-safe-5.0.1.tgz",

-      "integrity": "sha512-ZClg6AaYvamvYEE82d3Iyd3vSSIjQ+odgjaTzRuO3s7toCdFKczob2i0zCh7JE8kWn17yvAWhUVxvqGwUalsRA==",

-      "license": "ISC"

-    },

-    "node_modules/json-to-ast": {

-      "version": "2.1.0",

-      "resolved": "https://registry.npmjs.org/json-to-ast/-/json-to-ast-2.1.0.tgz",

-      "integrity": "sha512-W9Lq347r8tA1DfMvAGn9QNcgYm4Wm7Yc+k8e6vezpMnRT+NHbtlxgNBXRVjXe9YM6eTn6+p/MKOlV/aABJcSnQ==",

-      "license": "MIT",

-      "dependencies": {

-        "code-error-fragment": "0.0.230",

-        "grapheme-splitter": "^1.0.4"

-      },

-      "engines": {

-        "node": ">= 4"

-      }

-    },

-    "node_modules/jsonpointer": {

-      "version": "4.1.0",

-      "resolved": "https://registry.npmjs.org/jsonpointer/-/jsonpointer-4.1.0.tgz",

-      "integrity": "sha512-CXcRvMyTlnR53xMcKnuMzfCA5i/nfblTnnr74CZb6C4vG39eu6w51t7nKmU5MfLfbTgGItliNyjO/ciNPDqClg==",

-      "license": "MIT",

-      "engines": {

-        "node": ">=0.10.0"

-      }

-    },

-    "node_modules/jsprim": {

-      "version": "1.4.2",

-      "resolved": "https://registry.npmjs.org/jsprim/-/jsprim-1.4.2.tgz",

-      "integrity": "sha512-P2bSOMAc/ciLz6DzgjVlGJP9+BrJWu5UDGK70C2iweC5QBIeFf0ZXRvGjEj2uYgrY2MkAAhsSWHDWlFtEroZWw==",

-      "license": "MIT",

-      "dependencies": {

-        "assert-plus": "1.0.0",

-        "extsprintf": "1.3.0",

-        "json-schema": "0.4.0",

-        "verror": "1.10.0"

-      },

-      "engines": {

-        "node": ">=0.6.0"

-      }

-    },

-    "node_modules/jsprim/node_modules/core-util-is": {

-      "version": "1.0.2",

-      "resolved": "https://registry.npmjs.org/core-util-is/-/core-util-is-1.0.2.tgz",

-      "integrity": "sha512-3lqz5YjWTYnW6dlDa5TLaTCcShfar1e40rmcJVwCBJC6mWlFuj0eCHIElmG1g5kyuJ/GD+8Wn4FFCcz4gJPfaQ==",

-      "license": "MIT"

-    },

-    "node_modules/jsprim/node_modules/extsprintf": {

-      "version": "1.3.0",

-      "resolved": "https://registry.npmjs.org/extsprintf/-/extsprintf-1.3.0.tgz",

-      "integrity": "sha512-11Ndz7Nv+mvAC1j0ktTa7fAb0vLyGGX+rMHNBYQviQDGU0Hw7lhctJANqbPhu9nV9/izT/IntTgZ7Im/9LJs9g==",

-      "engines": [

-        "node >=0.6.0"

-      ],

-      "license": "MIT"

-    },

-    "node_modules/jsprim/node_modules/verror": {

-      "version": "1.10.0",

-      "resolved": "https://registry.npmjs.org/verror/-/verror-1.10.0.tgz",

-      "integrity": "sha512-ZZKSmDAEFOijERBLkmYfJ+vmk3w+7hOLYDNkRCuRuMJGEmqYNCNLyBBFwWKVMhfwaEF3WOd0Zlw86U/WC/+nYw==",

-      "engines": [

-        "node >=0.6.0"

-      ],

-      "license": "MIT",

-      "dependencies": {

-        "assert-plus": "^1.0.0",

-        "core-util-is": "1.0.2",

-        "extsprintf": "^1.2.0"

-      }

-    },

-    "node_modules/lcid": {

-      "version": "2.0.0",

-      "resolved": "https://registry.npmjs.org/lcid/-/lcid-2.0.0.tgz",

-      "integrity": "sha512-avPEb8P8EGnwXKClwsNUgryVjllcRqtMYa49NTsbQagYuT1DcXnl1915oxWjoyGrXR6zH/Y0Zc96xWsPcoDKeA==",

-      "license": "MIT",

-      "dependencies": {

-        "invert-kv": "^2.0.0"

-      },

-      "engines": {

-        "node": ">=6"

-      }

-    },

-    "node_modules/leven": {

-      "version": "3.1.0",

-      "resolved": "https://registry.npmjs.org/leven/-/leven-3.1.0.tgz",

-      "integrity": "sha512-qsda+H8jTaUaN/x5vzW2rzc+8Rw4TAQ/4KjB46IwK5VH+IlVeeeje/EoZRpiXvIqjFgK84QffqPztGI3VBLG1A==",

-      "license": "MIT",

-      "engines": {

-        "node": ">=6"

-      }

-    },

-    "node_modules/linebreak": {

-      "version": "1.1.0",

-      "resolved": "https://registry.npmjs.org/linebreak/-/linebreak-1.1.0.tgz",

-      "integrity": "sha512-MHp03UImeVhB7XZtjd0E4n6+3xr5Dq/9xI/5FptGk5FrbDR3zagPa2DS6U8ks/3HjbKWG9Q1M2ufOzxV2qLYSQ==",

-      "license": "MIT",

-      "dependencies": {

-        "base64-js": "0.0.8",

-        "unicode-trie": "^2.0.0"

-      }

-    },

-    "node_modules/linebreak/node_modules/base64-js": {

-      "version": "0.0.8",

-      "resolved": "https://registry.npmjs.org/base64-js/-/base64-js-0.0.8.tgz",

-      "integrity": "sha512-3XSA2cR/h/73EzlXXdU6YNycmYI7+kicTxks4eJg2g39biHR84slg2+des+p7iHYhbRg/udIS4TD53WabcOUkw==",

-      "license": "MIT",

-      "engines": {

-        "node": ">= 0.4"

-      }

-    },

-    "node_modules/livekit-client": {

-      "version": "2.15.7",

-      "resolved": "https://registry.npmjs.org/livekit-client/-/livekit-client-2.15.7.tgz",

-      "integrity": "sha512-19m8Q1cvRl5PslRawDUgWXeP8vL8584tX8kiZEJaPZo83U/L6VPS/O7pP06phfJaBWeeV8sAOVtEPlQiZEHtpg==",

-      "license": "Apache-2.0",

-      "dependencies": {

-        "@livekit/mutex": "1.1.1",

-        "@livekit/protocol": "1.39.3",

-        "events": "^3.3.0",

-        "loglevel": "^1.9.2",

-        "sdp-transform": "^2.15.0",

-        "ts-debounce": "^4.0.0",

-        "tslib": "2.8.1",

-        "typed-emitter": "^2.1.0",

-        "webrtc-adapter": "^9.0.1"

-      },

-      "peerDependencies": {

-        "@types/dom-mediacapture-record": "^1"

-      }

-    },

-    "node_modules/livekit-client/node_modules/tslib": {

-      "version": "2.8.1",

-      "resolved": "https://registry.npmjs.org/tslib/-/tslib-2.8.1.tgz",

-      "integrity": "sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w==",

-      "license": "0BSD"

-    },

-    "node_modules/locate-path": {

-      "version": "3.0.0",

-      "resolved": "https://registry.npmjs.org/locate-path/-/locate-path-3.0.0.tgz",

-      "integrity": "sha512-7AO748wWnIhNqAuaty2ZWHkQHRSNfPVIsPIfwEOWO22AmaoVrWavlOcMR5nzTLNYvp36X220/maaRsrec1G65A==",

-      "license": "MIT",

-      "dependencies": {

-        "p-locate": "^3.0.0",

-        "path-exists": "^3.0.0"

-      },

-      "engines": {

-        "node": ">=6"

-      }

-    },

-    "node_modules/loglevel": {

-      "version": "1.9.2",

-      "resolved": "https://registry.npmjs.org/loglevel/-/loglevel-1.9.2.tgz",

-      "integrity": "sha512-HgMmCqIJSAKqo68l0rS2AanEWfkxaZ5wNiEFb5ggm08lDs9Xl2KxBlX3PTcaD2chBM1gXAYf491/M2Rv8Jwayg==",

-      "license": "MIT",

-      "engines": {

-        "node": ">= 0.6.0"

-      },

-      "funding": {

-        "type": "tidelift",

-        "url": "https://tidelift.com/funding/github/npm/loglevel"

-      }

-    },

-    "node_modules/loose-envify": {

-      "version": "1.4.0",

-      "resolved": "https://registry.npmjs.org/loose-envify/-/loose-envify-1.4.0.tgz",

-      "integrity": "sha512-lyuxPGr/Wfhrlem2CL/UcnUc1zcqKAImBDzukY7Y5F/yQiNdko6+fRLevlw1HgMySw7f611UIY408EtxRSoK3Q==",

-      "license": "MIT",

-      "dependencies": {

-        "js-tokens": "^3.0.0 || ^4.0.0"

-      },

-      "bin": {

-        "loose-envify": "cli.js"

-      }

-    },

-    "node_modules/map-age-cleaner": {

-      "version": "0.1.3",

-      "resolved": "https://registry.npmjs.org/map-age-cleaner/-/map-age-cleaner-0.1.3.tgz",

-      "integrity": "sha512-bJzx6nMoP6PDLPBFmg7+xRKeFZvFboMrGlxmNj9ClvX53KrmvM5bXFXEWjbz4cz1AFn+jWJ9z/DJSz7hrs0w3w==",

-      "license": "MIT",

-      "dependencies": {

-        "p-defer": "^1.0.0"

-      },

-      "engines": {

-        "node": ">=6"

-      }

-    },

-    "node_modules/math-intrinsics": {

-      "version": "1.1.0",

-      "resolved": "https://registry.npmjs.org/math-intrinsics/-/math-intrinsics-1.1.0.tgz",

-      "integrity": "sha512-/IXtbwEk5HTPyEwyKX6hGkYXxM9nbj64B+ilVJnC/R6B0pH5G4V3b0pVbL7DBj4tkhBAppbQUlf6F6Xl9LHu1g==",

-      "license": "MIT",

-      "engines": {

-        "node": ">= 0.4"

-      }

-    },

-    "node_modules/media-engine": {

-      "version": "2.0.0",

-      "resolved": "https://registry.npmjs.org/media-engine/-/media-engine-2.0.0.tgz",

-      "integrity": "sha512-FqNmlXKYrp5d3g7xEOMJb+6gXZE0fTssdyIQqYR4LbkifbNbS0hDylhNDOh8r6tCgLboHd8+mwgH2njgSYDpnQ==",

-      "license": "MIT"

-    },

-    "node_modules/mem": {

-      "version": "4.3.0",

-      "resolved": "https://registry.npmjs.org/mem/-/mem-4.3.0.tgz",

-      "integrity": "sha512-qX2bG48pTqYRVmDB37rn/6PT7LcR8T7oAX3bf99u1Tt1nzxYfxkgqDwUwolPlXweM0XzBOBFzSx4kfp7KP1s/w==",

-      "license": "MIT",

-      "dependencies": {

-        "map-age-cleaner": "^0.1.1",

-        "mimic-fn": "^2.0.0",

-        "p-is-promise": "^2.0.0"

-      },

-      "engines": {

-        "node": ">=6"

-      }

-    },

-    "node_modules/mime-db": {

-      "version": "1.54.0",

-      "resolved": "https://registry.npmjs.org/mime-db/-/mime-db-1.54.0.tgz",

-      "integrity": "sha512-aU5EJuIN2WDemCcAp2vFBfp/m4EAhWJnUNSSw0ixs7/kXbd6Pg64EmwJkNdFhB8aWt1sH2CTXrLxo/iAGV3oPQ==",

-      "license": "MIT",

-      "engines": {

-        "node": ">= 0.6"

-      }

-    },

-    "node_modules/mime-types": {

-      "version": "2.1.35",

-      "resolved": "https://registry.npmjs.org/mime-types/-/mime-types-2.1.35.tgz",

-      "integrity": "sha512-ZDY+bPm5zTTF+YpCrAU9nK0UgICYPT0QtT1NZWFv4s++TNkcgVaT0g6+4R2uI4MjQjzysHB1zxuWL50hzaeXiw==",

-      "license": "MIT",

-      "dependencies": {

-        "mime-db": "1.52.0"

-      },

-      "engines": {

-        "node": ">= 0.6"

-      }

-    },

-    "node_modules/mime-types/node_modules/mime-db": {

-      "version": "1.52.0",

-      "resolved": "https://registry.npmjs.org/mime-db/-/mime-db-1.52.0.tgz",

-      "integrity": "sha512-sPU4uV7dYlvtWJxwwxHD0PuihVNiE7TyAbQ5SWxDCB9mUYvOgroQOwYQQOKPJ8CIbE+1ETVlOoK1UC2nU3gYvg==",

-      "license": "MIT",

-      "engines": {

-        "node": ">= 0.6"

-      }

-    },

-    "node_modules/mimic-fn": {

-      "version": "2.1.0",

-      "resolved": "https://registry.npmjs.org/mimic-fn/-/mimic-fn-2.1.0.tgz",

-      "integrity": "sha512-OqbOk5oEQeAZ8WXWydlu9HJjz9WVdEIvamMCcXmuqUYjTknH/sqsWvhQ3vgwKFRR1HpjvNBKQ37nbJgYzGqGcg==",

-      "license": "MIT",

-      "engines": {

-        "node": ">=6"

-      }

-    },

-    "node_modules/ms": {

-      "version": "2.1.3",

-      "resolved": "https://registry.npmjs.org/ms/-/ms-2.1.3.tgz",

-      "integrity": "sha512-6FlzubTLZG3J2a/NVCAleEhjzq5oxgHyaCU9yYXvcLsvoVaHJq/s5xXI6/XXP6tz7R9xAOtHnSO/tXtF3WRTlA==",

-      "license": "MIT"

-    },

-    "node_modules/nanoid": {

-      "version": "3.3.15",

-      "resolved": "https://registry.npmjs.org/nanoid/-/nanoid-3.3.15.tgz",

-      "integrity": "sha512-y7Wygv/7mEOvxTuEQDB8StXdMRBWf1kR/tlhAzBRUFkB2jfcLOAxO/SHmOO2zgz1pVgK29/kyupn059/bCHdjA==",

-      "funding": [

-        {

-          "type": "github",

-          "url": "https://github.com/sponsors/ai"

-        }

-      ],

-      "license": "MIT",

-      "bin": {

-        "nanoid": "bin/nanoid.cjs"

-      },

-      "engines": {

-        "node": "^10 || ^12 || ^13.7 || ^14 || >=15.0.1"

-      }

-    },

-    "node_modules/next": {

-      "version": "14.2.5",

-      "resolved": "https://registry.npmjs.org/next/-/next-14.2.5.tgz",

-      "integrity": "sha512-0f8aRfBVL+mpzfBjYfQuLWh2WyAwtJXCRfkPF4UJ5qd2YwrHczsrSzXU4tRMV0OAxR8ZJZWPFn6uhSC56UTsLA==",

-      "deprecated": "This version has a security vulnerability. Please upgrade to a patched version. See https://nextjs.org/blog/security-update-2025-12-11 for more details.",

-      "license": "MIT",

-      "dependencies": {

-        "@next/env": "14.2.5",

-        "@swc/helpers": "0.5.5",

-        "busboy": "1.6.0",

-        "caniuse-lite": "^1.0.30001579",

-        "graceful-fs": "^4.2.11",

-        "postcss": "8.4.31",

-        "styled-jsx": "5.1.1"

-      },

-      "bin": {

-        "next": "dist/bin/next"

-      },

-      "engines": {

-        "node": ">=18.17.0"

-      },

-      "optionalDependencies": {

-        "@next/swc-darwin-arm64": "14.2.5",

-        "@next/swc-darwin-x64": "14.2.5",

-        "@next/swc-linux-arm64-gnu": "14.2.5",

-        "@next/swc-linux-arm64-musl": "14.2.5",

-        "@next/swc-linux-x64-gnu": "14.2.5",

-        "@next/swc-linux-x64-musl": "14.2.5",

-        "@next/swc-win32-arm64-msvc": "14.2.5",

-        "@next/swc-win32-ia32-msvc": "14.2.5",

-        "@next/swc-win32-x64-msvc": "14.2.5"

-      },

-      "peerDependencies": {

-        "@opentelemetry/api": "^1.1.0",

-        "@playwright/test": "^1.41.2",

-        "react": "^18.2.0",

-        "react-dom": "^18.2.0",

-        "sass": "^1.3.0"

-      },

-      "peerDependenciesMeta": {

-        "@opentelemetry/api": {

-          "optional": true

-        },

-        "@playwright/test": {

-          "optional": true

-        },

-        "sass": {

-          "optional": true

-        }

-      }

-    },

-    "node_modules/nice-try": {

-      "version": "1.0.5",

-      "resolved": "https://registry.npmjs.org/nice-try/-/nice-try-1.0.5.tgz",

-      "integrity": "sha512-1nh45deeb5olNY7eX82BkPO7SSxR5SSYJiPTrTdFUVYwAl8CKMA5N9PjTYkHiRjisVcxcQ1HXdLhx2qxxJzLNQ==",

-      "license": "MIT"

-    },

-    "node_modules/node-fetch-h2": {

-      "version": "2.3.0",

-      "resolved": "https://registry.npmjs.org/node-fetch-h2/-/node-fetch-h2-2.3.0.tgz",

-      "integrity": "sha512-ofRW94Ab0T4AOh5Fk8t0h8OBWrmjb0SSB20xh1H8YnPV9EJ+f5AMoYSUQ2zgJ4Iq2HAK0I2l5/Nequ8YzFS3Hg==",

-      "license": "MIT",

-      "dependencies": {

-        "http2-client": "^1.2.5"

-      },

-      "engines": {

-        "node": "4.x || >=6.0.0"

-      }

-    },

-    "node_modules/node-readfiles": {

-      "version": "0.2.0",

-      "resolved": "https://registry.npmjs.org/node-readfiles/-/node-readfiles-0.2.0.tgz",

-      "integrity": "sha512-SU00ZarexNlE4Rjdm83vglt5Y9yiQ+XI1XpflWlb7q7UTN1JUItm69xMeiQCTxtTfnzt+83T8Cx+vI2ED++VDA==",

-      "license": "MIT",

-      "dependencies": {

-        "es6-promise": "^3.2.1"

-      }

-    },

-    "node_modules/normalize-svg-path": {

-      "version": "1.1.0",

-      "resolved": "https://registry.npmjs.org/normalize-svg-path/-/normalize-svg-path-1.1.0.tgz",

-      "integrity": "sha512-r9KHKG2UUeB5LoTouwDzBy2VxXlHsiM6fyLQvnJa0S5hrhzqElH/CH7TUGhT1fVvIYBIKf3OpY4YJ4CK+iaqHg==",

-      "license": "MIT",

-      "dependencies": {

-        "svg-arc-to-cubic-bezier": "^3.0.0"

-      }

-    },

-    "node_modules/npm-run-path": {

-      "version": "2.0.2",

-      "resolved": "https://registry.npmjs.org/npm-run-path/-/npm-run-path-2.0.2.tgz",

-      "integrity": "sha512-lJxZYlT4DW/bRUtFh1MQIWqmLwQfAxnqWG4HhEdjMlkrJYnJn0Jrr2u3mgxqaWsdiBc76TYkTG/mhrnYTuzfHw==",

-      "license": "MIT",

-      "dependencies": {

-        "path-key": "^2.0.0"

-      },

-      "engines": {

-        "node": ">=4"

-      }

-    },

-    "node_modules/number-is-nan": {

-      "version": "1.0.1",

-      "resolved": "https://registry.npmjs.org/number-is-nan/-/number-is-nan-1.0.1.tgz",

-      "integrity": "sha512-4jbtZXNAsfZbAHiiqjLPBiCl16dES1zI4Hpzzxw61Tk+loF+sBDBKx1ICKKKwIqQ7M0mFn1TmkN7euSncWgHiQ==",

-      "license": "MIT",

-      "engines": {

-        "node": ">=0.10.0"

-      }

-    },

-    "node_modules/nunjucks": {

-      "version": "3.2.4",

-      "resolved": "https://registry.npmjs.org/nunjucks/-/nunjucks-3.2.4.tgz",

-      "integrity": "sha512-26XRV6BhkgK0VOxfbU5cQI+ICFUtMLixv1noZn1tGU38kQH5A5nmmbk/O45xdyBhD1esk47nKrY0mvQpZIhRjQ==",

-      "license": "BSD-2-Clause",

-      "dependencies": {

-        "a-sync-waterfall": "^1.0.0",

-        "asap": "^2.0.3",

-        "commander": "^5.1.0"

-      },

-      "bin": {

-        "nunjucks-precompile": "bin/precompile"

-      },

-      "engines": {

-        "node": ">= 6.9.0"

-      },

-      "peerDependencies": {

-        "chokidar": "^3.3.0"

-      },

-      "peerDependenciesMeta": {

-        "chokidar": {

-          "optional": true

-        }

-      }

-    },

-    "node_modules/nunjucks/node_modules/commander": {

-      "version": "5.1.0",

-      "resolved": "https://registry.npmjs.org/commander/-/commander-5.1.0.tgz",

-      "integrity": "sha512-P0CysNDQ7rtVw4QIQtm+MRxV66vKFSvlsQvGYXZWR3qFU0jlMKHZZZgw8e+8DSah4UDKMqnknRDQz+xuQXQ/Zg==",

-      "license": "MIT",

-      "engines": {

-        "node": ">= 6"

-      }

-    },

-    "node_modules/oas-kit-common": {

-      "version": "1.0.8",

-      "resolved": "https://registry.npmjs.org/oas-kit-common/-/oas-kit-common-1.0.8.tgz",

-      "integrity": "sha512-pJTS2+T0oGIwgjGpw7sIRU8RQMcUoKCDWFLdBqKB2BNmGpbBMH2sdqAaOXUg8OzonZHU0L7vfJu1mJFEiYDWOQ==",

-      "license": "BSD-3-Clause",

-      "dependencies": {

-        "fast-safe-stringify": "^2.0.7"

-      }

-    },

-    "node_modules/oas-linter": {

-      "version": "3.2.2",

-      "resolved": "https://registry.npmjs.org/oas-linter/-/oas-linter-3.2.2.tgz",

-      "integrity": "sha512-KEGjPDVoU5K6swgo9hJVA/qYGlwfbFx+Kg2QB/kd7rzV5N8N5Mg6PlsoCMohVnQmo+pzJap/F610qTodKzecGQ==",

-      "license": "BSD-3-Clause",

-      "dependencies": {

-        "@exodus/schemasafe": "^1.0.0-rc.2",

-        "should": "^13.2.1",

-        "yaml": "^1.10.0"

-      },

-      "funding": {

-        "url": "https://github.com/Mermade/oas-kit?sponsor=1"

-      }

-    },

-    "node_modules/oas-resolver": {

-      "version": "2.5.6",

-      "resolved": "https://registry.npmjs.org/oas-resolver/-/oas-resolver-2.5.6.tgz",

-      "integrity": "sha512-Yx5PWQNZomfEhPPOphFbZKi9W93CocQj18NlD2Pa4GWZzdZpSJvYwoiuurRI7m3SpcChrnO08hkuQDL3FGsVFQ==",

-      "license": "BSD-3-Clause",

-      "dependencies": {

-        "node-fetch-h2": "^2.3.0",

-        "oas-kit-common": "^1.0.8",

-        "reftools": "^1.1.9",

-        "yaml": "^1.10.0",

-        "yargs": "^17.0.1"

-      },

-      "bin": {

-        "resolve": "resolve.js"

-      },

-      "funding": {

-        "url": "https://github.com/Mermade/oas-kit?sponsor=1"

-      }

-    },

-    "node_modules/oas-resolver/node_modules/ansi-regex": {

-      "version": "5.0.1",

-      "resolved": "https://registry.npmjs.org/ansi-regex/-/ansi-regex-5.0.1.tgz",

-      "integrity": "sha512-quJQXlTSUGL2LH9SUXo8VwsY4soanhgo6LNSm84E1LBcE8s3O0wpdiRzyR9z/ZZJMlMWv37qOOb9pdJlMUEKFQ==",

-      "license": "MIT",

-      "engines": {

-        "node": ">=8"

-      }

-    },

-    "node_modules/oas-resolver/node_modules/ansi-styles": {

-      "version": "4.3.0",

-      "resolved": "https://registry.npmjs.org/ansi-styles/-/ansi-styles-4.3.0.tgz",

-      "integrity": "sha512-zbB9rCJAT1rbjiVDb2hqKFHNYLxgtk8NURxZ3IZwD3F6NtxbXZQCnnSi1Lkx+IDohdPlFp222wVALIheZJQSEg==",

-      "license": "MIT",

-      "dependencies": {

-        "color-convert": "^2.0.1"

-      },

-      "engines": {

-        "node": ">=8"

-      },

-      "funding": {

-        "url": "https://github.com/chalk/ansi-styles?sponsor=1"

-      }

-    },

-    "node_modules/oas-resolver/node_modules/cliui": {

-      "version": "8.0.1",

-      "resolved": "https://registry.npmjs.org/cliui/-/cliui-8.0.1.tgz",

-      "integrity": "sha512-BSeNnyus75C4//NQ9gQt1/csTXyo/8Sb+afLAkzAptFuMsod9HFokGNudZpi/oQV73hnVK+sR+5PVRMd+Dr7YQ==",

-      "license": "ISC",

-      "dependencies": {

-        "string-width": "^4.2.0",

-        "strip-ansi": "^6.0.1",

-        "wrap-ansi": "^7.0.0"

-      },

-      "engines": {

-        "node": ">=12"

-      }

-    },

-    "node_modules/oas-resolver/node_modules/color-convert": {

-      "version": "2.0.1",

-      "resolved": "https://registry.npmjs.org/color-convert/-/color-convert-2.0.1.tgz",

-      "integrity": "sha512-RRECPsj7iu/xb5oKYcsFHSppFNnsj/52OVTRKb4zP5onXwVF3zVmmToNcOfGC+CRDpfK/U584fMg38ZHCaElKQ==",

-      "license": "MIT",

-      "dependencies": {

-        "color-name": "~1.1.4"

-      },

-      "engines": {

-        "node": ">=7.0.0"

-      }

-    },

-    "node_modules/oas-resolver/node_modules/get-caller-file": {

-      "version": "2.0.5",

-      "resolved": "https://registry.npmjs.org/get-caller-file/-/get-caller-file-2.0.5.tgz",

-      "integrity": "sha512-DyFP3BM/3YHTQOCUL/w0OZHR0lpKeGrxotcHWcqNEdnltqFwXVfhEBQ94eIo34AfQpo0rGki4cyIiftY06h2Fg==",

-      "license": "ISC",

-      "engines": {

-        "node": "6.* || 8.* || >= 10.*"

-      }

-    },

-    "node_modules/oas-resolver/node_modules/is-fullwidth-code-point": {

-      "version": "3.0.0",

-      "resolved": "https://registry.npmjs.org/is-fullwidth-code-point/-/is-fullwidth-code-point-3.0.0.tgz",

-      "integrity": "sha512-zymm5+u+sCsSWyD9qNaejV3DFvhCKclKdizYaJUuHA83RLjb7nSuGnddCHGv0hk+KY7BMAlsWeK4Ueg6EV6XQg==",

-      "license": "MIT",

-      "engines": {

-        "node": ">=8"

-      }

-    },

-    "node_modules/oas-resolver/node_modules/string-width": {

-      "version": "4.2.3",

-      "resolved": "https://registry.npmjs.org/string-width/-/string-width-4.2.3.tgz",

-      "integrity": "sha512-wKyQRQpjJ0sIp62ErSZdGsjMJWsap5oRNihHhu6G7JVO/9jIB6UyevL+tXuOqrng8j/cxKTWyWUwvSTriiZz/g==",

-      "license": "MIT",

-      "dependencies": {

-        "emoji-regex": "^8.0.0",

-        "is-fullwidth-code-point": "^3.0.0",

-        "strip-ansi": "^6.0.1"

-      },

-      "engines": {

-        "node": ">=8"

-      }

-    },

-    "node_modules/oas-resolver/node_modules/strip-ansi": {

-      "version": "6.0.1",

-      "resolved": "https://registry.npmjs.org/strip-ansi/-/strip-ansi-6.0.1.tgz",

-      "integrity": "sha512-Y38VPSHcqkFrCpFnQ9vuSXmquuv5oXOKpGeT6aGrr3o3Gc9AlVa6JBfUSOCnbxGGZF+/0ooI7KrPuUSztUdU5A==",

-      "license": "MIT",

-      "dependencies": {

-        "ansi-regex": "^5.0.1"

-      },

-      "engines": {

-        "node": ">=8"

-      }

-    },

-    "node_modules/oas-resolver/node_modules/wrap-ansi": {

-      "version": "7.0.0",

-      "resolved": "https://registry.npmjs.org/wrap-ansi/-/wrap-ansi-7.0.0.tgz",

-      "integrity": "sha512-YVGIj2kamLSTxw6NsZjoBxfSwsn0ycdesmc4p+Q21c5zPuZ1pl+NfxVdxPtdHvmNVOQ6XSYG4AUtyt/Fi7D16Q==",

-      "license": "MIT",

-      "dependencies": {

-        "ansi-styles": "^4.0.0",

-        "string-width": "^4.1.0",

-        "strip-ansi": "^6.0.0"

-      },

-      "engines": {

-        "node": ">=10"

-      },

-      "funding": {

-        "url": "https://github.com/chalk/wrap-ansi?sponsor=1"

-      }

-    },

-    "node_modules/oas-resolver/node_modules/y18n": {

-      "version": "5.0.8",

-      "resolved": "https://registry.npmjs.org/y18n/-/y18n-5.0.8.tgz",

-      "integrity": "sha512-0pfFzegeDWJHJIAmTLRP2DwHjdF5s7jo9tuztdQxAhINCdvS+3nGINqPd00AphqJR/0LhANUS6/+7SCb98YOfA==",

-      "license": "ISC",

-      "engines": {

-        "node": ">=10"

-      }

-    },

-    "node_modules/oas-resolver/node_modules/yargs": {

-      "version": "17.7.3",

-      "resolved": "https://registry.npmjs.org/yargs/-/yargs-17.7.3.tgz",

-      "integrity": "sha512-GZtjxm/J/4TSxuL3FNYjCmLktBTnIw/rVmKSIyKeYAZpmJB2ig9VauCC5xsa82GNKVKDAqpOn3KVzNt0zmrU0g==",

-      "license": "MIT",

-      "dependencies": {

-        "cliui": "^8.0.1",

-        "escalade": "^3.1.1",

-        "get-caller-file": "^2.0.5",

-        "require-directory": "^2.1.1",

-        "string-width": "^4.2.3",

-        "y18n": "^5.0.5",

-        "yargs-parser": "^21.1.1"

-      },

-      "engines": {

-        "node": ">=12"

-      }

-    },

-    "node_modules/oas-resolver/node_modules/yargs-parser": {

-      "version": "21.1.1",

-      "resolved": "https://registry.npmjs.org/yargs-parser/-/yargs-parser-21.1.1.tgz",

-      "integrity": "sha512-tVpsJW7DdjecAiFpbIB1e3qxIQsE6NoPc5/eTdrbbIC4h0LVsWhnoa3g+m2HclBIujHzsxZ4VJVA+GUuc2/LBw==",

-      "license": "ISC",

-      "engines": {

-        "node": ">=12"

-      }

-    },

-    "node_modules/oas-schema-walker": {

-      "version": "1.1.5",

-      "resolved": "https://registry.npmjs.org/oas-schema-walker/-/oas-schema-walker-1.1.5.tgz",

-      "integrity": "sha512-2yucenq1a9YPmeNExoUa9Qwrt9RFkjqaMAA1X+U7sbb0AqBeTIdMHky9SQQ6iN94bO5NW0W4TRYXerG+BdAvAQ==",

-      "license": "BSD-3-Clause",

-      "funding": {

-        "url": "https://github.com/Mermade/oas-kit?sponsor=1"

-      }

-    },

-    "node_modules/oas-validator": {

-      "version": "3.4.0",

-      "resolved": "https://registry.npmjs.org/oas-validator/-/oas-validator-3.4.0.tgz",

-      "integrity": "sha512-l/SxykuACi2U51osSsBXTxdsFc8Fw41xI7AsZkzgVgWJAzoEFaaNptt35WgY9C3757RUclsm6ye5GvSyYoozLQ==",

-      "license": "BSD-3-Clause",

-      "dependencies": {

-        "ajv": "^5.5.2",

-        "better-ajv-errors": "^0.6.7",

-        "call-me-maybe": "^1.0.1",

-        "oas-kit-common": "^1.0.7",

-        "oas-linter": "^3.1.0",

-        "oas-resolver": "^2.3.0",

-        "oas-schema-walker": "^1.1.3",

-        "reftools": "^1.1.0",

-        "should": "^13.2.1",

-        "yaml": "^1.8.3"

-      }

-    },

-    "node_modules/oas-validator/node_modules/ajv": {

-      "version": "5.5.2",

-      "resolved": "https://registry.npmjs.org/ajv/-/ajv-5.5.2.tgz",

-      "integrity": "sha512-Ajr4IcMXq/2QmMkEmSvxqfLN5zGmJ92gHXAeOXq1OekoH2rfDNsgdDoL2f7QaRCy7G/E6TpxBVdRuNraMztGHw==",

-      "license": "MIT",

-      "dependencies": {

-        "co": "^4.6.0",

-        "fast-deep-equal": "^1.0.0",

-        "fast-json-stable-stringify": "^2.0.0",

-        "json-schema-traverse": "^0.3.0"

-      }

-    },

-    "node_modules/oas-validator/node_modules/fast-deep-equal": {

-      "version": "1.1.0",

-      "resolved": "https://registry.npmjs.org/fast-deep-equal/-/fast-deep-equal-1.1.0.tgz",

-      "integrity": "sha512-fueX787WZKCV0Is4/T2cyAdM4+x1S3MXXOAhavE1ys/W42SHAPacLTQhucja22QBYrfGw50M2sRiXPtTGv9Ymw==",

-      "license": "MIT"

-    },

-    "node_modules/oas-validator/node_modules/json-schema-traverse": {

-      "version": "0.3.1",

-      "resolved": "https://registry.npmjs.org/json-schema-traverse/-/json-schema-traverse-0.3.1.tgz",

-      "integrity": "sha512-4JD/Ivzg7PoW8NzdrBSr3UFwC9mHgvI7Z6z3QGBsSHgKaRTUDmyZAAKJo2UbG1kUVfS9WS8bi36N49U1xw43DA==",

-      "license": "MIT"

-    },

-    "node_modules/oauth-sign": {

-      "version": "0.9.0",

-      "resolved": "https://registry.npmjs.org/oauth-sign/-/oauth-sign-0.9.0.tgz",

-      "integrity": "sha512-fexhUFFPTGV8ybAtSIGbV6gOkSv8UtRbDBnAyLQw4QPKkgNlsH2ByPGtMUqdWkos6YCRmAqViwgZrJc/mRDzZQ==",

-      "license": "Apache-2.0",

-      "engines": {

-        "node": "*"

-      }

-    },

-    "node_modules/object-assign": {

-      "version": "4.1.1",

-      "resolved": "https://registry.npmjs.org/object-assign/-/object-assign-4.1.1.tgz",

-      "integrity": "sha512-rJgTQnkUnH1sFw8yT6VSU3zD3sWmu6sZhIseY8VX+GRu3P6F7Fu+JNDoXfklElbLJSnc3FUQHVe4cU5hj+BcUg==",

-      "license": "MIT",

-      "engines": {

-        "node": ">=0.10.0"

-      }

-    },

-    "node_modules/object-inspect": {

-      "version": "1.13.4",

-      "resolved": "https://registry.npmjs.org/object-inspect/-/object-inspect-1.13.4.tgz",

-      "integrity": "sha512-W67iLl4J2EXEGTbfeHCffrjDfitvLANg0UlX3wFUUSTx92KXRFegMHUVgSqE+wvhAbi4WqjGg9czysTV2Epbew==",

-      "license": "MIT",

-      "engines": {

-        "node": ">= 0.4"

-      },

-      "funding": {

-        "url": "https://github.com/sponsors/ljharb"

-      }

-    },

-    "node_modules/once": {

-      "version": "1.4.0",

-      "resolved": "https://registry.npmjs.org/once/-/once-1.4.0.tgz",

-      "integrity": "sha512-lNaJgI+2Q5URQBkccEKHTQOPaXdUxnZZElQTZY0MFUAuaEqe1E+Nyvgdz/aIyNi6Z9MzO5dv1H8n58/GELp3+w==",

-      "license": "ISC",

-      "dependencies": {

-        "wrappy": "1"

-      }

-    },

-    "node_modules/openapi-generator": {

-      "version": "0.1.39",

-      "resolved": "https://registry.npmjs.org/openapi-generator/-/openapi-generator-0.1.39.tgz",

-      "integrity": "sha512-/i5245hUAXRyYmX1tWy+ftKtU5G8me2QNyjNS670GUSzTVDnhAWc+uYBZWccsvPH26mvEDnj1sTpfUefLiXPZQ==",

-      "license": "MIT",

-      "dependencies": {

-        "@types/nunjucks": "^3.1.0",

-        "@types/request": "^2.48.0",

-        "colorful": "^2.1.0",

-        "commander": "^2.19.0",

-        "debug": "^4.1.0",

-        "nunjucks": "^3.1.3",

-        "openapi3-ts": "^1.1.0",

-        "request": "^2.88.0",

-        "swagger2openapi": "^5.3.1",

-        "tslib": "^1.9.3"

-      },

-      "bin": {

-        "openapi-generator": "bin/index.js"

-      }

-    },

-    "node_modules/openapi3-ts": {

-      "version": "1.4.0",

-      "resolved": "https://registry.npmjs.org/openapi3-ts/-/openapi3-ts-1.4.0.tgz",

-      "integrity": "sha512-8DmE2oKayvSkIR3XSZ4+pRliBsx19bSNeIzkTPswY8r4wvjX86bMxsORdqwAwMxE8PefOcSAT2auvi/0TZe9yA==",

-      "license": "MIT"

-    },

-    "node_modules/os-locale": {

-      "version": "3.1.0",

-      "resolved": "https://registry.npmjs.org/os-locale/-/os-locale-3.1.0.tgz",

-      "integrity": "sha512-Z8l3R4wYWM40/52Z+S265okfFj8Kt2cC2MKY+xNi3kFs+XGI7WXu/I309QQQYbRW4ijiZ+yxs9pqEhJh0DqW3Q==",

-      "license": "MIT",

-      "dependencies": {

-        "execa": "^1.0.0",

-        "lcid": "^2.0.0",

-        "mem": "^4.0.0"

-      },

-      "engines": {

-        "node": ">=6"

-      }

-    },

-    "node_modules/p-defer": {

-      "version": "1.0.0",

-      "resolved": "https://registry.npmjs.org/p-defer/-/p-defer-1.0.0.tgz",

-      "integrity": "sha512-wB3wfAxZpk2AzOfUMJNL+d36xothRSyj8EXOa4f6GMqYDN9BJaaSISbsk+wS9abmnebVw95C2Kb5t85UmpCxuw==",

-      "license": "MIT",

-      "engines": {

-        "node": ">=4"

-      }

-    },

-    "node_modules/p-finally": {

-      "version": "1.0.0",

-      "resolved": "https://registry.npmjs.org/p-finally/-/p-finally-1.0.0.tgz",

-      "integrity": "sha512-LICb2p9CB7FS+0eR1oqWnHhp0FljGLZCWBE9aix0Uye9W8LTQPwMTYVGWQWIw9RdQiDg4+epXQODwIYJtSJaow==",

-      "license": "MIT",

-      "engines": {

-        "node": ">=4"

-      }

-    },

-    "node_modules/p-is-promise": {

-      "version": "2.1.0",

-      "resolved": "https://registry.npmjs.org/p-is-promise/-/p-is-promise-2.1.0.tgz",

-      "integrity": "sha512-Y3W0wlRPK8ZMRbNq97l4M5otioeA5lm1z7bkNkxCka8HSPjR0xRWmpCmc9utiaLP9Jb1eD8BgeIxTW4AIF45Pg==",

-      "license": "MIT",

-      "engines": {

-        "node": ">=6"

-      }

-    },

-    "node_modules/p-limit": {

-      "version": "2.3.0",

-      "resolved": "https://registry.npmjs.org/p-limit/-/p-limit-2.3.0.tgz",

-      "integrity": "sha512-//88mFWSJx8lxCzwdAABTJL2MyWB12+eIY7MDL2SqLmAkeKU9qxRvWuSyTjm3FUmpBEMuFfckAIqEaVGUDxb6w==",

-      "license": "MIT",

-      "dependencies": {

-        "p-try": "^2.0.0"

-      },

-      "engines": {

-        "node": ">=6"

-      },

-      "funding": {

-        "url": "https://github.com/sponsors/sindresorhus"

-      }

-    },

-    "node_modules/p-locate": {

-      "version": "3.0.0",

-      "resolved": "https://registry.npmjs.org/p-locate/-/p-locate-3.0.0.tgz",

-      "integrity": "sha512-x+12w/To+4GFfgJhBEpiDcLozRJGegY+Ei7/z0tSLkMmxGZNybVMSfWj9aJn8Z5Fc7dBUNJOOVgPv2H7IwulSQ==",

-      "license": "MIT",

-      "dependencies": {

-        "p-limit": "^2.0.0"

-      },

-      "engines": {

-        "node": ">=6"

-      }

-    },

-    "node_modules/p-try": {

-      "version": "2.2.0",

-      "resolved": "https://registry.npmjs.org/p-try/-/p-try-2.2.0.tgz",

-      "integrity": "sha512-R4nPAVTAU0B9D35/Gk3uJf/7XYbQcyohSKdvAxIRSNghFl4e71hVoGnBNQz9cWaXxO2I10KTC+3jMdvvoKw6dQ==",

-      "license": "MIT",

-      "engines": {

-        "node": ">=6"

-      }

-    },

-    "node_modules/pako": {

-      "version": "1.0.11",

-      "resolved": "https://registry.npmjs.org/pako/-/pako-1.0.11.tgz",

-      "integrity": "sha512-4hLB8Py4zZce5s4yd9XzopqwVv/yGNhV1Bl8NTmCq1763HeK2+EwVTv+leGeL13Dnh2wfbqowVPXCIO0z4taYw==",

-      "license": "(MIT AND Zlib)"

-    },

-    "node_modules/parse-svg-path": {

-      "version": "0.1.2",

-      "resolved": "https://registry.npmjs.org/parse-svg-path/-/parse-svg-path-0.1.2.tgz",

-      "integrity": "sha512-JyPSBnkTJ0AI8GGJLfMXvKq42cj5c006fnLz6fXy6zfoVjJizi8BNTpu8on8ziI1cKy9d9DGNuY17Ce7wuejpQ==",

-      "license": "MIT"

-    },

-    "node_modules/path-exists": {

-      "version": "3.0.0",

-      "resolved": "https://registry.npmjs.org/path-exists/-/path-exists-3.0.0.tgz",

-      "integrity": "sha512-bpC7GYwiDYQ4wYLe+FA8lhRjhQCMcQGuSgGGqDkg/QerRWw9CmGRT0iSOVRSZJ29NMLZgIzqaljJ63oaL4NIJQ==",

-      "license": "MIT",

-      "engines": {

-        "node": ">=4"

-      }

-    },

-    "node_modules/path-key": {

-      "version": "2.0.1",

-      "resolved": "https://registry.npmjs.org/path-key/-/path-key-2.0.1.tgz",

-      "integrity": "sha512-fEHGKCSmUSDPv4uoj8AlD+joPlq3peND+HRYyxFz4KPw4z926S/b8rIuFs2FYJg3BwsxJf6A9/3eIdLaYC+9Dw==",

-      "license": "MIT",

-      "engines": {

-        "node": ">=4"

-      }

-    },

-    "node_modules/pdfkit": {

-      "version": "0.20.1",

-      "resolved": "https://registry.npmjs.org/pdfkit/-/pdfkit-0.20.1.tgz",

-      "integrity": "sha512-1rRXK6x5o8I/3dBrBzXfxibpHpkfCnIA7EBAES7pEpGFc/65inMLlA8SalGWpJfal7BGekxeLf6A30IOpQpc5Q==",

-      "license": "MIT",

-      "dependencies": {

-        "@noble/ciphers": "^1.3.0",

-        "@noble/hashes": "^1.8.0",

-        "fflate": "^0.8.3",

-        "fontkit": "^2.0.4",

-        "linebreak": "^1.1.0",

-        "png-js": "^2.0.0"

-      }

-    },

-    "node_modules/performance-now": {

-      "version": "2.1.0",

-      "resolved": "https://registry.npmjs.org/performance-now/-/performance-now-2.1.0.tgz",

-      "integrity": "sha512-7EAHlyLHI56VEIdK57uwHdHKIaAGbnXPiw0yWbarQZOKaKpvUIgW0jWRVLiatnM+XXlSwsanIBH/hzGMJulMow==",

-      "license": "MIT"

-    },

-    "node_modules/picocolors": {

-      "version": "1.1.1",

-      "resolved": "https://registry.npmjs.org/picocolors/-/picocolors-1.1.1.tgz",

-      "integrity": "sha512-xceH2snhtb5M9liqDsmEw56le376mTZkEX/jEb/RxNFyegNul7eNslCXP9FDj/Lcu0X8KEyMceP2ntpaHrDEVA==",

-      "license": "ISC"

-    },

-    "node_modules/png-js": {

-      "version": "2.0.0",

-      "resolved": "https://registry.npmjs.org/png-js/-/png-js-2.0.0.tgz",

-      "integrity": "sha512-GdzJuUMc6ZSpxFJWVxtOH1bzYHym+TOnveqUjb+VJIbZWbZzyiRGFiKhbiielfpYbgMlhHVhsJ0FTazfuRFkMA==",

-      "dependencies": {

-        "fflate": "^0.8.2"

-      }

-    },

-    "node_modules/postcss": {

-      "version": "8.4.31",

-      "resolved": "https://registry.npmjs.org/postcss/-/postcss-8.4.31.tgz",

-      "integrity": "sha512-PS08Iboia9mts/2ygV3eLpY5ghnUcfLV/EXTOW1E2qYxJKGGBUtNjN76FYHnMs36RmARn41bC0AZmn+rR0OVpQ==",

-      "funding": [

-        {

-          "type": "opencollective",

-          "url": "https://opencollective.com/postcss/"

-        },

-        {

-          "type": "tidelift",

-          "url": "https://tidelift.com/funding/github/npm/postcss"

-        },

-        {

-          "type": "github",

-          "url": "https://github.com/sponsors/ai"

-        }

-      ],

-      "license": "MIT",

-      "dependencies": {

-        "nanoid": "^3.3.6",

-        "picocolors": "^1.0.0",

-        "source-map-js": "^1.0.2"

-      },

-      "engines": {

-        "node": "^10 || ^12 || >=14"

-      }

-    },

-    "node_modules/postcss-value-parser": {

-      "version": "4.2.0",

-      "resolved": "https://registry.npmjs.org/postcss-value-parser/-/postcss-value-parser-4.2.0.tgz",

-      "integrity": "sha512-1NNCs6uurfkVbeXG4S8JFT9t19m45ICnif8zWLd5oPSZ50QnwMfK+H3jv408d4jw/7Bttv5axS5IiHoLaVNHeQ==",

-      "license": "MIT"

-    },

-    "node_modules/prop-types": {

-      "version": "15.8.1",

-      "resolved": "https://registry.npmjs.org/prop-types/-/prop-types-15.8.1.tgz",

-      "integrity": "sha512-oj87CgZICdulUohogVAR7AjlC0327U4el4L6eAvOqCeudMDVU0NThNaV+b9Df4dXgSP1gXMTnPdhfe/2qDH5cg==",

-      "license": "MIT",

-      "dependencies": {

-        "loose-envify": "^1.4.0",

-        "object-assign": "^4.1.1",

-        "react-is": "^16.13.1"

-      }

-    },

-    "node_modules/psl": {

-      "version": "1.15.0",

-      "resolved": "https://registry.npmjs.org/psl/-/psl-1.15.0.tgz",

-      "integrity": "sha512-JZd3gMVBAVQkSs6HdNZo9Sdo0LNcQeMNP3CozBJb3JYC/QUYZTnKxP+f8oWRX4rHP5EurWxqAHTSwUCjlNKa1w==",

-      "license": "MIT",

-      "dependencies": {

-        "punycode": "^2.3.1"

-      },

-      "funding": {

-        "url": "https://github.com/sponsors/lupomontero"

-      }

-    },

-    "node_modules/pump": {

-      "version": "3.0.4",

-      "resolved": "https://registry.npmjs.org/pump/-/pump-3.0.4.tgz",

-      "integrity": "sha512-VS7sjc6KR7e1ukRFhQSY5LM2uBWAUPiOPa/A3mkKmiMwSmRFUITt0xuj+/lesgnCv+dPIEYlkzrcyXgquIHMcA==",

-      "license": "MIT",

-      "dependencies": {

-        "end-of-stream": "^1.1.0",

-        "once": "^1.3.1"

-      }

-    },

-    "node_modules/punycode": {

-      "version": "2.3.1",

-      "resolved": "https://registry.npmjs.org/punycode/-/punycode-2.3.1.tgz",

-      "integrity": "sha512-vYt7UD1U9Wg6138shLtLOvdAu+8DsC/ilFtEVHcH+wydcSpNE20AfSOduf6MkRFahL5FY7X1oU7nKVZFtfq8Fg==",

-      "license": "MIT",

-      "engines": {

-        "node": ">=6"

-      }

-    },

-    "node_modules/qs": {

-      "version": "6.15.3",

-      "resolved": "https://registry.npmjs.org/qs/-/qs-6.15.3.tgz",

-      "integrity": "sha512-O9gl3zCl5h5blw1KGUzQKhA5oUXSl8rwUIM5o0S3nCXMliSvy5Dzx7/DJcI+SwgICv+IneSZwhBh1oSyEHA71A==",

-      "license": "BSD-3-Clause",

-      "dependencies": {

-        "es-define-property": "^1.0.1",

-        "side-channel": "^1.1.1"

-      },

-      "engines": {

-        "node": ">=0.6"

-      },

-      "funding": {

-        "url": "https://github.com/sponsors/ljharb"

-      }

-    },

-    "node_modules/queue": {

-      "version": "6.0.2",

-      "resolved": "https://registry.npmjs.org/queue/-/queue-6.0.2.tgz",

-      "integrity": "sha512-iHZWu+q3IdFZFX36ro/lKBkSvfkztY5Y7HMiPlOUjhupPcG2JMfst2KKEpu5XndviX/3UhFbRngUPNKtgvtZiA==",

-      "license": "MIT",

-      "dependencies": {

-        "inherits": "~2.0.3"

-      }

-    },

-    "node_modules/react": {

-      "version": "18.3.1",

-      "resolved": "https://registry.npmjs.org/react/-/react-18.3.1.tgz",

-      "integrity": "sha512-wS+hAgJShR0KhEvPJArfuPVN1+Hz1t0Y6n5jLrGQbkb4urgPE/0Rve+1kMB1v/oWgHgm4WIcV+i7F2pTVj+2iQ==",

-      "license": "MIT",

-      "dependencies": {

-        "loose-envify": "^1.1.0"

-      },

-      "engines": {

-        "node": ">=0.10.0"

-      }

-    },

-    "node_modules/react-dom": {

-      "version": "18.3.1",

-      "resolved": "https://registry.npmjs.org/react-dom/-/react-dom-18.3.1.tgz",

-      "integrity": "sha512-5m4nQKp+rZRb09LNH59GM4BxTh9251/ylbKIbpe7TpGxfJ+9kv6BLkLBXIjjspbgbnIBNqlI23tRnTWT0snUIw==",

-      "license": "MIT",

-      "dependencies": {

-        "loose-envify": "^1.1.0",

-        "scheduler": "^0.23.2"

-      },

-      "peerDependencies": {

-        "react": "^18.3.1"

-      }

-    },

-    "node_modules/react-is": {

-      "version": "16.13.1",

-      "resolved": "https://registry.npmjs.org/react-is/-/react-is-16.13.1.tgz",

-      "integrity": "sha512-24e6ynE2H+OKt4kqsOvNd8kBpV65zoxbA4BVsEOB3ARVWQki/DHzaUoC5KuON/BiccDaCCTZBuOcfZs70kR8bQ==",

-      "license": "MIT"

-    },

-    "node_modules/reftools": {

-      "version": "1.1.9",

-      "resolved": "https://registry.npmjs.org/reftools/-/reftools-1.1.9.tgz",

-      "integrity": "sha512-OVede/NQE13xBQ+ob5CKd5KyeJYU2YInb1bmV4nRoOfquZPkAkxuOXicSe1PvqIuZZ4kD13sPKBbR7UFDmli6w==",

-      "license": "BSD-3-Clause",

-      "funding": {

-        "url": "https://github.com/Mermade/oas-kit?sponsor=1"

-      }

-    },

-    "node_modules/regenerator-runtime": {

-      "version": "0.14.1",

-      "resolved": "https://registry.npmjs.org/regenerator-runtime/-/regenerator-runtime-0.14.1.tgz",

-      "integrity": "sha512-dYnhHh0nJoMfnkZs6GmmhFknAGRrLznOu5nc9ML+EJxGvrx6H7teuevqVqCuPcPK//3eDrrjQhehXVx9cnkGdw==",

-      "license": "MIT"

-    },

-    "node_modules/request": {

-      "version": "2.88.2",

-      "resolved": "https://registry.npmjs.org/request/-/request-2.88.2.tgz",

-      "integrity": "sha512-MsvtOrfG9ZcrOwAW+Qi+F6HbD0CWXEh9ou77uOb7FM2WPhwT7smM833PzanhJLsgXjN89Ir6V2PczXNnMpwKhw==",

-      "deprecated": "request has been deprecated, see https://github.com/request/request/issues/3142",

-      "license": "Apache-2.0",

-      "dependencies": {

-        "aws-sign2": "~0.7.0",

-        "aws4": "^1.8.0",

-        "caseless": "~0.12.0",

-        "combined-stream": "~1.0.6",

-        "extend": "~3.0.2",

-        "forever-agent": "~0.6.1",

-        "form-data": "~2.3.2",

-        "har-validator": "~5.1.3",

-        "http-signature": "~1.2.0",

-        "is-typedarray": "~1.0.0",

-        "isstream": "~0.1.2",

-        "json-stringify-safe": "~5.0.1",

-        "mime-types": "~2.1.19",

-        "oauth-sign": "~0.9.0",

-        "performance-now": "^2.1.0",

-        "qs": "~6.5.2",

-        "safe-buffer": "^5.1.2",

-        "tough-cookie": "~2.5.0",

-        "tunnel-agent": "^0.6.0",

-        "uuid": "^3.3.2"

-      },

-      "engines": {

-        "node": ">= 6"

-      }

-    },

-    "node_modules/request/node_modules/form-data": {

-      "version": "2.3.3",

-      "resolved": "https://registry.npmjs.org/form-data/-/form-data-2.3.3.tgz",

-      "integrity": "sha512-1lLKB2Mu3aGP1Q/2eCOx0fNbRMe7XdwktwOruhfqqd0rIJWwN4Dh+E3hrPSlDCXnSR7UtZ1N38rVXm+6+MEhJQ==",

-      "license": "MIT",

-      "dependencies": {

-        "asynckit": "^0.4.0",

-        "combined-stream": "^1.0.6",

-        "mime-types": "^2.1.12"

-      },

-      "engines": {

-        "node": ">= 0.12"

-      }

-    },

-    "node_modules/request/node_modules/http-signature": {

-      "version": "1.2.0",

-      "resolved": "https://registry.npmjs.org/http-signature/-/http-signature-1.2.0.tgz",

-      "integrity": "sha512-CAbnr6Rz4CYQkLYUtSNXxQPUH2gK8f3iWexVlsnMeD+GjlsQ0Xsy1cOX+mN3dtxYomRy21CiOzU8Uhw6OwncEQ==",

-      "license": "MIT",

-      "dependencies": {

-        "assert-plus": "^1.0.0",

-        "jsprim": "^1.2.2",

-        "sshpk": "^1.7.0"

-      },

-      "engines": {

-        "node": ">=0.8",

-        "npm": ">=1.3.7"

-      }

-    },

-    "node_modules/request/node_modules/qs": {

-      "version": "6.5.5",

-      "resolved": "https://registry.npmjs.org/qs/-/qs-6.5.5.tgz",

-      "integrity": "sha512-mzR4sElr1bfCaPJe7m8ilJ6ZXdDaGoObcYR0ZHSsktM/Lt21MVHj5De30GQH2eiZ1qGRTO7LCAzQsUeXTNexWQ==",

-      "license": "BSD-3-Clause",

-      "engines": {

-        "node": ">=0.6"

-      }

-    },

-    "node_modules/require-directory": {

-      "version": "2.1.1",

-      "resolved": "https://registry.npmjs.org/require-directory/-/require-directory-2.1.1.tgz",

-      "integrity": "sha512-fGxEI7+wsG9xrvdjsrlmL22OMTTiHRwAMroiEeMgq8gzoLC/PQr7RsRDSTLUg/bZAZtF+TVIkHc6/4RIKrui+Q==",

-      "license": "MIT",

-      "engines": {

-        "node": ">=0.10.0"

-      }

-    },

-    "node_modules/require-from-string": {

-      "version": "2.0.2",

-      "resolved": "https://registry.npmjs.org/require-from-string/-/require-from-string-2.0.2.tgz",

-      "integrity": "sha512-Xf0nWe6RseziFMu+Ap9biiUbmplq6S9/p+7w7YXP/JBHhrUDDUhwa+vANyubuqfZWTveU//DYVGsDG7RKL/vEw==",

-      "license": "MIT",

-      "engines": {

-        "node": ">=0.10.0"

-      }

-    },

-    "node_modules/require-main-filename": {

-      "version": "1.0.1",

-      "resolved": "https://registry.npmjs.org/require-main-filename/-/require-main-filename-1.0.1.tgz",

-      "integrity": "sha512-IqSUtOVP4ksd1C/ej5zeEh/BIP2ajqpn8c5x+q99gvcIG/Qf0cud5raVnE/Dwd0ua9TXYDoDc0RE5hBSdz22Ug==",

-      "license": "ISC"

-    },

-    "node_modules/restructure": {

-      "version": "3.0.2",

-      "resolved": "https://registry.npmjs.org/restructure/-/restructure-3.0.2.tgz",

-      "integrity": "sha512-gSfoiOEA0VPE6Tukkrr7I0RBdE0s7H1eFCDBk05l1KIQT1UIKNc5JZy6jdyW6eYH3aR3g5b3PuL77rq0hvwtAw==",

-      "license": "MIT"

-    },

-    "node_modules/rxjs": {

-      "version": "7.8.2",

-      "resolved": "https://registry.npmjs.org/rxjs/-/rxjs-7.8.2.tgz",

-      "integrity": "sha512-dhKf903U/PQZY6boNNtAGdWbG85WAbjT/1xYoZIC7FAY0yWapOBQVsVrDl58W86//e1VpMNBtRV4MaXfdMySFA==",

-      "license": "Apache-2.0",

-      "optional": true,

-      "dependencies": {

-        "tslib": "^2.1.0"

-      }

-    },

-    "node_modules/rxjs/node_modules/tslib": {

-      "version": "2.8.1",

-      "resolved": "https://registry.npmjs.org/tslib/-/tslib-2.8.1.tgz",

-      "integrity": "sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w==",

-      "license": "0BSD",

-      "optional": true

-    },

-    "node_modules/safe-buffer": {

-      "version": "5.2.1",

-      "resolved": "https://registry.npmjs.org/safe-buffer/-/safe-buffer-5.2.1.tgz",

-      "integrity": "sha512-rp3So07KcdmmKbGvgaNxQSJr7bGVSVk5S9Eq1F+ppbRo70+YeaDxkw5Dd8NPN+GD6bjnYm2VuPuCXmpuYvmCXQ==",

-      "funding": [

-        {

-          "type": "github",

-          "url": "https://github.com/sponsors/feross"

-        },

-        {

-          "type": "patreon",

-          "url": "https://www.patreon.com/feross"

-        },

-        {

-          "type": "consulting",

-          "url": "https://feross.org/support"

-        }

-      ],

-      "license": "MIT"

-    },

-    "node_modules/safer-buffer": {

-      "version": "2.1.2",

-      "resolved": "https://registry.npmjs.org/safer-buffer/-/safer-buffer-2.1.2.tgz",

-      "integrity": "sha512-YZo3K82SD7Riyi0E1EQPojLz7kpepnSQI9IyPbHHg1XXXevb5dJI7tpyN2ADxGcQbHG7vcyRHk0cbwqcQriUtg==",

-      "license": "MIT"

-    },

-    "node_modules/scheduler": {

-      "version": "0.23.2",

-      "resolved": "https://registry.npmjs.org/scheduler/-/scheduler-0.23.2.tgz",

-      "integrity": "sha512-UOShsPwz7NrMUqhR6t0hWjFduvOzbtv7toDH1/hIrfRNIDBnnBWd0CwJTGvTpngVlmwGCdP9/Zl/tVrDqcuYzQ==",

-      "license": "MIT",

-      "dependencies": {

-        "loose-envify": "^1.1.0"

-      }

-    },

-    "node_modules/sdp": {

-      "version": "3.2.2",

-      "resolved": "https://registry.npmjs.org/sdp/-/sdp-3.2.2.tgz",

-      "integrity": "sha512-xZocWwfyp4hkbN4hLWxMjmv2Q8aNa9MhmOZ7L9aCZPT+dZsgRr6wZRrSYE3HTdyk/2pZKPSgqI7ns7Een1xMSA==",

-      "license": "MIT"

-    },

-    "node_modules/sdp-transform": {

-      "version": "2.15.0",

-      "resolved": "https://registry.npmjs.org/sdp-transform/-/sdp-transform-2.15.0.tgz",

-      "integrity": "sha512-KrOH82c/W+GYQ0LHqtr3caRpM3ITglq3ljGUIb8LTki7ByacJZ9z+piSGiwZDsRyhQbYBOBJgr2k6X4BZXi3Kw==",

-      "license": "MIT",

-      "bin": {

-        "sdp-verify": "checker.js"

-      }

-    },

-    "node_modules/semver": {

-      "version": "5.7.2",

-      "resolved": "https://registry.npmjs.org/semver/-/semver-5.7.2.tgz",

-      "integrity": "sha512-cBznnQ9KjJqU67B52RMC65CMarK2600WFnbkcaiwWq3xy/5haFJlshgnpjovMVJ+Hff49d8GEn0b87C5pDQ10g==",

-      "license": "ISC",

-      "bin": {

-        "semver": "bin/semver"

-      }

-    },

-    "node_modules/set-blocking": {

-      "version": "2.0.0",

-      "resolved": "https://registry.npmjs.org/set-blocking/-/set-blocking-2.0.0.tgz",

-      "integrity": "sha512-KiKBS8AnWGEyLzofFfmvKwpdPzqiy16LvQfK3yv/fVH7Bj13/wl3JSR1J+rfgRE9q7xUJK4qvgS8raSOeLUehw==",

-      "license": "ISC"

-    },

-    "node_modules/shebang-command": {

-      "version": "1.2.0",

-      "resolved": "https://registry.npmjs.org/shebang-command/-/shebang-command-1.2.0.tgz",

-      "integrity": "sha512-EV3L1+UQWGor21OmnvojK36mhg+TyIKDh3iFBKBohr5xeXIhNBcx8oWdgkTEEQ+BEFFYdLRuqMfd5L84N1V5Vg==",

-      "license": "MIT",

-      "dependencies": {

-        "shebang-regex": "^1.0.0"

-      },

-      "engines": {

-        "node": ">=0.10.0"

-      }

-    },

-    "node_modules/shebang-regex": {

-      "version": "1.0.0",

-      "resolved": "https://registry.npmjs.org/shebang-regex/-/shebang-regex-1.0.0.tgz",

-      "integrity": "sha512-wpoSFAxys6b2a2wHZ1XpDSgD7N9iVjg29Ph9uV/uaP9Ex/KXlkTZTeddxDPSYQpgvzKLGJke2UU0AzoGCjNIvQ==",

-      "license": "MIT",

-      "engines": {

-        "node": ">=0.10.0"

-      }

-    },

-    "node_modules/should": {

-      "version": "13.2.3",

-      "resolved": "https://registry.npmjs.org/should/-/should-13.2.3.tgz",

-      "integrity": "sha512-ggLesLtu2xp+ZxI+ysJTmNjh2U0TsC+rQ/pfED9bUZZ4DKefP27D+7YJVVTvKsmjLpIi9jAa7itwDGkDDmt1GQ==",

-      "license": "MIT",

-      "dependencies": {

-        "should-equal": "^2.0.0",

-        "should-format": "^3.0.3",

-        "should-type": "^1.4.0",

-        "should-type-adaptors": "^1.0.1",

-        "should-util": "^1.0.0"

-      }

-    },

-    "node_modules/should-equal": {

-      "version": "2.0.0",

-      "resolved": "https://registry.npmjs.org/should-equal/-/should-equal-2.0.0.tgz",

-      "integrity": "sha512-ZP36TMrK9euEuWQYBig9W55WPC7uo37qzAEmbjHz4gfyuXrEUgF8cUvQVO+w+d3OMfPvSRQJ22lSm8MQJ43LTA==",

-      "license": "MIT",

-      "dependencies": {

-        "should-type": "^1.4.0"

-      }

-    },

-    "node_modules/should-format": {

-      "version": "3.0.3",

-      "resolved": "https://registry.npmjs.org/should-format/-/should-format-3.0.3.tgz",

-      "integrity": "sha512-hZ58adtulAk0gKtua7QxevgUaXTTXxIi8t41L3zo9AHvjXO1/7sdLECuHeIN2SRtYXpNkmhoUP2pdeWgricQ+Q==",

-      "license": "MIT",

-      "dependencies": {

-        "should-type": "^1.3.0",

-        "should-type-adaptors": "^1.0.1"

-      }

-    },

-    "node_modules/should-type": {

-      "version": "1.4.0",

-      "resolved": "https://registry.npmjs.org/should-type/-/should-type-1.4.0.tgz",

-      "integrity": "sha512-MdAsTu3n25yDbIe1NeN69G4n6mUnJGtSJHygX3+oN0ZbO3DTiATnf7XnYJdGT42JCXurTb1JI0qOBR65shvhPQ==",

-      "license": "MIT"

-    },

-    "node_modules/should-type-adaptors": {

-      "version": "1.1.0",

-      "resolved": "https://registry.npmjs.org/should-type-adaptors/-/should-type-adaptors-1.1.0.tgz",

-      "integrity": "sha512-JA4hdoLnN+kebEp2Vs8eBe9g7uy0zbRo+RMcU0EsNy+R+k049Ki+N5tT5Jagst2g7EAja+euFuoXFCa8vIklfA==",

-      "license": "MIT",

-      "dependencies": {

-        "should-type": "^1.3.0",

-        "should-util": "^1.0.0"

-      }

-    },

-    "node_modules/should-util": {

-      "version": "1.0.1",

-      "resolved": "https://registry.npmjs.org/should-util/-/should-util-1.0.1.tgz",

-      "integrity": "sha512-oXF8tfxx5cDk8r2kYqlkUJzZpDBqVY/II2WhvU0n9Y3XYvAYRmeaf1PvvIvTgPnv4KJ+ES5M0PyDq5Jp+Ygy2g==",

-      "license": "MIT"

-    },

-    "node_modules/side-channel": {

-      "version": "1.1.1",

-      "resolved": "https://registry.npmjs.org/side-channel/-/side-channel-1.1.1.tgz",

-      "integrity": "sha512-6x6dK6zJdpTzF4sQeNYxwtvBzf6Eg4GtlesS94HOvTudUeyK2WXAaIfmDgsyslYrRBeFIlsi54AYsFGUuhmvrQ==",

-      "license": "MIT",

-      "dependencies": {

-        "es-errors": "^1.3.0",

-        "object-inspect": "^1.13.4",

-        "side-channel-list": "^1.0.1",

-        "side-channel-map": "^1.0.1",

-        "side-channel-weakmap": "^1.0.2"

-      },

-      "engines": {

-        "node": ">= 0.4"

-      },

-      "funding": {

-        "url": "https://github.com/sponsors/ljharb"

-      }

-    },

-    "node_modules/side-channel-list": {

-      "version": "1.0.1",

-      "resolved": "https://registry.npmjs.org/side-channel-list/-/side-channel-list-1.0.1.tgz",

-      "integrity": "sha512-mjn/0bi/oUURjc5Xl7IaWi/OJJJumuoJFQJfDDyO46+hBWsfaVM65TBHq2eoZBhzl9EchxOijpkbRC8SVBQU0w==",

-      "license": "MIT",

-      "dependencies": {

-        "es-errors": "^1.3.0",

-        "object-inspect": "^1.13.4"

-      },

-      "engines": {

-        "node": ">= 0.4"

-      },

-      "funding": {

-        "url": "https://github.com/sponsors/ljharb"

-      }

-    },

-    "node_modules/side-channel-map": {

-      "version": "1.0.1",

-      "resolved": "https://registry.npmjs.org/side-channel-map/-/side-channel-map-1.0.1.tgz",

-      "integrity": "sha512-VCjCNfgMsby3tTdo02nbjtM/ewra6jPHmpThenkTYh8pG9ucZ/1P8So4u4FGBek/BjpOVsDCMoLA/iuBKIFXRA==",

-      "license": "MIT",

-      "dependencies": {

-        "call-bound": "^1.0.2",

-        "es-errors": "^1.3.0",

-        "get-intrinsic": "^1.2.5",

-        "object-inspect": "^1.13.3"

-      },

-      "engines": {

-        "node": ">= 0.4"

-      },

-      "funding": {

-        "url": "https://github.com/sponsors/ljharb"

-      }

-    },

-    "node_modules/side-channel-weakmap": {

-      "version": "1.0.2",

-      "resolved": "https://registry.npmjs.org/side-channel-weakmap/-/side-channel-weakmap-1.0.2.tgz",

-      "integrity": "sha512-WPS/HvHQTYnHisLo9McqBHOJk2FkHO/tlpvldyrnem4aeQp4hai3gythswg6p01oSoTl58rcpiFAjF2br2Ak2A==",

-      "license": "MIT",

-      "dependencies": {

-        "call-bound": "^1.0.2",

-        "es-errors": "^1.3.0",

-        "get-intrinsic": "^1.2.5",

-        "object-inspect": "^1.13.3",

-        "side-channel-map": "^1.0.1"

-      },

-      "engines": {

-        "node": ">= 0.4"

-      },

-      "funding": {

-        "url": "https://github.com/sponsors/ljharb"

-      }

-    },

-    "node_modules/signal-exit": {

-      "version": "3.0.7",

-      "resolved": "https://registry.npmjs.org/signal-exit/-/signal-exit-3.0.7.tgz",

-      "integrity": "sha512-wnD2ZE+l+SPC/uoS0vXeE9L1+0wuaMqKlfz9AMUo38JsyLSBWSFcHR1Rri62LZc12vLr1gb3jl7iwQhgwpAbGQ==",

-      "license": "ISC"

-    },

-    "node_modules/source-map-js": {

-      "version": "1.2.1",

-      "resolved": "https://registry.npmjs.org/source-map-js/-/source-map-js-1.2.1.tgz",

-      "integrity": "sha512-UXWMKhLOwVKb728IUtQPXxfYU+usdybtUrK/8uGE8CQMvrhOpwvzDBwj0QhSL7MQc7vIsISBG8VQ8+IDQxpfQA==",

-      "license": "BSD-3-Clause",

-      "engines": {

-        "node": ">=0.10.0"

-      }

-    },

-    "node_modules/sshpk": {

-      "version": "1.18.0",

-      "resolved": "https://registry.npmjs.org/sshpk/-/sshpk-1.18.0.tgz",

-      "integrity": "sha512-2p2KJZTSqQ/I3+HX42EpYOa2l3f8Erv8MWKsy2I9uf4wA7yFIkXRffYdsx86y6z4vHtV8u7g+pPlr8/4ouAxsQ==",

-      "license": "MIT",

-      "dependencies": {

-        "asn1": "~0.2.3",

-        "assert-plus": "^1.0.0",

-        "bcrypt-pbkdf": "^1.0.0",

-        "dashdash": "^1.12.0",

-        "ecc-jsbn": "~0.1.1",

-        "getpass": "^0.1.1",

-        "jsbn": "~0.1.0",

-        "safer-buffer": "^2.0.2",

-        "tweetnacl": "~0.14.0"

-      },

-      "bin": {

-        "sshpk-conv": "bin/sshpk-conv",

-        "sshpk-sign": "bin/sshpk-sign",

-        "sshpk-verify": "bin/sshpk-verify"

-      },

-      "engines": {

-        "node": ">=0.10.0"

-      }

-    },

-    "node_modules/streamsearch": {

-      "version": "1.1.0",

-      "resolved": "https://registry.npmjs.org/streamsearch/-/streamsearch-1.1.0.tgz",

-      "integrity": "sha512-Mcc5wHehp9aXz1ax6bZUyY5afg9u2rv5cqQI3mRrYkGC8rW2hM02jWuwjtL++LS5qinSyhj2QfLyNsuc+VsExg==",

-      "engines": {

-        "node": ">=10.0.0"

-      }

-    },

-    "node_modules/string_decoder": {

-      "version": "1.3.0",

-      "resolved": "https://registry.npmjs.org/string_decoder/-/string_decoder-1.3.0.tgz",

-      "integrity": "sha512-hkRX8U1WjJFd8LsDJ2yQ/wWWxaopEsABU1XfkM8A+j0+85JAGppt16cr1Whg6KIbb4okU6Mql6BOj+uup/wKeA==",

-      "license": "MIT",

-      "dependencies": {

-        "safe-buffer": "~5.2.0"

-      }

-    },

-    "node_modules/string-width": {

-      "version": "2.1.1",

-      "resolved": "https://registry.npmjs.org/string-width/-/string-width-2.1.1.tgz",

-      "integrity": "sha512-nOqH59deCq9SRHlxq1Aw85Jnt4w6KvLKqWVik6oA9ZklXLNIOlqg4F2yrT1MVaTjAqvVwdfeZ7w7aCvJD7ugkw==",

-      "license": "MIT",

-      "dependencies": {

-        "is-fullwidth-code-point": "^2.0.0",

-        "strip-ansi": "^4.0.0"

-      },

-      "engines": {

-        "node": ">=4"

-      }

-    },

-    "node_modules/strip-ansi": {

-      "version": "4.0.0",

-      "resolved": "https://registry.npmjs.org/strip-ansi/-/strip-ansi-4.0.0.tgz",

-      "integrity": "sha512-4XaJ2zQdCzROZDivEVIDPkcQn8LMFSa8kj8Gxb/Lnwzv9A8VctNZ+lfivC/sV3ivW8ElJTERXZoPBRrZKkNKow==",

-      "license": "MIT",

-      "dependencies": {

-        "ansi-regex": "^3.0.0"

-      },

-      "engines": {

-        "node": ">=4"

-      }

-    },

-    "node_modules/strip-eof": {

-      "version": "1.0.0",

-      "resolved": "https://registry.npmjs.org/strip-eof/-/strip-eof-1.0.0.tgz",

-      "integrity": "sha512-7FCwGGmx8mD5xQd3RPUvnSpUXHM3BWuzjtpD4TXsfcZ9EL4azvVVUscFYwD9nx8Kh+uCBC00XBtAykoMHwTh8Q==",

-      "license": "MIT",

-      "engines": {

-        "node": ">=0.10.0"

-      }

-    },

-    "node_modules/styled-jsx": {

-      "version": "5.1.1",

-      "resolved": "https://registry.npmjs.org/styled-jsx/-/styled-jsx-5.1.1.tgz",

-      "integrity": "sha512-pW7uC1l4mBZ8ugbiZrcIsiIvVx1UmTfw7UkC3Um2tmfUq9Bhk8IiyEIPl6F8agHgjzku6j0xQEZbfA5uSgSaCw==",

-      "license": "MIT",

-      "dependencies": {

-        "client-only": "0.0.1"

-      },

-      "engines": {

-        "node": ">= 12.0.0"

-      },

-      "peerDependencies": {

-        "react": ">= 16.8.0 || 17.x.x || ^18.0.0-0"

-      },

-      "peerDependenciesMeta": {

-        "@babel/core": {

-          "optional": true

-        },

-        "babel-plugin-macros": {

-          "optional": true

-        }

-      }

-    },

-    "node_modules/supports-color": {

-      "version": "5.5.0",

-      "resolved": "https://registry.npmjs.org/supports-color/-/supports-color-5.5.0.tgz",

-      "integrity": "sha512-QjVjwdXIt408MIiAqCX4oUKsgU2EqAGzs2Ppkm4aQYbjm+ZEWEcW4SfFNTr4uMNZma0ey4f5lgLrkB0aX0QMow==",

-      "license": "MIT",

-      "dependencies": {

-        "has-flag": "^3.0.0"

-      },

-      "engines": {

-        "node": ">=4"

-      }

-    },

-    "node_modules/svg-arc-to-cubic-bezier": {

-      "version": "3.2.0",

-      "resolved": "https://registry.npmjs.org/svg-arc-to-cubic-bezier/-/svg-arc-to-cubic-bezier-3.2.0.tgz",

-      "integrity": "sha512-djbJ/vZKZO+gPoSDThGNpKDO+o+bAeA4XQKovvkNCqnIS2t+S4qnLAGQhyyrulhCFRl1WWzAp0wUDV8PpTVU3g==",

-      "license": "ISC"

-    },

-    "node_modules/swagger2openapi": {

-      "version": "5.4.0",

-      "resolved": "https://registry.npmjs.org/swagger2openapi/-/swagger2openapi-5.4.0.tgz",

-      "integrity": "sha512-f5QqfXawiVijhjMtYqWZ55ESHPZFqrPC8L9idhIiuSX8O2qsa1i4MVGtCM3TQF+Smzr/6WfT/7zBuzG3aTgPAA==",

-      "license": "BSD-3-Clause",

-      "dependencies": {

-        "better-ajv-errors": "^0.6.1",

-        "call-me-maybe": "^1.0.1",

-        "node-fetch-h2": "^2.3.0",

-        "node-readfiles": "^0.2.0",

-        "oas-kit-common": "^1.0.7",

-        "oas-resolver": "^2.3.0",

-        "oas-schema-walker": "^1.1.3",

-        "oas-validator": "^3.4.0",

-        "reftools": "^1.1.0",

-        "yaml": "^1.8.3",

-        "yargs": "^12.0.5"

-      },

-      "bin": {

-        "boast": "boast.js",

-        "oas-validate": "oas-validate.js",

-        "swagger2openapi": "swagger2openapi.js"

-      }

-    },

-    "node_modules/tiny-inflate": {

-      "version": "1.0.3",

-      "resolved": "https://registry.npmjs.org/tiny-inflate/-/tiny-inflate-1.0.3.tgz",

-      "integrity": "sha512-pkY1fj1cKHb2seWDy0B16HeWyczlJA9/WW3u3c4z/NiWDsO3DOU5D7nhTLE9CF0yXv/QZFY7sEJmj24dK+Rrqw==",

-      "license": "MIT"

-    },

-    "node_modules/tough-cookie": {

-      "version": "2.5.0",

-      "resolved": "https://registry.npmjs.org/tough-cookie/-/tough-cookie-2.5.0.tgz",

-      "integrity": "sha512-nlLsUzgm1kfLXSXfRZMc1KLAugd4hqJHDTvc2hDIwS3mZAfMEuMbc03SujMF+GEcpaX/qboeycw6iO8JwVv2+g==",

-      "license": "BSD-3-Clause",

-      "dependencies": {

-        "psl": "^1.1.28",

-        "punycode": "^2.1.1"

-      },

-      "engines": {

-        "node": ">=0.8"

-      }

-    },

-    "node_modules/ts-debounce": {

-      "version": "4.0.0",

-      "resolved": "https://registry.npmjs.org/ts-debounce/-/ts-debounce-4.0.0.tgz",

-      "integrity": "sha512-+1iDGY6NmOGidq7i7xZGA4cm8DAa6fqdYcvO5Z6yBevH++Bdo9Qt/mN0TzHUgcCcKv1gmh9+W5dHqz8pMWbCbg==",

-      "license": "MIT"

-    },

-    "node_modules/tslib": {

-      "version": "1.14.1",

-      "resolved": "https://registry.npmjs.org/tslib/-/tslib-1.14.1.tgz",

-      "integrity": "sha512-Xni35NKzjgMrwevysHTCArtLDpPvye8zV/0E4EyYn43P7/7qvQwPh9BGkHewbMulVntbigmcT7rdX3BNo9wRJg==",

-      "license": "0BSD"

-    },

-    "node_modules/tunnel-agent": {

-      "version": "0.6.0",

-      "resolved": "https://registry.npmjs.org/tunnel-agent/-/tunnel-agent-0.6.0.tgz",

-      "integrity": "sha512-McnNiV1l8RYeY8tBgEpuodCC1mLUdbSN+CYBL7kJsJNInOP8UjDDEwdk6Mw60vdLLrr5NHKZhMAOSrR2NZuQ+w==",

-      "license": "Apache-2.0",

-      "dependencies": {

-        "safe-buffer": "^5.0.1"

-      },

-      "engines": {

-        "node": "*"

-      }

-    },

-    "node_modules/tweetnacl": {

-      "version": "0.14.5",

-      "resolved": "https://registry.npmjs.org/tweetnacl/-/tweetnacl-0.14.5.tgz",

-      "integrity": "sha512-KXXFFdAbFXY4geFIwoyNK+f5Z1b7swfXABfL7HXCmoIWMKU3dmS26672A4EeQtDzLKy7SXmfBu51JolvEKwtGA==",

-      "license": "Unlicense"

-    },

-    "node_modules/typed-emitter": {

-      "version": "2.1.0",

-      "resolved": "https://registry.npmjs.org/typed-emitter/-/typed-emitter-2.1.0.tgz",

-      "integrity": "sha512-g/KzbYKbH5C2vPkaXGu8DJlHrGKHLsM25Zg9WuC9pMGfuvT+X25tZQWo5fK1BjBm8+UrVE9LDCvaY0CQk+fXDA==",

-      "license": "MIT",

-      "optionalDependencies": {

-        "rxjs": "*"

-      }

-    },

-    "node_modules/typescript": {

-      "version": "5.9.3",

-      "resolved": "https://registry.npmjs.org/typescript/-/typescript-5.9.3.tgz",

-      "integrity": "sha512-jl1vZzPDinLr9eUt3J/t7V6FgNEw9QjvBPdysz9KfQDD41fQrC2Y4vKQdiaUpFT4bXlb1RHhLpp8wtm6M5TgSw==",

-      "dev": true,

-      "license": "Apache-2.0",

-      "bin": {

-        "tsc": "bin/tsc",

-        "tsserver": "bin/tsserver"

-      },

-      "engines": {

-        "node": ">=14.17"

-      }

-    },

-    "node_modules/undici-types": {

-      "version": "5.28.4",

-      "resolved": "https://registry.npmjs.org/undici-types/-/undici-types-5.28.4.tgz",

-      "integrity": "sha512-3OeMF5Lyowe8VW0skf5qaIE7Or3yS9LS7fvMUI0gg4YxpIBVg0L8BxCmROw2CcYhSkpR68Epz7CGc8MPj94Uww==",

-      "license": "MIT"

-    },

-    "node_modules/unicode-properties": {

-      "version": "1.4.1",

-      "resolved": "https://registry.npmjs.org/unicode-properties/-/unicode-properties-1.4.1.tgz",

-      "integrity": "sha512-CLjCCLQ6UuMxWnbIylkisbRj31qxHPAurvena/0iwSVbQ2G1VY5/HjV0IRabOEbDHlzZlRdCrD4NhB0JtU40Pg==",

-      "license": "MIT",

-      "dependencies": {

-        "base64-js": "^1.3.0",

-        "unicode-trie": "^2.0.0"

-      }

-    },

-    "node_modules/unicode-trie": {

-      "version": "2.0.0",

-      "resolved": "https://registry.npmjs.org/unicode-trie/-/unicode-trie-2.0.0.tgz",

-      "integrity": "sha512-x7bc76x0bm4prf1VLg79uhAzKw8DVboClSN5VxJuQ+LKDOVEW9CdH+VY7SP+vX7xCYQqzzgQpFqz15zeLvAtZQ==",

-      "license": "MIT",

-      "dependencies": {

-        "pako": "^0.2.5",

-        "tiny-inflate": "^1.0.0"

-      }

-    },

-    "node_modules/unicode-trie/node_modules/pako": {

-      "version": "0.2.9",

-      "resolved": "https://registry.npmjs.org/pako/-/pako-0.2.9.tgz",

-      "integrity": "sha512-NUcwaKxUxWrZLpDG+z/xZaCgQITkA/Dv4V/T6bw7VON6l1Xz/VnrBqrYjZQ12TamKHzITTfOEIYUj48y2KXImA==",

-      "license": "MIT"

-    },

-    "node_modules/uri-js": {

-      "version": "4.4.1",

-      "resolved": "https://registry.npmjs.org/uri-js/-/uri-js-4.4.1.tgz",

-      "integrity": "sha512-7rKUyy33Q1yc98pQ1DAmLtwX109F7TIfWlW1Ydo8Wl1ii1SeHieeh0HHfPeL2fMXK6z0s8ecKs9frCuLJvndBg==",

-      "license": "BSD-2-Clause",

-      "dependencies": {

-        "punycode": "^2.1.0"

-      }

-    },

-    "node_modules/util-deprecate": {

-      "version": "1.0.2",

-      "resolved": "https://registry.npmjs.org/util-deprecate/-/util-deprecate-1.0.2.tgz",

-      "integrity": "sha512-EPD5q1uXyFxJpCrLnCc1nHnq3gOa6DZBocAIiI2TaSCA7VCJ1UJDMagCzIkXNsUYfD1daK//LTEQ8xiIbrHtcw==",

-      "license": "MIT"

-    },

-    "node_modules/uuid": {

-      "version": "3.4.0",

-      "resolved": "https://registry.npmjs.org/uuid/-/uuid-3.4.0.tgz",

-      "integrity": "sha512-HjSDRw6gZE5JMggctHBcjVak08+KEVhSIiDzFnT9S9aegmp85S/bReBVTb4QTFaRNptJ9kuYaNhnbNEOkbKb/A==",

-      "deprecated": "uuid@10 and below is no longer supported.  For ESM codebases, update to uuid@latest.  For CommonJS codebases, use uuid@11 (but be aware this version will likely be deprecated in 2028).",

-      "license": "MIT",

-      "bin": {

-        "uuid": "bin/uuid"

-      }

-    },

-    "node_modules/verror": {

-      "version": "1.10.1",

-      "resolved": "https://registry.npmjs.org/verror/-/verror-1.10.1.tgz",

-      "integrity": "sha512-veufcmxri4e3XSrT0xwfUR7kguIkaxBeosDg00yDWhk49wdwkSUrvvsm7nc75e1PUyvIeZj6nS8VQRYz2/S4Xg==",

-      "license": "MIT",

-      "dependencies": {

-        "assert-plus": "^1.0.0",

-        "core-util-is": "1.0.2",

-        "extsprintf": "^1.2.0"

-      },

-      "engines": {

-        "node": ">=0.6.0"

-      }

-    },

-    "node_modules/verror/node_modules/core-util-is": {

-      "version": "1.0.2",

-      "resolved": "https://registry.npmjs.org/core-util-is/-/core-util-is-1.0.2.tgz",

-      "integrity": "sha512-3lqz5YjWTYnW6dlDa5TLaTCcShfar1e40rmcJVwCBJC6mWlFuj0eCHIElmG1g5kyuJ/GD+8Wn4FFCcz4gJPfaQ==",

-      "license": "MIT"

-    },

-    "node_modules/vite-compatible-readable-stream": {

-      "version": "3.6.1",

-      "resolved": "https://registry.npmjs.org/vite-compatible-readable-stream/-/vite-compatible-readable-stream-3.6.1.tgz",

-      "integrity": "sha512-t20zYkrSf868+j/p31cRIGN28Phrjm3nRSLR2fyc2tiWi4cZGVdv68yNlwnIINTkMTmPoMiSlc0OadaO7DXZaQ==",

-      "license": "MIT",

-      "dependencies": {

-        "inherits": "^2.0.3",

-        "string_decoder": "^1.1.1",

-        "util-deprecate": "^1.0.1"

-      },

-      "engines": {

-        "node": ">= 6"

-      }

-    },

-    "node_modules/webrtc-adapter": {

-      "version": "9.0.6",

-      "resolved": "https://registry.npmjs.org/webrtc-adapter/-/webrtc-adapter-9.0.6.tgz",

-      "integrity": "sha512-CHbl2ZQbxx164IgWRgzJno4hWtM4tFbRam1QfI3Yxhs3w/DvqluVxVWeXs3oL5/fbGkSNLKo0Ty5MgUWceNhog==",

-      "license": "BSD-3-Clause",

-      "dependencies": {

-        "sdp": "^3.2.0"

-      },

-      "engines": {

-        "node": ">=6.0.0",

-        "npm": ">=3.10.0"

-      }

-    },

-    "node_modules/webrtc-issue-detector": {

-      "version": "1.16.3",

-      "resolved": "https://registry.npmjs.org/webrtc-issue-detector/-/webrtc-issue-detector-1.16.3.tgz",

-      "integrity": "sha512-VDBeCa1ZfZaErynTfs/YgziSLtSXF9INXP6ciCtgBJI95pzT+CaRUvi1DmDFpyGuRvuox9CQCdjShl+qiIFfkw==",

-      "license": "MIT"

-    },

-    "node_modules/which": {

-      "version": "1.3.1",

-      "resolved": "https://registry.npmjs.org/which/-/which-1.3.1.tgz",

-      "integrity": "sha512-HxJdYWq1MTIQbJ3nw0cqssHoTNU267KlrDuGZ1WYlxDStUtKUhOaJmh112/TZmHxxUfuJqPXSOm7tDyas0OSIQ==",

-      "license": "ISC",

-      "dependencies": {

-        "isexe": "^2.0.0"

-      },

-      "bin": {

-        "which": "bin/which"

-      }

-    },

-    "node_modules/which-module": {

-      "version": "2.0.1",

-      "resolved": "https://registry.npmjs.org/which-module/-/which-module-2.0.1.tgz",

-      "integrity": "sha512-iBdZ57RDvnOR9AGBhML2vFZf7h8vmBjhoaZqODJBFWHVtKkDmKuHai3cx5PgVMrX5YDNp27AofYbAwctSS+vhQ==",

-      "license": "ISC"

-    },

-    "node_modules/wrap-ansi": {

-      "version": "2.1.0",

-      "resolved": "https://registry.npmjs.org/wrap-ansi/-/wrap-ansi-2.1.0.tgz",

-      "integrity": "sha512-vAaEaDM946gbNpH5pLVNR+vX2ht6n0Bt3GXwVB1AuAqZosOvHNF3P7wDnh8KLkSqgUh0uh77le7Owgoz+Z9XBw==",

-      "license": "MIT",

-      "dependencies": {

-        "string-width": "^1.0.1",

-        "strip-ansi": "^3.0.1"

-      },

-      "engines": {

-        "node": ">=0.10.0"

-      }

-    },

-    "node_modules/wrap-ansi/node_modules/ansi-regex": {

-      "version": "2.1.1",

-      "resolved": "https://registry.npmjs.org/ansi-regex/-/ansi-regex-2.1.1.tgz",

-      "integrity": "sha512-TIGnTpdo+E3+pCyAluZvtED5p5wCqLdezCyhPZzKPcxvFplEt4i+W7OONCKgeZFT3+y5NZZfOOS/Bdcanm1MYA==",

-      "license": "MIT",

-      "engines": {

-        "node": ">=0.10.0"

-      }

-    },

-    "node_modules/wrap-ansi/node_modules/is-fullwidth-code-point": {

-      "version": "1.0.0",

-      "resolved": "https://registry.npmjs.org/is-fullwidth-code-point/-/is-fullwidth-code-point-1.0.0.tgz",

-      "integrity": "sha512-1pqUqRjkhPJ9miNq9SwMfdvi6lBJcd6eFxvfaivQhaH3SgisfiuudvFntdKOmxuee/77l+FPjKrQjWvmPjWrRw==",

-      "license": "MIT",

-      "dependencies": {

-        "number-is-nan": "^1.0.0"

-      },

-      "engines": {

-        "node": ">=0.10.0"

-      }

-    },

-    "node_modules/wrap-ansi/node_modules/string-width": {

-      "version": "1.0.2",

-      "resolved": "https://registry.npmjs.org/string-width/-/string-width-1.0.2.tgz",

-      "integrity": "sha512-0XsVpQLnVCXHJfyEs8tC0zpTVIr5PKKsQtkT29IwupnPTjtPmQ3xT/4yCREF9hYkV/3M3kzcUTSAZT6a6h81tw==",

-      "license": "MIT",

-      "dependencies": {

-        "code-point-at": "^1.0.0",

-        "is-fullwidth-code-point": "^1.0.0",

-        "strip-ansi": "^3.0.0"

-      },

-      "engines": {

-        "node": ">=0.10.0"

-      }

-    },

-    "node_modules/wrap-ansi/node_modules/strip-ansi": {

-      "version": "3.0.1",

-      "resolved": "https://registry.npmjs.org/strip-ansi/-/strip-ansi-3.0.1.tgz",

-      "integrity": "sha512-VhumSSbBqDTP8p2ZLKj40UjBCV4+v8bUSEpUb4KjRgWk9pbqGF4REFj6KEagidb2f/M6AzC0EmFyDNGaw9OCzg==",

-      "license": "MIT",

-      "dependencies": {

-        "ansi-regex": "^2.0.0"

-      },

-      "engines": {

-        "node": ">=0.10.0"

-      }

-    },

-    "node_modules/wrappy": {

-      "version": "1.0.2",

-      "resolved": "https://registry.npmjs.org/wrappy/-/wrappy-1.0.2.tgz",

-      "integrity": "sha512-l4Sp/DRseor9wL6EvV2+TuQn63dMkPjZ/sp9XkghTEbV9KlPS1xUsZ3u7/IQO4wxtcFB4bgpQPRcR3QCvezPcQ==",

-      "license": "ISC"

-    },

-    "node_modules/y18n": {

-      "version": "4.0.3",

-      "resolved": "https://registry.npmjs.org/y18n/-/y18n-4.0.3.tgz",

-      "integrity": "sha512-JKhqTOwSrqNA1NY5lSztJ1GrBiUodLMmIZuLiDaMRJ+itFd+ABVE8XBjOvIWL+rSqNDC74LCSFmlb/U4UZ4hJQ==",

-      "license": "ISC"

-    },

-    "node_modules/yaml": {

-      "version": "1.10.3",

-      "resolved": "https://registry.npmjs.org/yaml/-/yaml-1.10.3.tgz",

-      "integrity": "sha512-vIYeF1u3CjlhAFekPPAk2h/Kv4T3mAkMox5OymRiJQB0spDP10LHvt+K7G9Ny6NuuMAb25/6n1qyUjAcGNf/AA==",

-      "license": "ISC",

-      "engines": {

-        "node": ">= 6"

-      }

-    },

-    "node_modules/yargs": {

-      "version": "12.0.5",

-      "resolved": "https://registry.npmjs.org/yargs/-/yargs-12.0.5.tgz",

-      "integrity": "sha512-Lhz8TLaYnxq/2ObqHDql8dX8CJi97oHxrjUcYtzKbbykPtVW9WB+poxI+NM2UIzsMgNCZTIf0AQwsjK5yMAqZw==",

-      "license": "MIT",

-      "dependencies": {

-        "cliui": "^4.0.0",

-        "decamelize": "^1.2.0",

-        "find-up": "^3.0.0",

-        "get-caller-file": "^1.0.1",

-        "os-locale": "^3.0.0",

-        "require-directory": "^2.1.1",

-        "require-main-filename": "^1.0.1",

-        "set-blocking": "^2.0.0",

-        "string-width": "^2.0.0",

-        "which-module": "^2.0.0",

-        "y18n": "^3.2.1 || ^4.0.0",

-        "yargs-parser": "^11.1.1"

-      }

-    },

-    "node_modules/yargs-parser": {

-      "version": "11.1.1",

-      "resolved": "https://registry.npmjs.org/yargs-parser/-/yargs-parser-11.1.1.tgz",

-      "integrity": "sha512-C6kB/WJDiaxONLJQnF8ccx9SEeoTTLek8RVbaOIsrAUS8VrBEXfmeSnCZxygc+XC2sNMBIwOOnfcxiynjHsVSQ==",

-      "license": "ISC",

-      "dependencies": {

-        "camelcase": "^5.0.0",

-        "decamelize": "^1.2.0"

-      }

-    },

-    "node_modules/yoga-layout": {

-      "version": "3.2.1",

-      "resolved": "https://registry.npmjs.org/yoga-layout/-/yoga-layout-3.2.1.tgz",

-      "integrity": "sha512-0LPOt3AxKqMdFBZA3HBAt/t/8vIKq7VaQYbuA8WxCgung+p9TVyKRYdpvCb80HcdTN2NkbIKbhNwKUfm3tQywQ==",

-      "license": "MIT"

-    }

-  }

-}

+{
+  "name": "interviewai",
+  "version": "1.0.0",
+  "lockfileVersion": 3,
+  "requires": true,
+  "packages": {
+    "": {
+      "name": "interviewai",
+      "version": "1.0.0",
+      "dependencies": {
+        "@heygen/liveavatar-web-sdk": "^0.0.18",
+        "@heygen/streaming-avatar": "^1.0.11",
+        "@supabase/ssr": "^0.12.3",
+        "@supabase/supabase-js": "^2.108.2",
+        "jspdf": "4.2.1",
+        "next": "^14.2.5",
+        "react": "^18",
+        "react-dom": "^18"
+      },
+      "devDependencies": {
+        "@types/node": "^20",
+        "@types/react": "^18",
+        "@types/react-dom": "^18",
+        "typescript": "^5"
+      }
+    },
+    "node_modules/@babel/code-frame": {
+      "version": "7.29.7",
+      "resolved": "https://registry.npmjs.org/@babel/code-frame/-/code-frame-7.29.7.tgz",
+      "integrity": "sha512-Aup7aUOfpbAUg2ROOJN6Iw5f9DMBlzu0mIkm/malLQFN/YQgO48wCj0Kxa3sEHJvPVFg7siR+qRInwXd2qhQKw==",
+      "license": "MIT",
+      "dependencies": {
+        "@babel/helper-validator-identifier": "^7.29.7",
+        "js-tokens": "^4.0.0",
+        "picocolors": "^1.1.1"
+      },
+      "engines": {
+        "node": ">=6.9.0"
+      }
+    },
+    "node_modules/@babel/helper-validator-identifier": {
+      "version": "7.29.7",
+      "resolved": "https://registry.npmjs.org/@babel/helper-validator-identifier/-/helper-validator-identifier-7.29.7.tgz",
+      "integrity": "sha512-qehxGkRj55h/ff8EMaJ+cYhyaKlHIxqYDn682wQD7RNp9UujOQsHog2uS0r2vzr4pW+sXf90NeeayjcNaX3fFg==",
+      "license": "MIT",
+      "engines": {
+        "node": ">=6.9.0"
+      }
+    },
+    "node_modules/@babel/runtime": {
+      "version": "7.29.7",
+      "resolved": "https://registry.npmjs.org/@babel/runtime/-/runtime-7.29.7.tgz",
+      "integrity": "sha512-Nq8OhGWiZIZGV6hLHoyAKLLcJihP/xFeBMGJoUrxTX2psI8dCifzLhZISFb+VWS3wFMRDmCGw5R+dOySCqPLhw==",
+      "license": "MIT",
+      "engines": {
+        "node": ">=6.9.0"
+      }
+    },
+    "node_modules/@bufbuild/protobuf": {
+      "version": "1.10.1",
+      "resolved": "https://registry.npmjs.org/@bufbuild/protobuf/-/protobuf-1.10.1.tgz",
+      "integrity": "sha512-wJ8ReQbHxsAfXhrf9ixl0aYbZorRuOWpBNzm8pL8ftmSxQx/wnJD5Eg861NwJU/czy2VXFIebCeZnZrI9rktIQ==",
+      "license": "(Apache-2.0 AND BSD-3-Clause)"
+    },
+    "node_modules/@exodus/schemasafe": {
+      "version": "1.3.0",
+      "resolved": "https://registry.npmjs.org/@exodus/schemasafe/-/schemasafe-1.3.0.tgz",
+      "integrity": "sha512-5Aap/GaRupgNx/feGBwLLTVv8OQFfv3pq2lPRzPg9R+IOBnDgghTGW7l7EuVXOvg5cc/xSAlRW8rBrjIC3Nvqw==",
+      "license": "MIT"
+    },
+    "node_modules/@heygen/liveavatar-web-sdk": {
+      "version": "0.0.18",
+      "resolved": "https://registry.npmjs.org/@heygen/liveavatar-web-sdk/-/liveavatar-web-sdk-0.0.18.tgz",
+      "integrity": "sha512-5acXQbqYLc7GXymutTXSrp4KSrk2/NRCf8UIU7JVuO76O8InVOM3YpwhdZBmTWuB+6Mght/vg07ljKZM2D1FcQ==",
+      "license": "MIT",
+      "dependencies": {
+        "events": "3.3.0",
+        "livekit-client": "2.15.7",
+        "typed-emitter": "2.1.0",
+        "webrtc-issue-detector": "1.16.3"
+      }
+    },
+    "node_modules/@heygen/streaming-avatar": {
+      "version": "1.0.16",
+      "resolved": "https://registry.npmjs.org/@heygen/streaming-avatar/-/streaming-avatar-1.0.16.tgz",
+      "integrity": "sha512-ucJdE2iYTALKRglB/2ztWEp9nu5ygBf/pZlf8kfxGXFKG+W98LPtdTB+v66rXRuPG+vuRFf6XYuxnloiKgPAzA==",
+      "deprecated": "Deprecated. Migrate to @heygen/liveavatar-web-sdk — run: npm i @heygen/liveavatar-web-sdk",
+      "license": "MIT",
+      "dependencies": {
+        "a-sync-waterfall": "^1.0.1",
+        "ajv": "^6.12.6",
+        "ansi-regex": "^3.0.1",
+        "ansi-styles": "^3.2.1",
+        "asap": "^2.0.6",
+        "asn1": "^0.2.6",
+        "assert-plus": "^1.0.0",
+        "asynckit": "^0.4.0",
+        "aws-sign2": "^0.7.0",
+        "aws4": "^1.13.0",
+        "bcrypt-pbkdf": "^1.0.2",
+        "better-ajv-errors": "^0.6.7",
+        "call-me-maybe": "^1.0.2",
+        "camelcase": "^5.3.1",
+        "caseless": "^0.12.0",
+        "chalk": "^2.4.2",
+        "cliui": "^4.1.0",
+        "co": "^4.6.0",
+        "code-error-fragment": "^0.0.230",
+        "code-point-at": "^1.1.0",
+        "color-convert": "^1.9.3",
+        "color-name": "^1.1.3",
+        "colorful": "^2.1.0",
+        "combined-stream": "^1.0.8",
+        "commander": "^2.20.3",
+        "core-js": "^3.37.1",
+        "core-util-is": "^1.0.2",
+        "cross-spawn": "^6.0.5",
+        "dashdash": "^1.14.1",
+        "debug": "^4.3.5",
+        "decamelize": "^1.2.0",
+        "delayed-stream": "^1.0.0",
+        "ecc-jsbn": "^0.1.2",
+        "emoji-regex": "^8.0.0",
+        "end-of-stream": "^1.4.4",
+        "es6-promise": "^3.3.1",
+        "escalade": "^3.1.2",
+        "escape-string-regexp": "^1.0.5",
+        "execa": "^1.0.0",
+        "extend": "^3.0.2",
+        "extsprintf": "^1.3.0",
+        "fast-deep-equal": "^3.1.3",
+        "fast-json-stable-stringify": "^2.1.0",
+        "fast-safe-stringify": "^2.1.1",
+        "find-up": "^3.0.0",
+        "forever-agent": "^0.6.1",
+        "form-data": "^2.5.1",
+        "get-caller-file": "^1.0.3",
+        "get-stream": "^4.1.0",
+        "getpass": "^0.1.7",
+        "grapheme-splitter": "^1.0.4",
+        "har-schema": "^2.0.0",
+        "har-validator": "^5.1.5",
+        "has-flag": "^3.0.0",
+        "http-signature": "^1.2.0",
+        "http2-client": "^1.3.5",
+        "invert-kv": "^2.0.0",
+        "is-fullwidth-code-point": "^2.0.0",
+        "is-stream": "^1.1.0",
+        "is-typedarray": "^1.0.0",
+        "isexe": "^2.0.0",
+        "isstream": "^0.1.2",
+        "js-tokens": "^4.0.0",
+        "jsbn": "^0.1.1",
+        "json-schema": "^0.4.0",
+        "json-schema-traverse": "^0.4.1",
+        "json-stringify-safe": "^5.0.1",
+        "json-to-ast": "^2.1.0",
+        "jsonpointer": "^4.1.0",
+        "jsprim": "^1.4.2",
+        "lcid": "^2.0.0",
+        "leven": "^3.1.0",
+        "locate-path": "^3.0.0",
+        "map-age-cleaner": "^0.1.3",
+        "mem": "^4.3.0",
+        "mime-db": "^1.52.0",
+        "mime-types": "^2.1.35",
+        "mimic-fn": "^2.1.0",
+        "ms": "^2.1.2",
+        "nice-try": "^1.0.5",
+        "node-fetch-h2": "^2.3.0",
+        "node-readfiles": "^0.2.0",
+        "npm-run-path": "^2.0.2",
+        "number-is-nan": "^1.0.1",
+        "nunjucks": "^3.2.4",
+        "oas-kit-common": "^1.0.8",
+        "oas-linter": "^3.2.2",
+        "oas-resolver": "^2.5.6",
+        "oas-schema-walker": "^1.1.5",
+        "oas-validator": "^3.4.0",
+        "oauth-sign": "^0.9.0",
+        "once": "^1.4.0",
+        "openapi-generator": "^0.1.39",
+        "openapi3-ts": "^1.4.0",
+        "os-locale": "^3.1.0",
+        "p-defer": "^1.0.0",
+        "p-finally": "^1.0.0",
+        "p-is-promise": "^2.1.0",
+        "p-limit": "^2.3.0",
+        "p-locate": "^3.0.0",
+        "p-try": "^2.2.0",
+        "path-exists": "^3.0.0",
+        "path-key": "^2.0.1",
+        "performance-now": "^2.1.0",
+        "picocolors": "^1.0.1",
+        "psl": "^1.9.0",
+        "pump": "^3.0.0",
+        "punycode": "^2.3.1",
+        "qs": "^6.5.3",
+        "reftools": "^1.1.9",
+        "regenerator-runtime": "^0.14.1",
+        "request": "^2.88.2",
+        "require-directory": "^2.1.1",
+        "require-main-filename": "^1.0.1",
+        "safe-buffer": "^5.2.1",
+        "safer-buffer": "^2.1.2",
+        "semver": "^5.7.2",
+        "set-blocking": "^2.0.0",
+        "shebang-command": "^1.2.0",
+        "shebang-regex": "^1.0.0",
+        "should": "^13.2.3",
+        "should-equal": "^2.0.0",
+        "should-format": "^3.0.3",
+        "should-type": "^1.4.0",
+        "should-type-adaptors": "^1.1.0",
+        "should-util": "^1.0.1",
+        "signal-exit": "^3.0.7",
+        "sshpk": "^1.18.0",
+        "string-width": "^2.1.1",
+        "strip-ansi": "^4.0.0",
+        "strip-eof": "^1.0.0",
+        "supports-color": "^5.5.0",
+        "swagger2openapi": "^5.4.0",
+        "tough-cookie": "^2.5.0",
+        "tslib": "^1.14.1",
+        "tunnel-agent": "^0.6.0",
+        "tweetnacl": "^0.14.5",
+        "undici-types": "^5.26.5",
+        "uri-js": "^4.4.1",
+        "uuid": "^3.4.0",
+        "verror": "^1.10.0",
+        "which": "^1.3.1",
+        "which-module": "^2.0.1",
+        "wrap-ansi": "^2.1.0",
+        "wrappy": "^1.0.2",
+        "y18n": "^4.0.3",
+        "yaml": "^1.10.2",
+        "yargs": "^12.0.5",
+        "yargs-parser": "^11.1.1"
+      }
+    },
+    "node_modules/@livekit/mutex": {
+      "version": "1.1.1",
+      "resolved": "https://registry.npmjs.org/@livekit/mutex/-/mutex-1.1.1.tgz",
+      "integrity": "sha512-EsshAucklmpuUAfkABPxJNhzj9v2sG7JuzFDL4ML1oJQSV14sqrpTYnsaOudMAw9yOaW53NU3QQTlUQoRs4czw==",
+      "license": "Apache-2.0"
+    },
+    "node_modules/@livekit/protocol": {
+      "version": "1.39.3",
+      "resolved": "https://registry.npmjs.org/@livekit/protocol/-/protocol-1.39.3.tgz",
+      "integrity": "sha512-hfOnbwPCeZBEvMRdRhU2sr46mjGXavQcrb3BFRfG+Gm0Z7WUSeFdy5WLstXJzEepz17Iwp/lkGwJ4ZgOOYfPuA==",
+      "license": "Apache-2.0",
+      "dependencies": {
+        "@bufbuild/protobuf": "^1.10.0"
+      }
+    },
+    "node_modules/@next/env": {
+      "version": "14.2.5",
+      "resolved": "https://registry.npmjs.org/@next/env/-/env-14.2.5.tgz",
+      "integrity": "sha512-/zZGkrTOsraVfYjGP8uM0p6r0BDT6xWpkjdVbcz66PJVSpwXX3yNiRycxAuDfBKGWBrZBXRuK/YVlkNgxHGwmA==",
+      "license": "MIT"
+    },
+    "node_modules/@next/swc-darwin-arm64": {
+      "version": "14.2.5",
+      "resolved": "https://registry.npmjs.org/@next/swc-darwin-arm64/-/swc-darwin-arm64-14.2.5.tgz",
+      "integrity": "sha512-/9zVxJ+K9lrzSGli1///ujyRfon/ZneeZ+v4ptpiPoOU+GKZnm8Wj8ELWU1Pm7GHltYRBklmXMTUqM/DqQ99FQ==",
+      "cpu": [
+        "arm64"
+      ],
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "darwin"
+      ],
+      "engines": {
+        "node": ">= 10"
+      }
+    },
+    "node_modules/@next/swc-darwin-x64": {
+      "version": "14.2.5",
+      "resolved": "https://registry.npmjs.org/@next/swc-darwin-x64/-/swc-darwin-x64-14.2.5.tgz",
+      "integrity": "sha512-vXHOPCwfDe9qLDuq7U1OYM2wUY+KQ4Ex6ozwsKxp26BlJ6XXbHleOUldenM67JRyBfVjv371oneEvYd3H2gNSA==",
+      "cpu": [
+        "x64"
+      ],
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "darwin"
+      ],
+      "engines": {
+        "node": ">= 10"
+      }
+    },
+    "node_modules/@next/swc-linux-arm64-gnu": {
+      "version": "14.2.5",
+      "resolved": "https://registry.npmjs.org/@next/swc-linux-arm64-gnu/-/swc-linux-arm64-gnu-14.2.5.tgz",
+      "integrity": "sha512-vlhB8wI+lj8q1ExFW8lbWutA4M2ZazQNvMWuEDqZcuJJc78iUnLdPPunBPX8rC4IgT6lIx/adB+Cwrl99MzNaA==",
+      "cpu": [
+        "arm64"
+      ],
+      "libc": [
+        "glibc"
+      ],
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "engines": {
+        "node": ">= 10"
+      }
+    },
+    "node_modules/@next/swc-linux-arm64-musl": {
+      "version": "14.2.5",
+      "resolved": "https://registry.npmjs.org/@next/swc-linux-arm64-musl/-/swc-linux-arm64-musl-14.2.5.tgz",
+      "integrity": "sha512-NpDB9NUR2t0hXzJJwQSGu1IAOYybsfeB+LxpGsXrRIb7QOrYmidJz3shzY8cM6+rO4Aojuef0N/PEaX18pi9OA==",
+      "cpu": [
+        "arm64"
+      ],
+      "libc": [
+        "musl"
+      ],
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "engines": {
+        "node": ">= 10"
+      }
+    },
+    "node_modules/@next/swc-linux-x64-gnu": {
+      "version": "14.2.5",
+      "resolved": "https://registry.npmjs.org/@next/swc-linux-x64-gnu/-/swc-linux-x64-gnu-14.2.5.tgz",
+      "integrity": "sha512-8XFikMSxWleYNryWIjiCX+gU201YS+erTUidKdyOVYi5qUQo/gRxv/3N1oZFCgqpesN6FPeqGM72Zve+nReVXQ==",
+      "cpu": [
+        "x64"
+      ],
+      "libc": [
+        "glibc"
+      ],
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "engines": {
+        "node": ">= 10"
+      }
+    },
+    "node_modules/@next/swc-linux-x64-musl": {
+      "version": "14.2.5",
+      "resolved": "https://registry.npmjs.org/@next/swc-linux-x64-musl/-/swc-linux-x64-musl-14.2.5.tgz",
+      "integrity": "sha512-6QLwi7RaYiQDcRDSU/os40r5o06b5ue7Jsk5JgdRBGGp8l37RZEh9JsLSM8QF0YDsgcosSeHjglgqi25+m04IQ==",
+      "cpu": [
+        "x64"
+      ],
+      "libc": [
+        "musl"
+      ],
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "engines": {
+        "node": ">= 10"
+      }
+    },
+    "node_modules/@next/swc-win32-arm64-msvc": {
+      "version": "14.2.5",
+      "resolved": "https://registry.npmjs.org/@next/swc-win32-arm64-msvc/-/swc-win32-arm64-msvc-14.2.5.tgz",
+      "integrity": "sha512-1GpG2VhbspO+aYoMOQPQiqc/tG3LzmsdBH0LhnDS3JrtDx2QmzXe0B6mSZZiN3Bq7IOMXxv1nlsjzoS1+9mzZw==",
+      "cpu": [
+        "arm64"
+      ],
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "win32"
+      ],
+      "engines": {
+        "node": ">= 10"
+      }
+    },
+    "node_modules/@next/swc-win32-ia32-msvc": {
+      "version": "14.2.5",
+      "resolved": "https://registry.npmjs.org/@next/swc-win32-ia32-msvc/-/swc-win32-ia32-msvc-14.2.5.tgz",
+      "integrity": "sha512-Igh9ZlxwvCDsu6438FXlQTHlRno4gFpJzqPjSIBZooD22tKeI4fE/YMRoHVJHmrQ2P5YL1DoZ0qaOKkbeFWeMg==",
+      "cpu": [
+        "ia32"
+      ],
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "win32"
+      ],
+      "engines": {
+        "node": ">= 10"
+      }
+    },
+    "node_modules/@next/swc-win32-x64-msvc": {
+      "version": "14.2.5",
+      "resolved": "https://registry.npmjs.org/@next/swc-win32-x64-msvc/-/swc-win32-x64-msvc-14.2.5.tgz",
+      "integrity": "sha512-tEQ7oinq1/CjSG9uSTerca3v4AZ+dFa+4Yu6ihaG8Ud8ddqLQgFGcnwYls13H5X5CPDPZJdYxyeMui6muOLd4g==",
+      "cpu": [
+        "x64"
+      ],
+      "license": "MIT",
+      "optional": true,
+      "os": [
+        "win32"
+      ],
+      "engines": {
+        "node": ">= 10"
+      }
+    },
+    "node_modules/@supabase/auth-js": {
+      "version": "2.110.8",
+      "resolved": "https://registry.npmjs.org/@supabase/auth-js/-/auth-js-2.110.8.tgz",
+      "integrity": "sha512-TQ5neTUDX2C2WmyYa03yGhLMkhdE/SkHXtK8/qxO/APUy3rsymsJCBP48p4jcN6iO2G0ow6RRexQd2mX+dSyJg==",
+      "license": "MIT",
+      "dependencies": {
+        "tslib": "2.8.1"
+      },
+      "engines": {
+        "node": ">=22.0.0"
+      }
+    },
+    "node_modules/@supabase/auth-js/node_modules/tslib": {
+      "version": "2.8.1",
+      "resolved": "https://registry.npmjs.org/tslib/-/tslib-2.8.1.tgz",
+      "integrity": "sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w==",
+      "license": "0BSD"
+    },
+    "node_modules/@supabase/functions-js": {
+      "version": "2.110.8",
+      "resolved": "https://registry.npmjs.org/@supabase/functions-js/-/functions-js-2.110.8.tgz",
+      "integrity": "sha512-5yB9TLYzvv2oSQxwb0gamEvIAsuH66pVt7AM/pz03S7wN6ehD34GNgbShrccetqPedXQSz7e/1hAJ9NeEhoZVg==",
+      "license": "MIT",
+      "dependencies": {
+        "tslib": "2.8.1"
+      },
+      "engines": {
+        "node": ">=22.0.0"
+      }
+    },
+    "node_modules/@supabase/functions-js/node_modules/tslib": {
+      "version": "2.8.1",
+      "resolved": "https://registry.npmjs.org/tslib/-/tslib-2.8.1.tgz",
+      "integrity": "sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w==",
+      "license": "0BSD"
+    },
+    "node_modules/@supabase/phoenix": {
+      "version": "0.4.5",
+      "resolved": "https://registry.npmjs.org/@supabase/phoenix/-/phoenix-0.4.5.tgz",
+      "integrity": "sha512-aAn9H9ovVyeApKy11OWOrrOGq8DV68yWeH4ud2lN9fzn4aO8Zb5GLL9m1pUg9nLqIcT+ZDfAcsZe0E/nqdv2lw==",
+      "license": "MIT"
+    },
+    "node_modules/@supabase/postgrest-js": {
+      "version": "2.110.8",
+      "resolved": "https://registry.npmjs.org/@supabase/postgrest-js/-/postgrest-js-2.110.8.tgz",
+      "integrity": "sha512-QeRROxl1PpOZw5Jzi7BwdN9icsycMrLlCCvsjS0hYLW+nZoaT46zdagz/glJirj8jHF4jSd5Jyipuae2cBClCw==",
+      "license": "MIT",
+      "dependencies": {
+        "tslib": "2.8.1"
+      },
+      "engines": {
+        "node": ">=22.0.0"
+      }
+    },
+    "node_modules/@supabase/postgrest-js/node_modules/tslib": {
+      "version": "2.8.1",
+      "resolved": "https://registry.npmjs.org/tslib/-/tslib-2.8.1.tgz",
+      "integrity": "sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w==",
+      "license": "0BSD"
+    },
+    "node_modules/@supabase/realtime-js": {
+      "version": "2.110.8",
+      "resolved": "https://registry.npmjs.org/@supabase/realtime-js/-/realtime-js-2.110.8.tgz",
+      "integrity": "sha512-mwX7ituX6O31fLf+0g65rpLlNxqgnMaPltPsQwzox6jfmbfVl3tCxXrfr3HEsQcCRjpjuJG1+A0vFzP1yVjKHA==",
+      "license": "MIT",
+      "dependencies": {
+        "@supabase/phoenix": "0.4.5",
+        "tslib": "2.8.1"
+      },
+      "engines": {
+        "node": ">=22.0.0"
+      }
+    },
+    "node_modules/@supabase/realtime-js/node_modules/tslib": {
+      "version": "2.8.1",
+      "resolved": "https://registry.npmjs.org/tslib/-/tslib-2.8.1.tgz",
+      "integrity": "sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w==",
+      "license": "0BSD"
+    },
+    "node_modules/@supabase/ssr": {
+      "version": "0.12.3",
+      "resolved": "https://registry.npmjs.org/@supabase/ssr/-/ssr-0.12.3.tgz",
+      "integrity": "sha512-qWXJ/dI7CiYDKyTgIPqJ4Qkh8y5edh2LdF/nkN48z47mmEVzAO2OE+YErYeQ/UemVfonn/F4kFz+lhLqoVMdpw==",
+      "license": "MIT",
+      "dependencies": {
+        "cookie": "^1.0.2"
+      },
+      "peerDependencies": {
+        "@supabase/supabase-js": "^2.110.5"
+      }
+    },
+    "node_modules/@supabase/storage-js": {
+      "version": "2.110.8",
+      "resolved": "https://registry.npmjs.org/@supabase/storage-js/-/storage-js-2.110.8.tgz",
+      "integrity": "sha512-CcfhkZFBLxsthgUabZKxwfsoXdrikIGsL3LsGoV3FZTqCMx/s1y49taT4jT/oya5+1IuB0sFFHw6pF0o0iJniQ==",
+      "license": "MIT",
+      "dependencies": {
+        "iceberg-js": "^0.8.1",
+        "tslib": "2.8.1"
+      },
+      "engines": {
+        "node": ">=22.0.0"
+      }
+    },
+    "node_modules/@supabase/storage-js/node_modules/tslib": {
+      "version": "2.8.1",
+      "resolved": "https://registry.npmjs.org/tslib/-/tslib-2.8.1.tgz",
+      "integrity": "sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w==",
+      "license": "0BSD"
+    },
+    "node_modules/@supabase/supabase-js": {
+      "version": "2.110.8",
+      "resolved": "https://registry.npmjs.org/@supabase/supabase-js/-/supabase-js-2.110.8.tgz",
+      "integrity": "sha512-E5qzoe74zhJRv4wRcbO9eMYzeQDb/+h6c603pL8shcxLGBjTKsIF7XXj05IcNj23TLDgJN1WkMw7mwAPyu5dZg==",
+      "license": "MIT",
+      "dependencies": {
+        "@supabase/auth-js": "2.110.8",
+        "@supabase/functions-js": "2.110.8",
+        "@supabase/postgrest-js": "2.110.8",
+        "@supabase/realtime-js": "2.110.8",
+        "@supabase/storage-js": "2.110.8"
+      },
+      "engines": {
+        "node": ">=22.0.0"
+      }
+    },
+    "node_modules/@swc/counter": {
+      "version": "0.1.3",
+      "resolved": "https://registry.npmjs.org/@swc/counter/-/counter-0.1.3.tgz",
+      "integrity": "sha512-e2BR4lsJkkRlKZ/qCHPw9ZaSxc0MVUd7gtbtaB7aMvHeJVYe8sOB8DBZkP2DtISHGSku9sCK6T6cnY0CtXrOCQ==",
+      "license": "Apache-2.0"
+    },
+    "node_modules/@swc/helpers": {
+      "version": "0.5.5",
+      "resolved": "https://registry.npmjs.org/@swc/helpers/-/helpers-0.5.5.tgz",
+      "integrity": "sha512-KGYxvIOXcceOAbEk4bi/dVLEK9z8sZ0uBB3Il5b1rhfClSpcX0yfRO0KmTkqR2cnQDymwLB+25ZyMzICg/cm/A==",
+      "license": "Apache-2.0",
+      "dependencies": {
+        "@swc/counter": "^0.1.3",
+        "tslib": "^2.4.0"
+      }
+    },
+    "node_modules/@swc/helpers/node_modules/tslib": {
+      "version": "2.8.1",
+      "resolved": "https://registry.npmjs.org/tslib/-/tslib-2.8.1.tgz",
+      "integrity": "sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w==",
+      "license": "0BSD"
+    },
+    "node_modules/@types/caseless": {
+      "version": "0.12.5",
+      "resolved": "https://registry.npmjs.org/@types/caseless/-/caseless-0.12.5.tgz",
+      "integrity": "sha512-hWtVTC2q7hc7xZ/RLbxapMvDMgUnDvKvMOpKal4DrMyfGBUfB1oKaZlIRr6mJL+If3bAP6sV/QneGzF6tJjZDg==",
+      "license": "MIT"
+    },
+    "node_modules/@types/dom-mediacapture-record": {
+      "version": "1.0.22",
+      "resolved": "https://registry.npmjs.org/@types/dom-mediacapture-record/-/dom-mediacapture-record-1.0.22.tgz",
+      "integrity": "sha512-mUMZLK3NvwRLcAAT9qmcK+9p7tpU2FHdDsntR3YI4+GY88XrgG4XiE7u1Q2LAN2/FZOz/tdMDC3GQCR4T8nFuw==",
+      "license": "MIT",
+      "peer": true
+    },
+    "node_modules/@types/node": {
+      "version": "20.19.43",
+      "resolved": "https://registry.npmjs.org/@types/node/-/node-20.19.43.tgz",
+      "integrity": "sha512-6oYBAi5ikg4Pl+kGsoYtawUMBT2zZMCvPNF7pVLnHZfd1zf38DRiWn/gT01RYCdUqkv7Fhr+C9ot4/tb+2sVvA==",
+      "license": "MIT",
+      "dependencies": {
+        "undici-types": "~6.21.0"
+      }
+    },
+    "node_modules/@types/node/node_modules/undici-types": {
+      "version": "6.21.0",
+      "resolved": "https://registry.npmjs.org/undici-types/-/undici-types-6.21.0.tgz",
+      "integrity": "sha512-iwDZqg0QAGrg9Rav5H4n0M64c3mkR59cJ6wQp+7C4nI0gsmExaedaYLNO44eT4AtBBwjbTiGPMlt2Md0T9H9JQ==",
+      "license": "MIT"
+    },
+    "node_modules/@types/nunjucks": {
+      "version": "3.2.6",
+      "resolved": "https://registry.npmjs.org/@types/nunjucks/-/nunjucks-3.2.6.tgz",
+      "integrity": "sha512-pHiGtf83na1nCzliuAdq8GowYiXvH5l931xZ0YEHaLMNFgynpEqx+IPStlu7UaDkehfvl01e4x/9Tpwhy7Ue3w==",
+      "license": "MIT"
+    },
+    "node_modules/@types/pako": {
+      "version": "2.0.4",
+      "resolved": "https://registry.npmjs.org/@types/pako/-/pako-2.0.4.tgz",
+      "integrity": "sha512-VWDCbrLeVXJM9fihYodcLiIv0ku+AlOa/TQ1SvYOaBuyrSKgEcro95LJyIsJ4vSo6BXIxOKxiJAat04CmST9Fw==",
+      "license": "MIT"
+    },
+    "node_modules/@types/prop-types": {
+      "version": "15.7.15",
+      "resolved": "https://registry.npmjs.org/@types/prop-types/-/prop-types-15.7.15.tgz",
+      "integrity": "sha512-F6bEyamV9jKGAFBEmlQnesRPGOQqS2+Uwi0Em15xenOxHaf2hv6L8YCVn3rPdPJOiJfPiCnLIRyvwVaqMY3MIw==",
+      "dev": true,
+      "license": "MIT"
+    },
+    "node_modules/@types/raf": {
+      "version": "3.4.3",
+      "resolved": "https://registry.npmjs.org/@types/raf/-/raf-3.4.3.tgz",
+      "integrity": "sha512-c4YAvMedbPZ5tEyxzQdMoOhhJ4RD3rngZIdwC2/qDN3d7JpEhB6fiBRKVY1lg5B7Wk+uPBjn5f39j1/2MY1oOw==",
+      "license": "MIT",
+      "optional": true
+    },
+    "node_modules/@types/react": {
+      "version": "18.3.31",
+      "resolved": "https://registry.npmjs.org/@types/react/-/react-18.3.31.tgz",
+      "integrity": "sha512-vfEqpXTvwT91yhmwdfouStN2hSKwTvyRs8qpLfADyrq/kxDw0hZM7Wk9Ug1FELj8hIby+S/+kQCSRFF32nv2Qw==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "@types/prop-types": "*",
+        "csstype": "^3.2.2"
+      }
+    },
+    "node_modules/@types/react-dom": {
+      "version": "18.3.7",
+      "resolved": "https://registry.npmjs.org/@types/react-dom/-/react-dom-18.3.7.tgz",
+      "integrity": "sha512-MEe3UeoENYVFXzoXEWsvcpg6ZvlrFNlOQ7EOsvhI3CfAXwzPfO8Qwuxd40nepsYKqyyVQnTdEfv68q91yLcKrQ==",
+      "dev": true,
+      "license": "MIT",
+      "peerDependencies": {
+        "@types/react": "^18.0.0"
+      }
+    },
+    "node_modules/@types/request": {
+      "version": "2.48.13",
+      "resolved": "https://registry.npmjs.org/@types/request/-/request-2.48.13.tgz",
+      "integrity": "sha512-FGJ6udDNUCjd19pp0Q3iTiDkwhYup7J8hpMW9c4k53NrccQFFWKRho6hvtPPEhnXWKvukfwAlB6DbDz4yhH5Gg==",
+      "license": "MIT",
+      "dependencies": {
+        "@types/caseless": "*",
+        "@types/node": "*",
+        "@types/tough-cookie": "*",
+        "form-data": "^2.5.5"
+      }
+    },
+    "node_modules/@types/tough-cookie": {
+      "version": "4.0.5",
+      "resolved": "https://registry.npmjs.org/@types/tough-cookie/-/tough-cookie-4.0.5.tgz",
+      "integrity": "sha512-/Ad8+nIOV7Rl++6f1BdKxFSMgmoqEoYbHRpPcx3JEfv8VRsQe9Z4mCXeJBzxs7mbHY/XOZZuXlRNfhpVPbs6ZA==",
+      "license": "MIT"
+    },
+    "node_modules/@types/trusted-types": {
+      "version": "2.0.7",
+      "resolved": "https://registry.npmjs.org/@types/trusted-types/-/trusted-types-2.0.7.tgz",
+      "integrity": "sha512-ScaPdn1dQczgbl0QFTeTOmVHFULt394XJgOQNoyVhZ6r2vLnMLJfBPd53SB52T/3G36VI1/g2MZaX0cwDuXsfw==",
+      "license": "MIT",
+      "optional": true
+    },
+    "node_modules/a-sync-waterfall": {
+      "version": "1.0.1",
+      "resolved": "https://registry.npmjs.org/a-sync-waterfall/-/a-sync-waterfall-1.0.1.tgz",
+      "integrity": "sha512-RYTOHHdWipFUliRFMCS4X2Yn2X8M87V/OpSqWzKKOGhzqyUxzyVmhHDH9sAvG+ZuQf/TAOFsLCpMw09I1ufUnA==",
+      "license": "MIT"
+    },
+    "node_modules/ajv": {
+      "version": "6.15.0",
+      "resolved": "https://registry.npmjs.org/ajv/-/ajv-6.15.0.tgz",
+      "integrity": "sha512-fgFx7Hfoq60ytK2c7DhnF8jIvzYgOMxfugjLOSMHjLIPgenqa7S7oaagATUq99mV6IYvN2tRmC0wnTYX6iPbMw==",
+      "license": "MIT",
+      "dependencies": {
+        "fast-deep-equal": "^3.1.1",
+        "fast-json-stable-stringify": "^2.0.0",
+        "json-schema-traverse": "^0.4.1",
+        "uri-js": "^4.2.2"
+      },
+      "funding": {
+        "type": "github",
+        "url": "https://github.com/sponsors/epoberezkin"
+      }
+    },
+    "node_modules/ansi-regex": {
+      "version": "3.0.1",
+      "resolved": "https://registry.npmjs.org/ansi-regex/-/ansi-regex-3.0.1.tgz",
+      "integrity": "sha512-+O9Jct8wf++lXxxFc4hc8LsjaSq0HFzzL7cVsw8pRDIPdjKD2mT4ytDZlLuSBZ4cLKZFXIrMGO7DbQCtMJJMKw==",
+      "license": "MIT",
+      "engines": {
+        "node": ">=4"
+      }
+    },
+    "node_modules/ansi-styles": {
+      "version": "3.2.1",
+      "resolved": "https://registry.npmjs.org/ansi-styles/-/ansi-styles-3.2.1.tgz",
+      "integrity": "sha512-VT0ZI6kZRdTh8YyJw3SMbYm/u+NqfsAxEpWO0Pf9sq8/e94WxxOpPKx9FR1FlyCtOVDNOQ+8ntlqFxiRc+r5qA==",
+      "license": "MIT",
+      "dependencies": {
+        "color-convert": "^1.9.0"
+      },
+      "engines": {
+        "node": ">=4"
+      }
+    },
+    "node_modules/asap": {
+      "version": "2.0.6",
+      "resolved": "https://registry.npmjs.org/asap/-/asap-2.0.6.tgz",
+      "integrity": "sha512-BSHWgDSAiKs50o2Re8ppvp3seVHXSRM44cdSsT9FfNEUUZLOGWVCsiWaRPWM1Znn+mqZ1OfVZ3z3DWEzSp7hRA==",
+      "license": "MIT"
+    },
+    "node_modules/asn1": {
+      "version": "0.2.6",
+      "resolved": "https://registry.npmjs.org/asn1/-/asn1-0.2.6.tgz",
+      "integrity": "sha512-ix/FxPn0MDjeyJ7i/yoHGFt/EX6LyNbxSEhPPXODPL+KB0VPk86UYfL0lMdy+KCnv+fmvIzySwaK5COwqVbWTQ==",
+      "license": "MIT",
+      "dependencies": {
+        "safer-buffer": "~2.1.0"
+      }
+    },
+    "node_modules/assert-plus": {
+      "version": "1.0.0",
+      "resolved": "https://registry.npmjs.org/assert-plus/-/assert-plus-1.0.0.tgz",
+      "integrity": "sha512-NfJ4UzBCcQGLDlQq7nHxH+tv3kyZ0hHQqF5BO6J7tNJeP5do1llPr8dZ8zHonfhAu0PHAdMkSo+8o0wxg9lZWw==",
+      "license": "MIT",
+      "engines": {
+        "node": ">=0.8"
+      }
+    },
+    "node_modules/asynckit": {
+      "version": "0.4.0",
+      "resolved": "https://registry.npmjs.org/asynckit/-/asynckit-0.4.0.tgz",
+      "integrity": "sha512-Oei9OH4tRh0YqU3GxhX79dM/mwVgvbZJaSNaRk+bshkj0S5cfHcgYakreBjrHwatXKbz+IoIdYLxrKim2MjW0Q==",
+      "license": "MIT"
+    },
+    "node_modules/aws-sign2": {
+      "version": "0.7.0",
+      "resolved": "https://registry.npmjs.org/aws-sign2/-/aws-sign2-0.7.0.tgz",
+      "integrity": "sha512-08kcGqnYf/YmjoRhfxyu+CLxBjUtHLXLXX/vUfx9l2LYzG3c1m61nrpyFUZI6zeS+Li/wWMMidD9KgrqtGq3mA==",
+      "license": "Apache-2.0",
+      "engines": {
+        "node": "*"
+      }
+    },
+    "node_modules/aws4": {
+      "version": "1.13.2",
+      "resolved": "https://registry.npmjs.org/aws4/-/aws4-1.13.2.tgz",
+      "integrity": "sha512-lHe62zvbTB5eEABUVi/AwVh0ZKY9rMMDhmm+eeyuuUQbQ3+J+fONVQOZyj+DdrvD4BY33uYniyRJ4UJIaSKAfw==",
+      "license": "MIT"
+    },
+    "node_modules/base64-arraybuffer": {
+      "version": "1.0.2",
+      "resolved": "https://registry.npmjs.org/base64-arraybuffer/-/base64-arraybuffer-1.0.2.tgz",
+      "integrity": "sha512-I3yl4r9QB5ZRY3XuJVEPfc2XhZO6YweFPI+UovAzn+8/hb3oJ6lnysaFcjVpkCPfVWFUDvoZ8kmVDP7WyRtYtQ==",
+      "license": "MIT",
+      "optional": true,
+      "engines": {
+        "node": ">= 0.6.0"
+      }
+    },
+    "node_modules/bcrypt-pbkdf": {
+      "version": "1.0.2",
+      "resolved": "https://registry.npmjs.org/bcrypt-pbkdf/-/bcrypt-pbkdf-1.0.2.tgz",
+      "integrity": "sha512-qeFIXtP4MSoi6NLqO12WfqARWWuCKi2Rn/9hJLEmtB5yTNr9DqFWkJRCf2qShWzPeAMRnOgCrq0sg/KLv5ES9w==",
+      "license": "BSD-3-Clause",
+      "dependencies": {
+        "tweetnacl": "^0.14.3"
+      }
+    },
+    "node_modules/better-ajv-errors": {
+      "version": "0.6.7",
+      "resolved": "https://registry.npmjs.org/better-ajv-errors/-/better-ajv-errors-0.6.7.tgz",
+      "integrity": "sha512-PYgt/sCzR4aGpyNy5+ViSQ77ognMnWq7745zM+/flYO4/Yisdtp9wDQW2IKCyVYPUxQt3E/b5GBSwfhd1LPdlg==",
+      "license": "Apache-2.0",
+      "dependencies": {
+        "@babel/code-frame": "^7.0.0",
+        "@babel/runtime": "^7.0.0",
+        "chalk": "^2.4.1",
+        "core-js": "^3.2.1",
+        "json-to-ast": "^2.0.3",
+        "jsonpointer": "^4.0.1",
+        "leven": "^3.1.0"
+      },
+      "peerDependencies": {
+        "ajv": "4.11.8 - 6"
+      }
+    },
+    "node_modules/busboy": {
+      "version": "1.6.0",
+      "resolved": "https://registry.npmjs.org/busboy/-/busboy-1.6.0.tgz",
+      "integrity": "sha512-8SFQbg/0hQ9xy3UNTB0YEnsNBbWfhf7RtnzpL7TkBiTBRfrQ9Fxcnz7VJsleJpyp6rVLvXiuORqjlHi5q+PYuA==",
+      "dependencies": {
+        "streamsearch": "^1.1.0"
+      },
+      "engines": {
+        "node": ">=10.16.0"
+      }
+    },
+    "node_modules/call-bind-apply-helpers": {
+      "version": "1.0.2",
+      "resolved": "https://registry.npmjs.org/call-bind-apply-helpers/-/call-bind-apply-helpers-1.0.2.tgz",
+      "integrity": "sha512-Sp1ablJ0ivDkSzjcaJdxEunN5/XvksFJ2sMBFfq6x0ryhQV/2b/KwFe21cMpmHtPOSij8K99/wSfoEuTObmuMQ==",
+      "license": "MIT",
+      "dependencies": {
+        "es-errors": "^1.3.0",
+        "function-bind": "^1.1.2"
+      },
+      "engines": {
+        "node": ">= 0.4"
+      }
+    },
+    "node_modules/call-bound": {
+      "version": "1.0.4",
+      "resolved": "https://registry.npmjs.org/call-bound/-/call-bound-1.0.4.tgz",
+      "integrity": "sha512-+ys997U96po4Kx/ABpBCqhA9EuxJaQWDQg7295H4hBphv3IZg0boBKuwYpt4YXp6MZ5AmZQnU/tyMTlRpaSejg==",
+      "license": "MIT",
+      "dependencies": {
+        "call-bind-apply-helpers": "^1.0.2",
+        "get-intrinsic": "^1.3.0"
+      },
+      "engines": {
+        "node": ">= 0.4"
+      },
+      "funding": {
+        "url": "https://github.com/sponsors/ljharb"
+      }
+    },
+    "node_modules/call-me-maybe": {
+      "version": "1.0.2",
+      "resolved": "https://registry.npmjs.org/call-me-maybe/-/call-me-maybe-1.0.2.tgz",
+      "integrity": "sha512-HpX65o1Hnr9HH25ojC1YGs7HCQLq0GCOibSaWER0eNpgJ/Z1MZv2mTc7+xh6WOPxbRVcmgbv4hGU+uSQ/2xFZQ==",
+      "license": "MIT"
+    },
+    "node_modules/camelcase": {
+      "version": "5.3.1",
+      "resolved": "https://registry.npmjs.org/camelcase/-/camelcase-5.3.1.tgz",
+      "integrity": "sha512-L28STB170nwWS63UjtlEOE3dldQApaJXZkOI1uMFfzf3rRuPegHaHesyee+YxQ+W6SvRDQV6UrdOdRiR153wJg==",
+      "license": "MIT",
+      "engines": {
+        "node": ">=6"
+      }
+    },
+    "node_modules/caniuse-lite": {
+      "version": "1.0.30001799",
+      "resolved": "https://registry.npmjs.org/caniuse-lite/-/caniuse-lite-1.0.30001799.tgz",
+      "integrity": "sha512-hG1bReV+OUU+MOqK4t/ZWI0tZOyz3rqS9XuhOUz1cIcbwBKjOyJEJuw9ER5JuNyqxNk8u/JUVbGibBOL1yrjFw==",
+      "funding": [
+        {
+          "type": "opencollective",
+          "url": "https://opencollective.com/browserslist"
+        },
+        {
+          "type": "tidelift",
+          "url": "https://tidelift.com/funding/github/npm/caniuse-lite"
+        },
+        {
+          "type": "github",
+          "url": "https://github.com/sponsors/ai"
+        }
+      ],
+      "license": "CC-BY-4.0"
+    },
+    "node_modules/canvg": {
+      "version": "3.0.11",
+      "resolved": "https://registry.npmjs.org/canvg/-/canvg-3.0.11.tgz",
+      "integrity": "sha512-5ON+q7jCTgMp9cjpu4Jo6XbvfYwSB2Ow3kzHKfIyJfaCAOHLbdKPQqGKgfED/R5B+3TFFfe8pegYA+b423SRyA==",
+      "license": "MIT",
+      "optional": true,
+      "dependencies": {
+        "@babel/runtime": "^7.12.5",
+        "@types/raf": "^3.4.0",
+        "core-js": "^3.8.3",
+        "raf": "^3.4.1",
+        "regenerator-runtime": "^0.13.7",
+        "rgbcolor": "^1.0.1",
+        "stackblur-canvas": "^2.0.0",
+        "svg-pathdata": "^6.0.3"
+      },
+      "engines": {
+        "node": ">=10.0.0"
+      }
+    },
+    "node_modules/canvg/node_modules/regenerator-runtime": {
+      "version": "0.13.11",
+      "resolved": "https://registry.npmjs.org/regenerator-runtime/-/regenerator-runtime-0.13.11.tgz",
+      "integrity": "sha512-kY1AZVr2Ra+t+piVaJ4gxaFaReZVH40AKNo7UCX6W+dEwBo/2oZJzqfuN1qLq1oL45o56cPaTXELwrTh8Fpggg==",
+      "license": "MIT",
+      "optional": true
+    },
+    "node_modules/caseless": {
+      "version": "0.12.0",
+      "resolved": "https://registry.npmjs.org/caseless/-/caseless-0.12.0.tgz",
+      "integrity": "sha512-4tYFyifaFfGacoiObjJegolkwSU4xQNGbVgUiNYVUxbQ2x2lUsFvY4hVgVzGiIe6WLOPqycWXA40l+PWsxthUw==",
+      "license": "Apache-2.0"
+    },
+    "node_modules/chalk": {
+      "version": "2.4.2",
+      "resolved": "https://registry.npmjs.org/chalk/-/chalk-2.4.2.tgz",
+      "integrity": "sha512-Mti+f9lpJNcwF4tWV8/OrTTtF1gZi+f8FqlyAdouralcFWFQWF2+NgCHShjkCb+IFBLq9buZwE1xckQU4peSuQ==",
+      "license": "MIT",
+      "dependencies": {
+        "ansi-styles": "^3.2.1",
+        "escape-string-regexp": "^1.0.5",
+        "supports-color": "^5.3.0"
+      },
+      "engines": {
+        "node": ">=4"
+      }
+    },
+    "node_modules/client-only": {
+      "version": "0.0.1",
+      "resolved": "https://registry.npmjs.org/client-only/-/client-only-0.0.1.tgz",
+      "integrity": "sha512-IV3Ou0jSMzZrd3pZ48nLkT9DA7Ag1pnPzaiQhpW7c3RbcqqzvzzVu+L8gfqMp/8IM2MQtSiqaCxrrcfu8I8rMA==",
+      "license": "MIT"
+    },
+    "node_modules/cliui": {
+      "version": "4.1.0",
+      "resolved": "https://registry.npmjs.org/cliui/-/cliui-4.1.0.tgz",
+      "integrity": "sha512-4FG+RSG9DL7uEwRUZXZn3SS34DiDPfzP0VOiEwtUWlE+AR2EIg+hSyvrIgUUfhdgR/UkAeW2QHgeP+hWrXs7jQ==",
+      "license": "ISC",
+      "dependencies": {
+        "string-width": "^2.1.1",
+        "strip-ansi": "^4.0.0",
+        "wrap-ansi": "^2.0.0"
+      }
+    },
+    "node_modules/co": {
+      "version": "4.6.0",
+      "resolved": "https://registry.npmjs.org/co/-/co-4.6.0.tgz",
+      "integrity": "sha512-QVb0dM5HvG+uaxitm8wONl7jltx8dqhfU33DcqtOZcLSVIKSDDLDi7+0LbAKiyI8hD9u42m2YxXSkMGWThaecQ==",
+      "license": "MIT",
+      "engines": {
+        "iojs": ">= 1.0.0",
+        "node": ">= 0.12.0"
+      }
+    },
+    "node_modules/code-error-fragment": {
+      "version": "0.0.230",
+      "resolved": "https://registry.npmjs.org/code-error-fragment/-/code-error-fragment-0.0.230.tgz",
+      "integrity": "sha512-cadkfKp6932H8UkhzE/gcUqhRMNf8jHzkAN7+5Myabswaghu4xABTgPHDCjW+dBAJxj/SpkTYokpzDqY4pCzQw==",
+      "license": "MIT",
+      "engines": {
+        "node": ">= 4"
+      }
+    },
+    "node_modules/code-point-at": {
+      "version": "1.1.0",
+      "resolved": "https://registry.npmjs.org/code-point-at/-/code-point-at-1.1.0.tgz",
+      "integrity": "sha512-RpAVKQA5T63xEj6/giIbUEtZwJ4UFIc3ZtvEkiaUERylqe8xb5IvqcgOurZLahv93CLKfxcw5YI+DZcUBRyLXA==",
+      "license": "MIT",
+      "engines": {
+        "node": ">=0.10.0"
+      }
+    },
+    "node_modules/color-convert": {
+      "version": "1.9.3",
+      "resolved": "https://registry.npmjs.org/color-convert/-/color-convert-1.9.3.tgz",
+      "integrity": "sha512-QfAUtd+vFdAtFQcC8CCyYt1fYWxSqAiK2cSD6zDB8N3cpsEBAvRxp9zOGg6G/SHHJYAT88/az/IuDGALsNVbGg==",
+      "license": "MIT",
+      "dependencies": {
+        "color-name": "1.1.3"
+      }
+    },
+    "node_modules/color-convert/node_modules/color-name": {
+      "version": "1.1.3",
+      "resolved": "https://registry.npmjs.org/color-name/-/color-name-1.1.3.tgz",
+      "integrity": "sha512-72fSenhMw2HZMTVHeCA9KCmpEIbzWiQsjN+BHcBbS9vr1mtt+vJjPdksIBNUmKAW8TFUDPJK5SUU3QhE9NEXDw==",
+      "license": "MIT"
+    },
+    "node_modules/color-name": {
+      "version": "1.1.4",
+      "resolved": "https://registry.npmjs.org/color-name/-/color-name-1.1.4.tgz",
+      "integrity": "sha512-dOy+3AuW3a2wNbZHIuMZpTcgjGuLU/uBL/ubcZF9OXbDo8ff4O8yVp5Bf0efS8uEoYo5q4Fx7dY9OgQGXgAsQA==",
+      "license": "MIT"
+    },
+    "node_modules/colorful": {
+      "version": "2.1.0",
+      "resolved": "https://registry.npmjs.org/colorful/-/colorful-2.1.0.tgz",
+      "integrity": "sha512-DpDLDvi/vPzqoPX7Dw44ZZf004DCdEcCx1pf5hq5aipVHXjwgRSYGCz3m17rA2XCduW91wJUapge8/3qLvjYcg=="
+    },
+    "node_modules/combined-stream": {
+      "version": "1.0.8",
+      "resolved": "https://registry.npmjs.org/combined-stream/-/combined-stream-1.0.8.tgz",
+      "integrity": "sha512-FQN4MRfuJeHf7cBbBMJFXhKSDq+2kAArBlmRBvcvFE5BB1HZKXtSFASDhdlz9zOYwxh8lDdnvmMOe/+5cdoEdg==",
+      "license": "MIT",
+      "dependencies": {
+        "delayed-stream": "~1.0.0"
+      },
+      "engines": {
+        "node": ">= 0.8"
+      }
+    },
+    "node_modules/commander": {
+      "version": "2.20.3",
+      "resolved": "https://registry.npmjs.org/commander/-/commander-2.20.3.tgz",
+      "integrity": "sha512-GpVkmM8vF2vQUkj2LvZmD35JxeJOLCwJ9cUkugyk2nuhbv3+mJvpLYYt+0+USMxE+oj+ey/lJEnhZw75x/OMcQ==",
+      "license": "MIT"
+    },
+    "node_modules/cookie": {
+      "version": "1.1.1",
+      "resolved": "https://registry.npmjs.org/cookie/-/cookie-1.1.1.tgz",
+      "integrity": "sha512-ei8Aos7ja0weRpFzJnEA9UHJ/7XQmqglbRwnf2ATjcB9Wq874VKH9kfjjirM6UhU2/E5fFYadylyhFldcqSidQ==",
+      "license": "MIT",
+      "engines": {
+        "node": ">=18"
+      },
+      "funding": {
+        "type": "opencollective",
+        "url": "https://opencollective.com/express"
+      }
+    },
+    "node_modules/core-js": {
+      "version": "3.49.0",
+      "resolved": "https://registry.npmjs.org/core-js/-/core-js-3.49.0.tgz",
+      "integrity": "sha512-es1U2+YTtzpwkxVLwAFdSpaIMyQaq0PBgm3YD1W3Qpsn1NAmO3KSgZfu+oGSWVu6NvLHoHCV/aYcsE5wiB7ALg==",
+      "hasInstallScript": true,
+      "license": "MIT",
+      "funding": {
+        "type": "opencollective",
+        "url": "https://opencollective.com/core-js"
+      }
+    },
+    "node_modules/core-util-is": {
+      "version": "1.0.3",
+      "resolved": "https://registry.npmjs.org/core-util-is/-/core-util-is-1.0.3.tgz",
+      "integrity": "sha512-ZQBvi1DcpJ4GDqanjucZ2Hj3wEO5pZDS89BWbkcrvdxksJorwUDDZamX9ldFkp9aw2lmBDLgkObEA4DWNJ9FYQ==",
+      "license": "MIT"
+    },
+    "node_modules/cross-spawn": {
+      "version": "6.0.6",
+      "resolved": "https://registry.npmjs.org/cross-spawn/-/cross-spawn-6.0.6.tgz",
+      "integrity": "sha512-VqCUuhcd1iB+dsv8gxPttb5iZh/D0iubSP21g36KXdEuf6I5JiioesUVjpCdHV9MZRUfVFlvwtIUyPfxo5trtw==",
+      "license": "MIT",
+      "dependencies": {
+        "nice-try": "^1.0.4",
+        "path-key": "^2.0.1",
+        "semver": "^5.5.0",
+        "shebang-command": "^1.2.0",
+        "which": "^1.2.9"
+      },
+      "engines": {
+        "node": ">=4.8"
+      }
+    },
+    "node_modules/css-line-break": {
+      "version": "2.1.0",
+      "resolved": "https://registry.npmjs.org/css-line-break/-/css-line-break-2.1.0.tgz",
+      "integrity": "sha512-FHcKFCZcAha3LwfVBhCQbW2nCNbkZXn7KVUJcsT5/P8YmfsVja0FMPJr0B903j/E69HUphKiV9iQArX8SDYA4w==",
+      "license": "MIT",
+      "optional": true,
+      "dependencies": {
+        "utrie": "^1.0.2"
+      }
+    },
+    "node_modules/csstype": {
+      "version": "3.2.3",
+      "resolved": "https://registry.npmjs.org/csstype/-/csstype-3.2.3.tgz",
+      "integrity": "sha512-z1HGKcYy2xA8AGQfwrn0PAy+PB7X/GSj3UVJW9qKyn43xWa+gl5nXmU4qqLMRzWVLFC8KusUX8T/0kCiOYpAIQ==",
+      "dev": true,
+      "license": "MIT"
+    },
+    "node_modules/dashdash": {
+      "version": "1.14.1",
+      "resolved": "https://registry.npmjs.org/dashdash/-/dashdash-1.14.1.tgz",
+      "integrity": "sha512-jRFi8UDGo6j+odZiEpjazZaWqEal3w/basFjQHQEwVtZJGDpxbH1MeYluwCS8Xq5wmLJooDlMgvVarmWfGM44g==",
+      "license": "MIT",
+      "dependencies": {
+        "assert-plus": "^1.0.0"
+      },
+      "engines": {
+        "node": ">=0.10"
+      }
+    },
+    "node_modules/debug": {
+      "version": "4.4.3",
+      "resolved": "https://registry.npmjs.org/debug/-/debug-4.4.3.tgz",
+      "integrity": "sha512-RGwwWnwQvkVfavKVt22FGLw+xYSdzARwm0ru6DhTVA3umU5hZc28V3kO4stgYryrTlLpuvgI9GiijltAjNbcqA==",
+      "license": "MIT",
+      "dependencies": {
+        "ms": "^2.1.3"
+      },
+      "engines": {
+        "node": ">=6.0"
+      },
+      "peerDependenciesMeta": {
+        "supports-color": {
+          "optional": true
+        }
+      }
+    },
+    "node_modules/decamelize": {
+      "version": "1.2.0",
+      "resolved": "https://registry.npmjs.org/decamelize/-/decamelize-1.2.0.tgz",
+      "integrity": "sha512-z2S+W9X73hAUUki+N+9Za2lBlun89zigOyGrsax+KUQ6wKW4ZoWpEYBkGhQjwAjjDCkWxhY0VKEhk8wzY7F5cA==",
+      "license": "MIT",
+      "engines": {
+        "node": ">=0.10.0"
+      }
+    },
+    "node_modules/delayed-stream": {
+      "version": "1.0.0",
+      "resolved": "https://registry.npmjs.org/delayed-stream/-/delayed-stream-1.0.0.tgz",
+      "integrity": "sha512-ZySD7Nf91aLB0RxL4KGrKHBXl7Eds1DAmEdcoVawXnLD7SDhpNgtuII2aAkg7a7QS41jxPSZ17p4VdGnMHk3MQ==",
+      "license": "MIT",
+      "engines": {
+        "node": ">=0.4.0"
+      }
+    },
+    "node_modules/dompurify": {
+      "version": "3.4.16",
+      "resolved": "https://registry.npmjs.org/dompurify/-/dompurify-3.4.16.tgz",
+      "integrity": "sha512-sqo+pNp3qRhCIpbgRi1y8Tgk27Bo2Ry7w0dC1NBeNTdZChWjz9Xb/KOoZbRP/R6pQZ80Qw8YhXw13hWWBbMRnQ==",
+      "license": "(MPL-2.0 OR Apache-2.0)",
+      "optional": true,
+      "optionalDependencies": {
+        "@types/trusted-types": "^2.0.7"
+      }
+    },
+    "node_modules/dunder-proto": {
+      "version": "1.0.1",
+      "resolved": "https://registry.npmjs.org/dunder-proto/-/dunder-proto-1.0.1.tgz",
+      "integrity": "sha512-KIN/nDJBQRcXw0MLVhZE9iQHmG68qAVIBg9CqmUYjmQIhgij9U5MFvrqkUL5FbtyyzZuOeOt0zdeRe4UY7ct+A==",
+      "license": "MIT",
+      "dependencies": {
+        "call-bind-apply-helpers": "^1.0.1",
+        "es-errors": "^1.3.0",
+        "gopd": "^1.2.0"
+      },
+      "engines": {
+        "node": ">= 0.4"
+      }
+    },
+    "node_modules/ecc-jsbn": {
+      "version": "0.1.2",
+      "resolved": "https://registry.npmjs.org/ecc-jsbn/-/ecc-jsbn-0.1.2.tgz",
+      "integrity": "sha512-eh9O+hwRHNbG4BLTjEl3nw044CkGm5X6LoaCf7LPp7UU8Qrt47JYNi6nPX8xjW97TKGKm1ouctg0QSpZe9qrnw==",
+      "license": "MIT",
+      "dependencies": {
+        "jsbn": "~0.1.0",
+        "safer-buffer": "^2.1.0"
+      }
+    },
+    "node_modules/emoji-regex": {
+      "version": "8.0.0",
+      "resolved": "https://registry.npmjs.org/emoji-regex/-/emoji-regex-8.0.0.tgz",
+      "integrity": "sha512-MSjYzcWNOA0ewAHpz0MxpYFvwg6yjy1NG3xteoqz644VCo/RPgnr1/GGt+ic3iJTzQ8Eu3TdM14SawnVUmGE6A==",
+      "license": "MIT"
+    },
+    "node_modules/end-of-stream": {
+      "version": "1.4.5",
+      "resolved": "https://registry.npmjs.org/end-of-stream/-/end-of-stream-1.4.5.tgz",
+      "integrity": "sha512-ooEGc6HP26xXq/N+GCGOT0JKCLDGrq2bQUZrQ7gyrJiZANJ/8YDTxTpQBXGMn+WbIQXNVpyWymm7KYVICQnyOg==",
+      "license": "MIT",
+      "dependencies": {
+        "once": "^1.4.0"
+      }
+    },
+    "node_modules/es-define-property": {
+      "version": "1.0.1",
+      "resolved": "https://registry.npmjs.org/es-define-property/-/es-define-property-1.0.1.tgz",
+      "integrity": "sha512-e3nRfgfUZ4rNGL232gUgX06QNyyez04KdjFrF+LTRoOXmrOgFKDg4BCdsjW8EnT69eqdYGmRpJwiPVYNrCaW3g==",
+      "license": "MIT",
+      "engines": {
+        "node": ">= 0.4"
+      }
+    },
+    "node_modules/es-errors": {
+      "version": "1.3.0",
+      "resolved": "https://registry.npmjs.org/es-errors/-/es-errors-1.3.0.tgz",
+      "integrity": "sha512-Zf5H2Kxt2xjTvbJvP2ZWLEICxA6j+hAmMzIlypy4xcBg1vKVnx89Wy0GbS+kf5cwCVFFzdCFh2XSCFNULS6csw==",
+      "license": "MIT",
+      "engines": {
+        "node": ">= 0.4"
+      }
+    },
+    "node_modules/es-object-atoms": {
+      "version": "1.1.2",
+      "resolved": "https://registry.npmjs.org/es-object-atoms/-/es-object-atoms-1.1.2.tgz",
+      "integrity": "sha512-HWcBoN6NileqtSydK2FqHbS/LoDd2pqrnQHLyJzBj4kOp/ky2MWMN694xOfkK8/SnUsW2DH7EfyVlydKCsm1Zw==",
+      "license": "MIT",
+      "dependencies": {
+        "es-errors": "^1.3.0"
+      },
+      "engines": {
+        "node": ">= 0.4"
+      }
+    },
+    "node_modules/es-set-tostringtag": {
+      "version": "2.1.0",
+      "resolved": "https://registry.npmjs.org/es-set-tostringtag/-/es-set-tostringtag-2.1.0.tgz",
+      "integrity": "sha512-j6vWzfrGVfyXxge+O0x5sh6cvxAog0a/4Rdd2K36zCMV5eJ+/+tOAngRO8cODMNWbVRdVlmGZQL2YS3yR8bIUA==",
+      "license": "MIT",
+      "dependencies": {
+        "es-errors": "^1.3.0",
+        "get-intrinsic": "^1.2.6",
+        "has-tostringtag": "^1.0.2",
+        "hasown": "^2.0.2"
+      },
+      "engines": {
+        "node": ">= 0.4"
+      }
+    },
+    "node_modules/es6-promise": {
+      "version": "3.3.1",
+      "resolved": "https://registry.npmjs.org/es6-promise/-/es6-promise-3.3.1.tgz",
+      "integrity": "sha512-SOp9Phqvqn7jtEUxPWdWfWoLmyt2VaJ6MpvP9Comy1MceMXqE6bxvaTu4iaxpYYPzhny28Lc+M87/c2cPK6lDg==",
+      "license": "MIT"
+    },
+    "node_modules/escalade": {
+      "version": "3.2.0",
+      "resolved": "https://registry.npmjs.org/escalade/-/escalade-3.2.0.tgz",
+      "integrity": "sha512-WUj2qlxaQtO4g6Pq5c29GTcWGDyd8itL8zTlipgECz3JesAiiOKotd8JU6otB3PACgG6xkJUyVhboMS+bje/jA==",
+      "license": "MIT",
+      "engines": {
+        "node": ">=6"
+      }
+    },
+    "node_modules/escape-string-regexp": {
+      "version": "1.0.5",
+      "resolved": "https://registry.npmjs.org/escape-string-regexp/-/escape-string-regexp-1.0.5.tgz",
+      "integrity": "sha512-vbRorB5FUQWvla16U8R/qgaFIya2qGzwDrNmCZuYKrbdSUMG6I1ZCGQRefkRVhuOkIGVne7BQ35DSfo1qvJqFg==",
+      "license": "MIT",
+      "engines": {
+        "node": ">=0.8.0"
+      }
+    },
+    "node_modules/events": {
+      "version": "3.3.0",
+      "resolved": "https://registry.npmjs.org/events/-/events-3.3.0.tgz",
+      "integrity": "sha512-mQw+2fkQbALzQ7V0MY0IqdnXNOeTtP4r0lN9z7AAawCXgqea7bDii20AYrIBrFd/Hx0M2Ocz6S111CaFkUcb0Q==",
+      "license": "MIT",
+      "engines": {
+        "node": ">=0.8.x"
+      }
+    },
+    "node_modules/execa": {
+      "version": "1.0.0",
+      "resolved": "https://registry.npmjs.org/execa/-/execa-1.0.0.tgz",
+      "integrity": "sha512-adbxcyWV46qiHyvSp50TKt05tB4tK3HcmF7/nxfAdhnox83seTDbwnaqKO4sXRy7roHAIFqJP/Rw/AuEbX61LA==",
+      "license": "MIT",
+      "dependencies": {
+        "cross-spawn": "^6.0.0",
+        "get-stream": "^4.0.0",
+        "is-stream": "^1.1.0",
+        "npm-run-path": "^2.0.0",
+        "p-finally": "^1.0.0",
+        "signal-exit": "^3.0.0",
+        "strip-eof": "^1.0.0"
+      },
+      "engines": {
+        "node": ">=6"
+      }
+    },
+    "node_modules/extend": {
+      "version": "3.0.2",
+      "resolved": "https://registry.npmjs.org/extend/-/extend-3.0.2.tgz",
+      "integrity": "sha512-fjquC59cD7CyW6urNXK0FBufkZcoiGG80wTuPujX590cB5Ttln20E2UB4S/WARVqhXffZl2LNgS+gQdPIIim/g==",
+      "license": "MIT"
+    },
+    "node_modules/extsprintf": {
+      "version": "1.4.1",
+      "resolved": "https://registry.npmjs.org/extsprintf/-/extsprintf-1.4.1.tgz",
+      "integrity": "sha512-Wrk35e8ydCKDj/ArClo1VrPVmN8zph5V4AtHwIuHhvMXsKf73UT3BOD+azBIW+3wOJ4FhEH7zyaJCFvChjYvMA==",
+      "engines": [
+        "node >=0.6.0"
+      ],
+      "license": "MIT"
+    },
+    "node_modules/fast-deep-equal": {
+      "version": "3.1.3",
+      "resolved": "https://registry.npmjs.org/fast-deep-equal/-/fast-deep-equal-3.1.3.tgz",
+      "integrity": "sha512-f3qQ9oQy9j2AhBe/H9VC91wLmKBCCU/gDOnKNAYG5hswO7BLKj09Hc5HYNz9cGI++xlpDCIgDaitVs03ATR84Q==",
+      "license": "MIT"
+    },
+    "node_modules/fast-json-stable-stringify": {
+      "version": "2.1.0",
+      "resolved": "https://registry.npmjs.org/fast-json-stable-stringify/-/fast-json-stable-stringify-2.1.0.tgz",
+      "integrity": "sha512-lhd/wF+Lk98HZoTCtlVraHtfh5XYijIjalXck7saUtuanSDyLMxnHhSXEDJqHxD7msR8D0uCmqlkwjCV8xvwHw==",
+      "license": "MIT"
+    },
+    "node_modules/fast-png": {
+      "version": "6.4.0",
+      "resolved": "https://registry.npmjs.org/fast-png/-/fast-png-6.4.0.tgz",
+      "integrity": "sha512-kAqZq1TlgBjZcLr5mcN6NP5Rv4V2f22z00c3g8vRrwkcqjerx7BEhPbOnWCPqaHUl2XWQBJQvOT/FQhdMT7X/Q==",
+      "license": "MIT",
+      "dependencies": {
+        "@types/pako": "^2.0.3",
+        "iobuffer": "^5.3.2",
+        "pako": "^2.1.0"
+      }
+    },
+    "node_modules/fast-png/node_modules/pako": {
+      "version": "2.2.0",
+      "resolved": "https://registry.npmjs.org/pako/-/pako-2.2.0.tgz",
+      "integrity": "sha512-zJq6RP/5q+TO2OpFV3FHzlPnFjmkb7Nc99a5SNjJE+uu/PkpChs+NIZSSzbBoD+6kjiISXjfYdwj1ZRQ81dz/w==",
+      "funding": [
+        {
+          "type": "github",
+          "url": "https://github.com/sponsors/puzrin"
+        },
+        {
+          "type": "github",
+          "url": "https://github.com/sponsors/nodeca"
+        }
+      ],
+      "license": "(MIT AND Zlib)"
+    },
+    "node_modules/fast-safe-stringify": {
+      "version": "2.1.1",
+      "resolved": "https://registry.npmjs.org/fast-safe-stringify/-/fast-safe-stringify-2.1.1.tgz",
+      "integrity": "sha512-W+KJc2dmILlPplD/H4K9l9LcAHAfPtP6BY84uVLXQ6Evcz9Lcg33Y2z1IVblT6xdY54PXYVHEv+0Wpq8Io6zkA==",
+      "license": "MIT"
+    },
+    "node_modules/fflate": {
+      "version": "0.8.3",
+      "resolved": "https://registry.npmjs.org/fflate/-/fflate-0.8.3.tgz",
+      "integrity": "sha512-tbZNuJrLwGUp3zshBtdy4W+ORxZuIh8a5ilyIEQDC5rY1f3U20JMry0Ll3WBzU58EZKsEuJFXhb5gwv8CsPvgA==",
+      "license": "MIT"
+    },
+    "node_modules/find-up": {
+      "version": "3.0.0",
+      "resolved": "https://registry.npmjs.org/find-up/-/find-up-3.0.0.tgz",
+      "integrity": "sha512-1yD6RmLI1XBfxugvORwlck6f75tYL+iR0jqwsOrOxMZyGYqUuDhJ0l4AXdO1iX/FTs9cBAMEk1gWSEx1kSbylg==",
+      "license": "MIT",
+      "dependencies": {
+        "locate-path": "^3.0.0"
+      },
+      "engines": {
+        "node": ">=6"
+      }
+    },
+    "node_modules/forever-agent": {
+      "version": "0.6.1",
+      "resolved": "https://registry.npmjs.org/forever-agent/-/forever-agent-0.6.1.tgz",
+      "integrity": "sha512-j0KLYPhm6zeac4lz3oJ3o65qvgQCcPubiyotZrXqEaG4hNagNYO8qdlUrX5vwqv9ohqeT/Z3j6+yW067yWWdUw==",
+      "license": "Apache-2.0",
+      "engines": {
+        "node": "*"
+      }
+    },
+    "node_modules/form-data": {
+      "version": "2.5.6",
+      "resolved": "https://registry.npmjs.org/form-data/-/form-data-2.5.6.tgz",
+      "integrity": "sha512-Ogz/E85h9tlfJzpI6TuFpGcHZFhLrb9Gw8wq9v40CxSCPnv7ahKr6Xgtkn0KYCDQJ8DNn5VoMO8EXr9V5PadyA==",
+      "license": "MIT",
+      "dependencies": {
+        "asynckit": "^0.4.0",
+        "combined-stream": "^1.0.8",
+        "es-set-tostringtag": "^2.1.0",
+        "hasown": "^2.0.4",
+        "mime-types": "^2.1.35",
+        "safe-buffer": "^5.2.1"
+      },
+      "engines": {
+        "node": ">= 0.12"
+      }
+    },
+    "node_modules/function-bind": {
+      "version": "1.1.2",
+      "resolved": "https://registry.npmjs.org/function-bind/-/function-bind-1.1.2.tgz",
+      "integrity": "sha512-7XHNxH7qX9xG5mIwxkhumTox/MIRNcOgDrxWsMt2pAr23WHp6MrRlN7FBSFpCpr+oVO0F744iUgR82nJMfG2SA==",
+      "license": "MIT",
+      "funding": {
+        "url": "https://github.com/sponsors/ljharb"
+      }
+    },
+    "node_modules/get-caller-file": {
+      "version": "1.0.3",
+      "resolved": "https://registry.npmjs.org/get-caller-file/-/get-caller-file-1.0.3.tgz",
+      "integrity": "sha512-3t6rVToeoZfYSGd8YoLFR2DJkiQrIiUrGcjvFX2mDw3bn6k2OtwHN0TNCLbBO+w8qTvimhDkv+LSscbJY1vE6w==",
+      "license": "ISC"
+    },
+    "node_modules/get-intrinsic": {
+      "version": "1.3.0",
+      "resolved": "https://registry.npmjs.org/get-intrinsic/-/get-intrinsic-1.3.0.tgz",
+      "integrity": "sha512-9fSjSaos/fRIVIp+xSJlE6lfwhES7LNtKaCBIamHsjr2na1BiABJPo0mOjjz8GJDURarmCPGqaiVg5mfjb98CQ==",
+      "license": "MIT",
+      "dependencies": {
+        "call-bind-apply-helpers": "^1.0.2",
+        "es-define-property": "^1.0.1",
+        "es-errors": "^1.3.0",
+        "es-object-atoms": "^1.1.1",
+        "function-bind": "^1.1.2",
+        "get-proto": "^1.0.1",
+        "gopd": "^1.2.0",
+        "has-symbols": "^1.1.0",
+        "hasown": "^2.0.2",
+        "math-intrinsics": "^1.1.0"
+      },
+      "engines": {
+        "node": ">= 0.4"
+      },
+      "funding": {
+        "url": "https://github.com/sponsors/ljharb"
+      }
+    },
+    "node_modules/get-proto": {
+      "version": "1.0.1",
+      "resolved": "https://registry.npmjs.org/get-proto/-/get-proto-1.0.1.tgz",
+      "integrity": "sha512-sTSfBjoXBp89JvIKIefqw7U2CCebsc74kiY6awiGogKtoSGbgjYE/G/+l9sF3MWFPNc9IcoOC4ODfKHfxFmp0g==",
+      "license": "MIT",
+      "dependencies": {
+        "dunder-proto": "^1.0.1",
+        "es-object-atoms": "^1.0.0"
+      },
+      "engines": {
+        "node": ">= 0.4"
+      }
+    },
+    "node_modules/get-stream": {
+      "version": "4.1.0",
+      "resolved": "https://registry.npmjs.org/get-stream/-/get-stream-4.1.0.tgz",
+      "integrity": "sha512-GMat4EJ5161kIy2HevLlr4luNjBgvmj413KaQA7jt4V8B4RDsfpHk7WQ9GVqfYyyx8OS/L66Kox+rJRNklLK7w==",
+      "license": "MIT",
+      "dependencies": {
+        "pump": "^3.0.0"
+      },
+      "engines": {
+        "node": ">=6"
+      }
+    },
+    "node_modules/getpass": {
+      "version": "0.1.7",
+      "resolved": "https://registry.npmjs.org/getpass/-/getpass-0.1.7.tgz",
+      "integrity": "sha512-0fzj9JxOLfJ+XGLhR8ze3unN0KZCgZwiSSDz168VERjK8Wl8kVSdcu2kspd4s4wtAa1y/qrVRiAA0WclVsu0ng==",
+      "license": "MIT",
+      "dependencies": {
+        "assert-plus": "^1.0.0"
+      }
+    },
+    "node_modules/gopd": {
+      "version": "1.2.0",
+      "resolved": "https://registry.npmjs.org/gopd/-/gopd-1.2.0.tgz",
+      "integrity": "sha512-ZUKRh6/kUFoAiTAtTYPZJ3hw9wNxx+BIBOijnlG9PnrJsCcSjs1wyyD6vJpaYtgnzDrKYRSqf3OO6Rfa93xsRg==",
+      "license": "MIT",
+      "engines": {
+        "node": ">= 0.4"
+      },
+      "funding": {
+        "url": "https://github.com/sponsors/ljharb"
+      }
+    },
+    "node_modules/graceful-fs": {
+      "version": "4.2.11",
+      "resolved": "https://registry.npmjs.org/graceful-fs/-/graceful-fs-4.2.11.tgz",
+      "integrity": "sha512-RbJ5/jmFcNNCcDV5o9eTnBLJ/HszWV0P73bc+Ff4nS/rJj+YaS6IGyiOL0VoBYX+l1Wrl3k63h/KrH+nhJ0XvQ==",
+      "license": "ISC"
+    },
+    "node_modules/grapheme-splitter": {
+      "version": "1.0.4",
+      "resolved": "https://registry.npmjs.org/grapheme-splitter/-/grapheme-splitter-1.0.4.tgz",
+      "integrity": "sha512-bzh50DW9kTPM00T8y4o8vQg89Di9oLJVLW/KaOGIXJWP/iqCN6WKYkbNOF04vFLJhwcpYUh9ydh/+5vpOqV4YQ==",
+      "license": "MIT"
+    },
+    "node_modules/har-schema": {
+      "version": "2.0.0",
+      "resolved": "https://registry.npmjs.org/har-schema/-/har-schema-2.0.0.tgz",
+      "integrity": "sha512-Oqluz6zhGX8cyRaTQlFMPw80bSJVG2x/cFb8ZPhUILGgHka9SsokCCOQgpveePerqidZOrT14ipqfJb7ILcW5Q==",
+      "license": "ISC",
+      "engines": {
+        "node": ">=4"
+      }
+    },
+    "node_modules/har-validator": {
+      "version": "5.1.5",
+      "resolved": "https://registry.npmjs.org/har-validator/-/har-validator-5.1.5.tgz",
+      "integrity": "sha512-nmT2T0lljbxdQZfspsno9hgrG3Uir6Ks5afism62poxqBM6sDnMEuPmzTq8XN0OEwqKLLdh1jQI3qyE66Nzb3w==",
+      "deprecated": "this library is no longer supported",
+      "license": "MIT",
+      "dependencies": {
+        "ajv": "^6.12.3",
+        "har-schema": "^2.0.0"
+      },
+      "engines": {
+        "node": ">=6"
+      }
+    },
+    "node_modules/has-flag": {
+      "version": "3.0.0",
+      "resolved": "https://registry.npmjs.org/has-flag/-/has-flag-3.0.0.tgz",
+      "integrity": "sha512-sKJf1+ceQBr4SMkvQnBDNDtf4TXpVhVGateu0t918bl30FnbE2m4vNLX+VWe/dpjlb+HugGYzW7uQXH98HPEYw==",
+      "license": "MIT",
+      "engines": {
+        "node": ">=4"
+      }
+    },
+    "node_modules/has-symbols": {
+      "version": "1.1.0",
+      "resolved": "https://registry.npmjs.org/has-symbols/-/has-symbols-1.1.0.tgz",
+      "integrity": "sha512-1cDNdwJ2Jaohmb3sg4OmKaMBwuC48sYni5HUw2DvsC8LjGTLK9h+eb1X6RyuOHe4hT0ULCW68iomhjUoKUqlPQ==",
+      "license": "MIT",
+      "engines": {
+        "node": ">= 0.4"
+      },
+      "funding": {
+        "url": "https://github.com/sponsors/ljharb"
+      }
+    },
+    "node_modules/has-tostringtag": {
+      "version": "1.0.2",
+      "resolved": "https://registry.npmjs.org/has-tostringtag/-/has-tostringtag-1.0.2.tgz",
+      "integrity": "sha512-NqADB8VjPFLM2V0VvHUewwwsw0ZWBaIdgo+ieHtK3hasLz4qeCRjYcqfB6AQrBggRKppKF8L52/VqdVsO47Dlw==",
+      "license": "MIT",
+      "dependencies": {
+        "has-symbols": "^1.0.3"
+      },
+      "engines": {
+        "node": ">= 0.4"
+      },
+      "funding": {
+        "url": "https://github.com/sponsors/ljharb"
+      }
+    },
+    "node_modules/hasown": {
+      "version": "2.0.4",
+      "resolved": "https://registry.npmjs.org/hasown/-/hasown-2.0.4.tgz",
+      "integrity": "sha512-T2UbfbBEF32wiepXIsMlTW9+dDYC6wMh/t/vYA4tuOMKqWz/n3vr1NFSxQiyP+zk2mXsoMA/i/7qV6LKut1t1A==",
+      "license": "MIT",
+      "dependencies": {
+        "function-bind": "^1.1.2"
+      },
+      "engines": {
+        "node": ">= 0.4"
+      }
+    },
+    "node_modules/html2canvas": {
+      "version": "1.4.1",
+      "resolved": "https://registry.npmjs.org/html2canvas/-/html2canvas-1.4.1.tgz",
+      "integrity": "sha512-fPU6BHNpsyIhr8yyMpTLLxAbkaK8ArIBcmZIRiBLiDhjeqvXolaEmDGmELFuX9I4xDcaKKcJl+TKZLqruBbmWA==",
+      "license": "MIT",
+      "optional": true,
+      "dependencies": {
+        "css-line-break": "^2.1.0",
+        "text-segmentation": "^1.0.3"
+      },
+      "engines": {
+        "node": ">=8.0.0"
+      }
+    },
+    "node_modules/http-signature": {
+      "version": "1.4.0",
+      "resolved": "https://registry.npmjs.org/http-signature/-/http-signature-1.4.0.tgz",
+      "integrity": "sha512-G5akfn7eKbpDN+8nPS/cb57YeA1jLTVxjpCj7tmm3QKPdyDy7T+qSC40e9ptydSWvkwjSXw1VbkpyEm39ukeAg==",
+      "license": "MIT",
+      "dependencies": {
+        "assert-plus": "^1.0.0",
+        "jsprim": "^2.0.2",
+        "sshpk": "^1.18.0"
+      },
+      "engines": {
+        "node": ">=0.10"
+      }
+    },
+    "node_modules/http-signature/node_modules/core-util-is": {
+      "version": "1.0.2",
+      "resolved": "https://registry.npmjs.org/core-util-is/-/core-util-is-1.0.2.tgz",
+      "integrity": "sha512-3lqz5YjWTYnW6dlDa5TLaTCcShfar1e40rmcJVwCBJC6mWlFuj0eCHIElmG1g5kyuJ/GD+8Wn4FFCcz4gJPfaQ==",
+      "license": "MIT"
+    },
+    "node_modules/http-signature/node_modules/extsprintf": {
+      "version": "1.3.0",
+      "resolved": "https://registry.npmjs.org/extsprintf/-/extsprintf-1.3.0.tgz",
+      "integrity": "sha512-11Ndz7Nv+mvAC1j0ktTa7fAb0vLyGGX+rMHNBYQviQDGU0Hw7lhctJANqbPhu9nV9/izT/IntTgZ7Im/9LJs9g==",
+      "engines": [
+        "node >=0.6.0"
+      ],
+      "license": "MIT"
+    },
+    "node_modules/http-signature/node_modules/jsprim": {
+      "version": "2.0.2",
+      "resolved": "https://registry.npmjs.org/jsprim/-/jsprim-2.0.2.tgz",
+      "integrity": "sha512-gqXddjPqQ6G40VdnI6T6yObEC+pDNvyP95wdQhkWkg7crHH3km5qP1FsOXEkzEQwnz6gz5qGTn1c2Y52wP3OyQ==",
+      "engines": [
+        "node >=0.6.0"
+      ],
+      "license": "MIT",
+      "dependencies": {
+        "assert-plus": "1.0.0",
+        "extsprintf": "1.3.0",
+        "json-schema": "0.4.0",
+        "verror": "1.10.0"
+      }
+    },
+    "node_modules/http-signature/node_modules/verror": {
+      "version": "1.10.0",
+      "resolved": "https://registry.npmjs.org/verror/-/verror-1.10.0.tgz",
+      "integrity": "sha512-ZZKSmDAEFOijERBLkmYfJ+vmk3w+7hOLYDNkRCuRuMJGEmqYNCNLyBBFwWKVMhfwaEF3WOd0Zlw86U/WC/+nYw==",
+      "engines": [
+        "node >=0.6.0"
+      ],
+      "license": "MIT",
+      "dependencies": {
+        "assert-plus": "^1.0.0",
+        "core-util-is": "1.0.2",
+        "extsprintf": "^1.2.0"
+      }
+    },
+    "node_modules/http2-client": {
+      "version": "1.3.5",
+      "resolved": "https://registry.npmjs.org/http2-client/-/http2-client-1.3.5.tgz",
+      "integrity": "sha512-EC2utToWl4RKfs5zd36Mxq7nzHHBuomZboI0yYL6Y0RmBgT7Sgkq4rQ0ezFTYoIsSs7Tm9SJe+o2FcAg6GBhGA==",
+      "license": "MIT"
+    },
+    "node_modules/iceberg-js": {
+      "version": "0.8.1",
+      "resolved": "https://registry.npmjs.org/iceberg-js/-/iceberg-js-0.8.1.tgz",
+      "integrity": "sha512-1dhVQZXhcHje7798IVM+xoo/1ZdVfzOMIc8/rgVSijRK38EDqOJoGula9N/8ZI5RD8QTxNQtK/Gozpr+qUqRRA==",
+      "license": "MIT",
+      "engines": {
+        "node": ">=20.0.0"
+      }
+    },
+    "node_modules/invert-kv": {
+      "version": "2.0.0",
+      "resolved": "https://registry.npmjs.org/invert-kv/-/invert-kv-2.0.0.tgz",
+      "integrity": "sha512-wPVv/y/QQ/Uiirj/vh3oP+1Ww+AWehmi1g5fFWGPF6IpCBCDVrhgHRMvrLfdYcwDh3QJbGXDW4JAuzxElLSqKA==",
+      "license": "MIT",
+      "engines": {
+        "node": ">=4"
+      }
+    },
+    "node_modules/iobuffer": {
+      "version": "5.4.0",
+      "resolved": "https://registry.npmjs.org/iobuffer/-/iobuffer-5.4.0.tgz",
+      "integrity": "sha512-DRebOWuqDvxunfkNJAlc3IzWIPD5xVxwUNbHr7xKB8E6aLJxIPfNX3CoMJghcFjpv6RWQsrcJbghtEwSPoJqMA==",
+      "license": "MIT"
+    },
+    "node_modules/is-fullwidth-code-point": {
+      "version": "2.0.0",
+      "resolved": "https://registry.npmjs.org/is-fullwidth-code-point/-/is-fullwidth-code-point-2.0.0.tgz",
+      "integrity": "sha512-VHskAKYM8RfSFXwee5t5cbN5PZeq1Wrh6qd5bkyiXIf6UQcN6w/A0eXM9r6t8d+GYOh+o6ZhiEnb88LN/Y8m2w==",
+      "license": "MIT",
+      "engines": {
+        "node": ">=4"
+      }
+    },
+    "node_modules/is-stream": {
+      "version": "1.1.0",
+      "resolved": "https://registry.npmjs.org/is-stream/-/is-stream-1.1.0.tgz",
+      "integrity": "sha512-uQPm8kcs47jx38atAcWTVxyltQYoPT68y9aWYdV6yWXSyW8mzSat0TL6CiWdZeCdF3KrAvpVtnHbTv4RN+rqdQ==",
+      "license": "MIT",
+      "engines": {
+        "node": ">=0.10.0"
+      }
+    },
+    "node_modules/is-typedarray": {
+      "version": "1.0.0",
+      "resolved": "https://registry.npmjs.org/is-typedarray/-/is-typedarray-1.0.0.tgz",
+      "integrity": "sha512-cyA56iCMHAh5CdzjJIa4aohJyeO1YbwLi3Jc35MmRU6poroFjIGZzUzupGiRPOjgHg9TLu43xbpwXk523fMxKA==",
+      "license": "MIT"
+    },
+    "node_modules/isexe": {
+      "version": "2.0.0",
+      "resolved": "https://registry.npmjs.org/isexe/-/isexe-2.0.0.tgz",
+      "integrity": "sha512-RHxMLp9lnKHGHRng9QFhRCMbYAcVpn69smSGcq3f36xjgVVWThj4qqLbTLlq7Ssj8B+fIQ1EuCEGI2lKsyQeIw==",
+      "license": "ISC"
+    },
+    "node_modules/isstream": {
+      "version": "0.1.2",
+      "resolved": "https://registry.npmjs.org/isstream/-/isstream-0.1.2.tgz",
+      "integrity": "sha512-Yljz7ffyPbrLpLngrMtZ7NduUgVvi6wG9RJ9IUcyCd59YQ911PBJphODUcbOVbqYfxe1wuYf/LJ8PauMRwsM/g==",
+      "license": "MIT"
+    },
+    "node_modules/js-tokens": {
+      "version": "4.0.0",
+      "resolved": "https://registry.npmjs.org/js-tokens/-/js-tokens-4.0.0.tgz",
+      "integrity": "sha512-RdJUflcE3cUzKiMqQgsCu06FPu9UdIJO0beYbPhHN4k6apgJtifcoCtT9bcxOpYBtpD2kCM6Sbzg4CausW/PKQ==",
+      "license": "MIT"
+    },
+    "node_modules/jsbn": {
+      "version": "0.1.1",
+      "resolved": "https://registry.npmjs.org/jsbn/-/jsbn-0.1.1.tgz",
+      "integrity": "sha512-UVU9dibq2JcFWxQPA6KCqj5O42VOmAY3zQUfEKxU0KpTGXwNoCjkX1e13eHNvw/xPynt6pU0rZ1htjWTNTSXsg==",
+      "license": "MIT"
+    },
+    "node_modules/json-schema": {
+      "version": "0.4.0",
+      "resolved": "https://registry.npmjs.org/json-schema/-/json-schema-0.4.0.tgz",
+      "integrity": "sha512-es94M3nTIfsEPisRafak+HDLfHXnKBhV3vU5eqPcS3flIWqcxJWgXHXiey3YrpaNsanY5ei1VoYEbOzijuq9BA==",
+      "license": "(AFL-2.1 OR BSD-3-Clause)"
+    },
+    "node_modules/json-schema-traverse": {
+      "version": "0.4.1",
+      "resolved": "https://registry.npmjs.org/json-schema-traverse/-/json-schema-traverse-0.4.1.tgz",
+      "integrity": "sha512-xbbCH5dCYU5T8LcEhhuh7HJ88HXuW3qsI3Y0zOZFKfZEHcpWiHU/Jxzk629Brsab/mMiHQti9wMP+845RPe3Vg==",
+      "license": "MIT"
+    },
+    "node_modules/json-stringify-safe": {
+      "version": "5.0.1",
+      "resolved": "https://registry.npmjs.org/json-stringify-safe/-/json-stringify-safe-5.0.1.tgz",
+      "integrity": "sha512-ZClg6AaYvamvYEE82d3Iyd3vSSIjQ+odgjaTzRuO3s7toCdFKczob2i0zCh7JE8kWn17yvAWhUVxvqGwUalsRA==",
+      "license": "ISC"
+    },
+    "node_modules/json-to-ast": {
+      "version": "2.1.0",
+      "resolved": "https://registry.npmjs.org/json-to-ast/-/json-to-ast-2.1.0.tgz",
+      "integrity": "sha512-W9Lq347r8tA1DfMvAGn9QNcgYm4Wm7Yc+k8e6vezpMnRT+NHbtlxgNBXRVjXe9YM6eTn6+p/MKOlV/aABJcSnQ==",
+      "license": "MIT",
+      "dependencies": {
+        "code-error-fragment": "0.0.230",
+        "grapheme-splitter": "^1.0.4"
+      },
+      "engines": {
+        "node": ">= 4"
+      }
+    },
+    "node_modules/jsonpointer": {
+      "version": "4.1.0",
+      "resolved": "https://registry.npmjs.org/jsonpointer/-/jsonpointer-4.1.0.tgz",
+      "integrity": "sha512-CXcRvMyTlnR53xMcKnuMzfCA5i/nfblTnnr74CZb6C4vG39eu6w51t7nKmU5MfLfbTgGItliNyjO/ciNPDqClg==",
+      "license": "MIT",
+      "engines": {
+        "node": ">=0.10.0"
+      }
+    },
+    "node_modules/jspdf": {
+      "version": "4.2.1",
+      "resolved": "https://registry.npmjs.org/jspdf/-/jspdf-4.2.1.tgz",
+      "integrity": "sha512-YyAXyvnmjTbR4bHQRLzex3CuINCDlQnBqoSYyjJwTP2x9jDLuKDzy7aKUl0hgx3uhcl7xzg32agn5vlie6HIlQ==",
+      "license": "MIT",
+      "dependencies": {
+        "@babel/runtime": "^7.28.6",
+        "fast-png": "^6.2.0",
+        "fflate": "^0.8.1"
+      },
+      "optionalDependencies": {
+        "canvg": "^3.0.11",
+        "core-js": "^3.6.0",
+        "dompurify": "^3.3.1",
+        "html2canvas": "^1.0.0-rc.5"
+      }
+    },
+    "node_modules/jsprim": {
+      "version": "1.4.2",
+      "resolved": "https://registry.npmjs.org/jsprim/-/jsprim-1.4.2.tgz",
+      "integrity": "sha512-P2bSOMAc/ciLz6DzgjVlGJP9+BrJWu5UDGK70C2iweC5QBIeFf0ZXRvGjEj2uYgrY2MkAAhsSWHDWlFtEroZWw==",
+      "license": "MIT",
+      "dependencies": {
+        "assert-plus": "1.0.0",
+        "extsprintf": "1.3.0",
+        "json-schema": "0.4.0",
+        "verror": "1.10.0"
+      },
+      "engines": {
+        "node": ">=0.6.0"
+      }
+    },
+    "node_modules/jsprim/node_modules/core-util-is": {
+      "version": "1.0.2",
+      "resolved": "https://registry.npmjs.org/core-util-is/-/core-util-is-1.0.2.tgz",
+      "integrity": "sha512-3lqz5YjWTYnW6dlDa5TLaTCcShfar1e40rmcJVwCBJC6mWlFuj0eCHIElmG1g5kyuJ/GD+8Wn4FFCcz4gJPfaQ==",
+      "license": "MIT"
+    },
+    "node_modules/jsprim/node_modules/extsprintf": {
+      "version": "1.3.0",
+      "resolved": "https://registry.npmjs.org/extsprintf/-/extsprintf-1.3.0.tgz",
+      "integrity": "sha512-11Ndz7Nv+mvAC1j0ktTa7fAb0vLyGGX+rMHNBYQviQDGU0Hw7lhctJANqbPhu9nV9/izT/IntTgZ7Im/9LJs9g==",
+      "engines": [
+        "node >=0.6.0"
+      ],
+      "license": "MIT"
+    },
+    "node_modules/jsprim/node_modules/verror": {
+      "version": "1.10.0",
+      "resolved": "https://registry.npmjs.org/verror/-/verror-1.10.0.tgz",
+      "integrity": "sha512-ZZKSmDAEFOijERBLkmYfJ+vmk3w+7hOLYDNkRCuRuMJGEmqYNCNLyBBFwWKVMhfwaEF3WOd0Zlw86U/WC/+nYw==",
+      "engines": [
+        "node >=0.6.0"
+      ],
+      "license": "MIT",
+      "dependencies": {
+        "assert-plus": "^1.0.0",
+        "core-util-is": "1.0.2",
+        "extsprintf": "^1.2.0"
+      }
+    },
+    "node_modules/lcid": {
+      "version": "2.0.0",
+      "resolved": "https://registry.npmjs.org/lcid/-/lcid-2.0.0.tgz",
+      "integrity": "sha512-avPEb8P8EGnwXKClwsNUgryVjllcRqtMYa49NTsbQagYuT1DcXnl1915oxWjoyGrXR6zH/Y0Zc96xWsPcoDKeA==",
+      "license": "MIT",
+      "dependencies": {
+        "invert-kv": "^2.0.0"
+      },
+      "engines": {
+        "node": ">=6"
+      }
+    },
+    "node_modules/leven": {
+      "version": "3.1.0",
+      "resolved": "https://registry.npmjs.org/leven/-/leven-3.1.0.tgz",
+      "integrity": "sha512-qsda+H8jTaUaN/x5vzW2rzc+8Rw4TAQ/4KjB46IwK5VH+IlVeeeje/EoZRpiXvIqjFgK84QffqPztGI3VBLG1A==",
+      "license": "MIT",
+      "engines": {
+        "node": ">=6"
+      }
+    },
+    "node_modules/livekit-client": {
+      "version": "2.15.7",
+      "resolved": "https://registry.npmjs.org/livekit-client/-/livekit-client-2.15.7.tgz",
+      "integrity": "sha512-19m8Q1cvRl5PslRawDUgWXeP8vL8584tX8kiZEJaPZo83U/L6VPS/O7pP06phfJaBWeeV8sAOVtEPlQiZEHtpg==",
+      "license": "Apache-2.0",
+      "dependencies": {
+        "@livekit/mutex": "1.1.1",
+        "@livekit/protocol": "1.39.3",
+        "events": "^3.3.0",
+        "loglevel": "^1.9.2",
+        "sdp-transform": "^2.15.0",
+        "ts-debounce": "^4.0.0",
+        "tslib": "2.8.1",
+        "typed-emitter": "^2.1.0",
+        "webrtc-adapter": "^9.0.1"
+      },
+      "peerDependencies": {
+        "@types/dom-mediacapture-record": "^1"
+      }
+    },
+    "node_modules/livekit-client/node_modules/tslib": {
+      "version": "2.8.1",
+      "resolved": "https://registry.npmjs.org/tslib/-/tslib-2.8.1.tgz",
+      "integrity": "sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w==",
+      "license": "0BSD"
+    },
+    "node_modules/locate-path": {
+      "version": "3.0.0",
+      "resolved": "https://registry.npmjs.org/locate-path/-/locate-path-3.0.0.tgz",
+      "integrity": "sha512-7AO748wWnIhNqAuaty2ZWHkQHRSNfPVIsPIfwEOWO22AmaoVrWavlOcMR5nzTLNYvp36X220/maaRsrec1G65A==",
+      "license": "MIT",
+      "dependencies": {
+        "p-locate": "^3.0.0",
+        "path-exists": "^3.0.0"
+      },
+      "engines": {
+        "node": ">=6"
+      }
+    },
+    "node_modules/loglevel": {
+      "version": "1.9.2",
+      "resolved": "https://registry.npmjs.org/loglevel/-/loglevel-1.9.2.tgz",
+      "integrity": "sha512-HgMmCqIJSAKqo68l0rS2AanEWfkxaZ5wNiEFb5ggm08lDs9Xl2KxBlX3PTcaD2chBM1gXAYf491/M2Rv8Jwayg==",
+      "license": "MIT",
+      "engines": {
+        "node": ">= 0.6.0"
+      },
+      "funding": {
+        "type": "tidelift",
+        "url": "https://tidelift.com/funding/github/npm/loglevel"
+      }
+    },
+    "node_modules/loose-envify": {
+      "version": "1.4.0",
+      "resolved": "https://registry.npmjs.org/loose-envify/-/loose-envify-1.4.0.tgz",
+      "integrity": "sha512-lyuxPGr/Wfhrlem2CL/UcnUc1zcqKAImBDzukY7Y5F/yQiNdko6+fRLevlw1HgMySw7f611UIY408EtxRSoK3Q==",
+      "license": "MIT",
+      "dependencies": {
+        "js-tokens": "^3.0.0 || ^4.0.0"
+      },
+      "bin": {
+        "loose-envify": "cli.js"
+      }
+    },
+    "node_modules/map-age-cleaner": {
+      "version": "0.1.3",
+      "resolved": "https://registry.npmjs.org/map-age-cleaner/-/map-age-cleaner-0.1.3.tgz",
+      "integrity": "sha512-bJzx6nMoP6PDLPBFmg7+xRKeFZvFboMrGlxmNj9ClvX53KrmvM5bXFXEWjbz4cz1AFn+jWJ9z/DJSz7hrs0w3w==",
+      "license": "MIT",
+      "dependencies": {
+        "p-defer": "^1.0.0"
+      },
+      "engines": {
+        "node": ">=6"
+      }
+    },
+    "node_modules/math-intrinsics": {
+      "version": "1.1.0",
+      "resolved": "https://registry.npmjs.org/math-intrinsics/-/math-intrinsics-1.1.0.tgz",
+      "integrity": "sha512-/IXtbwEk5HTPyEwyKX6hGkYXxM9nbj64B+ilVJnC/R6B0pH5G4V3b0pVbL7DBj4tkhBAppbQUlf6F6Xl9LHu1g==",
+      "license": "MIT",
+      "engines": {
+        "node": ">= 0.4"
+      }
+    },
+    "node_modules/mem": {
+      "version": "4.3.0",
+      "resolved": "https://registry.npmjs.org/mem/-/mem-4.3.0.tgz",
+      "integrity": "sha512-qX2bG48pTqYRVmDB37rn/6PT7LcR8T7oAX3bf99u1Tt1nzxYfxkgqDwUwolPlXweM0XzBOBFzSx4kfp7KP1s/w==",
+      "license": "MIT",
+      "dependencies": {
+        "map-age-cleaner": "^0.1.1",
+        "mimic-fn": "^2.0.0",
+        "p-is-promise": "^2.0.0"
+      },
+      "engines": {
+        "node": ">=6"
+      }
+    },
+    "node_modules/mime-db": {
+      "version": "1.54.0",
+      "resolved": "https://registry.npmjs.org/mime-db/-/mime-db-1.54.0.tgz",
+      "integrity": "sha512-aU5EJuIN2WDemCcAp2vFBfp/m4EAhWJnUNSSw0ixs7/kXbd6Pg64EmwJkNdFhB8aWt1sH2CTXrLxo/iAGV3oPQ==",
+      "license": "MIT",
+      "engines": {
+        "node": ">= 0.6"
+      }
+    },
+    "node_modules/mime-types": {
+      "version": "2.1.35",
+      "resolved": "https://registry.npmjs.org/mime-types/-/mime-types-2.1.35.tgz",
+      "integrity": "sha512-ZDY+bPm5zTTF+YpCrAU9nK0UgICYPT0QtT1NZWFv4s++TNkcgVaT0g6+4R2uI4MjQjzysHB1zxuWL50hzaeXiw==",
+      "license": "MIT",
+      "dependencies": {
+        "mime-db": "1.52.0"
+      },
+      "engines": {
+        "node": ">= 0.6"
+      }
+    },
+    "node_modules/mime-types/node_modules/mime-db": {
+      "version": "1.52.0",
+      "resolved": "https://registry.npmjs.org/mime-db/-/mime-db-1.52.0.tgz",
+      "integrity": "sha512-sPU4uV7dYlvtWJxwwxHD0PuihVNiE7TyAbQ5SWxDCB9mUYvOgroQOwYQQOKPJ8CIbE+1ETVlOoK1UC2nU3gYvg==",
+      "license": "MIT",
+      "engines": {
+        "node": ">= 0.6"
+      }
+    },
+    "node_modules/mimic-fn": {
+      "version": "2.1.0",
+      "resolved": "https://registry.npmjs.org/mimic-fn/-/mimic-fn-2.1.0.tgz",
+      "integrity": "sha512-OqbOk5oEQeAZ8WXWydlu9HJjz9WVdEIvamMCcXmuqUYjTknH/sqsWvhQ3vgwKFRR1HpjvNBKQ37nbJgYzGqGcg==",
+      "license": "MIT",
+      "engines": {
+        "node": ">=6"
+      }
+    },
+    "node_modules/ms": {
+      "version": "2.1.3",
+      "resolved": "https://registry.npmjs.org/ms/-/ms-2.1.3.tgz",
+      "integrity": "sha512-6FlzubTLZG3J2a/NVCAleEhjzq5oxgHyaCU9yYXvcLsvoVaHJq/s5xXI6/XXP6tz7R9xAOtHnSO/tXtF3WRTlA==",
+      "license": "MIT"
+    },
+    "node_modules/nanoid": {
+      "version": "3.3.15",
+      "resolved": "https://registry.npmjs.org/nanoid/-/nanoid-3.3.15.tgz",
+      "integrity": "sha512-y7Wygv/7mEOvxTuEQDB8StXdMRBWf1kR/tlhAzBRUFkB2jfcLOAxO/SHmOO2zgz1pVgK29/kyupn059/bCHdjA==",
+      "funding": [
+        {
+          "type": "github",
+          "url": "https://github.com/sponsors/ai"
+        }
+      ],
+      "license": "MIT",
+      "bin": {
+        "nanoid": "bin/nanoid.cjs"
+      },
+      "engines": {
+        "node": "^10 || ^12 || ^13.7 || ^14 || >=15.0.1"
+      }
+    },
+    "node_modules/next": {
+      "version": "14.2.5",
+      "resolved": "https://registry.npmjs.org/next/-/next-14.2.5.tgz",
+      "integrity": "sha512-0f8aRfBVL+mpzfBjYfQuLWh2WyAwtJXCRfkPF4UJ5qd2YwrHczsrSzXU4tRMV0OAxR8ZJZWPFn6uhSC56UTsLA==",
+      "deprecated": "This version has a security vulnerability. Please upgrade to a patched version. See https://nextjs.org/blog/security-update-2025-12-11 for more details.",
+      "license": "MIT",
+      "dependencies": {
+        "@next/env": "14.2.5",
+        "@swc/helpers": "0.5.5",
+        "busboy": "1.6.0",
+        "caniuse-lite": "^1.0.30001579",
+        "graceful-fs": "^4.2.11",
+        "postcss": "8.4.31",
+        "styled-jsx": "5.1.1"
+      },
+      "bin": {
+        "next": "dist/bin/next"
+      },
+      "engines": {
+        "node": ">=18.17.0"
+      },
+      "optionalDependencies": {
+        "@next/swc-darwin-arm64": "14.2.5",
+        "@next/swc-darwin-x64": "14.2.5",
+        "@next/swc-linux-arm64-gnu": "14.2.5",
+        "@next/swc-linux-arm64-musl": "14.2.5",
+        "@next/swc-linux-x64-gnu": "14.2.5",
+        "@next/swc-linux-x64-musl": "14.2.5",
+        "@next/swc-win32-arm64-msvc": "14.2.5",
+        "@next/swc-win32-ia32-msvc": "14.2.5",
+        "@next/swc-win32-x64-msvc": "14.2.5"
+      },
+      "peerDependencies": {
+        "@opentelemetry/api": "^1.1.0",
+        "@playwright/test": "^1.41.2",
+        "react": "^18.2.0",
+        "react-dom": "^18.2.0",
+        "sass": "^1.3.0"
+      },
+      "peerDependenciesMeta": {
+        "@opentelemetry/api": {
+          "optional": true
+        },
+        "@playwright/test": {
+          "optional": true
+        },
+        "sass": {
+          "optional": true
+        }
+      }
+    },
+    "node_modules/nice-try": {
+      "version": "1.0.5",
+      "resolved": "https://registry.npmjs.org/nice-try/-/nice-try-1.0.5.tgz",
+      "integrity": "sha512-1nh45deeb5olNY7eX82BkPO7SSxR5SSYJiPTrTdFUVYwAl8CKMA5N9PjTYkHiRjisVcxcQ1HXdLhx2qxxJzLNQ==",
+      "license": "MIT"
+    },
+    "node_modules/node-fetch-h2": {
+      "version": "2.3.0",
+      "resolved": "https://registry.npmjs.org/node-fetch-h2/-/node-fetch-h2-2.3.0.tgz",
+      "integrity": "sha512-ofRW94Ab0T4AOh5Fk8t0h8OBWrmjb0SSB20xh1H8YnPV9EJ+f5AMoYSUQ2zgJ4Iq2HAK0I2l5/Nequ8YzFS3Hg==",
+      "license": "MIT",
+      "dependencies": {
+        "http2-client": "^1.2.5"
+      },
+      "engines": {
+        "node": "4.x || >=6.0.0"
+      }
+    },
+    "node_modules/node-readfiles": {
+      "version": "0.2.0",
+      "resolved": "https://registry.npmjs.org/node-readfiles/-/node-readfiles-0.2.0.tgz",
+      "integrity": "sha512-SU00ZarexNlE4Rjdm83vglt5Y9yiQ+XI1XpflWlb7q7UTN1JUItm69xMeiQCTxtTfnzt+83T8Cx+vI2ED++VDA==",
+      "license": "MIT",
+      "dependencies": {
+        "es6-promise": "^3.2.1"
+      }
+    },
+    "node_modules/npm-run-path": {
+      "version": "2.0.2",
+      "resolved": "https://registry.npmjs.org/npm-run-path/-/npm-run-path-2.0.2.tgz",
+      "integrity": "sha512-lJxZYlT4DW/bRUtFh1MQIWqmLwQfAxnqWG4HhEdjMlkrJYnJn0Jrr2u3mgxqaWsdiBc76TYkTG/mhrnYTuzfHw==",
+      "license": "MIT",
+      "dependencies": {
+        "path-key": "^2.0.0"
+      },
+      "engines": {
+        "node": ">=4"
+      }
+    },
+    "node_modules/number-is-nan": {
+      "version": "1.0.1",
+      "resolved": "https://registry.npmjs.org/number-is-nan/-/number-is-nan-1.0.1.tgz",
+      "integrity": "sha512-4jbtZXNAsfZbAHiiqjLPBiCl16dES1zI4Hpzzxw61Tk+loF+sBDBKx1ICKKKwIqQ7M0mFn1TmkN7euSncWgHiQ==",
+      "license": "MIT",
+      "engines": {
+        "node": ">=0.10.0"
+      }
+    },
+    "node_modules/nunjucks": {
+      "version": "3.2.4",
+      "resolved": "https://registry.npmjs.org/nunjucks/-/nunjucks-3.2.4.tgz",
+      "integrity": "sha512-26XRV6BhkgK0VOxfbU5cQI+ICFUtMLixv1noZn1tGU38kQH5A5nmmbk/O45xdyBhD1esk47nKrY0mvQpZIhRjQ==",
+      "license": "BSD-2-Clause",
+      "dependencies": {
+        "a-sync-waterfall": "^1.0.0",
+        "asap": "^2.0.3",
+        "commander": "^5.1.0"
+      },
+      "bin": {
+        "nunjucks-precompile": "bin/precompile"
+      },
+      "engines": {
+        "node": ">= 6.9.0"
+      },
+      "peerDependencies": {
+        "chokidar": "^3.3.0"
+      },
+      "peerDependenciesMeta": {
+        "chokidar": {
+          "optional": true
+        }
+      }
+    },
+    "node_modules/nunjucks/node_modules/commander": {
+      "version": "5.1.0",
+      "resolved": "https://registry.npmjs.org/commander/-/commander-5.1.0.tgz",
+      "integrity": "sha512-P0CysNDQ7rtVw4QIQtm+MRxV66vKFSvlsQvGYXZWR3qFU0jlMKHZZZgw8e+8DSah4UDKMqnknRDQz+xuQXQ/Zg==",
+      "license": "MIT",
+      "engines": {
+        "node": ">= 6"
+      }
+    },
+    "node_modules/oas-kit-common": {
+      "version": "1.0.8",
+      "resolved": "https://registry.npmjs.org/oas-kit-common/-/oas-kit-common-1.0.8.tgz",
+      "integrity": "sha512-pJTS2+T0oGIwgjGpw7sIRU8RQMcUoKCDWFLdBqKB2BNmGpbBMH2sdqAaOXUg8OzonZHU0L7vfJu1mJFEiYDWOQ==",
+      "license": "BSD-3-Clause",
+      "dependencies": {
+        "fast-safe-stringify": "^2.0.7"
+      }
+    },
+    "node_modules/oas-linter": {
+      "version": "3.2.2",
+      "resolved": "https://registry.npmjs.org/oas-linter/-/oas-linter-3.2.2.tgz",
+      "integrity": "sha512-KEGjPDVoU5K6swgo9hJVA/qYGlwfbFx+Kg2QB/kd7rzV5N8N5Mg6PlsoCMohVnQmo+pzJap/F610qTodKzecGQ==",
+      "license": "BSD-3-Clause",
+      "dependencies": {
+        "@exodus/schemasafe": "^1.0.0-rc.2",
+        "should": "^13.2.1",
+        "yaml": "^1.10.0"
+      },
+      "funding": {
+        "url": "https://github.com/Mermade/oas-kit?sponsor=1"
+      }
+    },
+    "node_modules/oas-resolver": {
+      "version": "2.5.6",
+      "resolved": "https://registry.npmjs.org/oas-resolver/-/oas-resolver-2.5.6.tgz",
+      "integrity": "sha512-Yx5PWQNZomfEhPPOphFbZKi9W93CocQj18NlD2Pa4GWZzdZpSJvYwoiuurRI7m3SpcChrnO08hkuQDL3FGsVFQ==",
+      "license": "BSD-3-Clause",
+      "dependencies": {
+        "node-fetch-h2": "^2.3.0",
+        "oas-kit-common": "^1.0.8",
+        "reftools": "^1.1.9",
+        "yaml": "^1.10.0",
+        "yargs": "^17.0.1"
+      },
+      "bin": {
+        "resolve": "resolve.js"
+      },
+      "funding": {
+        "url": "https://github.com/Mermade/oas-kit?sponsor=1"
+      }
+    },
+    "node_modules/oas-resolver/node_modules/ansi-regex": {
+      "version": "5.0.1",
+      "resolved": "https://registry.npmjs.org/ansi-regex/-/ansi-regex-5.0.1.tgz",
+      "integrity": "sha512-quJQXlTSUGL2LH9SUXo8VwsY4soanhgo6LNSm84E1LBcE8s3O0wpdiRzyR9z/ZZJMlMWv37qOOb9pdJlMUEKFQ==",
+      "license": "MIT",
+      "engines": {
+        "node": ">=8"
+      }
+    },
+    "node_modules/oas-resolver/node_modules/ansi-styles": {
+      "version": "4.3.0",
+      "resolved": "https://registry.npmjs.org/ansi-styles/-/ansi-styles-4.3.0.tgz",
+      "integrity": "sha512-zbB9rCJAT1rbjiVDb2hqKFHNYLxgtk8NURxZ3IZwD3F6NtxbXZQCnnSi1Lkx+IDohdPlFp222wVALIheZJQSEg==",
+      "license": "MIT",
+      "dependencies": {
+        "color-convert": "^2.0.1"
+      },
+      "engines": {
+        "node": ">=8"
+      },
+      "funding": {
+        "url": "https://github.com/chalk/ansi-styles?sponsor=1"
+      }
+    },
+    "node_modules/oas-resolver/node_modules/cliui": {
+      "version": "8.0.1",
+      "resolved": "https://registry.npmjs.org/cliui/-/cliui-8.0.1.tgz",
+      "integrity": "sha512-BSeNnyus75C4//NQ9gQt1/csTXyo/8Sb+afLAkzAptFuMsod9HFokGNudZpi/oQV73hnVK+sR+5PVRMd+Dr7YQ==",
+      "license": "ISC",
+      "dependencies": {
+        "string-width": "^4.2.0",
+        "strip-ansi": "^6.0.1",
+        "wrap-ansi": "^7.0.0"
+      },
+      "engines": {
+        "node": ">=12"
+      }
+    },
+    "node_modules/oas-resolver/node_modules/color-convert": {
+      "version": "2.0.1",
+      "resolved": "https://registry.npmjs.org/color-convert/-/color-convert-2.0.1.tgz",
+      "integrity": "sha512-RRECPsj7iu/xb5oKYcsFHSppFNnsj/52OVTRKb4zP5onXwVF3zVmmToNcOfGC+CRDpfK/U584fMg38ZHCaElKQ==",
+      "license": "MIT",
+      "dependencies": {
+        "color-name": "~1.1.4"
+      },
+      "engines": {
+        "node": ">=7.0.0"
+      }
+    },
+    "node_modules/oas-resolver/node_modules/get-caller-file": {
+      "version": "2.0.5",
+      "resolved": "https://registry.npmjs.org/get-caller-file/-/get-caller-file-2.0.5.tgz",
+      "integrity": "sha512-DyFP3BM/3YHTQOCUL/w0OZHR0lpKeGrxotcHWcqNEdnltqFwXVfhEBQ94eIo34AfQpo0rGki4cyIiftY06h2Fg==",
+      "license": "ISC",
+      "engines": {
+        "node": "6.* || 8.* || >= 10.*"
+      }
+    },
+    "node_modules/oas-resolver/node_modules/is-fullwidth-code-point": {
+      "version": "3.0.0",
+      "resolved": "https://registry.npmjs.org/is-fullwidth-code-point/-/is-fullwidth-code-point-3.0.0.tgz",
+      "integrity": "sha512-zymm5+u+sCsSWyD9qNaejV3DFvhCKclKdizYaJUuHA83RLjb7nSuGnddCHGv0hk+KY7BMAlsWeK4Ueg6EV6XQg==",
+      "license": "MIT",
+      "engines": {
+        "node": ">=8"
+      }
+    },
+    "node_modules/oas-resolver/node_modules/string-width": {
+      "version": "4.2.3",
+      "resolved": "https://registry.npmjs.org/string-width/-/string-width-4.2.3.tgz",
+      "integrity": "sha512-wKyQRQpjJ0sIp62ErSZdGsjMJWsap5oRNihHhu6G7JVO/9jIB6UyevL+tXuOqrng8j/cxKTWyWUwvSTriiZz/g==",
+      "license": "MIT",
+      "dependencies": {
+        "emoji-regex": "^8.0.0",
+        "is-fullwidth-code-point": "^3.0.0",
+        "strip-ansi": "^6.0.1"
+      },
+      "engines": {
+        "node": ">=8"
+      }
+    },
+    "node_modules/oas-resolver/node_modules/strip-ansi": {
+      "version": "6.0.1",
+      "resolved": "https://registry.npmjs.org/strip-ansi/-/strip-ansi-6.0.1.tgz",
+      "integrity": "sha512-Y38VPSHcqkFrCpFnQ9vuSXmquuv5oXOKpGeT6aGrr3o3Gc9AlVa6JBfUSOCnbxGGZF+/0ooI7KrPuUSztUdU5A==",
+      "license": "MIT",
+      "dependencies": {
+        "ansi-regex": "^5.0.1"
+      },
+      "engines": {
+        "node": ">=8"
+      }
+    },
+    "node_modules/oas-resolver/node_modules/wrap-ansi": {
+      "version": "7.0.0",
+      "resolved": "https://registry.npmjs.org/wrap-ansi/-/wrap-ansi-7.0.0.tgz",
+      "integrity": "sha512-YVGIj2kamLSTxw6NsZjoBxfSwsn0ycdesmc4p+Q21c5zPuZ1pl+NfxVdxPtdHvmNVOQ6XSYG4AUtyt/Fi7D16Q==",
+      "license": "MIT",
+      "dependencies": {
+        "ansi-styles": "^4.0.0",
+        "string-width": "^4.1.0",
+        "strip-ansi": "^6.0.0"
+      },
+      "engines": {
+        "node": ">=10"
+      },
+      "funding": {
+        "url": "https://github.com/chalk/wrap-ansi?sponsor=1"
+      }
+    },
+    "node_modules/oas-resolver/node_modules/y18n": {
+      "version": "5.0.8",
+      "resolved": "https://registry.npmjs.org/y18n/-/y18n-5.0.8.tgz",
+      "integrity": "sha512-0pfFzegeDWJHJIAmTLRP2DwHjdF5s7jo9tuztdQxAhINCdvS+3nGINqPd00AphqJR/0LhANUS6/+7SCb98YOfA==",
+      "license": "ISC",
+      "engines": {
+        "node": ">=10"
+      }
+    },
+    "node_modules/oas-resolver/node_modules/yargs": {
+      "version": "17.7.3",
+      "resolved": "https://registry.npmjs.org/yargs/-/yargs-17.7.3.tgz",
+      "integrity": "sha512-GZtjxm/J/4TSxuL3FNYjCmLktBTnIw/rVmKSIyKeYAZpmJB2ig9VauCC5xsa82GNKVKDAqpOn3KVzNt0zmrU0g==",
+      "license": "MIT",
+      "dependencies": {
+        "cliui": "^8.0.1",
+        "escalade": "^3.1.1",
+        "get-caller-file": "^2.0.5",
+        "require-directory": "^2.1.1",
+        "string-width": "^4.2.3",
+        "y18n": "^5.0.5",
+        "yargs-parser": "^21.1.1"
+      },
+      "engines": {
+        "node": ">=12"
+      }
+    },
+    "node_modules/oas-resolver/node_modules/yargs-parser": {
+      "version": "21.1.1",
+      "resolved": "https://registry.npmjs.org/yargs-parser/-/yargs-parser-21.1.1.tgz",
+      "integrity": "sha512-tVpsJW7DdjecAiFpbIB1e3qxIQsE6NoPc5/eTdrbbIC4h0LVsWhnoa3g+m2HclBIujHzsxZ4VJVA+GUuc2/LBw==",
+      "license": "ISC",
+      "engines": {
+        "node": ">=12"
+      }
+    },
+    "node_modules/oas-schema-walker": {
+      "version": "1.1.5",
+      "resolved": "https://registry.npmjs.org/oas-schema-walker/-/oas-schema-walker-1.1.5.tgz",
+      "integrity": "sha512-2yucenq1a9YPmeNExoUa9Qwrt9RFkjqaMAA1X+U7sbb0AqBeTIdMHky9SQQ6iN94bO5NW0W4TRYXerG+BdAvAQ==",
+      "license": "BSD-3-Clause",
+      "funding": {
+        "url": "https://github.com/Mermade/oas-kit?sponsor=1"
+      }
+    },
+    "node_modules/oas-validator": {
+      "version": "3.4.0",
+      "resolved": "https://registry.npmjs.org/oas-validator/-/oas-validator-3.4.0.tgz",
+      "integrity": "sha512-l/SxykuACi2U51osSsBXTxdsFc8Fw41xI7AsZkzgVgWJAzoEFaaNptt35WgY9C3757RUclsm6ye5GvSyYoozLQ==",
+      "license": "BSD-3-Clause",
+      "dependencies": {
+        "ajv": "^5.5.2",
+        "better-ajv-errors": "^0.6.7",
+        "call-me-maybe": "^1.0.1",
+        "oas-kit-common": "^1.0.7",
+        "oas-linter": "^3.1.0",
+        "oas-resolver": "^2.3.0",
+        "oas-schema-walker": "^1.1.3",
+        "reftools": "^1.1.0",
+        "should": "^13.2.1",
+        "yaml": "^1.8.3"
+      }
+    },
+    "node_modules/oas-validator/node_modules/ajv": {
+      "version": "5.5.2",
+      "resolved": "https://registry.npmjs.org/ajv/-/ajv-5.5.2.tgz",
+      "integrity": "sha512-Ajr4IcMXq/2QmMkEmSvxqfLN5zGmJ92gHXAeOXq1OekoH2rfDNsgdDoL2f7QaRCy7G/E6TpxBVdRuNraMztGHw==",
+      "license": "MIT",
+      "dependencies": {
+        "co": "^4.6.0",
+        "fast-deep-equal": "^1.0.0",
+        "fast-json-stable-stringify": "^2.0.0",
+        "json-schema-traverse": "^0.3.0"
+      }
+    },
+    "node_modules/oas-validator/node_modules/fast-deep-equal": {
+      "version": "1.1.0",
+      "resolved": "https://registry.npmjs.org/fast-deep-equal/-/fast-deep-equal-1.1.0.tgz",
+      "integrity": "sha512-fueX787WZKCV0Is4/T2cyAdM4+x1S3MXXOAhavE1ys/W42SHAPacLTQhucja22QBYrfGw50M2sRiXPtTGv9Ymw==",
+      "license": "MIT"
+    },
+    "node_modules/oas-validator/node_modules/json-schema-traverse": {
+      "version": "0.3.1",
+      "resolved": "https://registry.npmjs.org/json-schema-traverse/-/json-schema-traverse-0.3.1.tgz",
+      "integrity": "sha512-4JD/Ivzg7PoW8NzdrBSr3UFwC9mHgvI7Z6z3QGBsSHgKaRTUDmyZAAKJo2UbG1kUVfS9WS8bi36N49U1xw43DA==",
+      "license": "MIT"
+    },
+    "node_modules/oauth-sign": {
+      "version": "0.9.0",
+      "resolved": "https://registry.npmjs.org/oauth-sign/-/oauth-sign-0.9.0.tgz",
+      "integrity": "sha512-fexhUFFPTGV8ybAtSIGbV6gOkSv8UtRbDBnAyLQw4QPKkgNlsH2ByPGtMUqdWkos6YCRmAqViwgZrJc/mRDzZQ==",
+      "license": "Apache-2.0",
+      "engines": {
+        "node": "*"
+      }
+    },
+    "node_modules/object-inspect": {
+      "version": "1.13.4",
+      "resolved": "https://registry.npmjs.org/object-inspect/-/object-inspect-1.13.4.tgz",
+      "integrity": "sha512-W67iLl4J2EXEGTbfeHCffrjDfitvLANg0UlX3wFUUSTx92KXRFegMHUVgSqE+wvhAbi4WqjGg9czysTV2Epbew==",
+      "license": "MIT",
+      "engines": {
+        "node": ">= 0.4"
+      },
+      "funding": {
+        "url": "https://github.com/sponsors/ljharb"
+      }
+    },
+    "node_modules/once": {
+      "version": "1.4.0",
+      "resolved": "https://registry.npmjs.org/once/-/once-1.4.0.tgz",
+      "integrity": "sha512-lNaJgI+2Q5URQBkccEKHTQOPaXdUxnZZElQTZY0MFUAuaEqe1E+Nyvgdz/aIyNi6Z9MzO5dv1H8n58/GELp3+w==",
+      "license": "ISC",
+      "dependencies": {
+        "wrappy": "1"
+      }
+    },
+    "node_modules/openapi-generator": {
+      "version": "0.1.39",
+      "resolved": "https://registry.npmjs.org/openapi-generator/-/openapi-generator-0.1.39.tgz",
+      "integrity": "sha512-/i5245hUAXRyYmX1tWy+ftKtU5G8me2QNyjNS670GUSzTVDnhAWc+uYBZWccsvPH26mvEDnj1sTpfUefLiXPZQ==",
+      "license": "MIT",
+      "dependencies": {
+        "@types/nunjucks": "^3.1.0",
+        "@types/request": "^2.48.0",
+        "colorful": "^2.1.0",
+        "commander": "^2.19.0",
+        "debug": "^4.1.0",
+        "nunjucks": "^3.1.3",
+        "openapi3-ts": "^1.1.0",
+        "request": "^2.88.0",
+        "swagger2openapi": "^5.3.1",
+        "tslib": "^1.9.3"
+      },
+      "bin": {
+        "openapi-generator": "bin/index.js"
+      }
+    },
+    "node_modules/openapi3-ts": {
+      "version": "1.4.0",
+      "resolved": "https://registry.npmjs.org/openapi3-ts/-/openapi3-ts-1.4.0.tgz",
+      "integrity": "sha512-8DmE2oKayvSkIR3XSZ4+pRliBsx19bSNeIzkTPswY8r4wvjX86bMxsORdqwAwMxE8PefOcSAT2auvi/0TZe9yA==",
+      "license": "MIT"
+    },
+    "node_modules/os-locale": {
+      "version": "3.1.0",
+      "resolved": "https://registry.npmjs.org/os-locale/-/os-locale-3.1.0.tgz",
+      "integrity": "sha512-Z8l3R4wYWM40/52Z+S265okfFj8Kt2cC2MKY+xNi3kFs+XGI7WXu/I309QQQYbRW4ijiZ+yxs9pqEhJh0DqW3Q==",
+      "license": "MIT",
+      "dependencies": {
+        "execa": "^1.0.0",
+        "lcid": "^2.0.0",
+        "mem": "^4.0.0"
+      },
+      "engines": {
+        "node": ">=6"
+      }
+    },
+    "node_modules/p-defer": {
+      "version": "1.0.0",
+      "resolved": "https://registry.npmjs.org/p-defer/-/p-defer-1.0.0.tgz",
+      "integrity": "sha512-wB3wfAxZpk2AzOfUMJNL+d36xothRSyj8EXOa4f6GMqYDN9BJaaSISbsk+wS9abmnebVw95C2Kb5t85UmpCxuw==",
+      "license": "MIT",
+      "engines": {
+        "node": ">=4"
+      }
+    },
+    "node_modules/p-finally": {
+      "version": "1.0.0",
+      "resolved": "https://registry.npmjs.org/p-finally/-/p-finally-1.0.0.tgz",
+      "integrity": "sha512-LICb2p9CB7FS+0eR1oqWnHhp0FljGLZCWBE9aix0Uye9W8LTQPwMTYVGWQWIw9RdQiDg4+epXQODwIYJtSJaow==",
+      "license": "MIT",
+      "engines": {
+        "node": ">=4"
+      }
+    },
+    "node_modules/p-is-promise": {
+      "version": "2.1.0",
+      "resolved": "https://registry.npmjs.org/p-is-promise/-/p-is-promise-2.1.0.tgz",
+      "integrity": "sha512-Y3W0wlRPK8ZMRbNq97l4M5otioeA5lm1z7bkNkxCka8HSPjR0xRWmpCmc9utiaLP9Jb1eD8BgeIxTW4AIF45Pg==",
+      "license": "MIT",
+      "engines": {
+        "node": ">=6"
+      }
+    },
+    "node_modules/p-limit": {
+      "version": "2.3.0",
+      "resolved": "https://registry.npmjs.org/p-limit/-/p-limit-2.3.0.tgz",
+      "integrity": "sha512-//88mFWSJx8lxCzwdAABTJL2MyWB12+eIY7MDL2SqLmAkeKU9qxRvWuSyTjm3FUmpBEMuFfckAIqEaVGUDxb6w==",
+      "license": "MIT",
+      "dependencies": {
+        "p-try": "^2.0.0"
+      },
+      "engines": {
+        "node": ">=6"
+      },
+      "funding": {
+        "url": "https://github.com/sponsors/sindresorhus"
+      }
+    },
+    "node_modules/p-locate": {
+      "version": "3.0.0",
+      "resolved": "https://registry.npmjs.org/p-locate/-/p-locate-3.0.0.tgz",
+      "integrity": "sha512-x+12w/To+4GFfgJhBEpiDcLozRJGegY+Ei7/z0tSLkMmxGZNybVMSfWj9aJn8Z5Fc7dBUNJOOVgPv2H7IwulSQ==",
+      "license": "MIT",
+      "dependencies": {
+        "p-limit": "^2.0.0"
+      },
+      "engines": {
+        "node": ">=6"
+      }
+    },
+    "node_modules/p-try": {
+      "version": "2.2.0",
+      "resolved": "https://registry.npmjs.org/p-try/-/p-try-2.2.0.tgz",
+      "integrity": "sha512-R4nPAVTAU0B9D35/Gk3uJf/7XYbQcyohSKdvAxIRSNghFl4e71hVoGnBNQz9cWaXxO2I10KTC+3jMdvvoKw6dQ==",
+      "license": "MIT",
+      "engines": {
+        "node": ">=6"
+      }
+    },
+    "node_modules/path-exists": {
+      "version": "3.0.0",
+      "resolved": "https://registry.npmjs.org/path-exists/-/path-exists-3.0.0.tgz",
+      "integrity": "sha512-bpC7GYwiDYQ4wYLe+FA8lhRjhQCMcQGuSgGGqDkg/QerRWw9CmGRT0iSOVRSZJ29NMLZgIzqaljJ63oaL4NIJQ==",
+      "license": "MIT",
+      "engines": {
+        "node": ">=4"
+      }
+    },
+    "node_modules/path-key": {
+      "version": "2.0.1",
+      "resolved": "https://registry.npmjs.org/path-key/-/path-key-2.0.1.tgz",
+      "integrity": "sha512-fEHGKCSmUSDPv4uoj8AlD+joPlq3peND+HRYyxFz4KPw4z926S/b8rIuFs2FYJg3BwsxJf6A9/3eIdLaYC+9Dw==",
+      "license": "MIT",
+      "engines": {
+        "node": ">=4"
+      }
+    },
+    "node_modules/performance-now": {
+      "version": "2.1.0",
+      "resolved": "https://registry.npmjs.org/performance-now/-/performance-now-2.1.0.tgz",
+      "integrity": "sha512-7EAHlyLHI56VEIdK57uwHdHKIaAGbnXPiw0yWbarQZOKaKpvUIgW0jWRVLiatnM+XXlSwsanIBH/hzGMJulMow==",
+      "license": "MIT"
+    },
+    "node_modules/picocolors": {
+      "version": "1.1.1",
+      "resolved": "https://registry.npmjs.org/picocolors/-/picocolors-1.1.1.tgz",
+      "integrity": "sha512-xceH2snhtb5M9liqDsmEw56le376mTZkEX/jEb/RxNFyegNul7eNslCXP9FDj/Lcu0X8KEyMceP2ntpaHrDEVA==",
+      "license": "ISC"
+    },
+    "node_modules/postcss": {
+      "version": "8.4.31",
+      "resolved": "https://registry.npmjs.org/postcss/-/postcss-8.4.31.tgz",
+      "integrity": "sha512-PS08Iboia9mts/2ygV3eLpY5ghnUcfLV/EXTOW1E2qYxJKGGBUtNjN76FYHnMs36RmARn41bC0AZmn+rR0OVpQ==",
+      "funding": [
+        {
+          "type": "opencollective",
+          "url": "https://opencollective.com/postcss/"
+        },
+        {
+          "type": "tidelift",
+          "url": "https://tidelift.com/funding/github/npm/postcss"
+        },
+        {
+          "type": "github",
+          "url": "https://github.com/sponsors/ai"
+        }
+      ],
+      "license": "MIT",
+      "dependencies": {
+        "nanoid": "^3.3.6",
+        "picocolors": "^1.0.0",
+        "source-map-js": "^1.0.2"
+      },
+      "engines": {
+        "node": "^10 || ^12 || >=14"
+      }
+    },
+    "node_modules/psl": {
+      "version": "1.15.0",
+      "resolved": "https://registry.npmjs.org/psl/-/psl-1.15.0.tgz",
+      "integrity": "sha512-JZd3gMVBAVQkSs6HdNZo9Sdo0LNcQeMNP3CozBJb3JYC/QUYZTnKxP+f8oWRX4rHP5EurWxqAHTSwUCjlNKa1w==",
+      "license": "MIT",
+      "dependencies": {
+        "punycode": "^2.3.1"
+      },
+      "funding": {
+        "url": "https://github.com/sponsors/lupomontero"
+      }
+    },
+    "node_modules/pump": {
+      "version": "3.0.4",
+      "resolved": "https://registry.npmjs.org/pump/-/pump-3.0.4.tgz",
+      "integrity": "sha512-VS7sjc6KR7e1ukRFhQSY5LM2uBWAUPiOPa/A3mkKmiMwSmRFUITt0xuj+/lesgnCv+dPIEYlkzrcyXgquIHMcA==",
+      "license": "MIT",
+      "dependencies": {
+        "end-of-stream": "^1.1.0",
+        "once": "^1.3.1"
+      }
+    },
+    "node_modules/punycode": {
+      "version": "2.3.1",
+      "resolved": "https://registry.npmjs.org/punycode/-/punycode-2.3.1.tgz",
+      "integrity": "sha512-vYt7UD1U9Wg6138shLtLOvdAu+8DsC/ilFtEVHcH+wydcSpNE20AfSOduf6MkRFahL5FY7X1oU7nKVZFtfq8Fg==",
+      "license": "MIT",
+      "engines": {
+        "node": ">=6"
+      }
+    },
+    "node_modules/qs": {
+      "version": "6.15.3",
+      "resolved": "https://registry.npmjs.org/qs/-/qs-6.15.3.tgz",
+      "integrity": "sha512-O9gl3zCl5h5blw1KGUzQKhA5oUXSl8rwUIM5o0S3nCXMliSvy5Dzx7/DJcI+SwgICv+IneSZwhBh1oSyEHA71A==",
+      "license": "BSD-3-Clause",
+      "dependencies": {
+        "es-define-property": "^1.0.1",
+        "side-channel": "^1.1.1"
+      },
+      "engines": {
+        "node": ">=0.6"
+      },
+      "funding": {
+        "url": "https://github.com/sponsors/ljharb"
+      }
+    },
+    "node_modules/raf": {
+      "version": "3.4.1",
+      "resolved": "https://registry.npmjs.org/raf/-/raf-3.4.1.tgz",
+      "integrity": "sha512-Sq4CW4QhwOHE8ucn6J34MqtZCeWFP2aQSmrlroYgqAV1PjStIhJXxYuTgUIfkEk7zTLjmIjLmU5q+fbD1NnOJA==",
+      "license": "MIT",
+      "optional": true,
+      "dependencies": {
+        "performance-now": "^2.1.0"
+      }
+    },
+    "node_modules/react": {
+      "version": "18.3.1",
+      "resolved": "https://registry.npmjs.org/react/-/react-18.3.1.tgz",
+      "integrity": "sha512-wS+hAgJShR0KhEvPJArfuPVN1+Hz1t0Y6n5jLrGQbkb4urgPE/0Rve+1kMB1v/oWgHgm4WIcV+i7F2pTVj+2iQ==",
+      "license": "MIT",
+      "dependencies": {
+        "loose-envify": "^1.1.0"
+      },
+      "engines": {
+        "node": ">=0.10.0"
+      }
+    },
+    "node_modules/react-dom": {
+      "version": "18.3.1",
+      "resolved": "https://registry.npmjs.org/react-dom/-/react-dom-18.3.1.tgz",
+      "integrity": "sha512-5m4nQKp+rZRb09LNH59GM4BxTh9251/ylbKIbpe7TpGxfJ+9kv6BLkLBXIjjspbgbnIBNqlI23tRnTWT0snUIw==",
+      "license": "MIT",
+      "dependencies": {
+        "loose-envify": "^1.1.0",
+        "scheduler": "^0.23.2"
+      },
+      "peerDependencies": {
+        "react": "^18.3.1"
+      }
+    },
+    "node_modules/reftools": {
+      "version": "1.1.9",
+      "resolved": "https://registry.npmjs.org/reftools/-/reftools-1.1.9.tgz",
+      "integrity": "sha512-OVede/NQE13xBQ+ob5CKd5KyeJYU2YInb1bmV4nRoOfquZPkAkxuOXicSe1PvqIuZZ4kD13sPKBbR7UFDmli6w==",
+      "license": "BSD-3-Clause",
+      "funding": {
+        "url": "https://github.com/Mermade/oas-kit?sponsor=1"
+      }
+    },
+    "node_modules/regenerator-runtime": {
+      "version": "0.14.1",
+      "resolved": "https://registry.npmjs.org/regenerator-runtime/-/regenerator-runtime-0.14.1.tgz",
+      "integrity": "sha512-dYnhHh0nJoMfnkZs6GmmhFknAGRrLznOu5nc9ML+EJxGvrx6H7teuevqVqCuPcPK//3eDrrjQhehXVx9cnkGdw==",
+      "license": "MIT"
+    },
+    "node_modules/request": {
+      "version": "2.88.2",
+      "resolved": "https://registry.npmjs.org/request/-/request-2.88.2.tgz",
+      "integrity": "sha512-MsvtOrfG9ZcrOwAW+Qi+F6HbD0CWXEh9ou77uOb7FM2WPhwT7smM833PzanhJLsgXjN89Ir6V2PczXNnMpwKhw==",
+      "deprecated": "request has been deprecated, see https://github.com/request/request/issues/3142",
+      "license": "Apache-2.0",
+      "dependencies": {
+        "aws-sign2": "~0.7.0",
+        "aws4": "^1.8.0",
+        "caseless": "~0.12.0",
+        "combined-stream": "~1.0.6",
+        "extend": "~3.0.2",
+        "forever-agent": "~0.6.1",
+        "form-data": "~2.3.2",
+        "har-validator": "~5.1.3",
+        "http-signature": "~1.2.0",
+        "is-typedarray": "~1.0.0",
+        "isstream": "~0.1.2",
+        "json-stringify-safe": "~5.0.1",
+        "mime-types": "~2.1.19",
+        "oauth-sign": "~0.9.0",
+        "performance-now": "^2.1.0",
+        "qs": "~6.5.2",
+        "safe-buffer": "^5.1.2",
+        "tough-cookie": "~2.5.0",
+        "tunnel-agent": "^0.6.0",
+        "uuid": "^3.3.2"
+      },
+      "engines": {
+        "node": ">= 6"
+      }
+    },
+    "node_modules/request/node_modules/form-data": {
+      "version": "2.3.3",
+      "resolved": "https://registry.npmjs.org/form-data/-/form-data-2.3.3.tgz",
+      "integrity": "sha512-1lLKB2Mu3aGP1Q/2eCOx0fNbRMe7XdwktwOruhfqqd0rIJWwN4Dh+E3hrPSlDCXnSR7UtZ1N38rVXm+6+MEhJQ==",
+      "license": "MIT",
+      "dependencies": {
+        "asynckit": "^0.4.0",
+        "combined-stream": "^1.0.6",
+        "mime-types": "^2.1.12"
+      },
+      "engines": {
+        "node": ">= 0.12"
+      }
+    },
+    "node_modules/request/node_modules/http-signature": {
+      "version": "1.2.0",
+      "resolved": "https://registry.npmjs.org/http-signature/-/http-signature-1.2.0.tgz",
+      "integrity": "sha512-CAbnr6Rz4CYQkLYUtSNXxQPUH2gK8f3iWexVlsnMeD+GjlsQ0Xsy1cOX+mN3dtxYomRy21CiOzU8Uhw6OwncEQ==",
+      "license": "MIT",
+      "dependencies": {
+        "assert-plus": "^1.0.0",
+        "jsprim": "^1.2.2",
+        "sshpk": "^1.7.0"
+      },
+      "engines": {
+        "node": ">=0.8",
+        "npm": ">=1.3.7"
+      }
+    },
+    "node_modules/request/node_modules/qs": {
+      "version": "6.5.5",
+      "resolved": "https://registry.npmjs.org/qs/-/qs-6.5.5.tgz",
+      "integrity": "sha512-mzR4sElr1bfCaPJe7m8ilJ6ZXdDaGoObcYR0ZHSsktM/Lt21MVHj5De30GQH2eiZ1qGRTO7LCAzQsUeXTNexWQ==",
+      "license": "BSD-3-Clause",
+      "engines": {
+        "node": ">=0.6"
+      }
+    },
+    "node_modules/require-directory": {
+      "version": "2.1.1",
+      "resolved": "https://registry.npmjs.org/require-directory/-/require-directory-2.1.1.tgz",
+      "integrity": "sha512-fGxEI7+wsG9xrvdjsrlmL22OMTTiHRwAMroiEeMgq8gzoLC/PQr7RsRDSTLUg/bZAZtF+TVIkHc6/4RIKrui+Q==",
+      "license": "MIT",
+      "engines": {
+        "node": ">=0.10.0"
+      }
+    },
+    "node_modules/require-main-filename": {
+      "version": "1.0.1",
+      "resolved": "https://registry.npmjs.org/require-main-filename/-/require-main-filename-1.0.1.tgz",
+      "integrity": "sha512-IqSUtOVP4ksd1C/ej5zeEh/BIP2ajqpn8c5x+q99gvcIG/Qf0cud5raVnE/Dwd0ua9TXYDoDc0RE5hBSdz22Ug==",
+      "license": "ISC"
+    },
+    "node_modules/rgbcolor": {
+      "version": "1.0.1",
+      "resolved": "https://registry.npmjs.org/rgbcolor/-/rgbcolor-1.0.1.tgz",
+      "integrity": "sha512-9aZLIrhRaD97sgVhtJOW6ckOEh6/GnvQtdVNfdZ6s67+3/XwLS9lBcQYzEEhYVeUowN7pRzMLsyGhK2i/xvWbw==",
+      "license": "MIT OR SEE LICENSE IN FEEL-FREE.md",
+      "optional": true,
+      "engines": {
+        "node": ">= 0.8.15"
+      }
+    },
+    "node_modules/rxjs": {
+      "version": "7.8.2",
+      "resolved": "https://registry.npmjs.org/rxjs/-/rxjs-7.8.2.tgz",
+      "integrity": "sha512-dhKf903U/PQZY6boNNtAGdWbG85WAbjT/1xYoZIC7FAY0yWapOBQVsVrDl58W86//e1VpMNBtRV4MaXfdMySFA==",
+      "license": "Apache-2.0",
+      "optional": true,
+      "dependencies": {
+        "tslib": "^2.1.0"
+      }
+    },
+    "node_modules/rxjs/node_modules/tslib": {
+      "version": "2.8.1",
+      "resolved": "https://registry.npmjs.org/tslib/-/tslib-2.8.1.tgz",
+      "integrity": "sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w==",
+      "license": "0BSD",
+      "optional": true
+    },
+    "node_modules/safe-buffer": {
+      "version": "5.2.1",
+      "resolved": "https://registry.npmjs.org/safe-buffer/-/safe-buffer-5.2.1.tgz",
+      "integrity": "sha512-rp3So07KcdmmKbGvgaNxQSJr7bGVSVk5S9Eq1F+ppbRo70+YeaDxkw5Dd8NPN+GD6bjnYm2VuPuCXmpuYvmCXQ==",
+      "funding": [
+        {
+          "type": "github",
+          "url": "https://github.com/sponsors/feross"
+        },
+        {
+          "type": "patreon",
+          "url": "https://www.patreon.com/feross"
+        },
+        {
+          "type": "consulting",
+          "url": "https://feross.org/support"
+        }
+      ],
+      "license": "MIT"
+    },
+    "node_modules/safer-buffer": {
+      "version": "2.1.2",
+      "resolved": "https://registry.npmjs.org/safer-buffer/-/safer-buffer-2.1.2.tgz",
+      "integrity": "sha512-YZo3K82SD7Riyi0E1EQPojLz7kpepnSQI9IyPbHHg1XXXevb5dJI7tpyN2ADxGcQbHG7vcyRHk0cbwqcQriUtg==",
+      "license": "MIT"
+    },
+    "node_modules/scheduler": {
+      "version": "0.23.2",
+      "resolved": "https://registry.npmjs.org/scheduler/-/scheduler-0.23.2.tgz",
+      "integrity": "sha512-UOShsPwz7NrMUqhR6t0hWjFduvOzbtv7toDH1/hIrfRNIDBnnBWd0CwJTGvTpngVlmwGCdP9/Zl/tVrDqcuYzQ==",
+      "license": "MIT",
+      "dependencies": {
+        "loose-envify": "^1.1.0"
+      }
+    },
+    "node_modules/sdp": {
+      "version": "3.2.2",
+      "resolved": "https://registry.npmjs.org/sdp/-/sdp-3.2.2.tgz",
+      "integrity": "sha512-xZocWwfyp4hkbN4hLWxMjmv2Q8aNa9MhmOZ7L9aCZPT+dZsgRr6wZRrSYE3HTdyk/2pZKPSgqI7ns7Een1xMSA==",
+      "license": "MIT"
+    },
+    "node_modules/sdp-transform": {
+      "version": "2.15.0",
+      "resolved": "https://registry.npmjs.org/sdp-transform/-/sdp-transform-2.15.0.tgz",
+      "integrity": "sha512-KrOH82c/W+GYQ0LHqtr3caRpM3ITglq3ljGUIb8LTki7ByacJZ9z+piSGiwZDsRyhQbYBOBJgr2k6X4BZXi3Kw==",
+      "license": "MIT",
+      "bin": {
+        "sdp-verify": "checker.js"
+      }
+    },
+    "node_modules/semver": {
+      "version": "5.7.2",
+      "resolved": "https://registry.npmjs.org/semver/-/semver-5.7.2.tgz",
+      "integrity": "sha512-cBznnQ9KjJqU67B52RMC65CMarK2600WFnbkcaiwWq3xy/5haFJlshgnpjovMVJ+Hff49d8GEn0b87C5pDQ10g==",
+      "license": "ISC",
+      "bin": {
+        "semver": "bin/semver"
+      }
+    },
+    "node_modules/set-blocking": {
+      "version": "2.0.0",
+      "resolved": "https://registry.npmjs.org/set-blocking/-/set-blocking-2.0.0.tgz",
+      "integrity": "sha512-KiKBS8AnWGEyLzofFfmvKwpdPzqiy16LvQfK3yv/fVH7Bj13/wl3JSR1J+rfgRE9q7xUJK4qvgS8raSOeLUehw==",
+      "license": "ISC"
+    },
+    "node_modules/shebang-command": {
+      "version": "1.2.0",
+      "resolved": "https://registry.npmjs.org/shebang-command/-/shebang-command-1.2.0.tgz",
+      "integrity": "sha512-EV3L1+UQWGor21OmnvojK36mhg+TyIKDh3iFBKBohr5xeXIhNBcx8oWdgkTEEQ+BEFFYdLRuqMfd5L84N1V5Vg==",
+      "license": "MIT",
+      "dependencies": {
+        "shebang-regex": "^1.0.0"
+      },
+      "engines": {
+        "node": ">=0.10.0"
+      }
+    },
+    "node_modules/shebang-regex": {
+      "version": "1.0.0",
+      "resolved": "https://registry.npmjs.org/shebang-regex/-/shebang-regex-1.0.0.tgz",
+      "integrity": "sha512-wpoSFAxys6b2a2wHZ1XpDSgD7N9iVjg29Ph9uV/uaP9Ex/KXlkTZTeddxDPSYQpgvzKLGJke2UU0AzoGCjNIvQ==",
+      "license": "MIT",
+      "engines": {
+        "node": ">=0.10.0"
+      }
+    },
+    "node_modules/should": {
+      "version": "13.2.3",
+      "resolved": "https://registry.npmjs.org/should/-/should-13.2.3.tgz",
+      "integrity": "sha512-ggLesLtu2xp+ZxI+ysJTmNjh2U0TsC+rQ/pfED9bUZZ4DKefP27D+7YJVVTvKsmjLpIi9jAa7itwDGkDDmt1GQ==",
+      "license": "MIT",
+      "dependencies": {
+        "should-equal": "^2.0.0",
+        "should-format": "^3.0.3",
+        "should-type": "^1.4.0",
+        "should-type-adaptors": "^1.0.1",
+        "should-util": "^1.0.0"
+      }
+    },
+    "node_modules/should-equal": {
+      "version": "2.0.0",
+      "resolved": "https://registry.npmjs.org/should-equal/-/should-equal-2.0.0.tgz",
+      "integrity": "sha512-ZP36TMrK9euEuWQYBig9W55WPC7uo37qzAEmbjHz4gfyuXrEUgF8cUvQVO+w+d3OMfPvSRQJ22lSm8MQJ43LTA==",
+      "license": "MIT",
+      "dependencies": {
+        "should-type": "^1.4.0"
+      }
+    },
+    "node_modules/should-format": {
+      "version": "3.0.3",
+      "resolved": "https://registry.npmjs.org/should-format/-/should-format-3.0.3.tgz",
+      "integrity": "sha512-hZ58adtulAk0gKtua7QxevgUaXTTXxIi8t41L3zo9AHvjXO1/7sdLECuHeIN2SRtYXpNkmhoUP2pdeWgricQ+Q==",
+      "license": "MIT",
+      "dependencies": {
+        "should-type": "^1.3.0",
+        "should-type-adaptors": "^1.0.1"
+      }
+    },
+    "node_modules/should-type": {
+      "version": "1.4.0",
+      "resolved": "https://registry.npmjs.org/should-type/-/should-type-1.4.0.tgz",
+      "integrity": "sha512-MdAsTu3n25yDbIe1NeN69G4n6mUnJGtSJHygX3+oN0ZbO3DTiATnf7XnYJdGT42JCXurTb1JI0qOBR65shvhPQ==",
+      "license": "MIT"
+    },
+    "node_modules/should-type-adaptors": {
+      "version": "1.1.0",
+      "resolved": "https://registry.npmjs.org/should-type-adaptors/-/should-type-adaptors-1.1.0.tgz",
+      "integrity": "sha512-JA4hdoLnN+kebEp2Vs8eBe9g7uy0zbRo+RMcU0EsNy+R+k049Ki+N5tT5Jagst2g7EAja+euFuoXFCa8vIklfA==",
+      "license": "MIT",
+      "dependencies": {
+        "should-type": "^1.3.0",
+        "should-util": "^1.0.0"
+      }
+    },
+    "node_modules/should-util": {
+      "version": "1.0.1",
+      "resolved": "https://registry.npmjs.org/should-util/-/should-util-1.0.1.tgz",
+      "integrity": "sha512-oXF8tfxx5cDk8r2kYqlkUJzZpDBqVY/II2WhvU0n9Y3XYvAYRmeaf1PvvIvTgPnv4KJ+ES5M0PyDq5Jp+Ygy2g==",
+      "license": "MIT"
+    },
+    "node_modules/side-channel": {
+      "version": "1.1.1",
+      "resolved": "https://registry.npmjs.org/side-channel/-/side-channel-1.1.1.tgz",
+      "integrity": "sha512-6x6dK6zJdpTzF4sQeNYxwtvBzf6Eg4GtlesS94HOvTudUeyK2WXAaIfmDgsyslYrRBeFIlsi54AYsFGUuhmvrQ==",
+      "license": "MIT",
+      "dependencies": {
+        "es-errors": "^1.3.0",
+        "object-inspect": "^1.13.4",
+        "side-channel-list": "^1.0.1",
+        "side-channel-map": "^1.0.1",
+        "side-channel-weakmap": "^1.0.2"
+      },
+      "engines": {
+        "node": ">= 0.4"
+      },
+      "funding": {
+        "url": "https://github.com/sponsors/ljharb"
+      }
+    },
+    "node_modules/side-channel-list": {
+      "version": "1.0.1",
+      "resolved": "https://registry.npmjs.org/side-channel-list/-/side-channel-list-1.0.1.tgz",
+      "integrity": "sha512-mjn/0bi/oUURjc5Xl7IaWi/OJJJumuoJFQJfDDyO46+hBWsfaVM65TBHq2eoZBhzl9EchxOijpkbRC8SVBQU0w==",
+      "license": "MIT",
+      "dependencies": {
+        "es-errors": "^1.3.0",
+        "object-inspect": "^1.13.4"
+      },
+      "engines": {
+        "node": ">= 0.4"
+      },
+      "funding": {
+        "url": "https://github.com/sponsors/ljharb"
+      }
+    },
+    "node_modules/side-channel-map": {
+      "version": "1.0.1",
+      "resolved": "https://registry.npmjs.org/side-channel-map/-/side-channel-map-1.0.1.tgz",
+      "integrity": "sha512-VCjCNfgMsby3tTdo02nbjtM/ewra6jPHmpThenkTYh8pG9ucZ/1P8So4u4FGBek/BjpOVsDCMoLA/iuBKIFXRA==",
+      "license": "MIT",
+      "dependencies": {
+        "call-bound": "^1.0.2",
+        "es-errors": "^1.3.0",
+        "get-intrinsic": "^1.2.5",
+        "object-inspect": "^1.13.3"
+      },
+      "engines": {
+        "node": ">= 0.4"
+      },
+      "funding": {
+        "url": "https://github.com/sponsors/ljharb"
+      }
+    },
+    "node_modules/side-channel-weakmap": {
+      "version": "1.0.2",
+      "resolved": "https://registry.npmjs.org/side-channel-weakmap/-/side-channel-weakmap-1.0.2.tgz",
+      "integrity": "sha512-WPS/HvHQTYnHisLo9McqBHOJk2FkHO/tlpvldyrnem4aeQp4hai3gythswg6p01oSoTl58rcpiFAjF2br2Ak2A==",
+      "license": "MIT",
+      "dependencies": {
+        "call-bound": "^1.0.2",
+        "es-errors": "^1.3.0",
+        "get-intrinsic": "^1.2.5",
+        "object-inspect": "^1.13.3",
+        "side-channel-map": "^1.0.1"
+      },
+      "engines": {
+        "node": ">= 0.4"
+      },
+      "funding": {
+        "url": "https://github.com/sponsors/ljharb"
+      }
+    },
+    "node_modules/signal-exit": {
+      "version": "3.0.7",
+      "resolved": "https://registry.npmjs.org/signal-exit/-/signal-exit-3.0.7.tgz",
+      "integrity": "sha512-wnD2ZE+l+SPC/uoS0vXeE9L1+0wuaMqKlfz9AMUo38JsyLSBWSFcHR1Rri62LZc12vLr1gb3jl7iwQhgwpAbGQ==",
+      "license": "ISC"
+    },
+    "node_modules/source-map-js": {
+      "version": "1.2.1",
+      "resolved": "https://registry.npmjs.org/source-map-js/-/source-map-js-1.2.1.tgz",
+      "integrity": "sha512-UXWMKhLOwVKb728IUtQPXxfYU+usdybtUrK/8uGE8CQMvrhOpwvzDBwj0QhSL7MQc7vIsISBG8VQ8+IDQxpfQA==",
+      "license": "BSD-3-Clause",
+      "engines": {
+        "node": ">=0.10.0"
+      }
+    },
+    "node_modules/sshpk": {
+      "version": "1.18.0",
+      "resolved": "https://registry.npmjs.org/sshpk/-/sshpk-1.18.0.tgz",
+      "integrity": "sha512-2p2KJZTSqQ/I3+HX42EpYOa2l3f8Erv8MWKsy2I9uf4wA7yFIkXRffYdsx86y6z4vHtV8u7g+pPlr8/4ouAxsQ==",
+      "license": "MIT",
+      "dependencies": {
+        "asn1": "~0.2.3",
+        "assert-plus": "^1.0.0",
+        "bcrypt-pbkdf": "^1.0.0",
+        "dashdash": "^1.12.0",
+        "ecc-jsbn": "~0.1.1",
+        "getpass": "^0.1.1",
+        "jsbn": "~0.1.0",
+        "safer-buffer": "^2.0.2",
+        "tweetnacl": "~0.14.0"
+      },
+      "bin": {
+        "sshpk-conv": "bin/sshpk-conv",
+        "sshpk-sign": "bin/sshpk-sign",
+        "sshpk-verify": "bin/sshpk-verify"
+      },
+      "engines": {
+        "node": ">=0.10.0"
+      }
+    },
+    "node_modules/stackblur-canvas": {
+      "version": "2.7.0",
+      "resolved": "https://registry.npmjs.org/stackblur-canvas/-/stackblur-canvas-2.7.0.tgz",
+      "integrity": "sha512-yf7OENo23AGJhBriGx0QivY5JP6Y1HbrrDI6WLt6C5auYZXlQrheoY8hD4ibekFKz1HOfE48Ww8kMWMnJD/zcQ==",
+      "license": "MIT",
+      "optional": true,
+      "engines": {
+        "node": ">=0.1.14"
+      }
+    },
+    "node_modules/streamsearch": {
+      "version": "1.1.0",
+      "resolved": "https://registry.npmjs.org/streamsearch/-/streamsearch-1.1.0.tgz",
+      "integrity": "sha512-Mcc5wHehp9aXz1ax6bZUyY5afg9u2rv5cqQI3mRrYkGC8rW2hM02jWuwjtL++LS5qinSyhj2QfLyNsuc+VsExg==",
+      "engines": {
+        "node": ">=10.0.0"
+      }
+    },
+    "node_modules/string-width": {
+      "version": "2.1.1",
+      "resolved": "https://registry.npmjs.org/string-width/-/string-width-2.1.1.tgz",
+      "integrity": "sha512-nOqH59deCq9SRHlxq1Aw85Jnt4w6KvLKqWVik6oA9ZklXLNIOlqg4F2yrT1MVaTjAqvVwdfeZ7w7aCvJD7ugkw==",
+      "license": "MIT",
+      "dependencies": {
+        "is-fullwidth-code-point": "^2.0.0",
+        "strip-ansi": "^4.0.0"
+      },
+      "engines": {
+        "node": ">=4"
+      }
+    },
+    "node_modules/strip-ansi": {
+      "version": "4.0.0",
+      "resolved": "https://registry.npmjs.org/strip-ansi/-/strip-ansi-4.0.0.tgz",
+      "integrity": "sha512-4XaJ2zQdCzROZDivEVIDPkcQn8LMFSa8kj8Gxb/Lnwzv9A8VctNZ+lfivC/sV3ivW8ElJTERXZoPBRrZKkNKow==",
+      "license": "MIT",
+      "dependencies": {
+        "ansi-regex": "^3.0.0"
+      },
+      "engines": {
+        "node": ">=4"
+      }
+    },
+    "node_modules/strip-eof": {
+      "version": "1.0.0",
+      "resolved": "https://registry.npmjs.org/strip-eof/-/strip-eof-1.0.0.tgz",
+      "integrity": "sha512-7FCwGGmx8mD5xQd3RPUvnSpUXHM3BWuzjtpD4TXsfcZ9EL4azvVVUscFYwD9nx8Kh+uCBC00XBtAykoMHwTh8Q==",
+      "license": "MIT",
+      "engines": {
+        "node": ">=0.10.0"
+      }
+    },
+    "node_modules/styled-jsx": {
+      "version": "5.1.1",
+      "resolved": "https://registry.npmjs.org/styled-jsx/-/styled-jsx-5.1.1.tgz",
+      "integrity": "sha512-pW7uC1l4mBZ8ugbiZrcIsiIvVx1UmTfw7UkC3Um2tmfUq9Bhk8IiyEIPl6F8agHgjzku6j0xQEZbfA5uSgSaCw==",
+      "license": "MIT",
+      "dependencies": {
+        "client-only": "0.0.1"
+      },
+      "engines": {
+        "node": ">= 12.0.0"
+      },
+      "peerDependencies": {
+        "react": ">= 16.8.0 || 17.x.x || ^18.0.0-0"
+      },
+      "peerDependenciesMeta": {
+        "@babel/core": {
+          "optional": true
+        },
+        "babel-plugin-macros": {
+          "optional": true
+        }
+      }
+    },
+    "node_modules/supports-color": {
+      "version": "5.5.0",
+      "resolved": "https://registry.npmjs.org/supports-color/-/supports-color-5.5.0.tgz",
+      "integrity": "sha512-QjVjwdXIt408MIiAqCX4oUKsgU2EqAGzs2Ppkm4aQYbjm+ZEWEcW4SfFNTr4uMNZma0ey4f5lgLrkB0aX0QMow==",
+      "license": "MIT",
+      "dependencies": {
+        "has-flag": "^3.0.0"
+      },
+      "engines": {
+        "node": ">=4"
+      }
+    },
+    "node_modules/svg-pathdata": {
+      "version": "6.0.3",
+      "resolved": "https://registry.npmjs.org/svg-pathdata/-/svg-pathdata-6.0.3.tgz",
+      "integrity": "sha512-qsjeeq5YjBZ5eMdFuUa4ZosMLxgr5RZ+F+Y1OrDhuOCEInRMA3x74XdBtggJcj9kOeInz0WE+LgCPDkZFlBYJw==",
+      "license": "MIT",
+      "optional": true,
+      "engines": {
+        "node": ">=12.0.0"
+      }
+    },
+    "node_modules/swagger2openapi": {
+      "version": "5.4.0",
+      "resolved": "https://registry.npmjs.org/swagger2openapi/-/swagger2openapi-5.4.0.tgz",
+      "integrity": "sha512-f5QqfXawiVijhjMtYqWZ55ESHPZFqrPC8L9idhIiuSX8O2qsa1i4MVGtCM3TQF+Smzr/6WfT/7zBuzG3aTgPAA==",
+      "license": "BSD-3-Clause",
+      "dependencies": {
+        "better-ajv-errors": "^0.6.1",
+        "call-me-maybe": "^1.0.1",
+        "node-fetch-h2": "^2.3.0",
+        "node-readfiles": "^0.2.0",
+        "oas-kit-common": "^1.0.7",
+        "oas-resolver": "^2.3.0",
+        "oas-schema-walker": "^1.1.3",
+        "oas-validator": "^3.4.0",
+        "reftools": "^1.1.0",
+        "yaml": "^1.8.3",
+        "yargs": "^12.0.5"
+      },
+      "bin": {
+        "boast": "boast.js",
+        "oas-validate": "oas-validate.js",
+        "swagger2openapi": "swagger2openapi.js"
+      }
+    },
+    "node_modules/text-segmentation": {
+      "version": "1.0.3",
+      "resolved": "https://registry.npmjs.org/text-segmentation/-/text-segmentation-1.0.3.tgz",
+      "integrity": "sha512-iOiPUo/BGnZ6+54OsWxZidGCsdU8YbE4PSpdPinp7DeMtUJNJBoJ/ouUSTJjHkh1KntHaltHl/gDs2FC4i5+Nw==",
+      "license": "MIT",
+      "optional": true,
+      "dependencies": {
+        "utrie": "^1.0.2"
+      }
+    },
+    "node_modules/tough-cookie": {
+      "version": "2.5.0",
+      "resolved": "https://registry.npmjs.org/tough-cookie/-/tough-cookie-2.5.0.tgz",
+      "integrity": "sha512-nlLsUzgm1kfLXSXfRZMc1KLAugd4hqJHDTvc2hDIwS3mZAfMEuMbc03SujMF+GEcpaX/qboeycw6iO8JwVv2+g==",
+      "license": "BSD-3-Clause",
+      "dependencies": {
+        "psl": "^1.1.28",
+        "punycode": "^2.1.1"
+      },
+      "engines": {
+        "node": ">=0.8"
+      }
+    },
+    "node_modules/ts-debounce": {
+      "version": "4.0.0",
+      "resolved": "https://registry.npmjs.org/ts-debounce/-/ts-debounce-4.0.0.tgz",
+      "integrity": "sha512-+1iDGY6NmOGidq7i7xZGA4cm8DAa6fqdYcvO5Z6yBevH++Bdo9Qt/mN0TzHUgcCcKv1gmh9+W5dHqz8pMWbCbg==",
+      "license": "MIT"
+    },
+    "node_modules/tslib": {
+      "version": "1.14.1",
+      "resolved": "https://registry.npmjs.org/tslib/-/tslib-1.14.1.tgz",
+      "integrity": "sha512-Xni35NKzjgMrwevysHTCArtLDpPvye8zV/0E4EyYn43P7/7qvQwPh9BGkHewbMulVntbigmcT7rdX3BNo9wRJg==",
+      "license": "0BSD"
+    },
+    "node_modules/tunnel-agent": {
+      "version": "0.6.0",
+      "resolved": "https://registry.npmjs.org/tunnel-agent/-/tunnel-agent-0.6.0.tgz",
+      "integrity": "sha512-McnNiV1l8RYeY8tBgEpuodCC1mLUdbSN+CYBL7kJsJNInOP8UjDDEwdk6Mw60vdLLrr5NHKZhMAOSrR2NZuQ+w==",
+      "license": "Apache-2.0",
+      "dependencies": {
+        "safe-buffer": "^5.0.1"
+      },
+      "engines": {
+        "node": "*"
+      }
+    },
+    "node_modules/tweetnacl": {
+      "version": "0.14.5",
+      "resolved": "https://registry.npmjs.org/tweetnacl/-/tweetnacl-0.14.5.tgz",
+      "integrity": "sha512-KXXFFdAbFXY4geFIwoyNK+f5Z1b7swfXABfL7HXCmoIWMKU3dmS26672A4EeQtDzLKy7SXmfBu51JolvEKwtGA==",
+      "license": "Unlicense"
+    },
+    "node_modules/typed-emitter": {
+      "version": "2.1.0",
+      "resolved": "https://registry.npmjs.org/typed-emitter/-/typed-emitter-2.1.0.tgz",
+      "integrity": "sha512-g/KzbYKbH5C2vPkaXGu8DJlHrGKHLsM25Zg9WuC9pMGfuvT+X25tZQWo5fK1BjBm8+UrVE9LDCvaY0CQk+fXDA==",
+      "license": "MIT",
+      "optionalDependencies": {
+        "rxjs": "*"
+      }
+    },
+    "node_modules/typescript": {
+      "version": "5.9.3",
+      "resolved": "https://registry.npmjs.org/typescript/-/typescript-5.9.3.tgz",
+      "integrity": "sha512-jl1vZzPDinLr9eUt3J/t7V6FgNEw9QjvBPdysz9KfQDD41fQrC2Y4vKQdiaUpFT4bXlb1RHhLpp8wtm6M5TgSw==",
+      "dev": true,
+      "license": "Apache-2.0",
+      "bin": {
+        "tsc": "bin/tsc",
+        "tsserver": "bin/tsserver"
+      },
+      "engines": {
+        "node": ">=14.17"
+      }
+    },
+    "node_modules/undici-types": {
+      "version": "5.28.4",
+      "resolved": "https://registry.npmjs.org/undici-types/-/undici-types-5.28.4.tgz",
+      "integrity": "sha512-3OeMF5Lyowe8VW0skf5qaIE7Or3yS9LS7fvMUI0gg4YxpIBVg0L8BxCmROw2CcYhSkpR68Epz7CGc8MPj94Uww==",
+      "license": "MIT"
+    },
+    "node_modules/uri-js": {
+      "version": "4.4.1",
+      "resolved": "https://registry.npmjs.org/uri-js/-/uri-js-4.4.1.tgz",
+      "integrity": "sha512-7rKUyy33Q1yc98pQ1DAmLtwX109F7TIfWlW1Ydo8Wl1ii1SeHieeh0HHfPeL2fMXK6z0s8ecKs9frCuLJvndBg==",
+      "license": "BSD-2-Clause",
+      "dependencies": {
+        "punycode": "^2.1.0"
+      }
+    },
+    "node_modules/utrie": {
+      "version": "1.0.2",
+      "resolved": "https://registry.npmjs.org/utrie/-/utrie-1.0.2.tgz",
+      "integrity": "sha512-1MLa5ouZiOmQzUbjbu9VmjLzn1QLXBhwpUa7kdLUQK+KQ5KA9I1vk5U4YHe/X2Ch7PYnJfWuWT+VbuxbGwljhw==",
+      "license": "MIT",
+      "optional": true,
+      "dependencies": {
+        "base64-arraybuffer": "^1.0.2"
+      }
+    },
+    "node_modules/uuid": {
+      "version": "3.4.0",
+      "resolved": "https://registry.npmjs.org/uuid/-/uuid-3.4.0.tgz",
+      "integrity": "sha512-HjSDRw6gZE5JMggctHBcjVak08+KEVhSIiDzFnT9S9aegmp85S/bReBVTb4QTFaRNptJ9kuYaNhnbNEOkbKb/A==",
+      "deprecated": "uuid@10 and below is no longer supported.  For ESM codebases, update to uuid@latest.  For CommonJS codebases, use uuid@11 (but be aware this version will likely be deprecated in 2028).",
+      "license": "MIT",
+      "bin": {
+        "uuid": "bin/uuid"
+      }
+    },
+    "node_modules/verror": {
+      "version": "1.10.1",
+      "resolved": "https://registry.npmjs.org/verror/-/verror-1.10.1.tgz",
+      "integrity": "sha512-veufcmxri4e3XSrT0xwfUR7kguIkaxBeosDg00yDWhk49wdwkSUrvvsm7nc75e1PUyvIeZj6nS8VQRYz2/S4Xg==",
+      "license": "MIT",
+      "dependencies": {
+        "assert-plus": "^1.0.0",
+        "core-util-is": "1.0.2",
+        "extsprintf": "^1.2.0"
+      },
+      "engines": {
+        "node": ">=0.6.0"
+      }
+    },
+    "node_modules/verror/node_modules/core-util-is": {
+      "version": "1.0.2",
+      "resolved": "https://registry.npmjs.org/core-util-is/-/core-util-is-1.0.2.tgz",
+      "integrity": "sha512-3lqz5YjWTYnW6dlDa5TLaTCcShfar1e40rmcJVwCBJC6mWlFuj0eCHIElmG1g5kyuJ/GD+8Wn4FFCcz4gJPfaQ==",
+      "license": "MIT"
+    },
+    "node_modules/webrtc-adapter": {
+      "version": "9.0.6",
+      "resolved": "https://registry.npmjs.org/webrtc-adapter/-/webrtc-adapter-9.0.6.tgz",
+      "integrity": "sha512-CHbl2ZQbxx164IgWRgzJno4hWtM4tFbRam1QfI3Yxhs3w/DvqluVxVWeXs3oL5/fbGkSNLKo0Ty5MgUWceNhog==",
+      "license": "BSD-3-Clause",
+      "dependencies": {
+        "sdp": "^3.2.0"
+      },
+      "engines": {
+        "node": ">=6.0.0",
+        "npm": ">=3.10.0"
+      }
+    },
+    "node_modules/webrtc-issue-detector": {
+      "version": "1.16.3",
+      "resolved": "https://registry.npmjs.org/webrtc-issue-detector/-/webrtc-issue-detector-1.16.3.tgz",
+      "integrity": "sha512-VDBeCa1ZfZaErynTfs/YgziSLtSXF9INXP6ciCtgBJI95pzT+CaRUvi1DmDFpyGuRvuox9CQCdjShl+qiIFfkw==",
+      "license": "MIT"
+    },
+    "node_modules/which": {
+      "version": "1.3.1",
+      "resolved": "https://registry.npmjs.org/which/-/which-1.3.1.tgz",
+      "integrity": "sha512-HxJdYWq1MTIQbJ3nw0cqssHoTNU267KlrDuGZ1WYlxDStUtKUhOaJmh112/TZmHxxUfuJqPXSOm7tDyas0OSIQ==",
+      "license": "ISC",
+      "dependencies": {
+        "isexe": "^2.0.0"
+      },
+      "bin": {
+        "which": "bin/which"
+      }
+    },
+    "node_modules/which-module": {
+      "version": "2.0.1",
+      "resolved": "https://registry.npmjs.org/which-module/-/which-module-2.0.1.tgz",
+      "integrity": "sha512-iBdZ57RDvnOR9AGBhML2vFZf7h8vmBjhoaZqODJBFWHVtKkDmKuHai3cx5PgVMrX5YDNp27AofYbAwctSS+vhQ==",
+      "license": "ISC"
+    },
+    "node_modules/wrap-ansi": {
+      "version": "2.1.0",
+      "resolved": "https://registry.npmjs.org/wrap-ansi/-/wrap-ansi-2.1.0.tgz",
+      "integrity": "sha512-vAaEaDM946gbNpH5pLVNR+vX2ht6n0Bt3GXwVB1AuAqZosOvHNF3P7wDnh8KLkSqgUh0uh77le7Owgoz+Z9XBw==",
+      "license": "MIT",
+      "dependencies": {
+        "string-width": "^1.0.1",
+        "strip-ansi": "^3.0.1"
+      },
+      "engines": {
+        "node": ">=0.10.0"
+      }
+    },
+    "node_modules/wrap-ansi/node_modules/ansi-regex": {
+      "version": "2.1.1",
+      "resolved": "https://registry.npmjs.org/ansi-regex/-/ansi-regex-2.1.1.tgz",
+      "integrity": "sha512-TIGnTpdo+E3+pCyAluZvtED5p5wCqLdezCyhPZzKPcxvFplEt4i+W7OONCKgeZFT3+y5NZZfOOS/Bdcanm1MYA==",
+      "license": "MIT",
+      "engines": {
+        "node": ">=0.10.0"
+      }
+    },
+    "node_modules/wrap-ansi/node_modules/is-fullwidth-code-point": {
+      "version": "1.0.0",
+      "resolved": "https://registry.npmjs.org/is-fullwidth-code-point/-/is-fullwidth-code-point-1.0.0.tgz",
+      "integrity": "sha512-1pqUqRjkhPJ9miNq9SwMfdvi6lBJcd6eFxvfaivQhaH3SgisfiuudvFntdKOmxuee/77l+FPjKrQjWvmPjWrRw==",
+      "license": "MIT",
+      "dependencies": {
+        "number-is-nan": "^1.0.0"
+      },
+      "engines": {
+        "node": ">=0.10.0"
+      }
+    },
+    "node_modules/wrap-ansi/node_modules/string-width": {
+      "version": "1.0.2",
+      "resolved": "https://registry.npmjs.org/string-width/-/string-width-1.0.2.tgz",
+      "integrity": "sha512-0XsVpQLnVCXHJfyEs8tC0zpTVIr5PKKsQtkT29IwupnPTjtPmQ3xT/4yCREF9hYkV/3M3kzcUTSAZT6a6h81tw==",
+      "license": "MIT",
+      "dependencies": {
+        "code-point-at": "^1.0.0",
+        "is-fullwidth-code-point": "^1.0.0",
+        "strip-ansi": "^3.0.0"
+      },
+      "engines": {
+        "node": ">=0.10.0"
+      }
+    },
+    "node_modules/wrap-ansi/node_modules/strip-ansi": {
+      "version": "3.0.1",
+      "resolved": "https://registry.npmjs.org/strip-ansi/-/strip-ansi-3.0.1.tgz",
+      "integrity": "sha512-VhumSSbBqDTP8p2ZLKj40UjBCV4+v8bUSEpUb4KjRgWk9pbqGF4REFj6KEagidb2f/M6AzC0EmFyDNGaw9OCzg==",
+      "license": "MIT",
+      "dependencies": {
+        "ansi-regex": "^2.0.0"
+      },
+      "engines": {
+        "node": ">=0.10.0"
+      }
+    },
+    "node_modules/wrappy": {
+      "version": "1.0.2",
+      "resolved": "https://registry.npmjs.org/wrappy/-/wrappy-1.0.2.tgz",
+      "integrity": "sha512-l4Sp/DRseor9wL6EvV2+TuQn63dMkPjZ/sp9XkghTEbV9KlPS1xUsZ3u7/IQO4wxtcFB4bgpQPRcR3QCvezPcQ==",
+      "license": "ISC"
+    },
+    "node_modules/y18n": {
+      "version": "4.0.3",
+      "resolved": "https://registry.npmjs.org/y18n/-/y18n-4.0.3.tgz",
+      "integrity": "sha512-JKhqTOwSrqNA1NY5lSztJ1GrBiUodLMmIZuLiDaMRJ+itFd+ABVE8XBjOvIWL+rSqNDC74LCSFmlb/U4UZ4hJQ==",
+      "license": "ISC"
+    },
+    "node_modules/yaml": {
+      "version": "1.10.3",
+      "resolved": "https://registry.npmjs.org/yaml/-/yaml-1.10.3.tgz",
+      "integrity": "sha512-vIYeF1u3CjlhAFekPPAk2h/Kv4T3mAkMox5OymRiJQB0spDP10LHvt+K7G9Ny6NuuMAb25/6n1qyUjAcGNf/AA==",
+      "license": "ISC",
+      "engines": {
+        "node": ">= 6"
+      }
+    },
+    "node_modules/yargs": {
+      "version": "12.0.5",
+      "resolved": "https://registry.npmjs.org/yargs/-/yargs-12.0.5.tgz",
+      "integrity": "sha512-Lhz8TLaYnxq/2ObqHDql8dX8CJi97oHxrjUcYtzKbbykPtVW9WB+poxI+NM2UIzsMgNCZTIf0AQwsjK5yMAqZw==",
+      "license": "MIT",
+      "dependencies": {
+        "cliui": "^4.0.0",
+        "decamelize": "^1.2.0",
+        "find-up": "^3.0.0",
+        "get-caller-file": "^1.0.1",
+        "os-locale": "^3.0.0",
+        "require-directory": "^2.1.1",
+        "require-main-filename": "^1.0.1",
+        "set-blocking": "^2.0.0",
+        "string-width": "^2.0.0",
+        "which-module": "^2.0.0",
+        "y18n": "^3.2.1 || ^4.0.0",
+        "yargs-parser": "^11.1.1"
+      }
+    },
+    "node_modules/yargs-parser": {
+      "version": "11.1.1",
+      "resolved": "https://registry.npmjs.org/yargs-parser/-/yargs-parser-11.1.1.tgz",
+      "integrity": "sha512-C6kB/WJDiaxONLJQnF8ccx9SEeoTTLek8RVbaOIsrAUS8VrBEXfmeSnCZxygc+XC2sNMBIwOOnfcxiynjHsVSQ==",
+      "license": "ISC",
+      "dependencies": {
+        "camelcase": "^5.0.0",
+        "decamelize": "^1.2.0"
+      }
+    }
+  }
+}
```

### lib/reports/render-interview-report.ts

```diff
--- before/lib/reports/render-interview-report.ts
+++ after/lib/reports/render-interview-report.ts
@@ -1,11 +1,13 @@
 import 'server-only'
 import { join } from 'node:path'
-import { Font, renderToBuffer } from '@react-pdf/renderer'
+import { readFileSync } from 'node:fs'
+import { jsPDF } from 'jspdf'
 import type { InterviewDetail } from '@/lib/interviews/read-owned-interview'
 import type { AppLanguage } from '@/types/auth'
-import { InterviewReportDocument } from './interview-report-document'
+import { buildInterviewReport } from './interview-report-document'

-let fontsRegistered = false
+// Cache immutable bytes only; every document owns its font registration/subsets.
+let fonts: readonly string[] | undefined

 export function reportFilename(interview: Pick<InterviewDetail, 'id' | 'createdAt'>) {
   if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(interview.id)) {
@@ -15,20 +17,20 @@
 }

 export async function renderInterviewReport(interview: InterviewDetail, language: AppLanguage): Promise<Buffer> {
-  // PDF-only checks do not tighten the existing JSON detail contract.
   reportFilename(interview)
   if (!Number.isInteger(interview.score) || interview.score < 0 || interview.score > 100 ||
       !Number.isInteger(interview.durationSeconds) || interview.durationSeconds < 0) {
     throw new Error('Invalid persisted report numbers')
   }
-  if (!fontsRegistered) {
-    Font.register({ family: 'Inter', fonts: [
-      { src: join(process.cwd(), 'assets/fonts/Inter-Regular.ttf'), fontWeight: 400 },
-      { src: join(process.cwd(), 'assets/fonts/Inter-SemiBold.ttf'), fontWeight: 600 },
-    ] })
-    // Do not apply English word hyphenation to saved Turkish/German text.
-    Font.registerHyphenationCallback(word => [word])
-    fontsRegistered = true
-  }
-  return renderToBuffer(InterviewReportDocument({ interview, language }))
+  if (!['tr', 'en', 'de'].includes(language)) throw new Error('Invalid report language')
+  fonts ??= ['Inter-Regular.ttf', 'Inter-SemiBold.ttf'].map(file =>
+    readFileSync(join(process.cwd(), 'assets/fonts', file)).toString('base64'))
+  const doc = new jsPDF({ unit: 'pt', format: 'a4', putOnlyUsedFonts: true, compress: true })
+  fonts.forEach((data, index) => {
+    const file = index === 0 ? 'Inter-Regular.ttf' : 'Inter-SemiBold.ttf'
+    doc.addFileToVFS(file, data)
+    doc.addFont(file, 'Inter', 'normal', index === 0 ? 400 : 600)
+  })
+  buildInterviewReport(doc, interview, language)
+  return Buffer.from(doc.output('arraybuffer'))
 }
```

### lib/reports/interview-report-styles.ts

```diff
--- before/lib/reports/interview-report-styles.ts
+++ after/lib/reports/interview-report-styles.ts
@@ -1,9 +1,8 @@
 import 'server-only'
 import { readFileSync } from 'node:fs'
 import { join } from 'node:path'
-import { StyleSheet } from '@react-pdf/renderer'

-// Read the approved source, never maintain a second palette. CSS px -> PDF pt.
+// Approved CSS tokens are the sole design source. rem -> PDF pt.
 export function reportStyles() {
   const css = readFileSync(join(process.cwd(), 'styles/talentry-tokens.css'), 'utf8')
   function token(name: string): string {
@@ -16,20 +15,14 @@
     if (!/^\d+(\.\d+)?rem$/.test(value)) throw new Error('Invalid report dimension token')
     return parseFloat(value) * 12
   }
-  return StyleSheet.create({
-    page: { fontFamily: 'Inter', fontSize: points('font-size-sm'), color: token('color-text'),
-      backgroundColor: token('color-surface'), padding: points('space-12'), paddingBottom: points('space-16'),
-      lineHeight: Number(token('line-height-normal')) },
-    brand: { color: token('color-primary'), fontWeight: 600, marginBottom: points('space-2') },
-    title: { fontSize: points('font-size-2xl'), fontWeight: 600, color: token('color-navy'), marginBottom: points('space-4') },
-    reference: { fontSize: points('font-size-xs'), color: token('color-text-secondary'), marginBottom: points('space-5') },
-    heading: { fontSize: points('font-size-lg'), fontWeight: 600, color: token('color-navy'),
-      marginTop: points('space-5'), marginBottom: points('space-3') },
-    score: { fontSize: points('font-size-3xl'), fontWeight: 600, color: token('color-navy'),
-      backgroundColor: token('color-surface-lavender'), padding: points('space-4') },
-    label: { fontWeight: 600, color: token('color-text-secondary'), marginTop: points('space-3') },
-    text: { marginBottom: points('space-2') },
-    footer: { position: 'absolute', bottom: points('space-6'), left: points('space-12'), right: points('space-12'),
-      textAlign: 'center', fontSize: points('font-size-xs'), color: token('color-text-secondary') },
-  })
+  const lineHeight = Number(token('line-height-normal'))
+  if (!Number.isFinite(lineHeight) || lineHeight < 1) throw new Error('Invalid report line height')
+  return {
+    margin: points('space-12'), footerReserve: points('space-16'), footerBottom: points('space-6'),
+    body: points('font-size-sm'), small: points('font-size-xs'), title: points('font-size-2xl'),
+    heading: points('font-size-lg'), score: points('font-size-3xl'), lineHeight,
+    gap: points('space-2'), labelGap: points('space-3'), sectionGap: points('space-5'),
+    text: token('color-text'), secondary: token('color-text-secondary'),
+    navy: token('color-navy'), primary: token('color-primary'),
+  }
 }
```

### lib/reports/interview-report-document.tsx

```diff
--- before/lib/reports/interview-report-document.tsx
+++ after/lib/reports/interview-report-document.tsx
@@ -1,46 +0,0 @@
-import 'server-only'
-import { Document, Page, Text } from '@react-pdf/renderer'
-import type { InterviewDetail } from '@/lib/interviews/read-owned-interview'
-import type { AppLanguage } from '@/types/auth'
-import { RESULT_COPY } from '@/components/result/result-copy'
-import { reportStyles } from './interview-report-styles'
-
-export function InterviewReportDocument({ interview, language }: { interview: InterviewDetail; language: AppLanguage }) {
-  const copy = RESULT_COPY[language]
-  const styles = reportStyles()
-  const value = (text: string) => text.trim() ? text : copy.notProvided
-  const date = new Date(interview.createdAt).toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC')
-  const duration = `${Math.floor(interview.durationSeconds / 60)}:${String(interview.durationSeconds % 60).padStart(2, '0')}`
-  // Metadata VALUES remain exactly as persisted; only their labels are localized.
-  const metadata = [
-    [copy.date, date], [copy.role, interview.role], [copy.company, interview.company],
-    [copy.level, interview.level], [copy.interviewType, interview.interviewType],
-    [copy.language, interview.language], [copy.persona, interview.persona], [copy.duration, duration],
-  ]
-  return (
-    <Document title={`Talentry - ${copy.pdf.title}`} author="Talentry" language={language}>
-      <Page size="A4" style={styles.page} wrap>
-        <Text style={styles.brand}>Talentry</Text>
-        <Text style={styles.title}>{copy.pdf.title}</Text>
-        <Text style={styles.reference}>{copy.pdf.reference}: {interview.id}</Text>
-        <Text style={styles.heading} minPresenceAhead={40}>{copy.score}</Text>
-        <Text style={styles.score}>{interview.score} / 100</Text>
-        <Text style={styles.heading} minPresenceAhead={24}>{copy.summary}</Text>
-        <Text style={styles.text}>{interview.summary.trim() ? interview.summary : copy.emptySummary}</Text>
-        <Text style={styles.heading} minPresenceAhead={24}>{copy.details}</Text>
-        {metadata.map(([label, text]) => (
-          <Text key={label} style={styles.text}><Text style={styles.label}>{label}: </Text>{value(text)}</Text>
-        ))}
-        <Text style={styles.heading} minPresenceAhead={32}>{copy.transcript}</Text>
-        {interview.answers.length === 0 && <Text>{copy.emptyAnswers}</Text>}
-        {interview.answers.map((answer, index) => [
-          <Text key={`q-label-${index}`} style={styles.label} minPresenceAhead={24}>{copy.question} {index + 1}</Text>,
-          <Text key={`q-${index}`} style={styles.text}>{value(answer.q)}</Text>,
-          <Text key={`a-label-${index}`} style={styles.label} minPresenceAhead={24}>{copy.answer}</Text>,
-          <Text key={`a-${index}`} style={styles.text}>{value(answer.a)}</Text>,
-        ])}
-        <Text fixed style={styles.footer} render={({ pageNumber, totalPages }) => `${copy.pdf.page} ${pageNumber} / ${totalPages}`} />
-      </Page>
-    </Document>
-  )
-}
```

### lib/reports/interview-report-document.ts

```diff
--- before/lib/reports/interview-report-document.ts
+++ after/lib/reports/interview-report-document.ts
@@ -0,0 +1,48 @@
+import 'server-only'
+import type { jsPDF } from 'jspdf'
+import type { InterviewDetail } from '@/lib/interviews/read-owned-interview'
+import type { AppLanguage } from '@/types/auth'
+import { RESULT_COPY } from '@/components/result/result-copy'
+import { reportStyles } from './interview-report-styles'
+import { reportFlow } from './interview-report-flow'
+
+export function buildInterviewReport(doc: jsPDF, interview: InterviewDetail, language: AppLanguage) {
+  const copy = RESULT_COPY[language]
+  const style = reportStyles()
+  const flow = reportFlow(doc, style)
+  const value = (text: string) => text.trim() ? text : copy.notProvided
+  const heading = (text: string) => {
+    flow.gap(style.sectionGap)
+    flow.text(text, { size: style.heading, weight: 600, color: style.navy, keepNext: true })
+  }
+  const label = (text: string) => {
+    flow.gap(style.labelGap)
+    flow.text(text, { weight: 600, color: style.secondary, after: 0, keepNext: true })
+  }
+  const date = new Date(interview.createdAt).toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC')
+  const duration = `${Math.floor(interview.durationSeconds / 60)}:${String(interview.durationSeconds % 60).padStart(2, '0')}`
+  doc.setProperties({ title: `Talentry - ${copy.pdf.title}`, author: 'Talentry' })
+  doc.setLanguage(language)
+  flow.text('Talentry', { weight: 600, color: style.primary })
+  flow.text(copy.pdf.title, { size: style.title, weight: 600, color: style.navy })
+  flow.text(`${copy.pdf.reference}: ${interview.id}`, { size: style.small, color: style.secondary })
+  heading(copy.score)
+  flow.text(`${interview.score} / 100`, { size: style.score, weight: 600, color: style.navy })
+  heading(copy.summary)
+  flow.text(interview.summary.trim() ? interview.summary : copy.emptySummary)
+  heading(copy.details)
+  for (const [name, text] of [
+    [copy.date, date], [copy.role, interview.role], [copy.company, interview.company],
+    [copy.level, interview.level], [copy.interviewType, interview.interviewType],
+    [copy.language, interview.language], [copy.persona, interview.persona], [copy.duration, duration],
+  ]) flow.text(`${name}: ${value(text)}`)
+  heading(copy.transcript)
+  if (interview.answers.length === 0) flow.text(copy.emptyAnswers)
+  interview.answers.forEach((answer, index) => {
+    label(`${copy.question} ${index + 1}`)
+    flow.text(value(answer.q))
+    label(copy.answer)
+    flow.text(value(answer.a))
+  })
+  flow.footer(copy.pdf.page)
+}
```

### lib/reports/interview-report-flow.ts

```diff
--- before/lib/reports/interview-report-flow.ts
+++ after/lib/reports/interview-report-flow.ts
@@ -0,0 +1,44 @@
+import 'server-only'
+import type { jsPDF } from 'jspdf'
+import type { reportStyles } from './interview-report-styles'
+
+type Layout = ReturnType<typeof reportStyles>
+type TextOptions = { size?: number; weight?: 400 | 600; color?: string; after?: number; keepNext?: boolean }
+
+export function reportFlow(doc: jsPDF, layout: Layout) {
+  const width = doc.getPageWidth() - 2 * layout.margin
+  const bottom = doc.getPageHeight() - layout.footerReserve
+  let y = layout.margin
+  function ensure(height: number) {
+    if (y + height > bottom) { doc.addPage(); y = layout.margin }
+  }
+  return {
+    gap(amount = layout.gap) { y += amount },
+    text(value: string, options: TextOptions = {}) {
+      const size = options.size ?? layout.body
+      const height = size * layout.lineHeight
+      doc.setFont('Inter', 'normal', options.weight ?? 400)
+      doc.setFontSize(size)
+      doc.setTextColor(options.color ?? layout.text)
+      const lines: string[] = doc.splitTextToSize(value, width)
+      if (options.keepNext) ensure(height + (options.after ?? layout.gap) + layout.body * layout.lineHeight)
+      for (const line of lines) {
+        ensure(height)
+        doc.text(line, layout.margin, y + size)
+        y += height
+      }
+      y += options.after ?? layout.gap
+    },
+    footer(label: string) {
+      const total = doc.getNumberOfPages()
+      for (let page = 1; page <= total; page++) {
+        doc.setPage(page)
+        doc.setFont('Inter', 'normal', 400)
+        doc.setFontSize(layout.small)
+        doc.setTextColor(layout.secondary)
+        doc.text(`${label} ${page} / ${total}`, doc.getPageWidth() / 2,
+          doc.getPageHeight() - layout.footerBottom, { align: 'center' })
+      }
+    },
+  }
+}
```

### lib/reports/interview-report.test.cjs

```diff
--- before/lib/reports/interview-report.test.cjs
+++ after/lib/reports/interview-report.test.cjs
@@ -9,7 +9,7 @@
 const ts = require('typescript')
 const { NextResponse } = require('next/server')
 const root = path.resolve(__dirname, '../..')
-let renderer, render, filename, fontkit
+let render, filename
 const id = '11111111-1111-4111-8111-111111111111'
 const fixture = Object.freeze({ id, owner_id: 'SECRET_OWNER_UUID', interviewerKey: 'SECRET_INTERVIEWER_KEY',
   role: 'Persisted Engineer', company: 'Saved Company', level: 'senior', interviewType: 'technical',
@@ -28,7 +28,6 @@
       require(name) {
         if (Object.hasOwn(overrides, name)) return overrides[name]
         if (name === 'server-only') return {}
-        if (name === '@react-pdf/renderer') return renderer
         if (name === 'next/server') return { NextResponse }
         if (name.startsWith('@/') || name.startsWith('.')) {
           const base = name.startsWith('@/') ? path.join(root, name.slice(2)) : path.resolve(path.dirname(file), name)
@@ -37,7 +36,7 @@
           assert.ok(!target.includes(`${path.sep}supabase${path.sep}`), 'No real database imports allowed')
           return load(target)
         }
-        assert.ok(['react', 'react/jsx-runtime', 'node:fs', 'node:path'].includes(name), `Unexpected dependency ${name}`)
+        assert.ok(['jspdf', 'node:fs', 'node:path'].includes(name), `Unexpected dependency ${name}`)
         return require(name)
       },
     }
@@ -48,19 +47,17 @@
   return file => load(path.join(root, file))
 }
 before(async () => {
-  renderer = await import('@react-pdf/renderer')
-  fontkit = await import('fontkit')
   const module = loader()('lib/reports/render-interview-report.ts')
   render = module.renderInterviewReport; filename = module.reportFilename
 })
 function inspect(buffer) {
   const python = process.env.REPORT_PDF_PYTHON || 'python'
-  const result = spawnSync(python, ['-c',
-    'import sys,io,json; from pypdf import PdfReader; r=PdfReader(io.BytesIO(sys.stdin.buffer.read())); print(json.dumps({"pages":[p.extract_text() for p in r.pages]},ensure_ascii=True))'],
-  { input: buffer, maxBuffer: 16 * 1024 * 1024 })
+  const result = spawnSync(python, ['-I', '-B', path.join(__dirname, 'inspect-report-pdf.py')],
+    { input: buffer, maxBuffer: 16 * 1024 * 1024 })
   assert.ifError(result.error)
   assert.equal(result.status, 0, result.stderr?.toString())
   const parsed = JSON.parse(result.stdout.toString())
+  assert.deepEqual(parsed.mappingErrors, [], 'Every used CID must map to nonempty Unicode')
   return { pages: parsed.pages, text: parsed.pages.join('\n') }
 }
 const compact = value => value.replace(/\s+/g, '')
@@ -90,18 +87,26 @@
   pages.forEach((page, index) => assert.ok(compact(page).includes(`Page${index + 1}/${pages.length}`)))
   if (process.env.REPORT_PDF_QA_DIR) { fs.mkdirSync(process.env.REPORT_PDF_QA_DIR, { recursive: true }); fs.writeFileSync(path.join(process.env.REPORT_PDF_QA_DIR, 'report.pdf'), bytes) }
 })
-test('static font files cover required Turkish/German glyphs in both weights', () => {
-  for (const name of ['Inter-Regular.ttf', 'Inter-SemiBold.ttf']) {
-    const font = fontkit.openSync(path.join(root, 'assets/fonts', name))
-    for (const character of 'ÇĞİÖŞÜçğıöşüÄÖÜäöüßẞ') assert.ok(font.hasGlyphForCodePoint(character.codePointAt(0)), `${name}: ${character}`)
-  }
-})
+test('both static font weights preserve exact required glyphs through actual encoding', () => {
+  const { jsPDF } = require('jspdf')
+  const sample = 'ÇĞİÖŞÜ çğıöşü ÄÖÜ äöü ß ẞ'
+  for (const [name, weight] of [['Inter-Regular.ttf', 400], ['Inter-SemiBold.ttf', 600]]) {
+    const doc = new jsPDF({ putOnlyUsedFonts: true })
+    doc.addFileToVFS(name, fs.readFileSync(path.join(root, 'assets/fonts', name)).toString('base64'))
+    doc.addFont(name, 'Inter', 'normal', weight); doc.setFont('Inter', 'normal', weight)
+    doc.text(sample, 15, 20)
+    assert.equal(inspect(Buffer.from(doc.output('arraybuffer'))).text, sample)
+  }
+})
+
 test('Turkish and German survive actual PDF encoding; labels do not translate stored values', async () => {
   const text = 'ÇĞİÖŞÜ çğıöşü ÄÖÜ äöü ß ẞ'
   for (const language of ['tr', 'de']) {
     const report = { ...fixture, summary: text, role: text, answers: [{ q: text, a: text }] }
     const bytes = await render(report, language)
-    const extracted = compact(inspect(bytes).text)
+    const decoded = inspect(bytes).text
+    assert.ok(decoded.split('\n').includes(text), 'Exact Unicode line')
+    const extracted = compact(decoded)
     assert.ok(extracted.includes(compact(text)))
     assert.ok(extracted.includes('senior')); assert.ok(extracted.includes('formal'))
     assert.ok(extracted.includes(language === 'tr' ? 'MülakatRaporu' : 'Interviewbericht'))
@@ -114,6 +119,8 @@
   const bytes = await render({ ...fixture, answers }, 'en')
   const { text, pages } = inspect(bytes)
   assert.ok(pages.length >= 4)
+  assert.deepEqual([...text.matchAll(/PARAGRAPH_(\d{3})/g)].map(match => match[1]), Array.from({ length: 140 }, (_, i) => String(i).padStart(3, '0')))
+  pages.forEach((page, index) => assert.ok(compact(page).includes(`Page${index + 1}/${pages.length}`)))
   const extracted = compact(text)
   let position = -1
   for (const value of ['LONG_QUESTION', ...paragraphs, ...answers.slice(1).flatMap(({ q, a }) => [q, a])]) {
@@ -181,3 +188,47 @@
   assert.equal(response.status, 500); assert.deepEqual(await response.json(), { error: 'Failed to generate PDF' })
   assert.equal(response.headers.get('Content-Disposition'), null)
 })
+
+test('ten alternating reports preserve Unicode, sequences, full long content and input', async t => {
+  const sample = 'ÇĞİÖŞÜ çğıöşü ÄÖÜ äöü ß ẞ'
+  const paragraphs = Array.from({ length: 140 }, (_, i) => 'PARAGRAPH_' + String(i).padStart(3, '0') + ' Saved interview answer with Turkish ş and German ü.')
+  const longAnswers = [{ q: 'LONG_QUESTION', a: paragraphs.join('\n') }, ...Array.from({ length: 12 }, (_, i) => ({ q: 'QUESTION_' + i, a: 'ANSWER_' + i }))]
+  const seen = new Map(), measurements = [], snapshot = JSON.stringify(fixture)
+  const previousFetch = global.fetch
+  global.fetch = () => { throw new Error('Unexpected provider call') }
+  try {
+    for (let i = 0; i < 10; i++) {
+      const long = i % 2 === 1, reversed = Math.floor(i / 2) % 2 === 1
+      const sequence = reversed ? ['G', 'Ğ', 'ı', 'i'] : ['Ğ', 'G', 'i', 'ı']
+      const report = { ...fixture, summary: sample + '\n' + sequence.join('\n'), answers: long ? longAnswers : fixture.answers }
+      const before = process.memoryUsage().rss, start = performance.now()
+      const bytes = await render(report, 'en'), ms = performance.now() - start, after = process.memoryUsage().rss
+      const { text, pages } = inspect(bytes)
+      assert.equal(bytes.subarray(0, 5).toString(), '%PDF-'); assert.match(bytes.subarray(-30).toString(), /%%EOF/)
+      assert.ok(text.includes(sample + '\n' + sequence.join('\n')))
+      if (long) {
+        assert.ok(pages.length > 1)
+        let cursor = -1
+        for (const value of longAnswers.flatMap(({ q, a }) => [q, a])) {
+          const next = compact(text).indexOf(compact(value), cursor + 1)
+          assert.ok(next > cursor, 'Sequential long content complete and ordered'); cursor = next
+        }
+      }
+      pages.forEach((page, index) => assert.ok(compact(page).includes('Page' + (index + 1) + '/' + pages.length)))
+      const key = long + ':' + reversed
+      if (seen.has(key)) assert.equal(text, seen.get(key))
+      seen.set(key, text)
+      assert.equal(JSON.stringify(fixture), snapshot)
+      measurements.push({ index: i + 1, long, ms, bytes: bytes.length, pages: pages.length, rssBefore: before, rssAfter: after })
+      if (process.env.REPORT_PDF_QA_DIR) fs.writeFileSync(path.join(process.env.REPORT_PDF_QA_DIR, 'sequence-' + (i + 1) + '.pdf'), bytes)
+    }
+  } finally { global.fetch = previousFetch }
+  t.diagnostic(JSON.stringify({ measurements, maxRSSKiB: process.resourceUsage().maxRSS }))
+  if (process.env.REPORT_PDF_QA_DIR) fs.writeFileSync(path.join(process.env.REPORT_PDF_QA_DIR, 'measurements.json'), JSON.stringify(measurements, null, 2))
+})
+
+test('renderer rejects invalid language and invalid persisted numbers safely', async () => {
+  await assert.rejects(render(fixture, 'fr'), /Invalid report language/)
+  await assert.rejects(render({ ...fixture, score: 101 }, 'en'), /Invalid persisted report numbers/)
+  await assert.rejects(render({ ...fixture, durationSeconds: -1 }, 'en'), /Invalid persisted report numbers/)
+})
```

### lib/reports/inspect-report-pdf.py

```diff
--- before/lib/reports/inspect-report-pdf.py
+++ after/lib/reports/inspect-report-pdf.py
@@ -0,0 +1,41 @@
+"""Diagnostic-only pypdf inspector. No production parser dependency."""
+import io, json, re, sys
+from pypdf import PdfReader
+from pypdf.generic import ContentStream, ByteStringObject, TextStringObject
+reader = PdfReader(io.BytesIO(sys.stdin.buffer.read()))
+errors = []
+for page in reader.pages:
+    mappings = {}
+    for key, ref in page['/Resources']['/Font'].items():
+        font = ref.get_object()
+        if '/ToUnicode' not in font:
+            errors.append('Missing ToUnicode: ' + key)
+            continue
+        cmap = font['/ToUnicode'].get_data().decode('latin1')
+        entries = {}
+        for block in re.findall(r'beginbfchar(.*?)endbfchar', cmap, re.S):
+            for source, target in re.findall(r'<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]*)>', block):
+                entries[int(source, 16)] = target
+        if any(not target for target in entries.values()):
+            errors.append('Empty Unicode destination: ' + key)
+        mappings[key] = entries
+    active = None
+    for args, op in ContentStream(page.get_contents(), reader).operations:
+        if op == b'Tf':
+            active = args[0]
+        if op not in (b'Tj', b'TJ'):
+            continue
+        for value in (args[0] if op == b'TJ' else [args[0]]):
+            if isinstance(value, ByteStringObject):
+                raw = bytes(value)
+            elif isinstance(value, TextStringObject):
+                raw = value.original_bytes
+            else:
+                continue
+            if len(raw) % 2:
+                errors.append('Invalid CID byte length')
+            for offset in range(0, len(raw), 2):
+                cid = int.from_bytes(raw[offset:offset+2], 'big')
+                if not mappings.get(active, {}).get(cid):
+                    errors.append('Unmapped used CID: ' + str(cid))
+print(json.dumps({'pages': [page.extract_text() for page in reader.pages], 'mappingErrors': sorted(set(errors))}))
```

### docs/02_Decisions/ADR-003-jspdf-interview-pdf-export.md

```diff
--- before/docs/02_Decisions/ADR-003-jspdf-interview-pdf-export.md
+++ after/docs/02_Decisions/ADR-003-jspdf-interview-pdf-export.md
@@ -0,0 +1,23 @@
+# ADR-003: jsPDF for persisted interview PDF export
+
+- Status: Architecture approved by user; implementation partial, validation blocked.
+- Date: 2026-10-01
+- Supersedes: ADR-002-interview-pdf-export.md (preserved as historical evidence).
+- Related sprint: REPORT_EXPORT_01; corrective implementation REPORT_EXPORT_01_JSPDF_MIGRATION.
+
+## Context
+The initial React-PDF implementation was partial and unaccepted. Diagnosis established empty ToUnicode mappings associated with fontkit glyph caching, including Turkish dotless i and composite/base sequences. Visual glyph rendering did not establish searchable/copyable fidelity. Numeric inherited line-height also caused inflated spacing and unacceptable pagination; that layout issue was independently repairable, but no maintainable documented Unicode repair was established.
+
+The accepted isolated jsPDF 4.2.1 spike rendered 16 PDFs in one Node process, including ten alternating glyph/long reports. Inter Regular/SemiBold preserved exact Turkish/German text and nonempty used-glyph mappings. Long fixtures produced five A4 pages with complete ordered content and visual acceptance. No patches, hidden text, cache warming or internal mutation were needed. This is historical spike evidence, not proof that repository integration has passed.
+
+## Decision
+Use exact jspdf 4.2.1 with Node direct-text APIs, local Inter 4.1 static Regular 400/SemiBold 600 fonts and per-document VFS registration. Cache only immutable font bytes. Own wrapping, vertical flow and footer reservation in application code. Keep Node-first Next.js deployment and the existing authenticated owner-scoped read as the security boundary. Render only allowlisted persisted report data with localized labels; never translate saved values. No Python production runtime, DOM, canvas, headless browser, schema change, new AI call, database write or PDF storage.
+
+## Alternatives considered
+React-PDF rejected after validation; fpdf2 remains out-of-scope Plan B because it adds runtime/deployment responsibilities. No additional renderer is introduced.
+
+## Consequences and risks
+Explicit pagination is maintained by this application. Local fonts and token CSS require deployment tracing. Actual deployed packaging/resources and browser download/search/copy remain acceptance gates. Current migration passed owner tests 8/8 and PDF tests 12/13, then stopped. The new sequential long-answer assertion failed; a footer interrupting a contiguous extraction search is suspected but unconfirmed. The ten-document integration sequence, TypeScript and production build are not accepted.
+
+## Rollback approach
+Do not reset or discard the pre-existing owner/API/UI work. Any rollback needs explicit authorization; returning to rejected React-PDF would not create an accepted production renderer. Preserve initial reports and this decision history.
```

### docs/01_Engineering/Sprint_REPORT_EXPORT_01_JSPDF_MIGRATION_Summary.md

```diff
--- before/docs/01_Engineering/Sprint_REPORT_EXPORT_01_JSPDF_MIGRATION_Summary.md
+++ after/docs/01_Engineering/Sprint_REPORT_EXPORT_01_JSPDF_MIGRATION_Summary.md
@@ -0,0 +1,13 @@
+# Sprint REPORT_EXPORT_01_JSPDF_MIGRATION Summary
+
+- Title: Migrate partial PDF rendering to jsPDF 4.2.1.
+- Branch: feature/auth-foundation; HEAD and remote-tracking base b08f446.
+- Status: PARTIAL / BLOCKED at required PDF validation; awaiting review.
+- Goal: Replace rejected React-PDF internals while preserving owner/API/UI contracts.
+- Created files: lib/reports/interview-report-document.ts; lib/reports/interview-report-flow.ts; lib/reports/inspect-report-pdf.py; ADR-003-jspdf-interview-pdf-export.md; this Summary and companion Engineering Report.
+- Modified files: package.json; package-lock.json; lib/reports/render-interview-report.ts; lib/reports/interview-report-styles.ts; lib/reports/interview-report.test.cjs.
+- Removed file: lib/reports/interview-report-document.tsx (replaced by direct-text .ts builder).
+- Validation: owner-reader 8/8 PASS; PDF 12/13 PASS, exit 1. Failure: Sequential long content complete and ordered, interview-report.test.cjs:214. Remaining ordered checks NOT RUN under explicit stop instruction.
+- Risks/problems: suspected footer interruption of whole-answer extraction assertion, unconfirmed; sequential integration not accepted; no production build or post-build visual acceptance; resource diagnostic did not finish.
+- Preserved: owner-reader/detail/PDF routes, UI/copy/styles, Inter fonts/license, token CSS, next.config.js and historical reports/ADR-002; verified against pre-migration content hashes.
+- Approval: renderer choice approved; implementation acceptance NOT approved. No Git mutations, browser acceptance, Project Memory closure or next sprint.
```

### git diff --stat

```text
 app/api/interviews/[id]/route.ts    | 151 ++------------------------
 app/result/result.module.css        |  19 ++++
 components/result/ResultContent.tsx |   2 +
 components/result/result-copy.ts    |   4 +
 next.config.js                      |   8 +-
 package-lock.json                   | 208 ++++++++++++++++++++++++++++++++++++
 package.json                        |   1 +
 7 files changed, 252 insertions(+), 141 deletions(-)
```

### git status --short

```text
 M app/api/interviews/[id]/route.ts
 M app/result/result.module.css
 M components/result/ResultContent.tsx
 M components/result/result-copy.ts
 M next.config.js
 M package-lock.json
 M package.json
?? app/api/interviews/[id]/pdf/
?? assets/
?? components/result/ResultPdfDownload.tsx
?? docs/01_Engineering/Sprint_REPORT_EXPORT_01_Engineering_Report.md
?? docs/01_Engineering/Sprint_REPORT_EXPORT_01_JSPDF_MIGRATION_Engineering_Report.md
?? docs/01_Engineering/Sprint_REPORT_EXPORT_01_JSPDF_MIGRATION_Summary.md
?? docs/01_Engineering/Sprint_REPORT_EXPORT_01_Summary.md
?? docs/02_Decisions/ADR-002-interview-pdf-export.md
?? docs/02_Decisions/ADR-003-jspdf-interview-pdf-export.md
?? lib/interviews/read-owned-interview.test.cjs
?? lib/interviews/read-owned-interview.ts
?? lib/reports/
```


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

## Final correction file diffs (supersede earlier versions)

### lib/reports/interview-report.test.cjs

```diff
--- pre-migration/lib/reports/interview-report.test.cjs
+++ final/lib/reports/interview-report.test.cjs
@@ -9,7 +9,7 @@
 const ts = require('typescript')
 const { NextResponse } = require('next/server')
 const root = path.resolve(__dirname, '../..')
-let renderer, render, filename, fontkit
+let render, filename
 const id = '11111111-1111-4111-8111-111111111111'
 const fixture = Object.freeze({ id, owner_id: 'SECRET_OWNER_UUID', interviewerKey: 'SECRET_INTERVIEWER_KEY',
   role: 'Persisted Engineer', company: 'Saved Company', level: 'senior', interviewType: 'technical',
@@ -28,7 +28,6 @@
       require(name) {
         if (Object.hasOwn(overrides, name)) return overrides[name]
         if (name === 'server-only') return {}
-        if (name === '@react-pdf/renderer') return renderer
         if (name === 'next/server') return { NextResponse }
         if (name.startsWith('@/') || name.startsWith('.')) {
           const base = name.startsWith('@/') ? path.join(root, name.slice(2)) : path.resolve(path.dirname(file), name)
@@ -37,7 +36,7 @@
           assert.ok(!target.includes(`${path.sep}supabase${path.sep}`), 'No real database imports allowed')
           return load(target)
         }
-        assert.ok(['react', 'react/jsx-runtime', 'node:fs', 'node:path'].includes(name), `Unexpected dependency ${name}`)
+        assert.ok(['jspdf', 'node:fs', 'node:path'].includes(name), `Unexpected dependency ${name}`)
         return require(name)
       },
     }
@@ -48,19 +47,17 @@
   return file => load(path.join(root, file))
 }
 before(async () => {
-  renderer = await import('@react-pdf/renderer')
-  fontkit = await import('fontkit')
   const module = loader()('lib/reports/render-interview-report.ts')
   render = module.renderInterviewReport; filename = module.reportFilename
 })
 function inspect(buffer) {
   const python = process.env.REPORT_PDF_PYTHON || 'python'
-  const result = spawnSync(python, ['-c',
-    'import sys,io,json; from pypdf import PdfReader; r=PdfReader(io.BytesIO(sys.stdin.buffer.read())); print(json.dumps({"pages":[p.extract_text() for p in r.pages]},ensure_ascii=True))'],
-  { input: buffer, maxBuffer: 16 * 1024 * 1024 })
+  const result = spawnSync(python, ['-I', '-B', path.join(__dirname, 'inspect-report-pdf.py')],
+    { input: buffer, maxBuffer: 16 * 1024 * 1024 })
   assert.ifError(result.error)
   assert.equal(result.status, 0, result.stderr?.toString())
   const parsed = JSON.parse(result.stdout.toString())
+  assert.deepEqual(parsed.mappingErrors, [], 'Every used CID must map to nonempty Unicode')
   return { pages: parsed.pages, text: parsed.pages.join('\n') }
 }
 const compact = value => value.replace(/\s+/g, '')
@@ -90,18 +87,26 @@
   pages.forEach((page, index) => assert.ok(compact(page).includes(`Page${index + 1}/${pages.length}`)))
   if (process.env.REPORT_PDF_QA_DIR) { fs.mkdirSync(process.env.REPORT_PDF_QA_DIR, { recursive: true }); fs.writeFileSync(path.join(process.env.REPORT_PDF_QA_DIR, 'report.pdf'), bytes) }
 })
-test('static font files cover required Turkish/German glyphs in both weights', () => {
-  for (const name of ['Inter-Regular.ttf', 'Inter-SemiBold.ttf']) {
-    const font = fontkit.openSync(path.join(root, 'assets/fonts', name))
-    for (const character of 'ÇĞİÖŞÜçğıöşüÄÖÜäöüßẞ') assert.ok(font.hasGlyphForCodePoint(character.codePointAt(0)), `${name}: ${character}`)
-  }
-})
+test('both static font weights preserve exact required glyphs through actual encoding', () => {
+  const { jsPDF } = require('jspdf')
+  const sample = 'ÇĞİÖŞÜ çğıöşü ÄÖÜ äöü ß ẞ'
+  for (const [name, weight] of [['Inter-Regular.ttf', 400], ['Inter-SemiBold.ttf', 600]]) {
+    const doc = new jsPDF({ putOnlyUsedFonts: true })
+    doc.addFileToVFS(name, fs.readFileSync(path.join(root, 'assets/fonts', name)).toString('base64'))
+    doc.addFont(name, 'Inter', 'normal', weight); doc.setFont('Inter', 'normal', weight)
+    doc.text(sample, 15, 20)
+    assert.equal(inspect(Buffer.from(doc.output('arraybuffer'))).text, sample)
+  }
+})
+
 test('Turkish and German survive actual PDF encoding; labels do not translate stored values', async () => {
   const text = 'ÇĞİÖŞÜ çğıöşü ÄÖÜ äöü ß ẞ'
   for (const language of ['tr', 'de']) {
     const report = { ...fixture, summary: text, role: text, answers: [{ q: text, a: text }] }
     const bytes = await render(report, language)
-    const extracted = compact(inspect(bytes).text)
+    const decoded = inspect(bytes).text
+    assert.ok(decoded.split('\n').includes(text), 'Exact Unicode line')
+    const extracted = compact(decoded)
     assert.ok(extracted.includes(compact(text)))
     assert.ok(extracted.includes('senior')); assert.ok(extracted.includes('formal'))
     assert.ok(extracted.includes(language === 'tr' ? 'MülakatRaporu' : 'Interviewbericht'))
@@ -114,6 +119,8 @@
   const bytes = await render({ ...fixture, answers }, 'en')
   const { text, pages } = inspect(bytes)
   assert.ok(pages.length >= 4)
+  assert.deepEqual([...text.matchAll(/PARAGRAPH_(\d{3})/g)].map(match => match[1]), Array.from({ length: 140 }, (_, i) => String(i).padStart(3, '0')))
+  pages.forEach((page, index) => assert.ok(compact(page).includes(`Page${index + 1}/${pages.length}`)))
   const extracted = compact(text)
   let position = -1
   for (const value of ['LONG_QUESTION', ...paragraphs, ...answers.slice(1).flatMap(({ q, a }) => [q, a])]) {
@@ -181,3 +188,53 @@
   assert.equal(response.status, 500); assert.deepEqual(await response.json(), { error: 'Failed to generate PDF' })
   assert.equal(response.headers.get('Content-Disposition'), null)
 })
+
+test('ten alternating reports preserve Unicode, sequences, full long content and input', async t => {
+  const sample = 'ÇĞİÖŞÜ çğıöşü ÄÖÜ äöü ß ẞ'
+  const paragraphs = Array.from({ length: 140 }, (_, i) => 'PARAGRAPH_' + String(i).padStart(3, '0') + ' Saved interview answer with Turkish ş and German ü.')
+  const longAnswers = [{ q: 'LONG_QUESTION', a: paragraphs.join('\n') }, ...Array.from({ length: 12 }, (_, i) => ({ q: 'QUESTION_' + i, a: 'ANSWER_' + i }))]
+  const seen = new Map(), measurements = [], snapshot = JSON.stringify(fixture)
+  const previousFetch = global.fetch
+  global.fetch = () => { throw new Error('Unexpected provider call') }
+  try {
+    for (let i = 0; i < 10; i++) {
+      const long = i % 2 === 1, reversed = Math.floor(i / 2) % 2 === 1
+      const sequence = reversed ? ['G', 'Ğ', 'ı', 'i'] : ['Ğ', 'G', 'i', 'ı']
+      const report = { ...fixture, summary: sample + '\n' + sequence.join('\n'), answers: long ? longAnswers : fixture.answers }
+      const before = process.memoryUsage().rss, start = performance.now()
+      const bytes = await render(report, 'en'), ms = performance.now() - start, after = process.memoryUsage().rss
+      const { text, pages } = inspect(bytes)
+      assert.equal(bytes.subarray(0, 5).toString(), '%PDF-'); assert.match(bytes.subarray(-30).toString(), /%%EOF/)
+      assert.ok(text.includes(sample + '\n' + sequence.join('\n')))
+      if (long) {
+        assert.ok(pages.length > 1)
+        const body = pages.flatMap((page, index) => {
+          const lines = page.split('\n')
+          assert.equal(lines.at(-1), `Page ${index + 1} / ${pages.length}`)
+          return lines.slice(0, -1)
+        })
+        const start = body.indexOf('LONG_QUESTION')
+        assert.ok(start >= 0, 'Exact LONG_QUESTION must exist')
+        const expected = ['LONG_QUESTION', 'Answer', ...paragraphs,
+          ...longAnswers.slice(1).flatMap(({ q, a }, index) =>
+            [`Question ${index + 2}`, q, 'Answer', a])]
+        assert.deepEqual(body.slice(start), expected, 'Exact complete ordered Q&A without page footers')
+      }
+      pages.forEach((page, index) => assert.ok(compact(page).includes('Page' + (index + 1) + '/' + pages.length)))
+      const key = long + ':' + reversed
+      if (seen.has(key)) assert.equal(text, seen.get(key))
+      seen.set(key, text)
+      assert.equal(JSON.stringify(fixture), snapshot)
+      measurements.push({ index: i + 1, long, ms, bytes: bytes.length, pages: pages.length, rssBefore: before, rssAfter: after })
+      if (process.env.REPORT_PDF_QA_DIR) fs.writeFileSync(path.join(process.env.REPORT_PDF_QA_DIR, 'sequence-' + (i + 1) + '.pdf'), bytes)
+    }
+  } finally { global.fetch = previousFetch }
+  t.diagnostic(JSON.stringify({ measurements, maxRSSKiB: process.resourceUsage().maxRSS }))
+  if (process.env.REPORT_PDF_QA_DIR) fs.writeFileSync(path.join(process.env.REPORT_PDF_QA_DIR, 'measurements.json'), JSON.stringify(measurements, null, 2))
+})
+
+test('renderer rejects invalid language and invalid persisted numbers safely', async () => {
+  await assert.rejects(render(fixture, 'fr'), /Invalid report language/)
+  await assert.rejects(render({ ...fixture, score: 101 }, 'en'), /Invalid persisted report numbers/)
+  await assert.rejects(render({ ...fixture, durationSeconds: -1 }, 'en'), /Invalid persisted report numbers/)
+})
```

### lib/reports/interview-report-flow.ts

```diff
--- pre-migration/lib/reports/interview-report-flow.ts
+++ final/lib/reports/interview-report-flow.ts
@@ -0,0 +1,44 @@
+import 'server-only'
+import type { jsPDF } from 'jspdf'
+import type { reportStyles } from './interview-report-styles'
+
+type Layout = ReturnType<typeof reportStyles>
+type TextOptions = { size?: number; weight?: 400 | 600; color?: string; after?: number; keepNext?: boolean }
+
+export function reportFlow(doc: jsPDF, layout: Layout) {
+  const width = doc.internal.pageSize.getWidth() - 2 * layout.margin
+  const bottom = doc.internal.pageSize.getHeight() - layout.footerReserve
+  let y = layout.margin
+  function ensure(height: number) {
+    if (y + height > bottom) { doc.addPage(); y = layout.margin }
+  }
+  return {
+    gap(amount = layout.gap) { y += amount },
+    text(value: string, options: TextOptions = {}) {
+      const size = options.size ?? layout.body
+      const height = size * layout.lineHeight
+      doc.setFont('Inter', 'normal', options.weight ?? 400)
+      doc.setFontSize(size)
+      doc.setTextColor(options.color ?? layout.text)
+      const lines: string[] = doc.splitTextToSize(value, width)
+      if (options.keepNext) ensure(height + (options.after ?? layout.gap) + layout.body * layout.lineHeight)
+      for (const line of lines) {
+        ensure(height)
+        doc.text(line, layout.margin, y + size)
+        y += height
+      }
+      y += options.after ?? layout.gap
+    },
+    footer(label: string) {
+      const total = doc.getNumberOfPages()
+      for (let page = 1; page <= total; page++) {
+        doc.setPage(page)
+        doc.setFont('Inter', 'normal', 400)
+        doc.setFontSize(layout.small)
+        doc.setTextColor(layout.secondary)
+        doc.text(`${label} ${page} / ${total}`, doc.internal.pageSize.getWidth() / 2,
+          doc.internal.pageSize.getHeight() - layout.footerBottom, { align: 'center' })
+      }
+    },
+  }
+}
```


## Final persisted-language contract — 2026-10-01

Approved bounded behavior correction after user-reported browser acceptance: PDF label language is derived server-side from the authenticated owner-scoped record's interview.language. Current UI language controls browser button/status/error copy only. Persisted summary, Q&A, role/company and other saved values are never translated.

Final endpoint: GET /api/interviews/[id]/pdf. Legacy language query parameters are ignored completely, including duplicate/empty/unsupported values; they cannot override saved language. This supersedes the earlier client-selected query contract and its Invalid language 400 requirement. InterviewDetail.language is a string, so the route narrows against the existing SUPPORTED_APP_LANGUAGES list. Unsupported saved values fail with 500 {"error":"Failed to generate PDF"}, no attachment and no fallback translation. Authentication/read outcomes remain prior to language derivation; authorization logic is unchanged.

Changed code: app/api/interviews/[id]/pdf/route.ts; components/result/ResultPdfDownload.tsx; components/result/ResultContent.tsx; lib/reports/interview-report.test.cjs. Removed only export-language prop/request plumbing; ResultContent keeps uiLanguage for browser date formatting and copy remains localized. No renderer/font/pagination, owner-reader/detail/auth/recovery, dependency or config changes.

Validation in required order: PDF 14/14 PASS; owner-reader 8/8 PASS; recovery 34/34 PASS; npx tsc --noEmit --incremental false PASS; git diff --check PASS; read-only process check found no repository dev server; npm run build exit 0, Next.js 14.2.5 static generation 22/22 with dynamic PDF endpoint. Two webpack cache snapshot warnings persisted; no renderer-specific error or workaround. Existing LF/CRLF and npm upgrade notices only; no upgrades performed.

Post-build PDF suite: 14/14 PASS. TEMP/talentry-pdf-persisted-language/persisted-en.pdf, persisted-tr.pdf and persisted-de.pdf were generated through the real route with an owner-reader fixture and actual renderer. Labels match saved language despite conflicting queries; full saved fixture content and exact multilingual sample preserved; used-glyph ToUnicode mappings valid. Existing six-page long-report and ten alternating-render checks passed with complete ordered paragraphs/Q&A/footers. No pagination code changed. No live DB or browser acceptance is claimed by these fixture checks.

Manual re-acceptance remains pending: English historical record while UI is Turkish; Turkish record; German record if available; unchanged saved content; download/repeated export; unauthorized/wrong-owner boundaries. Unsupported historical language values intentionally fail safely. Deployed runtime/resources and actual browser behavior remain acceptance risks. Do not update Project Memory or close runtime acceptance yet. No Git mutation or dev-server restart.

## Final language-source file diffs against pre-migration snapshot

### app/api/interviews/[id]/pdf/route.ts

```diff
--- before/app/api/interviews/[id]/pdf/route.ts
+++ final/app/api/interviews/[id]/pdf/route.ts
@@ -1,6 +1,6 @@
 import { NextResponse } from 'next/server'
 import { readOwnedInterview } from '@/lib/interviews/read-owned-interview'
-import { DEFAULT_APP_LANGUAGE, SUPPORTED_APP_LANGUAGES } from '@/lib/auth/auth-constants'
+import { SUPPORTED_APP_LANGUAGES } from '@/lib/auth/auth-constants'
 import { renderInterviewReport, reportFilename } from '@/lib/reports/render-interview-report'

 export const runtime = 'nodejs'
@@ -9,7 +9,7 @@
 const headers = { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' }
 const errorResponse = (error: string, status: number) => NextResponse.json({ error }, { status, headers })

-export async function GET(request: Request, { params }: { params: { id: string } }) {
+export async function GET(_request: Request, { params }: { params: { id: string } }) {
   try {
     const result = await readOwnedInterview(params.id)
     switch (result.status) {
@@ -18,9 +18,9 @@
       case 'notFound': return errorResponse('Interview not found', 404)
       case 'readError': return errorResponse('Failed to load interview', 500)
     }
-    const values = new URL(request.url).searchParams.getAll('language')
-    const language = values.length === 0 ? DEFAULT_APP_LANGUAGE : SUPPORTED_APP_LANGUAGES.find(value => value === values[0])
-    if (values.length > 1 || !language) return errorResponse('Invalid language', 400)
+    // Legacy query parameters cannot override the owner-scoped persisted language.
+    const language = SUPPORTED_APP_LANGUAGES.find(value => value === result.interview.language)
+    if (!language) return errorResponse('Failed to generate PDF', 500)
     const buffer = await renderInterviewReport(result.interview, language)
     return new Response(new Uint8Array(buffer), {
       status: 200,
```

### components/result/ResultPdfDownload.tsx

```diff
--- before/components/result/ResultPdfDownload.tsx
+++ final/components/result/ResultPdfDownload.tsx
@@ -4,14 +4,13 @@
 import { useRouter } from 'next/navigation'
 import { TalentryButton } from '@/components/ui'
 import { AUTH_ROUTES } from '@/lib/auth/auth-constants'
-import type { AppLanguage } from '@/types/auth'
 import type { ResultCopy } from './result-copy'
 import styles from '@/app/result/result.module.css'

 type DownloadState = 'idle' | 'generating' | 'started' | 'unavailable' | 'error'

-export default function ResultPdfDownload({ interviewId, uiLanguage, copy }: {
-  interviewId: string; uiLanguage: AppLanguage; copy: ResultCopy['pdf']
+export default function ResultPdfDownload({ interviewId, copy }: {
+  interviewId: string; copy: ResultCopy['pdf']
 }) {
   const router = useRouter()
   const [state, setState] = useState<DownloadState>('idle')
@@ -38,7 +37,7 @@
     const current = () => mounted.current && active.current === controller && !controller.signal.aborted
     setState('generating')
     try {
-      const response = await fetch(`/api/interviews/${encodeURIComponent(interviewId)}/pdf?language=${uiLanguage}`, {
+      const response = await fetch(`/api/interviews/${encodeURIComponent(interviewId)}/pdf`, {
         credentials: 'same-origin', cache: 'no-store', signal: controller.signal,
       })
       if (!current()) return
```

### components/result/ResultContent.tsx

```diff
--- before/components/result/ResultContent.tsx
+++ final/components/result/ResultContent.tsx
@@ -120,7 +120,7 @@
           </p>
         </TalentryCard>
       </div>
-      <ResultPdfDownload interviewId={interview.id} uiLanguage={uiLanguage} copy={copy.pdf} />
+      <ResultPdfDownload interviewId={interview.id} copy={copy.pdf} />
         </div>
         <div {...panelProps(1)}>
       <TalentryCard aria-labelledby="result-details">
```

### lib/reports/interview-report.test.cjs

```diff
--- before/lib/reports/interview-report.test.cjs
+++ final/lib/reports/interview-report.test.cjs
@@ -9,7 +9,7 @@
 const ts = require('typescript')
 const { NextResponse } = require('next/server')
 const root = path.resolve(__dirname, '../..')
-let renderer, render, filename, fontkit
+let render, filename
 const id = '11111111-1111-4111-8111-111111111111'
 const fixture = Object.freeze({ id, owner_id: 'SECRET_OWNER_UUID', interviewerKey: 'SECRET_INTERVIEWER_KEY',
   role: 'Persisted Engineer', company: 'Saved Company', level: 'senior', interviewType: 'technical',
@@ -28,7 +28,6 @@
       require(name) {
         if (Object.hasOwn(overrides, name)) return overrides[name]
         if (name === 'server-only') return {}
-        if (name === '@react-pdf/renderer') return renderer
         if (name === 'next/server') return { NextResponse }
         if (name.startsWith('@/') || name.startsWith('.')) {
           const base = name.startsWith('@/') ? path.join(root, name.slice(2)) : path.resolve(path.dirname(file), name)
@@ -37,7 +36,7 @@
           assert.ok(!target.includes(`${path.sep}supabase${path.sep}`), 'No real database imports allowed')
           return load(target)
         }
-        assert.ok(['react', 'react/jsx-runtime', 'node:fs', 'node:path'].includes(name), `Unexpected dependency ${name}`)
+        assert.ok(['jspdf', 'node:fs', 'node:path'].includes(name), `Unexpected dependency ${name}`)
         return require(name)
       },
     }
@@ -48,19 +47,17 @@
   return file => load(path.join(root, file))
 }
 before(async () => {
-  renderer = await import('@react-pdf/renderer')
-  fontkit = await import('fontkit')
   const module = loader()('lib/reports/render-interview-report.ts')
   render = module.renderInterviewReport; filename = module.reportFilename
 })
 function inspect(buffer) {
   const python = process.env.REPORT_PDF_PYTHON || 'python'
-  const result = spawnSync(python, ['-c',
-    'import sys,io,json; from pypdf import PdfReader; r=PdfReader(io.BytesIO(sys.stdin.buffer.read())); print(json.dumps({"pages":[p.extract_text() for p in r.pages]},ensure_ascii=True))'],
-  { input: buffer, maxBuffer: 16 * 1024 * 1024 })
+  const result = spawnSync(python, ['-I', '-B', path.join(__dirname, 'inspect-report-pdf.py')],
+    { input: buffer, maxBuffer: 16 * 1024 * 1024 })
   assert.ifError(result.error)
   assert.equal(result.status, 0, result.stderr?.toString())
   const parsed = JSON.parse(result.stdout.toString())
+  assert.deepEqual(parsed.mappingErrors, [], 'Every used CID must map to nonempty Unicode')
   return { pages: parsed.pages, text: parsed.pages.join('\n') }
 }
 const compact = value => value.replace(/\s+/g, '')
@@ -90,18 +87,26 @@
   pages.forEach((page, index) => assert.ok(compact(page).includes(`Page${index + 1}/${pages.length}`)))
   if (process.env.REPORT_PDF_QA_DIR) { fs.mkdirSync(process.env.REPORT_PDF_QA_DIR, { recursive: true }); fs.writeFileSync(path.join(process.env.REPORT_PDF_QA_DIR, 'report.pdf'), bytes) }
 })
-test('static font files cover required Turkish/German glyphs in both weights', () => {
-  for (const name of ['Inter-Regular.ttf', 'Inter-SemiBold.ttf']) {
-    const font = fontkit.openSync(path.join(root, 'assets/fonts', name))
-    for (const character of 'ÇĞİÖŞÜçğıöşüÄÖÜäöüßẞ') assert.ok(font.hasGlyphForCodePoint(character.codePointAt(0)), `${name}: ${character}`)
-  }
-})
+test('both static font weights preserve exact required glyphs through actual encoding', () => {
+  const { jsPDF } = require('jspdf')
+  const sample = 'ÇĞİÖŞÜ çğıöşü ÄÖÜ äöü ß ẞ'
+  for (const [name, weight] of [['Inter-Regular.ttf', 400], ['Inter-SemiBold.ttf', 600]]) {
+    const doc = new jsPDF({ putOnlyUsedFonts: true })
+    doc.addFileToVFS(name, fs.readFileSync(path.join(root, 'assets/fonts', name)).toString('base64'))
+    doc.addFont(name, 'Inter', 'normal', weight); doc.setFont('Inter', 'normal', weight)
+    doc.text(sample, 15, 20)
+    assert.equal(inspect(Buffer.from(doc.output('arraybuffer'))).text, sample)
+  }
+})
+
 test('Turkish and German survive actual PDF encoding; labels do not translate stored values', async () => {
   const text = 'ÇĞİÖŞÜ çğıöşü ÄÖÜ äöü ß ẞ'
   for (const language of ['tr', 'de']) {
     const report = { ...fixture, summary: text, role: text, answers: [{ q: text, a: text }] }
     const bytes = await render(report, language)
-    const extracted = compact(inspect(bytes).text)
+    const decoded = inspect(bytes).text
+    assert.ok(decoded.split('\n').includes(text), 'Exact Unicode line')
+    const extracted = compact(decoded)
     assert.ok(extracted.includes(compact(text)))
     assert.ok(extracted.includes('senior')); assert.ok(extracted.includes('formal'))
     assert.ok(extracted.includes(language === 'tr' ? 'MülakatRaporu' : 'Interviewbericht'))
@@ -114,6 +119,8 @@
   const bytes = await render({ ...fixture, answers }, 'en')
   const { text, pages } = inspect(bytes)
   assert.ok(pages.length >= 4)
+  assert.deepEqual([...text.matchAll(/PARAGRAPH_(\d{3})/g)].map(match => match[1]), Array.from({ length: 140 }, (_, i) => String(i).padStart(3, '0')))
+  pages.forEach((page, index) => assert.ok(compact(page).includes(`Page${index + 1}/${pages.length}`)))
   const extracted = compact(text)
   let position = -1
   for (const value of ['LONG_QUESTION', ...paragraphs, ...answers.slice(1).flatMap(({ q, a }) => [q, a])]) {
@@ -151,13 +158,36 @@
   assert.equal(Buffer.from(await response.arrayBuffer()).subarray(0, 5).toString(), '%PDF-')
   assert.deepEqual(h.calls, [id])
 })
-test('language default is tr; empty, duplicate and unsupported values fail safely', async () => {
+test('route derives labels from persisted language and ignores all legacy language queries', async () => {
+  const sample = 'ÇĞİÖŞÜ çğıöşü ÄÖÜ äöü ß ẞ'
+  for (const [language, title] of [['en', 'Interview Report'], ['tr', 'Mülakat Raporu'], ['de', 'Interviewbericht']]) {
+    const interview = { ...fixture, language, summary: fixture.summary + '\n' + sample }
+    const snapshot = JSON.stringify(interview)
+    const h = route({ status: 'ready', interview })
+    const response = await h.GET(request('?language=' + (language === 'en' ? 'tr' : 'en')), { params: { id } })
+    assert.equal(response.status, 200)
+    const bytes = Buffer.from(await response.arrayBuffer())
+    const { text } = inspect(bytes)
+    assert.ok(text.split('\n').includes(title))
+    for (const value of [fixture.summary, sample, fixture.role, fixture.company, ...fixture.answers.flatMap(({q,a})=>[q,a])]) {
+      assert.ok(text.split('\n').some(line => line === value || line.endsWith(': ' + value)), value)
+    }
+    assert.equal(JSON.stringify(interview), snapshot)
+    if (process.env.REPORT_PDF_QA_DIR) fs.writeFileSync(path.join(process.env.REPORT_PDF_QA_DIR, 'persisted-' + language + '.pdf'), bytes)
+  }
   let received
-  const h = route({ status: 'ready', interview: fixture }, async (_, language) => { received = language; return Buffer.from('%PDF-test') })
-  assert.equal((await h.GET(request(''), { params: { id } })).status, 200); assert.equal(received, 'tr')
-  for (const suffix of ['?language=', '?language=fr', '?language=en&language=de', '?language=TR']) {
-    const response = await h.GET(request(suffix), { params: { id } })
-    assert.equal(response.status, 400); assert.deepEqual(await response.json(), { error: 'Invalid language' })
+  const h = route({ status: 'ready', interview: { ...fixture, language: 'en' } }, async (_, language) => { received = language; return Buffer.from('%PDF-test') })
+  for (const suffix of ['', '?language=', '?language=fr', '?language=en&language=de', '?language=TR']) {
+    assert.equal((await h.GET(request(suffix), { params: { id } })).status, 200)
+    assert.equal(received, 'en')
+  }
+})
+test('unsupported persisted language fails generically and cannot be rescued by a query', async () => {
+  for (const language of ['', 'fr', 'EN']) {
+    const h = route({ status: 'ready', interview: { ...fixture, language } }, () => { throw new Error('Must not render') })
+    const response = await h.GET(request('?language=en'), { params: { id } })
+    assert.equal(response.status, 500)
+    assert.deepEqual(await response.json(), { error: 'Failed to generate PDF' })
     assert.equal(response.headers.get('Content-Disposition'), null)
   }
 })
@@ -181,3 +211,53 @@
   assert.equal(response.status, 500); assert.deepEqual(await response.json(), { error: 'Failed to generate PDF' })
   assert.equal(response.headers.get('Content-Disposition'), null)
 })
+
+test('ten alternating reports preserve Unicode, sequences, full long content and input', async t => {
+  const sample = 'ÇĞİÖŞÜ çğıöşü ÄÖÜ äöü ß ẞ'
+  const paragraphs = Array.from({ length: 140 }, (_, i) => 'PARAGRAPH_' + String(i).padStart(3, '0') + ' Saved interview answer with Turkish ş and German ü.')
+  const longAnswers = [{ q: 'LONG_QUESTION', a: paragraphs.join('\n') }, ...Array.from({ length: 12 }, (_, i) => ({ q: 'QUESTION_' + i, a: 'ANSWER_' + i }))]
+  const seen = new Map(), measurements = [], snapshot = JSON.stringify(fixture)
+  const previousFetch = global.fetch
+  global.fetch = () => { throw new Error('Unexpected provider call') }
+  try {
+    for (let i = 0; i < 10; i++) {
+      const long = i % 2 === 1, reversed = Math.floor(i / 2) % 2 === 1
+      const sequence = reversed ? ['G', 'Ğ', 'ı', 'i'] : ['Ğ', 'G', 'i', 'ı']
+      const report = { ...fixture, summary: sample + '\n' + sequence.join('\n'), answers: long ? longAnswers : fixture.answers }
+      const before = process.memoryUsage().rss, start = performance.now()
+      const bytes = await render(report, 'en'), ms = performance.now() - start, after = process.memoryUsage().rss
+      const { text, pages } = inspect(bytes)
+      assert.equal(bytes.subarray(0, 5).toString(), '%PDF-'); assert.match(bytes.subarray(-30).toString(), /%%EOF/)
+      assert.ok(text.includes(sample + '\n' + sequence.join('\n')))
+      if (long) {
+        assert.ok(pages.length > 1)
+        const body = pages.flatMap((page, index) => {
+          const lines = page.split('\n')
+          assert.equal(lines.at(-1), `Page ${index + 1} / ${pages.length}`)
+          return lines.slice(0, -1)
+        })
+        const start = body.indexOf('LONG_QUESTION')
+        assert.ok(start >= 0, 'Exact LONG_QUESTION must exist')
+        const expected = ['LONG_QUESTION', 'Answer', ...paragraphs,
+          ...longAnswers.slice(1).flatMap(({ q, a }, index) =>
+            [`Question ${index + 2}`, q, 'Answer', a])]
+        assert.deepEqual(body.slice(start), expected, 'Exact complete ordered Q&A without page footers')
+      }
+      pages.forEach((page, index) => assert.ok(compact(page).includes('Page' + (index + 1) + '/' + pages.length)))
+      const key = long + ':' + reversed
+      if (seen.has(key)) assert.equal(text, seen.get(key))
+      seen.set(key, text)
+      assert.equal(JSON.stringify(fixture), snapshot)
+      measurements.push({ index: i + 1, long, ms, bytes: bytes.length, pages: pages.length, rssBefore: before, rssAfter: after })
+      if (process.env.REPORT_PDF_QA_DIR) fs.writeFileSync(path.join(process.env.REPORT_PDF_QA_DIR, 'sequence-' + (i + 1) + '.pdf'), bytes)
+    }
+  } finally { global.fetch = previousFetch }
+  t.diagnostic(JSON.stringify({ measurements, maxRSSKiB: process.resourceUsage().maxRSS }))
+  if (process.env.REPORT_PDF_QA_DIR) fs.writeFileSync(path.join(process.env.REPORT_PDF_QA_DIR, 'measurements.json'), JSON.stringify(measurements, null, 2))
+})
+
+test('renderer rejects invalid language and invalid persisted numbers safely', async () => {
+  await assert.rejects(render(fixture, 'fr'), /Invalid report language/)
+  await assert.rejects(render({ ...fixture, score: 101 }, 'en'), /Invalid persisted report numbers/)
+  await assert.rejects(render({ ...fixture, durationSeconds: -1 }, 'en'), /Invalid persisted report numbers/)
+})
```
