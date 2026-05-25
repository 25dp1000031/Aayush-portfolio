// ── Central Portfolio Store ────────────────────────────────────────────
//
// DATABASE STRATEGY — single-row JSONB pattern
// ─────────────────────────────────────────────
// One row in `portfolio_content` (id = 'main_content') stores the entire
// site's content as JSONB columns. A single SELECT on app boot unpacks
// every column into reactive Pinia state. Admin mutations happen locally;
// a single UPSERT writes everything back atomically.
//
// Required Supabase SQL (run once in the SQL editor):
// ─────────────────────────────────────────────────────
//   CREATE TABLE IF NOT EXISTS portfolio_content (
//     id              text PRIMARY KEY,
//     hero_data       jsonb,
//     projects_data   jsonb,
//     skills_data     jsonb,
//     dsa_data        jsonb,
//     github_showcase jsonb,
//     experience_data jsonb,
//     metrics_data    jsonb,
//     updated_at      timestamptz DEFAULT now()
//   );
//   INSERT INTO portfolio_content (id) VALUES ('main_content')
//   ON CONFLICT (id) DO NOTHING;
//
// RLS policy (recommended — allows public read, anon write via service key):
//   ALTER TABLE portfolio_content ENABLE ROW LEVEL SECURITY;
//   CREATE POLICY "public_read"  ON portfolio_content FOR SELECT USING (true);
//   CREATE POLICY "admin_write"  ON portfolio_content FOR ALL
//     USING (auth.role() = 'authenticated');
// ─────────────────────────────────────────────────────────────────────────

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase }    from '@/services/supabase'
import { useUIStore }  from '@/stores/ui'

// ── Table constants ────────────────────────────────────────────────────
const TABLE  = 'portfolio_content'
const ROW_ID = 'main_content'   // human-readable text PK, not a UUID

