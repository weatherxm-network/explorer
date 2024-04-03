<script setup lang="ts">
  import { useClipboard, useShare } from '@vueuse/core'
  import { computed, toRef } from 'vue'
  import { useTheme } from 'vuetify'
  import DeviceCardIcon from '../../common/DeviceCardIcon.vue'

  interface Props {
    deviceName?: string
    deviceAddress?: string
    timestamp?: string
    deviceProfile?: string
    isActive?: boolean
    backTo?: string
    windowValue?: number
    loading?: boolean
    loadingRewardsTab?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    deviceName: '-',
    deviceAddress: '-',
    timestamp: '-',
    deviceProfile: 'M5',
    isActive: true,
    backTo: 'stats',
    windowValue: 0,
    loading: true,
    loadingRewardsTab: false
  })

  const emits = defineEmits(['openWindow', 'backToCell'])
  const loading = toRef(props, 'loading')
  const { share, isSupported } = useShare()
  const { copy } = useClipboard({ legacy: true })
  const constructedDeviceUrl = ref(location.origin + location.pathname)
  const theme = useTheme()
  const showTooltip = ref(false)
  const tooltipText = ref('Station shareable link copied to clipboard')
  let timer: any = null
  const tabValue = computed(() => {
    return props.windowValue
  })

  const openWindow = (value: number) => {
    emits('openWindow', value)
  }

  const backToCell = () => {
    emits('backToCell')
  }

  const shareStation = () => {
    if (isSupported.value) {
      share({
        title: 'WeatherXM',
        text: 'Check out this WeatherXM station',
        url: constructedDeviceUrl.value
      })
    } else {
      copy(constructedDeviceUrl.value)
        .then(() => {
          tooltipText.value = 'Station shareable link copied to clipboard'
          showTooltip.value = true
          clearTimeout(timer)
          timer = setTimeout(() => (showTooltip.value = false), 2000)
        })
        .catch(() => {
          tooltipText.value = 'Your browser does not support Clipboard'
          showTooltip.value = true
          clearTimeout(timer)
          timer = setTimeout(() => (showTooltip.value = false), 2000)
        })
    }
  }

  onBeforeUnmount(() => {
    clearTimeout(timer)
  })

  const overlayColor = computed(() => {
    return {
      '--background-color': theme.themes.value.dark.colors.background
    }
  })
  const getTheme = computed(() => {
    return theme.global.name.value === 'dark'
  })

  const calcTimestampSheetColor = computed(() => {
    if (theme.global.name.value === 'dark') {
      return 'blueTint'
    } else if (props.isActive) {
      return 'successTint'
    } else {
      return 'errorTint'
    }
  })
  const calcTimestampTextColor = computed(() => {
    if (theme.global.name.value === 'dark') {
      if (props.isActive) {
        return 'text-success'
      } else {
        return 'text-error'
      }
    } else {
      return 'text-text'
    }
  })
</script>

<template>
  <VCard class="ma-0 pa-0 rounded-b-xl mb-2" elevation="2" color="top">
    <VCardTitle class="ma-0 pt-4 pb-0 px-4">
      <div class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <i class="fa fa-arrow-left text-primary" style="cursor: pointer" @click="backToCell"></i>
        </div>
        <div>
          <div v-if="!isSupported">
            <i
              class="fa-regular fa-clone text-primary"
              style="cursor: pointer"
              @click="shareStation"
            >
              <v-tooltip
                v-model="showTooltip"
                :style="overlayColor"
                :open-on-click="false"
                :open-on-hover="false"
                location="start"
                activator="parent"
                :text="tooltipText"
              >
                <div
                  class="pt-1 pb-1 px-1 text-caption"
                  :class="getTheme ? 'text-text' : 'text-top'"
                >
                  {{ tooltipText }}
                </div>
              </v-tooltip>
            </i>
          </div>
          <div v-if="isSupported">
            <i
              class="fa-solid fa-share-nodes text-primary"
              style="cursor: pointer"
              @click="shareStation"
            >
            </i>
          </div>
        </div>
      </div>

      <VCardTitle class="px-0 pt-4 pb-0">
        <!---------------------------- Device name ------------------------------->
        <VRow class="ma-0 pa-0 w-100">
          <VCol class="ma-0 pa-0">
            <v-skeleton-loader v-if="loading" type="text" height="32"></v-skeleton-loader>
            <div
              v-else
              class="font-weight-bold text-primary"
              style="font-size: 1.108rem; font-weight: 700"
            >
              {{ deviceName }}
            </div>
          </VCol>
        </VRow>

        <!---------------------------- Address ------------------------------->

        <VRow class="pa-0 ma-0 pt-2" no-gutters style="flex-wrap: nowrap">
          <div
            style="min-width: 100px"
            class="flex-shrink-1"
            :class="!loading ? 'flex-grow-0' : 'flex-grow-1'"
          >
            <v-skeleton-loader v-if="loading" type="chip,chip"></v-skeleton-loader>
            <div v-else style="min-width: 100px" class="flex-shrink-1 flex-grow-0">
              <VSheet
                class="d-flex align-center px-2 py-2 text-text text-caption"
                color="blueTint"
                style="border-radius: 10px; font-weight: 400"
              >
                <div class="text-body-1 d-flex align-center">
                  <i class="fa-regular fa-hexagon"></i>
                </div>

                <span class="pl-3 text-truncate">
                  {{ deviceAddress }}
                </span>
              </VSheet>
            </div>
          </div>
          <v-skeleton-loader v-if="loading" type=""></v-skeleton-loader>
          <VCol v-else cols="auto" class="flex-grow-0 flex-shrink-1 pl-2">
            <VSheet
              class="d-flex align-center px-2 py-1 text-caption"
              :color="calcTimestampSheetColor"
              style="border-radius: 10px; font-weight: 400"
            >
              <div>
                <DeviceCardIcon :is-active="isActive" :profile="deviceProfile" />
              </div>
              <div class="pl-3 text-no-wrap" :class="calcTimestampTextColor">
                {{ timestamp }}
              </div>
            </VSheet>
          </VCol>
        </VRow>
      </VCardTitle>
      <v-tabs
        v-model="tabValue"
        class="mt-2"
        grow
        center-active
        color="primary"
        bg-color="top"
        align-tabs="center"
        density="comfortable"
        slider-color="primary"
      >
        <v-tab :value="1" size="small" class="text-none" @click="openWindow(1)">Observations</v-tab>
        <v-tab :value="2" size="small" class="text-none" @click="openWindow(2)">Forecast</v-tab>
        <v-tab :value="3" size="small" class="text-none" @click="openWindow(3)">Rewards</v-tab>
      </v-tabs>
      <VProgressLinear
        v-if="props.loadingRewardsTab"
        indeterminate
        color="primary"
        height="2"
      ></VProgressLinear>
    </VCardTitle>
  </VCard>
</template>

<style>
  .v-tooltip > .v-overlay__content {
    background-color: var(--background-color);
  }
  .v-skeleton-loader__text {
    margin: 0px !important;
    height: 1.108rem;
  }
  .v-skeleton-loader__chip {
    margin: 0px !important;
    border-radius: 10px;
    margin-right: 8px !important;
    height: 36px;
  }
</style>
