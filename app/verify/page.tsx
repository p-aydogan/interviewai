import AuthShell from '@/components/auth/AuthShell'
import OtpVerificationForm from '@/components/auth/OtpVerificationForm'
import { AUTH_ROUTES } from '@/lib/auth/auth-constants'

export default function VerifyPage() {
  return (
    <AuthShell backHref={AUTH_ROUTES.register} backLabel="Back to Create Account" centered>
      <OtpVerificationForm />
    </AuthShell>
  )
}
