# Sprint PREAUTH_LANGUAGE_HYDRATION_01 Engineering Report

## 1. Identity
Date: 2026-09-22. Branch feature/auth-foundation. Parent stage PREAUTH_ONBOARDING_01.
Status: implemented; runtime acceptance pending.

## 2. Objective and Scope
Prevent wrong-language pre-auth copy flashing before the saved application language is read. Preserve supported languages, interview language, routes/auth, completion persistence, copy, design and layout. No framework, cookie migration or timers.

## 3. Repository Before Implementation
Existing parent-stage and refinement changes present: four tracked modifications and thirty untracked files. Preserved all work, including shared mobile card centering. No Git mutation.

## 4. Diagnosis and Decisions
usePreAuthPreferences initializes language with DEFAULT_APP_LANGUAGE (tr); PreAuthFlow immediately selects PRE_AUTH_COPY[language] and renders Splash. Only afterward does useEffect read interviewai_uilang and select persisted EN/DE. That sequence permits visible Turkish during server HTML/initial hydration.
New ready=false initial state is identical on server and first client render. The existing shell keeps its neutral Talentry mark/wordmark and background mounted. PreAuthFlow does not mount localized Splash/pager content until ready=true.
The hook sets ready after both separately guarded preference reads. Language is validated against existing tr/en/de values. Storage failure leaves default TR and still resolves readiness. Completion read/write semantics remain unchanged.
Shell hides/disables the unresolved language fieldset while retaining its layout footprint; its localized legend is absent until ready. The empty card container is temporarily invisible. Main advertises aria-busy during resolution and does not claim a selected language until resolved.
Once ready, the existing localized UI renders normally with no ongoing gate/delay. The shell/background and gradient identities stay mounted. No mount writes, timer, spinner, cookie or server-language guess.

## 5–6. Files and Responsibilities
Modified:
- components/pre-auth/usePreAuthPreferences.ts: readiness state and completion after guarded reads.
- components/pre-auth/PreAuthFlow.tsx: passes readiness and gates localized children.
- components/pre-auth/PreAuthShell.tsx: neutral unresolved shell and noninteractive hidden language control.
Created: docs/01_Engineering/Sprint_PREAUTH_LANGUAGE_HYDRATION_01_Summary.md; docs/01_Engineering/Sprint_PREAUTH_LANGUAGE_HYDRATION_01_Engineering_Report.md.
No CSS, copy, route, interview or auth file changed. No deletion. Earlier reports preserved.

## 7. Interfaces
Hook adds ready:boolean to its existing return object.
PreAuthShell adds required ready:boolean prop; its single caller supplies it.
All existing callbacks, language types, storage keys and completion methods remain unchanged.

## 8. Accessibility
Unresolved main is aria-busy; hidden fieldset is disabled and aria-hidden, preventing invisible focusable controls. No localized legend/content is emitted during unresolved state. Language names are native names in an invisible fieldset, not interactive until ready.
No forced focus/spinner or artificial delay. Resolved semantics, focus/navigation and language labels remain intact.

## 9. Visual/Layout
Existing background and branding remain visible. Hidden language fieldset reserves header geometry, preventing header movement. Localized card appears only with resolved copy; exact unknown-language card height is not guessed server-side. Existing CSS, card dimensions/material, mobile centering, SVG motion and reduced-motion behavior untouched. Neutral state may last until JavaScript hydrates.

## 10. Validation
- npx.cmd tsc --noEmit --incremental false: exit 0, no TypeScript diagnostics. npm update notice 11.16.0 -> 12.0.2; no update performed.
- git diff --check: exit 0, no whitespace errors. Git LF-to-CRLF notices concern pre-existing tracked route/Result edits.
- git status --short: existing work plus refinement reports.
- Source review: ready starts false consistently; guarded storage failures still reach setReady(true); mount only reads; explicit changeLanguage still sets state then safely writes; completion persistence unchanged.
- Production build not run.
- Runtime pending: cold loads with EN/DE/TR, delayed hydration, invalid/missing/blocked storage, failed writes, immediate language switching, first/repeat/replay/Skip, hydration console warnings and neutral-to-content appearance. No browser acceptance claimed.

