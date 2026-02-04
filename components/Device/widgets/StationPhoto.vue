<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import type { Device } from '~/components/common/types/common'

  interface Props {
    device?: Device
  }

  const props = defineProps<Props>()
  const imageError = ref(false)

  const photoUrl = computed(() => {
    const url = props.device?.photoUrl
    return typeof url === 'string' ? url.trim() : ''
  })

  const showSection = computed(() => photoUrl.value.length > 0 && !imageError.value)

  watch(
    () => props.device?.photoUrl,
    () => {
      imageError.value = false
    },
  )

  const handleImageError = () => {
    imageError.value = true
  }
</script>

<template>
  <div v-if="showSection">
    <h5
      :class="[
        'd-flex justify-space-between align-center w-100 mb-4 mx-4 mt-4',
        'text-body-1 text-darkestBlue font-weight-bold',
      ]"
    >
      Station Photo
    </h5>
    <VCard
      rounded="xl"
      class="ma-4 mt-2 overflow-hidden"
      elevation="0"
      color="layer1"
    >
      <VCardText class="pa-0">
        <div :style="{ height: '160px', width: '100%' }">
          <img
            :src="photoUrl"
            alt="Station photo"
            :style="{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center top',
              display: 'block',
            }"
            @error="handleImageError"
          />
        </div>
      </VCardText>
    </VCard>
  </div>
</template>
