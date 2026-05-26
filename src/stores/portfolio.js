// ── Central Portfolio Store ─────────────────────────────────────────────
//
//  DATA SOURCE HIERARCHY (highest → lowest priority):
//   1. Supabase DB — optional overlay applied after first paint.
//   2. DEFAULTS (src/data/portfolio-data.js) — always available, zero latency.
//
//  To change static portfolio content: edit src/data/portfolio-data.js.
//  The DB is an optional layer on top; if it's down the defaults show.
//
import { defineStore }    from 'pinia'
import { ref, computed }  from 'vue'
import { supabase }       from '@/services/supabase'
import { useUIStore }     from '@/stores/ui'
import { DEFAULTS }       from '@/data/portfolio-data'

const TABLE            = 'portfolio_content'
const ROW_ID           = 'main_content'
const PROJECTS_TABLE   = 'portfolio_projects'
const EXPERIENCE_TABLE = 'portfolio_experience'

// Editable project fields — what gets committed to / read from Supabase.
// Static-only fields (archFlow, apiDocs, index, period) are intentionally
// excluded: they live in portfolio-data.js and are merged at render time.
const PROJECT_DB_FIELDS = ['id', 'name', 'tagline', 'affiliation', 'description', 'stack', 'highlights', 'github', 'live']

