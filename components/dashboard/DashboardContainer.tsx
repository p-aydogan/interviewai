const DASHBOARD_CARDS = [
  ['Welcome', 'welcome'],
  ['Quick Actions', 'quick'],
  ['Recent Interviews', 'recent'],
  ['Recommended Jobs', 'jobs'],
  ['AI Insights', 'insights'],
  ['Daily Tip', 'tip'],
  ['Premium', 'premium'],
] as const

export default function DashboardContainer() {
  return (
    <section className="talentry-dashboard-container" aria-label="Dashboard overview">
      {DASHBOARD_CARDS.map(([title, variant]) => (
        <article
          className={`talentry-dashboard-card talentry-dashboard-card-${variant}`}
          key={title}
        >
          <h2 className="talentry-dashboard-card-title">{title}</h2>
        </article>
      ))}
    </section>
  )
}
