<script setup lang="ts">
  import { useDisplay } from 'vuetify'
  import { onMounted, computed, reactive } from 'vue'
  import dayjs from 'dayjs'
  import LottieComponent from '../common/LottieComponent.vue'
  import NoInternetComponent from '../common/NoInternetComponent.vue'
  import MainnetBanner from '../Device/widgets/RewardsWidgets/MainnetBanner.vue'
  import CardHeader from './widgets/CardHeader.vue'
  import MobileHeader from './widgets/MobileHeader.vue'
  import DataDays from './widgets/DataDays.vue'
  import Rewards from './widgets/Rewards.vue'
  import ShopCard from './widgets/ShopCard.vue'
  import WXMToken from './widgets/WXMToken.vue'
  import WeatherStations from './widgets/WeatherStations.vue'
  import ContactCard from './widgets/ContactCard.vue'
  import LastUpdatedFooter from './widgets/LastUpdatedFooter.vue'
  import numberFormater from './utils/numberFormater'
  import wxmApi from '~/api/wxmApi'
  import { useMobileStore } from '~/stores/mobileStore'

  interface LineChartData {
    ts: string
    value: number
  }

  const mobileStore = useMobileStore()
  const display = ref(useDisplay())
  const route = useRoute()
  const loading = ref(true)
  const showNoInternetComponent = ref(false)
  const boldText = ref('SERVICE UNAVAILABLE')
  const lightText = ref(
    'Server busy, site may have moved or you lost your dial-up Internet connection'
  )

  // mainnet banner vars
  const { fetchRemoteConfig } = useFirebase()
  const remoteConfig = await fetchRemoteConfig()
  const mainnetShowFlag = ref<boolean>(remoteConfig.feat_mainnet._value === 'true')
  // data days vars
  let dataDaysChartData = reactive([])
  let dataDaysLastAndProgress = reactive({ lastValue: '0', progress: '0' })
  let dataDaysChartLabels = reactive([])
  const dataDays30DaysTotal = ref(0)
  // rewards vars
  let rewardsChartData = reactive([])
  let rewardsLastAndProgress = reactive({ lastValue: '0', progress: '0' })
  let rewardsChartLabels = reactive([])
  const rewards30DaysTotal = ref(0)
  const rewardsLastRunUrl = ref('')
  const rewardsContractUrl = ref('')
  // shop card var
  const avgMonthly = ref(0)
  // wxm token vars
  const wxmTokenTotalSupply = ref(0)
  const wxmTokenDailyMinted = ref(0)
  const wxmTokenCirculatingSupply = ref(0)
  const wxmTokenContractUrl = ref('')
  // weather stations vars
  let weatherStationsOnboarded = reactive({})
  let weatherStationsClaimed = reactive({})
  let weatherStationsActive = reactive({})
  // last update var
  const lastUpdated = ref('')

  const animationContainerHeight = computed(() => {
    return display.value.smAndDown
      ? { marginTop: `calc(${display.value.height / 2}px - 120px)` }
      : { marginTop: `calc(${display.value.height / 2}px - 400px)` }
  })
  const errorContainerHeight = computed(() => {
    return display.value.smAndDown
      ? { marginTop: `calc(${display.value.height / 2}px - 157px)` }
      : { marginTop: `calc(${display.value.height / 2}px - 417px)` }
  })
  onMounted(() => {
    if (display.value.smAndDown && route.fullPath === '/stats') {
      mobileStore.setPageState(true)
    }
    fillData()
    handlePaging()
  })

  const fillData = async () => {
    showNoInternetComponent.value = false
    loading.value = true

    await wxmApi
      .getNetStats()
      .then((response) => {
        // calc chart data
        dataDaysChartData = calcLineChartData(response.data_days)
        // calc last and progress
        dataDaysLastAndProgress = calcLastAndProgress(response.data_days)
        // calc chart labels
        dataDaysChartLabels = calcChartLabels(response.data_days)
        // calc 30 days total
        dataDays30DaysTotal.value = calc30DaysTotal(response.data_days)
        // calc chart data
        const arrayLength = response.tokens.allocated_per_day.length
        response.tokens.allocated_per_day[arrayLength - 1].value ===
        response.tokens.allocated_per_day[arrayLength - 2].value
          ? response.tokens.allocated_per_day.splice(-1, 1)
          : response.tokens.allocated_per_day
        rewardsChartData = calcLineChartData(response.tokens.allocated_per_day)
        // calc last and progress
        rewardsLastAndProgress = calcLastAndProgress(response.tokens.allocated_per_day)
        // calc chart labels
        rewardsChartLabels = calcChartLabels(response.tokens.allocated_per_day)
        // calc 30 days total
        rewards30DaysTotal.value = calc30DaysTotal(response.tokens.allocated_per_day)
        // pass rewards last tx url
        rewardsLastRunUrl.value = response.tokens.last_tx_hash_url
        // pass rewards contract url
        rewardsContractUrl.value = response.contracts.rewards_url
        // pass monthly avg tokens
        avgMonthly.value = response.tokens.avg_monthly
        // pass total supply
        wxmTokenTotalSupply.value = response.tokens.total_supply
        // pass daily minted
        wxmTokenDailyMinted.value = response.tokens.daily_minted
        // pass circulating supply
        wxmTokenCirculatingSupply.value = response.tokens.circulating_supply
        // pass wxmToken contract url
        wxmTokenContractUrl.value = response.contracts.token_url
        // pass weather station data
        weatherStationsOnboarded = response.weather_stations.onboarded
        weatherStationsClaimed = response.weather_stations.claimed
        weatherStationsActive = response.weather_stations.active

        // pass last update
        lastUpdated.value = response.last_updated
        loading.value = false
      })
      .catch(() => {
        loading.value = false
        showNoInternetComponent.value = true
      })
  }

  const handlePaging = () => {
    window.addEventListener('popstate', () => {
      if (display.value.smAndDown && route.fullPath === '/stats') {
        mobileStore.setPageState(false)
        navigateTo('/')
      }
    })
  }
  const calcLineChartData = (array: LineChartData[]) => {
    return array.map((day: LineChartData) => {
      return day.value
    })
  }

  const calcLastAndProgress = (array: LineChartData[]) => {
    // get last & second to last values
    const lastDay = array[array.length - 1].value
    const secondToLast = array[array.length - 2].value

    // format numbers
    return {
      lastValue: numberFormater.nFormatter(lastDay),
      progress: numberFormater.nFormatter(lastDay - secondToLast)
    }
  }

  const calcChartLabels = (array: LineChartData[]) => {
    return [dayjs(array[0].ts).format('MMM DD'), dayjs(array[array.length - 1].ts).format('MMM DD')]
  }

  const calc30DaysTotal = (array: LineChartData[]) => {
    return array[array.length - 1].value - array[0].value
  }

  const reloadComponent = () => {
    fillData()
  }
