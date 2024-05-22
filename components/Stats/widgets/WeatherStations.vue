<script setup lang="ts">
  import { computed } from 'vue'
  import { useDisplay, useTheme } from 'vuetify'
  import numberFormater from '../utils/numberFormater'
  import TooltipComponent from '~/components/common/TooltipComponent.vue'

  interface WeatherStationsDetails {
    amount?: number
    connectivity?: string
    model?: string
    percentage?: number
    url?: string
  }

  interface WeatherStationsInfo {
    total?: number
    details?: WeatherStationsDetails[]
  }

  interface Props {
    weatherStationsActive?: WeatherStationsInfo
    weatherStationsClaimed?: WeatherStationsInfo
    weatherStationsOnboarded?: WeatherStationsInfo
  }

  const props = withDefaults(defineProps<Props>(), {
    weatherStationsActive: () => ({
      total: 0,
      details: [
        {
          amount: 0,
          connectivity: '',
          model: '',
          percentage: 0,
          url: ''
        }
      ]
    }),
    weatherStationsClaimed: () => ({
      total: 0,
      details: [
        {
          amount: 0,
          connectivity: '',
          model: '',
          percentage: 0,
          url: ''
        }
      ]
    }),
    weatherStationsOnboarded: () => ({
      total: 0,
      details: [
        {
          amount: 0,
          connectivity: '',
          model: '',
          percentage: 0,
          url: ''
        }
      ]
    })
  })

  const { trackGAevent } = useGAevents()
  const display = ref(useDisplay())
  const theme = useTheme()
  const weatherStationsCardTitle = ref('Weather Stations')
  const weatherStationsCardTotalSectionHeader = ref('TOTAL')
  const weatherStationsCardClaimedSectionHeader = ref('CLAIMED')
  const weatherStationsCardActiveSectionHeader = ref('ACTIVE')
  // total tooltip info
  const totalWeatherStationsMessage = ref(
    'The number of weather stations manufactured and registered on the network.'
  )
  const totalTooltipTitle = ref('Total Weather Stations')
  // claimed tooltip info
  const claimedWeatherStationsMessage = ref(
    'The number of weather stations already claimed by users.'
  )
  const claimedTooltipTitle = ref('Claimed Weather Stations')
  // active tooltip info
  const activeWeatherStationsMessage = ref(
    'The number of weather stations that were active during the last day.'
  )
  const activeTooltipTitle = ref('Active Weather Stations')

  const responsiveTextStyles = computed(() => {
    return display.value.smAndDown
      ? { 'font-size': '1.402rem', 'font-weight': 700 }
      : { 'font-size': '1.705rem', 'font-weight': 700 }
  })

  const anchorColor = computed(() => {
    return {
      '--anchor-color':
        theme.global.name.value === 'dark'
          ? theme.themes.value.dark.colors.darkestBlue
          : theme.themes.value.light.colors.darkestBlue
    }
  })

  const calcProgressBarPercentage = (percentage: number) => {
    return percentage.toFixed(2) * 100
  }

  const localizeNumber = (number: number) => {
    return numberFormater.localizeNumberFormat(number)
  }
</script>

