<script setup lang="ts">
  const { fetchRemoteConfig } = useFirebase()
  const { trackGAevent } = useGAevents()
  const remoteConfig = await fetchRemoteConfig()
  const contactCardTitle = computed(() => {
    return remoteConfig?.contact_card_title?._value ?? 'Are you a manufacturer?'
  })

  const contactCardButtonText = computed(() => {
    return remoteConfig?.contact_card_subtitle?._value ?? 'Join the ecosystem'
  })

  const contactCardButtonLink = computed(() => {
    return (
      remoteConfig?.contact_card_button_link?._value ??
      'https://weatherxm.com/contact/'
    )
  })
</script>

<template>
  <VCard
    color="blueTint"
    elevation="4"
    :style="{
      marginLeft: '-20px',
      marginRight: '-20px',
    }"
  >
    <VCardText class="pa-0 ma-0">
      <VRow class="ma-0 pa-6" align="center" justify="space-between">
        <div
          class="text-text mr-1"
          :style="{ 'font-size': '0.9rem', 'font-weight': 400 }"
        >
          {{ contactCardTitle }}
        </div>
        <a
          :href="contactCardButtonLink"
          target="_blank"
          class="text-primary ml-2"
          :style="{
            height: '100%',
            fontWeight: 500,
            fontSize: '0.9rem',
            letterSpacing: 'normal',
          }"
          @click="trackGAevent('clickOnManufacturerContactUs')"
        >
          {{ contactCardButtonText }}
        </a>
      </VRow>
    </VCardText>
  </VCard>
</template>
