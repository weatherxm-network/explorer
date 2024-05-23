<script setup lang="ts">
  import dayjs from 'dayjs'
  import timezone from 'dayjs/plugin/timezone'
  import { useDisplay } from 'vuetify'
  import type { Device } from '../types/device'
  import DailyRewards from '../../common/DailyRewards.vue'
  import EmptyRewards from '../../common/EmptyRewards.vue'
  import TotalStationRewards from './RewardsWidgets/TotalStationRewards.vue'
  import WeeklyStreak from './RewardsWidgets/WeeklyStreak.vue'
  import MainnetBanner from './RewardsWidgets/MainnetBanner.vue'
  import LottieComponent from '~/components/common/LottieComponent.vue'
  import wxmApi from '~/api/wxmApi'

  dayjs.extend(timezone)

  interface Props {
    device?: Device
  }

  const props = withDefaults(defineProps<Props>(), {
    device: () => ({
      cellIndex: '',
      id: '',
      isActive: true,
      lastWeatherStationActivity: '',
      name: '',
      profile: '',
      timezone: '',
      current_weather: {
        dew_point: 0,
        feels_like: 0,
        humidity: 0,
        icon: 'not_available',
        precipitation: 0,
        precipitation_accumulated: 0,
        solar_irradiance: 0,
        pressure: 0,
        temperature: 0,
        timestamp: '',
        uv_index: 0,
        wind_direction: 0,
        wind_gust: 0,
        wind_speed: 0
      }
    })
  })

  const emit = defineEmits(['loadingRewardsTab'])
  const { selectValidationColor } = useValidationScoreColor()
  const { fetchRemoteConfig } = useFirebase()
  const { trackGAevent } = useGAevents()
  const remoteConfig = await fetchRemoteConfig()
  const mainnetShowFlag = ref<boolean>(remoteConfig.feat_mainnet._value === 'true')
  const loading = ref(false)
  // rewards stuff
  const totalStationRewards = ref('')
  const dailyRewardsDate = ref('')
  const dailyRewardsBaseReward = ref('')
  const dailyRewardsTotalBusinessBoostReward = ref('')
  const dailyRewardsTotalReward = ref('')
  const dailyRewardsValidationScoreColor = ref('')
  const dailyRewardsSeverity = ref<'INFO' | 'WARNING' | 'ERROR' | null | undefined>(null)
  const dailyRewardsHasActiveBoosts = ref(false)
  const dailyRewardsNumberOfIssues = ref(0)

  const weeklyStreakFromDate = ref('')
  const weeklyStreakToDate = ref('')
  const weeklyStreakTimeline = ref()
  const emptyStateFlag = ref(false)

  const showRewards = ref(false)
  const display = ref(useDisplay())
  const errorStateBoldText = ref('Oops! Something went wrong.')
  const errorStateLightText = ref('Failed to get the rewards of the device: No data')
  const errorAnimationContainerHeight = computed(() => {
    return { marginTop: `calc(${display.value.height / 2}px - 281px)` }
  })

  const countDecimals = (number: number) => {
    if (Number.isInteger(number)) {
      return 0
    } else {
      return number.toString().split('.')[1].length
    }
  }

  const removeTrailingZeros = (number: string) => {
    return Number(number.toString()) * 1
  }
  const computeStringNumber = (number: string) => {
    const num = number
    const trailedNumber = removeTrailingZeros(num)
    const decimals = countDecimals(trailedNumber)
    if (decimals <= 2) {
      return Number(num).toFixed(2).toString()
    }
    if (decimals > 2 && decimals <= 5) {
      return num.substring(0, num.indexOf('.') + decimals + 1)
    } else {
      const fixedFive = num.substring(0, num.indexOf('.') + 5)
      return countDecimals(removeTrailingZeros(fixedFive)) <= 2
        ? num.substring(0, num.indexOf('.') + 2)
        : num.substring(0, num.indexOf('.') + countDecimals(removeTrailingZeros(fixedFive)) + 1)
    }
  }

  // get device transactions
  const getSpecificDeviceTransactions = (deviceId: string) => {
    emit('loadingRewardsTab', true)
    showRewards.value = false
    loading.value = true

    wxmApi
      .getDeviceTokens(deviceId)
      .then((response) => {
        emptyStateFlag.value = response.total_rewards === 0 && Object.keys(response).length === 1
        /// ///// Total station rewards /////////
        totalStationRewards.value = computeStringNumber(response.total_rewards.toString())
        /// ///// Daily Rewards /////////
        dailyRewardsHasActiveBoosts.value = 'total_business_boost_reward' in response.latest
        if (dailyRewardsHasActiveBoosts.value) {
          dailyRewardsTotalBusinessBoostReward.value = computeStringNumber(
            response.latest.total_business_boost_reward.toString()
          )
        }
        dailyRewardsDate.value = dayjs(response.latest.timestamp).utc().format('MMM D, YYYY')
        dailyRewardsBaseReward.value = computeStringNumber(response.latest.base_reward.toString())
        dailyRewardsTotalReward.value = computeStringNumber(response.latest.total_reward.toString())
        dailyRewardsValidationScoreColor.value = selectValidationColor(
          response.latest.base_reward_score
        )

        dailyRewardsSeverity.value = response?.latest?.annotation_summary[0]?.severity_level ?? null
        dailyRewardsNumberOfIssues.value = response?.latest?.annotation_summary
          ? response?.latest?.annotation_summary.length
          : 0
        /// ///// Weekly streak timeline /////////
        weeklyStreakFromDate.value = dayjs(response?.timeline[0]?.timestamp)
          .utc()
          .format('MMM D')
        weeklyStreakToDate.value = dayjs(
          response?.timeline[response.timeline.length - 1]?.timestamp
        )
          .utc()
          .format('MMM D')
        weeklyStreakTimeline.value = response.timeline

        emit('loadingRewardsTab', false)
        loading.value = false
        showRewards.value = true
      })
      .catch(() => {
        emit('loadingRewardsTab', false)
        loading.value = false
        showRewards.value = false
      })
  }

  onMounted(() => {
    // track GA event
    trackGAevent('device_rewards')
    getSpecificDeviceTransactions(props.device.id)
  })
