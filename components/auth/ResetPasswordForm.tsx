'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'

import { SectionHeader, TalentryButton, TalentryCard } from '@/components/ui'

import PasswordRequirements, { getPasswordRequirementStatus } from './PasswordRequirements'
import PasswordVisibilityIcon from './PasswordVisibilityIcon'

const CONFIRM_PASSWORD_ERROR_ID = 'reset-password-confirm-error'

export default function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [confirmPasswordWasBlurred, setConfirmPasswordWasBlurred] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const passwordStatus = getPasswordRequirementStatus(password)
  const passwordIsValid =
    passwordStatus.minimumLength &&
    passwordStatus.uppercase &&
    passwordStatus.lowercase &&
    passwordStatus.number
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword
  const showMismatch =
    confirmPasswordWasBlurred && confirmPassword.length > 0 && !passwordsMatch

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
  }

  return (
    <TalentryCard
      className="talentry-create-account talentry-forgot-password-card"
      padding="standard"
    >
      <SectionHeader
        description="Choose a strong password for your account."
        headingAs="h1"
        title="Create a new password"
      />

      <form className="talentry-create-account__form" noValidate onSubmit={handleSubmit}>
        <div className="talentry-auth-field">
          <label htmlFor="reset-password-new">New password</label>
          <div className="talentry-auth-input-control talentry-auth-password-control">
            <span className="talentry-auth-input-control__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M7 10V8a5 5 0 0 1 10 0v2" />
                <rect height="10" rx="2" width="16" x="4" y="10" />
              </svg>
            </span>
            <input
              aria-describedby="password-requirements"
              autoComplete="new-password"
              id="reset-password-new"
              onChange={(event) => setPassword(event.target.value)}
              required
              type={showPassword ? 'text' : 'password'}
              value={password}
            />
            <button
              aria-label={showPassword ? 'Hide new password' : 'Show new password'}
              className="talentry-auth-password-toggle"
              onClick={() => setShowPassword((visible) => !visible)}
              type="button"
            >
              <PasswordVisibilityIcon visible={showPassword} />
            </button>
          </div>
          <PasswordRequirements password={password} />
        </div>

        <div className="talentry-auth-field">
          <label htmlFor="reset-password-confirm">Confirm new password</label>
          <div className="talentry-auth-input-control talentry-auth-password-control">
            <span className="talentry-auth-input-control__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M7 10V8a5 5 0 0 1 10 0v2" />
                <rect height="10" rx="2" width="16" x="4" y="10" />
              </svg>
            </span>
            <input
              aria-describedby={showMismatch ? CONFIRM_PASSWORD_ERROR_ID : undefined}
              aria-invalid={showMismatch || undefined}
              autoComplete="new-password"
              id="reset-password-confirm"
              onBlur={() => setConfirmPasswordWasBlurred(true)}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
            />
            <button
              aria-label={
                showConfirmPassword
                  ? 'Hide confirmed new password'
                  : 'Show confirmed new password'
              }
              className="talentry-auth-password-toggle"
              onClick={() => setShowConfirmPassword((visible) => !visible)}
              type="button"
            >
              <PasswordVisibilityIcon visible={showConfirmPassword} />
            </button>
          </div>
          {showMismatch && (
            <p
              className="talentry-auth-field__message talentry-auth-field__message--error"
              id={CONFIRM_PASSWORD_ERROR_ID}
            >
              <span aria-hidden="true">!</span> Passwords do not match.
            </p>
          )}
        </div>

        <TalentryButton
          className="talentry-create-account__submit"
          disabled={!passwordIsValid || !passwordsMatch}
          size="large"
          type="submit"
        >
          <span>Reset password</span>
          <span aria-hidden="true">→</span>
        </TalentryButton>
      </form>
    </TalentryCard>
  )
}
