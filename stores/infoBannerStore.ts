import { defineStore } from 'pinia'

import type { InfoBannerConfig } from '~/components/common/types/common'

export const useInfoBannerStore = defineStore('InfoBannerStore', {
  state: (): InfoBannerState => ({
    id: undefined,
    dismissed: false,
    isDismissable: undefined,
    showActionBtn: undefined,
    actionBtnUrl: undefined,
    actionBtnLabel: undefined,
    title: undefined,
    message: undefined,
    backgroundUrl: undefined,
    showBanner: undefined,
    elementHeight: 0,
  }),
  getters: {
    isInfoBannerShown(): boolean {
      if (!this.showBanner) return false
      if (this.isDismissable && this.dismissed) return false
      return true
    },
  },
  actions: {
    setDismissed() {
      this.dismissed = true
    },
    updateHeight(height: number) {
      this.elementHeight = height
    },
    updateState(data: InfoBannerConfig) {
      if (data.web_info_banner_id?.asString()) {
        this.dismissed =
          this.id !== data.web_info_banner_id.asString()
            ? false
            : this.dismissed
        this.id = data.web_info_banner_id?.asString()
        this.isDismissable = data.web_info_banner_dismissable?.asBoolean()
        this.showActionBtn = data.web_info_button_show?.asBoolean()
        this.actionBtnUrl = data.web_info_banner_url?.asString()
        this.actionBtnLabel = data.web_info_banner_action_label?.asString()
        this.title = data.web_info_banner_title?.asString()
        this.message = data.web_info_banner_message?.asString()
        this.backgroundUrl = data.web_info_banner_background_url?.asString()
        this.showBanner = data.web_info_banner_show?.asBoolean()
      }
    },
  },
  persist: {
    storage: piniaPluginPersistedstate.localStorage(),
  },
})

interface InfoBannerState {
  id?: string
  dismissed?: boolean
  isDismissable?: boolean
  showActionBtn?: boolean
  actionBtnUrl?: string
  actionBtnLabel?: string
  title?: string
  message?: string
  backgroundUrl?: string
  showBanner?: boolean
  elementHeight: number
}
