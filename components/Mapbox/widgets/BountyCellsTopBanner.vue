<script setup lang="ts">
  import type { LayerKeys } from '@/components/Mapbox/types/mapbox'
  import { useMapboxStore } from '~/stores/mapboxStore'

  const mapboxStore = useMapboxStore()
  const isVisible = ref(true)
  const isMobile = ref(false)

  const emit = defineEmits<{
    switchLayer: [type: LayerKeys]
  }>()

  let mq: MediaQueryList | null = null

  const updateIsMobile = () => {
    if (!mq) return
    isMobile.value = mq.matches
  }

  const handleBannerChangeEvent = () => {
    isVisible.value = true
  }

  onMounted(() => {
    mq = window.matchMedia('(max-width: 760px)')
    updateIsMobile()
    mq.addEventListener('change', updateIsMobile)

    window.addEventListener(
      'bounty-cells-banner:change',
      handleBannerChangeEvent,
    )
  })

  onBeforeUnmount(() => {
    if (mq) {
      mq.removeEventListener('change', updateIsMobile)
    }
    window.removeEventListener(
      'bounty-cells-banner:change',
      handleBannerChangeEvent,
    )
  })

  const handleDismiss = () => {
    isVisible.value = false
  }

  const handleDiscover = (e: Event) => {
    e.preventDefault()
    e.stopPropagation()
    handleDismiss()
    emit('switchLayer', 'cell-bounty')
  }
</script>

<template>
  <Transition name="banner">
    <div
      v-if="isVisible && mapboxStore.getCurrentLayerType !== 'cell-bounty'"
      class="banner"
      :class="{ 'banner--mobile': isMobile }"
    >
      <button
        class="banner__close"
        aria-label="Dismiss cell bounties banner"
        type="button"
        @click.stop="handleDismiss"
      >
        <i class="fa-solid fa-xmark"></i>
      </button>

      <div class="banner__content">
        <i class="fa-solid fa-star banner__icon"></i>

        <div class="banner__text">
          <strong>Cell Bounties</strong>
          <span>Discover boosted rewards in selected areas on the map.</span>
        </div>
      </div>

      <button class="banner__cta" type="button" @click="handleDiscover">
        Discover on map
      </button>
    </div>
  </Transition>
</template>

<style scoped>
  .banner {
    position: absolute;
    right: 20px;
    top: 90px;
    z-index: 8;
    background: radial-gradient(
        circle at top left,
        rgba(251, 191, 36, 0.16),
        transparent 60%
      ),
      linear-gradient(35deg, #3b2d78 0%, #d41da7 100%) !important;
    border-radius: 14px;
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    box-shadow:
      0 12px 40px rgba(0, 0, 0, 0.45),
      0 0 0 1px rgba(255, 255, 255, 0.08);
    pointer-events: auto;
    width: 50%;
    min-width: 200px;
    max-width: 260px;
    backdrop-filter: blur(14px);
    color: #f9fafb;
  }

  .banner__close {
    position: absolute;
    right: 8px;
    top: 8px;
    background: rgba(15, 23, 42, 0.45);
    border: 1px solid rgba(248, 250, 252, 0.14);
    padding: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #e5e7eb;
    font-size: 14px;
    transition: all 0.18s ease-out;
    border-radius: 999px;
    min-width: 26px;
    min-height: 26px;
    z-index: 1;
  }

  .banner__close i {
    font-size: 11px;
  }

  .banner__close:hover {
    background: rgba(239, 68, 68, 0.24);
    border-color: rgba(248, 250, 252, 0.42);
    color: #fee2e2;
    transform: translateY(-1px);
  }

  .banner__close:active {
    transform: translateY(0);
  }

  .banner__content {
    display: flex;
    align-items: center;
    gap: 10px;
    padding-right: 24px;
  }

  .banner__icon {
    width: 24px;
    height: 24px;
    font-size: 18px;
    flex-shrink: 0;
    line-height: 1;
    color: #fde68a;
    text-shadow: 0 0 10px rgba(252, 211, 77, 0.6);
  }

  .banner__text {
    display: flex;
    flex-direction: column;
    gap: 3px;
    color: inherit;
    flex: 1;
    min-width: 0;
  }

  .banner__text strong {
    font-size: 14px;
    font-weight: 600;
    line-height: 1.2;
    letter-spacing: 0.03em;
  }

  .banner__text span {
    font-size: 12px;
    font-weight: 400;
    opacity: 0.9;
    line-height: 1.3;
  }

  .banner__cta {
    background: rgba(248, 250, 252, 0.1);
    border: 1px solid rgba(248, 250, 252, 0.32);
    border-radius: 999px;
    padding: 9px 16px;
    color: #f9fafb;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s ease-out;
    width: 100%;
    backdrop-filter: blur(10px);
  }

  .banner__cta:hover {
    background: rgba(248, 250, 252, 0.22);
    border-color: rgba(248, 250, 252, 0.55);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.55);
  }

  .banner__cta:active {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(15, 23, 42, 0.45);
  }

  .banner-enter-active,
  .banner-leave-active {
    transition: all 0.28s cubic-bezier(0.19, 1, 0.22, 1);
  }

  .banner-enter-from {
    opacity: 0;
    transform: translateX(18px) translateY(4px) scale(0.96);
  }

  .banner-leave-to {
    opacity: 0;
    transform: translateX(18px) translateY(4px) scale(0.96);
  }

  .banner--mobile {
    right: 16px;
    top: 160px;
    min-width: 200px;
    max-width: 260px;
    padding: 12px 14px;
    gap: 10px;
  }

  .banner--mobile .banner__content {
    gap: 8px;
    padding-right: 22px;
  }

  .banner--mobile .banner__icon {
    font-size: 16px;
  }

  .banner--mobile .banner__text strong {
    font-size: 13px;
  }

  .banner--mobile .banner__text span {
    font-size: 11px;
  }

  .banner--mobile .banner__cta {
    padding: 9px 14px;
    font-size: 12px;
    min-height: 40px;
  }

  .banner--mobile .banner__close {
    right: 6px;
    top: 6px;
    min-width: 28px;
    min-height: 28px;
    padding: 7px;
  }

  @media (max-width: 380px) {
    .banner--mobile {
      right: 12px;
      min-width: 180px;
      max-width: 220px;
      padding: 10px 12px;
    }

    .banner--mobile .banner__text strong {
      font-size: 12px;
    }

    .banner--mobile .banner__text span {
      font-size: 10px;
    }
  }
</style>
