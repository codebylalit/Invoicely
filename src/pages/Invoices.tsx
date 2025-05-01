// This file shows how to implement the View functionality for invoices

// First, let's modify the Invoices.tsx component to add the view functionality

import { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import CreateInvoiceButton from "@/components/CreateInvoiceButton";
import { Button } from "@/components/ui/button";
import { Eye, Download, Trash, Check, AlertCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import InvoiceStats from "@/components/InvoiceStats";
import InvoicePreview from "@/components/InvoicePreview";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface Invoice {
  status: string;
  dueDate: string;
  name: string;
  email: string;
  details: string;
  items: InvoiceItem[];
  subtotal: number;
  total: number;
  fromCompany: string;
  invoiceNumber: string;
  invoiceTitle: string;
  issuedDate: string;
  notes: string;
  paymentMethods: PaymentMethod[];
  taxes: TaxItem[];
  discounts: DiscountItem[];
  showPaymentMethods?: boolean; // Add this line
}


interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}


interface TaxItem {
  id: string;
  name: string;
  rate: number;
  amount: number;
}

interface DiscountItem {
  id: string;
  name: string;
  rate: number;
  amount: number;
}

interface PaymentMethod {
  type: string;
  isEnabled: boolean;
  instructions?: string;
  connectURL?: string;
}
// Format the invoice data from Supabase to match the format expected by InvoicePreview
const formatInvoiceForPreview = (invoice: Invoice) => {
  // Parse the paymentMethods string if it exists, or provide a default empty array
  let parsedPaymentMethods = [];
  try {
    if (invoice.paymentMethods && typeof invoice.paymentMethods === 'string') {
      parsedPaymentMethods = JSON.parse(invoice.paymentMethods);
    }
  } catch (error) {
    console.error("Error parsing payment methods:", error);
  }

  return {
    invoiceNumber: invoice.invoice_number,
    issuedDate: invoice.created_at,
    dueDate: invoice.due_date,
    name: invoice.client_name,
    details: invoice.details,
    email: invoice.client_email,
    subtotal: invoice.total || 0,
    total: invoice.total || 0,
    invoiceTitle: "Invoice",
    items: invoice.items || [],
    discounts: invoice.discounts || [],
    taxes: invoice.taxes || [],
    notes: invoice.notes || "",
    // Ensure paymentMethods is properly structured
    paymentMethods: [
      {
        type: "bank",
        isEnabled: false,
        instructions: "",
      },
      {
        type: "stripe",
        isEnabled: false,
        connectURL: "",
      },
    ],
  };
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "paid":
      return "bg-green-500";
    case "pending":
      return "bg-yellow-500";
    case "overdue":
      return "bg-red-500";
    default:
      return "bg-gray-400"; // draft or other status
  }
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case "paid":
      return <Check className="mr-2 h-4 w-4" />;
    case "pending":
      return <Clock className="mr-2 h-4 w-4" />;
    case "overdue":
      return <AlertCircle className="mr-2 h-4 w-4" />;
    default:
      return null;
  }
};

const Invoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingInvoice, setViewingInvoice] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const supabase = useSupabaseClient();
  const { toast } = useToast();

  // Event bus for stats updates
  const [statsUpdateTrigger, setStatsUpdateTrigger] = useState(0);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading invoices",
        description: error.message || "Failed to load invoices",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const updateInvoiceStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("invoices")
        .update({ status })
        .match({ id });

      if (error) throw error;

      // Update local state
      setInvoices(
        invoices.map((inv) => (inv.id === id ? { ...inv, status } : inv))
      );

      // Trigger stats update
      setStatsUpdateTrigger((prev) => prev + 1);

      toast({
        title: "Status updated",
        description: `Invoice status changed to ${status}`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating status",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      const { error } = await supabase.from("invoices").delete().match({ id });

      if (error) throw error;

      // Update local state
      setInvoices(invoices.filter((inv) => inv.id !== id));

      // Trigger stats update
      setStatsUpdateTrigger((prev) => prev + 1);

      toast({
        title: "Invoice deleted",
        description: "The invoice has been successfully deleted",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting invoice",
        description: error.message || "Failed to delete invoice",
        variant: "destructive",
      });
    }
  };

  // Function to handle viewing an invoice
  const handleViewInvoice = async (invoice: Invoice) => {
    try {
      // Optional: Fetch more detailed invoice data if needed
      // For example, fetch invoice items, taxes, etc.
      /*
      const { data: invoiceItems, error: itemsError } = await supabase
        .from("invoice_items")
        .select("*")
        .eq("invoice_id", invoice.id);
        
      if (itemsError) throw itemsError;
      */

      // Format the invoice for the preview component
      const formattedInvoice = formatInvoiceForPreview(invoice);

      // Set the invoice to be viewed
      setViewingInvoice(formattedInvoice);

      // Open the preview dialog
      setIsPreviewOpen(true);
    } catch (error: any) {
      toast({
        title: "Error loading invoice details",
        description: error.message || "Failed to load invoice details",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="ml-64">
      <div className="flex items-start justify-between mb-6">

        <h1 className="text-3xl font-bold">Invoices</h1>
        <CreateInvoiceButton />
      </div>

      <InvoiceStats updateTrigger={statsUpdateTrigger} />

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-xl font-medium mb-2">No invoices yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Create your first invoice to get started
          </p>
          <CreateInvoiceButton />
        </div>
      ) : (
        <div className="grid gap-4">
          {invoices.map((inv) => (
            <Card key={inv.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50 dark:bg-gray-800 flex flex-row items-center justify-between p-4">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    #{inv.invoice_number || "Draft"}
                    <Badge className={`${getStatusColor(inv.status)}`}>
                      {inv.status}
                    </Badge>
                  </CardTitle>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {inv.client_name || "No client name"}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-xl font-bold">
                    ${(inv.total || 0).toFixed(2)}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className={`${getStatusColor(
                          inv.status
                        )} text-white border-none ml-2`}
                      >
                        {getStatusIcon(inv.status)}
                        {inv.status}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => updateInvoiceStatus(inv.id, "Paid")}
                        className="flex items-center"
                      >
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        <span>Paid</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => updateInvoiceStatus(inv.id, "Pending")}
                        className="flex items-center"
                      >
                        <Clock className="h-4 w-4 mr-2 text-yellow-500" />
                        <span>Pending</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => updateInvoiceStatus(inv.id, "Overdue")}
                        className="flex items-center"
                      >
                        <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                        <span>Overdue</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">
                        Created
                      </p>
                      <p>{formatDate(inv.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">
                        Due Date
                      </p>
                      <p>{formatDate(inv.due_date)}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 md:mt-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewInvoice(inv)}
                    >
                      <Download className="h-4 w-4 mr-1" /> Download
                    </Button>
                    {/* <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-1" /> Download
                    </Button> */}
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => deleteInvoice(inv.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Invoice Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl">
          {viewingInvoice && (
            <InvoicePreview invoice={viewingInvoice} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Invoices;
