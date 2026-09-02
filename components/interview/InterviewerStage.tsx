import type { RefObject } from 'react'

import styles from '@/app/interview/interview.module.css'

export type SpeechStatus = 'preparing' | 'speaking' | 'ready' | 'unavailable'

interface InterviewerStageProps {
  cameraOffLabel: string
  cameraOn: boolean
  cameraRef: RefObject<HTMLVideoElement>
  interviewerName: string
  interviewerPhoto: string
  interviewerRole: string
  speechLabel: string
  speechStatus: SpeechStatus
  youLabel: string
}

export default function InterviewerStage({
  cameraOffLabel,
  cameraOn,
  cameraRef,
  interviewerName,
  interviewerPhoto,
  interviewerRole,
  speechLabel,
  speechStatus,
  youLabel,
}: InterviewerStageProps) {
  return (
    <section className={styles.stage} aria-label={`${interviewerName}, ${interviewerRole}`}>
      <div className={styles.stageAtmosphere} aria-hidden="true" />
      <img className={styles.interviewerPhoto} src={interviewerPhoto} alt={interviewerName} />
      <div className={styles.interviewerIdentity}>
        <strong>{interviewerName}</strong>
        <span>{interviewerRole}</span>
      </div>
      <div className={styles.speechStatus} data-status={speechStatus} role="status">
        <span className={styles.speechWave} aria-hidden="true">
          <span /><span /><span />
        </span>
        <span>{speechLabel}</span>
      </div>
      <div className={styles.selfView}>
        <video
          aria-label={youLabel}
          autoPlay
          className={styles.selfViewVideo}
          muted
          playsInline
          ref={cameraRef}
          style={{ display: 'none' }}
        />
        {!cameraOn && (
          <div className={styles.cameraPlaceholder}>
            <span aria-hidden="true">◉</span>
            <span>{cameraOffLabel}</span>
          </div>
        )}
        <span className={styles.selfViewLabel}>{youLabel}</span>
      </div>
    </section>
  )
}
