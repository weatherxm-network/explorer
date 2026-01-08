<script setup lang="ts">
  import { computed } from 'vue'
  import { useMapboxStore } from '~/stores/mapboxStore'

  const mapboxStore = useMapboxStore()

  const range = computed({
    get: () => mapboxStore.getQualityRange,
    set: (val: [number, number]) => mapboxStore.setQualityRange(val),
  })

  const sliderStyle = computed(() => ({
    '--dq-min': range.value[0],
    '--dq-max': range.value[1],
  }))

  const reset = () => {
    mapboxStore.setQualityRange([0, 100])
  }
</script>

<template>
  <div class="DQFilter">
    <div class="DQFilter__header">
      <div class="DQFilter__title">Data Quality Filter</div>
      <button class="DQFilter__reset" type="button" @click="reset">
        Reset
      </button>
    </div>
    <div class="DQFilter__values">
      <span>{{ range[0] }}%</span>
      <span>{{ range[1] }}%</span>
    </div>
    <div class="DQFilter__sliderWrap" :style="sliderStyle">
      <v-range-slider
        v-model="range"
        class="DQFilter__slider mt-1"
        track-size="10"
        thumb-size="18"
        min="0"
        max="100"
        step="1"
        thumb-label
        hide-details
        density="comfortable"
        thumb-label-size="24"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
  .DQFilter {
    display: flex;
    flex-direction: column;
    gap: 6px;
    background: var(--controls-surface-strong, #f7f8fa);
    border: 1px solid var(--controls-border, rgba(0, 0, 0, 0.08));
    border-radius: 12px;
    padding: 10px;
  }

  .DQFilter__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .DQFilter__title {
    font-size: 13px;
    font-weight: 700;
    color: var(--controls-text, #1f2933);
  }

  .DQFilter__reset {
    border: none;
    background: none;
    color: var(--primary-color, #346cda);
    font-weight: 600;
    cursor: pointer;
    padding: 4px 6px;
    border-radius: 6px;

    &:hover {
      background: var(--controls-surface, #fff);
    }
  }

  .DQFilter__values {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: var(--controls-muted, #6b7280);
  }

  .DQFilter__sliderWrap {
    position: relative;
  }

  .DQFilter__slider {
    color: var(--controls-text, #1f2933);
  }

  .DQFilter__sliderWrap :deep(.v-slider-track__background) {
    position: relative;
    width: 100%;
    background-image: linear-gradient(
      90deg,
      #ff1744 0%,
      #ffab49 40%,
      #00e676 90%
    );
    background-size: 100% 100%;
    background-position: left center;
    background-repeat: no-repeat;
    border-radius: inherit;
  }

  .DQFilter__sliderWrap :deep(.v-slider-track__fill) {
    background: transparent;
    opacity: 0;
    box-shadow: none;
  }

  .DQFilter__slider :deep(.v-slider-thumb) {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .DQFilter__sliderWrap :deep(.v-locale--is-ltr) {
    border-radius: 50%;
  }
</style>
