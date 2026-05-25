<template>
  <!-- Sticky glassmorphism navigation bar -->
  <nav class="navbar" :class="{ scrolled: isScrolled }">
    <div class="nav-container">

      <!-- Brand: terminal-style logo -->
      <a href="#hero" class="nav-brand">
        <span class="bracket">[</span>aayush<span class="accent">.dev</span><span class="bracket">]</span>
        <span class="cursor">▌</span>
      </a>

      <!-- Desktop nav links -->
      <ul class="nav-links" :class="{ open: menuOpen }">
        <li v-for="link in NAV_LINKS" :key="link.href">
          <a :href="link.href" class="nav-link" @click="menuOpen = false">
            <span class="link-prefix">/</span>{{ link.label }}
          </a>
        </li>
      </ul>

      <!-- Right cluster -->
      <div class="nav-right">
        <!-- Theme toggle -->
        <button class="theme-toggle" @click="themeStore.toggle()" :aria-label="`Switch to ${isDark ? 'light' : 'dark'} mode`">
          <span class="track">
            <span class="thumb" :class="{ light: !isDark }">
              <i class="fas" :class="isDark ? 'fa-moon' : 'fa-sun'"></i>
            </span>
          </span>
        </button>

        <!-- Hamburger for mobile -->
        <button class="hamburger" :class="{ open: menuOpen }" @click="menuOpen = !menuOpen" aria-label="Toggle menu">
          <span /><span /><span />
        </button>
      </div>

    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
const isDark     = computed(() => themeStore.isDark())
const menuOpen   = ref(false)
const isScrolled = ref(false)

const NAV_LINKS = [
  { href: '#stack',      label: 'infrastructure' },
  { href: '#projects',   label: 'system'         },
  { href: '#metrics',    label: 'metrics'        },
  { href: '#certs',      label: 'credentials'    },
  { href: '#contact',    label: 'connect'        },
]

function handleScroll() { isScrolled.value = window.scrollY > 20 }

onMounted(()  => window.addEventListener('scroll', handleScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', handleScroll))
</script>

<style scoped>
.navbar {
  position: fixed;
  inset: 0 0 auto 0;
  height: var(--nav-height);
  z-index: 1000;
  backdrop-filter: blur(18px) saturate(1.5);
  -webkit-backdrop-filter: blur(18px) saturate(1.5);
  background: var(--bg-glass);
  border-bottom: 1px solid var(--border-color);
  transition: var(--transition);
}
.navbar.scrolled { box-shadow: 0 2px 24px rgba(0,0,0,0.25); }

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

/* Brand */
.nav-brand {
  font-family: var(--font-mono);
  font-size: 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  white-space: nowrap;
  transition: opacity 0.2s;
}
.nav-brand:hover { opacity: 0.75; }
.bracket { color: var(--text-muted); }
.accent  { color: var(--accent-green); }
.cursor  { color: var(--accent-green); animation: blink 1.1s step-end infinite; margin-left: 2px; }

/* Nav links */
.nav-links {
  display: flex;
  gap: 4px;
}
.nav-link {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--text-secondary);
  padding: 6px 12px;
  border-radius: var(--radius-xs);
  transition: var(--transition);
}
.link-prefix { color: var(--accent-green); }
.nav-link:hover { color: var(--text-primary); background: rgba(16,185,129,0.08); }

/* Right cluster */
.nav-right { display: flex; align-items: center; gap: 12px; }

/* Theme toggle */
.theme-toggle { display: flex; align-items: center; padding: 2px; }
.track {
  width: 52px; height: 28px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 999px;
  padding: 3px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: var(--transition);
}
.thumb {
  width: 22px; height: 22px;
  background: var(--accent-green);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
  color: #fff;
  font-size: 11px;
}
.thumb.light { transform: translateX(24px); }

/* Hamburger */
.hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  padding: 4px;
}
.hamburger span {
  display: block;
  width: 22px; height: 2px;
  background: var(--text-primary);
  border-radius: 2px;
  transition: var(--transition);
}
.hamburger.open span:nth-child(1) { transform: rotate(45deg) translate(5px,5px); }
.hamburger.open span:nth-child(2) { opacity: 0; }
.hamburger.open span:nth-child(3) { transform: rotate(-45deg) translate(5px,-5px); }

/* ─── Mobile ─── */
@media (max-width: 860px) {
  .nav-links { display: none; }
  .hamburger { display: flex; }

  .nav-links.open {
    display: flex;
    flex-direction: column;
    position: fixed;
    top: var(--nav-height);
    left: 0; right: 0;
    background: var(--bg-card);
    border-bottom: 1px solid var(--border-color);
    padding: 16px;
    gap: 4px;
    z-index: 999;
    backdrop-filter: blur(20px);
  }
  .nav-links.open .nav-link { padding: 12px 16px; width: 100%; }
}
</style>
