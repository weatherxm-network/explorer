<script setup lang="ts">
  import dayjs from 'dayjs'
  import timezone from 'dayjs/plugin/timezone'
  import { selectValidationScoreColor } from '../utils/selectScoreColor'
  import type { Device, LatestTokens } from '../types/device'

  import TotalStationRewards from './RewardsWidgets/TotalStationRewards.vue'
  import DailyRewards from './RewardsWidgets/DailyRewards.vue'
  import WeeklyStreak from './RewardsWidgets/WeeklyStreak.vue'
  import MainnetBanner from './RewardsWidgets/MainnetBanner.vue'
  import EmptyRewards from './RewardsWidgets/EmptyRewards.vue'
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

  // rewards stuff
  const deviceTokens = ref()
  const validationScoreColor = ref()
  const total = ref('')
  const actualReward = ref('')
  const lostRewards = ref(0)
  const periodMaxReward = ref('')
  const rewardScore = ref(100)
  const timelineTimestamp = ref()
  const timelineColorsArray = ref()
  const tokensTimestamp = ref('')
  const showPeriod = ref('Latest')

  const totalStationRewards = ref('')
  const dailyRewardsDate = ref('')
  const dailyRewardsBaseReward = ref('')
  const dailyRewardsTotalBusinessBoostReward = ref('')
  const dailyRewardsTotalReward = ref('')
  const dailyRewardsValidationScoreColor = ref('')
  const dailyRewardsSeverity = ref('')

  const weeklyStreakFromDate = ref('')
  const weeklyStreakToDate = ref('')
  const weeklyStreakTimeline = ref()
  const emptyStateFlag = ref(false)

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

  const showLatest = (deviceLatestTokens: LatestTokens) => {
    showPeriod.value = 'Latest'
    actualReward.value = `+ ${computeStringNumber(
      deviceLatestTokens.actual_reward.toString()
    )} $WXM`
    lostRewards.value = deviceLatestTokens.lost_reward
    periodMaxReward.value = computeStringNumber(deviceLatestTokens.period_max_reward.toString())
    rewardScore.value = deviceLatestTokens.reward_score
    timelineTimestamp.value = deviceLatestTokens.timeline.reference_date
    timelineColorsArray.value = deviceLatestTokens.timeline.reward_scores.map((item) => {
      return selectValidationScoreColor(item)
    })
    tokensTimestamp.value = deviceLatestTokens.timestamp
    validationScoreColor.value = selectValidationScoreColor(deviceLatestTokens.reward_score)
  }

  // get device transactions
  const getSpecificDeviceTransactions = (deviceId: string) => {
    emit('loadingRewardsTab', true)
    wxmApi
      .getDeviceTokens(deviceId)
      .then(() => {
        const response = {
          total_rewards: 1,
          latest: {
            timestamp: '2024-02-20T12:32:32.588Z',
            base_reward: 2.34,
            total_business_boost_reward: 13.23,
            total_reward: 3.57,
            base_reward_score: 50,
            annotation_summary: [
              {
                severity_level: 'INFO',
                group: 'NO_WALLET',
                title: 'Minor Sensor Issues',
                message:
                  'Station is doing great! Minor issues detected during our data quality checks, that may be related to occasional sensor inaccuracies. That can happen once in a while.',
                doc_url:
                  'https://docs.weatherxm.com/project/rewards-troubleshooting#sensor-problems'
              }
            ]
          },
          timeline: [
            {
              timestamp: '2024-02-20T12:32:32.588Z',
              base_reward_score: 0
            },
            {
              timestamp: '2024-02-20T12:32:32.588Z',
              base_reward_score: 40
            },
            {
              timestamp: '2024-02-20T12:32:32.588Z',
              base_reward_score: 30
            },
            {
              timestamp: '2024-02-20T12:32:32.588Z',
              base_reward_score: 50
            },
            {
              timestamp: '2024-02-20T12:32:32.588Z',
              base_reward_score: 50
            },
            {
              timestamp: '2024-02-20T12:32:32.588Z',
              base_reward_score: 100
            },
            {
              timestamp: '2024-02-20T12:32:32.588Z',
              base_reward_score: 50
            }
          ]
        }

        emptyStateFlag.value = response.total_rewards === 0
        //////// Total station rewards /////////
        totalStationRewards.value = computeStringNumber(response.total_rewards.toString())
        //////// Daily Rewards /////////
        dailyRewardsDate.value = dayjs(response.latest.timestamp).utc().format('MMM D, YYYY')
        dailyRewardsBaseReward.value = computeStringNumber(response.latest.base_reward.toString())
        dailyRewardsTotalBusinessBoostReward.value = computeStringNumber(
          response.latest.total_business_boost_reward.toString()
        )
        dailyRewardsTotalReward.value = computeStringNumber(response.latest.total_reward.toString())

        dailyRewardsValidationScoreColor.value = selectValidationScoreColor(
          response.latest.base_reward_score
        )
        dailyRewardsSeverity.value = response?.latest?.annotation_summary[0]?.severity_level ?? null
        //////// Weekly streak timeline /////////
        weeklyStreakFromDate.value = dayjs(response?.timeline[0]?.timestamp)
          .utc()
          .format('MMM D')
        weeklyStreakToDate.value = dayjs(
          response?.timeline[response.timeline.length - 1]?.timestamp
        )
          .utc()
          .format('MMM D')
        weeklyStreakTimeline.value = response.timeline
        if (response) {
          deviceTokens.value = response
          total.value = `${computeStringNumber(deviceTokens.value.total_rewards.toString())} $WXM`
          showLatest(deviceTokens.value.latest)
          emit('loadingRewardsTab', false)
        }
      })
      .catch(() => {
        emit('loadingRewardsTab', false)
      })
  }

  onMounted(async () => {
    await getSpecificDeviceTransactions(props.device.id)
  })
</script>

<!-- eslint-disable vue/attribute-hyphenation -->
<template>
  <div>
    <div class="py-5 px-4">
      <MainnetBanner v-if="false" :date="'14th of February'"></MainnetBanner>
      <EmptyRewards v-if="emptyStateFlag" />
      <TotalStationRewards v-if="!emptyStateFlag" :totalRewards="totalStationRewards" />
      <DailyRewards
        v-if="!emptyStateFlag"
        :date="dailyRewardsDate"
        :dailyAmount="dailyRewardsTotalReward"
        :validationScoreColor="validationScoreColor"
        :baseRewardAmount="dailyRewardsBaseReward"
        :boostAmount="dailyRewardsTotalBusinessBoostReward"
        :state="dailyRewardsSeverity"
      />

      <!---------------------- Weekly streak ----------------------->
      <WeeklyStreak
        v-if="!emptyStateFlag"
        :bar-graph-data="weeklyStreakTimeline"
        :fromDate="weeklyStreakFromDate"
        :toDate="weeklyStreakToDate"
      />
    </div>
  </div>
</template>
