# ARCH.md — Portfolio System Architectural Blueprint

> **Purpose.** Standalone reconstruction document. A future AI agent or
> engineer reading this file alone, with no other context, must be able
> to recreate the entire full-stack OS/Terminal hybrid portfolio system
> for a completely different client (different name, content, colours)
> by editing only `DEFAULTS` in `src/stores/portfolio.js`.
>
> **Reading order.** § 1 first to anchor mental model, then § 2 (state
> lifecycle), § 3 (database), § 4 (admin editing), § 5 (auxiliary modules).

---

## § 1 — System Core Architecture Overview

### Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Build / dev server | **Vite 5** | Fastest cold start; native ESM in dev. |
| UI framework | **Vue 3** (Composition API, `<script setup>`) | Reactivity primitives match Pinia 1:1; templates support `:contenteditable` natively. |
| State store | **Pinia** (Setup Store pattern) | Zero-boilerplate reactive state, cross-store composition without circular deps. |
| Styling | **Tailwind CSS v4** (`@tailwindcss/vite`) + scoped `<style>` blocks + global tokens in `main.css` | Utility classes for layout; CSS custom properties for design tokens; scoped block-CSS per component. |
| Animation | **Motion One** (`motion@^11`) | Tiny (≈ 4 KB), composable `animate()` + `inView()` API for OS-window boot sequences. |
| Charts | **Chart.js 4** + `vue-chartjs 5` | Radar chart for skills proficiency telemetry. |
| Persistence | **Supabase** (`@supabase/supabase-js@^2`) | PostgreSQL + RLS + Edge Functions + free tier. |
| Email transport | **Resend** (via Supabase Edge Function) | Single HTTPS POST from a Deno runtime. |
| Optional fallback transport | **EmailJS** (`@emailjs/browser`) | Client-side fallback when Supabase isn't configured. |

### Decoupled client-server contract

```
┌─ Browser (Vue 3 SPA, Vite-built) ──────────────────────────────────┐
│                                                                    │
│   App.vue                                                          │
│   │                                                                │
│   ├─ OsWindow ── HeroSection                                       │
│   ├─ OsWindow ── SystemControlsPane ── DbStatusBadge ── SkillsChart│
│   ├─ OsWindow ── StackSection                                      │
│   ├─ OsWindow ── ExperienceSection                                 │
│   ├─ OsWindow ── ProjectsSection → ProjectCard …                   │
│   ├─ OsWindow ── MetricsDashboard                                  │
│   ├─ OsWindow ── AlgoSection                                       │
│   ├─ OsWindow ── GithubSection                                     │
│   ├─ OsWindow ── CertsSection                                      │
│   └─ OsWindow ── ContactSection                                    │
│                                                                    │
│   Pinia stores:  portfolio · auth · ui                             │
└──────────────────┬─────────────────────────────────────────────────┘
                   │  anon JWT (RLS-scoped)
                   │  GET portfolio_content / portfolio_projects / portfolio_experience
                   │  POST contact_messages
                   ▼
┌─ Supabase ─────────────────────────────────────────────────────────┐
│  Postgres:                                                         │
│    portfolio_content     (1 row, JSONB columns)                    │
│    portfolio_projects    (n rows, display_order ASC)               │
│    portfolio_experience  (n rows, display_order ASC)               │
│    contact_messages      (write-only for anon)                     │
│                                                                    │
│  Edge Function (Deno):                                             │
│    contact-handler  ── triggered by INSERT webhook on              │
│                       contact_messages  → POSTs Resend API         │
└──────────────────┬─────────────────────────────────────────────────┘
                   │  HTTPS
                   ▼
            ┌──────────────┐
            │ Resend API   │  → operator inbox
            └──────────────┘
```

### Directory map

