// plugins/vuetify.js
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const light = {
  dark: false,
  colors: {
    // theme palette
    surface: '#FEFBFF',
    background: '#DFE2F6',
    top: '#FEFBFF',
    layer1: '#EAEBF9',
    layer2: '#EAEBF9',
    darkestBlue: '#00164D',
    primary: '#0A3FAD',
    lightestBlue: '#B5C4FF',
    blueTint: '#EFF0FF',
    accent: '#800162',
    crypto: '#3A3F6A',
    mediumGrey: '#C6C6D0',
    darkGrey: '#45464F',
    text: '#1B1C22',
    error: '#FF1744',
    errorTint: '#FADCE3',
    warning: '#FFAB49',
    warningTint: '#FBDEBC',
    success: '#00E676',
    successTint: '#C9F8E1',
    // rewards palette
    rewardVeryHigh: '#46D163',
    rewardHigh: '#E1CA60',
    rewardAverage: '#F3AD4E',
    rewardLow: '#EF8B4F',
    rewardVeryLow: '#F6736D',

    chartLine: '#2780FF',
    netStatProgressBar: '#BED6FF',
    anchor: '#45464F'
  }
}
// Dark mode theme
export const dark = {
  dark: true,
  colors: {
    // theme palette
    surface: '#31364A',
    background: '#111216',
    top: '#31364A',
    layer1: '#272C3A',
    layer2: '#23252F',
    darkestBlue: '#DCE1FF',
    primary: '#B8C6FF',
    lightestBlue: '#00297B',
    blueTint: '#1E2438',
    accent: '#CD9EFC',
    crypto: '#CD9EFC',
    mediumGrey: '#5D5E67',
    darkGrey: '#C6C6D0',
    text: '#FEFBFF',
    error: '#FF1744',
    errorTint: '#4B2F36',
    warning: '#FFAB49',
    warningTint: '#46381B',
    success: '#00E676',
    successTint: '#17392C',
    // rewards palette
    rewardVeryHigh: '#46D163',
    rewardHigh: '#E1CA60',
    rewardAverage: '#F3AD4E',
    rewardLow: '#EF8B4F',
    rewardVeryLow: '#F6736D',

    // net stats new colors
    navigationDrawerBackground: '#3A3F6A',
    statisticsBackgroundColor: '#111216',
    chartLine: '#2780FF',
    netStatButtonColor: '#B8C6FF',
    netStatProgressBar: '#2E4C80',
    // anchor tag overide color
    anchor: '#C6C6D0'
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    ssr: true,
    components,
    directives,
    // add theme
    theme: {
      defaultTheme: 'light',
      themes: {
        light,
        dark
      }
    }
  })
  nuxtApp.vueApp.use(vuetify)
})
