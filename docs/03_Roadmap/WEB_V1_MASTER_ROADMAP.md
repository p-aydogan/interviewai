# WEB V1 Master Roadmap

Date: 2026-10-06 (Europe/Istanbul). Stage: ROADMAP_FREEZE_01.
Status: Documentation implementation complete; freeze review/acceptance pending.
Canonical WEB V1 stage-order and scope authority, subordinate to the Engineering Standard and explicit user decisions. Planning only; no automatic implementation authority.

## Current safe foundation

Repository: C:\Users\p-ayd\interviewai. Branch: feature/auth-foundation.
Verified HEAD and local origin/feature/auth-foundation: 317c221b576abe5e39ac4e0e79fe77ea33fe754f, feat(interviews): add owner-authorized deletion. Initial working tree clean. No remote fetch or future commit asserted; historical pre-commit snapshots remain historical.

Pre-auth onboarding; real signup/login/email verification; hardened password recovery; Dashboard shell/navigation; Interview Setup; existing Live Interview; completion persistence; persisted Result; My Interviews/History; cursor pagination implementation; local PDF export; profile display-name editing; owner-authorized interview deletion.

Recorded acceptance qualifications: deterministic pagination and available <20 browser behavior accepted; real 21+ deferred below. PDF local acceptance PASS, deployed packaging/resource smoke pending. Owner deletion accepted, wrong-owner live DELETE not completed; deterministic coverage remains. Prior validation is historical evidence, not rerun here. Completed foundations stay closed unless direct evidence and separately approved scope require changes.

## WEB V1 product core

Prepare → Run Interview → Receive Feedback → Persist Result → Browse History → Export PDF → Delete Interview → Manage minimum account identity → Recover account safely.

Required hardening: interview transition correctness; completion idempotency; route/input validation; cost-bearing API security/privacy; scoring trust; TR/EN/DE application behavior; accessibility/responsiveness; truthful media/device behavior; operational auth readiness; regression automation; production release readiness.

Application language and interview language remain separate. No fabricated business modules or fake business data.

## Frozen completed foundations

- AUTH/RECOVERY: Supabase PKCE; verified recovery AMR; bounded recovery continuity marker; fail-closed reset behavior.
- PROFILE: display-name-only V1; user.updated_at reconciliation; dirty-draft conflict protection.
- PDF: jsPDF Node renderer; owner-authorized PDF route; persisted interview language controls labels; saved content remains untranslated.
- OWNERSHIP: server-derived authenticated owner; owner predicates; foreign/nonexistent privacy behavior.
- HISTORY: canonical /interviews; cursor/keyset architecture; no synthetic seeding requirement.
- DELETE: permanent owner-authorized Result-page hard delete.

Do not reopen these foundations opportunistically or implicitly change approved product/design decisions.

## Critical-path stage order

```text
01 ROADMAP_FREEZE_01
02 INTERVIEW_RELIABILITY_01
03 COMPLETION_IDEMPOTENCY_01
04 ROUTE_INPUT_HARDENING_01
05 SECURITY_PRIVACY_01
06 SCORING_TRUST_01
07 SESSION_RESUME_01
08 HISTORY_V1_FINAL_01
09 DASHBOARD_V1_01
10 LOCALIZATION_V1_01
11 ACCESSIBILITY_RESPONSIVE_01
12 ACCOUNT_V1_01
13 AUTH_OPERATIONS_01
14 MEDIA_PROVIDER_V1_01
15 CORE_AUTOMATION_01
16 PERFORMANCE_COST_01
17 LEGAL_PRIVACY_01
18 DEPLOYMENT_ARCHITECTURE_01
19 ENVIRONMENT_SPLIT_01
20 CI_CD_RELEASE_01
21 OBSERVABILITY_01
22 STAGING_RELEASE_01
23 WEB_RELEASE_CANDIDATE_01
24 WEB_PRODUCTION_LAUNCH_01
```

Stage names define ordering/planning, not implementation authorization. Conditional stage names do not turn features into requirements. Identify legal retention/deletion requirements before dependent coding; the later legal stage verifies release readiness. Deployment-dependent auth/media/PDF/performance checks close on the selected environment before release. HISTORY_V1_FINAL_01 may retain natural-record deferred acceptance without blocking unrelated WEB work.

## Feature classification

