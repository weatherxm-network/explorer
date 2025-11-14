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
  import StatsButton from './widgets/StatsButton.vue'
  import RefreshSnackbar from './widgets/RefreshSnackbar.vue'
  import SearchBar from './widgets/SearchBar.vue'
  import TrackingConcentComponent from './widgets/TrackingConcentComponent.vue'
  import LayerSwitcher from './widgets/LayerSwitcher.vue'
  import NearbyStationsWidget from '@/components/Mapbox/widgets/NearbyStationsWidget.vue'
  import BountyCellsTopBanner from './widgets/BountyCellsTopBanner.vue'
  import type { Point, SearchResultDevice, Collections } from './types/mapbox'
  import { useMapboxStore } from '~/stores/mapboxStore'
  import { useMobileStore } from '~/stores/mobileStore'
  import wxmApi from '~/api/wxmApi'

  const config = useRuntimeConfig().public
  const mobileStore = useMobileStore()
  const mapboxStore = useMapboxStore()
  const { trackGAevent } = useGAevents()
  const display = useDisplay()
  const theme = useTheme()
  const route = useRoute()
  let navControls = reactive<IControl>({} as IControl)
  let geolocate = reactive<IControl>({} as IControl)
  const map = ref<MapboxMap>()
  const mapboxLoading = ref(false)
  const collections = ref<Collections>()
  const hoverCellId = ref('')
  const clickCellId = ref('')
  const snackbar = ref(false)
  const onLine = ref(navigator.onLine)
  const hexagonLayerType = ref<LayerKeys>('cell-capacity')
  const activeStationsCount = ref(0)

  const smBreakpoint = computed(() => {
    return display.smAndDown.value
  })

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
    () => searchedAddressToFly.value,
    (newAddress) => {
      if (!newAddress) return

      map.value?.flyTo({
        center: [newAddress.center.lon, newAddress.center.lat],
        zoom: 13,
      })
    },
  )

  watch(
    () => searchedDeviceToFly.value,
    (newDevice) => {
      if (!newDevice) return

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
      navigateTo(
        `/stations/${formatDeviceName.denormalizeDeviceName(newDevice.name)}`,
      )
      mobileStore.setPageState(true)
    },
  )

  watch(initMapPositonEvent, (val, newVal) => {
    if (val !== newVal) {
      mapsInitialPosition()
    }
  })

  watch(qualityRange, (newRange) => {
    if (map.value && map.value.getLayer('data-quality-hexagons')) {
      updateDataQualityFilter(newRange)
    }
  })

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
      smBreakpoint.value
        ? (mapboxLogo.style.left = '0px')
        : (mapboxLogo.style.left = '440px')
    }
  }

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
          ['==', ['get', 'capacity'], 0],
          '#C6C6D0',
          ['==', ['get', 'capacity'], 2],
          [
            'step',
            ['/', ['get', 'device_count'], ['get', 'capacity']],
            '#1497B7',
            0.5,
            '#346CDA',
            0.9,
            '#346CDA',
            1.0,
            '#3F39FF',
            1.00001,
            '#7B39FF',
          ],

          [
            'step',
            ['/', ['get', 'device_count'], ['get', 'capacity']],
            '#1497B7',
            0.66,
            '#346CDA',
            0.9,
            '#346CDA',
            1.0,
            '#3F39FF',
            1.00001,
            '#7B39FF',
          ],
        ],
        'fill-opacity': 0.5,
      },
      filter: ['==', '$type', 'Polygon'],
    })
  }

  const addHeatLayer = () => {
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
      'waterway-label',
    )
  }

  const addTargetedRolloutsHeatLayer = () => {
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
      'waterway-label',
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
          ['to-string', ['get', 'capacity']],
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
        ['>', ['get', 'device_count'], 0], // Only show cells with devices
        ['>', ['get', 'capacity'], 0], // Only show cells with capacity
      ],
    })
  }

  const addDataQualityLayer = () => {
    map.value?.addLayer({
      id: 'data-quality-hexagons',
      type: 'fill',
      source: 'cells',
      layout: {
        visibility: 'none', // Initially hidden, will be toggled by layer switcher
      },
      paint: {
        'fill-color': [
          'case',
          // Handle null/undefined avg_data_quality values
          ['==', ['typeof', ['get', 'avg_data_quality']], 'undefined'],
          '#C6C6D0', // Grey for no data
          ['==', ['get', 'avg_data_quality'], null],
          '#C6C6D0', // Grey for null data
          [
            'step',
            ['get', 'avg_data_quality'], // Use raw value (assuming already 0-100)
            '#FF1744', // Red for 0-19.99% (default)
            19.99,
            '#FFAB49', // Orange for 20-79.99%
            79.99,
            '#00E676', // Green for 80-100%
          ],
        ],
        'fill-opacity': [
          'interpolate',
          ['exponential', 0.5],
          ['zoom'],
          9.5,
          0.0,
          10,
          0.6, // Same visibility pattern as device count labels
          15,
          0.6,
        ],
      },
      filter: ['==', '$type', 'Polygon'],
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
      'waterway-label',
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

  const toggleHexagonLayerType = (type: LayerKeys) => {
    if (!map.value || !map.value.getLayer('cells')) {
      return
    }

    if (type === 'cell-capacity') {
      map.value?.setLayoutProperty('cells', 'visibility', 'visible')
    } else {
      map.value?.setLayoutProperty('cells', 'visibility', 'none')
    }
    map.value?.setLayoutProperty(
      'cell-capacity-labels',
      'visibility',
      type === 'cell-capacity' ? 'visible' : 'none',
    )
    map.value?.setLayoutProperty(
      'device-count-labels',
      'visibility',
      type === 'cell-bounty' ? 'none' : 'visible',
    )
    map.value?.setLayoutProperty(
      'data-quality-hexagons',
      'visibility',
      type === 'data-quality' ? 'visible' : 'none',
    )

    map.value?.setLayoutProperty(
      'targeted-rollouts-hexagons',
      'visibility',
      type === 'targeted-rollouts' ? 'visible' : 'none',
    )

    if (map.value.getLayer('cell-bounty-hexagons')) {
      const visibility = type === 'cell-bounty' ? 'visible' : 'none'

      map.value.setLayoutProperty(
        'cell-bounty-hexagons',
        'visibility',
        visibility,
      )

      if (map.value.getLayer('cell-bounty-hexagons-outline')) {
        map.value.setLayoutProperty(
          'cell-bounty-hexagons-outline',
          'visibility',
          visibility,
        )
      }

      if (type === 'cell-bounty' && collections.value?.cellBountyCollection) {
        const features = collections.value.cellBountyCollection.features
        if (features.length > 0) {
          // Calculate bounds from all bounty cell features
          const bounds = new mapboxgl.LngLatBounds()

          features.forEach((feature) => {
            if (
              feature.geometry.type === 'Polygon' &&
              feature.geometry.coordinates
            ) {
              // Add all polygon coordinates to bounds
              const coordinates = feature.geometry.coordinates[0] as number[][]
              coordinates.forEach((coord) => {
                bounds.extend([coord[0], coord[1]])
              })
            } else if (feature.properties.center) {
              // Fallback to center point if polygon not available
              const center = feature.properties.center
              if (
                center &&
                typeof center === 'object' &&
                'lat' in center &&
                'lon' in center
              ) {
                bounds.extend([center.lon, center.lat])
              }
            }
          })

          map.value.fitBounds(bounds, {
            padding: { top: 100, bottom: 100, left: 100, right: 100 },
            duration: 1000,
            maxZoom: 8,
          })
        }
      }

      map.value.triggerRepaint()
    }

    // Control heatmap visibility based on layer type
    if (map.value.getLayer('heat')) {
      map.value.setLayoutProperty(
        'heat',
        'visibility',
        type === 'targeted-rollouts' || type === 'cell-bounty'
          ? 'none'
          : 'visible',
      )
    }

    if (map.value.getLayer('targeted-rollouts-heat')) {
      map.value.setLayoutProperty(
        'targeted-rollouts-heat',
        'visibility',
        type === 'targeted-rollouts' ? 'visible' : 'none',
      )
    }

    if (map.value.getLayer('cell-bounty-heat')) {
      map.value.setLayoutProperty(
        'cell-bounty-heat',
        'visibility',
        type === 'cell-bounty' ? 'visible' : 'none',
      )
    }

    // Apply filter to hide community-only devices in targeted rollouts layer
    if (type === 'targeted-rollouts') {
      applyTargetedRolloutsFilter()

      // Clear any selected cell outline when switching to targeted rollouts if it's a community-only cell
      if (clickCellId.value && collections.value?.cellsCollection) {
        const cell = collections.value.cellsCollection.features.find(
          (f) => f.properties.index === clickCellId.value,
        )
        if (cell && hasCommunityDevicesOnly(cell.properties.devices)) {
          removeOutLineLayer(clickCellId.value)
          clickCellId.value = ''
          // Also navigate away from the cell page
          if (!smBreakpoint.value) {
            navigateTo('/stats')
          }
        }
      }
    } else {
      removeTargetedRolloutsFilter()
    }

    hexagonLayerType.value = type
    // Update the currentLayerType in the store
    mapboxStore.setCurrentLayerType(type)
  }

  const handleLayerChange = (type: LayerKeys) => {
    toggleHexagonLayerType(type)
  }

  const updateDataQualityFilter = (range: [number, number]) => {
    const [min, max] = range

    if (min === 0 && max === 100) {
      map.value?.setFilter('data-quality-hexagons', [
        'all',
        ['==', '$type', 'Polygon'],
      ] as any)
    } else {
      const filter = [
        'all',
        ['==', '$type', 'Polygon'],
        [
          'any',
          // Always show cells with no avg_data_quality property (grey cells)
          ['!has', 'avg_data_quality'],
          // Show cells within the selected quality range
          [
            'all',
            ['has', 'avg_data_quality'],
            ['>=', 'avg_data_quality', min],
            ['<=', 'avg_data_quality', max],
          ],
        ],
      ] as any

      map.value?.setFilter('data-quality-hexagons', filter)
    }
  }

  const mouseFunctionality = () => {
    const hexagonLayers = [
      'cells',
      'data-quality-hexagons',
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
      'data-quality-hexagons',
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
    // If not found in regular cells, check bounty cells
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
    // remove outline layer if any
    if (clickCellId.value) {
      removeOutLineLayer(clickCellId.value)
      clickCellId.value = ''
    }
    if (!smBreakpoint.value) {
      navigateTo('/stats')
    }
  }

  const calculateVisibleActiveStations = () => {
    if (!map.value) return

    const features = map.value.queryRenderedFeatures(undefined, {
      layers: [
        'cells',
        'data-quality-hexagons',
        'heat',
        'targeted-rollouts-hexagons',
        'targeted-rollouts-heat',
        'cell-bounty-hexagons',
      ],
    })

    const uniqueCells = new Map<string, number>()

    features.forEach((feature) => {
      const index = feature.properties?.index
      const activeDeviceCount = feature.properties?.active_device_count || 0

      if (index && !uniqueCells.has(index)) {
        uniqueCells.set(index, activeDeviceCount)
      }
    })

    const totalActiveDevices = Array.from(uniqueCells.values()).reduce(
      (sum, count) => sum + count,
      0,
    )

    activeStationsCount.value = totalActiveDevices
  }

  const clickOnCell = () => {
    const hexagonLayers = [
      'cells',
      'data-quality-hexagons',
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
        mobileStore.setPageState(true)

        // track GA event
        trackGAevent('explorer_cell', { ITEM_ID: clickCellId.value })
      })
    })
  }

  const parseUrl = async () => {
    const splittedUrl = route.path.split('/')
    if (splittedUrl[1] === 'cells') {
      handleCellUrl(splittedUrl[2])
      mobileStore.setPageState(true)
    }
    if (splittedUrl[1] === 'stations' || splittedUrl[1] === 'reward_timeline') {
      const normalizeRouteDeviceName = formatDeviceName.normalizeDeviceName(
        splittedUrl[2],
      )
      await wxmApi
        .resolveDeviceName(normalizeRouteDeviceName)
        .then((searchedDevice) => {
          if (searchedDevice.devices.length !== 0) {
            const device = searchedDevice.devices[0]
            handleHashCellDevice(device)
            mobileStore.setPageState(true)
          }
        })
        .catch(() => {
          mobileStore.setPageState(true)
        })
    }
  }

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
    mapboxLoading.value = true
    window.addEventListener('resize', () => {
      onResize()
    })
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    map.value = mapCreation.createMap(
      config.mapboxAccessToken,
      config.mapboxStyle,
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

      console.log(
        'Raw collections sample:',
        collections.value?.cellsCollection.features.slice(0, 3).map((f) => ({
          index: f.properties.index,
          devices: f.properties.devices,
          device_count: f.properties.device_count,
        })),
      )
      // error handling on empty collection
      _.isEmpty(collections.value)
        ? (snackbar.value = true)
        : (snackbar.value = false)
      // add sources to map
      addCellsSource()
      addHeatSource()
      addTargetedRolloutsHeatSource()
      addCellBountySource()
      addCellBountyHeatSource()
      // add layers to map
      addCellsLayer()
      addHeatLayer()
      addTargetedRolloutsHeatLayer()
      addCellCapacityLabelsLayer()
      addDataQualityLayer()
      addTargetedRolloutsLayer()
      addCellBountyLayer()
      addCellBountyHeatLayer()
      addDeviceCountLabels()

      // enable data quality as default
      // if changed here, should update LayerSwitcher
      toggleHexagonLayerType('data-quality')

      // add mouse functionality
      mouseFunctionality()
      // add mouse hover functionality
      mouseHoverFunctionality()
      // close card if click on map
      map.value?.on('click', (e) => {
        if (e.defaultPrevented) return
        clickOnMap()
      })
      parseUrl()

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
    window.removeEventListener('resize', () => {
      onResize()
    })
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
    <BountyCellsTopBanner @switch-layer="handleLayerChange" />
    <NearbyStationsWidget :count="activeStationsCount" />
    <LayerSwitcher @layer-change="handleLayerChange" />
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
</style>
