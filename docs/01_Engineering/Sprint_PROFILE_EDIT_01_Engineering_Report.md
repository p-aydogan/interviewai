# Sprint PROFILE_EDIT_01 Engineering Report

## 1. Report Identity

- Date: 2026-10-02
- Sprint: PROFILE_EDIT_01 — Display-name-only profile editing
- Repository: C:\Users\p-ayd\interviewai
- Branch: feature/auth-foundation
- Status: IMPLEMENTATION + AUTOMATED VALIDATION + LOCAL BROWSER ACCEPTANCE: PASS. Documentation review pending; Git actions not authorized.
- Authority: User-approved discovery and explicit bounded implementation request. No Git mutation authorized.

## 2. Sprint Objective and Boundaries

Enable authenticated display-name editing in the existing profile/account shell. Persist only auth.users.raw_user_meta_data.display_name through Supabase Auth; read as user.user_metadata.display_name.

There is no profile table, application profile API, dependency, provider configuration, or migration. Email remains read-only. Password, avatar, uploads, deletion, MFA, phone, company, job title, split names, language persistence, and all unrelated modules are outside scope.

## 3. Repository State Before Implementation

Read-only safety checks confirmed the exact repository path, branch feature/auth-foundation, HEAD 56b9cdf, and local origin/feature/auth-foundation reference 56b9cdf. git status --short was empty. No remote fetch was performed. Both report paths were absent before creation; no previous sprint report was overwritten.

The existing account pages authenticate via server getUser(), project only email/displayName/initials, and use a shared account shell. Existing display-name projection prefers display_name, then full_name, then name, with whitespace normalization and an 80-code-point display cap. Profile previously offered no editing. The account session hook handled logout/session loss but did not refresh identity on USER_UPDATED.

## 4. Architecture and Implementation Decisions

### Field and validation

validateDisplayName accepts unknown and returns a discriminated success/error result. Strings are trimmed and internal JavaScript whitespace runs collapsed to one space, matching the existing projection. The normalized result must contain 1-80 Unicode code points using Array.from, and must not contain remaining C0, DEL, or C1 control characters. Whitespace controls such as tabs/newlines normalize to spaces before remaining-control validation. Empty and whitespace-only input fail. No transliteration, accent stripping, split-name inference, email inference, or silent truncation is performed. The rule counts code points, not grapheme clusters or UTF-16 units.

Blank/clear-name mutation is deliberately unavailable. A previously absent display name is still a valid read state; Edit starts with an empty draft in that case. Existing fallback metadata is not changed or deleted. Successful edits write only display_name, which naturally takes precedence over the preserved fallbacks.

### State and persistence

The focused controller in useProfileEditor.ts is a small subscribable state store consumed through React useSyncExternalStore. It keeps confirmed name, draft, edit mode, saving state, conflict, error key, and success state. A synchronous in-flight guard precedes provider invocation. Unchanged normalized input exits Edit without a provider call. Cancel restores the latest confirmed name and clears errors/conflict without mutation.

The sole mutation is:

```ts
supabase.auth.updateUser({ data: { display_name: normalizedValue } })
```

No user ID, email, password, role, app_metadata, or authorization field is supplied. Supabase Auth authorizes the current-session update. Browser state is not an authorization boundary. The existing browser client is reused; no service-role or admin code is imported.

The controller accepts success only when the provider returns the expected valid display_name. It updates the confirmed local display, exits Edit, announces success, and requests router.refresh(). Provider errors, thrown network failures, or unconfirmed/mismatched responses preserve the editable draft and expose only localized generic retry copy. There is no automatic retry or draft storage. Disposed controllers ignore late responses/refreshes.

### Identity refresh and reconciliation

useAccountSession now schedules router.refresh() with a zero-delay timer outside USER_UPDATED callbacks. Pending same-turn events are coalesced. Focus schedules a refresh only when at least two seconds have elapsed since that hook's last refresh; there is no interval or polling. Cleanup unsubscribes and clears the timer/listeners. Existing SIGNED_OUT, absent initial session, local logout, and browser-history session handling remain unchanged. A queued refresh is suppressed after logout navigation begins.

Successful save explicitly requests a refresh as well; the SDK event can cause a second bounded refresh in the saving tab. This is not an ongoing loop or polling. Re-rendered server props remain the authoritative shared identity source; raw provider User/metadata is not added to component props. The existing user-identity.ts projection is untouched.

Clean editors adopt changed server-projected values. Dirty editors preserve the draft, display a localized conflict notice, and block Save until Use latest value or Cancel. Use latest copies the latest confirmed name into the draft. A matching refresh arriving during the editor's own in-flight save does not falsely conflict with that save. A differing update observed during a save remains a conflict rather than being overwritten by its late response. No atomic multi-device compare-and-swap/versioning is implemented. Cross-device changes are discovered upon a server refresh, including focus, not via a new Realtime feed.

### Recovery interaction

USER_UPDATED is not suppressed or altered. The existing recovery controller revokes externally updated recovery eligibility; all 34 existing tests pass, including this behavior. Profile saves can therefore make an open recovery form unavailable in another same-profile tab, as explicitly approved. Recovery source and configuration are untouched. The previously identified SDK failure-path PKCE-verifier cleanup is not changed; this sprint does not claim new guarantees for overlapping pending authentication flows.

## 5. Created and Modified Files

Modified:

- app/profile/page.tsx
- components/account/AccountPageContent.tsx
- components/account/account-copy.ts
- components/account/useAccountSession.ts
- styles/talentry-account.css

Created:

- components/account/ProfileEditor.tsx
- components/account/useProfileEditor.ts
- lib/account/profile-display-name.ts
- lib/account/profile-display-name.test.cjs
- docs/01_Engineering/Sprint_PROFILE_EDIT_01_Summary.md
- docs/01_Engineering/Sprint_PROFILE_EDIT_01_Engineering_Report.md

## 6. Responsibility of Each File

| File | Responsibility |
| --- | --- |
| app/profile/page.tsx | Project the authenticated user's top-level updated_at as the profile-only identityVersion prop; retain auth guard and name projection. |
| AccountPageContent.tsx | Compose the profile editor only for the existing profile page; retain settings/help rendering. |
| account-copy.ts | TR/EN/DE profile instructions, actions, validation, conflict, saving, success, and retry copy. |
| useAccountSession.ts | Bounded server identity refresh on user-update events/focus; preserve logout behavior. |
| talentry-account.css | Light token-based form, focus, wrapping actions, and error text. |
| ProfileEditor.tsx | Semantic one-field UI, read-only email, focus, actions, and accessible feedback. |
| useProfileEditor.ts | Draft/controller transitions, provider mutation, confirmation, reconciliation, lifecycle, and React binding. |
| profile-display-name.ts | Pure normalization and validation contract. |
| profile-display-name.test.cjs | In-memory source tests for normalization, controller behavior, and account refresh effects. |
| Summary | Completed-work overview, validation, risks, pending approval. |
| Engineering Report | Full technical record, validation evidence, scope, acceptance checklist, and diffs. |

## 7. Public Interfaces, Props, or Types

- DisplayNameError: required | tooLong | invalid.
- DisplayNameResult: { valid: true; value: string } | { valid: false; error: DisplayNameError }.
- validateDisplayName(input: unknown): DisplayNameResult.
- ProfileEditor props: { identity: UserIdentity; identityVersion?: string; language: AppLanguage }. AccountPageContent passes the optional profile-only identityVersion. No raw user, metadata, or target user ID.
- createProfileEditor(initial: string, auth: Pick<browser-client-auth, 'updateUser'>, refresh: () => void, version?: string): subscribable controller exposing getSnapshot, subscribe, activate, dispose, edit, cancel, useLatest, change, reconcile(confirmed, version), and save.
- useProfileEditor(displayName?: string, identityVersion?: string): state, derived dirty flag, and controller. Its reconciliation effect observes both scalar values. Error keys map to the current language at render time.
- Editor state: confirmed/draft strings; optional provider version and draftVersion baseline; editing/saving/conflict/saved booleans; nullable validation/saveFailed error.
- Existing useAccountSession return contract remains pending, failed, sessionGone, signOut.
- AccountCopy gains only profile editing strings and typed error messages.

## 8. Accessibility Decisions

Native labeled input with a stable useId association; required semantics; no placeholder-only label. Validation links through aria-describedby and aria-invalid. Errors use role=alert; saving/success and conflict use status announcements. Edit focuses the input; leaving Edit returns focus to its trigger. Use latest returns focus to the input. Existing TalentryButton supplies native disabled/loading and aria-busy semantics. Save/Cancel and field editing are disabled during the request; Save is also disabled on conflict. Email remains text, not an editable field. Actions are keyboard operable and wrap on narrow screens. Unsaved-navigation behavior is stated in localized help copy.

User-verified acceptance now covers input autofocus/typing and the supplied approximately 400 x 690 mobile flow. Exhaustive keyboard focus-return and screen-reader announcements were not supplied as browser evidence; source review is not a runtime claim.

## 9. Styling and Token Usage

Reuses account card/shell and TalentryButton. The input uses approved surface/text/border/focus/radius/spacing/button-height tokens. Error text uses the existing danger-hover token on the white surface; invalid borders use danger. No new palette, dark auth-input import, component CSS block, animation, Tailwind, or styled-jsx. Shared TalentryButton reduced-motion rules remain in effect. Account page normal scrolling remains unchanged.

## 10. Validation Commands and Exact Results

Executed sequentially in the requested order; no validation failure occurred:

| Command/check | Exact result |
| --- | --- |
| node --test lib/account/profile-display-name.test.cjs | Correction run: exit 0; tests 49, pass 49, fail 0, cancelled 0, skipped 0, todo 0. Initial implementation was 41/41. |
| node --test components/auth/recovery-session.test.cjs | Exit 0; tests 34, pass 34, fail 0, cancelled 0, skipped 0, todo 0. |
| npx tsc --noEmit --incremental false | Exit 0; no TypeScript diagnostics. npm update notice only. |
| git diff --check | Exit 0; no whitespace errors; five tracked-file LF-to-CRLF warnings after the correction. |
| Read-only Win32_Process inspection | Sandbox attempt exit 1: Get-CimInstance Access denied. Approved elevated retry exit 0; four Node processes all false for repository-path, Next-dev, and Next-server flags. No repository dev server found. |
| npm run build | Exit 0; Next.js 14.2.5; compiled successfully; linting/types, page data, static generation 22/22, optimization, and build traces completed. |

No dev server was started/stopped/restarted. The process check emitted only process IDs/match flags, not full command lines or environment values. No dependency was installed or updated.

Focused tests cover ASCII, Turkish, German, Japanese, Arabic, trimming, whitespace collapse, exact 80/81 boundaries, surrogate pairs, blank/control/non-string input, punctuation, decomposed accents, and input immutability. Controller tests cover exact payload, no-op, synchronous duplicate guard, provider failure/exception/unconfirmed response, retry, Cancel, absent names, clean/dirty external updates, explicit reconciliation, own-save event ordering, conflicts during save, and disposal. Account-hook effect tests cover scheduled/coalesced USER_UPDATED, bounded focus fallback, cleanup, and preserved logout/initial-session navigation.

Tests use TypeScript transpileModule plus node:test/vm, following the existing recovery suite. They exercise real source with provider and minimal React-effect doubles; they are not a React DOM/browser or live Supabase acceptance claim.

Build route evidence: /profile, /account/settings, /help, /dashboard, /interviews, /interview/setup, /result/[id], and /api/interviews/[id]/pdf remain included. In the correction build, /profile is dynamic, size 2.54 kB, first-load JS 172 kB (initial implementation: 2.41 kB).

Warnings/notices retained:

- Two webpack warnings: [webpack.cache.PackFileCacheStrategy] Caching failed for pack: Error: Unable to snapshot resolve dependencies. Build still exited 0.
- Git reports LF will be replaced by CRLF the next time it touches each of the five modified tracked source files.
- npm announces 11.16.0 -> 12.2.0 during TypeScript and build; ignored, no upgrade performed.
- A pre-report existence probe returned shell exit 1 because the two new report files did not exist; this was not a Git or validation failure, and no prior reports were replaced.

## 11. Git Status

No stage, commit, push, branch change, restore, reset, or stash was performed. At the 2026-10-02 documentation/pre-commit checkpoint, HEAD and the local origin/feature/auth-foundation reference were 56b9cdf. At the implementation checkpoint, five approved existing files and six approved new files were changed. The final documentation closure additionally modifies the four authorized Project Memory files. The exact status and tracked-only diff stat are appended below after the authorized report update.

