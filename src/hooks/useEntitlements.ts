import { useState, useEffect, useCallback } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";

export type PlanTier = "free" | "pro" | "admin";

// ── Plan Limit Constants ──────────────────────────────────────────────────────
export const FREE_INVOICE_LIMIT = 5;   // per calendar month
export const FREE_CLIENT_LIMIT = 10;   // total saved clients
export const FREE_EMAIL_LIMIT = 5;     // per calendar month

export interface Entitlements {
  tier: PlanTier;
  isPro: boolean;
  isLoading: boolean;
  canUseRecurringInvoices: boolean;
  canRemoveWatermark: boolean;
  canUseTemplate: (templateId?: number | null) => boolean;
  canSendEmail: boolean;
  /** Returns true if the user can create another invoice (based on monthly count) */
  canCreateInvoice: (monthlyCount: number) => boolean;
  /** Returns true if the user can add another client (based on total count) */
  canAddClient: (totalCount: number) => boolean;
  /** Returns true if the user can send another email (based on monthly count) */
  canSendEmailWithLimit: (monthlyCount: number) => boolean;
  refetch: () => Promise<void>;
}

export function useEntitlements(): Entitlements {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [tier, setTier] = useState<PlanTier>("free");
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    if (!session?.user?.id) {
      setTier("free");
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("tier")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (error) {
        console.warn("[Entitlements] Error loading profile tier, defaulting to free:", error.message);
        setTier("free");
      } else if (data?.tier) {
        const rawTier = String(data.tier).toLowerCase().trim();
        if (rawTier.includes("pro")) {
          setTier("pro");
        } else if (rawTier.includes("admin")) {
          setTier("admin");
        } else {
          setTier("free");
        }
      } else {
        setTier("free");
      }
    } catch (e) {
      console.warn("[Entitlements] Unexpected error, defaulting to free:", e);
      setTier("free");
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, supabase]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // Failsafe calculations: If loading or not pro/admin, evaluate to false/free limits
  const isPro = !isLoading && (tier === "pro" || tier === "admin");
  const canUseRecurringInvoices = isPro;
  const canRemoveWatermark = isPro;
  // Sending is deliberately NOT gated. It is the action that produces the
  // sent/viewed/paid history the rest of the product is built on; charging for
  // it means free users never generate any of that data.
  const canSendEmail = true;
  // Client storage is deliberately NOT capped either. A cap on saved clients
  // lands on day one, before the user has sent anything or seen any value, and
  // it throttles the only free acquisition channel we have — every invoice a
  // free user sends carries our badge to another business owner. Rows are
  // effectively free; blocking onboarding is not. Pro sells brand removal and
  // automation instead.

  const canUseTemplate = useCallback(
    (templateId?: number | null): boolean => {
      if (templateId === undefined || templateId === null) return true;
      // Free templates: 0 (Minimal White), 1 (Modern SaaS), 2 (Stripe Inspired)
      // Pro templates: 3..19
      if (templateId <= 2) return true;
      return isPro;
    },
    [isPro]
  );

  // ── Usage-Volume Guards ───────────────────────────────────────────────────
  const canCreateInvoice = useCallback(
    (monthlyCount: number): boolean => {
      if (isPro) return true;
      return monthlyCount < FREE_INVOICE_LIMIT;
    },
    [isPro]
  );

  const canAddClient = useCallback(
    (totalCount: number): boolean => {
      if (isPro) return true;
      return totalCount < FREE_CLIENT_LIMIT;
    },
    [isPro]
  );

  const canSendEmailWithLimit = useCallback(
    (monthlyCount: number): boolean => {
      if (isPro) return true;
      return monthlyCount < FREE_EMAIL_LIMIT;
    },
    [isPro]
  );

  return {
    tier,
    isPro,
    isLoading,
    canUseRecurringInvoices,
    canRemoveWatermark,
    canUseTemplate,
    canSendEmail,
    canCreateInvoice,
    canAddClient,
    canSendEmailWithLimit,
    refetch: fetchSubscription,
  };
}
