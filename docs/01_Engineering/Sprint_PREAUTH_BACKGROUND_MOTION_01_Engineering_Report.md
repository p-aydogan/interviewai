# Sprint PREAUTH_BACKGROUND_MOTION_01 Engineering Report

## 1. Identity
Date: 2026-09-21. Branch: feature/auth-foundation. HEAD: 1ca99820f49eb8dbf5c59dcb841f66d87561fbbb.
Status: BACKGROUND MOTION COMPLETE — READY FOR RUNTIME REVIEW. Parent stage: PREAUTH_ONBOARDING_01.

## 2. Objective and Boundaries
Presentation-only subtle wave/aurora behind the existing shared Splash/onboarding shell. Keep approved dark direction, card, typography, CTA hierarchy, language control and layout. No routes, auth, copy, persistence or pager changes.

## 3. Repository Before Implementation
Authorized uncommitted parent-stage/refinement work present: four modified tracked files and twelve untracked files. HEAD unchanged at 1ca9982. This request's working-tree files are the diff baseline; do not confuse untracked parent implementation with new motion work.

## 4. Decisions
Two broad radial-gradient pseudo-elements use existing primary/indigo tokens at opacity 0.16/0.13 and static 48px token blur. Only transform changes: slow horizontal/diagonal drift, slight rotation and scale.
Durations 19s/23s and negative delays -7s/-13s avoid synchronized starts. Endpoints match for continuous loops.
A single empty aria-hidden decoration wrapper is necessary to clip only visual effects, preserving normal content overflow, focus rings and document scrolling. It is absolute inset:0 with overflow:hidden and pointer-events:none; it has no layout or tab-order role.
The shell establishes a local stacking context; decoration uses z-index 0 and the existing frame uses relative positioning/z-index 1. No extreme/global stacking values. The opaque card and language surfaces remain unchanged.
Shared shell stays mounted across internal panel transitions: no per-panel motion or JS animation.
No canvas, SVG asset, dependency, animated filter, animated shadow, layout animation or will-change allocation.

## 5–6. Files and Responsibilities
Modified:
- styles/talentry-pre-auth.css: isolated layering, decorative wrapper/pseudo-elements, keyframes and reduced-motion override.
- components/pre-auth/PreAuthShell.tsx: one empty aria-hidden decorative div.
Created:
- docs/01_Engineering/Sprint_PREAUTH_BACKGROUND_MOTION_01_Summary.md: summary.
- docs/01_Engineering/Sprint_PREAUTH_BACKGROUND_MOTION_01_Engineering_Report.md: this record and complete source diffs.
No deletion; previous reports preserved.

## 7. Interfaces
No public interface, prop, callback, export, copy or state change. Decorative div has no events or interactive attributes.

## 8. Accessibility
Wrapper aria-hidden=true; pseudo-elements have empty content; pointer-events:none; no tabindex. Existing controls, semantic headings, focus, labels and dimensions unchanged.
prefers-reduced-motion: reduce applies animation:none to both pseudo-elements. Their base transforms/opacity/gradients remain for static composition. Motion conveys no status and resembles no loading indicator.
Actual browser contrast and reduced-motion verification remain pending.

## 9. Styling and Responsive Behavior
Existing token palette and static base background preserved. Broad percentage-sized layers have a 768px height cap; blur is static. No animation-specific breakpoint. The clipped absolute wrapper cannot expand document width; content itself is not clipped.
Card/header remain unanimated above decoration. At 390x844, 641–767 and desktop the same proportions and opacity apply. Visual subtlety and GPU performance require runtime review.

## 10. Validation
- npx.cmd tsc --noEmit --incremental false: exit 0, no TypeScript diagnostics. npm printed update notice 11.16.0 -> 12.0.2; no update performed.
- git diff --check: exit 0, no whitespace errors. LF-to-CRLF notices concern the four pre-existing tracked modifications.
- git status --short: only authorized existing work plus this refinement's reports.
- Source review: TSX adds only an empty decoration element; CSS adds only positioning/stacking and decoration rules. Existing card/layout/control rules and all functionality remain unchanged.
- Build not run, explicitly prohibited.
- Runtime not performed: verify calmness/seamless loops, content stability, 390x844 width/scroll, 641–767/desktop continuity, touch/keyboard control access, device performance, short/zoomed pages, reduced-motion static state and Splash-to-panel continuity.

