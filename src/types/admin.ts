export type DateRangeFilter = '7d' | '30d' | '90d' | '1y';

export interface KPIStat {
  id: string;
  title: string;
  value: string | number;
  formattedValue: string;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  description: string;
  iconName?: string;
}

export interface UserGrowthPoint {
  date: string;
  newUsers: number;
  totalUsers: number;
}

export interface RevenuePoint {
  date: string;
  mrr: number;
  oneTime: number;
  total: number;
}

export interface SubscriptionPoint {
  date: string;
  active: number;
  cancelled: number;
  trial: number;
}

export interface UserActivityPoint {
  date: string;
  dau: number;
  wau: number;
}

// Invoicely has only 2 plans: Free & Pro ($6/mo or $59/yr)
export type PlanType = 'Free' | 'Pro';
export type UserStatus = 'Active' | 'Inactive' | 'Suspended';
export type SubscriptionStatus = 'Active' | 'Trial' | 'Cancelled' | 'Past Due' | 'Expired';
export type TransactionStatus = 'Succeeded' | 'Pending' | 'Failed' | 'Refunded';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinedDate: string;
  plan: PlanType;
  status: UserStatus;
  lastActive: string;
  mrr: number;
  location: string;
  ipAddress: string;
  invoicesCount: number;
}

export interface AdminSubscription {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  plan: PlanType;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  startDate: string;
  renewalDate: string;
  endDate?: string;          // Set when subscription is cancelled
  daysUntilRenewal?: number; // Computed: days until renewal/expiry
  status: SubscriptionStatus;
  paymentMethod: string;
}

export interface AdminTransaction {
  id: string;
  customerName: string;
  customerEmail: string;
  plan: PlanType;
  amount: number;
  date: string;
  status: TransactionStatus;
  paymentMethod: string;
  invoiceNumber: string;
}

export interface PlanRevenueBreakdown {
  plan: PlanType;
  subscribers: number;
  mrr: number;
  percentage: number;
}

export interface AdminSettingsState {
  appName: string;
  supportEmail: string;
  currency: string;
  timezone: string;
  enableSignupNotifications: boolean;
  enableChurnAlerts: boolean;
  churnThresholdPercent: number;
  enablePaymentFailAlerts: boolean;
  apiKey: string;
  twoFactorEnforced: boolean;
}
