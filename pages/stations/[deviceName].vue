<script setup lang="ts">
  import Device from '~/components/Device/Device.vue'
  const route = useRoute()

  useHead({
    titleTemplate: () =>
      `WeatherXM | ${formatDeviceName.normalizeDeviceName(route.params.deviceName)}`
  })
</script>

<template>
  <Device />
</template>
