<script setup lang="ts">
  import { useDisplay, useTheme } from 'vuetify'
  import numberFormater from '../utils/numberFormater'
  import TooltipComponent from '~/components/common/TooltipComponent.vue'

  interface Props {
    wxmTokenTotalSupply?: number
    wxmTokenDailyMinted?: number
    wxmTokenCirculatingSupply?: number
    wxmTokenContractUrl?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    wxmTokenDailyMinted: 0,
    wxmTokenTotalSupply: 0,
    wxmTokenCirculatingSupply: 0,
    wxmTokenContractUrl: ''
  })

  const { trackGAevent } = useGAevents()
  const display = ref(useDisplay())
  const theme = ref(useTheme())
  const wxmTokenCardTitle = ref('$WXM Token')

  const wxmTokenCardTotalText = ref('TOTAL SUPPLY')
  const wxmTokenCardCirculatingText = ref('CIRCULATING SUPPLY')
  const wxmTokenSubtitleLinkText = ref('View token contract on Etherscan')

  const wxmTokenCardTotalSupplyTooltipTitle = ref('Total Supply')
  const wxmTokenCardTotalSupplyTooltipText = ref(
    'Total supply refers to the number of $WXM that have already been created and are either in circulation or locked.'
  )
  const wxmTokenCardCirculatingTooltipTitle = ref('Circulating Supply')
  const wxmTokenCardCirculatingTooltipText = ref(
    'Circulating supply refers to the number of $WXM that are publicly available and circulating in the market.'
  )

  const responsiveTextStyles = computed(() => {
    return display.value.smAndDown
      ? { 'font-size': '1.402rem', 'font-weight': 700 }
      : { 'font-size': '1.705rem', 'font-weight': 700 }
  })

  const circulatingPercentage = computed(() => {
    return (props.wxmTokenCirculatingSupply / props.wxmTokenTotalSupply) * 100
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
      <div class="pl-2 pt-1 font-weight-bold" style="font-size: 1.094rem; font-weight: 700">
        {{ wxmTokenCardTitle }}
      </div>
    </div>

    <div
      class="mb-3 text-primary font-weight-black d-flex align-center"
      @click="trackGAevent('click_on_token_contract_link')"
      @mouseenter="trackGAevent('click_on_token_contract_link')"
    >
      <a :href="props.wxmTokenContractUrl" target="_blank" class="text-decoration-none">
        <span class="pl-2 pr-1">{{ wxmTokenSubtitleLinkText }}</span>
        <i class="fa-solid fa-arrow-up-right-from-square"></i
      ></a>
    </div>

    <VRow class="px-0 pb-0 ma-0">
      <VCol class="pa-0 ma-0" cols="6">
        <VSheet class="px-4 pb-3 pt-3 ma-0 mr-1 h-100" color="layer1" style="border-radius: 8px">
          <div class="d-flex justify-space-between align-center mb-4">
            <div class="text-text text-caption">{{ wxmTokenCardTotalText }}</div>
            <TooltipComponent
              :tooltip-title="wxmTokenCardTotalSupplyTooltipTitle"
              :message="wxmTokenCardTotalSupplyTooltipText"
              container="any"
            />
          </div>
          <div :style="responsiveTextStyles">
            {{ nFormat(props.wxmTokenTotalSupply) }}
          </div>
        </VSheet>
      </VCol>
      <VCol class="pa-0 ma-0" cols="6">
        <VSheet class="px-4 pb-3 pt-3 ma-0 ml-1" color="layer1" style="border-radius: 8px">
          <div
            :class="
              display.smAndDown
                ? `d-flex justify-space-between align-start mb-4`
                : `d-flex justify-space-between align-center mb-4`
            "
          >
            <div class="text-text text-caption">
              {{ wxmTokenCardCirculatingText }}
            </div>
            <TooltipComponent
              :tooltip-title="wxmTokenCardCirculatingTooltipTitle"
              :message="wxmTokenCardCirculatingTooltipText"
              container="any"
            />
          </div>
          <div :style="responsiveTextStyles" class="mb-4">
            {{ nFormat(props.wxmTokenCirculatingSupply) }}
          </div>
          <div>
            <v-progress-linear
              v-model="circulatingPercentage"
              :style="{
                backgroundColor: theme.current.colors.top
              }"
              :color="theme.current.dark ? `#2780FF4D` : `rgba(39, 128, 255, 0.30)`"
              :rounded="true"
            ></v-progress-linear>
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
