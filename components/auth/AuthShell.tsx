import Link from 'next/link'
import type { ReactNode } from 'react'

import '@/styles/talentry-auth.css'

export interface AuthShellProps {
  children: ReactNode
  backHref?: string
  backLabel?: string
}

export default function AuthShell({ children, backHref, backLabel }: AuthShellProps) {
  return (
    <main className="talentry-auth-shell">
      <header className="talentry-auth-shell__topbar">
        <div className="talentry-auth-shell__back-slot">
          {backHref && backLabel && (
            <Link
              aria-label={backLabel}
              className="talentry-auth-shell__back-control"
              href={backHref}
            >
              <span aria-hidden="true">←</span>
            </Link>
          )}
        </div>

        <div className="talentry-auth-shell__brand" aria-label="Talentry">
          <span className="talentry-auth-shell__brand-mark" aria-hidden="true">T</span>
          <span>Talentry</span>
        </div>

        <div className="talentry-auth-shell__languages" aria-label="Language control placeholder">
          <span aria-hidden="true">◎</span>
          <span>Language</span>
          <span aria-hidden="true">⌄</span>
        </div>
      </header>

      <div className="talentry-auth-shell__content">{children}</div>
    </main>
  )
}
