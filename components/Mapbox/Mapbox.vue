<script setup lang="ts">
  import mapboxgl from 'mapbox-gl'
  import type { LayerKeys } from '@/components/Mapbox/types/mapbox'
  import type {
    Map as MapboxMap,
    IControl,
    MapboxGeoJSONFeature,
  } from 'mapbox-gl'
  import { useDisplay, useTheme } from 'vuetify'
  import _ from 'lodash'
  import calcedMapboxData from './utils/calcedMapboxData'
  import mapCreation from './utils/mapCreation'
  import { extractCellBountyCountries } from './utils/cellBountyCountries'
  import StatsButton from './widgets/StatsButton.vue'
  import RefreshSnackbar from './widgets/RefreshSnackbar.vue'
  import SearchBar from './widgets/SearchBar.vue'
  import TrackingConcentComponent from './widgets/TrackingConcentComponent.vue'
  import NearbyStationsWidget from '@/components/Mapbox/widgets/NearbyStationsWidget.vue'
  import BountyCellsTopBanner from './widgets/BountyCellsTopBanner.vue'
  import CellBountyFilterOverlay from './widgets/CellBountyFilterOverlay.vue'
  import MapControlsTrigger from './controls/MapControlsTrigger.vue'
  import MapControlsPanel from './controls/MapControlsPanel.vue'
  import type {
    Point,
    SearchResultDevice,
    Collections,
    CellBountyCountry,
  } from './types/mapbox'
  import { useMapControlsStore } from '~/stores/mapControlsStore'
  import { useMapboxStore } from '~/stores/mapboxStore'
  import { useMobileStore } from '~/stores/mobileStore'
  import wxmApi from '~/api/wxmApi'
  import { storeToRefs } from 'pinia'
  import { useDrawerStore } from '~/stores/drawerStore'

  type MapboxFilter = Exclude<Parameters<MapboxMap['setFilter']>[1], undefined>

  const config = useRuntimeConfig().public
  const mobileStore = useMobileStore()
  const mapboxStore = useMapboxStore()
  const drawerStore = useDrawerStore()
  const mapControlsStore = useMapControlsStore()

  const { isDesktopDrawerOpen } = storeToRefs(drawerStore)
  const { trackGAevent } = useGAevents()
  const display = useDisplay()
  const theme = useTheme()
  const route = useRoute()
  let navControls = reactive<IControl>({} as IControl)
  let geolocate = reactive<IControl>({} as IControl)
  const map = ref<MapboxMap>()
  const mapboxLoading = ref(false)
  const mapReady = ref(false)
  const pendingDeepLinkPath = ref<string | null>(null)
  const collections = ref<Collections>()
  const hoverCellId = ref('')
  const clickCellId = ref('')
  const snackbar = ref(false)
  const onLine = ref(navigator.onLine)
  const controlsContainer = ref<HTMLElement | null>(null)
  const darkStyleId = (config.mapboxStyle ||
    'mapbox://styles/mapbox/dark-v11') as MapStyleId

  const visibleBountyCellsCount = ref(0)

  // Sync Route to Store
  if (route.query.mapStyle) {
    const style = route.query.mapStyle as string
    if (style === 'cell-bounty') {
      mapControlsStore.setCellBounties(true)
    } else if (style === 'targeted-rollouts') {
      mapControlsStore.setOverlayMode('targeted_rollouts')
    } else if (style === 'data-quality') {
      mapControlsStore.setOverlayMode('capacity_quality')
    } else if (style === 'cell-capacity') {
      mapControlsStore.setOverlayMode('capacity_quality')
    }
  }

  const activeStationsCount = ref(0)
  const cellActiveCounts = ref(new Map<string, number>())
  const focusedBountyCountry = ref<string | null>(null)
  let focusCountryTimeout: number | undefined

  const smBreakpoint = computed(() => {
    return display.smAndDown.value
  })

  const defaultThemeStyle = computed(
    () =>
      (theme.current.value.dark
        ? darkStyleId
        : 'mapbox://styles/mapbox/light-v11') as MapStyleId,
  )

  // Align default map style with the current theme (without overriding custom choices like satellite)
  if (
    mapControlsStore.getActiveStyleId === darkStyleId ||
    mapControlsStore.getActiveStyleId === 'mapbox://styles/mapbox/light-v11'
  ) {
    mapControlsStore.setMapStyle(defaultThemeStyle.value)
  }

  const visibleNearbyCount = computed(() =>
    mapControlsStore.isCellBountiesEnabled
      ? visibleBountyCellsCount.value
      : activeStationsCount.value,
  )

  const openSidebar = () => {
    if (display.smAndDown.value) {
      mobileStore.setPageState(true)
    }
  }

  const navButtonsStyles = computed(() => {
    return {
      '--top-color': theme.current.value.colors.top,
      '--text-color': theme.current.value.colors.text,
      '--primary-color': theme.current.value.colors.primary,
      '--text-filter-color': theme.current.value.dark
        ? 'invert(100%) sepia(20%) saturate(6008%) hue-rotate(183deg) brightness(109%) contrast(103%)'
        : 'invert(6%) sepia(3%) saturate(4770%) hue-rotate(195deg) brightness(92%) contrast(88%)',
      '--primary-filter-color': theme.current.value.dark
        ? 'invert(78%) sepia(38%) saturate(897%) hue-rotate(188deg) brightness(101%) contrast(101%)'
        : 'invert(24%) sepia(86%) saturate(1662%) hue-rotate(202deg) brightness(86%) contrast(103%)',
      '--overlap-filter-color': theme.current.value.dark
        ? 'brightness(0) invert(1)'
        : 'invert(0%) sepia(0%) saturate(3351%) hue-rotate(142deg) brightness(87%) contrast(100%)',
    }
  })

  const controlsThemeVars = computed(() => {
    const isDark = theme.current.value.dark
    return {
      '--controls-surface': isDark ? '#1f222a' : '#ffffff',
      '--controls-surface-strong': isDark ? '#262a33' : '#f7f8fa',
      '--controls-border': isDark
        ? 'rgba(255,255,255,0.08)'
        : 'rgba(0,0,0,0.08)',
      '--controls-text': isDark ? '#f4f6fb' : '#1f2933',
      '--controls-muted': isDark ? '#9ea7b6' : '#6b7280',
      '--controls-shadow': isDark
        ? '0 10px 40px rgba(0,0,0,0.45)'
        : '0 10px 40px rgba(0,0,0,0.18)',
    }
  })

  watchEffect(() => {
    if (typeof document === 'undefined') return
    const vars = controlsThemeVars.value
    Object.entries(vars).forEach(([key, val]) => {
      document.documentElement.style.setProperty(key, val as string)
    })
  })

  const initMapPositonEvent = computed(() => {
    return mapboxStore.getInitMapPositionEvent
  })

  const searchedAddressToFly = computed(() => {
    return mapboxStore.getSearchedAddressToFly
  })

  const searchedDeviceToFly = computed(() => {
    return mapboxStore.getSearchedDeviceToFly
  })

  const qualityRange = computed(() => {
    return mapboxStore.getQualityRange
  })

  const bountyCountries = computed(() => mapboxStore.getBountyCountries)
  const selectedBountyCountries = computed(
    () => mapboxStore.getSelectedBountyCountries,
  )

  const getResponsivePadding = () => {
    if (typeof window === 'undefined') {
      return 64
    }
    const width = window.innerWidth || 0
    if (width < 600) return 48
    if (width < 1024) return 64
    return 96
  }

  const fitCountriesByCodes = (codes: string[], duration = 380) => {
    if (!map.value || !codes.length) return

    const targets: CellBountyCountry[] = bountyCountries.value.filter(
      (country) => codes.includes(country.id),
    )
    if (!targets.length) return

    const bounds = new mapboxgl.LngLatBounds()
    targets.forEach((country) => {
      bounds.extend([country.bbox[0], country.bbox[1]])
      bounds.extend([country.bbox[2], country.bbox[3]])
    })

    const padding = getResponsivePadding()

    try {
      map.value.fitBounds(bounds, {
        padding: {
          top: padding,
          bottom: padding,
          left: padding,
          right: padding,
        },
        duration,
        easing: (t) => 1 - Math.pow(1 - t, 3),
        maxZoom: codes.length === 1 ? 8.5 : 7.2,
      })
    } catch (error) {
      console.warn('Unable to fit bounty countries', error)
    }
  }

  const applyCellBountyStyling = (selection: string[]) => {
    if (!map.value || !map.value.getLayer('cell-bounty-hexagons')) {
      return
    }

    const literal: ['literal', string[]] = ['literal', selection]

    map.value.setPaintProperty('cell-bounty-hexagons', 'fill-color', [
      'case',
      ['in', ['get', 'country_code'], literal],
      'rgba(187, 106, 255, 0.65)',
      'rgba(145, 40, 190, 0.18)',
    ])

    map.value.setPaintProperty('cell-bounty-hexagons', 'fill-outline-color', [
      'case',
      ['in', ['get', 'country_code'], literal],
      '#f9fafb',
      '#9128be',
    ])

    if (map.value.getLayer('cell-bounty-hexagons-outline')) {
      map.value.setPaintProperty('cell-bounty-hexagons-outline', 'line-color', [
        'case',
        ['in', ['get', 'country_code'], literal],
        '#f9fafb',
        '#9128be',
      ])

      map.value.setPaintProperty('cell-bounty-hexagons-outline', 'line-width', [
        'case',
        ['in', ['get', 'country_code'], literal],
        2.5,
        1,
      ])
    }
  }

  const scheduleFitSelectedCountries = _.debounce((codes: string[]) => {
    fitCountriesByCodes(codes, codes.length > 1 ? 450 : 380)
  }, 150)

  const focusBountyCountry = (countryCode: string) => {
    if (!countryCode) return
    fitCountriesByCodes([countryCode], 420)
    focusedBountyCountry.value = countryCode
    if (focusCountryTimeout) {
      window.clearTimeout(focusCountryTimeout)
    }
    focusCountryTimeout = window.setTimeout(() => {
      focusedBountyCountry.value = null
    }, 1400)
  }

  const hasCommunityDevicesOnly = (devices: {
    [key: string]: number
  }): boolean => {
    const deviceKeys = Object.keys(devices)
    return deviceKeys.length === 1 && deviceKeys[0] === 'community'
  }

  watch(onLine, (value) => {
    value ? (snackbar.value = false) : (snackbar.value = true)
  })

  watch(
    [() => searchedAddressToFly.value, () => mapReady.value],
    ([newAddress, ready]) => {
      if (!newAddress || !ready) return

      map.value?.flyTo({
        center: [newAddress.center.lon, newAddress.center.lat],
        zoom: 13,
      })
    },
  )

  watch(
    [() => searchedDeviceToFly.value, () => mapReady.value],
    ([newDevice, ready]) => {
      if (!newDevice || !ready) return

      const coords: Point = {
        lon: newDevice.cell_center.lon,
        lat: newDevice.cell_center.lat,
      }
      // check if any polygon is already clicked
      if (clickCellId.value) {
        // if any remove its outline layer
        removeOutLineLayer(clickCellId.value)
      }
      // else set the new polygon id
      clickCellId.value = newDevice.cell_index
      // add outline to new polygon
      addOutLineLayer(clickCellId.value)
      // zoom to cell
      map.value?.flyTo({
        center: [coords.lon, coords.lat],
        zoom: 13,
      })
      // navigato to cells page
      const targetPath = `/stations/${formatDeviceName.denormalizeDeviceName(newDevice.name)}`
      if (route.path !== targetPath) {
        navigateTo(targetPath)
      }
      openSidebar()
    },
  )

  watch(initMapPositonEvent, (val, newVal) => {
    if (val !== newVal) {
      mapsInitialPosition()
    }
  })

  // Manual global click listener to handle panel closing
  const onGlobalClick = (e: MouseEvent) => {
    // If mobile, let bottom sheet handle its own closing (scrim)
    if (smBreakpoint.value) return

    if (!mapControlsStore.isPanelOpen) return

    // Check if click is inside the controls container use composedPath for better shadow dom support (optional)
    if (
      controlsContainer.value &&
      controlsContainer.value.contains(e.target as Node)
    ) {
      return
    }

    // Click was outside
    mapControlsStore.setPanelOpen(false)
  }

  function updateMapLayers() {
    if (!map.value) return

    const mode = mapControlsStore.getOverlayMode
    const bountiesEnabled = mapControlsStore.isCellBountiesEnabled

    // Helper to safe set visibility
    const setVisibility = (layerId: string, visible: boolean) => {
      if (map.value?.getLayer(layerId)) {
        map.value.setLayoutProperty(
          layerId,
          'visibility',
          visible ? 'visible' : 'none',
        )
      }
    }

    // 1. Handle Overlay Mode
    if (mode === 'targeted_rollouts') {
      setVisibility('cells', false)
      setVisibility('targeted-rollouts-hexagons', true)
      setVisibility('targeted-rollouts-heat', true)
      setVisibility('heat', false)
      setVisibility('device-count-labels', true) // Show device count labels for rollouts

      applyTargetedRolloutsFilter()
    } else {
      setVisibility('targeted-rollouts-hexagons', false)
      setVisibility('targeted-rollouts-heat', false)
      removeTargetedRolloutsFilter()

      setVisibility('cells', true)
      setVisibility('cell-capacity-labels', true)
      setVisibility('device-count-labels', false)
      setVisibility('heat', true) // keep glow at zoomed-out levels
    }

    // 2. Handle Bounties (Independent)
    setVisibility('cell-bounty-hexagons', bountiesEnabled)
    setVisibility('cell-bounty-heat', bountiesEnabled)
    if (map.value.getLayer('cell-bounty-hexagons-outline')) {
      map.value.setLayoutProperty(
        'cell-bounty-hexagons-outline',
        'visibility',
        bountiesEnabled ? 'visible' : 'none',
      )
    }

    // Zoom to bounties if enabled and we have selection
    if (bountiesEnabled && mapboxStore.getSelectedBountyCountries.length) {
      // Use debounce or ensure this doesn't conflict with initial load
      scheduleFitSelectedCountries([...mapboxStore.getSelectedBountyCountries])
    }
  }

  function mountSourcesAndLayers() {
    if (!collections.value) return

    addCellsSource()
    addHeatSource()
    addTargetedRolloutsHeatSource()
    addCellBountySource()
    addCellBountyHeatSource()

    addCellsLayer()
    addHeatLayer()
    addTargetedRolloutsHeatLayer()
    addCellCapacityLabelsLayer()
    addTargetedRolloutsLayer()
    addCellBountyLayer()
    addCellBountyHeatLayer()
    addDeviceCountLabels()

    updateDataQualityFilter(qualityRange.value)
    updateMapLayers()
  }

  const rebuildMapStyle = (styleId: MapStyleId) => {
    if (!map.value) return

    mapboxLoading.value = true
    map.value.setStyle(styleId)
    map.value.once('style.load', () => {
      if (collections.value) {
        mountSourcesAndLayers()
      }
      mapboxLoading.value = false
    })
  }

  watch(qualityRange, (newRange) => {
    if (map.value && map.value.getLayer('cells')) {
      updateDataQualityFilter(newRange)
    }
  })

  watch(
    () => theme.current.value.dark,
    () => {
      const active = mapControlsStore.getActiveStyleId
      if (
        active === darkStyleId ||
        active === 'mapbox://styles/mapbox/light-v11'
      ) {
        mapControlsStore.setMapStyle(defaultThemeStyle.value)
      }
    },
  )

  watch(
    () => selectedBountyCountries.value.slice(),
    (selection) => {
      applyCellBountyStyling(selection)
      if (mapControlsStore.isCellBountiesEnabled && selection.length) {
        scheduleFitSelectedCountries([...selection])
      }
    },
    { immediate: true },
  )

  // Main Layer Logic Watcher
  watch(
    [
      () => mapControlsStore.getOverlayMode,
      () => mapControlsStore.isCellBountiesEnabled,
      () => mapControlsStore.getActiveStyleId,
    ],
    () => {
      updateMapLayers()
    },
  )

  // Style Watcher (Separate because it might need style reload, but if it is just updateLayers call it's fine)
  watch(
    () => mapControlsStore.getActiveStyleId,
    (newStyle) => {
      if (!map.value) return
      rebuildMapStyle(newStyle)
    },
  )

  const onResize = () => {
    // check if map is ready
    if (!_.isEmpty(map.value)) {
      // check screen's dimensions
      if (!smBreakpoint.value && map.value._controls.length !== 3) {
        changeMapboxLogoPosition()
        removeNavControlFromMap()
        removeGeolocateControlFromMap()
        addNavControlOnMap()
        addGeolocateControlOnMap()
      } else if (smBreakpoint.value && map.value._controls.length === 3) {
        removeNavControlFromMap()
        changeMapboxLogoPosition()
      }
      map.value.resize()
    }
  }

  const updateOnlineStatus = (e: Event) => {
    const { type } = e
    onLine.value = type === 'online'
  }

  const mapsInitialPosition = () => {
    // zoom out to initial position
    map.value?.flyTo({
      center: [24.162572, 38.667284],
      zoom: 3,
    })
  }

  const createNavControls = () => {
    return new mapboxgl.NavigationControl({
      showCompass: false,
    })
  }

  const createGeolocate = () => {
    return new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      showUserLocation: true,
      trackUserLocation: true,
    })
  }

  const addNavControlOnMap = () => {
    map.value?.addControl(navControls, 'bottom-right')
  }

  const removeNavControlFromMap = () => {
    map.value?.removeControl(navControls)
  }

  const addGeolocateControlOnMap = () => {
    map.value?.addControl(geolocate, 'bottom-right')
  }

  const removeGeolocateControlFromMap = () => {
    map.value?.removeControl(geolocate)
  }

  const changeMapboxLogoPosition = () => {
    const mapboxLogo = document.getElementsByClassName(
      'mapboxgl-ctrl-bottom-left',
    )[0] as HTMLElement

    if (mapboxLogo) {
      if (smBreakpoint.value || !isDesktopDrawerOpen.value) {
        mapboxLogo.style.left = '0px'
      } else {
        mapboxLogo.style.left = '440px'
      }
    }
  }

  watch(isDesktopDrawerOpen, () => {
    changeMapboxLogoPosition()
    setTimeout(() => {
      map.value?.resize()
    }, 300)
  })

  const addCellsSource = () => {
    if (!collections.value?.cellsCollection) {
      return
    }

    const enrichedCollection = {
      ...collections.value.cellsCollection,
      features: collections.value.cellsCollection.features.map((feature) => ({
        ...feature,
        properties: {
          ...feature.properties,
          community_only: hasCommunityDevicesOnly(feature.properties.devices),
        },
      })),
    }

    map.value?.addSource('cells', {
      type: 'geojson',
      data: enrichedCollection as never as MapboxGeoJSONFeature,
    })
  }

  const addHeatSource = () => {
    map.value?.addSource('heatmap', {
      type: 'geojson',
      data: collections.value
        ?.heatmapCollection as never as MapboxGeoJSONFeature,
    })
  }

  const addTargetedRolloutsHeatSource = () => {
    map.value?.addSource('targeted-rollouts-heatmap', {
      type: 'geojson',
      data: collections.value
        ?.targetedRolloutsHeatmapCollection as never as MapboxGeoJSONFeature,
    })
  }

  const addCellBountySource = () => {
    if (!collections.value?.cellBountyCollection) {
      return
    }

    try {
      map.value?.addSource('cell-bounty', {
        type: 'geojson',
        data: collections.value
          .cellBountyCollection as never as MapboxGeoJSONFeature,
      })
    } catch (error) {
      console.error('Error adding cell-bounty source:', error)
    }
  }

  const addCellBountyHeatSource = () => {
    if (!collections.value?.cellBountyHeatmapCollection) {
      return
    }

    try {
      map.value?.addSource('cell-bounty-heatmap', {
        type: 'geojson',
        data: collections.value
          .cellBountyHeatmapCollection as never as MapboxGeoJSONFeature,
      })
    } catch (error) {
      console.error('Error adding cell-bounty-heatmap source:', error)
    }
  }

  const addCellsLayer = () => {
    map.value?.addLayer({
      id: 'cells',
      type: 'fill',
      source: 'cells',
      layout: {
        visibility: 'visible',
      },
      paint: {
        'fill-color': [
          'case',
          ['==', ['typeof', ['get', 'avg_data_quality']], 'undefined'],
          '#C6C6D0', // Grey for no data
          ['==', ['get', 'avg_data_quality'], null],
          '#C6C6D0', // Grey for null data
          [
            'step',
            ['get', 'avg_data_quality'],
            '#FF1744', // 0-19.99
            19.99,
            '#FFAB49', // 20-79.99
            79.99,
            '#00E676', // 80-100
          ],
        ],
        'fill-opacity': [
          'interpolate',
          ['exponential', 0.5],
          ['zoom'],
          9.5,
          0.0,
          10,
          0.6,
          15,
          0.6,
        ],
      },
      filter: ['==', '$type', 'Polygon'],
    })
  }

  const addHeatLayer = () => {
    const beforeId =
      map.value
        ?.getStyle()
        ?.layers?.find((l) => l.type === 'symbol' && l.id.includes('label'))
        ?.id ??
      map.value?.getStyle()?.layers?.find((l) => l.type === 'symbol')?.id

    map.value?.addLayer(
      {
        id: 'heat',
        type: 'heatmap',
        source: 'heatmap',
        maxzoom: 10,
        minzoom: 0,
        paint: {
          // Increase the heatmap weight based on frequency and property magnitude
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'device_count'],
            0,
            0,
            1000,
            1000,
          ],
          // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
          // Begin color ramp at 0-stop with a 0-transparancy color
          // to create a blur-like effect.
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0,
            'rgba(33.0, 102.0, 172.0, 0.0)',
            0.2,
            'rgb(103.0, 169.0, 207.0)',
            0.4,
            'rgba(162.0, 187.0, 201.0, 0.85)',
            0.6,
            'rgba(149.0, 153.0, 189.0, 0.85)',
            0.8,
            'rgb(103.0, 118.0, 247.0)',
            1,
            'rgb(0.0, 255.0, 206.0)',
          ],
          // Adjust the heatmap radius by zoom level
          'heatmap-radius': {
            stops: [
              [0, 2],
              [9, 20],
            ],
          },
          // Transition from heatmap to circle layer by zoom level
          'heatmap-opacity': [
            'interpolate',
            ['exponential', 0.5],
            // ["linear"],
            ['zoom'],
            0,
            1.0,
            8,
            0.9,
            9,
            0.5,
            9.5,
            0.1,
            10,
            0.0,
          ],
        },
      },
      beforeId,
    )
  }

  const addTargetedRolloutsHeatLayer = () => {
    const beforeId =
      map.value
        ?.getStyle()
        ?.layers?.find((l) => l.type === 'symbol' && l.id.includes('label'))
        ?.id ??
      map.value?.getStyle()?.layers?.find((l) => l.type === 'symbol')?.id

    map.value?.addLayer(
      {
        id: 'targeted-rollouts-heat',
        type: 'heatmap',
        source: 'targeted-rollouts-heatmap',
        maxzoom: 10,
        minzoom: 0,
        layout: {
          visibility: 'none',
        },
        paint: {
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'device_count'],
            0,
            0,
            1000,
            1000,
          ],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0,
            'rgba(33.0, 102.0, 172.0, 0.0)',
            0.2,
            'rgb(103.0, 169.0, 207.0)',
            0.4,
            'rgba(162.0, 187.0, 201.0, 0.85)',
            0.6,
            'rgba(149.0, 153.0, 189.0, 0.85)',
            0.8,
            'rgb(103.0, 118.0, 247.0)',
            1,
            'rgb(0.0, 255.0, 206.0)',
          ],
          'heatmap-radius': {
            stops: [
              [0, 2],
              [9, 20],
            ],
          },
          'heatmap-opacity': [
            'interpolate',
            ['exponential', 0.5],
            ['zoom'],
            0,
            1.0,
            8,
            0.9,
            9,
            0.5,
            9.5,
            0.1,
            10,
            0.0,
          ],
        },
      },
      beforeId,
    )
  }

  const addDeviceCountLabels = () => {
    map.value?.addLayer({
      id: 'device-count-labels',
      type: 'symbol',
      source: 'heatmap',
      layout: {
        'visibility': 'visible',
        'text-field': ['get', 'device_count'],
        'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
        'text-size': 16,
        'text-anchor': 'center',
      },
      paint: {
        'text-color': '#ffffff',
        'text-halo-color': '#333',
        'text-halo-width': 2,
        'text-opacity': [
          'interpolate',
          ['exponential', 0.5],
          ['zoom'],
          9.5,
          0.0,
          11,
          1.0,
          15,
          1.0,
        ],
      },
    })
  }

  const addCellCapacityLabelsLayer = () => {
    map.value?.addLayer({
      id: 'cell-capacity-labels',
      type: 'symbol',
      source: 'heatmap',
      layout: {
        'text-field': [
          'concat',
          ['to-string', ['get', 'device_count']],
          '/',
          ['to-string', ['coalesce', ['get', 'capacity'], 0]],
        ],
        'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
        'text-size': 12,
        'text-anchor': 'center',
        'visibility': 'visible',
      },
      paint: {
        'text-color': '#ffffff',
        'text-halo-color': '#000000',
        'text-halo-width': 2,
        // Opposite visibility pattern of heatmap - visible when heatmap fades out
        'text-opacity': [
          'interpolate',
          ['exponential', 0.5],
          ['zoom'],
          9.5,
          0.0,
          11,
          1.0,
          15,
          1.0,
        ],
      },
      filter: [
        'all',
        ['>=', ['get', 'capacity'], 0],
        ['>=', ['get', 'device_count'], 0],
      ],
    })
  }

  const addTargetedRolloutsLayer = () => {
    map.value?.addLayer({
      id: 'targeted-rollouts-hexagons',
      type: 'fill',
      source: 'cells',
      layout: {
        visibility: 'none',
      },
      paint: {
        'fill-color': '#28bea0',
        'fill-opacity': [
          'interpolate',
          ['exponential', 0.5],
          ['zoom'],
          9.5,
          0.0,
          10,
          0.6,
          15,
          0.6,
        ],
      },
      filter: ['==', '$type', 'Polygon'],
    })
  }

  const addCellBountyLayer = () => {
    if (!map.value?.getSource('cell-bounty')) {
      return
    }

    try {
      map.value?.addLayer({
        id: 'cell-bounty-hexagons',
        type: 'fill',
        source: 'cell-bounty',
        layout: {
          visibility: 'none',
        },
        paint: {
          'fill-color': '#9128be',
          'fill-opacity': [
            'interpolate',
            ['exponential', 0.5],
            ['zoom'],
            9.5,
            0.0,
            10,
            0.6,
            15,
            0.6,
          ],
        },
        filter: ['==', '$type', 'Polygon'],
      })

      map.value?.addLayer(
        {
          id: 'cell-bounty-hexagons-outline',
          type: 'line',
          source: 'cell-bounty',
          layout: {
            visibility: 'none',
          },
          paint: {
            'line-color': '#9128be',
            'line-width': 2,
            'line-opacity': [
              'interpolate',
              ['exponential', 0.5],
              ['zoom'],
              0,
              0.8,
              9.5,
              0.8,
              10,
              1.0,
              15,
              1.0,
            ],
          },
          filter: ['==', '$type', 'Polygon'],
        },
        'cell-bounty-hexagons',
      )
    } catch (error) {
      console.error('Error adding cell-bounty layer:', error)
    }
  }

  const addCellBountyHeatLayer = () => {
    if (!map.value?.getSource('cell-bounty-heatmap')) {
      return
    }

    const beforeId =
      map.value
        ?.getStyle()
        ?.layers?.find((l) => l.type === 'symbol' && l.id.includes('label'))
        ?.id ??
      map.value?.getStyle()?.layers?.find((l) => l.type === 'symbol')?.id

    map.value?.addLayer(
      {
        id: 'cell-bounty-heat',
        type: 'heatmap',
        source: 'cell-bounty-heatmap',
        maxzoom: 10,
        minzoom: 0,
        layout: {
          visibility: 'none',
        },
        paint: {
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'device_count'],
            0,
            0.5, // Minimum weight to ensure visibility
            1,
            1,
            10,
            10,
          ],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0,
            'rgba(145.0, 40.0, 190.0, 0.0)',
            0.2,
            'rgba(145.0, 40.0, 190.0, 0.4)',
            0.4,
            'rgba(145.0, 40.0, 190.0, 0.6)',
            0.6,
            'rgba(145.0, 40.0, 190.0, 0.8)',
            0.8,
            'rgba(145.0, 40.0, 190.0, 0.9)',
            1,
            'rgba(145.0, 40.0, 190.0, 1.0)',
          ],
          'heatmap-radius': {
            stops: [
              [0, 10],
              [5, 30],
              [9, 50],
            ],
          },
          'heatmap-opacity': [
            'interpolate',
            ['exponential', 0.5],
            ['zoom'],
            0,
            1.0,
            8,
            0.9,
            9,
            0.5,
            9.5,
            0.1,
            10,
            0.0,
          ],
        },
      },
      beforeId,
    )
  }

  const applyTargetedRolloutsFilter = () => {
    if (!map.value || !map.value.getLayer('targeted-rollouts-hexagons')) {
      return
    }

    const filter = [
      'all',
      ['==', '$type', 'Polygon'],
      ['!=', 'community_only', true],
    ]

    map.value.setFilter('targeted-rollouts-hexagons', filter)

    if (map.value.getLayer('device-count-labels')) {
      map.value.setFilter('device-count-labels', [
        'all',
        ['!=', 'community_only', true],
        ['>', 'non_community_device_count', 0],
      ])

      map.value.setLayoutProperty('device-count-labels', 'text-field', [
        'to-string',
        ['get', 'non_community_device_count'],
      ])
    }

    if (map.value.getLayer('cell-capacity-labels')) {
      map.value.setFilter('cell-capacity-labels', [
        'all',
        ['!=', 'community_only', true],
        ['>', 'non_community_device_count', 0],
      ])
    }
  }

  const removeTargetedRolloutsFilter = () => {
    if (!map.value || !map.value.getLayer('targeted-rollouts-hexagons')) {
      return
    }

    const defaultFilter = ['==', '$type', 'Polygon']
    map.value.setFilter('targeted-rollouts-hexagons', defaultFilter)

    // Reset label filters
    if (map.value.getLayer('device-count-labels')) {
      map.value.setFilter('device-count-labels', null)

      // Reset label to show total device count
      map.value.setLayoutProperty('device-count-labels', 'text-field', [
        'to-string',
        ['get', 'device_count'],
      ])
    }

    if (map.value.getLayer('cell-capacity-labels')) {
      map.value.setFilter('cell-capacity-labels', null)
    }
  }

  const handleLayerChange = (type: LayerKeys) => {
    // Legacy mapping (mostly from BountyCellsTopBanner)
    if (type === 'cell-bounty') {
      mapControlsStore.setCellBounties(true)
    } else if (type === 'targeted-rollouts') {
      mapControlsStore.setOverlayMode('targeted_rollouts')
    } else if (type === 'data-quality') {
      mapControlsStore.setOverlayMode('capacity_quality')
    } else if (type === 'cell-capacity') {
      mapControlsStore.setOverlayMode('capacity_quality')
    }
  }

  const updateDataQualityFilter = (range: [number, number]) => {
    const [min, max] = range
    const isCapQuality = mapControlsStore.getOverlayMode === 'capacity_quality'

    const basePolygon: MapboxFilter = ['all', ['==', '$type', 'Polygon']]
    const basePoint: MapboxFilter = [
      'all',
      ['==', '$type', 'Point'],
      ['>=', 'capacity', 0],
      ['>=', 'device_count', 0],
    ]

    const polygonFilter: MapboxFilter =
      !isCapQuality || (min === 0 && max === 100)
        ? basePolygon
        : [
            'all',
            ['==', '$type', 'Polygon'],
            [
              'any',
              ['!has', 'avg_data_quality'],
              [
                'all',
                ['has', 'avg_data_quality'],
                ['>=', 'avg_data_quality', min],
                ['<=', 'avg_data_quality', max],
              ],
            ],
          ]

    const pointFilter: MapboxFilter =
      !isCapQuality || (min === 0 && max === 100)
        ? basePoint
        : [
            'all',
            ['==', '$type', 'Point'],
            ['>=', 'capacity', 0],
            ['>=', 'device_count', 0],
            [
              'any',
              ['!has', 'avg_data_quality'],
              [
                'all',
                ['has', 'avg_data_quality'],
                ['>=', 'avg_data_quality', min],
                ['<=', 'avg_data_quality', max],
              ],
            ],
          ]

    map.value?.getLayer('cells') && map.value.setFilter('cells', polygonFilter)
    map.value?.getLayer('cell-capacity-labels') &&
      map.value.setFilter('cell-capacity-labels', pointFilter)
    if (isCapQuality) {
      map.value?.getLayer('heat') && map.value.setFilter('heat', pointFilter)
      map.value?.getLayer('device-count-labels') &&
        map.value.setFilter('device-count-labels', pointFilter)
    }
  }

  const mouseFunctionality = () => {
    const hexagonLayers = [
      'cells',
      'targeted-rollouts-hexagons',
      'cell-bounty-hexagons',
    ]

    hexagonLayers.forEach((layerId) => {
      // Change the cursor to a pointer when the mouse is over the hexagon layers
      map.value?.on('mouseenter', layerId, (e) => {
        // Don't change cursor for community-only cells in targeted rollouts
        if (
          layerId === 'targeted-rollouts-hexagons' &&
          e.features &&
          e.features[0]?.properties?.community_only === true
        ) {
          return
        }
        map.value!.getCanvas().style.cursor = 'pointer'
      })
      // Change it back when it leaves
      map.value?.on('mouseleave', layerId, () => {
        map.value!.getCanvas().style.cursor = ''
      })
    })
  }

  const mouseHoverFunctionality = () => {
    const hexagonLayers = [
      'cells',
      'targeted-rollouts-hexagons',
      'cell-bounty-hexagons',
    ]

    hexagonLayers.forEach((layerId) => {
      // on cell hover
      map.value?.on('mousemove', layerId, (e) => {
        const currentCell = e.features![0].properties?.index

        // Skip if in targeted rollouts layer and cell is community-only
        if (
          layerId === 'targeted-rollouts-hexagons' &&
          e.features![0].properties?.community_only === true
        ) {
          return
        }

        // check if current polygon is not the same
        if (hoverCellId.value !== currentCell) {
          if (clickCellId.value !== currentCell) {
            addOutLineLayer(currentCell)
          }
        }
        // check if hovered polygon exist
        if (hoverCellId.value !== currentCell) {
          // check if clicked polygon exist
          if (clickCellId.value !== hoverCellId.value) {
            // check if cursor moved over map before enter the new polygon
            if (hoverCellId.value) removeOutLineLayer(hoverCellId.value)
          }
        }
        // set current polygon to hoverPoly
        hoverCellId.value = currentCell
      })
      // on layer leave
      map.value?.on('mouseleave', layerId, () => {
        if (hoverCellId.value !== clickCellId.value) {
          removeOutLineLayer(hoverCellId.value)
        }
        hoverCellId.value = ''
      })
    })
  }

  // add cell outline layer
  const addOutLineLayer = (cellIndex: string) => {
    let cell = collections.value?.cellsCollection.features.find(
      (cellsFeatures) => cellsFeatures.properties.index === cellIndex,
    )

    let isBountyCell = false
    // If not found in regular cells, check cell bounties
    if (!cell) {
      cell = collections.value?.cellBountyCollection?.features.find(
        (bountyFeatures) => bountyFeatures.properties.index === cellIndex,
      )
      isBountyCell = !!cell
    }

    if (!cell) {
      return // Cell not found in any collection
    }

    // check if source already exists
    if (!map.value?.getSource(`outline${cellIndex}`)) {
      // create source
      map.value?.addSource(`outline${cellIndex}`, {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [cell.geometry.coordinates[0]],
          },
        } as MapboxGeoJSONFeature,
      })
    }
    // check if layer already exists
    if (!map.value?.getLayer(`outline${cellIndex}`)) {
      const beforeId = isBountyCell ? 'cell-bounty-hexagons-outline' : 'cells'

      map.value?.addLayer(
        {
          id: `outline${cellIndex}`,
          type: 'line',
          source: `outline${cellIndex}`,
          layout: {},
          paint: {
            'line-color': '#6ca1f5',
            'line-width': 3.5,
          },
        },
        beforeId,
      )
    }
  }

  // remove cell outline layer
  const removeOutLineLayer = (cellIndex: string) => {
    if (map.value?.getLayer(`outline${cellIndex}`)) {
      map.value.removeLayer(`outline${cellIndex}`)
    }
    if (map.value?.getSource(`outline${cellIndex}`)) {
      map.value.removeSource(`outline${cellIndex}`)
    }
  }

  const clickOnMap = () => {
    // Close panel if open
    if (mapControlsStore.isPanelOpen) {
      mapControlsStore.setPanelOpen(false)
    }

    // remove outline layer if any
    if (clickCellId.value) {
      removeOutLineLayer(clickCellId.value)
      clickCellId.value = ''
    }
    if (!smBreakpoint.value) {
      navigateTo({ path: '/stats', query: route.query })
    }
  }

  const calculateVisibleActiveStations = () => {
    if (!map.value) return

    const features = map.value.queryRenderedFeatures(undefined, {
      layers: [
        'cells',
        'heat',
        'targeted-rollouts-hexagons',
        'targeted-rollouts-heat',
        'cell-bounty-hexagons',
      ],
    })

    const uniqueCells = new Map<string, number>()
    const bountyCells = new Set<string>()

    features.forEach((feature) => {
      const index = feature.properties?.index
      const activeDeviceCount = feature.properties?.active_device_count || 0

      if (index && !uniqueCells.has(index)) {
        uniqueCells.set(index, activeDeviceCount)
      }

      if (
        feature.layer?.id === 'cell-bounty-hexagons' &&
        typeof index === 'string'
      ) {
        bountyCells.add(index)
      }
    })

    const totalActiveDevices = Array.from(uniqueCells.values()).reduce(
      (sum, count) => sum + count,
      0,
    )

    activeStationsCount.value = totalActiveDevices
    visibleBountyCellsCount.value = bountyCells.size
  }

  const clickOnCell = () => {
    const hexagonLayers = [
      'cells',
      'targeted-rollouts-hexagons',
      'cell-bounty-hexagons',
    ]

    hexagonLayers.forEach((layerId) => {
      map.value?.on('click', layerId, (e) => {
        // Prevent clicking on community-only cells in targeted rollouts layer
        if (
          layerId === 'targeted-rollouts-hexagons' &&
          e.features![0].properties?.community_only === true
        ) {
          return
        }

        // prevent event bubbling
        e.preventDefault()
        // get cell's center coords
        const coords = JSON.parse(e.features![0].properties?.center)
        // get cell's index
        const cellIndex = e.features![0].properties?.index

        // Remove outline from previously clicked cell if it's different
        if (clickCellId.value && clickCellId.value !== cellIndex) {
          removeOutLineLayer(clickCellId.value)
        }
        // else set the new polygon id
        clickCellId.value = cellIndex
        // add outline to new polygon
        addOutLineLayer(clickCellId.value)

        // zoom to cell
        map.value?.flyTo({
          center: [coords.lon, coords.lat],
          zoom: 13,
        })

        // navigato to cells page
        navigateTo(`/cells/${cellIndex}`)
        openSidebar()

        // track GA event
        trackGAevent('explorer_cell', { ITEM_ID: clickCellId.value })
      })
    })
  }

  const decodeRouteSegment = (segment: string) => {
    try {
      return decodeURIComponent(segment)
    } catch {
      return segment
    }
  }

  const resolveDeviceFromSlug = async (slug: string) => {
    const decodedSlug = decodeRouteSegment(slug)
    const candidates = _.uniq([
      formatDeviceName.normalizeDeviceName(decodedSlug),
      decodedSlug.replace(/-/g, ' '),
      decodedSlug,
    ]).filter(Boolean)

    for (const candidate of candidates) {
      try {
        const searchedDevice = await wxmApi.resolveDeviceName(candidate)
        if (searchedDevice.devices.length !== 0) {
          return searchedDevice.devices[0]
        }
      } catch {
        // Try next candidate
      }
    }

    return null
  }

  const parseUrl = async (path = route.path) => {
    if (!map.value || !collections.value || !mapReady.value) {
      pendingDeepLinkPath.value = path
      return
    }

    pendingDeepLinkPath.value = null

    const splittedUrl = path.split('/').filter(Boolean)
    if (splittedUrl[0] === 'cells' && splittedUrl[1]) {
      handleCellUrl(splittedUrl[1])
      openSidebar()
    }
    if (
      (splittedUrl[0] === 'stations' || splittedUrl[0] === 'reward_timeline') &&
      splittedUrl[1]
    ) {
      const device = await resolveDeviceFromSlug(splittedUrl[1])
      if (device) {
        handleHashCellDevice(device)
      }
      openSidebar()
    }
  }

  watch(
    () => route.path,
    async (path) => {
      await parseUrl(path)
    },
    { immediate: true },
  )

  watch(
    () => mapReady.value,
    async (ready) => {
      if (!ready) return
      if (pendingDeepLinkPath.value) {
        await parseUrl(pendingDeepLinkPath.value)
        return
      }
      await parseUrl(route.path)
    },
  )

  const handleCellUrl = (urlCellIndex: string) => {
    try {
      const cell = _.find(collections.value?.cellsCollection.features, {
        properties: {
          index: `${urlCellIndex}`,
        },
      })?.properties

      // check if any polygon is already clicked
      if (clickCellId.value) {
        // if any remove its outline layer
        removeOutLineLayer(clickCellId.value)
      }
      // else set the new polygon id
      clickCellId.value = urlCellIndex
      // add outline to new polygon
      addOutLineLayer(clickCellId.value)
      // zoom to cell
      map.value?.flyTo({
        center: [cell!.center.lon, cell!.center.lat],
        zoom: 13,
      })
    } catch (e) {
      console.error(e)
    }
  }

  const handleHashCellDevice = (device: SearchResultDevice) => {
    try {
      // check if any polygon is already clicked
      if (clickCellId.value) {
        // if any remove its outline layer
        removeOutLineLayer(clickCellId.value)
      }
      // else set the new polygon id
      clickCellId.value = device.cell_index
      // add outline to new polygon
      addOutLineLayer(clickCellId.value)
      // zoom to cell
      map.value?.flyTo({
        center: [device.cell_center.lon, device.cell_center.lat],
        zoom: 13,
      })
    } catch (e) {
      console.error(e)
    }
  }

  onMounted(async () => {
    // Add global click listener
    window.addEventListener('click', onGlobalClick)

    mapboxLoading.value = true
    window.addEventListener('resize', () => {
      onResize()
    })
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    map.value = mapCreation.createMap(
      config.mapboxAccessToken,
      mapControlsStore.getActiveStyleId,
    )
    navControls = createNavControls()
    geolocate = createGeolocate()

    map.value.on('load', async () => {
      // change logo position
      changeMapboxLogoPosition()
      //  handle nav controls
      if (!smBreakpoint.value) {
        addNavControlOnMap()
      }
      // add geolocate button
      addGeolocateControlOnMap()
      // create map collections
      collections.value = await calcedMapboxData.getCollections()

      // Populate active counts lookup
      if (collections.value?.cellsCollection) {
        collections.value.cellsCollection.features.forEach((f) => {
          if (f.properties.index && f.properties.active_device_count) {
            cellActiveCounts.value.set(
              f.properties.index,
              f.properties.active_device_count,
            )
          }
        })
      }

      if (collections.value?.cellBountyCollection) {
        const countriesMeta = extractCellBountyCountries(
          collections.value.cellBountyCollection,
        )
        mapboxStore.setBountyCountries(countriesMeta)
        if (
          !mapboxStore.getSelectedBountyCountries.length &&
          countriesMeta.length
        ) {
          const defaultSelection = countriesMeta
            .slice(0, Math.min(3, countriesMeta.length))
            .map((country) => country.id)
          mapboxStore.setSelectedBountyCountries(defaultSelection)
        }
      }

      // error handling on empty collection
      _.isEmpty(collections.value)
        ? (snackbar.value = true)
        : (snackbar.value = false)
      mountSourcesAndLayers()

      // enable data quality as default or from URL
      // toggleHexagonLayerType(hexagonLayerType.value)
      updateMapLayers()

      // add mouse functionality
      mouseFunctionality()
      // add mouse hover functionality
      mouseHoverFunctionality()
      // close card if click on map
      map.value?.on('click', (e) => {
        if (e.defaultPrevented) return
        clickOnMap()
      })
      mapReady.value = true
      await parseUrl(route.path)

      setTimeout(() => {
        calculateVisibleActiveStations()
      }, 300)

      const debouncedCalculate = _.debounce(() => {
        calculateVisibleActiveStations()
      }, 300)
      map.value?.on('dragend', debouncedCalculate)
      map.value?.on('zoomend', debouncedCalculate)

      mapboxLoading.value = false
    })
    // add cell functionality
    clickOnCell()
  })

  onBeforeUnmount(() => {
    window.removeEventListener('click', onGlobalClick)
    window.removeEventListener('resize', () => {
      onResize()
    })
    mapReady.value = false
    if (focusCountryTimeout) {
      window.clearTimeout(focusCountryTimeout)
    }
  })
