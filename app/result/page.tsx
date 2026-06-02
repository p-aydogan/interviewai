'use client'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ResultContent() {
  const params = useSearchParams()
  const score = Number(params.get('score') || 0)
  const summary = params.get('summary') || ''
  const color = score>=75?'#00e87a':score>=50?'#00c8f0':'#ff5f5f'
  return (
    <main style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'40px 24px',background:'#07090d',color:'#dde6ee',fontFamily:'sans-serif'}}>
      <div style={{maxWidth:580,width:'100%',background:'#0e1318',border:'1px solid #1b2630',borderRadius:20,padding:44,textAlign:'center'}}>
        <div style={{fontSize:46,marginBottom:14}}>🎯</div>
        <h1 style={{fontSize:26,fontWeight:800,marginBottom:8}}>Mülakat Tamamlandı</h1>
        <div style={{fontSize:90,fontWeight:800,lineHeight:1,color,margin:'20px 0 6px'}}>{score}</div>
        <div style={{fontSize:11,color:'#455566',marginBottom:32}}>GENEL PERFORMANS (100 ÜZERİNDEN)</div>
        <div style={{background:'#0b1219',borderRadius:12,padding:22,textAlign:'left',fontSize:14,lineHeight:1.8,marginBottom:28}}>{summary}</div>
        <Link href="/" style={{display:'inline-block',padding:'13px 28px',background:'#00c8f0',color:'#07090d',borderRadius:10,fontSize:14,fontWeight:700,textDecoration:'none'}}>Yeniden Başla</Link>
      </div>
    </main>
  )
}

export default function ResultPage() {
  return <Suspense><ResultContent /></Suspense>
