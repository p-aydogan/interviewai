export type AppLanguage = 'tr' | 'en' | 'de'

export type AuthMode =
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'verify-code'
  | 'reset-password'

export interface AuthFormState {
  email: string
  password: string
  confirmPassword: string
  otp: string
}
