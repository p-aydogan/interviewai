# Sprint INTERVIEW_RELIABILITY_01 Engineering Report

## 1. Report Identity

- Date: 2026-10-06 (Europe/Istanbul); branch feature/auth-foundation.
- Status: IMPLEMENTATION + AUTOMATED VALIDATION + LOCAL BROWSER ACCEPTANCE: PASS; uncommitted, final pre-commit review pending.
- Safe committed base: 50e4da96e00a9f4c70979b5bada1ca71f3a68403. ROADMAP_FREEZE_01 is complete/committed/pushed per user checkpoint; no future stage commit invented.
- Evidence: completed implementation tool results and user-supplied supervised browser acceptance. This documentation turn changes only six approved documentation files; executable files/tests preserved byte-for-byte. No tests/build/browser/provider/data operations rerun.

## 2. Sprint Objective and Boundaries

Harden only the existing in-session state machine. One answer per question identity; transition/completion exclusion; commit ordinal after valid question acceptance; clear failed-feedback busy state; one immutable evaluation/persistence snapshot; inert stale question/feedback/TTS continuations; no Q6; preserve zero/partial behavior and canonical question text.

Approved executable scope is exactly five files; documentation scope exactly two new reports and four existing memory files. No server persistence idempotency, session resume, provider replacement/cancellation architecture, microphone redesign, HeyGen/avatar, schema/RLS, APIs, auth, History, Result, PDF, Profile, localization overhaul, visual redesign or dependencies.

## 3. Repository State Before Implementation

Repository C:/Users/p-ayd/interviewai. feature/auth-foundation; HEAD and local origin matched 50e4da96e00a9f4c70979b5bada1ca71f3a68403; initial working tree clean. Current documentation-start tree contained precisely the five approved uncommitted implementation/test files. No branches or Git state mutated.

## 4. Architecture and Implementation Decisions

Forensic verdict before implementation: READY TO DEFINE IMPLEMENTATION. Findings: answer appended without synchronous duplicate guard; generation ordinal advanced before provider success; feedback rejection could leave busy state set; completion reread mutable answers; transport allowed missing/invalid text to count as empty success; stale continuation ownership needed strengthening.

Framework-independent createInterviewSessionState uses monotonic operation tokens and exclusive generation/feedback/completion ownership. AcceptedQuestion identity commits only for valid nonempty trimmed text; five-question maximum. claimAnswer atomically claims feedback and consumes one question; retryFeedback returns the same frozen submitted pair. beginCompletion copies and freezes array and entries. release only works for the current owner; dispose invalidates all work. Per-effect helper ownership accommodates setup/cleanup replay; old closures retain their disposed owner.

Page handlers obtain admission before mutation/provider work. Question failure retains ordinal/current question and exposes localized retry, including initial failure latch recovery. Feedback commits answer once before provider completion; success/failure releases busy and failure exposes feedback-only retry. Next/Skip reuse admission and Q5 enters completion; skips create no answer. End rejects active transition synchronously before completion side effects, invalidates/stops audio, and uses the same snapshot for prompt and POST. Zero-answer warning releases guards without evaluation/save/navigation. Completion failure retains explicit retry. Server response-loss duplication intentionally unresolved.

TTS uses the existing provider path, text/voiceId body and audio blob expectations. Only accepted canonical current questions can speak; audio request identity and session/question ownership reject obsolete responses. Client transport rejects failed HTTP or missing/nonstring/empty text without changing provider architecture/prompts. API TTS route is unchanged from safe base.

## 5. Created and Modified Files

Exactly eleven stage files: five implementation/test plus six documentation. Created: helper, focused test, Summary and this report. Modified: page, workspace, controls and four memory files. Detailed inventory is in section 6 and final Git status.

## 6. Responsibility of Each File

| File | Responsibility |
|---|---|
| app/interview/page.tsx | Handler admission, canonical question commit, feedback retry/error states, completion snapshot, transport validation, TTS ownership and localized copy |
| components/interview/InterviewWorkspace.tsx | Presentational retry messages/buttons and busy/answer-disabled wiring |
| components/interview/LiveInterviewControls.tsx | Presentational End disablement during completion or transitionBusy |
| lib/interviews/interview-session-state.ts | Small synchronous framework-independent ownership/question/answer/snapshot helper |
| lib/interviews/interview-session-state.test.cjs | 50 deterministic helper/source/page-handler tests with mocked providers/media; no external calls |
| docs/01_Engineering/Sprint_INTERVIEW_RELIABILITY_01_Summary.md | Concise acceptance and review inventory |
| docs/01_Engineering/Sprint_INTERVIEW_RELIABILITY_01_Engineering_Report.md | Technical, validation, browser and diff record |
| docs/04_Project_Memory/CURRENT_STATE.md | Authoritative current uncommitted acceptance checkpoint and roadmap progress |
| docs/04_Project_Memory/STAGE_LOG.md | Append-only closure and user evidence |
| docs/04_Project_Memory/DEFERRED_FIXES.md | Bounded resolution plus deliberately deferred work |
| docs/04_Project_Memory/DECISIONS_AND_RISKS.md | Accepted ownership architecture, incident classification and qualified risks |

## 7. Public Interfaces, Props, or Types

SessionAnswer: Readonly<{q:string;a:string}>. SessionOperation: Readonly<{id:number;kind:'generation'|'feedback'|'completion'}>. AcceptedQuestion: Readonly<{id:number;ordinal:number;text:string}>. createInterviewSessionState exposes beginGeneration, acceptQuestion, claimAnswer, retryFeedback, beginCompletion, isCurrent, release, canSpeak, dispose and question/answered/busy getters. Admission returns null on rejection. Completion returns token and deeply frozen answer array (primitive entry fields).

Workspace adds feedbackRetryLabel, feedbackFailureMessage, onRetryFeedback, questionRetryLabel, questionFailureMessage, onRetryQuestion. Controls adds transitionBusy:boolean; End disabled={isCompleting || transitionBusy}. LiveInterviewCopy adds retryFeedback/retryQuestion/questionFailure for tr/en/de. Presentational components contain no provider/state-machine business logic. Persisted payload shape and UUID Result handoff remain unchanged.

## 8. Accessibility Decisions

Existing native TalentryButton disabled semantics and keyboard focus preserved. Failure messages use role=alert with explicit localized retry labels, not color alone. Submit disabled for busy/completion/missing question/empty answer; consumed question moves to Next. Next/Skip and retries disabled during busy/completion. End native disabled during generation/feedback/completion. No focus/layout/motion redesign; existing reduced-motion and token styling preserved. Generation DOM evidence is user-verified native attribute observation, not a general screen-reader acceptance claim.

## 9. Styling and Token Usage

No CSS or token files changed. Existing TalentryButton variants, workspace patterns, alert semantics and approved design values reused. No new palette, styling library, dependency or layout redesign.

## 10. Validation Commands and Exact Results

### Recorded implementation validation (not rerun in documentation turn)

| Gate | Exact recorded result |
|---|---|
| `node --test lib/interviews/interview-session-state.test.cjs` | Exit 0; 50 tests, 50 pass, 0 fail/cancelled/skipped/todo |
| Existing Interview regression command (below) | Exit 0; 96 tests, 96 pass, 0 fail/cancelled/skipped/todo |
| `npx.cmd tsc --noEmit --incremental false` | Exit 0; PASS |
| `git diff --check` | Exit 0; PASS; LF-to-CRLF warning for page.tsx |
| Read-only Next.js dev process inspection | Initial sandbox access denied; approved elevated inspection exit 0, no matching Next.js dev server detected |
| `npm.cmd run build` | Exit 0; PASS; Next.js 14.2.5, 22/22 pages generated |

Existing regression command:

```text
node --test lib/interviews/read-owned-interview.test.cjs lib/interviews/delete-owned-interview.test.cjs lib/interviews/history-cursor.test.cjs lib/interviews/history-pagination.test.cjs lib/reports/interview-report.test.cjs components/result/useInterviewDeletion.test.cjs components/interviews/useFullInterviewHistory.test.cjs
```

The initial PDF regression invocation failed with `spawnSync python EPERM`; the approved rerun used invocation-local REPORT_PDF_PYTHON pointing to existing Codex-bundled Python and passed. No package or persistent configuration change. The first page-mock test attempt had a missing React binding in the test harness; corrected within the approved test file before the final 50/50 run. Final build emitted two webpack cache warnings: "Caching failed for pack: Error: Unable to snapshot resolve dependencies". TypeScript/build emitted npm major-version update notices; no update performed. Git warned LF would be replaced by CRLF for page.tsx. Warnings were not hidden and did not change successful exit status.

Documentation-only validation: git diff --check PASS, exit 0; full diff/scope/content review PASS; eleven approved stage files. No application tests/TypeScript/build rerun. Warning: existing page.tsx LF-to-CRLF notice. New report whitespace checked independently because untracked files are not included by ordinary git diff --check.

### User-verified local browser acceptance — 2026-10-06

These observations were supplied by the user after supervised acceptance; the documentation agent did not rerun browser actions or inspect/mutate Supabase.

| Check | User-verified evidence | Result |
|---|---|---|
| Initial question / TTS | Initial question rendered. Initial TTS POST returned 500; route/request contract was unchanged from the safe base. ElevenLabs account showed a failed payment. User corrected billing; account then showed Starter and 90,000 / 90,000 credits. Q2 TTS worked without Talentry code changes. | PASS after external incident resolution |
| Zero-answer contract | Q1 skipped; End invoked on Q2 with zero submitted answers. Existing no-result/no-save warning appeared; no Result navigation. Returning preserved active Q2, usable controls and available End. Zero-answer contract remains no evaluation, no save, no Result, usable session. | PASS |
| Feedback-time End | One answer submitted on Q2. End disabled while feedback pending and enabled after feedback completed. | PASS |
| Generation-time End | MutationObserver on the visible native End button recorded disabled=false -> true -> false: enabled before generation, disabled during generation, enabled afterward. Earlier visual observation was timing/paint evidence, not a proven product defect. No production correction required. | PASS |
| Final-question boundary | Q4 generated and spoke; Q4 Skip generated Q5; Q5 displayed 5/5 and spoke; Q5 Skip entered completion. No Q6 generated. | PASS |
| Partial completion | User explicitly approved completion of the first acceptance interview. Only Q2 had a submitted answer; Q1/Q3/Q4/Q5 skipped. Evaluation completed, interview persisted, Result opened and contained exactly one saved answer. No Q6. | PASS |
| Feedback failure / retry | Second session: network Offline before Submit. Answer committed once; feedback failed; busy cleared; session usable; End available; answer preserved and could not be submitted as another answer. Localized failure message and "Geri bildirimi tekrar dene" appeared. After network restoration, one feedback-only retry reused that answer, created no duplicate, succeeded, showed "Değerlendirmen hazır", and feedback panel opened. | PASS |
| Generation failure / retry | Second session: Offline before Next. Generation failed, busy cleared, Q1 remained visible, session usable, End available, localized failure message and "Soruyu tekrar dene" appeared. Ordinal not consumed. Restored-network retry produced Q2/5, not Q3; TTS worked. | PASS |
| Second-session cleanup | Second session was not completed. User closed test tab after Q2 generation. No completion/save/Result was intentionally triggered; no persisted second-session record is claimed. | Recorded boundary |

Incident classification: **EXTERNAL PROVIDER / ACCOUNT BILLING INCIDENT, resolved during acceptance**. Not an INTERVIEW_RELIABILITY_01 regression. No payment/card details retained.

