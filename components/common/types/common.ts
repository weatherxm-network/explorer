import type { Value } from 'firebase/remote-config'

export interface Units {
  humidity: string
  precip: string
  press: string
  solarIrradiance: string
  temp: string
  uv: string
  windDir: string
  windSpeed: string
}

export interface CurrentWeather {
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

export interface Bundle {
  name: string
  title: string
  connectivity: 'cellular' | 'wifi' | 'helium'
  ws_model: string
  gw_model: string
}

export interface Device {
  address: string
  bundle: Bundle
  cellCenter: {
    lat: number
    lon: number
  }
  cellIndex: string
  current_weather: CurrentWeather
  id: string
  isActive: boolean
  lastWeatherStationActivity: string
  metrics: {
    qod_score: number
    pol_reason: 'LOCATION_NOT_VERIFIED' | 'NO_LOCATION_DATA' | null
    ts: string
  }
  name: string
  profile: string
  timezone: string
  cellActiveDeviceCount?: number
  cellAvgDataQuality?: number
}

export interface InfoBannerConfig {
  web_info_banner_action_label: Value
  web_info_banner_background_url: Value
  web_info_banner_dismissable: Value
  web_info_banner_id: Value
  web_info_banner_message: Value
  web_info_banner_show: Value
  web_info_banner_title: Value
  web_info_banner_url: Value
  web_info_button_show: Value
}
