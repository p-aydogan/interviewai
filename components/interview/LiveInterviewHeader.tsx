import styles from '@/app/interview/interview.module.css'

interface LiveInterviewHeaderProps {
  elapsedTime: string
  maxQuestions: number
  questionLabel: string
  questionNumber: number
  sessionLabel: string
  timerLabel: string
}

export default function LiveInterviewHeader({
  elapsedTime,
  maxQuestions,
  questionLabel,
  questionNumber,
  sessionLabel,
  timerLabel,
}: LiveInterviewHeaderProps) {
  return (
    <header className={styles.topbar}>
      <div className={styles.brand} aria-label="Talentry">
        <span className={styles.brandMark} aria-hidden="true">T</span>
        <span>Talentry</span>
      </div>
      <div className={styles.sessionStatus}>
        <span className={styles.liveDot} aria-hidden="true" />
        <span>{sessionLabel}</span>
      </div>
      <div className={styles.headerMeta}>
        <time aria-label={timerLabel} className={styles.timer}>{elapsedTime}</time>
        <span className={styles.questionPill}>
          {questionLabel} {questionNumber}/{maxQuestions}
        </span>
      </div>
    </header>
  )
}
