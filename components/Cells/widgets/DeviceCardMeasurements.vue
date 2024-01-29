<script setup lang="ts">
  interface MeasurementMetadata {
    measurement: string
    icon: string
    unit: string
    key: string
  }

  interface WindDirConditionalRenderingMetadata {
    value: string
    unit: string
  }

  interface Props {
    measurementMetadata?: MeasurementMetadata
    unit?: string
    deviceMeasurementValue?: string
    windDirConditionalRendering?: WindDirConditionalRenderingMetadata
  }

  const props = withDefaults(defineProps<Props>(), {
    measurementMetadata: () => ({
      measurement: '',
      icon: '',
      unit: '',
      key: ''
    }),
    unit: '',
    deviceMeasurementValue: '',
    windDirConditionalRendering: () => ({
      value: '',
      unit: ''
    })
  })
</script>

<template>
  <div class="pl-4 d-flex align-center">
    <!---------------------------- Font awesome icon ------------------------------->
    <div
      class="text-h6 d-inline text-darkestBlue d-flex justify-center align-center"
      style="width: 22px; height: 33px"
    >
      <i :class="props.measurementMetadata.icon"></i>
    </div>
    <div class="d-inline">
      <!---------------------------- Measurement name ------------------------------->
      <div
        class="pl-3 text-caption font-weight-bold text-darkestBlue text-truncate"
        style="margin-bottom: -6px; max-width: 100%"
      >
        {{ props.measurementMetadata.measurement }}
      </div>
      <!---------------------------- Measurement value ------------------------------->
      <div class="font-weight-bold pl-3 d-flex align-baseline pt-1">
        <span lass=" text-body-2 text-text">{{ props.deviceMeasurementValue }} </span>
        <!---------------------------- Measurement unit ------------------------------->
        <span class="pl-1 text-caption text-mediumGray">
          {{ props.unit === 'mm' || props.unit === 'in' ? `${props.unit}/h` : `${props.unit}` }}
          <!------------ Conditional rendering for wind dir ----------->
          <span>{{
            props.windDirConditionalRendering.unit === '°'
              ? `${props.windDirConditionalRendering.value}°`
              : props.windDirConditionalRendering.value
          }}</span>
        </span>
      </div>
    </div>
  </div>
</template>
