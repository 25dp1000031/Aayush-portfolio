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

      <!-- Admin: add project -->
      <div v-if="isAdmin" class="admin-toolbar">
        <button class="btn-add" @click="portfolioStore.addProject()">
          <i class="fas fa-plus"></i> Add Project
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
// Matching is positional: index 0 in store → index 0 in PROJECTS file.
// This keeps heavy SVG/Swagger mocks out of Supabase while keeping metadata editable.
const mergedProjects = computed(() =>
  projects.value.map((storeProj, i) => ({
    ...(PROJECTS[i] ?? {}),   // static: index, archFlow, apiDocs (may be undefined)
    ...storeProj,             // editable: name, tagline, stack, highlights, etc.
  }))
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
