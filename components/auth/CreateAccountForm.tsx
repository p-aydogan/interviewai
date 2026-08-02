'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'

import { SectionHeader, TalentryButton, TalentryCard } from '@/components/ui'

import PasswordRequirements, { getPasswordRequirementStatus } from './PasswordRequirements'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function CreateAccountForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const emailIsValid = EMAIL_PATTERN.test(email)
  const passwordStatus = getPasswordRequirementStatus(password)
  const passwordIsValid =
    passwordStatus.minimumLength &&
    passwordStatus.uppercase &&
    passwordStatus.lowercase &&
    passwordStatus.number
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword
  const formIsValid = emailIsValid && passwordIsValid && passwordsMatch

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
  }

  return (
    <TalentryCard className="talentry-create-account" padding="standard">
      <SectionHeader
        description="Create your account to continue."
        headingAs="h1"
        title="Create Account"
      />

      <form className="talentry-create-account__form" noValidate onSubmit={handleSubmit}>
        <div className="talentry-auth-field">
          <label htmlFor="register-email">Email</label>
          <div className="talentry-auth-input-control">
            <span className="talentry-auth-input-control__icon" aria-hidden="true">@</span>
            <input
              aria-describedby={email && !emailIsValid ? 'register-email-error' : undefined}
              aria-invalid={email.length > 0 && !emailIsValid}
              autoComplete="email"
              id="register-email"
              inputMode="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              type="email"
              value={email}
            />
          </div>
          {email && !emailIsValid && (
            <p className="talentry-auth-field__message talentry-auth-field__message--error" id="register-email-error">
              <span aria-hidden="true">!</span> Enter a valid email address.
            </p>
          )}
        </div>

        <div className="talentry-auth-field">
          <label htmlFor="register-password">Password</label>
          <div className="talentry-auth-input-control talentry-auth-password-control">
            <span className="talentry-auth-input-control__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M7 10V8a5 5 0 0 1 10 0v2" />
                <rect height="10" rx="2" width="16" x="4" y="10" />
              </svg>
            </span>
            <input
              aria-describedby="password-requirements"
              aria-invalid={password.length > 0 && !passwordIsValid}
              autoComplete="new-password"
              id="register-password"
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
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" />
                <circle cx="12" cy="12" r="2.5" />
                {showPassword && <path d="m4 4 16 16" />}
              </svg>
            </button>
          </div>
          <PasswordRequirements password={password} />
        </div>

        <div className="talentry-auth-field">
          <label htmlFor="register-confirm-password">Confirm Password</label>
          <div className="talentry-auth-input-control talentry-auth-password-control">
            <span className="talentry-auth-input-control__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M7 10V8a5 5 0 0 1 10 0v2" />
                <rect height="10" rx="2" width="16" x="4" y="10" />
              </svg>
            </span>
            <input
              aria-describedby={confirmPassword ? 'confirm-password-message' : undefined}
              aria-invalid={confirmPassword.length > 0 && !passwordsMatch}
              autoComplete="new-password"
              id="register-confirm-password"
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
            />
            <button
              aria-label={showConfirmPassword ? 'Hide confirmed password' : 'Show confirmed password'}
              className="talentry-auth-password-toggle"
              onClick={() => setShowConfirmPassword((visible) => !visible)}
              type="button"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9 6-9-6-9-6Z" />
                <circle cx="12" cy="12" r="2.5" />
                {showConfirmPassword && <path d="m4 4 16 16" />}
              </svg>
            </button>
          </div>
          {confirmPassword && (
            <p
              className={`talentry-auth-field__message ${
                passwordsMatch
                  ? 'talentry-auth-field__message--success'
                  : 'talentry-auth-field__message--error'
              }`}
              id="confirm-password-message"
            >
              <span aria-hidden="true">{passwordsMatch ? '✓' : '!'}</span>{' '}
              {passwordsMatch ? 'Passwords match.' : 'Passwords do not match.'}
            </p>
          )}
        </div>

        <TalentryButton
          className="talentry-create-account__submit"
          disabled={!formIsValid}
          size="large"
          type="submit"
        >
          <span>Create Account</span>
          <span aria-hidden="true">→</span>
        </TalentryButton>
      </form>
    </TalentryCard>
  )
}
