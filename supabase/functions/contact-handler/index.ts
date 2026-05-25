/**
 * Supabase Edge Function: contact-handler
 * ─────────────────────────────────────────────────────────────────────────
 * Fires whenever a row is inserted into `contact_messages` via a
 * Supabase Database Webhook, OR can be called directly by the frontend.
 *
 * Purpose: send an email notification to Aayush when the contact form fires.
 * Currently wired for Resend — swap the provider block for SendGrid /
 * Postmark / AWS SES as preferred.
 *
 * Deploy:
 *   supabase functions deploy contact-handler
 *
 * Required secrets (Supabase dashboard → Edge Functions → Secrets):
 *   RESEND_API_KEY   — https://resend.com  API key
 *   NOTIFY_TO        — recipient e-mail  (e.g. aayushkukade@gmail.com)
 *   NOTIFY_FROM      — verified sender   (e.g. portfolio@yourdomain.com)
 *
 * Database Webhook (optional auto-trigger on INSERT):
 *   Dashboard → Database → Webhooks → New
 *   Table: contact_messages | Event: INSERT
 *   URL  : https://<project>.supabase.co/functions/v1/contact-handler
 * ─────────────────────────────────────────────────────────────────────────
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const CORS = {
  'Access-Control-Allow-Origin' : '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {

  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS })
  }

  try {
    // Payload arrives either as a direct POST or from a DB webhook.
    // DB webhooks wrap the inserted row as { type, table, schema, record }.
    const body   = await req.json()
    const record = (body.record ?? body) as Record<string, string>

    const { from_name, from_email, subject, message } = record

    if (!from_name || !from_email || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: from_name, from_email, message' }),
        { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } },
      )
    }

    // ── Email via Resend ─────────────────────────────────────────────────
    const RESEND_KEY  = Deno.env.get('RESEND_API_KEY')  ?? ''
    const NOTIFY_TO   = Deno.env.get('NOTIFY_TO')        ?? ''
    const NOTIFY_FROM = Deno.env.get('NOTIFY_FROM')      ?? 'portfolio@example.com'

    if (!RESEND_KEY || !NOTIFY_TO) {
      console.warn('[contact-handler] RESEND_API_KEY or NOTIFY_TO not set — email skipped.')
      return new Response(
        JSON.stringify({ success: true, note: 'Message saved; email notification skipped (secrets not configured).' }),
        { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } },
      )
    }

const emailRes = await fetch('https://api.resend.com/emails', {
      method : 'POST',
      headers: { 
        'Authorization': `Bearer ${RESEND_KEY}`, 
        'Content-Type': 'application/json',
        'User-Agent': 'supabase-edge-function/1.0' // 🌟 Fixed! Right inside the headers object.
      },
      body   : JSON.stringify({
        from   : NOTIFY_FROM,
        to     : [NOTIFY_TO],
        subject: `[Portfolio] ${subject ?? '(no subject)'} — from ${from_name}`,
        html   : `
          <div style="font-family:monospace;max-width:600px;margin:auto;padding:24px;
                      background:#0d1117;color:#cdd9e5;border-radius:8px">
            <h2 style="color:#10b981;margin-bottom:16px">📬 New Contact Message</h2>
            <p><strong style="color:#79c0ff">From :</strong> ${from_name} &lt;${from_email}&gt;</p>
            <p><strong style="color:#79c0ff">Subject:</strong> ${subject ?? '—'}</p>
            <hr style="border-color:#30363d;margin:16px 0"/>
            <p style="white-space:pre-wrap;line-height:1.7">${message}</p>
          </div>
        `,
      }),
    })

    if (!emailRes.ok) {
      throw new Error(`Resend API error ${emailRes.status}: ${await emailRes.text()}`)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } },
    )

  } catch (err) {
    console.error('[contact-handler]', err)
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } },
    )
  }
})
