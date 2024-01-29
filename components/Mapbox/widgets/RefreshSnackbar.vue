<script setup lang="ts">
  import { useTheme } from 'vuetify'

  interface Props {
    snackbar?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    snackbar: false
  })

  const theme = useTheme()
  const refreshSnackbarText = ref('Network Error! Please refresh the page!')
  const refreshSnackbarButtonText = ref('RETRY')
  const snack = computed(() => props.snackbar)

  const snackbarColor = computed(() => {
    return theme.global.name.value === 'dark'
      ? theme.themes.value.light.colors.layer2
      : theme.themes.value.dark.colors.layer2
  })
  const snackbarButtonColor = computed(() => {
    return theme.global.name.value === 'dark'
      ? theme.themes.value.light.colors.primary
      : theme.themes.value.dark.colors.primary
  })

  const reloadPage = () => {
    window.location.reload()
  }
</script>

<template>
  <VSnackbar v-model="snack" timeout="-1" :color="snackbarColor">
    <div class="text--text">{{ refreshSnackbarText }}</div>
    <template #actions>
      <VBtn :color="snackbarButtonColor" text @click="reloadPage">
        {{ refreshSnackbarButtonText }}
      </VBtn>
    </template>
  </VSnackbar>
</template>
