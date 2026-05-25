<template>
  <div class="panel">
    <p class="panel-intro">Available endpoints for this service</p>
    <div class="endpoint-list">
      <div v-for="ep in docs.endpoints" :key="ep.path" class="endpoint-row">
        <span class="method" :class="ep.method.toLowerCase()">{{ ep.method }}</span>
        <code class="path">{{ ep.path }}</code>
        <span class="ep-desc">{{ ep.desc }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ docs: { type: Object, required: true } })
</script>

<style scoped>
.panel        { padding: 20px; }
.panel-intro  { font-size: 0.78rem; color: var(--text-muted); font-family: var(--font-mono); margin-bottom: 16px; }

.endpoint-list { display: flex; flex-direction: column; gap: 10px; }

.endpoint-row {
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding: 10px 14px;
  background: var(--bg-secondary);
  border-radius: var(--radius-xs);
  border: 1px solid var(--border-color);
  flex-wrap: wrap;
}

.method {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 3px;
  flex-shrink: 0;
  letter-spacing: 0.04em;
}
.method.get    { background: rgba(16,185,129,0.15); color: var(--accent-green); }
.method.post   { background: rgba(59,130,246,0.15); color: var(--accent-blue); }
.method.put    { background: rgba(245,158,11,0.15); color: var(--accent-yellow); }
.method.delete { background: rgba(239,68,68,0.15);  color: var(--accent-red); }

.path { font-family: var(--font-mono); font-size: 0.78rem; color: var(--text-primary); flex-shrink: 0; }

.ep-desc { font-size: 0.78rem; color: var(--text-secondary); }
</style>
