# Sprint PREAUTH_ONBOARDING_VISUAL_CLEANUP_01 Engineering Report

## 1. Identity
Date: 2026-09-21. Branch feature/auth-foundation. HEAD 1ca99820f49eb8dbf5c59dcb841f66d87561fbbb.
Parent stage PREAUTH_ONBOARDING_01. Implementation complete, runtime acceptance pending.

## 2. Objective and Boundaries
Replace placeholder onboarding icons with meaningful consistent inline SVGs and remove only the visible page-count label. Keep three panels, order, dots, Back/Next/Skip, swipe, final auth actions, language behavior, persistence, background motion and softened card.

## 3. Repository Before Implementation
Four pre-existing modified tracked files and twenty untracked files from approved implementation/refinements. HEAD unchanged. Preserve all prior work. Incremental diffs use this request's working-tree baseline, since source files remain untracked parent-stage additions.

## 4. Decisions
Private PanelIcon renders one of three decorative outline symbols:
1. Microphone for interview practice.
2. Clipboard/check for assessment feedback.
3. History clock for revisiting progress.
All use a 24x24 viewBox, 1.75-unit rounded stroke, no fill, 32px rendered size and existing purple token. No emoji, assets or package.
Remove the visible eyebrow paragraph that rendered copy.page(page + 1). Keep the copy function because both localized dot labels and screen-reader status still use it.
The existing 20px emblem bottom margin now directly separates icon from heading; no spacer is inserted. Container dimensions/placement, content padding and controls remain unchanged, so there is no empty label row or card enlargement.

## 5–6. Files and Responsibilities
Modified:
- components/pre-auth/OnboardingPager.tsx: private presentational PanelIcon helper; replace text symbols; remove visible count paragraph.
- styles/talentry-pre-auth.css: one panel-icon sizing/color rule.
Created:
- docs/01_Engineering/Sprint_PREAUTH_ONBOARDING_VISUAL_CLEANUP_01_Summary.md: summary.
- docs/01_Engineering/Sprint_PREAUTH_ONBOARDING_VISUAL_CLEANUP_01_Engineering_Report.md: report and complete incremental diffs.
No file deletions. Copy dictionary and previous reports untouched.

## 7. Interfaces
OnboardingPager public props unchanged. New unexported PanelIcon accepts page:number and renders SVG only. No state, handler, effect or routing contract added.

## 8. Accessibility
SVG and enclosing emblem are aria-hidden; SVG focusable=false. Headings already name the panel, so no redundant icon text.
Three dot controls retain localized page-number/total/title labels, aria-controls and aria-current=step. Polite atomic status still announces localized page plus total and title. Hidden/inactive content strategy, focus handling and target dimensions unchanged.
Decorative purple icon conveys no exclusive information. Runtime screen-reader confirmation remains pending.

## 9. Styling and Responsive Strategy
One new CSS selector sets display:block, width/height using space-8 (32px) and primary color. Existing 64px emblem remains. Card proportions naturally shed the removed label row; no artificial gap, new media query, material alteration or motion change.
Desktop/mobile visual balance still requires runtime review.

## 10. Validation
- npx.cmd tsc --noEmit --incremental false: exit 0; no TypeScript diagnostics. npm update notice 11.16.0 -> 12.0.2; no update performed.
- git diff --check: exit 0; no whitespace errors. LF-to-CRLF notices concern existing tracked route/Result edits.
- git status --short: existing authorized changes plus new reports only.
- Source review: all pager/swipe/focus handlers and accessible progress markup retained; only private SVG rendering and visible-label removal change TSX. CSS adds a single icon rule.
- Production build not run, as instructed.
- Runtime pending: three icons in all panels; no visible count in TR/EN/DE; desktop/390x844 spacing; screen-reader status/dot labels; keyboard and swipe regression.

## 11. Git Status
Four pre-existing tracked modifications: app/page.tsx, app/result/page.tsx, components/result/ResultContent.tsx and components/result/ResultShell.tsx.
Twenty-two untracked files after reports: six pre-auth source files, CSS, ADR-001 and fourteen reports.
HEAD unchanged; nothing staged. No stage/commit/push/reset/restore/stash or Project Memory update.

## 12. Complete Incremental Diffs
~~~diff
diff --git a/components/pre-auth/OnboardingPager.tsx b/components/pre-auth/OnboardingPager.tsx
--- a/components/pre-auth/OnboardingPager.tsx
+++ b/components/pre-auth/OnboardingPager.tsx
@@ -13,53 +13,71 @@
   onComplete: () => void
 }
 
