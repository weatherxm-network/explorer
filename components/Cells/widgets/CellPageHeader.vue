<script setup lang="ts">
  import { useDisplay } from 'vuetify'
  import { getAddress } from '~/components/common/address'
  import { useMobileStore } from '~/stores/mobileStore'
  const mobileStore = useMobileStore()
  const route = useRoute()
  const cellAddress = ref('')
  const display = ref(useDisplay())
  const cellsPageHeaderText = ref('Weather Stations')

  const closeCellsPage = () => {
    if (!display.value.smAndDown) {
      navigateTo('/stats')
    }
    mobileStore.setPageState(false)
  }

  onMounted(async () => {
    cellAddress.value = await getAddress(route.params.cellIndex).then((response) =>
      response === null ? '-' : response
    )
  })
</script>

<template>
  <VCard color="background" elevation="0">
    <VCardTitle>
      <v-row class="ma-0 pa-0 text-md-h6 text-sm-h6 text-text" align="center">
        <i
          class="fa fa-arrow-left text-primary"
          style="cursor: pointer"
          @click="closeCellsPage"
        ></i>
        <div class="ml-3 text-text">{{ cellsPageHeaderText }}</div></v-row
      >
      <VRow
        class="ma-0 pa-0 ml-7 text-body-2 font-weight-regular text-text"
        style="min-height: 20px"
      >
        {{ cellAddress }}
      </VRow>
    </VCardTitle>
  </VCard>
</template>
