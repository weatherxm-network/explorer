<script setup lang="ts">
  import { useTheme } from 'vuetify'
  import { selectValidationScoreColor } from '../../utils/selectScoreColor'
  interface BarGraphData {
    rewardScore?: float
    timestamp?: string
  }

  interface Props {
    date?: string
    barGraphData?: BarGraphData[]
    fromDate?: string
    toDate?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    date: '',
    barGraphData: () => [{ rewardScore: 0, timestamp: '' }],
    dateFrom: '',
    dateTo: ''
  })

  const theme = useTheme()
  const cardTitleText = ref('Weekly Streak')

  const calcGraphValueHeight = (value: float) => {
    const calcedHeightBasedOnValue = (value / 100) * 77
    return calcedHeightBasedOnValue < 20 ? 20 : calcedHeightBasedOnValue
  }
</script>

<template>
  <VCard class="my-4 pa-6" rounded="xl" elevation="2" color="top">
    <div
      class="text-text font-weight-bold mb-1"
      style="font-size: 0.984rem; letter-spacing: normal"
    >
      {{ cardTitleText }}
    </div>
    <div class="text-darkGrey text-body-2 mb-6">{{ props.date }}</div>
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
                height: `${calcGraphValueHeight(item.rewardScore)}px`,
                backgroundColor: selectValidationScoreColor(item.rewardScore),
                width: '20px'
              }"
            ></div>
          </div>
          <div class="d-flex justify-center mt-1">{{ item.timestamp }}</div>
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
      >
        <span class="text-primary">View Timeline</span>
      </VBtn>
    </div>
  </VCard>
</template>
