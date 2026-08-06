import { useEffect, useState, useMemo } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Trash2,
  Edit2,
  Plus,
  Phone,
  Mail,
  Building2,
  MapPin,
  AlertTriangle,
  Users,
  Search,
  FileText,
  ChevronRight,
  UserPlus,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import ConditionalAd from "@/components/ConditionalAd";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
  created_at?: string;
  invoice_count?: number;
  total_revenue?: number;
  pending_revenue?: number;
}

const FREE_TIER_LIMIT = 3;

const fmtCurrency = (v: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(v);

// ─── Main Component ─────────────────────────────────────────────────────────
const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [company, setCompany] = useState("");

  const session = useSession();
  const supabase = useSupabaseClient();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [userTier, setUserTier] = useState("free");

  useEffect(() => {
    if (session?.user?.id) {
      supabase
        .from("profiles")
        .select("tier")
        .eq("user_id", session.user.id)
        .single()
        .then(({ data }) => setUserTier(data?.tier || "free"));
    }
  }, [session]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      // ── Optimized: single query to get clients + invoice aggregates ──────
      const { data: clientsData, error: clientsError } = await supabase
        .from("clients")
        .select("*")
        .order("name", { ascending: true });

      if (clientsError) throw clientsError;

      // Fetch all invoices once (not N queries)
      const { data: invoicesData } = await supabase
        .from("invoices")
        .select("client_name, total, status");

      // Build aggregation map
      const invoiceMap: Record<string, { count: number; total: number; pending: number }> = {};
      (invoicesData || []).forEach((inv) => {
        const cn = inv.client_name || "";
        if (!invoiceMap[cn]) invoiceMap[cn] = { count: 0, total: 0, pending: 0 };
        invoiceMap[cn].count++;
        const t = Number(inv.total) || 0;
        const s = inv.status?.toLowerCase();
        if (s === "paid") invoiceMap[cn].total += t;
        else if (s === "pending" || s === "overdue") invoiceMap[cn].pending += t;
      });

      const enriched = (clientsData || []).map((c) => ({
        ...c,
        invoice_count: invoiceMap[c.name]?.count || 0,
        total_revenue: invoiceMap[c.name]?.total || 0,
        pending_revenue: invoiceMap[c.name]?.pending || 0,
      }));

      setClients(enriched);
    } catch (error: any) {
      toast({
        title: "Error loading clients",
        description: error.message || "Failed to load clients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [userTier]);

  const filtered = useMemo(
    () =>
      clients.filter(
        (c) =>
          !searchQuery ||
          c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.email?.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [clients, searchQuery]
  );

  const resetForm = () => {
    setName(""); setEmail(""); setPhone(""); setAddress(""); setCompany("");
    setCurrentClient(null); setIsEditing(false);
  };

  const openAddDialog = () => {
    if (userTier === "free" && clients.length >= FREE_TIER_LIMIT) {
      setUpgradeDialogOpen(true);
      return;
    }
    resetForm();
    setFormOpen(true);
  };

  const openEditDialog = (client: Client) => {
    setCurrentClient(client);
    setName(client.name);
    setEmail(client.email || "");
    setPhone(client.phone || "");
    setAddress(client.address || "");
    setCompany(client.company || "");
    setIsEditing(true);
    setFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing && userTier === "free" && clients.length >= FREE_TIER_LIMIT) {
      setUpgradeDialogOpen(true);
      return;
    }

    const clientData = {
      name, email: email || null, phone: phone || null,
      address: address || null, company: company || null,
      user_id: session!.user.id,
    };

    try {
      if (isEditing && currentClient) {
        const { error } = await supabase.from("clients").update(clientData).eq("id", currentClient.id);
        if (error) throw error;
        if (name !== currentClient.name) {
          await supabase.from("invoices").update({ client_name: name }).eq("client_name", currentClient.name);
        }
        toast({ title: "Client updated", description: `${name} has been updated successfully` });
      } else {
        const { error } = await supabase.from("clients").insert([clientData]);
        if (error) throw error;
        toast({ title: "Client added", description: `${name} has been added successfully` });
      }
      await fetchClients();
      setFormOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: isEditing ? "Error updating client" : "Error adding client",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    if ((deleteTarget.invoice_count || 0) > 0) {
      toast({
        title: "Cannot delete client",
        description: `${deleteTarget.name} has ${deleteTarget.invoice_count} invoices. Delete those invoices first.`,
        variant: "destructive",
      });
      setDeleteTarget(null);
      return;
    }
    try {
      const { error } = await supabase.from("clients").delete().eq("id", deleteTarget.id);
      if (error) throw error;
      setClients((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      if (selectedClient?.id === deleteTarget.id) setSelectedClient(null);
      toast({ title: "Client deleted", description: `${deleteTarget.name} has been deleted` });
    } catch (error: any) {
      toast({ title: "Error deleting client", description: error.message, variant: "destructive" });
    } finally {
      setDeleteTarget(null);
    }
  };

  const limitReached = userTier === "free" && clients.length >= FREE_TIER_LIMIT;

  return (
    <div className="space-y-6 pb-4">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-black tracking-tight"
            style={{ color: "#0A0A0A", fontFamily: "'Plus Jakarta Sans', 'Poppins', sans-serif" }}
          >
            Clients
          </h1>
          <p className="text-sm text-stone-400 mt-1">
            {clients.length} client{clients.length !== 1 ? "s" : ""}
            {userTier === "free" ? ` · Free plan: ${clients.length}/${FREE_TIER_LIMIT}` : ""}
          </p>
        </div>
        <button
          onClick={openAddDialog}
          disabled={limitReached}
          className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm text-white transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#0A0A0A" }}
        >
          <UserPlus className="h-4 w-4" />
          Add Client
        </button>
      </div>

      {/* ── Free Tier Banner ─────────────────────────────────────────────────── */}
      {limitReached && (
        <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              Free plan limit reached ({FREE_TIER_LIMIT} clients)
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
              Upgrade to Pro for unlimited clients and advanced features.
            </p>
          </div>
          <Button size="sm" onClick={() => navigate("/app/settings?tab=subscription")}>
            Upgrade to Pro
          </Button>
        </div>
      )}

      {/* ── Summary Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card className="border-stone-200/80 bg-white rounded-2xl">
          <CardContent className="p-4">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Total Clients</p>
            <p className="text-2xl font-black text-[#0A0A0A] tabular-nums">{clients.length}</p>
          </CardContent>
        </Card>
        <Card className="border-stone-200/80 bg-white rounded-2xl">
          <CardContent className="p-4">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">With Invoices</p>
            <p className="text-2xl font-black text-[#0A0A0A] tabular-nums">
              {clients.filter((c) => (c.invoice_count || 0) > 0).length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-stone-200/80 bg-white rounded-2xl col-span-2 sm:col-span-1">
          <CardContent className="p-4">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Total Revenue</p>
            <p className="text-2xl font-black text-[#0A0A0A] tabular-nums">
              {fmtCurrency(clients.reduce((s, c) => s + (c.total_revenue || 0), 0))}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Search ─────────────────────────────────────────────────────────── */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
        <input
          type="text"
          placeholder="Search clients by name, company or email…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-full border border-stone-200 bg-white text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
        />
      </div>

      {/* ── Client List ───────────────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-stone-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed border-stone-200 bg-stone-50/50">
          <div className="h-14 w-14 rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
            <Users className="h-7 w-7 text-amber-500" />
          </div>
          <h3 className="text-lg font-bold text-[#0A0A0A] mb-1">
            {clients.length === 0 ? "No clients yet" : "No results found"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-xs">
            {clients.length === 0
              ? "Add your first client to start creating invoices."
              : "Try adjusting your search query."}
          </p>
          {clients.length === 0 && (
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" /> Add Client
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onEdit={() => openEditDialog(client)}
              onDelete={() => setDeleteTarget(client)}
              onSelect={() => setSelectedClient(client === selectedClient ? null : client)}
              isSelected={selectedClient?.id === client.id}
            />
          ))}
        </div>
      )}

      {/* ── Add / Edit Dialog ─────────────────────────────────────────────────── */}
      <Dialog open={formOpen} onOpenChange={(o) => { setFormOpen(o); if (!o) resetForm(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Client" : "Add New Client"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update client details. Linked invoices will also be updated."
                : "Fill in the details for your new client."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="client-name">Full Name <span className="text-destructive">*</span></Label>
              <Input id="client-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="client-email">Email</Label>
              <Input id="client-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="client-phone">Phone</Label>
              <Input id="client-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="client-company">Company</Label>
              <Input id="client-company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Pvt Ltd" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="client-address">Address</Label>
              <Textarea id="client-address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main Street, Mumbai, 400001" rows={3} />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit">{isEditing ? "Save Changes" : "Add Client"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Upgrade Dialog ─────────────────────────────────────────────────────── */}
      <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <DialogContent className="sm:max-w-md text-center">
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Free Plan Limit Reached</h3>
              <p className="text-sm text-muted-foreground mt-1.5 max-w-xs mx-auto">
                You can manage up to {FREE_TIER_LIMIT} clients on the free plan. Upgrade to Pro for unlimited clients.
              </p>
            </div>
            <div className="flex gap-3 w-full">
              <Button variant="outline" className="flex-1" onClick={() => setUpgradeDialogOpen(false)}>Cancel</Button>
              <Button
                className="flex-1"
                onClick={() => { navigate("/app/settings?tab=subscription"); setUpgradeDialogOpen(false); }}
              >
                Upgrade to Pro
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ────────────────────────────────────────────────── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              {(deleteTarget?.invoice_count || 0) > 0
                ? `This client has ${deleteTarget?.invoice_count} invoices. Please delete those first.`
                : "This action cannot be undone. The client will be permanently deleted."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            {(deleteTarget?.invoice_count || 0) === 0 && (
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ConditionalAd adSlot="1234567893" />
    </div>
  );
};

// ─── Client Card ──────────────────────────────────────────────────────────────
const ClientCard = ({
  client,
  onEdit,
  onDelete,
  onSelect,
  isSelected,
}: {
  client: Client;
  onEdit: () => void;
  onDelete: () => void;
  onSelect: () => void;
  isSelected: boolean;
}) => (
  <Card
    className={`border-stone-200/80 bg-white hover:shadow-md transition-all duration-200 cursor-pointer rounded-2xl ${
      isSelected ? "border-amber-300 shadow-sm" : ""
    }`}
  >
    <CardContent className="p-0">
      {/* Main row */}
      <div
        className="flex items-center gap-4 p-4 sm:p-5"
        onClick={onSelect}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onSelect()}
      >
        {/* Avatar initials — amber square */}
        <div
          className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-sm"
          style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}
        >
          {client.name?.charAt(0)?.toUpperCase() || "?"}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-foreground text-sm">{client.name}</span>
            {(client.invoice_count || 0) > 0 && (
              <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                <FileText className="h-2.5 w-2.5 mr-1" />
                {client.invoice_count} invoice{client.invoice_count !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-muted-foreground">
            {client.company && (
              <span className="flex items-center gap-1">
                <Building2 className="h-3 w-3" /> {client.company}
              </span>
            )}
            {client.email && (
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" /> {client.email}
              </span>
            )}
            {client.phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" /> {client.phone}
              </span>
            )}
          </div>
        </div>

        {/* Right side: revenue + actions */}
        <div className="flex items-center gap-3 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-foreground tabular-nums">
              {fmtCurrency(client.total_revenue || 0)}
            </p>
            <p className="text-xs text-muted-foreground">earned</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            aria-label={`Edit ${client.name}`}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            aria-label={`Delete ${client.name}`}
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <ChevronRight
            className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isSelected ? "rotate-90" : ""}`}
          />
        </div>
      </div>

      {/* Expanded detail panel */}
      {isSelected && (
        <div className="border-t border-stone-100 bg-stone-50/70 p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 rounded-xl bg-white border border-stone-200/80 text-center">
              <p className="text-xs text-stone-400 mb-1">Total Invoices</p>
              <p className="text-xl font-black text-[#0A0A0A] tabular-nums">{client.invoice_count || 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-white border border-stone-200/80 text-center">
              <p className="text-xs text-stone-400 mb-1">Total Earned</p>
              <p className="text-xl font-black text-emerald-600 tabular-nums">
                {fmtCurrency(client.total_revenue || 0)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white border border-stone-200/80 text-center">
              <p className="text-xs text-stone-400 mb-1">Outstanding</p>
              <p className="text-xl font-black text-amber-600 tabular-nums">
                {fmtCurrency(client.pending_revenue || 0)}
              </p>
            </div>
          </div>
          {client.address && (
            <div className="flex items-start gap-2 mt-3 text-sm text-stone-500">
              <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{client.address}</span>
            </div>
          )}
        </div>
      )}
    </CardContent>
  </Card>
);

export default Clients;
