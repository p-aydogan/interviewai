'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import { AUTH_ROUTES } from '@/lib/auth/auth-constants'
import type { PreAuthCopy } from './pre-auth-copy'

interface OnboardingPagerProps {
  copy: PreAuthCopy
  onBack: () => void
  onSkip: () => void
  onComplete: () => void
}

function PanelIcon({ page }: { page: number }) {
  return <svg className="talentry-pre-auth__panel-icon" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"
    strokeLinejoin="round" aria-hidden="true" focusable="false">
    {page === 0 && <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M6 10v1a6 6 0 0 0 12 0v-1M12 17v4M9 21h6" />
    </>}
    {page === 1 && <>
      <path d="M8 5H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="8" y="3" width="8" height="4" rx="2" />
      <path d="m8 13 2 2 5-5M8 18h8" />
    </>}
    {page === 2 && <>
      <path d="M3 10a9 9 0 1 1 1 6M3 5v5h5M12 7v5l3 2" />
    </>}
  </svg>
}

export default function OnboardingPager({ copy, onBack, onSkip, onComplete }: OnboardingPagerProps) {
  const [page, setPage] = useState(0)
  const heading = useRef<HTMLHeadingElement>(null)
  const skipRow = useRef<HTMLDivElement>(null)
  const moveFocus = useRef(false)
  const swipeStart = useRef<{ id: number; x: number; y: number; page: number } | null>(null)

  useEffect(() => {
    if (moveFocus.current) (skipRow.current ?? heading.current)?.focus({ preventScroll: true })
    moveFocus.current = false
  }, [page])

  function navigate(next: number, focus = true) {
    const bounded = Math.max(0, Math.min(2, next))
    if (bounded === page) return
    moveFocus.current = focus
    setPage(bounded)
  }

  function startSwipe(event: PointerEvent<HTMLElement>) {
    swipeStart.current = null
    const target = event.target
    if (!event.isPrimary || event.button !== 0 || !(target instanceof Element) ||
      target.closest('a, button, input, select, textarea, label, [contenteditable]') ||
      window.getSelection()?.toString()) return
    swipeStart.current = { id: event.pointerId, x: event.clientX, y: event.clientY, page }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function moveSwipe(event: PointerEvent<HTMLElement>) {
    const start = swipeStart.current
    if (!start || start.id !== event.pointerId) return
    const dx = Math.abs(event.clientX - start.x)
    const dy = Math.abs(event.clientY - start.y)
    if (dy >= 12 && dy >= dx) swipeStart.current = null
  }

  function endSwipe(event: PointerEvent<HTMLElement>) {
    const start = swipeStart.current
    swipeStart.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    if (!start || start.id !== event.pointerId || start.page !== page || window.getSelection()?.toString()) return
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    if (Math.abs(dx) >= 48 && Math.abs(dx) > Math.abs(dy) * 1.5) navigate(page + (dx < 0 ? 1 : -1), false)
  }

  return <>
    {page < 2 && <div className="talentry-pre-auth__skip-row" ref={skipRow}
      data-pre-auth-focus tabIndex={-1} role="group" aria-labelledby="pre-auth-title">
      <button className="talentry-pre-auth__text-action" type="button" onClick={onSkip}>{copy.skip}</button>
    </div>}
    <section className="talentry-pre-auth__content" id="pre-auth-panel" aria-labelledby="pre-auth-title"
      onPointerDown={startSwipe} onPointerMove={moveSwipe} onPointerUp={endSwipe}
      onPointerCancel={() => { swipeStart.current = null }}
      onLostPointerCapture={() => { swipeStart.current = null }}
      onTouchStart={event => { if (event.touches.length !== 1) swipeStart.current = null }}>
      <span className="talentry-pre-auth__emblem" aria-hidden="true"><PanelIcon page={page} /></span>
      <h1 id="pre-auth-title" tabIndex={-1} ref={heading}>{copy.panels[page].title}</h1>
      <p>{copy.panels[page].description}</p>
    </section>
    <footer className="talentry-pre-auth__footer">
      <nav className="talentry-pre-auth__dots" aria-label={copy.navigation}>
        {copy.panels.map((panel, index) => <button key={index} type="button"
          aria-label={`${copy.page(index + 1)}: ${panel.title}`} aria-controls="pre-auth-panel"
          aria-current={page === index ? 'step' : undefined} onClick={() => navigate(index)}>
          <span aria-hidden="true" />
        </button>)}
      </nav>
      <p className="talentry-pre-auth__sr-only" role="status" aria-live="polite" aria-atomic="true">
        {copy.page(page + 1)}: {copy.panels[page].title}
      </p>
      <div className="talentry-pre-auth__navigation">
        <button className="talentry-pre-auth__action" type="button"
          onClick={() => page === 0 ? onBack() : navigate(page - 1)}>{copy.back}</button>
        {page < 2 && <button className="talentry-pre-auth__action talentry-pre-auth__action--primary"
          type="button" onClick={() => navigate(page + 1)}>{copy.next}<span aria-hidden="true"> →</span></button>}
      </div>
      <div className="talentry-pre-auth__final-actions">
        {page === 2 && <div className="talentry-pre-auth__auth-actions">
          <Link className="talentry-pre-auth__action talentry-pre-auth__action--primary"
            href={AUTH_ROUTES.login} onClick={onComplete}>{copy.signIn}</Link>
          <Link className="talentry-pre-auth__action" href={AUTH_ROUTES.register} onClick={onComplete}>{copy.register}</Link>
        </div>}
      </div>
    </footer>
  </>
}
