<template>
  <!-- Engine room — skills grouped like system services + radar proficiency chart -->
  <section class="section stack-section" id="stack">
    <div class="container">
      <div class="section-header reveal">
        <span class="section-label">// infrastructure.map()</span>
        <h2 class="section-title">The Engine Room</h2>
        <p class="section-sub">Technologies powering every system I build</p>
      </div>

      <!-- Admin: add group -->
      <div v-if="isAdmin" class="admin-toolbar">
        <button class="btn-add" @click="portfolioStore.addSkillGroup()">
          <i class="fas fa-plus"></i> Add Group
        </button>
      </div>

      <!-- Two-column split: skill cards | radar chart -->
      <div class="engine-layout">

        <!-- Skills grid (left) -->
        <div class="stack-grid">
          <div
            v-for="(group, i) in skills.groups"
            :key="group.id"
            class="stack-card reveal"
            :data-delay="i * 80"
          >
            <!-- Admin: delete group -->
            <button
              v-if="isAdmin"
              class="btn-del-group"
              @click="portfolioStore.removeSkillGroup(group.id)"
              title="Remove group"
            >
              <i class="fas fa-times"></i>
            </button>

            <div class="card-icon"><i :class="group.icon"></i></div>

            <h3
              class="card-title ce-edit"
              :contenteditable="isAdmin"
              @blur="(e) => portfolioStore.onEdit(group, 'title', e.target.innerText)"
            >{{ group.title }}</h3>

            <!-- Skills
                 View mode: chip rendering, one per skill
                 Edit mode: a single comma-separated list of labels per spec -->
            <div class="tags">
              <template v-if="!isAdmin">
                <span
                  v-for="skill in group.skills"
                  :key="skill.id"
                  class="skill-tag"
                  :class="skill.accent"
                >
                  <i v-if="skill.icon" :class="skill.icon"></i>
                  {{ skill.label }}
                </span>
              </template>

              <template v-else>
                <span
                  v-for="skill in group.skills"
                  :key="skill.id"
                  class="skill-tag"
                  :class="skill.accent"
                >
                  <i v-if="skill.icon" :class="skill.icon"></i>
                  <span
                    class="ce-edit"
                    :contenteditable="isAdmin"
                    @blur="(e) => portfolioStore.onEdit(skill, 'label', e.target.innerText)"
                  >{{ skill.label }}</span>
                  <button
                    class="btn-del-skill"
                    @click="portfolioStore.removeSkillItem(group.id, skill.id)"
                    title="Remove skill"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </span>
              </template>
            </div>

            <!-- Admin: add skill item -->
            <button
              v-if="isAdmin"
              class="btn-add-skill"
              @click="portfolioStore.addSkillItem(group.id)"
            >
              <i class="fas fa-plus"></i> Add Skill
            </button>

          </div>
        </div>

        <!-- Proficiency radar (right) — already store-driven via SkillsChart.vue -->
        <div class="radar-col reveal from-right" data-delay="200">
          <SkillsChart />
        </div>

      </div>
    </div>
  </section>
</template>

<script setup>
import { storeToRefs }       from 'pinia'
import SkillsChart           from './SkillsChart.vue'
import { usePortfolioStore } from '@/stores/portfolio'
import { useAuthStore }      from '@/stores/auth'

const portfolioStore = usePortfolioStore()
const { skills }     = storeToRefs(portfolioStore)
const { isAdmin }    = storeToRefs(useAuthStore())
</script>

<style scoped>
.stack-section { background: var(--bg-secondary); }
.section-header { margin-bottom: 52px; }

/* Admin toolbar */
.admin-toolbar {
  display: flex; justify-content: flex-end; margin-bottom: 20px;
}
.btn-add {
  display: flex; align-items: center; gap: 7px;
  font-family: var(--font-mono); font-size: 0.74rem;
  color: var(--accent-green); border: 1px dashed rgba(16,185,129,0.4);
  padding: 7px 16px; border-radius: 6px; cursor: pointer; transition: all 0.2s;
}
.btn-add:hover { background: rgba(16,185,129,0.08); border-color: rgba(16,185,129,0.6); }

/* Two-column layout */
.engine-layout {
  display               : grid;
  grid-template-columns : 1fr 340px;
  gap                   : 32px;
  align-items           : start;
}

.stack-grid {
  display               : grid;
  grid-template-columns : repeat(3, 1fr);
  gap                   : 18px;
}

.stack-card {
  background    : var(--bg-card);
  border        : 1px solid var(--border-color);
  border-radius : var(--radius-md);
  padding       : 24px 20px;
  transition    : var(--transition);
  position      : relative;
}
.stack-card:hover {
  transform    : translateY(-4px);
  border-color : var(--border-glow);
  box-shadow   : var(--shadow-glow);
}

.btn-del-group {
  position  : absolute; top: 8px; right: 8px;
  width     : 20px; height: 20px; border-radius: 50%;
  background: rgba(239,68,68,0.08); color: var(--accent-red);
  border    : 1px solid rgba(239,68,68,0.25);
  display   : flex; align-items: center; justify-content: center;
  font-size : 0.55rem; cursor: pointer; transition: all 0.2s; opacity: 0;
}
.stack-card:hover .btn-del-group { opacity: 1; }
.btn-del-group:hover { background: rgba(239,68,68,0.22); }

.card-icon {
  width: 38px; height: 38px;
  background    : rgba(16,185,129,0.1);
  border-radius : var(--radius-xs);
  display       : flex; align-items: center; justify-content: center;
  color         : var(--accent-green); font-size: 0.95rem; margin-bottom: 14px;
}
.card-title { font-size: 0.88rem; font-weight: 600; margin-bottom: 14px; }
.tags       { display: flex; flex-wrap: wrap; gap: 5px; }

.skill-tag {
  font-family   : var(--font-mono); font-size: 0.7rem;
  padding       : 3px 9px; border-radius: var(--radius-xs);
  background    : var(--bg-secondary); color: var(--text-secondary);
  border        : 1px solid var(--border-color);
  display       : inline-flex; align-items: center; gap: 4px;
  transition    : var(--transition);
}
.skill-tag:hover { color: var(--text-primary); border-color: var(--accent-green); }
.skill-tag.green { color: var(--accent-green); border-color: rgba(16,185,129,0.25); background: rgba(16,185,129,0.08); }
.skill-tag.blue  { color: var(--accent-blue);  border-color: rgba(59,130,246,0.25); background: rgba(59,130,246,0.08); }

.btn-del-skill {
  width: 11px; height: 11px; border-radius: 50%;
  background: rgba(239,68,68,0.08); color: var(--accent-red);
  border: 1px solid rgba(239,68,68,0.2);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.4rem; cursor: pointer; transition: all 0.2s;
}
.btn-del-skill:hover { background: rgba(239,68,68,0.22); }

.btn-add-skill {
  display    : inline-flex; align-items: center; gap: 5px;
  font-family: var(--font-mono); font-size: 0.64rem;
  color      : var(--accent-green); border: 1px dashed rgba(16,185,129,0.3);
  padding    : 3px 8px; border-radius: 4px; cursor: pointer; transition: all 0.2s;
  margin-top : 8px;
}
.btn-add-skill:hover { background: rgba(16,185,129,0.08); }

.radar-col { position: sticky; top: 88px; }

/* Responsive */
@media (max-width: 1200px) {
  .engine-layout { grid-template-columns: 1fr; }
  .radar-col { position: static; }
}
@media (max-width: 1024px) { .stack-grid { grid-template-columns: repeat(2,1fr); } }
@media (max-width: 600px)  { .stack-grid { grid-template-columns: 1fr; } }
</style>
