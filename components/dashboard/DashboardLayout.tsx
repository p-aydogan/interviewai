import type { ReactNode } from 'react'

import Sidebar from './Sidebar'
import Topbar from './Topbar'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="talentry-dashboard-layout">
      <Sidebar />

      <div className="talentry-dashboard-shell">
        <Topbar />
        <main className="talentry-dashboard-main">{children}</main>
      </div>

      <nav className="talentry-dashboard-bottom-nav" aria-label="Mobile navigation placeholder">
        {['⌂', '◇', '▣', '✦', '●'].map((icon, index) => (
          <span key={`${icon}-${index}`} className="talentry-dashboard-bottom-item" aria-hidden="true">
            {icon}
          </span>
        ))}
      </nav>

      <style>{`
        :root {
          --dashboard-navy: #17233f;
          --dashboard-navy-soft: #223154;
          --dashboard-purple: #7657e8;
          --dashboard-purple-soft: #eeeafe;
          --dashboard-lavender: #f7f5ff;
          --dashboard-canvas: #f4f6fb;
          --dashboard-text: #202944;
          --dashboard-muted: #7a839d;
          --dashboard-border: #e8e8f2;
        }

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: var(--dashboard-canvas);
          color: var(--dashboard-text);
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .talentry-dashboard-layout {
          min-height: 100vh;
          background: var(--dashboard-canvas);
        }

        .talentry-dashboard-shell {
          min-width: 0;
        }

        .talentry-dashboard-main {
          padding: 20px 16px 104px;
        }

        .talentry-dashboard-sidebar {
          display: none;
        }

        .talentry-dashboard-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 10px 30px;
          color: #ffffff;
          font-size: 19px;
          font-weight: 800;
          letter-spacing: -0.03em;
        }

        .talentry-dashboard-brand-mark {
          display: grid;
          width: 34px;
          height: 34px;
          place-items: center;
          border-radius: 11px;
          background: linear-gradient(135deg, #9a83f3, var(--dashboard-purple));
          box-shadow: 0 8px 20px rgba(118, 87, 232, 0.35);
        }

        .talentry-dashboard-nav {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .talentry-dashboard-nav-item {
          display: flex;
          align-items: center;
          gap: 13px;
          min-height: 46px;
          padding: 0 13px;
          border-radius: 13px;
          color: #b8c2da;
          font-size: 14px;
          font-weight: 600;
          white-space: nowrap;
        }

        .talentry-dashboard-nav-item:first-child {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.11);
        }

        .talentry-dashboard-nav-icon {
          display: grid;
          width: 25px;
          height: 25px;
          flex: 0 0 25px;
          place-items: center;
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 8px;
          font-size: 12px;
        }

        .talentry-dashboard-topbar {
          position: sticky;
          top: 0;
          z-index: 10;
          display: flex;
          min-height: 72px;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 12px 16px;
          border-bottom: 1px solid var(--dashboard-border);
          background: rgba(255, 255, 255, 0.94);
          backdrop-filter: blur(16px);
        }

        .talentry-dashboard-mobile-brand {
          color: var(--dashboard-navy);
          font-size: 18px;
          font-weight: 800;
          letter-spacing: -0.03em;
        }

        .talentry-dashboard-topbar-tools {
          display: flex;
          min-width: 0;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
        }

        .talentry-dashboard-search {
          display: none;
          width: min(320px, 34vw);
          height: 42px;
          padding: 0 16px;
          border: 1px solid var(--dashboard-border);
          border-radius: 14px;
          outline: none;
          background: var(--dashboard-lavender);
          color: var(--dashboard-text);
          font: inherit;
        }

        .talentry-dashboard-search::placeholder {
          color: var(--dashboard-muted);
        }

        .talentry-dashboard-icon-button,
        .talentry-dashboard-avatar {
          display: grid;
          width: 42px;
          height: 42px;
          place-items: center;
          border: 1px solid var(--dashboard-border);
          border-radius: 14px;
          background: #ffffff;
          color: var(--dashboard-navy);
          font-size: 15px;
        }

        .talentry-dashboard-avatar {
          border: 0;
          background: var(--dashboard-purple-soft);
          color: var(--dashboard-purple);
          font-weight: 800;
        }

        .talentry-dashboard-container {
          display: grid;
          width: 100%;
          max-width: 1440px;
          margin: 0 auto;
          gap: 16px;
        }

        .talentry-dashboard-card {
          min-height: 150px;
          padding: 22px;
          border: 1px solid var(--dashboard-border);
          border-radius: 22px;
          background: #ffffff;
          box-shadow: 0 10px 30px rgba(31, 42, 75, 0.045);
        }

        .talentry-dashboard-card:nth-child(2n) {
          background: var(--dashboard-lavender);
        }

        .talentry-dashboard-card-title {
          margin: 0;
          color: var(--dashboard-text);
          font-size: 17px;
          font-weight: 750;
          letter-spacing: -0.02em;
        }

        .talentry-dashboard-card-welcome,
        .talentry-dashboard-card-premium {
          background: linear-gradient(135deg, #ffffff 0%, var(--dashboard-purple-soft) 100%);
        }

        .talentry-dashboard-bottom-nav {
          position: fixed;
          right: 12px;
          bottom: 12px;
          left: 12px;
          z-index: 20;
          display: flex;
          height: 66px;
          align-items: center;
          justify-content: space-around;
          border: 1px solid var(--dashboard-border);
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.96);
          box-shadow: 0 14px 40px rgba(31, 42, 75, 0.16);
          backdrop-filter: blur(16px);
        }

        .talentry-dashboard-bottom-item {
          display: grid;
          width: 38px;
          height: 38px;
          place-items: center;
          border-radius: 12px;
          color: var(--dashboard-muted);
        }

        .talentry-dashboard-bottom-item:first-child {
          background: var(--dashboard-purple-soft);
          color: var(--dashboard-purple);
        }

        @media (min-width: 640px) {
          .talentry-dashboard-main {
            padding: 28px 24px 104px;
          }

          .talentry-dashboard-search {
            display: block;
          }

          .talentry-dashboard-container {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 20px;
          }

          .talentry-dashboard-card-welcome,
          .talentry-dashboard-card-recent,
          .talentry-dashboard-card-jobs {
            grid-column: 1 / -1;
          }
        }

        @media (min-width: 768px) {
          .talentry-dashboard-layout {
            display: grid;
            grid-template-columns: 82px minmax(0, 1fr);
          }

          .talentry-dashboard-sidebar {
            position: sticky;
            top: 0;
            display: flex;
            height: 100vh;
            flex-direction: column;
            padding: 22px 12px;
            overflow: hidden;
            background: var(--dashboard-navy);
          }

          .talentry-dashboard-brand {
            justify-content: center;
            padding-inline: 0;
          }

          .talentry-dashboard-brand-name,
          .talentry-dashboard-nav-label {
            display: none;
          }

          .talentry-dashboard-nav-item {
            justify-content: center;
            padding-inline: 0;
          }

          .talentry-dashboard-mobile-brand,
          .talentry-dashboard-bottom-nav {
            display: none;
          }

          .talentry-dashboard-main {
            padding-bottom: 36px;
          }
        }

        @media (min-width: 1120px) {
          .talentry-dashboard-layout {
            grid-template-columns: 252px minmax(0, 1fr);
          }

          .talentry-dashboard-sidebar {
            padding: 24px 18px;
          }

          .talentry-dashboard-brand {
            justify-content: flex-start;
            padding-inline: 10px;
          }

          .talentry-dashboard-brand-name,
          .talentry-dashboard-nav-label {
            display: inline;
          }

          .talentry-dashboard-nav-item {
            justify-content: flex-start;
            padding-inline: 13px;
          }

          .talentry-dashboard-topbar {
            min-height: 80px;
            padding: 16px 32px;
          }

          .talentry-dashboard-main {
            padding: 32px;
          }

          .talentry-dashboard-container {
            grid-template-columns: repeat(12, minmax(0, 1fr));
            gap: 22px;
          }

          .talentry-dashboard-card-welcome {
            grid-column: span 8;
            min-height: 190px;
          }

          .talentry-dashboard-card-quick {
            grid-column: span 4;
            min-height: 190px;
          }

          .talentry-dashboard-card-recent,
          .talentry-dashboard-card-jobs {
            grid-column: span 6;
            min-height: 260px;
          }

          .talentry-dashboard-card-insights,
          .talentry-dashboard-card-tip,
          .talentry-dashboard-card-premium {
            grid-column: span 4;
            min-height: 180px;
          }
        }
      `}</style>
    </div>
  )
}
