<script setup lang="ts">
  import { useDisplay } from 'vuetify'
  import TooltipComponent from '~/components/common/TooltipComponent.vue'

  interface Props {
    avgMonthly?: number
  }

  const props = withDefaults(defineProps<Props>(), {
    avgMonthly: 0
  })

  const { fetchRemoteConfig } = useFirebase()
  const { trackGAevent } = useGAevents()
  const remoteConfig = await fetchRemoteConfig()

  const display = ref(useDisplay())

  const shopCardMessage = ref(
    'The average amount of tokens rewarded to a weather station in the last 30 days.'
  )

  const monthlyAvg = computed(() => {
    return props.avgMonthly.toFixed(0)
  })

  const shopCardTitle = computed(() => {
    return remoteConfig?.shop_card_title?._value ?? 'Join the weather revolution'
  })

  const shopCardSubtitle = computed(() => {
    return remoteConfig?.shop_card_subtitle?._value
      ? remoteConfig.shop_card_subtitle._value.replace('%MONTHLY_AVG_VALUE%', monthlyAvg.value)
      : `Earn ${monthlyAvg.value} $WXM /mo`
  })

  const shopCardButtonText = computed(() => {
    return remoteConfig?.shop_card_button_text?._value ?? 'Buy a station'
  })

  const shopCardButtonLink = computed(() => {
    return remoteConfig?.shop_card_button_link?._value ?? 'https://shop.weatherxm.com'
  })
</script>

<template>
  <VCard
    :class="display.smAndDown ? `pa-0 ma-0 mb-3` : `pa-0 ma-0 mb-4`"
    style="border-radius: 16px"
    color="blueTint"
    elevation="4"
  >
    <VCardText class="pa-0 ma-0">
      <VRow class="ma-0 pa-0" align="center" justify="space-between">
        <VCol class="ma-0 pr-0 pt-2 pb-2 pl-4" cols="8">
          <VRow class="ma-0 pa-0" align="center">
            <div>
              <div class="text-text" :style="{ 'font-size': '0.8rem', 'font-weight': 400 }">
                {{ shopCardTitle }}
              </div>

              <div class="d-flex align-center text-darkestBlue">
                <div :style="{ 'font-size': '1.108rem', 'font-weight': 700 }">
                  {{ shopCardSubtitle }}
                </div>
                <div :style="{ 'font-size': '0.8rem', 'font-weight': 400 }">
                  <div
                    @mouseenter="trackGAevent('clickInfoIcon', { ITEM_ID: 'buy_station' })"
                    @click="trackGAevent('clickInfoIcon', { ITEM_ID: 'buy_station' })"
                  >
                    <TooltipComponent :message="shopCardMessage" :container="'any'" />
                  </div>
                </div>
              </div>
            </div>
          </VRow>
        </VCol>
        <VCol
          class="ma-0 pa-0 pr-2 pt-2 pb-2"
          :class="display.smAndDown ? 'pl-2' : 'pl-3'"
          :cols="4"
        >
          <VBtn
            :href="shopCardButtonLink"
            target="_blank"
            color="primary"
            class="text-top text-none px-5 pt-4 pb-4"
            elevation="0"
            style="
              height: 100%;
              width: 100%;
              font-weight: 700;
              border-radius: 8px;
              letter-spacing: normal;
            "
            @click="trackGAevent('clickOnOpenShop')"
            >{{ shopCardButtonText }}</VBtn
          >
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>
