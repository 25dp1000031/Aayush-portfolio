// ── Supabase client singleton ──────────────────────────────────────────
// Configure via .env.local:
//   VITE_SUPABASE_URL     — your project URL  (https://xxx.supabase.co)
//   VITE_SUPABASE_ANON_KEY — your anon/public key (safe to expose)
//
// When neither variable is set the client is null and every store
// action falls back to its local-default implementation gracefully.
import { createClient } from '@supabase/supabase-js'

const URL  = import.meta.env.VITE_SUPABASE_URL     ?? ''
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

export const supabase = URL && ANON ? createClient(URL, ANON) : null
