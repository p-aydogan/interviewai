# Sprint DASHBOARD_RECENT_HISTORY_20260916 Engineering Report

## Follow-up: Final Mobile Page Rebalance

Status: implemented, static validation passed, approval/runtime review pending. This supersedes the prior Menu / Dashboard / Actions grouping and initial index 1. Continued from the existing dirty working tree on feature/auth-foundation at c36c15a47d00e581b4685c50da41729b9560b85c.

Exact changed files in this follow-up: components/dashboard/DashboardContainer.tsx; components/dashboard/DashboardMobile.tsx; components/dashboard/dashboard-copy.ts; this Engineering Report; Sprint_DASHBOARD_RECENT_HISTORY_20260916_Summary.md. No new files, no stylesheet changes.

Final architecture at <=640px:
1. Home/Menu: read-only Search, compact Welcome, existing Sidebar-derived mobile menu in that order. Initial active index is 0. Current Dashboard remains selected; unavailable destinations remain noninteractive with no invented routes.
2. Recent Interviews only: existing heading/latest-five caption, persisted rows/metadata/Result links, loading, empty, error and retry presentation.
3. Actions: unchanged Quick Actions/Start New Interview link to /interview/setup, Recommended Jobs, AI Insights, Daily Tip and Premium placeholders.

Page 1 balancing uses the existing natural-height column with 12px gaps and 16px card padding. Search and Welcome now precede the menu, moving it lower through meaningful content rather than artificial vertical offsets, card stretching or viewport-based menu height. All menu items remain accessible via the existing single content scroll area if necessary. No new token or styling value needed.

Fixed-footer geometry is unchanged: bounded 100dvh shell, consistent header, flexing content viewport, nonshrinking sibling pager, safe bottom spacing and no duplicate bottom navigation. The existing >=44px dot controls, aria-current/aria-controls, focus handling, 60px horizontal-intent swipe, index clamp and scroll-to-top on navigation remain intact. No change to public props/types.
Localized labels now read TR Ana Sayfa / Son Mülakatlar / İşlemler; EN Home / Recent Interviews / Actions; DE Startseite / Letzte Interviews / Aktionen. Existing interviewai_uilang preference and untranslated persisted values preserved.

History hook/API/auth are untouched. The same single parent hook supplies state to presentational compositions; changing the active page cannot alter its dependencies or initiate a fetch. Page 2 uses the shared viewport's one vertical scroll region; pager never participates in scrolling. Desktop/tablet above 640px retain identical grouping/markup and CSS because edits are limited to mobile pages, mobile initial state and pager copy. Result, Interview, Sidebar/Topbar source, shared styles, Project Memory and package files untouched.

Static validation: npx.cmd tsc --noEmit exit 0, no TypeScript diagnostics; npm update notice 11.16.0 -> 12.0.2 only. Generated tsconfig.tsbuildinfo removed. git diff --check exit 0; existing LF-to-CRLF warnings for the eight previously modified tracked files. Complete follow-up diff reviewed below. No production build or runtime session run, per request.
Git path inventory unchanged from start: eight modified tracked source files and eight untracked paths (six source files and two reports), none staged. Branch/HEAD unchanged. No reset/restore/stash/stage/commit/push.

Runtime acceptance still needed at 390x844: Page 1 initially active; balanced Search/Welcome/Menu and all menu rows reachable; same pager position on all three pages; Page 2 five-row overflow and existing states; Page 3 Setup navigation; no fetch on pager-only navigation; desktop/tablet regression confirmation. Static checks are not a claim of visual acceptance. Approval pending; stop here.

### Complete rebalance diff against the preceding working tree

```diff
diff --git a/components/dashboard/DashboardContainer.tsx b/components/dashboard/DashboardContainer.tsx
--- a/components/dashboard/DashboardContainer.tsx
+++ b/components/dashboard/DashboardContainer.tsx
@@ -50,5 +50,7 @@
-          <Sidebar key="menu" copy={copy} mobile />,
-          <div key="home" className="talentry-dashboard-mobile-cards">
-            <input className="talentry-dashboard-page-search" aria-label={copy.search}
-              placeholder={copy.search} readOnly />
-            {renderCard('welcome')}
+          <div key="home" className="talentry-dashboard-mobile-cards">
+            <input className="talentry-dashboard-page-search" aria-label={copy.search}
+              placeholder={copy.search} readOnly />
+            {renderCard('welcome')}
+            <Sidebar copy={copy} mobile />
+          </div>,
+          <div key="recent" className="talentry-dashboard-mobile-cards">

diff --git a/components/dashboard/DashboardMobile.tsx b/components/dashboard/DashboardMobile.tsx
--- a/components/dashboard/DashboardMobile.tsx
+++ b/components/dashboard/DashboardMobile.tsx
@@ -13,1 +13,1 @@
-  const [activePanel, setActivePanel] = useState(1)
+  const [activePanel, setActivePanel] = useState(0)

diff --git a/components/dashboard/dashboard-copy.ts b/components/dashboard/dashboard-copy.ts
--- a/components/dashboard/dashboard-copy.ts
+++ b/components/dashboard/dashboard-copy.ts
@@ -35,29 +35,29 @@
-    panels: ['Menü', 'Panel', 'İşlemler'],
-    interviewTypes: { behavioral: 'Davranışsal / İK', technical: 'Teknik', mixed: 'Karma', case: 'Vaka Analizi' },
-  },
-  en: {
-    overview: 'Dashboard overview', navigation: 'Dashboard navigation', mobileNavigation: 'Mobile navigation placeholder',
-    welcome: 'Welcome', quick: 'Quick Actions', recent: 'Recent Interviews', jobs: 'Recommended Jobs',
-    insights: 'AI Insights', tip: 'Daily Tip', premium: 'Premium',
-    start: 'Start New Interview', latest: 'Latest 5', loading: 'Loading interview history…',
-    empty: 'No saved interviews yet', emptyHelp: 'Your completed and saved interviews will appear here.',
-    first: 'Start your first interview', error: 'Interview history could not be loaded',
-    errorHelp: 'Retry to view your saved interviews.', retry: 'Retry', score: 'Score', duration: 'Duration',
-    viewResult: 'View result', notProvided: 'Not provided', search: 'Search',
-    notifications: 'Notifications placeholder', profile: 'Profile placeholder',
-    nav: ['Dashboard', 'Jobs & Opportunities', 'My Interviews', 'AI Coach', 'Reports', 'Saved Roles', 'Settings', 'Premium'],
-    panels: ['Menu', 'Dashboard', 'Actions'],
-    interviewTypes: { behavioral: 'Behavioral / HR', technical: 'Technical', mixed: 'Mixed', case: 'Case Study' },
-  },
-  de: {
-    overview: 'Dashboard-Übersicht', navigation: 'Dashboard-Navigation', mobileNavigation: 'Platzhalter für mobile Navigation',
-    welcome: 'Willkommen', quick: 'Schnellzugriff', recent: 'Letzte Interviews', jobs: 'Empfohlene Stellen',
-    insights: 'KI-Einblicke', tip: 'Tipp des Tages', premium: 'Premium',
-    start: 'Neues Interview starten', latest: 'Letzte 5', loading: 'Interviewverlauf wird geladen…',
-    empty: 'Noch keine gespeicherten Interviews', emptyHelp: 'Deine abgeschlossenen und gespeicherten Interviews erscheinen hier.',
-    first: 'Starte dein erstes Interview', error: 'Interviewverlauf konnte nicht geladen werden',
-    errorHelp: 'Versuche erneut, deine gespeicherten Interviews zu laden.', retry: 'Erneut versuchen', score: 'Punktzahl', duration: 'Dauer',
-    viewResult: 'Ergebnis ansehen', notProvided: 'Nicht angegeben', search: 'Suchen',
-    notifications: 'Platzhalter für Benachrichtigungen', profile: 'Profilplatzhalter',
-    nav: ['Dashboard', 'Stellen & Chancen', 'Meine Interviews', 'KI-Coach', 'Berichte', 'Gespeicherte Stellen', 'Einstellungen', 'Premium'],
-    panels: ['Menü', 'Dashboard', 'Aktionen'],
+    panels: ['Ana Sayfa', 'Son Mülakatlar', 'İşlemler'],
+    interviewTypes: { behavioral: 'Davranışsal / İK', technical: 'Teknik', mixed: 'Karma', case: 'Vaka Analizi' },
+  },
+  en: {
+    overview: 'Dashboard overview', navigation: 'Dashboard navigation', mobileNavigation: 'Mobile navigation placeholder',
+    welcome: 'Welcome', quick: 'Quick Actions', recent: 'Recent Interviews', jobs: 'Recommended Jobs',
+    insights: 'AI Insights', tip: 'Daily Tip', premium: 'Premium',
+    start: 'Start New Interview', latest: 'Latest 5', loading: 'Loading interview history…',
+    empty: 'No saved interviews yet', emptyHelp: 'Your completed and saved interviews will appear here.',
+    first: 'Start your first interview', error: 'Interview history could not be loaded',
+    errorHelp: 'Retry to view your saved interviews.', retry: 'Retry', score: 'Score', duration: 'Duration',
+    viewResult: 'View result', notProvided: 'Not provided', search: 'Search',
+    notifications: 'Notifications placeholder', profile: 'Profile placeholder',
+    nav: ['Dashboard', 'Jobs & Opportunities', 'My Interviews', 'AI Coach', 'Reports', 'Saved Roles', 'Settings', 'Premium'],
+    panels: ['Home', 'Recent Interviews', 'Actions'],
+    interviewTypes: { behavioral: 'Behavioral / HR', technical: 'Technical', mixed: 'Mixed', case: 'Case Study' },
+  },
+  de: {
+    overview: 'Dashboard-Übersicht', navigation: 'Dashboard-Navigation', mobileNavigation: 'Platzhalter für mobile Navigation',
+    welcome: 'Willkommen', quick: 'Schnellzugriff', recent: 'Letzte Interviews', jobs: 'Empfohlene Stellen',
+    insights: 'KI-Einblicke', tip: 'Tipp des Tages', premium: 'Premium',
+    start: 'Neues Interview starten', latest: 'Letzte 5', loading: 'Interviewverlauf wird geladen…',
+    empty: 'Noch keine gespeicherten Interviews', emptyHelp: 'Deine abgeschlossenen und gespeicherten Interviews erscheinen hier.',
+    first: 'Starte dein erstes Interview', error: 'Interviewverlauf konnte nicht geladen werden',
+    errorHelp: 'Versuche erneut, deine gespeicherten Interviews zu laden.', retry: 'Erneut versuchen', score: 'Punktzahl', duration: 'Dauer',
+    viewResult: 'Ergebnis ansehen', notProvided: 'Nicht angegeben', search: 'Suchen',
+    notifications: 'Platzhalter für Benachrichtigungen', profile: 'Profilplatzhalter',
+    nav: ['Dashboard', 'Stellen & Chancen', 'Meine Interviews', 'KI-Coach', 'Berichte', 'Gespeicherte Stellen', 'Einstellungen', 'Premium'],
+    panels: ['Startseite', 'Letzte Interviews', 'Aktionen'],
```


## Follow-up: Final Mobile Dashboard Information Architecture

Status: implemented and statically checked; awaiting approval and 390x844 runtime review. This final architecture supersedes the earlier Home/History/Other grouping and content-driven pager position documented below. Work continued from the existing dirty tree on feature/auth-foundation, HEAD c36c15a47d00e581b4685c50da41729b9560b85c.

### Exact scope and responsibilities

