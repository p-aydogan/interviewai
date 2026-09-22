# Sprint PREAUTH_MOBILE_ONBOARDING_BALANCE_01 Engineering Report

## 1. Identity
Date: 2026-09-21. Branch feature/auth-foundation. HEAD 1ca99820f49eb8dbf5c59dcb841f66d87561fbbb. Parent PREAUTH_ONBOARDING_01. Acceptance pending.

## 2. Scope
Positioning only at <=767px, onboarding only. Lower the card into the upper-middle zone without full vertical centering or internal changes.

## 3. Repository Before Work
Four existing modified tracked files and twenty-eight untracked additions; all preserved. HEAD unchanged. Incremental diff uses this request's working-tree CSS baseline.

## 4. Decision
Replace the fixed 32px onboarding grid gap with clamp(space-8, 9dvh, space-16 + space-4), preceded by the equivalent vh fallback.
At 390x844 this calculates to 75.96px, moving the card down 43.96px relative to the previous position. Values are calculated from CSS, not measured browser output.
The gap contracts toward 32px on short screens and caps at 80px on tall screens. Existing content-sized rows/start alignment preserve normal document flow and lower breathing room; no full centering, fixed card height, transforms or negative margins.

## 5–6. Files
Modified styles/talentry-pre-auth.css: replaces one gap declaration with two fallback-compatible declarations.
Created docs/01_Engineering/Sprint_PREAUTH_MOBILE_ONBOARDING_BALANCE_01_Summary.md and docs/01_Engineering/Sprint_PREAUTH_MOBILE_ONBOARDING_BALANCE_01_Engineering_Report.md: acceptance records.
No deletions. Previous reports unchanged.

## 7. Interfaces
No props, types, callbacks, state or API changes.

## 8. Accessibility
Targets, focus, screen-reader status, labels and keyboard behavior unchanged. Content can grow and scroll on short/zoomed/German layouts; no clipping introduced.

## 9. Styling
Existing spacing tokens establish 32px/80px limits. Changes stay in the <=767px :has(#pre-auth-panel) selector. Card width/height/padding/material, typography, icons, dots/buttons and all Splash/desktop rules untouched.

## 10. Validation
- npx.cmd tsc --noEmit --incremental false: exit 0; no TypeScript diagnostics. npm update notice 11.16.0 -> 12.0.2; no update performed.
- git diff --check: exit 0; no whitespace errors. Git LF-to-CRLF notices concern prior tracked modifications.
- git status --short: prior work plus new refinement reports.
- Build not run.
- Runtime pending: 390x844 perceived balance, all panels, short/zoom/German scroll, Splash and >=768px regression. No browser acceptance claimed.

## 11. Git State
Four pre-existing tracked modifications: app/page.tsx, app/result/page.tsx, components/result/ResultContent.tsx, components/result/ResultShell.tsx.
Thirty untracked files after reports: six pre-auth files, stylesheet, ADR-001 and twenty-two reports. Nothing staged; HEAD unchanged. No Git mutation or Project Memory update.

## 12. Complete Incremental Diffs
~~~diff
diff --git a/styles/talentry-pre-auth.css b/styles/talentry-pre-auth.css
--- a/styles/talentry-pre-auth.css
+++ b/styles/talentry-pre-auth.css
@@ -205,5 +205,6 @@
   .talentry-pre-auth__frame:has(#pre-auth-panel) {
     grid-template-rows: auto auto;
     align-content: start;
-    gap: var(--talentry-space-8);
+    gap: clamp(var(--talentry-space-8), 9vh, calc(var(--talentry-space-16) + var(--talentry-space-4)));
+    gap: clamp(var(--talentry-space-8), 9dvh, calc(var(--talentry-space-16) + var(--talentry-space-4)));
   }
~~~

New Summary:
~~~diff
diff --git a/docs/01_Engineering/Sprint_PREAUTH_MOBILE_ONBOARDING_BALANCE_01_Summary.md b/docs/01_Engineering/Sprint_PREAUTH_MOBILE_ONBOARDING_BALANCE_01_Summary.md
new file mode 100644
--- /dev/null
+++ b/docs/01_Engineering/Sprint_PREAUTH_MOBILE_ONBOARDING_BALANCE_01_Summary.md
@@ -0,0 +1,13 @@
+# Sprint PREAUTH_MOBILE_ONBOARDING_BALANCE_01 Summary
+- Title: Mobile onboarding vertical balance
+- Parent stage: PREAUTH_ONBOARDING_01
+- Branch: feature/auth-foundation
+- HEAD: 1ca99820f49eb8dbf5c59dcb841f66d87561fbbb
+- Status: Complete; ready for 390x844 runtime review.
+- Goal: Lower mobile onboarding without changing approved card geometry.
+- Modified: styles/talentry-pre-auth.css; onboarding mobile gap only.
+- Created: this Summary and Sprint_PREAUTH_MOBILE_ONBOARDING_BALANCE_01_Engineering_Report.md.
+- Change: fixed 32px gap -> clamp(32px, 9dvh, 80px), with vh fallback; 75.96px at 844px viewport height.
+- Validation: npx.cmd tsc --noEmit --incremental false PASS (0); git diff --check PASS (0). npm update and Git LF-to-CRLF notices only.
+- Risks: Visual runtime acceptance pending. Short/zoomed screens retain document scrolling.
+- Approval: Pending. No build, staging, commit, push or Project Memory update.
~~~

This report is its own full new-file creation record; recursive self-diff omitted.

## 13. Risks
Runtime visual review remains pending; mobile browser chrome affects dynamic viewport spacing slightly by design. No new dependency/business logic.

## 14. Untouched Modules
Splash, >=768px, approved card sizing/content, background/motion, routes/auth/persistence, swipe/Skip, Result, copy, packages/schema and Project Memory unchanged.

## 15. Approval
Stop for runtime review and acceptance. No build, commit or next stage.
