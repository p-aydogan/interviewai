import { TalentryButton } from '@/components/ui'
import styles from '@/app/interview/interview.module.css'

interface LiveInterviewControlsProps {
  cameraLabel: string
  cameraOn: boolean
  completionError: string
  endLabel: string
  isCompleting: boolean
  leaveWithoutSavingLabel: string
  microphoneLabel: string
  microphoneOn: boolean
  onDismissCompletionError: () => void
  onEnd: () => void
  onLeaveWithoutSaving: () => void
  onToggleCamera: () => void
  onToggleMicrophone: () => void
  returnToInterviewLabel: string
}

function MicrophoneIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z" /><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3M9 21h6" /></svg>
}

function CameraIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 7.5h10a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2Z" /><path d="m16 10 5-2v8l-5-2Z" /></svg>
}

export default function LiveInterviewControls({
  cameraLabel, cameraOn, completionError, endLabel, isCompleting, microphoneLabel,
  leaveWithoutSavingLabel, microphoneOn, onDismissCompletionError, onEnd,
  onLeaveWithoutSaving, onToggleCamera, onToggleMicrophone, returnToInterviewLabel,
}: LiveInterviewControlsProps) {
  return (
    <footer className={styles.controlsArea}>
      {completionError && (
        <div className={styles.completionError} role="alert">
          <div>{completionError}</div>
          <div className={styles.workspaceActions}>
            <TalentryButton onClick={onDismissCompletionError} size="small" type="button" variant="ghost">
              {returnToInterviewLabel}
            </TalentryButton>
            <TalentryButton onClick={onLeaveWithoutSaving} size="small" type="button" variant="danger">
              {leaveWithoutSavingLabel}
            </TalentryButton>
          </div>
        </div>
      )}
      <div className={styles.controls}>
        <TalentryButton aria-label={microphoneLabel} aria-pressed={microphoneOn} className={`${styles.mediaControl} ${!microphoneOn ? styles.mediaControlOff : ''}`} onClick={onToggleMicrophone} variant="icon">
          <MicrophoneIcon />
        </TalentryButton>
        <TalentryButton aria-label={cameraLabel} aria-pressed={cameraOn} className={`${styles.mediaControl} ${!cameraOn ? styles.mediaControlOff : ''}`} onClick={onToggleCamera} variant="icon">
          <CameraIcon />
        </TalentryButton>
        <TalentryButton aria-label={endLabel} className={styles.endInterview} disabled={isCompleting} onClick={onEnd} type="button" variant="danger">
          <span>{endLabel}</span>
        </TalentryButton>
      </div>
    </footer>
  )
}