## 11. Git Status
Four pre-existing tracked modifications: app/page.tsx, app/result/page.tsx, components/result/ResultContent.tsx, components/result/ResultShell.tsx. Thirty-two untracked files after new reports (six pre-auth source files, stylesheet, ADR-001 and twenty-four reports).
Nothing staged. No commit/push/reset/restore/stash/branch or Project Memory change.

## 12. Complete Incremental Diffs
Source diffs compare this request's working-tree baseline, since source files remain untracked parent-stage additions.
~~~diff
diff --git a/components/pre-auth/PreAuthFlow.tsx b/components/pre-auth/PreAuthFlow.tsx
--- a/components/pre-auth/PreAuthFlow.tsx
+++ b/components/pre-auth/PreAuthFlow.tsx
@@ -31,9 +31,9 @@
   }
 
-  return <PreAuthShell language={preferences.language} copy={copy} onLanguageChange={preferences.changeLanguage}>
-    <div className="talentry-pre-auth__flow" ref={content}>
-      {onboarding ? <OnboardingPager copy={copy} onBack={() => showOnboarding(false)}
-        onSkip={skip} onComplete={preferences.complete} /> :
-        <SplashScreen copy={copy} returning={preferences.completed} onStart={() => showOnboarding(true)} />}
+  return <PreAuthShell ready={preferences.ready} language={preferences.language} copy={copy} onLanguageChange={preferences.changeLanguage}>
+    <div className="talentry-pre-auth__flow" ref={content}>
+      {preferences.ready && (onboarding ? <OnboardingPager copy={copy} onBack={() => showOnboarding(false)}
+        onSkip={skip} onComplete={preferences.complete} /> :
+        <SplashScreen copy={copy} returning={preferences.completed} onStart={() => showOnboarding(true)} />)}
     </div>
   </PreAuthShell>
