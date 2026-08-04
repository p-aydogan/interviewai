'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'

import { SectionHeader, TalentryButton, TalentryCard } from '@/components/ui'

const EMAIL_ERROR_ID = 'forgot-password-email-error'
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isValidEmail(value: string) {
  return EMAIL_PATTERN.test(value.trim())
}

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [emailWasBlurred, setEmailWasBlurred] = useState(false)

  const trimmedEmail = email.trim()
  const emailIsValid = isValidEmail(email)
  const showEmailError = emailWasBlurred && trimmedEmail.length > 0 && !emailIsValid

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
  }

  return (
    <TalentryCard
      className="talentry-create-account talentry-forgot-password-card"
      padding="standard"
    >
      <SectionHeader
        description="Enter the email associated with your account and we’ll send you a verification code."
        headingAs="h1"
        title="Forgot your password?"
      />

      <form className="talentry-create-account__form" noValidate onSubmit={handleSubmit}>
        <div className="talentry-auth-field">
          <label htmlFor="forgot-password-email">Email</label>
          <div className="talentry-auth-input-control">
            <span className="talentry-auth-input-control__icon" aria-hidden="true">@</span>
            <input
              aria-describedby={showEmailError ? EMAIL_ERROR_ID : undefined}
              aria-invalid={showEmailError || undefined}
              autoComplete="email"
              id="forgot-password-email"
              inputMode="email"
              onBlur={() => setEmailWasBlurred(true)}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              type="email"
              value={email}
            />
          </div>
          {showEmailError && (
            <p
              className="talentry-auth-field__message talentry-auth-field__message--error"
              id={EMAIL_ERROR_ID}
            >
              <span aria-hidden="true">!</span> Enter a valid email address.
            </p>
          )}
        </div>

        <TalentryButton
          className="talentry-create-account__submit"
          disabled={!emailIsValid}
          size="large"
          type="submit"
        >
          <span>Send reset code</span>
          <span aria-hidden="true">→</span>
        </TalentryButton>
      </form>
    </TalentryCard>
  )
}