Modified components/dashboard/DashboardContainer.tsx (shared card renderer and responsive compositions), components/dashboard/Sidebar.tsx (optional mobile presentation of the same menu), components/dashboard/dashboard-copy.ts (final localized pager labels), and styles/talentry-dashboard.css (stable mobile layout, menu/search styling, navigation visibility).
Created components/dashboard/DashboardMobile.tsx (presentation-only page state, swipe and pager).
Updated this Engineering Report and Sprint_DASHBOARD_RECENT_HISTORY_20260916_Summary.md as explicitly requested. No other files changed during this follow-up.

### Final composition and public interfaces

Page 1: existing Sidebar items and order, navy surface, Dashboard selected, seven unavailable items still noninteractive aria-disabled containers with no routes.
Page 2: read-only search, Welcome, Recent Interviews with existing metadata/links and loading/empty/error/retry states.
Page 3: Quick Actions containing the existing Start New Interview link, Recommended Jobs, AI Insights, Daily Tip, Premium; no invented data.
DashboardMobile receives a tuple of three ReactNode pages, a tuple of three localized labels, and navigationLabel. It starts at index 1. Sidebar gains optional mobile:boolean, default false; desktop markup/classes remain unchanged by default.

### Fixed footer, scrolling and accessibility

The mobile 100dvh normal-flow shell retains the header and allocates all remaining space to a flex mobile region. Its content viewport has flex:1/min-height:0 and is the sole vertical scroll area; pager uses flex:none outside it. Footer position is independent of content height. Safe-area bottom padding remains; the old navigation footprint reservation is removed because the decorative bottom navigation is hidden only at <=640px. Topbar search is also hidden at <=640px, including the exact 640px boundary; mobile search lives only on Page 2.

Inactive pages use hidden/display:none and stay mounted. The viewport scrolls to the top on an actual page switch. All cards remain content-sized, wrap long text, and do not stretch to fill the screen. Exactly three localized semantic dot buttons retain 44px targets, visible focus, aria-current=step and matching aria-controls IDs. Swipes require >=60px and horizontal displacement >1.5 times vertical displacement, clamp indices 0..2, and cancel multitouch/cancelled gestures. If a swipe hides the focused link, focus transfers to the newly visible named page. Dot navigation retains button focus. No animation is added.

### Data and desktop preservation

useInterviewHistory remains called exactly once in DashboardContainer; its file is untouched. Mobile page state lives below that container and is absent from fetch dependencies. Both responsive presentations receive the same data/status/retry values; neither presentation performs data access. The hidden duplicate presentation is a small DOM cost, explicitly chosen to preserve existing desktop card order, sibling grouping, nth-child surfaces and grid behavior. RecentInterviews is presentational and has no fetch effect. No new API/Supabase/AI operation or history mutation.

Above 640px, the entire mobile component is display:none. Existing desktop wrappers, card sequence, grid classes, sidebar, search and tablet navigation rules are retained. DashboardLayout and Topbar source files did not require edits. Root routing, API, auth, history hook, Result, Interview, shared primitives/tokens, dependencies and Project Memory remain untouched.

Localization continues using the existing guarded interviewai_uilang preference. Pager labels: TR Menü/Panel/İşlemler; EN Menu/Dashboard/Actions; DE Menü/Dashboard/Aktionen. Persisted user-entered text and interview language remain unchanged. Search is still read-only.

### Validation, Git status and remaining acceptance

npx.cmd tsc --noEmit exited 0 without diagnostics. Generated tsconfig.tsbuildinfo removed. npm emitted only its existing update notice (11.16.0 -> 12.0.2). git diff --check exited 0; Git emitted known LF-to-CRLF warnings for the eight already-modified tracked source files. Complete follow-up diffs inspected below against the immediately preceding working tree, including the new component.
No production build or runtime session was run, as requested. Static analysis supports the layout/data boundaries but does not establish visual acceptance.

Final Git inventory: eight modified tracked source files and eight untracked files (six source files, two reports). DashboardMobile.tsx is the only newly added path in this follow-up. Branch/HEAD unchanged; nothing staged or committed.
Modified tracked paths: app/api/interviews/route.ts; app/result/result.module.css; components/dashboard/DashboardContainer.tsx; components/dashboard/DashboardLayout.tsx; components/dashboard/Sidebar.tsx; components/dashboard/Topbar.tsx; components/result/ResultShell.tsx; components/result/result-copy.ts.
Untracked paths: components/dashboard/DashboardMobile.tsx; components/dashboard/RecentInterviews.tsx; components/dashboard/dashboard-copy.ts; components/dashboard/useInterviewHistory.ts; styles/talentry-dashboard.css; types/interviews.ts; the two Dashboard sprint reports.

Pending runtime checks: 390x844 initial middle dot; right swipe Menu; left swipes Dashboard/Actions; identical pager coordinates across pages; five-row content scrolling; no duplicate bottom navigation; keyboard focus; TR/EN/DE long labels; 640/641 boundary and tablet/desktop preservation; no request caused solely by page changes; history and Setup links. Provider/cache/auth acceptance from earlier stages is not re-claimed here. Read-only search, unavailable destinations and placeholder modules remain deliberate limitations.

Approval is pending. Stop; no build, memory update, next stage, stage/commit or push authorized.

### Complete follow-up source diffs

