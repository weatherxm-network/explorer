import axios from 'axios'

export function getNominatimAddress(lat: number, lon: number) {
  return axios
    .get(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}`, {
      params: {
        'format': 'geojson',
        'zoom': 10,
        'accept-language': 'en-US'
      }
    })
    .then((response) => {
      return response
    })
}
