<script setup lang="ts">
  import mapboxgl from 'mapbox-gl'
  import { useDisplay, useTheme } from 'vuetify/lib/framework.mjs'
  import _ from 'lodash'
  import calcedMapboxData from './utils/calcedMapboxData'
  import mapCreation from './utils/mapCreation'
  import StatsButton from './widgets/StatsButton.vue'
  import RefreshSnackbar from './widgets/RefreshSnackbar.vue'
  import SearchBar from './widgets/SearchBar.vue'
  import TrackingConcentComponent from './widgets/TrackingConcentComponent.vue'
  import type { SearchResultLocation, Point, SearchResultDevice, Collections } from './types/mapbox'
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
  let navControls = reactive({})
  let geolocate = reactive({})
  const map = ref({})
  const mapboxLoading = ref(false)
  const collections = ref<Collections>()
  const hoverCellId = ref('')
  const clickCellId = ref('')
  const snackbar = ref(false)
  const onLine = ref(navigator.onLine)

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
        : 'invert(0%) sepia(0%) saturate(3351%) hue-rotate(142deg) brightness(87%) contrast(100%)'
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

  watch(onLine, (value) => {
    value ? (snackbar.value = false) : (snackbar.value = true)
  })

  watch(searchedAddressToFly, (newAddress: SearchResultLocation) => {
    map.value.flyTo({
      center: [newAddress.center.lon, newAddress.center.lat],
      zoom: 13
    })
  })

  watch(searchedDeviceToFly, (newDevice: SearchResultDevice) => {
    const coords: Point = {
      lon: newDevice.cell_center.lon,
      lat: newDevice.cell_center.lat
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
    map.value.flyTo({
      center: [coords.lon, coords.lat],
      zoom: 13
    })
    // navigato to cells page
    navigateTo(`/stations/${formatDeviceName.denormalizeDeviceName(newDevice.name)}`)
    mobileStore.setPageState(true)
  })

  watch(initMapPositonEvent, (val, newVal) => {
    if (val !== newVal) {
      mapsInitialPosition()
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
    }
  }

  const updateOnlineStatus = (e: any) => {
    const { type } = e
    onLine.value = type === 'online'
  }

  const mapsInitialPosition = () => {
    // zoom out to initial position
    map.value.flyTo({
      center: [24.162572, 38.667284],
      zoom: 3
    })
  }

  const createNavControls = () => {
    return new mapboxgl.NavigationControl({
      showCompass: false
    })
  }

  const createGeolocate = () => {
    return new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      showUserLocation: true,
      trackUserLocation: true
    })
  }

  const addNavControlOnMap = () => {
    map.value.addControl(navControls, 'bottom-right')
  }

  const removeNavControlFromMap = () => {
    map.value.removeControl(navControls)
  }

  const addGeolocateControlOnMap = () => {
    map.value.addControl(geolocate, 'bottom-right')
  }

  const removeGeolocateControlFromMap = () => {
    map.value.removeControl(geolocate)
  }

  const changeMapboxLogoPosition = () => {
    const mapboxLogo = document.getElementsByClassName('mapboxgl-ctrl-bottom-left')[0]
    smBreakpoint.value ? (mapboxLogo.style.left = '0px') : (mapboxLogo.style.left = '440px')
  }

  const addCellsSource = () => {
    map.value.addSource('cells', {
      type: 'geojson',
      data: collections.value.cellsCollection
    })
  }

  const addHeatSource = () => {
    map.value.addSource('heatmap', {
      type: 'geojson',
      data: collections.value.heatmapCollection
    })
  }

  const addCellsLayer = () => {
    map.value.addLayer({
      id: 'cells',
      type: 'fill',
      source: 'cells',
      layout: {
        visibility: 'visible'
      },
      paint: {
        'fill-color': '#3a86ff',
        'fill-opacity': 0.5
      },
      filter: ['==', '$type', 'Polygon']
    })
  }

  const addHeatLayer = () => {
    map.value.addLayer(
      {
        id: 'heat',
        type: 'heatmap',
        source: 'heatmap',
        maxzoom: 10,
        minzoom: 0,
        paint: {
          // Increase the heatmap weight based on frequency and property magnitude
          'heatmap-weight': ['interpolate', ['linear'], ['get', 'device_count'], 0, 0, 1000, 1000],
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
            'rgb(0.0, 255.0, 206.0)'
          ],
          // Adjust the heatmap radius by zoom level
          'heatmap-radius': {
            stops: [
              [0, 2],
              [9, 20]
            ]
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
            0.0
          ]
        }
      },
      'waterway-label'
    )
  }

  const mouseFunctionality = () => {
    // Change the cursor to a pointer when the mouse is over the places layer.
    map.value.on('mouseenter', 'cells', () => {
      map.value.getCanvas().style.cursor = 'pointer'
    })
    // Change it back to a pointer when it leaves.
    map.value.on('mouseleave', 'cells', () => {
      map.value.getCanvas().style.cursor = ''
    })
  }

  const mouseHoverFunctionality = () => {
    // on cell hover
    map.value.on('mousemove', 'cells', (e) => {
      const currentCell = e.features[0].properties.index
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
    // on hex7 leave
    map.value.on('mouseleave', 'cells', () => {
      if (hoverCellId.value !== clickCellId.value) {
        removeOutLineLayer(hoverCellId.value)
      }
      hoverCellId.value = ''
    })
  }

  // add cell outline layer
  const addOutLineLayer = (cellIndex: string) => {
    // search in collection based on cell index
    const cell = _.find(collections.value.cellsCollection.features, {
      properties: { index: cellIndex }
    })
    // check if source already exists
    if (!map.value.getSource(`outline${cellIndex}`)) {
      // create source
      map.value.addSource(`outline${cellIndex}`, {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [cell.geometry.coordinates[0]]
          }
        }
      })
    }
    // check if layer already exists
    if (!map.value.getLayer(`outline${cellIndex}`)) {
      // create layer
      map.value.addLayer({
        id: `outline${cellIndex}`,
        type: 'line',
        source: `outline${cellIndex}`,
        layout: {},
        paint: {
          'line-color': '#6ca1f5',
          'line-width': 3.5
        }
      })
    }
  }

  // remove cell outline layer
  const removeOutLineLayer = (cellIndex) => {
    if (map.value.getLayer(`outline${cellIndex}`)) {
      map.value.removeLayer(`outline${cellIndex}`)
    }
    if (map.value.getSource(`outline${cellIndex}`)) {
      map.value.removeSource(`outline${cellIndex}`)
    }
  }

  const clickOnMap = () => {
    // remove outline layer if any
    if (clickCellId) {
      removeOutLineLayer(clickCellId.value)
      clickCellId.value = ''
    }
    if (!smBreakpoint.value) {
      navigateTo('/stats')
    }
  }

  const clickOnCell = () => {
    map.value.on('click', 'cells', (e) => {
      // prevent event bubbling
      e.preventDefault()
      // get cell's center coords
      const coords = JSON.parse(e.features[0].properties.center)
      // get cell's index
      const cellIndex = e.features[0].properties.index

      // check if any polygon is already clicked
      if (clickCellId.value) {
        // if any remove its outline layer
        removeOutLineLayer(clickCellId.value)
      }
      // else set the new polygon id
      clickCellId.value = cellIndex
      // add outline to new polygon
      addOutLineLayer(clickCellId.value)

      // zoom to cell
      map.value.flyTo({
        center: [coords.lon, coords.lat],
        zoom: 13
      })

      // navigato to cells page
      navigateTo(`/cells/${cellIndex}`)
      mobileStore.setPageState(true)

      // track GA event
      trackGAevent('explorer_cell', { ITEM_ID: clickCellId.value })
    })
  }

  const parseUrl = async () => {
    const splittedUrl = route.path.split('/')
    if (splittedUrl[1] === 'cells') {
      handleCellUrl(splittedUrl[2])
      mobileStore.setPageState(true)
    }
    if (splittedUrl[1] === 'stations' || splittedUrl[1] === 'reward_timeline') {
      const normalizeRouteDeviceName = formatDeviceName.normalizeDeviceName(splittedUrl[2])
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
      const cell = _.find(collections.value.cellsCollection.features, {
        properties: {
          index: `${urlCellIndex}`
        }
      }).properties
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
      map.value.flyTo({
        center: [cell.center.lon, cell.center.lat],
        zoom: 13
      })
    } catch (e) {}
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
      map.value.flyTo({
        center: [device.cell_center.lon, device.cell_center.lat],
        zoom: 13
      })
    } catch (e) {}
  }

  onMounted(async () => {
    mapboxLoading.value = true
    window.addEventListener('resize', () => {
      onResize()
    })
    window.addEventListener('online', updateOnlineStatus.value)
    window.addEventListener('offline', updateOnlineStatus.value)

    map.value = await mapCreation.createMap(config.mapboxAccessToken, config.mapboxStyle)
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
      // error handling on empty collection
      _.isEmpty(collections.value) ? (snackbar.value = true) : (snackbar.value = false)
      // add sources to map
      await addCellsSource()
      await addHeatSource()
      // add layers to map
      await addCellsLayer()
      await addHeatLayer()
      // add mouse functionality
      await mouseFunctionality()
      // add mouse hover functionality
      await mouseHoverFunctionality()
      // close card if click on map
      await map.value.on('click', (e) => {
        if (e.defaultPrevented) return
        clickOnMap()
      })
      parseUrl()

      mapboxLoading.value = false
    })
    // add cell functionality
    await clickOnCell()
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', () => {
      onResize()
    })
  })
</script>

<template>
  <div>
    <VProgressLinear v-if="mapboxLoading" indeterminate color="primary" absolute></VProgressLinear>
    <SearchBar />
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
