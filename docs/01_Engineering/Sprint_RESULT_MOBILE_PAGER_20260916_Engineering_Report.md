# Sprint RESULT_MOBILE_PAGER_20260916 Engineering Report

## 1. Identity and scope

Date: 2026-09-16. Result mobile three-panel swipe/pager follow-up. Status: implementation complete, awaiting approval. Limit the interaction change to <=640px. Preserve desktop/tablet visual structure, current Result data source and behavior, and all pre-existing work. No new source files or dependencies.

## 2. Repository before implementation

Branch feature/auth-foundation; HEAD ef18af9 feat(interview): complete Talentry live interview. The working tree intentionally started dirty: app/interview/interview.module.css, app/result/[id]/page.tsx, app/result/result.module.css, untracked components/result directory and the two prior Result migration reports. The user expressly authorized continuing from this state. tsconfig.tsbuildinfo was absent.

## 3. Architecture and decisions

ResultContent owns activePanel (initial 0), viewport detection and touch coordinates. The three panel wrappers contain a single rendering of existing persisted content: score/summary; metadata; transcript and unchanged href=/ restart Link. No duplicate data state or fetching. Panel switches cannot alter route fetch dependencies. Wrappers use display:contents above 640px, preserving original grid placement and gaps. Pager is display:none above that breakpoint. The existing metadata tablet breakpoint is unchanged.

At <=640px the ready-only Result shell is fixed to the available viewport with 100dvh and inset:0, without viewport-width tricks or shared body styles. The brand/completion heading remains visible above the panels. A horizontal grid track uses three 100%-wide columns and index-based translateX positions, clipped by a viewport wrapper. No new animation is used, including for reduced-motion users. Exactly three dot buttons remain below the viewport. Inactive panels are visibility:hidden and aria-hidden on mobile; they become visible and accessible on desktop.

Touch start/end navigation requires one touch, a minimum 60px horizontal displacement and horizontal distance >1.5 times vertical distance. Cancellation clears pending gestures. Left advances; right returns; indices clamp to 0..2 without wrapping. Vertical panning and pinch zoom are permitted. Dot taps use the same local navigation function. Media-query changes update mobile accessibility and clear pending gestures.

## 4. Vertical scrolling and accessibility

The active panel is the only vertical content scroll region. Each panel retains its own scroll position while mounted. Summary, metadata and all transcript entries remain present, with existing newline/long-string wrapping. Pager/header do not sit inside the content scroller. Long transcripts can reach the restart Link at their end. No internal transcript/card scrollers were added.

Pager buttons have localized TR/EN/DE labels, aria-controls, aria-current=step for the active item, 44px targets and visible inset focus outlines. The active marker uses both accent color and an elongated shape. Active mobile panel regions are keyboard-focusable; inactive panels are hidden from focus by visibility:hidden. If a swipe would hide the focused content, focus moves to the new panel after the state update. Dot activation retains focus on its button. Existing language preference and persisted content remain unchanged.

## 5. Changed files and interfaces

- app/result/[id]/page.tsx: one prop, mobileReview={loadState.status === 'ready'}. No fetching, validation, retry, authentication or other state changes in this follow-up.
- components/result/ResultShell.tsx: optional mobileReview:boolean (default false) adds the ready-only mobile shell class.
- components/result/ResultContent.tsx: local active-panel state, viewport synchronization, touch handlers, panel wrappers and pager. Existing interview/copy/uiLanguage props preserved.
- components/result/result-copy.ts: ResultCopy adds pager:string and panels:readonly [string,string,string]; all three locales supplied. Existing interviewai_uilang preference and labels unchanged.
- app/result/result.module.css: display-contents wrappers for desktop, hidden default pager, <=640px track/panel/viewport layout, dot styling and focus rules. Existing palette/tokens retained; no shared CSS changed.
- New Sprint_RESULT_MOBILE_PAGER_20260916_Summary.md and this Engineering Report. Prior reports remain immutable.

ResultAnswers.tsx is unchanged. No source-file creation, API or utility extraction was needed. ResultContent slightly exceeds the suggested 150-line file target because the user constrained this follow-up to existing presentation files; no business/data logic was added.

## 6. Validation and exact outcomes

- npx.cmd tsc --noEmit: exit 0, no TypeScript diagnostics. npm emitted only its 11.16.0 -> 12.0.2 update notice; no installation/update performed.
- Generated tsconfig.tsbuildinfo removed with Remove-Item -LiteralPath.
- git diff --check: exit 0, no whitespace errors. LF-to-CRLF warnings for the existing modified Interview CSS and both modified Result files.
- git --no-pager diff -- app/result components/result: exit 0, inspected. Git does not include untracked components in this diff; their complete follow-up diffs are included below using the previous report as the baseline.
- git status --short: exit 0; no staged changes. Existing modifications retained.
- Production build and browser/runtime tests were not run, as requested. 390x844 overflow, gesture reliability, long-content scrolling and desktop/tablet visual behavior still need runtime confirmation. The user's report that the preceding desktop version passed is context, not a new test performed here.

## 7. Git status, untouched modules and deferred work

Working tree retains modified app/interview/interview.module.css (pre-existing, not edited), app/result/[id]/page.tsx and app/result/result.module.css; components/result remains untracked, alongside two prior and two new sprint reports. No Git mutation or Project Memory update. Interview desktop guard, Setup, Dashboard, APIs, auth, schema, persistence, scoring, shared Talentry CSS and old reports remain untouched. No analytics, AI content, charts, tiers, gamification, PDF or new navigation destinations.

## 8. Risks and approval

Browser runtime and real-device validation remain deferred; static checks cannot prove all viewport/zoom/touch behavior. Existing upstream scoring trust boundary remains unchanged. Above 640px, wrappers are display:contents and pager is hidden; viewport-changing accessibility behavior uses matchMedia. No animated transition is introduced. Stop and wait for approval; do not build, commit or start another stage automatically.

## 9. Complete follow-up source diffs

