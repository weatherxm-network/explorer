<script setup lang="ts">
  import { useDisplay } from 'vuetify'

  import promoStationImg from '~/assets/StationImage.png'

  const SELLING_POINTS = [
  'Every station gets up to:',  
  '2.2 $WXM as base rewards',
    '+ 15 $WXM for cell bounty'
  ]

  const { trackGAevent } = useGAevents()

  const display = ref(useDisplay())

  const cardTitle = ref('Enter Weather 3.0')
  const cardSubtitle = ref('Deploy in your location, get your custom forecast and $WXM rewards.')
  const cardCtaText = ref('Buy Station')
  const cardCtaLink = ref('https://weatherxm.com/shop/')
</script>

<template>
  <VCard
    :class="display.smAndDown ? `pa-0 ma-0 mb-3` : `pa-0 ma-0 mb-4`"
    style="border-radius: 16px"
    color="blueTint"
    elevation="4"
  >
    <VCardText class="pa-0 ma-0">
      <VRow class="ma-0 pa-0">
        <VCol class="ma-0 px-4 pt-3 pb-0" cols="12">
          <VRow class="ma-0 pa-0">
            <div
              class="text-text"
              :style="{ 'font-size': '1.2rem', 'font-weight': 700 }"
            >
              {{ cardTitle }}
            </div>
          </VRow>
          <VRow class="ma-0 pa-0 mt-1">
            <div
              class="text-text"
              :style="{
                'font-size': '0.85rem',
                'font-weight': 500,
                width: '100%',
                'max-width': '100%',
              }"
            >
              {{ cardSubtitle }}
            </div>
          </VRow>
        </VCol>
      </VRow>

      <VRow class="ma-0 pa-0" align="start" justify="space-between">
        <VCol class="ma-0 pr-0 pt-2 pb-2 pl-4" cols="6">
          <VRow
            v-for="sp in SELLING_POINTS"
            :key="sp"
            class="ma-0 pa-2"
            align="center"
          >
            <div
              class="text-text d-flex justify-start"
              :style="{ 'font-size': '0.8rem', 'font-weight': 400 }"
            >
              <i
                v-if="sp !== SELLING_POINTS[0]"
                class="fa fa-check text-rewardVeryHigh mr-4"
                style="font-size: 1.2rem"
              />
              {{ sp }}
            </div>
          </VRow>

          <VRow class="ma-0 pa-0 mt-2" align="center">
            <VBtn
              :href="cardCtaLink"
              target="_blank"
              color="primary"
              class="text-top text-none px-5 pt-4 pb-4"
              elevation="0"
              style="
                height: 100%;
                width: 65%;
                font-weight: 700;
                border-radius: 8px;
                letter-spacing: normal;
              "
              @click="trackGAevent('clickOnOpenShop')"
            >
              {{ cardCtaText }}
            </VBtn>
          </VRow>
        </VCol>
        <VCol
          class="ma-0 pa-0 pr-2 pt-6 pb-2"
          :class="display.smAndDown ? 'pl-2' : 'pl-3'"
          :cols="6"
        >
          <img
            :src="promoStationImg"
            :style="{ objectFit: 'contain', width: '100%' }"
          />
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>
