import { defineStore } from 'pinia'

export const useMapboxStore = defineStore('MapboxStore', {
  state: () => {
    return {
      collections: null,
      initMapPositionEvent: null,
      searchedDeviceToFly: null,
      searchedAddressToFly: null
    }
  },
  getters: {
    getCollections: (state) => state.collections,
    getInitMapPositionEvent: (state) => state.initMapPositionEvent,
    getSearchedDeviceToFly: (state) => state.searchedDeviceToFly,
    getSearchedAddressToFly: (state) => state.searchedAddressToFly
  },

  actions: {
    fillCollections(calcedCollections) {
      this.collections = calcedCollections
    },
    emitInitMapPositionEvent(event) {
      this.initMapPositionEvent = event
    },
    setSearchedDeviceToFly(device) {
      this.searchedDeviceToFly = device
    },
    setSearchedAddressToFly(address) {
      this.searchedAddressToFly = address
    }
  }
})
