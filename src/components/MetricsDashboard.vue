<template>
  <!-- Telemetry-style system metrics dashboard — all data from portfolioStore -->
  <section class="section metrics-section" id="metrics">
    <div class="container">

      <!-- Dashboard header -->
      <div class="dash-header reveal">
        <div class="dash-left">
          <span class="section-label">// system.getMetrics()</span>
          <h2 class="section-title">Infrastructure Monitoring Dashboard</h2>
        </div>
        <div class="dash-status">
          <span class="status-dot"></span>
          <span class="status-label">OPERATIONAL</span>
          <span class="status-count">4/4 systems live</span>
        </div>
      </div>

      <!-- Metric panels row -->
      <div class="metrics-grid">

        <!-- ── Core Engine Status ── -->
        <div class="metric-panel reveal" data-delay="0">
          <div class="panel-header">
            <div class="panel-icon"><i class="fas fa-microchip"></i></div>
            <div>
              <p class="panel-label">CORE ENGINE STATUS</p>
              <p class="panel-sub">Runtime environments</p>
            </div>
          </div>
          <div class="service-list">
            <div class="service-row" v-for="s in ENGINE_SERVICES" :key="s.name">
              <span class="svc-dot" :style="{ background: s.color }"></span>
              <span class="svc-name">{{ s.name }}</span>
              <span class="svc-badge" :style="{ color: s.color, borderColor: s.color + '44', background: s.color + '14' }">
                {{ s.status }}
              </span>
            </div>
          </div>
          <div class="panel-footer">
            <span class="footer-text">
              {{ metrics.experienceMonths }} month{{ metrics.experienceMonths !== 1 ? 's' : '' }} production experience
            </span>
          </div>
        </div>

        <!-- ── DB Clusters ── -->
        <div class="metric-panel reveal" data-delay="100">
          <div class="panel-header">
            <div class="panel-icon blue"><i class="fas fa-database"></i></div>
            <div>
              <p class="panel-label">DATABASE CLUSTERS</p>
              <p class="panel-sub">Indexed &amp; optimized</p>
            </div>
          </div>
          <div class="service-list">
            <div class="service-row" v-for="db in DB_SERVICES" :key="db.name">
              <span class="svc-dot" style="background: var(--accent-blue)"></span>
              <span class="svc-name">{{ db.name }}</span>
              <span class="svc-tag">{{ db.tag }}</span>
            </div>
          </div>
          <div class="progress-bar-wrap">
            <div class="progress-label">
              <span>Query efficiency</span>
              <span class="prog-val">
                <AdminField
                  v-model.number="metrics.queryEfficiency"
                  style="width:36px; text-align:right"
                >{{ metrics.queryEfficiency }}</AdminField>%
              </span>
            </div>
            <div class="progress-bar">
              <div
                class="progress-fill blue"
                :style="{ width: metrics.queryEfficiency + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <!-- ── Algorithm Engine ── -->
        <div class="metric-panel metric-highlight reveal" data-delay="200">
          <div class="panel-header">
            <div class="panel-icon green"><i class="fas fa-code"></i></div>
            <div>
              <p class="panel-label">ALGORITHM ENGINE</p>
              <p class="panel-sub">LeetCode verification suite</p>
            </div>
          </div>
          <div class="big-stat">
            <span class="big-num" ref="leetcodeEl">{{ animatedLeet }}</span>
            <span class="big-unit">+</span>
          </div>
          <p class="big-label">Problems solved · verified</p>
          <div class="algo-tags">
            <span v-for="t in ALGO_TAGS" :key="t">{{ t }}</span>
          </div>
          <a :href="dsa.leetcodeUrl" target="_blank" rel="noopener" class="panel-link">
            View profile <i class="fas fa-arrow-right"></i>
          </a>
        </div>

        <!-- ── Academic Benchmarks ── -->
        <div class="metric-panel reveal" data-delay="300">
          <div class="panel-header">
            <div class="panel-icon yellow"><i class="fas fa-trophy"></i></div>
            <div>
              <p class="panel-label">ACADEMIC BENCHMARKS</p>
              <p class="panel-sub">Validated credentials</p>
            </div>
          </div>
          <div class="benchmark-list">

            <div class="benchmark-row">
              <div class="bench-icon" style="color:#F59E0B"><i class="fas fa-shield-alt"></i></div>
              <div>
                <strong class="bench-title">GATE CS 2026 — Qualified</strong>
                <p class="bench-desc">
                  Score:&nbsp;<AdminField v-model.number="metrics.gateScore" style="width:48px">{{ metrics.gateScore }}</AdminField>
                  &nbsp;·&nbsp;Rank:&nbsp;<AdminField v-model.number="metrics.gateRank" style="width:52px">{{ metrics.gateRank }}</AdminField>
                </p>
              </div>
            </div>

            <div class="benchmark-row">
              <div class="bench-icon" style="color:#8B5CF6"><i class="fas fa-graduation-cap"></i></div>
              <div>
                <strong class="bench-title">IIT Madras Diploma</strong>
                <p class="bench-desc">
                  CGPA&nbsp;<AdminField v-model.number="metrics.iitmCGPA" style="width:44px">{{ metrics.iitmCGPA }}</AdminField>
                  &nbsp;· BS Data Science &amp; Applications
                </p>
              </div>
            </div>

            <div class="benchmark-row">
              <div class="bench-icon" style="color:#3B82F6"><i class="fas fa-university"></i></div>
              <div>
                <strong class="bench-title">MCA — SGBAU</strong>
                <p class="bench-desc">
                  Grade&nbsp;<AdminField v-model="metrics.sgbauGrade" style="width:28px">{{ metrics.sgbauGrade }}</AdminField>
                  &nbsp;· Computer Science (2023–2025)
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed }     from 'vue'
import { storeToRefs }       from 'pinia'
import { usePortfolioStore } from '@/stores/portfolio'
import AdminField            from './AdminField.vue'
import { useCounter }        from '@/composables/useCounter'