```diff
diff --git a/components/dashboard/DashboardContainer.tsx b/components/dashboard/DashboardContainer.tsx
--- a/components/dashboard/DashboardContainer.tsx
+++ b/components/dashboard/DashboardContainer.tsx
@@ -4,62 +4,58 @@
-import { useContext, useRef, useState } from 'react'
-import type { TouchEvent } from 'react'
-import { DashboardLanguageContext } from './DashboardLayout'
-import { DASHBOARD_COPY } from './dashboard-copy'
-import RecentInterviews from './RecentInterviews'
-import { useInterviewHistory } from './useInterviewHistory'
-
-const DASHBOARD_CARDS = ['welcome', 'quick', 'recent', 'jobs', 'insights', 'tip', 'premium'] as const
-
-export default function DashboardContainer() {
-  const language = useContext(DashboardLanguageContext)
-  const copy = DASHBOARD_COPY[language]
-  const { state, retry } = useInterviewHistory()
-  const [activePanel, setActivePanel] = useState(0)
-  const touchStart = useRef<{ x: number; y: number } | null>(null)
-  function endSwipe(event: TouchEvent<HTMLDivElement>) {
-    const start = touchStart.current
-    touchStart.current = null
-    if (!start || event.changedTouches.length !== 1) return
-    const touch = event.changedTouches[0]
-    const dx = touch.clientX - start.x
-    const dy = touch.clientY - start.y
-    if (Math.abs(dx) >= 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
-      setActivePanel(index => Math.max(0, Math.min(2, index + (dx < 0 ? 1 : -1))))
-    }
-  }
-  const panels = [
-    ['welcome', 'quick'],
-    ['recent'],
-    ['jobs', 'insights', 'tip', 'premium'],
-  ] as const
-  return (
-    <section className="talentry-dashboard-container" aria-label={copy.overview}>
-      <div className="talentry-dashboard-mobile-viewport" onTouchStart={event => {
-        const touch = event.touches[0]
-        touchStart.current = event.touches.length === 1 ? { x: touch.clientX, y: touch.clientY } : null
-      }} onTouchEnd={endSwipe} onTouchCancel={() => { touchStart.current = null }}>
-        <div className="talentry-dashboard-mobile-track" data-panel={activePanel}>
-          {panels.map((panel, panelIndex) => <div className="talentry-dashboard-mobile-panel" id={`dashboard-panel-${panelIndex}`} key={panelIndex} data-active={activePanel === panelIndex}>
-            {panel.map(variant => (
-        <article
-          className={`talentry-dashboard-card talentry-dashboard-card-${variant}`}
-          key={variant}
-        >
-          <h2 className="talentry-dashboard-card-title">{copy[variant]}</h2>
-          {variant === 'quick' && <Link className="talentry-button talentry-button--primary talentry-button--large talentry-history-action"
-            href="/interview/setup">{copy.start}</Link>}
-          {variant === 'recent' && <>
-            <p className="talentry-history-caption">{copy.latest}</p>
-            <RecentInterviews state={state} retry={retry} copy={copy} language={language} />
-          </>}
-        </article>
-            ))}
-          </div>)}
-        </div>
-      </div>
-      <nav className="talentry-dashboard-pager" aria-label={copy.overview}>
-        {copy.panels.map((label, index) => <button key={label} type="button" aria-label={label}
-          aria-current={activePanel === index ? 'step' : undefined} aria-controls={`dashboard-panel-${index}`}
-          onClick={() => setActivePanel(index)}><span aria-hidden="true" /></button>)}
-      </nav>
-    </section>
+import { useContext } from 'react'
+import { DashboardLanguageContext } from './DashboardLayout'
+import { DASHBOARD_COPY } from './dashboard-copy'
+import DashboardMobile from './DashboardMobile'
+import RecentInterviews from './RecentInterviews'
+import Sidebar from './Sidebar'
+import { useInterviewHistory } from './useInterviewHistory'
+
+const DESKTOP_GROUPS = [
+  ['welcome', 'quick'], ['recent'], ['jobs', 'insights', 'tip', 'premium'],
+] as const
+type CardVariant = typeof DESKTOP_GROUPS[number][number]
+
+export default function DashboardContainer() {
+  const language = useContext(DashboardLanguageContext)
+  const copy = DASHBOARD_COPY[language]
+  const { state, retry } = useInterviewHistory()
+
+  function renderCard(variant: CardVariant) {
+    return (
+      <article className={`talentry-dashboard-card talentry-dashboard-card-${variant}`} key={variant}>
+        <h2 className="talentry-dashboard-card-title">{copy[variant]}</h2>
+        {variant === 'quick' && <Link
+          className="talentry-button talentry-button--primary talentry-button--large talentry-history-action"
+          href="/interview/setup">{copy.start}</Link>}
+        {variant === 'recent' && <>
+          <p className="talentry-history-caption">{copy.latest}</p>
+          <RecentInterviews state={state} retry={retry} copy={copy} language={language} />
+        </>}
+      </article>
+    )
+  }
+
+  return (
+    <>
+      <section className="talentry-dashboard-container talentry-dashboard-desktop" aria-label={copy.overview}>
+        <div className="talentry-dashboard-mobile-viewport">
+          <div className="talentry-dashboard-mobile-track">
+            {DESKTOP_GROUPS.map((group, index) => (
+              <div className="talentry-dashboard-mobile-panel" key={index}>{group.map(renderCard)}</div>
+            ))}
+          </div>
+        </div>
+      </section>
+      <DashboardMobile labels={copy.panels} navigationLabel={copy.navigation}
+        pages={[
+          <Sidebar key="menu" copy={copy} mobile />,
+          <div key="home" className="talentry-dashboard-mobile-cards">
+            <input className="talentry-dashboard-page-search" aria-label={copy.search}
+              placeholder={copy.search} readOnly />
+            {renderCard('welcome')}
+            {renderCard('recent')}
+          </div>,
+          <div key="actions" className="talentry-dashboard-mobile-cards">
+            {(['quick', 'jobs', 'insights', 'tip', 'premium'] as const).map(renderCard)}
+          </div>,
+        ]} />
+    </>

diff --git a/components/dashboard/Sidebar.tsx b/components/dashboard/Sidebar.tsx
--- a/components/dashboard/Sidebar.tsx
+++ b/components/dashboard/Sidebar.tsx
@@ -25,5 +25,5 @@
-export default function Sidebar({ copy }: { copy: DashboardCopy }) {
-  const pathname = usePathname()
-
-  return (
-    <aside className="talentry-dashboard-sidebar">
+export default function Sidebar({ copy, mobile = false }: { copy: DashboardCopy; mobile?: boolean }) {
+  const pathname = usePathname()
+
+  return (
+    <aside className={mobile ? 'talentry-dashboard-menu-page' : 'talentry-dashboard-sidebar'}>

diff --git a/components/dashboard/dashboard-copy.ts b/components/dashboard/dashboard-copy.ts
--- a/components/dashboard/dashboard-copy.ts
+++ b/components/dashboard/dashboard-copy.ts
@@ -35,29 +35,29 @@
-    panels: ['Ana Panel', 'Son Mülakatlar', 'Diğer Bölümler'],
-    interviewTypes: { behavioral: 'Davranışsal / İK', technical: 'Teknik', mixed: 'Karma', case: 'Vaka Analizi' },
-  },
-  en: {
-    overview: 'Dashboard overview', navigation: 'Dashboard navigation', mobileNavigation: 'Mobile navigation placeholder',
-    welcome: 'Welcome', quick: 'Quick Actions', recent: 'Recent Interviews', jobs: 'Recommended Jobs',
-    insights: 'AI Insights', tip: 'Daily Tip', premium: 'Premium',
-    start: 'Start New Interview', latest: 'Latest 5', loading: 'Loading interview history…',
-    empty: 'No saved interviews yet', emptyHelp: 'Your completed and saved interviews will appear here.',
-    first: 'Start your first interview', error: 'Interview history could not be loaded',
-    errorHelp: 'Retry to view your saved interviews.', retry: 'Retry', score: 'Score', duration: 'Duration',
-    viewResult: 'View result', notProvided: 'Not provided', search: 'Search',
-    notifications: 'Notifications placeholder', profile: 'Profile placeholder',
-    nav: ['Dashboard', 'Jobs & Opportunities', 'My Interviews', 'AI Coach', 'Reports', 'Saved Roles', 'Settings', 'Premium'],
-    panels: ['Home', 'Recent Interviews', 'Other Sections'],
-    interviewTypes: { behavioral: 'Behavioral / HR', technical: 'Technical', mixed: 'Mixed', case: 'Case Study' },
-  },
-  de: {
-    overview: 'Dashboard-Übersicht', navigation: 'Dashboard-Navigation', mobileNavigation: 'Platzhalter für mobile Navigation',
-    welcome: 'Willkommen', quick: 'Schnellzugriff', recent: 'Letzte Interviews', jobs: 'Empfohlene Stellen',
-    insights: 'KI-Einblicke', tip: 'Tipp des Tages', premium: 'Premium',
-    start: 'Neues Interview starten', latest: 'Letzte 5', loading: 'Interviewverlauf wird geladen…',
-    empty: 'Noch keine gespeicherten Interviews', emptyHelp: 'Deine abgeschlossenen und gespeicherten Interviews erscheinen hier.',
-    first: 'Starte dein erstes Interview', error: 'Interviewverlauf konnte nicht geladen werden',
-    errorHelp: 'Versuche erneut, deine gespeicherten Interviews zu laden.', retry: 'Erneut versuchen', score: 'Punktzahl', duration: 'Dauer',
-    viewResult: 'Ergebnis ansehen', notProvided: 'Nicht angegeben', search: 'Suchen',
-    notifications: 'Platzhalter für Benachrichtigungen', profile: 'Profilplatzhalter',
-    nav: ['Dashboard', 'Stellen & Chancen', 'Meine Interviews', 'KI-Coach', 'Berichte', 'Gespeicherte Stellen', 'Einstellungen', 'Premium'],
-    panels: ['Startseite', 'Letzte Interviews', 'Weitere Bereiche'],
+    panels: ['Menü', 'Panel', 'İşlemler'],
+    interviewTypes: { behavioral: 'Davranışsal / İK', technical: 'Teknik', mixed: 'Karma', case: 'Vaka Analizi' },
+  },
+  en: {
+    overview: 'Dashboard overview', navigation: 'Dashboard navigation', mobileNavigation: 'Mobile navigation placeholder',
+    welcome: 'Welcome', quick: 'Quick Actions', recent: 'Recent Interviews', jobs: 'Recommended Jobs',
+    insights: 'AI Insights', tip: 'Daily Tip', premium: 'Premium',
+    start: 'Start New Interview', latest: 'Latest 5', loading: 'Loading interview history…',
+    empty: 'No saved interviews yet', emptyHelp: 'Your completed and saved interviews will appear here.',
+    first: 'Start your first interview', error: 'Interview history could not be loaded',
+    errorHelp: 'Retry to view your saved interviews.', retry: 'Retry', score: 'Score', duration: 'Duration',
+    viewResult: 'View result', notProvided: 'Not provided', search: 'Search',
+    notifications: 'Notifications placeholder', profile: 'Profile placeholder',
+    nav: ['Dashboard', 'Jobs & Opportunities', 'My Interviews', 'AI Coach', 'Reports', 'Saved Roles', 'Settings', 'Premium'],
+    panels: ['Menu', 'Dashboard', 'Actions'],
+    interviewTypes: { behavioral: 'Behavioral / HR', technical: 'Technical', mixed: 'Mixed', case: 'Case Study' },
+  },
+  de: {
+    overview: 'Dashboard-Übersicht', navigation: 'Dashboard-Navigation', mobileNavigation: 'Platzhalter für mobile Navigation',
+    welcome: 'Willkommen', quick: 'Schnellzugriff', recent: 'Letzte Interviews', jobs: 'Empfohlene Stellen',
+    insights: 'KI-Einblicke', tip: 'Tipp des Tages', premium: 'Premium',
+    start: 'Neues Interview starten', latest: 'Letzte 5', loading: 'Interviewverlauf wird geladen…',
+    empty: 'Noch keine gespeicherten Interviews', emptyHelp: 'Deine abgeschlossenen und gespeicherten Interviews erscheinen hier.',
+    first: 'Starte dein erstes Interview', error: 'Interviewverlauf konnte nicht geladen werden',
+    errorHelp: 'Versuche erneut, deine gespeicherten Interviews zu laden.', retry: 'Erneut versuchen', score: 'Punktzahl', duration: 'Dauer',
+    viewResult: 'Ergebnis ansehen', notProvided: 'Nicht angegeben', search: 'Suchen',
+    notifications: 'Platzhalter für Benachrichtigungen', profile: 'Profilplatzhalter',
+    nav: ['Dashboard', 'Stellen & Chancen', 'Meine Interviews', 'KI-Coach', 'Berichte', 'Gespeicherte Stellen', 'Einstellungen', 'Premium'],
+    panels: ['Menü', 'Dashboard', 'Aktionen'],

diff --git a/styles/talentry-dashboard.css b/styles/talentry-dashboard.css
--- a/styles/talentry-dashboard.css
+++ b/styles/talentry-dashboard.css
@@ -107,84 +107,128 @@
-
-@media (max-width: 640px) {
-  .talentry-dashboard-layout.talentry-dashboard-layout {
-    height: 100vh;
-    height: 100dvh;
-    min-height: 0;
-    overflow: hidden;
-  }
-
-  .talentry-dashboard-layout .talentry-dashboard-shell {
-    display: flex;
-    flex-direction: column;
-    height: 100%;
-    min-height: 0;
-  }
-
-  .talentry-dashboard-layout .talentry-dashboard-topbar { flex: none; }
-
-  .talentry-dashboard-layout .talentry-dashboard-main {
-    display: flex;
-    flex-direction: column;
-    flex: 1;
-    min-width: 0;
-    min-height: 0;
-    overflow: hidden;
-    /* Existing navigation is 66px high, inset 12px from the bottom. */
-    padding: var(--talentry-space-4) var(--talentry-space-4)
-      calc(78px + var(--talentry-space-3) + env(safe-area-inset-bottom, 0px));
-  }
-
-  .talentry-dashboard-main .talentry-dashboard-container {
-    display: flex;
-    flex-direction: column;
-    flex: 0 1 auto;
-    min-width: 0;
-    min-height: 0;
-    max-height: 100%;
-    gap: var(--talentry-space-3);
-  }
-
-  /* Only this viewport scrolls; the sibling pager never participates. */
-  .talentry-dashboard-mobile-viewport {
-    display: block;
-    flex: 0 1 auto;
-    min-width: 0;
-    min-height: 0;
-    overflow-x: hidden;
-    overflow-y: auto;
-    overscroll-behavior-y: contain;
-    padding: var(--talentry-space-1);
-  }
-
-  .talentry-dashboard-mobile-track { display: block; min-width: 0; }
-  .talentry-dashboard-mobile-panel { display: none; }
-  .talentry-dashboard-mobile-panel[data-active="true"] {
-    display: flex;
-    flex-direction: column;
-    gap: var(--talentry-space-3);
-    min-width: 0;
-  }
-
-  .talentry-dashboard-mobile-panel > .talentry-dashboard-card {
-    flex: none;
-    min-width: 0;
-    min-height: 0;
-    padding: var(--talentry-space-4);
-    overflow-wrap: anywhere;
-  }
-
-  .talentry-dashboard-mobile-panel .talentry-history-action {
-    min-height: var(--talentry-button-height-md);
-    padding-block: var(--talentry-space-2);
-  }
-
-  .talentry-dashboard-mobile-panel .talentry-dashboard-card-quick > .talentry-history-action {
-    margin-top: var(--talentry-space-3);
-  }
-
-  .talentry-dashboard-pager {
-    display: flex;
-    flex: none;
-    justify-content: center;
-    gap: var(--talentry-space-3);
-    padding: 0;
+.talentry-dashboard-mobile { display: none; }
+
+@media (max-width: 640px) {
+  .talentry-dashboard-layout.talentry-dashboard-layout {
+    height: 100vh;
+    height: 100dvh;
+    min-height: 0;
+    overflow: hidden;
+  }
+
+  .talentry-dashboard-layout .talentry-dashboard-shell {
+    display: flex;
+    flex-direction: column;
+    height: 100%;
+    min-height: 0;
+  }
+
+  .talentry-dashboard-layout .talentry-dashboard-topbar { flex: none; }
+
+  .talentry-dashboard-layout .talentry-dashboard-main {
+    display: flex;
+    flex-direction: column;
+    flex: 1;
+    min-width: 0;
+    min-height: 0;
+    overflow: hidden;
+    padding: var(--talentry-space-4) var(--talentry-space-4)
+      calc(var(--talentry-space-3) + env(safe-area-inset-bottom, 0px));
+  }
+
+  .talentry-dashboard-layout .talentry-dashboard-bottom-nav,
+  .talentry-dashboard-layout .talentry-dashboard-topbar .talentry-dashboard-search,
+  .talentry-dashboard-main .talentry-dashboard-desktop {
+    display: none;
+  }
+
+  .talentry-dashboard-main .talentry-dashboard-mobile {
+    display: flex;
+    flex-direction: column;
+    flex: 1;
+    min-width: 0;
+    min-height: 0;
+    gap: var(--talentry-space-3);
+  }
+
+  /* Only this viewport scrolls; the sibling pager never participates. */
+  .talentry-dashboard-mobile-viewport {
+    display: block;
+    flex: 1;
+    min-width: 0;
+    min-height: 0;
+    overflow-x: hidden;
+    overflow-y: auto;
+    overscroll-behavior-y: contain;
+    padding: var(--talentry-space-1);
+  }
+
+  .talentry-dashboard-mobile-page { min-width: 0; }
+  .talentry-dashboard-mobile-page[hidden] { display: none; }
+  .talentry-dashboard-mobile-cards {
+    display: flex;
+    flex-direction: column;
+    gap: var(--talentry-space-3);
+    min-width: 0;
+  }
+
+  .talentry-dashboard-mobile-cards > .talentry-dashboard-card {
+    flex: none;
+    min-width: 0;
+    min-height: 0;
+    padding: var(--talentry-space-4);
+    overflow-wrap: anywhere;
+  }
+
+  .talentry-dashboard-mobile-cards .talentry-history-action {
+    min-height: var(--talentry-button-height-md);
+    padding-block: var(--talentry-space-2);
+  }
+
+  .talentry-dashboard-mobile-cards .talentry-dashboard-card-quick > .talentry-history-action {
+    margin-top: var(--talentry-space-3);
+  }
+
+  .talentry-dashboard-pager {
+    display: flex;
+    flex: none;
+    justify-content: center;
+    gap: var(--talentry-space-3);
+    padding: 0;
+  }
+
+  .talentry-dashboard-page-search {
+    width: 100%;
+    min-width: 0;
+    min-height: var(--talentry-button-height-md);
+    padding: var(--talentry-space-3) var(--talentry-space-4);
+    border: var(--talentry-card-border);
+    border-radius: var(--talentry-radius-md);
+    background: var(--talentry-color-surface-lavender);
+    color: var(--talentry-color-text);
+    font: inherit;
+  }
+
+  .talentry-dashboard-menu-page {
+    padding: var(--talentry-space-4);
+    border-radius: var(--talentry-radius-xl);
+    background: var(--talentry-color-navy);
+    color: var(--talentry-color-text-on-dark);
+  }
+
+  .talentry-dashboard-menu-page .talentry-dashboard-brand {
+    padding: var(--talentry-space-2) var(--talentry-space-2) var(--talentry-space-4);
+  }
+
+  .talentry-dashboard-menu-page .talentry-dashboard-nav-item {
+    min-width: 0;
+    min-height: var(--talentry-button-height-md);
+    padding: var(--talentry-space-2) var(--talentry-space-3);
+    white-space: normal;
+    overflow-wrap: anywhere;
+  }
+
+  .talentry-dashboard-menu-page .talentry-dashboard-nav-label { min-width: 0; }
+
+  .talentry-dashboard-page-search:focus-visible,
+  .talentry-dashboard-mobile-page:focus-visible {
+    outline: 2px solid var(--talentry-color-border-focus);
+    outline-offset: var(--talentry-space-1);

diff --git a/components/dashboard/DashboardMobile.tsx b/components/dashboard/DashboardMobile.tsx
--- /dev/null
+++ b/components/dashboard/DashboardMobile.tsx
@@ -0,0 +1,65 @@
+'use client'
+
+import { useRef, useState } from 'react'
+import type { ReactNode, TouchEvent } from 'react'
+
+interface DashboardMobileProps {
+  labels: readonly [string, string, string]
+  navigationLabel: string
+  pages: readonly [ReactNode, ReactNode, ReactNode]
+}
+
+export default function DashboardMobile({ labels, navigationLabel, pages }: DashboardMobileProps) {
+  const [activePanel, setActivePanel] = useState(1)
+  const viewport = useRef<HTMLDivElement>(null)
+  const panels = useRef<Array<HTMLElement | null>>([])
+  const touchStart = useRef<{ x: number; y: number } | null>(null)
+
+  function navigate(index: number) {
+    const next = Math.max(0, Math.min(2, index))
+    if (next === activePanel) return
+    const moveFocus = panels.current[activePanel]?.contains(document.activeElement)
+    setActivePanel(next)
+    if (viewport.current) viewport.current.scrollTop = 0
+    // Keep focus visible when a swipe hides the focused link.
+    if (moveFocus) requestAnimationFrame(() => panels.current[next]?.focus({ preventScroll: true }))
+  }
+
+  function endSwipe(event: TouchEvent<HTMLDivElement>) {
+    const start = touchStart.current
+    touchStart.current = null
+    if (!start || event.touches.length || event.changedTouches.length !== 1) return
+    const touch = event.changedTouches[0]
+    const dx = touch.clientX - start.x
+    const dy = touch.clientY - start.y
+    if (Math.abs(dx) >= 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
+      navigate(activePanel + (dx < 0 ? 1 : -1))
+    }
+  }
+
+  return (
+    <div className="talentry-dashboard-mobile">
+      <div className="talentry-dashboard-mobile-viewport" ref={viewport}
+        onTouchStart={event => {
+          const touch = event.touches[0]
+          touchStart.current = event.touches.length === 1 ? { x: touch.clientX, y: touch.clientY } : null
+        }} onTouchMove={event => { if (event.touches.length !== 1) touchStart.current = null }}
+        onTouchEnd={endSwipe} onTouchCancel={() => { touchStart.current = null }}>
+        {pages.map((page, index) => (
+          <section className="talentry-dashboard-mobile-page" id={`dashboard-panel-${index}`}
+            key={index} hidden={activePanel !== index} aria-label={labels[index]} tabIndex={-1}
+            ref={node => { panels.current[index] = node }}>
+            {page}
+          </section>
+        ))}
+      </div>
+      <nav className="talentry-dashboard-pager" aria-label={navigationLabel}>
+        {labels.map((label, index) => (
+          <button key={label} type="button" aria-label={label}
+            aria-current={activePanel === index ? 'step' : undefined} aria-controls={`dashboard-panel-${index}`}
+            onClick={() => navigate(index)}><span aria-hidden="true" /></button>
+        ))}
+      </nav>
+    </div>
+  )
+}
```