-export default function OnboardingPager({ copy, onBack, onSkip, onComplete }: OnboardingPagerProps) {
-  const [page, setPage] = useState(0)
-  const heading = useRef<HTMLHeadingElement>(null)
-  const moveFocus = useRef(false)
-  const touchStart = useRef<{ x: number; y: number } | null>(null)
-
-  useEffect(() => {
-    if (moveFocus.current) heading.current?.focus({ preventScroll: true })
-    moveFocus.current = false
-  }, [page])
-
-  function navigate(next: number, focus = true) {
-    const bounded = Math.max(0, Math.min(2, next))
-    if (bounded === page) return
-    moveFocus.current = focus
-    setPage(bounded)
-  }
-
-  function startSwipe(event: TouchEvent<HTMLElement>) {
-    touchStart.current = null
-    const target = event.target
-    if (event.touches.length !== 1 || !(target instanceof Element) ||
-      target.closest('a, button, input, select, textarea, label, [contenteditable]') ||
-      window.getSelection()?.toString()) return
-    const touch = event.touches[0]
-    touchStart.current = { x: touch.clientX, y: touch.clientY }
-  }
-
-  function endSwipe(event: TouchEvent<HTMLElement>) {
-    const start = touchStart.current
-    touchStart.current = null
-    if (!start || event.touches.length || event.changedTouches.length !== 1 || window.getSelection()?.toString()) return
-    const touch = event.changedTouches[0]
-    const dx = touch.clientX - start.x
-    const dy = touch.clientY - start.y
-    if (Math.abs(dx) >= 60 && Math.abs(dx) > Math.abs(dy) * 1.5) navigate(page + (dx < 0 ? 1 : -1), false)
-  }
-
-  return <>
-    <div className="talentry-pre-auth__skip-row">
-      <button className="talentry-pre-auth__text-action" type="button" onClick={onSkip}>{copy.skip}</button>
-    </div>
-    <section className="talentry-pre-auth__content" id="pre-auth-panel" aria-labelledby="pre-auth-title"
-      onTouchStart={startSwipe} onTouchEnd={endSwipe} onTouchCancel={() => { touchStart.current = null }}
-      onTouchMove={event => { if (event.touches.length !== 1) touchStart.current = null }}>
-      <span className="talentry-pre-auth__emblem" aria-hidden="true">{['?', '✓', '↗'][page]}</span>
-      <p className="talentry-pre-auth__eyebrow">{copy.page(page + 1)}</p>
+function PanelIcon({ page }: { page: number }) {
+  return <svg className="talentry-pre-auth__panel-icon" viewBox="0 0 24 24"
+    fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"
+    strokeLinejoin="round" aria-hidden="true" focusable="false">
+    {page === 0 && <>
+      <rect x="9" y="3" width="6" height="11" rx="3" />
+      <path d="M6 10v1a6 6 0 0 0 12 0v-1M12 17v4M9 21h6" />
+    </>}
+    {page === 1 && <>
+      <path d="M8 5H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
+      <rect x="8" y="3" width="8" height="4" rx="2" />
+      <path d="m8 13 2 2 5-5M8 18h8" />
+    </>}
+    {page === 2 && <>
+      <path d="M3 10a9 9 0 1 1 1 6M3 5v5h5M12 7v5l3 2" />
+    </>}
+  </svg>
+}
+
+export default function OnboardingPager({ copy, onBack, onSkip, onComplete }: OnboardingPagerProps) {
+  const [page, setPage] = useState(0)
+  const heading = useRef<HTMLHeadingElement>(null)
+  const moveFocus = useRef(false)
+  const touchStart = useRef<{ x: number; y: number } | null>(null)
+
+  useEffect(() => {
+    if (moveFocus.current) heading.current?.focus({ preventScroll: true })
+    moveFocus.current = false
+  }, [page])
+
+  function navigate(next: number, focus = true) {
+    const bounded = Math.max(0, Math.min(2, next))
+    if (bounded === page) return
+    moveFocus.current = focus
+    setPage(bounded)
+  }
+
+  function startSwipe(event: TouchEvent<HTMLElement>) {
+    touchStart.current = null
+    const target = event.target
+    if (event.touches.length !== 1 || !(target instanceof Element) ||
+      target.closest('a, button, input, select, textarea, label, [contenteditable]') ||
+      window.getSelection()?.toString()) return
+    const touch = event.touches[0]
+    touchStart.current = { x: touch.clientX, y: touch.clientY }
+  }
+
+  function endSwipe(event: TouchEvent<HTMLElement>) {
+    const start = touchStart.current
+    touchStart.current = null
+    if (!start || event.touches.length || event.changedTouches.length !== 1 || window.getSelection()?.toString()) return
+    const touch = event.changedTouches[0]
+    const dx = touch.clientX - start.x
+    const dy = touch.clientY - start.y
+    if (Math.abs(dx) >= 60 && Math.abs(dx) > Math.abs(dy) * 1.5) navigate(page + (dx < 0 ? 1 : -1), false)
+  }
+
+  return <>
+    <div className="talentry-pre-auth__skip-row">
+      <button className="talentry-pre-auth__text-action" type="button" onClick={onSkip}>{copy.skip}</button>
+    </div>
+    <section className="talentry-pre-auth__content" id="pre-auth-panel" aria-labelledby="pre-auth-title"
+      onTouchStart={startSwipe} onTouchEnd={endSwipe} onTouchCancel={() => { touchStart.current = null }}
+      onTouchMove={event => { if (event.touches.length !== 1) touchStart.current = null }}>
+      <span className="talentry-pre-auth__emblem" aria-hidden="true"><PanelIcon page={page} /></span>
       <h1 id="pre-auth-title" tabIndex={-1} ref={heading}>{copy.panels[page].title}</h1>
       <p>{copy.panels[page].description}</p>
     </section>
diff --git a/styles/talentry-pre-auth.css b/styles/talentry-pre-auth.css
--- a/styles/talentry-pre-auth.css
+++ b/styles/talentry-pre-auth.css
@@ -85,6 +85,7 @@
 .talentry-pre-auth__flow { display: flex; flex-direction: column; width: 100%; min-width: 0; }
 .talentry-pre-auth__content { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding-block: var(--talentry-space-5); overflow-wrap: anywhere; }
 .talentry-pre-auth__emblem { display: grid; place-items: center; flex-shrink: 0; width: var(--talentry-space-16); height: var(--talentry-space-16); margin-bottom: var(--talentry-space-5); border: 1px solid color-mix(in srgb, var(--talentry-color-primary) 40%, transparent); border-radius: var(--talentry-radius-xl); color: var(--talentry-color-interview-text); background: var(--talentry-color-navy-soft); font-size: var(--talentry-font-size-3xl); font-weight: var(--talentry-font-weight-bold); }
+.talentry-pre-auth__panel-icon { display: block; width: var(--talentry-space-8); height: var(--talentry-space-8); color: var(--talentry-color-primary); }
 .talentry-pre-auth__emblem--brand { background: linear-gradient(135deg, var(--talentry-color-primary), var(--talentry-color-indigo)); box-shadow: var(--talentry-shadow-primary); }
 .talentry-pre-auth h1 { margin: 0; max-width: 100%; color: var(--talentry-color-interview-text); font-size: var(--talentry-font-size-3xl); line-height: var(--talentry-line-height-tight); letter-spacing: var(--talentry-letter-spacing-tight); text-wrap: balance; }
 .talentry-pre-auth__content p { margin: var(--talentry-space-3) 0 0; max-width: calc(var(--talentry-space-16) * 6); color: var(--talentry-color-interview-muted); font-size: var(--talentry-font-size-sm); line-height: var(--talentry-line-height-relaxed); }
~~~

New Summary:
~~~diff
diff --git a/docs/01_Engineering/Sprint_PREAUTH_ONBOARDING_VISUAL_CLEANUP_01_Summary.md b/docs/01_Engineering/Sprint_PREAUTH_ONBOARDING_VISUAL_CLEANUP_01_Summary.md
new file mode 100644
--- /dev/null
+++ b/docs/01_Engineering/Sprint_PREAUTH_ONBOARDING_VISUAL_CLEANUP_01_Summary.md
@@ -0,0 +1,17 @@
+# Sprint PREAUTH_ONBOARDING_VISUAL_CLEANUP_01 Summary
+
+- Title: Onboarding icons and visible progress cleanup
+- Parent stage: PREAUTH_ONBOARDING_01
+- Branch: feature/auth-foundation
+- HEAD: 1ca99820f49eb8dbf5c59dcb841f66d87561fbbb
+- Status: ONBOARDING VISUAL CLEANUP COMPLETE — READY FOR RUNTIME REVIEW
+- Goal: Replace placeholder symbols and remove redundant visible page count.
+- Modified: components/pre-auth/OnboardingPager.tsx; styles/talentry-pre-auth.css.
+- Created: this Summary and Sprint_PREAUTH_ONBOARDING_VISUAL_CLEANUP_01_Engineering_Report.md.
+- Icons: microphone, assessment clipboard, history clock; matching 32px purple outline SVGs with rounded strokes, inside unchanged 64px containers.
+- Progress: Visible count removed in every language; localized dot labels, aria-current and polite page/title announcement preserved.
+- Behavior: No navigation, swipe, state, persistence, copy-dictionary, card-material or background-motion changes.
+- Validation: TypeScript PASS (0); diff check PASS (0). npm update and Git LF-to-CRLF notices only.
+- Build: Not run.
+- Risks: Visual and screen-reader runtime verification pending.
+- Approval: Awaiting runtime review and acceptance. No staging, commit, push or Project Memory update; previous reports preserved.
~~~

This Engineering Report is its own complete new-file creation record; recursively embedding its own diff is omitted.

## 13. Risks and Limitations
Runtime visual/accessibility review remains pending. Static validation does not certify browser presentation. No new dependency or business logic; existing unrelated debt unchanged.

## 14. Untouched Modules
Routing, auth, state/persistence, copy dictionary, Result, existing auth forms, background SVG/motion, card material, Splash, Dashboard/account/history, shared tokens, schema, dependencies and Project Memory untouched. Previous reports preserved.

## 15. Approval Required
Stop for runtime review and acceptance. No build or next stage performed.
