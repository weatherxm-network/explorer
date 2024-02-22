<script setup lang="ts">
  import { useDisplay } from 'vuetify'
  import dayjs from 'dayjs'
  import utc from 'dayjs/plugin/utc'
  import timezone from 'dayjs/plugin/timezone.js'
  import LottieComponent from '../common/LottieComponent.vue'
  import HeaderCard from './widgets/HeaderCard.vue'
  import Timeline from './widgets/Timeline.vue'
  import wxmApi from '~/api/wxmApi'
  import { useMobileStore } from '~/stores/mobileStore'
  import { selectValidationScoreColor } from '~/components/Device/utils/selectScoreColor'

  dayjs.extend(utc)
  dayjs.extend(timezone)

  const deviceTimezone = dayjs.tz.guess()
  const fromDate = dayjs().tz(deviceTimezone).subtract(1095, 'days').format('YYYY-MM-DD')
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
    return { marginTop: `calc(${display.value.height / 2}px - 244px)` }
  })
  const errorAnimationContainerHeight = computed(() => {
    return { marginTop: `calc(${display.value.height / 2}px - 281px)` }
  })

  const mobileStore = useMobileStore()
  const route = useRoute()
  const showTimeline = ref(false)
  const loading = ref(false)
  const loadingForMore = ref(false)
  const backTo = ref('stats')

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

  const getMoreRewards = async () => {
    // window.onscroll = async () => {
    //   const bottomOfWindow =
    //     document.documentElement.scrollTop + window.innerHeight ===
    //     document.documentElement.offsetHeight

    //   if (bottomOfWindow && route.name === 'reward_timeline-deviceName') {
    //     if (hasNextPage.value && currentPage.value <= totalPages.value) {
    //       loading.value = true
    //       await getRewards()
    //     }
    //   }
    // }
    if (hasNextPage.value && currentPage.value <= totalPages.value) {
      loading.value = true
      await getRewards()
      loadingForMore.value = false
    }
  }

  const getRewards = async () => {
    loading.value = true
    deviceId.value = await resolveDeviceName()

    if (deviceId) {
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
                validation_color: selectValidationScoreColor(item.base_reward_score),
                severity_level: item.annotation_summary[0]?.severity_level ?? null
              }
            })
            timeline.value.push(...calcedResponseData)
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
  <VCard class="h-100 w-100" elevation="0" rounded="0">
    <HeaderCard @back-to-device-details="backToDeviceDetails" />

    <VCardText class="ma-0 pa-0 h-100 w-100">
      <VCard height="100%" class="w-100" color="background" elevation="0">
        <VCardText class="ma-0 pa-0">
          <div v-if="loading" :style="animationContainerHeight">
            <LottieComponent :lottie-name="'loaderLight'" :bold-text="''" :light-text="''" />
          </div>
          <div
            v-if="!showTimeline && !loading"
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
          <VCardText v-if="showTimeline && !loading" class="pa-0 ma-0">
            <Timeline :timeline-data="timeline" />
            <div v-if="loadingForMore" class="d-flex justify-center">
              <VProgressCircular color="primary" indeterminate></VProgressCircular>
            </div>
          </VCardText>
        </VCardText>
      </VCard>
      <VBtn @click="[getMoreRewards, (loadingForMore = true)]">MoRE</VBtn>
    </VCardText>
  </VCard>
</template>
