'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { ReactNode } from 'react'

import '@/styles/talentry-auth.css'

export interface AuthShellProps {
  children: ReactNode
  backHref?: string
  backLabel?: string
  centered?: boolean
}

export default function AuthShell({
  children,
  backHref,
  backLabel,
  centered = false,
}: AuthShellProps) {
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false)
  const shellClassName = [
    'talentry-auth-shell',
    centered && 'talentry-auth-shell--centered',
  ].filter(Boolean).join(' ')
  const contentClassName = [
    'talentry-auth-shell__content',
    centered && 'talentry-auth-shell__content--centered',
  ].filter(Boolean).join(' ')

  return (
    <main className={shellClassName}>
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

        <div className="talentry-auth-shell__language-menu">
          <button
            aria-expanded={languageMenuOpen}
            aria-haspopup="menu"
            className="talentry-auth-shell__languages"
            onClick={() => setLanguageMenuOpen((open) => !open)}
            type="button"
          >
            <span aria-hidden="true">◎</span>
            <span>Language</span>
            <span aria-hidden="true">⌄</span>
          </button>
          {languageMenuOpen && (
            <div
              aria-label="Language options"
              className="talentry-auth-shell__language-options"
              role="menu"
            >
              <button role="menuitem" type="button">English</button>
              <button role="menuitem" type="button">Türkçe</button>
              <button role="menuitem" type="button">Deutsch</button>
            </div>
          )}
        </div>
      </header>

      <div className={contentClassName}>{children}</div>
    </main>
  )
}
