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
  }

  const props = withDefaults(defineProps<Props>(), {
    date: '',
    dailyAmount: '',
    baseRewardAmount: '',
    boostAmount: '',
    validationScoreColor: '',
    state: () => 'CLEAR'
  })

  const theme = useTheme()
  const cardTitleText = ref('Daily Reward')
  const infoBoldText = ref('Minor issues slightly affected your rewards.')
  const infoLightText = ref(
    'This may happen occasionally, but we thought you should know. View reward details to identify and fix problems.'
  )
  const warningBoldText = ref('Some issues prevent your station from getting the full rewards.')
  const warningLightText = ref('View reward details to identify and fix problems.')
  const errorBoldText = ref(
    'Serious problems were detected, that prevent the station from getting the full rewards.'
  )
  const errorLightText = ref('View reward details to identify and fix problems.')

  const calcSateColor = (state: string) => {
    switch (state) {
      case 'INFO':
        return 'primary'
      case 'WARNING':
        return 'warning'
      case 'ERROR':
        return 'error'
    }
  }

  const calcStateTintColor = (state: string) => {
    switch (state) {
      case 'INFO':
        return 'layer1'
      case 'WARNING':
        return 'warningTint'
      case 'ERROR':
        return 'errorTint'
    }
  }

  const calcStateBoldText = (state: string) => {
    switch (state) {
      case 'INFO':
        return infoBoldText.value
      case 'WARNING':
        return warningBoldText.value
      case 'ERROR':
        return errorBoldText.value
    }
  }

  const calcStateLightText = (state: string) => {
    switch (state) {
      case 'INFO':
        return infoLightText.value
      case 'WARNING':
        return warningLightText.value
      case 'ERROR':
        return errorLightText.value
    }
  }
</script>
<template>
  <VCard
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
          <VDivider />
        </div>
        <!------------------------- Base + boosts ----------------------->
        <div class="d-flex" :class="props.state === null ? 'mb-6' : ''">
          <div class="d-flex me-4">
            <div
              style="width: 24px; height: 24px"
              class="d-flex align-center justify-center me-1"
              :style="{ color: props.validationScoreColor }"
            >
              <i class="fa-regular fa-hexagon fa-rotate-90 fa-lg"></i>
            </div>
            <div class="text-caption" style="letter-spacing: normal">
              <div class="font-weight-bold">{{ `${props.baseRewardAmount} $WXM` }}</div>
              <div>Base Reward</div>
            </div>
          </div>
          <div class="d-flex">
            <div
              style="width: 24px; height: 24px"
              class="d-flex align-center justify-center me-1"
              :style="{ color: theme.current.value.colors.primary }"
            >
              <i class="fa-regular fa-hexagon fa-rotate-90 fa-lg"></i>
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
              <div>{{ props.hasActiveBoosts ? 'Boost' : 'Boosts' }}</div>
            </div>
          </div>
        </div>
        <div v-if="props.state === null">
          <VBtn
            block
            rounded="lg"
            color="layer1"
            class="text-none font-weight-bold text-body-2"
            size="x-large"
            style="letter-spacing: normal"
            flat
          >
            <span class="text-primary">View Reward Details</span>
          </VBtn>
        </div>
      </VSheet>
      <!---------------- Button ---------------->
      <div v-if="props.state !== null" class="pa-4">
        <div class="mb-2 text-caption" style="letter-spacing: normal; line-height: 16px">
          <span class="font-weight-bold"> {{ calcStateBoldText(props.state) }} </span
          ><span>{{ calcStateLightText(props.state) }}</span>
        </div>
        <div>
          <VBtn
            block
            rounded="lg"
            color="#FEFBFFBF"
            variant="tonal"
            class="text-none font-weight-bold text-body-2"
            size="x-large"
            style="letter-spacing: normal"
            flat
          >
            <span class="text-primary">View Reward Details</span>
          </VBtn>
        </div>
      </div>
    </VSheet>
  </VCard>
</template>
