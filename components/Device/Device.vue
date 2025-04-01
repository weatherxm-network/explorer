<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useDisplay } from 'vuetify'
  import dayjs from 'dayjs'
  import relativeTime from 'dayjs/plugin/relativeTime'
  import LottieComponent from '../common/LottieComponent.vue'
  import HeaderCard from './widgets/HeaderCard.vue'
  import RewardsSheet from './widgets/RewardsSheet.vue'
  import ObservationsSheet from './widgets/ObservationsSheet.vue'
  import Forecast from './widgets/Forecast.vue'
  import wxmApi from '~/api/wxmApi'
  import { useMobileStore } from '~/stores/mobileStore'
  import type { Device } from '~/components/common/types/common'

  import qodGreen from '~/assets/metrics/qod-green.svg'
  import qodOrange from '~/assets/metrics/qod-orange.svg'
  import qodRed from '~/assets/metrics/qod-red.svg'
  import qodGrey from '~/assets/metrics/qod-grey.svg'

  import polGreen from '~/assets/metrics/pol-green.svg'
  import polOrange from '~/assets/metrics/pol-orange.svg'
  import polGrey from '~/assets/metrics/pol-grey.svg'
  import polRed from '~/assets/metrics/pol-red.svg'

  dayjs.extend(relativeTime)

  const { trackGAevent } = useGAevents()
  const mobileStore = useMobileStore()
  const display = ref(useDisplay())
  const route = useRoute()
  const loading = ref(false)
  const showDeviceDetails = ref(false)
  const windowValue = ref(1)
  const enableReverse = ref(false)
  const changeTabTo = ref(0)
  const cellAddress = ref('')
  const cellDeviceName = ref('')
  const cellDeviceBundle = ref<Device['bundle']>({
    name: 'm5',
    title: 'M5',
    connectivity: 'wifi',
    ws_model: 'WS1000',
    gw_model: 'WG1000',
  })

  const timestamp = ref('-')
  const isActive = ref(false)
  const loadingRewardsTab = ref(false)
  const resolvedDevice = ref<Device>()
  const errorStateBoldText = ref('Oops! Something went wrong.')
  const errorStateLightText = ref(
    'Failed to get the details of the device: No data',
  )

  const backTo = ref('stats')
  const animationContainerHeight = computed(() => {
    return { marginTop: `calc(${display.value.height / 2}px - 244px)` }
  })

  const errorAnimationContainerHeight = computed(() => {
    return { marginTop: `calc(${display.value.height / 2}px - 281px)` }
  })

  const qodIcon = computed(() => {
    if (!resolvedDevice.value?.metrics.qod_score) return qodGrey
    if (resolvedDevice.value?.metrics.qod_score < 20) return qodRed
    if (resolvedDevice.value?.metrics.qod_score < 80) return qodOrange
    return qodGreen
  })

  const polIcon = computed(() => {
    if (
      !resolvedDevice.value?.metrics.pol_reason &&
      !resolvedDevice.value?.metrics.qod_score &&
      !resolvedDevice.value?.metrics.ts
    )
      return polGrey
    if (resolvedDevice.value?.metrics.pol_reason === 'NO_LOCATION_DATA')
      return polRed
    if (resolvedDevice.value?.metrics.pol_reason === 'LOCATION_NOT_VERIFIED')
      return polOrange
    return polGreen
  })

  const polStatus = computed(() => {
    if (
      !resolvedDevice.value?.metrics.pol_reason &&
      !resolvedDevice.value?.metrics.qod_score &&
      !resolvedDevice.value?.metrics.ts
    )
      return 'Pending verification'
    if (resolvedDevice.value?.metrics.pol_reason === 'NO_LOCATION_DATA')
      return 'No location data'
    if (resolvedDevice.value?.metrics.pol_reason === 'LOCATION_NOT_VERIFIED')
      return 'Not verified'
    return 'Verified'
  })

  watch(windowValue, (newValue, oldValue) => {
    newValue - oldValue === -1 || newValue - oldValue === 1
      ? (enableReverse.value = false)
      : (enableReverse.value = true)
  })

  const openWindow = (value: number) => {
    windowValue.value = value
    changeTabTo.value = value
  }
  const updateTabs = (value: number) => {
    changeTabTo.value = value
  }

  const backToCell = () => {
    if (backTo.value === 'stats') {
      mobileStore.setPageState(false)
      navigateTo(`/stats`)
    } else {
      navigateTo(`/cells/${backTo.value}`)
    }
  }

  const loadingRewards = (loading: boolean) => {
    loadingRewardsTab.value = loading
  }

  const fetchData = () => {
    loading.value = true
    showDeviceDetails.value = false
    const normalizeRouteDeviceName = formatDeviceName.normalizeDeviceName(
      route.params.deviceName as string,
    )
    wxmApi
      .resolveDeviceName(normalizeRouteDeviceName)
      .then((searchedDevice) => {
        if (searchedDevice.devices.length !== 0) {
          const device = searchedDevice.devices[0]
          cellDeviceName.value = device.name
          backTo.value = device.cell_index

          wxmApi
            .getDeviceByID(device.cell_index, device.id)
            .then((device) => {
              // calculate measurements
              cellAddress.value = device.address || '-'
              resolvedDevice.value = device
              timestamp.value = device?.current_weather?.timestamp
                ? dayjs(device.current_weather.timestamp).fromNow()
                : '-'
              isActive.value = device.isActive
              cellDeviceBundle.value = device.bundle
              // show results
              loading.value = false
              showDeviceDetails.value = true
              // track GA event
              trackGAevent('explorer_device', { ITEM_ID: device.id })
            })
            .catch(() => {
              loading.value = false
              showDeviceDetails.value = false
            })
        } else {
          loading.value = false
          showDeviceDetails.value = false
        }
      })
      .catch(() => {
        loading.value = false
        showDeviceDetails.value = false
      })
  }

  onMounted(() => {
    fetchData()
  })