| Classification | Scope |
|---|---|
| WEB V1 required/core | Existing interview flow; persisted Results; History; PDF; interview deletion; profile display name; safe auth/recovery; launch hardening |
| WEB V1 conditional/product decision | Session resume; CV-based questions; HeyGen/avatar; MFA; password change; account/data deletion; paid plans/billing |
| V1.1/post-launch | History search/filter; favorites/tags; History virtualization; advanced Dashboard modules; Recommended Jobs; advanced analytics; notifications; avatar/profile photo; email editing; device/session management |
| Explicitly out of MVP | Career Level; XP; badges; skill trees; gamification system; advanced premium career progression |
| Post-WEB-launch | Mobile/native APP architecture and implementation |

Premium UI is not an implied V1 business module; billing requires a launch-model decision. Safe session handling is required even though device/session management UI is deferred. Interview deletion does not establish complete account/data erasure.

## Product-decision gates

Explicit user/product decisions required before dependent coding:

| Gate | Decision |
|---|---|
| Session resume | Whether included in V1; storage duration; restart/discard; privacy/device scope |
| Account lifecycle | Password change; account deletion; retained data; deletion boundaries |
| Avatar | Whether realistic avatar is mandatory for WEB V1; preserve documented product direction pending decision |
| CV | Whether CV-based questions enter V1; input/storage/retention contract; optional intended feature |
| MFA | Whether included in V1 and authentication scope |
| Billing | Free versus paid launch |
| Hosting | Final provider/runtime/resource limits |
| Environment | Dev/staging/production separation and data policy |
| Mobile | Post-launch architecture decision, outside WEB V1 implementation |

Do not silently convert conditional features into requirements or discard documented product direction.

## Current technical launch blockers

Cost-bearing Claude / ElevenLabs / HeyGen-token route protection; Claude client-supplied prompts/private-content logging/request constraints; ambiguous completion retry can duplicate records; interview transition race / stale async risks; invalid interviewer input can create undefined interviewer state; fragmented application localization / root lang; microphone UI currently implies capture although acquisition uses audio:false. These are audited unresolved risks, not fixes completed by this documentation stage.

Static interview findings: submit lacks an immediate duplicate guard; question generation/completion have separate guards; stale feedback/generation lack current-session protection; completion retains a mutable answer array. Five-question/four-answer observation is an investigation, not a proven persistence defect. Client transition guards do not solve server persistence idempotency.

## Operational/release gates

ENVIRONMENT PURPOSE UNKNOWN. Verify intended environment/account and environment separation before operations. Production email sender/delivery readiness; deployed PDF/font packaging/resources; provider failures and cost controls; approved privacy/retention/legal contract; final hosting architecture; CI/CD release controls; observability; staging acceptance; release-candidate evidence; separately authorized production launch remain open. Local build acceptance is not deployed readiness. Natural-record pagination and wrong-owner live DELETE retain explicit acceptance qualifications.

## Natural-record pagination decision

HISTORY_PAGINATION_01: NATURAL-RECORD DEFERRED ACCEPTANCE. User-verified live baseline on 2026-10-06: 11 real records. Do NOT create synthetic interviews merely to reach 21. Deterministic pagination tests and existing <20 browser behavior remain accepted. Real 21+ browser acceptance waits until ordinary project testing/development naturally produces at least 21 records. This acceptance gap does NOT block unrelated WEB development. Earlier synthetic seed plans are historical/superseded for current planning; preserve historical entries and old reports. No Supabase query or mutation performed in this stage.

No seed, polling or database operations authorized by this plan.

## Stage governance

Read-only audit → explicit scope approval → scoped implementation → required validation → immutable dual reporting → acceptance review → separately authorized Git finalization. Follow the Engineering Standard. Never begin the next stage automatically. No staging/commit/push without explicit authorization; push is separately authorized. This documentation-only stage requires git diff --check and scope/content review; no application tests/build because no executable files change.

## Next planned technical stage — not authorized for implementation

INTERVIEW_RELIABILITY_01 is the next planned technical stage, NOT STARTED. This roadmap authorizes PLANNING only. Actual implementation starts only after its own read-only audit and explicit scope approval.

Objective: make existing Interview state transitions deterministic and safe without redesigning the Interview product.

Planned IN scope: submit / skip / next / end transition matrix; duplicate-submit exclusion; mutual exclusion between session transitions and completion; final-question/index correctness; stale async response protection; stable answer snapshot for evaluation/save; zero-answer and partial-answer behavior; feedback/question-generation failure recovery; canonical displayed/saved/spoken question alignment.

Planned OUT scope: server persistence idempotency; session resume; provider replacement; avatar redesign; visual redesign; scoring trust redesign; History changes; auth changes; schema/RLS changes; localization overhaul; new dependencies.

Preserve the existing completion payload, evaluation validation and persisted UUID handoff. Primary inspected source is app/interview/page.tsx with presentational InterviewWorkspace and LiveInterviewControls; exact future file scope requires separate approval.
