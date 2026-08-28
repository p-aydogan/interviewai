'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, ClipboardEvent, FormEvent, KeyboardEvent } from 'react'

import { TalentryButton, TalentryCard, SectionHeader } from '@/components/ui'
import {
  AUTH_ROUTES,
  OTP_LENGTH,
  PENDING_VERIFICATION_EMAIL_KEY,
} from '@/lib/auth/auth-constants'
import { createClient } from '@/lib/supabase'

const COUNTDOWN_SECONDS = 119
const PROVIDER_ERROR_ID = 'otp-provider-error'

export default function OtpVerificationForm() {
  const router = useRouter()
  const [supabase] = useState(createClient)
  const [digits, setDigits] = useState(() => Array<string>(OTP_LENGTH).fill(''))
  const [secondsRemaining, setSecondsRemaining] = useState(COUNTDOWN_SECONDS)
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [providerError, setProviderError] = useState('')
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    const pendingEmail = window.sessionStorage.getItem(PENDING_VERIFICATION_EMAIL_KEY) ?? ''
    setVerificationEmail(pendingEmail)

    if (!pendingEmail) {
      setProviderError(
        "We couldn't identify the email address to verify. Return to Create Account and try again.",
      )
    }
  }, [])

  useEffect(() => {
    if (secondsRemaining === 0) return

    const timer = window.setTimeout(() => {
      setSecondsRemaining((seconds) => Math.max(0, seconds - 1))
    }, 1000)

    return () => window.clearTimeout(timer)
  }, [secondsRemaining])

  const codeIsComplete = digits.every(Boolean)
  const countdown = `${Math.floor(secondsRemaining / 60)
    .toString()
    .padStart(2, '0')}:${(secondsRemaining % 60).toString().padStart(2, '0')}`

  function updateDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1)
    if (verificationEmail) setProviderError('')
    setDigits((current) => current.map((item, position) => (position === index ? digit : item)))

    if (digit && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus()
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    const pastedDigits = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (!pastedDigits) return

    event.preventDefault()
    const nextDigits = Array.from({ length: OTP_LENGTH }, (_, index) => pastedDigits[index] ?? '')
    setDigits(nextDigits)
    inputRefs.current[Math.min(pastedDigits.length, OTP_LENGTH) - 1]?.focus()
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!codeIsComplete || !verificationEmail || isVerifying || isResending) return

    setIsVerifying(true)
    setProviderError('')

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: verificationEmail,
        token: digits.join(''),
        type: 'email',
      })

      if (error || !data.user || !data.session) {
        setProviderError(
          'That verification code is invalid or has expired. Request a new code and try again.',
        )
        setIsVerifying(false)
        return
      }

      window.sessionStorage.removeItem(PENDING_VERIFICATION_EMAIL_KEY)
      router.replace(AUTH_ROUTES.dashboard)
    } catch {
      setProviderError("We couldn't verify the code. Please try again.")
      setIsVerifying(false)
    }
  }

  async function handleResend() {
    if (!verificationEmail || isResending || isVerifying) return

    setIsResending(true)
    setProviderError('')

    try {
      const { error } = await supabase.auth.resend({
        email: verificationEmail,
        type: 'signup',
      })

      if (error) {
        setProviderError("We couldn't resend the verification code. Please try again.")
        return
      }

      setDigits(Array<string>(OTP_LENGTH).fill(''))
      setSecondsRemaining(COUNTDOWN_SECONDS)
      inputRefs.current[0]?.focus()
    } catch {
      setProviderError("We couldn't resend the verification code. Please try again.")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <TalentryCard className="talentry-create-account talentry-otp-card" padding="standard">
      <SectionHeader
        description={
          <span className="talentry-otp-recipient">
            <span>We&apos;ve sent a 6-digit verification code to</span>
            <strong>
              {verificationEmail === null
                ? 'Preparing verification details...'
                : verificationEmail || 'Email address unavailable'}
            </strong>
          </span>
        }
        headingAs="h1"
        title="Verify your email"
      />

      <form
        aria-describedby={providerError ? PROVIDER_ERROR_ID : undefined}
        className="talentry-create-account__form"
        noValidate
        onSubmit={handleSubmit}
      >
        <div className="talentry-auth-field">
          <label id="otp-code-label">Verification code</label>
          <div
            aria-describedby={providerError ? PROVIDER_ERROR_ID : undefined}
            aria-invalid={providerError ? true : undefined}
            aria-labelledby="otp-code-label"
            className="talentry-auth-input-control talentry-otp-inputs"
            role="group"
          >
            {digits.map((digit, index) => (
              <input
                aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
                autoComplete={index === 0 ? 'one-time-code' : 'off'}
                inputMode="numeric"
                key={index}
                maxLength={1}
                className="talentry-otp-input"
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  updateDigit(index, event.target.value)
                }
                onKeyDown={(event) => handleKeyDown(index, event)}
                onPaste={handlePaste}
                pattern="[0-9]*"
                ref={(element) => {
                  inputRefs.current[index] = element
                }}
                type="text"
                value={digit}
              />
            ))}
          </div>
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

        <div className="talentry-otp-resend" aria-live="polite">
          {secondsRemaining > 0 ? (
            <p className="talentry-password-requirements__title">Resend in {countdown}</p>
          ) : (
            <TalentryButton
              disabled={!verificationEmail || isVerifying}
              loading={isResending}
              loadingText="Resending code..."
              onClick={handleResend}
              size="small"
              variant="ghost"
            >
              Resend code
            </TalentryButton>
          )}
        </div>

        <TalentryButton
          className="talentry-otp-submit"
          disabled={!codeIsComplete || !verificationEmail || isResending || isVerifying}
          loading={isVerifying}
          loadingText="Verifying..."
          size="large"
          type="submit"
        >
          Verify
        </TalentryButton>
      </form>
    </TalentryCard>
  )
}