```
project-root/
│
├── ARCH.md                                  ← this document
├── .env.example                             ← required env-var template
├── package.json                             ← deps + scripts (npm run dev / build)
├── vite.config.js                           ← Vite + @tailwindcss/vite plugin
├── index.html                               ← SPA shell, Font Awesome + JetBrains Mono CDN
│
├── public/                                  ← favicon, profile picture, resume PDF, cert PDFs
│
├── supabase/
│   └── functions/
│       └── contact-handler/
│           └── index.ts                     ← Deno Edge Function (Resend bridge)
│
└── src/
    ├── main.js                              ← Vue app bootstrap + Pinia install
    ├── App.vue                              ← OS desktop shell, OsWindow wiring,
    │                                          Ctrl+Shift+A keybind, portfolioStore.bootstrap()
    │
    ├── assets/
    │   └── styles/
    │       └── main.css                     ← design tokens, .ce-edit utility,
    │                                          keyframes, Tailwind @import + @theme
    │
    ├── services/
    │   └── supabase.js                      ← createClient singleton (returns null if env missing)
    │
    ├── stores/                              ← Pinia state engines
    │   ├── portfolio.js                     ← ★ master content store + bootstrap + commitChanges
    │   ├── auth.js                          ← isAdmin flag + Ctrl+Shift+A modal toggle plumbing
    │   └── ui.js                            ← modal visibility + systemLogs ring buffer
    │
    ├── composables/                         ← shared reactive primitives
    │   ├── useCounter.js                    ← IntersectionObserver-triggered RAF counter
    │   └── useScrollReveal.js               ← .reveal class fade-in on scroll
    │
    ├── data/
    │   └── projects.js                      ← static archFlow SVGs + apiDocs Swagger mocks
    │                                          (merged with store.projects by name in
    │                                          ProjectsSection.vue)
    │
    └── components/                          ← UI layout docks
        │
        ├── OsWindow.vue                     ← macOS chrome wrapper + Motion boot anim
        ├── NavBar.vue                       ← sticky top nav
        ├── FooterSection.vue                ← page footer
        ├── BackgroundLogStream.vue          ← ambient terminal log canvas, position: fixed
        │
        ├── HeroSection.vue                  ← name, title, badges, terminal widget, pipeline viz
        ├── TerminalWidget.vue               ← typewriter terminal effect
        ├── PipelineVisualizer.vue           ← SVG data-flow diagram
        │
        ├── SystemControlsPane.vue           ← IDE-style log stream + radar pane
        ├── DbStatusBadge.vue                ← ● DB_STATUS: HYDRATED | LOCAL_FALLBACK | PENDING
        │
        ├── StackSection.vue                 ← skill group cards + SkillsChart radar (sticky right)
        ├── SkillsChart.vue                  ← Chart.js radar driven by skills.radarLabels/Values
        │
        ├── ExperienceSection.vue            ← timeline cards (role, company, bullets, tags)
        │
        ├── ProjectsSection.vue              ← merges store.projects with data/projects.js by name
        ├── ProjectCard.vue                  ← per-card layout with admin contenteditable bindings
        ├── ArchFlowDiagram.vue              ← SVG architecture flow with animated paths
        ├── ApiDocBlock.vue                  ← tabbed Swagger-style API documentation viewer
        │
        ├── MetricsDashboard.vue             ← 4-panel telemetry: engine status, DB, algos, certs
        │
        ├── AlgoSection.vue                  ← DSA repo card + LeetCode telemetry + pattern wall
        ├── DsaRepoCard.vue                  ← pinned DSA repository card
        ├── CodeSnippetPreview.vue           ← syntax-highlighted code rotation
        │
        ├── GithubSection.vue                ← Open-Source Engine: github_showcase v-for grid
        ├── CertsSection.vue                 ← cert-card grid (static data, not store-driven)
        │
        ├── ContactSection.vue               ← form → Supabase contact_messages (or EmailJS fallback)
        │
        ├── AdminField.vue                   ← legacy <input>/<textarea> wrapper (deprecated;
        │                                       replaced by inline :contenteditable + @blur)
        ├── AdminModal.vue                   ← Teleported terminal-styled auth modal
        └── AdminCommandBar.vue              ← floating bottom bar: Discard / Commit Changes
```

### Required environment variables

`.env.local` (gitignored — never commit):

```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon public key>

# optional EmailJS fallback (used only if Supabase not configured)
VITE_EMAILJS_SERVICE_ID=service_xxx
VITE_EMAILJS_TEMPLATE_ID=template_xxx
VITE_EMAILJS_PUBLIC_KEY=user_xxx
```

Edge Function secrets (Supabase dashboard → Edge Functions → Secrets):

```
RESEND_API_KEY=re_xxx
NOTIFY_TO=operator@example.com
NOTIFY_FROM=portfolio@yourdomain.com
```

**Security note.** The Supabase anon key is safe to ship in the bundle (RLS gates writes). The Supabase service-role key must NEVER appear in frontend code. `.env.local` is git-ignored in `.gitignore`.

---

## § 2 — The Prioritized Hybrid-Hydration Lifecycle Strategy

### Philosophy: "Predefined Content First, Stream Database Second"

The single most important architectural decision in this codebase: **the
database is an overlay on top of pre-seeded local content, not the
primary source of truth at render time.**

Why? Three failure modes that wiped previous iterations to blank screens:

1. **Cold start latency.** Even on Supabase's edge network, the first
   `SELECT` round-trip is 200-600ms. During that window a store bound
   directly to DB results renders zero cards.
2. **RLS misconfiguration.** A single forgotten `GRANT SELECT … TO anon`
   collapses every section.
3. **Empty tables on fresh deployment.** A clean database returns `[]`
   for `portfolio_projects`. A naive `projects.value = res.data` then
   clears the screen.

The fix: **all reactive refs initialize from a `DEFAULTS` block at store
creation. Bootstrap is a database-overlay step that NEVER assigns
null/empty/error.**

### First-frame paint contract

`src/stores/portfolio.js` opens with a static `DEFAULTS` constant
containing ready-to-render content for every section:

```js
const DEFAULTS = {
  hero:            { name, title, tagline, summary, status, badges:[…] },
  projects:        [ { id, name, tagline, description, stack, github, … }, … ],
  skills:          { radarLabels:[…], radarValues:[…], benchmarkValue, groups:[…] },
  dsa_data:        { leetcodeCount, leetcodeUrl, primaryLang, patterns:[…] },
  github_showcase: [ { id, name, description, language, stars, forks, url, topics }, … ],
  experience:      [ { id, company, role, period, location, bullets:[…], tags:[…] }, … ],
  metrics:         { gateScore, gateRank, iitmCGPA, … },
}
```

Inside `defineStore` every ref is hydrated synchronously:

```js
const hero            = ref(deepClone(DEFAULTS.hero))
const projects        = ref(deepClone(DEFAULTS.projects))
const skills          = ref(deepClone(DEFAULTS.skills))
const dsa_data        = ref(deepClone(DEFAULTS.dsa_data))
const github_showcase = ref(deepClone(DEFAULTS.github_showcase))
const experience      = ref(deepClone(DEFAULTS.experience))
const metrics         = ref(deepClone(DEFAULTS.metrics))
```

