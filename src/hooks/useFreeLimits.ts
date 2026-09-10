import { useState, useEffect, useCallback } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";

// ── Plan Limits ───────────────────────────────────────────────────────────────
export const FREE_INVOICE_LIMIT = 5;   // invoices per calendar month
export const FREE_CLIENT_LIMIT = 10;   // total clients
export const FREE_EMAIL_LIMIT = 5;     // emails sent per calendar month

/** ISO string for the start of the current calendar month (UTC) */
function startOfThisMonth(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1)).toISOString();
}

export interface FreeLimits {
  /** Number of invoices created this calendar month */
  monthlyInvoiceCount: number;
  /** Total number of saved clients */
  clientCount: number;
  /** Number of invoice emails sent this calendar month (tracked via localStorage + profile field) */
  monthlyEmailCount: number;
  isLoading: boolean;
  /** Re-query all counts from Supabase */
  refetch: () => Promise<void>;
  /** Call after successfully sending an email to bump the local counter */
  incrementEmailCount: () => void;
}

/**
 * Queries Supabase to provide real usage counts for Free-plan limit enforcement.
 * Safe to call on Pro users too — limits are never enforced there, but the counts
 * are still valid for display purposes.
 */
export function useFreeLimits(): FreeLimits {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [monthlyInvoiceCount, setMonthlyInvoiceCount] = useState(0);
  const [clientCount, setClientCount] = useState(0);
  const [monthlyEmailCount, setMonthlyEmailCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // ── Email count persistence ──────────────────────────────────────────────────
  // We don't have a dedicated email_send_log table, so we track monthly email
  // sends in localStorage with a month-key so it auto-resets each month.
  const emailStorageKey = session?.user?.id
    ? `invoicely_emails_sent_${session.user.id}_${new Date().getFullYear()}_${new Date().getMonth()}`
    : null;

  const readEmailCount = useCallback((): number => {
    if (!emailStorageKey) return 0;
    try {
      return parseInt(localStorage.getItem(emailStorageKey) || "0", 10);
    } catch {
      return 0;
    }
  }, [emailStorageKey]);

  const incrementEmailCount = useCallback(() => {
    if (!emailStorageKey) return;
    try {
      const current = readEmailCount();
      localStorage.setItem(emailStorageKey, String(current + 1));
      setMonthlyEmailCount(current + 1);
    } catch {
      /* ignore storage errors */
    }
  }, [emailStorageKey, readEmailCount]);

  // ── Fetch counts from Supabase ───────────────────────────────────────────────
  const fetchCounts = useCallback(async () => {
    if (!session?.user?.id) {
      setMonthlyInvoiceCount(0);
      setClientCount(0);
      setMonthlyEmailCount(0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const monthStart = startOfThisMonth();

      // Run invoice count + client count in parallel
      const [invoiceResult, clientResult] = await Promise.all([
        supabase
          .from("invoices")
          .select("id", { count: "exact", head: true })
          .eq("user_id", session.user.id)
          .gte("created_at", monthStart),
        supabase
          .from("clients")
          .select("id", { count: "exact", head: true })
          .eq("user_id", session.user.id),
      ]);

      setMonthlyInvoiceCount(invoiceResult.count ?? 0);
      setClientCount(clientResult.count ?? 0);
    } catch (e) {
      console.warn("[useFreeLimits] Error fetching usage counts:", e);
    } finally {
      // Always read email count from localStorage (even on network errors)
      setMonthlyEmailCount(readEmailCount());
      setIsLoading(false);
    }
  }, [session?.user?.id, supabase, readEmailCount]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  return {
    monthlyInvoiceCount,
    clientCount,
    monthlyEmailCount,
    isLoading,
    refetch: fetchCounts,
    incrementEmailCount,
  };
}
