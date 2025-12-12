<script setup lang="ts">
  import { onBeforeUnmount, ref, watch, computed, nextTick } from 'vue'
  import { storeToRefs } from 'pinia'
  import type { Map as MapboxMap } from 'mapbox-gl'
  import { useMapboxStore } from '~/stores/mapboxStore'
  import { useDrawerStore } from '~/stores/drawerStore'
  import type { CellBountyCountry } from '@/components/Mapbox/types/mapbox'
  import { useDisplay } from 'vuetify'

  const props = defineProps<{
    mapInstance?: MapboxMap
    isActive: boolean
    focusedCountry?: string | null
  }>()

  const emit = defineEmits<{
    focusCountry: [countryCode: string]
  }>()

  const mapboxStore = useMapboxStore()
  const drawerStore = useDrawerStore()
  const { isDesktopDrawerOpen } = storeToRefs(drawerStore)
  const display = ref(useDisplay())

  const isPanelOpen = ref(false)
  const searchQuery = ref('')
  const overflowMenu = ref<{
    side: 'left' | 'right' | 'top' | 'bottom'
    countries: CellBountyCountry[]
    x: number
    y: number
  } | null>(null)

  const countries = computed<CellBountyCountry[]>(
    () => mapboxStore.getBountyCountries || [],
  )
  const selectedCountries = computed<string[]>(
    () => mapboxStore.getSelectedBountyCountries || [],
  )

  const filteredCountries = computed(() => {
    const query = searchQuery.value.trim().toLowerCase()
    if (!query) return countries.value
    return countries.value.filter(
      (country) =>
        country.name.toLowerCase().includes(query) ||
        country.code.toLowerCase().includes(query),
    )
  })

  const selectedCountryMeta = computed(() =>
    countries.value.filter((country) =>
      selectedCountries.value.includes(country.id),
    ),
  )

  const labelPositions = ref<
    Array<{
      id: string
      name: string
      count: number
      style: Record<string, string>
      highlight: boolean
    }>
  >([])

  const edgeIndicators = ref<
    Array<{
      id: string
      code: string
      name: string
      side: 'left' | 'right' | 'top' | 'bottom'
      style: Record<string, string>
      rotation: number
      overflow?: CellBountyCountry[]
    }>
  >([])

  let mapListenersAttached = false

  const togglePanel = () => {
    isPanelOpen.value = !isPanelOpen.value
  }

  const toggleCountry = (code: string) => {
    mapboxStore.toggleBountyCountry(code)
    nextTick(() => {
      updateOverlayPositions()
    })
  }

  const clearSelection = () => {
    mapboxStore.clearBountySelection()
    nextTick(() => {
      updateOverlayPositions()
    })
  }

  const selectAll = () => {
    if (!countries.value.length) return
    mapboxStore.setSelectedBountyCountries(countries.value.map((c) => c.id))
    nextTick(() => {
      updateOverlayPositions()
    })
  }

  const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max)

  const scheduleUpdate = () => {
    requestAnimationFrame(() => updateOverlayPositions())
  }

  const detachMapListeners = () => {
    if (!props.mapInstance || !mapListenersAttached) return
    props.mapInstance.off('move', scheduleUpdate)
    props.mapInstance.off('zoom', scheduleUpdate)
    props.mapInstance.off('rotate', scheduleUpdate)
    mapListenersAttached = false
  }

  const attachMapListeners = () => {
    if (!props.mapInstance || mapListenersAttached) return
    props.mapInstance.on('move', scheduleUpdate)
    props.mapInstance.on('zoom', scheduleUpdate)
    props.mapInstance.on('rotate', scheduleUpdate)
    mapListenersAttached = true
  }

  const updateOverlayPositions = () => {
    if (!props.mapInstance || !props.isActive) {
      labelPositions.value = []
      edgeIndicators.value = []
      return
    }

    const map = props.mapInstance
    const container = map.getContainer()
    const bounds = map.getBounds()
    const width = container.clientWidth
    const height = container.clientHeight
    const xPadding = 48
    const yPadding = height / 3
    const indicatorOffset = display.value.smAndDown ? 48 : 56
    const spacing = display.value.smAndDown ? 40 : 44
    const drawerOffset =
      isDesktopDrawerOpen.value && !display.value.smAndDown ? 440 : 0
    const xMax = width - xPadding
    const xMin = Math.min(drawerOffset + xPadding, xMax)
    const yMin = yPadding
    const yMax = height - yPadding

    const labels: typeof labelPositions.value = []
    const rawIndicators: Array<{
      id: string
      code: string
      name: string
      side: 'left' | 'right' | 'top' | 'bottom'
      x: number
      y: number
      projectedX: number
      projectedY: number
      alongEdge: number
      rotation: number
    }> = []

    selectedCountryMeta.value.forEach((country) => {
      const { lon, lat } = country.centroid
      const isVisible = bounds.contains([lon, lat])
      const projected = map.project([lon, lat])
      if (isVisible) {
        labels.push({
          id: country.id,
          name: country.name,
          count: country.count,
          style: {
            transform: `translate(${projected.x}px, ${projected.y}px)`,
          },
          highlight: props.focusedCountry === country.id,
        })
      } else {
        const clampedX = clamp(projected.x, xMin, xMax)
        const clampedY = clamp(projected.y, yMin, yMax)

        let side: 'left' | 'right' | 'top' | 'bottom'
        let x: number
        let y: number

        if (projected.x < xMin) {
          side = 'left'
          x = clamp(xMin + indicatorOffset, xMin, xMax)
          y = clampedY
        } else if (projected.x > xMax) {
          side = 'right'
          x = clamp(xMax - indicatorOffset, xMin, xMax)
          y = clampedY
        } else if (projected.y < yMin) {
          side = 'top'
          x = clampedX
          y = clamp(yMin + indicatorOffset, yMin, yMax)
        } else {
          side = 'bottom'
          x = clampedX
          y = clamp(yMax - indicatorOffset, yMin, yMax)
        }

        const alongEdge = side === 'top' || side === 'bottom' ? x : y
        const angle =
          (Math.atan2(projected.y - y, projected.x - x) * 180) / Math.PI + 90

        rawIndicators.push({
          id: country.id,
          code: country.code,
          name: country.name,
          side,
          x,
          y,
          projectedX: projected.x,
          projectedY: projected.y,
          alongEdge,
          rotation: angle,
        })
      }
    })

    const sideOrder: Array<'left' | 'right' | 'top' | 'bottom'> = [
      'left',
      'right',
      'top',
      'bottom',
    ]
    const indicators: typeof edgeIndicators.value = []

    sideOrder.forEach((side) => {
      const items = rawIndicators
        .filter((indicator) => indicator.side === side)
        .sort((a, b) =>
          side === 'top' || side === 'bottom'
            ? a.alongEdge - b.alongEdge
            : a.alongEdge - b.alongEdge,
        )

      const maxPerSide = 3
      const displayed =
        items.length > maxPerSide
          ? items.slice(0, maxPerSide - 1)
          : items.slice()
      const overflow =
        items.length > maxPerSide ? items.slice(maxPerSide - 1) : []
      const axisMin = side === 'top' || side === 'bottom' ? xMin : yMin
      const axisMax = side === 'top' || side === 'bottom' ? xMax : yMax
      let lastPosition = -Infinity

      displayed.forEach((indicator) => {
        const desired = indicator.alongEdge
        let resolved = desired

        if (resolved - lastPosition < spacing) {
          resolved = lastPosition + spacing
        }

        resolved = clamp(resolved, axisMin, axisMax)

        let finalX = indicator.x
        let finalY = indicator.y
        const positionStyle =
          side === 'left' || side === 'right'
            ? {
                top: `${resolved}px`,
                left: `${indicator.x}px`,
              }
            : {
                left: `${resolved}px`,
                top: `${indicator.y}px`,
              }

        if (side === 'left' || side === 'right') {
          finalY = resolved
        } else {
          finalX = resolved
        }

        const angle =
          (Math.atan2(
            indicator.projectedY - finalY,
            indicator.projectedX - finalX,
          ) *
            180) /
            Math.PI +
          90

        indicators.push({
          id: indicator.id,
          code: indicator.code,
          name: indicator.name,
          side,
          style: positionStyle,
          rotation: angle,
        })
        lastPosition = resolved
      })

      if (overflow.length) {
        const overflowLabel = `+${overflow.length}`
        const overflowCountries = overflow
          .map((item) => countries.value.find((c) => c.id === item.id))
          .filter(Boolean) as CellBountyCountry[]
        const overflowPosition = clamp(lastPosition + spacing, axisMin, axisMax)
        const overflowX =
          side === 'left'
            ? clamp(xMin + indicatorOffset, xMin, xMax)
            : side === 'right'
              ? clamp(xMax - indicatorOffset, xMin, xMax)
              : overflowPosition
        const overflowY =
          side === 'top'
            ? clamp(yMin + indicatorOffset, yMin, yMax)
            : side === 'bottom'
              ? clamp(yMax - indicatorOffset, yMin, yMax)
              : overflowPosition
        const overflowAngle =
          (Math.atan2(
            overflow[0].projectedY - overflowY,
            overflow[0].projectedX - overflowX,
          ) *
            180) /
            Math.PI +
          90

        const overflowStyle =
          side === 'left' || side === 'right'
            ? { top: `${overflowPosition}px`, left: `${overflowX}px` }
            : { left: `${overflowPosition}px`, top: `${overflowY}px` }

        indicators.push({
          id: `${side}-overflow`,
          code: overflowLabel,
          name: `${overflow.length} more`,
          side,
          style: overflowStyle,
          rotation: overflowAngle,
          overflow: overflowCountries,
        })
      }
    })

    labelPositions.value = labels
    edgeIndicators.value = indicators
  }

  const handleIndicatorClick = (
    indicator: (typeof edgeIndicators.value)[number],
  ) => {
    if (indicator.overflow) {
      overflowMenu.value = {
        side: indicator.side,
        countries: indicator.overflow,
        x: parseFloat(indicator.style.left),
        y: parseFloat(indicator.style.top),
      }
      return
    }

    emit('focusCountry', indicator.id)
  }

  const handleOverflowSelect = (country: CellBountyCountry) => {
    overflowMenu.value = null
    emit('focusCountry', country.id)
  }

  watch(
    () => props.isActive,
    (active) => {
      if (active) {
        attachMapListeners()
        updateOverlayPositions()
      } else {
        detachMapListeners()
        labelPositions.value = []
        edgeIndicators.value = []
        overflowMenu.value = null
      }
    },
    { immediate: true },
  )

  watch(
    () => props.mapInstance,
    () => {
      if (props.isActive) {
        detachMapListeners()
        attachMapListeners()
        updateOverlayPositions()
      }
    },
  )

  watch(
    () => selectedCountries.value.slice(),
    () => {
      updateOverlayPositions()
    },
  )

  watch(
    () => countries.value.length,
    () => {
      updateOverlayPositions()
    },
  )

  watch(
    () => props.focusedCountry,
    () => {
      updateOverlayPositions()
    },
  )

  watch(
    () => isDesktopDrawerOpen.value,
    () => {
      updateOverlayPositions()
    },
  )

  onBeforeUnmount(() => {
    detachMapListeners()
  })
