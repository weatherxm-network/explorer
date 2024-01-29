<script setup lang="ts">
  import { useDisplay } from 'vuetify'
  import { storeToRefs } from 'pinia'
  import { useMobileStore } from '~/stores/mobileStore'
  import Mapbox from '~/components/Mapbox/Mapbox.vue'

  const { pageState } = storeToRefs(useMobileStore())
  const display = ref(useDisplay())
</script>

<template>
  <VApp>
    <div v-if="!display.smAndDown">
      <VNavigationDrawer width="440" permanent location="left" color="background" :border="false">
        <div class="h-100 w-100">
          <VLayout>
            <slot />
          </VLayout>
        </div>
      </VNavigationDrawer>
    </div>
    <div v-if="display.smAndDown" style="z-index: 99">
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
    <VRow class="ma-0 pa-0 h-100 w-100" no-gutters>
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

  .v-navigation-drawer:not(.v-navigation-drawer--floating) .v-navigation-drawer__border {
    background-color: transparent !important;
  }
</style>
