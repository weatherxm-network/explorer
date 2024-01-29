const normalizeDeviceName = (deviceName: string) => {
  return deviceName
    .split('-')
    .map((word: string) => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(' ')
}

const denormalizeDeviceName = (deviceName: string) => {
  return deviceName
    .split(' ')
    .map((word: string) => {
      return word.charAt(0).toLowerCase() + word.slice(1).toLowerCase()
    })
    .join('-')
}

export default { normalizeDeviceName, denormalizeDeviceName }
