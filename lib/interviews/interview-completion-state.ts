export type CompletionPayload = Readonly<{
  interviewerKey: string; role: string; company: string; level: string
  interviewType: string; persona: string; language: string
  answers: readonly Readonly<{ q: string; a: string }>[]
  score: number; summary: string; durationSeconds: number
}>

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function normalizeCompletionId(value: unknown): string | null {
  return typeof value === 'string' && UUID_V4.test(value) ? value.toLowerCase() : null
}

/** One in-memory completion intent; session ownership remains with the session helper. */
export function createInterviewCompletionState(generateId = () => crypto.randomUUID()) {
  let completionId: string | null = null
  let payload: CompletionPayload | null = null
  let savedId: string | null = null
  return {
    begin(answers: CompletionPayload['answers']) {
      if (!answers.length) return null
      if (!completionId) {
        completionId = normalizeCompletionId(generateId())
        if (!completionId) throw new Error('Invalid generated completion identity')
      }
      return completionId
    },
    freezePayload(value: CompletionPayload) {
      if (!completionId) throw new Error('Completion identity required')
      if (!payload) payload = Object.freeze({ ...value,
        answers: Object.freeze(value.answers.map(({ q, a }) => Object.freeze({ q, a }))),
      })
      return payload
    },
    acceptSaved(value: unknown) {
      if (!value || typeof value !== 'object') return false
      const response = value as Record<string, unknown>
      const id = normalizeCompletionId(response.id)
      if (!id || id !== completionId ||
        (response.replayed !== undefined && typeof response.replayed !== 'boolean')) return false
      savedId = id
      return true
    },
    get completionId() { return completionId },
    get payload() { return payload },
    get savedId() { return savedId },
    reset() { completionId = null; payload = null; savedId = null },
  }
}
