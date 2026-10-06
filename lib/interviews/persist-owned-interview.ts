import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'
import type { CompletionPayload } from './interview-completion-state'

export type PersistenceResult =
  | { status: 'saved'; id: string; replayed: boolean }
  | { status: 'conflict' }
  | { status: 'error' }

export function isPrimaryKeyConflict(error: { code: string; message: string }) {
  return error.code === '23505' &&
    /unique constraint "interviews_pkey"/.test(error.message)
}

export async function persistOwnedInterview(
  ownerId: string, completionId: string, payload: CompletionPayload,
): Promise<PersistenceResult> {
  const row = {
    interviewer_key: payload.interviewerKey, role: payload.role, company: payload.company,
    level: payload.level, interview_type: payload.interviewType, persona: payload.persona,
    language: payload.language, answers: payload.answers.map(({ q, a }) => ({ q, a })),
    score: payload.score, summary: payload.summary, duration_seconds: payload.durationSeconds,
  }
  try {
    const admin = createAdminClient()
    const inserted = await admin.from('interviews')
      .insert({ ...row, id: completionId, owner_id: ownerId }).select('id').single()
    if (!inserted.error) {
      return inserted.data?.id === completionId
        ? { status: 'saved', id: completionId, replayed: false } : { status: 'error' }
    }
    if (!isPrimaryKeyConflict(inserted.error)) return { status: 'error' }
    const existing = await admin.from('interviews')
      .select('id, interviewer_key, role, company, level, interview_type, persona, language, answers, score, summary, duration_seconds')
      .eq('id', completionId).eq('owner_id', ownerId).maybeSingle()
    if (existing.error) return { status: 'error' }
    if (!existing.data || existing.data.id !== completionId) return { status: 'conflict' }
    const fields = ['interviewer_key', 'role', 'company', 'level', 'interview_type',
      'persona', 'language', 'score', 'summary', 'duration_seconds'] as const
    const answers: unknown = existing.data.answers
    const sameAnswers = Array.isArray(answers) && answers.length === row.answers.length &&
      answers.every((value: unknown, index: number) => {
        if (!value || typeof value !== 'object') return false
        const answer = value as Record<string, unknown>
        return answer.q === row.answers[index].q && answer.a === row.answers[index].a
      })
    if (!sameAnswers || !fields.every(field => existing.data[field] === row[field])) {
      return { status: 'conflict' }
    }
    return { status: 'saved', id: completionId, replayed: true }
  } catch {
    return { status: 'error' }
  }
}