These full-file replacement diffs compare the current files to the preceding migration report's contents (not HEAD), so they isolate this follow-up even though the prior implementation was uncommitted. The route baseline is its current content minus the sole new mobileReview prop. Report files are new documentation; this report does not recursively embed its own diff.
```diff
diff --git a/app/result/[id]/page.tsx b/app/result/[id]/page.tsx
--- a/app/result/[id]/page.tsx
+++ b/app/result/[id]/page.tsx
@@ -1,177 +1,178 @@
-'use client'
-
-import ResultContent from '@/components/result/ResultContent'
-import ResultShell, { ResultStatus } from '@/components/result/ResultShell'
-import { RESULT_COPY, RESULT_UI_LANGUAGE_KEY } from '@/components/result/result-copy'
-import type { AppLanguage } from '@/types/auth'
-import { useRouter } from 'next/navigation'
-import { useEffect, useState } from 'react'
-
-import { AUTH_ROUTES, DEFAULT_APP_LANGUAGE, SUPPORTED_APP_LANGUAGES } from '@/lib/auth/auth-constants'
-
-export type InterviewAnswer = {
-  q: string
-  a: string
-}
-
-export type InterviewDetail = {
-  id: string
-  interviewerKey: string
-  role: string
-  company: string
-  level: string
-  interviewType: string
-  persona: string
-  language: string
-  answers: InterviewAnswer[]
-  score: number
-  summary: string
-  durationSeconds: number
-  createdAt: string
-}
-
-type ResultLoadState =
-  | { status: 'loading' }
-  | { status: 'ready'; interview: InterviewDetail }
-  | { status: 'unavailable' }
-  | { status: 'loadError' }
-
-type ResultPageProps = {
-  params: {
-    id: string
-  }
-}
-
-function isRecord(value: unknown): value is Record<string, unknown> {
-  return typeof value === 'object' && value !== null
-}
-
-function isInterviewAnswer(value: unknown): value is InterviewAnswer {
-  return (
-    isRecord(value) &&
-    typeof value.q === 'string' &&
-    typeof value.a === 'string'
-  )
-}
-
-function isInterviewDetail(value: unknown): value is InterviewDetail {
-  return (
-    isRecord(value) &&
-    typeof value.id === 'string' &&
-    typeof value.interviewerKey === 'string' &&
-    typeof value.role === 'string' &&
-    typeof value.company === 'string' &&
-    typeof value.level === 'string' &&
-    typeof value.interviewType === 'string' &&
-    typeof value.persona === 'string' &&
-    typeof value.language === 'string' &&
-    Array.isArray(value.answers) &&
-    value.answers.every(isInterviewAnswer) &&
-    typeof value.score === 'number' &&
-    Number.isFinite(value.score) &&
-    typeof value.summary === 'string' &&
-    typeof value.durationSeconds === 'number' &&
-    Number.isFinite(value.durationSeconds) &&
-    typeof value.createdAt === 'string'
-  )
-}
-
-function getInterview(value: unknown): InterviewDetail | null {
-  if (!isRecord(value) || !isInterviewDetail(value.interview)) {
-    return null
-  }
-
-  return value.interview
-}
-
-export default function ResultDetailPage({ params }: ResultPageProps) {
-  const router = useRouter()
-  const [loadState, setLoadState] = useState<ResultLoadState>({ status: 'loading' })
-  const [retryAttempt, setRetryAttempt] = useState(0)
-  const [uiLanguage, setUiLanguage] = useState<AppLanguage>(DEFAULT_APP_LANGUAGE)
-  const copy = RESULT_COPY[uiLanguage]
-
-  useEffect(() => {
-    try {
-      const saved = window.localStorage.getItem(RESULT_UI_LANGUAGE_KEY)
-      const language = SUPPORTED_APP_LANGUAGES.find(value => value === saved)
-      if (language) setUiLanguage(language)
-    } catch {
-      // Keep the established default when browser storage is unavailable.
-    }
-  }, [])
-
-  useEffect(() => {
-    const controller = new AbortController()
-    const updateLoadState = (state: ResultLoadState) => {
-      if (!controller.signal.aborted) {
-        setLoadState(state)
-      }
-    }
-
-    async function loadResult() {
-      updateLoadState({ status: 'loading' })
-
-      try {
-        const response = await fetch(
-          `/api/interviews/${encodeURIComponent(params.id)}`,
-          {
-            cache: 'no-store',
-            signal: controller.signal,
-          },
-        )
-
-        if (response.status === 401) {
-          if (!controller.signal.aborted) {
-            router.replace(AUTH_ROUTES.login)
-          }
-          return
-        }
-
-        if (response.status === 400 || response.status === 404) {
-          updateLoadState({ status: 'unavailable' })
-          return
-        }
-
-        if (!response.ok) {
-          updateLoadState({ status: 'loadError' })
-          return
-        }
-
-        const payload: unknown = await response.json()
-        const interview = getInterview(payload)
-
-        if (!interview) {
-          updateLoadState({ status: 'loadError' })
-          return
-        }
-
-        updateLoadState({ status: 'ready', interview })
-      } catch (error) {
-        if (error instanceof Error && error.name === 'AbortError') {
-          return
-        }
-
-        updateLoadState({ status: 'loadError' })
-      }
-    }
-
-    void loadResult()
-
-    return () => controller.abort()
-  }, [params.id, retryAttempt, router])
-
-  return (
-    <ResultShell
-      copy={copy}
-      uiLanguage={uiLanguage}
-      title={loadState.status === 'ready' ? copy.completed : copy.review}
-    >
-      {loadState.status === 'ready' ? (
-        <ResultContent interview={loadState.interview} copy={copy} uiLanguage={uiLanguage} />
-      ) : (
-        <ResultStatus status={loadState.status} copy={copy} onRetry={() => setRetryAttempt(attempt => attempt + 1)} />
-      )}
-    </ResultShell>
-  )
-}
+'use client'
+
+import ResultContent from '@/components/result/ResultContent'
+import ResultShell, { ResultStatus } from '@/components/result/ResultShell'
+import { RESULT_COPY, RESULT_UI_LANGUAGE_KEY } from '@/components/result/result-copy'
+import type { AppLanguage } from '@/types/auth'
+import { useRouter } from 'next/navigation'
+import { useEffect, useState } from 'react'
+
+import { AUTH_ROUTES, DEFAULT_APP_LANGUAGE, SUPPORTED_APP_LANGUAGES } from '@/lib/auth/auth-constants'
+
+export type InterviewAnswer = {
+  q: string
+  a: string
+}
+
+export type InterviewDetail = {
+  id: string
+  interviewerKey: string
+  role: string
+  company: string
+  level: string
+  interviewType: string
+  persona: string
+  language: string
+  answers: InterviewAnswer[]
+  score: number
+  summary: string
+  durationSeconds: number
+  createdAt: string
+}
+
+type ResultLoadState =
+  | { status: 'loading' }
+  | { status: 'ready'; interview: InterviewDetail }
+  | { status: 'unavailable' }
+  | { status: 'loadError' }
+
+type ResultPageProps = {
+  params: {
+    id: string
+  }
+}
+
+function isRecord(value: unknown): value is Record<string, unknown> {
+  return typeof value === 'object' && value !== null
+}
+
+function isInterviewAnswer(value: unknown): value is InterviewAnswer {
+  return (
+    isRecord(value) &&
+    typeof value.q === 'string' &&
+    typeof value.a === 'string'
+  )
+}
+
+function isInterviewDetail(value: unknown): value is InterviewDetail {
+  return (
+    isRecord(value) &&
+    typeof value.id === 'string' &&
+    typeof value.interviewerKey === 'string' &&
+    typeof value.role === 'string' &&
+    typeof value.company === 'string' &&
+    typeof value.level === 'string' &&
+    typeof value.interviewType === 'string' &&
+    typeof value.persona === 'string' &&
+    typeof value.language === 'string' &&
+    Array.isArray(value.answers) &&
+    value.answers.every(isInterviewAnswer) &&
+    typeof value.score === 'number' &&
+    Number.isFinite(value.score) &&
+    typeof value.summary === 'string' &&
+    typeof value.durationSeconds === 'number' &&
+    Number.isFinite(value.durationSeconds) &&
+    typeof value.createdAt === 'string'
+  )
+}
+
+function getInterview(value: unknown): InterviewDetail | null {
+  if (!isRecord(value) || !isInterviewDetail(value.interview)) {
+    return null
+  }
+
+  return value.interview
+}
+
+export default function ResultDetailPage({ params }: ResultPageProps) {
+  const router = useRouter()
+  const [loadState, setLoadState] = useState<ResultLoadState>({ status: 'loading' })
+  const [retryAttempt, setRetryAttempt] = useState(0)
+  const [uiLanguage, setUiLanguage] = useState<AppLanguage>(DEFAULT_APP_LANGUAGE)
+  const copy = RESULT_COPY[uiLanguage]
+
+  useEffect(() => {
+    try {
+      const saved = window.localStorage.getItem(RESULT_UI_LANGUAGE_KEY)
+      const language = SUPPORTED_APP_LANGUAGES.find(value => value === saved)
+      if (language) setUiLanguage(language)
+    } catch {
+      // Keep the established default when browser storage is unavailable.
+    }
+  }, [])
+
+  useEffect(() => {
+    const controller = new AbortController()
+    const updateLoadState = (state: ResultLoadState) => {
+      if (!controller.signal.aborted) {
+        setLoadState(state)
+      }
+    }
+
+    async function loadResult() {
+      updateLoadState({ status: 'loading' })
+
+      try {
+        const response = await fetch(
+          `/api/interviews/${encodeURIComponent(params.id)}`,
+          {
+            cache: 'no-store',
+            signal: controller.signal,
+          },
+        )
+
+        if (response.status === 401) {
+          if (!controller.signal.aborted) {
+            router.replace(AUTH_ROUTES.login)
+          }
+          return
+        }
+
+        if (response.status === 400 || response.status === 404) {
+          updateLoadState({ status: 'unavailable' })
+          return
+        }
+
+        if (!response.ok) {
+          updateLoadState({ status: 'loadError' })
+          return
+        }
+
+        const payload: unknown = await response.json()
+        const interview = getInterview(payload)
+
+        if (!interview) {
+          updateLoadState({ status: 'loadError' })
+          return
+        }
+
+        updateLoadState({ status: 'ready', interview })
+      } catch (error) {
+        if (error instanceof Error && error.name === 'AbortError') {
+          return
+        }
+
+        updateLoadState({ status: 'loadError' })
+      }
+    }
+
+    void loadResult()
+
+    return () => controller.abort()
+  }, [params.id, retryAttempt, router])
+
+  return (
+    <ResultShell
+      mobileReview={loadState.status === 'ready'}
+      copy={copy}
+      uiLanguage={uiLanguage}
+      title={loadState.status === 'ready' ? copy.completed : copy.review}
+    >
+      {loadState.status === 'ready' ? (
+        <ResultContent interview={loadState.interview} copy={copy} uiLanguage={uiLanguage} />
+      ) : (
+        <ResultStatus status={loadState.status} copy={copy} onRetry={() => setRetryAttempt(attempt => attempt + 1)} />
+      )}
+    </ResultShell>
+  )
+}
```

