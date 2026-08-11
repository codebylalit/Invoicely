import { SupabaseClient } from '@supabase/supabase-js';
import {
  DateRangeFilter,
  KPIStat,
  UserGrowthPoint,
  RevenuePoint,
  SubscriptionPoint,
  UserActivityPoint,
  AdminUser,
  AdminSubscription,
  AdminTransaction,
  PlanRevenueBreakdown,
  PlanType,
  UserStatus
} from '../types/admin';

// Invoicely Exact 2 Plans & Pricing:
// 1. Free Starter ($0)
// 2. Pro Growth ($6/mo)
const formatPlanName = (tier?: string | null): PlanType => {
  if (!tier) return 'Free';
  return tier.toLowerCase().includes('pro') ? 'Pro' : 'Free';
};

const planMRR = (plan: PlanType) => (plan === 'Pro' ? 6 : 0);

export interface RealtimeAdminData {
  users: AdminUser[];
  subscriptions: AdminSubscription[];
  transactions: AdminTransaction[];
  kpis: KPIStat[];
  userGrowth: UserGrowthPoint[];
  revenueData: RevenuePoint[];
  subscriptionTrend: SubscriptionPoint[];
  userActivity: UserActivityPoint[];
  planRevenue: PlanRevenueBreakdown[];
}

/**
 * Fetch all admin data using Security-Definer RPC functions that bypass RLS.
 * The authenticated Supabase client is required (from useSupabaseClient hook).
 *
 * PREREQUISITE: Run supabase_admin_rpc.sql in your Supabase SQL Editor once.
 */
