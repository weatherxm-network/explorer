<script setup lang="ts">
  import { useDisplay } from 'vuetify'
  import type { Units, Measurements } from '../types/cell'
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
      windSpeed: ''
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
      windSpeed: ''
    })
  })

  const feelsLikeStaticText = ref('Feels Like')
  const display = ref(useDisplay())
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
</script>

<template>
  <VSheet color="top" rounded="xl" class="pl-0">
    <VRow no-gutters class="ma-0 pa-0 pt-3 pb-0">
      <VCol class="pr-0 pl-0" align-self="center">
        <!---------------------------- Lottie Icon ------------------------------->

        {{ index.icon }}
        <div class="d-flex justify-center">
          <client-only>
            <Vue3Lottie
              :animation-data="index[props.icon]"
              :height="display.smAndDown ? 50 : 70"
              :width="display.smAndDown ? 50 : 70"
            />
          </client-only>
        </div>
        <!---------------------------- Temp ------------------------------->
        <div class="text-h3 font-weight-bold d-flex justify-center align-baseline">
          <span class="text-text">{{ deviceMeasurements.temp }}</span>
          <span class="text-h5 text-text">{{ units.temp }}</span>
        </div>
        <!---------------------------- Feels like ------------------------------->
        <div class="text-caption d-flex align-center justify-center">
          <span class="text-darkestBlue">{{ feelsLikeStaticText }}</span
          ><span class="text-subtitle-1 pl-2 text-text d-flex"
            ><div class="font-weight-bold">{{ deviceMeasurements.feels_like }}</div>
            <span class="text-text">{{ units.temp }}</span></span
          >
        </div>
      </VCol>

      <VCol align-self="center" class="ma-0 pa-0">
        <!---------------------------- Loop in measurements ------------------------------->
        <VRow
          v-for="(measurement, i) in measurements"
          :key="measurement.key"
          class="ma-0 pa-0"
          :class="i === measurements.length - 1 ? 'pb-0' : 'pb-2'"
        >
          <DeviceCardMeasurement
            :measurement-metadata="measurement"
            :unit="props.units[measurement.unit]"
            :device-measurement-value="deviceMeasurements[measurement.key]"
            :wind-dir-conditional-rendering="
              measurement.key === 'windSpeed'
                ? { value: deviceMeasurements.windDir, unit: units.windDir }
                : { value: '', units: '' }
            "
          />
        </VRow>
      </VCol>
    </VRow>
  </VSheet>
</template>
