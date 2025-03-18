import VueGtag from 'vue-gtag'
export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig().public
  nuxtApp.vueApp.use(VueGtag, {
    disableScriptLoad: true,
    config: {
      id:
        config.googleAnalyticsId && config.initGoogleServices
          ? config.googleAnalyticsId
          : '',
      params: {
        anonymize_ip: true,
      },
    },
  })
})
