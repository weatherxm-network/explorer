<script setup lang="ts">
  import { useTheme } from 'vuetify'

  interface Props {
    date?: string
    dailyAmount?: string
    baseRewardAmount?: string
    boostAmount?: string | null
    hasActiveBoosts?: boolean
    validationScoreColor?: string | null
    state?: 'INFO' | 'WARNING' | 'ERROR' | null
    numberOfIssues?: number
  }

  const props = withDefaults(defineProps<Props>(), {
    date: '',
    dailyAmount: '',
    baseRewardAmount: '',
    boostAmount: '',
    validationScoreColor: '',
    numberOfIssues: 0,
    state: null
  })

  const theme = useTheme()
  const cardTitleText = ref('Daily Reward')
  const annotationSuffixText = ref('affecting station rewards.')

  const calcTextPrefix = (numberOfIssues: number) => {
    return numberOfIssues > 1 ? 'issues' : 'issue'
  }

  const calcMinorText = (state: string | null) => {
    return state === 'INFO' ? 'minor' : ''
  }

  const calcSateColor = (state: string) => {
    switch (state) {
      case 'INFO':
        return theme.current.value.dark ? 'primary' : 'lightestBlue'
      case 'WARNING':
        return 'warning'
      case 'ERROR':
        return 'error'
    }
  }

  const calcStateTintColor = (state: string) => {
    switch (state) {
      case 'INFO':
        return 'blueTint'
      case 'WARNING':
        return 'warningTint'
      case 'ERROR':
        return 'errorTint'
    }
  }
</script>
<template>
  <VCard
    class="mx-2"
    rounded="xl"
    elevation="2"
    :color="calcSateColor(props.state)"
    :variant="props.state !== null ? 'outlined' : undefined"
  >
    <VSheet rounded="xl" :color="calcStateTintColor(props.state)">
      <VSheet rounded="xl" color="top" class="pa-6">
        <div
          class="text-text font-weight-bold mb-1"
          style="font-size: 0.984rem; letter-spacing: normal"
        >
          {{ cardTitleText }}
        </div>
        <div class="text-darkGrey text-body-2 mb-6">{{ `Earnings for ${props.date}` }}</div>
        <div
          class="text-darkestBlue font-weight-bold"
          style="font-size: 2rem; letter-spacing: normal"
        >
          {{ `+ ${props.dailyAmount} $WXM` }}
        </div>
        <div class="my-2">
          <div :style="{ borderTop: `0.031rem solid ${theme.current.value.colors.layer2}` }"></div>
        </div>
        <!------------------------- Base + boosts ----------------------->
        <div class="d-flex" :class="props.state === null ? 'mb-0' : ''">
          <div class="d-flex me-4">
            <div
              v-if="props.state === 'INFO' || props.state === null"
              style="width: 24px; height: 24px; font-size: 20px"
              class="d-flex align-center justify-center me-1"
              :style="{ color: props.validationScoreColor }"
            >
              <i class="fa-solid fa-hexagon-check"></i>
            </div>
            <div
              v-if="props.state === 'WARNING'"
              style="width: 24px; height: 24px; font-size: 20px"
              class="d-flex align-center justify-center me-1"
              :style="{ color: props.validationScoreColor }"
            >
              <i class="fa-solid fa-hexagon-exclamation"></i>
            </div>
            <div
              v-if="props.state === 'ERROR'"
              style="width: 24px; height: 24px; font-size: 20px"
              class="d-flex align-center justify-center me-1"
              :style="{ color: props.validationScoreColor }"
            >
              <i class="fa-solid fa-hexagon-xmark"></i>
            </div>
            <div class="text-caption" style="letter-spacing: normal">
              <div class="font-weight-bold">{{ `${props.baseRewardAmount} $WXM` }}</div>
              <div>Base Reward</div>
            </div>
          </div>
          <div class="d-flex">
            <div
              v-if="props.hasActiveBoosts"
              style="width: 24px; height: 24px; font-size: 20px"
              class="d-flex align-center justify-center me-1"
              :style="{ color: theme.current.value.colors.chartLine }"
            >
              <i class="fa-solid fa-hexagon-check"></i>
            </div>
            <div
              v-else
              style="width: 24px; height: 24px; font-size: 20px"
              class="d-flex align-center justify-center me-1"
              :style="{ color: theme.themes.value.light.colors.mediumGrey }"
            >
              <i class="fa-solid fa-hexagon-xmark"></i>
            </div>
            <div class="text-caption" style="letter-spacing: normal">
              <div :class="props.hasActiveBoosts ? 'font-weight-bold' : ''">
                {{
                  props.hasActiveBoosts
                    ? `${
                        props.boostAmount === 0 ? props.boostAmount.toFixed(2) : props.boostAmount
                      } $WXM`
                    : 'No Active'
                }}
              </div>
              <div>{{ 'Boosts' }}</div>
            </div>
          </div>
        </div>
      </VSheet>
      <!---------------- Annotation Text ---------------->
      <div v-if="props.state !== null" class="px-6 py-4">
        <div class="text-caption" style="letter-spacing: normal; line-height: 16px">
          <span class="font-weight-bold">
            {{
              `${props.numberOfIssues} ${calcMinorText(props.state)} ${calcTextPrefix(
                props.numberOfIssues
              )} `
            }} </span
          ><span>{{ annotationSuffixText }}</span>
        </div>
      </div>
    </VSheet>
  </VCard>
</template>
