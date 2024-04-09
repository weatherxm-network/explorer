/* eslint-disable camelcase */
import _ from 'lodash'
import dayjs from 'dayjs'
import type { CurrentWeather, Units } from '~/components/common/types/common'

export const useWeatherStuff = () => {
  const degToCompass = (windDir: number) => {
    const val = Math.floor(windDir / 22.5 + 0.5)
    const arr = [
      'N',
      'NNE',
      'NE',
      'ENE',
      'E',
      'ESE',
      'SE',
      'SSE',
      'S',
      'SSW',
      'SW',
      'WSW',
      'W',
      'WNW',
      'NW',
      'NNW'
    ]
    return arr[val % 16]
  }

  // <--------------- Calc beaufort based on wind speed ------------->
  const msToBeaufort = (windSpeedinMs: number) => {
    return Math.ceil(Math.cbrt(Math.pow(windSpeedinMs / 0.836, 2))).toFixed(0)
  }

  // <------------------------ Calc current weather ----------------------->
  const calcCurrentWeather = (deviceCurrentWeather: CurrentWeather, units: Units) => {
    // init local vars
    let temp = '?'
    let feels_like = '?'
    let precip = '?'
    let press = '?'
    let windSpeed = '?'
    let windDir = '?'
    let windGust = '?'
    let precipAccum = '?'
    let dewPoint = '?'

    if (!_.isEmpty(deviceCurrentWeather)) {
      // calculate temp & feels like & dewPoint based on unit
      if (deviceCurrentWeather.temperature !== undefined) {
        switch (units.temp) {
          case '°C':
            temp = deviceCurrentWeather.temperature.toFixed(1)
            feels_like = deviceCurrentWeather.feels_like.toFixed(1)
            dewPoint = deviceCurrentWeather.dew_point.toFixed(1)
            break
          case '°F':
            temp = (deviceCurrentWeather.temperature * 1.8 + 32).toFixed(1)
            feels_like = (deviceCurrentWeather.feels_like * 1.8 + 32).toFixed(1)
            dewPoint = (deviceCurrentWeather.dew_point * 1.8 + 32).toFixed(1)
            break
        }
      }
      // calculate precip based on unit
      if (deviceCurrentWeather.precipitation !== undefined) {
        switch (units.precip) {
          case 'mm':
            precip = deviceCurrentWeather.precipitation.toFixed(1)
            precipAccum = deviceCurrentWeather.precipitation_accumulated.toFixed(1)
            break
          case 'in':
            precip = (deviceCurrentWeather.precipitation / 25.4).toFixed(1)
            precipAccum = (deviceCurrentWeather.precipitation_accumulated / 25.4).toFixed(1)
        }
      }
      // calculate wind speed & wind gust based on unit
      if (deviceCurrentWeather.wind_speed !== undefined) {
        switch (units.windSpeed) {
          case 'm/s':
            windSpeed = deviceCurrentWeather.wind_speed.toFixed(1)
            windGust = deviceCurrentWeather.wind_gust.toFixed(1)
            break
          case 'km/h':
            windSpeed = (deviceCurrentWeather.wind_speed * 3.6).toFixed(1)
            windGust = (deviceCurrentWeather.wind_gust * 3.6).toFixed(1)
            break
          case 'mph':
            windSpeed = (deviceCurrentWeather.wind_speed * 2.24).toFixed(1)
            windGust = (deviceCurrentWeather.wind_gust * 2.24).toFixed(1)
            break
          case 'kn':
            windSpeed = (deviceCurrentWeather.wind_speed * 1.94).toFixed(1)
            windGust = (deviceCurrentWeather.wind_gust * 1.94).toFixed(1)
            break
          case 'bf':
            windSpeed = msToBeaufort(deviceCurrentWeather.wind_speed)
            windGust = msToBeaufort(deviceCurrentWeather.wind_gust)
            break
        }
      }
      // calculate pressure based on unit
      if (deviceCurrentWeather.pressure !== undefined) {
        switch (units.press) {
          case 'hPa':
            press = deviceCurrentWeather.pressure.toFixed(1)
            break
          case 'inHg':
            press = (deviceCurrentWeather.pressure * 0.0295).toFixed(1)
            break
        }
      }
      // calculate wind dir based on unit
      if (deviceCurrentWeather.wind_direction !== undefined) {
        switch (units.windDir) {
          case '°':
            windDir = deviceCurrentWeather.wind_direction.toFixed(0)
            break
          default:
            windDir = degToCompass(deviceCurrentWeather.wind_direction)
        }
      }
      // return an object with all calced data
      return {
        temp,
        feels_like,
        precip,
        press,
        windSpeed,
        windDir,
        windGust,
        precipAccum,
        dewPoint,
        solarIrradiance:
          deviceCurrentWeather.solar_irradiance !== undefined
            ? deviceCurrentWeather.solar_irradiance.toFixed(1)
            : '?',
        timestamp:
          deviceCurrentWeather.timestamp !== undefined ? deviceCurrentWeather.timestamp : '?',
        humidity:
          deviceCurrentWeather.humidity !== undefined
            ? deviceCurrentWeather.humidity.toFixed(0)
            : '?',
        uv:
          deviceCurrentWeather.uv_index !== undefined
            ? deviceCurrentWeather.uv_index.toFixed(0)
            : '-',
        time: dayjs(deviceCurrentWeather.timestamp).format(' h:mm A'),
        lottie: deviceCurrentWeather.icon
          ? deviceCurrentWeather.icon.replaceAll('-', '_')
          : 'not_available'
      }
    } else {
      return {
        temp,
        feels_like,
        precip,
        press,
        windSpeed,
        windDir,
        windGust,
        precipAccum,
        dewPoint,
        solarIrradiance: '?',
        timestamp: '?',
        humidity: '?',
        uv: '?',
        time: '?',
        lottie: 'not_available'
      }
    }
  }

  return { calcCurrentWeather, degToCompass }
}
