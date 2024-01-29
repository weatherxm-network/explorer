<script setup lang="ts">
  import _ from 'lodash'
  import { useDisplay, useTheme } from 'vuetify'
  import type { Results, SearchResultDevice, SearchResultLocation } from '../../types/mapbox'
  import ResultComponent from './ResultComponent.vue'

  interface Props {
    downArrowEvent?: any
    upArrowEvent?: any
    enterEvent?: any
    results?: Results
    recentResults?: Results
    showResults?: boolean
    showRecentResults?: boolean
    showErrorMessage?: boolean
    showEmptyRecent?: boolean
    usersInput?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    downArrowEvent: () => ({}),
    upArrowEvent: () => ({}),
    enterEvent: () => ({}),
    results: () => ({
      addresses: [],
      devices: []
    }),
    recentResults: () => ({
      addresses: [],
      devices: []
    }),
    showResults: false,
    showRecentResults: false,
    showErrorMessage: false,
    showEmptyRecent: false,
    usersInput: ''
  })

  const emit = defineEmits([
    'addToRecentAddresses',
    'passSelectedAddressToExplorer',
    'addToRecentDevices',
    'passSelectedDeviceToExplorer'
  ])

  const display = useDisplay()
  const theme = useTheme()

  const windowHeight = ref(window.innerHeight)
  const errorMessageBold = ref('No results found')
  const errorMessageLight = ref('Try searching for something else or check for spelling mistakes')
  const emptyRecentBold = ref('No recent search results')
  const emptyRecentLight = ref('Search for station name or address.')
  const emptyRecentLight2 = ref('Most recent results appear here.')
  const highlightedIndex = ref(-1)
  const recentTitle = ref('Recent')

  const topColor = computed(() => {
    return theme.current.value.colors.top
  })

  const layer1Color = computed(() => {
    return theme.current.value.colors.layer1
  })

  // check if the device is recent or not then check list boundaries (last result)
  watch(
    () => props.downArrowEvent,
    () => {
      if (props.showResults === true) {
        if (
          highlightedIndex.value <
          [...props.results.devices, ...props.results.addresses].length - 1
        ) {
          highlightedIndex.value += 1
        }
      } else if (props.showRecentResults === true) {
        if (
          highlightedIndex.value <
          [...props.recentResults.devices, ...props.recentResults.addresses].length - 1
        ) {
          highlightedIndex.value += 1
        }
      }
    }
  )

  // check list boundaries (first result)
  watch(
    () => props.upArrowEvent,
    () => {
      if (highlightedIndex.value > 0) {
        highlightedIndex.value -= 1
      }
    }
  )

  // handle enter event
  watch(
    () => props.enterEvent,
    () => {
      //  check if the device is recent or not then emit event based on result type
      props.showResults
        ? getResult([...props.results.devices, ...props.results.addresses][highlightedIndex.value])
        : getResult(
            [...props.recentResults.devices, ...props.recentResults.addresses][
              highlightedIndex.value
            ]
          )
    }
  )

  const onResize = () => {
    windowHeight.value = window.innerHeight
  }

  // check current index if equals hightlightedIndex
  const isCurrentIndex = (index: number) => {
    return index === highlightedIndex.value
  }

  // check if the result is nil then emit event based on result type
  const getResult = (result: SearchResultDevice | SearchResultLocation) => {
    if (!_.isNil(result)) {
      if ('id' in result) {
        getSelectedDevice(result)
      } else if ('place' in result) {
        getSelectedAddress(result)
      }
    }
  }

  // check if the device is recent or not then emit event to pass address to parent component
  const getSelectedAddress = (selectedAddress: SearchResultLocation) => {
    highlightedIndex.value = -1
    props.showResults === true
      ? emit('addToRecentAddresses', selectedAddress)
      : emit('passSelectedAddressToExplorer', selectedAddress)
  }

  // check if the device is recent or not then emit event to pass device to parent component
  const getSelectedDevice = (selectedDevice: SearchResultDevice) => {
    highlightedIndex.value = -1
    props.showResults === true
      ? emit('addToRecentDevices', selectedDevice)
      : emit('passSelectedDeviceToExplorer', selectedDevice)
  }

  onBeforeMount(() => {
    window.removeEventListener('resize', onResize())
  })

  onMounted(async () => {
    await nextTick(() => {
      window.addEventListener('resize', onResize())
    })
  })
