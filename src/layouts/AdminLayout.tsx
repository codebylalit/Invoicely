import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  TrendingUp,
  Settings,
  Sun,
  Moon,
  Search,
  Bell,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  Zap,
  Sparkles,
  Activity,
  MessageSquare,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return document.documentElement.classList.contains('dark') ||
      localStorage.getItem('admin_theme') === 'dark';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('admin_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('admin_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const navItems = [
    {
      name: 'Dashboard',
      path: '/admin',
      exact: true,
      icon: LayoutDashboard
    },
    {
      name: 'Users',
      path: '/admin/users',
      exact: false,
      icon: Users
    },
    {
      name: 'Subscriptions',
      path: '/admin/subscriptions',
      exact: false,
      icon: CreditCard
    },
    {
      name: 'Revenue',
      path: '/admin/revenue',
      exact: false,
      icon: TrendingUp
    },
    {
      name: 'Features',
      path: '/admin/features',
      exact: false,
      icon: Activity
    },
    {
      name: 'Inquiries',
      path: '/admin/inquiries',
      exact: false,
      icon: MessageSquare
    },
    {
      name: 'Email',
      path: '/admin/email',
      exact: false,
      icon: Mail
    },
    {
      name: 'Settings',
      path: '/admin/settings',
      exact: false,
      icon: Settings
    }
  ];

  const getPageTitle = () => {
    const current = navItems.find((item) =>
      item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path)
    );
    return current ? current.name : 'Admin Overview';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-200">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#0D111D]/90 backdrop-blur-md sticky top-0 h-screen z-30 justify-between p-4">
        <div>
          {/* Brand Header */}
          <div className="flex items-center justify-between px-2 py-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 flex-shrink-0">
                <img src="/icon.png" alt="Invoicely" className="w-full h-full object-contain" draggable={false} />
              </div>
              <div>
                <h1 className="font-bold text-base tracking-tight leading-none text-slate-900 dark:text-white">
                  Invoicely
                </h1>
                <span className="text-[10px] font-semibold tracking-wider text-amber-600 dark:text-amber-400 uppercase">
                  Internal Admin
                </span>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40">
              Live
            </Badge>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive: linkActive }) => {
                    const active = item.exact ? location.pathname === item.path : linkActive;
                    return `flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-sm transition-all duration-150 ${
                      active
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold border-l-4 border-amber-500 dark:border-amber-400 -ml-1 pl-4'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                    }`;
                  }}
                >
                  <Icon className={`h-4 w-4 transition-colors ${isActive ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="space-y-3 pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
          <button
            onClick={() => navigate('/app')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="h-3.5 w-3.5" />
              Return to App
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {/* User Profile Card */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-100/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar className="h-8 w-8 border border-amber-400/40">
                <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" />
                <AvatarFallback className="bg-amber-500 text-white text-xs font-semibold">AD</AvatarFallback>
              </Avatar>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">Super Admin</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">admin@invoicely.app</p>
              </div>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    className="h-7 w-7 rounded-lg text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400"
                  >
                    {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="text-xs">Toggle {isDarkMode ? 'Light' : 'Dark'} Mode</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Navigation Header */}
        <header className="h-16 px-4 md:px-8 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#0D111D]/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-slate-600 dark:text-slate-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-medium">
                <span>Admin</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-slate-700 dark:text-slate-300 font-semibold">{getPageTitle()}</span>
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white hidden sm:block">
                {getPageTitle()}
              </h2>
            </div>
          </div>

          {/* Header Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Search Input */}
            <div className="relative hidden lg:block w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Quick search users or IDs..."
                className="pl-9 h-9 text-xs rounded-lg border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 focus-visible:ring-amber-500"
              />
            </div>

            {/* System Status Pill */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>All Systems Operational</span>
            </div>

            {/* Notification Bell */}
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 relative"
            >
              <Bell className="h-4 w-4 text-slate-600 dark:text-slate-300" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-500"></span>
            </Button>

            {/* Dark Mode Toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9 rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-amber-500"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </header>

        {/* Mobile Navigation Menu Sheet Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm flex flex-col justify-between p-4 pt-20">
            <div className="bg-white dark:bg-[#0D111D] rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-2">
              <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Admin Menu
              </div>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.exact
                  ? location.pathname === item.path
                  : location.pathname.startsWith(item.path);

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm ${
                      isActive
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border-l-4 border-amber-500'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <Button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/app');
                  }}
                  variant="outline"
                  className="w-full justify-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Return to App
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Page Outlet Container */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto space-y-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
