<template>
  <!--
    Tabbed interactive API documentation block.
    Uses <KeepAlive> so each tab component preserves its scroll position
    and any local state when switching tabs.
  -->
  <div class="api-block">
    <!-- Header + tabs -->
    <div class="api-header">
      <div class="api-title">
        <i class="fas fa-plug"></i>
        System Architecture &amp; API Specs
      </div>
      <div class="tab-list" role="tablist">
        <button
          v-for="tab in TABS"
          :key="tab.id"
          class="tab-btn"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
          role="tab"
          :aria-selected="activeTab === tab.id"
        >
          <i :class="tab.icon"></i>
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Tab panels — KeepAlive preserves panel scroll positions -->
    <div class="tab-panels">
      <KeepAlive>
        <component
          :is="currentPanel"
          :docs="docs"
          :key="activeTab"
        />
      </KeepAlive>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineAsyncComponent } from 'vue'

// Inline panel components (small enough not to need async loading)
import OverviewPanel  from './api-panels/OverviewPanel.vue'
import CurlPanel      from './api-panels/CurlPanel.vue'
import ResponsePanel  from './api-panels/ResponsePanel.vue'
import SchemaPanel    from './api-panels/SchemaPanel.vue'

const props = defineProps({
  docs: { type: Object, required: true },
})

const TABS = [
  { id: 'overview',  label: 'Overview',  icon: 'fas fa-list'        },
  { id: 'curl',      label: 'cURL',      icon: 'fas fa-terminal'    },
  { id: 'response',  label: 'Response',  icon: 'fas fa-code'        },
  { id: 'schema',    label: 'Schema',    icon: 'fas fa-sitemap'     },
]

const PANEL_MAP = {
  overview: OverviewPanel,
  curl:     CurlPanel,
  response: ResponsePanel,
  schema:   SchemaPanel,
}

const activeTab    = ref('overview')
const currentPanel = computed(() => PANEL_MAP[activeTab.value])
</script>

<style scoped>
.api-block {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.api-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid var(--border-color);
  flex-wrap: wrap;
  gap: 12px;
  background: rgba(16,185,129,0.04);
}

.api-title {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--accent-green);
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-list { display: flex; gap: 2px; }

.tab-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  padding: 5px 12px;
  border-radius: var(--radius-xs);
  color: var(--text-secondary);
  border: 1px solid transparent;
  transition: var(--transition);
  cursor: pointer;
}

.tab-btn:hover { color: var(--text-primary); background: var(--bg-secondary); }
.tab-btn.active {
  color: var(--accent-green);
  background: rgba(16,185,129,0.1);
  border-color: rgba(16,185,129,0.2);
}

.tab-panels { min-height: 240px; }
</style>
