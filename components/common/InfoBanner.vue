<script setup lang="ts">
  import { useDisplay } from 'vuetify'

  import { useInfoBannerStore } from '~/stores/infoBannerStore'
  import { storeToRefs } from 'pinia'
  import type { InfoBannerConfig } from './types/common'

  const display = ref(useDisplay())

  const { fetchRemoteConfig } = useFirebase()
  const infoBannerStore = useInfoBannerStore()
  const {
    isInfoBannerShown,
    message,
    title,
    showActionBtn,
    actionBtnLabel,
    // backgroundUrl,
    actionBtnUrl,
    isDismissable,
  } = storeToRefs(infoBannerStore)

  const dismissInfoBanner = () => {
    infoBannerStore.setDismissed()
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'))
    })
  }

  const onBtnClick = () => {
    if (actionBtnUrl?.value) {
      window.open(actionBtnUrl.value, '_blank')
    }
  }

  onBeforeMount(async () => {
    const config = (await fetchRemoteConfig()) as unknown as InfoBannerConfig
    infoBannerStore.updateState(config)
  })
</script>
<template>
  <div
    v-if="isInfoBannerShown"
    :class="[
      'w-100 h-10 pl-4  py-2 position-relative',
      'd-flex justify-center align-center ga-1 flex-wrap',
      isDismissable ? 'pr-16' : 'pr-4',
    ]"
    :style="[
      'z-index: 60',
      'background: linear-gradient(90deg, #1E1B4E 0%, #4E2672 48.5%, #381F69 100%);',
    ]"
  >
    <h5
      v-if="title"
      :class="[
        ' font-weight-bold',
        display.smAndDown ? 'text-body-2' : 'text-body-1',
      ]"
    >
      {{ title }}:
      <span :class="[display.smAndDown ? 'text-body-2' : 'text-body-1']">
        {{ message }}
      </span>
    </h5>
    <button
      v-if="showActionBtn"
      :class="[
        'px-4 py-2 text-caption font-weight-bold rounded-xl border-md border-solid',
        display.smAndDown ? 'mr-auto' : 'ml-4',
      ]"
      :style="['min-width: 106px']"
      @click="onBtnClick"
    >
      {{ actionBtnLabel }}
    </button>
    <button
      v-if="isDismissable"
      :class="['position-absolute']"
      :style="['right: 16px', 'top: 16px', 'width: 34px', 'height: 34px']"
      @click="dismissInfoBanner"
    >
      <i class="fa-regular fa-xmark" :style="['height: 19px', 'width: 20px']" />
    </button>
  </div>
</template>
