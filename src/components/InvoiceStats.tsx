import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { FileCheck, Clock, AlertCircle, Check } from "lucide-react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useToast } from "@/hooks/use-toast";

interface InvoiceStats {
  paid: {
    count: number;
    total: number;
  };
  overdue: {
    count: number;
    total: number;
  };
  pending: {
    count: number;
    total: number;
  };
}

const InvoiceStats = ({ updateTrigger }) => {
  const session = useSession();
  const [stats, setStats] = useState({
    paid: { count: 0, total: 0 },
    overdue: { count: 0, total: 0 },
    pending: { count: 0, total: 0 },
  });
  const [loading, setLoading] = useState(true);
  const supabase = useSupabaseClient();
  const { toast } = useToast();

  useEffect(() => {
    const fetchInvoiceStats = async () => {
      if (!session?.user?.id) return;
      setLoading(true);
      try {
        const today = new Date().toISOString().split("T")[0]; // Current date in YYYY-MM-DD format

        // Fetch user's invoices
        const { data, error } = await supabase
          .from("invoices")
          .select("status, due_date, total")
          .eq("user_id", session.user.id);

        if (error) throw error;

        // Initialize stats object
        const newStats = {
          paid: { count: 0, total: 0 },
          overdue: { count: 0, total: 0 },
          pending: { count: 0, total: 0 },
        };

        // Process the data
        data?.forEach((invoice) => {
          // Parse total ensuring it's a number
          const invoiceTotal =
            typeof invoice.total === "number"
              ? invoice.total
              : parseFloat(invoice.total || "0");

          // Determine status category based on the status field directly
          const status = invoice.status?.toLowerCase() || "";

          if (status === "paid") {
            newStats.paid.count += 1;
            newStats.paid.total += invoiceTotal;
          } else if (status === "overdue") {
            newStats.overdue.count += 1;
            newStats.overdue.total += invoiceTotal;
          } else if (status === "pending") {
            newStats.pending.count += 1;
            newStats.pending.total += invoiceTotal;
          }
        });

        setStats(newStats);
      } catch (error) {
        toast({
          title: "Error loading invoice statistics",
          description: error.message || "Failed to load statistics",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceStats();
  }, [supabase, toast, updateTrigger]); // Add updateTrigger to dependency array

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Paid
          </CardTitle>
          <Check className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? (
              <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ) : (
              formatCurrency(stats.paid.total)
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.paid.count} {stats.paid.count === 1 ? "invoice" : "invoices"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Overdue
          </CardTitle>
          <AlertCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? (
              <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ) : (
              formatCurrency(stats.overdue.total)
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.overdue.count}{" "}
            {stats.overdue.count === 1 ? "invoice" : "invoices"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Pending
          </CardTitle>
          <Clock className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? (
              <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ) : (
              formatCurrency(stats.pending.total)
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.pending.count}{" "}
            {stats.pending.count === 1 ? "invoice" : "invoices"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceStats;
