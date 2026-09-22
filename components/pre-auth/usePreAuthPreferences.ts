'use client'

import { useEffect, useState } from 'react'
import { DEFAULT_APP_LANGUAGE, SUPPORTED_APP_LANGUAGES } from '@/lib/auth/auth-constants'
import type { AppLanguage } from '@/types/auth'

const LANGUAGE_KEY = 'interviewai_uilang'
const COMPLETION_KEY = 'talentry.onboarding.v1'

export function usePreAuthPreferences() {
  const [language, setLanguage] = useState<AppLanguage>(DEFAULT_APP_LANGUAGE)
  const [completed, setCompleted] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LANGUAGE_KEY)
      setLanguage(SUPPORTED_APP_LANGUAGES.find(value => value === stored) ?? DEFAULT_APP_LANGUAGE)
    } catch { /* The default remains usable without storage. */ }
    try {
      setCompleted(window.localStorage.getItem(COMPLETION_KEY) === 'complete')
    } catch { /* Completion is a UX preference, never an auth check. */ }
    setReady(true)
  }, [])

  function changeLanguage(next: AppLanguage) {
    if (!SUPPORTED_APP_LANGUAGES.some(value => value === next)) return
    setLanguage(next)
    try { window.localStorage.setItem(LANGUAGE_KEY, next) } catch { /* Keep in-memory selection. */ }
  }

  function complete() {
    setCompleted(true)
    try { window.localStorage.setItem(COMPLETION_KEY, 'complete') } catch { /* Navigation must continue. */ }
  }

  return { language, completed, ready, changeLanguage, complete }
}
