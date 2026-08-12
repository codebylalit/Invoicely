import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SessionContextProvider, useSessionContext } from '@supabase/auth-helpers-react';
import Index from "./pages/Dashboard";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Clients from "./pages/Clients";
import Invoices from "./pages/Invoices";
import Settings from "./pages/Settings";
import RecurringInvoices from "./pages/RecurringInvoices";
import DashboardLayout from "./layouts/DashboardLayout";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Refunds from "./pages/Refunds";
import { createClient } from "@supabase/supabase-js";
import Contact from "./pages/Contact";
import Subscription from "./components/Subscription";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import Blog from "./pages/Blog";
import PublicInvoicePay from "./pages/PublicInvoicePay";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";
import AdminRevenue from "./pages/admin/AdminRevenue";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminFeatures from "./pages/admin/AdminFeatures";
import AdminInquiries from "./pages/admin/AdminInquiries";
import AdminEmailAutomation from "./pages/admin/AdminEmailAutomation";

const queryClient = new QueryClient();

// Initialize Supabase client
const supabaseUrl = "https://mrmjkdxerrpwrrmmymmv.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ybWprZHhlcnJwd3JybW15bW12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1OTMwNDAsImV4cCI6MjA5NzE2OTA0MH0.G0nuJd44Ib6rBKgBSgpPn_6SSUBY0lRBYY3muGj6GTw";

const supabase = createClient(supabaseUrl, supabaseKey);

// ─── Authorized admin emails ─────────────────────────────────────────────────
// Only these emails can access /admin. Add more if needed.
const ADMIN_EMAILS: string[] = [
  "lalit.createss@gmail.com",
  "heyylalit@gmail.com",
];
// ─────────────────────────────────────────────────────────────────────────────

// Standard auth guard – redirects unauthenticated users to /
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, isLoading } = useSessionContext();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F0E8] text-slate-700">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-amber-400 border-t-transparent mb-3" />
        <p className="text-xs font-semibold tracking-wide uppercase text-stone-500">Loading your session...</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Admin-only guard – must be logged in AND email must be in ADMIN_EMAILS
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, isLoading } = useSessionContext();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-violet-500 border-t-transparent mb-3" />
        <p className="text-xs font-semibold tracking-wide uppercase text-gray-400">Verifying access...</p>
      </div>
    );
  }

  // Not logged in → redirect to landing
  if (!session) {
    return <Navigate to="/" replace />;
  }

  const userEmail = session.user?.email ?? "";

  // Logged in but not an admin → show 403 screen
  if (!ADMIN_EMAILS.includes(userEmail.toLowerCase())) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white gap-4">
        <div className="text-6xl">🚫</div>
        <h1 className="text-2xl font-bold text-red-400">Access Denied</h1>
        <p className="text-gray-400 text-sm max-w-xs text-center">
          You are not authorized to view this page. Admin access is restricted.
        </p>
        <a
          href="/app"
          className="mt-2 px-5 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg text-sm font-medium transition-colors"
        >
          Back to App
        </a>
      </div>
    );
  }

  return <>{children}</>;
};

const App = () => {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/refunds" element={<Refunds />} />
              <Route path="/contact-us" element={<Contact />} />
              <Route path="/subscribe" element={<Subscription userSubscription={null} setUserSubscription={() => { }} />} />
              <Route path="/ssl-manager.php" element={
                <iframe
                  src="/ssl-manager.php"
                  style={{ width: '100%', height: '100vh', border: 'none' }}
                />
              } />
              <Route path="/about" element={<About />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/pay/:id" element={<PublicInvoicePay />} />

              {/* Admin routes – only ADMIN_EMAILS can access */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="subscriptions" element={<AdminSubscriptions />} />
                <Route path="revenue" element={<AdminRevenue />} />
                <Route path="features" element={<AdminFeatures />} />
                <Route path="inquiries" element={<AdminInquiries />} />
                <Route path="email" element={<AdminEmailAutomation />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              {/* App routes – any authenticated user */}
              <Route
                path="/app"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Index />} />
                <Route path="clients" element={<Clients />} />
                <Route path="invoices" element={<Invoices />} />
                <Route path="recurring" element={<RecurringInvoices />} />
                <Route path="items" element={<Index />} />
                <Route path="page" element={<Index />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </SessionContextProvider>
  );
};

export default App;