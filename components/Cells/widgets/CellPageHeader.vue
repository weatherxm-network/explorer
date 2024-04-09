<script setup lang="ts">
  import { useClipboard, useShare } from '@vueuse/core'
  import { useDisplay, useTheme } from 'vuetify'
  import TooltipComponent from '~/components/common/TooltipComponent.vue'
  import { useMobileStore } from '~/stores/mobileStore'

  interface Props {
    activeStations: number
    totalStations: number
    loading: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    activeStations: 1,
    totalStations: 0,
    loading: true
  })
  const { trackGAevent } = useGAevents()
  const { getAddress } = useAddress()
  const mobileStore = useMobileStore()
  const route = useRoute()
  const cellAddress = ref('')
  const display = ref(useDisplay())
  const showTooltip = ref(false)
  const tooltipText = ref('Cell shareable link copied to clipboard')
  let timer: any = null
  const theme = useTheme()
  const { share, isSupported } = useShare()
  const { copy } = useClipboard({ legacy: true })
  const constructedDeviceUrl = ref(location.origin + location.pathname)
  const infoTooltipTitle = ref('Cell Capacity')
  const infoTooltipText = ref(
    !display.value.smAndDown
      ? `<p>Cell capacity is a parameter that is used to define the maximum number of stations that are eligible for rewards in a specific cell. Every cell has a predefined capacity that depends on its geospatial characteristics*.<br><br> Every station is ranked in its cell daily, based on its reward score and its seniority. As long as the station's ranking is above the capacity threshold, it will be rewarded, whereas getting below it will lead to zero rewards. For example, in a cell with a max capacity of 5 stations, if a station is ranked 3rd it will get rewarded, but if it is ranked 7th, it won't receive any rewards.<br><br><i>* The cell capacity is currently set to the fixed value of 10 rewardable stations, for every cell.</i></p>`
      : `<p>Cell capacity is a parameter that is used to define the maximum number of stations that are eligible for rewards in a specific cell. Every cell has a predefined capacity that depends on its geospatial characteristics*.<br><br> Every station is ranked in its cell daily, based on its reward score and its seniority. As long as the station's ranking is above the capacity threshold, it will be rewarded, whereas getting below it will lead to zero rewards. For example, in a cell with a max capacity of 5 stations, if a station is ranked 3rd it will get rewarded, but if it is ranked 7th, it won't receive any rewards.<br><br>Read more about how our Cell Capacity algorithm works.<br><br><i>* The cell capacity is currently set to the fixed value of 10 rewardable stations, for every cell.</i></p>`
  )

  const closeCellsPage = () => {
    if (!display.value.smAndDown) {
      navigateTo('/stats')
    }
    mobileStore.setPageState(false)
  }
  const shareStation = () => {
    if (isSupported.value) {
      share({
        title: 'WeatherXM',
        text: 'Check out this WeatherXM cell',
        url: constructedDeviceUrl.value
      })
    } else {
      copy(constructedDeviceUrl.value)
        .then(() => {
          tooltipText.value = 'Cell shareable link copied to clipboard'
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

  const overlayColor = computed(() => {
    return {
      '--background-color': theme.themes.value.dark.colors.background
    }
  })
  const getTheme = computed(() => {
    return theme.global.name.value === 'dark'
  })

  onBeforeUnmount(() => {
    clearTimeout(timer)
  })

  onMounted(async () => {
    cellAddress.value = await getAddress(route.params.cellIndex).then((response) =>
      response === null ? '-' : response
    )
  })
</script>

<template>
  <VCard color="top" elevation="0" rounded="b-xl" style="margin-bottom: 2px" class="pa-4 pt-2">
    <VCardTitle class="pa-0 pb-2">
      <div class="d-flex justify-space-between align-center">
        <div class="text-h6 text-text pa-2 ps-0" align="center">
          <i
            class="fa fa-arrow-left text-primary"
            style="cursor: pointer"
            @click="closeCellsPage"
          ></i>
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
    </VCardTitle>

    <VCardText class="pa-0">
      <div class="mb-4">
        <v-skeleton-loader v-if="props.loading" type="text" height="32"></v-skeleton-loader>
        <div v-else class="text-h5 font-weight-bold text-text">
          {{ cellAddress }}
        </div>
      </div>

      <div class="d-flex">
        <div v-if="props.loading" style="min-width: 100px">
          <v-skeleton-loader type="chip"></v-skeleton-loader>
        </div>

        <VSheet
          v-if="!props.loading && !!props.activeStations"
          class="px-3 py-1 text-subtitle-2 flex-grow-0 me-1"
          style="border-radius: 10px"
          color="successTint"
        >
          {{ props.activeStations }} active
          {{ props.activeStations > 1 ? 'stations' : 'station' }}</VSheet
        >

        <div v-if="props.loading" style="min-width: 100px">
          <v-skeleton-loader type="chip"></v-skeleton-loader>
        </div>
        <div v-else style="min-width: 100px">
          <VSheet
            class="pl-3 pr-1 py-1 text-subtitle-2 flex-grow-0 d-flex"
            style="border-radius: 10px"
            color="blueTint"
          >
            <span class="me-2">{{ props.totalStations }}/10 stations present</span>
            <div
              @mouseenter="trackGAevent('cell_capacity_info', { ITEM_ID: 'info_cell_capacity' })"
              @click="trackGAevent('cell_capacity_info', { ITEM_ID: 'info_cell_capacity' })"
            >
              <TooltipComponent :message="infoTooltipText" :tooltip-title="infoTooltipTitle" />
            </div>
          </VSheet>
        </div>
      </div>
    </VCardText>
  </VCard>
</template>

<style>
  .v-tooltip > .v-overlay__content {
    background-color: var(--background-color);
  }
  .v-skeleton-loader__text {
    margin: 0px !important;
    height: 1.5rem;
  }
  .v-skeleton-loader__chip {
    margin: 0px !important;
    border-radius: 10px;
    margin-right: 8px !important;
    height: 30px;
  }
</style>
