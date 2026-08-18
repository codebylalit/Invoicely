import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import RazorpayButton from "./subscription/RazorpayButton";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import {
  AlertTriangle,
  Calendar,
  CalendarX2,
  CheckCircle2,
  Clock,
  CreditCard,
  RefreshCw,
  XCircle,
  Zap,
} from "lucide-react";

interface SubscriptionProps {
  userSubscription: {
    tier: string;
    paymentMethod: string | null;
    bankTransferDetails: string;
    subscriptionStartDate?: string | null;
    subscriptionRenewalDate?: string | null;
    subscriptionEndDate?: string | null;
    billingCycle?: string;
    subscriptionStatus?: string;
  };
  setUserSubscription: (subscription: any) => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (iso: string | null | undefined): string => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const daysUntil = (iso: string | null | undefined): number | null => {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  return Math.ceil(diff / 86_400_000);
};

// ── Status Badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
  const s = (status || "").toLowerCase();
  if (s === "active")
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400">
        <CheckCircle2 className="h-3 w-3" /> Active
      </span>
    );
  if (s === "cancelled")
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400">
        <XCircle className="h-3 w-3" /> Cancelled
      </span>
    );
  if (s === "past_due")
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400">
        <AlertTriangle className="h-3 w-3" /> Past Due
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
      <Clock className="h-3 w-3" /> Inactive
    </span>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const Subscription = ({ userSubscription, setUserSubscription }: SubscriptionProps) => {
  const [upgrading, setUpgrading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [billingCycle, setBillingCycle] = useState(
    userSubscription.billingCycle === "yearly" ? "yearly" : "monthly"
  );
  const supabase = useSupabaseClient();

  const isPro = userSubscription.tier === "pro";

  // ── Renewal/Expiry Alert ─────────────────────────────────────────────────
  const renewalDays = daysUntil(userSubscription.subscriptionRenewalDate);
  const endDays = daysUntil(userSubscription.subscriptionEndDate);
  const effectiveDays = userSubscription.subscriptionEndDate ? endDays : renewalDays;
  const showAlert =
    isPro &&
    effectiveDays !== null &&
    effectiveDays >= 0 &&
    effectiveDays <= 7;

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSubscriptionSuccess = async (plan: string) => {
    try {
      setUpgrading(true);
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user?.id) {
        toast({
          title: "Authentication Error",
          description: "Please try signing in again before upgrading.",
          variant: "destructive",
        });
        return;
      }
      const userId = userData.user.id;

      const { error } = await supabase
        .from("profiles")
        .update({
          tier: plan,
          payment_method: "razorpay",
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (error) {
        console.error("Database update error:", error);
      }

      setUserSubscription((prev: any) => ({
        ...prev,
        tier: plan,
        paymentMethod: "razorpay",
      }));

      // Trigger pro_subscription_activated automation
      if (plan === "pro" && userData.user?.email) {
        try {
          await supabase.functions.invoke("trigger-automation-email", {
            body: {
              triggerEvent: "pro_subscription_activated",
              idempotencyKey: `pro_subscription_activated_${userId}`,
              recipientEmail: userData.user.email,
              recipientName: userData.user.email.split("@")[0],
              variables: {
                userName: userData.user.email.split("@")[0],
                userEmail: userData.user.email,
              },
            },
          });
        } catch (autoErr) {
          console.warn("[automation] Pro activation email failed:", autoErr);
        }
      }

      toast({
        title: "Subscription Upgraded! 🎉",
        description: `Your account has been upgraded to the ${plan} plan.`,
      });
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      console.error("Error updating subscription:", error);
      toast({
        title: "Update Error",
        description:
          "Your payment was successful, but we couldn't update your subscription. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setUpgrading(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setCancelling(true);
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user?.id) {
        toast({
          title: "Authentication Error",
          description: "Please try signing in again before cancelling.",
          variant: "destructive",
        });
        return;
      }
      const userId = userData.user.id;

      // Set subscription_end_date = current renewal date (access until end of paid period)
      // Mark status as cancelled
      const { error } = await supabase
        .from("profiles")
        .update({
          subscription_status: "cancelled",
          subscription_end_date:
            userSubscription.subscriptionRenewalDate || new Date().toISOString(),
          payment_method: null,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (error) {
        console.error("Error cancelling subscription:", error);
        toast({
          title: "Cancellation Error",
          description: "We couldn't cancel your subscription. Please contact support.",
          variant: "destructive",
        });
        return;
      }

      setUserSubscription((prev: any) => ({
        ...prev,
        subscriptionStatus: "cancelled",
        subscriptionEndDate: prev.subscriptionRenewalDate,
        paymentMethod: null,
      }));

      toast({
        title: "Subscription Cancelled",
        description:
          "Your Pro subscription has been cancelled. You'll keep Pro access until the end of your billing period.",
      });
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast({
        title: "Cancellation Error",
        description: "We couldn't cancel your subscription. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Renewal / Expiry Warning Alert ────────────────────────────────── */}
      {showAlert && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/30 px-4 py-3.5">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            {userSubscription.subscriptionEndDate ? (
              <>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                  Pro access ends{" "}
                  {effectiveDays === 0
                    ? "today"
                    : `in ${effectiveDays} day${effectiveDays === 1 ? "" : "s"}`}
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                  Your subscription was cancelled. Pro features will stop on{" "}
                  <strong>{fmtDate(userSubscription.subscriptionEndDate)}</strong>.
                  Re-subscribe anytime to keep access.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                  Renewal{" "}
                  {effectiveDays === 0
                    ? "due today"
                    : `in ${effectiveDays} day${effectiveDays === 1 ? "" : "s"}`}{" "}
                  — {fmtDate(userSubscription.subscriptionRenewalDate)}
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                  Make sure your payment method is up to date to avoid service interruption.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Current Subscription Details (Pro only) ────────────────────────── */}
      {isPro && (
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border/60 flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-foreground">Current Subscription</h3>
          </div>
          <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Plan */}
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Plan
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">Pro Growth ⚡</span>
                <StatusBadge status={userSubscription.subscriptionStatus || "active"} />
              </div>
            </div>

            {/* Price */}
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Price
              </p>
              <p className="text-sm font-semibold text-foreground">
                {userSubscription.billingCycle === "yearly"
                  ? "₹4,999 / year (~$59)"
                  : "₹499 / month (~$6)"}
              </p>
            </div>

            {/* Started on */}
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Started on
              </p>
              <p className="text-sm text-foreground">
                {fmtDate(userSubscription.subscriptionStartDate)}
              </p>
            </div>

            {/* Next Renewal / Plan Ends */}
            <div className="space-y-1">
              {userSubscription.subscriptionEndDate ? (
                <>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-rose-500 dark:text-rose-400 flex items-center gap-1">
                    <CalendarX2 className="h-3 w-3" /> Plan ends on
                  </p>
                  <p className="text-sm text-rose-600 dark:text-rose-400 font-semibold">
                    {fmtDate(userSubscription.subscriptionEndDate)}
                    {endDays !== null && endDays >= 0 && (
                      <span className="ml-2 text-xs font-normal text-rose-400">
                        ({endDays === 0 ? "today" : `in ${endDays} day${endDays === 1 ? "" : "s"}`})
                      </span>
                    )}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <RefreshCw className="h-3 w-3" /> Next renewal
                  </p>
                  <p className="text-sm text-foreground">
                    {fmtDate(userSubscription.subscriptionRenewalDate)}
                    {renewalDays !== null && renewalDays >= 0 && renewalDays <= 30 && (
                      <span
                        className={`ml-2 text-xs font-normal ${
                          renewalDays <= 7
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-muted-foreground"
                        }`}
                      >
                        ({renewalDays === 0 ? "today" : `in ${renewalDays} day${renewalDays === 1 ? "" : "s"}`})
                      </span>
                    )}
                  </p>
                </>
              )}
            </div>

            {/* Billing Cycle */}
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <CreditCard className="h-3 w-3" /> Billing cycle
              </p>
              <p className="text-sm text-foreground capitalize">
                {userSubscription.billingCycle || "monthly"}
              </p>
            </div>

            {/* Payment method */}
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Payment method
              </p>
              <p className="text-sm text-foreground">
                {userSubscription.paymentMethod
                  ? userSubscription.paymentMethod.charAt(0).toUpperCase() +
                    userSubscription.paymentMethod.slice(1)
                  : "—"}
              </p>
            </div>
          </div>

          {/* Cancel button (only if not already cancelled) */}
          {userSubscription.subscriptionStatus !== "cancelled" && (
            <div className="px-6 py-4 border-t border-border/60 bg-muted/30 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelSubscription}
                disabled={cancelling}
                className="text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs"
              >
                {cancelling ? "Cancelling..." : "Cancel Subscription"}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ── Pricing Plans ────────────────────────────────────────────────────── */}
      <div className="dark:bg-invoice-darkBg border border-gray-200 dark:border-gray-800 shadow-sm rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-invoice-lightText dark:text-invoice-darkText">
              Simple, Transparent Pricing
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Choose the plan that fits your business needs
            </p>
          </div>
          {/* Monthly / Yearly Toggle */}
          {!isPro && (
            <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex items-center self-start sm:self-auto">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  billingCycle === "monthly"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${
                  billingCycle === "yearly"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400"
                }`}
              >
                Yearly
                <span className="bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded text-[10px] font-bold">
                  Save 20%
                </span>
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free Plan */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden flex flex-col justify-between">
            <div className="p-6">
              <h3 className="text-lg font-bold text-invoice-lightText dark:text-invoice-darkText">
                Free Starter
              </h3>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-invoice-lightText dark:text-invoice-darkText">
                  $0
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">/ forever</span>
                <span className="text-xs text-gray-400 ml-1">(₹0)</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Perfect for getting started with basic invoices
              </p>
              <Button
                disabled={userSubscription.tier === "free"}
                className="mt-6 w-full py-2.5 rounded-lg text-center font-semibold"
              >
                {userSubscription.tier === "free" ? "Current Plan" : "Downgrade to Free"}
              </Button>
            </div>
            <div className="px-6 py-5 bg-gray-50/50 dark:bg-gray-800/40 border-t border-gray-200 dark:border-gray-700 space-y-2.5">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Included in Free:
              </p>
              {[
                "Up to 5 invoices per month",
                "3 Core Standard Templates",
                "Store up to 3 clients",
                "Basic email & bank transfer details",
                "Powered by Invoicely footer badge",
                "3 trial AI prompt generations",
              ].map((feat, i) => (
                <div key={i} className="flex items-center text-xs text-gray-700 dark:text-gray-300">
                  <svg
                    className="h-4 w-4 mr-2 text-emerald-500 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {feat}
                </div>
              ))}
            </div>
          </div>

          {/* Pro Plan */}
          <div className="border-2 border-amber-500 dark:border-amber-400 rounded-xl overflow-hidden flex flex-col justify-between shadow-md relative">
            <div className="absolute top-3 right-3 bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
              Recommended
            </div>
            <div className="p-6">
              <h3 className="text-lg font-bold text-invoice-lightText dark:text-invoice-darkText flex items-center gap-1.5">
                Pro Growth ⚡
              </h3>
              <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
                <span className="text-3xl font-black text-invoice-lightText dark:text-invoice-darkText">
                  {billingCycle === "monthly" ? "$6" : "$59"}
                </span>
                <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                  {billingCycle === "monthly" ? "/ month" : "/ year"}
                </span>
                <span className="text-xs font-semibold text-gray-400 ml-1">
                  {billingCycle === "monthly" ? "(~₹499 / mo)" : "(~₹4,999 / yr)"}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                For freelancers, agencies & growing businesses
              </p>

              {isPro ? (
                <div className="mt-6">
                  <Button className="w-full py-2.5 rounded-lg text-center font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-default">
                    ✓ Pro Active
                  </Button>
                </div>
              ) : (
                <div className="mt-6">
                  <RazorpayButton
                    plan="pro"
                    amount={billingCycle === "monthly" ? 499 : 4999}
                    onSuccess={handleSubscriptionSuccess}
                    disabled={upgrading}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg shadow-sm"
                  />
                </div>
              )}
            </div>

            <div className="px-6 py-5 bg-amber-50/50 dark:bg-amber-950/20 border-t border-amber-200 dark:border-amber-900/40 space-y-2.5">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-2">
                Everything in Free, plus:
              </p>
              {[
                "Unlimited Invoices & Unlimited Clients",
                "All 20 Premium Invoice Templates",
                "100% White-Label (Remove Invoicely branding)",
                "Live Client Payment Links + Confetti 🎉",
                "Unlimited AI Natural Language Prompt Generator",
                "GST & Multi-Currency auto-tax calculations",
                "Collection Autopilot & Automated Email Reminders",
              ].map((feat, i) => (
                <div
                  key={i}
                  className="flex items-center text-xs font-medium text-gray-800 dark:text-gray-200"
                >
                  <svg
                    className="h-4 w-4 mr-2 text-amber-500 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {feat}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;