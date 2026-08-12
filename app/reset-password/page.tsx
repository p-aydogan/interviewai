import AuthShell from '@/components/auth/AuthShell'
import PasswordRecoveryFlow from '@/components/auth/PasswordRecoveryFlow'

export default function ResetPasswordPage() {
  return (
    <AuthShell centered>
      <PasswordRecoveryFlow />
    </AuthShell>
  )
}
