import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@supabase/auth-helpers-react';
import { toast } from 'sonner';
import {
  Mail,
  ToggleLeft,
  ToggleRight,
  Clock,
  Send,
  Eye,
  RefreshCw,
  CheckCircle2,
  XCircle,
  MinusCircle,
  ChevronDown,
  ChevronRight,
  Edit3,
  Save,
  X,
  Loader2,
  AlertCircle,
  Users,
  Zap,
  FileText,
  BarChart2,
  RotateCcw,
  FlaskConical,
  Megaphone,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

// ─── Types ────────────────────────────────────────────────────────────────────

interface EmailTemplate {
  id: string;
  name: string;
  trigger_event: string;
  subject: string;
  html_body: string;
  variables: string[];
  created_at: string;
  updated_at: string;
}

interface EmailAutomation {
  id: string;
  trigger_event: string;
  label: string;
  description: string | null;
  enabled: boolean;
  delay_minutes: number;
  template_id: string | null;
  recipient_type: string;
  send_count: number;
  last_sent_at: string | null;
  created_at: string;
  updated_at: string;
  email_templates?: EmailTemplate | null;
}

interface EmailLog {
  id: string;
  automation_id: string | null;
  template_id: string | null;
  trigger_event: string;
  idempotency_key: string;
  recipient_email: string;
  recipient_name: string | null;
  subject: string | null;
  status: 'sent' | 'failed' | 'skipped';
  resend_message_id: string | null;
  error_message: string | null;
  created_at: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TRIGGER_LABELS: Record<string, string> = {
  user_registered: 'User Registered',
  first_invoice_created: 'First Invoice Created',
  invoice_sent: 'Invoice Sent',
  invoice_paid: 'Invoice Paid',
  invoice_overdue: 'Invoice Overdue',
  pro_subscription_activated: 'Pro Plan Subscribed',
  feature_announcement: 'Feature Announcement',
  user_inactive: 'User Inactive (30d)',
};

const TRIGGER_COLORS: Record<string, string> = {
  user_registered: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  first_invoice_created: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  invoice_sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  invoice_paid: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  invoice_overdue: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  pro_subscription_activated: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-300/50',
  feature_announcement: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  user_inactive: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
};

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
  sent: {
    label: 'Sent',
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  failed: {
    label: 'Failed',
    icon: <XCircle className="h-3.5 w-3.5" />,
    cls: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
  skipped: {
    label: 'Skipped',
    icon: <MinusCircle className="h-3.5 w-3.5" />,
    cls: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  },
};

const fmtDate = (d: string | null) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const SAMPLE_VARS: Record<string, string> = {
  userName: 'John Doe',
  userEmail: 'john@example.com',
  invoiceNumber: '1042',
  invoiceAmount: '₹12,500.00',
  invoiceDueDate: '15 Aug 2026',
  companyName: 'Invoicely',
  featureTitle: 'Recurring Invoices',
  featureDescription: 'Automatically generate and send recurring invoices on a schedule you set.',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.skipped;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
};

const TriggerBadge = ({ event }: { event: string }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${TRIGGER_COLORS[event] ?? 'bg-slate-100 text-slate-600'}`}>
    <Zap className="h-2.5 w-2.5" />
    {TRIGGER_LABELS[event] ?? event}
  </span>
);

// ─── Edit Automation Modal ────────────────────────────────────────────────────

const EditAutomationModal = ({
  automation,
  templates,
  open,
  onClose,
  onSaved,
}: {
  automation: EmailAutomation | null;
  templates: EmailTemplate[];
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) => {
  const [subject, setSubject] = useState('');
  const [delayMinutes, setDelayMinutes] = useState(0);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (automation) {
      setSubject(automation.email_templates?.subject ?? '');
      setDelayMinutes(automation.delay_minutes ?? 0);
      setSelectedTemplateId(automation.template_id ?? '');
    }
  }, [automation]);

  const handleSave = async () => {
    if (!automation) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('email_automations')
        .update({ delay_minutes: delayMinutes, template_id: selectedTemplateId || null })
        .eq('id', automation.id);
      if (error) throw error;

      // Also update template subject if changed
      if (selectedTemplateId && subject !== automation.email_templates?.subject) {
        await supabase.from('email_templates').update({ subject }).eq('id', selectedTemplateId);
      }

      toast.success('Automation updated successfully');
      onSaved();
      onClose();
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (!automation) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="h-4 w-4 text-amber-500" />
            Edit Automation
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Trigger Event</Label>
            <div className="mt-1">
              <TriggerBadge event={automation.trigger_event} />
            </div>
          </div>
          <div>
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Template</Label>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">— No template —</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Subject</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 text-sm"
              placeholder="e.g. Welcome to Invoicely, {{userName}}!"
            />
          </div>
          <div>
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Send Delay (minutes after event)
            </Label>
            <Input
              type="number"
              min={0}
              value={delayMinutes}
              onChange={(e) => setDelayMinutes(Number(e.target.value))}
              className="mt-1 text-sm w-32"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button
            size="sm"
            disabled={saving}
            onClick={handleSave}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Preview Email Modal ──────────────────────────────────────────────────────

const PreviewEmailModal = ({
  template,
  open,
  onClose,
}: {
  template: EmailTemplate | null;
  open: boolean;
  onClose: () => void;
}) => {
  if (!template) return null;
  const resolveTemplate = (text: string) =>
    text.replace(/\{\{(\w+)\}\}/g, (_, key) => SAMPLE_VARS[key] ?? `{{${key}}}`);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-amber-500" />
            Email Preview — {template.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-xs">
            <span className="text-slate-400 font-medium">Subject: </span>
            <span className="text-slate-800 dark:text-slate-200 font-semibold">{resolveTemplate(template.subject)}</span>
          </div>
          <div
            className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
            dangerouslySetInnerHTML={{ __html: resolveTemplate(template.html_body) }}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Feature Broadcast Modal ──────────────────────────────────────────────────

const FeatureBroadcastModal = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const session = useSession();
  const [featureTitle, setFeatureTitle] = useState('');
  const [featureDescription, setFeatureDescription] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!featureTitle.trim()) {
      toast.error('Feature title is required');
      return;
    }
    setSending(true);
    try {
      // Fetch all users from auth.users via a service-role-accessible query
      // We trigger from the admin; use the session email as a test recipient
      const recipientEmail = session?.user?.email ?? 'admin@invoicely.app';
      const idempotencyKey = `feature_announcement_${Date.now()}`;

      const { data, error } = await supabase.functions.invoke('trigger-automation-email', {
        body: {
          triggerEvent: 'feature_announcement',
          idempotencyKey,
          recipientEmail,
          recipientName: 'Invoicely User',
          variables: {
            userName: 'Invoicely User',
            featureTitle: featureTitle.trim(),
            featureDescription: featureDescription.trim() || featureTitle.trim(),
          },
        },
      });
      if (error) throw error;
      toast.success('Feature announcement sent!');
      onClose();
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-amber-500" />
            Send Feature Announcement
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            This sends a product update email to the configured recipient. In production, wire this to your users table to broadcast to all active users.
          </p>
          <div>
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Feature Title *</Label>
            <Input
              value={featureTitle}
              onChange={(e) => setFeatureTitle(e.target.value)}
              className="mt-1 text-sm"
              placeholder="e.g. Recurring Invoices"
            />
          </div>
          <div>
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Feature Description</Label>
            <Textarea
              value={featureDescription}
              onChange={(e) => setFeatureDescription(e.target.value)}
              className="mt-1 text-sm"
              rows={3}
              placeholder="Describe the new feature..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button
            size="sm"
            disabled={sending || !featureTitle.trim()}
            onClick={handleSend}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Send className="h-4 w-4 mr-1" />}
            Send Announcement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Backfill Email Modal (With Sent List & Resend) ───────────────────────────

const BackfillEmailModal = ({
  automation,
  open,
  onClose,
  onSuccess,
}: {
  automation: EmailAutomation | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'pending' | 'sent'>('pending');
  const [loading, setLoading] = useState(true);
  const [missingUsers, setMissingUsers] = useState<Array<{ id: string; email: string; name: string; created_at?: string }>>([]);
  const [sentLogs, setSentLogs] = useState<Array<EmailLog>>([]);
  const [sending, setSending] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [manualEmail, setManualEmail] = useState('');
  const [manualName, setManualName] = useState('');
  const [sendingManual, setSendingManual] = useState(false);

  const triggerEvent = automation?.trigger_event ?? 'user_registered';
  const eventLabel = automation?.label ?? TRIGGER_LABELS[triggerEvent] ?? triggerEvent;

  const handleManualSend = async () => {
    if (!manualEmail.trim()) {
      toast.error('Recipient email address is required');
      return;
    }
    setSendingManual(true);
    try {
      const name = manualName.trim() || manualEmail.trim().split('@')[0];
      const idempotencyKey = `manual_${triggerEvent}_${Date.now()}`;

      const { data, error } = await supabase.functions.invoke('trigger-automation-email', {
        body: {
          triggerEvent,
          idempotencyKey,
          recipientEmail: manualEmail.trim(),
          recipientName: name,
          variables: {
            userName: name,
            userEmail: manualEmail.trim(),
          },
        },
      });

      if (error) throw error;
      if (data?.success) {
        toast.success(`Email sent directly to ${manualEmail.trim()}!`);
        setManualEmail('');
        setManualName('');
        scanUsers();
        onSuccess();
      } else {
        toast.error(data?.error ?? 'Send failed');
      }
    } catch (e: any) {
      toast.error('Send failed: ' + (e.message || 'Unknown error'));
    } finally {
      setSendingManual(false);
    }
  };

  const scanUsers = useCallback(async () => {
    if (!open || !automation) return;
    setLoading(true);
    try {
      // 1. Fetch profiles
      let rawProfiles: any[] = [];
      try {
        const rpcRes = await supabase.rpc('get_all_profiles' as any);
        if (rpcRes.data && Array.isArray(rpcRes.data)) {
          rawProfiles = rpcRes.data;
        } else {
          const { data: pData } = await supabase.from('profiles').select('*');
          rawProfiles = pData || [];
        }
      } catch {
        const { data: pData } = await supabase.from('profiles').select('*');
        rawProfiles = pData || [];
      }

      let targetProfiles = rawProfiles;
      if (triggerEvent === 'pro_subscription_activated') {
        targetProfiles = rawProfiles.filter(
          (p) => p.tier && String(p.tier).toLowerCase().includes('pro')
        );
      }

      // 2. Fetch email logs for this trigger event
      const { data: logData } = await supabase
        .from('email_logs')
        .select('*')
        .eq('trigger_event', triggerEvent)
        .order('created_at', { ascending: false });

      const logsList = (logData || []) as EmailLog[];
      setSentLogs(logsList);

      const sentKeys = new Set(logsList.map((l) => l.idempotency_key));

      const missing = targetProfiles
        .filter((p) => {
          const uid = p.user_id || p.id;
          if (!uid || !p.email) return false;
          const key = `${triggerEvent}_${uid}`;
          return !sentKeys.has(key);
        })
        .map((p) => ({
          id: p.user_id || p.id,
          email: p.email,
          name: p.full_name || p.email.split('@')[0] || 'there',
          created_at: p.created_at,
        }));

      setMissingUsers(missing);
    } catch (e: any) {
      toast.error('Failed to scan user database: ' + (e.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [open, automation, triggerEvent]);

  useEffect(() => {
    if (open) {
      scanUsers();
      setProgress(0);
      setActiveSubTab('pending');
    }
  }, [open, scanUsers]);

  const handleSingleResend = async (userEmail: string, userName?: string | null, logId?: string) => {
    setResendingId(userEmail);
    try {
      if (logId) {
        await supabase.from('email_logs').delete().eq('id', logId);
      }
      const idempotencyKey = `resend_${triggerEvent}_${Date.now()}`;

      const { data, error } = await supabase.functions.invoke('trigger-automation-email', {
        body: {
          triggerEvent,
          idempotencyKey,
          recipientEmail: userEmail,
          recipientName: userName || userEmail.split('@')[0],
          variables: {
            userName: userName || userEmail.split('@')[0],
            userEmail: userEmail,
          },
        },
      });

      if (error) throw error;
      if (data?.success) {
        toast.success(`Email successfully resent to ${userEmail}`);
        scanUsers();
        onSuccess();
      } else {
        toast.error(data?.error ?? 'Resend failed');
      }
    } catch (e: any) {
      toast.error('Resend failed: ' + (e.message || 'Unknown error'));
    } finally {
      setResendingId(null);
    }
  };

  const handleStartBackfill = async () => {
    if (missingUsers.length === 0 || !automation) return;
    setSending(true);
    setProgress(0);

    let successCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    for (let i = 0; i < missingUsers.length; i++) {
      const user = missingUsers[i];
      try {
        const idempotencyKey = `${triggerEvent}_${user.id}`;
        const { data, error } = await supabase.functions.invoke('trigger-automation-email', {
          body: {
            triggerEvent,
            idempotencyKey,
            recipientEmail: user.email,
            recipientName: user.name,
            variables: {
              userName: user.name,
              userEmail: user.email,
            },
          },
        });

        if (error) {
          failedCount++;
        } else if (data?.skipped) {
          skippedCount++;
        } else if (data?.success) {
          successCount++;
        } else {
          failedCount++;
        }
      } catch {
        failedCount++;
      }

      setProgress(i + 1);
    }

    setSending(false);
    toast.success(`Backfill finished! Sent: ${successCount}, Skipped: ${skippedCount}, Failed: ${failedCount}`);
    onSuccess();
    scanUsers();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !sending && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-amber-500" />
            Recipients & Resend — {eventLabel}
          </DialogTitle>
        </DialogHeader>

        {/* Quick Direct Send (Manual user send, e.g. Gopal Benu) */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            ⚡ Quick Direct Send (Send to specific email, e.g. Gopal Benu)
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="User Name (optional)"
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              className="text-xs h-8"
            />
            <Input
              placeholder="user@example.com *"
              type="email"
              value={manualEmail}
              onChange={(e) => setManualEmail(e.target.value)}
              className="text-xs h-8"
            />
            <Button
              size="sm"
              disabled={sendingManual || !manualEmail.trim()}
              onClick={handleManualSend}
              className="h-8 px-3 text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold flex-shrink-0"
            >
              {sendingManual ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5 mr-1" />}
              Send Email
            </Button>
          </div>
        </div>

        {/* View Sub-Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-4 pt-1 text-xs">
          <button
            onClick={() => setActiveSubTab('pending')}
            className={`pb-2 font-semibold transition-all border-b-2 ${
              activeSubTab === 'pending'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            Unsent / Pending ({missingUsers.length})
          </button>
          <button
            onClick={() => setActiveSubTab('sent')}
            className={`pb-2 font-semibold transition-all border-b-2 ${
              activeSubTab === 'sent'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            Already Sent Logs ({sentLogs.length})
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 py-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
              <p className="text-xs text-slate-500">Scanning user database and email logs...</p>
            </div>
          ) : activeSubTab === 'pending' ? (
            /* PENDING TAB */
            missingUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 rounded-xl border border-dashed border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 text-center p-6">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-2" />
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">All set! No missing emails.</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                  Every target user in your database has already received this email. Switch to the <strong>Already Sent Logs</strong> tab to view or resend.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs">
                  <span className="font-medium text-amber-900 dark:text-amber-200">
                    Users needing email ({eventLabel}):
                  </span>
                  <span className="font-bold text-amber-700 dark:text-amber-300 text-sm bg-white dark:bg-amber-900/50 px-2.5 py-0.5 rounded-md">
                    {missingUsers.length} users
                  </span>
                </div>

                <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden max-h-60 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-900 sticky top-0 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="text-left p-2.5 font-semibold text-slate-500">User / Name</th>
                        <th className="text-left p-2.5 font-semibold text-slate-500">Email</th>
                        <th className="text-left p-2.5 font-semibold text-slate-500">Joined</th>
                        <th className="p-2.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {missingUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                          <td className="p-2.5 font-medium text-slate-800 dark:text-slate-200">{u.name}</td>
                          <td className="p-2.5 text-slate-500 dark:text-slate-400 font-mono">{u.email}</td>
                          <td className="p-2.5 text-slate-400">{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                          <td className="p-2.5 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={resendingId === u.email || sending}
                              onClick={() => handleSingleResend(u.email, u.name)}
                              className="h-6 px-2 text-[10px] gap-1 border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400"
                            >
                              {resendingId === u.email ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                              Send Now
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {sending && (
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-amber-600 dark:text-amber-400">Sending emails...</span>
                      <span>{progress} / {missingUsers.length}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 transition-all duration-300"
                        style={{ width: `${(progress / missingUsers.length) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          ) : (
            /* SENT TAB WITH RESEND BUTTON */
            sentLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center p-6">
                <Mail className="h-10 w-10 text-slate-300 mb-2" />
                <p className="text-xs text-slate-500">No emails logged yet for this trigger event.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-xs">
                  <span className="font-medium text-emerald-900 dark:text-emerald-200">
                    Emails delivered / logged:
                  </span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-300 text-sm bg-white dark:bg-emerald-900/50 px-2.5 py-0.5 rounded-md">
                    {sentLogs.length} logs
                  </span>
                </div>

                <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden max-h-60 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-900 sticky top-0 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="text-left p-2.5 font-semibold text-slate-500">Recipient</th>
                        <th className="text-left p-2.5 font-semibold text-slate-500">Status</th>
                        <th className="text-left p-2.5 font-semibold text-slate-500">Sent At</th>
                        <th className="p-2.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {sentLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                          <td className="p-2.5">
                            <p className="font-medium text-slate-800 dark:text-slate-200">{log.recipient_name || log.recipient_email}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{log.recipient_email}</p>
                          </td>
                          <td className="p-2.5">
                            <StatusBadge status={log.status} />
                          </td>
                          <td className="p-2.5 text-slate-400">{fmtDate(log.created_at)}</td>
                          <td className="p-2.5 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={resendingId === log.recipient_email}
                              onClick={() => handleSingleResend(log.recipient_email, log.recipient_name, log.id)}
                              className="h-6 px-2 text-[10px] gap-1 border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400"
                            >
                              {resendingId === log.recipient_email ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <RotateCcw className="h-3 w-3" />
                              )}
                              Resend
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          )}
        </div>

        <DialogFooter className="border-t border-slate-100 dark:border-slate-800 pt-3">
          <Button variant="outline" size="sm" onClick={onClose} disabled={sending}>
            Close
          </Button>
          {activeSubTab === 'pending' && missingUsers.length > 0 && (
            <Button
              size="sm"
              disabled={sending || loading}
              onClick={handleStartBackfill}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold gap-1.5"
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending ({progress}/{missingUsers.length})
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Email to {missingUsers.length} Users
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Automations Tab ──────────────────────────────────────────────────────────

const AutomationsTab = ({
  automations,
  templates,
  loading,
  onRefresh,
}: {
  automations: EmailAutomation[];
  templates: EmailTemplate[];
  loading: boolean;
  onRefresh: () => void;
}) => {
  const session = useSession();
  const [editTarget, setEditTarget] = useState<EmailAutomation | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [sendingTest, setSendingTest] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [backfillTarget, setBackfillTarget] = useState<EmailAutomation | null>(null);

  const handleToggle = async (automation: EmailAutomation) => {
    setTogglingId(automation.id);
    try {
      const { error } = await supabase
        .from('email_automations')
        .update({ enabled: !automation.enabled })
        .eq('id', automation.id);
      if (error) throw error;
      toast.success(`Automation ${!automation.enabled ? 'enabled' : 'disabled'}`);
      onRefresh();
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to toggle');
    } finally {
      setTogglingId(null);
    }
  };

  const handleSendTest = async (automation: EmailAutomation) => {
    const recipientEmail = session?.user?.email;
    if (!recipientEmail) {
      toast.error('Could not determine admin email');
      return;
    }
    setSendingTest(automation.id);
    try {
      const idempotencyKey = `test_${automation.trigger_event}_${session?.user?.id}_${Date.now()}`;
      const { data, error } = await supabase.functions.invoke('trigger-automation-email', {
        body: {
          triggerEvent: automation.trigger_event,
          idempotencyKey,
          recipientEmail,
          recipientName: 'Admin (Test)',
          variables: {
            userName: 'Admin (Test)',
            userEmail: recipientEmail,
            invoiceNumber: '1042',
            invoiceAmount: '₹12,500.00',
            invoiceDueDate: '15 Aug 2026',
            featureTitle: 'Test Feature',
            featureDescription: 'This is a test feature announcement.',
          },
        },
      });
      if (error) throw error;
      if (data?.skipped) {
        toast.info('Email skipped (automation disabled or duplicate)');
      } else if (data?.success) {
        toast.success(`Test email sent to ${recipientEmail}`);
      } else {
        toast.error(data?.error ?? 'Send failed');
      }
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to send test');
    } finally {
      setSendingTest(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3 mt-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3 mt-4">
      {automations.map((automation) => {
        const isLoading = togglingId === automation.id || sendingTest === automation.id;
        return (
          <Card
            key={automation.id}
            className={`border-slate-200/80 dark:border-slate-800/80 transition-all ${
              automation.enabled
                ? 'bg-white dark:bg-slate-900'
                : 'bg-slate-50 dark:bg-slate-900/50 opacity-70'
            }`}
          >
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Enable toggle */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Switch
                    id={`auto-${automation.id}`}
                    checked={automation.enabled}
                    disabled={isLoading}
                    onCheckedChange={() => handleToggle(automation)}
                    className="data-[state=checked]:bg-amber-500"
                  />
                  {togglingId === automation.id && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                      {automation.label}
                    </span>
                    <TriggerBadge event={automation.trigger_event} />
                    {automation.delay_minutes > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        <Clock className="h-2.5 w-2.5" />
                        +{automation.delay_minutes}m delay
                      </span>
                    )}
                    {automation.trigger_event === 'user_inactive' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400">
                        <AlertCircle className="h-2.5 w-2.5" />
                        Requires cron job
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {automation.description}
                  </p>
                  {automation.email_templates && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                      ✉️ {automation.email_templates.subject}
                    </p>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
                  <div className="text-center hidden sm:block">
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-base">
                      {automation.send_count}
                    </p>
                    <p>Sent</p>
                  </div>
                  <div className="text-center hidden md:block">
                    <p className="font-semibold text-slate-700 dark:text-slate-300 text-xs">
                      {automation.last_sent_at ? fmtDate(automation.last_sent_at) : '—'}
                    </p>
                    <p>Last sent</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {(automation.trigger_event === 'user_registered' || automation.trigger_event === 'pro_subscription_activated') && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-xs border-violet-300 text-violet-700 dark:border-violet-700 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 font-medium"
                      onClick={() => setBackfillTarget(automation)}
                    >
                      <Users className="h-3.5 w-3.5" />
                      Backfill Past Users
                    </Button>
                  )}
                  {automation.trigger_event === 'feature_announcement' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-xs border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                      onClick={() => setBroadcastOpen(true)}
                    >
                      <Megaphone className="h-3.5 w-3.5" />
                      Send Now
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={sendingTest === automation.id}
                      className="gap-1.5 text-xs"
                      onClick={() => handleSendTest(automation)}
                    >
                      {sendingTest === automation.id
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <FlaskConical className="h-3.5 w-3.5" />
                      }
                      Test
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs"
                    onClick={() => {
                      if (automation.email_templates) setPreviewTemplate(automation.email_templates);
                    }}
                    disabled={!automation.email_templates}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs"
                    onClick={() => setEditTarget(automation)}
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      <EditAutomationModal
        automation={editTarget}
        templates={templates}
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSaved={onRefresh}
      />
      <PreviewEmailModal
        template={previewTemplate}
        open={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
      />
      <FeatureBroadcastModal
        open={broadcastOpen}
        onClose={() => setBroadcastOpen(false)}
      />
      <BackfillEmailModal
        automation={backfillTarget}
        open={!!backfillTarget}
        onClose={() => setBackfillTarget(null)}
        onSuccess={onRefresh}
      />
    </div>
  );
};

// ─── Templates Tab ─────────────────────────────────────────────────────────────

const TemplatesTab = ({
  templates,
  loading,
  onRefresh,
}: {
  templates: EmailTemplate[];
  loading: boolean;
  onRefresh: () => void;
}) => {
  const [editing, setEditing] = useState<EmailTemplate | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);

  const startEdit = (tpl: EmailTemplate) => {
    setEditing(tpl);
    setEditSubject(tpl.subject);
    setEditBody(tpl.html_body);
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditSubject('');
    setEditBody('');
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('email_templates')
        .update({ subject: editSubject, html_body: editBody })
        .eq('id', editing.id);
      if (error) throw error;
      toast.success('Template saved');
      cancelEdit();
      onRefresh();
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3 mt-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      {templates.map((tpl) => {
        const isEditing = editing?.id === tpl.id;
        return (
          <Card key={tpl.id} className="border-slate-200/80 dark:border-slate-800/80">
            <CardContent className="p-4 space-y-3">
              {/* Header row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">{tpl.name}</span>
                    <TriggerBadge event={tpl.trigger_event} />
                  </div>
                  {!isEditing && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                      Subject: {tpl.subject}
                    </p>
                  )}
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => setPreviewTemplate(tpl)}>
                    <Eye className="h-3.5 w-3.5" /> Preview
                  </Button>
                  {!isEditing ? (
                    <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => startEdit(tpl)}>
                      <Edit3 className="h-3.5 w-3.5" /> Edit
                    </Button>
                  ) : (
                    <>
                      <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={cancelEdit}>
                        <X className="h-3.5 w-3.5" /> Cancel
                      </Button>
                      <Button
                        size="sm"
                        disabled={saving}
                        className="gap-1 text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
                        onClick={saveEdit}
                      >
                        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                        Save
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Variables pills */}
              <div className="flex flex-wrap gap-1.5">
                {tpl.variables.map((v) => (
                  <span
                    key={v}
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                  >
                    {v}
                  </span>
                ))}
              </div>

              {/* Edit fields */}
              {isEditing && (
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Subject</Label>
                    <Input
                      value={editSubject}
                      onChange={(e) => setEditSubject(e.target.value)}
                      className="mt-1 text-sm font-medium"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      HTML Body
                      <span className="ml-1 text-slate-400 normal-case font-normal">(supports {'{{'}'variable'{'}}'}  syntax)</span>
                    </Label>
                    <Textarea
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      className="mt-1 text-xs font-mono min-h-[200px]"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      <PreviewEmailModal
        template={previewTemplate}
        open={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
      />
    </div>
  );
};

// ─── Logs Tab ─────────────────────────────────────────────────────────────────

const LogsTab = ({
  logs,
  loading,
  onRefresh,
}: {
  logs: EmailLog[];
  loading: boolean;
  onRefresh: () => void;
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'sent' | 'failed' | 'skipped'>('all');
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const filtered = filterStatus === 'all' ? logs : logs.filter((l) => l.status === filterStatus);

  const handleRetry = async (log: EmailLog) => {
    setRetryingId(log.id);
    try {
      // Delete old log to allow re-send with same idempotency key
      await supabase.from('email_logs').delete().eq('id', log.id);

      const { data, error } = await supabase.functions.invoke('trigger-automation-email', {
        body: {
          triggerEvent: log.trigger_event,
          idempotencyKey: log.idempotency_key,
          recipientEmail: log.recipient_email,
          recipientName: log.recipient_name ?? undefined,
        },
      });
      if (error) throw error;
      toast.success('Email retried successfully');
      onRefresh();
    } catch (e: any) {
      toast.error(e.message ?? 'Retry failed');
    } finally {
      setRetryingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2 mt-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['all', 'sent', 'failed', 'skipped'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              filterStatus === s
                ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-amber-400'
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
              filterStatus === s ? 'bg-slate-950/20' : 'bg-slate-100 dark:bg-slate-800'
            }`}>
              {s === 'all' ? logs.length : logs.filter((l) => l.status === s).length}
            </span>
          </button>
        ))}
        <Button size="sm" variant="outline" onClick={onRefresh} className="ml-auto gap-1.5 text-xs">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      {/* Logs table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
          <Mail className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No email logs yet</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Logs will appear here once automations start firing.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200/80 dark:border-slate-800/80">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Recipient</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">Trigger</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">Subject</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell">Resend ID</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell">Timestamp</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100 text-xs truncate max-w-[140px]">
                          {log.recipient_name ?? log.recipient_email}
                        </p>
                        <p className="text-slate-400 text-[10px] truncate max-w-[140px]">{log.recipient_email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <TriggerBadge event={log.trigger_event} />
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-[180px]">
                        {log.subject ?? '—'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={log.status} />
                      {log.error_message && (
                        <p className="text-[10px] text-red-500 mt-0.5 max-w-[120px] truncate" title={log.error_message}>
                          {log.error_message}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
                        {log.resend_message_id ? log.resend_message_id.slice(0, 12) + '…' : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs text-slate-500 dark:text-slate-400">{fmtDate(log.created_at)}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {(log.status === 'failed' || log.status === 'sent') && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={retryingId === log.id}
                          onClick={() => handleRetry(log)}
                          className="gap-1 text-xs h-7 border-slate-200 dark:border-slate-700 hover:border-amber-400"
                        >
                          {retryingId === log.id
                            ? <Loader2 className="h-3 w-3 animate-spin" />
                            : <RotateCcw className="h-3 w-3 text-amber-500" />
                          }
                          {log.status === 'failed' ? 'Retry' : 'Resend'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────

export const AdminEmailAutomation: React.FC = () => {
  const [automations, setAutomations] = useState<EmailAutomation[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('automations');

  const fetchAutomations = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_automations')
        .select('*, email_templates(*)')
        .order('created_at', { ascending: true });
      if (error) throw error;
      setAutomations((data ?? []) as EmailAutomation[]);
    } catch (e: any) {
      toast.error('Failed to load automations: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTemplates = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      setTemplates((data ?? []) as EmailTemplate[]);
    } catch (e: any) {
      toast.error('Failed to load templates: ' + e.message);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      setLogs((data ?? []) as EmailLog[]);
    } catch (e: any) {
      toast.error('Failed to load logs: ' + e.message);
    } finally {
      setLogsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAutomations();
    fetchTemplates();
    fetchLogs();
  }, [fetchAutomations, fetchTemplates, fetchLogs]);

  const handleRefresh = () => {
    fetchAutomations();
    fetchTemplates();
    fetchLogs();
  };

  // Summary stats
  const enabledCount = automations.filter((a) => a.enabled).length;
  const totalSent = automations.reduce((sum, a) => sum + (a.send_count ?? 0), 0);
  const failedCount = logs.filter((l) => l.status === 'failed').length;

  return (
    <div className="space-y-8 pb-12 animate-fade-up max-w-6xl">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Mail className="h-6 w-6 text-amber-500" />
            Email Automation
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage automated emails sent to Invoicely users based on in-app events.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="gap-2 text-xs self-start sm:self-center"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {/* ── Stats Strip ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: 'Active Automations',
            value: `${enabledCount} / ${automations.length}`,
            icon: <Zap className="h-4 w-4" />,
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-50 dark:bg-amber-900/20',
          },
          {
            label: 'Total Emails Sent',
            value: totalSent.toLocaleString(),
            icon: <Send className="h-4 w-4" />,
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-50 dark:bg-emerald-900/20',
          },
          {
            label: 'Templates',
            value: templates.length,
            icon: <FileText className="h-4 w-4" />,
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-50 dark:bg-blue-900/20',
          },
          {
            label: 'Failed Sends',
            value: failedCount,
            icon: <XCircle className="h-4 w-4" />,
            color: failedCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400',
            bg: failedCount > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-slate-50 dark:bg-slate-900/50',
          },
        ].map((stat) => (
          <Card key={stat.label} className="border-slate-200/80 dark:border-slate-800/80">
            <CardContent className="p-4">
              <div className={`h-8 w-8 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center mb-2`}>
                {stat.icon}
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 h-10">
          <TabsTrigger value="automations" className="text-xs font-semibold gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
            <Zap className="h-3.5 w-3.5" />
            Automations
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px]">
              {automations.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="text-xs font-semibold gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
            <FileText className="h-3.5 w-3.5" />
            Templates
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px]">
              {templates.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="logs" className="text-xs font-semibold gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
            <BarChart2 className="h-3.5 w-3.5" />
            Email Logs
            {failedCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px]">
                {failedCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="automations" className="mt-0">
          <AutomationsTab
            automations={automations}
            templates={templates}
            loading={loading}
            onRefresh={() => { fetchAutomations(); fetchLogs(); }}
          />
        </TabsContent>

        <TabsContent value="templates" className="mt-0">
          <TemplatesTab
            templates={templates}
            loading={loading}
            onRefresh={() => { fetchTemplates(); fetchAutomations(); }}
          />
        </TabsContent>

        <TabsContent value="logs" className="mt-0">
          <LogsTab
            logs={logs}
            loading={logsLoading}
            onRefresh={fetchLogs}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminEmailAutomation;
