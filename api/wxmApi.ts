import axios from 'axios'

interface CellIndexDeviceIdObj {
  cellIndex: string
  deviceId: string
}

const client = axios.create({
  baseURL: ''
})

const setupAxios = (baseURL: string, userAgent: string, firebaseId: string) => {
  client.defaults.baseURL = baseURL

  client.interceptors.request.use(
    (config) => {
      config.headers.common = { 'X-WXM-CLIENT': `${userAgent};${firebaseId}` }
      return config
    },
    function (error) {
      return Promise.reject(error)
    }
  )
}

const getCells = () => {
  return (
    client
      .get('/api/v1/cells')
      .then((response) => response.data)
      // TODO Log this error before returning an empty array?
      .catch(() => [])
  )
}

const getNetStats = () => {
  return client
    .get('/api/v1/network/stats')
    .then((response) => response.data)
    .catch(() => {})
}

const getSearchResults = (query: string) => {
  return client.get(`/api/v1/network/search?query=${query}`).then((response) => response.data)
}

const resolveDeviceName = (deviceName: string) => {
  return client
    .get(`/api/v1/network/search?exact=true&exclude=places&query=${deviceName}`)
    .then((response) => response.data)
}

const getCellsData = (cellIndex: string) => {
  return client.get(`/api/v1/cells/${cellIndex}/devices`).then((response) => response.data)
}

const getDeviceByID = (cellIndexDeviceIdObj: CellIndexDeviceIdObj) => {
  return client
    .get(`/api/v1/cells/${cellIndexDeviceIdObj.cellIndex}/devices/${cellIndexDeviceIdObj.deviceId}`)
    .then((response) => response.data)
}

const getDeviceTokens = (deviceId: string) => {
  return client.get(`/api/v1/devices/${deviceId}/tokens`).then((response) => response.data)
}

export default {
  setupAxios,
  getCells,
  getCellsData,
  getDeviceByID,
  getNetStats,
  getSearchResults,
  resolveDeviceName,
  getDeviceTokens
}
