
import { useState } from "react";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const DashboardHeader = () => {
  const [currency, setCurrency] = useState("USD");
  const [timeframe, setTimeframe] = useState("This Month");

  return (
    <div className="flex items-center justify-between p-6 border-b border-border">
      <h1 className="text-3xl font-semibold">Dashboard</h1>
      
      <div className="flex items-center gap-4">
        <Select defaultValue={currency} onValueChange={setCurrency}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USD">🇺🇸 USD</SelectItem>
            <SelectItem value="EUR">🇪🇺 EUR</SelectItem>
            <SelectItem value="GBP">🇬🇧 GBP</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="This Month">This Month</SelectItem>
            <SelectItem value="Last Month">Last Month</SelectItem>
            <SelectItem value="This Year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default DashboardHeader;
