import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
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
    const body = await req.json()
    const { to, subject, message, invoiceNumber, amount, dueDate, clientName, businessName, payUrl, items, pdfBase64, senderEmail, replyTo } = body

    if (!to || !to.length) {
      throw new Error("Recipient email 'to' is required")
    }

    const attachments = pdfBase64 ? [
      {
        filename: `Invoice-${invoiceNumber || 'details'}.pdf`,
        content: pdfBase64,
      }
    ] : [];

    const itemsHtml = Array.isArray(items) && items.length > 0
      ? items.map((it: any) => `
          <tr>
            <td style="padding:8px;border-bottom:1px solid #e2e8f0;color:#334155">${it.description || it.name || 'Item'}</td>
            <td style="padding:8px;border-bottom:1px solid #e2e8f0;color:#334155;text-align:center">${it.quantity || 1}</td>
            <td style="padding:8px;border-bottom:1px solid #e2e8f0;color:#334155;text-align:right">₹${Number(it.unitPrice || it.rate || 0).toFixed(2)}</td>
            <td style="padding:8px;border-bottom:1px solid #e2e8f0;color:#334155;text-align:right;font-weight:600">₹${Number(it.totalPrice || it.amount || 0).toFixed(2)}</td>
          </tr>
        `).join('')
      : ''

    const emailResponse = await resend.emails.send({
      from: "Invoicely <no-reply@getinvoicely.online>",
      reply_to: replyTo || senderEmail || "lalitkumarnamdev4645@gmail.com",
      to: Array.isArray(to) ? to : [to],
      subject: subject || `Invoice #${invoiceNumber || ''} from ${businessName || 'Invoicely'}`,
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#ffffff;border-radius:12px;border:1px solid #e2e8f0">
          <div style="margin-bottom:20px;border-bottom:2px solid #f1f5f9;padding-bottom:16px">
            <h1 style="color:#0f172a;font-size:22px;margin:0">${businessName || 'Invoicely'}</h1>
            <p style="color:#64748b;font-size:14px;margin:4px 0 0 0">Invoice #${invoiceNumber || ''}</p>
          </div>

          <p style="color:#334155;font-size:15px;line-height:1.5">Hi ${clientName || 'there'},</p>
          ${message ? `<p style="color:#475569;font-size:14px;background:#f8fafc;padding:12px 16px;border-radius:8px;border-left:4px solid #f59e0b">${message}</p>` : ''}

          <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px">
            <thead>
              <tr style="background:#f8fafc;color:#64748b">
                <th style="padding:8px;text-align:left;border-bottom:1px solid #cbd5e1">Description</th>
                <th style="padding:8px;text-align:center;border-bottom:1px solid #cbd5e1">Qty</th>
                <th style="padding:8px;text-align:right;border-bottom:1px solid #cbd5e1">Price</th>
                <th style="padding:8px;text-align:right;border-bottom:1px solid #cbd5e1">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="margin:24px 0;background:#f8fafc;padding:16px;border-radius:8px">
            <div style="display:flex;justify-content:space-between;color:#0f172a;font-size:18px;font-weight:700">
              <span>Total Amount Due:</span>
              <span style="color:#f59e0b">₹${amount || '0.00'}</span>
            </div>
            ${dueDate ? `<p style="color:#64748b;font-size:12px;margin:6px 0 0 0">Due Date: ${dueDate}</p>` : ''}
          </div>

          ${payUrl ? `
            <div style="text-align:center;margin:30px 0">
              <a href="${payUrl}" style="background:#f59e0b;color:#ffffff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:16px;display:inline-block">
                View &amp; Pay Invoice Online →
              </a>
            </div>
          ` : ''}

          <p style="color:#94a3b8;font-size:12px;text-align:center;margin-top:30px;border-top:1px solid #f1f5f9;padding-top:16px">
            Sent via Invoicely • Secure Online Billing
          </p>
        </div>
      `,
      attachments: attachments.length > 0 ? attachments : undefined,
    })

    return new Response(
      JSON.stringify({ success: true, id: emailResponse.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to send email' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
