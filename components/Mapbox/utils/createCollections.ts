import type { Cell, FeatureCollection } from '../types/mapbox'

const createCellsCollection = (cells: Cell[]): FeatureCollection => {
  return {
    type: 'FeatureCollection',
    features: cells.map((cell: Cell) => ({
      type: 'Feature',
      properties: {
        index: cell.index,
        device_count: cell.device_count,
        center: cell.center,
        avg_data_quality: cell.avg_data_quality,
        capacity: cell.capacity,
        active_device_count: cell.active_device_count,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          cell.polygon.map((coordinates) => [coordinates.lon, coordinates.lat]),
        ],
      },
    })),
  }
}

const createHeatmapCollection = (cells: Cell[]): FeatureCollection => {
  return {
    type: 'FeatureCollection',
    features: cells.map((cell: Cell) => ({
      type: 'Feature',
      properties: {
        index: cell.index,
        device_count: cell.device_count,
        center: cell.center,
      },
      geometry: {
        type: 'Point',
        coordinates: [cell.center.lon, cell.center.lat],
      },
    })),
  }
}

export default {
  createCellsCollection,
  createHeatmapCollection,
}
