import type { AppLanguage } from '@/types/auth'

type PanelCopy = { title: string; description: string }
export interface PreAuthCopy {
  language: string
  tagline: string
  welcome: string
  returning: string
  start: string
  signIn: string
  register: string
  replay: string
  back: string
  next: string
  skip: string
  navigation: string
  page: (number: number) => string
  panels: readonly [PanelCopy, PanelCopy, PanelCopy]
}

export const PRE_AUTH_COPY: Record<AppLanguage, PreAuthCopy> = {
  tr: {
    language: 'Uygulama dili', tagline: 'Bir sonraki mülakatına hazırlan.',
    welcome: 'Mülakat pratiğine ilk adımı at.', returning: 'Hazır olduğunda devam et.',
    start: 'Başla', signIn: 'Giriş yap', register: 'Hesap oluştur',
    replay: 'Tanıtımı tekrar görüntüle', back: 'Geri', next: 'İleri',
    skip: 'Tanıtımı atla', navigation: 'Tanıtım sayfaları', page: number => `Sayfa ${number} / 3`,
    panels: [
      { title: 'Yapay zekâ ile mülakat pratiği', description: 'Hedeflediğin pozisyona uygun mülakat sorularıyla pratik yap.' },
      { title: 'Sana özel geri bildirim', description: 'Yanıtların hakkında geri bildirim ve bir sonraki denemen için öneriler al.' },
      { title: 'Gelişimini takip et', description: 'Geçmiş mülakatlarını, puanlarını ve değerlendirme özetlerini yeniden incele.' },
    ],
  },
  en: {
    language: 'App language', tagline: 'Prepare for your next interview.',
    welcome: 'Take the first step in your interview practice.', returning: 'Continue when you’re ready.',
    start: 'Get started', signIn: 'Sign In', register: 'Create Account',
    replay: 'View introduction again', back: 'Back', next: 'Next',
    skip: 'Skip introduction', navigation: 'Introduction pages', page: number => `Page ${number} of 3`,
    panels: [
      { title: 'AI Interview Practice', description: 'Practice interview questions tailored to your target role.' },
      { title: 'Personalized Feedback', description: 'Get feedback on your answers and suggestions for your next attempt.' },
      { title: 'Track Your Progress', description: 'Revisit past interviews, scores, and summaries.' },
    ],
  },
  de: {
    language: 'App-Sprache', tagline: 'Bereite dich auf dein nächstes Vorstellungsgespräch vor.',
    welcome: 'Mach den ersten Schritt zur Vorbereitung.', returning: 'Mach weiter, wenn du bereit bist.',
    start: 'Loslegen', signIn: 'Anmelden', register: 'Konto erstellen',
    replay: 'Einführung erneut ansehen', back: 'Zurück', next: 'Weiter',
    skip: 'Einführung überspringen', navigation: 'Einführungsseiten', page: number => `Seite ${number} von 3`,
    panels: [
      { title: 'Interviewtraining mit KI', description: 'Übe Interviewfragen, die zu deiner angestrebten Position passen.' },
      { title: 'Persönliches Feedback', description: 'Erhalte Feedback zu deinen Antworten und Anregungen für deinen nächsten Versuch.' },
      { title: 'Deine Fortschritte im Blick', description: 'Sieh dir vergangene Interviews, Bewertungen und Zusammenfassungen erneut an.' },
    ],
  },
}
