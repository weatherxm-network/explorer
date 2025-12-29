import { defineStore } from 'pinia'

export type OverlayMode = 'capacity_quality' | 'targeted_rollouts'
export type MapStyleId = 'mapbox://styles/mapbox/dark-v11' | 'mapbox://styles/mapbox/light-v11' | 'mapbox://styles/mapbox/satellite-v9' | 'mapbox://styles/mapbox/outdoors-v12'

interface MapControlsState {
    activeStyleId: MapStyleId
    overlayMode: OverlayMode
    cellBountiesEnabled: boolean
    panelOpen: boolean
}

export const useMapControlsStore = defineStore('MapControlsStore', {
    state: (): MapControlsState => ({
        activeStyleId: 'mapbox://styles/mapbox/dark-v11', // Default to Dark
        overlayMode: 'capacity_quality', // Default as per current app behavior roughly
        cellBountiesEnabled: true,
        panelOpen: false
    }),

    getters: {
        getActiveStyleId: (state) => state.activeStyleId,
        getOverlayMode: (state) => state.overlayMode,
        isCellBountiesEnabled: (state) => state.cellBountiesEnabled,
        isPanelOpen: (state) => state.panelOpen,


        // Helper to determine if any overlay is visually active (for badge)
        isAnyOverlayActive: (state) =>
            state.overlayMode === 'capacity_quality' ||
            state.overlayMode === 'targeted_rollouts',
    },

    actions: {
        setMapStyle(styleId: MapStyleId) {
            this.activeStyleId = styleId
        },

        setOverlayMode(mode: OverlayMode) {
            this.overlayMode = mode
        },

        toggleCellBounties() {
            this.cellBountiesEnabled = !this.cellBountiesEnabled
        },

        setCellBounties(enabled: boolean) {
            this.cellBountiesEnabled = enabled
        },

        togglePanel() {
            this.panelOpen = !this.panelOpen
        },

        setPanelOpen(isOpen: boolean) {
            this.panelOpen = isOpen
        }
    }
})
