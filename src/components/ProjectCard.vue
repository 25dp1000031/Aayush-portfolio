<template>
  <!-- Individual project card: header, arch flow, highlights, API docs -->
  <div class="project-card reveal" :data-delay="delay">

    <!-- Admin: delete this project -->
    <button
      v-if="isAdmin"
      class="btn-delete-project"
      title="Remove project"
      @click="portfolioStore.removeProject(project.id)"
    >
      <i class="fas fa-times"></i> Remove
    </button>

    <!-- ── Header ── -->
    <div class="card-header">
      <div class="proj-index">{{ project.index ?? String(idx + 1).padStart(2, '0') }}</div>
      <div class="proj-title-block">
        <h3 class="proj-name">
          <AdminField v-model="project.name">{{ project.name }}</AdminField>
        </h3>
        <p class="proj-tagline">
          <AdminField v-model="project.tagline">{{ project.tagline }}</AdminField>
        </p>
        <span class="proj-affiliation">
          <i class="fas fa-link"></i>
          <AdminField v-model="project.affiliation" style="min-width:180px">{{ project.affiliation }}</AdminField>
        </span>
      </div>
      <div class="proj-links">
        <a :href="project.github" target="_blank" rel="noopener" class="link-btn">
          <i class="fab fa-github"></i> GitHub
        </a>
        <a v-if="project.live" :href="project.live" target="_blank" rel="noopener" class="link-btn live">
          <i class="fas fa-external-link-alt"></i> Live
        </a>
      </div>
    </div>

    <!-- ── Architecture flow diagram (static SVG, not store-driven) ── -->
    <div v-if="project.archFlow" class="card-section">
      <ArchFlowDiagram :flow="project.archFlow" :projectName="project.name" />
    </div>

    <!-- ── Body: highlights + stack ── -->
    <div class="card-body">
      <div class="highlights">

        <!-- Admin: add highlight -->
        <div v-if="isAdmin" class="admin-toolbar-inline">
          <button class="btn-add-inline" @click="portfolioStore.addProjectHighlight(project.id)">
            <i class="fas fa-plus"></i> Add Highlight
          </button>
        </div>

        <div
          v-for="(h, hi) in project.highlights"
          :key="h.title + hi"
          class="highlight"
        >
          <!-- colour is always a hex value from the store -->
          <i :class="h.icon" :style="{ color: h.color }" class="h-icon"></i>
          <div class="h-content">
            <strong class="h-title">
              <AdminField v-model="h.title">{{ h.title }}</AdminField>
            </strong>
            <p class="h-desc">
              <AdminField v-model="h.desc" :multiline="true" :rows="2">{{ h.desc }}</AdminField>
            </p>
          </div>
          <button
            v-if="isAdmin"
            class="btn-del-highlight"
            @click="portfolioStore.removeProjectHighlight(project.id, hi)"
            title="Delete highlight"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <!-- Stack pills -->
      <div class="stack-pills">
        <div class="pills-wrap">
          <span
            v-for="(s, si) in project.stack"
            :key="si"
            class="pill"
          >
            <AdminField v-model="project.stack[si]" style="min-width:40px">{{ s }}</AdminField>
            <button
              v-if="isAdmin"
              class="btn-del-pill"
              @click="portfolioStore.removeProjectStackItem(project.id, si)"
              title="Remove"
            >
              <i class="fas fa-times"></i>
            </button>
          </span>
        </div>
        <button
          v-if="isAdmin"
          class="btn-add-pill"
          @click="portfolioStore.addProjectStackItem(project.id)"
        >
          <i class="fas fa-plus"></i> Add
        </button>
      </div>
    </div>

    <!-- ── Interactive API documentation block (static, not store-driven) ── -->
    <div v-if="project.apiDocs" class="card-section api-section">
      <ApiDocBlock :docs="project.apiDocs" />
    </div>

  </div>
</template>

<script setup>
import { storeToRefs }       from 'pinia'
import ArchFlowDiagram       from './ArchFlowDiagram.vue'
import ApiDocBlock           from './ApiDocBlock.vue'
import AdminField            from './AdminField.vue'
import { usePortfolioStore } from '@/stores/portfolio'
import { useAuthStore }      from '@/stores/auth'

defineProps({
  project: { type: Object, required: true },
  idx:     { type: Number, default: 0 },
  delay:   { type: Number, default: 0 },
})

const portfolioStore = usePortfolioStore()
const { isAdmin }    = storeToRefs(useAuthStore())
</script>

<style scoped>
.project-card {
  background    : var(--bg-card);
  border        : 1px solid var(--border-color);
  border-radius : var(--radius-lg);
  margin-bottom : 36px;
  overflow      : hidden;
  transition    : var(--transition);
  position      : relative;
}
.project-card:hover {
  border-color : var(--border-glow);
  box-shadow   : var(--shadow-glow);
  transform    : translateY(-3px);
}

/* Delete button */
.btn-delete-project {
  position  : absolute; top: 12px; right: 12px; z-index: 2;
  display   : flex; align-items: center; gap: 5px;
  font-family: var(--font-mono); font-size: 0.65rem;
  color     : var(--accent-red); border: 1px solid rgba(239,68,68,0.3);
  background: rgba(239,68,68,0.06); padding: 4px 10px;
  border-radius: 4px; cursor: pointer; transition: all 0.2s;
}
.btn-delete-project:hover { background: rgba(239,68,68,0.14); }

