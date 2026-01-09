<script setup lang="ts">
  import { useMapControlsStore } from '~/stores/mapControlsStore'
  import { computed } from 'vue'

  const store = useMapControlsStore()

  const isOpen = computed(() => store.isPanelOpen)
  const hasActiveOverlay = computed(() => store.isAnyOverlayActive)
  const hasActiveBounties = computed(() => store.isCellBountiesEnabled)

  const togglePanel = () => {
    store.togglePanel()
  }
</script>

<template>
  <button
    class="MapControlsTrigger"
    :class="{ 'is-open': isOpen }"
    @click="togglePanel"
    aria-label="Map Controls"
    :aria-expanded="isOpen"
  >
    <div class="MapControlsTrigger__icon">
      <i class="fa-solid fa-layer-group"></i>
    </div>

    <!-- Primary Badge: Overlay Active -->
    <transition name="scale-fade">
      <div
        v-if="hasActiveOverlay"
        class="MapControlsTrigger__badge MapControlsTrigger__badge--overlay"
      ></div>
    </transition>

    <!-- Secondary Badge: Bounties Active -->
    <transition name="scale-fade">
      <div
        v-if="hasActiveBounties"
        class="MapControlsTrigger__badge MapControlsTrigger__badge--bounty"
      ></div>
    </transition>
  </button>
</template>

<style scoped lang="scss">
  .MapControlsTrigger {
    position: relative;
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background-color: var(
      --controls-surface,
      #fff
    ); /* Fallback if var not defined */
    box-shadow: var(--controls-shadow, 0 4px 12px rgba(0, 0, 0, 0.15));
    border: 1px solid var(--controls-border, rgba(0, 0, 0, 0.05));
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition:
      transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
      background-color 0.2s ease;

    // Theme compatibility (assuming vuetify or similar theme vars exist, referencing existing components)
    background: var(--controls-surface, #fff);
    color: var(--controls-text, #333);

    &:hover {
      transform: scale(1.05);
    }

    &:active {
      transform: scale(0.95);
    }

    &__icon {
      font-size: 24px;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    &.is-open {
      background-color: var(--primary-color, #346cda);
      color: #fff;

      .MapControlsTrigger__icon {
        transform: rotate(90deg);
      }
    }

    &__badge {
      position: absolute;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid var(--top-color, #fff);

      &--overlay {
        top: 0;
        right: 0;
        background-color: #00e676; /* Green for active/quality */
      }

      &--bounty {
        bottom: 0;
        right: 0;
        background-color: #9128be; /* Purple for bounty */
      }
    }
  }

  // Vue transition for badges
  .scale-fade-enter-active,
  .scale-fade-leave-active {
    transition: all 0.2s ease;
  }

  .scale-fade-enter-from,
  .scale-fade-leave-to {
    opacity: 0;
    transform: scale(0.5);
  }
</style>
