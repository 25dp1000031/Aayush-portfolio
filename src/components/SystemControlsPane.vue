<template>
  <!--
    SystemControlsPane — IDE-style monitor window.
    Two panels:
      · Left  : live system log stream (from ui.systemLogs)
      · Right : Chart.js radar proficiency chart
    This pane floats above sections only in desktop viewports; on mobile it
    collapses to the log strip only.
  -->
  <div class="sys-pane">

    <!-- ── Window chrome ── -->
    <div class="pane-chrome">
      <div class="traffic-lights">
        <span class="tl red"></span>
        <span class="tl yellow"></span>
        <span class="tl green"></span>
      </div>
      <span class="chrome-path">system.monitor</span>
      <span class="chrome-cmd">// runtime.logs + proficiency.radar</span>
      <button class="clear-btn" @click="uiStore.clearLogs()" title="Clear logs">
        <i class="fas fa-trash-alt"></i>
      </button>
    </div>

    <!-- ── Body: log stream | radar chart ── -->
    <div class="pane-body">

      <!-- Log column -->
      <div class="log-col">
        <div class="log-header">
          <span class="log-title">// system.stdout</span>
          <span class="log-count">{{ uiStore.systemLogs.length }} entries</span>
        </div>
        <div class="log-stream" ref="logEl">
          <TransitionGroup name="log-slide" tag="div">
            <div
              v-for="entry in uiStore.systemLogs"
              :key="entry.id"
              class="log-entry"
              :class="entry.level"
            >
              <span class="log-ts">{{ entry.ts }}</span>
              <span class="log-level">{{ LOG_ICONS[entry.level] ?? '◆' }}</span>
              <span class="log-msg">{{ entry.msg }}</span>
            </div>
          </TransitionGroup>

          <!-- Empty state -->
          <div v-if="!uiStore.systemLogs.length" class="log-empty">
            <i class="fas fa-terminal"></i>
            <span>// no events yet</span>
          </div>
        </div>

        <!-- Status bar -->
        <div class="status-bar">
          <span class="sb-item" :class="portfolioStore.loading ? 'active' : 'idle'">
            <span class="sb-dot"></span>
            {{ portfolioStore.loading ? 'loading…' : 'idle' }}
          </span>
          <span class="sb-item" :class="portfolioStore.isDirty ? 'dirty' : ''">
            <i class="fas fa-circle-dot"></i>
            {{ portfolioStore.isDirty ? 'unsaved changes' : 'in sync' }}
          </span>
          <span v-if="portfolioStore.dbError" class="sb-item error">
            <i class="fas fa-exclamation-triangle"></i>
            {{ portfolioStore.dbError }}
          </span>
        </div>
      </div>

      <!-- Radar column -->
      <div class="radar-col">
        <div class="radar-header">
          <span class="log-title">// proficiency.radar</span>
        </div>
        <div class="radar-wrap">
          <SkillsChart />
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref }               from 'vue'
import { useUIStore }        from '@/stores/ui'
import { usePortfolioStore } from '@/stores/portfolio'
import SkillsChart           from './SkillsChart.vue'

const uiStore        = useUIStore()
const portfolioStore = usePortfolioStore()
const logEl          = ref(null)

const LOG_ICONS = {
  info:  '›',
  ok:    '✓',
  warn:  '⚠',
  error: '✗',
}
</script>

<style scoped>
/* ── Pane shell ── */
.sys-pane {
  background    : var(--bg-card);
  border        : 1px solid var(--border-color);
  border-radius : var(--radius-md);
  overflow      : hidden;
  display       : flex;
  flex-direction: column;
  font-family   : var(--font-mono);
}

