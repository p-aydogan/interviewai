# Sprint USER_MENU_01 Engineering Report

## 1. Report identity
Date: 2026-09-20. Stage: User Menu / Profile app-shell. Status: implementation complete, runtime review and acceptance pending. This report records completed implementation only.

## 2. Objective and boundaries
Implement approved account controls and three authenticated routes. Dashboard remains the post-login home; /interviews remains history; result remains individual detail. No auth redesign, database work, new dependencies, profile editing, account deletion, MFA, support service, Project Memory edits, production build, or Git mutations.

## 3. Repository before implementation
Branch feature/auth-foundation. HEAD 6569572205a501ce25ad1b18b05a4fefd12f8e37 (6569572 feat(interviews): add paginated history and simplify dashboard). Working tree clean. Log decorations showed local origin/feature/auth-foundation at HEAD. No network fetch or remote claim beyond that tracking ref.

## 4. Architecture and implementation decisions
Server pages retain getAuthenticatedUser guards and fixed /login redirects. server-only projectUserIdentity accepts Supabase User and exports only optional email/displayName/initials. Name precedence is display_name, full_name, name, with whitespace normalization and 80-code-point maximum; email is capped at 254 code points. Initials use up to two name words or first email character. Metadata is display text only, React-escaped, never authorization data. No avatar URL, raw metadata, provider identities, ID, or token reaches the shell.

DashboardLayout owns one session hook and language state; existing DashboardLanguageContext remains compatible. AccountLanguageContext supplies the controlled setter. The same UserMenu is passed into Topbar and rendered in the history header. Account-page mode uses normal scrolling and no Dashboard pager/bottom placeholder navigation. The existing large inline style block is preserved, not refactored.

useAccountSession uses only the browser Supabase helper. Duplicate requests are guarded synchronously. signOut uses explicit local scope. SIGNED_OUT and empty INITIAL_SESSION invalidate the shell; subscriptions are cleaned up. Errors trigger local session inspection, including thrown failures. Once local session is absent, shell returns null and window.location.replace('/login') discards the authenticated client tree. Errors with a remaining/unknown session produce localized retry copy, not raw provider output. A persisted pageshow rechecks local session. No claim of global logout or immediate JWT revocation. No personal data logging.

Language updates immediately and persists interviewai_uilang with safe storage failure handling. Existing focus/storage listeners remain. No interview language or persisted interview data changes.

## 5. Files created and modified
### Modified
- app/dashboard/page.tsx
- app/interviews/page.tsx
- components/dashboard/DashboardLayout.tsx
- components/dashboard/Topbar.tsx
- styles/talentry-dashboard.css
- styles/talentry-interviews.css
### Created
- app/account/settings/page.tsx
- app/help/page.tsx
- app/profile/page.tsx
- components/account/AccountPageContent.tsx
- components/account/LanguageSelector.tsx
- components/account/UserMenu.tsx
- components/account/account-copy.ts
- components/account/useAccountSession.ts
- lib/auth/user-identity.ts
- styles/talentry-account.css
- docs/01_Engineering/Sprint_USER_MENU_01_Summary.md
- docs/01_Engineering/Sprint_USER_MENU_01_Engineering_Report.md

## 6. File responsibilities
- app/dashboard/page.tsx and app/interviews/page.tsx: pass minimal projected identity after existing server auth.
- DashboardLayout.tsx: shell identity, language setter, one session controller, shared menu integration, account page mode.
- Topbar.tsx: render supplied account control instead of static avatar.
- talentry-dashboard.css: scoped account scrolling and open-menu header stacking.
- talentry-interviews.css: preserve Back to Dashboard beside menu and position open header.
- user-identity.ts: server-only safe display projection and identity type.
- useAccountSession.ts: session lifecycle, cleanup, logout pending/failure handling and fixed navigation.
- UserMenu.tsx: nonmodal accessible disclosure and native navigation/action controls.
- LanguageSelector.tsx: controlled TR/EN/DE buttons with visible check and aria-pressed.
- account-copy.ts: typed Turkish, English, German account/page/help copy.
- AccountPageContent.tsx: read-only profile; language/recovery settings; concise real-feature help.
- app/profile/page.tsx, app/account/settings/page.tsx, app/help/page.tsx: independent server guards, projection and account shell.
- talentry-account.css: token-based menu and page presentation.
- Summary and Engineering Report: immutable review records; no prior report modified.

## 7. Public interfaces
UserIdentity has optional email, displayName, initials strings. projectUserIdentity(User) returns UserIdentity server-side. DashboardLayout requires identity and children, retaining optional history and adding optional accountPage. Topbar accepts DashboardCopy and accountControl ReactNode. AccountLanguageContext exposes (AppLanguage) => void. LanguageSelector accepts language and onChange. UserMenu accepts identity/language/onLanguageChange/session. useAccountSession returns pending, failed, sessionGone, signOut. AccountPageContent accepts page ('profile' | 'settings' | 'help') and projected identity. All client references to the server-only identity module are type-only imports, erased at compilation.

## 8. Accessibility
Native disclosure, no role=menu. Trigger has accessible name, aria-expanded/controls and 44px size. Opening focuses first link. Escape closes and restores trigger focus; outside pointer closes without preventing the target action; blur outside closes; route changes and link actions close. Native Tab order remains. Language selection has visible check plus aria-pressed. Pending logout retains focus using aria-disabled and synchronous request guard. Failures use role=alert. Visible token-based focus outlines. No animations introduced.

## 9. Styling and responsiveness
Existing tokens supply typography, color, spacing, radius, borders, shadows, and 44px controls. Panel is 18rem, viewport-constrained minus 32px, right anchored, with viewport-height cap and internal scrolling. Identity wraps. Only open-menu headers rise to z-index 21 above existing bottom navigation 20. Account main/root specificity overrides Dashboard's mobile viewport lock. Dashboard panels and History content implementation remain untouched. New pages have bounded 48rem content and ordinary scrolling. Source review only: 390x844, 641–767, tablet/desktop and zoom still require browser acceptance. :has and dynamic viewport units rely on modern browser support, consistent with the existing dvh usage.