Generation-End diagnostic: **false -> true -> false** (native disabled attribute). The earlier visual observation is superseded by this user-verified DOM evidence.

History: **HISTORY_PAGINATION_01: NATURAL-RECORD DEFERRED ACCEPTANCE**. Historical directly verified baseline: 11 records on 2026-10-06. One natural persisted interview was created during INTERVIEW_RELIABILITY_01 acceptance after that baseline. History was not re-counted; no new verified total is asserted. No synthetic pagination seeding. Natural 21+ acceptance remains deferred and does not block unrelated WEB work.


### Automated-only qualifications

Immediate double-submit handler race; submit + End same-callback race; submit + Skip overlap; stale feedback/question continuations after completion; obsolete TTS continuation after completion; disposal/unmount invalidation; immutable completion snapshot mutation attacks; synchronous handler rejection independent of UI paint; and one-completion-attempt admission remain automated/deterministic coverage, not browser-tested claims.


## 11. Git Status

Final stage inventory (no staging):

```text
 M app/interview/page.tsx
 M components/interview/InterviewWorkspace.tsx
 M components/interview/LiveInterviewControls.tsx
 M docs/04_Project_Memory/CURRENT_STATE.md
 M docs/04_Project_Memory/DECISIONS_AND_RISKS.md
 M docs/04_Project_Memory/DEFERRED_FIXES.md
 M docs/04_Project_Memory/STAGE_LOG.md
?? docs/01_Engineering/Sprint_INTERVIEW_RELIABILITY_01_Engineering_Report.md
?? docs/01_Engineering/Sprint_INTERVIEW_RELIABILITY_01_Summary.md
?? lib/interviews/interview-session-state.test.cjs
?? lib/interviews/interview-session-state.ts
```

Tracked git diff --stat excludes four untracked files. Branch and HEAD remain unchanged. No stage commit/push claimed.

## 12. Complete Diffs for Sprint Files

Full five implementation/test diffs, four memory diffs and new Summary diff follow. This new report is the complete self-contained technical record; its own content is presented directly rather than recursively embedding a diff of itself. Historical reports are untouched.

### app/interview/page.tsx

