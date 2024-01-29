<script setup lang="ts">
  import { useDisplay } from 'vuetify'
  import CellsHeader from './widgets/CellPageHeader.vue'
  import DeviceCard from './widgets/DeviceCard.vue'
  import { getCellDevices } from './utils/cells'
  import type { Device } from './types/cell'
  import { getAddress } from '~/components/common/address'
  import LottieComponent from '~/components/common/LottieComponent.vue'

  const display = ref(useDisplay())
  const route = useRoute()
  const showCellsDevices = ref(true)
  const loading = ref(false)
  const boldText = ref('Oops! Something went wrong.')
  const lightText = ref('Failed to get the public devices.')
  const orderedCellDevices = ref([])
  const cellAddress = ref(' ')

  const animationContainerHeight = computed(() => {
    return { marginTop: `calc(${display.value.height / 2}px - 128px)` }
  })
  const errorContainerHeight = computed(() => {
    return { marginTop: `calc(${display.value.height / 2}px - 159px)` }
  })

  // compute icon
  const calcIconBasedOnCurrentWeather = (devices: Device[]) => {
    return devices.map((device) => {
      if (!device?.current_weather || !device?.current_weather?.icon) {
        device.current_weather.icon = 'not_available'
        return device
      } else {
        return device
      }
    })
  }

  const clickOnDevice = (deviceName: string) => {
    navigateTo(`/stations/${formatDeviceName.denormalizeDeviceName(deviceName)}`)
  }

  onMounted(() => {
    loading.value = true
    // get cell devices through api
    getCellDevices(route.params.cellIndex)
      .then(async (orderedDevices) => {
        if (orderedDevices.length !== 0) {
          // compute icon for cell devices
          orderedCellDevices.value = calcIconBasedOnCurrentWeather(orderedDevices)
          // get cell address based on cell id
          cellAddress.value = await getAddress(route.params.cellIndex)
          // show cell devices
          loading.value = false
          showCellsDevices.value = true
        } else {
          loading.value = false
          showCellsDevices.value = false
        }
      })
      .catch(() => {
        loading.value = false
        showCellsDevices.value = false
      })
  })
</script>

<template>
  <VCard class="w-100 h-100" color="background" elevation="0">
    <CellsHeader />
    <!--------------- Main Content -------------->
    <VCardText class="ma-0 pa-0 h-100 w-100">
      <VCard height="100%" class="w-100" color="background" elevation="0">
        <VCardText class="ma-0 pa-0">
          <div
            v-if="loading"
            class="h-100 w-100 d-flex align-center justify-center"
            :style="animationContainerHeight"
          >
            <LottieComponent :lottie-name="'loaderLight'" :bold-text="''" :light-text="''" />
          </div>

          <div
            v-if="!showCellsDevices"
            class="h-100 w-100 d-flex align-center justify-center"
            :style="errorContainerHeight"
          >
            <LottieComponent
              :lottie-name="'errorState'"
              :bold-text="boldText"
              :light-text="lightText"
            />
          </div>

          <div v-if="showCellsDevices && !loading" class="ma-0 pa-4">
            <div
              v-for="(device, index) in orderedCellDevices"
              :key="device.id"
              style="cursor: pointer"
              :class="index === 0 ? 'mt-0' : 'mt-6'"
              @click="clickOnDevice(orderedCellDevices[index].name)"
            >
              <DeviceCard
                :key="device.id"
                :device-id="device.id ? device.id : '-'"
                :device-name="device.name ? device.name : '-'"
                :device-address="cellAddress"
                :is-active="device.isActive"
                :profile="device.profile"
                :last-active-at="
                  device.lastWeatherStationActivity ? device.lastWeatherStationActivity : '-'
                "
                :icon="
                  device.current_weather.icon
                    ? device.current_weather.icon.replaceAll('-', '_')
                    : 'not_available'
                "
                :device="device"
              />
            </div>
          </div>
        </VCardText>
      </VCard>
    </VCardText>
  </VCard>
</template>
