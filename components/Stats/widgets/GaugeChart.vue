<script setup lang="ts">
  import { computed } from 'vue'
  import { Doughnut } from 'vue-chartjs'
  import {
    Chart,
    ArcElement,
    Tooltip,
    type ChartOptions,
    type Plugin,
  } from 'chart.js'
  import numberFormater from '../utils/numberFormater'

  Chart.register(ArcElement, Tooltip)

  interface CenterTextOptions {
    display: boolean
    text: string
    subText: string
  }

  const centerTextPlugin: Plugin<'doughnut'> = {
    id: 'centerText',
    afterDraw: (chart) => {
      const centerTextOptions = chart.config.options.plugins
        ?.centerText as CenterTextOptions
      if (centerTextOptions?.display) {
        const ctx = chart.ctx
        const { top, left, width, height } = chart.chartArea
        const centerX = left + width / 2
        // Adjust Y position to be centered in the visible arc of the gauge
        const centerY = top + height * 0.7

        ctx.save()
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        // --- Draw "TOTAL" Label ---
        ctx.fillStyle = '#FFFFFF'
        ctx.fillText(centerTextOptions.subText, centerX, centerY - 20)

        // --- Draw Total Value ---
        ctx.fillStyle = '#FFFFFF'
        ctx.fillText(centerTextOptions.text, centerX, centerY + 15)

        ctx.restore()
      }
    },
  }

  if (!Chart.registry.plugins.get('centerText')) {
    Chart.register(centerTextPlugin)
  }

  interface Props {
    claimed: number
    reserved: number
    total: number
  }

  const props = defineProps<Props>()

  const formattedClaimed = computed(() =>
    numberFormater.nFormatter(props.claimed),
  )
  const formattedReserved = computed(() =>
    numberFormater.nFormatter(props.reserved),
  )
  const formattedTotal = computed(() => numberFormater.nFormatter(props.total))

  const gaugeFillPercentage = computed(() => {
    const st = props.claimed + props.reserved
    return (st / props.total) * 100
  })

  const chartData = computed(() => ({
    datasets: [
      {
        data: [
          Math.max(100 - gaugeFillPercentage.value, 1),
          gaugeFillPercentage.value,
        ],
        backgroundColor: ['#2c5282', '#3b82f6'],
        borderColor: 'transparent',
        borderWidth: 0,
      },
    ],
  }))

  const chartOptions = computed<ChartOptions<'doughnut'>>(() => ({
    responsive: true,
    maintainAspectRatio: false,
    rotation: -90,
    circumference: 180,
    cutout: '75%',
    plugins: {
      tooltip: {
        enabled: false,
      },
      centerText: {
        display: true,
        text: formattedTotal.value,
        subText: 'TOTAL',
      } as CenterTextOptions,
    },
  }))
</script>

<template>
  <div class="position-relative max-w-lg mx-auto font-sans text-white">
    <div
      class="position-relative px-4 mx-auto"
      :style="{ width: '180px', height: '100px' }"
    >
      <Doughnut
        :data="chartData"
        :options="chartOptions"
        aria-label="Gauge chart showing claimed and reserved values"
      />
    </div>
    <div
      class="position-absolute left-0 text-center px-4"
      :style="{ transform: 'translateY(-50%)', top: '25%', left: '0%' }"
    >
      <p
        class="text-base md:text-lg font-semibold tracking-wider text-gray-300"
      >
        CLAIMED
      </p>
      <p class="text-3xl md:text-4xl font-bold">{{ formattedClaimed }}</p>
    </div>

    <div
      class="position-absolute right-0 text-center px-4"
      :style="{ transform: 'translateY(-50%)', top: '25%', right: '0%' }"
    >
      <p
        class="text-base md:text-lg font-semibold tracking-wider text-gray-300"
      >
        RESERVED
      </p>
      <p class="text-3xl md:text-4xl font-bold">{{ formattedReserved }}</p>
    </div>
  </div>
</template>
