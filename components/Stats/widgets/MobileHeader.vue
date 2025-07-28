<script setup lang="ts">
  import { useDisplay } from 'vuetify'
  import { useMobileStore } from '~/stores/mobileStore'
  import { useRoute } from 'nuxt/app'

  const route = useRoute()
  const display = ref(useDisplay())
  const mobileStore = useMobileStore()

  const SUB_ROUTES = ['/stats/stations-growth', '/stats/token-metrics']

  const mobileHeader = computed(() => {
    if (route.path === '/stats/token-metrics') {
      return 'Token metrics'
    }

    if (route.path === '/stats/stations-growth') {
      return 'Network growth'
    }

    return 'Network Statistics'
  })

  const closeMobilePage = () => {
    mobileStore.setPageState(false)

    if (SUB_ROUTES.includes(route.path)) return navigateTo('/stats')

    return navigateTo('/')
  }
</script>

<template>
  <div v-if="display.smAndDown" class="pa-8 pb-3 d-flex align-center">
    <i
      class="fa fa-arrow-left text-primary mr-4"
      style="font-size: 1.2rem"
      @click="closeMobilePage"
    ></i>
    <span class="ma-0 pa-0 font-weight-bold" style="font-size: 1.577rem">
      {{ mobileHeader }}
    </span>
  </div>
</template>