</script>

<template>
  <div>
    <div class="py-5 px-2 pt-0">
      <div class="mx-2 mt-2">
        <MainnetBanner v-if="mainnetShowFlag"></MainnetBanner>
      </div>
      <EmptyRewards v-if="emptyStateFlag && !loading" />
      <TotalStationRewards
        v-if="!emptyStateFlag && !loading && showRewards"
        :total-rewards="totalStationRewards"
      />
      <DailyRewards
        v-if="!emptyStateFlag && !loading && showRewards"
        :date="dailyRewardsDate"
        :daily-amount="dailyRewardsTotalReward"
        :has-active-boosts="dailyRewardsHasActiveBoosts"
        :validation-score-color="dailyRewardsValidationScoreColor"
        :base-reward-amount="dailyRewardsBaseReward"
        :boost-amount="dailyRewardsTotalBusinessBoostReward"
        :state="dailyRewardsSeverity"
        :number-of-issues="dailyRewardsNumberOfIssues"
      />
      <!---------------------- Weekly streak ----------------------->
      <WeeklyStreak
        v-if="!emptyStateFlag && !loading && showRewards"
        :bar-graph-data="weeklyStreakTimeline"
        :from-date="weeklyStreakFromDate"
        :to-date="weeklyStreakToDate"
      />
    </div>

    <VCard height="100%" class="w-100" color="background" elevation="0">
      <div
        v-if="!showRewards && !loading && !emptyStateFlag"
        class="d-flex flex-column justify-center pa-6"
        :style="errorAnimationContainerHeight"
      >
        <LottieComponent
          :lottie-name="'errorState'"
          :bold-text="errorStateBoldText"
          :light-text="errorStateLightText"
        />
        <VSheet class="mt-4" rounded="lg" color="primary" :border="true">
          <VBtn
            block
            class="text-none"
            size="x-large"
            rounded="lg"
            color="top"
            flat
            @click="getSpecificDeviceTransactions(props.device.id)"
            ><span class="text-primary">Retry</span></VBtn
          >
        </VSheet>
      </div>
    </VCard>
  </div>
</template>
