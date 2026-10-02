# Sprint PROFILE_EDIT_01 Summary

- Title: Display-name-only profile editing
- Date: 2026-10-02
- Branch: feature/auth-foundation
- Starting HEAD and remote-tracking reference: 56b9cdf
- Starting working tree: clean
- Status: IMPLEMENTATION + AUTOMATED VALIDATION + LOCAL BROWSER ACCEPTANCE: PASS. Documentation review pending; Git actions not authorized.
- Goal: Allow the authenticated user to edit and persist only their display name in the existing account shell.
- Approval status: Discovery and bounded implementation were authorized. The user has confirmed local browser/runtime acceptance COMPLETE and PASS. No stage, commit, push, or next stage authorized by this report.

## Completed behavior

- One-field inline profile editor; email remains visible and read-only.
- Writes only authenticated Supabase updateUser({ data: { display_name: normalizedValue } }). No target user ID, admin client, credentials, or authorization fields.
- No profile table, application profile API, schema/configuration change, or dependency.
- String validation, trim/collapse whitespace, 1-80 Unicode code points, remaining C0/DEL/C1 control rejection; international text and punctuation preserved. Blank/clear-name saves unsupported; existing absent names remain valid until edited.
- Synchronous duplicate-save guard, unchanged-value no-op, provider-confirmed local value, retryable errors, Cancel, and localized TR/EN/DE status messages.
- Clean views refresh from server-projected identity; dirty drafts survive external changes and Save is blocked until explicit reconciliation or Cancel.
- USER_UPDATED schedules router.refresh outside the auth callback. Focus provides a two-second-bounded fallback; no polling. Successful save also requests a server refresh.
- Server projection and recovery USER_UPDATED fail-closed behavior remain unchanged.

## Modified implementation files

- app/profile/page.tsx
- components/account/AccountPageContent.tsx
- components/account/account-copy.ts
- components/account/useAccountSession.ts
- styles/talentry-account.css

## Created files

- components/account/ProfileEditor.tsx
- components/account/useProfileEditor.ts
- lib/account/profile-display-name.ts
- lib/account/profile-display-name.test.cjs
- docs/01_Engineering/Sprint_PROFILE_EDIT_01_Summary.md
- docs/01_Engineering/Sprint_PROFILE_EDIT_01_Engineering_Report.md

## Validation results

Executed in the requested order:

1. node --test lib/account/profile-display-name.test.cjs: exit 0; 49/49 PASS after the snapshot correction, zero failures/skips (initial implementation: 41/41).
2. node --test components/auth/recovery-session.test.cjs: exit 0; 34/34 PASS, including external user-update recovery revocation.
3. npx tsc --noEmit --incremental false: exit 0; PASS.
4. git diff --check: exit 0; PASS; existing LF-to-CRLF warnings.
5. Read-only Node process inspection: first sandbox attempt failed with Access denied; explicitly approved elevated retry exited 0. Four inspected Node processes had no repository, Next dev, or Next server match. No repository dev server found; no server started/stopped.
6. npm run build: exit 0; Next.js 14.2.5; compilation, types, page data, generation 22/22, optimization, and traces PASS.

Warnings/notices: two webpack cache snapshot warnings (Unable to snapshot resolve dependencies); Git LF-to-CRLF notices; npm 11.16.0 -> 12.2.0 update notices during TypeScript/build. No dependency update performed.

## Implementation checkpoint risks (historical; final acceptance below supersedes pending items)

- Browser acceptance is pending: actual Supabase persistence across refresh/logout/login, cross-account isolation, menu initials, cross-tab changes, keyboard/announcements, TR/EN/DE, and mobile usability.
- Tests compile real source in memory and use provider/React-effect doubles; they do not prove browser or deployed-provider behavior.
- No atomic multi-device conflict guarantee. Remote-device changes are observed when the server identity refreshes, including focus fallback; no Realtime subscription or polling.
- App validation does not impose a database constraint on direct metadata writes. Existing defensive server projection is unchanged.
- Drafts stay in memory and are discarded on navigation. No automatic retry or clear-name action.
- A successful profile update can revoke an open recovery form in another same-profile tab. This is the explicitly approved fail-closed behavior, not suppressed by this sprint.
- The known SDK failure-path PKCE-verifier cleanup remains unchanged; overlapping pending authentication/recovery flows are not newly guaranteed.
- PDF deployed packaging/resource acceptance remains a separate pending operational follow-up.

Project Memory and all frozen modules remain unchanged. Full diffs, interfaces, and the manual acceptance checklist are in the companion Engineering Report. Stop for review; do not commit or begin another stage automatically.

