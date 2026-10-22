## Canonical status correction — MOBILE_ARCHITECTURE_01 Phase 2 — 2026-10-22

This entry supersedes all earlier current-status, pending-closure and next-stage
wording for these three stages. Earlier entries are preserved historical snapshots;
this correction changes status wording only, not implementation or architecture.

```text
MOBILE_ARCHITECTURE_01:
PHASE 2 BOOTSTRAP IMPLEMENTED / VALIDATED
NATIVE / DEVICE ACCEPTANCE PENDING
NOT YET COMMITTED / PUSHED

SECURITY_PRIVACY_01:
COMPLETE / COMMITTED / PUSHED

NEXT15_SECURITY_UPGRADE_GATE_01:
COMPLETE / COMMITTED / PUSHED
```

Canonical recovery base before MOBILE_ARCHITECTURE_01 Phase 2:
`d4e1dd55657766eb414854ec1993164c239e154f`.
MOBILE_ARCHITECTURE_01 is NOT COMPLETE. No staging, commit or push is performed by
this correction. Prior accepted evidence and its limitations remain unchanged.

Open gates preserved:
- Native/device acceptance and real iOS/Android native build/install pending.
- Real Supabase auth/API connectivity and Keychain/Keystore device behavior pending.
- Tablet/rotation/split-view/accessibility acceptance pending.
- Detail/delete/PDF bearer coverage pending.
- Mobile 19-high audit debt and root audit debt remain open.
- Durable/distributed provider quota enforcement remains open.
- NEXT16_READINESS_GATE remains future.
- No EAS cloud build/signing/store work performed.

---

## MOBILE_ARCHITECTURE_01 Phase 2 — current status — 2026-10-22

**BOOTSTRAP IMPLEMENTED / AUTOMATED VALIDATION PASS / AWAITING REVIEW. NOT COMPLETE.**
Explicitly authorized bounded Expo SDK 58 development-build bootstrap under /mobile;
Expo Router, secure chunked auth storage, auth-only Supabase, typed backend client,
adaptive phone/tablet diagnostic shell and approved pure-domain imports. Root Next stays;
independent manifests/lockfiles; no workspace conversion. Root source/dependencies frozen;
only root compiler mobile exclusion changed outside approved documentation.

Evidence: 15 mobile tests, mobile TypeScript, compatibility, Doctor 20/20, Android/iOS
Hermes exports and source-map/runtime isolation PASS. Root 611 deterministic tests,
TypeScript and 22/22-page production build PASS. PDF tests use invocation-local bundled
Python; initial default-Python failure was environmental and resolved without source changes.
Ordinary non-CIM process/listener inspection found no port 3000 or Node-owned TCP listener
before build. No command lines displayed, no processes stopped. No native/cloud/signing
build, real auth, real API connectivity, secure-store device or tablet acceptance.

SECURITY_PRIVACY_01 and NEXT15_SECURITY_UPGRADE_GATE_01 implementations and accepted
functional evidence are committed at 74e699b and d4e1dd5 respectively. Current HEAD/local
origin tracking ref match d4e1dd55657766eb414854ec1993164c239e154f. No fetch performed.
This reconciliation supersedes stale pending-Git-closure/current-next-stage wording for
planning; earlier dated entries and immutable reports remain historical. It does not
expand their accepted browser/Network/PDF/completion evidence or approve production.

Mobile audit: 19 high package entries, zero critical, four direct aggregate entries and
15 transitive; underlying braces/Metro and node-forge tooling advisories are absent from
both exported runtime maps. No audit fixes. Template dependency superset remains; no
HeyGen/root dependency chains inherited. Root 18-entry debt and durable/distributed
provider quotas remain production gates. Detail/delete/PDF cookie-only bearer gap stays
open; direct Supabase application data is prohibited. NEXT16_READINESS_GATE is preserved;
no backend Next coupling or migration. Approved explicit least-privilege GRANT/RLS/policy
migration rule and fresh/preview/db-reset checks remain unchanged. No schema change.

No providers, media, payments, push, durable resume, Supabase mutation, signing or cloud
builds. No staging/commit/push. Stage acceptance and future native/device builds require
explicit review; no next sprint started. See [ADR-006](../02_Decisions/ADR-006-mobile-architecture.md),
[Summary](../01_Engineering/Sprint_MOBILE_ARCHITECTURE_01_PHASE_2_Summary.md) and
[Engineering Report](../01_Engineering/Sprint_MOBILE_ARCHITECTURE_01_PHASE_2_Engineering_Report.md).

