<script setup lang="ts">
  import RewardTimeline from '../../components/RewardTimeline/RewardTimeline.vue'
  const route = useRoute()

  useHead({
    titleTemplate: () =>
      `WeatherXM | ${formatDeviceName.normalizeDeviceName(route.params.deviceName)}`
  })
</script>

<template>
  <RewardTimeline />
</template>
