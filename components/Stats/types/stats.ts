interface GraphDataPoint {
  ts: string
  value: number
}

interface NetHealth {
  network_avg_qod: number
  network_uptime: number
  health_30days_graph: GraphDataPoint[]
  active_stations: number
}

interface NetGrowth {
  network_size: number
  network_scale_up: number
  last_30days: number
  last_30days_graph: GraphDataPoint[]
}

interface DuneMetrics {
  total: number
  claimed: number
  unclaimed: number
  dune_public_url: string
}

export interface TokenMetrics {
  total_allocated: {
    dune: DuneMetrics
    base_rewards: number
    boost_rewards: number
  }
  token: {
    total_supply: number
    circulating_supply: number
  }
}

interface Rewards {
  total: number
  last_run: number
  last_30days: number
  last_30days_graph: GraphDataPoint[]
  last_tx_hash_url: string
  token_metrics: TokenMetrics
}

interface WeatherStationDetail {
  model: string
  connectivity: string
  url: string
  amount: number
  percentage: number
}

interface WeatherStationStats {
  total: number
  details: WeatherStationDetail[]
}

interface WeatherStations {
  onboarded: WeatherStationStats
  claimed: WeatherStationStats
  active: WeatherStationStats
}

interface Contracts {
  token_url: string
  rewards_url: string
}

interface Customers {
  total: number
  with_wallet: number
}

export interface NetworkStatsResponse {
  net_health: NetHealth
  net_growth: NetGrowth
  rewards: Rewards
  weather_stations: WeatherStations
  contracts: Contracts
  customers: Customers
  last_updated: string
}
