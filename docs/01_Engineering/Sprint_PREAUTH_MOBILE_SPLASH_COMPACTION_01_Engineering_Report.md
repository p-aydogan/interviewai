# Sprint PREAUTH_MOBILE_SPLASH_COMPACTION_01 Engineering Report

## 1. Identity
Date: 2026-09-21. Branch feature/auth-foundation. HEAD 1ca99820f49eb8dbf5c59dcb841f66d87561fbbb.
Parent stage PREAUTH_ONBOARDING_01. Implementation complete; runtime acceptance pending.

## 2. Objective and Boundaries
Compact only first/repeat mobile Splash at <=767px. Preserve desktop/tablet >=768px, all onboarding behavior, copy, auth, persistence, Result, ocean motion, colors and card material. No build or Git mutation.

## 3. Repository Before Implementation
Four pre-existing tracked modifications and twenty-two untracked additions. Previous authorized work, including final-panel Skip removal, preserved. HEAD remains 1ca9982. CSS is an untracked parent-stage file; incremental diff is against this request's working tree.

## 4. Decisions
The original auto/1fr grid plus centered card leaves a large gap. Splash-only :has(.talentry-pre-auth__welcome) selectors use auto/auto rows, align-content:start, card align-self:start and a 32px row gap, keeping a deliberate separation without centering the card in all remaining viewport space.
Existing outer safe-area padding preserves at least 16px side breathing room. Card padding reduces 24px to 20px.
Inner T mark reduces 64px to 48px, with existing shape/gradient intact; margin below reduces 20px to 12px and glyph 30px to 24px. Headline becomes 24px. Welcome top/bottom padding becomes 4px/16px; supporting line-height becomes 1.5; label margin becomes 8px.
Footer gap and secondary-action separator padding become 8px. Primary button remains 52px minimum; secondary and language controls remain >=44px. Header brand/control geometry is not changed.
All rules live inside max-width:767px. Existing >=768px block is unchanged. Onboarding lacks the welcome class, so its composition does not receive these overrides.

## 5–6. Files and Responsibilities
Modified: styles/talentry-pre-auth.css — one 27-line scoped mobile block.
Created: docs/01_Engineering/Sprint_PREAUTH_MOBILE_SPLASH_COMPACTION_01_Summary.md — summary; docs/01_Engineering/Sprint_PREAUTH_MOBILE_SPLASH_COMPACTION_01_Engineering_Report.md — this record/diff.
No TSX, assets, dependencies or shared tokens edited. No files deleted.

## 7. Interfaces
No interfaces, props, exports, callbacks, state, persistence keys or routes changed.

## 8. Accessibility
Control minimum heights and visible focus preserved. No content clipping or fixed-height constraint added. Normal document scrolling remains possible for zoom, short landscape or long text. Semantic structure and reduced-motion rules unchanged.
Runtime visual/accessibility verification pending.

## 9. Styling and Responsive Strategy
Only approved spacing/font tokens used. Safe-area outer padding, full-height shell and moving decorative background remain. Card radius, border, gradient, opacity and shadow unchanged.
The intended 390x844 layout uses a shorter intrinsic card near the header and leaves the remaining space below. No nested scroller or overflow:hidden on content. Desktop/tablet rules intentionally unchanged, not merely compensated by later overrides.

## 10. Validation
- npx.cmd tsc --noEmit --incremental false: exit 0, no TypeScript diagnostics. npm printed 11.16.0 -> 12.0.2 update notice; no update performed.
- git diff --check: exit 0; no whitespace errors. Git LF-to-CRLF notices concern pre-existing tracked route/Result changes.
- git status --short: existing authorized changes plus new refinement reports.
- Source inspection: new mobile block at line 176; original desktop media block follows at line 203 unchanged.
- Production build not run, explicitly prohibited.
- Runtime pending: first/repeat Splash at 390x844, TR/EN/DE, safe areas/browser UI, all auth actions visible, no horizontal/normal vertical overflow, short landscape/zoom scrolling, >=768 desktop regression and onboarding isolation. No browser rendering success claimed.

## 11. Git Status
HEAD unchanged; nothing staged. Four pre-existing tracked modifications: app/page.tsx, app/result/page.tsx, components/result/ResultContent.tsx, components/result/ResultShell.tsx.
Twenty-four untracked files after reports: six pre-auth files, stylesheet, ADR-001 and sixteen reports.
No stage/commit/push/reset/restore/stash or Project Memory change.

