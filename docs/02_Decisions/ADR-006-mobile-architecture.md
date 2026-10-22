# ADR-006: Bounded native mobile architecture

## Status / Date

2026-10-22 (Europe/Istanbul). Architecture and bootstrap explicitly authorized;
validated implementation awaits review. MOBILE_ARCHITECTURE_01 is NOT COMPLETE.
No Git closure, native/cloud builds, signing or next-stage authority.

## Context

APP-first is canonical; iPhone, Android phone, iPad and Android tablet are APP V1
targets. Base feature/auth-foundation, d4e1dd55657766eb414854ec1993164c239e154f.
User selected SDK 58 stable and Expo Router (superseding Phase 1's direct React
Navigation proposal). Official default template 58.0.26 verified before creation;
Node 24.18.0 satisfies RN's ^22.13.0 || ^24.3.0 || >=26.0.0 requirement.

## Decision

Expo 58.0.17, React Native 0.88.0, React 19.3.0, Expo Router 58.0.25 and development
client 58.0.14. Expo Go is not the compatibility target. Root Next remains, with
isolated /mobile manifest/lockfile/node_modules and strict TypeScript. No workspaces.
Root tsconfig excludes mobile/**. Metro keeps Expo default hierarchical lookup
and rejects all external resolved files except three approved pure interview helpers.
Completion proof injects a synthetic UUID; no root helper changes or duplicated rules.

Supabase is auth-only. SecureStore asynchronous two-bank bounded chunks use versioned
commit metadata, validation and fail-closed errors. No plaintext AsyncStorage or
custom encryption dependency. Hydration verifies getUser(access_token), gates private
routes and invalidates old identity generations. AppState owns foreground refresh.
Logout closes private navigation and clears credentials; full auth/link/recovery UX
is deferred. Native storage transaction/erasure behavior is not yet device-proven.

Talentry backend owns application data/providers. Expo fetch transport rejects redirects;
typed API client restricts origin, sanitizes failures, bounds consumption and supports
cancellation/timeout without retries. No API request from this diagnostic. Future
completion replay preserves frozen identity/payload. Detail/delete/PDF need separately
approved bearer coverage, with no direct Supabase data bypass.

Width/font-scale compact/medium/expanded classes are provisional probes; expanded uses
two panes. Token subset derives from approved CSS. Real device/accessibility acceptance
remains open. EAS development/simulator profiles express future builds only; no production
identifiers, projectId, signing or account linking. Interview/recovery entry implementations
are deferred to their stages; public/private group structure is available.

## Alternatives considered

Bare React Native, root relocation to apps/web, workspace conversion and separate repo
were not selected. No mandatory integration invalidates the authorized Expo path.
Root WEB React 19.3.1 is not imposed on mobile.

## Consequences / Risks

15 mobile tests, TypeScript, Doctor 20/20 and both Hermes exports pass. Root 611 tests,
TypeScript/build pass. No native installation, real auth, secure-store device acceptance,
redirect/device acceptance or tablet acceptance. Chunk metadata is not a proven native
transaction. Persistent storage failures cannot guarantee physical erasure. Production
UUID adapter remains deferred. Template dependency superset remains; 19 high audit entries
trace to two tooling advisory chains, absent from runtime maps. Root 18-entry audit debt
and durable/distributed provider quota production gates remain open. No production approval.

## Rollback approach

Future removal/replacement needs separate authorization. Preserve root baseline and
historical reports; no automatic reset, restore, deletion or Git mutation.

## Related stages and preserved gates

APP_STRATEGY_FREEZE_01; SECURITY_PRIVACY_01; NEXT15_SECURITY_UPGRADE_GATE_01;
MOBILE_ARCHITECTURE_01_PHASE_2; future MOBILE_AUTH_01/MOBILE_MEDIA_01/SESSION_RESUME_01.
NEXT16_READINESS_GATE remains deferred: mobile consumes HTTP contracts, not Next imports.
New public-schema migrations after the approved 30 October 2026 policy change jointly
define least-privilege GRANTs, RLS and policies, with fresh/preview/db-reset verification.
No schema, providers, media, HeyGen, payments, push or resume persistence changes.
