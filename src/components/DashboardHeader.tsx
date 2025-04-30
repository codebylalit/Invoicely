import { useState } from "react";
import ThemeToggle from "./ThemeToggle";

const DashboardHeader = () => {
  return (
    <div className="mb-8 flex items-center justify-between">
      <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
      <div className="flex items-center gap-4">
        <ThemeToggle />
      </div>
    </div>
  );
};

export default DashboardHeader;