---

# APP V1 Master Roadmap

## Current acceptance reconciliation — 2026-10-20

**SECURITY_PRIVACY_01 implementation completed; automated validation PASS; FUNCTIONAL WEB BROWSER ACCEPTANCE: PASS; APPROVABLE FOR GIT CLOSURE.** The user explicitly accepted the evidence limitation: **MANUAL DEVTOOLS NETWORK/PRIVACY INSPECTION: NOT AVAILABLE / NOT VERIFIED**, because the in-app browser provided no usable Network history. This is not an implementation defect and is not proof of absent bearer headers, raw provider bodies, HeyGen requests or persistence POSTs.

WEB login/Dashboard, one valid interview, Claude Q1, ElevenLabs audio, one answer/feedback and Q2 without duplication passed supervised acceptance; captured console had 0 warnings/errors, with no functional error after dev-server recovery. User did not intentionally complete/save; no save action was initiated; absence of POST /api/interviews was not independently Network-verified. No completion/save or live HeyGen acceptance. No additional live provider calls were made to recreate history; no Supabase mutation by test automation or synthetic History data.

Previously recorded 69/69 focused tests (including HeyGen zero upstream and privacy sentinels), 455/455 regressions, TypeScript and production build remain PASS. Admission remains PROCESS-LOCAL ONLY (4 total / 1 user); durable/distributed rate/quota enforcement is OPEN as a mandatory production-launch gate. No mobile/native or dependency work was added. Approved acceptance dev server was stopped with explicit user permission; port 3000 has no listener afterward.

Git closure is NOT authorized or performed. No next-stage authority follows. The [Reconciliation Report](../01_Engineering/Sprint_SECURITY_PRIVACY_01_ACCEPTANCE_RECONCILIATION_Engineering_Report.md) supersedes earlier pending-browser status below; previous implementation/freeze snapshots remain historical and the ordered APP roadmap remains unchanged.


## Current SECURITY_PRIVACY_01 status — 2026-10-20

**Phase 2 implemented; deterministic tests, TypeScript and production build passed; awaiting review and acceptance. NOT COMPLETE.** The user separately approved the audit, bounded implementation and resume. This entry supersedes historical NOT IMPLEMENTED/authorization statements below for current stage planning only; original APP freeze evidence remains historical.

Provider/collection API verified bearer access now supplements WEB cookies, Claude trusted prompts move server-side, ElevenLabs is bounded to existing voices, and HeyGen token issuance is disabled. Admission is PROCESS-LOCAL only (4 total / 1 per user); durable/distributed rate/quota enforcement remains a launch gate. Browser and live-provider acceptance have not run. No automatic transition to MOBILE_ARCHITECTURE_01 or MOBILE_AUTH_01, no /mobile and no new dependencies.

See [Phase 2 Engineering Report](../01_Engineering/Sprint_SECURITY_PRIVACY_01_PHASE_2_Engineering_Report.md) and [ADR-005](../02_Decisions/ADR-005-verified-provider-boundaries.md). All stage ordering and frozen product decisions below remain unchanged.


Date: 2026-10-13 (Europe/Istanbul). Status reconciled: 2026-10-14. Completed stage: **APP_STRATEGY_FREEZE_01 — Phase 2**; next stage: **SECURITY_PRIVACY_01 — NOT IMPLEMENTED**.
Status: **COMPLETE / COMMITTED / PUSHED**. Canonical recovery point: **888a66a85b74ee6086a4be4232037a794946e83a**; subject: **docs(roadmap): pivot to app-first launch strategy**.

This is the primary product roadmap and APP V1 stage-order/scope planning baseline, subordinate to the Engineering Standard and explicit user decisions. Phase 1 read-only architecture audit is approved by the user. This Phase 2 implements documentation only. No stage gains implementation authority from this roadmap.

## Product and architecture freeze

