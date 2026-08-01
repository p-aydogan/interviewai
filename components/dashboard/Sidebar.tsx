const NAVIGATION_ITEMS = [
  ['Dashboard', '⌂'],
  ['Jobs & Opportunities', '◇'],
  ['My Interviews', '▣'],
  ['AI Coach', '✦'],
  ['Reports', '▤'],
  ['Saved Roles', '♡'],
  ['Settings', '⚙'],
  ['Premium', '♢'],
] as const

export default function Sidebar() {
  return (
    <aside className="talentry-dashboard-sidebar">
      <div className="talentry-dashboard-brand">
        <span className="talentry-dashboard-brand-mark">T</span>
        <span className="talentry-dashboard-brand-name">Talentry</span>
      </div>

      <nav className="talentry-dashboard-nav" aria-label="Dashboard navigation">
        {NAVIGATION_ITEMS.map(([label, icon]) => (
          <div className="talentry-dashboard-nav-item" key={label}>
            <span className="talentry-dashboard-nav-icon" aria-hidden="true">
              {icon}
            </span>
            <span className="talentry-dashboard-nav-label">{label}</span>
          </div>
        ))}
      </nav>
    </aside>
  )
}