```diff
diff --git a/app/result/result.module.css b/app/result/result.module.css
--- a/app/result/result.module.css
+++ b/app/result/result.module.css
@@ -1,208 +1,334 @@
-.page,
-.page * {
-  box-sizing: border-box;
-}
-
-.page {
-  min-height: 100vh;
-  min-height: 100dvh;
-  padding: var(--talentry-space-6);
-  background: var(--talentry-color-canvas);
-  color: var(--talentry-color-text);
-  font-family: var(--talentry-font-family);
-  line-height: var(--talentry-line-height-normal);
-  overflow-wrap: anywhere;
-}
-
-.container {
-  width: 100%;
-  max-width: calc(var(--talentry-space-16) * 18);
-  margin-inline: auto;
-}
-
-.brand {
-  display: flex;
-  align-items: center;
-  gap: var(--talentry-space-2);
-  min-height: var(--talentry-button-height-lg);
-  color: var(--talentry-color-navy);
-  font-size: var(--talentry-font-size-lg);
-  font-weight: var(--talentry-font-weight-bold);
-}
-
-.brandMark {
-  display: grid;
-  place-items: center;
-  width: var(--talentry-space-8);
-  height: var(--talentry-space-8);
-  border-radius: var(--talentry-radius-md);
-  background: linear-gradient(135deg, var(--talentry-color-primary), var(--talentry-color-indigo));
-  color: var(--talentry-color-text-on-primary);
-  font-size: var(--talentry-font-size-sm);
-}
-
-.heading {
-  margin-block: var(--talentry-space-8);
-}
-
-.heading h1 {
-  color: var(--talentry-color-navy);
-  font-size: var(--talentry-font-page-title-size);
-}
-
-.content,
-.transcript,
-.answers {
-  display: grid;
-  gap: var(--talentry-space-6);
-  min-width: 0;
-}
-
-.content {
-  padding-bottom: var(--talentry-space-12);
-}
-
-.overview {
-  display: grid;
-  grid-template-columns: minmax(0, 0.65fr) minmax(0, 1.35fr);
-  align-items: start;
-  gap: var(--talentry-space-6);
-}
-
-.content section,
-.content article,
-.content li,
-.content :global(.talentry-card__body) {
-  min-width: 0;
-}
-
-.scoreCard {
-  text-align: center;
-}
-
-.label,
-.cardTitle {
-  margin: 0 0 var(--talentry-space-4);
-  color: var(--talentry-color-navy);
-  font-size: var(--talentry-font-card-title-size);
-  font-weight: var(--talentry-font-weight-semibold);
-}
-
-.score {
-  margin: var(--talentry-space-4) 0;
-  color: var(--talentry-color-primary-pressed);
-  font-variant-numeric: tabular-nums;
-  line-height: var(--talentry-line-height-tight);
-}
-
-.score strong {
-  color: var(--talentry-color-navy);
-  font-size: calc(var(--talentry-font-size-4xl) * 2);
-  font-weight: var(--talentry-font-weight-extrabold);
-}
-
-.score span {
-  font-size: var(--talentry-font-size-xl);
-  white-space: nowrap;
-}
-
-.text {
-  max-width: 70ch;
-  margin: 0;
-  font-size: var(--talentry-font-body-size);
-  line-height: var(--talentry-line-height-relaxed);
-  white-space: pre-wrap;
-  overflow-wrap: anywhere;
-}
-
-.metadata {
-  display: grid;
-  grid-template-columns: repeat(4, minmax(0, 1fr));
-  gap: var(--talentry-space-5);
-  margin: var(--talentry-space-6) 0 0;
-}
-
-.metadata dt,
-.answerLabel {
-  margin: 0 0 var(--talentry-space-2);
-  color: var(--talentry-color-text-secondary);
-  font-size: var(--talentry-font-label-size);
-  font-weight: var(--talentry-font-weight-semibold);
-}
-
-.metadata dd {
-  margin: 0;
-  white-space: pre-wrap;
-}
-
-.answers {
-  padding: 0;
-  margin: 0;
-  list-style: none;
-}
-
-.questionLabel {
-  margin: 0 0 var(--talentry-space-3);
-  color: var(--talentry-color-primary-pressed);
-  font-size: var(--talentry-font-card-title-size);
-}
-
-.answer {
-  margin-top: var(--talentry-space-5);
-  padding: var(--talentry-space-4);
-  border-left: var(--talentry-space-1) solid var(--talentry-color-primary);
-  border-radius: var(--talentry-radius-sm);
-  background: var(--talentry-color-surface-lavender);
-}
-
-.actions {
-  display: flex;
-  flex-wrap: wrap;
-  gap: var(--talentry-space-3);
-}
-
-.action {
-  max-width: 100%;
-  white-space: normal;
-  text-align: center;
-  padding-block: var(--talentry-space-3);
-}
-
-.status {
-  width: 100%;
-  max-width: calc(var(--talentry-space-16) * 11);
-}
-
-.status :global(.talentry-empty-state__description) {
-  margin-top: var(--talentry-space-3);
-}
-
-@media (max-width: 64rem) {
-  .metadata {
-    grid-template-columns: repeat(2, minmax(0, 1fr));
-  }
-}
-
-@media (max-width: 40rem) {
-  .page {
-    padding: var(--talentry-space-4);
-  }
-
-  .overview,
-  .metadata {
-    grid-template-columns: minmax(0, 1fr);
-  }
-
-  .heading h1 {
-    font-size: var(--talentry-font-size-3xl);
-  }
-
-  .actions,
-  .action {
-    width: 100%;
-  }
-
-  .actions {
-    flex-direction: column;
-  }
-}
+.page,
+.page * {
+  box-sizing: border-box;
+}
+
+.page {
+  min-height: 100vh;
+  min-height: 100dvh;
+  padding: var(--talentry-space-6);
+  background: var(--talentry-color-canvas);
+  color: var(--talentry-color-text);
+  font-family: var(--talentry-font-family);
+  line-height: var(--talentry-line-height-normal);
+  overflow-wrap: anywhere;
+}
+
+.container {
+  width: 100%;
+  max-width: calc(var(--talentry-space-16) * 18);
+  margin-inline: auto;
+}
+
+.brand {
+  display: flex;
+  align-items: center;
+  gap: var(--talentry-space-2);
+  min-height: var(--talentry-button-height-lg);
+  color: var(--talentry-color-navy);
+  font-size: var(--talentry-font-size-lg);
+  font-weight: var(--talentry-font-weight-bold);
+}
+
+.brandMark {
+  display: grid;
+  place-items: center;
+  width: var(--talentry-space-8);
+  height: var(--talentry-space-8);
+  border-radius: var(--talentry-radius-md);
+  background: linear-gradient(135deg, var(--talentry-color-primary), var(--talentry-color-indigo));
+  color: var(--talentry-color-text-on-primary);
+  font-size: var(--talentry-font-size-sm);
+}
+
+.heading {
+  margin-block: var(--talentry-space-8);
+}
+
+.heading h1 {
+  color: var(--talentry-color-navy);
+  font-size: var(--talentry-font-page-title-size);
+}
+
+.content,
+.transcript,
+.answers {
+  display: grid;
+  gap: var(--talentry-space-6);
+  min-width: 0;
+}
+
+.content {
+  padding-bottom: var(--talentry-space-12);
+}
+
+.overview {
+  display: grid;
+  grid-template-columns: minmax(0, 0.65fr) minmax(0, 1.35fr);
+  align-items: start;
+  gap: var(--talentry-space-6);
+}
+
+.content section,
+.content article,
+.content li,
+.content :global(.talentry-card__body) {
+  min-width: 0;
+}
+
+.scoreCard {
+  text-align: center;
+}
+
+.label,
+.cardTitle {
+  margin: 0 0 var(--talentry-space-4);
+  color: var(--talentry-color-navy);
+  font-size: var(--talentry-font-card-title-size);
+  font-weight: var(--talentry-font-weight-semibold);
+}
+
+.score {
+  margin: var(--talentry-space-4) 0;
+  color: var(--talentry-color-primary-pressed);
+  font-variant-numeric: tabular-nums;
+  line-height: var(--talentry-line-height-tight);
+}
+
+.score strong {
+  color: var(--talentry-color-navy);
+  font-size: calc(var(--talentry-font-size-4xl) * 2);
+  font-weight: var(--talentry-font-weight-extrabold);
+}
+
+.score span {
+  font-size: var(--talentry-font-size-xl);
+  white-space: nowrap;
+}
+
+.text {
+  max-width: 70ch;
+  margin: 0;
+  font-size: var(--talentry-font-body-size);
+  line-height: var(--talentry-line-height-relaxed);
+  white-space: pre-wrap;
+  overflow-wrap: anywhere;
+}
+
+.metadata {
+  display: grid;
+  grid-template-columns: repeat(4, minmax(0, 1fr));
+  gap: var(--talentry-space-5);
+  margin: var(--talentry-space-6) 0 0;
+}
+
+.metadata dt,
+.answerLabel {
+  margin: 0 0 var(--talentry-space-2);
+  color: var(--talentry-color-text-secondary);
+  font-size: var(--talentry-font-label-size);
+  font-weight: var(--talentry-font-weight-semibold);
+}
+
+.metadata dd {
+  margin: 0;
+  white-space: pre-wrap;
+}
+
+.answers {
+  padding: 0;
+  margin: 0;
+  list-style: none;
+}
+
+.questionLabel {
+  margin: 0 0 var(--talentry-space-3);
+  color: var(--talentry-color-primary-pressed);
+  font-size: var(--talentry-font-card-title-size);
+}
+
+.answer {
+  margin-top: var(--talentry-space-5);
+  padding: var(--talentry-space-4);
+  border-left: var(--talentry-space-1) solid var(--talentry-color-primary);
+  border-radius: var(--talentry-radius-sm);
+  background: var(--talentry-color-surface-lavender);
+}
+
+.actions {
+  display: flex;
+  flex-wrap: wrap;
+  gap: var(--talentry-space-3);
+}
+
+.action {
+  max-width: 100%;
+  white-space: normal;
+  text-align: center;
+  padding-block: var(--talentry-space-3);
+}
+
+.status {
+  width: 100%;
+  max-width: calc(var(--talentry-space-16) * 11);
+}
+
+.status :global(.talentry-empty-state__description) {
+  margin-top: var(--talentry-space-3);
+}
+
+@media (max-width: 64rem) {
+  .metadata {
+    grid-template-columns: repeat(2, minmax(0, 1fr));
+  }
+}
+
+.panelViewport,
+.panelTrack,
+.panel {
+  display: contents;
+}
+
+.pager {
+  display: none;
+}
+
+@media (max-width: 640px) {
+  .page {
+    padding: var(--talentry-space-4);
+  }
+
+  .overview,
+  .metadata {
+    grid-template-columns: minmax(0, 1fr);
+  }
+
+  .heading h1 {
+    font-size: var(--talentry-font-size-3xl);
+  }
+
+  .actions,
+  .action {
+    width: 100%;
+  }
+
+  .actions {
+    flex-direction: column;
+  }
+
+  .mobileReview {
+    position: fixed;
+    inset: 0;
+    min-height: 0;
+    height: 100dvh;
+    overflow: hidden;
+    padding-bottom: max(var(--talentry-space-2), env(safe-area-inset-bottom));
+  }
+
+  .mobileReview .container {
+    display: flex;
+    flex-direction: column;
+    height: 100%;
+    min-height: 0;
+  }
+
+  .mobileReview .brand,
+  .mobileReview .heading {
+    flex: none;
+  }
+
+  .mobileReview .heading {
+    margin-block: var(--talentry-space-3) var(--talentry-space-5);
+  }
+
+  .mobileReview .content {
+    display: flex;
+    flex-direction: column;
+    flex: 1;
+    min-height: 0;
+    gap: var(--talentry-space-2);
+    padding-bottom: 0;
+  }
+
+  .panelViewport {
+    display: block;
+    flex: 1;
+    min-width: 0;
+    min-height: 0;
+    overflow: hidden;
+    touch-action: pan-y pinch-zoom;
+  }
+
+  .panelTrack {
+    display: grid;
+    grid-auto-flow: column;
+    grid-auto-columns: 100%;
+    height: 100%;
+    min-height: 0;
+  }
+
+  .panelTrack[data-panel='1'] {
+    transform: translateX(-100%);
+  }
+
+  .panelTrack[data-panel='2'] {
+    transform: translateX(-200%);
+  }
+
+  .panel {
+    display: block;
+    min-width: 0;
+    min-height: 0;
+    overflow-x: hidden;
+    overflow-y: auto;
+    overscroll-behavior-y: contain;
+    padding: var(--talentry-space-1);
+    scroll-padding-block: var(--talentry-space-2);
+  }
+
+  .panel[data-active='false'] {
+    visibility: hidden;
+  }
+
+  .panel > .actions {
+    margin-top: var(--talentry-space-6);
+  }
+
+  .pager {
+    display: flex;
+    flex: none;
+    align-items: center;
+    justify-content: center;
+    gap: var(--talentry-space-1);
+  }
+
+  .pagerButton {
+    display: grid;
+    place-items: center;
+    width: var(--talentry-button-height-md);
+    height: var(--talentry-button-height-md);
+    padding: 0;
+    border: 0;
+    border-radius: var(--talentry-radius-pill);
+    background: transparent;
+    cursor: pointer;
+  }
+
+  .pagerButton span {
+    width: var(--talentry-space-2);
+    height: var(--talentry-space-2);
+    border-radius: var(--talentry-radius-pill);
+    background: var(--talentry-color-text-secondary);
+  }
+
+  .pagerButton[aria-current='step'] span {
+    width: var(--talentry-space-6);
+    background: var(--talentry-color-primary);
+  }
+
+  .pagerButton:focus-visible,
+  .panel:focus-visible {
+    outline: 2px solid var(--talentry-color-border-focus);
+    outline-offset: -2px;
+  }
+}
```

