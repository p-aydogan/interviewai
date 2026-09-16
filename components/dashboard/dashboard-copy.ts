import type { AppLanguage } from '@/types/auth'

export const DASHBOARD_LANGUAGE_KEY = 'interviewai_uilang'
export type DashboardCopy = {
  overview: string; navigation: string; mobileNavigation: string
  welcome: string; quick: string; recent: string; jobs: string; insights: string; tip: string; premium: string
  start: string; latest: string; loading: string; empty: string; emptyHelp: string; first: string
  error: string; errorHelp: string; retry: string; score: string; duration: string; viewResult: string
  notProvided: string; search: string; notifications: string; profile: string
  nav: readonly [string, string, string, string, string, string, string, string]
  panels: readonly [string, string, string]
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
    welcome: 'Hoş geldin', quick: 'Hızlı İşlemler', recent: 'Son Mülakatlar', jobs: 'Önerilen İşler',
    insights: 'Yapay Zekâ İçgörüleri', tip: 'Günün İpucu', premium: 'Premium',
    start: 'Yeni Mülakat Başlat', latest: 'Son 5 kayıt', loading: 'Mülakat geçmişi yükleniyor…',
    empty: 'Henüz kayıtlı mülakat yok', emptyHelp: 'Tamamladığın ve kaydedilen mülakatlar burada görünecek.',
    first: 'İlk mülakatını başlat', error: 'Mülakat geçmişi yüklenemedi',
    errorHelp: 'Kayıtlarını görüntülemek için tekrar dene.', retry: 'Tekrar Dene', score: 'Puan', duration: 'Süre',
    viewResult: 'Sonucu görüntüle', notProvided: 'Belirtilmedi', search: 'Ara',
    notifications: 'Bildirimler yer tutucusu', profile: 'Profil yer tutucusu',
    nav: ['Panel', 'İşler ve Fırsatlar', 'Mülakatlarım', 'Yapay Zekâ Koçu', 'Raporlar', 'Kaydedilen Pozisyonlar', 'Ayarlar', 'Premium'],
    panels: ['Ana Sayfa', 'Son Mülakatlar', 'İşlemler'],
    interviewTypes: { behavioral: 'Davranışsal / İK', technical: 'Teknik', mixed: 'Karma', case: 'Vaka Analizi' },
  },
  en: {
    overview: 'Dashboard overview', navigation: 'Dashboard navigation', mobileNavigation: 'Mobile navigation placeholder',
    welcome: 'Welcome', quick: 'Quick Actions', recent: 'Recent Interviews', jobs: 'Recommended Jobs',
    insights: 'AI Insights', tip: 'Daily Tip', premium: 'Premium',
    start: 'Start New Interview', latest: 'Latest 5', loading: 'Loading interview history…',
    empty: 'No saved interviews yet', emptyHelp: 'Your completed and saved interviews will appear here.',
    first: 'Start your first interview', error: 'Interview history could not be loaded',
    errorHelp: 'Retry to view your saved interviews.', retry: 'Retry', score: 'Score', duration: 'Duration',
    viewResult: 'View result', notProvided: 'Not provided', search: 'Search',
    notifications: 'Notifications placeholder', profile: 'Profile placeholder',
    nav: ['Dashboard', 'Jobs & Opportunities', 'My Interviews', 'AI Coach', 'Reports', 'Saved Roles', 'Settings', 'Premium'],
    panels: ['Home', 'Recent Interviews', 'Actions'],
    interviewTypes: { behavioral: 'Behavioral / HR', technical: 'Technical', mixed: 'Mixed', case: 'Case Study' },
  },
  de: {
    overview: 'Dashboard-Übersicht', navigation: 'Dashboard-Navigation', mobileNavigation: 'Platzhalter für mobile Navigation',
    welcome: 'Willkommen', quick: 'Schnellzugriff', recent: 'Letzte Interviews', jobs: 'Empfohlene Stellen',
    insights: 'KI-Einblicke', tip: 'Tipp des Tages', premium: 'Premium',
    start: 'Neues Interview starten', latest: 'Letzte 5', loading: 'Interviewverlauf wird geladen…',
    empty: 'Noch keine gespeicherten Interviews', emptyHelp: 'Deine abgeschlossenen und gespeicherten Interviews erscheinen hier.',
    first: 'Starte dein erstes Interview', error: 'Interviewverlauf konnte nicht geladen werden',
    errorHelp: 'Versuche erneut, deine gespeicherten Interviews zu laden.', retry: 'Erneut versuchen', score: 'Punktzahl', duration: 'Dauer',
    viewResult: 'Ergebnis ansehen', notProvided: 'Nicht angegeben', search: 'Suchen',
    notifications: 'Platzhalter für Benachrichtigungen', profile: 'Profilplatzhalter',
    nav: ['Dashboard', 'Stellen & Chancen', 'Meine Interviews', 'KI-Coach', 'Berichte', 'Gespeicherte Stellen', 'Einstellungen', 'Premium'],
    panels: ['Startseite', 'Letzte Interviews', 'Aktionen'],
    interviewTypes: { behavioral: 'Verhalten / HR', technical: 'Technisch', mixed: 'Gemischt', case: 'Fallstudie' },
  },
}