## 10. Validation commands and exact results
- npx.cmd tsc --noEmit --incremental false: first exit 1, lib/auth/user-identity.ts(12,43) TS1501 (regex flag requires ES6 target). Removed unnecessary u flag. Final rerun exit 0, no TypeScript diagnostics.
- npm emitted an informational new-major notice: 11.16.0 -> 12.0.2. No upgrade performed.
- git diff --check: exit 0, no whitespace errors. Git emitted LF-to-CRLF warnings for the six modified tracked files.
- git status --short: exit 0, only scoped implementation changes and the two new reports.
- git --no-pager diff --stat: exit 0; six tracked files, 51 insertions, 11 deletions. New untracked files are not represented in that stat.
- Source/import review: no raw User props, runtime server/admin imports in client code, new dependencies, unsupported editing controls or unrelated interview/setup/result changes.
- Test-Path tsconfig.tsbuildinfo: False. Untracked inventory contains only intended source/CSS/report files.
- Production build not run, expressly prohibited. Runtime testing not performed; no runtime acceptance claimed.
- Tooling note: an attempted Python text-edit command could not execute because python was unavailable on PATH (exit 1); integration edits were completed using native PowerShell. No package installation or plan change.

## 11. Git state after implementation
Six modified tracked files and twelve newly created files (ten implementation files plus two reports). Nothing staged. Branch and HEAD unchanged. No commit/push/reset/restore/stash. Exact expanded status follows:
```text
 M app/dashboard/page.tsx
 M app/interviews/page.tsx
 M components/dashboard/DashboardLayout.tsx
 M components/dashboard/Topbar.tsx
 M styles/talentry-dashboard.css
 M styles/talentry-interviews.css
?? app/account/settings/page.tsx
?? app/help/page.tsx
?? app/profile/page.tsx
?? components/account/AccountPageContent.tsx
?? components/account/LanguageSelector.tsx
?? components/account/UserMenu.tsx
?? components/account/account-copy.ts
?? components/account/useAccountSession.ts
?? docs/01_Engineering/Sprint_USER_MENU_01_Summary.md
?? lib/auth/user-identity.ts
?? styles/talentry-account.css
?? docs/01_Engineering/Sprint_USER_MENU_01_Engineering_Report.md
```

## 12. Complete implementation diffs
All six modified source files and all ten new implementation files are included below, plus the Summary addition. This Engineering Report itself is the new report artifact; its self-referential diff is excluded to avoid infinite recursive embedding. No other sprint source diffs are omitted.
```diff
diff --git a/app/dashboard/page.tsx b/app/dashboard/page.tsx
index 89333be..908bc62 100644
--- a/app/dashboard/page.tsx
+++ b/app/dashboard/page.tsx
@@ -1,3 +1,4 @@
+import { projectUserIdentity } from '@/lib/auth/user-identity'
 import { redirect } from 'next/navigation'
 
 import DashboardContainer from '@/components/dashboard/DashboardContainer'
@@ -13,7 +14,7 @@ export default async function DashboardPage() {
   }
 
   return (
-    <DashboardLayout>
+    <DashboardLayout identity={projectUserIdentity(auth.user)}>
       <DashboardContainer />
     </DashboardLayout>
   )
diff --git a/app/interviews/page.tsx b/app/interviews/page.tsx
index 2c3df3f..512eb4f 100644
--- a/app/interviews/page.tsx
+++ b/app/interviews/page.tsx
@@ -1,3 +1,4 @@
+import { projectUserIdentity } from '@/lib/auth/user-identity'
 import { redirect } from 'next/navigation'
 import DashboardLayout from '@/components/dashboard/DashboardLayout'
 import InterviewHistory from '@/components/interviews/InterviewHistory'
@@ -7,5 +8,5 @@ import { AUTH_ROUTES } from '@/lib/auth/auth-constants'
 export default async function InterviewsPage() {
   const auth = await getAuthenticatedUser()
   if (auth.status === 'unauthorized') redirect(AUTH_ROUTES.login)
-  return <DashboardLayout history><InterviewHistory /></DashboardLayout>
+  return <DashboardLayout history identity={projectUserIdentity(auth.user)}><InterviewHistory /></DashboardLayout>
 }
diff --git a/components/dashboard/DashboardLayout.tsx b/components/dashboard/DashboardLayout.tsx
index 83b7322..2940bb6 100644
--- a/components/dashboard/DashboardLayout.tsx
+++ b/components/dashboard/DashboardLayout.tsx
@@ -12,15 +12,24 @@ import { INTERVIEWS_COPY } from '@/components/interviews/interviews-copy'
 
 import Sidebar from './Sidebar'
 import Topbar from './Topbar'
+import type { UserIdentity } from '@/lib/auth/user-identity'
+import UserMenu from '@/components/account/UserMenu'
+import { useAccountSession } from '@/components/account/useAccountSession'
+import '@/styles/talentry-account.css'
 
 interface DashboardLayoutProps {
   children: ReactNode
   history?: boolean
+  accountPage?: boolean
+  identity: UserIdentity
 }
 
 export const DashboardLanguageContext = createContext<AppLanguage>(DEFAULT_APP_LANGUAGE)
 
-export default function DashboardLayout({ children, history = false }: DashboardLayoutProps) {
+export const AccountLanguageContext = createContext<(language: AppLanguage) => void>(() => {})
+
+export default function DashboardLayout({ children, history = false, accountPage = false, identity }: DashboardLayoutProps) {
+  const session = useAccountSession()
   const [language, setLanguage] = useState<AppLanguage>(DEFAULT_APP_LANGUAGE)
   useEffect(() => {
     const readLanguage = () => {
@@ -37,21 +46,30 @@ export default function DashboardLayout({ children, history = false }: Dashboard
       window.removeEventListener('storage', readLanguage)
     }
   }, [])
+  function changeLanguage(next: AppLanguage) {
+    if (!SUPPORTED_APP_LANGUAGES.some(value => value === next)) return
+    setLanguage(next)
+    try { window.localStorage.setItem(DASHBOARD_LANGUAGE_KEY, next) } catch { /* In-memory selection remains usable. */ }
+  }
   const copy = DASHBOARD_COPY[language]
+  const accountControl = <UserMenu identity={identity} language={language}
+    onLanguageChange={changeLanguage} session={session} />
+  if (session.sessionGone) return null
   return (
     <DashboardLanguageContext.Provider value={language}>
-    <div className={`talentry-dashboard-layout${history ? ' talentry-interviews-layout' : ''}`} lang={language}>
+    <AccountLanguageContext.Provider value={changeLanguage}>
+    <div className={`talentry-dashboard-layout${history ? ' talentry-interviews-layout' : ''}${accountPage ? ' talentry-account-layout' : ''}`} lang={language}>
       <Sidebar copy={copy} />
 
       <div className="talentry-dashboard-shell">
         {history ? <header className="talentry-interviews-header">
           <span>Talentry</span>
-          <Link href="/dashboard">{INTERVIEWS_COPY[language].back}</Link>
-        </header> : <Topbar copy={copy} />}
+          <div className="talentry-interviews-header-actions"><Link href="/dashboard">{INTERVIEWS_COPY[language].back}</Link>{accountControl}</div>
+        </header> : <Topbar copy={copy} accountControl={accountControl} />}
         <main className="talentry-dashboard-main">{children}</main>
       </div>
 
-      {!history && <nav className="talentry-dashboard-bottom-nav" aria-label={copy.mobileNavigation}>
+      {!history && !accountPage && <nav className="talentry-dashboard-bottom-nav" aria-label={copy.mobileNavigation}>
         {['⌂', '◇', '▣', '✦', '●'].map((icon, index) => (
           index === 2 ? <Link key={`${icon}-${index}`} href="/interviews" aria-label={copy.nav[2]}
             className="talentry-dashboard-bottom-item talentry-interviews-narrow-link"><span aria-hidden="true">{icon}</span></Link> :
@@ -432,6 +450,7 @@ export default function DashboardLayout({ children, history = false }: Dashboard
         }
       `}</style>
     </div>
