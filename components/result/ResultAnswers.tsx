import { EmptyState, SectionHeader, TalentryCard } from '@/components/ui'
import type { InterviewAnswer } from '@/app/result/[id]/page'
import type { ResultCopy } from './result-copy'
import styles from '@/app/result/result.module.css'

interface ResultAnswersProps {
  answers: InterviewAnswer[]
  copy: ResultCopy
}

export default function ResultAnswers({ answers, copy }: ResultAnswersProps) {
  return (
    <section className={styles.transcript} aria-labelledby="result-transcript">
      <SectionHeader title={<span id="result-transcript">{copy.transcript}</span>} />
      {answers.length === 0 ? (
        <EmptyState headingAs="h3" title={copy.emptyAnswers} />
      ) : (
        <ol className={styles.answers}>
          {answers.map((answer, index) => (
            <li key={index}>
              <TalentryCard as="article" aria-labelledby={`result-question-${index}`}>
                <h3 className={styles.questionLabel} id={`result-question-${index}`}>
                  {copy.question} {index + 1}
                </h3>
                <p className={styles.text} dir="auto">{answer.q}</p>
                <div className={styles.answer}>
                  <h4 className={styles.answerLabel}>{copy.answer}</h4>
                  <p className={styles.text} dir="auto">{answer.a}</p>
                </div>
              </TalentryCard>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
