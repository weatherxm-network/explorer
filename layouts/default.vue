<script setup lang="ts">
  import { useDisplay } from 'vuetify'
  import { storeToRefs } from 'pinia'
  import { useMobileStore } from '~/stores/mobileStore'
  import { useInfoBannerStore } from '~/stores/infoBannerStore'
  import { useDrawerStore } from '~/stores/drawerStore'
  import Mapbox from '~/components/Mapbox/Mapbox.vue'
  import InfoBanner from '~/components/common/InfoBanner.vue'

  const mobileStore = useMobileStore()
  const { pageState } = storeToRefs(mobileStore)
  const drawerStore = useDrawerStore()
  const { isDesktopDrawerOpen } = storeToRefs(drawerStore)
  const infoBannerStore = useInfoBannerStore()
  const { isInfoBannerShown, elementHeight } = storeToRefs(infoBannerStore)
  const display = ref(useDisplay())
  const infoBannerRef = ref<HTMLDivElement>()

  const toggleDesktopDrawer = () => {
    drawerStore.toggleDesktopDrawerState()
  }
</script>

<template>
  <VApp>
    <InfoBanner ref="infoBannerRef" />
    <div v-if="!display.smAndDown" class="position-relative">
      <VNavigationDrawer
        v-if="isDesktopDrawerOpen"
        width="440"
        permanent
        location="left"
        color="background"
        class="position-absolute"
        :style="[
          isInfoBannerShown
            ? `height: calc(100vh - ${elementHeight || 0}px)`
            : 'height: 100vh',
        ]"
        :border="false"
      >
        <div class="h-100 w-100">
          <VLayout>
            <slot />
          </VLayout>
        </div>
      </VNavigationDrawer>
      <v-btn
        size="x-small"
        class="position-absolute flex items-center justify-center"
        :style="{
          left: isDesktopDrawerOpen ? '440px' : '0',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 100,
          borderRadius: '0 4px 4px 0',
          height: '48px',
          width: '24px',
        }"
        rounded="0"
        @click="toggleDesktopDrawer"
      >
        <i
          class="fa text-primary mt-6"
          :class="[
            isDesktopDrawerOpen ? 'fa-chevron-left' : 'fa-chevron-right',
          ]"
        ></i>
      </v-btn>
    </div>
    <div
      v-if="display.smAndDown"
      class="position-relative"
      :style="[`z-index: 50;`]"
    >
      <VNavigationDrawer
        :v-model="pageState"
        :width="display.width"
        :permanent="pageState"
        :style="[`padding-top: ${elementHeight}px`]"
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
