<script setup lang="ts">
  import promoWXMProDesktopImg from '~/assets/promo-pro-desktop.png'
  import wxmProLogoWithText from '~/assets/wxm-pro-logo-text.svg'

  const getWXMPro = () => {
    const WXMProLink = 'https://pro.weatherxm.com/sign-in'
    window.open(WXMProLink, '_blank')
  }
</script>

<template>
  <div :class="['ma-4']">
    <div
      :class="['bg-blueTint w-100 mb-6 overflow-hidden']"
      :style="{ borderRadius: '20px' }"
    >
      <div
        :class="['w-100 position-relative bg-gradient-purple overflow-hidden']"
        :style="{
          height: '178px',
        }"
      >
        <div
          :class="[
            'position-absolute d-flex justify-center align-center',
            'pa-3 bg-smoke-opaque',
          ]"
          :style="{
            width: '155px',
            left: '12px',
            bottom: '12px',
            borderRadius: '10px',
            zIndex: '2',
          }"
        >
          <img :src="wxmProLogoWithText" />
        </div>

        <div
          :class="['position-absolute']"
          :style="{
            height: '200px',
            width: '300px',
            top: '-5px',
            right: '-10px',
            zIndex: '1',
          }"
        >
          <img :src="promoWXMProDesktopImg" :class="['w-100']" />
        </div>
      </div>
      <div :class="['pa-4']">
        <h5 :class="['text-body-1 font-weight-bold mb-2']">
          Get WeatherXM PRO to access historical, real-time & forecast data
        </h5>
        <p class="mb-3 text-body-2">
          Ideal for insurance, agriculture, energy and event planning our API
          integrates seamlessly, delivering insights for smart, data-driven
          decisions.
        </p>
        <button
          :class="['bg-primary w-100 py-3 px-5 text-body-2 font-weight-bold']"
          :style="{ borderRadius: '10px' }"
          @click="getWXMPro"
        >
          Get Pro
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .bg-gradient-purple {
    background: linear-gradient(
      90deg,
      #2a2572 0%,
      #783baf 48.5%,
      #4d1fa8 100%
    ) !important;
  }

  .bg-smoke-opaque {
    background: rgba(0, 0, 0, 0.6);
  }
</style>