- Primary launch: **iOS + Android APP**. WEB remains supported, retained, historically valid and secondary/supporting. **WEB production launch -> native APP is SUPERSEDED**. [WEB roadmap](WEB_V1_MASTER_ROADMAP.md) remains historical/reference material; completed history is not rewritten.
- Provisional mobile architecture: **React Native + Expo development builds**, subject to MOBILE_ARCHITECTURE_01 validation. Expo Go is NOT the production compatibility target. Bare React Native is not selected; replacement requires a concrete mandatory native integration proving the approved Expo approach insufficient, plus separate decision authorization. No versions or packages selected here.
- Least-disruptive repository direction: existing Next.js project stays at repository root; a separate /mobile project may be created later in MOBILE_ARCHITECTURE_01. No move to apps/web, monorepo creation or separate mobile repository now. Future monorepo migration requires a separate evidence-based decision.
- Existing Next.js server/API layer remains the trusted backend. Anthropic / ElevenLabs / HeyGen provider account secrets remain server-only and must never be embedded in the mobile application. Existing Supabase persistence/ownership stays server controlled.
- Native client may authenticate with Supabase. Mobile-to-Talentry API access requires an explicit authenticated native token path; server verifies native identity and derives ownership. WEB cookie auth remains supported. Browser cookies are NOT assumed to work unchanged in React Native. Exact implementation belongs to MOBILE_AUTH_01 / SECURITY_PRIVACY_01.
- MOBILE_INTERVIEW_CORE_01 first establishes a reliable native interview flow; initial core may retain typed answers. **Spoken answers are an APP V1 target in MOBILE_MEDIA_01**. Microphone/media must be truthful and permission-safe. Camera remains intended if technically viable within the approved architecture. Realistic avatar / HeyGen is conditional, not a mandatory launch blocker at this freeze; compatibility must be proven before becoming mandatory. Current microphone UI does not establish speech input; existing camera/media flow is not APP-ready evidence.
- **APP V1 must be PAID-CAPABLE**. MOBILE_SUBSCRIPTION_PAYMENTS_01 covers iOS and Android subscriptions, purchase restoration, entitlement state, renewal/cancellation, account/entitlement linkage and trusted backend entitlement verification. Trial/free-tier decisions require later approval. No prices, tiers, trial duration, store commission assumptions, payment vendor/package or current store policy details selected. Store specifics: **REQUIRES CURRENT POLICY VERIFICATION AT IMPLEMENTATION TIME**.

Decision record: [ADR-004](../02_Decisions/ADR-004-app-first-launch-strategy.md).

## Ordered APP V1 critical path

| Order | Stage | Planning responsibility |
|---|---|---|
| 01 | APP_STRATEGY_FREEZE_01 | COMPLETE / COMMITTED / PUSHED |
| 02 | SECURITY_PRIVACY_01 | Next implementation-facing stage; shared trust/security contracts |
| 03 | MOBILE_ARCHITECTURE_01 | Validate Expo development builds and later /mobile foundation |
| 04 | MOBILE_AUTH_01 | Native identity/token access preserving WEB cookies |
| 05 | MOBILE_INTERVIEW_CORE_01 | Reliable native interview core; typed answers initially permitted |
| 06 | MOBILE_MEDIA_01 | Spoken-answer target; truthful permissions; camera/avatar viability |
| 07 | SCORING_TRUST_01 | Scoring trust and evaluation boundaries |
| 08 | SESSION_RESUME_01 | Explicit restart/resume/checkpoint decision and implementation scope |
| 09 | MOBILE_RESULT_HISTORY_01 | Native Result/History compatibility and owner privacy |
| 10 | MOBILE_DASHBOARD_01 | Native Dashboard scope |
| 11 | MOBILE_ACCOUNT_01 | Native account scope and lifecycle decisions |
| 12 | MOBILE_SUBSCRIPTION_PAYMENTS_01 | Paid-capable subscriptions and backend entitlements |
| 13 | MOBILE_LOCALIZATION_01 | TR/EN/DE application language separate from interview language |
| 14 | MOBILE_ACCESSIBILITY_01 | Native accessibility acceptance |
| 15 | CORE_AUTOMATION_01 | Core regression automation |
| 16 | PERFORMANCE_COST_01 | Runtime performance and cost controls |
| 17 | LEGAL_PRIVACY_01 | Legal/privacy release readiness |
| 18 | DEPLOYMENT_ENVIRONMENT_RELEASE_01 | Grouped deployment, environment and release controls |
| 19 | OBSERVABILITY_01 | Operational visibility with private-content protection |
| 20 | APP_BETA_RELEASE_01 | APP beta acceptance |
| 21 | APP_RELEASE_CANDIDATE_01 | APP release-candidate evidence |
| 22 | APP_PRODUCTION_LAUNCH_01 | Separately authorized iOS + Android production launch |

Stage names/order are the APP V1 planning baseline. Later stages may be split only if implementation evidence requires it. Grouped deployment/environment/release work does not erase historical WEB DEPLOYMENT_ARCHITECTURE_01, ENVIRONMENT_SPLIT_01 or CI_CD_RELEASE_01 stages. Incomplete WEB-specific launch work is deferred/reclassified to the secondary WEB track; shared concerns follow the APP path above. No old WEB evidence is newly executed here.

