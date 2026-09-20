'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AUTH_ROUTES } from '@/lib/auth/auth-constants'
import type { InterviewHistoryPage, InterviewListItem } from '@/types/interviews'

type HistoryState = {
  status: 'loading' | 'error' | 'ready'
  interviews: InterviewListItem[]
  nextCursor: string | null
  more: 'idle' | 'loading' | 'error'
}
const INITIAL: HistoryState = { status: 'loading', interviews: [], nextCursor: null, more: 'idle' }

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

function parsePage(value: unknown, cursor: string | null): InterviewHistoryPage {
  if (!value || typeof value !== 'object') throw new Error('Invalid history page')
  const page = value as Record<string, unknown>
  if (!Array.isArray(page.interviews) || page.interviews.length > 20 || !page.interviews.every(isInterview) ||
    !(page.nextCursor === null || (typeof page.nextCursor === 'string' &&
      page.nextCursor.length <= 512 && /^[A-Za-z0-9_-]+$/.test(page.nextCursor))) ||
    (page.nextCursor !== null && (page.interviews.length !== 20 || page.nextCursor === cursor))) {
    throw new Error('Invalid history page')
  }
  return { interviews: page.interviews, nextCursor: typeof page.nextCursor === 'string' ? page.nextCursor : null }
}

export function useFullInterviewHistory() {
  const router = useRouter()
  const [state, setState] = useState<HistoryState>(INITIAL)
  const snapshot = useRef(state)
  const active = useRef<AbortController | null>(null)
  const mounted = useRef(false)
  const unauthorized = useRef(false)
  const update = useCallback((next: HistoryState) => {
    snapshot.current = next
    setState(next)
  }, [])

  const load = useCallback(async (append: boolean) => {
    if (!mounted.current || active.current || unauthorized.current) return
    const previous = snapshot.current
    const cursor = append ? previous.nextCursor : null
    if (append && (previous.status !== 'ready' || !cursor)) return
    const controller = new AbortController()
    active.current = controller
    update(append ? { ...previous, more: 'loading' } : INITIAL)
    const current = () => mounted.current && active.current === controller && !controller.signal.aborted
    try {
      const url = '/api/interviews?limit=20' + (cursor ? `&cursor=${encodeURIComponent(cursor)}` : '')
      const response = await fetch(url, { cache: 'no-store', signal: controller.signal })
      if (!current()) return
      if (response.status === 401) {
        unauthorized.current = true
        update(INITIAL)
        router.replace(AUTH_ROUTES.login)
        return
      }
      if (!response.ok) throw new Error('History request failed')
      const payload: unknown = await response.json()
      const page = parsePage(payload, cursor)
      if (!current()) return
      const unique = new Map((append ? previous.interviews : []).map(item => [item.id, item]))
      page.interviews.forEach(item => { if (!unique.has(item.id)) unique.set(item.id, item) })
      update({ status: 'ready', interviews: Array.from(unique.values()), nextCursor: page.nextCursor, more: 'idle' })
    } catch {
      if (current()) update(append ? { ...previous, more: 'error' } : { ...INITIAL, status: 'error' })
    } finally {
      if (active.current === controller) active.current = null
    }
  }, [router, update])

  useEffect(() => {
    mounted.current = true
    unauthorized.current = false
    void load(false)
    return () => {
      mounted.current = false
      active.current?.abort()
      active.current = null
    }
  }, [load])

  return { state, retry: () => { void load(false) }, loadMore: () => { void load(true) } }
}
