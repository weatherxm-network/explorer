<script setup lang="ts">
  import { computed } from 'vue'
  import { useDisplay, useTheme } from 'vuetify'
  import { useMapboxStore } from '~/stores/mapboxStore'
  import lightLogo from '~/assets/logo.svg'
  import darkLogo from '~/assets/Dark_Logo.svg'

  const display = ref(useDisplay())
  const theme = useTheme()
  const mapboxStore = useMapboxStore()
  const { fetchRemoteConfig } = useFirebase()
  const remoteConfig = await fetchRemoteConfig()
  const welcomeText = ref('Welcome to')
  const projectsNameText = ref('WeatherXM Explorer')
  const statsHeaderText = computed(() => {
    return remoteConfig?.stats_header_text?._value
      ? remoteConfig?.stats_header_text?._value.replace(
          '%WEATHERXM%',
          `<a
          target="_blank"
          href="https://weatherxm.com"
          class="text-decoration-none d-inline-flex align-center"
          style="color : ${anchorColor.value}"
          >WeatherXM<i class="fa-solid fa-arrow-up-right-from-square pl-1" style="font-size: 12px"></i
        ></a>`
        )
      : `<a
          target="_blank"
          href="https://weatherxm.com"
          class="text-decoration-none d-inline-flex align-center"
          style="color : ${anchorColor.value}"
          >WeatherXM<i class="fa-solid fa-arrow-up-right-from-square pl-1" style="font-size: 12px"></i
        ></a>
        is a community powered web3 weather station network. Search or navigate with the map to
        discover stations deployed all over the world and view real-time weather conditions.`
  })

  const anchorColor = computed(() => {
    return theme.global.name.value === 'dark'
      ? theme.themes.value.dark.colors.darkestBlue
      : theme.themes.value.light.colors.darkestBlue
  })

  const mapsInitialPosition = (clickEvent: any) => {
    mapboxStore.emitInitMapPositionEvent(clickEvent)
  }
</script>

<template>
  <div v-if="!display.smAndDown">
    <!--------------- Logo -------------->
    <div v-if="theme.global.name.value === 'dark'" class="pt-7 pb-6 px-4">
      <img
        style="cursor: pointer"
        class="mb-4"
        alt="logo"
        :src="darkLogo"
        @click="mapsInitialPosition"
      />
    </div>
    <div v-if="theme.global.name.value === 'light'" class="pt-7 pb-6 px-4">
      <img
        style="cursor: pointer"
        class="mb-4"
        alt="logo"
        :src="lightLogo"
        @click="mapsInitialPosition"
      />
    </div>

    <!--------------- Welcome -------------->
    <div class="px-4 text--text" style="font-size: 1.875rem; font-weight: 300; line-height: 36px">
      {{ welcomeText }}
    </div>
    <div
      class="px-4 pb-text--text"
      style="font-size: 1.875rem; font-weight: 600; line-height: 36px"
    >
      {{ projectsNameText }}
    </div>
    <div class="text-body-1 mb-5 mt-6 px-4 anchor-color" style="font-weight: 400">
      <div v-html="statsHeaderText" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .anchor-color:deep(a) {
    color: var(--anchor-color);
  }

  .anchor-color:deep(a) {
    color: var(--anchor-color);
  }
</style>
