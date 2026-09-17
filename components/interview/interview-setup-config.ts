import type { AppLanguage } from '@/types/auth'

export type InterviewerId = 'f' | 'm'
export type InterviewLevel = 'junior' | 'mid' | 'senior'
export type InterviewType = 'behavioral' | 'technical' | 'mixed' | 'case'
export type InterviewPersona = 'friendly' | 'formal' | 'tough' | 'curious'

export type SetupCopy = {
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

export const UI_LANGUAGE_STORAGE_KEY = 'interviewai_uilang'

export const INTERVIEWERS = [
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

export const COPY: Record<AppLanguage, SetupCopy> = {
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

export const LANGUAGE_LABELS: Record<AppLanguage, string> = { tr: 'TR', en: 'EN', de: 'DE' }
export const LANGUAGE_NAMES: Record<AppLanguage, string> = { tr: 'Türkçe', en: 'English', de: 'Deutsch' }

export const MOBILE_COPY: Record<AppLanguage, { panels: readonly [string, string]; pager: string; positions: readonly [string, string] }> = {
  tr: { panels: ['Mülakatçı ve dil', 'Görüşme ayarları'], pager: 'Mülakat hazırlığı bölümleri', positions: ['1. bölüm / 2', '2. bölüm / 2'] },
  en: { panels: ['Interviewer and language', 'Interview settings'], pager: 'Interview setup panels', positions: ['Panel 1 of 2', 'Panel 2 of 2'] },
  de: { panels: ['Interviewer und Sprache', 'Gesprächseinstellungen'], pager: 'Bereiche der Interviewvorbereitung', positions: ['Bereich 1 von 2', 'Bereich 2 von 2'] },
}

export interface SetupValues {
  interviewer: InterviewerId
  role: string
  company: string
  level: InterviewLevel
  interviewType: InterviewType
  persona: InterviewPersona
  interviewLanguage: AppLanguage
}

export type SetupChanges = { [Key in keyof SetupValues]: (value: SetupValues[Key]) => void }