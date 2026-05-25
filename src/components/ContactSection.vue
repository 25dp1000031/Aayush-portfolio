<template>
  <section class="section contact-section" id="contact">
    <div class="container">
      <div class="section-header reveal">
        <span class="section-label">// socket.connect()</span>
        <h2 class="section-title">Establish Handshake</h2>
        <p class="section-sub">Open to backend roles, collaborations, and interesting problems</p>
      </div>

      <div class="contact-grid">

        <!-- ── Contact form ── -->
        <div class="form-wrap reveal from-left">
          <form @submit.prevent="submitHandshake" class="contact-form" novalidate>

            <div class="form-group">
              <label for="c-name">Name</label>
              <input id="c-name" v-model.trim="form.name"    type="text"  placeholder="Your name"          required autocomplete="name" />
            </div>
            <div class="form-group">
              <label for="c-email">Email</label>
              <input id="c-email" v-model.trim="form.email"  type="email" placeholder="your@email.com"     required autocomplete="email" />
            </div>
            <div class="form-group">
              <label for="c-subject">Subject</label>
              <input id="c-subject" v-model.trim="form.subject" type="text" placeholder="What's this about?" required />
            </div>
            <div class="form-group">
              <label for="c-message">Message</label>
              <textarea id="c-message" v-model.trim="form.message" rows="5" placeholder="Your message..." required></textarea>
            </div>

            <button type="submit" class="btn btn-primary btn-full" :disabled="submitting">
              <i :class="submitting ? 'fas fa-spinner fa-spin' : 'fas fa-terminal'"></i>
              {{ submitting ? 'Routing message...' : 'submitHandshake()' }}
            </button>

            <Transition name="fade">
              <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
            </Transition>
          </form>
        </div>

        <!-- ── Social links + avatar ── -->
        <div class="contact-info reveal from-right">
          <div class="contact-card">
            <div class="avatar-wrap">
              <img src="/profilePic/profilePic.jpg" alt="Aayush Kukade" loading="lazy" />
            </div>
            <h3>Aayush Kukade</h3>
            <p>Backend Engineer · MCA · GATE CS '26</p>
          </div>

          <div class="social-list">
            <a v-for="s in SOCIALS" :key="s.label" :href="s.href" target="_blank" rel="noopener" class="social-row">
              <i :class="s.icon" class="s-icon"></i>
              <div>
                <strong>{{ s.label }}</strong>
                <span>{{ s.handle }}</span>
              </div>
              <i class="fas fa-chevron-right s-arrow"></i>
            </a>
          </div>
        </div>

      </div>
    </div>

    <!-- ── Success terminal overlay (Teleport to <body>) ── -->
    <Teleport to="body">
      <Transition name="overlay-fade">
        <div v-if="showOverlay" class="success-overlay" @click.self="closeOverlay">
          <div class="term-modal">

            <div class="term-modal-bar">
              <span class="t-dot red" />
              <span class="t-dot yellow" />
              <span class="t-dot green" />
              <span class="t-modal-title">aayush@backend-engine:~$ handshake</span>
            </div>

            <div class="term-modal-body">
              <div
                v-for="(line, i) in visibleLines"
                :key="i"
                class="term-modal-line"
                :class="lineClass(line)"
              >{{ line }}</div>

              <span v-if="!typingDone" class="t-blink">▌</span>

              <Transition name="fade">
                <div v-if="typingDone" class="term-modal-actions">
                  <button class="term-close-btn" @click="closeOverlay">
                    <i class="fas fa-times-circle"></i>
                    close connection
                  </button>
                </div>
              </Transition>
            </div>

          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { supabase }      from '@/services/supabase'

// ── EmailJS — fallback when Supabase is not configured ──────────────────
// Set VITE_EMAILJS_SERVICE_ID / VITE_EMAILJS_TEMPLATE_ID / VITE_EMAILJS_PUBLIC_KEY in .env.local
// Template must expose: {{from_name}}, {{from_email}}, {{subject}}, {{message}}, {{to_name}}
import emailjs from '@emailjs/browser'
const EMAILJS_SID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const EMAILJS_TID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const EMAILJS_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

// ── Reactive form state ─────────────────────────────────────────────────
const form = reactive({ name: '', email: '', subject: '', message: '' })

const submitting   = ref(false)
const errorMsg     = ref('')
const showOverlay  = ref(false)
const visibleLines = ref([])
const typingDone   = ref(false)

// ── Terminal log lines typed one-by-one after successful send ───────────
const SUCCESS_LINES = (name, via) => [
  `$ POST /api/contact  →  connecting...`,
  `[SYN]     TCP 3-way handshake initiated`,
  `[SYN-ACK] TLS 1.3 established — encryption active`,
  `[ACK]     Message payload validated`,
  `[INFO]    from_name:  "${name}"`,
  `[INFO]    transport:  ${via}`,
  `[202]     Processing transaction queue...`,
  `[200 OK]  Status: Handshake Established ✓`,
  `[INFO]    Message routed successfully`,
  `[INFO]    Response window: < 24 hours`,
  `$ _`,
]

