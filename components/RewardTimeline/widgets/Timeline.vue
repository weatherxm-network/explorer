<script setup lang="ts">
  import DailyRewards from '../../common/DailyRewards.vue'

  interface AnnotationSummary {
    severity_level: string
    group: string
    title: string
    message: string
    doc_url: string
  }

  interface Timeline {
    timestamp: string
    base_reward: number
    total_business_boost_reward: number
    total_reward: number
    base_reward_score: number
    annotation_summary: AnnotationSummary[]
  }

  interface Props {
    timelineData: Timeline
  }

  const props = defineProps<Props>()
</script>

<template>
  <VCard class="pa-4" color="background">
    {{ props.timeline }}
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
          Dec 6, 2023
        </div>
      </div>
      <DailyRewards
        :date="item.timestatmp"
        :dailyAmount="4"
        :validationScoreColor="'#F6736D'"
        :baseRewardAmount="3"
        :boostAmount="5"
        :state="'INFO'"
      />
    </div>
  </VCard>
</template>
