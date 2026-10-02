'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { validateDisplayName } from '@/lib/account/profile-display-name'
import type { DisplayNameError } from '@/lib/account/profile-display-name'

type ProfileAuth = Pick<ReturnType<typeof createClient>['auth'], 'updateUser'>
interface EditorState {
  confirmed: string; draft: string; editing: boolean; saving: boolean
  version?: string; draftVersion?: string
  conflict: boolean; error: DisplayNameError | 'saveFailed' | null; saved: boolean
}

// Small external store keeps async transitions testable without a browser/test framework.
export function createProfileEditor(initial: string, auth: ProfileAuth, refresh: () => void, version?: string) {
  let state: EditorState = { confirmed: initial, draft: initial, editing: false,
    version, draftVersion: version, saving: false, conflict: false, error: null, saved: false }
  const listeners = new Set<() => void>()
  let active = true
  let request = 0
  let inFlight = false
  function update(patch: Partial<EditorState>) {
    state = { ...state, ...patch }
    listeners.forEach(listener => listener())
  }
  function dirty() {
    const result = validateDisplayName(state.draft)
    return result.valid ? result.value !== state.confirmed : state.draft !== state.confirmed
  }
  function reset(editing: boolean) {
    if (inFlight) return
    update({ draft: state.confirmed, draftVersion: state.version, editing, conflict: false, error: null, saved: false })
  }
  return {
    getSnapshot: () => state,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener) } },
    activate() { active = true },
    dispose() { active = false; request++; inFlight = false },
    edit() { reset(true) },
    cancel() { reset(false) },
    useLatest() { reset(true) },
    change(draft: string) {
      if (!state.editing || inFlight) return
      update({ draft, error: null, saved: false })
    },
    reconcile(confirmed: string, version?: string) {
      if (confirmed === state.confirmed && version === state.version) return
      const preserve = state.editing && (dirty() || state.conflict)
      const draft = validateDisplayName(state.draft)
      // Our own save may reach the server-projected props before updateUser resolves.
      const matchesDraft = draft.valid && draft.value === confirmed
      update({ confirmed, version, ...(preserve ? {} : { draft: confirmed, draftVersion: version, error: null }),
        conflict: preserve && !(inFlight && matchesDraft), saved: false })
    },
    async save() {
      if (!active || inFlight || !state.editing || state.conflict) return
      const result = validateDisplayName(state.draft)
      if (result.valid === false) { update({ error: result.error }); return }
      if (result.value === state.confirmed) { reset(false); return }
      // Never invent a replacement version when Auth omits its optional response field.
      if (!state.version) { update({ error: 'saveFailed' }); return }
      const startVersion = state.version
      inFlight = true
      const currentRequest = ++request
      update({ saving: true, error: null, saved: false })
      try {
        const { data, error } = await auth.updateUser({ data: { display_name: result.value } })
        if (!active || currentRequest !== request) return
        const returned = validateDisplayName(data.user?.user_metadata?.display_name)
        const returnedVersion = data.user?.updated_at
        if (error || returned.valid === false || returned.value !== result.value ||
          typeof returnedVersion !== 'string' || !returnedVersion) {
          update({ error: 'saveFailed' })
          return
        }
        if ((state.version !== startVersion && state.version !== returnedVersion) ||
          (state.conflict && state.confirmed !== returned.value)) {
          update({ conflict: true })
          refresh()
          return
        }
        update({ confirmed: returned.value, draft: returned.value, version: returnedVersion,
          draftVersion: returnedVersion, editing: false,
          conflict: false, saved: true })
        refresh()
      } catch {
        if (active && currentRequest === request) update({ error: 'saveFailed' })
      } finally {
        if (active && currentRequest === request) { inFlight = false; update({ saving: false }) }
      }
    },
  }
}

export function useProfileEditor(displayName?: string, identityVersion?: string) {
  const router = useRouter()
  const [editor] = useState(() => createProfileEditor(displayName ?? '', createClient().auth, () => router.refresh(), identityVersion))
  const state = useSyncExternalStore(editor.subscribe, editor.getSnapshot, editor.getSnapshot)
  useEffect(() => { editor.activate(); return () => editor.dispose() }, [editor])
  useEffect(() => { editor.reconcile(displayName ?? '', identityVersion) }, [editor, displayName, identityVersion])
  const normalized = validateDisplayName(state.draft)
  const dirty = normalized.valid ? normalized.value !== state.confirmed : state.draft !== state.confirmed
  return { ...state, dirty, editor }
}
