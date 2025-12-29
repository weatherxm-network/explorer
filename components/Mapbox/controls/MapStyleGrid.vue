<script setup lang="ts">
  import {
    useMapControlsStore,
    type MapStyleId,
  } from '~/stores/mapControlsStore'
  import { computed } from 'vue'

  const store = useMapControlsStore()

  interface MapStyleOption {
    id: MapStyleId
    label: string
    icon: string
    accent: string
  }

  const styles: MapStyleOption[] = [
    {
      id: 'mapbox://styles/mapbox/dark-v11',
      label: 'Dark',
      icon: 'fa-moon text-text',
      accent: '#111827',
    },
    {
      id: 'mapbox://styles/mapbox/light-v11',
      label: 'Light',
      icon: 'fa-sun',
      accent: '#f59e0b',
    },
    {
      id: 'mapbox://styles/mapbox/satellite-v9',
      label: 'Satellite',
      icon: 'fa-earth-americas',
      accent: '#2563eb',
    },
    {
      id: 'mapbox://styles/mapbox/outdoors-v12',
      label: 'Outdoors',
      icon: 'fa-tree',
      accent: '#16a34a',
    },
  ]

  const activeStyle = computed(() => store.getActiveStyleId)

  const selectStyle = (id: MapStyleId) => {
    if (id === activeStyle.value) return
    store.setMapStyle(id)
  }
</script>

<template>
  <div class="MapStyleGrid" role="radiogroup" aria-label="Map Styles">
    <button
      v-for="style in styles"
      :key="style.id"
      :class="{ 'is-active': activeStyle === style.id }"
      @click="selectStyle(style.id)"
      role="radio"
      :aria-checked="activeStyle === style.id"
      :aria-label="style.label"
    >
      <div class="MapStyleGrid__preview" :style="{ '--accent': style.accent }">
        <div class="MapStyleGrid__icon">
          <i :class="['fa-solid', style.icon]"></i>
        </div>
      </div>
      <span class="MapStyleGrid__label">{{ style.label }}</span>
    </button>
  </div>
</template>

<style scoped lang="scss">
  .MapStyleGrid {
    display: grid;
    grid-template-columns: repeat(2, 1fr); // Mobile default
    gap: 12px;
    width: 100%;

    @media (min-width: 600px) {
      grid-template-columns: repeat(3, 1fr); // Tablet
    }

    @media (min-width: 960px) {
      grid-template-columns: repeat(4, 1fr); // Desktop
    }

    &__item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      border: none;
      cursor: pointer;
      padding: 0;
      transition: transform 0.1s ease;

      &:hover {
        .MapStyleGrid__preview {
          box-shadow: 0 0 0 2px var(--primary-color, #346cda);
          transform: translateY(-2px);
        }
      }

      &:active {
        transform: scale(0.98);
      }

      // Accessibility focus
      &:focus-visible {
        outline: none;
        .MapStyleGrid__preview {
          box-shadow: 0 0 0 4px rgba(52, 108, 218, 0.4);
        }
      }
    }

    &__preview {
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    &__icon {
      width: 56px;
      height: 56px;
      border-radius: 14px;
      display: grid;
      place-items: center;
      color: var(--accent, #346cda);
      border: 1px solid rgba(0, 0, 0, 0.04);
      margin: auto;
      font-size: 22px;
      &:hover {
        border-color: var(--primary-color, #346cda);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      .is-active & {
        border-color: var(--primary-color, #346cda);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      i {
        text-shadow: 0 10px 20px rgba(0, 0, 0, 0.12);
      }
    }

    &__label {
      font-size: 12px;
      font-weight: 500;
      color: var(--controls-text, #333);
      opacity: 0.8;
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>
