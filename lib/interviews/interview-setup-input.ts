export const INTERVIEWER_KEYS = ['f', 'm'] as const
export const INTERVIEW_LEVELS = ['junior', 'mid', 'senior'] as const
export const INTERVIEW_TYPES = ['behavioral', 'technical', 'mixed', 'case'] as const
export const INTERVIEW_PERSONAS = ['friendly', 'formal', 'tough', 'curious'] as const
export const INTERVIEW_LANGUAGES = ['tr', 'en', 'de'] as const

export type InterviewerId = typeof INTERVIEWER_KEYS[number]
export type InterviewLevel = typeof INTERVIEW_LEVELS[number]
export type InterviewType = typeof INTERVIEW_TYPES[number]
export type InterviewPersona = typeof INTERVIEW_PERSONAS[number]
export type InterviewLanguage = typeof INTERVIEW_LANGUAGES[number]
export type InterviewSetupInput = Readonly<{
  interviewerKey: InterviewerId
  role: string
  company: string
  level: InterviewLevel
  interviewType: InterviewType
  persona: InterviewPersona
  language: InterviewLanguage
}>
export type InterviewSearchParams = Record<string, string | string[] | undefined>

export const SETUP_TEXT_MAX_CODE_POINTS = 200
const CONTROLS = /[\u0000-\u001f\u007f-\u009f]/
const CONSUMED_KEYS = ['iv', 'role', 'company', 'level', 'itype', 'persona', 'language'] as const

function isMember<T extends string>(values: readonly T[], value: unknown): value is T {
  return typeof value === 'string' && values.some(member => member === value)
}
export const isInterviewerId = (value: unknown): value is InterviewerId => isMember(INTERVIEWER_KEYS, value)
export const isInterviewLevel = (value: unknown): value is InterviewLevel => isMember(INTERVIEW_LEVELS, value)
export const isInterviewType = (value: unknown): value is InterviewType => isMember(INTERVIEW_TYPES, value)
export const isInterviewPersona = (value: unknown): value is InterviewPersona => isMember(INTERVIEW_PERSONAS, value)
export const isInterviewLanguage = (value: unknown): value is InterviewLanguage => isMember(INTERVIEW_LANGUAGES, value)

function isBoundedText(value: unknown): value is string {
  return typeof value === 'string' && !CONTROLS.test(value) &&
    Array.from(value).length <= SETUP_TEXT_MAX_CODE_POINTS
}

/** Validate decoded text before trimming; optional blanks retain the general interview. */
export function normalizeSetupText(value: string | undefined): string | null {
  if (value === undefined) return 'Genel'
  return isBoundedText(value) ? value.trim() || 'Genel' : null
}

/** POST never rewrites content: replay equality uses the caller's canonical payload. */
export function isCanonicalSetupText(value: unknown): value is string {
  return isBoundedText(value) && value !== '' && value === value.trim()
}

export function parseInterviewSetupInput(params: InterviewSearchParams): InterviewSetupInput | null {
  if (CONSUMED_KEYS.some(key => Array.isArray(params[key]))) return null
  const { iv, level, itype, persona, language } = params
  if (!isInterviewerId(iv) || !isInterviewLevel(level) || !isInterviewType(itype) ||
      !isInterviewPersona(persona) || !isInterviewLanguage(language)) return null
  const role = normalizeSetupText(params.role as string | undefined)
  const company = normalizeSetupText(params.company as string | undefined)
  if (role === null || company === null) return null
  return { interviewerKey: iv, role, company, level, interviewType: itype, persona, language }
}

/** Fixed field order makes the lifecycle key independent of query ordering and ignored extras. */
export function interviewSetupKey(config: InterviewSetupInput): string {
  return JSON.stringify([config.interviewerKey, config.role, config.company, config.level,
    config.interviewType, config.persona, config.language])
}
