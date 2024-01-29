<script setup lang="ts">
  import { event } from 'vue-gtag'
  import getGAEvent from '~/utils/getGAEvent'

  const emits = defineEmits(['handleSettings'])

  const showSettings = () => {
    // track GA event
    trackEvent('explorer_settings')
    emits('handleSettings')
  }

  const trackEvent = (eventKey: string, parameters: any) => {
    const validEvent = getGAEvent.getEvent(eventKey, parameters)
    if (validEvent) {
      event(validEvent.eventName, validEvent.parameters)
    }
  }
</script>

<template>
  <div class="rounded-circle ml-3" style="cursor: pointer" @click="showSettings">
    <VSheet class="pa-2 rounded-circle elevation-4" color="top">
      <VIcon color="darkGrey" rounded="xl">mdi-cog</VIcon>
    </VSheet>
  </div>
</template>
