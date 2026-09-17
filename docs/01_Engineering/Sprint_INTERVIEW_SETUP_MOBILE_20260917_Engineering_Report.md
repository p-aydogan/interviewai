# Sprint INTERVIEW_SETUP_MOBILE_20260917 Engineering Report

## 1. Identity and objective

Date: 2026-09-17. Title: Interview Setup mobile two-panel presentation. Status: Implementation and static validation complete; awaiting approval. Runtime acceptance and production build remain pending.

Implement exactly two mobile panels at <=640px within the four approved Setup files, plus the required new reports. Preserve defaults, optional role/company, query serialization, parent state, UI-language persistence and desktop/tablet presentation.

## 2. Repository before implementation

Branch: feature/auth-foundation. HEAD: 3dbaca7c9d9ebf3407e4ca1a0502ed3d1a773295. Commit: feat(dashboard): integrate recent interview history and mobile navigation. Initial git status --short was empty. tsconfig.tsbuildinfo did not exist. No Git mutations performed.

## 3. Architecture and decisions

InterviewSetupForm retains all seven form values, UI language, storage effect and the unchanged submit handler. Viewport mode initializes false for matching server/client initial markup, then subscribes to matchMedia('(max-width: 640px)') with effect cleanup. Conditional rendering mounts only one editable presentation. The parent remains mounted across breakpoint changes, preserving values.

InterviewSetupMobile owns only active-panel state and presentation refs. Both mobile sections remain mounted; hidden removes inactive content from layout, interaction and accessibility tree. No duplicate business state, submit handler, API calls, draft persistence or new validation.

Panel 1: introduction, two-column native-radio interviewer cards, persona, interview language. Panel 2: optional role, optional company, level, interview type, single Start Interview submit action. Header keeps brand, application-language controls and Dashboard navigation separate.

Two dots navigate directly. Swipe requires >=60px displacement and horizontal movement >1.5 times vertical movement, clamps at endpoints, and ignores native/editable controls, labels, links, selected text and multitouch. No preventDefault or animation. Navigation resets the sole viewport scroll position. If the outgoing section contained focus, focus moves to the new section after rendering.

Defaults remain f, empty role, empty company, mid, behavioral, formal, tr. UI language independently starts tr and reads interviewai_uilang. No required-field or per-panel gates added.

The unchanged handler serializes iv: interviewer, role: role.trim(), company: company.trim(), level, itype: interviewType, persona, language: interviewLanguage, cv: ''. It retains URLSearchParams and router.push(`/interview?${params.toString()}`). All eight keys remain including empty values. Receiving Interview and Genel fallbacks are untouched.

## 4. Files and responsibilities

- Modified components/interview/InterviewSetupForm.tsx: state/controller, existing desktop markup, conditional mobile presentation, Setup-local lang.
- Created components/interview/InterviewSetupMobile.tsx: controlled mobile fields, navigation, focus and gesture handling.
- Created components/interview/interview-setup-config.ts: original copy/options/constants/types extracted without value changes; new localized mobile copy and prop types.
- Modified styles/talentry-interview-setup.css: appended mobile-only shell/header/cards/viewport/pager styles.
- Created docs/01_Engineering/Sprint_INTERVIEW_SETUP_MOBILE_20260917_Summary.md: acceptance summary.
- Created this Engineering Report: implementation decisions, validation and complete implementation patches.

## 5. Public interfaces

InterviewSetupMobileProps contains copy: SetupCopy, uiLanguage: AppLanguage, values: SetupValues and changes: SetupChanges. SetupValues contains interviewer, role, company, level, interviewType, persona and interviewLanguage with original enum/string types. SetupChanges maps each key to a callback accepting its exact value type.

Configuration exports original InterviewerId, InterviewLevel, InterviewType, InterviewPersona, SetupCopy, COPY, INTERVIEWERS, LANGUAGE_LABELS, LANGUAGE_NAMES, UI_LANGUAGE_STORAGE_KEY; adds MOBILE_COPY, SetupValues and SetupChanges. No route/API/schema/shared primitive interfaces changed.

## 6. Accessibility and localization

Native controls and associated labels retained. Checked cards include checkmark/text, with visible focus. Hidden sections have no tab stops. Active sections have accessible names and programmatic focus targets; no input autofocus. Pager uses localized TR/EN/DE labels, aria-controls, aria-current='step', type='button', and 44px targets. Current dot changes width and color. Mobile input/select text is 16px with existing 44px minimum heights. No motion added; existing reduced-motion rules retained. Setup-local lang follows UI language. Role/company/names/enum values are never translated. Existing header accessibility text and interviewer titles remain unchanged.

## 7. Styling and desktop preservation

All added rules are within max-width:640px. Fixed-inset shell uses 100vh fallback then 100dvh, safe-area padding, min-height/min-width:0 and overflow containment. One overflow-y:auto viewport contains active content; pager is a non-scrolling sibling. No wide offscreen track or nested card scrolling. Portraits use 48px token sizing, compact spacing and wrapping. Header has two compact rows. Shared primitives/tokens remain untouched. Desktop two-card and tablet stacked markup/classes/rules remain unchanged above 640px.

