'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export function useAccountSession() {
  const router = useRouter()
  const [supabase] = useState(createClient)
  const [pending, setPending] = useState(false)
  const [failed, setFailed] = useState(false)
  const [sessionGone, setSessionGone] = useState(false)
  const inFlight = useRef(false)
  const leaving = useRef(false)
  const mounted = useRef(false)

  function leave() {
    if (!mounted.current || leaving.current) return
    leaving.current = true
    setSessionGone(true)
    // Full navigation discards the authenticated client tree and router cache.
    window.location.replace('/login')
  }

  useEffect(() => {
    mounted.current = true
    let refreshTimer: ReturnType<typeof setTimeout> | undefined
    let lastRefresh = 0
    const scheduleRefresh = () => {
      if (refreshTimer !== undefined || leaving.current) return
      // Leave the Auth callback before refreshing server-verified identity.
      refreshTimer = setTimeout(() => {
        refreshTimer = undefined
        if (!mounted.current || leaving.current) return
        lastRefresh = Date.now()
        router.refresh()
      }, 0)
    }
    const onFocus = () => { if (Date.now() - lastRefresh >= 2000) scheduleRefresh() }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || (event === 'INITIAL_SESSION' && !session)) leave()
      if (event === 'USER_UPDATED' && session) scheduleRefresh()
    })
    // A restored browser-history document must not retain stale account UI.
    const revalidate = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (!error && !data.session) leave()
    }
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) void revalidate().catch(() => {})
    }
    window.addEventListener('pageshow', onPageShow)
    window.addEventListener('focus', onFocus)
    return () => {
      mounted.current = false
      subscription.unsubscribe()
      clearTimeout(refreshTimer)
      window.removeEventListener('pageshow', onPageShow)
      window.removeEventListener('focus', onFocus)
    }
  }, [supabase, router])

  async function signOut() {
    if (inFlight.current || leaving.current) return
    inFlight.current = true
    setPending(true)
    setFailed(false)
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' })
      if (!error) { leave(); return }
      // The SDK can remove local state even when remote revocation fails.
      const { data, error: sessionError } = await supabase.auth.getSession()
      if (!sessionError && !data.session) { leave(); return }
      if (mounted.current && !leaving.current) setFailed(true)
    } catch {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (!error && !data.session) { leave(); return }
      } catch { /* Keep a safe retry state when session inspection fails. */ }
      if (mounted.current && !leaving.current) setFailed(true)
    } finally {
      inFlight.current = false
      if (mounted.current && !leaving.current) setPending(false)
    }
  }

  return { pending, failed, sessionGone, signOut }
}
