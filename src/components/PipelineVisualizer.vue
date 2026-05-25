<template>
  <!-- Interactive request-pipeline node diagram -->
  <div class="pipeline-card">
    <p class="label">// live request pipeline</p>

    <div class="nodes">
      <template v-for="(node, i) in NODES" :key="node.id">
        <!-- Node -->
        <div
          class="node"
          :class="{ active: activeNode === i }"
          @mouseenter="activeNode = i"
          @mouseleave="activeNode = null"
        >
          <div class="node-box">{{ node.label }}</div>
          <div class="node-dot"></div>
          <!-- Tooltip -->
          <Transition name="tip">
            <div class="tooltip" v-if="activeNode === i">{{ node.tip }}</div>
          </Transition>
        </div>

        <!-- Arrow between nodes -->
        <span v-if="i < NODES.length - 1" class="arrow">→</span>
      </template>
    </div>

    <!-- Status line below nodes -->
    <div class="status-line">
      <span class="status-dot"></span>
      <span class="status-text" v-if="activeNode !== null">
        {{ NODES[activeNode].status }}
      </span>
      <span class="status-text idle" v-else>hover a node to inspect state</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const activeNode = ref(null)

const NODES = [
  { id: 'client', label: 'Client',       tip: 'Vue.js browser request',             status: '● Outbound HTTP/HTTPS request initiated' },
  { id: 'gw',     label: 'API Gateway',  tip: 'Flask / Spring MVC routing layer',   status: '● Route matched — handler dispatched'     },
  { id: 'jwt',    label: 'JWT Auth',     tip: 'HS256 token verification + RBAC',    status: '● Token valid — role: STUDENT'            },
  { id: 'cache',  label: 'Redis Cache',  tip: 'L1 cache — TTL 300s per key',        status: '● Cache MISS — forwarding to DB'          },
  { id: 'celery', label: 'Celery Queue', tip: 'Async task broker (Redis backend)',   status: '● Task enqueued — worker picked up'       },
  { id: 'db',     label: 'PostgreSQL',   tip: 'Primary data store with indexing',   status: '● Query executed — 3ms (index scan)'      },
]
</script>

<style scoped>
.pipeline-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 18px 20px;
  box-shadow: var(--shadow-card);
  transition: var(--transition);
}

.label {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--text-muted);
  margin-bottom: 14px;
}

.nodes {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 0;
  row-gap: 10px;
}

.node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  position: relative;
  cursor: pointer;
}

.node-box {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xs);
  padding: 5px 10px;
  font-family: var(--font-mono);
  font-size: 0.68rem;
  color: var(--text-secondary);
  white-space: nowrap;
  transition: var(--transition);
}
.node.active .node-box,
.node:hover .node-box {
  border-color: var(--accent-green);
  color: var(--accent-green);
  background: rgba(16,185,129,0.09);
  box-shadow: 0 0 14px rgba(16,185,129,0.18);
}

.node-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--text-muted);
  transition: var(--transition);
}
.node.active .node-dot,
.node:hover .node-dot { background: var(--accent-green); }

/* Tooltip */
.tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg-card);
  border: 1px solid var(--border-glow);
  border-radius: var(--radius-xs);
  padding: 5px 10px;
  font-family: var(--font-mono);
  font-size: 0.66rem;
  color: var(--accent-green);
  white-space: nowrap;
  z-index: 10;
  pointer-events: none;
}

.tip-enter-active, .tip-leave-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.tip-enter-from, .tip-leave-to { opacity: 0; transform: translateX(-50%) translateY(4px); }

.arrow {
  font-family: var(--font-mono);
  color: var(--text-muted);
  padding: 0 5px;
  font-size: 0.8rem;
  padding-bottom: 16px;
}

/* Status line */
.status-line {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 14px;
  padding-top: 10px;
  border-top: 1px solid var(--border-color);
}

.status-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--accent-green);
  animation: nodePulse 2s ease-in-out infinite;
  flex-shrink: 0;
}

.status-text {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  color: var(--accent-green);
  animation: slideUp 0.2s ease;
}
.status-text.idle { color: var(--text-muted); }
</style>
