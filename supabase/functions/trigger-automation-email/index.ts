import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'npm:resend'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

/**
 * Resolve {{variable}} placeholders in a template string.
 */
function resolveTemplate(text: string, variables: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] ?? `{{${key}}}`)
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const {
      triggerEvent,
      idempotencyKey,
      recipientEmail,
      recipientName,
      variables = {},
    }: {
      triggerEvent: string
      idempotencyKey: string
      recipientEmail: string
      recipientName?: string
      variables?: Record<string, string>
    } = body

    if (!triggerEvent || !idempotencyKey || !recipientEmail) {
      return new Response(
        JSON.stringify({ error: 'triggerEvent, idempotencyKey, and recipientEmail are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // ── 1. Check idempotency — skip if already sent ────────────────────────
    const { data: existingLog } = await supabase
      .from('email_logs')
      .select('id, status')
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle()

    if (existingLog) {
      console.log(`[automation] Skipping duplicate: ${idempotencyKey}`)
      return new Response(
        JSON.stringify({ success: true, skipped: true, reason: 'already_sent', logId: existingLog.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // ── 2. Load automation config ──────────────────────────────────────────
    const { data: automation, error: autoErr } = await supabase
      .from('email_automations')
      .select('*, email_templates(*)')
      .eq('trigger_event', triggerEvent)
      .maybeSingle()

    if (autoErr) throw autoErr

    if (!automation) {
      return new Response(
        JSON.stringify({ success: false, error: `No automation template configured for trigger: ${triggerEvent}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    if (!automation.enabled) {
      // Log as skipped
      await supabase.from('email_logs').insert({
        automation_id: automation.id,
        template_id: automation.template_id,
        trigger_event: triggerEvent,
        idempotency_key: idempotencyKey,
        recipient_email: recipientEmail,
        recipient_name: recipientName ?? null,
        subject: null,
        status: 'skipped',
        resend_message_id: null,
        error_message: 'Automation is disabled',
      })

      return new Response(
        JSON.stringify({ success: true, skipped: true, reason: 'automation_disabled' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    const template = automation.email_templates
    if (!template) {
      throw new Error('No email template linked to this automation')
    }

    // ── 3. Resolve template variables ─────────────────────────────────────
    const mergedVars: Record<string, string> = {
      userName: recipientName ?? 'there',
      userEmail: recipientEmail,
      companyName: 'Invoicely',
      ...variables,
    }

    const resolvedSubject = resolveTemplate(template.subject, mergedVars)
    const resolvedBody = resolveTemplate(template.html_body, mergedVars)

    // ── 4. Send via Resend ────────────────────────────────────────────────
    let resendMessageId: string | null = null
    let sendStatus: 'sent' | 'failed' = 'sent'
    let errorMessage: string | null = null

    try {
      const emailResponse = await resend.emails.send({
        from: 'Invoicely <no-reply@getinvoicely.online>',
        reply_to: variables.replyTo ?? 'lalitkumarnamdev4645@gmail.com',
        to: [recipientEmail],
        subject: resolvedSubject,
        html: resolvedBody,
      })

      // resend.emails.send returns { data: { id }, error }
      if ((emailResponse as any).error) {
        throw new Error((emailResponse as any).error.message ?? 'Resend API error')
      }

      resendMessageId = (emailResponse as any).data?.id ?? emailResponse?.id ?? null
    } catch (sendErr: any) {
      sendStatus = 'failed'
      errorMessage = sendErr.message ?? 'Unknown send error'
      console.error('[automation] Resend failed:', errorMessage)
    }

    // ── 5. Log the attempt ────────────────────────────────────────────────
    const { data: logEntry } = await supabase
      .from('email_logs')
      .insert({
        automation_id: automation.id,
        template_id: template.id,
        trigger_event: triggerEvent,
        idempotency_key: idempotencyKey,
        recipient_email: recipientEmail,
        recipient_name: recipientName ?? null,
        subject: resolvedSubject,
        status: sendStatus,
        resend_message_id: resendMessageId,
        error_message: errorMessage,
      })
      .select('id')
      .single()

    // ── 6. Update automation stats ────────────────────────────────────────
    if (sendStatus === 'sent') {
      await supabase
        .from('email_automations')
        .update({
          send_count: (automation.send_count ?? 0) + 1,
          last_sent_at: new Date().toISOString(),
        })
        .eq('id', automation.id)
    }

    return new Response(
      JSON.stringify({
        success: sendStatus === 'sent',
        skipped: false,
        status: sendStatus,
        logId: logEntry?.id ?? null,
        resendMessageId,
        error: errorMessage,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error: any) {
    console.error('[automation] Unhandled error:', error)
    return new Response(
      JSON.stringify({ error: error.message ?? 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
