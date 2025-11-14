<script setup lang="ts">
  import { useDisplay } from 'vuetify'
  import CellsHeader from './widgets/CellPageHeader.vue'
  import DeviceCard from './widgets/DeviceCard.vue'
  import BountyCellCard from './widgets/BountyCellCard.vue'
  import { getCellDevices } from './utils/cells'
  import type { Device } from '~/components/common/types/common'
  import type { CellBountyCell } from '@/components/Mapbox/types/mapbox'
  import LottieComponent from '~/components/common/LottieComponent.vue'
  import { useMapboxStore } from '~/stores/mapboxStore'

  const display = ref(useDisplay())
  const route = useRoute()
  const showCellsDevices = ref(true)
  const loading = ref(false)
  const boldText = ref('Oops! Something went wrong.')
  const lightText = ref('Failed to get the public devices.')
  const orderedCellDevices = ref<Device[]>([])
  const cellAddress = ref(' ')
  const cellDataQuality = ref(0)
  const countActiveStations = ref(0)
  const countTotalStations = ref(0)
  const bountyCellData = ref<CellBountyCell | null>(null)
  const animationContainerHeight = computed(() => {
    return { marginTop: `calc(${display.value.height / 2}px - 128px)` }
  })
  const errorContainerHeight = computed(() => {
    return { marginTop: `calc(${display.value.height / 2}px - 159px)` }
  })

  const mapboxStore = useMapboxStore()
  const currentLayerType = computed(() => mapboxStore.getCurrentLayerType)

  const clickOnDevice = (deviceName: string) => {
    navigateTo(
      `/stations/${formatDeviceName.denormalizeDeviceName(deviceName)}`,
    )
  }

  onMounted(async () => {
    loading.value = true
    const cellIndex = route.params.cellIndex as string

    const collections = mapboxStore.getCollections
    if (collections?.cellBountyCollection) {
      const bountyFeature = collections.cellBountyCollection.features.find(
        (feature) => feature.properties.index === cellIndex,
      )
      if (bountyFeature) {
        // Extract bounty data from the feature properties
        bountyCellData.value = {
          index: bountyFeature.properties.index,
          devices_accepted: bountyFeature.properties.devices_accepted,
          total_rewards: bountyFeature.properties.total_rewards,
          activation_period_start:
            bountyFeature.properties.activation_period_start,
          activation_period_end: bountyFeature.properties.activation_period_end,
          distribution_period_in_days:
            bountyFeature.properties.distribution_period_in_days,
        }
      }
    }

    getCellDevices(cellIndex)
      .then(async (orderedDevices) => {
        if (orderedDevices.length !== 0) {
          // Filter devices based on the current layer type
          const filteredDevices =
            currentLayerType.value === 'targeted-rollouts'
              ? orderedDevices.filter(
                  (device) => device.programName !== 'community',
                )
              : orderedDevices

          // compute icon for cell devices
          cellAddress.value = orderedDevices[0].address
          orderedCellDevices.value = filteredDevices
          countTotalStations.value = orderedCellDevices.value.length
          countActiveStations.value = orderedCellDevices.value.filter(
            (obj) => obj.isActive === true,
          ).length

          cellDataQuality.value = orderedDevices[0].cellAvgDataQuality ?? 0

          // show cell devices
          loading.value = false
          showCellsDevices.value = true
        } else {
          loading.value = false
          // If it's a bounty cell, don't show error - just hide devices
          showCellsDevices.value = !!bountyCellData.value
        }
      })
      .catch(() => {
        loading.value = false
        // If it's a bounty cell, don't show error - just hide devices
        // This prevents the "Something went wrong" message for bounty cells
        showCellsDevices.value = !!bountyCellData.value
      })
  })
</script>

<template>
  <VCard class="w-100 h-100" color="background" elevation="0">
    <CellsHeader
      :active-stations="countActiveStations"
      :total-stations="countTotalStations"
      :cell-address="cellAddress"
      :loading="loading"
      :cell-data-quality="cellDataQuality"
      :is-bounty-cell="!!bountyCellData"
      :bounty-cell-max-stations="bountyCellData?.devices_accepted"
    />
    <div v-if="bountyCellData" class="px-4 pt-6 pb-0">
      <BountyCellCard
        :bounty-data="bountyCellData"
        :total-stations="countTotalStations"
      />
    </div>
    <!--------------- Main Content -------------->
    <VCardText class="ma-0 pa-0 h-100 w-100">
      <VCard height="100%" class="w-100" color="background" elevation="0">
        <VCardText class="ma-0 pa-0">
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
