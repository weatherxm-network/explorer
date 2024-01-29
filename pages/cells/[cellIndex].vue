<script setup lang="ts">
  import Cell from '~/components/Cells/Cell.vue'
  const route = useRoute()

  useHead({
    titleTemplate: () => `WeatherXM | ${route.params.cellIndex}`
  })
</script>

<template>
  <Cell />
</template>
