<script setup lang="ts">
  import NoDataIcon from './NoDataIcon.vue'

  const errorMessage = ref('Station offline')
  const noDataHeader = ref('No Data')
  const noDataText =
    ref(`We're unable to show updated station data. Please make sure your station is operational
            and connected to the internet`)
</script>

<template>
  <VSheet rounded="xl" color="errorTint" class="pt-0">
    <VSheet color="top" rounded="xl" class="pa-5">
      <div class="d-flex align-center" style="height: 130px">
        <!------------------ No data icon ----------------->
        <div class="d-flex justify-center d-inline">
          <NoDataIcon />
        </div>
        <div class="d-inline pl-5">
          <!------------------ Relevant text ----------------->
          <div class="text-h6 font-weight-bold text-text">{{ noDataHeader }}</div>
          <div class="text-caption font-weight-regular text-text">
            {{ noDataText }}
          </div>
        </div>
      </div>
    </VSheet>
    <div class="pl-2 py-3 d-flex align-center">
      <!------------------ Error icon ----------------->
      <div class="d-flex align-center">
        <img src="~/assets/Error.svg" />
      </div>
      <!------------------ Error Message ----------------->
      <div class="pl-2 text-subtitle-2 font-weight-bold text-text">
        {{ errorMessage }}
      </div>
    </div>
  </VSheet>
</template>
