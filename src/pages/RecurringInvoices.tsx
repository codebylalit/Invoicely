import { useEffect, useState, useMemo } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  RefreshCw,
  Search,
  Plus,
  Trash2,
  Eye,
  Edit,
  TrendingUp,
  Loader2,
  Zap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { InvoiceForm } from "@/components/InvoiceForm";
import InvoicePreview from "@/components/InvoicePreview";
import type { Invoice } from "@/types/invoice";
import { useInvoiceManager } from "@/hooks/useInvoiceManager";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useEntitlements } from "@/hooks/useEntitlements";

const fmtCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);

const fmtDate = (d?: string | null) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getDaysUntilNextRun = (nextDateStr?: string | null) => {
  if (!nextDateStr) return null;
  const nextDate = new Date(nextDateStr);
  const today = new Date();
  const diffTime = nextDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const RecurringInvoices = () => {
  const supabase = useSupabaseClient();
  const session = useSession();
  const { toast } = useToast();
  const { isPro, isLoading: entitlementsLoading } = useEntitlements();
  const { saveInvoice, isSaving, getNextInvoiceNumber } = useInvoiceManager();

  const [recurringInvoices, setRecurringInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any | null>(null);
  const [invoiceDraft, setInvoiceDraft] = useState<Invoice | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Fetch all parent recurring invoices for this user
  const fetchRecurringInvoices = async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("user_id", session.user.id)
        .not("recurrence_frequency", "is", null)
        .is("parent_invoice_id", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRecurringInvoices(data || []);
    } catch (e: any) {
      toast({
        title: "Failed to load recurring invoices",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecurringInvoices();
  }, [session]);

  // Open Create Dialog with clean defaults
  const handleOpenCreate = async () => {
    setEditingInvoice(null);
    let nextNum = "1001";
    try {
      nextNum = await getNextInvoiceNumber();
    } catch (_) {
      nextNum = Math.floor(10000 + Math.random() * 90000).toString();
    }

    const defaultDraft: Invoice = {
      invoiceNumber: nextNum,
      invoiceTitle: "INVOICE",
      issuedDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      name: "",
      email: "",
      details: "",
      items: [{ id: "0", description: "", quantity: 1, unitPrice: 0, totalPrice: 0 }],
      subtotal: 0,
      total: 0,
      notes: "",
      paymentMethods: [],
      taxes: [],
      discounts: [],
      status: "draft",
      is_recurring: true,
      recurrence_frequency: "monthly",
      recurrence_interval: 1,
    };
    setInvoiceDraft(defaultDraft);
    setIsFormOpen(true);
  };

  // Open Edit Dialog with normalized invoice draft
  const handleOpenEdit = (inv: any) => {
    setEditingInvoice(inv);
    let rawItems = inv.items;
    if (typeof rawItems === 'string') {
      try { rawItems = JSON.parse(rawItems); } catch (_) { rawItems = []; }
    }
    if (!Array.isArray(rawItems)) rawItems = [];

    const normalizedItems = rawItems.map((it: any, idx: number) => {
      const q = Number(it.quantity) || 1;
      const rate = Number(it.unitPrice ?? it.rate ?? it.price ?? 0);
      const amt = Number(it.totalPrice ?? it.amount ?? (q * rate));
      return {
        id: String(it.id || idx),
        description: it.description || it.name || "Services Rendered",
        quantity: q,
        unitPrice: rate,
        totalPrice: amt,
      };
    });

    const draft: Invoice = {
      id: inv.id,
      invoiceNumber: inv.invoice_number || "",
      template_id: inv.template_id ?? null,
      name: inv.client_name || "",
      email: inv.client_email || "",
      issuedDate: inv.issued_date ? new Date(inv.issued_date).toISOString().split('T')[0] : "",
      dueDate: inv.due_date ? new Date(inv.due_date).toISOString().split('T')[0] : "",
      invoiceTitle: inv.invoice_title || "INVOICE",
      total: Number(inv.total) || 0,
      subtotal: Number(inv.subtotal) || 0,
      taxes: typeof inv.taxes === "object" ? inv.taxes : [],
      discounts: typeof inv.discounts === "object" ? inv.discounts : [],
      items: normalizedItems.length > 0 ? normalizedItems : [{ id: "0", description: "", quantity: 1, unitPrice: 0, totalPrice: 0 }],
      details: inv.details || "",
      notes: inv.notes || "",
      is_recurring: inv.is_recurring ?? true,
      recurrence_frequency: inv.recurrence_frequency || "monthly",
      recurrence_interval: inv.recurrence_interval || 1,
      recurrence_start_date: inv.recurrence_start_date,
      recurrence_end_date: inv.recurrence_end_date,
      status: inv.status || "draft",
    };

    setInvoiceDraft(draft);
    setIsFormOpen(true);
  };

  // Save invoice and close dialog
  const handleSaveAndClose = async () => {
    if (!invoiceDraft) return;
    try {
      const saved = await saveInvoice(invoiceDraft);
      if (saved) {
        setIsFormOpen(false);
        setInvoiceDraft(null);
        setEditingInvoice(null);
        fetchRecurringInvoices();
        toast({
          title: "Recurring Invoice Saved! 🔄",
          description: "Your invoice schedule has been saved successfully.",
        });
      }
    } catch (e: any) {
      toast({
        title: "Save failed",
        description: e.message,
        variant: "destructive",
      });
    }
  };

  // Toggle active/paused state for a recurring schedule
  const handleToggleActive = async (invoice: any) => {
    setTogglingId(invoice.id);
    const newStatus = !invoice.is_recurring;
    try {
      const { error } = await supabase
        .from("invoices")
        .update({ is_recurring: newStatus })
        .eq("id", invoice.id);

      if (error) throw error;

      toast({
        title: newStatus ? "Schedule Activated 🔄" : "Schedule Paused ⏸️",
        description: `Recurring schedule for ${invoice.client_name || "Invoice #" + invoice.invoice_number} is now ${newStatus ? "active" : "paused"}.`,
      });

      fetchRecurringInvoices();
    } catch (e: any) {
      toast({
        title: "Update failed",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setTogglingId(null);
    }
  };

  // Delete recurring schedule
  const handleDeleteSchedule = async (id: string) => {
    if (!confirm("Are you sure you want to stop this recurring schedule?")) return;
    try {
      const { error } = await supabase
        .from("invoices")
        .update({ is_recurring: false, recurrence_frequency: null })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Schedule Stopped",
        description: "This invoice will no longer auto-generate.",
      });

      fetchRecurringInvoices();
    } catch (e: any) {
      toast({
        title: "Delete failed",
        description: e.message,
        variant: "destructive",
      });
    }
  };

  // Calculated Stats
  const stats = useMemo(() => {
    const activeCount = recurringInvoices.filter(
      (inv) => inv.is_recurring === true
    ).length;

    // Monthly recurring value calculation
    const mrr = recurringInvoices.reduce((sum, inv) => {
      if (inv.is_recurring !== true) return sum;
      const amount = Number(inv.total || 0);
      const freq = inv.recurrence_frequency;
      const interval = inv.recurrence_interval || 1;

      if (freq === "weekly") return sum + (amount * 4) / interval;
      if (freq === "monthly") return sum + amount / interval;
      return sum + amount;
    }, 0);

    return {
      activeCount,
      totalCount: recurringInvoices.length,
      mrr,
    };
  }, [recurringInvoices]);

  // Filtered schedules
  const filteredSchedules = useMemo(() => {
    return recurringInvoices.filter((inv) => {
      const name = inv.client_name?.toLowerCase() || "";
      const email = inv.client_email?.toLowerCase() || "";
      const num = inv.invoice_number?.toLowerCase() || "";
      const query = searchQuery.toLowerCase();
      return name.includes(query) || email.includes(query) || num.includes(query);
    });
  }, [recurringInvoices, searchQuery]);
  if (entitlementsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        <p className="text-xs font-medium text-slate-500">Checking plan entitlements...</p>
      </div>
    );
  }

  if (!isPro) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center max-w-md mx-auto">
        <div className="h-16 w-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4">
          <Zap className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Pro Feature Locked</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-6">
          Recurring Invoices are exclusive to Invoicely Pro subscribers. Upgrade your plan to automate your billing.
        </p>
        <Button
          onClick={() => window.location.href = '/app/settings?tab=subscription'}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-2.5 rounded-xl shadow-md"
        >
          Upgrade to Pro
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-up max-w-7xl">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <RefreshCw className="h-7 w-7 text-amber-500" />
            Recurring Invoices
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Automate retainer billing, subscriptions, and recurring client invoices.
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm gap-2 rounded-xl self-start sm:self-center shadow-md shadow-amber-500/20"
        >
          <Plus className="h-4 w-4" />
          Create Recurring Invoice
        </Button>
      </div>

      {/* ── Stats Strip ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Active Schedules</p>
              <p className="text-xl font-bold text-foreground">
                {stats.activeCount} <span className="text-xs font-normal text-muted-foreground">/ {stats.totalCount} total</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Est. Monthly Recurring (MRR)</p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {fmtCurrency(stats.mrr)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Automation Worker</p>
              <p className="text-xs font-bold text-foreground flex items-center gap-1.5 mt-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Active (Every 24 hrs)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Search Bar ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search recurring schedules by client or invoice number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs sm:text-sm rounded-xl border-border bg-background"
          />
        </div>
      </div>

      {/* ── Content Table ─────────────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : filteredSchedules.length === 0 ? (
        <Card className="border-dashed border-border py-12 text-center">
          <CardContent className="flex flex-col items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
              <RefreshCw className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-foreground text-base">No recurring schedules found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Create an invoice and toggle "Make recurring" to set up automatic retainer billing.
            </p>
            <Button
              onClick={handleOpenCreate}
              className="mt-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs gap-2 rounded-xl"
            >
              <Plus className="h-4 w-4" />
              Create First Recurring Schedule
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-2xl border border-border/80 overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm text-left">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground uppercase text-[11px] font-semibold tracking-wider">
                  <th className="px-4 py-3">Client / Invoice</th>
                  <th className="px-4 py-3">Frequency</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Next Execution</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredSchedules.map((schedule) => {
                  const daysUntil = getDaysUntilNextRun(schedule.next_recurrence_date);
                  const isActive = schedule.is_recurring === true;

                  return (
                    <tr key={schedule.id} className="hover:bg-muted/30 transition-colors">
                      {/* Client info */}
                      <td className="px-4 py-3">
                        <div className="font-semibold text-foreground">
                          {schedule.client_name || "Valued Client"}
                        </div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-amber-600 dark:text-amber-400">
                            #{schedule.invoice_number}
                          </span>
                          {schedule.client_email && (
                            <>
                              <span>•</span>
                              <span>{schedule.client_email}</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Frequency */}
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-[11px] capitalize font-medium">
                          {schedule.recurrence_frequency || "Monthly"}
                          {schedule.recurrence_interval > 1 && ` (Every ${schedule.recurrence_interval}s)`}
                        </Badge>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3 font-bold text-foreground">
                        {fmtCurrency(Number(schedule.total || 0))}
                      </td>

                      {/* Next execution */}
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">
                          {fmtDate(schedule.next_recurrence_date)}
                        </div>
                        {daysUntil !== null && (
                          <div className="text-[10px] mt-0.5">
                            {daysUntil <= 0 ? (
                              <span className="text-amber-600 font-semibold">Due today</span>
                            ) : (
                              <span className="text-muted-foreground">In {daysUntil} days</span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Status toggle */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={isActive}
                            disabled={togglingId === schedule.id}
                            onCheckedChange={() => handleToggleActive(schedule)}
                            className="data-[state=checked]:bg-amber-500"
                          />
                          <span className={`text-xs font-semibold ${isActive ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
                            {isActive ? "Active" : "Paused"}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            title="Preview Invoice"
                            onClick={() => {
                              setViewingInvoice(schedule);
                              setIsPreviewOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            title="Edit Invoice"
                            onClick={() => handleOpenEdit(schedule)}
                          >
                            <Edit className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                            title="Stop Schedule"
                            onClick={() => handleDeleteSchedule(schedule.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Split-Screen Invoice Builder Workspace Dialog ─────────────────── */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="w-screen h-screen max-w-none max-h-none p-0 overflow-hidden rounded-none border-none">
          <DialogHeader className="px-4 md:px-6 pt-3 pb-3 border-b sticky top-0 bg-background z-10">
            <div className="flex justify-between items-center">
              <div>
                <DialogTitle className="text-base font-bold">
                  {editingInvoice ? "Edit Recurring Invoice" : "Create Recurring Invoice"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Build your recurring invoice on the left and see the real-time template preview on the right.
                </DialogDescription>
              </div>

              <div className="flex gap-2 items-center">
                <Button variant="secondary" size="sm" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={!invoiceDraft || isSaving}
                  onClick={handleSaveAndClose}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin text-slate-950" />
                      Saving...
                    </>
                  ) : (
                    "Save & Close"
                  )}
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="flex flex-col md:flex-row gap-2 p-4 h-[calc(100vh-70px)] overflow-hidden">
            {/* Left: Invoice Form */}
            <div className="flex-1 md:border-r md:border-border md:pr-4 overflow-y-auto">
              <InvoiceForm
                onGenerate={(generated) => setInvoiceDraft(generated)}
                isLoading={false}
                invoiceDraft={invoiceDraft}
                onDraftChange={(draft) => setInvoiceDraft(draft)}
              />
            </div>

            {/* Right: Real-time Invoice Preview */}
            <div className="flex-1 md:pl-4 overflow-y-auto">
              <InvoicePreview
                invoice={invoiceDraft}
                showSendByEmail={true}
                onTemplateChange={(templateId) =>
                  setInvoiceDraft((prev) =>
                    prev ? { ...prev, template_id: templateId } : prev
                  )
                }
                onPageSizeChange={(pageSize) =>
                  setInvoiceDraft((prev) =>
                    prev ? { ...prev, page_size: pageSize } : prev
                  )
                }
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Standalone Preview Dialog ───────────────────────────────────────── */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6">
          <DialogTitle className="text-lg font-bold">Recurring Invoice Preview</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mb-2">
            Preview how this recurring invoice looks.
          </DialogDescription>
          <InvoicePreview
            invoice={viewingInvoice}
            showSendByEmail={true}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecurringInvoices;

