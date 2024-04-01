<script setup lang="ts">
  import _ from 'lodash'
  import { useDisplay, useTheme } from 'vuetify'
  import { reactive, computed, ref } from 'vue'
  import type { SearchResultDevice, SearchResultLocation } from '../types/mapbox'
  import Settings from './Settings.vue'
  import ResultsComponent from './SearchBarWidgets/ResultsComponent.vue'
  import SettingsButton from './SettingsWidgets/SettingsButton.vue'
  import { useMapboxStore } from '~/stores/mapboxStore'
  import localStorage from '~/cache/localStorage'
  import wxmApi from '~/api/wxmApi'

  const { trackGAevent } = useGAevents()
  const display = ref(useDisplay())
  const theme = useTheme()
  const mapboxStore = useMapboxStore()
  const showSettings = ref(false)
  const loading = ref(false)
  const textFieldLabel = ref('Search station name or address')
  const textFieldModel = ref('')
  const searchInterval = ref(500)
  //  results starting state
  const searchResults = ref({ devices: [], addresses: [] })
  const showResults = ref(false)
  const showErrorMessage = ref(false)
  const showEmptyRecent = ref(false)
  // recent results starting state
  const showRecentResults = ref(false)
  const recentResults = reactive(
    localStorage.get('recentResults') ?? {
      devices: [],
      addresses: []
    }
  )
  // arrow functionality
  const downArrowEvent = ref({})
  const upArrowEvent = ref({})
  const enterEvent = ref({})

  // compute styles
  const searchBarStyles = computed(() => {
    return display.value.smAndDown
      ? {
          position: 'absolute',
          width: 'calc(100% - 40px)',
          right: 'calc(50% - calc(50% - 20px))',
          top: '20px',
          zIndex: 9
        }
      : {
          position: 'absolute',
          right: '20px',
          top: '20px',
          zIndex: 9,
          width: '460px'
        }
  })

  // handle user's inputs
  let timer: any = null
  const handleTextFieldInput = (userInput: string) => {
    // check user's input to handle results/recent results
    if (userInput.length > 0 && userInput.length < 2) {
      showRecentResults.value = false
      showErrorMessage.value = false
      showEmptyRecent.value = false
      if (!_.isEmpty(searchResults.value.devices) || !_.isEmpty(searchResults.value.addresses)) {
        showResults.value = true
      }
    }
    if (userInput.length === 0) {
      showResults.value = false
      showErrorMessage.value = false
      searchResults.value = {
        addresses: [],
        devices: []
      }
      handleEmptyRecent()
    }

    // checks user's input to make request
    if (userInput.length >= 2) {
      clearTimeout(timer)
      // start counting
      timer = setTimeout(async () => {
        // check user's input
        if (!_.isEmpty(textFieldModel.value)) {
          // show loading icon
          loading.value = true
          showRecentResults.value = false
          // w8 to fetch results
          await wxmApi
            .getSearchResults(userInput.trim())
            .then((response) => {
              // check if the user has already cleared the input field
              if (!_.isEmpty(textFieldModel.value)) {
                // if not check the response for empty lists
                if (_.isEmpty(response.devices) && _.isEmpty(response.addresses)) {
                  throw new Error('empty lists')
                } else {
                  // if not empty show result
                  searchResults.value = response
                  showErrorMessage.value = false
                  showResults.value = true
                }
                // hide loading icon
                loading.value = false
              } else {
                // else hide loading icon
                loading.value = false
              }
            })
            .catch(() => {
              // if request fail show error message
              if (userInput.length !== 0) {
                searchResults.value = {
                  addresses: [],
                  devices: []
                }
                showResults.value = false
                showEmptyRecent.value = false
                loading.value = false
                showErrorMessage.value = true
              }
            })
        }
      }, searchInterval.value)
    }
  }

  // handle user's clicks on tect field
  const handleTextFieldClick = () => {
    handleEmptyRecent()
    handleResultsState()
  }

  const handleResultsState = () => {
    const resultsIsEmpty =
      !_.isEmpty(searchResults.value.devices) || !_.isEmpty(searchResults.value.addresses)
    if (resultsIsEmpty && !_.isEmpty(textFieldModel.value)) {
      showResults.value = true
    }
  }

  // check if the recent lists are empty
  const handleEmptyRecent = () => {
    const recentResultsIsEmpty =
      !_.isEmpty(recentResults.devices) || !_.isEmpty(recentResults.addresses)
    if (recentResultsIsEmpty && _.isEmpty(textFieldModel.value)) {
      showErrorMessage.value = false
      showRecentResults.value = true
    } else if (!recentResultsIsEmpty && _.isEmpty(textFieldModel.value)) {
      showEmptyRecent.value = true
    }
  }

  // reset vars to starting point
  const clearInput = () => {
    showErrorMessage.value = false
    textFieldModel.value = ''
    showResults.value = false
    searchResults.value = {
      addresses: [],
      devices: []
    }
    handleEmptyRecent()
  }

  // check for any error message , if not pass the event
  const highlightNext = (e: KeyboardEvent) => {
    if (showErrorMessage.value === false) {
      downArrowEvent.value = e
    }
  }
  const highlightPrevious = (e: KeyboardEvent) => {
    if (showErrorMessage.value === false) {
      upArrowEvent.value = e
    }
  }

  const selectResult = (e: KeyboardEvent) => {
    if (showErrorMessage.value === false) {
      enterEvent.value = e
    }
  }

  // hande results visibility
  const closeResults = () => {
    showErrorMessage.value = false
    showEmptyRecent.value = false
    showResults.value = false
    showRecentResults.value = false
  }

  // handle settings component
  const handleSettings = () => {
    showSettings.value === false ? (showSettings.value = true) : (showSettings.value = false)
  }

  // add address to recent addresses list flow
  const addToRecentAddresses = (selectedAddress: SearchResultLocation) => {
    // check if the selected address is already in recent list
    if (!_.find(recentResults.addresses, { place: selectedAddress.place })) {
      // if not check the list length
      if (recentResults.addresses.length <= 4) {
        // push the address
        recentResults.addresses.unshift(selectedAddress)
      } else {
        // or shift the first items and then push the address
        recentResults.addresses.pop()
        recentResults.addresses.unshift(selectedAddress)
      }
      // store the updated recents
      localStorage.set(`recentResults`, recentResults)
    }

    // track GA event
    trackGAevent('clickOnResultOnNetworkSearch', {
      ITEM_ID: 'search',
      ITEM_LIST_ID: 'location'
    })

    // propagate address
    mapboxStore.setSearchedAddressToFly(selectedAddress)

    // clear input field
    clearInput()
  }

  // add device to recent devices list flow
  const addToRecentDevices = (selectedDevice: SearchResultDevice) => {
    // check if the selected device is already in recent list
    if (!_.find(recentResults.devices, { id: selectedDevice.id })) {
      // if not check the list length
      if (recentResults.devices.length <= 4) {
        // push the device
        recentResults.devices.unshift(selectedDevice)
      } else {
        // or shift the first items and then push the device
        recentResults.devices.pop()
        recentResults.devices.unshift(selectedDevice)
      }

      // store the updated recents
      localStorage.set(`recentResults`, recentResults)
    }
    // track ga event
    trackGAevent('clickOnResultOnNetworkSearch', {
      ITEM_ID: 'search',
      ITEM_LIST_ID: 'station'
    })

    // propagate device to parent component
    mapboxStore.setSearchedDeviceToFly(selectedDevice)
    // clear input field
    clearInput()
  }

  // pass data to parent component
  const passSelectedAddressToExplorer = (selectedAddress: SearchResultLocation) => {
    // track ga event
    trackGAevent('clickOnResultOnNetworkSearch', {
      ITEM_ID: 'recent',
      ITEM_LIST_ID: 'location'
    })
    showRecentResults.value = false
    mapboxStore.setSearchedAddressToFly(selectedAddress)
  }
  // pass data to parent component
  const passSelectedDeviceToExplorer = (selectedDevice: SearchResultDevice) => {
    // track ga event
    trackGAevent('clickOnResultOnNetworkSearch', {
      ITEM_ID: 'recent',
      ITEM_LIST_ID: 'station'
    })
    showRecentResults.value = false
    mapboxStore.setSearchedDeviceToFly(selectedDevice)
  }
