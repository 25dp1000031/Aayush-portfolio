/* =====================================================================
   AAYUSH KUKADE PORTFOLIO — main.js
   Sections:
     1. Theme Toggle
     2. Navbar scroll behaviour + hamburger
     3. Background log stream generator
     4. Terminal typewriter effect
     5. Pipeline nodes injector
     6. Intersection Observer (AOS-style reveals)
     7. Counter animation
     8. Contact form handler
   ===================================================================== */

/* ─── 1. Theme Toggle ───────────────────────────────────────────────── */
const html         = document.documentElement;
const themeToggle  = document.getElementById('themeToggle');
const STORAGE_KEY  = 'ak-portfolio-theme';

function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem(STORAGE_KEY, theme);
}

// Load saved preference or system preference
const savedTheme = localStorage.getItem(STORAGE_KEY);
if (savedTheme) {
  applyTheme(savedTheme);
} else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
  applyTheme('light');
}

themeToggle.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});


/* ─── 2. Navbar scroll + hamburger ─────────────────────────────────── */
const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
});

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

// Close mobile menu when a nav link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});


/* ─── 3. Background log stream ──────────────────────────────────────── */
const LOG_LINES = [
  '[INFO]  GET /api/v1/health                200  2ms',
  '[INFO]  POST /api/v1/auth/login           200  14ms',
  '[DEBUG] Redis CACHE HIT: user:session:42',
  '[INFO]  GET /api/v1/placements            200  8ms',
  '[DEBUG] Celery task queued: generate_report',
  '[INFO]  PUT /api/v1/jobs/83/apply         201  21ms',
  '[INFO]  JWT verified — role: STUDENT',
  '[DEBUG] DB query: SELECT * FROM slots WHERE available=1',
  '[INFO]  GET /api/v1/slots/availability    200  5ms',
  '[DEBUG] Redis SET: slots:cache:floor2 TTL=300',
  '[WARN]  Rate limit 80% reached — IP: 10.0.0.1',
  '[INFO]  POST /api/v1/booking              201  33ms',
  '[INFO]  Celery: task generate_report COMPLETED',
  '[DEBUG] Connection pool: 4/10 active',
  '[INFO]  GET /api/v1/movies/seats          200  7ms',
  '[INFO]  Spring Boot application started — port 8080',
  '[DEBUG] HikariCP: acquired connection from pool',
  '[INFO]  @Transactional: seat lock acquired for show:12',
  '[INFO]  Rollback triggered — seat already booked',
  '[DEBUG] Cache miss: movies:popular — fetching DB',
  '[INFO]  AWS S3 upload success: report_2025.pdf',
  '[INFO]  Docker container healthy — restart: 0',
  '[DEBUG] ORM: UPDATE users SET last_login=NOW() WHERE id=7',
  '[INFO]  GATE CS 2026 — Qualified ✓',
  '[DEBUG] PostgreSQL: index scan on placements.company_id',
  '[INFO]  Worker celery@node01 ready',
  '[INFO]  Redis FLUSHDB — cache cleared on deploy',
  '[DEBUG] JWT expiry in 3547s — issuing refresh',
];

const logStream = document.getElementById('logStream');

function buildLogContent() {
  // Repeat lines to fill ~200 lines for seamless scroll loop
  const doubled = [...LOG_LINES, ...LOG_LINES, ...LOG_LINES, ...LOG_LINES];
  return doubled.map(l => l).join('\n');
}

if (logStream) {
  logStream.textContent = buildLogContent();
}


/* ─── 4. Terminal typewriter ────────────────────────────────────────── */
const TERMINAL_JSON = {
  name: 'Aayush Kukade',
  role: 'Backend Engineer',
  stack: ['Java', 'Spring Boot', 'Python', 'Flask'],
  infra: ['Docker', 'AWS EC2', 'Redis', 'Celery'],
  database: 'PostgreSQL',
  auth: 'JWT + RBAC',
  status: 'available',
  gate_cs: true,
  education: ['IIT Madras Diploma', 'MCA SGBAU'],
};