// ╔══════════════════════════════════════════════════════════════════════╗
// ║  CANONICAL DEFAULTS                                                  ║
// ║  Loaded immediately on page paint. Supabase data overlays these.    ║
// ╚══════════════════════════════════════════════════════════════════════╝
const DEFAULTS = {

  // ── hero_data ──────────────────────────────────────────────────────
  hero: {
    name:    'Aayush Kukade',
    title:   'Backend Engineer',
    tagline: 'Specializing in Distributed Workflows & API Design',
    summary: 'Building resilient, scalable APIs, asynchronous data pipelines, and containerised cloud architectures with Java, Spring Boot, Python, Flask, Redis, Celery, Docker, and AWS.',
    status:  'Available for opportunities',
    badges: [
      { label: "GATE CS '26",  icon: 'fas fa-shield-alt',    variant: 'green'  },
      { label: 'IITM Diploma', icon: 'fas fa-graduation-cap', variant: 'blue'   },
      { label: 'MCA SGBAU',    icon: 'fas fa-university',     variant: 'purple' },
    ],
  },

  // ── projects_data ──────────────────────────────────────────────────
  // Editable metadata only. Static SVG arch flows + Swagger mocks stay
  // in src/data/projects.js and are merged at the component level.
  projects: [
    {
      id:          'placement-route',
      name:        'Placement Route',
      tagline:     'Automated campus placement management system',
      affiliation: 'SOFTTRONIX Technology & Solutions · 2025',
      description: 'Full-stack backend platform for managing the complete student placement cycle — companies, drives, applications, and results — with role-scoped access for administrators, recruiters, and students.',
      github:      'https://github.com/its-tsukii',
      live:        null,
      stack:       ['Python', 'Flask', 'PostgreSQL', 'SQLAlchemy', 'Celery', 'Redis', 'JWT', 'Docker'],
      highlights: [
        { icon: 'fas fa-shield-alt',    color: '#10B981', title: 'JWT RBAC',       desc: 'Three-tier role auth — admin, recruiter, student'  },
        { icon: 'fas fa-bolt',          color: '#F59E0B', title: 'Celery Workers', desc: '40 % faster reports via async Redis task queue'     },
        { icon: 'fas fa-database',      color: '#3B82F6', title: 'PostgreSQL ORM', desc: 'SQLAlchemy + optimised indexes, p95 latency −30 %'   },
        { icon: 'fab fa-docker',        color: '#06B6D4', title: 'Docker CI/CD',   desc: 'Containerised + GitHub Actions deployment pipeline' },
      ],
    },
    {
      id:          'v-park',
      name:        'V-Park',
      tagline:     'Smart parking management with real-time slot tracking',
      affiliation: 'Academic Project · SGBAU',
      description: 'QR-code driven parking system with real-time slot occupancy, pre-booking, and integrated payment workflow. Admin panel for lot configuration and revenue analytics.',
      github:      'https://github.com/its-tsukii',
      live:        null,
      stack:       ['Python', 'Flask', 'MySQL', 'SQLAlchemy', 'QR Code', 'JWT'],
      highlights: [
        { icon: 'fas fa-qrcode',        color: '#10B981', title: 'QR Check-In',    desc: 'Instant slot validation via dynamic QR tokens'      },
        { icon: 'fas fa-clock',         color: '#3B82F6', title: 'Real-Time Grid', desc: 'Live occupancy matrix, auto-released on timeout'     },
        { icon: 'fas fa-credit-card',   color: '#8B5CF6', title: 'Payment Flow',   desc: 'Integrated billing with receipt generation'          },
        { icon: 'fas fa-chart-bar',     color: '#F59E0B', title: 'Analytics',      desc: 'Admin dashboard with hourly revenue breakdowns'      },
      ],
    },
    {
      id:          'film-fiesta',
      name:        'Film Fiesta',
      tagline:     'Movie event booking platform with interactive seat selection',
      affiliation: 'Academic Project · SGBAU',
      description: 'End-to-end cinema booking experience — movie listings, interactive seat matrix, JWT-secured sessions, booking confirmation emails, and a full-featured admin panel for show and venue management.',
      github:      'https://github.com/its-tsukii',
      live:        null,
      stack:       ['Python', 'Flask', 'MySQL', 'JWT', 'Jinja2'],
      highlights: [
        { icon: 'fas fa-chair',         color: '#10B981', title: 'Seat Matrix',    desc: 'Interactive SVG seat map with real-time lock state'  },
        { icon: 'fas fa-key',           color: '#F59E0B', title: 'JWT Sessions',   desc: 'Stateless auth with 15-minute booking hold tokens'   },
        { icon: 'fas fa-envelope',      color: '#3B82F6', title: 'Email Confirm',  desc: 'Auto-sent booking receipts on successful payment'    },
        { icon: 'fas fa-user-shield',   color: '#8B5CF6', title: 'Admin Panel',    desc: 'CRUD for shows, venues, pricing, and capacity'       },
      ],
    },
  ],

  // ── skills_data ────────────────────────────────────────────────────
  // Drives the Chart.js radar in SkillsChart.vue + the stack cards.
  skills: {
    radarLabels: [
      'Java / Spring',
      'Python / Flask',
      'Redis & Celery',
      'PostgreSQL',
      'Docker / AWS',
      'DSA / Algorithms',
      'REST API Design',
      'JWT & Auth',
    ],
    radarValues: [85, 82, 78, 80, 72, 88, 90, 82],
    benchmarkValue: 70,   // dashed reference line in the radar

    // ── Skill card groups — mirrors StackSection cards ────────────
    groups: [
      {
        id: 'sg1', icon: 'fas fa-server', title: 'Systems & Services',
        skills: [
          { id: 'sk1',  label: 'Java',              icon: 'fab fa-java'   },
          { id: 'sk2',  label: 'Spring Boot'                               },
          { id: 'sk3',  label: 'Python',             icon: 'fab fa-python' },
          { id: 'sk4',  label: 'Flask'                                     },
          { id: 'sk5',  label: 'REST APIs'                                 },
          { id: 'sk6',  label: 'JWT Auth'                                  },
          { id: 'sk7',  label: 'RBAC'                                      },
          { id: 'sk8',  label: 'Vue.js'                                    },
        ],
      },
      {
        id: 'sg2', icon: 'fas fa-bolt', title: 'Caching & Pipelines',
        skills: [
          { id: 'sk9',  label: 'Redis',              accent: 'green' },
          { id: 'sk10', label: 'Celery',             accent: 'green' },
          { id: 'sk11', label: 'Async Workers'                       },
          { id: 'sk12', label: 'Task Queues'                         },
          { id: 'sk13', label: 'Background Jobs'                     },
          { id: 'sk14', label: 'Message Brokering'                   },
        ],
      },
      {
        id: 'sg3', icon: 'fas fa-database', title: 'Data & Storage',
        skills: [
          { id: 'sk15', label: 'PostgreSQL'         },
          { id: 'sk16', label: 'MySQL'               },
          { id: 'sk17', label: 'SQLAlchemy'          },
          { id: 'sk18', label: 'JPA / Hibernate'     },
          { id: 'sk19', label: 'DBMS'                },
          { id: 'sk20', label: 'Supabase'            },
        ],
      },
      {
        id: 'sg4', icon: 'fas fa-cloud', title: 'Infrastructure & DevOps',
        skills: [
          { id: 'sk21', label: 'Docker',             icon: 'fab fa-docker', accent: 'blue' },
          { id: 'sk22', label: 'AWS EC2',            accent: 'blue'                        },
          { id: 'sk23', label: 'AWS S3',             accent: 'blue'                        },
          { id: 'sk24', label: 'GCP'                                                       },
          { id: 'sk25', label: 'Git',                icon: 'fab fa-git-alt'                },
          { id: 'sk26', label: 'GitHub Actions'                                            },
          { id: 'sk27', label: 'Linux',              icon: 'fab fa-linux'                  },
        ],
      },
      {
        id: 'sg5', icon: 'fas fa-brain', title: 'Theory & Core CS',
        skills: [
          { id: 'sk28', label: 'Data Structures'  },
          { id: 'sk29', label: 'Algorithms'        },
          { id: 'sk30', label: 'System Design'     },
          { id: 'sk31', label: 'OOP'               },
          { id: 'sk32', label: 'OS Concepts'       },
          { id: 'sk33', label: 'Networking'         },
          { id: 'sk34', label: 'Concurrent Prog.'  },
        ],
      },
      {
        id: 'sg6', icon: 'fas fa-award', title: 'Platform Certifications',
        skills: [
          { id: 'sk35', label: 'AWS Cloud Foundations' },
          { id: 'sk36', label: 'AWS Data Engineering'  },
          { id: 'sk37', label: 'AWS GenAI Foundations' },
          { id: 'sk38', label: 'GCP Cloud Foundations' },
          { id: 'sk39', label: 'Docker Essentials'     },
          { id: 'sk40', label: 'K8s & OpenShift'       },
          { id: 'sk41', label: 'IBM Cloud Essentials'  },
        ],
      },
    ],
  },

  // ── dsa_data ───────────────────────────────────────────────────────
  // Drives AlgoSection.vue — LeetCode counter + pattern progress bars.
  dsa_data: {
    leetcodeCount: 150,
    leetcodeUrl:   'https://leetcode.com/u/its-tsukii/',
    primaryLang:   'Java',
    repoUrl:       'https://github.com/25dp1000031/learn-java-dsa-structured',
    patterns: [
      { name: 'Arrays & Matrices', icon: 'fas fa-border-all',      color: '#10B981', pct: 88 },
      { name: 'Trees & BST',       icon: 'fas fa-sitemap',         color: '#3B82F6', pct: 82 },
      { name: 'Graphs (BFS/DFS)',  icon: 'fas fa-project-diagram', color: '#8B5CF6', pct: 76 },
      { name: 'DP Memoization',    icon: 'fas fa-table',           color: '#F59E0B', pct: 72 },
      { name: 'DP Tabulation',     icon: 'fas fa-th',              color: '#EF4444', pct: 68 },
      { name: 'Sliding Window',    icon: 'fas fa-window-maximize', color: '#06B6D4', pct: 80 },
    ],
  },

  // ── github_showcase ────────────────────────────────────────────────
  // Drives GithubSection.vue — pinned repo grid.
  github_showcase: [
    {
      id: 'gs1',
      name: 'learn-java-dsa-structured',
      description: 'Pattern-based DSA repository organised by topic — arrays, trees, graphs, DP, sorting, and strings. Clean Java implementations, no random practice.',
      language: 'Java',
      stars: 12, forks: 3,
      url: 'https://github.com/25dp1000031/learn-java-dsa-structured',
      topics: ['algorithms', 'data-structures', 'java', 'leetcode'],
    },
    {
      id: 'gs2',
      name: 'placement-route',
      description: 'Backend system for campus placement management — JWT auth, Flask REST API, PostgreSQL, Celery async workers, and role-based access control.',
      language: 'Python',
      stars: 8, forks: 2,
      url: 'https://github.com/its-tsukii',
      topics: ['flask', 'postgresql', 'celery', 'redis'],
    },
    {
      id: 'gs3',
      name: 'v-park',
      description: 'Smart parking management system with QR code integration, real-time slot tracking, and online payment workflow.',
      language: 'Python',
      stars: 5, forks: 1,
      url: 'https://github.com/its-tsukii',
      topics: ['flask', 'qr-code', 'real-time', 'mysql'],
    },
    {
      id: 'gs4',
      name: 'film-fiesta',
      description: 'Movie event booking platform with interactive seat-matrix selection, JWT sessions, and a full admin panel for show and venue management.',
      language: 'Python',
      stars: 4, forks: 1,
      url: 'https://github.com/its-tsukii',
      topics: ['flask', 'jwt', 'booking-system'],
    },
  ],

  // ── experience_data ────────────────────────────────────────────────
  experience: [
    {
      id: 'e1',
      company:  'SOFTTRONIX Technology & Solutions',
      role:     'Backend Developer Intern',
      period:   'Jan 2025 – Jun 2025',
      location: 'Nagpur, India',
      bullets: [
        'Engineered REST APIs for employee management using Flask, PostgreSQL, and JWT-based RBAC.',
        'Built async task queues with Celery + Redis to offload report generation — cut p95 response time by 40 %.',
        'Containerised services with Docker and set up CI/CD pipelines on GitHub Actions.',
        'Wrote ORM queries with SQLAlchemy and optimised slow indexes; reduced query p95 latency by 30 %.',
      ],
      tags: ['Java', 'Spring Boot', 'Python', 'Flask', 'PostgreSQL', 'Redis', 'Celery', 'Docker', 'JWT'],
    },
  ],

  // ── metrics_data ───────────────────────────────────────────────────
  // Drives MetricsDashboard.vue — academic benchmark panel.
  metrics: {
    leetcodeCount:    150,   // also in dsa_data; kept here for MetricsDashboard counter
    gateScore:        418,
    gateRank:         4500,
    iitmCGPA:         7.45,
    sgbauGrade:       'A',
    experienceMonths: 6,
    queryEfficiency:  94,    // progress bar in DB panel
  },
}

