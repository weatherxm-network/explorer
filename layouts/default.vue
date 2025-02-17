<script setup lang="ts">
  import { useDisplay } from 'vuetify'
  import { storeToRefs } from 'pinia'
  import { useMobileStore } from '~/stores/mobileStore'
  import { useInfoBannerStore } from '~/stores/infoBannerStore'
  import Mapbox from '~/components/Mapbox/Mapbox.vue'
  import InfoBanner from '~/components/common/InfoBanner.vue'

  const { pageState } = storeToRefs(useMobileStore())
  const infoBannerStore = useInfoBannerStore()
  const { isInfoBannerShown } = storeToRefs(infoBannerStore)
  const display = ref(useDisplay())
</script>

<template>
  <VApp>
    <InfoBanner />
    <div v-if="!display.smAndDown" class="position-relative">
      <VNavigationDrawer
        width="440"
        permanent
        location="left"
        color="background"
        class="position-absolute"
        :style="[
          isInfoBannerShown ? 'height: calc(98vh - 0px)' : 'height: 100vh',
        ]"
        :border="false"
      >
        <div class="h-100 w-100">
          <VLayout>
            <slot />
          </VLayout>
        </div>
      </VNavigationDrawer>
    </div>
    <div v-if="display.smAndDown" class="position-relative" style="z-index: 50">
      <VNavigationDrawer
        :v-model="pageState"
        :width="display.width"
        :permanent="pageState"
        touchless
        location="right"
        color="background"
      >
        <div class="pa-0 h-100 w-100">
          <VLayout>
            <slot />
          </VLayout>
        </div>
      </VNavigationDrawer>
    </div>
    <VRow class="ma-0 pa-0 h-100 w-100 position-relative" no-gutters>
      <VCol class="pa-0 ma-0">
        <div style="width: 100%; height: 100%">
          <Mapbox />
        </div>
      </VCol>
    </VRow>
    <NuxtSnackbar />
  </VApp>
</template>

<style>
  .v-navigation-drawer {
    border-style: none !important;
  }

  .v-navigation-drawer__content::-webkit-scrollbar {
    width: 0px;
  }

  .v-navigation-drawer:not(.v-navigation-drawer--floating)
    .v-navigation-drawer__border {
    background-color: transparent !important;
  }
</style>