```diff
diff --git a/components/result/ResultContent.tsx b/components/result/ResultContent.tsx
--- a/components/result/ResultContent.tsx
+++ b/components/result/ResultContent.tsx
@@ -1,75 +1,157 @@
-import Link from 'next/link'
-import { SectionHeader, TalentryCard } from '@/components/ui'
-import type { InterviewDetail } from '@/app/result/[id]/page'
-import type { AppLanguage } from '@/types/auth'
-import ResultAnswers from './ResultAnswers'
-import { displayValue, INTERVIEW_LANGUAGE_NAMES } from './result-copy'
-import type { ResultCopy } from './result-copy'
-import styles from '@/app/result/result.module.css'
-
-interface ResultContentProps {
-  interview: InterviewDetail
-  copy: ResultCopy
-  uiLanguage: AppLanguage
-}
-
-function formatDuration(durationSeconds: number) {
-  const totalSeconds = Math.max(0, Math.floor(durationSeconds))
-  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, '0')}`
-}
-
-function formatCreatedAt(createdAt: string, language: AppLanguage) {
-  const date = new Date(createdAt)
-  return Number.isNaN(date.getTime()) ? createdAt : new Intl.DateTimeFormat(language, {
-    dateStyle: 'medium', timeStyle: 'short',
-  }).format(date)
-}
-
-export default function ResultContent({ interview, copy, uiLanguage }: ResultContentProps) {
-  const metadata = [
-    [copy.role, interview.role],
-    [copy.company, interview.company],
-    [copy.level, displayValue(copy.levels, interview.level)],
-    [copy.interviewType, displayValue(copy.interviewTypes, interview.interviewType)],
-    [copy.language, displayValue(INTERVIEW_LANGUAGE_NAMES, interview.language)],
-    [copy.persona, displayValue(copy.personas, interview.persona)],
-    [copy.duration, formatDuration(interview.durationSeconds)],
-    [copy.date, formatCreatedAt(interview.createdAt, uiLanguage)],
-  ]
-
-  return (
-    <>
-      <div className={styles.overview}>
-        <TalentryCard className={styles.scoreCard} surface="lavender" aria-labelledby="result-score">
-          <h2 className={styles.label} id="result-score">{copy.score}</h2>
-          <p className={styles.score}>
-            <strong>{interview.score}</strong><span> / 100</span>
-          </p>
-        </TalentryCard>
-        <TalentryCard aria-labelledby="result-summary">
-          <h2 className={styles.cardTitle} id="result-summary">{copy.summary}</h2>
-          <p className={styles.text} dir="auto">
-            {interview.summary.trim() ? interview.summary : copy.emptySummary}
-          </p>
-        </TalentryCard>
-      </div>
-      <TalentryCard aria-labelledby="result-details">
-        <SectionHeader title={<span id="result-details">{copy.details}</span>} />
-        <dl className={styles.metadata}>
-          {metadata.map(([label, value]) => (
-            <div key={label}>
-              <dt>{label}</dt>
-              <dd dir="auto">{value.trim() ? value : copy.notProvided}</dd>
-            </div>
-          ))}
-        </dl>
-      </TalentryCard>
-      <ResultAnswers answers={interview.answers} copy={copy} />
-      <div className={styles.actions}>
-        <Link className={`talentry-button talentry-button--primary talentry-button--large ${styles.action}`} href="/">
-          {copy.startAgain}
-        </Link>
-      </div>
-    </>
-  )
-}
+import Link from 'next/link'
+import { useEffect, useRef, useState } from 'react'
+import type { TouchEvent } from 'react'
+import { SectionHeader, TalentryCard } from '@/components/ui'
+import type { InterviewDetail } from '@/app/result/[id]/page'
+import type { AppLanguage } from '@/types/auth'
+import ResultAnswers from './ResultAnswers'
+import { displayValue, INTERVIEW_LANGUAGE_NAMES } from './result-copy'
+import type { ResultCopy } from './result-copy'
+import styles from '@/app/result/result.module.css'
+
+interface ResultContentProps {
+  interview: InterviewDetail
+  copy: ResultCopy
+  uiLanguage: AppLanguage
+}
+
+function formatDuration(durationSeconds: number) {
+  const totalSeconds = Math.max(0, Math.floor(durationSeconds))
+  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, '0')}`
+}
+
+function formatCreatedAt(createdAt: string, language: AppLanguage) {
+  const date = new Date(createdAt)
+  return Number.isNaN(date.getTime()) ? createdAt : new Intl.DateTimeFormat(language, {
+    dateStyle: 'medium', timeStyle: 'short',
+  }).format(date)
+}
+
+export default function ResultContent({ interview, copy, uiLanguage }: ResultContentProps) {
+  const [activePanel, setActivePanel] = useState(0)
+  const [isMobile, setIsMobile] = useState(false)
+  const touchStart = useRef<{ x: number; y: number } | null>(null)
+  const panelRefs = useRef<Array<HTMLDivElement | null>>([])
+  const focusNextPanel = useRef(false)
+
+  useEffect(() => {
+    const query = window.matchMedia('(max-width: 640px)')
+    const syncViewport = () => { setIsMobile(query.matches); touchStart.current = null }
+    syncViewport()
+    query.addEventListener('change', syncViewport)
+    return () => query.removeEventListener('change', syncViewport)
+  }, [])
+
+  useEffect(() => {
+    if (focusNextPanel.current) {
+      panelRefs.current[activePanel]?.focus({ preventScroll: true })
+      focusNextPanel.current = false
+    }
+  }, [activePanel])
+
+  function navigatePanel(index: number) {
+    const next = Math.max(0, Math.min(2, index))
+    const current = panelRefs.current[activePanel]
+    if (next !== activePanel && current?.contains(document.activeElement)) {
+      focusNextPanel.current = true
+    }
+    setActivePanel(next)
+  }
+
+  function startSwipe(event: TouchEvent<HTMLDivElement>) {
+    const touch = event.touches[0]
+    touchStart.current = isMobile && event.touches.length === 1
+      ? { x: touch.clientX, y: touch.clientY } : null
+  }
+
+  function endSwipe(event: TouchEvent<HTMLDivElement>) {
+    const start = touchStart.current
+    touchStart.current = null
+    if (!isMobile || !start || event.touches.length > 0) return
+    const touch = event.changedTouches[0]
+    const dx = touch.clientX - start.x
+    const dy = touch.clientY - start.y
+    if (Math.abs(dx) >= 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
+      navigatePanel(activePanel + (dx < 0 ? 1 : -1))
+    }
+  }
+
+  function panelProps(index: number) {
+    return {
+      id: `result-panel-${index}`,
+      className: styles.panel,
+      'aria-label': copy.panels[index],
+      'aria-hidden': isMobile && activePanel !== index ? true : undefined,
+      'data-active': activePanel === index,
+      role: isMobile ? 'region' : undefined,
+      tabIndex: isMobile ? 0 : undefined,
+      ref: (node: HTMLDivElement | null) => { panelRefs.current[index] = node },
+    }
+  }
+  const metadata = [
+    [copy.role, interview.role],
+    [copy.company, interview.company],
+    [copy.level, displayValue(copy.levels, interview.level)],
+    [copy.interviewType, displayValue(copy.interviewTypes, interview.interviewType)],
+    [copy.language, displayValue(INTERVIEW_LANGUAGE_NAMES, interview.language)],
+    [copy.persona, displayValue(copy.personas, interview.persona)],
+    [copy.duration, formatDuration(interview.durationSeconds)],
+    [copy.date, formatCreatedAt(interview.createdAt, uiLanguage)],
+  ]
+
+  return (
+    <>
+      <div className={styles.panelViewport} onTouchStart={startSwipe} onTouchEnd={endSwipe}
+        onTouchCancel={() => { touchStart.current = null }}>
+        <div className={styles.panelTrack} data-panel={activePanel}>
+        <div {...panelProps(0)}>
+      <div className={styles.overview}>
+        <TalentryCard className={styles.scoreCard} surface="lavender" aria-labelledby="result-score">
+          <h2 className={styles.label} id="result-score">{copy.score}</h2>
+          <p className={styles.score}>
+            <strong>{interview.score}</strong><span> / 100</span>
+          </p>
+        </TalentryCard>
+        <TalentryCard aria-labelledby="result-summary">
+          <h2 className={styles.cardTitle} id="result-summary">{copy.summary}</h2>
+          <p className={styles.text} dir="auto">
+            {interview.summary.trim() ? interview.summary : copy.emptySummary}
+          </p>
+        </TalentryCard>
+      </div>
+        </div>
+        <div {...panelProps(1)}>
+      <TalentryCard aria-labelledby="result-details">
+        <SectionHeader title={<span id="result-details">{copy.details}</span>} />
+        <dl className={styles.metadata}>
+          {metadata.map(([label, value]) => (
+            <div key={label}>
+              <dt>{label}</dt>
+              <dd dir="auto">{value.trim() ? value : copy.notProvided}</dd>
+            </div>
+          ))}
+        </dl>
+      </TalentryCard>
+        </div>
+        <div {...panelProps(2)}>
+      <ResultAnswers answers={interview.answers} copy={copy} />
+      <div className={styles.actions}>
+        <Link className={`talentry-button talentry-button--primary talentry-button--large ${styles.action}`} href="/">
+          {copy.startAgain}
+        </Link>
+      </div>
+        </div>
+        </div>
+      </div>
+      <nav className={styles.pager} aria-label={copy.pager}>
+        {copy.panels.map((label, index) => (
+          <button key={label} type="button" className={styles.pagerButton}
+            aria-label={label} aria-current={activePanel === index ? 'step' : undefined}
+            aria-controls={`result-panel-${index}`} onClick={() => navigatePanel(index)}>
+            <span aria-hidden="true" />
+          </button>
+        ))}
+      </nav>
+    </>
+  )
+}
```

