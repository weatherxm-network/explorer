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

export interface Collections {
  cellsCollection: FeatureCollection
  heatmapCollection: FeatureCollection
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

export type LayerKeys = 'cell-capacity' | 'data-quality'
