import VueGtag from 'vue-gtag'
export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig().public
  nuxtApp.vueApp.use(VueGtag, {
    disableScriptLoad: true,
    config: {
      id: config.gtag && config.initGoogleServices ? config.gtag : '',
      params: {
        anonymize_ip: true
      }
    }
  })
})
