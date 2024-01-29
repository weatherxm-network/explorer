import type { Units, UnitsUserPrefs } from '../../types/mapbox'
import localStorage from '~/cache/localStorage'
const unitsKey: string = `units`

// get units from local storage using cache
const getUnitsFromLocalStorage = (key: string) => {
  return localStorage.get(key)
}
// set units to local storage using cache
const setUnitsToLocalStorage = (units: UnitsUserPrefs) => {
  localStorage.set(unitsKey, units)
}

// set default units
const defaultUnits = {
  uv: '',
  humidity: '%',
  temp: '°C',
  precip: 'mm',
  windSpeed: 'm/s',
  windDir: '°',
  press: 'hPa',
  solarIrradiance: 'W/m2'
}

// calc units based on users prefs if any or return default
const calcUnitsBasedOnUserPrefs = (defaultUnits: Units, userPrefs: UnitsUserPrefs) => {
  // init empty obj
  let units = {}
  // regex to get text between ( )
  const regExp = /\(([^)]+)\)/
  // check if any user prefs
  if (userPrefs) {
    // create custom obj based on users prefs
    units = {
      uv: defaultUnits.uv,
      humidity: defaultUnits.humidity,
      solarIrradiance: defaultUnits.solarIrradiance,
      temp: regExp.exec(userPrefs.temp.defaultUnit)[1]
        ? regExp.exec(userPrefs.temp.defaultUnit)[1]
        : defaultUnits.temp,
      precip: regExp.exec(userPrefs.precipitation.defaultUnit)[1]
        ? regExp.exec(userPrefs.precipitation.defaultUnit)[1]
        : defaultUnits.precip,
      windSpeed: regExp.exec(userPrefs.wind_speed.defaultUnit)[1]
        ? regExp.exec(userPrefs.wind_speed.defaultUnit)[1]
        : defaultUnits.windSpeed,
      windDir: regExp.exec(userPrefs.wind_direction.defaultUnit)[1]
        ? regExp.exec(userPrefs.wind_direction.defaultUnit)[1]
        : defaultUnits.windDir,
      press: regExp.exec(userPrefs.pressure.defaultUnit)[1]
        ? regExp.exec(userPrefs.pressure.defaultUnit)[1]
        : defaultUnits.press
    }
  } else {
    units = defaultUnits
  }
  return units
}

// get units from local storage if any
const getUnits = () => {
  return getUnitsFromLocalStorage(unitsKey)
}
// set units to local storage
const setUnits = (units: UnitsUserPrefs) => {
  setUnitsToLocalStorage(units)
}
// calc units
const calcUnits = () => {
  // set users units if any
  const userPrefs = getUnitsFromLocalStorage(unitsKey)
  return calcUnitsBasedOnUserPrefs(defaultUnits, userPrefs)
}

export default {
  getUnits,
  setUnits,
  calcUnits
}
