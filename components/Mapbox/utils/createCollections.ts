import type { Cell, FeatureCollection, CellBountyCell } from '../types/mapbox'
import { feature as lookupCountry } from '@rapideditor/country-coder'

const getNonCommunityDeviceCount = (devices: {
  [key: string]: number
}): number => {
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

const hasCommunityDevicesOnly = (devices: {
  [key: string]: number
}): boolean => {
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

const createTargetedRolloutsHeatmapCollection = (
  cells: Cell[],
): FeatureCollection => {
  return {
    type: 'FeatureCollection',
    features: cells
      .filter((cell) => !hasCommunityDevicesOnly(cell.devices))
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

const createCellBountyCollection = (
  cellBountyCells: CellBountyCell[],
): FeatureCollection => {
  const features = cellBountyCells.map((bounty) => {
    const polygonCoordinates = bounty.polygon.map((coord) => [coord[1], coord[0]])
    const { lon, lat } = bounty.center
    const country = lookupCountry([lon, lat])
    const countryCode = country?.properties?.iso1A2 || 'UNK'
    const countryName = country?.properties?.nameEn || 'Unknown'

    return {
      type: 'Feature' as const,
      properties: {
        index: bounty.index,
        devices_accepted: bounty.devices_accepted,
        total_rewards: bounty.total_rewards,
        activation_period_start: bounty.activation_period_start,
        activation_period_end: bounty.activation_period_end,
        distribution_period_in_days: bounty.distribution_period_in_days,
        center: bounty.center,
        device_count: 0,
        devices: {},
        country_code: countryCode,
        country_name: countryName,
      },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [polygonCoordinates],
      },
    }
  })

  return {
    type: 'FeatureCollection',
    features,
  }
}

const createCellBountyHeatmapCollection = (
  cellBountyCells: CellBountyCell[],
): FeatureCollection => {
  const features = cellBountyCells.map((bounty) => {
    return {
      type: 'Feature' as const,
      properties: {
        index: bounty.index,
        device_count: bounty.devices_accepted, // Use devices_accepted for heatmap weight
        devices_accepted: bounty.devices_accepted,
        total_rewards: bounty.total_rewards,
        center: bounty.center,
        devices: {}, // Default since we don't have device data from mocks
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [bounty.center.lon, bounty.center.lat],
      },
    }
  })

  return {
    type: 'FeatureCollection',
    features,
  }
}

export default {
  createCellsCollection,
  createHeatmapCollection,
  createTargetedRolloutsHeatmapCollection,
  createCellBountyCollection,
  createCellBountyHeatmapCollection,
}
