import 'server-only'

import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'
import { createAdminClient } from '@/lib/supabase/admin'

export type OwnedInterviewDeleteResult = {
  status: 'deleted' | 'unauthorized' | 'invalidId' | 'notFound' | 'deleteError'
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function deleteOwnedInterview(id: string): Promise<OwnedInterviewDeleteResult> {
  try {
    const auth = await getAuthenticatedUser()
    if (auth.status === 'unauthorized') return { status: 'unauthorized' }
    if (!UUID_PATTERN.test(id)) return { status: 'invalidId' }

    const admin = createAdminClient()
    const { data, error } = await admin.from('interviews')
      .delete()
      .eq('id', id)
      .eq('owner_id', auth.user.id)
      .select('id')
      .maybeSingle()

    if (error) return { status: 'deleteError' }
    if (!data) return { status: 'notFound' }
    if (typeof data.id !== 'string' || data.id.toLowerCase() !== id.toLowerCase()) {
      return { status: 'deleteError' }
    }
    return { status: 'deleted' }
  } catch {
    return { status: 'deleteError' }
  }
}
