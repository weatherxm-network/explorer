<script setup lang="ts">
  import dayjs from 'dayjs'
  import DailyRewards from '../../common/DailyRewards.vue'

  interface Timeline {
    timestamp: string
    base_reward: string
    total_business_boost_reward: string
    total_reward: string
    validation_color: string
    has_active_boosts: boolean
    severity_level: string | null
  }

  interface Props {
    timelineData: Timeline[]
  }

  const props = defineProps<Props>()
</script>

<template>
  <VCard class="pa-4" color="background" elevation="0">
    <div v-for="(item, index) in props.timelineData" :key="index">
      <div class="ps-7 d-flex" :class="index !== 0 ? ' align-center' : 'align-start'">
        <div class="d-flex flex-column justify-center align-center" style="width: 12px">
          <VSheet
            v-if="index !== 0"
            style="height: 26px; width: 4px"
            color="mediumGrey"
            rounded="0"
          />
          <VSheet style="height: 12px; width: 12px" color="mediumGrey" rounded="circle" />
          <VSheet style="height: 26px; width: 4px" color="mediumGrey" rounded="0" />
        </div>
        <div
          class="text-darkGrey font-weight-bold ms-4 d-flex"
          style="font-size: 0.984rem; line-height: 100%"
        >
          {{ dayjs(item.timestamp).format('MMM D, YYYY') }}
        </div>
      </div>
      <DailyRewards
        :date="item.timestamp"
        :daily-amount="item.total_reward"
        :validation-score-color="item.validation_color"
        :base-reward-amount="item.base_reward"
        :boost-amount="item.total_business_boost_reward"
        :state="item.severity_level"
        :has-active-boosts="item.has_active_boosts"
      />
    </div>
  </VCard>
</template>
