import { useEffect, useState, useMemo } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Card, CardContent } from "@/components/ui/card";
import CreateInvoiceButton from "@/components/CreateInvoiceButton";
import ConditionalAd from "@/components/ConditionalAd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Eye,
  Trash2,
  Check,
  AlertCircle,
  Clock,
  FileText,
  Search,
  ChevronDown,
  Ban,
  CircleDollarSign,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import InvoicePreview from "@/components/InvoicePreview";
import { Dialog, DialogContent } from "@/components/ui/dialog";

// ─── Types ────────────────────────────────────────────────────────────────────
interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface PaymentMethod {
  type: string;
  isEnabled: boolean;
  instructions?: string;
  connectURL?: string;
}

// ─── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; dot: string; icon: React.ReactNode }
> = {
  paid: {
    label: "Paid",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    text: "text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-500",
    icon: <Check className="h-3.5 w-3.5" />,
  },
  pending: {
    label: "Pending",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    text: "text-amber-700 dark:text-amber-400",
    dot: "bg-amber-500",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  overdue: {
    label: "Overdue",
    bg: "bg-red-50 dark:bg-red-950/30",
    text: "text-red-700 dark:text-red-400",
    dot: "bg-red-500",
    icon: <AlertCircle className="h-3.5 w-3.5" />,
  },
  partial: {
    label: "Partial",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    text: "text-blue-700 dark:text-blue-400",
    dot: "bg-blue-500",
    icon: <CircleDollarSign className="h-3.5 w-3.5" />,
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-600 dark:text-gray-400",
    dot: "bg-gray-400",
    icon: <Ban className="h-3.5 w-3.5" />,
  },
  draft: {
    label: "Draft",
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-600 dark:text-gray-400",
    dot: "bg-gray-400",
    icon: <FileText className="h-3.5 w-3.5" />,
  },
};

const ALL_STATUSES = ["All", "Paid", "Pending", "Overdue", "Partial", "Cancelled", "Draft"];

const StatusBadge = ({ status }: { status: string }) => {
  const key = status?.toLowerCase() || "draft";
  const cfg = STATUS_CONFIG[key] || STATUS_CONFIG.draft;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
};

const fmtCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);

const fmtDate = (d?: string) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatInvoiceForPreview = (invoice: any) => {
  let parsedPaymentMethods: PaymentMethod[] = [];
  try {
    if (invoice.payment_methods) {
      parsedPaymentMethods =
        typeof invoice.payment_methods === "string"
          ? JSON.parse(invoice.payment_methods)
          : invoice.payment_methods;
    }
  } catch {
    // ignore
  }

  return {
    invoiceNumber: invoice.invoice_number,
    issuedDate: invoice.issued_date || invoice.created_at,
    dueDate: invoice.due_date,
    name: invoice.client_name,
    details: invoice.details,
    email: invoice.client_email,
    subtotal: invoice.subtotal || 0,
    total: invoice.total || 0,
    invoiceTitle: invoice.invoice_title || "Invoice",
    items: invoice.items || [],
    discounts: invoice.discounts || [],
    taxes: invoice.taxes || [],
    notes: invoice.notes || "",
    paymentMethods: parsedPaymentMethods.length
      ? parsedPaymentMethods
      : [
          { type: "bank", isEnabled: false, instructions: "" },
          { type: "stripe", isEnabled: false, connectURL: "" },
        ],
    is_recurring: invoice.is_recurring,
    recurrence_frequency: invoice.recurrence_frequency,
    recurrence_interval: invoice.recurrence_interval,
    recurrence_start_date: invoice.recurrence_start_date,
    recurrence_end_date: invoice.recurrence_end_date,
    parent_invoice_id: invoice.parent_invoice_id,
    next_recurrence_date: invoice.next_recurrence_date,
  };
};

