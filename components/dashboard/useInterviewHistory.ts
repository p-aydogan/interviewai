'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AUTH_ROUTES } from '@/lib/auth/auth-constants'
import type { InterviewListItem } from '@/types/interviews'

export type HistoryState =
  | { status: 'loading' | 'empty' | 'error' }
  | { status: 'success'; interviews: InterviewListItem[] }

function isInterview(value: unknown): value is InterviewListItem {
  if (!value || typeof value !== 'object') return false
  const row = value as Record<string, unknown>
  return typeof row.id === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(row.id) &&
    ['role', 'company', 'level', 'interviewType', 'language'].every(key => typeof row[key] === 'string') &&
    typeof row.score === 'number' && Number.isInteger(row.score) && row.score >= 0 && row.score <= 100 &&
    typeof row.durationSeconds === 'number' && Number.isInteger(row.durationSeconds) && row.durationSeconds >= 0 &&
    typeof row.createdAt === 'string' && Number.isFinite(Date.parse(row.createdAt))
}

function parseHistory(payload: unknown): InterviewListItem[] {
  if (!payload || typeof payload !== 'object' || !('interviews' in payload) ||
    !Array.isArray(payload.interviews) || payload.interviews.length > 5 ||
    !payload.interviews.every(isInterview)) throw new Error('Invalid interview list')
  return payload.interviews
}

export function useInterviewHistory() {
  const router = useRouter()
  const [state, setState] = useState<HistoryState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)
  const retry = useCallback(() => setAttempt(value => value + 1), [])

  useEffect(() => {
    let controller: AbortController | undefined
    let disposed = false
    let unauthorized = false

    async function load() {
      if (disposed || unauthorized) return
      controller?.abort()
      const current = new AbortController()
      controller = current
      setState({ status: 'loading' })
      try {
        const response = await fetch('/api/interviews?limit=5', {
          cache: 'no-store', signal: current.signal,
        })
        if (current.signal.aborted || disposed) return
        if (response.status === 401) {
          unauthorized = true
          setState({ status: 'loading' })
          router.replace(AUTH_ROUTES.login)
          return
        }
        if (!response.ok) throw new Error('History request failed')
        const payload: unknown = await response.json()
        const interviews = parseHistory(payload)
        if (!current.signal.aborted && !disposed) {
          setState(interviews.length ? { status: 'success', interviews } : { status: 'empty' })
        }
      } catch {
        if (!current.signal.aborted && !disposed) setState({ status: 'error' })
      }
    }

    const onFocus = () => { void load() }
    const onPageShow = (event: PageTransitionEvent) => { if (event.persisted) void load() }
    void load()
    window.addEventListener('focus', onFocus)
    window.addEventListener('pageshow', onPageShow)
    return () => {
      disposed = true
      controller?.abort()
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('pageshow', onPageShow)
    }
  }, [attempt, router])

  return { state, retry }
}
