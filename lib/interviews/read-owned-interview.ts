import 'server-only'

import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
import { createAdminClient } from '@/lib/supabase/admin'

export type InterviewAnswer = {
    q: string
    a: string
}

export type InterviewDetail = {
    id: string
    interviewerKey: string
    role: string
    company: string
    level: string
    interviewType: string
    persona: string
    language: string
    answers: InterviewAnswer[]
    score: number
    summary: string
    durationSeconds: number
    createdAt: string
}

type InterviewDetailRow = {
    id: string
    interviewer_key: string
    role: string
    company: string
    level: string
    interview_type: string
    persona: string
    language: string
    answers: unknown
    score: number
    summary: string
    duration_seconds: number
    created_at: string
}

export type OwnedInterviewReadResult =
    | { status: 'ready'; interview: InterviewDetail }
    | { status: 'unauthorized' | 'invalidId' | 'notFound' | 'readError' }

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function isInterviewAnswer(value: unknown): value is InterviewAnswer {
    return (
        typeof value === 'object' &&
        value !== null &&
        'q' in value &&
        typeof value.q === 'string' &&
        'a' in value &&
        typeof value.a === 'string'
    )
}

function isInterviewAnswers(value: unknown): value is InterviewAnswer[] {
    return Array.isArray(value) && value.every(isInterviewAnswer)
}

export async function readOwnedInterview(id: string): Promise<OwnedInterviewReadResult> {
    const auth = await getAuthenticatedUser()

    if (auth.status === 'unauthorized') {
        return { status: 'unauthorized' }
    }

    if (!UUID_PATTERN.test(id)) {
        return { status: 'invalidId' }
    }

    const admin = createAdminClient()
    const { data, error } = await admin
        .from('interviews')
        .select(
            'id, interviewer_key, role, company, level, interview_type, persona, language, answers, score, summary, duration_seconds, created_at',
        )
        .eq('id', id)
        .eq('owner_id', auth.user.id)
        .maybeSingle()

    if (error) {
        console.error('Interview detail read error:', error)

        return { status: 'readError' }
    }

    const row: InterviewDetailRow | null = data

    if (!row) {
        return { status: 'notFound' }
    }

    if (!isInterviewAnswers(row.answers)) {
        console.error('Interview detail answers validation failed')

        return { status: 'readError' }
    }

    const interview: InterviewDetail = {
        id: row.id,
        interviewerKey: row.interviewer_key,
        role: row.role,
        company: row.company,
        level: row.level,
        interviewType: row.interview_type,
        persona: row.persona,
        language: row.language,
        answers: row.answers,
        score: row.score,
        summary: row.summary,
        durationSeconds: row.duration_seconds,
        createdAt: row.created_at,
    }

    return { status: 'ready', interview }
}
