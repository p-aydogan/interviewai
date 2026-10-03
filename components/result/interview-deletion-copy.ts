import type { AppLanguage } from '@/types/auth'

type InterviewDeletionCopy = {
  action: string; warning: string; confirm: string; cancel: string
  deleting: string; failed: string; unavailable: string; history: string
}

export const INTERVIEW_DELETION_COPY: Record<AppLanguage, InterviewDeletionCopy> = {
  tr: {
    action: 'Mülakatı sil',
    warning: 'Bu mülakat, kaydedilmiş yanıtlar ve değerlendirme özeti kalıcı olarak silinecek. Bu işlem geri alınamaz.',
    confirm: 'Mülakatı kalıcı olarak sil', cancel: 'İptal', deleting: 'Siliniyor',
    failed: 'Mülakat silinemedi. Lütfen tekrar deneyin.',
    unavailable: 'Bu mülakat artık kullanılamıyor.', history: 'Mülakatlarıma dön',
  },
  en: {
    action: 'Delete interview',
    warning: 'This interview, saved answers and assessment summary will be permanently deleted. This action cannot be undone.',
    confirm: 'Permanently delete interview', cancel: 'Cancel', deleting: 'Deleting',
    failed: 'The interview could not be deleted. Please try again.',
    unavailable: 'This interview is no longer available.', history: 'Back to My Interviews',
  },
  de: {
    action: 'Interview löschen',
    warning: 'Dieses Interview, die gespeicherten Antworten und die Bewertungszusammenfassung werden dauerhaft gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.',
    confirm: 'Interview dauerhaft löschen', cancel: 'Abbrechen', deleting: 'Wird gelöscht',
    failed: 'Das Interview konnte nicht gelöscht werden. Bitte versuchen Sie es erneut.',
    unavailable: 'Dieses Interview ist nicht mehr verfügbar.', history: 'Zurück zu meinen Interviews',
  },
}
