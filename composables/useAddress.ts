import _ from 'lodash'
import { cellToLatLng } from 'h3-js'
import localstorage from '~/cache/localStorage'
import { getNominatimAddress } from '~/api/nominatimApi'

export const useAddress = () => {
  const getAddressLocalstorageKey = (cellIndex: string) => `resolvedAddress_${cellIndex}`

  // Return an address string (city, country code) from nominatim.
  const nominatim = (lat: number, lon: number) => {
    return getNominatimAddress(lat, lon).then((response) => {
      // Get address features
      const features = _.get(response, 'data.features')

      // Fail fast if nominatim's response has no 'features'
      if (_.isEmpty(features)) {
        throw new Error(`Nominatim failed to resolve address for (${lat}, ${lon}).`)
      }

      // Build address string from the response's features
      // City name and country code are not guaranteed to exist
      const cityName = _.get(features, '[0].properties.name')
      const countryCode = _.toUpper(_.get(features, '[0].properties.address.country_code'))
      return _.join([cityName, countryCode], ', ')
    })
  }

  const resolveAddressRemotely = async (cellIndex: string) => {
    const coords = cellToLatLng(cellIndex)
    return await nominatim(coords[0], coords[1])
      // TODO Return null or error. This could be dangerous. We need to at least log this error.
      .catch(() => null)
  }

  // Return a cached address for this cell index, or null in case of cache miss.
  const resolveAddressLocally = (cellIndex: string) => {
    try {
      return localstorage.get(getAddressLocalstorageKey(cellIndex))
    } catch (e) {
      return null
    }
  }

  // Get a resolved address for this cell index, from cache or network.
  const getAddress = async (cellIndex: string) => {
    const localAddress = resolveAddressLocally(cellIndex)
    if (!_.isNil(localAddress)) {
      return localAddress
    }
    const remoteAddress = await resolveAddressRemotely(cellIndex)
    if (!_.isNil(remoteAddress)) {
      // Save in cache
      localstorage.set(getAddressLocalstorageKey(cellIndex), remoteAddress)
      return remoteAddress
    }
    // Default fallback value
    return null
  }

  return { getAddress }
}
