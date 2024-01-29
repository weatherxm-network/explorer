import { defineStore } from 'pinia'

export const useMobileStore = defineStore('MobileStore', {
  state: () => {
    return {
      pageState: false
    }
  },
  getters: {
    getPageState: (state) => state.pageState
  },

  actions: {
    setPageState(state) {
      this.pageState = state
    }
  }
})
