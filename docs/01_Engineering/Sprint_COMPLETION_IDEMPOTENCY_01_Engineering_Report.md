# Sprint COMPLETION_IDEMPOTENCY_01 Engineering Report

## 1. Report identity

Date: 2026-10-06 (Europe/Istanbul). Branch: feature/auth-foundation. Safe committed base: `229faf678c22f2ed89497fc3a97ae3b477eafba5` (`fix(interview): harden session transitions`). IMPLEMENTATION + AUTOMATED VALIDATION + LOCAL FIRST-SAVE BROWSER ACCEPTANCE: PASS. UNCOMMITTED / pending final Git closure. Final pre-commit/documentation review pending; no future commit hash or Git authority asserted.

## 2. Objective and boundaries

Prevent duplicate persisted interviews after ambiguous completion responses while preserving INTERVIEW_RELIABILITY_01 admission/disposal/stale response and zero/partial-answer contracts. Approved seven implementation/test files and six documentation files only. No schema migration, dependency, config, session storage/resume, scoring/provider redesign, History/Result/PDF/Profile/Auth implementation changes. Browser evidence here is user-provided; no browser/data operations in this documentation turn.

## 3. Repository state before implementation

Verified repository C:\Users\p-ayd\interviewai, branch feature/auth-foundation, HEAD and local origin reference both 229faf678c22f2ed89497fc3a97ae3b477eafba5, clean working tree. No fetch. Prior reliability complete/committed/pushed per user evidence. At documentation start, exactly the approved seven implementation/test paths were uncommitted. Reports did not already exist; historical reports are untouched.

## 4. Architecture and implementation decisions

Forensic root cause: previous client failure catch released completion admission; explicit retry reran final evaluation and sent another POST. Server supplied no stable identity and each insert defaulted to gen_random_uuid(). A committed insert followed by lost/unusable response could therefore produce a second UUID/row. Client transition hardening alone did not prevent server duplication.

Choose one browser-native UUID v4 per nonempty intent; persist it as existing interviews.id. No new column/backfill/migration/dependency. Existing UUID primary key provides race exclusion; different identities may legitimately persist identical content. Authentication stays first at the route; helper receives server-derived owner. Required identity normalizes case and rejects missing/non-v4 IDs. No server-generated fallback.

Persistence inserts first; no preliminary lookup or update/upsert. Installed PostgREST error shape contains code, message, details and hint; there is no separate constraint-name field. Recognition requires code 23505 and message naming unique constraint interviews_pkey. Unrelated/unknown errors remain generic persistence errors; no interview text logging. After recognized conflict, select only ID/comparison fields and filter both ID and authenticated owner. Never query foreign ownership without the owner filter.

Compare all persisted metadata, score, summary, duration and ordered exact q/a pairs. Ignore request extras, object property order, timestamps and response flags; no hash/fingerprint needed. Existing row is never overwritten. First success 201/replayed false; matching replay 200/replayed true; mismatch/unavailable identity generic 409. Client owner_id is not trusted or copied into the row.

Client creates identity after nonempty admission. Evaluation failure may retry evaluation before a payload exists. Validated evaluation freezes the complete payload once, including copied/frozen ordered answers and duration. All subsequent persistence retries reuse identity/payload without rereading live answers or recalculating duration. Valid response UUID must equal completionId and replayed, if present, must be boolean. Saved ID supports navigation-only retry after synchronous navigation failure. State resets on lifecycle/disposal; no browser storage. Zero answers short-circuit before identity/evaluation; partial answers remain submitted-only. After failed save, other live transitions may occur but retry still saves the original frozen intent; no second identity is silently created.

## 5. Created and modified files

Created:

- `lib/interviews/interview-completion-state.ts`
- `lib/interviews/interview-completion-state.test.cjs`
- `lib/interviews/persist-owned-interview.ts`
- `lib/interviews/persist-owned-interview.test.cjs`
- `docs/01_Engineering/Sprint_COMPLETION_IDEMPOTENCY_01_Summary.md`
- `docs/01_Engineering/Sprint_COMPLETION_IDEMPOTENCY_01_Engineering_Report.md`

Modified:

- `app/api/interviews/route.ts`
- `app/interview/page.tsx`
- `lib/interviews/interview-session-state.test.cjs`
- `docs/04_Project_Memory/CURRENT_STATE.md`
- `docs/04_Project_Memory/STAGE_LOG.md`
- `docs/04_Project_Memory/DEFERRED_FIXES.md`
- `docs/04_Project_Memory/DECISIONS_AND_RISKS.md`

Exactly 13 approved paths; new files remain untracked, not staged.

## 6. File responsibilities

- `app/api/interviews/route.ts`: Authenticated POST boundary, JSON/payload/identity validation and HTTP mapping; GET unchanged.
- `app/interview/page.tsx`: Coordinate completion admission, evaluation/frozen retry payload, response identity validation and Result navigation.
- `lib/interviews/interview-session-state.test.cjs`: Existing reliability/page harness plus actual page response-loss, invalid response and navigation-only retry evidence.
- `lib/interviews/interview-completion-state.ts`: In-memory UUID, immutable payload, saved ID, response checks and reset; shared identity normalizer.
- `lib/interviews/interview-completion-state.test.cjs`: Identity lifetime, zero-answer, freezing, mutation, duration, response checks and storage absence unit tests.
- `lib/interviews/persist-owned-interview.ts`: Insert-first owner-derived persistence, recognized primary-key replay recovery and exact logical payload comparison.
- `lib/interviews/persist-owned-interview.test.cjs`: Stateful persistence double and actual POST route tests; concurrency/conflict/security/status contracts.
- `docs/04_Project_Memory/CURRENT_STATE.md`: Newest acceptance/Git/next-stage checkpoint before preserved historical entries.
- `docs/04_Project_Memory/STAGE_LOG.md`: Append-only stage implementation/validation/user-verified browser evidence.
- `docs/04_Project_Memory/DEFERRED_FIXES.md`: Supersede unresolved completion duplication while retaining qualified deferred dependencies.
- `docs/04_Project_Memory/DECISIONS_AND_RISKS.md`: Record bounded no-schema identity/replay decision, privacy and accepted remaining risks.
- `docs/01_Engineering/Sprint_COMPLETION_IDEMPOTENCY_01_Summary.md`: Concise sprint acceptance inventory and qualifications.
- `docs/01_Engineering/Sprint_COMPLETION_IDEMPOTENCY_01_Engineering_Report.md`: Complete engineering evidence and nonrecursive full change record.

## 7. Public interfaces, props and types

- CompletionPayload: readonly interviewerKey, role, company, level, interviewType, persona, language, ordered readonly q/a answers, score, summary and durationSeconds.
- normalizeCompletionId(unknown): lowercase UUID v4 or null.
- createInterviewCompletionState(optional ID generator): begin(answers), freezePayload(payload), acceptSaved(unknown), completionId/payload/savedId getters and reset(). Browser default crypto.randomUUID(); injected generator is for deterministic tests.
- PersistenceResult: saved with id/replayed, conflict, or error discriminated union.
- isPrimaryKeyConflict({code,message}): only expected PK conflict recognition.
- persistOwnedInterview(ownerId, completionId, validated payload): Promise<PersistenceResult>; authentication remains route-owned.
- POST request requires completionId plus existing payload; missing identity intentionally breaks old duplicate-prone clients. Legacy already-open clients need deployment consideration.
- No UI props or GET/detail/Result interfaces changed.

## 8. Accessibility decisions

Existing completion busy/transition guards, localized warning/failure feedback, keyboard controls and error alert presentation remain intact. No presentation/style/interaction redesign. Deterministic zero/partial and failure-retry tests protect existing behavior; no new independent accessibility browser claim.

## 9. Styling and token usage

No CSS/design values changed; approved Talentry token system/palette preserved. No inline style expansion or new UI components.

## 10. Validation commands and exact results

Results recorded from completed implementation/build turns; not rerun in this documentation turn.

| Command/gate | Exact final result |
|---|---|
| node --test lib/interviews/interview-completion-state.test.cjs | Exit 0; 14 tests, 14 pass, 0 fail/cancelled/skipped/todo |
| node --test lib/interviews/persist-owned-interview.test.cjs | Exit 0; 31 tests, 31 pass, 0 fail/cancelled/skipped/todo |
| node --test lib/interviews/interview-session-state.test.cjs | Exit 0; 55 tests, 55 pass, 0 fail/cancelled/skipped/todo |
| Relevant regression command below | Exit 0; 96 tests, 96 pass, 0 fail/cancelled/skipped/todo |
| npx.cmd tsc --noEmit --incremental false | Final exit 0, PASS |
| git diff --check (implementation) | Exit 0, PASS |
| Read-only Get-CimInstance Node process check | Initially access denied; approved inspection found two repo dev candidates and stopped build. After user manual stop, recheck found zero candidates. No termination/restart by agent. |
| npm.cmd run build | Exit 0, PASS; generated pages 22/22 |
| git diff --check (documentation closure) | Exit 0, PASS; full diff/scope reviewed |

Regression command executed via invocation-local Node spawn with REPORT_PDF_PYTHON=C:\Users\p-ayd\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe in the child environment only:

```text
node --test lib/interviews/read-owned-interview.test.cjs lib/interviews/delete-owned-interview.test.cjs lib/interviews/history-cursor.test.cjs lib/interviews/history-pagination.test.cjs components/interviews/useFullInterviewHistory.test.cjs components/result/useInterviewDeletion.test.cjs lib/reports/interview-report.test.cjs
```

No persisted environment change/pypdf install. Build emitted two webpack.cache.PackFileCacheStrategy warnings: caching failed / unable to snapshot resolve dependencies. npm update notice and informational Git LF-to-CRLF notice also recorded. No product regression established by warnings. Initial test iteration exposed a missing test harness brace and missing mocked crypto; initial TypeScript check exposed union narrowing; all were corrected in approved files before final passes. A bare Python command was unavailable; bundled runtime used, without install. No concealed final validation failure.

### Primary deterministic acceptance

Actual page handlers plus actual POST/helper with stateful DB double: evaluate once, freeze X/P, commit one row X/P, simulate lost response, show retryable client failure, mutate live answers, then retry same X/P/duration without evaluation. Matching replay returns original ID, logical row count remains one, Result navigation uses /result/X. Wrong UUID, unreadable JSON, invalid replay flag and navigation-only retry covered. Application concurrency double yields one insert and one replay; this is not PostgreSQL integration evidence.

