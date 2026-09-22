# Sprint PREAUTH_SPLASH_VISUAL_01 Engineering Report

## 1. Report Identity

Date: 2026-09-21. Branch: feature/auth-foundation. Parent stage: PREAUTH_ONBOARDING_01.
Status: VISUAL REFINEMENT COMPLETE — READY FOR SPLASH RUNTIME REVIEW. Acceptance pending.

## 2. Objective and Boundaries

Refine only pre-auth presentation to match existing Talentry auth atmosphere, compact card proportions and restrained hierarchy. Shared shell styles provide continuity for the three onboarding panels. No interaction redesign, routes, state, localStorage, auth, Result or auth-form changes.

## 3. Repository State Before Implementation

HEAD 1ca99820f49eb8dbf5c59dcb841f66d87561fbbb. Existing authorized uncommitted implementation was present: four tracked route/Result modifications and ten untracked implementation/documentation files. Preserved all of it.
The baseline for the refinement diffs below is the working-tree content at the beginning of this request, not HEAD: both presentation files are still untracked from the parent stage.

## 4. Architecture and Visual Decisions

Read existing AuthShell, auth stylesheet and current pre-auth shell/splash styling. Existing auth presentation uses dark navy cards, a purple/indigo brand mark, subtle background lighting and bordered language controls.
Reused those conventions with layered static radial/linear gradients drawn from existing tokens. Decoration is CSS background paint, not oversized positioned elements that could cause overflow.
The header stays at the top; its brand and functional language buttons share a unified dark treatment. Language buttons remain visible in a pill-shaped group with their existing labels and handlers.
The card is centered in the space below the header, capped at 448px like the auth card family. Removed both flex stretching and the 576px desktop minimum card height. Card height now follows content.
Splash branding uses a gradient T emblem, restrained label, 30px headline and smaller muted supporting text. The full-width primary action has the existing purple background and shadow. Splash auth links become quieter underlined actions below a separator.
Onboarding inherits the background, compact card, typography and dark control colors; its interaction tree and handlers are untouched.
No copied AuthShell component, dependency, new palette, external image or raster asset.

## 5. Created and Modified Files

Modified:
- components/pre-auth/SplashScreen.tsx
- styles/talentry-pre-auth.css

Created:
- docs/01_Engineering/Sprint_PREAUTH_SPLASH_VISUAL_01_Summary.md
- docs/01_Engineering/Sprint_PREAUTH_SPLASH_VISUAL_01_Engineering_Report.md

No deletion. Earlier parent-stage reports and ADR remain unchanged.

## 6. File Responsibilities

SplashScreen: existing semantic content/actions; three additional presentation classes identify welcome content, brand emblem and welcome footer.
Stylesheet: visual atmosphere, header/language styling, compact card layout, typography, CTA hierarchy and focus colors.
Summary: concise acceptance record. This report: incremental source diff and validation evidence.

## 7. Public Interfaces, Props and Types

No interface, prop, type, callback, text, route or export changed. SplashScreen still receives copy, returning and onStart. Only className values changed in TSX.

## 8. Accessibility

Preserved native controls, labels, headings, focus handling, aria state and keyboard behavior.
Language targets remain at least 44x44px. Main CTA stays 52px minimum height; secondary splash actions remain at least 44px.
Focus outline now uses light interview text against the dark surfaces. Selected language retains underline and font-weight; selected dots retain a wider shape.
High-contrast existing interview text/muted tokens replace the earlier dark-on-light text. Primary button retains white-on-purple. No animations or transitions introduced; reduced-motion use does not depend on motion.
Runtime accessibility confirmation is pending; no screen-reader or browser success is claimed.

## 9. Styling and Responsive Strategy

All palette, spacing, font sizes, radii and shadows reference talentry-tokens.css. Tokens unchanged.
100vh/100dvh fallback and safe-area padding preserved. Shared grid has header plus a content row, with an intrinsic-height centered card rather than a stretched panel.
Compact layout continues through 767px; >=768px increases outer/card padding without imposing an empty card minimum height.
Card width is bounded by its container; text wrapping and document flow remain available for German, zoom and short landscape. No nested scroll container or fixed CTA overlay added.
390x844 fit and perceived spacing require the requested runtime review.

