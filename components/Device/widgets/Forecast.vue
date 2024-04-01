<script setup lang="ts">
  import { useDisplay } from 'vuetify'
  import googlePlayStoreIcon from '~/assets/google_play_store_badge.svg'
  import iosAppStore from '~/assets/ios_app_store_badge.svg'

  const { trackGAevent } = useGAevents()
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
            trackGAevent('deviceForecastClickOnAppStoreLink', { ITEM_ID: 'google' })
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
            trackGAevent('deviceForecastClickOnAppStoreLink', { ITEM_ID: 'apple' })
          ]
        "
      />
    </div>
  </div>
</template>
