<script setup lang="ts">
  import { useDisplay } from 'vuetify'
  import { event } from 'vue-gtag'
  import googlePlayStoreIcon from '~/assets/google_play_store_badge.svg'
  import iosAppStore from '~/assets/ios_app_store_badge.svg'
  import getGAEvent from '~/utils/getGAEvent'

  interface GtagEvent {
    ITEM_ID: string
  }

  const display = ref(useDisplay())
  const boldText = ref('Download our mobile app')
  const lightText = ref('Access full history, forecast and more features on our mobile apps.')

  const redirectToStore = (link: string) => {
    navigateTo(link, {
      open: {
        target: '_blank'
      }
    })
  }

  const contentStyle = computed(() => {
    return { marginTop: `calc(${display.value.height / 2}px - 184px)` }
  })

  // track event
  const trackEvent = (eventKey: string, parameters: GtagEvent) => {
    const validEvent = getGAEvent.getEvent(eventKey, parameters)
    if (validEvent) {
      event(validEvent.eventName, validEvent.parameters)
    }
  }
</script>

<template>
  <div :style="contentStyle">
    <div>
      <div class="text-h5 text-text text-center">{{ boldText }}</div>
      <div class="text-center px-3 text-text">{{ lightText }}</div>
    </div>

    <div class="d-flex align-center justify-center pt-5">
      <img
        :src="googlePlayStoreIcon"
        alt="playstore"
        style="cursor: pointer"
        @click="
          [
            redirectToStore('https://play.google.com/store/apps/details?id=com.weatherxm.app'),
            trackEvent('deviceForecastClickOnAppStoreLink', { ITEM_ID: 'google' })
          ]
        "
      />
      <img
        class="pl-4"
        :src="iosAppStore"
        alt="iosappstore"
        style="cursor: pointer"
        @click="
          [
            redirectToStore('https://apps.apple.com/ca/app/weatherxm/id1629841929'),
            trackEvent('deviceForecastClickOnAppStoreLink', { ITEM_ID: 'apple' })
          ]
        "
      />
    </div>
  </div>
</template>