## 12. Complete Diffs for Sprint Files

The appendix contains the full tracked implementation and Project Memory diffs, full new-file diffs for all four source/test additions, and the Summary new-file diff. This Engineering Report is itself a new, fully available audit artifact; its own text is not recursively embedded as a diff within itself. No application diff is omitted. Untracked new files are included explicitly because ordinary git diff --stat omits them.

## 13. Risks, Limitations, Technical Debt, and Manual Acceptance

- user.updated_at is a whole-auth-user version, not an atomic profile revision; unrelated auth-user changes may conservatively trigger reconciliation.
- No atomic multi-device conflict guarantee exists.
- Drafts are memory-only and discarded on navigation.
- External changes are observed through auth events/focus/refresh behavior.
- Deployed Supabase project behavior was live-tested only for the exercised flows.
- No profile-schema enforcement exists because V1 intentionally uses auth metadata.

These limitations are not blockers for the accepted V1. REPORT_EXPORT_01 deployed packaging/resource smoke remains PENDING as a deployment/operations follow-up, not a local functional blocker; PDF implementation remains closed. Unrelated deferred work remains unchanged.

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

## 14. Untouched-Module Confirmation

lib/auth/user-identity.ts and its fallback projection are unchanged. No auth/login/signup/OTP/recovery implementation, PKCE configuration, Supabase client configuration, schema/migration, API, Dashboard source/layout, History/Result, PDF/report runtime, onboarding, localization architecture, interview engine/scoring/completion, TTS/avatar, or dependency file changed. Project Memory was untouched during implementation and is now updated only in the four explicitly authorized files. These two current sprint reports were updated in place as requested; other sprint reports remain untouched. The only shared-account extension is the approved identity refresh behavior.

## 15. Approval Required

Implementation, automated validation and user-verified local browser acceptance are PASS. The requested documentation and Project Memory closure are complete. Documentation review remains pending. Stop here; no server start, staging, commit, push or next stage is authorized.

## Authorized Pre-browser Snapshot Correction — 2026-10-02 (historical checkpoint)

The following records the correction before browser acceptance; its pending acceptance statements are superseded by the final runtime closure below.

### Defect and correction boundary

The initial 41-test implementation passed its automated checks but pre-browser review identified a hook dependency gap: last server name prop A, successful local save B, and a subsequent server snapshot A could leave local B unchanged because the name dependency still equaled A. Controller-only reconciliation tests did not exercise that hook-level sequence. The user explicitly authorized this bounded correction and updates to these two current sprint reports. No Project Memory closure is claimed.

Correction-start safety checks confirmed the repository path, branch feature/auth-foundation, HEAD and local origin reference 56b9cdf, and exactly the ten existing PROFILE_EDIT_01 working-tree files. No unrelated changes were present. This correction adds app/profile/page.tsx to the modified scope but no new files. It modifies only that route, AccountPageContent.tsx, ProfileEditor.tsx, useProfileEditor.ts, profile-display-name.test.cjs, Summary, and this Report. useAccountSession.ts, the validator, copy, and CSS have no additional correction changes.

### Verified snapshot field and evidence

The selected value is the exact top-level authenticated User.updated_at string. It is passed as identityVersion only from the server-protected /profile route through the existing account component to the editor. The shared UserIdentity projection and display_name -> full_name -> name fallback are untouched. No user ID, raw user object, raw metadata, random token, render timestamp, or unrelated auth field is passed.

Evidence inspected before selecting this mechanism:

