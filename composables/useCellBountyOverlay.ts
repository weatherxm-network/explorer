import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import type { Ref } from 'vue'
import type { Map as MapboxMap } from 'mapbox-gl'
import type { useDisplay } from 'vuetify'
import type { CellBountyCountry } from '@/components/Mapbox/types/mapbox'
import { useMapboxStore } from '~/stores/mapboxStore'
import {
  computeLabelsAndRawIndicators,
  layoutIndicatorsWithSpacing,
  type CountryLabelPosition,
  type EdgeIndicator,
  type OverlayLayoutContext,
  type ProjectedCountry,
} from '~/utils/cellBountyOverlayGeometry'

interface UseCellBountyOverlayOptions {
  mapInstance: Ref<MapboxMap | undefined>
  isActive: Ref<boolean>
  focusedCountry: Ref<string | null | undefined>
  mapboxStore: ReturnType<typeof useMapboxStore>
  isDesktopDrawerOpen: Ref<boolean>
  display: ReturnType<typeof useDisplay>
  emitFocusCountry: (id: string) => void
}

const resolveSmAndDown = (display: ReturnType<typeof useDisplay>) => {
  const value = (display as { smAndDown: unknown }).smAndDown
  if (typeof value === 'object' && value !== null && 'value' in value) {
    return Boolean((value as { value: boolean }).value)
  }
  return Boolean(value)
}

export const useCellBountyOverlay = ({
  mapInstance,
  isActive,
  focusedCountry,
  mapboxStore,
  isDesktopDrawerOpen,
  display,
  emitFocusCountry,
}: UseCellBountyOverlayOptions) => {
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

  const labelPositions = ref<CountryLabelPosition[]>([])
  const edgeIndicators = ref<EdgeIndicator[]>([])

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

  const scheduleUpdate = () => {
    requestAnimationFrame(() => updateOverlayPositions())
  }

  const detachMapListeners = () => {
    if (!mapInstance.value || !mapListenersAttached) return
    mapInstance.value.off('move', scheduleUpdate)
    mapInstance.value.off('zoom', scheduleUpdate)
    mapInstance.value.off('rotate', scheduleUpdate)
    mapListenersAttached = false
  }

  const attachMapListeners = () => {
    if (!mapInstance.value || mapListenersAttached) return
    mapInstance.value.on('move', scheduleUpdate)
    mapInstance.value.on('zoom', scheduleUpdate)
    mapInstance.value.on('rotate', scheduleUpdate)
    mapListenersAttached = true
  }

  const updateOverlayPositions = () => {
    const map = mapInstance.value
    if (!map || !isActive.value) {
      labelPositions.value = []
      edgeIndicators.value = []
      return
    }

    const container = map.getContainer()
    const bounds = map.getBounds()
    const width = container.clientWidth
    const height = container.clientHeight
    const edgePadding = 24
    const indicatorOffset = 48
    const spacing = 52
    const drawerOffset =
      isDesktopDrawerOpen.value && !resolveSmAndDown(display) ? 440 : 0
    const xMax = width - edgePadding
    const xMin = Math.min(drawerOffset + edgePadding, xMax)
    const yMin = edgePadding
    const yMax = height - edgePadding

    const layout: OverlayLayoutContext = {
      xMin,
      xMax,
      yMin,
      yMax,
      spacing,
      indicatorOffset,
    }

    const projectedCountries: ProjectedCountry[] = selectedCountryMeta.value.map(
      (country) => {
        const { lon, lat } = country.centroid
        const projected = map.project([lon, lat])
        return {
          id: country.id,
          code: country.code,
          name: country.name,
          count: country.count,
          projectedX: projected.x,
          projectedY: projected.y,
          isVisible: bounds.contains([lon, lat]),
          highlight: focusedCountry.value === country.id,
        }
      },
    )

    const { labels, rawIndicators } = computeLabelsAndRawIndicators(
      projectedCountries,
      layout,
    )

    const indicators = layoutIndicatorsWithSpacing({
      rawIndicators,
      layout,
      countries: countries.value,
    })

    labelPositions.value = labels
    edgeIndicators.value = indicators
  }

  const handleIndicatorClick = (indicator: EdgeIndicator) => {
    if (indicator.overflow) {
      overflowMenu.value = {
        side: indicator.side,
        countries: indicator.overflow,
        x: parseFloat(indicator.style.left),
        y: parseFloat(indicator.style.top),
      }
      return
    }

    emitFocusCountry(indicator.id)
  }

  const handleOverflowSelect = (country: CellBountyCountry) => {
    overflowMenu.value = null
    emitFocusCountry(country.id)
  }

  watch(
    isActive,
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

  watch(mapInstance, () => {
    if (isActive.value) {
      detachMapListeners()
      attachMapListeners()
      updateOverlayPositions()
    }
  })

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

  watch(focusedCountry, () => {
    updateOverlayPositions()
  })

  watch(isDesktopDrawerOpen, () => {
    updateOverlayPositions()
  })

  onBeforeUnmount(() => {
    detachMapListeners()
  })

  return {
    isPanelOpen,
    searchQuery,
    selectedCountries,
    selectedCountryMeta,
    filteredCountries,
    labelPositions,
    edgeIndicators,
    overflowMenu,
    togglePanel,
    toggleCountry,
    clearSelection,
    selectAll,
    handleIndicatorClick,
    handleOverflowSelect,
  }
}
