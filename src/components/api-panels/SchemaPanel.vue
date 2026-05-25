<template>
  <div class="panel">
    <div class="code-header">
      <span class="code-lang"><i class="fas fa-sitemap"></i> Data Contract / Schema</span>
    </div>
    <pre class="code-block" v-html="highlighted"></pre>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ docs: { type: Object, required: true } })

function highlightSchema(text) {
  return text
    .replace(/(\/\/.*)/g,                     '<span class="comment">$1</span>')
    .replace(/\b(Request|Response)\s*\{/g,    '<span class="kw">$1</span> <span class="punct">{</span>')
    .replace(/\b(string|number|boolean)\b/g,  '<span class="type">$1</span>')
    .replace(/([\w_]+)\s*:/g,                 '<span class="field">$1</span>:')
    .replace(/[{}[\]]/g,                      '<span class="punct">$&</span>')
    .replace(/("(?:[^"\\]|\\.)*")/g,          '<span class="str">$1</span>')
}

const highlighted = computed(() => highlightSchema(props.docs.schema))
</script>

<style scoped>
.panel { padding: 0; }

.code-header {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid var(--border-color);
  background: rgba(255,255,255,0.02);
}

.code-lang {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 6px;
}

.code-block {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  line-height: 1.75;
  padding: 18px 20px;
  overflow: auto;
  white-space: pre;
  color: #cdd9e5;
  background: var(--bg-code);
  max-height: 340px;
}

.code-block :deep(.comment) { color: rgba(148,163,184,0.5); }
.code-block :deep(.kw)      { color: #f0883e; font-weight: 600; }
.code-block :deep(.type)    { color: var(--accent-green); }
.code-block :deep(.field)   { color: #79c0ff; }
.code-block :deep(.str)     { color: #a5d6ff; }
.code-block :deep(.punct)   { color: rgba(255,255,255,0.3); }
</style>
