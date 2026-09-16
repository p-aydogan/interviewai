import Link from 'next/link'
import type { ReactNode } from 'react'
import { EmptyState, SectionHeader, TalentryButton, TalentryCard } from '@/components/ui'
import type { AppLanguage } from '@/types/auth'
import type { ResultCopy } from './result-copy'
import styles from '@/app/result/result.module.css'

interface ResultShellProps {
  children: ReactNode
  title: string
  copy: ResultCopy
  uiLanguage: AppLanguage
  mobileReview?: boolean
}

export default function ResultShell({ children, title, copy, uiLanguage, mobileReview = false }: ResultShellProps) {
  return (
    <main className={`${styles.page} ${mobileReview ? styles.mobileReview : ''}`} lang={uiLanguage}>
      <div className={styles.container}>
        <header className={styles.brand} aria-label="Talentry">
          <span className={styles.brandMark} aria-hidden="true">T</span>
          <span>Talentry</span>
        </header>
        <SectionHeader className={styles.heading} headingAs="h1" eyebrow={copy.review} title={title} />
        <div className={styles.content}>{children}</div>
      </div>
    </main>
  )
}

interface ResultStatusProps {
  status: 'loading' | 'unavailable' | 'loadError'
  copy: ResultCopy
  onRetry: () => void
}

export function ResultStatus({ status, copy, onRetry }: ResultStatusProps) {
  if (status === 'loading') {
    return <TalentryCard className={styles.status} role="status" aria-live="polite">{copy.loading}</TalentryCard>
  }

  return (
    <EmptyState
      className={styles.status}
      role="alert"
      title={status === 'unavailable' ? copy.unavailable : copy.loadError}
      description={status === 'unavailable' ? copy.unavailableHelp : copy.loadErrorHelp}
      action={(
        <div className={styles.actions}>
          {status === 'loadError' && <TalentryButton className={styles.action} onClick={onRetry}>{copy.retry}</TalentryButton>}
          <Link className={`talentry-button talentry-button--secondary talentry-button--medium ${styles.action}`} href="/">
            {copy.startAgain}
          </Link>
        </div>
      )}
    />
  )
}
