import React from "react";
import { Outlet } from "react-router-dom";
import DashboardSidebar from "@/components/DashboardSidebar";
import ConditionalAd from "@/components/ConditionalAd";

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
        
        {/* Conditional Ad - Only shown for free users */}
        <div className="px-8 pb-8">
          <ConditionalAd 
            adSlot="1234567890" 
            className="max-w-7xl mx-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
