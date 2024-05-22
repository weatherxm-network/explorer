<script setup lang="ts">
  import { computed } from 'vue'
  import { useDisplay, useTheme } from 'vuetify'

  interface Props {
    message?: string
    container?: string
    tooltipTitle?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    message: '',
    container: 'any',
    tooltipTitle: ''
  })

  const { trackGAevent } = useGAevents()
  const rewardMechanishUrl = 'https://docs.weatherxm.com/reward-mechanism'
  const theme = useTheme()
  const display = ref(useDisplay())
  const dialog = ref(false)

  const desktopTooltipTimelineNote = ref('Note that <b>all times and dates are in UTC</b>')
  const desktopTooltopTimelineFooter = ref(
    'You can read more about out reward mechanism in our docs'
  )
  const desktopTooltipRewardsScoreMaxRewardsFooter = ref(
    'You can read more about these factors in our docs'
  )
  const mobileDialogTimelineFooter = ref('You can read more about our reward mechanism')
  const mobileDialogRewardsScoreMaxRewardsFooter = ref(
    ' You can read more about these factors and our reward mechanish'
  )

  const closeButtonText = ref('OK')

  const cellCapacityDocsLink = ref('https://docs.weatherxm.com/project/cell-capacity')

  const tooltipMaxWidth = computed(() => {
    let width
    if (display.value.smAndDown) {
      width = props.container === 'any' ? 300 : 150
    } else {
      width = props.container === 'any' ? 320 : 150
    }
    return width
  })

  const overlayColor = computed(() => {
    return {
      '--background-color': theme.themes.value.dark.colors.background
    }
  })

  const getTheme = computed(() => {
    return theme.global.name.value === 'dark'
  })

  const anchorColor = computed(() => {
    return {
      '--anchor-color': theme.current.value.colors.primary
    }
  })

  const addAlpha = (color: string, opacity: number) => {
    const _opacity = Math.round(Math.min(Math.max(opacity ?? 1, 0), 1) * 255)
    return color + _opacity.toString(16).toUpperCase()
  }

  const calcBackgroundColor = computed(() => {
    return theme.current.value.dark
      ? addAlpha(theme.themes.value.dark.colors.layer2, 0.5)
      : addAlpha(theme.themes.value.light.colors.top, 0.5)
  })
</script>

<template>
  <div>
    <!-- Desktop tooltip-->
    <VTooltip
      v-if="!display.smAndDown"
      location="bottom right"
      :max-width="tooltipMaxWidth"
      class="ma-0 pa-0"
      transition="none"
      :style="overlayColor"
    >
      <template #activator="{ props }">
        <span style="font-size: 12px">
          <i class="fa-light fa-circle-info" :class="'text-text pa-1'" v-bind="props" />
        </span>
      </template>
      <div class="pt-1 pb-1 px-1 text-caption" :class="getTheme ? 'text-text' : 'text-top'">
        <span v-html="props.message" />
        <div v-if="props.tooltipTitle === 'Timeline'">
          <br />
          <div v-html="desktopTooltipTimelineNote"></div>
          <br />
          <div>{{ desktopTooltopTimelineFooter }}</div>
        </div>
        <div v-if="props.tooltipTitle === 'Reward Score' || props.tooltipTitle === 'Max Rewards'">
          <br />
          {{ desktopTooltipRewardsScoreMaxRewardsFooter }}
        </div>
      </div>
    </VTooltip>
    <!-- Mobile tooltip-->
    <div v-if="display.smAndDown" class="text-center">
      <VDialog
        v-model="dialog"
        width="500"
        content-class="rounded-xl"
        overlay-opacity="0.9"
        :overlay-color="overlayColor"
      >
        <template #activator="{ props }">
          <i class="fa-light fa-circle-info" :class="'text-text pa-1'" v-bind="props" />
        </template>
        <VCard :color="props.tooltipTitle === 'Cell Capacity' ? 'layer1' : 'top'" rounded="xl">
          <VCardTitle class="text-text" style="font-weight: 700"
            >{{ props.tooltipTitle }}
          </VCardTitle>
          <VCardText class="text-text text-body-2">
            <span v-html="props.message" />

            <div v-if="props.tooltipTitle === 'Cell Capacity'" class="mt-4">
              <VBtn
                :color="calcBackgroundColor"
                :href="cellCapacityDocsLink"
                target="_blank"
                class="text-none text-primary"
                block
                size="large"
                elevation="0"
                style="letter-spacing: normal; border-radius: 10px"
                @click="trackGAevent('click_on_read_more_button_cell_capacity')"
                >Read More</VBtn
              >
            </div>

            <div v-if="props.tooltipTitle === 'Timeline'">
              <br />
              <div v-html="desktopTooltipTimelineNote"></div>
              <br />
              <div>
                {{ mobileDialogTimelineFooter }}
                <span>
                  <a
                    :href="rewardMechanishUrl"
                    target="_blank"
                    class="text-decoration-none"
                    :style="anchorColor"
                  >
                    here
                    <i class="fa-solid fa-arrow-up-right-from-square"></i> </a
                  >.
                </span>
              </div>
            </div>
            <div
              v-if="props.tooltipTitle === 'Reward Score' || props.tooltipTitle === 'Max Rewards'"
            >
              <br />
              {{ mobileDialogRewardsScoreMaxRewardsFooter }}
              <span>
                <a
                  :href="rewardMechanishUrl"
                  target="_blank"
                  class="text-decoration-none"
                  :style="anchorColor"
                >
                  here
                  <i class="fa-solid fa-arrow-up-right-from-square"></i> </a
                >.
              </span>
            </div>
          </VCardText>
          <VCardActions>
            <VSpacer></VSpacer>
            <VBtn color="top" text @click="dialog = false"
              ><span class="text-primary">{{ closeButtonText }}</span>
            </VBtn>
          </VCardActions>
        </VCard>
      </VDialog>
    </div>
  </div>
</template>

<style>
  .v-tooltip > .v-overlay__content {
    background-color: var(--background-color);
  }
</style>
