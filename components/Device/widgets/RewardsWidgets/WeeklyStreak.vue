<script setup lang="ts">
  import { useTheme } from 'vuetify'
  import dayjs from 'dayjs'
  import timezone from 'dayjs/plugin/timezone'

  dayjs.extend(timezone)

  interface BarGraphData {
    base_reward_score?: number
    timestamp?: string
  }

  interface Props {
    barGraphData?: BarGraphData[]
    fromDate?: string
    toDate?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    barGraphData: () => [{ base_reward_score: 0, timestamp: '' }],
    fromDate: '',
    toDate: ''
  })

  const route = useRoute()
  const theme = useTheme()
  const cardTitleText = ref('Weekly Streak')
  const { selectValidationColor } = useValidationScoreColor()

  const calcGraphValueHeight = (value: number) => {
    if (value === null) {
      return 0
    } else {
      const calcedHeightBasedOnValue = (value / 100) * 77
      return calcedHeightBasedOnValue <= 20 ? 20 : calcedHeightBasedOnValue.toFixed(3)
    }
  }
</script>

<template>
  <VCard class="mt-4 pa-6 mx-2" rounded="xl" elevation="2" color="top">
    <div
      class="text-text font-weight-bold mb-1"
      style="font-size: 0.984rem; letter-spacing: normal"
    >
      {{ cardTitleText }}
    </div>
    <div class="text-darkGrey text-body-2 mb-6">
      {{ `Base reward scores from ${props.fromDate} to ${props.toDate}` }}
    </div>
    <!---------------- Progress bars ---------------->
    <div>
      <div class="d-flex justify-space-evenly">
        <div v-for="(item, index) in props.barGraphData" :key="index" class="mx-1">
          <div
            class="rounded-xl d-flex align-end"
            style="height: 77px"
            :style="{ backgroundColor: theme.current.value.colors.blueTint, width: '20px' }"
          >
            <div
              :key="index"
              class="rounded-xl"
              style="height: 20px"
              :style="{
                height: `${calcGraphValueHeight(item.base_reward_score)}px`,
                backgroundColor: selectValidationColor(item.base_reward_score),
                width: '20px'
              }"
            ></div>
          </div>
          <div class="d-flex justify-center mt-1">
            {{ dayjs(item.timestamp).utc().format('dd').charAt(0) }}
          </div>
        </div>
      </div>
      <div class="d-flex justify-space-between mt-2 mb-6">
        <div>{{ props.fromDate }}</div>
        <div>{{ props.toDate }}</div>
      </div>
    </div>
    <!---------------- TImeline button ---------------->
    <div>
      <VBtn
        block
        rounded="lg"
        color="layer1"
        class="text-none font-weight-bold text-body-2"
        size="x-large"
        style="letter-spacing: normal"
        flat
        @click="navigateTo(`/reward_timeline/${route.params.deviceName}`)"
      >
        <span class="text-primary">View Timeline</span>
      </VBtn>
    </div>
  </VCard>
</template>
