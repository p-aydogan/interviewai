import type { HTMLAttributes } from 'react'

import '@/styles/talentry-ui.css'

export type TalentryBadgeTone =
  | 'neutral'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'premium'
  | 'ai'
  | 'new'
  | 'beta'
export type TalentryBadgeSize = 'small' | 'medium'

export interface TalentryBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: TalentryBadgeTone
  size?: TalentryBadgeSize
}

export default function TalentryBadge({
  children,
  className,
  size = 'medium',
  tone = 'neutral',
  ...nativeProps
}: TalentryBadgeProps) {
  const classes = [
    'talentry-badge',
    `talentry-badge--${tone}`,
    `talentry-badge--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span className={classes} {...nativeProps}>
      {children}
    </span>
  )
}
