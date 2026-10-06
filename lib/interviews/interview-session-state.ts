export type SessionAnswer = Readonly<{ q: string; a: string }>
export type SessionOperation = Readonly<{ id: number; kind: 'generation' | 'feedback' | 'completion' }>
export type AcceptedQuestion = Readonly<{ id: number; ordinal: number; text: string }>

/** Synchronous ownership boundary for one mounted interview; no provider or React state. */
export function createInterviewSessionState() {
  let identity = 0
  let disposed = false
  let operation: SessionOperation | null = null
  let question: AcceptedQuestion | null = null
  let consumedAnswer: SessionAnswer | null = null

  function begin(kind: SessionOperation['kind']): SessionOperation | null {
    if (disposed || operation) return null
    operation = Object.freeze({ id: ++identity, kind })
    return operation
  }
  function isCurrent(token: SessionOperation) {
    return !disposed && operation === token && token.id === identity
  }
  function release(token: SessionOperation) {
    if (!isCurrent(token)) return false
    operation = null
    return true
  }
  function beginGeneration() {
    if ((question?.ordinal ?? 0) >= 5) return null
    const token = begin('generation')
    return token ? { token, ordinal: (question?.ordinal ?? 0) + 1 } : null
  }
  function acceptQuestion(token: SessionOperation, value: unknown) {
    if (!isCurrent(token) || token.kind !== 'generation' || typeof value !== 'string' || !value.trim()) return null
    // One acceptance per generation token, even before its finally block releases it.
    if (question?.id === token.id) return null
    question = Object.freeze({ id: token.id, ordinal: (question?.ordinal ?? 0) + 1, text: value.trim() })
    consumedAnswer = null
    return question
  }
  function claimAnswer(answer: string) {
    if (!question || consumedAnswer || !answer.trim()) return null
    const token = begin('feedback')
    if (!token) return null
    consumedAnswer = Object.freeze({ q: question.text, a: answer })
    return { token, answer: consumedAnswer }
  }
  function retryFeedback() {
    if (!consumedAnswer) return null
    const token = begin('feedback')
    return token ? { token, answer: consumedAnswer } : null
  }
  function beginCompletion(answers: readonly SessionAnswer[]) {
    const token = begin('completion')
    if (!token) return null
    const snapshot = Object.freeze(answers.map(answer => Object.freeze({ q: answer.q, a: answer.a })))
    return { token, snapshot }
  }
  function canSpeak(accepted: AcceptedQuestion) {
    return !disposed && question === accepted && operation?.kind !== 'completion'
  }
  return {
    beginGeneration, acceptQuestion, claimAnswer, retryFeedback, beginCompletion, isCurrent, release, canSpeak,
    get question() { return question },
    get answered() { return consumedAnswer !== null },
    get busy() { return operation !== null },
    dispose() { disposed = true; ++identity; operation = null },
  }
}