const portfolioStore = usePortfolioStore()
const { metrics, dsa_data: dsa } = storeToRefs(portfolioStore)

// ── Animated LeetCode counter driven by store value ───────────────
const leetcodeEl   = ref(null)
const leetTarget   = computed(() => metrics.value.leetcodeCount ?? dsa.value.leetcodeCount ?? 150)
const { count: animatedLeet } = useCounter(leetcodeEl, leetTarget, 1600)

// ── Static service lists (these don't need store hydration) ──────
const ENGINE_SERVICES = [
  { name: 'Java / Spring Boot', color: '#10B981', status: 'ACTIVE' },
  { name: 'Python / Flask',     color: '#10B981', status: 'ACTIVE' },
  { name: 'REST API Layer',     color: '#3B82F6', status: 'ONLINE' },
  { name: 'JWT Auth Guard',     color: '#F59E0B', status: 'SECURE' },
]

const DB_SERVICES = [
  { name: 'PostgreSQL',     tag: 'Indexed · Optimized' },
  { name: 'MySQL',          tag: 'Indexed · Optimized' },
  { name: 'SQLAlchemy ORM', tag: 'v1.4 · Active'       },
]

const ALGO_TAGS = ['Arrays', 'Trees', 'Graphs', 'DP', 'Java']
</script>

<style scoped>
.metrics-section { background: var(--bg-primary); }

/* Dashboard header */
.dash-header {
  display: flex; align-items: flex-end; justify-content: space-between;
  margin-bottom: 40px; flex-wrap: wrap; gap: 16px;
}
.dash-status {
  display: flex; align-items: center; gap: 8px;
  font-family: var(--font-mono);
  background: rgba(16,185,129,0.06); border: 1px solid rgba(16,185,129,0.2);
  padding: 8px 16px; border-radius: var(--radius-sm);
}
.status-dot {
  width: 8px; height: 8px; background: var(--accent-green);
  border-radius: 50%; animation: pulse-dot 2s ease-in-out infinite;
}
.status-label {
  font-size: 0.75rem; font-weight: 600;
  color: var(--accent-green); letter-spacing: 0.06em;
}
.status-count { font-size: 0.72rem; color: var(--text-muted); }

/* Metrics grid */
.metrics-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;
}

/* Panel base */
.metric-panel {
  background: var(--bg-card); border: 1px solid var(--border-color);
  border-radius: var(--radius-md); padding: 24px 22px;
  transition: var(--transition); display: flex; flex-direction: column; gap: 16px;
}
.metric-panel:hover { transform: translateY(-4px); box-shadow: var(--shadow-glow); border-color: var(--border-glow); }
.metric-highlight {
  border-color: rgba(16,185,129,0.25);
  background: linear-gradient(145deg, var(--bg-card), rgba(16,185,129,0.04));
}

