<script setup lang="ts">
  import dayjs from 'dayjs'
  import relativeTime from 'dayjs/plugin/relativeTime'
  import { computed } from 'vue'
  import { useTheme } from 'vuetify'
  import units from '../../Mapbox/widgets/SettingsUtils/units'
  import DeviceCardIcon from '../../common/DeviceCardIcon.vue'
  import type { Device } from '../types/cell'
  import DeviceCardStateActive from './DeviceCardStateActive.vue'
  import DeviceCardStateInActive from './DeviceCardStateInActive.vue'
  import { useSettingsStore } from '~/stores/settingsStore'

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
        wind_speed: 0
      }
    })
  })

  const { calcCurrentWeather } = useWeatherStuff()
  const isHovering = ref(2)
  const theme = useTheme()
  const settingsStore = useSettingsStore()
  const currentUnits = ref(units.calcUnits())
  const currentDeviceMeasurements = ref(
    calcCurrentWeather(props.device.current_weather, currentUnits.value)
  )

  settingsStore.$subscribe(() => {
    currentUnits.value = units.calcUnits()

    // recalc measurements
    currentDeviceMeasurements.value = calcCurrentWeather(
      props.device.current_weather,
      currentUnits.value
    )
  })

  const calcTimestampSheetColor = computed(() => {
    if (theme.global.name.value === 'dark') {
      return 'blueTint'
    } else if (props.device.isActive) {
      return 'successTint'
    } else {
      return 'errorTint'
    }
  })

  const calcTimestampTextColor = computed(() => {
    if (theme.global.name.value === 'dark') {
      if (props.device.isActive) {
        return 'text-success'
      } else {
        return 'text-error'
      }
    } else {
      return 'text-text'
    }
  })

  const timestamp = computed(() => {
    return props?.device?.lastWeatherStationActivity
      ? dayjs(props.device.lastWeatherStationActivity).fromNow()
      : '-'
  })

  const inActiveBorderStylesCard = computed(() => {
    return !props.device.isActive
      ? {
          'border-left': '1px solid red',
          'border-right': '1px solid red',
          'border-bottom': '1px solid red',
          'border-top': '1px solid red'
        }
      : {}
  })
</script>

<template>
  <!---------------------------- Device Card ------------------------------->
  <VCard
    class="transition-swing"
    :class="props.device.isActive ? 'pa-5' : 'pa-0'"
    rounded="xl"
    color="top"
    :elevation="isHovering"
    :style="inActiveBorderStylesCard"
    @mouseover="isHovering = 5"
    @mouseleave="isHovering = 2"
  >
    <VCardTitle class="pa-0 pb-1">
      <!---------------------------- Device name ------------------------------->
      <VRow class="ma-0 pa-0 w-100 pb-2" :class="props.device.isActive ? 'px-0 pt-0' : 'px-5 pt-5'">
        <div class="font-weight-bold text-primary" style="font-size: 1.108rem">
          {{ props.device.name }}
        </div>
      </VRow>
      <!---------------------------- Address ------------------------------->
      <VRow
        class="pa-0 ma-0"
        no-gutters
        style="flex-wrap: nowrap"
        :class="props.device.isActive ? 'px-0' : 'px-5'"
      >
        <div style="min-width: 100px" class="flex-shrink-1 flex-grow-0">
          <VSheet
            class="d-flex align-center px-2 py-2 text-text text-caption"
            color="blueTint"
            style="border-radius: 10px"
          >
            <div class="text-body-1 d-flex align-center">
              <i class="fa-regular fa-hexagon"></i>
            </div>

            <span class="pl-3 text-truncate">
              {{ deviceAddress }}
            </span>
          </VSheet>
        </div>

        <VCol cols="auto" class="flex-grow-0 flex-shrink-1 pl-2">
          <VSheet
            class="d-flex align-center px-2 py-1 text-caption"
            :color="calcTimestampSheetColor"
            style="border-radius: 10px"
          >
            <div>
              <DeviceCardIcon :is-active="props.device.isActive" :profile="props.device.profile" />
            </div>
            <div class="pl-3 text-no-wrap" :class="calcTimestampTextColor">
              {{ timestamp }}
            </div>
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
        :units="currentUnits"
        :device-measurements="currentDeviceMeasurements"
      />

      <DeviceCardStateInActive v-if="!props.device.isActive" />
    </VCardText>
  </VCard>
</template>
