import { useEffect, useState, useMemo } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2,
  Plus,
  FileText,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Zap,
} from "lucide-react";
import CreateInvoiceButton from "@/components/CreateInvoiceButton";
import ConditionalAd from "@/components/ConditionalAd";

// ─── Types ──────────────────────────────────────────────────────────────────
interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  total: number;
  status: string;
  created_at: string;
  due_date: string;
}

interface Stats {
  totalRevenue: number;
  paidCount: number;
  pendingTotal: number;
  pendingCount: number;
  overdueTotal: number;
  overdueCount: number;
}

interface MonthlyData {
  month: string;
  revenue: number;
  pending: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const fmtCompact = (amount: number) => {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount}`;
};

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    bg: string;
    text: string;
    dot: string;
  }
> = {
  paid: {
    label: "Paid",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    text: "text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  pending: {
    label: "Pending",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    text: "text-amber-700 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  overdue: {
    label: "Overdue",
    bg: "bg-red-50 dark:bg-red-950/30",
    text: "text-red-700 dark:text-red-400",
    dot: "bg-red-500",
  },
  partial: {
    label: "Partial",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    text: "text-blue-700 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-600 dark:text-gray-400",
    dot: "bg-gray-400",
  },
  draft: {
    label: "Draft",
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-600 dark:text-gray-400",
    dot: "bg-gray-400",
  },
};

const StatusBadge = ({ status }: { status: string }) => {
  const key = status?.toLowerCase() || "draft";
  const cfg = STATUS_CONFIG[key] || STATUS_CONFIG.draft;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-xl shadow-xl p-3 text-sm min-w-[140px]">
        <p className="font-semibold text-foreground mb-2">{label}</p>
        {payload.map((entry: any) => (
          <div
            key={entry.name}
            className="flex items-center justify-between gap-4"
          >
            <span className="text-muted-foreground capitalize">{entry.name}</span>
            <span className="font-semibold" style={{ color: entry.color }}>
              {fmtCompact(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ─── Main Component ──────────────────────────────────────────────────────────
const Dashboard = () => {
  const supabase = useSupabaseClient();
  const session = useSession();
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [businessName, setBusinessName] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!session?.user?.id) return;
      setLoading(true);
      try {
        const [invoicesRes, businessRes] = await Promise.all([
          supabase
            .from("invoices")
            .select("id, invoice_number, client_name, total, status, created_at, due_date")
            .order("created_at", { ascending: false }),
          supabase
            .from("business_details")
            .select("contact_name, business_name")
            .eq("user_id", session.user.id)
            .single(),
        ]);

        if (invoicesRes.data) setInvoices(invoicesRes.data);
        if (businessRes.data) {
          setBusinessName(
            businessRes.data.business_name ||
              businessRes.data.contact_name ||
              ""
          );
        }
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [session, supabase]);

  // ─── Derived stats ───────────────────────────────────────────────────────
  const stats = useMemo<Stats>(() => {
    const result: Stats = {
      totalRevenue: 0,
      paidCount: 0,
      pendingTotal: 0,
      pendingCount: 0,
      overdueTotal: 0,
      overdueCount: 0,
    };
    invoices.forEach((inv) => {
      const t = Number(inv.total) || 0;
      const s = inv.status?.toLowerCase();
      if (s === "paid") {
        result.totalRevenue += t;
        result.paidCount++;
      } else if (s === "pending") {
        result.pendingTotal += t;
        result.pendingCount++;
      } else if (s === "overdue") {
        result.overdueTotal += t;
        result.overdueCount++;
      }
    });
    return result;
  }, [invoices]);

  // ─── Monthly chart data (last 6 months) ─────────────────────────────────
  const monthlyData = useMemo<MonthlyData[]>(() => {
    const months: MonthlyData[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: d.toLocaleString("default", { month: "short" }),
        revenue: 0,
        pending: 0,
      });
    }
    invoices.forEach((inv) => {
      const d = new Date(inv.created_at);
      const monthStr = d.toLocaleString("default", { month: "short" });
      const idx = months.findIndex((m) => m.month === monthStr);
      if (idx === -1) return;
      const t = Number(inv.total) || 0;
      const s = inv.status?.toLowerCase();
      if (s === "paid") months[idx].revenue += t;
      else if (s === "pending" || s === "overdue") months[idx].pending += t;
    });
    return months;
  }, [invoices]);

  const recentInvoices = invoices.slice(0, 5);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-muted rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-xl" />
          ))}
        </div>
        <div className="h-72 bg-muted rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-4">
      {/* ── Greeting Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-black tracking-tight leading-tight"
            style={{ color: "#0A0A0A", fontFamily: "'Plus Jakarta Sans', 'Poppins', sans-serif" }}
          >
            {greeting()}
            {businessName ? `, ${businessName.split(" ")[0]}` : ""} 👋
          </h1>
          <p className="text-stone-400 text-sm mt-1">
            Here's what's happening with your business today.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => navigate("/app/invoices")}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border border-stone-200 bg-white text-stone-700 font-semibold text-sm hover:border-stone-400 hover:bg-stone-50 transition-all"
          >
            <FileText className="h-4 w-4" />
            View All Invoices
          </button>
          <CreateInvoiceButton />
        </div>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <Card className="border-stone-200/80 bg-white hover:shadow-md transition-all duration-200 rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">
                  Total Revenue
                </p>
                <p className="text-2xl font-black text-[#0A0A0A] tabular-nums">
                  {fmtCompact(stats.totalRevenue)}
                </p>
                <p className="text-xs text-stone-400 mt-1">
                  {stats.paidCount} paid invoice{stats.paidCount !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="h-10 w-10 rounded-2xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending */}
        <Card className="border-stone-200/80 bg-white hover:shadow-md transition-all duration-200 rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">
                  Awaiting Payment
                </p>
                <p className="text-2xl font-black text-[#0A0A0A] tabular-nums">
                  {fmtCompact(stats.pendingTotal)}
                </p>
                <p className="text-xs text-stone-400 mt-1">
                  {stats.pendingCount} pending invoice{stats.pendingCount !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="h-10 w-10 rounded-2xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overdue */}
        <Card className="border-stone-200/80 bg-white hover:shadow-md transition-all duration-200 rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">
                  Overdue
                </p>
                <p className="text-2xl font-black text-[#0A0A0A] tabular-nums">
                  {fmtCompact(stats.overdueTotal)}
                </p>
                <p className="text-xs text-stone-400 mt-1">
                  {stats.overdueCount} overdue invoice{stats.overdueCount !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="h-10 w-10 rounded-2xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Invoices */}
        <Card className="border-stone-200/80 bg-white hover:shadow-md transition-all duration-200 rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">
                  Total Invoices
                </p>
                <p className="text-2xl font-black text-[#0A0A0A] tabular-nums">
                  {invoices.length}
                </p>
                <p className="text-xs text-stone-400 mt-1">All time</p>
              </div>
              <div className="h-10 w-10 rounded-2xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                <FileText className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Revenue Chart + Recent Invoices ─────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Chart */}
        <Card className="xl:col-span-3 border-stone-200/80 bg-white rounded-2xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-[#0A0A0A] tracking-tight">
                Revenue Overview
              </CardTitle>
              <span className="text-xs text-stone-400">Last 6 months</span>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {invoices.length === 0 ? (
              <div className="h-56 flex flex-col items-center justify-center text-stone-400">
                <TrendingUp className="h-10 w-10 mb-2 opacity-30" />
                <p className="text-sm">No data yet. Create your first invoice!</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={224}>
                <AreaChart data={monthlyData} margin={{ top: 4, right: 0, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D97706" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#D97706" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "#a8a29e" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#a8a29e" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={fmtCompact}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    fill="url(#colorRevenue)"
                    name="revenue"
                  />
                  <Area
                    type="monotone"
                    dataKey="pending"
                    stroke="#D97706"
                    strokeWidth={2}
                    fill="url(#colorPending)"
                    name="pending"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card className="xl:col-span-2 border-stone-200/80 bg-white rounded-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-[#0A0A0A] tracking-tight">
                Recent Invoices
              </CardTitle>
              <Link
                to="/app/invoices"
                className="text-xs text-amber-600 hover:text-amber-700 font-bold hover:underline"
              >
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {recentInvoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-stone-400">
                <FileText className="h-8 w-8 mb-2 opacity-30" />
                <p className="text-sm text-center">No invoices yet.</p>
                <CreateInvoiceButton />
              </div>
            ) : (
              recentInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center gap-3 py-2 border-b border-stone-100 last:border-0"
                >
                  <div className="h-8 w-8 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-3.5 w-3.5 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0A0A0A] truncate leading-tight">
                      {inv.client_name || "—"}
                    </p>
                    <p className="text-xs text-stone-400">
                      #{inv.invoice_number || "Draft"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-sm font-bold text-[#0A0A0A] tabular-nums">
                      {fmtCompact(Number(inv.total) || 0)}
                    </span>
                    <StatusBadge status={inv.status} />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Quick Actions ────────────────────────────────────────────────────── */}
      <Card className="border-stone-200/80 bg-white rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle
            className="text-base font-bold text-[#0A0A0A] tracking-tight flex items-center gap-2"
          >
            <Zap className="h-4 w-4 text-amber-500" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <QuickAction
              icon={<Plus className="h-5 w-5" />}
              label="New Invoice"
              sublabel="Create & send"
              onClick={() => {
                const btn = document.querySelector<HTMLButtonElement>("[data-create-invoice]");
                btn?.click();
              }}
              accent="bg-amber-50 text-amber-700"
            />
            <QuickAction
              icon={<Users className="h-5 w-5" />}
              label="Add Client"
              sublabel="Manage clients"
              onClick={() => navigate("/app/clients")}
              accent="bg-blue-50 text-blue-600"
            />
            <QuickAction
              icon={<AlertCircle className="h-5 w-5" />}
              label="Overdue"
              sublabel={`${stats.overdueCount} invoice${stats.overdueCount !== 1 ? "s" : ""}`}
              onClick={() => navigate("/app/invoices")}
              accent="bg-red-50 text-red-500"
            />
            <QuickAction
              icon={<CheckCircle2 className="h-5 w-5" />}
              label="Settings"
              sublabel="Business profile"
              onClick={() => navigate("/app/settings")}
              accent="bg-stone-100 text-stone-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Conditional Ad */}
      <ConditionalAd adSlot="1234567891" />
    </div>
  );
};

// ─── Quick Action Button ─────────────────────────────────────────────────────
const QuickAction = ({
  icon,
  label,
  sublabel,
  onClick,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  onClick: () => void;
  accent: string;
}) => (
  <button
    onClick={onClick}
    className="flex flex-col items-start gap-3 p-4 rounded-2xl border border-stone-200/80 bg-white hover:bg-stone-50 hover:border-stone-300 hover:shadow-sm transition-all duration-150 text-left group"
  >
    <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${accent}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-bold text-[#0A0A0A] group-hover:text-amber-700 transition-colors leading-tight">
        {label}
      </p>
      <p className="text-xs text-stone-400 leading-tight mt-0.5">{sublabel}</p>
    </div>
  </button>
);

export default Dashboard;
