'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AUTH_ROUTES } from '@/lib/auth/auth-constants'

export type InterviewDeletionState = {
  confirming: boolean
  deleting: boolean
  error: 'failed' | 'unavailable' | null
}

export function useInterviewDeletion(id: string) {
  const router = useRouter()
  const [state, setState] = useState<InterviewDeletionState>({ confirming: false, deleting: false, error: null })
  const confirming = useRef(false)
  const active = useRef<AbortController | null>(null)
  const mounted = useRef(false)
  const terminal = useRef(false)

  useEffect(() => {
    mounted.current = true
    terminal.current = false
    confirming.current = false
    setState({ confirming: false, deleting: false, error: null })
    return () => {
      mounted.current = false
      active.current?.abort()
      active.current = null
    }
  }, [id])

  function open() {
    if (!mounted.current || active.current || terminal.current) return
    confirming.current = true
    setState({ confirming: true, deleting: false, error: null })
  }

  function cancel() {
    if (!mounted.current || active.current || terminal.current) return
    confirming.current = false
    setState({ confirming: false, deleting: false, error: null })
  }

  async function confirm() {
    if (!mounted.current || !confirming.current || active.current || terminal.current) return
    const controller = new AbortController()
    active.current = controller
    const current = () => mounted.current && active.current === controller && !controller.signal.aborted
    setState({ confirming: true, deleting: true, error: null })
    try {
      const response = await fetch(`/api/interviews/${encodeURIComponent(id)}`, {
        method: 'DELETE', credentials: 'same-origin', cache: 'no-store', signal: controller.signal,
      })
      if (!current()) return
      if (response.status === 401) {
        terminal.current = true
        router.replace(AUTH_ROUTES.login)
        return
      }
      if (response.status === 400 || response.status === 404) {
        terminal.current = true
        setState({ confirming: true, deleting: false, error: 'unavailable' })
        return
      }
      if (!response.ok) throw new Error('Delete failed')
      const payload: unknown = await response.json()
      if (!current()) return
      if (!payload || typeof payload !== 'object' || !('deleted' in payload) || payload.deleted !== true) {
        throw new Error('Invalid deletion response')
      }
      terminal.current = true
      router.replace('/interviews')
    } catch {
      if (current()) setState({ confirming: true, deleting: false, error: 'failed' })
    } finally {
      if (active.current === controller) active.current = null
    }
  }

  return { state, open, cancel, confirm }
}
