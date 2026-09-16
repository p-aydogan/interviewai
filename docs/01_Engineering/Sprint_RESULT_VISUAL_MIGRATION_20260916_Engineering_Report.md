# Sprint RESULT_VISUAL_MIGRATION_20260916 Engineering Report

## 1. Report identity

Date: 2026-09-16. Title: Talentry persisted Result visual migration. Status: implemented, awaiting approval; not committed. This is a new immutable sprint report, not a Project Memory update.

## 2. Objective and boundaries

Migrate /result/[id] and its loading/unavailable/error presentation to a light Talentry review screen. Preserve persisted reads, owner authorization, route IDs, validation, abort/retry lifecycle, login redirect, and restart navigation through /. No API, schema, authentication, Setup, Live Interview, Dashboard, shared primitive or token modifications.

## 3. Repository before implementation

Branch feature/auth-foundation. HEAD ef18af9 feat(interview): complete Talentry live interview. git status --short was empty. tsconfig.tsbuildinfo did not exist. Current Result and shared UI primitives/tokens were inspected using the preceding forensic review and fresh source reads.

## 4. Architecture and implementation

The route retains runtime validation, route params, fetch, AbortController cleanup, load states, retry and login redirect. Its existing fetch effect and validation helpers compare identically to HEAD. ResultContent formats display values and composes score, summary, metadata and transcript. ResultAnswers renders all persisted q/a pairs. ResultShell and ResultStatus consolidate presentation for ready/loading/error states; neither fetches data.

The light shell uses a bounded 1152px-equivalent maximum derived from spacing tokens. Desktop has score and summary columns, with metadata and transcript below. Metadata uses four/two/one columns across desktop/tablet/mobile. At <=40rem, overview stacks and navigation actions become full width. All result content remains in normal document flow with no fixed content height or nested scroll container. Long text wraps anywhere and preserves newlines. Empty summary/answers and blank metadata have localized fallback text.

The explicit score / 100 has no threshold classification. No new analytics, identity inference, badges or charts. Persona uses established Setup labels. Interviewer identity is omitted because only its key is persisted. Owner and record IDs are not displayed.

## 5. Files and responsibilities

Modified:
- app/result/[id]/page.tsx: data/state controller plus established UI preference read and presentation composition.
- app/result/result.module.css: replaces unused legacy rules with active Result-specific token-based layout.

Created:
- components/result/ResultContent.tsx: score, summary, metadata, duration/date formatting, restart link.
- components/result/ResultAnswers.tsx: semantic transcript with distinct question/answer treatment and empty state.
- components/result/ResultShell.tsx: reusable Result-only shell and load-state presentation; avoids duplicating brand, heading and error action markup.
- components/result/result-copy.ts: typed TR/EN/DE labels and safe own-property display mappings.
- docs/01_Engineering/Sprint_RESULT_VISUAL_MIGRATION_20260916_Summary.md: concise review record.
- docs/01_Engineering/Sprint_RESULT_VISUAL_MIGRATION_20260916_Engineering_Report.md: this detailed report.

## 6. Public interfaces, props and types

The route exports type-only InterviewAnswer and InterviewDetail using the existing contract; no runtime route exports added. ResultContent receives interview, copy and uiLanguage. ResultAnswers receives answers and copy. ResultShell receives children, title, copy and uiLanguage. ResultStatus receives status (loading/unavailable/loadError), copy and onRetry. ResultCopy specifies every UI string and closed-key level/type/persona maps. RESULT_COPY is Record<AppLanguage, ResultCopy>. displayValue returns a known own-property label or the original persisted string; unknown values are not invented or rejected.

## 7. Localization

Reads the existing interviewai_uilang localStorage preference once, validates using SUPPORTED_APP_LANGUAGES, and defaults using DEFAULT_APP_LANGUAGE. It does not create/write a new preference. Storage denial falls back without preventing the result fetch. The Result main element has the UI language attribute. Persisted summary/questions/answers are not translated; dir=auto supports their text direction. Interview language is displayed independently. Date formatting follows the application language and browser timezone. Setup's private label maps are mirrored exactly because they are not exported and Setup changes are forbidden. This duplication is a limited maintenance risk, not a new preference system.

## 8. Accessibility, styling and tokens

