<template>
  <!-- Split-layout hero: left = text, right = terminal + pipeline -->
  <section class="hero-section" id="hero">
    <div class="hero-container">

      <!-- ── Left: Content ─────────────────────────────────── -->
      <div class="hero-left reveal from-left">

        <!-- Availability status pill
             Triple-click triggers the admin authentication modal -->
        <div class="status-pill" @click="handleStatusClick">
          <span class="dot"></span>
          <AdminField v-model="hero.status">
            <span>{{ hero.status }}</span>
          </AdminField>
        </div>

        <!-- Name + role -->
        <h1 class="hero-name">
          <AdminField v-model="hero.name">
            <template #default>
              {{ firstName }}<br />
              <span class="name-accent">{{ lastName }}</span>
            </template>
          </AdminField>
          <!-- When admin is editing the full name appears as one input -->
          <span v-if="!isAdmin" style="display:none"></span>
        </h1>

        <p class="hero-role">
          <AdminField v-model="hero.title">{{ hero.title }}</AdminField>
        </p>
        <p class="hero-tagline">
          <AdminField v-model="hero.tagline">{{ hero.tagline }}</AdminField>
        </p>

        <!-- Credential badge row -->
        <div class="badge-row">
          <span
            v-for="b in hero.badges"
            :key="b.label"
            :class="['badge', `badge-${b.variant}`]"
          >
            <i :class="b.icon"></i>
            <AdminField v-model="b.label">{{ b.label }}</AdminField>
          </span>
        </div>

        <!-- Summary -->
        <p class="hero-summary">
          <AdminField v-model="hero.summary" :multiline="true" :rows="4">
            {{ hero.summary }}
          </AdminField>
        </p>

        <!-- CTAs -->
        <div class="cta-row">
          <a href="#projects" class="btn btn-primary">
            <i class="fas fa-sitemap"></i> View System Architecture
          </a>
          <a href="#contact" class="btn btn-secondary">
            <i class="fas fa-handshake"></i> Establish Handshake
          </a>
          <a href="./resume/Aayush_resume_12_04_2026.pdf" target="_blank" rel="noopener" class="btn btn-ghost">
            <i class="fas fa-file-alt"></i> Resume
          </a>
        </div>

        <!-- Social links -->
        <div class="socials">
          <a href="https://github.com/its-tsukii" target="_blank" rel="noopener" aria-label="GitHub">
            <i class="fab fa-github"></i>
          </a>
          <a href="https://www.linkedin.com/in/aayush-kukade" target="_blank" rel="noopener" aria-label="LinkedIn">
            <i class="fab fa-linkedin"></i>
          </a>
          <a href="https://medium.com/@sroy10012001" target="_blank" rel="noopener" aria-label="Medium">
            <i class="fab fa-medium"></i>
          </a>
        </div>
      </div>

      <!-- ── Right: Terminal + Pipeline ───────────────────── -->
      <div class="hero-right reveal from-right">
        <TerminalWidget />
        <PipelineVisualizer />
      </div>

    </div>

    <!-- Scroll indicator -->
    <div class="scroll-hint">
      <span>scroll</span>
      <div class="scroll-line"></div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed }     from 'vue'
import { storeToRefs }       from 'pinia'
import TerminalWidget         from './TerminalWidget.vue'
import PipelineVisualizer     from './PipelineVisualizer.vue'
import AdminField             from './AdminField.vue'
import { usePortfolioStore }  from '@/stores/portfolio'
import { useAuthStore }       from '@/stores/auth'
import { useUIStore }         from '@/stores/ui'

const portfolioStore = usePortfolioStore()
const { hero }       = storeToRefs(portfolioStore)
const { isAdmin }    = storeToRefs(useAuthStore())
const uiStore        = useUIStore()

// Split name for the accent highlight on the last name
const firstName = computed(() => hero.value.name.split(' ')[0] ?? 'Aayush')
const lastName  = computed(() => hero.value.name.split(' ').slice(1).join(' ') ?? 'Kukade')

