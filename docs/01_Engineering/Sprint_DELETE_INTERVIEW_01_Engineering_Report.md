# Sprint DELETE_INTERVIEW_01 Engineering Report

## 1. Report Identity

Stage DELETE_INTERVIEW_01; permanent single-interview owner deletion. Date 2026-10-03, Europe/Istanbul. Branch feature/auth-foundation. Implementation, automated validation and qualified local browser acceptance PASS; wrong-owner live DELETE not completed. Final test-harness cleanup and validation results are recorded in the final addendum below.

## 2. Sprint Objective and Boundaries

Implement permanent hard deletion of one persisted interview owned by the authenticated user. Result-only action and inline confirmation. No History controls, bulk deletion, archive, soft-delete, undo, schema/RLS/dependency/config change, analytics, live fixtures or privileged cleanup. Project Memory remains untouched until browser acceptance. No Git mutation authorized.

## 3. Repository State Before Implementation

Verified repository C:/Users/p-ayd/interviewai, branch feature/auth-foundation, HEAD faac5e2, local origin/feature/auth-foundation faac5e2, clean working tree. No fetch was performed. Subsequent diagnosis/resumption inspected only expected uncommitted stage files. The dev server originally blocked the build gate; the user manually stopped it. The same elevated read-only Win32_Process check then returned no matching repository/next-dev processes (exit 0). Nothing was terminated or restarted by this stage.

## 4. Architecture and Implementation Decisions

DELETION IS PERMANENT. Existing repository schema stores answers/summary in the interview row and defines no inbound interview FK or stored PDF dependency. No migration required; live schema drift was not inspected.

Server-only helper authenticates before validating UUID using existing detail-read regex semantics. It derives owner ID solely from authenticated user and executes one query, without a prior interview read:

```ts
const { data, error } = await admin.from('interviews')
  .delete()
  .eq('id', id)
  .eq('owner_id', auth.user.id)
  .select('id')
  .maybeSingle()
```

Returned ID must match requested ID (case-insensitive UUID comparison). Zero rows means notFound. Provider errors and thrown failures return deleteError. No content/ID/raw error logging added. Privileged credentials remain behind server-only imports.

DELETE maps results to 200 {"deleted":true}, 401 {"error":"Unauthorized"}, 400 {"error":"Invalid interview id"}, 404 {"error":"Interview not found"}, or 500 {"error":"Failed to delete interview"}. All handled/exception DELETE responses have Cache-Control: private, no-store. Wrong-owner/nonexistent/repeated requests share 404. Request body/query ownership is not consumed. Existing GET implementation is unchanged.

Client hook owns confirmation, request, cancellation cleanup and response states. A synchronous AbortController ref prevents duplicate submission before rerender. Requests use DELETE, same-origin credentials, no-store and signal; no body. Success requires response.ok plus parsed object with deleted === true. Only confirmed success navigates to /interviews with router.replace. 401 goes to established login; 400/404 become terminal unavailable with History link; failures preserve confirmation and permit retry. Unmount or ID change aborts pending work and suppresses stale completion. Success/unauthorized remain locked while navigation occurs.

Dedicated Result action mounts after the pager, outside swipe panels. It uses persisted role/company/date without new fetches. Application UI language controls delete copy independently of interview language. Fresh History mount refetches page one via unchanged hook; no optimistic removal or pagination change. Fresh Result/PDF requests use existing 404 behavior. Stale tabs may retain content until navigation/refresh. Already downloaded PDFs are unaffected. No subscriptions/polling.

## 5. Created and Modified Files

Modified (final inventory): app/api/interviews/[id]/route.ts; components/result/ResultContent.tsx; app/result/result.module.css; lib/interviews/read-owned-interview.test.cjs; docs/04_Project_Memory/CURRENT_STATE.md; docs/04_Project_Memory/STAGE_LOG.md; docs/04_Project_Memory/DEFERRED_FIXES.md; docs/04_Project_Memory/DECISIONS_AND_RISKS.md. Total stage inventory: 8 modified + 8 new = 16 files.
Created: lib/interviews/delete-owned-interview.ts; lib/interviews/delete-owned-interview.test.cjs; components/result/ResultDeleteInterview.tsx; components/result/useInterviewDeletion.ts; components/result/useInterviewDeletion.test.cjs; components/result/interview-deletion-copy.ts; docs/01_Engineering/Sprint_DELETE_INTERVIEW_01_Summary.md; this Engineering Report.

## 6. Responsibility of Each File

- Detail route: map helper outcomes to HTTP without changing GET.
- Server helper: authenticate, validate and perform owner-filtered mutation.
- Server tests: security/query/API/evidence cases and deletion-pagination fixture acceptance.
- ResultContent: mount isolated deletion action outside panels.
- ResultDeleteInterview: metadata identity, warning, controls, focus and localized status presentation.
- useInterviewDeletion: request lifecycle and guarded navigation.
- Client tests: deterministic hook lifecycle and request semantics, not browser/DOM simulation.
- interview-deletion-copy: only deletion-related TR/EN/DE copy.
- Result CSS: token-based wrapping and bounded scrolling for action area.
- Summary: acceptance overview.
- Engineering Report: technical decisions, validation, risks and complete source/test diffs.

## 7. Public Interfaces, Props, or Types

OwnedInterviewDeleteResult has status deleted | unauthorized | invalidId | notFound | deleteError. deleteOwnedInterview(id: string) accepts no owner argument.
InterviewDeletionState: confirming boolean, deleting boolean, error failed | unavailable | null. useInterviewDeletion(id) returns state, open, cancel, confirm.
ResultDeleteInterview accepts interview {id, role, company, createdAt} and uiLanguage AppLanguage. Copy map is Record<AppLanguage, InterviewDeletionCopy>. No new dependency or shared business abstraction.

## 8. Accessibility Decisions

Cancel receives focus on confirmation open; trigger receives focus when cancelled. Unique warning ID associates both confirmation controls with persisted identity and permanent warning. Error uses alert; progress uses polite status. Explicit native buttons, danger/loading/disabled semantics and synchronous guard. Existing Talentry focus styling retained. Wrapping controls and scrollable confirmation avoid horizontal overflow. No added animation or focus-trap. Actual screen-reader, keyboard and mobile verification remain pending; harness does not claim DOM validation.

## 9. Styling and Token Usage

Result module CSS uses approved spacing, border, text-size and weight tokens; existing danger button palette. No new palette, library, inline CSS block or token changes. max-height 45dvh bounds confirmation within the existing mobile layout; flex:none prevents shrinking; text/buttons wrap. Runtime mobile sizing remains an acceptance risk.

## 10. Validation Commands and Exact Results

All final commands below exited 0:

| Command | Result |
|---|---|
| node --test lib/interviews/delete-owned-interview.test.cjs | 13 tests, 13 pass, 0 fail |
| node --test components/result/useInterviewDeletion.test.cjs | 10 tests, 10 pass, 0 fail |
| node --test lib/interviews/history-cursor.test.cjs lib/interviews/history-pagination.test.cjs components/interviews/useFullInterviewHistory.test.cjs | 51 tests, 51 pass, 0 fail |
| node --test components/auth/recovery-session.test.cjs | 34 tests, 34 pass, 0 fail |
| node --test lib/account/profile-display-name.test.cjs | 49 tests, 49 pass, 0 fail |
| node --test lib/reports/interview-report.test.cjs with invocation-local REPORT_PDF_PYTHON | 14 tests, 14 pass, 0 fail |
| npx tsc --noEmit --incremental false | PASS; no TypeScript diagnostics |
| git diff --check | PASS; LF-to-CRLF notices only |
| npm run build | PASS; compiled, lint/type checks, static generation 22/22 |

PDF executable: C:/Users/p-ayd/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe. PowerShell environment assignment existed only in that command's process. No persistent env/config change or installation.

Initial PDF suite: 6/14 passed, 8 failed with sandbox spawnSync python EPERM; outside-sandbox retry produced EOF. Read-only minimal diagnosis captured inspector line 3 ModuleNotFoundError: No module named pypdf. User Python 3.14.7 lacked pypdf; bundled Python 3.12.14/pypdf 6.10.0 parsed the same synthetic PDF successfully. EOF was premature child exit before reading stdin, not PDF parser corruption. Matching Git hashes confirmed renderer/test/inspector/PDF route/fonts unchanged from faac5e2. Final unchanged PDF suite passed with verified runtime; no PDF production regression identified.

Server initial 25 passing registrations included two identical cases registered seven times by unused outer total loop. Approved cleanup removed only that loop; 13 unique tests remain. No unique assertion/fixture changed.

Build emitted two webpack.cache.PackFileCacheStrategy warnings: Caching failed for pack: Error: Unable to snapshot resolve dependencies. No DELETE-route-specific warning/error. npm update notice 11.16.0 -> 12.2.0 appeared during typecheck/build; no update performed. Git LF-to-CRLF notices affect three modified tracked files. No warnings concealed. Build started no dev server.

## 11. Git Status

At the historical automated-validation checkpoint, HEAD and local origin were faac5e2. No staging, commit, push, branch change or other Git mutation was performed. Final changeset: 16 files, comprising 8 modified tracked files and 8 new files. git diff --stat covers only tracked files: 8 files changed, 187 insertions(+), 1 deletion(-).

```text
 M app/api/interviews/[id]/route.ts
 M app/result/result.module.css
 M components/result/ResultContent.tsx
 M docs/04_Project_Memory/CURRENT_STATE.md
 M docs/04_Project_Memory/DECISIONS_AND_RISKS.md
 M docs/04_Project_Memory/DEFERRED_FIXES.md
 M docs/04_Project_Memory/STAGE_LOG.md
 M lib/interviews/read-owned-interview.test.cjs
?? components/result/ResultDeleteInterview.tsx
?? components/result/interview-deletion-copy.ts
?? components/result/useInterviewDeletion.test.cjs
?? components/result/useInterviewDeletion.ts
?? docs/01_Engineering/Sprint_DELETE_INTERVIEW_01_Engineering_Report.md
?? docs/01_Engineering/Sprint_DELETE_INTERVIEW_01_Summary.md
?? lib/interviews/delete-owned-interview.test.cjs
?? lib/interviews/delete-owned-interview.ts
```

## 12. Complete Diffs for Sprint Files

