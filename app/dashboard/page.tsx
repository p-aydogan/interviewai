import { redirect } from 'next/navigation'

import DashboardContainer from '@/components/dashboard/DashboardContainer'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { AUTH_ROUTES } from '@/lib/auth/auth-constants'
import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'

export default async function DashboardPage() {
  const auth = await getAuthenticatedUser()

  if (auth.status === 'unauthorized') {
    redirect(AUTH_ROUTES.login)
  }

  return (
    <DashboardLayout>
      <DashboardContainer />
    </DashboardLayout>
  )
}
