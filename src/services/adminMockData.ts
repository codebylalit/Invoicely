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
  AdminSettingsState
} from '../types/admin';

// ----------------------------------------------------
// Mock KPI Data generator according to Date Range
// ----------------------------------------------------
export const getKPIs = (range: DateRangeFilter): KPIStat[] => {
  const multipliers: Record<DateRangeFilter, number> = {
    '7d': 0.25,
    '30d': 1,
    '90d': 2.8,
    '1y': 10.5
  };

  const mult = multipliers[range];

  return [
    {
      id: 'total_users',
      title: 'Total Users',
      value: Math.round(14820 * (0.9 + mult * 0.05)),
      formattedValue: Math.round(14820 * (0.9 + mult * 0.05)).toLocaleString(),
      change: 12.4,
      trend: 'up',
      description: 'vs. previous period',
      iconName: 'Users'
    },
    {
      id: 'active_users',
      title: 'Active Users',
      value: Math.round(9640 * (0.9 + mult * 0.05)),
      formattedValue: Math.round(9640 * (0.9 + mult * 0.05)).toLocaleString(),
      change: 8.7,
      trend: 'up',
      description: 'vs. previous period',
      iconName: 'UserCheck'
    },
    {
      id: 'active_subscriptions',
      title: 'Active Subscriptions',
      value: Math.round(3420 * (0.9 + mult * 0.04)),
      formattedValue: Math.round(3420 * (0.9 + mult * 0.04)).toLocaleString(),
      change: 15.2,
      trend: 'up',
      description: 'vs. previous period',
      iconName: 'CreditCard'
    },
    {
      id: 'monthly_revenue',
      title: 'Monthly Revenue',
      value: 52400,
      formattedValue: '$52,400',
      change: 18.6,
      trend: 'up',
      description: 'vs. previous period',
      iconName: 'DollarSign'
    },
    {
      id: 'new_users',
      title: 'New Users',
      value: Math.round(1240 * mult),
      formattedValue: Math.round(1240 * mult).toLocaleString(),
      change: 24.1,
      trend: 'up',
      description: 'vs. previous period',
      iconName: 'UserPlus'
    },
    {
      id: 'churned_users',
      title: 'Churned Users',
      value: Math.round(64 * mult),
      formattedValue: Math.round(64 * mult).toLocaleString(),
      change: -4.2,
      trend: 'down', // down is good for churn
      description: 'vs. previous period',
      iconName: 'UserMinus'
    }
  ];
};

// ----------------------------------------------------
// Chart Analytics Mock Generators
// ----------------------------------------------------
export const getUserGrowthData = (range: DateRangeFilter): UserGrowthPoint[] => {
  if (range === '7d') {
    return [
      { date: 'Mon', newUsers: 42, totalUsers: 14720 },
      { date: 'Tue', newUsers: 58, totalUsers: 14778 },
      { date: 'Wed', newUsers: 64, totalUsers: 14842 },
      { date: 'Thu', newUsers: 51, totalUsers: 14893 },
      { date: 'Fri', newUsers: 79, totalUsers: 14972 },
      { date: 'Sat', newUsers: 88, totalUsers: 15060 },
      { date: 'Sun', newUsers: 95, totalUsers: 15155 }
    ];
  } else if (range === '30d') {
    return [
      { date: 'Week 1', newUsers: 280, totalUsers: 14100 },
      { date: 'Week 2', newUsers: 340, totalUsers: 14440 },
      { date: 'Week 3', newUsers: 390, totalUsers: 14830 },
      { date: 'Week 4', newUsers: 450, totalUsers: 15280 }
    ];
  } else if (range === '90d') {
    return [
      { date: 'Month 1', newUsers: 1100, totalUsers: 13000 },
      { date: 'Month 2', newUsers: 1350, totalUsers: 14350 },
      { date: 'Month 3', newUsers: 1580, totalUsers: 15930 }
    ];
  } else {
    return [
      { date: 'Q1', newUsers: 2800, totalUsers: 8500 },
      { date: 'Q2', newUsers: 3400, totalUsers: 11900 },
      { date: 'Q3', newUsers: 4100, totalUsers: 16000 },
      { date: 'Q4', newUsers: 5200, totalUsers: 21200 }
    ];
  }
};

