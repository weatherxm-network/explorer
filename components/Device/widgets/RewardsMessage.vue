<script setup lang="ts">
  const text = ref(
    'IMPORTANT: During beta phase, WXM token is deployed on testnet. Rewards will be recalculated and rewarded again after WXM mainnet token launch. Actual rewards may differ from the ones you see in the chart above.'
  )
  const rewardsLinkText = ref('Read about beta rewards')
  const navigateToDocs = () => {
    navigateTo('https://docs.weatherxm.com/reward-mechanism', {
      open: {
        target: '_blank'
      }
    })
  }
</script>

<template>
  <VSheet rounded="xl" color="primary" class="ma-4" border>
    <VSheet color="top" rounded="xl" elevation="0">
      <VRow class="ma-0 pa-0">
        <VCol cols="2" class="d-flex align-center justify-center ma-0 pa-0">
          <i class="fa-solid fa-circle-info text-darkestBlue" style="font-size: 1.2rem"></i>
        </VCol>
        <VCol cols="10" class="pl-0"
          ><div>{{ text }}</div>
          <div class="text-primary" style="cursor: pointer" @click="navigateToDocs">
            <span style="font-weight: 700">{{ rewardsLinkText }}</span>
            <i class="fa-solid fa-arrow-up-right-from-square pl-1"></i></div
        ></VCol>
      </VRow>
    </VSheet>
  </VSheet>
</template>
