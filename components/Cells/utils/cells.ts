import api from '~/api/wxmApi'

const { getAddress } = useAddress()

export const resolveAddress = async (cellIndex: string) => {
  return getAddress(cellIndex)
}

export const getCellDevices = async (cellIndex: string) => {
  return await api.getCellsData(cellIndex)
}
