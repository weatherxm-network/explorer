<script setup lang="ts">
  import { useDisplay, useTheme } from 'vuetify'
  import numberFormater from '../utils/numberFormater'
  import TooltipComponent from '~/components/common/TooltipComponent.vue'
  import type { v2TokenMetrics } from '../types/stats'
  import GaugeChart from './GaugeChart.vue'

  interface Props {
    tokenMetrics?: v2TokenMetrics
  }

  const props = withDefaults(defineProps<Props>(), {
    tokenMetrics: () => ({
      token: {
        circulating_supply: 0,
        total_supply: 0,
      },
      total_allocated: {
        base_rewards: 0,
        boost_rewards: 0,
        dune: {
          claimed: 0,
          dune_public_url: '',
          total: 0,
          unclaimed: 0,
        },
      },
    }),
  })

  const { trackGAevent } = useGAevents()
  const display = ref(useDisplay())
  const theme = ref(useTheme())
  const cardTitle = ref('Total $WXM allocated')

  const cardLeftCellText = ref('BASE REWARDS')
  const cardRighCellText = ref('BOOST REWARDS')
  const cardSubtitleLinkText = ref('View network stats on Dune')

  const cardLeftCellTooltipTitle = ref('Base Rewards')
  const cardLeftCellTooltipText = ref(
    'The standard $WXM tokens that weather stations earn for consistently providing reliable data. These are regular rewards received by stations on a daily basis for their normal operation.',
  )
  const cardRightCellTooltipTitle = ref('Boost Rewards')
  const cardRightCellTooltipText = ref(
    'Boost Rewards are extra tokens awarded for special contributions or actions.',
  )

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
    :class="display.smAndDown ? `pa-2 mb-3` : `pa-2 mb-4`"
    elevation="4"
  >
    <div
      class="mb-2 text-body-2 d-flex align-center justify-space-between"
      style="line-height: 150%"
    >
      <div
        class="pl-2 pt-1 font-weight-bold"
        style="font-size: 1.094rem; font-weight: 700"
      >
        {{ cardTitle }}
      </div>
    </div>

    <div
      class="mb-3 text-primary font-weight-black d-flex align-center"
      @click="trackGAevent('click_on_token_contract_link')"
      @mouseenter="trackGAevent('click_on_token_contract_link')"
    >
      <a
        :href="props.tokenMetrics.total_allocated.dune.dune_public_url"
        target="_blank"
        class="text-decoration-none"
      >
        <span class="pl-2 pr-1">{{ cardSubtitleLinkText }}</span>
        <i class="fa-solid fa-arrow-up-right-from-square"></i
      ></a>
    </div>
    <VRow class="px-0 pb-0 ma-0">
      <VContainer>
        <GaugeChart
          :claimed="props.tokenMetrics.total_allocated.dune.claimed"
          :total="props.tokenMetrics.total_allocated.dune.total"
          :reserved="props.tokenMetrics.total_allocated.dune.unclaimed"
        />
      </VContainer>
    </VRow>

    <VRow class="px-0 pb-0 ma-0">
      <VCol class="pa-0 ma-0" cols="6">
        <VSheet
          class="px-4 pb-3 pt-3 ma-0 mr-1 h-100"
          color="layer1"
          style="border-radius: 8px"
        >
          <div class="d-flex justify-space-between align-center mb-4">
            <div class="text-text text-caption">
              {{ cardLeftCellText }}
            </div>
            <TooltipComponent
              :tooltip-title="cardLeftCellTooltipTitle"
              :message="cardLeftCellTooltipText"
              container="any"
            />
          </div>
          <div :style="responsiveTextStyles">
            {{ nFormat(props.tokenMetrics.total_allocated.base_rewards) }}
          </div>
        </VSheet>
      </VCol>
      <VCol class="pa-0 ma-0" cols="6">
        <VSheet
          class="px-4 pb-3 pt-3 ma-0 ml-1"
          color="layer1"
          style="border-radius: 8px"
        >
          <div
            :class="
              display.smAndDown
                ? `d-flex justify-space-between align-start mb-4`
                : `d-flex justify-space-between align-center mb-4`
            "
          >
            <div class="text-text text-caption">
              {{ cardRighCellText }}
            </div>
            <TooltipComponent
              :tooltip-title="cardRightCellTooltipTitle"
              :message="cardRightCellTooltipText"
              container="any"
            />
          </div>
          <div :style="responsiveTextStyles" class="mb-4">
            {{ nFormat(props.tokenMetrics.total_allocated.boost_rewards) }}
          </div>
        </VSheet>
      </VCol>
    </VRow>
  </VSheet>
</template>

<style lang="scss">
  a:link {
    color: var(--anchor-color);
  }

  a:visited {
    color: var(--anchor-color);
  }
  .v-progress-linear__determinate {
    border-radius: 4px !important;
  }
</style>
