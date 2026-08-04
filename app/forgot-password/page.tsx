import AuthShell from '@/components/auth/AuthShell'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'
import { AUTH_ROUTES } from '@/lib/auth/auth-constants'

export default function ForgotPasswordPage() {
  return (
    <AuthShell backHref={AUTH_ROUTES.login} backLabel="Back to Sign In" centered>
      <ForgotPasswordForm />
    </AuthShell>
  )
}