Historical automated-validation checkpoint: tracked source diffs and new source/test/Summary additions follow. Embedded Summary and client-test snapshots reflect that earlier checkpoint; the final closure and final cleanup diffs below supersede them. Final Project Memory and existing GET test compatibility diffs are appended below. This newly created Engineering Report is its own full documentation source; recursively embedding its own addition would be infinite and is excluded from the embedded diff appendix.
```diff
diff --git a/app/api/interviews/[id]/route.ts b/app/api/interviews/[id]/route.ts
index b22268a..a6728b5 100644
--- a/app/api/interviews/[id]/route.ts
+++ b/app/api/interviews/[id]/route.ts
@@ -1,5 +1,6 @@
 import { NextResponse } from 'next/server'
 import { readOwnedInterview } from '@/lib/interviews/read-owned-interview'
+import { deleteOwnedInterview } from '@/lib/interviews/delete-owned-interview'

 export async function GET(_request: Request, { params }: { params: { id: string } }) {
   const result = await readOwnedInterview(params.id)
@@ -11,3 +12,19 @@ export async function GET(_request: Request, { params }: { params: { id: string
     case 'readError': return NextResponse.json({ error: 'Failed to load interview' }, { status: 500 })
   }
 }
+
+export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
+  const headers = { 'Cache-Control': 'private, no-store' }
+  try {
+    const result = await deleteOwnedInterview(params.id)
+    switch (result.status) {
+      case 'deleted': return NextResponse.json({ deleted: true }, { status: 200, headers })
+      case 'unauthorized': return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers })
+      case 'invalidId': return NextResponse.json({ error: 'Invalid interview id' }, { status: 400, headers })
+      case 'notFound': return NextResponse.json({ error: 'Interview not found' }, { status: 404, headers })
+      case 'deleteError': return NextResponse.json({ error: 'Failed to delete interview' }, { status: 500, headers })
+    }
+  } catch {
+    return NextResponse.json({ error: 'Failed to delete interview' }, { status: 500, headers })
+  }
+}
diff --git a/app/result/result.module.css b/app/result/result.module.css
index 7f01a03..da4019d 100644
--- a/app/result/result.module.css
+++ b/app/result/result.module.css
@@ -3,6 +3,21 @@
   box-sizing: border-box;
 }

+.deletion {
+  flex: none;
+  min-width: 0;
+  max-height: 45dvh;
+  overflow-y: auto;
+  overflow-wrap: anywhere;
+  padding: var(--talentry-space-3);
+  border-top: 1px solid var(--talentry-color-border);
+  font-size: var(--talentry-font-size-sm);
+}
+
+.deletionIdentity { font-weight: var(--talentry-font-weight-semibold); }
+.deletionActions { display: flex; flex-wrap: wrap; gap: var(--talentry-space-2); }
+.deletion button, .deletion a { max-width: 100%; white-space: normal; }
+
 .page {
   min-height: 100vh;
   min-height: 100dvh;
diff --git a/components/result/ResultContent.tsx b/components/result/ResultContent.tsx
index 7039c04..9373a0c 100644
--- a/components/result/ResultContent.tsx
+++ b/components/result/ResultContent.tsx
@@ -6,6 +6,7 @@ import type { InterviewDetail } from '@/app/result/[id]/page'
 import type { AppLanguage } from '@/types/auth'
 import ResultAnswers from './ResultAnswers'
 import ResultPdfDownload from './ResultPdfDownload'
+import ResultDeleteInterview from './ResultDeleteInterview'
 import { displayValue, INTERVIEW_LANGUAGE_NAMES } from './result-copy'
 import type { ResultCopy } from './result-copy'
 import styles from '@/app/result/result.module.css'
@@ -154,6 +155,7 @@ export default function ResultContent({ interview, copy, uiLanguage }: ResultCon
           </button>
         ))}
       </nav>
+      <ResultDeleteInterview interview={interview} uiLanguage={uiLanguage} />
     </>
   )
 }
diff --git a/lib/interviews/delete-owned-interview.ts b/lib/interviews/delete-owned-interview.ts
new file mode 100644
--- /dev/null
+++ b/lib/interviews/delete-owned-interview.ts
@@ -0,0 +1,35 @@
+import 'server-only'
+
+import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
+import { createAdminClient } from '@/lib/supabase/admin'
+
+export type OwnedInterviewDeleteResult = {
+  status: 'deleted' | 'unauthorized' | 'invalidId' | 'notFound' | 'deleteError'
+}
+
+const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
+
+export async function deleteOwnedInterview(id: string): Promise<OwnedInterviewDeleteResult> {
+  try {
+    const auth = await getAuthenticatedUser()
+    if (auth.status === 'unauthorized') return { status: 'unauthorized' }
+    if (!UUID_PATTERN.test(id)) return { status: 'invalidId' }
+
+    const admin = createAdminClient()
+    const { data, error } = await admin.from('interviews')
+      .delete()
+      .eq('id', id)
+      .eq('owner_id', auth.user.id)
+      .select('id')
+      .maybeSingle()
+
+    if (error) return { status: 'deleteError' }
+    if (!data) return { status: 'notFound' }
+    if (typeof data.id !== 'string' || data.id.toLowerCase() !== id.toLowerCase()) {
+      return { status: 'deleteError' }
+    }
+    return { status: 'deleted' }
+  } catch {
+    return { status: 'deleteError' }
+  }
+}
diff --git a/lib/interviews/delete-owned-interview.test.cjs b/lib/interviews/delete-owned-interview.test.cjs
new file mode 100644
--- /dev/null
+++ b/lib/interviews/delete-owned-interview.test.cjs
@@ -0,0 +1,176 @@
+const { test } = require('node:test')
+const assert = require('node:assert/strict')
+const { NextResponse } = require('next/server')
+const { load, plain, fixture, OWNER_A, OWNER_B } = require('./history-test-helpers.cjs')
+const id = fixture()[0].id
+function harness({ owner = OWNER_A, rows = [{ id, owner_id: OWNER_A }], error = null, thrown = false } = {}) {
+  const calls = []
+  const helper = load('lib/interviews/delete-owned-interview.ts', {
+    'server-only': {},
+    '@/lib/auth/get-authenticated-user': { async getAuthenticatedUser() {
+      calls.push(['auth']); return owner ? { status: 'authenticated', user: { id: owner } } : { status: 'unauthorized' }
+    } },
+    '@/lib/supabase/admin': { createAdminClient() {
+      if (thrown) throw new Error('Private provider failure')
+      calls.push(['admin'])
+      return { from(table) {
+        calls.push(['from', table]); const filters = []
+        return {
+          delete() { calls.push(['delete']); return this },
+          eq(key, value) { filters.push([key, value]); calls.push(['eq', key, value]); return this },
+          select(columns) { calls.push(['select', columns]); return this },
+          async maybeSingle() {
+            calls.push(['maybeSingle'])
+            const index = rows.findIndex(row => filters.every(([key, value]) => row[key] === value))
+            return { error, data: !error && index >= 0 ? { id: rows.splice(index, 1)[0].id } : null }
+          },
+        }
+      } }
+    } },
+  })
+  const route = load('app/api/interviews/[id]/route.ts', {
+    'next/server': { NextResponse }, '@/lib/interviews/delete-owned-interview': helper,
+    '@/lib/interviews/read-owned-interview': { readOwnedInterview: async () => ({ status: 'notFound' }) },
+  })
+  return { ...helper, ...route, calls, rows }
+}
+test('unauthenticated wins over malformed ID and never accesses admin', async () => {
+  const h = harness({ owner: null }); assert.equal((await h.deleteOwnedInterview('bad')).status, 'unauthorized')
+  assert.deepEqual(h.calls, [['auth']])
+})
+test('authenticated malformed UUID never accesses admin', async () => {
+  const h = harness(); assert.equal((await h.deleteOwnedInterview('bad')).status, 'invalidId')
+  assert.deepEqual(h.calls, [['auth']])
+})
+test('single delete uses exact owner and ID predicates and only ID evidence', async () => {
+  const h = harness(); assert.equal((await h.deleteOwnedInterview(id, OWNER_B)).status, 'deleted')
+  assert.deepEqual(h.calls, [['auth'], ['admin'], ['from', 'interviews'], ['delete'],
+    ['eq', 'id', id], ['eq', 'owner_id', OWNER_A], ['select', 'id'], ['maybeSingle']])
+})
+for (const [name, options] of [['wrong owner', { owner: OWNER_B }], ['nonexistent', { rows: [] }]]) {
+  test(name + ' returns notFound and preserves other records', async () => {
+    const h = harness(options), before = plain(h.rows)
+    assert.equal((await h.deleteOwnedInterview(id)).status, 'notFound'); assert.deepEqual(h.rows, before)
+  })
+}
+test('repeated delete has no row evidence and returns notFound', async () => {
+  const h = harness(); assert.equal((await h.deleteOwnedInterview(id)).status, 'deleted')
+  assert.equal((await h.deleteOwnedInterview(id)).status, 'notFound')
+})
+test('database error and thrown client failure are generic deleteError', async () => {
+  for (const options of [{ error: { message: 'Private' } }, { thrown: true }]) {
+    assert.equal((await harness(options).deleteOwnedInterview(id)).status, 'deleteError')
+  }
+})
+test('invalid returned row cannot establish success', async () => {
+  const helper = load('lib/interviews/delete-owned-interview.ts', {
+    'server-only': {}, '@/lib/auth/get-authenticated-user': { getAuthenticatedUser: async () => ({ status: 'authenticated', user: { id: OWNER_A } }) },
+    '@/lib/supabase/admin': { createAdminClient: () => ({ from: () => ({ delete() { return this }, eq() { return this }, select() { return this }, maybeSingle: async () => ({ data: {}, error: null }) }) }) },
+  })
+  assert.equal((await helper.deleteOwnedInterview(id)).status, 'deleteError')
+})
+test('DELETE contract maps every result, ignores request ownership, and sets no-store', async () => {
+  const cases = [[{}, id, 200, { deleted: true }], [{ owner: null }, 'bad', 401, { error: 'Unauthorized' }],
+    [{}, 'bad', 400, { error: 'Invalid interview id' }], [{ rows: [] }, id, 404, { error: 'Interview not found' }],
+    [{ owner: OWNER_B }, id, 404, { error: 'Interview not found' }], [{ thrown: true }, id, 500, { error: 'Failed to delete interview' }]]
+  for (const [options, requested, status, body] of cases) {
+    const h = harness(options)
+    const response = await h.DELETE({ json() { throw new Error('Must not consume body') }, url: '?owner_id=spoof' }, { params: { id: requested } })
+    assert.equal(response.status, status); assert.deepEqual(await response.json(), body)
+    assert.equal(response.headers.get('Cache-Control'), 'private, no-store')
+  }
+})
+test('unexpected route exception returns generic no-store 500', async () => {
+  const route = load('app/api/interviews/[id]/route.ts', {
+    'next/server': { NextResponse }, '@/lib/interviews/read-owned-interview': {},
+    '@/lib/interviews/delete-owned-interview': { deleteOwnedInterview() { throw new Error('Private') } },
+  })
+  const response = await route.DELETE({}, { params: { id } })
+  assert.equal(response.status, 500); assert.deepEqual(await response.json(), { error: 'Failed to delete interview' })
+  assert.equal(response.headers.get('Cache-Control'), 'private, no-store')
+})
+const { NextRequest } = require('next/server')
+const { item, cursor, token } = require('./history-test-helpers.cjs')
+function paginationHarness(rows, owner = OWNER_A) {
+  const calls = []
+  const route = load('app/api/interviews/route.ts', {
+    'next/server': { NextResponse }, '@/lib/interviews/history-cursor': cursor,
+    '@/lib/auth/get-authenticated-user': { async getAuthenticatedUser() {
+      return owner ? { status: 'authenticated', user: { id: owner } } : { status: 'unauthorized' }
+    } },
+    '@/lib/supabase/admin': { createAdminClient() { return { from(table) {
+      assert.equal(table, 'interviews')
+      const call = { filters: [], orders: [] }; calls.push(call)
+      return {
+        select(columns) { call.columns = columns; return this },
+        eq(key, value) { call.filters.push([key, value]); return this },
+        order(key, options) { call.orders.push([key, options.ascending]); return this },
+        or(expression) { call.expression = expression; return this },
+        limit(count) { call.limit = count; return this },
+        then(resolve, reject) {
+          return Promise.resolve().then(() => {
+            let selected = rows.filter(row => call.filters.every(([key, value]) => row[key] === value))
+            if (call.expression) {
+              const match = /^created_at\.lt\.([^,]+),and\(created_at\.eq\.([^,]+),id\.lt\.([^)]+)\)$/.exec(call.expression)
+              assert.ok(match, 'Expected grouped timestamp/UUID continuation')
+              assert.equal(match[1], match[2])
+              selected = selected.filter(row => row.created_at < match[1] ||
+                (row.created_at === match[2] && row.id < match[3]))
+            }
+            selected.sort((a, b) => {
+              for (const [key, ascending] of call.orders) {
+                if (a[key] !== b[key]) return (a[key] < b[key] ? -1 : 1) * (ascending ? 1 : -1)
+              }
+              return 0
+            })
+            if (call.limit !== undefined) selected = selected.slice(0, call.limit)
+            return { data: selected, error: null }
+          }).then(resolve, reject)
+        },
+      }
+    } } } },
+  })
+  return { calls, async request(query = 'limit=20') {
+    return route.GET(new NextRequest(`https://example.test/api/interviews?${query}`))
+  }, async page(position) {
+    const response = await this.request('limit=20' + (position ? `&cursor=${position}` : ''))
+    assert.equal(response.status, 200)
+    assert.equal(response.headers.get('Cache-Control'), 'private, no-store')
+    return response.json()
+  } }
+}
+async function traverse(h, expected, start = null) {
+  const seen = [], sizes = []; let position = start
+  do {
+    assert.ok(sizes.length < 5, 'Traversal must terminate')
+    const page = await h.page(position); sizes.push(page.interviews.length); seen.push(...page.interviews)
+    const call = h.calls.at(-1)
+    assert.equal(call.limit, 21)
+    assert.deepEqual(call.orders, [['created_at', false], ['id', false]])
+    assert.deepEqual(call.filters, [['owner_id', OWNER_A]])
+    assert.equal(call.columns, 'id, role, company, level, interview_type, language, score, duration_seconds, created_at')
+    if (seen.length < expected.length) {
+      assert.equal(page.nextCursor, token(expected[seen.length - 1]), 'Cursor uses last returned row')
+      assert.notEqual(page.nextCursor, token(expected[seen.length]), 'Never use lookahead row')
+    } else assert.equal(page.nextCursor, null)
+    position = page.nextCursor
+  } while (position)
+  assert.deepEqual(seen, expected.map(item))
+  assert.equal(new Set(seen.map(row => row.id)).size, expected.length)
+  for (let i = 1; i < seen.length; i++) assert.ok(seen[i - 1].createdAt > seen[i].createdAt ||
+    (seen[i - 1].createdAt === seen[i].createdAt && seen[i - 1].id > seen[i].id))
+  return sizes
+}
+for (const count of [21, 41]) test('fresh pagination after actual helper deletion: ' + count, async () => {
+  const rows = fixture().slice(0, count), boundaryId = rows[19].id
+  const h = harness({ rows }); assert.equal((await h.deleteOwnedInterview(boundaryId)).status, 'deleted')
+  assert.deepEqual(await traverse(paginationHarness(rows), rows), count === 21 ? [20] : [20, 20])
+})
+test('deleted prior cursor boundary preserves continuation and fresh traversal', async () => {
+  const rows = fixture(), p = paginationHarness(rows), first = await p.page()
+  const boundaryId = rows[19].id
+  assert.equal((await harness({ rows }).deleteOwnedInterview(boundaryId)).status, 'deleted')
+  const rest = await p.page(first.nextCursor)
+  assert.deepEqual(rest.interviews, rows.slice(19, 39).map(item))
+  assert.deepEqual(await traverse(paginationHarness(rows), rows), [20, 20])
+})
diff --git a/components/result/ResultDeleteInterview.tsx b/components/result/ResultDeleteInterview.tsx
new file mode 100644
--- /dev/null
+++ b/components/result/ResultDeleteInterview.tsx
@@ -0,0 +1,55 @@
+'use client'
+
+import Link from 'next/link'
+import { useEffect, useId, useRef } from 'react'
+import { TalentryButton } from '@/components/ui'
+import type { AppLanguage } from '@/types/auth'
+import { INTERVIEW_DELETION_COPY } from './interview-deletion-copy'
+import { useInterviewDeletion } from './useInterviewDeletion'
+import styles from '@/app/result/result.module.css'
+
+type ResultDeleteInterviewProps = {
+  interview: { id: string; role: string; company: string; createdAt: string }
+  uiLanguage: AppLanguage
+}
+
+export default function ResultDeleteInterview({ interview, uiLanguage }: ResultDeleteInterviewProps) {
+  const { state, open, cancel, confirm } = useInterviewDeletion(interview.id)
+  const copy = INTERVIEW_DELETION_COPY[uiLanguage]
+  const warningId = useId()
+  const trigger = useRef<HTMLButtonElement>(null)
+  const cancelButton = useRef<HTMLButtonElement>(null)
+  const previous = useRef(false)
+  useEffect(() => {
+    if (state.confirming && !previous.current) cancelButton.current?.focus()
+    if (!state.confirming && previous.current) trigger.current?.focus()
+    previous.current = state.confirming
+  }, [state.confirming])
+  const date = new Date(interview.createdAt)
+  const identity = [interview.role.trim(), interview.company.trim(),
+    Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat(uiLanguage, {
+      dateStyle: 'medium', timeStyle: 'short',
+    }).format(date)].filter(Boolean).join(' · ')
+
+  return <section className={styles.deletion} aria-label={copy.action}>
+    {!state.confirming ? <TalentryButton ref={trigger} variant="danger" onClick={open}>
+      {copy.action}
+    </TalentryButton> : <>
+      <div id={warningId}>
+        <p className={styles.deletionIdentity} dir="auto">{identity}</p>
+        <p>{copy.warning}</p>
+      </div>
+      {state.error && <p role="alert">{state.error === 'unavailable' ? copy.unavailable : copy.failed}</p>}
+      {state.error === 'unavailable' ?
+        <Link href="/interviews" className="talentry-button talentry-button--secondary talentry-button--medium">
+          {copy.history}
+        </Link> : <div className={styles.deletionActions}>
+          <TalentryButton variant="danger" loading={state.deleting} loadingText={copy.deleting}
+            aria-describedby={warningId} onClick={() => { void confirm() }}>{copy.confirm}</TalentryButton>
+          <TalentryButton ref={cancelButton} variant="secondary" disabled={state.deleting}
+            aria-describedby={warningId} onClick={cancel}>{copy.cancel}</TalentryButton>
+        </div>}
+      <span role="status" aria-live="polite">{state.deleting ? copy.deleting : ''}</span>
+    </>}
+  </section>
+}
diff --git a/components/result/useInterviewDeletion.ts b/components/result/useInterviewDeletion.ts
new file mode 100644
--- /dev/null
+++ b/components/result/useInterviewDeletion.ts
@@ -0,0 +1,82 @@
+'use client'
+
+import { useEffect, useRef, useState } from 'react'
+import { useRouter } from 'next/navigation'
+import { AUTH_ROUTES } from '@/lib/auth/auth-constants'
+
+export type InterviewDeletionState = {
+  confirming: boolean
+  deleting: boolean
+  error: 'failed' | 'unavailable' | null
+}
+
+export function useInterviewDeletion(id: string) {
+  const router = useRouter()
+  const [state, setState] = useState<InterviewDeletionState>({ confirming: false, deleting: false, error: null })
+  const confirming = useRef(false)
+  const active = useRef<AbortController | null>(null)
+  const mounted = useRef(false)
+  const terminal = useRef(false)
+
+  useEffect(() => {
+    mounted.current = true
+    terminal.current = false
+    confirming.current = false
+    setState({ confirming: false, deleting: false, error: null })
+    return () => {
+      mounted.current = false
+      active.current?.abort()
+      active.current = null
+    }
+  }, [id])
+
+  function open() {
+    if (!mounted.current || active.current || terminal.current) return
+    confirming.current = true
+    setState({ confirming: true, deleting: false, error: null })
+  }
+
+  function cancel() {
+    if (!mounted.current || active.current || terminal.current) return
+    confirming.current = false
+    setState({ confirming: false, deleting: false, error: null })
+  }
+
+  async function confirm() {
+    if (!mounted.current || !confirming.current || active.current || terminal.current) return
+    const controller = new AbortController()
+    active.current = controller
+    const current = () => mounted.current && active.current === controller && !controller.signal.aborted
+    setState({ confirming: true, deleting: true, error: null })
+    try {
+      const response = await fetch(`/api/interviews/${encodeURIComponent(id)}`, {
+        method: 'DELETE', credentials: 'same-origin', cache: 'no-store', signal: controller.signal,
+      })
+      if (!current()) return
+      if (response.status === 401) {
+        terminal.current = true
+        router.replace(AUTH_ROUTES.login)
+        return
+      }
+      if (response.status === 400 || response.status === 404) {
+        terminal.current = true
+        setState({ confirming: true, deleting: false, error: 'unavailable' })
+        return
+      }
+      if (!response.ok) throw new Error('Delete failed')
+      const payload: unknown = await response.json()
+      if (!current()) return
+      if (!payload || typeof payload !== 'object' || !('deleted' in payload) || payload.deleted !== true) {
+        throw new Error('Invalid deletion response')
+      }
+      terminal.current = true
+      router.replace('/interviews')
+    } catch {
+      if (current()) setState({ confirming: true, deleting: false, error: 'failed' })
+    } finally {
+      if (active.current === controller) active.current = null
+    }
+  }
+
+  return { state, open, cancel, confirm }
+}
diff --git a/components/result/useInterviewDeletion.test.cjs b/components/result/useInterviewDeletion.test.cjs
new file mode 100644
--- /dev/null
+++ b/components/result/useInterviewDeletion.test.cjs
@@ -0,0 +1,99 @@
+const { test } = require('node:test')
+const assert = require('node:assert/strict')
+const { load, plain, fixture, item, token } = require('../../lib/interviews/history-test-helpers.cjs')
+const rows = fixture(), items = rows.map(item)
+const page = (start, end, more = end < 41) => ({ interviews: items.slice(start, end),
+  nextCursor: more ? token(rows[end - 1]) : null })
+const tick = () => new Promise(resolve => setImmediate(resolve))
+function deferred() { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no }); return { promise, resolve, reject } }
+// Minimal persistent-slot hook harness: rerenders state, compares dependencies,
+// runs effect cleanup, and leaves fetch promises under each test's control.
+// No DOM/React scheduling or browser-visibility claim is made by this harness.
+function harness() {
+  const slots = [], effects = [], pending = [], requests = [], navigation = []
+  let index = 0, view, disposed = false, updates = 0, scheduled = false
+  const router = { replace: destination => navigation.push(destination) }
+  const same = (a, b) => a && a.length === b.length && a.every((value, i) => Object.is(value, b[i]))
+  const react = {
+    useState(initial) {
+      const i = index++; if (!(i in slots)) slots[i] = initial
+      return [slots[i], value => {
+        updates++; slots[i] = value
+        if (!scheduled && !disposed) { scheduled = true; queueMicrotask(() => { scheduled = false; if (!disposed) render() }) }
+      }]
+    },
+    useRef(initial) { const i = index++; return slots[i] || (slots[i] = { current: initial }) },
+    useCallback(fn, deps) {
+      const i = index++; if (!same(slots[i]?.deps, deps)) slots[i] = { fn, deps }; return slots[i].fn
+    },
+    useEffect(fn, deps) {
+      const i = index++, previous = effects[i]
+      if (!same(previous?.deps, deps)) pending.push(() => { previous?.cleanup?.(); effects[i] = { deps, cleanup: fn() } })
+    },
+  }
+  const { AUTH_ROUTES } = load('lib/auth/auth-constants.ts', {})
+  const hook = load('components/result/useInterviewDeletion.ts', {
+    react, 'next/navigation': { useRouter: () => router }, '@/lib/auth/auth-constants': { AUTH_ROUTES },
+  }, { AbortController, fetch(url, options) {
+    const d = deferred(); requests.push({ url, options, ...d }); return d.promise
+  } }).useInterviewDeletion
+  function render() { index = 0; view = hook(items[0].id); while (pending.length) pending.shift()() }
+  render()
+  return { requests, navigation, get state() { return plain(view.state) }, get updates() { return updates },
+    open() { view.open() }, cancel() { view.cancel() }, confirm() { return view.confirm() },
+    unmount() { disposed = true; effects.forEach(effect => effect?.cleanup?.()) },
+    async respond(i, payload, status = 200) {
+      requests[i].resolve({ status, ok: status >= 200 && status < 300, json: async () => payload }); await tick()
+    },
+    async fail(i) { requests[i].reject(new Error('Synthetic network failure')); await tick() },
+  }
+}
+
+test('confirmation required and Cancel sends no request', async () => {
+  const h = harness(); await h.confirm(); assert.equal(h.requests.length, 0)
+  h.open(); await tick(); assert.equal(h.state.confirming, true)
+  h.cancel(); await tick(); await h.confirm(); assert.equal(h.requests.length, 0)
+  assert.equal(h.state.confirming, false); h.unmount()
+})
+test('synchronous duplicate guard, request options and loading state', async () => {
+  const h = harness(); h.open(); const first = h.confirm(); void h.confirm(); await tick()
+  assert.equal(h.requests.length, 1); assert.equal(h.state.deleting, true)
+  assert.equal(h.requests[0].url, '/api/interviews/' + items[0].id)
+  assert.equal(h.requests[0].options.method, 'DELETE'); assert.equal(h.requests[0].options.credentials, 'same-origin')
+  assert.equal(h.requests[0].options.cache, 'no-store'); assert.equal('body' in h.requests[0].options, false)
+  h.cancel(); await tick(); assert.equal(h.state.confirming, true)
+  await h.respond(0, { deleted: true }); await first; await h.confirm()
+  assert.deepEqual(h.navigation, ['/interviews']); assert.equal(h.requests.length, 1); h.unmount()
+})
+test('status alone or malformed success never navigates', async () => {
+  for (const body of [null, {}, { deleted: false }, { deleted: 'true' }]) {
+    const h = harness(); h.open(); void h.confirm(); await h.respond(0, body)
+    assert.deepEqual(h.navigation, []); assert.equal(h.state.error, 'failed')
+    assert.equal(h.state.confirming, true); assert.equal(h.state.deleting, false); h.unmount()
+  }
+})
+test('401 uses existing login route', async () => {
+  const h = harness(); h.open(); void h.confirm(); await h.respond(0, {}, 401)
+  assert.deepEqual(h.navigation, ['/login']); h.unmount()
+})
+for (const status of [400, 404]) test(status + ' becomes unavailable without false success', async () => {
+  const h = harness(); h.open(); void h.confirm(); await h.respond(0, {}, status)
+  assert.equal(h.state.error, 'unavailable'); assert.equal(h.state.deleting, false)
+  assert.deepEqual(h.navigation, []); await h.confirm(); assert.equal(h.requests.length, 1); h.unmount()
+})
+for (const kind of ['server', 'network']) test(kind + ' failure retains confirmation and retries', async () => {
+  const h = harness(); h.open(); void h.confirm()
+  if (kind === 'server') await h.respond(0, {}, 500); else await h.fail(0)
+  assert.equal(h.state.confirming, true); assert.equal(h.state.error, 'failed'); assert.equal(h.state.deleting, false)
+  assert.deepEqual(h.navigation, []); void h.confirm(); await h.respond(1, { deleted: true })
+  assert.deepEqual(h.navigation, ['/interviews']); h.unmount()
+})
+test('unmount aborts and late completion cannot update or navigate', async () => {
+  const h = harness(); h.open(); void h.confirm(); await tick()
+  const updates = h.updates; h.unmount(); assert.equal(h.requests[0].options.signal.aborted, true)
+  await h.respond(0, { deleted: true }); assert.equal(h.updates, updates); assert.deepEqual(h.navigation, [])
+})
+test('late network rejection after disposal cannot update state', async () => {
+  const h = harness(); h.open(); void h.confirm(); await tick(); h.unmount(); const updates = h.updates
+  await h.fail(0); assert.equal(h.updates, updates); assert.deepEqual(h.navigation, [])
+})
diff --git a/components/result/interview-deletion-copy.ts b/components/result/interview-deletion-copy.ts
new file mode 100644
--- /dev/null
+++ b/components/result/interview-deletion-copy.ts
@@ -0,0 +1,30 @@
+import type { AppLanguage } from '@/types/auth'
+
+type InterviewDeletionCopy = {
+  action: string; warning: string; confirm: string; cancel: string
+  deleting: string; failed: string; unavailable: string; history: string
+}
+
+export const INTERVIEW_DELETION_COPY: Record<AppLanguage, InterviewDeletionCopy> = {
+  tr: {
+    action: 'Mülakatı sil',
+    warning: 'Bu mülakat, kaydedilmiş yanıtlar ve değerlendirme özeti kalıcı olarak silinecek. Bu işlem geri alınamaz.',
+    confirm: 'Mülakatı kalıcı olarak sil', cancel: 'İptal', deleting: 'Siliniyor',
+    failed: 'Mülakat silinemedi. Lütfen tekrar deneyin.',
+    unavailable: 'Bu mülakat artık kullanılamıyor.', history: 'Mülakatlarıma dön',
+  },
+  en: {
+    action: 'Delete interview',
+    warning: 'This interview, saved answers and assessment summary will be permanently deleted. This action cannot be undone.',
+    confirm: 'Permanently delete interview', cancel: 'Cancel', deleting: 'Deleting',
+    failed: 'The interview could not be deleted. Please try again.',
+    unavailable: 'This interview is no longer available.', history: 'Back to My Interviews',
+  },
+  de: {
+    action: 'Interview löschen',
+    warning: 'Dieses Interview, die gespeicherten Antworten und die Bewertungszusammenfassung werden dauerhaft gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.',
+    confirm: 'Interview dauerhaft löschen', cancel: 'Abbrechen', deleting: 'Wird gelöscht',
+    failed: 'Das Interview konnte nicht gelöscht werden. Bitte versuchen Sie es erneut.',
+    unavailable: 'Dieses Interview ist nicht mehr verfügbar.', history: 'Zurück zu meinen Interviews',
+  },
+}
diff --git a/docs/01_Engineering/Sprint_DELETE_INTERVIEW_01_Summary.md b/docs/01_Engineering/Sprint_DELETE_INTERVIEW_01_Summary.md
new file mode 100644
--- /dev/null
+++ b/docs/01_Engineering/Sprint_DELETE_INTERVIEW_01_Summary.md
@@ -0,0 +1,19 @@
+# Sprint DELETE_INTERVIEW_01 Summary
+
+- Title: Permanent deletion of one owned persisted interview
+- Date: 2026-10-03 (Europe/Istanbul)
+- Branch: feature/auth-foundation
+- Committed base and local origin/feature/auth-foundation: faac5e2
+- Status: Automated validation complete; browser acceptance pending; awaiting approval
+- Goal: Authenticated owners can deliberately permanently delete one persisted interview from Result.
+- Created files: lib/interviews/delete-owned-interview.ts; lib/interviews/delete-owned-interview.test.cjs; components/result/ResultDeleteInterview.tsx; components/result/useInterviewDeletion.ts; components/result/useInterviewDeletion.test.cjs; components/result/interview-deletion-copy.ts; this Summary; Sprint_DELETE_INTERVIEW_01_Engineering_Report.md.
+- Modified files: app/api/interviews/[id]/route.ts; components/result/ResultContent.tsx; app/result/result.module.css.
+- Behavior: Single owner-filtered hard delete, Result-only inline confirmation, localized TR/EN/DE warning that deletion cannot be undone, server-confirmed success navigates with router.replace('/interviews'). History freshly mounts and reloads its first page. Existing GET and PDF contracts remain unchanged.
+- API: DELETE /api/interviews/[id]; 200 {"deleted":true}; 401 Unauthorized; 400 Invalid interview id; identical 404 Interview not found for wrong-owner, missing and repeated deletion; generic 500 Failed to delete interview. DELETE responses are private, no-store.
+- Validation: Server deletion 13/13; client deletion 10/10; pagination 51/51; recovery 34/34; profile 49/49; PDF 14/14. Total 171 PASS. TypeScript PASS; git diff --check PASS; production build exit 0, static generation 22/22.
+- Diagnosis: Initial PDF failures were execution-environment failures: sandbox EPERM; default/user Python lacked pypdf and exited prematurely, producing Node EOF. Invocation-local bundled Python with pypdf 6.10.0 passed the unchanged PDF regression. No PDF production regression was identified. No persistent environment/config or package changes.
+- Test cleanup: Removed only unused outer loop; 25 misleading server registrations became 13 unique cases with all assertions retained.
+- Warnings: Two webpack cache warnings (Unable to snapshot resolve dependencies), LF-to-CRLF Git notices, npm update notice 11.16.0 -> 12.2.0. No DELETE-route-specific build warning/error.
+- Risks: Permanent deletion; browser/mobile/focus and live Supabase acceptance pending; no live-schema parity proof; already downloaded PDFs and stale rendered tabs remain outside deletion guarantee. No synthetic acceptance fixtures created.
+- Dev server: Read-only process check found none before build; no dev server restarted.
+- Approval status: Implementation acceptance pending. No stage/commit/push, no real record mutation, no Project Memory update.
```

## 13. Risks, Limitations, and Technical Debt

Permanent deletion has no undo. Live Supabase mutation, live-schema parity, mobile layout, focus and screen-reader acceptance remain unverified. Deterministic mocks validate emitted predicates, not PostgreSQL integration. Stale rendered views and downloaded PDFs remain; no real-time revocation or backup-erasure guarantee. Existing scoring trust/provider debt remains untouched. No real records created/deleted. No synthetic fixtures seeded.

Manual browser acceptance plan (prepare only; not executed):
A. Owner selects a deliberately authorized disposable owned interview and confirms deletion.
B. Confirmation identifies role/company/date, permanent warning; Cancel preserves it with no request.
C. Successful delete navigates to History; refresh confirms persistence.
D. Fresh deleted Result is unavailable.
E. Fresh deleted PDF endpoint returns 404.
F. Wrong-owner deletion returns identical unavailable response and preserves target.
G. Second account and all non-target records remain unchanged.
H. Repeated delete returns 404 with no false success.
I. Safely simulated failure preserves confirmation and permits retry; duplicates send one request.
J. Mobile TR/EN/DE confirmation wraps, scrolls and remains usable outside swipe panels.
K. Keyboard open focuses Cancel; cancel returns trigger focus; loading/errors announced.
L. History mounts fresh and refills up to 20 remaining records with valid continuation.
Later separately authorized HISTORY_PAGINATION_01: exact original 13 IDs -> create 8 marked records and retain exact IDs -> 21 total -> Load More 20+1 -> delete exact 8 through supported API/UI -> original 13 ID set remains. Environment confirmation and separate seed authorization required.

## 14. Untouched-Module Confirmation

Auth/recovery/PKCE/AMR, profile/user.updated_at reconciliation, History row/hook/cursor/page size/ordering, interview completion/scoring, Result GET contract, PDF generation/authorization/inspector/tests/fonts, migrations/RLS, dependencies/package files, configuration/env files, tokens and all Project Memory files unchanged. No unrelated refactoring or business data introduced. Only the approved source/tests and new stage reports changed.

## 15. Approval Required

Automated implementation validation complete. Browser acceptance still pending; implementation is not accepted or committed. Stop here for user review. No automatic next stage, live fixture work, server restart, staging, commit or push.

## DELETE_INTERVIEW_01 — Final runtime acceptance closure — 2026-10-03

**IMPLEMENTATION + AUTOMATED VALIDATION + LOCAL BROWSER ACCEPTANCE: PASS**, with explicit qualification: wrong-owner live DELETE was NOT COMPLETED / NOT USER-VERIFIED; deterministic automated coverage remains.

Historical/pre-commit checkpoint: branch feature/auth-foundation; committed base before DELETE_INTERVIEW_01 faac5e2. At this documentation checkpoint the stage work was uncommitted. No future commit hash is asserted. This update records user-provided browser evidence; no tests/build or browser checks were rerun, no server restarted, and no Git mutation or Supabase operation was performed by the agent during this documentation turn.

Recorded automated results: server deletion 13/13, client deletion 10/10, pagination 51/51, recovery 34/34, profile 49/49, PDF 14/14; total 171 PASS. TypeScript PASS; git diff --check PASS; production build PASS, 22/22 pages. Initial PDF regression failures were environmental: default/user Python lacked pypdf; invocation-local Codex-bundled Python with pypdf 6.10.0 passed. No production PDF regression found; no persistent env/config or package change. Unused outer loop cleanup reduced 25 misleading registrations to 13 unique server deletion tests without losing assertions. Prior webpack cache snapshot warnings, LF-to-CRLF and npm update notices remain recorded in the Engineering Report.

USER-VERIFIED PASS:
- A. Cancel: opened confirmation; Cancel preserved the interview.
- B. Owner hard delete: confirmed permanent deletion, navigated to /interviews, History count 13 -> 12.
- C. Persistence: closed/reopened/fresh-loaded History; deleted record remained absent and 12 remained.
- D. Mobile: approximately 400x690 viewport; usable confirmation, no overflow, accessible Cancel/destructive controls.
- E. Focus: opening confirmation focused Cancel; cancelling returned focus to Delete interview trigger.
- F. Repeated-delete fail-safe: later DELETE for an already-deleted interview returned 404.
- G. Deleted Result: deleted interview URL displayed existing unavailable state.

Manual acceptance procedure incident: one additional real interview, ID 19c2c248-b4b7-4b99-b9c2-ce0ef316b39e, was unintentionally deleted by a DevTools Console DELETE fetch while the original owner account remained authenticated. Promise {<pending>} was incorrectly interpreted as if the request had not completed. The DELETE actually succeeded; a second DELETE returned 404 because the record was already deleted. Subsequent Result was unavailable; History became 11 and remained 11 after fresh refresh. This was a MANUAL ACCEPTANCE PROCEDURE ERROR, not an application authorization defect. No restoration is claimed or attempted.

Wrong-owner live DELETE was NOT COMPLETED / NOT USER-VERIFIED: the intended second-account test was not performed before the accidental owner DELETE. Do not infer wrong-owner or second-account browser isolation from this incident. Wrong-owner DELETE, database/provider failure and retry, rapid duplicate prevention, malformed success payload, and deleted PDF 404 behavior are recorded as automated-test-covered only, not browser-tested. PDF automated tests cover owner-read notFound -> 404; no live deletion-to-PDF integration claim is made.

Final architecture: permanent HARD DELETE; Result page only; inline confirmation; DELETE /api/interviews/[id]; server-derived authenticated identity; both id and owner_id predicates; wrong-owner and nonexistent indistinguishable; confirmed success router.replace('/interviews'); fresh History mount/refetch. No History-row delete action, schema/RLS change, new dependency, polling or realtime deletion synchronization.

Exact delete chain:
```ts
.delete()
.eq('id', id)
.eq('owner_id', auth.user.id)
.select('id')
.maybeSingle()
```

API contract: 200 {"deleted":true}; 401 {"error":"Unauthorized"}; 400 {"error":"Invalid interview id"}; identical 404 {"error":"Interview not found"} for wrong-owner/nonexistent/repeated requests; generic 500 {"error":"Failed to delete interview"}. DELETE responses private, no-store. Auth precedes UUID validation; request ownership inputs are not consumed.

Current user-reported real account count after both deletions: 11. HISTORY_PAGINATION_01 real 21+ browser acceptance remains PENDING. Minimum future seed count is now 10 synthetic records to reach exactly 21; previous 13+8 planning is historical. Future seeding requires explicit authorization and environment confirmation, recording exact new IDs, then exact-ID cleanup and verification of the original 11-ID set. No seeding authorized or performed here.

Remaining limitations: hard deletion is irreversible; stale rendered tabs may retain content until navigation/refresh; downloaded PDFs and backups are outside the row deletion guarantee; live schema parity and unexercised browser cases remain unverified. Auth/recovery/profile/scoring/PDF/history foundations remain frozen. No next stage, staging, commit or push is authorized by this closure.

Documentation addendum: preceding pending-browser wording, 13+8 fixture plan, and untouched-Project-Memory statements describe the earlier automated-validation checkpoint and are superseded by this closure. This turn modified only the two reports and four Project Memory documents. Application/test/config/dependency files were not changed.

## Final approved cleanup — test compatibility and final diff inventory

Only lib/interviews/read-owned-interview.test.cjs, components/result/useInterviewDeletion.test.cjs and this report changed in the cleanup turn. Production files and Project Memory were not edited. Browser acceptance and the manual incident remain unchanged.

Existing GET suite loader now includes an inert deleteOwnedInterview export which throws if unexpectedly invoked, solely to load the multi-method route. GET assertions unchanged; DELETE remains covered by its own suite. Removed only unused token import, page helper and mocked useCallback from the deletion client harness; all assertions retained.

The complete final client test addition below supersedes its earlier embedded snapshot. Final Project Memory diffs and the existing read-owned-interview test compatibility diff are included. This report's own final source is the documentation artifact; no recursive self-diff is embedded.
```diff
diff --git a/docs/04_Project_Memory/CURRENT_STATE.md b/docs/04_Project_Memory/CURRENT_STATE.md
index 38be362..ef4f446 100644
--- a/docs/04_Project_Memory/CURRENT_STATE.md
+++ b/docs/04_Project_Memory/CURRENT_STATE.md
@@ -1,8 +1,45 @@
 # Talentry / InterviewAI — Current Project State

 Last updated: 2026-10-03
