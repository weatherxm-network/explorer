<script setup lang="ts">
  import type { CellBountyCell } from '@/components/Mapbox/types/mapbox'
  import dayjs from 'dayjs'
  import { computed } from 'vue'
  import { useTheme } from 'vuetify'

  interface Props {
    bountyData: CellBountyCell
    totalStations: number
  }

  const theme = useTheme()

  const props = defineProps<Props>()
  const remainingSlots = computed(() => {
    return Math.max(0, props.bountyData.devices_accepted - props.totalStations)
  })

  const closingDate = computed(() => {
    if (!props.bountyData.activation_period_end) return null
    return dayjs(props.bountyData.activation_period_end).format('MMM. D, h:mmA')
  })

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

      <p class="text-text text-body-2 mb-4" style="line-height: 1.6">
        Be one of the first to deploy a station in this special cell and unlock
        boosted rewards!
      </p>

      <div class="d-flex flex-column ga-3 px-6">
        <div class="d-flex align-center">
          <i
            class="fa-solid fa-sack-dollar text-text me-3"
            style="font-size: 20px; width: 24px"
          ></i>
          <span class="text-text text-body-2">Up το x10 boost rewards</span>
        </div>

        <div class="d-flex align-center">
          <i
            class="fa-solid fa-calendar text-text me-3"
            style="font-size: 20px; width: 24px"
          ></i>
          <span class="text-text text-body-2"
            >Get rewarded for
            {{ Math.round(bountyData.distribution_period_in_days / 30) }} months
          </span>
        </div>

        <div class="d-flex align-center">
          <i
            class="fa-solid fa-users text-text me-3"
            style="font-size: 20px; width: 24px"
          ></i>
          <span class="text-text text-body-2"
            >Up to {{ bountyData.devices_accepted }} devices share the rewards
            ({{ remainingSlots }} remaining)</span
          >
        </div>

        <div class="d-flex align-center">
          <i
            class="fa-solid fa-user text-text me-3"
            style="font-size: 20px; width: 24px"
          ></i>
          <span class="text-text text-body-2">
            First come first served.
            <span v-if="closingDate">Closing at {{ closingDate }}</span>
            <span v-else>Limited time offer</span>
          </span>
        </div>
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
</style>