Uses SectionHeader, TalentryCard, EmptyState, TalentryButton and existing button classes on semantic Links. There is one page h1, section headings, metadata dl/dt/dd, ordered transcript with h3 questions/h4 answers, polite loading status and alert semantics for failures. Shared controls supply visible focus and >=44px targets. No threshold-based color meaning, new motion, unsafe HTML or sensitive record identifiers. Shared reduced-motion behavior remains in force. All palette, spacing, typography, radius and control-size values use existing Talentry tokens; no shared files changed. The root body margin remains untouched to avoid global changes; the Result shell stays within available width.

## 9. Validation commands and exact results

- npx.cmd tsc --noEmit: exit 0; no TypeScript errors. npm emitted only an available-version notice: 11.16.0 -> 12.0.2. No package installation/update performed.
- Removed generated tsconfig.tsbuildinfo using Remove-Item -LiteralPath after confirming it existed; it was absent before validation.
- git diff --check: exit 0; no whitespace errors. Git emitted LF-to-CRLF conversion warnings for app/result/[id]/page.tsx and app/result/result.module.css. No normalization outside scope.
- Read-only comparison to HEAD: Fetch lifecycle unchanged: True; Runtime validation unchanged: True.
- Source review confirmed only href="/" navigation in Result components, unchanged encoded API path, and unchanged 401/400/404/error/abort handling.
- Production build deliberately not run per user instruction. No browser, live API, authenticated refresh or 390x844 runtime test was performed; responsive conclusions are source-level reasoning only.

## 10. Git status

Expected final changes are exactly two modified source files, four new Result component/copy files, and two new sprint reports. Branch/HEAD unchanged. Nothing staged, committed or pushed. Project Memory unchanged.

## 11. Risks, limitations and technical debt

Browser visual/runtime verification remains pending, including long content, all three languages, direct refresh, keyboard navigation and auth/error states. TypeScript does not validate CSS rendering. Existing upstream browser-submitted score/summary persistence and Claude proxy auth/logging remain untouched. No API optionality changed: absent/null required fields still fail the existing guard; empty strings/arrays receive presentation fallbacks. Date timezone remains browser-dependent. The controller exceeds the suggested 150-line file guideline to retain required validation and data lifecycle in the page; presentational components remain small. Reports contain complete application-file diffs and Summary addition below; this report does not recursively embed its own diff.

## 12. Untouched modules and deferred items

Legacy /result redirect, root redirect, all APIs, auth helpers, Supabase schema, Setup, Live Interview, Dashboard/History, shared UI/tokens, Project Memory and historical reports remain unchanged. PDF, HeyGen, scoring redesign, new AI calls, analytics/charts/trends/percentiles, gamification and dashboard/history actions remain deferred. Production build, staging, commit and push require a later instruction.

## 13. Approval required

Implementation is ready for review, with static validation passed and runtime/build work explicitly pending. No approval is claimed. Stop here; do not begin the next stage automatically.

## 14. Complete sprint application-file diffs and Summary addition

