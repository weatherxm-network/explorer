<script setup lang="ts">
  import { useDisplay } from 'vuetify'
  import { useMobileStore } from '~/stores/mobileStore'

  const display = ref(useDisplay())
  const mobileStore = useMobileStore()
  const netStatsMobileHeaderText = ref('Network Statistics')

  const closeMobilePage = () => {
    mobileStore.setPageState(false)
    navigateTo('/')
  }
</script>

<template>
  <div v-if="display.smAndDown" class="pa-8 pb-3 d-flex align-center">
    <i
      class="fa fa-arrow-left text-primary mr-4"
      style="font-size: 1.2rem"
      @click="closeMobilePage"
    ></i>
    <span class="ma-0 pa-0 font-weight-bold" style="font-size: 1.577rem">{{
      netStatsMobileHeaderText
    }}</span>
  </div>
</template>
