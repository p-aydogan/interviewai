# Sprint PREAUTH_CARD_SOFTENING_01 Engineering Report

## 1. Identity
Date: 2026-09-21. Branch feature/auth-foundation. HEAD 1ca99820f49eb8dbf5c59dcb841f66d87561fbbb.
Parent stage PREAUTH_ONBOARDING_01. Status: complete, ready for runtime review; acceptance pending.

## 2. Objective and Boundaries
Soften only shared Splash/onboarding card material against the approved moving background. Preserve content, CTA hierarchy, dimensions, spacing, interactions and motion. No auth, routes, persistence, copy or Result changes.

## 3. Repository Before Implementation
Authorized previous uncommitted work present: four modified tracked files and eighteen untracked additions. HEAD unchanged. This refinement's diff uses the starting working-tree stylesheet; the stylesheet remains an untracked parent-stage file. No work discarded.

## 4. Decisions
Replace the flat opaque card with a layered dark fill: a 165-degree navy-soft/interview-surface gradient at 96%/94% opacity, plus a 145-degree 4% indigo tint fading to transparent by 60%.
This permits only a small atmospheric contribution from the background while retaining stable dark contrast. No backdrop blur, filters, blend modes or animated card properties.
Reduce light border opacity from 16% to 8%; use existing 28px radius-2xl instead of 22px card radius. Replace two stronger shadows with one 0 16px 64px shadow using interview-canvas at 18% opacity.
No changes to width, padding, margins, positioning, typography, CTA or background animations.

## 5–6. Files and Responsibilities
Modified: styles/talentry-pre-auth.css — only .talentry-pre-auth__card material declarations.
Created: docs/01_Engineering/Sprint_PREAUTH_CARD_SOFTENING_01_Summary.md — summary; docs/01_Engineering/Sprint_PREAUTH_CARD_SOFTENING_01_Engineering_Report.md — this record.
No React file, asset, dependency or shared-token change. No deletion.

## 7. Interfaces
No public interfaces, props, callbacks, types or exports changed.

## 8. Accessibility
Existing foreground colors, controls, focus outlines, 44px targets and semantic structure unchanged. High dark-fill opacity limits variation behind text. No motion-dependent state or new animation. Reduced-motion behavior untouched.
Actual contrast and perceived separation under moving background remain runtime acceptance checks, not claimed verified.

## 9. Styling and Responsive Strategy
Only existing Talentry colors/radius/spacing tokens used. A single static, low-opacity shadow avoids backdrop-blur cost and artifacts. Shared selector applies identically to Splash and all three onboarding panels.
Existing responsive width, safe areas, document scrolling, card padding and clipping behavior unchanged. Validate 390x844, short/zoomed viewports and desktop during runtime review.

## 10. Validation
- npx.cmd tsc --noEmit --incremental false: exit 0; no TypeScript diagnostics. npm printed 11.16.0 -> 12.0.2 update notice; no update performed.
- git diff --check: exit 0; no whitespace errors. Git LF-to-CRLF notices concern the four pre-existing tracked modifications.
- git status --short: existing work preserved plus refinement reports.
- Before/after source comparison with the card rule removed is identical: only that rule changed.
- Production build not run, explicitly prohibited.
- Browser runtime not performed. Pending: material softness, separation/readability over animated swells, 390x844 rendering, focus and onboarding continuity.

## 11. Git Status
HEAD remains 1ca9982; nothing staged. Four pre-existing tracked modifications: app/page.tsx, app/result/page.tsx, components/result/ResultContent.tsx, components/result/ResultShell.tsx.
Twenty untracked files after reports: six pre-auth source files, one pre-auth stylesheet, ADR-001 and twelve reports. No stage, commit, push, reset, restore, stash, branch or Project Memory mutation.