export const getRevenueData = (range: DateRangeFilter): RevenuePoint[] => {
  if (range === '7d') {
    return [
      { date: 'Mon', mrr: 48000, oneTime: 1200, total: 49200 },
      { date: 'Tue', mrr: 48500, oneTime: 1500, total: 50000 },
      { date: 'Wed', mrr: 49200, oneTime: 900, total: 50100 },
      { date: 'Thu', mrr: 50100, oneTime: 1800, total: 51900 },
      { date: 'Fri', mrr: 51000, oneTime: 2100, total: 53100 },
      { date: 'Sat', mrr: 51800, oneTime: 1400, total: 53200 },
      { date: 'Sun', mrr: 52400, oneTime: 1600, total: 54000 }
    ];
  } else if (range === '30d') {
    return [
      { date: 'Week 1', mrr: 42000, oneTime: 4500, total: 46500 },
      { date: 'Week 2', mrr: 45200, oneTime: 5100, total: 50300 },
      { date: 'Week 3', mrr: 48900, oneTime: 4800, total: 53700 },
      { date: 'Week 4', mrr: 52400, oneTime: 6200, total: 58600 }
    ];
  } else if (range === '90d') {
    return [
      { date: 'Jun', mrr: 38000, oneTime: 12000, total: 50000 },
      { date: 'Jul', mrr: 44500, oneTime: 14200, total: 58700 },
      { date: 'Aug', mrr: 52400, oneTime: 16800, total: 69200 }
    ];
  } else {
    return [
      { date: 'Jan', mrr: 24000, oneTime: 8000, total: 32000 },
      { date: 'Mar', mrr: 31000, oneTime: 9500, total: 40500 },
      { date: 'May', mrr: 39500, oneTime: 11000, total: 50500 },
      { date: 'Jul', mrr: 46000, oneTime: 13500, total: 59500 },
      { date: 'Aug', mrr: 52400, oneTime: 16800, total: 69200 }
    ];
  }
};

export const getSubscriptionTrendData = (range: DateRangeFilter): SubscriptionPoint[] => {
  if (range === '7d') {
    return [
      { date: 'Mon', active: 3310, cancelled: 12, trial: 420 },
      { date: 'Tue', active: 3335, cancelled: 9, trial: 435 },
      { date: 'Wed', active: 3360, cancelled: 15, trial: 410 },
      { date: 'Thu', active: 3380, cancelled: 8, trial: 440 },
      { date: 'Fri', active: 3400, cancelled: 11, trial: 450 },
      { date: 'Sat', active: 3412, cancelled: 7, trial: 465 },
      { date: 'Sun', active: 3420, cancelled: 5, trial: 480 }
    ];
  } else {
    return [
      { date: 'Period 1', active: 2900, cancelled: 45, trial: 320 },
      { date: 'Period 2', active: 3100, cancelled: 38, trial: 380 },
      { date: 'Period 3', active: 3280, cancelled: 42, trial: 420 },
      { date: 'Period 4', active: 3420, cancelled: 31, trial: 480 }
    ];
  }
};

export const getUserActivityData = (range: DateRangeFilter): UserActivityPoint[] => {
  if (range === '7d') {
    return [
      { date: 'Mon', dau: 4200, wau: 9100 },
      { date: 'Tue', dau: 4550, wau: 9240 },
      { date: 'Wed', dau: 4890, wau: 9380 },
      { date: 'Thu', dau: 4710, wau: 9450 },
      { date: 'Fri', dau: 5120, wau: 9590 },
      { date: 'Sat', dau: 3980, wau: 9610 },
      { date: 'Sun', dau: 3850, wau: 9640 }
    ];
  } else {
    return [
      { date: 'W1', dau: 3900, wau: 8200 },
      { date: 'W2', dau: 4300, wau: 8700 },
      { date: 'W3', dau: 4700, wau: 9200 },
      { date: 'W4', dau: 5120, wau: 9640 }
    ];
  }
};

