<script setup lang="ts">
  import { onBeforeUnmount, ref, watch, computed, nextTick } from 'vue'
  import type { Map as MapboxMap } from 'mapbox-gl'
  import { useMapboxStore } from '~/stores/mapboxStore'
  import type { CellBountyCountry } from '@/components/Mapbox/types/mapbox'

  const props = defineProps<{
    mapInstance?: MapboxMap
    isActive: boolean
    focusedCountry?: string | null
  }>()

  const emit = defineEmits<{
    focusCountry: [countryCode: string]
  }>()

  const mapboxStore = useMapboxStore()

  const isPanelOpen = ref(false)
  const searchQuery = ref('')
  const overflowMenu = ref<{
    side: 'left' | 'right' | 'top' | 'bottom'
    countries: CellBountyCountry[]
    x: number
    y: number
  } | null>(null)

  const countries = computed<CellBountyCountry[]>(() =>
    mapboxStore.getBountyCountries || [],
  )
  const selectedCountries = computed<string[]>(() =>
    mapboxStore.getSelectedBountyCountries || [],
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
    const inset = 16
    const baseOffset = 72
    const spacing = 56

    const labels: typeof labelPositions.value = []
    const rawIndicators: Array<{
      id: string
      code: string
      name: string
      side: 'left' | 'right' | 'top' | 'bottom'
      x: number
      y: number
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
        let side: 'left' | 'right' | 'top' | 'bottom' = 'right'
        let x = projected.x
        let y = projected.y

        if (projected.x < inset) {
          side = 'left'
          x = inset
          y = clamp(projected.y, baseOffset, height - baseOffset)
        } else if (projected.x > width - inset) {
          side = 'right'
          x = width - inset
          y = clamp(projected.y, baseOffset, height - baseOffset)
        } else if (projected.y < inset) {
          side = 'top'
          x = clamp(projected.x, baseOffset, width - baseOffset)
          y = inset
        } else {
          side = 'bottom'
          x = clamp(projected.x, baseOffset, width - baseOffset)
          y = height - inset
        }

        const angle =
          (Math.atan2(projected.y - y, projected.x - x) * 180) / Math.PI + 90

        rawIndicators.push({
          id: country.id,
          code: country.code,
          name: country.name,
          side,
          x,
          y,
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
        .sort((a, b) => (side === 'top' || side === 'bottom' ? a.x - b.x : a.y - b.y))

      const maxPerSide = 3
      const displayed =
        items.length > maxPerSide
          ? items.slice(0, maxPerSide - 1)
          : items.slice()
      const overflow =
        items.length > maxPerSide ? items.slice(maxPerSide - 1) : []

      displayed.forEach((indicator, index) => {
        const positionStyle =
          side === 'left' || side === 'right'
            ? {
                top: `${clamp(
                  baseOffset + index * spacing,
                  baseOffset,
                  height - baseOffset,
                )}px`,
                left: `${indicator.x}px`,
              }
            : {
                left: `${clamp(
                  baseOffset + index * spacing,
                  baseOffset,
                  width - baseOffset,
                )}px`,
                top: `${indicator.y}px`,
              }

        indicators.push({
          id: indicator.id,
          code: indicator.code,
          name: indicator.name,
          side,
          style: positionStyle,
          rotation: indicator.rotation,
        })
      })

      if (overflow.length) {
        const overflowLabel = `+${overflow.length}`
        const overflowCountries = overflow
          .map((item) => countries.value.find((c) => c.id === item.id))
          .filter(Boolean) as CellBountyCountry[]
        const overflowStyle =
          side === 'left' || side === 'right'
            ? {
                top: `${clamp(
                  baseOffset + displayed.length * spacing,
                  baseOffset,
                  height - baseOffset,
                )}px`,
                left: `${overflow[0].x}px`,
              }
            : {
                left: `${clamp(
                  baseOffset + displayed.length * spacing,
                  baseOffset,
                  width - baseOffset,
                )}px`,
                top: `${overflow[0].y}px`,
              }

        indicators.push({
          id: `${side}-overflow`,
          code: overflowLabel,
          name: `${overflow.length} more`,
          side,
          style: overflowStyle,
          rotation: overflow[0].rotation,
          overflow: overflowCountries,
        })
      }
    })

    labelPositions.value = labels
    edgeIndicators.value = indicators
  }

  const handleIndicatorClick = (indicator: (typeof edgeIndicators.value)[number]) => {
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

  onBeforeUnmount(() => {
    detachMapListeners()
  })
</script>

<template>
  <div v-if="isActive" class="CellBountyOverlay">
    <div class="CellBountyOverlay__panel">
      <div class="CellBountyOverlay__summary">
        <button class="FilterButton" type="button" @click="togglePanel">
          <span>Cell Bounty</span>
          <span class="FilterButton__count">
            {{ selectedCountries.length }} selected
          </span>
          <i
            class="fa-solid"
            :class="[
              isPanelOpen ? 'fa-chevron-up' : 'fa-chevron-down',
              'FilterButton__icon',
            ]"
          ></i>
        </button>

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
      </div>

      <transition name="PanelTransition">
        <div v-if="isPanelOpen" class="FilterPanel">
          <div class="FilterPanel__header">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search country"
            />
            <div class="FilterPanel__actions">
              <button type="button" @click="selectAll">Select all</button>
              <button type="button" @click="clearSelection">Clear</button>
            </div>
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
        <span class="CountryLabel__count">
          {{ label.count }} bounties
        </span>
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
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 12;
    width: min(680px, 90vw);
    pointer-events: none;
  }

  .CellBountyOverlay__panel {
    pointer-events: auto;
    background: rgba(6, 12, 24, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 18px;
    padding: 16px;
    backdrop-filter: blur(14px);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
  }

  .CellBountyOverlay__summary {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .FilterButton {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 999px;
    padding: 8px 18px;
    color: #f3f4f6;
    font-size: 14px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }

  .FilterButton__count {
    opacity: 0.8;
  }

  .FilterButton__icon {
    font-size: 12px;
  }

  .SelectedChips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
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

  .FilterPanel {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .FilterPanel__header {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .FilterPanel__header input {
    flex: 1;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(15, 23, 42, 0.6);
    padding: 8px 10px;
    color: #f9fafb;
  }

  .FilterPanel__actions {
    display: flex;
    gap: 6px;
  }

  .FilterPanel__actions button {
    border-radius: 8px;
    padding: 6px 10px;
    background: rgba(255, 255, 255, 0.08);
    border: none;
    color: #f9fafb;
    font-size: 12px;
    cursor: pointer;
  }

  .FilterPanel__list {
    max-height: 220px;
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
    transform: translateY(-6px);
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
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
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

  @media (max-width: 768px) {
    .CellBountyOverlay {
      top: 12px;
      width: calc(100% - 32px);
    }

    .CellBountyOverlay__panel {
      padding: 12px;
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
