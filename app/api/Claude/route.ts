import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
 console.log("ANTHROPIC_API_KEY exists:", !!apiKey)
  if (!apiKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY not set' }, { status: 500 })

  const body = await req.json()
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system: body.system,
      messages: [{ role: 'user', content: body.message }],
    }),
  })
  const data = await res.json()
 console.log("Claude response:", JSON.stringify(data, null, 2))
  return NextResponse.json({ text: data.content?.[0]?.text || '' })
}