```diff
diff --git a/components/result/ResultShell.tsx b/components/result/ResultShell.tsx
--- a/components/result/ResultShell.tsx
+++ b/components/result/ResultShell.tsx
@@ -1,57 +1,58 @@
-import Link from 'next/link'
-import type { ReactNode } from 'react'
-import { EmptyState, SectionHeader, TalentryButton, TalentryCard } from '@/components/ui'
-import type { AppLanguage } from '@/types/auth'
-import type { ResultCopy } from './result-copy'
-import styles from '@/app/result/result.module.css'
-
-interface ResultShellProps {
-  children: ReactNode
-  title: string
-  copy: ResultCopy
-  uiLanguage: AppLanguage
-}
-
-export default function ResultShell({ children, title, copy, uiLanguage }: ResultShellProps) {
-  return (
-    <main className={styles.page} lang={uiLanguage}>
-      <div className={styles.container}>
-        <header className={styles.brand} aria-label="Talentry">
-          <span className={styles.brandMark} aria-hidden="true">T</span>
-          <span>Talentry</span>
-        </header>
-        <SectionHeader className={styles.heading} headingAs="h1" eyebrow={copy.review} title={title} />
-        <div className={styles.content}>{children}</div>
-      </div>
-    </main>
-  )
-}
-
-interface ResultStatusProps {
-  status: 'loading' | 'unavailable' | 'loadError'
-  copy: ResultCopy
-  onRetry: () => void
-}
-
-export function ResultStatus({ status, copy, onRetry }: ResultStatusProps) {
-  if (status === 'loading') {
-    return <TalentryCard className={styles.status} role="status" aria-live="polite">{copy.loading}</TalentryCard>
-  }
-
-  return (
-    <EmptyState
-      className={styles.status}
-      role="alert"
-      title={status === 'unavailable' ? copy.unavailable : copy.loadError}
-      description={status === 'unavailable' ? copy.unavailableHelp : copy.loadErrorHelp}
-      action={(
-        <div className={styles.actions}>
-          {status === 'loadError' && <TalentryButton className={styles.action} onClick={onRetry}>{copy.retry}</TalentryButton>}
-          <Link className={`talentry-button talentry-button--secondary talentry-button--medium ${styles.action}`} href="/">
-            {copy.startAgain}
-          </Link>
-        </div>
-      )}
-    />
-  )
-}
+import Link from 'next/link'
+import type { ReactNode } from 'react'
+import { EmptyState, SectionHeader, TalentryButton, TalentryCard } from '@/components/ui'
+import type { AppLanguage } from '@/types/auth'
+import type { ResultCopy } from './result-copy'
+import styles from '@/app/result/result.module.css'
+
+interface ResultShellProps {
+  children: ReactNode
+  title: string
+  copy: ResultCopy
+  uiLanguage: AppLanguage
+  mobileReview?: boolean
+}
+
+export default function ResultShell({ children, title, copy, uiLanguage, mobileReview = false }: ResultShellProps) {
+  return (
+    <main className={`${styles.page} ${mobileReview ? styles.mobileReview : ''}`} lang={uiLanguage}>
+      <div className={styles.container}>
+        <header className={styles.brand} aria-label="Talentry">
+          <span className={styles.brandMark} aria-hidden="true">T</span>
+          <span>Talentry</span>
+        </header>
+        <SectionHeader className={styles.heading} headingAs="h1" eyebrow={copy.review} title={title} />
+        <div className={styles.content}>{children}</div>
+      </div>
+    </main>
+  )
+}
+
+interface ResultStatusProps {
+  status: 'loading' | 'unavailable' | 'loadError'
+  copy: ResultCopy
+  onRetry: () => void
+}
+
+export function ResultStatus({ status, copy, onRetry }: ResultStatusProps) {
+  if (status === 'loading') {
+    return <TalentryCard className={styles.status} role="status" aria-live="polite">{copy.loading}</TalentryCard>
+  }
+
+  return (
+    <EmptyState
+      className={styles.status}
+      role="alert"
+      title={status === 'unavailable' ? copy.unavailable : copy.loadError}
+      description={status === 'unavailable' ? copy.unavailableHelp : copy.loadErrorHelp}
+      action={(
+        <div className={styles.actions}>
+          {status === 'loadError' && <TalentryButton className={styles.action} onClick={onRetry}>{copy.retry}</TalentryButton>}
+          <Link className={`talentry-button talentry-button--secondary talentry-button--medium ${styles.action}`} href="/">
+            {copy.startAgain}
+          </Link>
+        </div>
+      )}
+    />
+  )
+}
```