</script>

<!-- eslint-disable vue/attribute-hyphenation -->
<template>
  <VCard class="w-100 h-100" color="background" elevation="0">
    <!--------------- Header -------------->
    <HeaderCard
      :deviceName="cellDeviceName"
      :deviceAddress="cellAddress"
      :timestamp="timestamp"
      :isActive="isActive"
      :bundle="cellDeviceBundle"
      :windowValue="changeTabTo"
      :loading="loading"
      :loading-rewards-tab="loadingRewardsTab"
      @open-window="openWindow"
      @back-to-cell="backToCell" />

    <!-- Station Health -->

    <div class="w-100 pa-4">
      <h5
        :class="[
          'd-flex justify-space-between align-center w-100 mb-4',
          'text-body-1 text-darkestBlue font-weight-bold',
        ]"
      >
        Station Health
        <i class="fa-regular fa-circle-info" />
      </h5>

      <div class="d-flex justify-between align-center ga-2 w-100">
        <div class="bg-blueTint px-4 py-3 w-50 rounded-xl">
          <h6 class="text-darkestBlue font-weight-bold text-caption">
            Data Quality Score
          </h6>
          <div class="d-flex justify-between align-center ga-2">
            <img :src="qodIcon" :style="{ width: '18px', height: '18px' }" />
            <span
              v-if="resolvedDevice?.metrics.qod_score"
              class="font-weight-bold"
            >
              {{ resolvedDevice?.metrics.qod_score }}%
            </span>
          </div>
        </div>
        <div class="bg-blueTint px-4 py-3 w-50 rounded-xl">
          <h6
            class="text-darkestBlue font-weight-bold text-caption text-truncate"
          >
            {{ cellAddress }}
          </h6>
          <div class="d-flex justify-between align-center ga-2">
            <img :src="polIcon" :style="{ width: '18px', height: '18px' }" />
            <span class="font-weight-bold">{{ polStatus }}</span>
          </div>
        </div>
      </div>
    </div>

    <!--------------- Main Content -------------->
    <VCardText class="ma-0 pa-0 h-100 w-100">
      <VCard height="100%" class="w-100" color="background" elevation="0">
        <VCardText class="ma-0 pa-0">
          <div v-if="loading" :style="animationContainerHeight">
            <LottieComponent
              :lottieName="'loaderLight'"
              :boldText="''"
              :lightText="''"
            />
          </div>
          <div
            v-if="!showDeviceDetails && !loading"
            class="d-flex flex-column justify-center pa-6"
            :style="errorAnimationContainerHeight"
          >
            <LottieComponent
              :lottieName="'errorState'"
              :boldText="errorStateBoldText"
              :lightText="errorStateLightText"
            />
            <VSheet class="mt-4" rounded="lg" color="primary" :border="true">
              <VBtn
                block
                class="text-none"
                size="x-large"
                rounded="lg"
                color="top"
                flat
                @click="fetchData"
                ><span class="text-primary">Retry</span></VBtn
              >
            </VSheet>
          </div>
          <v-card-text v-if="showDeviceDetails && !loading" class="pa-0 ma-0">
            <v-window
              v-model="windowValue"
              :reverse="enableReverse"
              @update:model-value="updateTabs"
            >
              <v-window-item :value="1">
                <ObservationsSheet
                  :device="resolvedDevice"
                  @open-window="openWindow"
                />
              </v-window-item>
              <v-window-item :value="2">
                <Forecast />
              </v-window-item>
              <v-window-item :value="3">
                <RewardsSheet
                  :device="resolvedDevice"
                  @loading-rewards-tab="loadingRewards"
                />
              </v-window-item>
            </v-window>
          </v-card-text>
        </VCardText>
      </VCard> </VCardText
  ></VCard>
</template>
