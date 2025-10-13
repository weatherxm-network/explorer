import { defineStore } from 'pinia'
import type {
  Collections,
  LayerKeys,
  SearchResultDevice,
  SearchResultLocation,
} from '~/components/Mapbox/types/mapbox'

export const useMapboxStore = defineStore('MapboxStore', {
  state: (): MapState => {
    return {
      collections: null,
      initMapPositionEvent: null,
      searchedDeviceToFly: null,
      searchedAddressToFly: null,
      qualityRange: [0, 100],
      currentLayerType: 'cell-capacity',
    }
  },
  getters: {
    getCollections: (state) => state.collections,
    getInitMapPositionEvent: (state) => state.initMapPositionEvent,
    getSearchedDeviceToFly: (state) => state.searchedDeviceToFly,
    getSearchedAddressToFly: (state) => state.searchedAddressToFly,
    getQualityRange: (state) => state.qualityRange,
    getCurrentLayerType: (state) => state.currentLayerType,
  },

  actions: {
    fillCollections(calcedCollections: Collections) {
      this.collections = calcedCollections
    },
    emitInitMapPositionEvent(event) {
      this.initMapPositionEvent = event
    },
    setSearchedDeviceToFly(device: SearchResultDevice) {
      this.searchedDeviceToFly = device
    },
    setSearchedAddressToFly(address: SearchResultLocation) {
      this.searchedAddressToFly = address
    },
    setQualityRange(range: [number, number]) {
      this.qualityRange = range
    },
    setCurrentLayerType(layerType: LayerKeys) {
      this.currentLayerType = layerType;
    },
  },
})

interface MapState {
  collections: null | Collections
  searchedDeviceToFly: null | SearchResultDevice
  searchedAddressToFly: null | SearchResultLocation
  initMapPositionEvent: null
  qualityRange: [number, number]
  currentLayerType: LayerKeys
}
