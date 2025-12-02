import type {
  CellBountyCountry,
  FeatureCollection,
  Point,
} from '../types/mapbox'

interface Accumulator {
  code: string
  name: string
  count: number
  indexes: string[]
  minLng: number
  minLat: number
  maxLng: number
  maxLat: number
  sumLat: number
  sumLon: number
}

const createEmptyAcc = (code: string, name: string): Accumulator => ({
  code,
  name,
  count: 0,
  indexes: [],
  minLng: Infinity,
  minLat: Infinity,
  maxLng: -Infinity,
  maxLat: -Infinity,
  sumLat: 0,
  sumLon: 0,
})

const extendBounds = (
  acc: Accumulator,
  bounds: [number, number, number, number],
) => {
  const [minLng, minLat, maxLng, maxLat] = bounds
  acc.minLng = Math.min(acc.minLng, minLng)
  acc.minLat = Math.min(acc.minLat, minLat)
  acc.maxLng = Math.max(acc.maxLng, maxLng)
  acc.maxLat = Math.max(acc.maxLat, maxLat)
}

const computeFeatureBounds = (
  feature: FeatureCollection['features'][number],
): [number, number, number, number] => {
  if (
    feature?.geometry?.type === 'Polygon' &&
    Array.isArray(feature.geometry.coordinates)
  ) {
    const coordinates = feature.geometry.coordinates[0] as number[][]
    let minLng = Infinity
    let minLat = Infinity
    let maxLng = -Infinity
    let maxLat = -Infinity

    coordinates.forEach(([lng, lat]) => {
      minLng = Math.min(minLng, lng)
      minLat = Math.min(minLat, lat)
      maxLng = Math.max(maxLng, lng)
      maxLat = Math.max(maxLat, lat)
    })

    return [minLng, minLat, maxLng, maxLat]
  }

  if (feature?.properties?.center) {
    const center = feature.properties.center as Point
    return [center.lon, center.lat, center.lon, center.lat]
  }

  return [0, 0, 0, 0]
}

export const extractCellBountyCountries = (
  collection?: FeatureCollection | null,
): CellBountyCountry[] => {
  if (!collection?.features?.length) {
    return []
  }

  const accMap = new Map<string, Accumulator>()

  collection.features.forEach((feature) => {
    const code =
      feature?.properties?.country_code ||
      feature?.properties?.countryCode ||
      'UNK'
    const name = feature?.properties?.country_name || 'Unknown'
    const idx = feature?.properties?.index
    const center = feature?.properties?.center as Point | undefined
    const bounds = computeFeatureBounds(feature)

    const existing = accMap.get(code) ?? createEmptyAcc(code, name)
    existing.count += 1
    if (idx) {
      existing.indexes.push(idx)
    }
    extendBounds(existing, bounds)

    if (center) {
      existing.sumLat += center.lat
      existing.sumLon += center.lon
    } else {
      const [minLng, minLat, maxLng, maxLat] = bounds
      existing.sumLat += (minLat + maxLat) / 2
      existing.sumLon += (minLng + maxLng) / 2
    }

    accMap.set(code, existing)
  })

  return Array.from(accMap.values())
    .filter((country) => country.count > 0)
    .map<CellBountyCountry>((country) => ({
      id: country.code,
      code: country.code,
      name: country.name,
      count: country.count,
      bbox: [country.minLng, country.minLat, country.maxLng, country.maxLat],
      centroid: {
        lat: country.sumLat / country.count,
        lon: country.sumLon / country.count,
      },
      indexes: country.indexes,
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}
