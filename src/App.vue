<template>
  <!--
    OS Desktop Surface
    ──────────────────
    Every portfolio section lives inside an <OsWindow> — a macOS-style
    terminal window with traffic-light controls, a shell-path title bar,
    and a Motion One entrance animation triggered by IntersectionObserver.

    Layout:
      ┌─ NavBar (fixed/sticky) ────────────────────────────────────────┐
      │  BackgroundLogStream (canvas, position:fixed, z=-1)            │
      └────────────────────────────────────────────────────────────────┘
      ┌─ .os-desktop ──────────────────────────────────────────────────┐
      │  ┌─ .desktop-grid ─────────────────────────────────────────┐   │
      │  │  OsWindow > HeroSection          (full-width)           │   │
      │  │  OsWindow > SystemControlsPane   (full-width)           │   │
      │  │  OsWindow > StackSection         (full-width)           │   │
      │  │  ...                                                    │   │
      │  └─────────────────────────────────────────────────────────┘   │
      └────────────────────────────────────────────────────────────────┘
  -->
  <div class="os-desktop">

    <!-- Ambient log-stream canvas (background, non-interactive) -->
    <BackgroundLogStream />

    <!-- Sticky system navbar -->
    <NavBar />

    <!-- ── Desktop window stack ─────────────────────────────────── -->
    <main class="desktop-grid" id="desktop-main">

      <!-- 01 · Hero — full-screen boot window -->
      <OsWindow
        path="~/aayush-kukade"
        cmd="portfolio.boot --init"
        :delay="0"
        class="win-hero"
      >
        <HeroSection />
      </OsWindow>

      <!-- 02 · System monitor — log stream + proficiency radar -->
      <OsWindow
        path="~/system.monitor"
        cmd="runtime.logs --watch --radar"
        :delay="40"
        class="win-monitor"
      >
        <SystemControlsPane />
      </OsWindow>

      <!-- 03 · Engine Room — skills grid + Chart.js radar -->
      <OsWindow
        path="~/stack"
        cmd="infrastructure.map --verbose"
        :delay="0"
      >
        <StackSection />
      </OsWindow>

      <!-- 04 · Work Experience — store-driven timeline -->
      <OsWindow
        path="~/experience"
        cmd="process.stdout experience --json"
        :delay="0"
      >
        <ExperienceSection />
      </OsWindow>

      <!-- 05 · System Architecture — project cards with SVG arch flows -->
      <OsWindow
        path="~/projects"
        cmd="deployments.list --arch --api-docs"
        :delay="0"
      >
        <ProjectsSection />
      </OsWindow>

      <!-- 06 · Metrics Dashboard — academic + algorithmic telemetry -->
      <OsWindow
        path="~/metrics"
        cmd="system.getMetrics --live --all"
        :delay="0"
      >
        <MetricsDashboard />
      </OsWindow>

      <!-- 07 · Algorithmic Engine — DSA + LeetCode + code snippets -->
      <OsWindow
        path="~/algo"
        cmd="algorithmic.engine --dsa --leetcode"
        :delay="0"
      >
        <AlgoSection />
      </OsWindow>

      <!-- 08 · Open-Source Engine — pinned GitHub repos -->
      <OsWindow
        path="~/github"
        cmd="open.source.engine --pinned --sort=stars"
        :delay="0"
      >
        <GithubSection />
      </OsWindow>

      <!-- 09 · Credentials — platform certifications -->
      <OsWindow
        path="~/certs"
        cmd="credentials.verify --all --cloud"
        :delay="0"
      >
        <CertsSection />
      </OsWindow>

      <!-- 10 · Contact — Supabase form + social links -->
      <OsWindow
        path="~/contact"
        cmd="handshake.init --open --transport=supabase"
        :delay="0"
      >
        <ContactSection />
      </OsWindow>

    </main>

    <FooterSection />

    <!-- ── Admin subsystem ────────────────────────────────────────── -->
    <!-- Auth modal: Ctrl+Shift+A or triple-click status pill -->
    <AdminModal />
    <!-- Floating commit/discard bar — visible when isAdmin === true -->
    <AdminCommandBar />

  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'

// ── Section components ──────────────────────────────────────────────
import BackgroundLogStream from '@/components/BackgroundLogStream.vue'
import NavBar              from '@/components/NavBar.vue'
import HeroSection         from '@/components/HeroSection.vue'
import SystemControlsPane  from '@/components/SystemControlsPane.vue'
import StackSection        from '@/components/StackSection.vue'
import ExperienceSection   from '@/components/ExperienceSection.vue'
import ProjectsSection     from '@/components/ProjectsSection.vue'
import MetricsDashboard    from '@/components/MetricsDashboard.vue'
import AlgoSection         from '@/components/AlgoSection.vue'
import GithubSection       from '@/components/GithubSection.vue'
import CertsSection        from '@/components/CertsSection.vue'
import ContactSection      from '@/components/ContactSection.vue'
import FooterSection       from '@/components/FooterSection.vue'

// ── OS chrome ──────────────────────────────────────────────────────
import OsWindow            from '@/components/OsWindow.vue'

// ── Admin components ────────────────────────────────────────────────
import AdminModal          from '@/components/AdminModal.vue'
import AdminCommandBar     from '@/components/AdminCommandBar.vue'

// ── Composables & stores ────────────────────────────────────────────
import { useScrollReveal }   from '@/composables/useScrollReveal'
import { usePortfolioStore } from '@/stores/portfolio'
import { useUIStore }        from '@/stores/ui'

useScrollReveal()

const portfolioStore = usePortfolioStore()
const uiStore        = useUIStore()

// ── Lifecycle ───────────────────────────────────────────────────────
onMounted(() => {
  // Hydrate all store state from Supabase after the DOM is ready.
  // Calling inside onMounted (not at setup time) guarantees Pinia is
  // fully initialized and the component tree is mounted before the
  // async fetch mutates reactive state.
  portfolioStore.bootstrap()

  // Global keyboard shortcut: Ctrl + Shift + A → admin auth modal
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

function handleKeydown(e) {
  if (e.ctrlKey && e.shiftKey && e.key === 'A') {
    e.preventDefault()
    uiStore.toggleAdminModal()
  }
}
</script>

<style>
/* ── OS Desktop surface ──────────────────────────────────────────── */
.os-desktop {
  min-height : 100vh;
  /* Deeper dark than --bg-primary to look like a desktop surface */
  background : #03050b;
  position   : relative;
}

/* ── Window column ───────────────────────────────────────────────── */
.desktop-grid {
  max-width   : 1380px;
  margin      : 0 auto;
  padding     : calc(var(--nav-height) + 24px) 20px 60px;
  display     : flex;
  flex-direction: column;
  gap         : 18px;
}

/* Hero window — no horizontal padding overriding its own layout */
.win-hero .os-body { overflow: visible; }

/* Monitor window — constrained height so it doesn't overpower the hero */
.win-monitor .os-body { max-height: 420px; overflow: hidden; }

/* ── Section backgrounds inherit correctly inside OsWindow ───────── */
/* Each section's own .section rule still fires; the OsWindow
   border-radius clips the painted background to the card shape. */
</style>
