# Sprint PREAUTH_TRUE_WAVE_01 Engineering Report

## 1. Identity

Date: 2026-09-21. Parent stage PREAUTH_ONBOARDING_01. Branch feature/auth-foundation.
HEAD 1ca99820f49eb8dbf5c59dcb841f66d87561fbbb. Status: implementation complete; runtime review and acceptance pending.

## 2. Objective and Boundaries

Replace the rejected drifting aurora blobs with recognizable moving wave bands. Presentation only. Preserve dark background direction, card, typography, layout, header, language controls and CTA hierarchy. No routing, auth, onboarding state/persistence/copy or Result destination changes.

## 3. Repository Before Implementation

Four pre-existing modified tracked files and fourteen untracked files from authorized earlier work. HEAD remains 1ca9982. Changes are based on this request's working-tree presentation files, not the committed HEAD. No previous work discarded.

## 4. Architecture and Decisions

The existing clipped decorative wrapper now contains one inline SVG, viewBox 0 0 1200 900, preserveAspectRatio=none. Wrapper and SVG are aria-hidden; SVG is focusable=false. CSS pointer-events:none keeps it noninteractive.
Two groups each contain a filled smooth cubic path. Each path repeats one 1200-unit period twice in a continuous 2400-unit shape; top and bottom boundaries meet matching periodic endpoints/tangents. There is no separate internal tile edge.
Upper band is broader (150 SVG units thick; curve control amplitude 120), lower is 120 units thick with control amplitude 80, placed lower in the scene. Purple/indigo tokens and 0.13/0.22 opacity distinguish depth.
CSS transform-box:view-box makes -100% translation equal the 1200-unit period rather than the path's 2400-unit bounds. Only X transform animates. Upper: 27s linear, -7s initial phase, right-to-left. Lower: 20s linear reverse, -13s phase, left-to-right. Durations prioritize the requested broadest/slowest upper band. No bounce, pulse, rotation or path morphing.
Static 4px blur softens the filled edges without dissolving crests/troughs. Old aurora pseudo-elements, radial blob styles, scale/rotation drift and aurora keyframes removed. Approved static navy background atmosphere preserved.
Local layer 0 remains behind the stable content frame at layer 1. Shared SVG has no panel-dependent key or condition; internal onboarding changes do not rebuild a different environment.

## 5–6. Files and Responsibilities

Modified:
- components/pre-auth/PreAuthShell.tsx: replaces empty aurora div with decorative SVG and two periodic filled paths.
- styles/talentry-pre-auth.css: replaces blob geometry/animation with wave sizing, fill, static blur, transform travel and reduced-motion stop.

Created:
- docs/01_Engineering/Sprint_PREAUTH_TRUE_WAVE_01_Summary.md: acceptance summary.
- docs/01_Engineering/Sprint_PREAUTH_TRUE_WAVE_01_Engineering_Report.md: this record and source diff.

Deleted files: none. Previous reports and ADR preserved.

## 7. Interfaces

No public prop/type/export/callback changes. No new state, effects, event handlers, dependency or asset file. Decorative SVG is entirely inline.

## 8. Accessibility

Decorative SVG cannot receive pointer input or keyboard focus and is hidden from accessibility APIs. No textual content or semantic hierarchy changed.
Reduced-motion sets animation:none on both groups, preserving static offsets (-25% and -65%), fills and low opacity. Existing focus indicators, target sizes and opaque card/language surfaces unchanged. Motion communicates no information.
Runtime visual contrast and control-access confirmation still required.

## 9. Styling, Performance and Responsive Strategy

Same percentage-filling SVG at all breakpoints, with preserveAspectRatio=none. Only the absolute decoration wrapper clips overflow; real content retains normal document scrolling. No added layout dimensions, global stacking values or breakpoint-specific animation.
CSS-only transform animation; opacity and blur stay constant. No JS loops, requestAnimationFrame, canvas/WebGL, animated filters/shadows, external images or dependencies.
Pending runtime targets: 390x844, 641–767 and >=768, short/zoomed documents, loop boundaries, mobile smoothness and wave visibility. Static review does not certify browser performance or perceived softness.

## 10. Validation

- npx.cmd tsc --noEmit --incremental false: exit 0, no TypeScript diagnostics. npm printed its 11.16.0 -> 12.0.2 update notice; no update performed.
- git diff --check: exit 0; no whitespace errors. Git emitted LF-to-CRLF notices for the four pre-existing tracked modifications.
- git status --short: only existing authorized work and new refinement reports.
- Source search: no aurora class/keyframe remains in the two edited files.
- Source comparison: edits confined to decorative SVG and wave CSS; no functional code changed.
- Build not run per explicit instruction.
- Runtime browser review not performed. Check observable crests/troughs, horizontal motion, seamless boundaries, no overflow/clipping artefacts, unchanged card readability, reduced-motion state and continuity across Splash/panels.