// ── submitHandshake — primary: Supabase, fallback: EmailJS ─────────────
async function submitHandshake() {
  if (submitting.value) return
  errorMsg.value   = ''
  submitting.value = true
  const senderName = form.name || 'User'

  try {
    if (supabase) {
      // ── Write directly to Supabase contact_messages table ──────────
      // Required table (run once in Supabase SQL editor):
      //
      //   CREATE TABLE contact_messages (
      //     id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      //     from_name  text NOT NULL,
      //     from_email text NOT NULL,
      //     subject    text,
      //     message    text NOT NULL,
      //     created_at timestamptz DEFAULT now()
      //   );
      //
      // Optional: pair with the Edge Function in
      //   supabase/functions/contact-handler/index.ts
      // to also fire an email notification on insert.
      const { error } = await supabase
        .from('contact_messages')
        .insert({
          from_name:  form.name,
          from_email: form.email,
          subject:    form.subject,
          message:    form.message,
        })
      if (error) throw error
      await showTerminalOverlay(senderName, 'supabase · contact_messages')

    } else if (EMAILJS_SID && EMAILJS_TID && EMAILJS_KEY) {
      // ── Fallback: EmailJS ────────────────────────────────────────────
      await emailjs.send(
        EMAILJS_SID, EMAILJS_TID,
        { from_name: form.name, from_email: form.email, subject: form.subject, message: form.message, to_name: 'Aayush' },
        { publicKey: EMAILJS_KEY },
      )
      await showTerminalOverlay(senderName, 'emailjs.send()')

    } else {
      throw new Error('No messaging backend configured. Add VITE_SUPABASE_URL or VITE_EMAILJS_* to .env.local')
    }

    Object.assign(form, { name: '', email: '', subject: '', message: '' })

  } catch (err) {
    errorMsg.value = `✗ Error ${err?.status ?? 'unknown'}: ${err?.text ?? err?.message ?? 'Failed to send — please email me directly.'}`
  } finally {
    submitting.value = false
  }
}

// Types terminal lines with staggered delays for live-log aesthetic
async function showTerminalOverlay(senderName, transport) {
  visibleLines.value = []
  typingDone.value   = false
  showOverlay.value  = true
  const lines = SUCCESS_LINES(senderName, transport)
  for (let i = 0; i < lines.length; i++) {
    await delay(i === 0 ? 180 : 270)
    visibleLines.value.push(lines[i])
  }
  await delay(400)
  typingDone.value = true
}

function closeOverlay() {
  showOverlay.value  = false
  visibleLines.value = []
  typingDone.value   = false
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)) }

// Colour-code terminal lines by prefix
function lineClass(line) {
  if (line.startsWith('[200'))   return 'line-ok'
  if (line.startsWith('[202'))   return 'line-proc'
  if (line.startsWith('[SYN'))   return 'line-syn'
  if (line.startsWith('[ACK'))   return 'line-ack'
  if (line.startsWith('[INFO]')) return 'line-info'
  if (line.startsWith('$'))      return 'line-prompt'
  return ''
}

const SOCIALS = [
  { icon: 'fab fa-github',   label: 'GitHub',   handle: 'its-tsukii',           href: 'https://github.com/its-tsukii' },
  { icon: 'fab fa-linkedin', label: 'LinkedIn', handle: 'aayush-kukade',         href: 'https://www.linkedin.com/in/aayush-kukade' },
  { icon: 'fab fa-medium',   label: 'Medium',   handle: '@sroy10012001',          href: 'https://medium.com/@sroy10012001' },
  { icon: 'fas fa-envelope', label: 'Email',    handle: 'Drop a direct message', href: 'mailto:aayushkukade@example.com' },
]
</script>

<style scoped>
.contact-section { background: var(--bg-primary); }
.section-header  { margin-bottom: 56px; }

.contact-grid {
  display               : grid;
  grid-template-columns : 1fr 1fr;
  gap                   : 48px;
  align-items           : start;
}

/* Form */
.form-wrap {
  background    : var(--bg-card);
  border        : 1px solid var(--border-color);
  border-radius : var(--radius-lg);
  padding       : 40px;
}
.form-group { margin-bottom: 20px; }
.form-group label {
  display     : block;
  font-family : var(--font-mono);
  font-size   : 0.78rem;
  color       : var(--text-secondary);
  margin-bottom: 8px;
}
.form-group input,
.form-group textarea {
  width         : 100%;
  background    : var(--bg-secondary);
  border        : 1px solid var(--border-color);
  border-radius : var(--radius-sm);
  padding       : 10px 14px;
  color         : var(--text-primary);
  font-size     : 0.875rem;
  transition    : var(--transition);
  resize        : none;
}
.form-group input:focus,
.form-group textarea:focus {
  outline      : none;
  border-color : var(--accent-green);
  box-shadow   : 0 0 0 3px rgba(16,185,129,0.1);
}
.error-msg { font-family:var(--font-mono); font-size:0.78rem; color:var(--accent-red); margin-top:12px; }

