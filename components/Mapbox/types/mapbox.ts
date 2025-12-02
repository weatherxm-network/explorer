export interface Point {
  lat: number
  lon: number
}

export interface Cell {
  active_device_count: number
  capacity: number
  avg_data_quality?: number
  devices: {
    [key: string]: number
  }
  center: Point
  device_count: number
  index: string
  polygon: Point[]
}

interface Properties {
  index: string
  device_count: number
  center: Point
  avg_data_quality?: number
  devices: {
    [key: string]: number
  }
  country_code?: string
  country_name?: string
}

interface Geometry {
  type: 'Polygon' | 'Point'
  coordinates: number[][][] | number[]
}

interface Feature {
  type: 'Feature'
  properties: Properties
  geometry: Geometry
}

export interface FeatureCollection {
  type: string
  features: Feature[]
}

export interface CellBountyCell {
  index: string
  devices_accepted: number
  total_rewards: number
  activation_period_start: string
  activation_period_end: string
  distribution_period_in_days: number
  center: Point
  polygon: [number, number][] // Array of [lat, lon] pairs
}

export interface Collections {
  cellsCollection: FeatureCollection
  heatmapCollection: FeatureCollection
  targetedRolloutsHeatmapCollection?: FeatureCollection
  cellBountyCollection?: FeatureCollection
  cellBountyHeatmapCollection?: FeatureCollection
}

export interface CellBountyCountry {
  id: string
  code: string
  name: string
  count: number
  bbox: [number, number, number, number]
  centroid: Point
  indexes: string[]
}

export interface SearchResultDevice {
  id: string
  cell_center: Point
  cell_index: string
  connectivity: string
  name: string
}

export interface SearchResultLocation {
  center: Point
  name: string
  place: string
}

export interface Results {
  devices: SearchResultDevice[]
  addresses: SearchResultLocation[]
}

export interface Theme {
  currentTheme: 'dark' | 'light'
  name: 'Dark' | 'Light' | 'System'
  options: [`Dark`, `Light`, `System`]
}

interface UnitPrefStruct {
  name: string
  defaultUnit: string
  options: string[]
}

export interface UnitsUserPrefs {
  temp: UnitPrefStruct
  precipitation: UnitPrefStruct
  wind_speed: UnitPrefStruct
  wind_direction: UnitPrefStruct
  pressure: UnitPrefStruct
}

export type LayerKeys =
  | 'cell-capacity'
  | 'data-quality'
  | 'targeted-rollouts'
  | 'cell-bounty'