## 11. Git Status
Four pre-existing modified tracked files: app/page.tsx, app/result/page.tsx, components/result/ResultContent.tsx, components/result/ResultShell.tsx.
Fourteen untracked files after this refinement: six pre-auth source files, pre-auth stylesheet, ADR-001, and six sprint reports (parent implementation, visual refinement and this motion refinement).
Nothing staged. HEAD unchanged. No commit, push, reset, restore, stash, branch mutation or Project Memory update.

## 12. Complete Source Diffs
Full-file hunks compare this request's working-tree before/after content because these presentation files are untracked parent-stage additions.

~~~diff
diff --git a/components/pre-auth/PreAuthShell.tsx b/components/pre-auth/PreAuthShell.tsx
--- a/components/pre-auth/PreAuthShell.tsx
+++ b/components/pre-auth/PreAuthShell.tsx
@@ -1,33 +1,34 @@
-import type { ReactNode } from 'react'
-import { SUPPORTED_APP_LANGUAGES } from '@/lib/auth/auth-constants'
-import type { AppLanguage } from '@/types/auth'
-import type { PreAuthCopy } from './pre-auth-copy'
-
-interface PreAuthShellProps {
-  children: ReactNode
-  language: AppLanguage
-  copy: PreAuthCopy
-  onLanguageChange: (language: AppLanguage) => void
-}
-
-export default function PreAuthShell({ children, language, copy, onLanguageChange }: PreAuthShellProps) {
-  return <main className="talentry-pre-auth" lang={language}>
-    <div className="talentry-pre-auth__frame">
-      <header className="talentry-pre-auth__header">
-        <div className="talentry-pre-auth__brand" aria-label="Talentry">
-          <span className="talentry-pre-auth__mark" aria-hidden="true">T</span>
-          <span>Talentry</span>
-        </div>
-        <fieldset className="talentry-pre-auth__languages">
-          <legend className="talentry-pre-auth__sr-only">{copy.language}</legend>
-          {SUPPORTED_APP_LANGUAGES.map(value => <button key={value} type="button"
-            lang={value} aria-label={{ tr: 'Türkçe', en: 'English', de: 'Deutsch' }[value]}
-            aria-pressed={language === value} onClick={() => onLanguageChange(value)}>
-            {value.toUpperCase()}
-          </button>)}
-        </fieldset>
-      </header>
-      <div className="talentry-pre-auth__card">{children}</div>
-    </div>
-  </main>
-}
+import type { ReactNode } from 'react'
+import { SUPPORTED_APP_LANGUAGES } from '@/lib/auth/auth-constants'
+import type { AppLanguage } from '@/types/auth'
+import type { PreAuthCopy } from './pre-auth-copy'
+
+interface PreAuthShellProps {
+  children: ReactNode
+  language: AppLanguage
+  copy: PreAuthCopy
+  onLanguageChange: (language: AppLanguage) => void
+}
+
+export default function PreAuthShell({ children, language, copy, onLanguageChange }: PreAuthShellProps) {
+  return <main className="talentry-pre-auth" lang={language}>
+    <div className="talentry-pre-auth__aurora" aria-hidden="true" />
+    <div className="talentry-pre-auth__frame">
+      <header className="talentry-pre-auth__header">
+        <div className="talentry-pre-auth__brand" aria-label="Talentry">
+          <span className="talentry-pre-auth__mark" aria-hidden="true">T</span>
+          <span>Talentry</span>
+        </div>
+        <fieldset className="talentry-pre-auth__languages">
+          <legend className="talentry-pre-auth__sr-only">{copy.language}</legend>
+          {SUPPORTED_APP_LANGUAGES.map(value => <button key={value} type="button"
+            lang={value} aria-label={{ tr: 'Türkçe', en: 'English', de: 'Deutsch' }[value]}
+            aria-pressed={language === value} onClick={() => onLanguageChange(value)}>
+            {value.toUpperCase()}
+          </button>)}
+        </fieldset>
+      </header>
+      <div className="talentry-pre-auth__card">{children}</div>
+    </div>
+  </main>
+}
diff --git a/styles/talentry-pre-auth.css b/styles/talentry-pre-auth.css
--- a/styles/talentry-pre-auth.css
+++ b/styles/talentry-pre-auth.css
@@ -1,122 +1,174 @@
-@import './talentry-tokens.css';
-
-body:has(.talentry-pre-auth) { margin: 0; }
-.talentry-pre-auth, .talentry-pre-auth * { box-sizing: border-box; }
-.talentry-pre-auth {
-  min-height: 100vh;
-  min-height: 100dvh;
-  padding: max(var(--talentry-space-4), env(safe-area-inset-top, 0px))
-    max(var(--talentry-space-4), env(safe-area-inset-right, 0px))
-    max(var(--talentry-space-4), env(safe-area-inset-bottom, 0px))
-    max(var(--talentry-space-4), env(safe-area-inset-left, 0px));
-  display: flex;
-  color: var(--talentry-color-interview-text);
-  background:
-    radial-gradient(ellipse at 10% 0%, color-mix(in srgb, var(--talentry-color-primary) 22%, transparent), transparent 55%),
-    radial-gradient(ellipse at 100% 100%, color-mix(in srgb, var(--talentry-color-indigo) 18%, transparent), transparent 60%),
-    linear-gradient(145deg, var(--talentry-color-navy-soft), var(--talentry-color-navy) 48%, var(--talentry-color-interview-canvas));
-  font-family: var(--talentry-font-family);
-  line-height: var(--talentry-line-height-normal);
-}
-.talentry-pre-auth__frame {
-  display: grid;
-  grid-template-rows: auto 1fr;
-  gap: var(--talentry-space-6);
-  width: 100%;
-  max-width: calc(var(--talentry-space-16) * 18);
-  min-width: 0;
-  margin: 0 auto;
-  align-self: stretch;
-  flex: 1;
-}
-.talentry-pre-auth__header {
-  display: flex;
-  flex-wrap: wrap;
-  align-items: center;
-  justify-content: space-between;
-  gap: var(--talentry-space-3);
-}
-.talentry-pre-auth__brand { display: flex; align-items: center; gap: var(--talentry-space-2); font-size: var(--talentry-font-size-lg); font-weight: var(--talentry-font-weight-bold); letter-spacing: var(--talentry-letter-spacing-tight); color: var(--talentry-color-interview-text); }
-.talentry-pre-auth__mark {
-  display: grid;
-  place-items: center;
-  width: var(--talentry-space-8);
-  height: var(--talentry-space-8);
-  border-radius: var(--talentry-radius-md);
-  background: linear-gradient(135deg, var(--talentry-color-primary), var(--talentry-color-indigo));
-  box-shadow: var(--talentry-shadow-primary);
-  color: var(--talentry-color-text-on-primary);
-}
-.talentry-pre-auth__languages { display: flex; flex-wrap: wrap; gap: var(--talentry-space-1); padding: var(--talentry-space-1); border: 1px solid color-mix(in srgb, var(--talentry-color-interview-text) 16%, transparent); border-radius: var(--talentry-radius-pill); background: var(--talentry-color-interview-surface); margin: 0; min-width: 0; }
-.talentry-pre-auth button, .talentry-pre-auth a { font: inherit; cursor: pointer; }
-.talentry-pre-auth__languages button {
-  min-width: var(--talentry-button-height-md);
-  min-height: var(--talentry-button-height-md);
-  padding: var(--talentry-space-1);
-  border: 1px solid transparent;
-  border-radius: var(--talentry-radius-pill);
-  color: var(--talentry-color-interview-muted);
-  background: transparent;
-  font-size: var(--talentry-font-size-sm);
-}
-.talentry-pre-auth__languages button[aria-pressed="true"] { border-color: var(--talentry-color-primary); color: var(--talentry-color-interview-text); background: var(--talentry-color-navy-soft); font-weight: var(--talentry-font-weight-bold); text-decoration: underline; text-underline-offset: var(--talentry-space-1); }
-.talentry-pre-auth__card {
-  display: flex;
-  align-self: center;
-  width: 100%;
-  max-width: calc(var(--talentry-space-16) * 7);
-  min-width: 0;
-  margin: 0 auto;
-  padding: var(--talentry-space-6);
-  border: 1px solid color-mix(in srgb, var(--talentry-color-interview-text) 16%, transparent);
-  border-radius: var(--talentry-card-radius);
-  background: var(--talentry-color-interview-surface);
-  box-shadow: var(--talentry-shadow-elevated), var(--talentry-shadow-card);
-}
-.talentry-pre-auth__flow { display: flex; flex-direction: column; width: 100%; min-width: 0; }
-.talentry-pre-auth__content { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding-block: var(--talentry-space-5); overflow-wrap: anywhere; }
-.talentry-pre-auth__emblem { display: grid; place-items: center; flex-shrink: 0; width: var(--talentry-space-16); height: var(--talentry-space-16); margin-bottom: var(--talentry-space-5); border: 1px solid color-mix(in srgb, var(--talentry-color-primary) 40%, transparent); border-radius: var(--talentry-radius-xl); color: var(--talentry-color-interview-text); background: var(--talentry-color-navy-soft); font-size: var(--talentry-font-size-3xl); font-weight: var(--talentry-font-weight-bold); }
-.talentry-pre-auth__emblem--brand { background: linear-gradient(135deg, var(--talentry-color-primary), var(--talentry-color-indigo)); box-shadow: var(--talentry-shadow-primary); }
-.talentry-pre-auth h1 { margin: 0; max-width: 100%; color: var(--talentry-color-interview-text); font-size: var(--talentry-font-size-3xl); line-height: var(--talentry-line-height-tight); letter-spacing: var(--talentry-letter-spacing-tight); text-wrap: balance; }
-.talentry-pre-auth__content p { margin: var(--talentry-space-3) 0 0; max-width: calc(var(--talentry-space-16) * 6); color: var(--talentry-color-interview-muted); font-size: var(--talentry-font-size-sm); line-height: var(--talentry-line-height-relaxed); }
-.talentry-pre-auth__content .talentry-pre-auth__eyebrow { margin: 0 0 var(--talentry-space-3); font-size: var(--talentry-font-size-sm); font-weight: var(--talentry-font-weight-semibold); letter-spacing: var(--talentry-letter-spacing-wide); color: var(--talentry-color-interview-muted); }
-.talentry-pre-auth__welcome { padding-top: var(--talentry-space-2); padding-bottom: var(--talentry-space-6); }
-.talentry-pre-auth__footer { display: flex; flex-direction: column; gap: var(--talentry-space-3); }
-.talentry-pre-auth__auth-actions, .talentry-pre-auth__navigation { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--talentry-space-3); }
-.talentry-pre-auth__action {
-  display: flex;
-  align-items: center;
-  justify-content: center;
-  gap: var(--talentry-space-2);
-  min-width: var(--talentry-button-height-md);
-  min-height: var(--talentry-button-height-lg);
-  padding: var(--talentry-space-3);
-  border: 1px solid color-mix(in srgb, var(--talentry-color-interview-text) 24%, transparent);
-  border-radius: var(--talentry-button-radius);
-  background: var(--talentry-color-navy-soft);
-  color: var(--talentry-color-interview-text);
-  text-decoration: none;
-  text-align: center;
-  overflow-wrap: anywhere;
-  font-weight: var(--talentry-font-weight-semibold);
-}
-.talentry-pre-auth__action--primary { background: var(--talentry-button-primary-bg); border-color: var(--talentry-button-primary-bg); color: var(--talentry-button-primary-text); box-shadow: var(--talentry-shadow-primary); }
-.talentry-pre-auth__action:hover { background: var(--talentry-color-navy); }
-.talentry-pre-auth__action--primary:hover { background: var(--talentry-button-primary-bg-hover); }
-.talentry-pre-auth__text-action { min-width: var(--talentry-button-height-md); min-height: var(--talentry-button-height-md); padding: var(--talentry-space-2); border: 0; border-radius: var(--talentry-radius-sm); background: transparent; color: var(--talentry-color-interview-muted); text-decoration: underline; text-underline-offset: var(--talentry-space-1); overflow-wrap: anywhere; }
-.talentry-pre-auth__welcome-actions .talentry-pre-auth__auth-actions { border-top: 1px solid color-mix(in srgb, var(--talentry-color-interview-text) 12%, transparent); padding-top: var(--talentry-space-3); }
-.talentry-pre-auth__welcome-actions .talentry-pre-auth__auth-actions .talentry-pre-auth__action { min-height: var(--talentry-button-height-md); border-color: transparent; background: transparent; font-size: var(--talentry-font-size-sm); text-decoration: underline; text-underline-offset: var(--talentry-space-1); }
-.talentry-pre-auth__welcome-actions .talentry-pre-auth__auth-actions .talentry-pre-auth__action:hover { background: var(--talentry-color-navy-soft); }
-.talentry-pre-auth__skip-row { display: flex; justify-content: flex-end; }
-.talentry-pre-auth__dots { display: flex; justify-content: center; gap: var(--talentry-space-2); }
-.talentry-pre-auth__dots button { display: grid; place-items: center; width: var(--talentry-button-height-md); height: var(--talentry-button-height-md); padding: 0; border: 0; border-radius: var(--talentry-radius-pill); background: transparent; }
-.talentry-pre-auth__dots span { width: var(--talentry-space-2); height: var(--talentry-space-2); border-radius: var(--talentry-radius-pill); background: var(--talentry-color-interview-muted); }
-.talentry-pre-auth__dots [aria-current="step"] span { width: var(--talentry-space-6); background: var(--talentry-color-primary); }
-.talentry-pre-auth__final-actions { min-height: var(--talentry-button-height-lg); }
-.talentry-pre-auth :focus-visible { outline: 2px solid var(--talentry-color-interview-text); outline-offset: var(--talentry-space-1); }
-.talentry-pre-auth__sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0; }
-@media (min-width: 768px) {
-  .talentry-pre-auth { padding: max(var(--talentry-space-8), env(safe-area-inset-top, 0px)) max(var(--talentry-space-8), env(safe-area-inset-right, 0px)) max(var(--talentry-space-8), env(safe-area-inset-bottom, 0px)) max(var(--talentry-space-8), env(safe-area-inset-left, 0px)); }
-  .talentry-pre-auth__frame { gap: var(--talentry-space-8); }
-  .talentry-pre-auth__card { padding: var(--talentry-space-8); }
-}
+@import './talentry-tokens.css';
+
+body:has(.talentry-pre-auth) { margin: 0; }
+.talentry-pre-auth, .talentry-pre-auth * { box-sizing: border-box; }
+.talentry-pre-auth {
+  position: relative;
+  isolation: isolate;
+  min-height: 100vh;
+  min-height: 100dvh;
+  padding: max(var(--talentry-space-4), env(safe-area-inset-top, 0px))
+    max(var(--talentry-space-4), env(safe-area-inset-right, 0px))
+    max(var(--talentry-space-4), env(safe-area-inset-bottom, 0px))
+    max(var(--talentry-space-4), env(safe-area-inset-left, 0px));
+  display: flex;
+  color: var(--talentry-color-interview-text);
+  background:
+    radial-gradient(ellipse at 10% 0%, color-mix(in srgb, var(--talentry-color-primary) 22%, transparent), transparent 55%),
+    radial-gradient(ellipse at 100% 100%, color-mix(in srgb, var(--talentry-color-indigo) 18%, transparent), transparent 60%),
+    linear-gradient(145deg, var(--talentry-color-navy-soft), var(--talentry-color-navy) 48%, var(--talentry-color-interview-canvas));
+  font-family: var(--talentry-font-family);
+  line-height: var(--talentry-line-height-normal);
+}
+.talentry-pre-auth__frame {
+  position: relative;
+  z-index: 1;
+  display: grid;
+  grid-template-rows: auto 1fr;
+  gap: var(--talentry-space-6);
+  width: 100%;
+  max-width: calc(var(--talentry-space-16) * 18);
+  min-width: 0;
+  margin: 0 auto;
+  align-self: stretch;
+  flex: 1;
+}
+.talentry-pre-auth__header {
+  display: flex;
+  flex-wrap: wrap;
+  align-items: center;
+  justify-content: space-between;
+  gap: var(--talentry-space-3);
+}
+.talentry-pre-auth__brand { display: flex; align-items: center; gap: var(--talentry-space-2); font-size: var(--talentry-font-size-lg); font-weight: var(--talentry-font-weight-bold); letter-spacing: var(--talentry-letter-spacing-tight); color: var(--talentry-color-interview-text); }
+.talentry-pre-auth__mark {
+  display: grid;
+  place-items: center;
+  width: var(--talentry-space-8);
+  height: var(--talentry-space-8);
+  border-radius: var(--talentry-radius-md);
+  background: linear-gradient(135deg, var(--talentry-color-primary), var(--talentry-color-indigo));
+  box-shadow: var(--talentry-shadow-primary);
+  color: var(--talentry-color-text-on-primary);
+}
+.talentry-pre-auth__languages { display: flex; flex-wrap: wrap; gap: var(--talentry-space-1); padding: var(--talentry-space-1); border: 1px solid color-mix(in srgb, var(--talentry-color-interview-text) 16%, transparent); border-radius: var(--talentry-radius-pill); background: var(--talentry-color-interview-surface); margin: 0; min-width: 0; }
+.talentry-pre-auth button, .talentry-pre-auth a { font: inherit; cursor: pointer; }
+.talentry-pre-auth__languages button {
+  min-width: var(--talentry-button-height-md);
+  min-height: var(--talentry-button-height-md);
+  padding: var(--talentry-space-1);
+  border: 1px solid transparent;
+  border-radius: var(--talentry-radius-pill);
+  color: var(--talentry-color-interview-muted);
+  background: transparent;
+  font-size: var(--talentry-font-size-sm);
+}
+.talentry-pre-auth__languages button[aria-pressed="true"] { border-color: var(--talentry-color-primary); color: var(--talentry-color-interview-text); background: var(--talentry-color-navy-soft); font-weight: var(--talentry-font-weight-bold); text-decoration: underline; text-underline-offset: var(--talentry-space-1); }
+.talentry-pre-auth__card {
+  display: flex;
+  align-self: center;
+  width: 100%;
+  max-width: calc(var(--talentry-space-16) * 7);
+  min-width: 0;
+  margin: 0 auto;
+  padding: var(--talentry-space-6);
+  border: 1px solid color-mix(in srgb, var(--talentry-color-interview-text) 16%, transparent);
+  border-radius: var(--talentry-card-radius);
+  background: var(--talentry-color-interview-surface);
+  box-shadow: var(--talentry-shadow-elevated), var(--talentry-shadow-card);
+}
+.talentry-pre-auth__flow { display: flex; flex-direction: column; width: 100%; min-width: 0; }
+.talentry-pre-auth__content { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding-block: var(--talentry-space-5); overflow-wrap: anywhere; }
+.talentry-pre-auth__emblem { display: grid; place-items: center; flex-shrink: 0; width: var(--talentry-space-16); height: var(--talentry-space-16); margin-bottom: var(--talentry-space-5); border: 1px solid color-mix(in srgb, var(--talentry-color-primary) 40%, transparent); border-radius: var(--talentry-radius-xl); color: var(--talentry-color-interview-text); background: var(--talentry-color-navy-soft); font-size: var(--talentry-font-size-3xl); font-weight: var(--talentry-font-weight-bold); }
+.talentry-pre-auth__emblem--brand { background: linear-gradient(135deg, var(--talentry-color-primary), var(--talentry-color-indigo)); box-shadow: var(--talentry-shadow-primary); }
+.talentry-pre-auth h1 { margin: 0; max-width: 100%; color: var(--talentry-color-interview-text); font-size: var(--talentry-font-size-3xl); line-height: var(--talentry-line-height-tight); letter-spacing: var(--talentry-letter-spacing-tight); text-wrap: balance; }
+.talentry-pre-auth__content p { margin: var(--talentry-space-3) 0 0; max-width: calc(var(--talentry-space-16) * 6); color: var(--talentry-color-interview-muted); font-size: var(--talentry-font-size-sm); line-height: var(--talentry-line-height-relaxed); }
+.talentry-pre-auth__content .talentry-pre-auth__eyebrow { margin: 0 0 var(--talentry-space-3); font-size: var(--talentry-font-size-sm); font-weight: var(--talentry-font-weight-semibold); letter-spacing: var(--talentry-letter-spacing-wide); color: var(--talentry-color-interview-muted); }
+.talentry-pre-auth__welcome { padding-top: var(--talentry-space-2); padding-bottom: var(--talentry-space-6); }
+.talentry-pre-auth__footer { display: flex; flex-direction: column; gap: var(--talentry-space-3); }
+.talentry-pre-auth__auth-actions, .talentry-pre-auth__navigation { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--talentry-space-3); }
+.talentry-pre-auth__action {
+  display: flex;
+  align-items: center;
+  justify-content: center;
+  gap: var(--talentry-space-2);
+  min-width: var(--talentry-button-height-md);
+  min-height: var(--talentry-button-height-lg);
+  padding: var(--talentry-space-3);
+  border: 1px solid color-mix(in srgb, var(--talentry-color-interview-text) 24%, transparent);
+  border-radius: var(--talentry-button-radius);
+  background: var(--talentry-color-navy-soft);
+  color: var(--talentry-color-interview-text);
+  text-decoration: none;
+  text-align: center;
+  overflow-wrap: anywhere;
+  font-weight: var(--talentry-font-weight-semibold);
+}
+.talentry-pre-auth__action--primary { background: var(--talentry-button-primary-bg); border-color: var(--talentry-button-primary-bg); color: var(--talentry-button-primary-text); box-shadow: var(--talentry-shadow-primary); }
+.talentry-pre-auth__action:hover { background: var(--talentry-color-navy); }
+.talentry-pre-auth__action--primary:hover { background: var(--talentry-button-primary-bg-hover); }
+.talentry-pre-auth__text-action { min-width: var(--talentry-button-height-md); min-height: var(--talentry-button-height-md); padding: var(--talentry-space-2); border: 0; border-radius: var(--talentry-radius-sm); background: transparent; color: var(--talentry-color-interview-muted); text-decoration: underline; text-underline-offset: var(--talentry-space-1); overflow-wrap: anywhere; }
+.talentry-pre-auth__welcome-actions .talentry-pre-auth__auth-actions { border-top: 1px solid color-mix(in srgb, var(--talentry-color-interview-text) 12%, transparent); padding-top: var(--talentry-space-3); }
+.talentry-pre-auth__welcome-actions .talentry-pre-auth__auth-actions .talentry-pre-auth__action { min-height: var(--talentry-button-height-md); border-color: transparent; background: transparent; font-size: var(--talentry-font-size-sm); text-decoration: underline; text-underline-offset: var(--talentry-space-1); }
+.talentry-pre-auth__welcome-actions .talentry-pre-auth__auth-actions .talentry-pre-auth__action:hover { background: var(--talentry-color-navy-soft); }
+.talentry-pre-auth__skip-row { display: flex; justify-content: flex-end; }
+.talentry-pre-auth__dots { display: flex; justify-content: center; gap: var(--talentry-space-2); }
+.talentry-pre-auth__dots button { display: grid; place-items: center; width: var(--talentry-button-height-md); height: var(--talentry-button-height-md); padding: 0; border: 0; border-radius: var(--talentry-radius-pill); background: transparent; }
+.talentry-pre-auth__dots span { width: var(--talentry-space-2); height: var(--talentry-space-2); border-radius: var(--talentry-radius-pill); background: var(--talentry-color-interview-muted); }
+.talentry-pre-auth__dots [aria-current="step"] span { width: var(--talentry-space-6); background: var(--talentry-color-primary); }
+.talentry-pre-auth__final-actions { min-height: var(--talentry-button-height-lg); }
+.talentry-pre-auth :focus-visible { outline: 2px solid var(--talentry-color-interview-text); outline-offset: var(--talentry-space-1); }
+.talentry-pre-auth__sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0; }
+/* Clip only the decoration, preserving document scrolling and content focus rings. */
+.talentry-pre-auth__aurora {
+  position: absolute;
+  inset: 0;
+  z-index: 0;
+  overflow: hidden;
+  pointer-events: none;
+  border-radius: inherit;
+}
+.talentry-pre-auth__aurora::before,
+.talentry-pre-auth__aurora::after {
+  content: '';
+  position: absolute;
+  width: 100%;
+  height: 65%;
+  max-height: calc(var(--talentry-space-16) * 12);
+  border-radius: 50%;
+  filter: blur(var(--talentry-space-12));
+  pointer-events: none;
+}
+.talentry-pre-auth__aurora::before {
+  top: 0;
+  left: -15%;
+  opacity: 0.16;
+  background: radial-gradient(ellipse at center, var(--talentry-color-primary), transparent 68%);
+  transform: translate3d(-3%, -4%, 0) rotate(-12deg) scale(1.04);
+  animation: talentry-pre-auth-aurora-primary 19s ease-in-out -7s infinite;
+}
+.talentry-pre-auth__aurora::after {
+  bottom: 0;
+  right: -15%;
+  opacity: 0.13;
+  background: radial-gradient(ellipse at center, var(--talentry-color-indigo), transparent 70%);
+  transform: translate3d(3%, 2%, 0) rotate(14deg) scale(1.08);
+  animation: talentry-pre-auth-aurora-indigo 23s ease-in-out -13s infinite;
+}
+@keyframes talentry-pre-auth-aurora-primary {
+  0%, 100% { transform: translate3d(-3%, -4%, 0) rotate(-12deg) scale(1.04); }
+  50% { transform: translate3d(7%, 3%, 0) rotate(-6deg) scale(1.12); }
+}
+@keyframes talentry-pre-auth-aurora-indigo {
+  0%, 100% { transform: translate3d(3%, 2%, 0) rotate(14deg) scale(1.08); }
+  50% { transform: translate3d(-6%, -5%, 0) rotate(8deg) scale(1.02); }
+}
+@media (prefers-reduced-motion: reduce) {
+  .talentry-pre-auth__aurora::before,
+  .talentry-pre-auth__aurora::after { animation: none; }
+}
+@media (min-width: 768px) {
+  .talentry-pre-auth { padding: max(var(--talentry-space-8), env(safe-area-inset-top, 0px)) max(var(--talentry-space-8), env(safe-area-inset-right, 0px)) max(var(--talentry-space-8), env(safe-area-inset-bottom, 0px)) max(var(--talentry-space-8), env(safe-area-inset-left, 0px)); }
+  .talentry-pre-auth__frame { gap: var(--talentry-space-8); }
+  .talentry-pre-auth__card { padding: var(--talentry-space-8); }
+}
~~~

