<template>
  <!--
    Open-Source Engine — store-bound.
    v-for iterates `store.github_showcase` directly. The Pinia store seeds
    three resume-accurate repositories as DEFAULTS so the grid paints on
    first frame regardless of Supabase hydration latency.
  -->
  <section class="section github-section" id="github">
    <div class="container">

      <div class="section-header reveal">
        <span class="section-label">// open.source.engine()</span>
        <h2 class="section-title">Open-Source Engine</h2>
        <p class="section-sub">Pinned repositories — public infrastructure, actively maintained</p>

        <!-- Inline DB sync telemetry badge -->
        <DbStatusBadge class="header-badge" />
      </div>

      <!-- Admin: add a new repo -->
      <div v-if="isAdmin" class="admin-toolbar">
        <button class="btn-add" @click="portfolioStore.addGithubShowcaseItem()">
          <i class="fas fa-plus"></i> Add Repository
        </button>
      </div>

      <div class="repo-grid">
        <div
          v-for="(repo, i) in github_showcase"
          :key="repo.id ?? repo.url ?? i"
          class="repo-card reveal"
          :data-delay="i * 75"
        >

          <!-- Admin: delete repo -->
          <button
            v-if="isAdmin"
            class="btn-delete"
            title="Remove repo"
            @click="portfolioStore.removeGithubShowcaseItem(repo.id)"
          >
            <i class="fas fa-times"></i>
          </button>

          <!-- Card header: icon + name/tagline + stats + external link -->
          <div class="card-header">
            <div class="repo-icon"><i class="fab fa-github"></i></div>

            <div class="repo-meta">
              <!-- Name — link in view mode, contenteditable in admin mode -->
              <a
                v-if="!isAdmin"
                :href="repo.url"
                target="_blank"
                rel="noopener"
                class="repo-name-link"
              >{{ repo.name }}</a>
              <span
                v-else
                class="repo-name-link ce-edit"
                :contenteditable="isAdmin"
                data-placeholder="repository name"
                @blur="(e) => onRepoEdit(i, 'name', e.target.innerText)"
              >{{ repo.name }}</span>

              <!-- Tagline -->
              <p
                class="repo-tagline ce-edit"
                :contenteditable="isAdmin"
                data-placeholder="click to add tagline"
                @blur="(e) => onRepoEdit(i, 'tagline', e.target.innerText)"
              >{{ repo.tagline }}</p>

              <!-- Stats: stars, forks, language -->
              <div class="repo-stats">
                <span><i class="fas fa-star"></i> {{ repo.stars }}</span>
                <span><i class="fas fa-code-branch"></i> {{ repo.forks }}</span>
                <span class="lang-indicator">
                  <span class="lang-dot" :style="{ background: langColor(repo.language) }"></span>
                  <span>{{ repo.language }}</span>
                </span>
              </div>
            </div>

            <a :href="repo.url" target="_blank" rel="noopener" class="ext-link">
              <i class="fas fa-external-link-alt"></i>
            </a>
          </div>

          <!-- Description -->
          <div class="card-body">
            <p
              class="repo-desc ce-edit ce-block"
              :contenteditable="isAdmin"
              data-placeholder="click to describe this repository"
              @blur="(e) => onRepoEdit(i, 'description', e.target.innerText)"
            >{{ repo.description }}</p>
          </div>

          <!-- Topic chips -->
          <div class="topic-row">
            <span v-for="t in repo.topics" :key="t" class="topic-chip">{{ t }}</span>
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
import DbStatusBadge         from './DbStatusBadge.vue'

const portfolioStore       = usePortfolioStore()
const { github_showcase }  = storeToRefs(portfolioStore)
const { isAdmin }          = storeToRefs(useAuthStore())

// Single edit helper: trim, no-op on no-change, then markDirty so the
// AdminCommandBar lights up.
function onRepoEdit(idx, field, value) {
  const row = github_showcase.value[idx]
  if (!row) return
  const v = String(value).trim()
  if (row[field] === v) return
  row[field] = v
  portfolioStore.markDirty()
}