// ----------------------------------------------------
// Mock Users List
// ----------------------------------------------------
export const MOCK_USERS: AdminUser[] = [
  {
    id: 'usr_1',
    name: 'Sarah Jenkins',
    email: 'sarah.j@acmecorp.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    joinedDate: '2025-01-15',
    plan: 'Enterprise',
    status: 'Active',
    lastActive: '10 mins ago',
    mrr: 299,
    location: 'San Francisco, CA',
    ipAddress: '192.168.1.45',
    invoicesCount: 142
  },
  {
    id: 'usr_2',
    name: 'Alex Rivera',
    email: 'alex@designstudio.io',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    joinedDate: '2025-02-01',
    plan: 'Pro',
    status: 'Active',
    lastActive: '2 hours ago',
    mrr: 49,
    location: 'Austin, TX',
    ipAddress: '172.16.254.1',
    invoicesCount: 68
  },
  {
    id: 'usr_3',
    name: 'Elena Rostova',
    email: 'elena.r@fintechlab.eu',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    joinedDate: '2025-02-12',
    plan: 'Pro',
    status: 'Active',
    lastActive: 'Just now',
    mrr: 49,
    location: 'London, UK',
    ipAddress: '82.165.197.1',
    invoicesCount: 94
  },
  {
    id: 'usr_4',
    name: 'Marcus Chen',
    email: 'marcus@cloudscale.net',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    joinedDate: '2025-03-04',
    plan: 'Enterprise',
    status: 'Active',
    lastActive: '1 day ago',
    mrr: 499,
    location: 'Seattle, WA',
    ipAddress: '54.210.12.9',
    invoicesCount: 310
  },
  {
    id: 'usr_5',
    name: 'David Kim',
    email: 'david@kimsolutions.co',
    joinedDate: '2025-03-18',
    plan: 'Starter',
    status: 'Active',
    lastActive: '3 hours ago',
    mrr: 19,
    location: 'Toronto, Canada',
    ipAddress: '142.250.190.46',
    invoicesCount: 22
  },
  {
    id: 'usr_6',
    name: 'Jessica Vance',
    email: 'jessica@freelancedesign.com',
    joinedDate: '2025-04-02',
    plan: 'Free',
    status: 'Inactive',
    lastActive: '12 days ago',
    mrr: 0,
    location: 'Chicago, IL',
    ipAddress: '98.137.11.163',
    invoicesCount: 4
  },
  {
    id: 'usr_7',
    name: 'Liam Gallagher',
    email: 'liam@oasismedia.uk',
    joinedDate: '2025-04-20',
    plan: 'Pro',
    status: 'Active',
    lastActive: '45 mins ago',
    mrr: 49,
    location: 'Manchester, UK',
    ipAddress: '185.220.101.4',
    invoicesCount: 51
  },
  {
    id: 'usr_8',
    name: 'Sophia Patel',
    email: 'sophia@techinnovations.in',
    joinedDate: '2025-05-11',
    plan: 'Starter',
    status: 'Suspended',
    lastActive: '25 days ago',
    mrr: 0,
    location: 'Bangalore, India',
    ipAddress: '103.21.126.8',
    invoicesCount: 15
  },
  {
    id: 'usr_9',
    name: 'Robert Miller',
    email: 'rmiller@buildright.com',
    joinedDate: '2025-05-29',
    plan: 'Pro',
    status: 'Active',
    lastActive: '5 hours ago',
    mrr: 49,
    location: 'Denver, CO',
    ipAddress: '64.233.160.0',
    invoicesCount: 39
  },
  {
    id: 'usr_10',
    name: 'Amara Okafor',
    email: 'amara@africacreative.org',
    joinedDate: '2025-06-15',
    plan: 'Starter',
    status: 'Active',
    lastActive: 'Yesterday',
    mrr: 19,
    location: 'Lagos, Nigeria',
    ipAddress: '197.210.8.22',
    invoicesCount: 18
  }
];

// ----------------------------------------------------
// Mock Subscriptions
// ----------------------------------------------------
export const MOCK_SUBSCRIPTIONS: AdminSubscription[] = [
  {
    id: 'sub_101',
    userId: 'usr_1',
    userName: 'Sarah Jenkins',
    userEmail: 'sarah.j@acmecorp.com',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    plan: 'Enterprise',
    price: 299,
    billingCycle: 'monthly',
    startDate: '2025-01-15',
    renewalDate: '2026-09-15',
    status: 'Active',
    paymentMethod: 'Credit Card (•••• 4242)'
  },
  {
    id: 'sub_102',
    userId: 'usr_2',
    userName: 'Alex Rivera',
    userEmail: 'alex@designstudio.io',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    plan: 'Pro',
    price: 49,
    billingCycle: 'monthly',
    startDate: '2025-02-01',
    renewalDate: '2026-09-01',
    status: 'Active',
    paymentMethod: 'PayPal (alex@designstudio.io)'
  },
  {
    id: 'sub_103',
    userId: 'usr_3',
    userName: 'Elena Rostova',
    userEmail: 'elena.r@fintechlab.eu',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    plan: 'Pro',
    price: 490,
    billingCycle: 'yearly',
    startDate: '2025-02-12',
    renewalDate: '2027-02-12',
    status: 'Active',
    paymentMethod: 'Credit Card (•••• 8812)'
  },
  {
    id: 'sub_104',
    userId: 'usr_4',
    userName: 'Marcus Chen',
    userEmail: 'marcus@cloudscale.net',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    plan: 'Enterprise',
    price: 499,
    billingCycle: 'monthly',
    startDate: '2025-03-04',
    renewalDate: '2026-09-04',
    status: 'Active',
    paymentMethod: 'Bank Wire / Invoice'
  },
  {
    id: 'sub_105',
    userId: 'usr_5',
    userName: 'David Kim',
    userEmail: 'david@kimsolutions.co',
    plan: 'Starter',
    price: 19,
    billingCycle: 'monthly',
    startDate: '2025-03-18',
    renewalDate: '2026-09-18',
    status: 'Trial',
    paymentMethod: 'Credit Card (•••• 1092)'
  },
  {
    id: 'sub_106',
    userId: 'usr_7',
    userName: 'Liam Gallagher',
    userEmail: 'liam@oasismedia.uk',
    plan: 'Pro',
    price: 49,
    billingCycle: 'monthly',
    startDate: '2025-04-20',
    renewalDate: '2026-08-20',
    status: 'Cancelled',
    paymentMethod: 'Credit Card (•••• 9921)'
  },
  {
    id: 'sub_107',
    userId: 'usr_9',
    userName: 'Robert Miller',
    userEmail: 'rmiller@buildright.com',
    plan: 'Pro',
    price: 49,
    billingCycle: 'monthly',
    startDate: '2025-05-29',
    renewalDate: '2026-08-29',
    status: 'Past Due',
    paymentMethod: 'Credit Card (•••• 3341)'
  }
];

