<script setup lang="ts">
  import { computed } from 'vue'
  import { useDisplay, useTheme } from 'vuetify'
  import { useMapboxStore } from '~/stores/mapboxStore'
  import lightLogo from '~/assets/logo.svg'
  import darkLogo from '~/assets/Dark_Logo.svg'

  const route = useRoute()
  const display = ref(useDisplay())
  const theme = useTheme()
  const mapboxStore = useMapboxStore()
  const { fetchRemoteConfig } = useFirebase()
  const remoteConfig = await fetchRemoteConfig()
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
          ></a>`,
        )
      : `WeatherXM is a community powered web3 weather station network. <br><br>
        Check out <a
          target="_blank"
          href="https://weatherxm.com"
          class="text-decoration-none d-inline-flex align-center"
          style="color : ${anchorColor.value}"
          >here<i class="fa-solid fa-arrow-up-right-from-square pl-1" style="font-size: 12px"></i
        ></a>, WeatherXM hardware, B2B API for historical weather data, current observations form our weather station network and hyper-local forecasts.<br><br>
        Check out <a
          target="_blank"
          href="https://weatherxm.network"
          class="text-decoration-none d-inline-flex align-center"
          style="color : ${anchorColor.value}"
          >here<i class="fa-solid fa-arrow-up-right-from-square pl-1" style="font-size: 12px"></i
        ></a>, WeatherXM governance, rewards allocation and network updates.`
  })

  const isInNestedStats = computed(() => {
    const statSubRoutes = ['/stats/stations-growth', '/stats/token-metrics']
    return statSubRoutes.indexOf(route.path) > -1
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
    <div v-if="theme.global.name.value === 'dark'" class="pt-7 pb-2 px-4">
      <img
        style="cursor: pointer"
        class=""
        alt="logo"
        :src="darkLogo"
        @click="mapsInitialPosition"
      />
    </div>
    <div v-if="theme.global.name.value === 'light'" class="pt-7 pb-2 px-4">
      <img
        style="cursor: pointer"
        class=""
        alt="logo"
        :src="lightLogo"
        @click="mapsInitialPosition"
      />
    </div>

    <!--------------- Welcome -------------->
    <div
      v-if="!isInNestedStats"
      class="text-body-1 mb-5 px-4 anchor-color"
      style="font-weight: 400"
    >
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
