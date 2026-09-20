'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useId, useRef, useState } from 'react'
import type { UserIdentity } from '@/lib/auth/user-identity'
import type { AppLanguage } from '@/types/auth'
import type { useAccountSession } from './useAccountSession'
import { ACCOUNT_COPY } from './account-copy'
import LanguageSelector from './LanguageSelector'

export default function UserMenu({ identity, language, onLanguageChange, session }: {
  identity: UserIdentity; language: AppLanguage; onLanguageChange: (language: AppLanguage) => void
  session: ReturnType<typeof useAccountSession>
}) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const firstLink = useRef<HTMLAnchorElement>(null)
  const id = useId()
  const pathname = usePathname()
  const copy = ACCOUNT_COPY[language]

  useEffect(() => { setOpen(false) }, [pathname])
  useEffect(() => {
    if (!open) return
    firstLink.current?.focus()
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', outside)
    return () => document.removeEventListener('pointerdown', outside)
  }, [open])

  return <div className="talentry-account-menu" ref={root}
    onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
    }} onKeyDown={event => {
      if (event.key === 'Escape' && open) {
        event.preventDefault()
        setOpen(false)
        trigger.current?.focus()
      }
    }}>
    <button type="button" className="talentry-account-trigger" ref={trigger}
      aria-label={copy.account} aria-expanded={open} aria-controls={id}
      onClick={() => setOpen(value => !value)}>
      <span aria-hidden="true">{identity.initials ?? '●'}</span>
    </button>
    {open && <div className="talentry-account-popover" id={id}>
      <div className="talentry-account-identity">
        {(identity.displayName || !identity.email) && <strong>{identity.displayName ?? copy.account}</strong>}
        {identity.email && <span>{identity.email}</span>}
      </div>
      <Link ref={firstLink} href="/profile" onClick={() => setOpen(false)}>{copy.profile}</Link>
      <Link href="/account/settings" onClick={() => setOpen(false)}>{copy.settings}</Link>
      <LanguageSelector language={language} onChange={onLanguageChange} />
      <Link href="/help" onClick={() => setOpen(false)}>{copy.help}</Link>
      <hr />
      <button type="button" aria-disabled={session.pending} onClick={() => void session.signOut()}>
        {session.pending ? copy.signingOut : copy.signOut}
      </button>
      {session.failed && <p role="alert">{copy.signOutFailed}</p>}
    </div>}
  </div>
}