## 10. Validation and Exact Results

- npx.cmd tsc --noEmit --incremental false: exit 0; no TypeScript diagnostics. npm printed its 11.16.0 -> 12.0.2 update notice; no update performed.
- git diff --check: exit 0; no whitespace errors. Git printed LF-to-CRLF notices for the four previously modified route/Result files.
- git status --short: existing parent-stage changes preserved; this refinement adds only its two reports to the existing untracked paths.
- git --no-pager diff --stat: four tracked parent-stage files, 9 insertions and 5 deletions. Since the presentation files are untracked, this stat cannot describe the incremental refinement; complete working-tree before/after diffs are below.
- SHA-256 before/after equality confirmed for app/page.tsx, app/result/page.tsx, components/result/ResultContent.tsx, components/result/ResultShell.tsx, components/pre-auth/usePreAuthPreferences.ts, components/pre-auth/PreAuthFlow.tsx, components/pre-auth/OnboardingPager.tsx and components/pre-auth/pre-auth-copy.ts.
- No production build run, as explicitly instructed.
- Browser runtime not performed in this refinement. Pending: Splash first/repeat presentation and onboarding continuity at desktop, 390x844 and 641–767; German/zoom/short-screen scrolling; visible focus and actual control/contrast checks.

## 11. Git Status

HEAD unchanged at 1ca9982; nothing staged.
Modified tracked files (all pre-existing): app/page.tsx; app/result/page.tsx; components/result/ResultContent.tsx; components/result/ResultShell.tsx.
Untracked: six components/pre-auth files; styles/talentry-pre-auth.css; ADR-001; two PREAUTH_ONBOARDING_01 reports; two PREAUTH_SPLASH_VISUAL_01 reports.
Total: four modified tracked files and twelve untracked files. No commit, push, reset, restore, stash or branch action.

## 12. Complete Refinement Diffs

Full-file unified hunks below compare the two edited files against this request's working-tree baseline. This preserves visibility of every incremental change despite their untracked parent-stage status.

