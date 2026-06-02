'use client'
import { useEffect, useRef, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import StreamingAvatar, { AvatarQuality, StreamingEvents, TaskMode, TaskType } from '@heygen/streaming-avatar'
import styles from './interview.module.css'

const IV: Record<string, any> = {
  f: { name:'Sarah Chen', role:'Sr. HR Manager',
    photo:'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face',
    avatar:'Vanessa-invest-20240827', voice:'21m00Tcm4TlvDq8ikWAM' },
  m: { name:'Marcus Reid', role:'Tech Lead',
    photo:'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face',
    avatar:'Eric_public_pro2_20230608', voice:'ErXwobaYiN019PkySvjV' },
}
const P: Record<string,string> = {
  friendly:'Samimi mülakatçısın.',
  formal:'Profesyonel İK mülakatçısısın.',
  tough:'Baskılı mülakatçısın.',
  curious:'Analitik mülakatçısın.'
}
const L: Record<string,string> = {
  junior:'junior (0-2 yıl)',mid:'mid-level (2-5 yıl)',senior:'senior (5+ yıl)'
}
const T: Record<string,string> = {
  behavioral:'davranışsal/HR',technical:'teknik',mixed:'karma',case:'vaka analizi'
}function InterviewContent() {
  const params = useSearchParams()
  const router = useRouter()
  const ivKey = params.get('iv') || 'f'
  const iv = IV[ivKey]
  const role = params.get('role') || 'Genel'
  const company = params.get('company') || 'Genel'
  const level = params.get('level') || 'mid'
  const itype = params.get('itype') || 'behavioral'
  const persona = params.get('persona') || 'formal'
  const videoRef = useRef<HTMLVideoElement>(null)
  const camRef = useRef<HTMLVideoElement>(null)
  const avatarRef = useRef<StreamingAvatar | null>(null)
  const sessionIdRef = useRef('')
  const answersRef = useRef<{q:string;a:string}[]>([])
  const curQRef = useRef('')
  const qNumRef = useRef(0)
  const camStreamRef = useRef<MediaStream | null>(null)
  const [status, setStatus] = useState<'connecting'|'ready'|'speaking'|'thinking'>('connecting')
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
  const MAX_Q = 5useEffect(() => {
    const iv = setInterval(() => setSecs(s => s+1), 1000)
    return () => clearInterval(iv)
  }, [])

  const formatTime = (s: number) =>
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

  useEffect(() => {
    initAvatar()
    return () => { destroyAvatar() }
  }, [])

  async function initAvatar() {
    try {
      const tokenRes = await fetch('/api/heygen-token', {method:'POST'})
      const {token, error} = await tokenRes.json()
      if (error || !token) throw new Error(error||'No token')
      const avatar = new StreamingAvatar({token})
      avatarRef.current = avatar
      avatar.on(StreamingEvents.STREAM_READY, (e:any) => {
        if (videoRef.current) {
          videoRef.current.srcObject = e.detail
          videoRef.current.play().catch(()=>{})
        }
        setStatus('ready')
        askQuestion()
      })
      avatar.on(StreamingEvents.AVATAR_START_TALKING, () => setStatus('speaking'))
      avatar.on(StreamingEvents.AVATAR_STOP_TALKING, () => {
        setStatus('ready')
        setSubtitle('')
      })
      avatar.on(StreamingEvents.AVATAR_TALKING_MESSAGE, (msg:any) =>
        setSubtitle(msg?.detail?.message||''))
      avatar.on(StreamingEvents.STREAM_DISCONNECTED, () => setStatus('connecting'))
      const sessionData = await avatar.createStartAvatar({
        avatarName: iv.avatar,
        quality: AvatarQuality.High,
        voice: {voiceId: iv.voice},
      })
      sessionIdRef.current = sessionData.session_id
    } catch(err) {
      console.error('HeyGen init failed:', err)
      setStatus('ready')
      askQuestion()
    }
  }async function destroyAvatar() {
    if (avatarRef.current && sessionIdRef.current)
      await avatarRef.current.stopAvatar({sessionId: sessionIdRef.current}).catch(()=>{})
  }

  async function claudeCall(system: string, message: string) {
    const res = await fetch('/api/claude', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({system, message})
    })
    const data = await res.json()
    return data.text || ''
  }

  async function avatarSpeak(text: string) {
    setSubtitle(text)
    if (!avatarRef.current || !sessionIdRef.current) return
    try {
      await avatarRef.current.speak({
        text,
        sessionId: sessionIdRef.current,
        taskType: TaskType.TALK,
        taskMode: TaskMode.SYNC
      })
    } catch(e) { console.warn('speak error',e) }
  }

  const askQuestion = useCallback(async () => {
    setFeedback(''); setAnswer(''); setAwaitingNext(false)
    setQLoading(true); setStatus('thinking')
    const num = qNumRef.current + 1
    qNumRef.current = num; setQNum(num)
    const sys = `${P[persona]} Sen ${role} için ${T[itype]} mülakatı yapıyorsun. Aday: ${L[level]}. Şirket: ${company}. SADECE soruyu yaz. Türkçe. Soru ${num}.`
    const q = await claudeCall(sys, `${num}. mülakat sorusu`)
    curQRef.current = q; setQuestion(q); setQLoading(false)
    await avatarSpeak(q)
  }, [])async function submitAnswer() {
    if (!answer.trim()) return
    answersRef.current.push({q: curQRef.current, a: answer})
    setQLoading(true); setStatus('thinking')
    const sys = `${persona==='tough'?'Eleştirel':'Yapıcı'} mülakat koçusun. Türkçe. Cevabı değerlendir: güçlü yön (1-2 cümle) + gelişim noktası (1-2 cümle). Maks 5 cümle.`
    const fb = await claudeCall(sys, `Soru: "${curQRef.current}"\nCevap: "${answer}"`)
    setFeedback(fb); setQLoading(false); setAwaitingNext(true)
    await avatarSpeak(fb)
  }

  async function nextQuestion() {
    if (qNumRef.current >= MAX_Q) await endCall()
    else await askQuestion()
  }

  async function endCall() {
    await destroyAvatar()
    camStreamRef.current?.getTracks().forEach(t=>t.stop())
    const answers = answersRef.current
    if (!answers.length) {
      router.push('/result?score=0&summary=Cevap+verilmedi')
      return
    }
    const aText = answers.map((x,i)=>`S${i+1}: ${x.q}\nC: ${x.a}`).join('\n\n')
    const sys = `Kıdemli İK uzmanısın. Türkçe. Sadece JSON: {"score":0-100,"summary":"3-4 cümle"}`
    const raw = await claudeCall(sys, `Pozisyon: ${role}\n\n${aText}`)
    try {
      const p = JSON.parse(raw.replace(/```json|```/g,'').trim())
      router.push(`/result?score=${p.score}&summary=${encodeURIComponent(p.summary)}`)
    } catch {
      router.push('/result?score=0&summary=Değerlendirme+alınamadı')
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
  }return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <div className={styles.tbl}><div className={styles.rec}></div><span className={styles.tbt}>Mülakat</span></div>
        <div className={styles.tbr}><span className={styles.timer}>{formatTime(secs)}</span><span className={styles.qpill}>Soru {qNum}/{MAX_Q}</span></div>
      </div>
      <div className={styles.body}>
        <div className={styles.avPanel}>
          <div className={styles.avBg}></div>
          <video ref={videoRef} className={styles.hgVideo} autoPlay playsInline
            style={{display:status==='connecting'?'none':'block'}}/>
          {status==='connecting' && (
            <div className={styles.fallback}>
              <img className={styles.fallbackPhoto} src={iv.photo} alt={iv.name}/>
              <div className={styles.spinner}></div>
              <span className={styles.connText}>Bağlanıyor...</span>
            </div>
          )}
          <div className={styles.ntag}>
            <span className={styles.ntagName}>{iv.name}</span>
            <span className={styles.ntagRole}>{iv.role}</span>
            {status==='speaking' && <span className={styles.liveTag}>● CANLI</span>}
          </div>
          {status==='speaking' && (
            <div className={styles.wave}>
              {[1,2,3,4,5].map(i=><div key={i} className={styles.wb}
                style={{animationDelay:`${(i-1)*0.1}s`}}></div>)}
            </div>
          )}
          {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
          <div className={styles.selfView}>
            <video ref={camRef} autoPlay muted playsInline style={{display:'none'}}/>
            {!camOn && <div className={styles.camPh}><span>📷</span><span>Kapalı</span></div>}
            <div className={styles.svLabel}>Sen</div>
          </div>
        </div><div className={styles.rightPanel}>
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
                disabled={qLoading||awaitingNext}/>
              <div className={styles.actRow}>
                {!awaitingNext
                  ? <button className={styles.bSend} onClick={submitAnswer}
                      disabled={qLoading||!answer.trim()}>Gönder ↵</button>
                  : <button className={styles.bSend} onClick={nextQuestion}
                      disabled={qLoading}>{qNum>=MAX_Q?'Bitir 🏁':'Sonraki →'}</button>
                }
                <button className={styles.bSkip} onClick={nextQuestion}
                  disabled={qLoading}>Atla</button>
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
                KİŞİSEL NOTLARIN</label>
              <textarea className={styles.notesArea} placeholder="Not al..."/>
            </div>
          )}
        </div>
      </div>
      <div className={styles.controls}>
        <button className={`${styles.ctrl} ${!micOn?styles.ctrlOff:''}`}
          onClick={toggleMic}>{micOn?'🎙️':'🔇'}</button>
        <button className={`${styles.ctrl} ${!camOn?styles.ctrlOff:''}`}
          onClick={toggleCam}>{camOn?'📷':'🚫'}</button>
        <button className={styles.endBtn} onClick={endCall}>📵</button>
      </div>
    </div>
  )
}

export default function InterviewPage() {
  return <Suspense><InterviewContent /></Suspense>
}
