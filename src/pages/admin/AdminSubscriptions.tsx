import React, { useState, useEffect, useMemo } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { AdminSubscription, SubscriptionStatus } from '@/types/admin';
import { fetchLiveAdminData } from '@/services/adminDataService';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Search,
  RefreshCw
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

export const AdminSubscriptions: React.FC = () => {
  const supabaseClient = useSupabaseClient();
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const loadSubscriptionsData = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await fetchLiveAdminData(supabaseClient);
      setSubscriptions(data.subscriptions);
    } catch (err) {
      console.error('Failed to load subscriptions from Supabase:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSubscriptionsData();
  }, []);

  // Stats computation
  const stats = useMemo(() => {
    const active = subscriptions.filter((s) => s.status === 'Active').length;
    const trial = subscriptions.filter((s) => s.status === 'Trial').length;
    const cancelled = subscriptions.filter((s) => s.status === 'Cancelled').length;
    return { active, trial, cancelled };
  }, [subscriptions]);

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      const matchesSearch =
        sub.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.plan.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [subscriptions, searchTerm, statusFilter]);

  const getStatusBadge = (status: SubscriptionStatus) => {
    switch (status) {
      case 'Active':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-fit">
            <CheckCircle2 className="h-3 w-3" />
            Active
          </Badge>
        );
      case 'Trial':
        return (
          <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 flex items-center gap-1 w-fit">
            <Clock className="h-3 w-3" />
            Trial
          </Badge>
        );
      case 'Cancelled':
        return (
          <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center gap-1 w-fit">
            <XCircle className="h-3 w-3" />
            Cancelled
          </Badge>
        );
      case 'Past Due':
        return (
          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1 w-fit">
            <AlertTriangle className="h-3 w-3" />
            Past Due
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-amber-400 border-t-transparent"></div>
        <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
          Loading Subscriptions from Supabase...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Subscriptions
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Monitor active customer subscriptions, renewals, trial conversions, and cancellations synced from database profiles.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadSubscriptionsData(true)}
          disabled={refreshing}
          className="h-9 text-xs rounded-xl border-slate-200 dark:border-slate-800 self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
          Sync Data
        </Button>
      </div>

      {/* Top 3 Summary Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Active Subscriptions Card */}
        <Card
          onClick={() => setStatusFilter(statusFilter === 'Active' ? 'all' : 'Active')}
          className={`cursor-pointer transition-all duration-200 border bg-white/80 dark:bg-[#0D111D]/80 backdrop-blur-sm shadow-sm rounded-2xl ${
            statusFilter === 'Active' ? 'ring-2 ring-emerald-500 border-transparent' : 'border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-500/40'
          }`}
        >
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Active Subscriptions
              </span>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                {stats.active}
              </div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                <CheckCircle2 className="h-3 w-3" />
                Paying accounts
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CreditCard className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Trial Subscriptions Card */}
        <Card
          onClick={() => setStatusFilter(statusFilter === 'Trial' ? 'all' : 'Trial')}
          className={`cursor-pointer transition-all duration-200 border bg-white/80 dark:bg-[#0D111D]/80 backdrop-blur-sm shadow-sm rounded-2xl ${
            statusFilter === 'Trial' ? 'ring-2 ring-blue-500 border-transparent' : 'border-slate-200/80 dark:border-slate-800/80 hover:border-blue-500/40'
          }`}
        >
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Trial Subscriptions
              </span>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                {stats.trial}
              </div>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1 font-medium">
                <Clock className="h-3 w-3" />
                Active trial period
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Clock className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Cancelled Subscriptions Card */}
        <Card
          onClick={() => setStatusFilter(statusFilter === 'Cancelled' ? 'all' : 'Cancelled')}
          className={`cursor-pointer transition-all duration-200 border bg-white/80 dark:bg-[#0D111D]/80 backdrop-blur-sm shadow-sm rounded-2xl ${
            statusFilter === 'Cancelled' ? 'ring-2 ring-rose-500 border-transparent' : 'border-slate-200/80 dark:border-slate-800/80 hover:border-rose-500/40'
          }`}
        >
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Cancelled Subscriptions
              </span>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                {stats.cancelled}
              </div>
              <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1 font-medium">
                <XCircle className="h-3 w-3" />
                Churned users
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <XCircle className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white/80 dark:bg-[#0D111D]/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Search subscriptions by customer or plan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 text-xs rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 focus-visible:ring-amber-500"
          />
        </div>

        {/* Quick Filter Pill Buttons */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['all', 'Active', 'Trial', 'Cancelled', 'Past Due'].map((st) => (
            <Button
              key={st}
              variant={statusFilter === st ? 'default' : 'ghost'}
              onClick={() => setStatusFilter(st)}
              className={`h-8 text-xs rounded-lg px-3 font-semibold capitalize ${
                statusFilter === st
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {st}
            </Button>
          ))}
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#0D111D]/80 backdrop-blur-sm shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80 dark:bg-slate-900/50">
            <TableRow className="border-slate-200/80 dark:border-slate-800/80 text-xs uppercase tracking-wider text-slate-500">
              <TableHead className="font-bold py-3.5">User</TableHead>
              <TableHead className="font-bold">Plan</TableHead>
              <TableHead className="font-bold">Price</TableHead>
              <TableHead className="font-bold">Start Date</TableHead>
              <TableHead className="font-bold">Next Renewal</TableHead>
              <TableHead className="font-bold">Plan End Date</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="font-bold text-right">Payment Method</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubscriptions.length > 0 ? (
              filteredSubscriptions.map((sub) => (
                <TableRow
                  key={sub.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors border-slate-200/80 dark:border-slate-800/80 text-xs"
                >
                  <TableCell className="font-medium py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-700">
                        {sub.userAvatar && <AvatarImage src={sub.userAvatar} />}
                        <AvatarFallback className="bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                          {sub.userName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          {sub.userName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{sub.userEmail}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {sub.plan}
                    </span>
                  </TableCell>
                  <TableCell className="font-bold text-slate-900 dark:text-white">
                    ${sub.price}
                    <span className="text-[10px] font-normal text-slate-400">/{sub.billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                  </TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400">
                    {sub.startDate !== 'N/A' ? sub.startDate : <span className="text-slate-400 italic">Unknown</span>}
                  </TableCell>
                  <TableCell>
                    {sub.renewalDate !== 'N/A' ? (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 dark:text-slate-400">{sub.renewalDate}</span>
                        {typeof sub.daysUntilRenewal === 'number' && sub.daysUntilRenewal <= 7 && sub.daysUntilRenewal >= 0 && !sub.endDate && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                            <AlertTriangle className="h-2.5 w-2.5" />
                            {sub.daysUntilRenewal === 0 ? 'Today' : `${sub.daysUntilRenewal}d`}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic text-xs">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400">
                    {sub.endDate ? (
                      <div className="flex items-center gap-2">
                        <span>{sub.endDate}</span>
                        {typeof sub.daysUntilRenewal === 'number' && sub.daysUntilRenewal <= 7 && sub.daysUntilRenewal >= 0 && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-400 text-[10px] font-bold">
                            <AlertTriangle className="h-2.5 w-2.5" />
                            {sub.daysUntilRenewal === 0 ? 'Today' : `${sub.daysUntilRenewal}d`}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(sub.status)}</TableCell>
                  <TableCell className="text-right text-slate-500 dark:text-slate-400 text-[11px] font-mono">
                    {sub.paymentMethod}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-slate-400">
                  No subscriptions match the selected criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminSubscriptions;
