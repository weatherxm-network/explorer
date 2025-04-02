<script setup lang="ts">
  import { useDisplay } from 'vuetify'
  import dayjs from 'dayjs'
  import utc from 'dayjs/plugin/utc'
  import timezone from 'dayjs/plugin/timezone.js'
  import { computed } from 'vue'
  import units from '../../Mapbox/widgets/SettingsUtils/units'
  import type { Device } from '~/components/common/types/common'
  import DetailsCardMeasurement from './DetailsCardMeasurement.vue'
  import index from '~/assets/animations/index'
  import { useSettingsStore } from '~/stores/settingsStore'
  import { hasPartialObservationData } from '~/utils/common'

  import appPromoImg from '~/assets/app-promo.png'

  dayjs.extend(utc)
  dayjs.extend(timezone)

  interface Props {
    device?: Device
  }

  const props = withDefaults(defineProps<Props>(), {
    device: () => ({
      cellIndex: '',
      id: '',
      isActive: true,
      lastWeatherStationActivity: '',
      name: '',
      profile: '',
      timezone: '',
      current_weather: {
        dew_point: 0,
        feels_like: 0,
        humidity: 0,
        icon: 'not_available',
        precipitation: 0,
        precipitation_accumulated: 0,
        solar_irradiance: 0,
        pressure: 0,
        temperature: 0,
        timestamp: '',
        uv_index: 0,
        wind_direction: 0,
        wind_gust: 0,
        wind_speed: 0,
      },
    }),
  })

  const emits = defineEmits(['openWindow'])
  const { trackGAevent } = useGAevents()
  const { calcCurrentWeather } = useWeatherStuff()
  const settingsStore = useSettingsStore()
  const currentUnits = ref(units.calcUnits())

  const displayCurrentMeasurements = ref(
    calcCurrentWeather(props.device.current_weather, currentUnits.value),
  )

  const nav = window.navigator.language

  const display = ref(useDisplay())
  const feelsLikeStaticText = ref('Feels Like')
  const measurements = ref([
    {
      measurement: 'Humidity',
      icon: 'fa-solid fa-droplet-percent',
      unit: 'humidity',
      key: 'humidity',
    },
    {
      measurement: 'Wind',
      icon: 'fa-solid fa-wind',
      unit: 'windSpeed',
      key: 'windSpeed',
    },
    {
      measurement: 'Precip Rate',
      icon: 'fa-solid fa-cloud-drizzle',
      unit: 'precip',
      key: 'precip',
    },
  ])
  const measurements2 = ref([
    {
      measurement: 'Wind Gust',
      icon: 'fa-solid fa-wind',
      unit: 'windSpeed',
      key: 'windGust',
    },
    {
      measurement: 'Pressure (abs)',
      icon: 'fa-solid fa-gauge',
      unit: 'press',
      key: 'press',
    },
    {
      measurement: 'Solar Radiation',
      icon: 'fa-solid fa-sun',
      unit: 'solarIrradiance',
      key: 'solarIrradiance',
    },
  ])
  const measurements3 = ref([
    {
      measurement: 'Daily Precip',
      icon: 'fa-solid fa-cloud-drizzle',
      unit: 'precip',
      key: 'precipAccum',
    },
    {
      measurement: 'Dew Point',
      icon: 'fa-solid fa-droplet-degree',
      unit: 'temp',
      key: 'dewPoint',
    },
    { measurement: 'UV', icon: 'fa-solid fa-sun', unit: 'uv', key: 'uv' },
  ])

  settingsStore.$subscribe(() => {
    currentUnits.value = units.calcUnits()
    // calc measurements
    displayCurrentMeasurements.value = calcCurrentWeather(
      props.device.current_weather,
      currentUnits.value,
    )
  })

  const hasPartialData = computed(() => {
    return hasPartialObservationData(props.device.current_weather)
  })

  const calcedLastUpdated = computed(() => {
    return isBrowserLocaleClockType24h(nav) === true
      ? `Last updated on ${
          props?.device?.current_weather?.timestamp
            ? dayjs
                .tz(
                  dayjs(props.device.current_weather.timestamp),
                  dayjs.tz.guess(),
                )
                .format('MMM DD, YYYY, HH:mm')
            : '-'
        }`
      : `Last updated on ${
          props?.device?.current_weather?.timestamp
            ? dayjs
                .tz(
                  dayjs(props.device.current_weather.timestamp),
                  dayjs.tz.guess(),
                )
                .format('MMM DD, YYYY, hh:mm A')
            : '-'
        }`
  })

  const isBrowserLocaleClockType24h = (languages: string | string[]) => {
    if (!languages) {
      languages = []
    }
    const hr = new Intl.DateTimeFormat(languages, { hour: 'numeric' }).format()
    return Number.isInteger(Number(hr))
  }

  const openWindow = () => {
    emits('openWindow', 2)
    trackGAevent('deviceObservationsClickOnDownloadButton')
  }
