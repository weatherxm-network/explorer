<script setup lang="ts">
  import cellsDefaultLayerImg from '@/assets/layer-cells-default.png'
  import dataQualityLayerImg from '@/assets/layer-data-quality.png'
  import targetedRolloutsLayerImg from '@/assets/layer-targeted-rollouts.png'
  import cellBountyLayerImg from 'assets/layer-cells-bounty.png'
  import type { LayerKeys } from '@/components/Mapbox/types/mapbox'

  interface Layers {
    key: LayerKeys
    src: string
    label: string
  }

  const selectedType = ref<LayerKeys>('data-quality')
  const isLayerSelectionShown = ref<boolean>(false)

  const mapboxStore = useMapboxStore()
  const mobileStore = useMobileStore()

  // Local reactive state for immediate UI updates
  const localQualityRange = ref([...mapboxStore.getQualityRange])

  // Debounced function to update store (and trigger map filter)
  const debouncedUpdateStore = useDebounceFn((value: [number, number]) => {
    mapboxStore.setQualityRange(value)
  }, 300)

  const qualityRange = computed({
    get: () => localQualityRange.value,
    set: (value) => {
      // Update local state immediately for smooth UI
      localQualityRange.value = value
      // Update store (and map) with debounce
      debouncedUpdateStore(value as [number, number])
    },
  })

  const emit = defineEmits<{
    layerChange: [type: LayerKeys]
  }>()

  const onTypeChange = (type: LayerKeys) => {
    emit('layerChange', type)
  }

  const layers: Layers[] = [
    { key: 'cell-capacity', src: cellsDefaultLayerImg, label: 'Cell Capacity' },
    { key: 'data-quality', src: dataQualityLayerImg, label: 'Data Quality' },
    {
      key: 'targeted-rollouts',
      src: targetedRolloutsLayerImg,
      label: 'Targeted Rollouts',
    },
    {
      key: 'cell-bounty',
      src: cellBountyLayerImg,
      label: 'Cell Bounties',
    },
  ]

  const layerImages = computed(() => {
    return layers.filter((li) => li.key !== selectedType.value)
  })

  const currentLayerImg = computed(() => {
    return layers.filter((li) => li.key === selectedType.value)[0]
  })

  watch(selectedType, (newType) => {
    onTypeChange(newType)
  })

  watch(
    () => mapboxStore.getQualityRange,
    (newRange) => {
      localQualityRange.value = [...newRange]
    },
    { immediate: true },
  )

  watch(
    () => mapboxStore.getCurrentLayerType,
    (newType) => {
      if (selectedType.value !== newType) {
        selectedType.value = newType
      }
    },
    { immediate: true },
  )

  selectedType.value = mapboxStore.getCurrentLayerType

  function showLayerSelection() {
    isLayerSelectionShown.value = true
  }

  function hideLayerSelection() {
    isLayerSelectionShown.value = false
  }
</script>

