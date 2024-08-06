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
  cellIndex: string
  current_weather: CurrentWeather
  id: string
  isActive: boolean
  lastWeatherStationActivity: string
  name: string
  profile: string
  timezone: string
  bundle: Bundle
}
