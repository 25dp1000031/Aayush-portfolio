<template>
  <!--
    AdminModal — terminal-style authentication gate.

    Trigger A: Ctrl + Shift + A  (wired globally in App.vue)
    Trigger B: Triple-click on the hero status pill (HeroSection emits 'open-admin')

    Auth backend: supabase.auth.signInWithPassword()
    Dev shortcut: email=admin / password=admin (works without Supabase)
  -->
  <Teleport to="body">
    <Transition name="modal-overlay">
      <div
        v-if="uiStore.showAdminModal"
        class="admin-overlay"
        @click.self="uiStore.closeAdminModal()"
      >
        <Transition name="modal-slide" appear>
          <div class="admin-term" v-if="uiStore.showAdminModal">

            <!-- Terminal bar -->
            <div class="term-bar">
              <span class="td red"    @click="uiStore.closeAdminModal()" />
              <span class="td yellow" />
              <span class="td green"  />
              <span class="term-path">aayush@portfolio:~$ sudo admin-auth</span>
            </div>

            <!-- Terminal body -->
            <div class="term-body">
              <p class="t-line"><span class="t-prompt">$</span> Initiating privileged session...</p>
              <p class="t-line dim"><span class="t-prompt">$</span> Enter credentials to proceed</p>
              <div class="t-sep"></div>

              <form @submit.prevent="handleSubmit" novalidate>
                <div class="t-field">
                  <label class="t-label">// email or username</label>
                  <input
                    v-model="email"
                    type="text"
                    class="t-input"
                    placeholder="admin@example.com"
                    autocomplete="username"
                    autofocus
                  />
                </div>
                <div class="t-field">
                  <label class="t-label">// password</label>
                  <input
                    v-model="password"
                    type="password"
                    class="t-input"
                    placeholder="••••••••"
                    autocomplete="current-password"
                  />
                </div>

                <!-- Error feedback -->
                <Transition name="fade">
                  <p v-if="authStore.error" class="t-error">
                    <i class="fas fa-times-circle"></i>
                    {{ authStore.error }}
                  </p>
                </Transition>

                <!-- Dev hint -->
                <p class="t-hint">
                  <i class="fas fa-info-circle"></i>
                  Dev mode — use <code>admin / admin</code> when Supabase is not configured
                </p>

                <div class="t-actions">
                  <button type="button" class="t-cancel" @click="uiStore.closeAdminModal()">
                    cancel
                  </button>
                  <button type="submit" class="t-submit" :disabled="authStore.loading">
                    <i :class="authStore.loading ? 'fas fa-spinner fa-spin' : 'fas fa-key'"></i>
                    {{ authStore.loading ? 'authenticating...' : 'auth.connect()' }}
                  </button>
                </div>
              </form>
            </div>

          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref }          from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUIStore }   from '@/stores/ui'

const authStore = useAuthStore()
const uiStore   = useUIStore()

const email    = ref('')
const password = ref('')

async function handleSubmit() {
  const ok = await authStore.signIn(email.value, password.value)
  if (ok) {
    email.value    = ''
    password.value = ''
    uiStore.closeAdminModal()
  }
}
</script>

<style scoped>
/* ── Backdrop ──────────────────────────────────────────────────────── */
.admin-overlay {
  position      : fixed;
  inset         : 0;
  z-index       : 10000;
  background    : rgba(7, 11, 19, 0.9);
  backdrop-filter: blur(10px);
  display       : flex;
  align-items   : center;
  justify-content: center;
  padding       : 24px;
}

/* ── Window ────────────────────────────────────────────────────────── */
.admin-term {
  width      : 100%;
  max-width  : 480px;
  background : var(--bg-code);
  border     : 1px solid rgba(16, 185, 129, 0.3);
  border-radius: var(--radius-md);
  overflow   : hidden;
  box-shadow : 0 0 80px rgba(16,185,129,0.1), 0 28px 80px rgba(0,0,0,0.65);
}

