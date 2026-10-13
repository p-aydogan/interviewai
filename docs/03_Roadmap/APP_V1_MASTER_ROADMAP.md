# APP V1 Master Roadmap

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