~~~diff
diff --git a/components/pre-auth/SplashScreen.tsx b/components/pre-auth/SplashScreen.tsx
--- a/components/pre-auth/SplashScreen.tsx
+++ b/components/pre-auth/SplashScreen.tsx
@@ -1,31 +1,31 @@
-import Link from 'next/link'
-import { AUTH_ROUTES } from '@/lib/auth/auth-constants'
-import type { PreAuthCopy } from './pre-auth-copy'
-
-interface SplashScreenProps {
-  copy: PreAuthCopy
-  returning: boolean
-  onStart: () => void
-}
-
-export default function SplashScreen({ copy, returning, onStart }: SplashScreenProps) {
-  return <>
-    <section className="talentry-pre-auth__content">
-      <span className="talentry-pre-auth__emblem" aria-hidden="true">T</span>
-      <p className="talentry-pre-auth__eyebrow">Talentry</p>
-      <h1 tabIndex={-1}>{copy.tagline}</h1>
-      <p>{returning ? copy.returning : copy.welcome}</p>
-    </section>
-    <footer className="talentry-pre-auth__footer">
-      {!returning && <button className="talentry-pre-auth__action talentry-pre-auth__action--primary"
-        type="button" onClick={onStart}>{copy.start}<span aria-hidden="true"> →</span></button>}
-      <div className="talentry-pre-auth__auth-actions">
-        <Link className="talentry-pre-auth__action" href={AUTH_ROUTES.login}>{copy.signIn}</Link>
-        <Link className="talentry-pre-auth__action" href={AUTH_ROUTES.register}>{copy.register}</Link>
-      </div>
-      {returning && <button className="talentry-pre-auth__text-action" type="button" onClick={onStart}>
-        {copy.replay}
-      </button>}
-    </footer>
-  </>
-}
+import Link from 'next/link'
+import { AUTH_ROUTES } from '@/lib/auth/auth-constants'
+import type { PreAuthCopy } from './pre-auth-copy'
+
+interface SplashScreenProps {
+  copy: PreAuthCopy
+  returning: boolean
+  onStart: () => void
+}
+
+export default function SplashScreen({ copy, returning, onStart }: SplashScreenProps) {
+  return <>
+    <section className="talentry-pre-auth__content talentry-pre-auth__welcome">
+      <span className="talentry-pre-auth__emblem talentry-pre-auth__emblem--brand" aria-hidden="true">T</span>
+      <p className="talentry-pre-auth__eyebrow">Talentry</p>
+      <h1 tabIndex={-1}>{copy.tagline}</h1>
+      <p>{returning ? copy.returning : copy.welcome}</p>
+    </section>
+    <footer className="talentry-pre-auth__footer talentry-pre-auth__welcome-actions">
+      {!returning && <button className="talentry-pre-auth__action talentry-pre-auth__action--primary"
+        type="button" onClick={onStart}>{copy.start}<span aria-hidden="true"> →</span></button>}
+      <div className="talentry-pre-auth__auth-actions">
+        <Link className="talentry-pre-auth__action" href={AUTH_ROUTES.login}>{copy.signIn}</Link>
+        <Link className="talentry-pre-auth__action" href={AUTH_ROUTES.register}>{copy.register}</Link>
+      </div>
+      {returning && <button className="talentry-pre-auth__text-action" type="button" onClick={onStart}>
+        {copy.replay}
+      </button>}
+    </footer>
+  </>
+}
diff --git a/styles/talentry-pre-auth.css b/styles/talentry-pre-auth.css
--- a/styles/talentry-pre-auth.css
+++ b/styles/talentry-pre-auth.css
@@ -1,102 +1,122 @@
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
-  color: var(--talentry-color-text);
-  background: var(--talentry-color-surface-lavender);
-  font-family: var(--talentry-font-family);
-  line-height: var(--talentry-line-height-normal);
-}
-.talentry-pre-auth__frame {
-  display: flex;
-  flex-direction: column;
-  gap: var(--talentry-space-5);
-  width: 100%;
-  max-width: calc(var(--talentry-space-16) * 10);
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
-.talentry-pre-auth__brand { display: flex; align-items: center; gap: var(--talentry-space-2); font-size: var(--talentry-font-size-lg); font-weight: var(--talentry-font-weight-bold); color: var(--talentry-color-navy); }
-.talentry-pre-auth__mark {
-  display: grid;
-  place-items: center;
-  width: var(--talentry-space-8);
-  height: var(--talentry-space-8);
-  border-radius: var(--talentry-radius-md);
-  background: var(--talentry-color-primary);
-  color: var(--talentry-color-text-on-primary);
-}
-.talentry-pre-auth__languages { display: flex; flex-wrap: wrap; gap: var(--talentry-space-1); padding: 0; border: 0; margin: 0; min-width: 0; }
-.talentry-pre-auth button, .talentry-pre-auth a { font: inherit; cursor: pointer; }
-.talentry-pre-auth__languages button {
-  min-width: var(--talentry-button-height-md);
-  min-height: var(--talentry-button-height-md);
-  padding: var(--talentry-space-1);
-  border: 1px solid transparent;
-  border-radius: var(--talentry-radius-md);
-  color: var(--talentry-color-text-secondary);
-  background: transparent;
-  font-size: var(--talentry-font-size-sm);
-}
-.talentry-pre-auth__languages button[aria-pressed="true"] { border-color: var(--talentry-color-primary); color: var(--talentry-color-navy); background: var(--talentry-color-surface); font-weight: var(--talentry-font-weight-bold); text-decoration: underline; text-underline-offset: var(--talentry-space-1); }
-.talentry-pre-auth__card { display: flex; flex: 1; min-width: 0; padding: var(--talentry-space-5); border: var(--talentry-card-border); border-radius: var(--talentry-card-radius); background: var(--talentry-color-surface); box-shadow: var(--talentry-shadow-card); }
-.talentry-pre-auth__flow { display: flex; flex-direction: column; width: 100%; min-width: 0; }
-.talentry-pre-auth__content { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding-block: var(--talentry-space-6); overflow-wrap: anywhere; }
-.talentry-pre-auth__emblem { display: grid; place-items: center; flex-shrink: 0; width: var(--talentry-space-16); height: var(--talentry-space-16); margin-bottom: var(--talentry-space-5); border-radius: var(--talentry-radius-xl); color: var(--talentry-color-indigo); background: var(--talentry-color-surface-purple-soft); font-size: var(--talentry-font-size-3xl); font-weight: var(--talentry-font-weight-bold); }
-.talentry-pre-auth h1 { margin: 0; max-width: 100%; color: var(--talentry-color-navy); font-size: var(--talentry-font-size-3xl); line-height: var(--talentry-line-height-tight); letter-spacing: var(--talentry-letter-spacing-tight); }
-.talentry-pre-auth__content p { margin: var(--talentry-space-4) 0 0; max-width: calc(var(--talentry-space-16) * 7); color: var(--talentry-color-text-secondary); }
-.talentry-pre-auth__content .talentry-pre-auth__eyebrow { margin: 0 0 var(--talentry-space-3); font-size: var(--talentry-font-size-sm); font-weight: var(--talentry-font-weight-semibold); color: var(--talentry-color-indigo); }
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
-  border: var(--talentry-button-secondary-border);
-  border-radius: var(--talentry-button-radius);
-  background: var(--talentry-color-surface);
-  color: var(--talentry-color-text);
-  text-decoration: none;
-  text-align: center;
-  overflow-wrap: anywhere;
-  font-weight: var(--talentry-font-weight-semibold);
-}
-.talentry-pre-auth__action--primary { background: var(--talentry-button-primary-bg); border-color: var(--talentry-button-primary-bg); color: var(--talentry-button-primary-text); }
-.talentry-pre-auth__action:hover { background: var(--talentry-color-surface-lavender); }
-.talentry-pre-auth__action--primary:hover { background: var(--talentry-button-primary-bg-hover); }
-.talentry-pre-auth__text-action { min-width: var(--talentry-button-height-md); min-height: var(--talentry-button-height-md); padding: var(--talentry-space-2); border: 0; border-radius: var(--talentry-radius-sm); background: transparent; color: var(--talentry-color-text-secondary); text-decoration: underline; text-underline-offset: var(--talentry-space-1); overflow-wrap: anywhere; }
-.talentry-pre-auth__skip-row { display: flex; justify-content: flex-end; }
-.talentry-pre-auth__dots { display: flex; justify-content: center; gap: var(--talentry-space-2); }
-.talentry-pre-auth__dots button { display: grid; place-items: center; width: var(--talentry-button-height-md); height: var(--talentry-button-height-md); padding: 0; border: 0; border-radius: var(--talentry-radius-pill); background: transparent; }
-.talentry-pre-auth__dots span { width: var(--talentry-space-2); height: var(--talentry-space-2); border-radius: var(--talentry-radius-pill); background: var(--talentry-color-text-secondary); }
-.talentry-pre-auth__dots [aria-current="step"] span { width: var(--talentry-space-6); background: var(--talentry-color-primary); }
-.talentry-pre-auth__final-actions { min-height: var(--talentry-button-height-lg); }
-.talentry-pre-auth :focus-visible { outline: 2px solid var(--talentry-color-indigo); outline-offset: var(--talentry-space-1); }
-.talentry-pre-auth__sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0; }
-@media (min-width: 768px) {
-  .talentry-pre-auth { padding: max(var(--talentry-space-8), env(safe-area-inset-top, 0px)) max(var(--talentry-space-8), env(safe-area-inset-right, 0px)) max(var(--talentry-space-8), env(safe-area-inset-bottom, 0px)) max(var(--talentry-space-8), env(safe-area-inset-left, 0px)); }
-  .talentry-pre-auth__frame { flex: initial; align-self: center; margin: auto; }
-  .talentry-pre-auth__card { min-height: calc(var(--talentry-space-16) * 9); padding: var(--talentry-space-8); }
-  .talentry-pre-auth h1 { font-size: var(--talentry-font-page-title-size); }
-}
+@import './talentry-tokens.css';
+
+body:has(.talentry-pre-auth) { margin: 0; }
+.talentry-pre-auth, .talentry-pre-auth * { box-sizing: border-box; }
+.talentry-pre-auth {
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
+@media (min-width: 768px) {
+  .talentry-pre-auth { padding: max(var(--talentry-space-8), env(safe-area-inset-top, 0px)) max(var(--talentry-space-8), env(safe-area-inset-right, 0px)) max(var(--talentry-space-8), env(safe-area-inset-bottom, 0px)) max(var(--talentry-space-8), env(safe-area-inset-left, 0px)); }
+  .talentry-pre-auth__frame { gap: var(--talentry-space-8); }
+  .talentry-pre-auth__card { padding: var(--talentry-space-8); }
+}
~~~

The new Summary is included as a complete addition below. This Engineering Report is itself the full creation record for its new file; embedding its own diff would recurse.

~~~diff
diff --git a/docs/01_Engineering/Sprint_PREAUTH_SPLASH_VISUAL_01_Summary.md b/docs/01_Engineering/Sprint_PREAUTH_SPLASH_VISUAL_01_Summary.md
new file mode 100644
--- /dev/null
+++ b/docs/01_Engineering/Sprint_PREAUTH_SPLASH_VISUAL_01_Summary.md
@@ -0,0 +1,14 @@
+# Sprint PREAUTH_SPLASH_VISUAL_01 Summary
+
+- Title: Pre-auth Splash/Welcome visual refinement
+- Parent stage: PREAUTH_ONBOARDING_01
+- Branch: feature/auth-foundation
+- HEAD: 1ca99820f49eb8dbf5c59dcb841f66d87561fbbb
+- Status: Visual refinement complete; ready for Splash runtime review.
+- Goal: Align pre-auth presentation with the existing navy/indigo Talentry auth family and remove stretched empty card space.
+- Modified files in this refinement: components/pre-auth/SplashScreen.tsx (three presentation class additions); styles/talentry-pre-auth.css.
+- Created files: this Summary and Sprint_PREAUTH_SPLASH_VISUAL_01_Engineering_Report.md.
+- Validation: npx.cmd tsc --noEmit --incremental false PASS, exit 0; git diff --check PASS, exit 0. Git LF-to-CRLF notices and npm update notice disclosed; no packages changed.
+- Behavior: Routes, Result destinations, preferences, authentication, pager logic and copy unchanged. SHA-256 comparisons confirm eight relevant source files unchanged.
+- Risks: Visual runtime review at 390x844, desktop, 641–767, German, zoom and short viewports remains pending. Build expressly not run.
+- Approval: Awaiting visual runtime review and acceptance. No staging, commit, push or Project Memory update. Earlier reports preserved.
~~~

## 13. Risks, Limitations and Technical Debt

Static validation does not confirm browser layout. Runtime review is still required; no visual acceptance claimed. Existing parent-stage limitations (preference restoration after hydration, English auth copy and unrelated auth/provider debt) remain unchanged.
This refinement contains no business logic. Reversal would be limited to these two presentation changes, with separate authorization and a new historical record.

## 14. Untouched-Module Confirmation

Routing, Result behavior, authentication, auth forms, preferences, flow/pager logic, copy, Dashboard/account/history, shared tokens, schema, dependencies and Project Memory untouched. PreAuthShell.tsx did not require editing; CSS alone integrates its existing language selector. Previous reports were not rewritten.

## 15. Approval Required

Stop for Splash runtime review and visual acceptance. No build, commit or next stage is authorized by this report.
