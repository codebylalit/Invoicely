
import { useState } from "react";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import ThemeToggle from "./ThemeToggle";

const DashboardHeader = () => {
  const [currency, setCurrency] = useState("USD");
  const [timeframe, setTimeframe] = useState("This Month");

  return (
    <div className="flex items-center justify-between pb-6 border-b border-border">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <ThemeToggle />
    </div>
  );
};

export default DashboardHeader;
