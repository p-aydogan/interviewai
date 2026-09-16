import type { DashboardCopy } from './dashboard-copy'

export default function Topbar({ copy }: { copy: DashboardCopy }) {
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
        <span className="talentry-dashboard-avatar" aria-label={copy.profile}>
          T
        </span>
      </div>
    </header>
  )
}
