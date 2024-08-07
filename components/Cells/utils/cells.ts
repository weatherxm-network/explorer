import _ from 'lodash'
import api from '~/api/wxmApi'
import type { Device } from '~/components/common/types/common'

const { getAddress } = useAddress()

const getCellData = (cellIndex: string) => {
  return api.getCellsData(cellIndex)
}

const orderDevices = (devices: Device[]) => {
  const groupedDevices = _.groupBy(devices, 'isActive')
  return _.concat(
    _.sortBy(groupedDevices.true, 'name'),
    _.sortBy(groupedDevices.false, 'name'),
  )
}

export function resolveAddress(cellIndex: string) {
  return getAddress(cellIndex)
}

export async function getCellDevices(cellIndex: string) {
  return await getCellData(cellIndex).then((devices) => {
    return orderDevices(devices)
  })
}