/* Contact info */
.contact-info { display:flex; flex-direction:column; gap:16px; }
.contact-card {
  background: var(--bg-card); border:1px solid var(--border-color);
  border-radius:var(--radius-lg); padding:28px; text-align:center;
}
.avatar-wrap {
  width:88px; height:88px; border-radius:50%; overflow:hidden;
  margin:0 auto 14px; border:3px solid var(--accent-green);
  box-shadow:0 0 20px rgba(16,185,129,0.2);
}
.avatar-wrap img { width:100%; height:100%; object-fit:cover; }
.contact-card h3 { font-size:1.05rem; font-weight:600; margin-bottom:4px; }
.contact-card p  { font-size:0.78rem; color:var(--text-secondary); font-family:var(--font-mono); }

.social-list { display:flex; flex-direction:column; gap:10px; }
.social-row {
  display:flex; align-items:center; gap:14px; padding:14px 18px;
  background:var(--bg-card); border:1px solid var(--border-color);
  border-radius:var(--radius-md); transition:var(--transition);
}
.social-row:hover { border-color:var(--border-glow); transform:translateX(4px); background:var(--bg-card-hover); }
.s-icon  { font-size:1.05rem; color:var(--accent-green); width:20px; flex-shrink:0; }
.social-row div  { flex:1; }
.social-row strong { display:block; font-size:0.875rem; }
.social-row span   { font-family:var(--font-mono); font-size:0.72rem; color:var(--text-secondary); }
.s-arrow { color:var(--text-muted); font-size:0.72rem; }

.fade-enter-active, .fade-leave-active { transition:opacity 0.3s ease; }
.fade-enter-from,   .fade-leave-to     { opacity:0; }

/* ── Success overlay ── */
.success-overlay {
  position:fixed; inset:0; z-index:9999;
  background:rgba(7,11,19,0.88); backdrop-filter:blur(8px);
  display:flex; align-items:center; justify-content:center; padding:24px;
}
.overlay-fade-enter-active, .overlay-fade-leave-active { transition:opacity 0.3s ease; }
.overlay-fade-enter-from,   .overlay-fade-leave-to     { opacity:0; }

.term-modal {
  background:var(--bg-code); border:1px solid var(--border-glow);
  border-radius:var(--radius-md); width:100%; max-width:560px;
  box-shadow:0 0 60px rgba(16,185,129,0.15),0 20px 60px rgba(0,0,0,0.6);
  overflow:hidden; animation:slideUp 0.3s ease;
}
.term-modal-bar {
  display:flex; align-items:center; gap:7px; padding:10px 16px;
  background:rgba(255,255,255,0.03); border-bottom:1px solid rgba(48,54,61,0.6);
}
.t-dot { width:11px; height:11px; border-radius:50%; }
.t-dot.red    { background:#ff5f57; }
.t-dot.yellow { background:#febc2e; }
.t-dot.green  { background:#28c840; }
.t-modal-title { font-family:var(--font-mono); font-size:0.72rem; color:rgba(255,255,255,0.3); margin-left:8px; }
.term-modal-body {
  padding:20px 24px 24px; min-height:200px;
  display:flex; flex-direction:column; gap:4px;
}
.term-modal-line { font-family:var(--font-mono); font-size:0.8rem; line-height:1.6; animation:slideUp 0.2s ease; color:rgba(205,217,229,0.55); }
.line-prompt { color:rgba(205,217,229,0.8); }
.line-ok     { color:var(--accent-green); font-weight:600; }
.line-proc   { color:var(--accent-cyan); }
.line-syn    { color:var(--accent-blue); }
.line-ack    { color:var(--accent-cyan); }
.line-info   { color:rgba(205,217,229,0.55); }
.t-blink { color:var(--accent-green); animation:blink 1s step-end infinite; margin-top:4px; display:block; }
.term-modal-actions { margin-top:20px; display:flex; justify-content:flex-end; }
.term-close-btn {
  display:flex; align-items:center; gap:7px; font-family:var(--font-mono);
  font-size:0.78rem; color:var(--accent-green); border:1px solid rgba(16,185,129,0.3);
  padding:7px 16px; border-radius:var(--radius-xs); cursor:pointer; transition:var(--transition);
}
.term-close-btn:hover { background:rgba(16,185,129,0.08); }

@media (max-width: 860px) { .contact-grid { grid-template-columns:1fr; } }
</style>
