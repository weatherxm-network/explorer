<script setup lang="ts">
  import { useDisplay } from 'vuetify'
  import { event } from 'vue-gtag'
  import numberFormater from '../utils/numberFormater'
  import getGAEvent from '~/utils/getGAEvent'

  interface Props {
    wxmTokenTotalSupply?: number
    wxmTokenDailyMinted?: number
  }

  const props = withDefaults(defineProps<Props>(), {
    wxmTokenDailyMinted: 0,
    wxmTokenTotalSupply: 0
  })

  const display = ref(useDisplay())
  const wxmTokenCardTitle = ref('$WXM Token')
  const wxmTokenCardContentText = ref('Deployed on Testnet -')
  const wxmTokenCardContentLinkText = ref('Read more here')
  const wxmTokenCardTotalText = ref('TOTAL SUPPLY')
  const wxmTokenCardMintedText = ref('DAILY MINTED')

  const responsiveTextStyles = computed(() => {
    return display.value.smAndDown
      ? { 'font-size': '1.402rem', 'font-weight': 700 }
      : { 'font-size': '1.705rem', 'font-weight': 700 }
  })

  const clickOnLink = () => {
    // track GA event
    trackEvent('clickOnReadMoreForTokenomicsLink')
    window.open('https://docs.weatherxm.com/tokenomics', '_blank')
  }

  const nFormat = (number: number) => {
    return numberFormater.nFormatter(number)
  }
  const localizeNumber = (number: number) => {
    return numberFormater.localizeNumberFormat(number)
  }
  // track event
  const trackEvent = (eventKey: string, parameters: any) => {
    const validEvent = getGAEvent.getEvent(eventKey, parameters)
    if (validEvent) {
      event(validEvent.eventName, validEvent.parameters)
    }
  }
</script>

<template>
  <VSheet color="top" style="border-radius: 16px" class="mb-4" elevation="4">
    <div
      class="pl-5 pt-3 pr-6 text-body-2 d-flex align-center justify-space-between"
      style="line-height: 150%"
    >
      <div style="font-size: 1.094rem; font-weight: 700">{{ wxmTokenCardTitle }}</div>
    </div>

    <div class="pl-5 pt-1 mb-3 text-body-2 d-flex align-center">
      <div class="text-text" style="letter-spacing: normal">{{ wxmTokenCardContentText }}</div>

      <div
        class="d-flex align-center pl-1 text-decoration-none text-darkestBlue"
        style="font-weight: 700; cursor: pointer; letter-spacing: normal"
        @click="clickOnLink"
      >
        {{ wxmTokenCardContentLinkText }}
        <i class="fa-solid fa-arrow-up-right-from-square pl-1" style="font-size: 11px"></i>
      </div>
    </div>

    <VRow class="px-2 pb-2 ma-0">
      <VCol class="pa-0 ma-0" cols="6">
        <VSheet class="px-4 pb-3 pt-3 ma-0 mr-1" color="layer1" style="border-radius: 8px">
          <div class="d-flex justify-space-between align-center mb-4">
            <div class="text-text text-caption">{{ wxmTokenCardTotalText }}</div>
          </div>
          <div :style="responsiveTextStyles">
            {{ nFormat(props.wxmTokenTotalSupply) }}
          </div>
        </VSheet>
      </VCol>
      <VCol class="pa-0 ma-0" cols="6">
        <VSheet class="px-4 pb-3 pt-3 ma-0 ml-1" color="layer1" style="border-radius: 8px">
          <div class="d-flex justify-space-between align-center mb-4">
            <div class="text-text text-caption">{{ wxmTokenCardMintedText }}</div>
          </div>
          <div :style="responsiveTextStyles">{{ localizeNumber(props.wxmTokenDailyMinted) }}</div>
        </VSheet>
      </VCol>
    </VRow>
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