</script>

<template>
  <div v-if="isActive" class="CellBountyOverlay">
    <div class="OverlayControls">
      <button class="OverlayToggle" type="button" @click="togglePanel">
        <i class="fa-solid fa-bullseye"></i>
        <span class="OverlayToggle__label">Cell Bounty</span>
        <span class="OverlayToggle__count">{{ selectedCountries.length }}</span>
        <i
          class="fa-solid"
          :class="[isPanelOpen ? 'fa-chevron-up' : 'fa-chevron-down']"
        ></i>
      </button>

      <transition name="PanelTransition">
        <div v-if="isPanelOpen" class="OverlayPanel">
          <header class="OverlayPanel__header">
            <div class="OverlayPanel__title">
              <strong>Cell Bounty filter</strong>
              <small>{{ selectedCountries.length }} selected</small>
            </div>
            <div class="OverlayPanel__actions">
              <button type="button" @click="selectAll">Select all</button>
              <button type="button" @click="clearSelection">Clear</button>
            </div>
          </header>

          <div v-if="selectedCountryMeta.length" class="SelectedChips">
            <button
              v-for="country in selectedCountryMeta"
              :key="country.id"
              class="SelectedChip"
              type="button"
              @click="toggleCountry(country.id)"
            >
              <span>{{ country.name }}</span>
              <small>{{ country.count }}</small>
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="FilterPanel__header">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search country"
            />
          </div>

          <div class="FilterPanel__list">
            <button
              v-for="country in filteredCountries"
              :key="country.id"
              type="button"
              class="FilterPanel__item"
              :class="{
                'FilterPanel__item--active': selectedCountries.includes(
                  country.id,
                ),
              }"
              @click="toggleCountry(country.id)"
            >
              <div class="FilterPanel__item__label">
                <span>{{ country.name }}</span>
                <small>{{ country.code }}</small>
              </div>
              <span class="FilterPanel__item__count"
                >{{ country.count }} bounty cells</span
              >
            </button>
          </div>
        </div>
      </transition>
    </div>

    <div class="CountryLabels">
      <div
        v-for="label in labelPositions"
        :key="label.id"
        class="CountryLabel"
        :class="{ 'CountryLabel--focused': label.highlight }"
        :style="label.style"
      >
        <span class="CountryLabel__name">{{ label.name }}</span>
        <span class="CountryLabel__count"> {{ label.count }} bounties </span>
      </div>
    </div>

    <div class="EdgeIndicators">
      <button
        v-for="indicator in edgeIndicators"
        :key="indicator.id"
        class="EdgeIndicator"
        :class="`EdgeIndicator--${indicator.side}`"
        :style="indicator.style"
        type="button"
        @click="handleIndicatorClick(indicator)"
      >
        <span class="EdgeIndicator__code">{{ indicator.code }}</span>
        <i
          class="fa-solid fa-arrow-up EdgeIndicator__arrow"
          :style="{ transform: `rotate(${indicator.rotation}deg)` }"
        ></i>
      </button>

      <div
        v-if="overflowMenu"
        class="EdgeIndicatorOverflow"
        :style="{
          top: `${overflowMenu.y}px`,
          left: `${overflowMenu.x}px`,
        }"
      >
        <button
          v-for="country in overflowMenu.countries"
          :key="country.id"
          type="button"
          @click="handleOverflowSelect(country)"
        >
          {{ country.name }} ({{ country.count }})
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .CellBountyOverlay {
    position: fixed;
    inset: 0;
    z-index: 2;
    pointer-events: none;
  }

  .OverlayControls {
    position: absolute;
    top: 90px;
    right: 24px;
    z-index: 3;
    pointer-events: auto;
    display: flex;
    align-items: flex-end;
    flex-direction: column;
    gap: 8px;
  }

  .OverlayToggle {
    pointer-events: auto;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 999px;
    background: rgba(4, 10, 20, 0.65);
    color: #f9fafb;
    padding: 6px 12px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 600;
    backdrop-filter: blur(14px);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.3);
    cursor: pointer;
  }

  .OverlayToggle__label {
    text-transform: none;
  }

  .OverlayToggle__count {
    background: rgba(255, 255, 255, 0.1);
    padding: 2px 6px;
    border-radius: 999px;
    font-size: 12px;
  }

  .OverlayPanel {
    pointer-events: auto;
    width: min(340px, 80vw);
    background: rgba(6, 12, 24, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 16px;
    padding: 14px;
    backdrop-filter: blur(18px);
    box-shadow:
      0 18px 40px rgba(0, 0, 0, 0.4),
      0 0 0 1px rgba(255, 255, 255, 0.03);
  }

  .OverlayPanel__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 10px;
  }

  .OverlayPanel__title {
    display: flex;
    flex-direction: column;
    gap: 2px;
    color: #f9fafb;
  }

  .OverlayPanel__title small {
    opacity: 0.7;
  }

  .OverlayPanel__actions {
    display: flex;
    gap: 6px;
  }

  .OverlayPanel__actions button {
    border-radius: 999px;
    padding: 4px 10px;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    border: none;
    background: rgba(255, 255, 255, 0.08);
    color: #f9fafb;
    cursor: pointer;
  }

  .SelectedChips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 6px;
  }

  .SelectedChip {
    background: rgba(16, 24, 40, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 999px;
    padding: 6px 10px;
    color: #f9fafb;
    font-size: 12px;
    display: inline-flex;
    gap: 6px;
    align-items: center;
    cursor: pointer;
  }

  .SelectedChip small {
    opacity: 0.8;
  }

  .FilterPanel__header {
    display: flex;
    gap: 6px;
    margin-bottom: 8px;
  }

  .FilterPanel__header input {
    flex: 1;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(15, 23, 42, 0.6);
    padding: 8px 10px;
    color: #f9fafb;
  }

  .FilterPanel__list {
    max-height: 240px;
    overflow: auto;
    display: grid;
    gap: 8px;
  }

  .FilterPanel__item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    background: rgba(15, 23, 42, 0.55);
    border-radius: 10px;
    border: 1px solid transparent;
    color: #f9fafb;
    cursor: pointer;
    gap: 8px;
  }

  .FilterPanel__item--active {
    border-color: rgba(186, 230, 253, 0.5);
    background: rgba(59, 130, 246, 0.16);
  }

  .FilterPanel__item__label {
    display: flex;
    flex-direction: column;
    gap: 2px;
    text-align: left;
  }

  .FilterPanel__item__label small {
    text-transform: uppercase;
    opacity: 0.7;
  }

  .FilterPanel__item__count {
    font-size: 12px;
    opacity: 0.85;
  }

  .PanelTransition-enter-active,
  .PanelTransition-leave-active {
    transition: all 0.2s ease-out;
  }

  .PanelTransition-enter-from,
  .PanelTransition-leave-to {
    opacity: 0;
    transform: translateY(-4px) scale(0.98);
  }

  .CountryLabels {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .CountryLabel {
    position: absolute;
    transform: translate(-50%, -50%);
    background: rgba(5, 10, 20, 0.65);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 999px;
    padding: 6px 12px;
    color: #f9fafb;
    display: inline-flex;
    gap: 10px;
    align-items: center;
    font-size: 12px;
    text-transform: capitalize;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
  }

  .CountryLabel--focused {
    border-color: rgba(231, 248, 255, 0.8);
    box-shadow: 0 0 0 3px rgba(231, 248, 255, 0.2);
  }

  .CountryLabel__count {
    opacity: 0.8;
  }

  .EdgeIndicators {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .EdgeIndicator {
    position: absolute;
    transform: translate(-50%, -50%);
    width: 44px;
    height: 44px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.35);
    background: rgba(17, 25, 40, 0.65);
    color: #f9fafb;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(12px);
    box-shadow:
      0 0 0 1px rgba(186, 106, 255, 0.6),
      0 0 18px rgba(186, 106, 255, 0.5),
      0 12px 30px rgba(0, 0, 0, 0.25);
    pointer-events: auto;
    cursor: pointer;
    gap: 2px;
  }

  .EdgeIndicator__code {
    font-weight: 600;
    font-size: 12px;
    letter-spacing: 0.04em;
  }

  .EdgeIndicator__arrow {
    font-size: 12px;
    opacity: 0.8;
  }

  .EdgeIndicatorOverflow {
    position: absolute;
    transform: translate(-50%, -50%);
    background: rgba(15, 23, 42, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 12px;
    padding: 6px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    pointer-events: auto;
    z-index: 20;
  }

  .EdgeIndicatorOverflow button {
    background: transparent;
    border: none;
    color: #f9fafb;
    font-size: 12px;
    text-align: left;
    padding: 4px 8px;
    border-radius: 6px;
    cursor: pointer;
  }

  .EdgeIndicatorOverflow button:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  @media (max-width: 640px) {
    .OverlayControls {
      top: 160px;
      right: 48px;
    }

    .OverlayPanel {
      width: calc(80vw - 32px);
    }

    .FilterPanel__list {
      max-height: 180px;
    }

    .EdgeIndicator {
      width: 36px;
      height: 36px;
      font-size: 10px;
    }
  }
</style>
