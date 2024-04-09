<script setup lang="ts">
  import { useDisplay } from 'vuetify'
  import CellsHeader from './widgets/CellPageHeader.vue'
  import DeviceCard from './widgets/DeviceCard.vue'
  import { getCellDevices } from './utils/cells'
  import type { Device } from './types/cell'
  import LottieComponent from '~/components/common/LottieComponent.vue'

  const display = ref(useDisplay())
  const route = useRoute()
  const { getAddress } = useAddress()
  const showCellsDevices = ref(true)
  const loading = ref(false)
  const boldText = ref('Oops! Something went wrong.')
  const lightText = ref('Failed to get the public devices.')
  const orderedCellDevices = ref<Device[]>([])
  const cellAddress = ref(' ')
  const countActiveStations = ref(0)
  const countTotalStations = ref(0)
  const animationContainerHeight = computed(() => {
    return { marginTop: `calc(${display.value.height / 2}px - 128px)` }
  })
  const errorContainerHeight = computed(() => {
    return { marginTop: `calc(${display.value.height / 2}px - 159px)` }
  })

  const clickOnDevice = (deviceName: string) => {
    navigateTo(`/stations/${formatDeviceName.denormalizeDeviceName(deviceName)}`)
  }

  onMounted(async () => {
    loading.value = true
    // get cell address based on cell id
    cellAddress.value = await getAddress(route.params.cellIndex)
    // get cell devices through api
    getCellDevices(route.params.cellIndex)
      .then(async (orderedDevices) => {
        if (orderedDevices.length !== 0) {
          // compute icon for cell devices
          orderedCellDevices.value = orderedDevices
          countTotalStations.value = orderedCellDevices.value.length
          countActiveStations.value = orderedCellDevices.value.filter(
            (obj) => obj.isActive === true
          ).length

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
    <CellsHeader
      :active-stations="countActiveStations"
      :total-stations="countTotalStations"
      :loading="loading"
    />
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
              <DeviceCard :device="device" :device-address="cellAddress" />
            </div>
          </div>
        </VCardText>
      </VCard>
    </VCardText>
  </VCard>
</template>
