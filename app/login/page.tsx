'use client'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useState, useEffect } from 'react'

type Mode = 'login' | 'signup' | 'reset' | 'verify' | 'newpassword'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/')
      }
    })
  }, [])
const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setMsg(''); setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setMsg(error.message)
    else router.push('/')
    setLoading(false)
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setMsg(''); setLoading(true)
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: undefined }
    })
    if (error) setMsg(error.message)
    else { setMsg('Doğrulama kodu e-postana gönderildi.'); setMode('verify') }
    setLoading(false)
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setMsg(''); setLoading(true)
     const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false, emailRedirectTo: undefined }
    })
    if (error) setMsg(error.message)
    else { setMsg('Doğrulama kodu e-postana gönderildi.'); setMode('verify') }
    setLoading(false)
  }
  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setMsg(''); setLoading(true)
    const { error } = await supabase.auth.verifyOtp({
      email, token: otp,
      type: mode === 'verify' ? 'email' : 'email'
    })
    if (error) setMsg(error.message)
    else {
      if (mode === 'verify') router.push('/')
      else setMode('newpassword')
    }
    setLoading(false)
  }

  async function handleNewPassword(e: React.FormEvent) {
    e.preventDefault()
    setMsg(''); setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) setMsg(error.message)
    else { setMsg('Şifren güncellendi!'); setTimeout(()=>router.push('/'), 1500) }
    setLoading(false)
  }