New Summary creation:
~~~diff
diff --git a/docs/01_Engineering/Sprint_PREAUTH_BACKGROUND_MOTION_01_Summary.md b/docs/01_Engineering/Sprint_PREAUTH_BACKGROUND_MOTION_01_Summary.md
new file mode 100644
--- /dev/null
+++ b/docs/01_Engineering/Sprint_PREAUTH_BACKGROUND_MOTION_01_Summary.md
@@ -0,0 +1,16 @@
+# Sprint PREAUTH_BACKGROUND_MOTION_01 Summary
+
+- Title: Pre-auth background motion refinement
+- Parent stage: PREAUTH_ONBOARDING_01
+- Branch: feature/auth-foundation
+- HEAD: 1ca99820f49eb8dbf5c59dcb841f66d87561fbbb
+- Status: Background motion complete; ready for runtime review.
+- Goal: Add calm CSS aurora motion behind the approved pre-auth design.
+- Modified: styles/talentry-pre-auth.css; components/pre-auth/PreAuthShell.tsx.
+- Created: this Summary and Sprint_PREAUTH_BACKGROUND_MOTION_01_Engineering_Report.md.
+- Implementation: Two blurred radial-gradient pseudo-elements in a decorative clipped wrapper; transform-only 19s/23s loops, offset phases, opacity 0.16/0.13.
+- Accessibility: aria-hidden wrapper, no pointer input/tab stop; reduced-motion disables both animations.
+- Validation: npx.cmd tsc --noEmit --incremental false PASS (0); git diff --check PASS (0). Git LF-to-CRLF notices and npm update notice; no dependency change.
+- Risks: Browser visuals, mobile performance and reduced-motion runtime verification pending.
+- Build: Not run as instructed.
+- Approval: Acceptance pending. No Git mutation or Project Memory update; previous reports preserved.
~~~

This new Engineering Report is its own full creation record; embedding a complete diff of itself would recurse.

## 13. Risks and Limitations
Browser runtime acceptance is pending; static validation does not prove frame rate or perceived subtlety. Static blur is restricted to two layers but compositor cost varies by device. Existing parent-stage limitations remain unchanged.

## 14. Untouched Modules
Routing, authentication, preferences/localStorage, onboarding state/pager, copy, Result destinations, auth forms, Dashboard/account/history, shared tokens, package files and schema untouched. No behavior added to presentation.

## 15. Approval Required
Stop for runtime review and acceptance. No production build or next stage performed.
