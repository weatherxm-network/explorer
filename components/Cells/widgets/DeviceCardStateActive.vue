<script setup lang="ts">
  import { useDisplay } from 'vuetify'
  import type { Measurements } from '../types/cell'
  import type { Units } from '~/components/common/types/common'
  import DeviceCardMeasurement from './DeviceCardMeasurements.vue'
  import index from '~/assets/animations/index'

  interface Props {
    icon?: string
    units?: Units
    deviceMeasurements?: Measurements
  }

  const props = withDefaults(defineProps<Props>(), {
    icon: 'not_available',
    units: () => ({
      humidity: '',
      precip: '',
      press: '',
      solarIrradiance: '',
      temp: '',
      uv: '',
      windDir: '',
      windSpeed: '',
    }),
    deviceMeasurements: () => ({
      dewPoint: '',
      feels_like: '',
      humidity: '',
      lottie: '',
      precip: '',
      precipAccum: '',
      press: '',
      solarIrradiance: '',
      temp: '',
      time: '',
      timestamp: '',
      uv: '',
      windDir: '',
      windGust: '',
      windSpeed: '',
    }),
  })

  const display = ref(useDisplay())
  const measurements = ref([
    {
      measurement: 'Temperature',
      icon: 'fa-solid fa-temperature-three-quarters',
      unit: 'temperature',
      key: 'temp',
    },
    {
      measurement: 'Wind',
      icon: 'fa-solid fa-wind',
      unit: 'windSpeed',
      key: 'windSpeed',
    },
    {
      measurement: 'Humidity',
      icon: 'fa-solid fa-droplet-percent',
      unit: 'humidity',
      key: 'humidity',
    },
    {
      measurement: 'Precip Rate',
      icon: 'fa-solid fa-cloud-drizzle',
      unit: 'precip',
      key: 'precip',
    },
  ])
</script>

<template>
  <VSheet color="top" rounded="xl" class="pl-0">
    <div class="d-flex justify-space-between align-center pa-4">
      <div>
        <client-only>
          <Vue3Lottie
            :animation-data="index[props.icon]"
            :height="display.smAndDown ? 50 : 70"
            :width="display.smAndDown ? 50 : 70"
          />
        </client-only>
      </div>
      <div class="ml-4">
        <div class="d-flex justify-start align-center ga-4 flex-grow-1">
          <DeviceCardMeasurement
            class="flex-grow-1"
            :measurement-metadata="measurements[0]"
            :unit="props.units[measurements[0].unit]"
            :device-measurement-value="deviceMeasurements[measurements[0].key]"
            :wind-dir-conditional-rendering="
              measurements[0].key === 'windSpeed'
                ? { value: deviceMeasurements.windDir, unit: units.windDir }
                : { value: '', units: '' }
            "
          />
          <DeviceCardMeasurement
            class="flex-grow-1"
            :measurement-metadata="measurements[1]"
            :unit="props.units[measurements[1].unit]"
            :device-measurement-value="deviceMeasurements[measurements[1].key]"
            :wind-dir-conditional-rendering="
              measurements[1].key === 'windSpeed'
                ? { value: deviceMeasurements.windDir, unit: units.windDir }
                : { value: '', units: '' }
            "
          />
        </div>
        <div class="d-flex justify-start align-center ga-4 flex-grow-1">
          <DeviceCardMeasurement
            class="flex-grow-1"
            :measurement-metadata="measurements[2]"
            :unit="props.units[measurements[2].unit]"
            :device-measurement-value="deviceMeasurements[measurements[2].key]"
            :wind-dir-conditional-rendering="
              measurements[2].key === 'windSpeed'
                ? { value: deviceMeasurements.windDir, unit: units.windDir }
                : { value: '', units: '' }
            "
          />
          <DeviceCardMeasurement
            class="flex-grow-1"
            :measurement-metadata="measurements[3]"
            :unit="props.units[measurements[3].unit]"
            :device-measurement-value="deviceMeasurements[measurements[3].key]"
            :wind-dir-conditional-rendering="
              measurements[3].key === 'windSpeed'
                ? { value: deviceMeasurements.windDir, unit: units.windDir }
                : { value: '', units: '' }
            "
          />
        </div>
      </div>
    </div>
  </VSheet>
</template>
