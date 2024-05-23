<script setup lang="ts">
  import { useTheme, useDisplay } from 'vuetify'
  import bannerBackground from '~/assets/bannerBackground.jpeg'

  const theme = useTheme()
  const display = useDisplay()
  const smBreakpoing = computed(() => {
    return display.smAndDown
  })

  const { fetchRemoteConfig } = useFirebase()
  const remoteConfig = await fetchRemoteConfig()
  const mainnetBannerText = ref<string>(`${remoteConfig.feat_mainnet_message._value}`)
  const mainnetUrl = ref<string>(`${remoteConfig.feat_mainnet_url._value}`)
</script>

<template>
  <VImg
    :src="bannerBackground"
    class="rounded-xl mb-4 d-flex justify-center align-center"
    style="cursor: pointer"
    @click="navigateTo(mainnetUrl, { open: { target: '_blank' } })"
  >
    <div
      class="d-flex flex-column text-center align-center justify-center px-1"
      :class="theme.current.value.dark ? `text-text` : 'text-top'"
    >
      <div
        :style="smBreakpoing ? { 'font-size': '1.5rem' } : { 'font-size': '1.75rem' }"
        class="font-weight-bold"
      >
        <i class="fa-regular fa-hexagon-check"></i>
        <span class="pl-2">Welcome to Mainnet!</span>
      </div>
      <div class="text-body-2 my-2">
        <div>{{ mainnetBannerText }}</div>
      </div>
    </div>
  </VImg>
</template>
