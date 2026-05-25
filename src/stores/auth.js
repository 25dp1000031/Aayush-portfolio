// ── Admin Authentication Store ─────────────────────────────────────────
// Triggers:
//   • Keyboard shortcut: Ctrl + Shift + A   (wired in App.vue)
//   • Triple-click on the hero status pill  (wired in HeroSection.vue → emits 'openAdmin')
//
// Uses supabase.auth.signInWithPassword() when Supabase is configured.
// Dev shortcut: email="admin" / password="admin" works locally without Supabase.
//
import { defineStore } from 'pinia'
import { ref }         from 'vue'
import { supabase }    from '@/services/supabase'

export const useAuthStore = defineStore('auth', () => {
  const isAdmin = ref(false)
  const loading = ref(false)
  const error   = ref('')

  async function signIn(email, password) {
    loading.value = true
    error.value   = ''

    // ── Dev mode (no Supabase) ─────────────────────────────────────
    if (!supabase) {
      if (email === 'admin' && password === 'admin') {
        isAdmin.value = true
        loading.value = false
        return true
      }
      error.value   = 'Supabase not configured — use admin / admin in dev mode'
      loading.value = false
      return false
    }

    // ── Production: Supabase auth ──────────────────────────────────
    try {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) throw err
      isAdmin.value = true
      return true
    } catch (e) {
      error.value = e.message
      return false
    } finally {
      loading.value = false
    }
  }

  async function signOut() {
    if (supabase) await supabase.auth.signOut()
    isAdmin.value = false
  }

  return { isAdmin, loading, error, signIn, signOut }
})