## 12. Complete Incremental Diffs
~~~diff
diff --git a/styles/talentry-pre-auth.css b/styles/talentry-pre-auth.css
--- a/styles/talentry-pre-auth.css
+++ b/styles/talentry-pre-auth.css
@@ -176,1 +176,28 @@
+@media (max-width: 767px) {
+  /* Splash only: leave onboarding composition and approved desktop rules intact. */
+  .talentry-pre-auth__frame:has(.talentry-pre-auth__welcome) {
+    grid-template-rows: auto auto;
+    align-content: start;
+    gap: var(--talentry-space-8);
+  }
+  .talentry-pre-auth__card:has(.talentry-pre-auth__welcome) {
+    align-self: start;
+    padding: var(--talentry-space-5);
+  }
+  .talentry-pre-auth__welcome {
+    padding-top: var(--talentry-space-1);
+    padding-bottom: var(--talentry-space-4);
+  }
+  .talentry-pre-auth__welcome .talentry-pre-auth__emblem--brand {
+    width: var(--talentry-space-12);
+    height: var(--talentry-space-12);
+    margin-bottom: var(--talentry-space-3);
+    font-size: var(--talentry-font-size-2xl);
+  }
+  .talentry-pre-auth__welcome h1 { font-size: var(--talentry-font-size-2xl); }
+  .talentry-pre-auth__welcome p { line-height: var(--talentry-line-height-normal); }
+  .talentry-pre-auth__welcome .talentry-pre-auth__eyebrow { margin-bottom: var(--talentry-space-2); }
+  .talentry-pre-auth__welcome-actions { gap: var(--talentry-space-2); }
+  .talentry-pre-auth__welcome-actions .talentry-pre-auth__auth-actions { padding-top: var(--talentry-space-2); }
+}
 @media (min-width: 768px) {
~~~

New Summary:
~~~diff
diff --git a/docs/01_Engineering/Sprint_PREAUTH_MOBILE_SPLASH_COMPACTION_01_Summary.md b/docs/01_Engineering/Sprint_PREAUTH_MOBILE_SPLASH_COMPACTION_01_Summary.md
new file mode 100644
--- /dev/null
+++ b/docs/01_Engineering/Sprint_PREAUTH_MOBILE_SPLASH_COMPACTION_01_Summary.md
@@ -0,0 +1,16 @@
+# Sprint PREAUTH_MOBILE_SPLASH_COMPACTION_01 Summary
+
+- Title: Mobile Splash compaction at 390x844
+- Parent stage: PREAUTH_ONBOARDING_01
+- Branch: feature/auth-foundation
+- HEAD: 1ca99820f49eb8dbf5c59dcb841f66d87561fbbb
+- Status: MOBILE SPLASH COMPACTION COMPLETE — READY FOR 390x844 REVIEW
+- Goal: Remove excessive header/card separation and reduce mobile Splash height without clipping.
+- Modified: styles/talentry-pre-auth.css; one Splash-scoped max-width:767px block.
+- Created: this Summary and Sprint_PREAUTH_MOBILE_SPLASH_COMPACTION_01_Engineering_Report.md.
+- Changes: content-sized rows/start alignment with 32px header gap; card padding 24px -> 20px; mark 64px -> 48px; headline 30px -> 24px; tighter welcome/footer spacing.
+- Validation: TypeScript PASS (0); git diff --check PASS (0). npm update and Git LF-to-CRLF notices only.
+- Protection: >=768px rules, onboarding panels, touch-target heights, card material and ocean motion untouched.
+- Risks: 390x844/browser safe-area/zoom/German runtime acceptance pending. No no-scroll success claimed without runtime.
+- Build: Not run.
+- Approval: Awaiting runtime review and acceptance. No staging, commit, push or Project Memory update; previous reports preserved.
~~~

This Engineering Report is its own complete creation record; recursively embedding its diff is omitted.

## 13. Risks and Limitations
No runtime review performed. Font rendering, browser chrome and safe-area behavior can affect actual fit. CSS :has is already used by this shell; unsupported browsers retain the earlier layout. Existing unrelated debt unchanged.

## 14. Untouched Modules
Desktop CSS rules, onboarding composition/behavior, final-panel Skip cleanup, routing/auth, persistence, copy, Result, card material, ocean SVG/motion, shared tokens, dependencies, schema and Project Memory untouched. Previous reports preserved.

## 15. Approval Required
Stop for 390x844 runtime review and acceptance. No build or next stage performed.
