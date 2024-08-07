<script setup lang="ts">
  import { useTheme } from 'vuetify'
  import type {
    SearchResultDevice,
    SearchResultLocation,
  } from '../../types/mapbox'

  interface Props {
    result?: SearchResultDevice | SearchResultLocation
    usersInput?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    usersInput: '',
    result: () => ({
      cell_center: {
        lat: 0,
        lon: 0,
      },
      cell_index: '',
      connectivity: '',
      name: '',
    }),
  })

  const theme = ref(useTheme())

  const boldText = computed(() => {
    return makeBold(props.result.name, props.usersInput)
  })

  const layer1Color = computed(() => {
    return theme.value.current.colors.layer1
  })

  const makeBold = (str: string, query: string) => {
    const regex = new RegExp(query.split('').join('-?'), 'i')
    return str.replace(regex, (match) => '<b>' + match + '</b>')
  }
</script>

<template>
  <div>
    <!------------------  Device result ----------------->
    <div v-if="result.id">
      <VListItem color="top">
        <VListItemTitle>
          <div class="pl-4 text-subtitle-1">
            <span v-html="boldText" />
          </div>
        </VListItemTitle>
        <VListItemSubtitle>
          <div class="text-body-2 pl-4">
            {{ result.place }}
          </div>
        </VListItemSubtitle>
        <template #prepend>
          <div
            class="d-flex align-center justify-center rounded-circle"
            :style="{ background: layer1Color }"
            style="width: 40px; height: 40px"
          >
            <div
              v-if="result.connectivity === 'wifi'"
              style="width: 30px; height: 30px"
            >
              <svg
                height="30"
                width="30"
                viewBox="0 0 30 30"
                :fill="theme.current.colors.text"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14.9688 18C13.8438 18 12.9688 18.875 12.9688 20C12.9688 21.0938 13.8438 22 14.9688 22C16.0625 22 16.9688 21.0938 16.9688 20C16.9688 18.875 16.0938 18 14.9688 18ZM15 13C12.7812 13 10.6875 13.7812 9.03125 15.25C8.625 15.625 8.59375 16.25 8.9375 16.6875C9.3125 17.0938 9.9375 17.125 10.3438 16.75C11.625 15.625 13.2812 15 15 15C16.6875 15 18.3438 15.625 19.625 16.75C19.8125 16.9375 20.0312 17 20.2812 17C20.5625 17 20.8125 16.9062 21.0312 16.6875C21.4062 16.25 21.3438 15.625 20.9375 15.25C19.2812 13.8125 17.1875 13 15 13ZM24.6875 11.9062C22.0625 9.40625 18.625 8 15 8C11.3438 8 7.90625 9.40625 5.28125 11.9062C4.90625 12.2812 4.875 12.9375 5.25 13.3125C5.65625 13.7188 6.28125 13.75 6.6875 13.3438C8.90625 11.1875 11.875 10 15 10C18.0938 10 21.0312 11.1875 23.2812 13.3438C23.5 13.5312 23.75 13.625 24 13.625C24.25 13.625 24.5 13.5312 24.7188 13.3125C25.0938 12.9375 25.0625 12.2812 24.6875 11.9062Z"
                  :fill="theme.current.colors.text"
                />
              </svg>
            </div>
            <div
              v-if="result.connectivity === 'cellular'"
              class="d-flex justify-center align-center"
              style="width: 30px; height: 30px"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 18"
                :fill="theme.current.colors.text"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 1C18.5312 1 19 1.46875 19 2V16C19 16.5625 18.5312 17 18 17C17.4375 17 17 16.5625 17 16V2C17 1.46875 17.4375 1 18 1ZM14 4C14.5312 4 15 4.46875 15 5V16C15 16.5625 14.5312 17 14 17C13.4375 17 13 16.5625 13 16V5C13 4.46875 13.4375 4 14 4ZM11 8V16C11 16.5625 10.5312 17 10 17C9.4375 17 9 16.5625 9 16V8C9 7.46875 9.4375 7 10 7C10.5312 7 11 7.46875 11 8ZM6 10C6.53125 10 7 10.4688 7 11V16C7 16.5625 6.53125 17 6 17C5.4375 17 5 16.5625 5 16V11C5 10.4688 5.4375 10 6 10ZM3 14V16C3 16.5625 2.53125 17 2 17C1.4375 17 1 16.5625 1 16V14C1 13.4688 1.4375 13 2 13C2.53125 13 3 13.4688 3 14Z"
                  :fill="theme.current.colors.text"
                />
              </svg>
            </div>
            <div
              v-if="result.connectivity === 'helium'"
              style="width: 30px; height: 30px"
            >
              <svg
                height="30"
                width="30"
                viewBox="0 0 30 30"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 5C9.47699 5 5 9.47728 5 15C5 20.523 9.47699 25 15 25C20.5227 25 25 20.523 25 15C25 9.47728 20.5227 5 15 5ZM20.328 12.8722C19.9978 13.2023 19.5912 13.409 19.1648 13.4926C19.7588 15.0909 19.3736 16.92 18.1543 18.1391C17.3128 18.9805 16.1806 19.426 15.0342 19.426C14.518 19.426 13.9996 19.3343 13.5032 19.1493C13.4204 19.5774 13.2132 19.987 12.8814 20.3185C11.9976 21.2028 10.5651 21.2028 9.68128 20.3185C8.79749 19.4352 8.79749 18.0024 9.68128 17.1186C10.0111 16.7887 10.4178 16.582 10.8434 16.4985C10.2379 14.895 10.621 13.055 11.8454 11.8302C13.0691 10.6065 14.907 10.2235 16.5094 10.8265C16.594 10.4036 16.7999 9.99998 17.1279 9.67202C18.0116 8.78823 19.4445 8.78823 20.328 9.67202C21.2118 10.5556 21.2118 11.9884 20.328 12.8722Z"
                  :fill="theme.current.colors.text"
                />
                <path
                  d="M17.6582 10.202C17.3178 10.5425 17.1618 11.0297 17.2407 11.5052C17.2684 11.6609 17.2516 11.821 17.1824 11.9704C17.0932 12.1633 16.9342 12.3016 16.7495 12.3697C16.5642 12.4378 16.3529 12.4354 16.1598 12.3459C15.0758 11.844 13.7799 12.0746 12.9349 12.9196C12.0899 13.7646 11.8594 15.0602 12.3609 16.1441C12.4518 16.34 12.4526 16.5543 12.3815 16.7415C12.3127 16.9232 12.1757 17.0784 11.9855 17.1668C11.8808 17.2151 11.7707 17.2379 11.6624 17.2379C11.6109 17.2379 11.5604 17.2314 11.5105 17.2211C11.0157 17.1533 10.5532 17.3074 10.2174 17.6426C9.93524 17.9247 9.77982 18.3002 9.77982 18.6995C9.77982 19.0988 9.93524 19.4742 10.2174 19.7563C10.8003 20.339 11.7484 20.339 12.3311 19.7563C12.6712 19.4156 12.8272 18.9284 12.7483 18.4532C12.7439 18.4272 12.745 18.4022 12.7483 18.3772C12.7393 18.2514 12.7607 18.1212 12.8174 17.9985C12.9064 17.8065 13.0646 17.6687 13.2485 17.6003C13.4343 17.5314 13.6464 17.5341 13.8401 17.6231C14.9244 18.1255 16.2202 17.8944 17.0652 17.0502C17.9099 16.2049 18.1405 14.9091 17.6389 13.8254C17.5505 13.6341 17.5472 13.4252 17.6134 13.2413C17.6807 13.0541 17.8196 12.8927 18.0144 12.8027C18.1514 12.7392 18.297 12.7202 18.4362 12.7384C18.4579 12.736 18.4799 12.7351 18.5024 12.7381C18.9736 12.8054 19.4358 12.6513 19.7716 12.3155C20.3543 11.7328 20.3543 10.785 19.7716 10.202C19.189 9.61934 18.2409 9.61934 17.6582 10.202ZM16.1815 16.1659C15.535 16.8126 14.4868 16.8126 13.8401 16.1659C13.1937 15.5197 13.1937 14.4715 13.8401 13.8248C14.4868 13.1784 15.535 13.1784 16.1815 13.8248C16.8281 14.4715 16.8281 15.5197 16.1815 16.1659Z"
                  :fill="theme.current.colors.text"
                />
              </svg>
            </div>
          </div>
        </template>
      </VListItem>
    </div>

    <!------------------  Address result ----------------->
    <div v-else-if="result.place">
      <VListItem color="top">
        <VListItemTitle>
          <div class="pl-4 text-subtitle-1">
            <span v-html="boldText" />
          </div>
        </VListItemTitle>
        <VListItemSubtitle>
          <div class="text-body-2 pl-4">
            {{ result.place }}
          </div>
        </VListItemSubtitle>
        <template #prepend>
          <div
            class="pa-0 d-flex align-center justify-center rounded-circle"
            :style="{ background: layer1Color }"
            style="width: 40px; height: 40px"
          >
            <i
              class="fa-sharp fa-regular fa-location-dot"
              :class="'text-text'"
            ></i>
          </div>
        </template>
      </VListItem>
    </div>
  </div>
</template>
