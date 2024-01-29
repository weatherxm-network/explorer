<script setup lang="ts">
  import { useDisplay, useTheme } from 'vuetify'
  import { reactive } from 'vue'
  import { useMobileStore } from '~/stores/mobileStore'

  const display = ref(useDisplay())
  const mobileStore = useMobileStore()
  const netStatStyle = reactive({
    position: 'absolute',
    right: 'calc(50% - 94px)',
    top: 'calc(100% - 96px)',
    zIndex: '9',
    height: '42px !important'
  })

  const theme = useTheme()
  const currentTheme = computed(() => {
    return theme.global.name.value === 'dark'
  })
  const networkStatsButtonText = ref('Network Statistics')

  const openNetStat = () => {
    navigateTo('/stats')
    mobileStore.setPageState(true)
  }
</script>

<template>
  <VBtn
    v-if="display.smAndDown"
    elevation="4"
    :color="currentTheme ? 'primary' : 'lightestBlue'"
    class="px-5 pb-3 pt-3 d-flex align-center text-none rounded-pill"
    :style="netStatStyle"
    @click="openNetStat"
  >
    <i class="fa-regular fa-chart-line" :class="currentTheme ? 'text-top' : 'text-text'"></i>
    <div
      class="pl-3 text-body-2"
      :class="currentTheme ? 'top-text' : 'text-text'"
      style="line-height: 24px"
    >
      {{ networkStatsButtonText }}
    </div>
  </VBtn>
</template>