`deepClone` (a `JSON.parse(JSON.stringify(obj))` wrapper) prevents
later mutations from polluting `DEFAULTS`. As a consequence the very
first Vue render — before `onMounted` even fires — already paints every
section with full content.

### `bootstrap()` parallel-overlay protocol

`App.vue` calls `portfolioStore.bootstrap()` from `onMounted()` so the
hook fires *after* the first paint. The overlay is therefore
asynchronous and never blocking.

```js
async function bootstrap() {
  loading.value  = true
  dbStatus.value = 'pending'

  // No Supabase client (missing env vars) → silent no-op, defaults remain.
  if (!supabase) {
    dbStatus.value = 'local_fallback'
    loading.value  = false
    return
  }

  const hasArray  = (v) => Array.isArray(v) && v.length > 0
  const hasObject = (v) => v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length > 0

  try {
    // Parallel reads. Failures land in res.error, NOT thrown.
    const [contentRes, projectsRes, experienceRes] = await Promise.all([
      supabase.from('portfolio_content').select('*').eq('id', 'main_content').maybeSingle(),
      supabase.from('portfolio_projects').select('*').order('display_order', { ascending: true }),
      supabase.from('portfolio_experience').select('*').order('display_order', { ascending: true }),
    ])

    let overlays = 0

    // JSONB row — each field individually validated before overlay.
    if (!contentRes.error && contentRes.data) {
      const d = contentRes.data
      if (hasObject(d.hero_data))      { hero.value     = { ...DEFAULTS.hero,     ...d.hero_data };    overlays++ }
      if (hasObject(d.skills_data))    { skills.value   = { ...DEFAULTS.skills,   ...d.skills_data };  overlays++ }
      if (hasObject(d.dsa_data))       { dsa_data.value = { ...DEFAULTS.dsa_data, ...d.dsa_data };     overlays++ }
      if (hasObject(d.metrics_data))   { metrics.value  = { ...DEFAULTS.metrics,  ...d.metrics_data }; overlays++ }

      // STRICT GUARD — the bug that caused blank renders:
      if (d.github_showcase && Array.isArray(d.github_showcase) && d.github_showcase.length > 0) {
        github_showcase.value = d.github_showcase
        overlays++
      } else {
        console.log("Database github_showcase is empty. Preserving predefined repositories.")
      }
    }

    // Per-row tables — identical strict guard.
    if (projectsRes.data && Array.isArray(projectsRes.data) && projectsRes.data.length > 0) {
      projects.value = projectsRes.data.map(r => {
        const { display_order, updated_at, ...row } = r
        return row
      })
      overlays++
    } else {
      console.log("Database projects table is empty. Preserving predefined projects.")
    }

    if (experienceRes.data && Array.isArray(experienceRes.data) && experienceRes.data.length > 0) {
      experience.value = experienceRes.data.map(r => {
        const { display_order, updated_at, ...row } = r
        return row
      })
      overlays++
    } else {
      console.log("Database experience table is empty. Preserving predefined experience.")
    }

    dbStatus.value = overlays > 0 ? 'hydrated' : 'local_fallback'
  } catch (e) {
    // SILENT NO-OP on data refs. Only status flags get touched.
    dbStatus.value = 'local_fallback'
    dbError.value  = e?.message ?? String(e)
    console.warn('[portfolioStore] bootstrap fell back to local defaults:', e)
  } finally {
    loading.value = false
  }
}
```

### The four invariants this implementation guarantees

| # | Invariant |
|---|-----------|
| 1 | A data ref is **never** assigned `null`, `undefined`, `[]`, `{}`, or an error object. |
| 2 | A network failure caught by the outer `try/catch` writes only to status flags — every data ref retains its previous (default or last-overlaid) content. |
| 3 | A Supabase RLS block (returned as `res.error` without throwing) is treated identically to an empty response — the corresponding ref is left untouched. |
| 4 | The status flag `dbStatus` accurately reflects what happened: `'pending'` before bootstrap, `'hydrated'` if any overlay landed, `'local_fallback'` otherwise. |

### State telemetry

```js
loading  // boolean — true while bootstrap or commit is in flight
isDirty  // boolean — true after any admin mutation, false after successful commit
dbError  // string  — last error message (RLS, network, etc.)
dbStatus // 'pending' | 'hydrated' | 'local_fallback'
```

`DbStatusBadge.vue` reads `dbStatus` and renders an animated pill:
`● DB_STATUS: HYDRATED` (green), `● DB_STATUS: LOCAL_FALLBACK` (amber),
or `● DB_STATUS: PENDING…` (muted). It's mounted in `AdminCommandBar`,
`SystemControlsPane`, and the Open-Source Engine section header.

---

## § 3 — Complete Supabase SQL Database Schema Blueprint

Run these scripts in the Supabase SQL editor in order. Each block is
idempotent (`IF NOT EXISTS` / `ON CONFLICT DO NOTHING`).

### 3.1 Tables

