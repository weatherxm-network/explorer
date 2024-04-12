<script setup lang="ts">
  import { setOptions, bootstrap } from 'vue-gtag'
  import { useDisplay, useTheme } from 'vuetify'
  import { computed, onMounted, onUnmounted } from 'vue'
  import type { Theme, UnitsUserPrefs } from '../types/mapbox'
  import themeHandler from './SettingsUtils/theme_handler'
  import units from './SettingsUtils/units'
  import { useSettingsStore } from '~/stores/settingsStore'
  import localStorage from '~/cache/localStorage'

  interface Props {
    showSettings?: boolean
  }
  const props = withDefaults(defineProps<Props>(), {
    showSettings: false
  })

  const emits = defineEmits(['closeSettings'])
  const snackbar = useSnackbar()
  const display = ref(useDisplay())
  const currentTheme = useTheme()
  const settingsStore = useSettingsStore()
  const version = ref(useRuntimeConfig().public.version)
  const windowHeight = ref(window.innerHeight)
  const settingsMenuHeader = ref('Settings')
  const displaySectionTitle = ref('Display')
  const displaySectionContentHeader = ref('Theme')
  const weatherUnitsSectionTitle = ref('Weather Units')
  const helpSectionTitle = ref('Help')
  const contactSupportHeader = ref('Contact Support')
  const contactSupportLinkText = ref(`Visit our support portal's knowledge base`)
  const contactSupportBodyText = ref(` or open a new ticket and we'll get back to you as
              soon as possible.`)
  const privacySectionTitle = ref('Privacy')
  const privacySectionBodyText = ref('Collect Anonymous Data')
  const aboutSectionTitle = ref('About')
  const aboutSectionBodyText = ref('App Version')
  // theme options to display
  const theme = ref<Theme>({
    currentTheme: 'light',
    name: 'System',
    options: [`Dark`, `Light`, `System`]
  })

  // default measurements
  const measurements = ref<UnitsUserPrefs>({
    temp: {
      name: `Temperature`,
      defaultUnit: `Celsius (°C)`,
      options: [`Celsius (°C)`, `Fahrenheit (°F)`]
    },
    precipitation: {
      name: `Precipitation`,
      defaultUnit: `Millimeters (mm)`,
      options: [`Millimeters (mm)`, `Inches (in)`]
    },
    wind_speed: {
      name: `Wind Speed`,
      defaultUnit: `Meters per second (m/s)`,
      options: [
        `Meters per second (m/s)`,
        `Kilometers per hour (km/h)`,
        `Miles per hour (mph)`,
        `Knots (kn)`,
        `Beaufort (bf)`
      ]
    },
    wind_direction: {
      name: `Wind Direction`,
      defaultUnit: `Degrees (°)`,
      options: [`Degrees (°)`, `Cardinal (e.g. N, SW, NE, etc)`]
    },
    pressure: {
      name: `Pressure`,
      defaultUnit: `Hectopascal (hPa)`,
      options: [`Hectopascal (hPa)`, `Inch of mercury (inHg)`]
    }
  })
  const privacySwitch = ref(false)

  const smDreakpoint = computed(() => {
    return display.value.smAndDown
  })

  const layer1Color = computed(() => {
    return currentTheme.current.value.colors.layer1
  })

  watch(
    () => props.showSettings,
    () => {
      privacySwitch.value = getTrackingValue()
    }
  )
  watch(privacySwitch, (newValue) => {
    if (newValue === true) {
      enablePlugin()
    } else {
      disablePlugin()
    }
  })

  const onResize = () => {
    windowHeight.value = window.innerHeight
  }
  const includeFunction = () => {
    // visible elements
    const tempArray = [document.querySelector('.included')]
    if (document.querySelector('.v-menu')) {
      // push the element to array when it is visible
      tempArray.push(document.querySelector('.v-menu'))
    }
    return tempArray
  }
  const closeSettings = () => {
    emits('closeSettings')
  }

  const getTheme = () => {
    // get theme from local storage
    settingsStore.setTheme(`${themeHandler.getTheme().currentTheme}`)
    currentTheme.global.name.value = themeHandler.getTheme().currentTheme
    return themeHandler.getTheme()
  }
  const setTheme = () => {
    if (theme.value.name === 'Dark') {
      currentTheme.global.name.value = 'dark'
      settingsStore.setTheme('dark')
      theme.value.currentTheme = `dark`
      themeHandler.setTheme(theme.value)
    } else if (theme.value.name === `Light`) {
      theme.value.currentTheme = `light`
      settingsStore.setTheme('light')
      currentTheme.global.name.value = 'light'
      themeHandler.setTheme(theme.value)
    } else {
      theme.value = themeHandler.getOSTheme()
      if (theme.value.currentTheme === `dark`) {
        currentTheme.global.name.value = 'dark'
        settingsStore.setTheme('dark')
        theme.value.currentTheme = `dark`
        themeHandler.setTheme(theme.value)
      } else {
        theme.value.currentTheme = `light`
        settingsStore.setTheme('light')
        currentTheme.global.name.value = 'light'
        themeHandler.setTheme(theme.value)
      }
    }
  }
  const getUnits = () => {
    if (units.getUnits()) {
      measurements.value = units.getUnits()
      settingsStore.setUnits(`${units.getUnits()}`)
    } else {
      settingsStore.setUnits(measurements.value)
    }
  }
  const setUnits = () => {
    // set units to local storage
    units.setUnits(measurements.value)
    settingsStore.setUnits(measurements.value)
    snackbar.add({
      text: 'Settings Saved!',
      dismissible: false,
      background: '#212121'
    })
  }

  const getTrackingValue = () => {
    return localStorage.get('tracking') ? localStorage.get('tracking') : false
  }
  const disablePlugin = async () => {
    setOptions({
      config: { id: '' }
    })
    await bootstrap()
    localStorage.set('tracking', false)
  }

  const enablePlugin = async () => {
    setOptions({
      config: { id: useRuntimeConfig().public.gtag }
    })
    await bootstrap()
    localStorage.set('tracking', true)
  }

  onMounted(() => {
    window.addEventListener('resize', () => {
      onResize()
    })
    // get units from local storage if any
    getUnits()
    // get theme from local storage if any
    theme.value = getTheme()

    // get tracking value
    privacySwitch.value = getTrackingValue()
  })
  onUnmounted(() => {
    window.removeEventListener('resize', () => {
      onResize()
    })
  })
