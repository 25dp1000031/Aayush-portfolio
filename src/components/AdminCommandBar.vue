<template>
  <!--
    AdminCommandBar — floating bottom bar visible only to authenticated admin.
    Shows edit state, dirty indicator, and the "Commit to Database" button.
    Slides in from the bottom via Vue Transition.
  -->
  <Teleport to="body">
    <Transition name="bar-rise">
      <div v-if="isAdmin" class="admin-bar">

        <!-- Left: status indicator -->
        <div class="bar-left">
          <span class="bar-pulse"></span>
          <span class="bar-label">Admin — Live Editor</span>
          <span v-if="isDirty" class="bar-dirty">
            <i class="fas fa-circle" style="font-size:0.45rem"></i> Unsaved changes
          </span>
          <Transition name="fade">
            <span v-if="commitMsg" class="bar-commit-msg" :class="commitOk ? 'ok' : 'err'">
              {{ commitMsg }}
            </span>
          </Transition>
        </div>

        <!-- Right: actions -->
        <div class="bar-right">
          <span class="bar-shortcut">Ctrl+Shift+A — re-auth</span>

          <button class="btn-discard" :disabled="!isDirty" @click="handleDiscard">
            <i class="fas fa-undo"></i> Discard
          </button>

          <button
            class="btn-commit"
            :disabled="!isDirty || committing"
            @click="handleCommit"
          >
            <i :class="committing ? 'fas fa-spinner fa-spin' : 'fas fa-cloud-upload-alt'"></i>
            {{ committing ? 'Committing...' : 'Commit Changes to Production' }}
          </button>

          <button class="btn-signout" title="Sign out" @click="handleSignOut">
            <i class="fas fa-sign-out-alt"></i>
          </button>
        </div>

      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref }             from 'vue'
import { storeToRefs }     from 'pinia'
import { useAuthStore }    from '@/stores/auth'
import { usePortfolioStore } from '@/stores/portfolio'

const authStore      = useAuthStore()
const portfolioStore = usePortfolioStore()

const { isAdmin }  = storeToRefs(authStore)
const { isDirty }  = storeToRefs(portfolioStore)

const committing  = ref(false)
const commitMsg   = ref('')
const commitOk    = ref(true)

async function handleCommit() {
  committing.value = true
  const result = await portfolioStore.commitToDatabase()
  committing.value = false
  commitOk.value  = result.ok
  commitMsg.value = result.ok ? '✓ Committed to Supabase' : `✗ ${result.msg}`
  setTimeout(() => { commitMsg.value = '' }, 4000)
}

async function handleDiscard() {
  if (!confirm('Discard all unsaved changes and re-fetch from database?')) return
  await portfolioStore.bootstrap()
}

async function handleSignOut() {
  await authStore.signOut()
}
</script>

<style scoped>
.admin-bar {
  position        : fixed;
  bottom          : 0; left: 0; right: 0;
  z-index         : 9999;
  background      : rgba(7,11,19,0.96);
  border-top      : 1px solid rgba(16,185,129,0.28);
  backdrop-filter : blur(14px);
  padding         : 11px 24px;
  display         : flex;
  align-items     : center;
  justify-content : space-between;
  gap             : 16px;
  flex-wrap       : wrap;
  box-shadow      : 0 -6px 30px rgba(0,0,0,0.45);
}

/* Left */
.bar-left {
  display     : flex;
  align-items : center;
  gap         : 10px;
  font-family : var(--font-mono);
  font-size   : 0.74rem;
}
.bar-pulse {
  width         : 7px; height: 7px;
  background    : var(--accent-green);
  border-radius : 50%;
  animation     : pulse-dot 2s infinite;
  flex-shrink   : 0;
}
.bar-label { color: var(--text-secondary); }
.bar-dirty { color: var(--accent-amber); display:flex; align-items:center; gap:5px; }

.bar-commit-msg {
  font-size    : 0.7rem;
  padding      : 2px 8px;
  border-radius: 4px;
}
.bar-commit-msg.ok  { color: var(--accent-green); background: rgba(16,185,129,0.1); }
.bar-commit-msg.err { color: var(--accent-red);   background: rgba(239,68,68,0.1);  }

/* Right */
.bar-right {
  display     : flex;
  align-items : center;
  gap         : 10px;
  flex-wrap   : wrap;
}
.bar-shortcut {
  font-family   : var(--font-mono);
  font-size     : 0.63rem;
  color         : var(--text-muted);
  padding-right : 10px;
  border-right  : 1px solid rgba(48,54,61,0.9);
}

/* Buttons */
.btn-discard, .btn-commit, .btn-signout {
  display       : flex;
  align-items   : center;
  gap           : 6px;
  font-family   : var(--font-mono);
  font-size     : 0.72rem;
  padding       : 6px 14px;
  border-radius : 6px;
  cursor        : pointer;
  transition    : all 0.2s;
}
.btn-discard {
  color  : var(--text-secondary);
  border : 1px solid rgba(148,163,184,0.2);
}
.btn-discard:hover:not(:disabled) { border-color: rgba(148,163,184,0.4); color:var(--text-primary); }
.btn-discard:disabled { opacity:0.4; cursor:not-allowed; }

.btn-commit {
  background  : var(--accent-green);
  color       : #000;
  font-weight : 600;
  border      : 1px solid transparent;
}
.btn-commit:hover:not(:disabled) { background: #0ea572; }
.btn-commit:disabled { opacity: 0.45; cursor: not-allowed; }

.btn-signout {
  color  : var(--text-muted);
  border : 1px solid rgba(48,54,61,0.6);
  padding: 6px 10px;
}
.btn-signout:hover { color: var(--accent-red); border-color: rgba(239,68,68,0.3); }

/* Transitions */
.bar-rise-enter-active { transition: transform 0.32s cubic-bezier(0.22,1,0.36,1), opacity 0.25s ease; }
.bar-rise-leave-active { transition: transform 0.22s ease, opacity 0.2s ease; }
.bar-rise-enter-from, .bar-rise-leave-to { transform: translateY(100%); opacity: 0; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from,   .fade-leave-to     { opacity: 0; }
</style>