```sql
-- ╔══════════════════════════════════════════════════════════════════╗
-- ║  portfolio_content — single-row JSONB blob for non-array content ║
-- ║  hero / skills / dsa / metrics / github_showcase + optional      ║
-- ║  snapshot of projects + experience for backwards compat.         ║
-- ╚══════════════════════════════════════════════════════════════════╝
CREATE TABLE IF NOT EXISTS public.portfolio_content (
  id              text        PRIMARY KEY,
  hero_data       jsonb,
  projects_data   jsonb,            -- legacy snapshot mirror; primary store is portfolio_projects
  skills_data     jsonb,
  dsa_data        jsonb,
  github_showcase jsonb,            -- array of open-source repo cards
  experience_data jsonb,            -- legacy snapshot mirror; primary store is portfolio_experience
  metrics_data    jsonb,
  updated_at      timestamptz DEFAULT now()
);

-- Seed the singleton row so .upsert() and .maybeSingle() always have something to lock onto.
INSERT INTO public.portfolio_content (id) VALUES ('main_content')
ON CONFLICT (id) DO NOTHING;


-- ╔══════════════════════════════════════════════════════════════════╗
-- ║  portfolio_projects — multi-row table, one project per row.      ║
-- ║  display_order is the manual sort index. id is a human slug      ║
-- ║  ('placement-route', 'v-park', …) — NOT a UUID.                  ║
-- ╚══════════════════════════════════════════════════════════════════╝
CREATE TABLE IF NOT EXISTS public.portfolio_projects (
  id            text        PRIMARY KEY,
  display_order integer     DEFAULT 0,
  name          text,
  tagline       text,
  affiliation   text,
  description   text,
  github        text,
  live          text,
  stack         jsonb,            -- string[]   e.g. ['Flask', 'PostgreSQL']
  highlights    jsonb,            -- {icon,color,title,desc}[]
  updated_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_projects_order
  ON public.portfolio_projects (display_order);


-- ╔══════════════════════════════════════════════════════════════════╗
-- ║  portfolio_experience — multi-row table, one job per row.        ║
-- ╚══════════════════════════════════════════════════════════════════╝
CREATE TABLE IF NOT EXISTS public.portfolio_experience (
  id            text        PRIMARY KEY,
  display_order integer     DEFAULT 0,
  company       text,
  role          text,
  period        text,
  location      text,
  bullets       jsonb,            -- string[]
  tags          jsonb,            -- string[]
  updated_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_experience_order
  ON public.portfolio_experience (display_order);


-- ╔══════════════════════════════════════════════════════════════════╗
-- ║  contact_messages — append-only inbox for ContactSection.vue.    ║
-- ║  anon can INSERT; only authenticated admin can SELECT/DELETE.    ║
-- ╚══════════════════════════════════════════════════════════════════╝
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_name  text NOT NULL,
  from_email text NOT NULL,
  subject    text,
  message    text NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

### 3.2 Row-Level Security

```sql
-- Enable RLS on every public table.
ALTER TABLE public.portfolio_content    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_projects   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages     ENABLE ROW LEVEL SECURITY;

-- ── Read policies ────────────────────────────────────────────────
-- Public web traffic must read every active row. The anon key is
-- shipped in the bundle, so the RLS gate is the only thing limiting
-- writes — reads are unrestricted on portfolio_* tables.
CREATE POLICY "public_read_content"    ON public.portfolio_content    FOR SELECT USING (true);
CREATE POLICY "public_read_projects"   ON public.portfolio_projects   FOR SELECT USING (true);
CREATE POLICY "public_read_experience" ON public.portfolio_experience FOR SELECT USING (true);

-- contact_messages is admin-only on read so visitor inboxes stay private.
CREATE POLICY "auth_read_contact" ON public.contact_messages
  FOR SELECT USING (auth.role() = 'authenticated');

-- ── Write policies ───────────────────────────────────────────────
-- Only signed-in admin (via supabase.auth.signInWithPassword) can mutate content.
CREATE POLICY "admin_write_content"    ON public.portfolio_content    FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_write_projects"   ON public.portfolio_projects   FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_write_experience" ON public.portfolio_experience FOR ALL USING (auth.role() = 'authenticated');

-- Anyone can INSERT into contact_messages (the public form).
CREATE POLICY "anon_insert_contact" ON public.contact_messages
  FOR INSERT TO anon WITH CHECK (true);
```

### 3.3 Grants

PostgREST routes API access through PostgreSQL roles. Even with
permissive RLS policies, an explicit `GRANT` on the role used by the
anon JWT is required:

```sql
-- Public read access for unauthenticated browser traffic
GRANT SELECT ON public.portfolio_content    TO anon;
GRANT SELECT ON public.portfolio_projects   TO anon;
GRANT SELECT ON public.portfolio_experience TO anon;

-- Allow anonymous form submissions
GRANT INSERT ON public.contact_messages TO anon;

-- Authenticated admin sees + writes everything (typical Supabase default but explicit)
GRANT SELECT, INSERT, UPDATE, DELETE
  ON public.portfolio_content, public.portfolio_projects, public.portfolio_experience, public.contact_messages
  TO authenticated;
```

### 3.4 Optional database webhook → Edge Function bridge

```
Dashboard → Database → Webhooks → New Webhook
  Table   : contact_messages
  Events  : INSERT
  Type    : Supabase Edge Function
  Target  : contact-handler
```

The Edge Function (`supabase/functions/contact-handler/index.ts`)
unwraps the webhook body, calls Resend with a styled HTML email, and
returns 200 OK. See § 5.1.

### 3.5 Verification queries

```sql
-- Confirm seed row exists
SELECT id, updated_at FROM public.portfolio_content;
-- Expected: ('main_content', <timestamp>)

-- Confirm RLS is active everywhere
SELECT tablename, rowsecurity
  FROM pg_tables
 WHERE schemaname='public' AND tablename LIKE 'portfolio_%' OR tablename = 'contact_messages';
