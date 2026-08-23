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

  // Function to get the next available invoice number.
  //
  // Allocation happens in the database (next_invoice_number RPC) which takes a
  // row lock on the caller's counter. Doing it here in JS by reading MAX() was
  // both racy and wrong: invoice_number is text, so ordering it descending put
  // "999" above "1001" and handed out duplicate numbers.
  const getNextInvoiceNumber = async () => {
    try {
      const { data, error } = await supabase.rpc("next_invoice_number" as any);
      if (error) throw error;
      if (typeof data === "string" && data.length > 0) return data;
      throw new Error("Invoice numbering returned an empty value");
    } catch (error) {
      console.error("Error allocating next invoice number:", error);
      // Last-resort fallback so saving never hard-fails on numbering alone.
      // Timestamp-based, so it cannot collide with a counter-issued number.
      return `INV-${Date.now().toString().slice(-8)}`;
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

      // Coerce a scalar money field to a number. Arrays are NOT valid here —
      // taxes/discounts are handled separately by normalizeLines/sumLines below.
      const ensureNumeric = (value: any): number => {
        if (value === null || value === undefined) return 0;
        if (typeof value === "number") return isNaN(value) ? 0 : value;
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
      };

      // taxes/discounts are stored as jsonb arrays of {id, name, rate, amount}.
      // They used to be run through ensureNumeric, which turned the array into 0
      // and silently destroyed the breakdown on every save.
      const normalizeLines = (value: any) => {
        if (Array.isArray(value)) {
          return value.map((line: any, idx: number) => ({
            id: String(line?.id ?? idx),
            name: line?.name ?? "",
            rate: line?.rate === null || line?.rate === undefined ? null : ensureNumeric(line.rate),
            amount: ensureNumeric(line?.amount),
          }));
        }
        // Legacy drafts carried a single aggregate number.
        const legacy = ensureNumeric(value);
        return legacy > 0 ? [{ id: "0", name: "", rate: null, amount: legacy }] : [];
      };

      const sumLines = (lines: { amount: number }[]) =>
        lines.reduce((sum, line) => sum + (Number(line.amount) || 0), 0);

      const taxLines = normalizeLines(invoiceData.taxes);
      const discountLines = normalizeLines(invoiceData.discounts);

      // Independent DB plan verification before saving
      let isProUser = false;
      try {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("tier")
          .eq("user_id", session.user.id)
          .maybeSingle();
        if (profileData?.tier) {
          const rawTier = String(profileData.tier).toLowerCase();
          isProUser = rawTier.includes("pro") || rawTier.includes("admin");
        }
      } catch (_) {}

      const reqTemplateId = invoiceData.template_id ?? 0;
      const validTemplateId = (reqTemplateId <= 2 || isProUser) ? reqTemplateId : 0;

      // Prepare invoice data for Supabase with strict Pro/Free enforcement
      const supabaseInvoice = {
        user_id: session.user.id,
        invoice_number: invoiceData.invoiceNumber,
        status: invoiceData.status || "draft",
        due_date: invoiceData.dueDate || null,
        // Ensure all numeric fields use proper values
        total: ensureNumeric(invoiceData.total),
        subtotal: ensureNumeric(invoiceData.subtotal),
        taxes: taxLines,
        discounts: discountLines,
        tax_total: sumLines(taxLines),
        discount_total: sumLines(discountLines),
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
        template_id: validTemplateId,
        // Free users MUST have watermark = true
        show_watermark: isProUser ? (invoiceData.show_watermark ?? true) : true,
        page_size: invoiceData.page_size || 'auto',
        // Free users CANNOT create recurring invoices
        is_recurring: isProUser ? (invoiceData.is_recurring || false) : false,
        recurrence_frequency: isProUser && invoiceData.is_recurring ? invoiceData.recurrence_frequency || null : null,
        recurrence_interval: isProUser && invoiceData.is_recurring ? invoiceData.recurrence_interval || 1 : 1,
        recurrence_start_date: isProUser && invoiceData.is_recurring ? invoiceData.recurrence_start_date || null : null,
        recurrence_end_date: isProUser && invoiceData.is_recurring ? invoiceData.recurrence_end_date || null : null,
        next_recurrence_date: isProUser && invoiceData.is_recurring
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
