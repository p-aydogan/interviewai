# Sprint PREAUTH_ONBOARDING_01 Engineering Report

## 1. Report Identity

Date: 2026-09-21. Branch: feature/auth-foundation. Baseline HEAD: 1ca99820f49eb8dbf5c59dcb841f66d87561fbbb.
Status: IMPLEMENTATION COMPLETE — READY FOR RUNTIME REVIEW. Implementation acceptance pending.
The user's implementation-stage attachment approved this exact scope and expressly deferred production build and runtime review.

## 2. Objective and Boundaries

Make / the single pre-auth entry with a welcome screen, exactly three introduction panels, final auth actions, local completion preference and TR/EN/DE copy. Preserve authenticated Dashboard entry, all direct auth/recovery routes, and Result restart behavior.
Excluded: auth translation/redesign, middleware, dependencies, DB/schema, Dashboard/account/history changes, interview logic, API security work, native packaging, generated assets, root html language cleanup and Project Memory.

## 3. Repository State Before Implementation

Working tree clean. HEAD and local origin/feature/auth-foundation reference both at 1ca9982. No fetch or live remote verification. No branch or Git mutation performed.

## 4. Architecture and Decisions

Root is an async Server Component using existing getAuthenticatedUser(). It redirects authenticated visitors to /dashboard before rendering any pre-auth client. Unauthorized visitors receive PreAuthFlow without user/session/token props.
Welcome and onboarding share /. No /welcome, /onboarding, or /splash route was created.
Three Result destination substitutions preserve /interview/setup navigation.
PreAuthFlow owns view transitions; usePreAuthPreferences owns guarded persistence; shell and splash render typed props; pager owns bounded page navigation and gestures; copy is a typed TR/EN/DE dictionary.
First visit: welcome -> Get started -> panels 1–3 -> native auth links.
Repeat after completion/skip: compact welcome with auth links and replay. Replay does not delete the completion preference.
No timer, auto-advance, network request or auth dependency exists in the pre-auth client.
Completion is written only by Skip or final-panel auth activation. Visiting panel 3 or using splash auth links does not mark completion.
Storage reads occur in an effect after matching server/client initial state. Each storage operation has its own catch; navigation remains native and usable when storage is unavailable.
Application language changes immediately and persists only after explicit selection. Existing auth screens remain English; Dashboard can later read the same saved key. Interview language is untouched.

## 5–6. Files and Responsibilities

Modified:
- app/page.tsx: server auth gate and pre-auth render.
- app/result/page.tsx: legacy redirect destination only.
- components/result/ResultContent.tsx: restart link destination only.
- components/result/ResultShell.tsx: error/unavailable restart link destination only.

Created:
- components/pre-auth/PreAuthFlow.tsx: client view coordinator and transition focus.
- components/pre-auth/usePreAuthPreferences.ts: language/completion state and guarded localStorage.
- components/pre-auth/PreAuthShell.tsx: branding, semantic main, language selector and shell.
- components/pre-auth/SplashScreen.tsx: first/repeat welcome content and native auth links.
- components/pre-auth/OnboardingPager.tsx: bounded pager, dots, swipe, focus, Skip and final links.
- components/pre-auth/pre-auth-copy.ts: typed copy contract and localized content.
- styles/talentry-pre-auth.css: scoped token-based layout and controls.
- docs/02_Decisions/ADR-001-pre-auth-entry-flow.md: approved route/persistence architecture and rollback boundary.
- docs/01_Engineering/Sprint_PREAUTH_ONBOARDING_01_Summary.md: concise acceptance record.
- docs/01_Engineering/Sprint_PREAUTH_ONBOARDING_01_Engineering_Report.md: this technical record.

Deleted: none. React component files range from 31 to 92 lines.

## 7. Public Interfaces, Props and Types

PreAuthFlow(): no props.
usePreAuthPreferences(): language: AppLanguage, completed: boolean, changeLanguage(AppLanguage): void, complete(): void.
PreAuthShell: children: ReactNode, language: AppLanguage, copy: PreAuthCopy, onLanguageChange(AppLanguage): void.
SplashScreen: copy: PreAuthCopy, returning: boolean, onStart(): void.
OnboardingPager: copy: PreAuthCopy, onBack(): void, onSkip(): void, onComplete(): void.
Exported PreAuthCopy defines all text, page(number): string, and an exact readonly three-panel tuple. PRE_AUTH_COPY is Record<AppLanguage, PreAuthCopy>.
No new external API, server action, schema or authentication contract.

## 8. Accessibility