</script>

<template>
  <div>
    <h5
      :class="[
        'd-flex justify-space-between align-center w-100 mb-4 mx-4 mt-4',
        'text-body-1 text-darkestBlue font-weight-bold',
      ]"
    >
      Latest Weather
    </h5>
    <div
      v-if="!hasPartialData"
      :class="[
        'ma-4 rounded-xl',
        'bg-layer1 pa-5',
        'd-flex ga-4 justify-space-between align-center',
      ]"
    >
      <CellsWidgetsNoDataIcon />
      <div>
        <h5 class="text-h6 font-weight-bold">No Data</h5>
        <p class="text-subtitle-2">
          We’re unable to show updated station data. Please make sure your
          station is operational and connected to the internet
        </p>
      </div>
    </div>
    <VCard
      v-if="hasPartialData"
      rounded="xl"
      class="ma-4 mt-2 pb-4"
      elevation="0"
      color="layer1"
    >
      <VCardText class="pa-0 pb-0">
        <VSheet
          color="top"
          rounded="xl"
          class="pl-0 pt-4 pb-2 mb-4"
          elevation="1"
        >
          <VRow class="ma-0 pa-0">
            <VCol class="pr-0 pl-0 pt-0 pb-0" align-self="center">
              <!---------------------------- Lottie Icon ------------------------------->
              <div class="d-flex justify-center">
                <client-only>
                  <Vue3Lottie
                    :animation-data="index[displayCurrentMeasurements.lottie]"
                    :height="display.smAndDown ? 50 : 70"
                    :width="display.smAndDown ? 50 : 70"
                  />
                </client-only>
              </div>
              <!---------------------------- Temp ------------------------------->
              <div
                class="text-h3 font-weight-bold d-flex justify-center align-baseline"
              >
                <span class="text-text">
                  {{ displayCurrentMeasurements.temp }}
                </span>
                <span class="text-h5 text-text">{{ currentUnits.temp }}</span>
              </div>
              <!---------------------------- Feels like ------------------------------->
              <div class="text-caption d-flex align-center justify-center">
                <span class="text-darkestBlue">
                  {{ feelsLikeStaticText }}
                </span>
                <span class="text-subtitle-1 pl-2 text-text">
                  {{ displayCurrentMeasurements.feels_like }}
                  <span class="text--text">
                    {{ currentUnits.temp }}
                  </span>
                </span>
              </div>
            </VCol>

            <VCol sm="6" md="6" xs="6" class="pa-0">
              <!---------------------------- Loop in measurements ------------------------------->
              <VRow
                v-for="measurement in measurements"
                :key="measurement.key"
                class="ma-0 pa-0"
              >
                <DetailsCardMeasurement
                  :measurement-metadata="measurement"
                  :unit="currentUnits[measurement.unit]"
                  :device-measurement-value="
                    displayCurrentMeasurements[measurement.key]
                  "
                  :wind-dir-conditional-rendering="
                    measurement.key === 'windSpeed' ||
                    measurement.key === 'windGust'
                      ? {
                          value: displayCurrentMeasurements.windDir,
                          unit: currentUnits.windDir,
                        }
                      : { value: '', currentUnits: '' }
                  "
                />
              </VRow>
            </VCol>
          </VRow>
        </VSheet>
        <VSheet rounded="xl-b" class="pt-2" color="layer1">
          <VRow class="pa-0 ma-0">
            <VCol sm="6" md="6" xs="6" class="pa-0">
              <VRow
                v-for="measurement in measurements2"
                :key="measurement.key"
                class="ma-0 pa-0"
              >
                <DetailsCardMeasurement
                  class="text-truncate"
                  :measurement-metadata="measurement"
                  :unit="currentUnits[measurement.unit]"
                  :device-measurement-value="
                    displayCurrentMeasurements[measurement.key]
                  "
                  :wind-dir-conditional-rendering="
                    measurement.key === 'windSpeed' ||
                    measurement.key === 'windGust'
                      ? {
                          value: displayCurrentMeasurements.windDir,
                          unit: currentUnits.windDir,
                        }
                      : { value: '', currentUnits: '' }
                  "
                />
              </VRow>
            </VCol>
            <VCol sm="6" md="6" xs="6" class="pa-0">
              <VRow
                v-for="measurement in measurements3"
                :key="measurement.key"
                class="ma-0 pa-0"
              >
                <DetailsCardMeasurement
                  class="text-truncate"
                  :measurement-metadata="measurement"
                  :unit="currentUnits[measurement.unit]"
                  :device-measurement-value="
                    displayCurrentMeasurements[measurement.key]
                  "
                  :wind-dir-conditional-rendering="
                    measurement.key === 'windSpeed' ||
                    measurement.key === 'windGust'
                      ? {
                          value: displayCurrentMeasurements.windDir,
                          unit: currentUnits.windDir,
                        }
                      : { value: '', currentUnits: '' }
                  "
                />
              </VRow>
            </VCol>
          </VRow>
          <div class="d-flex justify-end px-5 pt-5 text-darkGrey">
            {{ calcedLastUpdated }}
          </div>
        </VSheet>
      </VCardText>
    </VCard>

    <div :class="['bg-blueTint', 'pa-4 ma-4 mt-6 rounded-xl']">
      <h5 :class="['text-h6']">Get the WeatherXM app to access:</h5>
      <div :class="['d-flex justify-space-between align-center']">
        <!-- selling points section -->
        <div :class="['w-50']">
          <div
            :class="[
              'd-flex justify-start align-center ga-2',
              'text-subtitle-2',
            ]"
          >
            <i class="fa-solid fa-check text-success" />
            Historical data
          </div>
          <div
            :class="[
              'd-flex justify-start align-center ga-2',
              'text-subtitle-2',
            ]"
          >
            <i class="fa-solid fa-check text-success" />
            Daily & hourly forecast
          </div>
          <div
            :class="[
              'd-flex justify-start align-center ga-2',
              'text-subtitle-2',
            ]"
          >
            <i class="fa-solid fa-check text-success" />
            Real-time weather data
          </div>
          <div
            :class="[
              'd-flex justify-start align-center ga-2',
              'text-subtitle-2',
            ]"
          >
            <i class="fa-solid fa-check text-success" />
            many more...
          </div>
          <button
            :class="[
              'px-5 py-2 rounded-lg mt-4',
              'bg-primary font-weight-bold text-subtitle-2',
              'cursor-pointer',
            ]"
            @click="openWindow"
          >
            Download App
          </button>
        </div>

        <!-- image section -->
        <div
          :class="['w-50 h-100 position-relative']"
          :style="{ minHeight: '140px' }"
        >
          <img
            :src="appPromoImg"
            :class="['position-absolute top-0 left-0 right']"
            :style="{ transform: 'translateX(-10%)' }"
          />
        </div>
      </div>
    </div>
  </div>
</template>