/* ── Chrome bar ── */
.pane-chrome {
  display         : flex;
  align-items     : center;
  gap             : 10px;
  padding         : 8px 14px;
  background      : rgba(0,0,0,0.25);
  border-bottom   : 1px solid var(--border-color);
  flex-shrink     : 0;
}
.traffic-lights { display: flex; gap: 5px; flex-shrink: 0; }
.tl {
  width: 11px; height: 11px; border-radius: 50%; flex-shrink: 0;
}
.tl.red    { background: #ff5f57; }
.tl.yellow { background: #febc2e; }
.tl.green  { background: #28c840; }

.chrome-path {
  font-size   : 0.72rem;
  color       : var(--text-secondary);
  font-weight : 600;
}
.chrome-cmd  {
  font-size : 0.68rem;
  color     : var(--text-muted);
  flex      : 1;
}
.clear-btn {
  margin-left : auto;
  background  : transparent;
  border      : none;
  color       : var(--text-muted);
  cursor      : pointer;
  font-size   : 0.68rem;
  padding     : 2px 4px;
  border-radius: 3px;
  transition  : color 0.2s;
}
.clear-btn:hover { color: var(--accent-red); }

/* ── Body ── */
.pane-body {
  display   : grid;
  grid-template-columns: 1fr 280px;
  gap       : 0;
  flex      : 1;
  min-height: 0;
}

/* ── Log column ── */
.log-col {
  display       : flex;
  flex-direction: column;
  border-right  : 1px solid var(--border-color);
  min-height    : 0;
}

.log-header, .radar-header {
  padding       : 7px 14px;
  border-bottom : 1px solid var(--border-color);
  display       : flex;
  align-items   : center;
  justify-content: space-between;
  flex-shrink   : 0;
}
.log-title  { font-size: 0.65rem; color: var(--accent-green); }
.log-count  { font-size: 0.62rem; color: var(--text-muted); }

.log-stream {
  flex      : 1;
  overflow-y: auto;
  padding   : 6px 2px;
  max-height: 340px;
  scrollbar-width: thin;
  scrollbar-color: var(--border-color) transparent;
}

.log-entry {
  display    : flex;
  align-items: flex-start;
  gap        : 8px;
  padding    : 2px 12px;
  font-size  : 0.68rem;
  line-height: 1.6;
  border-left: 2px solid transparent;
  transition : background 0.15s;
}
.log-entry:hover { background: rgba(255,255,255,0.02); }
.log-entry.ok    { border-color: var(--accent-green); }
.log-entry.warn  { border-color: #F59E0B; }
.log-entry.error { border-color: var(--accent-red); }
.log-entry.info  { border-color: transparent; }

.log-ts    { color: var(--text-muted);   flex-shrink: 0; min-width: 58px; }
.log-level { flex-shrink: 0; width: 12px; text-align: center; }
.log-entry.ok    .log-level { color: var(--accent-green); }
.log-entry.warn  .log-level { color: #F59E0B; }
.log-entry.error .log-level { color: var(--accent-red); }
.log-entry.info  .log-level { color: var(--text-muted); }
.log-msg   { color: var(--text-secondary); word-break: break-all; }

.log-empty {
  display        : flex;
  flex-direction : column;
  align-items    : center;
  justify-content: center;
  gap            : 8px;
  padding        : 32px;
  color          : var(--text-muted);
  font-size      : 0.72rem;
}
.log-empty i { font-size: 1.2rem; opacity: 0.4; }

/* ── Status bar ── */
.status-bar {
  display         : flex;
  gap             : 16px;
  padding         : 5px 12px;
  border-top      : 1px solid var(--border-color);
  background      : rgba(0,0,0,0.18);
  flex-shrink     : 0;
  overflow        : hidden;
}
.sb-item {
  display    : flex;
  align-items: center;
  gap        : 5px;
  font-size  : 0.62rem;
  color      : var(--text-muted);
  white-space: nowrap;
}
.sb-item.active { color: var(--accent-green); }
.sb-item.dirty  { color: #F59E0B; }
.sb-item.error  { color: var(--accent-red); }
.sb-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: currentColor;
  animation : pulse-dot 2s ease-in-out infinite;
}

/* ── Radar column ── */
.radar-col {
  display       : flex;
  flex-direction: column;
}
.radar-wrap {
  flex    : 1;
  padding : 12px;
  display : flex;
  align-items: center;
  justify-content: center;
}

/* ── Log slide transition ── */
.log-slide-enter-active { transition: all 0.2s ease; }
.log-slide-enter-from   { opacity: 0; transform: translateY(-4px); }

/* ── Responsive ── */
@media (max-width: 800px) {
  .pane-body { grid-template-columns: 1fr; }
  .radar-col { display: none; }
}
</style>