## Follow-up: Mobile Compaction and Pager Clearance (2026-09-16)

This addendum supersedes the earlier mobile track/scroll description; previous implementation evidence is retained. Scope: mobile visual correction only, continuing the dirty working tree on feature/auth-foundation at c36c15a47d00e581b4685c50da41729b9560b85c. Prior Desktop/history/Result/freshness passes were supplied by the user; this correction has not been runtime-accepted.

Files changed in this correction: styles/talentry-dashboard.css and the existing Sprint_DASHBOARD_RECENT_HISTORY_20260916 Summary/Engineering Report. No new files. No TypeScript, props, types, labels, handlers, API, hook, auth, Result or Interview changes.

Root causes: the 300%-wide flex track was sized by its tallest panel, stretching Home's panel area even with short content. The previous panel maximum (100dvh minus 190px), pager padding of 78px, main padding of 104px, header and gaps were not bounded together. The pager remained in the long document and could meet the fixed navigation.

Correction: only the max-width:640px media block changed. A normal-flow 100dvh shell (100vh fallback) contains the natural-height header and shrinkable main area. Main reserves 78px for the existing 66px navigation plus its 12px bottom inset, another 12px gap, and safe-area-inset-bottom. More-specific selectors override embedded shell rules without touching that file or desktop rules.

The active panel alone participates in mobile layout. Inactive panels remain mounted but display:none, so they do not affect height or expose offscreen controls. The wide translated track and its slide transition are removed; existing horizontal swipe detection and three-dot state/navigation remain unchanged. No dependency, measurement, or new JS lifecycle is needed.

The mobile viewport is the sole user-scrollable vertical area, using overflow-y:auto only when content exceeds the available space. Pager remains its sibling with flex:none and zero excess padding, never part of that scroll region. Short Home content uses natural height, 16px card padding, 12px gaps, and a prominent button with at least 44px height. Cards never grow to fill the viewport. Long history/placeholder content can shrink the viewport while keeping the 44px pager controls outside scrolling. Focus styling, long-text wrapping and existing navigation semantics remain. Desktop/tablet above 640px retain all pre-existing declarations.

Validation: npx.cmd tsc --noEmit exit 0, no TypeScript diagnostics; npm printed its 11.16.0 -> 12.0.2 update notice. Generated tsconfig.tsbuildinfo removed. git diff --check exit 0, with existing LF-to-CRLF warnings for the eight previously modified tracked source files. Full correction diff inspected below. Git status remains the same eight modified tracked source paths and seven untracked paths (five source files plus two existing reports); no staging or Git mutation. Production build and Project Memory updates intentionally not performed.

Acceptance still required: visually verify 390x844 for all panels, pager clearance, short Home density, five-row scrolling, long labels, and above-640 desktop/tablet preservation. Changes establish those constraints in CSS; static checks are not browser acceptance. The navigation footprint remains coupled to its existing 66px height/12px inset and must be revisited if that separate shell changes. Panel switching uses the existing single viewport scroll position/browser clamping; no per-panel scroll persistence added.

Approval: pending. Stop after this correction and report.

### Complete correction diff against the prior working tree

```diff
diff --git a/styles/talentry-dashboard.css b/styles/talentry-dashboard.css
--- a/styles/talentry-dashboard.css (working tree before compaction)
+++ b/styles/talentry-dashboard.css (working tree after compaction)
@@ -109,13 +109,88 @@
-  .talentry-dashboard-container { display: flex !important; flex-direction: column; gap: var(--talentry-space-3); min-width: 0; }
-  .talentry-dashboard-mobile-viewport { display: block; min-width: 0; overflow: hidden; }
-  .talentry-dashboard-mobile-track { display: flex; width: 300%; transition: transform var(--talentry-motion-standard) var(--talentry-ease-standard); transform: translateX(calc(var(--dashboard-panel, 0) * -33.333333%)); }
-  .talentry-dashboard-mobile-track[data-panel="1"] { transform: translateX(-33.333333%); }
-  .talentry-dashboard-mobile-track[data-panel="2"] { transform: translateX(-66.666667%); }
-  .talentry-dashboard-mobile-panel { display: flex; flex: 0 0 33.333333%; flex-direction: column; gap: var(--talentry-space-3); min-width: 0; max-height: calc(100dvh - 190px); overflow-y: auto; padding: 1px 1px var(--talentry-space-4); }
-  .talentry-dashboard-mobile-panel > .talentry-dashboard-card { min-height: 0; }
-  .talentry-dashboard-pager { display: flex; justify-content: center; gap: var(--talentry-space-3); padding: var(--talentry-space-2) 0 78px; }
-  .talentry-dashboard-pager button { display: grid; width: 44px; height: 44px; place-items: center; border: 0; border-radius: var(--talentry-radius-pill); background: transparent; }
-  .talentry-dashboard-pager button span { width: 10px; height: 10px; border-radius: 50%; background: var(--talentry-color-border-strong); }
-  .talentry-dashboard-pager button[aria-current="step"] span { background: var(--talentry-color-primary); }
-  .talentry-dashboard-pager button:focus-visible { outline: 2px solid var(--talentry-color-border-focus); outline-offset: -2px; }
-}
+  .talentry-dashboard-layout.talentry-dashboard-layout {
+    height: 100vh;
+    height: 100dvh;
+    min-height: 0;
+    overflow: hidden;
+  }
+
+  .talentry-dashboard-layout .talentry-dashboard-shell {
+    display: flex;
+    flex-direction: column;
+    height: 100%;
+    min-height: 0;
+  }
+
+  .talentry-dashboard-layout .talentry-dashboard-topbar { flex: none; }
+
+  .talentry-dashboard-layout .talentry-dashboard-main {
+    display: flex;
+    flex-direction: column;
+    flex: 1;
+    min-width: 0;
+    min-height: 0;
+    overflow: hidden;
+    /* Existing navigation is 66px high, inset 12px from the bottom. */
+    padding: var(--talentry-space-4) var(--talentry-space-4)
+      calc(78px + var(--talentry-space-3) + env(safe-area-inset-bottom, 0px));
+  }
+
+  .talentry-dashboard-main .talentry-dashboard-container {
+    display: flex;
+    flex-direction: column;
+    flex: 0 1 auto;
+    min-width: 0;
+    min-height: 0;
+    max-height: 100%;
+    gap: var(--talentry-space-3);
+  }
+
+  /* Only this viewport scrolls; the sibling pager never participates. */
+  .talentry-dashboard-mobile-viewport {
+    display: block;
+    flex: 0 1 auto;
+    min-width: 0;
+    min-height: 0;
+    overflow-x: hidden;
+    overflow-y: auto;
+    overscroll-behavior-y: contain;
+    padding: var(--talentry-space-1);
+  }
+
+  .talentry-dashboard-mobile-track { display: block; min-width: 0; }
+  .talentry-dashboard-mobile-panel { display: none; }
+  .talentry-dashboard-mobile-panel[data-active="true"] {
+    display: flex;
+    flex-direction: column;
+    gap: var(--talentry-space-3);
+    min-width: 0;
+  }
+
+  .talentry-dashboard-mobile-panel > .talentry-dashboard-card {
+    flex: none;
+    min-width: 0;
+    min-height: 0;
+    padding: var(--talentry-space-4);
+    overflow-wrap: anywhere;
+  }
+
+  .talentry-dashboard-mobile-panel .talentry-history-action {
+    min-height: var(--talentry-button-height-md);
+    padding-block: var(--talentry-space-2);
+  }
+
+  .talentry-dashboard-mobile-panel .talentry-dashboard-card-quick > .talentry-history-action {
+    margin-top: var(--talentry-space-3);
+  }
+
+  .talentry-dashboard-pager {
+    display: flex;
+    flex: none;
+    justify-content: center;
+    gap: var(--talentry-space-3);
+    padding: 0;
+  }
+  .talentry-dashboard-pager button { display: grid; width: 44px; height: 44px; place-items: center; border: 0; border-radius: var(--talentry-radius-pill); background: transparent; }
+  .talentry-dashboard-pager button span { width: 10px; height: 10px; border-radius: 50%; background: var(--talentry-color-border-strong); }
+  .talentry-dashboard-pager button[aria-current="step"] span { background: var(--talentry-color-primary); }
+  .talentry-dashboard-pager button:focus-visible { outline: 2px solid var(--talentry-color-border-focus); outline-offset: -2px; }
+}
```


