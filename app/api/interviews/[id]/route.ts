import { NextResponse } from 'next/server'
import { readOwnedInterview } from '@/lib/interviews/read-owned-interview'
import { deleteOwnedInterview } from '@/lib/interviews/delete-owned-interview'

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const result = await readOwnedInterview(params.id)
  switch (result.status) {
    case 'ready': return NextResponse.json({ interview: result.interview }, { status: 200 })
    case 'unauthorized': return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    case 'invalidId': return NextResponse.json({ error: 'Invalid interview id' }, { status: 400 })
    case 'notFound': return NextResponse.json({ error: 'Interview not found' }, { status: 404 })
    case 'readError': return NextResponse.json({ error: 'Failed to load interview' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const headers = { 'Cache-Control': 'private, no-store' }
  try {
    const result = await deleteOwnedInterview(params.id)
    switch (result.status) {
      case 'deleted': return NextResponse.json({ deleted: true }, { status: 200, headers })
      case 'unauthorized': return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers })
      case 'invalidId': return NextResponse.json({ error: 'Invalid interview id' }, { status: 400, headers })
      case 'notFound': return NextResponse.json({ error: 'Interview not found' }, { status: 404, headers })
      case 'deleteError': return NextResponse.json({ error: 'Failed to delete interview' }, { status: 500, headers })
    }
  } catch {
    return NextResponse.json({ error: 'Failed to delete interview' }, { status: 500, headers })
  }
}