## Why SECURITY_PRIVACY_01 comes next

Provider API trust boundaries are shared by WEB and APP. Native APP requires explicit authenticated API access; provider cost/resource abuse controls, prompt/private-content logging hardening, timeout/error/response contract hardening and native bearer-token/API compatibility must be designed without breaking WEB cookie auth. These precede mobile implementation. **SECURITY_PRIVACY_01 is NOT IMPLEMENTED and not authorized for execution by this freeze**; its own audit and scope approval remain required.

## Completed foundations retained and frozen

ROADMAP_FREEZE_01, INTERVIEW_RELIABILITY_01, COMPLETION_IDEMPOTENCY_01 and ROUTE_INPUT_HARDENING_01 remain completed committed foundations, not reopened or redesigned without proven incompatibility and separate authorization. ROADMAP_FREEZE_01 remains valid historical WEB planning; only the primary launch sequence is explicitly superseded.

Preserve completion UUID identity; insert-first persistence; 201 first save; 200 matching replay; generic 409 conflict; no overwrite; server-derived ownership; owner-scoped privacy; duplicate-submit protection; busy-End protection; question identity / one answer consumption; no Q6; stale async invalidation; feedback-only retry; immutable completion answer/evaluation/duration retry semantics; zero-answer / partial-answer behavior; canonical displayed/spoken/saved question alignment; canonical setup validation intent; existing interview/history compatibility.

History retains **NATURAL-RECORD DEFERRED ACCEPTANCE**; no synthetic History seeding or new count asserted. Prior PDF deployed-runtime and wrong-owner live DELETE qualifications remain historical acceptance boundaries, not silently closed.

## Current state and recovery boundary

- Branch: feature/auth-foundation.
- Recovery base before APP freeze: f780cebf3378d5281e6c63fe10aabe4ca7308106 (fix(interview): harden route and input boundaries).
- Pre-change HEAD equals local origin/feature/auth-foundation; clean tree, no ahead/behind. No remote fetch performed.
- APP_STRATEGY_FREEZE_01: COMPLETE / COMMITTED / PUSHED. Canonical recovery point: 888a66a85b74ee6086a4be4232037a794946e83a; subject: docs(roadmap): pivot to app-first launch strategy. The pre-change base above is historical, not current HEAD.
- Primary roadmap: APP_V1_MASTER_ROADMAP; primary launch: iOS + Android APP; WEB: secondary/supporting track.
- Next planned stage: SECURITY_PRIVACY_01 — NOT IMPLEMENTED.
- Mobile application code: NOT STARTED. Expo / React Native packages: NOT INSTALLED. /mobile: NOT CREATED.

## Deferred / unresolved decisions

The following remain explicit future decisions, not selections made by this freeze:

| Decision | Future boundary |
|---|---|
| Exact Expo / React Native versions; exact native package set | MOBILE_ARCHITECTURE_01 |
| Speech-to-text architecture/provider; camera/avatar scope; whether HeyGen remains in APP V1 | MOBILE_MEDIA_01 after compatibility proof |
| Restart/resume/checkpoint policy | SESSION_RESUME_01 |
| Rate-limit architecture and numeric limits; native API token verification implementation | SECURITY_PRIVACY_01 / MOBILE_AUTH_01 |
| Hosting/runtime choice; bundle identifiers; signing ownership; final CI/CD | MOBILE_ARCHITECTURE_01 / DEPLOYMENT_ENVIRONMENT_RELEASE_01 as appropriate |
| Payment tiers/prices/trials; current Apple/Google store policies | MOBILE_SUBSCRIPTION_PAYMENTS_01; REQUIRES CURRENT POLICY VERIFICATION AT IMPLEMENTATION TIME |
| Push notification scope | Separate product scope approval |
| Account deletion/retention details | MOBILE_ACCOUNT_01 / LEGAL_PRIVACY_01; legal constraints identified before dependent coding |
| CV/MFA scope | Separate explicit product/security decisions |

Career Level, XP, gamification, badges, skill trees and advanced premium career progression remain outside MVP. Supported application languages remain tr/en/de; application and interview languages are separate. Existing approved design tokens and product rules remain intact.

## Stage governance

Audit -> explicit scope approval -> scoped implementation -> required validation -> immutable dual reports -> acceptance review -> explicitly authorized Git closure. No next-stage execution, source changes, packages, /mobile, native projects, schema/migrations, secrets, provider calls or Supabase operations in this freeze. Documentation validation only; no TypeScript, production build, dev server or browser acceptance. No staging/commit/push until explicit authorization.


