<script setup lang="ts">
  import { computed } from 'vue'
  import { formatNearbyStationsLabel } from '~/utils/mapLabels.js'

  const props = defineProps<{
    count: number
    isCellBounty?: boolean
  }>()

  const label = computed(() =>
    formatNearbyStationsLabel(props.count, props.isCellBounty),
  )
</script>
<template>
  <div v-if="label" class="NearbyStations">{{ label }}</div>
</template>
<style lang="css" scoped>
  .NearbyStations {
    position: absolute;
    top: 10%;
    right: calc((100vw - 440px) / 2);
    z-index: 2;

    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    padding: 16px;

    border-radius: 60px;
    background-color: #31364a;

    color: #fefbff;
    font-size: 14px;
    line-height: 20px;
    font-weight: 500;

    box-shadow: 0 0 0 0px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 960px) {
    .NearbyStations {
      top: calc(5% + 50px);
      right: calc((100vw / 2) - 100px);
    }
  }
</style>