const titles: Record<Mode, string> = {
    login: 'Giriş Yap', signup: 'Kayıt Ol',
    reset: 'Şifre Sıfırla', verify: 'Kodu Gir', newpassword: 'Yeni Şifre Belirle'
  }

  return (
    <main style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#07090d',color:'#dde6ee',padding:24}}>
      <div style={{maxWidth:400,width:'100%',background:'#0e1318',border:'1px solid #1b2630',borderRadius:16,padding:32}}>
        <h1 style={{fontSize:24,fontWeight:800,marginBottom:8,fontFamily:'sans-serif'}}>{titles[mode]}</h1>
        <p style={{color:'#455566',fontSize:13,marginBottom:24}}>InterviewAI hesabınla devam et</p>

        {/* LOGIN */}
        {mode==='login' && (
          <form onSubmit={handleLogin}>
            <div style={{marginBottom:14}}>
              <label style={{fontSize:11,color:'#00c8f0',display:'block',marginBottom:6}}>E-POSTA</label>
              <input type="email" required value={email} onChange={e=>setEmail(e.target.value)}
                style={{width:'100%',background:'#0b1219',border:'1px solid #1b2630',borderRadius:8,padding:'12px 14px',color:'#dde6ee',fontSize:14,outline:'none'}}/>
            </div>
            <div style={{marginBottom:14}}>
              <label style={{fontSize:11,color:'#00c8f0',display:'block',marginBottom:6}}>ŞİFRE</label>
              <input type="password" required value={password} onChange={e=>setPassword(e.target.value)}
                style={{width:'100%',background:'#0b1219',border:'1px solid #1b2630',borderRadius:8,padding:'12px 14px',color:'#dde6ee',fontSize:14,outline:'none'}}/>
            </div>
            {msg&&<div style={{fontSize:12,color:'#ff5f5f',marginBottom:14}}>{msg}</div>}
            <button type="submit" disabled={loading}
              style={{width:'100%',padding:13,background:'#00c8f0',color:'#07090d',border:'none',borderRadius:8,fontWeight:700,fontSize:14,cursor:'pointer',marginBottom:14}}>
              {loading?'Yükleniyor...':'Giriş Yap'}
            </button>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:12}}>
              <button type="button" onClick={()=>setMode('signup')} style={{background:'none',border:'none',color:'#455566',cursor:'pointer',textDecoration:'underline'}}>Hesap oluştur</button>
              <button type="button" onClick={()=>setMode('reset')} style={{background:'none',border:'none',color:'#455566',cursor:'pointer',textDecoration:'underline'}}>Şifremi unuttum</button>
            </div>
          </form>
        )}
{/* SIGNUP */}
        {mode==='signup' && (
          <form onSubmit={handleSignup}>
            <div style={{marginBottom:14}}>
              <label style={{fontSize:11,color:'#00c8f0',display:'block',marginBottom:6}}>E-POSTA</label>
              <input type="email" required value={email} onChange={e=>setEmail(e.target.value)}
                style={{width:'100%',background:'#0b1219',border:'1px solid #1b2630',borderRadius:8,padding:'12px 14px',color:'#dde6ee',fontSize:14,outline:'none'}}/>
            </div>
            <div style={{marginBottom:14}}>
              <label style={{fontSize:11,color:'#00c8f0',display:'block',marginBottom:6}}>ŞİFRE</label>
              <input type="password" required value={password} onChange={e=>setPassword(e.target.value)}
                style={{width:'100%',background:'#0b1219',border:'1px solid #1b2630',borderRadius:8,padding:'12px 14px',color:'#dde6ee',fontSize:14,outline:'none'}}/>
            </div>
            {msg&&<div style={{fontSize:12,color:msg.includes('gönderildi')?'#00e87a':'#ff5f5f',marginBottom:14}}>{msg}</div>}
            <button type="submit" disabled={loading}
              style={{width:'100%',padding:13,background:'#00c8f0',color:'#07090d',border:'none',borderRadius:8,fontWeight:700,fontSize:14,cursor:'pointer',marginBottom:14}}>
              {loading?'Yükleniyor...':'Kayıt Ol'}
            </button>
            <button type="button" onClick={()=>setMode('login')} style={{background:'none',border:'none',color:'#455566',cursor:'pointer',textDecoration:'underline',fontSize:12}}>Giriş ekranına dön</button>
          </form>
        )}

        {/* RESET */}
        {mode==='reset' && (
          <form onSubmit={handleReset}>
            <div style={{marginBottom:14}}>
              <label style={{fontSize:11,color:'#00c8f0',display:'block',marginBottom:6}}>E-POSTA</label>
              <input type="email" required value={email} onChange={e=>setEmail(e.target.value)}
                style={{width:'100%',background:'#0b1219',border:'1px solid #1b2630',borderRadius:8,padding:'12px 14px',color:'#dde6ee',fontSize:14,outline:'none'}}/>
            </div>
            {msg&&<div style={{fontSize:12,color:msg.includes('gönderildi')?'#00e87a':'#ff5f5f',marginBottom:14}}>{msg}</div>}
            <button type="submit" disabled={loading}
              style={{width:'100%',padding:13,background:'#00c8f0',color:'#07090d',border:'none',borderRadius:8,fontWeight:700,fontSize:14,cursor:'pointer',marginBottom:14}}>
              {loading?'Yükleniyor...':'Kod Gönder'}
            </button>
            <button type="button" onClick={()=>setMode('login')} style={{background:'none',border:'none',color:'#455566',cursor:'pointer',textDecoration:'underline',fontSize:12}}>Giriş ekranına dön</button>
          </form>
        )}
   {/* VERIFY OTP */}
        {mode==='verify' && (
          <form onSubmit={handleVerify}>
            <p style={{fontSize:13,color:'#455566',marginBottom:16}}>{email} adresine 6 haneli kod gönderildi.</p>
            <div style={{marginBottom:14}}>
              <label style={{fontSize:11,color:'#00c8f0',display:'block',marginBottom:6}}>DOĞRULAMA KODU</label>
              <input type="text" required maxLength={6} value={otp} onChange={e=>setOtp(e.target.value)}
                placeholder="123456"
                style={{width:'100%',background:'#0b1219',border:'1px solid #1b2630',borderRadius:8,padding:'12px 14px',color:'#dde6ee',fontSize:20,outline:'none',textAlign:'center',letterSpacing:8}}/>
            </div>
            {msg&&<div style={{fontSize:12,color:'#ff5f5f',marginBottom:14}}>{msg}</div>}
            <button type="submit" disabled={loading}
              style={{width:'100%',padding:13,background:'#00c8f0',color:'#07090d',border:'none',borderRadius:8,fontWeight:700,fontSize:14,cursor:'pointer',marginBottom:14}}>
              {loading?'Doğrulanıyor...':'Kodu Onayla'}
            </button>
            <button type="button" onClick={()=>setMode('login')} style={{background:'none',border:'none',color:'#455566',cursor:'pointer',textDecoration:'underline',fontSize:12}}>Giriş ekranına dön</button>
          </form>
        )}

        {/* NEW PASSWORD */}
        {mode==='newpassword' && (
          <form onSubmit={handleNewPassword}>
            <div style={{marginBottom:14}}>
              <label style={{fontSize:11,color:'#00c8f0',display:'block',marginBottom:6}}>YENİ ŞİFRE</label>
              <input type="password" required value={newPassword} onChange={e=>setNewPassword(e.target.value)}
                style={{width:'100%',background:'#0b1219',border:'1px solid #1b2630',borderRadius:8,padding:'12px 14px',color:'#dde6ee',fontSize:14,outline:'none'}}/>
            </div>
            {msg&&<div style={{fontSize:12,color:msg.includes('güncellendi')?'#00e87a':'#ff5f5f',marginBottom:14}}>{msg}</div>}
            <button type="submit" disabled={loading}
              style={{width:'100%',padding:13,background:'#00c8f0',color:'#07090d',border:'none',borderRadius:8,fontWeight:700,fontSize:14,cursor:'pointer'}}>
              {loading?'Kaydediliyor...':'Şifreyi Güncelle'}
            </button>
          </form>
        )}

      </div>
    </main>
  )
}