diff --git a/components/pre-auth/PreAuthShell.tsx b/components/pre-auth/PreAuthShell.tsx
--- a/components/pre-auth/PreAuthShell.tsx
+++ b/components/pre-auth/PreAuthShell.tsx
@@ -6,55 +6,57 @@
 
 interface PreAuthShellProps {
-  children: ReactNode
-  language: AppLanguage
-  copy: PreAuthCopy
-  onLanguageChange: (language: AppLanguage) => void
-}
-
-export default function PreAuthShell({ children, language, copy, onLanguageChange }: PreAuthShellProps) {
-  const gradientId = useId()
-  return <main className="talentry-pre-auth" lang={language}>
-    <div className="talentry-pre-auth__swells" aria-hidden="true">
-      <svg viewBox="0 0 1200 900" preserveAspectRatio="none" aria-hidden="true" focusable="false">
-        <defs>
-          {(['far', 'middle', 'near'] as const).map(depth => (
-            <linearGradient key={depth} id={`${gradientId}-${depth}`} x1="0" y1="0" x2="0" y2="1"
-              className={`talentry-pre-auth__swell-gradient talentry-pre-auth__swell-gradient--${depth}`}>
-              <stop offset="0%" stopOpacity="0" />
-              <stop offset="28%" stopOpacity="0.6" />
-              <stop offset="50%" stopOpacity="1" />
-              <stop offset="72%" stopOpacity="0.6" />
-              <stop offset="100%" stopOpacity="0" />
-            </linearGradient>
-          ))}
-        </defs>
-        {/* Four joined periods give both edges blur runway throughout each 1200-unit loop. */}
-        <g className="talentry-pre-auth__swell talentry-pre-auth__swell--far">
-          <path fill={`url(#${gradientId}-far)`} d="M-1200 40 C-1020 -110 -810 -110 -600 40 C-400 145 -180 190 0 40 C180 -110 390 -110 600 40 C800 145 1020 190 1200 40 C1380 -110 1590 -110 1800 40 C2000 145 2220 190 2400 40 C2580 -110 2790 -110 3000 40 C3200 145 3420 190 3600 40 L3600 360 C3420 510 3200 465 3000 360 C2790 210 2580 210 2400 360 C2220 510 2000 465 1800 360 C1590 210 1380 210 1200 360 C1020 510 800 465 600 360 C390 210 180 210 0 360 C-180 510 -400 465 -600 360 C-810 210 -1020 210 -1200 360 Z" />
-        </g>
-        <g className="talentry-pre-auth__swell talentry-pre-auth__swell--middle">
-          <path fill={`url(#${gradientId}-middle)`} d="M-1200 230 C-1020 110 -810 110 -600 230 C-400 314 -180 350 0 230 C180 110 390 110 600 230 C800 314 1020 350 1200 230 C1380 110 1590 110 1800 230 C2000 314 2220 350 2400 230 C2580 110 2790 110 3000 230 C3200 314 3420 350 3600 230 L3600 590 C3420 710 3200 674 3000 590 C2790 470 2580 470 2400 590 C2220 710 2000 674 1800 590 C1590 470 1380 470 1200 590 C1020 710 800 674 600 590 C390 470 180 470 0 590 C-180 710 -400 674 -600 590 C-810 470 -1020 470 -1200 590 Z" />
-        </g>
-        <g className="talentry-pre-auth__swell talentry-pre-auth__swell--near">
-          <path fill={`url(#${gradientId}-near)`} d="M-1200 440 C-1020 340 -810 340 -600 440 C-400 510 -180 540 0 440 C180 340 390 340 600 440 C800 510 1020 540 1200 440 C1380 340 1590 340 1800 440 C2000 510 2220 540 2400 440 C2580 340 2790 340 3000 440 C3200 510 3420 540 3600 440 L3600 780 C3420 880 3200 850 3000 780 C2790 680 2580 680 2400 780 C2220 880 2000 850 1800 780 C1590 680 1380 680 1200 780 C1020 880 800 850 600 780 C390 680 180 680 0 780 C-180 880 -400 850 -600 780 C-810 680 -1020 680 -1200 780 Z" />
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
+  ready: boolean
+  children: ReactNode
+  language: AppLanguage
+  copy: PreAuthCopy
+  onLanguageChange: (language: AppLanguage) => void
+}
+
+export default function PreAuthShell({ children, ready, language, copy, onLanguageChange }: PreAuthShellProps) {
+  const gradientId = useId()
+  return <main className="talentry-pre-auth" lang={ready ? language : undefined} aria-busy={!ready}>
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
+        <fieldset className="talentry-pre-auth__languages" disabled={!ready}
+          aria-hidden={!ready || undefined} style={{ visibility: ready ? 'visible' : 'hidden' }}>
+          <legend className="talentry-pre-auth__sr-only">{ready ? copy.language : null}</legend>
+          {SUPPORTED_APP_LANGUAGES.map(value => <button key={value} type="button"
+            lang={value} aria-label={{ tr: 'Türkçe', en: 'English', de: 'Deutsch' }[value]}
+            aria-pressed={language === value} onClick={() => onLanguageChange(value)}>
+            {value.toUpperCase()}
+          </button>)}
+        </fieldset>
+      </header>
+      <div className="talentry-pre-auth__card" style={{ visibility: ready ? 'visible' : 'hidden' }}>{children}</div>
     </div>
   </main>
diff --git a/components/pre-auth/usePreAuthPreferences.ts b/components/pre-auth/usePreAuthPreferences.ts
--- a/components/pre-auth/usePreAuthPreferences.ts
+++ b/components/pre-auth/usePreAuthPreferences.ts
@@ -11,26 +11,28 @@
   const [language, setLanguage] = useState<AppLanguage>(DEFAULT_APP_LANGUAGE)
   const [completed, setCompleted] = useState(false)
-
-  useEffect(() => {
-    try {
-      const stored = window.localStorage.getItem(LANGUAGE_KEY)
-      setLanguage(SUPPORTED_APP_LANGUAGES.find(value => value === stored) ?? DEFAULT_APP_LANGUAGE)
-    } catch { /* The default remains usable without storage. */ }
-    try {
-      setCompleted(window.localStorage.getItem(COMPLETION_KEY) === 'complete')
-    } catch { /* Completion is a UX preference, never an auth check. */ }
-  }, [])
-
-  function changeLanguage(next: AppLanguage) {
-    if (!SUPPORTED_APP_LANGUAGES.some(value => value === next)) return
-    setLanguage(next)
-    try { window.localStorage.setItem(LANGUAGE_KEY, next) } catch { /* Keep in-memory selection. */ }
-  }
-
-  function complete() {
-    setCompleted(true)
-    try { window.localStorage.setItem(COMPLETION_KEY, 'complete') } catch { /* Navigation must continue. */ }
-  }
-
-  return { language, completed, changeLanguage, complete }
+  const [ready, setReady] = useState(false)
+
+  useEffect(() => {
+    try {
+      const stored = window.localStorage.getItem(LANGUAGE_KEY)
+      setLanguage(SUPPORTED_APP_LANGUAGES.find(value => value === stored) ?? DEFAULT_APP_LANGUAGE)
+    } catch { /* The default remains usable without storage. */ }
+    try {
+      setCompleted(window.localStorage.getItem(COMPLETION_KEY) === 'complete')
+    } catch { /* Completion is a UX preference, never an auth check. */ }
+    setReady(true)
+  }, [])
+
+  function changeLanguage(next: AppLanguage) {
+    if (!SUPPORTED_APP_LANGUAGES.some(value => value === next)) return
+    setLanguage(next)
+    try { window.localStorage.setItem(LANGUAGE_KEY, next) } catch { /* Keep in-memory selection. */ }
+  }
+
+  function complete() {
+    setCompleted(true)
+    try { window.localStorage.setItem(COMPLETION_KEY, 'complete') } catch { /* Navigation must continue. */ }
+  }
+
+  return { language, completed, ready, changeLanguage, complete }
 }
