<script setup lang="ts">
  import QRCode from 'qrcode'
  import { useTheme } from 'vuetify'

  const QR_URL = 'https://weatherxm2-h9cuwbhka-weatherxm-1.vercel.app/api'
  const STORE_LINK = {
    apple: 'https://apps.apple.com/ca/app/weatherxm/id1629841929',
    google: 'https://play.google.com/store/apps/details?id=com.weatherxm.app',
  }

  const theme = useTheme()

  const { trackGAevent } = useGAevents()
  const qrCanvas = ref<HTMLCanvasElement>()

  watch(
    () => theme.current.value.dark,
    () => {
      generateQR(QR_URL)
    },
  )

  const openStore = (store: 'apple' | 'google') => {
    trackGAevent('deviceForecastClickOnAppStoreLink', { ITEM_ID: store })
    window.open(STORE_LINK[store], '_blank')
  }

  const generateQR = async (text: string) => {
    try {
      return QRCode.toCanvas(qrCanvas.value, text, {
        color: {
          dark: theme.current.value.colors.primary,
          light: theme.current.value.colors.blueTint,
        },
        scale: 1,
        width: 100,
      })
    } catch (e) {
      console.error(e)
    }
  }

  onMounted(() => {
    if (qrCanvas.value) {
      generateQR(QR_URL)
    }
  })
</script>

<template>
  <div :class="['ma-4']">
    <div :style="{ height: '200px', width: '100%' }"></div>
    <div :class="['pa-4 bg-blueTint']" :style="{ borderRadius: '20px' }">
      <h5 :class="['mb-4 text-body-1 font-weight-bold']">
        Get the WeatherXM app now
      </h5>
      <div
        :class="[
          'd-flex justify-space-between align-center pa-5 pl-3 ga-1 border-thin border-opacity-100 border-primary ',
        ]"
        :style="{ borderRadius: '15px' }"
      >
        <div :style="{ width: '100px', height: '100px', aspectRatio: '1/1' }">
          <canvas
            ref="qrCanvas"
            :style="{
              aspectRatio: '1/1;',
            }"
          ></canvas>
        </div>
        <div>
          <h6 :class="['text-body-2 mb-4']">
            Scan this QR code with your phone camera
          </h6>
          <p :class="['text-caption']">
            or download from browser in
            <span
              :class="['text-decoration-underline cursor-pointer']"
              @click="() => openStore('google')"
            >
              {{ 'Google Play' }}
            </span>
            and
            <span
              :class="['text-decoration-underline cursor-pointer']"
              @click="() => openStore('apple')"
            >
              {{ 'App Store' }}
            </span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
