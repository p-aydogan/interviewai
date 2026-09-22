import { redirect } from 'next/navigation'
import PreAuthFlow from '@/components/pre-auth/PreAuthFlow'
import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'

export default async function HomePage() {
  const auth = await getAuthenticatedUser()
  if (auth.status === 'authenticated') redirect('/dashboard')
  return <PreAuthFlow />
}