/* ── Title bar ─────────────────────────────────────────────────────── */
.term-bar {
  display      : flex;
  align-items  : center;
  gap          : 7px;
  padding      : 10px 16px;
  background   : rgba(255,255,255,0.025);
  border-bottom: 1px solid rgba(48,54,61,0.7);
}
.td { width:11px; height:11px; border-radius:50%; cursor:pointer; transition:filter 0.15s; }
.td:hover { filter: brightness(1.2); }
.td.red    { background: #ff5f57; }
.td.yellow { background: #febc2e; }
.td.green  { background: #28c840; }
.term-path {
  font-family : var(--font-mono);
  font-size   : 0.7rem;
  color       : rgba(255,255,255,0.28);
  margin-left : 8px;
}

/* ── Body ──────────────────────────────────────────────────────────── */
.term-body { padding: 20px 24px 26px; }

.t-line {
  font-family  : var(--font-mono);
  font-size    : 0.77rem;
  color        : rgba(205,217,229,0.55);
  margin-bottom: 5px;
}
.t-line.dim { opacity: 0.6; }
.t-prompt { color: var(--accent-green); margin-right: 8px; }

.t-sep { height:1px; background: rgba(48,54,61,0.9); margin: 14px 0; }

/* Fields */
.t-field  { display:flex; flex-direction:column; gap:5px; margin-bottom:14px; }
.t-label  { font-family:var(--font-mono); font-size:0.67rem; color:var(--text-muted); }
.t-input  {
  width        : 100%;
  background   : rgba(255,255,255,0.04);
  border       : 1px solid rgba(48,54,61,0.9);
  border-radius: 6px;
  padding      : 9px 12px;
  color        : var(--text-primary);
  font-family  : var(--font-mono);
  font-size    : 0.82rem;
  outline      : none;
  transition   : border-color 0.2s, box-shadow 0.2s;
}
.t-input:focus {
  border-color: var(--accent-green);
  box-shadow  : 0 0 0 2px rgba(16,185,129,0.12);
}

/* Error */
.t-error {
  font-family  : var(--font-mono);
  font-size    : 0.73rem;
  color        : var(--accent-red);
  display      : flex;
  align-items  : center;
  gap          : 7px;
  margin-bottom: 12px;
}

/* Dev hint */
.t-hint {
  font-family  : var(--font-mono);
  font-size    : 0.65rem;
  color        : var(--text-muted);
  display      : flex;
  align-items  : center;
  gap          : 6px;
  margin-bottom: 18px;
}
.t-hint code {
  background    : rgba(255,255,255,0.06);
  padding       : 1px 5px;
  border-radius : 3px;
  color         : var(--accent-cyan);
}

/* Actions */
.t-actions { display:flex; justify-content:flex-end; gap:10px; }

.t-cancel {
  font-family   : var(--font-mono);
  font-size     : 0.75rem;
  color         : var(--text-muted);
  border        : 1px solid rgba(48,54,61,0.7);
  padding       : 7px 16px;
  border-radius : 6px;
  cursor        : pointer;
  transition    : all 0.2s;
}
.t-cancel:hover { color:var(--text-secondary); border-color: rgba(148,163,184,0.35); }

.t-submit {
  display        : flex;
  align-items    : center;
  gap            : 7px;
  font-family    : var(--font-mono);
  font-size      : 0.75rem;
  font-weight    : 600;
  background     : var(--accent-green);
  color          : #000;
  padding        : 7px 20px;
  border-radius  : 6px;
  cursor         : pointer;
  transition     : all 0.2s;
}
.t-submit:hover:not(:disabled) { background: #0ea572; }
.t-submit:disabled { opacity:0.55; cursor:not-allowed; }

/* ── Transitions ────────────────────────────────────────────────────── */
.modal-overlay-enter-active, .modal-overlay-leave-active { transition: opacity 0.25s ease; }
.modal-overlay-enter-from,   .modal-overlay-leave-to     { opacity: 0; }

.modal-slide-enter-active { transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.22,1,0.36,1); }
.modal-slide-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.modal-slide-enter-from   { opacity: 0; transform: scale(0.94) translateY(16px); }
.modal-slide-leave-to     { opacity: 0; transform: scale(0.97) translateY(8px); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from,   .fade-leave-to     { opacity: 0; }
</style>
