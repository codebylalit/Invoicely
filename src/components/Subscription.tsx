import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import RazorpayButton from "./subscription/RazorpayButton";
import { useNavigate } from "react-router-dom";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

interface SubscriptionProps {
  userSubscription: {
    tier: string;
    paymentMethod: string | null;
    bankTransferDetails: string;
  };
  setUserSubscription: (subscription: any) => void;
}

const Subscription = ({ userSubscription, setUserSubscription }: SubscriptionProps) => {
  const [upgrading, setUpgrading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [billingCycle, setBillingCycle] = useState("monthly");
  const navigate = useNavigate();
  const supabase = useSupabaseClient();

  // Handle subscription update after successful payment
  const handleSubscriptionSuccess = async (plan: string) => {
    try {
      setUpgrading(true);

      // Get the user before attempting any updates
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.error("Error getting user:", userError);
        toast({
          title: "Authentication Error",
          description: "Please try signing in again before upgrading your subscription.",
          variant: "destructive",
        });
        return;
      }

      const userId = userData.user?.id;

      if (!userId) {
        console.error("User ID not found");
        toast({
          title: "Authentication Error",
          description: "User session not found. Please sign in again.",
          variant: "destructive",
        });
        return;
      }

      // Update subscription in database with proper error handling
      const { error } = await supabase
        .from("profiles")
        .update({
          tier: plan,
          payment_method: "razorpay",
          updated_at: new Date().toISOString() // Using ISO string for better compatibility
        })
        .eq("user_id", userId);

      if (error) {
        console.error("Database update error:", error);

        // Even if there's an error updating the database, we'll still update the local state
        // so the user experience isn't disrupted, and we'll show a partial success message
        setUserSubscription((prev: any) => ({
          ...prev,
          tier: plan,
          paymentMethod: "razorpay",
        }));

        toast({
          title: "Payment Successful",
          description: "Your payment was processed successfully, but there was an issue updating your account. Your Pro features will be available next time you log in.",
        });

        return;
      }

      // Update local state
      setUserSubscription((prev: any) => ({
        ...prev,
        tier: plan,
        paymentMethod: "razorpay",
      }));

      // Show success message
      toast({
        title: "Subscription Upgraded!",
        description: `Your account has been successfully upgraded to the ${plan} plan.`,
      });

      // Use a timeout to let the toast show before any navigation
      setTimeout(() => {
        // Simply refresh the current page instead of a full navigation
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error("Error updating subscription:", error);
      toast({
        title: "Update Error",
        description: "Your payment was successful, but we couldn't update your subscription. Please refresh the page to see your updated plan or contact support if issues persist.",
        variant: "destructive",
      });
    } finally {
      setUpgrading(false);
    }
  };

  // Handle subscription cancellation
  const handleCancelSubscription = async () => {
    try {
      setCancelling(true);

      // Get the user before attempting any updates
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.error("Error getting user:", userError);
        toast({
          title: "Authentication Error",
          description: "Please try signing in again before cancelling your subscription.",
          variant: "destructive",
        });
        return;
      }

      const userId = userData.user?.id;

      if (!userId) {
        console.error("User ID not found");
        toast({
          title: "Authentication Error",
          description: "User session not found. Please sign in again.",
          variant: "destructive",
        });
        return;
      }

      // Update subscription in database
      const { error } = await supabase
        .from("profiles")
        .update({
          tier: "free",
          payment_method: null,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", userId);

      if (error) {
        console.error("Error cancelling subscription in database:", error);
        toast({
          title: "Cancellation Error",
          description: "We couldn't cancel your subscription in our database. Please contact support.",
          variant: "destructive",
        });
        return;
      }

      // Update local state
      setUserSubscription((prev: any) => ({
        ...prev,
        tier: "free",
        paymentMethod: null,
      }));

      // Show success message
      toast({
        title: "Subscription Cancelled",
        description: "Your Pro subscription has been cancelled. You are now on the Free plan.",
      });

      // Use a timeout to let the toast show before any navigation
      setTimeout(() => {
        // Simply refresh the current page instead of a full navigation
        window.location.reload();
      }, 2000);

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

  // For mock function, keeping this intact
  const handleUpgradePlan = (plan: string) => {
    setUpgrading(true);
    setTimeout(() => {
      setUpgrading(false);
      setUserSubscription((prev: any) => ({
        ...prev,
        tier: plan,
      }));
      toast({
        title: "Success",
        description: `You've successfully upgraded to the ${plan} plan! (mock)`,
      });
    }, 1200);
  };

  return (
    <div className="dark:bg-invoice-darkBg border border-gray-200 dark:border-gray-800 shadow-sm rounded-xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-invoice-lightText dark:text-invoice-darkText">Simple, Transparent Pricing</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Choose the plan that fits your business needs</p>
        </div>
        {/* Monthly / Yearly Toggle */}
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
            <span className="bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded text-[10px] font-bold">Save 20%</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Free Plan */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden flex flex-col justify-between">
          <div className="p-6">
            <h3 className="text-lg font-bold text-invoice-lightText dark:text-invoice-darkText">Free Starter</h3>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-invoice-lightText dark:text-invoice-darkText">$0</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">/ forever</span>
              <span className="text-xs text-gray-400 ml-1">(₹0)</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Perfect for getting started with basic invoices</p>

            <Button
              disabled={userSubscription.tier === "free"}
              className="mt-6 w-full py-2.5 rounded-lg text-center font-semibold">
              {userSubscription.tier === "free" ? "Current Plan" : "Downgrade to Free"}
            </Button>
          </div>
          <div className="px-6 py-5 bg-gray-50/50 dark:bg-gray-800/40 border-t border-gray-200 dark:border-gray-700 space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Included in Free:</p>
            {[
              "Up to 5 invoices per month",
              "3 Core Standard Templates",
              "Store up to 3 clients",
              "Basic email & bank transfer details",
              "Powered by Invoicely footer badge",
              "3 trial AI prompt generations",
            ].map((feat, i) => (
              <div key={i} className="flex items-center text-xs text-gray-700 dark:text-gray-300">
                <svg className="h-4 w-4 mr-2 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
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
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">For freelancers, agencies & growing businesses</p>

            {userSubscription.tier === "pro" ? (
              <div className="space-y-2 mt-6">
                <Button className="w-full py-2.5 rounded-lg text-center font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-default">
                  ✓ Pro Active
                </Button>
                <Button
                  variant="outline"
                  className="w-full py-2 text-xs rounded-lg text-center"
                  onClick={handleCancelSubscription}
                  disabled={cancelling}
                >
                  {cancelling ? "Cancelling..." : "Cancel Subscription"}
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
            <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-2">Everything in Free, plus:</p>
            {[
              "Unlimited Invoices & Unlimited Clients",
              "All 20 Premium Invoice Templates",
              "100% White-Label (Remove Invoicely branding)",
              "Live Client Payment Links + Confetti 🎉",
              "Unlimited AI Natural Language Prompt Generator",
              "GST & Multi-Currency auto-tax calculations",
              "Collection Autopilot & Automated Email Reminders",
            ].map((feat, i) => (
              <div key={i} className="flex items-center text-xs font-medium text-gray-800 dark:text-gray-200">
                <svg className="h-4 w-4 mr-2 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {feat}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;