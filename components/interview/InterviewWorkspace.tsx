import { TalentryButton } from '@/components/ui'
import styles from '@/app/interview/interview.module.css'

export type InterviewTab = 'q' | 'n'

export type InterviewFeedback =
  | { kind: 'structured'; strength: string; improvement: string; suggestion: string }
  | { kind: 'fallback'; text: string }

export interface InterviewWorkspaceLabels {
  answer: string
  answerPlaceholder: string
  currentQuestion: string
  feedback: string
  finish: string
  improvement: string
  loadingQuestion: string
  next: string
  notes: string
  notesLabel: string
  notesPlaceholder: string
  question: string
  skip: string
  strength: string
  submit: string
  suggestion: string
}

interface InterviewWorkspaceProps {
  activeTab: InterviewTab
  answer: string
  awaitingNext: boolean
  feedback: InterviewFeedback | null
  isCompleting: boolean
  labels: InterviewWorkspaceLabels
  maxQuestions: number
  notes: string
  onAnswerChange: (value: string) => void
  onNext: () => void
  onNotesChange: (value: string) => void
  onSubmit: () => void
  onTabChange: (tab: InterviewTab) => void
  qLoading: boolean
  question: string
  questionNumber: number
}

export default function InterviewWorkspace({
  activeTab, answer, awaitingNext, feedback, isCompleting, labels, maxQuestions,
  notes, onAnswerChange, onNext, onNotesChange, onSubmit, onTabChange, qLoading, question, questionNumber,
}: InterviewWorkspaceProps) {
  return (
    <section className={styles.workspace} aria-label={labels.currentQuestion}>
      <div className={styles.tabs} role="tablist">
        <button aria-controls="interview-question-panel" aria-selected={activeTab === 'q'} className={`${styles.tab} ${activeTab === 'q' ? styles.tabActive : ''}`} id="interview-question-tab" onClick={() => onTabChange('q')} role="tab" type="button">
          {labels.question}
        </button>
        <button aria-controls="interview-notes-panel" aria-selected={activeTab === 'n'} className={`${styles.tab} ${activeTab === 'n' ? styles.tabActive : ''}`} id="interview-notes-tab" onClick={() => onTabChange('n')} role="tab" type="button">
          {labels.notes}
        </button>
      </div>

      {activeTab === 'q' && (
        <div aria-labelledby="interview-question-tab" className={styles.workspaceContent} id="interview-question-panel" role="tabpanel">
          <div className={`${styles.questionCard} ${qLoading ? styles.questionCardLoading : ''}`}>
            <span className={styles.questionEyebrow}>{labels.currentQuestion} · {questionNumber}/{maxQuestions}</span>
            {qLoading ? (
              <div className={styles.loadingDots} role="status">
                <span className={styles.srOnly}>{labels.loadingQuestion}</span>
                <span aria-hidden="true" /><span aria-hidden="true" /><span aria-hidden="true" />
              </div>
            ) : <p>{question}</p>}
          </div>

          <label className={styles.answerLabel} htmlFor="interview-answer">{labels.answer}</label>
          <textarea className={styles.answerInput} disabled={qLoading || awaitingNext || isCompleting} id="interview-answer" onChange={(event) => onAnswerChange(event.target.value)} placeholder={labels.answerPlaceholder} value={answer} />

          <div className={styles.workspaceActions}>
            {!awaitingNext ? (
              <TalentryButton className={styles.primaryAction} disabled={qLoading || isCompleting || !answer.trim()} onClick={onSubmit}>
                {labels.submit}
              </TalentryButton>
            ) : (
              <TalentryButton className={styles.primaryAction} disabled={qLoading || isCompleting} onClick={onNext}>
                {questionNumber >= maxQuestions ? labels.finish : labels.next}
              </TalentryButton>
            )}
            <TalentryButton disabled={qLoading || isCompleting} onClick={onNext} variant="secondary">{labels.skip}</TalentryButton>
          </div>

          {feedback && (
            <section aria-labelledby="interview-feedback-title" className={styles.feedbackCard}>
              <h2 id="interview-feedback-title">{labels.feedback}</h2>
              {feedback.kind === 'structured' ? (
                <dl className={styles.feedbackList}>
                  <div><dt>{labels.strength}</dt><dd>{feedback.strength}</dd></div>
                  <div><dt>{labels.improvement}</dt><dd>{feedback.improvement}</dd></div>
                  <div><dt>{labels.suggestion}</dt><dd>{feedback.suggestion}</dd></div>
                </dl>
              ) : <p className={styles.feedbackFallback}>{feedback.text}</p>}
            </section>
          )}
        </div>
      )}

      {activeTab === 'n' && (
        <div aria-labelledby="interview-notes-tab" className={styles.workspaceContent} id="interview-notes-panel" role="tabpanel">
          <label className={styles.answerLabel} htmlFor="interview-notes">{labels.notesLabel}</label>
          <textarea className={styles.notesInput} id="interview-notes" onChange={(event) => onNotesChange(event.target.value)} placeholder={labels.notesPlaceholder} value={notes} />
        </div>
      )}
    </section>
  )
}
