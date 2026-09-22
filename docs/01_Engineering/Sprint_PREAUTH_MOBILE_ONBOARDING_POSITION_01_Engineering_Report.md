# Sprint PREAUTH_MOBILE_ONBOARDING_POSITION_01 Engineering Report

## 1. Identity
Date: 2026-09-21. Branch feature/auth-foundation. HEAD 1ca99820f49eb8dbf5c59dcb841f66d87561fbbb.
Parent PREAUTH_ONBOARDING_01; complete, awaiting runtime review.

## 2. Objective and Boundaries
Mobile onboarding positioning only. Put the unchanged compact card 24–32px below header. Preserve Splash, >=768px, card sizing, typography/icons/buttons/dots, background motion, routes/auth/persistence/swipe/Skip.

## 3. Repository Before Implementation
Four existing tracked modifications and twenty-six untracked files from authorized work. HEAD unchanged at 1ca9982. All preserved. Incremental diff is against this request's working tree; stylesheet remains untracked.

## 4. Diagnosis and Decision
Source diagnosis before editing: .talentry-pre-auth__frame uses grid-template-rows:auto 1fr and stretches inside the viewport shell; .talentry-pre-auth__card uses align-self:center. Mobile Splash already overrides these, but onboarding inherited remaining-region centering.
Add narrow <=767px :has(#pre-auth-panel) rules: frame auto/auto rows, align-content:start, gap:space-8 (32px); card align-self:start. Header and card become sequential content-sized rows with remaining breathing room below. No negative margins, transforms or height hacks.

## 5–6. Files and Responsibilities
Modified: styles/talentry-pre-auth.css — six positioning declarations/selector lines.
Created: docs/01_Engineering/Sprint_PREAUTH_MOBILE_ONBOARDING_POSITION_01_Summary.md and docs/01_Engineering/Sprint_PREAUTH_MOBILE_ONBOARDING_POSITION_01_Engineering_Report.md — acceptance records.
No React or asset changes; no deletion. Prior reports preserved.

## 7. Interfaces
No interfaces, props, types, callbacks or state changes.

## 8. Accessibility
No control, focus, labels, semantics or hit-target changes. Normal document scroll remains available for content exceeding short/zoomed viewports. No overflow clipping added.

## 9. Styling and Tokens
Only existing space-8 used for 32px gap. Card width/padding/intrinsic height, material, typography, icons, footer and buttons unchanged.
Selectors require the onboarding panel and max-width:767px. Splash and >=768px rules remain untouched.

## 10. Validation
- npx.cmd tsc --noEmit --incremental false: exit 0, no TypeScript diagnostics. npm update notice 11.16.0 -> 12.0.2; no update performed.
- git diff --check: exit 0; no whitespace errors. Git LF-to-CRLF notices concern the four pre-existing tracked files.
- git status --short: existing authorized changes plus new reports.
- Source inspection confirms only six positioning lines added.
- Build not run per instruction.
- Runtime pending: 390x844 header-to-card 32px gap across all panels, unchanged card geometry, short/zoom/German scroll, Splash/desktop regression. No measured browser result claimed.

## 11. Git Status
Four pre-existing modified tracked files: app/page.tsx, app/result/page.tsx, components/result/ResultContent.tsx, components/result/ResultShell.tsx.
Twenty-eight untracked files after reports: six pre-auth files, stylesheet, ADR-001 and twenty reports.
Nothing staged; HEAD unchanged. No commit/push/reset/restore/stash/branch or Project Memory mutation.

## 12. Complete Incremental Diffs
~~~diff
diff --git a/styles/talentry-pre-auth.css b/styles/talentry-pre-auth.css
--- a/styles/talentry-pre-auth.css
+++ b/styles/talentry-pre-auth.css
@@ -203,5 +203,11 @@
 @media (max-width: 767px) {
   /* Onboarding only: preserve Splash, card material and desktop composition. */
+  .talentry-pre-auth__frame:has(#pre-auth-panel) {
+    grid-template-rows: auto auto;
+    align-content: start;
+    gap: var(--talentry-space-8);
+  }
   .talentry-pre-auth__card:has(#pre-auth-panel) {
+    align-self: start;
     padding: var(--talentry-space-4) var(--talentry-space-5);
   }
~~~

New Summary:
~~~diff
diff --git a/docs/01_Engineering/Sprint_PREAUTH_MOBILE_ONBOARDING_POSITION_01_Summary.md b/docs/01_Engineering/Sprint_PREAUTH_MOBILE_ONBOARDING_POSITION_01_Summary.md
new file mode 100644
--- /dev/null
+++ b/docs/01_Engineering/Sprint_PREAUTH_MOBILE_ONBOARDING_POSITION_01_Summary.md
@@ -0,0 +1,16 @@
+# Sprint PREAUTH_MOBILE_ONBOARDING_POSITION_01 Summary
+
+- Title: Mobile onboarding positioning
+- Parent stage: PREAUTH_ONBOARDING_01
+- Branch: feature/auth-foundation
+- HEAD: 1ca99820f49eb8dbf5c59dcb841f66d87561fbbb
+- Status: MOBILE ONBOARDING POSITIONING COMPLETE — READY FOR 390x844 REVIEW
+- Goal: Position mobile onboarding 32px below header, preserving approved compact card.
+- Modified: styles/talentry-pre-auth.css, six added lines in existing <=767px onboarding block.
+- Created: this Summary and Sprint_PREAUTH_MOBILE_ONBOARDING_POSITION_01_Engineering_Report.md.
+- Root rule: shared auto/1fr grid plus card align-self:center centered onboarding in remaining viewport.
+- Fix: onboarding-only auto/auto rows, align-content:start, 32px gap and card align-self:start.
+- Validation: TypeScript PASS (0); git diff --check PASS (0). npm update and Git LF-to-CRLF notices only.
+- Preserved: Card dimensions/padding/content, Splash, >=768px, background and all behavior.
+- Risks: 390x844 and short/zoom/German runtime review pending.
+- Approval: Acceptance pending. No build, staging, commit, push or Project Memory update.
~~~

This report is its own complete new-file creation record; recursive self-diff omitted.

## 13. Risks and Limitations
Runtime acceptance pending. Existing :has browser support requirement retained. No new dependencies or business logic; unrelated debt unchanged.

## 14. Untouched Modules
Splash, >=768px, card geometry/padding/material, icons/type/dots/buttons, ocean SVG/motion, routing/auth, persistence, copy, Result, swipe/Skip, dependencies, schema and Project Memory untouched. Previous reports preserved.

## 15. Approval Required
Stop for 390x844 review and acceptance. No build or next stage performed.
