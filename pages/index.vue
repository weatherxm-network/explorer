<script setup lang="ts">
  import { useDisplay } from 'vuetify'
  const display = ref(useDisplay())

  if (!display.value.smAndDown) {
    onBeforeMount(() => {
      navigateTo('/stats')
    })
  }
</script>
