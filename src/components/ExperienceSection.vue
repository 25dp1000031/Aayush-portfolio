<template>
  <section class="section exp-section" id="experience">
    <div class="container">

      <div class="section-header reveal">
        <span class="section-label">// process.stdout.write(experience)</span>
        <h2 class="section-title">Work Experience</h2>
      </div>

      <!-- Admin: add a new job entry -->
      <div v-if="isAdmin" class="admin-toolbar">
        <button class="btn-add" @click="portfolioStore.addExperienceJob()">
          <i class="fas fa-plus"></i> Add New Job
        </button>
      </div>

      <div class="timeline">
        <div
          v-for="(job, ji) in experience"
          :key="job.id"
          class="timeline-item reveal"
          :data-delay="ji * 100"
        >
          <div class="tl-dot"></div>
          <div class="tl-content">

            <!-- Admin: delete job -->
            <button
              v-if="isAdmin"
              class="btn-delete-job"
              title="Remove job"
              @click="portfolioStore.removeExperienceJob(job.id)"
            >
              <i class="fas fa-times"></i> Delete
            </button>

            <div class="exp-header">
              <div>
                <h3
                  class="exp-role ce-edit"
                  :contenteditable="isAdmin"
                  @blur="(e) => portfolioStore.onEdit(job, 'role', e.target.innerText)"
                >{{ job.role }}</h3>
                <p class="exp-company">
                  <i class="fas fa-building"></i>
                  <span
                    class="ce-edit"
                    :contenteditable="isAdmin"
                    @blur="(e) => portfolioStore.onEdit(job, 'company', e.target.innerText)"
                  >{{ job.company }}</span>
                </p>
              </div>
              <div class="exp-meta">
                <span class="exp-period">
                  <i class="fas fa-calendar-alt"></i>
                  <span
                    class="ce-edit"
                    :contenteditable="isAdmin"
                    @blur="(e) => portfolioStore.onEdit(job, 'period', e.target.innerText)"
                  >{{ job.period }}</span>
                </span>
                <span class="exp-badge">
                  <span
                    class="ce-edit"
                    :contenteditable="isAdmin"
                    @blur="(e) => portfolioStore.onEdit(job, 'location', e.target.innerText)"
                  >{{ job.location }}</span>
                </span>
              </div>
            </div>

            <!-- Bullets -->
            <div v-if="isAdmin" class="admin-toolbar-inline">
              <button class="btn-add-inline" @click="portfolioStore.addBullet(job.id)">
                <i class="fas fa-plus"></i> Add Bullet Point
              </button>
            </div>

            <ul class="bullets">
              <li
                v-for="(bullet, bi) in job.bullets"
                :key="bi"
                class="bullet-item"
              >
                <button
                  v-if="isAdmin"
                  class="btn-del-bullet"
                  @click="portfolioStore.removeBullet(job.id, bi)"
                  title="Delete bullet"
                >
                  <i class="fas fa-times"></i>
                </button>
                <span
                  class="bullet-text ce-edit ce-block"
                  :contenteditable="isAdmin"
                  @blur="(e) => onBulletBlur(job.id, bi, e.target.innerText)"
                >{{ bullet }}</span>
              </li>
            </ul>

            <!-- Tags
                 Each tag is its own pill with inline contenteditable + delete.
                 In admin mode a [+ Add Tag] button appears at the end. -->
            <div class="exp-tags">
              <span
                v-for="(tag, ti) in (job.tags ?? [])"
                :key="ti"
                class="tag-item"
              >
                <span
                  class="ce-edit"
                  :contenteditable="isAdmin"
                  @blur="(e) => onTagBlur(job.id, ti, e.target.innerText)"
                >{{ tag }}</span>
                <button
                  v-if="isAdmin"
                  class="btn-del-tag"
                  @click="portfolioStore.removeTag(job.id, ti)"
                  title="Delete tag"
                >
                  <i class="fas fa-times"></i>
                </button>
              </span>
              <button
                v-if="isAdmin"
                class="btn-add-tag"
                @click="portfolioStore.addTag(job.id)"
                title="Add tag"
              >
                <i class="fas fa-plus"></i>
              </button>
            </div>

          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup>
import { storeToRefs }       from 'pinia'
import { usePortfolioStore } from '@/stores/portfolio'
import { useAuthStore }      from '@/stores/auth'

const portfolioStore = usePortfolioStore()
const { experience } = storeToRefs(portfolioStore)
const { isAdmin }    = storeToRefs(useAuthStore())

// Custom blur for bullet array items (index-based, not field-based)
function onBulletBlur(jobId, idx, value) {
  const job = experience.value.find(j => j.id === jobId)
  if (!job) return
  const v = String(value).trim()
  if (job.bullets[idx] === v) return
  job.bullets[idx] = v
  portfolioStore.markDirty()
}

// Per-tag blur — updates a single tag in the array by index
function onTagBlur(jobId, idx, value) {
  const job = experience.value.find(j => j.id === jobId)
  if (!job?.tags) return
  const v = String(value).trim()
  if (job.tags[idx] === v) return
  job.tags[idx] = v
  portfolioStore.markDirty()
}
</script>

<style scoped>
.exp-section { background: var(--bg-primary); }
.section-header { margin-bottom: 48px; }

