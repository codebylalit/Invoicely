-- ─────────────────────────────────────────────────────────────────────────────
-- Email Automation System Tables
-- Migration: 20260812100000_email_automation_system
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. email_templates ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.email_templates (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  trigger_event   text NOT NULL UNIQUE,
  subject         text NOT NULL,
  html_body       text NOT NULL,
  variables       text[] NOT NULL DEFAULT '{}',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access on email_templates"
  ON public.email_templates FOR ALL USING (true) WITH CHECK (true);

-- ── 2. email_automations ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.email_automations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_event   text NOT NULL UNIQUE,
  label           text NOT NULL,
  description     text,
  enabled         boolean NOT NULL DEFAULT true,
  delay_minutes   integer NOT NULL DEFAULT 0,
  template_id     uuid REFERENCES public.email_templates(id) ON DELETE SET NULL,
  recipient_type  text NOT NULL DEFAULT 'user',  -- 'user' | 'all_users'
  send_count      integer NOT NULL DEFAULT 0,
  last_sent_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.email_automations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access on email_automations"
  ON public.email_automations FOR ALL USING (true) WITH CHECK (true);

-- ── 3. email_logs ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.email_logs (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id       uuid REFERENCES public.email_automations(id) ON DELETE SET NULL,
  template_id         uuid REFERENCES public.email_templates(id) ON DELETE SET NULL,
  trigger_event       text NOT NULL,
  idempotency_key     text NOT NULL,
  recipient_email     text NOT NULL,
  recipient_name      text,
  subject             text,
  status              text NOT NULL DEFAULT 'sent',  -- 'sent' | 'failed' | 'skipped'
  resend_message_id   text,
  error_message       text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT email_logs_idempotency UNIQUE (idempotency_key)
);

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access on email_logs"
  ON public.email_logs FOR ALL USING (true) WITH CHECK (true);

-- Index for fast log queries
CREATE INDEX IF NOT EXISTS idx_email_logs_trigger_event ON public.email_logs(trigger_event);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON public.email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON public.email_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_automation_id ON public.email_logs(automation_id);

-- ── 4. updated_at trigger ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_email_automations_updated_at
  BEFORE UPDATE ON public.email_automations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- Seed: Default Email Templates
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO public.email_templates (name, trigger_event, subject, html_body, variables) VALUES

('Welcome Email', 'user_registered',
 'Welcome to Invoicely, {{userName}}! 🎉',
 '<div style="font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,sans-serif;max-width:600px;margin:0 auto;background:#ffffff">
  <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);padding:40px 32px;text-align:center;border-radius:12px 12px 0 0">
    <div style="width:56px;height:56px;background:#f59e0b;border-radius:14px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;font-size:28px;font-weight:900;color:#0f172a;line-height:56px">I</div>
    <h1 style="color:#ffffff;font-size:26px;font-weight:800;margin:0;letter-spacing:-0.5px">Welcome to Invoicely!</h1>
    <p style="color:#94a3b8;font-size:14px;margin:8px 0 0 0">Professional invoicing made simple</p>
  </div>
  <div style="padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
    <p style="color:#334155;font-size:16px;margin:0 0 16px 0">Hi {{userName}},</p>
    <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 24px 0">
      Your Invoicely account is ready. You can now create professional invoices, track payments, and get paid faster — all in one place.
    </p>
    <div style="background:#f8fafc;border-radius:10px;padding:20px;margin-bottom:24px">
      <p style="color:#0f172a;font-size:14px;font-weight:700;margin:0 0 12px 0">🚀 Get started in 3 steps:</p>
      <div style="color:#475569;font-size:14px;line-height:1.8">
        <div>✅ Complete your business profile in Settings</div>
        <div>✅ Create your first invoice</div>
        <div>✅ Share the live payment link with your client</div>
      </div>
    </div>
    <div style="text-align:center;margin:28px 0">
      <a href="https://getinvoicely.online/app" style="background:#f59e0b;color:#0f172a;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:800;font-size:15px;display:inline-block">Open My Dashboard →</a>
    </div>
    <p style="color:#94a3b8;font-size:12px;text-align:center;margin-top:24px;padding-top:16px;border-top:1px solid #f1f5f9">
      You''re receiving this because you signed up for Invoicely. <br/>
      Invoicely • Professional Invoice &amp; Billing Platform
    </p>
  </div>
</div>',
 ARRAY['{{userName}}', '{{userEmail}}']),

