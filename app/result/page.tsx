'use client'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function R() {
  const p = useSearchParams()
  const score = Number(p.get('score') || 0)
  const summary = p.get('summary') || ''
  const color = score>=75?'#00e87a':score>=50?'#00c8f0':'#ff5f5f'
  return (
    <main style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'40px',background:'#07090d',color:'#dde6ee'}}>
      <div style={{maxWidth:500,width:'100%',background:'#0e1318',borderRadius:20,padding:40,textAlign:'center'}}>
        <div style={{fontSize:40}}>🎯</div>
        <h1 style={{fontSize:24,fontWeight:800,margin:'12px 0'}}>Mülakat Tamamlandı</h1>
        <div style={{fontSize:80,fontWeight:800,color}}>{score}</div>
        <div style={{fontSize:11,color:'#455566',marginBottom:24}}>PUAN</div>
        <div style={{background:'#0b1219',borderRadius:12,padding:20,textAlign:'left',fontSize:14,lineHeight:1.8,marginBottom:24}}>{summary}</div>
        <Link href="/" style={{display:'inline-block',padding:'12px 24px',background:'#00c8f0',color:'#07090d',borderRadius:10,fontSize:14,fontWeight:700,textDecoration:'none'}}>Yeniden Başla</Link>
      </div>
    </main>
  )
}

export default function ResultPage() {
  return <Suspense><R /></Suspense>
}
