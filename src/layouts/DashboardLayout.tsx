
import React from "react";
import { Outlet } from "react-router-dom";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1">
        <div className="p-6">
          {/* Here goes the main page content */}
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
