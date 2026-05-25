<template>
  <!-- Low-opacity server-log stream fixed to viewport right edge -->
  <div class="log-stream" aria-hidden="true">
    <div class="log-inner">{{ repeatedLogs }}</div>
  </div>
</template>

<script setup>
const LOG_LINES = [
  '[INFO]  GET /api/v1/health                  200   2ms',
  '[INFO]  POST /api/v1/auth/login             200  14ms',
  '[DEBUG] Redis CACHE HIT  user:session:42',
  '[INFO]  GET /api/v1/placements              200   8ms',
  '[DEBUG] Celery task queued: generate_report',
  '[INFO]  PUT /api/v1/jobs/83/apply           201  21ms',
  '[INFO]  JWT verified — role: STUDENT',
  '[DEBUG] DB query: SELECT slots WHERE available=1',
  '[INFO]  GET /api/v1/slots/availability      200   5ms',
  '[DEBUG] Redis SET slots:cache:floor2 TTL=300',
  '[WARN]  Rate limit 80% — IP: 10.0.0.1',
  '[INFO]  POST /api/v1/booking                201  33ms',
  '[INFO]  Celery: generate_report COMPLETED',
  '[DEBUG] Connection pool: 4/10 active',
  '[INFO]  GET /api/v1/movies/seats            200   7ms',
  '[INFO]  Spring Boot started — port 8080',
  '[DEBUG] HikariCP: acquired from pool',
  '[INFO]  @Transactional seat lock — show:12',
  '[INFO]  Rollback triggered — seat booked',
  '[DEBUG] Cache miss: movies:popular — DB fetch',
  '[INFO]  AWS S3 upload OK: report_2025.pdf',
  '[INFO]  Docker container healthy — restart:0',
  '[DEBUG] ORM UPDATE users SET last_login=NOW()',
  '[INFO]  GATE CS 2026 — Qualified ✓',
  '[DEBUG] PostgreSQL index scan placements.cid',
  '[INFO]  Worker celery@node01 ready',
  '[DEBUG] JWT expiry in 3547s — refresh issued',
  '[INFO]  Redis FLUSHDB — cache cleared on deploy',
]

// Repeat enough for a seamless CSS loop (halved via animation)
const repeatedLogs = [...LOG_LINES, ...LOG_LINES, ...LOG_LINES, ...LOG_LINES].join('\n')
</script>

<style scoped>
.log-stream {
  position: fixed;
  top: 0;
  right: 0;
  width: 280px;
  height: 100vh;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
  opacity: 0.032;
}

[data-theme="light"] .log-stream { opacity: 0.04; }

.log-inner {
  font-family: var(--font-mono);
  font-size: 9.5px;
  color: var(--accent-green);
  line-height: 1.75;
  padding: 12px 10px;
  white-space: pre;
  animation: logScroll 40s linear infinite;
}
</style>
