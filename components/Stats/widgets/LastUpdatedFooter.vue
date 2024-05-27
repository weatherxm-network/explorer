<script setup lang="ts">
  import dayjs from 'dayjs'
  import { computed } from 'vue'

  interface Props {
    lastUpdated?: string
  }
  const props = withDefaults(defineProps<Props>(), {
    lastUpdated: ''
  })

  const nav = window.navigator.language

  const calcedLastUpdated = computed(() => {
    return isBrowserLocaleClockType24h(nav) === true
      ? `Last updated on ${dayjs(props.lastUpdated).format('MMM DD, YYYY, HH:mm')}`
      : `Last updated on ${dayjs(props.lastUpdated).format('MMM DD, YYYY, hh:mm A')}`
  })

  const isBrowserLocaleClockType24h = (languages: string | string[]) => {
    if (!languages) {
      languages = []
    }
    const hr = new Intl.DateTimeFormat(languages, { hour: 'numeric' }).format()
    return Number.isInteger(Number(hr))
  }
</script>

<template>
  <div
    class="text-subtitle-2 text-right text-text"
    style="font-weight: 100; font-style: normal; line-height: 21px"
  >
    {{ calcedLastUpdated }}
  </div>
</template>
