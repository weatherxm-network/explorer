<script setup lang="ts">
  import QRCode from 'qrcode'
  import { useTheme } from 'vuetify'

  import appPromoImg from '~/assets/app-promo.png'

  interface Props {
    onDownload?: () => void
  }

  const props = defineProps<Props>()
  const theme = useTheme()
  const qrCanvas = ref<HTMLCanvasElement>()
  const primarySellingPoint = ref('Daily & hourly hyperlocal forecasts')
  const secondarySellingPoints = ref([
    'Real-time weather data',
    'Historical data',
    'many more...',
  ])

  const QR_URL = 'https://weatherxm2-h9cuwbhka-weatherxm-1.vercel.app/api'

  watch(
    () => theme.current.value.dark,
    () => {
      generateQR(QR_URL)
    },
  )

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

  const handleDownload = () => {
    props.onDownload?.()
  }

  onMounted(() => {
    if (qrCanvas.value) {
      generateQR(QR_URL)
    }
  })
</script>

<template>
  <div :class="['bg-blueTint', 'pa-4 rounded-xl']">
    <h5 :class="['text-h6']">Get the WeatherXM app to access:</h5>
    <div
      :class="['d-flex justify-start align-center ga-2 text-subtitle-2 mt-2 mb-3']"
    >
      <i class="fa-solid fa-check text-success" />
      <span>{{ primarySellingPoint }}</span>
    </div>
    <div :class="['d-flex justify-space-between align-center']">
      <div :class="['w-50']">
        <div
          v-for="item in secondarySellingPoints"
          :key="item"
          :class="['d-flex justify-start align-center ga-2', 'text-subtitle-2']"
        >
          <i class="fa-solid fa-check text-success" />
          {{ item }}
        </div>
        <div class="mt-4">
          <div
            :class="[
              'd-flex align-center justify-center border-thin border-opacity-100 border-primary',
            ]"
            :style="{
              borderRadius: '10px',
              width: '100px',
              height: '100px',
              aspectRatio: '1/1',
            }"
          >
            <canvas
              ref="qrCanvas"
              :style="{
                aspectRatio: '1/1;',
              }"
            ></canvas>
          </div>
          <p class="text-caption mt-2 mb-0">Scan with your phone camera</p>
        </div>
        <button
          :class="[
            'px-5 py-2 rounded-lg mt-4',
            'bg-primary font-weight-bold text-subtitle-2',
            'cursor-pointer',
          ]"
          @click="handleDownload"
        >
          Download App
        </button>
      </div>

      <div
        :class="['w-50 h-100 position-relative']"
        :style="{ minHeight: '140px' }"
      >
        <img
          :src="appPromoImg"
          :class="['position-absolute top-0 left-0 right']"
          :style="{ transform: 'translateX(-10%)' }"
        />
      </div>
    </div>
  </div>
</template>
