import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
import { admitProvider, BoundaryError, consumeProvider, publicFailure, readRequest } from '@/lib/providers/provider-boundary'
import { buildClaudePrompt, parseClaudeInput, parseClaudeResponse } from '@/lib/providers/claude-contract'

export async function POST(request: Request) {
  let release: (() => void) | undefined
  try {
    const auth = await getAuthenticatedUser(request)
    if (auth.status !== 'authenticated') throw new BoundaryError('unauthorized', 401)
    const input = parseClaudeInput(await readRequest(request))
    release = admitProvider(auth.user.id)
    const key = process.env.ANTHROPIC_API_KEY
    if (!key) throw new BoundaryError('provider_unavailable', 503)
    const text = await consumeProvider('https://api.anthropic.com/v1/messages', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify(buildClaudePrompt(input)),
    }, 30_000, 256 * 1024, bytes => parseClaudeResponse(bytes, input.operation))
    return Response.json({ text }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) { return publicFailure(error) }
  finally { release?.() }
}