```diff
diff --git a/components/result/result-copy.ts b/components/result/result-copy.ts
--- a/components/result/result-copy.ts
+++ b/components/result/result-copy.ts
@@ -1,72 +1,76 @@
-import type { AppLanguage } from '@/types/auth'
-
-export type ResultCopy = {
-  review: string; completed: string; score: string; summary: string; details: string
-  role: string; company: string; level: string; interviewType: string
-  language: string; duration: string; date: string; persona: string
-  transcript: string; question: string; answer: string; startAgain: string
-  loading: string; unavailable: string; unavailableHelp: string
-  loadError: string; loadErrorHelp: string; retry: string
-  notProvided: string; emptySummary: string; emptyAnswers: string
-  levels: Record<'junior' | 'mid' | 'senior', string>
-  interviewTypes: Record<'behavioral' | 'technical' | 'mixed' | 'case', string>
-  personas: Record<'friendly' | 'formal' | 'tough' | 'curious', string>
-}
-
-// Same preference and display mappings as InterviewSetupForm; no new preference store.
-export const RESULT_UI_LANGUAGE_KEY = 'interviewai_uilang'
-export const INTERVIEW_LANGUAGE_NAMES: Record<AppLanguage, string> = {
-  tr: 'Türkçe', en: 'English', de: 'Deutsch',
-}
-
-export function displayValue(labels: Readonly<Record<string, string>>, value: string) {
-  return Object.prototype.hasOwnProperty.call(labels, value) ? labels[value] : value
-}
-
-export const RESULT_COPY: Record<AppLanguage, ResultCopy> = {
-  tr: {
-    review: 'Mülakat değerlendirmesi', completed: 'Mülakat tamamlandı', score: 'Puan',
-    summary: 'Performans değerlendirmesi', details: 'Görüşme bilgileri',
-    role: 'Pozisyon', company: 'Şirket', level: 'Seviye', interviewType: 'Mülakat türü',
-    language: 'Mülakat dili', duration: 'Süre', date: 'Tarih ve saat', persona: 'Mülakatçı tarzı',
-    transcript: 'Sorular ve cevaplar', question: 'Soru', answer: 'Cevap', startAgain: 'Yeniden Başla',
-    loading: 'Sonuç yükleniyor…', unavailable: 'Sonuç kullanılamıyor',
-    unavailableHelp: 'Bu mülakat sonucu kullanılamıyor.', loadError: 'Sonuç yüklenemedi',
-    loadErrorHelp: 'Tekrar deneyin veya yeni bir mülakat başlatın.', retry: 'Tekrar Dene',
-    notProvided: 'Belirtilmedi', emptySummary: 'Bu görüşme için değerlendirme metni bulunmuyor.',
-    emptyAnswers: 'Bu görüşmede kayıtlı soru ve cevap bulunmuyor.',
-    levels: { junior: 'Junior (0–2 yıl)', mid: 'Mid-level (2–5 yıl)', senior: 'Senior (5+ yıl)' },
-    interviewTypes: { behavioral: 'Davranışsal / İK', technical: 'Teknik', mixed: 'Karma', case: 'Vaka Analizi' },
-    personas: { friendly: 'Arkadaşça', formal: 'Profesyonel', tough: 'Zorlu', curious: 'Analitik' },
-  },
-  en: {
-    review: 'Interview result review', completed: 'Interview complete', score: 'Score',
-    summary: 'Performance review', details: 'Session details',
-    role: 'Role', company: 'Company', level: 'Level', interviewType: 'Interview type',
-    language: 'Interview language', duration: 'Duration', date: 'Date and time', persona: 'Interviewer persona',
-    transcript: 'Questions and answers', question: 'Question', answer: 'Answer', startAgain: 'Start Again',
-    loading: 'Loading result…', unavailable: 'Result unavailable',
-    unavailableHelp: 'This interview result is not available.', loadError: 'Result could not be loaded',
-    loadErrorHelp: 'Please retry or start a new interview.', retry: 'Retry',
-    notProvided: 'Not provided', emptySummary: 'No assessment text is available for this session.',
-    emptyAnswers: 'No questions and answers were saved for this session.',
-    levels: { junior: 'Junior (0–2 years)', mid: 'Mid-level (2–5 years)', senior: 'Senior (5+ years)' },
-    interviewTypes: { behavioral: 'Behavioral / HR', technical: 'Technical', mixed: 'Mixed', case: 'Case Study' },
-    personas: { friendly: 'Friendly', formal: 'Professional', tough: 'Tough', curious: 'Analytical' },
-  },
-  de: {
-    review: 'Interviewauswertung', completed: 'Interview abgeschlossen', score: 'Punktzahl',
-    summary: 'Leistungsbeurteilung', details: 'Gesprächsdetails',
-    role: 'Zielposition', company: 'Unternehmen', level: 'Erfahrungsstufe', interviewType: 'Gesprächsart',
-    language: 'Gesprächssprache', duration: 'Dauer', date: 'Datum und Uhrzeit', persona: 'Interviewer-Stil',
-    transcript: 'Fragen und Antworten', question: 'Frage', answer: 'Antwort', startAgain: 'Erneut starten',
-    loading: 'Ergebnis wird geladen…', unavailable: 'Ergebnis nicht verfügbar',
-    unavailableHelp: 'Dieses Interviewergebnis ist nicht verfügbar.', loadError: 'Ergebnis konnte nicht geladen werden',
-    loadErrorHelp: 'Versuche es erneut oder starte ein neues Interview.', retry: 'Erneut versuchen',
-    notProvided: 'Nicht angegeben', emptySummary: 'Für dieses Gespräch liegt kein Beurteilungstext vor.',
-    emptyAnswers: 'Für dieses Gespräch wurden keine Fragen und Antworten gespeichert.',
-    levels: { junior: 'Junior (0–2 Jahre)', mid: 'Mid-level (2–5 Jahre)', senior: 'Senior (5+ Jahre)' },
-    interviewTypes: { behavioral: 'Verhalten / HR', technical: 'Technisch', mixed: 'Gemischt', case: 'Fallstudie' },
-    personas: { friendly: 'Freundlich', formal: 'Professionell', tough: 'Anspruchsvoll', curious: 'Analytisch' },
-  },
-}
+import type { AppLanguage } from '@/types/auth'
+
+export type ResultCopy = {
+  review: string; completed: string; score: string; summary: string; details: string
+  role: string; company: string; level: string; interviewType: string
+  language: string; duration: string; date: string; persona: string
+  transcript: string; question: string; answer: string; startAgain: string
+  loading: string; unavailable: string; unavailableHelp: string
+  loadError: string; loadErrorHelp: string; retry: string
+  notProvided: string; emptySummary: string; emptyAnswers: string
+  pager: string; panels: readonly [string, string, string]
+  levels: Record<'junior' | 'mid' | 'senior', string>
+  interviewTypes: Record<'behavioral' | 'technical' | 'mixed' | 'case', string>
+  personas: Record<'friendly' | 'formal' | 'tough' | 'curious', string>
+}
+
+// Same preference and display mappings as InterviewSetupForm; no new preference store.
+export const RESULT_UI_LANGUAGE_KEY = 'interviewai_uilang'
+export const INTERVIEW_LANGUAGE_NAMES: Record<AppLanguage, string> = {
+  tr: 'Türkçe', en: 'English', de: 'Deutsch',
+}
+
+export function displayValue(labels: Readonly<Record<string, string>>, value: string) {
+  return Object.prototype.hasOwnProperty.call(labels, value) ? labels[value] : value
+}
+
+export const RESULT_COPY: Record<AppLanguage, ResultCopy> = {
+  tr: {
+    pager: 'Sonuç bölümleri', panels: ['Değerlendirme', 'Görüşme bilgileri', 'Sorular ve cevaplar'],
+    review: 'Mülakat değerlendirmesi', completed: 'Mülakat tamamlandı', score: 'Puan',
+    summary: 'Performans değerlendirmesi', details: 'Görüşme bilgileri',
+    role: 'Pozisyon', company: 'Şirket', level: 'Seviye', interviewType: 'Mülakat türü',
+    language: 'Mülakat dili', duration: 'Süre', date: 'Tarih ve saat', persona: 'Mülakatçı tarzı',
+    transcript: 'Sorular ve cevaplar', question: 'Soru', answer: 'Cevap', startAgain: 'Yeniden Başla',
+    loading: 'Sonuç yükleniyor…', unavailable: 'Sonuç kullanılamıyor',
+    unavailableHelp: 'Bu mülakat sonucu kullanılamıyor.', loadError: 'Sonuç yüklenemedi',
+    loadErrorHelp: 'Tekrar deneyin veya yeni bir mülakat başlatın.', retry: 'Tekrar Dene',
+    notProvided: 'Belirtilmedi', emptySummary: 'Bu görüşme için değerlendirme metni bulunmuyor.',
+    emptyAnswers: 'Bu görüşmede kayıtlı soru ve cevap bulunmuyor.',
+    levels: { junior: 'Junior (0–2 yıl)', mid: 'Mid-level (2–5 yıl)', senior: 'Senior (5+ yıl)' },
+    interviewTypes: { behavioral: 'Davranışsal / İK', technical: 'Teknik', mixed: 'Karma', case: 'Vaka Analizi' },
+    personas: { friendly: 'Arkadaşça', formal: 'Profesyonel', tough: 'Zorlu', curious: 'Analitik' },
+  },
+  en: {
+    pager: 'Result sections', panels: ['Evaluation', 'Interview details', 'Questions and answers'],
+    review: 'Interview result review', completed: 'Interview complete', score: 'Score',
+    summary: 'Performance review', details: 'Session details',
+    role: 'Role', company: 'Company', level: 'Level', interviewType: 'Interview type',
+    language: 'Interview language', duration: 'Duration', date: 'Date and time', persona: 'Interviewer persona',
+    transcript: 'Questions and answers', question: 'Question', answer: 'Answer', startAgain: 'Start Again',
+    loading: 'Loading result…', unavailable: 'Result unavailable',
+    unavailableHelp: 'This interview result is not available.', loadError: 'Result could not be loaded',
+    loadErrorHelp: 'Please retry or start a new interview.', retry: 'Retry',
+    notProvided: 'Not provided', emptySummary: 'No assessment text is available for this session.',
+    emptyAnswers: 'No questions and answers were saved for this session.',
+    levels: { junior: 'Junior (0–2 years)', mid: 'Mid-level (2–5 years)', senior: 'Senior (5+ years)' },
+    interviewTypes: { behavioral: 'Behavioral / HR', technical: 'Technical', mixed: 'Mixed', case: 'Case Study' },
+    personas: { friendly: 'Friendly', formal: 'Professional', tough: 'Tough', curious: 'Analytical' },
+  },
+  de: {
+    pager: 'Ergebnisbereiche', panels: ['Auswertung', 'Gesprächsdetails', 'Fragen und Antworten'],
+    review: 'Interviewauswertung', completed: 'Interview abgeschlossen', score: 'Punktzahl',
+    summary: 'Leistungsbeurteilung', details: 'Gesprächsdetails',
+    role: 'Zielposition', company: 'Unternehmen', level: 'Erfahrungsstufe', interviewType: 'Gesprächsart',
+    language: 'Gesprächssprache', duration: 'Dauer', date: 'Datum und Uhrzeit', persona: 'Interviewer-Stil',
+    transcript: 'Fragen und Antworten', question: 'Frage', answer: 'Antwort', startAgain: 'Erneut starten',
+    loading: 'Ergebnis wird geladen…', unavailable: 'Ergebnis nicht verfügbar',
+    unavailableHelp: 'Dieses Interviewergebnis ist nicht verfügbar.', loadError: 'Ergebnis konnte nicht geladen werden',
+    loadErrorHelp: 'Versuche es erneut oder starte ein neues Interview.', retry: 'Erneut versuchen',
+    notProvided: 'Nicht angegeben', emptySummary: 'Für dieses Gespräch liegt kein Beurteilungstext vor.',
+    emptyAnswers: 'Für dieses Gespräch wurden keine Fragen und Antworten gespeichert.',
+    levels: { junior: 'Junior (0–2 Jahre)', mid: 'Mid-level (2–5 Jahre)', senior: 'Senior (5+ Jahre)' },
+    interviewTypes: { behavioral: 'Verhalten / HR', technical: 'Technisch', mixed: 'Gemischt', case: 'Fallstudie' },
+    personas: { friendly: 'Freundlich', formal: 'Professionell', tough: 'Anspruchsvoll', curious: 'Analytisch' },
+  },
+}
```