```diff
diff --git a/app/interview/page.tsx b/app/interview/page.tsx
index 0754a00..1835a18 100644
--- a/app/interview/page.tsx
+++ b/app/interview/page.tsx
@@ -9,6 +9,8 @@ import type { InterviewFeedback, InterviewTab, InterviewWorkspaceLabels } from '
 import LiveInterviewControls from '@/components/interview/LiveInterviewControls'
 import { TalentryButton } from '@/components/ui'
 import styles from './interview.module.css'
+import { createInterviewSessionState } from '@/lib/interviews/interview-session-state'
+import type { AcceptedQuestion, SessionAnswer, SessionOperation } from '@/lib/interviews/interview-session-state'

 const IV: Record<string, any> = {
   f: { name:'Sarah Chen', role:'Sr. HR Manager',
@@ -50,6 +52,9 @@ type LiveInterviewCopy = {
   feedbackPanel: string
   feedbackReady: string
   feedbackUnavailable: string
+  retryFeedback: string
+  retryQuestion: string
+  questionFailure: string
   goToQuestions: string
   interviewPanel: string
   interviewerPanel: string
@@ -77,6 +82,7 @@ const LIVE_COPY: Record<InterviewLanguage, LiveInterviewCopy> = {
     feedbackGuidance: 'Sonraki soruya devam etmek için sola kaydır veya Sorulara Dön seçeneğini kullan.',
     feedbackPanel: 'Değerlendirme', feedbackReady: 'Değerlendirmen hazır — görmek için sağa kaydır.',
     feedbackUnavailable: 'Geri bildirim şu anda gösterilemiyor.',
+    retryFeedback: 'Geri bildirimi tekrar dene', retryQuestion: 'Soruyu tekrar dene', questionFailure: 'Soru oluşturulamadı. Lütfen tekrar deneyin.',
     goToQuestions: 'Sorulara Geç', interviewPanel: 'Mülakat soruları', interviewerPanel: 'Mülakatçı',
     leaveWithoutSaving: 'Kaydetmeden Çık',
     microphoneToggleOff: 'Mikrofonu kapat', microphoneToggleOn: 'Mikrofonu aç', sessionLabel: 'Canlı mülakat',
@@ -101,6 +107,7 @@ const LIVE_COPY: Record<InterviewLanguage, LiveInterviewCopy> = {
     feedbackGuidance: 'Swipe left or use Back to Questions to continue with the next question.',
     feedbackPanel: 'Feedback', feedbackReady: 'Your feedback is ready — swipe right to view it.',
     feedbackUnavailable: 'Feedback is currently unavailable.',
+    retryFeedback: 'Retry feedback', retryQuestion: 'Retry question', questionFailure: 'Question could not be created. Please try again.',
     goToQuestions: 'Go to Questions', interviewPanel: 'Interview questions', interviewerPanel: 'Interviewer',
     leaveWithoutSaving: 'Leave Without Saving',
     microphoneToggleOff: 'Mute microphone', microphoneToggleOn: 'Unmute microphone', sessionLabel: 'Live interview',
@@ -125,6 +132,7 @@ const LIVE_COPY: Record<InterviewLanguage, LiveInterviewCopy> = {
     feedbackGuidance: 'Wische nach links oder nutze Zurück zu den Fragen, um mit der nächsten Frage fortzufahren.',
     feedbackPanel: 'Feedback', feedbackReady: 'Dein Feedback ist bereit — wische nach rechts, um es anzusehen.',
     feedbackUnavailable: 'Feedback ist derzeit nicht verfügbar.',
+    retryFeedback: 'Feedback erneut versuchen', retryQuestion: 'Frage erneut versuchen', questionFailure: 'Die Frage konnte nicht erstellt werden. Bitte versuchen Sie es erneut.',
     goToQuestions: 'Zu den Fragen', interviewPanel: 'Interviewfragen', interviewerPanel: 'Interviewer',
     leaveWithoutSaving: 'Ohne Speichern verlassen',
     microphoneToggleOff: 'Mikrofon stummschalten', microphoneToggleOn: 'Mikrofon einschalten', sessionLabel: 'Live-Interview',
@@ -222,17 +230,19 @@ function InterviewContent() {
       : 'Yalnızca Türkçe yanıt ver.'
   const mobilePagerRef = useRef<HTMLDivElement>(null)
   const camRef = useRef<HTMLVideoElement>(null)
-  const answersRef = useRef<{q:string;a:string}[]>([])
+  const answersRef = useRef<SessionAnswer[]>([])
+  const sessionRef = useRef(createInterviewSessionState())
   const curQRef = useRef('')
   const qNumRef = useRef(0)
   const camStreamRef = useRef<MediaStream | null>(null)
   const audioRef = useRef<HTMLAudioElement | null>(null)
   const audioObjectUrlRef = useRef<string | null>(null)
   const audioRequestRef = useRef(0)
-  const questionGenerationInFlightRef = useRef(false)
   const initialQuestionTriggeredRef = useRef(false)
   const completionInFlightRef = useRef(false)
   const [question, setQuestion] = useState('')
+  const [questionError, setQuestionError] = useState(false)
+  const [feedbackFailed, setFeedbackFailed] = useState(false)
   const [qLoading, setQLoading] = useState(false)
   const [answer, setAnswer] = useState('')
   const [feedback, setFeedback] = useState<InterviewFeedback | null>(null)
@@ -269,9 +279,16 @@ function InterviewContent() {
     return () => { camStreamRef.current?.getTracks().forEach(t=>t.stop()) }
   }, [])

-  useEffect(() => () => {
-    audioRequestRef.current += 1
-    stopCurrentAudio()
+  useEffect(() => {
+    // Effect replay owns a fresh session; obsolete closures retain their disposed owner.
+    const session = createInterviewSessionState()
+    sessionRef.current = session
+    initialQuestionTriggeredRef.current = false
+    return () => {
+      session.dispose()
+      audioRequestRef.current += 1
+      stopCurrentAudio()
+    }
   }, [])

  async function claudeCall (system: string, message: string) {
@@ -280,35 +297,38 @@ function InterviewContent() {
       headers:{'Content-Type':'application/json'},
       body: JSON.stringify({system, message})
     })
-    const data = await res.json()
-    return data.text || ''
+    if (!res.ok) throw new Error(`Interview provider failed: ${res.status}`)
+    const data: unknown = await res.json()
+    if (typeof data !== 'object' || data === null || !('text' in data) || typeof data.text !== 'string' || !data.text.trim()) {
+      throw new Error('Invalid interview provider text')
+    }
+    return data.text
   }
-async function speakText(text: string) {
+async function speakText(accepted: AcceptedQuestion) {
+  const session = sessionRef.current
+  if (!session.canSpeak(accepted)) return
+  const text = accepted.text
   const requestId = audioRequestRef.current + 1
   audioRequestRef.current = requestId
   stopCurrentAudio()
   setSpeechStatus('preparing')

   try {
-    console.log('speakText called:', text)
-
     const res = await fetch('/api/elevenlabs', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ text, voiceId: iv.voice })
     })

-    console.log('elevenlabs response status:', res.status)
-
     if (!res.ok) {
-      if (requestId === audioRequestRef.current) setSpeechStatus('unavailable')
+      if (requestId === audioRequestRef.current && session.canSpeak(accepted)) setSpeechStatus('unavailable')
       return
     }

     const blob = await res.blob()
     const url = URL.createObjectURL(blob)

-    if (requestId !== audioRequestRef.current) {
+    if (requestId !== audioRequestRef.current || !session.canSpeak(accepted)) {
       URL.revokeObjectURL(url)
       return
     }
@@ -324,11 +344,11 @@ async function speakText(text: string) {
         URL.revokeObjectURL(url)
         audioObjectUrlRef.current = null
       }
-      if (requestId === audioRequestRef.current) setSpeechStatus('ready')
+      if (requestId === audioRequestRef.current && session.canSpeak(accepted)) setSpeechStatus('ready')
     }, { once: true })
     void audio.play()
       .then(() => {
-        if (requestId === audioRequestRef.current && audioRef.current === audio) {
+        if (requestId === audioRequestRef.current && session.canSpeak(accepted) && audioRef.current === audio) {
           setSpeechStatus('speaking')
         }
       })
@@ -340,10 +360,10 @@ async function speakText(text: string) {
           URL.revokeObjectURL(url)
           audioObjectUrlRef.current = null
         }
-        if (requestId === audioRequestRef.current) setSpeechStatus('unavailable')
+        if (requestId === audioRequestRef.current && session.canSpeak(accepted)) setSpeechStatus('unavailable')
       })
   } catch (e) {
-    if (requestId === audioRequestRef.current) setSpeechStatus('unavailable')
+    if (requestId === audioRequestRef.current && session.canSpeak(accepted)) setSpeechStatus('unavailable')
     console.warn('TTS error', e)
   }
 }
@@ -362,17 +382,15 @@ async function speakText(text: string) {
     }
   }
   const askQuestion = useCallback(async () => {
-    if (questionGenerationInFlightRef.current) return
-    questionGenerationInFlightRef.current = true
-    let canonicalQuestion: string | null = null
-    setFeedback(null); setAnswer(''); setAwaitingNext(false)
-    setQLoading(true)
+    const session = sessionRef.current
+    const admission = session.beginGeneration()
+    if (!admission) return
+    const { token, ordinal: num } = admission
+    setQuestionError(false); setQLoading(true)
     try {
       audioRequestRef.current += 1
       stopCurrentAudio()
       setSpeechStatus('ready')
-      const num = qNumRef.current + 1
-      qNumRef.current = num; setQNum(num)
       const previousQuestions = Array.from(new Set(
         [...answersRef.current.map(item => item.q), curQRef.current]
           .map(previousQuestion => previousQuestion.trim())
@@ -383,15 +401,23 @@ async function speakText(text: string) {
         : ''
 const sys = `${P[persona]} Sen ${role} için ${T[itype]} mülakatı yapıyorsun. Aday: ${L[level]}. Şirket: ${company}. ${languageInstruction} SADECE soruyu yaz. Soru ${num}.${previousQuestionsInstruction}`
       const q = await claudeCall(sys, `${num}. mülakat sorusu`)
-      canonicalQuestion = q.trim()
-      setQuestion(canonicalQuestion); setQLoading(false)
-      curQRef.current = canonicalQuestion
+      const accepted = session.acceptQuestion(token, q)
+      if (!accepted) {
+        if (session.isCurrent(token)) throw new Error('Invalid generated question')
+        return
+      }
+      qNumRef.current = accepted.ordinal; setQNum(accepted.ordinal)
+      curQRef.current = accepted.text; setQuestion(accepted.text)
+      setFeedback(null); setAnswer(''); setAwaitingNext(false); setFeedbackFailed(false)
+      void speakText(accepted)
+    } catch (error) {
+      if (session.isCurrent(token)) {
+        console.warn('Question generation failed', error)
+        setQuestionError(true)
+        if (!session.question) initialQuestionTriggeredRef.current = false
+      }
     } finally {
-      setQLoading(false)
-      questionGenerationInFlightRef.current = false
-    }
-    if (canonicalQuestion !== null) {
-      void speakText(canonicalQuestion).catch(error => console.warn('TTS error', error))
+      if (session.release(token)) setQLoading(false)
     }
   }, [])

@@ -414,13 +440,34 @@ const sys = `${P[persona]} Sen ${role} için ${T[itype]} mülakatı yapıyorsun.
     return () => mobileQuery.removeEventListener('change', triggerForViewport)
   }, [triggerInitialQuestion])
   async function submitAnswer() {
-    if (!answer.trim()) return
-    setCompletionError('')
-    answersRef.current.push({q: curQRef.current, a: answer})
-    setQLoading(true)
+    const admission = sessionRef.current.claimAnswer(answer)
+    if (!admission) return
+    answersRef.current.push(admission.answer)
+    await runFeedback(admission.token, admission.answer)
+  }
+
+  async function retryFeedback() {
+    if (!feedbackFailed) return
+    const admission = sessionRef.current.retryFeedback()
+    if (admission) await runFeedback(admission.token, admission.answer)
+  }
+
+  async function runFeedback(token: SessionOperation, submitted: SessionAnswer) {
+    const session = sessionRef.current
+    setCompletionError(''); setFeedbackFailed(false); setAwaitingNext(true); setQLoading(true)
     const sys = `${persona === 'tough' ? 'Eleştirel' : 'Yapıcı'} bir mülakat koçusun. ${languageInstruction} Adayın cevabını kısa, yapıcı ve profesyonel şekilde değerlendir. Sadece geçerli JSON döndür: {"strength":"...","improvement":"...","suggestion":"..."}. Her alan kısa, tek bir madde olmalı. Başka metin ekleme.`
-    const fb = await claudeCall(sys, `Soru: "${curQRef.current}"\nCevap: "${answer}"`)
-    setFeedback(parseInterviewFeedback(fb, copy.feedbackUnavailable)); setQLoading(false); setAwaitingNext(true)
+    try {
+      const fb = await claudeCall(sys, `Soru: "${submitted.q}"\nCevap: "${submitted.a}"`)
+      if (!session.isCurrent(token)) return
+      setFeedback(parseInterviewFeedback(fb, copy.feedbackUnavailable))
+    } catch (error) {
+      if (session.isCurrent(token)) {
+        console.warn('Interview feedback failed', error)
+        setFeedbackFailed(true)
+      }
+    } finally {
+      if (session.release(token)) setQLoading(false)
+    }
   }

   async function nextQuestion() {
@@ -430,12 +477,19 @@ const sys = `${P[persona]} Sen ${role} için ${T[itype]} mülakatı yapıyorsun.

   async function endCall() {
     if (completionInFlightRef.current) return
+    const session = sessionRef.current
+    const admission = session.beginCompletion(answersRef.current)
+    if (!admission) return
+    const { token, snapshot: answers } = admission
+    audioRequestRef.current += 1
+    stopCurrentAudio()
+    setSpeechStatus('ready')
     completionInFlightRef.current = true
     setIsCompleting(true)
     setCompletionError('')

-    const answers = answersRef.current
     if (!answers.length) {
+      session.release(token)
       setCompletionError(copy.zeroAnswerWarning)
       completionInFlightRef.current = false
       setIsCompleting(false)
@@ -446,6 +500,7 @@ const sys = `${P[persona]} Sen ${role} için ${T[itype]} mülakatı yapıyorsun.
       const aText = answers.map((x,i)=>`S${i+1}: ${x.q}\nC: ${x.a}`).join('\n\n')
       const sys = `Kıdemli bir İK uzmanısın. ${languageInstruction} Sadece geçerli JSON döndür: {"score":0-100,"summary":"3-4 cümlelik değerlendirme"}`
       const raw = await claudeCall(sys, `Pozisyon: ${role}\n\n${aText}`)
+      if (!session.isCurrent(token)) return
       const evaluation: unknown = JSON.parse(raw.replace(/```json|```/g,'').trim())

       if (!isEvaluationResult(evaluation)) {
@@ -477,6 +532,7 @@ const sys = `${P[persona]} Sen ${role} için ${T[itype]} mülakatı yapıyorsun.

       const savedInterview: unknown = await saveRes.json()

+      if (!session.isCurrent(token)) return
       if (!isPersistedInterviewResponse(savedInterview)) {
         throw new Error('Invalid interview persistence response')
       }
@@ -484,6 +540,8 @@ const sys = `${P[persona]} Sen ${role} için ${T[itype]} mülakatı yapıyorsun.
       camStreamRef.current?.getTracks().forEach(t=>t.stop())
       router.push(`/result/${encodeURIComponent(savedInterview.id)}`)
     } catch (error) {
+      if (!session.isCurrent(token)) return
+      session.release(token)
       console.error('Interview completion failed:', error)
       setCompletionError(copy.completionFailure)
       completionInFlightRef.current = false
@@ -492,6 +550,7 @@ const sys = `${P[persona]} Sen ${role} için ${T[itype]} mülakatı yapıyorsun.
   }

   function leaveWithoutSaving() {
+    sessionRef.current.dispose()
     audioRequestRef.current += 1
     stopCurrentAudio()
     camStreamRef.current?.getTracks().forEach(track => track.stop())
@@ -541,6 +600,7 @@ const sys = `${P[persona]} Sen ${role} için ${T[itype]} mülakatı yapıyorsun.
       completionError={completionError}
       endLabel={copy.endInterview}
       isCompleting={isCompleting}
+      transitionBusy={qLoading}
       leaveWithoutSavingLabel={copy.leaveWithoutSaving}
       microphoneLabel={micOn ? copy.microphoneToggleOff : copy.microphoneToggleOn}
       microphoneOn={micOn}
@@ -589,6 +649,12 @@ const sys = `${P[persona]} Sen ${role} için ${T[itype]} mülakatı yapıyorsun.
             answer={answer}
             awaitingNext={awaitingNext}
             feedback={feedback}
+            feedbackRetryLabel={copy.retryFeedback}
+            feedbackFailureMessage={feedbackFailed ? copy.feedbackUnavailable : ''}
+            onRetryFeedback={retryFeedback}
+            questionRetryLabel={copy.retryQuestion}
+            questionFailureMessage={questionError ? copy.questionFailure : ''}
+            onRetryQuestion={askQuestion}
             isCompleting={isCompleting}
             labels={copy.workspace}
             maxQuestions={MAX_Q}
```

### components/interview/InterviewWorkspace.tsx

```diff
diff --git a/components/interview/InterviewWorkspace.tsx b/components/interview/InterviewWorkspace.tsx
index d5ae7aa..786c212 100644
--- a/components/interview/InterviewWorkspace.tsx
+++ b/components/interview/InterviewWorkspace.tsx
@@ -31,6 +31,12 @@ interface InterviewWorkspaceProps {
   answer: string
   awaitingNext: boolean
   feedback: InterviewFeedback | null
+  feedbackRetryLabel: string
+  feedbackFailureMessage: string
+  onRetryFeedback: () => void
+  questionRetryLabel: string
+  questionFailureMessage: string
+  onRetryQuestion: () => void
   isCompleting: boolean
   labels: InterviewWorkspaceLabels
   maxQuestions: number
@@ -71,6 +77,8 @@ export function InterviewFeedbackCard({ feedback, labels }: InterviewFeedbackCar

 export default function InterviewWorkspace({
   activeTab, answer, awaitingNext, feedback, isCompleting, labels, maxQuestions,
+  feedbackRetryLabel, feedbackFailureMessage, onRetryFeedback,
+  questionRetryLabel, questionFailureMessage, onRetryQuestion,
   mobileFeedbackReadyLabel, mobileViewFeedbackLabel, notes, onAnswerChange, onNext, onNotesChange,
   onSubmit, onTabChange, onViewFeedback, qLoading, question, questionNumber, showFeedback,
 }: InterviewWorkspaceProps) {
@@ -97,12 +105,14 @@ export default function InterviewWorkspace({
             ) : <p>{question}</p>}
           </div>

+          {questionFailureMessage && <div role="alert"><p>{questionFailureMessage}</p><TalentryButton disabled={qLoading || isCompleting} onClick={onRetryQuestion} variant="secondary">{questionRetryLabel}</TalentryButton></div>}
+          {feedbackFailureMessage && <div role="alert"><p>{feedbackFailureMessage}</p><TalentryButton disabled={qLoading || isCompleting} onClick={onRetryFeedback} variant="secondary">{feedbackRetryLabel}</TalentryButton></div>}
           <label className={styles.answerLabel} htmlFor="interview-answer">{labels.answer}</label>
           <textarea className={styles.answerInput} disabled={qLoading || awaitingNext || isCompleting} id="interview-answer" onChange={(event) => onAnswerChange(event.target.value)} placeholder={labels.answerPlaceholder} value={answer} />

           <div className={styles.workspaceActions}>
             {!awaitingNext ? (
-              <TalentryButton className={styles.primaryAction} disabled={qLoading || isCompleting || !answer.trim()} onClick={onSubmit}>
+              <TalentryButton className={styles.primaryAction} disabled={qLoading || isCompleting || !question || !answer.trim()} onClick={onSubmit}>
                 {labels.submit}
               </TalentryButton>
             ) : (
```

### components/interview/LiveInterviewControls.tsx

```diff
diff --git a/components/interview/LiveInterviewControls.tsx b/components/interview/LiveInterviewControls.tsx
index f6a89e3..9cd47c4 100644
--- a/components/interview/LiveInterviewControls.tsx
+++ b/components/interview/LiveInterviewControls.tsx
@@ -7,6 +7,7 @@ interface LiveInterviewControlsProps {
   completionError: string
   endLabel: string
   isCompleting: boolean
+  transitionBusy: boolean
   leaveWithoutSavingLabel: string
   microphoneLabel: string
   microphoneOn: boolean
@@ -27,7 +28,7 @@ function CameraIcon() {
 }

 export default function LiveInterviewControls({
-  cameraLabel, cameraOn, completionError, endLabel, isCompleting, microphoneLabel,
+  cameraLabel, cameraOn, completionError, endLabel, isCompleting, transitionBusy, microphoneLabel,
   leaveWithoutSavingLabel, microphoneOn, onDismissCompletionError, onEnd,
   onLeaveWithoutSaving, onToggleCamera, onToggleMicrophone, returnToInterviewLabel,
 }: LiveInterviewControlsProps) {
@@ -53,7 +54,7 @@ export default function LiveInterviewControls({
         <TalentryButton aria-label={cameraLabel} aria-pressed={cameraOn} className={`${styles.mediaControl} ${!cameraOn ? styles.mediaControlOff : ''}`} onClick={onToggleCamera} variant="icon">
           <CameraIcon />
         </TalentryButton>
-        <TalentryButton aria-label={endLabel} className={styles.endInterview} disabled={isCompleting} onClick={onEnd} type="button" variant="danger">
+        <TalentryButton aria-label={endLabel} className={styles.endInterview} disabled={isCompleting || transitionBusy} onClick={onEnd} type="button" variant="danger">
           <span>{endLabel}</span>
         </TalentryButton>
       </div>
```

### lib/interviews/interview-session-state.ts

```diff
--- /dev/null
+++ b/lib/interviews/interview-session-state.ts
@@ -0,0 +1,67 @@
+export type SessionAnswer = Readonly<{ q: string; a: string }>
+export type SessionOperation = Readonly<{ id: number; kind: 'generation' | 'feedback' | 'completion' }>
+export type AcceptedQuestion = Readonly<{ id: number; ordinal: number; text: string }>
+
+/** Synchronous ownership boundary for one mounted interview; no provider or React state. */
+export function createInterviewSessionState() {
+  let identity = 0
+  let disposed = false
+  let operation: SessionOperation | null = null
+  let question: AcceptedQuestion | null = null
+  let consumedAnswer: SessionAnswer | null = null
+
+  function begin(kind: SessionOperation['kind']): SessionOperation | null {
+    if (disposed || operation) return null
+    operation = Object.freeze({ id: ++identity, kind })
+    return operation
+  }
+  function isCurrent(token: SessionOperation) {
+    return !disposed && operation === token && token.id === identity
+  }
+  function release(token: SessionOperation) {
+    if (!isCurrent(token)) return false
+    operation = null
+    return true
+  }
+  function beginGeneration() {
+    if ((question?.ordinal ?? 0) >= 5) return null
+    const token = begin('generation')
+    return token ? { token, ordinal: (question?.ordinal ?? 0) + 1 } : null
+  }
+  function acceptQuestion(token: SessionOperation, value: unknown) {
+    if (!isCurrent(token) || token.kind !== 'generation' || typeof value !== 'string' || !value.trim()) return null
+    // One acceptance per generation token, even before its finally block releases it.
+    if (question?.id === token.id) return null
+    question = Object.freeze({ id: token.id, ordinal: (question?.ordinal ?? 0) + 1, text: value.trim() })
+    consumedAnswer = null
+    return question
+  }
+  function claimAnswer(answer: string) {
+    if (!question || consumedAnswer || !answer.trim()) return null
+    const token = begin('feedback')
+    if (!token) return null
+    consumedAnswer = Object.freeze({ q: question.text, a: answer })
+    return { token, answer: consumedAnswer }
+  }
+  function retryFeedback() {
+    if (!consumedAnswer) return null
+    const token = begin('feedback')
+    return token ? { token, answer: consumedAnswer } : null
+  }
+  function beginCompletion(answers: readonly SessionAnswer[]) {
+    const token = begin('completion')
+    if (!token) return null
+    const snapshot = Object.freeze(answers.map(answer => Object.freeze({ q: answer.q, a: answer.a })))
+    return { token, snapshot }
+  }
+  function canSpeak(accepted: AcceptedQuestion) {
+    return !disposed && question === accepted && operation?.kind !== 'completion'
+  }
+  return {
+    beginGeneration, acceptQuestion, claimAnswer, retryFeedback, beginCompletion, isCurrent, release, canSpeak,
+    get question() { return question },
+    get answered() { return consumedAnswer !== null },
+    get busy() { return operation !== null },
+    dispose() { disposed = true; ++identity; operation = null },
+  }
+}
```

### lib/interviews/interview-session-state.test.cjs

```diff
--- /dev/null
+++ b/lib/interviews/interview-session-state.test.cjs
@@ -0,0 +1,191 @@
+const { test } = require('node:test')
+const assert = require('node:assert/strict')
+const fs = require('node:fs')
+const ts = require('typescript')
+const Module = require('node:module')
+const filename = require('node:path').join(__dirname, 'interview-session-state.ts')
+const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText
+const loaded = new Module(filename, module)
+loaded._compile(compiled, filename)
+const { createInterviewSessionState } = loaded.exports
+function accepted(s, text = '  Canonical question?  ') {
+  const op = s.beginGeneration()
+  assert.ok(op)
+  const q = s.acceptQuestion(op.token, text)
+  s.release(op.token)
+  return q
+}
+function setup() { const s = createInterviewSessionState(); const q = accepted(s); return { s, q, answers: [] } }
+function submit(h) { const op = h.s.claimAnswer('Answer'); if (op) h.answers.push(op.answer); return op }
+function deferred() { let resolve, reject; const promise = new Promise((a,b) => { resolve=a; reject=b }); return { promise, resolve, reject } }
+async function generation(s, promise, events) {
+  const op = s.beginGeneration()
+  if (!op) return
+  try { const q = s.acceptQuestion(op.token, await promise); if (q) { events.push(q.text); if (s.canSpeak(q)) events.push('tts:' + q.text) } }
+  catch {} finally { if (s.release(op.token)) events.push('released') }
+}
+async function feedback(s, token, promise, events) {
+  try { const value = await promise; if (s.isCurrent(token)) events.push(value) }
+  catch {} finally { if (s.release(token)) events.push('released') }
+}
+const cases = [
+ ['normal submit admission', () => { const h=setup(); assert.ok(submit(h)) }],
+ ['answer commits once', () => { const h=setup(); submit(h); submit(h); assert.equal(h.answers.length,1) }],
+ ['feedback success releases busy', async () => { const h=setup(), op=submit(h), e=[]; await feedback(h.s,op.token,Promise.resolve('feedback'),e); assert.deepEqual(e,['feedback','released']); assert.equal(h.s.busy,false) }],
+ ['next question admission', () => { const h=setup(), op=submit(h); h.s.release(op.token); assert.equal(h.s.beginGeneration().ordinal,2) }],
+ ['canonical question answer feedback speech and snapshot', () => { const h=setup(), op=submit(h); assert.equal(h.q.text,'Canonical question?'); assert.equal(op.answer.q,h.q.text); assert.equal(h.s.retryFeedback(),null); assert.ok(h.s.canSpeak(h.q)); h.s.release(op.token); const retry=h.s.retryFeedback(); assert.strictEqual(retry.answer,op.answer); h.s.release(retry.token); assert.equal(h.s.beginCompletion(h.answers).snapshot[0].q,h.q.text) }],
+ ['immediate double submit rejects before mutation and feedback', () => { const h=setup(); const first=submit(h); assert.ok(first); assert.equal(submit(h),null); assert.equal(h.answers.length,1) }],
+ ['submit immediate End rejected', () => { const h=setup(); submit(h); assert.equal(h.s.beginCompletion(h.answers),null) }],
+ ['submit Skip overlap rejected', () => { const h=setup(); submit(h); assert.equal(h.s.beginGeneration(),null) }],
+ ['generation End rejected', () => { const s=createInterviewSessionState(); s.beginGeneration(); assert.equal(s.beginCompletion([]),null) }],
+ ['feedback End rejected', () => { const h=setup(); submit(h); assert.equal(h.s.beginCompletion(h.answers),null) }],
+ ['completion submit rejected', () => { const h=setup(); h.s.beginCompletion([]); assert.equal(submit(h),null) }],
+ ['completion generation rejected', () => { const h=setup(); h.s.beginCompletion([]); assert.equal(h.s.beginGeneration(),null) }],
+ ['initial ordinal one', () => { assert.equal(setup().q.ordinal,1) }],
+ ['Q4 to Q5', () => { const s=createInterviewSessionState(); for(let i=1;i<=5;i++) assert.equal(accepted(s,'Q'+i).ordinal,i) }],
+ ['Q5 Next Skip completion admission', () => { const s=createInterviewSessionState(); for(let i=0;i<5;i++) accepted(s); assert.ok(s.beginCompletion([])) }],
+ ['never request question six', () => { const s=createInterviewSessionState(); for(let i=0;i<5;i++) accepted(s); assert.equal(s.beginGeneration(),null) }],
+ ['failed generation leaves ordinal', () => { const h=setup(), op=h.s.beginGeneration(); h.s.release(op.token); assert.equal(h.s.question.ordinal,1) }],
+ ['retry same ordinal after failure', () => { const h=setup(), op=h.s.beginGeneration(); h.s.release(op.token); assert.equal(h.s.beginGeneration().ordinal,2) }],
+ ['feedback rejection clears busy', async () => { const h=setup(), op=submit(h); await feedback(h.s,op.token,Promise.reject(Error('failed')),[]); assert.equal(h.s.busy,false) }],
+ ['feedback failure preserves committed answer', async () => { const h=setup(), op=submit(h); await feedback(h.s,op.token,Promise.reject(Error()),[]); assert.equal(h.answers.length,1); assert.equal(h.s.answered,true) }],
+ ['feedback retry same committed pair', () => { const h=setup(), op=submit(h); h.s.release(op.token); assert.strictEqual(h.s.retryFeedback().answer,op.answer) }],
+ ['feedback retry cannot append duplicate', () => { const h=setup(), op=submit(h); h.s.release(op.token); h.s.retryFeedback(); assert.equal(submit(h),null); assert.equal(h.answers.length,1) }],
+ ['malformed empty questions rejected', () => { for(const value of [null,{},42,'','  ']) { const s=createInterviewSessionState(), op=s.beginGeneration(); assert.equal(s.acceptQuestion(op.token,value),null); assert.equal(s.question,null); s.release(op.token) } }],
+ ['generation rejection always releases', async () => { const s=createInterviewSessionState(), e=[]; await generation(s,Promise.reject(Error()),e); assert.deepEqual(e,['released']); assert.equal(s.busy,false) }],
+ ['immutable completion snapshot', () => { const h=setup(), op=submit(h); h.s.release(op.token); const c=h.s.beginCompletion(h.answers); assert.ok(Object.isFrozen(c.snapshot)); assert.ok(Object.isFrozen(c.snapshot[0])) }],
+ ['live mutation cannot alter snapshot', () => { const h=setup(), op=submit(h); h.s.release(op.token); const c=h.s.beginCompletion(h.answers); h.answers[0]={q:'changed',a:'changed'}; h.answers.push({q:'extra',a:'extra'}); assert.deepEqual(c.snapshot,[op.answer]) }],
+ ['evaluation persistence same answer set', () => { const h=setup(), op=submit(h); h.s.release(op.token); const {snapshot}=h.s.beginCompletion(h.answers); const evaluation=snapshot.map(x=>x.q+' '+x.a); const payload=JSON.parse(JSON.stringify({answers:snapshot})); assert.deepEqual(evaluation,payload.answers.map(x=>x.q+' '+x.a)) }],
+ ['late question after completion inert', async () => { const s=createInterviewSessionState(), op=s.beginGeneration(), d=deferred(), e=[]; const work=d.promise.then(value=>{ const q=s.acceptQuestion(op.token,value); if(q) { e.push(q.text); if(s.canSpeak(q)) e.push('tts') } }); assert.equal(s.beginCompletion([]),null); s.release(op.token); s.beginCompletion([]); d.resolve('late'); await work; assert.deepEqual(e,[]); assert.equal(s.question,null) }],
+ ['late feedback after completion inert', async () => { const h=setup(), op=submit(h), d=deferred(), e=[]; const work=feedback(h.s,op.token,d.promise,e); h.s.release(op.token); h.s.beginCompletion(h.answers); d.resolve('late'); await work; assert.deepEqual(e,[]); assert.equal(h.s.busy,true) }],
+ ['old question cannot start TTS after completion', () => { const h=setup(); h.s.beginCompletion([]); assert.equal(h.s.canSpeak(h.q),false) }],
+ ['dispose late question', async () => { const s=createInterviewSessionState(), d=deferred(), e=[]; const work=generation(s,d.promise,e); s.dispose(); d.resolve('late'); await work; assert.deepEqual(e,[]) }],
+ ['dispose late feedback', async () => { const h=setup(), op=submit(h), d=deferred(), e=[]; const work=feedback(h.s,op.token,d.promise,e); h.s.dispose(); d.resolve('late'); await work; assert.deepEqual(e,[]) }],
+ ['zero answers releases completion for usable session', () => { const h=setup(), c=h.s.beginCompletion([]); assert.equal(c.snapshot.length,0); h.s.release(c.token); assert.ok(submit(h)) }],
+ ['partial snapshot only submitted answers', () => { const h=setup(), op=submit(h); h.s.release(op.token); accepted(h.s,'Skipped'); assert.equal(h.s.beginCompletion(h.answers).snapshot.length,1) }],
+ ['skip creates no answer', () => { const h=setup(); accepted(h.s,'Next'); assert.equal(h.answers.length,0) }],
+ ['one completion at once', () => { const h=setup(); h.s.beginCompletion([]); assert.equal(h.s.beginCompletion([]),null) }],
+ ['completion failure explicit retry', () => { const h=setup(), c=h.s.beginCompletion([]); assert.ok(h.s.release(c.token)); assert.ok(h.s.beginCompletion([])) }],
+ ['retry identity distinct no server dedup guarantee', () => { const h=setup(), c=h.s.beginCompletion([]); h.s.release(c.token); const next=h.s.beginCompletion([]); assert.notEqual(next.token.id,c.token.id) }],
+ ['generation token cannot accept twice', () => { const s=createInterviewSessionState(), op=s.beginGeneration(); assert.ok(s.acceptQuestion(op.token,'Q')); assert.equal(s.acceptQuestion(op.token,'other'),null); assert.equal(s.question.ordinal,1) }],
+ ['superseded generation cannot commit or release newer operation', () => { const s=createInterviewSessionState(), op=s.beginGeneration(); s.release(op.token); const c=s.beginCompletion([]); assert.equal(s.acceptQuestion(op.token,'late'),null); assert.equal(s.release(op.token),false); assert.ok(s.isCurrent(c.token)) }],
+]
+for(const [name, run] of cases) test(name,run)
+const page = fs.readFileSync(require('node:path').join(__dirname,'../../app/interview/page.tsx'),'utf8')
+const workspace = fs.readFileSync(require('node:path').join(__dirname,'../../components/interview/InterviewWorkspace.tsx'),'utf8')
+const controls = fs.readFileSync(require('node:path').join(__dirname,'../../components/interview/LiveInterviewControls.tsx'),'utf8')
+test('page synchronous guards precede mutation and provider requests', () => {
+ assert.match(page,/claimAnswer\(answer\)[\s\S]*if \(!admission\) return[\s\S]*answersRef.current.push\(admission.answer\)/)
+ assert.match(page,/beginCompletion\(answersRef.current\)[\s\S]*if \(!admission\) return[\s\S]*stopCurrentAudio\(\)/)
+ assert.match(page,/if \(qNumRef.current >= MAX_Q\) await endCall\(\)/)
+ assert.match(page,/session.acceptQuestion\(token, q\)[\s\S]*qNumRef.current = accepted.ordinal/)
+ assert.match(page,/session.release\(token\)\) setQLoading\(false\)/)
+})
+test('page snapshot persistence UUID zero-answer and canonical contracts', () => {
+ assert.match(page,/snapshot: answers/); assert.match(page,/answers.map\(/); assert.match(page,/language,\s*answers,\s*score: evaluation.score/)
+ assert.doesNotMatch(page,/const answers = answersRef.current/)
+ assert.match(page,/if \(!answers.length\)[\s\S]*copy.zeroAnswerWarning[\s\S]*return/)
+ assert.match(page,/RESULT_UUID_PATTERN.test\(value.id\)/); assert.match(page,/router.push\(`\/result\/\$\{encodeURIComponent\(savedInterview.id\)\}`\)/)
+ assert.match(page,/curQRef.current = accepted.text; setQuestion\(accepted.text\)/); assert.match(page,/speakText\(accepted\)/)
+ assert.match(page,/submitted.q/); assert.match(page,/session.canSpeak\(accepted\)/); assert.match(page,/session.dispose\(\)/)
+ assert.match(page,/if \(!res.ok\) throw/); assert.match(page,/typeof data.text !== 'string'/)
+})
+test('UI guards and localized retries wired', () => {
+ assert.match(controls,/disabled=\{isCompleting \|\| transitionBusy\}/); assert.match(page,/transitionBusy=\{qLoading\}/)
+ assert.match(workspace,/!question \|\| !answer.trim\(\)/); assert.match(workspace,/disabled=\{qLoading \|\| isCompleting\}/)
+ for(const name of ['onRetryFeedback','onRetryQuestion','feedbackFailureMessage','questionFailureMessage']) { assert.ok(page.includes(name)); assert.ok(workspace.includes(name)) }
+ assert.equal((page.match(/retryFeedback: '/g)||[]).length,3)
+})
+// Execute the real page handlers with hook/provider mocks; no browser or external services.
+function pageHarness(language = 'en') {
+  const vm = require('node:vm'), path = require('node:path')
+  let cursor=0, mounting=true, tree
+  const hooks=[], effects=[], cleanups=[], requests=[], routes=[], audio=[]
+  const React = {
+    createElement(type, props, ...children) { return {type, props: {...props, children}} },
+    useRef(value) { const i=cursor++; if(!hooks[i]) hooks[i]={current:value}; return hooks[i] },
+    useState(value) { const i=cursor++; if(mounting) hooks[i]=value; return [hooks[i],next=>{hooks[i]=typeof next==='function'?next(hooks[i]):next}] },
+    useCallback(fn) { const i=cursor++; if(!hooks[i]) hooks[i]=fn; return hooks[i] },
+    useEffect(fn) { cursor++; if(mounting) effects.push(fn) },
+    Suspense: 'Suspense',
+  }
+  React.default=React
+  const imports = {
+    react: React,
+    'next/navigation': { useSearchParams:()=>({get:key=>key==='language'?language:null}), useRouter:()=>({push:route=>routes.push(route)}) },
+    '@/lib/interviews/interview-session-state': loaded.exports,
+    '@/components/ui': {TalentryButton:'Button'},
+    '@/components/interview/InterviewWorkspace': { default:'Workspace', InterviewFeedbackCard:'FeedbackCard' },
+    '@/components/interview/LiveInterviewControls': { default:'Controls' },
+    '@/components/interview/LiveInterviewHeader': { default:'Header' },
+    '@/components/interview/InterviewerStage': { default:'Stage' },
+    './interview.module.css': {default:{}},
+  }
+  const scope = {
+    React,
+    exports:{}, require:name=>{assert.ok(name in imports,name);return imports[name]},
+    console:{warn(){},error(){}}, setInterval:()=>1, clearInterval(){},
+    navigator:{mediaDevices:{getUserMedia:()=>Promise.reject(Error('mock camera'))}},
+    window:{matchMedia:()=>({matches:false,addEventListener(){},removeEventListener(){}})},
+    fetch:(url,options)=>{ const d=deferred(); requests.push({url,body:JSON.parse(options.body),...d}); return d.promise },
+    URL:{createObjectURL:()=> 'mock:audio',revokeObjectURL(){}},
+    Audio:class { constructor(){audio.push(this)} addEventListener(){} play(){return Promise.resolve()} pause(){this.paused=true} },
+  }
+  const output=ts.transpileModule(page,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.React}}).outputText
+  vm.runInNewContext(output,scope)
+  const content=scope.exports.default().props.children[0].type
+  function render(){cursor=0;tree=content();mounting=false;return tree}
+  function find(type,node=tree){if(!node||typeof node!=='object')return null;if(node.type===type)return node.props;for(const child of (node.props?.children||[]).flat(Infinity)){const result=find(type,child);if(result)return result}return null}
+  render(); for(const effect of effects) cleanups.push(effect())
+  return { requests,routes,audio,hooks,render,workspace:()=>find('Workspace'),controls:()=>find('Controls'),dispose:()=>cleanups.forEach(fn=>fn?.()) }
+}
+const flush = async () => { for(let i=0;i<12;i++) await Promise.resolve() }
+const textResponse = text => ({ok:true,json:async()=>({text})})
+async function initial(h,text='  Canonical Q?  ') { h.requests[0].resolve(textResponse(text)); await flush();h.render() }
+async function pageSubmit(h) { h.workspace().onAnswerChange('Original answer'); h.render(); const work=h.workspace().onSubmit(); h.render();return {work} }
+test('real page double submit and busy End Skip guards before provider calls',async()=>{
+ const h=pageHarness(); await h.controls().onEnd(); assert.equal(h.requests.length,1); await initial(h)
+ h.workspace().onAnswerChange('Answer');h.render();const submit=h.workspace().onSubmit
+ const first=submit();await submit();await h.controls().onEnd();await h.workspace().onNext();h.render()
+ assert.equal(h.requests.length,3) // initial question, TTS, one feedback
+ assert.equal(h.controls().transitionBusy,true)
+ h.requests[2].resolve(textResponse('{"strength":"S","improvement":"I","suggestion":"T"}'));await first;h.render()
+ assert.equal(h.workspace().qLoading,false);assert.equal(h.controls().transitionBusy,false)
+ assert.equal(h.workspace().question,'Canonical Q?');assert.equal(h.requests[1].body.text,'Canonical Q?');assert.equal(h.requests[2].body.message,'Soru: "Canonical Q?"\nCevap: "Answer"')
+ h.dispose()
+})
+test('real page feedback HTTP failure retry reuses committed pair exactly once',async()=>{
+ const h=pageHarness('de');await initial(h);const {work}=await pageSubmit(h)
+ h.requests[2].resolve({ok:false,status:503});await work;h.render();assert.equal(h.workspace().qLoading,false);assert.ok(h.workspace().feedbackFailureMessage);assert.equal(h.workspace().feedbackRetryLabel,'Feedback erneut versuchen')
+ const retry=h.workspace().onRetryFeedback();assert.deepEqual(h.requests[3].body,h.requests[2].body)
+ h.requests[3].resolve(textResponse('Feedback'));await retry;h.render()
+ const end=h.controls().onEnd();h.requests[4].resolve(textResponse('{"score":80,"summary":"Summary"}'));await flush()
+ assert.equal(h.requests[5].url,'/api/interviews');assert.equal(h.requests[5].body.answers.length,1);assert.equal(h.requests[5].body.answers[0].q,'Canonical Q?')
+ h.requests[5].resolve({ok:true,json:async()=>({id:'11111111-1111-4111-8111-111111111111'})});await end;assert.deepEqual(h.routes,['/result/11111111-1111-4111-8111-111111111111']);h.dispose()
+})
+test('real page initial malformed question retry retains ordinal one',async()=>{
+ const h=pageHarness('tr');h.requests[0].resolve({ok:true,json:async()=>({text:42})});await flush();h.render()
+ assert.equal(h.workspace().questionNumber,0);assert.equal(h.workspace().qLoading,false);assert.ok(h.workspace().questionFailureMessage)
+ const retry=h.workspace().onRetryQuestion();assert.equal(h.requests[1].body.message,'1. mülakat sorusu');h.requests[1].resolve(textResponse('Valid'));await retry;h.render();assert.equal(h.workspace().questionNumber,1);h.dispose()
+})
+test('real page zero answers performs no evaluation save or navigation and remains usable',async()=>{
+ const h=pageHarness();await initial(h);await h.controls().onEnd();h.render();assert.ok(h.controls().completionError);assert.equal(h.controls().isCompleting,false);assert.equal(h.requests.length,2);assert.deepEqual(h.routes,[])
+ h.workspace().onAnswerChange('Answer');h.render();const work=h.workspace().onSubmit();assert.equal(h.requests.length,3);h.requests[2].resolve(textResponse('Feedback'));await work;h.dispose()
+})
+test('real page Q5 Next completes partial answers and never requests six',async()=>{
+ const h=pageHarness();await initial(h)
+ for(let n=2;n<=5;n++){const next=h.workspace().onNext();const req=h.requests.at(-1);assert.equal(req.body.message,`${n}. mülakat sorusu`);req.resolve(textResponse('Q'+n));await next;h.render()}
+ const {work}=await pageSubmit(h);h.requests.at(-1).resolve(textResponse('Feedback'));await work;h.render()
+ const next=h.workspace().onNext();h.requests.at(-1).resolve(textResponse('{"score":70,"summary":"Partial"}'));await flush();const save=h.requests.at(-1)
+ assert.equal(save.url,'/api/interviews');assert.equal(save.body.answers.length,1);assert.equal(save.body.answers[0].q,'Q5');assert.equal(h.requests.some(r=>r.body.message==='6. mülakat sorusu'),false)
+ save.resolve({ok:true,json:async()=>({id:'11111111-1111-4111-8111-111111111111'})});await next;h.dispose()
+})
+test('real page dispose prevents late question feedback and audio mutation',async()=>{
+ const h=pageHarness();h.dispose();h.requests[0].resolve(textResponse('late'));await flush();h.render();assert.equal(h.workspace().question,'');assert.equal(h.requests.length,1)
+ const f=pageHarness();await initial(f);const {work}=await pageSubmit(f);f.dispose();f.requests[2].resolve(textResponse('late feedback'));f.requests[1].resolve({ok:true,blob:async()=>({})});await work;await flush();f.render();assert.equal(f.workspace().feedback,null);assert.equal(f.audio.length,0)
+})
+test('real page completion invalidates pending TTS and failure permits explicit retry',async()=>{
+ const h=pageHarness();await initial(h);const {work}=await pageSubmit(h);h.requests[2].resolve(textResponse('Feedback'));await work;h.render()
+ const end=h.controls().onEnd();h.requests[1].resolve({ok:true,blob:async()=>({})});h.requests[3].resolve(textResponse('{"score":999,"summary":"Invalid"}'));await end;await flush();h.render();assert.equal(h.audio.length,0);assert.equal(h.controls().isCompleting,false);assert.ok(h.controls().completionError)
+ const retry=h.controls().onEnd();assert.equal(h.requests.length,5);h.requests[4].resolve({ok:false,status:500});await retry;h.dispose()
+})
```

### docs/04_Project_Memory/CURRENT_STATE.md

```diff
diff --git a/docs/04_Project_Memory/CURRENT_STATE.md b/docs/04_Project_Memory/CURRENT_STATE.md
index ee76ee5..26c61a5 100644
--- a/docs/04_Project_Memory/CURRENT_STATE.md
+++ b/docs/04_Project_Memory/CURRENT_STATE.md
@@ -2,6 +2,71 @@

 Last updated: 2026-10-06

+## INTERVIEW_RELIABILITY_01 — Current acceptance checkpoint — 2026-10-06
+
+### Current roadmap progress and Git boundary
+
+- ROADMAP_FREEZE_01: complete / committed / pushed. Recovery point: `50e4da96e00a9f4c70979b5bada1ca71f3a68403` (`docs(roadmap): freeze web v1 critical path`). Pushed status records user-provided checkpoint evidence; no network fetch performed in this documentation turn.
+- INTERVIEW_RELIABILITY_01: **IMPLEMENTATION + AUTOMATED VALIDATION + LOCAL BROWSER ACCEPTANCE: PASS**. Current uncommitted stage; acceptance PASS pending final Git closure. No stage commit hash exists or is invented here.
+- Next planned stage AFTER commit: COMPLETION_IDEMPOTENCY_01, **planned / NOT STARTED / NOT AUTHORIZED**.
+- Branch: feature/auth-foundation. Final pre-commit review pending. No staging, commit, push or automatic next-stage work authorized by this documentation closure.
+
+### Recorded implementation validation (not rerun in documentation turn)
+
+| Gate | Exact recorded result |
+|---|---|
+| `node --test lib/interviews/interview-session-state.test.cjs` | Exit 0; 50 tests, 50 pass, 0 fail/cancelled/skipped/todo |
+| Existing Interview regression command (below) | Exit 0; 96 tests, 96 pass, 0 fail/cancelled/skipped/todo |
+| `npx.cmd tsc --noEmit --incremental false` | Exit 0; PASS |
+| `git diff --check` | Exit 0; PASS; LF-to-CRLF warning for page.tsx |
+| Read-only Next.js dev process inspection | Initial sandbox access denied; approved elevated inspection exit 0, no matching Next.js dev server detected |
+| `npm.cmd run build` | Exit 0; PASS; Next.js 14.2.5, 22/22 pages generated |
+
+Existing regression command:
+
+```text
+node --test lib/interviews/read-owned-interview.test.cjs lib/interviews/delete-owned-interview.test.cjs lib/interviews/history-cursor.test.cjs lib/interviews/history-pagination.test.cjs lib/reports/interview-report.test.cjs components/result/useInterviewDeletion.test.cjs components/interviews/useFullInterviewHistory.test.cjs
+```
+
+The initial PDF regression invocation failed with `spawnSync python EPERM`; the approved rerun used invocation-local REPORT_PDF_PYTHON pointing to existing Codex-bundled Python and passed. No package or persistent configuration change. The first page-mock test attempt had a missing React binding in the test harness; corrected within the approved test file before the final 50/50 run. Final build emitted two webpack cache warnings: "Caching failed for pack: Error: Unable to snapshot resolve dependencies". TypeScript/build emitted npm major-version update notices; no update performed. Git warned LF would be replaced by CRLF for page.tsx. Warnings were not hidden and did not change successful exit status.
+
+### User-verified local browser acceptance — 2026-10-06
+
+These observations were supplied by the user after supervised acceptance; the documentation agent did not rerun browser actions or inspect/mutate Supabase.
+
+| Check | User-verified evidence | Result |
+|---|---|---|
+| Initial question / TTS | Initial question rendered. Initial TTS POST returned 500; route/request contract was unchanged from the safe base. ElevenLabs account showed a failed payment. User corrected billing; account then showed Starter and 90,000 / 90,000 credits. Q2 TTS worked without Talentry code changes. | PASS after external incident resolution |
+| Zero-answer contract | Q1 skipped; End invoked on Q2 with zero submitted answers. Existing no-result/no-save warning appeared; no Result navigation. Returning preserved active Q2, usable controls and available End. Zero-answer contract remains no evaluation, no save, no Result, usable session. | PASS |
+| Feedback-time End | One answer submitted on Q2. End disabled while feedback pending and enabled after feedback completed. | PASS |
+| Generation-time End | MutationObserver on the visible native End button recorded disabled=false -> true -> false: enabled before generation, disabled during generation, enabled afterward. Earlier visual observation was timing/paint evidence, not a proven product defect. No production correction required. | PASS |
+| Final-question boundary | Q4 generated and spoke; Q4 Skip generated Q5; Q5 displayed 5/5 and spoke; Q5 Skip entered completion. No Q6 generated. | PASS |
+| Partial completion | User explicitly approved completion of the first acceptance interview. Only Q2 had a submitted answer; Q1/Q3/Q4/Q5 skipped. Evaluation completed, interview persisted, Result opened and contained exactly one saved answer. No Q6. | PASS |
+| Feedback failure / retry | Second session: network Offline before Submit. Answer committed once; feedback failed; busy cleared; session usable; End available; answer preserved and could not be submitted as another answer. Localized failure message and "Geri bildirimi tekrar dene" appeared. After network restoration, one feedback-only retry reused that answer, created no duplicate, succeeded, showed "Değerlendirmen hazır", and feedback panel opened. | PASS |
+| Generation failure / retry | Second session: Offline before Next. Generation failed, busy cleared, Q1 remained visible, session usable, End available, localized failure message and "Soruyu tekrar dene" appeared. Ordinal not consumed. Restored-network retry produced Q2/5, not Q3; TTS worked. | PASS |
+| Second-session cleanup | Second session was not completed. User closed test tab after Q2 generation. No completion/save/Result was intentionally triggered; no persisted second-session record is claimed. | Recorded boundary |
+
+Incident classification: **EXTERNAL PROVIDER / ACCOUNT BILLING INCIDENT, resolved during acceptance**. Not an INTERVIEW_RELIABILITY_01 regression. No payment/card details retained.
+
+Generation-End diagnostic: **false -> true -> false** (native disabled attribute). The earlier visual observation is superseded by this user-verified DOM evidence.
+
+History: **HISTORY_PAGINATION_01: NATURAL-RECORD DEFERRED ACCEPTANCE**. Historical directly verified baseline: 11 records on 2026-10-06. One natural persisted interview was created during INTERVIEW_RELIABILITY_01 acceptance after that baseline. History was not re-counted; no new verified total is asserted. No synthetic pagination seeding. Natural 21+ acceptance remains deferred and does not block unrelated WEB work.
+
+### Automated-only qualifications
+
+Immediate double-submit handler race; submit + End same-callback race; submit + Skip overlap; stale feedback/question continuations after completion; obsolete TTS continuation after completion; disposal/unmount invalidation; immutable completion snapshot mutation attacks; synchronous handler rejection independent of UI paint; and one-completion-attempt admission remain automated/deterministic coverage, not browser-tested claims.
+
+### Deliberately deferred boundaries — non-blocking for this stage
+
+- Underlying provider requests are not necessarily physically cancelled; correctness relies on operation/session identity invalidation.
+- Committed-but-response-lost POST duplicate persistence remains unresolved: COMPLETION_IDEMPOTENCY_01.
+- Session resume remains deferred.
+- Provider auth/privacy hardening and scoring trust remain later roadmap work.
+- Microphone acquisition truthfulness remains MEDIA_PROVIDER_V1_01.
+- No synthetic pagination seeding; natural-record acceptance policy remains unchanged.
+
+This current entry supersedes older pending ROADMAP_FREEZE_01 and not-started INTERVIEW_RELIABILITY_01 checkpoints below. Historical reports/entries remain unchanged. Documentation-only closure: executable files/tests unchanged; no tests/build rerun, browser actions, provider calls, server restart or data/Git mutation.
+
 ## ROADMAP_FREEZE_01 — Current planning checkpoint — 2026-10-06

 Documentation implementation complete; freeze review/acceptance pending. Verified safe base: 317c221b576abe5e39ac4e0e79fe77ea33fe754f on feature/auth-foundation, equal to local origin; initial tree clean. Historical/pre-commit snapshots below do not override this base. No future commit asserted.
```

### docs/04_Project_Memory/STAGE_LOG.md

```diff
diff --git a/docs/04_Project_Memory/STAGE_LOG.md b/docs/04_Project_Memory/STAGE_LOG.md
index ae705be..1673b32 100644
--- a/docs/04_Project_Memory/STAGE_LOG.md
+++ b/docs/04_Project_Memory/STAGE_LOG.md
@@ -1924,3 +1924,69 @@ Created [canonical WEB V1 roadmap](../03_Roadmap/WEB_V1_MASTER_ROADMAP.md), shor
 HISTORY_PAGINATION_01: NATURAL-RECORD DEFERRED ACCEPTANCE. User-verified live baseline on 2026-10-06: 11 real records. Do NOT create synthetic interviews merely to reach 21. Deterministic pagination tests and existing <20 browser behavior remain accepted. Real 21+ browser acceptance waits until ordinary project testing/development naturally produces at least 21 records. This acceptance gap does NOT block unrelated WEB development. Earlier synthetic seed plans are historical/superseded for current planning; preserve historical entries and old reports. No Supabase query or mutation performed in this stage.

 Next planned stage INTERVIEW_RELIABILITY_01 remains NOT STARTED; separate audit and explicit scope approval required. Exact documentation validation results belong to the new Engineering Report; no historical runtime/build results rerun.
+
+
+## INTERVIEW_RELIABILITY_01 — Implementation and acceptance closure — 2026-10-06
+
+### Current roadmap progress and Git boundary
+
+- ROADMAP_FREEZE_01: complete / committed / pushed. Recovery point: `50e4da96e00a9f4c70979b5bada1ca71f3a68403` (`docs(roadmap): freeze web v1 critical path`). Pushed status records user-provided checkpoint evidence; no network fetch performed in this documentation turn.
+- INTERVIEW_RELIABILITY_01: **IMPLEMENTATION + AUTOMATED VALIDATION + LOCAL BROWSER ACCEPTANCE: PASS**. Current uncommitted stage; acceptance PASS pending final Git closure. No stage commit hash exists or is invented here.
+- Next planned stage AFTER commit: COMPLETION_IDEMPOTENCY_01, **planned / NOT STARTED / NOT AUTHORIZED**.
+- Branch: feature/auth-foundation. Final pre-commit review pending. No staging, commit, push or automatic next-stage work authorized by this documentation closure.
+
+### Recorded implementation validation (not rerun in documentation turn)
+
+| Gate | Exact recorded result |
+|---|---|
+| `node --test lib/interviews/interview-session-state.test.cjs` | Exit 0; 50 tests, 50 pass, 0 fail/cancelled/skipped/todo |
+| Existing Interview regression command (below) | Exit 0; 96 tests, 96 pass, 0 fail/cancelled/skipped/todo |
+| `npx.cmd tsc --noEmit --incremental false` | Exit 0; PASS |
+| `git diff --check` | Exit 0; PASS; LF-to-CRLF warning for page.tsx |
+| Read-only Next.js dev process inspection | Initial sandbox access denied; approved elevated inspection exit 0, no matching Next.js dev server detected |
+| `npm.cmd run build` | Exit 0; PASS; Next.js 14.2.5, 22/22 pages generated |
+
+Existing regression command:
+
+```text
+node --test lib/interviews/read-owned-interview.test.cjs lib/interviews/delete-owned-interview.test.cjs lib/interviews/history-cursor.test.cjs lib/interviews/history-pagination.test.cjs lib/reports/interview-report.test.cjs components/result/useInterviewDeletion.test.cjs components/interviews/useFullInterviewHistory.test.cjs
+```
+
+The initial PDF regression invocation failed with `spawnSync python EPERM`; the approved rerun used invocation-local REPORT_PDF_PYTHON pointing to existing Codex-bundled Python and passed. No package or persistent configuration change. The first page-mock test attempt had a missing React binding in the test harness; corrected within the approved test file before the final 50/50 run. Final build emitted two webpack cache warnings: "Caching failed for pack: Error: Unable to snapshot resolve dependencies". TypeScript/build emitted npm major-version update notices; no update performed. Git warned LF would be replaced by CRLF for page.tsx. Warnings were not hidden and did not change successful exit status.
+
+### User-verified local browser acceptance — 2026-10-06
+
+These observations were supplied by the user after supervised acceptance; the documentation agent did not rerun browser actions or inspect/mutate Supabase.
+
+| Check | User-verified evidence | Result |
+|---|---|---|
+| Initial question / TTS | Initial question rendered. Initial TTS POST returned 500; route/request contract was unchanged from the safe base. ElevenLabs account showed a failed payment. User corrected billing; account then showed Starter and 90,000 / 90,000 credits. Q2 TTS worked without Talentry code changes. | PASS after external incident resolution |
+| Zero-answer contract | Q1 skipped; End invoked on Q2 with zero submitted answers. Existing no-result/no-save warning appeared; no Result navigation. Returning preserved active Q2, usable controls and available End. Zero-answer contract remains no evaluation, no save, no Result, usable session. | PASS |
+| Feedback-time End | One answer submitted on Q2. End disabled while feedback pending and enabled after feedback completed. | PASS |
+| Generation-time End | MutationObserver on the visible native End button recorded disabled=false -> true -> false: enabled before generation, disabled during generation, enabled afterward. Earlier visual observation was timing/paint evidence, not a proven product defect. No production correction required. | PASS |
+| Final-question boundary | Q4 generated and spoke; Q4 Skip generated Q5; Q5 displayed 5/5 and spoke; Q5 Skip entered completion. No Q6 generated. | PASS |
+| Partial completion | User explicitly approved completion of the first acceptance interview. Only Q2 had a submitted answer; Q1/Q3/Q4/Q5 skipped. Evaluation completed, interview persisted, Result opened and contained exactly one saved answer. No Q6. | PASS |
+| Feedback failure / retry | Second session: network Offline before Submit. Answer committed once; feedback failed; busy cleared; session usable; End available; answer preserved and could not be submitted as another answer. Localized failure message and "Geri bildirimi tekrar dene" appeared. After network restoration, one feedback-only retry reused that answer, created no duplicate, succeeded, showed "Değerlendirmen hazır", and feedback panel opened. | PASS |
+| Generation failure / retry | Second session: Offline before Next. Generation failed, busy cleared, Q1 remained visible, session usable, End available, localized failure message and "Soruyu tekrar dene" appeared. Ordinal not consumed. Restored-network retry produced Q2/5, not Q3; TTS worked. | PASS |
+| Second-session cleanup | Second session was not completed. User closed test tab after Q2 generation. No completion/save/Result was intentionally triggered; no persisted second-session record is claimed. | Recorded boundary |
+
+Incident classification: **EXTERNAL PROVIDER / ACCOUNT BILLING INCIDENT, resolved during acceptance**. Not an INTERVIEW_RELIABILITY_01 regression. No payment/card details retained.
+
+Generation-End diagnostic: **false -> true -> false** (native disabled attribute). The earlier visual observation is superseded by this user-verified DOM evidence.
+
+History: **HISTORY_PAGINATION_01: NATURAL-RECORD DEFERRED ACCEPTANCE**. Historical directly verified baseline: 11 records on 2026-10-06. One natural persisted interview was created during INTERVIEW_RELIABILITY_01 acceptance after that baseline. History was not re-counted; no new verified total is asserted. No synthetic pagination seeding. Natural 21+ acceptance remains deferred and does not block unrelated WEB work.
+
+### Automated-only qualifications
+
+Immediate double-submit handler race; submit + End same-callback race; submit + Skip overlap; stale feedback/question continuations after completion; obsolete TTS continuation after completion; disposal/unmount invalidation; immutable completion snapshot mutation attacks; synchronous handler rejection independent of UI paint; and one-completion-attempt admission remain automated/deterministic coverage, not browser-tested claims.
+
+### Deliberately deferred boundaries — non-blocking for this stage
+
+- Underlying provider requests are not necessarily physically cancelled; correctness relies on operation/session identity invalidation.
+- Committed-but-response-lost POST duplicate persistence remains unresolved: COMPLETION_IDEMPOTENCY_01.
+- Session resume remains deferred.
+- Provider auth/privacy hardening and scoring trust remain later roadmap work.
+- Microphone acquisition truthfulness remains MEDIA_PROVIDER_V1_01.
+- No synthetic pagination seeding; natural-record acceptance policy remains unchanged.
+
+Approved implementation inventory: three modified files (app/interview/page.tsx, components/interview/InterviewWorkspace.tsx, components/interview/LiveInterviewControls.tsx) and two new files (lib/interviews/interview-session-state.ts, lib/interviews/interview-session-state.test.cjs). Documentation closure adds two new sprint reports and updates four Project Memory files. No API/schema/auth/history/result/profile/PDF/config/dependency changes. This append-only entry supersedes older planning status, not historical records.
```

### docs/04_Project_Memory/DEFERRED_FIXES.md

```diff
diff --git a/docs/04_Project_Memory/DEFERRED_FIXES.md b/docs/04_Project_Memory/DEFERRED_FIXES.md
index 6f9962b..d6d53ad 100644
--- a/docs/04_Project_Memory/DEFERRED_FIXES.md
+++ b/docs/04_Project_Memory/DEFERRED_FIXES.md
@@ -1060,3 +1060,30 @@ HISTORY_PAGINATION_01: NATURAL-RECORD DEFERRED ACCEPTANCE. User-verified live ba
 [Master roadmap](../03_Roadmap/WEB_V1_MASTER_ROADMAP.md) owns full classifications. V1.1/post-launch: History search/filter, favorites/tags, virtualization, advanced Dashboard modules, Recommended Jobs, advanced analytics, notifications, profile photo, email editing, device/session management. Native APP follows WEB launch. Career Level/XP/badges/skill trees/gamification remain excluded from MVP.

 Session resume, CV, HeyGen/avatar, MFA, password change, account/data deletion and billing remain conditional, not silently required. Audited launch hardening is planned, not resolved. INTERVIEW_RELIABILITY_01 is next planned, NOT STARTED; server completion idempotency stays separate. Historical entries/reports preserved.
+
+
+## INTERVIEW_RELIABILITY_01 — Accepted in-session reliability closure — 2026-10-06
+
+### Current roadmap progress and Git boundary
+
+- ROADMAP_FREEZE_01: complete / committed / pushed. Recovery point: `50e4da96e00a9f4c70979b5bada1ca71f3a68403` (`docs(roadmap): freeze web v1 critical path`). Pushed status records user-provided checkpoint evidence; no network fetch performed in this documentation turn.
+- INTERVIEW_RELIABILITY_01: **IMPLEMENTATION + AUTOMATED VALIDATION + LOCAL BROWSER ACCEPTANCE: PASS**. Current uncommitted stage; acceptance PASS pending final Git closure. No stage commit hash exists or is invented here.
+- Next planned stage AFTER commit: COMPLETION_IDEMPOTENCY_01, **planned / NOT STARTED / NOT AUTHORIZED**.
+- Branch: feature/auth-foundation. Final pre-commit review pending. No staging, commit, push or automatic next-stage work authorized by this documentation closure.
+
+In-session duplicate submission, transition/completion overlap, premature ordinal advancement, feedback failure busy lock, mutable completion snapshots, and stale question/feedback/TTS continuation ownership are addressed within the bounded five-file implementation. Focused 50/50, existing Interview 96/96, TypeScript and build 22/22 PASS; user-verified browser acceptance PASS. No broader provider/server persistence architecture claim. Resolution is acceptance-complete but uncommitted; no resolution commit is asserted.
+
+### Deliberately deferred boundaries — non-blocking for this stage
+
+- Underlying provider requests are not necessarily physically cancelled; correctness relies on operation/session identity invalidation.
+- Committed-but-response-lost POST duplicate persistence remains unresolved: COMPLETION_IDEMPOTENCY_01.
+- Session resume remains deferred.
+- Provider auth/privacy hardening and scoring trust remain later roadmap work.
+- Microphone acquisition truthfulness remains MEDIA_PROVIDER_V1_01.
+- No synthetic pagination seeding; natural-record acceptance policy remains unchanged.
+
+### Automated-only qualifications
+
+Immediate double-submit handler race; submit + End same-callback race; submit + Skip overlap; stale feedback/question continuations after completion; obsolete TTS continuation after completion; disposal/unmount invalidation; immutable completion snapshot mutation attacks; synchronous handler rejection independent of UI paint; and one-completion-attempt admission remain automated/deterministic coverage, not browser-tested claims.
+
+HISTORY_PAGINATION_01: NATURAL-RECORD DEFERRED ACCEPTANCE; directly verified historical baseline 11 on 2026-10-06. One natural persisted acceptance interview created afterward; History not re-counted, no new verified total. Second recovery session not completed; no saved second record claimed. No synthetic seeding. Deployed PDF smoke and previous wrong-owner live DELETE qualification remain unchanged. Earlier pending reliability planning is superseded only within the approved in-session boundaries.
```

### docs/04_Project_Memory/DECISIONS_AND_RISKS.md

```diff
diff --git a/docs/04_Project_Memory/DECISIONS_AND_RISKS.md b/docs/04_Project_Memory/DECISIONS_AND_RISKS.md
index 5226693..04120dd 100644
--- a/docs/04_Project_Memory/DECISIONS_AND_RISKS.md
+++ b/docs/04_Project_Memory/DECISIONS_AND_RISKS.md
@@ -1745,3 +1745,32 @@ Product gates before dependent coding: session resume storage/restart/privacy/de
 Technical launch risks: Cost-bearing Claude / ElevenLabs / HeyGen-token route protection; Claude client-supplied prompts/private-content logging/request constraints; ambiguous completion retry can duplicate records; interview transition race / stale async risks; invalid interviewer input can create undefined interviewer state; fragmented application localization / root lang; microphone UI currently implies capture although acquisition uses audio:false. These are audited unresolved risks, not fixes completed by this documentation stage.

 Operational follow-ups: environment purpose unknown, email delivery, deployed PDF packaging/resources, provider/cost controls and staging/release evidence. Frozen PKCE/recovery, profile reconciliation/dirty drafts, owner-authorized jsPDF/persisted language, ownership privacy, keyset History and Result-page hard deletion remain protected. Next technical stage planned only, NOT STARTED. Existing acceptance limitations retained.
+
+
+## INTERVIEW_RELIABILITY_01 — Accepted bounded reliability decision and risks — 2026-10-06
+
+### Current roadmap progress and Git boundary
+
+- ROADMAP_FREEZE_01: complete / committed / pushed. Recovery point: `50e4da96e00a9f4c70979b5bada1ca71f3a68403` (`docs(roadmap): freeze web v1 critical path`). Pushed status records user-provided checkpoint evidence; no network fetch performed in this documentation turn.
+- INTERVIEW_RELIABILITY_01: **IMPLEMENTATION + AUTOMATED VALIDATION + LOCAL BROWSER ACCEPTANCE: PASS**. Current uncommitted stage; acceptance PASS pending final Git closure. No stage commit hash exists or is invented here.
+- Next planned stage AFTER commit: COMPLETION_IDEMPOTENCY_01, **planned / NOT STARTED / NOT AUTHORIZED**.
+- Branch: feature/auth-foundation. Final pre-commit review pending. No staging, commit, push or automatic next-stage work authorized by this documentation closure.
+
+Decision: a small framework-independent synchronous session helper owns operation identity/admission, accepted question identity/ordinal, one-answer consumption, frozen completion snapshots and disposal. React busy state presents the invariant; helper admission enforces it independently of paint. End disabled during generation/feedback; no queued End. Valid trimmed question accepted before ordinal commit; five-question limit. Feedback-only retry reuses the committed question/answer. Same frozen answer set feeds evaluation and persistence; completion invalidates audio. Existing provider architecture, prompts, payload/UUID handoff and zero/partial contracts preserved.
+
+User-verified browser evidence supersedes the initial generation-End visual concern: visible native button MutationObserver disabled false -> true -> false; timing/paint observation, no proven defect or production correction. Initial TTS 500 classified EXTERNAL PROVIDER / ACCOUNT BILLING INCIDENT, resolved by user correcting ElevenLabs billing. Starter, 90,000 / 90,000 credits reported; Q2 TTS worked with unchanged Talentry code. No payment/card details.
+
+### Automated-only qualifications
+
+Immediate double-submit handler race; submit + End same-callback race; submit + Skip overlap; stale feedback/question continuations after completion; obsolete TTS continuation after completion; disposal/unmount invalidation; immutable completion snapshot mutation attacks; synchronous handler rejection independent of UI paint; and one-completion-attempt admission remain automated/deterministic coverage, not browser-tested claims.
+
+### Deliberately deferred boundaries — non-blocking for this stage
+
+- Underlying provider requests are not necessarily physically cancelled; correctness relies on operation/session identity invalidation.
+- Committed-but-response-lost POST duplicate persistence remains unresolved: COMPLETION_IDEMPOTENCY_01.
+- Session resume remains deferred.
+- Provider auth/privacy hardening and scoring trust remain later roadmap work.
+- Microphone acquisition truthfulness remains MEDIA_PROVIDER_V1_01.
+- No synthetic pagination seeding; natural-record acceptance policy remains unchanged.
+
+History natural-record policy preserved: historical directly verified 11-record baseline on 2026-10-06; one natural persisted acceptance interview afterward; no re-count or new verified total. Second session not completed, no second persisted record claimed. No synthetic seeding. Existing frozen foundations and prior deployed PDF/wrong-owner live DELETE qualifications remain protected.
```

### docs/01_Engineering/Sprint_INTERVIEW_RELIABILITY_01_Summary.md

```diff
--- /dev/null
+++ b/docs/01_Engineering/Sprint_INTERVIEW_RELIABILITY_01_Summary.md
@@ -0,0 +1,17 @@
+# Sprint INTERVIEW_RELIABILITY_01 Summary
+
+- Title: Bounded in-session interview reliability and deterministic validation.
+- Date: 2026-10-06 (Europe/Istanbul).
+- Branch: feature/auth-foundation.
+- Status: IMPLEMENTATION + AUTOMATED VALIDATION + LOCAL BROWSER ACCEPTANCE: PASS; uncommitted, awaiting final pre-commit review / Git closure.
+- Goal: One submitted answer per accepted question, mutually exclusive transitions/completion, valid question ordinal commit, failure recovery, immutable completion answer set and inert obsolete continuations.
+- Created files: lib/interviews/interview-session-state.ts; lib/interviews/interview-session-state.test.cjs; docs/01_Engineering/Sprint_INTERVIEW_RELIABILITY_01_Summary.md; docs/01_Engineering/Sprint_INTERVIEW_RELIABILITY_01_Engineering_Report.md.
+- Modified files: app/interview/page.tsx; components/interview/InterviewWorkspace.tsx; components/interview/LiveInterviewControls.tsx; docs/04_Project_Memory/CURRENT_STATE.md; docs/04_Project_Memory/STAGE_LOG.md; docs/04_Project_Memory/DEFERRED_FIXES.md; docs/04_Project_Memory/DECISIONS_AND_RISKS.md.
+- Validation: recorded focused 50/50 PASS; existing Interview 96/96 PASS; TypeScript PASS; git diff --check PASS; production build PASS, 22/22. Tests/build not rerun in documentation turn. Documentation whitespace/scope/content validation recorded in Engineering Report.
+- Browser acceptance: user-verified initial question/TTS after external incident resolution; zero-answer recovery; feedback/generation-time End; Q5/no Q6; exactly-one-answer partial Result; feedback-only retry; failed-generation ordinal preservation/retry. Second recovery session not completed.
+- ElevenLabs incident: EXTERNAL PROVIDER / ACCOUNT BILLING INCIDENT, resolved during acceptance. Unchanged route/request, failed payment corrected by user, Starter / 90,000 of 90,000 credits reported; Q2 TTS worked without code changes. Not a reliability regression; no payment/card details retained.
+- Generation-End DOM evidence: disabled false -> true -> false. Earlier visual observation was timing/paint, not a proven defect; no production correction.
+- Risks/problems: physical request cancellation, response-lost persistence idempotency, session resume, provider auth/privacy, scoring trust and microphone truthfulness deliberately deferred; automated races/stale/snapshot coverage not claimed browser-tested. Build cache warnings, LF/CRLF and npm notices retained in Engineering Report.
+- History: NATURAL-RECORD DEFERRED ACCEPTANCE; historical verified 11 on 2026-10-06; one natural persisted acceptance record afterward. History not re-counted; no new verified total or synthetic seeding.
+- Approval status: user-approved implementation and user-verified local acceptance; final pre-commit review pending. No commit/staging/push authorization exercised.
+- Recovery point: 50e4da96e00a9f4c70979b5bada1ca71f3a68403; ROADMAP_FREEZE_01 complete/committed/pushed. COMPLETION_IDEMPOTENCY_01 planned only AFTER commit, not started or authorized.
```

## 13. Risks, Limitations, and Technical Debt

### Deliberately deferred boundaries — non-blocking for this stage

- Underlying provider requests are not necessarily physically cancelled; correctness relies on operation/session identity invalidation.
- Committed-but-response-lost POST duplicate persistence remains unresolved: COMPLETION_IDEMPOTENCY_01.
- Session resume remains deferred.
- Provider auth/privacy hardening and scoring trust remain later roadmap work.
- Microphone acquisition truthfulness remains MEDIA_PROVIDER_V1_01.
- No synthetic pagination seeding; natural-record acceptance policy remains unchanged.

### Automated-only qualifications

Immediate double-submit handler race; submit + End same-callback race; submit + Skip overlap; stale feedback/question continuations after completion; obsolete TTS continuation after completion; disposal/unmount invalidation; immutable completion snapshot mutation attacks; synchronous handler rejection independent of UI paint; and one-completion-attempt admission remain automated/deterministic coverage, not browser-tested claims.

Existing deployed PDF smoke and wrong-owner live DELETE acceptance qualifications remain unchanged. These deferred boundaries are not blockers to closing INTERVIEW_RELIABILITY_01.

## 14. Untouched-Module Confirmation

No API route/schema/RLS/auth/recovery/History/Result/Profile/PDF/configuration/package/dependency changes. No production fixes after browser diagnostics; no extra files, synthetic seeding, Supabase mutations, provider calls, browser actions, server restarts or tests/build reruns in documentation closure. Executable/test hashes verified unchanged across this turn. Previous sprint reports remain immutable; historical memory preserved.

## 15. Approval Required

Implementation is user-approved and local browser acceptance user-verified PASS. Final pre-commit review / Git closure remains pending; no stage commit hash invented. Stop for final review. No staging, commit or push performed. COMPLETION_IDEMPOTENCY_01 is planned only AFTER commit, NOT STARTED and NOT AUTHORIZED.
