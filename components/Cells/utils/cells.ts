import api from '~/api/wxmApi'

export const getCellDevices = async (cellIndex: string) => {
  return await api.getCellsData(cellIndex)
}
