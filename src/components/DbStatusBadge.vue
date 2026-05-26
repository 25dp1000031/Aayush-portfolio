<template>
  <!--
    DbStatusBadge — terminal-styled telemetry pill reading portfolioStore.dbStatus.
    Renders one of:
      ● DB_STATUS: HYDRATED        (green)  → at least one Supabase source returned data
      ● DB_STATUS: LOCAL_FALLBACK  (amber)  → no Supabase, RLS block, or all empty
      ● DB_STATUS: PENDING…         (muted) → bootstrap in flight (initial paint)
  -->
  <span class="db-badge" :class="`db-badge--${dbStatus}`">
    <span class="db-dot"></span>
    <span class="db-label">DB_STATUS:</span>
    <span class="db-state">{{ stateLabel }}</span>
  </span>
</template>

<script setup>
import { computed }          from 'vue'
import { storeToRefs }       from 'pinia'
import { usePortfolioStore } from '@/stores/portfolio'

const { dbStatus } = storeToRefs(usePortfolioStore())

const stateLabel = computed(() => {
  switch (dbStatus.value) {
    case 'hydrated':       return 'HYDRATED'
    case 'local_fallback': return 'LOCAL_FALLBACK'
    case 'pending':
    default:               return 'PENDING…'
  }
})
</script>

<style scoped>
.db-badge {
  display       : inline-flex;
  align-items   : center;
  gap           : 7px;
  font-family   : var(--font-mono);
  font-size     : 0.68rem;
  letter-spacing: 0.06em;
  padding       : 4px 11px;
  border-radius : 999px;
  border        : 1px solid;
  background    : rgba(0,0,0,0.25);
  white-space   : nowrap;
  transition    : all 0.25s ease;
}

.db-label { color: var(--text-muted);  font-weight: 600; }
.db-state { font-weight: 700; }

.db-dot {
  width        : 7px;
  height       : 7px;
  border-radius: 50%;
  background   : currentColor;
  flex-shrink  : 0;
  animation    : db-pulse 2s ease-in-out infinite;
}

/* ── HYDRATED — green ─────────────────────────────────────── */
.db-badge--hydrated {
  color        : var(--accent-green);
  border-color : rgba(16,185,129,0.4);
  background   : rgba(16,185,129,0.08);
}
.db-badge--hydrated .db-state { color: var(--accent-green); }

/* ── LOCAL_FALLBACK — amber/red ───────────────────────────── */
.db-badge--local_fallback {
  color        : #f59e0b;
  border-color : rgba(245,158,11,0.45);
  background   : rgba(245,158,11,0.08);
}
.db-badge--local_fallback .db-state { color: #f59e0b; }

/* ── PENDING — muted ──────────────────────────────────────── */
.db-badge--pending {
  color        : var(--text-muted);
  border-color : var(--border-color);
  background   : rgba(255,255,255,0.02);
}
.db-badge--pending .db-state { color: var(--text-secondary); }
.db-badge--pending .db-dot   { animation: db-pulse-fast 1s ease-in-out infinite; }

@keyframes db-pulse {
  0%, 100% { opacity: 1;   transform: scale(1);   }
  50%      { opacity: 0.5; transform: scale(0.85);}
}
@keyframes db-pulse-fast {
  0%, 100% { opacity: 0.5; }
  50%      { opacity: 1;   }
}
</style>
