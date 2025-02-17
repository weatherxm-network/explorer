import { initializeApp, type FirebaseApp } from 'firebase/app'
export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig().public

  if (config.initGoogleServices) {
    const app = initializeApp({
      apiKey: config.firebaseApiKey,
      authDomain: config.firebaseAuthDomain,
      projectId: config.firebaseProjectId,
      storageBucket: config.firebaseStorageBucket,
      messagingSenderId: config.firebaseMessagingSenderId,
      appId: config.firebaseAppId,
      measurementId: config.firebaseMeasurementId,
    })

    nuxtApp.provide('firebase', app as FirebaseApp)
    nuxtApp.vueApp.provide('firebase', app as FirebaseApp)
  } else {
    nuxtApp.provide('firebase', null)
    nuxtApp.vueApp.provide('firebase', null)
  }
})
