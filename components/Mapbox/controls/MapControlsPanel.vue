<script setup lang="ts">
  import { useDisplay } from 'vuetify'
  import { computed } from 'vue'
  import { useMapControlsStore } from '~/stores/mapControlsStore'
  import MapStyleGrid from './MapStyleGrid.vue'
  import OverlayModeSelector from './OverlayModeSelector.vue'
  import MapLegend from './MapLegend.vue'
  import DataQualityFilter from './DataQualityFilter.vue'

  const store = useMapControlsStore()
  const display = useDisplay()

  const isOpen = computed({
    get: () => store.isPanelOpen,
    set: (val) => store.setPanelOpen(val),
  })

  const isMobile = computed(() => display.smAndDown.value)

  const closePanel = () => {
    store.setPanelOpen(false)
  }
</script>

<template>
  <div class="MapControlsPanel">
    <!-- Mobile: Bottom Sheet -->
    <v-bottom-sheet
      v-if="isMobile"
      v-model="isOpen"
      content-class="MapControlsSheet"
    >
      <div class="SheetContent">
        <div class="SheetContent__handle"></div>
        <div class="SheetContent__body">
          <section class="Section">
            <OverlayModeSelector />
          </section>

          <div class="Divider"></div>

          <section class="Section">
            <h4 class="SectionLabel">Data Quality</h4>
            <DataQualityFilter />
          </section>

          <div class="Divider"></div>

          <section class="Section">
            <h4 class="SectionLabel">Legend</h4>
            <MapLegend />
          </section>

          <div class="Divider"></div>

          <section class="Section">
            <h4 class="SectionLabel">Theme</h4>
            <MapStyleGrid />
          </section>
        </div>
      </div>
    </v-bottom-sheet>

    <!-- Desktop: Floating Popover -->
    <!-- Used v-if to unmount when closed, or v-show with transition -->
    <transition name="popover">
      <div v-if="!isMobile && isOpen" class="DesktopPopover">
        <div class="DesktopPopover__header">
          <h3>Map Controls</h3>
          <button class="CloseButton" @click="closePanel">
            <i class="fa-solid fa-times"></i>
          </button>
        </div>

        <div class="DesktopPopover__body">
          <section class="Section">
            <OverlayModeSelector />
          </section>

          <div class="Divider"></div>

          <section class="Section">
            <h4 class="SectionLabel">Data Quality</h4>
            <DataQualityFilter />
          </section>

          <div class="Divider"></div>

          <section class="Section">
            <h4 class="SectionLabel">Legend</h4>
            <MapLegend />
          </section>

          <div class="Divider"></div>

          <section class="Section">
            <h4 class="SectionLabel">Theme</h4>
            <MapStyleGrid />
          </section>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped lang="scss">
  /* Shared Styling */
  .SheetContent {
    background: var(--controls-surface, #fff);
    border-radius: 20px 20px 0 0;
    padding-bottom: 32px; /* Safe area */
    max-height: 85vh;
    overflow-y: auto;
  }

  .SheetContent__handle {
    width: 40px;
    height: 4px;
    background: #ddd;
    border-radius: 2px;
    margin: 12px auto;
  }

  .SheetContent__body,
  .DesktopPopover__body {
    padding: 16px 20px;
  }

  .Section {
    margin-bottom: 16px;
  }

  .SectionTitle {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 12px;
    color: var(--controls-text, #1f2933);
  }

  .SectionLabel {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--controls-muted, #6b7280);
    margin-bottom: 12px;
    font-weight: 600;
  }

  .Divider {
    height: 1px;
    background-color: var(--controls-border, rgba(0, 0, 0, 0.08));
    margin: 16px 0;
  }

  .DesktopPopover {
    position: absolute;
    bottom: 60px; /* Anchored above the trigger (which is ~48px height + margins) */
    right: 0; /* Aligned with container right */
    width: 360px;
    background: var(--controls-surface, #fff);
    border-radius: 16px;
    box-shadow: var(--controls-shadow, 0 10px 40px rgba(0, 0, 0, 0.15));
    z-index: 1000;
    overflow: hidden;
    max-height: calc(100vh - 150px);
    overflow-y: auto;
    border: 1px solid var(--controls-border, rgba(0, 0, 0, 0.05));
  }

  .DesktopPopover__header {
    padding: 16px 20px;
    border-bottom: 1px solid var(--controls-border, rgba(0, 0, 0, 0.08));
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    top: 0;
    background: var(--controls-surface, #fff);
    z-index: 10;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      color: var(--controls-text, #1f2933);
    }
  }

  .CloseButton {
    background: none;
    border: none;
    color: var(--controls-muted, #6b7280);
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;

    &:hover {
      background: var(--controls-surface-strong, #f7f8fa);
      color: var(--controls-text, #1f2933);
    }
  }

  /* Transitions */
  .popover-enter-active,
  .popover-leave-active {
    transition:
      opacity 0.2s cubic-bezier(0.2, 0, 0, 1),
      transform 0.2s cubic-bezier(0.2, 0, 0, 1);
  }

  .popover-enter-from,
  .popover-leave-to {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
  }
</style>
