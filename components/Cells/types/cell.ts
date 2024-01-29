interface CurrentWeather {
  dew_point: number
  feels_like: number
  humidity: number
  icon: string
  precipitation: number
  precipitation_accumulated: number
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

export interface Measurements {
  dewPoint: string
  feels_like: string
  humidity: string
  lottie: string
  precip: string
  precipAccum: string
  press: string
  solarIrradiance: string
  temp: string
  time: string
  timestamp: string
  uv: string
  windDir: string
  windGust: string
  windSpeed: string
}