## 12. Complete Incremental Diffs
Working-tree before/after card refinement:
~~~diff
diff --git a/styles/talentry-pre-auth.css b/styles/talentry-pre-auth.css
--- a/styles/talentry-pre-auth.css
+++ b/styles/talentry-pre-auth.css
@@ -72,10 +72,15 @@
   min-width: 0;
   margin: 0 auto;
   padding: var(--talentry-space-6);
-  border: 1px solid color-mix(in srgb, var(--talentry-color-interview-text) 16%, transparent);
-  border-radius: var(--talentry-card-radius);
-  background: var(--talentry-color-interview-surface);
-  box-shadow: var(--talentry-shadow-elevated), var(--talentry-shadow-card);
+  border: 1px solid color-mix(in srgb, var(--talentry-color-interview-text) 8%, transparent);
+  border-radius: var(--talentry-radius-2xl);
+  background:
+    linear-gradient(145deg, color-mix(in srgb, var(--talentry-color-indigo) 4%, transparent), transparent 60%),
+    linear-gradient(165deg,
+      color-mix(in srgb, var(--talentry-color-navy-soft) 96%, transparent),
+      color-mix(in srgb, var(--talentry-color-interview-surface) 94%, transparent));
+  box-shadow: 0 var(--talentry-space-4) var(--talentry-space-16)
+    color-mix(in srgb, var(--talentry-color-interview-canvas) 18%, transparent);
 }
 .talentry-pre-auth__flow { display: flex; flex-direction: column; width: 100%; min-width: 0; }
 .talentry-pre-auth__content { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding-block: var(--talentry-space-5); overflow-wrap: anywhere; }
~~~

New Summary:
~~~diff
diff --git a/docs/01_Engineering/Sprint_PREAUTH_CARD_SOFTENING_01_Summary.md b/docs/01_Engineering/Sprint_PREAUTH_CARD_SOFTENING_01_Summary.md
new file mode 100644
--- /dev/null
+++ b/docs/01_Engineering/Sprint_PREAUTH_CARD_SOFTENING_01_Summary.md
@@ -0,0 +1,17 @@
+# Sprint PREAUTH_CARD_SOFTENING_01 Summary
+
+- Title: Pre-auth card material softening
+- Parent stage: PREAUTH_ONBOARDING_01
+- Branch: feature/auth-foundation
+- HEAD: 1ca99820f49eb8dbf5c59dcb841f66d87561fbbb
+- Status: CARD SOFTENING COMPLETE — READY FOR RUNTIME REVIEW
+- Goal: Integrate the stable dark card with the approved ocean-swell atmosphere.
+- Modified file: styles/talentry-pre-auth.css, only the shared card rule.
+- Created files: this Summary and Sprint_PREAUTH_CARD_SOFTENING_01_Engineering_Report.md.
+- Material: 94–96% opaque dark navy gradient, faint 4% indigo wash, border opacity 16% -> 8%, token radius 22px -> 28px, one diffuse 0 16px 64px navy shadow at 18% opacity.
+- Backdrop blur: None.
+- Behavior: No routing, auth, state/persistence, copy, Result, background-motion or content-layout change.
+- Validation: TypeScript PASS (exit 0); git diff --check PASS (exit 0). npm update notice and Git LF-to-CRLF notices; no package change.
+- Risks: Visual separation, text contrast over motion and 390x844 rendering await runtime review.
+- Build: Not run as instructed.
+- Approval: Awaiting runtime review and acceptance. No staging, commit, push or Project Memory update. Existing reports preserved.
~~~

This Engineering Report is its own complete new-file creation record; recursively embedding its diff is omitted.

## 13. Risks and Limitations
Runtime visual acceptance is pending. Translucent material permits slight background influence, by design. No new logic/dependency/security debt introduced; existing unrelated limitations remain.

## 14. Untouched Modules
React components, copy, auth, routing, preferences, pager, Result destinations, Dashboard/account/history, shared tokens, schema, dependencies, background animation and Project Memory untouched. Earlier reports unchanged.

## 15. Approval Required
Stop for runtime review and acceptance. No build or next stage performed.
