import type { Cell, FeatureCollection } from '../types/mapbox'

const getNonCommunityDeviceCount = (devices: { [key: string]: number }): number => {
  if (!devices || typeof devices !== 'object') {
    return 0
  }
  
  return Object.entries(devices).reduce((total, [deviceType, count]) => {
    if (deviceType !== 'community') {
      return total + count
    }
    return total
  }, 0)
}

const hasCommunityDevicesOnly = (devices: { [key: string]: number }): boolean => {
  if (!devices || typeof devices !== 'object') {
    return false
  }
  const deviceKeys = Object.keys(devices)
  return deviceKeys.length === 1 && deviceKeys[0] === 'community'
}

const createCellsCollection = (cells: Cell[]): FeatureCollection => {
  return {
    type: 'FeatureCollection',
    features: cells.map((cell: Cell) => ({
      type: 'Feature',
      properties: {
        index: cell.index,
        device_count: cell.device_count,
        non_community_device_count: getNonCommunityDeviceCount(cell.devices),
        devices: cell.devices,
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
        non_community_device_count: getNonCommunityDeviceCount(cell.devices),
        devices: cell.devices,
        center: cell.center,
        avg_data_quality: cell.avg_data_quality,
        capacity: cell.capacity,
        active_device_count: cell.active_device_count,
      },
      geometry: {
        type: 'Point',
        coordinates: [cell.center.lon, cell.center.lat],
      },
    })),
  }
}

const createTargetedRolloutsHeatmapCollection = (cells: Cell[]): FeatureCollection => {
  return {
    type: 'FeatureCollection',
    features: cells
      .filter(cell => !hasCommunityDevicesOnly(cell.devices))
      .map((cell: Cell) => ({
        type: 'Feature',
        properties: {
          index: cell.index,
          device_count: getNonCommunityDeviceCount(cell.devices),
          non_community_device_count: getNonCommunityDeviceCount(cell.devices),
          devices: cell.devices,
          center: cell.center,
          avg_data_quality: cell.avg_data_quality,
          capacity: cell.capacity,
          active_device_count: cell.active_device_count,
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
  createTargetedRolloutsHeatmapCollection,
}
