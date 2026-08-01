import type { HTMLAttributes, ReactNode } from 'react'

import '@/styles/talentry-ui.css'

export type TalentryCardElement = 'section' | 'article' | 'div'
export type TalentryCardSurface = 'default' | 'lavender' | 'gradient'
export type TalentryCardPadding = 'none' | 'standard' | 'spacious'

export interface TalentryCardProps extends HTMLAttributes<HTMLElement> {
  as?: TalentryCardElement
  header?: ReactNode
  footer?: ReactNode
  surface?: TalentryCardSurface
  padding?: TalentryCardPadding
  interactive?: boolean
}

export default function TalentryCard({
  as: Component = 'section',
  children,
  className,
  footer,
  header,
  interactive = false,
  padding = 'standard',
  surface = 'default',
  tabIndex,
  ...nativeProps
}: TalentryCardProps) {
  const classes = [
    'talentry-card',
    `talentry-card--${surface}`,
    `talentry-card--padding-${padding}`,
    interactive && 'talentry-card--interactive',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Component
      className={classes}
      tabIndex={interactive ? (tabIndex ?? 0) : tabIndex}
      {...nativeProps}
    >
      {header !== undefined && <div className="talentry-card__header">{header}</div>}
      <div className="talentry-card__body">{children}</div>
      {footer !== undefined && <div className="talentry-card__footer">{footer}</div>}
    </Component>
  )
}
