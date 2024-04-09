import _ from 'lodash'
import api from '~/api/wxmApi'

const { getAddress } = useAddress()

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

interface Device {
  cellIndex: string
  current_weather: CurrentWeather
  id: string
  isActive: boolean
  lastWeatherStationActivity: string
  name: string
  profile: string
  timezone: string
}

const getCellData = (cellIndex: string) => {
  return api.getCellsData(cellIndex)
}

const orderDevices = (devices: Device[]) => {
  const groupedDevices = _.groupBy(devices, 'isActive')
  return _.concat(_.sortBy(groupedDevices.true, 'name'), _.sortBy(groupedDevices.false, 'name'))
}

export function resolveAddress(cellIndex: string) {
  return getAddress(cellIndex)
}

export async function getCellDevices(cellIndex: string) {
  return await getCellData(cellIndex).then((devices) => {
    return orderDevices(devices)
  })
}
