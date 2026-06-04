'use client'
import { useEffect, useRef, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import styles from './interview.module.css'

const IV: Record<string, any> = {
  f: { name:'Sarah Chen', role:'Sr. HR Manager',
    photo:'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face',
    voice:'21m00Tcm4TlvDq8ikWAM' },
  m: { name:'Marcus Reid', role:'Tech Lead',
    photo:'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face',
    voice:'ErXwobaYiN019PkySvjV' },
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