## 8. Validation and exact results

- npx.cmd tsc --noEmit: exit 0; no TypeScript diagnostics.
- npm emitted an update notice from 11.16.0 to 12.0.2, linked https://github.com/npm/cli/releases/tag/v12.0.2 and suggested npm install -g npm@12.0.2. No update performed.
- Removed generated tsconfig.tsbuildinfo via Remove-Item -LiteralPath on the exact repository file.
- git diff --check: exit 0; no whitespace errors. Git warned LF would be replaced by CRLF for InterviewSetupForm.tsx and talentry-interview-setup.css.
- Complete modified implementation diff and both new source files inspected.
- Runtime tests and production build not run, explicitly deferred by user.

## 9. Git status

All changes remain unstaged. Branch and HEAD unchanged. Final status is recorded below. No stage/commit/push/reset/restore/stash performed.

## 10. Risks, limitations and debt

Static validation does not prove 390x844 fit, swipe usability, overflow, virtual-keyboard behavior or screen-reader operation. Mobile hydration initially uses the desktop-compatible tree; a brief presentation change is possible. Returning to mobile mode resets panel selection to 1, retaining parent form values. Remote portraits remain network-dependent. The existing parent stays above the approximate 150-line preference to preserve desktop markup within the allowlist; the new mobile component is below it.

Pending acceptance: desktop/tablet baseline; 640/641px boundary; initial 390x844 panel; swipe directions/endpoints/control exclusions; dots/focus/hidden tab stops; all values across panels and viewport modes; UI/interview language independence; blank/whitespace/long/Unicode role/company; exact eight encoded query keys and receiver values; refresh reset behavior; body overflow; stable pager; safe areas; keyboard-open reachability; German copy; text zoom; reduced motion. Production build remains pending.

## 11. Untouched modules and approval

No changes to setup route, receiving Interview, shared primitives/tokens, auth, APIs, schema, Dashboard, Result, scoring, prompts, HeyGen/avatar implementation, PDF, history, root routing or Project Memory. No packages installed.

User approval is required at the end of this implementation stage. Runtime/build success and acceptance are not claimed. Stop; do not begin another stage or commit.

## 12. Complete implementation diffs

