import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
import { admitProvider, BoundaryError, consumeProvider, publicFailure, readRequest } from '@/lib/providers/provider-boundary'

// Exactly the two voices currently used by LiveInterviewClient.
const VOICES = ['EXAVITQu4vr4xnSDxMaL', 'pNInz6obpgDQGcFmaJgB']
export async function POST(request: Request) {
  let release: (() => void) | undefined
  try {
    const auth = await getAuthenticatedUser(request)
    if (auth.status !== 'authenticated') throw new BoundaryError('unauthorized', 401)
    const body = await readRequest(request)
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new BoundaryError('invalid_input', 400)
    const input = body as Record<string, unknown>
    if (Object.keys(input).some(key => !['text','voiceId'].includes(key)) || typeof input.text !== 'string' ||
        !input.text.trim() || Array.from(input.text).length > 2000 || typeof input.voiceId !== 'string' ||
        !VOICES.includes(input.voiceId)) throw new BoundaryError('invalid_input', 400)
    release = admitProvider(auth.user.id)
    const key = process.env.ELEVENLABS_API_KEY
    if (!key) throw new BoundaryError('provider_unavailable', 503)
    const audio = await consumeProvider(`https://api.elevenlabs.io/v1/text-to-speech/${input.voiceId}`, {
      method: 'POST', headers: { 'xi-api-key': key, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
      body: JSON.stringify({ text: input.text, model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.48, similarity_boost: 0.78, style: 0.4, use_speaker_boost: true } }),
    }, 20_000, 5 * 1024 * 1024, (bytes, response) => {
      if (response.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'audio/mpeg' ||
          bytes.length < 4 || !((bytes[0] === 73 && bytes[1] === 68 && bytes[2] === 51 && bytes.length >= 10) ||
          (bytes[0] === 255 && (bytes[1] & 224) === 224))) throw Error('invalid_audio')
      return bytes
    })
    return new Response(new Uint8Array(audio).buffer, { headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'private, no-store' } })
  } catch (error) { return publicFailure(error) }
  finally { release?.() }
}