/* Panel header */
.panel-header { display: flex; align-items: flex-start; gap: 12px; }
.panel-icon {
  width: 38px; height: 38px; background: rgba(16,185,129,0.1);
  border-radius: var(--radius-xs); display: flex; align-items: center;
  justify-content: center; color: var(--accent-green); font-size: 0.9rem; flex-shrink: 0;
}
.panel-icon.blue   { background: rgba(59,130,246,0.1);  color: var(--accent-blue);   }
.panel-icon.yellow { background: rgba(245,158,11,0.1);  color: var(--accent-yellow); }
.panel-icon.green  { background: rgba(16,185,129,0.1);  color: var(--accent-green);  }

.panel-label { font-family: var(--font-mono); font-size: 0.68rem; font-weight: 600; letter-spacing: 0.08em; color: var(--text-secondary); margin-bottom: 2px; }
.panel-sub   { font-size: 0.72rem; color: var(--text-muted); }

/* Service list */
.service-list { display: flex; flex-direction: column; gap: 8px; }
.service-row  {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 0; border-bottom: 1px solid var(--border-color);
}
.service-row:last-child { border-bottom: none; }
.svc-dot  { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.svc-name { font-family: var(--font-mono); font-size: 0.75rem; flex: 1; }
.svc-badge {
  font-family: var(--font-mono); font-size: 0.6rem; font-weight: 700;
  padding: 1px 6px; border-radius: 3px; border: 1px solid; letter-spacing: 0.05em;
}
.svc-tag { font-family: var(--font-mono); font-size: 0.65rem; color: var(--text-muted); }

/* Panel footer */
.panel-footer { margin-top: auto; }
.footer-text  { font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono); }

/* Progress bar */
.progress-bar-wrap { margin-top: auto; }
.progress-label {
  display: flex; justify-content: space-between;
  font-size: 0.7rem; font-family: var(--font-mono);
  color: var(--text-muted); margin-bottom: 6px;
}
.prog-val { color: var(--accent-blue); display: flex; align-items: center; gap: 1px; }
.progress-bar {
  height: 4px; background: var(--bg-secondary); border-radius: 999px; overflow: hidden;
}
.progress-fill {
  height: 100%; border-radius: 999px; transition: width 1.2s ease;
}
.progress-fill.blue { background: linear-gradient(90deg, var(--accent-blue), var(--accent-cyan)); }

/* Big stat */
.big-stat  { display: flex; align-items: baseline; gap: 2px; }
.big-num   { font-family: var(--font-mono); font-size: 3rem; font-weight: 700; line-height: 1; color: var(--accent-green); }
.big-unit  { font-family: var(--font-mono); font-size: 1.4rem; color: var(--accent-green); }
.big-label { font-size: 0.75rem; color: var(--text-secondary); font-family: var(--font-mono); margin-top: -4px; }

.algo-tags { display: flex; flex-wrap: wrap; gap: 5px; }
.algo-tags span {
  font-family: var(--font-mono); font-size: 0.65rem; padding: 2px 7px;
  border-radius: 3px; background: rgba(16,185,129,0.08);
  color: var(--accent-green); border: 1px solid rgba(16,185,129,0.2);
}

.panel-link {
  display: inline-flex; align-items: center; gap: 5px;
  font-family: var(--font-mono); font-size: 0.72rem;
  color: var(--accent-green); transition: var(--transition); margin-top: auto;
}
.panel-link:hover { gap: 9px; }

/* Benchmarks */
.benchmark-list { display: flex; flex-direction: column; gap: 0; }
.benchmark-row  {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 10px 0; border-bottom: 1px solid var(--border-color);
}
.benchmark-row:last-child { border-bottom: none; }
.bench-icon  { font-size: 0.85rem; margin-top: 1px; flex-shrink: 0; width: 14px; }
.bench-title { display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 3px; }
.bench-desc  {
  font-size: 0.72rem; color: var(--text-secondary);
  font-family: var(--font-mono); display: flex; align-items: center; flex-wrap: wrap; gap: 2px;
}

/* Responsive */
@media (max-width: 1100px) { .metrics-grid { grid-template-columns: repeat(2,1fr); } }
@media (max-width: 600px)  { .metrics-grid { grid-template-columns: 1fr; } }
</style>
