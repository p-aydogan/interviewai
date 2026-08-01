import type { ReactNode } from 'react'

import TalentryCard from './TalentryCard'
import type { TalentryCardProps } from './TalentryCard'

export type EmptyStateHeading = 'h2' | 'h3'
export type EmptyStateVariant = 'standard' | 'compact'

export interface EmptyStateProps
  extends Omit<TalentryCardProps, 'children' | 'footer' | 'header' | 'title'> {
  title: ReactNode
  description?: ReactNode
  icon?: ReactNode
  action?: ReactNode
  headingAs?: EmptyStateHeading
  variant?: EmptyStateVariant
}

export default function EmptyState({
  action,
  className,
  description,
  headingAs: Heading = 'h2',
  icon,
  surface = 'lavender',
  title,
  variant = 'standard',
  ...cardProps
}: EmptyStateProps) {
  const classes = [
    'talentry-empty-state',
    `talentry-empty-state--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <TalentryCard className={classes} surface={surface} {...cardProps}>
      {icon !== undefined && (
        <div className="talentry-empty-state__icon" aria-hidden="true">
          {icon}
        </div>
      )}
      <Heading className="talentry-empty-state__title">{title}</Heading>
      {description !== undefined && (
        <div className="talentry-empty-state__description">{description}</div>
      )}
      {action !== undefined && <div className="talentry-empty-state__action">{action}</div>}
    </TalentryCard>
  )
}
