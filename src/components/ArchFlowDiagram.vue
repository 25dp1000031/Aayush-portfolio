<template>
  <!--
    SVG architecture flow diagram.
    Animated data-flow lines are triggered when the card enters viewport.
    Each path draws itself via stroke-dashoffset animation.
  -->
  <div class="arch-wrap" ref="wrapRef">
    <p class="arch-label">// system architecture flow</p>
    <svg
      :viewBox="flow.viewBox"
      xmlns="http://www.w3.org/2000/svg"
      class="arch-svg"
      role="img"
      :aria-label="`Architecture diagram for ${projectName}`"
    >
      <defs>
        <!-- Gradient for glow effect on animated paths -->
        <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stop-color="#10B981" stop-opacity="0.3" />
          <stop offset="50%"  stop-color="#10B981" stop-opacity="0.9" />
          <stop offset="100%" stop-color="#10B981" stop-opacity="0.3" />
        </linearGradient>
        <!-- Glow filter -->
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <!-- Arrowhead marker -->
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M 0 0 L 8 3 L 0 6 z" fill="rgba(16,185,129,0.6)" />
        </marker>
        <marker id="arrow-dim" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M 0 0 L 8 3 L 0 6 z" fill="rgba(148,163,184,0.35)" />
        </marker>
      </defs>

      <!-- ── Connector paths (animated) ── -->
      <path
        v-for="(p, i) in flow.paths"
        :key="p.id"
        :d="p.d"
        fill="none"
        stroke="rgba(148,163,184,0.18)"
        stroke-width="1.5"
        stroke-dasharray="5 3"
      />
      <path
        v-for="(p, i) in flow.paths"
        :key="`anim-${p.id}`"
        :d="p.d"
        fill="none"
        stroke="url(#flowGrad)"
        stroke-width="2"
        filter="url(#glow)"
        marker-end="url(#arrow)"
        :class="['flow-path', { animated: isVisible }]"
        :style="{ animationDelay: `${i * 280}ms` }"
      />

      <!-- Path labels -->
      <text
        v-for="p in flow.paths"
        :key="`lbl-${p.id}`"
        :x="getLabelPos(p.d).x"
        :y="getLabelPos(p.d).y - 6"
        class="path-label"
        text-anchor="middle"
      >{{ p.label }}</text>

      <!-- ── Nodes ── -->
      <g
        v-for="node in flow.nodes"
        :key="node.id"
        @mouseenter="hoveredNode = node.id"
        @mouseleave="hoveredNode = null"
        class="node-group"
        :class="{ hovered: hoveredNode === node.id }"
        role="button"
        :aria-label="node.label"
      >
        <!-- Node rectangle -->
        <rect
          :x="node.x"
          :y="node.y"
          :width="node.w"
          :height="node.h"
          rx="6"
          :class="['node-rect', `color-${node.color}`, { ghost: node.ghost }]"
        />
        <!-- Node label -->
        <text
          :x="node.x + node.w / 2"
          :y="node.y + node.h / 2 + 5"
          text-anchor="middle"
          :class="['node-label', `label-${node.color}`]"
        >{{ node.label }}</text>
        <!-- Ghost marker -->
        <text
          v-if="node.ghost"
          :x="node.x + node.w / 2"
          :y="node.y - 4"
          text-anchor="middle"
          class="ghost-mark"
        >(ref)</text>
      </g>
    </svg>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  flow:        { type: Object, required: true },
  projectName: { type: String, default: '' },
})

const wrapRef    = ref(null)
const isVisible  = ref(false)
const hoveredNode = ref(null)
let   observer   = null

// Extract midpoint of a simple SVG path string for label positioning
function getLabelPos(d) {
  const nums = d.match(/-?[\d.]+/g)?.map(Number) || [0, 0]
  if (nums.length >= 4) {
    return { x: Math.round((nums[0] + nums[2]) / 2), y: Math.min(nums[1], nums[3] ?? nums[1]) }
  }
  return { x: nums[0] || 0, y: nums[1] || 0 }
}

onMounted(() => {
  observer = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { isVisible.value = true; observer.disconnect() }
  }, { threshold: 0.3 })
  if (wrapRef.value) observer.observe(wrapRef.value)
})

onUnmounted(() => observer?.disconnect())
</script>

<style scoped>
.arch-wrap {
  background: rgba(13,17,23,0.7);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 16px;
  overflow: hidden;
}

[data-theme="light"] .arch-wrap { background: rgba(15,23,42,0.06); }

.arch-label {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.arch-svg {
  width: 100%;
  height: auto;
  display: block;
  overflow: visible;
}

/* Node rectangles */
.node-rect {
  stroke-width: 1.2;
  transition: all 0.25s ease;
}

.color-blue   { fill: rgba(59,130,246,0.1);  stroke: rgba(59,130,246,0.35); }
.color-green  { fill: rgba(16,185,129,0.1);  stroke: rgba(16,185,129,0.35); }
.color-yellow { fill: rgba(245,158,11,0.1);  stroke: rgba(245,158,11,0.35); }
.color-red    { fill: rgba(239,68,68,0.08);  stroke: rgba(239,68,68,0.3);   }
.color-purple { fill: rgba(139,92,246,0.1);  stroke: rgba(139,92,246,0.35); }
.color-cyan   { fill: rgba(6,182,212,0.1);   stroke: rgba(6,182,212,0.35);  }

.node-rect.ghost { opacity: 0.45; stroke-dasharray: 4 3; }

.node-group:hover .node-rect { filter: brightness(1.3); }

/* Node text labels */
.node-label {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  pointer-events: none;
}

.label-blue   { fill: #93c5fd; }
.label-green  { fill: #6ee7b7; }
.label-yellow { fill: #fcd34d; }
.label-red    { fill: #fca5a5; }
.label-purple { fill: #c4b5fd; }
.label-cyan   { fill: #67e8f9; }

.ghost-mark {
  font-family: var(--font-mono);
  font-size: 8px;
  fill: rgba(148,163,184,0.5);
  pointer-events: none;
}

.path-label {
  font-family: var(--font-mono);
  font-size: 9px;
  fill: rgba(148,163,184,0.45);
  pointer-events: none;
}

/* ── Animated flow paths ── */
.flow-path {
  stroke-dasharray: 300;
  stroke-dashoffset: 300;
}

.flow-path.animated {
  animation: flowLine 1.2s ease forwards;
}
</style>