</script>

<template>
  <div>
    <!-------------- Error message / Empty recent ------------->
    <div
      v-if="showErrorMessage"
      :style="{ background: topColor }"
      class="pa-4 mt-2 elevation-4"
      style="border-radius: 16px"
    >
      <div class="pa-5">
        <div class="mb-2 text-h6 d-flex justify-center text--text" style="font-weight: 700">
          {{ errorMessageBold }}
        </div>
        <div class="text-body-2 d-flex justify-center text--text text-center">
          <div :style="!display.smAndDown ? { width: '70%' } : {}">
            {{ errorMessageLight }}
          </div>
        </div>
      </div>
    </div>

    <!------------------- Empty recent -------------------->
    <div
      v-if="showEmptyRecent"
      :style="{ background: topColor }"
      style="border-radius: 16px"
      class="pa-4 mt-2 elevation-4"
    >
      <div class="text-h6 pb-4 px-2" style="font-weight: 700">{{ recentTitle }}</div>
      <div class="pa-5">
        <div class="mb-2 text-h6 d-flex justify-center text--text" style="font-weight: 700">
          {{ emptyRecentBold }}
        </div>
        <div class="text-body-2 text--text d-flex justify-center">
          <div
            class="d-flex flex-column text-center"
            :style="!display.smAndDown ? { width: '70%' } : {}"
          >
            {{ emptyRecentLight }}<br />
            {{ emptyRecentLight2 }}
          </div>
        </div>
      </div>
    </div>

    <!------------------- Results -------------------->
    <v-card
      v-if="showResults"
      class="pa-0 ma-0 mt-2 scroll"
      color="top"
      style="border-radius: 16px; overflow-y: scroll"
      elevation="4"
      :max-height="windowHeight - 76"
    >
      <v-list bg-color="top" class="pb-4 pt-4 px-4">
        <!------------------- Results -------------------->
        <div
          v-for="(result, index) in [...results.devices, ...results.addresses]"
          :key="index"
          class="pt-2 pb-2 d-flex align-center"
          style="height: 64px; border-radius: 8px"
          :style="isCurrentIndex(index) ? { 'background-color': layer1Color } : {}"
          @mouseover="highlightedIndex = index"
          @click="getResult(result)"
        >
          <v-list-item-title>
            <ResultComponent :result="result" :users-input="usersInput" />
          </v-list-item-title>
        </div>
      </v-list>
    </v-card>
    <!-------------------- Recent results ------------------>
    <v-card
      v-if="showRecentResults"
      class="pa-0 ma-0 mt-2 scroll"
      color="top"
      style="border-radius: 16px; overflow-y: scroll"
      elevation="4"
      :max-height="windowHeight - 76"
    >
      <v-list bg-color="top" class="pb-4 pt-4 px-4">
        <!---------- Header --------->
        <div class="text-h6 pb-2 px-6" style="font-weight: 700">{{ recentTitle }}</div>
        <!------------------- recentResults -------------------->
        <div
          v-for="(result, index) in [...recentResults.devices, ...recentResults.addresses]"
          :key="index"
          class="pt-2 pb-2 px-2 d-flex align-center"
          style="height: 64px; border-radius: 8px"
          :style="isCurrentIndex(index) ? { 'background-color': layer1Color } : {}"
          @mouseover="highlightedIndex = index"
          @click="getResult(result)"
        >
          <v-list-item-title>
            <ResultComponent :result="result" />
          </v-list-item-title>
        </div>
      </v-list>
    </v-card>
  </div>
</template>

<style scoped>
  .v-card::-webkit-scrollbar {
    display: none;
  }

  /* Hide scrollbar for IE, Edge and Firefox */
  .v-card {
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
  }
</style>
