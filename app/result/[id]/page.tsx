'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { AUTH_ROUTES } from '@/lib/auth/auth-constants'

type InterviewAnswer = {
  q: string
  a: string
}

type InterviewDetail = {
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

function formatDuration(durationSeconds: number) {
  const totalSeconds = Math.max(0, Math.floor(durationSeconds))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

function formatCreatedAt(createdAt: string) {
  const date = new Date(createdAt)

  if (Number.isNaN(date.getTime())) {
    return createdAt
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export default function ResultDetailPage({ params }: ResultPageProps) {
  const router = useRouter()
  const [loadState, setLoadState] = useState<ResultLoadState>({ status: 'loading' })
  const [retryAttempt, setRetryAttempt] = useState(0)

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

  const pageStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#07090d',
    color: '#dde6ee',
    padding: 20,
    boxSizing: 'border-box' as const,
  }

  const cardStyle = {
    maxWidth: 720,
    width: '100%',
    background: '#0e1318',
    borderRadius: 20,
    padding: 40,
    textAlign: 'center' as const,
    boxSizing: 'border-box' as const,
  }

  if (loadState.status === 'loading') {
    return (
      <main style={pageStyle}>
        <div style={cardStyle} aria-live="polite">Loading result...</div>
      </main>
    )
  }

  if (loadState.status === 'unavailable') {
    return (
      <main style={pageStyle}>
        <div style={cardStyle}>
          <h1 style={{ fontSize: 24, marginBottom: 12 }}>Result unavailable</h1>
          <p style={{ color: '#9aa8b6', lineHeight: 1.6, marginBottom: 24 }}>
            This interview result is not available.
          </p>
          <Link href="/" style={{ color: '#00c8f0', fontWeight: 700 }}>
            Start again
          </Link>
        </div>
      </main>
    )
  }

  if (loadState.status === 'loadError') {
    return (
      <main style={pageStyle}>
        <div style={cardStyle}>
          <h1 style={{ fontSize: 24, marginBottom: 12 }}>Result could not be loaded</h1>
          <p style={{ color: '#9aa8b6', lineHeight: 1.6, marginBottom: 24 }}>
            Please retry or start a new interview.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setRetryAttempt(attempt => attempt + 1)}
              style={{
                padding: '12px 24px',
                background: '#00c8f0',
                color: '#07090d',
                border: 0,
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
            <Link
              href="/"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                color: '#dde6ee',
                border: '1px solid #33404d',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Start again
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const { interview } = loadState
  const scoreColor = interview.score >= 75
    ? '#00e87a'
    : interview.score >= 50
      ? '#00c8f0'
      : '#ff5f5f'

  return (
    <main style={pageStyle}>
      <article style={cardStyle}>
        <div style={{ fontSize: 40, marginBottom: 12 }} aria-hidden="true">🎯</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
          Mülakat Tamamlandı
        </h1>
        <div style={{ fontSize: 80, fontWeight: 800, color: scoreColor, margin: '16px 0' }}>
          {interview.score}
        </div>
        <div style={{ fontSize: 11, color: '#637384', marginBottom: 20 }}>PUAN</div>
        <div style={{
          background: '#0b1219',
          borderRadius: 12,
          padding: 20,
          textAlign: 'left',
          fontSize: 14,
          lineHeight: 1.8,
          marginBottom: 20,
        }}>
          {interview.summary}
        </div>
        <dl style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 12,
          textAlign: 'left',
          margin: '0 0 24px',
        }}>
          {[
            ['Pozisyon', interview.role],
            ['Şirket', interview.company],
            ['Seviye', interview.level],
            ['Mülakat türü', interview.interviewType],
            ['Dil', interview.language],
            ['Süre', formatDuration(interview.durationSeconds)],
            ['Tarih', formatCreatedAt(interview.createdAt)],
          ].map(([label, value]) => (
            <div key={label} style={{ background: '#0b1219', borderRadius: 10, padding: 12 }}>
              <dt style={{ color: '#637384', fontSize: 11, marginBottom: 4 }}>{label}</dt>
              <dd style={{ margin: 0, fontSize: 14 }}>{value}</dd>
            </div>
          ))}
        </dl>
        <section style={{ textAlign: 'left', marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, marginBottom: 12 }}>Soru ve cevaplar</h2>
          <div style={{ display: 'grid', gap: 12 }}>
            {interview.answers.map((answer, index) => (
              <div key={`${index}-${answer.q}`} style={{ background: '#0b1219', borderRadius: 12, padding: 16 }}>
                <p style={{ margin: '0 0 8px', lineHeight: 1.6 }}>
                  <strong>Soru {index + 1}:</strong> {answer.q}
                </p>
                <p style={{ margin: 0, color: '#aeb9c4', lineHeight: 1.6 }}>
                  <strong>Cevap:</strong> {answer.a}
                </p>
              </div>
            ))}
          </div>
        </section>
        <Link
          href="/"
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: '#00c8f0',
            color: '#07090d',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          Yeniden Başla
        </Link>
      </article>
    </main>
  )
}
