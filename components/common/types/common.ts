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
