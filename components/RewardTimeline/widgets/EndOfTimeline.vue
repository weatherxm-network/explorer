<script setup lang="ts">
  const endOfTimeline = ref("You've reached the end of the Timeline.")
</script>
<template>
  <div class="w-100">
    <div class="ps-7 d-flex justify-start align-center w-100">
      <div class="d-flex flex-column align-center" style="width: 12px">
        <VSheet style="height: 26px; width: 4px" color="mediumGrey" rounded="0" />
        <VSheet style="height: 12px; width: 12px" color="mediumGrey" rounded="circle" />
        <VSheet style="height: 26px; width: 4px" color="mediumGrey" rounded="0" />
      </div>
    </div>
    <VCard color="top" class="pa-6 mx-2" rounded="xl" elevation="2">
      <div class="d-flex align-center text-darkGrey">
        <span class="me-2" style="font-size: 20px"><i class="fa-solid fa-hexagon-check"></i></span>
        <span class="text-body-2">{{ endOfTimeline }}</span>
      </div>
    </VCard>
  </div>
</template>
