import Link from 'next/link'
import { TalentryBadge } from '@/components/ui'
import { DASHBOARD_COPY, historyLabel, INTERVIEW_LANGUAGES } from '@/components/dashboard/dashboard-copy'
import type { AppLanguage } from '@/types/auth'
import type { InterviewListItem } from '@/types/interviews'

export default function InterviewHistoryRow({ interview, language }: {
  interview: InterviewListItem; language: AppLanguage
}) {
  const copy = DASHBOARD_COPY[language]
  const role = interview.role.trim() ? interview.role : copy.notProvided
  const date = new Intl.DateTimeFormat(language, { dateStyle: 'medium', timeStyle: 'short' })
    .format(new Date(interview.createdAt))
  const duration = `${Math.floor(interview.durationSeconds / 60)}:${String(interview.durationSeconds % 60).padStart(2, '0')}`
  return (
    <li>
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
}
