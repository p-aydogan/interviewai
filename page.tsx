'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

const INTERVIEWERS = [
  {
    id: 'f',
    name: 'Sarah Chen',
    role: 'Sr. HR Manager',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=face',
    heygenAvatar: 'Vanessa-invest-20240827',
    voiceId: '21m00Tcm4TlvDq8ikWAM',
  },
  {
    id: 'm',
    name: 'Marcus Reid',
    role: 'Tech Lead',
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop&crop=face',
    heygenAvatar: 'Eric_public_pro2_20230608',
    voiceId: 'ErXwobaYiN019PkySvjV',
  },
]

export default function SetupPage() {
  const router = useRouter()
  const [selected, setSelected] = useState('f')
  const [role, setRole] = useState('')
  const [company, setCompany] = useState('')
  const [level, setLevel] = useState('mid')
  const [itype, setItype] = useState('behavioral')
  const [persona, setPersona] = useState('formal')

  function start() {
    const params = new URLSearchParams({
      iv: selected, role, company, level, itype, persona,
    })
    router.push(`/interview?${params}`)
  }

  return (
    <main className={styles.main}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <div className={styles.dot}>🎯</div>
          <span className={styles.brandName}>InterviewAI</span>
        </div>

        <h1 className={styles.title}>Gerçek mülakat<br /><span>deneyimi.</span></h1>
        <p className={styles.sub}>
          HeyGen gerçek insan avatarı ve ElevenLabs sesiyle konuşan yapay zeka mülakatçıyla pratik yap.
        </p>

        <div className={styles.section}>
          <label className={styles.sectionLabel}>MÜLAKATÇIYı SEÇ</label>
          <div className={styles.ivGrid}>
            {INTERVIEWERS.map(iv => (
              <div
                key={iv.id}
                className={`${styles.ivCard} ${selected === iv.id ? styles.sel : ''}`}
                onClick={() => setSelected(iv.id)}
              >
                {selected === iv.id && <div className={styles.check}>✓</div>}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className={styles.ivPhoto} src={iv.photo} alt={iv.name} />
                <div className={styles.ivName}>{iv.name}</div>
                <div className={styles.ivRole}>{iv.role}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.grid2}>
          <div className={styles.field}>
            <label>POZİSYON</label>
            <input placeholder="ör. Product Manager" value={role} onChange={e => setRole(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label>ŞİRKET / SEKTÖR</label>
            <input placeholder="ör. Fintech" value={company} onChange={e => setCompany(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label>SEVİYE</label>
            <select value={level} onChange={e => setLevel(e.target.value)}>
              <option value="junior">Junior (0–2 yıl)</option>
              <option value="mid">Mid-level (2–5 yıl)</option>
              <option value="senior">Senior (5+ yıl)</option>
            </select>
          </div>
          <div className={styles.field}>
            <label>MÜLAKAT TÜRÜ</label>
            <select value={itype} onChange={e => setItype(e.target.value)}>
              <option value="behavioral">Davranışsal / HR</option>
              <option value="technical">Teknik</option>
              <option value="mixed">Karma</option>
              <option value="case">Vaka Analizi</option>
            </select>
          </div>
          <div className={`${styles.field} ${styles.full}`}>
            <label>MÜLAKATÇı TARZI</label>
            <select value={persona} onChange={e => setPersona(e.target.value)}>
              <option value="friendly">😊 Arkadaşça</option>
              <option value="formal">👔 Profesyonel</option>
              <option value="tough">🧊 Zorlu</option>
              <option value="curious">🔍 Analitik</option>
            </select>
          </div>
        </div>

        <button className={styles.startBtn} onClick={start}>
          📹 Görüşmeye Başla
        </button>
      </div>
    </main>
  )
}