/* Admin toolbar */
.admin-toolbar {
  display: flex; justify-content: flex-end; margin-bottom: 24px;
}
.btn-add {
  display: flex; align-items: center; gap: 7px;
  font-family: var(--font-mono); font-size: 0.74rem;
  color: var(--accent-green); border: 1px dashed rgba(16,185,129,0.4);
  padding: 7px 16px; border-radius: 6px; cursor: pointer; transition: all 0.2s;
}
.btn-add:hover { background: rgba(16,185,129,0.08); border-color: rgba(16,185,129,0.6); }

.admin-toolbar-inline { margin-bottom: 8px; }
.btn-add-inline {
  display: inline-flex; align-items: center; gap: 6px;
  font-family: var(--font-mono); font-size: 0.68rem;
  color: var(--accent-green); border: 1px dashed rgba(16,185,129,0.35);
  padding: 3px 10px; border-radius: 4px; cursor: pointer; transition: all 0.2s;
}
.btn-add-inline:hover { background: rgba(16,185,129,0.08); }

/* Timeline */
.timeline { position: relative; padding-left: 20px; }
.timeline::before {
  content: ''; position: absolute;
  left: 0; top: 0; bottom: 0; width: 2px;
  background: linear-gradient(to bottom, var(--accent-green), transparent);
  border-radius: 2px;
}

.timeline-item { position: relative; padding-left: 36px; margin-bottom: 28px; }
.timeline-item:last-child { margin-bottom: 0; }

.tl-dot {
  position: absolute; left: -26px; top: 8px;
  width: 12px; height: 12px;
  background: var(--accent-green); border-radius: 50%;
  border: 2px solid var(--bg-primary);
  box-shadow: 0 0 0 3px rgba(16,185,129,0.2);
}

.tl-content {
  background: var(--bg-card); border: 1px solid var(--border-color);
  border-radius: var(--radius-md); padding: 28px 30px;
  transition: var(--transition); position: relative;
}
.tl-content:hover { border-color: var(--border-glow); box-shadow: var(--shadow-glow); }

/* Delete job button */
.btn-delete-job {
  position: absolute; top: 12px; right: 12px;
  display: flex; align-items: center; gap: 5px;
  font-family: var(--font-mono); font-size: 0.65rem;
  color: var(--accent-red); border: 1px solid rgba(239,68,68,0.3);
  background: rgba(239,68,68,0.06); padding: 4px 10px;
  border-radius: 4px; cursor: pointer; transition: all 0.2s;
}
.btn-delete-job:hover { background: rgba(239,68,68,0.14); }

/* Header */
.exp-header {
  display: flex; justify-content: space-between;
  align-items: flex-start; gap: 16px;
  margin-bottom: 20px; flex-wrap: wrap;
}
.exp-role    { font-size: 1.1rem; font-weight: 600; margin-bottom: 4px; }
.exp-company { font-size: 0.875rem; color: var(--accent-blue); display: flex; align-items: center; gap: 6px; }
.exp-meta    { text-align: right; }

.exp-period {
  display: flex; align-items: center; gap: 6px;
  font-size: 0.78rem; font-family: var(--font-mono);
  color: var(--text-secondary); white-space: nowrap; margin-bottom: 6px;
}
.exp-badge {
  font-size: 0.7rem; padding: 2px 9px;
  border-radius: var(--radius-xs);
  background: rgba(59,130,246,0.1);
  color: var(--accent-blue); border: 1px solid rgba(59,130,246,0.2);
  display: inline-flex; align-items: center; gap: 4px;
}

/* Bullets */
.bullets { list-style: none; margin-bottom: 20px; }
.bullet-item {
  display: flex; align-items: flex-start; gap: 8px;
  padding: 4px 0; position: relative;
}
.bullet-item::before { content: '▸'; color: var(--accent-green); flex-shrink: 0; margin-top: 1px; }
.bullet-text { flex: 1; font-size: 0.88rem; color: var(--text-secondary); line-height: 1.65; }

.btn-del-bullet {
  flex-shrink: 0; width: 16px; height: 16px; border-radius: 50%;
  background: rgba(239,68,68,0.1); color: var(--accent-red);
  border: 1px solid rgba(239,68,68,0.3);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.52rem; cursor: pointer; transition: all 0.2s;
  margin-top: 3px; opacity: 0;
}
.bullet-item:hover .btn-del-bullet { opacity: 1; }
.btn-del-bullet:hover { background: rgba(239,68,68,0.22); }

/* Tags */
.exp-tags { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.tag-item {
  display: inline-flex; align-items: center; gap: 4px;
  font-family: var(--font-mono); font-size: 0.7rem;
  padding: 2px 8px; border-radius: var(--radius-xs);
  background: var(--bg-secondary); color: var(--text-muted);
  border: 1px solid var(--border-color);
}
.btn-del-tag {
  width: 13px; height: 13px; border-radius: 50%;
  background: rgba(239,68,68,0.08); color: var(--accent-red);
  border: 1px solid rgba(239,68,68,0.25);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.48rem; cursor: pointer; transition: all 0.2s;
}
.btn-del-tag:hover { background: rgba(239,68,68,0.22); }
.btn-add-tag {
  width: 22px; height: 22px; border-radius: 50%;
  background: rgba(16,185,129,0.08); color: var(--accent-green);
  border: 1px dashed rgba(16,185,129,0.4);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.6rem; cursor: pointer; transition: all 0.2s;
}
.btn-add-tag:hover { background: rgba(16,185,129,0.15); }

@media (max-width: 680px) {
  .exp-header { flex-direction: column; }
  .exp-meta   { text-align: left; }
}
</style>
