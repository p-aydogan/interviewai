'use client'

import { useEffect, useRef, useState } from 'react'
import type { TouchEvent } from 'react'
import { SectionHeader, TalentryButton, TalentryCard } from '@/components/ui'
import type { AppLanguage } from '@/types/auth'
import { INTERVIEWERS, MOBILE_COPY } from './interview-setup-config'
import type { SetupChanges, SetupCopy, SetupValues } from './interview-setup-config'

interface InterviewSetupMobileProps {
  copy: SetupCopy
  uiLanguage: AppLanguage
  values: SetupValues
  changes: SetupChanges
}

export default function InterviewSetupMobile({ copy, uiLanguage, values, changes }: InterviewSetupMobileProps) {
  const [activePanel, setActivePanel] = useState(0)
  const viewport = useRef<HTMLDivElement>(null)
  const panels = useRef<Array<HTMLElement | null>>([])
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const moveFocus = useRef(false)
  const mobileCopy = MOBILE_COPY[uiLanguage]

  useEffect(() => {
    if (viewport.current) viewport.current.scrollTop = 0
    if (moveFocus.current) panels.current[activePanel]?.focus({ preventScroll: true })
    moveFocus.current = false
  }, [activePanel])

  function navigate(index: number) {
    const next = Math.max(0, Math.min(1, index))
    if (next === activePanel) return
    moveFocus.current = !!panels.current[activePanel]?.contains(document.activeElement)
    setActivePanel(next)
  }

  function startSwipe(event: TouchEvent<HTMLDivElement>) {
    touchStart.current = null
    const target = event.target
    if (event.touches.length !== 1 || !(target instanceof Element) ||
      target.closest('input, select, option, textarea, button, label, a, [contenteditable]') ||
      window.getSelection()?.toString()) return
    const touch = event.touches[0]
    touchStart.current = { x: touch.clientX, y: touch.clientY }
  }

  function endSwipe(event: TouchEvent<HTMLDivElement>) {
    const start = touchStart.current
    touchStart.current = null
    if (!start || event.touches.length || event.changedTouches.length !== 1 || window.getSelection()?.toString()) return
    const touch = event.changedTouches[0]
    const dx = touch.clientX - start.x
    const dy = touch.clientY - start.y
    if (Math.abs(dx) >= 60 && Math.abs(dx) > Math.abs(dy) * 1.5) navigate(activePanel + (dx < 0 ? 1 : -1))
  }

  function selectField<Key extends 'persona' | 'interviewLanguage' | 'level' | 'interviewType'>(
    key: Key, label: string, options: ReadonlyArray<readonly [SetupValues[Key], string]>,
  ) {
    return <div className="talentry-setup-field">
      <label htmlFor={`setup-mobile-${key}`}>{label}</label>
      <select id={`setup-mobile-${key}`} value={values[key]}
        onChange={event => changes[key](event.target.value as SetupValues[Key])}>
        {options.map(([value, text]) => <option key={value} value={value}>{text}</option>)}
      </select>
    </div>
  }

  return <>
    <div className="talentry-setup-mobile-viewport" ref={viewport} onTouchStart={startSwipe}
      onTouchMove={event => { if (event.touches.length !== 1) touchStart.current = null }}
      onTouchEnd={endSwipe} onTouchCancel={() => { touchStart.current = null }}>
      <section id="setup-mobile-panel-0" className="talentry-setup-mobile-panel" hidden={activePanel !== 0}
        aria-label={mobileCopy.panels[0]} tabIndex={-1} ref={node => { panels.current[0] = node }}>
        <SectionHeader className="talentry-setup-intro" headingAs="h1" title={copy.title} description={copy.description} />
        <TalentryCard className="talentry-setup-interviewers" surface="lavender">
          <fieldset>
            <legend>{copy.interviewerLegend}</legend>
            <div className="talentry-setup-interviewer-list">
              {INTERVIEWERS.map(option => <div className="talentry-setup-interviewer-option" key={option.id}>
                <input id={`setup-interviewer-${option.id}`} type="radio" name="interviewer" value={option.id}
                  checked={values.interviewer === option.id} onChange={() => changes.interviewer(option.id)} />
                <label htmlFor={`setup-interviewer-${option.id}`}>
                  <img alt={option.name} src={option.photo} />
                  <span className="talentry-setup-interviewer-option__identity"><strong>{option.name}</strong><span>{option.role}</span></span>
                  <span className="talentry-setup-interviewer-option__selected" aria-hidden="true">✓ {copy.selected}</span>
                </label>
              </div>)}
            </div>
          </fieldset>
        </TalentryCard>
        {selectField('persona', copy.persona, [['friendly', copy.friendly], ['formal', copy.formal], ['tough', copy.tough], ['curious', copy.curious]])}
        {selectField('interviewLanguage', copy.interviewLanguage, [['tr', 'Türkçe'], ['en', 'English'], ['de', 'Deutsch']])}
      </section>
      <section id="setup-mobile-panel-1" className="talentry-setup-mobile-panel" hidden={activePanel !== 1}
        aria-labelledby="setup-mobile-settings-heading" tabIndex={-1} ref={node => { panels.current[1] = node }}>
        <h1 id="setup-mobile-settings-heading">{mobileCopy.panels[1]}</h1>
        {(['role', 'company'] as const).map(key => <div className="talentry-setup-field" key={key}>
          <label htmlFor={`setup-mobile-${key}`}>{copy[key]} <span>{copy.optional}</span></label>
          <input id={`setup-mobile-${key}`} type="text" value={values[key]} placeholder={copy[`${key}Placeholder`]}
            onChange={event => changes[key](event.target.value)} />
        </div>)}
        {selectField('level', copy.level, [['junior', copy.junior], ['mid', copy.mid], ['senior', copy.senior]])}
        {selectField('interviewType', copy.interviewType, [['behavioral', copy.behavioral], ['technical', copy.technical], ['mixed', copy.mixed], ['case', copy.caseStudy]])}
        <TalentryButton className="talentry-setup-submit" size="large" type="submit">
          <span>{copy.start}</span><span aria-hidden="true">→</span>
        </TalentryButton>
      </section>
    </div>
    <nav className="talentry-setup-mobile-pager" aria-label={mobileCopy.pager}>
      {mobileCopy.panels.map((label, index) => <button key={index} type="button"
        aria-label={`${label}, ${mobileCopy.positions[index]}`} aria-controls={`setup-mobile-panel-${index}`}
        aria-current={activePanel === index ? 'step' : undefined} onClick={() => navigate(index)}>
        <span aria-hidden="true" />
      </button>)}
    </nav>
  </>
}