## 11. Git State

HEAD unchanged, nothing staged. Four pre-existing tracked modifications: app/page.tsx, app/result/page.tsx, components/result/ResultContent.tsx and components/result/ResultShell.tsx.
Sixteen untracked files after reports: six pre-auth source files, pre-auth CSS, ADR-001 and eight reports across the parent stage and three refinements.
No commit, push, reset, restore, stash, branch action or Project Memory modification.

## 12. Complete Incremental Source Diffs

Full-file hunks compare against the working-tree baseline captured at this request's start; presentation files are still untracked parent-stage files.

~~~diff
diff --git a/components/pre-auth/PreAuthShell.tsx b/components/pre-auth/PreAuthShell.tsx
--- a/components/pre-auth/PreAuthShell.tsx
+++ b/components/pre-auth/PreAuthShell.tsx
@@ -1,34 +1,44 @@
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
-    <div className="talentry-pre-auth__aurora" aria-hidden="true" />
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
+    <div className="talentry-pre-auth__waves" aria-hidden="true">
+      <svg viewBox="0 0 1200 900" preserveAspectRatio="none" aria-hidden="true" focusable="false">
+        {/* Each filled ribbon repeats its 1200-unit curve twice, without an internal seam. */}
+        <g className="talentry-pre-auth__wave talentry-pre-auth__wave--upper">
+          <path d="M0 300 C200 180 400 180 600 300 S1000 420 1200 300 S1600 180 1800 300 S2200 420 2400 300 L2400 450 C2200 570 2000 570 1800 450 S1400 330 1200 450 S800 570 600 450 S200 330 0 450 Z" />
+        </g>
+        <g className="talentry-pre-auth__wave talentry-pre-auth__wave--lower">
+          <path d="M0 620 C200 540 400 540 600 620 S1000 700 1200 620 S1600 540 1800 620 S2200 700 2400 620 L2400 740 C2200 820 2000 820 1800 740 S1400 660 1200 740 S800 820 600 740 S200 660 0 740 Z" />
+        </g>
+      </svg>
+    </div>
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
@@ -1,174 +1,165 @@
-@import './talentry-tokens.css';
-
-body:has(.talentry-pre-auth) { margin: 0; }
-.talentry-pre-auth, .talentry-pre-auth * { box-sizing: border-box; }
-.talentry-pre-auth {
-  position: relative;
-  isolation: isolate;
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
-  position: relative;
-  z-index: 1;
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
-/* Clip only the decoration, preserving document scrolling and content focus rings. */
-.talentry-pre-auth__aurora {
-  position: absolute;
-  inset: 0;
-  z-index: 0;
-  overflow: hidden;
-  pointer-events: none;
-  border-radius: inherit;
-}
-.talentry-pre-auth__aurora::before,
-.talentry-pre-auth__aurora::after {
-  content: '';
-  position: absolute;
-  width: 100%;
-  height: 65%;
-  max-height: calc(var(--talentry-space-16) * 12);
-  border-radius: 50%;
-  filter: blur(var(--talentry-space-12));
-  pointer-events: none;
-}
-.talentry-pre-auth__aurora::before {
-  top: 0;
-  left: -15%;
-  opacity: 0.16;
-  background: radial-gradient(ellipse at center, var(--talentry-color-primary), transparent 68%);
-  transform: translate3d(-3%, -4%, 0) rotate(-12deg) scale(1.04);
-  animation: talentry-pre-auth-aurora-primary 19s ease-in-out -7s infinite;
-}
-.talentry-pre-auth__aurora::after {
-  bottom: 0;
-  right: -15%;
-  opacity: 0.13;
-  background: radial-gradient(ellipse at center, var(--talentry-color-indigo), transparent 70%);
-  transform: translate3d(3%, 2%, 0) rotate(14deg) scale(1.08);
-  animation: talentry-pre-auth-aurora-indigo 23s ease-in-out -13s infinite;
-}
-@keyframes talentry-pre-auth-aurora-primary {
-  0%, 100% { transform: translate3d(-3%, -4%, 0) rotate(-12deg) scale(1.04); }
-  50% { transform: translate3d(7%, 3%, 0) rotate(-6deg) scale(1.12); }
-}
-@keyframes talentry-pre-auth-aurora-indigo {
-  0%, 100% { transform: translate3d(3%, 2%, 0) rotate(14deg) scale(1.08); }
-  50% { transform: translate3d(-6%, -5%, 0) rotate(8deg) scale(1.02); }
-}
-@media (prefers-reduced-motion: reduce) {
-  .talentry-pre-auth__aurora::before,
-  .talentry-pre-auth__aurora::after { animation: none; }
-}
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
+.talentry-pre-auth__waves {
+  position: absolute;
+  inset: 0;
+  z-index: 0;
+  overflow: hidden;
+  pointer-events: none;
+  border-radius: inherit;
+}
+.talentry-pre-auth__waves svg {
+  display: block;
+  width: 100%;
+  height: 100%;
+  pointer-events: none;
+}
+.talentry-pre-auth__wave {
+  /* Percent transforms use the 1200-unit SVG viewport, not the 2400-unit path. */
+  transform-box: view-box;
+  filter: blur(var(--talentry-space-1));
+}
+.talentry-pre-auth__wave--upper {
+  fill: var(--talentry-color-primary);
+  opacity: 0.13;
+  transform: translate3d(-25%, 0, 0);
+  animation: talentry-pre-auth-wave-travel 27s linear -7s infinite;
+}
+.talentry-pre-auth__wave--lower {
+  fill: var(--talentry-color-indigo);
+  opacity: 0.22;
+  transform: translate3d(-65%, 0, 0);
+  animation: talentry-pre-auth-wave-travel 20s linear -13s infinite reverse;
+}
+@keyframes talentry-pre-auth-wave-travel {
+  from { transform: translate3d(0, 0, 0); }
+  to { transform: translate3d(-100%, 0, 0); }
+}
+@media (prefers-reduced-motion: reduce) {
+  .talentry-pre-auth__wave { animation: none; }
+}
+@media (min-width: 768px) {
+  .talentry-pre-auth { padding: max(var(--talentry-space-8), env(safe-area-inset-top, 0px)) max(var(--talentry-space-8), env(safe-area-inset-right, 0px)) max(var(--talentry-space-8), env(safe-area-inset-bottom, 0px)) max(var(--talentry-space-8), env(safe-area-inset-left, 0px)); }
+  .talentry-pre-auth__frame { gap: var(--talentry-space-8); }
+  .talentry-pre-auth__card { padding: var(--talentry-space-8); }
+}
~~~

New Summary:
~~~diff
diff --git a/docs/01_Engineering/Sprint_PREAUTH_TRUE_WAVE_01_Summary.md b/docs/01_Engineering/Sprint_PREAUTH_TRUE_WAVE_01_Summary.md
new file mode 100644
--- /dev/null
+++ b/docs/01_Engineering/Sprint_PREAUTH_TRUE_WAVE_01_Summary.md
@@ -0,0 +1,16 @@
+# Sprint PREAUTH_TRUE_WAVE_01 Summary
+
+- Title: Replace aurora blobs with moving SVG waves
+- Parent stage: PREAUTH_ONBOARDING_01
+- Branch: feature/auth-foundation
+- HEAD: 1ca99820f49eb8dbf5c59dcb841f66d87561fbbb
+- Status: TRUE WAVE BACKGROUND COMPLETE — READY FOR RUNTIME REVIEW
+- Goal: Recognizable crests/troughs and continuous horizontal travel behind the approved shell.
+- Modified: components/pre-auth/PreAuthShell.tsx; styles/talentry-pre-auth.css.
+- Created: this Summary and Sprint_PREAUTH_TRUE_WAVE_01_Engineering_Report.md.
+- Implementation: One decorative inline SVG, two repeating filled cubic-curve ribbons; upper 27s leftward, lower 20s rightward; different phases and low opacity.
+- Reduced motion: Stops animation, retains static offset waves.
+- Validation: TypeScript PASS (exit 0); git diff --check PASS (exit 0). Git line-ending notices and npm update notice; no package change.
+- Risks: Runtime visual/performance/loop-boundary acceptance pending. No browser success claimed.
+- Build: Not run, as instructed.
+- Approval: Pending runtime review. No commit, staging, push or Project Memory update; previous reports preserved.
~~~

This new Engineering Report is itself its complete creation record; recursively embedding its own diff is omitted.

## 13. Risks and Limitations

Runtime visual acceptance remains pending, including edge rendering at animation boundaries and performance of static SVG blur on target devices. No provider, authentication or persistence debt resolved or introduced by this decoration. Existing parent-stage limitations remain unchanged.

## 14. Untouched Modules

Root, Result, auth forms/utilities, preferences, pager/flow logic, copy, Dashboard/account/history, shared tokens, dependencies, schema and Project Memory unchanged. Card/header/CTA styling and layout unchanged. No behavior relies on animation.

## 15. Approval Required

Stop for runtime review and acceptance. Production build, commit and any next stage are not performed.
