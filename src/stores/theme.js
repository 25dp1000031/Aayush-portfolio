// ── Pinia store: theme (dark / light) ──────────────────────────────────
import { defineStore } from 'pinia'
import { ref, watch }  from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const STORAGE_KEY = 'ak-portfolio-theme'

  // Resolve initial theme: saved preference → system preference → dark
  function resolveInitial() {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return saved
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  }

  const theme = ref(resolveInitial())

  // Apply token attribute to <html> whenever theme changes
  function applyToDOM(t) {
    document.documentElement.setAttribute('data-theme', t)
  }

  // Initialize on store creation
  applyToDOM(theme.value)

  // Keep DOM + localStorage in sync
  watch(theme, t => {
    applyToDOM(t)
    localStorage.setItem(STORAGE_KEY, t)
  })

  function toggle() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  const isDark = () => theme.value === 'dark'

  return { theme, toggle, isDark }
})
