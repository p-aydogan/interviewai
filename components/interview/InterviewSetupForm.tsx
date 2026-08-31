'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import { SectionHeader, TalentryButton, TalentryCard } from '@/components/ui'
import { AUTH_ROUTES, DEFAULT_APP_LANGUAGE, SUPPORTED_APP_LANGUAGES } from '@/lib/auth/auth-constants'
import type { AppLanguage } from '@/types/auth'

type InterviewerId = 'f' | 'm'
type InterviewLevel = 'junior' | 'mid' | 'senior'
type InterviewType = 'behavioral' | 'technical' | 'mixed' | 'case'
type InterviewPersona = 'friendly' | 'formal' | 'tough' | 'curious'

type SetupCopy = {
  eyebrow: string
  title: string
  description: string
  interviewerLegend: string
  interviewerHelp: string
  selected: string
  configurationTitle: string
  configurationDescription: string
  role: string
  rolePlaceholder: string
  company: string
  companyPlaceholder: string
  level: string
  interviewType: string
  persona: string
  interviewLanguage: string
  optional: string
  start: string
  backToDashboard: string
  junior: string
  mid: string
  senior: string
  behavioral: string
  technical: string
  mixed: string
  caseStudy: string
  friendly: string
  formal: string
  tough: string
  curious: string
}

const UI_LANGUAGE_STORAGE_KEY = 'interviewai_uilang'

const INTERVIEWERS = [
  {
    id: 'f',
    name: 'Sarah Chen',
    role: 'Sr. HR Manager',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=face',
  },
  {
    id: 'm',
    name: 'Marcus Reid',
    role: 'Tech Lead',
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop&crop=face',
  },
] as const

const COPY: Record<AppLanguage, SetupCopy> = {
  tr: {
    eyebrow: 'Mülakat hazırlığı',
    title: 'Bir sonraki görüşmene hazırlan.',
    description: 'Mülakatçını ve görüşme tercihlerini seç. Hazır olduğunda yapay zekâ destekli görüşmeni başlat.',
    interviewerLegend: 'Mülakatçını seç', interviewerHelp: 'Pratik tarzına uygun görüşmeciyi seç.', selected: 'Seçildi',
    configurationTitle: 'Görüşme ayarları', configurationDescription: 'Deneyimi hedeflediğin role göre şekillendir.',
    role: 'Hedef pozisyon', rolePlaceholder: 'Örn. Product Manager', company: 'Şirket / sektör', companyPlaceholder: 'Örn. Fintech',
    level: 'Kariyer seviyesi', interviewType: 'Mülakat türü', persona: 'Mülakatçı tarzı', interviewLanguage: 'Mülakat dili',
    optional: 'İsteğe bağlı', start: 'Mülakatı Başlat', backToDashboard: "Dashboard'a Dön",
    junior: 'Junior (0–2 yıl)', mid: 'Mid-level (2–5 yıl)', senior: 'Senior (5+ yıl)',
    behavioral: 'Davranışsal / İK', technical: 'Teknik', mixed: 'Karma', caseStudy: 'Vaka Analizi',
    friendly: 'Arkadaşça', formal: 'Profesyonel', tough: 'Zorlu', curious: 'Analitik',
  },
  en: {
    eyebrow: 'Interview preparation',
    title: 'Prepare for your next interview.',
    description: 'Choose your interviewer and session preferences. Start your AI-powered interview when you are ready.',
    interviewerLegend: 'Choose your interviewer', interviewerHelp: 'Select the interviewer who fits your practice style.', selected: 'Selected',
    configurationTitle: 'Interview settings', configurationDescription: 'Shape the experience around the role you are targeting.',
    role: 'Target role', rolePlaceholder: 'e.g. Product Manager', company: 'Company / sector', companyPlaceholder: 'e.g. Fintech',
    level: 'Career level', interviewType: 'Interview type', persona: 'Interviewer persona', interviewLanguage: 'Interview language',
    optional: 'Optional', start: 'Start Interview', backToDashboard: 'Back to Dashboard',
    junior: 'Junior (0–2 years)', mid: 'Mid-level (2–5 years)', senior: 'Senior (5+ years)',
    behavioral: 'Behavioral / HR', technical: 'Technical', mixed: 'Mixed', caseStudy: 'Case Study',
    friendly: 'Friendly', formal: 'Professional', tough: 'Tough', curious: 'Analytical',
  },
  de: {
    eyebrow: 'Interviewvorbereitung',
    title: 'Bereite dich auf dein nächstes Gespräch vor.',
    description: 'Wähle Interviewer und Gesprächseinstellungen. Starte dein KI-gestütztes Interview, wenn du bereit bist.',
    interviewerLegend: 'Interviewer auswählen', interviewerHelp: 'Wähle die Person, die zu deinem Übungsstil passt.', selected: 'Ausgewählt',
    configurationTitle: 'Gesprächseinstellungen', configurationDescription: 'Richte das Erlebnis auf deine Zielposition aus.',
    role: 'Zielposition', rolePlaceholder: 'z. B. Product Manager', company: 'Unternehmen / Branche', companyPlaceholder: 'z. B. Fintech',
    level: 'Karrierestufe', interviewType: 'Gesprächsart', persona: 'Interviewer-Stil', interviewLanguage: 'Gesprächssprache',
    optional: 'Optional', start: 'Interview starten', backToDashboard: 'Zurück zum Dashboard',
    junior: 'Junior (0–2 Jahre)', mid: 'Mid-level (2–5 Jahre)', senior: 'Senior (5+ Jahre)',
    behavioral: 'Verhalten / HR', technical: 'Technisch', mixed: 'Gemischt', caseStudy: 'Fallstudie',
    friendly: 'Freundlich', formal: 'Professionell', tough: 'Anspruchsvoll', curious: 'Analytisch',
  },
}

const LANGUAGE_LABELS: Record<AppLanguage, string> = { tr: 'TR', en: 'EN', de: 'DE' }
const LANGUAGE_NAMES: Record<AppLanguage, string> = { tr: 'Türkçe', en: 'English', de: 'Deutsch' }

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
    <main className="talentry-setup-shell">
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
    </main>
  )
}