// ----------------------------------------------------
// Mock Revenue Breakdown & Transactions
// ----------------------------------------------------
export const MOCK_PLAN_REVENUE: PlanRevenueBreakdown[] = [
  { plan: 'Enterprise', subscribers: 310, mrr: 28400, percentage: 54.2 },
  { plan: 'Pro', subscribers: 1840, mrr: 18100, percentage: 34.5 },
  { plan: 'Starter', subscribers: 1270, mrr: 5900, percentage: 11.3 }
];

export const MOCK_TRANSACTIONS: AdminTransaction[] = [
  {
    id: 'tx_9081',
    customerName: 'Marcus Chen',
    customerEmail: 'marcus@cloudscale.net',
    plan: 'Enterprise',
    amount: 499.00,
    date: '2026-08-11 14:32',
    status: 'Succeeded',
    paymentMethod: 'Stripe',
    invoiceNumber: 'INV-2026-0891'
  },
  {
    id: 'tx_9080',
    customerName: 'Sarah Jenkins',
    customerEmail: 'sarah.j@acmecorp.com',
    plan: 'Enterprise',
    amount: 299.00,
    date: '2026-08-11 11:15',
    status: 'Succeeded',
    paymentMethod: 'Stripe',
    invoiceNumber: 'INV-2026-0890'
  },
  {
    id: 'tx_9079',
    customerName: 'Elena Rostova',
    customerEmail: 'elena.r@fintechlab.eu',
    plan: 'Pro',
    amount: 490.00,
    date: '2026-08-10 18:40',
    status: 'Succeeded',
    paymentMethod: 'PayPal',
    invoiceNumber: 'INV-2026-0889'
  },
  {
    id: 'tx_9078',
    customerName: 'Robert Miller',
    customerEmail: 'rmiller@buildright.com',
    plan: 'Pro',
    amount: 49.00,
    date: '2026-08-10 09:20',
    status: 'Failed',
    paymentMethod: 'Stripe',
    invoiceNumber: 'INV-2026-0888'
  },
  {
    id: 'tx_9077',
    customerName: 'Alex Rivera',
    customerEmail: 'alex@designstudio.io',
    plan: 'Pro',
    amount: 49.00,
    date: '2026-08-09 16:05',
    status: 'Succeeded',
    paymentMethod: 'Razorpay',
    invoiceNumber: 'INV-2026-0887'
  },
  {
    id: 'tx_9076',
    customerName: 'David Kim',
    customerEmail: 'david@kimsolutions.co',
    plan: 'Starter',
    amount: 19.00,
    date: '2026-08-08 12:50',
    status: 'Succeeded',
    paymentMethod: 'Stripe',
    invoiceNumber: 'INV-2026-0886'
  },
  {
    id: 'tx_9075',
    customerName: 'Sophia Patel',
    customerEmail: 'sophia@techinnovations.in',
    plan: 'Starter',
    amount: 19.00,
    date: '2026-08-05 10:10',
    status: 'Refunded',
    paymentMethod: 'Razorpay',
    invoiceNumber: 'INV-2026-0872'
  }
];

export const MOCK_ADMIN_SETTINGS: AdminSettingsState = {
  appName: 'Invoicely SaaS',
  supportEmail: 'admin@invoicely.app',
  currency: 'USD ($)',
  timezone: 'UTC (GMT+0)',
  enableSignupNotifications: true,
  enableChurnAlerts: true,
  churnThresholdPercent: 5.0,
  enablePaymentFailAlerts: true,
  apiKey: 'inv_live_998124801284091240182409',
  twoFactorEnforced: true
};
