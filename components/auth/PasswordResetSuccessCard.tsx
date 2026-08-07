import Link from 'next/link'

import { SectionHeader, TalentryCard } from '@/components/ui'
import { AUTH_ROUTES } from '@/lib/auth/auth-constants'

function SuccessIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="1em"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="1em"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.25 2.25L15.75 9" />
    </svg>
  )
}

export default function PasswordResetSuccessCard() {
  return (
    <TalentryCard
      className="talentry-create-account talentry-forgot-password-card talentry-empty-state talentry-empty-state--compact"
      padding="standard"
    >
      <div className="talentry-empty-state__icon">
        <SuccessIcon />
      </div>

      <SectionHeader
        description={
          <>
            Your password has been updated successfully.
            <br />
            You can now continue to your account.
          </>
        }
        headingAs="h1"
        title="Password updated"
      />

      <div className="talentry-empty-state__action">
        <Link
          className="talentry-button talentry-button--primary talentry-button--large"
          href={AUTH_ROUTES.dashboard}
        >
          <span className="talentry-button__content">Continue to dashboard</span>
        </Link>
      </div>
    </TalentryCard>
  )
}