// ╔══════════════════════════════════════════════════════════════════════╗
// ║  STORE DEFINITION                                                    ║
// ╚══════════════════════════════════════════════════════════════════════╝
export const usePortfolioStore = defineStore('portfolio', () => {

  // ── Reactive state — one ref per DB column ─────────────────────────
  const hero            = ref(deepClone(DEFAULTS.hero))
  const projects        = ref(deepClone(DEFAULTS.projects))
  const skills          = ref(deepClone(DEFAULTS.skills))
  const dsa_data        = ref(deepClone(DEFAULTS.dsa_data))
  const github_showcase = ref(deepClone(DEFAULTS.github_showcase))
  const experience      = ref(deepClone(DEFAULTS.experience))
  const metrics         = ref(deepClone(DEFAULTS.metrics))

  // ── UI state ───────────────────────────────────────────────────────
  const loading  = ref(false)
  const isDirty  = ref(false)
  const dbError  = ref('')

  // ── Convenience computed ───────────────────────────────────────────
  const leetcodeCount = computed(() => dsa_data.value.leetcodeCount)

  // ╔════════════════════════════════════════════════════════════════╗
  // ║  1. BOOTSTRAP — single SELECT on app load                     ║
  // ╚════════════════════════════════════════════════════════════════╝
  async function bootstrap() {
    const ui = useUIStore()
    if (!supabase) {
      ui.pushLog('warn', 'supabase  not configured — using defaults')
      return
    }

    loading.value = true
    dbError.value = ''
    ui.pushLog('info', `db.select  ${TABLE} id=${ROW_ID}`)

    try {
      // One query, all columns. Uses .single() per spec.
      // PGRST116 = "no rows" — harmless on first boot before any commit.
      const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .eq('id', ROW_ID)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          ui.pushLog('warn', 'db.select  no row yet — defaults active')
          return
        }
        throw error
      }

      // ── Unpack JSONB columns → reactive state ──────────────────────
      // Shallow-merge with DEFAULTS so new default keys added in future
      // releases automatically appear even before the next admin commit.
      if (data.hero_data)        hero.value            = { ...DEFAULTS.hero,            ...data.hero_data }
      if (data.projects_data)    projects.value        = data.projects_data
      if (data.skills_data)      skills.value          = { ...DEFAULTS.skills,          ...data.skills_data }
      if (data.dsa_data)         dsa_data.value        = { ...DEFAULTS.dsa_data,        ...data.dsa_data }
      if (data.github_showcase)  github_showcase.value = data.github_showcase
      if (data.experience_data)  experience.value      = data.experience_data
      if (data.metrics_data)     metrics.value         = { ...DEFAULTS.metrics,         ...data.metrics_data }

      ui.pushLog('ok', `db.hydrated  updated_at=${data.updated_at ?? '—'}`)

    } catch (e) {
      dbError.value = `bootstrap: ${e.message}`
      ui.pushLog('error', `bootstrap  ${e.message}`)
    } finally {
      loading.value = false
    }
  }

  // ╔════════════════════════════════════════════════════════════════╗
  // ║  3. MASTER PRODUCTION COMMIT — UPSERT                         ║
  // ║  Aggregates all local reactive state back into exact DB       ║
  // ║  column format and fires a single upsert.                     ║
  // ╚════════════════════════════════════════════════════════════════╝
  async function commitToDatabase() {
    const ui = useUIStore()
    if (!supabase) {
      ui.pushLog('error', 'commit  supabase not configured')
      return {
        ok:  false,
        msg: 'Supabase not configured — add VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY to .env.local',
      }
    }

    ui.pushLog('info', `db.upsert  ${TABLE} id=${ROW_ID}`)

    try {
      const { error } = await supabase
        .from(TABLE)
        .upsert({
          // ── Exact payload from spec ──────────────────────────────
          id:              ROW_ID,
          hero_data:       hero.value,
          skills_data:     skills.value,
          projects_data:   projects.value,
          dsa_data:        dsa_data.value,
          github_showcase: github_showcase.value,
          // ── Additional columns (extend the spec payload) ─────────
          experience_data: experience.value,
          metrics_data:    metrics.value,
          updated_at:      new Date(),
        })

      if (error) throw error

      isDirty.value = false
      ui.pushLog('ok', 'db.upsert  committed successfully')
      return { ok: true }
    } catch (e) {
      ui.pushLog('error', `commit  ${e.message}`)
      return { ok: false, msg: e.message }
    }
  }

  // ╔════════════════════════════════════════════════════════════════╗
  // ║  2. COMPONENT SCHEMA SYNC — local CRUD                        ║
  // ║  Each action modifies the reactive array directly so Vue's    ║
  // ║  reactivity propagates to every bound component instantly.    ║
  // ╚════════════════════════════════════════════════════════════════╝

  // ── Projects ──────────────────────────────────────────────────────
  function addProject() {
    projects.value.push({
      id:          `p${Date.now()}`,
      name:        'New Project',
      tagline:     'Short one-line description',
      affiliation: 'Context · Year',
      description: 'Full project description.',
      github:      'https://github.com/its-tsukii',
      live:        null,
      stack:       ['Python', 'Flask'],
      highlights:  [
        { icon: 'fas fa-star', color: '#10B981', title: 'Feature', desc: 'Description' },
      ],
    })
    isDirty.value = true
  }
  function removeProject(id) {
    projects.value = projects.value.filter(p => p.id !== id)
    isDirty.value  = true
  }
  function addProjectHighlight(projectId) {
    const p = projects.value.find(p => p.id === projectId)
    if (p) p.highlights.push({ icon: 'fas fa-star', color: '#10B981', title: 'Feature', desc: 'Description' })
    isDirty.value = true
  }
  function removeProjectHighlight(projectId, idx) {
    const p = projects.value.find(p => p.id === projectId)
    if (p) p.highlights.splice(idx, 1)
    isDirty.value = true
  }
  function addProjectStackItem(projectId) {
    const p = projects.value.find(p => p.id === projectId)
    if (p) p.stack.push('Tech')
    isDirty.value = true
  }
  function removeProjectStackItem(projectId, idx) {
    const p = projects.value.find(p => p.id === projectId)
    if (p) p.stack.splice(idx, 1)
    isDirty.value = true
  }

  // ── GitHub Showcase ────────────────────────────────────────────────
  function addGithubShowcaseItem() {
    github_showcase.value.push({
      id:          `gs${Date.now()}`,
      name:        'new-repository',
      description: 'Repository description.',
      language:    'Python',
      stars:       0,
      forks:       0,
      url:         'https://github.com/its-tsukii',
      topics:      [],
    })
    isDirty.value = true
  }
  function removeGithubShowcaseItem(id) {
    github_showcase.value = github_showcase.value.filter(r => r.id !== id)
    isDirty.value = true
  }
  // Backward-compatible aliases (used by GithubSection.vue pre-rename)
  const addGithubRepo    = addGithubShowcaseItem
  const removeGithubRepo = removeGithubShowcaseItem

  // ── DSA Patterns ───────────────────────────────────────────────────
  function addDsaPattern() {
    dsa_data.value.patterns.push({
      name: 'New Pattern', icon: 'fas fa-code', color: '#10B981', pct: 70,
    })
    isDirty.value = true
  }
  function removeDsaPattern(idx) {
    dsa_data.value.patterns.splice(idx, 1)
    isDirty.value = true
  }

  // ── Skill Groups ───────────────────────────────────────────────────
  function addSkillGroup() {
    skills.value.groups.push({
      id:     `sg${Date.now()}`,
      icon:   'fas fa-code',
      title:  'New Group',
      skills: [],
    })
    isDirty.value = true
  }
  function removeSkillGroup(groupId) {
    skills.value.groups = skills.value.groups.filter(g => g.id !== groupId)
    isDirty.value = true
  }
  function addSkillItem(groupId) {
    const g = skills.value.groups.find(g => g.id === groupId)
    if (g) g.skills.push({ id: `sk${Date.now()}`, label: 'New Skill' })
    isDirty.value = true
  }
  function removeSkillItem(groupId, itemId) {
    const g = skills.value.groups.find(g => g.id === groupId)
    if (g) g.skills = g.skills.filter(s => s.id !== itemId)
    isDirty.value = true
  }

  // ── Experience ─────────────────────────────────────────────────────
  function addExperienceJob() {
    experience.value.push({
      id:       `e${Date.now()}`,
      company:  'Company Name',
      role:     'Role Title',
      period:   '2025 – Present',
      location: 'City, Country',
      bullets:  ['Key responsibility or achievement.'],
      tags:     ['Tech'],
    })
    isDirty.value = true
  }
  function removeExperienceJob(id) {
    experience.value = experience.value.filter(j => j.id !== id)
    isDirty.value    = true
  }
  function addBullet(jobId) {
    const job = experience.value.find(j => j.id === jobId)
    if (job) job.bullets.push('New bullet point.')
    isDirty.value = true
  }
  function removeBullet(jobId, idx) {
    const job = experience.value.find(j => j.id === jobId)
    if (job) job.bullets.splice(idx, 1)
    isDirty.value = true
  }
  function addTag(jobId) {
    const job = experience.value.find(j => j.id === jobId)
    if (job) {
      if (!job.tags) job.tags = []
      job.tags.push('Tag')
    }
    isDirty.value = true
  }
  function removeTag(jobId, idx) {
    const job = experience.value.find(j => j.id === jobId)
    if (job?.tags) job.tags.splice(idx, 1)
    isDirty.value = true
  }

  // ── Generic dirty flag ─────────────────────────────────────────────
  function markDirty() { isDirty.value = true }

  // ── Public API ─────────────────────────────────────────────────────
  return {
    // ── state ──────────────────────────────────────────────────────
    hero,
    projects,
    skills,
    dsa_data,
    github_showcase,
    experience,
    metrics,

    // ── computed ───────────────────────────────────────────────────
    leetcodeCount,

    // ── ui flags ───────────────────────────────────────────────────
    loading,
    isDirty,
    dbError,

    // ── lifecycle ──────────────────────────────────────────────────
    bootstrap,
    commitToDatabase,
    markDirty,

    // ── projects CRUD ──────────────────────────────────────────────
    addProject,
    removeProject,
    addProjectHighlight,
    removeProjectHighlight,
    addProjectStackItem,
    removeProjectStackItem,

    // ── github_showcase CRUD ───────────────────────────────────────
    addGithubShowcaseItem,
    removeGithubShowcaseItem,
    addGithubRepo,       // alias
    removeGithubRepo,    // alias

    // ── dsa CRUD ───────────────────────────────────────────────────
    addDsaPattern,
    removeDsaPattern,

    // ── skills CRUD ────────────────────────────────────────────────
    addSkillGroup,
    removeSkillGroup,
    addSkillItem,
    removeSkillItem,

    // ── experience CRUD ────────────────────────────────────────────
    addExperienceJob,
    removeExperienceJob,
    addBullet,
    removeBullet,
    addTag,
    removeTag,
  }
})

// ── Utility ───────────────────────────────────────────────────────────
function deepClone(obj) { return JSON.parse(JSON.stringify(obj)) }
