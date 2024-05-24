<script setup lang="ts">
  import { useDisplay } from 'vuetify'
  import { ref, computed } from 'vue'
  import numberFormater from '../utils/numberFormater'
  import LineChartComponent from './LineChartComponent.vue'
  import TooltipComponent from '~/components/common/TooltipComponent.vue'

  interface Props {
    rewardsChartData?: number[]
    rewardsLastAndProgress?: {
      lastValue?: string
      progress?: string
    }
    rewardsChartLabels?: string[]
    rewards30DaysTotal?: number
    rewardsLastRunUrl?: string
    rewardsContractUrl?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    rewardsChartData: () => [],
    rewardsLastAndProgress: () => ({
      lastValue: '0',
      progress: '0'
    }),
    rewardsChartLabels: () => [],
    rewards30DaysTotal: 0,
    rewardsLastRunUrl: '',
    rewardsContractUrl: ''
  })

  const { trackGAevent } = useGAevents()
  const display = ref(useDisplay())
  const rewardsCardTitle = ref('$WXM Rewards')
  const rewardsCardLast30DaysText = ref('Last 30 Days')
  const rewardsCardTotalText = ref('TOTAL')
  const rewardsCardLastRunText = ref('LAST RUN')
  const rewardsSubtitleLinkText = ref('View rewards contract on Arbiscan')
  const tottalAllocatedRewardsMessage = ref(
    'Station owners are rewarded in $WXM for providing data to the WeatherXM Network.'
  )
  const tooltipTitle = ref('$WXM Rewards')

  const responsiveTextStyles = computed(() => {
    return display.value.smAndDown
      ? { 'font-size': '1.402rem', 'font-weight': 700 }
      : { 'font-size': '1.705rem', 'font-weight': 700 }
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
    <div class="pl-2 pt-2 pr-2 mb-2 text-body-2 d-flex align-center justify-space-between">
      <div style="font-size: 1.094rem; font-weight: 700" class="text-text pl-2 pt-1">
        {{ rewardsCardTitle }}
      </div>
      <div
        @mouseenter="trackGAevent('clickInfoIcon', { ITEM_ID: 'allocated_rewards' })"
        @click="trackGAevent('clickInfoIcon', { ITEM_ID: 'allocated_rewards' })"
      >
        <TooltipComponent
          :message="tottalAllocatedRewardsMessage"
          :container="'any'"
          :tooltip-title="tooltipTitle"
        />
      </div>
    </div>
    <div
      class="px-2 text-primary font-weight-black d-flex align-center"
      @click="trackGAevent('click_on_reward_contract_link')"
      @mouseenter="trackGAevent('click_on_reward_contract_link')"
    >
      <a :href="props.rewardsContractUrl" target="_blank" class="text-decoration-none">
        <span class="pl-2 pr-1">{{ rewardsSubtitleLinkText }}</span>
        <i class="fa-solid fa-arrow-up-right-from-square"></i>
      </a>
    </div>

    <VRow class="ma-0 pa-0 pl-5 pt-6 d-flex pb-4 pr-7">
      <VCol class="ma-0 pa-0" cols="9">
        <VRow class="ma-0 pa-0">
          <LineChartComponent
            :data="props.rewardsChartData"
            class="pr-11 pl-4"
          ></LineChartComponent>
          <VRow class="ma-0 pa-0 d-flex justify-space-between pr-6 pt-2">
            <div class="text-darkGrey text-uppercase" style="font-size: 0.778rem">
              {{ props.rewardsChartLabels[0] }}
            </div>
            <div class="text-darkGrey text-uppercase" style="font-size: 0.778rem">
              {{ props.rewardsChartLabels[1] }}
            </div>
          </VRow>
        </VRow>
      </VCol>
      <VCol class="ma-0 pa-0 d-flex align-center justify-center" cols="3">
        <div :style="responsiveTextStyles">
          <div class="text-text d-flex justify-center" style="line-height: 120%">
            {{ nFormat(props.rewards30DaysTotal) }}
          </div>
          <div
            class="text-darkGrey d-flex justify-center"
            :style="
              display.smAndDown
                ? { 'font-size': '0.691rem', 'font-weight': 400 }
                : { 'font-size': '0.778rem', 'font-weight': 400 }
            "
          >
            {{ rewardsCardLast30DaysText }}
          </div>
        </div>
      </VCol>
    </VRow>

    <VRow class="px-2 pb-2 ma-0">
      <VCol class="pa-0 ma-0" cols="6">
        <VSheet class="px-4 pb-3 pt-3 ma-0 mr-1" color="layer1" style="border-radius: 8px">
          <div class="d-flex justify-space-between align-center mb-4">
            <div class="text-text text-caption">{{ rewardsCardTotalText }}</div>
          </div>
          <div :style="responsiveTextStyles">
            <div class="text-text d-flex justify-start">
              {{ props.rewardsLastAndProgress.lastValue }}
            </div>
          </div>
        </VSheet>
      </VCol>
      <VCol class="pa-0 ma-0" cols="6">
        <a :href="props.rewardsLastRunUrl" target="_blank" class="text-decoration-none">
          <VSheet
            class="px-4 pb-3 pt-3 ma-0 ml-1"
            color="layer1"
            style="border-radius: 8px"
            @mouseenter="trackGAevent('click_on_reward_last_run')"
            @click="trackGAevent('click_on_reward_last_run')"
          >
            <div class="d-flex justify-space-between align-center mb-4 text-caption">
              <div class="tex-text">{{ rewardsCardLastRunText }}</div>
              <i class="fa-solid fa-arrow-up-right-from-square"></i>
            </div>
            <div :style="responsiveTextStyles">
              <div class="text-rewardVeryHigh d-flex justify-start">
                +{{ props.rewardsLastAndProgress.progress }}
              </div>
            </div>
          </VSheet>
        </a>
      </VCol>
    </VRow>
  </VSheet>
</template>
