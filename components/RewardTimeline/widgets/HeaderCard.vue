<script setup lang="ts">
  const emit = defineEmits(['backToDeviceDetails'])
</script>

<template>
  <VCard class="w-100" color="top" elevation="0" rounded="0">
    <div class="d-flex align-center pa-4">
      <div class="me-4 d-flex align-center">
        <i
          class="fa fa-arrow-left text-text"
          style="cursor: pointer; font-size: 1.375rem"
          @click="emit('backToDeviceDetails')"
        ></i>
      </div>
      <div class="text-text" style="font-size: 1.375rem">Reward Timeline</div>
    </div>
  </VCard>
</template>
