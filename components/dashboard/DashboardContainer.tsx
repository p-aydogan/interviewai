'use client'

import Link from 'next/link'
import { useContext } from 'react'
import { DashboardLanguageContext } from './DashboardLayout'
import { DASHBOARD_COPY } from './dashboard-copy'
import DashboardMobile from './DashboardMobile'
import RecentInterviews from './RecentInterviews'
import Sidebar from './Sidebar'
import { useInterviewHistory } from './useInterviewHistory'

const DESKTOP_GROUPS = [
  ['welcome', 'quick'], ['recent'], ['jobs', 'insights', 'tip', 'premium'],
] as const
type CardVariant = typeof DESKTOP_GROUPS[number][number]

export default function DashboardContainer() {
  const language = useContext(DashboardLanguageContext)
  const copy = DASHBOARD_COPY[language]
  const { state, retry } = useInterviewHistory()

  function renderCard(variant: CardVariant) {
    return (
      <article className={`talentry-dashboard-card talentry-dashboard-card-${variant}`} key={variant}>
        <h2 className="talentry-dashboard-card-title">{copy[variant]}</h2>
        {variant === 'quick' && <Link
          className="talentry-button talentry-button--primary talentry-button--large talentry-history-action"
          href="/interview/setup">{copy.start}</Link>}
        {variant === 'recent' && <>
          <p className="talentry-history-caption">{copy.latest}</p>
          <RecentInterviews state={state} retry={retry} copy={copy} language={language} />
        </>}
      </article>
    )
  }

  return (
    <>
      <section className="talentry-dashboard-container talentry-dashboard-desktop" aria-label={copy.overview}>
        <div className="talentry-dashboard-mobile-viewport">
          <div className="talentry-dashboard-mobile-track">
            {DESKTOP_GROUPS.map((group, index) => (
              <div className="talentry-dashboard-mobile-panel" key={index}>{group.map(renderCard)}</div>
            ))}
          </div>
        </div>
      </section>
      <DashboardMobile labels={copy.panels} navigationLabel={copy.navigation}
        pages={[
          <div key="home" className="talentry-dashboard-mobile-cards">
            <input className="talentry-dashboard-page-search" aria-label={copy.search}
              placeholder={copy.search} readOnly />
            {renderCard('welcome')}
            <Sidebar copy={copy} mobile />
          </div>,
          <div key="recent" className="talentry-dashboard-mobile-cards">
            {renderCard('recent')}
          </div>,
          <div key="actions" className="talentry-dashboard-mobile-cards">
            {(['quick', 'jobs', 'insights', 'tip', 'premium'] as const).map(renderCard)}
          </div>,
        ]} />
    </>
  )
}