+## DELETE_INTERVIEW_01 — Final runtime acceptance closure — 2026-10-03

-## Current status — HISTORY_PAGINATION_01 — 2026-10-03
+**IMPLEMENTATION + AUTOMATED VALIDATION + LOCAL BROWSER ACCEPTANCE: PASS**, with explicit qualification: wrong-owner live DELETE was NOT COMPLETED / NOT USER-VERIFIED; deterministic automated coverage remains.
+
+Historical/pre-commit checkpoint: branch feature/auth-foundation; committed base before DELETE_INTERVIEW_01 faac5e2. At this documentation checkpoint the stage work was uncommitted. No future commit hash is asserted. This update records user-provided browser evidence; no tests/build or browser checks were rerun, no server restarted, and no Git mutation or Supabase operation was performed by the agent during this documentation turn.
+
+Recorded automated results: server deletion 13/13, client deletion 10/10, pagination 51/51, recovery 34/34, profile 49/49, PDF 14/14; total 171 PASS. TypeScript PASS; git diff --check PASS; production build PASS, 22/22 pages. Initial PDF regression failures were environmental: default/user Python lacked pypdf; invocation-local Codex-bundled Python with pypdf 6.10.0 passed. No production PDF regression found; no persistent env/config or package change. Unused outer loop cleanup reduced 25 misleading registrations to 13 unique server deletion tests without losing assertions. Prior webpack cache snapshot warnings, LF-to-CRLF and npm update notices remain recorded in the Engineering Report.
+
+USER-VERIFIED PASS:
+- A. Cancel: opened confirmation; Cancel preserved the interview.
+- B. Owner hard delete: confirmed permanent deletion, navigated to /interviews, History count 13 -> 12.
+- C. Persistence: closed/reopened/fresh-loaded History; deleted record remained absent and 12 remained.
+- D. Mobile: approximately 400x690 viewport; usable confirmation, no overflow, accessible Cancel/destructive controls.
+- E. Focus: opening confirmation focused Cancel; cancelling returned focus to Delete interview trigger.
+- F. Repeated-delete fail-safe: later DELETE for an already-deleted interview returned 404.
+- G. Deleted Result: deleted interview URL displayed existing unavailable state.
+
+Manual acceptance procedure incident: one additional real interview, ID 19c2c248-b4b7-4b99-b9c2-ce0ef316b39e, was unintentionally deleted by a DevTools Console DELETE fetch while the original owner account remained authenticated. Promise {<pending>} was incorrectly interpreted as if the request had not completed. The DELETE actually succeeded; a second DELETE returned 404 because the record was already deleted. Subsequent Result was unavailable; History became 11 and remained 11 after fresh refresh. This was a MANUAL ACCEPTANCE PROCEDURE ERROR, not an application authorization defect. No restoration is claimed or attempted.
+
+Wrong-owner live DELETE was NOT COMPLETED / NOT USER-VERIFIED: the intended second-account test was not performed before the accidental owner DELETE. Do not infer wrong-owner or second-account browser isolation from this incident. Wrong-owner DELETE, database/provider failure and retry, rapid duplicate prevention, malformed success payload, and deleted PDF 404 behavior are recorded as automated-test-covered only, not browser-tested. PDF automated tests cover owner-read notFound -> 404; no live deletion-to-PDF integration claim is made.
+
+Final architecture: permanent HARD DELETE; Result page only; inline confirmation; DELETE /api/interviews/[id]; server-derived authenticated identity; both id and owner_id predicates; wrong-owner and nonexistent indistinguishable; confirmed success router.replace('/interviews'); fresh History mount/refetch. No History-row delete action, schema/RLS change, new dependency, polling or realtime deletion synchronization.
+
+Exact delete chain:
+```ts
+.delete()
+.eq('id', id)
+.eq('owner_id', auth.user.id)
+.select('id')
+.maybeSingle()
+```
+
+API contract: 200 {"deleted":true}; 401 {"error":"Unauthorized"}; 400 {"error":"Invalid interview id"}; identical 404 {"error":"Interview not found"} for wrong-owner/nonexistent/repeated requests; generic 500 {"error":"Failed to delete interview"}. DELETE responses private, no-store. Auth precedes UUID validation; request ownership inputs are not consumed.
+
+Current user-reported real account count after both deletions: 11. HISTORY_PAGINATION_01 real 21+ browser acceptance remains PENDING. Minimum future seed count is now 10 synthetic records to reach exactly 21; previous 13+8 planning is historical. Future seeding requires explicit authorization and environment confirmation, recording exact new IDs, then exact-ID cleanup and verification of the original 11-ID set. No seeding authorized or performed here.
+
+Remaining limitations: hard deletion is irreversible; stale rendered tabs may retain content until navigation/refresh; downloaded PDFs and backups are outside the row deletion guarantee; live schema parity and unexercised browser cases remain unverified. Auth/recovery/profile/scoring/PDF/history foundations remain frozen. No next stage, staging, commit or push is authorized by this closure.
+
+## Previous stage status — HISTORY_PAGINATION_01 — 2026-10-03

 **AUTOMATED ACCEPTANCE: PASS. Production pagination implementation: UNCHANGED. No source-level pagination defect demonstrated.**

