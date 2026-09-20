import type { AppLanguage } from '@/types/auth'

type InterviewsCopy = {
  title: string; intro: string; back: string; start: string; loading: string
  empty: string; emptyHelp: string; error: string; retry: string
  more: string; loadingMore: string; moreError: string; retryMore: string
}

export const INTERVIEWS_COPY: Record<AppLanguage, InterviewsCopy> = {
  tr: {
    title: 'Mülakatlarım', intro: 'Kaydedilen mülakatlarını en yeniden en eskiye incele.',
    back: 'Panele Dön', start: 'Yeni Mülakat Başlat', loading: 'Mülakat geçmişi yükleniyor…',
    empty: 'Henüz kayıtlı mülakat yok', emptyHelp: 'Tamamladığın ve kaydedilen mülakatlar burada görünecek.',
    error: 'Mülakat geçmişi yüklenemedi', retry: 'Tekrar Dene', more: 'Daha fazla yükle',
    loadingMore: 'Daha fazla mülakat yükleniyor…', moreError: 'Diğer mülakatlar yüklenemedi. Görünen kayıtların korundu.',
    retryMore: 'Daha fazla yüklemeyi tekrar dene',
  },
  en: {
    title: 'My Interviews', intro: 'Browse your saved interviews, newest first.',
    back: 'Back to Dashboard', start: 'Start New Interview', loading: 'Loading interview history…',
    empty: 'No saved interviews yet', emptyHelp: 'Your completed and saved interviews will appear here.',
    error: 'Interview history could not be loaded', retry: 'Retry', more: 'Load more',
    loadingMore: 'Loading more interviews…', moreError: 'More interviews could not be loaded. Your displayed records are retained.',
    retryMore: 'Retry loading more',
  },
  de: {
    title: 'Meine Interviews', intro: 'Sieh dir deine gespeicherten Interviews an, die neuesten zuerst.',
    back: 'Zurück zum Dashboard', start: 'Neues Interview starten', loading: 'Interviewverlauf wird geladen…',
    empty: 'Noch keine gespeicherten Interviews', emptyHelp: 'Deine abgeschlossenen und gespeicherten Interviews erscheinen hier.',
    error: 'Interviewverlauf konnte nicht geladen werden', retry: 'Erneut versuchen', more: 'Mehr laden',
    loadingMore: 'Weitere Interviews werden geladen…', moreError: 'Weitere Interviews konnten nicht geladen werden. Die angezeigten Einträge bleiben erhalten.',
    retryMore: 'Weitere Interviews erneut laden',
  },
}