// ─── Main Component ─────────────────────────────────────────────────────────
const Invoices = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewingInvoice, setViewingInvoice] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const supabase = useSupabaseClient();
  const { toast } = useToast();
  const [statsUpdateTrigger, setStatsUpdateTrigger] = useState(0);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setInvoices(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading invoices",
        description: error.message || "Failed to load invoices",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // ─── Filtered list ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch =
        !searchQuery ||
        inv.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.client_email?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        inv.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchQuery, statusFilter]);

  // ─── Status counts for filter tabs ───────────────────────────────────────
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { All: invoices.length };
    invoices.forEach((inv) => {
      const s = inv.status?.toLowerCase();
      if (s) {
        const key = s.charAt(0).toUpperCase() + s.slice(1);
        counts[key] = (counts[key] || 0) + 1;
      }
    });
    return counts;
  }, [invoices]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from("invoices").update({ status }).match({ id });
      if (error) throw error;
      setInvoices((prev) => prev.map((inv) => (inv.id === id ? { ...inv, status } : inv)));
      setStatsUpdateTrigger((p) => p + 1);
      toast({ title: "Status updated", description: `Marked as ${status}` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const { error } = await supabase.from("invoices").delete().match({ id: deleteTarget });
      if (error) throw error;
      setInvoices((prev) => prev.filter((inv) => inv.id !== deleteTarget));
      setStatsUpdateTrigger((p) => p + 1);
      toast({ title: "Invoice deleted" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleView = (invoice: any) => {
    setViewingInvoice(formatInvoiceForPreview(invoice));
    setIsPreviewOpen(true);
  };

  return (
    <div className="space-y-6 pb-4">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Invoices</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {invoices.length} total invoice{invoices.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchInvoices}
            disabled={loading}
            aria-label="Refresh invoices"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <CreateInvoiceButton />
        </div>
      </div>

      {/* ── Search + Filters ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by client name, invoice #, or email…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* ── Status Filter Tabs ───────────────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap">
        {ALL_STATUSES.map((s) => {
          const count = statusCounts[s] || 0;
          if (s !== "All" && count === 0) return null;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 border ${
                statusFilter === s
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {s}
              {count > 0 && (
                <span
                  className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                    statusFilter === s
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-dashed border-border bg-muted/30">
          <FileText className="h-12 w-12 text-muted-foreground/40 mb-3" />
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {invoices.length === 0 ? "No invoices yet" : "No results found"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-xs">
            {invoices.length === 0
              ? "Create your first invoice to start getting paid faster."
              : "Try adjusting your search or filter to find what you're looking for."}
          </p>
          {invoices.length === 0 && <CreateInvoiceButton />}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((inv) => (
            <InvoiceCard
              key={inv.id}
              invoice={inv}
              onView={() => handleView(inv)}
              onUpdateStatus={updateStatus}
              onDelete={() => setDeleteTarget(inv.id)}
            />
          ))}
        </div>
      )}

      {/* ── Invoice Preview Dialog ──────────────────────────────────────────── */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl w-full p-0 overflow-hidden">
          {viewingInvoice && (
            <div className="max-h-[90vh] overflow-y-auto p-6">
              <InvoicePreview invoice={viewingInvoice} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ─────────────────────────────────────────────── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The invoice will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ConditionalAd adSlot="1234567892" />
    </div>
  );
};

// ─── Invoice Card ─────────────────────────────────────────────────────────────
const InvoiceCard = ({
  invoice: inv,
  onView,
  onUpdateStatus,
  onDelete,
}: {
  invoice: any;
  onView: () => void;
  onUpdateStatus: (id: string, status: string) => void;
  onDelete: () => void;
}) => {
  const total = Number(inv.total) || 0;

  const fmtCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);

  const fmtDate = (d?: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Card className="border-border/60 hover:shadow-md hover:border-border transition-all duration-200 group overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-5">
          {/* Left: Invoice icon */}
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <FileText className="h-4 w-4 text-primary" />
          </div>

          {/* Middle: Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-semibold text-foreground text-sm">
                {inv.client_name || "Unnamed Client"}
              </span>
              {inv.is_recurring && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400">
                  <RefreshCw className="h-2.5 w-2.5" />
                  Recurring
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
              <span>#{inv.invoice_number || "Draft"}</span>
              <span>Issued {fmtDate(inv.issued_date || inv.created_at)}</span>
              <span>Due {fmtDate(inv.due_date)}</span>
            </div>
          </div>

          {/* Right: Amount + Status + Actions */}
          <div className="flex items-center gap-3 sm:flex-shrink-0 justify-between sm:justify-end w-full sm:w-auto">
            <div className="text-right">
              <p className="text-base font-bold text-foreground tabular-nums">
                {fmtCurrency(total)}
              </p>
            </div>

            <StatusBadge status={inv.status} />

            {/* Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  aria-label="Invoice actions"
                  className="h-8 w-8 p-0 flex-shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={onView} className="flex items-center gap-2">
                  <Eye className="h-4 w-4" /> View & Download
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onUpdateStatus(inv.id, "Paid")}
                  className="flex items-center gap-2 text-emerald-600"
                >
                  <Check className="h-4 w-4" /> Mark as Paid
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onUpdateStatus(inv.id, "Pending")}
                  className="flex items-center gap-2 text-amber-600"
                >
                  <Clock className="h-4 w-4" /> Mark as Pending
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onUpdateStatus(inv.id, "Overdue")}
                  className="flex items-center gap-2 text-red-600"
                >
                  <AlertCircle className="h-4 w-4" /> Mark as Overdue
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onUpdateStatus(inv.id, "Partial")}
                  className="flex items-center gap-2 text-blue-600"
                >
                  <CircleDollarSign className="h-4 w-4" /> Mark as Partial
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onUpdateStatus(inv.id, "Cancelled")}
                  className="flex items-center gap-2 text-gray-500"
                >
                  <Ban className="h-4 w-4" /> Mark as Cancelled
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onDelete}
                  className="flex items-center gap-2 text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Invoices;
