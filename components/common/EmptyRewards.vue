<script setup lang="ts">
  import { useDisplay, useTheme } from 'vuetify'
  import index from '~/assets/animations/index'
  const display = useDisplay()
  const theme = useTheme()

  const smBreakpoing = computed(() => {
    return display.smAndDown
  })

  const title = ref('Rewards Coming Soon!')
  const text = ref(
    `Station hasn't received any rewards yet. Sit back and relax, while our systems are validating the station's location and data. The station should start receiving rewards in the next couple of days.`
  )

  const tipTitle = ref('Pro Tip')
  const tipText = ref(
    'Don’t worry if you see any errors and reward losses for the first 2-3 days after claiming your station. This is expected. Keep calm and wait for the full rewards!'
  )

  const addAlpha = (color: string, opacity: number) => {
    const _opacity = Math.round(Math.min(Math.max(opacity ?? 1, 0), 1) * 255)
    return color + _opacity.toString(16).toUpperCase()
  }

  const calcProTipBackgroundColor = computed(() => {
    return theme.current.value.dark
      ? addAlpha(theme.themes.value.light.colors.darkGrey, 0.5)
      : addAlpha(theme.themes.value.light.colors.blueTint, 0.5)
  })
</script>
<template>
  <VCard class="pa-6 mb-6 mx-2 mt-2" rounded="xl">
    <client-only>
      <Vue3Lottie
        :animation-data="index['wenMoonSimple']"
        :height="display.smAndDown ? 120 : 150"
        :width="display.smAndDown ? 120 : 150"
      />
    </client-only>

    <div class="text-text text-center my-4 py-2">
      <div
        class="mb-2 font-weight-bold"
        :style="smBreakpoing ? { 'font-size': '1.3rem' } : { 'font-size': '1.577rem' }"
      >
        {{ title }}
      </div>
      <div>
        {{ text }}
      </div>
    </div>
    <VSheet class="d-flex" :color="calcProTipBackgroundColor">
      <div :style="{ borderLeft: `1px solid ${theme.current.value.colors.primary}` }"></div>
      <div class="pa-2 text-text">
        <div style="font-size: 0.75rem; font-weight: 600; letter-spacing: normal" class="mb-1">
          {{ tipTitle }}
        </div>
        <div class="text-caption" style="letter-spacing: normal; line-height: 16px">
          {{ tipText }}
        </div>
      </div>
    </VSheet>
  </VCard>
</template>
