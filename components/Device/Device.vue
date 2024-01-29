<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useDisplay } from 'vuetify'
  import dayjs from 'dayjs'
  import relativeTime from 'dayjs/plugin/relativeTime'
  import { event } from 'vue-gtag'
  import LottieComponent from '../common/LottieComponent.vue'
  import HeaderCard from './widgets/HeaderCard.vue'
  import RewardsSheet from './widgets/RewardsSheet.vue'
  import ObservationsSheet from './widgets/ObservationsSheet.vue'
  import Forecast from './widgets/Forecast.vue'
  import { getAddress } from '~/components/common/address'
  import wxmApi from '~/api/wxmApi'
  import { useMobileStore } from '~/stores/mobileStore'
  import getGAEvent from '~/utils/getGAEvent'

  dayjs.extend(relativeTime)

  const mobileStore = useMobileStore()
  const display = ref(useDisplay())
  const route = useRoute()
  const loading = ref(false)
  const showDeviceDetails = ref(true)
  const windowValue = ref(1)
  const enableReverse = ref(false)
  const changeTabTo = ref(0)
  const cellAddress = ref('')
  const cellDeviceName = ref('')
  const cellDeviceProfile = ref('M5')
  const timestamp = ref('-')
  const isActive = ref(false)
  const loadingRewardsTab = ref(false)

  const resolvedDevice = ref()
  const errorStateBoldText = ref('Oops! Something went wrong.')
  const errorStateLightText = ref('Failed to get the details of the device: No data')

  const backTo = ref('stats')

  const animationContainerHeight = computed(() => {
    return { marginTop: `calc(${display.value.height / 2}px - 244px)` }
  })
  const errorAnimationContainerHeight = computed(() => {
    return { marginTop: `calc(${display.value.height / 2}px - 281px)` }
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

  const trackEvent = (eventKey: string, parameters: any) => {
    const validEvent = getGAEvent.getEvent(eventKey, parameters)
    if (validEvent) {
      event(validEvent.eventName, validEvent.parameters)
    }
  }

  const loadingRewards = (loading: boolean) => {
    loadingRewardsTab.value = loading
  }
  onMounted(() => {
    loading.value = true
    const normalizeRouteDeviceName = formatDeviceName.normalizeDeviceName(route.params.deviceName)
    wxmApi
      .resolveDeviceName(normalizeRouteDeviceName)
      .then((searchedDevice) => {
        if (searchedDevice.devices.length !== 0) {
          const device = searchedDevice.devices[0]
          cellDeviceName.value = device.name
          backTo.value = device.cell_index
          getAddress(device.cell_index)
            .then((address) => {
              if (address) {
                cellAddress.value = address
              } else {
                cellAddress.value = '-'
              }
            })
            .catch(() => {
              cellAddress.value = '-'
            })

          wxmApi
            .getDeviceByID({ cellIndex: device.cell_index, deviceId: device.id })
            .then((device) => {
              // calculate measurements
              resolvedDevice.value = device
              timestamp.value = dayjs(device.current_weather.timestamp).fromNow()
              isActive.value = device.isActive
              cellDeviceProfile.value = device.profile
              // show results
              loading.value = false
              showDeviceDetails.value = true
              // track GA event
              trackEvent('explorer_device', { ITEM_ID: device.id })
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
      :deviceProfile="cellDeviceProfile"
      :windowValue="changeTabTo"
      :loading="loading"
      :loading-rewards-tab="loadingRewardsTab"
      @open-window="openWindow"
      @back-to-cell="backToCell" />
    <!--------------- Main Content -------------->
    <VCardText class="ma-0 pa-0 h-100 w-100">
      <VCard height="100%" class="w-100" color="background" elevation="0">
        <VCardText class="ma-0 pa-0">
          <div v-if="loading" :style="animationContainerHeight">
            <LottieComponent :lottieName="'loaderLight'" :boldText="''" :lightText="''" />
          </div>
          <div v-if="!showDeviceDetails && !loading" :style="errorAnimationContainerHeight">
            <LottieComponent
              :lottieName="'errorState'"
              :boldText="errorStateBoldText"
              :lightText="errorStateLightText"
            />
          </div>
          <v-card-text v-if="showDeviceDetails && !loading" class="pa-0 ma-0">
            <v-window
              v-model="windowValue"
              :reverse="enableReverse"
              @update:model-value="updateTabs"
            >
              <v-window-item :value="1">
                <ObservationsSheet :device="resolvedDevice" @open-window="openWindow" />
              </v-window-item>
              <v-window-item :value="2">
                <Forecast />
              </v-window-item>
              <v-window-item :value="3">
                <RewardsSheet :device="resolvedDevice" @loading-rewards-tab="loadingRewards" />
              </v-window-item>
            </v-window>
          </v-card-text>
        </VCardText>
      </VCard> </VCardText
  ></VCard>
</template>
