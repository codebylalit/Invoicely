import { useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useToast } from "@/hooks/use-toast";
import type { Invoice } from "@/types/invoice";

// Hook to handle invoice saving and sequential numbering
export function useInvoiceManager() {
  const [isSaving, setIsSaving] = useState(false);
  const supabase = useSupabaseClient();
  const session = useSession();
  const { toast } = useToast();

  // Function to get the next available invoice number
  const getNextInvoiceNumber = async () => {
    try {
      // Get the highest invoice number from the database
      const { data, error } = await supabase
        .from("invoices")
        .select("invoice_number")
        .order("invoice_number", { ascending: false })
        .limit(1);

      if (error) throw error;

      // If we have invoices, increment the highest number, otherwise start at 1001
      if (data && data.length > 0 && data[0].invoice_number) {
        // Extract numeric part if invoice number has a prefix
        const currentNumber = parseInt(
          data[0].invoice_number.replace(/\D/g, ""),
          10
        );
        return isNaN(currentNumber) ? "1001" : (currentNumber + 1).toString();
      } else {
        return "1001"; // Starting invoice number
      }
    } catch (error) {
      console.error("Error fetching next invoice number:", error);
      return "1001"; // Fallback to 1001 if error
    }
  };

  // Function to save an invoice to Supabase
  const saveInvoice = async (invoiceData: Invoice) => {
    if (!session?.user?.id) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to save invoices",
        variant: "destructive",
      });
      return null;
    }

    setIsSaving(true);

    try {
      // If invoice number is not set, get the next sequential number
      if (!invoiceData.invoiceNumber || invoiceData.invoiceNumber === "") {
        invoiceData.invoiceNumber = await getNextInvoiceNumber();
      }

      // Helper function to ensure numeric values (convert empty arrays, undefined, or null to 0)
      const ensureNumeric = (value: any): number => {
        // If value is an array (empty or not), or null/undefined
        if (Array.isArray(value) || value === null || value === undefined) {
          return 0;
        }
        // If value is already a number, return it
        if (typeof value === "number") {
          return value;
        }
        // Try to parse as number, default to 0 if fails
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
      };

      // Prepare invoice data for Supabase
      const supabaseInvoice = {
        user_id: session.user.id,
        invoice_number: invoiceData.invoiceNumber,
        status: invoiceData.status || "draft",
        due_date: invoiceData.dueDate || null,
        // Ensure all numeric fields use proper values
        total: ensureNumeric(invoiceData.total),
        subtotal: ensureNumeric(invoiceData.subtotal),
        taxes: ensureNumeric(invoiceData.taxes),
        discounts: ensureNumeric(invoiceData.discounts),
        // Other fields
        invoice_title: invoiceData.invoiceTitle || null,
        issued_date: invoiceData.issuedDate || null,
        client_name: invoiceData.name || null,
        client_email: invoiceData.email || null,
        details: invoiceData.details || null,
        notes: invoiceData.notes || null,
        // Make sure complex objects are properly converted to JSONB
        items: invoiceData.items || [],
        payment_methods: invoiceData.paymentMethods || [],
        // Recurring fields
        is_recurring: invoiceData.is_recurring || false,
        recurrence_frequency: invoiceData.is_recurring ? invoiceData.recurrence_frequency || null : null,
        recurrence_interval: invoiceData.is_recurring ? invoiceData.recurrence_interval || 1 : 1,
        recurrence_start_date: invoiceData.is_recurring ? invoiceData.recurrence_start_date || null : null,
        recurrence_end_date: invoiceData.is_recurring ? invoiceData.recurrence_end_date || null : null,
        next_recurrence_date: invoiceData.is_recurring
          ? (invoiceData.next_recurrence_date || invoiceData.recurrence_start_date || null)
          : null,
      };

      // Insert invoice into Supabase
      const { data, error } = await supabase
        .from("invoices")
        .insert(supabaseInvoice)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Invoice saved",
        description: `Invoice #${invoiceData.invoiceNumber} has been saved`,
      });

      return data;
    } catch (error: any) {
      console.error("Error saving invoice:", error);
      toast({
        title: "Failed to save invoice",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    saveInvoice,
    isSaving,
    getNextInvoiceNumber,
  };
}
