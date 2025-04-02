import type { CurrentWeather } from '~/components/common/types/common'

export const hasPartialObservationData = (obs: CurrentWeather) => {
  return !!(
    obs &&
    Object.keys(obs).some((key) =>
      [
        'dew_point',
        'feels_like',
        'humidity',
        'precipitation',
        'precipitation_accumulated',
        'pressure',
        'solar_irradiance',
        'temperature',
        'uv_index',
        'wind_direction',
        'wind_gust',
        'wind_speed',
      ].includes(key),
    )
  )
}
