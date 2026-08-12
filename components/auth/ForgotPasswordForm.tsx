'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { FormEvent } from 'react'

import { SectionHeader, TalentryButton, TalentryCard } from '@/components/ui'
import { AUTH_ROUTES } from '@/lib/auth/auth-constants'
import { createClient } from '@/lib/supabase'

const EMAIL_ERROR_ID = 'forgot-password-email-error'
const PROVIDER_ERROR_ID = 'forgot-password-provider-error'
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isValidEmail(value: string) {
  return EMAIL_PATTERN.test(value.trim())
}

export default function ForgotPasswordForm() {
  const [supabase] = useState(createClient)
  const [email, setEmail] = useState('')
  const [emailWasBlurred, setEmailWasBlurred] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [requestSent, setRequestSent] = useState(false)
  const [providerError, setProviderError] = useState('')

  const trimmedEmail = email.trim()
  const emailIsValid = isValidEmail(email)
  const showEmailError = emailWasBlurred && trimmedEmail.length > 0 && !emailIsValid

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!emailIsValid || isPending) return

    setIsPending(true)
    setProviderError('')

    try {
      const redirectTo = new URL(AUTH_ROUTES.resetPassword, window.location.origin).toString()
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, { redirectTo })

      if (error) {
        setProviderError("We couldn't send the reset link. Please try again.")
        return
      }

      setRequestSent(true)
    } catch {
      setProviderError("We couldn't send the reset link. Please try again.")
    } finally {
      setIsPending(false)
    }
  }

  if (requestSent) {
    return (
      <TalentryCard
        className="talentry-create-account talentry-forgot-password-card talentry-empty-state talentry-empty-state--compact"
        padding="standard"
      >
        <SectionHeader
          description={
            <>
              If an account exists for this email address,
              <br />
              we&apos;ve sent a password reset link.
            </>
          }
          headingAs="h1"
          title="Check your email"
        />

        <div className="talentry-empty-state__action">
          <Link
            className="talentry-button talentry-button--primary talentry-button--large"
            href={AUTH_ROUTES.login}
          >
            <span className="talentry-button__content">Back to Sign In</span>
          </Link>
        </div>
      </TalentryCard>
    )
  }

  return (
    <TalentryCard
      className="talentry-create-account talentry-forgot-password-card"
      padding="standard"
    >
      <SectionHeader
        description="Enter the email associated with your account and we’ll send you a password reset link."
        headingAs="h1"
        title="Forgot your password?"
      />

      <form
        aria-describedby={providerError ? PROVIDER_ERROR_ID : undefined}
        className="talentry-create-account__form"
        noValidate
        onSubmit={handleSubmit}
      >
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

        {providerError && (
          <p
            className="talentry-auth-field__message talentry-auth-field__message--error"
            id={PROVIDER_ERROR_ID}
            role="alert"
          >
            <span aria-hidden="true">!</span> {providerError}
          </p>
        )}

        <TalentryButton
          className="talentry-create-account__submit"
          disabled={!emailIsValid || isPending}
          loading={isPending}
          loadingText="Sending reset link..."
          size="large"
          type="submit"
        >
          <span>Send reset link</span>
          <span aria-hidden="true">→</span>
        </TalentryButton>
      </form>
    </TalentryCard>
  )
}
