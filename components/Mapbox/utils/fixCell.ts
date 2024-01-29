import type { Point } from '../types/mapbox'

/**
 * @param {List} polygon - A list of polygon points
 * @returns {List} polygon - Returns a complete point polygon (first same as last)
 */
export function fixCellPoints(cell: Point[]) {
  cell.push(cell[0])
  return cell
}
