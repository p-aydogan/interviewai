import { NextResponse } from 'next/server'
import { readOwnedInterview } from '@/lib/interviews/read-owned-interview'
import { SUPPORTED_APP_LANGUAGES } from '@/lib/auth/auth-constants'
import { renderInterviewReport, reportFilename } from '@/lib/reports/render-interview-report'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const headers = { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' }
const errorResponse = (error: string, status: number) => NextResponse.json({ error }, { status, headers })

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const result = await readOwnedInterview(params.id)
    switch (result.status) {
      case 'unauthorized': return errorResponse('Unauthorized', 401)
      case 'invalidId': return errorResponse('Invalid interview id', 400)
      case 'notFound': return errorResponse('Interview not found', 404)
      case 'readError': return errorResponse('Failed to load interview', 500)
    }
    // Legacy query parameters cannot override the owner-scoped persisted language.
    const language = SUPPORTED_APP_LANGUAGES.find(value => value === result.interview.language)
    if (!language) return errorResponse('Failed to generate PDF', 500)
    const buffer = await renderInterviewReport(result.interview, language)
    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: { ...headers, 'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${reportFilename(result.interview)}"` },
    })
  } catch {
    return errorResponse('Failed to generate PDF', 500)
  }
}
