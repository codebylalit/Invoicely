import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from "npm:resend"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const resend = new Resend(Deno.env.get("RESEND_API_KEY"))

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Run lifecycle sync before processing to ensure expired subscribers don't get invoices generated
    try {
      await supabaseClient.rpc('sync_subscription_lifecycle');
    } catch (syncErr) {
      console.warn('[Recurring] sync_subscription_lifecycle warning:', syncErr);
    }

    // Get all recurring invoices due for generation
    const { data: recurringInvoices, error: fetchError } = await supabaseClient
      .from('invoices')
      .select('*')
      .eq('is_recurring', true)
      .lte('next_recurrence_date', new Date().toISOString())
      .is('parent_invoice_id', null)

    if (fetchError) throw fetchError

    const siteUrl = Deno.env.get('SITE_URL') || 'https://getinvoicely.online'

    for (const invoice of recurringInvoices) {
      // Plan check: verify user is currently an active Pro user or Admin
      if (invoice.user_id) {
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('tier, is_admin, subscription_status, subscription_renewal_date, subscription_end_date')
          .eq('user_id', invoice.user_id)
          .maybeSingle()

        const isAdmin = Boolean(profile?.is_admin);
        const userTier = String(profile?.tier || 'free').toLowerCase();
        const subStatus = String(profile?.subscription_status || 'inactive').toLowerCase();
        const now = new Date();

        const isCancelledValid = subStatus === 'cancelled' && profile?.subscription_end_date && new Date(profile.subscription_end_date) > now;
        const isActiveValid = (subStatus === 'active' || userTier.includes('pro')) && (!profile?.subscription_renewal_date || new Date(profile.subscription_renewal_date) > now);
        const hasValidProAccess = isAdmin || ((userTier.includes('pro') || isCancelledValid) && (isActiveValid || isCancelledValid) && subStatus !== 'expired');

        if (!hasValidProAccess) {
          console.log(`[Recurring] Pausing invoice ${invoice.id} because user ${invoice.user_id} does not have an active Pro subscription (status: ${subStatus}, tier: ${userTier})`)
          await supabaseClient
            .from('invoices')
            .update({ is_recurring: false })
            .eq('id', invoice.id)
          continue
        }
      }

      // Stop if end date has passed
      if (invoice.recurrence_end_date && new Date(invoice.recurrence_end_date) < new Date()) {
        await supabaseClient
          .from('invoices')
          .update({ is_recurring: false })
          .eq('id', invoice.id)
        continue
      }

      // Calculate next recurrence date
      const nextDate = calculateNextRecurrenceDate(
        invoice.recurrence_frequency,
        invoice.recurrence_interval,
        new Date(invoice.next_recurrence_date)
      )

      // Create new invoice from parent
      const { data: newInvoice, error: createError } = await supabaseClient
        .from('invoices')
        .insert({
          ...invoice,
          id: undefined,
          status: 'draft',
          issued_date: new Date().toISOString(),
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          parent_invoice_id: invoice.id,
          next_recurrence_date: nextDate.toISOString(),
        })
        .select()
        .single()

      if (createError) throw createError

      // Update parent invoice's next recurrence date
      await supabaseClient
        .from('invoices')
        .update({ next_recurrence_date: nextDate.toISOString() })
        .eq('id', invoice.id)

      // Send email to client if email is available
      const clientEmail = newInvoice?.client_email || newInvoice?.email
      if (newInvoice && clientEmail) {
        const clientName = newInvoice.client_name || newInvoice.name || 'there'
        const businessName = newInvoice.fromCompany || newInvoice.business_name || 'Invoicely'

        let rawItems = newInvoice.items
        if (typeof rawItems === 'string') {
          try { rawItems = JSON.parse(rawItems) } catch (_) { rawItems = [] }
        }
        if (!Array.isArray(rawItems)) rawItems = []

        const itemsTableHtml = rawItems.length > 0
          ? rawItems.map((it: any) => `
              <tr>
                <td style="padding:10px;border-bottom:1px solid #e2e8f0;color:#334155">${it.description || it.name || 'Services'}</td>
                <td style="padding:10px;border-bottom:1px solid #e2e8f0;color:#334155;text-align:center">${it.quantity || 1}</td>
                <td style="padding:10px;border-bottom:1px solid #e2e8f0;color:#334155;text-align:right">₹${Number(it.unitPrice || it.rate || 0).toFixed(2)}</td>
                <td style="padding:10px;border-bottom:1px solid #e2e8f0;color:#334155;text-align:right;font-weight:600">₹${Number(it.totalPrice || it.amount || 0).toFixed(2)}</td>
              </tr>
            `).join('')
          : `<tr><td colspan="4" style="padding:10px;color:#64748b">Recurring Subscription / Services</td></tr>`

        // Replies have to reach the seller. This used to read profiles.email,
        // a column that does not exist, so it always fell through to a
        // hardcoded personal address — every client reply went to the wrong
        // person. Read the business contact email, then the account email.
        let ownerEmail: string | undefined;
        if (invoice.user_id) {
          const { data: ownerBusiness } = await supabaseClient
            .from("business_details")
            .select("email")
            .eq("user_id", invoice.user_id)
            .maybeSingle();
          if (ownerBusiness?.email) {
            ownerEmail = ownerBusiness.email;
          } else {
            const { data: ownerUser } = await supabaseClient.auth.admin.getUserById(invoice.user_id);
            if (ownerUser?.user?.email) ownerEmail = ownerUser.user.email;
          }
        }

        const brandingVisible = newInvoice.show_watermark !== false

        const fromName = String(businessName || "Invoicely")
          .replace(/[\r\n"<>,;:]/g, " ")
          .trim()
          .slice(0, 64) || "Invoicely";

        await resend.emails.send({
          // Recurring invoices are a Pro-only feature, so the seller has paid
          // for our name to stay out of what their client sees. Honour the
          // invoice's own show_watermark flag rather than assuming.
          from: brandingVisible
            ? `${fromName} via Invoicely <no-reply@getinvoicely.online>`
            : `${fromName} <no-reply@getinvoicely.online>`,
          reply_to: ownerEmail,
          to: clientEmail,
          subject: `Invoice #${newInvoice.invoice_number} from ${businessName} — Payment Due`,
          html: `
            <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#ffffff;border-radius:12px;border:1px solid #e2e8f0">
              <div style="margin-bottom:20px;border-bottom:2px solid #f1f5f9;padding-bottom:16px">
                <h1 style="color:#0f172a;font-size:22px;margin:0">${businessName}</h1>
                <p style="color:#64748b;font-size:14px;margin:4px 0 0 0">Recurring Invoice #${newInvoice.invoice_number}</p>
              </div>

              <p style="color:#334155;font-size:15px;line-height:1.5">Hi ${clientName},</p>
              <p style="color:#475569;font-size:14px;background:#f8fafc;padding:12px 16px;border-radius:8px;border-left:4px solid #3b82f6">
                A new recurring invoice has been automatically generated for your ongoing subscription.
              </p>

              <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px">
                <thead>
                  <tr style="background:#f8fafc;color:#64748b">
                    <th style="padding:10px;text-align:left;border-bottom:1px solid #cbd5e1">Description</th>
                    <th style="padding:10px;text-align:center;border-bottom:1px solid #cbd5e1">Qty</th>
                    <th style="padding:10px;text-align:right;border-bottom:1px solid #cbd5e1">Rate</th>
                    <th style="padding:10px;text-align:right;border-bottom:1px solid #cbd5e1">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsTableHtml}
                </tbody>
              </table>

              <div style="margin:24px 0;background:#f8fafc;padding:16px;border-radius:8px">
                <div style="display:flex;justify-content:space-between;color:#0f172a;font-size:18px;font-weight:700">
                  <span>Total Amount Due:</span>
                  <span style="color:#f59e0b">₹${Number(newInvoice.total || 0).toFixed(2)}</span>
                </div>
                <p style="color:#64748b;font-size:12px;margin:6px 0 0 0">Due Date: ${newInvoice.due_date ? new Date(newInvoice.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</p>
              </div>

              <div style="text-align:center;margin:30px 0">
                <a href="${siteUrl}/pay/${newInvoice.id}"
                   style="display:inline-block;background:#f59e0b;color:#ffffff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:16px">
                  View &amp; Pay Invoice Online →
                </a>
              </div>

              <p style="color:#94a3b8;margin-top:28px;font-size:12px;text-align:center;border-top:1px solid #f1f5f9;padding-top:16px">
                ${brandingVisible
                  ? 'This is an automated recurring invoice sent via Invoicely.'
                  : `This is an automated recurring invoice from ${businessName}.`}
              </p>
            </div>
          `,
        })
      }
    }

    // ── Overdue Invoice Detection ─────────────────────────────────────────
    // Find invoices that are past their due date and still pending/draft
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data: overdueInvoices, error: overdueErr } = await supabaseClient
      .from('invoices')
      .select('id, invoice_number, user_id, total, due_date, status')
      .lt('due_date', today.toISOString())
      .in('status', ['pending', 'Pending', 'draft', 'Draft'])
      .not('due_date', 'is', null)

    if (!overdueErr && overdueInvoices && overdueInvoices.length > 0) {
      for (const inv of overdueInvoices) {
        // Fetch owner profile to get their email
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('email, full_name')
          .eq('id', inv.user_id)
          .maybeSingle()

        const ownerEmail = profile?.email ?? null
        if (!ownerEmail) continue

        const idempotencyKey = `invoice_overdue_${inv.id}`

        // Update invoice status to overdue
        await supabaseClient
          .from('invoices')
          .update({ status: 'overdue' })
          .eq('id', inv.id)

        // Trigger overdue automation
        try {
          const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
          const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
          await fetch(`${supabaseUrl}/functions/v1/trigger-automation-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${serviceKey}`,
              'apikey': serviceKey,
            },
            body: JSON.stringify({
              triggerEvent: 'invoice_overdue',
              idempotencyKey,
              recipientEmail: ownerEmail,
              recipientName: profile?.full_name ?? ownerEmail.split('@')[0],
              variables: {
                userName: profile?.full_name ?? ownerEmail.split('@')[0],
                userEmail: ownerEmail,
                invoiceNumber: inv.invoice_number ?? '',
                invoiceAmount: `₹${Number(inv.total ?? 0).toFixed(2)}`,
                invoiceDueDate: inv.due_date
                  ? new Date(inv.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                  : '',
              },
            }),
          })
        } catch (autoErr) {
          console.warn(`[automation] invoice_overdue email failed for ${inv.id}:`, autoErr)
        }
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Recurring invoices processed successfully',
        recurringCount: recurringInvoices?.length ?? 0,
        overdueCount: overdueInvoices?.length ?? 0,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('generate-recurring-invoices error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})



function calculateNextRecurrenceDate(
  frequency: string,
  interval: number,
  currentDate: Date
): Date {
  const nextDate = new Date(currentDate)

  switch (frequency) {
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + (7 * interval))
      break
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + interval)
      break
    case 'custom':
      nextDate.setDate(nextDate.getDate() + interval)
      break
    default:
      throw new Error('Invalid frequency: ' + frequency)
  }

  return nextDate
}