// Triple-click on the status pill → open admin modal
let clickCount  = 0
let clickTimer  = null
function handleStatusClick() {
  clickCount++
  if (clickCount >= 3) {
    clickCount = 0
    clearTimeout(clickTimer)
    uiStore.openAdminModal()
  } else {
    clickTimer = setTimeout(() => { clickCount = 0 }, 600)
  }
}
</script>

<style scoped>
.hero-section {
  min-height     : 100vh;
  padding-top    : var(--nav-height);
  display        : flex;
  flex-direction : column;
  justify-content: center;
  position       : relative;
  z-index        : 1;
}

.hero-container {
  max-width : 1200px;
  margin    : 0 auto;
  padding   : 80px 24px 60px;
  display   : grid;
  grid-template-columns: 1fr 1fr;
  gap       : 60px;
  align-items: center;
}

/* Status pill */
.status-pill {
  display         : inline-flex;
  align-items     : center;
  gap             : 8px;
  background      : rgba(16,185,129,0.1);
  border          : 1px solid rgba(16,185,129,0.25);
  padding         : 5px 14px;
  border-radius   : 999px;
  margin-bottom   : 24px;
  font-size       : 0.78rem;
  font-family     : var(--font-mono);
  color           : var(--accent-green);
  cursor          : default;
  user-select     : none;
}
.dot {
  width: 8px; height: 8px;
  background    : var(--accent-green);
  border-radius : 50%;
  animation     : pulse-dot 2.2s ease-in-out infinite;
  flex-shrink   : 0;
}

/* Name */
.hero-name {
  font-size     : clamp(2.6rem, 6vw, 4rem);
  font-weight   : 700;
  line-height   : 1.08;
  letter-spacing: -0.025em;
  margin-bottom : 10px;
}
.name-accent { color: var(--accent-green); }

.hero-role {
  font-size    : 1.1rem;
  font-weight  : 600;
  color        : var(--accent-blue);
  font-family  : var(--font-mono);
  margin-bottom: 4px;
}
.hero-tagline {
  font-size    : 0.9rem;
  color        : var(--text-secondary);
  margin-bottom: 24px;
}

/* Badges */
.badge-row {
  display      : flex;
  flex-wrap    : wrap;
  gap          : 8px;
  margin-bottom: 24px;
}

/* Summary */
.hero-summary {
  font-size    : 0.93rem;
  color        : var(--text-secondary);
  line-height  : 1.75;
  max-width    : 520px;
  margin-bottom: 32px;
}

/* CTAs */
.cta-row {
  display      : flex;
  flex-wrap    : wrap;
  gap          : 12px;
  margin-bottom: 28px;
}

/* Socials */
.socials { display: flex; gap: 18px; }
.socials a {
  color      : var(--text-muted);
  font-size  : 1.15rem;
  transition : var(--transition);
}
.socials a:hover { color: var(--accent-green); transform: translateY(-2px); }

/* Right column */
.hero-right { display: flex; flex-direction: column; gap: 16px; }

/* Scroll hint */
.scroll-hint {
  display        : flex;
  flex-direction : column;
  align-items    : center;
  gap            : 8px;
  padding-bottom : 32px;
  color          : var(--text-muted);
  font-family    : var(--font-mono);
  font-size      : 0.68rem;
  letter-spacing : 0.12em;
  text-transform : uppercase;
}
.scroll-line {
  width      : 1px;
  height     : 40px;
  background : linear-gradient(to bottom, var(--text-muted), transparent);
  animation  : scrollPulse 2s ease-in-out infinite;
}

/* ─── Responsive ─── */
@media (max-width: 860px) {
  .hero-container { grid-template-columns: 1fr; gap: 40px; padding-top: 60px; }
  .hero-right { order: -1; }
}
@media (max-width: 540px) {
  .cta-row { flex-direction: column; }
  .cta-row .btn { justify-content: center; }
}
</style>