```

---

## § 4 — Terminal UI Engine & Interactive Two-Way Editing Mechanics

### 4.1 Admin Mode toggle

Admin mode is a **client-side flag** held in `useAuthStore().isAdmin`.
Activating it does not grant database write access on its own — it only
flips the UI into edit-affordance mode. Actual writes are gated by
Supabase RLS on the signed-in session (see § 3.2).

Two activation paths:

| Path | Trigger | Implementation |
|------|---------|----------------|
| Keyboard | **Ctrl + Shift + A** anywhere on the page | Global `keydown` listener in `App.vue` `onMounted()` calls `uiStore.toggleAdminModal()` |
| Mouse | Triple-click the green "Available for opportunities" status pill in the hero | `HeroSection.vue` increments a `clickCount` with a 600ms reset timer |

Both paths open `AdminModal.vue` (a `<Teleport to="body">` overlay).
On successful `signInWithPassword`, `authStore.isAdmin = true` and the
modal closes. A dev-mode shortcut accepts `admin / admin` when Supabase
isn't configured so the editor still works offline.

When `isAdmin` flips:

- `AdminCommandBar.vue` slides in from the bottom (Vue Transition).
- Every `[contenteditable]` element becomes editable; `.ce-edit` styles
  paint a dashed-green border.
- Per-array `[+ Add …]` and per-item `[× Delete]` buttons appear.

### 4.2 The contenteditable + @blur pattern (replacement for AdminField wrapper)

Earlier iterations used an `<AdminField>` wrapper that rendered an
`<input>` or `<textarea>` when admin and a slot otherwise. That added
DOM noise and a wrapper component on every text node. The replacement
pattern is native:

```html
<h3 class="proj-name ce-edit"
    :contenteditable="isAdmin"
    @blur="(e) => portfolioStore.onEdit(project, 'name', e.target.innerText)"
>{{ project.name }}</h3>
```

Two things to internalize:

1. **`:contenteditable="isAdmin"`** — a *native* HTML attribute. Vue
   binds it dynamically; the browser handles cursor + caret + selection
   automatically. No JavaScript framework involved in the editing UX.

2. **`@blur="…"`** — fires when the user leaves the field. The handler
   reads `e.target.innerText` (NOT `innerHTML` — innerText auto-strips
   formatting that contenteditable can introduce on paste), trims it,
   and writes back to the reactive target. `portfolioStore.markDirty()`
   inside `onEdit` flips `isDirty = true` so the `AdminCommandBar`
   lights up.

3. **`.ce-edit` class** — applies the dashed-green focus ring + hover
   shadow (only visible because the global rule is scoped to
   `[contenteditable="true"].ce-edit`). When `isAdmin = false` the
   element has `contenteditable="false"` and reads as plain text.

### 4.3 Three utility state mutators

All three live on `portfolioStore` and are templates' single point of
write entry. They share two responsibilities: normalize the input value
and call `markDirty()`.

```js
/** Trim + write a string field. No-op on no-change. */
function onEdit(target, field, value) {
  const v = (typeof value === 'string' ? value : String(value)).trim()
  if (target?.[field] === v) return
  if (target) target[field] = v
  isDirty.value = true
}

/** Coerce to number with NaN guard. Used for gateScore, queryEfficiency, leetcodeCount, etc. */
function onEditNumber(target, field, value) {
  const n = Number(String(value).trim())
  if (Number.isNaN(n)) return
  if (target?.[field] === n) return
  if (target) target[field] = n
  isDirty.value = true
}

/** Split a comma-separated edit into a clean string array. Drops empties. */
function onEditList(target, field, value) {
  const list = String(value).split(',').map(t => t.trim()).filter(Boolean)
  if (target) target[field] = list
  isDirty.value = true
}
```

Usage shapes:

```html
<!-- string -->
<p :contenteditable="isAdmin" @blur="(e) => store.onEdit(job, 'role', e.target.innerText)">{{ job.role }}</p>

<!-- number -->
<span :contenteditable="isAdmin" @blur="(e) => store.onEditNumber(metrics, 'gateScore', e.target.innerText)">{{ metrics.gateScore }}</span>

<!-- comma-separated list (alternative to per-pill rendering) -->
<span :contenteditable="isAdmin" @blur="(e) => store.onEditList(project, 'stack', e.target.innerText)">{{ project.stack.join(', ') }}</span>
```

### 4.4 Per-pill array CRUD (the preferred pattern for tags & stacks)

For tag lists, tech stacks, badges — anywhere a `string[]` is rendered
as a row of chips — the production pattern renders each item as its
own contenteditable pill with an inline delete button, plus a trailing
`[+]` add button:

```html
<div class="exp-tags">
  <span v-for="(tag, ti) in job.tags" :key="ti" class="tag-item">
    <span
      class="ce-edit"
      :contenteditable="isAdmin"
      @blur="(e) => onTagBlur(job.id, ti, e.target.innerText)"
    >{{ tag }}</span>
    <button
      v-if="isAdmin"
      class="btn-del-tag"
      @click="portfolioStore.removeTag(job.id, ti)"
    ><i class="fas fa-times"></i></button>
  </span>
  <button
    v-if="isAdmin"
    class="btn-add-tag"
    @click="portfolioStore.addTag(job.id)"
  ><i class="fas fa-plus"></i></button>
