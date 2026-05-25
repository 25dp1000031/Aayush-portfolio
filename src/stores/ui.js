// ── UI Store — transient interface state ───────────────────────────────
// Controls overlay / modal visibility and system log stream without
// prop-drilling. Log entries are ephemeral — they live only in memory.
import { defineStore } from 'pinia'
import { ref }         from 'vue'

export const useUIStore = defineStore('ui', () => {

  // ── Admin modal ───────────────────────────────────────────────────
  const showAdminModal = ref(false)

  function openAdminModal()   { showAdminModal.value = true  }
  function closeAdminModal()  { showAdminModal.value = false }
  function toggleAdminModal() { showAdminModal.value = !showAdminModal.value }

  // ── System log stream (IDE terminal pane) ─────────────────────────
  // Each entry: { id, level: 'info'|'warn'|'error'|'ok', msg, ts }
  const systemLogs = ref([])
  const MAX_LOGS   = 120

  function pushLog(level = 'info', msg = '') {
    const ts = new Date().toLocaleTimeString('en-GB', { hour12: false })
    systemLogs.value.unshift({ id: Date.now(), level, msg, ts })
    if (systemLogs.value.length > MAX_LOGS) {
      systemLogs.value = systemLogs.value.slice(0, MAX_LOGS)
    }
  }

  function clearLogs() { systemLogs.value = [] }

  // Seed initial boot lines so the pane isn't empty on first paint
  pushLog('ok',   'portfolio.runtime  ready')
  pushLog('info', 'store.bootstrap()  queued')
  pushLog('info', 'supabase.client    init')

  return {
    // admin modal
    showAdminModal,
    openAdminModal,
    closeAdminModal,
    toggleAdminModal,

    // system logs
    systemLogs,
    pushLog,
    clearLogs,
  }
})