// Language → dot colour (GitHub palette)
const LANG_COLORS = {
  Java: '#b07219', Python: '#3572a5', JavaScript: '#f1e05a',
  TypeScript: '#3178c6', Go: '#00add8', Rust: '#dea584',
  Shell: '#89e051', Kotlin: '#a97bff',
}
function langColor(lang) { return LANG_COLORS[lang] ?? '#8b949e' }
</script>

<style scoped>
.github-section { background: var(--bg-primary); }
.section-header { margin-bottom: 52px; position: relative; }
.header-badge   { display: inline-block; margin-top: 14px; }

/* Admin toolbar */
.admin-toolbar { display: flex; justify-content: flex-end; margin-bottom: 24px; }
.btn-add {
  display: flex; align-items: center; gap: 7px;
  font-family: var(--font-mono); font-size: 0.74rem;
  color: var(--accent-green); border: 1px dashed rgba(16,185,129,0.4);
  padding: 7px 16px; border-radius: 6px; cursor: pointer; transition: all 0.2s;
}
.btn-add:hover { background: rgba(16,185,129,0.08); border-color: rgba(16,185,129,0.6); }

/* Grid */
.repo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

/* Card */
.repo-card {
  position: relative;
  background: var(--bg-card); border: 1px solid var(--border-color);
  border-radius: var(--radius-md); padding: 22px;
  display: flex; flex-direction: column; gap: 14px; transition: var(--transition);
}
.repo-card:hover { border-color: var(--border-glow); box-shadow: var(--shadow-glow); transform: translateY(-3px); }

/* Delete button */
.btn-delete {
  position: absolute; top: 10px; right: 10px;
  width: 22px; height: 22px; border-radius: 50%;
  background: rgba(239,68,68,0.1); color: var(--accent-red);
  border: 1px solid rgba(239,68,68,0.3);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.62rem; cursor: pointer; transition: all 0.2s;
}
.btn-delete:hover { background: rgba(239,68,68,0.22); }

/* Header */
.card-header { display: flex; align-items: flex-start; gap: 12px; }
.repo-icon {
  width: 34px; height: 34px; background: rgba(16,185,129,0.1);
  border-radius: var(--radius-xs); display: flex; align-items: center;
  justify-content: center; color: var(--accent-green); font-size: 0.95rem; flex-shrink: 0;
}
.repo-meta { flex: 1; min-width: 0; }
.repo-name-link {
  display: block; font-family: var(--font-mono); font-size: 0.86rem; font-weight: 600;
  color: var(--text-primary); margin-bottom: 3px; transition: color 0.2s;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.repo-name-link:hover { color: var(--accent-green); }

.repo-tagline {
  font-family: var(--font-mono); font-size: 0.7rem;
  color: var(--accent-green); margin-bottom: 6px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.repo-stats {
  display: flex; align-items: center; gap: 10px;
  font-family: var(--font-mono); font-size: 0.67rem; color: var(--text-muted);
}
.lang-indicator { display: flex; align-items: center; gap: 4px; }
.lang-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.ext-link { color: var(--text-muted); font-size: 0.75rem; flex-shrink: 0; margin-left: auto; transition: color 0.2s; }
.ext-link:hover { color: var(--accent-green); }

/* Body */
.card-body { flex: 1; }
.repo-desc { font-size: 0.82rem; color: var(--text-secondary); line-height: 1.65; margin: 0; }

/* Topics */
.topic-row { display: flex; flex-wrap: wrap; gap: 5px; }
.topic-chip {
  font-family: var(--font-mono); font-size: 0.62rem; padding: 2px 8px; border-radius: 3px;
  background: rgba(59,130,246,0.08); color: var(--accent-blue); border: 1px solid rgba(59,130,246,0.15);
}

@media (max-width: 640px) { .repo-grid { grid-template-columns: 1fr; } }
</style>