### User-verified browser acceptance

One ordinary current-application interview completed. Network POST /api/interviews returned 201 with replayed false. User manually compared request completionId, response id and Result URL ID: all identical. FIRST-SAVE IDENTITY CONTRACT: PASS. Actual UUID unnecessary and omitted. No live response-loss/duplicate replay performed; replay/concurrency/conflict/foreign-collision/no-reevaluation evidence is automated only.

## 11. Git status

Expected final state: seven modified files and six new/untracked files across the approved 13-path inventory. No staging/commit/push. HEAD remains the safe base. Exact status snapshot follows below; new paths are ?? because they are not staged.

## 12. Complete sprint-file change record

Full tracked diffs and full added-file diffs follow, including implementation/tests, memory and Summary. The newly created Engineering Report is represented by this entire document (all lines are added); its own contents are not recursively duplicated as a self-diff. No source/test diff is omitted. Historical reports unchanged.

## 13. Risks, limitations and technical debt

In-memory intent only: refresh/tab closure loses identity, deferred SESSION_RESUME_01. Hard deletion removes replay evidence; indefinite post-delete protection needs separate tombstone/retention decision. Actual PostgreSQL concurrency integration NOT run; UUID PRIMARY KEY assumption comes from repository migration, deployed parity remains environment/release verification. No real/test Supabase concurrency writes. PK-message recognition fails closed if constraint name/message changes. Legacy clients without identity get 400. Provider security/privacy and scoring trust remain later work. Failed-save retry targets original frozen answers even after live edits. Synchronous navigation failure can retry known ID; later asynchronous router failures are not independently observed. These limitations do not block local stage closure.

HISTORY_PAGINATION_01: NATURAL-RECORD DEFERRED ACCEPTANCE. Historical directly verified baseline 11 on 2026-10-06; reliability acceptance added one natural interview and this stage added one additional natural interview. History not recounted afterward, no current verified total. No synthetic seeding.

## 14. Untouched-module confirmation

No migration, package/lock/dependency/config changes. GET/History semantics unchanged; Result/PDF/Profile/Auth/media/provider/style implementation untouched. Seven executable/test files unchanged during documentation turn. Only six approved documentation files created/updated; prior reports preserved. No secrets or actual completion UUID recorded. No browser acceptance/tests/build rerun, provider calls, Supabase query/mutation, process termination or Git mutation here.

## 15. Approval required

Implementation + deterministic validation + user-verified local first-save browser acceptance PASS. UNCOMMITTED; documentation/final pre-commit review pending. Stop for review. No commit hash invented. Next AFTER Git closure: ROUTE_INPUT_HARDENING_01, planned / NOT STARTED / NOT IMPLEMENTED / NOT YET AUTHORIZED. No automatic continuation; staging/commit/push require explicit separate authorization.

## Appendix: Git status and full diffs

```text
 M app/api/interviews/route.ts
 M app/interview/page.tsx
 M docs/04_Project_Memory/CURRENT_STATE.md
 M docs/04_Project_Memory/DECISIONS_AND_RISKS.md
 M docs/04_Project_Memory/DEFERRED_FIXES.md
 M docs/04_Project_Memory/STAGE_LOG.md
 M lib/interviews/interview-session-state.test.cjs
?? docs/01_Engineering/Sprint_COMPLETION_IDEMPOTENCY_01_Engineering_Report.md
?? docs/01_Engineering/Sprint_COMPLETION_IDEMPOTENCY_01_Summary.md
?? lib/interviews/interview-completion-state.test.cjs
?? lib/interviews/interview-completion-state.ts
?? lib/interviews/persist-owned-interview.test.cjs
?? lib/interviews/persist-owned-interview.ts
```

### app/api/interviews/route.ts

```diff
diff --git a/app/api/interviews/route.ts b/app/api/interviews/route.ts
index 389152c..eace8b2 100644
--- a/app/api/interviews/route.ts
+++ b/app/api/interviews/route.ts
@@ -142,59 +142,22 @@ export async function GET(request: NextRequest) {
 }

 export async function POST(req: NextRequest) {
+    const headers = { 'Cache-Control': 'private, no-store' }
     const auth = await getAuthenticatedUser()
-
-    if (auth.status !== 'authenticated') {
-        return NextResponse.json(
-            { error: 'Unauthorized' },
-            { status: 401 },
-        )
-    }
+    if (auth.status !== 'authenticated') return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers })
     let body: unknown
-
-    try {
-        body = await req.json()
-    } catch {
-        return NextResponse.json(
-            { error: 'Invalid JSON body' },
-            { status: 400 },
-        )
-    }
-    if (!isInterviewPayload(body)) {
-        return NextResponse.json(
-            { error: 'Invalid interview payload' },
-            { status: 400 },
-        )
-    }
-    const admin = createAdminClient()
-    const { data, error } = await admin
-        .from('interviews')
-        .insert({
-            owner_id: auth.user.id,
-            interviewer_key: body.interviewerKey,
-            role: body.role,
-            company: body.company,
-            level: body.level,
-            interview_type: body.interviewType,
-            persona: body.persona,
-            language: body.language,
-            answers: body.answers,
-            score: body.score,
-            summary: body.summary,
-            duration_seconds: body.durationSeconds,
-        })
-        .select('id')
-        .single()
-    if (error) {
-        console.error('Interview persistence error:', error)
-
-        return NextResponse.json(
-            { error: 'Failed to save interview' },
-            { status: 500 },
-        )
+    try { body = await req.json() } catch {
+        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400, headers })
     }
-    return NextResponse.json(
-        { id: data.id },
-        { status: 201 },
+    const { normalizeCompletionId } = await import('@/lib/interviews/interview-completion-state')
+    const { persistOwnedInterview } = await import('@/lib/interviews/persist-owned-interview')
+    const completionId = normalizeCompletionId(
+        body && typeof body === 'object' && 'completionId' in body ? body.completionId : null,
     )
+    if (!completionId) return NextResponse.json({ error: 'Invalid completion identity' }, { status: 400, headers })
+    if (!isInterviewPayload(body)) return NextResponse.json({ error: 'Invalid interview payload' }, { status: 400, headers })
+    const result = await persistOwnedInterview(auth.user.id, completionId, body)
+    if (result.status === 'conflict') return NextResponse.json({ error: 'Completion conflict' }, { status: 409, headers })
+    if (result.status === 'error') return NextResponse.json({ error: 'Failed to save interview' }, { status: 500, headers })
+    return NextResponse.json({ id: result.id, replayed: result.replayed }, { status: result.replayed ? 200 : 201, headers })
 }
```

### app/interview/page.tsx