</script>

<template>
  <div>
    <VProgressLinear
      v-if="mapboxLoading"
      indeterminate
      color="primary"
      absolute
    ></VProgressLinear>
    <SearchBar />
    <BountyCellsTopBanner
      v-if="!mapControlsStore.isCellBountiesEnabled"
      @switch-layer="handleLayerChange"
    />
    <CellBountyFilterOverlay
      :map-instance="map"
      :is-active="mapControlsStore.isCellBountiesEnabled"
      :focused-country="focusedBountyCountry"
      @focus-country="focusBountyCountry"
    />
    <NearbyStationsWidget
      :count="visibleNearbyCount"
      :is-cell-bounty="mapControlsStore.isCellBountiesEnabled"
    />
    <!-- <LayerSwitcher @layer-change="handleLayerChange" /> -->
    <div
      ref="controlsContainer"
      class="MapControlsContainer"
      @click.stop
      :style="controlsThemeVars"
    >
      <MapControlsPanel />
      <MapControlsTrigger class="Mapbox__controls-trigger" />
    </div>

    <div id="map" :style="navButtonsStyles"></div>

    <StatsButton />
    <RefreshSnackbar :snackbar="snackbar" />
    <TrackingConcentComponent />
  </div>
</template>

<style lang="scss">
  #map {
    width: 100%;
    height: 100% !important;
    position: absolute;
    top: 0;
    bottom: 0;
  }

  /* mapbox build-in buttons classes */
  .mapboxgl-ctrl-group button {
    border-color: var(--primary-color);
    border-width: 1px;
    border-style: solid;
    background: var(--top-color);
    border-radius: 5px;

    box-sizing: border-box;
    cursor: pointer;
    display: block;
    height: 29px;
    outline: 0;
    overflow: hidden;
    padding: 0;
    width: 29px;
  }

  .mapboxgl-ctrl-zoom-in .mapboxgl-ctrl-icon,
  .mapboxgl-ctrl-zoom-out .mapboxgl-ctrl-icon {
    filter: var(--primary-filter-color);
  }

  .mapboxgl-ctrl button.mapboxgl-ctrl-geolocate .mapboxgl-ctrl-icon {
    filter: var(--primary-filter-color);
  }

  .mapboxgl-ctrl-group:hover button:hover {
    border-color: var(--primary-color);
    border-width: 1px;
    border-style: solid;
    background: var(--top-color);
  }
  @media only screen and (max-width: 960px) {
    /* mapbox build-in buttons classes */
    .mapboxgl-ctrl-group:not(:empty) {
      box-shadow: 0 0 0 0px rgba(0, 0, 0, 0.1);
    }

    .mapboxgl-ctrl-group {
      background: transparent;
      border-radius: 50px;
      padding-bottom: 110px;
      padding-right: 10px;
    }

    .mapboxgl-ctrl-group button {
      border-width: 0px;
      background: var(--top-color);

      border-radius: 50px !important;
      height: 60px;
      width: 60px;
    }
    .mapboxgl-ctrl button.mapboxgl-ctrl-geolocate .mapboxgl-ctrl-icon {
      filter: var(--overlap-filter-color);
    }
    .mapboxgl-ctrl-zoom-in .mapboxgl-ctrl-icon,
    .mapboxgl-ctrl-zoom-out .mapboxgl-ctrl-icon {
      filter: var(--text-color);
    }

    .mapboxgl-ctrl-group:hover button:hover {
      border-width: 0px;
      background: var(--top-color);
    }
  }
  @media (min-width: 960px) {
    .LayerSwitcher__mobile {
      display: none;
    }
  }

  .MapControlsContainer {
    position: absolute !important;
    bottom: 30px;
    right: 20px;
    z-index: 2000 !important;
    pointer-events: auto !important;

    @media (min-width: 600px) {
      bottom: 40px;
      right: 60px;
    }

    display: flex;
    flex-direction: column;
    align-items: flex-end; /* Align panel and trigger to the right */
  }

  .Mapbox__controls-trigger {
    /* Relative inside flex container */
    flex-shrink: 0;
  }
</style>
