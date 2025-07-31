<script setup lang="ts">
  import dayjs from 'dayjs'
  import { useDisplay } from 'vuetify'
  import { ref, computed } from 'vue'
  import numberFormater from '../utils/numberFormater'
  import LineChartComponent from './LineChartComponent.vue'
  import type { NetworkStatsResponse } from '../types/stats'

  interface Props {
    growth?: NetworkStatsResponse['net_growth']
  }

  const props = withDefaults(defineProps<Props>(), {
    growth: () => ({
      last_30days: 0,
      last_30days_graph: [],
      network_scale_up: 0,
      network_size: 0,
    }),
  })

  const display = ref(useDisplay())
  const cardTitle = ref('Network Growth')
  const cardMainSubtext = ref('Network scale up')
  const cardLeftColText = ref('NETWORK SIZE')
  const cardRightColText = ref('ADDED IN LAST 30 DAYS')

  const responsiveTextStyles = computed(() => {
    return display.value.smAndDown
      ? { 'font-size': '1.402rem', 'font-weight': 700 }
      : { 'font-size': '1.705rem', 'font-weight': 700 }
  })

  const lastRunGraphData = computed(() => {
    return props.growth.last_30days_graph.map((point) => point.value)
  })

  const nFormat = (number: number) => {
    return numberFormater.nFormatter(number)
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
      class="pl-2 pt-2 pr-2 mb-2 text-body-2 d-flex align-center justify-space-between"
    >
      <div
        style="font-size: 1.094rem; font-weight: 700"
        class="text-text pl-2 pt-1"
      >
        {{ cardTitle }}

        <i
          class="fa fa-chevron-right text-primary ml-2 mr-4 cursor-pointer"
          style="font-size: 1.2rem"
          @click="() => navigateTo('/stats/stations-growth')"
        ></i>
      </div>
    </div>

    <VRow class="ma-0 pa-0 pl-5 pt-6 d-flex pb-4 pr-7">
      <VCol class="ma-0 pa-0" cols="9">
        <VRow class="ma-0 pa-0">
          <LineChartComponent
            :data="lastRunGraphData"
            class="pr-8 pl-2"
          ></LineChartComponent>
          <VRow class="ma-0 pa-0 d-flex justify-space-between pr-6 pt-2">
            <div
              v-if="props.growth.last_30days_graph.length > 0"
              class="text-darkGrey text-uppercase"
              style="font-size: 0.778rem"
            >
              {{ dayjs(props.growth.last_30days_graph[0].ts).format('MMM DD') }}
            </div>
            <div
              v-if="props.growth.last_30days_graph.length > 0"
              class="text-darkGrey text-uppercase"
              style="font-size: 0.778rem"
            >
              {{
                dayjs(
                  props.growth.last_30days_graph[
                    props.growth.last_30days_graph.length - 1
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
            {{ props.growth.network_scale_up }}%
          </div>
          <div
            class="text-darkGrey d-flex justify-center"
            :style="
              display.smAndDown
                ? { 'font-size': '0.691rem', 'font-weight': 400 }
                : { 'font-size': '0.778rem', 'font-weight': 400 }
            "
          >
            {{ cardMainSubtext }}
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
            <div class="text-text text-caption">{{ cardLeftColText }}</div>
          </div>
          <div :style="responsiveTextStyles">
            <div class="text-text d-flex justify-start">
              {{ nFormat(props.growth.network_size) }}
            </div>
          </div>
        </VSheet>
      </VCol>

      <VCol class="pa-0 ma-0" cols="6">
        <VSheet
          class="px-4 pb-3 pt-3 ma-0 mr-1"
          color="layer1"
          style="border-radius: 8px"
        >
          <div class="d-flex justify-space-between align-center mb-4">
            <div class="text-text text-caption">{{ cardRightColText }}</div>
          </div>
          <div :style="responsiveTextStyles">
            <div class="text-text d-flex justify-start">
              {{ nFormat(props.growth.last_30days) }}
            </div>
          </div>
        </VSheet>
      </VCol>
    </VRow>
  </VSheet>
</template>