</script>

<template>
  <div :style="searchBarStyles" class="d-flex align-start">
    <VForm
      class="ma-0 pa-0"
      style="width: 100%"
      @submit.prevent="handleTextFieldInput(textFieldModel)"
    >
      <VRow class="ma-0 pa-0">
        <VCol class="ma-0 pa-0" cols="12">
          <VSheet class="d-flex align-center pr-0" color="transparent" rounded="xl">
            <v-text-field
              v-model="textFieldModel"
              v-click-outside="closeResults"
              density="compact"
              variant="solo"
              bg-color="top"
              rounded
              single-line
              hide-details
              @focus="handleTextFieldClick"
              @input="handleTextFieldInput(textFieldModel)"
              @keydown.down.prevent="highlightNext"
              @keydown.up.prevent="highlightPrevious"
              @keydown.enter.prevent="selectResult"
              @keydown.esc.prevent="closeResults"
            >
              <template #label>
                <div class="text-truncate">
                  {{ textFieldLabel }}
                </div>
              </template>
              <template #prepend-inner>
                <!--------------- Logo -------------->
                <div v-if="display.smAndDown">
                  <div
                    v-if="theme.global.name.value === 'dark'"
                    id="darkLogo"
                    class="d-flex align-center pr-3"
                  >
                    <img src="~/assets/XM_logo_dark.svg" alt="image" />
                  </div>
                  <div
                    v-if="theme.global.name.value === 'light'"
                    id="logo"
                    class="d-flex align-center pr-3"
                  >
                    <img src="~/assets/XM_logo.svg" alt="image" />
                  </div>
                </div>
              </template>
              <template #append-inner>
                <div class="d-flex align-center">
                  <v-progress-circular
                    v-if="loading"
                    class="mr-4"
                    :width="3"
                    color="primary"
                    indeterminate
                    size="20"
                  ></v-progress-circular>
                  <div
                    v-if="textFieldModel.length !== 0"
                    style="font-size: 19px; cursor: pointer"
                    class="d-flex align-center"
                  >
                    <i class="fa-solid fa-xmark" :class="'text-darkGrey '" @click="clearInput"></i>
                  </div>
                </div>
              </template>
            </v-text-field>
            <SettingsButton @handle-settings="handleSettings" />
          </VSheet>
          <ResultsComponent
            :results="searchResults"
            :show-results="showResults"
            :recent-results="recentResults"
            :show-recent-results="showRecentResults"
            :show-error-message="showErrorMessage"
            :show-empty-recent="showEmptyRecent"
            :users-input="textFieldModel"
            :down-arrow-event="downArrowEvent"
            :up-arrow-event="upArrowEvent"
            :enter-event="enterEvent"
            @add-to-recent-addresses="addToRecentAddresses"
            @add-to-recent-devices="addToRecentDevices"
            @pass-selected-address-to-explorer="passSelectedAddressToExplorer"
            @pass-selected-device-to-explorer="passSelectedDeviceToExplorer"
          />
          <Settings :show-settings="showSettings" @close-settings="showSettings = false" />
        </VCol>
      </VRow>
    </VForm>
  </div>
</template>

<style>
  .v-text-field--rounded > .v-input__control > .v-input__slot {
    padding: 0 16px !important;
  }
</style>
