'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const INTERVIEWERS = [
  { id:'f', name:'Sarah Chen', role:'Sr. HR Manager',
    photo:'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=face' },
  { id:'m', name:'Marcus Reid', role:'Tech Lead',
    photo:'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop&crop=face' },
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
    const params = new URLSearchParams({iv:selected,role,company,level,itype,persona})
    router.push(`/interview?${params}`)
  }

  return (
    <main style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'40px 24px',background:'#07090d',color:'#dde6ee',fontFamily:'sans-serif'}}>
      <div style={{width:'100%',maxWidth:580}}>
        <div style={{display:'flex',alignItems:'center',gap:11,marginBottom:48}}>
          <div style={{width:36,height:36,borderRadius:9,background:'linear-gradient(135deg,#00c8f0,#0090b8)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>🎯</div>
          <span style={{fontSize:18,fontWeight:700}}>InterviewAI</span>
        </div>
        <h1 style={{fontSize:44,fontWeight:800,lineHeight:1.05,letterSpacing:-1.4,marginBottom:12}}>Gerçek mülakat<br/><span style={{color:'#00c8f0'}}>deneyimi.</span></h1>
        <p style={{color:'#455566',fontSize:15,lineHeight:1.75,marginBottom:40}}>Yapay zeka mülakatçıyla görüntülü pratik yap.</p>
        <div style={{marginBottom:16}}>
          <div style={{fontFamily:'monospace',fontSize:10,letterSpacing:1.4,textTransform:'uppercase',color:'#00c8f0',marginBottom:10}}>MÜLAKATÇIYI SEÇ</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            {INTERVIEWERS.map(iv=>(
              <div key={iv.id} onClick={()=>setSelected(iv.id)}
                style={{background:'#0e1318',border:`2px solid ${selected===iv.id?'#00c8f0':'#1b2630'}`,borderRadius:13,padding:'16px 12px',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:9,textAlign:'center'}}>
                <img src={iv.photo} alt={iv.name} style={{width:72,height:72,borderRadius:'50%',objectFit:'cover',objectPosition:'top'}}/>
                <div style={{fontWeight:700,fontSize:13}}>{iv.name}</div>
                <div style={{fontSize:11,color:'#455566'}}>{iv.role}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            <label style={{fontFamily:'monospace',fontSize:10,letterSpacing:1.4,textTransform:'uppercase',color:'#00c8f0'}}>POZİSYON</label>
            <input placeholder="ör. Product Manager" value={role} onChange={e=>setRole(e.target.value)}
              style={{background:'#0b1219',border:'1px solid #1b2630',borderRadius:8,padding:'11px 13px',color:'#dde6ee',fontSize:14,outline:'none'}}/>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            <label style={{fontFamily:'monospace',fontSize:10,letterSpacing:1.4,textTransform:'uppercase',color:'#00c8f0'}}>ŞİRKET</label>
            <input placeholder="ör. Fintech" value={company} onChange={e=>setCompany(e.target.value)}
              style={{background:'#0b1219',border:'1px solid #1b2630',borderRadius:8,padding:'11px 13px',color:'#dde6ee',fontSize:14,outline:'none'}}/>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            <label style={{fontFamily:'monospace',fontSize:10,letterSpacing:1.4,textTransform:'uppercase',color:'#00c8f0'}}>SEVİYE</label>
            <select value={level} onChange={e=>setLevel(e.target.value)}
              style={{background:'#0b1219',border:'1px solid #1b2630',borderRadius:8,padding:'11px 13px',color:'#dde6ee',fontSize:14,outline:'none'}}>
              <option value="junior">Junior</option>
              <option value="mid">Mid-level</option>
              <option value="senior">Senior</option>
            </select>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            <label style={{fontFamily:'monospace',fontSize:10,letterSpacing:1.4,textTransform:'uppercase',color:'#00c8f0'}}>TÜR</label>
            <select value={itype} onChange={e=>setItype(e.target.value)}
              style={{background:'#0b1219',border:'1px solid #1b2630',borderRadius:8,padding:'11px 13px',color:'#dde6ee',fontSize:14,outline:'none'}}>
              <option value="behavioral">Davranışsal</option>
              <option value="technical">Teknik</option>
              <option value="mixed">Karma</option>
              <option value="case">Vaka</option>
            </select>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:6,gridColumn:'1/-1'}}>
            <label style={{fontFamily:'monospace',fontSize:10,letterSpacing:1.4,textTransform:'uppercase',color:'#00c8f0'}}>TARZI</label>
            <select value={persona} onChange={e=>setPersona(e.target.value)}
              style={{background:'#0b1219',border:'1px solid #1b2630',borderRadius:8,padding:'11px 13px',color:'#dde6ee',fontSize:14,outline:'none'}}>
              <option value="friendly">😊 Arkadaşça</option>
              <option value="formal">👔 Profesyonel</option>
              <option value="tough">🧊 Zorlu</option>
              <option value="curious">🔍 Analitik</option>
            </select>
          </div>
        </div>
        <button onClick={start}
          style={{width:'100%',marginTop:24,padding:17,background:'#00c8f0',color:'#07090d',border:'none',borderRadius:11,fontSize:15,fontWeight:800,cursor:'pointer'}}>
          📹 Görüşmeye Başla
        </button>
      </div>
    </main>
  )
}