```diff
diff --git a/app/result/[id]/page.tsx b/app/result/[id]/page.tsx
index 699660f..efacc8c 100644
--- a/app/result/[id]/page.tsx
+++ b/app/result/[id]/page.tsx
@@ -1,17 +1,20 @@
 'use client'
 
-import Link from 'next/link'
+import ResultContent from '@/components/result/ResultContent'
+import ResultShell, { ResultStatus } from '@/components/result/ResultShell'
+import { RESULT_COPY, RESULT_UI_LANGUAGE_KEY } from '@/components/result/result-copy'
+import type { AppLanguage } from '@/types/auth'
 import { useRouter } from 'next/navigation'
 import { useEffect, useState } from 'react'
 
-import { AUTH_ROUTES } from '@/lib/auth/auth-constants'
+import { AUTH_ROUTES, DEFAULT_APP_LANGUAGE, SUPPORTED_APP_LANGUAGES } from '@/lib/auth/auth-constants'
 
-type InterviewAnswer = {
+export type InterviewAnswer = {
   q: string
   a: string
 }
 
-type InterviewDetail = {
+export type InterviewDetail = {
   id: string
   interviewerKey: string
   role: string
@@ -81,31 +84,22 @@ function getInterview(value: unknown): InterviewDetail | null {
   return value.interview
 }
 
-function formatDuration(durationSeconds: number) {
-  const totalSeconds = Math.max(0, Math.floor(durationSeconds))
-  const minutes = Math.floor(totalSeconds / 60)
-  const seconds = totalSeconds % 60
-
-  return `${minutes}:${String(seconds).padStart(2, '0')}`
-}
-
-function formatCreatedAt(createdAt: string) {
-  const date = new Date(createdAt)
-
-  if (Number.isNaN(date.getTime())) {
-    return createdAt
-  }
-
-  return new Intl.DateTimeFormat(undefined, {
-    dateStyle: 'medium',
-    timeStyle: 'short',
-  }).format(date)
-}
-
 export default function ResultDetailPage({ params }: ResultPageProps) {
   const router = useRouter()
   const [loadState, setLoadState] = useState<ResultLoadState>({ status: 'loading' })
   const [retryAttempt, setRetryAttempt] = useState(0)
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
 
   useEffect(() => {
     const controller = new AbortController()
@@ -167,179 +161,17 @@ export default function ResultDetailPage({ params }: ResultPageProps) {
     return () => controller.abort()
   }, [params.id, retryAttempt, router])
 
-  const pageStyle = {
-    minHeight: '100vh',
-    display: 'flex',
-    alignItems: 'center',
-    justifyContent: 'center',
-    background: '#07090d',
-    color: '#dde6ee',
-    padding: 20,
-    boxSizing: 'border-box' as const,
-  }
-
-  const cardStyle = {
-    maxWidth: 720,
-    width: '100%',
-    background: '#0e1318',
-    borderRadius: 20,
-    padding: 40,
-    textAlign: 'center' as const,
-    boxSizing: 'border-box' as const,
-  }
-
-  if (loadState.status === 'loading') {
-    return (
-      <main style={pageStyle}>
-        <div style={cardStyle} aria-live="polite">Loading result...</div>
-      </main>
-    )
-  }
-
-  if (loadState.status === 'unavailable') {
-    return (
-      <main style={pageStyle}>
-        <div style={cardStyle}>
-          <h1 style={{ fontSize: 24, marginBottom: 12 }}>Result unavailable</h1>
-          <p style={{ color: '#9aa8b6', lineHeight: 1.6, marginBottom: 24 }}>
-            This interview result is not available.
-          </p>
-          <Link href="/" style={{ color: '#00c8f0', fontWeight: 700 }}>
-            Start again
-          </Link>
-        </div>
-      </main>
-    )
-  }
-
-  if (loadState.status === 'loadError') {
-    return (
-      <main style={pageStyle}>
-        <div style={cardStyle}>
-          <h1 style={{ fontSize: 24, marginBottom: 12 }}>Result could not be loaded</h1>
-          <p style={{ color: '#9aa8b6', lineHeight: 1.6, marginBottom: 24 }}>
-            Please retry or start a new interview.
-          </p>
-          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
-            <button
-              type="button"
-              onClick={() => setRetryAttempt(attempt => attempt + 1)}
-              style={{
-                padding: '12px 24px',
-                background: '#00c8f0',
-                color: '#07090d',
-                border: 0,
-                borderRadius: 10,
-                fontSize: 14,
-                fontWeight: 700,
-                cursor: 'pointer',
-              }}
-            >
-              Retry
-            </button>
-            <Link
-              href="/"
-              style={{
-                display: 'inline-block',
-                padding: '12px 24px',
-                color: '#dde6ee',
-                border: '1px solid #33404d',
-                borderRadius: 10,
-                fontSize: 14,
-                fontWeight: 700,
-                textDecoration: 'none',
-              }}
-            >
-              Start again
-            </Link>
-          </div>
-        </div>
-      </main>
-    )
-  }
-
-  const { interview } = loadState
-  const scoreColor = interview.score >= 75
-    ? '#00e87a'
-    : interview.score >= 50
-      ? '#00c8f0'
-      : '#ff5f5f'
-
   return (
-    <main style={pageStyle}>
-      <article style={cardStyle}>
-        <div style={{ fontSize: 40, marginBottom: 12 }} aria-hidden="true">🎯</div>
-        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
-          Mülakat Tamamlandı
-        </h1>
-        <div style={{ fontSize: 80, fontWeight: 800, color: scoreColor, margin: '16px 0' }}>
-          {interview.score}
-        </div>
-        <div style={{ fontSize: 11, color: '#637384', marginBottom: 20 }}>PUAN</div>
-        <div style={{
-          background: '#0b1219',
-          borderRadius: 12,
-          padding: 20,
-          textAlign: 'left',
-          fontSize: 14,
-          lineHeight: 1.8,
-          marginBottom: 20,
-        }}>
-          {interview.summary}
-        </div>
-        <dl style={{
-          display: 'grid',
-          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
-          gap: 12,
-          textAlign: 'left',
-          margin: '0 0 24px',
-        }}>
-          {[
-            ['Pozisyon', interview.role],
-            ['Şirket', interview.company],
-            ['Seviye', interview.level],
-            ['Mülakat türü', interview.interviewType],
-            ['Dil', interview.language],
-            ['Süre', formatDuration(interview.durationSeconds)],
-            ['Tarih', formatCreatedAt(interview.createdAt)],
-          ].map(([label, value]) => (
-            <div key={label} style={{ background: '#0b1219', borderRadius: 10, padding: 12 }}>
-              <dt style={{ color: '#637384', fontSize: 11, marginBottom: 4 }}>{label}</dt>
-              <dd style={{ margin: 0, fontSize: 14 }}>{value}</dd>
-            </div>
-          ))}
-        </dl>
-        <section style={{ textAlign: 'left', marginBottom: 24 }}>
-          <h2 style={{ fontSize: 18, marginBottom: 12 }}>Soru ve cevaplar</h2>
-          <div style={{ display: 'grid', gap: 12 }}>
-            {interview.answers.map((answer, index) => (
-              <div key={`${index}-${answer.q}`} style={{ background: '#0b1219', borderRadius: 12, padding: 16 }}>
-                <p style={{ margin: '0 0 8px', lineHeight: 1.6 }}>
-                  <strong>Soru {index + 1}:</strong> {answer.q}
-                </p>
-                <p style={{ margin: 0, color: '#aeb9c4', lineHeight: 1.6 }}>
-                  <strong>Cevap:</strong> {answer.a}
-                </p>
-              </div>
-            ))}
-          </div>
-        </section>
-        <Link
-          href="/"
-          style={{
-            display: 'inline-block',
-            padding: '12px 24px',
-            background: '#00c8f0',
-            color: '#07090d',
-            borderRadius: 10,
-            fontSize: 14,
-            fontWeight: 700,
-            textDecoration: 'none',
-          }}
-        >
-          Yeniden Başla
-        </Link>
-      </article>
-    </main>
+    <ResultShell
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
   )
 }
diff --git a/app/result/result.module.css b/app/result/result.module.css
index cbfca41..1421a2b 100644
--- a/app/result/result.module.css
+++ b/app/result/result.module.css
@@ -1,8 +1,208 @@
-.main{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:40px 24px;}
-.card{max-width:580px;width:100%;background:var(--s);border:1px solid var(--bd);border-radius:20px;padding:44px;text-align:center;}
-.icon{font-size:46px;margin-bottom:14px;}
-.title{font-family:'Syne',sans-serif;font-size:26px;font-weight:800;letter-spacing:-.5px;margin-bottom:8px;}
-.score{font-family:'Syne',sans-serif;font-size:90px;font-weight:800;line-height:1;margin:20px 0 6px;letter-spacing:-3px;}
-.scoreLbl{font-family:'DM Mono',monospace;font-size:11px;color:var(--m);margin-bottom:32px;letter-spacing:1px;}
-.summary{background:var(--c);border-radius:12px;padding:22px;text-align:left;font-size:14px;line-height:1.8;margin-bottom:28px;}
-.restartBtn{display:inline-block;padding:13px 28px;background:var(--a);color:#07090d;border-radius:10px;font-family:'Syne',sans-serif;font-size:14px;font-weight:700;text-decoration:none;}
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
+@media (max-width: 40rem) {
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
+}
```

