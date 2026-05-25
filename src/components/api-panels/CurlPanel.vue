<template>
  <div class="panel">
    <div class="code-header">
      <span class="code-lang"><i class="fas fa-terminal"></i> cURL</span>
      <button class="copy-btn" @click="copy" :class="{ copied }">
        <i :class="copied ? 'fas fa-check' : 'fas fa-copy'"></i>
        {{ copied ? 'Copied!' : 'Copy' }}
      </button>
    </div>
    <pre class="code-block" v-html="highlighted"></pre>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props  = defineProps({ docs: { type: Object, required: true } })
const copied = ref(false)

function highlightCurl(text) {
  return text
    .replace(/(curl)/g,                  '<span class="kw">$1</span>')
    .replace(/(-X|-H|-d|--[\w-]+)/g,    '<span class="flag">$1</span>')
    .replace(/(https?:\/\/[^\s\\]+)/g,  '<span class="url">$1</span>')
    .replace(/('[^']*')/g,              '<span class="str">$1</span>')
    .replace(/(#.*)/g,                  '<span class="comment">$1</span>')
    .replace(/(\\)$/gm,                 '<span class="punct">$1</span>')
}

const highlighted = computed(() => highlightCurl(props.docs.curl))

async function copy() {
  await navigator.clipboard.writeText(props.docs.curl).catch(() => {})
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}
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
}

.code-lang {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 6px;
}

.copy-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--text-secondary);
  padding: 3px 10px;
  border-radius: var(--radius-xs);
  border: 1px solid var(--border-color);
  transition: var(--transition);
  cursor: pointer;
}
.copy-btn:hover { color: var(--text-primary); }
.copy-btn.copied { color: var(--accent-green); border-color: rgba(16,185,129,0.3); }

.code-block {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  line-height: 1.7;
  padding: 18px 20px;
  overflow-x: auto;
  white-space: pre;
  color: #cdd9e5;
  background: var(--bg-code);
  min-height: 160px;
}

/* Syntax classes (applied via v-html) */
.code-block :deep(.kw)      { color: #f0883e; font-weight: 600; }
.code-block :deep(.flag)    { color: #79c0ff; }
.code-block :deep(.url)     { color: #a5d6ff; text-decoration: underline; }
.code-block :deep(.str)     { color: #a5d6ff; }
.code-block :deep(.comment) { color: rgba(148,163,184,0.5); }
.code-block :deep(.punct)   { color: rgba(255,255,255,0.35); }
</style>
