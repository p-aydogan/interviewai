import type { ReactNode } from 'react'
import type { DashboardCopy } from './dashboard-copy'

export default function Topbar({ copy, accountControl }: { copy: DashboardCopy; accountControl: ReactNode }) {
  return (
    <header className="talentry-dashboard-topbar">
      <div className="talentry-dashboard-mobile-brand">Talentry</div>

      <div className="talentry-dashboard-topbar-tools">
        <input
          className="talentry-dashboard-search"
          aria-label={copy.search}
          placeholder={copy.search}
          readOnly
        />
        <span className="talentry-dashboard-icon-button" aria-label={copy.notifications}>
          ♢
        </span>
        {accountControl}
      </div>
    </header>
  )
}