## 1. Report Identity

Date: 2026-09-16. Title: Dashboard / Recent Interview History.
Implemented and statically validated; awaiting approval. Runtime acceptance and build are not claimed.

## 2. Objective and Boundaries

Integrate owner-scoped recent interviews, localization and navigation within the existing Dashboard. Preserve the default list query and add an optional limit. No full-history UI, search, pagination, mutation, analytics, new AI, schema/auth redesign, root cutover or Interview behavior changes.

## 3. Repository State Before Implementation

Clean working tree; branch feature/auth-foundation; HEAD c36c15a47d00e581b4685c50da41729b9560b85c, feat(result): complete Talentry review and mobile pager.
The list API already selected lightweight fields with owner filtering and deterministic newest-first ordering. Dashboard was a placeholder shell. Repository instructions and the explicit stage request governed this work.

## 4. Architecture and Implementation Decisions

- GET authenticates first. Optional limit accepts canonical decimal integers 1–100. Missing limit applies no application limit. Empty, zero, negative, fractional, exponent, whitespace, leading-zero, duplicate and over-maximum values return 400 { error: "Invalid limit" }. Unauthenticated requests remain 401.
- Owner identity remains auth.user.id. No client ownership parameter is accepted as authority. The privileged query retains .eq('owner_id', auth.user.id), created_at DESC and id DESC; .limit() is conditional.
- All explicit GET 200/400/401/500 responses have Cache-Control: private, no-store. Unexpected thrown configuration/provider failures remain framework-handled; no broad error architecture added.
- Existing response envelope/mapping preserved. POST unchanged. Answers, summary and owner ID remain excluded from history reads.
- Dashboard server page/guard unchanged. Layout becomes a client language provider; history fetching lives in a separate hook.
- Hook fetches /api/interviews?limit=5 with no-store on mount, retry, focus and persisted pageshow. No polling. Each request aborts its predecessor; aborted/disposed responses cannot update state. Cleanup removes listeners and aborts. A 401 clears rows, redirects to login and prevents further refresh for that effect.
- Runtime response parsing validates the envelope, at most five items, UUIDs, string metadata, integer score 0–100, nonnegative integer duration and parseable date. Malformed data becomes error, never empty.
- Guarded interviewai_uilang preference with tr fallback; focus/storage synchronization. Application language is independent of persisted interview language. Role/company/unknown values remain untranslated. Dates use Intl.DateTimeFormat with browser timezone.
- Result receives only a localized Dashboard header link. Restart remains /. Result fetch/state, scoring, transcript and pager logic unchanged.

## 5–6. Files and Responsibilities

| Status | File | Responsibility |
|---|---|---|
| Modified | app/api/interviews/route.ts | Optional limit, GET cache headers, DTO import |
| New | types/interviews.ts | Reusable list DTO |
| New | components/dashboard/useInterviewHistory.ts | Fetch validation, status, cancellation, retry and refresh |
| New | components/dashboard/RecentInterviews.tsx | Presentational linked rows and states |
| New | components/dashboard/dashboard-copy.ts | Typed TR/EN/DE copy and display mappings |
| Modified | components/dashboard/DashboardContainer.tsx | Existing cards, Setup action, history integration |
| Modified | components/dashboard/DashboardLayout.tsx | Guarded language context and localized shell props |
| Modified | components/dashboard/Sidebar.tsx | Localization and tablet accessible link name |
| Modified | components/dashboard/Topbar.tsx | Localized placeholder labels |
| New | styles/talentry-dashboard.css | Scoped token-based integration styles |
| Modified | components/result/ResultShell.tsx | Dashboard return link |
| Modified | components/result/result-copy.ts | Return-link translations |
| Modified | app/result/result.module.css | Return-link focus and wrapping styles |
| New | docs/01_Engineering/Sprint_DASHBOARD_RECENT_HISTORY_20260916_Summary.md | Summary |
| New | docs/01_Engineering/Sprint_DASHBOARD_RECENT_HISTORY_20260916_Engineering_Report.md | Evidence and full implementation diffs |

## 7. Public Interfaces, Props and Types

InterviewListItem exports id, role, company, level, interviewType, language, createdAt strings and score/durationSeconds numbers. GET(request: NextRequest) returns the existing envelope/error contract.
useInterviewHistory() returns { state, retry }; HistoryState covers loading, empty, error and success with interviews.
RecentInterviews accepts state, retry, DashboardCopy and AppLanguage. DashboardLanguageContext carries AppLanguage. DashboardLayout retains children: ReactNode. Sidebar/Topbar now receive { copy: DashboardCopy }; DashboardContainer remains no-prop.
DashboardCopy defines headings, status text, navigation tuple and interview-type mappings. historyLabel preserves unknown values; INTERVIEW_LANGUAGES supplies native names. ResultCopy adds backToDashboard; ResultShell props unchanged.

## 8. Accessibility Decisions

Semantic links for Setup, complete rows and Dashboard return; no nested actions. Textual /100 score, role/date/score accessible link names, visible focus and minimum 44px integration targets. Loading uses role=status and aria-busy; error uses role=alert. Empty/error headings use h3 under section h2. Tablet Dashboard link retains its accessible name when visible label is hidden. No new animation; shared reduced-motion support retained. Unavailable modules remain unavailable.

## 9. Styling and Tokens

New stylesheet imports shared Talentry UI/tokens and reuses EmptyState, TalentryButton and TalentryBadge. Existing embedded shell CSS and 640/768/1120 breakpoints remain. New rows wrap using min-width:0 and overflow wrapping, token spacing and normal document scroll. No fixed-height history scroller. Bottom navigation clearance preserved. Result header can wrap the subordinate return link; pager rules unchanged.
DashboardLayout remains over 150 lines because its existing embedded stylesheet was deliberately retained rather than refactored.

## 10. Validation Commands and Exact Results

- npx.cmd tsc --noEmit: exit 0, no TypeScript diagnostics.
- npm informational update notice: 11.16.0 -> 12.0.2; no update performed.
- tsconfig.tsbuildinfo was absent initially, generated during checking and removed using its exact absolute path.
- git diff --check: exit 0, no whitespace errors. Git warned LF will be replaced by CRLF when it next touches the eight modified source files. No normalization performed.
- Complete tracked diff and all new source contents reviewed; POST and owner predicate preservation confirmed from source.
- git status --short inspected before and after implementation. No source outside the allowlist changed.
- Production build and runtime tests intentionally not run per stage instructions. Static checks do not establish live owner isolation or mobile acceptance.

## 11. Git Status

Branch/HEAD unchanged. Eight modified source files, five new source files and two new report files. Nothing staged; no commit/push/reset/restore/stash/branch operation. Exact final status is appended below.

## 12. Complete Sprint Implementation Diffs

Full tracked source changes and new source additions are appended, including the Summary addition. This new Engineering Report is the evidence artifact itself and is not recursively embedded as its own diff.

## 13. Risks, Limitations and Technical Debt

Runtime acceptance pending: populated/empty owners; two-account isolation; no-limit preservation; limits 1/5/100 and invalid/duplicate limits; deterministic ordering; cache headers; 401/errors/malformed response/retry; history to Result; Setup navigation; completion-return freshness; refresh, browser Back, focus/pageshow and cancellation races.
Verify TR/EN/DE, independent interview language, unavailable storage and long role/company/unknown metadata. Verify 390x844 including German return link, tablet accessible navigation, desktop density, keyboard/focus/reduced motion and unchanged Result dots/swipes/restart. Production build awaits a separately authorized stage.
The uncapped default may still meet provider row limits; no full-history guarantee or pagination is added. No database index or live-volume assessment. Focus refresh intentionally clears rows and displays loading; no persisted browser history cache.
Existing embedded Dashboard palette, root html lang=en, auth language-menu behavior, persistence idempotency and scoring trust debt remain unchanged. Rows show persisted records without silent deduplication. Live CSS fit and backend behavior remain unverified.

## 14. Untouched-Module Confirmation

