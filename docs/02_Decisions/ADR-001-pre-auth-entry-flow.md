# ADR-001: Pre-auth entry flow

- Date: 2026-09-21
- Status: Architecture approved by the PREAUTH_ONBOARDING_01 implementation request; implementation acceptance pending runtime review.
- Related sprint: PREAUTH_ONBOARDING_01

## Context and decision

Root previously redirected every visitor to interview setup. Root now uses the existing server-only getAuthenticatedUser helper: authenticated visitors go to /dashboard, and unauthorized visitors receive the pre-auth client flow. No user, session, or token is passed to that client.

The welcome screen and three introduction panels share /. Separate /welcome and /onboarding routes were considered during forensic review and rejected as unnecessary routing surface. Direct auth and recovery routes retain their existing behavior.

The UX-only localStorage value talentry.onboarding.v1="complete" is written on explicit Skip introduction or a final-panel auth action. It is not authentication, contains no personal data, and never gates auth routes. Reads happen after mount; reads and writes tolerate unavailable storage. Replay leaves the saved flag intact. Application language reuses interviewai_uilang (tr/en/de), independently of interview language.

## Consequences and limitations

Result restart links and the legacy /result redirect now explicitly target /interview/setup to preserve their prior destination. No middleware, DB/schema, auth utility, or dependency change is required. Existing auth screens remain English and unchanged; their decorative language menu is a known limitation. Locally stored preferences can be unavailable or cleared, in which case the introduction may repeat. Initial default-language welcome markup may briefly precede restored preferences after hydration. Runtime acceptance is pending.

## Rollback boundary

With separate authorization, reverse only this sprint's root change and three result destinations and remove the new pre-auth implementation. The local preference is harmless if left behind. Preserve historical reports and this decision record; document any reversal separately. No migration or provider rollback is needed.