```diff
diff --git a/components/result/ResultContent.tsx b/components/result/ResultContent.tsx
new file mode 100644
--- /dev/null
+++ b/components/result/ResultContent.tsx
@@ -0,0 +1,75 @@
+import Link from 'next/link'
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
+      <ResultAnswers answers={interview.answers} copy={copy} />
+      <div className={styles.actions}>
+        <Link className={`talentry-button talentry-button--primary talentry-button--large ${styles.action}`} href="/">
+          {copy.startAgain}
+        </Link>
+      </div>
+    </>
+  )
+}
```

```diff
diff --git a/components/result/ResultAnswers.tsx b/components/result/ResultAnswers.tsx
new file mode 100644
--- /dev/null
+++ b/components/result/ResultAnswers.tsx
@@ -0,0 +1,37 @@
+import { EmptyState, SectionHeader, TalentryCard } from '@/components/ui'
+import type { InterviewAnswer } from '@/app/result/[id]/page'
+import type { ResultCopy } from './result-copy'
+import styles from '@/app/result/result.module.css'
+
+interface ResultAnswersProps {
+  answers: InterviewAnswer[]
+  copy: ResultCopy
+}
+
+export default function ResultAnswers({ answers, copy }: ResultAnswersProps) {
+  return (
+    <section className={styles.transcript} aria-labelledby="result-transcript">
+      <SectionHeader title={<span id="result-transcript">{copy.transcript}</span>} />
+      {answers.length === 0 ? (
+        <EmptyState headingAs="h3" title={copy.emptyAnswers} />
+      ) : (
+        <ol className={styles.answers}>
+          {answers.map((answer, index) => (
+            <li key={index}>
+              <TalentryCard as="article" aria-labelledby={`result-question-${index}`}>
+                <h3 className={styles.questionLabel} id={`result-question-${index}`}>
+                  {copy.question} {index + 1}
+                </h3>
+                <p className={styles.text} dir="auto">{answer.q}</p>
+                <div className={styles.answer}>
+                  <h4 className={styles.answerLabel}>{copy.answer}</h4>
+                  <p className={styles.text} dir="auto">{answer.a}</p>
+                </div>
+              </TalentryCard>
+            </li>
+          ))}
+        </ol>
+      )}
+    </section>
+  )
+}
```

