'use client'

import Link from 'next/link'
import { useContext } from 'react'
import { DashboardLanguageContext, AccountLanguageContext } from '@/components/dashboard/DashboardLayout'
import type { UserIdentity } from '@/lib/auth/user-identity'
import { ACCOUNT_COPY } from './account-copy'
import LanguageSelector from './LanguageSelector'

export default function AccountPageContent({ page, identity }: {
  page: 'profile' | 'settings' | 'help'; identity: UserIdentity
}) {
  const language = useContext(DashboardLanguageContext)
  const changeLanguage = useContext(AccountLanguageContext)
  const copy = ACCOUNT_COPY[language]
  return <section className="talentry-account-content">
    <Link className="talentry-account-back" href="/dashboard">{copy.back}</Link>
    <h1>{copy[page]}</h1>
    <p>{copy[`${page}Description`]}</p>
    {page === 'profile' && <dl className="talentry-account-card">
      <dt>{copy.displayName}</dt><dd>{identity.displayName ?? copy.missing}</dd>
      <dt>{copy.email}</dt><dd>{identity.email ?? copy.missing}</dd>
    </dl>}
    {page === 'settings' && <>
      <div className="talentry-account-card">
        <LanguageSelector language={language} onChange={changeLanguage} />
        <p>{copy.languageDescription}</p>
      </div>
      <section className="talentry-account-card">
        <h2>{copy.security}</h2><p>{copy.recoveryDescription}</p>
        <Link href="/forgot-password">{copy.recovery}</Link>
      </section>
    </>}
    {page === 'help' && copy.guidance.map(item => <section className="talentry-account-card" key={item.title}>
      <h2>{item.href ? <Link href={item.href}>{item.title}</Link> : item.title}</h2>
      <p>{item.description}</p>
    </section>)}
  </section>
}