<template>
  <VSheet
    color="top"
    style="border-radius: 16px"
    elevation="4"
    :class="display.smAndDown ? ` pa-2 mb-3` : ` pa-2 mb-4`"
  >
    <VRow class="px-2 mb-3 ma-0 pt-1 align-center justify-space-between">
      <div class="text-body-1" style="font-weight: 700">
        {{ weatherStationsCardTitle }}
      </div>
    </VRow>
    <!----------  Total -------->
    <VSheet class="mb-2" color="layer1" style="border-radius: 8px">
      <VRow class="pa-0 ma-0 pb-3 pt-3 justify-space-between align-center">
        <div class="text-body-2 pl-3">{{ weatherStationsCardTotalSectionHeader }}</div>
        <div
          @mouseenter="trackGAevent('clickInfoIcon', { ITEM_ID: 'total_stations' })"
          @click="trackGAevent('clickInfoIcon', { ITEM_ID: 'total_stations' })"
        >
          <TooltipComponent
            :message="totalWeatherStationsMessage"
            class="pr-3"
            :container="'any'"
            :tooltip-title="totalTooltipTitle"
          />
        </div>
      </VRow>
      <VRow class="ma-0 pa-0 align-center pb-4 pl-3 pr-4">
        <VCol cols="9" class="ma-0 pa-0 pr-2">
          <VRow
            v-for="(device, index) in props.weatherStationsOnboarded.details"
            :key="index"
            class="pa-0 ma-0"
            :class="index === props.weatherStationsOnboarded.details.length - 1 ? '' : 'pb-2'"
          >
            <VCol class="ma-0 pa-0" :class="display.smAndDown ? '' : 'mr-n2'" cols="4">
              <div
                class="text-caption text-darkGrey"
                @click="
                  trackGAevent('clickOnOpenStationShop', {
                    ITEM_ID: 'total',
                    ITEM_LIST_ID: device.model
                  })
                "
              >
                <a
                  :href="device.url"
                  target="_blank"
                  class="text-decoration-none"
                  :style="anchorColor"
                >
                  {{ device.model }}
                  <i class="text-text fa-solid fa-arrow-up-right-from-square"></i>
                </a>
              </div>
            </VCol>
            <VCol class="pa-0 ma-0 px-2 pl-0" cols="5">
              <VProgressLinear
                :model-value="calcProgressBarPercentage(device.percentage)"
                height="18"
                rounded="pill"
                color="netStatProgressBar"
              >
                <strong>{{ calcProgressBarPercentage(device.percentage) }}%</strong>
              </VProgressLinear>
            </VCol>
            <VCol class="ma-0 pa-0" cols="3">
              <div class="text-caption text-text" style="font-weight: 600">
                {{ localizeNumber(device.amount.toFixed(0)) }}
              </div>
            </VCol>
          </VRow>
        </VCol>
        <VCol cols="3" class="ma-0 pa-0 text-text">
          <div :style="responsiveTextStyles" class="pr-0 d-flex justify-end">
            {{ localizeNumber(props.weatherStationsOnboarded.total) }}
          </div>
        </VCol>
      </VRow>
    </VSheet>
    <!----------  Claimed -------->
    <VSheet class="mb-2" color="layer1" style="border-radius: 8px">
      <VRow class="pa-0 ma-0 pb-3 pt-3 justify-space-between align-center">
        <div class="text-body-2 pl-3">{{ weatherStationsCardClaimedSectionHeader }}</div>
        <div
          @mouseenter="trackGAevent('clickInfoIcon', { ITEM_ID: 'claimed_stations' })"
          @click="trackGAevent('clickInfoIcon', { ITEM_ID: 'claimed_stations' })"
        >
          <TooltipComponent
            :message="claimedWeatherStationsMessage"
            class="pr-3"
            :container="'any'"
            :tooltip-title="claimedTooltipTitle"
          />
        </div>
      </VRow>
      <VRow class="ma-0 pa-0 align-center pb-4 pl-3 pr-4">
        <VCol cols="9" class="ma-0 pa-0 pr-2">
          <VRow
            v-for="(device, index) in props.weatherStationsClaimed.details"
            :key="index"
            class="pa-0 ma-0"
            :class="index === props.weatherStationsClaimed.details.length - 1 ? '' : 'pb-2'"
          >
            <VCol class="ma-0 pa-0" :class="display.smAndDown ? '' : 'mr-n2'" cols="4">
              <div
                class="text-caption text-darkGrey"
                @click="
                  trackGAevent('clickOnOpenStationShop', {
                    ITEM_ID: 'claimed',
                    ITEM_LIST_ID: device.model
                  })
                "
              >
                <a
                  :href="device.url"
                  target="_blank"
                  class="text-decoration-none"
                  :style="anchorColor"
                >
                  {{ device.model }}
                  <i class="text-text fa-solid fa-arrow-up-right-from-square"></i>
                </a>
              </div>
            </VCol>
            <VCol class="pa-0 ma-0 px-2 pl-0" cols="5">
              <v-progress-linear
                :model-value="calcProgressBarPercentage(device.percentage)"
                height="18"
                style="border-radius: 14px"
                color="netStatProgressBar"
              >
                <strong>{{ calcProgressBarPercentage(device.percentage) }}%</strong>
              </v-progress-linear>
            </VCol>
            <VCol class="ma-0 pa-0" cols="3">
              <div class="text-caption text-text" style="font-weight: 600">
                {{ localizeNumber(device.amount.toFixed(0)) }}
              </div>
            </VCol>
          </VRow>
        </VCol>
        <VCol cols="3" class="ma-0 pa-0 text-text">
          <div :style="responsiveTextStyles" class="pr-0 d-flex justify-end">
            {{ localizeNumber(props.weatherStationsClaimed.total) }}
          </div>
        </VCol>
      </VRow>
    </VSheet>
    <!----------  Active -------->
    <VSheet color="layer1" style="border-radius: 8px">
      <VRow class="pa-0 ma-0 pb-3 pt-3 justify-space-between align-center">
        <div class="text-body-2 pl-3">{{ weatherStationsCardActiveSectionHeader }}</div>
        <div
          @mouseenter="trackGAevent('clickInfoIcon', { ITEM_ID: 'active_stations' })"
          @click="trackGAevent('clickInfoIcon', { ITEM_ID: 'active_stations' })"
        >
          <TooltipComponent
            :message="activeWeatherStationsMessage"
            class="pr-3"
            :container="'any'"
            :tooltip-title="activeTooltipTitle"
          />
        </div>
      </VRow>

      <VRow class="ma-0 pa-0 align-center pb-4 pl-3 pr-4">
        <VCol cols="9" class="ma-0 pa-0 pr-2">
          <VRow
            v-for="(device, index) in props.weatherStationsActive.details"
            :key="index"
            class="pa-0 ma-0"
            :class="index === props.weatherStationsActive.details.length - 1 ? '' : 'pb-2'"
          >
            <VCol class="ma-0 pa-0" :class="display.smAndDown ? '' : 'mr-n2'" cols="4">
              <div
                class="text-caption text-darkGrey"
                @click="
                  trackGAevent('clickOnOpenStationShop', {
                    ITEM_ID: 'active',
                    ITEM_LIST_ID: device.model
                  })
                "
              >
                <a
                  :href="device.url"
                  target="_blank"
                  class="text-decoration-none"
                  :style="anchorColor"
                >
                  {{ device.model }}
                  <i class="text-text fa-solid fa-arrow-up-right-from-square"></i>
                </a>
              </div>
            </VCol>
            <VCol class="pa-0 ma-0 px-2 pl-0" cols="5">
              <v-progress-linear
                :model-value="calcProgressBarPercentage(device.percentage)"
                height="18"
                style="border-radius: 14px"
                color="netStatProgressBar"
              >
                <strong>{{ calcProgressBarPercentage(device.percentage) }}%</strong>
              </v-progress-linear>
            </VCol>
            <VCol class="ma-0 pa-0" cols="3">
              <div class="text-caption text-text" style="font-weight: 600">
                {{ localizeNumber(device.amount.toFixed(0)) }}
              </div>
            </VCol>
          </VRow>
        </VCol>
        <VCol cols="3" class="ma-0 pa-0 text-text">
          <div :style="responsiveTextStyles" class="pr-0 d-flex justify-end">
            {{ localizeNumber(props.weatherStationsActive.total) }}
          </div>
        </VCol>
      </VRow>
    </VSheet>
  </VSheet>
</template>

<style lang="scss" scoped>
  a:link {
    color: var(--anchor-color);
  }

  a:visited {
    color: var(--anchor-color);
  }
</style>
