<script setup lang="ts">
  import { useDisplay } from 'vuetify'
  import { onMounted, onUnmounted, computed, reactive } from 'vue'
  import LottieComponent from '../../common/LottieComponent.vue'
  import NoInternetComponent from '../../common/NoInternetComponent.vue'
  import CardHeader from './CardHeader.vue'
  import MobileHeader from './MobileHeader.vue'
  import WeatherStations from './WeatherStations.vue'
  import wxmApi from '~/api/wxmApi'
  import { useMobileStore } from '~/stores/mobileStore'
  import type { NetworkStatsResponse } from '../types/stats'

  const mobileStore = useMobileStore()
  const display = ref(useDisplay())
  const route = useRoute()
  const loading = ref(true)
  const showNoInternetComponent = ref(false)
  const boldText = ref('SERVICE UNAVAILABLE')
  const lightText = ref(
    'Server busy, site may have moved or you lost your dial-up Internet connection',
  )

  let weatherStations: NetworkStatsResponse['weather_stations'] = reactive(
    {} as NetworkStatsResponse['weather_stations'],
  )

  const animationContainerHeight = computed(() => {
    return display.value.smAndDown
      ? { marginTop: `calc(${display.value.height / 2}px - 120px)` }
      : { marginTop: `calc(${display.value.height / 2}px - 400px)` }
  })
  const errorContainerHeight = computed(() => {
    return display.value.smAndDown
      ? { marginTop: `calc(${display.value.height / 2}px - 157px)` }
      : { marginTop: `calc(${display.value.height / 2}px - 417px)` }
  })

  onMounted(() => {
    if (
      display.value.smAndDown &&
      route.fullPath === '/stats/stations-growth'
    ) {
      mobileStore.setPageState(true)
    }
    fillData()
    handlePaging()
  })

  const fillData = async () => {
    showNoInternetComponent.value = false
    loading.value = true

    await wxmApi
      .getNetStats()
      .then((response) => {
        weatherStations = response.weather_stations

        loading.value = false
      })
      .catch(() => {
        loading.value = false
        showNoInternetComponent.value = true
      })
  }

  const handlePopstate = () => {
    if (
      display.value.smAndDown &&
      route.fullPath === '/stats/stations-growth'
    ) {
      mobileStore.setPageState(false)
      navigateTo('/stats')
    }
  }

  const handlePaging = () => {
    window.addEventListener('popstate', handlePopstate)
  }

  onUnmounted(() => {
    window.removeEventListener('popstate', handlePopstate)
  })

  const reloadComponent = () => {
    fillData()
  }
</script>
<template>
  <VCard
    class="w-100 h-100"
    :color="display.smAndDown ? `background` : `blueTint`"
  >
    <!--------------- Card header -------------->
    <CardHeader />
    <!--------------- Main Content -------------->
    <VCardText class="ma-0 pa-0 h-100 w-100">
      <VCard
        height="100%"
        class="w-100"
        color="background"
        elevation="0"
        style="
          border-top-left-radius: 32px;
          border-top-right-radius: 32px;
          border-bottom-left-radius: 0px;
          border-bottom-right-radius: 0px;
        "
      >
        <MobileHeader />

        <div v-if="!display.smAndDown" class="pa-8 pb-3 d-flex align-center">
          <i
            class="fa fa-arrow-left text-primary mr-4 cursor-pointer"
            style="font-size: 1.2rem"
            @click="() => navigateTo('/stats')"
          ></i>
          <span class="ma-0 pa-0 font-weight-bold" style="font-size: 1.577rem">
            {{ 'Network growth' }}
          </span>
        </div>

        <VCardText class="ma-0 pa-0">
          <!------- Loading lottie ------>
          <div
            v-if="loading"
            class="h-100 w-100 d-flex align-center justify-center"
            :style="animationContainerHeight"
          >
            <LottieComponent
              :lottie-name="'loaderLight'"
              :bold-text="''"
              :light-text="''"
            />
          </div>

          <!------- No internet component ------>
          <div
            v-if="!loading && showNoInternetComponent"
            class="h-100 w-100 d-flex align-center justify-center"
            :style="errorContainerHeight"
          >
            <NoInternetComponent
              :bold-text="boldText"
              :light-text="lightText"
              @reload-component="reloadComponent"
            />
          </div>

          <div
            v-if="!loading && !showNoInternetComponent"
            :class="display.smAndDown ? `pa-5` : `pa-4`"
          >
            <WeatherStations :weather-stations="weatherStations" />
          </div>
        </VCardText>
      </VCard>
    </VCardText>
  </VCard>
</template>
