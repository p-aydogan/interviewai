# Sprint PREAUTH_CARD_SOFTENING_01 Summary

- Title: Pre-auth card material softening
- Parent stage: PREAUTH_ONBOARDING_01
- Branch: feature/auth-foundation
- HEAD: 1ca99820f49eb8dbf5c59dcb841f66d87561fbbb
- Status: CARD SOFTENING COMPLETE — READY FOR RUNTIME REVIEW
- Goal: Integrate the stable dark card with the approved ocean-swell atmosphere.
- Modified file: styles/talentry-pre-auth.css, only the shared card rule.
- Created files: this Summary and Sprint_PREAUTH_CARD_SOFTENING_01_Engineering_Report.md.
- Material: 94–96% opaque dark navy gradient, faint 4% indigo wash, border opacity 16% -> 8%, token radius 22px -> 28px, one diffuse 0 16px 64px navy shadow at 18% opacity.
- Backdrop blur: None.
- Behavior: No routing, auth, state/persistence, copy, Result, background-motion or content-layout change.
- Validation: TypeScript PASS (exit 0); git diff --check PASS (exit 0). npm update notice and Git LF-to-CRLF notices; no package change.
- Risks: Visual separation, text contrast over motion and 390x844 rendering await runtime review.
- Build: Not run as instructed.
- Approval: Awaiting runtime review and acceptance. No staging, commit, push or Project Memory update. Existing reports preserved.
