'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { SectionHeader, TalentryButton, TalentryCard } from '@/components/ui'
import { AUTH_ROUTES } from '@/lib/auth/auth-constants'
import { createClient } from '@/lib/supabase'
import PasswordVisibilityIcon from './PasswordVisibilityIcon'
const EMAIL_ERROR_ID = 'sign-in-email-error'
const PROVIDER_ERROR_ID = 'sign-in-provider-error'
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export default function SignInForm() {
  const router = useRouter()
  const [supabase] = useState(createClient)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailWasBlurred, setEmailWasBlurred] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [providerError, setProviderError] = useState('')
  const trimmedEmail = email.trim()
  const emailIsValid = EMAIL_PATTERN.test(trimmedEmail)
  const showEmailError = emailWasBlurred && trimmedEmail.length > 0 && !emailIsValid
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!emailIsValid || !password || isPending) return
    setIsPending(true)
    setProviderError('')
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      })
      if (error) {
        setProviderError('We couldn\'t sign you in. Check your email and password and try again.')
        setIsPending(false)
        return
      }
      router.replace(AUTH_ROUTES.dashboard)
    } catch {
      setProviderError('We couldn\'t reach the sign-in service. Please try again.')
      setIsPending(false)
    }
  }
  return (
    <TalentryCard className="talentry-create-account talentry-forgot-password-card" padding="standard">
      <SectionHeader
        description="Sign in to continue your career journey."
        headingAs="h1"
        title="Welcome back"
      />
      <form
        aria-describedby={providerError ? PROVIDER_ERROR_ID : undefined}
        className="talentry-create-account__form"
        noValidate
        onSubmit={handleSubmit}
      >
        <div className="talentry-auth-field">
          <label htmlFor="sign-in-email">Email</label>
          <div className="talentry-auth-input-control">
            <span className="talentry-auth-input-control__icon" aria-hidden="true">@</span>
            <input
              aria-describedby={showEmailError ? EMAIL_ERROR_ID : undefined}
              aria-invalid={showEmailError || undefined}
              autoComplete="email"
              id="sign-in-email"
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
        <div className="talentry-auth-field">
          <label htmlFor="sign-in-password">Password</label>
          <div className="talentry-auth-input-control talentry-auth-password-control">
            <span className="talentry-auth-input-control__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M7 10V8a5 5 0 0 1 10 0v2" />
                <rect height="10" rx="2" width="16" x="4" y="10" />
              </svg>
            </span>
            <input
              autoComplete="current-password"
              id="sign-in-password"
              onChange={(event) => setPassword(event.target.value)}
              required
              type={showPassword ? 'text' : 'password'}
              value={password}
            />
            <button
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="talentry-auth-password-toggle"
              onClick={() => setShowPassword((visible) => !visible)}
              type="button"
            >
              <PasswordVisibilityIcon visible={showPassword} />
            </button>
          </div>
        </div>
        <Link
          className="talentry-sign-in__link talentry-sign-in__forgot-link"
          href={AUTH_ROUTES.forgotPassword}
        >
          Forgot password?
        </Link>
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
          disabled={!emailIsValid || !password || isPending}
          loading={isPending}
          loadingText="Signing in..."
          size="large"
          type="submit"
        >
          <span>Sign In</span>
          <span aria-hidden="true">→</span>
        </TalentryButton>
        <p className="talentry-sign-in__secondary-action">
          New to Talentry?{' '}
          <Link className="talentry-sign-in__link" href={AUTH_ROUTES.register}>
            Create Account
          </Link>
        </p>
      </form>
    </TalentryCard>
  )
}
