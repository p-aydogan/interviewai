import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import InterviewHistory from '@/components/interviews/InterviewHistory'
import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
import { AUTH_ROUTES } from '@/lib/auth/auth-constants'

export default async function InterviewsPage() {
  const auth = await getAuthenticatedUser()
  if (auth.status === 'unauthorized') redirect(AUTH_ROUTES.login)
  return <DashboardLayout history><InterviewHistory /></DashboardLayout>
}
