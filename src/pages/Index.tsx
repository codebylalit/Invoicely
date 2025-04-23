import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import InvoiceStats from "@/components/InvoiceStats";
import CreateInvoiceButton from "@/components/CreateInvoiceButton";

const Index = () => {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Invoice income</h2>
        <CreateInvoiceButton />
      </div>
      <InvoiceStats />
      <div className="text-center text-muted-foreground">
        <p>Time to get paid?</p>
      </div>
    </>
  );
};

export default Index;
