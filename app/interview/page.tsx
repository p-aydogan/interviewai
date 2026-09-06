'use client'
import { useEffect, useRef, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import LiveInterviewHeader from '@/components/interview/LiveInterviewHeader'
import InterviewerStage from '@/components/interview/InterviewerStage'
import type { SpeechStatus } from '@/components/interview/InterviewerStage'
import InterviewWorkspace, { InterviewFeedbackCard } from '@/components/interview/InterviewWorkspace'
import type { InterviewFeedback, InterviewTab, InterviewWorkspaceLabels } from '@/components/interview/InterviewWorkspace'
import LiveInterviewControls from '@/components/interview/LiveInterviewControls'
import { TalentryButton } from '@/components/ui'
import styles from './interview.module.css'

const IV: Record<string, any> = {
  f: { name:'Sarah Chen', role:'Sr. HR Manager',
    photo:'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face',
    voice:'EXAVITQu4vr4xnSDxMaL' },
  m: { name:'Marcus Reid', role:'Tech Lead',
    photo:'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face',
    voice:'pNInz6obpgDQGcFmaJgB' },
}
const P: Record<string,string> = {
  friendly:'Samimi mülakatçısın.',
  formal:'Profesyonel İK mülakatçısısın.',
  tough:'Baskılı mülakatçısın.',
  curious:'Analitik mülakatçısın.'
}
const L: Record<string,string> = {
  junior:'junior (0-2 yıl)',
  mid:'mid-level (2-5 yıl)',
  senior:'senior (5+ yıl)'
}
const T: Record<string,string> = {
  behavioral:'davranışsal/HR',
  technical:'teknik',
  mixed:'karma',
  case:'vaka analizi'
}
const RESULT_UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
type InterviewLanguage = 'tr' | 'en' | 'de'
type MobileInterviewPanel = 'interviewer' | 'interview' | 'feedback'

type LiveInterviewCopy = {
  backToInterviewer: string
  cameraOff: string
  cameraToggleOff: string
  cameraToggleOn: string
  completionFailure: string
  endInterview: string
  feedbackGuidance: string
  feedbackPanel: string
  feedbackReady: string
  feedbackUnavailable: string
  goToQuestions: string
  interviewPanel: string
  interviewerPanel: string
  leaveWithoutSaving: string
  microphoneToggleOff: string
  microphoneToggleOn: string
  mobilePager: string
  returnToInterview: string
  returnToQuestions: string
  sessionLabel: string
  speech: Record<SpeechStatus, string>
  timerLabel: string
  viewFeedback: string
  workspace: InterviewWorkspaceLabels
  you: string
  zeroAnswerWarning: string
}

const LIVE_COPY: Record<InterviewLanguage, LiveInterviewCopy> = {
  tr: {
    backToInterviewer: 'Mülakatçıya Dön',
    cameraOff: 'Kamera kapalı', cameraToggleOff: 'Kamerayı kapat', cameraToggleOn: 'Kamerayı aç',
    completionFailure: 'Sonuç oluşturulamadı. Tekrar deneyebilir veya görüşmeden kaydetmeden çıkabilirsiniz.',
    endInterview: 'Mülakatı Bitir',
    feedbackGuidance: 'Sonraki soruya devam etmek için sola kaydır veya Sorulara Dön seçeneğini kullan.',
    feedbackPanel: 'Değerlendirme', feedbackReady: 'Değerlendirmen hazır — görmek için sağa kaydır.',
    feedbackUnavailable: 'Geri bildirim şu anda gösterilemiyor.',
    goToQuestions: 'Sorulara Geç', interviewPanel: 'Mülakat soruları', interviewerPanel: 'Mülakatçı',
    leaveWithoutSaving: 'Kaydetmeden Çık',
    microphoneToggleOff: 'Mikrofonu kapat', microphoneToggleOn: 'Mikrofonu aç', sessionLabel: 'Canlı mülakat',
    mobilePager: 'Mülakat bölümleri',
    returnToInterview: 'Mülakata Dön',
    returnToQuestions: 'Sorulara Dön',
    speech: { preparing: 'Ses hazırlanıyor', speaking: 'Mülakatçı konuşuyor', ready: 'Ses hazır', unavailable: 'Ses kullanılamıyor' },
    timerLabel: 'Geçen süre', viewFeedback: 'Değerlendirmeyi Gör', you: 'Sen',
    workspace: {
      answer: 'Cevabını yaz', answerPlaceholder: 'Cevabını buraya yaz...', currentQuestion: 'Güncel soru',
      feedback: 'Geri bildirim', finish: 'Mülakatı tamamla', improvement: 'Geliştirilebilir', loadingQuestion: 'Soru hazırlanıyor',
      next: 'Sonraki soru', notes: 'Notlar', notesLabel: 'Notlarım', notesPlaceholder: 'Not al...', question: 'Soru',
      skip: 'Atla', strength: 'Güçlü yön', submit: 'Cevabı gönder', suggestion: 'Öneri',
    },
    zeroAnswerWarning: 'Henüz bir cevap göndermediniz. Şimdi çıkarsanız bu görüşme için sonuç oluşturulmayacak ve görüşme kaydedilmeyecek.',
  },
  en: {
    backToInterviewer: 'Back to Interviewer',
    cameraOff: 'Camera off', cameraToggleOff: 'Turn camera off', cameraToggleOn: 'Turn camera on',
    completionFailure: 'Result could not be created. You can try again or leave the interview without saving.',
    endInterview: 'End Interview',
    feedbackGuidance: 'Swipe left or use Back to Questions to continue with the next question.',
    feedbackPanel: 'Feedback', feedbackReady: 'Your feedback is ready — swipe right to view it.',
    feedbackUnavailable: 'Feedback is currently unavailable.',
    goToQuestions: 'Go to Questions', interviewPanel: 'Interview questions', interviewerPanel: 'Interviewer',
    leaveWithoutSaving: 'Leave Without Saving',
    microphoneToggleOff: 'Mute microphone', microphoneToggleOn: 'Unmute microphone', sessionLabel: 'Live interview',
    mobilePager: 'Interview panels',
    returnToInterview: 'Return to Interview',
    returnToQuestions: 'Back to Questions',
    speech: { preparing: 'Preparing voice', speaking: 'Interviewer speaking', ready: 'Voice ready', unavailable: 'Voice unavailable' },
    timerLabel: 'Elapsed time', viewFeedback: 'View Feedback', you: 'You',
    workspace: {
      answer: 'Write your answer', answerPlaceholder: 'Write your answer here...', currentQuestion: 'Current question',
      feedback: 'Feedback', finish: 'Complete interview', improvement: 'Could improve', loadingQuestion: 'Preparing question',
      next: 'Next question', notes: 'Notes', notesLabel: 'My notes', notesPlaceholder: 'Take notes...', question: 'Question',
      skip: 'Skip', strength: 'Strength', submit: 'Submit answer', suggestion: 'Suggestion',
    },
    zeroAnswerWarning: 'You haven’t submitted an answer yet. If you leave now, no result will be created and this interview will not be saved.',
  },
  de: {
    backToInterviewer: 'Zurück zum Interviewer',
    cameraOff: 'Kamera aus', cameraToggleOff: 'Kamera ausschalten', cameraToggleOn: 'Kamera einschalten',
    completionFailure: 'Das Ergebnis konnte nicht erstellt werden. Sie können es erneut versuchen oder das Interview ohne Speichern verlassen.',
    endInterview: 'Interview beenden',
    feedbackGuidance: 'Wische nach links oder nutze Zurück zu den Fragen, um mit der nächsten Frage fortzufahren.',
    feedbackPanel: 'Feedback', feedbackReady: 'Dein Feedback ist bereit — wische nach rechts, um es anzusehen.',
    feedbackUnavailable: 'Feedback ist derzeit nicht verfügbar.',
    goToQuestions: 'Zu den Fragen', interviewPanel: 'Interviewfragen', interviewerPanel: 'Interviewer',
    leaveWithoutSaving: 'Ohne Speichern verlassen',
    microphoneToggleOff: 'Mikrofon stummschalten', microphoneToggleOn: 'Mikrofon einschalten', sessionLabel: 'Live-Interview',
    mobilePager: 'Interviewbereiche',
    returnToInterview: 'Zum Interview zurück',
    returnToQuestions: 'Zurück zu den Fragen',
    speech: { preparing: 'Stimme wird vorbereitet', speaking: 'Interviewer spricht', ready: 'Stimme bereit', unavailable: 'Stimme nicht verfügbar' },
    timerLabel: 'Verstrichene Zeit', viewFeedback: 'Feedback ansehen', you: 'Du',
    workspace: {
      answer: 'Antwort schreiben', answerPlaceholder: 'Schreibe deine Antwort hier...', currentQuestion: 'Aktuelle Frage',
      feedback: 'Feedback', finish: 'Interview abschließen', improvement: 'Verbesserungsmöglichkeit', loadingQuestion: 'Frage wird vorbereitet',
      next: 'Nächste Frage', notes: 'Notizen', notesLabel: 'Meine Notizen', notesPlaceholder: 'Notizen machen...', question: 'Frage',
      skip: 'Überspringen', strength: 'Stärke', submit: 'Antwort senden', suggestion: 'Empfehlung',
    },
    zeroAnswerWarning: 'Sie haben noch keine Antwort gesendet. Wenn Sie jetzt gehen, wird kein Ergebnis erstellt und dieses Interview nicht gespeichert.',
  },
}

type EvaluationResult = {
  score: number
  summary: string
}

type PersistedInterviewResponse = {
  id: string
}

function isEvaluationResult(value: unknown): value is EvaluationResult {
  return (
    typeof value === 'object' &&
    value !== null &&
    'score' in value &&
    typeof value.score === 'number' &&
    Number.isFinite(value.score) &&
    Number.isInteger(value.score) &&
    value.score >= 0 &&
    value.score <= 100 &&
    'summary' in value &&
    typeof value.summary === 'string' &&
    value.summary.trim().length > 0
  )
}

function isPersistedInterviewResponse(value: unknown): value is PersistedInterviewResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'string' &&
    RESULT_UUID_PATTERN.test(value.id)
  )
}

