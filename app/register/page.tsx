import AuthShell from '@/components/auth/AuthShell'
import CreateAccountForm from '@/components/auth/CreateAccountForm'
import { AUTH_ROUTES } from '@/lib/auth/auth-constants'

export default function RegisterPage() {
  return (
    <AuthShell backHref={AUTH_ROUTES.login} backLabel="Back to Sign In">
      <CreateAccountForm />
    </AuthShell>
  )
}
