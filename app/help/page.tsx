import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import AccountPageContent from '@/components/account/AccountPageContent'
import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
import { projectUserIdentity } from '@/lib/auth/user-identity'
import { AUTH_ROUTES } from '@/lib/auth/auth-constants'

export default async function AccountPage() {
  const auth = await getAuthenticatedUser()
  if (auth.status === 'unauthorized') redirect(AUTH_ROUTES.login)
  const identity = projectUserIdentity(auth.user)
  return <DashboardLayout identity={identity} accountPage>
    <AccountPageContent page="help" identity={identity} />
  </DashboardLayout>
}
