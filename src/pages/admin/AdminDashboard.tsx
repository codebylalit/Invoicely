import React, { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { DateRangeFilter, KPIStat, UserGrowthPoint, RevenuePoint, SubscriptionPoint, UserActivityPoint } from '@/types/admin';
import { fetchLiveAdminData, RealtimeAdminData } from '@/services/adminDataService';
import {
  Users,
  UserCheck,
  CreditCard,
  DollarSign,
  UserPlus,
  UserMinus,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const supabaseClient = useSupabaseClient();
  const [dateRange, setDateRange] = useState<DateRangeFilter>('30d');
  const [data, setData] = useState<RealtimeAdminData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadAdminData = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const result = await fetchLiveAdminData(supabaseClient, dateRange);
      setData(result);
    } catch (err) {
      console.error('Failed to load admin dashboard data from Supabase:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [dateRange]);

  const getKPIIcon = (id: string) => {
    switch (id) {
      case 'total_users':
        return <Users className="h-4 w-4 text-amber-500" />;
      case 'active_users':
        return <UserCheck className="h-4 w-4 text-blue-500" />;
      case 'active_subscriptions':
        return <CreditCard className="h-4 w-4 text-emerald-500" />;
      case 'monthly_revenue':
        return <DollarSign className="h-4 w-4 text-indigo-500" />;
      case 'new_users':
        return <FileText className="h-4 w-4 text-teal-500" />;
      case 'churned_users':
        return <Users className="h-4 w-4 text-rose-500" />;
      default:
        return <Users className="h-4 w-4 text-amber-500" />;
    }
  };

  const dateFilterOptions: { label: string; value: DateRangeFilter }[] = [
    { label: '7 Days', value: '7d' },
    { label: '30 Days', value: '30d' },
    { label: '90 Days', value: '90d' },
    { label: '1 Year', value: '1y' }
  ];

  if (loading || !data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-amber-400 border-t-transparent"></div>
        <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
          Syncing Live Data with Supabase...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 animate-fade-up">
      {/* Page Banner & Date Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Dashboard Overview
            </h1>
            <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
              ● Supabase Synced
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time live application data from profiles, invoices, and active user subscriptions.
          </p>
        </div>

        {/* Minimal Date Filter Controls & Manual Refresh */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadAdminData(true)}
            disabled={refreshing}
            className="h-9 px-2.5 text-xs rounded-xl border-slate-200 dark:border-slate-800"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            Sync
          </Button>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 px-2 hidden sm:flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Range:
            </span>
            {dateFilterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDateRange(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  dateRange === opt.value
                    ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5-6 Top KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {data.kpis.map((kpi) => {
          const isPositive = kpi.change >= 0;

          return (
            <Card
              key={kpi.id}
              className="border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#0D111D]/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 rounded-2xl overflow-hidden group"
            >
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                    {kpi.title}
                  </span>
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 group-hover:scale-105 transition-transform">
                    {getKPIIcon(kpi.id)}
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <div className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    {kpi.formattedValue}
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span
                      className={`inline-flex items-center font-bold px-1.5 py-0.5 rounded-full ${
                        isPositive
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isPositive ? (
                        <ArrowUpRight className="h-3 w-3 mr-0.5" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 mr-0.5" />
                      )}
                      {kpi.change > 0 ? `+${kpi.change}%` : `${kpi.change}%`}
                    </span>
                    <span className="text-slate-400 dark:text-slate-500 truncate">vs. prev</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: User Growth */}
        <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#0D111D]/80 backdrop-blur-sm shadow-sm rounded-2xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-amber-500" />
                  User Growth
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                  New users acquired over time in database
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.userGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="userGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      borderColor: 'rgba(51, 65, 85, 0.5)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="newUsers"
                    name="New Users"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#userGrowthGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Chart 2: Revenue */}
        <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#0D111D]/80 backdrop-blur-sm shadow-sm rounded-2xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-emerald-500" />
                  Revenue over Time
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                  MRR subscriptions + App invoice totals ($)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-72 w-full">
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
                    formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      borderColor: 'rgba(51, 65, 85, 0.5)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="mrr" name="Subscription MRR" fill="#10b981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="oneTime" name="App Invoices Total" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Chart 3: Subscriptions (Active vs Cancelled) */}
        <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#0D111D]/80 backdrop-blur-sm shadow-sm rounded-2xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-indigo-500" />
                  Subscriptions Breakdown
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                  Active vs Trial vs Cancelled subscriptions
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.subscriptionTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="activeSubGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      borderColor: 'rgba(51, 65, 85, 0.5)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="active" name="Active" stroke="#6366f1" strokeWidth={2} fill="url(#activeSubGrad)" />
                  <Area type="monotone" dataKey="trial" name="Trial" stroke="#3b82f6" strokeWidth={2} fill="none" />
                  <Area type="monotone" dataKey="cancelled" name="Cancelled" stroke="#f43f5e" strokeWidth={2} fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Chart 4: User Activity (DAU / WAU) */}
        <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#0D111D]/80 backdrop-blur-sm shadow-sm rounded-2xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-teal-500" />
                  User Activity (DAU / WAU)
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                  Daily Active Users vs Weekly Active Users
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.userActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      borderColor: 'rgba(51, 65, 85, 0.5)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="dau" name="Daily Active (DAU)" stroke="#14b8a6" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="wau" name="Weekly Active (WAU)" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
