import axios from 'axios'

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
  return client
    .get('/api/v1/cells')
    .then((response) => response.data)
    .catch(() => [])
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

const getDeviceByID = (cellIndex: string, deviceId: string) => {
  return client
    .get(`/api/v1/cells/${cellIndex}/devices/${deviceId}`)
    .then((response) => response.data)
}

const getDeviceTokens = (deviceId: string) => {
  return client.get(`/api/v1/devices/${deviceId}/rewards`).then((response) => response.data)
}

const getRewardTimeline = (
  deviceId: string,
  timezone: string,
  page: number,
  pageSize: number,
  fromDate: string,
  toDate: string
) => {
  return client
    .get(
      `/api/v1/devices/${deviceId}/rewards/timeline?timezone=${timezone}&page=${page}&pageSize=${pageSize}&fromDate=${fromDate}&toDate=${toDate}`
    )
    .then((response) => response.data)
}

export default {
  setupAxios,
  getCells,
  getCellsData,
  getDeviceByID,
  getNetStats,
  getSearchResults,
  resolveDeviceName,
  getDeviceTokens,
  getRewardTimeline
}
