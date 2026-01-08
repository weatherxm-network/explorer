<script setup lang="ts">
const qualityLegend = [
  { label: '80 - 100', color: '#00E676' },
  { label: '20 - 79', color: '#FFAB49' },
  { label: '0 - 19', color: '#FF1744' },
  { label: 'No Data', color: '#C6C6D0' },
]
</script>

<template>
  <div class="MapLegend">
    <div class="LegendSection">
      <div class="LegendTitle">Data Quality Score</div>
      <div class="LegendItems is-quality">
        <div v-for="item in qualityLegend" :key="item.label" class="LegendItem">
          <span class="LegendSwatch" :style="{ background: item.color }" />
          <span class="LegendLabel">{{ item.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.MapLegend {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--controls-surface-strong, #f7f8fa);
  border: 1px solid var(--controls-border, rgba(0,0,0,0.08));
  border-radius: 12px;
  padding: 12px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.03);
}

.LegendSection {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.LegendTitle {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.3px;
  color: var(--controls-text, #1f2933);
  text-transform: uppercase;
}

.LegendItems {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px 12px;

  &.is-quality {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.LegendItem {
  display: flex;
  align-items: center;
  gap: 8px;
}

.LegendSwatch {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  border: 1px solid rgba(0,0,0,0.05);
  flex-shrink: 0;
}

.LegendLabel {
  font-size: 12px;
  color: var(--controls-muted, #6b7280);
}
</style>