```diff
diff --git a/components/result/ResultShell.tsx b/components/result/ResultShell.tsx
new file mode 100644
--- /dev/null
+++ b/components/result/ResultShell.tsx
@@ -0,0 +1,57 @@
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
+}
+
+export default function ResultShell({ children, title, copy, uiLanguage }: ResultShellProps) {
+  return (
+    <main className={styles.page} lang={uiLanguage}>
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
new file mode 100644
--- /dev/null
+++ b/components/result/result-copy.ts
@@ -0,0 +1,72 @@
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

```diff
diff --git a/docs/01_Engineering/Sprint_RESULT_VISUAL_MIGRATION_20260916_Summary.md b/docs/01_Engineering/Sprint_RESULT_VISUAL_MIGRATION_20260916_Summary.md
new file mode 100644
--- /dev/null
+++ b/docs/01_Engineering/Sprint_RESULT_VISUAL_MIGRATION_20260916_Summary.md
@@ -0,0 +1,12 @@
+# Sprint RESULT_VISUAL_MIGRATION_20260916 Summary
+
+- Title: Talentry persisted Result visual migration
+- Branch: feature/auth-foundation
+- Starting commit: ef18af9 feat(interview): complete Talentry live interview
+- Status: Implemented; awaiting review approval. Production build and browser validation deferred.
+- Goal: Present the existing persisted Result in the approved light Talentry system without changing data access or navigation.
+- Modified files: app/result/[id]/page.tsx; app/result/result.module.css.
+- Created files: components/result/ResultContent.tsx; components/result/ResultAnswers.tsx; components/result/ResultShell.tsx; components/result/result-copy.ts; this Summary; companion Engineering Report.
+- Validation: npx.cmd tsc --noEmit exited 0, no TypeScript diagnostics. npm printed an update notice (11.16.0 -> 12.0.2); no update performed. Generated tsconfig.tsbuildinfo removed. git diff --check exited 0; Git warned that LF will become CRLF on its next write for the two modified files. Source comparison confirmed unchanged fetch lifecycle and runtime validation.
+- Risks: No browser/runtime verification or production build performed. Existing scoring trust boundary and Claude proxy concerns remain unchanged. Setup mappings are private, so the same labels are mirrored locally without modifying Setup. Application language falls back to the established default if storage cannot be read.
+- Approval status: Not yet approved. No staging, commit, push, Project Memory update, or next stage performed.
```

