<script setup lang="ts">
  interface Props {
    boldText?: string
    lightText?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    boldText: '',
    lightText: ''
  })

  const emit = defineEmits(['reloadComponent'])

  const reloadComponent = () => {
    emit('reloadComponent')
  }
  const reloadButtonText = ref('Reload')
</script>

<template>
  <div>
    <v-row class="ma-0 pa-0 d-flex align-center justify-center" style="width: 100%; height: 100%">
      <v-col align="center">
        <div style="font-size: 70px" class="mb-4">
          <i class="fa-solid fa-wifi-slash" :class="'text-darkGrey'"></i>
        </div>
        <div class="text-h5 text--text mb-2" style="font-weight: 700; letter-spacing: normal">
          {{ props.boldText }}
        </div>
        <div class="text-subtitle-2 text--text px-11 text-center" style="letter-spacing: normal">
          {{ props.lightText }}
        </div>
        <div class="px-8">
          <v-btn
            class="text-none mt-6 rounded-lg"
            color="primary"
            style="width: 100%; letter-spacing: normal"
            @click="reloadComponent"
          >
            <div class="top--text">{{ reloadButtonText }}</div>
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </div>
</template>
