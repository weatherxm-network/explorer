import type { Theme } from '../../types/mapbox'
import localStorage from '~/cache/localStorage'
const themeKey: string = `theme`

// get theme from localstorage
const getThemeFromLocalStorage = () => {
  return localStorage.get(themeKey)
}

// store theme
const setTheme = (theme: Theme) => {
  localStorage.set(themeKey, theme)
}

// get theme from OS as default
const getOSTheme = () => {
  let theme: Theme = {
    currentTheme: 'light',
    name: 'System',
    options: [`Dark`, `Light`, `System`]
  }
  if (window.matchMedia && !!window.matchMedia('(prefers-color-scheme: dark)').matches) {
    theme = {
      currentTheme: `dark`,
      name: 'System',
      options: [`Dark`, `Light`, `System`]
    }
  } else {
    theme = {
      currentTheme: `light`,
      name: 'System',
      options: [`Dark`, `Light`, `System`]
    }
  }
  setTheme(theme)
  return theme
}

// try to get theme localy , if fail try 'remotely'
const getTheme = () => {
  return getThemeFromLocalStorage() ?? getOSTheme()
}

export default {
  setTheme,
  getTheme,
  getOSTheme
}
