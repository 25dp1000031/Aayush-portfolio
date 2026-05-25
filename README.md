# Aayush Kukade — Portfolio

World-class backend-engineer portfolio built with **Vue 3 + Vite + Pinia**.

---

## Tech Stack

| Layer          | Technology                              |
|----------------|-----------------------------------------|
| Framework      | Vue 3 (Composition API, `<script setup>`) |
| State          | Pinia — theme store (dark / light)      |
| Build tool     | Vite 5                                  |
| Styling        | Scoped SFC CSS + CSS custom properties  |
| Icons          | Font Awesome 6                          |
| Fonts          | Inter + JetBrains Mono (Google Fonts)   |

---

## Project Structure

```
Ak_Portfolio/
├── index.html               ← Vite entry point
├── vite.config.js           ← Build config + asset-sync plugin
├── package.json
│
├── Certs/                   ← Certificate PDFs & images (your originals)
├── profilePic/              ← Profile photo
├── resume/                  ← Resume PDF
│
├── public/                  ← Auto-populated by vite.config on dev/build
│                              (Certs/, profilePic/, resume/ get synced here)
│
└── src/
    ├── main.js              ← createApp + createPinia + mount
    ├── App.vue              ← Root layout — assembles all sections
    │
    ├── assets/
    │   └── styles/main.css  ← Global tokens, reset, shared helpers
    │
    ├── stores/
    │   └── theme.js         ← Pinia: dark/light theme toggle + persistence
    │
    ├── data/
    │   └── projects.js      ← All project data (arch flow, API docs, highlights)
    │
    ├── composables/
    │   ├── useScrollReveal.js  ← IntersectionObserver scroll-reveal
    │   ├── useTypewriter.js    ← Character-by-character typewriter animation
    │   └── useCounter.js       ← Animated number counter
    │
    └── components/
        ├── NavBar.vue           ← Sticky glassmorphism nav + theme toggle
        ├── BackgroundLogStream.vue  ← Fixed low-opacity server-log stream
        │
        ├── HeroSection.vue      ← Split hero: text + terminal + pipeline
        ├── TerminalWidget.vue   ← Typewriter JSON terminal mock
        ├── PipelineVisualizer.vue  ← Interactive hover-able pipeline nodes
        │
        ├── StackSection.vue     ← Engine room — skills grouped as services
        ├── ExperienceSection.vue   ← Timeline work experience
        │
        ├── ProjectsSection.vue  ← Loops ProjectCard for each project
        ├── ProjectCard.vue      ← Architecture card with API docs + flow
        ├── ArchFlowDiagram.vue  ← SVG animated architecture flow
        ├── ApiDocBlock.vue      ← Tabbed API docs (KeepAlive preserved)
        │
        └── api-panels/          ← Tab panel sub-components
            ├── OverviewPanel.vue   ← Endpoint list
            ├── CurlPanel.vue       ← cURL command with copy button
            ├── ResponsePanel.vue   ← Syntax-highlighted JSON response
            └── SchemaPanel.vue     ← Data contract / TypeScript-style schema
        │
        ├── MetricsDashboard.vue ← Telemetry monitoring dashboard
        ├── CertsSection.vue     ← Certifications grid
        ├── ContactSection.vue   ← Form + social links + avatar
        └── FooterSection.vue    ← Footer
```

---

## Features

### Design
- **Dark mode default** — deep charcoal `#0B0F19`, `#1E293B` with terminal-green (`#10B981`) and cyber-blue (`#3B82F6`) accents
- **Light mode** — soft-white `#F8FAFC` with Fluent/Material-You glassmorphism
- **Silky theme transition** — all color tokens via CSS custom properties, toggled by Pinia store setting `data-theme` on `<html>`

### System Animations
- **Background log stream** — fixed low-opacity server logs scrolling continuously
- **Typewriter terminal** — JSON config types character-by-character on load, then syntax-highlights
- **Interactive pipeline nodes** — hover each node for state tooltip; animated status line
- **SVG arch flow diagrams** — animated `stroke-dashoffset` paths trigger on viewport entry
- **Scroll reveal** — `IntersectionObserver` composable adds `.visible` class on entry
- **Counter animation** — LeetCode stat counts up with ease-out easing

### Advanced Components
- **ApiDocBlock** (`KeepAlive`) — 4 tabs: Endpoint Overview, cURL command, JSON Response, Schema
- **ArchFlowDiagram** — per-project SVG with animated glowing connector lines and labelled nodes
- **MetricsDashboard** — telemetry-style panels: Core Engine, DB Clusters, Algorithm Engine, Benchmarks

---

## Getting Started

### Prerequisites
- Node.js 18+ (uses `fs.cpSync` — available from Node 16.7+)

### Install
```bash
npm install
```

### Development
```bash
npm run dev
```
Vite starts on `http://localhost:5173`. The asset-sync plugin automatically copies `Certs/`, `profilePic/`, and `resume/` into `public/` so they're served at `/Certs/...` etc.

### Production build
```bash
npm run build
```
Output is in `dist/`. The plugin also copies the three asset folders into `dist/` automatically.

### Preview built site
```bash
npm run preview
```

---

## Customisation

| What to change          | Where                            |
|-------------------------|----------------------------------|
| Project details         | `src/data/projects.js`           |
| Personal info / socials | `src/components/HeroSection.vue` |
| Work experience         | `src/components/ExperienceSection.vue` |
| Certifications          | `src/components/CertsSection.vue` |
| Design tokens           | `src/assets/styles/main.css`     |
| Contact form endpoint   | `src/components/ContactSection.vue` (Formspree URL) |

---

## Deployment

The built `dist/` folder is a static site — deploy to **GitHub Pages**, **Netlify**, **Vercel**, or any static host.

For GitHub Pages with a sub-path (e.g. `username.github.io/portfolio`), update `base` in `vite.config.js`:
```js
base: '/portfolio/'
```
