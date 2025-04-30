import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import InvoiceStats from "@/components/InvoiceStats";
import CreateInvoiceButton from "@/components/CreateInvoiceButton";
import { FileText } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <div className="ml-64 mx-auto">
      <DashboardHeader />
      <div className="flex flex-col gap-6 mt-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-2xl font-semibold">Invoice income</h2>
          <Link to={"/app/invoices"}>
            <Button className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Manage Invoices
            </Button>
          </Link>
        </div>

        <InvoiceStats />

        <div className="text-center text-muted-foreground">
          <p>Time to get paid?</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
