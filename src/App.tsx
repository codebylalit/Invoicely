
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { createClient } from '@supabase/supabase-js';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Initialize Supabase with proper configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create supabase client only if we have the required credentials
const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const App = () => {
  // If Supabase credentials are missing, render a message
  if (!supabase) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-invoice-light dark:bg-invoice-darkBg">
        <div className="max-w-md p-6 text-center bg-white rounded-lg shadow-md dark:bg-invoice-dark">
          <h1 className="mb-4 text-xl font-bold text-invoice-lightText dark:text-invoice-darkText">
            Supabase Configuration Missing
          </h1>
          <p className="mb-4 text-invoice-gray">
            Please make sure you've connected your project to Supabase and set the 
            VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.
          </p>
        </div>
      </div>
    );
  }

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
