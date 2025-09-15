<script setup lang="ts">
const selectedType = ref<'simple' | 'data-quality'>('simple')

const emit = defineEmits<{
  layerChange: [type: 'simple' | 'data-quality']
}>()

const onTypeChange = (type: 'simple' | 'data-quality') => {
  emit('layerChange', type)
}

watch(selectedType, (newType) => {
  onTypeChange(newType)
})
</script>

<template>
  <VCard class="layer-switcher" elevation="2">
    <VCardTitle class="text-h6 pb-2">
      Map Layers
    </VCardTitle>
    <VCardText>
      <VRadioGroup v-model="selectedType" density="compact">
        <VRadio
          value="simple"
          label="Simple Hexagons"
          color="primary"
        />
        <VRadio
          value="data-quality"
          label="Data Quality"
          color="primary"
        />
      </VRadioGroup>
    </VCardText>
  </VCard>
</template>

<style scoped>
.layer-switcher {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  min-width: 200px;
}

@media (max-width: 960px) {
  .layer-switcher {
    bottom: 140px;
    right: 10px;
    min-width: 180px;
  }
}
</style>