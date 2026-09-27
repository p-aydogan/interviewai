'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { SectionHeader, TalentryCard } from '@/components/ui'
import { AUTH_ROUTES } from '@/lib/auth/auth-constants'
import { createClient } from '@/lib/supabase'

import ResetPasswordForm from './ResetPasswordForm'
import { createRecoverySession } from './recovery-session'
import type { RecoveryStatus } from './recovery-session'

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
  const [providerPending, setProviderPending] = useState(false)
  const [providerError, setProviderError] = useState('')
  const recovery = useRef<ReturnType<typeof createRecoverySession> | null>(null)

  useEffect(() => {
    try {
      recovery.current = createRecoverySession({
        auth: supabase.auth,
        storage: window.sessionStorage,
        hasCallback: () => {
          const url = new URL(window.location.href)
          const hash = new URLSearchParams(url.hash.slice(1))
          return ['code', 'error', 'error_code', 'error_description', 'access_token'].some(
            (key) => url.searchParams.has(key) || hash.has(key),
          )
        },
        onStatus: setStatus,
      })
    } catch { setStatus('unavailable'); return }
    const recheck = () => {
      if (document.visibilityState === 'visible') recovery.current?.recheck()
    }
    window.addEventListener('focus', recheck)
    window.addEventListener('pageshow', recheck)
    document.addEventListener('visibilitychange', recheck)
    return () => {
      window.removeEventListener('focus', recheck)
      window.removeEventListener('pageshow', recheck)
      document.removeEventListener('visibilitychange', recheck)
      recovery.current?.dispose()
      recovery.current = null
    }
  }, [supabase])

  async function handlePasswordSubmit(password: string) {
    if (status !== 'ready' || providerPending) return

    setProviderPending(true)
    setProviderError('')

    const result = await recovery.current?.submit(password)
    if (result === 'success') {
      router.replace(AUTH_ROUTES.resetPasswordSuccess)
    } else if (result === 'failed') {
      setProviderError("We couldn't update your password. Please try again.")
    }
    setProviderPending(false)
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