</div>
```

Where `onTagBlur` (component-local) mutates by index:

```js
function onTagBlur(jobId, idx, value) {
  const job = experience.value.find(j => j.id === jobId)
  if (!job?.tags) return
  job.tags[idx] = String(value).trim()
  portfolioStore.markDirty()
}
```

This pattern repeats verbatim for `project.stack`, `project.highlights`,
`job.bullets`, `dsa_data.patterns`, and `skills.groups[].skills`.

### 4.5 The `.ce-edit:empty` invisible-element fix

Without protection, an empty contenteditable element collapses to a
zero-pixel height and becomes unclickable. The global CSS rules in
`src/assets/styles/main.css` force a visible minimum shape and a
placeholder hint:

```css
/* Active editing affordance — admin sees a dashed-green border */
[contenteditable="true"].ce-edit {
  outline       : none;
  cursor        : text;
  padding       : 0 5px;
  margin        : 0 -5px;
  border-radius : 3px;
  background    : rgba(16, 185, 129, 0.06);
  box-shadow    : inset 0 0 0 1px rgba(16, 185, 129, 0.28);
  transition    : background 0.15s, box-shadow 0.15s;
  min-width     : 1ch;
}
[contenteditable="true"].ce-edit:hover { box-shadow: inset 0 0 0 1px rgba(16, 185, 129, 0.55); }
[contenteditable="true"].ce-edit:focus {
  background    : rgba(16, 185, 129, 0.12);
  box-shadow    : inset 0 0 0 2px rgba(16, 185, 129, 0.7);
}

/* ★ Invisible-element insertion fix — empty editable fields paint as
   a dashed-green 120×1.5em box with their data-placeholder inside. */
.ce-edit:empty::before {
  content : attr(data-placeholder);
  color   : #4b5563;
}
.ce-edit:empty {
  min-width    : 120px;
  min-height   : 1.5em;
  display      : inline-block;
  border       : 1px dashed rgba(16, 185, 129, 0.4);
  background   : rgba(16, 185, 129, 0.05);
  padding      : 2px 6px;
  border-radius: 4px;
}

/* Block-level modifier for multiline contenteditable (description fields) */
[contenteditable="true"].ce-edit.ce-block {
  display     : block;
  white-space : pre-wrap;
  min-height  : 1.5em;
}
```

Every editable element should carry a `data-placeholder` attribute:

```html
<span class="ce-edit"
      :contenteditable="isAdmin"
      data-placeholder="repository name"
      @blur="…">{{ repo.name }}</span>
```

### 4.6 Add-action placeholder payloads

Every `add*` action in `portfolioStore` pushes a **fully-populated**
object. This is critical — pushing `{ id, name: '' }` lets fields
collapse before the user types. The convention:

```js
function addProject() {
  projects.value.push({
    id:          `temp_${Date.now()}`,
    name:        '📁 New Project Name',
    tagline:     'Click to type your project tagline',
    affiliation: 'Click to edit · 2026',
    description: 'Click this block to type out your detailed project engineering breakdown...',
    stack:       ['Vue 3', 'Node.js'],
    github:      '#',
    live:        '#',
    highlights:  [
      { icon: 'fas fa-star', color: '#10B981', title: 'Feature Alpha', desc: 'Click to edit this engineering highlight description.' },
      { icon: 'fas fa-bolt', color: '#3B82F6', title: 'Feature Beta',  desc: 'Click to add a second key implementation detail.' },
    ],
  })
  isDirty.value = true
}
```

Same approach for `addExperienceJob`, `addBullet`, `addTag`,
`addProjectHighlight`, `addProjectStackItem`, `addDsaPattern`,
`addSkillGroup`, `addSkillItem`, `addGithubShowcaseItem`.

### 4.7 Commit pipeline

`AdminCommandBar` exposes two buttons:

| Button | Handler | Effect |
|--------|---------|--------|
| Discard | `await portfolioStore.bootstrap()` | Re-fetches from Supabase. Any unsaved mutations are wiped (the overlay rewrites the refs from the DB snapshot or seeds the defaults again). |
| Commit Changes to Production | `await portfolioStore.commitChanges()` | Per-row upsert into `portfolio_projects` and `portfolio_experience`, then one upsert into `portfolio_content` for the JSONB columns. Sets `isDirty = false` on success. |

The Commit button text rotates through `Syncing N projects…` →
`Syncing N experience rows…` → `Persisting jsonb snapshot…` so the
operator sees the phase visually.

```js
async function commitChanges() {
  loading.value = true
  try {
    for (const [i, p] of projects.value.entries()) {
      await supabase.from('portfolio_projects').upsert({
        id: p.id, display_order: i,
        name: p.name, tagline: p.tagline, affiliation: p.affiliation,
        description: p.description, github: p.github, live: p.live,
        stack: p.stack, highlights: p.highlights,
        updated_at: new Date(),
      })
    }
    for (const [i, j] of experience.value.entries()) {
      await supabase.from('portfolio_experience').upsert({
        id: j.id, display_order: i,
        company: j.company, role: j.role, period: j.period, location: j.location,
        bullets: j.bullets, tags: j.tags,
        updated_at: new Date(),
      })
    }
    await supabase.from('portfolio_content').upsert({
      id: 'main_content',
      hero_data:       hero.value,
      skills_data:     skills.value,
      dsa_data:        dsa_data.value,
      github_showcase: github_showcase.value,
      metrics_data:    metrics.value,
      projects_data:   projects.value,   // legacy mirror
      experience_data: experience.value, // legacy mirror
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
```

---

## § 5 — API Specifications & Telemetry Modules

### 5.1 Contact webhook — Resend Edge Function

`ContactSection.vue` submits the form with two transport options:

1. **Primary** — `supabase.from('contact_messages').insert(payload)`.
   The Supabase database webhook (§ 3.4) fires the Edge Function on
   INSERT, which POSTs Resend.
2. **Fallback** — if `VITE_SUPABASE_URL` isn't configured, the
   component falls through to `emailjs.send(EMAILJS_SID, EMAILJS_TID,
   payload, { publicKey: EMAILJS_KEY })`.

The Edge Function (`supabase/functions/contact-handler/index.ts`):

```ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const CORS = {
  'Access-Control-Allow-Origin' : '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const body   = await req.json()
    const record = body.record ?? body            // unwrap DB webhook envelope
    const { from_name, from_email, subject, message } = record

    if (!from_name || !from_email || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } },
      )
    }

    const RESEND_KEY  = Deno.env.get('RESEND_API_KEY')  ?? ''
    const NOTIFY_TO   = Deno.env.get('NOTIFY_TO')       ?? ''
    const NOTIFY_FROM = Deno.env.get('NOTIFY_FROM')     ?? 'portfolio@example.com'

    if (!RESEND_KEY || !NOTIFY_TO) {
      return new Response(
        JSON.stringify({ success: true, note: 'Email skipped — secrets not configured.' }),
        { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } },
      )
    }

    const emailRes = await fetch('https://api.resend.com/emails', {
      method : 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body   : JSON.stringify({
        from:    NOTIFY_FROM,
        to:      [NOTIFY_TO],
        subject: `[Portfolio] ${subject ?? '(no subject)'} — from ${from_name}`,
        html:    `<div style="font-family:monospace;…">…${message}…</div>`,
      }),
    })

    if (!emailRes.ok) throw new Error(`Resend ${emailRes.status}: ${await emailRes.text()}`)

    return new Response(JSON.stringify({ success: true }),
      { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } })
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } },
    )
  }
})
```

Deploy:

```bash
supabase login
supabase link --project-ref <project-ref>
supabase functions deploy contact-handler