- Installed node_modules/@supabase/auth-js/src/lib/types.ts: User declares updated_at?: string separately from user_metadata and app_metadata; UserAttributes does not offer a top-level updated_at mutation parameter.
- Installed GoTrueClient.ts _updateUser: metadata is sent in the authenticated PUT /user request; the response user is saved and returned, and USER_UPDATED is emitted. The client does not generate an updated_at timestamp. Installed JavaScript types alone cannot prove the server write semantics, so official server implementation was also inspected.
- [Supabase user documentation](https://supabase.com/docs/guides/auth/users) identifies updated_at as the user's last-update timestamp.
- [Auth API handler](https://github.com/supabase/auth/blob/master/internal/api/user.go): metadata input invokes UpdateUserMetaData and the handler returns the updated user. Its input structure does not accept a top-level updated_at.
- [Auth user model](https://github.com/supabase/auth/blob/master/internal/models/user.go): UpdatedAt is a top-level persisted/serialized field; UpdateUserMetaData writes through UpdateOnly.
- [Auth UpdateOnly](https://github.com/supabase/auth/blob/master/internal/storage/sql.go) delegates to the database update operation. [Column selection](https://github.com/supabase/auth/blob/master/internal/storage/dial.go) deliberately keeps updated_at writable by that operation.
- [Pop v6.1.1 update implementation](https://github.com/gobuffalo/pop/blob/v6.1.1/executors.go) assigns the server timestamp when updating the model. [Auth dependency declaration](https://github.com/supabase/auth/blob/master/go.mod) references that Pop version.

These observations establish the official server-controlled metadata update path, not a live test or a verified version inventory of this deployed Supabase project. No provider mutation was made to gather this evidence. Browser acceptance must confirm deployed response availability and changing versions for real saves. Version strings are preserved exactly and compared for equality; they are not parsed into lower-precision JavaScript dates or fabricated when absent.

### Final reconciliation and local-save baseline

The hook effect observes displayName AND identityVersion. The controller compares both confirmed name and version before deciding that a snapshot is unchanged. A/V1 -> successful B/V2 -> server A/V3 now reconciles even if no intermediate B server prop was rendered. Clean views adopt A/V3; dirty views retain the draft/baseline, set conflict, and block Save until Use latest or Cancel. A new version with an unchanged name also conflicts with a dirty draft. An identical name/version snapshot does not.

Edit, Use latest, and Cancel establish the current confirmed version as the draft baseline. Successful provider responses update both confirmed name and current/draft version, using returned user.updated_at. A later refresh of B/V2 is therefore the same baseline and does not mark the next draft as externally changed. A matching-name snapshot arriving while Save is pending is provisionally retained; if its version differs from the returned mutation version, the final response leaves an explicit conflict instead of silently replacing that snapshot.

Missing initial version blocks a changed-name mutation with the existing localized retry error. Missing/empty returned version keeps the draft editable and does not claim success, even though a provider write could already have occurred. No alternate token or provider configuration is introduced. Name validation, exact display_name-only payload, duplicate guard, recovery fail-closed handling, and existing bounded account refresh remain intact.

### Correction validation

All commands completed in the prescribed order: focused profile tests 49/49 PASS, recovery 34/34 PASS, TypeScript PASS, git diff --check PASS, approved read-only process check with no repository dev server, then npm run build PASS with 22/22 generation. All validation commands exited 0. The sandbox process check first returned Access denied; its explicitly approved elevated retry exited 0. Two webpack cache snapshot warnings, five tracked-file LF-to-CRLF warnings, and npm upgrade notices were retained. No dependencies or server lifecycle changed.

Eight additional tests include clean hook-level A/V1 -> B/V2 -> A/V3; dirty variants with Use latest and Cancel; own-save version baseline; same-name new-version conflict versus identical snapshot; absent initial/response versions; and matching-name/different-version arrival during Save. The actual hook is invoked with persistent useState and dependency-aware useEffect doubles, specifically covering the prior missed-effect defect. The original 41 test scenarios remain, with explicit provider versions added to their fixtures.

### Remaining acceptance and limitations

Check clean and dirty A -> B -> A in real same-account tabs, verify menu/editor agreement, explicit reconciliation and no false conflict after the same successful save refresh, and confirm deployed updated_at response behavior. Also retain the existing Unicode, refresh/logout/login persistence, account isolation, failure/retry, keyboard/mobile/localization, and recovery acceptance checks above.

updated_at covers the entire auth user, so another auth change may conservatively require reconciliation even without a name change. It is a server timestamp, not a dedicated monotonic profile revision or atomic compare-and-swap guarantee. Equality detects observed new versions; it does not order concurrent responses, prevent unseen concurrent writes, or guarantee unique timestamps for every possible write. No new polling, metadata exposure, recovery exception, auth redesign, API, or migration is added. Browser acceptance and final approval remain pending.


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

### Documentation-only change boundary

Only the two current sprint reports and four named Project Memory files were edited in this step. Application code, tests, dependencies and configuration remain byte-for-byte unchanged from the start of this documentation task. No tests/build or server lifecycle command was run. Git diff --check is the documentation whitespace check; repository status and tracked diff stat follow.

## Appendix: Exact Repository Evidence and Full Diffs

### git status --short --untracked-files=all

```text
 M app/profile/page.tsx
 M components/account/AccountPageContent.tsx
 M components/account/account-copy.ts
 M components/account/useAccountSession.ts
 M docs/04_Project_Memory/CURRENT_STATE.md
 M docs/04_Project_Memory/DECISIONS_AND_RISKS.md
 M docs/04_Project_Memory/DEFERRED_FIXES.md
 M docs/04_Project_Memory/STAGE_LOG.md
 M styles/talentry-account.css
?? components/account/ProfileEditor.tsx
?? components/account/useProfileEditor.ts
?? docs/01_Engineering/Sprint_PROFILE_EDIT_01_Engineering_Report.md
?? docs/01_Engineering/Sprint_PROFILE_EDIT_01_Summary.md
?? lib/account/profile-display-name.test.cjs
?? lib/account/profile-display-name.ts
```

### git diff --stat (tracked files only; untracked reports/source excluded)

```text
 app/profile/page.tsx                          |  2 +-
 components/account/AccountPageContent.tsx     | 10 ++--
 components/account/account-copy.ts            | 27 +++++++++--
 components/account/useAccountSession.ts       | 21 ++++++++-
 docs/04_Project_Memory/CURRENT_STATE.md       | 37 ++++++++++++++-
 docs/04_Project_Memory/DECISIONS_AND_RISKS.md | 32 +++++++++++++
 docs/04_Project_Memory/DEFERRED_FIXES.md      | 22 +++++++++
 docs/04_Project_Memory/STAGE_LOG.md           | 68 +++++++++++++++++++++++++++
 styles/talentry-account.css                   | 25 ++++++++++
 9 files changed, 231 insertions(+), 13 deletions(-)
```

### Modified implementation and Project Memory files

```diff
diff --git a/app/profile/page.tsx b/app/profile/page.tsx
index 78ae97f..f66e7c0 100644
--- a/app/profile/page.tsx
+++ b/app/profile/page.tsx
@@ -10,6 +10,6 @@ export default async function AccountPage() {
   if (auth.status === 'unauthorized') redirect(AUTH_ROUTES.login)
   const identity = projectUserIdentity(auth.user)
   return <DashboardLayout identity={identity} accountPage>
-    <AccountPageContent page="profile" identity={identity} />
+    <AccountPageContent page="profile" identity={identity} identityVersion={auth.user.updated_at} />
   </DashboardLayout>
 }
diff --git a/components/account/AccountPageContent.tsx b/components/account/AccountPageContent.tsx
index 3734bfd..a07c83f 100644
--- a/components/account/AccountPageContent.tsx
+++ b/components/account/AccountPageContent.tsx
@@ -6,9 +6,10 @@ import { DashboardLanguageContext, AccountLanguageContext } from '@/components/d
 import type { UserIdentity } from '@/lib/auth/user-identity'
 import { ACCOUNT_COPY } from './account-copy'
 import LanguageSelector from './LanguageSelector'
+import ProfileEditor from './ProfileEditor'

-export default function AccountPageContent({ page, identity }: {
-  page: 'profile' | 'settings' | 'help'; identity: UserIdentity
+export default function AccountPageContent({ page, identity, identityVersion }: {
+  page: 'profile' | 'settings' | 'help'; identity: UserIdentity; identityVersion?: string
 }) {
   const language = useContext(DashboardLanguageContext)
   const changeLanguage = useContext(AccountLanguageContext)
@@ -17,10 +18,7 @@ export default function AccountPageContent({ page, identity }: {
     <Link className="talentry-account-back" href="/dashboard">{copy.back}</Link>
     <h1>{copy[page]}</h1>
     <p>{copy[`${page}Description`]}</p>
-    {page === 'profile' && <dl className="talentry-account-card">
-      <dt>{copy.displayName}</dt><dd>{identity.displayName ?? copy.missing}</dd>
-      <dt>{copy.email}</dt><dd>{identity.email ?? copy.missing}</dd>
-    </dl>}
+    {page === 'profile' && <ProfileEditor identity={identity} identityVersion={identityVersion} language={language} />}
     {page === 'settings' && <>
       <div className="talentry-account-card">
         <LanguageSelector language={language} onChange={changeLanguage} />
diff --git a/components/account/account-copy.ts b/components/account/account-copy.ts
index ba04d96..25c419b 100644
--- a/components/account/account-copy.ts
+++ b/components/account/account-copy.ts
@@ -4,6 +4,9 @@ interface AccountCopy {
   account: string; profile: string; settings: string; language: string; help: string
   signOut: string; signingOut: string; signOutFailed: string; back: string
   profileDescription: string; displayName: string; email: string; missing: string
+  editProfile: string; save: string; cancel: string; saving: string; saved: string
+  profileChanged: string; useLatest: string; profileEditHint: string
+  profileErrors: Record<'required' | 'tooLong' | 'invalid' | 'saveFailed', string>
   settingsDescription: string; languageDescription: string; security: string
   recoveryDescription: string; recovery: string; helpDescription: string
   guidance: readonly { title: string; description: string; href?: string }[]
@@ -14,7 +17,13 @@ export const ACCOUNT_COPY: Record<AppLanguage, AccountCopy> = {
     account: 'Hesap', profile: 'Profil', settings: 'Hesap Ayarları', language: 'Uygulama dili',
     help: 'Yardım ve Destek', signOut: 'Çıkış Yap', signingOut: 'Çıkış yapılıyor…',
     signOutFailed: 'Çıkış tamamlanamadı. Lütfen tekrar deneyin.', back: 'Panele Dön',
-    profileDescription: 'Hesabınızda bulunan bilgiler. Bu sayfa salt okunurdur.',
+    profileDescription: 'Görünen adınızı düzenleyebilirsiniz. E-posta adresiniz salt okunurdur.',
+    editProfile: 'Profili düzenle', save: 'Kaydet', cancel: 'İptal', saving: 'Kaydediliyor…', saved: 'Görünen ad kaydedildi.',
+    profileChanged: 'Profiliniz başka bir yerde değişti. Devam etmek için güncel değeri kullanın.',
+    useLatest: 'Güncel değeri kullan',
+    profileEditHint: '1–80 karakter. Kaydedilmemiş değişiklikler sayfadan ayrılınca silinir.',
+    profileErrors: { required: 'Görünen ad boş bırakılamaz.', tooLong: 'En fazla 80 karakter girin.',
+      invalid: 'Geçerli bir görünen ad girin.', saveFailed: 'Kaydedilemedi. Lütfen tekrar deneyin.' },
     displayName: 'Görünen ad', email: 'E-posta', missing: 'Belirtilmedi',
     settingsDescription: 'Uygulama dilinizi seçin veya mevcut parola kurtarma akışını kullanın.',
     languageDescription: 'Bu tarayıcı için kaydedilir. Mülakat dilini değiştirmez.',
@@ -32,7 +41,13 @@ export const ACCOUNT_COPY: Record<AppLanguage, AccountCopy> = {
     account: 'Account', profile: 'Profile', settings: 'Account Settings', language: 'Application language',
     help: 'Help & Support', signOut: 'Sign Out', signingOut: 'Signing out…',
     signOutFailed: 'Sign out could not be completed. Please try again.', back: 'Back to Dashboard',
-    profileDescription: 'The information available on your account. This page is read-only.',
+    profileDescription: 'Edit your display name. Your email address is read-only.',
+    editProfile: 'Edit profile', save: 'Save', cancel: 'Cancel', saving: 'Saving…', saved: 'Display name saved.',
+    profileChanged: 'Your profile changed elsewhere. Use the latest value to continue.',
+    useLatest: 'Use latest value',
+    profileEditHint: '1–80 characters. Unsaved changes are discarded when you leave this page.',
+    profileErrors: { required: 'Display name is required.', tooLong: 'Enter no more than 80 characters.',
+      invalid: 'Enter a valid display name.', saveFailed: 'Could not save. Please try again.' },
     displayName: 'Display name', email: 'Email', missing: 'Not provided',
     settingsDescription: 'Choose your application language or use the existing password recovery flow.',
     languageDescription: 'Saved for this browser. Does not change the interview language.',
@@ -50,7 +65,13 @@ export const ACCOUNT_COPY: Record<AppLanguage, AccountCopy> = {
     account: 'Konto', profile: 'Profil', settings: 'Kontoeinstellungen', language: 'Anwendungssprache',
     help: 'Hilfe & Support', signOut: 'Abmelden', signingOut: 'Abmeldung läuft…',
     signOutFailed: 'Die Abmeldung konnte nicht abgeschlossen werden. Bitte erneut versuchen.', back: 'Zurück zum Dashboard',
-    profileDescription: 'Die verfügbaren Angaben zu deinem Konto. Diese Seite ist schreibgeschützt.',
+    profileDescription: 'Bearbeite deinen Anzeigenamen. Deine E-Mail-Adresse ist schreibgeschützt.',
+    editProfile: 'Profil bearbeiten', save: 'Speichern', cancel: 'Abbrechen', saving: 'Wird gespeichert…', saved: 'Anzeigename gespeichert.',
+    profileChanged: 'Dein Profil wurde anderswo geändert. Übernimm den aktuellen Wert, um fortzufahren.',
+    useLatest: 'Aktuellen Wert übernehmen',
+    profileEditHint: '1–80 Zeichen. Ungespeicherte Änderungen werden beim Verlassen dieser Seite verworfen.',
+    profileErrors: { required: 'Ein Anzeigename ist erforderlich.', tooLong: 'Gib höchstens 80 Zeichen ein.',
+      invalid: 'Gib einen gültigen Anzeigenamen ein.', saveFailed: 'Speichern fehlgeschlagen. Bitte versuche es erneut.' },
     displayName: 'Anzeigename', email: 'E-Mail', missing: 'Nicht angegeben',
     settingsDescription: 'Wähle die Anwendungssprache oder nutze die bestehende Passwortwiederherstellung.',
     languageDescription: 'Wird für diesen Browser gespeichert. Ändert die Interviewsprache nicht.',
diff --git a/components/account/useAccountSession.ts b/components/account/useAccountSession.ts
index 3e28b56..2675d05 100644
--- a/components/account/useAccountSession.ts
+++ b/components/account/useAccountSession.ts
@@ -1,9 +1,11 @@
 'use client'

 import { useEffect, useRef, useState } from 'react'
+import { useRouter } from 'next/navigation'
 import { createClient } from '@/lib/supabase'

 export function useAccountSession() {
+  const router = useRouter()
   const [supabase] = useState(createClient)
   const [pending, setPending] = useState(false)
   const [failed, setFailed] = useState(false)
@@ -22,8 +24,22 @@ export function useAccountSession() {

   useEffect(() => {
     mounted.current = true
+    let refreshTimer: ReturnType<typeof setTimeout> | undefined
+    let lastRefresh = 0
+    const scheduleRefresh = () => {
+      if (refreshTimer !== undefined || leaving.current) return
+      // Leave the Auth callback before refreshing server-verified identity.
+      refreshTimer = setTimeout(() => {
+        refreshTimer = undefined
+        if (!mounted.current || leaving.current) return
+        lastRefresh = Date.now()
+        router.refresh()
+      }, 0)
+    }
+    const onFocus = () => { if (Date.now() - lastRefresh >= 2000) scheduleRefresh() }
     const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
       if (event === 'SIGNED_OUT' || (event === 'INITIAL_SESSION' && !session)) leave()
+      if (event === 'USER_UPDATED' && session) scheduleRefresh()
     })
     // A restored browser-history document must not retain stale account UI.
     const revalidate = async () => {
@@ -34,12 +50,15 @@ export function useAccountSession() {
       if (event.persisted) void revalidate().catch(() => {})
     }
     window.addEventListener('pageshow', onPageShow)
+    window.addEventListener('focus', onFocus)
     return () => {
       mounted.current = false
       subscription.unsubscribe()
+      clearTimeout(refreshTimer)
       window.removeEventListener('pageshow', onPageShow)
+      window.removeEventListener('focus', onFocus)
     }
-  }, [supabase])
+  }, [supabase, router])

   async function signOut() {
     if (inFlight.current || leaving.current) return
diff --git a/docs/04_Project_Memory/CURRENT_STATE.md b/docs/04_Project_Memory/CURRENT_STATE.md
index bc29efc..dc7697c 100644
--- a/docs/04_Project_Memory/CURRENT_STATE.md
+++ b/docs/04_Project_Memory/CURRENT_STATE.md
@@ -1,8 +1,41 @@
 # Talentry / InterviewAI — Current Project State

-Last updated: 2026-10-01
+Last updated: 2026-10-02

-## Final status — REPORT_EXPORT_01 — 2026-10-01
+## Current status — PROFILE_EDIT_01 — 2026-10-02
+
+**IMPLEMENTATION + AUTOMATED VALIDATION + LOCAL BROWSER ACCEPTANCE: PASS**
+
+At the 2026-10-02 documentation/pre-commit checkpoint, HEAD and local origin/feature/auth-foundation were 56b9cdf on feature/auth-foundation; PROFILE_EDIT_01 work was uncommitted. No future commit hash is asserted. The user reported the dev server manually stopped. No tests/build or browser checks were rerun during this documentation-only update; no server restart or Git mutation was performed. No next stage is authorized.
+
+Display-name-only V1 writes user_metadata.display_name through authenticated browser supabase.auth.updateUser({ data: { display_name: normalizedValue } }). No target user ID, app_metadata, service-role/admin mutation, profile table, application profile API, schema/RLS, dependency or configuration change. Email remains read-only; email/password/avatar changes are outside scope. Server projection remains defensive: display_name -> full_name -> name -> honest fallback. Metadata is display text only, never authorization.
+
+The name contract trims leading/trailing whitespace, collapses internal whitespace runs, requires 1-80 Unicode code points and rejects remaining control characters. International Unicode, accents/diacritics and punctuation are preserved. No transliteration, first/last-name split, email-derived name or clear-name action. Existing missing-name fallback remains valid until edited.
+
+The server-projected editor snapshot contains projected display name and the authenticated user's top-level user.updated_at as identityVersion. This server-controlled value is separate from user_metadata and used only for identity reconciliation, never authorization. No random or client-generated version token is used.
+
+A/V1 -> local save B/V2 -> later external/server A/V3 is recognized as a NEW snapshot even when the name repeats. Clean editors accept the fresh snapshot and update confirmed/displayed name. Dirty editors preserve the draft, detect external changes, block Save, and require explicit Use latest / Cancel reconciliation. Successful saves use the provider-returned user for confirmed name and updated_at baseline, avoiding a false conflict when that same saved snapshot returns through refresh.
+
+USER_UPDATED schedules bounded refresh outside the auth callback; focus refresh is a bounded fallback, with no polling. Existing SIGNED_OUT/session-loss navigation is preserved. Server-projected identity remains authoritative; shared menu and clean profile views update after metadata changes.
+
+PROFILE_EDIT_01 did NOT modify recovery code. A successful profile metadata update emits USER_UPDATED. An open recovery form in another same-profile tab therefore remains fail-closed and becomes unavailable. This intentional behavior was LIVE-VERIFIED: the recovery tab transitioned to Reset link unavailable. It is not a regression.
+
+Recorded final automated validation: focused profile tests 49/49 PASS; recovery regression 34/34 PASS; TypeScript PASS; git diff --check PASS; production build PASS, 22/22 pages. These existing test/build results were not rerun. Prior webpack cache snapshot warnings, LF-to-CRLF notices and npm update notices remain documented; no dependency update was performed.
+
+All 17 supplied browser checks A-Q are USER-VERIFIED PASS in Chrome normal profile; exact observations are recorded in STAGE_LOG and the current sprint reports. Provider failure/retry and rapid duplicate submission prevention are automated-test-covered only, not browser-tested.
+
+- user.updated_at is a whole-auth-user version, not an atomic profile revision; unrelated auth-user changes may conservatively trigger reconciliation.
+- No atomic multi-device conflict guarantee exists.
+- Drafts are memory-only and discarded on navigation.
+- External changes are observed through auth events/focus/refresh behavior.
+- Deployed Supabase project behavior was live-tested only for the exercised flows.
+- No profile-schema enforcement exists because V1 intentionally uses auth metadata.
+
+These limitations are not blockers for the accepted V1. REPORT_EXPORT_01 deployed packaging/resource smoke remains PENDING as a deployment/operations follow-up, not a local functional blocker; PDF implementation remains closed. Unrelated deferred work remains unchanged.
+
+This entry supersedes earlier read-only-profile/deferred-editing and pending PROFILE_EDIT_01 acceptance statements for display-name-only V1. Earlier stage checkpoints remain historical; other account features are not authorized.
+
+## Previous stage status — REPORT_EXPORT_01 — 2026-10-01 (historical checkpoint)

 **IMPLEMENTATION + AUTOMATED VALIDATION + LOCAL BROWSER ACCEPTANCE: PASS**

diff --git a/docs/04_Project_Memory/DECISIONS_AND_RISKS.md b/docs/04_Project_Memory/DECISIONS_AND_RISKS.md
index 2d00457..b786e38 100644
--- a/docs/04_Project_Memory/DECISIONS_AND_RISKS.md
+++ b/docs/04_Project_Memory/DECISIONS_AND_RISKS.md
@@ -1649,3 +1649,35 @@ Deployed packaging/resource smoke remains a deployment acceptance / operational
 7. Full automated/build/post-build validation passed. PDF language source then changed from UI language to persisted interview.language; automated validation and browser re-acceptance passed.

 User-verified historical/repeated/mobile export, live Unicode search and signed-out/wrong-owner boundaries passed; see STAGE_LOG. The incomplete-logout attempt was invalid, not an auth failure. ADR-003 supersedes ADR-002, which remains unchanged historical evidence.
+
+
+## DECISION-034 — PROFILE_EDIT_01 display-name-only metadata editing — 2026-10-02
+
+Status: IMPLEMENTATION + AUTOMATED VALIDATION + LOCAL BROWSER ACCEPTANCE: PASS.
+
+At the 2026-10-02 documentation/pre-commit checkpoint, HEAD and local origin/feature/auth-foundation were 56b9cdf on feature/auth-foundation; PROFILE_EDIT_01 work was uncommitted. No future commit hash is asserted. The user reported the dev server manually stopped. No tests/build or browser checks were rerun during this documentation-only update; no server restart or Git mutation was performed. No next stage is authorized.
+
+Display-name-only V1 writes user_metadata.display_name through authenticated browser supabase.auth.updateUser({ data: { display_name: normalizedValue } }). No target user ID, app_metadata, service-role/admin mutation, profile table, application profile API, schema/RLS, dependency or configuration change. Email remains read-only; email/password/avatar changes are outside scope. Server projection remains defensive: display_name -> full_name -> name -> honest fallback. Metadata is display text only, never authorization.
+
+The name contract trims leading/trailing whitespace, collapses internal whitespace runs, requires 1-80 Unicode code points and rejects remaining control characters. International Unicode, accents/diacritics and punctuation are preserved. No transliteration, first/last-name split, email-derived name or clear-name action. Existing missing-name fallback remains valid until edited.
+
+The server-projected editor snapshot contains projected display name and the authenticated user's top-level user.updated_at as identityVersion. This server-controlled value is separate from user_metadata and used only for identity reconciliation, never authorization. No random or client-generated version token is used.
+
+A/V1 -> local save B/V2 -> later external/server A/V3 is recognized as a NEW snapshot even when the name repeats. Clean editors accept the fresh snapshot and update confirmed/displayed name. Dirty editors preserve the draft, detect external changes, block Save, and require explicit Use latest / Cancel reconciliation. Successful saves use the provider-returned user for confirmed name and updated_at baseline, avoiding a false conflict when that same saved snapshot returns through refresh.
+
+USER_UPDATED schedules bounded refresh outside the auth callback; focus refresh is a bounded fallback, with no polling. Existing SIGNED_OUT/session-loss navigation is preserved. Server-projected identity remains authoritative; shared menu and clean profile views update after metadata changes.
+
+PROFILE_EDIT_01 did NOT modify recovery code. A successful profile metadata update emits USER_UPDATED. An open recovery form in another same-profile tab therefore remains fail-closed and becomes unavailable. This intentional behavior was LIVE-VERIFIED: the recovery tab transitioned to Reset link unavailable. It is not a regression.
+
+This supersedes DECISION-031's read-only-profile/editing-deferral wording for display-name-only V1. Its auth guards, shared shell and defensive identity rules remain preserved. User-verified acceptance A-Q is recorded in STAGE_LOG; provider failure/retry and duplicate submission prevention have automated coverage only. No broader profile requirement/schema or next stage is authorized.
+
+## RISK-019 — PROFILE_EDIT_01 accepted V1 reconciliation limits
+
+- user.updated_at is a whole-auth-user version, not an atomic profile revision; unrelated auth-user changes may conservatively trigger reconciliation.
+- No atomic multi-device conflict guarantee exists.
+- Drafts are memory-only and discarded on navigation.
+- External changes are observed through auth events/focus/refresh behavior.
+- Deployed Supabase project behavior was live-tested only for the exercised flows.
+- No profile-schema enforcement exists because V1 intentionally uses auth metadata.
+
+These limitations are not blockers for the accepted V1. REPORT_EXPORT_01 deployed packaging/resource smoke remains PENDING as a deployment/operations follow-up, not a local functional blocker; PDF implementation remains closed. Unrelated deferred work remains unchanged.
diff --git a/docs/04_Project_Memory/DEFERRED_FIXES.md b/docs/04_Project_Memory/DEFERRED_FIXES.md
index db0a036..ca10684 100644
--- a/docs/04_Project_Memory/DEFERRED_FIXES.md
+++ b/docs/04_Project_Memory/DEFERRED_FIXES.md
@@ -912,6 +912,8 @@ No Dashboard, Result, Interview logic, API, schema, auth, scoring, prompts, HeyG

 ## ACCOUNT-001 — Profile Editing and Persistence

+Update 2026-10-02: RESOLVED for display-name-only V1 under PROFILE_EDIT_01; implementation, automated validation and user-verified local browser acceptance PASS. At this pre-commit documentation checkpoint the work was uncommitted on base 56b9cdf; no future commit hash is asserted. No profile schema is required by the accepted auth-metadata design. The earlier deferral below is historical. Email/password/avatar editing and broader account features remain outside scope.
+
 Date: 2026-09-20. Status: INTENTIONALLY DEFERRED.

 User Menu, read-only /profile, /account/settings (application language and password recovery), and /help are implemented and main-flow runtime/build accepted. No fake account controls, avatar upload, support channels, raw metadata exposure, profile table or migration. Editing/persistence needs a real product requirement/schema. Email change, deletion, MFA, device/session management and notification preferences remain unsupported and were not added.
@@ -978,3 +980,23 @@ PDF implementation is no longer deferred: IMPLEMENTATION + AUTOMATED VALIDATION
 - Concurrency/resource profiling: conditional follow-up if future usage scale requires it. Local observations do not establish capacity or absence of leaks.

 No unrelated backlog is added to REPORT_EXPORT_01. See CURRENT_STATE, STAGE_LOG and ADR-003 for the final persisted-language/owner-authorized Node/jsPDF contract and user-verified local evidence.
+
+
+## PROFILE_EDIT_01 — Accepted V1 and remaining boundaries — 2026-10-02
+
+At the 2026-10-02 documentation/pre-commit checkpoint, HEAD and local origin/feature/auth-foundation were 56b9cdf on feature/auth-foundation; PROFILE_EDIT_01 work was uncommitted. No future commit hash is asserted. The user reported the dev server manually stopped. No tests/build or browser checks were rerun during this documentation-only update; no server restart or Git mutation was performed. No next stage is authorized.
+
+Recorded final automated validation: focused profile tests 49/49 PASS; recovery regression 34/34 PASS; TypeScript PASS; git diff --check PASS; production build PASS, 22/22 pages. These existing test/build results were not rerun. Prior webpack cache snapshot warnings, LF-to-CRLF notices and npm update notices remain documented; no dependency update was performed.
+
+Browser acceptance A-Q: USER-VERIFIED PASS in Chrome normal profile; see STAGE_LOG for exact observations. ACCOUNT-002's cross-tab logout gap is resolved specifically for a dirty profile editor navigating to login without persisting its draft. Metadata-update revocation of an open recovery form is also live-verified intentional fail-closed behavior. Other ACCOUNT-002 edge cases remain unverified; no broad closure is claimed.
+
+Provider failure/retry and rapid duplicate submission prevention remain automated-test-covered only; they were not deliberately forced live and are not browser failures or V1 blockers.
+
+- user.updated_at is a whole-auth-user version, not an atomic profile revision; unrelated auth-user changes may conservatively trigger reconciliation.
+- No atomic multi-device conflict guarantee exists.
+- Drafts are memory-only and discarded on navigation.
+- External changes are observed through auth events/focus/refresh behavior.
+- Deployed Supabase project behavior was live-tested only for the exercised flows.
+- No profile-schema enforcement exists because V1 intentionally uses auth metadata.
+
+These limitations are not blockers for the accepted V1. REPORT_EXPORT_01 deployed packaging/resource smoke remains PENDING as a deployment/operations follow-up, not a local functional blocker; PDF implementation remains closed. Unrelated deferred work remains unchanged.
diff --git a/docs/04_Project_Memory/STAGE_LOG.md b/docs/04_Project_Memory/STAGE_LOG.md
index 3f50ffe..84e6628 100644
--- a/docs/04_Project_Memory/STAGE_LOG.md
+++ b/docs/04_Project_Memory/STAGE_LOG.md
@@ -1792,3 +1792,71 @@ German labels/Unicode have automated fixture evidence; no additional live German
 5. A multipage contiguous-answer assertion was proven invalid because legitimate page footers interrupted extraction. Its replacement strengthened exact per-page footer and ordered semantic-body checks.
 6. TypeScript API mismatch was corrected from direct getPageWidth/getPageHeight to doc.internal.pageSize.getWidth()/getHeight(), without changing pagination.
 7. Full automated/build/post-build validation passed. PDF language source then changed from UI language to persisted interview.language; automated validation and browser re-acceptance passed.
+
+
+## Final runtime acceptance — PROFILE_EDIT_01 — 2026-10-02
+
+**IMPLEMENTATION + AUTOMATED VALIDATION + LOCAL BROWSER ACCEPTANCE: PASS**
+
+At the 2026-10-02 documentation/pre-commit checkpoint, HEAD and local origin/feature/auth-foundation were 56b9cdf on feature/auth-foundation; PROFILE_EDIT_01 work was uncommitted. No future commit hash is asserted. The user reported the dev server manually stopped. No tests/build or browser checks were rerun during this documentation-only update; no server restart or Git mutation was performed. No next stage is authorized.
+
+### Final architecture and name contract
+
+Display-name-only V1 writes user_metadata.display_name through authenticated browser supabase.auth.updateUser({ data: { display_name: normalizedValue } }). No target user ID, app_metadata, service-role/admin mutation, profile table, application profile API, schema/RLS, dependency or configuration change. Email remains read-only; email/password/avatar changes are outside scope. Server projection remains defensive: display_name -> full_name -> name -> honest fallback. Metadata is display text only, never authorization.
+
+The name contract trims leading/trailing whitespace, collapses internal whitespace runs, requires 1-80 Unicode code points and rejects remaining control characters. International Unicode, accents/diacritics and punctuation are preserved. No transliteration, first/last-name split, email-derived name or clear-name action. Existing missing-name fallback remains valid until edited.
+
+### Identity snapshot and refresh
+
+The server-projected editor snapshot contains projected display name and the authenticated user's top-level user.updated_at as identityVersion. This server-controlled value is separate from user_metadata and used only for identity reconciliation, never authorization. No random or client-generated version token is used.
+
+A/V1 -> local save B/V2 -> later external/server A/V3 is recognized as a NEW snapshot even when the name repeats. Clean editors accept the fresh snapshot and update confirmed/displayed name. Dirty editors preserve the draft, detect external changes, block Save, and require explicit Use latest / Cancel reconciliation. Successful saves use the provider-returned user for confirmed name and updated_at baseline, avoiding a false conflict when that same saved snapshot returns through refresh.
+
+USER_UPDATED schedules bounded refresh outside the auth callback; focus refresh is a bounded fallback, with no polling. Existing SIGNED_OUT/session-loss navigation is preserved. Server-projected identity remains authoritative; shared menu and clean profile views update after metadata changes.
+
+### Recovery interaction
+
+PROFILE_EDIT_01 did NOT modify recovery code. A successful profile metadata update emits USER_UPDATED. An open recovery form in another same-profile tab therefore remains fail-closed and becomes unavailable. This intentional behavior was LIVE-VERIFIED: the recovery tab transitioned to Reset link unavailable. It is not a regression.
+
+### Validation evidence
+
+Recorded final automated validation: focused profile tests 49/49 PASS; recovery regression 34/34 PASS; TypeScript PASS; git diff --check PASS; production build PASS, 22/22 pages. These existing test/build results were not rerun. Prior webpack cache snapshot warnings, LF-to-CRLF notices and npm update notices remain documented; no dependency update was performed.
+
+### Local browser acceptance
+
+Evidence: USER-VERIFIED PASS in Chrome normal profile, supplied by the user on 2026-10-02. This documentation step did not independently repeat the browser checks.
+
+| Check | User-confirmed observation | Result |
+| --- | --- | --- |
+| A. Display-name save | /profile saved Çağrı Öztürk; profile card and menu/avatar identity updated. | USER-VERIFIED PASS |
+| B. Refresh persistence | Ctrl+R retained the saved name. | USER-VERIFIED PASS |
+| C. Logout/login persistence | Same-account logout/login retained the saved name. | USER-VERIFIED PASS |
+| D. Cross-account isolation | Second test account did not show the first account's edited name. | USER-VERIFIED PASS |
+| E. Cancel | Temporary Deneme İsim draft cancelled; persisted value unchanged. | USER-VERIFIED PASS |
+| F. Blank validation | Blank/whitespace rejected; no save. | USER-VERIFIED PASS |
+| G. Length validation | 81-character value rejected. | USER-VERIFIED PASS |
+| H. Clean cross-tab update | Tab B saved Sekma Testi / equivalent tested value; clean Tab A updated automatically without manual refresh. No timing measurement is asserted. | USER-VERIFIED PASS |
+| I. Dirty draft conflict | Tab A retained Taslak İsim after Tab B saved Dış Değişiklik; conflict notice appeared and Save was blocked. | USER-VERIFIED PASS |
+| J. Use latest | Adopted current server value and cleared conflict. | USER-VERIFIED PASS |
+| K. Repeated A -> B -> A | Clean view moved to temporary B; another tab restored prior A under a NEW server identity version; clean view reconciled back to A. Validates the pre-browser updated_at snapshot fix. | USER-VERIFIED PASS |
+| L. Mobile | Approximately 400 x 690: editing usable, no horizontal overflow or control overlap, normal vertical scrolling. | USER-VERIFIED PASS |
+| M. Autofocus/keyboard | Edit Profile focused the input; typing worked without an extra click. | USER-VERIFIED PASS |
+| N. Recovery interaction | Fresh same-profile recovery form became Reset link unavailable after another tab saved profile metadata. Intentional fail-closed behavior. | USER-VERIFIED PASS |
+| O. English copy | Switching application UI to English showed correct English profile-edit copy. | USER-VERIFIED PASS |
+| P. German copy | Switching application UI to German showed correct German profile-edit copy. | USER-VERIFIED PASS |
+| Q. Session loss while editing | Another same-profile tab logged out; dirty profile/edit tab navigated to login and the draft was not persisted. | USER-VERIFIED PASS |
+
+Provider failure/retry and rapid duplicate submission prevention were NOT intentionally forced against the live provider. They are automated-test-covered only, not browser-tested. Other unlisted browser/device or screen-reader behavior is not newly claimed as verified.
+
+### Remaining non-blocking limitations
+
+- user.updated_at is a whole-auth-user version, not an atomic profile revision; unrelated auth-user changes may conservatively trigger reconciliation.
+- No atomic multi-device conflict guarantee exists.
+- Drafts are memory-only and discarded on navigation.
+- External changes are observed through auth events/focus/refresh behavior.
+- Deployed Supabase project behavior was live-tested only for the exercised flows.
+- No profile-schema enforcement exists because V1 intentionally uses auth metadata.
+
+These limitations are not blockers for the accepted V1. REPORT_EXPORT_01 deployed packaging/resource smoke remains PENDING as a deployment/operations follow-up, not a local functional blocker; PDF implementation remains closed. Unrelated deferred work remains unchanged.
+
+This closure supersedes earlier profile-editing deferral for display-name-only V1. Only the two current sprint reports and four named Project Memory files were updated; no other sprint report was rewritten.
diff --git a/styles/talentry-account.css b/styles/talentry-account.css
index 6c06e46..3def3de 100644
--- a/styles/talentry-account.css
+++ b/styles/talentry-account.css
@@ -92,3 +92,28 @@
 .talentry-account-card { display: grid; gap: var(--talentry-space-3); padding: var(--talentry-space-5); border: var(--talentry-card-border); border-radius: var(--talentry-radius-lg); background: var(--talentry-color-surface); }
 .talentry-account-card dt { font-weight: var(--talentry-font-weight-semibold); }
 .talentry-account-card dd, .talentry-account-content p { color: var(--talentry-color-text-secondary); }
+
+.talentry-profile-editor dl,
+.talentry-profile-editor form { display: grid; min-width: 0; gap: var(--talentry-space-3); }
+.talentry-profile-editor dl > *, .talentry-profile-editor form p { margin: 0; }
+.talentry-profile-editor label { font-weight: var(--talentry-font-weight-semibold); }
+.talentry-profile-editor input {
+  box-sizing: border-box;
+  width: 100%;
+  min-width: 0;
+  min-height: var(--talentry-button-height-md);
+  padding: var(--talentry-space-3);
+  border: var(--talentry-card-border);
+  border-radius: var(--talentry-radius-md);
+  background: var(--talentry-color-surface);
+  color: var(--talentry-color-text);
+  font: inherit;
+}
+.talentry-profile-editor input:focus-visible {
+  outline: 2px solid var(--talentry-color-border-focus);
+  outline-offset: var(--talentry-space-1);
+}
+.talentry-profile-editor input[aria-invalid='true'] { border-color: var(--talentry-color-danger); }
+.talentry-profile-editor .talentry-profile-error { color: var(--talentry-color-danger-hover); }
+.talentry-profile-actions { display: flex; flex-wrap: wrap; gap: var(--talentry-space-3); }
+.talentry-profile-editor .talentry-button { max-width: 100%; white-space: normal; }
```

### components/account/ProfileEditor.tsx

```diff
diff --git a/components/account/ProfileEditor.tsx b/components/account/ProfileEditor.tsx
new file mode 100644
--- /dev/null
+++ b/components/account/ProfileEditor.tsx
@@ -0,0 +1,53 @@
+'use client'
+
+import { useEffect, useId, useRef } from 'react'
+import type { UserIdentity } from '@/lib/auth/user-identity'
+import type { AppLanguage } from '@/types/auth'
+import TalentryButton from '@/components/ui/TalentryButton'
+import { ACCOUNT_COPY } from './account-copy'
+import { useProfileEditor } from './useProfileEditor'
+
+export default function ProfileEditor({ identity, identityVersion, language }: {
+  identity: UserIdentity; identityVersion?: string; language: AppLanguage
+}) {
+  const copy = ACCOUNT_COPY[language]
+  const profile = useProfileEditor(identity.displayName, identityVersion)
+  const { editor } = profile
+  const input = useRef<HTMLInputElement>(null)
+  const editButton = useRef<HTMLButtonElement>(null)
+  const wasEditing = useRef(false)
+  const id = useId()
+  useEffect(() => {
+    if (profile.editing) input.current?.focus()
+    else if (wasEditing.current) editButton.current?.focus()
+    wasEditing.current = profile.editing
+  }, [profile.editing])
+
+  return <section className="talentry-account-card talentry-profile-editor" aria-label={copy.profile}>
+    <dl>
+      {!profile.editing && <><dt>{copy.displayName}</dt><dd>{profile.confirmed || copy.missing}</dd></>}
+      <dt>{copy.email}</dt><dd>{identity.email ?? copy.missing}</dd>
+    </dl>
+    {profile.editing ? <form noValidate onSubmit={event => { event.preventDefault(); void editor.save() }}>
+      <label htmlFor={id}>{copy.displayName}</label>
+      <input id={id} ref={input} type="text" autoComplete="nickname" required
+        value={profile.draft} disabled={profile.saving} aria-invalid={Boolean(profile.error && profile.error !== 'saveFailed')}
+        aria-describedby={`${id}-hint${profile.error ? ` ${id}-error` : ''}${profile.conflict ? ` ${id}-conflict` : ''}`}
+        onChange={event => editor.change(event.target.value)} />
+      <p id={`${id}-hint`}>{copy.profileEditHint}</p>
+      {profile.conflict && <div id={`${id}-conflict`}>
+        <p role="status">{copy.profileChanged}</p>
+        <TalentryButton variant="secondary" disabled={profile.saving} onClick={() => {
+          editor.useLatest(); input.current?.focus()
+        }}>{copy.useLatest}</TalentryButton>
+      </div>}
+      <div className="talentry-profile-actions">
+        <TalentryButton type="submit" loading={profile.saving} loadingText={copy.saving}
+          disabled={profile.conflict}>{copy.save}</TalentryButton>
+        <TalentryButton variant="secondary" disabled={profile.saving} onClick={editor.cancel}>{copy.cancel}</TalentryButton>
+      </div>
+    </form> : <TalentryButton ref={editButton} variant="secondary" onClick={editor.edit}>{copy.editProfile}</TalentryButton>}
+    {profile.error && <p id={`${id}-error`} className="talentry-profile-error" role="alert">{copy.profileErrors[profile.error]}</p>}
+    <p role="status" aria-live="polite">{profile.saving ? copy.saving : profile.saved ? copy.saved : ''}</p>
+  </section>
+}
```

### components/account/useProfileEditor.ts

```diff
diff --git a/components/account/useProfileEditor.ts b/components/account/useProfileEditor.ts
new file mode 100644
--- /dev/null
+++ b/components/account/useProfileEditor.ts
@@ -0,0 +1,106 @@
+'use client'
+
+import { useEffect, useState, useSyncExternalStore } from 'react'
+import { useRouter } from 'next/navigation'
+import { createClient } from '@/lib/supabase'
+import { validateDisplayName } from '@/lib/account/profile-display-name'
+import type { DisplayNameError } from '@/lib/account/profile-display-name'
+
+type ProfileAuth = Pick<ReturnType<typeof createClient>['auth'], 'updateUser'>
+interface EditorState {
+  confirmed: string; draft: string; editing: boolean; saving: boolean
+  version?: string; draftVersion?: string
+  conflict: boolean; error: DisplayNameError | 'saveFailed' | null; saved: boolean
+}
+
+// Small external store keeps async transitions testable without a browser/test framework.
+export function createProfileEditor(initial: string, auth: ProfileAuth, refresh: () => void, version?: string) {
+  let state: EditorState = { confirmed: initial, draft: initial, editing: false,
+    version, draftVersion: version, saving: false, conflict: false, error: null, saved: false }
+  const listeners = new Set<() => void>()
+  let active = true
+  let request = 0
+  let inFlight = false
+  function update(patch: Partial<EditorState>) {
+    state = { ...state, ...patch }
+    listeners.forEach(listener => listener())
+  }
+  function dirty() {
+    const result = validateDisplayName(state.draft)
+    return result.valid ? result.value !== state.confirmed : state.draft !== state.confirmed
+  }
+  function reset(editing: boolean) {
+    if (inFlight) return
+    update({ draft: state.confirmed, draftVersion: state.version, editing, conflict: false, error: null, saved: false })
+  }
+  return {
+    getSnapshot: () => state,
+    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener) } },
+    activate() { active = true },
+    dispose() { active = false; request++; inFlight = false },
+    edit() { reset(true) },
+    cancel() { reset(false) },
+    useLatest() { reset(true) },
+    change(draft: string) {
+      if (!state.editing || inFlight) return
+      update({ draft, error: null, saved: false })
+    },
+    reconcile(confirmed: string, version?: string) {
+      if (confirmed === state.confirmed && version === state.version) return
+      const preserve = state.editing && (dirty() || state.conflict)
+      const draft = validateDisplayName(state.draft)
+      // Our own save may reach the server-projected props before updateUser resolves.
+      const matchesDraft = draft.valid && draft.value === confirmed
+      update({ confirmed, version, ...(preserve ? {} : { draft: confirmed, draftVersion: version, error: null }),
+        conflict: preserve && !(inFlight && matchesDraft), saved: false })
+    },
+    async save() {
+      if (!active || inFlight || !state.editing || state.conflict) return
+      const result = validateDisplayName(state.draft)
+      if (result.valid === false) { update({ error: result.error }); return }
+      if (result.value === state.confirmed) { reset(false); return }
+      // Never invent a replacement version when Auth omits its optional response field.
+      if (!state.version) { update({ error: 'saveFailed' }); return }
+      const startVersion = state.version
+      inFlight = true
+      const currentRequest = ++request
+      update({ saving: true, error: null, saved: false })
+      try {
+        const { data, error } = await auth.updateUser({ data: { display_name: result.value } })
+        if (!active || currentRequest !== request) return
+        const returned = validateDisplayName(data.user?.user_metadata?.display_name)
+        const returnedVersion = data.user?.updated_at
+        if (error || returned.valid === false || returned.value !== result.value ||
+          typeof returnedVersion !== 'string' || !returnedVersion) {
+          update({ error: 'saveFailed' })
+          return
+        }
+        if ((state.version !== startVersion && state.version !== returnedVersion) ||
+          (state.conflict && state.confirmed !== returned.value)) {
+          update({ conflict: true })
+          refresh()
+          return
+        }
+        update({ confirmed: returned.value, draft: returned.value, version: returnedVersion,
+          draftVersion: returnedVersion, editing: false,
+          conflict: false, saved: true })
+        refresh()
+      } catch {
+        if (active && currentRequest === request) update({ error: 'saveFailed' })
+      } finally {
+        if (active && currentRequest === request) { inFlight = false; update({ saving: false }) }
+      }
+    },
+  }
+}
+
+export function useProfileEditor(displayName?: string, identityVersion?: string) {
+  const router = useRouter()
+  const [editor] = useState(() => createProfileEditor(displayName ?? '', createClient().auth, () => router.refresh(), identityVersion))
+  const state = useSyncExternalStore(editor.subscribe, editor.getSnapshot, editor.getSnapshot)
+  useEffect(() => { editor.activate(); return () => editor.dispose() }, [editor])
+  useEffect(() => { editor.reconcile(displayName ?? '', identityVersion) }, [editor, displayName, identityVersion])
+  const normalized = validateDisplayName(state.draft)
+  const dirty = normalized.valid ? normalized.value !== state.confirmed : state.draft !== state.confirmed
+  return { ...state, dirty, editor }
+}
```

### lib/account/profile-display-name.ts

```diff
diff --git a/lib/account/profile-display-name.ts b/lib/account/profile-display-name.ts
new file mode 100644
--- /dev/null
+++ b/lib/account/profile-display-name.ts
@@ -0,0 +1,14 @@
+export type DisplayNameError = 'required' | 'tooLong' | 'invalid'
+export type DisplayNameResult =
+  | { valid: true; value: string }
+  | { valid: false; error: DisplayNameError }
+
+export function validateDisplayName(input: unknown): DisplayNameResult {
+  if (typeof input !== 'string') return { valid: false, error: 'invalid' }
+  // Match the existing server projection's whitespace normalization; never truncate edits.
+  const value = input.trim().replace(/\s+/g, ' ')
+  if (!value) return { valid: false, error: 'required' }
+  if (Array.from(value).length > 80) return { valid: false, error: 'tooLong' }
+  if (/[\u0000-\u001f\u007f-\u009f]/.test(value)) return { valid: false, error: 'invalid' }
+  return { valid: true, value }
+}
```

### lib/account/profile-display-name.test.cjs

```diff
diff --git a/lib/account/profile-display-name.test.cjs b/lib/account/profile-display-name.test.cjs
new file mode 100644
--- /dev/null
+++ b/lib/account/profile-display-name.test.cjs
@@ -0,0 +1,299 @@
+// Compile source in memory, matching the existing recovery test approach.
+// No provider requests, credentials, browser, or generated files.
+const { test } = require('node:test')
+const assert = require('node:assert/strict')
+const fs = require('node:fs')
+const path = require('node:path')
+const vm = require('node:vm')
+const ts = require('typescript')
+const root = path.resolve(__dirname, '../..')
+
+function load(file, imports = {}, globals = {}) {
+  const source = fs.readFileSync(path.join(root, file), 'utf8')
+  const compiled = ts.transpileModule(source, {
+    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
+  }).outputText
+  const scope = { exports: {}, ...globals, require(name) {
+    if (!(name in imports)) throw new Error(`Unexpected import: ${name}`)
+    return imports[name]
+  } }
+  vm.runInNewContext(compiled, scope)
+  return scope.exports
+}
+const validation = load('lib/account/profile-display-name.ts')
+const { validateDisplayName } = validation
+const { createProfileEditor } = load('components/account/useProfileEditor.ts', {
+  react: {}, 'next/navigation': {}, '@/lib/supabase': {},
+  '@/lib/account/profile-display-name': validation,
+})
+const plain = value => JSON.parse(JSON.stringify(value))
+
+for (const [description, input, expected] of [
+  ['ASCII', 'Ada Lovelace', 'Ada Lovelace'],
+  ['Turkish', 'Çağrı Işık Şener', 'Çağrı Işık Şener'],
+  ['German', 'Jürgen Weiß', 'Jürgen Weiß'],
+  ['Japanese', '山田 太郎', '山田 太郎'],
+  ['Arabic', 'ليلى حسن', 'ليلى حسن'],
+  ['trim', '  Ada  ', 'Ada'],
+  ['collapse whitespace', 'Ada\t\n  Lovelace\u00a0 Byron', 'Ada Lovelace Byron'],
+  ['80 code points', 'é'.repeat(80), 'é'.repeat(80)],
+  ['surrogate pairs count once', '𠮷'.repeat(80), '𠮷'.repeat(80)],
+  ['punctuation', "Anne-Marie O’Neill, Jr.", "Anne-Marie O’Neill, Jr."],
+  ['combining diacritics retained', 'Jose\u0301', 'Jose\u0301'],
+]) {
+  test(`normalization: ${description}`, () => {
+    assert.deepEqual(plain(validateDisplayName(input)), { valid: true, value: expected })
+  })
+}
+for (const [description, input, error] of [
+  ['81 code points', 'a'.repeat(81), 'tooLong'],
+  ['81 surrogate pairs', '𠮷'.repeat(81), 'tooLong'],
+  ['blank', '', 'required'], ['whitespace only', ' \t\n ', 'required'],
+  ['NUL control', 'Ada\u0000Name', 'invalid'], ['DEL control', 'Ada\u007f', 'invalid'],
+  ['C1 control', 'Ada\u0085Name', 'invalid'],
+  ['non-string', 123, 'invalid'], ['null', null, 'invalid'],
+]) {
+  test(`validation: ${description}`, () => {
+    assert.deepEqual(plain(validateDisplayName(input)), { valid: false, error })
+  })
+}
+test('validation does not mutate input or transliterate', () => {
+  const input = Object.freeze({ name: '  Çağrı Weiß  ' })
+  validateDisplayName(input.name)
+  assert.equal(input.name, '  Çağrı Weiß  ')
+  assert.equal(validateDisplayName(input.name).value, 'Çağrı Weiß')
+})
+
+function harness(initial = 'Ada', version = 'V1') {
+  const calls = []
+  let refreshes = 0
+  let implementation = async value => ({ data: { user: { updated_at: 'V2', user_metadata: { display_name: value } } }, error: null })
+  const editor = createProfileEditor(initial, { updateUser(payload) {
+    calls.push(plain(payload))
+    return implementation(payload.data.display_name)
+  } }, () => refreshes++, version)
+  return { editor, calls, get state() { return editor.getSnapshot() },
+    get refreshes() { return refreshes }, provider(fn) { implementation = fn } }
+}
+function deferred() {
+  let resolve
+  const promise = new Promise(done => { resolve = done })
+  return { promise, resolve }
+}
+const success = (value, version = 'V2') => ({ data: { user: { updated_at: version, user_metadata: { display_name: value } } }, error: null })
+
+test('unchanged normalized value closes without provider mutation', async () => {
+  const h = harness(); h.editor.edit(); h.editor.change('  Ada '); await h.editor.save()
+  assert.equal(h.calls.length, 0); assert.equal(h.state.editing, false); assert.equal(h.state.saved, false)
+})
+test('valid save sends only display_name and confirms returned identity', async () => {
+  const h = harness(); h.editor.edit(); h.editor.change('  Çağrı   Weiß '); await h.editor.save()
+  assert.deepEqual(h.calls, [{ data: { display_name: 'Çağrı Weiß' } }])
+  assert.equal(h.state.confirmed, 'Çağrı Weiß'); assert.equal(h.state.editing, false)
+  assert.equal(h.state.saved, true); assert.equal(h.refreshes, 1)
+})
+test('duplicate synchronous saves produce one mutation and a saving state', async () => {
+  const h = harness(); const pending = deferred(); h.provider(() => pending.promise)
+  h.editor.edit(); h.editor.change('Grace'); const saving = h.editor.save(); void h.editor.save()
+  assert.equal(h.calls.length, 1); assert.equal(h.state.saving, true)
+  h.editor.change('Blocked'); h.editor.cancel(); assert.equal(h.state.draft, 'Grace')
+  pending.resolve(success('Grace')); await saving; assert.equal(h.state.saving, false)
+})
+for (const [name, provider] of [
+  ['provider error', async () => ({ data: { user: null }, error: { message: 'Private provider detail' } })],
+  ['network exception', async () => { throw new Error('Offline') }],
+  ['unconfirmed response', async () => success('Unexpected')],
+]) {
+  test(`${name} preserves editable draft without success or refresh`, async () => {
+    const h = harness(); h.provider(provider); h.editor.edit(); h.editor.change('Grace'); await h.editor.save()
+    assert.equal(h.state.draft, 'Grace'); assert.equal(h.state.confirmed, 'Ada')
+    assert.equal(h.state.editing, true); assert.equal(h.state.error, 'saveFailed')
+    assert.equal(h.state.saved, false); assert.equal(h.state.saving, false); assert.equal(h.refreshes, 0)
+  })
+}
+test('provider failure permits explicit retry', async () => {
+  const h = harness(); h.provider(async () => { throw new Error('Offline') })
+  h.editor.edit(); h.editor.change('Grace'); await h.editor.save()
+  h.provider(async value => success(value)); await h.editor.save()
+  assert.equal(h.calls.length, 2); assert.equal(h.state.saved, true); assert.equal(h.state.error, null)
+})
+test('invalid save fails locally and cancel resets draft/errors without mutation', async () => {
+  const h = harness(); h.editor.edit(); h.editor.change('   '); await h.editor.save()
+  assert.equal(h.state.error, 'required'); assert.equal(h.calls.length, 0)
+  h.editor.cancel(); assert.equal(h.state.draft, 'Ada'); assert.equal(h.state.error, null)
+  assert.equal(h.state.editing, false)
+})
+test('missing name stays missing until an explicit valid save', async () => {
+  const h = harness(''); assert.equal(h.state.confirmed, '')
+  h.editor.edit(); await h.editor.save(); assert.equal(h.calls.length, 0)
+  h.editor.change('山田'); await h.editor.save(); assert.equal(h.state.confirmed, '山田')
+})
+test('clean view and clean editor follow external identity', () => {
+  const h = harness(); h.editor.reconcile('Grace', 'V2'); assert.equal(h.state.confirmed, 'Grace')
+  h.editor.edit(); h.editor.reconcile('Lin', 'V3'); assert.equal(h.state.draft, 'Lin')
+  assert.equal(h.state.conflict, false)
+})
+test('dirty draft survives external updates and save waits for Use latest', async () => {
+  const h = harness(); h.editor.edit(); h.editor.change('My draft'); h.editor.reconcile('Grace', 'V2')
+  assert.equal(h.state.draft, 'My draft'); assert.equal(h.state.confirmed, 'Grace')
+  assert.equal(h.state.conflict, true); await h.editor.save(); assert.equal(h.calls.length, 0)
+  h.editor.change('Another draft'); await h.editor.save(); assert.equal(h.calls.length, 0)
+  h.editor.reconcile('Lin', 'V3'); h.editor.useLatest(); assert.equal(h.state.draft, 'Lin')
+  assert.equal(h.state.conflict, false); h.editor.change('My choice'); await h.editor.save()
+  assert.equal(h.state.confirmed, 'My choice')
+})
+test('cancel after conflict restores latest confirmed value', () => {
+  const h = harness(); h.editor.edit(); h.editor.change('Draft'); h.editor.reconcile('Latest', 'V2')
+  h.editor.cancel(); assert.equal(h.state.draft, 'Latest'); assert.equal(h.state.conflict, false)
+  assert.equal(h.calls.length, 0)
+})
+test('own save refresh before provider completion does not create a conflict', async () => {
+  const h = harness(); const pending = deferred(); h.provider(() => pending.promise)
+  h.editor.edit(); h.editor.change('Grace'); const saving = h.editor.save()
+  h.editor.reconcile('Grace', 'V2'); pending.resolve(success('Grace')); await saving
+  assert.equal(h.state.conflict, false); assert.equal(h.state.saved, true)
+})
+test('external conflicting update during save is not silently overwritten', async () => {
+  const h = harness(); const pending = deferred(); h.provider(() => pending.promise)
+  h.editor.edit(); h.editor.change('Grace'); const saving = h.editor.save()
+  h.editor.reconcile('Lin', 'V3'); pending.resolve(success('Grace')); await saving
+  assert.equal(h.state.confirmed, 'Lin'); assert.equal(h.state.draft, 'Grace')
+  assert.equal(h.state.conflict, true); assert.equal(h.state.saved, false)
+})
+test('disposed editor ignores a late provider response and refresh', async () => {
+  const h = harness(); const pending = deferred(); h.provider(() => pending.promise)
+  h.editor.edit(); h.editor.change('Grace'); const saving = h.editor.save()
+  h.editor.dispose(); pending.resolve(success('Grace')); await saving
+  assert.equal(h.refreshes, 0); assert.equal(h.state.confirmed, 'Ada')
+})
+
+// Render the real hook with persistent state and React-style dependency comparison.
+// This covers the effect wiring that controller-only tests cannot exercise.
+function profileHookHarness() {
+  let stored, rendered, name = 'A', version = 'V1', effectIndex = 0, refreshes = 0
+  const effects = [], pending = [], calls = []
+  const router = { refresh() { refreshes++ } }
+  const react = {
+    useState(init) { if (!stored) stored = init(); return [stored, () => {}] },
+    useSyncExternalStore(subscribe, getSnapshot) { return getSnapshot() },
+    useEffect(fn, deps) {
+      const index = effectIndex++, previous = effects[index]
+      if (!previous || deps.some((value, i) => !Object.is(value, previous.deps[i]))) {
+        pending.push(() => { previous?.cleanup?.(); effects[index] = { deps, cleanup: fn() } })
+      }
+    },
+  }
+  const hook = load('components/account/useProfileEditor.ts', {
+    react, 'next/navigation': { useRouter: () => router },
+    '@/lib/supabase': { createClient: () => ({ auth: { async updateUser(payload) {
+      calls.push(plain(payload)); return success(payload.data.display_name, 'V2')
+    } } }) }, '@/lib/account/profile-display-name': validation,
+  }).useProfileEditor
+  function render(nextName = name, nextVersion = version) {
+    name = nextName; version = nextVersion; effectIndex = 0
+    rendered = hook(name, version)
+    while (pending.length) pending.shift()()
+  }
+  render()
+  return { render, calls, get editor() { return rendered.editor },
+    get state() { return rendered.editor.getSnapshot() }, get refreshes() { return refreshes } }
+}
+test('hook: A/V1 -> local B/V2 -> server A/V3 reconciles the clean view', async () => {
+  const h = profileHookHarness(); h.editor.edit(); h.editor.change('B'); await h.editor.save()
+  assert.equal(h.state.confirmed, 'B'); assert.equal(h.state.version, 'V2')
+  // No server render with B occurs: both adjacent server name props remain A.
+  h.render('A', 'V3')
+  assert.equal(h.state.confirmed, 'A'); assert.equal(h.state.draft, 'A')
+  assert.equal(h.state.version, 'V3'); assert.equal(h.state.conflict, false)
+})
+for (const reconcile of ['useLatest', 'cancel']) {
+  test(`hook: repeated A/V3 preserves dirty draft and blocks Save until ${reconcile}`, async () => {
+    const h = profileHookHarness(); h.editor.edit(); h.editor.change('B'); await h.editor.save()
+    h.editor.edit(); h.editor.change('My draft'); h.render('A', 'V3')
+    assert.equal(h.state.draft, 'My draft'); assert.equal(h.state.draftVersion, 'V2')
+    assert.equal(h.state.confirmed, 'A'); assert.equal(h.state.version, 'V3')
+    assert.equal(h.state.conflict, true); await h.editor.save(); assert.equal(h.calls.length, 1)
+    h.editor[reconcile](); assert.equal(h.state.draft, 'A'); assert.equal(h.state.draftVersion, 'V3')
+    assert.equal(h.state.conflict, false); assert.equal(h.state.editing, reconcile === 'useLatest')
+  })
+}
+test('hook: own saved snapshot V2 is the baseline for the next draft', async () => {
+  const h = profileHookHarness(); h.editor.edit(); h.editor.change('B'); await h.editor.save()
+  h.editor.edit(); h.editor.change('Next draft'); h.render('B', 'V2')
+  assert.equal(h.state.version, 'V2'); assert.equal(h.state.draftVersion, 'V2')
+  assert.equal(h.state.draft, 'Next draft'); assert.equal(h.state.conflict, false)
+  assert.deepEqual(h.calls, [{ data: { display_name: 'B' } }]); assert.equal(h.refreshes, 1)
+})
+test('hook: same name with a new version conflicts, identical snapshot does not', () => {
+  const h = profileHookHarness(); h.editor.edit(); h.editor.change('Draft'); h.render('A', 'V1')
+  assert.equal(h.state.conflict, false)
+  h.render('A', 'V3'); assert.equal(h.state.conflict, true); assert.equal(h.state.draft, 'Draft')
+})
+test('missing initial server version blocks mutation without inventing a version', async () => {
+  const h = harness('Ada', ''); h.editor.edit(); h.editor.change('Grace'); await h.editor.save()
+  assert.equal(h.calls.length, 0); assert.equal(h.state.error, 'saveFailed'); assert.equal(h.state.version, '')
+})
+test('missing provider version preserves draft and never claims confirmed success', async () => {
+  const h = harness()
+  h.provider(async value => ({ data: { user: { user_metadata: { display_name: value } } }, error: null }))
+  h.editor.edit(); h.editor.change('Grace'); await h.editor.save()
+  assert.equal(h.state.saved, false); assert.equal(h.state.editing, true)
+  assert.equal(h.state.draft, 'Grace'); assert.equal(h.state.version, 'V1'); assert.equal(h.state.error, 'saveFailed')
+})
+test('a matching name from another version during save still requires reconciliation', async () => {
+  const h = harness(); const pending = deferred(); h.provider(() => pending.promise)
+  h.editor.edit(); h.editor.change('Grace'); const saving = h.editor.save()
+  h.editor.reconcile('Grace', 'V3'); pending.resolve(success('Grace', 'V2')); await saving
+  assert.equal(h.state.conflict, true); assert.equal(h.state.version, 'V3')
+  assert.equal(h.state.draftVersion, 'V1'); assert.equal(h.state.saved, false)
+})
+
+// Exercise the real account hook's subscription/timer effect with minimal React bindings.
+function accountHarness() {
+  let callback, cleanup, refreshes = 0, unsubscribed = false, time = 10000, stateIndex = 0
+  let insideCallback = false
+  const events = new Map(), timers = new Map(), navigations = []
+  let nextTimer = 0
+  const supabase = { auth: {
+    onAuthStateChange(fn) { callback = fn; return { data: { subscription: { unsubscribe() { unsubscribed = true } } } } },
+    async getSession() { return { data: { session: null }, error: null } },
+  } }
+  const react = {
+    useState(initial) { const value = stateIndex++ === 0 ? supabase : initial; return [value, () => {}] },
+    useRef(value) { return { current: value } }, useEffect(fn) { cleanup = fn() },
+  }
+  const mod = load('components/account/useAccountSession.ts', {
+    react, '@/lib/supabase': { createClient: () => supabase },
+    'next/navigation': { useRouter: () => ({ refresh() { assert.equal(insideCallback, false); refreshes++ } }) },
+  }, {
+    Date: { now: () => time },
+    setTimeout(fn) { const id = ++nextTimer; timers.set(id, fn); return id },
+    clearTimeout(id) { timers.delete(id) },
+    window: { location: { replace(url) { navigations.push(url) } },
+      addEventListener(name, fn) { events.set(name, fn) }, removeEventListener(name) { events.delete(name) } },
+  })
+  mod.useAccountSession()
+  return { emit(event, session = { user: {} }) { insideCallback = true; callback(event, session); insideCallback = false },
+    flush() { for (const [id, fn] of timers) { timers.delete(id); fn() } },
+    focus() { events.get('focus')?.() }, advance() { time += 2000 }, cleanup: () => cleanup(),
+    get refreshes() { return refreshes }, get unsubscribed() { return unsubscribed }, events, navigations }
+}
+test('USER_UPDATED coalesces events and refreshes outside the Auth callback', () => {
+  const h = accountHarness(); h.emit('USER_UPDATED'); h.emit('USER_UPDATED')
+  assert.equal(h.refreshes, 0); h.flush(); assert.equal(h.refreshes, 1)
+})
+test('focus refresh is bounded and has no polling', () => {
+  const h = accountHarness(); h.focus(); h.flush(); h.focus(); h.flush(); assert.equal(h.refreshes, 1)
+  h.advance(); h.focus(); h.flush(); assert.equal(h.refreshes, 2); h.flush(); assert.equal(h.refreshes, 2)
+})
+test('account cleanup cancels scheduled refresh and removes listeners', () => {
+  const h = accountHarness(); h.emit('USER_UPDATED'); h.cleanup(); h.flush()
+  assert.equal(h.refreshes, 0); assert.equal(h.unsubscribed, true); assert.equal(h.events.size, 0)
+})
+test('sign-out preserves login navigation and suppresses pending refresh', () => {
+  const h = accountHarness(); h.emit('USER_UPDATED'); h.emit('SIGNED_OUT', null); h.flush()
+  assert.deepEqual(h.navigations, ['/login']); assert.equal(h.refreshes, 0)
+})
+test('initial missing session still redirects to login', () => {
+  const h = accountHarness(); h.emit('INITIAL_SESSION', null); assert.deepEqual(h.navigations, ['/login'])
+})
```

### docs/01_Engineering/Sprint_PROFILE_EDIT_01_Summary.md

```diff
diff --git a/docs/01_Engineering/Sprint_PROFILE_EDIT_01_Summary.md b/docs/01_Engineering/Sprint_PROFILE_EDIT_01_Summary.md
new file mode 100644
--- /dev/null
+++ b/docs/01_Engineering/Sprint_PROFILE_EDIT_01_Summary.md
@@ -0,0 +1,145 @@
+# Sprint PROFILE_EDIT_01 Summary
+
+- Title: Display-name-only profile editing
+- Date: 2026-10-02
+- Branch: feature/auth-foundation
+- Starting HEAD and remote-tracking reference: 56b9cdf
+- Starting working tree: clean
+- Status: IMPLEMENTATION + AUTOMATED VALIDATION + LOCAL BROWSER ACCEPTANCE: PASS. Documentation review pending; Git actions not authorized.
+- Goal: Allow the authenticated user to edit and persist only their display name in the existing account shell.
+- Approval status: Discovery and bounded implementation were authorized. The user has confirmed local browser/runtime acceptance COMPLETE and PASS. No stage, commit, push, or next stage authorized by this report.
+
+## Completed behavior
+
+- One-field inline profile editor; email remains visible and read-only.
+- Writes only authenticated Supabase updateUser({ data: { display_name: normalizedValue } }). No target user ID, admin client, credentials, or authorization fields.
+- No profile table, application profile API, schema/configuration change, or dependency.
+- String validation, trim/collapse whitespace, 1-80 Unicode code points, remaining C0/DEL/C1 control rejection; international text and punctuation preserved. Blank/clear-name saves unsupported; existing absent names remain valid until edited.
+- Synchronous duplicate-save guard, unchanged-value no-op, provider-confirmed local value, retryable errors, Cancel, and localized TR/EN/DE status messages.
+- Clean views refresh from server-projected identity; dirty drafts survive external changes and Save is blocked until explicit reconciliation or Cancel.
+- USER_UPDATED schedules router.refresh outside the auth callback. Focus provides a two-second-bounded fallback; no polling. Successful save also requests a server refresh.
+- Server projection and recovery USER_UPDATED fail-closed behavior remain unchanged.
+
+## Modified implementation files
+
+- app/profile/page.tsx
+- components/account/AccountPageContent.tsx
+- components/account/account-copy.ts
+- components/account/useAccountSession.ts
+- styles/talentry-account.css
+
+## Created files
+
+- components/account/ProfileEditor.tsx
+- components/account/useProfileEditor.ts
+- lib/account/profile-display-name.ts
+- lib/account/profile-display-name.test.cjs
+- docs/01_Engineering/Sprint_PROFILE_EDIT_01_Summary.md
+- docs/01_Engineering/Sprint_PROFILE_EDIT_01_Engineering_Report.md
+
+## Validation results
+
+Executed in the requested order:
+
+1. node --test lib/account/profile-display-name.test.cjs: exit 0; 49/49 PASS after the snapshot correction, zero failures/skips (initial implementation: 41/41).
+2. node --test components/auth/recovery-session.test.cjs: exit 0; 34/34 PASS, including external user-update recovery revocation.
+3. npx tsc --noEmit --incremental false: exit 0; PASS.
+4. git diff --check: exit 0; PASS; existing LF-to-CRLF warnings.
+5. Read-only Node process inspection: first sandbox attempt failed with Access denied; explicitly approved elevated retry exited 0. Four inspected Node processes had no repository, Next dev, or Next server match. No repository dev server found; no server started/stopped.
+6. npm run build: exit 0; Next.js 14.2.5; compilation, types, page data, generation 22/22, optimization, and traces PASS.
+
+Warnings/notices: two webpack cache snapshot warnings (Unable to snapshot resolve dependencies); Git LF-to-CRLF notices; npm 11.16.0 -> 12.2.0 update notices during TypeScript/build. No dependency update performed.
+
+## Implementation checkpoint risks (historical; final acceptance below supersedes pending items)
+
+- Browser acceptance is pending: actual Supabase persistence across refresh/logout/login, cross-account isolation, menu initials, cross-tab changes, keyboard/announcements, TR/EN/DE, and mobile usability.
+- Tests compile real source in memory and use provider/React-effect doubles; they do not prove browser or deployed-provider behavior.
+- No atomic multi-device conflict guarantee. Remote-device changes are observed when the server identity refreshes, including focus fallback; no Realtime subscription or polling.
+- App validation does not impose a database constraint on direct metadata writes. Existing defensive server projection is unchanged.
+- Drafts stay in memory and are discarded on navigation. No automatic retry or clear-name action.
+- A successful profile update can revoke an open recovery form in another same-profile tab. This is the explicitly approved fail-closed behavior, not suppressed by this sprint.
+- The known SDK failure-path PKCE-verifier cleanup remains unchanged; overlapping pending authentication/recovery flows are not newly guaranteed.
+- PDF deployed packaging/resource acceptance remains a separate pending operational follow-up.
+
+Project Memory and all frozen modules remain unchanged. Full diffs, interfaces, and the manual acceptance checklist are in the companion Engineering Report. Stop for review; do not commit or begin another stage automatically.
+
+## Pre-browser snapshot correction — 2026-10-02 (historical checkpoint)
+
+Pre-browser review found that scalar-only effect dependencies could miss A -> local save B -> fresh server A when the last server prop was still A. The authorized correction uses the authenticated user's top-level updated_at, passed unchanged as identityVersion from app/profile/page.tsx through AccountPageContent and ProfileEditor. Name fallback projection, auth guards, and the shared account refresh hook are unchanged by this correction.
+
+Installed Auth SDK types expose updated_at separately from metadata; the SDK forwards the Auth server response. Official Supabase Auth server source confirms metadata writes use UpdateOnly, preserve updated_at in the update columns, and rely on Pop to assign the server timestamp. Detailed source links and limitations are in the Engineering Report. This is source verification, not live deployed-provider acceptance.
+
+The hook observes both name and version. New versions reconcile repeated names; dirty drafts keep their original baseline and block Save until Use latest or Cancel. Successful saves take both name and version from the returned provider user, preventing the same successful mutation's later refresh from creating a false conflict. Missing initial versions block mutation; missing returned versions preserve the draft and do not claim success. No timestamp/token is invented, and no raw metadata or user ID is projected.
+
+Eight added cases cover hook-level clean/dirty A/V1 -> B/V2 -> A/V3, both reconciliation actions, own-save baseline, same-name new-version conflict, missing versions, and in-flight matching-name/different-version updates. All prior coverage remains. Focused tests 49/49, recovery 34/34, TypeScript, whitespace check, and production build 22/22 all PASS, exit 0, in the prescribed order. The process inspection again required an approved elevated retry after sandbox Access denied; no dev server was found. Two webpack snapshot warnings, LF-to-CRLF warnings, and npm upgrade notices remain; no upgrade performed.
+
+Correction changed only app/profile/page.tsx, AccountPageContent.tsx, ProfileEditor.tsx, useProfileEditor.ts, profile-display-name.test.cjs, and these two sprint reports. No new files were added by the correction. updated_at covers the whole auth user, so unrelated auth updates can conservatively require draft reconciliation. It is not an atomic revision or compare-and-swap guarantee; deployed timestamp availability/behavior and the browser A -> B -> A sequence remain manual acceptance items. Project Memory remains untouched; final acceptance/commit approval is pending.
+
+## Final runtime acceptance — PROFILE_EDIT_01 — 2026-10-02
+
+**IMPLEMENTATION + AUTOMATED VALIDATION + LOCAL BROWSER ACCEPTANCE: PASS**
+
+At the 2026-10-02 documentation/pre-commit checkpoint, HEAD and local origin/feature/auth-foundation were 56b9cdf on feature/auth-foundation; PROFILE_EDIT_01 work was uncommitted. No future commit hash is asserted. The user reported the dev server manually stopped. No tests/build or browser checks were rerun during this documentation-only update; no server restart or Git mutation was performed. No next stage is authorized.
+
+### Final architecture and name contract
+
+Display-name-only V1 writes user_metadata.display_name through authenticated browser supabase.auth.updateUser({ data: { display_name: normalizedValue } }). No target user ID, app_metadata, service-role/admin mutation, profile table, application profile API, schema/RLS, dependency or configuration change. Email remains read-only; email/password/avatar changes are outside scope. Server projection remains defensive: display_name -> full_name -> name -> honest fallback. Metadata is display text only, never authorization.
+
+The name contract trims leading/trailing whitespace, collapses internal whitespace runs, requires 1-80 Unicode code points and rejects remaining control characters. International Unicode, accents/diacritics and punctuation are preserved. No transliteration, first/last-name split, email-derived name or clear-name action. Existing missing-name fallback remains valid until edited.
+
+### Identity snapshot and refresh
+
+The server-projected editor snapshot contains projected display name and the authenticated user's top-level user.updated_at as identityVersion. This server-controlled value is separate from user_metadata and used only for identity reconciliation, never authorization. No random or client-generated version token is used.
+
+A/V1 -> local save B/V2 -> later external/server A/V3 is recognized as a NEW snapshot even when the name repeats. Clean editors accept the fresh snapshot and update confirmed/displayed name. Dirty editors preserve the draft, detect external changes, block Save, and require explicit Use latest / Cancel reconciliation. Successful saves use the provider-returned user for confirmed name and updated_at baseline, avoiding a false conflict when that same saved snapshot returns through refresh.
+
+USER_UPDATED schedules bounded refresh outside the auth callback; focus refresh is a bounded fallback, with no polling. Existing SIGNED_OUT/session-loss navigation is preserved. Server-projected identity remains authoritative; shared menu and clean profile views update after metadata changes.
+
+### Recovery interaction
+
+PROFILE_EDIT_01 did NOT modify recovery code. A successful profile metadata update emits USER_UPDATED. An open recovery form in another same-profile tab therefore remains fail-closed and becomes unavailable. This intentional behavior was LIVE-VERIFIED: the recovery tab transitioned to Reset link unavailable. It is not a regression.
+
+### Validation evidence
+
+Recorded final automated validation: focused profile tests 49/49 PASS; recovery regression 34/34 PASS; TypeScript PASS; git diff --check PASS; production build PASS, 22/22 pages. These existing test/build results were not rerun. Prior webpack cache snapshot warnings, LF-to-CRLF notices and npm update notices remain documented; no dependency update was performed.
+
+### Local browser acceptance
+
+Evidence: USER-VERIFIED PASS in Chrome normal profile, supplied by the user on 2026-10-02. This documentation step did not independently repeat the browser checks.
+
+| Check | User-confirmed observation | Result |
+| --- | --- | --- |
+| A. Display-name save | /profile saved Çağrı Öztürk; profile card and menu/avatar identity updated. | USER-VERIFIED PASS |
+| B. Refresh persistence | Ctrl+R retained the saved name. | USER-VERIFIED PASS |
+| C. Logout/login persistence | Same-account logout/login retained the saved name. | USER-VERIFIED PASS |
+| D. Cross-account isolation | Second test account did not show the first account's edited name. | USER-VERIFIED PASS |
+| E. Cancel | Temporary Deneme İsim draft cancelled; persisted value unchanged. | USER-VERIFIED PASS |
+| F. Blank validation | Blank/whitespace rejected; no save. | USER-VERIFIED PASS |
+| G. Length validation | 81-character value rejected. | USER-VERIFIED PASS |
+| H. Clean cross-tab update | Tab B saved Sekma Testi / equivalent tested value; clean Tab A updated automatically without manual refresh. No timing measurement is asserted. | USER-VERIFIED PASS |
+| I. Dirty draft conflict | Tab A retained Taslak İsim after Tab B saved Dış Değişiklik; conflict notice appeared and Save was blocked. | USER-VERIFIED PASS |
+| J. Use latest | Adopted current server value and cleared conflict. | USER-VERIFIED PASS |
+| K. Repeated A -> B -> A | Clean view moved to temporary B; another tab restored prior A under a NEW server identity version; clean view reconciled back to A. Validates the pre-browser updated_at snapshot fix. | USER-VERIFIED PASS |
+| L. Mobile | Approximately 400 x 690: editing usable, no horizontal overflow or control overlap, normal vertical scrolling. | USER-VERIFIED PASS |
+| M. Autofocus/keyboard | Edit Profile focused the input; typing worked without an extra click. | USER-VERIFIED PASS |
+| N. Recovery interaction | Fresh same-profile recovery form became Reset link unavailable after another tab saved profile metadata. Intentional fail-closed behavior. | USER-VERIFIED PASS |
+| O. English copy | Switching application UI to English showed correct English profile-edit copy. | USER-VERIFIED PASS |
+| P. German copy | Switching application UI to German showed correct German profile-edit copy. | USER-VERIFIED PASS |
+| Q. Session loss while editing | Another same-profile tab logged out; dirty profile/edit tab navigated to login and the draft was not persisted. | USER-VERIFIED PASS |
+
+Provider failure/retry and rapid duplicate submission prevention were NOT intentionally forced against the live provider. They are automated-test-covered only, not browser-tested. Other unlisted browser/device or screen-reader behavior is not newly claimed as verified.
+
+### Remaining non-blocking limitations
+
+- user.updated_at is a whole-auth-user version, not an atomic profile revision; unrelated auth-user changes may conservatively trigger reconciliation.
+- No atomic multi-device conflict guarantee exists.
+- Drafts are memory-only and discarded on navigation.
+- External changes are observed through auth events/focus/refresh behavior.
+- Deployed Supabase project behavior was live-tested only for the exercised flows.
+- No profile-schema enforcement exists because V1 intentionally uses auth metadata.
+
+These limitations are not blockers for the accepted V1. REPORT_EXPORT_01 deployed packaging/resource smoke remains PENDING as a deployment/operations follow-up, not a local functional blocker; PDF implementation remains closed. Unrelated deferred work remains unchanged.
+
+### Documentation closure scope
+
+Updated these two existing sprint reports in place and CURRENT_STATE.md, STAGE_LOG.md, DEFERRED_FIXES.md, DECISIONS_AND_RISKS.md under docs/04_Project_Memory. No duplicate reports. No code/test/dependency/config changes during this documentation step. Documentation review remains pending; no stage/commit/push or next stage is authorized.
```