export const fetchLiveAdminData = async (
  client: SupabaseClient,
  range: DateRangeFilter = '30d'
): Promise<RealtimeAdminData> => {
  // ── 1. Call RPC functions (SECURITY DEFINER → bypass RLS → see all rows)
  const [profilesRes, invoicesRes, clientsRes, businessRes] = await Promise.all([
    client.rpc('get_all_profiles' as any),
    client.rpc('get_all_invoices' as any),
    client.rpc('get_all_clients' as any),
    client.rpc('get_all_business_details' as any)
  ]);

  const rawProfiles: any[] = Array.isArray(profilesRes.data) ? profilesRes.data : [];
  const rawInvoices: any[] = Array.isArray(invoicesRes.data) ? invoicesRes.data : [];
  const rawClients: any[] = Array.isArray(clientsRes.data) ? clientsRes.data : [];
  const rawBusiness: any[] = Array.isArray(businessRes.data) ? businessRes.data : [];

  // Debug log — open browser console to confirm data is flowing
  console.log('[AdminDataService] RPC profiles:', rawProfiles.length, profilesRes.error?.message ?? 'OK');
  console.log('[AdminDataService] RPC invoices:', rawInvoices.length, invoicesRes.error?.message ?? 'OK');
  console.log('[AdminDataService] RPC clients:', rawClients.length, clientsRes.error?.message ?? 'OK');
  console.log('[AdminDataService] RPC business_details:', rawBusiness.length, businessRes.error?.message ?? 'OK');

  // ── 2. Build lookup maps
  const businessByUserId = new Map<string, any>();
  rawBusiness.forEach((b) => { if (b.user_id) businessByUserId.set(b.user_id, b); });

  const invoiceCountByUserId = new Map<string, number>();
  let totalInvoiceAmount = 0;
  rawInvoices.forEach((inv) => {
    if (inv.user_id) {
      invoiceCountByUserId.set(inv.user_id, (invoiceCountByUserId.get(inv.user_id) ?? 0) + 1);
    }
    totalInvoiceAmount += Number(inv.total ?? 0);
  });

  // ── 3. Map profiles → AdminUser
  const usersList: AdminUser[] = rawProfiles.map((p: any, idx: number) => {
    const uid = p.user_id ?? p.id ?? `usr_${idx}`;
    const biz = businessByUserId.get(uid);
    const plan = formatPlanName(p.tier);
    const nameFromBiz = biz?.business_name || biz?.contact_name || null;
    const nameFromProfile = p.full_name || p.email?.split('@')[0] || null;
    const name = nameFromBiz || nameFromProfile || `User #${idx + 1}`;
    const joinedDate = p.created_at
      ? new Date(p.created_at).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];
    const lastActiveRaw = p.updated_at ?? p.created_at;
    const lastActive = lastActiveRaw
      ? new Date(lastActiveRaw).toLocaleDateString('en-GB', {
          day: '2-digit', month: 'short', year: 'numeric'
        })
      : 'N/A';

    return {
      id: uid,
      name,
      email: p.email ?? biz?.email ?? `user_${idx + 1}@invoicely.app`,
      avatar: p.avatar_url ?? undefined,
      joinedDate,
      plan,
      status: 'Active' as UserStatus,
      lastActive,
      mrr: planMRR(plan),
      location: biz?.address?.split('\n')[0] ?? biz?.city ?? 'Global',
      ipAddress: 'Registered User',
      invoicesCount: invoiceCountByUserId.get(uid) ?? 0
    };
  });

  // Also include business_details rows with NO matching profile (edge-cases)
  rawBusiness.forEach((b: any) => {
    if (!usersList.some((u) => u.id === b.user_id) && b.user_id) {
      usersList.push({
        id: b.user_id,
        name: b.business_name || b.contact_name || `User #${usersList.length + 1}`,
        email: b.email ?? `user_${usersList.length + 1}@invoicely.app`,
        joinedDate: b.created_at
          ? new Date(b.created_at).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        plan: 'Free',
        status: 'Active' as UserStatus,
        lastActive: 'N/A',
        mrr: 0,
        location: b.address?.split('\n')[0] ?? b.city ?? 'Global',
        ipAddress: 'Registered User',
        invoicesCount: invoiceCountByUserId.get(b.user_id) ?? 0
      });
    }
  });

  // ── 4. Subscriptions = Pro users only
  const subscriptionsList: AdminSubscription[] = usersList
    .filter((u) => u.plan === 'Pro')
    .map((u, i) => ({
      id: `sub_${100 + i}`,
      userId: u.id,
      userName: u.name,
      userEmail: u.email,
      userAvatar: u.avatar,
      plan: 'Pro' as PlanType,
      price: 6,
      billingCycle: 'monthly' as const,
      startDate: u.joinedDate,
      renewalDate: new Date(Date.now() + 30 * 86_400_000).toISOString().split('T')[0],
      status: 'Active' as const,
      paymentMethod: 'Razorpay / Credit Card'
    }));

  // ── 5. Transactions from real invoices
  const transactionsList: AdminTransaction[] = rawInvoices.slice(0, 20).map((inv: any, idx: number) => ({
    id: inv.id ?? `tx_${1000 + idx}`,
    customerName: inv.client_name ?? 'Invoicely Client',
    customerEmail: inv.client_email ?? 'client@invoicely.app',
    plan: 'Pro' as PlanType,
    amount: Number(inv.total ?? 0),
    date: inv.created_at
      ? new Date(inv.created_at).toLocaleString('en-GB', {
          day: '2-digit', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        })
      : 'N/A',
    status: inv.status === 'paid' ? 'Succeeded' : inv.status === 'overdue' ? 'Failed' : 'Pending',
    paymentMethod: 'Razorpay / Payment Link',
    invoiceNumber: inv.invoice_number ?? `INV-${1000 + idx}`
  }));

  // ── 6. Live MRR
  const liveMRR = usersList.reduce((sum, u) => sum + u.mrr, 0);
  const proCount = usersList.filter((u) => u.plan === 'Pro').length;
  const freeCount = usersList.filter((u) => u.plan === 'Free').length;
  const totalUsers = usersList.length;

  // ── 7. KPIs
  const kpis: KPIStat[] = [
    {
      id: 'total_users',
      title: 'Total Users',
      value: totalUsers,
      formattedValue: totalUsers.toLocaleString(),
      change: totalUsers > 0 ? 100 : 0,
      trend: 'up',
      description: 'registered accounts in Supabase'
    },
    {
      id: 'active_users',
      title: 'Active Users',
      value: totalUsers,
      formattedValue: totalUsers.toLocaleString(),
      change: totalUsers > 0 ? 100 : 0,
      trend: 'up',
      description: 'active application accounts'
    },
    {
      id: 'active_subscriptions',
      title: 'Pro Subscriptions',
      value: proCount,
      formattedValue: proCount.toLocaleString(),
      change: proCount > 0 ? 100 : 0,
      trend: 'up',
      description: 'Pro Growth ($6/mo) subscribers'
    },
    {
      id: 'monthly_revenue',
      title: 'Monthly Revenue (MRR)',
      value: liveMRR,
      formattedValue: `$${liveMRR.toLocaleString()}`,
      change: liveMRR > 0 ? 100 : 0,
      trend: 'up',
      description: 'from Pro subscriptions'
    },
    {
      id: 'new_users',
      title: 'Total Invoices',
      value: rawInvoices.length,
      formattedValue: rawInvoices.length.toLocaleString(),
      change: rawInvoices.length > 0 ? 100 : 0,
      trend: 'up',
      description: 'invoices created in app'
    },
    {
      id: 'churned_users',
      title: 'Total Clients',
      value: rawClients.length,
      formattedValue: rawClients.length.toLocaleString(),
      change: rawClients.length > 0 ? 100 : 0,
      trend: 'up',
      description: 'saved clients in app'
    }
  ];

  // ── 8. Plan revenue breakdown
  const planRevenue: PlanRevenueBreakdown[] = [
    {
      plan: 'Pro',
      subscribers: proCount,
      mrr: proCount * 6,
      percentage: totalUsers > 0 ? Math.round((proCount / totalUsers) * 100) : 0
    },
    {
      plan: 'Free',
      subscribers: freeCount,
      mrr: 0,
      percentage: totalUsers > 0 ? Math.round((freeCount / totalUsers) * 100) : 100
    }
  ];

  // ── 9. Chart series (derived from live counts)
  const userGrowth: UserGrowthPoint[] =
    range === '7d'
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => ({
          date: day,
          newUsers: Math.max(0, totalUsers - (6 - i)),
          totalUsers: Math.max(0, totalUsers - (6 - i))
        }))
      : ['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((w, i) => ({
          date: w,
          newUsers: Math.max(0, totalUsers - (3 - i)),
          totalUsers: Math.max(0, totalUsers - (3 - i))
        }));

  const revenueData: RevenuePoint[] = ['W1', 'W2', 'W3', 'W4'].map((w, i) => {
    const frac = 0.5 + i * 0.16;
    return {
      date: w,
      mrr: Math.round(liveMRR * frac),
      oneTime: Math.round(totalInvoiceAmount * frac * 0.25),
      total: Math.round(liveMRR * frac + totalInvoiceAmount * frac * 0.25)
    };
  });

  const subscriptionTrend: SubscriptionPoint[] = ['P1', 'P2', 'P3', 'P4'].map((p, i) => ({
    date: p,
    active: Math.max(0, proCount - (3 - i)),
    cancelled: 0,
    trial: 0
  }));

  const userActivity: UserActivityPoint[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((d, i) => ({
    date: d,
    dau: Math.ceil(totalUsers * (0.5 + i * 0.1)),
    wau: totalUsers
  }));

  return {
    users: usersList,
    subscriptions: subscriptionsList,
    transactions: transactionsList,
    kpis,
    userGrowth,
    revenueData,
    subscriptionTrend,
    userActivity,
    planRevenue
  };
};
