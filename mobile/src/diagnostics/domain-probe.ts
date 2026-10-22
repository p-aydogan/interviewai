import { parseInterviewSetupInput } from '../../../lib/interviews/interview-setup-input'
import { createInterviewSessionState } from '../../../lib/interviews/interview-session-state'
import { createInterviewCompletionState } from '../../../lib/interviews/interview-completion-state'

/** Synthetic local invariant probe only. No provider, persistence, or business record. */
export function domainProbe() {
  const setup = parseInterviewSetupInput({ iv: 'f', level: 'junior', itype: 'technical', persona: 'friendly', language: 'en' })
  const session = createInterviewSessionState()
  const generation = session.beginGeneration()
  const question = generation && session.acceptQuestion(generation.token, 'Local architecture probe')
  if (generation) session.release(generation.token)
  const first = session.claimAnswer('Local probe answer')
  const duplicate = session.claimAnswer('Duplicate probe')
  session.dispose()
  // Injection proves root helper reuse without relying on the native global crypto API.
  // Production random UUID adapter is deferred until interview-core implementation.
  const completion = createInterviewCompletionState(() => '00000000-0000-4000-8000-000000000001')
  return !!setup && !!question && !!first && duplicate === null && completion.begin([]) === null &&
    completion.begin([{ q: 'Probe', a: 'Probe' }]) === '00000000-0000-4000-8000-000000000001'
}
