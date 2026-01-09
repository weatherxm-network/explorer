<script setup lang="ts">
  import { computed } from 'vue'
  import { useTheme } from 'vuetify'

  const theme = useTheme()

  const isDarkTheme = computed(() => {
    return theme.global.name.value === 'dark'
  })
</script>

<template>
  <VCard
    :class="isDarkTheme ? 'DarkBountyCellCard' : 'LightBountyCellCard'"
    color="purple"
    elevation="0"
  >
    <VCardText class="pa-4 px-6">
      <h3 class="text-text font-weight-bold text-h6 mb-3">
        This is a Cell Bounty!
      </h3>

      <div class="d-flex flex-column ga-3 px-6">
        <div class="d-flex align-center">
          <i
            class="fa-solid fa-sack-dollar text-text me-3"
            style="font-size: 20px; width: 24px"
          ></i>
          <span class="text-text text-body-2">x10 rewards for 12 months</span>
        </div>

        <div class="d-flex align-center">
          <i
            class="fa-solid fa-calendar text-text me-3"
            style="font-size: 20px; width: 24px"
          ></i>
          <span class="text-text text-body-2">
            Bounty expires on 2026/02/1 14:00 GMT
          </span>
        </div>
      </div>

      <div class="mt-6 d-flex justify-center">
        <VBtn
          href="https://docs.weatherxm.com/rewards/reward-boosts#cell-bounties"
          target="_blank"
          rel="noopener"
          variant="text"
          class="BountyInfoButton text-text"
        >
          More info
        </VBtn>
      </div>

      <div class="mt-6 text-center">
        <VBtn
          href="https://calendly.com/lsilva-weatherxm/30min"
          target="_blank"
          rel="noopener"
          color="white"
          variant="elevated"
          class="text-purple-darken-3 font-weight-bold"
        >
          Contact us
        </VBtn>
      </div>
    </VCardText>
  </VCard>
</template>

<style scoped>
  .DarkBountyCellCard {
    background: linear-gradient(35deg, #3b2d78 0%, #d41da7 100%) !important;
    border-radius: 12px;
    margin-bottom: 16px;
  }

  .LightBountyCellCard {
    background: linear-gradient(35deg, #dcd6f7 0%, #fad6ef 100%) !important;
  }

  .BountyInfoButton {
    text-transform: none;
    opacity: 0.8;
  }
</style>
