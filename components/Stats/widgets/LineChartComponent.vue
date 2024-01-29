<script setup lang="ts">
  import { Line } from 'vue-chartjs'
  import { useTheme } from 'vuetify'
  import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  } from 'chart.js'
  ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

  interface Props {
    data?: number[]
  }

  const props = withDefaults(defineProps<Props>(), {
    data: () => []
  })

  const theme = useTheme()
  const updateKey = ref(0)
  const chartData = ref({
    labels: [],
    datasets: [
      {
        data: [],
        borderColor: '',
        borderWidth: 4,
        tension: 0.3
      }
    ]
  })

  const chartOptions = ref({
    maintainAspectRatio: false,
    type: 'line',
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: false
      }
    },

    elements: {
      point: {
        radius: 0
      }
    },
    scales: {
      x: {
        display: false,
        grid: {
          display: false
        }
      },
      y: {
        display: false,
        grid: {
          display: false
        }
      }
    }
  })

  const chartLineColor = computed(() => {
    return theme.current.value.colors.chartLine
  })

  onMounted(() => {
    chartData.value.labels = []
    props.data.forEach(() => {
      chartData.value.labels.push('')
    })

    chartData.value.datasets[0].data = props.data
    chartData.value.datasets[0].borderColor = chartLineColor.value
    updateKey.value++
  })
</script>

<template>
  <div :key="updateKey" class="w-100" style="height: 50px !important">
    <Line :key="updateKey" :options="chartOptions" :data="chartData" />
  </div>
</template>
