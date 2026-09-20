import type { AppLanguage } from '@/types/auth'

export const DASHBOARD_LANGUAGE_KEY = 'interviewai_uilang'
export type DashboardCopy = {
  overview: string; navigation: string; mobileNavigation: string
  welcome: string; quick: string; jobs: string; insights: string; tip: string; premium: string
  start: string
  score: string; duration: string; viewResult: string
  notProvided: string; search: string; notifications: string; profile: string
  nav: readonly [string, string, string, string, string, string, string, string]
  panels: readonly [string, string]
  interviewTypes: Record<string, string>
}

export const INTERVIEW_LANGUAGES: Readonly<Record<string, string>> = {
  tr: 'Türkçe', en: 'English', de: 'Deutsch',
}

export function historyLabel(labels: Readonly<Record<string, string>>, value: string) {
  return Object.prototype.hasOwnProperty.call(labels, value) ? labels[value] : value
}

export const DASHBOARD_COPY: Record<AppLanguage, DashboardCopy> = {
  tr: {
    overview: 'Panel özeti', navigation: 'Panel gezinme menüsü', mobileNavigation: 'Mobil gezinme yer tutucusu',
    welcome: 'Hoş geldin', quick: 'Hızlı İşlemler', jobs: 'Önerilen İşler',
    insights: 'Yapay Zekâ İçgörüleri', tip: 'Günün İpucu', premium: 'Premium',
    start: 'Yeni Mülakat Başlat',
    score: 'Puan', duration: 'Süre',
    viewResult: 'Sonucu görüntüle', notProvided: 'Belirtilmedi', search: 'Ara',
    notifications: 'Bildirimler yer tutucusu', profile: 'Profil yer tutucusu',
    nav: ['Panel', 'İşler ve Fırsatlar', 'Mülakatlarım', 'Yapay Zekâ Koçu', 'Raporlar', 'Kaydedilen Pozisyonlar', 'Ayarlar', 'Premium'],
    panels: ['Ana Sayfa', 'İşlemler'],
    interviewTypes: { behavioral: 'Davranışsal / İK', technical: 'Teknik', mixed: 'Karma', case: 'Vaka Analizi' },
  },
  en: {
    overview: 'Dashboard overview', navigation: 'Dashboard navigation', mobileNavigation: 'Mobile navigation placeholder',
    welcome: 'Welcome', quick: 'Quick Actions', jobs: 'Recommended Jobs',
    insights: 'AI Insights', tip: 'Daily Tip', premium: 'Premium',
    start: 'Start New Interview',
    score: 'Score', duration: 'Duration',
    viewResult: 'View result', notProvided: 'Not provided', search: 'Search',
    notifications: 'Notifications placeholder', profile: 'Profile placeholder',
    nav: ['Dashboard', 'Jobs & Opportunities', 'My Interviews', 'AI Coach', 'Reports', 'Saved Roles', 'Settings', 'Premium'],
    panels: ['Home', 'Actions'],
    interviewTypes: { behavioral: 'Behavioral / HR', technical: 'Technical', mixed: 'Mixed', case: 'Case Study' },
  },
  de: {
    overview: 'Dashboard-Übersicht', navigation: 'Dashboard-Navigation', mobileNavigation: 'Platzhalter für mobile Navigation',
    welcome: 'Willkommen', quick: 'Schnellzugriff', jobs: 'Empfohlene Stellen',
    insights: 'KI-Einblicke', tip: 'Tipp des Tages', premium: 'Premium',
    start: 'Neues Interview starten',
    score: 'Punktzahl', duration: 'Dauer',
    viewResult: 'Ergebnis ansehen', notProvided: 'Nicht angegeben', search: 'Suchen',
    notifications: 'Platzhalter für Benachrichtigungen', profile: 'Profilplatzhalter',
    nav: ['Dashboard', 'Stellen & Chancen', 'Meine Interviews', 'KI-Coach', 'Berichte', 'Gespeicherte Stellen', 'Einstellungen', 'Premium'],
    panels: ['Startseite', 'Aktionen'],
    interviewTypes: { behavioral: 'Verhalten / HR', technical: 'Technisch', mixed: 'Gemischt', case: 'Fallstudie' },
  },
}
