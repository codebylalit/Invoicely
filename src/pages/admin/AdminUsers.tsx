import React, { useState, useEffect, useMemo } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { AdminUser, PlanType, UserStatus } from '@/types/admin';
import { fetchLiveAdminData } from '@/services/adminDataService';
import {
  Search,
  Calendar,
  Clock,
  MapPin,
  FileText,
  RefreshCw,
  Users,
  ChevronRight,
  DollarSign,
  Building2,
  Hash,
  X
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface UserInvoice {
  id: string;
  invoice_number: string;
  client_name: string;
  client_email?: string;
  client_address?: string;
  total: number;
  subtotal?: number;
  tax?: number;
  discount?: number;
  status: string;
  due_date?: string;
  created_at: string;
  notes?: string;
  items?: any[];
  user_id?: string;
}

interface UserClient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  created_at: string;
}

export const AdminUsers: React.FC = () => {
  const supabaseClient = useSupabaseClient();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedPlan, setSelectedPlan] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Per-user detail state
  const [userInvoices, setUserInvoices] = useState<UserInvoice[]>([]);
  const [userClients, setUserClients] = useState<UserClient[]>([]);
  const [detailTab, setDetailTab] = useState<'overview' | 'invoices' | 'clients'>('overview');
  const [detailLoading, setDetailLoading] = useState(false);

  // Invoice preview modal — stores the invoice to preview inline
  const [invoicePreviewId, setInvoicePreviewId] = useState<string | null>(null);
  const [invoiceFullData, setInvoiceFullData] = useState<UserInvoice | null>(null);
  const [invoicePreviewLoading, setInvoicePreviewLoading] = useState(false);

  // Fetch full invoice data via RPC (bypasses RLS)
  const openInvoicePreview = async (inv: UserInvoice) => {
    setInvoicePreviewId(inv.id);
    setInvoiceFullData(inv); // show what we have immediately
    setInvoicePreviewLoading(true);
    try {
      const res = await supabaseClient.rpc('get_all_invoices' as any);
      const all: any[] = Array.isArray(res.data) ? res.data : [];
      const full = all.find((i) => i.id === inv.id);
      if (full) setInvoiceFullData(full as UserInvoice);
    } catch (err) {
      console.error('Failed to fetch full invoice:', err);
    } finally {
      setInvoicePreviewLoading(false);
    }
  };


  const loadUsersData = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await fetchLiveAdminData(supabaseClient);
      setUsers(data.users);
    } catch (err) {
      console.error('Failed to load users from Supabase:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch that user's invoices and clients when a user is selected.
  // Uses SECURITY DEFINER RPC functions to bypass RLS (same as adminDataService).
  const loadUserDetails = async (userId: string) => {
    setDetailLoading(true);
    setUserInvoices([]);
    setUserClients([]);
    try {
      const [invRes, cliRes] = await Promise.all([
        supabaseClient.rpc('get_all_invoices' as any),
        supabaseClient.rpc('get_all_clients' as any)
      ]);

      // Filter by user_id in JS (RPC returns all rows, RLS already bypassed)
      const allInvoices: any[] = Array.isArray(invRes.data) ? invRes.data : [];
      const allClients: any[] = Array.isArray(cliRes.data) ? cliRes.data : [];

      const filteredInvoices = allInvoices.filter((i) => i.user_id === userId);
      const filteredClients = allClients.filter((c) => c.user_id === userId);

      console.log(`[UserDetail] userId=${userId} → invoices=${filteredInvoices.length}, clients=${filteredClients.length}`);

      setUserInvoices(filteredInvoices as UserInvoice[]);
      setUserClients(filteredClients as UserClient[]);
    } catch (err) {
      console.error('Failed to load user details:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSelectUser = (user: AdminUser) => {
    setSelectedUser(user);
    setDetailTab('overview');
    loadUserDetails(user.id);
  };

  useEffect(() => {
    loadUsersData();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPlan = selectedPlan === 'all' || user.plan === selectedPlan;
      const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
      return matchesSearch && matchesPlan && matchesStatus;
    });
  }, [users, searchTerm, selectedPlan, selectedStatus]);

  const getPlanBadge = (plan: PlanType) => {
    switch (plan) {
      case 'Pro':
        return (
          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 font-bold">
            ⚡ Pro Growth ($6/mo)
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-slate-600 dark:text-slate-400 font-medium">
            Free Starter
          </Badge>
        );
    }
  };

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            Active
          </span>
        );
      case 'Inactive':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
            Inactive
          </span>
        );
      case 'Suspended':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
            Suspended
          </span>
        );
    }
  };

  const getInvoiceStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'overdue': return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
      case 'sent': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default: return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-amber-400 border-t-transparent"></div>
        <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
          Loading Invoicely Users from Supabase...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-up">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            User Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Click any user to see their invoices and clients.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadUsersData(true)}
            disabled={refreshing}
            className="h-9 text-xs rounded-xl border-slate-200 dark:border-slate-800"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            Sync
          </Button>
          <Badge variant="outline" className="text-xs py-1 px-3 border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/5">
            Total Users: {users.length}
          </Badge>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white/80 dark:bg-[#0D111D]/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Search by name, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 text-xs rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 focus-visible:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select value={selectedPlan} onValueChange={setSelectedPlan}>
            <SelectTrigger className="w-40 h-10 text-xs rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
              <SelectValue placeholder="All Plans" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              <SelectItem value="Free">Free Starter ($0)</SelectItem>
              <SelectItem value="Pro">Pro Growth ($6/mo)</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-36 h-10 text-xs rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="Suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#0D111D]/80 backdrop-blur-sm shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80 dark:bg-slate-900/50">
            <TableRow className="border-slate-200/80 dark:border-slate-800/80 text-xs uppercase tracking-wider text-slate-500">
              <TableHead className="font-bold py-3.5">User</TableHead>
              <TableHead className="font-bold">Email</TableHead>
              <TableHead className="font-bold">Joined</TableHead>
              <TableHead className="font-bold">Plan</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="font-bold text-right">Invoices</TableHead>
              <TableHead className="font-bold text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className="cursor-pointer hover:bg-amber-500/5 dark:hover:bg-amber-500/10 transition-colors border-slate-200/80 dark:border-slate-800/80 text-xs"
                >
                  <TableCell className="font-medium py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-slate-200 dark:border-slate-700">
                        {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                        <AvatarFallback className="bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold text-xs">
                          {user.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{user.name}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{user.id.slice(0, 16)}…</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                    {user.email}
                  </TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400">{user.joinedDate}</TableCell>
                  <TableCell>{getPlanBadge(user.plan)}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell className="text-right text-slate-500 dark:text-slate-400 font-semibold">
                    {user.invoicesCount}
                  </TableCell>
                  <TableCell className="text-right">
                    <ChevronRight className="h-4 w-4 text-slate-400 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-slate-400">
                  No users found matching the search and filter criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── User Detail Sheet ── */}
      <Sheet open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <SheetContent className="w-full sm:max-w-lg bg-white dark:bg-[#0D111D] border-l border-slate-200 dark:border-slate-800 p-0 overflow-y-auto">
          {selectedUser && (
            <>
              {/* Header */}
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-br from-amber-500/5 to-transparent">
                <SheetHeader>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14 border-2 border-amber-400/40">
                      {selectedUser.avatar && <AvatarImage src={selectedUser.avatar} />}
                      <AvatarFallback className="bg-amber-500 text-white font-bold text-lg">
                        {selectedUser.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <SheetTitle className="text-lg font-bold text-slate-900 dark:text-white">
                        {selectedUser.name}
                      </SheetTitle>
                      <SheetDescription className="text-xs text-slate-500 font-mono">
                        {selectedUser.email}
                      </SheetDescription>
                      <div className="flex items-center gap-2 mt-2">
                        {getPlanBadge(selectedUser.plan)}
                        {getStatusBadge(selectedUser.status)}
                      </div>
                    </div>
                  </div>
                </SheetHeader>
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50/50 dark:bg-slate-900/30">
                {(['overview', 'invoices', 'clients'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setDetailTab(tab)}
                    className={`px-4 py-3 text-xs font-semibold capitalize border-b-2 transition-colors ${
                      detailTab === tab
                        ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    {tab === 'invoices' ? `Invoices (${userInvoices.length})` :
                     tab === 'clients' ? `Clients (${userClients.length})` :
                     'Overview'}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-6 space-y-4">
                {detailLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-3 border-amber-400 border-t-transparent"></div>
                  </div>
                ) : (
                  <>
                    {/* ── Overview Tab ── */}
                    {detailTab === 'overview' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
                            <span className="text-[10px] text-slate-400 block mb-0.5">Joined Date</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-amber-500" />
                              {selectedUser.joinedDate}
                            </span>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
                            <span className="text-[10px] text-slate-400 block mb-0.5">Last Active</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-blue-500" />
                              {selectedUser.lastActive}
                            </span>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
                            <span className="text-[10px] text-slate-400 block mb-0.5">Total Invoices</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                              <FileText className="h-3.5 w-3.5 text-indigo-500" />
                              {userInvoices.length} invoices
                            </span>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
                            <span className="text-[10px] text-slate-400 block mb-0.5">Total Clients</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                              <Users className="h-3.5 w-3.5 text-emerald-500" />
                              {userClients.length} clients
                            </span>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
                            <span className="text-[10px] text-slate-400 block mb-0.5">Location</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-rose-500" />
                              {selectedUser.location || 'N/A'}
                            </span>
                          </div>
                          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                            <span className="text-[10px] text-amber-600/70 dark:text-amber-400/70 block mb-0.5">Monthly Value (MRR)</span>
                            <span className="font-extrabold text-amber-600 dark:text-amber-400 text-base flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              {selectedUser.mrr}/mo
                            </span>
                          </div>
                        </div>

                        {/* Invoice revenue summary */}
                        {userInvoices.length > 0 && (
                          <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 space-y-2">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">Invoice Summary</p>
                            <div className="grid grid-cols-3 gap-2 text-center text-xs">
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white">{userInvoices.length}</p>
                                <p className="text-[10px] text-slate-400">Total</p>
                              </div>
                              <div>
                                <p className="font-bold text-emerald-600">{userInvoices.filter(i => i.status === 'paid').length}</p>
                                <p className="text-[10px] text-slate-400">Paid</p>
                              </div>
                              <div>
                                <p className="font-bold text-rose-600">{userInvoices.filter(i => i.status === 'overdue').length}</p>
                                <p className="text-[10px] text-slate-400">Overdue</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── Invoices Tab ── */}
                    {detailTab === 'invoices' && (
                      <div className="space-y-2">
                        {userInvoices.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                            <FileText className="h-8 w-8 opacity-40" />
                            <p className="text-sm">No invoices yet</p>
                          </div>
                        ) : (
                          userInvoices.map((inv) => (
                            <div
                              key={inv.id}
                              onClick={() => openInvoicePreview(inv)}
                              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 hover:border-amber-500/40 hover:bg-amber-500/5 cursor-pointer transition-colors group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                                  <Hash className="h-3.5 w-3.5 text-indigo-500" />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                    {inv.invoice_number || `INV-${inv.id.slice(0, 6)}`}
                                  </p>
                                  <p className="text-[10px] text-slate-400">{inv.client_name || 'Unknown Client'}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                                    ₹{Number(inv.total || 0).toLocaleString()}
                                  </p>
                                  <span className={`inline-flex text-[10px] font-semibold px-1.5 py-0.5 rounded border ${getInvoiceStatusColor(inv.status)}`}>
                                    {inv.status || 'draft'}
                                  </span>
                                </div>
                                <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-amber-500 transition-colors" />
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* ── Clients Tab ── */}
                    {detailTab === 'clients' && (
                      <div className="space-y-2">
                        {userClients.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                            <Users className="h-8 w-8 opacity-40" />
                            <p className="text-sm">No clients yet</p>
                          </div>
                        ) : (
                          userClients.map((client) => (
                            <div
                              key={client.id}
                              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 hover:border-amber-500/30 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-700">
                                  <AvatarFallback className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                                    {(client.name || 'CL').slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                    {client.name}
                                  </p>
                                  <p className="text-[10px] text-slate-400">{client.email}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                {client.company && (
                                  <p className="text-[10px] text-slate-500 flex items-center gap-1 justify-end">
                                    <Building2 className="h-3 w-3" />
                                    {client.company}
                                  </p>
                                )}
                                <p className="text-[10px] text-slate-400">
                                  {client.created_at ? new Date(client.created_at).toLocaleDateString() : ''}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="px-6 pb-6">
                <Button variant="outline" className="w-full text-xs" onClick={() => setSelectedUser(null)}>
                  Close
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* ── Invoice Preview Modal ── */}
      <Dialog
        open={!!invoicePreviewId}
        onOpenChange={(open) => { if (!open) { setInvoicePreviewId(null); setInvoiceFullData(null); } }}
      >
        <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white dark:bg-[#0D111D] border border-slate-200 dark:border-slate-800">
          <DialogHeader className="pb-4 border-b border-slate-200 dark:border-slate-800">
            <DialogTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-500" />
              {invoiceFullData?.invoice_number || 'Invoice Preview'}
            </DialogTitle>
          </DialogHeader>

          {invoicePreviewLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-400 border-t-transparent" />
            </div>
          ) : invoiceFullData ? (
            <div className="space-y-6 pt-2 text-sm">
              {/* Header row */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Invoice</p>
                  <p className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {invoiceFullData.invoice_number || `INV-${invoiceFullData.id?.slice(0, 6)}`}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Created: {invoiceFullData.created_at ? new Date(invoiceFullData.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                  </p>
                  {invoiceFullData.due_date && (
                    <p className="text-xs text-slate-400">
                      Due: {new Date(invoiceFullData.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  )}
                </div>
                <span className={`inline-flex text-xs font-bold px-3 py-1.5 rounded-full border ${getInvoiceStatusColor(invoiceFullData.status)}`}>
                  {invoiceFullData.status?.toUpperCase() || 'DRAFT'}
                </span>
              </div>

              {/* Client info */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Billed To</p>
                <p className="font-bold text-slate-800 dark:text-slate-100">{invoiceFullData.client_name || 'N/A'}</p>
                {invoiceFullData.client_email && (
                  <p className="text-xs text-slate-500">{invoiceFullData.client_email}</p>
                )}
                {invoiceFullData.client_address && (
                  <p className="text-xs text-slate-500 whitespace-pre-line">{invoiceFullData.client_address}</p>
                )}
              </div>

              {/* Line items */}
              {Array.isArray(invoiceFullData.items) && invoiceFullData.items.length > 0 && (
                <div className="rounded-xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-900/50">
                      <tr className="text-left">
                        <th className="px-4 py-2.5 font-semibold text-slate-500 uppercase tracking-wider">Item</th>
                        <th className="px-4 py-2.5 font-semibold text-slate-500 uppercase tracking-wider text-center">Qty</th>
                        <th className="px-4 py-2.5 font-semibold text-slate-500 uppercase tracking-wider text-right">Rate</th>
                        <th className="px-4 py-2.5 font-semibold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
                      {invoiceFullData.items.map((item: any, i: number) => (
                        <tr key={i} className="bg-white dark:bg-[#0D111D]">
                          <td className="px-4 py-3">
                            <p className="font-medium text-slate-800 dark:text-slate-200">{item.name || item.description || 'Item'}</p>
                            {item.description && item.name && (
                              <p className="text-[10px] text-slate-400">{item.description}</p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-300">{item.quantity ?? 1}</td>
                          <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">₹{Number(item.rate ?? item.price ?? 0).toLocaleString()}</td>
                          <td className="px-4 py-3 text-right font-semibold text-slate-800 dark:text-slate-100">₹{Number(item.amount ?? (item.quantity * (item.rate ?? item.price ?? 0))).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Totals */}
              <div className="flex flex-col items-end gap-1.5 text-xs">
                {invoiceFullData.subtotal != null && (
                  <div className="flex gap-8">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 w-24 text-right">₹{Number(invoiceFullData.subtotal).toLocaleString()}</span>
                  </div>
                )}
                {invoiceFullData.discount != null && Number(invoiceFullData.discount) > 0 && (
                  <div className="flex gap-8">
                    <span className="text-slate-500">Discount</span>
                    <span className="font-semibold text-rose-600 w-24 text-right">- ₹{Number(invoiceFullData.discount).toLocaleString()}</span>
                  </div>
                )}
                {invoiceFullData.tax != null && Number(invoiceFullData.tax) > 0 && (
                  <div className="flex gap-8">
                    <span className="text-slate-500">Tax</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 w-24 text-right">₹{Number(invoiceFullData.tax).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex gap-8 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-700 dark:text-slate-200">Total</span>
                  <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-base w-24 text-right">₹{Number(invoiceFullData.total || 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Notes */}
              {invoiceFullData.notes && (
                <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-slate-600 dark:text-slate-400">
                  <p className="font-bold text-amber-600 dark:text-amber-400 mb-1 text-[10px] uppercase tracking-wider">Notes</p>
                  <p className="whitespace-pre-line">{invoiceFullData.notes}</p>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
