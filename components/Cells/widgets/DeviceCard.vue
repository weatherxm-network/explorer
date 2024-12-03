<script setup lang="ts">
  import dayjs from 'dayjs'
  import relativeTime from 'dayjs/plugin/relativeTime'
  import { computed } from 'vue'
  import units from '../../Mapbox/widgets/SettingsUtils/units'
  import DeviceCardIcon from '../../common/DeviceCardIcon.vue'
  import type { Device, Units } from '~/components/common/types/common'
  import DeviceCardStateActive from './DeviceCardStateActive.vue'
  import DeviceCardStateInActive from './DeviceCardStateInActive.vue'
  import { useSettingsStore } from '~/stores/settingsStore'

  import qodGreen from '~/assets/metrics/qod-green.svg'
  import qodOrange from '~/assets/metrics/qod-orange.svg'
  import qodRed from '~/assets/metrics/qod-red.svg'

  import polGreen from '~/assets/metrics/pol-green.svg'
  import polOrange from '~/assets/metrics/pol-orange.svg'
  import polGrey from '~/assets/metrics/pol-grey.svg'
  import polRed from '~/assets/metrics/pol-red.svg'

  import errorHex from '~/assets/errorHex.svg'

  dayjs.extend(relativeTime)

  interface Props {
    device?: Device
    deviceAddress?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    deviceName: '-',
    deviceAddress: '-',
    profile: '',
    isActive: true,
    lastActiveAt: '',
    icon: 'not_available',
    device: () => ({
      cellIndex: '',
      id: '',
      isActive: true,
      lastWeatherStationActivity: '',
      name: '',
      profile: '',
      timezone: '',
      bundle: {
        name: 'm5',
        title: 'M5',
        connectivity: 'wifi',
        ws_model: 'WS1000',
        gw_model: 'WG1000',
      },
      current_weather: {
        dew_point: 0,
        feels_like: 0,
        humidity: 0,
        icon: 'not_available',
        precipitation: 0,
        precipitation_accumulated: 0,
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

  const { calcCurrentWeather } = useWeatherStuff()
  const isHovering = ref(2)
  const settingsStore = useSettingsStore()
  const currentUnits = ref(units.calcUnits())
  const currentDeviceMeasurements = ref(
    calcCurrentWeather(props.device.current_weather, currentUnits.value),
  )

  const qodIcon = computed(() => {
    if (props.device.metrics.qod_score < 20) return qodRed
    if (props.device.metrics.qod_score < 80) return qodOrange
    return qodGreen
  })

  const polIcon = computed(() => {
    if (
      !props.device.metrics.pol_reason &&
      !props.device.metrics.qod_score &&
      !props.device.metrics.ts
    )
      return polGrey
    if (props.device.metrics.pol_reason === 'NO_LOCATION_DATA') return polRed
    if (props.device.metrics.pol_reason === 'LOCATION_NOT_VERIFIED')
      return polOrange
    return polGreen
  })

  settingsStore.$subscribe(() => {
    currentUnits.value = units.calcUnits()

    // recalc measurements
    currentDeviceMeasurements.value = calcCurrentWeather(
      props.device.current_weather,
      currentUnits.value,
    )
  })

  const calcTimestampBulletColor = computed(() => {
    if (props.device.isActive) {
      return 'bg-success'
    } else {
      return 'bg-error'
    }
  })

  const timestamp = computed(() => {
    return props?.device?.lastWeatherStationActivity
      ? dayjs(props.device.lastWeatherStationActivity).fromNow()
      : 'N/A'
  })

  const inActiveBorderStylesCard = computed(() => {
    if (
      !props.device.metrics.qod_score ||
      props.device.metrics.qod_score < 20
    ) {
      return {
        'border-left': '1px solid red',
        'border-right': '1px solid red',
        'border-bottom': '1px solid red',
        'border-top': '1px solid red',
      }
    }

    if (
      props.device.metrics.qod_score < 80 ||
      props.device.metrics.pol_reason === 'LOCATION_NOT_VERIFIED'
    ) {
      return {
        'border-left': '1px solid orange',
        'border-right': '1px solid orange',
        'border-bottom': '1px solid orange',
        'border-top': '1px solid orange',
      }
    }

    // default state has no border colors
    return {}
  })
</script>

<template>
  <!---------------------------- Device Card ------------------------------->
  <VCard
    :class="['transition-swing', props.device.isActive ? 'pa-0' : 'pa-0']"
    rounded="xl"
    color="top"
    :elevation="isHovering"
    :style="inActiveBorderStylesCard"
    @mouseover="isHovering = 5"
    @mouseleave="isHovering = 2"
  >
    <VCardTitle class="pa-0 pb-1">
      <!---------------------------- Device name ------------------------------->
      <VRow
        class="ma-0 pa-0 w-100 pb-2"
        :class="props.device.isActive ? 'px-5 pt-5' : 'px-5 pt-5'"
      >
        <div class="font-weight-bold" style="font-size: 1.108rem">
          {{ props.device.name }}
        </div>
      </VRow>
      <!---------------------------- Address ------------------------------->
      <VRow
        class="pa-0 px-5 ma-0 ga-2"
        no-gutters
        style="flex-wrap: nowrap"
        :class="props.device.isActive ? 'px-0' : 'px-5'"
      >
        <!-- Activity status -->
        <div
          v-if="!props.device.isActive"
          class="d-flex justify-start ga-1 errorTint align-center bg-errorTint pa-2 rounded-lg"
          :style="{ height: '36px' }"
        >
          <img :src="errorHex" />
          <p :style="{ fontSize: '12px', lineHeight: '16px' }">Inactive</p>
        </div>

        <!-- Timestamp -->
        <VCol cols="auto" class="flex-grow-0 flex-shrink-1">
          <VSheet
            class="d-flex align-center pa-2 text-caption ga-2"
            color="blueTint"
            style="border-radius: 10px"
          >
            <div
              :class="calcTimestampBulletColor"
              style="min-width: 12px; min-height: 12px; border-radius: 50%"
            ></div>
            <div class="text-no-wrap">
              {{ timestamp }}
            </div>
          </VSheet>
        </VCol>

        <!-- Device type -->
        <VCol cols="auto" class="flex-grow-0 flex-shrink-1">
          <VSheet
            class="d-flex ga-1 align-center pa-2 text-caption"
            color="blueTint"
            style="border-radius: 10px"
          >
            <DeviceCardIcon
              :is-active="props.device.isActive"
              :bundle="props.device.bundle"
            />

            {{
              props.device.bundle.title.charAt(0).toUpperCase() +
              props.device.bundle.title.substring(1).toLowerCase()
            }}
          </VSheet>
        </VCol>
      </VRow>
    </VCardTitle>

    <VCardText class="pa-0 ma-0">
      <DeviceCardStateActive
        v-if="props.device.isActive"
        :icon="
          props?.device?.current_weather?.icon
            ? props.device.current_weather.icon.replaceAll('-', '_')
            : 'not_available'
        "
        :units="currentUnits as Units"
        :device-measurements="currentDeviceMeasurements"
      />

      <!-- No Data card -->
      <DeviceCardStateInActive v-if="!props.device.isActive" />

      <!-- Footer card health metrics -->
      <div class="pa-4 px-5 d-flex bg-blueTint ga-4">
        <div class="d-flex justify-start align-center ga-2">
          <img :src="qodIcon" :style="{ width: '18px', height: '18px' }" />
          <p :style="{ fontSize: '12px', lineHeight: '16px' }">
            Data Quality {{ props.device.metrics.qod_score }}%
          </p>
        </div>
        <div class="d-flex justify-start align-center ga-2 flex-grow-1">
          <img :src="polIcon" :style="{ width: '18px', height: '18px' }" />
          <p :style="{ fontSize: '12px', lineHeight: '16px' }">
            {{ props.device.address }}
          </p>
        </div>
      </div>
    </VCardText>
  </VCard>
</template>