('First Invoice Success', 'first_invoice_created',
 '🎉 You just created your first invoice, {{userName}}!',
 '<div style="font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,sans-serif;max-width:600px;margin:0 auto;background:#ffffff">
  <div style="background:linear-gradient(135deg,#065f46 0%,#047857 100%);padding:40px 32px;text-align:center;border-radius:12px 12px 0 0">
    <div style="font-size:48px;margin-bottom:8px">🎉</div>
    <h1 style="color:#ffffff;font-size:24px;font-weight:800;margin:0">First Invoice Created!</h1>
  </div>
  <div style="padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
    <p style="color:#334155;font-size:16px;margin:0 0 16px 0">Hi {{userName}},</p>
    <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 24px 0">
      Congratulations on creating Invoice <strong>#{{invoiceNumber}}</strong>! You''re officially on your way to getting paid faster. Here are a few tips to maximize your results:
    </p>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:20px;margin-bottom:24px">
      <p style="color:#166534;font-size:14px;font-weight:700;margin:0 0 12px 0">💡 Pro Tips:</p>
      <div style="color:#166534;font-size:14px;line-height:1.8">
        <div>📎 Share the <strong>live payment link</strong> — clients can pay online instantly</div>
        <div>⏰ Set a <strong>due date</strong> to get paid on time</div>
        <div>📄 Add your <strong>business logo</strong> for a professional look</div>
        <div>🔄 Use <strong>recurring invoices</strong> for repeat clients</div>
      </div>
    </div>
    <div style="text-align:center;margin:28px 0">
      <a href="https://getinvoicely.online/app/invoices" style="background:#f59e0b;color:#0f172a;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:800;font-size:15px;display:inline-block">View My Invoice →</a>
    </div>
    <p style="color:#94a3b8;font-size:12px;text-align:center;margin-top:24px;padding-top:16px;border-top:1px solid #f1f5f9">
      Invoicely • Professional Invoice &amp; Billing Platform
    </p>
  </div>
</div>',
 ARRAY['{{userName}}', '{{userEmail}}', '{{invoiceNumber}}']),

('Invoice Sent Confirmation', 'invoice_sent',
 'Invoice #{{invoiceNumber}} has been sent successfully ✅',
 '<div style="font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,sans-serif;max-width:600px;margin:0 auto;background:#ffffff">
  <div style="background:#0f172a;padding:32px;text-align:center;border-radius:12px 12px 0 0">
    <div style="font-size:40px;margin-bottom:8px">📨</div>
    <h1 style="color:#ffffff;font-size:22px;font-weight:800;margin:0">Invoice Sent!</h1>
  </div>
  <div style="padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
    <p style="color:#334155;font-size:15px;margin:0 0 20px 0">Hi {{userName}},</p>
    <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 20px 0">
      Your invoice has been delivered to your client.
    </p>
    <div style="background:#f8fafc;border-radius:10px;padding:20px;margin-bottom:24px">
      <table style="width:100%;font-size:14px;color:#334155">
        <tr><td style="padding:4px 0;color:#64748b">Invoice Number</td><td style="text-align:right;font-weight:600">#{{invoiceNumber}}</td></tr>
        <tr><td style="padding:4px 0;color:#64748b">Amount</td><td style="text-align:right;font-weight:700;color:#f59e0b">{{invoiceAmount}}</td></tr>
        <tr><td style="padding:4px 0;color:#64748b">Due Date</td><td style="text-align:right;font-weight:600">{{invoiceDueDate}}</td></tr>
      </table>
    </div>
    <p style="color:#94a3b8;font-size:12px;text-align:center;margin-top:24px;padding-top:16px;border-top:1px solid #f1f5f9">
      Invoicely • Professional Invoice &amp; Billing Platform
    </p>
  </div>
</div>',
 ARRAY['{{userName}}', '{{userEmail}}', '{{invoiceNumber}}', '{{invoiceAmount}}', '{{invoiceDueDate}}']),

