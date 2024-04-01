<script setup lang="ts">
  import blackLogo from '@/assets/blackLogoTotalSum.svg'

  interface Props {
    totalRewards?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    totalRewards: '0'
  })

  const cardTitleText = ref('Total Station Rewards')
</script>

<template>
  <VCard class="pa-6 mb-4 mt-2 d-flex mx-2" rounded="xl" elevation="2" color="top">
    <div class="me-4">
      <img :src="blackLogo" alt="" />
    </div>
    <div>
      <div class="text-darkGrey text-body-2">{{ cardTitleText }}</div>
      <div class="text-text font-weight-bold" style="font-size: 1.375rem">
        {{ `${props.totalRewards} $WXM` }}
      </div>
    </div>
  </VCard>
</template>