function parseInterviewFeedback(value: string, fallbackText: string): InterviewFeedback {
  const normalized = value.replace(/```json|```/gi, '').trim()

  try {
    const parsed: unknown = JSON.parse(normalized)
    if (
      typeof parsed === 'object' && parsed !== null &&
      'strength' in parsed && typeof parsed.strength === 'string' && parsed.strength.trim() &&
      'improvement' in parsed && typeof parsed.improvement === 'string' && parsed.improvement.trim() &&
      'suggestion' in parsed && typeof parsed.suggestion === 'string' && parsed.suggestion.trim()
    ) {
      return {
        kind: 'structured',
        strength: parsed.strength.trim(),
        improvement: parsed.improvement.trim(),
        suggestion: parsed.suggestion.trim(),
      }
    }
  } catch {}

  return { kind: 'fallback', text: value.trim() || fallbackText }
}

function InterviewContent() {
  const params = useSearchParams()
  const router = useRouter()
  const ivKey = params.get('iv') || 'f'
  const iv = IV[ivKey]
  const role = params.get('role') || 'Genel'
  const company = params.get('company') || 'Genel'
  const level = params.get('level') || 'mid'
  const itype = params.get('itype') || 'behavioral'
  const persona = params.get('persona') || 'formal'
  const language = params.get('language') || 'tr'
  const selectedLanguage: InterviewLanguage = language === 'en' || language === 'de' ? language : 'tr'
  const copy = LIVE_COPY[selectedLanguage]
  const languageInstruction =
  language === 'en'
    ? 'Respond only in English.'
    : language === 'de'
      ? 'Antworte ausschließlich auf Deutsch.'
      : 'Yalnızca Türkçe yanıt ver.'
  const mobilePagerRef = useRef<HTMLDivElement>(null)
  const camRef = useRef<HTMLVideoElement>(null)
  const answersRef = useRef<{q:string;a:string}[]>([])
  const curQRef = useRef('')
  const qNumRef = useRef(0)
  const camStreamRef = useRef<MediaStream | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioObjectUrlRef = useRef<string | null>(null)
  const audioRequestRef = useRef(0)
  const questionGenerationInFlightRef = useRef(false)
  const initialQuestionTriggeredRef = useRef(false)
  const completionInFlightRef = useRef(false)
  const [question, setQuestion] = useState('')
  const [qLoading, setQLoading] = useState(false)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null)
  const [qNum, setQNum] = useState(0)
  const [activeTab, setActiveTab] = useState<InterviewTab>('q')
  const [mobilePanel, setMobilePanel] = useState<MobileInterviewPanel>('interviewer')
  const [isMobileViewport, setIsMobileViewport] = useState(false)
  const [notes, setNotes] = useState('')
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const [secs, setSecs] = useState(0)
  const [awaitingNext, setAwaitingNext] = useState(false)
  const [speechStatus, setSpeechStatus] = useState<SpeechStatus>('ready')
  const [completionError, setCompletionError] = useState('')
  const [isCompleting, setIsCompleting] = useState(false)
  const MAX_Q = 5
  useEffect(() => {
    const iv = setInterval(() => setSecs(s => s+1), 1000)
    return () => clearInterval(iv)
  }, [])

  const fmt = (s: number) =>
    `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({video:true,audio:false})
      .then(stream => {
        camStreamRef.current = stream
        if (camRef.current) {
          camRef.current.srcObject = stream
          camRef.current.style.display = 'block'
        }
      }).catch(()=>{})
    return () => { camStreamRef.current?.getTracks().forEach(t=>t.stop()) }
  }, [])

  useEffect(() => () => {
    audioRequestRef.current += 1
    stopCurrentAudio()
  }, [])

 async function claudeCall (system: string, message: string) {
    const res = await fetch('/api/claude', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({system, message})
    })
    const data = await res.json()
    return data.text || ''
  }
async function speakText(text: string) {
  const requestId = audioRequestRef.current + 1
  audioRequestRef.current = requestId
  stopCurrentAudio()
  setSpeechStatus('preparing')

  try {
    console.log('speakText called:', text)

    const res = await fetch('/api/elevenlabs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voiceId: iv.voice })
    })

    console.log('elevenlabs response status:', res.status)

    if (!res.ok) {
      if (requestId === audioRequestRef.current) setSpeechStatus('unavailable')
      return
    }

    const blob = await res.blob()
    const url = URL.createObjectURL(blob)

    if (requestId !== audioRequestRef.current) {
      URL.revokeObjectURL(url)
      return
    }

    const audio = new Audio(url)
    audioRef.current = audio
    audioObjectUrlRef.current = url
    audio.addEventListener('ended', () => {
      if (audioRef.current === audio) {
        audioRef.current = null
      }
      if (audioObjectUrlRef.current === url) {
        URL.revokeObjectURL(url)
        audioObjectUrlRef.current = null
      }
      if (requestId === audioRequestRef.current) setSpeechStatus('ready')
    }, { once: true })
    void audio.play()
      .then(() => {
        if (requestId === audioRequestRef.current && audioRef.current === audio) {
          setSpeechStatus('speaking')
        }
      })
      .catch(() => {
        if (audioRef.current === audio) {
          audioRef.current = null
        }
        if (audioObjectUrlRef.current === url) {
          URL.revokeObjectURL(url)
          audioObjectUrlRef.current = null
        }
        if (requestId === audioRequestRef.current) setSpeechStatus('unavailable')
      })
  } catch (e) {
    if (requestId === audioRequestRef.current) setSpeechStatus('unavailable')
    console.warn('TTS error', e)
  }
}
  function stopCurrentAudio() {
    if (audioRef.current) {
      audioRef.current.pause()
      try {
        audioRef.current.currentTime = 0
      } catch {}
      audioRef.current = null
    }

    if (audioObjectUrlRef.current) {
      URL.revokeObjectURL(audioObjectUrlRef.current)
      audioObjectUrlRef.current = null
    }
  }
  const askQuestion = useCallback(async () => {
    if (questionGenerationInFlightRef.current) return
    questionGenerationInFlightRef.current = true
    let canonicalQuestion: string | null = null
    setFeedback(null); setAnswer(''); setAwaitingNext(false)
    setQLoading(true)
    try {
      audioRequestRef.current += 1
      stopCurrentAudio()
      setSpeechStatus('ready')
      const num = qNumRef.current + 1
      qNumRef.current = num; setQNum(num)
      const previousQuestions = Array.from(new Set(
        [...answersRef.current.map(item => item.q), curQRef.current]
          .map(previousQuestion => previousQuestion.trim())
          .filter(Boolean)
      ))
      const previousQuestionsInstruction = previousQuestions.length
        ? `\nPreviously asked questions:\n${previousQuestions.map(previousQuestion => `- ${previousQuestion}`).join('\n')}\nDo not repeat these questions. Do not ask the same competency or topic again using near-duplicate wording. Ask a meaningfully different interview question appropriate to the same role, interview type, level, company, persona, and language.`
        : ''
const sys = `${P[persona]} Sen ${role} için ${T[itype]} mülakatı yapıyorsun. Aday: ${L[level]}. Şirket: ${company}. ${languageInstruction} SADECE soruyu yaz. Soru ${num}.${previousQuestionsInstruction}`
      const q = await claudeCall(sys, `${num}. mülakat sorusu`)
      canonicalQuestion = q.trim()
      setQuestion(canonicalQuestion); setQLoading(false)
      curQRef.current = canonicalQuestion
    } finally {
      setQLoading(false)
      questionGenerationInFlightRef.current = false
    }
    if (canonicalQuestion !== null) {
      void speakText(canonicalQuestion).catch(error => console.warn('TTS error', error))
    }
  }, [])

  const triggerInitialQuestion = useCallback(() => {
    if (initialQuestionTriggeredRef.current) return
    initialQuestionTriggeredRef.current = true
    void askQuestion()
  }, [askQuestion])

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 640px)')
    const triggerForViewport = () => {
      const isMobile = mobileQuery.matches
      setIsMobileViewport(isMobile)
      if (!isMobile) triggerInitialQuestion()
    }

    triggerForViewport()
    mobileQuery.addEventListener('change', triggerForViewport)
    return () => mobileQuery.removeEventListener('change', triggerForViewport)
  }, [triggerInitialQuestion])
  async function submitAnswer() {
    if (!answer.trim()) return
    setCompletionError('')
    answersRef.current.push({q: curQRef.current, a: answer})
    setQLoading(true)
    const sys = `${persona === 'tough' ? 'Eleştirel' : 'Yapıcı'} bir mülakat koçusun. ${languageInstruction} Adayın cevabını kısa, yapıcı ve profesyonel şekilde değerlendir. Sadece geçerli JSON döndür: {"strength":"...","improvement":"...","suggestion":"..."}. Her alan kısa, tek bir madde olmalı. Başka metin ekleme.`
    const fb = await claudeCall(sys, `Soru: "${curQRef.current}"\nCevap: "${answer}"`)
    setFeedback(parseInterviewFeedback(fb, copy.feedbackUnavailable)); setQLoading(false); setAwaitingNext(true)
  }

  async function nextQuestion() {
    if (qNumRef.current >= MAX_Q) await endCall()
    else await askQuestion()
  }

  async function endCall() {
    if (completionInFlightRef.current) return
    completionInFlightRef.current = true
    setIsCompleting(true)
    setCompletionError('')

    const answers = answersRef.current
    if (!answers.length) {
      setCompletionError(copy.zeroAnswerWarning)
      completionInFlightRef.current = false
      setIsCompleting(false)
      return
    }

    try {
      const aText = answers.map((x,i)=>`S${i+1}: ${x.q}\nC: ${x.a}`).join('\n\n')
      const sys = `Kıdemli bir İK uzmanısın. ${languageInstruction} Sadece geçerli JSON döndür: {"score":0-100,"summary":"3-4 cümlelik değerlendirme"}`
      const raw = await claudeCall(sys, `Pozisyon: ${role}\n\n${aText}`)
      const evaluation: unknown = JSON.parse(raw.replace(/```json|```/g,'').trim())

      if (!isEvaluationResult(evaluation)) {
        throw new Error('Invalid final interview evaluation')
      }

      const saveRes = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewerKey: ivKey,
          role,
          company,
          level,
          interviewType: itype,
          persona,
          language,
          answers,
          score: evaluation.score,
          summary: evaluation.summary,
          durationSeconds: secs,
        }),
      })

      if (!saveRes.ok) {
        console.error('Interview save failed with status:', saveRes.status)
        throw new Error('Interview persistence failed')
      }

      const savedInterview: unknown = await saveRes.json()

      if (!isPersistedInterviewResponse(savedInterview)) {
        throw new Error('Invalid interview persistence response')
      }

      camStreamRef.current?.getTracks().forEach(t=>t.stop())
      router.push(`/result/${encodeURIComponent(savedInterview.id)}`)
    } catch (error) {
      console.error('Interview completion failed:', error)
      setCompletionError(copy.completionFailure)
      completionInFlightRef.current = false
      setIsCompleting(false)
    }
  }

  function leaveWithoutSaving() {
    audioRequestRef.current += 1
    stopCurrentAudio()
    camStreamRef.current?.getTracks().forEach(track => track.stop())
    router.push('/dashboard')
  }

  function toggleMic() {
    setMicOn(v => {
      camStreamRef.current?.getAudioTracks().forEach(t=>t.enabled=!v)
      return !v
    })
  }

  function toggleCam() {
    setCamOn(v => {
      camStreamRef.current?.getVideoTracks().forEach(t=>t.enabled=!v)
      return !v
    })
    
  }
  function showMobilePanel(panel: MobileInterviewPanel) {
    if (panel === 'feedback' && !feedback) return
    const pager = mobilePagerRef.current
    setMobilePanel(panel)
    if (panel === 'interview') triggerInitialQuestion()
    const panelIndex = panel === 'interviewer' ? 0 : panel === 'interview' ? 1 : 2
    pager?.scrollTo({ left: panelIndex * pager.clientWidth })
  }

  function syncMobilePanel() {
    const pager = mobilePagerRef.current
    if (!pager?.clientWidth) return
    const panelIndex = Math.round(pager.scrollLeft / pager.clientWidth)
    const panel: MobileInterviewPanel = panelIndex === 0 ? 'interviewer' : panelIndex === 1 ? 'interview' : 'feedback'
    if (panel === 'feedback' && !feedback) {
      showMobilePanel('interview')
      return
    }
    setMobilePanel(panel)
    if (panel === 'interview') triggerInitialQuestion()
  }

  const liveInterviewControls = (
    <LiveInterviewControls
      cameraLabel={camOn ? copy.cameraToggleOff : copy.cameraToggleOn}
      cameraOn={camOn}
      completionError={completionError}
      endLabel={copy.endInterview}
      isCompleting={isCompleting}
      leaveWithoutSavingLabel={copy.leaveWithoutSaving}
      microphoneLabel={micOn ? copy.microphoneToggleOff : copy.microphoneToggleOn}
      microphoneOn={micOn}
      onDismissCompletionError={() => setCompletionError('')}
      onEnd={endCall}
      onLeaveWithoutSaving={leaveWithoutSaving}
      onToggleCamera={toggleCam}
      onToggleMicrophone={toggleMic}
      returnToInterviewLabel={copy.returnToInterview}
    />
  )

  return (
    <main className={styles.page}>
      <LiveInterviewHeader
        elapsedTime={fmt(secs)}
        maxQuestions={MAX_Q}
        questionLabel={copy.workspace.question}
        questionNumber={qNum}
        sessionLabel={copy.sessionLabel}
        timerLabel={copy.timerLabel}
      />
      <div className={styles.body} onScroll={syncMobilePanel} ref={mobilePagerRef}>
        <div aria-label={copy.interviewerPanel} className={`${styles.mobilePanel} ${styles.mobileInterviewerPanel}`} id="mobile-interviewer-panel" role="group">
          <InterviewerStage
            cameraOffLabel={copy.cameraOff}
            cameraOn={camOn}
            cameraRef={camRef}
            interviewerName={iv.name}
            interviewerPhoto={iv.photo}
            interviewerRole={iv.role}
            speechLabel={copy.speech[speechStatus]}
            speechStatus={speechStatus}
            youLabel={copy.you}
          />
          <TalentryButton className={styles.mobilePanelAction} onClick={() => showMobilePanel('interview')} type="button">
            {copy.goToQuestions}
          </TalentryButton>
        </div>
        <div aria-label={copy.interviewPanel} className={`${styles.mobilePanel} ${styles.mobileInterviewPanel} ${awaitingNext ? styles.mobileInterviewPanelPostSubmit : ''}`} id="mobile-interview-panel" role="group">
          <TalentryButton className={styles.mobilePanelBack} onClick={() => showMobilePanel('interviewer')} size="small" type="button" variant="ghost">
            {copy.backToInterviewer}
          </TalentryButton>
          <InterviewWorkspace
            activeTab={activeTab}
            answer={answer}
            awaitingNext={awaitingNext}
            feedback={feedback}
            isCompleting={isCompleting}
            labels={copy.workspace}
            maxQuestions={MAX_Q}
            mobileFeedbackReadyLabel={copy.feedbackReady}
            mobileViewFeedbackLabel={copy.viewFeedback}
            notes={notes}
            onAnswerChange={setAnswer}
            onNext={nextQuestion}
            onNotesChange={setNotes}
            onSubmit={submitAnswer}
            onTabChange={setActiveTab}
            onViewFeedback={() => showMobilePanel('feedback')}
            qLoading={qLoading}
            question={question}
            questionNumber={qNum}
            showFeedback={!isMobileViewport}
          />
          <div className={styles.mobileControls}>{liveInterviewControls}</div>
        </div>
        {isMobileViewport && (
          <div aria-hidden={!feedback} aria-label={copy.feedbackPanel} className={`${styles.mobilePanel} ${styles.mobileFeedbackPanel} ${!feedback ? styles.mobileFeedbackPanelUnavailable : ''}`} id="mobile-feedback-panel" role="group">
            {feedback && (
              <>
                <TalentryButton className={styles.mobilePanelBack} onClick={() => showMobilePanel('interview')} size="small" type="button" variant="ghost">
                  {copy.returnToQuestions}
                </TalentryButton>
                <InterviewFeedbackCard feedback={feedback} labels={copy.workspace} />
                <p className={styles.mobileFeedbackGuidance}>{copy.feedbackGuidance}</p>
              </>
            )}
          </div>
        )}
      </div>
      <nav aria-label={copy.mobilePager} className={styles.mobilePagination}>
        <button aria-controls="mobile-interviewer-panel" aria-current={mobilePanel === 'interviewer' ? 'step' : undefined} aria-label={copy.interviewerPanel} className={`${styles.mobilePagerDot} ${mobilePanel === 'interviewer' ? styles.mobilePagerDotActive : ''}`} onClick={() => showMobilePanel('interviewer')} type="button" />
        <button aria-controls="mobile-interview-panel" aria-current={mobilePanel === 'interview' ? 'step' : undefined} aria-label={copy.interviewPanel} className={`${styles.mobilePagerDot} ${mobilePanel === 'interview' ? styles.mobilePagerDotActive : ''}`} onClick={() => showMobilePanel('interview')} type="button" />
        <button aria-controls="mobile-feedback-panel" aria-current={mobilePanel === 'feedback' ? 'step' : undefined} aria-disabled={!feedback} aria-label={copy.feedbackPanel} className={`${styles.mobilePagerDot} ${mobilePanel === 'feedback' ? styles.mobilePagerDotActive : ''}`} disabled={!feedback} onClick={() => showMobilePanel('feedback')} type="button" />
      </nav>
      <div className={styles.desktopControls}>{liveInterviewControls}</div>
    </main>
  )
}

export default function InterviewPage() {
  return <Suspense><InterviewContent /></Suspense>
}
