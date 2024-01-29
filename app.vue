<script lang="ts" setup>
  import { storeToRefs } from 'pinia'
  import wxmApi from '~/api/wxmApi'
  import { useSettingsStore } from '~/stores/settingsStore'

  const { theme } = storeToRefs(useSettingsStore())
  const config = useRuntimeConfig().public

  const { getFirebaseId } = useFirebase()
  const { userAgent } = useUserAgent()
  const firebaseId = await getFirebaseId()

  onBeforeMount(() => {
    wxmApi.setupAxios(config.apiUrl, userAgent, firebaseId)
  })
</script>

<template>
  <div>
    <VThemeProvider :theme="theme.currentTheme">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </VThemeProvider>
  </div>
</template>

<style>
  html {
    overflow: hidden !important;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  html::-webkit-scrollbar {
    width: 0;
    height: 0;
  }
</style>
