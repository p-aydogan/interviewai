'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { SectionHeader, TalentryCard } from '@/components/ui'
import { AUTH_ROUTES } from '@/lib/auth/auth-constants'
import { createClient } from '@/lib/supabase'

import ResetPasswordForm from './ResetPasswordForm'

type RecoveryStatus = 'checking' | 'ready' | 'unavailable'

interface RecoveryStateCardProps {
  action?: ReactNode
  description: ReactNode
  title: string
}

function RecoveryStateCard({ action, description, title }: RecoveryStateCardProps) {
  return (
    <TalentryCard
      aria-live="polite"
      className="talentry-create-account talentry-forgot-password-card talentry-empty-state talentry-empty-state--compact"
      padding="standard"
    >
      <SectionHeader description={description} headingAs="h1" title={title} />
      {action && <div className="talentry-empty-state__action">{action}</div>}
    </TalentryCard>
  )
}

export default function PasswordRecoveryFlow() {
  const router = useRouter()
  const [supabase] = useState(createClient)
  const [status, setStatus] = useState<RecoveryStatus>('checking')
  const [recoveryObserved, setRecoveryObserved] = useState(false)
  const [providerPending, setProviderPending] = useState(false)
  const [providerError, setProviderError] = useState('')
  const recoveryObservedRef = useRef(false)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        recoveryObservedRef.current = true
        setRecoveryObserved(true)
        setStatus('checking')
        return
      }

      if (
        !recoveryObservedRef.current &&
        (event === 'INITIAL_SESSION' || event === 'SIGNED_IN')
      ) {
        setStatus('unavailable')
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  useEffect(() => {
    if (!recoveryObserved) return

    let active = true

    async function validateRecoveryUser() {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (!active) return
        if (!error && user) {
          setStatus('ready')
          return
        }

        setStatus('unavailable')
      } catch {
        if (active) {
          setStatus('unavailable')
        }
      }
    }

    void validateRecoveryUser()

    return () => {
      active = false
    }
  }, [recoveryObserved, supabase])

  async function handlePasswordSubmit(password: string) {
    if (status !== 'ready' || providerPending) return

    setProviderPending(true)
    setProviderError('')

    try {
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        setProviderError("We couldn't update your password. Please try again.")
        setProviderPending(false)
        return
      }

      router.replace(AUTH_ROUTES.resetPasswordSuccess)
    } catch {
      setProviderError("We couldn't update your password. Please try again.")
      setProviderPending(false)
    }
  }

  if (status === 'ready') {
    return (
      <ResetPasswordForm
        onPasswordSubmit={handlePasswordSubmit}
        providerError={providerError}
        providerPending={providerPending}
      />
    )
  }

  if (status === 'unavailable') {
    return (
      <RecoveryStateCard
        action={
          <Link
            className="talentry-button talentry-button--primary talentry-button--large"
            href={AUTH_ROUTES.forgotPassword}
          >
            <span className="talentry-button__content">Request a new reset link</span>
          </Link>
        }
        description={
          <>
            This password reset link is invalid or has expired.
            <br />
            Request a new link to continue.
          </>
        }
        title="Reset link unavailable"
      />
    )
  }

  return (
    <RecoveryStateCard
      description="Please wait while we verify your password reset link."
      title="Checking reset link"
    />
  )
}
