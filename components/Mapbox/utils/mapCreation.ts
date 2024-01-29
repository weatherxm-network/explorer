import mapboxgl from 'mapbox-gl'

// create map obj based on env vars and default settings
const createMap = (mapboxAccessToken: string, mapboxStyle: string) => {
  // default settings
  const zoom = 3
  const center = [24.162572, 38.667284]

  mapboxgl.accessToken = mapboxAccessToken

  const map = new mapboxgl.Map({
    container: 'map',
    style: mapboxStyle,
    center,
    zoom,
    attributionControl: false,
    maxZoom: 15,
    minZoom: 0
  })

  // disable map rotation using right click + drag
  map.dragRotate.disable()

  // Disable map rotation using touch rotation gesture
  map.touchZoomRotate.disableRotation()
  map.touchPitch.disable()
  // return map
  return map
}

export default { createMap }