## 10. New Summary content

```diff
--- /dev/null
+++ b/docs/01_Engineering/Sprint_RESULT_MOBILE_PAGER_20260916_Summary.md
+# Sprint RESULT_MOBILE_PAGER_20260916 Summary
+
+- Title: Result mobile three-panel swipe/pager follow-up
+- Branch: feature/auth-foundation
+- HEAD: ef18af9 feat(interview): complete Talentry live interview
+- Status: Implemented; awaiting approval.
+- Goal: At <=640px, navigate Evaluation, Interview Details and Questions/Answers through horizontal swipes and three accessible dots, preserving the existing desktop/tablet layout and Result data lifecycle.
+- Starting state: Existing uncommitted Result migration and a separate Interview CSS modification; all preserved.
+- Modified this follow-up: app/result/[id]/page.tsx (one presentation prop), app/result/result.module.css, components/result/ResultContent.tsx, components/result/ResultShell.tsx, components/result/result-copy.ts.
+- Created: This Summary and companion Engineering Report only.
+- Validation: npx.cmd tsc --noEmit exit 0 with no TypeScript diagnostics; npm update notice only. Generated tsconfig.tsbuildinfo removed. git diff --check exit 0; LF-to-CRLF warnings for existing modified Interview CSS and the two Result files. Requested Result diff and Git status inspected.
+- Risks: Browser/mobile gesture runtime verification remains pending. No production build per instruction. Fixed mobile shell uses dynamic viewport height; real-device zoom and browser chrome behavior need runtime review.
+- Approval status: Not yet approved. No staging, commit, push, Project Memory update or next stage.
```

