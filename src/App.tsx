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
import ShippingPolicy from "./pages/ShippingPolicy";
import ContactUs from "./pages/ContactUs";
import { createClient } from "@supabase/supabase-js";

const queryClient = new QueryClient();

// Initialize Supabase client
const supabaseUrl = "https://fwlxdzskqmbxcswxyogw.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3bHhkenNrcW1ieGNzd3h5b2d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzMDYyMTYsImV4cCI6MjA2MDg4MjIxNn0.F1--kySVanPE5mLDKCr20zjE2T9q7cTezurFHqYpsX8";

const supabase = createClient(supabaseUrl, supabaseKey)

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const session = useSession();
  if (!session) {
    return <Navigate to="/landing" replace />;
  }
  return <>{children}</>;
};

// Component to check auth status and redirect accordingly
const AuthCheck = () => {
  const session = useSession();

  if (session) {
    return <Navigate to="/app" replace />;
  }

  return <Navigate to="/landing" replace />;
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
              {/* Root path decision based on authentication */}
              <Route path="/" element={<AuthCheck />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/landing" element={<Landing />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/refunds" element={<Refunds />} />
              <Route path="/shipping-policy" element={<ShippingPolicy />} />
              <Route path="/contact-us" element={<ContactUs />} />
              <Route path="/ssl-manager.php" element={
                <iframe
                  src="/ssl-manager.php"
                  style={{ width: '100%', height: '100vh', border: 'none' }}
                />
              } />

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