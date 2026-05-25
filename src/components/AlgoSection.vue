<template>
  <!-- Algorithmic Engine — DSA repo, LeetCode telemetry, code preview -->
  <section class="section algo-section" id="algo">
    <div class="container">

      <!-- Section header -->
      <div class="section-header reveal">
        <span class="section-label">// algorithmic.engine()</span>
        <h2 class="section-title">Algorithmic Engine</h2>
        <p class="section-sub">
          Structured, pattern-based problem solving — organised by topic, not random
        </p>
      </div>

      <!-- Main grid: left (repo + telemetry) | right (code editor) -->
      <div class="algo-grid">

        <!-- ── LEFT COLUMN ── -->
        <div class="left-col">

          <!-- Interactive DSA repo card (static component, reads repoUrl from store) -->
          <DsaRepoCard class="reveal" data-delay="0" />

          <!-- LeetCode telemetry card — all data from store.dsa_data -->
          <div class="leet-card reveal" data-delay="120">
            <div class="leet-header">
              <div class="leet-icon"><i class="fas fa-code"></i></div>
              <div>
                <p class="leet-label">LEETCODE TELEMETRY</p>
                <p class="leet-sub">Verified problem-solving metrics</p>
              </div>
              <a
                :href="dsa.leetcodeUrl"
                target="_blank"
                rel="noopener"
                class="leet-link"
                @click.stop
              >
                <i class="fas fa-external-link-alt"></i>
              </a>
            </div>

            <!-- Animated counter + language badge -->
            <div class="stats-row">
              <div class="stat-block">
                <span class="stat-big" ref="leetEl">{{ animatedCount }}</span>
                <span class="stat-plus">+</span>
                <p class="stat-desc">Total Verifications</p>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-block">
                <span class="stat-lang">
                  <i class="fab fa-java"></i>
                  <AdminField v-model="dsa.primaryLang">{{ dsa.primaryLang }}</AdminField>
                </span>
                <p class="stat-desc">Core Runtime Env.</p>
              </div>
            </div>

            <!-- Admin: editable LeetCode count -->
            <div v-if="isAdmin" class="admin-count-row">
              <label class="admin-count-label">// leetcodeCount</label>
              <input
                v-model.number="dsa.leetcodeCount"
                type="number" min="0"
                class="admin-count-input"
                @input="portfolioStore.markDirty()"
              />
            </div>

            <!-- Pattern breakdown progress bars -->
            <p class="pattern-heading">// focus_core_patterns</p>

            <!-- Admin: add pattern button -->
            <div v-if="isAdmin" class="admin-toolbar-inline">
              <button class="btn-add-inline" @click="portfolioStore.addDsaPattern()">
                <i class="fas fa-plus"></i> Add Pattern
              </button>
            </div>

            <div class="pattern-grid">
              <div
                v-for="(p, i) in dsa.patterns"
                :key="p.name + i"
                class="pattern-row"
                :class="{ active: activePattern === i }"
                @mouseenter="activePattern = i"
                @mouseleave="activePattern = null"
              >
                <!-- Delete button (admin) -->
                <button
                  v-if="isAdmin"
                  class="btn-del-pattern"
                  @click="portfolioStore.removeDsaPattern(i)"
                >
                  <i class="fas fa-times"></i>
                </button>

                <div class="pattern-left">
                  <i :class="p.icon" :style="{ color: p.color }"></i>
                  <AdminField v-model="p.name" style="min-width:120px">
                    <span class="pattern-name">{{ p.name }}</span>
                  </AdminField>
                </div>
                <div class="pattern-bar-wrap">
                  <div
                    class="pattern-bar"
                    :style="{ width: isVisible ? p.pct + '%' : '0%', background: p.color }"
                  ></div>
                </div>
                <AdminField
                  v-model.number="p.pct"
                  style="width:40px; text-align:right"
                  :field-class="'pattern-pct-input'"
                >
                  <span class="pattern-pct" :style="{ color: p.color }">{{ p.pct }}%</span>
                </AdminField>
              </div>
            </div>
          </div>
        </div>

        <!-- ── RIGHT COLUMN: Code editor ── -->
        <div class="right-col reveal from-right" data-delay="80">
          <div class="editor-label">
            <span class="section-label">// interactive_snippet_preview</span>
            <p class="editor-sub">Toggle between Java DSA solution patterns</p>
          </div>
          <CodeSnippetPreview />
        </div>

      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { storeToRefs }       from 'pinia'
import DsaRepoCard            from './DsaRepoCard.vue'
import CodeSnippetPreview     from './CodeSnippetPreview.vue'
import AdminField             from './AdminField.vue'
import { usePortfolioStore }  from '@/stores/portfolio'
import { useAuthStore }       from '@/stores/auth'
import { useCounter }         from '@/composables/useCounter'

// ── Store bindings ─────────────────────────────────────────────────────
const portfolioStore = usePortfolioStore()
const { dsa_data: dsa } = storeToRefs(portfolioStore)
const { isAdmin }    = storeToRefs(useAuthStore())

// ── Animated LeetCode counter ──────────────────────────────────────────
// Re-runs whenever dsa.leetcodeCount changes (e.g. admin edits the value).
const leetEl       = ref(null)
const targetCount  = computed(() => dsa.value.leetcodeCount ?? 150)
const { count: animatedCount } = useCounter(leetEl, targetCount, 1600)

// ── Progress bar visibility ────────────────────────────────────────────
const activePattern = ref(null)
const isVisible     = ref(false)