## Pre-browser snapshot correction — 2026-10-02 (historical checkpoint)

Pre-browser review found that scalar-only effect dependencies could miss A -> local save B -> fresh server A when the last server prop was still A. The authorized correction uses the authenticated user's top-level updated_at, passed unchanged as identityVersion from app/profile/page.tsx through AccountPageContent and ProfileEditor. Name fallback projection, auth guards, and the shared account refresh hook are unchanged by this correction.

Installed Auth SDK types expose updated_at separately from metadata; the SDK forwards the Auth server response. Official Supabase Auth server source confirms metadata writes use UpdateOnly, preserve updated_at in the update columns, and rely on Pop to assign the server timestamp. Detailed source links and limitations are in the Engineering Report. This is source verification, not live deployed-provider acceptance.

The hook observes both name and version. New versions reconcile repeated names; dirty drafts keep their original baseline and block Save until Use latest or Cancel. Successful saves take both name and version from the returned provider user, preventing the same successful mutation's later refresh from creating a false conflict. Missing initial versions block mutation; missing returned versions preserve the draft and do not claim success. No timestamp/token is invented, and no raw metadata or user ID is projected.

Eight added cases cover hook-level clean/dirty A/V1 -> B/V2 -> A/V3, both reconciliation actions, own-save baseline, same-name new-version conflict, missing versions, and in-flight matching-name/different-version updates. All prior coverage remains. Focused tests 49/49, recovery 34/34, TypeScript, whitespace check, and production build 22/22 all PASS, exit 0, in the prescribed order. The process inspection again required an approved elevated retry after sandbox Access denied; no dev server was found. Two webpack snapshot warnings, LF-to-CRLF warnings, and npm upgrade notices remain; no upgrade performed.

Correction changed only app/profile/page.tsx, AccountPageContent.tsx, ProfileEditor.tsx, useProfileEditor.ts, profile-display-name.test.cjs, and these two sprint reports. No new files were added by the correction. updated_at covers the whole auth user, so unrelated auth updates can conservatively require draft reconciliation. It is not an atomic revision or compare-and-swap guarantee; deployed timestamp availability/behavior and the browser A -> B -> A sequence remain manual acceptance items. Project Memory remains untouched; final acceptance/commit approval is pending.

## Final runtime acceptance — PROFILE_EDIT_01 — 2026-10-02

**IMPLEMENTATION + AUTOMATED VALIDATION + LOCAL BROWSER ACCEPTANCE: PASS**

At the 2026-10-02 documentation/pre-commit checkpoint, HEAD and local origin/feature/auth-foundation were 56b9cdf on feature/auth-foundation; PROFILE_EDIT_01 work was uncommitted. No future commit hash is asserted. The user reported the dev server manually stopped. No tests/build or browser checks were rerun during this documentation-only update; no server restart or Git mutation was performed. No next stage is authorized.

### Final architecture and name contract

Display-name-only V1 writes user_metadata.display_name through authenticated browser supabase.auth.updateUser({ data: { display_name: normalizedValue } }). No target user ID, app_metadata, service-role/admin mutation, profile table, application profile API, schema/RLS, dependency or configuration change. Email remains read-only; email/password/avatar changes are outside scope. Server projection remains defensive: display_name -> full_name -> name -> honest fallback. Metadata is display text only, never authorization.

The name contract trims leading/trailing whitespace, collapses internal whitespace runs, requires 1-80 Unicode code points and rejects remaining control characters. International Unicode, accents/diacritics and punctuation are preserved. No transliteration, first/last-name split, email-derived name or clear-name action. Existing missing-name fallback remains valid until edited.

### Identity snapshot and refresh

The server-projected editor snapshot contains projected display name and the authenticated user's top-level user.updated_at as identityVersion. This server-controlled value is separate from user_metadata and used only for identity reconciliation, never authorization. No random or client-generated version token is used.

A/V1 -> local save B/V2 -> later external/server A/V3 is recognized as a NEW snapshot even when the name repeats. Clean editors accept the fresh snapshot and update confirmed/displayed name. Dirty editors preserve the draft, detect external changes, block Save, and require explicit Use latest / Cancel reconciliation. Successful saves use the provider-returned user for confirmed name and updated_at baseline, avoiding a false conflict when that same saved snapshot returns through refresh.

USER_UPDATED schedules bounded refresh outside the auth callback; focus refresh is a bounded fallback, with no polling. Existing SIGNED_OUT/session-loss navigation is preserved. Server-projected identity remains authoritative; shared menu and clean profile views update after metadata changes.

