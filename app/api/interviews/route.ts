import { NextRequest, NextResponse } from 'next/server'

import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
import { createAdminClient } from '@/lib/supabase/admin'
import { decodeHistoryCursor, encodeHistoryCursor } from '@/lib/interviews/history-cursor'
import type { InterviewListItem } from '@/types/interviews'

type InterviewPayload = {
    interviewerKey: string
    role: string
    company: string
    level: string
    interviewType: string
    persona: string
    language: string
    answers: { q: string; a: string }[]
    score: number
    summary: string
    durationSeconds: number
}

type InterviewListRow = {
    id: string
    role: string
    company: string
    level: string
    interview_type: string
    language: string
    score: number
    duration_seconds: number
    created_at: string
}

function isInterviewPayload(value: unknown): value is InterviewPayload {
    if (!value || typeof value !== 'object') return false

    const payload = value as Record<string, unknown>

    if (!Array.isArray(payload.answers)) return false

    const answersAreValid = payload.answers.every((answer) => {
        if (!answer || typeof answer !== 'object') return false

        const item = answer as Record<string, unknown>

        return typeof item.q === 'string' && typeof item.a === 'string'
    })

    return (
        typeof payload.interviewerKey === 'string' &&
        typeof payload.role === 'string' &&
        typeof payload.company === 'string' &&
        typeof payload.level === 'string' &&
        typeof payload.interviewType === 'string' &&
        typeof payload.persona === 'string' &&
        typeof payload.language === 'string' &&
        answersAreValid &&
        typeof payload.score === 'number' &&
        Number.isInteger(payload.score) &&
        payload.score >= 0 &&
        payload.score <= 100 &&
        typeof payload.summary === 'string' &&
        typeof payload.durationSeconds === 'number' &&
        Number.isInteger(payload.durationSeconds) &&
        payload.durationSeconds >= 0
    )
}

export async function GET(request: NextRequest) {
    const headers = { 'Cache-Control': 'private, no-store' }
    const auth = await getAuthenticatedUser()

    if (auth.status === 'unauthorized') {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401, headers },
        )
    }

    const limits = request.nextUrl.searchParams.getAll('limit')
    const rawLimit = limits[0]
    if (limits.length > 1 || (rawLimit !== undefined &&
        (!/^[1-9]\d*$/.test(rawLimit) || Number(rawLimit) > 100))) {
        return NextResponse.json({ error: 'Invalid limit' }, { status: 400, headers })
    }

    const cursors = request.nextUrl.searchParams.getAll('cursor')
    const cursor = cursors.length === 1 ? decodeHistoryCursor(cursors[0]) : null
    if (cursors.length > 1 || (cursors.length === 1 && !cursor)) {
        return NextResponse.json({ error: 'Invalid cursor' }, { status: 400, headers })
    }

    const admin = createAdminClient()
    let query = admin
        .from('interviews')
        .select(
            'id, role, company, level, interview_type, language, score, duration_seconds, created_at',
        )
        .eq('owner_id', auth.user.id)
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })

    if (cursor) {
        query = query.or(
            `created_at.lt.${cursor.createdAt},and(created_at.eq.${cursor.createdAt},id.lt.${cursor.id})`,
        )
    }
    const limit = rawLimit === undefined ? undefined : Number(rawLimit)
    if (limit !== undefined) query = query.limit(limit + 1)
    const { data, error } = await query

    if (error) {
        console.error('Interview read error:', error)

        return NextResponse.json(
            { error: 'Failed to load interviews' },
            { status: 500, headers },
        )
    }

    const rows: InterviewListRow[] = data ?? []
    const hasMore = limit !== undefined && rows.length > limit
    const page = limit === undefined ? rows : rows.slice(0, limit)
    const last = page[page.length - 1]
    const nextCursor = hasMore ? encodeHistoryCursor(last.created_at, last.id) : null
    const interviews: InterviewListItem[] = page.map((row: InterviewListRow) => ({
        id: row.id,
        role: row.role,
        company: row.company,
        level: row.level,
        interviewType: row.interview_type,
        language: row.language,
        score: row.score,
        durationSeconds: row.duration_seconds,
        createdAt: row.created_at,
    }))

    return NextResponse.json(
        { interviews, nextCursor },
        { status: 200, headers },
    )
}

export async function POST(req: NextRequest) {
    const auth = await getAuthenticatedUser()

    if (auth.status !== 'authenticated') {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 },
        )
    }
    let body: unknown

    try {
        body = await req.json()
    } catch {
        return NextResponse.json(
            { error: 'Invalid JSON body' },
            { status: 400 },
        )
    }
    if (!isInterviewPayload(body)) {
        return NextResponse.json(
            { error: 'Invalid interview payload' },
            { status: 400 },
        )
    }
    const admin = createAdminClient()
    const { data, error } = await admin
        .from('interviews')
        .insert({
            owner_id: auth.user.id,
            interviewer_key: body.interviewerKey,
            role: body.role,
            company: body.company,
            level: body.level,
            interview_type: body.interviewType,
            persona: body.persona,
            language: body.language,
            answers: body.answers,
            score: body.score,
            summary: body.summary,
            duration_seconds: body.durationSeconds,
        })
        .select('id')
        .single()
    if (error) {
        console.error('Interview persistence error:', error)

        return NextResponse.json(
            { error: 'Failed to save interview' },
            { status: 500 },
        )
    }
    return NextResponse.json(
        { id: data.id },
        { status: 201 },
    )
}