let observer = null
onMounted(() => {
  observer = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { isVisible.value = true; observer.disconnect() }
  }, { threshold: 0.2 })
  const section = document.getElementById('algo')
  if (section) observer.observe(section)
})
onUnmounted(() => observer?.disconnect())
</script>

<style scoped>
.algo-section { background: var(--bg-secondary); }
.section-header { margin-bottom: 52px; }

/* Main grid */
.algo-grid {
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  gap: 28px;
  align-items: start;
}

/* Left column */
.left-col { display: flex; flex-direction: column; gap: 20px; }

/* LeetCode telemetry card */
.leet-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 22px;
  transition: var(--transition);
}
.leet-card:hover { border-color: var(--border-glow); box-shadow: var(--shadow-glow); }

.leet-header {
  display: flex; align-items: center; gap: 12px; margin-bottom: 20px;
}
.leet-icon {
  width:38px; height:38px;
  background:rgba(16,185,129,0.1); border-radius:var(--radius-xs);
  display:flex; align-items:center; justify-content:center;
  color:var(--accent-green); font-size:0.95rem; flex-shrink:0;
}
.leet-label {
  font-family:var(--font-mono); font-size:0.68rem; font-weight:600;
  letter-spacing:0.08em; color:var(--text-secondary); margin-bottom:2px;
}
.leet-sub   { font-size:0.7rem; color:var(--text-muted); }
.leet-link  { margin-left:auto; color:var(--text-muted); font-size:0.78rem; transition:color 0.2s; }
.leet-link:hover { color:var(--accent-green); }

/* Stats row */
.stats-row {
  display:flex; align-items:center; gap:20px;
  margin-bottom:20px; padding-bottom:20px;
  border-bottom:1px solid var(--border-color);
}
.stat-block  { text-align:center; }
.stat-big    { font-family:var(--font-mono); font-size:2.6rem; font-weight:700; color:var(--accent-green); line-height:1; }
.stat-plus   { font-family:var(--font-mono); font-size:1.2rem; color:var(--accent-green); }
.stat-desc   { font-size:0.7rem; color:var(--text-muted); font-family:var(--font-mono); margin-top:4px; }
.stat-divider{ width:1px; height:48px; background:var(--border-color); flex-shrink:0; }
.stat-lang   { font-family:var(--font-mono); font-size:1.1rem; font-weight:600; color:#f0883e; display:flex; align-items:center; gap:6px; }

/* Admin count editor */
.admin-count-row {
  display:flex; align-items:center; gap:10px; margin-bottom:12px;
}
.admin-count-label { font-family:var(--font-mono); font-size:0.67rem; color:var(--text-muted); }
.admin-count-input {
  width:80px; background:rgba(16,185,129,0.06);
  border:1px dashed rgba(16,185,129,0.4); border-radius:4px;
  padding:3px 8px; font-family:var(--font-mono); font-size:0.82rem;
  color:var(--accent-green); outline:none;
}
.admin-count-input:focus { border-color:var(--accent-green); }

/* Pattern breakdown */
.pattern-heading { font-family:var(--font-mono); font-size:0.68rem; color:var(--text-muted); margin-bottom:8px; }

.admin-toolbar-inline { margin-bottom:10px; }
.btn-add-inline {
  display:inline-flex; align-items:center; gap:6px;
  font-family:var(--font-mono); font-size:0.7rem;
  color:var(--accent-green); border:1px dashed rgba(16,185,129,0.35);
  padding:4px 12px; border-radius:4px; cursor:pointer; transition:all 0.2s;
}
.btn-add-inline:hover { background:rgba(16,185,129,0.08); }

.pattern-grid { display:flex; flex-direction:column; gap:10px; }
.pattern-row {
  display:flex; align-items:center; gap:10px; padding:6px 8px;
  border-radius:var(--radius-xs); transition:background 0.2s; cursor:default; position:relative;
}
.pattern-row.active { background:rgba(255,255,255,0.03); }

.btn-del-pattern {
  position:absolute; left:-18px;
  width:16px; height:16px; border-radius:50%;
  background:rgba(239,68,68,0.1); color:var(--accent-red);
  border:1px solid rgba(239,68,68,0.3);
  display:flex; align-items:center; justify-content:center;
  font-size:0.52rem; cursor:pointer; transition:all 0.2s; opacity:0;
}
.pattern-row:hover .btn-del-pattern { opacity:1; }
.btn-del-pattern:hover { background:rgba(239,68,68,0.22); }

.pattern-left {
  display:flex; align-items:center; gap:8px; min-width:155px;
}
.pattern-left i  { font-size:0.78rem; width:14px; text-align:center; }
.pattern-name    { font-family:var(--font-mono); font-size:0.72rem; color:var(--text-secondary); }

.pattern-bar-wrap {
  flex:1; height:4px; background:var(--bg-secondary); border-radius:999px; overflow:hidden;
}
.pattern-bar {
  height:100%; border-radius:999px;
  transition:width 1.4s cubic-bezier(0.4,0,0.2,1);
}

.pattern-pct { font-family:var(--font-mono); font-size:0.65rem; width:32px; text-align:right; flex-shrink:0; }
.pattern-pct-input { font-family:var(--font-mono); font-size:0.65rem; width:40px; text-align:right; }

/* Right column */
.right-col {
  display:flex; flex-direction:column; gap:14px; min-height:540px;
}
.editor-sub {
  font-size:0.8rem; color:var(--text-secondary); margin-top:4px; margin-bottom:0;
}
.right-col :deep(.editor-widget) { flex:1; min-height:460px; }

/* Responsive */
@media (max-width: 900px) {
  .algo-grid { grid-template-columns: 1fr; }
  .right-col { min-height: 420px; }
}
</style>
