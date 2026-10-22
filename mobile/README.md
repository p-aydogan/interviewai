# Talentry mobile architecture probe

Validated: 15 mocked/domain tests; TypeScript; Expo compatibility; Doctor 20/20;
Android and iOS Hermes exports. Bundle evidence is not native/device acceptance.

## Verified architecture

Expo SDK 58 + Expo Router development-build shell, with bootstrap/public/private
diagnostic routes. Auth tests cover verified hydration, mismatch/stale rejection,
logout, one AppState registration and foreground-only refresh. Native auth,
route transitions and absence of private-content flash are not device-tested.
Supabase is auth-only; no live auth/API/data requests were made during validation.

SecureStore uses serialized two-bank storage: at most 64 chunks of 1200 UTF-8
bytes per bank and versioned metadata as commit point. Tests cover Unicode,
rotation, partial writes, missing/corrupt sets, orphan cleanup, oversize input,
read/delete errors and logout deletion. Checksum is for corruption detection,
not cryptographic integrity. Actual Keychain/Keystore atomicity, process death
and persistent deletion failures remain device gates; physical erasure cannot
be guaranteed when the native store fails. No plaintext AsyncStorage.

API tests cover approved-origin bearer attachment, redirect:error configuration,
401, sanitized errors, 256 KiB consumed JSON cap, timeout/cancellation and no
retry. Native transport is expo/fetch; its redirect enforcement was source-reviewed,
not live/device-tested. No API action runs from this probe. Full refresh/retry UX
belongs to MOBILE_AUTH_01; future save replay must preserve frozen ID/payload.

Both exported maps contain the three approved root interview helpers and one
React entry. Metro guard tests reject root React, provider and browser files.
Root/mobile manifests, lockfiles, node_modules and TypeScript configs are separate.
No workspaces. Completion reuse injects a fixed UUID only in the synthetic local
probe; production UUID generation is deferred, with root helper unchanged.

Layout-class tests cover compact/medium/expanded widths and large text. Probe
thresholds are 600/1000 effective width after font scaling, not final breakpoints.
The shell contains safe-area, keyboard-avoidance, scrolling and expanded panes;
real keyboard/pointer/accessibility/tablet resizing is not accepted yet. Token
values project styles/talentry-tokens.css; native system font fallback is used.
No animations. Generated icon/splash assets are non-production placeholders.

## Commands and configuration

Run from mobile: npm test; npm run typecheck; npx expo install --check;
npx expo-doctor. Start scripts target development clients. Server/native/cloud
build execution, signing and stores require separate authorization. Expo Go is
not the compatibility target. EAS profiles are configuration only; no projectId,
final bundle/package identifiers, account linking or signing credentials exist.
The talentry-bootstrap scheme is non-production; auth callbacks are deferred.

.env.example contains only public configuration names, with no real values.
Tests cover missing/malformed config, privileged key rejection and HTTPS except
explicit development loopback/private IPv4 LAN addresses. No production fallback.
Real-device localhost means the device, not the developer computer.

Detail/delete/PDF require a later backend bearer extension; no direct Supabase
application-data bypass. Full auth/recovery UX, interviews, media, payments, push
and durable resume are deferred. SDK 58 template dependencies remain a superset;
no root packages or HeyGen chains were inherited. Audit: 19 high package entries,
zero critical, from braces/Metro and node-forge tooling; neither vulnerable module
appears in exported runtime maps. Production dependency review remains open.
No audit fix. Audit JSON stayed in memory/stdout, exports under OS TEMP.