/* Header */
.card-header {
  display    : flex; align-items: flex-start;
  gap        : 20px; padding: 24px 28px;
  border-bottom: 1px solid var(--border-color); flex-wrap: wrap;
}

.proj-index {
  font-family : var(--font-mono); font-size: 2.2rem; font-weight: 700;
  color       : var(--border-color); line-height: 1; flex-shrink: 0; min-width: 48px;
}

.proj-title-block { flex: 1; }
.proj-name { font-size: 1.25rem; font-weight: 700; margin-bottom: 3px; }
.proj-tagline { font-size: 0.84rem; color: var(--text-secondary); margin-bottom: 6px; }
.proj-affiliation {
  font-family : var(--font-mono); font-size: 0.7rem; color: var(--text-muted);
  display     : inline-flex; align-items: center; gap: 5px;
}

.proj-links { display: flex; gap: 8px; flex-shrink: 0; }
.link-btn {
  display     : inline-flex; align-items: center; gap: 6px;
  font-family : var(--font-mono); font-size: 0.78rem;
  color       : var(--text-secondary); border: 1px solid var(--border-color);
  padding     : 6px 14px; border-radius: var(--radius-xs); transition: var(--transition);
}
.link-btn:hover { color: var(--text-primary); border-color: var(--accent-green); background: rgba(16,185,129,0.06); }
.link-btn.live  { color: var(--accent-green); border-color: rgba(16,185,129,0.3); }

/* Sections */
.card-section { padding: 20px 28px; border-bottom: 1px solid var(--border-color); }
.api-section  { border-bottom: none; padding: 20px 28px 28px; }

/* Body */
.card-body {
  padding  : 20px 28px;
  border-bottom: 1px solid var(--border-color);
  display  : grid; grid-template-columns: 1fr auto;
  gap      : 24px; align-items: start;
}

/* Admin inline toolbar */
.admin-toolbar-inline { margin-bottom: 10px; }
.btn-add-inline {
  display      : inline-flex; align-items: center; gap: 6px;
  font-family  : var(--font-mono); font-size: 0.68rem;
  color        : var(--accent-green); border: 1px dashed rgba(16,185,129,0.35);
  padding      : 3px 10px; border-radius: 4px; cursor: pointer; transition: all 0.2s;
}
.btn-add-inline:hover { background: rgba(16,185,129,0.08); }

/* Highlights */
.highlights { display: flex; flex-direction: column; gap: 0; }
.highlight {
  display : flex; gap: 14px; padding: 12px 0;
  border-bottom: 1px solid var(--border-color); align-items: flex-start;
  position: relative;
}
.highlight:last-child { border-bottom: none; }

.h-icon { font-size: 0.88rem; margin-top: 2px; flex-shrink: 0; width: 14px; }
/* colour driven by :style="{ color: h.color }" in template */

.h-content { flex: 1; }
.h-title { display: block; font-size: 0.84rem; margin-bottom: 2px; }
.h-desc  { font-size: 0.78rem; color: var(--text-secondary); line-height: 1.55; }

.btn-del-highlight {
  flex-shrink: 0; width: 18px; height: 18px; border-radius: 50%;
  background: rgba(239,68,68,0.08); color: var(--accent-red);
  border: 1px solid rgba(239,68,68,0.25);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.52rem; cursor: pointer; transition: all 0.2s;
  opacity: 0; margin-top: 2px;
}
.highlight:hover .btn-del-highlight { opacity: 1; }
.btn-del-highlight:hover { background: rgba(239,68,68,0.22); }

/* Stack pills */
.stack-pills {
  display       : flex; flex-direction: column; gap: 6px;
  flex-shrink   : 0; min-width: 130px;
}
.pills-wrap { display: flex; flex-direction: column; gap: 4px; }
.pill {
  white-space  : nowrap; display: inline-flex; align-items: center;
  gap          : 4px;
  font-family  : var(--font-mono); font-size: 0.75rem;
  background   : rgba(16,185,129,0.06); color: var(--text-secondary);
  border       : 1px solid var(--border-color); padding: 3px 10px;
  border-radius: var(--radius-xs);
}
.btn-del-pill {
  width: 12px; height: 12px; border-radius: 50%;
  background: rgba(239,68,68,0.08); color: var(--accent-red);
  border: 1px solid rgba(239,68,68,0.2);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.45rem; cursor: pointer; transition: all 0.2s;
}
.btn-del-pill:hover { background: rgba(239,68,68,0.22); }
.btn-add-pill {
  display     : inline-flex; align-items: center; gap: 5px;
  font-family : var(--font-mono); font-size: 0.65rem;
  color       : var(--accent-green); border: 1px dashed rgba(16,185,129,0.35);
  padding     : 3px 8px; border-radius: 4px; cursor: pointer; transition: all 0.2s;
}
.btn-add-pill:hover { background: rgba(16,185,129,0.08); }

/* Responsive */
@media (max-width: 700px) {
  .card-body     { grid-template-columns: 1fr; }
  .stack-pills   { flex-direction: row; flex-wrap: wrap; }
  .pills-wrap    { flex-direction: row; flex-wrap: wrap; }
}
</style>
