
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-react';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();
const supabase = createClientComponentClient();

const App = () => {
  return (
    <React.StrictMode>
      <SessionContextProvider supabaseClient={supabase}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/app" element={<Index />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </SessionContextProvider>
    </React.StrictMode>
  );
};

export default App;
