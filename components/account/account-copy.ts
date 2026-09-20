import type { AppLanguage } from '@/types/auth'

interface AccountCopy {
  account: string; profile: string; settings: string; language: string; help: string
  signOut: string; signingOut: string; signOutFailed: string; back: string
  profileDescription: string; displayName: string; email: string; missing: string
  settingsDescription: string; languageDescription: string; security: string
  recoveryDescription: string; recovery: string; helpDescription: string
  guidance: readonly { title: string; description: string; href?: string }[]
}

export const ACCOUNT_COPY: Record<AppLanguage, AccountCopy> = {
  tr: {
    account: 'Hesap', profile: 'Profil', settings: 'Hesap Ayarları', language: 'Uygulama dili',
    help: 'Yardım ve Destek', signOut: 'Çıkış Yap', signingOut: 'Çıkış yapılıyor…',
    signOutFailed: 'Çıkış tamamlanamadı. Lütfen tekrar deneyin.', back: 'Panele Dön',
    profileDescription: 'Hesabınızda bulunan bilgiler. Bu sayfa salt okunurdur.',
    displayName: 'Görünen ad', email: 'E-posta', missing: 'Belirtilmedi',
    settingsDescription: 'Uygulama dilinizi seçin veya mevcut parola kurtarma akışını kullanın.',
    languageDescription: 'Bu tarayıcı için kaydedilir. Mülakat dilini değiştirmez.',
    security: 'Parola ve güvenlik', recoveryDescription: 'Parolanızı sıfırlamak için e-posta ile kurtarma bağlantısı isteyin.',
    recovery: 'Parola sıfırlama', helpDescription: 'Mevcut özellikleri kullanmaya yönelik kısa rehber.',
    guidance: [
      { title: 'Panel', description: 'Giriş sonrası ana sayfanıza dönün.', href: '/dashboard' },
      { title: 'Yeni mülakat', description: 'Mülakat türünü, mülakatçıyı ve mülakat dilini seçin.', href: '/interview/setup' },
      { title: 'Canlı mülakat', description: 'Kurulumdan sonra soruları yanıtlayın ve mülakatı tamamlayın.' },
      { title: 'Mülakatlarım ve sonuçlar', description: 'Kaydedilmiş mülakatları inceleyin; sonuç ve geri bildirim için bir kayıt açın.', href: '/interviews' },
      { title: 'Parola kurtarma', description: 'E-posta adresinize parola sıfırlama bağlantısı isteyin.', href: '/forgot-password' },
    ],
  },
  en: {
    account: 'Account', profile: 'Profile', settings: 'Account Settings', language: 'Application language',
    help: 'Help & Support', signOut: 'Sign Out', signingOut: 'Signing out…',
    signOutFailed: 'Sign out could not be completed. Please try again.', back: 'Back to Dashboard',
    profileDescription: 'The information available on your account. This page is read-only.',
    displayName: 'Display name', email: 'Email', missing: 'Not provided',
    settingsDescription: 'Choose your application language or use the existing password recovery flow.',
    languageDescription: 'Saved for this browser. Does not change the interview language.',
    security: 'Password and security', recoveryDescription: 'Request an email recovery link to reset your password.',
    recovery: 'Reset password', helpDescription: 'A short guide to the available features.',
    guidance: [
      { title: 'Dashboard', description: 'Return to your main home after signing in.', href: '/dashboard' },
      { title: 'Start New Interview', description: 'Choose the interview type, interviewer, and interview language.', href: '/interview/setup' },
      { title: 'Live Interview', description: 'After setup, answer the questions and complete your interview.' },
      { title: 'My Interviews and results', description: 'Browse saved interviews and open a record for its result and feedback.', href: '/interviews' },
      { title: 'Password recovery', description: 'Request a password reset link at your email address.', href: '/forgot-password' },
    ],
  },
  de: {
    account: 'Konto', profile: 'Profil', settings: 'Kontoeinstellungen', language: 'Anwendungssprache',
    help: 'Hilfe & Support', signOut: 'Abmelden', signingOut: 'Abmeldung läuft…',
    signOutFailed: 'Die Abmeldung konnte nicht abgeschlossen werden. Bitte erneut versuchen.', back: 'Zurück zum Dashboard',
    profileDescription: 'Die verfügbaren Angaben zu deinem Konto. Diese Seite ist schreibgeschützt.',
    displayName: 'Anzeigename', email: 'E-Mail', missing: 'Nicht angegeben',
    settingsDescription: 'Wähle die Anwendungssprache oder nutze die bestehende Passwortwiederherstellung.',
    languageDescription: 'Wird für diesen Browser gespeichert. Ändert die Interviewsprache nicht.',
    security: 'Passwort und Sicherheit', recoveryDescription: 'Fordere einen Link per E-Mail an, um dein Passwort zurückzusetzen.',
    recovery: 'Passwort zurücksetzen', helpDescription: 'Eine kurze Anleitung zu den verfügbaren Funktionen.',
    guidance: [
      { title: 'Dashboard', description: 'Kehre nach der Anmeldung zu deiner Startseite zurück.', href: '/dashboard' },
      { title: 'Neues Interview', description: 'Wähle Interviewtyp, Interviewer und Interviewsprache.', href: '/interview/setup' },
      { title: 'Live-Interview', description: 'Beantworte nach der Einrichtung die Fragen und schließe dein Interview ab.' },
      { title: 'Meine Interviews und Ergebnisse', description: 'Sieh gespeicherte Interviews an und öffne einen Eintrag für Ergebnis und Feedback.', href: '/interviews' },
      { title: 'Passwortwiederherstellung', description: 'Fordere einen Link zum Zurücksetzen an deine E-Mail-Adresse an.', href: '/forgot-password' },
    ],
  },
}
