<template>
  <!--
    OsWindow — macOS-style terminal window chrome wrapper.

    Features:
    · Traffic-light controls (red / yellow / green)
    · Shell-style path display: aayush@portfolio:~/<path> $ <cmd>
    · Minimize/expand via yellow light or title-bar double-click
    · Motion One boot animation triggered by IntersectionObserver
      so windows below the fold only animate when they scroll into view
    · Optional right-side slot "bar-extra" for custom action buttons
  -->
  <div ref="windowEl" class="os-window" :class="{ 'os-minimized': minimized }">

    <!-- ── Title bar ─────────────────────────────────────────────── -->
    <div class="os-bar" @dblclick="minimized = !minimized">

      <!-- Traffic lights -->
      <span class="tl red"    title="close"    />
      <span class="tl yellow" title="minimise" @click.stop="toggleMinimize" />
      <span class="tl green"  title="maximise" />

      <!-- Shell path breadcrumb -->
      <span class="os-path">
        <span class="os-path-user">aayush@portfolio</span>
        <span class="os-path-sep">:</span>
        <span class="os-path-dir">{{ path }}</span>
        <span class="os-path-prompt">$</span>
        <span class="os-path-cmd">{{ cmd }}</span>
      </span>

      <!-- Right-side slot + minimize button -->
      <div class="os-bar-right">
        <slot name="bar-extra" />
        <button
          class="tl-min-btn"
          :title="minimized ? 'Expand' : 'Minimise'"
          @click.stop="toggleMinimize"
        >
          <i :class="minimized ? 'fas fa-chevron-down' : 'fas fa-minus'" />
        </button>
      </div>
    </div>

    <!-- ── Window body (collapses on minimise) ────────────────────── -->
    <Transition name="os-collapse">
      <div v-if="!minimized" class="os-body">
        <slot />
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { animate, inView }             from 'motion'

const props = defineProps({
  /** Shell path shown after the colon: ~/projects, ~/stack, etc. */
  path:  { type: String, default: '~/portfolio' },
  /** Command shown after the $ prompt */
  cmd:   { type: String, default: ''            },
  /**
   * Extra stagger delay in ms applied on top of the inView trigger.
   * Keep small (0–200) since inView already ensures above-the-fold-only animation.
   */
  delay: { type: Number, default: 0             },
})

const windowEl  = ref(null)
const minimized = ref(false)

// Animate the yellow light minimise along a scale-down path
function toggleMinimize() {
  if (!windowEl.value) { minimized.value = !minimized.value; return }

  if (!minimized.value) {
    // Collapsing: subtle bar-only shake
    animate(windowEl.value, { scaleY: [1, 0.98, 1] }, { duration: 0.25 })
  }
  minimized.value = !minimized.value
}

// Boot animation: fires when the window enters the viewport
// (inView guarantees below-fold windows animate correctly on scroll)
let stopInView = null
onMounted(() => {
  if (!windowEl.value) return
  stopInView = inView(
    windowEl.value,
    () => {
      animate(
        windowEl.value,
        { opacity: [0, 1], scale: [0.97, 1], y: [18, 0] },
        { duration: 0.52, delay: props.delay / 1000, easing: [0.22, 1, 0.36, 1] },
      )
    },
    { amount: 0.08 },
  )
})
onUnmounted(() => stopInView?.())
</script>

<style scoped>
/* ── Shell ────────────────────────────────────────────────────────── */
.os-window {
  background    : var(--bg-card);
  border        : 1px solid var(--border-color);
  border-radius : var(--radius-lg);
  overflow      : hidden;
  box-shadow    : 0 20px 60px rgba(0,0,0,0.35),
                  0 0 0 1px rgba(255,255,255,0.04) inset;
  /* starts invisible — inView + Motion animates to 1 */
  opacity       : 0;
  transition    : border-color 0.3s, box-shadow 0.3s;
  will-change   : transform, opacity;
}
.os-window:hover {
  border-color : var(--border-glow);
  box-shadow   : 0 24px 70px rgba(0,0,0,0.4), var(--shadow-glow);
}
.os-minimized {
  overflow      : visible;
}

/* ── Title bar ───────────────────────────────────────────────────── */
.os-bar {
  display        : flex;
  align-items    : center;
  gap            : 7px;
  padding        : 10px 16px;
  background     : rgba(255,255,255,0.025);
  border-bottom  : 1px solid rgba(255,255,255,0.055);
  cursor         : default;
  user-select    : none;
  flex-shrink    : 0;
}

/* Traffic lights */
.tl {
  width         : 12px;
  height        : 12px;
  border-radius : 50%;
  flex-shrink   : 0;
  cursor        : pointer;
  transition    : filter 0.15s;
}
.tl:hover { filter: brightness(1.3); }
.tl.red    { background: #ff5f57; }
.tl.yellow { background: #febc2e; }
.tl.green  { background: #28c840; }

/* Path display */
.os-path {
  font-family  : var(--font-mono);
  font-size    : 0.7rem;
  color        : rgba(255,255,255,0.2);
  margin-left  : 10px;
  display      : flex;
  align-items  : center;
  gap          : 2px;
  overflow     : hidden;
  white-space  : nowrap;
  flex         : 1;
  min-width    : 0;
}
.os-path-user   { color: rgba(16,185,129,0.75); flex-shrink: 0; }
.os-path-sep    { color: rgba(255,255,255,0.2);  flex-shrink: 0; }
.os-path-dir    { color: rgba(121,192,255,0.75); flex-shrink: 0; }
.os-path-prompt { color: rgba(255,255,255,0.25); margin: 0 5px; flex-shrink: 0; }
.os-path-cmd    { color: rgba(255,255,255,0.45); overflow: hidden; text-overflow: ellipsis; }

/* Right side */
.os-bar-right {
  margin-left  : auto;
  display      : flex;
  align-items  : center;
  gap          : 8px;
  flex-shrink  : 0;
}
.tl-min-btn {
  color         : var(--text-muted);
  font-size     : 0.62rem;
  padding       : 3px 7px;
  border-radius : 3px;
  transition    : color 0.15s, background 0.15s;
  cursor        : pointer;
}
.tl-min-btn:hover {
  color      : var(--text-secondary);
  background : rgba(255,255,255,0.07);
}

/* ── Window body ─────────────────────────────────────────────────── */
.os-body { overflow: hidden; }

/* ── Collapse / expand transition ────────────────────────────────── */
.os-collapse-enter-active,
.os-collapse-leave-active {
  transition : opacity 0.22s ease, max-height 0.3s cubic-bezier(0.4,0,0.2,1);
  max-height : 9999px;
  overflow   : hidden;
}
.os-collapse-enter-from,
.os-collapse-leave-to   { opacity: 0; max-height: 0; }
</style>
