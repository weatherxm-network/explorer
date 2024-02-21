<script setup lang="ts">
  import HeaderCard from './widgets/HeaderCard.vue'
  import Timeline from './widgets/Timeline.vue'

  const response = reactive([
    {
      timestamp: '2024-02-21T10:05:01.940Z',
      base_reward: 2.34,
      total_business_boost_reward: 1.23,
      total_reward: 3.57,
      base_reward_score: 50,
      annotation_summary: [
        {
          severity_level: 'INFO',
          group: 'NO_WALLET',
          title: 'Minor Sensor Issues',
          message:
            'Station is doing great! Minor issues detected during our data quality checks, that may be related to occasional sensor inaccuracies. That can happen once in a while.',
          doc_url: 'https://docs.weatherxm.com/project/rewards-troubleshooting#sensor-problems'
        }
      ]
    },
    {
      timestamp: '2024-02-21T10:05:01.940Z',
      base_reward: 2.34,
      total_business_boost_reward: 1.23,
      total_reward: 3.57,
      base_reward_score: 50,
      annotation_summary: [
        {
          severity_level: 'WARNING',
          group: 'NO_WALLET',
          title: 'Minor Sensor Issues',
          message:
            'Station is doing great! Minor issues detected during our data quality checks, that may be related to occasional sensor inaccuracies. That can happen once in a while.',
          doc_url: 'https://docs.weatherxm.com/project/rewards-troubleshooting#sensor-problems'
        }
      ]
    },
    {
      timestamp: '2024-02-21T10:05:01.940Z',
      base_reward: 2.34,
      total_business_boost_reward: 1.23,
      total_reward: 3.57,
      base_reward_score: 50,
      annotation_summary: [
        {
          severity_level: 'ERROR',
          group: 'NO_WALLET',
          title: 'Minor Sensor Issues',
          message:
            'Station is doing great! Minor issues detected during our data quality checks, that may be related to occasional sensor inaccuracies. That can happen once in a while.',
          doc_url: 'https://docs.weatherxm.com/project/rewards-troubleshooting#sensor-problems'
        }
      ]
    }
  ])
</script>

<template>
  <VCard class="h-100 w-100" elevation="0" rounded="0">
    <HeaderCard />

    <Timeline :timelineData="response" />
  </VCard>
</template>
