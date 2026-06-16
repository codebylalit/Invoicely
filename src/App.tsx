import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SessionContextProvider, useSession } from '@supabase/auth-helpers-react';
import Index from "./pages/Dashboard";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Clients from "./pages/Clients";
import Invoices from "./pages/Invoices";
import Settings from "./pages/Settings";
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

const queryClient = new QueryClient();

// Initialize Supabase client
const supabaseUrl = "https://mrmjkdxerrpwrrmmymmv.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ybWprZHhlcnJwd3JybW15bW12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1OTMwNDAsImV4cCI6MjA5NzE2OTA0MH0.G0nuJd44Ib6rBKgBSgpPn_6SSUBY0lRBYY3muGj6GTw";

const supabase = createClient(supabaseUrl, supabaseKey)

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const session = useSession();
  if (!session) {
    return <Navigate to="/" replace />;
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
              {/* Root path renders Landing directly; Landing handles redirect if authenticated */}
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

              {/* Dashboard layout with nested content */}
              < Route
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