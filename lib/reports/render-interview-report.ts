import 'server-only'
import { join } from 'node:path'
import { readFileSync } from 'node:fs'
import { jsPDF } from 'jspdf'
import type { InterviewDetail } from '@/lib/interviews/read-owned-interview'
import type { AppLanguage } from '@/types/auth'
import { buildInterviewReport } from './interview-report-document'

// Cache immutable bytes only; every document owns its font registration/subsets.
let fonts: readonly string[] | undefined

export function reportFilename(interview: Pick<InterviewDetail, 'id' | 'createdAt'>) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(interview.id)) {
    throw new Error('Invalid report reference')
  }
  return `interview-report_${new Date(interview.createdAt).toISOString().slice(0, 10)}_${interview.id}.pdf`
}

export async function renderInterviewReport(interview: InterviewDetail, language: AppLanguage): Promise<Buffer> {
  reportFilename(interview)
  if (!Number.isInteger(interview.score) || interview.score < 0 || interview.score > 100 ||
      !Number.isInteger(interview.durationSeconds) || interview.durationSeconds < 0) {
    throw new Error('Invalid persisted report numbers')
  }
  if (!['tr', 'en', 'de'].includes(language)) throw new Error('Invalid report language')
  fonts ??= ['Inter-Regular.ttf', 'Inter-SemiBold.ttf'].map(file =>
    readFileSync(join(process.cwd(), 'assets/fonts', file)).toString('base64'))
  const doc = new jsPDF({ unit: 'pt', format: 'a4', putOnlyUsedFonts: true, compress: true })
  fonts.forEach((data, index) => {
    const file = index === 0 ? 'Inter-Regular.ttf' : 'Inter-SemiBold.ttf'
    doc.addFileToVFS(file, data)
    doc.addFont(file, 'Inter', 'normal', index === 0 ? 400 : 600)
  })
  buildInterviewReport(doc, interview, language)
  return Buffer.from(doc.output('arraybuffer'))
}
