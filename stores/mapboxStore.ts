import { defineStore } from 'pinia'
import type {
  Collections,
  LayerKeys,
  SearchResultDevice,
  SearchResultLocation,
  CellBountyCountry,
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
      bountyCountries: [],
      selectedBountyCountries: [],
    }
  },
  getters: {
    getCollections: (state) => state.collections,
    getInitMapPositionEvent: (state) => state.initMapPositionEvent,
    getSearchedDeviceToFly: (state) => state.searchedDeviceToFly,
    getSearchedAddressToFly: (state) => state.searchedAddressToFly,
    getQualityRange: (state) => state.qualityRange,
    getCurrentLayerType: (state) => state.currentLayerType,
    getBountyCountries: (state) => state.bountyCountries,
    getSelectedBountyCountries: (state) => state.selectedBountyCountries,
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
      this.currentLayerType = layerType
    },
    setBountyCountries(countries: CellBountyCountry[]) {
      this.bountyCountries = countries
    },
    setSelectedBountyCountries(countryCodes: string[]) {
      this.selectedBountyCountries = Array.from(new Set(countryCodes))
    },
    toggleBountyCountry(countryCode: string) {
      if (this.selectedBountyCountries.includes(countryCode)) {
        this.selectedBountyCountries = this.selectedBountyCountries.filter(
          (code) => code !== countryCode,
        )
      } else {
        this.selectedBountyCountries = [
          ...this.selectedBountyCountries,
          countryCode,
        ]
      }
    },
    clearBountySelection() {
      this.selectedBountyCountries = []
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
  bountyCountries: CellBountyCountry[]
  selectedBountyCountries: string[]
}
