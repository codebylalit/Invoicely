import React, { useState, createContext, useContext } from "react";
import { Outlet } from "react-router-dom";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import Logo from "@/components/Logo";

// Context to allow child components to control sidebar
export const SidebarContext = createContext<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}>({ isOpen: false, setIsOpen: () => {} });

export const useSidebar = () => useContext(SidebarContext);

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <SidebarContext.Provider
      value={{ isOpen: isSidebarOpen, setIsOpen: setIsSidebarOpen }}
    >
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        {/* Desktop Sidebar - FIXED on screen, hidden on mobile */}
        <aside className="hidden lg:block fixed top-0 left-0 bottom-0 z-30 w-64 h-screen border-r border-border bg-background">
          <DashboardSidebar />
        </aside>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          </div>
        )}

        {/* Mobile Sidebar Drawer */}
        <div
          className={`
            fixed top-0 left-0 z-50 h-full w-64 transform transition-transform duration-300 ease-in-out lg:hidden
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <DashboardSidebar onClose={() => setIsSidebarOpen(false)} />
        </div>

        {/* Main Content Area - Shifted right by 256px (lg:pl-64) for fixed desktop sidebar */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
          {/* Mobile Top Header */}
          <header className="lg:hidden sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-background border-b border-border">
            <Logo size="sm" />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label="Toggle navigation menu"
              className="h-9 w-9"
            >
              {isSidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
};

export default DashboardLayout;
