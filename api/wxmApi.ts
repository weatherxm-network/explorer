import axios from 'axios'
import type { Device } from '~/components/common/types/common'
import type { NetworkStatsResponse } from '~/components/Stats/types/stats'

const client = axios.create({
  baseURL: '',
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
    },
  )
}

const getCells = () => {
  return client
    .get('/api/v1/cells')
    .then((response) => response.data)
    .catch(() => [])
}

const getNetStats = (): Promise<NetworkStatsResponse> => {
  return client
    .get('/api/v1/network/stats')
    .then((response) => response.data)
    .catch(() => {})
}

const getSearchResults = (query: string) => {
  return client
    .get(`/api/v1/network/search?query=${query}`)
    .then((response) => response.data)
}

const resolveDeviceName = (deviceName: string) => {
  return client
    .get(`/api/v1/network/search?exact=true&exclude=places&query=${deviceName}`)
    .then((response) => response.data)
}

const getCellsData = async (cellIndex: string) => {
  const response = await client.get(`/api/v1/cells/${cellIndex}/devices`)
  return response.data as Device[]
}

const getDeviceByID = (cellIndex: string, deviceId: string) => {
  return client
    .get(`/api/v1/cells/${cellIndex}/devices/${deviceId}`)
    .then((response) => response.data)
}

const getDeviceTokens = (deviceId: string) => {
  return client
    .get(`/api/v1/devices/${deviceId}/rewards`)
    .then((response) => response.data)
}

const getRewardTimeline = (
  deviceId: string,
  timezone: string,
  page: number,
  pageSize: number,
  fromDate: string,
  toDate: string,
) => {
  return client
    .get(
      `/api/v1/devices/${deviceId}/rewards/timeline?timezone=${timezone}&page=${page}&pageSize=${pageSize}&fromDate=${fromDate}&toDate=${toDate}`,
    )
    .then((response) => response.data)
}