+    </AccountLanguageContext.Provider>
     </DashboardLanguageContext.Provider>
   )
 }
diff --git a/components/dashboard/Topbar.tsx b/components/dashboard/Topbar.tsx
index 5c582fb..95778ae 100644
--- a/components/dashboard/Topbar.tsx
+++ b/components/dashboard/Topbar.tsx
@@ -1,6 +1,7 @@
+import type { ReactNode } from 'react'
 import type { DashboardCopy } from './dashboard-copy'
 
-export default function Topbar({ copy }: { copy: DashboardCopy }) {
+export default function Topbar({ copy, accountControl }: { copy: DashboardCopy; accountControl: ReactNode }) {
   return (
     <header className="talentry-dashboard-topbar">
       <div className="talentry-dashboard-mobile-brand">Talentry</div>
@@ -15,9 +16,7 @@ export default function Topbar({ copy }: { copy: DashboardCopy }) {
         <span className="talentry-dashboard-icon-button" aria-label={copy.notifications}>
           ♢
         </span>
-        <span className="talentry-dashboard-avatar" aria-label={copy.profile}>
-          T
-        </span>
+        {accountControl}
       </div>
     </header>
   )
diff --git a/styles/talentry-dashboard.css b/styles/talentry-dashboard.css
index c059a13..a95e48b 100644
--- a/styles/talentry-dashboard.css
+++ b/styles/talentry-dashboard.css
@@ -1,5 +1,20 @@
 @import './talentry-ui.css';
 
+/* Raise only the header with an open account disclosure above narrow bottom navigation. */
+.talentry-dashboard-layout .talentry-dashboard-topbar:has(.talentry-account-trigger[aria-expanded='true']) { z-index: 21; }
+
+.talentry-account-layout.talentry-dashboard-layout.talentry-dashboard-layout {
+  height: auto;
+  min-height: 100dvh;
+  overflow: visible;
+}
+.talentry-account-layout.talentry-dashboard-layout .talentry-dashboard-shell { height: auto; display: block; }
+.talentry-account-layout.talentry-dashboard-layout .talentry-dashboard-main {
+  display: block;
+  overflow: visible;
+  padding: var(--talentry-space-6) var(--talentry-space-4);
+}
+
 .talentry-dashboard-container > .talentry-dashboard-card {
   min-width: 0;
   overflow-wrap: anywhere;
diff --git a/styles/talentry-interviews.css b/styles/talentry-interviews.css
index d8213b0..9a6d55a 100644
--- a/styles/talentry-interviews.css
+++ b/styles/talentry-interviews.css
@@ -19,6 +19,7 @@
 }
 
 .talentry-interviews-header {
+  position: relative;
   display: flex;
   flex-wrap: wrap;
   align-items: center;
@@ -30,6 +31,10 @@
   font-weight: var(--talentry-font-weight-semibold);
 }
 
+.talentry-interviews-header:has(.talentry-account-trigger[aria-expanded='true']) { z-index: 21; }
+.talentry-interviews-header-actions { display: flex; align-items: center; gap: var(--talentry-space-3); min-width: 0; }
+.talentry-interviews-header-actions > a { min-width: 0; }
+
 .talentry-interviews-header a {
   display: inline-flex;
   align-items: center;

diff --git a/app/account/settings/page.tsx b/app/account/settings/page.tsx
new file mode 100644
--- /dev/null
+++ b/app/account/settings/page.tsx
@@ -0,0 +1,15 @@
+import { redirect } from 'next/navigation'
+import DashboardLayout from '@/components/dashboard/DashboardLayout'
+import AccountPageContent from '@/components/account/AccountPageContent'
+import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
+import { projectUserIdentity } from '@/lib/auth/user-identity'
+import { AUTH_ROUTES } from '@/lib/auth/auth-constants'
+
+export default async function AccountPage() {
+  const auth = await getAuthenticatedUser()
+  if (auth.status === 'unauthorized') redirect(AUTH_ROUTES.login)
+  const identity = projectUserIdentity(auth.user)
+  return <DashboardLayout identity={identity} accountPage>
+    <AccountPageContent page="settings" identity={identity} />
+  </DashboardLayout>
+}

diff --git a/app/help/page.tsx b/app/help/page.tsx
new file mode 100644
--- /dev/null
+++ b/app/help/page.tsx
@@ -0,0 +1,15 @@
+import { redirect } from 'next/navigation'
+import DashboardLayout from '@/components/dashboard/DashboardLayout'
+import AccountPageContent from '@/components/account/AccountPageContent'
+import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
+import { projectUserIdentity } from '@/lib/auth/user-identity'
+import { AUTH_ROUTES } from '@/lib/auth/auth-constants'
+
+export default async function AccountPage() {
+  const auth = await getAuthenticatedUser()
+  if (auth.status === 'unauthorized') redirect(AUTH_ROUTES.login)
+  const identity = projectUserIdentity(auth.user)
+  return <DashboardLayout identity={identity} accountPage>
+    <AccountPageContent page="help" identity={identity} />
+  </DashboardLayout>
+}

diff --git a/app/profile/page.tsx b/app/profile/page.tsx
new file mode 100644
--- /dev/null
+++ b/app/profile/page.tsx
@@ -0,0 +1,15 @@
+import { redirect } from 'next/navigation'
+import DashboardLayout from '@/components/dashboard/DashboardLayout'
+import AccountPageContent from '@/components/account/AccountPageContent'
+import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
+import { projectUserIdentity } from '@/lib/auth/user-identity'
+import { AUTH_ROUTES } from '@/lib/auth/auth-constants'
+
+export default async function AccountPage() {
+  const auth = await getAuthenticatedUser()
+  if (auth.status === 'unauthorized') redirect(AUTH_ROUTES.login)
+  const identity = projectUserIdentity(auth.user)
+  return <DashboardLayout identity={identity} accountPage>
+    <AccountPageContent page="profile" identity={identity} />
+  </DashboardLayout>
+}

diff --git a/components/account/AccountPageContent.tsx b/components/account/AccountPageContent.tsx
new file mode 100644
--- /dev/null
+++ b/components/account/AccountPageContent.tsx
@@ -0,0 +1,39 @@
+'use client'
+
+import Link from 'next/link'
+import { useContext } from 'react'
+import { DashboardLanguageContext, AccountLanguageContext } from '@/components/dashboard/DashboardLayout'
+import type { UserIdentity } from '@/lib/auth/user-identity'
+import { ACCOUNT_COPY } from './account-copy'
+import LanguageSelector from './LanguageSelector'
+
+export default function AccountPageContent({ page, identity }: {
+  page: 'profile' | 'settings' | 'help'; identity: UserIdentity
+}) {
+  const language = useContext(DashboardLanguageContext)
+  const changeLanguage = useContext(AccountLanguageContext)
+  const copy = ACCOUNT_COPY[language]
+  return <section className="talentry-account-content">
+    <Link className="talentry-account-back" href="/dashboard">{copy.back}</Link>
+    <h1>{copy[page]}</h1>
+    <p>{copy[`${page}Description`]}</p>
+    {page === 'profile' && <dl className="talentry-account-card">
+      <dt>{copy.displayName}</dt><dd>{identity.displayName ?? copy.missing}</dd>
+      <dt>{copy.email}</dt><dd>{identity.email ?? copy.missing}</dd>
+    </dl>}
+    {page === 'settings' && <>
+      <div className="talentry-account-card">
+        <LanguageSelector language={language} onChange={changeLanguage} />
+        <p>{copy.languageDescription}</p>
+      </div>
+      <section className="talentry-account-card">
+        <h2>{copy.security}</h2><p>{copy.recoveryDescription}</p>
+        <Link href="/forgot-password">{copy.recovery}</Link>
+      </section>
+    </>}
+    {page === 'help' && copy.guidance.map(item => <section className="talentry-account-card" key={item.title}>
+      <h2>{item.href ? <Link href={item.href}>{item.title}</Link> : item.title}</h2>
+      <p>{item.description}</p>
+    </section>)}
+  </section>
+}

diff --git a/components/account/LanguageSelector.tsx b/components/account/LanguageSelector.tsx
new file mode 100644
--- /dev/null
+++ b/components/account/LanguageSelector.tsx
@@ -0,0 +1,15 @@
+import { SUPPORTED_APP_LANGUAGES } from '@/lib/auth/auth-constants'
+import type { AppLanguage } from '@/types/auth'
+import { ACCOUNT_COPY } from './account-copy'
+
+export default function LanguageSelector({ language, onChange }: {
+  language: AppLanguage; onChange: (language: AppLanguage) => void
+}) {
+  return <fieldset className="talentry-account-language">
+    <legend>{ACCOUNT_COPY[language].language}</legend>
+    <div>{SUPPORTED_APP_LANGUAGES.map(value => <button type="button" key={value}
+      aria-pressed={language === value} onClick={() => onChange(value)}>
+      {language === value && <span aria-hidden="true">✓ </span>}{value.toUpperCase()}
+    </button>)}</div>
+  </fieldset>
+}

diff --git a/components/account/UserMenu.tsx b/components/account/UserMenu.tsx
new file mode 100644
--- /dev/null
+++ b/components/account/UserMenu.tsx
@@ -0,0 +1,66 @@
+'use client'
+
+import Link from 'next/link'
+import { usePathname } from 'next/navigation'
+import { useEffect, useId, useRef, useState } from 'react'
+import type { UserIdentity } from '@/lib/auth/user-identity'
+import type { AppLanguage } from '@/types/auth'
+import type { useAccountSession } from './useAccountSession'
+import { ACCOUNT_COPY } from './account-copy'
+import LanguageSelector from './LanguageSelector'
+
+export default function UserMenu({ identity, language, onLanguageChange, session }: {
+  identity: UserIdentity; language: AppLanguage; onLanguageChange: (language: AppLanguage) => void
+  session: ReturnType<typeof useAccountSession>
+}) {
+  const [open, setOpen] = useState(false)
+  const root = useRef<HTMLDivElement>(null)
+  const trigger = useRef<HTMLButtonElement>(null)
+  const firstLink = useRef<HTMLAnchorElement>(null)
+  const id = useId()
+  const pathname = usePathname()
+  const copy = ACCOUNT_COPY[language]
+
+  useEffect(() => { setOpen(false) }, [pathname])
+  useEffect(() => {
+    if (!open) return
+    firstLink.current?.focus()
+    const outside = (event: PointerEvent) => {
+      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false)
+    }
+    document.addEventListener('pointerdown', outside)
+    return () => document.removeEventListener('pointerdown', outside)
+  }, [open])
+
+  return <div className="talentry-account-menu" ref={root}
+    onBlur={event => {
+      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
+    }} onKeyDown={event => {
+      if (event.key === 'Escape' && open) {
+        event.preventDefault()
+        setOpen(false)
+        trigger.current?.focus()
+      }
+    }}>
+    <button type="button" className="talentry-account-trigger" ref={trigger}
+      aria-label={copy.account} aria-expanded={open} aria-controls={id}
+      onClick={() => setOpen(value => !value)}>
+      <span aria-hidden="true">{identity.initials ?? '●'}</span>
+    </button>
+    {open && <div className="talentry-account-popover" id={id}>
+      <div className="talentry-account-identity">
+        {(identity.displayName || !identity.email) && <strong>{identity.displayName ?? copy.account}</strong>}
+        {identity.email && <span>{identity.email}</span>}
+      </div>
+      <Link ref={firstLink} href="/profile" onClick={() => setOpen(false)}>{copy.profile}</Link>
+      <Link href="/account/settings" onClick={() => setOpen(false)}>{copy.settings}</Link>
+      <LanguageSelector language={language} onChange={onLanguageChange} />
+      <Link href="/help" onClick={() => setOpen(false)}>{copy.help}</Link>
+      <hr />
+      <button type="button" aria-disabled={session.pending} onClick={() => void session.signOut()}>
+        {session.pending ? copy.signingOut : copy.signOut}
+      </button>
+      {session.failed && <p role="alert">{copy.signOutFailed}</p>}
+    </div>}
+  </div>
+}

diff --git a/components/account/account-copy.ts b/components/account/account-copy.ts
new file mode 100644
--- /dev/null
+++ b/components/account/account-copy.ts
@@ -0,0 +1,67 @@
+import type { AppLanguage } from '@/types/auth'
+
+interface AccountCopy {
+  account: string; profile: string; settings: string; language: string; help: string
+  signOut: string; signingOut: string; signOutFailed: string; back: string
+  profileDescription: string; displayName: string; email: string; missing: string
+  settingsDescription: string; languageDescription: string; security: string
+  recoveryDescription: string; recovery: string; helpDescription: string
+  guidance: readonly { title: string; description: string; href?: string }[]
+}
+
+export const ACCOUNT_COPY: Record<AppLanguage, AccountCopy> = {
+  tr: {
+    account: 'Hesap', profile: 'Profil', settings: 'Hesap Ayarları', language: 'Uygulama dili',
+    help: 'Yardım ve Destek', signOut: 'Çıkış Yap', signingOut: 'Çıkış yapılıyor…',
+    signOutFailed: 'Çıkış tamamlanamadı. Lütfen tekrar deneyin.', back: 'Panele Dön',
+    profileDescription: 'Hesabınızda bulunan bilgiler. Bu sayfa salt okunurdur.',
+    displayName: 'Görünen ad', email: 'E-posta', missing: 'Belirtilmedi',
+    settingsDescription: 'Uygulama dilinizi seçin veya mevcut parola kurtarma akışını kullanın.',
+    languageDescription: 'Bu tarayıcı için kaydedilir. Mülakat dilini değiştirmez.',
+    security: 'Parola ve güvenlik', recoveryDescription: 'Parolanızı sıfırlamak için e-posta ile kurtarma bağlantısı isteyin.',
+    recovery: 'Parola sıfırlama', helpDescription: 'Mevcut özellikleri kullanmaya yönelik kısa rehber.',
+    guidance: [
+      { title: 'Panel', description: 'Giriş sonrası ana sayfanıza dönün.', href: '/dashboard' },
+      { title: 'Yeni mülakat', description: 'Mülakat türünü, mülakatçıyı ve mülakat dilini seçin.', href: '/interview/setup' },
+      { title: 'Canlı mülakat', description: 'Kurulumdan sonra soruları yanıtlayın ve mülakatı tamamlayın.' },
+      { title: 'Mülakatlarım ve sonuçlar', description: 'Kaydedilmiş mülakatları inceleyin; sonuç ve geri bildirim için bir kayıt açın.', href: '/interviews' },
+      { title: 'Parola kurtarma', description: 'E-posta adresinize parola sıfırlama bağlantısı isteyin.', href: '/forgot-password' },
+    ],
+  },
+  en: {
+    account: 'Account', profile: 'Profile', settings: 'Account Settings', language: 'Application language',
+    help: 'Help & Support', signOut: 'Sign Out', signingOut: 'Signing out…',
+    signOutFailed: 'Sign out could not be completed. Please try again.', back: 'Back to Dashboard',
+    profileDescription: 'The information available on your account. This page is read-only.',
+    displayName: 'Display name', email: 'Email', missing: 'Not provided',
+    settingsDescription: 'Choose your application language or use the existing password recovery flow.',
+    languageDescription: 'Saved for this browser. Does not change the interview language.',
+    security: 'Password and security', recoveryDescription: 'Request an email recovery link to reset your password.',
+    recovery: 'Reset password', helpDescription: 'A short guide to the available features.',
+    guidance: [
+      { title: 'Dashboard', description: 'Return to your main home after signing in.', href: '/dashboard' },
+      { title: 'Start New Interview', description: 'Choose the interview type, interviewer, and interview language.', href: '/interview/setup' },
+      { title: 'Live Interview', description: 'After setup, answer the questions and complete your interview.' },
+      { title: 'My Interviews and results', description: 'Browse saved interviews and open a record for its result and feedback.', href: '/interviews' },
+      { title: 'Password recovery', description: 'Request a password reset link at your email address.', href: '/forgot-password' },
+    ],
+  },
+  de: {
+    account: 'Konto', profile: 'Profil', settings: 'Kontoeinstellungen', language: 'Anwendungssprache',
+    help: 'Hilfe & Support', signOut: 'Abmelden', signingOut: 'Abmeldung läuft…',
+    signOutFailed: 'Die Abmeldung konnte nicht abgeschlossen werden. Bitte erneut versuchen.', back: 'Zurück zum Dashboard',
+    profileDescription: 'Die verfügbaren Angaben zu deinem Konto. Diese Seite ist schreibgeschützt.',
+    displayName: 'Anzeigename', email: 'E-Mail', missing: 'Nicht angegeben',
+    settingsDescription: 'Wähle die Anwendungssprache oder nutze die bestehende Passwortwiederherstellung.',
+    languageDescription: 'Wird für diesen Browser gespeichert. Ändert die Interviewsprache nicht.',
+    security: 'Passwort und Sicherheit', recoveryDescription: 'Fordere einen Link per E-Mail an, um dein Passwort zurückzusetzen.',
+    recovery: 'Passwort zurücksetzen', helpDescription: 'Eine kurze Anleitung zu den verfügbaren Funktionen.',
+    guidance: [
+      { title: 'Dashboard', description: 'Kehre nach der Anmeldung zu deiner Startseite zurück.', href: '/dashboard' },
+      { title: 'Neues Interview', description: 'Wähle Interviewtyp, Interviewer und Interviewsprache.', href: '/interview/setup' },
+      { title: 'Live-Interview', description: 'Beantworte nach der Einrichtung die Fragen und schließe dein Interview ab.' },
+      { title: 'Meine Interviews und Ergebnisse', description: 'Sieh gespeicherte Interviews an und öffne einen Eintrag für Ergebnis und Feedback.', href: '/interviews' },
+      { title: 'Passwortwiederherstellung', description: 'Fordere einen Link zum Zurücksetzen an deine E-Mail-Adresse an.', href: '/forgot-password' },
+    ],
+  },
+}

diff --git a/components/account/useAccountSession.ts b/components/account/useAccountSession.ts
new file mode 100644
--- /dev/null
+++ b/components/account/useAccountSession.ts
@@ -0,0 +1,69 @@
+'use client'
+
+import { useEffect, useRef, useState } from 'react'
+import { createClient } from '@/lib/supabase'
+
+export function useAccountSession() {
+  const [supabase] = useState(createClient)
+  const [pending, setPending] = useState(false)
+  const [failed, setFailed] = useState(false)
+  const [sessionGone, setSessionGone] = useState(false)
+  const inFlight = useRef(false)
+  const leaving = useRef(false)
+  const mounted = useRef(false)
+
+  function leave() {
+    if (!mounted.current || leaving.current) return
+    leaving.current = true
+    setSessionGone(true)
+    // Full navigation discards the authenticated client tree and router cache.
+    window.location.replace('/login')
+  }
+
+  useEffect(() => {
+    mounted.current = true
+    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
+      if (event === 'SIGNED_OUT' || (event === 'INITIAL_SESSION' && !session)) leave()
+    })
+    // A restored browser-history document must not retain stale account UI.
+    const revalidate = async () => {
+      const { data, error } = await supabase.auth.getSession()
+      if (!error && !data.session) leave()
+    }
+    const onPageShow = (event: PageTransitionEvent) => {
+      if (event.persisted) void revalidate().catch(() => {})
+    }
+    window.addEventListener('pageshow', onPageShow)
+    return () => {
+      mounted.current = false
+      subscription.unsubscribe()
+      window.removeEventListener('pageshow', onPageShow)
+    }
+  }, [supabase])
+
+  async function signOut() {
+    if (inFlight.current || leaving.current) return
+    inFlight.current = true
+    setPending(true)
+    setFailed(false)
+    try {
+      const { error } = await supabase.auth.signOut({ scope: 'local' })
+      if (!error) { leave(); return }
+      // The SDK can remove local state even when remote revocation fails.
+      const { data, error: sessionError } = await supabase.auth.getSession()
+      if (!sessionError && !data.session) { leave(); return }
+      if (mounted.current && !leaving.current) setFailed(true)
+    } catch {
+      try {
+        const { data, error } = await supabase.auth.getSession()
+        if (!error && !data.session) { leave(); return }
+      } catch { /* Keep a safe retry state when session inspection fails. */ }
+      if (mounted.current && !leaving.current) setFailed(true)
+    } finally {
+      inFlight.current = false
+      if (mounted.current && !leaving.current) setPending(false)
+    }
+  }
+
+  return { pending, failed, sessionGone, signOut }
+}

diff --git a/lib/auth/user-identity.ts b/lib/auth/user-identity.ts
new file mode 100644
--- /dev/null
+++ b/lib/auth/user-identity.ts
@@ -0,0 +1,26 @@
+import 'server-only'
+import type { User } from '@supabase/supabase-js'
+
+export interface UserIdentity {
+  email?: string
+  displayName?: string
+  initials?: string
+}
+
+function normalizedText(value: unknown, maximum: number): string | undefined {
+  if (typeof value !== 'string') return undefined
+  const text = value.trim().replace(/\s+/g, ' ')
+  return text ? Array.from(text).slice(0, maximum).join('') : undefined
+}
+
+// Metadata is untrusted display text, never authorization evidence.
+export function projectUserIdentity(user: User): UserIdentity {
+  const metadata: Record<string, unknown> = user.user_metadata ?? {}
+  const displayName = normalizedText(metadata.display_name, 80)
+    ?? normalizedText(metadata.full_name, 80) ?? normalizedText(metadata.name, 80)
+  const email = normalizedText(user.email, 254)
+  const initials = displayName
+    ? displayName.split(' ').slice(0, 2).map(part => Array.from(part)[0]).join('').toLocaleUpperCase()
+    : email ? Array.from(email)[0].toLocaleUpperCase() : undefined
+  return { email, displayName, initials }
+}

diff --git a/styles/talentry-account.css b/styles/talentry-account.css
new file mode 100644
--- /dev/null
+++ b/styles/talentry-account.css
@@ -0,0 +1,94 @@
+.talentry-account-menu { position: relative; flex: none; }
+.talentry-account-trigger {
+  display: grid;
+  place-items: center;
+  width: var(--talentry-button-height-md);
+  height: var(--talentry-button-height-md);
+  border: 0;
+  border-radius: var(--talentry-radius-md);
+  background: var(--talentry-color-primary-soft);
+  color: var(--talentry-color-primary);
+  font: inherit;
+  font-weight: var(--talentry-font-weight-bold);
+  cursor: pointer;
+}
+.talentry-account-popover {
+  position: absolute;
+  top: calc(100% + var(--talentry-space-2));
+  right: 0;
+  width: 18rem;
+  max-width: calc(100vw - 2 * var(--talentry-space-4));
+  max-height: calc(100dvh - 7rem - env(safe-area-inset-bottom, 0px));
+  overflow-y: auto;
+  overscroll-behavior: contain;
+  padding: var(--talentry-space-3);
+  border: var(--talentry-card-border);
+  border-radius: var(--talentry-radius-lg);
+  background: var(--talentry-color-surface);
+  color: var(--talentry-color-text);
+  box-shadow: var(--talentry-shadow-elevated);
+  font-weight: var(--talentry-font-weight-regular);
+  overflow-wrap: anywhere;
+}
+.talentry-account-identity { display: grid; gap: var(--talentry-space-1); padding: var(--talentry-space-3); }
+.talentry-account-identity span { font-size: var(--talentry-font-size-sm); color: var(--talentry-color-text-secondary); }
+.talentry-account-popover > a,
+.talentry-account-popover > button {
+  display: flex;
+  align-items: center;
+  width: 100%;
+  min-height: var(--talentry-button-height-md);
+  padding: var(--talentry-space-2) var(--talentry-space-3);
+  border: 0;
+  border-radius: var(--talentry-radius-sm);
+  background: transparent;
+  color: var(--talentry-color-text);
+  text-align: left;
+  text-decoration: none;
+  font: inherit;
+  cursor: pointer;
+}
+.talentry-account-popover > a:hover,
+.talentry-account-popover > button:hover { background: var(--talentry-color-surface-lavender); }
+.talentry-account-popover button[aria-disabled='true'] { cursor: wait; }
+.talentry-account-popover hr { border: 0; border-top: var(--talentry-card-border); }
+.talentry-account-popover p { padding-inline: var(--talentry-space-3); }
+.talentry-account-language { min-width: 0; margin: 0; padding: var(--talentry-space-3); border: 0; }
+.talentry-account-language legend { padding: 0; font-weight: var(--talentry-font-weight-semibold); }
+.talentry-account-language > div { display: flex; flex-wrap: wrap; gap: var(--talentry-space-2); }
+.talentry-account-language button {
+  min-width: var(--talentry-button-height-md);
+  min-height: var(--talentry-button-height-md);
+  padding: var(--talentry-space-2);
+  border: var(--talentry-card-border);
+  border-radius: var(--talentry-radius-sm);
+  background: var(--talentry-color-surface);
+  color: var(--talentry-color-text);
+  font: inherit;
+  cursor: pointer;
+}
+.talentry-account-language button[aria-pressed='true'] {
+  background: var(--talentry-color-primary-soft);
+  font-weight: var(--talentry-font-weight-bold);
+}
+.talentry-account-menu :is(a, button):focus-visible,
+.talentry-account-content :is(a, button):focus-visible {
+  outline: 2px solid var(--talentry-color-border-focus);
+  outline-offset: var(--talentry-space-1);
+}
+.talentry-account-content {
+  display: grid;
+  gap: var(--talentry-space-4);
+  width: 100%;
+  max-width: 48rem;
+  margin-inline: auto;
+  line-height: var(--talentry-line-height-normal);
+  overflow-wrap: anywhere;
+}
+.talentry-account-content > *, .talentry-account-card > * { min-width: 0; margin: 0; }
+.talentry-account-content h1 { font-size: var(--talentry-font-size-2xl); }
+.talentry-account-content h2 { font-size: var(--talentry-font-size-lg); }
+.talentry-account-content a { display: inline-flex; align-items: center; min-height: var(--talentry-button-height-md); color: var(--talentry-color-primary); }
+.talentry-account-card { display: grid; gap: var(--talentry-space-3); padding: var(--talentry-space-5); border: var(--talentry-card-border); border-radius: var(--talentry-radius-lg); background: var(--talentry-color-surface); }
+.talentry-account-card dt { font-weight: var(--talentry-font-weight-semibold); }
+.talentry-account-card dd, .talentry-account-content p { color: var(--talentry-color-text-secondary); }

diff --git a/docs/01_Engineering/Sprint_USER_MENU_01_Summary.md b/docs/01_Engineering/Sprint_USER_MENU_01_Summary.md
new file mode 100644
--- /dev/null
+++ b/docs/01_Engineering/Sprint_USER_MENU_01_Summary.md
@@ -0,0 +1,37 @@
+# Sprint USER_MENU_01 Summary
+
+- Title: User Menu / Profile app-shell
+- Branch: feature/auth-foundation
+- Recovery HEAD: 6569572205a501ce25ad1b18b05a4fefd12f8e37
+- Status: Implementation complete; awaiting runtime review and approval.
+- Goal: Functional shared account menu, real read-only identity, language preference, password recovery navigation, and concise help within the existing authenticated shell.
+- Validation: npx.cmd tsc --noEmit --incremental false: final exit 0. git diff --check: exit 0. Production build intentionally not run by explicit user instruction.
+- Initial validation: TS1501 for a Unicode regex flag under the existing target, corrected without changing compiler configuration; rerun passed.
+- Notices: npm 11.16.0 -> 12.0.2 update notice; Git LF-to-CRLF working-copy warnings on six modified files. No dependency update performed.
+- Risks: Browser layout, keyboard/focus, session failure paths, cross-tab logout and responsive acceptance remain untested. Local logout does not promise immediate JWT revocation or all-device logout.
+- Approval: Not approved. Runtime review required. No stage/commit/push or Project Memory update.
+
+## Modified files
+- app/dashboard/page.tsx
+- app/interviews/page.tsx
+- components/dashboard/DashboardLayout.tsx
+- components/dashboard/Topbar.tsx
+- styles/talentry-dashboard.css
+- styles/talentry-interviews.css
+
+## Created files
+- app/account/settings/page.tsx
+- app/help/page.tsx
+- app/profile/page.tsx
+- components/account/AccountPageContent.tsx
+- components/account/LanguageSelector.tsx
+- components/account/UserMenu.tsx
+- components/account/account-copy.ts
+- components/account/useAccountSession.ts
+- lib/auth/user-identity.ts
+- styles/talentry-account.css
+- docs/01_Engineering/Sprint_USER_MENU_01_Summary.md
+- docs/01_Engineering/Sprint_USER_MENU_01_Engineering_Report.md
+
+## Runtime review
+Verify anonymous access redirects; real/missing/long identity; keyboard/escape/outside click; TR/EN/DE persistence and blocked storage; local logout success/error/duplicate click/cross-tab/back navigation; 390x844, 640/641/767/768 boundaries and desktop; Dashboard panels and history pagination unchanged.
```

## 13. Risks, limitations, debt and pending runtime checks
Required runtime review: direct anonymous/private route access; real/missing/malformed/long identity; all keyboard/focus paths; outside click and same-route navigation; TR/EN/DE immediate update/persistence, cross-tab changes and blocked storage; logout success, provider error with local clearing, error with retained session, duplicate clicks, expired session, another-tab logout, browser Back; 390x844, 640/641/767/768 breakpoints, desktop, long German text and zoom; existing Dashboard pager and History pagination regression checks.

Remote refresh-token revocation cannot be guaranteed when provider requests fail; issued access tokens may remain valid until expiry. Local session absence always exits private UI. Language persistence is browser-local and unavailable when storage fails. Existing auth-page localization, unguarded live/provider routes, logging debt, and server cookie-refresh design remain out of scope. Existing inline shell CSS remains technical debt. No new DB or editable profile persistence.

Rollback: only after explicit authorization, reverse the six reviewed modifications and remove the ten new implementation files while preserving immutable reports and unrelated work. No database rollback needed. Safe reference is 6569572; no rollback command was run.

## 14. Untouched modules
No changes to Sign In/Create Account/recovery implementations, interview setup/live/result behavior, interview APIs/history pagination, Sidebar product navigation, tokens, migrations, package files, compiler settings, prior reports, Project Memory or governance. No files deleted or renamed.

## 15. Approval required
Runtime acceptance and explicit user approval remain pending. Stop here; do not begin another stage. Commit/stage/push require separate explicit authorization.

---

## Final Closure / Runtime Acceptance — 2026-09-21

Explicitly authorized documentation correction. Final stage status: IMPLEMENTATION COMPLETE — supplied main-flow runtime acceptance, static validation and production build PASSED. Evidence below is the user's verified acceptance record; no runtime tests, TypeScript or production build were rerun for this correction.

This closure supersedes the earlier pending-runtime/build statements for the checks explicitly listed below. Original implementation-time information, including the Engineering Report's embedded implementation-time diffs, is preserved as historical evidence. Earlier statements that build/runtime were not performed describe that implementation step, not the final stage state. Project Memory closure was subsequently completed; this correction does not modify Project Memory. Commit/stage/push remain separately authorized actions and were not performed.

### Runtime acceptance — PASS

- Desktop Dashboard User Menu: PASS.
- Desktop Profile: PASS.
- Desktop Account Settings: PASS.
- Desktop Help & Support: PASS.
- TR immediate language update: PASS.
- Language persistence after refresh: PASS.
- Language persistence across sign-out/sign-in: PASS.
- Sign Out -> /login: PASS.
- Browser Back did not restore authenticated Dashboard/private content: PASS.
- 390x844 Dashboard User Menu: PASS.
- 390x844 Profile: PASS.
- 390x844 Account Settings: PASS.
- Mobile account pages use normal vertical scrolling.
- 390x844 My Interviews history-header User Menu: PASS.
- Escape closes menu: PASS.
- Focus returns to avatar trigger: PASS.
- Outside click closes menu: PASS.
- Clicked underlying target remains functional: PASS.
- 641–767 narrow Dashboard/User Menu: PASS.
- 768px rail/sidebar transition: PASS.
- 768px User Menu: PASS.
- Existing Dashboard/history behavior remained intact in tested flows.

### Production build — PASS

- npm.cmd run build: PASS.
- Next.js 14.2.5.
- Compiled successfully.
- Linting and checking validity of types: PASS.
- Collecting page data: PASS.
- Generating static pages 22/22: PASS.
- Collecting build traces: PASS.
- Finalizing page optimization: PASS.

Relevant dynamic routes confirmed in the build: /profile, /account/settings, /help, /dashboard, /interviews, /interview/setup and /result/[id]. Build route classification does not imply a new server page guard on Result.

### Static validation — PASS

TypeScript: PASS. git diff --check: PASS. LF-to-CRLF warnings only; non-blocking. These are supplied stage-validation results; the separately requested whitespace/diff/status checks are the only post-edit validation commands for this correction.

### Explicitly untested runtime edge cases

- Cross-tab logout (implemented/source-reviewed only).
- Forced network-failure sign-out behavior.
- Malformed/missing identity metadata edge cases.
- Unavailable localStorage/storage failure mode.
- Exhaustive testing of every responsive width.

Do not infer acceptance for unlisted tests from source review, static validation or successful build. Local-session logout does not claim global/all-device revocation or immediate invalidation of issued JWTs. Existing >20-record history pagination acceptance remains separate and pending.

### Scope and next-stage boundary

No DB/schema change, profile table, unsupported profile editing or broad auth redesign was introduced. Existing security and localization debt remains outside this stage. Splash + Onboarding is planned next, not implemented; existing Sign In / Create Account flows must be preserved. No next stage begins automatically.

Branch: feature/auth-foundation. Recovery/current HEAD: 6569572205a501ce25ad1b18b05a4fefd12f8e37 (6569572). Stage changes remain uncommitted. This authorized correction changes only the two existing USER_MENU_01 engineering reports; application code and Project Memory are untouched.