<template>
  <div class="LayerSwitcher">
    <div
      v-if="selectedType === 'cell-capacity'"
      class="LayerSwitcher__cell-capacity__legend"
    >
      <div class="legend-item">
        <div class="legend-color" style="background-color: #1497b7"></div>
        <span class="legend-text">Available for Deployment</span>
      </div>
      <div class="legend-item">
        <div class="legend-color" style="background-color: #346cda"></div>
        <span class="legend-text">Near Capacity</span>
      </div>
      <div class="legend-item">
        <div class="legend-color" style="background-color: #3f39ff"></div>
        <span class="legend-text">At Capacity</span>
      </div>
      <div class="legend-item">
        <div class="legend-color" style="background-color: #7b39ff"></div>
        <span class="legend-text">Over Capacity</span>
      </div>
    </div>

    <div
      v-if="selectedType === 'data-quality'"
      class="LayerSwitcher__qod__slider"
    >
      <span class="range-label">Data Quality Score: </span>
      <VRangeSlider
        v-model="qualityRange"
        :min="0"
        :max="100"
        :step="1"
        color="transparent"
        track-color="transparent"
        thumb-color="white"
        :thumb-size="18"
        class="quality-gradient-slider"
        hide-details
      >
        <template #prepend>
          <span class="range-label">{{ qualityRange[0] }}%</span>
        </template>
        <template #append>
          <span class="range-label">{{ qualityRange[1] }}%</span>
        </template>
      </VRangeSlider>
    </div>

    <div
      class="LayerSwitcher__container"
      @mouseenter="showLayerSelection"
      @mouseleave="hideLayerSelection"
    >
      <div class="LayerImage__container">
        <img class="w-100 h-100" :src="currentLayerImg.src" />
        <p>{{ currentLayerImg.label }}</p>
      </div>

      <div
        :class="[
          'LayerImage__options',
          isLayerSelectionShown
            ? 'LayerImage__options--show'
            : 'LayerImage__options--hide',
        ]"
      >
        <div
          v-for="img in layerImages"
          :key="img.key"
          class="LayerImage__options__item cursor-pointer"
          @click="() => (selectedType = img.key)"
        >
          <img :src="img.src" />
          <p>{{ img.label }}</p>
        </div>
      </div>
    </div>
  </div>

  <div v-if="!mobileStore.pageState" class="LayerSwitcher__mobile">
    <v-bottom-sheet>
      <template #activator="{ props: activatorProps }">
        <button
          v-bind="activatorProps"
          class="LayerSwitcher__mobile__toggle fa fa-layer-group"
        ></button>
      </template>

      <v-card class="LayerOptions__sheet">
        <template #title>
          <h4>Map Layers</h4>
        </template>
        <v-radio-group v-model="selectedType" class="LayerOptions__radioGroup">
          <v-radio
            value="data-quality"
            class="LayerOptions__option"
            :style="{
              border:
                selectedType === 'data-quality' ? '1px solid #B8C6FF' : '',
            }"
          >
            <template #label>
              <div class="LayerOptions__option__label">
                <span class="LayerOptions__option__label--title"
                  >Data Quality Score</span
                >
                <p class="LayerOptions__option__label--description">
                  Display a color-coded map indicating station data quality
                  levels.
                </p>
                <div
                  class="HexagonRanges__container d-flex justify-space-between px-2"
                >
                  <div
                    class="d-flex flex-column justify-center align-center ga-1"
                  >
                    <div class="fa-solid fa-hexagon gray"></div>
                    <span class="LayerOptions__option__label--description"
                      >No data</span
                    >
                  </div>

                  <div
                    class="d-flex flex-column justify-center align-center ga-1"
                  >
                    <div class="fa-solid fa-hexagon red"></div>
                    <span class="LayerOptions__option__label--description"
                      >0-19%</span
                    >
                  </div>

                  <div
                    class="d-flex flex-column justify-center align-center ga-1"
                  >
                    <div class="fa-solid fa-hexagon orange"></div>
                    <span class="LayerOptions__option__label--description"
                      >20-79%</span
                    >
                  </div>

                  <div
                    class="d-flex flex-column justify-center align-center ga-1"
                  >
                    <div class="fa-solid fa-hexagon green"></div>
                    <span class="LayerOptions__option__label--description"
                      >80-100%</span
                    >
                  </div>
                </div>
              </div>
            </template>
          </v-radio>
          <v-radio
            value="cell-capacity"
            class="LayerOptions__option"
            :style="{
              border:
                selectedType === 'cell-capacity' ? '1px solid #B8C6FF' : '',
            }"
          >
            <template #label>
              <div class="LayerOptions__option__label">
                <span class="LayerOptions__option__label--title"
                  >Cell Capacity</span
                >
                <p class="LayerOptions__option__label--description">
                  Concise view of all stations within each cell and its
                  capacity.
                </p>
              </div>
            </template>
          </v-radio>
          <v-radio
            value="targeted-rollouts"
            class="LayerOptions__option"
            :style="{
              border:
                selectedType === 'targeted-rollouts' ? '1px solid #B8C6FF' : '',
            }"
          >
            <template #label>
              <div class="LayerOptions__option__label">
                <span class="LayerOptions__option__label--title"
                  >Targeted Rollouts</span
                >
                <p class="LayerOptions__option__label--description">
                  View of cells for targeted rollouts.
                </p>
              </div>
            </template>
          </v-radio>
          <v-radio
            value="cell-bounty"
            class="LayerOptions__option"
            :style="{
              border: selectedType === 'cell-bounty' ? '1px solid #B8C6FF' : '',
            }"
          >
            <template #label>
              <div class="LayerOptions__option__label">
                <span class="LayerOptions__option__label--title"
                  >Cell Bounties</span
                >
                <p class="LayerOptions__option__label--description">
                  View of cells with active cell bounty programs.
                </p>
              </div>
            </template>
          </v-radio>
        </v-radio-group>
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<style scoped>
  .LayerSwitcher {
    position: absolute;
    bottom: 10px;
    right: 60px;
    z-index: 100;
    min-width: 200px;

    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    align-items: flex-end;
    gap: 16px;
  }

  .LayerSwitcher__cell-capacity__legend {
    padding: 12px;
    background-color: #31364acc;
    border-radius: 12px;
    border: 1px solid #b8c6ff;
    display: flex;
    align-items: center;
    gap: 12px;
    margin-right: 16px;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .legend-color {
    width: 18px;
    height: 16px;
    clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
  }

  .legend-text {
    color: white;
    font-size: 12px;
    white-space: nowrap;
  }

  .LayerSwitcher__qod__slider {
    /* 100vw - layerImag - content - paddings */
    width: calc(100vw - 220px - 440px - 50px);
    max-width: 500px;
    padding: 12px;
    background-color: #31364acc;
    border-radius: 12px;
    border: 2px solid #b8c6ff;

    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
  }

  .quality-gradient-slider :deep(.v-slider-track__background) {
    background: linear-gradient(
      to right,
      #ff1744 0%,
      /* Deep red at start */ #ff1744 15%,
      /* Hold red until 15% */ #ff4500 18%,
      /* Transition to red-orange */ #ff6b00 22%,
      /* More orange-red */ #ffab49 30%,
      /* Orange */ #ffab49 70%,
      /* Hold orange through middle */ #7dd55f 78%,
      /* Transition to yellow-green */ #00e676 85%,
      /* Bright green */ #00c864 100% /* Slightly deeper green at end */
    ) !important;
    height: 6px !important;
    border-radius: 3px !important;
    opacity: 1 !important;
    filter: none !important;
  }

  .quality-gradient-slider :deep(.v-slider-track__fill) {
    background: transparent !important;
    height: 6px !important;
    border-radius: 3px !important;
    box-sizing: border-box;
    opacity: 1 !important;
    filter: none !important;
  }

  .quality-gradient-slider {
    min-width: 250px;
    opacity: 1 !important;
  }

  .quality-gradient-slider :deep(.v-slider-track) {
    opacity: 1 !important;
    filter: none !important;
  }

  .quality-gradient-slider :deep(.v-slider-thumb) {
    border: 2px solid #333;
  }

  .range-label {
    color: white;
    font-size: 14px;
    font-weight: 600;
    min-width: 35px;
    text-align: center;
  }

  .LayerSwitcher__container {
    display: flex;
    justify-content: space-between;
    align-items: end;
    position: relative;
  }

  .LayerImage__container {
    border: 2px solid #b8c6ffaa;
    border-radius: 16px;
    overflow: hidden;
    width: 180px;
    aspect-ratio: 1/1;

    z-index: 5;

    > img {
      object-fit: cover;
    }

    > p {
      position: absolute;
      bottom: 6px;
      left: 4px;
      right: 4px;
      text-align: center;
      color: white;
    }
  }

  .LayerImage__options {
    position: absolute;
    bottom: 0px;
    right: 0px;
    z-index: 4;

    transition: all 0.15s ease-in;
    transition-delay: 75ms;

    width: 180px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    gap: 16px;

    border-radius: 16px;
    padding: 8px;

    background-color: #31364acc;
  }

  .LayerImage__options--show {
    transform: translateY(-200px);
  }

  .LayerImage__options--hide {
    height: 180px;
  }

  .LayerImage__options__item {
    position: relative;
    border: 2px solid #b8c6ff;
    border-radius: 16px;
    overflow: hidden;
    width: 100%;
    aspect-ratio: 1/1;

    > p {
      position: absolute;
      bottom: 6px;
      left: 4px;
      right: 4px;
      text-align: center;
      color: white;
    }
  }

  /* MOBILE */

  .LayerSwitcher__mobile {
    position: absolute;
    bottom: 200px;
    right: 20px;
    z-index: 100;

    width: 60px;
    border-radius: 50%;

    background-color: #31364a;
    aspect-ratio: 1/1;

    display: flex;
    justify-content: center;
    align-items: center;

    font-size: 1.6rem;
    line-height: 1.6rem;
  }

  .LayerOptions__sheet {
    border-top-right-radius: 20px;
  }

  .LayerOptions__radioGroup {
    padding: 8px;
  }

  .LayerOptions__option {
    background-color: #1e2438;
    border-radius: 8px;
  }
  .LayerOptions__option:nth-child(1) {
    margin-bottom: 16px;
  }

  .LayerOptions__option__label {
    padding: 4px;
  }

  .LayerOptions__option__label--title {
    font-size: 1em;
    line-height: 1em;
    color: #fff !important;
  }

  .LayerOptions__option__label--description {
    color: #ddd;
    font-size: 0.8em;
    line-height: 1em;
  }

  .HexagonRanges__container {
    background-color: #3a3f6a;
    border-radius: 4px;
    padding: 6px;
    margin-top: 16px;
    margin-bottom: 6px;
    margin-right: 6px;
  }

  .gray {
    color: #c6c6d0;
  }

  .red {
    color: #ff1744;
  }

  .orange {
    color: #ffab49;
  }

  .green {
    color: #00e676;
  }

  @media (max-width: 959px) {
    .LayerSwitcher {
      display: none;
    }
  }

  @media (min-width: 960px) {
    .LayerSwitcher__mobile {
      display: none;
    }
  }
</style>
