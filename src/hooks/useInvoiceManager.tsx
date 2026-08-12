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
      // Get the highest invoice number from the database for this user
      let query = supabase
        .from("invoices")
        .select("invoice_number");

      if (session?.user?.id) {
        query = query.eq("user_id", session.user.id);
      }

      const { data, error } = await query
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
        template_id: invoiceData.template_id ?? null,
        show_watermark: invoiceData.show_watermark ?? true,
        page_size: invoiceData.page_size || 'auto',
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

      // Insert or update invoice in Supabase
      let data, error;
      if (invoiceData.id) {
        const res = await supabase
          .from("invoices")
          .update(supabaseInvoice)
          .eq("id", invoiceData.id)
          .select()
          .single();
        data = res.data;
        error = res.error;
      } else {
        const res = await supabase
          .from("invoices")
          .insert(supabaseInvoice)
          .select()
          .single();
        data = res.data;
        error = res.error;

        // ── Trigger automation: first_invoice_created or invoice_created ──────
        if (!error && data && session?.user?.email) {
          try {
            // Check if this is the user's first invoice
            const { count } = await supabase
              .from('invoices')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', session.user.id);

            const isFirst = (count ?? 0) === 1;
            const triggerEvent = isFirst ? 'first_invoice_created' : 'invoice_created';
            const idempotencyKey = isFirst
              ? `first_invoice_created_${session.user.id}`
              : `invoice_created_${data.id}`;

            await supabase.functions.invoke('trigger-automation-email', {
              body: {
                triggerEvent,
                idempotencyKey,
                recipientEmail: session.user.email,
                recipientName: session.user.email.split('@')[0],
                variables: {
                  userName: session.user.email.split('@')[0],
                  userEmail: session.user.email,
                  invoiceNumber: invoiceData.invoiceNumber ?? '',
                  invoiceAmount: `₹${Number(invoiceData.total ?? 0).toFixed(2)}`,
                  invoiceDueDate: invoiceData.dueDate ?? '',
                },
              },
            });
          } catch (autoErr) {
            console.warn('[automation] invoice creation email failed:', autoErr);
          }
        }

      }

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