# Set secrets
supabase secrets set RESEND_API_KEY=re_xxx
supabase secrets set NOTIFY_TO=operator@example.com
supabase secrets set NOTIFY_FROM=portfolio@yourdomain.com
```

### 5.2 Algorithmic Engine telemetry layout

`AlgoSection.vue` renders a wall of progress bars driven by
`store.dsa_data.patterns`. The design ships **17 patterns organized
into 4 color-coded categories**. The colour is the structural
classifier — patterns of the same colour cluster visually so a
recruiter can scan competencies by domain.

| Colour | Hex | Category | Pattern | Suggested icon |
|--------|-----|----------|---------|----------------|
| 🟢 Green | `#10B981` | Array & Matrix Ops | Sliding Window | `fa-window-maximize` |
| 🟢 Green | `#10B981` | Array & Matrix Ops | Two Pointers | `fa-arrows-alt-h` |
| 🟢 Green | `#10B981` | Array & Matrix Ops | Prefix Sums | `fa-calculator` |
| 🟢 Green | `#10B981` | Array & Matrix Ops | Kadane's Algorithm | `fa-chart-line` |
| 🟢 Green | `#10B981` | Array & Matrix Ops | Matrix Layer Rotations | `fa-sync-alt` |
| 🔵 Blue | `#3B82F6` | Searching & Sorting | Binary Search Optimization | `fa-search` |
| 🔵 Blue | `#3B82F6` | Searching & Sorting | QuickSelect | `fa-bolt` |
| 🔵 Blue | `#3B82F6` | Searching & Sorting | Merge Sort Inversion Count | `fa-sort` |
| 🟣 Purple | `#8B5CF6` | Graph & Tree Telemetry | Breadth-First Search | `fa-project-diagram` |
| 🟣 Purple | `#8B5CF6` | Graph & Tree Telemetry | Depth-First Search | `fa-code-branch` |
| 🟣 Purple | `#8B5CF6` | Graph & Tree Telemetry | Dijkstra's Shortest Path | `fa-route` |
| 🟣 Purple | `#8B5CF6` | Graph & Tree Telemetry | Topological Sort (Kahn) | `fa-sort-amount-down` |
| 🟣 Purple | `#8B5CF6` | Graph & Tree Telemetry | Disjoint Set Union (DSU) | `fa-link` |
| 🟠 Amber | `#F59E0B` | Dynamic Programming | DP Memoization Maps | `fa-table` |
| 🟠 Amber | `#F59E0B` | Dynamic Programming | DP Tabulation Maps | `fa-th` |
| 🟠 Amber | `#F59E0B` | Dynamic Programming | Knapsack Patterns | `fa-box-open` |
| 🟠 Amber | `#F59E0B` | Dynamic Programming | Longest Common Subseq. | `fa-stream` |

Each row in `dsa_data.patterns` is a flat shape:

```js
{ name: 'Sliding Window', icon: 'fas fa-window-maximize', color: '#10B981', pct: 90 }
```

The component template:

```html
<div v-for="(p, i) in dsa.patterns" :key="p.name + i" class="pattern-row">
  <div class="pattern-left">
    <i :class="p.icon" :style="{ color: p.color }"></i>
    <span class="ce-edit"
          :contenteditable="isAdmin"
          @blur="(e) => store.onEdit(p, 'name', e.target.innerText)"
    >{{ p.name }}</span>
  </div>
  <div class="pattern-bar-wrap">
    <div class="pattern-bar"
         :style="{ width: isVisible ? p.pct + '%' : '0%', background: p.color }"
    ></div>
  </div>
  <span class="ce-edit"
        :contenteditable="isAdmin"
        @blur="(e) => store.onEditNumber(p, 'pct', e.target.innerText)"
        :style="{ color: p.color }"
  >{{ p.pct }}%</span>
</div>
```

