<template>
  <!--
    SkillsChart — Chart.js radar chart fully driven by portfolioStore.skills.
    Labels, values, and benchmark line all read from Pinia so admin edits
    to radarLabels / radarValues / benchmarkValue reflect live.
  -->
  <div class="chart-container">
    <p class="chart-label">// proficiency_radar.render()</p>
    <div class="chart-wrap">
      <Radar :data="chartData" :options="chartOptions" />
    </div>
    <div class="legend-row">
      <span v-for="item in LEGEND" :key="item.label" class="legend-item">
        <span class="legend-dot" :style="{ background: item.color }"></span>
        {{ item.label }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed }          from 'vue'
import { storeToRefs }       from 'pinia'
import { Radar }             from 'vue-chartjs'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import { usePortfolioStore } from '@/stores/portfolio'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

// ── Store data ───────────────────────────────────────────────────────
const { skills } = storeToRefs(usePortfolioStore())

const LEGEND = [
  { label: 'Backend proficiency',          color: 'rgba(16,185,129,0.8)'  },
  { label: 'Benchmark: Proficient (≥ 70)', color: 'rgba(59,130,246,0.5)'  },
]

// chartData is reactive — re-computes whenever store.skills changes
const chartData = computed(() => {
  const labels    = skills.value.radarLabels    ?? []
  const values    = skills.value.radarValues    ?? []
  const benchmark = skills.value.benchmarkValue ?? 70

  return {
    labels,
    datasets: [
      {
        label                : 'Proficiency',
        data                 : values,
        backgroundColor      : 'rgba(16,185,129,0.1)',
        borderColor          : 'rgba(16,185,129,0.7)',
        pointBackgroundColor : '#10B981',
        pointBorderColor     : 'rgba(16,185,129,0.25)',
        pointHoverBackgroundColor: '#10B981',
        borderWidth          : 1.5,
        pointRadius          : 3,
        pointHoverRadius     : 5,
        fill                 : true,
      },
      {
        label          : 'Benchmark',
        data           : Array(labels.length).fill(benchmark),
        backgroundColor: 'rgba(59,130,246,0.05)',
        borderColor    : 'rgba(59,130,246,0.3)',
        borderDash     : [4, 4],
        borderWidth    : 1,
        pointRadius    : 0,
        fill           : true,
      },
    ],
  }
})

const chartOptions = {
  responsive          : true,
  maintainAspectRatio : true,
  animation           : { duration: 900, easing: 'easeInOutQuart' },
  plugins: {
    legend : { display: false },
    tooltip: {
      backgroundColor : 'rgba(7,11,19,0.92)',
      titleColor      : '#10B981',
      bodyColor       : 'rgba(205,217,229,0.75)',
      borderColor     : 'rgba(16,185,129,0.25)',
      borderWidth     : 1,
      padding         : 10,
      titleFont       : { family: "'JetBrains Mono', monospace", size: 11 },
      bodyFont        : { family: "'JetBrains Mono', monospace", size: 11 },
      callbacks       : { label: ctx => ` ${ctx.raw}%` },
    },
  },
  scales: {
    r: {
      min           : 0,
      max           : 100,
      backgroundColor: 'transparent',
      angleLines    : { color: 'rgba(255,255,255,0.05)' },
      grid          : { color: 'rgba(255,255,255,0.05)' },
      pointLabels   : {
        color : 'rgba(148,163,184,0.7)',
        font  : { family: "'JetBrains Mono', monospace", size: 9.5 },
      },
      ticks: { display: false, stepSize: 25 },
    },
  },
}
</script>

<style scoped>
.chart-container {
  background    : var(--bg-card);
  border        : 1px solid var(--border-color);
  border-radius : var(--radius-md);
  padding       : 24px;
  transition    : var(--transition);
}
.chart-container:hover { border-color: var(--border-glow); box-shadow: var(--shadow-glow); }

.chart-label {
  font-family   : var(--font-mono);
  font-size     : 0.68rem;
  color         : var(--accent-green);
  margin-bottom : 18px;
}

.chart-wrap {
  max-width  : 320px;
  margin     : 0 auto 18px;
}

.legend-row {
  display         : flex;
  flex-wrap       : wrap;
  gap             : 14px;
  justify-content : center;
}

.legend-item {
  display     : flex;
  align-items : center;
  gap         : 6px;
  font-family : var(--font-mono);
  font-size   : 0.66rem;
  color       : var(--text-muted);
}

.legend-dot {
  width         : 8px;
  height        : 8px;
  border-radius : 50%;
  flex-shrink   : 0;
}
</style>
