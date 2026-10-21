# Sprint NEXT15_SECURITY_UPGRADE_GATE_01_ACCEPTANCE_PRECHECK Engineering Report

## 1. Report identity

2026-10-21 Europe/Istanbul; acceptance precheck snapshot. Supervised authenticated steps pending. This report does not supersede unobserved acceptance with PASS.

## 2. Objective and boundaries

User authorized acceptance, read-only audit triage, supervised browser checks, and canonical future-roadmap documentation. No dependency/source/schema change authorized absent proven defect. No defect correction made. Original Phase 2 reports remain immutable.

## 3. Repository state

Branch feature/auth-foundation; HEAD 74e699b7c8ae10a232426364907d5194d8819eb6. Existing 17 tracked migration modifications and two untracked Phase 2 reports matched prior turn. No unrelated changes. git diff --check exit 0 (line-ending conversion warnings only).

## 4. Decisions and evidence

### Npm audit triage

Audit returned exit 1 because vulnerabilities exist: 18 package entries (13 moderate, 3 high, 2 critical). These are not 18 independent exploitable defects. No audit fix, overrides, installation or upgrades performed. Initial sandbox audit failed ENOTFOUND; approved elevated read-only audit succeeded.

All vulnerable installed versions below were already present at HEAD 74e699b. None of these vulnerable package versions was newly introduced by this migration. Next itself changed from 14.2.5 to 15.5.28 but its PostCSS version remains 8.4.31. All leaf packages below are transitive. HeyGen and Next are direct inherited audit entries.

| Advisory group | Installed vulnerable path/version | Advisory vulnerable range | Actual use and phase | Classification; browser blocker; smallest future action |
|---|---|---|---|---|
| form-data GHSA-fjxv-7rqg-78g4 (critical), GHSA-hmw2-7cc7-3qxx (high) | request/node_modules/form-data 2.3.3 | <2.5.4; <2.5.6 | HeyGen -> openapi-generator -> request; no app SDK import; potential SDK runtime/tooling path inactive | C, no; separately remove unused SDK or upgrade its chain before enabling |
| request GHSA-p8p7-x288-28g6 (moderate SSRF; aggregate critical) | request 2.88.2 | <=2.88.2; aggregate * | Same unused HeyGen chain, not application provider fetch | C, no; same SDK cleanup |
| Ajv GHSA-v88g-cgmw-v5xw / GHSA-2g4f-4pwh-qvx6 (moderate) | oas-validator/node_modules/ajv 5.5.2; root ajv 6.15.0 is not flagged | <6.12.3; <6.14.0 | Inactive HeyGen OpenAPI validation tooling/runtime path | C, no; same SDK cleanup |
| jsonpointer GHSA-282f-qqgm-c34q (moderate) | jsonpointer 4.1.0 | <5.0.0 | Inactive HeyGen validation/error chain | C, no; same SDK cleanup |
| qs GHSA-6rw7-vpxm-498p / GHSA-x5fp-wj9c-mxmx / GHSA-4mjr-xmp4-gh2g (moderate) | qs 6.15.3; request/node_modules/qs 6.5.5 | <6.14.1; >=6.14.2 <=6.15.3; >=2.2.5 <6.16.0 | Inactive HeyGen request chain; app query handling uses URLSearchParams | C, no; same SDK cleanup |
| tough-cookie GHSA-72xf-g2v4-qvf3 (moderate) | tough-cookie 2.5.0 | <4.1.3 | Inactive request chain; not Supabase cookie adapter | C, no; same SDK cleanup |
| uuid GHSA-w5hq-g745-h8pq (moderate) | uuid 3.4.0 | <11.1.1 | Inactive request chain; completion uses crypto.randomUUID, not uuid | C, no; same SDK cleanup |
| yargs-parser GHSA-p9pc-299p-vxgp (moderate) | yargs-parser 11.1.1 | >=6.0.0 <13.1.2 | Inactive OpenAPI CLI/tooling chain | C, no; same SDK cleanup |
| nanoid GHSA-28wg-ghj8-5hjv / GHSA-2v37-7h3g-55p8 (high) | nanoid 3.3.15 | <3.3.16; <3.3.18 | PostCSS input.js calls non-secure nanoid(6), fixed positive size; no app import/custom generator. Build/dev utility, no proven affected runtime input | C, no; separately refresh supported tooling tree without overrides |
| PostCSS GHSA-qx2v-qp2m-jg93 / GHSA-6g55-p6wh-862q / GHSA-fxqj-rqcc-2cmp / GHSA-r28c-9q8g-f849 (moderate/high) | postcss 8.4.31 | <8.5.10; <=8.5.11; <=8.5.22; <=8.5.17 | Next build/dev handles repository CSS; no application server CSS-processing/import path or user CSS ingestion found | B, no for trusted-source local acceptance; separate supported Next/tooling remediation before production release/CI approval |
| source-map-js GHSA-68fv-2mgg-jv7q (high) | source-map-js 1.2.1 | >=1.0.0 <1.2.2 | PostCSS dependency for build/dev source maps, no app runtime import or untrusted map ingestion found | B, no for trusted-source local acceptance; same supported tooling remediation |