The following includes both modified and both added implementation files, plus the new Summary patch. This Engineering Report is itself the complete report content and is not recursively embedded.
```diff
diff --git a/components/interview/InterviewSetupForm.tsx b/components/interview/InterviewSetupForm.tsx
index 882ba58..837ae93 100644
--- a/components/interview/InterviewSetupForm.tsx
+++ b/components/interview/InterviewSetupForm.tsx
@@ -9,106 +9,9 @@ import { SectionHeader, TalentryButton, TalentryCard } from '@/components/ui'
 import { AUTH_ROUTES, DEFAULT_APP_LANGUAGE, SUPPORTED_APP_LANGUAGES } from '@/lib/auth/auth-constants'
 import type { AppLanguage } from '@/types/auth'
 
-type InterviewerId = 'f' | 'm'
-type InterviewLevel = 'junior' | 'mid' | 'senior'
-type InterviewType = 'behavioral' | 'technical' | 'mixed' | 'case'
-type InterviewPersona = 'friendly' | 'formal' | 'tough' | 'curious'
-
-type SetupCopy = {
-  eyebrow: string
-  title: string
-  description: string
-  interviewerLegend: string
-  interviewerHelp: string
-  selected: string
-  configurationTitle: string
-  configurationDescription: string
-  role: string
-  rolePlaceholder: string
-  company: string
-  companyPlaceholder: string
-  level: string
-  interviewType: string
-  persona: string
-  interviewLanguage: string
-  optional: string
-  start: string
-  backToDashboard: string
-  junior: string
-  mid: string
-  senior: string
-  behavioral: string
-  technical: string
-  mixed: string
-  caseStudy: string
-  friendly: string
-  formal: string
-  tough: string
-  curious: string
-}
-
-const UI_LANGUAGE_STORAGE_KEY = 'interviewai_uilang'
-
-const INTERVIEWERS = [
-  {
-    id: 'f',
-    name: 'Sarah Chen',
-    role: 'Sr. HR Manager',
-    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=face',
-  },
-  {
-    id: 'm',
-    name: 'Marcus Reid',
-    role: 'Tech Lead',
-    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop&crop=face',
-  },
-] as const
-
-const COPY: Record<AppLanguage, SetupCopy> = {
-  tr: {
-    eyebrow: 'Mülakat hazırlığı',
-    title: 'Bir sonraki görüşmene hazırlan.',
-    description: 'Mülakatçını ve görüşme tercihlerini seç. Hazır olduğunda yapay zekâ destekli görüşmeni başlat.',
-    interviewerLegend: 'Mülakatçını seç', interviewerHelp: 'Pratik tarzına uygun görüşmeciyi seç.', selected: 'Seçildi',
-    configurationTitle: 'Görüşme ayarları', configurationDescription: 'Deneyimi hedeflediğin role göre şekillendir.',
-    role: 'Hedef pozisyon', rolePlaceholder: 'Örn. Product Manager', company: 'Şirket / sektör', companyPlaceholder: 'Örn. Fintech',
-    level: 'Kariyer seviyesi', interviewType: 'Mülakat türü', persona: 'Mülakatçı tarzı', interviewLanguage: 'Mülakat dili',
-    optional: 'İsteğe bağlı', start: 'Mülakatı Başlat', backToDashboard: "Dashboard'a Dön",
-    junior: 'Junior (0–2 yıl)', mid: 'Mid-level (2–5 yıl)', senior: 'Senior (5+ yıl)',
-    behavioral: 'Davranışsal / İK', technical: 'Teknik', mixed: 'Karma', caseStudy: 'Vaka Analizi',
-    friendly: 'Arkadaşça', formal: 'Profesyonel', tough: 'Zorlu', curious: 'Analitik',
-  },
-  en: {
-    eyebrow: 'Interview preparation',
-    title: 'Prepare for your next interview.',
-    description: 'Choose your interviewer and session preferences. Start your AI-powered interview when you are ready.',
-    interviewerLegend: 'Choose your interviewer', interviewerHelp: 'Select the interviewer who fits your practice style.', selected: 'Selected',
-    configurationTitle: 'Interview settings', configurationDescription: 'Shape the experience around the role you are targeting.',
-    role: 'Target role', rolePlaceholder: 'e.g. Product Manager', company: 'Company / sector', companyPlaceholder: 'e.g. Fintech',
-    level: 'Career level', interviewType: 'Interview type', persona: 'Interviewer persona', interviewLanguage: 'Interview language',
-    optional: 'Optional', start: 'Start Interview', backToDashboard: 'Back to Dashboard',
-    junior: 'Junior (0–2 years)', mid: 'Mid-level (2–5 years)', senior: 'Senior (5+ years)',
-    behavioral: 'Behavioral / HR', technical: 'Technical', mixed: 'Mixed', caseStudy: 'Case Study',
-    friendly: 'Friendly', formal: 'Professional', tough: 'Tough', curious: 'Analytical',
-  },
-  de: {
-    eyebrow: 'Interviewvorbereitung',
-    title: 'Bereite dich auf dein nächstes Gespräch vor.',
-    description: 'Wähle Interviewer und Gesprächseinstellungen. Starte dein KI-gestütztes Interview, wenn du bereit bist.',
-    interviewerLegend: 'Interviewer auswählen', interviewerHelp: 'Wähle die Person, die zu deinem Übungsstil passt.', selected: 'Ausgewählt',
-    configurationTitle: 'Gesprächseinstellungen', configurationDescription: 'Richte das Erlebnis auf deine Zielposition aus.',
-    role: 'Zielposition', rolePlaceholder: 'z. B. Product Manager', company: 'Unternehmen / Branche', companyPlaceholder: 'z. B. Fintech',
-    level: 'Karrierestufe', interviewType: 'Gesprächsart', persona: 'Interviewer-Stil', interviewLanguage: 'Gesprächssprache',
-    optional: 'Optional', start: 'Interview starten', backToDashboard: 'Zurück zum Dashboard',
-    junior: 'Junior (0–2 Jahre)', mid: 'Mid-level (2–5 Jahre)', senior: 'Senior (5+ Jahre)',
-    behavioral: 'Verhalten / HR', technical: 'Technisch', mixed: 'Gemischt', caseStudy: 'Fallstudie',
-    friendly: 'Freundlich', formal: 'Professionell', tough: 'Anspruchsvoll', curious: 'Analytisch',
-  },
-}
-
-const LANGUAGE_LABELS: Record<AppLanguage, string> = { tr: 'TR', en: 'EN', de: 'DE' }
-const LANGUAGE_NAMES: Record<AppLanguage, string> = { tr: 'Türkçe', en: 'English', de: 'Deutsch' }
-
+import InterviewSetupMobile from './InterviewSetupMobile'
+import { COPY, INTERVIEWERS, LANGUAGE_LABELS, LANGUAGE_NAMES, UI_LANGUAGE_STORAGE_KEY } from './interview-setup-config'
+import type { InterviewerId, InterviewLevel, InterviewType, InterviewPersona } from './interview-setup-config'
 function isAppLanguage(value: string | null): value is AppLanguage {
   return SUPPORTED_APP_LANGUAGES.some((language) => language === value)
 }
@@ -124,6 +27,15 @@ export default function InterviewSetupForm() {
   const [persona, setPersona] = useState<InterviewPersona>('formal')
   const [interviewLanguage, setInterviewLanguage] = useState<AppLanguage>('tr')
   const copy = COPY[uiLanguage]
+  const [isMobile, setIsMobile] = useState(false)
+
+  useEffect(() => {
+    const query = window.matchMedia('(max-width: 640px)')
+    const syncViewport = () => setIsMobile(query.matches)
+    syncViewport()
+    query.addEventListener('change', syncViewport)
+    return () => query.removeEventListener('change', syncViewport)
+  }, [])
 
   useEffect(() => {
     const savedLanguage = window.localStorage.getItem(UI_LANGUAGE_STORAGE_KEY)
@@ -151,7 +63,7 @@ export default function InterviewSetupForm() {
   }
 
   return (
-    <main className="talentry-setup-shell">
+    <main className="talentry-setup-shell" lang={uiLanguage}>
       <header className="talentry-setup-header">
         <Link aria-label="Talentry interview setup" className="talentry-setup-brand" href="/interview/setup">
           <span className="talentry-setup-brand__mark" aria-hidden="true">T</span>
@@ -177,6 +89,16 @@ export default function InterviewSetupForm() {
         </div>
       </header>
 
+      {isMobile ? (
+        <form className="talentry-setup-mobile-form" onSubmit={handleSubmit}>
+          <InterviewSetupMobile
+            copy={copy} uiLanguage={uiLanguage}
+            values={{ interviewer, role, company, level, interviewType, persona, interviewLanguage }}
+            changes={{ interviewer: setInterviewer, role: setRole, company: setCompany, level: setLevel,
+              interviewType: setInterviewType, persona: setPersona, interviewLanguage: setInterviewLanguage }}
+          />
+        </form>
+      ) : (
       <div className="talentry-setup-content">
         <SectionHeader
           className="talentry-setup-intro"
@@ -264,6 +186,7 @@ export default function InterviewSetupForm() {
           </TalentryCard>
         </form>
       </div>
+      )}
     </main>
   )
 }
diff --git a/styles/talentry-interview-setup.css b/styles/talentry-interview-setup.css
index 174dfce..6f6190e 100644
--- a/styles/talentry-interview-setup.css
+++ b/styles/talentry-interview-setup.css
@@ -371,3 +371,134 @@
     transition: none;
   }
 }
+
+/* Setup-only mobile presentation; desktop and tablet rules above stay intact. */
+@media (max-width: 640px) {
+  .talentry-setup-shell {
+    position: fixed;
+    inset: 0;
+    display: flex;
+    flex-direction: column;
+    gap: var(--talentry-space-3);
+    height: 100vh;
+    height: 100dvh;
+    min-height: 0;
+    min-width: 0;
+    overflow: hidden;
+    padding: max(var(--talentry-space-3), env(safe-area-inset-top, 0px))
+      max(var(--talentry-space-4), env(safe-area-inset-right, 0px))
+      max(var(--talentry-space-2), env(safe-area-inset-bottom, 0px))
+      max(var(--talentry-space-4), env(safe-area-inset-left, 0px));
+  }
+
+  .talentry-setup-header {
+    flex: none;
+    display: grid;
+    grid-template-columns: minmax(0, 1fr) auto;
+    gap: var(--talentry-space-2);
+    min-width: 0;
+  }
+
+  .talentry-setup-header__actions { display: contents; }
+  .talentry-setup-language { grid-column: 2; grid-row: 1; }
+  .talentry-setup-dashboard-link { grid-column: 1 / -1; width: 100%; white-space: normal; }
+  .talentry-setup-brand { min-width: 0; }
+
+  .talentry-setup-mobile-form {
+    display: flex;
+    flex-direction: column;
+    flex: 1;
+    min-width: 0;
+    min-height: 0;
+    overflow: hidden;
+    gap: var(--talentry-space-2);
+  }
+
+  .talentry-setup-mobile-viewport {
+    flex: 1;
+    min-height: 0;
+    min-width: 0;
+    overflow-y: auto;
+    overflow-x: hidden;
+    overscroll-behavior-y: contain;
+    touch-action: pan-y pinch-zoom;
+    padding: var(--talentry-space-1);
+    scroll-padding-block: var(--talentry-space-2);
+  }
+
+  .talentry-setup-mobile-panel {
+    display: flex;
+    flex-direction: column;
+    gap: var(--talentry-space-4);
+    min-width: 0;
+    overflow-wrap: anywhere;
+  }
+
+  .talentry-setup-mobile-panel[hidden] { display: none; }
+  .talentry-setup-mobile-panel > * { flex: none; min-width: 0; }
+  .talentry-setup-mobile-panel h1 {
+    margin: 0;
+    color: var(--talentry-color-navy);
+    font-size: var(--talentry-font-size-xl);
+    line-height: var(--talentry-line-height-snug);
+  }
+  .talentry-setup-mobile-panel .talentry-section-header__title { font-size: var(--talentry-font-size-xl); }
+  .talentry-setup-mobile-panel .talentry-section-header__description { font-size: var(--talentry-font-size-sm); }
+  .talentry-setup-mobile-panel .talentry-card { padding: var(--talentry-space-3); }
+  .talentry-setup-mobile-panel .talentry-setup-interviewer-list {
+    grid-template-columns: repeat(2, minmax(0, 1fr));
+    margin-top: var(--talentry-space-3);
+    gap: var(--talentry-space-2);
+  }
+  .talentry-setup-mobile-panel .talentry-setup-interviewer-option label {
+    height: 100%;
+    min-height: 0;
+    grid-template-columns: minmax(0, 1fr);
+    justify-items: center;
+    align-content: start;
+    text-align: center;
+    gap: var(--talentry-space-2);
+    padding: var(--talentry-space-2);
+  }
+  .talentry-setup-mobile-panel .talentry-setup-interviewer-option img {
+    width: var(--talentry-space-12);
+    height: var(--talentry-space-12);
+  }
+  .talentry-setup-mobile-panel .talentry-setup-interviewer-option__identity strong { font-size: var(--talentry-font-size-sm); }
+  .talentry-setup-mobile-panel .talentry-setup-interviewer-option__identity span { font-size: var(--talentry-font-size-xs); }
+  .talentry-setup-mobile-panel .talentry-setup-field input,
+  .talentry-setup-mobile-panel .talentry-setup-field select { font-size: var(--talentry-font-size-md); min-width: 0; }
+  .talentry-setup-mobile-panel .talentry-setup-submit { margin-top: var(--talentry-space-2); white-space: normal; }
+
+  .talentry-setup-mobile-pager {
+    display: flex;
+    flex: none;
+    justify-content: center;
+    gap: var(--talentry-space-2);
+  }
+  .talentry-setup-mobile-pager button {
+    display: grid;
+    place-items: center;
+    width: var(--talentry-button-height-md);
+    height: var(--talentry-button-height-md);
+    border: 0;
+    border-radius: var(--talentry-radius-pill);
+    background: transparent;
+    cursor: pointer;
+  }
+  .talentry-setup-mobile-pager button span {
+    width: var(--talentry-space-2);
+    height: var(--talentry-space-2);
+    border-radius: var(--talentry-radius-pill);
+    background: var(--talentry-color-text-secondary);
+  }
+  .talentry-setup-mobile-pager button[aria-current='step'] span {
+    width: var(--talentry-space-6);
+    background: var(--talentry-color-primary);
+  }
+  .talentry-setup-mobile-pager button:focus-visible,
+  .talentry-setup-mobile-panel:focus-visible {
+    outline: 2px solid var(--talentry-color-border-focus);
+    outline-offset: -2px;
+  }
+}
```
```diff
diff --git a/components/interview/InterviewSetupMobile.tsx b/components/interview/InterviewSetupMobile.tsx
new file mode 100644
--- /dev/null
+++ b/components/interview/InterviewSetupMobile.tsx
@@ -0,0 +1,119 @@
+'use client'
+
+import { useEffect, useRef, useState } from 'react'
+import type { TouchEvent } from 'react'
+import { SectionHeader, TalentryButton, TalentryCard } from '@/components/ui'
+import type { AppLanguage } from '@/types/auth'
+import { INTERVIEWERS, MOBILE_COPY } from './interview-setup-config'
+import type { SetupChanges, SetupCopy, SetupValues } from './interview-setup-config'
+
+interface InterviewSetupMobileProps {
+  copy: SetupCopy
+  uiLanguage: AppLanguage
+  values: SetupValues
+  changes: SetupChanges
+}
+
+export default function InterviewSetupMobile({ copy, uiLanguage, values, changes }: InterviewSetupMobileProps) {
+  const [activePanel, setActivePanel] = useState(0)
+  const viewport = useRef<HTMLDivElement>(null)
+  const panels = useRef<Array<HTMLElement | null>>([])
+  const touchStart = useRef<{ x: number; y: number } | null>(null)
+  const moveFocus = useRef(false)
+  const mobileCopy = MOBILE_COPY[uiLanguage]
+
+  useEffect(() => {
+    if (viewport.current) viewport.current.scrollTop = 0
+    if (moveFocus.current) panels.current[activePanel]?.focus({ preventScroll: true })
+    moveFocus.current = false
+  }, [activePanel])
+
+  function navigate(index: number) {
+    const next = Math.max(0, Math.min(1, index))
+    if (next === activePanel) return
+    moveFocus.current = !!panels.current[activePanel]?.contains(document.activeElement)
+    setActivePanel(next)
+  }
+
+  function startSwipe(event: TouchEvent<HTMLDivElement>) {
+    touchStart.current = null
+    const target = event.target
+    if (event.touches.length !== 1 || !(target instanceof Element) ||
+      target.closest('input, select, option, textarea, button, label, a, [contenteditable]') ||
+      window.getSelection()?.toString()) return
+    const touch = event.touches[0]
+    touchStart.current = { x: touch.clientX, y: touch.clientY }
+  }
+
+  function endSwipe(event: TouchEvent<HTMLDivElement>) {
+    const start = touchStart.current
+    touchStart.current = null
+    if (!start || event.touches.length || event.changedTouches.length !== 1 || window.getSelection()?.toString()) return
+    const touch = event.changedTouches[0]
+    const dx = touch.clientX - start.x
+    const dy = touch.clientY - start.y
+    if (Math.abs(dx) >= 60 && Math.abs(dx) > Math.abs(dy) * 1.5) navigate(activePanel + (dx < 0 ? 1 : -1))
+  }
+
+  function selectField<Key extends 'persona' | 'interviewLanguage' | 'level' | 'interviewType'>(
+    key: Key, label: string, options: ReadonlyArray<readonly [SetupValues[Key], string]>,
+  ) {
+    return <div className="talentry-setup-field">
+      <label htmlFor={`setup-mobile-${key}`}>{label}</label>
+      <select id={`setup-mobile-${key}`} value={values[key]}
+        onChange={event => changes[key](event.target.value as SetupValues[Key])}>
+        {options.map(([value, text]) => <option key={value} value={value}>{text}</option>)}
+      </select>
+    </div>
+  }
+
+  return <>
+    <div className="talentry-setup-mobile-viewport" ref={viewport} onTouchStart={startSwipe}
+      onTouchMove={event => { if (event.touches.length !== 1) touchStart.current = null }}
+      onTouchEnd={endSwipe} onTouchCancel={() => { touchStart.current = null }}>
+      <section id="setup-mobile-panel-0" className="talentry-setup-mobile-panel" hidden={activePanel !== 0}
+        aria-label={mobileCopy.panels[0]} tabIndex={-1} ref={node => { panels.current[0] = node }}>
+        <SectionHeader className="talentry-setup-intro" headingAs="h1" title={copy.title} description={copy.description} />
+        <TalentryCard className="talentry-setup-interviewers" surface="lavender">
+          <fieldset>
+            <legend>{copy.interviewerLegend}</legend>
+            <div className="talentry-setup-interviewer-list">
+              {INTERVIEWERS.map(option => <div className="talentry-setup-interviewer-option" key={option.id}>
+                <input id={`setup-interviewer-${option.id}`} type="radio" name="interviewer" value={option.id}
+                  checked={values.interviewer === option.id} onChange={() => changes.interviewer(option.id)} />
+                <label htmlFor={`setup-interviewer-${option.id}`}>
+                  <img alt={option.name} src={option.photo} />
+                  <span className="talentry-setup-interviewer-option__identity"><strong>{option.name}</strong><span>{option.role}</span></span>
+                  <span className="talentry-setup-interviewer-option__selected" aria-hidden="true">✓ {copy.selected}</span>
+                </label>
+              </div>)}
+            </div>
+          </fieldset>
+        </TalentryCard>
+        {selectField('persona', copy.persona, [['friendly', copy.friendly], ['formal', copy.formal], ['tough', copy.tough], ['curious', copy.curious]])}
+        {selectField('interviewLanguage', copy.interviewLanguage, [['tr', 'Türkçe'], ['en', 'English'], ['de', 'Deutsch']])}
+      </section>
+      <section id="setup-mobile-panel-1" className="talentry-setup-mobile-panel" hidden={activePanel !== 1}
+        aria-labelledby="setup-mobile-settings-heading" tabIndex={-1} ref={node => { panels.current[1] = node }}>
+        <h1 id="setup-mobile-settings-heading">{mobileCopy.panels[1]}</h1>
+        {(['role', 'company'] as const).map(key => <div className="talentry-setup-field" key={key}>
+          <label htmlFor={`setup-mobile-${key}`}>{copy[key]} <span>{copy.optional}</span></label>
+          <input id={`setup-mobile-${key}`} type="text" value={values[key]} placeholder={copy[`${key}Placeholder`]}
+            onChange={event => changes[key](event.target.value)} />
+        </div>)}
+        {selectField('level', copy.level, [['junior', copy.junior], ['mid', copy.mid], ['senior', copy.senior]])}
+        {selectField('interviewType', copy.interviewType, [['behavioral', copy.behavioral], ['technical', copy.technical], ['mixed', copy.mixed], ['case', copy.caseStudy]])}
+        <TalentryButton className="talentry-setup-submit" size="large" type="submit">
+          <span>{copy.start}</span><span aria-hidden="true">→</span>
+        </TalentryButton>
+      </section>
+    </div>
+    <nav className="talentry-setup-mobile-pager" aria-label={mobileCopy.pager}>
+      {mobileCopy.panels.map((label, index) => <button key={index} type="button"
+        aria-label={`${label}, ${mobileCopy.positions[index]}`} aria-controls={`setup-mobile-panel-${index}`}
+        aria-current={activePanel === index ? 'step' : undefined} onClick={() => navigate(index)}>
+        <span aria-hidden="true" />
+      </button>)}
+    </nav>
+  </>
+}
```
```diff
diff --git a/components/interview/interview-setup-config.ts b/components/interview/interview-setup-config.ts
new file mode 100644
--- /dev/null
+++ b/components/interview/interview-setup-config.ts
@@ -0,0 +1,119 @@
+import type { AppLanguage } from '@/types/auth'
+
+export type InterviewerId = 'f' | 'm'
+export type InterviewLevel = 'junior' | 'mid' | 'senior'
+export type InterviewType = 'behavioral' | 'technical' | 'mixed' | 'case'
+export type InterviewPersona = 'friendly' | 'formal' | 'tough' | 'curious'
+
+export type SetupCopy = {
+  eyebrow: string
+  title: string
+  description: string
+  interviewerLegend: string
+  interviewerHelp: string
+  selected: string
+  configurationTitle: string
+  configurationDescription: string
+  role: string
+  rolePlaceholder: string
+  company: string
+  companyPlaceholder: string
+  level: string
+  interviewType: string
+  persona: string
+  interviewLanguage: string
+  optional: string
+  start: string
+  backToDashboard: string
+  junior: string
+  mid: string
+  senior: string
+  behavioral: string
+  technical: string
+  mixed: string
+  caseStudy: string
+  friendly: string
+  formal: string
+  tough: string
+  curious: string
+}
+
+export const UI_LANGUAGE_STORAGE_KEY = 'interviewai_uilang'
+
+export const INTERVIEWERS = [
+  {
+    id: 'f',
+    name: 'Sarah Chen',
+    role: 'Sr. HR Manager',
+    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=face',
+  },
+  {
+    id: 'm',
+    name: 'Marcus Reid',
+    role: 'Tech Lead',
+    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop&crop=face',
+  },
+] as const
+
+export const COPY: Record<AppLanguage, SetupCopy> = {
+  tr: {
+    eyebrow: 'Mülakat hazırlığı',
+    title: 'Bir sonraki görüşmene hazırlan.',
+    description: 'Mülakatçını ve görüşme tercihlerini seç. Hazır olduğunda yapay zekâ destekli görüşmeni başlat.',
+    interviewerLegend: 'Mülakatçını seç', interviewerHelp: 'Pratik tarzına uygun görüşmeciyi seç.', selected: 'Seçildi',
+    configurationTitle: 'Görüşme ayarları', configurationDescription: 'Deneyimi hedeflediğin role göre şekillendir.',
+    role: 'Hedef pozisyon', rolePlaceholder: 'Örn. Product Manager', company: 'Şirket / sektör', companyPlaceholder: 'Örn. Fintech',
+    level: 'Kariyer seviyesi', interviewType: 'Mülakat türü', persona: 'Mülakatçı tarzı', interviewLanguage: 'Mülakat dili',
+    optional: 'İsteğe bağlı', start: 'Mülakatı Başlat', backToDashboard: "Dashboard'a Dön",
+    junior: 'Junior (0–2 yıl)', mid: 'Mid-level (2–5 yıl)', senior: 'Senior (5+ yıl)',
+    behavioral: 'Davranışsal / İK', technical: 'Teknik', mixed: 'Karma', caseStudy: 'Vaka Analizi',
+    friendly: 'Arkadaşça', formal: 'Profesyonel', tough: 'Zorlu', curious: 'Analitik',
+  },
+  en: {
+    eyebrow: 'Interview preparation',
+    title: 'Prepare for your next interview.',
+    description: 'Choose your interviewer and session preferences. Start your AI-powered interview when you are ready.',
+    interviewerLegend: 'Choose your interviewer', interviewerHelp: 'Select the interviewer who fits your practice style.', selected: 'Selected',
+    configurationTitle: 'Interview settings', configurationDescription: 'Shape the experience around the role you are targeting.',
+    role: 'Target role', rolePlaceholder: 'e.g. Product Manager', company: 'Company / sector', companyPlaceholder: 'e.g. Fintech',
+    level: 'Career level', interviewType: 'Interview type', persona: 'Interviewer persona', interviewLanguage: 'Interview language',
+    optional: 'Optional', start: 'Start Interview', backToDashboard: 'Back to Dashboard',
+    junior: 'Junior (0–2 years)', mid: 'Mid-level (2–5 years)', senior: 'Senior (5+ years)',
+    behavioral: 'Behavioral / HR', technical: 'Technical', mixed: 'Mixed', caseStudy: 'Case Study',
+    friendly: 'Friendly', formal: 'Professional', tough: 'Tough', curious: 'Analytical',
+  },
+  de: {
+    eyebrow: 'Interviewvorbereitung',
+    title: 'Bereite dich auf dein nächstes Gespräch vor.',
+    description: 'Wähle Interviewer und Gesprächseinstellungen. Starte dein KI-gestütztes Interview, wenn du bereit bist.',
+    interviewerLegend: 'Interviewer auswählen', interviewerHelp: 'Wähle die Person, die zu deinem Übungsstil passt.', selected: 'Ausgewählt',
+    configurationTitle: 'Gesprächseinstellungen', configurationDescription: 'Richte das Erlebnis auf deine Zielposition aus.',
+    role: 'Zielposition', rolePlaceholder: 'z. B. Product Manager', company: 'Unternehmen / Branche', companyPlaceholder: 'z. B. Fintech',
+    level: 'Karrierestufe', interviewType: 'Gesprächsart', persona: 'Interviewer-Stil', interviewLanguage: 'Gesprächssprache',
+    optional: 'Optional', start: 'Interview starten', backToDashboard: 'Zurück zum Dashboard',
+    junior: 'Junior (0–2 Jahre)', mid: 'Mid-level (2–5 Jahre)', senior: 'Senior (5+ Jahre)',
+    behavioral: 'Verhalten / HR', technical: 'Technisch', mixed: 'Gemischt', caseStudy: 'Fallstudie',
+    friendly: 'Freundlich', formal: 'Professionell', tough: 'Anspruchsvoll', curious: 'Analytisch',
+  },
+}
+
+export const LANGUAGE_LABELS: Record<AppLanguage, string> = { tr: 'TR', en: 'EN', de: 'DE' }
+export const LANGUAGE_NAMES: Record<AppLanguage, string> = { tr: 'Türkçe', en: 'English', de: 'Deutsch' }
+
+export const MOBILE_COPY: Record<AppLanguage, { panels: readonly [string, string]; pager: string; positions: readonly [string, string] }> = {
+  tr: { panels: ['Mülakatçı ve dil', 'Görüşme ayarları'], pager: 'Mülakat hazırlığı bölümleri', positions: ['1. bölüm / 2', '2. bölüm / 2'] },
+  en: { panels: ['Interviewer and language', 'Interview settings'], pager: 'Interview setup panels', positions: ['Panel 1 of 2', 'Panel 2 of 2'] },
+  de: { panels: ['Interviewer und Sprache', 'Gesprächseinstellungen'], pager: 'Bereiche der Interviewvorbereitung', positions: ['Bereich 1 von 2', 'Bereich 2 von 2'] },
+}
+
+export interface SetupValues {
+  interviewer: InterviewerId
+  role: string
+  company: string
+  level: InterviewLevel
+  interviewType: InterviewType
+  persona: InterviewPersona
+  interviewLanguage: AppLanguage
+}
+
+export type SetupChanges = { [Key in keyof SetupValues]: (value: SetupValues[Key]) => void }
```
```diff
diff --git a/docs/01_Engineering/Sprint_INTERVIEW_SETUP_MOBILE_20260917_Summary.md b/docs/01_Engineering/Sprint_INTERVIEW_SETUP_MOBILE_20260917_Summary.md
new file mode 100644
--- /dev/null
+++ b/docs/01_Engineering/Sprint_INTERVIEW_SETUP_MOBILE_20260917_Summary.md
@@ -0,0 +1,15 @@
+# Sprint INTERVIEW_SETUP_MOBILE_20260917 Summary
+
+- Title: Interview Setup mobile two-panel presentation
+- Branch: feature/auth-foundation
+- HEAD: 3dbaca7c9d9ebf3407e4ca1a0502ed3d1a773295
+- Status: Implementation and static validation complete; awaiting approval.
+- Goal: Exactly two mobile panels, preserving defaults, optional fields, parent state, submission and desktop/tablet behavior.
+- Modified: components/interview/InterviewSetupForm.tsx; styles/talentry-interview-setup.css.
+- Created: components/interview/InterviewSetupMobile.tsx; components/interview/interview-setup-config.ts; this Summary; Sprint_INTERVIEW_SETUP_MOBILE_20260917_Engineering_Report.md.
+- Completed: compact interviewer grid, two controlled panels, swipe/dot navigation, localized pager, single scrolling viewport and stable header/footer.
+- Validation: npx.cmd tsc --noEmit exited 0, no TypeScript diagnostics. Generated tsconfig.tsbuildinfo removed. git diff --check exited 0. Complete implementation diff reviewed.
+- Notices: npm update notice 11.16.0 -> 12.0.2; Git LF-to-CRLF warnings for the two modified source files. No package changes performed.
+- Pending: runtime 390x844 acceptance, desktop/tablet regression, keyboard/accessibility checks and production build.
+- Risks: initial hydration presentation change; virtual-keyboard/browser viewport behavior unverified. Returning to mobile resets the panel to 1, retaining parent values.
+- Approval: Not yet approved. No staging, commit, push, Project Memory update or build.
```

## 13. Final status snapshot
```
 M components/interview/InterviewSetupForm.tsx
 M styles/talentry-interview-setup.css
?? components/interview/InterviewSetupMobile.tsx
?? components/interview/interview-setup-config.ts
?? docs/01_Engineering/Sprint_INTERVIEW_SETUP_MOBILE_20260917_Engineering_Report.md
?? docs/01_Engineering/Sprint_INTERVIEW_SETUP_MOBILE_20260917_Summary.md
```
