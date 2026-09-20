# Sprint FULL_INTERVIEW_HISTORY_20260920 Engineering Report

## 1. Report identity
Date: 2026-09-20. Sprint: FULL_INTERVIEW_HISTORY_20260920. Title: Full My Interviews / History.
Status: static validation completed; runtime acceptance pending; production build pending; approval required.

## 2. Objective and boundaries
Implement the approved /interviews experience. Preserve omitted-limit listing behavior, Dashboard latest-five, POST, Result, Interview, Setup, root routing, authentication and RLS. No packages installed, no schema migration, no search/filter/sort, no fake business data, no memory update or Git mutation. Only the eleven approved source files and these two required reports are in scope.

## 3. Repository before implementation
Clean git status --short. Branch feature/auth-foundation. HEAD bde16128e24131c8d28f3b2def7f2fef2ccdfdb7.
Commit: feat(interview): add two-panel mobile setup and record stage closure.
No tsconfig.tsbuildinfo existed before validation.

## 4. Architecture and implementation decisions
The server page uses getAuthenticatedUser and redirects unauthorized requests to /login before rendering history.
GET authenticates first, validates the existing 1-100 limit and new cursor, retains the lightweight selection and explicit owner predicate, then applies created_at DESC / id DESC keyset pagination.
Explicit limit fetches limit+1 and returns at most limit. Without limit no query limit is imposed; nextCursor is null. A valid cursor without limit applies the continuation predicate without imposing a limit.
Response: { interviews: InterviewListItem[], nextCursor: string | null }. Dashboard's existing validator accepts the extra property and still receives at most five rows.
Continuation is owner_id = authenticated user AND (created_at < timestamp OR (created_at = timestamp AND id < UUID)).
Version-1 base64url cursor contains only version, createdAt, id. Its original timestamp string is encoded without Date rounding. Strict alphabet/canonical base64url, 512-character bound, payload field count, version, UUID, calendar date, time and timezone validation reject malformed inputs. Duplicate query parameters are rejected in the route. Invalid cursor returns 400 with generic Invalid cursor; no decoded internals are returned.
The cursor is unsigned and not authorization. Forging/copying a position cannot remove the independent owner predicate. Interview data uses same-origin fetch only.
Client state separates initial loading/error from ready-empty/ready-populated and incremental idle/loading/error. Null continuation means end. AbortController, active-controller identity and mounted checks discard stale responses. A ref prevents overlapping requests synchronously. ID deduplication preserves existing row order. Incremental errors retain rows and the cursor for retry. 401 clears rows and redirects. No polling, record localStorage, or focus refetch is added.
Compact rows reuse the existing history presentation classes and primitives. History mode replaces Dashboard-only chrome and releases its mobile scroll lock without changing the default pager mode.

## 5. Files created and modified / 6. Responsibilities
Modified:
- app/api/interviews/route.ts: GET pagination only; POST remains unchanged.
- types/interviews.ts: reusable InterviewHistoryPage response type.
- components/dashboard/Sidebar.tsx: enable /interviews in existing desktop/tablet/mobile menu.
- components/dashboard/DashboardLayout.tsx: optional history mode and existing narrow navigation history link.

Created:
- lib/interviews/history-cursor.ts: server-only cursor codec and validation.
- app/interviews/page.tsx: server authentication and page composition.
- components/interviews/useFullInterviewHistory.ts: requests, validation, concurrency, cancellation, retries and private state.
- components/interviews/InterviewHistory.tsx: title/actions/list and loading/empty/error/pagination presentation.
- components/interviews/InterviewHistoryRow.tsx: read-only row formatting and Result link.
- components/interviews/interviews-copy.ts: typed TR/EN/DE page and lifecycle copy.
- styles/talentry-interviews.css: scoped responsive history mode, actions, focus and narrow navigation.
- docs/01_Engineering/Sprint_FULL_INTERVIEW_HISTORY_20260920_Summary.md: acceptance summary.
- docs/01_Engineering/Sprint_FULL_INTERVIEW_HISTORY_20260920_Engineering_Report.md: this engineering record and source diffs.

## 7. Public interfaces, props and types
InterviewListItem is unchanged. InterviewHistoryPage adds interviews and nextCursor.
encodeHistoryCursor(createdAt: string, id: string): string; decodeHistoryCursor(token: string): HistoryCursor | null.
DashboardLayout gains optional history?: boolean, default false.
InterviewHistory has no props. InterviewHistoryRow receives interview: InterviewListItem and language: AppLanguage.
useFullInterviewHistory returns state, retry and loadMore. State includes status, interviews, nextCursor and more.
INTERVIEWS_COPY is a Record<AppLanguage, InterviewsCopy>. Shared row labels/type/language mappings reuse dashboard-copy.

## 8. Accessibility
Semantic h1, ul/li, time and whole-row links, no nested controls. Localized row accessible names include role/date/score.
Loading uses polite role=status and aria-busy; errors use role=alert. Load-more aria-disabled communicates the busy state while preserving focus; the hook blocks duplicate activation.
Focus outlines and 44px control/row minimums use tokens. Existing rows remain mounted on append; no programmatic scroll change.
Long text and metadata wrap. Numeric score is explicit /100. No history animation or swipe is introduced, including for reduced-motion users.
Runtime keyboard/screen-reader and visual acceptance remain pending.

## 9. Styling, localization and navigation
All new shared colors, spacing, typography weights, borders, and control sizing use Talentry tokens. 64rem is a page-local content-width cap; breakpoint values align with the approved existing shell.
History mobile uses document scrolling, content-sized rows and full-width actions, not a pager or nested list scroller. Desktop/tablet retain the existing Sidebar breakpoint behavior. Other disabled menu items remain disabled.
At 641-767 the existing bottom navigation history placeholder becomes a 44px accessible /interviews link. Default Dashboard pager is untouched.
History back -> /dashboard; start -> /interview/setup; row -> /result/<id>. Result return behavior unchanged.
The existing shell reads interviewai_uilang with tr fallback and focus/storage synchronization. TR/EN/DE copy is typed. Intl.DateTimeFormat uses app language and browser timezone. Role/company remain unchanged; interview language remains independent.
No total/count is claimed. No search placeholder appears in history mode.

## 10. Validation commands and exact results
1. npx.cmd tsc --noEmit: exit 1 initially:
   components/interviews/useFullInterviewHistory.ts(36,41): error TS2322: Type 'unknown' is not assignable to type 'string'.
   components/interviews/useFullInterviewHistory.ts(76,49): error TS2802: Type 'MapIterator<InterviewListItem>' can only be iterated through when using the '--downlevelIteration' flag or with a '--target' of 'es2015' or higher.
   Fixed explicit nextCursor narrowing and Array.from(Map.values()) within approved scope.
2. npx.cmd tsc --noEmit rerun: exit 0, no TypeScript diagnostics.
   npm notice: New major version of npm available! 11.16.0 -> 12.0.2. No packages changed.
3. Removed generated tsconfig.tsbuildinfo after each run as instructed.
4. git diff --check: exit 0, no whitespace errors.
   Git warned LF will be replaced by CRLF the next time Git touches app/api/interviews/route.ts, components/dashboard/DashboardLayout.tsx, components/dashboard/Sidebar.tsx, types/interviews.ts.
5. Inspected full tracked diff and complete new-file contents.
6. Runtime/browser tests and production build deliberately not run. Static success does not claim runtime acceptance.

## 11. Git status
Branch and HEAD unchanged. Four source files modified; seven source files and two reports untracked. No staged files.
Status captured after Summary creation, before this report was written:
```text
 M app/api/interviews/route.ts
 M components/dashboard/DashboardLayout.tsx
 M components/dashboard/Sidebar.tsx
 M types/interviews.ts
?? app/interviews/
?? components/interviews/
?? docs/01_Engineering/Sprint_FULL_INTERVIEW_HISTORY_20260920_Summary.md
?? lib/interviews/
?? styles/talentry-interviews.css
```

