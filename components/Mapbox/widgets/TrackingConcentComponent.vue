<script setup lang="ts">
  import { setOptions, bootstrap } from 'vue-gtag'
  import { useDisplay } from 'vuetify'
  import { computed } from 'vue'
  import localStorage from '~/cache/localStorage'

  const getAnswer = ref(false)
  const display = ref(useDisplay())
  const trackingComponentTitle = ref('Improving your experience')
  const trackingComponentText =
    ref(`To improve your app experience, we are using anonymous analytics, for collecting crashes and
        other anonymous in-app events. We do not collect ANY identifying information. You can always
        update your preferences in the settings.`)
  const denyButtonText = ref('Deny')
  const acceptButtonText = ref('Sounds Good!')
  const concentComponentStyles = computed(() => {
    return display.value.smAndDown
      ? {
          position: 'absolute',
          width: '100%',
          right: '0',
          top: 'auto',
          bottom: '0',
          zIndex: 9999
        }
      : {
          position: 'absolute',
          right: '44px',
          top: 'auto',
          bottom: '20px',
          zIndex: 9999,
          width: '412px',
          borderRadius: '16px'
        }
  })

  onMounted(() => {
    getAnswer.value = localStorage.get('tracking') === null
  })

  const disablePlugin = async () => {
    setOptions({
      config: { id: '' }
    })
    await bootstrap()
    localStorage.set('tracking', false)
    getAnswer.value = false
  }
  const enablePlugin = async () => {
    setOptions({
      config: { id: useRuntimeConfig().public.gtag }
    })
    await bootstrap()
    localStorage.set('tracking', true)
    getAnswer.value = false
  }
</script>

<template>
  <div v-if="getAnswer" :style="concentComponentStyles">
    <v-sheet
      class="pa-5"
      color="top"
      elevation="4"
      :style="
        display.smAndDown
          ? {
              borderBottomleftRadius: '0px',
              borderBottomRightRadius: '0px',
              borderTopRightRadius: '16px',
              borderTopLeftRadius: '16px'
            }
          : {
              borderRadius: '16px'
            }
      "
    >
      <div class="text-h5 text-text px-1 pt-3 mb-6" style="font-weight: 700">
        {{ trackingComponentTitle }}
      </div>
      <div class="px-1 text-body-2 mb-6">
        {{ trackingComponentText }}
      </div>
      <v-row class="ma-0 pa-0">
        <v-col class="ma-0 pa-0" style="margin-right: 7px !important">
          <v-btn
            class="text-none"
            height="50"
            style="letter-spacing: normal; border-radius: 10px"
            width="100%"
            color="primary"
            outlined
            @click="disablePlugin"
            >{{ denyButtonText }}</v-btn
          >
        </v-col>
        <v-col class="ma-0 pa-0" style="margin-left: 7px !important">
          <v-btn
            height="50"
            style="border-radius: 10px"
            width="100%"
            color="primary"
            @click="enablePlugin"
            ><div class="top--text text-none" style="letter-spacing: normal">
              {{ acceptButtonText }}
            </div></v-btn
          >
        </v-col>
      </v-row>
    </v-sheet>
  </div>
</template>
