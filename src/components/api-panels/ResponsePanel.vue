<template>
  <div class="panel">
    <div class="code-header">
      <span class="code-lang"><i class="fas fa-code"></i> JSON Response</span>
      <div class="response-badges">
        <span class="status-200">200 OK</span>
        <span class="cache-badge">X-Cache: MISS</span>
      </div>
    </div>
    <pre class="code-block" v-html="highlighted"></pre>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ docs: { type: Object, required: true } })

function highlightJson(text) {
  // Colour HTTP header lines differently
  return text
    .replace(/^(HTTP\/[\d.]+ \d+ \w+)/m,        '<span class="http-status">$1</span>')
    .replace(/^([A-Za-z-]+):\s(.+)$/gm,         '<span class="http-header">$1</span>: <span class="http-val">$2</span>')
    .replace(/("[\w _-]+")\s*:/g,               '<span class="key">$1</span>:')
    .replace(/:\s*("(?:[^"\\]|\\.)*")/g,        ': <span class="str">$1</span>')
    .replace(/:\s*(\d+(?:\.\d+)?)/g,            ': <span class="num">$1</span>')
    .replace(/:\s*(true|false|null)/g,           ': <span class="bool">$1</span>')
    .replace(/[{}[\],]/g,                        '<span class="punct">$&</span>')
}

const highlighted = computed(() => highlightJson(props.docs.response))
</script>

<style scoped>
.panel { padding: 0; }

.code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid var(--border-color);
  background: rgba(255,255,255,0.02);
  flex-wrap: wrap;
  gap: 8px;
}

.code-lang {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 6px;
}

.response-badges { display: flex; gap: 8px; align-items: center; }

.status-200 {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 3px;
  background: rgba(16,185,129,0.15);
  color: var(--accent-green);
}

.cache-badge {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  padding: 2px 8px;
  border-radius: 3px;
  background: rgba(59,130,246,0.1);
  color: var(--accent-blue);
}

.code-block {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  line-height: 1.7;
  padding: 18px 20px;
  overflow: auto;
  white-space: pre;
  color: #cdd9e5;
  background: var(--bg-code);
  max-height: 340px;
}

.code-block :deep(.http-status) { color: var(--accent-green); font-weight: 600; }
.code-block :deep(.http-header) { color: #79c0ff; }
.code-block :deep(.http-val)    { color: #a5d6ff; }
.code-block :deep(.key)         { color: #79c0ff; }
.code-block :deep(.str)         { color: #a5d6ff; }
.code-block :deep(.num)         { color: #f0883e; }
.code-block :deep(.bool)        { color: var(--accent-green); }
.code-block :deep(.punct)       { color: rgba(255,255,255,0.3); }
</style>
