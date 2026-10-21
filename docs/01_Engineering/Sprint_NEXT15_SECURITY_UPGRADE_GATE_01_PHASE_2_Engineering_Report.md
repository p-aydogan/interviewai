# Sprint NEXT15_SECURITY_UPGRADE_GATE_01_PHASE_2 Engineering Report

## 1. Report Identity

- Date: 2026-10-21 (Europe/Istanbul)
- Sprint: NEXT15_SECURITY_UPGRADE_GATE_01_PHASE_2; Phase 2 controlled framework security migration.
- Status: Awaiting approval. No Git mutation authorized or performed.
- User attachment ended at bare section 11; completed sections 0-10 plus repository validation/reporting requirements were followed.

## 2. Sprint Objective and Boundaries

Migrate Next 14.2.5/React 18.3.1 to exact Next 15.5.28 with a stable matching React 19 set. Only authorized dependency changes and audited manual request/ref/config adaptations. No codemods, force/legacy-peer-deps, new direct runtime dependencies, direct sharp, ESLint, provider calls, auth redesign, completion redesign, UI redesign or Next 16 migration.

## 3. Repository State Before Implementation

Repository C:/Users/p-ayd/interviewai; branch feature/auth-foundation. HEAD and local origin/feature/auth-foundation both 74e699b7c8ae10a232426364907d5194d8819eb6; subject fix(security): harden provider and api boundaries. Clean working tree and no reported ahead/behind. No fetch performed. Node 24.18.0, npm 11.16.0.

## 4. Architecture and Implementation Decisions

One manual migration path: registry gate, exact installation, async request forms, narrow ref/config changes, promised fixtures, regressions, types, build, reports. Next 15.5.28 registry peer React/ReactDOM range: ^18.2.0 || 19.0.0-rc-de68d2f4-20241204 || ^19.0.0. Engine: ^18.18.0 || ^19.8.0 || >=20.0.0. Highest stable React 19 version returned was 19.3.1; matching ReactDOM peer ^19.3.1. React types 19.3.0; DOM types 19.3.0 peer ^19.3.0.

Registry metadata inspected for exact existing Supabase, HeyGen and jsPDF versions. Supabase SSR peer ^2.110.5 is satisfied by retained JS 2.110.8, which requires Node >=22. Other inspected direct packages declare no React peer constraint. Installed tree validates cleanly after transient old-tree npm peer warning. sharp 0.35.5 is transitive and meets the advisory minimum.

Auth factory becomes async; its sole production caller awaits it. Existing WEB cookie and verified native bearer rules remain intact, including invalid bearer and conflicting identity denial. No ownership/prompt/allowlist/admission logic modified. Route helpers still authenticate before UUID validation and storage. Awaiting the framework params before calling helpers does not parse or authorize user input. Interview page still authenticates before awaiting/parsing input. Client result uses React use without changing architecture.

Next build generated tsconfig ES2017 target and next-env route-type reference; preserved and explicitly disclosed. No unrelated application implementation change.

## 5. Created and Modified Files

Created: docs/01_Engineering/Sprint_NEXT15_SECURITY_UPGRADE_GATE_01_PHASE_2_Summary.md, docs/01_Engineering/Sprint_NEXT15_SECURITY_UPGRADE_GATE_01_PHASE_2_Engineering_Report.md.

- `app/api/interviews/[id]/pdf/route.ts`
- `app/api/interviews/[id]/route.ts`
- `app/interview/page.tsx`
- `app/result/[id]/page.tsx`
- `components/interview/InterviewerStage.tsx`
- `lib/auth/get-authenticated-user.ts`
- `lib/interviews/delete-owned-interview.test.cjs`
- `lib/interviews/interview-route-input.test.cjs`
- `lib/interviews/read-owned-interview.test.cjs`
- `lib/providers/security-privacy.test.cjs`
- `lib/reports/interview-report.test.cjs`
- `lib/supabase/server.ts`
- `next-env.d.ts`
- `next.config.js`
- `package-lock.json`
- `package.json`
- `tsconfig.json`

## 6. Responsibility of Each File

- `app/api/interviews/[id]/pdf/route.ts`: Awaits params; persisted-language PDF, Node runtime, force-dynamic and headers unchanged.
- `app/api/interviews/[id]/route.ts`: GET/DELETE await params; owner-scoped helpers and response contracts unchanged.
- `app/interview/page.tsx`: Promise searchParams awaited after authentication; canonical parsing and key unchanged.
- `app/result/[id]/page.tsx`: Promise params consumed with React use; client architecture, fetch/effects and navigation unchanged.
- `components/interview/InterviewerStage.tsx`: Nullable video RefObject current typing only.
- `lib/auth/get-authenticated-user.ts`: Awaits factory; cookie/bearer verification and fail-closed decisions unchanged.
- `lib/interviews/delete-owned-interview.test.cjs`: Promised DELETE params fixtures; auth/ownership behavior retained.
- `lib/interviews/interview-route-input.test.cjs`: Promised searchParams fixture; existing input/auth-order regressions retained.
- `lib/interviews/read-owned-interview.test.cjs`: Promised route params fixture; ownership/privacy coverage retained.
- `lib/providers/security-privacy.test.cjs`: Async factory fixtures; rejected async factory privacy/fail-closed test; cookie reads, write options and narrow exception behavior test.
- `lib/reports/interview-report.test.cjs`: Promised PDF route params fixtures; real parser/render coverage retained.
- `lib/supabase/server.ts`: Async server client factory awaits cookies; existing getAll/setAll/options and narrow exception handling unchanged.
- `next-env.d.ts`: Next-generated route types reference and documentation link.
- `next.config.js`: Move identical PDF asset tracing patterns to top-level outputFileTracingIncludes.
- `package-lock.json`: Normal npm target dependency resolution, including sharp and platform dependencies.
- `package.json`: Exact approved five dependency pins; unrelated declarations unchanged.
- `tsconfig.json`: Next-generated ES2017 target and formatting.

Reports document completed work, evidence, limitations and approval status. Previous reports untouched.

## 7. Public Interfaces, Props, or Types

createClient now returns a Promise of the Supabase server client. InterviewPage searchParams is Promise<InterviewSearchParams>. Dynamic API context params is Promise<{id:string}>. ResultPageProps.params is Promise<{id:string}> consumed with React use. InterviewerStage cameraRef is RefObject<HTMLVideoElement | null>. Existing response payloads/statuses and security contracts unchanged.

## 8. Accessibility Decisions

No semantic markup, focus behavior, interaction controls or motion changes. Nullable ref typing preserves camera behavior. Browser focus/hydration acceptance not performed.

## 9. Styling and Token Usage