diff --git a/docs/04_Project_Memory/DECISIONS_AND_RISKS.md b/docs/04_Project_Memory/DECISIONS_AND_RISKS.md
index 9961f8c..50036a0 100644
--- a/docs/04_Project_Memory/DECISIONS_AND_RISKS.md
+++ b/docs/04_Project_Memory/DECISIONS_AND_RISKS.md
@@ -1695,3 +1695,41 @@ Existing authenticated POST can create synthetic owner-scoped completed records
 Product decision: implement a separately scoped DELETE_INTERVIEW_01 feature before seeding pagination fixtures. It should allow users and acceptance cleanup to remove specific owned interviews through the application. This records future sequencing only: DELETE_INTERVIEW_01 is NOT implemented or authorized by this documentation update and is outside HISTORY_PAGINATION_01. Environment confirmation and explicit seed authorization remain required before future data creation.

 Historical documentation/pre-commit checkpoint: committed base before stage 96bd04c on feature/auth-foundation; stage tests/reports were uncommitted. No future commit hash asserted. No auth/recovery/profile/PDF/Result/scoring/schema/RLS/source/test changes or Git mutation in this closure.
+
+## DELETE_INTERVIEW_01 — Final runtime acceptance closure — 2026-10-03
+
+**IMPLEMENTATION + AUTOMATED VALIDATION + LOCAL BROWSER ACCEPTANCE: PASS**, with explicit qualification: wrong-owner live DELETE was NOT COMPLETED / NOT USER-VERIFIED; deterministic automated coverage remains.
+
+Historical/pre-commit checkpoint: branch feature/auth-foundation; committed base before DELETE_INTERVIEW_01 faac5e2. At this documentation checkpoint the stage work was uncommitted. No future commit hash is asserted. This update records user-provided browser evidence; no tests/build or browser checks were rerun, no server restarted, and no Git mutation or Supabase operation was performed by the agent during this documentation turn.
+
+Recorded automated results: server deletion 13/13, client deletion 10/10, pagination 51/51, recovery 34/34, profile 49/49, PDF 14/14; total 171 PASS. TypeScript PASS; git diff --check PASS; production build PASS, 22/22 pages. Initial PDF regression failures were environmental: default/user Python lacked pypdf; invocation-local Codex-bundled Python with pypdf 6.10.0 passed. No production PDF regression found; no persistent env/config or package change. Unused outer loop cleanup reduced 25 misleading registrations to 13 unique server deletion tests without losing assertions. Prior webpack cache snapshot warnings, LF-to-CRLF and npm update notices remain recorded in the Engineering Report.
+
+USER-VERIFIED PASS:
+- A. Cancel: opened confirmation; Cancel preserved the interview.
+- B. Owner hard delete: confirmed permanent deletion, navigated to /interviews, History count 13 -> 12.
+- C. Persistence: closed/reopened/fresh-loaded History; deleted record remained absent and 12 remained.
+- D. Mobile: approximately 400x690 viewport; usable confirmation, no overflow, accessible Cancel/destructive controls.
+- E. Focus: opening confirmation focused Cancel; cancelling returned focus to Delete interview trigger.
+- F. Repeated-delete fail-safe: later DELETE for an already-deleted interview returned 404.
+- G. Deleted Result: deleted interview URL displayed existing unavailable state.
+
+Manual acceptance procedure incident: one additional real interview, ID 19c2c248-b4b7-4b99-b9c2-ce0ef316b39e, was unintentionally deleted by a DevTools Console DELETE fetch while the original owner account remained authenticated. Promise {<pending>} was incorrectly interpreted as if the request had not completed. The DELETE actually succeeded; a second DELETE returned 404 because the record was already deleted. Subsequent Result was unavailable; History became 11 and remained 11 after fresh refresh. This was a MANUAL ACCEPTANCE PROCEDURE ERROR, not an application authorization defect. No restoration is claimed or attempted.
+
+Wrong-owner live DELETE was NOT COMPLETED / NOT USER-VERIFIED: the intended second-account test was not performed before the accidental owner DELETE. Do not infer wrong-owner or second-account browser isolation from this incident. Wrong-owner DELETE, database/provider failure and retry, rapid duplicate prevention, malformed success payload, and deleted PDF 404 behavior are recorded as automated-test-covered only, not browser-tested. PDF automated tests cover owner-read notFound -> 404; no live deletion-to-PDF integration claim is made.
+
+Final architecture: permanent HARD DELETE; Result page only; inline confirmation; DELETE /api/interviews/[id]; server-derived authenticated identity; both id and owner_id predicates; wrong-owner and nonexistent indistinguishable; confirmed success router.replace('/interviews'); fresh History mount/refetch. No History-row delete action, schema/RLS change, new dependency, polling or realtime deletion synchronization.
+
+Exact delete chain:
+```ts
+.delete()
+.eq('id', id)
+.eq('owner_id', auth.user.id)
+.select('id')
+.maybeSingle()
+```
+
+API contract: 200 {"deleted":true}; 401 {"error":"Unauthorized"}; 400 {"error":"Invalid interview id"}; identical 404 {"error":"Interview not found"} for wrong-owner/nonexistent/repeated requests; generic 500 {"error":"Failed to delete interview"}. DELETE responses private, no-store. Auth precedes UUID validation; request ownership inputs are not consumed.
+
+Current user-reported real account count after both deletions: 11. HISTORY_PAGINATION_01 real 21+ browser acceptance remains PENDING. Minimum future seed count is now 10 synthetic records to reach exactly 21; previous 13+8 planning is historical. Future seeding requires explicit authorization and environment confirmation, recording exact new IDs, then exact-ID cleanup and verification of the original 11-ID set. No seeding authorized or performed here.
+
+Remaining limitations: hard deletion is irreversible; stale rendered tabs may retain content until navigation/refresh; downloaded PDFs and backups are outside the row deletion guarantee; live schema parity and unexercised browser cases remain unverified. Auth/recovery/profile/scoring/PDF/history foundations remain frozen. No next stage, staging, commit or push is authorized by this closure.
diff --git a/docs/04_Project_Memory/DEFERRED_FIXES.md b/docs/04_Project_Memory/DEFERRED_FIXES.md
index 213a974..50988fc 100644
--- a/docs/04_Project_Memory/DEFERRED_FIXES.md
+++ b/docs/04_Project_Memory/DEFERRED_FIXES.md
@@ -1014,3 +1014,41 @@ The authenticated POST supports synthetic owner-scoped records, but Supabase env
 Separate future product scope: DELETE_INTERVIEW_01 must precede pagination fixture seeding, enabling users and acceptance cleanup to remove specific owned interviews through the application. NOT implemented, NOT authorized by this documentation update, and outside HISTORY_PAGINATION_01. Broader search/filter/sort, virtualization, scroll restoration and unrelated debt remain deferred.

 Historical documentation/pre-commit checkpoint: base 96bd04c on feature/auth-foundation; stage tests/reports were uncommitted. No future commit hash asserted. No production/test edits or Git mutation during closure.
