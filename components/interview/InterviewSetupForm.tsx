'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import { SectionHeader, TalentryButton, TalentryCard } from '@/components/ui'
import { AUTH_ROUTES, DEFAULT_APP_LANGUAGE, SUPPORTED_APP_LANGUAGES } from '@/lib/auth/auth-constants'
import type { AppLanguage } from '@/types/auth'

import InterviewSetupMobile from './InterviewSetupMobile'
import { COPY, INTERVIEWERS, LANGUAGE_LABELS, LANGUAGE_NAMES, UI_LANGUAGE_STORAGE_KEY } from './interview-setup-config'
import type { InterviewerId, InterviewLevel, InterviewType, InterviewPersona } from './interview-setup-config'
function isAppLanguage(value: string | null): value is AppLanguage {
  return SUPPORTED_APP_LANGUAGES.some((language) => language === value)
}

export default function InterviewSetupForm() {
  const router = useRouter()
  const [uiLanguage, setUiLanguage] = useState<AppLanguage>(DEFAULT_APP_LANGUAGE)
  const [interviewer, setInterviewer] = useState<InterviewerId>('f')
  const [role, setRole] = useState('')
  const [company, setCompany] = useState('')
  const [level, setLevel] = useState<InterviewLevel>('mid')
  const [interviewType, setInterviewType] = useState<InterviewType>('behavioral')
  const [persona, setPersona] = useState<InterviewPersona>('formal')
  const [interviewLanguage, setInterviewLanguage] = useState<AppLanguage>('tr')
  const copy = COPY[uiLanguage]
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(max-width: 640px)')
    const syncViewport = () => setIsMobile(query.matches)
    syncViewport()
    query.addEventListener('change', syncViewport)
    return () => query.removeEventListener('change', syncViewport)
  }, [])

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem(UI_LANGUAGE_STORAGE_KEY)
    if (isAppLanguage(savedLanguage)) setUiLanguage(savedLanguage)
  }, [])

  function changeUiLanguage(language: AppLanguage) {
    setUiLanguage(language)
    window.localStorage.setItem(UI_LANGUAGE_STORAGE_KEY, language)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const params = new URLSearchParams({
      iv: interviewer,
      role: role.trim(),
      company: company.trim(),
      level,
      itype: interviewType,
      persona,
      language: interviewLanguage,
      cv: '',
    })
    router.push(`/interview?${params.toString()}`)
  }

  return (
    <main className="talentry-setup-shell" lang={uiLanguage}>
      <header className="talentry-setup-header">
        <Link aria-label="Talentry interview setup" className="talentry-setup-brand" href="/interview/setup">
          <span className="talentry-setup-brand__mark" aria-hidden="true">T</span>
          <span>Talentry</span>
        </Link>
        <div className="talentry-setup-header__actions">
          <div aria-label="Application language" className="talentry-setup-language" role="group">
            {SUPPORTED_APP_LANGUAGES.map((language) => (
              <button
                aria-label={`Application language: ${LANGUAGE_NAMES[language]}`}
                aria-pressed={uiLanguage === language}
                key={language}
                onClick={() => changeUiLanguage(language)}
                type="button"
              >
                {LANGUAGE_LABELS[language]}
              </button>
            ))}
          </div>
          <Link className="talentry-setup-dashboard-link" href={AUTH_ROUTES.dashboard}>
            {copy.backToDashboard}
          </Link>
        </div>
      </header>

      {isMobile ? (
        <form className="talentry-setup-mobile-form" onSubmit={handleSubmit}>
          <InterviewSetupMobile
            copy={copy} uiLanguage={uiLanguage}
            values={{ interviewer, role, company, level, interviewType, persona, interviewLanguage }}
            changes={{ interviewer: setInterviewer, role: setRole, company: setCompany, level: setLevel,
              interviewType: setInterviewType, persona: setPersona, interviewLanguage: setInterviewLanguage }}
          />
        </form>
      ) : (
      <div className="talentry-setup-content">
        <SectionHeader
          className="talentry-setup-intro"
          description={copy.description}
          eyebrow={copy.eyebrow}
          headingAs="h1"
          title={copy.title}
        />

        <form className="talentry-setup-form" onSubmit={handleSubmit}>
          <TalentryCard className="talentry-setup-interviewers" padding="spacious" surface="lavender">
            <fieldset>
              <legend>{copy.interviewerLegend}</legend>
              <p>{copy.interviewerHelp}</p>
              <div className="talentry-setup-interviewer-list">
                {INTERVIEWERS.map((option) => (
                  <div className="talentry-setup-interviewer-option" key={option.id}>
                    <input
                      checked={interviewer === option.id}
                      id={`setup-interviewer-${option.id}`}
                      name="interviewer"
                      onChange={() => setInterviewer(option.id)}
                      type="radio"
                      value={option.id}
                    />
                    <label htmlFor={`setup-interviewer-${option.id}`}>
                      <img alt={option.name} src={option.photo} />
                      <span className="talentry-setup-interviewer-option__identity">
                        <strong>{option.name}</strong>
                        <span>{option.role}</span>
                      </span>
                      <span className="talentry-setup-interviewer-option__selected" aria-hidden="true">
                        <span>✓</span> {copy.selected}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </fieldset>
          </TalentryCard>

          <TalentryCard className="talentry-setup-configuration" padding="spacious">
            <SectionHeader
              description={copy.configurationDescription}
              headingAs="h2"
              title={copy.configurationTitle}
            />
            <div className="talentry-setup-fields">
              <div className="talentry-setup-field">
                <label htmlFor="setup-role">{copy.role} <span>{copy.optional}</span></label>
                <input id="setup-role" onChange={(event) => setRole(event.target.value)} placeholder={copy.rolePlaceholder} type="text" value={role} />
              </div>
              <div className="talentry-setup-field">
                <label htmlFor="setup-company">{copy.company} <span>{copy.optional}</span></label>
                <input id="setup-company" onChange={(event) => setCompany(event.target.value)} placeholder={copy.companyPlaceholder} type="text" value={company} />
              </div>
              <div className="talentry-setup-field">
                <label htmlFor="setup-level">{copy.level}</label>
                <select id="setup-level" onChange={(event) => setLevel(event.target.value as InterviewLevel)} value={level}>
                  <option value="junior">{copy.junior}</option><option value="mid">{copy.mid}</option><option value="senior">{copy.senior}</option>
                </select>
              </div>
              <div className="talentry-setup-field">
                <label htmlFor="setup-type">{copy.interviewType}</label>
                <select id="setup-type" onChange={(event) => setInterviewType(event.target.value as InterviewType)} value={interviewType}>
                  <option value="behavioral">{copy.behavioral}</option><option value="technical">{copy.technical}</option><option value="mixed">{copy.mixed}</option><option value="case">{copy.caseStudy}</option>
                </select>
              </div>
              <div className="talentry-setup-field">
                <label htmlFor="setup-persona">{copy.persona}</label>
                <select id="setup-persona" onChange={(event) => setPersona(event.target.value as InterviewPersona)} value={persona}>
                  <option value="friendly">{copy.friendly}</option><option value="formal">{copy.formal}</option><option value="tough">{copy.tough}</option><option value="curious">{copy.curious}</option>
                </select>
              </div>
              <div className="talentry-setup-field">
                <label htmlFor="setup-language">{copy.interviewLanguage}</label>
                <select id="setup-language" onChange={(event) => setInterviewLanguage(event.target.value as AppLanguage)} value={interviewLanguage}>
                  <option value="tr">Türkçe</option><option value="en">English</option><option value="de">Deutsch</option>
                </select>
              </div>
            </div>
            <TalentryButton className="talentry-setup-submit" size="large" type="submit">
              <span>{copy.start}</span><span aria-hidden="true">→</span>
            </TalentryButton>
          </TalentryCard>
        </form>
      </div>
      )}
    </main>
  )
}
