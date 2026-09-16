import Link from 'next/link'
import { EmptyState, TalentryBadge, TalentryButton } from '@/components/ui'
import type { AppLanguage } from '@/types/auth'
import type { DashboardCopy } from './dashboard-copy'
import { historyLabel, INTERVIEW_LANGUAGES } from './dashboard-copy'
import type { HistoryState } from './useInterviewHistory'

interface RecentInterviewsProps {
  state: HistoryState
  retry: () => void
  copy: DashboardCopy
  language: AppLanguage
}

export default function RecentInterviews({ state, retry, copy, language }: RecentInterviewsProps) {
  if (state.status === 'loading') {
    return <p className="talentry-history-status" role="status" aria-busy="true">{copy.loading}</p>
  }
  if (state.status === 'empty') {
    return <EmptyState variant="compact" headingAs="h3" title={copy.empty} description={copy.emptyHelp}
      action={<Link className="talentry-button talentry-button--primary talentry-button--medium talentry-history-action"
        href="/interview/setup">{copy.first}</Link>} />
  }
  if (state.status === 'error') {
    return <EmptyState variant="compact" headingAs="h3" role="alert" title={copy.error} description={copy.errorHelp}
      action={<TalentryButton onClick={retry}>{copy.retry}</TalentryButton>} />
  }
  if (state.status !== 'success') return null

  const dateFormat = new Intl.DateTimeFormat(language, { dateStyle: 'medium', timeStyle: 'short' })
  return (
    <ul className="talentry-history-list">
      {state.interviews.map(interview => {
        const role = interview.role.trim() ? interview.role : copy.notProvided
        const date = dateFormat.format(new Date(interview.createdAt))
        const duration = `${Math.floor(interview.durationSeconds / 60)}:${String(interview.durationSeconds % 60).padStart(2, '0')}`
        return (
          <li key={interview.id}>
            <Link className="talentry-history-row" href={`/result/${encodeURIComponent(interview.id)}`}
              aria-label={`${copy.viewResult}: ${role}, ${date}, ${copy.score} ${interview.score}/100`}>
              <div className="talentry-history-heading">
                <div className="talentry-history-role">
                  <strong dir="auto">{role}</strong>
                  {interview.company.trim() && <span dir="auto">{interview.company}</span>}
                </div>
                <TalentryBadge tone="primary">{copy.score} {interview.score}/100</TalentryBadge>
              </div>
              <div className="talentry-history-meta">
                <time dateTime={interview.createdAt}>{date}</time>
                <span dir="auto">{historyLabel(copy.interviewTypes, interview.interviewType)}</span>
                <span dir="auto">{historyLabel(INTERVIEW_LANGUAGES, interview.language)}</span>
                <span>{copy.duration} {duration}</span>
              </div>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
