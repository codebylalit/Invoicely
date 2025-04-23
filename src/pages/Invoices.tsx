
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

interface Invoice {
  id: string;
  status: string;
  due_date?: string;
  invoice_number?: string;
  amount?: number;
  created_at?: string;
  updated_at?: string;
}

const Invoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setInvoices(data ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Invoice History</h1>
      {loading ? (
        <div>Loading invoices...</div>
      ) : invoices.length === 0 ? (
        <div>No invoices found.</div>
      ) : (
        <div className="grid gap-3">
          {invoices.map(inv => (
            <Card key={inv.id}>
              <CardHeader>
                <CardTitle>
                  Invoice {inv.invoice_number || "(No number)"} -{" "}
                  <span className="capitalize">{inv.status}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">Amount: {inv.amount ? `$${inv.amount}` : "N/A"}</div>
                <div className="text-sm">Due: {inv.due_date || "N/A"}</div>
                <div className="text-sm">Created: {inv.created_at?.slice(0, 10) || "N/A"}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Invoices;
