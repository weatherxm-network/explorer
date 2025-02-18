<script setup lang="ts">
  import { useTheme, useDisplay } from 'vuetify'

  import { useInfoBannerStore } from '~/stores/infoBannerStore'
  import { storeToRefs } from 'pinia'
  import type { InfoBannerConfig } from './types/common'

  const display = ref(useDisplay())
  const theme = useTheme()

  const { fetchRemoteConfig } = useFirebase()
  const infoBannerStore = useInfoBannerStore()
  const {
    isInfoBannerShown,
    message,
    title,
    showActionBtn,
    actionBtnLabel,
    backgroundUrl,
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
      backgroundUrl
        ? `background-image: url(${backgroundUrl}); background-repeat: no-repeat; background-position: center; background-size: cover;`
        : `background: ${theme.current.value.colors.surface}`,
    ]"
  >
    <h5
      v-if="title"
      :class="[
        ' font-weight-bold',
        display.smAndDown ? 'text-body-2' : 'text-body-1',
      ]"
      :style="[`color: ${theme.current.value.colors.text}`]"
    >
      {{ title }}:
      <span
        :class="[display.smAndDown ? 'text-body-2' : 'text-body-1']"
        :style="[`color: ${theme.current.value.colors.text}`]"
      >
        {{ message }}
      </span>
    </h5>
    <button
      v-if="showActionBtn"
      :class="[
        'px-4 py-2 text-caption font-weight-bold rounded-xl',
        display.smAndDown ? 'mr-auto' : 'ml-4',
      ]"
      :style="[
        'min-width: 106px',
        `color: ${theme.current.value.colors.text};`,
        `border: 1px solid ${theme.current.value.colors.text} !important`,
      ]"
      @click="onBtnClick"
    >
      {{ actionBtnLabel }}
    </button>
    <button
      v-if="isDismissable"
      :class="['position-absolute']"
      :style="[
        'right: 16px',
        'top: calc(50% - 15px)',
        'width: 34px',
        'height: 34px',
        `color: ${theme.current.value.colors.text}`,
      ]"
      @click="dismissInfoBanner"
    >
      <i class="fa-regular fa-xmark" :style="['font-size: 18px']" />
    </button>
  </div>
</template>
