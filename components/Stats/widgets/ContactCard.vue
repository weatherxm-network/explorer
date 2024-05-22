<script setup lang="ts">
  import { useDisplay } from 'vuetify'

  const display = ref(useDisplay())
  const { fetchRemoteConfig } = useFirebase()
  const { trackGAevent } = useGAevents()
  const remoteConfig = await fetchRemoteConfig()
  const contactCardTitle = computed(() => {
    return remoteConfig?.contact_card_title?._value ?? 'Are you a manufacturer?'
  })

  const contactCardSubtitle = computed(() => {
    return remoteConfig?.contact_card_subtitle?._value ?? 'Join the ecosystem'
  })

  const contactCardButtonText = computed(() => {
    return remoteConfig?.contact_card_button_text?._value ?? 'Contact us'
  })

  const contactCardButtonLink = computed(() => {
    return remoteConfig?.contact_card_button_link?._value ?? 'https://weatherxm.com/contact/'
  })
</script>

<template>
  <VCard
    :class="display.smAndDown ? `pa-0 mb-3 ` : `pa-0 mb-4`"
    style="border-radius: 16px"
    color="blueTint"
    elevation="4"
  >
    <VCardText class="pa-0 ma-0">
      <VRow class="ma-0 pa-0" align="center" justify="space-between">
        <VCol class="ma-0 pr-0 pt-2 pb-2" :class="display.smAndDown ? 'pl-3' : 'pl-4'" cols="8">
          <div class="text-text d-flex align-center">
            <div :style="{ 'font-size': '0.8rem', 'font-weight': 400 }">
              {{ contactCardTitle }}
            </div>
          </div>
          <div :style="{ 'font-size': '1.108rem', 'font-weight': 700 }" class="text-darkestBlue">
            {{ contactCardSubtitle }}
          </div>
        </VCol>
        <VCol
          class="ma-0 pa-0 pr-2 pt-2 pb-2"
          :class="display.smAndDown ? 'pl-2' : 'pl-3'"
          :cols="4"
        >
          <VBtn
            :href="contactCardButtonLink"
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
            @click="trackGAevent('clickOnManufacturerContactUs')"
            >{{ contactCardButtonText }}</VBtn
          >
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>
