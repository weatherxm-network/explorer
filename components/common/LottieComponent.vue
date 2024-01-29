<script setup lang="ts">
  import { useDisplay } from 'vuetify'
  import index from '~/assets/animations/index'

  interface Props {
    lottieName?: string
    boldText?: string
    lightText?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    lottieName: '',
    boldText: '',
    lightText: ''
  })

  const display = ref(useDisplay())
</script>

<template>
  <div>
    <div>
      <client-only>
        <Vue3Lottie
          :animation-data="index[lottieName]"
          :height="display.smAndDown ? 100 : 120"
          :width="display.smAndDown ? 100 : 120"
        />
      </client-only>
    </div>
    <div class="text-h5 text-text text-center">
      {{ props.boldText }}
    </div>
    <div class="text-subtitle-2 text-text text-center font-weight-normal">
      {{ props.lightText }}
    </div>
  </div>
</template>
