import { SUPPORTED_APP_LANGUAGES } from '@/lib/auth/auth-constants'
import type { AppLanguage } from '@/types/auth'
import { ACCOUNT_COPY } from './account-copy'

export default function LanguageSelector({ language, onChange }: {
  language: AppLanguage; onChange: (language: AppLanguage) => void
}) {
  return <fieldset className="talentry-account-language">
    <legend>{ACCOUNT_COPY[language].language}</legend>
    <div>{SUPPORTED_APP_LANGUAGES.map(value => <button type="button" key={value}
      aria-pressed={language === value} onClick={() => onChange(value)}>
      {language === value && <span aria-hidden="true">✓ </span>}{value.toUpperCase()}
    </button>)}</div>
  </fieldset>
}
