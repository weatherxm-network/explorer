import { defineNuxtConfig } from 'nuxt/config'

import pkg from './package.json'

export default defineNuxtConfig({
  // devtools: { enabled: true },
  spaLoadingTemplate: false,
  ssr: false,
  build: {
    transpile: ['vuetify'],
  },
  css: [
    'vuetify/lib/styles/main.sass',
    '@mdi/font/css/materialdesignicons.min.css',
  ],
  devServer: {
    port: 3001,
  },
  modules: [
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    'nuxt-snackbar',
    '@vueuse/nuxt',
    '@nuxt/eslint',
  ],
  snackbar: {
    bottom: true,
    duration: 2000,
    dense: true,
    zIndex: 99999,
  },
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL,
      mapboxAccessToken: process.env.MAPBOX_ACCESS_TOKEN,
      mapboxStyle: process.env.MAPBOX_STYLE,
      initGoogleServices: process.env.INIT_GOOGLE_SERVICES === 'true',
      version: process.env.GIT_COMMIT_HASH
        ? `${pkg.version}-${process.env.GIT_COMMIT_HASH}`
        : pkg.version,
      gtag: process.env.GOOGLE_ANALYTICS_ID,
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.FIREBASE_APP_ID,
      firebaseMeasurementId: process.env.FIREBASE_MEASUREMENT_ID,
    },
  },
  app: {
    head: {
      title: 'WeatherXM Explorer',

      meta: [
        { name: 'description', content: `People's Weather Network.` },
        { property: 'og:title', content: 'WeatherXM Explorer' },
        { property: 'og:description', content: `People's Weather Network.` },
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: 'en_US' },
        {
          property: 'og:image',
          content: 'https://explorer-static.weatherxm.com/wxm-logo-512.png',
        },
        { name: 'twitter:card', content: 'summary_large_image' },
        {
          name: 'twitter:image',
          content: 'https://explorer-static.weatherxm.com/wxm-logo-512.png',
        },
      ],
      link: [
        {
          rel: 'stylesheet',
          href: 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css',
        },
        {
          rel: 'stylesheet',
          href: 'https://cdnjs.cloudflare.com/ajax/libs/MaterialDesign-Webfont/7.0.96/css/materialdesignicons.min.css',
        },
        {
          href: `https://kit.fontawesome.com/${process.env.FONT_AWESOME_PRO_KIT_KEY}.css`,
          rel: 'stylesheet',
          crossorigin: 'anonymous',
        },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
      script: [
        {
          src: `https://kit.fontawesome.com/${process.env.FONT_AWESOME_PRO_KIT_KEY}.js`,
          crossorigin: 'anonymous',
        },
      ],
    },
  },
})
