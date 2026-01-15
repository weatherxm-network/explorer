<script setup lang="ts">
  import { useDisplay } from 'vuetify'
  import { onMounted, computed, reactive } from 'vue'

  import LottieComponent from '../common/LottieComponent.vue'
  import NoInternetComponent from '../common/NoInternetComponent.vue'

  import CardHeader from './widgets/CardHeader.vue'
  import MobileHeader from './widgets/MobileHeader.vue'
  import NetworkGrowth from './widgets/NetworkGrowth.vue'
  import NetworkHealth from './widgets/NetworkHealth.vue'
  import Rewards from './widgets/Rewards.vue'
  import ShopCard from './widgets/ShopCard.vue'
  import ContactCard from './widgets/ContactCard.vue'
  import LastUpdatedFooter from './widgets/LastUpdatedFooter.vue'

  import wxmApi from '~/api/wxmApi'
  import { useMobileStore } from '~/stores/mobileStore'
  import type { NetworkStatsResponse } from './types/stats'
  import { storeToRefs } from 'pinia'
  import { useDrawerStore } from '~/stores/drawerStore'
  const drawerStore = useDrawerStore()

  const { isDesktopDrawerOpen } = storeToRefs(drawerStore)

  const mobileStore = useMobileStore()
  const display = ref(useDisplay())
  const route = useRoute()
  const loading = ref(true)
  const showNoInternetComponent = ref(false)
  const boldText = ref('SERVICE UNAVAILABLE')
  const lightText = ref(
    'Server busy, site may have moved or you lost your dial-up Internet connection',
  )

  let netHealth: NetworkStatsResponse['net_health'] = reactive(
    {} as NetworkStatsResponse['net_health'],
  )
  let rewards: NetworkStatsResponse['rewards'] = reactive(
    {} as NetworkStatsResponse['rewards'],
  )
  let netGrowth: NetworkStatsResponse['net_growth'] = reactive(
    {} as NetworkStatsResponse['net_growth'],
  )

  const contractUrl = ref('')

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
        netHealth = response.net_health
        rewards = response.rewards
        netGrowth = response.net_growth
        contractUrl.value = response.contracts.rewards_url

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

  const reloadComponent = () => {
    fillData()
  }
</script>

<template>
  <VCard
    v-if="isDesktopDrawerOpen || display.smAndDown"
    class="w-100 h-100"
    :color="display.smAndDown ? `background` : `blueTint`"
  >
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

        <VCardText class="ma-0 pa-0 h-100">
          <!------- Loading lottie ------>
          <div
            v-if="loading"
            class="h-30 w-100 d-flex align-center justify-center"
            :style="animationContainerHeight"
          >
            <LottieComponent
              :lottie-name="'loaderLight'"
              :bold-text="''"
              :light-text="''"
            />
          </div>

          <!------- No internet component ------>
          <div
            v-if="!loading && showNoInternetComponent"
            class="h-30 w-100 d-flex align-center justify-center"
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
            :class="[
              display.smAndDown ? `pa-5` : `pa-4`,
              'h-100 d-flex flex-column justify-start align-stretch',
            ]"
          >
            <!-------- NetworkHealth -------->
            <NetworkHealth :health="netHealth" />

            <!------ Network Growth ----->
            <NetworkGrowth :growth="netGrowth" />

            <!------ Buy Station Card ---->
            <ShopCard />

            <!------ Tottal allocated rewards --->
            <Rewards :rewards="rewards" :contract-url="contractUrl" />

            <!------ Last updated footer ------>
            <LastUpdatedFooter :last-updated="lastUpdated" />

            <!------ Contact ------>
            <ContactCard class="mt-4" />
          </div>
        </VCardText>
      </VCard>
    </VCardText>
  </VCard>
</template>