## NEXT15_SECURITY_UPGRADE_GATE_01 — approved future gates (2026-10-21)

Documentation-only planning update authorized during Next 15 acceptance. No database, schema, grant, policy, dependency or mobile change is implemented by this entry.

### Supabase explicit Data API grants

Supabase's announced 30 October 2026 rollout applies the new-table explicit-grant behavior to existing projects; new-project rollout began earlier. Existing tables keep their current grants. Source: [official Supabase changelog](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically).

Every future public-schema table migration must define least-privilege explicit GRANTs, RLS state and required policies together in the same migration. Do not blindly grant anon/authenticated CRUD. Grant only the roles and operations the approved access contract requires, including service_role only where appropriate.

Future deployment gate: fresh project, preview branch and supabase db reset verification must check Data API grants, RLS, policies and expected API accessibility, including denied access. Existing tables and migrations are not altered now.

### Framework forward gates

- MOBILE_ARCHITECTURE_01 includes NEXT16_READINESS_GATE.
- DEPLOYMENT_ENVIRONMENT_RELEASE_01 includes SUPPORTED_NEXT_BASELINE_GATE.
- Next 16.4.1 is not implemented now. The controlled target remains Next 15.5.28.
- Do not introduce new Next 15 patterns that impede a later clean Next 16 migration; use fully async request APIs without temporary synchronous compatibility casts.
- These are deferred gates, not authorization to begin another stage or install dependencies.


## NEXT15_SECURITY_UPGRADE_GATE_01 — browser acceptance reconciliation (2026-10-21)

Status: APPROVABLE FOR GIT CLOSURE; Git closure itself is NOT authorized. Branch feature/auth-foundation, committed base 74e699b7c8ae10a232426364907d5194d8819eb6. This entry supersedes pending-browser statements for current planning only; immutable Phase 2 and precheck reports remain unchanged.

User-supervised evidence: WEB login succeeded, Dashboard loaded, logout succeeded, private route redirected to login, and login again succeeded. One interview started normally; Q1 rendered in text and audio, the submitted answer received feedback, and Q2 was a different question rendered in text and audio. User then confirmed History opened, one existing owned result opened, back navigation worked, and no visible error occurred. No automated credential entry or interview action. No live completion/save/delete acceptance or synthetic record creation; no Network proof of absence of persistence requests claimed.

Recovery smoke observed by agent: forgot-password renders; direct reset-password renders checking then unavailable as expected without a recovery callback. No reset email requested/consumed and no password mutation. PDF browser download NOT TESTED; deterministic PDF parser/tracing results remain prior evidence. Captured warning/error console for the retained acceptance tab is empty at final inspection; this is limited to captured logs and is not exhaustive Network evidence.

Verified package/lock/installed versions: Next 15.5.28, React/ReactDOM 19.3.1, @types/react and @types/react-dom 19.3.0, transitive sharp 0.35.5. Prior 611/611 deterministic tests, TypeScript, production build and PDF tracing PASS carried forward, not rerun for this documentation reconciliation.

Npm audit: 18 entries (13 moderate, 3 high, 2 critical), grouped triage in acceptance precheck Engineering Report. No proven critical/high reachable application-runtime blocker. Inactive HeyGen/nanoid conditions classified C; PostCSS/source-map build/dev dependencies classified B, requiring separate remediation before production. No dependency changes/fixes/overrides or lifecycle approvals in acceptance. core-js 3.49.0 pending funding-banner script does not generate runtime assets and is non-blocking.

Approved forward gates remain: public-schema migrations must jointly define explicit least-privilege GRANTs, RLS state and policies; fresh-project/preview/db-reset deployment checks must verify accessibility and denial. MOBILE_ARCHITECTURE_01 includes NEXT16_READINESS_GATE; DEPLOYMENT_ENVIRONMENT_RELEASE_01 includes SUPPORTED_NEXT_BASELINE_GATE. No Next 16 implementation, schema change, /mobile or next stage.

Current status evidence: [Acceptance Summary](../01_Engineering/Sprint_NEXT15_SECURITY_UPGRADE_GATE_01_ACCEPTANCE_RECONCILIATION_Summary.md) and [Engineering Report](../01_Engineering/Sprint_NEXT15_SECURITY_UPGRADE_GATE_01_ACCEPTANCE_RECONCILIATION_Engineering_Report.md). Dev server session 88187 is left running; no shutdown instruction received. No staging, commit or push.
