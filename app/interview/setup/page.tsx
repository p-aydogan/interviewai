import { redirect } from 'next/navigation'

import InterviewSetupForm from '@/components/interview/InterviewSetupForm'
import { AUTH_ROUTES } from '@/lib/auth/auth-constants'
import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'

import '@/styles/talentry-interview-setup.css'

export default async function InterviewSetupPage() {
  const auth = await getAuthenticatedUser()

  if (auth.status === 'unauthorized') {
    redirect(AUTH_ROUTES.login)
  }

  return <InterviewSetupForm />
}
