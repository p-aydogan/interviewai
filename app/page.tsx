'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import styles from './page.module.css'

const INTERVIEWERS = [
  { id:'f', name:'Sarah Chen', role:'Sr. HR Manager', photo:'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=face' },
  { id:'m', name:'Marcus Reid', role:'Tech Lead', photo:'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop&crop=face' },
]

const UI: Record<string, Record<string, string>> = {
  tr: {
    title: 'Gerçek mülakat', titleSpan: 'deneyimi.',
    sub: 'Yapay zeka mülakatçıyla sesli ve görüntülü pratik yap.',
    selectIV: 'MÜLAKATÇIYı SEÇ', position: 'POZİSYON', company: 'ŞİRKET / SEKTÖR',
    level: 'SEVİYE', itype: 'MÜLAKAT TÜRÜ', persona: 'MÜLAKATÇı TARZI',
    lang: 'DİL', cv: 'CV YÜKLE (opsiyonel)', cvLoaded: 'CV yüklendi',
    start: '📹 Görüşmeye Başla', login: 'Giriş Yap', signup: 'Kayıt Ol', logout: 'Çıkış Yap',
    remove: 'Kaldır',
    junior: 'Junior (0–2 yıl)', mid: 'Mid-level (2–5 yıl)', senior: 'Senior (5+ yıl)',
    behavioral: 'Davranışsal / HR', technical: 'Teknik', mixed: 'Karma', case: 'Vaka Analizi',
    friendly: '😊 Arkadaşça', formal: '👔 Profesyonel', tough: '🧊 Zorlu', curious: '🔍 Analitik',
  },
  en: {
    title: 'Real interview', titleSpan: 'experience.',
    sub: 'Practice with an AI interviewer with voice and video.',
    selectIV: 'SELECT INTERVIEWER', position: 'POSITION', company: 'COMPANY / INDUSTRY',
    level: 'LEVEL', itype: 'INTERVIEW TYPE', persona: 'INTERVIEWER STYLE',
    lang: 'LANGUAGE', cv: 'UPLOAD CV (optional)', cvLoaded: 'CV uploaded',
    start: '📹 Start Interview', login: 'Log In', signup: 'Sign Up', logout: 'Log Out',
    remove: 'Remove',
    junior: 'Junior (0–2 yrs)', mid: 'Mid-level (2–5 yrs)', senior: 'Senior (5+ yrs)',
    behavioral: 'Behavioral / HR', technical: 'Technical', mixed: 'Mixed', case: 'Case Study',
    friendly: '😊 Friendly', formal: '👔 Professional', tough: '🧊 Tough', curious: '🔍 Analytical',
  },
  de: {
    title: 'Echtes Vorstellungsgespräch', titleSpan: 'Erlebnis.',
    sub: 'Übe mit einem KI-Interviewer mit Sprache und Video.',
    selectIV: 'INTERVIEWER WÄHLEN', position: 'POSITION', company: 'UNTERNEHMEN / BRANCHE',
    level: 'NIVEAU', itype: 'GESPRÄCHSTYP', persona: 'INTERVIEWER-STIL',
    lang: 'SPRACHE', cv: 'LEBENSLAUF HOCHLADEN (optional)', cvLoaded: 'Lebenslauf hochgeladen',
    start: '📹 Gespräch starten', login: 'Anmelden', signup: 'Registrieren', logout: 'Abmelden',
    remove: 'Entfernen',
    junior: 'Junior (0–2 J.)', mid: 'Mid-level (2–5 J.)', senior: 'Senior (5+ J.)',
    behavioral: 'Verhalten / HR', technical: 'Technisch', mixed: 'Gemischt', case: 'Fallstudie',
    friendly: '😊 Freundlich', formal: '👔 Professionell', tough: '🧊 Anspruchsvoll', curious: '🔍 Analytisch',
  },
}
export default function SetupPage() {
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [uiLang, setUiLang] = useState('tr')
  const [selected, setSelected] = useState('f')
  const [role, setRole] = useState('')
  const [company, setCompany] = useState('')
  const [level, setLevel] = useState('mid')
  const [itype, setItype] = useState('behavioral')
  const [persona, setPersona] = useState('formal')
  const [language, setLanguage] = useState('tr')
  const [cvText, setCvText] = useState('')

  useEffect(() => {
    const savedLang = localStorage.getItem('interviewai_uilang')
    if (savedLang) { setUiLang(savedLang); setLanguage(savedLang) }
    const savedCv = localStorage.getItem('interviewai_cv')
    if (savedCv) setCvText(savedCv)
  }, [])
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAuthenticated(!!user)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])
  function changeUiLang(lang: string) {
    setUiLang(lang)
    setLanguage(lang)
    localStorage.setItem('interviewai_uilang', lang)
  }
  async function handleSignOut() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Sign out failed:', error)
    }
  }
  async function handleCV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const trimmed = text.slice(0, 3000)
    setCvText(trimmed)
    localStorage.setItem('interviewai_cv', trimmed)
  }

  function start() {
    const params = new URLSearchParams({
      iv: selected, role, company, level, itype, persona, language, cv: cvText,
    })
    router.push(`/interview?${params}`)
  }

  const t = UI[uiLang]
 return (
    <main className={styles.main}>
      <div className={styles.inner}>
        {/* Top bar */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
          <div className={styles.brand}>
            <div className={styles.dot}>🎯</div>
            <span className={styles.brandName}>InterviewAI</span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            {/* Dil seçici */}
            <div style={{display:'flex',gap:4,marginRight:8}}>
              {['tr','en','de'].map(l=>(
                <button key={l} onClick={()=>changeUiLang(l)}
                  style={{padding:'5px 10px',borderRadius:6,border:'1px solid',
                    borderColor:uiLang===l?'#00c8f0':'#1b2630',
                    background:uiLang===l?'rgba(0,200,240,0.1)':'transparent',
                    color:uiLang===l?'#00c8f0':'#455566',
                    fontSize:12,cursor:'pointer',fontWeight:uiLang===l?700:400}}>
                  {l==='tr'?'🇹🇷':l==='en'?'🇬🇧':'🇩🇪'}
                </button>
              ))}
            </div>
            {isAuthenticated ? (
              <button
                onClick={handleSignOut}
                style={{padding:'7px 14px',background:'transparent',border:'1px solid #1b2630',borderRadius:8,color:'#455566',fontSize:13,cursor:'pointer'}}
              >
                {t.logout}
              </button>
            ) : (
              <>
                <a href="/login" style={{padding:'7px 14px',background:'transparent',border:'1px solid #1b2630',borderRadius:8,color:'#455566',fontSize:13,textDecoration:'none'}}>{t.login}</a>
                <a href="/login" style={{padding:'7px 14px',background:'#00c8f0',border:'none',borderRadius:8,color:'#07090d',fontSize:13,fontWeight:700,textDecoration:'none'}}>{t.signup}</a>
              </>
            )}

          </div>
        </div>

        <h1 className={styles.title}>{t.title}<br /><span>{t.titleSpan}</span></h1>
        <p className={styles.sub}>{t.sub}</p>

        <div className={styles.section}>
          <label className={styles.sectionLabel}>{t.selectIV}</label>
          <div className={styles.ivGrid}>
            {INTERVIEWERS.map(iv => (
              <div key={iv.id} className={`${styles.ivCard} ${selected===iv.id?styles.sel:''}`} onClick={()=>setSelected(iv.id)}>
                {selected===iv.id&&<div className={styles.check}>✓</div>}
                <img className={styles.ivPhoto} src={iv.photo} alt={iv.name}/>
                <div className={styles.ivName}>{iv.name}</div>
                <div className={styles.ivRole}>{iv.role}</div>
              </div>
            ))}
          </div>
        </div>
  <div className={styles.grid2}>
          <div className={styles.field}>
            <label>{t.position}</label>
            <input placeholder="ör. Product Manager" value={role} onChange={e=>setRole(e.target.value)}/>
          </div>
          <div className={styles.field}>
            <label>{t.company}</label>
            <input placeholder="ör. Fintech" value={company} onChange={e=>setCompany(e.target.value)}/>
          </div>
          <div className={styles.field}>
            <label>{t.level}</label>
            <select value={level} onChange={e=>setLevel(e.target.value)}>
              <option value="junior">{t.junior}</option>
              <option value="mid">{t.mid}</option>
              <option value="senior">{t.senior}</option>
            </select>
          </div>
          <div className={styles.field}>
            <label>{t.itype}</label>
            <select value={itype} onChange={e=>setItype(e.target.value)}>
              <option value="behavioral">{t.behavioral}</option>
              <option value="technical">{t.technical}</option>
              <option value="mixed">{t.mixed}</option>
              <option value="case">{t.case}</option>
            </select>
          </div>
          <div className={styles.field}>
            <label>{t.lang}</label>
            <select value={language} onChange={e=>setLanguage(e.target.value)}>
              <option value="tr">🇹🇷 Türkçe</option>
              <option value="en">🇬🇧 English</option>
              <option value="de">🇩🇪 Deutsch</option>
            </select>
          </div>
          <div className={styles.field}>
            <label>{t.persona}</label>
            <select value={persona} onChange={e=>setPersona(e.target.value)}>
              <option value="friendly">{t.friendly}</option>
              <option value="formal">{t.formal}</option>
              <option value="tough">{t.tough}</option>
              <option value="curious">{t.curious}</option>
            </select>
          </div>
          <div className={`${styles.field} ${styles.full}`}>
            <label>{t.cv}</label>
            <input type="file" accept=".txt,.pdf" onChange={handleCV}
              style={{color:'var(--t)',background:'var(--c)',border:'1px solid var(--bd)',borderRadius:8,padding:'10px 14px',width:'100%'}}/>
            {cvText&&(
              <div style={{fontSize:11,color:'var(--g)',marginTop:6,display:'flex',alignItems:'center',gap:8}}>
                <span>✓ {t.cvLoaded} ({cvText.length} karakter)</span>
                <button onClick={()=>{setCvText('');localStorage.removeItem('interviewai_cv')}}
                  style={{background:'transparent',border:'none',color:'var(--m)',cursor:'pointer',fontSize:11,textDecoration:'underline'}}>{t.remove}</button>
              </div>
            )}
          </div>
        </div>

        <button className={styles.startBtn} onClick={start}>{t.start}</button>
      </div>
    </main>
  )
}