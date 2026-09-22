# Sprint PREAUTH_OCEAN_SWELL_01 Engineering Report

## 1. Identity

Date: 2026-09-21. Branch: feature/auth-foundation. Parent stage: PREAUTH_ONBOARDING_01.
HEAD: 1ca99820f49eb8dbf5c59dcb841f66d87561fbbb.
Status: FULL-SCREEN OCEAN SWELL COMPLETE — READY FOR RUNTIME REVIEW. Acceptance pending.

## 2. Objective and Boundaries

Replace the rejected thin ribbons/opposing motion with a broad overlapping color surface flowing left to right. Retain approved card/header/typography/CTA/language layout and existing behavior. No routes, auth, copy, persistence, Result, dependencies or image assets changed.

## 3. Repository State Before Implementation

Authorized previous work present: four modified tracked files and sixteen untracked files. HEAD remains 1ca9982. This refinement compares the existing working-tree presentation files, not HEAD, since they remain untracked parent-stage additions.
Previous files/reports preserved. No Git mutation performed.

## 4. Architecture and Implementation Decisions

One shared decorative inline SVG remains under the stable content frame. Its three filled paths now describe very broad asymmetric periodic fields, each spanning x=-1200 through x=3600 against a 1200x900 viewBox. Four continuously joined periods supply runway at both clip edges, including static blur margins, during one-period horizontal travel. No internal vertical seams.
One broad crest and valley per viewport; cubic segments have matching periodic endpoint tangents. This is static geometry, not animated path d values.
Layer geometry:
- Far: nominal upper boundary y=40, thickness 320 units, control amplitude 150.
- Middle: y=230, thickness 360, control amplitude 120.
- Near/depth: y=440, thickness 340, control amplitude 100.
Actual cubic extrema are smaller than control amplitudes (approximately 75–113 units, or 8–13% of shell height). Geometric top-to-bottom extent is about 53–60% of shell height before blur; the nominal bands are 36–40% thick. Substantial overlap replaces the separated thin strips. On full-height normal viewport this corresponds roughly to 53–60vh; long scrolling documents scale with shell height.
Each path uses a local vertical gradient: zero opacity at both ends, 0.6 at 28%/72%, full stop opacity centrally. Colors blend only existing navy-soft/indigo/primary tokens. Layer opacity is 0.28/0.36/0.20, with the richer purple middle field and dimmer blue depth field. Static 48px blur dissolves outlines into neighbors.
CSS transform-box:view-box fixes one travel period to 1200 units. All animations progress translateX(-100%) -> 0: left to right. Durations 28s/22s/36s with negative delays -9s/-15s/-5s. No opposing directions, bounce, pulse, JS animation, vertical oscillation or rotation.
React useId supplies stable unique gradient references; it is presentation-only. Shared shell identity and gradient IDs persist across existing panel updates, so the environment is not conditional on onboarding page.

## 5–6. Created/Modified Files and Responsibilities

Modified:
- components/pre-auth/PreAuthShell.tsx: decorative SVG definitions, unique gradient IDs and three broad repeated paths.
- styles/talentry-pre-auth.css: field fills, opacity blending, static blur, common travel keyframes and reduced-motion rules.

Created:
- docs/01_Engineering/Sprint_PREAUTH_OCEAN_SWELL_01_Summary.md: acceptance summary.
- docs/01_Engineering/Sprint_PREAUTH_OCEAN_SWELL_01_Engineering_Report.md: this technical report and incremental diffs.

Deleted files: none. Old wave/ribbon selectors, geometry and keyframe were replaced, not retained alongside the new effect.

## 7. Public Interfaces and Types

PreAuthShell public props and exports unchanged. Only a presentation useId hook added, with local gradient definitions. No business state, event handlers, route interfaces or persistence API introduced. Existing content markup remains intact.

## 8. Accessibility

Decorative wrapper/SVG remain aria-hidden; SVG remains focusable=false and pointer-events:none. No added tab stops. Card/control surfaces remain opaque above layer 0; frame stays at local z-index 1.
Reduced-motion disables all swell animation and retains base phase transforms -22%/-58%/-78%. Understanding the page never relies on motion. Existing semantics, labels, focus indicators and minimum touch targets unchanged.
Runtime contrast/visual stability still require acceptance; no browser certification claimed.

## 9. Styling and Performance

Existing Talentry palette, approved static background atmosphere, content/card/header styling and layout preserved. Only effect selectors/geometry changed.
Absolute wrapper clips decoration independently without clipping content or increasing document width. SVG fills the shell with preserveAspectRatio=none; no animation breakpoint or mobile ribbon fallback.
Only group transforms animate. Filter values and opacity are static. No JS loops, requestAnimationFrame, canvas, WebGL, assets, dependencies or animated layout/shadow properties.
Three broad blurred layers require target-device runtime performance review; static code checks do not prove frame rate.

