import type { Cell, Collections, FeatureCollection } from '../types/mapbox'
import createCollections from './createCollections'
import { fixCellPoints } from './fixCell'
import wxmApi from '~/api/wxmApi'
import { useMapboxStore } from '~/stores/mapboxStore'

const mapboxStore = useMapboxStore()

const getCollections = async () => {
  // get data
  const cells = await wxmApi
    .getCells()
    .then((cells) => {
      return cells.map((cell: Cell) => {
        fixCellPoints(cell.polygon)
        return cell
      })
    })
    .catch(() => {
      return null
    })

  if (cells) {
    // create collection for the cell layer
    const cellsCollection: FeatureCollection =
      createCollections.createCellsCollection(cells)
    // create collection for the heatmap layer
    const heatmapCollection: FeatureCollection =
      createCollections.createHeatmapCollection(cells)
    // create collection for targeted rollouts heatmap
    const targetedRolloutsHeatmapCollection: FeatureCollection =
      createCollections.createTargetedRolloutsHeatmapCollection(cells)
    
    // store calced collections
    mapboxStore.fillCollections({ cellsCollection, heatmapCollection, targetedRolloutsHeatmapCollection })

    return { cellsCollection, heatmapCollection, targetedRolloutsHeatmapCollection } as Collections
  } else {
    return {} as Collections
  }
}

export default {
  getCollections,
}
