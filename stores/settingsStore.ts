import { defineStore } from 'pinia'
import themeHandler from '~/components/Mapbox/widgets/SettingsUtils/theme_handler'
import units from '~/components/Mapbox/widgets/SettingsUtils/units'
export const useSettingsStore = defineStore('SettingsStore', {
  state: () => {
    return {
      theme: themeHandler.getTheme(),
      units: units.getUnits()
    }
  },
  getters: {
    getTheme: (state) => state.theme,
    getUnits: (state) => state.units
  },

  actions: {
    setTheme(theme) {
      this.theme = theme
    },
    setUnits(units) {
      this.units = units
    }
  }
})
