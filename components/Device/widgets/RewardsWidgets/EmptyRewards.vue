<script setup lang="ts">
  import index from '~/assets/animations/index'
  import { useDisplay } from 'vuetify'
  const display = useDisplay()

  const smBreakpoing = computed(() => {
    return display.smAndDown
  })
</script>
<template>
  <VCard class="pa-6 mb-6" rounded="xl">
    <client-only>
      <Vue3Lottie
        :animation-data="index['rocketLottie']"
        :height="display.smAndDown ? 120 : 150"
        :width="display.smAndDown ? 120 : 150"
      />
    </client-only>

    <div class="text-text text-center">
      <div
        class="my-2 font-weight-bold"
        :style="smBreakpoing ? { 'font-size': '1.3rem' } : { 'font-size': '1.577rem' }"
      >
        Rewards Coming Soon!
      </div>
      <div>
        Your station hasn't received any rewards yet. Sit back and relax, while our systems are
        validating the station's location and data. You should start seeing rewards in the next
        couple of days.
      </div>
    </div>
  </VCard>
</template>

<style scoped></style>
