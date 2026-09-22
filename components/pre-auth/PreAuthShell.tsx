import { useId } from 'react'
import type { ReactNode } from 'react'
import { SUPPORTED_APP_LANGUAGES } from '@/lib/auth/auth-constants'
import type { AppLanguage } from '@/types/auth'
import type { PreAuthCopy } from './pre-auth-copy'

interface PreAuthShellProps {
  ready: boolean
  children: ReactNode
  language: AppLanguage
  copy: PreAuthCopy
  onLanguageChange: (language: AppLanguage) => void
}

export default function PreAuthShell({ children, ready, language, copy, onLanguageChange }: PreAuthShellProps) {
  const gradientId = useId()
  return <main className="talentry-pre-auth" lang={ready ? language : undefined} aria-busy={!ready}>
    <div className="talentry-pre-auth__swells" aria-hidden="true">
      <svg viewBox="0 0 1200 900" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <defs>
          {(['far', 'middle', 'near'] as const).map(depth => (
            <linearGradient key={depth} id={`${gradientId}-${depth}`} x1="0" y1="0" x2="0" y2="1"
              className={`talentry-pre-auth__swell-gradient talentry-pre-auth__swell-gradient--${depth}`}>
              <stop offset="0%" stopOpacity="0" />
              <stop offset="28%" stopOpacity="0.6" />
              <stop offset="50%" stopOpacity="1" />
              <stop offset="72%" stopOpacity="0.6" />
              <stop offset="100%" stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>
        {/* Four joined periods give both edges blur runway throughout each 1200-unit loop. */}
        <g className="talentry-pre-auth__swell talentry-pre-auth__swell--far">
          <path fill={`url(#${gradientId}-far)`} d="M-1200 40 C-1020 -110 -810 -110 -600 40 C-400 145 -180 190 0 40 C180 -110 390 -110 600 40 C800 145 1020 190 1200 40 C1380 -110 1590 -110 1800 40 C2000 145 2220 190 2400 40 C2580 -110 2790 -110 3000 40 C3200 145 3420 190 3600 40 L3600 360 C3420 510 3200 465 3000 360 C2790 210 2580 210 2400 360 C2220 510 2000 465 1800 360 C1590 210 1380 210 1200 360 C1020 510 800 465 600 360 C390 210 180 210 0 360 C-180 510 -400 465 -600 360 C-810 210 -1020 210 -1200 360 Z" />
        </g>
        <g className="talentry-pre-auth__swell talentry-pre-auth__swell--middle">
          <path fill={`url(#${gradientId}-middle)`} d="M-1200 230 C-1020 110 -810 110 -600 230 C-400 314 -180 350 0 230 C180 110 390 110 600 230 C800 314 1020 350 1200 230 C1380 110 1590 110 1800 230 C2000 314 2220 350 2400 230 C2580 110 2790 110 3000 230 C3200 314 3420 350 3600 230 L3600 590 C3420 710 3200 674 3000 590 C2790 470 2580 470 2400 590 C2220 710 2000 674 1800 590 C1590 470 1380 470 1200 590 C1020 710 800 674 600 590 C390 470 180 470 0 590 C-180 710 -400 674 -600 590 C-810 470 -1020 470 -1200 590 Z" />
        </g>
        <g className="talentry-pre-auth__swell talentry-pre-auth__swell--near">
          <path fill={`url(#${gradientId}-near)`} d="M-1200 440 C-1020 340 -810 340 -600 440 C-400 510 -180 540 0 440 C180 340 390 340 600 440 C800 510 1020 540 1200 440 C1380 340 1590 340 1800 440 C2000 510 2220 540 2400 440 C2580 340 2790 340 3000 440 C3200 510 3420 540 3600 440 L3600 780 C3420 880 3200 850 3000 780 C2790 680 2580 680 2400 780 C2220 880 2000 850 1800 780 C1590 680 1380 680 1200 780 C1020 880 800 850 600 780 C390 680 180 680 0 780 C-180 880 -400 850 -600 780 C-810 680 -1020 680 -1200 780 Z" />
        </g>
      </svg>
    </div>
    <div className="talentry-pre-auth__frame">
      <header className="talentry-pre-auth__header">
        <div className="talentry-pre-auth__brand" aria-label="Talentry">
          <span className="talentry-pre-auth__mark" aria-hidden="true">T</span>
          <span>Talentry</span>
        </div>
        <fieldset className="talentry-pre-auth__languages" disabled={!ready}
          aria-hidden={!ready || undefined} style={{ visibility: ready ? 'visible' : 'hidden' }}>
          <legend className="talentry-pre-auth__sr-only">{ready ? copy.language : null}</legend>
          {SUPPORTED_APP_LANGUAGES.map(value => <button key={value} type="button"
            lang={value} aria-label={{ tr: 'Türkçe', en: 'English', de: 'Deutsch' }[value]}
            aria-pressed={language === value} onClick={() => onLanguageChange(value)}>
            {value.toUpperCase()}
          </button>)}
        </fieldset>
      </header>
      <div className="talentry-pre-auth__card" style={{ visibility: ready ? 'visible' : 'hidden' }}>{children}</div>
    </div>
  </main>
}
