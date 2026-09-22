import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import type { TouchEvent } from 'react'
import { SectionHeader, TalentryCard } from '@/components/ui'
import type { InterviewDetail } from '@/app/result/[id]/page'
import type { AppLanguage } from '@/types/auth'
import ResultAnswers from './ResultAnswers'
import { displayValue, INTERVIEW_LANGUAGE_NAMES } from './result-copy'
import type { ResultCopy } from './result-copy'
import styles from '@/app/result/result.module.css'

interface ResultContentProps {
  interview: InterviewDetail
  copy: ResultCopy
  uiLanguage: AppLanguage
}

function formatDuration(durationSeconds: number) {
  const totalSeconds = Math.max(0, Math.floor(durationSeconds))
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, '0')}`
}

function formatCreatedAt(createdAt: string, language: AppLanguage) {
  const date = new Date(createdAt)
  return Number.isNaN(date.getTime()) ? createdAt : new Intl.DateTimeFormat(language, {
    dateStyle: 'medium', timeStyle: 'short',
  }).format(date)
}

export default function ResultContent({ interview, copy, uiLanguage }: ResultContentProps) {
  const [activePanel, setActivePanel] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const panelRefs = useRef<Array<HTMLDivElement | null>>([])
  const focusNextPanel = useRef(false)

  useEffect(() => {
    const query = window.matchMedia('(max-width: 640px)')
    const syncViewport = () => { setIsMobile(query.matches); touchStart.current = null }
    syncViewport()
    query.addEventListener('change', syncViewport)
    return () => query.removeEventListener('change', syncViewport)
  }, [])

  useEffect(() => {
    if (focusNextPanel.current) {
      panelRefs.current[activePanel]?.focus({ preventScroll: true })
      focusNextPanel.current = false
    }
  }, [activePanel])

  function navigatePanel(index: number) {
    const next = Math.max(0, Math.min(2, index))
    const current = panelRefs.current[activePanel]
    if (next !== activePanel && current?.contains(document.activeElement)) {
      focusNextPanel.current = true
    }
    setActivePanel(next)
  }

  function startSwipe(event: TouchEvent<HTMLDivElement>) {
    const touch = event.touches[0]
    touchStart.current = isMobile && event.touches.length === 1
      ? { x: touch.clientX, y: touch.clientY } : null
  }

  function endSwipe(event: TouchEvent<HTMLDivElement>) {
    const start = touchStart.current
    touchStart.current = null
    if (!isMobile || !start || event.touches.length > 0) return
    const touch = event.changedTouches[0]
    const dx = touch.clientX - start.x
    const dy = touch.clientY - start.y
    if (Math.abs(dx) >= 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      navigatePanel(activePanel + (dx < 0 ? 1 : -1))
    }
  }

  function panelProps(index: number) {
    return {
      id: `result-panel-${index}`,
      className: styles.panel,
      'aria-label': copy.panels[index],
      'aria-hidden': isMobile && activePanel !== index ? true : undefined,
      'data-active': activePanel === index,
      role: isMobile ? 'region' : undefined,
      tabIndex: isMobile ? 0 : undefined,
      ref: (node: HTMLDivElement | null) => { panelRefs.current[index] = node },
    }
  }
  const metadata = [
    [copy.role, interview.role],
    [copy.company, interview.company],
    [copy.level, displayValue(copy.levels, interview.level)],
    [copy.interviewType, displayValue(copy.interviewTypes, interview.interviewType)],
    [copy.language, displayValue(INTERVIEW_LANGUAGE_NAMES, interview.language)],
    [copy.persona, displayValue(copy.personas, interview.persona)],
    [copy.duration, formatDuration(interview.durationSeconds)],
    [copy.date, formatCreatedAt(interview.createdAt, uiLanguage)],
  ]

  return (
    <>
      <div className={styles.panelViewport} onTouchStart={startSwipe} onTouchEnd={endSwipe}
        onTouchCancel={() => { touchStart.current = null }}>
        <div className={styles.panelTrack} data-panel={activePanel}>
        <div {...panelProps(0)}>
      <div className={styles.overview}>
        <TalentryCard className={styles.scoreCard} surface="lavender" aria-labelledby="result-score">
          <h2 className={styles.label} id="result-score">{copy.score}</h2>
          <p className={styles.score}>
            <strong>{interview.score}</strong><span> / 100</span>
          </p>
        </TalentryCard>
        <TalentryCard aria-labelledby="result-summary">
          <h2 className={styles.cardTitle} id="result-summary">{copy.summary}</h2>
          <p className={styles.text} dir="auto">
            {interview.summary.trim() ? interview.summary : copy.emptySummary}
          </p>
        </TalentryCard>
      </div>
        </div>
        <div {...panelProps(1)}>
      <TalentryCard aria-labelledby="result-details">
        <SectionHeader title={<span id="result-details">{copy.details}</span>} />
        <dl className={styles.metadata}>
          {metadata.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd dir="auto">{value.trim() ? value : copy.notProvided}</dd>
            </div>
          ))}
        </dl>
      </TalentryCard>
        </div>
        <div {...panelProps(2)}>
      <ResultAnswers answers={interview.answers} copy={copy} />
      <div className={styles.actions}>
        <Link className={`talentry-button talentry-button--primary talentry-button--large ${styles.action}`} href="/interview/setup">
          {copy.startAgain}
        </Link>
      </div>
        </div>
        </div>
      </div>
      <nav className={styles.pager} aria-label={copy.pager}>
        {copy.panels.map((label, index) => (
          <button key={label} type="button" className={styles.pagerButton}
            aria-label={label} aria-current={activePanel === index ? 'step' : undefined}
            aria-controls={`result-panel-${index}`} onClick={() => navigatePanel(index)}>
            <span aria-hidden="true" />
          </button>
        ))}
      </nav>
    </>
  )
}
