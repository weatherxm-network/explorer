import { defineStore } from 'pinia'

interface DrawerState {
  isDesktopDrawerOpen: boolean
}

export const useDrawerStore = defineStore('DrawerStore', {
  state: (): DrawerState => ({
    isDesktopDrawerOpen: true,
  }),
  getters: {
    getIsDesktopDrawerOpen: (state) => state.isDesktopDrawerOpen,
  },
  actions: {
    setDesktopDrawerState(isOpen: boolean) {
      this.isDesktopDrawerOpen = isOpen
    },
    toggleDesktopDrawerState() {
      this.isDesktopDrawerOpen = !this.isDesktopDrawerOpen
    },
  },
})
