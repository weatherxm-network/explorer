<script setup lang="ts">
  import { useDisplay } from 'vuetify'
  import dayjs from 'dayjs'
  import utc from 'dayjs/plugin/utc'
  import timezone from 'dayjs/plugin/timezone.js'
  import LottieComponent from '../common/LottieComponent.vue'
  import DailyRewards from '../common/DailyRewards.vue'
  import EmptyRewards from '../common/EmptyRewards.vue'
  import HeaderCard from './widgets/HeaderCard.vue'
  import EndOfTimeline from './widgets/EndOfTimeline.vue'
  import wxmApi from '~/api/wxmApi'
  import { useMobileStore } from '~/stores/mobileStore'

  dayjs.extend(utc)
  dayjs.extend(timezone)

  const { trackGAevent } = useGAevents()
  const { selectValidationColor } = useValidationScoreColor()
  const deviceTimezone = dayjs.tz.guess()
  const fromDate = dayjs().tz(deviceTimezone).subtract(3, 'months').format('YYYY-MM-DD')
  const toDate = dayjs().tz(deviceTimezone).format('YYYY-MM-DD')
  const deviceId = ref<string | null>('')
  const pageSize = 10
  const currentPage = ref(0)
  const totalPages = ref(0)
  const hasNextPage = ref(false)
  const timeline = ref<any>([])
  const display = ref(useDisplay())
  const errorStateBoldText = ref('Oops! Something went wrong.')
  const errorStateLightText = ref('Failed to get the reward timeline of the device: No data')
  const animationContainerHeight = computed(() => {
    return display.value.smAndDown
      ? { marginTop: `calc(${display.value.height / 2}px - 115px)` }
      : { marginTop: `calc(${display.value.height / 2}px - 125px)` }
  })
  const errorAnimationContainerHeight = computed(() => {
    return display.value.smAndDown
      ? { marginTop: `calc(${display.value.height / 2}px - 228px)` }
      : { marginTop: `calc(${display.value.height / 2}px - 211px)` }
  })

  const mobileStore = useMobileStore()
  const route = useRoute()
  const showTimeline = ref(false)
  const loading = ref(false)
  const backTo = ref('stats')
  const emptyStateFlag = ref(false)

  const backToDeviceDetails = () => {
    if (backTo.value === 'stats') {
      mobileStore.setPageState(false)
      navigateTo(`/stats`)
    } else {
      navigateTo(`/stations/${backTo.value}`)
    }
  }

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

  const resolveDeviceName = async () => {
    const normalizeRouteDeviceName = formatDeviceName.normalizeDeviceName(route.params.deviceName)
    return await wxmApi
      .resolveDeviceName(normalizeRouteDeviceName)
      .then((response) => response.devices[0].id)
      .catch(() => null)
  }

  const getMoreRewards = async ({ done }) => {
    if (hasNextPage.value && currentPage.value <= totalPages.value) {
      await getRewards()
      done('ok')
    } else {
      done('empty')
    }
  }

  const getRewards = async () => {
    emptyStateFlag.value = false
    if (timeline.value.length === 0) {
      loading.value = true
    }
    deviceId.value = await resolveDeviceName()
    if (deviceId) {
      // track GA event
      trackGAevent('device_reward_transactions', { ITEM_ID: deviceId.value })
      wxmApi
        .getRewardTimeline(
          deviceId.value,
          deviceTimezone,
          currentPage.value,
          pageSize,
          fromDate,
          toDate
        )
        .then((response) => {
          backTo.value = route.params.deviceName
          hasNextPage.value = response.has_next_page
          totalPages.value = response.total_pages
          currentPage.value++
          if (response.data.length !== 0) {
            const calcedResponseData = response.data.map((item) => {
              const hasActiveBoosts = 'total_business_boost_reward' in item
              return {
                timestamp: dayjs(item.timestamp).utc().format('MMM D, YYYY'),
                total_reward: computeStringNumber(item.total_reward.toString()),
                base_reward: computeStringNumber(item.base_reward.toString()),
                total_business_boost_reward: hasActiveBoosts
                  ? computeStringNumber(item.total_business_boost_reward.toString())
                  : '',
                has_active_boosts: hasActiveBoosts,
                validation_color: selectValidationColor(item.base_reward_score),
                severity_level:
                  item?.annotation_summary &&
                  item?.annotation_summary.length !== 0 &&
                  item?.annotation_summary[0]?.severity_level
                    ? item?.annotation_summary[0]?.severity_level
                    : null,
                numberOfIssues: item?.annotation_summary ? item?.annotation_summary.length : 0
              }
            })
            timeline.value.push(...calcedResponseData)
          } else if (response.data.length === 0 && timeline.value.length === 0) {
            emptyStateFlag.value = true
          }
          loading.value = false
          showTimeline.value = true
        })
        .catch(() => {
          loading.value = false
          showTimeline.value = false
        })
    }
  }

  onMounted(() => {
    getRewards()
  })
</script>

<template>
  <VCard class="w-100" color="background" elevation="0" rounded="0">
    <VCardTitle class="pa-0">
      <HeaderCard @back-to-device-details="backToDeviceDetails" />
    </VCardTitle>
    <VCardText class="ma-0 pa-0">
      <div v-if="emptyStateFlag && !loading" class="pa-2">
        <EmptyRewards />
      </div>

      <div v-if="loading" :style="animationContainerHeight">
        <LottieComponent :lottie-name="'loaderLight'" :bold-text="''" :light-text="''" />
      </div>
      <div
        v-if="!showTimeline && !loading && !emptyStateFlag"
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
            @click="getRewards"
            ><span class="text-primary">Retry</span></VBtn
          >
        </VSheet>
      </div>
      <VCardText v-if="showTimeline && !loading && !emptyStateFlag" class="pa-0 ma-0">
        <!----------------------------- Timeline component --------------------------------->
        <VCard
          class="px-2 pt-4 pb-0"
          color="background"
          elevation="0"
          rounded="0"
          height="100% - 64px"
          style="height: calc(100dvh - 64px); overflow: scroll"
        >
          <VCardText class="pa-0">
            <v-infinite-scroll :items="timeline" @load="getMoreRewards">
              <template v-for="(item, index) in timeline" :key="index">
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
                  :number-of-issues="item.numberOfIssues"
                />
              </template>
              <template #empty>
                <EndOfTimeline />
              </template>
              <template #loading>
                <VProgressCircular indeterminate color="primary" class="mt-4" />
              </template>
            </v-infinite-scroll>
          </VCardText>
        </VCard>
      </VCardText>
    </VCardText>
  </VCard>
</template>

<style>
  .v-infinite-scroll--vertical {
    overflow-y: hidden;
  }
  .v-infinite-scroll__side {
    padding: 0px !important;
    padding-bottom: 16px !important;
  }
</style>
