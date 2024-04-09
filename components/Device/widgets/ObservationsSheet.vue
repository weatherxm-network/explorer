<script setup lang="ts">
  import { useDisplay } from 'vuetify'
  import dayjs from 'dayjs'
  import utc from 'dayjs/plugin/utc'
  import timezone from 'dayjs/plugin/timezone.js'
  import { computed } from 'vue'
  import units from '../../Mapbox/widgets/SettingsUtils/units'
  import type { Device } from '../types/device'
  import DetailsCardMeasurement from './DetailsCardMeasurement.vue'
  import index from '~/assets/animations/index'
  import { useSettingsStore } from '~/stores/settingsStore'

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
        wind_speed: 0
      }
    })
  })

  const emits = defineEmits(['openWindow'])
  const { trackGAevent } = useGAevents()
  const { calcCurrentWeather } = useWeatherStuff()
  const settingsStore = useSettingsStore()
  const currentUnits = ref(units.calcUnits())

  const displayCurrentMeasurements = ref(
    calcCurrentWeather(props.device.current_weather, currentUnits.value)
  )

  const nav = window.navigator.language

  const display = ref(useDisplay())
  const viewHistoricalDataButtonText = ref('View Historical Data')
  const footerTextFirstLine = ref('Download WeatherXM app')
  const footerTextSecondLine = ref('to see historical & forecast data')
  const downloadButtonText = ref('Download')
  const feelsLikeStaticText = ref('Feels Like')
  const measurements = ref([
    {
      measurement: 'Humidity',
      icon: 'fa-solid fa-droplet-percent',
      unit: 'humidity',
      key: 'humidity'
    },
    { measurement: 'Wind', icon: 'fa-solid fa-wind', unit: 'windSpeed', key: 'windSpeed' },
    {
      measurement: 'Precip Rate',
      icon: 'fa-solid fa-cloud-drizzle',
      unit: 'precip',
      key: 'precip'
    }
  ])
  const measurements2 = ref([
    {
      measurement: 'Wind Gust',
      icon: 'fa-solid fa-wind',
      unit: 'windSpeed',
      key: 'windGust'
    },
    {
      measurement: 'Pressure (abs)',
      icon: 'fa-solid fa-gauge',
      unit: 'press',
      key: 'press'
    },
    {
      measurement: 'Solar Radiation',
      icon: 'fa-solid fa-sun',
      unit: 'solarIrradiance',
      key: 'solarIrradiance'
    }
  ])
  const measurements3 = ref([
    {
      measurement: 'Daily Precip',
      icon: 'fa-solid fa-cloud-drizzle',
      unit: 'precip',
      key: 'precipAccum'
    },
    {
      measurement: 'Dew Point',
      icon: 'fa-solid fa-droplet-degree',
      unit: 'temp',
      key: 'dewPoint'
    },
    { measurement: 'UV', icon: 'fa-solid fa-sun', unit: 'uv', key: 'uv' }
  ])

  settingsStore.$subscribe(() => {
    currentUnits.value = units.calcUnits()
    // calc measurements
    displayCurrentMeasurements.value = calcCurrentWeather(
      props.device.current_weather,
      currentUnits.value
    )
  })

  const calcedLastUpdated = computed(() => {
    return isBrowserLocaleClockType24h(nav) === true
      ? `Last updated on ${
          props?.device?.current_weather?.timestamp
            ? dayjs
                .tz(dayjs(props.device.current_weather.timestamp), dayjs.tz.guess())
                .format('MMM DD, YYYY, HH:mm')
            : '-'
        }`
      : `Last updated on ${
          props?.device?.current_weather?.timestamp
            ? dayjs
                .tz(dayjs(props.device.current_weather.timestamp), dayjs.tz.guess())
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
  }
</script>

<template>
  <VCard rounded="xl" class="ma-4 mt-2" elevation="0" color="layer1">
    <VCardText class="pa-0 pb-0">
      <VSheet color="top" rounded="xl" class="pl-0 pt-4 pb-2 mb-2" elevation="4">
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
            <div class="text-h3 font-weight-bold d-flex justify-center align-baseline">
              <span class="text-text">{{ displayCurrentMeasurements.temp }}</span>
              <span class="text-h5 text-text">{{ currentUnits.temp }}</span>
            </div>
            <!---------------------------- Feels like ------------------------------->
            <div class="text-caption d-flex align-center justify-center">
              <span class="text-darkestBlue">{{ feelsLikeStaticText }}</span
              ><span class="text-subtitle-1 pl-2 text-text"
                >{{ displayCurrentMeasurements.feels_like
                }}<span class="text--text">{{ currentUnits.temp }}</span></span
              >
            </div>
          </VCol>

          <VCol sm="6" md="6" xs="6" class="pa-0">
            <!---------------------------- Loop in measurements ------------------------------->
            <VRow v-for="measurement in measurements" :key="measurement.key" class="ma-0 pa-0">
              <DetailsCardMeasurement
                :measurement-metadata="measurement"
                :unit="currentUnits[measurement.unit]"
                :device-measurement-value="displayCurrentMeasurements[measurement.key]"
                :wind-dir-conditional-rendering="
                  measurement.key === 'windSpeed' || measurement.key === 'windGust'
                    ? { value: displayCurrentMeasurements.windDir, unit: currentUnits.windDir }
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
            <VRow v-for="measurement in measurements2" :key="measurement.key" class="ma-0 pa-0">
              <DetailsCardMeasurement
                class="text-truncate"
                :measurement-metadata="measurement"
                :unit="currentUnits[measurement.unit]"
                :device-measurement-value="displayCurrentMeasurements[measurement.key]"
                :wind-dir-conditional-rendering="
                  measurement.key === 'windSpeed' || measurement.key === 'windGust'
                    ? { value: displayCurrentMeasurements.windDir, unit: currentUnits.windDir }
                    : { value: '', currentUnits: '' }
                "
              />
            </VRow>
          </VCol>
          <VCol sm="6" md="6" xs="6" class="pa-0">
            <VRow v-for="measurement in measurements3" :key="measurement.key" class="ma-0 pa-0">
              <DetailsCardMeasurement
                class="text-truncate"
                :measurement-metadata="measurement"
                :unit="currentUnits[measurement.unit]"
                :device-measurement-value="displayCurrentMeasurements[measurement.key]"
                :wind-dir-conditional-rendering="
                  measurement.key === 'windSpeed' || measurement.key === 'windGust'
                    ? { value: displayCurrentMeasurements.windDir, unit: currentUnits.windDir }
                    : { value: '', currentUnits: '' }
                "
              />
            </VRow>
          </VCol>
        </VRow>
        <div class="d-flex justify-end px-5 pt-5 text-darkGrey">
          {{ calcedLastUpdated }}
        </div>
        <div class="pa-5">
          <VBtn
            :block="true"
            height="50"
            variant="outlined"
            :disabled="true"
            color="midGrey"
            style="border-radius: 10px; border-width: 2px"
            ><VSheet
              color="midGrey"
              class="w-100 h-100 text-none font-weight-bold text--midGrey"
              style="letter-spacing: normal"
              >{{ viewHistoricalDataButtonText }}</VSheet
            ></VBtn
          >
        </div>
      </VSheet>
    </VCardText>
  </VCard>

  <VCard class="ma-4" style="border-radius: 16px" color="blueTint" elevation="0">
    <VCardText class="pa-0 ma-0">
      <VRow class="ma-0 pa-0" align="center" justify="space-between">
        <VCol class="ma-0 pr-0 pt-2 pb-2" :class="display.smAndDown ? 'pl-3' : 'pl-4'" cols="8">
          <div class="text-text d-flex align-center font-weight-regular">
            <div style="letter-spacing: normal">{{ footerTextFirstLine }}</div>
          </div>
          <div style="letter-spacing: normal" class="text-text font-weight-regular">
            {{ footerTextSecondLine }}
          </div>
        </VCol>
        <VCol
          class="ma-0 pa-0 pr-2 pt-2 pb-2"
          :class="display.smAndDown ? 'pl-2' : 'pl-3'"
          :cols="4"
        >
          <VBtn
            color="primary"
            class="text-top text-none px-5 pt-4 pb-4"
            elevation="0"
            style="
              height: 100%;
              width: 100%;
              font-weight: 700;
              border-radius: 8px;
              letter-spacing: normal;
            "
            @click="[openWindow(), trackGAevent('deviceObservationsClickOnDownloadButton')]"
            >{{ downloadButtonText }}</VBtn
          >
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>
