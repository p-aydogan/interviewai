import type { AppLanguage } from '@/types/auth'

export const SUPPORTED_APP_LANGUAGES = [
  'tr',
  'en',
  'de',
] as const satisfies readonly AppLanguage[]

export const DEFAULT_APP_LANGUAGE: AppLanguage = 'tr'

export const PASSWORD_MIN_LENGTH = 8

export const OTP_LENGTH = 6

export const PENDING_VERIFICATION_EMAIL_KEY = 'talentry.pending-verification-email'

export const AUTH_ROUTES = {
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  verifyCode: '/verify',
  resetPassword: '/reset-password',
  resetPasswordSuccess: '/reset-password/success',
  dashboard: '/dashboard',
} as const
