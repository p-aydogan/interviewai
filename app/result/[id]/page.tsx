'use client'

import ResultContent from '@/components/result/ResultContent'
import ResultShell, { ResultStatus } from '@/components/result/ResultShell'
import { RESULT_COPY, RESULT_UI_LANGUAGE_KEY } from '@/components/result/result-copy'
import type { AppLanguage } from '@/types/auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { AUTH_ROUTES, DEFAULT_APP_LANGUAGE, SUPPORTED_APP_LANGUAGES } from '@/lib/auth/auth-constants'

export type InterviewAnswer = {
  q: string
  a: string
}

export type InterviewDetail = {
  id: string
  interviewerKey: string
  role: string
  company: string
  level: string
  interviewType: string
  persona: string
  language: string
  answers: InterviewAnswer[]
  score: number
  summary: string
  durationSeconds: number
  createdAt: string
}

type ResultLoadState =
  | { status: 'loading' }
  | { status: 'ready'; interview: InterviewDetail }
  | { status: 'unavailable' }
  | { status: 'loadError' }

type ResultPageProps = {
  params: {
    id: string
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isInterviewAnswer(value: unknown): value is InterviewAnswer {
  return (
    isRecord(value) &&
    typeof value.q === 'string' &&
    typeof value.a === 'string'
  )
}

function isInterviewDetail(value: unknown): value is InterviewDetail {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.interviewerKey === 'string' &&
    typeof value.role === 'string' &&
    typeof value.company === 'string' &&
    typeof value.level === 'string' &&
    typeof value.interviewType === 'string' &&
    typeof value.persona === 'string' &&
    typeof value.language === 'string' &&
    Array.isArray(value.answers) &&
    value.answers.every(isInterviewAnswer) &&
    typeof value.score === 'number' &&
    Number.isFinite(value.score) &&
    typeof value.summary === 'string' &&
    typeof value.durationSeconds === 'number' &&
    Number.isFinite(value.durationSeconds) &&
    typeof value.createdAt === 'string'
  )
}

function getInterview(value: unknown): InterviewDetail | null {
  if (!isRecord(value) || !isInterviewDetail(value.interview)) {
    return null
  }

  return value.interview
}

export default function ResultDetailPage({ params }: ResultPageProps) {
  const router = useRouter()
  const [loadState, setLoadState] = useState<ResultLoadState>({ status: 'loading' })
  const [retryAttempt, setRetryAttempt] = useState(0)
  const [uiLanguage, setUiLanguage] = useState<AppLanguage>(DEFAULT_APP_LANGUAGE)
  const copy = RESULT_COPY[uiLanguage]

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(RESULT_UI_LANGUAGE_KEY)
      const language = SUPPORTED_APP_LANGUAGES.find(value => value === saved)
      if (language) setUiLanguage(language)
    } catch {
      // Keep the established default when browser storage is unavailable.
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const updateLoadState = (state: ResultLoadState) => {
      if (!controller.signal.aborted) {
        setLoadState(state)
      }
    }

    async function loadResult() {
      updateLoadState({ status: 'loading' })

      try {
        const response = await fetch(
          `/api/interviews/${encodeURIComponent(params.id)}`,
          {
            cache: 'no-store',
            signal: controller.signal,
          },
        )

        if (response.status === 401) {
          if (!controller.signal.aborted) {
            router.replace(AUTH_ROUTES.login)
          }
          return
        }

        if (response.status === 400 || response.status === 404) {
          updateLoadState({ status: 'unavailable' })
          return
        }

        if (!response.ok) {
          updateLoadState({ status: 'loadError' })
          return
        }

        const payload: unknown = await response.json()
        const interview = getInterview(payload)

        if (!interview) {
          updateLoadState({ status: 'loadError' })
          return
        }

        updateLoadState({ status: 'ready', interview })
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return
        }

        updateLoadState({ status: 'loadError' })
      }
    }

    void loadResult()

    return () => controller.abort()
  }, [params.id, retryAttempt, router])

  return (
    <ResultShell
      mobileReview={loadState.status === 'ready'}
      copy={copy}
      uiLanguage={uiLanguage}
      title={loadState.status === 'ready' ? copy.completed : copy.review}
    >
      {loadState.status === 'ready' ? (
        <ResultContent interview={loadState.interview} copy={copy} uiLanguage={uiLanguage} />
      ) : (
        <ResultStatus status={loadState.status} copy={copy} onRetry={() => setRetryAttempt(attempt => attempt + 1)} />
      )}
    </ResultShell>
  )
}