## 12. Complete sprint source diffs
Tracked source diffs and complete additions follow. The Summary addition is also included. This report does not embed a recursively self-referential diff of itself.
```diff
diff --git a/app/api/interviews/route.ts b/app/api/interviews/route.ts
index 8d58047..389152c 100644
--- a/app/api/interviews/route.ts
+++ b/app/api/interviews/route.ts
@@ -2,6 +2,7 @@ import { NextRequest, NextResponse } from 'next/server'
 
 import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
 import { createAdminClient } from '@/lib/supabase/admin'
+import { decodeHistoryCursor, encodeHistoryCursor } from '@/lib/interviews/history-cursor'
 import type { InterviewListItem } from '@/types/interviews'
 
 type InterviewPayload = {
@@ -83,6 +84,12 @@ export async function GET(request: NextRequest) {
         return NextResponse.json({ error: 'Invalid limit' }, { status: 400, headers })
     }
 
+    const cursors = request.nextUrl.searchParams.getAll('cursor')
+    const cursor = cursors.length === 1 ? decodeHistoryCursor(cursors[0]) : null
+    if (cursors.length > 1 || (cursors.length === 1 && !cursor)) {
+        return NextResponse.json({ error: 'Invalid cursor' }, { status: 400, headers })
+    }
+
     const admin = createAdminClient()
     let query = admin
         .from('interviews')
@@ -93,7 +100,13 @@ export async function GET(request: NextRequest) {
         .order('created_at', { ascending: false })
         .order('id', { ascending: false })
 
-    if (rawLimit !== undefined) query = query.limit(Number(rawLimit))
+    if (cursor) {
+        query = query.or(
+            `created_at.lt.${cursor.createdAt},and(created_at.eq.${cursor.createdAt},id.lt.${cursor.id})`,
+        )
+    }
+    const limit = rawLimit === undefined ? undefined : Number(rawLimit)
+    if (limit !== undefined) query = query.limit(limit + 1)
     const { data, error } = await query
 
     if (error) {
@@ -105,7 +118,12 @@ export async function GET(request: NextRequest) {
         )
     }
 
-    const interviews: InterviewListItem[] = (data ?? []).map((row: InterviewListRow) => ({
+    const rows: InterviewListRow[] = data ?? []
+    const hasMore = limit !== undefined && rows.length > limit
+    const page = limit === undefined ? rows : rows.slice(0, limit)
+    const last = page[page.length - 1]
+    const nextCursor = hasMore ? encodeHistoryCursor(last.created_at, last.id) : null
+    const interviews: InterviewListItem[] = page.map((row: InterviewListRow) => ({
         id: row.id,
         role: row.role,
         company: row.company,
@@ -118,7 +136,7 @@ export async function GET(request: NextRequest) {
     }))
 
     return NextResponse.json(
-        { interviews },
+        { interviews, nextCursor },
         { status: 200, headers },
     )
 }
diff --git a/components/dashboard/DashboardLayout.tsx b/components/dashboard/DashboardLayout.tsx
index fb27467..bd1d759 100644
--- a/components/dashboard/DashboardLayout.tsx
+++ b/components/dashboard/DashboardLayout.tsx
@@ -1,22 +1,26 @@
 'use client'
 
 import { createContext, useEffect, useState } from 'react'
+import Link from 'next/link'
 import type { ReactNode } from 'react'
 import type { AppLanguage } from '@/types/auth'
 import { DEFAULT_APP_LANGUAGE, SUPPORTED_APP_LANGUAGES } from '@/lib/auth/auth-constants'
 import { DASHBOARD_COPY, DASHBOARD_LANGUAGE_KEY } from './dashboard-copy'
 import '@/styles/talentry-dashboard.css'
+import '@/styles/talentry-interviews.css'
+import { INTERVIEWS_COPY } from '@/components/interviews/interviews-copy'
 
 import Sidebar from './Sidebar'
 import Topbar from './Topbar'
 
 interface DashboardLayoutProps {
   children: ReactNode
+  history?: boolean
 }
 
 export const DashboardLanguageContext = createContext<AppLanguage>(DEFAULT_APP_LANGUAGE)
 
-export default function DashboardLayout({ children }: DashboardLayoutProps) {
+export default function DashboardLayout({ children, history = false }: DashboardLayoutProps) {
   const [language, setLanguage] = useState<AppLanguage>(DEFAULT_APP_LANGUAGE)
   useEffect(() => {
     const readLanguage = () => {
@@ -36,21 +40,26 @@ export default function DashboardLayout({ children }: DashboardLayoutProps) {
   const copy = DASHBOARD_COPY[language]
   return (
     <DashboardLanguageContext.Provider value={language}>
-    <div className="talentry-dashboard-layout" lang={language}>
+    <div className={`talentry-dashboard-layout${history ? ' talentry-interviews-layout' : ''}`} lang={language}>
       <Sidebar copy={copy} />
 
       <div className="talentry-dashboard-shell">
-        <Topbar copy={copy} />
+        {history ? <header className="talentry-interviews-header">
+          <span>Talentry</span>
+          <Link href="/dashboard">{INTERVIEWS_COPY[language].back}</Link>
+        </header> : <Topbar copy={copy} />}
         <main className="talentry-dashboard-main">{children}</main>
       </div>
 
-      <nav className="talentry-dashboard-bottom-nav" aria-label={copy.mobileNavigation}>
+      {!history && <nav className="talentry-dashboard-bottom-nav" aria-label={copy.mobileNavigation}>
         {['⌂', '◇', '▣', '✦', '●'].map((icon, index) => (
+          index === 2 ? <Link key={`${icon}-${index}`} href="/interviews" aria-label={copy.nav[2]}
+            className="talentry-dashboard-bottom-item talentry-interviews-narrow-link"><span aria-hidden="true">{icon}</span></Link> :
           <span key={`${icon}-${index}`} className="talentry-dashboard-bottom-item" aria-hidden="true">
             {icon}
           </span>
         ))}
-      </nav>
+      </nav>}
 
       <style>{`
         :root {
diff --git a/components/dashboard/Sidebar.tsx b/components/dashboard/Sidebar.tsx
index 884f74a..b6cb476 100644
--- a/components/dashboard/Sidebar.tsx
+++ b/components/dashboard/Sidebar.tsx
@@ -14,7 +14,7 @@ interface NavigationItem {
 const NAVIGATION_ITEMS: readonly NavigationItem[] = [
   { label: 'Dashboard', icon: '⌂', href: '/dashboard', available: true },
   { label: 'Jobs & Opportunities', icon: '◇', available: false },
-  { label: 'My Interviews', icon: '▣', available: false },
+  { label: 'My Interviews', icon: '▣', href: '/interviews', available: true },
   { label: 'AI Coach', icon: '✦', available: false },
   { label: 'Reports', icon: '▤', available: false },
   { label: 'Saved Roles', icon: '♡', available: false },
diff --git a/types/interviews.ts b/types/interviews.ts
index 4d0e771..7878624 100644
--- a/types/interviews.ts
+++ b/types/interviews.ts
@@ -9,3 +9,8 @@ export type InterviewListItem = {
   durationSeconds: number
   createdAt: string
 }
+
+export type InterviewHistoryPage = {
+  interviews: InterviewListItem[]
+  nextCursor: string | null
+}
```

```diff
diff --git a/lib/interviews/history-cursor.ts b/lib/interviews/history-cursor.ts
new file mode 100644
--- /dev/null
+++ b/lib/interviews/history-cursor.ts
@@ -0,0 +1,39 @@
+import 'server-only'
+
+type HistoryCursor = { version: 1; createdAt: string; id: string }
+const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
+const TIMESTAMP = /^(\d{4})-(\d{2})-(\d{2})T([01]\d|2[0-3]):([0-5]\d):([0-5]\d)(?:\.\d{1,6})?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/
+
+function validTimestamp(value: unknown): value is string {
+  if (typeof value !== 'string') return false
+  const match = TIMESTAMP.exec(value)
+  if (!match || !Number.isFinite(Date.parse(value))) return false
+  const year = Number(match[1]), month = Number(match[2]), day = Number(match[3])
+  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
+  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
+  return year > 0 && month >= 1 && month <= 12 && day >= 1 && day <= days[month - 1]
+}
+
+function isCursor(value: unknown): value is HistoryCursor {
+  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
+  const item = value as Record<string, unknown>
+  return Object.keys(item).length === 3 && item.version === 1 &&
+    validTimestamp(item.createdAt) && typeof item.id === 'string' && UUID.test(item.id)
+}
+
+export function encodeHistoryCursor(createdAt: string, id: string): string {
+  const payload = { version: 1, createdAt, id }
+  if (!isCursor(payload)) throw new Error('Invalid history position')
+  // Preserve the database string, including microseconds, without Date conversion.
+  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
+}
+
+export function decodeHistoryCursor(token: string): HistoryCursor | null {
+  if (!token || token.length > 512 || !/^[A-Za-z0-9_-]+$/.test(token)) return null
+  try {
+    const bytes = Buffer.from(token, 'base64url')
+    if (bytes.toString('base64url') !== token) return null
+    const payload: unknown = JSON.parse(bytes.toString('utf8'))
+    return isCursor(payload) ? payload : null
+  } catch { return null }
+}
```

```diff
diff --git a/app/interviews/page.tsx b/app/interviews/page.tsx
new file mode 100644
--- /dev/null
+++ b/app/interviews/page.tsx
@@ -0,0 +1,11 @@
+import { redirect } from 'next/navigation'
+import DashboardLayout from '@/components/dashboard/DashboardLayout'
+import InterviewHistory from '@/components/interviews/InterviewHistory'
+import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
+import { AUTH_ROUTES } from '@/lib/auth/auth-constants'
+
+export default async function InterviewsPage() {
+  const auth = await getAuthenticatedUser()
+  if (auth.status === 'unauthorized') redirect(AUTH_ROUTES.login)
+  return <DashboardLayout history><InterviewHistory /></DashboardLayout>
+}
```

```diff
diff --git a/components/interviews/useFullInterviewHistory.ts b/components/interviews/useFullInterviewHistory.ts
new file mode 100644
--- /dev/null
+++ b/components/interviews/useFullInterviewHistory.ts
@@ -0,0 +1,96 @@
+'use client'
+
+import { useCallback, useEffect, useRef, useState } from 'react'
+import { useRouter } from 'next/navigation'
+import { AUTH_ROUTES } from '@/lib/auth/auth-constants'
+import type { InterviewHistoryPage, InterviewListItem } from '@/types/interviews'
+
+type HistoryState = {
+  status: 'loading' | 'error' | 'ready'
+  interviews: InterviewListItem[]
+  nextCursor: string | null
+  more: 'idle' | 'loading' | 'error'
+}
+const INITIAL: HistoryState = { status: 'loading', interviews: [], nextCursor: null, more: 'idle' }
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
+function parsePage(value: unknown, cursor: string | null): InterviewHistoryPage {
+  if (!value || typeof value !== 'object') throw new Error('Invalid history page')
+  const page = value as Record<string, unknown>
+  if (!Array.isArray(page.interviews) || page.interviews.length > 20 || !page.interviews.every(isInterview) ||
+    !(page.nextCursor === null || (typeof page.nextCursor === 'string' &&
+      page.nextCursor.length <= 512 && /^[A-Za-z0-9_-]+$/.test(page.nextCursor))) ||
+    (page.nextCursor !== null && (page.interviews.length !== 20 || page.nextCursor === cursor))) {
+    throw new Error('Invalid history page')
+  }
+  return { interviews: page.interviews, nextCursor: typeof page.nextCursor === 'string' ? page.nextCursor : null }
+}
+
+export function useFullInterviewHistory() {
+  const router = useRouter()
+  const [state, setState] = useState<HistoryState>(INITIAL)
+  const snapshot = useRef(state)
+  const active = useRef<AbortController | null>(null)
+  const mounted = useRef(false)
+  const unauthorized = useRef(false)
+  const update = useCallback((next: HistoryState) => {
+    snapshot.current = next
+    setState(next)
+  }, [])
+
+  const load = useCallback(async (append: boolean) => {
+    if (!mounted.current || active.current || unauthorized.current) return
+    const previous = snapshot.current
+    const cursor = append ? previous.nextCursor : null
+    if (append && (previous.status !== 'ready' || !cursor)) return
+    const controller = new AbortController()
+    active.current = controller
+    update(append ? { ...previous, more: 'loading' } : INITIAL)
+    const current = () => mounted.current && active.current === controller && !controller.signal.aborted
+    try {
+      const url = '/api/interviews?limit=20' + (cursor ? `&cursor=${encodeURIComponent(cursor)}` : '')
+      const response = await fetch(url, { cache: 'no-store', signal: controller.signal })
+      if (!current()) return
+      if (response.status === 401) {
+        unauthorized.current = true
+        update(INITIAL)
+        router.replace(AUTH_ROUTES.login)
+        return
+      }
+      if (!response.ok) throw new Error('History request failed')
+      const payload: unknown = await response.json()
+      const page = parsePage(payload, cursor)
+      if (!current()) return
+      const unique = new Map((append ? previous.interviews : []).map(item => [item.id, item]))
+      page.interviews.forEach(item => { if (!unique.has(item.id)) unique.set(item.id, item) })
+      update({ status: 'ready', interviews: Array.from(unique.values()), nextCursor: page.nextCursor, more: 'idle' })
+    } catch {
+      if (current()) update(append ? { ...previous, more: 'error' } : { ...INITIAL, status: 'error' })
+    } finally {
+      if (active.current === controller) active.current = null
+    }
+  }, [router, update])
+
+  useEffect(() => {
+    mounted.current = true
+    unauthorized.current = false
+    void load(false)
+    return () => {
+      mounted.current = false
+      active.current?.abort()
+      active.current = null
+    }
+  }, [load])
+
+  return { state, retry: () => { void load(false) }, loadMore: () => { void load(true) } }
+}
```

```diff
diff --git a/components/interviews/InterviewHistory.tsx b/components/interviews/InterviewHistory.tsx
new file mode 100644
--- /dev/null
+++ b/components/interviews/InterviewHistory.tsx
@@ -0,0 +1,42 @@
+'use client'
+
+import Link from 'next/link'
+import { useContext } from 'react'
+import { DashboardLanguageContext } from '@/components/dashboard/DashboardLayout'
+import { EmptyState, SectionHeader, TalentryButton } from '@/components/ui'
+import { INTERVIEWS_COPY } from './interviews-copy'
+import InterviewHistoryRow from './InterviewHistoryRow'
+import { useFullInterviewHistory } from './useFullInterviewHistory'
+
+export default function InterviewHistory() {
+  const language = useContext(DashboardLanguageContext)
+  const copy = INTERVIEWS_COPY[language]
+  const { state, retry, loadMore } = useFullInterviewHistory()
+  const start = <Link className="talentry-button talentry-button--primary talentry-button--medium talentry-interviews-action"
+    href="/interview/setup">{copy.start}</Link>
+  return (
+    <div className="talentry-interviews-content">
+      <SectionHeader headingAs="h1" title={copy.title} description={copy.intro} action={start} />
+      {state.status === 'loading' && <p role="status" aria-live="polite" aria-busy="true">{copy.loading}</p>}
+      {state.status === 'error' && <EmptyState title={copy.error} role="alert"
+        action={<TalentryButton onClick={retry}>{copy.retry}</TalentryButton>} />}
+      {state.status === 'ready' && !state.interviews.length &&
+        <EmptyState title={copy.empty} description={copy.emptyHelp} action={start} />}
+      {state.status === 'ready' && state.interviews.length > 0 && <>
+        <ul className="talentry-history-list">
+          {state.interviews.map(interview => <InterviewHistoryRow key={interview.id} interview={interview} language={language} />)}
+        </ul>
+        <div className="talentry-interviews-pagination">
+          <p role="status" aria-live="polite" aria-busy={state.more === 'loading'}>
+            {state.more === 'loading' ? copy.loadingMore : ''}
+          </p>
+          {state.more === 'error' && <p role="alert">{copy.moreError}</p>}
+          {state.nextCursor && <TalentryButton className="talentry-interviews-action"
+            aria-disabled={state.more === 'loading'} onClick={loadMore}>
+            {state.more === 'error' ? copy.retryMore : copy.more}
+          </TalentryButton>}
+        </div>
+      </>}
+    </div>
+  )
+}
```

```diff
diff --git a/components/interviews/InterviewHistoryRow.tsx b/components/interviews/InterviewHistoryRow.tsx
new file mode 100644
--- /dev/null
+++ b/components/interviews/InterviewHistoryRow.tsx
@@ -0,0 +1,35 @@
+import Link from 'next/link'
+import { TalentryBadge } from '@/components/ui'
+import { DASHBOARD_COPY, historyLabel, INTERVIEW_LANGUAGES } from '@/components/dashboard/dashboard-copy'
+import type { AppLanguage } from '@/types/auth'
+import type { InterviewListItem } from '@/types/interviews'
+
+export default function InterviewHistoryRow({ interview, language }: {
+  interview: InterviewListItem; language: AppLanguage
+}) {
+  const copy = DASHBOARD_COPY[language]
+  const role = interview.role.trim() ? interview.role : copy.notProvided
+  const date = new Intl.DateTimeFormat(language, { dateStyle: 'medium', timeStyle: 'short' })
+    .format(new Date(interview.createdAt))
+  const duration = `${Math.floor(interview.durationSeconds / 60)}:${String(interview.durationSeconds % 60).padStart(2, '0')}`
+  return (
+    <li>
+      <Link className="talentry-history-row" href={`/result/${encodeURIComponent(interview.id)}`}
+        aria-label={`${copy.viewResult}: ${role}, ${date}, ${copy.score} ${interview.score}/100`}>
+        <div className="talentry-history-heading">
+          <div className="talentry-history-role">
+            <strong dir="auto">{role}</strong>
+            {interview.company.trim() && <span dir="auto">{interview.company}</span>}
+          </div>
+          <TalentryBadge tone="primary">{copy.score} {interview.score}/100</TalentryBadge>
+        </div>
+        <div className="talentry-history-meta">
+          <time dateTime={interview.createdAt}>{date}</time>
+          <span dir="auto">{historyLabel(copy.interviewTypes, interview.interviewType)}</span>
+          <span dir="auto">{historyLabel(INTERVIEW_LANGUAGES, interview.language)}</span>
+          <span>{copy.duration} {duration}</span>
+        </div>
+      </Link>
+    </li>
+  )
+}
```

```diff
diff --git a/components/interviews/interviews-copy.ts b/components/interviews/interviews-copy.ts
new file mode 100644
--- /dev/null
+++ b/components/interviews/interviews-copy.ts
@@ -0,0 +1,34 @@
+import type { AppLanguage } from '@/types/auth'
+
+type InterviewsCopy = {
+  title: string; intro: string; back: string; start: string; loading: string
+  empty: string; emptyHelp: string; error: string; retry: string
+  more: string; loadingMore: string; moreError: string; retryMore: string
+}
+
+export const INTERVIEWS_COPY: Record<AppLanguage, InterviewsCopy> = {
+  tr: {
+    title: 'Mülakatlarım', intro: 'Kaydedilen mülakatlarını en yeniden en eskiye incele.',
+    back: 'Panele Dön', start: 'Yeni Mülakat Başlat', loading: 'Mülakat geçmişi yükleniyor…',
+    empty: 'Henüz kayıtlı mülakat yok', emptyHelp: 'Tamamladığın ve kaydedilen mülakatlar burada görünecek.',
+    error: 'Mülakat geçmişi yüklenemedi', retry: 'Tekrar Dene', more: 'Daha fazla yükle',
+    loadingMore: 'Daha fazla mülakat yükleniyor…', moreError: 'Diğer mülakatlar yüklenemedi. Görünen kayıtların korundu.',
+    retryMore: 'Daha fazla yüklemeyi tekrar dene',
+  },
+  en: {
+    title: 'My Interviews', intro: 'Browse your saved interviews, newest first.',
+    back: 'Back to Dashboard', start: 'Start New Interview', loading: 'Loading interview history…',
+    empty: 'No saved interviews yet', emptyHelp: 'Your completed and saved interviews will appear here.',
+    error: 'Interview history could not be loaded', retry: 'Retry', more: 'Load more',
+    loadingMore: 'Loading more interviews…', moreError: 'More interviews could not be loaded. Your displayed records are retained.',
+    retryMore: 'Retry loading more',
+  },
+  de: {
+    title: 'Meine Interviews', intro: 'Sieh dir deine gespeicherten Interviews an, die neuesten zuerst.',
+    back: 'Zurück zum Dashboard', start: 'Neues Interview starten', loading: 'Interviewverlauf wird geladen…',
+    empty: 'Noch keine gespeicherten Interviews', emptyHelp: 'Deine abgeschlossenen und gespeicherten Interviews erscheinen hier.',
+    error: 'Interviewverlauf konnte nicht geladen werden', retry: 'Erneut versuchen', more: 'Mehr laden',
+    loadingMore: 'Weitere Interviews werden geladen…', moreError: 'Weitere Interviews konnten nicht geladen werden. Die angezeigten Einträge bleiben erhalten.',
+    retryMore: 'Weitere Interviews erneut laden',
+  },
+}
```

```diff
diff --git a/styles/talentry-interviews.css b/styles/talentry-interviews.css
new file mode 100644
--- /dev/null
+++ b/styles/talentry-interviews.css
@@ -0,0 +1,95 @@
+.talentry-interviews-layout.talentry-dashboard-layout {
+  height: auto;
+  min-height: 100dvh;
+  overflow: visible;
+  background: var(--talentry-color-canvas);
+  color: var(--talentry-color-text);
+}
+
+.talentry-interviews-layout .talentry-dashboard-shell {
+  display: block;
+  height: auto;
+  min-width: 0;
+}
+
+.talentry-interviews-layout .talentry-dashboard-main {
+  display: block;
+  overflow: visible;
+  padding: var(--talentry-space-6) var(--talentry-space-4);
+}
+
+.talentry-interviews-header {
+  display: flex;
+  flex-wrap: wrap;
+  align-items: center;
+  justify-content: space-between;
+  gap: var(--talentry-space-3);
+  padding: var(--talentry-space-3) var(--talentry-space-4);
+  background: var(--talentry-color-surface);
+  border-bottom: var(--talentry-card-border);
+  font-weight: var(--talentry-font-weight-semibold);
+}
+
+.talentry-interviews-header a {
+  display: inline-flex;
+  align-items: center;
+  min-height: var(--talentry-button-height-md);
+  color: var(--talentry-color-primary);
+}
+
+.talentry-interviews-content {
+  display: grid;
+  gap: var(--talentry-space-6);
+  width: 100%;
+  max-width: 64rem;
+  margin-inline: auto;
+}
+
+.talentry-interviews-content,
+.talentry-interviews-content > *,
+.talentry-interviews-header > * {
+  min-width: 0;
+  overflow-wrap: anywhere;
+}
+
+.talentry-interviews-content .talentry-history-row {
+  padding: var(--talentry-space-4);
+}
+
+.talentry-interviews-content .talentry-interviews-action {
+  min-height: var(--talentry-button-height-md);
+  height: auto;
+  max-width: 100%;
+  padding-block: var(--talentry-space-3);
+  white-space: normal;
+  text-align: center;
+  text-decoration: none;
+}
+
+.talentry-interviews-pagination { text-align: center; }
+.talentry-interviews-pagination p:empty { margin: 0; }
+.talentry-interviews-pagination [aria-disabled='true'] { cursor: wait; }
+
+.talentry-interviews-header a:focus-visible,
+.talentry-interviews-action:focus-visible,
+.talentry-dashboard-bottom-nav .talentry-interviews-narrow-link:focus-visible {
+  outline: 2px solid var(--talentry-color-border-focus);
+  outline-offset: var(--talentry-space-1);
+}
+
+@media (min-width: 641px) and (max-width: 767px) {
+  .talentry-dashboard-bottom-nav .talentry-interviews-narrow-link {
+    width: var(--talentry-button-height-md);
+    height: var(--talentry-button-height-md);
+    color: var(--talentry-color-primary);
+    text-decoration: none;
+  }
+}
+
+@media (max-width: 640px) {
+  .talentry-interviews-content .talentry-section-header { flex-direction: column; align-items: stretch; }
+  .talentry-interviews-content .talentry-section-header__action,
+  .talentry-interviews-content .talentry-interviews-action { width: 100%; }
+}
+
+/* History introduces no animation or swipe transitions, including under reduced motion. */
```

```diff
diff --git a/docs/01_Engineering/Sprint_FULL_INTERVIEW_HISTORY_20260920_Summary.md b/docs/01_Engineering/Sprint_FULL_INTERVIEW_HISTORY_20260920_Summary.md
new file mode 100644
--- /dev/null
+++ b/docs/01_Engineering/Sprint_FULL_INTERVIEW_HISTORY_20260920_Summary.md
@@ -0,0 +1,28 @@
+# Sprint FULL_INTERVIEW_HISTORY_20260920 Summary
+
+- Title: Full My Interviews / History
+- Branch: feature/auth-foundation
+- Starting HEAD: bde16128e24131c8d28f3b2def7f2fef2ccdfdb7
+- Status: Static validation completed; awaiting approval. Runtime acceptance pending. Production build pending.
+- Goal: Add server-protected /interviews with owner-scoped cursor pagination and compact localized history browsing.
+- Completed: explicit limit=20 history requests, precision-preserving cursors, loading/empty/error/retry states, Load more with duplicate and concurrency protection, responsive document scrolling, Sidebar and narrow-width navigation.
+- Compatibility: omitted-limit GET requests retain their existing unbounded-at-application-level behavior; Dashboard retains limit=5. POST and Result behavior are unchanged.
+- Validation: first npx.cmd tsc --noEmit exited 1 (TS2322 and TS2802 in the new hook); corrected narrowing and ES5-compatible Map conversion. Second run exited 0. Generated tsconfig.tsbuildinfo removed. git diff --check exited 0. Complete source diff inspected.
+- Notices: npm printed an available major-version update notice (11.16.0 to 12.0.2); no update performed. Git warned LF will be replaced by CRLF on its next touch of four modified source files.
+- Risks/problems: runtime behavior, deployed database cursor predicates, cross-owner acceptance, browser rendering, and production build remain unverified by instruction. No package/schema/RLS/auth changes.
+- Approval status: Not yet approved. No staging, commit, push, or Project Memory update.
+- Created files:
+- lib/interviews/history-cursor.ts
+- app/interviews/page.tsx
+- components/interviews/useFullInterviewHistory.ts
+- components/interviews/InterviewHistory.tsx
+- components/interviews/InterviewHistoryRow.tsx
+- components/interviews/interviews-copy.ts
+- styles/talentry-interviews.css
+- docs/01_Engineering/Sprint_FULL_INTERVIEW_HISTORY_20260920_Summary.md
+- docs/01_Engineering/Sprint_FULL_INTERVIEW_HISTORY_20260920_Engineering_Report.md
+- Modified files:
+- app/api/interviews/route.ts
+- types/interviews.ts
+- components/dashboard/Sidebar.tsx
+- components/dashboard/DashboardLayout.tsx
```

## 13. Risks, limitations and technical debt
Runtime acceptance pending: 0/1/20/21/40/>40 records; timestamp ties and microseconds; insert between page loads; end-of-history; initial/incremental failures and retry; concurrency/deduplication; malformed payloads and cursor; 401; two-account isolation and copied cursor; refresh, Result and Setup navigation; TR/EN/DE; 390x844 and 640/641/767/768/1119/1120 boundaries.
Production build pending by explicit instruction.
Existing no-limit behavior is intentionally not bounded. Deployed database API row caps and query performance are unmeasured. No speculative index migration.
Timestamp validation supports modern ISO timestamps with up to PostgreSQL microsecond precision. Legacy out-of-format database timestamps would need investigation.
No persistent page/scroll restoration, virtualization, filtering or total count. Appending repeatedly grows the rendered list.
The existing embedded Dashboard CSS remains; no unrelated refactoring. Browser cascade, focus at end-of-history and document scrolling require runtime acceptance.

## 14. Untouched-module confirmation
POST function, detail endpoint, Result files, Interview files, Setup files, Dashboard recent-history hook/presentation, root routing, auth helpers, schema/RLS, design tokens and shared primitives unchanged.
No secrets displayed; no database/network runtime tests or test data inserted. No packages installed. No Project Memory update. No staging, commit, push, reset, restore or stash.

## 15. Approval required
Implementation awaits user approval. Static validation completed; runtime acceptance and production build pending. Stop here. Do not begin the next stage or commit without explicit authorization.


## 16. Approved product follow-up — remove duplicate Dashboard history

### Authority, objective and starting state
The user explicitly changed the product decision: /interviews is now the sole interview-history surface, and requested updating the existing Full History reports. This section supersedes earlier latest-five preservation and three-panel statements; preceding sections describe the earlier implementation stage.
Started from the existing uncommitted Full History working tree, not a clean/reset tree. Branch feature/auth-foundation and HEAD bde16128e24131c8d28f3b2def7f2fef2ccdfdb7 remained unchanged. No unexpected changes at entry.

### Completed changes and file responsibilities
- components/dashboard/DashboardContainer.tsx: remove recent card, recent mobile panel, hook call, state and imports. Preserve Welcome, Quick Actions, Setup action and Jobs/Insights/Tip/Premium placeholders. Desktop groups now contain only the six remaining cards.
- components/dashboard/DashboardMobile.tsx: labels/pages are exactly two-entry readonly tuples; navigation clamps using pages.length - 1. Initial index remains 0; direct dots, swipe threshold, scroll reset on page switch and focus relocation are retained.
- components/dashboard/DashboardLayout.tsx: remove obsolete recent-card selectors; tablet Quick Actions spans full width. At desktop >=1120, existing Welcome/Quick 8/4 split remains, Jobs spans full width at 180px minimum, followed by three 4-column placeholders. Existing Full History shell and navigation changes remain intact.
- components/dashboard/dashboard-copy.ts: remove unused recent/latest/loading/empty/first/error/retry Dashboard-only properties from types and all languages. Pager labels now Ana Sayfa/İşlemler, Home/Actions, Startseite/Aktionen. Retain score, duration, viewResult, notProvided, interviewTypes, INTERVIEW_LANGUAGES and historyLabel because Full History rows use them. My Interviews labels unchanged.
- styles/talentry-dashboard.css: remove unused history-caption/history-status rules only. Retain shared row/list styles, Setup action styles and mobile pager sizing/scroll/footer behavior.
- Deleted components/dashboard/RecentInterviews.tsx and components/dashboard/useInterviewHistory.ts after confirming they were exclusively wired to Dashboard.
- Updated these two existing sprint reports as explicitly requested. No new report pair or unrelated files introduced.

### Interfaces, architecture and data lifecycle
DashboardMobileProps.labels and .pages now enforce exactly two entries. DashboardCopy.panels matches this contract. No API/interface change outside these Dashboard types.
Dashboard no longer invokes interview fetches on mount, focus or pageshow because its exclusive hook has been removed. No dead references to RecentInterviews, useInterviewHistory, card-recent or limit=5 remain in app/components/styles.
No additional history action was added to Dashboard content. My Interviews remains accessible through existing Sidebar/menu/narrow navigation. Full History retains its independent hook and cursor lifecycle.

### Accessibility, styling and preservation
Two 44px pager buttons have localized names and aria-current/aria-controls. Hidden inactive panels and focus preservation are unchanged. The existing viewport scrolls while the pager remains a stable sibling; duplicate bottom navigation remains hidden at mobile widths. No new animation or color palette.
No fabricated data or replacement card. Existing token-based shared row styling retained for /interviews.
This follow-up did not edit app/interviews, components/interviews, history cursor/API/types, Sidebar, Result, Interview, Setup, auth, RLS/schema, shared primitives or Project Memory. DashboardLayout was edited only for obsolete selectors and grid balance, preserving its earlier history mode.

### Validation and exact results
- npx.cmd tsc --noEmit: exit 0 on first follow-up run.
- After the final tablet grid adjustment, npx.cmd tsc --noEmit: exit 0.
- Both runs printed only npm's version-update notice (11.16.0 -> 12.0.2); no install performed.
- Generated tsconfig.tsbuildinfo removed after validation.
- git diff --check: exit 0, no whitespace errors.
- Git warns LF will be replaced by CRLF next time it touches the modified source files; no normalization command was run.
- Complete relevant diff inspected, including both deleted files. Reference search found no remaining Dashboard recent-history wiring.
- Production build not run by instruction.
- User-reported prior History -> Result -> Dashboard runtime navigation passed; this is user-provided evidence, not a test performed in this follow-up.
- Follow-up runtime/visual/no-fetch acceptance is pending.

### Risks, deferred checks and approval
Verify 390x844 two-panel swipe/dot navigation, keyboard focus, footer stability and no horizontal overflow; desktop/tablet grid balance; TR/EN/DE; browser network absence of Dashboard interview-history requests; preservation of /interviews navigation.
No unresolved static errors. Production build remains pending. No stage/commit/push/reset/restore/stash. Approval of this follow-up is required before further work.

### Current Git status
The following includes the preserved earlier Full History implementation and this follow-up:
```text
 M app/api/interviews/route.ts
 M components/dashboard/DashboardContainer.tsx
 M components/dashboard/DashboardLayout.tsx
 M components/dashboard/DashboardMobile.tsx
 D components/dashboard/RecentInterviews.tsx
 M components/dashboard/Sidebar.tsx
 M components/dashboard/dashboard-copy.ts
 D components/dashboard/useInterviewHistory.ts
 M styles/talentry-dashboard.css
 M types/interviews.ts
?? app/interviews/
?? components/interviews/
?? docs/01_Engineering/Sprint_FULL_INTERVIEW_HISTORY_20260920_Engineering_Report.md
?? docs/01_Engineering/Sprint_FULL_INTERVIEW_HISTORY_20260920_Summary.md
?? lib/interviews/
?? styles/talentry-interviews.css
```

### Complete current follow-up source diffs against recovery HEAD
DashboardLayout includes the preserved earlier Full History shell changes; its follow-up-only changes are the grid selectors described above.
```diff
diff --git a/components/dashboard/DashboardContainer.tsx b/components/dashboard/DashboardContainer.tsx
index a1eb6b7..7f8b2b6 100644
--- a/components/dashboard/DashboardContainer.tsx
+++ b/components/dashboard/DashboardContainer.tsx
@@ -5,19 +5,16 @@ import { useContext } from 'react'
 import { DashboardLanguageContext } from './DashboardLayout'
 import { DASHBOARD_COPY } from './dashboard-copy'
 import DashboardMobile from './DashboardMobile'
-import RecentInterviews from './RecentInterviews'
 import Sidebar from './Sidebar'
-import { useInterviewHistory } from './useInterviewHistory'
 
 const DESKTOP_GROUPS = [
-  ['welcome', 'quick'], ['recent'], ['jobs', 'insights', 'tip', 'premium'],
+  ['welcome', 'quick'], ['jobs', 'insights', 'tip', 'premium'],
 ] as const
 type CardVariant = typeof DESKTOP_GROUPS[number][number]
 
 export default function DashboardContainer() {
   const language = useContext(DashboardLanguageContext)
   const copy = DASHBOARD_COPY[language]
-  const { state, retry } = useInterviewHistory()
 
   function renderCard(variant: CardVariant) {
     return (
@@ -26,10 +23,6 @@ export default function DashboardContainer() {
         {variant === 'quick' && <Link
           className="talentry-button talentry-button--primary talentry-button--large talentry-history-action"
           href="/interview/setup">{copy.start}</Link>}
-        {variant === 'recent' && <>
-          <p className="talentry-history-caption">{copy.latest}</p>
-          <RecentInterviews state={state} retry={retry} copy={copy} language={language} />
-        </>}
       </article>
     )
   }
@@ -53,9 +46,6 @@ export default function DashboardContainer() {
             {renderCard('welcome')}
             <Sidebar copy={copy} mobile />
           </div>,
-          <div key="recent" className="talentry-dashboard-mobile-cards">
-            {renderCard('recent')}
-          </div>,
           <div key="actions" className="talentry-dashboard-mobile-cards">
             {(['quick', 'jobs', 'insights', 'tip', 'premium'] as const).map(renderCard)}
           </div>,
diff --git a/components/dashboard/DashboardLayout.tsx b/components/dashboard/DashboardLayout.tsx
index fb27467..83b7322 100644
--- a/components/dashboard/DashboardLayout.tsx
+++ b/components/dashboard/DashboardLayout.tsx
@@ -1,22 +1,26 @@
 'use client'
 
 import { createContext, useEffect, useState } from 'react'
+import Link from 'next/link'
 import type { ReactNode } from 'react'
 import type { AppLanguage } from '@/types/auth'
 import { DEFAULT_APP_LANGUAGE, SUPPORTED_APP_LANGUAGES } from '@/lib/auth/auth-constants'
 import { DASHBOARD_COPY, DASHBOARD_LANGUAGE_KEY } from './dashboard-copy'
 import '@/styles/talentry-dashboard.css'
+import '@/styles/talentry-interviews.css'
+import { INTERVIEWS_COPY } from '@/components/interviews/interviews-copy'
 
 import Sidebar from './Sidebar'
 import Topbar from './Topbar'
 
 interface DashboardLayoutProps {
   children: ReactNode
+  history?: boolean
 }
 
 export const DashboardLanguageContext = createContext<AppLanguage>(DEFAULT_APP_LANGUAGE)
 
-export default function DashboardLayout({ children }: DashboardLayoutProps) {
+export default function DashboardLayout({ children, history = false }: DashboardLayoutProps) {
   const [language, setLanguage] = useState<AppLanguage>(DEFAULT_APP_LANGUAGE)
   useEffect(() => {
     const readLanguage = () => {
@@ -36,21 +40,26 @@ export default function DashboardLayout({ children }: DashboardLayoutProps) {
   const copy = DASHBOARD_COPY[language]
   return (
     <DashboardLanguageContext.Provider value={language}>
-    <div className="talentry-dashboard-layout" lang={language}>
+    <div className={`talentry-dashboard-layout${history ? ' talentry-interviews-layout' : ''}`} lang={language}>
       <Sidebar copy={copy} />
 
       <div className="talentry-dashboard-shell">
-        <Topbar copy={copy} />
+        {history ? <header className="talentry-interviews-header">
+          <span>Talentry</span>
+          <Link href="/dashboard">{INTERVIEWS_COPY[language].back}</Link>
+        </header> : <Topbar copy={copy} />}
         <main className="talentry-dashboard-main">{children}</main>
       </div>
 
-      <nav className="talentry-dashboard-bottom-nav" aria-label={copy.mobileNavigation}>
+      {!history && <nav className="talentry-dashboard-bottom-nav" aria-label={copy.mobileNavigation}>
         {['⌂', '◇', '▣', '✦', '●'].map((icon, index) => (
+          index === 2 ? <Link key={`${icon}-${index}`} href="/interviews" aria-label={copy.nav[2]}
+            className="talentry-dashboard-bottom-item talentry-interviews-narrow-link"><span aria-hidden="true">{icon}</span></Link> :
           <span key={`${icon}-${index}`} className="talentry-dashboard-bottom-item" aria-hidden="true">
             {icon}
           </span>
         ))}
-      </nav>
+      </nav>}
 
       <style>{`
         :root {
@@ -313,7 +322,7 @@ export default function DashboardLayout({ children }: DashboardLayoutProps) {
           }
 
           .talentry-dashboard-card-welcome,
-          .talentry-dashboard-card-recent,
+          .talentry-dashboard-card-quick,
           .talentry-dashboard-card-jobs {
             grid-column: 1 / -1;
           }
@@ -409,10 +418,9 @@ export default function DashboardLayout({ children }: DashboardLayoutProps) {
             min-height: 190px;
           }
 
-          .talentry-dashboard-card-recent,
           .talentry-dashboard-card-jobs {
-            grid-column: span 6;
-            min-height: 260px;
+            grid-column: 1 / -1;
+            min-height: 180px;
           }
 
           .talentry-dashboard-card-insights,
diff --git a/components/dashboard/DashboardMobile.tsx b/components/dashboard/DashboardMobile.tsx
index 5c9a61b..8879e94 100644
--- a/components/dashboard/DashboardMobile.tsx
+++ b/components/dashboard/DashboardMobile.tsx
@@ -4,9 +4,9 @@ import { useRef, useState } from 'react'
 import type { ReactNode, TouchEvent } from 'react'
 
 interface DashboardMobileProps {
-  labels: readonly [string, string, string]
+  labels: readonly [string, string]
   navigationLabel: string
-  pages: readonly [ReactNode, ReactNode, ReactNode]
+  pages: readonly [ReactNode, ReactNode]
 }
 
 export default function DashboardMobile({ labels, navigationLabel, pages }: DashboardMobileProps) {
@@ -16,7 +16,7 @@ export default function DashboardMobile({ labels, navigationLabel, pages }: Dash
   const touchStart = useRef<{ x: number; y: number } | null>(null)
 
   function navigate(index: number) {
-    const next = Math.max(0, Math.min(2, index))
+    const next = Math.max(0, Math.min(pages.length - 1, index))
     if (next === activePanel) return
     const moveFocus = panels.current[activePanel]?.contains(document.activeElement)
     setActivePanel(next)
diff --git a/components/dashboard/RecentInterviews.tsx b/components/dashboard/RecentInterviews.tsx
deleted file mode 100644
index 9f31801..0000000
--- a/components/dashboard/RecentInterviews.tsx
+++ /dev/null
@@ -1,60 +0,0 @@
-import Link from 'next/link'
-import { EmptyState, TalentryBadge, TalentryButton } from '@/components/ui'
-import type { AppLanguage } from '@/types/auth'
-import type { DashboardCopy } from './dashboard-copy'
-import { historyLabel, INTERVIEW_LANGUAGES } from './dashboard-copy'
-import type { HistoryState } from './useInterviewHistory'
-
-interface RecentInterviewsProps {
-  state: HistoryState
-  retry: () => void
-  copy: DashboardCopy
-  language: AppLanguage
-}
-
-export default function RecentInterviews({ state, retry, copy, language }: RecentInterviewsProps) {
-  if (state.status === 'loading') {
-    return <p className="talentry-history-status" role="status" aria-busy="true">{copy.loading}</p>
-  }
-  if (state.status === 'empty') {
-    return <EmptyState variant="compact" headingAs="h3" title={copy.empty} description={copy.emptyHelp}
-      action={<Link className="talentry-button talentry-button--primary talentry-button--medium talentry-history-action"
-        href="/interview/setup">{copy.first}</Link>} />
-  }
-  if (state.status === 'error') {
-    return <EmptyState variant="compact" headingAs="h3" role="alert" title={copy.error} description={copy.errorHelp}
-      action={<TalentryButton onClick={retry}>{copy.retry}</TalentryButton>} />
-  }
-  if (state.status !== 'success') return null
-
-  const dateFormat = new Intl.DateTimeFormat(language, { dateStyle: 'medium', timeStyle: 'short' })
-  return (
-    <ul className="talentry-history-list">
-      {state.interviews.map(interview => {
-        const role = interview.role.trim() ? interview.role : copy.notProvided
-        const date = dateFormat.format(new Date(interview.createdAt))
-        const duration = `${Math.floor(interview.durationSeconds / 60)}:${String(interview.durationSeconds % 60).padStart(2, '0')}`
-        return (
-          <li key={interview.id}>
-            <Link className="talentry-history-row" href={`/result/${encodeURIComponent(interview.id)}`}
-              aria-label={`${copy.viewResult}: ${role}, ${date}, ${copy.score} ${interview.score}/100`}>
-              <div className="talentry-history-heading">
-                <div className="talentry-history-role">
-                  <strong dir="auto">{role}</strong>
-                  {interview.company.trim() && <span dir="auto">{interview.company}</span>}
-                </div>
-                <TalentryBadge tone="primary">{copy.score} {interview.score}/100</TalentryBadge>
-              </div>
-              <div className="talentry-history-meta">
-                <time dateTime={interview.createdAt}>{date}</time>
-                <span dir="auto">{historyLabel(copy.interviewTypes, interview.interviewType)}</span>
-                <span dir="auto">{historyLabel(INTERVIEW_LANGUAGES, interview.language)}</span>
-                <span>{copy.duration} {duration}</span>
-              </div>
-            </Link>
-          </li>
-        )
-      })}
-    </ul>
-  )
-}
diff --git a/components/dashboard/dashboard-copy.ts b/components/dashboard/dashboard-copy.ts
index 9945362..2bf913a 100644
--- a/components/dashboard/dashboard-copy.ts
+++ b/components/dashboard/dashboard-copy.ts
@@ -3,12 +3,12 @@ import type { AppLanguage } from '@/types/auth'
 export const DASHBOARD_LANGUAGE_KEY = 'interviewai_uilang'
 export type DashboardCopy = {
   overview: string; navigation: string; mobileNavigation: string
-  welcome: string; quick: string; recent: string; jobs: string; insights: string; tip: string; premium: string
-  start: string; latest: string; loading: string; empty: string; emptyHelp: string; first: string
-  error: string; errorHelp: string; retry: string; score: string; duration: string; viewResult: string
+  welcome: string; quick: string; jobs: string; insights: string; tip: string; premium: string
+  start: string
+  score: string; duration: string; viewResult: string
   notProvided: string; search: string; notifications: string; profile: string
   nav: readonly [string, string, string, string, string, string, string, string]
-  panels: readonly [string, string, string]
+  panels: readonly [string, string]
   interviewTypes: Record<string, string>
 }
 
@@ -23,44 +23,38 @@ export function historyLabel(labels: Readonly<Record<string, string>>, value: st
 export const DASHBOARD_COPY: Record<AppLanguage, DashboardCopy> = {
   tr: {
     overview: 'Panel özeti', navigation: 'Panel gezinme menüsü', mobileNavigation: 'Mobil gezinme yer tutucusu',
-    welcome: 'Hoş geldin', quick: 'Hızlı İşlemler', recent: 'Son Mülakatlar', jobs: 'Önerilen İşler',
+    welcome: 'Hoş geldin', quick: 'Hızlı İşlemler', jobs: 'Önerilen İşler',
     insights: 'Yapay Zekâ İçgörüleri', tip: 'Günün İpucu', premium: 'Premium',
-    start: 'Yeni Mülakat Başlat', latest: 'Son 5 kayıt', loading: 'Mülakat geçmişi yükleniyor…',
-    empty: 'Henüz kayıtlı mülakat yok', emptyHelp: 'Tamamladığın ve kaydedilen mülakatlar burada görünecek.',
-    first: 'İlk mülakatını başlat', error: 'Mülakat geçmişi yüklenemedi',
-    errorHelp: 'Kayıtlarını görüntülemek için tekrar dene.', retry: 'Tekrar Dene', score: 'Puan', duration: 'Süre',
+    start: 'Yeni Mülakat Başlat',
+    score: 'Puan', duration: 'Süre',
     viewResult: 'Sonucu görüntüle', notProvided: 'Belirtilmedi', search: 'Ara',
     notifications: 'Bildirimler yer tutucusu', profile: 'Profil yer tutucusu',
     nav: ['Panel', 'İşler ve Fırsatlar', 'Mülakatlarım', 'Yapay Zekâ Koçu', 'Raporlar', 'Kaydedilen Pozisyonlar', 'Ayarlar', 'Premium'],
-    panels: ['Ana Sayfa', 'Son Mülakatlar', 'İşlemler'],
+    panels: ['Ana Sayfa', 'İşlemler'],
     interviewTypes: { behavioral: 'Davranışsal / İK', technical: 'Teknik', mixed: 'Karma', case: 'Vaka Analizi' },
   },
   en: {
     overview: 'Dashboard overview', navigation: 'Dashboard navigation', mobileNavigation: 'Mobile navigation placeholder',
-    welcome: 'Welcome', quick: 'Quick Actions', recent: 'Recent Interviews', jobs: 'Recommended Jobs',
+    welcome: 'Welcome', quick: 'Quick Actions', jobs: 'Recommended Jobs',
     insights: 'AI Insights', tip: 'Daily Tip', premium: 'Premium',
-    start: 'Start New Interview', latest: 'Latest 5', loading: 'Loading interview history…',
-    empty: 'No saved interviews yet', emptyHelp: 'Your completed and saved interviews will appear here.',
-    first: 'Start your first interview', error: 'Interview history could not be loaded',
-    errorHelp: 'Retry to view your saved interviews.', retry: 'Retry', score: 'Score', duration: 'Duration',
+    start: 'Start New Interview',
+    score: 'Score', duration: 'Duration',
     viewResult: 'View result', notProvided: 'Not provided', search: 'Search',
     notifications: 'Notifications placeholder', profile: 'Profile placeholder',
     nav: ['Dashboard', 'Jobs & Opportunities', 'My Interviews', 'AI Coach', 'Reports', 'Saved Roles', 'Settings', 'Premium'],
-    panels: ['Home', 'Recent Interviews', 'Actions'],
+    panels: ['Home', 'Actions'],
     interviewTypes: { behavioral: 'Behavioral / HR', technical: 'Technical', mixed: 'Mixed', case: 'Case Study' },
   },
   de: {
     overview: 'Dashboard-Übersicht', navigation: 'Dashboard-Navigation', mobileNavigation: 'Platzhalter für mobile Navigation',
-    welcome: 'Willkommen', quick: 'Schnellzugriff', recent: 'Letzte Interviews', jobs: 'Empfohlene Stellen',
+    welcome: 'Willkommen', quick: 'Schnellzugriff', jobs: 'Empfohlene Stellen',
     insights: 'KI-Einblicke', tip: 'Tipp des Tages', premium: 'Premium',
-    start: 'Neues Interview starten', latest: 'Letzte 5', loading: 'Interviewverlauf wird geladen…',
-    empty: 'Noch keine gespeicherten Interviews', emptyHelp: 'Deine abgeschlossenen und gespeicherten Interviews erscheinen hier.',
-    first: 'Starte dein erstes Interview', error: 'Interviewverlauf konnte nicht geladen werden',
-    errorHelp: 'Versuche erneut, deine gespeicherten Interviews zu laden.', retry: 'Erneut versuchen', score: 'Punktzahl', duration: 'Dauer',
+    start: 'Neues Interview starten',
+    score: 'Punktzahl', duration: 'Dauer',
     viewResult: 'Ergebnis ansehen', notProvided: 'Nicht angegeben', search: 'Suchen',
     notifications: 'Platzhalter für Benachrichtigungen', profile: 'Profilplatzhalter',
     nav: ['Dashboard', 'Stellen & Chancen', 'Meine Interviews', 'KI-Coach', 'Berichte', 'Gespeicherte Stellen', 'Einstellungen', 'Premium'],
-    panels: ['Startseite', 'Letzte Interviews', 'Aktionen'],
+    panels: ['Startseite', 'Aktionen'],
     interviewTypes: { behavioral: 'Verhalten / HR', technical: 'Technisch', mixed: 'Gemischt', case: 'Fallstudie' },
   },
 }
diff --git a/components/dashboard/useInterviewHistory.ts b/components/dashboard/useInterviewHistory.ts
deleted file mode 100644
index 048faae..0000000
--- a/components/dashboard/useInterviewHistory.ts
+++ /dev/null
@@ -1,83 +0,0 @@
-'use client'
-
-import { useCallback, useEffect, useState } from 'react'
-import { useRouter } from 'next/navigation'
-import { AUTH_ROUTES } from '@/lib/auth/auth-constants'
-import type { InterviewListItem } from '@/types/interviews'
-
-export type HistoryState =
-  | { status: 'loading' | 'empty' | 'error' }
-  | { status: 'success'; interviews: InterviewListItem[] }
-
-function isInterview(value: unknown): value is InterviewListItem {
-  if (!value || typeof value !== 'object') return false
-  const row = value as Record<string, unknown>
-  return typeof row.id === 'string' &&
-    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(row.id) &&
-    ['role', 'company', 'level', 'interviewType', 'language'].every(key => typeof row[key] === 'string') &&
-    typeof row.score === 'number' && Number.isInteger(row.score) && row.score >= 0 && row.score <= 100 &&
-    typeof row.durationSeconds === 'number' && Number.isInteger(row.durationSeconds) && row.durationSeconds >= 0 &&
-    typeof row.createdAt === 'string' && Number.isFinite(Date.parse(row.createdAt))
-}
-
-function parseHistory(payload: unknown): InterviewListItem[] {
-  if (!payload || typeof payload !== 'object' || !('interviews' in payload) ||
-    !Array.isArray(payload.interviews) || payload.interviews.length > 5 ||
-    !payload.interviews.every(isInterview)) throw new Error('Invalid interview list')
-  return payload.interviews
-}
-
-export function useInterviewHistory() {
-  const router = useRouter()
-  const [state, setState] = useState<HistoryState>({ status: 'loading' })
-  const [attempt, setAttempt] = useState(0)
-  const retry = useCallback(() => setAttempt(value => value + 1), [])
-
-  useEffect(() => {
-    let controller: AbortController | undefined
-    let disposed = false
-    let unauthorized = false
-
-    async function load() {
-      if (disposed || unauthorized) return
-      controller?.abort()
-      const current = new AbortController()
-      controller = current
-      setState({ status: 'loading' })
-      try {
-        const response = await fetch('/api/interviews?limit=5', {
-          cache: 'no-store', signal: current.signal,
-        })
-        if (current.signal.aborted || disposed) return
-        if (response.status === 401) {
-          unauthorized = true
-          setState({ status: 'loading' })
-          router.replace(AUTH_ROUTES.login)
-          return
-        }
-        if (!response.ok) throw new Error('History request failed')
-        const payload: unknown = await response.json()
-        const interviews = parseHistory(payload)
-        if (!current.signal.aborted && !disposed) {
-          setState(interviews.length ? { status: 'success', interviews } : { status: 'empty' })
-        }
-      } catch {
-        if (!current.signal.aborted && !disposed) setState({ status: 'error' })
-      }
-    }
-
-    const onFocus = () => { void load() }
-    const onPageShow = (event: PageTransitionEvent) => { if (event.persisted) void load() }
-    void load()
-    window.addEventListener('focus', onFocus)
-    window.addEventListener('pageshow', onPageShow)
-    return () => {
-      disposed = true
-      controller?.abort()
-      window.removeEventListener('focus', onFocus)
-      window.removeEventListener('pageshow', onPageShow)
-    }
-  }, [attempt, router])
-
-  return { state, retry }
-}
diff --git a/styles/talentry-dashboard.css b/styles/talentry-dashboard.css
index 367a10b..c059a13 100644
--- a/styles/talentry-dashboard.css
+++ b/styles/talentry-dashboard.css
@@ -20,17 +20,6 @@
   margin-top: var(--talentry-space-5);
 }
 
-.talentry-history-caption,
-.talentry-history-status {
-  color: var(--talentry-color-text-secondary);
-  font-size: var(--talentry-font-size-sm);
-  line-height: var(--talentry-line-height-normal);
-}
-
-.talentry-history-caption {
-  margin: var(--talentry-space-2) 0 var(--talentry-space-4);
-}
-
 .talentry-history-list {
   display: grid;
   gap: var(--talentry-space-2);
```
