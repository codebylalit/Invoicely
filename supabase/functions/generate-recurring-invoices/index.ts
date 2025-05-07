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

    // Get all recurring invoices that need to be generated
    const { data: recurringInvoices, error: fetchError } = await supabaseClient
      .from('invoices')
      .select('*')
      .eq('is_recurring', true)
      .lte('next_recurrence_date', new Date().toISOString())
      .is('parent_invoice_id', null)

    if (fetchError) throw fetchError

    for (const invoice of recurringInvoices) {
      // Check if we've reached the end date
      if (invoice.recurrence_end_date && new Date(invoice.recurrence_end_date) < new Date()) {
        // Update the parent invoice to stop recurring
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

      // Create new invoice
      const { data: newInvoice, error: createError } = await supabaseClient
        .from('invoices')
        .insert({
          ...invoice,
          id: undefined, // Let the database generate a new ID
          status: 'draft',
          issued_date: new Date().toISOString(),
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
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

      if (newInvoice && newInvoice.email) {
        await resend.emails.send({
          from: "Your Company <your@email.com>",
          to: newInvoice.email,
          subject: `Your Invoice #${newInvoice.invoice_number || newInvoice.invoiceNumber}`,
          html: `
            <h2>Hi ${newInvoice.name || "there"},</h2>
            <p>Your new invoice is ready.</p>
            <p><b>Amount:</b> $${newInvoice.total}</p>
            <p><b>Due Date:</b> ${newInvoice.due_date || newInvoice.dueDate}</p>
            <p>Thank you for your business!</p>
          `,
        });
      }
    }

    return new Response(
      JSON.stringify({ message: 'Recurring invoices processed successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
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
      throw new Error('Invalid frequency')
  }
  
  return nextDate
} 