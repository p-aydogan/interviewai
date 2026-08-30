'use client'
import { useEffect, useRef, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
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
const COMPLETION_ERROR = "We couldn't complete and save your interview result. Please try again."

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
  const languageInstruction =
  language === 'en'
    ? 'Respond only in English.'
    : language === 'de'
      ? 'Antworte ausschließlich auf Deutsch.'
      : 'Yalnızca Türkçe yanıt ver.'
  const videoRef = useRef<HTMLVideoElement>(null)
  const camRef = useRef<HTMLVideoElement>(null)
  const answersRef = useRef<{q:string;a:string}[]>([])
  const curQRef = useRef('')
  const qNumRef = useRef(0)
  const camStreamRef = useRef<MediaStream | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const completionInFlightRef = useRef(false)
  const [question, setQuestion] = useState('')
  const [qLoading, setQLoading] = useState(false)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState('')
  const [qNum, setQNum] = useState(0)
  const [activeTab, setActiveTab] = useState<'q'|'n'>('q')
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const [secs, setSecs] = useState(0)
  const [awaitingNext, setAwaitingNext] = useState(false)
  const [subtitle, setSubtitle] = useState('')
  const [connected, setConnected] = useState(false)
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
  try {
    console.log('speakText called:', text)

    const res = await fetch('/api/elevenlabs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voiceId: iv.voice })
    })

    console.log('elevenlabs response status:', res.status)

    if (!res.ok) return

    const blob = await res.blob()
    const url = URL.createObjectURL(blob)

    if (audioRef.current) {
      audioRef.current.pause()
    }

    const audio = new Audio(url)
    audioRef.current = audio
    audio.play().catch(() => {})
  } catch (e) {
    console.warn('TTS error', e)
  }
}
  const askQuestion = useCallback(async () => {
    setFeedback(''); setAnswer(''); setAwaitingNext(false)
    setQLoading(true)
    const num = qNumRef.current + 1
    qNumRef.current = num; setQNum(num)
const sys = `${P[persona]} Sen ${role} için ${T[itype]} mülakatı yapıyorsun. Aday: ${L[level]}. Şirket: ${company}. ${languageInstruction} SADECE soruyu yaz. Soru ${num}.`
    const q = await claudeCall(sys, `${num}. mülakat sorusu`)
    setQuestion(q); setQLoading(false)
    curQRef.current = q
    setSubtitle(q)
    await speakText(q)
  }, [])

  useEffect(() => { askQuestion() }, [])
  async function submitAnswer() {
    if (!answer.trim()) return
    answersRef.current.push({q: curQRef.current, a: answer})
    setQLoading(true)
    const sys = `${persona === 'tough' ? 'Eleştirel' : 'Yapıcı'} bir mülakat koçusun. ${languageInstruction} Adayın cevabını kısa, yapıcı ve profesyonel şekilde değerlendir.`
    const fb = await claudeCall(sys, `Soru: "${curQRef.current}"\nCevap: "${answer}"`)
    setFeedback(fb); setQLoading(false); setAwaitingNext(true)
    setSubtitle(fb)
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
      setCompletionError('A result requires at least one submitted answer.')
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
      setCompletionError(COMPLETION_ERROR)
      completionInFlightRef.current = false
      setIsCompleting(false)
    }
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
  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <div className={styles.tbl}>
          <div className={styles.rec}></div>
          <span className={styles.tbt}>Mülakat</span>
        </div>
        <div className={styles.tbr}>
          <span className={styles.timer}>{fmt(secs)}</span>
          <span className={styles.qpill}>Soru {qNum}/{MAX_Q}</span>
        </div>
      </div>
      <div className={styles.body}>
        <div className={styles.avPanel}>
          <div className={styles.avBg}></div>
          <div className={styles.fallback}>
            <img className={styles.fallbackPhoto} src={iv.photo} alt={iv.name}/>
            {!connected && <div className={styles.spinner}></div>}
          </div>
          {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
          <div className={styles.ntag}>
            <span className={styles.ntagName}>{iv.name}</span>
            <span className={styles.ntagRole}>{iv.role}</span>
          </div>
          <div className={styles.selfView}>
            <video ref={camRef} autoPlay muted playsInline style={{display:'none'}}/>
            {!camOn && <div className={styles.camPh}><span>📷</span><span>Kapalı</span></div>}
            <div className={styles.svLabel}>Sen</div>
          </div>
        </div>
        <div className={styles.rightPanel}>
          <div className={styles.tabs}>
            <button className={`${styles.tab} ${activeTab==='q'?styles.tabOn:''}`}
              onClick={()=>setActiveTab('q')}>Soru</button>
            <button className={`${styles.tab} ${activeTab==='n'?styles.tabOn:''}`}
              onClick={()=>setActiveTab('n')}>Notlar</button>
          </div>
          {activeTab==='q' && (
            <div className={styles.tabContent}>
              <div className={`${styles.qbox} ${qLoading?styles.qboxLoading:''}`}>
                {qLoading
                  ? <><div className={styles.dot}></div><div className={styles.dot}></div><div className={styles.dot}></div></>
                  : question}
              </div>
              <label className={styles.aLabel}>CEVABINI YAZ</label>
              <textarea className={styles.ata} placeholder="Cevabını buraya yaz..."
                value={answer} onChange={e=>setAnswer(e.target.value)}
                disabled={qLoading||awaitingNext||isCompleting}/>
              <div className={styles.actRow}>
                {!awaitingNext
                  ? <button className={styles.bSend} onClick={submitAnswer}
                      disabled={qLoading||isCompleting||!answer.trim()}>Gönder ↵</button>
                  : <button className={styles.bSend} onClick={nextQuestion}
                      disabled={qLoading||isCompleting}>{qNum>=MAX_Q?'Bitir 🏁':'Sonraki →'}</button>
                }
                <button className={styles.bSkip} onClick={nextQuestion}
                  disabled={qLoading||isCompleting}>Atla</button>
              </div>
              {feedback && (
                <div className={styles.fbCard}>
                  <div className={styles.fbLabel}>✦ Geri Bildirim</div>
                  <div>{feedback}</div>
                </div>
              )}
            </div>
          )}
          {activeTab==='n' && (
            <div className={styles.tabContent}>
              <label className={styles.aLabel} style={{display:'block',marginBottom:10}}>
                NOTLARIM</label>
              <textarea className={styles.notesArea} placeholder="Not al..."/>
            </div>
          )}
        </div>
      </div>
      {completionError && (
        <div
          role="alert"
          style={{
            position: 'fixed',
            left: '50%',
            bottom: 76,
            transform: 'translateX(-50%)',
            zIndex: 20,
            width: 'max-content',
            maxWidth: 'calc(100vw - 32px)',
            padding: '10px 14px',
            border: '1px solid #ff5f5f',
            borderRadius: 8,
            background: 'rgba(14, 19, 24, 0.96)',
            color: '#dde6ee',
            fontSize: 13,
            lineHeight: 1.5,
            textAlign: 'center',
          }}
        >
          {completionError}
        </div>
      )}
      <div className={styles.controls}>
        <button className={`${styles.ctrl} ${!micOn?styles.ctrlOff:''}`}
          onClick={toggleMic}>{micOn?'🎙️':'🔇'}</button>
        <button className={`${styles.ctrl} ${!camOn?styles.ctrlOff:''}`}
          onClick={toggleCam}>{camOn?'📷':'🚫'}</button>
        <button className={styles.endBtn} onClick={endCall} disabled={isCompleting}>📵</button>
      </div>
    </div>
  )
}

export default function InterviewPage() {
  return <Suspense><InterviewContent /></Suspense>
}
