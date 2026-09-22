import Link from 'next/link'
import { AUTH_ROUTES } from '@/lib/auth/auth-constants'
import type { PreAuthCopy } from './pre-auth-copy'

interface SplashScreenProps {
  copy: PreAuthCopy
  returning: boolean
  onStart: () => void
}

export default function SplashScreen({ copy, returning, onStart }: SplashScreenProps) {
  return <>
    <section className="talentry-pre-auth__content talentry-pre-auth__welcome">
      <span className="talentry-pre-auth__emblem talentry-pre-auth__emblem--brand" aria-hidden="true">T</span>
      <p className="talentry-pre-auth__eyebrow">Talentry</p>
      <h1 tabIndex={-1}>{copy.tagline}</h1>
      <p>{returning ? copy.returning : copy.welcome}</p>
    </section>
    <footer className="talentry-pre-auth__footer talentry-pre-auth__welcome-actions">
      {!returning && <button className="talentry-pre-auth__action talentry-pre-auth__action--primary"
        type="button" onClick={onStart}>{copy.start}<span aria-hidden="true"> →</span></button>}
      <div className="talentry-pre-auth__auth-actions">
        <Link className="talentry-pre-auth__action" href={AUTH_ROUTES.login}>{copy.signIn}</Link>
        <Link className="talentry-pre-auth__action" href={AUTH_ROUTES.register}>{copy.register}</Link>
      </div>
      {returning && <button className="talentry-pre-auth__text-action" type="button" onClick={onStart}>
        {copy.replay}
      </button>}
    </footer>
  </>
}
