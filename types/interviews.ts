export type InterviewListItem = {
  id: string
  role: string
  company: string
  level: string
  interviewType: string
  language: string
  score: number
  durationSeconds: number
  createdAt: string
}

export type InterviewHistoryPage = {
  interviews: InterviewListItem[]
  nextCursor: string | null
}