('Payment Received', 'invoice_paid',
 '💰 Payment received for Invoice #{{invoiceNumber}}',
 '<div style="font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,sans-serif;max-width:600px;margin:0 auto;background:#ffffff">
  <div style="background:linear-gradient(135deg,#065f46 0%,#047857 100%);padding:40px 32px;text-align:center;border-radius:12px 12px 0 0">
    <div style="font-size:48px;margin-bottom:8px">💰</div>
    <h1 style="color:#ffffff;font-size:24px;font-weight:800;margin:0">Payment Received!</h1>
    <p style="color:#a7f3d0;font-size:14px;margin:8px 0 0 0">Funds are on their way</p>
  </div>
  <div style="padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
    <p style="color:#334155;font-size:15px;margin:0 0 16px 0">Hi {{userName}},</p>
    <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 24px 0">
      Great news — your client has paid Invoice <strong>#{{invoiceNumber}}</strong>!
    </p>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:20px;margin-bottom:24px;text-align:center">
      <p style="color:#166534;font-size:13px;font-weight:600;margin:0 0 6px 0">Amount Received</p>
      <p style="color:#166534;font-size:32px;font-weight:900;margin:0">{{invoiceAmount}}</p>
    </div>
    <div style="text-align:center;margin:28px 0">
      <a href="https://getinvoicely.online/app/invoices" style="background:#f59e0b;color:#0f172a;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:800;font-size:15px;display:inline-block">View Invoice →</a>
    </div>
    <p style="color:#94a3b8;font-size:12px;text-align:center;margin-top:24px;padding-top:16px;border-top:1px solid #f1f5f9">
      Invoicely • Professional Invoice &amp; Billing Platform
    </p>
  </div>
</div>',
 ARRAY['{{userName}}', '{{userEmail}}', '{{invoiceNumber}}', '{{invoiceAmount}}']),

('Payment Reminder (Overdue)', 'invoice_overdue',
 '⚠️ Invoice #{{invoiceNumber}} is overdue — action needed',
 '<div style="font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,sans-serif;max-width:600px;margin:0 auto;background:#ffffff">
  <div style="background:linear-gradient(135deg,#7f1d1d 0%,#991b1b 100%);padding:40px 32px;text-align:center;border-radius:12px 12px 0 0">
    <div style="font-size:40px;margin-bottom:8px">⚠️</div>
    <h1 style="color:#ffffff;font-size:22px;font-weight:800;margin:0">Invoice Overdue</h1>
  </div>
  <div style="padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
    <p style="color:#334155;font-size:15px;margin:0 0 16px 0">Hi {{userName}},</p>
    <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 24px 0">
      Invoice <strong>#{{invoiceNumber}}</strong> for <strong>{{invoiceAmount}}</strong> was due on <strong>{{invoiceDueDate}}</strong> and has not been paid yet.
    </p>
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:16px;margin-bottom:24px">
      <p style="color:#991b1b;font-size:14px;margin:0">💡 <strong>Tip:</strong> Share the live payment link with your client directly from your Invoicely dashboard so they can pay with a single click.</p>
    </div>
    <div style="text-align:center;margin:28px 0">
      <a href="https://getinvoicely.online/app/invoices" style="background:#ef4444;color:#ffffff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:800;font-size:15px;display:inline-block">Follow Up Now →</a>
    </div>
    <p style="color:#94a3b8;font-size:12px;text-align:center;margin-top:24px;padding-top:16px;border-top:1px solid #f1f5f9">
      Invoicely • Professional Invoice &amp; Billing Platform
    </p>
  </div>
</div>',
 ARRAY['{{userName}}', '{{userEmail}}', '{{invoiceNumber}}', '{{invoiceAmount}}', '{{invoiceDueDate}}']),

('Feature Announcement', 'feature_announcement',
 '🚀 New on Invoicely — {{featureTitle}}',
 '<div style="font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,sans-serif;max-width:600px;margin:0 auto;background:#ffffff">
  <div style="background:linear-gradient(135deg,#1e1b4b 0%,#312e81 100%);padding:40px 32px;text-align:center;border-radius:12px 12px 0 0">
    <div style="font-size:40px;margin-bottom:8px">🚀</div>
    <h1 style="color:#ffffff;font-size:24px;font-weight:800;margin:0">New on Invoicely</h1>
    <p style="color:#a5b4fc;font-size:14px;margin:8px 0 0 0">Product Update</p>
  </div>
  <div style="padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
    <p style="color:#334155;font-size:15px;margin:0 0 16px 0">Hi {{userName}},</p>
    <h2 style="color:#0f172a;font-size:20px;font-weight:800;margin:0 0 12px 0">{{featureTitle}}</h2>
    <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 24px 0">{{featureDescription}}</p>
    <div style="text-align:center;margin:28px 0">
      <a href="https://getinvoicely.online/app" style="background:#f59e0b;color:#0f172a;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:800;font-size:15px;display:inline-block">Try It Now →</a>
    </div>
    <p style="color:#94a3b8;font-size:12px;text-align:center;margin-top:24px;padding-top:16px;border-top:1px solid #f1f5f9">
      Invoicely • Professional Invoice &amp; Billing Platform
    </p>
  </div>
</div>',
 ARRAY['{{userName}}', '{{userEmail}}', '{{featureTitle}}', '{{featureDescription}}']),

