'use client'

import Link from 'next/link'
import { useEffect, useId, useRef } from 'react'
import { TalentryButton } from '@/components/ui'
import type { AppLanguage } from '@/types/auth'
import { INTERVIEW_DELETION_COPY } from './interview-deletion-copy'
import { useInterviewDeletion } from './useInterviewDeletion'
import styles from '@/app/result/result.module.css'

type ResultDeleteInterviewProps = {
  interview: { id: string; role: string; company: string; createdAt: string }
  uiLanguage: AppLanguage
}

export default function ResultDeleteInterview({ interview, uiLanguage }: ResultDeleteInterviewProps) {
  const { state, open, cancel, confirm } = useInterviewDeletion(interview.id)
  const copy = INTERVIEW_DELETION_COPY[uiLanguage]
  const warningId = useId()
  const trigger = useRef<HTMLButtonElement>(null)
  const cancelButton = useRef<HTMLButtonElement>(null)
  const previous = useRef(false)
  useEffect(() => {
    if (state.confirming && !previous.current) cancelButton.current?.focus()
    if (!state.confirming && previous.current) trigger.current?.focus()
    previous.current = state.confirming
  }, [state.confirming])
  const date = new Date(interview.createdAt)
  const identity = [interview.role.trim(), interview.company.trim(),
    Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat(uiLanguage, {
      dateStyle: 'medium', timeStyle: 'short',
    }).format(date)].filter(Boolean).join(' · ')

  return <section className={styles.deletion} aria-label={copy.action}>
    {!state.confirming ? <TalentryButton ref={trigger} variant="danger" onClick={open}>
      {copy.action}
    </TalentryButton> : <>
      <div id={warningId}>
        <p className={styles.deletionIdentity} dir="auto">{identity}</p>
        <p>{copy.warning}</p>
      </div>
      {state.error && <p role="alert">{state.error === 'unavailable' ? copy.unavailable : copy.failed}</p>}
      {state.error === 'unavailable' ?
        <Link href="/interviews" className="talentry-button talentry-button--secondary talentry-button--medium">
          {copy.history}
        </Link> : <div className={styles.deletionActions}>
          <TalentryButton variant="danger" loading={state.deleting} loadingText={copy.deleting}
            aria-describedby={warningId} onClick={() => { void confirm() }}>{copy.confirm}</TalentryButton>
          <TalentryButton ref={cancelButton} variant="secondary" disabled={state.deleting}
            aria-describedby={warningId} onClick={cancel}>{copy.cancel}</TalentryButton>
        </div>}
      <span role="status" aria-live="polite">{state.deleting ? copy.deleting : ''}</span>
    </>}
  </section>
}
