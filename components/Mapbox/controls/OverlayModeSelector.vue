<script setup lang="ts">
  import {
    useMapControlsStore,
    type OverlayMode,
  } from '~/stores/mapControlsStore'
  import { computed } from 'vue'

  const store = useMapControlsStore()

  const currentMode = computed(() => store.getOverlayMode)
  const isBountiesEnabled = computed(() => store.isCellBountiesEnabled)

  const setMode = (mode: OverlayMode) => {
    store.setOverlayMode(mode)
  }

  const toggleBounties = () => {
    store.toggleCellBounties()
  }
</script>

<template>
  <div class="OverlayModeSelector">
    <!-- Section Header -->
    <div class="OverlayModeSelector__header">
      <h4>Layers</h4>
    </div>

    <!-- Mode: Data Quality & Capacity -->
    <div
      class="OverlayOption"
      :class="{ 'is-selected': currentMode === 'capacity_quality' }"
      @click="setMode('capacity_quality')"
      role="radio"
      :aria-checked="currentMode === 'capacity_quality'"
      tabindex="0"
    >
      <div class="OverlayOption__radio"></div>
      <div class="OverlayOption__content">
        <span class="OverlayOption__title">Data Quality (QoD) + Capacity</span>
        <span class="OverlayOption__desc"
          >QoD coloring with capacity labels</span
        >
      </div>
    </div>

    <!-- Independent Section: Cell Bounties -->
    <div class="BountyToggle">
      <div class="BountyToggle__text">
        <span class="BountyToggle__title">Cell Bounties</span>
        <span class="BountyToggle__desc">Show bounty areas</span>
      </div>
      <v-switch
        :model-value="isBountiesEnabled"
        @update:model-value="toggleBounties"
        color="purple"
        hide-details
        density="compact"
        class="ma-0"
        inset
      ></v-switch>
    </div>

    <hr class="OverlayModeSelector__divider" />

    <div class="OverlayModeSelector__subheader">Advanced</div>

    <!-- Mode: Targeted Rollouts -->
    <div
      class="OverlayOption"
      :class="{ 'is-selected': currentMode === 'targeted_rollouts' }"
      @click="setMode('targeted_rollouts')"
      role="radio"
      :aria-checked="currentMode === 'targeted_rollouts'"
      tabindex="0"
    >
      <div class="OverlayOption__radio"></div>
      <div class="OverlayOption__content">
        <span class="OverlayOption__title">Targeted Rollouts</span>
        <span class="OverlayOption__desc"
          >Specific areas for network expansion</span
        >
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .OverlayModeSelector {
    display: flex;
    flex-direction: column;
    gap: 8px;

    &__header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 8px;
      padding-inline: 4px;

      h4 {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
        color: var(--controls-text, #333);
      }
    }

    &__divider {
      border: none;
      border-top: 1px solid var(--controls-border, rgba(0, 0, 0, 0.08)); /* Light Divider */
      margin: 8px 0;
    }

    &__subheader {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: var(--controls-muted, #6b7280);
      margin-top: 2px;
    }
  }

  .OverlayOption {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 12px;
    background-color: var(--controls-surface-strong, rgba(0, 0, 0, 0.01));
    border: 1px solid var(--controls-border, rgba(0, 0, 0, 0.08));
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background-color: var(--controls-surface, #fff);
    }

    &.is-selected {
      background-color: rgba(52, 108, 218, 0.08);
      border-color: rgba(52, 108, 218, 0.35);

      .OverlayOption__radio {
        border-color: var(--primary-color, #346cda);
        &::after {
          transform: scale(1);
        }
      }
    }

    &__radio {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid #ccc;
      flex-shrink: 0;
      margin-top: 2px;
      position: relative;
      transition: border-color 0.2s;

      &::after {
        content: '';
        position: absolute;
        inset: 3px;
        background-color: var(--primary-color, #346cda);
        border-radius: 50%;
        transform: scale(0);
        transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
    }

    &__content {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    &__title {
      font-size: 14px;
      font-weight: 600;
      color: var(--controls-text, #333);
      margin-bottom: 2px;
    }

    &__desc {
      font-size: 12px;
      color: var(--controls-muted, #666);
      line-height: 1.4;
    }
  }

  .BountyToggle {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 8px;

    &__text {
      display: flex;
      flex-direction: column;
    }

    &__title {
      font-size: 14px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;

      &::after {
        content: 'New';
        font-size: 10px;
        padding: 2px 6px;
        background: #f3e5f5;
        color: #9128be;
        border-radius: 10px;
        font-weight: 700;
      }
    }

    &__desc {
      font-size: 12px;
      color: #666;
    }
  }

  // Transitions
  .expand-enter-active,
  .expand-leave-active {
    transition: all 0.3s ease;
    max-height: 100px;
    opacity: 1;
  }

  .expand-enter-from,
  .expand-leave-to {
    max-height: 0;
    opacity: 0;
    margin-top: 0;
  }
</style>