const getCellBountyCells = async () => {
  const mockBountyCells = [
    {
      index: '8739040deffffff',
      devices_accepted: 1,
      total_rewards: 10000,
      activation_period_start: '2025-11-11T00:00:00Z',
      activation_period_end: '2025-11-27T00:00:00Z',
      distribution_period_in_days: 365,
      center: {
        lat: 40.25008959949481,
        lon: -7.527480217708096,
      },
      polygon: [
        [40.26313145040794, -7.531547867984081],
        [40.25406228754797, -7.543781360740414],
        [40.24102010324028, -7.539711709153651],
        [40.23704752267026, -7.523414108748664],
        [40.24611504588057, -7.51118271563032],
        [40.25915678890848, -7.515246822751447],
        [40.26313145040794, -7.531547867984081],
      ],
    },
    {
      index: '8739040d8ffffff',
      devices_accepted: 1,
      total_rewards: 10000,
      activation_period_start: '2025-11-11T00:00:00Z',
      activation_period_end: '2025-11-27T00:00:00Z',
      distribution_period_in_days: 365,
      center: {
        lat: 40.25518026213416,
        lon: -7.498949420714574,
      },
      polygon: [
        [40.26822167039339, -7.503011524954995],
        [40.25915678890848, -7.515246822751447],
        [40.24611504588057, -7.51118271563032],
        [40.242138628368295, -7.494888855923743],
        [40.25120187174869, -7.48265566328857],
        [40.26424317034385, -7.486714224673497],
        [40.26822167039339, -7.503011524954995],
      ],
    },
    {
      index: '8739040ddffffff',
      devices_accepted: 1,
      total_rewards: 10000,
      activation_period_start: '2025-11-11T00:00:00Z',
      activation_period_end: '2025-11-27T00:00:00Z',
      distribution_period_in_days: 365,
      center: {
        lat: 40.277284242862635,
        lon: -7.490774324990896,
      },
      polygon: [
        [40.29032508776099, -7.494835965075462],
        [40.28126285160163, -7.507075169479748],
        [40.26822167039339, -7.503011524954995],
        [40.26424317034385, -7.486714224673497],
        [40.27330376942364, -7.4744771281799975],
        [40.28634450523043, -7.478535223532241],
        [40.29032508776099, -7.494835965075462],
      ],
    },
    {
      index: '8739040ceffffff',
      devices_accepted: 1,
      total_rewards: 10000,
      activation_period_start: '2025-11-11T00:00:00Z',
      activation_period_end: '2025-11-27T00:00:00Z',
      distribution_period_in_days: 365,
      center: {
        lat: 40.29938501284757,
        lon: -7.482594858133727,
      },
      polygon: [
        [40.312425290731376, -7.486656032819598],
        [40.30336570349485, -7.4988991457624214],
        [40.29032508776099, -7.494835965075462],
        [40.28634450523043, -7.478535223532241],
        [40.295402456411985, -7.466294221252983],
        [40.308442625776856, -7.470351849328656],
        [40.312425290731376, -7.486656032819598],
      ],
    },
    {
      index: '873931614ffffff',
      devices_accepted: 1,
      total_rewards: 10000,
      activation_period_start: '2025-11-11T00:00:00Z',
      activation_period_end: '2025-11-27T00:00:00Z',
      distribution_period_in_days: 365,
      center: {
        lat: 39.74455507422698,
        lon: -8.90680832322777,
      },
      polygon: [
        [39.75761950461519, -8.911127664646179],
        [39.748328873101784, -8.923226291066038],
        [39.73526419017942, -8.918905040697139],
        [39.73149042524039, -8.902490600075739],
        [39.740779339165854, -8.890393789794555],
        [39.753843735216215, -8.894709603363921],
        [39.75761950461519, -8.911127664646179],
      ],
    },
    {
      index: '873931610ffffff',
      devices_accepted: 1,
      total_rewards: 10000,
      activation_period_start: '2025-11-11T00:00:00Z',
      activation_period_end: '2025-11-27T00:00:00Z',
      distribution_period_in_days: 365,
      center: {
        lat: 39.72771472551144,
        lon: -8.886079593186913,
      },
      polygon: [
        [39.740779339165854, -8.890393789794555],
        [39.73149042524039, -8.902490600075739],
        [39.71842555923403, -8.898174494329801],
        [39.71464989583125, -8.881767012681323],
        [39.72393709258976, -8.869672021645203],
        [39.73700166951599, -8.873982692382482],
        [39.740779339165854, -8.890393789794555],
      ],
    },
    {
      index: '87393161effffff',
      devices_accepted: 1,
      total_rewards: 10000,
      activation_period_start: '2025-11-11T00:00:00Z',
      activation_period_end: '2025-11-27T00:00:00Z',
      distribution_period_in_days: 365,
      center: {
        lat: 39.71637603355867,
        lon: -8.836867191046595,
      },
      polygon: [
        [39.729440532842375, -8.841170812071358],
        [39.720157528072846, -8.8532678870622],
        [39.707092775231295, -8.848962355013448],
        [39.70331132122869, -8.832565182211251],
        [39.712592610645494, -8.82046993520411],
        [39.72565706901571, -8.824770032389809],
        [39.729440532842375, -8.841170812071358],
      ],
    },
    {
      index: '87393161affffff',
      devices_accepted: 1,
      total_rewards: 10000,
      activation_period_start: '2025-11-11T00:00:00Z',
      activation_period_end: '2025-11-27T00:00:00Z',
      distribution_period_in_days: 365,
      center: {
        lat: 39.69952794022136,
        lon: -8.81617144890346,
      },
      polygon: [
        [39.712592610645494, -8.82046993520411],
        [39.70331132122869, -8.832565182211251],
        [39.69024639742974, -8.828264784708045],
        [39.68646305932023, -8.811874572631188],
        [39.69574263380751, -8.799781156691362],
        [39.708807260932005, -8.804076121137577],
        [39.712592610645494, -8.82046993520411],
      ],
    },
    {
      index: '873922615ffffff',
      devices_accepted: 1,
      total_rewards: 10000,
      activation_period_start: '2025-11-11T00:00:00Z',
      activation_period_end: '2025-11-27T00:00:00Z',
      distribution_period_in_days: 365,
      center: {
        lat: 40.84151973915786,
        lon: -8.49163522318841,
      },
      polygon: [
        [40.85455624319713, -8.495933346850952],
        [40.84539571836742, -8.508228216744161],
        [40.832358884727356, -8.503928106168368],
        [40.82848291209089, -8.487338736072845],
        [40.8376417677161, -8.475045816745927],
        [40.85067826477415, -8.479340316323798],
        [40.85455624319713, -8.495933346850952],
      ],
    },
    {
      index: '873922603ffffff',
      devices_accepted: 1,
      total_rewards: 10000,
      activation_period_start: '2025-11-11T00:00:00Z',
      activation_period_end: '2025-11-27T00:00:00Z',
      distribution_period_in_days: 365,
      center: {
        lat: 40.85206853131293,
        lon: -8.433868031836703,
      },
      polygon: [
        [40.865104356253276, -8.438154928435447],
        [40.85595249091949, -8.450453912293161],
        [40.84291633363636, -8.446165025320061],
        [40.83903238424602, -8.429582768072365],
        [40.848182583296285, -8.417285746449235],
        [40.861218397612305, -8.42156901921955],
        [40.865104356253276, -8.438154928435447],
      ],
    },
    {
      index: '87392261dffffff',
      devices_accepted: 1,
      total_rewards: 10000,
      activation_period_start: '2025-11-11T00:00:00Z',
      activation_period_end: '2025-11-27T00:00:00Z',
      distribution_period_in_days: 365,
      center: {
        lat: 40.83514644785831,
        lon: -8.413004105141503,
      },
      polygon: [
        [40.848182583296285, -8.417285746449235],
        [40.83903238424602, -8.429582768072365],
        [40.82599591661196, -8.425299136257644],
        [40.822109992857534, -8.408724094412245],
        [40.83125852613646, -8.396429038134187],
        [40.844294648533214, -8.400707057739016],
        [40.848182583296285, -8.417285746449235],
      ],
    },
    {
      index: '87392260affffff',
      devices_accepted: 1,
      total_rewards: 10000,
      activation_period_start: '2025-11-11T00:00:00Z',
      activation_period_end: '2025-11-27T00:00:00Z',
      distribution_period_in_days: 365,
      center: {
        lat: 40.8404047286877,
        lon: -8.384131967311204,
      },
      polygon: [
        [40.853440517517484, -8.388407994687286],
        [40.844294648533214, -8.400707057739016],
        [40.83125852613646, -8.396429038134187],
        [40.827368620744, -8.379857568653948],
        [40.83651282542412, -8.367560476767833],
        [40.84954859939291, -8.371832882581293],
        [40.853440517517484, -8.388407994687286],
      ],
    },
    {
      index: '873923634ffffff',
      devices_accepted: 1,
      total_rewards: 10000,
      activation_period_start: '2025-11-11T00:00:00Z',
      activation_period_end: '2025-11-27T00:00:00Z',
      distribution_period_in_days: 365,
      center: {
        lat: 41.14165458294329,
        lon: -7.1396798788796865,
      },
      polygon: [
        [41.15467014352826, -7.143716743382134],
        [41.145718235812346, -7.156111584712887],
        [41.13270227830309, -7.152072652267234],
        [41.1286387134919, -7.135644564299333],
        [41.13758902540793, -7.123251946339668],
        [41.15060449752865, -7.127285192464181],
        [41.15467014352826, -7.143716743382134],
      ],
    },
    {
      index: '873923620ffffff',
      devices_accepted: 1,
      total_rewards: 10000,
      activation_period_start: '2025-11-11T00:00:00Z',
      activation_period_end: '2025-11-27T00:00:00Z',
      distribution_period_in_days: 365,
      center: {
        lat: 41.173366361428236,
        lon: -7.073662369218313,
      },
      polygon: [
        [41.18638023471227, -7.077687330883835],
        [41.17743989064822, -7.090089662228191],
        [41.164425616228435, -7.086062627852915],
        [41.16035217808074, -7.069638953855714],
        [41.16929093057295, -7.057238860069631],
        [41.18230471237835, -7.061260202215008],
        [41.18638023471227, -7.077687330883835],
      ],
    },
    {
      index: '873923621ffffff',
      devices_accepted: 1,
      total_rewards: 10000,
      activation_period_start: '2025-11-11T00:00:00Z',
      activation_period_end: '2025-11-27T00:00:00Z',
      distribution_period_in_days: 365,
      center: {
        lat: 41.178227288740025,
        lon: -7.044836859698868,
      },
      polygon: [
        [41.19124066805269, -7.048856127564882],
        [41.18230471237835, -7.061260202215008],
        [41.16929093057295, -7.057238860069631],
        [41.16521359980145, -7.040819136172868],
        [41.17414796551718, -7.028417304724521],
        [41.18716125155679, -7.03243295346611],
        [41.19124066805269, -7.048856127564882],
      ],
    },
    {
      index: '87392362cffffff',
      devices_accepted: 1,
      total_rewards: 10000,
      activation_period_start: '2025-11-11T00:00:00Z',
      activation_period_end: '2025-11-27T00:00:00Z',
      distribution_period_in_days: 365,
      center: {
        lat: 41.18307993580884,
        lon: -7.0160135691988055,
      },
      polygon: [
        [41.19609281799905, -7.020027142094926],
        [41.18716125155679, -7.03243295346611],
        [41.17414796551718, -7.028417304724521],
        [41.17006674442989, -7.012001538677816],
        [41.17899672252974, -6.99959797614717],
        [41.192009509653154, -7.003607930320101],
        [41.19609281799905, -7.020027142094926],
      ],
    },
    {
      index: '873923625ffffff',
      devices_accepted: 1,
      total_rewards: 10000,
      activation_period_start: '2025-11-11T00:00:00Z',
      activation_period_end: '2025-11-27T00:00:00Z',
      distribution_period_in_days: 365,
      center: {
        lat: 41.195318183575964,
        lon: -7.065283090107708,
      },
      polygon: [
        [41.20833134263961, -7.069307524599484],
        [41.19939379640625, -7.081713839704138],
        [41.18638023471227, -7.077687330883835],
        [41.18230471237835, -7.061260202215008],
        [41.19124066805269, -7.048856127564882],
        [41.20425373621352, -7.052876940621883],
        [41.20833134263961, -7.069307524599484],
      ],
    },
    {
      index: '87392375affffff',
      devices_accepted: 1,
      total_rewards: 10000,
      activation_period_start: '2025-11-11T00:00:00Z',
      activation_period_end: '2025-11-27T00:00:00Z',
      distribution_period_in_days: 365,
      center: {
        lat: 41.19276039513231,
        lon: -6.958373702572924,
      },
      polygon: [
        [41.20577227362856, -6.962375882054182],
        [41.196849488149894, -6.974785147108813],
        [41.18383720309197, -6.970780888660497],
        [41.179748208320504, -6.954373061531454],
        [41.188669408697976, -6.941966056580634],
        [41.20168118854216, -6.9459646181573715],
        [41.20577227362856, -6.962375882054182],
      ],
    },
    {
      index: '87392375cffffff',
      devices_accepted: 1,
      total_rewards: 10000,
      activation_period_start: '2025-11-11T00:00:00Z',
      activation_period_end: '2025-11-27T00:00:00Z',
      distribution_period_in_days: 365,
      center: {
        lat: 41.23179509957908,
        lon: -6.9703848597306,
      },
      polygon: [
        [41.244806043985896, -6.974391659624565],
        [41.235884481452224, -6.986807164943521],
        [41.22287312885413, -6.98279828440081],
        [41.21878384228541, -6.966379600823706],
        [41.22770382012928, -6.953966355795369],
        [41.24071466882536, -6.957969533553985],
        [41.244806043985896, -6.974391659624565],
      ],
    },
    {
      index: '87392366affffff',
      devices_accepted: 1,
      total_rewards: 10000,
      activation_period_start: '2025-11-11T00:00:00Z',
      activation_period_end: '2025-11-27T00:00:00Z',
      distribution_period_in_days: 365,
      center: {
        lat: 41.177786970708915,
        lon: -6.802402010931519,
      },
      polygon: [
        [41.190797198756904, -6.806371103847573],
        [41.181895141565604, -6.818782629375754],
        [41.168884501811924, -6.814811451451614],
        [41.16477644108315, -6.798434444054713],
        [41.173676920912726, -6.786025206456351],
        [41.186687038427664, -6.789990687841502],
        [41.190797198756904, -6.806371103847573],
      ],
    },
    {
      index: '87392366cffffff',
      devices_accepted: 1,
      total_rewards: 10000,
      activation_period_start: '2025-11-11T00:00:00Z',
      activation_period_end: '2025-11-27T00:00:00Z',
      distribution_period_in_days: 365,
      center: {
        lat: 41.21681674403747,
        lon: -6.8143138711679265,
      },
      polygon: [
        [41.22982605822911, -6.81828754725898],
        [41.22092523941695, -6.830705331213002],
        [41.20791551188897, -6.826729568412935],
        [41.203807123706596, -6.810341723645344],
        [41.21270636557195, -6.797926227869513],
        [41.225715572161015, -6.801896288197677],
        [41.22982605822911, -6.81828754725898],
      ],
    },
    {
      index: '873923646ffffff',
      devices_accepted: 1,
      total_rewards: 10000,
      activation_period_start: '2025-11-11T00:00:00Z',
      activation_period_end: '2025-11-27T00:00:00Z',
      distribution_period_in_days: 365,
      center: {
        lat: 41.14626291174786,
        lon: -6.868409880575639,
      },
      polygon: [
        [41.15927488845123, -6.872390917726805],
        [41.15036124329971, -6.88479509444434],
        [41.13734885909522, -6.880811976979739],
        [41.133250634668435, -6.864430373132991],
        [41.14216269816226, -6.852028470240131],
        [41.1551745673353, -6.856005896880579],
        [41.15927488845123, -6.872390917726805],
      ],
    },
    {
      index: '873923662ffffff',
      devices_accepted: 1,
      total_rewards: 10000,
      activation_period_start: '2025-11-11T00:00:00Z',
      activation_period_end: '2025-11-27T00:00:00Z',
      distribution_period_in_days: 365,
      center: {
        lat: 41.18529793464045,
        lon: -6.8803575845302944,
      },
      polygon: [
        [41.198309001081746, -6.88434321587182],
        [41.18939658170137, -6.896753636909718],
        [41.176385106125444, -6.892765923564582],
        [41.172286563256186, -6.876373485430254],
        [41.181197401396346, -6.863965338439051],
        [41.19420836324042, -6.867947355044856],
        [41.198309001081746, -6.88434321587182],
      ],
    },
  ]
  return mockBountyCells
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
  getRewardTimeline,
  getCellBountyCells,
}
