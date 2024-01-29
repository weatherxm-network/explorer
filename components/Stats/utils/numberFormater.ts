const nFormatter = (num: number) => {
  const lookup = [
    { value: 1, symbol: '' },
    { value: 1e3, symbol: 'K' },
    { value: 1e6, symbol: 'M' },
    { value: 1e9, symbol: 'G' },
    { value: 1e12, symbol: 'T' },
    { value: 1e15, symbol: 'P' },
    { value: 1e18, symbol: 'E' }
  ]
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/
  const item = lookup
    .slice()
    .reverse()
    .find(function (item) {
      return num >= item.value
    })

  return item
    ? localizeNumberFormat(parseFloat((num / item.value).toFixed(1).replace(rx, '$1'))) +
        item.symbol
    : '0'
}

const localizeNumberFormatter = new Intl.NumberFormat({
  minimumFractionDigits: 1,
  maximumFractionDigits: 1
})

const localizeNumberFormat = (number: number) => {
  return localizeNumberFormatter.format(number)
}

export default {
  nFormatter,
  localizeNumberFormat
}
