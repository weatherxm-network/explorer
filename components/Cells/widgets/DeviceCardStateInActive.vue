<script setup lang="ts">
  import NoDataIcon from './NoDataIcon.vue'

  const noDataHeader = ref('No Data')
  const noDataText =
    ref(`We're unable to show updated station data. Please make sure your station is operational
            and connected to the internet`)
</script>

<template>
  <VSheet rounded="xl" color="errorTint" class="pt-0">
    <VSheet color="top" rounded="xl" class="px-5">
      <div class="d-flex align-center" style="height: 130px">
        <!------------------ No data icon ----------------->
        <div class="d-flex justify-center d-inline">
          <NoDataIcon />
        </div>
        <div class="d-inline pl-5">
          <!------------------ Relevant text ----------------->
          <div class="text-h6 font-weight-bold text-text">
            {{ noDataHeader }}
          </div>
          <div class="text-caption font-weight-regular text-text">
            {{ noDataText }}
          </div>
        </div>
      </div>
    </VSheet>
  </VSheet>
</template>