~~~

New Summary:
~~~diff
diff --git a/docs/01_Engineering/Sprint_PREAUTH_LANGUAGE_HYDRATION_01_Summary.md b/docs/01_Engineering/Sprint_PREAUTH_LANGUAGE_HYDRATION_01_Summary.md
new file mode 100644
--- /dev/null
+++ b/docs/01_Engineering/Sprint_PREAUTH_LANGUAGE_HYDRATION_01_Summary.md
@@ -0,0 +1,15 @@
+# Sprint PREAUTH_LANGUAGE_HYDRATION_01 Summary
+
+- Title: Pre-auth persisted-language hydration flash fix
+- Parent stage: PREAUTH_ONBOARDING_01
+- Branch: feature/auth-foundation
+- Status: LANGUAGE HYDRATION FLASH FIX COMPLETE — READY FOR RUNTIME REVIEW
+- Goal: Prevent visible fallback Turkish before saved EN/DE resolves.
+- Modified: components/pre-auth/usePreAuthPreferences.ts; components/pre-auth/PreAuthFlow.tsx; components/pre-auth/PreAuthShell.tsx.
+- Created: this Summary and Sprint_PREAUTH_LANGUAGE_HYDRATION_01_Engineering_Report.md.
+- Root cause: TR initial state rendered before the mount effect read interviewai_uilang.
+- Fix: identical unresolved server/initial-client state, neutral branding/background, localized children gated until guarded preference reads finish.
+- Storage: TR fallback on missing/invalid/unavailable storage; no mount write; explicit language switching/persistence unchanged.
+- Validation: TypeScript PASS (0); git diff --check PASS (0). npm update and Git LF-to-CRLF notices only.
+- Risks: Cold-load hydration and storage-denial runtime checks pending; JavaScript must initialize before localized actions appear.
+- Approval: Pending runtime review. No build, Git mutation or Project Memory update.
~~~

This report is its own full new-file creation record; recursive self-diff omitted.

## 13. Risks and Limitations
Runtime acceptance pending. Before JavaScript hydration, only neutral shell/brand is shown; if JavaScript cannot initialize, localized pre-auth controls remain unavailable. This avoids guessing a browser-only preference and adds no artificial delay. Existing unrelated auth/localization debt unchanged.

## 14. Untouched Modules
Interview language, root routing/auth, existing auth screens, copy, completion storage semantics, pager/swipe/Skip/replay callbacks, approved stylesheet, background and card layout, Result, Dashboard/account/history, dependencies/schema and Project Memory untouched.

## 15. Approval Required
Stop for runtime review and acceptance. No production build or next stage.
