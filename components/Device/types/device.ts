interface Annotation {
  annotation: string
}

interface TokenAnnotations {
  pol: Annotation[]
  qod: Annotation[]
  rm: Annotation[]
}

interface Timeline {
  reference_date?: string
  reward_scores: number[]
}

export interface LatestTokens {
  actual_reward: number
  annotations: TokenAnnotations
  lost_reward: number
  period_max_reward: number
  reward_score: number
  timeline: Timeline
  timestamp: string
}

export interface WeeklyMonthlyTokens {
  actual_reward: number
  from_date: string
  lost_rewards: number
  period_max_reward: number
  reward_score: number
  timeline: Timeline
  to_date: string
}
