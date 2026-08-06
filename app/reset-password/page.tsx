import AuthShell from '@/components/auth/AuthShell'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm'
import { AUTH_ROUTES } from '@/lib/auth/auth-constants'

export default function ResetPasswordPage() {
  return (
    <AuthShell
      backHref={AUTH_ROUTES.forgotPassword}
      backLabel="Back to Forgot Password"
      centered
    >
      <ResetPasswordForm />
    </AuthShell>
  )
}
