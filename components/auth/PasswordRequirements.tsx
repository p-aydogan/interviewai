import { PASSWORD_MIN_LENGTH } from '@/lib/auth/auth-constants'

export interface PasswordRequirementsProps {
  password: string
}

export function getPasswordRequirementStatus(password: string) {
  return {
    minimumLength: password.length >= PASSWORD_MIN_LENGTH,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    specialCharacter: /[^A-Za-z0-9]/.test(password),
  }
}

export default function PasswordRequirements({ password }: PasswordRequirementsProps) {
  const status = getPasswordRequirementStatus(password)
  const requirements = [
    { label: `At least ${PASSWORD_MIN_LENGTH} characters`, met: status.minimumLength },
    { label: 'At least one uppercase letter', met: status.uppercase },
    { label: 'At least one lowercase letter', met: status.lowercase },
    { label: 'At least one number', met: status.number },
  ]

  return (
    <div className="talentry-password-requirements" id="password-requirements" aria-live="polite">
      <p className="talentry-password-requirements__title">Password requirements</p>
      <ul className="talentry-password-requirements__list">
        {requirements.map(({ label, met }) => (
          <li className={met ? 'talentry-password-requirement--met' : undefined} key={label}>
            <span aria-hidden="true">{met ? '✓' : '○'}</span>
            <span>{label}</span>
          </li>
        ))}
        <li className={status.specialCharacter ? 'talentry-password-requirement--met' : undefined}>
          <span aria-hidden="true">{status.specialCharacter ? '✓' : '○'}</span>
          <span>Special character <strong>recommended</strong></span>
        </li>
      </ul>
    </div>
  )
}