function syntaxHighlight(obj) {
  const json = JSON.stringify(obj, null, 2);
  return json
    .replace(/("[\w]+")\s*:/g,     '<span class="key">$1</span>:')
    .replace(/:\s*(".*?")/g,       ': <span class="str">$1</span>')
    .replace(/:\s*(\d+)/g,         ': <span class="num">$1</span>')
    .replace(/:\s*(true|false)/g,  ': <span class="bool">$1</span>')
    .replace(/[{}[\],]/g,          '<span class="punct">$&</span>');
}

function typeWriter(element, html, speed = 18) {
  // Strip tags first to get character count, then reveal raw HTML char by char
  // Simpler approach: append plain chars from JSON string, then swap with highlighted
  const plainText = JSON.stringify(TERMINAL_JSON, null, 2);
  let i = 0;
  element.innerHTML = '';

  function tick() {
    if (i < plainText.length) {
      i++;
      // Show plain text while typing, swap to highlighted at the end
      element.textContent = plainText.slice(0, i);
      setTimeout(tick, speed);
    } else {
      // Finished — apply syntax highlighting
      element.innerHTML = syntaxHighlight(TERMINAL_JSON);
    }
  }
  tick();
}

const terminalOutput = document.getElementById('terminalOutput');
if (terminalOutput) {
  // Start typing after a short delay so hero animation leads
  setTimeout(() => typeWriter(terminalOutput), 800);
}


/* ─── 5. Pipeline nodes ─────────────────────────────────────────────── */
const PIPELINE_NODES = [
  { label: 'Client',       tip: 'Vue.js / Browser request' },
  { label: 'API Gateway',  tip: 'Flask / Spring MVC route layer' },
  { label: 'JWT Auth',     tip: 'Token validation + RBAC check' },
  { label: 'Redis Cache',  tip: 'Cache hit? Return early.' },
  { label: 'Celery Queue', tip: 'Async task offload' },
  { label: 'PostgreSQL',   tip: 'Persistent data store' },
];

const pipelineNodes = document.getElementById('pipelineNodes');

if (pipelineNodes) {
  PIPELINE_NODES.forEach((node, i) => {
    // Node element
    const nodeEl = document.createElement('div');
    nodeEl.className = 'p-node';
    nodeEl.setAttribute('data-tip', node.tip);
    nodeEl.innerHTML = `
      <div class="p-node-box">${node.label}</div>
      <div class="p-node-dot"></div>
    `;
    pipelineNodes.appendChild(nodeEl);

    // Arrow between nodes (not after last)
    if (i < PIPELINE_NODES.length - 1) {
      const arrow = document.createElement('span');
      arrow.className = 'p-arrow';
      arrow.textContent = '→';
      pipelineNodes.appendChild(arrow);
    }
  });
}


/* ─── 6. Intersection Observer (AOS-style) ──────────────────────────── */
const aosElements = document.querySelectorAll('[data-aos]');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = parseInt(entry.target.dataset.aosDelay || 0, 10);
      setTimeout(() => {
        entry.target.classList.add('aos-animate');
      }, delay);
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px',
});

aosElements.forEach(el => observer.observe(el));


/* ─── 7. Counter animation ──────────────────────────────────────────── */
const counters = document.querySelectorAll('.counter');

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el     = entry.target;
    const target = parseInt(el.dataset.target, 10);
    const duration = 1400; // ms
    const step   = Math.ceil(target / (duration / 16));
    let current  = 0;

    const tick = () => {
      current = Math.min(current + step, target);
      el.textContent = current;
      if (current < target) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.5 });

counters.forEach(c => counterObserver.observe(c));


/* ─── 8. Contact form handler ───────────────────────────────────────── */
const contactForm = document.getElementById('contactForm');
const formNote    = document.getElementById('formNote');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

    try {
      const res = await fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        formNote.textContent = '✓ Message received. I\'ll respond within 24h.';
        formNote.style.color = 'var(--accent-green)';
        contactForm.reset();
      } else {
        formNote.textContent = '✗ Something went wrong. Email me directly.';
        formNote.style.color = 'var(--accent-red)';
      }
    } catch {
      formNote.textContent = '✗ Network error. Try emailing directly.';
      formNote.style.color = 'var(--accent-red)';
    }

    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
  });
}