</script>

<template>
  <div v-if="showSettings">
    <!------------------------------------ Desktop settings menu ------------------------------------>
    <div v-if="!smDreakpoint" class="mt-2">
      <VCard
        v-click-outside="{
          handler: closeSettings,
          include: includeFunction
        }"
        color="top"
        style="border-radius: 16px; overflow-y: scroll"
        class="pa-4 scroll"
        elevation="4"
        :height="windowHeight - 76 < 1082 ? `${windowHeight - 76}px` : '1082'"
      >
        <VCardTitle class="pa-0 pb-4">
          <span class="ml-2 text-text" style="font-weight: 700">{{ settingsMenuHeader }}</span>
        </VCardTitle>
        <VCardText class="pa-0" style="z-index: 99999">
          <!-- -------------------- Display section ---------------------->

          <div
            class="pt-4 pb-1 px-4 mb-4"
            :style="{
              'background-color': layer1Color,
              'borderRadius': '8px'
            }"
          >
            <div class="text-subtitle-1 text-text mb-4" style="font-weight: 700">
              {{ displaySectionTitle }}
            </div>
            <div class="text-subtitle-2 text-darkestBlue" style="font-weight: 700">
              {{ displaySectionContentHeader }}
            </div>
            <VSelect
              v-model="theme.name"
              :hide-details="true"
              variant="underlined"
              density="compact"
              class="ma-0 pa-0 included mb-4"
              :items="theme.options"
              color="darkGrey"
              base-color="darkGrey"
              bg-color="layer1"
              @update:model-value="setTheme"
            >
            </VSelect>
          </div>

          <!-- -------------------- Units section --------------------  -->
          <div
            class="pt-4 pb-4 px-4 mb-4"
            :style="{
              'background-color': layer1Color,
              'borderRadius': '8px'
            }"
          >
            <div class="text-subtitle-1 text--text mb-4" style="font-weight: 700">
              {{ weatherUnitsSectionTitle }}
            </div>

            <div v-for="i in measurements" :key="i.defaultUnit">
              <div class="text-subtitle-2 text-darkestBlue" style="font-weight: 700">
                {{ i.name }}
              </div>
              <VSelect
                v-model="i.defaultUnit"
                :hide-details="true"
                variant="underlined"
                density="compact"
                class="ma-0 pa-0 included mb-4"
                :items="i.options"
                color="darkGrey"
                base-color="darkGrey"
                bg-color="layer1"
                @update:model-value="setUnits"
              ></VSelect>
            </div>
          </div>

          <!---------------------- Help section ---------------------->
          <div
            class="pt-4 pb-4 px-4 mb-4"
            :style="{
              'background-color': layer1Color,
              'borderRadius': '8px'
            }"
          >
            <div class="text-text text-subtitle-1 text--text mb-3" style="font-weight: 700">
              {{ helpSectionTitle }}
            </div>
            <div class="text-darkestBlue text-subtitle-2" style="font-weight: 700">
              {{ contactSupportHeader }}
            </div>
            <div class="mt-2 text-text text-subtitle-2">
              <a
                style="cursor: pointer"
                class="text-decoration-underline"
                @click="
                  navigateTo('https://support.weatherxm.com/hc/en-us', {
                    open: {
                      target: '_blank'
                    }
                  })
                "
              >
                {{ contactSupportLinkText }}
              </a>
              {{ contactSupportBodyText }}
            </div>
          </div>

          <!---------------------- Privacy section ---------------------->
          <div
            class="pt-4 pb-4 px-4 mb-3"
            :style="{
              'background-color': layer1Color,
              'borderRadius': '8px'
            }"
          >
            <div class="text-subtitle-1 text--text mb-1" style="font-weight: 700">
              {{ privacySectionTitle }}
            </div>

            <v-row class="ma-0 pa-0 d-flex justify-space-between align-center">
              <div style="font-size: 0.984rem; font-weight: 700" class="text-text">
                {{ privacySectionBodyText }}
              </div>
              <VSwitch
                v-model="privacySwitch"
                class="ma-0 pa-0 d-flex justify-end"
                inset
                density="compact"
                color="primary"
                :hide-details="true"
                :ripple="false"
              ></VSwitch>
            </v-row>
          </div>

          <!---------------------- About section ---------------------->
          <div
            class="pt-4 pb-4 px-4"
            :style="{
              'background-color': layer1Color,
              'borderRadius': '8px'
            }"
          >
            <div class="text-subtitle-1 text--text" style="font-weight: 700">
              {{ aboutSectionTitle }}
            </div>
            <div class="mt-4 text-darkestBlue text-subtitle-2" style="font-weight: 700">
              {{ aboutSectionBodyText }}
            </div>
            <div class="mt-2 text-text text-subtitle-2">
              {{ version }}
            </div>
          </div>
        </VCardText>
      </VCard>
    </div>

    <!------------------------------------ Mobile settings menu ------------------------------------>

    <VDialog v-model="smDreakpoint" fullscreen style="z-index: 9">
      <VCard color="top">
        <VCardTitle class="px-4 pt-4 pb-4 d-flex justify-space-between">
          <span class="ml-2 text-text">{{ settingsMenuHeader }}</span>
          <i
            class="fa fa-times text-darkGrey pr-4"
            style="cursor: pointer"
            @click="closeSettings"
          ></i>
        </VCardTitle>

        <VCardText class="px-4">
          <!-------------------- Display section ---------------------->
          <div
            class="pt-4 pb-4 px-4 mb-4"
            :style="{
              'background-color': layer1Color,
              'borderRadius': '8px'
            }"
          >
            <div class="text-subtitle-1 text--text mb-4" style="font-weight: 700">
              {{ displaySectionTitle }}
            </div>
            <div class="text-subtitle-2 text-darkestBlue" style="font-weight: 700">
              {{ displaySectionContentHeader }}
            </div>
            <v-select
              v-model="theme.name"
              :hide-details="true"
              variant="underlined"
              density="compact"
              class="ma-0 pa-0 included mb-4"
              :items="theme.options"
              color="darkGrey"
              base-color="darkGrey"
              bg-color="layer1"
              @update:model-value="setTheme"
            >
            </v-select>
          </div>

          <!-- -------------------- Units section -------------------- -->
          <div
            class="pt-4 pb-4 px-4 mb-4"
            :style="{
              'background-color': layer1Color,
              'borderRadius': '8px'
            }"
          >
            <div class="text-text text-subtitle-1 text--text mb-4" style="font-weight: 700">
              {{ weatherUnitsSectionTitle }}
            </div>

            <div v-for="i in measurements" :key="i.defaultUnit">
              <div class="text-subtitle-2 text-darkestBlue" style="font-weight: 700">
                {{ i.name }}
              </div>
              <VSelect
                v-model="i.defaultUnit"
                density="compact"
                class="ma-0 pa-0"
                :items="i.options"
                color="darkGrey"
                base-color="darkGrey"
                bg-color="layer1"
                @update:model-value="setUnits"
              ></VSelect>
            </div>
          </div>

          <!---------------------- Help section ---------------------->
          <div
            class="pt-4 pb-4 px-4 mb-4"
            :style="{
              'background-color': layer1Color,
              'borderRadius': '8px'
            }"
          >
            <div class="text-text text-subtitle-1 text--text mb-3" style="font-weight: 700">
              {{ helpSectionTitle }}
            </div>
            <div class="text-darkestBlue text-subtitle-2" style="font-weight: 700">
              {{ contactSupportHeader }}
            </div>
            <div class="mt-2 text-text text-subtitle-2">
              <a
                style="cursor: pointer"
                class="text-decoration-underline"
                @click="
                  navigateTo('https://support.weatherxm.com/hc/en-us', {
                    open: {
                      target: '_blank'
                    }
                  })
                "
              >
                {{ contactSupportLinkText }}
              </a>
              {{ contactSupportBodyText }}
            </div>
          </div>

          <!---------------------- Privacy section ---------------------->
          <div
            class="pt-4 pb-4 px-4 mb-4"
            :style="{
              'background-color': layer1Color,
              'borderRadius': '8px'
            }"
          >
            <div class="text-subtitle-1 text--text mb-4" style="font-weight: 700">
              {{ privacySectionTitle }}
            </div>

            <VRow class="ma-0 pa-0 d-flex justify-space-between align-center">
              <div style="font-size: 0.984rem; font-weight: 700" class="text-text">
                {{ privacySectionBodyText }}
              </div>
              <VSwitch
                v-model="privacySwitch"
                class="ma-0 pa-0 d-flex justify-end"
                inset
                density="compact"
                color="primary"
                :hide-details="true"
                :ripple="false"
              ></VSwitch>
            </VRow>
          </div>

          <!---------------------- About section ---------------------->
          <div
            class="pt-4 pb-4 px-4"
            :style="{
              'background-color': layer1Color,
              'borderRadius': '8px'
            }"
          >
            <div class="text-text text-subtitle-1 text--text mb-3" style="font-weight: 700">
              {{ aboutSectionTitle }}
            </div>
            <div class="text-darkestBlue text-subtitle-2" style="font-weight: 700">
              {{ aboutSectionBodyText }}
            </div>
            <div class="mt-2 text-text text-subtitle-2">
              {{ version }}
            </div>
          </div>
        </VCardText>
      </VCard>
    </VDialog>
  </div>
</template>

<style>
  /* Hide scrollbar for Chrome, Safari and Opera */
  .v-card::-webkit-scrollbar {
    display: none;
  }

  /* Hide scrollbar for IE, Edge and Firefox */
  .v-card {
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
  }
</style>