('Re-engagement Email', 'user_inactive',
 'We miss you, {{userName}} — here''s what''s new 👋',
 '<div style="font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,sans-serif;max-width:600px;margin:0 auto;background:#ffffff">
  <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);padding:40px 32px;text-align:center;border-radius:12px 12px 0 0">
    <div style="font-size:40px;margin-bottom:8px">👋</div>
    <h1 style="color:#ffffff;font-size:24px;font-weight:800;margin:0">We miss you, {{userName}}!</h1>
  </div>
  <div style="padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
    <p style="color:#334155;font-size:15px;margin:0 0 16px 0">Hi {{userName}},</p>
    <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 24px 0">
      It''s been a while since you logged into Invoicely. Your clients might be waiting for invoices — let us help you get back on track.
    </p>
    <div style="background:#f8fafc;border-radius:10px;padding:20px;margin-bottom:24px">
      <p style="color:#0f172a;font-size:14px;font-weight:700;margin:0 0 12px 0">While you were away, we added:</p>
      <div style="color:#475569;font-size:14px;line-height:1.8">
        <div>✨ New invoice templates</div>
        <div>⚡ Faster payment checkout</div>
        <div>📊 Better dashboard insights</div>
      </div>
    </div>
    <div style="text-align:center;margin:28px 0">
      <a href="https://getinvoicely.online/app" style="background:#f59e0b;color:#0f172a;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:800;font-size:15px;display:inline-block">Return to Invoicely →</a>
    </div>
    <p style="color:#94a3b8;font-size:12px;text-align:center;margin-top:24px;padding-top:16px;border-top:1px solid #f1f5f9">
      Invoicely • Professional Invoice &amp; Billing Platform
    </p>
  </div>
</div>',
 ARRAY['{{userName}}', '{{userEmail}}']);


-- ─────────────────────────────────────────────────────────────────────────────
-- Seed: Default Automation Rules (linked to templates above)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO public.email_automations (trigger_event, label, description, enabled, delay_minutes, template_id, recipient_type)
SELECT
  'user_registered',
  'New User Registration',
  'Sends a welcome email when a new user creates an Invoicely account.',
  true,
  0,
  id,
  'user'
FROM public.email_templates WHERE trigger_event = 'user_registered';

INSERT INTO public.email_automations (trigger_event, label, description, enabled, delay_minutes, template_id, recipient_type)
SELECT
  'first_invoice_created',
  'First Invoice Created',
  'Sends tips & celebration email when a user creates their very first invoice.',
  true,
  0,
  id,
  'user'
FROM public.email_templates WHERE trigger_event = 'first_invoice_created';

INSERT INTO public.email_automations (trigger_event, label, description, enabled, delay_minutes, template_id, recipient_type)
SELECT
  'invoice_sent',
  'Invoice Sent',
  'Sends a confirmation to the invoice owner when they send an invoice to a client.',
  true,
  0,
  id,
  'user'
FROM public.email_templates WHERE trigger_event = 'invoice_sent';

INSERT INTO public.email_automations (trigger_event, label, description, enabled, delay_minutes, template_id, recipient_type)
SELECT
  'invoice_paid',
  'Invoice Paid',
  'Notifies the invoice owner when a client pays an invoice.',
  true,
  0,
  id,
  'user'
FROM public.email_templates WHERE trigger_event = 'invoice_paid';

INSERT INTO public.email_automations (trigger_event, label, description, enabled, delay_minutes, template_id, recipient_type)
SELECT
  'invoice_overdue',
  'Invoice Overdue',
  'Sends a payment reminder to the invoice owner when an invoice passes its due date unpaid.',
  true,
  0,
  id,
  'user'
FROM public.email_templates WHERE trigger_event = 'invoice_overdue';

INSERT INTO public.email_automations (trigger_event, label, description, enabled, delay_minutes, template_id, recipient_type)
SELECT
  'feature_announcement',
  'Feature Announcement',
  'Manually triggered by admin to broadcast a product update to all users.',
  true,
  0,
  id,
  'all_users'
FROM public.email_templates WHERE trigger_event = 'feature_announcement';

INSERT INTO public.email_automations (trigger_event, label, description, enabled, delay_minutes, template_id, recipient_type)
SELECT
  'user_inactive',
  'Re-engagement (Inactive Users)',
  'Sends a re-engagement email to users who have not logged in for 30+ days. Requires scheduled cron job.',
  false,
  0,
  id,
  'user'
FROM public.email_templates WHERE trigger_event = 'user_inactive';
