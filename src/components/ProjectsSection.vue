<template>
  <!--
    Projects section — store-driven project list.
    Each store project is merged with its matching entry in PROJECTS (projects.js)
    so the static archFlow SVG + apiDocs survive without living in Supabase.
  -->
  <section class="section projects-section" id="projects">
    <div class="container">

      <div class="section-header reveal">
        <span class="section-label">// deployments.list()</span>
        <h2 class="section-title">System Architecture</h2>
        <p class="section-sub">Projects as architectural breakdowns — not just screenshots</p>
      </div>

      <!-- Admin: add a new project row -->
      <div v-if="isAdmin" class="admin-toolbar">
        <button class="btn-add" @click="portfolioStore.addProject()">
          <i class="fas fa-plus"></i> Add New Project
        </button>
      </div>

      <ProjectCard
        v-for="(project, i) in mergedProjects"
        :key="project.id"
        :project="project"
        :idx="i"
        :delay="i * 120"
      />

    </div>
  </section>
</template>

<script setup>
import { computed }          from 'vue'
import { storeToRefs }       from 'pinia'
import ProjectCard           from './ProjectCard.vue'
import { PROJECTS }          from '@/data/projects.js'
import { usePortfolioStore } from '@/stores/portfolio'
import { useAuthStore }      from '@/stores/auth'

const portfolioStore = usePortfolioStore()
const { projects }   = storeToRefs(portfolioStore)
const { isAdmin }    = storeToRefs(useAuthStore())

// Merge store (editable) data with static arch/api assets from projects.js.
// Matching is by normalized project NAME so reordering / inserting in the
// store doesn't break the SVG/Swagger pairings. The `index` field is
// always stripped from the static merge so the positional badge ('01',
// '02', …) reflects the project's order in the section.
//
// NULL-SAFETY: DB rows can have null values for fields that weren't
// explicitly committed.  We strip those nulls before spreading so the
// static archFlow / apiDocs / period survive even when the DB row has
// null for those columns.
const slug = (s) => String(s ?? '').toLowerCase().trim()
const nonNull = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v != null))

const mergedProjects = computed(() =>
  projects.value.map((storeProj, i) => {
    const staticMatch = PROJECTS.find(p => slug(p.name) === slug(storeProj.name))
    const { index, ...staticData } = staticMatch ?? {}
    return {
      ...staticData,          // archFlow + apiDocs (static, always present)
      ...nonNull(storeProj),  // editable fields win — but nulls don't erase statics
      index: String(i + 1).padStart(2, '0'),  // positional badge always reflects order
    }
  })
)
</script>

<style scoped>
.projects-section { background: var(--bg-secondary); }
.section-header   { margin-bottom: 56px; }

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
</style>