export const usePortfolioStore = defineStore('portfolio', () => {
  const hero            = ref(deepClone(DEFAULTS.hero))
  const projects        = ref(deepClone(DEFAULTS.projects))
  const skills          = ref(deepClone(DEFAULTS.skills))
  const dsa_data        = ref(deepClone(DEFAULTS.dsa_data))
  const github_showcase = ref(deepClone(DEFAULTS.github_showcase))
  const experience      = ref(deepClone(DEFAULTS.experience))
  const metrics         = ref(deepClone(DEFAULTS.metrics))

  const loading  = ref(false)
  const isDirty  = ref(false)
  const dbError  = ref('')

  // ── Live DB connection telemetry ────────────────────────────────────
  //   'pending'        → bootstrap hasn't run yet (initial paint)
  //   'hydrated'       → at least one Supabase source returned valid data
  //   'local_fallback' → no Supabase config, all reads failed, or all empty.
  //                       Static defaults from portfolio-data.js are shown.
  const dbStatus = ref('pending')

  const leetcodeCount = computed(() => dsa_data.value.leetcodeCount)

  /**
   * bootstrap — DATABASE-OVERLAY, NOT PRIMARY SOURCE
   * ─────────────────────────────────────────────────
   * Refs are pre-seeded from DEFAULTS at store creation → first paint is
   * instant.  This function fetches Supabase and overlays ONLY when the
   * response is non-empty.  A null / [] / {} from the DB is treated as
   * "nothing to overlay" — defaults stay locked in.
   *
   * Null-safety rule: every DB value is passed through `nonNull()` before
   * spreading so that a null column never silently erases a default value.
   */
  async function bootstrap() {
    const ui = useUIStore()
    loading.value  = true
    dbStatus.value = 'pending'
    ui?.pushLog?.('info', 'db.bootstrap  overlay attempt queued')

    if (!supabase) {
      dbStatus.value = 'local_fallback'
      ui?.pushLog?.('warn', 'db.bootstrap  supabase client null — LOCAL_FALLBACK')
      loading.value = false
      return
    }

    // ── Emptiness guards ─────────────────────────────────────────────
    const hasArray  = (v) => Array.isArray(v) && v.length > 0
    const hasObject = (v) => v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length > 0
    // Strip null/undefined keys so DB nulls don't overwrite working defaults
    const nonNull   = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v != null))

    try {
      const [contentRes, projectsRes, experienceRes] = await Promise.all([
        supabase.from(TABLE).select('*').eq('id', ROW_ID).maybeSingle(),
        supabase.from(PROJECTS_TABLE).select('*').order('display_order', { ascending: true }),
        supabase.from(EXPERIENCE_TABLE).select('*').order('display_order', { ascending: true }),
      ])

      let overlays = 0

      // ── JSONB content row overlay ────────────────────────────────────
      if (!contentRes.error && contentRes.data) {
        const d = contentRes.data
        if (hasObject(d.hero_data))    { hero.value      = { ...DEFAULTS.hero,     ...nonNull(d.hero_data) };    overlays++ }
        if (hasObject(d.skills_data))  { skills.value    = { ...DEFAULTS.skills,   ...nonNull(d.skills_data) };  overlays++ }
        if (hasObject(d.dsa_data))     { dsa_data.value  = { ...DEFAULTS.dsa_data, ...nonNull(d.dsa_data) };     overlays++ }
        if (hasObject(d.metrics_data)) { metrics.value   = { ...DEFAULTS.metrics,  ...nonNull(d.metrics_data) }; overlays++ }
        if (hasArray(d.github_showcase)) {
          github_showcase.value = d.github_showcase
          overlays++
        }
      } else if (contentRes.error) {
        ui?.pushLog?.('warn', `db.content  ${contentRes.error.message}`)
      }

      // ── Per-row projects overlay ─────────────────────────────────────
      // Only overwrite defaults when the table actually has rows.
      // We strip display_order + updated_at (housekeeping cols), then also
      // strip null values so the static merge in ProjectsSection can still
      // use archFlow / apiDocs / period from portfolio-data.js for any
      // field the DB doesn't have.
      if (!projectsRes.error && hasArray(projectsRes.data)) {
        projects.value = projectsRes.data.map(r => {
          const { display_order, updated_at, ...row } = r
          return nonNull(row)
        })
        overlays++
      } else if (projectsRes.error) {
        ui?.pushLog?.('warn', `db.projects  ${projectsRes.error.message}`)
      }

      // ── Per-row experience overlay ────────────────────────────────────
      if (!experienceRes.error && hasArray(experienceRes.data)) {
        experience.value = experienceRes.data.map(r => {
          const { display_order, updated_at, ...row } = r
          return nonNull(row)
        })
        overlays++
      } else if (experienceRes.error) {
        ui?.pushLog?.('warn', `db.experience  ${experienceRes.error.message}`)
      }

      // ── Status telemetry ─────────────────────────────────────────────
      if (overlays > 0) {
        dbStatus.value = 'hydrated'
        ui?.pushLog?.('ok', `db.bootstrap  HYDRATED — ${overlays} overlay${overlays === 1 ? '' : 's'} applied`)
      } else {
        dbStatus.value = 'local_fallback'
        const errMsgs = [contentRes.error, projectsRes.error, experienceRes.error]
          .filter(Boolean).map(e => e.message)
        if (errMsgs.length) dbError.value = errMsgs.join(' | ')
        ui?.pushLog?.('warn', `db.bootstrap  LOCAL_FALLBACK — ${dbError.value || 'all sources empty or no rows'}`)
      }
    } catch (e) {
      // SILENT NO-OP on data refs. Pre-seeded defaults remain locked in.
      dbStatus.value = 'local_fallback'
      dbError.value  = e?.message ?? String(e)
      console.warn('[portfolioStore] bootstrap fell back to local defaults:', e)
      ui?.pushLog?.('error', `db.bootstrap  ${e.message ?? e} — LOCAL_FALLBACK`)
    } finally {
      loading.value = false
    }
  }

  // commitChanges — push editable state to Supabase.
  // NOTE: archFlow, apiDocs, index, period are intentionally NOT committed —
  // they are static display data managed in portfolio-data.js.
  async function commitChanges() {
    loading.value = true
    try {
      // Projects — only editable DB fields
      for (const [i, p] of projects.value.entries()) {
        await supabase.from(PROJECTS_TABLE).upsert({
          id:            p.id,
          display_order: i,
          name:          p.name,
          tagline:       p.tagline,
          affiliation:   p.affiliation  ?? null,
          description:   p.description ?? null,
          stack:         p.stack        ?? [],
          highlights:    p.highlights   ?? [],
          github:        p.github       ?? null,
          live:          p.live         ?? null,
          updated_at:    new Date(),
        })
      }
      // Experience
      for (const [i, j] of experience.value.entries()) {
        await supabase.from(EXPERIENCE_TABLE).upsert({
          id:            j.id,
          display_order: i,
          company:       j.company  ?? null,
          role:          j.role     ?? null,
          period:        j.period   ?? null,
          location:      j.location ?? null,
          bullets:       j.bullets  ?? [],
          tags:          j.tags     ?? [],
          updated_at:    new Date(),
        })
      }
      // JSONB content row
      await supabase.from(TABLE).upsert({
        id:              ROW_ID,
        hero_data:       hero.value,
        skills_data:     skills.value,
        dsa_data:        dsa_data.value,
        github_showcase: github_showcase.value,
        metrics_data:    metrics.value,
        updated_at:      new Date(),
      })

      isDirty.value = false
      return { ok: true }
    } catch (e) {
      return { ok: false, msg: e.message }
    } finally {
      loading.value = false
    }
  }

  // ── Admin helpers ────────────────────────────────────────────────────
  function addProject() {
    projects.value.push({
      id:          `temp_${Date.now()}`,
      name:        '📁 New Project Name',
      tagline:     'Click to type your project tagline',
      affiliation: 'Click to edit · 2026',
      description: 'Click this block to type out your detailed project engineering breakdown, architecture decisions, and measurable performance metrics...',
      stack:       ['Vue 3', 'Node.js'],
      highlights:  [
        { icon: 'fas fa-star', color: '#10B981', title: 'Feature Alpha', desc: 'Click to edit this engineering highlight description.' },
        { icon: 'fas fa-bolt', color: '#3B82F6', title: 'Feature Beta',  desc: 'Click to add a second key implementation detail.'        },
      ],
      github: '#',
      live:   '#',
    })
    isDirty.value = true
  }
  function removeProject(id) { projects.value = projects.value.filter(p => p.id !== id); isDirty.value = true }

  function addGithubShowcaseItem() {
    github_showcase.value.push({
      id:          `gs${Date.now()}`,
      name:        'new-repo-name',
      tagline:     'Click to add repository tagline',
      description: 'Click to describe the repository purpose, the algorithmic patterns implemented, and key engineering highlights.',
      language:    'Java',
      stars:       0,
      forks:       0,
      url:         'https://github.com/25dp1000031/new-repo-name',
      topics:      ['topic-1', 'topic-2', 'topic-3'],
    })
    isDirty.value = true
  }
  function removeGithubShowcaseItem(id) { github_showcase.value = github_showcase.value.filter(r => r.id !== id); isDirty.value = true }

  function markDirty() { isDirty.value = true }
  function onEdit(target, field, value) { if (target) target[field] = String(value).trim(); isDirty.value = true }

  return {
    hero, projects, skills, dsa_data, github_showcase, experience, metrics, leetcodeCount,
    loading, isDirty, dbError, dbStatus,
    bootstrap, commitChanges, commitToDatabase: commitChanges, markDirty, onEdit,
    addProject, removeProject,
    addGithubShowcaseItem, removeGithubShowcaseItem,
    addGithubRepo: addGithubShowcaseItem, removeGithubRepo: removeGithubShowcaseItem,
  }
})

function deepClone(obj) { return JSON.parse(JSON.stringify(obj)) }
