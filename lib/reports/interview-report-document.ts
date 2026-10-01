import 'server-only'
import type { jsPDF } from 'jspdf'
import type { InterviewDetail } from '@/lib/interviews/read-owned-interview'
import type { AppLanguage } from '@/types/auth'
import { RESULT_COPY } from '@/components/result/result-copy'
import { reportStyles } from './interview-report-styles'
import { reportFlow } from './interview-report-flow'

export function buildInterviewReport(doc: jsPDF, interview: InterviewDetail, language: AppLanguage) {
  const copy = RESULT_COPY[language]
  const style = reportStyles()
  const flow = reportFlow(doc, style)
  const value = (text: string) => text.trim() ? text : copy.notProvided
  const heading = (text: string) => {
    flow.gap(style.sectionGap)
    flow.text(text, { size: style.heading, weight: 600, color: style.navy, keepNext: true })
  }
  const label = (text: string) => {
    flow.gap(style.labelGap)
    flow.text(text, { weight: 600, color: style.secondary, after: 0, keepNext: true })
  }
  const date = new Date(interview.createdAt).toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC')
  const duration = `${Math.floor(interview.durationSeconds / 60)}:${String(interview.durationSeconds % 60).padStart(2, '0')}`
  doc.setProperties({ title: `Talentry - ${copy.pdf.title}`, author: 'Talentry' })
  doc.setLanguage(language)
  flow.text('Talentry', { weight: 600, color: style.primary })
  flow.text(copy.pdf.title, { size: style.title, weight: 600, color: style.navy })
  flow.text(`${copy.pdf.reference}: ${interview.id}`, { size: style.small, color: style.secondary })
  heading(copy.score)
  flow.text(`${interview.score} / 100`, { size: style.score, weight: 600, color: style.navy })
  heading(copy.summary)
  flow.text(interview.summary.trim() ? interview.summary : copy.emptySummary)
  heading(copy.details)
  for (const [name, text] of [
    [copy.date, date], [copy.role, interview.role], [copy.company, interview.company],
    [copy.level, interview.level], [copy.interviewType, interview.interviewType],
    [copy.language, interview.language], [copy.persona, interview.persona], [copy.duration, duration],
  ]) flow.text(`${name}: ${value(text)}`)
  heading(copy.transcript)
  if (interview.answers.length === 0) flow.text(copy.emptyAnswers)
  interview.answers.forEach((answer, index) => {
    label(`${copy.question} ${index + 1}`)
    flow.text(value(answer.q))
    label(copy.answer)
    flow.text(value(answer.a))
  })
  flow.footer(copy.pdf.page)
}