+
+## DELETE_INTERVIEW_01 — Final runtime acceptance closure — 2026-10-03
+
+**IMPLEMENTATION + AUTOMATED VALIDATION + LOCAL BROWSER ACCEPTANCE: PASS**, with explicit qualification: wrong-owner live DELETE was NOT COMPLETED / NOT USER-VERIFIED; deterministic automated coverage remains.
+
+Historical/pre-commit checkpoint: branch feature/auth-foundation; committed base before DELETE_INTERVIEW_01 faac5e2. At this documentation checkpoint the stage work was uncommitted. No future commit hash is asserted. This update records user-provided browser evidence; no tests/build or browser checks were rerun, no server restarted, and no Git mutation or Supabase operation was performed by the agent during this documentation turn.
+
+Recorded automated results: server deletion 13/13, client deletion 10/10, pagination 51/51, recovery 34/34, profile 49/49, PDF 14/14; total 171 PASS. TypeScript PASS; git diff --check PASS; production build PASS, 22/22 pages. Initial PDF regression failures were environmental: default/user Python lacked pypdf; invocation-local Codex-bundled Python with pypdf 6.10.0 passed. No production PDF regression found; no persistent env/config or package change. Unused outer loop cleanup reduced 25 misleading registrations to 13 unique server deletion tests without losing assertions. Prior webpack cache snapshot warnings, LF-to-CRLF and npm update notices remain recorded in the Engineering Report.
+
+USER-VERIFIED PASS:
+- A. Cancel: opened confirmation; Cancel preserved the interview.
+- B. Owner hard delete: confirmed permanent deletion, navigated to /interviews, History count 13 -> 12.
+- C. Persistence: closed/reopened/fresh-loaded History; deleted record remained absent and 12 remained.
+- D. Mobile: approximately 400x690 viewport; usable confirmation, no overflow, accessible Cancel/destructive controls.
+- E. Focus: opening confirmation focused Cancel; cancelling returned focus to Delete interview trigger.
+- F. Repeated-delete fail-safe: later DELETE for an already-deleted interview returned 404.
+- G. Deleted Result: deleted interview URL displayed existing unavailable state.
+
+Manual acceptance procedure incident: one additional real interview, ID 19c2c248-b4b7-4b99-b9c2-ce0ef316b39e, was unintentionally deleted by a DevTools Console DELETE fetch while the original owner account remained authenticated. Promise {<pending>} was incorrectly interpreted as if the request had not completed. The DELETE actually succeeded; a second DELETE returned 404 because the record was already deleted. Subsequent Result was unavailable; History became 11 and remained 11 after fresh refresh. This was a MANUAL ACCEPTANCE PROCEDURE ERROR, not an application authorization defect. No restoration is claimed or attempted.
+
+Wrong-owner live DELETE was NOT COMPLETED / NOT USER-VERIFIED: the intended second-account test was not performed before the accidental owner DELETE. Do not infer wrong-owner or second-account browser isolation from this incident. Wrong-owner DELETE, database/provider failure and retry, rapid duplicate prevention, malformed success payload, and deleted PDF 404 behavior are recorded as automated-test-covered only, not browser-tested. PDF automated tests cover owner-read notFound -> 404; no live deletion-to-PDF integration claim is made.
+
+Final architecture: permanent HARD DELETE; Result page only; inline confirmation; DELETE /api/interviews/[id]; server-derived authenticated identity; both id and owner_id predicates; wrong-owner and nonexistent indistinguishable; confirmed success router.replace('/interviews'); fresh History mount/refetch. No History-row delete action, schema/RLS change, new dependency, polling or realtime deletion synchronization.
+
+Exact delete chain:
+```ts
+.delete()
+.eq('id', id)
+.eq('owner_id', auth.user.id)
+.select('id')
+.maybeSingle()
+```
+
+API contract: 200 {"deleted":true}; 401 {"error":"Unauthorized"}; 400 {"error":"Invalid interview id"}; identical 404 {"error":"Interview not found"} for wrong-owner/nonexistent/repeated requests; generic 500 {"error":"Failed to delete interview"}. DELETE responses private, no-store. Auth precedes UUID validation; request ownership inputs are not consumed.
+
+Current user-reported real account count after both deletions: 11. HISTORY_PAGINATION_01 real 21+ browser acceptance remains PENDING. Minimum future seed count is now 10 synthetic records to reach exactly 21; previous 13+8 planning is historical. Future seeding requires explicit authorization and environment confirmation, recording exact new IDs, then exact-ID cleanup and verification of the original 11-ID set. No seeding authorized or performed here.
+
+Remaining limitations: hard deletion is irreversible; stale rendered tabs may retain content until navigation/refresh; downloaded PDFs and backups are outside the row deletion guarantee; live schema parity and unexercised browser cases remain unverified. Auth/recovery/profile/scoring/PDF/history foundations remain frozen. No next stage, staging, commit or push is authorized by this closure.
diff --git a/docs/04_Project_Memory/STAGE_LOG.md b/docs/04_Project_Memory/STAGE_LOG.md
index e488372..700c2d1 100644
--- a/docs/04_Project_Memory/STAGE_LOG.md
+++ b/docs/04_Project_Memory/STAGE_LOG.md
@@ -1876,3 +1876,41 @@ Seeding deferred: existing authenticated POST supports synthetic owner-scoped re
 Product decision: implement separately scoped DELETE_INTERVIEW_01 before seeding pagination fixtures, so users and acceptance cleanup can remove specific owned interviews through the application. This future feature is NOT implemented or authorized by this documentation update and is NOT part of HISTORY_PAGINATION_01.

 Historical pre-commit context for this closure: committed base before the stage 96bd04c, branch feature/auth-foundation; stage test/report additions were uncommitted. No future commit hash asserted. Updated only the two HISTORY_PAGINATION_01 reports and CURRENT_STATE.md, STAGE_LOG.md, DEFERRED_FIXES.md, DECISIONS_AND_RISKS.md. No source/test edits, tests/build reruns, dev server start, staging, commit or push. Documentation review pending; no next stage automatically authorized.
