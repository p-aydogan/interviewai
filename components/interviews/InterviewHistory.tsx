'use client'

import Link from 'next/link'
import { useContext } from 'react'
import { DashboardLanguageContext } from '@/components/dashboard/DashboardLayout'
import { EmptyState, SectionHeader, TalentryButton } from '@/components/ui'
import { INTERVIEWS_COPY } from './interviews-copy'
import InterviewHistoryRow from './InterviewHistoryRow'
import { useFullInterviewHistory } from './useFullInterviewHistory'

export default function InterviewHistory() {
  const language = useContext(DashboardLanguageContext)
  const copy = INTERVIEWS_COPY[language]
  const { state, retry, loadMore } = useFullInterviewHistory()
  const start = <Link className="talentry-button talentry-button--primary talentry-button--medium talentry-interviews-action"
    href="/interview/setup">{copy.start}</Link>
  return (
    <div className="talentry-interviews-content">
      <SectionHeader headingAs="h1" title={copy.title} description={copy.intro} action={start} />
      {state.status === 'loading' && <p role="status" aria-live="polite" aria-busy="true">{copy.loading}</p>}
      {state.status === 'error' && <EmptyState title={copy.error} role="alert"
        action={<TalentryButton onClick={retry}>{copy.retry}</TalentryButton>} />}
      {state.status === 'ready' && !state.interviews.length &&
        <EmptyState title={copy.empty} description={copy.emptyHelp} action={start} />}
      {state.status === 'ready' && state.interviews.length > 0 && <>
        <ul className="talentry-history-list">
          {state.interviews.map(interview => <InterviewHistoryRow key={interview.id} interview={interview} language={language} />)}
        </ul>
        <div className="talentry-interviews-pagination">
          <p role="status" aria-live="polite" aria-busy={state.more === 'loading'}>
            {state.more === 'loading' ? copy.loadingMore : ''}
          </p>
          {state.more === 'error' && <p role="alert">{copy.moreError}</p>}
          {state.nextCursor && <TalentryButton className="talentry-interviews-action"
            aria-disabled={state.more === 'loading'} onClick={loadMore}>
            {state.more === 'error' ? copy.retryMore : copy.more}
          </TalentryButton>}
        </div>
      </>}
    </div>
  )
}
