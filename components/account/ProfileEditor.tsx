'use client'

import { useEffect, useId, useRef } from 'react'
import type { UserIdentity } from '@/lib/auth/user-identity'
import type { AppLanguage } from '@/types/auth'
import TalentryButton from '@/components/ui/TalentryButton'
import { ACCOUNT_COPY } from './account-copy'
import { useProfileEditor } from './useProfileEditor'

export default function ProfileEditor({ identity, identityVersion, language }: {
  identity: UserIdentity; identityVersion?: string; language: AppLanguage
}) {
  const copy = ACCOUNT_COPY[language]
  const profile = useProfileEditor(identity.displayName, identityVersion)
  const { editor } = profile
  const input = useRef<HTMLInputElement>(null)
  const editButton = useRef<HTMLButtonElement>(null)
  const wasEditing = useRef(false)
  const id = useId()
  useEffect(() => {
    if (profile.editing) input.current?.focus()
    else if (wasEditing.current) editButton.current?.focus()
    wasEditing.current = profile.editing
  }, [profile.editing])

  return <section className="talentry-account-card talentry-profile-editor" aria-label={copy.profile}>
    <dl>
      {!profile.editing && <><dt>{copy.displayName}</dt><dd>{profile.confirmed || copy.missing}</dd></>}
      <dt>{copy.email}</dt><dd>{identity.email ?? copy.missing}</dd>
    </dl>
    {profile.editing ? <form noValidate onSubmit={event => { event.preventDefault(); void editor.save() }}>
      <label htmlFor={id}>{copy.displayName}</label>
      <input id={id} ref={input} type="text" autoComplete="nickname" required
        value={profile.draft} disabled={profile.saving} aria-invalid={Boolean(profile.error && profile.error !== 'saveFailed')}
        aria-describedby={`${id}-hint${profile.error ? ` ${id}-error` : ''}${profile.conflict ? ` ${id}-conflict` : ''}`}
        onChange={event => editor.change(event.target.value)} />
      <p id={`${id}-hint`}>{copy.profileEditHint}</p>
      {profile.conflict && <div id={`${id}-conflict`}>
        <p role="status">{copy.profileChanged}</p>
        <TalentryButton variant="secondary" disabled={profile.saving} onClick={() => {
          editor.useLatest(); input.current?.focus()
        }}>{copy.useLatest}</TalentryButton>
      </div>}
      <div className="talentry-profile-actions">
        <TalentryButton type="submit" loading={profile.saving} loadingText={copy.saving}
          disabled={profile.conflict}>{copy.save}</TalentryButton>
        <TalentryButton variant="secondary" disabled={profile.saving} onClick={editor.cancel}>{copy.cancel}</TalentryButton>
      </div>
    </form> : <TalentryButton ref={editButton} variant="secondary" onClick={editor.edit}>{copy.editProfile}</TalentryButton>}
    {profile.error && <p id={`${id}-error`} className="talentry-profile-error" role="alert">{copy.profileErrors[profile.error]}</p>}
    <p role="status" aria-live="polite">{profile.saving ? copy.saving : profile.saved ? copy.saved : ''}</p>
  </section>
}