+
+## DELETE_INTERVIEW_01 — Final runtime acceptance closure — 2026-10-03
+
+**IMPLEMENTATION + AUTOMATED VALIDATION + LOCAL BROWSER ACCEPTANCE: PASS**, with explicit qualification: wrong-owner live DELETE was NOT COMPLETED / NOT USER-VERIFIED; deterministic automated coverage remains.
+
+Historical/pre-commit checkpoint: branch feature/auth-foundation; committed base before DELETE_INTERVIEW_01 faac5e2. At this documentation checkpoint the stage work was uncommitted. No future commit hash is asserted. This update records user-provided browser evidence; no tests/build or browser checks were rerun, no server restarted, and no Git mutation or Supabase operation was performed by the agent during this documentation turn.
+
+Recorded automated results: server deletion 13/13, client deletion 10/10, pagination 51/51, recovery 34/34, profile 49/49, PDF 14/14; total 171 PASS. TypeScript PASS; git diff --check PASS; production build PASS, 22/22 pages. Initial PDF regression failures were environmental: default/user Python lacked pypdf; invocation-local Codex-bundled Python with pypdf 6.10.0 passed. No production PDF regression found; no persistent env/config or package change. Unused outer loop cleanup reduced 25 misleading registrations to 13 unique server deletion tests without losing assertions. Prior webpack cache snapshot warnings, LF-to-CRLF and npm update notices remain recorded in the Engineering Report.
+
+USER-VERIFIED PASS:
+- A. Cancel: opened confirmation; Cancel preserved the interview.
+- B. Owner hard delete: confirmed permanent deletion, navigated to /interviews, History count 13 -> 12.
+- C. Persistence: closed/reopened/fresh-loaded History; deleted record remained absent and 12 remained.
+- D. Mobile: approximately 400x690 viewport; usable confirmation, no overflow, accessible Cancel/destructive controls.
+- E. Focus: opening confirmation focused Cancel; cancelling returned focus to Delete interview trigger.
+- F. Repeated-delete fail-safe: later DELETE for an already-deleted interview returned 404.
+- G. Deleted Result: deleted interview URL displayed existing unavailable state.
+
+Manual acceptance procedure incident: one additional real interview, ID 19c2c248-b4b7-4b99-b9c2-ce0ef316b39e, was unintentionally deleted by a DevTools Console DELETE fetch while the original owner account remained authenticated. Promise {<pending>} was incorrectly interpreted as if the request had not completed. The DELETE actually succeeded; a second DELETE returned 404 because the record was already deleted. Subsequent Result was unavailable; History became 11 and remained 11 after fresh refresh. This was a MANUAL ACCEPTANCE PROCEDURE ERROR, not an application authorization defect. No restoration is claimed or attempted.
+
+Wrong-owner live DELETE was NOT COMPLETED / NOT USER-VERIFIED: the intended second-account test was not performed before the accidental owner DELETE. Do not infer wrong-owner or second-account browser isolation from this incident. Wrong-owner DELETE, database/provider failure and retry, rapid duplicate prevention, malformed success payload, and deleted PDF 404 behavior are recorded as automated-test-covered only, not browser-tested. PDF automated tests cover owner-read notFound -> 404; no live deletion-to-PDF integration claim is made.
+
+Final architecture: permanent HARD DELETE; Result page only; inline confirmation; DELETE /api/interviews/[id]; server-derived authenticated identity; both id and owner_id predicates; wrong-owner and nonexistent indistinguishable; confirmed success router.replace('/interviews'); fresh History mount/refetch. No History-row delete action, schema/RLS change, new dependency, polling or realtime deletion synchronization.
+
+Exact delete chain:
+```ts
+.delete()
+.eq('id', id)
+.eq('owner_id', auth.user.id)
+.select('id')
+.maybeSingle()
+```
+
+API contract: 200 {"deleted":true}; 401 {"error":"Unauthorized"}; 400 {"error":"Invalid interview id"}; identical 404 {"error":"Interview not found"} for wrong-owner/nonexistent/repeated requests; generic 500 {"error":"Failed to delete interview"}. DELETE responses private, no-store. Auth precedes UUID validation; request ownership inputs are not consumed.
+
+Current user-reported real account count after both deletions: 11. HISTORY_PAGINATION_01 real 21+ browser acceptance remains PENDING. Minimum future seed count is now 10 synthetic records to reach exactly 21; previous 13+8 planning is historical. Future seeding requires explicit authorization and environment confirmation, recording exact new IDs, then exact-ID cleanup and verification of the original 11-ID set. No seeding authorized or performed here.
+
+Remaining limitations: hard deletion is irreversible; stale rendered tabs may retain content until navigation/refresh; downloaded PDFs and backups are outside the row deletion guarantee; live schema parity and unexercised browser cases remain unverified. Auth/recovery/profile/scoring/PDF/history foundations remain frozen. No next stage, staging, commit or push is authorized by this closure.
diff --git a/lib/interviews/read-owned-interview.test.cjs b/lib/interviews/read-owned-interview.test.cjs
index 377aec9..a6c074b 100644
--- a/lib/interviews/read-owned-interview.test.cjs
+++ b/lib/interviews/read-owned-interview.test.cjs
@@ -46,6 +46,7 @@ function harness({ user = 'owner-a', data = row, error = null } = {}) {
   })
   const route = load('app/api/interviews/[id]/route.ts', {
     'next/server': { NextResponse }, '@/lib/interviews/read-owned-interview': reader,
+    '@/lib/interviews/delete-owned-interview': { deleteOwnedInterview() { throw new Error('DELETE is outside this GET suite') } },
   })
   return { ...reader, ...route, calls, filters }
 }
