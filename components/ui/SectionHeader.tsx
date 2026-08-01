import type { HTMLAttributes, ReactNode } from 'react'

import '@/styles/talentry-ui.css'

export type SectionHeaderHeading = 'h1' | 'h2' | 'h3' | 'h4'

export interface SectionHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title: ReactNode
  description?: ReactNode
  eyebrow?: ReactNode
  action?: ReactNode
  headingAs?: SectionHeaderHeading
}

export default function SectionHeader({
  action,
  className,
  description,
  eyebrow,
  headingAs: Heading = 'h2',
  title,
  ...nativeProps
}: SectionHeaderProps) {
  const classes = ['talentry-section-header', className].filter(Boolean).join(' ')

  return (
    <header className={classes} {...nativeProps}>
      <div className="talentry-section-header__content">
        {eyebrow !== undefined && (
          <div className="talentry-section-header__eyebrow">{eyebrow}</div>
        )}
        <Heading className="talentry-section-header__title">{title}</Heading>
        {description !== undefined && (
          <div className="talentry-section-header__description">{description}</div>
        )}
      </div>
      {action !== undefined && <div className="talentry-section-header__action">{action}</div>}
    </header>
  )
}