```diff
diff --git a/app/interview/page.tsx b/app/interview/page.tsx
index 1835a18..209336f 100644
--- a/app/interview/page.tsx
+++ b/app/interview/page.tsx
@@ -9,6 +9,7 @@ import type { InterviewFeedback, InterviewTab, InterviewWorkspaceLabels } from '
 import LiveInterviewControls from '@/components/interview/LiveInterviewControls'
 import { TalentryButton } from '@/components/ui'
 import styles from './interview.module.css'
+import { createInterviewCompletionState } from '@/lib/interviews/interview-completion-state'
 import { createInterviewSessionState } from '@/lib/interviews/interview-session-state'
 import type { AcceptedQuestion, SessionAnswer, SessionOperation } from '@/lib/interviews/interview-session-state'

@@ -37,7 +38,6 @@ const T: Record<string,string> = {
   mixed:'karma',
   case:'vaka analizi'
 }
-const RESULT_UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
 type InterviewLanguage = 'tr' | 'en' | 'de'
 type MobileInterviewPanel = 'interviewer' | 'interview' | 'feedback'

@@ -156,10 +156,6 @@ type EvaluationResult = {
   summary: string
 }

-type PersistedInterviewResponse = {
-  id: string
-}
-
 function isEvaluationResult(value: unknown): value is EvaluationResult {
   return (
     typeof value === 'object' &&
@@ -176,16 +172,6 @@ function isEvaluationResult(value: unknown): value is EvaluationResult {
   )
 }

-function isPersistedInterviewResponse(value: unknown): value is PersistedInterviewResponse {
-  return (
-    typeof value === 'object' &&
-    value !== null &&
-    'id' in value &&
-    typeof value.id === 'string' &&
-    RESULT_UUID_PATTERN.test(value.id)
-  )
-}
-
 function parseInterviewFeedback(value: string, fallbackText: string): InterviewFeedback {
   const normalized = value.replace(/```json|```/gi, '').trim()

@@ -232,6 +218,7 @@ function InterviewContent() {
   const camRef = useRef<HTMLVideoElement>(null)
   const answersRef = useRef<SessionAnswer[]>([])
   const sessionRef = useRef(createInterviewSessionState())
+  const completionRef = useRef(createInterviewCompletionState())
   const curQRef = useRef('')
   const qNumRef = useRef(0)
   const camStreamRef = useRef<MediaStream | null>(null)
@@ -283,9 +270,11 @@ function InterviewContent() {
     // Effect replay owns a fresh session; obsolete closures retain their disposed owner.
     const session = createInterviewSessionState()
     sessionRef.current = session
+    completionRef.current.reset()
     initialQuestionTriggeredRef.current = false
     return () => {
       session.dispose()
+      completionRef.current.reset()
       audioRequestRef.current += 1
       stopCurrentAudio()
     }
@@ -497,48 +486,46 @@ const sys = `${P[persona]} Sen ${role} için ${T[itype]} mülakatı yapıyorsun.
     }

     try {
-      const aText = answers.map((x,i)=>`S${i+1}: ${x.q}\nC: ${x.a}`).join('\n\n')
-      const sys = `Kıdemli bir İK uzmanısın. ${languageInstruction} Sadece geçerli JSON döndür: {"score":0-100,"summary":"3-4 cümlelik değerlendirme"}`
-      const raw = await claudeCall(sys, `Pozisyon: ${role}\n\n${aText}`)
-      if (!session.isCurrent(token)) return
-      const evaluation: unknown = JSON.parse(raw.replace(/```json|```/g,'').trim())
-
-      if (!isEvaluationResult(evaluation)) {
-        throw new Error('Invalid final interview evaluation')
-      }
-
-      const saveRes = await fetch('/api/interviews', {
-        method: 'POST',
-        headers: { 'Content-Type': 'application/json' },
-        body: JSON.stringify({
-          interviewerKey: ivKey,
-          role,
-          company,
-          level,
-          interviewType: itype,
-          persona,
-          language,
-          answers,
-          score: evaluation.score,
-          summary: evaluation.summary,
-          durationSeconds: secs,
-        }),
-      })
-
-      if (!saveRes.ok) {
-        console.error('Interview save failed with status:', saveRes.status)
-        throw new Error('Interview persistence failed')
-      }
-
-      const savedInterview: unknown = await saveRes.json()
-
-      if (!session.isCurrent(token)) return
-      if (!isPersistedInterviewResponse(savedInterview)) {
-        throw new Error('Invalid interview persistence response')
+      const completion = completionRef.current
+      const completionId = completion.begin(answers)
+      if (!completionId) throw new Error('Completion identity required')
+      if (!completion.savedId) {
+        if (!completion.payload) {
+          const aText = answers.map((x,i)=>`S${i+1}: ${x.q}\nC: ${x.a}`).join('\n\n')
+          const sys = `Kıdemli bir İK uzmanısın. ${languageInstruction} Sadece geçerli JSON döndür: {"score":0-100,"summary":"3-4 cümlelik değerlendirme"}`
+          const raw = await claudeCall(sys, `Pozisyon: ${role}\n\n${aText}`)
+          if (!session.isCurrent(token)) return
+          const evaluation: unknown = JSON.parse(raw.replace(/```json|```/g,'').trim())
+
+          if (!isEvaluationResult(evaluation)) {
+            throw new Error('Invalid final interview evaluation')
+          }
+
+          completion.freezePayload({
+            interviewerKey: ivKey,
+            role,
+            company,
+            level,
+            interviewType: itype,
+            persona,
+            language,
+            answers,
+            score: evaluation.score,
+            summary: evaluation.summary,
+            durationSeconds: secs,
+          })
+        }
+        const saveRes = await fetch('/api/interviews', {
+          method: 'POST', headers: { 'Content-Type': 'application/json' },
+          body: JSON.stringify({ completionId, ...completion.payload }),
+        })
+        if (!saveRes.ok) throw new Error('Interview persistence failed')
+        const savedInterview: unknown = await saveRes.json()
+        if (!session.isCurrent(token)) return
+        if (!completion.acceptSaved(savedInterview)) throw new Error('Invalid interview persistence response')
       }
-
       camStreamRef.current?.getTracks().forEach(t=>t.stop())
-      router.push(`/result/${encodeURIComponent(savedInterview.id)}`)
+      router.push(`/result/${encodeURIComponent(completion.savedId!)}`)
     } catch (error) {
       if (!session.isCurrent(token)) return
       session.release(token)
@@ -551,6 +538,7 @@ const sys = `${P[persona]} Sen ${role} için ${T[itype]} mülakatı yapıyorsun.

   function leaveWithoutSaving() {
     sessionRef.current.dispose()
+    completionRef.current.reset()
     audioRequestRef.current += 1
     stopCurrentAudio()
     camStreamRef.current?.getTracks().forEach(track => track.stop())
```

### lib/interviews/interview-session-state.test.cjs

```diff
diff --git a/lib/interviews/interview-session-state.test.cjs b/lib/interviews/interview-session-state.test.cjs
index 6326187..883dbd2 100644
--- a/lib/interviews/interview-session-state.test.cjs
+++ b/lib/interviews/interview-session-state.test.cjs
@@ -8,6 +8,8 @@ const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compile
 const loaded = new Module(filename, module)
 loaded._compile(compiled, filename)
 const { createInterviewSessionState } = loaded.exports
+const { load, uuid } = require('./history-test-helpers.cjs')
+const completionModule = load('lib/interviews/interview-completion-state.ts', {}, {crypto:{randomUUID:()=> '11111111-1111-4111-8111-111111111111'}})
 function accepted(s, text = '  Canonical question?  ') {
   const op = s.beginGeneration()
   assert.ok(op)
@@ -85,7 +87,7 @@ test('page snapshot persistence UUID zero-answer and canonical contracts', () =>
  assert.match(page,/snapshot: answers/); assert.match(page,/answers.map\(/); assert.match(page,/language,\s*answers,\s*score: evaluation.score/)
  assert.doesNotMatch(page,/const answers = answersRef.current/)
  assert.match(page,/if \(!answers.length\)[\s\S]*copy.zeroAnswerWarning[\s\S]*return/)
- assert.match(page,/RESULT_UUID_PATTERN.test\(value.id\)/); assert.match(page,/router.push\(`\/result\/\$\{encodeURIComponent\(savedInterview.id\)\}`\)/)
+ assert.match(page,/completion.acceptSaved\(savedInterview\)/); assert.match(page,/encodeURIComponent\(completion.savedId!\)/)
  assert.match(page,/curQRef.current = accepted.text; setQuestion\(accepted.text\)/); assert.match(page,/speakText\(accepted\)/)
  assert.match(page,/submitted.q/); assert.match(page,/session.canSpeak\(accepted\)/); assert.match(page,/session.dispose\(\)/)
  assert.match(page,/if \(!res.ok\) throw/); assert.match(page,/typeof data.text !== 'string'/)
@@ -97,7 +99,7 @@ test('UI guards and localized retries wired', () => {
  assert.equal((page.match(/retryFeedback: '/g)||[]).length,3)
 })
 // Execute the real page handlers with hook/provider mocks; no browser or external services.
-function pageHarness(language = 'en') {
+function pageHarness(language = 'en', navigation = null) {
   const vm = require('node:vm'), path = require('node:path')
   let cursor=0, mounting=true, tree
   const hooks=[], effects=[], cleanups=[], requests=[], routes=[], audio=[]
@@ -112,8 +114,9 @@ function pageHarness(language = 'en') {
   React.default=React
   const imports = {
     react: React,
-    'next/navigation': { useSearchParams:()=>({get:key=>key==='language'?language:null}), useRouter:()=>({push:route=>routes.push(route)}) },
+    'next/navigation': { useSearchParams:()=>({get:key=>key==='language'?language:null}), useRouter:()=>({push:route=>{if(navigation)navigation(route);routes.push(route)}}) },
     '@/lib/interviews/interview-session-state': loaded.exports,
+    '@/lib/interviews/interview-completion-state': completionModule,
     '@/components/ui': {TalentryButton:'Button'},
     '@/components/interview/InterviewWorkspace': { default:'Workspace', InterviewFeedbackCard:'FeedbackCard' },
     '@/components/interview/LiveInterviewControls': { default:'Controls' },
@@ -122,7 +125,7 @@ function pageHarness(language = 'en') {
     './interview.module.css': {default:{}},
   }
   const scope = {
-    React,
+    React, crypto:{randomUUID:()=> '11111111-1111-4111-8111-111111111111'},
     exports:{}, require:name=>{assert.ok(name in imports,name);return imports[name]},
     console:{warn(){},error(){}}, setInterval:()=>1, clearInterval(){},
     navigator:{mediaDevices:{getUserMedia:()=>Promise.reject(Error('mock camera'))}},
@@ -189,3 +192,46 @@ test('real page completion invalidates pending TTS and failure permits explicit
  const end=h.controls().onEnd();h.requests[1].resolve({ok:true,blob:async()=>({})});h.requests[3].resolve(textResponse('{"score":999,"summary":"Invalid"}'));await end;await flush();h.render();assert.equal(h.audio.length,0);assert.equal(h.controls().isCompleting,false);assert.ok(h.controls().completionError)
  const retry=h.controls().onEnd();assert.equal(h.requests.length,5);h.requests[4].resolve({ok:false,status:500});await retry;h.dispose()
 })
+
+async function readyCompletion(h) {
+ await initial(h);const {work}=await pageSubmit(h)
+ h.requests.at(-1).resolve(textResponse('Feedback'));await work;h.render()
+ const end=h.controls().onEnd()
+ h.requests.at(-1).resolve(textResponse('{"score":80,"summary":"Original evaluation"}'))
+ await flush();return {end,save:h.requests.at(-1)}
+}
+test('real page committed response loss retries original payload and navigates with one stored row',async()=>{
+ const {harness}=require('./persist-owned-interview.test.cjs'),db=harness(),h=pageHarness()
+ const {end,save}=await readyCompletion(h),original=JSON.parse(JSON.stringify(save.body))
+ const first=await db.post(save.body);assert.equal(first.status,201);assert.equal(db.rows.size,1)
+ save.reject(Error('Response lost after commit'));await end;h.render()
+ assert.equal(h.controls().isCompleting,false);assert.ok(h.controls().completionError)
+ // The UI still permits other transitions; new answers must not replace the frozen save intent.
+ const next=h.workspace().onNext();h.requests.at(-1).resolve(textResponse('New question'));await next;h.render()
+ h.workspace().onAnswerChange('New answer');h.render();const submitted=h.workspace().onSubmit()
+ h.requests.at(-1).resolve(textResponse('Feedback'));await submitted;h.render()
+ const before=h.requests.length,retry=h.controls().onEnd(),second=h.requests.at(-1)
+ assert.equal(h.requests.length,before+1);assert.equal(second.url,'/api/interviews')
+ assert.deepEqual(second.body,original);assert.equal(second.body.answers.length,1)
+ const replay=await db.post(second.body);assert.equal(replay.status,200)
+ const body=await replay.json();assert.equal(body.replayed,true);second.resolve({ok:true,json:async()=>body})
+ await retry;assert.equal(db.rows.size,1)
+ assert.equal(h.requests.filter(r=>r.url==='/api/claude'&&r.body.system.includes('Kıdemli')).length,1)
+ assert.deepEqual(h.routes,[`/result/${original.completionId}`]);h.dispose()
+})
+for(const mode of ['wrong-id','unreadable-json','invalid-replayed']) test('real page '+mode+' retries without reevaluation',async()=>{
+ const h=pageHarness(),{end,save}=await readyCompletion(h)
+ save.resolve({ok:true,json:async()=>{if(mode==='unreadable-json')throw Error('JSON');return {id:mode==='wrong-id'?uuid(2):save.body.completionId,...(mode==='invalid-replayed'?{replayed:'yes'}:{})}}})
+ await end;h.render();assert.deepEqual(h.routes,[]);assert.equal(h.controls().isCompleting,false)
+ const count=h.requests.length,retry=h.controls().onEnd(),second=h.requests.at(-1)
+ assert.equal(h.requests.length,count+1);assert.deepEqual(second.body,save.body)
+ second.resolve({ok:true,json:async()=>({id:save.body.completionId,replayed:true})})
+ await retry;assert.deepEqual(h.routes,[`/result/${save.body.completionId}`]);h.dispose()
+})
+test('real page validated save navigation-only retry performs no evaluation or POST',async()=>{
+ let fail=true;const h=pageHarness('en',()=>{if(fail)throw Error('Navigation failed')})
+ const {end,save}=await readyCompletion(h);save.resolve({ok:true,json:async()=>({id:save.body.completionId,replayed:false})})
+ await end;h.render();assert.equal(h.controls().isCompleting,false);const count=h.requests.length
+ fail=false;await h.controls().onEnd();assert.equal(h.requests.length,count)
+ assert.deepEqual(h.routes,[`/result/${save.body.completionId}`]);h.dispose()
+})
```

### lib/interviews/interview-completion-state.ts

```diff
diff --git a/lib/interviews/interview-completion-state.ts b/lib/interviews/interview-completion-state.ts
new file mode 100644
index 0000000..7dcdf4a
--- /dev/null
+++ b/lib/interviews/interview-completion-state.ts
@@ -0,0 +1,49 @@
+export type CompletionPayload = Readonly<{
+  interviewerKey: string; role: string; company: string; level: string
+  interviewType: string; persona: string; language: string
+  answers: readonly Readonly<{ q: string; a: string }>[]
+  score: number; summary: string; durationSeconds: number
+}>
+
+const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
+
+export function normalizeCompletionId(value: unknown): string | null {
+  return typeof value === 'string' && UUID_V4.test(value) ? value.toLowerCase() : null
+}
+
+/** One in-memory completion intent; session ownership remains with the session helper. */
+export function createInterviewCompletionState(generateId = () => crypto.randomUUID()) {
+  let completionId: string | null = null
+  let payload: CompletionPayload | null = null
+  let savedId: string | null = null
+  return {
+    begin(answers: CompletionPayload['answers']) {
+      if (!answers.length) return null
+      if (!completionId) {
+        completionId = normalizeCompletionId(generateId())
+        if (!completionId) throw new Error('Invalid generated completion identity')
+      }
+      return completionId
+    },
+    freezePayload(value: CompletionPayload) {
+      if (!completionId) throw new Error('Completion identity required')
+      if (!payload) payload = Object.freeze({ ...value,
+        answers: Object.freeze(value.answers.map(({ q, a }) => Object.freeze({ q, a }))),
+      })
+      return payload
+    },
+    acceptSaved(value: unknown) {
+      if (!value || typeof value !== 'object') return false
+      const response = value as Record<string, unknown>
+      const id = normalizeCompletionId(response.id)
+      if (!id || id !== completionId ||
+        (response.replayed !== undefined && typeof response.replayed !== 'boolean')) return false
+      savedId = id
+      return true
+    },
+    get completionId() { return completionId },
+    get payload() { return payload },
+    get savedId() { return savedId },
+    reset() { completionId = null; payload = null; savedId = null },
+  }
+}
```

### lib/interviews/interview-completion-state.test.cjs

```diff
diff --git a/lib/interviews/interview-completion-state.test.cjs b/lib/interviews/interview-completion-state.test.cjs
new file mode 100644
index 0000000..1504bb7
--- /dev/null
+++ b/lib/interviews/interview-completion-state.test.cjs
@@ -0,0 +1,20 @@
+const { test } = require('node:test')
+const assert = require('node:assert/strict')
+const fs = require('node:fs')
+const { load, uuid } = require('./history-test-helpers.cjs')
+const { createInterviewCompletionState, normalizeCompletionId } = load('lib/interviews/interview-completion-state.ts', {})
+const payload = () => ({ interviewerKey:'f', role:'Engineer', company:'Example', level:'mid',
+  interviewType:'technical', persona:'formal', language:'en', answers:[{q:'Q',a:'A'}],
+  score:80, summary:'Summary', durationSeconds:60 })
+function setup() { let calls=0; const state=createInterviewCompletionState(()=>{calls++;return uuid(1)}); return {state,calls:()=>calls} }
+test('nonempty intent generates one UUID and retry reuses it',()=>{const h=setup();assert.equal(h.state.begin(payload().answers),uuid(1));assert.equal(h.state.begin(payload().answers),uuid(1));assert.equal(h.calls(),1)})
+test('zero answers generate no identity',()=>{const h=setup();assert.equal(h.state.begin([]),null);assert.equal(h.calls(),0)})
+test('payload is deeply frozen once and preserves object identity',()=>{const {state}=setup();state.begin(payload().answers);const p=state.freezePayload(payload());assert.ok(Object.isFrozen(p));assert.ok(Object.isFrozen(p.answers));assert.ok(Object.isFrozen(p.answers[0]));assert.strictEqual(state.freezePayload({...payload(),score:1}),p)})
+test('live mutation cannot alter answers or duration',()=>{const {state}=setup(),live=payload();state.begin(live.answers);state.freezePayload(live);live.answers[0].a='Changed';live.answers.push({q:'New',a:'New'});live.durationSeconds=99;assert.equal(state.payload.answers.length,1);assert.equal(state.payload.answers[0].a,'A');assert.equal(state.payload.durationSeconds,60)})
+test('evaluation failure leaves identity available with no payload',()=>{const {state}=setup();state.begin(payload().answers);assert.equal(state.payload,null);assert.equal(state.begin(payload().answers),uuid(1));assert.ok(state.freezePayload(payload()))})
+test('POST failure does not discard frozen intent',()=>{const {state}=setup();state.begin(payload().answers);const p=state.freezePayload(payload());assert.equal(state.begin([{q:'Other',a:'Other'}]),uuid(1));assert.strictEqual(state.payload,p)})
+test('success retains matching saved ID with optional replay flag',()=>{const {state}=setup();state.begin(payload().answers);assert.ok(state.acceptSaved({id:uuid(1),replayed:true}));assert.equal(state.savedId,uuid(1));assert.ok(state.acceptSaved({id:uuid(1)}))})
+for(const response of [{id:uuid(2)},{id:'bad'},{id:uuid(1),replayed:'true'},null]) test('invalid saved response '+JSON.stringify(response),()=>{const {state}=setup();state.begin(payload().answers);assert.equal(state.acceptSaved(response),false);assert.equal(state.savedId,null)})
+test('reset clears identity payload and saved ID',()=>{const {state}=setup();state.begin(payload().answers);state.freezePayload(payload());state.acceptSaved({id:uuid(1)});state.reset();assert.equal(state.completionId,null);assert.equal(state.payload,null);assert.equal(state.savedId,null)})
+test('UUID validation requires v4 and normalizes case',()=>{assert.equal(normalizeCompletionId(uuid(10).toUpperCase()),uuid(10));for(const value of [undefined,12,' '+uuid(1),uuid(1).replace('-4000-','-1000-')]) assert.equal(normalizeCompletionId(value),null)})
+test('helper has no browser storage',()=>{assert.doesNotMatch(fs.readFileSync(require('node:path').join(__dirname,'interview-completion-state.ts'),'utf8'),/localStorage|sessionStorage/)})
```

### lib/interviews/persist-owned-interview.ts

```diff
diff --git a/lib/interviews/persist-owned-interview.ts b/lib/interviews/persist-owned-interview.ts
new file mode 100644
index 0000000..f69fc99
--- /dev/null
+++ b/lib/interviews/persist-owned-interview.ts
@@ -0,0 +1,55 @@
+import 'server-only'
+
+import { createAdminClient } from '@/lib/supabase/admin'
+import type { CompletionPayload } from './interview-completion-state'
+
+export type PersistenceResult =
+  | { status: 'saved'; id: string; replayed: boolean }
+  | { status: 'conflict' }
+  | { status: 'error' }
+
+export function isPrimaryKeyConflict(error: { code: string; message: string }) {
+  return error.code === '23505' &&
+    /unique constraint "interviews_pkey"/.test(error.message)
+}
+
+export async function persistOwnedInterview(
+  ownerId: string, completionId: string, payload: CompletionPayload,
+): Promise<PersistenceResult> {
+  const row = {
+    interviewer_key: payload.interviewerKey, role: payload.role, company: payload.company,
+    level: payload.level, interview_type: payload.interviewType, persona: payload.persona,
+    language: payload.language, answers: payload.answers.map(({ q, a }) => ({ q, a })),
+    score: payload.score, summary: payload.summary, duration_seconds: payload.durationSeconds,
+  }
+  try {
+    const admin = createAdminClient()
+    const inserted = await admin.from('interviews')
+      .insert({ ...row, id: completionId, owner_id: ownerId }).select('id').single()
+    if (!inserted.error) {
+      return inserted.data?.id === completionId
+        ? { status: 'saved', id: completionId, replayed: false } : { status: 'error' }
+    }
+    if (!isPrimaryKeyConflict(inserted.error)) return { status: 'error' }
+    const existing = await admin.from('interviews')
+      .select('id, interviewer_key, role, company, level, interview_type, persona, language, answers, score, summary, duration_seconds')
+      .eq('id', completionId).eq('owner_id', ownerId).maybeSingle()
+    if (existing.error) return { status: 'error' }
+    if (!existing.data || existing.data.id !== completionId) return { status: 'conflict' }
+    const fields = ['interviewer_key', 'role', 'company', 'level', 'interview_type',
+      'persona', 'language', 'score', 'summary', 'duration_seconds'] as const
+    const answers: unknown = existing.data.answers
+    const sameAnswers = Array.isArray(answers) && answers.length === row.answers.length &&
+      answers.every((value: unknown, index: number) => {
+        if (!value || typeof value !== 'object') return false
+        const answer = value as Record<string, unknown>
+        return answer.q === row.answers[index].q && answer.a === row.answers[index].a
+      })
+    if (!sameAnswers || !fields.every(field => existing.data[field] === row[field])) {
+      return { status: 'conflict' }
+    }
+    return { status: 'saved', id: completionId, replayed: true }
+  } catch {
+    return { status: 'error' }
+  }
+}
```

### lib/interviews/persist-owned-interview.test.cjs

```diff
diff --git a/lib/interviews/persist-owned-interview.test.cjs b/lib/interviews/persist-owned-interview.test.cjs
new file mode 100644
index 0000000..b33650a
--- /dev/null
+++ b/lib/interviews/persist-owned-interview.test.cjs
@@ -0,0 +1,43 @@
+const { test } = require('node:test')
+const assert = require('node:assert/strict')
+const { NextResponse } = require('next/server')
+const { load, plain, uuid, cursor } = require('./history-test-helpers.cjs')
+const identity = load('lib/interviews/interview-completion-state.ts', {})
+const payload = () => ({ interviewerKey:'f',role:'Engineer',company:'Example',level:'mid',interviewType:'technical',persona:'formal',language:'en',answers:[{q:'Q1',a:'A1'},{q:'Q2',a:'A2'}],score:80,summary:'Summary',durationSeconds:60 })
+const unique = {code:'23505',message:'duplicate key value violates unique constraint "interviews_pkey"'}
+function harness(options={}) {
+  const rows=new Map(),calls=[]
+  const admin={from(table){assert.equal(table,'interviews');let inserted,filters=[];return {
+    insert(row){calls.push(['insert',plain(row)]);inserted=plain(row);return this},
+    select(fields){calls.push(['select',fields]);return this},
+    eq(key,value){filters.push([key,value]);calls.push(['eq',key,value]);return this},
+    async single(){await Promise.resolve();if(options.throwInsert)throw Error('DB');if(options.insertError)return {error:options.insertError,data:null};if(rows.has(inserted.id))return {error:unique,data:null};rows.set(inserted.id,inserted);return {data:{id:inserted.id},error:null}},
+    async maybeSingle(){if(options.readError)return {data:null,error:{code:'DB'}};const row=[...rows.values()].find(row=>filters.every(([key,value])=>row[key]===value));return {data:row||null,error:null}},
+  }}}
+  const helper=load('lib/interviews/persist-owned-interview.ts',{'server-only':{},'@/lib/supabase/admin':{createAdminClient:()=>admin}})
+  const route=load('app/api/interviews/route.ts',{'next/server':{NextResponse},'@/lib/auth/get-authenticated-user':{async getAuthenticatedUser(){calls.push(['auth']);return options.unauthorized?{status:'unauthorized'}:{status:'authenticated',user:{id:'owner-a'}}}},'@/lib/supabase/admin':{createAdminClient:()=>admin},'@/lib/interviews/history-cursor':cursor,'@/lib/interviews/interview-completion-state':identity,'@/lib/interviews/persist-owned-interview':helper})
+  return {rows,calls,...helper,async post(body={completionId:uuid(1),...payload()},invalidJson=false){return route.POST({async json(){calls.push(['json']);if(invalidJson)throw Error('JSON');return body}})}}
+}
+// Shared only with the approved page suite; all imports are isolated and no network is used.
+module.exports={harness,payload,unique}
+if (require.main === module) {
+test('first insert and matching replay keep one row and return same ID',async()=>{const h=harness();assert.deepEqual(plain(await h.persistOwnedInterview('owner-a',uuid(1),payload())),{status:'saved',id:uuid(1),replayed:false});assert.deepEqual(plain(await h.persistOwnedInterview('owner-a',uuid(1),payload())),{status:'saved',id:uuid(1),replayed:true});assert.equal(h.rows.size,1);assert.equal(h.calls[0][0],'insert');assert.equal(h.rows.get(uuid(1)).owner_id,'owner-a');assert.ok(h.calls.some(c=>c[0]==='eq'&&c[1]==='owner_id'&&c[2]==='owner-a'))})
+for(const field of ['interviewerKey','role','company','level','interviewType','persona','language','score','summary','durationSeconds','answers']) test('conflicting '+field+' rejects without overwrite',async()=>{const h=harness();await h.persistOwnedInterview('owner-a',uuid(1),payload());const before=plain(h.rows.get(uuid(1))),p=payload();p[field]=field==='answers'?[{q:'Changed',a:'A'}]:typeof p[field]==='number'?81:'Changed';assert.equal((await h.persistOwnedInterview('owner-a',uuid(1),p)).status,'conflict');assert.deepEqual(h.rows.get(uuid(1)),before)})
+test('foreign collision returns no foreign fields',async()=>{const h=harness();await h.persistOwnedInterview('owner-b',uuid(1),payload());assert.deepEqual(plain(await h.persistOwnedInterview('owner-a',uuid(1),payload())),{status:'conflict'});assert.equal(h.rows.size,1)})
+for(const error of [{code:'500',message:'failed'},{code:'23505',message:'unique constraint "other_key"'},{code:'23505',message:'unknown'}]) test('unrelated DB error '+error.message+' does not recover',async()=>{const h=harness({insertError:error});assert.equal((await h.persistOwnedInterview('owner-a',uuid(1),payload())).status,'error');assert.equal(h.calls.some(c=>c[0]==='eq'),false)})
+test('recovery read failure is persistence error',async()=>{const h=harness({readError:true});await h.persistOwnedInterview('owner-a',uuid(1),payload());assert.equal((await h.persistOwnedInterview('owner-a',uuid(1),payload())).status,'error')})
+test('recognized conflict with unavailable row stays generic conflict',async()=>{const h=harness({insertError:unique});assert.equal((await h.persistOwnedInterview('owner-a',uuid(1),payload())).status,'conflict')})
+test('thrown DB error is bounded',async()=>{const h=harness({throwInsert:true});assert.equal((await h.persistOwnedInterview('owner-a',uuid(1),payload())).status,'error')})
+test('different identities permit identical records',async()=>{const h=harness();await h.persistOwnedInterview('owner-a',uuid(1),payload());await h.persistOwnedInterview('owner-a',uuid(2),payload());assert.equal(h.rows.size,2)})
+test('answer order matters and property order does not',async()=>{const h=harness();await h.persistOwnedInterview('owner-a',uuid(1),payload());const p=payload();p.answers=p.answers.map(({q,a})=>({a,q}));assert.equal((await h.persistOwnedInterview('owner-a',uuid(1),p)).replayed,true);p.answers.reverse();assert.equal((await h.persistOwnedInterview('owner-a',uuid(1),p)).status,'conflict')})
+test('controlled concurrent inserts return one insert one replay',async()=>{const h=harness();const results=await Promise.all([h.persistOwnedInterview('owner-a',uuid(1),payload()),h.persistOwnedInterview('owner-a',uuid(1),payload())]);assert.equal(h.rows.size,1);assert.deepEqual(results.map(r=>r.replayed).sort(),[false,true])})
+async function check(response,status,body){assert.equal(response.status,status);assert.deepEqual(await response.json(),body);assert.equal(response.headers.get('Cache-Control'),'private, no-store')}
+test('route auth precedes JSON and unauthorized touches no database',async()=>{const h=harness({unauthorized:true});await check(await h.post(),401,{error:'Unauthorized'});assert.deepEqual(h.calls,[['auth']])})
+test('route invalid JSON preserves contract',async()=>{await check(await harness().post({},true),400,{error:'Invalid JSON body'})})
+for(const completionId of [undefined,'bad',uuid(1).replace('-4000-','-1000-')]) test('route rejects identity '+completionId,async()=>{const h=harness();await check(await h.post({...payload(),completionId}),400,{error:'Invalid completion identity'});assert.equal(h.rows.size,0)})
+test('route rejects invalid payload',async()=>{await check(await harness().post({completionId:uuid(1)}),400,{error:'Invalid interview payload'})})
+test('route first replay conflict and client owner isolation',async()=>{const h=harness(),body={completionId:uuid(1),...payload(),owner_id:'foreign'};await check(await h.post(body),201,{id:uuid(1),replayed:false});await check(await h.post(body),200,{id:uuid(1),replayed:true});await check(await h.post({...body,score:1}),409,{error:'Completion conflict'});assert.equal(h.rows.get(uuid(1)).owner_id,'owner-a');assert.deepEqual(h.calls.slice(0,2),[['auth'],['json']])})
+test('route foreign collision has identical generic conflict body',async()=>{const h=harness();await h.persistOwnedInterview('foreign',uuid(1),payload());await check(await h.post(),409,{error:'Completion conflict'})})
+test('route DB and recovery errors are generic 500',async()=>{await check(await harness({insertError:{code:'DB',message:'private'}}).post(),500,{error:'Failed to save interview'});const h=harness({readError:true});await h.post();await check(await h.post(),500,{error:'Failed to save interview'})})
+
+}
```

### docs/04_Project_Memory/CURRENT_STATE.md

```diff
diff --git a/docs/04_Project_Memory/CURRENT_STATE.md b/docs/04_Project_Memory/CURRENT_STATE.md
index 26c61a5..e9a3db0 100644
--- a/docs/04_Project_Memory/CURRENT_STATE.md
+++ b/docs/04_Project_Memory/CURRENT_STATE.md
@@ -2,6 +2,56 @@

 Last updated: 2026-10-06

+## COMPLETION_IDEMPOTENCY_01 — Acceptance closure — 2026-10-06
+
+- **IMPLEMENTATION + AUTOMATED VALIDATION + LOCAL FIRST-SAVE BROWSER ACCEPTANCE: PASS**.
+- Current stage: **UNCOMMITTED / pending final Git closure**. Acceptance evidence is complete; documentation/final pre-commit review remains pending. No stage commit hash is asserted.
+- INTERVIEW_RELIABILITY_01: **complete / committed / pushed**. Safe committed recovery point before this stage: `229faf678c22f2ed89497fc3a97ae3b477eafba5` (`fix(interview): harden session transitions`). Pushed status includes user-provided closure evidence; no fetch performed here.
+- Branch: `feature/auth-foundation`.
+- Next roadmap stage AFTER Git closure: **ROUTE_INPUT_HARDENING_01 — planned / NOT STARTED / NOT IMPLEMENTED / NOT YET AUTHORIZED**. No automatic next-stage authority.
+
+### Completed bounded persistence decision
+
+One browser-generated UUID v4 `completionId` per nonempty completion intent is persisted directly as existing `interviews.id`. No schema migration or dependency. Insert-first persistence uses the existing primary key; no read-before-insert or upsert overwrite. Only PostgreSQL `23505` naming `interviews_pkey` enters replay recovery. Recovery reads both `id = completionId` and `owner_id = authenticated server-derived owner`. Matching persisted content returns the same ID: first insert `201 { id, replayed: false }`, matching replay `200 { id, replayed: true }`. Conflicting content or unavailable identity returns generic `409 { error: "Completion conflict" }`; no overwrite or foreign row/details returned. The client never supplies trusted ownership. POST validates required UUID v4 identity and sets `Cache-Control: private, no-store`; GET behavior is preserved.
+
+Client persistence payload freezes once after valid evaluation, including ordered submitted answers, metadata, score/summary and duration. After POST attempt, explicit retry uses the same identity and frozen payload; evaluation is not rerun, duration not recalculated, and changed live answers do not replace the original intent. Returned ID must validate and equal completionId. A known saved ID supports navigation-only retry. State is in-memory and resets on session disposal/new lifecycle. Zero answers create no identity, evaluation, save or Result and retain the existing warning/session behavior. Partial completion includes only submitted answers.
+
+### Recorded automated validation — not rerun in this documentation turn
+
+- Completion-state tests: **14/14 PASS**, exit 0.
+- Persistence/helper/route tests: **31/31 PASS**, exit 0.
+- Session/page tests: **55/55 PASS**, exit 0.
+- Relevant regressions (detail reads, deletion, pagination, History loading, Result deletion and PDF): **96/96 PASS**, exit 0.
+- TypeScript and implementation `git diff --check`: **PASS**, exit 0.
+- Production build: **PASS**, exit 0; **22/22** generated pages. Dev-server process recheck found zero matching repository dev processes before build; dev server was not restarted.
+- Two webpack dependency-cache snapshot warnings, npm update notice and informational Git LF-to-CRLF notice were recorded. No product regression established by those warnings.
+
+### Primary deterministic response-loss evidence
+
+One identity X and frozen payload P: final evaluation executes once; the actual POST route/helper against a stateful persistence double commits row X/P; the client experiences a lost response. Explicit retry retains X/P and frozen duration, skips reevaluation, recovers the matching original row, returns original ID X, creates no second logical row and navigates to `/result/X`. This is automated/deterministic PASS, not a browser replay claim.
+
+Same-ID replay, no duplicate logical row, `replayed: true`, controlled concurrent application requests, conflicting replay, foreign-owner collision, wrong returned-ID rejection, immutable payload/duration and no reevaluation are automated-only evidence. Actual PostgreSQL concurrency integration was NOT run. Race safety relies on the repository migration's UUID PRIMARY KEY definition and deployed-model assumption; no real/test Supabase concurrency writes were performed.
+
+### User-verified browser first-save acceptance
+
+User completed one ordinary interview through the current application. Network showed POST `/api/interviews`, **201**, `replayed: false`. User manually compared request completionId, response id and Result URL id: **all three UUID values identical**. **FIRST-SAVE IDENTITY CONTRACT: PASS**. Actual UUID is unnecessary and omitted. This is user-verified evidence, not an agent-performed browser run in this documentation turn.
+
+No deliberate live response-loss/duplicate replay was performed against real Supabase: the central replay behavior is proven deterministically, and forced live failure/replay would add unnecessary real-data risk.
+
+### History qualification
+
+**HISTORY_PAGINATION_01: NATURAL-RECORD DEFERRED ACCEPTANCE**. Historical directly verified baseline: **11 records on 2026-10-06**. INTERVIEW_RELIABILITY_01 later created one natural persisted interview; COMPLETION_IDEMPOTENCY_01 browser acceptance created one additional ordinary/natural persisted interview. Neither is synthetic. History was not re-queried/recounted after those writes; no current verified total is asserted. No synthetic seeding; natural 21+ acceptance remains deferred.
+
+### Accepted remaining boundaries
+
+- Completion state is in-memory only; refresh/tab close loses retry identity/state. Cross-refresh recovery belongs to SESSION_RESUME_01.
+- Hard deletion removes the row supplying replay evidence. Indefinite replay protection after deletion requires a separate tombstone/retention product decision.
+- Actual PostgreSQL concurrency integration was not performed; deployed-schema parity remains later environment/release verification.
+- Provider security/privacy and scoring trust remain later roadmap work.
+- After failed save, retry targets the original frozen intent even if live answers change; no automatic second identity is created.
+
+These qualifications do not block local closure. Existing reliability state-machine protection and approved zero/partial behavior remain preserved. No History/Result/PDF/Profile/Auth implementation, schema, dependency or configuration changes. This entry supersedes earlier pending idempotency/reliability Git status only; historical entries/reports remain unchanged. No staging, commit, push, Supabase mutation, browser rerun, tests/build rerun or next-stage implementation in this documentation turn.
+
 ## INTERVIEW_RELIABILITY_01 — Current acceptance checkpoint — 2026-10-06

 ### Current roadmap progress and Git boundary
```

### docs/04_Project_Memory/STAGE_LOG.md

```diff
diff --git a/docs/04_Project_Memory/STAGE_LOG.md b/docs/04_Project_Memory/STAGE_LOG.md
index 1673b32..b4758dc 100644
--- a/docs/04_Project_Memory/STAGE_LOG.md
+++ b/docs/04_Project_Memory/STAGE_LOG.md
@@ -1990,3 +1990,53 @@ Immediate double-submit handler race; submit + End same-callback race; submit +
 - No synthetic pagination seeding; natural-record acceptance policy remains unchanged.

 Approved implementation inventory: three modified files (app/interview/page.tsx, components/interview/InterviewWorkspace.tsx, components/interview/LiveInterviewControls.tsx) and two new files (lib/interviews/interview-session-state.ts, lib/interviews/interview-session-state.test.cjs). Documentation closure adds two new sprint reports and updates four Project Memory files. No API/schema/auth/history/result/profile/PDF/config/dependency changes. This append-only entry supersedes older planning status, not historical records.
+
+## COMPLETION_IDEMPOTENCY_01 — Acceptance closure — 2026-10-06
+
+- **IMPLEMENTATION + AUTOMATED VALIDATION + LOCAL FIRST-SAVE BROWSER ACCEPTANCE: PASS**.
+- Current stage: **UNCOMMITTED / pending final Git closure**. Acceptance evidence is complete; documentation/final pre-commit review remains pending. No stage commit hash is asserted.
+- INTERVIEW_RELIABILITY_01: **complete / committed / pushed**. Safe committed recovery point before this stage: `229faf678c22f2ed89497fc3a97ae3b477eafba5` (`fix(interview): harden session transitions`). Pushed status includes user-provided closure evidence; no fetch performed here.
+- Branch: `feature/auth-foundation`.
+- Next roadmap stage AFTER Git closure: **ROUTE_INPUT_HARDENING_01 — planned / NOT STARTED / NOT IMPLEMENTED / NOT YET AUTHORIZED**. No automatic next-stage authority.
+
+### Completed bounded persistence decision
+
+One browser-generated UUID v4 `completionId` per nonempty completion intent is persisted directly as existing `interviews.id`. No schema migration or dependency. Insert-first persistence uses the existing primary key; no read-before-insert or upsert overwrite. Only PostgreSQL `23505` naming `interviews_pkey` enters replay recovery. Recovery reads both `id = completionId` and `owner_id = authenticated server-derived owner`. Matching persisted content returns the same ID: first insert `201 { id, replayed: false }`, matching replay `200 { id, replayed: true }`. Conflicting content or unavailable identity returns generic `409 { error: "Completion conflict" }`; no overwrite or foreign row/details returned. The client never supplies trusted ownership. POST validates required UUID v4 identity and sets `Cache-Control: private, no-store`; GET behavior is preserved.
+
+Client persistence payload freezes once after valid evaluation, including ordered submitted answers, metadata, score/summary and duration. After POST attempt, explicit retry uses the same identity and frozen payload; evaluation is not rerun, duration not recalculated, and changed live answers do not replace the original intent. Returned ID must validate and equal completionId. A known saved ID supports navigation-only retry. State is in-memory and resets on session disposal/new lifecycle. Zero answers create no identity, evaluation, save or Result and retain the existing warning/session behavior. Partial completion includes only submitted answers.
+
+### Recorded automated validation — not rerun in this documentation turn
+
+- Completion-state tests: **14/14 PASS**, exit 0.
+- Persistence/helper/route tests: **31/31 PASS**, exit 0.
+- Session/page tests: **55/55 PASS**, exit 0.
+- Relevant regressions (detail reads, deletion, pagination, History loading, Result deletion and PDF): **96/96 PASS**, exit 0.
+- TypeScript and implementation `git diff --check`: **PASS**, exit 0.
+- Production build: **PASS**, exit 0; **22/22** generated pages. Dev-server process recheck found zero matching repository dev processes before build; dev server was not restarted.
+- Two webpack dependency-cache snapshot warnings, npm update notice and informational Git LF-to-CRLF notice were recorded. No product regression established by those warnings.
+
+### Primary deterministic response-loss evidence
+
+One identity X and frozen payload P: final evaluation executes once; the actual POST route/helper against a stateful persistence double commits row X/P; the client experiences a lost response. Explicit retry retains X/P and frozen duration, skips reevaluation, recovers the matching original row, returns original ID X, creates no second logical row and navigates to `/result/X`. This is automated/deterministic PASS, not a browser replay claim.
+
+Same-ID replay, no duplicate logical row, `replayed: true`, controlled concurrent application requests, conflicting replay, foreign-owner collision, wrong returned-ID rejection, immutable payload/duration and no reevaluation are automated-only evidence. Actual PostgreSQL concurrency integration was NOT run. Race safety relies on the repository migration's UUID PRIMARY KEY definition and deployed-model assumption; no real/test Supabase concurrency writes were performed.
+
+### User-verified browser first-save acceptance
+
+User completed one ordinary interview through the current application. Network showed POST `/api/interviews`, **201**, `replayed: false`. User manually compared request completionId, response id and Result URL id: **all three UUID values identical**. **FIRST-SAVE IDENTITY CONTRACT: PASS**. Actual UUID is unnecessary and omitted. This is user-verified evidence, not an agent-performed browser run in this documentation turn.
+
+No deliberate live response-loss/duplicate replay was performed against real Supabase: the central replay behavior is proven deterministically, and forced live failure/replay would add unnecessary real-data risk.
+
+### History qualification
+
+**HISTORY_PAGINATION_01: NATURAL-RECORD DEFERRED ACCEPTANCE**. Historical directly verified baseline: **11 records on 2026-10-06**. INTERVIEW_RELIABILITY_01 later created one natural persisted interview; COMPLETION_IDEMPOTENCY_01 browser acceptance created one additional ordinary/natural persisted interview. Neither is synthetic. History was not re-queried/recounted after those writes; no current verified total is asserted. No synthetic seeding; natural 21+ acceptance remains deferred.
+
+### Accepted remaining boundaries
+
+- Completion state is in-memory only; refresh/tab close loses retry identity/state. Cross-refresh recovery belongs to SESSION_RESUME_01.
+- Hard deletion removes the row supplying replay evidence. Indefinite replay protection after deletion requires a separate tombstone/retention product decision.
+- Actual PostgreSQL concurrency integration was not performed; deployed-schema parity remains later environment/release verification.
+- Provider security/privacy and scoring trust remain later roadmap work.
+- After failed save, retry targets the original frozen intent even if live answers change; no automatic second identity is created.
+
+These qualifications do not block local closure. Existing reliability state-machine protection and approved zero/partial behavior remain preserved. No History/Result/PDF/Profile/Auth implementation, schema, dependency or configuration changes. This entry supersedes earlier pending idempotency/reliability Git status only; historical entries/reports remain unchanged. No staging, commit, push, Supabase mutation, browser rerun, tests/build rerun or next-stage implementation in this documentation turn.
```

### docs/04_Project_Memory/DEFERRED_FIXES.md

```diff
diff --git a/docs/04_Project_Memory/DEFERRED_FIXES.md b/docs/04_Project_Memory/DEFERRED_FIXES.md
index d6d53ad..e86e017 100644
--- a/docs/04_Project_Memory/DEFERRED_FIXES.md
+++ b/docs/04_Project_Memory/DEFERRED_FIXES.md
@@ -1087,3 +1087,53 @@ In-session duplicate submission, transition/completion overlap, premature ordina
 Immediate double-submit handler race; submit + End same-callback race; submit + Skip overlap; stale feedback/question continuations after completion; obsolete TTS continuation after completion; disposal/unmount invalidation; immutable completion snapshot mutation attacks; synchronous handler rejection independent of UI paint; and one-completion-attempt admission remain automated/deterministic coverage, not browser-tested claims.

 HISTORY_PAGINATION_01: NATURAL-RECORD DEFERRED ACCEPTANCE; directly verified historical baseline 11 on 2026-10-06. One natural persisted acceptance interview created afterward; History not re-counted, no new verified total. Second recovery session not completed; no saved second record claimed. No synthetic seeding. Deployed PDF smoke and previous wrong-owner live DELETE qualification remain unchanged. Earlier pending reliability planning is superseded only within the approved in-session boundaries.
+
+## COMPLETION_IDEMPOTENCY_01 — Acceptance closure — 2026-10-06
+
+- **IMPLEMENTATION + AUTOMATED VALIDATION + LOCAL FIRST-SAVE BROWSER ACCEPTANCE: PASS**.
+- Current stage: **UNCOMMITTED / pending final Git closure**. Acceptance evidence is complete; documentation/final pre-commit review remains pending. No stage commit hash is asserted.
+- INTERVIEW_RELIABILITY_01: **complete / committed / pushed**. Safe committed recovery point before this stage: `229faf678c22f2ed89497fc3a97ae3b477eafba5` (`fix(interview): harden session transitions`). Pushed status includes user-provided closure evidence; no fetch performed here.
+- Branch: `feature/auth-foundation`.
+- Next roadmap stage AFTER Git closure: **ROUTE_INPUT_HARDENING_01 — planned / NOT STARTED / NOT IMPLEMENTED / NOT YET AUTHORIZED**. No automatic next-stage authority.
+
+### Completed bounded persistence decision
+
+One browser-generated UUID v4 `completionId` per nonempty completion intent is persisted directly as existing `interviews.id`. No schema migration or dependency. Insert-first persistence uses the existing primary key; no read-before-insert or upsert overwrite. Only PostgreSQL `23505` naming `interviews_pkey` enters replay recovery. Recovery reads both `id = completionId` and `owner_id = authenticated server-derived owner`. Matching persisted content returns the same ID: first insert `201 { id, replayed: false }`, matching replay `200 { id, replayed: true }`. Conflicting content or unavailable identity returns generic `409 { error: "Completion conflict" }`; no overwrite or foreign row/details returned. The client never supplies trusted ownership. POST validates required UUID v4 identity and sets `Cache-Control: private, no-store`; GET behavior is preserved.
+
+Client persistence payload freezes once after valid evaluation, including ordered submitted answers, metadata, score/summary and duration. After POST attempt, explicit retry uses the same identity and frozen payload; evaluation is not rerun, duration not recalculated, and changed live answers do not replace the original intent. Returned ID must validate and equal completionId. A known saved ID supports navigation-only retry. State is in-memory and resets on session disposal/new lifecycle. Zero answers create no identity, evaluation, save or Result and retain the existing warning/session behavior. Partial completion includes only submitted answers.
+
+### Recorded automated validation — not rerun in this documentation turn
+
+- Completion-state tests: **14/14 PASS**, exit 0.
+- Persistence/helper/route tests: **31/31 PASS**, exit 0.
+- Session/page tests: **55/55 PASS**, exit 0.
+- Relevant regressions (detail reads, deletion, pagination, History loading, Result deletion and PDF): **96/96 PASS**, exit 0.
+- TypeScript and implementation `git diff --check`: **PASS**, exit 0.
+- Production build: **PASS**, exit 0; **22/22** generated pages. Dev-server process recheck found zero matching repository dev processes before build; dev server was not restarted.
+- Two webpack dependency-cache snapshot warnings, npm update notice and informational Git LF-to-CRLF notice were recorded. No product regression established by those warnings.
+
+### Primary deterministic response-loss evidence
+
+One identity X and frozen payload P: final evaluation executes once; the actual POST route/helper against a stateful persistence double commits row X/P; the client experiences a lost response. Explicit retry retains X/P and frozen duration, skips reevaluation, recovers the matching original row, returns original ID X, creates no second logical row and navigates to `/result/X`. This is automated/deterministic PASS, not a browser replay claim.
+
+Same-ID replay, no duplicate logical row, `replayed: true`, controlled concurrent application requests, conflicting replay, foreign-owner collision, wrong returned-ID rejection, immutable payload/duration and no reevaluation are automated-only evidence. Actual PostgreSQL concurrency integration was NOT run. Race safety relies on the repository migration's UUID PRIMARY KEY definition and deployed-model assumption; no real/test Supabase concurrency writes were performed.
+
+### User-verified browser first-save acceptance
+
+User completed one ordinary interview through the current application. Network showed POST `/api/interviews`, **201**, `replayed: false`. User manually compared request completionId, response id and Result URL id: **all three UUID values identical**. **FIRST-SAVE IDENTITY CONTRACT: PASS**. Actual UUID is unnecessary and omitted. This is user-verified evidence, not an agent-performed browser run in this documentation turn.
+
+No deliberate live response-loss/duplicate replay was performed against real Supabase: the central replay behavior is proven deterministically, and forced live failure/replay would add unnecessary real-data risk.
+
+### History qualification
+
+**HISTORY_PAGINATION_01: NATURAL-RECORD DEFERRED ACCEPTANCE**. Historical directly verified baseline: **11 records on 2026-10-06**. INTERVIEW_RELIABILITY_01 later created one natural persisted interview; COMPLETION_IDEMPOTENCY_01 browser acceptance created one additional ordinary/natural persisted interview. Neither is synthetic. History was not re-queried/recounted after those writes; no current verified total is asserted. No synthetic seeding; natural 21+ acceptance remains deferred.
+
+### Accepted remaining boundaries
+
+- Completion state is in-memory only; refresh/tab close loses retry identity/state. Cross-refresh recovery belongs to SESSION_RESUME_01.
+- Hard deletion removes the row supplying replay evidence. Indefinite replay protection after deletion requires a separate tombstone/retention product decision.
+- Actual PostgreSQL concurrency integration was not performed; deployed-schema parity remains later environment/release verification.
+- Provider security/privacy and scoring trust remain later roadmap work.
+- After failed save, retry targets the original frozen intent even if live answers change; no automatic second identity is created.
+
+These qualifications do not block local closure. Existing reliability state-machine protection and approved zero/partial behavior remain preserved. No History/Result/PDF/Profile/Auth implementation, schema, dependency or configuration changes. This entry supersedes earlier pending idempotency/reliability Git status only; historical entries/reports remain unchanged. No staging, commit, push, Supabase mutation, browser rerun, tests/build rerun or next-stage implementation in this documentation turn.
```

### docs/04_Project_Memory/DECISIONS_AND_RISKS.md

```diff
diff --git a/docs/04_Project_Memory/DECISIONS_AND_RISKS.md b/docs/04_Project_Memory/DECISIONS_AND_RISKS.md
index 04120dd..a4cab51 100644
--- a/docs/04_Project_Memory/DECISIONS_AND_RISKS.md
+++ b/docs/04_Project_Memory/DECISIONS_AND_RISKS.md
@@ -1774,3 +1774,53 @@ Immediate double-submit handler race; submit + End same-callback race; submit +
 - No synthetic pagination seeding; natural-record acceptance policy remains unchanged.

 History natural-record policy preserved: historical directly verified 11-record baseline on 2026-10-06; one natural persisted acceptance interview afterward; no re-count or new verified total. Second session not completed, no second persisted record claimed. No synthetic seeding. Existing frozen foundations and prior deployed PDF/wrong-owner live DELETE qualifications remain protected.
+
+## COMPLETION_IDEMPOTENCY_01 — Acceptance closure — 2026-10-06
+
+- **IMPLEMENTATION + AUTOMATED VALIDATION + LOCAL FIRST-SAVE BROWSER ACCEPTANCE: PASS**.
+- Current stage: **UNCOMMITTED / pending final Git closure**. Acceptance evidence is complete; documentation/final pre-commit review remains pending. No stage commit hash is asserted.
+- INTERVIEW_RELIABILITY_01: **complete / committed / pushed**. Safe committed recovery point before this stage: `229faf678c22f2ed89497fc3a97ae3b477eafba5` (`fix(interview): harden session transitions`). Pushed status includes user-provided closure evidence; no fetch performed here.
+- Branch: `feature/auth-foundation`.
+- Next roadmap stage AFTER Git closure: **ROUTE_INPUT_HARDENING_01 — planned / NOT STARTED / NOT IMPLEMENTED / NOT YET AUTHORIZED**. No automatic next-stage authority.
+
+### Completed bounded persistence decision
+
+One browser-generated UUID v4 `completionId` per nonempty completion intent is persisted directly as existing `interviews.id`. No schema migration or dependency. Insert-first persistence uses the existing primary key; no read-before-insert or upsert overwrite. Only PostgreSQL `23505` naming `interviews_pkey` enters replay recovery. Recovery reads both `id = completionId` and `owner_id = authenticated server-derived owner`. Matching persisted content returns the same ID: first insert `201 { id, replayed: false }`, matching replay `200 { id, replayed: true }`. Conflicting content or unavailable identity returns generic `409 { error: "Completion conflict" }`; no overwrite or foreign row/details returned. The client never supplies trusted ownership. POST validates required UUID v4 identity and sets `Cache-Control: private, no-store`; GET behavior is preserved.
+
+Client persistence payload freezes once after valid evaluation, including ordered submitted answers, metadata, score/summary and duration. After POST attempt, explicit retry uses the same identity and frozen payload; evaluation is not rerun, duration not recalculated, and changed live answers do not replace the original intent. Returned ID must validate and equal completionId. A known saved ID supports navigation-only retry. State is in-memory and resets on session disposal/new lifecycle. Zero answers create no identity, evaluation, save or Result and retain the existing warning/session behavior. Partial completion includes only submitted answers.
+
+### Recorded automated validation — not rerun in this documentation turn
+
+- Completion-state tests: **14/14 PASS**, exit 0.
+- Persistence/helper/route tests: **31/31 PASS**, exit 0.
+- Session/page tests: **55/55 PASS**, exit 0.
+- Relevant regressions (detail reads, deletion, pagination, History loading, Result deletion and PDF): **96/96 PASS**, exit 0.
+- TypeScript and implementation `git diff --check`: **PASS**, exit 0.
+- Production build: **PASS**, exit 0; **22/22** generated pages. Dev-server process recheck found zero matching repository dev processes before build; dev server was not restarted.
+- Two webpack dependency-cache snapshot warnings, npm update notice and informational Git LF-to-CRLF notice were recorded. No product regression established by those warnings.
+
+### Primary deterministic response-loss evidence
+
+One identity X and frozen payload P: final evaluation executes once; the actual POST route/helper against a stateful persistence double commits row X/P; the client experiences a lost response. Explicit retry retains X/P and frozen duration, skips reevaluation, recovers the matching original row, returns original ID X, creates no second logical row and navigates to `/result/X`. This is automated/deterministic PASS, not a browser replay claim.
+
+Same-ID replay, no duplicate logical row, `replayed: true`, controlled concurrent application requests, conflicting replay, foreign-owner collision, wrong returned-ID rejection, immutable payload/duration and no reevaluation are automated-only evidence. Actual PostgreSQL concurrency integration was NOT run. Race safety relies on the repository migration's UUID PRIMARY KEY definition and deployed-model assumption; no real/test Supabase concurrency writes were performed.
+
+### User-verified browser first-save acceptance
+
+User completed one ordinary interview through the current application. Network showed POST `/api/interviews`, **201**, `replayed: false`. User manually compared request completionId, response id and Result URL id: **all three UUID values identical**. **FIRST-SAVE IDENTITY CONTRACT: PASS**. Actual UUID is unnecessary and omitted. This is user-verified evidence, not an agent-performed browser run in this documentation turn.
+
+No deliberate live response-loss/duplicate replay was performed against real Supabase: the central replay behavior is proven deterministically, and forced live failure/replay would add unnecessary real-data risk.
+
+### History qualification
+
+**HISTORY_PAGINATION_01: NATURAL-RECORD DEFERRED ACCEPTANCE**. Historical directly verified baseline: **11 records on 2026-10-06**. INTERVIEW_RELIABILITY_01 later created one natural persisted interview; COMPLETION_IDEMPOTENCY_01 browser acceptance created one additional ordinary/natural persisted interview. Neither is synthetic. History was not re-queried/recounted after those writes; no current verified total is asserted. No synthetic seeding; natural 21+ acceptance remains deferred.
+
+### Accepted remaining boundaries
+
+- Completion state is in-memory only; refresh/tab close loses retry identity/state. Cross-refresh recovery belongs to SESSION_RESUME_01.
+- Hard deletion removes the row supplying replay evidence. Indefinite replay protection after deletion requires a separate tombstone/retention product decision.
+- Actual PostgreSQL concurrency integration was not performed; deployed-schema parity remains later environment/release verification.
+- Provider security/privacy and scoring trust remain later roadmap work.
+- After failed save, retry targets the original frozen intent even if live answers change; no automatic second identity is created.
+
+These qualifications do not block local closure. Existing reliability state-machine protection and approved zero/partial behavior remain preserved. No History/Result/PDF/Profile/Auth implementation, schema, dependency or configuration changes. This entry supersedes earlier pending idempotency/reliability Git status only; historical entries/reports remain unchanged. No staging, commit, push, Supabase mutation, browser rerun, tests/build rerun or next-stage implementation in this documentation turn.
```

### docs/01_Engineering/Sprint_COMPLETION_IDEMPOTENCY_01_Summary.md

```diff
diff --git a/docs/01_Engineering/Sprint_COMPLETION_IDEMPOTENCY_01_Summary.md b/docs/01_Engineering/Sprint_COMPLETION_IDEMPOTENCY_01_Summary.md
new file mode 100644
index 0000000..8f425ff
--- /dev/null
+++ b/docs/01_Engineering/Sprint_COMPLETION_IDEMPOTENCY_01_Summary.md
@@ -0,0 +1,48 @@
+# Sprint COMPLETION_IDEMPOTENCY_01 Summary
+
+- Title: Stable completion persistence identity and owner-scoped replay recovery.
+- Date: 2026-10-06 (Europe/Istanbul).
+- Branch: feature/auth-foundation.
+- Safe committed base: `229faf678c22f2ed89497fc3a97ae3b477eafba5`.
+- Status: IMPLEMENTATION + AUTOMATED VALIDATION + LOCAL FIRST-SAVE BROWSER ACCEPTANCE: PASS; UNCOMMITTED / pending final Git closure.
+- Goal: prevent a second persisted interview when an earlier save committed but its response was lost/unusable.
+- Approval status: user-provided first-save browser acceptance PASS; documentation/final pre-commit review pending. No commit/push approval claimed.
+
+## Created files
+
+- `lib/interviews/interview-completion-state.ts`
+- `lib/interviews/interview-completion-state.test.cjs`
+- `lib/interviews/persist-owned-interview.ts`
+- `lib/interviews/persist-owned-interview.test.cjs`
+- `docs/01_Engineering/Sprint_COMPLETION_IDEMPOTENCY_01_Summary.md`
+- `docs/01_Engineering/Sprint_COMPLETION_IDEMPOTENCY_01_Engineering_Report.md`
+
+## Modified files
+
+- `app/api/interviews/route.ts`
+- `app/interview/page.tsx`
+- `lib/interviews/interview-session-state.test.cjs`
+- `docs/04_Project_Memory/CURRENT_STATE.md`
+- `docs/04_Project_Memory/STAGE_LOG.md`
+- `docs/04_Project_Memory/DEFERRED_FIXES.md`
+- `docs/04_Project_Memory/DECISIONS_AND_RISKS.md`
+
+## Completed behavior and evidence
+
+Browser-native UUID v4 completionId is stable for one nonempty intent and stored as existing interview ID. Evaluation output, metadata, submitted answers and duration freeze once. Save retry reuses that payload without reevaluation; returned ID must match. Server inserts first and uses the existing primary key, with owner-scoped recovery only for recognized interviews_pkey/23505 conflict. Matching replay returns original ID; conflicting/foreign unavailable identity returns generic 409 without overwrite/disclosure. No migration/dependency.
+
+Primary deterministic proof: first route/helper request commits X/P in a stateful double; client observes response loss; explicit retry sends X/P again, retains duration and one evaluation, recovers X with one logical row, and navigates to /result/X.
+
+User-verified ordinary browser completion: POST 201 / replayed false; request completionId, response id and Result URL ID all identical. Actual UUID omitted. No deliberate live replay/response-loss test. Concurrency, conflict, foreign collision and retry invariants remain automated evidence; actual PostgreSQL concurrency integration not run.
+
+## Validation results
+
+Recorded, not rerun here: completion-state 14/14; persistence/helper/route 31/31; session/page 55/55; relevant regressions 96/96, all exit 0. TypeScript and implementation whitespace PASS. Production build exit 0, 22/22 pages. Two webpack cache snapshot warnings, npm update notice, and informational LF-to-CRLF notice; no product regression established. Documentation validation: git diff --check PASS, exit 0; full scope/diff inspected. No tests/build/browser rerun.
+
+## Risks and qualifications
+
+In-memory only; refresh/tab close recovery deferred to SESSION_RESUME_01. Hard deletion removes replay evidence; indefinite protection needs separate tombstone/retention decision. Actual PostgreSQL concurrency integration and deployed-schema parity unverified. Provider security/privacy and scoring trust remain later work. Changed live answers do not replace a failed save's original frozen intent.
+
+HISTORY_PAGINATION_01 remains NATURAL-RECORD DEFERRED ACCEPTANCE. Historical verified baseline 11 on 2026-10-06; reliability acceptance added one natural persisted interview and this stage added one further natural interview. History not recounted; no current verified total. No synthetic seeding.
+
+Next after Git closure: ROUTE_INPUT_HARDENING_01, planned / NOT STARTED / NOT IMPLEMENTED / NOT YET AUTHORIZED. Stop for final review; no staging/commit/push authority.
```