### Recovery interaction

PROFILE_EDIT_01 did NOT modify recovery code. A successful profile metadata update emits USER_UPDATED. An open recovery form in another same-profile tab therefore remains fail-closed and becomes unavailable. This intentional behavior was LIVE-VERIFIED: the recovery tab transitioned to Reset link unavailable. It is not a regression.

### Validation evidence

Recorded final automated validation: focused profile tests 49/49 PASS; recovery regression 34/34 PASS; TypeScript PASS; git diff --check PASS; production build PASS, 22/22 pages. These existing test/build results were not rerun. Prior webpack cache snapshot warnings, LF-to-CRLF notices and npm update notices remain documented; no dependency update was performed.

### Local browser acceptance

Evidence: USER-VERIFIED PASS in Chrome normal profile, supplied by the user on 2026-10-02. This documentation step did not independently repeat the browser checks.

| Check | User-confirmed observation | Result |
| --- | --- | --- |
| A. Display-name save | /profile saved Çağrı Öztürk; profile card and menu/avatar identity updated. | USER-VERIFIED PASS |
| B. Refresh persistence | Ctrl+R retained the saved name. | USER-VERIFIED PASS |
| C. Logout/login persistence | Same-account logout/login retained the saved name. | USER-VERIFIED PASS |
| D. Cross-account isolation | Second test account did not show the first account's edited name. | USER-VERIFIED PASS |
| E. Cancel | Temporary Deneme İsim draft cancelled; persisted value unchanged. | USER-VERIFIED PASS |
| F. Blank validation | Blank/whitespace rejected; no save. | USER-VERIFIED PASS |
| G. Length validation | 81-character value rejected. | USER-VERIFIED PASS |
| H. Clean cross-tab update | Tab B saved Sekma Testi / equivalent tested value; clean Tab A updated automatically without manual refresh. No timing measurement is asserted. | USER-VERIFIED PASS |
| I. Dirty draft conflict | Tab A retained Taslak İsim after Tab B saved Dış Değişiklik; conflict notice appeared and Save was blocked. | USER-VERIFIED PASS |
| J. Use latest | Adopted current server value and cleared conflict. | USER-VERIFIED PASS |
| K. Repeated A -> B -> A | Clean view moved to temporary B; another tab restored prior A under a NEW server identity version; clean view reconciled back to A. Validates the pre-browser updated_at snapshot fix. | USER-VERIFIED PASS |
| L. Mobile | Approximately 400 x 690: editing usable, no horizontal overflow or control overlap, normal vertical scrolling. | USER-VERIFIED PASS |
| M. Autofocus/keyboard | Edit Profile focused the input; typing worked without an extra click. | USER-VERIFIED PASS |
| N. Recovery interaction | Fresh same-profile recovery form became Reset link unavailable after another tab saved profile metadata. Intentional fail-closed behavior. | USER-VERIFIED PASS |
| O. English copy | Switching application UI to English showed correct English profile-edit copy. | USER-VERIFIED PASS |
| P. German copy | Switching application UI to German showed correct German profile-edit copy. | USER-VERIFIED PASS |
| Q. Session loss while editing | Another same-profile tab logged out; dirty profile/edit tab navigated to login and the draft was not persisted. | USER-VERIFIED PASS |

Provider failure/retry and rapid duplicate submission prevention were NOT intentionally forced against the live provider. They are automated-test-covered only, not browser-tested. Other unlisted browser/device or screen-reader behavior is not newly claimed as verified.

### Remaining non-blocking limitations

- user.updated_at is a whole-auth-user version, not an atomic profile revision; unrelated auth-user changes may conservatively trigger reconciliation.
- No atomic multi-device conflict guarantee exists.
- Drafts are memory-only and discarded on navigation.
- External changes are observed through auth events/focus/refresh behavior.
- Deployed Supabase project behavior was live-tested only for the exercised flows.
- No profile-schema enforcement exists because V1 intentionally uses auth metadata.

These limitations are not blockers for the accepted V1. REPORT_EXPORT_01 deployed packaging/resource smoke remains PENDING as a deployment/operations follow-up, not a local functional blocker; PDF implementation remains closed. Unrelated deferred work remains unchanged.

### Documentation closure scope

Updated these two existing sprint reports in place and CURRENT_STATE.md, STAGE_LOG.md, DEFERRED_FIXES.md, DECISIONS_AND_RISKS.md under docs/04_Project_Memory. No duplicate reports. No code/test/dependency/config changes during this documentation step. Documentation review remains pending; no stage/commit/push or next stage is authorized.
