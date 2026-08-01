export default function Topbar() {
  return (
    <header className="talentry-dashboard-topbar">
      <div className="talentry-dashboard-mobile-brand">Talentry</div>

      <div className="talentry-dashboard-topbar-tools">
        <input
          className="talentry-dashboard-search"
          aria-label="Search placeholder"
          placeholder="Search"
          readOnly
        />
        <span className="talentry-dashboard-icon-button" aria-label="Notifications placeholder">
          ♢
        </span>
        <span className="talentry-dashboard-avatar" aria-label="Profile avatar placeholder">
          T
        </span>
      </div>
    </header>
  )
}