## 10. Validation and Exact Results

- npx.cmd tsc --noEmit --incremental false: exit 0, no TypeScript diagnostics. npm printed update notice 11.16.0 -> 12.0.2; no update performed.
- git diff --check: exit 0, no whitespace errors. Git LF-to-CRLF notices apply to the four pre-existing tracked route/Result modifications.
- git status --short: prior authorized changes and this refinement's reports only.
- Source search confirms no old __wave/__waves selectors, wave-travel keyframe or aurora code remains in edited files. Three new swell animation declarations share the same left-to-right keyframes.
- Source diff confirms changes are limited to decorative SVG and effect styles; content, routing, authentication, persistence and pager behavior unchanged.
- Production build not run as explicitly instructed.
- Runtime browser review not performed: inspect color-field blending, 2–4 second perceived movement, seamless loop boundaries, Splash-to-panel continuity, reduced-motion, desktop/641–767/390x844, long German/zoom/short viewport overflow and mobile smoothness.

## 11. Git Status

HEAD unchanged; nothing staged. Four pre-existing modified tracked files: app/page.tsx, app/result/page.tsx, components/result/ResultContent.tsx, components/result/ResultShell.tsx.
Eighteen untracked files after reports: six pre-auth source files, pre-auth CSS, ADR-001, ten reports across implementation and refinements.
No stage, commit, push, reset, restore, stash, branch mutation or Project Memory update.

## 12. Complete Refinement Diffs

These full-file hunks compare the working-tree content captured at this request's start.

