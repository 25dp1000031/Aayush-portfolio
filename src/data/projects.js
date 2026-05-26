// ── projects.js — thin re-export from portfolio-data.js ──────────────────
// All project data now lives in src/data/portfolio-data.js.
// This file stays so that existing imports (`@/data/projects.js`) keep working.
export { STATIC_PROJECTS as PROJECTS } from './portfolio-data.js'