Native buttons and links; main lang follows selection; one active h1; fieldset/legend language choices with aria-pressed plus underline; dots have localized page/title labels, aria-controls and aria-current="step".
The page status is polite and atomic. Only active panel content renders. Button/dot navigation focuses its heading; flow transitions focus the destination heading. Swipe preserves the existing heading node.
Swipe requires one touch, at least 60px horizontal travel and horizontal displacement greater than 1.5 times vertical displacement. Interactive origins, selection, cancellation and multi-touch are ignored. No preventDefault or restrictive touch-action blocks zoom/scroll.
All targets have at least 44px minimum dimensions. Final actions and navigation use native keyboard behavior. No animation or motion-dependent state.
Calculated token contrast ratios: white/primary 4.89:1; secondary text/white 7.58:1; indigo/soft-purple 5.34:1; navy/white 15.57:1; secondary text/lavender 7.02:1. These are static color calculations, not browser accessibility certification.

## 9. Styling and Responsive Strategy

No token changes. CSS imports the existing token file and uses its palette, fonts, spacing, radii and shadows. Styled T and wordmark only; no raster assets or external logo.
Scoped body margin reset applies only while pre-auth is present. Compact flex layout through 767px; desktop composition at >=768px with 640px maximum width. Mobile shell uses 100vh then 100dvh and safe-area padding.
Header/content/dots/navigation/auth-action structure keeps controls in document flow. Final action space is reserved across panels. Content expands for German, zoom and short screens with normal document scrolling; no nested scroller or fixed CTA overlay. Actual 390x844 and breakpoint rendering awaits runtime review.

## 10. Validation Commands and Exact Results

- npx.cmd tsc --noEmit --incremental false: exit 0, no TypeScript diagnostics. npm printed a new-version notice (11.16.0 -> 12.0.2); no update performed.
- git diff --check: exit 0, no whitespace errors. Git emitted LF-to-CRLF working-copy notices for the four modified tracked files.
- git status --short and --untracked-files=all: only the approved four modified files and ten new sprint files.
- git --no-pager diff --stat: four tracked files, 9 insertions, 5 deletions. Untracked additions are not represented in this stat.
- Source review: root imports existing server auth helper and passes no raw auth data; new client files have no server/admin imports; Result destinations explicitly use /interview/setup; no remaining root restart destination in inspected Result files.
- No tsconfig.tsbuildinfo exists; no .next artifact appears in Git status.
- No production build or runtime browser session: expressly deferred by user.
- A combined read-only inspection returned exit 1 because an optional Get-Item checked the absent tsconfig.tsbuildinfo; explicit Test-Path confirmed False. One shell-quoted rg expression failed with an invalid-path diagnostic and was replaced with literal source inspection. Neither was a Git or permission failure.

Runtime acceptance still required:
1. Authenticated fresh root entry redirects before onboarding; unauthenticated first/repeat entry; expired session/provider failure; browser Back.
2. Full sequence, Back/Next/dots, no loop, Skip, replay, final auth links, and no completion on merely viewing the final panel.
3. Storage blocked/invalid/cleared and write failure; persistence after reload; direct auth links still work; hydration console check.
4. TR/EN/DE immediate selection, persistence through login into Dashboard, interview-language independence.
5. Direct login/register/verify/forgot/reset/success regression, including expected verification/recovery requirements.
6. Both Result restart links and /result still reach setup.
7. Keyboard focus, screen-reader labels/status, touch gesture exclusions, reduced motion, actual contrast/target sizing.
8. Desktop/tablet, 390x844, 641px/767px/768px, short landscape, German wrapping, zoom and browser viewport changes.
Production build belongs after runtime review when authorized.

## 11. Git Status

Four modified tracked files and ten untracked additions, including this report and Summary. Nothing staged. HEAD unchanged. No commit, push, reset, restore, stash or branch action.
Exact status snapshot follows the diff appendix.

## 12. Complete Sprint-File Diffs

The appendix includes the complete tracked implementation diff and complete /dev/null additions for all new source, CSS, ADR and Summary files.
This Engineering Report is itself a new file whose full contents are the report; embedding its own complete diff would recurse without end. Its contents and untracked status serve as its creation record.

## 13. Risks, Limitations and Technical Debt

No static blocker found. Runtime acceptance is pending, not inferred from TypeScript.
Initial default-language welcome may briefly precede stored preferences after mount; markup stays hydration-compatible.
Storage is per browser/device and best effort; unavailable storage can repeat the introduction and lose cross-route language persistence.
Existing English auth forms/decorative selector, fixed document html lang, server-component cookie refresh limitations and provider endpoint security/logging debt remain unchanged.
No real avatar, job matching, predictive hiring, trends or guaranteed improvement claimed.
Rollback requires separate authorization and is bounded to this sprint; preserve immutable reports and record a later reversal separately.

## 14. Untouched Modules

Dashboard, account, history, interview implementation, existing auth screens/utilities, APIs, schema, package files, shared tokens, root layout and Project Memory untouched. Result edits change destinations only. No dependencies installed.

## 15. Approval Required

Implementation was authorized. Runtime review and implementation acceptance remain pending. Stop here; no automatic next stage or commit.

~~~diff
diff --git a/app/page.tsx b/app/page.tsx
index 5a4e73f..e3f3b09 100644
--- a/app/page.tsx
+++ b/app/page.tsx
@@ -1,5 +1,9 @@
 import { redirect } from 'next/navigation'
