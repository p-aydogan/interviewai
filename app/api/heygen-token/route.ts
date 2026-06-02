import { NextResponse } from 'next/server'

export async function POST() {
  const apiKey = process.env.HEYGEN_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'HEYGEN_API_KEY not set' }, { status: 500 })
  }
  try {
    const res = await fetch('https://api.heygen.com/v1/streaming.create_token', {
      method: 'POST',
      headers: { 'x-api-key': apiKey },
    })
    if (!res.ok) throw new Error(`HeyGen token error: ${res.status}`)
    const data = await res.json()
    return NextResponse.json({ token: data.data?.token })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
