import { defineStore } from 'pinia'
import type {
  Collections,
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
    }
  },
  getters: {
    getCollections: (state) => state.collections,
    getInitMapPositionEvent: (state) => state.initMapPositionEvent,
    getSearchedDeviceToFly: (state) => state.searchedDeviceToFly,
    getSearchedAddressToFly: (state) => state.searchedAddressToFly,
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
  },
})

interface MapState {
  collections: null | Collections
  searchedDeviceToFly: null | SearchResultDevice
  searchedAddressToFly: null | SearchResultLocation
  initMapPositionEvent: null
}
