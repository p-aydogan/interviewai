import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'

import '@/styles/talentry-ui.css'

export type TalentryButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'icon'
export type TalentryButtonSize = 'small' | 'medium' | 'large'

type NativeButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

interface TalentryButtonOwnProps {
  loading?: boolean
  loadingText?: string
  size?: TalentryButtonSize
}

type TalentryIconButtonProps = Omit<NativeButtonProps, 'aria-label'> &
  TalentryButtonOwnProps & {
    variant: 'icon'
    'aria-label': string
  }

type TalentryStandardButtonProps = NativeButtonProps &
  TalentryButtonOwnProps & {
    variant?: Exclude<TalentryButtonVariant, 'icon'>
  }

export type TalentryButtonProps = TalentryIconButtonProps | TalentryStandardButtonProps

const TalentryButton = forwardRef<HTMLButtonElement, TalentryButtonProps>(function TalentryButton(
  {
    children,
    className,
    disabled = false,
    loading = false,
    loadingText = 'Loading',
    size = 'medium',
    type = 'button',
    variant = 'primary',
    ...nativeProps
  },
  ref,
) {
  const classes = [
    'talentry-button',
    `talentry-button--${variant}`,
    `talentry-button--${size}`,
    loading && 'talentry-button--loading',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      {...nativeProps}
      aria-busy={loading || undefined}
      className={classes}
      disabled={disabled || loading}
      ref={ref}
      type={type}
    >
      <span className="talentry-button__content">{children}</span>
      {loading && (
        <>
          <span className="talentry-button__spinner" aria-hidden="true" />
          <span className="talentry-button__loading-text">{loadingText}</span>
        </>
      )}
    </button>
  )
})

export default TalentryButton
