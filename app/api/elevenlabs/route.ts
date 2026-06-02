import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'ELEVENLABS_API_KEY not set' }, { status: 500 })

  const { text, voiceId } = await req.json()

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.48, similarity_boost: 0.78, style: 0.4, use_speaker_boost: true },
    }),
  })

  if (!res.ok) return NextResponse.json({ error: 'ElevenLabs error' }, { status: 500 })

  const buffer = await res.arrayBuffer()
  return new NextResponse(buffer, {
    headers: { 'Content-Type': 'audio/mpeg' },
  })
}
