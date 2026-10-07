# Sprint ROUTE_INPUT_HARDENING_01 Engineering Report

## Report identity / repository state before implementation

- Title: Fail-closed Live route and shared input contract.
- Date recorded: 2026-10-07 (Europe/Istanbul).
- **IMPLEMENTATION + AUTOMATED VALIDATION + LOCAL BROWSER ACCEPTANCE: PASS**.
- Current stage: **UNCOMMITTED / pending final Git closure**; final documentation/pre-commit review required. No commit/push approval or future hash asserted.
- Branch: feature/auth-foundation. Safe committed base and local origin ref: 1ce03bae7a002b4b68e274e2dfbfb872300e9d3b (fix(interviews): make completion persistence idempotent).
- **COMPLETION_IDEMPOTENCY_01: complete / committed / pushed**; closure supplied by user and committed HEAD verified locally; no remote fetch.
- Next roadmap stage AFTER Git closure: **SECURITY_PRIVACY_01 — planned / NOT STARTED / NOT IMPLEMENTED / NOT YET AUTHORIZED**. No automatic next-stage authority.
- Repository: C:\Users\p-ayd\interviewai. Phase 2 began with clean working tree, expected branch, HEAD == local origin/feature/auth-foundation == 1ce03bae7a002b4b68e274e2dfbfb872300e9d3b.
- Documentation turn began with exactly 11 approved uncommitted implementation/test files; no unrelated changes. The two report paths did not exist and were created without replacing prior reports.

## Objective, forensic root cause and boundaries

Direct /interview was an unguarded client page. Missing params silently defaulted to a usable session. Unknown iv indexed a Record<string, any>, potentially producing undefined interviewer state and render failure; nonempty invalid enum strings could yield undefined prompt fragments or inconsistent raw persisted language. Setup-only controls did not protect direct URLs, and POST accepted string enum/text shapes without membership/canonical constraints.

Bounded objective: authenticated valid entry works as before; missing/malformed config fails closed before Live mount; canonical new POST metadata is enforced; completed reliability/idempotency and historical read contracts stay intact. Only the approved 11 implementation/test files and six documentation files changed. No provider security/auth redesign, middleware, schema, dependency, UI/CSS redesign or later-stage implementation.

## Completed route/input decision

Server /interview order: existing trusted getAuthenticatedUser -> signed-out /login redirect -> parse decoded searchParams -> invalid/missing config /interview/setup redirect -> typed LiveInterviewClient. No middleware or auth redesign. Valid authenticated Setup and direct valid Live URLs remain usable without login detours.

The framework-independent, dependency-free interview-setup-input helper owns runtime sets and derived types: interviewer f/m; level junior/mid/senior; type behavioral/technical/mixed/case; persona friendly/formal/tough/curious; interview language tr/en/de. Membership uses exact array comparison, never truthy object lookup: unknown, wrong-case, constructor and __proto__ values are rejected.

Consumed query keys: iv, role, company, level, itype, persona, language. iv/level/itype/persona/language are required exactly once. role/company are optional at most once. Array representations of any consumed key are rejected, including same-value duplicates. cv and arbitrary unused extras remain ignored. Next-decoded values are validated without manual URL decoding.

Role/company remain optional. Raw decoded length is checked before trim: <=200 Unicode code points using Array.from, with C0 U+0000-U+001F and C1/DEL U+007F-U+009F rejected. Surrounding whitespace is trimmed; missing/empty/whitespace-only values become Genel. Ordinary Unicode, accents and emoji remain unchanged after trim. Setup uses the same helper and localized TR/EN/DE accessible validation feedback.

Live logic is extracted into components/interview/LiveInterviewClient.tsx with an InterviewSetupInput config prop, no URLSearchParams parsing and no required-config defaults. A deterministic key derived from all validated config fields prevents different configurations mixing old session state. Existing effects, provider/prompt/TTS, transition, completion and render behavior remain semantically preserved; typed mappings replace the former any interviewer lookup.

POST /api/interviews validates interviewerKey, level, interviewType, persona and language membership plus role/company canonical text. Incoming POST text must already be trimmed, nonempty, bounded and control-free; no server defaulting/normalization changes replay payload content. Invalid payload returns existing 400 Invalid interview payload before persistence. Existing answers/score/summary/duration/identity validation is preserved.

COMPLETION_IDEMPOTENCY_01 architecture is unchanged: auth first; server-derived owner; UUID v4 completionId; insert-first; 201 first insert; 200 matching replay; generic 409 conflict; no overwrite; owner-scoped replay; private/no-store. Reliability and response-loss retry regressions passed.

## Exact inventory and responsibilities

| File | Responsibility |
|---|---|
| `app/interview/page.tsx` | Server authentication, query validation and keyed client boundary. |
| `components/interview/LiveInterviewClient.tsx` | Existing Live orchestration, effects, provider calls, UI and completion flow, with validated config. |
| `lib/interviews/interview-setup-input.ts` | Canonical sets/types, exact guards, decoded query parsing, text validation/normalization and lifecycle key. |
| `components/interview/InterviewSetupForm.tsx` | Setup state, shared optional-text validation, localized feedback and URL generation. |
| `components/interview/interview-setup-config.ts` | Re-export shared Setup types; preserve labels/options and add localized error copy. |
| `app/api/interviews/route.ts` | POST canonical membership/text checks; GET remains unchanged. |
| `lib/interviews/interview-session-state.test.cjs` | Existing real-client reliability/idempotency harness now targets extracted client; assertions retained. |
| `lib/interviews/persist-owned-interview.test.cjs` | Existing persistence/replay tests plus invalid POST enums/text and Unicode acceptance. |
| `lib/interviews/interview-setup-input.test.cjs` | Pure allowed/invalid/duplicate/text/Unicode/key contract cases. |
| `lib/interviews/interview-route-input.test.cjs` | Auth-first redirects, validated client props, keyed lifecycle and mock zero-activity proof. |
| `components/interview/InterviewSetupForm.test.cjs` | Desktop/mobile valid URLs, invalid navigation blocking, localization and accessible error association. |
| `docs/01_Engineering/Sprint_ROUTE_INPUT_HARDENING_01_Summary.md` | Completed sprint summary and approval status. |
| `docs/01_Engineering/Sprint_ROUTE_INPUT_HARDENING_01_Engineering_Report.md` | Engineering decisions, evidence, boundaries, inventory and diff snapshots. |
| `docs/04_Project_Memory/CURRENT_STATE.md` | Record latest local closure, supersede stale planning status without deleting historical evidence. |
| `docs/04_Project_Memory/STAGE_LOG.md` | Record latest local closure, supersede stale planning status without deleting historical evidence. |
| `docs/04_Project_Memory/DEFERRED_FIXES.md` | Record latest local closure, supersede stale planning status without deleting historical evidence. |
| `docs/04_Project_Memory/DECISIONS_AND_RISKS.md` | Record latest local closure, supersede stale planning status without deleting historical evidence. |

Created: 7 files; modified: 10 files; total: 17.

## Public interfaces / types

The helper exports INTERVIEWER_KEYS, INTERVIEW_LEVELS, INTERVIEW_TYPES, INTERVIEW_PERSONAS, INTERVIEW_LANGUAGES and their derived InterviewerId, InterviewLevel, InterviewType, InterviewPersona and InterviewLanguage unions. InterviewSetupInput is a readonly object with interviewerKey, role, company, level, interviewType, persona and language. InterviewSearchParams maps string keys to string|string[]|undefined. Exported guards: isInterviewerId/isInterviewLevel/isInterviewType/isInterviewPersona/isInterviewLanguage. normalizeSetupText returns canonical string or null; isCanonicalSetupText validates without rewriting; parseInterviewSetupInput returns typed config or null; interviewSetupKey serializes fields in fixed order. SETUP_TEXT_MAX_CODE_POINTS is 200.

Server page receives searchParams and renders LiveInterviewClient({config: InterviewSetupInput}) only after auth/validation. SetupCopy gains validationError; prior type import names remain available via re-export. POST success/error response interfaces, CompletionPayload, session/completion helpers and ownership APIs are unchanged.

## Accessibility / styling

Setup feedback uses role=alert and stable setup-validation-error ID, associated with both desktop/mobile forms through aria-describedby. Copy is localized TR/EN/DE. Optional controls remain optional. Existing keyboard/focus and reduced-motion behavior remains unchanged; critical error is conveyed as text. No CSS or design-token file changed; existing Talentry styling/classes remain. The inherited large client was extracted without unrelated component splitting to preserve scope and behavior.

## Recorded automated validation — not rerun in this documentation turn

| Suite / command | Result |
|---|---|
| node --test lib/interviews/interview-setup-input.test.cjs | 134/134 PASS, exit 0 |
| node --test lib/interviews/interview-route-input.test.cjs | 46/46 PASS, exit 0 |
| node --test components/interview/InterviewSetupForm.test.cjs | 41/41 PASS, exit 0 |
| node --test lib/interviews/interview-session-state.test.cjs | 55/55 PASS, exit 0 |
| node --test lib/interviews/persist-owned-interview.test.cjs | 71/71 PASS, exit 0 |
| node --test lib/interviews/interview-completion-state.test.cjs | 14/14 PASS, exit 0 |
| Result ownership, deletion, pagination, History loading and PDF regressions | 96/96 PASS, exit 0 |
| Total deterministic tests | **457/457 PASS**; no skipped tests |
| npx.cmd tsc --noEmit --incremental false | PASS, exit 0 |
| Implementation git diff --check and new-file whitespace check | PASS, exit 0 |
| npm.cmd run build | PASS, exit 0; **22/22** generated pages |

Regression command: node --test lib/interviews/read-owned-interview.test.cjs lib/interviews/delete-owned-interview.test.cjs lib/interviews/history-cursor.test.cjs lib/interviews/history-pagination.test.cjs components/interviews/useFullInterviewHistory.test.cjs components/result/useInterviewDeletion.test.cjs lib/reports/interview-report.test.cjs. PDF inspector used invocation-local REPORT_PDF_PYTHON pointing to the existing bundled Python; no persistent configuration or installation.

Initial Setup tests exposed test-harness traversal errors and a missing desktop form error-description association. Both were corrected; final Setup run passed. Existing reliability/idempotency assertions were preserved. Build preceded only removal of inherited trailing whitespace in the extracted client; no semantic change followed validation.

Before build, sandbox process inspection returned Access denied. Authorized read-only retry succeeded: **0 repository Next dev/start processes**. No process was terminated; dev server was not restarted. Two webpack dependency-cache snapshot warnings, npm update notice and informational LF-to-CRLF notices were recorded. No product regression was established by those warnings.

## User-supervised local browser acceptance — USER-VERIFIED PASS

Evidence source: the user's acceptance report supplied for this documentation turn. These checks were not executed or rerun by the agent.

| Check | User-observed behavior | Result |
|---|---|---|
| A. Clean/incognito signed-out /interview | Redirected to /login; Live did not open | PASS |
| B. Authenticated /interview, no params | Redirected to /interview/setup; no unnecessary login | PASS |
| C. iv=unknown, otherwise valid query | Redirected to Setup; Live did not open | PASS |
| D. level=garbage, otherwise valid query | Redirected to Setup | PASS |
| E. level=junior&level=senior | Redirected to Setup | PASS |
| F. Authenticated normal Setup -> Live | No login redirect; valid query; Live loaded; Q1 generated; TTS worked | PASS |
| G. Ctrl+R on valid authenticated Live URL | No login/Setup redirect; Live reloaded; Q1 generated; TTS worked | PASS |
| H. Browser Back from valid Live | Returned to Setup | PASS |

Invalid/missing config never renders/mounts LiveInterviewClient. Deterministic harnesses prove zero Claude question requests, ElevenLabs TTS requests, Live camera acquisition and persistence POST. **This exact zero-activity condition was not manually measured in browser Network.** Real Q1/TTS behavior was user-verified only for valid Setup/refresh flows.

Authenticated testing remains Setup -> valid submit -> Live, without forced re-login. A fully valid bookmarked Live URL remains directly usable while authenticated (deterministic route proof). No dev-only auth bypass exists.

No answer/completion flow was executed during this stage's browser acceptance; no Result or persisted interview was created, no persistence was intentionally triggered, and History count was not changed by this acceptance, per user evidence. History was not queried/recounted by the agent. No new History record or current count is asserted. **HISTORY_PAGINATION_01: NATURAL-RECORD DEFERRED ACCEPTANCE** remains; no synthetic seeding.

## Accepted remaining boundaries / untouched foundations

Result/detail/delete/PDF IDs: **ALREADY HARDENED / OUT OF IMPLEMENTATION SCOPE**. Authentication precedes UUID validation/ownership work; malformed signed-in UUID -> 400; foreign/nonexistent -> same 404; reads/deletes are owner-scoped; PDF uses the protected reader. No source changes there. New write validation is not applied to historical reads; older unsupported persisted values remain readable, without migration/backfill. Existing historical unsupported-language PDF limitations are unchanged.

Direct provider endpoint auth/rate limiting, prompt injection/privacy/private-content logging, and provider resource/cost abuse controls remain SECURITY_PRIVACY_01. Page gating is not provider-endpoint security. Live UI/interview-language coupling remains LOCALIZATION_V1_01; session resume remains SESSION_RESUME_01; Media/device truthfulness and later provider/media work remain MEDIA_PROVIDER_V1_01. These are deferred boundaries, not regressions introduced here.

No migration, package/dependency/configuration/CSS changes; no History/Result/PDF/Profile/Auth implementation changes; no scoring redesign or answer/summary resource policy. No secrets or environment-variable values recorded. No Supabase mutation, browser rerun, tests/build rerun, staging, commit or push in this documentation turn.

## Git status / approval

Current status is uncommitted: six modified implementation/test files, five new implementation/test files, four modified memory files and two new reports. No files staged. Final Git closure requires separate explicit authorization. Final pre-commit review is required; user browser PASS is not commit/push authorization.

## Documentation validation

Only Markdown documentation changed in this turn. git diff --check PASS, exit 0; full stage scope and diff content reviewed, including untracked new files. Tests/build/browser were not rerun. Two report files were created as new immutable sprint records; prior reports were not rewritten.

## Complete stage-file diff snapshots

Tracked changes are captured from git diff against the safe committed base. New-file diffs include every line. This report is excluded from its own diff appendix to avoid self-copy; the report file itself remains the authoritative full artifact. Snapshots are uncommitted review evidence, not a commit assertion. Trailing spaces/tabs in diff snapshots are displayed as literal \u0020/\u0009 escapes for Markdown whitespace hygiene; decode these line-ending escapes to reconstruct the exact diff.

````diff
diff --git a/app/api/interviews/route.ts b/app/api/interviews/route.ts
index eace8b2..a0225c7 100644
--- a/app/api/interviews/route.ts
+++ b/app/api/interviews/route.ts
@@ -31,7 +31,11 @@ type InterviewListRow = {
     created_at: string
 }
