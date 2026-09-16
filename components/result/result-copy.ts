import type { AppLanguage } from '@/types/auth'

export type ResultCopy = {
  backToDashboard: string
  review: string; completed: string; score: string; summary: string; details: string
  role: string; company: string; level: string; interviewType: string
  language: string; duration: string; date: string; persona: string
  transcript: string; question: string; answer: string; startAgain: string
  loading: string; unavailable: string; unavailableHelp: string
  loadError: string; loadErrorHelp: string; retry: string
  notProvided: string; emptySummary: string; emptyAnswers: string
  pager: string; panels: readonly [string, string, string]
  levels: Record<'junior' | 'mid' | 'senior', string>
  interviewTypes: Record<'behavioral' | 'technical' | 'mixed' | 'case', string>
  personas: Record<'friendly' | 'formal' | 'tough' | 'curious', string>
}

// Same preference and display mappings as InterviewSetupForm; no new preference store.
export const RESULT_UI_LANGUAGE_KEY = 'interviewai_uilang'
export const INTERVIEW_LANGUAGE_NAMES: Record<AppLanguage, string> = {
  tr: 'Türkçe', en: 'English', de: 'Deutsch',
}

export function displayValue(labels: Readonly<Record<string, string>>, value: string) {
  return Object.prototype.hasOwnProperty.call(labels, value) ? labels[value] : value
}

export const RESULT_COPY: Record<AppLanguage, ResultCopy> = {
  tr: {
    backToDashboard: 'Panele Dön',
    pager: 'Sonuç bölümleri', panels: ['Değerlendirme', 'Görüşme bilgileri', 'Sorular ve cevaplar'],
    review: 'Mülakat değerlendirmesi', completed: 'Mülakat tamamlandı', score: 'Puan',
    summary: 'Performans değerlendirmesi', details: 'Görüşme bilgileri',
    role: 'Pozisyon', company: 'Şirket', level: 'Seviye', interviewType: 'Mülakat türü',
    language: 'Mülakat dili', duration: 'Süre', date: 'Tarih ve saat', persona: 'Mülakatçı tarzı',
    transcript: 'Sorular ve cevaplar', question: 'Soru', answer: 'Cevap', startAgain: 'Yeniden Başla',
    loading: 'Sonuç yükleniyor…', unavailable: 'Sonuç kullanılamıyor',
    unavailableHelp: 'Bu mülakat sonucu kullanılamıyor.', loadError: 'Sonuç yüklenemedi',
    loadErrorHelp: 'Tekrar deneyin veya yeni bir mülakat başlatın.', retry: 'Tekrar Dene',
    notProvided: 'Belirtilmedi', emptySummary: 'Bu görüşme için değerlendirme metni bulunmuyor.',
    emptyAnswers: 'Bu görüşmede kayıtlı soru ve cevap bulunmuyor.',
    levels: { junior: 'Junior (0–2 yıl)', mid: 'Mid-level (2–5 yıl)', senior: 'Senior (5+ yıl)' },
    interviewTypes: { behavioral: 'Davranışsal / İK', technical: 'Teknik', mixed: 'Karma', case: 'Vaka Analizi' },
    personas: { friendly: 'Arkadaşça', formal: 'Profesyonel', tough: 'Zorlu', curious: 'Analitik' },
  },
  en: {
    backToDashboard: 'Back to Dashboard',
    pager: 'Result sections', panels: ['Evaluation', 'Interview details', 'Questions and answers'],
    review: 'Interview result review', completed: 'Interview complete', score: 'Score',
    summary: 'Performance review', details: 'Session details',
    role: 'Role', company: 'Company', level: 'Level', interviewType: 'Interview type',
    language: 'Interview language', duration: 'Duration', date: 'Date and time', persona: 'Interviewer persona',
    transcript: 'Questions and answers', question: 'Question', answer: 'Answer', startAgain: 'Start Again',
    loading: 'Loading result…', unavailable: 'Result unavailable',
    unavailableHelp: 'This interview result is not available.', loadError: 'Result could not be loaded',
    loadErrorHelp: 'Please retry or start a new interview.', retry: 'Retry',
    notProvided: 'Not provided', emptySummary: 'No assessment text is available for this session.',
    emptyAnswers: 'No questions and answers were saved for this session.',
    levels: { junior: 'Junior (0–2 years)', mid: 'Mid-level (2–5 years)', senior: 'Senior (5+ years)' },
    interviewTypes: { behavioral: 'Behavioral / HR', technical: 'Technical', mixed: 'Mixed', case: 'Case Study' },
    personas: { friendly: 'Friendly', formal: 'Professional', tough: 'Tough', curious: 'Analytical' },
  },
  de: {
    backToDashboard: 'Zurück zum Dashboard',
    pager: 'Ergebnisbereiche', panels: ['Auswertung', 'Gesprächsdetails', 'Fragen und Antworten'],
    review: 'Interviewauswertung', completed: 'Interview abgeschlossen', score: 'Punktzahl',
    summary: 'Leistungsbeurteilung', details: 'Gesprächsdetails',
    role: 'Zielposition', company: 'Unternehmen', level: 'Erfahrungsstufe', interviewType: 'Gesprächsart',
    language: 'Gesprächssprache', duration: 'Dauer', date: 'Datum und Uhrzeit', persona: 'Interviewer-Stil',
    transcript: 'Fragen und Antworten', question: 'Frage', answer: 'Antwort', startAgain: 'Erneut starten',
    loading: 'Ergebnis wird geladen…', unavailable: 'Ergebnis nicht verfügbar',
    unavailableHelp: 'Dieses Interviewergebnis ist nicht verfügbar.', loadError: 'Ergebnis konnte nicht geladen werden',
    loadErrorHelp: 'Versuche es erneut oder starte ein neues Interview.', retry: 'Erneut versuchen',
    notProvided: 'Nicht angegeben', emptySummary: 'Für dieses Gespräch liegt kein Beurteilungstext vor.',
    emptyAnswers: 'Für dieses Gespräch wurden keine Fragen und Antworten gespeichert.',
    levels: { junior: 'Junior (0–2 Jahre)', mid: 'Mid-level (2–5 Jahre)', senior: 'Senior (5+ Jahre)' },
    interviewTypes: { behavioral: 'Verhalten / HR', technical: 'Technisch', mixed: 'Gemischt', case: 'Fallstudie' },
    personas: { friendly: 'Freundlich', formal: 'Professionell', tough: 'Anspruchsvoll', curious: 'Analytisch' },
  },
}
