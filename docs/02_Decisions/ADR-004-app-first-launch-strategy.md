# ADR-004: APP-first launch strategy

## Status

Strategic decisions explicitly authorized by user for APP_STRATEGY_FREEZE_01 Phase 2; documentation implemented, acceptance review pending; NOT YET COMMITTED / PUSHED. React Native + Expo development builds is provisional architecture direction, not compatibility proof or package approval.

## Date

2026-10-13 (Europe/Istanbul).

## Context

User approved Phase 1 read-only architecture audit and authorized Phase 2 documentation only. Existing Next.js WEB foundations are retained; the prior WEB production launch -> native APP assumption is explicitly superseded. Recovery base: f780cebf3378d5281e6c63fe10aabe4ca7308106 on feature/auth-foundation, matching local origin ref with a clean initial tree.

## Decision

[APP_V1_MASTER_ROADMAP](../03_Roadmap/APP_V1_MASTER_ROADMAP.md) is the primary roadmap for iOS + Android APP launch. WEB remains supported and secondary/reference; completed WEB evidence remains valid and immutable.

Use provisional React Native + Expo development builds, validated in MOBILE_ARCHITECTURE_01. Expo Go is not the production compatibility target. Bare React Native is not selected; only a concrete mandatory native integration proving Expo insufficient can justify a separately authorized replacement. Versions/packages remain unresolved.

Retain root Next.js project and trusted server/API backend, existing Supabase persistence/ownership and server-derived owner privacy. A separate /mobile may be created later; no apps/web move, monorepo or separate repository now. Future monorepo migration needs separate evidence-based decision.

Anthropic, ElevenLabs and HeyGen provider account secrets remain server-only, never embedded in mobile. Native client may authenticate with Supabase; mobile API requires explicit authenticated native token access with server-verified identity/ownership. Preserve WEB cookie auth; do not assume browser cookies transfer unchanged. Exact token verification belongs to SECURITY_PRIVACY_01 / MOBILE_AUTH_01.

Reliable native interview core precedes media and may initially use typed answers. Spoken answers are an APP V1 target in MOBILE_MEDIA_01. Truthful, permission-safe microphone/media behavior is required. Camera is intended subject to technical viability. Realistic avatar / HeyGen is conditional, not a mandatory launch blocker; prove compatibility first. Existing mic UI is not speech-input implementation and current camera/media is not APP-ready evidence.

APP V1 is paid-capable. Dedicated MOBILE_SUBSCRIPTION_PAYMENTS_01 covers both platform subscriptions, restoration, entitlement state, renewal/cancellation, account linkage and trusted backend verification. Prices, tiers, trials, commission assumptions and vendors/packages remain unresolved. Store policy specifics: **REQUIRES CURRENT POLICY VERIFICATION AT IMPLEMENTATION TIME**.

SECURITY_PRIVACY_01 is next, before mobile implementation, for shared provider auth/cost/privacy/logging and timeout/error/response contracts and native bearer-token compatibility preserving WEB auth. No security implementation authorized now.

## Alternatives considered

Prior WEB-first launch sequence is superseded by explicit user decision; historical roadmap retained. Bare React Native, monorepo migration, apps/web relocation and separate mobile repository are not selected. No alternative implementation path is introduced.

## Consequences

APP stage names/order are now the planning baseline; grouped release/environment work preserves historical WEB stages. Completed ROADMAP_FREEZE_01, INTERVIEW_RELIABILITY_01, COMPLETION_IDEMPOTENCY_01 and ROUTE_INPUT_HARDENING_01 remain frozen; the roadmap lists all protected reliability, identity, ownership and natural-record History invariants. Incomplete WEB-specific launch work becomes secondary/deferred. No source/runtime change occurs.

## Risks

Expo/provider compatibility, speech-to-text, camera/avatar/HeyGen scope, native token verification, rate limits, resume policy, hosting, payment details/current store policies, push notifications, account deletion/retention, CV/MFA, bundle identifiers, signing and CI/CD remain unresolved in the roadmap decision register. This ADR proves no native compatibility, operational readiness or store compliance. Security is not implemented. No synthetic History data permitted.

## Rollback approach

Any future strategy reversal or architectural replacement requires explicit authorization and a new evidence-based decision record. Preserve this ADR, historical WEB roadmap and immutable sprint reports; do not reset, delete or rewrite completed foundations.

## Related sprints

APP_STRATEGY_FREEZE_01 (current Phase 2); ROADMAP_FREEZE_01; INTERVIEW_RELIABILITY_01; COMPLETION_IDEMPOTENCY_01; ROUTE_INPUT_HARDENING_01. SECURITY_PRIVACY_01 and MOBILE_ARCHITECTURE_01 are future scoped stages, not started by this record.
