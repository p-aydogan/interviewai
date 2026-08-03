'use client'

import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, ClipboardEvent, FormEvent, KeyboardEvent } from 'react'

import { TalentryButton, TalentryCard, SectionHeader } from '@/components/ui'
import { OTP_LENGTH } from '@/lib/auth/auth-constants'

const COUNTDOWN_SECONDS = 119

export default function OtpVerificationForm() {
  const [digits, setDigits] = useState(() => Array<string>(OTP_LENGTH).fill(''))
  const [secondsRemaining, setSecondsRemaining] = useState(COUNTDOWN_SECONDS)
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
  }

  function handleResend() {
    setDigits(Array<string>(OTP_LENGTH).fill(''))
    setSecondsRemaining(COUNTDOWN_SECONDS)
    inputRefs.current[0]?.focus()
  }

  return (
    <TalentryCard className="talentry-create-account talentry-otp-card" padding="standard">
      <SectionHeader
        description={
          <span className="talentry-otp-recipient">
            <span>We&apos;ve sent a 6-digit verification code to</span>
            <strong>p***@example.com</strong>
          </span>
        }
        headingAs="h1"
        title="Verify your email"
      />

      <form className="talentry-create-account__form" noValidate onSubmit={handleSubmit}>
        <div className="talentry-auth-field">
          <label id="otp-code-label">Verification code</label>
          <div
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

        <div className="talentry-otp-resend" aria-live="polite">
          {secondsRemaining > 0 ? (
            <p className="talentry-password-requirements__title">Resend in {countdown}</p>
          ) : (
            <TalentryButton onClick={handleResend} size="small" variant="ghost">
              Resend code
            </TalentryButton>
          )}
        </div>

        <TalentryButton
          className="talentry-otp-submit"
          disabled={!codeIsComplete}
          size="large"
          type="submit"
        >
          Verify
        </TalentryButton>
      </form>
    </TalentryCard>
  )
}
