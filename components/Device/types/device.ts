interface CurrentWeather {
  dew_point: number
  feels_like: number
  humidity: number
  icon: string
  precipitation: number
  precipitation_accumulated: number
  solar_irradiance: number
  pressure: number
  temperature: number
  timestamp: string
  uv_index: number
  wind_direction: number
  wind_gust: number
  wind_speed: number
}

export interface Device {
  cellIndex: string
  current_weather: CurrentWeather
  id: string
  isActive: boolean
  lastWeatherStationActivity: string
  name: string
  profile: string
  timezone: string
}

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
