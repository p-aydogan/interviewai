'use client'

import { useEffect, useRef, useState } from 'react'
import PreAuthShell from './PreAuthShell'
import SplashScreen from './SplashScreen'
import OnboardingPager from './OnboardingPager'
import { PRE_AUTH_COPY } from './pre-auth-copy'
import { usePreAuthPreferences } from './usePreAuthPreferences'
import '@/styles/talentry-pre-auth.css'

export default function PreAuthFlow() {
  const preferences = usePreAuthPreferences()
  const [onboarding, setOnboarding] = useState(false)
  const focusHeading = useRef(false)
  const content = useRef<HTMLDivElement>(null)
  const copy = PRE_AUTH_COPY[preferences.language]

  useEffect(() => {
    if (focusHeading.current) content.current?.querySelector<HTMLElement>('[data-pre-auth-focus], h1')?.focus()
    focusHeading.current = false
  }, [onboarding])

  function showOnboarding(next: boolean) {
    focusHeading.current = true
    setOnboarding(next)
  }

  function skip() {
    preferences.complete()
    showOnboarding(false)
  }

  return <PreAuthShell ready={preferences.ready} language={preferences.language} copy={copy} onLanguageChange={preferences.changeLanguage}>
    <div className="talentry-pre-auth__flow" ref={content}>
      {preferences.ready && (onboarding ? <OnboardingPager copy={copy} onBack={() => showOnboarding(false)}
        onSkip={skip} onComplete={preferences.complete} /> :
        <SplashScreen copy={copy} returning={preferences.completed} onStart={() => showOnboarding(true)} />)}
    </div>
  </PreAuthShell>
}
