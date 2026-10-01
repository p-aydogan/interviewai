'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TalentryButton } from '@/components/ui'
import { AUTH_ROUTES } from '@/lib/auth/auth-constants'
import type { ResultCopy } from './result-copy'
import styles from '@/app/result/result.module.css'

type DownloadState = 'idle' | 'generating' | 'started' | 'unavailable' | 'error'

export default function ResultPdfDownload({ interviewId, copy }: {
  interviewId: string; copy: ResultCopy['pdf']
}) {
  const router = useRouter()
  const [state, setState] = useState<DownloadState>('idle')
  const active = useRef<AbortController | null>(null)
  const mounted = useRef(false)
  const urls = useRef(new Map<string, ReturnType<typeof setTimeout>>())

  useEffect(() => {
    mounted.current = true
    setState('idle')
    return () => {
      mounted.current = false
      active.current?.abort()
      active.current = null
      urls.current.forEach((timer, url) => { clearTimeout(timer); URL.revokeObjectURL(url) })
      urls.current.clear()
    }
  }, [interviewId])

  async function download() {
    if (!mounted.current || active.current) return
    const controller = new AbortController()
    active.current = controller
    const current = () => mounted.current && active.current === controller && !controller.signal.aborted
    setState('generating')
    try {
      const response = await fetch(`/api/interviews/${encodeURIComponent(interviewId)}/pdf`, {
        credentials: 'same-origin', cache: 'no-store', signal: controller.signal,
      })
      if (!current()) return
      if (response.status === 401) { setState('idle'); router.replace(AUTH_ROUTES.login); return }
      if (response.status === 400 || response.status === 404) { setState('unavailable'); return }
      if (!response.ok || response.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/pdf') {
        throw new Error('Invalid PDF response')
      }
      const filename = response.headers.get('Content-Disposition')?.match(
        /^attachment; filename="(interview-report_\d{4}-\d{2}-\d{2}_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.pdf)"$/i,
      )?.[1]
      if (!filename || !filename.toLowerCase().endsWith(`_${interviewId.toLowerCase()}.pdf`)) throw new Error('Invalid PDF filename')
      const blob = await response.blob()
      if (!current()) return
      if (!blob.size) throw new Error('Empty PDF')
      const url = URL.createObjectURL(blob)
      urls.current.set(url, setTimeout(() => { URL.revokeObjectURL(url); urls.current.delete(url) }, 30_000))
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = filename
      document.body.appendChild(anchor)
      try { anchor.click() } finally { anchor.remove() }
      setState('started')
    } catch {
      if (current()) setState('error')
    } finally {
      if (active.current === controller) active.current = null
    }
  }

  const error = state === 'error' || state === 'unavailable'
  return (
    <div className={styles.pdfDownload}>
      <TalentryButton variant="secondary" loading={state === 'generating'} loadingText={copy.generating} onClick={download}>
        {copy.download}
      </TalentryButton>
      <p className={styles.pdfStatus} role="status" aria-live="polite">
        {state === 'generating' ? copy.generating : state === 'started' ? copy.started : ''}
      </p>
      {error && <p className={styles.pdfError} role="alert">{copy[state]}</p>}
    </div>
  )
}