The bar fills with a 1.4s CSS transition keyed off `isVisible`, which
flips to `true` when an `IntersectionObserver` detects the section
entering the viewport (`useCounter.js` uses the same pattern). This
gives the progress bars their characteristic sweep-in animation.

### 5.3 Skills radar chart

`SkillsChart.vue` (used inside `StackSection.vue` and
`SystemControlsPane.vue`) reads three reactive fields:

```js
skills.radarLabels   // string[]  — axis labels (8 typical)
skills.radarValues   // number[]  — proficiency 0-100 per axis
skills.benchmarkValue // number    — dashed reference line (typ. 70)
```

Datasets: a green polygon for proficiency + a dashed blue benchmark
ring filled to `benchmarkValue`. Chart.js options run everything in
monospace and disable the default Chart.js legend (we render a custom
HTML legend below the canvas).

### 5.4 SystemControlsPane log stream

`useUIStore().systemLogs` is a 120-entry ring buffer of
`{ id, level, msg, ts }` records. The store's `bootstrap()` and
`commitChanges()` actions push log lines (e.g.
`db.bootstrap  HYDRATED — 3 overlays applied`) so the IDE-style pane
mirrors what the data layer is doing in real time.

`SystemControlsPane.vue` renders newest-first with a `<TransitionGroup>`
slide animation, plus a status bar that combines the `DbStatusBadge`,
loading flag, dirty flag, and `dbError` string.

### 5.5 OsWindow boot animation

Every section is wrapped by `OsWindow.vue`, which provides:

- macOS traffic-light controls (red close — visual only; yellow
  minimize — toggles a `v-if` collapse transition; green maximize —
  visual only).
- Shell-path breadcrumb: `aayush@portfolio:~/projects $ deployments.list`
- Motion One entrance animation triggered by `inView()` from `motion`:

```js
import { animate, inView } from 'motion'

onMounted(() => {
  stopInView = inView(windowEl.value, () => {
    animate(windowEl.value,
      { opacity: [0, 1], scale: [0.97, 1], y: [18, 0] },
      { duration: 0.52, delay: props.delay / 1000, easing: [0.22, 1, 0.36, 1] }
    )
  }, { amount: 0.08 })
})
```

The window's CSS starts at `opacity: 0` so it's invisible until the
viewport scroll triggers the animation. Below-the-fold windows fade in
on scroll rather than all firing on mount, giving the section list a
natural cascading boot feel.

---

## Appendix A — Reconstruction checklist (clone-to-running)

1. `npx create-vite my-portfolio --template vue` → cd in.
2. `npm i pinia @supabase/supabase-js motion chart.js vue-chartjs`
3. `npm i -D tailwindcss @tailwindcss/vite`
4. Copy `vite.config.js` with `tailwindcss()` plugin added.
5. Recreate the `src/stores/portfolio.js` `DEFAULTS` object using the
   client's content. Keep the `bootstrap()` / `commitChanges()` /
   `onEdit` / `onEditNumber` / `onEditList` shape verbatim.
6. Recreate `src/stores/auth.js` and `src/stores/ui.js` from § 4.1 and § 5.4.
7. Recreate `src/services/supabase.js` — return `null` if env vars missing.
8. Copy `src/assets/styles/main.css` token block + `.ce-edit` rules (§ 4.5).
9. Build each section component using the contenteditable + @blur
   pattern from § 4.2. Wrap them all in `<OsWindow>` from § 5.5.
10. Run the SQL DDL in § 3.1, RLS in § 3.2, grants in § 3.3.
11. Populate `.env.local` with the Supabase project URL and anon key.
12. Deploy the Edge Function per § 5.1 if email notifications are wanted.
13. `npm run dev` → first paint shows full defaults; Ctrl+Shift+A opens
    admin modal; sign in; edit any field; Commit Changes uploads.
14. `npm run build` produces the static SPA for any host (Vercel,
    Netlify, Cloudflare Pages, GitHub Pages).

---

## Appendix B — File-to-section quick reference

| User-visible section | Component | Store binding |
|---|---|---|
| Hero (name, badges, terminal) | `HeroSection.vue` | `portfolio.hero` |
| System monitor + radar | `SystemControlsPane.vue` | `ui.systemLogs`, `portfolio.skills` |
| The Engine Room (skill cards) | `StackSection.vue` | `portfolio.skills.groups` |
| Proficiency radar | `SkillsChart.vue` | `portfolio.skills.radar*` |
| Work Experience timeline | `ExperienceSection.vue` | `portfolio.experience` |
| System Architecture (projects) | `ProjectsSection.vue` → `ProjectCard.vue` | `portfolio.projects` + `data/projects.js` |
| Infrastructure Monitoring | `MetricsDashboard.vue` | `portfolio.metrics`, `portfolio.dsa_data` |
| Algorithmic Engine | `AlgoSection.vue` | `portfolio.dsa_data.patterns` |
| Open-Source Engine | `GithubSection.vue` | `portfolio.github_showcase` |
| Credentials | `CertsSection.vue` | static `CERTS` const (not store-driven) |
| Contact | `ContactSection.vue` | writes to `contact_messages` |

---

*End of ARCH.md. If anything in this document drifts from the running
code, the running code is wrong — fix it back to match the contracts
documented here, especially § 2 (hydration invariants) and § 3 (RLS).*
