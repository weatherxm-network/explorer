<script lang="ts" setup>
  import { storeToRefs } from 'pinia'
  import wxmApi from '~/api/wxmApi'
  import { useSettingsStore } from '~/stores/settingsStore'

  const { theme } = storeToRefs(useSettingsStore())
  const config = useRuntimeConfig()

  const { getFirebaseId } = useFirebase()
  const { userAgent } = useUserAgent()
  const firebaseId = await getFirebaseId()

  useHead({
    script: [
      {
        src: `https://kit.fontawesome.com/${config.fontAwesomeProKitKey}.js`,
        crossorigin: 'anonymous',
      },
    ],
    link: [
      {
        href: `https://kit.fontawesome.com/${config.fontAwesomeProKitKey}.css`,
        rel: 'stylesheet',
        crossorigin: 'anonymous',
      },
    ],
  })

  onBeforeMount(() => {
    wxmApi.setupAxios(config.public.apiBaseUrl, userAgent, firebaseId)
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