Inherited audit entries grouped with leaves above: @heygen/streaming-avatar 1.0.16 (direct, moderate, aggregate range 1.0.14-1.0.16), better-ajv-errors 0.6.7 (transitive moderate <=0.8.1), oas-validator 3.4.0 (transitive moderate <=4.0.8), openapi-generator 0.1.39 (transitive moderate *), swagger2openapi 5.4.0 (transitive moderate 2.2.1-6.2.3), yargs 12.0.5 (transitive moderate 8.0.0-candidate.0-12.0.5), next 15.5.28 (direct moderate through PostCSS; audit aggregate range 9.3.4-canary.0-16.3.0-preview.10). No independent vulnerability is inferred from inherited entries. No A blocker found; production environment evidence remains outside this local precheck. No conclusion that the full dependency tree is secure.

Advisory URLs: https://github.com/advisories/<GHSA identifier above>. npm audit's suggested Next 16.4.2 major upgrade was not applied; Next 16 remains deferred.


### core-js warning

Exact core-js 3.49.0, present before migration; npm explain identifies HeyGen and optional jsPDF/canvg chains. Package postinstall is node -e try-require('./postinstall') with caught errors. Read complete installed postinstall source: funding banner output and os.tmpdir/core-js-banners cache only, no runtime asset generation. npm reported lifecycle approval pending; the script was not approved/run by this session. Historical execution on earlier installs cannot be established from this warning. ignore-scripts config reports false; pending allowScripts approval is separate. Runtime correctness does not depend on the banner script. Prior successful real PDF tests and build materially corroborate this; browser can continue. No arbitrary script executed.

### TypeScript and Next source review