+import PreAuthFlow from '@/components/pre-auth/PreAuthFlow'
+import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
 
-export default function HomePage() {
-  redirect('/interview/setup')
+export default async function HomePage() {
+  const auth = await getAuthenticatedUser()
+  if (auth.status === 'authenticated') redirect('/dashboard')
+  return <PreAuthFlow />
 }
diff --git a/app/result/page.tsx b/app/result/page.tsx
index d5c18eb..6a8183e 100644
--- a/app/result/page.tsx
+++ b/app/result/page.tsx
@@ -1,5 +1,5 @@
 import { redirect } from 'next/navigation'
 
 export default function ResultPage() {
-  redirect('/')
+  redirect('/interview/setup')
 }
diff --git a/components/result/ResultContent.tsx b/components/result/ResultContent.tsx
index 692f233..b870706 100644
--- a/components/result/ResultContent.tsx
+++ b/components/result/ResultContent.tsx
@@ -136,7 +136,7 @@ export default function ResultContent({ interview, copy, uiLanguage }: ResultCon
         <div {...panelProps(2)}>
       <ResultAnswers answers={interview.answers} copy={copy} />
       <div className={styles.actions}>
-        <Link className={`talentry-button talentry-button--primary talentry-button--large ${styles.action}`} href="/">
+        <Link className={`talentry-button talentry-button--primary talentry-button--large ${styles.action}`} href="/interview/setup">
           {copy.startAgain}
         </Link>
       </div>
diff --git a/components/result/ResultShell.tsx b/components/result/ResultShell.tsx
index 0334307..a1ca697 100644
--- a/components/result/ResultShell.tsx
+++ b/components/result/ResultShell.tsx
@@ -49,7 +49,7 @@ export function ResultStatus({ status, copy, onRetry }: ResultStatusProps) {
       action={(
         <div className={styles.actions}>
           {status === 'loadError' && <TalentryButton className={styles.action} onClick={onRetry}>{copy.retry}</TalentryButton>}
-          <Link className={`talentry-button talentry-button--secondary talentry-button--medium ${styles.action}`} href="/">
+          <Link className={`talentry-button talentry-button--secondary talentry-button--medium ${styles.action}`} href="/interview/setup">
             {copy.startAgain}
           </Link>
         </div>
diff --git a/components/pre-auth/PreAuthFlow.tsx b/components/pre-auth/PreAuthFlow.tsx
new file mode 100644
--- /dev/null
+++ b/components/pre-auth/PreAuthFlow.tsx
@@ -0,0 +1,40 @@
+'use client'
+
+import { useEffect, useRef, useState } from 'react'
+import PreAuthShell from './PreAuthShell'
+import SplashScreen from './SplashScreen'
+import OnboardingPager from './OnboardingPager'
+import { PRE_AUTH_COPY } from './pre-auth-copy'
+import { usePreAuthPreferences } from './usePreAuthPreferences'
+import '@/styles/talentry-pre-auth.css'
+
+export default function PreAuthFlow() {
+  const preferences = usePreAuthPreferences()
+  const [onboarding, setOnboarding] = useState(false)
+  const focusHeading = useRef(false)
+  const content = useRef<HTMLDivElement>(null)
+  const copy = PRE_AUTH_COPY[preferences.language]
+
+  useEffect(() => {
+    if (focusHeading.current) content.current?.querySelector('h1')?.focus()
+    focusHeading.current = false
+  }, [onboarding])
+
+  function showOnboarding(next: boolean) {
+    focusHeading.current = true
+    setOnboarding(next)
+  }
+
+  function skip() {
+    preferences.complete()
+    showOnboarding(false)
+  }
+
+  return <PreAuthShell language={preferences.language} copy={copy} onLanguageChange={preferences.changeLanguage}>
+    <div className="talentry-pre-auth__flow" ref={content}>
+      {onboarding ? <OnboardingPager copy={copy} onBack={() => showOnboarding(false)}
+        onSkip={skip} onComplete={preferences.complete} /> :
+        <SplashScreen copy={copy} returning={preferences.completed} onStart={() => showOnboarding(true)} />}
+    </div>
+  </PreAuthShell>
+}
diff --git a/components/pre-auth/usePreAuthPreferences.ts b/components/pre-auth/usePreAuthPreferences.ts
new file mode 100644
--- /dev/null
+++ b/components/pre-auth/usePreAuthPreferences.ts
@@ -0,0 +1,36 @@
+'use client'
+
+import { useEffect, useState } from 'react'
+import { DEFAULT_APP_LANGUAGE, SUPPORTED_APP_LANGUAGES } from '@/lib/auth/auth-constants'
+import type { AppLanguage } from '@/types/auth'
+
+const LANGUAGE_KEY = 'interviewai_uilang'
+const COMPLETION_KEY = 'talentry.onboarding.v1'
+
+export function usePreAuthPreferences() {
+  const [language, setLanguage] = useState<AppLanguage>(DEFAULT_APP_LANGUAGE)
+  const [completed, setCompleted] = useState(false)
+
+  useEffect(() => {
+    try {
+      const stored = window.localStorage.getItem(LANGUAGE_KEY)
+      setLanguage(SUPPORTED_APP_LANGUAGES.find(value => value === stored) ?? DEFAULT_APP_LANGUAGE)
+    } catch { /* The default remains usable without storage. */ }
+    try {
+      setCompleted(window.localStorage.getItem(COMPLETION_KEY) === 'complete')
+    } catch { /* Completion is a UX preference, never an auth check. */ }
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
+  return { language, completed, changeLanguage, complete }
+}
diff --git a/components/pre-auth/PreAuthShell.tsx b/components/pre-auth/PreAuthShell.tsx
new file mode 100644
--- /dev/null
+++ b/components/pre-auth/PreAuthShell.tsx
@@ -0,0 +1,33 @@
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
diff --git a/components/pre-auth/SplashScreen.tsx b/components/pre-auth/SplashScreen.tsx
new file mode 100644
--- /dev/null
+++ b/components/pre-auth/SplashScreen.tsx
@@ -0,0 +1,31 @@
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
+    <section className="talentry-pre-auth__content">
+      <span className="talentry-pre-auth__emblem" aria-hidden="true">T</span>
+      <p className="talentry-pre-auth__eyebrow">Talentry</p>
+      <h1 tabIndex={-1}>{copy.tagline}</h1>
+      <p>{returning ? copy.returning : copy.welcome}</p>
+    </section>
+    <footer className="talentry-pre-auth__footer">
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
diff --git a/components/pre-auth/OnboardingPager.tsx b/components/pre-auth/OnboardingPager.tsx
new file mode 100644
--- /dev/null
+++ b/components/pre-auth/OnboardingPager.tsx
@@ -0,0 +1,92 @@
+'use client'
+
+import Link from 'next/link'
+import { useEffect, useRef, useState } from 'react'
+import type { TouchEvent } from 'react'
+import { AUTH_ROUTES } from '@/lib/auth/auth-constants'
+import type { PreAuthCopy } from './pre-auth-copy'
+
+interface OnboardingPagerProps {
+  copy: PreAuthCopy
+  onBack: () => void
+  onSkip: () => void
+  onComplete: () => void
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
+      <span className="talentry-pre-auth__emblem" aria-hidden="true">{['?', '✓', '↗'][page]}</span>
+      <p className="talentry-pre-auth__eyebrow">{copy.page(page + 1)}</p>
+      <h1 id="pre-auth-title" tabIndex={-1} ref={heading}>{copy.panels[page].title}</h1>
+      <p>{copy.panels[page].description}</p>
+    </section>
+    <footer className="talentry-pre-auth__footer">
+      <nav className="talentry-pre-auth__dots" aria-label={copy.navigation}>
+        {copy.panels.map((panel, index) => <button key={index} type="button"
+          aria-label={`${copy.page(index + 1)}: ${panel.title}`} aria-controls="pre-auth-panel"
+          aria-current={page === index ? 'step' : undefined} onClick={() => navigate(index)}>
+          <span aria-hidden="true" />
+        </button>)}
+      </nav>
+      <p className="talentry-pre-auth__sr-only" role="status" aria-live="polite" aria-atomic="true">
+        {copy.page(page + 1)}: {copy.panels[page].title}
+      </p>
+      <div className="talentry-pre-auth__navigation">
+        <button className="talentry-pre-auth__action" type="button"
+          onClick={() => page === 0 ? onBack() : navigate(page - 1)}>{copy.back}</button>
+        {page < 2 && <button className="talentry-pre-auth__action talentry-pre-auth__action--primary"
+          type="button" onClick={() => navigate(page + 1)}>{copy.next}<span aria-hidden="true"> →</span></button>}
+      </div>
+      <div className="talentry-pre-auth__final-actions">
+        {page === 2 && <div className="talentry-pre-auth__auth-actions">
+          <Link className="talentry-pre-auth__action talentry-pre-auth__action--primary"
+            href={AUTH_ROUTES.login} onClick={onComplete}>{copy.signIn}</Link>
+          <Link className="talentry-pre-auth__action" href={AUTH_ROUTES.register} onClick={onComplete}>{copy.register}</Link>
+        </div>}
+      </div>
+    </footer>
+  </>
+}
diff --git a/components/pre-auth/pre-auth-copy.ts b/components/pre-auth/pre-auth-copy.ts
new file mode 100644
--- /dev/null
+++ b/components/pre-auth/pre-auth-copy.ts
@@ -0,0 +1,58 @@
+import type { AppLanguage } from '@/types/auth'
+
+type PanelCopy = { title: string; description: string }
+export interface PreAuthCopy {
+  language: string
+  tagline: string
+  welcome: string
+  returning: string
+  start: string
+  signIn: string
+  register: string
+  replay: string
+  back: string
+  next: string
+  skip: string
+  navigation: string
+  page: (number: number) => string
+  panels: readonly [PanelCopy, PanelCopy, PanelCopy]
+}
+
+export const PRE_AUTH_COPY: Record<AppLanguage, PreAuthCopy> = {
+  tr: {
+    language: 'Uygulama dili', tagline: 'Bir sonraki mülakatına hazırlan.',
+    welcome: 'Mülakat pratiğine ilk adımı at.', returning: 'Hazır olduğunda devam et.',
+    start: 'Başla', signIn: 'Giriş yap', register: 'Hesap oluştur',
+    replay: 'Tanıtımı tekrar görüntüle', back: 'Geri', next: 'İleri',
+    skip: 'Tanıtımı atla', navigation: 'Tanıtım sayfaları', page: number => `Sayfa ${number} / 3`,
+    panels: [
+      { title: 'Yapay zekâ ile mülakat pratiği', description: 'Hedeflediğin pozisyona uygun mülakat sorularıyla pratik yap.' },
+      { title: 'Sana özel geri bildirim', description: 'Yanıtların hakkında geri bildirim ve bir sonraki denemen için öneriler al.' },
+      { title: 'Gelişimini takip et', description: 'Geçmiş mülakatlarını, puanlarını ve değerlendirme özetlerini yeniden incele.' },
+    ],
+  },
+  en: {
+    language: 'App language', tagline: 'Prepare for your next interview.',
+    welcome: 'Take the first step in your interview practice.', returning: 'Continue when you’re ready.',
+    start: 'Get started', signIn: 'Sign In', register: 'Create Account',
+    replay: 'View introduction again', back: 'Back', next: 'Next',
+    skip: 'Skip introduction', navigation: 'Introduction pages', page: number => `Page ${number} of 3`,
+    panels: [
+      { title: 'AI Interview Practice', description: 'Practice interview questions tailored to your target role.' },
+      { title: 'Personalized Feedback', description: 'Get feedback on your answers and suggestions for your next attempt.' },
+      { title: 'Track Your Progress', description: 'Revisit past interviews, scores, and summaries.' },
+    ],
+  },
+  de: {
+    language: 'App-Sprache', tagline: 'Bereite dich auf dein nächstes Vorstellungsgespräch vor.',
+    welcome: 'Mach den ersten Schritt zur Vorbereitung.', returning: 'Mach weiter, wenn du bereit bist.',
+    start: 'Loslegen', signIn: 'Anmelden', register: 'Konto erstellen',
+    replay: 'Einführung erneut ansehen', back: 'Zurück', next: 'Weiter',
+    skip: 'Einführung überspringen', navigation: 'Einführungsseiten', page: number => `Seite ${number} von 3`,
+    panels: [
+      { title: 'Interviewtraining mit KI', description: 'Übe Interviewfragen, die zu deiner angestrebten Position passen.' },
+      { title: 'Persönliches Feedback', description: 'Erhalte Feedback zu deinen Antworten und Anregungen für deinen nächsten Versuch.' },
+      { title: 'Deine Fortschritte im Blick', description: 'Sieh dir vergangene Interviews, Bewertungen und Zusammenfassungen erneut an.' },
+    ],
+  },
+}
diff --git a/styles/talentry-pre-auth.css b/styles/talentry-pre-auth.css
new file mode 100644
--- /dev/null
+++ b/styles/talentry-pre-auth.css
@@ -0,0 +1,102 @@
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
+  color: var(--talentry-color-text);
+  background: var(--talentry-color-surface-lavender);
+  font-family: var(--talentry-font-family);
+  line-height: var(--talentry-line-height-normal);
+}
+.talentry-pre-auth__frame {
+  display: flex;
+  flex-direction: column;
+  gap: var(--talentry-space-5);
+  width: 100%;
+  max-width: calc(var(--talentry-space-16) * 10);
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
+.talentry-pre-auth__brand { display: flex; align-items: center; gap: var(--talentry-space-2); font-size: var(--talentry-font-size-lg); font-weight: var(--talentry-font-weight-bold); color: var(--talentry-color-navy); }
+.talentry-pre-auth__mark {
+  display: grid;
+  place-items: center;
+  width: var(--talentry-space-8);
+  height: var(--talentry-space-8);
+  border-radius: var(--talentry-radius-md);
+  background: var(--talentry-color-primary);
+  color: var(--talentry-color-text-on-primary);
+}
+.talentry-pre-auth__languages { display: flex; flex-wrap: wrap; gap: var(--talentry-space-1); padding: 0; border: 0; margin: 0; min-width: 0; }
+.talentry-pre-auth button, .talentry-pre-auth a { font: inherit; cursor: pointer; }
+.talentry-pre-auth__languages button {
+  min-width: var(--talentry-button-height-md);
+  min-height: var(--talentry-button-height-md);
+  padding: var(--talentry-space-1);
+  border: 1px solid transparent;
+  border-radius: var(--talentry-radius-md);
+  color: var(--talentry-color-text-secondary);
+  background: transparent;
+  font-size: var(--talentry-font-size-sm);
+}
+.talentry-pre-auth__languages button[aria-pressed="true"] { border-color: var(--talentry-color-primary); color: var(--talentry-color-navy); background: var(--talentry-color-surface); font-weight: var(--talentry-font-weight-bold); text-decoration: underline; text-underline-offset: var(--talentry-space-1); }
+.talentry-pre-auth__card { display: flex; flex: 1; min-width: 0; padding: var(--talentry-space-5); border: var(--talentry-card-border); border-radius: var(--talentry-card-radius); background: var(--talentry-color-surface); box-shadow: var(--talentry-shadow-card); }
+.talentry-pre-auth__flow { display: flex; flex-direction: column; width: 100%; min-width: 0; }
+.talentry-pre-auth__content { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding-block: var(--talentry-space-6); overflow-wrap: anywhere; }
+.talentry-pre-auth__emblem { display: grid; place-items: center; flex-shrink: 0; width: var(--talentry-space-16); height: var(--talentry-space-16); margin-bottom: var(--talentry-space-5); border-radius: var(--talentry-radius-xl); color: var(--talentry-color-indigo); background: var(--talentry-color-surface-purple-soft); font-size: var(--talentry-font-size-3xl); font-weight: var(--talentry-font-weight-bold); }
+.talentry-pre-auth h1 { margin: 0; max-width: 100%; color: var(--talentry-color-navy); font-size: var(--talentry-font-size-3xl); line-height: var(--talentry-line-height-tight); letter-spacing: var(--talentry-letter-spacing-tight); }
+.talentry-pre-auth__content p { margin: var(--talentry-space-4) 0 0; max-width: calc(var(--talentry-space-16) * 7); color: var(--talentry-color-text-secondary); }
+.talentry-pre-auth__content .talentry-pre-auth__eyebrow { margin: 0 0 var(--talentry-space-3); font-size: var(--talentry-font-size-sm); font-weight: var(--talentry-font-weight-semibold); color: var(--talentry-color-indigo); }
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
+  border: var(--talentry-button-secondary-border);
+  border-radius: var(--talentry-button-radius);
+  background: var(--talentry-color-surface);
+  color: var(--talentry-color-text);
+  text-decoration: none;
+  text-align: center;
+  overflow-wrap: anywhere;
+  font-weight: var(--talentry-font-weight-semibold);
+}
+.talentry-pre-auth__action--primary { background: var(--talentry-button-primary-bg); border-color: var(--talentry-button-primary-bg); color: var(--talentry-button-primary-text); }
+.talentry-pre-auth__action:hover { background: var(--talentry-color-surface-lavender); }
+.talentry-pre-auth__action--primary:hover { background: var(--talentry-button-primary-bg-hover); }
+.talentry-pre-auth__text-action { min-width: var(--talentry-button-height-md); min-height: var(--talentry-button-height-md); padding: var(--talentry-space-2); border: 0; border-radius: var(--talentry-radius-sm); background: transparent; color: var(--talentry-color-text-secondary); text-decoration: underline; text-underline-offset: var(--talentry-space-1); overflow-wrap: anywhere; }
+.talentry-pre-auth__skip-row { display: flex; justify-content: flex-end; }
+.talentry-pre-auth__dots { display: flex; justify-content: center; gap: var(--talentry-space-2); }
+.talentry-pre-auth__dots button { display: grid; place-items: center; width: var(--talentry-button-height-md); height: var(--talentry-button-height-md); padding: 0; border: 0; border-radius: var(--talentry-radius-pill); background: transparent; }
+.talentry-pre-auth__dots span { width: var(--talentry-space-2); height: var(--talentry-space-2); border-radius: var(--talentry-radius-pill); background: var(--talentry-color-text-secondary); }
+.talentry-pre-auth__dots [aria-current="step"] span { width: var(--talentry-space-6); background: var(--talentry-color-primary); }
+.talentry-pre-auth__final-actions { min-height: var(--talentry-button-height-lg); }
+.talentry-pre-auth :focus-visible { outline: 2px solid var(--talentry-color-indigo); outline-offset: var(--talentry-space-1); }
+.talentry-pre-auth__sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0; }
+@media (min-width: 768px) {
+  .talentry-pre-auth { padding: max(var(--talentry-space-8), env(safe-area-inset-top, 0px)) max(var(--talentry-space-8), env(safe-area-inset-right, 0px)) max(var(--talentry-space-8), env(safe-area-inset-bottom, 0px)) max(var(--talentry-space-8), env(safe-area-inset-left, 0px)); }
+  .talentry-pre-auth__frame { flex: initial; align-self: center; margin: auto; }
+  .talentry-pre-auth__card { min-height: calc(var(--talentry-space-16) * 9); padding: var(--talentry-space-8); }
+  .talentry-pre-auth h1 { font-size: var(--talentry-font-page-title-size); }
+}
diff --git a/docs/02_Decisions/ADR-001-pre-auth-entry-flow.md b/docs/02_Decisions/ADR-001-pre-auth-entry-flow.md
new file mode 100644
--- /dev/null
+++ b/docs/02_Decisions/ADR-001-pre-auth-entry-flow.md
@@ -0,0 +1,21 @@
+# ADR-001: Pre-auth entry flow
+
+- Date: 2026-09-21
+- Status: Architecture approved by the PREAUTH_ONBOARDING_01 implementation request; implementation acceptance pending runtime review.
+- Related sprint: PREAUTH_ONBOARDING_01
+
+## Context and decision
+
+Root previously redirected every visitor to interview setup. Root now uses the existing server-only getAuthenticatedUser helper: authenticated visitors go to /dashboard, and unauthorized visitors receive the pre-auth client flow. No user, session, or token is passed to that client.
+
+The welcome screen and three introduction panels share /. Separate /welcome and /onboarding routes were considered during forensic review and rejected as unnecessary routing surface. Direct auth and recovery routes retain their existing behavior.
+
+The UX-only localStorage value talentry.onboarding.v1="complete" is written on explicit Skip introduction or a final-panel auth action. It is not authentication, contains no personal data, and never gates auth routes. Reads happen after mount; reads and writes tolerate unavailable storage. Replay leaves the saved flag intact. Application language reuses interviewai_uilang (tr/en/de), independently of interview language.
+
+## Consequences and limitations
+
+Result restart links and the legacy /result redirect now explicitly target /interview/setup to preserve their prior destination. No middleware, DB/schema, auth utility, or dependency change is required. Existing auth screens remain English and unchanged; their decorative language menu is a known limitation. Locally stored preferences can be unavailable or cleared, in which case the introduction may repeat. Initial default-language welcome markup may briefly precede restored preferences after hydration. Runtime acceptance is pending.
+
+## Rollback boundary
+
+With separate authorization, reverse only this sprint's root change and three result destinations and remove the new pre-auth implementation. The local preference is harmless if left behind. Preserve historical reports and this decision record; document any reversal separately. No migration or provider rollback is needed.
diff --git a/docs/01_Engineering/Sprint_PREAUTH_ONBOARDING_01_Summary.md b/docs/01_Engineering/Sprint_PREAUTH_ONBOARDING_01_Summary.md
new file mode 100644
--- /dev/null
+++ b/docs/01_Engineering/Sprint_PREAUTH_ONBOARDING_01_Summary.md
@@ -0,0 +1,17 @@
+# Sprint PREAUTH_ONBOARDING_01 Summary
+
+- Title: Pre-auth Splash + Onboarding
+- Branch: feature/auth-foundation
+- Baseline: 1ca99820f49eb8dbf5c59dcb841f66d87561fbbb; clean working tree; local origin reference aligned.
+- Status: Implementation complete; ready for runtime review; acceptance pending.
+- Goal: Introduce a user-controlled welcome and three localized introduction panels at /, preserving authenticated Dashboard entry and interview restart behavior.
+- Modified files: app/page.tsx; app/result/page.tsx; components/result/ResultContent.tsx; components/result/ResultShell.tsx.
+- Created implementation files: components/pre-auth/PreAuthFlow.tsx; components/pre-auth/usePreAuthPreferences.ts; components/pre-auth/PreAuthShell.tsx; components/pre-auth/SplashScreen.tsx; components/pre-auth/OnboardingPager.tsx; components/pre-auth/pre-auth-copy.ts; styles/talentry-pre-auth.css.
+- Created documentation: docs/02_Decisions/ADR-001-pre-auth-entry-flow.md; this Summary; Sprint_PREAUTH_ONBOARDING_01_Engineering_Report.md.
+- Behavior: Server-authenticated / redirects to /dashboard. First visitors see welcome, then three panels. Completion/skip produces a compact entry with replay. Result restart destinations explicitly use /interview/setup.
+- Persistence: talentry.onboarding.v1="complete" only on explicit skip or final-panel auth activation; interviewai_uilang changes only on explicit TR/EN/DE selection. Storage errors do not block navigation. No personal data or auth state stored by onboarding.
+- Validation: npx.cmd tsc --noEmit --incremental false PASS (exit 0); git diff --check PASS (exit 0). npm emitted an update notice; Git emitted LF-to-CRLF notices. No dependencies changed.
+- Build: Not run, explicitly deferred until after runtime review.
+- Runtime: Not performed. Auth/session routing, storage denial, persistence, language handoff, touch/keyboard/screen reader behavior, and responsive rendering remain pending.
+- Risks: A brief initial default-language welcome can precede stored preferences after mount. Existing auth pages remain English. Existing provider/security/localization debt is outside scope.
+- Approval: Implementation acceptance not yet approved. No staging, commit, push, or Project Memory update.
~~~

~~~text
 M app/page.tsx
 M app/result/page.tsx
 M components/result/ResultContent.tsx
 M components/result/ResultShell.tsx
?? components/pre-auth/OnboardingPager.tsx
?? components/pre-auth/PreAuthFlow.tsx
?? components/pre-auth/PreAuthShell.tsx
?? components/pre-auth/SplashScreen.tsx
?? components/pre-auth/pre-auth-copy.ts
?? components/pre-auth/usePreAuthPreferences.ts
?? docs/01_Engineering/Sprint_PREAUTH_ONBOARDING_01_Engineering_Report.md
?? docs/01_Engineering/Sprint_PREAUTH_ONBOARDING_01_Summary.md
?? docs/02_Decisions/ADR-001-pre-auth-entry-flow.md
?? styles/talentry-pre-auth.css
~~~

---

## FINAL CLOSURE / RUNTIME ACCEPTANCE — PREAUTH_ONBOARDING_01 — 2026-09-22

This section records later acceptance and supersedes the earlier pending status and implementation-time limitations only where explicitly resolved below. Original implementation notes and micro-refinement reports remain historical snapshots. Evidence is supplied by the user; this documentation-only closure did not rerun runtime tests, TypeScript or production build.

Status: IMPLEMENTATION / RUNTIME / PRODUCTION BUILD ACCEPTED. Implementation remains UNCOMMITTED on feature/auth-foundation. Current committed recovery checkpoint remains 1ca9982 (feat(account): add user menu and authenticated account pages). Update the recovery point separately after an authorized stage commit. No next stage has started; no staging, commit or push is authorized here.

### Final implemented scope

- Root `/` performs a server-side auth check: authenticated users go to `/dashboard`; unauthenticated users see the canonical public pre-auth flow.
- First visit: Splash, three onboarding panels, Sign In / Create Account. Repeat visit: compact entry with direct auth actions and Replay introduction.
- Completion is a browser UX preference only, never authentication/security state. Skip and final-panel auth actions complete onboarding; replay does not clear completion. Storage failures are handled safely in source.
- Application language supports TR / EN / DE through existing `interviewai_uilang`, independently of interview language. A neutral branded unresolved-language render prevents incorrect Turkish copy before persisted EN/DE resolves.
- Talentry dark navy/indigo auth-family styling, animated full-screen ocean-swell color field, static reduced-motion fallback and softened dark card material. Icons: microphone, assessment clipboard, progress/history clock for Panels 1, 2, 3 respectively.
- Visible page-count labels are removed; accessible progress remains. Skip is absent on Panel 3. Splash and all three panels share mobile centering in the available region below the header.
- Dots, Back / Next, Pointer Events swipe and keyboard navigation are implemented. Swipe uses 48px horizontal travel and horizontal displacement greater than 1.5 times vertical displacement; scoped vertical pan/pinch zoom remains allowed.
- Skip focus fix: the native button was already focusable, but heading focus bypassed it. Panels 1–2 now begin programmatic focus on the heading-labelled Skip row so the next Tab reaches Skip; Panel 3 retains heading focus.
- Legacy `/result` and persisted Result Start Again explicitly target `/interview/setup`, including unavailable/error restart links; no restart path accidentally traverses `/`.

### User-supplied verified runtime results — PASS

- Auth/routes: authenticated `/` -> `/dashboard`; Register route; Login route; Forgot Password route; legacy `/result` -> `/interview/setup`; Result Start Again -> `/interview/setup`.
- First/repeat visit: unauthenticated first-visit Splash; final-panel Sign In -> `/login`; completion persists to compact repeat entry; replay starts at Panel 1; replay does not clear completion; Skip persists to compact repeat entry.
- Language: EN immediate switch; EN refresh without flash; DE immediate switch; DE refresh without flash; persisted app language carried into Setup. Interview language remains conceptually separate.
- Interaction/accessibility: dot navigation; swipe navigation; Skip first Tab focus; Skip Enter activation; dot Enter navigation.
- Desktop: Splash; Panels 1–3; final-panel Skip removal.
- Mobile 390x844: Splash; Panel 1; Panel 2; Panel 3; shared mobile card centering.
- Breakpoints: 767px compact entry; 767px Panel 1; 768px compact entry; 768px Panel 1.

### User-supplied production build — PASS

Command: `npm.cmd run build`.
Compiled successfully; linting and checking validity of types; collecting page data;
generating static pages (22/22); collecting build traces; finalizing page optimization: PASS.
Root `/` is Dynamic (ƒ), expected because of its server-side auth check.
This is supplied build evidence, not a build rerun by the assistant.

### Untested boundaries and preserved debt

Not runtime-verified: localStorage unavailable/denied; malformed stored preferences;
manual reduced-motion behavior; exhaustive screen-reader announcements; exhaustive
browser/device matrix; very short landscape viewports, browser zoom and unusually
long text. These are untested boundaries, not asserted bugs or runtime PASS claims.
Full auth recovery email delivery is outside this stage. More-than-20-record My
Interviews pagination acceptance remains pending. All existing security/technical
debt remains unless specifically resolved above, including provider endpoint/auth
hardening, private-content logging, scoring trust, fragmented localization, PDF and
avatar work. No unrelated debt is closed by this acceptance.
