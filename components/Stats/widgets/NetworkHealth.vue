<script setup lang="ts">
  import dayjs from 'dayjs'
  import { useDisplay } from 'vuetify'
  import LineChartComponent from './LineChartComponent.vue'
  import TooltipComponent from '~/components/common/TooltipComponent.vue'
  import type { NetworkStatsResponse } from '../types/stats'

  interface Props {
    health?: NetworkStatsResponse['net_health']
  }

  const props = withDefaults(defineProps<Props>(), {
    health: () => ({
      network_avg_qod: 0,
      network_uptime: 0,
      health_30days_graph: [],
      active_stations: 0,
      high_quality_stations: 0
    }),
  })

  const { trackGAevent } = useGAevents()
  const display = ref(useDisplay())

  const netHealthCardTitle = ref('Network Health')
  const netHealthUptimeSubtext = ref('Data quality')
  const netHealthQoDScoreLabel = ref('SYNOPTIC STATIONS')
  const netHealthActiveStationsLabel = ref('ACTIVE STATIONS')

  const tooltipTitle = ref('Network Health')
  const tooltipText = ref(
    'Reflects the overall performance and reliability of the network. It consists of data quality and number of healthy and synoptic stations to indicate how well the network is functioning and how trustworthy the collected data is.',
  )

  const dataQualityScoreTooltipTitle = ref('Data Quality Score')
  const dataQualityScoreTooltipText = ref(
    'Weather stations with high Data Quality Score above 87%',
  )

  const activeStationsTooltipTitle = ref('Active Stations')
  const activeStationsTooltipText = ref(
    'The number of weather stations that were active during the last day.',
  )

  const chartData = computed(() => {
    return props.health.health_30days_graph.map((point) => point.value)
  })

  const responsiveTextStyles = computed(() => {
    return display.value.smAndDown
      ? { 'font-size': '1.402rem', 'font-weight': 700 }
      : { 'font-size': '1.705rem', 'font-weight': 700 }
  })

  const activeStations = computed(() => {
    const formatter = new Intl.NumberFormat('en-GB', {})
    return formatter.format(props.health.active_stations)
  })

  const synopticStations = computed(() => {
    const formatter = new Intl.NumberFormat('en-GB', {})
    return formatter.format(props.health.high_quality_stations)
  })

  const percentageFormatter = (num: number) => {
    const formatter = new Intl.NumberFormat('en-GB', {
      maximumFractionDigits: 1,
      trailingZeroDisplay: 'stripIfInteger',
    })

    return formatter.format(num)
  }
</script>

<template>
  <VSheet
    color="top"
    style="border-radius: 16px"
    :class="display.smAndDown ? `mb-3` : `mb-4`"
    elevation="4"
  >
    <div
      class="px-2 pt-2 text-body-2 d-flex align-center justify-space-between"
    >
      <div
        style="font-size: 1.094rem; font-weight: 700"
        class="text-text pl-2 pt-1"
      >
        {{ netHealthCardTitle }}
      </div>
      <div
        @mouseenter="trackGAevent('clickInfoIcon', { ITEM_ID: 'data_days' })"
        @click="trackGAevent('clickInfoIcon', { ITEM_ID: 'data_days' })"
      >
        <TooltipComponent
          :message="tooltipText"
          :container="'any'"
          :tooltip-title="tooltipTitle"
        />
      </div>
    </div>
    <VRow class="ma-0 pa-0 pl-5 pt-6 d-flex pb-4 pr-7">
      <VCol class="ma-0 pa-0" cols="9">
        <VRow class="ma-0 pa-0">
          <LineChartComponent
            :data="chartData"
            class="pr-8 pl-2"
          ></LineChartComponent>
          <VRow class="ma-0 pa-0 d-flex justify-space-between pr-6 pt-2">
            <div
              v-if="props.health.health_30days_graph.length > 0"
              class="text-darkGrey text-uppercase"
              style="font-size: 0.778rem"
            >
              {{
                dayjs(props.health.health_30days_graph[0].ts).format('MMM DD')
              }}
            </div>
            <div
              v-if="props.health.health_30days_graph.length > 0"
              class="text-darkGrey text-uppercase"
              style="font-size: 0.778rem"
            >
              {{
                dayjs(
                  props.health.health_30days_graph[
                    props.health.health_30days_graph.length - 1
                  ].ts,
                ).format('MMM DD')
              }}
            </div>
          </VRow>
        </VRow>
      </VCol>
      <VCol class="ma-0 pa-0 d-flex align-center justify-center" cols="3">
        <div :style="responsiveTextStyles">
          <div
            class="text-text d-flex justify-center"
            style="line-height: 120%"
          >
            {{ percentageFormatter(props.health.network_avg_qod) }}%
          </div>
          <div
            class="text-darkGrey d-flex justify-center"
            :style="
              display.smAndDown
                ? { 'font-size': '0.691rem', 'font-weight': 400 }
                : { 'font-size': '0.778rem', 'font-weight': 400 }
            "
          >
            {{ netHealthUptimeSubtext }}
          </div>
        </div>
      </VCol>
    </VRow>
    <VRow class="px-2 pb-2 ma-0">
      <VCol class="pa-0 ma-0" cols="6">
        <VSheet
          class="px-4 pb-3 pt-3 ma-0 mr-1"
          color="layer1"
          style="border-radius: 8px"
        >
          <div class="d-flex justify-space-between align-center mb-4">
            <div class="text-text text-caption">
              {{ netHealthActiveStationsLabel }}
            </div>
            <div
              @mouseenter="
                trackGAevent('clickInfoIcon', { ITEM_ID: 'active_stations' })
              "
              @click="
                trackGAevent('clickInfoIcon', { ITEM_ID: 'active_stations' })
              "
            >
              <TooltipComponent
                :message="activeStationsTooltipText"
                :container="'any'"
                :tooltip-title="activeStationsTooltipTitle"
              />
            </div>
          </div>
          <div :style="responsiveTextStyles">
            <div class="text-text d-flex justify-start">
              {{ activeStations }}
            </div>
          </div>
        </VSheet>
      </VCol>
      <VCol class="pa-0 ma-0" cols="6">
        <VSheet
          class="px-4 pb-3 pt-3 ma-0 ml-1"
          color="layer1"
          style="border-radius: 8px"
        >
          <div class="d-flex justify-space-between align-center mb-4">
            <div class="text-text text-caption">
              {{ netHealthQoDScoreLabel }}
            </div>
            <div
              @mouseenter="
                trackGAevent('clickInfoIcon', { ITEM_ID: 'data_quality_score' })
              "
              @click="
                trackGAevent('clickInfoIcon', { ITEM_ID: 'data_quality_score' })
              "
            >
              <TooltipComponent
                :message="dataQualityScoreTooltipText"
                :container="'any'"
                :tooltip-title="dataQualityScoreTooltipTitle"
              />
            </div>
          </div>
          <div :style="responsiveTextStyles">
            <div
              v-if="netHealthQoDScoreLabel"
              class="text-text d-flex justify-start"
            >
              {{ synopticStations }}
            </div>
          </div>
        </VSheet>
      </VCol>
    </VRow>
  </VSheet>
</template>
