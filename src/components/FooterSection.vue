<template>
  <footer class="footer">
    <div class="container footer-inner">
      <div class="footer-brand">
        <span class="bracket">[</span>aayush<span class="accent">.dev</span><span class="bracket">]</span>
      </div>
      <p class="footer-copy">
        &copy; {{ year }} Aayush Kukade · Built with Vue 3, Pinia &amp; clean architecture
      </p>
      <div class="footer-links">
        <a href="./resume/Aayush_resume_12_04_2026.pdf" target="_blank" rel="noopener">Resume</a>
        <a href="https://github.com/its-tsukii" target="_blank" rel="noopener">GitHub</a>
        <a href="#hero">
          Back to top <i class="fas fa-arrow-up"></i>
        </a>
      </div>
    </div>
  </footer>
</template>

<script setup>
const year = new Date().getFullYear()
</script>

<style scoped>
.footer {
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  padding: 36px 0;
  position: relative;
  z-index: 1;
}

.footer-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.footer-brand {
  font-family: var(--font-mono);
  font-size: 0.9rem;
  font-weight: 500;
}
.bracket { color: var(--text-muted); }
.accent  { color: var(--accent-green); }

.footer-copy { font-size: 0.78rem; color: var(--text-muted); }

.footer-links { display: flex; gap: 20px; }
.footer-links a {
  font-size: 0.78rem;
  font-family: var(--font-mono);
  color: var(--text-secondary);
  transition: var(--transition);
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.footer-links a:hover { color: var(--accent-green); }

@media (max-width: 580px) {
  .footer-inner { flex-direction: column; text-align: center; }
  .footer-links { justify-content: center; }
}
</style>
