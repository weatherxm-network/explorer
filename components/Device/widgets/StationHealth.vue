<script setup lang="ts">
  import qodGreen from '~/assets/metrics/qod-green.svg'
  import qodOrange from '~/assets/metrics/qod-orange.svg'
  import qodRed from '~/assets/metrics/qod-red.svg'
  import qodGrey from '~/assets/metrics/qod-grey.svg'

  import polGreen from '~/assets/metrics/pol-green.svg'
  import polOrange from '~/assets/metrics/pol-orange.svg'
  import polGrey from '~/assets/metrics/pol-grey.svg'
  import polRed from '~/assets/metrics/pol-red.svg'
  import type { Device } from '~/components/common/types/common'

  interface Props {
    loading?: boolean
    device?: Device
    address: string
    sheetElemRef: HTMLElement | undefined
  }

  const props = withDefaults(defineProps<Props>(), {
    loading: false,
    device: () => ({}) as Device,
  })

  const qodIcon = computed(() => {
    if (!props.device.metrics.qod_score) return qodGrey
    if (props.device.metrics.qod_score < 20) return qodRed
    if (props.device.metrics.qod_score < 80) return qodOrange
    return qodGreen
  })

  const polIcon = computed(() => {
    if (
      !props.device.metrics.pol_reason &&
      !props.device.metrics.qod_score &&
      !props.device.metrics.ts
    )
      return polGrey
    if (props.device.metrics.pol_reason === 'NO_LOCATION_DATA') return polRed
    if (props.device.metrics.pol_reason === 'LOCATION_NOT_VERIFIED')
      return polOrange
    return polGreen
  })

  const polStatus = computed(() => {
    if (
      !props.device.metrics.pol_reason &&
      !props.device.metrics.qod_score &&
      !props.device.metrics.ts
    )
      return 'Pending verification'
    if (props.device.metrics.pol_reason === 'NO_LOCATION_DATA')
      return 'No location data'
    if (props.device.metrics.pol_reason === 'LOCATION_NOT_VERIFIED')
      return 'Not verified'
    return 'Verified'
  })
</script>
<template>
  <div v-if="!props.loading" class="w-100 pa-4">
    <h5
      :class="[
        'd-flex justify-space-between align-center w-100 mb-4',
        'text-body-1 text-darkestBlue font-weight-bold',
      ]"
    >
      Station Health
      <div>
        <v-bottom-sheet contained :scrim="false">
          <template #activator="{ props: activatorProps }">
            <i v-bind="activatorProps" class="fa-regular fa-circle-info" />
          </template>

          <div class="bg-layer1 pa-6 rounded-t-xl">
            <div
              class="bg-outline mx-auto mb-6"
              :style="{ height: '4px', width: '32px' }"
            ></div>
            <h5
              :class="[
                'd-flex justify-space-between align-center w-100 mb-4',
                'text-h6 font-weight-bold',
              ]"
            >
              Station Health
            </h5>

            <div>
              <h6 class="text-body-1 font-weight-bold">Data Quality</h6>
              <p class="text-body-2 mt-1">
                The network’s effectiveness relies on meaningful, usable data,
                measured by the Quality-of-Data (QoD) score, which
                <strong>updates daily</strong>. This score motivates weather
                station owners to follow guidelines for optimal data quality. A
                station’s daily reward is tied to its QoD, calculated using an
                open-source algorithm that assesses data quality and provides a
                confidence level in the data received.
              </p>
            </div>

            <div class="mt-4">
              <h6 class="text-body-1 font-weight-bold">Location Quality</h6>
              <p class="text-body-2 mt-1">
                It is crucial for the Network that a station stays in the same
                location throughout its lifetime. The Proof-of-Location
                algorithm, which also <strong>updates daily</strong>, assesses
                the accuracy and consistency of the station’s location data,
                generating a confidence score for its position.
              </p>
            </div>
            <button class="w-100 bg-top mt-4"></button>
          </div>
        </v-bottom-sheet>
      </div>
    </h5>

    <div class="d-flex justify-between align-center ga-2 w-100">
      <div class="bg-blueTint px-4 py-3 w-50 rounded-xl">
        <h6 class="text-darkestBlue font-weight-bold text-caption">
          Data Quality Score
        </h6>
        <div class="d-flex justify-between align-center ga-2">
          <img :src="qodIcon" :style="{ width: '18px', height: '18px' }" />
          <span v-if="props.device.metrics.qod_score" class="font-weight-bold">
            {{ props.device.metrics.qod_score }}%
          </span>
        </div>
      </div>
      <div class="bg-blueTint px-4 py-3 w-50 rounded-xl">
        <h6
          class="text-darkestBlue font-weight-bold text-caption text-truncate"
        >
          {{ props.address }}
        </h6>
        <div class="d-flex justify-between align-center ga-2">
          <img :src="polIcon" :style="{ width: '18px', height: '18px' }" />
          <span class="font-weight-bold">{{ polStatus }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
