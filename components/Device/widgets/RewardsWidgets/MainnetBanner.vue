<script setup lang="ts">
  import { useTheme, useDisplay } from 'vuetify'
  import bannerBackground from '~/assets/bannerBackground.jpeg'

  interface Props {
    date?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    date: ''
  })

  const theme = useTheme()
  const display = useDisplay()
  const smBreakpoing = computed(() => {
    return display.smAndDown
  })

  console.log()
</script>

<template>
  <VImg
    :src="bannerBackground"
    class="rounded-xl mb-4 d-flex justify-center align-center mx-2 mt-2"
  >
    <div
      class="d-flex flex-column text-center align-center justify-center px-1"
      :class="theme.current.value.dark ? `text-text` : 'text-top'"
    >
      <div
        :style="smBreakpoing ? { 'font-size': '1.5rem' } : { 'font-size': '1.75rem' }"
        class="font-weight-bold"
      >
        <i class="fa-regular fa-badge-check"></i> <span>Welcome to Mainnet!</span>
      </div>
      <div class="text-body-2 my-2">
        <div>{{ `Starting the ${props.date}` }}</div>
        <div>all station rewards are distributed</div>
        <div>on Abritrum Mainnet!</div>
      </div>
      <div class="text-body-2">Thank you for the support!</div>
    </div>
  </VImg>
</template>