Dashboard server page/guard, root route, app/interview/** and Interview components, Result detail page/fetch and ResultContent/ResultAnswers, detail API, auth/Supabase helpers, schema/RLS, shared UI/tokens, package files, Project Memory and prior reports unchanged. Other Dashboard modules remain title-only placeholders; no fake destinations or data.

## 15. Approval Required

Implementation/static stage complete; approval not granted. Stop for review. No production build, memory update, runtime stage, next sprint, staging/commit or push is automatically authorized.

## Follow-up: Dashboard Mobile 3-Panel Swipe/Pager

The existing Dashboard cards are grouped into three panels only at `max-width: 640px`: Home/Quick Action, Recent Interviews, and Other Sections. The desktop/tablet DOM remains `display: contents` so existing grid placement and breakpoints remain in force. Mobile uses a three-column track translated by the clamped panel index, three semantic dot buttons with localized labels, `aria-current="step"`, and `aria-controls`, plus a 60px horizontal-intent swipe threshold. The active panel is the sole mobile vertical scroll region; it has no fixed history sub-scroller, preserves row access, wraps long content, and leaves bottom-navigation clearance. Panel changes only update local state and do not touch the existing history hook or API lifecycle. No Result, Interview, auth, API, or Project Memory changes were made for this follow-up.

Static validation was rerun: `npx.cmd tsc --noEmit` exited 0 with no diagnostics, generated `tsconfig.tsbuildinfo` was removed, and `git diff --check` exited 0. npm again emitted only its version update notice and Git emitted known LF-to-CRLF warnings. Runtime 390x844 acceptance and production build remain pending.

```diff
diff --git a/app/api/interviews/route.ts b/app/api/interviews/route.ts
index 637635a..8d58047 100644
--- a/app/api/interviews/route.ts
+++ b/app/api/interviews/route.ts
@@ -2,6 +2,7 @@ import { NextRequest, NextResponse } from 'next/server'
 
 import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
 import { createAdminClient } from '@/lib/supabase/admin'
+import type { InterviewListItem } from '@/types/interviews'
 
 type InterviewPayload = {
     interviewerKey: string
@@ -17,18 +18,6 @@ type InterviewPayload = {
     durationSeconds: number
 }
 
-type InterviewListItem = {
-    id: string
-    role: string
-    company: string
-    level: string
-    interviewType: string
-    language: string
-    score: number
-    durationSeconds: number
-    createdAt: string
-}
-
 type InterviewListRow = {
     id: string
     role: string
@@ -76,18 +65,26 @@ function isInterviewPayload(value: unknown): value is InterviewPayload {
     )
 }
 
-export async function GET() {
+export async function GET(request: NextRequest) {
+    const headers = { 'Cache-Control': 'private, no-store' }
     const auth = await getAuthenticatedUser()
 
     if (auth.status === 'unauthorized') {
         return NextResponse.json(
             { error: 'Unauthorized' },
-            { status: 401 },
+            { status: 401, headers },
         )
     }
 
+    const limits = request.nextUrl.searchParams.getAll('limit')
+    const rawLimit = limits[0]
+    if (limits.length > 1 || (rawLimit !== undefined &&
+        (!/^[1-9]\d*$/.test(rawLimit) || Number(rawLimit) > 100))) {
+        return NextResponse.json({ error: 'Invalid limit' }, { status: 400, headers })
+    }
+
     const admin = createAdminClient()
-    const { data, error } = await admin
+    let query = admin
         .from('interviews')
         .select(
             'id, role, company, level, interview_type, language, score, duration_seconds, created_at',
@@ -96,12 +93,15 @@ export async function GET() {
         .order('created_at', { ascending: false })
         .order('id', { ascending: false })
 
+    if (rawLimit !== undefined) query = query.limit(Number(rawLimit))
+    const { data, error } = await query
+
     if (error) {
         console.error('Interview read error:', error)
 
         return NextResponse.json(
             { error: 'Failed to load interviews' },
-            { status: 500 },
+            { status: 500, headers },
         )
     }
 
@@ -119,7 +119,7 @@ export async function GET() {
 
     return NextResponse.json(
         { interviews },
-        { status: 200 },
+        { status: 200, headers },
     )
 }
 
diff --git a/app/result/result.module.css b/app/result/result.module.css
index fe7b7ec..f05de0d 100644
--- a/app/result/result.module.css
+++ b/app/result/result.module.css
@@ -22,6 +22,7 @@
 
 .brand {
   display: flex;
+  flex-wrap: wrap;
   align-items: center;
   gap: var(--talentry-space-2);
   min-height: var(--talentry-button-height-lg);
@@ -30,6 +31,24 @@
   font-weight: var(--talentry-font-weight-bold);
 }
 
+.dashboardLink {
+  display: inline-flex;
+  align-items: center;
+  min-height: var(--talentry-button-height-md);
+  margin-left: auto;
+  padding-inline: var(--talentry-space-2);
+  color: var(--talentry-color-primary);
+  font-size: var(--talentry-font-size-sm);
+  font-weight: var(--talentry-font-weight-medium);
+  text-underline-offset: var(--talentry-space-1);
+}
+
+.dashboardLink:focus-visible {
+  outline: 2px solid var(--talentry-color-border-focus);
+  outline-offset: var(--talentry-space-1);
+  border-radius: var(--talentry-radius-sm);
+}
+
 .brandMark {
   display: grid;
   place-items: center;
diff --git a/components/dashboard/DashboardContainer.tsx b/components/dashboard/DashboardContainer.tsx
index ba01304..eb1087d 100644
--- a/components/dashboard/DashboardContainer.tsx
+++ b/components/dashboard/DashboardContainer.tsx
@@ -1,22 +1,32 @@
-const DASHBOARD_CARDS = [
-  ['Welcome', 'welcome'],
-  ['Quick Actions', 'quick'],
-  ['Recent Interviews', 'recent'],
-  ['Recommended Jobs', 'jobs'],
-  ['AI Insights', 'insights'],
-  ['Daily Tip', 'tip'],
-  ['Premium', 'premium'],
-] as const
+'use client'
+
+import Link from 'next/link'
+import { useContext } from 'react'
+import { DashboardLanguageContext } from './DashboardLayout'
+import { DASHBOARD_COPY } from './dashboard-copy'
+import RecentInterviews from './RecentInterviews'
+import { useInterviewHistory } from './useInterviewHistory'
+
+const DASHBOARD_CARDS = ['welcome', 'quick', 'recent', 'jobs', 'insights', 'tip', 'premium'] as const
 
 export default function DashboardContainer() {
+  const language = useContext(DashboardLanguageContext)
+  const copy = DASHBOARD_COPY[language]
+  const { state, retry } = useInterviewHistory()
   return (
-    <section className="talentry-dashboard-container" aria-label="Dashboard overview">
-      {DASHBOARD_CARDS.map(([title, variant]) => (
+    <section className="talentry-dashboard-container" aria-label={copy.overview}>
+      {DASHBOARD_CARDS.map(variant => (
         <article
           className={`talentry-dashboard-card talentry-dashboard-card-${variant}`}
-          key={title}
+          key={variant}
         >
-          <h2 className="talentry-dashboard-card-title">{title}</h2>
+          <h2 className="talentry-dashboard-card-title">{copy[variant]}</h2>
+          {variant === 'quick' && <Link className="talentry-button talentry-button--primary talentry-button--large talentry-history-action"
+            href="/interview/setup">{copy.start}</Link>}
+          {variant === 'recent' && <>
+            <p className="talentry-history-caption">{copy.latest}</p>
+            <RecentInterviews state={state} retry={retry} copy={copy} language={language} />
+          </>}
         </article>
       ))}
     </section>
diff --git a/components/dashboard/DashboardLayout.tsx b/components/dashboard/DashboardLayout.tsx
index d4cb65c..fb27467 100644
--- a/components/dashboard/DashboardLayout.tsx
+++ b/components/dashboard/DashboardLayout.tsx
@@ -1,4 +1,11 @@
+'use client'
+
+import { createContext, useEffect, useState } from 'react'
 import type { ReactNode } from 'react'
+import type { AppLanguage } from '@/types/auth'
+import { DEFAULT_APP_LANGUAGE, SUPPORTED_APP_LANGUAGES } from '@/lib/auth/auth-constants'
+import { DASHBOARD_COPY, DASHBOARD_LANGUAGE_KEY } from './dashboard-copy'
+import '@/styles/talentry-dashboard.css'
 
 import Sidebar from './Sidebar'
 import Topbar from './Topbar'
@@ -7,17 +14,37 @@ interface DashboardLayoutProps {
   children: ReactNode
 }
 
+export const DashboardLanguageContext = createContext<AppLanguage>(DEFAULT_APP_LANGUAGE)
+
 export default function DashboardLayout({ children }: DashboardLayoutProps) {
+  const [language, setLanguage] = useState<AppLanguage>(DEFAULT_APP_LANGUAGE)
+  useEffect(() => {
+    const readLanguage = () => {
+      try {
+        const saved = window.localStorage.getItem(DASHBOARD_LANGUAGE_KEY)
+        setLanguage(SUPPORTED_APP_LANGUAGES.find(value => value === saved) ?? DEFAULT_APP_LANGUAGE)
+      } catch { /* Keep the default when browser storage is unavailable. */ }
+    }
+    readLanguage()
+    window.addEventListener('focus', readLanguage)
+    window.addEventListener('storage', readLanguage)
+    return () => {
+      window.removeEventListener('focus', readLanguage)
+      window.removeEventListener('storage', readLanguage)
+    }
+  }, [])
+  const copy = DASHBOARD_COPY[language]
   return (
-    <div className="talentry-dashboard-layout">
-      <Sidebar />
+    <DashboardLanguageContext.Provider value={language}>
+    <div className="talentry-dashboard-layout" lang={language}>
+      <Sidebar copy={copy} />
 
       <div className="talentry-dashboard-shell">
-        <Topbar />
+        <Topbar copy={copy} />
         <main className="talentry-dashboard-main">{children}</main>
       </div>
 
-      <nav className="talentry-dashboard-bottom-nav" aria-label="Mobile navigation placeholder">
+      <nav className="talentry-dashboard-bottom-nav" aria-label={copy.mobileNavigation}>
         {['⌂', '◇', '▣', '✦', '●'].map((icon, index) => (
           <span key={`${icon}-${index}`} className="talentry-dashboard-bottom-item" aria-hidden="true">
             {icon}
@@ -397,5 +424,6 @@ export default function DashboardLayout({ children }: DashboardLayoutProps) {
         }
       `}</style>
     </div>
+    </DashboardLanguageContext.Provider>
   )
 }
diff --git a/components/dashboard/Sidebar.tsx b/components/dashboard/Sidebar.tsx
index 72004ba..f3bd6c2 100644
--- a/components/dashboard/Sidebar.tsx
+++ b/components/dashboard/Sidebar.tsx
@@ -2,6 +2,7 @@
 
 import Link from 'next/link'
 import { usePathname } from 'next/navigation'
+import type { DashboardCopy } from './dashboard-copy'
 
 interface NavigationItem {
   label: string
@@ -21,7 +22,7 @@ const NAVIGATION_ITEMS: readonly NavigationItem[] = [
   { label: 'Premium', icon: '♢', available: false },
 ]
 
-export default function Sidebar() {
+export default function Sidebar({ copy }: { copy: DashboardCopy }) {
   const pathname = usePathname()
 
   return (
@@ -31,14 +32,15 @@ export default function Sidebar() {
         <span className="talentry-dashboard-brand-name">Talentry</span>
       </div>
 
-      <nav className="talentry-dashboard-nav" aria-label="Dashboard navigation">
-        {NAVIGATION_ITEMS.map((item) => {
+      <nav className="talentry-dashboard-nav" aria-label={copy.navigation}>
+        {NAVIGATION_ITEMS.map((item, index) => {
+          const label = copy.nav[index]
           const content = (
             <>
               <span className="talentry-dashboard-nav-icon" aria-hidden="true">
                 {item.icon}
               </span>
-              <span className="talentry-dashboard-nav-label">{item.label}</span>
+              <span className="talentry-dashboard-nav-label">{label}</span>
             </>
           )
 
@@ -47,6 +49,7 @@ export default function Sidebar() {
 
             return (
               <Link
+                aria-label={label}
                 aria-current={isActive ? 'page' : undefined}
                 className={`talentry-dashboard-nav-item talentry-dashboard-nav-item--available${
                   isActive ? ' talentry-dashboard-nav-item--active' : ''
@@ -61,6 +64,7 @@ export default function Sidebar() {
 
           return (
             <div
+              aria-label={label}
               aria-disabled="true"
               className="talentry-dashboard-nav-item talentry-dashboard-nav-item--unavailable"
               key={item.label}
diff --git a/components/dashboard/Topbar.tsx b/components/dashboard/Topbar.tsx
index 9812627..5c582fb 100644
--- a/components/dashboard/Topbar.tsx
+++ b/components/dashboard/Topbar.tsx
@@ -1,4 +1,6 @@
-export default function Topbar() {
+import type { DashboardCopy } from './dashboard-copy'
+
+export default function Topbar({ copy }: { copy: DashboardCopy }) {
   return (
     <header className="talentry-dashboard-topbar">
       <div className="talentry-dashboard-mobile-brand">Talentry</div>
@@ -6,14 +8,14 @@ export default function Topbar() {
       <div className="talentry-dashboard-topbar-tools">
         <input
           className="talentry-dashboard-search"
-          aria-label="Search placeholder"
-          placeholder="Search"
+          aria-label={copy.search}
+          placeholder={copy.search}
           readOnly
         />
-        <span className="talentry-dashboard-icon-button" aria-label="Notifications placeholder">
+        <span className="talentry-dashboard-icon-button" aria-label={copy.notifications}>
           ♢
         </span>
-        <span className="talentry-dashboard-avatar" aria-label="Profile avatar placeholder">
+        <span className="talentry-dashboard-avatar" aria-label={copy.profile}>
           T
         </span>
       </div>
diff --git a/components/result/ResultShell.tsx b/components/result/ResultShell.tsx
index d79e4e6..0334307 100644
--- a/components/result/ResultShell.tsx
+++ b/components/result/ResultShell.tsx
@@ -20,6 +20,7 @@ export default function ResultShell({ children, title, copy, uiLanguage, mobileR
         <header className={styles.brand} aria-label="Talentry">
           <span className={styles.brandMark} aria-hidden="true">T</span>
           <span>Talentry</span>
+          <Link className={styles.dashboardLink} href="/dashboard">{copy.backToDashboard}</Link>
         </header>
         <SectionHeader className={styles.heading} headingAs="h1" eyebrow={copy.review} title={title} />
         <div className={styles.content}>{children}</div>
diff --git a/components/result/result-copy.ts b/components/result/result-copy.ts
index 6dfca77..5dc9e73 100644
--- a/components/result/result-copy.ts
+++ b/components/result/result-copy.ts
@@ -1,6 +1,7 @@
 import type { AppLanguage } from '@/types/auth'
 
 export type ResultCopy = {
+  backToDashboard: string
   review: string; completed: string; score: string; summary: string; details: string
   role: string; company: string; level: string; interviewType: string
   language: string; duration: string; date: string; persona: string
@@ -26,6 +27,7 @@ export function displayValue(labels: Readonly<Record<string, string>>, value: st
 
 export const RESULT_COPY: Record<AppLanguage, ResultCopy> = {
   tr: {
+    backToDashboard: 'Panele Dön',
     pager: 'Sonuç bölümleri', panels: ['Değerlendirme', 'Görüşme bilgileri', 'Sorular ve cevaplar'],
     review: 'Mülakat değerlendirmesi', completed: 'Mülakat tamamlandı', score: 'Puan',
     summary: 'Performans değerlendirmesi', details: 'Görüşme bilgileri',
@@ -42,6 +44,7 @@ export const RESULT_COPY: Record<AppLanguage, ResultCopy> = {
     personas: { friendly: 'Arkadaşça', formal: 'Profesyonel', tough: 'Zorlu', curious: 'Analitik' },
   },
   en: {
+    backToDashboard: 'Back to Dashboard',
     pager: 'Result sections', panels: ['Evaluation', 'Interview details', 'Questions and answers'],
     review: 'Interview result review', completed: 'Interview complete', score: 'Score',
     summary: 'Performance review', details: 'Session details',
@@ -58,6 +61,7 @@ export const RESULT_COPY: Record<AppLanguage, ResultCopy> = {
     personas: { friendly: 'Friendly', formal: 'Professional', tough: 'Tough', curious: 'Analytical' },
   },
   de: {
+    backToDashboard: 'Zurück zum Dashboard',
     pager: 'Ergebnisbereiche', panels: ['Auswertung', 'Gesprächsdetails', 'Fragen und Antworten'],
     review: 'Interviewauswertung', completed: 'Interview abgeschlossen', score: 'Punktzahl',
     summary: 'Leistungsbeurteilung', details: 'Gesprächsdetails',
diff --git a/types/interviews.ts b/types/interviews.ts
new file mode 100644
--- /dev/null
+++ b/types/interviews.ts
@@ -0,0 +1,11 @@
+export type InterviewListItem = {
+  id: string
+  role: string
+  company: string
+  level: string
+  interviewType: string
+  language: string
+  score: number
+  durationSeconds: number
+  createdAt: string
+}
diff --git a/components/dashboard/useInterviewHistory.ts b/components/dashboard/useInterviewHistory.ts
new file mode 100644
--- /dev/null
+++ b/components/dashboard/useInterviewHistory.ts
@@ -0,0 +1,83 @@
+'use client'
+
+import { useCallback, useEffect, useState } from 'react'
+import { useRouter } from 'next/navigation'
+import { AUTH_ROUTES } from '@/lib/auth/auth-constants'
+import type { InterviewListItem } from '@/types/interviews'
+
+export type HistoryState =
+  | { status: 'loading' | 'empty' | 'error' }
+  | { status: 'success'; interviews: InterviewListItem[] }
+
+function isInterview(value: unknown): value is InterviewListItem {
+  if (!value || typeof value !== 'object') return false
+  const row = value as Record<string, unknown>
+  return typeof row.id === 'string' &&
+    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(row.id) &&
+    ['role', 'company', 'level', 'interviewType', 'language'].every(key => typeof row[key] === 'string') &&
+    typeof row.score === 'number' && Number.isInteger(row.score) && row.score >= 0 && row.score <= 100 &&
+    typeof row.durationSeconds === 'number' && Number.isInteger(row.durationSeconds) && row.durationSeconds >= 0 &&
+    typeof row.createdAt === 'string' && Number.isFinite(Date.parse(row.createdAt))
+}
+
+function parseHistory(payload: unknown): InterviewListItem[] {
+  if (!payload || typeof payload !== 'object' || !('interviews' in payload) ||
+    !Array.isArray(payload.interviews) || payload.interviews.length > 5 ||
+    !payload.interviews.every(isInterview)) throw new Error('Invalid interview list')
+  return payload.interviews
+}
+
+export function useInterviewHistory() {
+  const router = useRouter()
+  const [state, setState] = useState<HistoryState>({ status: 'loading' })
+  const [attempt, setAttempt] = useState(0)
+  const retry = useCallback(() => setAttempt(value => value + 1), [])
+
+  useEffect(() => {
+    let controller: AbortController | undefined
+    let disposed = false
+    let unauthorized = false
+
+    async function load() {
+      if (disposed || unauthorized) return
+      controller?.abort()
+      const current = new AbortController()
+      controller = current
+      setState({ status: 'loading' })
+      try {
+        const response = await fetch('/api/interviews?limit=5', {
+          cache: 'no-store', signal: current.signal,
+        })
+        if (current.signal.aborted || disposed) return
+        if (response.status === 401) {
+          unauthorized = true
+          setState({ status: 'loading' })
+          router.replace(AUTH_ROUTES.login)
+          return
+        }
+        if (!response.ok) throw new Error('History request failed')
+        const payload: unknown = await response.json()
+        const interviews = parseHistory(payload)
+        if (!current.signal.aborted && !disposed) {
+          setState(interviews.length ? { status: 'success', interviews } : { status: 'empty' })
+        }
+      } catch {
+        if (!current.signal.aborted && !disposed) setState({ status: 'error' })
+      }
+    }
+
+    const onFocus = () => { void load() }
+    const onPageShow = (event: PageTransitionEvent) => { if (event.persisted) void load() }
+    void load()
+    window.addEventListener('focus', onFocus)
+    window.addEventListener('pageshow', onPageShow)
+    return () => {
+      disposed = true
+      controller?.abort()
+      window.removeEventListener('focus', onFocus)
+      window.removeEventListener('pageshow', onPageShow)
+    }
+  }, [attempt, router])
+
+  return { state, retry }
+}
diff --git a/components/dashboard/RecentInterviews.tsx b/components/dashboard/RecentInterviews.tsx
new file mode 100644
--- /dev/null
+++ b/components/dashboard/RecentInterviews.tsx
@@ -0,0 +1,60 @@
+import Link from 'next/link'
+import { EmptyState, TalentryBadge, TalentryButton } from '@/components/ui'
+import type { AppLanguage } from '@/types/auth'
+import type { DashboardCopy } from './dashboard-copy'
+import { historyLabel, INTERVIEW_LANGUAGES } from './dashboard-copy'
+import type { HistoryState } from './useInterviewHistory'
+
+interface RecentInterviewsProps {
+  state: HistoryState
+  retry: () => void
+  copy: DashboardCopy
+  language: AppLanguage
+}
+
+export default function RecentInterviews({ state, retry, copy, language }: RecentInterviewsProps) {
+  if (state.status === 'loading') {
+    return <p className="talentry-history-status" role="status" aria-busy="true">{copy.loading}</p>
+  }
+  if (state.status === 'empty') {
+    return <EmptyState variant="compact" headingAs="h3" title={copy.empty} description={copy.emptyHelp}
+      action={<Link className="talentry-button talentry-button--primary talentry-button--medium talentry-history-action"
+        href="/interview/setup">{copy.first}</Link>} />
+  }
+  if (state.status === 'error') {
+    return <EmptyState variant="compact" headingAs="h3" role="alert" title={copy.error} description={copy.errorHelp}
+      action={<TalentryButton onClick={retry}>{copy.retry}</TalentryButton>} />
+  }
+  if (state.status !== 'success') return null
+
+  const dateFormat = new Intl.DateTimeFormat(language, { dateStyle: 'medium', timeStyle: 'short' })
+  return (
+    <ul className="talentry-history-list">
+      {state.interviews.map(interview => {
+        const role = interview.role.trim() ? interview.role : copy.notProvided
+        const date = dateFormat.format(new Date(interview.createdAt))
+        const duration = `${Math.floor(interview.durationSeconds / 60)}:${String(interview.durationSeconds % 60).padStart(2, '0')}`
+        return (
+          <li key={interview.id}>
+            <Link className="talentry-history-row" href={`/result/${encodeURIComponent(interview.id)}`}
+              aria-label={`${copy.viewResult}: ${role}, ${date}, ${copy.score} ${interview.score}/100`}>
+              <div className="talentry-history-heading">
+                <div className="talentry-history-role">
+                  <strong dir="auto">{role}</strong>
+                  {interview.company.trim() && <span dir="auto">{interview.company}</span>}
+                </div>
+                <TalentryBadge tone="primary">{copy.score} {interview.score}/100</TalentryBadge>
+              </div>
+              <div className="talentry-history-meta">
+                <time dateTime={interview.createdAt}>{date}</time>
+                <span dir="auto">{historyLabel(copy.interviewTypes, interview.interviewType)}</span>
+                <span dir="auto">{historyLabel(INTERVIEW_LANGUAGES, interview.language)}</span>
+                <span>{copy.duration} {duration}</span>
+              </div>
+            </Link>
+          </li>
+        )
+      })}
+    </ul>
+  )
+}
diff --git a/components/dashboard/dashboard-copy.ts b/components/dashboard/dashboard-copy.ts
new file mode 100644
--- /dev/null
+++ b/components/dashboard/dashboard-copy.ts
@@ -0,0 +1,62 @@
+import type { AppLanguage } from '@/types/auth'
+
+export const DASHBOARD_LANGUAGE_KEY = 'interviewai_uilang'
+export type DashboardCopy = {
+  overview: string; navigation: string; mobileNavigation: string
+  welcome: string; quick: string; recent: string; jobs: string; insights: string; tip: string; premium: string
+  start: string; latest: string; loading: string; empty: string; emptyHelp: string; first: string
+  error: string; errorHelp: string; retry: string; score: string; duration: string; viewResult: string
+  notProvided: string; search: string; notifications: string; profile: string
+  nav: readonly [string, string, string, string, string, string, string, string]
+  interviewTypes: Record<string, string>
+}
+
+export const INTERVIEW_LANGUAGES: Readonly<Record<string, string>> = {
+  tr: 'Türkçe', en: 'English', de: 'Deutsch',
+}
+
+export function historyLabel(labels: Readonly<Record<string, string>>, value: string) {
+  return Object.prototype.hasOwnProperty.call(labels, value) ? labels[value] : value
+}
+
+export const DASHBOARD_COPY: Record<AppLanguage, DashboardCopy> = {
+  tr: {
+    overview: 'Panel özeti', navigation: 'Panel gezinme menüsü', mobileNavigation: 'Mobil gezinme yer tutucusu',
+    welcome: 'Hoş geldin', quick: 'Hızlı İşlemler', recent: 'Son Mülakatlar', jobs: 'Önerilen İşler',
+    insights: 'Yapay Zekâ İçgörüleri', tip: 'Günün İpucu', premium: 'Premium',
+    start: 'Yeni Mülakat Başlat', latest: 'Son 5 kayıt', loading: 'Mülakat geçmişi yükleniyor…',
+    empty: 'Henüz kayıtlı mülakat yok', emptyHelp: 'Tamamladığın ve kaydedilen mülakatlar burada görünecek.',
+    first: 'İlk mülakatını başlat', error: 'Mülakat geçmişi yüklenemedi',
+    errorHelp: 'Kayıtlarını görüntülemek için tekrar dene.', retry: 'Tekrar Dene', score: 'Puan', duration: 'Süre',
+    viewResult: 'Sonucu görüntüle', notProvided: 'Belirtilmedi', search: 'Ara',
+    notifications: 'Bildirimler yer tutucusu', profile: 'Profil yer tutucusu',
+    nav: ['Panel', 'İşler ve Fırsatlar', 'Mülakatlarım', 'Yapay Zekâ Koçu', 'Raporlar', 'Kaydedilen Pozisyonlar', 'Ayarlar', 'Premium'],
+    interviewTypes: { behavioral: 'Davranışsal / İK', technical: 'Teknik', mixed: 'Karma', case: 'Vaka Analizi' },
+  },
+  en: {
+    overview: 'Dashboard overview', navigation: 'Dashboard navigation', mobileNavigation: 'Mobile navigation placeholder',
+    welcome: 'Welcome', quick: 'Quick Actions', recent: 'Recent Interviews', jobs: 'Recommended Jobs',
+    insights: 'AI Insights', tip: 'Daily Tip', premium: 'Premium',
+    start: 'Start New Interview', latest: 'Latest 5', loading: 'Loading interview history…',
+    empty: 'No saved interviews yet', emptyHelp: 'Your completed and saved interviews will appear here.',
+    first: 'Start your first interview', error: 'Interview history could not be loaded',
+    errorHelp: 'Retry to view your saved interviews.', retry: 'Retry', score: 'Score', duration: 'Duration',
+    viewResult: 'View result', notProvided: 'Not provided', search: 'Search',
+    notifications: 'Notifications placeholder', profile: 'Profile placeholder',
+    nav: ['Dashboard', 'Jobs & Opportunities', 'My Interviews', 'AI Coach', 'Reports', 'Saved Roles', 'Settings', 'Premium'],
+    interviewTypes: { behavioral: 'Behavioral / HR', technical: 'Technical', mixed: 'Mixed', case: 'Case Study' },
+  },
+  de: {
+    overview: 'Dashboard-Übersicht', navigation: 'Dashboard-Navigation', mobileNavigation: 'Platzhalter für mobile Navigation',
+    welcome: 'Willkommen', quick: 'Schnellzugriff', recent: 'Letzte Interviews', jobs: 'Empfohlene Stellen',
+    insights: 'KI-Einblicke', tip: 'Tipp des Tages', premium: 'Premium',
+    start: 'Neues Interview starten', latest: 'Letzte 5', loading: 'Interviewverlauf wird geladen…',
+    empty: 'Noch keine gespeicherten Interviews', emptyHelp: 'Deine abgeschlossenen und gespeicherten Interviews erscheinen hier.',
+    first: 'Starte dein erstes Interview', error: 'Interviewverlauf konnte nicht geladen werden',
+    errorHelp: 'Versuche erneut, deine gespeicherten Interviews zu laden.', retry: 'Erneut versuchen', score: 'Punktzahl', duration: 'Dauer',
+    viewResult: 'Ergebnis ansehen', notProvided: 'Nicht angegeben', search: 'Suchen',
+    notifications: 'Platzhalter für Benachrichtigungen', profile: 'Profilplatzhalter',
+    nav: ['Dashboard', 'Stellen & Chancen', 'Meine Interviews', 'KI-Coach', 'Berichte', 'Gespeicherte Stellen', 'Einstellungen', 'Premium'],
+    interviewTypes: { behavioral: 'Verhalten / HR', technical: 'Technisch', mixed: 'Gemischt', case: 'Fallstudie' },
+  },
+}
diff --git a/styles/talentry-dashboard.css b/styles/talentry-dashboard.css
new file mode 100644
--- /dev/null
+++ b/styles/talentry-dashboard.css
@@ -0,0 +1,101 @@
+@import './talentry-ui.css';
+
+.talentry-dashboard-container > .talentry-dashboard-card {
+  min-width: 0;
+  overflow-wrap: anywhere;
+}
+
+.talentry-dashboard-card .talentry-history-action {
+  display: inline-flex;
+  min-height: var(--talentry-button-height-md);
+  max-width: 100%;
+  height: auto;
+  padding-block: var(--talentry-space-3);
+  white-space: normal;
+  text-align: center;
+  text-decoration: none;
+}
+
+.talentry-dashboard-card-quick > .talentry-history-action {
+  margin-top: var(--talentry-space-5);
+}
+
+.talentry-history-caption,
+.talentry-history-status {
+  color: var(--talentry-color-text-secondary);
+  font-size: var(--talentry-font-size-sm);
+  line-height: var(--talentry-line-height-normal);
+}
+
+.talentry-history-caption {
+  margin: var(--talentry-space-2) 0 var(--talentry-space-4);
+}
+
+.talentry-history-list {
+  display: grid;
+  gap: var(--talentry-space-2);
+  margin: 0;
+  padding: 0;
+  list-style: none;
+}
+
+.talentry-history-list > li,
+.talentry-history-role {
+  min-width: 0;
+}
+
+.talentry-history-row {
+  display: block;
+  min-width: 0;
+  min-height: var(--talentry-button-height-md);
+  padding: var(--talentry-space-3);
+  border: var(--talentry-card-border);
+  border-radius: var(--talentry-radius-md);
+  background: var(--talentry-color-surface);
+  color: var(--talentry-color-text);
+  text-decoration: none;
+  overflow-wrap: anywhere;
+  line-height: var(--talentry-line-height-normal);
+}
+
+.talentry-history-row:hover {
+  background: var(--talentry-color-surface-lavender);
+}
+
+.talentry-history-row:focus-visible,
+.talentry-history-action:focus-visible {
+  outline: 2px solid var(--talentry-color-border-focus);
+  outline-offset: var(--talentry-space-1);
+}
+
+.talentry-history-heading {
+  display: flex;
+  flex-wrap: wrap;
+  align-items: flex-start;
+  justify-content: space-between;
+  gap: var(--talentry-space-2);
+}
+
+.talentry-history-role {
+  display: grid;
+  flex: 1 1 60%;
+  font-size: var(--talentry-font-size-sm);
+}
+
+.talentry-history-role > span,
+.talentry-history-meta {
+  color: var(--talentry-color-text-secondary);
+  font-size: var(--talentry-font-size-xs);
+}
+
+.talentry-history-meta {
+  display: flex;
+  flex-wrap: wrap;
+  gap: var(--talentry-space-1) var(--talentry-space-3);
+  margin-top: var(--talentry-space-2);
+}
+
+.talentry-history-meta > * {
+  min-width: 0;
+  max-width: 100%;
+}
diff --git a/docs/01_Engineering/Sprint_DASHBOARD_RECENT_HISTORY_20260916_Summary.md b/docs/01_Engineering/Sprint_DASHBOARD_RECENT_HISTORY_20260916_Summary.md
new file mode 100644
--- /dev/null
+++ b/docs/01_Engineering/Sprint_DASHBOARD_RECENT_HISTORY_20260916_Summary.md
@@ -0,0 +1,18 @@
+# Sprint DASHBOARD_RECENT_HISTORY_20260916 Summary
+
+- Title: Dashboard / Recent Interview History
+- Branch: feature/auth-foundation
+- Base HEAD: c36c15a47d00e581b4685c50da41729b9560b85c
+- Status: Implemented; static checks passed; awaiting approval and runtime acceptance.
+- Goal: Integrate five recent owner-scoped interviews and Setup/Result navigation.
+- Created source files: types/interviews.ts; components/dashboard/useInterviewHistory.ts; components/dashboard/RecentInterviews.tsx; components/dashboard/dashboard-copy.ts; styles/talentry-dashboard.css.
+- Modified files: app/api/interviews/route.ts; components/dashboard/DashboardContainer.tsx; components/dashboard/DashboardLayout.tsx; components/dashboard/Sidebar.tsx; components/dashboard/Topbar.tsx; components/result/ResultShell.tsx; components/result/result-copy.ts; app/result/result.module.css.
+- Created reports: this Summary and Sprint_DASHBOARD_RECENT_HISTORY_20260916_Engineering_Report.md.
+- API: optional canonical positive integer limit 1–100; missing limit preserves the existing query. Invalid/duplicate limit returns 400 after authentication. Explicit GET responses use private, no-store. POST unchanged.
+- Security: server-derived owner predicate, Dashboard server guard, detail privacy, schema and RLS unchanged.
+- UI: TR/EN/DE recent rows, loading/empty/error/retry, Setup action and Result return link. Existing modules remain placeholders.
+- Validation: npx.cmd tsc --noEmit exited 0 without TypeScript diagnostics; generated tsconfig.tsbuildinfo removed. git diff --check exited 0. Complete source diff reviewed. Git emitted LF-to-CRLF warnings; npm emitted update notice 11.16.0 -> 12.0.2. No packages changed.
+- Risks: runtime/API integration, 390x844 visual checks and production build remain pending. Build explicitly deferred. Existing Dashboard CSS, root language, persistence idempotency and scoring trust debt unchanged.
+- Git: eight modified source files, five new source files and two new reports. No staging, commit, push or branch change.
+- Project Memory: untouched.
+- Approval status: Not approved; stopped after implementation/static reporting.
```

### Final status snapshot

```text
 M app/api/interviews/route.ts
 M app/result/result.module.css
 M components/dashboard/DashboardContainer.tsx
 M components/dashboard/DashboardLayout.tsx
 M components/dashboard/Sidebar.tsx
 M components/dashboard/Topbar.tsx
 M components/result/ResultShell.tsx
 M components/result/result-copy.ts
?? components/dashboard/RecentInterviews.tsx
?? components/dashboard/dashboard-copy.ts
?? components/dashboard/useInterviewHistory.ts
?? docs/01_Engineering/Sprint_DASHBOARD_RECENT_HISTORY_20260916_Engineering_Report.md
?? docs/01_Engineering/Sprint_DASHBOARD_RECENT_HISTORY_20260916_Summary.md
?? styles/talentry-dashboard.css
?? types/interviews.ts
```