</script>

<template>
  <VCard class="w-100 h-100" :color="display.smAndDown ? `background` : `blueTint`">
    <!--------------- Card header -------------->
    <CardHeader />
    <!--------------- Main Content -------------->
    <VCardText class="ma-0 pa-0 h-100 w-100">
      <VCard
        height="100%"
        class="w-100"
        color="background"
        elevation="0"
        style="
          border-top-left-radius: 32px;
          border-top-right-radius: 32px;
          border-bottom-left-radius: 0px;
          border-bottom-right-radius: 0px;
        "
      >
        <MobileHeader />

        <VCardText class="ma-0 pa-0">
          <!------- Loading lottie ------>
          <div
            v-if="loading"
            class="h-100 w-100 d-flex align-center justify-center"
            :style="animationContainerHeight"
          >
            <LottieComponent :lottie-name="'loaderLight'" :bold-text="''" :light-text="''" />
          </div>

          <!------- No internet component ------>
          <div
            v-if="!loading && showNoInternetComponent"
            class="h-100 w-100 d-flex align-center justify-center"
            :style="errorContainerHeight"
          >
            <NoInternetComponent
              :bold-text="boldText"
              :light-text="lightText"
              @reload-component="reloadComponent"
            />
          </div>

          <div
            v-if="!loading && !showNoInternetComponent"
            :class="display.smAndDown ? `pa-5` : `pa-4`"
          >
            <MainnetBanner v-if="mainnetShowFlag"></MainnetBanner>
            <!-------- Data days -------->
            <DataDays
              :data-days-chart-data="dataDaysChartData"
              :data-days-last-and-progress="dataDaysLastAndProgress"
              :data-days-chart-labels="dataDaysChartLabels"
              :data-days30-days-total="dataDays30DaysTotal"
            />
            <!------ Tottal allocated rewards ------>
            <Rewards
              :rewards-chart-data="rewardsChartData"
              :rewards-last-and-progress="rewardsLastAndProgress"
              :rewards-chart-labels="rewardsChartLabels"
              :rewards30-days-total="rewards30DaysTotal"
              :rewards-last-run-url="rewardsLastRunUrl"
              :rewards-contract-url="rewardsContractUrl"
            />
            <!------ Shop card ------>
            <ShopCard :avg-monthly="avgMonthly" />
            <!------ WXM Token ------>
            <WXMToken
              :wxm-token-total-supply="wxmTokenTotalSupply"
              :wxm-token-daily-minted="wxmTokenDailyMinted"
              :wxm-token-circulating-supply="wxmTokenCirculatingSupply"
              :wxm-token-contract-url="wxmTokenContractUrl"
            />
            <!-------------------- Weather station ------------------>
            <WeatherStations
              :weather-stations-onboarded="weatherStationsOnboarded"
              :weather-stations-claimed="weatherStationsClaimed"
              :weather-stations-active="weatherStationsActive"
            />
            <!------ Contact ------>
            <ContactCard />
            <!------ Last updated footer ------>
            <LastUpdatedFooter :last-updated="lastUpdated" />
          </div>
        </VCardText>
      </VCard>
    </VCardText>
  </VCard>
</template>
