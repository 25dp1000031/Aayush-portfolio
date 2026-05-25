<template>
  <!-- Mock IDE / terminal widget with typewriter JSON output -->
  <div class="terminal">
    <!-- Title bar -->
    <div class="terminal-bar">
      <span class="dot red" /><span class="dot yellow" /><span class="dot green" />
      <span class="title">aayush@backend-engine:~$</span>
    </div>

    <!-- Body -->
    <div class="terminal-body">
      <div class="t-line">
        <span class="prompt">$</span>
        <span class="cmd"> cat system.config.json</span>
      </div>

      <!-- Typed output — dangerously set HTML for syntax highlighting -->
      <pre class="output" v-html="highlighted || plain"></pre>

      <div class="t-cursor-row">
        <span class="prompt">$</span>&nbsp;<span class="blink">▌</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTypewriter } from '@/composables/useTypewriter'

// The JSON config object Aayush's "system" exposes
const CONFIG = {
  name:      'Aayush Kukade',
  role:      'Backend Engineer',
  stack:     ['Java', 'Spring Boot', 'Python', 'Flask'],
  infra:     ['Docker', 'AWS EC2', 'Redis', 'Celery'],
  database:  'PostgreSQL',
  auth:      'JWT + RBAC',
  status:    'available',
  gate_cs:   true,
  education: ['IIT Madras Diploma', 'MCA SGBAU'],
}

const RAW_TEXT = JSON.stringify(CONFIG, null, 2)

const { output, start } = useTypewriter(RAW_TEXT, 15)

// Plain text ref during typing, highlighted after done
const plain       = computed(() => output.value)
const highlighted = ref('')

function syntaxHighlight(json) {
  return json
    .replace(/("[\w ]+")(\s*):/g,       '<span class="key">$1</span>$2:')
    .replace(/:\s*("(?:[^"\\]|\\.)*")/g, ': <span class="str">$1</span>')
    .replace(/:\s*(\d+)/g,               ': <span class="num">$1</span>')
    .replace(/:\s*(true|false|null)/g,   ': <span class="bool">$1</span>')
    .replace(/[{}[\],]/g,                '<span class="punct">$&</span>')
}

onMounted(() => {
  setTimeout(() => start(() => {
    highlighted.value = syntaxHighlight(RAW_TEXT)
  }), 800)
})
</script>

<style scoped>
.terminal {
  background: var(--bg-code);
  border: 1px solid rgba(48,54,61,0.8);
  border-radius: var(--radius-md);
  overflow: hidden;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  box-shadow: var(--shadow-card), 0 0 40px rgba(16,185,129,0.05);
}

.terminal-bar {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 16px;
  background: rgba(255,255,255,0.03);
  border-bottom: 1px solid rgba(48,54,61,0.6);
}

.dot { width: 12px; height: 12px; border-radius: 50%; }
.dot.red    { background: #ff5f57; }
.dot.yellow { background: #febc2e; }
.dot.green  { background: #28c840; }

.title {
  color: rgba(255,255,255,0.32);
  font-size: 0.72rem;
  margin-left: 8px;
}

.terminal-body {
  padding: 16px 18px;
  min-height: 230px;
}

.t-line { margin-bottom: 6px; }
.prompt { color: var(--accent-green); }
.cmd    { color: #cdd9e5; }

.output {
  color: rgba(205,217,229,0.55);
  white-space: pre-wrap;
  word-break: break-all;
  margin: 8px 0 14px;
  min-height: 130px;
  line-height: 1.65;
}

/* Syntax highlight classes (applied via v-html) */
.output :deep(.key)   { color: #79c0ff; }
.output :deep(.str)   { color: #a5d6ff; }
.output :deep(.num)   { color: #f0883e; }
.output :deep(.bool)  { color: var(--accent-green); }
.output :deep(.punct) { color: rgba(255,255,255,0.35); }

.t-cursor-row { color: rgba(255,255,255,0.35); }
.blink { animation: blink 1s step-end infinite; color: var(--accent-green); }
</style>