No CSS, palette or token changes. PDF tracing retains exactly assets/fonts/*.ttf and styles/talentry-tokens.css. No Cache Components, dynamicIO, SVG exceptions, compiler or unrelated experimental feature enabled.

## 10. Validation Commands and Exact Results

- Read-only npm registry views: Next target peers/engines, React/DOM 19 versions/peers, React type versions/peers, exact existing five Supabase/HeyGen/jsPDF package metadata. First sandbox Next view failed ENOTFOUND registry.npmjs.org; approved elevated query succeeded.
- npm.cmd install --save-exact next@15.5.28 react@19.3.1 react-dom@19.3.1 @types/react@19.3.0 @types/react-dom@19.3.0 --fetch-retries=0 --fetch-timeout=30000: exit 0; added 5, removed 6, changed 10; audited 289. Warnings: ERESOLVE overriding old react-dom@18.3.1 React ^18.3.1 peer while replacing tree; 18 vulnerabilities (13 moderate, 3 high, 2 critical); core-js@3.49.0 install scripts pending allowScripts. No bypass, audit fix, or approve-scripts run.
- npm.cmd ls next react react-dom @types/react @types/react-dom sharp: exit 0; no invalid peers. Package, lock and installed metadata agree on all five pins; sharp 0.35.5; styled-jsx 5.1.6.
- Protected dependencies compared against HEAD lock: Supabase SSR 0.12.3, Supabase JS 2.110.8, jsPDF 4.2.1, HeyGen 0.0.18/1.0.16, TypeScript 5.9.3, Node types 20.19.43 all unchanged.
- Default python -B -c import pypdf: ModuleNotFoundError. Existing bundled Python has pypdf; no parser installation.
- Test invocation: REPORT_PDF_PYTHON set only for process to bundled Python; $migrationTests = @(rg --files lib components -g '*.test.cjs'); node --test @migrationTests. All 16 existing test files included, with two additional test cases. No real auth/database/provider imports in isolated fixtures.

```text
ℹ tests 611
ℹ suites 0
ℹ pass 611
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 25692.6258
```

- npx.cmd tsc --noEmit --incremental false: exit 0 before build and repeated after generated type/config changes.
- npm.cmd run build: initial sandbox exit 1, EPERM mkdir C:/Users/p-ayd/interviewai/.next/types/app/api/interviews. Approved elevated rerun exit 0, Next 15.5.28 compiled successfully, types checked, 22/22 static generation tasks completed, optimization and traces completed. Dynamic authenticated/API routes retained. Build reads .env.local; no environment values displayed.
- PDF route trace checked for Inter-Regular.ttf, Inter-SemiBold.ttf and talentry-tokens.css; all TRACED.
- git diff --check: exit 0. Git emits LF-to-CRLF conversion warnings on changed LF files; no whitespace errors.
- Browser/live Supabase/PKCE/provider acceptance: NOT RUN; no claim of completion.

## 11. Git Status

HEAD/branch unchanged, nothing staged, no commit/push. 17 tracked files modified as listed; two new reports. Temporary test stdout file removed after extracting results. Build outputs remain ignored. No pre-existing changes existed.

## 12. Complete Diffs for Sprint Files

Complete tracked implementation/test/config/dependency diff follows, including the full lockfile diff. Report files are new audit artifacts; the Summary content is reproduced below. This Engineering Report is its own full new-file content and is not recursively embedded.

```diff
diff --git a/app/api/interviews/[id]/pdf/route.ts b/app/api/interviews/[id]/pdf/route.ts
index 669e581..c6c9e86 100644
--- a/app/api/interviews/[id]/pdf/route.ts
+++ b/app/api/interviews/[id]/pdf/route.ts
@@ -9,9 +9,10 @@ export const dynamic = 'force-dynamic'
 const headers = { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' }
 const errorResponse = (error: string, status: number) => NextResponse.json({ error }, { status, headers })

-export async function GET(_request: Request, { params }: { params: { id: string } }) {
+export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
   try {
-    const result = await readOwnedInterview(params.id)
+    const { id } = await params
+    const result = await readOwnedInterview(id)
     switch (result.status) {
       case 'unauthorized': return errorResponse('Unauthorized', 401)
       case 'invalidId': return errorResponse('Invalid interview id', 400)
diff --git a/app/api/interviews/[id]/route.ts b/app/api/interviews/[id]/route.ts
index a6728b5..c0c3ee0 100644
--- a/app/api/interviews/[id]/route.ts
+++ b/app/api/interviews/[id]/route.ts
@@ -2,8 +2,9 @@ import { NextResponse } from 'next/server'
 import { readOwnedInterview } from '@/lib/interviews/read-owned-interview'
 import { deleteOwnedInterview } from '@/lib/interviews/delete-owned-interview'

-export async function GET(_request: Request, { params }: { params: { id: string } }) {
-  const result = await readOwnedInterview(params.id)
+export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
+  const { id } = await params
+  const result = await readOwnedInterview(id)
   switch (result.status) {
     case 'ready': return NextResponse.json({ interview: result.interview }, { status: 200 })
     case 'unauthorized': return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
@@ -13,10 +14,11 @@ export async function GET(_request: Request, { params }: { params: { id: string
   }
 }

-export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
+export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
   const headers = { 'Cache-Control': 'private, no-store' }
   try {
-    const result = await deleteOwnedInterview(params.id)
+    const { id } = await params
+    const result = await deleteOwnedInterview(id)
     switch (result.status) {
       case 'deleted': return NextResponse.json({ deleted: true }, { status: 200, headers })
       case 'unauthorized': return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers })
diff --git a/app/interview/page.tsx b/app/interview/page.tsx
index 3c91e40..86a300b 100644
--- a/app/interview/page.tsx
+++ b/app/interview/page.tsx
@@ -5,10 +5,10 @@ import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
 import { interviewSetupKey, parseInterviewSetupInput } from '@/lib/interviews/interview-setup-input'
 import type { InterviewSearchParams } from '@/lib/interviews/interview-setup-input'

-export default async function InterviewPage({ searchParams }: { searchParams: InterviewSearchParams }) {
+export default async function InterviewPage({ searchParams }: { searchParams: Promise<InterviewSearchParams> }) {
   const auth = await getAuthenticatedUser()
   if (auth.status !== 'authenticated') redirect(AUTH_ROUTES.login)
-  const config = parseInterviewSetupInput(searchParams)
+  const config = parseInterviewSetupInput(await searchParams)
   if (!config) redirect('/interview/setup')
   return <LiveInterviewClient key={interviewSetupKey(config)} config={config} />
 }
diff --git a/app/result/[id]/page.tsx b/app/result/[id]/page.tsx
index c184faf..e1b5bca 100644
--- a/app/result/[id]/page.tsx
+++ b/app/result/[id]/page.tsx
@@ -5,7 +5,7 @@ import ResultShell, { ResultStatus } from '@/components/result/ResultShell'
 import { RESULT_COPY, RESULT_UI_LANGUAGE_KEY } from '@/components/result/result-copy'
 import type { AppLanguage } from '@/types/auth'
 import { useRouter } from 'next/navigation'
-import { useEffect, useState } from 'react'
+import { use, useEffect, useState } from 'react'

 import { AUTH_ROUTES, DEFAULT_APP_LANGUAGE, SUPPORTED_APP_LANGUAGES } from '@/lib/auth/auth-constants'

@@ -37,9 +37,9 @@ type ResultLoadState =
   | { status: 'loadError' }

 type ResultPageProps = {
-  params: {
+  params: Promise<{
     id: string
-  }
+  }>
 }

 function isRecord(value: unknown): value is Record<string, unknown> {
@@ -84,7 +84,8 @@ function getInterview(value: unknown): InterviewDetail | null {
   return value.interview
 }

-export default function ResultDetailPage({ params }: ResultPageProps) {
+export default function ResultDetailPage({ params: promisedParams }: ResultPageProps) {
+  const params = use(promisedParams)
   const router = useRouter()
   const [loadState, setLoadState] = useState<ResultLoadState>({ status: 'loading' })
   const [retryAttempt, setRetryAttempt] = useState(0)
diff --git a/components/interview/InterviewerStage.tsx b/components/interview/InterviewerStage.tsx
index a87f6ce..035b753 100644
--- a/components/interview/InterviewerStage.tsx
+++ b/components/interview/InterviewerStage.tsx
@@ -7,7 +7,7 @@ export type SpeechStatus = 'preparing' | 'speaking' | 'ready' | 'unavailable'
 interface InterviewerStageProps {
   cameraOffLabel: string
   cameraOn: boolean
-  cameraRef: RefObject<HTMLVideoElement>
+  cameraRef: RefObject<HTMLVideoElement | null>
   interviewerName: string
   interviewerPhoto: string
   interviewerRole: string
diff --git a/lib/auth/get-authenticated-user.ts b/lib/auth/get-authenticated-user.ts
index 809f324..d97ab94 100644
--- a/lib/auth/get-authenticated-user.ts
+++ b/lib/auth/get-authenticated-user.ts
@@ -11,7 +11,7 @@ export type AuthenticatedUserResult =
 export async function getAuthenticatedUser(request?: { headers?: Headers }): Promise<AuthenticatedUserResult> {
   const denied: AuthenticatedUserResult = { error: null, status: 'unauthorized', user: null }
   try {
-    const supabase = createClient()
+    const supabase = await createClient()
     const authorization = request?.headers?.get('authorization')
     if (authorization !== null && authorization !== undefined && !/^Bearer [^\s]+$/i.test(authorization)) return denied
     const {
diff --git a/lib/interviews/delete-owned-interview.test.cjs b/lib/interviews/delete-owned-interview.test.cjs
index dbb9be8..f57d525 100644
--- a/lib/interviews/delete-owned-interview.test.cjs
+++ b/lib/interviews/delete-owned-interview.test.cjs
@@ -75,7 +75,7 @@ test('DELETE contract maps every result, ignores request ownership, and sets no-
     [{ owner: OWNER_B }, id, 404, { error: 'Interview not found' }], [{ thrown: true }, id, 500, { error: 'Failed to delete interview' }]]
   for (const [options, requested, status, body] of cases) {
     const h = harness(options)
-    const response = await h.DELETE({ json() { throw new Error('Must not consume body') }, url: '?owner_id=spoof' }, { params: { id: requested } })
+    const response = await h.DELETE({ json() { throw new Error('Must not consume body') }, url: '?owner_id=spoof' }, { params: Promise.resolve({ id: requested }) })
     assert.equal(response.status, status); assert.deepEqual(await response.json(), body)
     assert.equal(response.headers.get('Cache-Control'), 'private, no-store')
   }
@@ -85,7 +85,7 @@ test('unexpected route exception returns generic no-store 500', async () => {
     'next/server': { NextResponse }, '@/lib/interviews/read-owned-interview': {},
     '@/lib/interviews/delete-owned-interview': { deleteOwnedInterview() { throw new Error('Private') } },
   })
-  const response = await route.DELETE({}, { params: { id } })
+  const response = await route.DELETE({}, { params: Promise.resolve({ id }) })
   assert.equal(response.status, 500); assert.deepEqual(await response.json(), { error: 'Failed to delete interview' })
   assert.equal(response.headers.get('Cache-Control'), 'private, no-store')
 })
diff --git a/lib/interviews/interview-route-input.test.cjs b/lib/interviews/interview-route-input.test.cjs
index 30cf06e..e33f40e 100644
--- a/lib/interviews/interview-route-input.test.cjs
+++ b/lib/interviews/interview-route-input.test.cjs
@@ -32,7 +32,7 @@ function pageHarness(authenticated = true, file = 'app/interview/page.tsx') {
   const scope = { exports: {}, require(name) { assert.ok(Object.hasOwn(imports, name), name); return imports[name] } }
   vm.runInNewContext(compiled, scope)
   return { events, rendered, activities, async run(params) {
-    try { return { tree: await scope.exports.default({ searchParams: params }) } }
+    try { return { tree: await scope.exports.default({ searchParams: Promise.resolve(params) }) } }
     catch (error) { if (error.route) return { redirect: error.route }; throw error }
   } }
 }
diff --git a/lib/interviews/read-owned-interview.test.cjs b/lib/interviews/read-owned-interview.test.cjs
index a6c074b..5d0ec63 100644
--- a/lib/interviews/read-owned-interview.test.cjs
+++ b/lib/interviews/read-owned-interview.test.cjs
@@ -100,7 +100,7 @@ test('detail route preserves every status/body and adds no cache/disposition hea
     [{}, id, 200, { interview: expected }],
   ]
   for (const [options, requestedId, status, body] of cases) {
-    const response = await harness(options).GET(new Request(`https://example.test/api/interviews/${requestedId}?ownerId=owner-a`), { params: { id: requestedId } })
+    const response = await harness(options).GET(new Request(`https://example.test/api/interviews/${requestedId}?ownerId=owner-a`), { params: Promise.resolve({ id: requestedId }) })
     assert.equal(response.status, status); assert.deepEqual(await response.json(), body)
     assert.equal(response.headers.get('Cache-Control'), null)
     assert.equal(response.headers.get('Content-Disposition'), null)
diff --git a/lib/providers/security-privacy.test.cjs b/lib/providers/security-privacy.test.cjs
index 9ac3fba..b63a91d 100644
--- a/lib/providers/security-privacy.test.cjs
+++ b/lib/providers/security-privacy.test.cjs
@@ -25,9 +25,9 @@ function harness(options={}) {
     setTimeout(fn,ms){const id=++timerId;timers.set(id,{fn,ms});return id},clearTimeout(id){timers.delete(id)},
     async fetch(url,init){calls.push({url,init});return upstream(url,init)},
   }
-  const auth=load('lib/auth/get-authenticated-user.ts',{'server-only':{},'@/lib/supabase/server':{createClient:()=>({auth:{
+  const auth=load('lib/auth/get-authenticated-user.ts',{'server-only':{},'@/lib/supabase/server':{createClient:async()=>{if(options.clientThrow)throw Error(PRIVATE+SECRET);return {auth:{
     async getUser(token){authCalls.push(token);if(options.authThrow)throw Error(PRIVATE+SECRET);const id=token===undefined?cookie:(token===SECRET?bearer:null);return {data:{user:id?{id}:null},error:id?null:{message:PRIVATE+SECRET}}},
-  }})}},globals)
+  }}}}},globals)
   const boundary=load('lib/providers/provider-boundary.ts',{'server-only':{}},globals)
   const contract=load('lib/providers/claude-contract.ts',{'@/lib/interviews/interview-setup-input':setup,'@/lib/providers/provider-boundary':boundary},globals)
   const imports={'@/lib/auth/get-authenticated-user':auth,'@/lib/providers/provider-boundary':boundary,'@/lib/providers/claude-contract':contract}
@@ -64,6 +64,38 @@ test('cookie-only server callers remain supported; auth exceptions fail closed',
   const h=harness({cookie:'web'});assert.equal((await h.auth.getAuthenticatedUser()).user.id,'web')
   const bad=harness({cookie:'web',authThrow:true});const response=await bad.post();assert.equal(response.status,401);assert.equal(bad.calls.length,0);bad.privacy(await response.text())
 })
+
+test('async server-client rejection fails closed before verification or paid work',async()=>{
+  const h=harness({cookie:'web',clientThrow:true})
+  const response=await h.post()
+  assert.equal(response.status,401)
+  assert.equal(h.authCalls.length,0);assert.equal(h.calls.length,0)
+  h.privacy(await response.text())
+})
+
+test('async cookie adapter preserves reads, write options and narrow read-only handling',async()=>{
+  const existing=[{name:'session',value:'fixture'}], writes=[]
+  let adapter, failure
+  const server=load('lib/supabase/server.ts',{
+    'server-only':{},
+    'next/headers':{async cookies(){await Promise.resolve();return {
+      getAll:()=>existing,
+      set(...args){if(failure)throw failure;writes.push(args)},
+    }}},
+    '@supabase/ssr':{createServerClient(_url,_key,options){adapter=options.cookies;return {auth:{}}}},
+  },{Error,process:{env:{}}})
+  await server.createClient()
+  assert.equal(adapter.getAll(),existing)
+  const options={httpOnly:true,sameSite:'lax',path:'/'}
+  adapter.setAll([{name:'session',value:'rotated',options}])
+  assert.equal(writes.length,1)
+  assert.equal(writes[0][0],'session');assert.equal(writes[0][1],'rotated')
+  assert.equal(writes[0][2],options)
+  failure=new Error('Cookies can only be modified in a Server Action or Route Handler.')
+  assert.doesNotThrow(()=>adapter.setAll([{name:'session',value:'x',options}]))
+  failure=new Error('unrelated cookie failure')
+  assert.throws(()=>adapter.setAll([{name:'session',value:'x',options}]),/unrelated cookie failure/)
+})
 test('completion ownership derives from verified bearer, not caller ID',async()=>{
   const h=harness({bearer:'verified-owner'}), owners=[]
   const route=load('app/api/interviews/route.ts',{
diff --git a/lib/reports/interview-report.test.cjs b/lib/reports/interview-report.test.cjs
index ba91820..e3efc55 100644
--- a/lib/reports/interview-report.test.cjs
+++ b/lib/reports/interview-report.test.cjs
@@ -150,7 +150,7 @@ test('filename uses saved UTC date and rejects header-injection references', ()
 test('route returns real PDF, safe disposition, private/no-store, nosniff and Node runtime', async () => {
   const h = route({ status: 'ready', interview: fixture })
   assert.equal(h.runtime, 'nodejs'); assert.equal(h.dynamic, 'force-dynamic')
-  const response = await h.GET(request('?language=en'), { params: { id } })
+  const response = await h.GET(request('?language=en'), { params: Promise.resolve({ id }) })
   assert.equal(response.status, 200); assert.equal(response.headers.get('Content-Type'), 'application/pdf')
   assert.equal(response.headers.get('Cache-Control'), 'private, no-store')
   assert.equal(response.headers.get('X-Content-Type-Options'), 'nosniff')
@@ -164,7 +164,7 @@ test('route derives labels from persisted language and ignores all legacy langua
     const interview = { ...fixture, language, summary: fixture.summary + '\n' + sample }
     const snapshot = JSON.stringify(interview)
     const h = route({ status: 'ready', interview })
-    const response = await h.GET(request('?language=' + (language === 'en' ? 'tr' : 'en')), { params: { id } })
+    const response = await h.GET(request('?language=' + (language === 'en' ? 'tr' : 'en')), { params: Promise.resolve({ id }) })
     assert.equal(response.status, 200)
     const bytes = Buffer.from(await response.arrayBuffer())
     const { text } = inspect(bytes)
@@ -178,14 +178,14 @@ test('route derives labels from persisted language and ignores all legacy langua
   let received
   const h = route({ status: 'ready', interview: { ...fixture, language: 'en' } }, async (_, language) => { received = language; return Buffer.from('%PDF-test') })
   for (const suffix of ['', '?language=', '?language=fr', '?language=en&language=de', '?language=TR']) {
-    assert.equal((await h.GET(request(suffix), { params: { id } })).status, 200)
+    assert.equal((await h.GET(request(suffix), { params: Promise.resolve({ id }) })).status, 200)
     assert.equal(received, 'en')
   }
 })
 test('unsupported persisted language fails generically and cannot be rescued by a query', async () => {
   for (const language of ['', 'fr', 'EN']) {
     const h = route({ status: 'ready', interview: { ...fixture, language } }, () => { throw new Error('Must not render') })
-    const response = await h.GET(request('?language=en'), { params: { id } })
+    const response = await h.GET(request('?language=en'), { params: Promise.resolve({ id }) })
     assert.equal(response.status, 500)
     assert.deepEqual(await response.json(), { error: 'Failed to generate PDF' })
     assert.equal(response.headers.get('Content-Disposition'), null)
@@ -196,18 +196,18 @@ test('auth/read outcomes precede language validation; errors never expose intern
     ['notFound', 404, 'Interview not found'], ['readError', 500, 'Failed to load interview']]
   for (const [status, code, message] of cases) {
     const h = route({ status }, () => { throw new Error('Must not render') })
-    const response = await h.GET(request('?language=invalid&ownerId=spoof'), { params: { id } })
+    const response = await h.GET(request('?language=invalid&ownerId=spoof'), { params: Promise.resolve({ id }) })
     assert.equal(response.status, code); assert.deepEqual(await response.json(), { error: message })
     assert.equal(response.headers.get('Content-Disposition'), null)
     assert.equal(response.headers.get('Cache-Control'), 'private, no-store')
   }
-  const wrong = await route({ status: 'notFound' }).GET(request(''), { params: { id } })
-  const missing = await route({ status: 'notFound' }).GET(request(''), { params: { id } })
+  const wrong = await route({ status: 'notFound' }).GET(request(''), { params: Promise.resolve({ id }) })
+  const missing = await route({ status: 'notFound' }).GET(request(''), { params: Promise.resolve({ id }) })
   assert.equal(await wrong.text(), await missing.text())
 })
 test('generation/font exceptions yield generic JSON 500', async () => {
   const h = route({ status: 'ready', interview: fixture }, async () => { throw new Error('SECRET FONT PATH') })
-  const response = await h.GET(request(''), { params: { id } })
+  const response = await h.GET(request(''), { params: Promise.resolve({ id }) })
   assert.equal(response.status, 500); assert.deepEqual(await response.json(), { error: 'Failed to generate PDF' })
   assert.equal(response.headers.get('Content-Disposition'), null)
 })
diff --git a/lib/supabase/server.ts b/lib/supabase/server.ts
index 1109ec4..88a2879 100644
--- a/lib/supabase/server.ts
+++ b/lib/supabase/server.ts
@@ -3,8 +3,8 @@ import 'server-only'
 import { createServerClient } from '@supabase/ssr'
 import { cookies } from 'next/headers'

-export function createClient() {
-  const cookieStore = cookies()
+export async function createClient() {
+  const cookieStore = await cookies()

   return createServerClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
diff --git a/next-env.d.ts b/next-env.d.ts
index 4f11a03..830fb59 100644
--- a/next-env.d.ts
+++ b/next-env.d.ts
@@ -1,5 +1,6 @@
 /// <reference types="next" />
 /// <reference types="next/image-types/global" />
+/// <reference path="./.next/types/routes.d.ts" />

 // NOTE: This file should not be edited
-// see https://nextjs.org/docs/basic-features/typescript for more information.
+// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.
diff --git a/next.config.js b/next.config.js
index c549704..efed471 100644
--- a/next.config.js
+++ b/next.config.js
@@ -1,7 +1,5 @@
 module.exports = {
-  experimental: {
-    outputFileTracingIncludes: {
-      '/api/interviews/*/pdf': ['./assets/fonts/*.ttf', './styles/talentry-tokens.css'],
-    },
+  outputFileTracingIncludes: {
+    '/api/interviews/*/pdf': ['./assets/fonts/*.ttf', './styles/talentry-tokens.css'],
   },
 }
diff --git a/package-lock.json b/package-lock.json
index f0dd339..78bc5da 100644
--- a/package-lock.json
+++ b/package-lock.json
@@ -13,14 +13,14 @@
         "@supabase/ssr": "^0.12.3",
         "@supabase/supabase-js": "^2.108.2",
         "jspdf": "4.2.1",
-        "next": "^14.2.5",
-        "react": "^18",
-        "react-dom": "^18"
+        "next": "15.5.28",
+        "react": "19.3.1",
+        "react-dom": "19.3.1"
       },
       "devDependencies": {
         "@types/node": "^20",
-        "@types/react": "^18",
-        "@types/react-dom": "^18",
+        "@types/react": "19.3.0",
+        "@types/react-dom": "19.3.0",
         "typescript": "^5"
       }
     },
@@ -62,6 +62,23 @@
       "integrity": "sha512-wJ8ReQbHxsAfXhrf9ixl0aYbZorRuOWpBNzm8pL8ftmSxQx/wnJD5Eg861NwJU/czy2VXFIebCeZnZrI9rktIQ==",
       "license": "(Apache-2.0 AND BSD-3-Clause)"
     },
+    "node_modules/@emnapi/runtime": {
+      "version": "1.11.3",
+      "resolved": "https://registry.npmjs.org/@emnapi/runtime/-/runtime-1.11.3.tgz",
+      "integrity": "sha512-Xz4Tpyki7XyrpbUK1jR1AhdAdaXyhhY4lZ3neLodmhpuWfy2PAQN5B46sAiU4liOXGLkHypn/qU+jvfWSCYYLA==",
+      "license": "MIT",
+      "optional": true,
+      "dependencies": {
+        "tslib": "^2.4.0"
+      }
+    },
+    "node_modules/@emnapi/runtime/node_modules/tslib": {
+      "version": "2.8.1",
+      "resolved": "https://registry.npmjs.org/tslib/-/tslib-2.8.1.tgz",
+      "integrity": "sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w==",
+      "license": "0BSD",
+      "optional": true
+    },
     "node_modules/@exodus/schemasafe": {
       "version": "1.3.0",
       "resolved": "https://registry.npmjs.org/@exodus/schemasafe/-/schemasafe-1.3.0.tgz",
@@ -238,6 +255,555 @@
         "yargs-parser": "^11.1.1"
       }
     },
+    "node_modules/@img/colour": {
+      "version": "1.1.0",
+      "resolved": "https://registry.npmjs.org/@img/colour/-/colour-1.1.0.tgz",
+      "integrity": "sha512-Td76q7j57o/tLVdgS746cYARfSyxk8iEfRxewL9h4OMzYhbW4TAcppl0mT4eyqXddh6L/jwoM75mo7ixa/pCeQ==",
+      "license": "MIT",
+      "optional": true,
+      "engines": {
+        "node": ">=18"
+      }
+    },
+    "node_modules/@img/sharp-darwin-arm64": {
+      "version": "0.35.5",
+      "resolved": "https://registry.npmjs.org/@img/sharp-darwin-arm64/-/sharp-darwin-arm64-0.35.5.tgz",
+      "integrity": "sha512-QRUlFQ0WxvdWyqqG/WtI3iupfD5rBzmCHXSdPsY91sAtVtTo7Q4cb6zOccZ3gqEqkr0f1As1ehLqmEpDsRf+lg==",
+      "cpu": [
+        "arm64"
+      ],
+      "license": "Apache-2.0",
+      "optional": true,
+      "os": [
+        "darwin"
+      ],
+      "engines": {
+        "node": ">=20.9.0"
+      },
+      "funding": {
+        "url": "https://opencollective.com/libvips"
+      },
+      "optionalDependencies": {
+        "@img/sharp-libvips-darwin-arm64": "1.3.4"
+      }
+    },
+    "node_modules/@img/sharp-darwin-x64": {
+      "version": "0.35.5",
+      "resolved": "https://registry.npmjs.org/@img/sharp-darwin-x64/-/sharp-darwin-x64-0.35.5.tgz",
+      "integrity": "sha512-+BR255RhDlpygUpOc/Jdt1nT6DQ3XG/ERo5wbcdOf5Q320dKtPCKPLR1LJs9VGXRaMa8l1uUa0tkCNOXiAxZUw==",
+      "cpu": [
+        "x64"
+      ],
+      "license": "Apache-2.0",
+      "optional": true,
+      "os": [
+        "darwin"
+      ],
+      "engines": {
+        "node": ">=20.9.0"
+      },
+      "funding": {
+        "url": "https://opencollective.com/libvips"
+      },
+      "optionalDependencies": {
+        "@img/sharp-libvips-darwin-x64": "1.3.4"
+      }
+    },
+    "node_modules/@img/sharp-freebsd-wasm32": {
+      "version": "0.35.5",
+      "resolved": "https://registry.npmjs.org/@img/sharp-freebsd-wasm32/-/sharp-freebsd-wasm32-0.35.5.tgz",
+      "integrity": "sha512-Y/z91nEZ4uIBX5X3nfTovjU9lHNKFYbL2lpHCLVNmXQK03VIZvXBBt0KxbPGp2SdGSF+2mQU4e+hQaWOt86iAw==",
+      "license": "Apache-2.0",
+      "optional": true,
+      "os": [
+        "freebsd"
+      ],
+      "dependencies": {
+        "@img/sharp-wasm32": "0.35.5"
+      },
+      "engines": {
+        "node": ">=20.9.0"
+      },
+      "funding": {
+        "url": "https://opencollective.com/libvips"
+      }
+    },
+    "node_modules/@img/sharp-libvips-darwin-arm64": {
+      "version": "1.3.4",
+      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-darwin-arm64/-/sharp-libvips-darwin-arm64-1.3.4.tgz",
+      "integrity": "sha512-5R89nBYiRdUlSWJxPhO+GVtaXzXSxKnRu/xqMn3KTA3L9EB9Oy/P+Nn2f2vlhPuUdy/Zusb2DarbyTpGCfEDuw==",
+      "cpu": [
+        "arm64"
+      ],
+      "license": "LGPL-3.0-or-later",
+      "optional": true,
+      "os": [
+        "darwin"
+      ],
+      "funding": {
+        "url": "https://opencollective.com/libvips"
+      }
+    },
+    "node_modules/@img/sharp-libvips-darwin-x64": {
+      "version": "1.3.4",
+      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-darwin-x64/-/sharp-libvips-darwin-x64-1.3.4.tgz",
+      "integrity": "sha512-iR2OKH80yi0U+dUplyh3/xdpFvps6YkCwsXenIJxqxR1v9o+xtKTGbS9H7cps+2Vxjc8B1j96p75NmTGjIhtpQ==",
+      "cpu": [
+        "x64"
+      ],
+      "license": "LGPL-3.0-or-later",
+      "optional": true,
+      "os": [
+        "darwin"
+      ],
+      "funding": {
+        "url": "https://opencollective.com/libvips"
+      }
+    },
+    "node_modules/@img/sharp-libvips-linux-arm": {
+      "version": "1.3.4",
+      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-linux-arm/-/sharp-libvips-linux-arm-1.3.4.tgz",
+      "integrity": "sha512-LmRtTsOHuvM2+wlO2Db37dx5MiZhB0FvSunciw48YjdOkZz9KAiRbm8ujeMOA1INqmei5NapFxYEK1D1ZSidmw==",
+      "cpu": [
+        "arm"
+      ],
+      "libc": [
+        "glibc"
+      ],
+      "license": "LGPL-3.0-or-later",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "funding": {
+        "url": "https://opencollective.com/libvips"
+      }
+    },
+    "node_modules/@img/sharp-libvips-linux-arm64": {
+      "version": "1.3.4",
+      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-linux-arm64/-/sharp-libvips-linux-arm64-1.3.4.tgz",
+      "integrity": "sha512-Y3dgX/6lE2QhQb+Gxy0WZxfg9MEm/JBjamZpS2IklP7xIQoKN4hzAm7KcMVGtaVDt3neE9OKBC7vAfonA/Lr1A==",
+      "cpu": [
+        "arm64"
+      ],
+      "libc": [
+        "glibc"
+      ],
+      "license": "LGPL-3.0-or-later",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "funding": {
+        "url": "https://opencollective.com/libvips"
+      }
+    },
+    "node_modules/@img/sharp-libvips-linux-ppc64": {
+      "version": "1.3.4",
+      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-linux-ppc64/-/sharp-libvips-linux-ppc64-1.3.4.tgz",
+      "integrity": "sha512-Le6boB8Tai0Nis+gIxIpKx68UDVVIqdR8Tin5Yf1z2LJJQLDJvCDRqRu+jC2qCoD+eIomonmOwB4smBRxfVpYQ==",
+      "cpu": [
+        "ppc64"
+      ],
+      "libc": [
+        "glibc"
+      ],
+      "license": "LGPL-3.0-or-later",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "funding": {
+        "url": "https://opencollective.com/libvips"
+      }
+    },
+    "node_modules/@img/sharp-libvips-linux-riscv64": {
+      "version": "1.3.4",
+      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-linux-riscv64/-/sharp-libvips-linux-riscv64-1.3.4.tgz",
+      "integrity": "sha512-aHkkIEHPRdQEegJN20MLmGtxYD9R2wQr3Cwpddnu5+YKMt6Uzax7S9h5gpZTo8wyrGuZSlfQ63OevL5mTyOC7Q==",
+      "cpu": [
+        "riscv64"
+      ],
+      "libc": [
+        "glibc"
+      ],
+      "license": "LGPL-3.0-or-later",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "funding": {
+        "url": "https://opencollective.com/libvips"
+      }
+    },
+    "node_modules/@img/sharp-libvips-linux-s390x": {
+      "version": "1.3.4",
+      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-linux-s390x/-/sharp-libvips-linux-s390x-1.3.4.tgz",
+      "integrity": "sha512-ra/mB6MikESDUO7Yg+Mi95bFBb9GsObURuhnOv3OqknjGe9sZrG8tCe9q0xSIGrtLgvgw0gKnFWcK4blSgQOuQ==",
+      "cpu": [
+        "s390x"
+      ],
+      "libc": [
+        "glibc"
+      ],
+      "license": "LGPL-3.0-or-later",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "funding": {
+        "url": "https://opencollective.com/libvips"
+      }
+    },
+    "node_modules/@img/sharp-libvips-linux-x64": {
+      "version": "1.3.4",
+      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-linux-x64/-/sharp-libvips-linux-x64-1.3.4.tgz",
+      "integrity": "sha512-GJ//SSXbnwSDes02umB3nDJLFcQzw8a18V8fyhqr6tV515tOEMdImjjxj1AoafMRz56F3PHgftnj1QEKSU1zkw==",
+      "cpu": [
+        "x64"
+      ],
+      "libc": [
+        "glibc"
+      ],
+      "license": "LGPL-3.0-or-later",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "funding": {
+        "url": "https://opencollective.com/libvips"
+      }
+    },
+    "node_modules/@img/sharp-libvips-linuxmusl-arm64": {
+      "version": "1.3.4",
+      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-linuxmusl-arm64/-/sharp-libvips-linuxmusl-arm64-1.3.4.tgz",
+      "integrity": "sha512-hvulFwtjUcagsis6BBxHwGFwWoNZjgYmULGVrZcyfNbjA8hKILbRxGg15/7w5HDyXHXUos/j6baAWqnCyQ2DWA==",
+      "cpu": [
+        "arm64"
+      ],
+      "libc": [
+        "musl"
+      ],
+      "license": "LGPL-3.0-or-later",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "funding": {
+        "url": "https://opencollective.com/libvips"
+      }
+    },
+    "node_modules/@img/sharp-libvips-linuxmusl-x64": {
+      "version": "1.3.4",
+      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-linuxmusl-x64/-/sharp-libvips-linuxmusl-x64-1.3.4.tgz",
+      "integrity": "sha512-6zXKeE/p39I1AmA3cJG35eyBGNqNddLnUXjhwBnsGjFPWqf5VKkDBEqaEkPDoTEtkxwi2vv8Tcr2mDyP4So7Fg==",
+      "cpu": [
+        "x64"
+      ],
+      "libc": [
+        "musl"
+      ],
+      "license": "LGPL-3.0-or-later",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "funding": {
+        "url": "https://opencollective.com/libvips"
+      }
+    },
+    "node_modules/@img/sharp-linux-arm": {
+      "version": "0.35.5",
+      "resolved": "https://registry.npmjs.org/@img/sharp-linux-arm/-/sharp-linux-arm-0.35.5.tgz",
+      "integrity": "sha512-LEaXK2WdXVK5ykcw0buWyPMsmLLL2vpHLD6yrNSW+JGEL3BZPA4tpKN6iaMc4AxTTAoaX/sU1rOL51lcIz48ZQ==",
+      "cpu": [
+        "arm"
+      ],
+      "libc": [
+        "glibc"
+      ],
+      "license": "Apache-2.0",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "engines": {
+        "node": ">=20.9.0"
+      },
+      "funding": {
+        "url": "https://opencollective.com/libvips"
+      },
+      "optionalDependencies": {
+        "@img/sharp-libvips-linux-arm": "1.3.4"
+      }
+    },
+    "node_modules/@img/sharp-linux-arm64": {
+      "version": "0.35.5",
+      "resolved": "https://registry.npmjs.org/@img/sharp-linux-arm64/-/sharp-linux-arm64-0.35.5.tgz",
+      "integrity": "sha512-LYVx5JTsOM2CBzmxreh+nl64/3H6Xb09iSLknqH47z2T2DFFxDeFLP5y4dJwe6H7uGQlHPyEEtIqyo3DYsRwdQ==",
+      "cpu": [
+        "arm64"
+      ],
+      "libc": [
+        "glibc"
+      ],
+      "license": "Apache-2.0",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "engines": {
+        "node": ">=20.9.0"
+      },
+      "funding": {
+        "url": "https://opencollective.com/libvips"
+      },
+      "optionalDependencies": {
+        "@img/sharp-libvips-linux-arm64": "1.3.4"
+      }
+    },
+    "node_modules/@img/sharp-linux-ppc64": {
+      "version": "0.35.5",
+      "resolved": "https://registry.npmjs.org/@img/sharp-linux-ppc64/-/sharp-linux-ppc64-0.35.5.tgz",
+      "integrity": "sha512-QVxAAq8evVRI9ia2vqgwrmWucn5Dfv+JdWzj75pD8omHLPSP7f8p20O8jxzjCcuCEQEOtYOZUmX1hkiZ0kdevA==",
+      "cpu": [
+        "ppc64"
+      ],
+      "libc": [
+        "glibc"
+      ],
+      "license": "Apache-2.0",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "engines": {
+        "node": ">=20.9.0"
+      },
+      "funding": {
+        "url": "https://opencollective.com/libvips"
+      },
+      "optionalDependencies": {
+        "@img/sharp-libvips-linux-ppc64": "1.3.4"
+      }
+    },
+    "node_modules/@img/sharp-linux-riscv64": {
+      "version": "0.35.5",
+      "resolved": "https://registry.npmjs.org/@img/sharp-linux-riscv64/-/sharp-linux-riscv64-0.35.5.tgz",
+      "integrity": "sha512-LtdreXguaavKODPIfzJ4kffx7UNt1omwtK0rch4EBbbSTXPnxWmYSayXdLJw0fJzQ97kHt1gL/yh4tvU+nCyRQ==",
+      "cpu": [
+        "riscv64"
+      ],
+      "libc": [
+        "glibc"
+      ],
+      "license": "Apache-2.0",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "engines": {
+        "node": ">=20.9.0"
+      },
+      "funding": {
+        "url": "https://opencollective.com/libvips"
+      },
+      "optionalDependencies": {
+        "@img/sharp-libvips-linux-riscv64": "1.3.4"
+      }
+    },
+    "node_modules/@img/sharp-linux-s390x": {
+      "version": "0.35.5",
+      "resolved": "https://registry.npmjs.org/@img/sharp-linux-s390x/-/sharp-linux-s390x-0.35.5.tgz",
+      "integrity": "sha512-UZasTOFiYzotTsGOCu42BfUzP6Tu6Do/947iRm1RsLKvlllxwGcn4RN27LibGWceix4Y+Pmw3jsnTcCQIgWjqA==",
+      "cpu": [
+        "s390x"
+      ],
+      "libc": [
+        "glibc"
+      ],
+      "license": "Apache-2.0",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "engines": {
+        "node": ">=20.9.0"
+      },
+      "funding": {
+        "url": "https://opencollective.com/libvips"
+      },
+      "optionalDependencies": {
+        "@img/sharp-libvips-linux-s390x": "1.3.4"
+      }
+    },
+    "node_modules/@img/sharp-linux-x64": {
+      "version": "0.35.5",
+      "resolved": "https://registry.npmjs.org/@img/sharp-linux-x64/-/sharp-linux-x64-0.35.5.tgz",
+      "integrity": "sha512-SxFtLTeJInhAA9Q836kux2vZNeOBQEx658qvbboZScr0wIARym3IcGmW7KpVD5sbVg0Ojy+udFQdayYIZyoNog==",
+      "cpu": [
+        "x64"
+      ],
+      "libc": [
+        "glibc"
+      ],
+      "license": "Apache-2.0",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "engines": {
+        "node": ">=20.9.0"
+      },
+      "funding": {
+        "url": "https://opencollective.com/libvips"
+      },
+      "optionalDependencies": {
+        "@img/sharp-libvips-linux-x64": "1.3.4"
+      }
+    },
+    "node_modules/@img/sharp-linuxmusl-arm64": {
+      "version": "0.35.5",
+      "resolved": "https://registry.npmjs.org/@img/sharp-linuxmusl-arm64/-/sharp-linuxmusl-arm64-0.35.5.tgz",
+      "integrity": "sha512-9HbMclmI1zlNkFRs3z9/eBtDjfD0sGlrX1z6b1qwmiFY5ElDLh4BC0LPBdVp7z1DXFiKlIcznf+ZlsuZzLxQqg==",
+      "cpu": [
+        "arm64"
+      ],
+      "libc": [
+        "musl"
+      ],
+      "license": "Apache-2.0",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "engines": {
+        "node": ">=20.9.0"
+      },
+      "funding": {
+        "url": "https://opencollective.com/libvips"
+      },
+      "optionalDependencies": {
+        "@img/sharp-libvips-linuxmusl-arm64": "1.3.4"
+      }
+    },
+    "node_modules/@img/sharp-linuxmusl-x64": {
+      "version": "0.35.5",
+      "resolved": "https://registry.npmjs.org/@img/sharp-linuxmusl-x64/-/sharp-linuxmusl-x64-0.35.5.tgz",
+      "integrity": "sha512-4KOphqB035HrVdqLZfCgMzzERrQkkzOwRhl4OAkRO1YCldbaFjySXMaK534Mo0V+LndnlJk+sbUyLeU0ULyD1A==",
+      "cpu": [
+        "x64"
+      ],
+      "libc": [
+        "musl"
+      ],
+      "license": "Apache-2.0",
+      "optional": true,
+      "os": [
+        "linux"
+      ],
+      "engines": {
+        "node": ">=20.9.0"
+      },
+      "funding": {
+        "url": "https://opencollective.com/libvips"
+      },
+      "optionalDependencies": {
+        "@img/sharp-libvips-linuxmusl-x64": "1.3.4"
+      }
+    },
+    "node_modules/@img/sharp-wasm32": {
+      "version": "0.35.5",
+      "resolved": "https://registry.npmjs.org/@img/sharp-wasm32/-/sharp-wasm32-0.35.5.tgz",
+      "integrity": "sha512-Ptsga1su4tQx+LLF1ECS9U6nz5kmrXKo6XVbtR48Ke3ZRxxgaWBu7IDtEe1quo8hiupwm6WFqxVlXaSf7IINGQ==",
+      "license": "Apache-2.0 AND LGPL-3.0-or-later AND MIT",
+      "optional": true,
+      "dependencies": {
+        "@emnapi/runtime": "^1.11.3"
+      },
+      "engines": {
+        "node": ">=20.9.0"
+      },
+      "funding": {
+        "url": "https://opencollective.com/libvips"
+      }
+    },
+    "node_modules/@img/sharp-webcontainers-wasm32": {
+      "version": "0.35.5",
+      "resolved": "https://registry.npmjs.org/@img/sharp-webcontainers-wasm32/-/sharp-webcontainers-wasm32-0.35.5.tgz",
+      "integrity": "sha512-hfhF/FmoQyTUkA0bIKFOtw536BQSeBMe6BF6QyWlrPxT754+TFLaZ7sKKTfvvM0yJgKgaYTwnFCIZ/GuDw5SUA==",
+      "cpu": [
+        "wasm32"
+      ],
+      "license": "Apache-2.0",
+      "optional": true,
+      "dependencies": {
+        "@img/sharp-wasm32": "0.35.5"
+      },
+      "engines": {
+        "node": ">=20.9.0"
+      },
+      "funding": {
+        "url": "https://opencollective.com/libvips"
+      }
+    },
+    "node_modules/@img/sharp-win32-arm64": {
+      "version": "0.35.5",
+      "resolved": "https://registry.npmjs.org/@img/sharp-win32-arm64/-/sharp-win32-arm64-0.35.5.tgz",
+      "integrity": "sha512-X4t7g+7ZA5DKblCBEXGjUqqemj4vczING/5viFwAL8h4N3qYeyjwdCvRLHi4EdOUI+2Z7UFlp1VM+p/AuEtm6Q==",
+      "cpu": [
+        "arm64"
+      ],
+      "license": "Apache-2.0 AND LGPL-3.0-or-later",
+      "optional": true,
+      "os": [
+        "win32"
+      ],
+      "engines": {
+        "node": ">=20.9.0"
+      },
+      "funding": {
+        "url": "https://opencollective.com/libvips"
+      }
+    },
+    "node_modules/@img/sharp-win32-ia32": {
+      "version": "0.35.5",
+      "resolved": "https://registry.npmjs.org/@img/sharp-win32-ia32/-/sharp-win32-ia32-0.35.5.tgz",
+      "integrity": "sha512-5Zm82LoBc43nhwNybZlG7Y1KO//Zhsn306fQl29ZOuStHLGTo3BWL83q3cznX0poxSAMuYL1On/BHBxkBeKr6A==",
+      "cpu": [
+        "ia32"
+      ],
+      "license": "Apache-2.0 AND LGPL-3.0-or-later",
+      "optional": true,
+      "os": [
+        "win32"
+      ],
+      "engines": {
+        "node": "^20.9.0"
+      },
+      "funding": {
+        "url": "https://opencollective.com/libvips"
+      }
+    },
+    "node_modules/@img/sharp-win32-x64": {
+      "version": "0.35.5",
+      "resolved": "https://registry.npmjs.org/@img/sharp-win32-x64/-/sharp-win32-x64-0.35.5.tgz",
+      "integrity": "sha512-x76eH0vEiHlcMQu8Y8IenntaACtddpT6W0wmXtWrnKcnKI7ME5DdgqhAD6SEWOEl1v2zDvkZDhFA9KnURwpfqg==",
+      "cpu": [
+        "x64"
+      ],
+      "license": "Apache-2.0 AND LGPL-3.0-or-later",
+      "optional": true,
+      "os": [
+        "win32"
+      ],
+      "engines": {
+        "node": ">=20.9.0"
+      },
+      "funding": {
+        "url": "https://opencollective.com/libvips"
+      }
+    },
     "node_modules/@livekit/mutex": {
       "version": "1.1.1",
       "resolved": "https://registry.npmjs.org/@livekit/mutex/-/mutex-1.1.1.tgz",
@@ -254,15 +820,15 @@
       }
     },
     "node_modules/@next/env": {
-      "version": "14.2.5",
-      "resolved": "https://registry.npmjs.org/@next/env/-/env-14.2.5.tgz",
-      "integrity": "sha512-/zZGkrTOsraVfYjGP8uM0p6r0BDT6xWpkjdVbcz66PJVSpwXX3yNiRycxAuDfBKGWBrZBXRuK/YVlkNgxHGwmA==",
+      "version": "15.5.28",
+      "resolved": "https://registry.npmjs.org/@next/env/-/env-15.5.28.tgz",
+      "integrity": "sha512-xxW5EBI8fMPuVTPBW7LL980IRbuDXlbkUAwp9DDhtb4Lnich3nJ13uYpvrX4VE74hWPf6AvHHAMmGCidcHjbfg==",
       "license": "MIT"
     },
     "node_modules/@next/swc-darwin-arm64": {
-      "version": "14.2.5",
-      "resolved": "https://registry.npmjs.org/@next/swc-darwin-arm64/-/swc-darwin-arm64-14.2.5.tgz",
-      "integrity": "sha512-/9zVxJ+K9lrzSGli1///ujyRfon/ZneeZ+v4ptpiPoOU+GKZnm8Wj8ELWU1Pm7GHltYRBklmXMTUqM/DqQ99FQ==",
+      "version": "15.5.28",
+      "resolved": "https://registry.npmjs.org/@next/swc-darwin-arm64/-/swc-darwin-arm64-15.5.28.tgz",
+      "integrity": "sha512-dPoQYXcfSIqx5o+TOXVXO7kONK5qbtNRDeiTfII0bT3puGIT6VF5e0QwmxNZfEZ5Zety5f3m9P/p4xqwfiLlPg==",
       "cpu": [
         "arm64"
       ],
@@ -276,9 +842,9 @@
       }
     },
     "node_modules/@next/swc-darwin-x64": {
-      "version": "14.2.5",
-      "resolved": "https://registry.npmjs.org/@next/swc-darwin-x64/-/swc-darwin-x64-14.2.5.tgz",
-      "integrity": "sha512-vXHOPCwfDe9qLDuq7U1OYM2wUY+KQ4Ex6ozwsKxp26BlJ6XXbHleOUldenM67JRyBfVjv371oneEvYd3H2gNSA==",
+      "version": "15.5.28",
+      "resolved": "https://registry.npmjs.org/@next/swc-darwin-x64/-/swc-darwin-x64-15.5.28.tgz",
+      "integrity": "sha512-RgCJ7buBivTH+6sddqaVm+/v8kwMHlFkobvdt3DfETutws5HrxnToMIWSN9X3MZ3aAi7BbKrGZZWUDQLEycXqw==",
       "cpu": [
         "x64"
       ],
@@ -292,9 +858,9 @@
       }
     },
     "node_modules/@next/swc-linux-arm64-gnu": {
-      "version": "14.2.5",
-      "resolved": "https://registry.npmjs.org/@next/swc-linux-arm64-gnu/-/swc-linux-arm64-gnu-14.2.5.tgz",
-      "integrity": "sha512-vlhB8wI+lj8q1ExFW8lbWutA4M2ZazQNvMWuEDqZcuJJc78iUnLdPPunBPX8rC4IgT6lIx/adB+Cwrl99MzNaA==",
+      "version": "15.5.28",
+      "resolved": "https://registry.npmjs.org/@next/swc-linux-arm64-gnu/-/swc-linux-arm64-gnu-15.5.28.tgz",
+      "integrity": "sha512-OHXQe13olE59aKe++zHavGcJPh5SLHXi6Anret3BBeq1+qhSuOJDNAli/EDDfxs6UTqA4Qddo4uyYry2slyjiQ==",
       "cpu": [
         "arm64"
       ],
@@ -311,9 +877,9 @@
       }
     },
     "node_modules/@next/swc-linux-arm64-musl": {
-      "version": "14.2.5",
-      "resolved": "https://registry.npmjs.org/@next/swc-linux-arm64-musl/-/swc-linux-arm64-musl-14.2.5.tgz",
-      "integrity": "sha512-NpDB9NUR2t0hXzJJwQSGu1IAOYybsfeB+LxpGsXrRIb7QOrYmidJz3shzY8cM6+rO4Aojuef0N/PEaX18pi9OA==",
+      "version": "15.5.28",
+      "resolved": "https://registry.npmjs.org/@next/swc-linux-arm64-musl/-/swc-linux-arm64-musl-15.5.28.tgz",
+      "integrity": "sha512-nTB7bB6vfn4ezCJNYP43ukt2o8L3+WxKF/sTcTxepdXsJh3SM9RhlU7wrZYbH7L4HO5M87dqDTwm8587vAkCiw==",
       "cpu": [
         "arm64"
       ],
@@ -330,9 +896,9 @@
       }
     },
     "node_modules/@next/swc-linux-x64-gnu": {
-      "version": "14.2.5",
-      "resolved": "https://registry.npmjs.org/@next/swc-linux-x64-gnu/-/swc-linux-x64-gnu-14.2.5.tgz",
-      "integrity": "sha512-8XFikMSxWleYNryWIjiCX+gU201YS+erTUidKdyOVYi5qUQo/gRxv/3N1oZFCgqpesN6FPeqGM72Zve+nReVXQ==",
+      "version": "15.5.28",
+      "resolved": "https://registry.npmjs.org/@next/swc-linux-x64-gnu/-/swc-linux-x64-gnu-15.5.28.tgz",
+      "integrity": "sha512-WXCfVI32rW3xCusoUX1RpZKtyChWU2Zwe27JUDmM3KrXwcDNc9vV4zEq0GKFAURnuQ/Ouo/XqPvB0yh445XZCg==",
       "cpu": [
         "x64"
       ],
@@ -349,9 +915,9 @@
       }
     },
     "node_modules/@next/swc-linux-x64-musl": {
-      "version": "14.2.5",
-      "resolved": "https://registry.npmjs.org/@next/swc-linux-x64-musl/-/swc-linux-x64-musl-14.2.5.tgz",
-      "integrity": "sha512-6QLwi7RaYiQDcRDSU/os40r5o06b5ue7Jsk5JgdRBGGp8l37RZEh9JsLSM8QF0YDsgcosSeHjglgqi25+m04IQ==",
+      "version": "15.5.28",
+      "resolved": "https://registry.npmjs.org/@next/swc-linux-x64-musl/-/swc-linux-x64-musl-15.5.28.tgz",
+      "integrity": "sha512-Miq+NDb/HWsXuxseYxMM6fuEOQXgTziarkKIRpVKCn8W69cEfhQaQr+90pO+u4q2CbJR2wzXmUuCFyZaJs/Nng==",
       "cpu": [
         "x64"
       ],
@@ -368,9 +934,9 @@
       }
     },
     "node_modules/@next/swc-win32-arm64-msvc": {
-      "version": "14.2.5",
-      "resolved": "https://registry.npmjs.org/@next/swc-win32-arm64-msvc/-/swc-win32-arm64-msvc-14.2.5.tgz",
-      "integrity": "sha512-1GpG2VhbspO+aYoMOQPQiqc/tG3LzmsdBH0LhnDS3JrtDx2QmzXe0B6mSZZiN3Bq7IOMXxv1nlsjzoS1+9mzZw==",
+      "version": "15.5.28",
+      "resolved": "https://registry.npmjs.org/@next/swc-win32-arm64-msvc/-/swc-win32-arm64-msvc-15.5.28.tgz",
+      "integrity": "sha512-5LR79lemgDlgxvG7MQJ+zHCkVcrUoQuO7CiIvq3I58vNW4goSOE2b+19Z6FujRWMouvni4gvudYFuFuNxolGWA==",
       "cpu": [
         "arm64"
       ],
@@ -383,26 +949,10 @@
         "node": ">= 10"
       }
     },
-    "node_modules/@next/swc-win32-ia32-msvc": {
-      "version": "14.2.5",
-      "resolved": "https://registry.npmjs.org/@next/swc-win32-ia32-msvc/-/swc-win32-ia32-msvc-14.2.5.tgz",
-      "integrity": "sha512-Igh9ZlxwvCDsu6438FXlQTHlRno4gFpJzqPjSIBZooD22tKeI4fE/YMRoHVJHmrQ2P5YL1DoZ0qaOKkbeFWeMg==",
-      "cpu": [
-        "ia32"
-      ],
-      "license": "MIT",
-      "optional": true,
-      "os": [
-        "win32"
-      ],
-      "engines": {
-        "node": ">= 10"
-      }
-    },
     "node_modules/@next/swc-win32-x64-msvc": {
-      "version": "14.2.5",
-      "resolved": "https://registry.npmjs.org/@next/swc-win32-x64-msvc/-/swc-win32-x64-msvc-14.2.5.tgz",
-      "integrity": "sha512-tEQ7oinq1/CjSG9uSTerca3v4AZ+dFa+4Yu6ihaG8Ud8ddqLQgFGcnwYls13H5X5CPDPZJdYxyeMui6muOLd4g==",
+      "version": "15.5.28",
+      "resolved": "https://registry.npmjs.org/@next/swc-win32-x64-msvc/-/swc-win32-x64-msvc-15.5.28.tgz",
+      "integrity": "sha512-GNipvXUYROSTf4PXEyH95FrWImIB5zdaK6uEOg0RP1/X2drnvoMwiBkJ0VWdzX7w3iiBm3y5g2TxkKDGVTOQcg==",
       "cpu": [
         "x64"
       ],
@@ -541,20 +1091,13 @@
         "node": ">=22.0.0"
       }
     },
-    "node_modules/@swc/counter": {
-      "version": "0.1.3",
-      "resolved": "https://registry.npmjs.org/@swc/counter/-/counter-0.1.3.tgz",
-      "integrity": "sha512-e2BR4lsJkkRlKZ/qCHPw9ZaSxc0MVUd7gtbtaB7aMvHeJVYe8sOB8DBZkP2DtISHGSku9sCK6T6cnY0CtXrOCQ==",
-      "license": "Apache-2.0"
-    },
     "node_modules/@swc/helpers": {
-      "version": "0.5.5",
-      "resolved": "https://registry.npmjs.org/@swc/helpers/-/helpers-0.5.5.tgz",
-      "integrity": "sha512-KGYxvIOXcceOAbEk4bi/dVLEK9z8sZ0uBB3Il5b1rhfClSpcX0yfRO0KmTkqR2cnQDymwLB+25ZyMzICg/cm/A==",
+      "version": "0.5.15",
+      "resolved": "https://registry.npmjs.org/@swc/helpers/-/helpers-0.5.15.tgz",
+      "integrity": "sha512-JQ5TuMi45Owi4/BIMAJBoSQoOJu12oOk/gADqlcUL9JEdHB8vyjUSsxqeNXnmXHjYKMi2WcYtezGEEhqUI/E2g==",
       "license": "Apache-2.0",
       "dependencies": {
-        "@swc/counter": "^0.1.3",
-        "tslib": "^2.4.0"
+        "tslib": "^2.8.0"
       }
     },
     "node_modules/@swc/helpers/node_modules/tslib": {
@@ -603,13 +1146,6 @@
       "integrity": "sha512-VWDCbrLeVXJM9fihYodcLiIv0ku+AlOa/TQ1SvYOaBuyrSKgEcro95LJyIsJ4vSo6BXIxOKxiJAat04CmST9Fw==",
       "license": "MIT"
     },
-    "node_modules/@types/prop-types": {
-      "version": "15.7.15",
-      "resolved": "https://registry.npmjs.org/@types/prop-types/-/prop-types-15.7.15.tgz",
-      "integrity": "sha512-F6bEyamV9jKGAFBEmlQnesRPGOQqS2+Uwi0Em15xenOxHaf2hv6L8YCVn3rPdPJOiJfPiCnLIRyvwVaqMY3MIw==",
-      "dev": true,
-      "license": "MIT"
-    },
     "node_modules/@types/raf": {
       "version": "3.4.3",
       "resolved": "https://registry.npmjs.org/@types/raf/-/raf-3.4.3.tgz",
@@ -618,24 +1154,23 @@
       "optional": true
     },
     "node_modules/@types/react": {
-      "version": "18.3.31",
-      "resolved": "https://registry.npmjs.org/@types/react/-/react-18.3.31.tgz",
-      "integrity": "sha512-vfEqpXTvwT91yhmwdfouStN2hSKwTvyRs8qpLfADyrq/kxDw0hZM7Wk9Ug1FELj8hIby+S/+kQCSRFF32nv2Qw==",
+      "version": "19.3.0",
+      "resolved": "https://registry.npmjs.org/@types/react/-/react-19.3.0.tgz",
+      "integrity": "sha512-N0rFCuH9YoxG9/m61l9MfpJKfmLOVU0em7ipIz6TRgSSkvReLB9vL85GB+yr8Bs5leqpvg96JSwF4ZS1s4viQg==",
       "dev": true,
       "license": "MIT",
       "dependencies": {
-        "@types/prop-types": "*",
         "csstype": "^3.2.2"
       }
     },
     "node_modules/@types/react-dom": {
-      "version": "18.3.7",
-      "resolved": "https://registry.npmjs.org/@types/react-dom/-/react-dom-18.3.7.tgz",
-      "integrity": "sha512-MEe3UeoENYVFXzoXEWsvcpg6ZvlrFNlOQ7EOsvhI3CfAXwzPfO8Qwuxd40nepsYKqyyVQnTdEfv68q91yLcKrQ==",
+      "version": "19.3.0",
+      "resolved": "https://registry.npmjs.org/@types/react-dom/-/react-dom-19.3.0.tgz",
+      "integrity": "sha512-ZI7bU42mZXXKHn/qNLEw2IrbiINU7X5+vfgdixBHkCNpYWXjKgfQ/P+uyGb5CjOLB9UcnTeg3rylQtV2hym44Q==",
       "dev": true,
       "license": "MIT",
       "peerDependencies": {
-        "@types/react": "^18.0.0"
+        "@types/react": "^19.3.0"
       }
     },
     "node_modules/@types/request": {
@@ -788,17 +1323,6 @@
         "ajv": "4.11.8 - 6"
       }
     },
-    "node_modules/busboy": {
-      "version": "1.6.0",
-      "resolved": "https://registry.npmjs.org/busboy/-/busboy-1.6.0.tgz",
-      "integrity": "sha512-8SFQbg/0hQ9xy3UNTB0YEnsNBbWfhf7RtnzpL7TkBiTBRfrQ9Fxcnz7VJsleJpyp6rVLvXiuORqjlHi5q+PYuA==",
-      "dependencies": {
-        "streamsearch": "^1.1.0"
-      },
-      "engines": {
-        "node": ">=10.16.0"
-      }
-    },
     "node_modules/call-bind-apply-helpers": {
       "version": "1.0.2",
       "resolved": "https://registry.npmjs.org/call-bind-apply-helpers/-/call-bind-apply-helpers-1.0.2.tgz",
@@ -1109,6 +1633,16 @@
         "node": ">=0.4.0"
       }
     },
+    "node_modules/detect-libc": {
+      "version": "2.1.2",
+      "resolved": "https://registry.npmjs.org/detect-libc/-/detect-libc-2.1.2.tgz",
+      "integrity": "sha512-Btj2BOOO83o3WyH59e8MgXsxEQVcarkUOpEYrubB0urwnN10yQ364rsiByU11nZlqWYZm05i/of7io4mzihBtQ==",
+      "license": "Apache-2.0",
+      "optional": true,
+      "engines": {
+        "node": ">=8"
+      }
+    },
     "node_modules/dompurify": {
       "version": "3.4.16",
       "resolved": "https://registry.npmjs.org/dompurify/-/dompurify-3.4.16.tgz",
@@ -1443,12 +1977,6 @@
         "url": "https://github.com/sponsors/ljharb"
       }
     },
-    "node_modules/graceful-fs": {
-      "version": "4.2.11",
-      "resolved": "https://registry.npmjs.org/graceful-fs/-/graceful-fs-4.2.11.tgz",
-      "integrity": "sha512-RbJ5/jmFcNNCcDV5o9eTnBLJ/HszWV0P73bc+Ff4nS/rJj+YaS6IGyiOL0VoBYX+l1Wrl3k63h/KrH+nhJ0XvQ==",
-      "license": "ISC"
-    },
     "node_modules/grapheme-splitter": {
       "version": "1.0.4",
       "resolved": "https://registry.npmjs.org/grapheme-splitter/-/grapheme-splitter-1.0.4.tgz",
@@ -1850,18 +2378,6 @@
         "url": "https://tidelift.com/funding/github/npm/loglevel"
       }
     },
-    "node_modules/loose-envify": {
-      "version": "1.4.0",
-      "resolved": "https://registry.npmjs.org/loose-envify/-/loose-envify-1.4.0.tgz",
-      "integrity": "sha512-lyuxPGr/Wfhrlem2CL/UcnUc1zcqKAImBDzukY7Y5F/yQiNdko6+fRLevlw1HgMySw7f611UIY408EtxRSoK3Q==",
-      "license": "MIT",
-      "dependencies": {
-        "js-tokens": "^3.0.0 || ^4.0.0"
-      },
-      "bin": {
-        "loose-envify": "cli.js"
-      }
-    },
     "node_modules/map-age-cleaner": {
       "version": "0.1.3",
       "resolved": "https://registry.npmjs.org/map-age-cleaner/-/map-age-cleaner-0.1.3.tgz",
@@ -1961,42 +2477,40 @@
       }
     },
     "node_modules/next": {
-      "version": "14.2.5",
-      "resolved": "https://registry.npmjs.org/next/-/next-14.2.5.tgz",
-      "integrity": "sha512-0f8aRfBVL+mpzfBjYfQuLWh2WyAwtJXCRfkPF4UJ5qd2YwrHczsrSzXU4tRMV0OAxR8ZJZWPFn6uhSC56UTsLA==",
-      "deprecated": "This version has a security vulnerability. Please upgrade to a patched version. See https://nextjs.org/blog/security-update-2025-12-11 for more details.",
+      "version": "15.5.28",
+      "resolved": "https://registry.npmjs.org/next/-/next-15.5.28.tgz",
+      "integrity": "sha512-JjhLBBY1PNnuwPtcZ7t8yxVeJVYvD2Jyp633J+gRCNbzSt7N0E+xqCf6uQiff3+3qmUkwcF/ksfSsK1xsZ76Tw==",
       "license": "MIT",
       "dependencies": {
-        "@next/env": "14.2.5",
-        "@swc/helpers": "0.5.5",
-        "busboy": "1.6.0",
+        "@next/env": "15.5.28",
+        "@swc/helpers": "0.5.15",
         "caniuse-lite": "^1.0.30001579",
-        "graceful-fs": "^4.2.11",
         "postcss": "8.4.31",
-        "styled-jsx": "5.1.1"
+        "styled-jsx": "5.1.6"
       },
       "bin": {
         "next": "dist/bin/next"
       },
       "engines": {
-        "node": ">=18.17.0"
+        "node": "^18.18.0 || ^19.8.0 || >= 20.0.0"
       },
       "optionalDependencies": {
-        "@next/swc-darwin-arm64": "14.2.5",
-        "@next/swc-darwin-x64": "14.2.5",
-        "@next/swc-linux-arm64-gnu": "14.2.5",
-        "@next/swc-linux-arm64-musl": "14.2.5",
-        "@next/swc-linux-x64-gnu": "14.2.5",
-        "@next/swc-linux-x64-musl": "14.2.5",
-        "@next/swc-win32-arm64-msvc": "14.2.5",
-        "@next/swc-win32-ia32-msvc": "14.2.5",
-        "@next/swc-win32-x64-msvc": "14.2.5"
+        "@next/swc-darwin-arm64": "15.5.28",
+        "@next/swc-darwin-x64": "15.5.28",
+        "@next/swc-linux-arm64-gnu": "15.5.28",
+        "@next/swc-linux-arm64-musl": "15.5.28",
+        "@next/swc-linux-x64-gnu": "15.5.28",
+        "@next/swc-linux-x64-musl": "15.5.28",
+        "@next/swc-win32-arm64-msvc": "15.5.28",
+        "@next/swc-win32-x64-msvc": "15.5.28",
+        "sharp": "^0.34.3 || ^0.35.5"
       },
       "peerDependencies": {
         "@opentelemetry/api": "^1.1.0",
-        "@playwright/test": "^1.41.2",
-        "react": "^18.2.0",
-        "react-dom": "^18.2.0",
+        "@playwright/test": "^1.51.1",
+        "babel-plugin-react-compiler": "*",
+        "react": "^18.2.0 || 19.0.0-rc-de68d2f4-20241204 || ^19.0.0",
+        "react-dom": "^18.2.0 || 19.0.0-rc-de68d2f4-20241204 || ^19.0.0",
         "sass": "^1.3.0"
       },
       "peerDependenciesMeta": {
@@ -2006,6 +2520,9 @@
         "@playwright/test": {
           "optional": true
         },
+        "babel-plugin-react-compiler": {
+          "optional": true
+        },
         "sass": {
           "optional": true
         }
@@ -2583,28 +3100,24 @@
       }
     },
     "node_modules/react": {
-      "version": "18.3.1",
-      "resolved": "https://registry.npmjs.org/react/-/react-18.3.1.tgz",
-      "integrity": "sha512-wS+hAgJShR0KhEvPJArfuPVN1+Hz1t0Y6n5jLrGQbkb4urgPE/0Rve+1kMB1v/oWgHgm4WIcV+i7F2pTVj+2iQ==",
+      "version": "19.3.1",
+      "resolved": "https://registry.npmjs.org/react/-/react-19.3.1.tgz",
+      "integrity": "sha512-QNhWdt7nrgVWWQG58QuGsAR3jv3Hbe4mb4vz7w2csnHavciZJgda1CPNaldF6eVxv90ud3jUXpKlHL69gO38yw==",
       "license": "MIT",
-      "dependencies": {
-        "loose-envify": "^1.1.0"
-      },
       "engines": {
         "node": ">=0.10.0"
       }
     },
     "node_modules/react-dom": {
-      "version": "18.3.1",
-      "resolved": "https://registry.npmjs.org/react-dom/-/react-dom-18.3.1.tgz",
-      "integrity": "sha512-5m4nQKp+rZRb09LNH59GM4BxTh9251/ylbKIbpe7TpGxfJ+9kv6BLkLBXIjjspbgbnIBNqlI23tRnTWT0snUIw==",
+      "version": "19.3.1",
+      "resolved": "https://registry.npmjs.org/react-dom/-/react-dom-19.3.1.tgz",
+      "integrity": "sha512-Y0bARz53lhEC1NMCASs0/j+faB/zqt3R8hpvg1e8+61ZVJ4UL0UdC4cBbXfZMcIuhrfgeILTLe+ZeBCavQPtKQ==",
       "license": "MIT",
       "dependencies": {
-        "loose-envify": "^1.1.0",
-        "scheduler": "^0.23.2"
+        "scheduler": "^0.28.0"
       },
       "peerDependencies": {
-        "react": "^18.3.1"
+        "react": "^19.3.1"
       }
     },
     "node_modules/reftools": {
@@ -2761,13 +3274,10 @@
       "license": "MIT"
     },
     "node_modules/scheduler": {
-      "version": "0.23.2",
-      "resolved": "https://registry.npmjs.org/scheduler/-/scheduler-0.23.2.tgz",
-      "integrity": "sha512-UOShsPwz7NrMUqhR6t0hWjFduvOzbtv7toDH1/hIrfRNIDBnnBWd0CwJTGvTpngVlmwGCdP9/Zl/tVrDqcuYzQ==",
-      "license": "MIT",
-      "dependencies": {
-        "loose-envify": "^1.1.0"
-      }
+      "version": "0.28.0",
+      "resolved": "https://registry.npmjs.org/scheduler/-/scheduler-0.28.0.tgz",
+      "integrity": "sha512-juorfCmIkIw8tT+p5BXSm6PJjQF/ycEYmKyzURCIt/RaZIhL+PulbQ9Yu2z1HdOJDdqDTlxA1+xKBmHXJsczAw==",
+      "license": "MIT"
     },
     "node_modules/sdp": {
       "version": "3.2.2",
@@ -2799,6 +3309,69 @@
       "integrity": "sha512-KiKBS8AnWGEyLzofFfmvKwpdPzqiy16LvQfK3yv/fVH7Bj13/wl3JSR1J+rfgRE9q7xUJK4qvgS8raSOeLUehw==",
       "license": "ISC"
     },
+    "node_modules/sharp": {
+      "version": "0.35.5",
+      "resolved": "https://registry.npmjs.org/sharp/-/sharp-0.35.5.tgz",
+      "integrity": "sha512-Ywn4OnzGukp7CDMrp08RQ50YKmuwG47brZgIVPTvBaaAfQlRlygrRqSrxdCiL9M+LlzLBiJ68IR1QqvzHyjC7g==",
+      "license": "Apache-2.0",
+      "optional": true,
+      "dependencies": {
+        "@img/colour": "^1.1.0",
+        "detect-libc": "^2.1.2",
+        "semver": "^7.8.5"
+      },
+      "engines": {
+        "node": ">=20.9.0"
+      },
+      "funding": {
+        "url": "https://opencollective.com/libvips"
+      },
+      "optionalDependencies": {
+        "@img/sharp-darwin-arm64": "0.35.5",
+        "@img/sharp-darwin-x64": "0.35.5",
+        "@img/sharp-freebsd-wasm32": "0.35.5",
+        "@img/sharp-libvips-darwin-arm64": "1.3.4",
+        "@img/sharp-libvips-darwin-x64": "1.3.4",
+        "@img/sharp-libvips-linux-arm": "1.3.4",
+        "@img/sharp-libvips-linux-arm64": "1.3.4",
+        "@img/sharp-libvips-linux-ppc64": "1.3.4",
+        "@img/sharp-libvips-linux-riscv64": "1.3.4",
+        "@img/sharp-libvips-linux-s390x": "1.3.4",
+        "@img/sharp-libvips-linux-x64": "1.3.4",
+        "@img/sharp-libvips-linuxmusl-arm64": "1.3.4",
+        "@img/sharp-libvips-linuxmusl-x64": "1.3.4",
+        "@img/sharp-linux-arm": "0.35.5",
+        "@img/sharp-linux-arm64": "0.35.5",
+        "@img/sharp-linux-ppc64": "0.35.5",
+        "@img/sharp-linux-riscv64": "0.35.5",
+        "@img/sharp-linux-s390x": "0.35.5",
+        "@img/sharp-linux-x64": "0.35.5",
+        "@img/sharp-linuxmusl-arm64": "0.35.5",
+        "@img/sharp-linuxmusl-x64": "0.35.5",
+        "@img/sharp-webcontainers-wasm32": "0.35.5",
+        "@img/sharp-win32-arm64": "0.35.5",
+        "@img/sharp-win32-ia32": "0.35.5",
+        "@img/sharp-win32-x64": "0.35.5"
+      },
+      "peerDependenciesMeta": {
+        "@types/node": {
+          "optional": true
+        }
+      }
+    },
+    "node_modules/sharp/node_modules/semver": {
+      "version": "7.8.5",
+      "resolved": "https://registry.npmjs.org/semver/-/semver-7.8.5.tgz",
+      "integrity": "sha512-Y7/KDsb8LjooZpwaqGyulO6DQlksgCncchHGk+sZIY4SBvUocMBEFH5Ur1fI4dV+Jvl0w6cjvucaIi40puRioA==",
+      "license": "ISC",
+      "optional": true,
+      "bin": {
+        "semver": "bin/semver.js"
+      },
+      "engines": {
+        "node": ">=10"
+      }
+    },
     "node_modules/shebang-command": {
       "version": "1.2.0",
       "resolved": "https://registry.npmjs.org/shebang-command/-/shebang-command-1.2.0.tgz",
@@ -2996,14 +3569,6 @@
         "node": ">=0.1.14"
       }
     },
-    "node_modules/streamsearch": {
-      "version": "1.1.0",
-      "resolved": "https://registry.npmjs.org/streamsearch/-/streamsearch-1.1.0.tgz",
-      "integrity": "sha512-Mcc5wHehp9aXz1ax6bZUyY5afg9u2rv5cqQI3mRrYkGC8rW2hM02jWuwjtL++LS5qinSyhj2QfLyNsuc+VsExg==",
-      "engines": {
-        "node": ">=10.0.0"
-      }
-    },
     "node_modules/string-width": {
       "version": "2.1.1",
       "resolved": "https://registry.npmjs.org/string-width/-/string-width-2.1.1.tgz",
@@ -3039,9 +3604,9 @@
       }
     },
     "node_modules/styled-jsx": {
-      "version": "5.1.1",
-      "resolved": "https://registry.npmjs.org/styled-jsx/-/styled-jsx-5.1.1.tgz",
-      "integrity": "sha512-pW7uC1l4mBZ8ugbiZrcIsiIvVx1UmTfw7UkC3Um2tmfUq9Bhk8IiyEIPl6F8agHgjzku6j0xQEZbfA5uSgSaCw==",
+      "version": "5.1.6",
+      "resolved": "https://registry.npmjs.org/styled-jsx/-/styled-jsx-5.1.6.tgz",
+      "integrity": "sha512-qSVyDTeMotdvQYoHWLNGwRFJHC+i+ZvdBRYosOFgC+Wg1vx4frN2/RG/NA7SYqqvKNLf39P2LSRA2pu6n0XYZA==",
       "license": "MIT",
       "dependencies": {
         "client-only": "0.0.1"
@@ -3050,7 +3615,7 @@
         "node": ">= 12.0.0"
       },
       "peerDependencies": {
-        "react": ">= 16.8.0 || 17.x.x || ^18.0.0-0"
+        "react": ">= 16.8.0 || 17.x.x || ^18.0.0-0 || ^19.0.0-0"
       },
       "peerDependenciesMeta": {
         "@babel/core": {
diff --git a/package.json b/package.json
index 2171e4b..4f83799 100644
--- a/package.json
+++ b/package.json
@@ -13,14 +13,14 @@
     "@supabase/ssr": "^0.12.3",
     "@supabase/supabase-js": "^2.108.2",
     "jspdf": "4.2.1",
-    "next": "^14.2.5",
-    "react": "^18",
-    "react-dom": "^18"
+    "next": "15.5.28",
+    "react": "19.3.1",
+    "react-dom": "19.3.1"
   },
   "devDependencies": {
     "@types/node": "^20",
-    "@types/react": "^18",
-    "@types/react-dom": "^18",
+    "@types/react": "19.3.0",
+    "@types/react-dom": "19.3.0",
     "typescript": "^5"
   }
 }
diff --git a/tsconfig.json b/tsconfig.json
index 0577a79..7982abd 100644
--- a/tsconfig.json
+++ b/tsconfig.json
@@ -1,9 +1,11 @@
 {
   "compilerOptions": {
     "baseUrl": ".",
-"paths": {
-  "@/*": ["./*"]
-},
+    "paths": {
+      "@/*": [
+        "./*"
+      ]
+    },
     "lib": [
       "dom",
       "dom.iterable",
@@ -24,7 +26,8 @@
       {
         "name": "next"
       }
-    ]
+    ],
+    "target": "ES2017"
   },
   "include": [
     "next-env.d.ts",

```

### New Summary content

```markdown
# Sprint NEXT15_SECURITY_UPGRADE_GATE_01_PHASE_2 Summary

- Sprint ID: NEXT15_SECURITY_UPGRADE_GATE_01_PHASE_2
- Title: Controlled Next.js 15.5.28 security migration
- Branch: feature/auth-foundation
- Status: Implementation validated; awaiting approval; browser/live-auth acceptance not performed.
- Goal: Upgrade only the approved framework/React dependency set and migrate async request APIs without changing security or completion designs.
- Created files: docs/01_Engineering/Sprint_NEXT15_SECURITY_UPGRADE_GATE_01_PHASE_2_Summary.md, docs/01_Engineering/Sprint_NEXT15_SECURITY_UPGRADE_GATE_01_PHASE_2_Engineering_Report.md
- Modified files:
- `app/api/interviews/[id]/pdf/route.ts`
- `app/api/interviews/[id]/route.ts`
- `app/interview/page.tsx`
- `app/result/[id]/page.tsx`
- `components/interview/InterviewerStage.tsx`
- `lib/auth/get-authenticated-user.ts`
- `lib/interviews/delete-owned-interview.test.cjs`
- `lib/interviews/interview-route-input.test.cjs`
- `lib/interviews/read-owned-interview.test.cjs`
- `lib/providers/security-privacy.test.cjs`
- `lib/reports/interview-report.test.cjs`
- `lib/supabase/server.ts`
- `next-env.d.ts`
- `next.config.js`
- `package-lock.json`
- `package.json`
- `tsconfig.json`
- Validation: 611/611 deterministic tests passed; TypeScript exit 0; elevated production build exit 0; PDF trace contains both Inter fonts and tokens CSS; npm ls exit 0 with no invalid peers.
- Dependency result: next 15.5.28; react/react-dom 19.3.1; @types/react and @types/react-dom 19.3.0; transitive sharp 0.35.5.
- Risks/problems: initial sandbox registry DNS failure and build EPERM resolved by approved elevated reruns; npm emitted an old React 18 peer-replacement warning, 18 audit findings (13 moderate, 3 high, 2 critical), and pending core-js@3.49.0 install-script warning. No bypasses, audit fixes, or script approvals used. Next generated tsconfig ES2017 target and next-env route-type reference. Browser/provider acceptance remains unverified.
- Approval status: Not yet approved. No staging, commit, push, or next sprint.

```

## 13. Risks, Limitations, and Technical Debt

npm reports 18 audit findings; package-level remediation/classification is not performed in this bounded migration. Pending core-js script warning remains. No serious final peer conflict identified. Deployment Node/OS/libc unknown; retained Supabase requires Node >=22. No browser hydration, real cookie refresh/PKCE, camera/audio, or live provider acceptance performed. Existing custom React harnesses do not prove actual React 19 scheduler behavior. PDF assets traced and deterministic parser checks passed, but deployed PDF smoke acceptance remains outstanding.

Existing cookie-only detail/PDF/delete behavior and raw DB-error logging in read-owned-interview remain untouched. Generated tsconfig and next-env changes need explicit review. No claim that all repository security vulnerabilities are remediated.

## 14. Untouched-Module Confirmation

No provider implementation, Claude prompt contract, ElevenLabs restrictions, HeyGen disabled behavior, admission implementation, ownership helpers, completion/session state machines, persistence implementation, recovery implementation, history implementation, styles/tokens, migrations or prior reports changed. Only files listed above changed; approved unrelated dependency versions retained.

## 15. Approval Required

Review and accept the implementation, generated TypeScript files, warnings and remaining browser/live acceptance limitations. Approval not yet granted. No stage/commit/push and no next sprint. Repository workflow requires acceptance review before any separately authorized Git action.
