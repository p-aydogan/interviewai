'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { DashboardCopy } from './dashboard-copy'

interface NavigationItem {
  label: string
  icon: string
  href?: string
  available: boolean
}

const NAVIGATION_ITEMS: readonly NavigationItem[] = [
  { label: 'Dashboard', icon: '⌂', href: '/dashboard', available: true },
  { label: 'Jobs & Opportunities', icon: '◇', available: false },
  { label: 'My Interviews', icon: '▣', available: false },
  { label: 'AI Coach', icon: '✦', available: false },
  { label: 'Reports', icon: '▤', available: false },
  { label: 'Saved Roles', icon: '♡', available: false },
  { label: 'Settings', icon: '⚙', available: false },
  { label: 'Premium', icon: '♢', available: false },
]

export default function Sidebar({ copy, mobile = false }: { copy: DashboardCopy; mobile?: boolean }) {
  const pathname = usePathname()

  return (
    <aside className={mobile ? 'talentry-dashboard-menu-page' : 'talentry-dashboard-sidebar'}>
      <div className="talentry-dashboard-brand">
        <span className="talentry-dashboard-brand-mark">T</span>
        <span className="talentry-dashboard-brand-name">Talentry</span>
      </div>

      <nav className="talentry-dashboard-nav" aria-label={copy.navigation}>
        {NAVIGATION_ITEMS.map((item, index) => {
          const label = copy.nav[index]
          const content = (
            <>
              <span className="talentry-dashboard-nav-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span className="talentry-dashboard-nav-label">{label}</span>
            </>
          )

          if (item.available && item.href) {
            const isActive = pathname === item.href

            return (
              <Link
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
                className={`talentry-dashboard-nav-item talentry-dashboard-nav-item--available${
                  isActive ? ' talentry-dashboard-nav-item--active' : ''
                }`}
                href={item.href}
                key={item.label}
              >
                {content}
              </Link>
            )
          }

          return (
            <div
              aria-label={label}
              aria-disabled="true"
              className="talentry-dashboard-nav-item talentry-dashboard-nav-item--unavailable"
              key={item.label}
            >
              {content}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