\u0020
-function isInterviewPayload(value: unknown): value is InterviewPayload {
+function isInterviewPayload(
+    value: unknown, validators: typeof import('@/lib/interviews/interview-setup-input'),
+): value is InterviewPayload {
+    const { isInterviewerId, isInterviewLevel, isInterviewType, isInterviewPersona,
+        isInterviewLanguage, isCanonicalSetupText } = validators
     if (!value || typeof value !== 'object') return false
\u0020
     const payload = value as Record<string, unknown>
@@ -47,13 +51,13 @@ function isInterviewPayload(value: unknown): value is InterviewPayload {
     })
\u0020
     return (
-        typeof payload.interviewerKey === 'string' &&
-        typeof payload.role === 'string' &&
-        typeof payload.company === 'string' &&
-        typeof payload.level === 'string' &&
-        typeof payload.interviewType === 'string' &&
-        typeof payload.persona === 'string' &&
-        typeof payload.language === 'string' &&
+        isInterviewerId(payload.interviewerKey) &&
+        isCanonicalSetupText(payload.role) &&
+        isCanonicalSetupText(payload.company) &&
+        isInterviewLevel(payload.level) &&
+        isInterviewType(payload.interviewType) &&
+        isInterviewPersona(payload.persona) &&
+        isInterviewLanguage(payload.language) &&
         answersAreValid &&
         typeof payload.score === 'number' &&
         Number.isInteger(payload.score) &&
@@ -155,7 +159,8 @@ export async function POST(req: NextRequest) {
         body && typeof body === 'object' && 'completionId' in body ? body.completionId : null,
     )
     if (!completionId) return NextResponse.json({ error: 'Invalid completion identity' }, { status: 400, headers })
-    if (!isInterviewPayload(body)) return NextResponse.json({ error: 'Invalid interview payload' }, { status: 400, headers })
+    const validators = await import('@/lib/interviews/interview-setup-input')
+    if (!isInterviewPayload(body, validators)) return NextResponse.json({ error: 'Invalid interview payload' }, { status: 400, headers })
     const result = await persistOwnedInterview(auth.user.id, completionId, body)
     if (result.status === 'conflict') return NextResponse.json({ error: 'Completion conflict' }, { status: 409, headers })
     if (result.status === 'error') return NextResponse.json({ error: 'Failed to save interview' }, { status: 500, headers })
diff --git a/app/interview/page.tsx b/app/interview/page.tsx
index 209336f..3c91e40 100644
--- a/app/interview/page.tsx
+++ b/app/interview/page.tsx
@@ -1,691 +1,14 @@
-'use client'
-import { useEffect, useRef, useState, useCallback, Suspense } from 'react'
-import { useSearchParams, useRouter } from 'next/navigation'
-import LiveInterviewHeader from '@/components/interview/LiveInterviewHeader'
-import InterviewerStage from '@/components/interview/InterviewerStage'
-import type { SpeechStatus } from '@/components/interview/InterviewerStage'
-import InterviewWorkspace, { InterviewFeedbackCard } from '@/components/interview/InterviewWorkspace'
-import type { InterviewFeedback, InterviewTab, InterviewWorkspaceLabels } from '@/components/interview/InterviewWorkspace'
-import LiveInterviewControls from '@/components/interview/LiveInterviewControls'
-import { TalentryButton } from '@/components/ui'
-import styles from './interview.module.css'
-import { createInterviewCompletionState } from '@/lib/interviews/interview-completion-state'
-import { createInterviewSessionState } from '@/lib/interviews/interview-session-state'
-import type { AcceptedQuestion, SessionAnswer, SessionOperation } from '@/lib/interviews/interview-session-state'
-
-const IV: Record<string, any> = {
-  f: { name:'Sarah Chen', role:'Sr. HR Manager',
-    photo:'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face',
-    voice:'EXAVITQu4vr4xnSDxMaL' },
-  m: { name:'Marcus Reid', role:'Tech Lead',
-    photo:'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face',
-    voice:'pNInz6obpgDQGcFmaJgB' },
-}
-const P: Record<string,string> = {
-  friendly:'Samimi mülakatçısın.',
-  formal:'Profesyonel İK mülakatçısısın.',
-  tough:'Baskılı mülakatçısın.',
-  curious:'Analitik mülakatçısın.'
-}
-const L: Record<string,string> = {
-  junior:'junior (0-2 yıl)',
-  mid:'mid-level (2-5 yıl)',
-  senior:'senior (5+ yıl)'
-}
-const T: Record<string,string> = {
-  behavioral:'davranışsal/HR',
-  technical:'teknik',
-  mixed:'karma',
-  case:'vaka analizi'
-}
-type InterviewLanguage = 'tr' | 'en' | 'de'
-type MobileInterviewPanel = 'interviewer' | 'interview' | 'feedback'
-
-type LiveInterviewCopy = {
-  backToInterviewer: string
-  cameraOff: string
-  cameraToggleOff: string
-  cameraToggleOn: string
-  completionFailure: string
-  endInterview: string
-  feedbackGuidance: string
-  feedbackPanel: string
-  feedbackReady: string
-  feedbackUnavailable: string
-  retryFeedback: string
-  retryQuestion: string
-  questionFailure: string
-  goToQuestions: string
-  interviewPanel: string
-  interviewerPanel: string
-  leaveWithoutSaving: string
-  microphoneToggleOff: string
-  microphoneToggleOn: string
-  mobilePager: string
-  returnToInterview: string
-  returnToQuestions: string
-  sessionLabel: string
-  speech: Record<SpeechStatus, string>
-  timerLabel: string
-  viewFeedback: string
-  workspace: InterviewWorkspaceLabels
-  you: string
-  zeroAnswerWarning: string
-}
-
-const LIVE_COPY: Record<InterviewLanguage, LiveInterviewCopy> = {
-  tr: {
-    backToInterviewer: 'Mülakatçıya Dön',
-    cameraOff: 'Kamera kapalı', cameraToggleOff: 'Kamerayı kapat', cameraToggleOn: 'Kamerayı aç',
-    completionFailure: 'Sonuç oluşturulamadı. Tekrar deneyebilir veya görüşmeden kaydetmeden çıkabilirsiniz.',
-    endInterview: 'Mülakatı Bitir',
-    feedbackGuidance: 'Sonraki soruya devam etmek için sola kaydır veya Sorulara Dön seçeneğini kullan.',
-    feedbackPanel: 'Değerlendirme', feedbackReady: 'Değerlendirmen hazır — görmek için sağa kaydır.',
-    feedbackUnavailable: 'Geri bildirim şu anda gösterilemiyor.',
-    retryFeedback: 'Geri bildirimi tekrar dene', retryQuestion: 'Soruyu tekrar dene', questionFailure: 'Soru oluşturulamadı. Lütfen tekrar deneyin.',
-    goToQuestions: 'Sorulara Geç', interviewPanel: 'Mülakat soruları', interviewerPanel: 'Mülakatçı',
-    leaveWithoutSaving: 'Kaydetmeden Çık',
-    microphoneToggleOff: 'Mikrofonu kapat', microphoneToggleOn: 'Mikrofonu aç', sessionLabel: 'Canlı mülakat',
-    mobilePager: 'Mülakat bölümleri',
-    returnToInterview: 'Mülakata Dön',
-    returnToQuestions: 'Sorulara Dön',
-    speech: { preparing: 'Ses hazırlanıyor', speaking: 'Mülakatçı konuşuyor', ready: 'Ses hazır', unavailable: 'Ses kullanılamıyor' },
-    timerLabel: 'Geçen süre', viewFeedback: 'Değerlendirmeyi Gör', you: 'Sen',
-    workspace: {
-      answer: 'Cevabını yaz', answerPlaceholder: 'Cevabını buraya yaz...', currentQuestion: 'Güncel soru',
-      feedback: 'Geri bildirim', finish: 'Mülakatı tamamla', improvement: 'Geliştirilebilir', loadingQuestion: 'Soru hazırlanıyor',
-      next: 'Sonraki soru', notes: 'Notlar', notesLabel: 'Notlarım', notesPlaceholder: 'Not al...', question: 'Soru',
-      skip: 'Atla', strength: 'Güçlü yön', submit: 'Cevabı gönder', suggestion: 'Öneri',
-    },
-    zeroAnswerWarning: 'Henüz bir cevap göndermediniz. Şimdi çıkarsanız bu görüşme için sonuç oluşturulmayacak ve görüşme kaydedilmeyecek.',
-  },
-  en: {
-    backToInterviewer: 'Back to Interviewer',
-    cameraOff: 'Camera off', cameraToggleOff: 'Turn camera off', cameraToggleOn: 'Turn camera on',
-    completionFailure: 'Result could not be created. You can try again or leave the interview without saving.',
-    endInterview: 'End Interview',
-    feedbackGuidance: 'Swipe left or use Back to Questions to continue with the next question.',
-    feedbackPanel: 'Feedback', feedbackReady: 'Your feedback is ready — swipe right to view it.',
-    feedbackUnavailable: 'Feedback is currently unavailable.',
-    retryFeedback: 'Retry feedback', retryQuestion: 'Retry question', questionFailure: 'Question could not be created. Please try again.',
-    goToQuestions: 'Go to Questions', interviewPanel: 'Interview questions', interviewerPanel: 'Interviewer',
-    leaveWithoutSaving: 'Leave Without Saving',
-    microphoneToggleOff: 'Mute microphone', microphoneToggleOn: 'Unmute microphone', sessionLabel: 'Live interview',
-    mobilePager: 'Interview panels',
-    returnToInterview: 'Return to Interview',
-    returnToQuestions: 'Back to Questions',
-    speech: { preparing: 'Preparing voice', speaking: 'Interviewer speaking', ready: 'Voice ready', unavailable: 'Voice unavailable' },
-    timerLabel: 'Elapsed time', viewFeedback: 'View Feedback', you: 'You',
-    workspace: {
-      answer: 'Write your answer', answerPlaceholder: 'Write your answer here...', currentQuestion: 'Current question',
-      feedback: 'Feedback', finish: 'Complete interview', improvement: 'Could improve', loadingQuestion: 'Preparing question',
-      next: 'Next question', notes: 'Notes', notesLabel: 'My notes', notesPlaceholder: 'Take notes...', question: 'Question',
-      skip: 'Skip', strength: 'Strength', submit: 'Submit answer', suggestion: 'Suggestion',
-    },
-    zeroAnswerWarning: 'You haven’t submitted an answer yet. If you leave now, no result will be created and this interview will not be saved.',
-  },
-  de: {
-    backToInterviewer: 'Zurück zum Interviewer',
-    cameraOff: 'Kamera aus', cameraToggleOff: 'Kamera ausschalten', cameraToggleOn: 'Kamera einschalten',
-    completionFailure: 'Das Ergebnis konnte nicht erstellt werden. Sie können es erneut versuchen oder das Interview ohne Speichern verlassen.',
-    endInterview: 'Interview beenden',
-    feedbackGuidance: 'Wische nach links oder nutze Zurück zu den Fragen, um mit der nächsten Frage fortzufahren.',
-    feedbackPanel: 'Feedback', feedbackReady: 'Dein Feedback ist bereit — wische nach rechts, um es anzusehen.',
-    feedbackUnavailable: 'Feedback ist derzeit nicht verfügbar.',
-    retryFeedback: 'Feedback erneut versuchen', retryQuestion: 'Frage erneut versuchen', questionFailure: 'Die Frage konnte nicht erstellt werden. Bitte versuchen Sie es erneut.',
-    goToQuestions: 'Zu den Fragen', interviewPanel: 'Interviewfragen', interviewerPanel: 'Interviewer',
-    leaveWithoutSaving: 'Ohne Speichern verlassen',
-    microphoneToggleOff: 'Mikrofon stummschalten', microphoneToggleOn: 'Mikrofon einschalten', sessionLabel: 'Live-Interview',
-    mobilePager: 'Interviewbereiche',
-    returnToInterview: 'Zum Interview zurück',
-    returnToQuestions: 'Zurück zu den Fragen',
-    speech: { preparing: 'Stimme wird vorbereitet', speaking: 'Interviewer spricht', ready: 'Stimme bereit', unavailable: 'Stimme nicht verfügbar' },
-    timerLabel: 'Verstrichene Zeit', viewFeedback: 'Feedback ansehen', you: 'Du',
-    workspace: {
-      answer: 'Antwort schreiben', answerPlaceholder: 'Schreibe deine Antwort hier...', currentQuestion: 'Aktuelle Frage',
-      feedback: 'Feedback', finish: 'Interview abschließen', improvement: 'Verbesserungsmöglichkeit', loadingQuestion: 'Frage wird vorbereitet',
-      next: 'Nächste Frage', notes: 'Notizen', notesLabel: 'Meine Notizen', notesPlaceholder: 'Notizen machen...', question: 'Frage',
-      skip: 'Überspringen', strength: 'Stärke', submit: 'Antwort senden', suggestion: 'Empfehlung',
-    },
-    zeroAnswerWarning: 'Sie haben noch keine Antwort gesendet. Wenn Sie jetzt gehen, wird kein Ergebnis erstellt und dieses Interview nicht gespeichert.',
-  },
-}
-
-type EvaluationResult = {
-  score: number
-  summary: string
-}
-
-function isEvaluationResult(value: unknown): value is EvaluationResult {
-  return (
-    typeof value === 'object' &&
-    value !== null &&
-    'score' in value &&
-    typeof value.score === 'number' &&
-    Number.isFinite(value.score) &&
-    Number.isInteger(value.score) &&
-    value.score >= 0 &&
-    value.score <= 100 &&
-    'summary' in value &&
-    typeof value.summary === 'string' &&
-    value.summary.trim().length > 0
-  )
-}
-
-function parseInterviewFeedback(value: string, fallbackText: string): InterviewFeedback {
-  const normalized = value.replace(/```json|```/gi, '').trim()
-
-  try {
-    const parsed: unknown = JSON.parse(normalized)
-    if (
-      typeof parsed === 'object' && parsed !== null &&
-      'strength' in parsed && typeof parsed.strength === 'string' && parsed.strength.trim() &&
-      'improvement' in parsed && typeof parsed.improvement === 'string' && parsed.improvement.trim() &&
-      'suggestion' in parsed && typeof parsed.suggestion === 'string' && parsed.suggestion.trim()
-    ) {
-      return {
-        kind: 'structured',
-        strength: parsed.strength.trim(),
-        improvement: parsed.improvement.trim(),
-        suggestion: parsed.suggestion.trim(),
-      }
-    }
-  } catch {}
-
-  return { kind: 'fallback', text: value.trim() || fallbackText }
-}
-
-function InterviewContent() {
-  const params = useSearchParams()
-  const router = useRouter()
-  const ivKey = params.get('iv') || 'f'
-  const iv = IV[ivKey]
-  const role = params.get('role') || 'Genel'
-  const company = params.get('company') || 'Genel'
-  const level = params.get('level') || 'mid'
-  const itype = params.get('itype') || 'behavioral'
-  const persona = params.get('persona') || 'formal'
-  const language = params.get('language') || 'tr'
-  const selectedLanguage: InterviewLanguage = language === 'en' || language === 'de' ? language : 'tr'
-  const copy = LIVE_COPY[selectedLanguage]
-  const languageInstruction =
-  language === 'en'
-    ? 'Respond only in English.'
-    : language === 'de'
-      ? 'Antworte ausschließlich auf Deutsch.'
-      : 'Yalnızca Türkçe yanıt ver.'
-  const mobilePagerRef = useRef<HTMLDivElement>(null)
-  const camRef = useRef<HTMLVideoElement>(null)
-  const answersRef = useRef<SessionAnswer[]>([])
-  const sessionRef = useRef(createInterviewSessionState())
-  const completionRef = useRef(createInterviewCompletionState())
-  const curQRef = useRef('')
-  const qNumRef = useRef(0)
-  const camStreamRef = useRef<MediaStream | null>(null)
-  const audioRef = useRef<HTMLAudioElement | null>(null)
-  const audioObjectUrlRef = useRef<string | null>(null)
-  const audioRequestRef = useRef(0)
-  const initialQuestionTriggeredRef = useRef(false)
-  const completionInFlightRef = useRef(false)
-  const [question, setQuestion] = useState('')
-  const [questionError, setQuestionError] = useState(false)
-  const [feedbackFailed, setFeedbackFailed] = useState(false)
-  const [qLoading, setQLoading] = useState(false)
-  const [answer, setAnswer] = useState('')
-  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null)
-  const [qNum, setQNum] = useState(0)
-  const [activeTab, setActiveTab] = useState<InterviewTab>('q')
-  const [mobilePanel, setMobilePanel] = useState<MobileInterviewPanel>('interviewer')
-  const [isMobileViewport, setIsMobileViewport] = useState(false)
-  const [notes, setNotes] = useState('')
-  const [micOn, setMicOn] = useState(true)
-  const [camOn, setCamOn] = useState(true)
-  const [secs, setSecs] = useState(0)
-  const [awaitingNext, setAwaitingNext] = useState(false)
-  const [speechStatus, setSpeechStatus] = useState<SpeechStatus>('ready')
-  const [completionError, setCompletionError] = useState('')
-  const [isCompleting, setIsCompleting] = useState(false)
-  const MAX_Q = 5
-  useEffect(() => {
-    const iv = setInterval(() => setSecs(s => s+1), 1000)
-    return () => clearInterval(iv)
-  }, [])
-
-  const fmt = (s: number) =>
-    `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`
-
-  useEffect(() => {
-    navigator.mediaDevices.getUserMedia({video:true,audio:false})
-      .then(stream => {
-        camStreamRef.current = stream
-        if (camRef.current) {
-          camRef.current.srcObject = stream
-          camRef.current.style.display = 'block'
-        }
-      }).catch(()=>{})
-    return () => { camStreamRef.current?.getTracks().forEach(t=>t.stop()) }
-  }, [])
-
-  useEffect(() => {
-    // Effect replay owns a fresh session; obsolete closures retain their disposed owner.
-    const session = createInterviewSessionState()
-    sessionRef.current = session
-    completionRef.current.reset()
-    initialQuestionTriggeredRef.current = false
-    return () => {
-      session.dispose()
-      completionRef.current.reset()
-      audioRequestRef.current += 1
-      stopCurrentAudio()
-    }
-  }, [])
-
- async function claudeCall (system: string, message: string) {
-    const res = await fetch('/api/claude', {
-      method:'POST',
-      headers:{'Content-Type':'application/json'},
-      body: JSON.stringify({system, message})
-    })
-    if (!res.ok) throw new Error(`Interview provider failed: ${res.status}`)
-    const data: unknown = await res.json()
-    if (typeof data !== 'object' || data === null || !('text' in data) || typeof data.text !== 'string' || !data.text.trim()) {
-      throw new Error('Invalid interview provider text')
-    }
-    return data.text
-  }
-async function speakText(accepted: AcceptedQuestion) {
-  const session = sessionRef.current
-  if (!session.canSpeak(accepted)) return
-  const text = accepted.text
-  const requestId = audioRequestRef.current + 1
-  audioRequestRef.current = requestId
-  stopCurrentAudio()
-  setSpeechStatus('preparing')
-
-  try {
-    const res = await fetch('/api/elevenlabs', {
-      method: 'POST',
-      headers: { 'Content-Type': 'application/json' },
-      body: JSON.stringify({ text, voiceId: iv.voice })
-    })
-
-    if (!res.ok) {
-      if (requestId === audioRequestRef.current && session.canSpeak(accepted)) setSpeechStatus('unavailable')
-      return
-    }
-
-    const blob = await res.blob()
-    const url = URL.createObjectURL(blob)
-
-    if (requestId !== audioRequestRef.current || !session.canSpeak(accepted)) {
-      URL.revokeObjectURL(url)
-      return
-    }
-
-    const audio = new Audio(url)
-    audioRef.current = audio
-    audioObjectUrlRef.current = url
-    audio.addEventListener('ended', () => {
-      if (audioRef.current === audio) {
-        audioRef.current = null
-      }
-      if (audioObjectUrlRef.current === url) {
-        URL.revokeObjectURL(url)
-        audioObjectUrlRef.current = null
-      }
-      if (requestId === audioRequestRef.current && session.canSpeak(accepted)) setSpeechStatus('ready')
-    }, { once: true })
-    void audio.play()
-      .then(() => {
-        if (requestId === audioRequestRef.current && session.canSpeak(accepted) && audioRef.current === audio) {
-          setSpeechStatus('speaking')
-        }
-      })
-      .catch(() => {
-        if (audioRef.current === audio) {
-          audioRef.current = null
-        }
-        if (audioObjectUrlRef.current === url) {
-          URL.revokeObjectURL(url)
-          audioObjectUrlRef.current = null
-        }
-        if (requestId === audioRequestRef.current && session.canSpeak(accepted)) setSpeechStatus('unavailable')
-      })
-  } catch (e) {
-    if (requestId === audioRequestRef.current && session.canSpeak(accepted)) setSpeechStatus('unavailable')
-    console.warn('TTS error', e)
-  }
-}
-  function stopCurrentAudio() {
-    if (audioRef.current) {
-      audioRef.current.pause()
-      try {
-        audioRef.current.currentTime = 0
-      } catch {}
-      audioRef.current = null
-    }
-
-    if (audioObjectUrlRef.current) {
-      URL.revokeObjectURL(audioObjectUrlRef.current)
-      audioObjectUrlRef.current = null
-    }
-  }
-  const askQuestion = useCallback(async () => {
-    const session = sessionRef.current
-    const admission = session.beginGeneration()
-    if (!admission) return
-    const { token, ordinal: num } = admission
-    setQuestionError(false); setQLoading(true)
-    try {
-      audioRequestRef.current += 1
-      stopCurrentAudio()
-      setSpeechStatus('ready')
-      const previousQuestions = Array.from(new Set(
-        [...answersRef.current.map(item => item.q), curQRef.current]
-          .map(previousQuestion => previousQuestion.trim())
-          .filter(Boolean)
-      ))
-      const previousQuestionsInstruction = previousQuestions.length
-        ? `\nPreviously asked questions:\n${previousQuestions.map(previousQuestion => `- ${previousQuestion}`).join('\n')}\nDo not repeat these questions. Do not ask the same competency or topic again using near-duplicate wording. Ask a meaningfully different interview question appropriate to the same role, interview type, level, company, persona, and language.`
-        : ''
-const sys = `${P[persona]} Sen ${role} için ${T[itype]} mülakatı yapıyorsun. Aday: ${L[level]}. Şirket: ${company}. ${languageInstruction} SADECE soruyu yaz. Soru ${num}.${previousQuestionsInstruction}`
-      const q = await claudeCall(sys, `${num}. mülakat sorusu`)
-      const accepted = session.acceptQuestion(token, q)
-      if (!accepted) {
-        if (session.isCurrent(token)) throw new Error('Invalid generated question')
-        return
-      }
-      qNumRef.current = accepted.ordinal; setQNum(accepted.ordinal)
-      curQRef.current = accepted.text; setQuestion(accepted.text)
-      setFeedback(null); setAnswer(''); setAwaitingNext(false); setFeedbackFailed(false)
-      void speakText(accepted)
-    } catch (error) {
-      if (session.isCurrent(token)) {
-        console.warn('Question generation failed', error)
-        setQuestionError(true)
-        if (!session.question) initialQuestionTriggeredRef.current = false
-      }
-    } finally {
-      if (session.release(token)) setQLoading(false)
-    }
-  }, [])
-
-  const triggerInitialQuestion = useCallback(() => {
-    if (initialQuestionTriggeredRef.current) return
-    initialQuestionTriggeredRef.current = true
-    void askQuestion()
-  }, [askQuestion])
-
-  useEffect(() => {
-    const mobileQuery = window.matchMedia('(max-width: 640px)')
-    const triggerForViewport = () => {
-      const isMobile = mobileQuery.matches
-      setIsMobileViewport(isMobile)
-      if (!isMobile) triggerInitialQuestion()
-    }
-
-    triggerForViewport()
-    mobileQuery.addEventListener('change', triggerForViewport)
-    return () => mobileQuery.removeEventListener('change', triggerForViewport)
-  }, [triggerInitialQuestion])
-  async function submitAnswer() {
-    const admission = sessionRef.current.claimAnswer(answer)
-    if (!admission) return
-    answersRef.current.push(admission.answer)
-    await runFeedback(admission.token, admission.answer)
-  }
-
-  async function retryFeedback() {
-    if (!feedbackFailed) return
-    const admission = sessionRef.current.retryFeedback()
-    if (admission) await runFeedback(admission.token, admission.answer)
-  }
-
-  async function runFeedback(token: SessionOperation, submitted: SessionAnswer) {
-    const session = sessionRef.current
-    setCompletionError(''); setFeedbackFailed(false); setAwaitingNext(true); setQLoading(true)
-    const sys = `${persona === 'tough' ? 'Eleştirel' : 'Yapıcı'} bir mülakat koçusun. ${languageInstruction} Adayın cevabını kısa, yapıcı ve profesyonel şekilde değerlendir. Sadece geçerli JSON döndür: {"strength":"...","improvement":"...","suggestion":"..."}. Her alan kısa, tek bir madde olmalı. Başka metin ekleme.`
-    try {
-      const fb = await claudeCall(sys, `Soru: "${submitted.q}"\nCevap: "${submitted.a}"`)
-      if (!session.isCurrent(token)) return
-      setFeedback(parseInterviewFeedback(fb, copy.feedbackUnavailable))
-    } catch (error) {
-      if (session.isCurrent(token)) {
-        console.warn('Interview feedback failed', error)
-        setFeedbackFailed(true)
-      }
-    } finally {
-      if (session.release(token)) setQLoading(false)
-    }
-  }
-
-  async function nextQuestion() {
-    if (qNumRef.current >= MAX_Q) await endCall()
-    else await askQuestion()
-  }
-
-  async function endCall() {
-    if (completionInFlightRef.current) return
-    const session = sessionRef.current
-    const admission = session.beginCompletion(answersRef.current)
-    if (!admission) return
-    const { token, snapshot: answers } = admission
-    audioRequestRef.current += 1
-    stopCurrentAudio()
-    setSpeechStatus('ready')
-    completionInFlightRef.current = true
-    setIsCompleting(true)
-    setCompletionError('')
-
-    if (!answers.length) {
-      session.release(token)
-      setCompletionError(copy.zeroAnswerWarning)
-      completionInFlightRef.current = false
-      setIsCompleting(false)
-      return
-    }
-
-    try {
-      const completion = completionRef.current
-      const completionId = completion.begin(answers)
-      if (!completionId) throw new Error('Completion identity required')
-      if (!completion.savedId) {
-        if (!completion.payload) {
-          const aText = answers.map((x,i)=>`S${i+1}: ${x.q}\nC: ${x.a}`).join('\n\n')
-          const sys = `Kıdemli bir İK uzmanısın. ${languageInstruction} Sadece geçerli JSON döndür: {"score":0-100,"summary":"3-4 cümlelik değerlendirme"}`
-          const raw = await claudeCall(sys, `Pozisyon: ${role}\n\n${aText}`)
-          if (!session.isCurrent(token)) return
-          const evaluation: unknown = JSON.parse(raw.replace(/```json|```/g,'').trim())
-
-          if (!isEvaluationResult(evaluation)) {
-            throw new Error('Invalid final interview evaluation')
-          }
-
-          completion.freezePayload({
-            interviewerKey: ivKey,
-            role,
-            company,
-            level,
-            interviewType: itype,
-            persona,
-            language,
-            answers,
-            score: evaluation.score,
-            summary: evaluation.summary,
-            durationSeconds: secs,
-          })
-        }
-        const saveRes = await fetch('/api/interviews', {
-          method: 'POST', headers: { 'Content-Type': 'application/json' },
-          body: JSON.stringify({ completionId, ...completion.payload }),
-        })
-        if (!saveRes.ok) throw new Error('Interview persistence failed')
-        const savedInterview: unknown = await saveRes.json()
-        if (!session.isCurrent(token)) return
-        if (!completion.acceptSaved(savedInterview)) throw new Error('Invalid interview persistence response')
-      }
-      camStreamRef.current?.getTracks().forEach(t=>t.stop())
-      router.push(`/result/${encodeURIComponent(completion.savedId!)}`)
-    } catch (error) {
-      if (!session.isCurrent(token)) return
-      session.release(token)
-      console.error('Interview completion failed:', error)
-      setCompletionError(copy.completionFailure)
-      completionInFlightRef.current = false
-      setIsCompleting(false)
-    }
-  }
-
-  function leaveWithoutSaving() {
-    sessionRef.current.dispose()
-    completionRef.current.reset()
-    audioRequestRef.current += 1
-    stopCurrentAudio()
-    camStreamRef.current?.getTracks().forEach(track => track.stop())
-    router.push('/dashboard')
-  }
-
-  function toggleMic() {
-    setMicOn(v => {
-      camStreamRef.current?.getAudioTracks().forEach(t=>t.enabled=!v)
-      return !v
-    })
-  }
-
-  function toggleCam() {
-    setCamOn(v => {
-      camStreamRef.current?.getVideoTracks().forEach(t=>t.enabled=!v)
-      return !v
-    })
-\u0020\u0020\u0020\u0020
-  }
-  function showMobilePanel(panel: MobileInterviewPanel) {
-    if (panel === 'feedback' && !feedback) return
-    const pager = mobilePagerRef.current
-    setMobilePanel(panel)
-    if (panel === 'interview') triggerInitialQuestion()
-    const panelIndex = panel === 'interviewer' ? 0 : panel === 'interview' ? 1 : 2
-    pager?.scrollTo({ left: panelIndex * pager.clientWidth })
-  }
-
-  function syncMobilePanel() {
-    const pager = mobilePagerRef.current
-    if (!pager?.clientWidth) return
-    const panelIndex = Math.round(pager.scrollLeft / pager.clientWidth)
-    const panel: MobileInterviewPanel = panelIndex === 0 ? 'interviewer' : panelIndex === 1 ? 'interview' : 'feedback'
-    if (panel === 'feedback' && !feedback) {
-      showMobilePanel('interview')
-      return
-    }
-    setMobilePanel(panel)
-    if (panel === 'interview') triggerInitialQuestion()
-  }
-
-  const liveInterviewControls = (
-    <LiveInterviewControls
-      cameraLabel={camOn ? copy.cameraToggleOff : copy.cameraToggleOn}
-      cameraOn={camOn}
-      completionError={completionError}
-      endLabel={copy.endInterview}
-      isCompleting={isCompleting}
-      transitionBusy={qLoading}
-      leaveWithoutSavingLabel={copy.leaveWithoutSaving}
-      microphoneLabel={micOn ? copy.microphoneToggleOff : copy.microphoneToggleOn}
-      microphoneOn={micOn}
-      onDismissCompletionError={() => setCompletionError('')}
-      onEnd={endCall}
-      onLeaveWithoutSaving={leaveWithoutSaving}
-      onToggleCamera={toggleCam}
-      onToggleMicrophone={toggleMic}
-      returnToInterviewLabel={copy.returnToInterview}
-    />
-  )
-
-  return (
-    <main className={styles.page}>
-      <LiveInterviewHeader
-        elapsedTime={fmt(secs)}
-        maxQuestions={MAX_Q}
-        questionLabel={copy.workspace.question}
-        questionNumber={qNum}
-        sessionLabel={copy.sessionLabel}
-        timerLabel={copy.timerLabel}
-      />
-      <div className={styles.body} onScroll={syncMobilePanel} ref={mobilePagerRef}>
-        <div aria-label={copy.interviewerPanel} className={`${styles.mobilePanel} ${styles.mobileInterviewerPanel}`} id="mobile-interviewer-panel" role="group">
-          <InterviewerStage
-            cameraOffLabel={copy.cameraOff}
-            cameraOn={camOn}
-            cameraRef={camRef}
-            interviewerName={iv.name}
-            interviewerPhoto={iv.photo}
-            interviewerRole={iv.role}
-            speechLabel={copy.speech[speechStatus]}
-            speechStatus={speechStatus}
-            youLabel={copy.you}
-          />
-          <TalentryButton className={styles.mobilePanelAction} onClick={() => showMobilePanel('interview')} type="button">
-            {copy.goToQuestions}
-          </TalentryButton>
-        </div>
-        <div aria-label={copy.interviewPanel} className={`${styles.mobilePanel} ${styles.mobileInterviewPanel} ${awaitingNext ? styles.mobileInterviewPanelPostSubmit : ''}`} id="mobile-interview-panel" role="group">
-          <TalentryButton className={styles.mobilePanelBack} onClick={() => showMobilePanel('interviewer')} size="small" type="button" variant="ghost">
-            {copy.backToInterviewer}
-          </TalentryButton>
-          <InterviewWorkspace
-            activeTab={activeTab}
-            answer={answer}
-            awaitingNext={awaitingNext}
-            feedback={feedback}
-            feedbackRetryLabel={copy.retryFeedback}
-            feedbackFailureMessage={feedbackFailed ? copy.feedbackUnavailable : ''}
-            onRetryFeedback={retryFeedback}
-            questionRetryLabel={copy.retryQuestion}
-            questionFailureMessage={questionError ? copy.questionFailure : ''}
-            onRetryQuestion={askQuestion}
-            isCompleting={isCompleting}
-            labels={copy.workspace}
-            maxQuestions={MAX_Q}
-            mobileFeedbackReadyLabel={copy.feedbackReady}
-            mobileViewFeedbackLabel={copy.viewFeedback}
-            notes={notes}
-            onAnswerChange={setAnswer}
-            onNext={nextQuestion}
-            onNotesChange={setNotes}
-            onSubmit={submitAnswer}
-            onTabChange={setActiveTab}
-            onViewFeedback={() => showMobilePanel('feedback')}
-            qLoading={qLoading}
-            question={question}
-            questionNumber={qNum}
-            showFeedback={!isMobileViewport}
-          />
-          <div className={styles.mobileControls}>{liveInterviewControls}</div>
-        </div>
-        {isMobileViewport && (
-          <div aria-hidden={!feedback} aria-label={copy.feedbackPanel} className={`${styles.mobilePanel} ${styles.mobileFeedbackPanel} ${!feedback ? styles.mobileFeedbackPanelUnavailable : ''}`} id="mobile-feedback-panel" role="group">
-            {feedback && (
-              <>
-                <TalentryButton className={styles.mobilePanelBack} onClick={() => showMobilePanel('interview')} size="small" type="button" variant="ghost">
-                  {copy.returnToQuestions}
-                </TalentryButton>
-                <InterviewFeedbackCard feedback={feedback} labels={copy.workspace} />
-                <p className={styles.mobileFeedbackGuidance}>{copy.feedbackGuidance}</p>
-              </>
-            )}
-          </div>
-        )}
-      </div>
-      <nav aria-label={copy.mobilePager} className={styles.mobilePagination}>
-        <button aria-controls="mobile-interviewer-panel" aria-current={mobilePanel === 'interviewer' ? 'step' : undefined} aria-label={copy.interviewerPanel} className={`${styles.mobilePagerDot} ${mobilePanel === 'interviewer' ? styles.mobilePagerDotActive : ''}`} onClick={() => showMobilePanel('interviewer')} type="button" />
-        <button aria-controls="mobile-interview-panel" aria-current={mobilePanel === 'interview' ? 'step' : undefined} aria-label={copy.interviewPanel} className={`${styles.mobilePagerDot} ${mobilePanel === 'interview' ? styles.mobilePagerDotActive : ''}`} onClick={() => showMobilePanel('interview')} type="button" />
-        <button aria-controls="mobile-feedback-panel" aria-current={mobilePanel === 'feedback' ? 'step' : undefined} aria-disabled={!feedback} aria-label={copy.feedbackPanel} className={`${styles.mobilePagerDot} ${mobilePanel === 'feedback' ? styles.mobilePagerDotActive : ''}`} disabled={!feedback} onClick={() => showMobilePanel('feedback')} type="button" />
-      </nav>
-      <div className={styles.desktopControls}>{liveInterviewControls}</div>
-    </main>
-  )
-}
-
-export default function InterviewPage() {
-  return <Suspense><InterviewContent /></Suspense>
+import { redirect } from 'next/navigation'
+import LiveInterviewClient from '@/components/interview/LiveInterviewClient'
+import { AUTH_ROUTES } from '@/lib/auth/auth-constants'
+import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
+import { interviewSetupKey, parseInterviewSetupInput } from '@/lib/interviews/interview-setup-input'
+import type { InterviewSearchParams } from '@/lib/interviews/interview-setup-input'
+
+export default async function InterviewPage({ searchParams }: { searchParams: InterviewSearchParams }) {
+  const auth = await getAuthenticatedUser()
+  if (auth.status !== 'authenticated') redirect(AUTH_ROUTES.login)
+  const config = parseInterviewSetupInput(searchParams)
+  if (!config) redirect('/interview/setup')
+  return <LiveInterviewClient key={interviewSetupKey(config)} config={config} />
 }
diff --git a/components/interview/InterviewSetupForm.tsx b/components/interview/InterviewSetupForm.tsx
index 837ae93..6d65d5d 100644
--- a/components/interview/InterviewSetupForm.tsx
+++ b/components/interview/InterviewSetupForm.tsx
@@ -7,6 +7,7 @@ import type { FormEvent } from 'react'
\u0020
 import { SectionHeader, TalentryButton, TalentryCard } from '@/components/ui'
 import { AUTH_ROUTES, DEFAULT_APP_LANGUAGE, SUPPORTED_APP_LANGUAGES } from '@/lib/auth/auth-constants'
+import { normalizeSetupText } from '@/lib/interviews/interview-setup-input'
 import type { AppLanguage } from '@/types/auth'
\u0020
 import InterviewSetupMobile from './InterviewSetupMobile'
@@ -28,6 +29,7 @@ export default function InterviewSetupForm() {
   const [interviewLanguage, setInterviewLanguage] = useState<AppLanguage>('tr')
   const copy = COPY[uiLanguage]
   const [isMobile, setIsMobile] = useState(false)
+  const [validationError, setValidationError] = useState(false)
\u0020
   useEffect(() => {
     const query = window.matchMedia('(max-width: 640px)')
@@ -49,10 +51,17 @@ export default function InterviewSetupForm() {
\u0020
   function handleSubmit(event: FormEvent<HTMLFormElement>) {
     event.preventDefault()
+    const normalizedRole = normalizeSetupText(role)
+    const normalizedCompany = normalizeSetupText(company)
+    if (normalizedRole === null || normalizedCompany === null) {
+      setValidationError(true)
+      return
+    }
+    setValidationError(false)
     const params = new URLSearchParams({
       iv: interviewer,
-      role: role.trim(),
-      company: company.trim(),
+      role: normalizedRole,
+      company: normalizedCompany,
       level,
       itype: interviewType,
       persona,
@@ -89,8 +98,10 @@ export default function InterviewSetupForm() {
         </div>
       </header>
\u0020
+      {validationError && <p id="setup-validation-error" role="alert">{copy.validationError}</p>}
+
       {isMobile ? (
-        <form className="talentry-setup-mobile-form" onSubmit={handleSubmit}>
+        <form className="talentry-setup-mobile-form" onSubmit={handleSubmit} aria-describedby={validationError ? 'setup-validation-error' : undefined}>
           <InterviewSetupMobile
             copy={copy} uiLanguage={uiLanguage}
             values={{ interviewer, role, company, level, interviewType, persona, interviewLanguage }}
@@ -108,7 +119,7 @@ export default function InterviewSetupForm() {
           title={copy.title}
         />
\u0020
-        <form className="talentry-setup-form" onSubmit={handleSubmit}>
+        <form className="talentry-setup-form" onSubmit={handleSubmit} aria-describedby={validationError ? 'setup-validation-error' : undefined}>
           <TalentryCard className="talentry-setup-interviewers" padding="spacious" surface="lavender">
             <fieldset>
               <legend>{copy.interviewerLegend}</legend>
diff --git a/components/interview/interview-setup-config.ts b/components/interview/interview-setup-config.ts
index 3111f35..d89e7d0 100644
--- a/components/interview/interview-setup-config.ts
+++ b/components/interview/interview-setup-config.ts
@@ -1,9 +1,7 @@
 import type { AppLanguage } from '@/types/auth'
\u0020
-export type InterviewerId = 'f' | 'm'
-export type InterviewLevel = 'junior' | 'mid' | 'senior'
-export type InterviewType = 'behavioral' | 'technical' | 'mixed' | 'case'
-export type InterviewPersona = 'friendly' | 'formal' | 'tough' | 'curious'
+import type { InterviewerId, InterviewLevel, InterviewType, InterviewPersona } from '@/lib/interviews/interview-setup-input'
+export type { InterviewerId, InterviewLevel, InterviewType, InterviewPersona } from '@/lib/interviews/interview-setup-input'
\u0020
 export type SetupCopy = {
   eyebrow: string
@@ -22,6 +20,7 @@ export type SetupCopy = {
   interviewType: string
   persona: string
   interviewLanguage: string
+  validationError: string
   optional: string
   start: string
   backToDashboard: string
@@ -64,6 +63,7 @@ export const COPY: Record<AppLanguage, SetupCopy> = {
     configurationTitle: 'Görüşme ayarları', configurationDescription: 'Deneyimi hedeflediğin role göre şekillendir.',
     role: 'Hedef pozisyon', rolePlaceholder: 'Örn. Product Manager', company: 'Şirket / sektör', companyPlaceholder: 'Örn. Fintech',
     level: 'Kariyer seviyesi', interviewType: 'Mülakat türü', persona: 'Mülakatçı tarzı', interviewLanguage: 'Mülakat dili',
+    validationError: 'Pozisyon ve şirket alanları en fazla 200 karakter içerebilir; kontrol karakterlerine izin verilmez.',
     optional: 'İsteğe bağlı', start: 'Mülakatı Başlat', backToDashboard: "Dashboard'a Dön",
     junior: 'Junior (0–2 yıl)', mid: 'Mid-level (2–5 yıl)', senior: 'Senior (5+ yıl)',
     behavioral: 'Davranışsal / İK', technical: 'Teknik', mixed: 'Karma', caseStudy: 'Vaka Analizi',
@@ -77,6 +77,7 @@ export const COPY: Record<AppLanguage, SetupCopy> = {
     configurationTitle: 'Interview settings', configurationDescription: 'Shape the experience around the role you are targeting.',
     role: 'Target role', rolePlaceholder: 'e.g. Product Manager', company: 'Company / sector', companyPlaceholder: 'e.g. Fintech',
     level: 'Career level', interviewType: 'Interview type', persona: 'Interviewer persona', interviewLanguage: 'Interview language',
+    validationError: 'Role and company must contain at most 200 characters and no control characters.',
     optional: 'Optional', start: 'Start Interview', backToDashboard: 'Back to Dashboard',
     junior: 'Junior (0–2 years)', mid: 'Mid-level (2–5 years)', senior: 'Senior (5+ years)',
     behavioral: 'Behavioral / HR', technical: 'Technical', mixed: 'Mixed', caseStudy: 'Case Study',
@@ -90,6 +91,7 @@ export const COPY: Record<AppLanguage, SetupCopy> = {
     configurationTitle: 'Gesprächseinstellungen', configurationDescription: 'Richte das Erlebnis auf deine Zielposition aus.',
     role: 'Zielposition', rolePlaceholder: 'z. B. Product Manager', company: 'Unternehmen / Branche', companyPlaceholder: 'z. B. Fintech',
     level: 'Karrierestufe', interviewType: 'Gesprächsart', persona: 'Interviewer-Stil', interviewLanguage: 'Gesprächssprache',
+    validationError: 'Position und Unternehmen dürfen höchstens 200 Zeichen und keine Steuerzeichen enthalten.',
     optional: 'Optional', start: 'Interview starten', backToDashboard: 'Zurück zum Dashboard',
     junior: 'Junior (0–2 Jahre)', mid: 'Mid-level (2–5 Jahre)', senior: 'Senior (5+ Jahre)',
     behavioral: 'Verhalten / HR', technical: 'Technisch', mixed: 'Gemischt', caseStudy: 'Fallstudie',
diff --git a/docs/04_Project_Memory/CURRENT_STATE.md b/docs/04_Project_Memory/CURRENT_STATE.md
index e9a3db0..ec95d09 100644
--- a/docs/04_Project_Memory/CURRENT_STATE.md
+++ b/docs/04_Project_Memory/CURRENT_STATE.md
@@ -1,6 +1,84 @@
 # Talentry / InterviewAI — Current Project State
\u0020
-Last updated: 2026-10-06
+Last updated: 2026-10-07
+
+## ROUTE_INPUT_HARDENING_01 — Acceptance closure — 2026-10-07
+
+- Date recorded: 2026-10-07 (Europe/Istanbul).
+- **IMPLEMENTATION + AUTOMATED VALIDATION + LOCAL BROWSER ACCEPTANCE: PASS**.
+- Current stage: **UNCOMMITTED / pending final Git closure**; final documentation/pre-commit review required. No commit/push approval or future hash asserted.
+- Branch: feature/auth-foundation. Safe committed base and local origin ref: 1ce03bae7a002b4b68e274e2dfbfb872300e9d3b (fix(interviews): make completion persistence idempotent).
+- **COMPLETION_IDEMPOTENCY_01: complete / committed / pushed**; closure supplied by user and committed HEAD verified locally; no remote fetch.
+- Next roadmap stage AFTER Git closure: **SECURITY_PRIVACY_01 — planned / NOT STARTED / NOT IMPLEMENTED / NOT YET AUTHORIZED**. No automatic next-stage authority.
+
+### Completed route/input decision
+
+Server /interview order: existing trusted getAuthenticatedUser -> signed-out /login redirect -> parse decoded searchParams -> invalid/missing config /interview/setup redirect -> typed LiveInterviewClient. No middleware or auth redesign. Valid authenticated Setup and direct valid Live URLs remain usable without login detours.
+
+The framework-independent, dependency-free interview-setup-input helper owns runtime sets and derived types: interviewer f/m; level junior/mid/senior; type behavioral/technical/mixed/case; persona friendly/formal/tough/curious; interview language tr/en/de. Membership uses exact array comparison, never truthy object lookup: unknown, wrong-case, constructor and __proto__ values are rejected.
+
+Consumed query keys: iv, role, company, level, itype, persona, language. iv/level/itype/persona/language are required exactly once. role/company are optional at most once. Array representations of any consumed key are rejected, including same-value duplicates. cv and arbitrary unused extras remain ignored. Next-decoded values are validated without manual URL decoding.
+
+Role/company remain optional. Raw decoded length is checked before trim: <=200 Unicode code points using Array.from, with C0 U+0000-U+001F and C1/DEL U+007F-U+009F rejected. Surrounding whitespace is trimmed; missing/empty/whitespace-only values become Genel. Ordinary Unicode, accents and emoji remain unchanged after trim. Setup uses the same helper and localized TR/EN/DE accessible validation feedback.
+
+Live logic is extracted into components/interview/LiveInterviewClient.tsx with an InterviewSetupInput config prop, no URLSearchParams parsing and no required-config defaults. A deterministic key derived from all validated config fields prevents different configurations mixing old session state. Existing effects, provider/prompt/TTS, transition, completion and render behavior remain semantically preserved; typed mappings replace the former any interviewer lookup.
+
+POST /api/interviews validates interviewerKey, level, interviewType, persona and language membership plus role/company canonical text. Incoming POST text must already be trimmed, nonempty, bounded and control-free; no server defaulting/normalization changes replay payload content. Invalid payload returns existing 400 Invalid interview payload before persistence. Existing answers/score/summary/duration/identity validation is preserved.
+
+COMPLETION_IDEMPOTENCY_01 architecture is unchanged: auth first; server-derived owner; UUID v4 completionId; insert-first; 201 first insert; 200 matching replay; generic 409 conflict; no overwrite; owner-scoped replay; private/no-store. Reliability and response-loss retry regressions passed.
+
+### Recorded automated validation — not rerun in this documentation turn
+
+| Suite / command | Result |
+|---|---|
+| node --test lib/interviews/interview-setup-input.test.cjs | 134/134 PASS, exit 0 |
+| node --test lib/interviews/interview-route-input.test.cjs | 46/46 PASS, exit 0 |
+| node --test components/interview/InterviewSetupForm.test.cjs | 41/41 PASS, exit 0 |
+| node --test lib/interviews/interview-session-state.test.cjs | 55/55 PASS, exit 0 |
+| node --test lib/interviews/persist-owned-interview.test.cjs | 71/71 PASS, exit 0 |
+| node --test lib/interviews/interview-completion-state.test.cjs | 14/14 PASS, exit 0 |
+| Result ownership, deletion, pagination, History loading and PDF regressions | 96/96 PASS, exit 0 |
+| Total deterministic tests | **457/457 PASS**; no skipped tests |
+| npx.cmd tsc --noEmit --incremental false | PASS, exit 0 |
+| Implementation git diff --check and new-file whitespace check | PASS, exit 0 |
+| npm.cmd run build | PASS, exit 0; **22/22** generated pages |
+
+Regression command: node --test lib/interviews/read-owned-interview.test.cjs lib/interviews/delete-owned-interview.test.cjs lib/interviews/history-cursor.test.cjs lib/interviews/history-pagination.test.cjs components/interviews/useFullInterviewHistory.test.cjs components/result/useInterviewDeletion.test.cjs lib/reports/interview-report.test.cjs. PDF inspector used invocation-local REPORT_PDF_PYTHON pointing to the existing bundled Python; no persistent configuration or installation.
+
+Initial Setup tests exposed test-harness traversal errors and a missing desktop form error-description association. Both were corrected; final Setup run passed. Existing reliability/idempotency assertions were preserved. Build preceded only removal of inherited trailing whitespace in the extracted client; no semantic change followed validation.
+
+Before build, sandbox process inspection returned Access denied. Authorized read-only retry succeeded: **0 repository Next dev/start processes**. No process was terminated; dev server was not restarted. Two webpack dependency-cache snapshot warnings, npm update notice and informational LF-to-CRLF notices were recorded. No product regression was established by those warnings.
+
+### User-supervised local browser acceptance — USER-VERIFIED PASS
+
+Evidence source: the user's acceptance report supplied for this documentation turn. These checks were not executed or rerun by the agent.
+
+| Check | User-observed behavior | Result |
+|---|---|---|
+| A. Clean/incognito signed-out /interview | Redirected to /login; Live did not open | PASS |
+| B. Authenticated /interview, no params | Redirected to /interview/setup; no unnecessary login | PASS |
+| C. iv=unknown, otherwise valid query | Redirected to Setup; Live did not open | PASS |
+| D. level=garbage, otherwise valid query | Redirected to Setup | PASS |
+| E. level=junior&level=senior | Redirected to Setup | PASS |
+| F. Authenticated normal Setup -> Live | No login redirect; valid query; Live loaded; Q1 generated; TTS worked | PASS |
+| G. Ctrl+R on valid authenticated Live URL | No login/Setup redirect; Live reloaded; Q1 generated; TTS worked | PASS |
+| H. Browser Back from valid Live | Returned to Setup | PASS |
+
+Invalid/missing config never renders/mounts LiveInterviewClient. Deterministic harnesses prove zero Claude question requests, ElevenLabs TTS requests, Live camera acquisition and persistence POST. **This exact zero-activity condition was not manually measured in browser Network.** Real Q1/TTS behavior was user-verified only for valid Setup/refresh flows.
+
+Authenticated testing remains Setup -> valid submit -> Live, without forced re-login. A fully valid bookmarked Live URL remains directly usable while authenticated (deterministic route proof). No dev-only auth bypass exists.
+
+No answer/completion flow was executed during this stage's browser acceptance; no Result or persisted interview was created, no persistence was intentionally triggered, and History count was not changed by this acceptance, per user evidence. History was not queried/recounted by the agent. No new History record or current count is asserted. **HISTORY_PAGINATION_01: NATURAL-RECORD DEFERRED ACCEPTANCE** remains; no synthetic seeding.
+
+### Accepted remaining boundaries / untouched foundations
+
+Result/detail/delete/PDF IDs: **ALREADY HARDENED / OUT OF IMPLEMENTATION SCOPE**. Authentication precedes UUID validation/ownership work; malformed signed-in UUID -> 400; foreign/nonexistent -> same 404; reads/deletes are owner-scoped; PDF uses the protected reader. No source changes there. New write validation is not applied to historical reads; older unsupported persisted values remain readable, without migration/backfill. Existing historical unsupported-language PDF limitations are unchanged.
+
+Direct provider endpoint auth/rate limiting, prompt injection/privacy/private-content logging, and provider resource/cost abuse controls remain SECURITY_PRIVACY_01. Page gating is not provider-endpoint security. Live UI/interview-language coupling remains LOCALIZATION_V1_01; session resume remains SESSION_RESUME_01; Media/device truthfulness and later provider/media work remain MEDIA_PROVIDER_V1_01. These are deferred boundaries, not regressions introduced here.
+
+No migration, package/dependency/configuration/CSS changes; no History/Result/PDF/Profile/Auth implementation changes; no scoring redesign or answer/summary resource policy. No secrets or environment-variable values recorded. No Supabase mutation, browser rerun, tests/build rerun, staging, commit or push in this documentation turn.
+
+This entry supersedes earlier pending route-input and completion Git-status statements for current planning only. INTERVIEW-013 (direct Live auth gate) and INTERVIEW-014 (interviewer key validation) are locally resolved by this stage, pending Git closure. Historical entries and immutable prior reports remain unchanged. ROADMAP_FREEZE_01 critical-path ordering remains unchanged.
\u0020
 ## COMPLETION_IDEMPOTENCY_01 — Acceptance closure — 2026-10-06
\u0020
diff --git a/docs/04_Project_Memory/DECISIONS_AND_RISKS.md b/docs/04_Project_Memory/DECISIONS_AND_RISKS.md
index a4cab51..ad7044e 100644
--- a/docs/04_Project_Memory/DECISIONS_AND_RISKS.md
+++ b/docs/04_Project_Memory/DECISIONS_AND_RISKS.md
@@ -1824,3 +1824,81 @@ No deliberate live response-loss/duplicate replay was performed against real Sup
 - After failed save, retry targets the original frozen intent even if live answers change; no automatic second identity is created.
\u0020
 These qualifications do not block local closure. Existing reliability state-machine protection and approved zero/partial behavior remain preserved. No History/Result/PDF/Profile/Auth implementation, schema, dependency or configuration changes. This entry supersedes earlier pending idempotency/reliability Git status only; historical entries/reports remain unchanged. No staging, commit, push, Supabase mutation, browser rerun, tests/build rerun or next-stage implementation in this documentation turn.
+
+## ROUTE_INPUT_HARDENING_01 — Acceptance closure — 2026-10-07
+
+- Date recorded: 2026-10-07 (Europe/Istanbul).
+- **IMPLEMENTATION + AUTOMATED VALIDATION + LOCAL BROWSER ACCEPTANCE: PASS**.
+- Current stage: **UNCOMMITTED / pending final Git closure**; final documentation/pre-commit review required. No commit/push approval or future hash asserted.
+- Branch: feature/auth-foundation. Safe committed base and local origin ref: 1ce03bae7a002b4b68e274e2dfbfb872300e9d3b (fix(interviews): make completion persistence idempotent).
+- **COMPLETION_IDEMPOTENCY_01: complete / committed / pushed**; closure supplied by user and committed HEAD verified locally; no remote fetch.
+- Next roadmap stage AFTER Git closure: **SECURITY_PRIVACY_01 — planned / NOT STARTED / NOT IMPLEMENTED / NOT YET AUTHORIZED**. No automatic next-stage authority.
+
+### Completed route/input decision
+
+Server /interview order: existing trusted getAuthenticatedUser -> signed-out /login redirect -> parse decoded searchParams -> invalid/missing config /interview/setup redirect -> typed LiveInterviewClient. No middleware or auth redesign. Valid authenticated Setup and direct valid Live URLs remain usable without login detours.
+
+The framework-independent, dependency-free interview-setup-input helper owns runtime sets and derived types: interviewer f/m; level junior/mid/senior; type behavioral/technical/mixed/case; persona friendly/formal/tough/curious; interview language tr/en/de. Membership uses exact array comparison, never truthy object lookup: unknown, wrong-case, constructor and __proto__ values are rejected.
+
+Consumed query keys: iv, role, company, level, itype, persona, language. iv/level/itype/persona/language are required exactly once. role/company are optional at most once. Array representations of any consumed key are rejected, including same-value duplicates. cv and arbitrary unused extras remain ignored. Next-decoded values are validated without manual URL decoding.
+
+Role/company remain optional. Raw decoded length is checked before trim: <=200 Unicode code points using Array.from, with C0 U+0000-U+001F and C1/DEL U+007F-U+009F rejected. Surrounding whitespace is trimmed; missing/empty/whitespace-only values become Genel. Ordinary Unicode, accents and emoji remain unchanged after trim. Setup uses the same helper and localized TR/EN/DE accessible validation feedback.
+
+Live logic is extracted into components/interview/LiveInterviewClient.tsx with an InterviewSetupInput config prop, no URLSearchParams parsing and no required-config defaults. A deterministic key derived from all validated config fields prevents different configurations mixing old session state. Existing effects, provider/prompt/TTS, transition, completion and render behavior remain semantically preserved; typed mappings replace the former any interviewer lookup.
+
+POST /api/interviews validates interviewerKey, level, interviewType, persona and language membership plus role/company canonical text. Incoming POST text must already be trimmed, nonempty, bounded and control-free; no server defaulting/normalization changes replay payload content. Invalid payload returns existing 400 Invalid interview payload before persistence. Existing answers/score/summary/duration/identity validation is preserved.
+
+COMPLETION_IDEMPOTENCY_01 architecture is unchanged: auth first; server-derived owner; UUID v4 completionId; insert-first; 201 first insert; 200 matching replay; generic 409 conflict; no overwrite; owner-scoped replay; private/no-store. Reliability and response-loss retry regressions passed.
+
+### Recorded automated validation — not rerun in this documentation turn
+
+| Suite / command | Result |
+|---|---|
+| node --test lib/interviews/interview-setup-input.test.cjs | 134/134 PASS, exit 0 |
+| node --test lib/interviews/interview-route-input.test.cjs | 46/46 PASS, exit 0 |
+| node --test components/interview/InterviewSetupForm.test.cjs | 41/41 PASS, exit 0 |
+| node --test lib/interviews/interview-session-state.test.cjs | 55/55 PASS, exit 0 |
+| node --test lib/interviews/persist-owned-interview.test.cjs | 71/71 PASS, exit 0 |
+| node --test lib/interviews/interview-completion-state.test.cjs | 14/14 PASS, exit 0 |
+| Result ownership, deletion, pagination, History loading and PDF regressions | 96/96 PASS, exit 0 |
+| Total deterministic tests | **457/457 PASS**; no skipped tests |
+| npx.cmd tsc --noEmit --incremental false | PASS, exit 0 |
+| Implementation git diff --check and new-file whitespace check | PASS, exit 0 |
+| npm.cmd run build | PASS, exit 0; **22/22** generated pages |
+
+Regression command: node --test lib/interviews/read-owned-interview.test.cjs lib/interviews/delete-owned-interview.test.cjs lib/interviews/history-cursor.test.cjs lib/interviews/history-pagination.test.cjs components/interviews/useFullInterviewHistory.test.cjs components/result/useInterviewDeletion.test.cjs lib/reports/interview-report.test.cjs. PDF inspector used invocation-local REPORT_PDF_PYTHON pointing to the existing bundled Python; no persistent configuration or installation.
+
+Initial Setup tests exposed test-harness traversal errors and a missing desktop form error-description association. Both were corrected; final Setup run passed. Existing reliability/idempotency assertions were preserved. Build preceded only removal of inherited trailing whitespace in the extracted client; no semantic change followed validation.
+
+Before build, sandbox process inspection returned Access denied. Authorized read-only retry succeeded: **0 repository Next dev/start processes**. No process was terminated; dev server was not restarted. Two webpack dependency-cache snapshot warnings, npm update notice and informational LF-to-CRLF notices were recorded. No product regression was established by those warnings.
+
+### User-supervised local browser acceptance — USER-VERIFIED PASS
+
+Evidence source: the user's acceptance report supplied for this documentation turn. These checks were not executed or rerun by the agent.
+
+| Check | User-observed behavior | Result |
+|---|---|---|
+| A. Clean/incognito signed-out /interview | Redirected to /login; Live did not open | PASS |
+| B. Authenticated /interview, no params | Redirected to /interview/setup; no unnecessary login | PASS |
+| C. iv=unknown, otherwise valid query | Redirected to Setup; Live did not open | PASS |
+| D. level=garbage, otherwise valid query | Redirected to Setup | PASS |
+| E. level=junior&level=senior | Redirected to Setup | PASS |
+| F. Authenticated normal Setup -> Live | No login redirect; valid query; Live loaded; Q1 generated; TTS worked | PASS |
+| G. Ctrl+R on valid authenticated Live URL | No login/Setup redirect; Live reloaded; Q1 generated; TTS worked | PASS |
+| H. Browser Back from valid Live | Returned to Setup | PASS |
+
+Invalid/missing config never renders/mounts LiveInterviewClient. Deterministic harnesses prove zero Claude question requests, ElevenLabs TTS requests, Live camera acquisition and persistence POST. **This exact zero-activity condition was not manually measured in browser Network.** Real Q1/TTS behavior was user-verified only for valid Setup/refresh flows.
+
+Authenticated testing remains Setup -> valid submit -> Live, without forced re-login. A fully valid bookmarked Live URL remains directly usable while authenticated (deterministic route proof). No dev-only auth bypass exists.
+
+No answer/completion flow was executed during this stage's browser acceptance; no Result or persisted interview was created, no persistence was intentionally triggered, and History count was not changed by this acceptance, per user evidence. History was not queried/recounted by the agent. No new History record or current count is asserted. **HISTORY_PAGINATION_01: NATURAL-RECORD DEFERRED ACCEPTANCE** remains; no synthetic seeding.
+
+### Accepted remaining boundaries / untouched foundations
+
+Result/detail/delete/PDF IDs: **ALREADY HARDENED / OUT OF IMPLEMENTATION SCOPE**. Authentication precedes UUID validation/ownership work; malformed signed-in UUID -> 400; foreign/nonexistent -> same 404; reads/deletes are owner-scoped; PDF uses the protected reader. No source changes there. New write validation is not applied to historical reads; older unsupported persisted values remain readable, without migration/backfill. Existing historical unsupported-language PDF limitations are unchanged.
+
+Direct provider endpoint auth/rate limiting, prompt injection/privacy/private-content logging, and provider resource/cost abuse controls remain SECURITY_PRIVACY_01. Page gating is not provider-endpoint security. Live UI/interview-language coupling remains LOCALIZATION_V1_01; session resume remains SESSION_RESUME_01; Media/device truthfulness and later provider/media work remain MEDIA_PROVIDER_V1_01. These are deferred boundaries, not regressions introduced here.
+
+No migration, package/dependency/configuration/CSS changes; no History/Result/PDF/Profile/Auth implementation changes; no scoring redesign or answer/summary resource policy. No secrets or environment-variable values recorded. No Supabase mutation, browser rerun, tests/build rerun, staging, commit or push in this documentation turn.
+
+This entry supersedes earlier pending route-input and completion Git-status statements for current planning only. INTERVIEW-013 (direct Live auth gate) and INTERVIEW-014 (interviewer key validation) are locally resolved by this stage, pending Git closure. Historical entries and immutable prior reports remain unchanged. ROADMAP_FREEZE_01 critical-path ordering remains unchanged.
diff --git a/docs/04_Project_Memory/DEFERRED_FIXES.md b/docs/04_Project_Memory/DEFERRED_FIXES.md
index e86e017..bc6c62a 100644
--- a/docs/04_Project_Memory/DEFERRED_FIXES.md
+++ b/docs/04_Project_Memory/DEFERRED_FIXES.md
@@ -1137,3 +1137,81 @@ No deliberate live response-loss/duplicate replay was performed against real Sup
 - After failed save, retry targets the original frozen intent even if live answers change; no automatic second identity is created.
\u0020
 These qualifications do not block local closure. Existing reliability state-machine protection and approved zero/partial behavior remain preserved. No History/Result/PDF/Profile/Auth implementation, schema, dependency or configuration changes. This entry supersedes earlier pending idempotency/reliability Git status only; historical entries/reports remain unchanged. No staging, commit, push, Supabase mutation, browser rerun, tests/build rerun or next-stage implementation in this documentation turn.
+
+## ROUTE_INPUT_HARDENING_01 — Acceptance closure — 2026-10-07
+
+- Date recorded: 2026-10-07 (Europe/Istanbul).
+- **IMPLEMENTATION + AUTOMATED VALIDATION + LOCAL BROWSER ACCEPTANCE: PASS**.
+- Current stage: **UNCOMMITTED / pending final Git closure**; final documentation/pre-commit review required. No commit/push approval or future hash asserted.
+- Branch: feature/auth-foundation. Safe committed base and local origin ref: 1ce03bae7a002b4b68e274e2dfbfb872300e9d3b (fix(interviews): make completion persistence idempotent).
+- **COMPLETION_IDEMPOTENCY_01: complete / committed / pushed**; closure supplied by user and committed HEAD verified locally; no remote fetch.
+- Next roadmap stage AFTER Git closure: **SECURITY_PRIVACY_01 — planned / NOT STARTED / NOT IMPLEMENTED / NOT YET AUTHORIZED**. No automatic next-stage authority.
+
+### Completed route/input decision
+
+Server /interview order: existing trusted getAuthenticatedUser -> signed-out /login redirect -> parse decoded searchParams -> invalid/missing config /interview/setup redirect -> typed LiveInterviewClient. No middleware or auth redesign. Valid authenticated Setup and direct valid Live URLs remain usable without login detours.
+
+The framework-independent, dependency-free interview-setup-input helper owns runtime sets and derived types: interviewer f/m; level junior/mid/senior; type behavioral/technical/mixed/case; persona friendly/formal/tough/curious; interview language tr/en/de. Membership uses exact array comparison, never truthy object lookup: unknown, wrong-case, constructor and __proto__ values are rejected.
+
+Consumed query keys: iv, role, company, level, itype, persona, language. iv/level/itype/persona/language are required exactly once. role/company are optional at most once. Array representations of any consumed key are rejected, including same-value duplicates. cv and arbitrary unused extras remain ignored. Next-decoded values are validated without manual URL decoding.
+
+Role/company remain optional. Raw decoded length is checked before trim: <=200 Unicode code points using Array.from, with C0 U+0000-U+001F and C1/DEL U+007F-U+009F rejected. Surrounding whitespace is trimmed; missing/empty/whitespace-only values become Genel. Ordinary Unicode, accents and emoji remain unchanged after trim. Setup uses the same helper and localized TR/EN/DE accessible validation feedback.
+
+Live logic is extracted into components/interview/LiveInterviewClient.tsx with an InterviewSetupInput config prop, no URLSearchParams parsing and no required-config defaults. A deterministic key derived from all validated config fields prevents different configurations mixing old session state. Existing effects, provider/prompt/TTS, transition, completion and render behavior remain semantically preserved; typed mappings replace the former any interviewer lookup.
+
+POST /api/interviews validates interviewerKey, level, interviewType, persona and language membership plus role/company canonical text. Incoming POST text must already be trimmed, nonempty, bounded and control-free; no server defaulting/normalization changes replay payload content. Invalid payload returns existing 400 Invalid interview payload before persistence. Existing answers/score/summary/duration/identity validation is preserved.
+
+COMPLETION_IDEMPOTENCY_01 architecture is unchanged: auth first; server-derived owner; UUID v4 completionId; insert-first; 201 first insert; 200 matching replay; generic 409 conflict; no overwrite; owner-scoped replay; private/no-store. Reliability and response-loss retry regressions passed.
+
+### Recorded automated validation — not rerun in this documentation turn
+
+| Suite / command | Result |
+|---|---|
+| node --test lib/interviews/interview-setup-input.test.cjs | 134/134 PASS, exit 0 |
+| node --test lib/interviews/interview-route-input.test.cjs | 46/46 PASS, exit 0 |
+| node --test components/interview/InterviewSetupForm.test.cjs | 41/41 PASS, exit 0 |
+| node --test lib/interviews/interview-session-state.test.cjs | 55/55 PASS, exit 0 |
+| node --test lib/interviews/persist-owned-interview.test.cjs | 71/71 PASS, exit 0 |
+| node --test lib/interviews/interview-completion-state.test.cjs | 14/14 PASS, exit 0 |
+| Result ownership, deletion, pagination, History loading and PDF regressions | 96/96 PASS, exit 0 |
+| Total deterministic tests | **457/457 PASS**; no skipped tests |
+| npx.cmd tsc --noEmit --incremental false | PASS, exit 0 |
+| Implementation git diff --check and new-file whitespace check | PASS, exit 0 |
+| npm.cmd run build | PASS, exit 0; **22/22** generated pages |
+
+Regression command: node --test lib/interviews/read-owned-interview.test.cjs lib/interviews/delete-owned-interview.test.cjs lib/interviews/history-cursor.test.cjs lib/interviews/history-pagination.test.cjs components/interviews/useFullInterviewHistory.test.cjs components/result/useInterviewDeletion.test.cjs lib/reports/interview-report.test.cjs. PDF inspector used invocation-local REPORT_PDF_PYTHON pointing to the existing bundled Python; no persistent configuration or installation.
+
+Initial Setup tests exposed test-harness traversal errors and a missing desktop form error-description association. Both were corrected; final Setup run passed. Existing reliability/idempotency assertions were preserved. Build preceded only removal of inherited trailing whitespace in the extracted client; no semantic change followed validation.
+
+Before build, sandbox process inspection returned Access denied. Authorized read-only retry succeeded: **0 repository Next dev/start processes**. No process was terminated; dev server was not restarted. Two webpack dependency-cache snapshot warnings, npm update notice and informational LF-to-CRLF notices were recorded. No product regression was established by those warnings.
+
+### User-supervised local browser acceptance — USER-VERIFIED PASS
+
+Evidence source: the user's acceptance report supplied for this documentation turn. These checks were not executed or rerun by the agent.
+
+| Check | User-observed behavior | Result |
+|---|---|---|
+| A. Clean/incognito signed-out /interview | Redirected to /login; Live did not open | PASS |
+| B. Authenticated /interview, no params | Redirected to /interview/setup; no unnecessary login | PASS |
+| C. iv=unknown, otherwise valid query | Redirected to Setup; Live did not open | PASS |
+| D. level=garbage, otherwise valid query | Redirected to Setup | PASS |
+| E. level=junior&level=senior | Redirected to Setup | PASS |
+| F. Authenticated normal Setup -> Live | No login redirect; valid query; Live loaded; Q1 generated; TTS worked | PASS |
+| G. Ctrl+R on valid authenticated Live URL | No login/Setup redirect; Live reloaded; Q1 generated; TTS worked | PASS |
+| H. Browser Back from valid Live | Returned to Setup | PASS |
+
+Invalid/missing config never renders/mounts LiveInterviewClient. Deterministic harnesses prove zero Claude question requests, ElevenLabs TTS requests, Live camera acquisition and persistence POST. **This exact zero-activity condition was not manually measured in browser Network.** Real Q1/TTS behavior was user-verified only for valid Setup/refresh flows.
+
+Authenticated testing remains Setup -> valid submit -> Live, without forced re-login. A fully valid bookmarked Live URL remains directly usable while authenticated (deterministic route proof). No dev-only auth bypass exists.
+
+No answer/completion flow was executed during this stage's browser acceptance; no Result or persisted interview was created, no persistence was intentionally triggered, and History count was not changed by this acceptance, per user evidence. History was not queried/recounted by the agent. No new History record or current count is asserted. **HISTORY_PAGINATION_01: NATURAL-RECORD DEFERRED ACCEPTANCE** remains; no synthetic seeding.
+
+### Accepted remaining boundaries / untouched foundations
+
+Result/detail/delete/PDF IDs: **ALREADY HARDENED / OUT OF IMPLEMENTATION SCOPE**. Authentication precedes UUID validation/ownership work; malformed signed-in UUID -> 400; foreign/nonexistent -> same 404; reads/deletes are owner-scoped; PDF uses the protected reader. No source changes there. New write validation is not applied to historical reads; older unsupported persisted values remain readable, without migration/backfill. Existing historical unsupported-language PDF limitations are unchanged.
+
+Direct provider endpoint auth/rate limiting, prompt injection/privacy/private-content logging, and provider resource/cost abuse controls remain SECURITY_PRIVACY_01. Page gating is not provider-endpoint security. Live UI/interview-language coupling remains LOCALIZATION_V1_01; session resume remains SESSION_RESUME_01; Media/device truthfulness and later provider/media work remain MEDIA_PROVIDER_V1_01. These are deferred boundaries, not regressions introduced here.
+
+No migration, package/dependency/configuration/CSS changes; no History/Result/PDF/Profile/Auth implementation changes; no scoring redesign or answer/summary resource policy. No secrets or environment-variable values recorded. No Supabase mutation, browser rerun, tests/build rerun, staging, commit or push in this documentation turn.
+
+This entry supersedes earlier pending route-input and completion Git-status statements for current planning only. INTERVIEW-013 (direct Live auth gate) and INTERVIEW-014 (interviewer key validation) are locally resolved by this stage, pending Git closure. Historical entries and immutable prior reports remain unchanged. ROADMAP_FREEZE_01 critical-path ordering remains unchanged.
diff --git a/docs/04_Project_Memory/STAGE_LOG.md b/docs/04_Project_Memory/STAGE_LOG.md
index b4758dc..4c034d9 100644
--- a/docs/04_Project_Memory/STAGE_LOG.md
+++ b/docs/04_Project_Memory/STAGE_LOG.md
@@ -2040,3 +2040,81 @@ No deliberate live response-loss/duplicate replay was performed against real Sup
 - After failed save, retry targets the original frozen intent even if live answers change; no automatic second identity is created.
\u0020
 These qualifications do not block local closure. Existing reliability state-machine protection and approved zero/partial behavior remain preserved. No History/Result/PDF/Profile/Auth implementation, schema, dependency or configuration changes. This entry supersedes earlier pending idempotency/reliability Git status only; historical entries/reports remain unchanged. No staging, commit, push, Supabase mutation, browser rerun, tests/build rerun or next-stage implementation in this documentation turn.
+
+## ROUTE_INPUT_HARDENING_01 — Acceptance closure — 2026-10-07
+
+- Date recorded: 2026-10-07 (Europe/Istanbul).
+- **IMPLEMENTATION + AUTOMATED VALIDATION + LOCAL BROWSER ACCEPTANCE: PASS**.
+- Current stage: **UNCOMMITTED / pending final Git closure**; final documentation/pre-commit review required. No commit/push approval or future hash asserted.
+- Branch: feature/auth-foundation. Safe committed base and local origin ref: 1ce03bae7a002b4b68e274e2dfbfb872300e9d3b (fix(interviews): make completion persistence idempotent).
+- **COMPLETION_IDEMPOTENCY_01: complete / committed / pushed**; closure supplied by user and committed HEAD verified locally; no remote fetch.
+- Next roadmap stage AFTER Git closure: **SECURITY_PRIVACY_01 — planned / NOT STARTED / NOT IMPLEMENTED / NOT YET AUTHORIZED**. No automatic next-stage authority.
+
+### Completed route/input decision
+
+Server /interview order: existing trusted getAuthenticatedUser -> signed-out /login redirect -> parse decoded searchParams -> invalid/missing config /interview/setup redirect -> typed LiveInterviewClient. No middleware or auth redesign. Valid authenticated Setup and direct valid Live URLs remain usable without login detours.
+
+The framework-independent, dependency-free interview-setup-input helper owns runtime sets and derived types: interviewer f/m; level junior/mid/senior; type behavioral/technical/mixed/case; persona friendly/formal/tough/curious; interview language tr/en/de. Membership uses exact array comparison, never truthy object lookup: unknown, wrong-case, constructor and __proto__ values are rejected.
+
+Consumed query keys: iv, role, company, level, itype, persona, language. iv/level/itype/persona/language are required exactly once. role/company are optional at most once. Array representations of any consumed key are rejected, including same-value duplicates. cv and arbitrary unused extras remain ignored. Next-decoded values are validated without manual URL decoding.
+
+Role/company remain optional. Raw decoded length is checked before trim: <=200 Unicode code points using Array.from, with C0 U+0000-U+001F and C1/DEL U+007F-U+009F rejected. Surrounding whitespace is trimmed; missing/empty/whitespace-only values become Genel. Ordinary Unicode, accents and emoji remain unchanged after trim. Setup uses the same helper and localized TR/EN/DE accessible validation feedback.
+
+Live logic is extracted into components/interview/LiveInterviewClient.tsx with an InterviewSetupInput config prop, no URLSearchParams parsing and no required-config defaults. A deterministic key derived from all validated config fields prevents different configurations mixing old session state. Existing effects, provider/prompt/TTS, transition, completion and render behavior remain semantically preserved; typed mappings replace the former any interviewer lookup.
+
+POST /api/interviews validates interviewerKey, level, interviewType, persona and language membership plus role/company canonical text. Incoming POST text must already be trimmed, nonempty, bounded and control-free; no server defaulting/normalization changes replay payload content. Invalid payload returns existing 400 Invalid interview payload before persistence. Existing answers/score/summary/duration/identity validation is preserved.
+
+COMPLETION_IDEMPOTENCY_01 architecture is unchanged: auth first; server-derived owner; UUID v4 completionId; insert-first; 201 first insert; 200 matching replay; generic 409 conflict; no overwrite; owner-scoped replay; private/no-store. Reliability and response-loss retry regressions passed.
+
+### Recorded automated validation — not rerun in this documentation turn
+
+| Suite / command | Result |
+|---|---|
+| node --test lib/interviews/interview-setup-input.test.cjs | 134/134 PASS, exit 0 |
+| node --test lib/interviews/interview-route-input.test.cjs | 46/46 PASS, exit 0 |
+| node --test components/interview/InterviewSetupForm.test.cjs | 41/41 PASS, exit 0 |
+| node --test lib/interviews/interview-session-state.test.cjs | 55/55 PASS, exit 0 |
+| node --test lib/interviews/persist-owned-interview.test.cjs | 71/71 PASS, exit 0 |
+| node --test lib/interviews/interview-completion-state.test.cjs | 14/14 PASS, exit 0 |
+| Result ownership, deletion, pagination, History loading and PDF regressions | 96/96 PASS, exit 0 |
+| Total deterministic tests | **457/457 PASS**; no skipped tests |
+| npx.cmd tsc --noEmit --incremental false | PASS, exit 0 |
+| Implementation git diff --check and new-file whitespace check | PASS, exit 0 |
+| npm.cmd run build | PASS, exit 0; **22/22** generated pages |
+
+Regression command: node --test lib/interviews/read-owned-interview.test.cjs lib/interviews/delete-owned-interview.test.cjs lib/interviews/history-cursor.test.cjs lib/interviews/history-pagination.test.cjs components/interviews/useFullInterviewHistory.test.cjs components/result/useInterviewDeletion.test.cjs lib/reports/interview-report.test.cjs. PDF inspector used invocation-local REPORT_PDF_PYTHON pointing to the existing bundled Python; no persistent configuration or installation.
+
+Initial Setup tests exposed test-harness traversal errors and a missing desktop form error-description association. Both were corrected; final Setup run passed. Existing reliability/idempotency assertions were preserved. Build preceded only removal of inherited trailing whitespace in the extracted client; no semantic change followed validation.
+
+Before build, sandbox process inspection returned Access denied. Authorized read-only retry succeeded: **0 repository Next dev/start processes**. No process was terminated; dev server was not restarted. Two webpack dependency-cache snapshot warnings, npm update notice and informational LF-to-CRLF notices were recorded. No product regression was established by those warnings.
+
+### User-supervised local browser acceptance — USER-VERIFIED PASS
+
+Evidence source: the user's acceptance report supplied for this documentation turn. These checks were not executed or rerun by the agent.
+
+| Check | User-observed behavior | Result |
+|---|---|---|
+| A. Clean/incognito signed-out /interview | Redirected to /login; Live did not open | PASS |
+| B. Authenticated /interview, no params | Redirected to /interview/setup; no unnecessary login | PASS |
+| C. iv=unknown, otherwise valid query | Redirected to Setup; Live did not open | PASS |
+| D. level=garbage, otherwise valid query | Redirected to Setup | PASS |
+| E. level=junior&level=senior | Redirected to Setup | PASS |
+| F. Authenticated normal Setup -> Live | No login redirect; valid query; Live loaded; Q1 generated; TTS worked | PASS |
+| G. Ctrl+R on valid authenticated Live URL | No login/Setup redirect; Live reloaded; Q1 generated; TTS worked | PASS |
+| H. Browser Back from valid Live | Returned to Setup | PASS |
+
+Invalid/missing config never renders/mounts LiveInterviewClient. Deterministic harnesses prove zero Claude question requests, ElevenLabs TTS requests, Live camera acquisition and persistence POST. **This exact zero-activity condition was not manually measured in browser Network.** Real Q1/TTS behavior was user-verified only for valid Setup/refresh flows.
+
+Authenticated testing remains Setup -> valid submit -> Live, without forced re-login. A fully valid bookmarked Live URL remains directly usable while authenticated (deterministic route proof). No dev-only auth bypass exists.
+
+No answer/completion flow was executed during this stage's browser acceptance; no Result or persisted interview was created, no persistence was intentionally triggered, and History count was not changed by this acceptance, per user evidence. History was not queried/recounted by the agent. No new History record or current count is asserted. **HISTORY_PAGINATION_01: NATURAL-RECORD DEFERRED ACCEPTANCE** remains; no synthetic seeding.
+
+### Accepted remaining boundaries / untouched foundations
+
+Result/detail/delete/PDF IDs: **ALREADY HARDENED / OUT OF IMPLEMENTATION SCOPE**. Authentication precedes UUID validation/ownership work; malformed signed-in UUID -> 400; foreign/nonexistent -> same 404; reads/deletes are owner-scoped; PDF uses the protected reader. No source changes there. New write validation is not applied to historical reads; older unsupported persisted values remain readable, without migration/backfill. Existing historical unsupported-language PDF limitations are unchanged.
+
+Direct provider endpoint auth/rate limiting, prompt injection/privacy/private-content logging, and provider resource/cost abuse controls remain SECURITY_PRIVACY_01. Page gating is not provider-endpoint security. Live UI/interview-language coupling remains LOCALIZATION_V1_01; session resume remains SESSION_RESUME_01; Media/device truthfulness and later provider/media work remain MEDIA_PROVIDER_V1_01. These are deferred boundaries, not regressions introduced here.
+
+No migration, package/dependency/configuration/CSS changes; no History/Result/PDF/Profile/Auth implementation changes; no scoring redesign or answer/summary resource policy. No secrets or environment-variable values recorded. No Supabase mutation, browser rerun, tests/build rerun, staging, commit or push in this documentation turn.
+
+This entry supersedes earlier pending route-input and completion Git-status statements for current planning only. INTERVIEW-013 (direct Live auth gate) and INTERVIEW-014 (interviewer key validation) are locally resolved by this stage, pending Git closure. Historical entries and immutable prior reports remain unchanged. ROADMAP_FREEZE_01 critical-path ordering remains unchanged.
diff --git a/lib/interviews/interview-session-state.test.cjs b/lib/interviews/interview-session-state.test.cjs
index 883dbd2..79e5631 100644
--- a/lib/interviews/interview-session-state.test.cjs
+++ b/lib/interviews/interview-session-state.test.cjs
@@ -73,7 +73,7 @@ const cases = [
  ['superseded generation cannot commit or release newer operation', () => { const s=createInterviewSessionState(), op=s.beginGeneration(); s.release(op.token); const c=s.beginCompletion([]); assert.equal(s.acceptQuestion(op.token,'late'),null); assert.equal(s.release(op.token),false); assert.ok(s.isCurrent(c.token)) }],
 ]
 for(const [name, run] of cases) test(name,run)
-const page = fs.readFileSync(require('node:path').join(__dirname,'../../app/interview/page.tsx'),'utf8')
+const page = fs.readFileSync(require('node:path').join(__dirname,'../../components/interview/LiveInterviewClient.tsx'),'utf8')
 const workspace = fs.readFileSync(require('node:path').join(__dirname,'../../components/interview/InterviewWorkspace.tsx'),'utf8')
 const controls = fs.readFileSync(require('node:path').join(__dirname,'../../components/interview/LiveInterviewControls.tsx'),'utf8')
 test('page synchronous guards precede mutation and provider requests', () => {
@@ -114,7 +114,7 @@ function pageHarness(language = 'en', navigation = null) {
   React.default=React
   const imports = {
     react: React,
-    'next/navigation': { useSearchParams:()=>({get:key=>key==='language'?language:null}), useRouter:()=>({push:route=>{if(navigation)navigation(route);routes.push(route)}}) },
+    'next/navigation': { useRouter:()=>({push:route=>{if(navigation)navigation(route);routes.push(route)}}) },
     '@/lib/interviews/interview-session-state': loaded.exports,
     '@/lib/interviews/interview-completion-state': completionModule,
     '@/components/ui': {TalentryButton:'Button'},
@@ -122,7 +122,7 @@ function pageHarness(language = 'en', navigation = null) {
     '@/components/interview/LiveInterviewControls': { default:'Controls' },
     '@/components/interview/LiveInterviewHeader': { default:'Header' },
     '@/components/interview/InterviewerStage': { default:'Stage' },
-    './interview.module.css': {default:{}},
+    '@/app/interview/interview.module.css': {default:{}},
   }
   const scope = {
     React, crypto:{randomUUID:()=> '11111111-1111-4111-8111-111111111111'},
@@ -136,8 +136,9 @@ function pageHarness(language = 'en', navigation = null) {
   }
   const output=ts.transpileModule(page,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.React}}).outputText
   vm.runInNewContext(output,scope)
-  const content=scope.exports.default().props.children[0].type
-  function render(){cursor=0;tree=content();mounting=false;return tree}
+  const content=scope.exports.default
+  const config={interviewerKey:'f',role:'Genel',company:'Genel',level:'mid',interviewType:'behavioral',persona:'formal',language}
+  function render(){cursor=0;tree=content({config});mounting=false;return tree}
   function find(type,node=tree){if(!node||typeof node!=='object')return null;if(node.type===type)return node.props;for(const child of (node.props?.children||[]).flat(Infinity)){const result=find(type,child);if(result)return result}return null}
   render(); for(const effect of effects) cleanups.push(effect())
   return { requests,routes,audio,hooks,render,workspace:()=>find('Workspace'),controls:()=>find('Controls'),dispose:()=>cleanups.forEach(fn=>fn?.()) }
diff --git a/lib/interviews/persist-owned-interview.test.cjs b/lib/interviews/persist-owned-interview.test.cjs
index b33650a..797d6d5 100644
--- a/lib/interviews/persist-owned-interview.test.cjs
+++ b/lib/interviews/persist-owned-interview.test.cjs
@@ -2,6 +2,7 @@ const { test } = require('node:test')
 const assert = require('node:assert/strict')
 const { NextResponse } = require('next/server')
 const { load, plain, uuid, cursor } = require('./history-test-helpers.cjs')
+const input = load('lib/interviews/interview-setup-input.ts', {})
 const identity = load('lib/interviews/interview-completion-state.ts', {})
 const payload = () => ({ interviewerKey:'f',role:'Engineer',company:'Example',level:'mid',interviewType:'technical',persona:'formal',language:'en',answers:[{q:'Q1',a:'A1'},{q:'Q2',a:'A2'}],score:80,summary:'Summary',durationSeconds:60 })
 const unique = {code:'23505',message:'duplicate key value violates unique constraint "interviews_pkey"'}
@@ -15,7 +16,7 @@ function harness(options={}) {
     async maybeSingle(){if(options.readError)return {data:null,error:{code:'DB'}};const row=[...rows.values()].find(row=>filters.every(([key,value])=>row[key]===value));return {data:row||null,error:null}},
   }}}
   const helper=load('lib/interviews/persist-owned-interview.ts',{'server-only':{},'@/lib/supabase/admin':{createAdminClient:()=>admin}})
-  const route=load('app/api/interviews/route.ts',{'next/server':{NextResponse},'@/lib/auth/get-authenticated-user':{async getAuthenticatedUser(){calls.push(['auth']);return options.unauthorized?{status:'unauthorized'}:{status:'authenticated',user:{id:'owner-a'}}}},'@/lib/supabase/admin':{createAdminClient:()=>admin},'@/lib/interviews/history-cursor':cursor,'@/lib/interviews/interview-completion-state':identity,'@/lib/interviews/persist-owned-interview':helper})
+  const route=load('app/api/interviews/route.ts',{'@/lib/interviews/interview-setup-input':input,'next/server':{NextResponse},'@/lib/auth/get-authenticated-user':{async getAuthenticatedUser(){calls.push(['auth']);return options.unauthorized?{status:'unauthorized'}:{status:'authenticated',user:{id:'owner-a'}}}},'@/lib/supabase/admin':{createAdminClient:()=>admin},'@/lib/interviews/history-cursor':cursor,'@/lib/interviews/interview-completion-state':identity,'@/lib/interviews/persist-owned-interview':helper})
   return {rows,calls,...helper,async post(body={completionId:uuid(1),...payload()},invalidJson=false){return route.POST({async json(){calls.push(['json']);if(invalidJson)throw Error('JSON');return body}})}}
 }
 // Shared only with the approved page suite; all imports are isolated and no network is used.
@@ -40,4 +41,26 @@ test('route first replay conflict and client owner isolation',async()=>{const h=
 test('route foreign collision has identical generic conflict body',async()=>{const h=harness();await h.persistOwnedInterview('foreign',uuid(1),payload());await check(await h.post(),409,{error:'Completion conflict'})})
 test('route DB and recovery errors are generic 500',async()=>{await check(await harness({insertError:{code:'DB',message:'private'}}).post(),500,{error:'Failed to save interview'});const h=harness({readError:true});await h.post();await check(await h.post(),500,{error:'Failed to save interview'})})
\u0020
+for (const field of ['interviewerKey','level','interviewType','persona','language']) {
+  for (const value of ['garbage','constructor','__proto__','',payload()[field].toUpperCase()]) {
+    test('route rejects nonmember '+field+' '+value+' before persistence',async()=>{
+      const h=harness();await check(await h.post({completionId:uuid(1),...payload(),[field]:value}),400,{error:'Invalid interview payload'});
+      assert.equal(h.rows.size,0);assert.equal(h.calls.some(call=>call[0]==='insert'),false)
+    })
+  }
+}
+for (const field of ['role','company']) {
+  for (const value of ['', '   ', ' padded', 'padded ', 'A\nB', 'A\u0080B', '😀'.repeat(201)]) {
+    test('route rejects noncanonical '+field+' '+JSON.stringify(value).slice(0,30),async()=>{
+      const h=harness();await check(await h.post({completionId:uuid(1),...payload(),[field]:value}),400,{error:'Invalid interview payload'});
+      assert.equal(h.rows.size,0);assert.equal(h.calls.some(call=>call[0]==='insert'),false)
+    })
+  }
+}
+test('route preserves canonical Unicode and 200-code-point text on insert and replay',async()=>{
+  const h=harness(),p={completionId:uuid(1),...payload(),role:'😀'.repeat(200),company:'Çağrı Développeur 日本語'};
+  await check(await h.post(p),201,{id:uuid(1),replayed:false});await check(await h.post(p),200,{id:uuid(1),replayed:true});
+  assert.equal(h.rows.get(uuid(1)).role,p.role);assert.equal(h.rows.get(uuid(1)).company,p.company);assert.equal(h.rows.size,1)
+})
+
 }

diff --git a/components/interview/InterviewSetupForm.test.cjs b/components/interview/InterviewSetupForm.test.cjs
new file mode 100644
--- /dev/null
+++ b/components/interview/InterviewSetupForm.test.cjs
@@ -0,0 +1,111 @@
+const { test } = require('node:test')
+const assert = require('node:assert/strict')
+const fs = require('node:fs')
+const path = require('node:path')
+const vm = require('node:vm')
+const ts = require('typescript')
+const { load, plain } = require('../../lib/interviews/history-test-helpers.cjs')
+const input = load('lib/interviews/interview-setup-input.ts', {})
+const config = load('components/interview/interview-setup-config.ts', {})
+
+function harness({ mobile = false, language = 'tr' } = {}) {
+  const states = [], effects = [], routes = []
+  let cursor = 0, mounting = true, tree
+  const jsx = (type, props, key) => ({ type, props: { ...props, key } })
+  const imports = {
+    'react/jsx-runtime': { jsx, jsxs: jsx },
+    react: { useState(value) { const i = cursor++; if (mounting) states[i] = value
+      return [states[i], next => { states[i] = typeof next === 'function' ? next(states[i]) : next }] },
+    useEffect(effect) { cursor++; if (mounting) effects.push(effect) } },
+    'next/link': { default: 'Link' },
+    'next/navigation': { useRouter: () => ({ push: route => routes.push(route) }) },
+    '@/components/ui': { SectionHeader: 'SectionHeader', TalentryButton: 'Button', TalentryCard: 'Card' },
+    '@/lib/auth/auth-constants': { AUTH_ROUTES: { dashboard: '/dashboard' }, DEFAULT_APP_LANGUAGE: 'tr', SUPPORTED_APP_LANGUAGES: ['tr', 'en', 'de'] },
+    '@/lib/interviews/interview-setup-input': input,
+    './InterviewSetupMobile': { default: 'Mobile' },
+    './interview-setup-config': config,
+  }
+  const source = fs.readFileSync(path.join(__dirname, 'InterviewSetupForm.tsx'), 'utf8')
+  const compiled = ts.transpileModule(source, { compilerOptions: {
+    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX,
+  } }).outputText
+  const scope = { exports: {}, URLSearchParams, window: {
+    matchMedia: () => ({ matches: mobile, addEventListener() {}, removeEventListener() {} }),
+    localStorage: { getItem: () => language, setItem() {} },
+  }, require(name) { assert.ok(Object.hasOwn(imports, name), name); return imports[name] } }
+  vm.runInNewContext(compiled, scope)
+  function render() { cursor = 0; tree = scope.exports.default(); mounting = false; return tree }
+  function all(predicate, node = tree) {
+    if (!node || typeof node !== 'object') return []
+    if (Array.isArray(node)) return node.flatMap(child => all(predicate, child))
+    return [...(predicate(node) ? [node] : []), ...all(predicate, node.props?.children ?? null)]
+  }
+  render(); effects.forEach(effect => effect()); render()
+  return { routes, render, all,
+    change(key, value) {
+      if (mobile) all(node => node.type === 'Mobile')[0].props.changes[key](value)
+      else {
+        const id = { role: 'role', company: 'company', level: 'level', interviewType: 'type', persona: 'persona', interviewLanguage: 'language' }[key]
+        if (key === 'interviewer') all(node => node.props?.id === `setup-interviewer-${value}`)[0].props.onChange()
+        else all(node => node.props?.id === `setup-${id}`)[0].props.onChange({ target: { value } })
+      }
+      render()
+    },
+    submit() { all(node => node.type === 'form')[0].props.onSubmit({ preventDefault() {} }); render() },
+    parsed() {
+      const params = new URL(routes.at(-1), 'https://fixture.invalid').searchParams
+      return { params, config: input.parseInterviewSetupInput(Object.fromEntries(params)) }
+    },
+  }
+}
+for (const mobile of [false, true]) {
+  const mode = mobile ? 'mobile' : 'desktop'
+  test(`${mode} valid optional blank Setup goes directly to parser-valid Live URL`, () => {
+    const h = harness({ mobile }); h.submit()
+    assert.equal(h.routes.length, 1); assert.ok(h.routes[0].startsWith('/interview?'))
+    assert.equal(h.parsed().config.role, 'Genel'); assert.equal(h.parsed().config.company, 'Genel')
+    assert.equal(h.parsed().params.get('cv'), '')
+    assert.equal(h.routes.some(route => route === '/login'), false)
+  })
+  test(`${mode} trims optional role/company and preserves Unicode`, () => {
+    const h = harness({ mobile }); h.change('role', ' Çağrı Développeur 日本語 😀 '); h.change('company', ' Example + Co '); h.submit()
+    assert.equal(h.parsed().config.role, 'Çağrı Développeur 日本語 😀')
+    assert.equal(h.parsed().config.company, 'Example + Co')
+  })
+  test(`${mode} whitespace optional values remain accepted`, () => {
+    const h = harness({ mobile }); h.change('role', '   '); h.change('company', '\u2003'); h.submit()
+    assert.equal(h.parsed().config.role, 'Genel'); assert.equal(h.parsed().config.company, 'Genel')
+  })
+  for (const key of ['role', 'company']) {
+    test(`${mode} ${key} accepts 200 emoji code points`, () => {
+      const h = harness({ mobile }); h.change(key, '😀'.repeat(200)); h.submit()
+      assert.equal(h.parsed().config[key], '😀'.repeat(200))
+    })
+    for (const value of ['😀'.repeat(201), ' '.repeat(201), ' A\nB ', 'A\u0080B']) {
+      test(`${mode} invalid ${key} prevents navigation and exposes associated alert`, () => {
+        const h = harness({ mobile }); h.change(key, value); h.submit()
+        assert.equal(h.routes.length, 0)
+        const alert = h.all(node => node.props?.role === 'alert')[0]
+        assert.equal(alert.props.id, 'setup-validation-error'); assert.ok(alert.props.children)
+        assert.equal(h.all(node => node.type === 'form')[0].props['aria-describedby'], alert.props.id)
+      })
+    }
+  }
+  test(`${mode} correcting invalid input permits navigation and clears error`, () => {
+    const h = harness({ mobile }); h.change('role', 'A\nB'); h.submit(); h.change('role', 'Engineer'); h.submit()
+    assert.equal(h.routes.length, 1); assert.equal(h.all(node => node.props?.role === 'alert').length, 0)
+  })
+  for (const [key, values] of Object.entries({ interviewer: ['f', 'm'], level: ['junior', 'mid', 'senior'],
+    interviewType: ['behavioral', 'technical', 'mixed', 'case'], persona: ['friendly', 'formal', 'tough', 'curious'],
+    interviewLanguage: ['tr', 'en', 'de'] })) {
+    test(`${mode} canonical ${key} options generate parser-valid URLs`, () => {
+      for (const value of values) { const h = harness({ mobile }); h.change(key, value); h.submit(); assert.ok(h.parsed().config) }
+    })
+  }
+}
+for (const language of ['tr', 'en', 'de']) test(`${language} uses localized validation feedback without changing interview language`, () => {
+  const h = harness({ language }); h.change('role', '\u0000'); h.submit()
+  assert.equal(h.all(node => node.props?.role === 'alert')[0].props.children, config.COPY[language].validationError)
+  assert.equal(h.all(node => node.type === 'main')[0].props.lang, language)
+  h.change('role', 'Engineer'); h.submit(); assert.equal(h.parsed().config.language, 'tr')
+})

diff --git a/components/interview/LiveInterviewClient.tsx b/components/interview/LiveInterviewClient.tsx
new file mode 100644
--- /dev/null
+++ b/components/interview/LiveInterviewClient.tsx
@@ -0,0 +1,680 @@
+'use client'
+import { useEffect, useRef, useState, useCallback } from 'react'
+import { useRouter } from 'next/navigation'
+import LiveInterviewHeader from '@/components/interview/LiveInterviewHeader'
+import InterviewerStage from '@/components/interview/InterviewerStage'
+import type { SpeechStatus } from '@/components/interview/InterviewerStage'
+import InterviewWorkspace, { InterviewFeedbackCard } from '@/components/interview/InterviewWorkspace'
+import type { InterviewFeedback, InterviewTab, InterviewWorkspaceLabels } from '@/components/interview/InterviewWorkspace'
+import LiveInterviewControls from '@/components/interview/LiveInterviewControls'
+import { TalentryButton } from '@/components/ui'
+import styles from '@/app/interview/interview.module.css'
+import { createInterviewCompletionState } from '@/lib/interviews/interview-completion-state'
+import { createInterviewSessionState } from '@/lib/interviews/interview-session-state'
+import type { AcceptedQuestion, SessionAnswer, SessionOperation } from '@/lib/interviews/interview-session-state'
+
+import type { InterviewSetupInput, InterviewerId, InterviewLevel, InterviewType, InterviewPersona, InterviewLanguage } from '@/lib/interviews/interview-setup-input'
+
+const IV: Record<InterviewerId, { name: string; role: string; photo: string; voice: string }> = {
+  f: { name:'Sarah Chen', role:'Sr. HR Manager',
+    photo:'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face',
+    voice:'EXAVITQu4vr4xnSDxMaL' },
+  m: { name:'Marcus Reid', role:'Tech Lead',
+    photo:'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face',
+    voice:'pNInz6obpgDQGcFmaJgB' },
+}
+const P: Record<InterviewPersona,string> = {
+  friendly:'Samimi mülakatçısın.',
+  formal:'Profesyonel İK mülakatçısısın.',
+  tough:'Baskılı mülakatçısın.',
+  curious:'Analitik mülakatçısın.'
+}
+const L: Record<InterviewLevel,string> = {
+  junior:'junior (0-2 yıl)',
+  mid:'mid-level (2-5 yıl)',
+  senior:'senior (5+ yıl)'
+}
+const T: Record<InterviewType,string> = {
+  behavioral:'davranışsal/HR',
+  technical:'teknik',
+  mixed:'karma',
+  case:'vaka analizi'
+}
+type MobileInterviewPanel = 'interviewer' | 'interview' | 'feedback'
+
+type LiveInterviewCopy = {
+  backToInterviewer: string
+  cameraOff: string
+  cameraToggleOff: string
+  cameraToggleOn: string
+  completionFailure: string
+  endInterview: string
+  feedbackGuidance: string
+  feedbackPanel: string
+  feedbackReady: string
+  feedbackUnavailable: string
+  retryFeedback: string
+  retryQuestion: string
+  questionFailure: string
+  goToQuestions: string
+  interviewPanel: string
+  interviewerPanel: string
+  leaveWithoutSaving: string
+  microphoneToggleOff: string
+  microphoneToggleOn: string
+  mobilePager: string
+  returnToInterview: string
+  returnToQuestions: string
+  sessionLabel: string
+  speech: Record<SpeechStatus, string>
+  timerLabel: string
+  viewFeedback: string
+  workspace: InterviewWorkspaceLabels
+  you: string
+  zeroAnswerWarning: string
+}
+
+const LIVE_COPY: Record<InterviewLanguage, LiveInterviewCopy> = {
+  tr: {
+    backToInterviewer: 'Mülakatçıya Dön',
+    cameraOff: 'Kamera kapalı', cameraToggleOff: 'Kamerayı kapat', cameraToggleOn: 'Kamerayı aç',
+    completionFailure: 'Sonuç oluşturulamadı. Tekrar deneyebilir veya görüşmeden kaydetmeden çıkabilirsiniz.',
+    endInterview: 'Mülakatı Bitir',
+    feedbackGuidance: 'Sonraki soruya devam etmek için sola kaydır veya Sorulara Dön seçeneğini kullan.',
+    feedbackPanel: 'Değerlendirme', feedbackReady: 'Değerlendirmen hazır — görmek için sağa kaydır.',
+    feedbackUnavailable: 'Geri bildirim şu anda gösterilemiyor.',
+    retryFeedback: 'Geri bildirimi tekrar dene', retryQuestion: 'Soruyu tekrar dene', questionFailure: 'Soru oluşturulamadı. Lütfen tekrar deneyin.',
+    goToQuestions: 'Sorulara Geç', interviewPanel: 'Mülakat soruları', interviewerPanel: 'Mülakatçı',
+    leaveWithoutSaving: 'Kaydetmeden Çık',
+    microphoneToggleOff: 'Mikrofonu kapat', microphoneToggleOn: 'Mikrofonu aç', sessionLabel: 'Canlı mülakat',
+    mobilePager: 'Mülakat bölümleri',
+    returnToInterview: 'Mülakata Dön',
+    returnToQuestions: 'Sorulara Dön',
+    speech: { preparing: 'Ses hazırlanıyor', speaking: 'Mülakatçı konuşuyor', ready: 'Ses hazır', unavailable: 'Ses kullanılamıyor' },
+    timerLabel: 'Geçen süre', viewFeedback: 'Değerlendirmeyi Gör', you: 'Sen',
+    workspace: {
+      answer: 'Cevabını yaz', answerPlaceholder: 'Cevabını buraya yaz...', currentQuestion: 'Güncel soru',
+      feedback: 'Geri bildirim', finish: 'Mülakatı tamamla', improvement: 'Geliştirilebilir', loadingQuestion: 'Soru hazırlanıyor',
+      next: 'Sonraki soru', notes: 'Notlar', notesLabel: 'Notlarım', notesPlaceholder: 'Not al...', question: 'Soru',
+      skip: 'Atla', strength: 'Güçlü yön', submit: 'Cevabı gönder', suggestion: 'Öneri',
+    },
+    zeroAnswerWarning: 'Henüz bir cevap göndermediniz. Şimdi çıkarsanız bu görüşme için sonuç oluşturulmayacak ve görüşme kaydedilmeyecek.',
+  },
+  en: {
+    backToInterviewer: 'Back to Interviewer',
+    cameraOff: 'Camera off', cameraToggleOff: 'Turn camera off', cameraToggleOn: 'Turn camera on',
+    completionFailure: 'Result could not be created. You can try again or leave the interview without saving.',
+    endInterview: 'End Interview',
+    feedbackGuidance: 'Swipe left or use Back to Questions to continue with the next question.',
+    feedbackPanel: 'Feedback', feedbackReady: 'Your feedback is ready — swipe right to view it.',
+    feedbackUnavailable: 'Feedback is currently unavailable.',
+    retryFeedback: 'Retry feedback', retryQuestion: 'Retry question', questionFailure: 'Question could not be created. Please try again.',
+    goToQuestions: 'Go to Questions', interviewPanel: 'Interview questions', interviewerPanel: 'Interviewer',
+    leaveWithoutSaving: 'Leave Without Saving',
+    microphoneToggleOff: 'Mute microphone', microphoneToggleOn: 'Unmute microphone', sessionLabel: 'Live interview',
+    mobilePager: 'Interview panels',
+    returnToInterview: 'Return to Interview',
+    returnToQuestions: 'Back to Questions',
+    speech: { preparing: 'Preparing voice', speaking: 'Interviewer speaking', ready: 'Voice ready', unavailable: 'Voice unavailable' },
+    timerLabel: 'Elapsed time', viewFeedback: 'View Feedback', you: 'You',
+    workspace: {
+      answer: 'Write your answer', answerPlaceholder: 'Write your answer here...', currentQuestion: 'Current question',
+      feedback: 'Feedback', finish: 'Complete interview', improvement: 'Could improve', loadingQuestion: 'Preparing question',
+      next: 'Next question', notes: 'Notes', notesLabel: 'My notes', notesPlaceholder: 'Take notes...', question: 'Question',
+      skip: 'Skip', strength: 'Strength', submit: 'Submit answer', suggestion: 'Suggestion',
+    },
+    zeroAnswerWarning: 'You haven’t submitted an answer yet. If you leave now, no result will be created and this interview will not be saved.',
+  },
+  de: {
+    backToInterviewer: 'Zurück zum Interviewer',
+    cameraOff: 'Kamera aus', cameraToggleOff: 'Kamera ausschalten', cameraToggleOn: 'Kamera einschalten',
+    completionFailure: 'Das Ergebnis konnte nicht erstellt werden. Sie können es erneut versuchen oder das Interview ohne Speichern verlassen.',
+    endInterview: 'Interview beenden',
+    feedbackGuidance: 'Wische nach links oder nutze Zurück zu den Fragen, um mit der nächsten Frage fortzufahren.',
+    feedbackPanel: 'Feedback', feedbackReady: 'Dein Feedback ist bereit — wische nach rechts, um es anzusehen.',
+    feedbackUnavailable: 'Feedback ist derzeit nicht verfügbar.',
+    retryFeedback: 'Feedback erneut versuchen', retryQuestion: 'Frage erneut versuchen', questionFailure: 'Die Frage konnte nicht erstellt werden. Bitte versuchen Sie es erneut.',
+    goToQuestions: 'Zu den Fragen', interviewPanel: 'Interviewfragen', interviewerPanel: 'Interviewer',
+    leaveWithoutSaving: 'Ohne Speichern verlassen',
+    microphoneToggleOff: 'Mikrofon stummschalten', microphoneToggleOn: 'Mikrofon einschalten', sessionLabel: 'Live-Interview',
+    mobilePager: 'Interviewbereiche',
+    returnToInterview: 'Zum Interview zurück',
+    returnToQuestions: 'Zurück zu den Fragen',
+    speech: { preparing: 'Stimme wird vorbereitet', speaking: 'Interviewer spricht', ready: 'Stimme bereit', unavailable: 'Stimme nicht verfügbar' },
+    timerLabel: 'Verstrichene Zeit', viewFeedback: 'Feedback ansehen', you: 'Du',
+    workspace: {
+      answer: 'Antwort schreiben', answerPlaceholder: 'Schreibe deine Antwort hier...', currentQuestion: 'Aktuelle Frage',
+      feedback: 'Feedback', finish: 'Interview abschließen', improvement: 'Verbesserungsmöglichkeit', loadingQuestion: 'Frage wird vorbereitet',
+      next: 'Nächste Frage', notes: 'Notizen', notesLabel: 'Meine Notizen', notesPlaceholder: 'Notizen machen...', question: 'Frage',
+      skip: 'Überspringen', strength: 'Stärke', submit: 'Antwort senden', suggestion: 'Empfehlung',
+    },
+    zeroAnswerWarning: 'Sie haben noch keine Antwort gesendet. Wenn Sie jetzt gehen, wird kein Ergebnis erstellt und dieses Interview nicht gespeichert.',
+  },
+}
+
+type EvaluationResult = {
+  score: number
+  summary: string
+}
+
+function isEvaluationResult(value: unknown): value is EvaluationResult {
+  return (
+    typeof value === 'object' &&
+    value !== null &&
+    'score' in value &&
+    typeof value.score === 'number' &&
+    Number.isFinite(value.score) &&
+    Number.isInteger(value.score) &&
+    value.score >= 0 &&
+    value.score <= 100 &&
+    'summary' in value &&
+    typeof value.summary === 'string' &&
+    value.summary.trim().length > 0
+  )
+}
+
+function parseInterviewFeedback(value: string, fallbackText: string): InterviewFeedback {
+  const normalized = value.replace(/```json|```/gi, '').trim()
+
+  try {
+    const parsed: unknown = JSON.parse(normalized)
+    if (
+      typeof parsed === 'object' && parsed !== null &&
+      'strength' in parsed && typeof parsed.strength === 'string' && parsed.strength.trim() &&
+      'improvement' in parsed && typeof parsed.improvement === 'string' && parsed.improvement.trim() &&
+      'suggestion' in parsed && typeof parsed.suggestion === 'string' && parsed.suggestion.trim()
+    ) {
+      return {
+        kind: 'structured',
+        strength: parsed.strength.trim(),
+        improvement: parsed.improvement.trim(),
+        suggestion: parsed.suggestion.trim(),
+      }
+    }
+  } catch {}
+
+  return { kind: 'fallback', text: value.trim() || fallbackText }
+}
+
+export default function LiveInterviewClient({ config }: { config: InterviewSetupInput }) {
+  const router = useRouter()
+  const { interviewerKey: ivKey, role, company, level, interviewType: itype, persona, language } = config
+  const iv = IV[ivKey]
+  const copy = LIVE_COPY[language]
+  const languageInstruction =
+  language === 'en'
+    ? 'Respond only in English.'
+    : language === 'de'
+      ? 'Antworte ausschließlich auf Deutsch.'
+      : 'Yalnızca Türkçe yanıt ver.'
+  const mobilePagerRef = useRef<HTMLDivElement>(null)
+  const camRef = useRef<HTMLVideoElement>(null)
+  const answersRef = useRef<SessionAnswer[]>([])
+  const sessionRef = useRef(createInterviewSessionState())
+  const completionRef = useRef(createInterviewCompletionState())
+  const curQRef = useRef('')
+  const qNumRef = useRef(0)
+  const camStreamRef = useRef<MediaStream | null>(null)
+  const audioRef = useRef<HTMLAudioElement | null>(null)
+  const audioObjectUrlRef = useRef<string | null>(null)
+  const audioRequestRef = useRef(0)
+  const initialQuestionTriggeredRef = useRef(false)
+  const completionInFlightRef = useRef(false)
+  const [question, setQuestion] = useState('')
+  const [questionError, setQuestionError] = useState(false)
+  const [feedbackFailed, setFeedbackFailed] = useState(false)
+  const [qLoading, setQLoading] = useState(false)
+  const [answer, setAnswer] = useState('')
+  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null)
+  const [qNum, setQNum] = useState(0)
+  const [activeTab, setActiveTab] = useState<InterviewTab>('q')
+  const [mobilePanel, setMobilePanel] = useState<MobileInterviewPanel>('interviewer')
+  const [isMobileViewport, setIsMobileViewport] = useState(false)
+  const [notes, setNotes] = useState('')
+  const [micOn, setMicOn] = useState(true)
+  const [camOn, setCamOn] = useState(true)
+  const [secs, setSecs] = useState(0)
+  const [awaitingNext, setAwaitingNext] = useState(false)
+  const [speechStatus, setSpeechStatus] = useState<SpeechStatus>('ready')
+  const [completionError, setCompletionError] = useState('')
+  const [isCompleting, setIsCompleting] = useState(false)
+  const MAX_Q = 5
+  useEffect(() => {
+    const iv = setInterval(() => setSecs(s => s+1), 1000)
+    return () => clearInterval(iv)
+  }, [])
+
+  const fmt = (s: number) =>
+    `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`
+
+  useEffect(() => {
+    navigator.mediaDevices.getUserMedia({video:true,audio:false})
+      .then(stream => {
+        camStreamRef.current = stream
+        if (camRef.current) {
+          camRef.current.srcObject = stream
+          camRef.current.style.display = 'block'
+        }
+      }).catch(()=>{})
+    return () => { camStreamRef.current?.getTracks().forEach(t=>t.stop()) }
+  }, [])
+
+  useEffect(() => {
+    // Effect replay owns a fresh session; obsolete closures retain their disposed owner.
+    const session = createInterviewSessionState()
+    sessionRef.current = session
+    completionRef.current.reset()
+    initialQuestionTriggeredRef.current = false
+    return () => {
+      session.dispose()
+      completionRef.current.reset()
+      audioRequestRef.current += 1
+      stopCurrentAudio()
+    }
+  }, [])
+
+ async function claudeCall (system: string, message: string) {
+    const res = await fetch('/api/claude', {
+      method:'POST',
+      headers:{'Content-Type':'application/json'},
+      body: JSON.stringify({system, message})
+    })
+    if (!res.ok) throw new Error(`Interview provider failed: ${res.status}`)
+    const data: unknown = await res.json()
+    if (typeof data !== 'object' || data === null || !('text' in data) || typeof data.text !== 'string' || !data.text.trim()) {
+      throw new Error('Invalid interview provider text')
+    }
+    return data.text
+  }
+async function speakText(accepted: AcceptedQuestion) {
+  const session = sessionRef.current
+  if (!session.canSpeak(accepted)) return
+  const text = accepted.text
+  const requestId = audioRequestRef.current + 1
+  audioRequestRef.current = requestId
+  stopCurrentAudio()
+  setSpeechStatus('preparing')
+
+  try {
+    const res = await fetch('/api/elevenlabs', {
+      method: 'POST',
+      headers: { 'Content-Type': 'application/json' },
+      body: JSON.stringify({ text, voiceId: iv.voice })
+    })
+
+    if (!res.ok) {
+      if (requestId === audioRequestRef.current && session.canSpeak(accepted)) setSpeechStatus('unavailable')
+      return
+    }
+
+    const blob = await res.blob()
+    const url = URL.createObjectURL(blob)
+
+    if (requestId !== audioRequestRef.current || !session.canSpeak(accepted)) {
+      URL.revokeObjectURL(url)
+      return
+    }
+
+    const audio = new Audio(url)
+    audioRef.current = audio
+    audioObjectUrlRef.current = url
+    audio.addEventListener('ended', () => {
+      if (audioRef.current === audio) {
+        audioRef.current = null
+      }
+      if (audioObjectUrlRef.current === url) {
+        URL.revokeObjectURL(url)
+        audioObjectUrlRef.current = null
+      }
+      if (requestId === audioRequestRef.current && session.canSpeak(accepted)) setSpeechStatus('ready')
+    }, { once: true })
+    void audio.play()
+      .then(() => {
+        if (requestId === audioRequestRef.current && session.canSpeak(accepted) && audioRef.current === audio) {
+          setSpeechStatus('speaking')
+        }
+      })
+      .catch(() => {
+        if (audioRef.current === audio) {
+          audioRef.current = null
+        }
+        if (audioObjectUrlRef.current === url) {
+          URL.revokeObjectURL(url)
+          audioObjectUrlRef.current = null
+        }
+        if (requestId === audioRequestRef.current && session.canSpeak(accepted)) setSpeechStatus('unavailable')
+      })
+  } catch (e) {
+    if (requestId === audioRequestRef.current && session.canSpeak(accepted)) setSpeechStatus('unavailable')
+    console.warn('TTS error', e)
+  }
+}
+  function stopCurrentAudio() {
+    if (audioRef.current) {
+      audioRef.current.pause()
+      try {
+        audioRef.current.currentTime = 0
+      } catch {}
+      audioRef.current = null
+    }
+
+    if (audioObjectUrlRef.current) {
+      URL.revokeObjectURL(audioObjectUrlRef.current)
+      audioObjectUrlRef.current = null
+    }
+  }
+  const askQuestion = useCallback(async () => {
+    const session = sessionRef.current
+    const admission = session.beginGeneration()
+    if (!admission) return
+    const { token, ordinal: num } = admission
+    setQuestionError(false); setQLoading(true)
+    try {
+      audioRequestRef.current += 1
+      stopCurrentAudio()
+      setSpeechStatus('ready')
+      const previousQuestions = Array.from(new Set(
+        [...answersRef.current.map(item => item.q), curQRef.current]
+          .map(previousQuestion => previousQuestion.trim())
+          .filter(Boolean)
+      ))
+      const previousQuestionsInstruction = previousQuestions.length
+        ? `\nPreviously asked questions:\n${previousQuestions.map(previousQuestion => `- ${previousQuestion}`).join('\n')}\nDo not repeat these questions. Do not ask the same competency or topic again using near-duplicate wording. Ask a meaningfully different interview question appropriate to the same role, interview type, level, company, persona, and language.`
+        : ''
+const sys = `${P[persona]} Sen ${role} için ${T[itype]} mülakatı yapıyorsun. Aday: ${L[level]}. Şirket: ${company}. ${languageInstruction} SADECE soruyu yaz. Soru ${num}.${previousQuestionsInstruction}`
+      const q = await claudeCall(sys, `${num}. mülakat sorusu`)
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
+    } finally {
+      if (session.release(token)) setQLoading(false)
+    }
+  }, [])
+
+  const triggerInitialQuestion = useCallback(() => {
+    if (initialQuestionTriggeredRef.current) return
+    initialQuestionTriggeredRef.current = true
+    void askQuestion()
+  }, [askQuestion])
+
+  useEffect(() => {
+    const mobileQuery = window.matchMedia('(max-width: 640px)')
+    const triggerForViewport = () => {
+      const isMobile = mobileQuery.matches
+      setIsMobileViewport(isMobile)
+      if (!isMobile) triggerInitialQuestion()
+    }
+
+    triggerForViewport()
+    mobileQuery.addEventListener('change', triggerForViewport)
+    return () => mobileQuery.removeEventListener('change', triggerForViewport)
+  }, [triggerInitialQuestion])
+  async function submitAnswer() {
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
+    const sys = `${persona === 'tough' ? 'Eleştirel' : 'Yapıcı'} bir mülakat koçusun. ${languageInstruction} Adayın cevabını kısa, yapıcı ve profesyonel şekilde değerlendir. Sadece geçerli JSON döndür: {"strength":"...","improvement":"...","suggestion":"..."}. Her alan kısa, tek bir madde olmalı. Başka metin ekleme.`
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
+  }
+
+  async function nextQuestion() {
+    if (qNumRef.current >= MAX_Q) await endCall()
+    else await askQuestion()
+  }
+
+  async function endCall() {
+    if (completionInFlightRef.current) return
+    const session = sessionRef.current
+    const admission = session.beginCompletion(answersRef.current)
+    if (!admission) return
+    const { token, snapshot: answers } = admission
+    audioRequestRef.current += 1
+    stopCurrentAudio()
+    setSpeechStatus('ready')
+    completionInFlightRef.current = true
+    setIsCompleting(true)
+    setCompletionError('')
+
+    if (!answers.length) {
+      session.release(token)
+      setCompletionError(copy.zeroAnswerWarning)
+      completionInFlightRef.current = false
+      setIsCompleting(false)
+      return
+    }
+
+    try {
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
+      }
+      camStreamRef.current?.getTracks().forEach(t=>t.stop())
+      router.push(`/result/${encodeURIComponent(completion.savedId!)}`)
+    } catch (error) {
+      if (!session.isCurrent(token)) return
+      session.release(token)
+      console.error('Interview completion failed:', error)
+      setCompletionError(copy.completionFailure)
+      completionInFlightRef.current = false
+      setIsCompleting(false)
+    }
+  }
+
+  function leaveWithoutSaving() {
+    sessionRef.current.dispose()
+    completionRef.current.reset()
+    audioRequestRef.current += 1
+    stopCurrentAudio()
+    camStreamRef.current?.getTracks().forEach(track => track.stop())
+    router.push('/dashboard')
+  }
+
+  function toggleMic() {
+    setMicOn(v => {
+      camStreamRef.current?.getAudioTracks().forEach(t=>t.enabled=!v)
+      return !v
+    })
+  }
+
+  function toggleCam() {
+    setCamOn(v => {
+      camStreamRef.current?.getVideoTracks().forEach(t=>t.enabled=!v)
+      return !v
+    })
+
+  }
+  function showMobilePanel(panel: MobileInterviewPanel) {
+    if (panel === 'feedback' && !feedback) return
+    const pager = mobilePagerRef.current
+    setMobilePanel(panel)
+    if (panel === 'interview') triggerInitialQuestion()
+    const panelIndex = panel === 'interviewer' ? 0 : panel === 'interview' ? 1 : 2
+    pager?.scrollTo({ left: panelIndex * pager.clientWidth })
+  }
+
+  function syncMobilePanel() {
+    const pager = mobilePagerRef.current
+    if (!pager?.clientWidth) return
+    const panelIndex = Math.round(pager.scrollLeft / pager.clientWidth)
+    const panel: MobileInterviewPanel = panelIndex === 0 ? 'interviewer' : panelIndex === 1 ? 'interview' : 'feedback'
+    if (panel === 'feedback' && !feedback) {
+      showMobilePanel('interview')
+      return
+    }
+    setMobilePanel(panel)
+    if (panel === 'interview') triggerInitialQuestion()
+  }
+
+  const liveInterviewControls = (
+    <LiveInterviewControls
+      cameraLabel={camOn ? copy.cameraToggleOff : copy.cameraToggleOn}
+      cameraOn={camOn}
+      completionError={completionError}
+      endLabel={copy.endInterview}
+      isCompleting={isCompleting}
+      transitionBusy={qLoading}
+      leaveWithoutSavingLabel={copy.leaveWithoutSaving}
+      microphoneLabel={micOn ? copy.microphoneToggleOff : copy.microphoneToggleOn}
+      microphoneOn={micOn}
+      onDismissCompletionError={() => setCompletionError('')}
+      onEnd={endCall}
+      onLeaveWithoutSaving={leaveWithoutSaving}
+      onToggleCamera={toggleCam}
+      onToggleMicrophone={toggleMic}
+      returnToInterviewLabel={copy.returnToInterview}
+    />
+  )
+
+  return (
+    <main className={styles.page}>
+      <LiveInterviewHeader
+        elapsedTime={fmt(secs)}
+        maxQuestions={MAX_Q}
+        questionLabel={copy.workspace.question}
+        questionNumber={qNum}
+        sessionLabel={copy.sessionLabel}
+        timerLabel={copy.timerLabel}
+      />
+      <div className={styles.body} onScroll={syncMobilePanel} ref={mobilePagerRef}>
+        <div aria-label={copy.interviewerPanel} className={`${styles.mobilePanel} ${styles.mobileInterviewerPanel}`} id="mobile-interviewer-panel" role="group">
+          <InterviewerStage
+            cameraOffLabel={copy.cameraOff}
+            cameraOn={camOn}
+            cameraRef={camRef}
+            interviewerName={iv.name}
+            interviewerPhoto={iv.photo}
+            interviewerRole={iv.role}
+            speechLabel={copy.speech[speechStatus]}
+            speechStatus={speechStatus}
+            youLabel={copy.you}
+          />
+          <TalentryButton className={styles.mobilePanelAction} onClick={() => showMobilePanel('interview')} type="button">
+            {copy.goToQuestions}
+          </TalentryButton>
+        </div>
+        <div aria-label={copy.interviewPanel} className={`${styles.mobilePanel} ${styles.mobileInterviewPanel} ${awaitingNext ? styles.mobileInterviewPanelPostSubmit : ''}`} id="mobile-interview-panel" role="group">
+          <TalentryButton className={styles.mobilePanelBack} onClick={() => showMobilePanel('interviewer')} size="small" type="button" variant="ghost">
+            {copy.backToInterviewer}
+          </TalentryButton>
+          <InterviewWorkspace
+            activeTab={activeTab}
+            answer={answer}
+            awaitingNext={awaitingNext}
+            feedback={feedback}
+            feedbackRetryLabel={copy.retryFeedback}
+            feedbackFailureMessage={feedbackFailed ? copy.feedbackUnavailable : ''}
+            onRetryFeedback={retryFeedback}
+            questionRetryLabel={copy.retryQuestion}
+            questionFailureMessage={questionError ? copy.questionFailure : ''}
+            onRetryQuestion={askQuestion}
+            isCompleting={isCompleting}
+            labels={copy.workspace}
+            maxQuestions={MAX_Q}
+            mobileFeedbackReadyLabel={copy.feedbackReady}
+            mobileViewFeedbackLabel={copy.viewFeedback}
+            notes={notes}
+            onAnswerChange={setAnswer}
+            onNext={nextQuestion}
+            onNotesChange={setNotes}
+            onSubmit={submitAnswer}
+            onTabChange={setActiveTab}
+            onViewFeedback={() => showMobilePanel('feedback')}
+            qLoading={qLoading}
+            question={question}
+            questionNumber={qNum}
+            showFeedback={!isMobileViewport}
+          />
+          <div className={styles.mobileControls}>{liveInterviewControls}</div>
+        </div>
+        {isMobileViewport && (
+          <div aria-hidden={!feedback} aria-label={copy.feedbackPanel} className={`${styles.mobilePanel} ${styles.mobileFeedbackPanel} ${!feedback ? styles.mobileFeedbackPanelUnavailable : ''}`} id="mobile-feedback-panel" role="group">
+            {feedback && (
+              <>
+                <TalentryButton className={styles.mobilePanelBack} onClick={() => showMobilePanel('interview')} size="small" type="button" variant="ghost">
+                  {copy.returnToQuestions}
+                </TalentryButton>
+                <InterviewFeedbackCard feedback={feedback} labels={copy.workspace} />
+                <p className={styles.mobileFeedbackGuidance}>{copy.feedbackGuidance}</p>
+              </>
+            )}
+          </div>
+        )}
+      </div>
+      <nav aria-label={copy.mobilePager} className={styles.mobilePagination}>
+        <button aria-controls="mobile-interviewer-panel" aria-current={mobilePanel === 'interviewer' ? 'step' : undefined} aria-label={copy.interviewerPanel} className={`${styles.mobilePagerDot} ${mobilePanel === 'interviewer' ? styles.mobilePagerDotActive : ''}`} onClick={() => showMobilePanel('interviewer')} type="button" />
+        <button aria-controls="mobile-interview-panel" aria-current={mobilePanel === 'interview' ? 'step' : undefined} aria-label={copy.interviewPanel} className={`${styles.mobilePagerDot} ${mobilePanel === 'interview' ? styles.mobilePagerDotActive : ''}`} onClick={() => showMobilePanel('interview')} type="button" />
+        <button aria-controls="mobile-feedback-panel" aria-current={mobilePanel === 'feedback' ? 'step' : undefined} aria-disabled={!feedback} aria-label={copy.feedbackPanel} className={`${styles.mobilePagerDot} ${mobilePanel === 'feedback' ? styles.mobilePagerDotActive : ''}`} disabled={!feedback} onClick={() => showMobilePanel('feedback')} type="button" />
+      </nav>
+      <div className={styles.desktopControls}>{liveInterviewControls}</div>
+    </main>
+  )
+}

diff --git a/docs/01_Engineering/Sprint_ROUTE_INPUT_HARDENING_01_Summary.md b/docs/01_Engineering/Sprint_ROUTE_INPUT_HARDENING_01_Summary.md
new file mode 100644
--- /dev/null
+++ b/docs/01_Engineering/Sprint_ROUTE_INPUT_HARDENING_01_Summary.md
@@ -0,0 +1,105 @@
+# Sprint ROUTE_INPUT_HARDENING_01 Summary
+
+- Title: Fail-closed Live route and shared input contract.
+- Date recorded: 2026-10-07 (Europe/Istanbul).
+- **IMPLEMENTATION + AUTOMATED VALIDATION + LOCAL BROWSER ACCEPTANCE: PASS**.
+- Current stage: **UNCOMMITTED / pending final Git closure**; final documentation/pre-commit review required. No commit/push approval or future hash asserted.
+- Branch: feature/auth-foundation. Safe committed base and local origin ref: 1ce03bae7a002b4b68e274e2dfbfb872300e9d3b (fix(interviews): make completion persistence idempotent).
+- **COMPLETION_IDEMPOTENCY_01: complete / committed / pushed**; closure supplied by user and committed HEAD verified locally; no remote fetch.
+- Next roadmap stage AFTER Git closure: **SECURITY_PRIVACY_01 — planned / NOT STARTED / NOT IMPLEMENTED / NOT YET AUTHORIZED**. No automatic next-stage authority.
+- Goal: prevent unauthenticated/invalid Live entry and enforce canonical new write inputs while preserving the valid flow and historical reads.
+- Approval status: implementation scope approved; user-supervised local browser acceptance PASS; final documentation/pre-commit review pending. No Git mutation authorized.
+
+## Created files
+
+- `lib/interviews/interview-setup-input.ts`
+- `components/interview/LiveInterviewClient.tsx`
+- `lib/interviews/interview-setup-input.test.cjs`
+- `lib/interviews/interview-route-input.test.cjs`
+- `components/interview/InterviewSetupForm.test.cjs`
+- `docs/01_Engineering/Sprint_ROUTE_INPUT_HARDENING_01_Summary.md`
+- `docs/01_Engineering/Sprint_ROUTE_INPUT_HARDENING_01_Engineering_Report.md`
+
+## Modified files
+
+- `app/interview/page.tsx`
+- `components/interview/InterviewSetupForm.tsx`
+- `components/interview/interview-setup-config.ts`
+- `app/api/interviews/route.ts`
+- `lib/interviews/interview-session-state.test.cjs`
+- `lib/interviews/persist-owned-interview.test.cjs`
+- `docs/04_Project_Memory/CURRENT_STATE.md`
+- `docs/04_Project_Memory/STAGE_LOG.md`
+- `docs/04_Project_Memory/DEFERRED_FIXES.md`
+- `docs/04_Project_Memory/DECISIONS_AND_RISKS.md`
+
+## Completed route/input decision
+
+Server /interview order: existing trusted getAuthenticatedUser -> signed-out /login redirect -> parse decoded searchParams -> invalid/missing config /interview/setup redirect -> typed LiveInterviewClient. No middleware or auth redesign. Valid authenticated Setup and direct valid Live URLs remain usable without login detours.
+
+The framework-independent, dependency-free interview-setup-input helper owns runtime sets and derived types: interviewer f/m; level junior/mid/senior; type behavioral/technical/mixed/case; persona friendly/formal/tough/curious; interview language tr/en/de. Membership uses exact array comparison, never truthy object lookup: unknown, wrong-case, constructor and __proto__ values are rejected.
+
+Consumed query keys: iv, role, company, level, itype, persona, language. iv/level/itype/persona/language are required exactly once. role/company are optional at most once. Array representations of any consumed key are rejected, including same-value duplicates. cv and arbitrary unused extras remain ignored. Next-decoded values are validated without manual URL decoding.
+
+Role/company remain optional. Raw decoded length is checked before trim: <=200 Unicode code points using Array.from, with C0 U+0000-U+001F and C1/DEL U+007F-U+009F rejected. Surrounding whitespace is trimmed; missing/empty/whitespace-only values become Genel. Ordinary Unicode, accents and emoji remain unchanged after trim. Setup uses the same helper and localized TR/EN/DE accessible validation feedback.
+
+Live logic is extracted into components/interview/LiveInterviewClient.tsx with an InterviewSetupInput config prop, no URLSearchParams parsing and no required-config defaults. A deterministic key derived from all validated config fields prevents different configurations mixing old session state. Existing effects, provider/prompt/TTS, transition, completion and render behavior remain semantically preserved; typed mappings replace the former any interviewer lookup.
+
+POST /api/interviews validates interviewerKey, level, interviewType, persona and language membership plus role/company canonical text. Incoming POST text must already be trimmed, nonempty, bounded and control-free; no server defaulting/normalization changes replay payload content. Invalid payload returns existing 400 Invalid interview payload before persistence. Existing answers/score/summary/duration/identity validation is preserved.
+
+COMPLETION_IDEMPOTENCY_01 architecture is unchanged: auth first; server-derived owner; UUID v4 completionId; insert-first; 201 first insert; 200 matching replay; generic 409 conflict; no overwrite; owner-scoped replay; private/no-store. Reliability and response-loss retry regressions passed.
+
+## Recorded automated validation — not rerun in this documentation turn
+
+| Suite / command | Result |
+|---|---|
+| node --test lib/interviews/interview-setup-input.test.cjs | 134/134 PASS, exit 0 |
+| node --test lib/interviews/interview-route-input.test.cjs | 46/46 PASS, exit 0 |
+| node --test components/interview/InterviewSetupForm.test.cjs | 41/41 PASS, exit 0 |
+| node --test lib/interviews/interview-session-state.test.cjs | 55/55 PASS, exit 0 |
+| node --test lib/interviews/persist-owned-interview.test.cjs | 71/71 PASS, exit 0 |
+| node --test lib/interviews/interview-completion-state.test.cjs | 14/14 PASS, exit 0 |
+| Result ownership, deletion, pagination, History loading and PDF regressions | 96/96 PASS, exit 0 |
+| Total deterministic tests | **457/457 PASS**; no skipped tests |
+| npx.cmd tsc --noEmit --incremental false | PASS, exit 0 |
+| Implementation git diff --check and new-file whitespace check | PASS, exit 0 |
+| npm.cmd run build | PASS, exit 0; **22/22** generated pages |
+
+Regression command: node --test lib/interviews/read-owned-interview.test.cjs lib/interviews/delete-owned-interview.test.cjs lib/interviews/history-cursor.test.cjs lib/interviews/history-pagination.test.cjs components/interviews/useFullInterviewHistory.test.cjs components/result/useInterviewDeletion.test.cjs lib/reports/interview-report.test.cjs. PDF inspector used invocation-local REPORT_PDF_PYTHON pointing to the existing bundled Python; no persistent configuration or installation.
+
+Initial Setup tests exposed test-harness traversal errors and a missing desktop form error-description association. Both were corrected; final Setup run passed. Existing reliability/idempotency assertions were preserved. Build preceded only removal of inherited trailing whitespace in the extracted client; no semantic change followed validation.
+
+Before build, sandbox process inspection returned Access denied. Authorized read-only retry succeeded: **0 repository Next dev/start processes**. No process was terminated; dev server was not restarted. Two webpack dependency-cache snapshot warnings, npm update notice and informational LF-to-CRLF notices were recorded. No product regression was established by those warnings.
+
+## User-supervised local browser acceptance — USER-VERIFIED PASS
+
+Evidence source: the user's acceptance report supplied for this documentation turn. These checks were not executed or rerun by the agent.
+
+| Check | User-observed behavior | Result |
+|---|---|---|
+| A. Clean/incognito signed-out /interview | Redirected to /login; Live did not open | PASS |
+| B. Authenticated /interview, no params | Redirected to /interview/setup; no unnecessary login | PASS |
+| C. iv=unknown, otherwise valid query | Redirected to Setup; Live did not open | PASS |
+| D. level=garbage, otherwise valid query | Redirected to Setup | PASS |
+| E. level=junior&level=senior | Redirected to Setup | PASS |
+| F. Authenticated normal Setup -> Live | No login redirect; valid query; Live loaded; Q1 generated; TTS worked | PASS |
+| G. Ctrl+R on valid authenticated Live URL | No login/Setup redirect; Live reloaded; Q1 generated; TTS worked | PASS |
+| H. Browser Back from valid Live | Returned to Setup | PASS |
+
+Invalid/missing config never renders/mounts LiveInterviewClient. Deterministic harnesses prove zero Claude question requests, ElevenLabs TTS requests, Live camera acquisition and persistence POST. **This exact zero-activity condition was not manually measured in browser Network.** Real Q1/TTS behavior was user-verified only for valid Setup/refresh flows.
+
+Authenticated testing remains Setup -> valid submit -> Live, without forced re-login. A fully valid bookmarked Live URL remains directly usable while authenticated (deterministic route proof). No dev-only auth bypass exists.
+
+No answer/completion flow was executed during this stage's browser acceptance; no Result or persisted interview was created, no persistence was intentionally triggered, and History count was not changed by this acceptance, per user evidence. History was not queried/recounted by the agent. No new History record or current count is asserted. **HISTORY_PAGINATION_01: NATURAL-RECORD DEFERRED ACCEPTANCE** remains; no synthetic seeding.
+
+## Accepted remaining boundaries / untouched foundations
+
+Result/detail/delete/PDF IDs: **ALREADY HARDENED / OUT OF IMPLEMENTATION SCOPE**. Authentication precedes UUID validation/ownership work; malformed signed-in UUID -> 400; foreign/nonexistent -> same 404; reads/deletes are owner-scoped; PDF uses the protected reader. No source changes there. New write validation is not applied to historical reads; older unsupported persisted values remain readable, without migration/backfill. Existing historical unsupported-language PDF limitations are unchanged.
+
+Direct provider endpoint auth/rate limiting, prompt injection/privacy/private-content logging, and provider resource/cost abuse controls remain SECURITY_PRIVACY_01. Page gating is not provider-endpoint security. Live UI/interview-language coupling remains LOCALIZATION_V1_01; session resume remains SESSION_RESUME_01; Media/device truthfulness and later provider/media work remain MEDIA_PROVIDER_V1_01. These are deferred boundaries, not regressions introduced here.
+
+No migration, package/dependency/configuration/CSS changes; no History/Result/PDF/Profile/Auth implementation changes; no scoring redesign or answer/summary resource policy. No secrets or environment-variable values recorded. No Supabase mutation, browser rerun, tests/build rerun, staging, commit or push in this documentation turn.
+
+## Documentation validation
+
+Documentation-only git diff --check: PASS, exit 0; final scope/content/full-diff review completed. Exactly 17 approved files (11 implementation/test plus 6 documentation). Stop for final pre-commit review; do not begin SECURITY_PRIVACY_01 automatically.

diff --git a/lib/interviews/interview-route-input.test.cjs b/lib/interviews/interview-route-input.test.cjs
new file mode 100644
--- /dev/null
+++ b/lib/interviews/interview-route-input.test.cjs
@@ -0,0 +1,92 @@
+const { test } = require('node:test')
+const assert = require('node:assert/strict')
+const fs = require('node:fs')
+const path = require('node:path')
+const vm = require('node:vm')
+const ts = require('typescript')
+const { load, plain } = require('./history-test-helpers.cjs')
+const input = load('lib/interviews/interview-setup-input.ts', {})
+const valid = () => ({ iv: 'f', level: 'mid', itype: 'behavioral', persona: 'formal', language: 'en' })
+
+function pageHarness(authenticated = true, file = 'app/interview/page.tsx') {
+  const events = [], rendered = [], activities = { claude: 0, tts: 0, camera: 0, persistence: 0 }
+  function Live(props) {
+    // A mount-capable boundary: executing it would start all four kinds of activity.
+    for (const key of Object.keys(activities)) activities[key]++
+    return props
+  }
+  const imports = {
+    'react/jsx-runtime': { jsx(type, props, key) { rendered.push({ type, props, key }); return { type, props, key } } },
+    'next/navigation': { redirect(route) { events.push(['redirect', route]); throw Object.assign(Error('redirect'), { route }) } },
+    '@/components/interview/LiveInterviewClient': { default: Live },
+    '@/components/interview/InterviewSetupForm': { default: 'SetupForm' },
+    '@/styles/talentry-interview-setup.css': {},
+    '@/lib/auth/auth-constants': { AUTH_ROUTES: { login: '/login' } },
+    '@/lib/auth/get-authenticated-user': { async getAuthenticatedUser() { events.push(['auth']); return { status: authenticated ? 'authenticated' : 'unauthorized' } } },
+    '@/lib/interviews/interview-setup-input': { ...input, parseInterviewSetupInput(params) { events.push(['parse']); return input.parseInterviewSetupInput(params) } },
+  }
+  const source = fs.readFileSync(path.join(__dirname, '../..', file), 'utf8')
+  const compiled = ts.transpileModule(source, { compilerOptions: {
+    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX,
+  } }).outputText
+  const scope = { exports: {}, require(name) { assert.ok(Object.hasOwn(imports, name), name); return imports[name] } }
+  vm.runInNewContext(compiled, scope)
+  return { events, rendered, activities, async run(params) {
+    try { return { tree: await scope.exports.default({ searchParams: params }) } }
+    catch (error) { if (error.route) return { redirect: error.route }; throw error }
+  } }
+}
+async function rejected(params, authenticated = true) {
+  const h = pageHarness(authenticated), result = await h.run(params)
+  assert.equal(result.redirect, authenticated ? '/interview/setup' : '/login')
+  assert.equal(h.rendered.length, 0, 'Live boundary must not even be rendered')
+  assert.deepEqual(h.activities, { claude: 0, tts: 0, camera: 0, persistence: 0 })
+  assert.equal(h.events[0][0], 'auth')
+  return h
+}
+test('signed-out direct route redirects before parsing or Live rendering', async () => {
+  assert.deepEqual((await rejected({}, false)).events, [['auth'], ['redirect', '/login']])
+})
+test('signed-out fully valid query still cannot mount Live', async () => { await rejected(valid(), false) })
+test('signed-in no params redirects to Setup', async () => { await rejected({}) })
+test('signed-in partial required config redirects to Setup', async () => { await rejected({ iv: 'f' }) })
+for (const key of ['iv', 'level', 'itype', 'persona', 'language']) {
+  for (const value of ['garbage', '', undefined, 'constructor', '__proto__']) {
+    test(`malformed ${key} ${String(value)} has zero activity`, async () => { await rejected({ ...valid(), [key]: value }) })
+  }
+}
+for (const key of ['iv', 'role', 'company', 'level', 'itype', 'persona', 'language']) {
+  test(`duplicate ${key} cannot mount Live`, async () => { await rejected({ ...valid(), [key]: ['same', 'same'] }) })
+}
+for (const key of ['role', 'company']) {
+  for (const value of ['😀'.repeat(201), 'A\nB', 'A\u0080B']) {
+    test(`invalid text ${key} cannot mount Live`, async () => { await rejected({ ...valid(), [key]: value }) })
+  }
+}
+test('authenticated fully valid bookmark renders Live once with normalized config, never login', async () => {
+  const h = pageHarness(), result = await h.run({ ...valid(), role: ' Çağrı 😀 ', company: ' Example ' })
+  assert.equal(result.redirect, undefined)
+  assert.equal(h.rendered.length, 1)
+  assert.deepEqual(h.events, [['auth'], ['parse']])
+  assert.deepEqual(plain(result.tree.props.config), { interviewerKey: 'f', role: 'Çağrı 😀', company: 'Example',
+    level: 'mid', interviewType: 'behavioral', persona: 'formal', language: 'en' })
+  assert.equal(result.tree.key, input.interviewSetupKey(result.tree.props.config))
+  result.tree.type(result.tree.props)
+  assert.deepEqual(h.activities, { claude: 1, tts: 1, camera: 1, persistence: 1 }, 'mock mount is activity capable')
+})
+test('empty optional text and ignored extras remain valid', async () => {
+  const h = pageHarness(), { tree } = await h.run({ ...valid(), role: '', company: '  ', cv: ['x', 'y'], extra: 'ignored' })
+  assert.equal(tree.props.config.role, 'Genel'); assert.equal(tree.props.config.company, 'Genel')
+  assert.equal(h.rendered.length, 1)
+})
+test('wrapper key changes for new config and is stable for equivalent normalized query', async () => {
+  const h = pageHarness()
+  const a = (await h.run(valid())).tree, b = (await h.run({ ...valid(), role: 'Engineer' })).tree
+  const c = (await h.run({ ...valid(), role: ' Engineer ', extra: 'ignored' })).tree
+  assert.notEqual(a.key, b.key); assert.equal(b.key, c.key)
+})
+test('authenticated Setup server page remains directly usable', async () => {
+  const h = pageHarness(true, 'app/interview/setup/page.tsx'), { tree } = await h.run({})
+  assert.equal(tree.type, 'SetupForm'); assert.deepEqual(h.events, [['auth']])
+  assert.equal(h.rendered.length, 1)
+})

diff --git a/lib/interviews/interview-setup-input.test.cjs b/lib/interviews/interview-setup-input.test.cjs
new file mode 100644
--- /dev/null
+++ b/lib/interviews/interview-setup-input.test.cjs
@@ -0,0 +1,65 @@
+const { test } = require('node:test')
+const assert = require('node:assert/strict')
+const { load, plain } = require('./history-test-helpers.cjs')
+const input = load('lib/interviews/interview-setup-input.ts', {})
+const valid = () => ({ iv: 'f', level: 'mid', itype: 'behavioral', persona: 'formal', language: 'tr' })
+const parse = overrides => input.parseInterviewSetupInput({ ...valid(), ...overrides })
+
+test('valid config normalizes absent optional text', () => assert.deepEqual(plain(parse()), {
+  interviewerKey: 'f', role: 'Genel', company: 'Genel', level: 'mid',
+  interviewType: 'behavioral', persona: 'formal', language: 'tr',
+}))
+for (const [key, values] of Object.entries({ iv: ['f', 'm'], level: ['junior', 'mid', 'senior'],
+  itype: ['behavioral', 'technical', 'mixed', 'case'], persona: ['friendly', 'formal', 'tough', 'curious'],
+  language: ['tr', 'en', 'de'] })) {
+  for (const value of values) test(`${key} accepts ${value}`, () => assert.ok(parse({ [key]: value })))
+  for (const value of [undefined, '', 'garbage', 'constructor', '__proto__', values[0].toUpperCase()]) {
+    test(`${key} rejects ${String(value)}`, () => assert.equal(parse({ [key]: value }), null))
+  }
+}
+for (const key of ['role', 'company']) {
+  for (const value of [undefined, '', '   ', '\u2003']) test(`${key} optional blank ${JSON.stringify(value)}`, () => {
+    assert.equal(parse({ [key]: value })[key], 'Genel')
+  })
+  for (const value of ['a'.repeat(200), '😀'.repeat(200)]) test(`${key} accepts 200 code points ${value[0]}`, () => {
+    assert.equal(parse({ [key]: value })[key], value)
+  })
+  for (const value of ['a'.repeat(201), '😀'.repeat(201), ' '.repeat(201), ' ' + 'a'.repeat(200)]) {
+    test(`${key} rejects raw decoded length before trim`, () => assert.equal(parse({ [key]: value }), null))
+  }
+  test(`${key} preserves Unicode and trims only surrounding whitespace`, () => {
+    const value = 'Çağrı Mühendislik Développeur 日本語 😀 e\u0301'
+    assert.equal(parse({ [key]: ` ${value} ` })[key], value)
+  })
+  for (const code of [0, 9, 10, 13, 31, 127, 128, 159]) test(`${key} rejects control U+${code.toString(16)}`, () => {
+    assert.equal(parse({ [key]: `A${String.fromCharCode(code)}B` }), null)
+  })
+  for (const value of ['Team Lead', 'A+B', '%ZZ', '\uFFFD', '<b>ordinary text</b>']) {
+    test(`${key} validates delivered decoded text ${value}`, () => assert.equal(parse({ [key]: value })[key], value))
+  }
+}
+for (const key of ['iv', 'role', 'company', 'level', 'itype', 'persona', 'language']) {
+  for (const values of [['mid', 'senior'], ['mid', 'mid'], ['mid'], []]) {
+    test(`${key} array representation rejected ${JSON.stringify(values)}`, () => assert.equal(parse({ [key]: values }), null))
+  }
+}
+test('cv and arbitrary extra params including duplicates are ignored', () => {
+  assert.deepEqual(plain(parse({ cv: ['private text', 'other'], extra: ['x', 'y'] })), plain(parse()))
+})
+test('canonical POST text accepts Unicode without rewriting', () => {
+  for (const value of ['Genel', 'Çağrı 😀', '😀'.repeat(200)]) assert.equal(input.isCanonicalSetupText(value), true)
+})
+test('canonical POST text rejects noncanonical or invalid input', () => {
+  for (const value of [null, undefined, 1, '', ' ', ' padded', 'padded ', '\nA', '\u0080', '😀'.repeat(201)]) {
+    assert.equal(input.isCanonicalSetupText(value), false)
+  }
+})
+test('lifecycle key is stable for equivalent configs and ignored query extras', () => {
+  assert.equal(input.interviewSetupKey(parse()), input.interviewSetupKey(parse({ role: ' ', cv: 'ignored' })))
+})
+for (const [key, value] of Object.entries({ iv: 'm', role: 'Engineer', company: 'Example', level: 'senior',
+  itype: 'technical', persona: 'tough', language: 'de' })) {
+  test(`changed ${key} starts distinct lifecycle key`, () => {
+    assert.notEqual(input.interviewSetupKey(parse()), input.interviewSetupKey(parse({ [key]: value })))
+  })
+}

diff --git a/lib/interviews/interview-setup-input.ts b/lib/interviews/interview-setup-input.ts
new file mode 100644
--- /dev/null
+++ b/lib/interviews/interview-setup-input.ts
@@ -0,0 +1,67 @@
+export const INTERVIEWER_KEYS = ['f', 'm'] as const
+export const INTERVIEW_LEVELS = ['junior', 'mid', 'senior'] as const
+export const INTERVIEW_TYPES = ['behavioral', 'technical', 'mixed', 'case'] as const
+export const INTERVIEW_PERSONAS = ['friendly', 'formal', 'tough', 'curious'] as const
+export const INTERVIEW_LANGUAGES = ['tr', 'en', 'de'] as const
+
+export type InterviewerId = typeof INTERVIEWER_KEYS[number]
+export type InterviewLevel = typeof INTERVIEW_LEVELS[number]
+export type InterviewType = typeof INTERVIEW_TYPES[number]
+export type InterviewPersona = typeof INTERVIEW_PERSONAS[number]
+export type InterviewLanguage = typeof INTERVIEW_LANGUAGES[number]
+export type InterviewSetupInput = Readonly<{
+  interviewerKey: InterviewerId
+  role: string
+  company: string
+  level: InterviewLevel
+  interviewType: InterviewType
+  persona: InterviewPersona
+  language: InterviewLanguage
+}>
+export type InterviewSearchParams = Record<string, string | string[] | undefined>
+
+export const SETUP_TEXT_MAX_CODE_POINTS = 200
+const CONTROLS = /[\u0000-\u001f\u007f-\u009f]/
+const CONSUMED_KEYS = ['iv', 'role', 'company', 'level', 'itype', 'persona', 'language'] as const
+
+function isMember<T extends string>(values: readonly T[], value: unknown): value is T {
+  return typeof value === 'string' && values.some(member => member === value)
+}
+export const isInterviewerId = (value: unknown): value is InterviewerId => isMember(INTERVIEWER_KEYS, value)
+export const isInterviewLevel = (value: unknown): value is InterviewLevel => isMember(INTERVIEW_LEVELS, value)
+export const isInterviewType = (value: unknown): value is InterviewType => isMember(INTERVIEW_TYPES, value)
+export const isInterviewPersona = (value: unknown): value is InterviewPersona => isMember(INTERVIEW_PERSONAS, value)
+export const isInterviewLanguage = (value: unknown): value is InterviewLanguage => isMember(INTERVIEW_LANGUAGES, value)
+
+function isBoundedText(value: unknown): value is string {
+  return typeof value === 'string' && !CONTROLS.test(value) &&
+    Array.from(value).length <= SETUP_TEXT_MAX_CODE_POINTS
+}
+
+/** Validate decoded text before trimming; optional blanks retain the general interview. */
+export function normalizeSetupText(value: string | undefined): string | null {
+  if (value === undefined) return 'Genel'
+  return isBoundedText(value) ? value.trim() || 'Genel' : null
+}
+
+/** POST never rewrites content: replay equality uses the caller's canonical payload. */
+export function isCanonicalSetupText(value: unknown): value is string {
+  return isBoundedText(value) && value !== '' && value === value.trim()
+}
+
+export function parseInterviewSetupInput(params: InterviewSearchParams): InterviewSetupInput | null {
+  if (CONSUMED_KEYS.some(key => Array.isArray(params[key]))) return null
+  const { iv, level, itype, persona, language } = params
+  if (!isInterviewerId(iv) || !isInterviewLevel(level) || !isInterviewType(itype) ||
+      !isInterviewPersona(persona) || !isInterviewLanguage(language)) return null
+  const role = normalizeSetupText(params.role as string | undefined)
+  const company = normalizeSetupText(params.company as string | undefined)
+  if (role === null || company === null) return null
+  return { interviewerKey: iv, role, company, level, interviewType: itype, persona, language }
+}
+
+/** Fixed field order makes the lifecycle key independent of query ordering and ignored extras. */
+export function interviewSetupKey(config: InterviewSetupInput): string {
+  return JSON.stringify([config.interviewerKey, config.role, config.company, config.level,
+    config.interviewType, config.persona, config.language])
+}

````
