import { NextResponse } from 'next/server'

import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
import { createAdminClient } from '@/lib/supabase/admin'

type InterviewAnswer = {
    q: string
    a: string
}

type InterviewDetail = {
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

type InterviewDetailRouteContext = {
    params: {
        id: string
    }
}

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

export async function GET(_request: Request, { params }: InterviewDetailRouteContext) {
    const auth = await getAuthenticatedUser()

    if (auth.status === 'unauthorized') {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 },
        )
    }

    const { id } = params

    if (!UUID_PATTERN.test(id)) {
        return NextResponse.json(
            { error: 'Invalid interview id' },
            { status: 400 },
        )
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

        return NextResponse.json(
            { error: 'Failed to load interview' },
            { status: 500 },
        )
    }

    const row: InterviewDetailRow | null = data

    if (!row) {
        return NextResponse.json(
            { error: 'Interview not found' },
            { status: 404 },
        )
    }

    if (!isInterviewAnswers(row.answers)) {
        console.error('Interview detail answers validation failed')

        return NextResponse.json(
            { error: 'Failed to load interview' },
            { status: 500 },
        )
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

    return NextResponse.json(
        { interview },
        { status: 200 },
    )
}
