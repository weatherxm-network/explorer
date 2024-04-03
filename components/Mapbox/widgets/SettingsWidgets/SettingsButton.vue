<script setup lang="ts">
  const emits = defineEmits(['handleSettings'])
  const { trackGAevent } = useGAevents()

  const showSettings = () => {
    // track GA event
    trackGAevent('explorer_settings')
    emits('handleSettings')
  }
</script>

<template>
  <div class="rounded-circle ml-3" style="cursor: pointer" @click="showSettings">
    <VSheet class="pa-2 rounded-circle elevation-4" color="top">
      <VIcon color="darkGrey" rounded="xl">mdi-cog</VIcon>
    </VSheet>
  </div>
</template>