diff --git a/components/result/useInterviewDeletion.test.cjs b/components/result/useInterviewDeletion.test.cjs
new file mode 100644
--- /dev/null
+++ b/components/result/useInterviewDeletion.test.cjs
@@ -0,0 +1,94 @@
+const { test } = require('node:test')
+const assert = require('node:assert/strict')
+const { load, plain, fixture, item } = require('../../lib/interviews/history-test-helpers.cjs')
+const rows = fixture(), items = rows.map(item)
+const tick = () => new Promise(resolve => setImmediate(resolve))
+function deferred() { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no }); return { promise, resolve, reject } }
+// Minimal persistent-slot hook harness: rerenders state, compares dependencies,
+// runs effect cleanup, and leaves fetch promises under each test's control.
+// No DOM/React scheduling or browser-visibility claim is made by this harness.
+function harness() {
+  const slots = [], effects = [], pending = [], requests = [], navigation = []
+  let index = 0, view, disposed = false, updates = 0, scheduled = false
+  const router = { replace: destination => navigation.push(destination) }
+  const same = (a, b) => a && a.length === b.length && a.every((value, i) => Object.is(value, b[i]))
+  const react = {
+    useState(initial) {
+      const i = index++; if (!(i in slots)) slots[i] = initial
+      return [slots[i], value => {
+        updates++; slots[i] = value
+        if (!scheduled && !disposed) { scheduled = true; queueMicrotask(() => { scheduled = false; if (!disposed) render() }) }
+      }]
+    },
+    useRef(initial) { const i = index++; return slots[i] || (slots[i] = { current: initial }) },
+    useEffect(fn, deps) {
+      const i = index++, previous = effects[i]
+      if (!same(previous?.deps, deps)) pending.push(() => { previous?.cleanup?.(); effects[i] = { deps, cleanup: fn() } })
+    },
+  }
+  const { AUTH_ROUTES } = load('lib/auth/auth-constants.ts', {})
+  const hook = load('components/result/useInterviewDeletion.ts', {
+    react, 'next/navigation': { useRouter: () => router }, '@/lib/auth/auth-constants': { AUTH_ROUTES },
+  }, { AbortController, fetch(url, options) {
+    const d = deferred(); requests.push({ url, options, ...d }); return d.promise
+  } }).useInterviewDeletion
+  function render() { index = 0; view = hook(items[0].id); while (pending.length) pending.shift()() }
+  render()
+  return { requests, navigation, get state() { return plain(view.state) }, get updates() { return updates },
+    open() { view.open() }, cancel() { view.cancel() }, confirm() { return view.confirm() },
+    unmount() { disposed = true; effects.forEach(effect => effect?.cleanup?.()) },
+    async respond(i, payload, status = 200) {
+      requests[i].resolve({ status, ok: status >= 200 && status < 300, json: async () => payload }); await tick()
+    },
+    async fail(i) { requests[i].reject(new Error('Synthetic network failure')); await tick() },
+  }
+}
+
+test('confirmation required and Cancel sends no request', async () => {
+  const h = harness(); await h.confirm(); assert.equal(h.requests.length, 0)
+  h.open(); await tick(); assert.equal(h.state.confirming, true)
+  h.cancel(); await tick(); await h.confirm(); assert.equal(h.requests.length, 0)
+  assert.equal(h.state.confirming, false); h.unmount()
+})
+test('synchronous duplicate guard, request options and loading state', async () => {
+  const h = harness(); h.open(); const first = h.confirm(); void h.confirm(); await tick()
+  assert.equal(h.requests.length, 1); assert.equal(h.state.deleting, true)
+  assert.equal(h.requests[0].url, '/api/interviews/' + items[0].id)
+  assert.equal(h.requests[0].options.method, 'DELETE'); assert.equal(h.requests[0].options.credentials, 'same-origin')
+  assert.equal(h.requests[0].options.cache, 'no-store'); assert.equal('body' in h.requests[0].options, false)
+  h.cancel(); await tick(); assert.equal(h.state.confirming, true)
+  await h.respond(0, { deleted: true }); await first; await h.confirm()
+  assert.deepEqual(h.navigation, ['/interviews']); assert.equal(h.requests.length, 1); h.unmount()
+})
+test('status alone or malformed success never navigates', async () => {
+  for (const body of [null, {}, { deleted: false }, { deleted: 'true' }]) {
+    const h = harness(); h.open(); void h.confirm(); await h.respond(0, body)
+    assert.deepEqual(h.navigation, []); assert.equal(h.state.error, 'failed')
+    assert.equal(h.state.confirming, true); assert.equal(h.state.deleting, false); h.unmount()
+  }
+})
+test('401 uses existing login route', async () => {
+  const h = harness(); h.open(); void h.confirm(); await h.respond(0, {}, 401)
+  assert.deepEqual(h.navigation, ['/login']); h.unmount()
+})
+for (const status of [400, 404]) test(status + ' becomes unavailable without false success', async () => {
+  const h = harness(); h.open(); void h.confirm(); await h.respond(0, {}, status)
+  assert.equal(h.state.error, 'unavailable'); assert.equal(h.state.deleting, false)
+  assert.deepEqual(h.navigation, []); await h.confirm(); assert.equal(h.requests.length, 1); h.unmount()
+})
+for (const kind of ['server', 'network']) test(kind + ' failure retains confirmation and retries', async () => {
+  const h = harness(); h.open(); void h.confirm()
+  if (kind === 'server') await h.respond(0, {}, 500); else await h.fail(0)
+  assert.equal(h.state.confirming, true); assert.equal(h.state.error, 'failed'); assert.equal(h.state.deleting, false)
+  assert.deepEqual(h.navigation, []); void h.confirm(); await h.respond(1, { deleted: true })
+  assert.deepEqual(h.navigation, ['/interviews']); h.unmount()
+})
+test('unmount aborts and late completion cannot update or navigate', async () => {
+  const h = harness(); h.open(); void h.confirm(); await tick()
+  const updates = h.updates; h.unmount(); assert.equal(h.requests[0].options.signal.aborted, true)
+  await h.respond(0, { deleted: true }); assert.equal(h.updates, updates); assert.deepEqual(h.navigation, [])
+})
+test('late network rejection after disposal cannot update state', async () => {
+  const h = harness(); h.open(); void h.confirm(); await tick(); h.unmount(); const updates = h.updates
+  await h.fail(0); assert.equal(h.updates, updates); assert.deepEqual(h.navigation, [])
+})
```

### Final cleanup validation results

All seven suites rerun in required order, exit 0: existing detail/owner-read 8/8; server deletion 13/13; client deletion 10/10; pagination 51/51; recovery 34/34; profile 49/49; PDF 14/14. Total 179 PASS. No assertions weakened. PDF invocation alone used REPORT_PDF_PYTHON=C:/Users/p-ayd/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe; no persistent environment change or installation.

npx tsc --noEmit --incremental false: exit 0. git diff --check: exit 0, LF-to-CRLF notices only. Elevated read-only repository process check: exit 0, no matching next dev process. npm run build: exit 0; compiled, lint/type checks completed, static pages 22/22. Two unrelated webpack cache snapshot warnings and npm update notice 11.16.0 -> 12.2.0; no DELETE-route-specific warning/error. No dev server restarted. No destructive browser checks repeated or Supabase data mutated; existing qualified user acceptance remains valid.

Final inventory verified: 8 modified tracked + 8 untracked new = 16. Only the GET test compatibility mock, unused deletion-client harness removal and this Engineering Report were changed in the final cleanup. Earlier 171-test counts refer to prior validation; final 179 includes the additional existing detail regression. Summary and Project Memory were not modified in this cleanup.

### Final Summary addition snapshot

This final Summary snapshot supersedes the earlier automated-validation Summary snapshot in section 12. Its historical 171-test result remains intact; the final 179-test rerun is recorded above.
```diff
diff --git a/docs/01_Engineering/Sprint_DELETE_INTERVIEW_01_Summary.md b/docs/01_Engineering/Sprint_DELETE_INTERVIEW_01_Summary.md
new file mode 100644
--- /dev/null
+++ b/docs/01_Engineering/Sprint_DELETE_INTERVIEW_01_Summary.md
@@ -0,0 +1,56 @@
+# Sprint DELETE_INTERVIEW_01 Summary
+
+- Title: Permanent deletion of one owned persisted interview
+- Date: 2026-10-03 (Europe/Istanbul)
+- Branch: feature/auth-foundation
+- Historical pre-commit base before DELETE_INTERVIEW_01: faac5e2; local origin matched at the implementation checkpoint. No future commit hash asserted.
+- Status: IMPLEMENTATION + AUTOMATED VALIDATION + LOCAL BROWSER ACCEPTANCE: PASS; wrong-owner browser DELETE not completed, automated coverage remains.
+- Goal: Authenticated owners can deliberately permanently delete one persisted interview from Result.
+- Created files: lib/interviews/delete-owned-interview.ts; lib/interviews/delete-owned-interview.test.cjs; components/result/ResultDeleteInterview.tsx; components/result/useInterviewDeletion.ts; components/result/useInterviewDeletion.test.cjs; components/result/interview-deletion-copy.ts; this Summary; Sprint_DELETE_INTERVIEW_01_Engineering_Report.md.
+- Modified files: app/api/interviews/[id]/route.ts; components/result/ResultContent.tsx; app/result/result.module.css.
+- Behavior: Single owner-filtered hard delete, Result-only inline confirmation, localized TR/EN/DE warning that deletion cannot be undone, server-confirmed success navigates with router.replace('/interviews'). History freshly mounts and reloads its first page. Existing GET and PDF contracts remain unchanged.
+- API: DELETE /api/interviews/[id]; 200 {"deleted":true}; 401 Unauthorized; 400 Invalid interview id; identical 404 Interview not found for wrong-owner, missing and repeated deletion; generic 500 Failed to delete interview. DELETE responses are private, no-store.
+- Validation: Server deletion 13/13; client deletion 10/10; pagination 51/51; recovery 34/34; profile 49/49; PDF 14/14. Total 171 PASS. TypeScript PASS; git diff --check PASS; production build exit 0, static generation 22/22.
+- Diagnosis: Initial PDF failures were execution-environment failures: sandbox EPERM; default/user Python lacked pypdf and exited prematurely, producing Node EOF. Invocation-local bundled Python with pypdf 6.10.0 passed the unchanged PDF regression. No PDF production regression was identified. No persistent environment/config or package changes.
+- Test cleanup: Removed only unused outer loop; 25 misleading server registrations became 13 unique cases with all assertions retained.
+- Warnings: Two webpack cache warnings (Unable to snapshot resolve dependencies), LF-to-CRLF Git notices, npm update notice 11.16.0 -> 12.2.0. No DELETE-route-specific build warning/error.
+- Risks: Permanent deletion; wrong-owner browser test not completed; automated-only edge cases and live schema parity remain unverified. Stale tabs/downloaded PDFs remain outside deletion guarantee. Current real count 11 after two user-performed deletions, including one manual procedure incident; future 21-record acceptance needs 10 authorized synthetic records.
+- Dev server: Read-only process check found none before build; no dev server restarted.
+- Approval status: User reported local runtime acceptance complete with explicit wrong-owner qualification. This documentation closure updates four Project Memory files; no stage/commit/push or agent-performed real record mutation. No further stage authorized.
+## DELETE_INTERVIEW_01 — Final runtime acceptance closure — 2026-10-03
+
+**IMPLEMENTATION + AUTOMATED VALIDATION + LOCAL BROWSER ACCEPTANCE: PASS**, with explicit qualification: wrong-owner live DELETE was NOT COMPLETED / NOT USER-VERIFIED; deterministic automated coverage remains.
+
+Historical/pre-commit checkpoint: branch feature/auth-foundation; committed base before DELETE_INTERVIEW_01 faac5e2. At this documentation checkpoint the stage work was uncommitted. No future commit hash is asserted. This update records user-provided browser evidence; no tests/build or browser checks were rerun, no server restarted, and no Git mutation or Supabase operation was performed by the agent during this documentation turn.
+
+Recorded automated results: server deletion 13/13, client deletion 10/10, pagination 51/51, recovery 34/34, profile 49/49, PDF 14/14; total 171 PASS. TypeScript PASS; git diff --check PASS; production build PASS, 22/22 pages. Initial PDF regression failures were environmental: default/user Python lacked pypdf; invocation-local Codex-bundled Python with pypdf 6.10.0 passed. No production PDF regression found; no persistent env/config or package change. Unused outer loop cleanup reduced 25 misleading registrations to 13 unique server deletion tests without losing assertions. Prior webpack cache snapshot warnings, LF-to-CRLF and npm update notices remain recorded in the Engineering Report.
+
+USER-VERIFIED PASS:
+- A. Cancel: opened confirmation; Cancel preserved the interview.
+- B. Owner hard delete: confirmed permanent deletion, navigated to /interviews, History count 13 -> 12.
+- C. Persistence: closed/reopened/fresh-loaded History; deleted record remained absent and 12 remained.
+- D. Mobile: approximately 400x690 viewport; usable confirmation, no overflow, accessible Cancel/destructive controls.
+- E. Focus: opening confirmation focused Cancel; cancelling returned focus to Delete interview trigger.
+- F. Repeated-delete fail-safe: later DELETE for an already-deleted interview returned 404.
+- G. Deleted Result: deleted interview URL displayed existing unavailable state.
+
+Manual acceptance procedure incident: one additional real interview, ID 19c2c248-b4b7-4b99-b9c2-ce0ef316b39e, was unintentionally deleted by a DevTools Console DELETE fetch while the original owner account remained authenticated. Promise {<pending>} was incorrectly interpreted as if the request had not completed. The DELETE actually succeeded; a second DELETE returned 404 because the record was already deleted. Subsequent Result was unavailable; History became 11 and remained 11 after fresh refresh. This was a MANUAL ACCEPTANCE PROCEDURE ERROR, not an application authorization defect. No restoration is claimed or attempted.
+
+Wrong-owner live DELETE was NOT COMPLETED / NOT USER-VERIFIED: the intended second-account test was not performed before the accidental owner DELETE. Do not infer wrong-owner or second-account browser isolation from this incident. Wrong-owner DELETE, database/provider failure and retry, rapid duplicate prevention, malformed success payload, and deleted PDF 404 behavior are recorded as automated-test-covered only, not browser-tested. PDF automated tests cover owner-read notFound -> 404; no live deletion-to-PDF integration claim is made.
+
+Final architecture: permanent HARD DELETE; Result page only; inline confirmation; DELETE /api/interviews/[id]; server-derived authenticated identity; both id and owner_id predicates; wrong-owner and nonexistent indistinguishable; confirmed success router.replace('/interviews'); fresh History mount/refetch. No History-row delete action, schema/RLS change, new dependency, polling or realtime deletion synchronization.
+
+Exact delete chain:
+```ts
+.delete()
+.eq('id', id)
+.eq('owner_id', auth.user.id)
+.select('id')
+.maybeSingle()
+```
+
+API contract: 200 {"deleted":true}; 401 {"error":"Unauthorized"}; 400 {"error":"Invalid interview id"}; identical 404 {"error":"Interview not found"} for wrong-owner/nonexistent/repeated requests; generic 500 {"error":"Failed to delete interview"}. DELETE responses private, no-store. Auth precedes UUID validation; request ownership inputs are not consumed.
+
+Current user-reported real account count after both deletions: 11. HISTORY_PAGINATION_01 real 21+ browser acceptance remains PENDING. Minimum future seed count is now 10 synthetic records to reach exactly 21; previous 13+8 planning is historical. Future seeding requires explicit authorization and environment confirmation, recording exact new IDs, then exact-ID cleanup and verification of the original 11-ID set. No seeding authorized or performed here.
+
+Remaining limitations: hard deletion is irreversible; stale rendered tabs may retain content until navigation/refresh; downloaded PDFs and backups are outside the row deletion guarantee; live schema parity and unexercised browser cases remain unverified. Auth/recovery/profile/scoring/PDF/history foundations remain frozen. No next stage, staging, commit or push is authorized by this closure.
```
