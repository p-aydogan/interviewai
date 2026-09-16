'use client'

import { useRef, useState } from 'react'
import type { ReactNode, TouchEvent } from 'react'

interface DashboardMobileProps {
  labels: readonly [string, string, string]
  navigationLabel: string
  pages: readonly [ReactNode, ReactNode, ReactNode]
}

export default function DashboardMobile({ labels, navigationLabel, pages }: DashboardMobileProps) {
  const [activePanel, setActivePanel] = useState(0)
  const viewport = useRef<HTMLDivElement>(null)
  const panels = useRef<Array<HTMLElement | null>>([])
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  function navigate(index: number) {
    const next = Math.max(0, Math.min(2, index))
    if (next === activePanel) return
    const moveFocus = panels.current[activePanel]?.contains(document.activeElement)
    setActivePanel(next)
    if (viewport.current) viewport.current.scrollTop = 0
    // Keep focus visible when a swipe hides the focused link.
    if (moveFocus) requestAnimationFrame(() => panels.current[next]?.focus({ preventScroll: true }))
  }

  function endSwipe(event: TouchEvent<HTMLDivElement>) {
    const start = touchStart.current
    touchStart.current = null
    if (!start || event.touches.length || event.changedTouches.length !== 1) return
    const touch = event.changedTouches[0]
    const dx = touch.clientX - start.x
    const dy = touch.clientY - start.y
    if (Math.abs(dx) >= 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      navigate(activePanel + (dx < 0 ? 1 : -1))
    }
  }

  return (
    <div className="talentry-dashboard-mobile">
      <div className="talentry-dashboard-mobile-viewport" ref={viewport}
        onTouchStart={event => {
          const touch = event.touches[0]
          touchStart.current = event.touches.length === 1 ? { x: touch.clientX, y: touch.clientY } : null
        }} onTouchMove={event => { if (event.touches.length !== 1) touchStart.current = null }}
        onTouchEnd={endSwipe} onTouchCancel={() => { touchStart.current = null }}>
        {pages.map((page, index) => (
          <section className="talentry-dashboard-mobile-page" id={`dashboard-panel-${index}`}
            key={index} hidden={activePanel !== index} aria-label={labels[index]} tabIndex={-1}
            ref={node => { panels.current[index] = node }}>
            {page}
          </section>
        ))}
      </div>
      <nav className="talentry-dashboard-pager" aria-label={navigationLabel}>
        {labels.map((label, index) => (
          <button key={label} type="button" aria-label={label}
            aria-current={activePanel === index ? 'step' : undefined} aria-controls={`dashboard-panel-${index}`}
            onClick={() => navigate(index)}><span aria-hidden="true" /></button>
        ))}
      </nav>
    </div>
  )
}
