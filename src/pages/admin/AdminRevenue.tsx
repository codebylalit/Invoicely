import React, { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { DateRangeFilter } from '@/types/admin';
import { fetchLiveAdminData, RealtimeAdminData } from '@/services/adminDataService';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  PieChart,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

export const AdminRevenue: React.FC = () => {
  const supabaseClient = useSupabaseClient();
  const [dateRange, setDateRange] = useState<DateRangeFilter>('30d');
  const [data, setData] = useState<RealtimeAdminData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadRevenueData = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const result = await fetchLiveAdminData(supabaseClient, dateRange);
      setData(result);
    } catch (err) {
      console.error('Failed to load revenue data from Supabase:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRevenueData();
  }, [dateRange]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Succeeded':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-fit">
            <CheckCircle2 className="h-3 w-3" />
            Succeeded
          </Badge>
        );
      case 'Pending':
        return (
          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1 w-fit">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case 'Failed':
        return (
          <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center gap-1 w-fit">
            <XCircle className="h-3 w-3" />
            Failed
          </Badge>
        );
      case 'Refunded':
        return (
          <Badge className="bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/30 flex items-center gap-1 w-fit">
            <RefreshCw className="h-3 w-3" />
            Refunded
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-amber-400 border-t-transparent"></div>
        <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
          Loading Revenue Data from Supabase...
        </p>
      </div>
    );
  }

  const liveMRR = data.users.reduce((acc, u) => acc + u.mrr, 0);

  return (
    <div className="space-y-8 pb-12 animate-fade-up">
      {/* Header & Date Range */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Revenue Analytics & Invoices
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            In-depth breakdown of subscription MRR, plan contribution, and recent app invoice payments in Supabase.
          </p>
        </div>

        {/* Sync & Date Filter */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadRevenueData(true)}
            disabled={refreshing}
            className="h-9 text-xs rounded-xl border-slate-200 dark:border-slate-800"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            Sync
          </Button>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 self-start sm:self-auto">
            {(['7d', '30d', '90d', '1y'] as DateRangeFilter[]).map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  dateRange === r
                    ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : r === '90d' ? '90 Days' : '1 Year'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Revenue Card */}
        <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#0D111D]/80 backdrop-blur-sm shadow-sm rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Revenue (MRR + Invoices)
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
            ${(liveMRR * 12 + data.transactions.reduce((acc, t) => acc + t.amount, 0)).toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="h-4 w-4" />
            +18.6% vs previous period
          </div>
        </Card>

        {/* Monthly Recurring Revenue (MRR) Card */}
        <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#0D111D]/80 backdrop-blur-sm shadow-sm rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Monthly Recurring Revenue (MRR)
            </span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
            ${liveMRR.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <ArrowUpRight className="h-4 w-4" />
            +14.2% MRR growth
          </div>
        </Card>

        {/* Average Revenue Per User (ARPU) */}
        <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#0D111D]/80 backdrop-blur-sm shadow-sm rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Avg. Revenue Per User (ARPU)
            </span>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
            ${(liveMRR / (data.users.length || 1)).toFixed(2)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            <ArrowUpRight className="h-4 w-4" />
            +5.8% expand MRR
          </div>
        </Card>
      </div>

      {/* Revenue Breakdown by Plan Cards */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <PieChart className="h-4 w-4 text-amber-500" />
          Revenue Contribution by Subscription Plan
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.planRevenue.map((item) => (
            <Card
              key={item.plan}
              className="border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#0D111D]/80 backdrop-blur-sm shadow-sm rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {item.plan} Plan
                </span>
                <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-600 dark:text-amber-400">
                  {item.percentage}% of MRR
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  ${item.mrr.toLocaleString()}
                  <span className="text-xs font-normal text-slate-400">/mo</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {item.subscribers.toLocaleString()} subscribers
                </div>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-4 overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(10, item.percentage))}%` }}
                ></div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Interactive Revenue Chart */}
      <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#0D111D]/80 backdrop-blur-sm shadow-sm rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
            Revenue Trend Chart
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
            Comparing subscription MRR and application invoice totals over time.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.revenueData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                />
                <Tooltip
                  formatter={(val: number) => [`$${val.toLocaleString()}`, '']}
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderColor: 'rgba(51, 65, 85, 0.5)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="mrr" name="Subscription MRR" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                <Bar dataKey="oneTime" name="Invoices Total" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions Table */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Recent Application Invoice Payments
        </h3>
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#0D111D]/80 backdrop-blur-sm shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/80 dark:bg-slate-900/50">
              <TableRow className="border-slate-200/80 dark:border-slate-800/80 text-xs uppercase tracking-wider text-slate-500">
                <TableHead className="font-bold py-3.5">Invoice / Tx ID</TableHead>
                <TableHead className="font-bold">Client / Customer</TableHead>
                <TableHead className="font-bold">Plan</TableHead>
                <TableHead className="font-bold">Amount</TableHead>
                <TableHead className="font-bold">Date & Time</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="font-bold text-right">Payment Gateway</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.transactions.map((tx) => (
                <TableRow
                  key={tx.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors border-slate-200/80 dark:border-slate-800/80 text-xs"
                >
                  <TableCell className="font-mono font-semibold text-slate-900 dark:text-white py-3">
                    {tx.invoiceNumber || tx.id}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{tx.customerName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{tx.customerEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-slate-700 dark:text-slate-300">
                    {tx.plan}
                  </TableCell>
                  <TableCell className="font-extrabold text-slate-900 dark:text-white">
                    ${tx.amount.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400">{tx.date}</TableCell>
                  <TableCell>{getStatusBadge(tx.status)}</TableCell>
                  <TableCell className="text-right text-slate-500 dark:text-slate-400 font-mono">
                    {tx.paymentMethod}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default AdminRevenue;