~~~diff
diff --git a/components/pre-auth/PreAuthShell.tsx b/components/pre-auth/PreAuthShell.tsx
--- a/components/pre-auth/PreAuthShell.tsx
+++ b/components/pre-auth/PreAuthShell.tsx
@@ -1,44 +1,61 @@
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
-    <div className="talentry-pre-auth__waves" aria-hidden="true">
-      <svg viewBox="0 0 1200 900" preserveAspectRatio="none" aria-hidden="true" focusable="false">
-        {/* Each filled ribbon repeats its 1200-unit curve twice, without an internal seam. */}
-        <g className="talentry-pre-auth__wave talentry-pre-auth__wave--upper">
-          <path d="M0 300 C200 180 400 180 600 300 S1000 420 1200 300 S1600 180 1800 300 S2200 420 2400 300 L2400 450 C2200 570 2000 570 1800 450 S1400 330 1200 450 S800 570 600 450 S200 330 0 450 Z" />
-        </g>
-        <g className="talentry-pre-auth__wave talentry-pre-auth__wave--lower">
-          <path d="M0 620 C200 540 400 540 600 620 S1000 700 1200 620 S1600 540 1800 620 S2200 700 2400 620 L2400 740 C2200 820 2000 820 1800 740 S1400 660 1200 740 S800 820 600 740 S200 660 0 740 Z" />
-        </g>
-      </svg>
-    </div>
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
+import { useId } from 'react'
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
+  const gradientId = useId()
+  return <main className="talentry-pre-auth" lang={language}>
+    <div className="talentry-pre-auth__swells" aria-hidden="true">
+      <svg viewBox="0 0 1200 900" preserveAspectRatio="none" aria-hidden="true" focusable="false">
+        <defs>
+          {(['far', 'middle', 'near'] as const).map(depth => (
+            <linearGradient key={depth} id={`${gradientId}-${depth}`} x1="0" y1="0" x2="0" y2="1"
+              className={`talentry-pre-auth__swell-gradient talentry-pre-auth__swell-gradient--${depth}`}>
+              <stop offset="0%" stopOpacity="0" />
+              <stop offset="28%" stopOpacity="0.6" />
+              <stop offset="50%" stopOpacity="1" />
+              <stop offset="72%" stopOpacity="0.6" />
+              <stop offset="100%" stopOpacity="0" />
+            </linearGradient>
+          ))}
+        </defs>
+        {/* Four joined periods give both edges blur runway throughout each 1200-unit loop. */}
+        <g className="talentry-pre-auth__swell talentry-pre-auth__swell--far">
+          <path fill={`url(#${gradientId}-far)`} d="M-1200 40 C-1020 -110 -810 -110 -600 40 C-400 145 -180 190 0 40 C180 -110 390 -110 600 40 C800 145 1020 190 1200 40 C1380 -110 1590 -110 1800 40 C2000 145 2220 190 2400 40 C2580 -110 2790 -110 3000 40 C3200 145 3420 190 3600 40 L3600 360 C3420 510 3200 465 3000 360 C2790 210 2580 210 2400 360 C2220 510 2000 465 1800 360 C1590 210 1380 210 1200 360 C1020 510 800 465 600 360 C390 210 180 210 0 360 C-180 510 -400 465 -600 360 C-810 210 -1020 210 -1200 360 Z" />
+        </g>
+        <g className="talentry-pre-auth__swell talentry-pre-auth__swell--middle">
+          <path fill={`url(#${gradientId}-middle)`} d="M-1200 230 C-1020 110 -810 110 -600 230 C-400 314 -180 350 0 230 C180 110 390 110 600 230 C800 314 1020 350 1200 230 C1380 110 1590 110 1800 230 C2000 314 2220 350 2400 230 C2580 110 2790 110 3000 230 C3200 314 3420 350 3600 230 L3600 590 C3420 710 3200 674 3000 590 C2790 470 2580 470 2400 590 C2220 710 2000 674 1800 590 C1590 470 1380 470 1200 590 C1020 710 800 674 600 590 C390 470 180 470 0 590 C-180 710 -400 674 -600 590 C-810 470 -1020 470 -1200 590 Z" />
+        </g>
+        <g className="talentry-pre-auth__swell talentry-pre-auth__swell--near">
+          <path fill={`url(#${gradientId}-near)`} d="M-1200 440 C-1020 340 -810 340 -600 440 C-400 510 -180 540 0 440 C180 340 390 340 600 440 C800 510 1020 540 1200 440 C1380 340 1590 340 1800 440 C2000 510 2220 540 2400 440 C2580 340 2790 340 3000 440 C3200 510 3420 540 3600 440 L3600 780 C3420 880 3200 850 3000 780 C2790 680 2580 680 2400 780 C2220 880 2000 850 1800 780 C1590 680 1380 680 1200 780 C1020 880 800 850 600 780 C390 680 180 680 0 780 C-180 880 -400 850 -600 780 C-810 680 -1020 680 -1200 780 Z" />
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
@@ -1,165 +1,174 @@
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
-.talentry-pre-auth__waves {
-  position: absolute;
-  inset: 0;
-  z-index: 0;
-  overflow: hidden;
-  pointer-events: none;
-  border-radius: inherit;
-}
-.talentry-pre-auth__waves svg {
-  display: block;
-  width: 100%;
-  height: 100%;
-  pointer-events: none;
-}
-.talentry-pre-auth__wave {
-  /* Percent transforms use the 1200-unit SVG viewport, not the 2400-unit path. */
-  transform-box: view-box;
-  filter: blur(var(--talentry-space-1));
-}
-.talentry-pre-auth__wave--upper {
-  fill: var(--talentry-color-primary);
-  opacity: 0.13;
-  transform: translate3d(-25%, 0, 0);
-  animation: talentry-pre-auth-wave-travel 27s linear -7s infinite;
-}
-.talentry-pre-auth__wave--lower {
-  fill: var(--talentry-color-indigo);
-  opacity: 0.22;
-  transform: translate3d(-65%, 0, 0);
-  animation: talentry-pre-auth-wave-travel 20s linear -13s infinite reverse;
-}
-@keyframes talentry-pre-auth-wave-travel {
-  from { transform: translate3d(0, 0, 0); }
-  to { transform: translate3d(-100%, 0, 0); }
-}
-@media (prefers-reduced-motion: reduce) {
-  .talentry-pre-auth__wave { animation: none; }
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
+/* Clip only decoration; content and focus rings retain normal document overflow. */
+.talentry-pre-auth__swells {
+  position: absolute;
+  inset: 0;
+  z-index: 0;
+  overflow: hidden;
+  pointer-events: none;
+  border-radius: inherit;
+}
+.talentry-pre-auth__swells svg {
+  display: block;
+  width: 100%;
+  height: 100%;
+  pointer-events: none;
+}
+.talentry-pre-auth__swell {
+  /* One viewport is one period; the paths include extra runway on both sides. */
+  transform-box: view-box;
+  filter: blur(var(--talentry-space-12));
+}
+.talentry-pre-auth__swell-gradient--far stop { stop-color: var(--talentry-color-navy-soft); }
+.talentry-pre-auth__swell-gradient--far stop:nth-child(3) { stop-color: var(--talentry-color-indigo); }
+.talentry-pre-auth__swell-gradient--middle stop { stop-color: var(--talentry-color-indigo); }
+.talentry-pre-auth__swell-gradient--middle stop:nth-child(3) { stop-color: var(--talentry-color-primary); }
+.talentry-pre-auth__swell-gradient--near stop { stop-color: var(--talentry-color-navy-soft); }
+.talentry-pre-auth__swell-gradient--near stop:nth-child(3) { stop-color: var(--talentry-color-indigo); }
+.talentry-pre-auth__swell--far {
+  opacity: 0.28;
+  transform: translate3d(-22%, 0, 0);
+  animation: talentry-pre-auth-swell-flow 28s linear -9s infinite;
+}
+.talentry-pre-auth__swell--middle {
+  opacity: 0.36;
+  transform: translate3d(-58%, 0, 0);
+  animation: talentry-pre-auth-swell-flow 22s linear -15s infinite;
+}
+.talentry-pre-auth__swell--near {
+  opacity: 0.20;
+  transform: translate3d(-78%, 0, 0);
+  animation: talentry-pre-auth-swell-flow 36s linear -5s infinite;
+}
+@keyframes talentry-pre-auth-swell-flow {
+  from { transform: translate3d(-100%, 0, 0); }
+  to { transform: translate3d(0, 0, 0); }
+}
+@media (prefers-reduced-motion: reduce) {
+  .talentry-pre-auth__swell { animation: none; }
+}
+@media (min-width: 768px) {
+  .talentry-pre-auth { padding: max(var(--talentry-space-8), env(safe-area-inset-top, 0px)) max(var(--talentry-space-8), env(safe-area-inset-right, 0px)) max(var(--talentry-space-8), env(safe-area-inset-bottom, 0px)) max(var(--talentry-space-8), env(safe-area-inset-left, 0px)); }
+  .talentry-pre-auth__frame { gap: var(--talentry-space-8); }
+  .talentry-pre-auth__card { padding: var(--talentry-space-8); }
+}
~~~

New Summary:
~~~diff
diff --git a/docs/01_Engineering/Sprint_PREAUTH_OCEAN_SWELL_01_Summary.md b/docs/01_Engineering/Sprint_PREAUTH_OCEAN_SWELL_01_Summary.md
new file mode 100644
--- /dev/null
+++ b/docs/01_Engineering/Sprint_PREAUTH_OCEAN_SWELL_01_Summary.md
@@ -0,0 +1,18 @@
+# Sprint PREAUTH_OCEAN_SWELL_01 Summary
+
+- Title: Full-screen ocean color swell
+- Parent stage: PREAUTH_ONBOARDING_01
+- Branch: feature/auth-foundation
+- HEAD: 1ca99820f49eb8dbf5c59dcb841f66d87561fbbb
+- Status: FULL-SCREEN OCEAN SWELL COMPLETE — READY FOR RUNTIME REVIEW
+- Goal: Replace distinct thin ribbons with broad overlapping moving gradient fields.
+- Modified files: components/pre-auth/PreAuthShell.tsx; styles/talentry-pre-auth.css.
+- Created files: this Summary and Sprint_PREAUTH_OCEAN_SWELL_01_Engineering_Report.md.
+- Technique: Three broad filled gradient paths with four joined periods; left-to-right transform cycles of 28s, 22s and 36s; fixed 48px blur and translucent edge fades.
+- Scale: Approximately 53–60% of shell height in geometric vertical extent before blur; substantial overlap. At ordinary full-height viewport this is approximately 53–60vh. No card/layout change.
+- Reduced motion: All animation stops, leaving distinct static phase offsets.
+- Functionality: Routing, authentication, copy, state/persistence, Result routes and onboarding behavior unchanged.
+- Validation: npx.cmd tsc --noEmit --incremental false PASS (0); git diff --check PASS (0). npm update and Git LF-to-CRLF notices only.
+- Build: Not run.
+- Risks: Runtime appearance, visual loop continuity and mobile GPU performance require review.
+- Approval: Pending runtime review and acceptance. No stage/commit/push or Project Memory update. Earlier reports preserved.
~~~

This Engineering Report is the complete creation record of its own new file; recursively including its own diff is omitted.

## 13. Risks, Limitations and Debt

Visual acceptance is pending. Strong overlap and broad static blur are implementation choices intended to remove countable ribbons, but the requested perceptual result must be judged in browser. Large blurred SVG buffers may vary in cost across devices. Previously recorded unrelated auth/localization/provider limitations remain unchanged.

## 14. Untouched Modules

Routing, authentication, onboarding state/persistence, copy, Result destinations, auth forms, Dashboard/account/history, shared tokens, package files, schema and Project Memory unchanged. Earlier reports remain immutable.

## 15. Approval Required

Stop for runtime review and approval. No build or next stage performed.