Next automatically added target ES2017 for top-level-await support and reformatted paths. strict remains false as at HEAD; skipLibCheck/allowJs and all other compiler flags unchanged. Alias @/* -> ./* unchanged. No Expo/mobile/experimental compiler additions. next-env adds generated .next/types/routes.d.ts reference and updated documentation link. No corrective edit needed.

cookies awaited; async server client awaited by sole production auth caller; API params and interview searchParams awaited; result client uses React use(promisedParams); PDF tracing is top-level with identical asset patterns. No temporary synchronous compatibility API/cast found. Cookie getAll/setAll/options and narrow suppression unchanged.

Auth diff only adds await to client construction. Provider contracts/admission/allowlist/HeyGen implementations unchanged. Completion persistence/session/recovery implementations unchanged. 201 first save, 200 replay, generic 409/no overwrite, no Q6, duplicate/stale protections retained; confidence includes prior deterministic tests, not new live mutation claims.

### Exact dependency state

Package and lock agree: next 15.5.28, react/react-dom 19.3.1, @types/react/@types/react-dom 19.3.0; transitive sharp 0.35.5 previously verified installed. Only the five approved direct declarations differ from HEAD. No dependency mutation in this acceptance precheck.

## 5. Files and responsibilities

Canonical APP roadmap and decisions/risks append approved Supabase explicit-grant rule, fresh/preview/reset deployment checks, NEXT16_READINESS_GATE under MOBILE_ARCHITECTURE_01 and SUPPORTED_NEXT_BASELINE_GATE under DEPLOYMENT_ENVIRONMENT_RELEASE_01. New reports record precheck evidence/status; no prior sprint report rewritten.

## 6. Interfaces, accessibility and styles

No public interface/source/markup/style/token changes in this turn. No mobile directory created.

## 7. Validation and browser observations

Read-only npm audit exit 1 with findings after sandbox DNS failure/elevated recovery. npm explain used read-only. Source/lock/base comparison completed. No production build concurrently with dev server. Prior 611/611 tests, TypeScript exit 0, build exit 0 and PDF trace checks retained as prior evidence, not rerun.

No listener on 3000/3001 by ordinary netstat; no CIM/WMI. Sandbox dev session 16641 reported Ready but localhost failed and no user-level listener appeared; stopped only that owned session. Approved elevated dev session 88187 starts Next 15.5.28 on localhost:3000; login compiled and returned HTTP 200. Initial browser timeouts occurred before successful load; not classified as application failure.

Embedded browser tab 2 login renders; captured warn/error console empty. Separate tab 3 forgot-password renders without submission; reset-password renders Checking reset link then expected Reset link unavailable for direct entry; captured warn/error console empty. No email, password, reset callback, completion/save, delete or synthetic record action performed. Login/logout/private route and one interview through Q2 remain USER-SUPERVISED PENDING. History/Result/PDF owned-record browser smoke pending; no suitable record assumed. No Network privacy evidence claimed. No credentials or tokens printed.

## 8. Git state

Committed base unchanged, nothing staged/committed/pushed. Acceptance turn adds only two report files and two canonical documentation appendices on top of existing migration. No database/schema/migration or /mobile changes, no synthetic History data.

## 9. Complete acceptance-turn diffs

Canonical documentation diff:

```diff
diff --git a/docs/03_Roadmap/APP_V1_MASTER_ROADMAP.md b/docs/03_Roadmap/APP_V1_MASTER_ROADMAP.md
index 0e817f9..0359341 100644
--- a/docs/03_Roadmap/APP_V1_MASTER_ROADMAP.md
+++ b/docs/03_Roadmap/APP_V1_MASTER_ROADMAP.md
@@ -109,3 +109,24 @@ Career Level, XP, gamification, badges, skill trees and advanced premium career
 ## Stage governance

 Audit -> explicit scope approval -> scoped implementation -> required validation -> immutable dual reports -> acceptance review -> explicitly authorized Git closure. No next-stage execution, source changes, packages, /mobile, native projects, schema/migrations, secrets, provider calls or Supabase operations in this freeze. Documentation validation only; no TypeScript, production build, dev server or browser acceptance. No staging/commit/push until explicit authorization.
+
+
+## NEXT15_SECURITY_UPGRADE_GATE_01 — approved future gates (2026-10-21)
+
+Documentation-only planning update authorized during Next 15 acceptance. No database, schema, grant, policy, dependency or mobile change is implemented by this entry.
+
+### Supabase explicit Data API grants
+
+Supabase's announced 30 October 2026 rollout applies the new-table explicit-grant behavior to existing projects; new-project rollout began earlier. Existing tables keep their current grants. Source: [official Supabase changelog](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically).
+
+Every future public-schema table migration must define least-privilege explicit GRANTs, RLS state and required policies together in the same migration. Do not blindly grant anon/authenticated CRUD. Grant only the roles and operations the approved access contract requires, including service_role only where appropriate.
+
+Future deployment gate: fresh project, preview branch and supabase db reset verification must check Data API grants, RLS, policies and expected API accessibility, including denied access. Existing tables and migrations are not altered now.
+
+### Framework forward gates
+
+- MOBILE_ARCHITECTURE_01 includes NEXT16_READINESS_GATE.
+- DEPLOYMENT_ENVIRONMENT_RELEASE_01 includes SUPPORTED_NEXT_BASELINE_GATE.
+- Next 16.4.1 is not implemented now. The controlled target remains Next 15.5.28.
+- Do not introduce new Next 15 patterns that impede a later clean Next 16 migration; use fully async request APIs without temporary synchronous compatibility casts.
+- These are deferred gates, not authorization to begin another stage or install dependencies.
diff --git a/docs/04_Project_Memory/DECISIONS_AND_RISKS.md b/docs/04_Project_Memory/DECISIONS_AND_RISKS.md
index 7c6f23d..9b524d6 100644
--- a/docs/04_Project_Memory/DECISIONS_AND_RISKS.md
+++ b/docs/04_Project_Memory/DECISIONS_AND_RISKS.md
@@ -1964,3 +1964,24 @@ Admission is **PROCESS-LOCAL ONLY**, four concurrent provider operations per pro
 Only the acceptance dev-server session **94239**, restarted by this Codex session with approval, was interrupted after the user explicitly approved final shutdown. Host-level ordinary TCP inspection after shutdown returned **No TCP LISTENING entry on port 3000**. No unrelated process was targeted. Initial sandbox reachability failed; the approved restart outside the sandbox resolved it. No CIM/WMI was used in browser preparation or cleanup.

 Original Phase 2 reports remain immutable implementation-time snapshots; this entry and the new [Reconciliation Summary](../01_Engineering/Sprint_SECURITY_PRIVACY_01_ACCEPTANCE_RECONCILIATION_Summary.md) / [Engineering Report](../01_Engineering/Sprint_SECURITY_PRIVACY_01_ACCEPTANCE_RECONCILIATION_Engineering_Report.md) supersede earlier pending-browser/current acceptance classifications for present planning only. Frozen architecture and historical records are not rewritten.
+
+
+## NEXT15_SECURITY_UPGRADE_GATE_01 — approved future gates (2026-10-21)
+
+Documentation-only planning update authorized during Next 15 acceptance. No database, schema, grant, policy, dependency or mobile change is implemented by this entry.
+
+### Supabase explicit Data API grants
+
+Supabase's announced 30 October 2026 rollout applies the new-table explicit-grant behavior to existing projects; new-project rollout began earlier. Existing tables keep their current grants. Source: [official Supabase changelog](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically).
+
+Every future public-schema table migration must define least-privilege explicit GRANTs, RLS state and required policies together in the same migration. Do not blindly grant anon/authenticated CRUD. Grant only the roles and operations the approved access contract requires, including service_role only where appropriate.
+
+Future deployment gate: fresh project, preview branch and supabase db reset verification must check Data API grants, RLS, policies and expected API accessibility, including denied access. Existing tables and migrations are not altered now.
+
+### Framework forward gates
+
+- MOBILE_ARCHITECTURE_01 includes NEXT16_READINESS_GATE.
+- DEPLOYMENT_ENVIRONMENT_RELEASE_01 includes SUPPORTED_NEXT_BASELINE_GATE.
+- Next 16.4.1 is not implemented now. The controlled target remains Next 15.5.28.
+- Do not introduce new Next 15 patterns that impede a later clean Next 16 migration; use fully async request APIs without temporary synchronous compatibility casts.
+- These are deferred gates, not authorization to begin another stage or install dependencies.

```

New Summary full content:

```markdown
# Sprint NEXT15_SECURITY_UPGRADE_GATE_01_ACCEPTANCE_PRECHECK Summary

- Sprint ID/title: NEXT15_SECURITY_UPGRADE_GATE_01_ACCEPTANCE_PRECHECK — Acceptance precheck and supervised browser handoff.
- Branch: feature/auth-foundation; HEAD 74e699b7c8ae10a232426364907d5194d8819eb6.
- Status: Precheck passed; supervised login/logout/interview/history acceptance pending user.
- Goal: Read-only audit/core-js/config/source review, narrow recovery smoke, approved future planning notes.
- Created files: docs/01_Engineering/Sprint_NEXT15_SECURITY_UPGRADE_GATE_01_ACCEPTANCE_PRECHECK_Summary.md, docs/01_Engineering/Sprint_NEXT15_SECURITY_UPGRADE_GATE_01_ACCEPTANCE_PRECHECK_Engineering_Report.md.
- Modified files in this turn: docs/03_Roadmap/APP_V1_MASTER_ROADMAP.md; docs/04_Project_Memory/DECISIONS_AND_RISKS.md (append-only approved future gates).
- Validation: git diff --check exit 0; no proven critical/high runtime acceptance blocker. Prior 611 tests, TypeScript/build/PDF tracing PASS carried forward, not rerun.
- Browser: login renders; forgot-password renders; reset-password direct entry reaches Reset link unavailable. Captured login/recovery console has no warnings/errors. No reset email/password mutation.
- Risks: B production dependency-tooling gates; inactive HeyGen C findings; authenticated acceptance pending; no Network evidence claimed.
- Approval: Implementation approved to acceptance only; no Git closure authorized, no stage/commit/push.

```

This Engineering Report is its own new-file content; no recursive self-diff. Prior tracked migration full diff remains in immutable Phase 2 Engineering Report.

## 10. Risks, untouched modules and approval required

Authenticated acceptance is not yet complete; no final Git-closure approvability verdict. Dependency tooling B findings require separate production remediation. Inactive HeyGen C findings require review before enabling SDK. Deployment/runtime proof still separate. Existing source, dependencies, schema, CSS and historical reports untouched in this turn. Supervised user action is required by the request; Git closure remains unauthorized.
