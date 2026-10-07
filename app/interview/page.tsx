import { redirect } from 'next/navigation'
import LiveInterviewClient from '@/components/interview/LiveInterviewClient'
import { AUTH_ROUTES } from '@/lib/auth/auth-constants'
import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
import { interviewSetupKey, parseInterviewSetupInput } from '@/lib/interviews/interview-setup-input'
import type { InterviewSearchParams } from '@/lib/interviews/interview-setup-input'

export default async function InterviewPage({ searchParams }: { searchParams: InterviewSearchParams }) {
  const auth = await getAuthenticatedUser()
  if (auth.status !== 'authenticated') redirect(AUTH_ROUTES.login)
  const config = parseInterviewSetupInput(searchParams)
  if (!config) redirect('/interview/setup')
  return <LiveInterviewClient key={interviewSetupKey(config)} config={config} />
}
