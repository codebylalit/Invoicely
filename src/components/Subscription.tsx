import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import RazorpayButton from "./subscription/RazorpayButton";

interface SubscriptionProps {
  userSubscription: {
    tier: string;
    paymentMethod: string | null;
    bankTransferDetails: string;
    subscriptionId: string;
    planId: string;
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
  const handleSubscriptionSuccess = async (plan: string, subscriptionId: string, planId: string) => {
    try {
      setUpgrading(true);

      // Update subscription in database with subscription and plan IDs
      const { error } = await supabase
        .from("profiles")
        .update({
          tier: plan,
          payment_method: "razorpay",
          subscription_id: subscriptionId,
          plan_id: planId,
          updated_at: new Date()
        })
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;

      // Update local state with subscription and plan IDs
      setUserSubscription((prev: any) => ({
        ...prev,
        tier: plan,
        paymentMethod: "razorpay",
        subscriptionId,
        planId
      }));

      // Show success message
      toast({
        title: "Subscription Upgraded!",
        description: `Your account has been successfully upgraded to the ${plan} plan.`,
      });

      // Refresh subscription tab
      navigate("/subscription?from=razorpay", { replace: true });

    } catch (error) {
      console.error("Error updating subscription:", error);
      toast({
        title: "Update Error",
        description: "Your payment was successful, but we couldn't update your subscription. Please contact support.",
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

      // Update subscription in database - clear subscription and plan IDs
      const { error } = await supabase
        .from("profiles")
        .update({
          tier: "free",
          payment_method: null,
          subscription_id: null,
          plan_id: null,
          updated_at: new Date()
        })
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;

      // Update local state
      setUserSubscription((prev: any) => ({
        ...prev,
        tier: "free",
        paymentMethod: null,
        subscriptionId: "",
        planId: ""
      }));

      // Show success message
      toast({
        title: "Subscription Cancelled",
        description: "Your Pro subscription has been cancelled. You are now on the Free plan.",
      });

      // Refresh subscription tab
      navigate("/subscription?from=cancel", { replace: true });

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

  // Display current subscription info if available
  const renderCurrentSubscriptionInfo = () => {
    if (userSubscription.subscriptionId) {
      return (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="font-medium text-invoice-lightText dark:text-invoice-darkText">Your Current Subscription</h3>
          <div className="mt-2 space-y-1 text-sm">
            <p><span className="font-medium">Subscription ID:</span> {userSubscription.subscriptionId}</p>
            {userSubscription.planId && <p><span className="font-medium">Plan ID:</span> {userSubscription.planId}</p>}
            <p><span className="font-medium">Current Tier:</span> {userSubscription.tier}</p>
            <p><span className="font-medium">Payment Method:</span> {userSubscription.paymentMethod || "None"}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-invoice-darkBg shadow rounded-lg p-6">
      <h2 className="text-lg font-medium mb-6 text-invoice-lightText dark:text-invoice-darkText">Simple pricing, no hidden fees</h2>
      {renderCurrentSubscriptionInfo()}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Free Plan */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-medium text-invoice-lightText dark:text-invoice-darkText">Free</h3>
            <div className="mt-2">
              <span className="text-2xl font-bold text-invoice-lightText dark:text-invoice-darkText">$0</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Perfect for getting started</p>

            <Button className="mt-4 w-full py-2 px-4 rounded-md text-center">
              Current Plan
            </Button>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <ul className="space-y-2">
              <li className="flex items-center text-sm text-invoice-lightText dark:text-invoice-darkText">
                <svg
                  className="h-4 w-4 mr-2 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Basic invoice creation
              </li>
              <li className="flex items-center text-sm text-invoice-lightText dark:text-invoice-darkText">
                <svg
                  className="h-4 w-4 mr-2 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Store up to 10 clients
              </li>
              <li className="flex items-center text-sm text-invoice-lightText dark:text-invoice-darkText">
                <svg
                  className="h-4 w-4 mr-2 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                3 templates
              </li>
              <li className="flex items-center text-sm text-invoice-lightText dark:text-invoice-darkText">
                <svg
                  className="h-4 w-4 mr-2 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                PDF export with watermark
              </li>
              <li className="flex items-center text-sm text-invoice-lightText dark:text-invoice-darkText">
                <svg
                  className="h-4 w-4 mr-2 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Logo branding
              </li>
              <li className="flex items-center text-sm text-invoice-lightText dark:text-invoice-darkText">
                <svg
                  className="h-4 w-4 mr-2 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Basic email support (72hr)
              </li>
            </ul>
          </div>
        </div>

        {/* Pro Plan */}
        <div className="border border-yellow-400 dark:border-green-400 rounded-lg overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-medium text-invoice-lightText dark:text-invoice-darkText">Pro</h3>
            <div className="mt-2">
              <span className="text-2xl font-bold text-invoice-lightText dark:text-invoice-darkText">$5</span>
              <span className="text-gray-500 dark:text-gray-400 ml-1">/mo</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">For growing businesses</p>

            {userSubscription.tier === "pro" ? (
              <div className="space-y-2">
                <Button className="mt-4 w-full py-2 px-4 rounded-md text-center cursor-not-allowed">
                  Current Plan
                </Button>
                <Button
                  variant="outline"
                  className="w-full py-2 px-4 rounded-md text-center"
                  onClick={handleCancelSubscription}
                  disabled={cancelling}
                >
                  {cancelling ? "Cancelling..." : "Cancel Subscription"}
                </Button>
              </div>
            ) : (
              <RazorpayButton
                plan="pro"
                amount={5}
                onSuccess={handleSubscriptionSuccess}
                disabled={upgrading}
                className="mt-4 w-full"
              />
            )}
          </div>

          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <ul className="space-y-2">
              <li className="flex items-center text-sm text-invoice-lightText dark:text-invoice-darkText">
                <svg
                  className="h-4 w-4 mr-2 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                AI-powered invoice generation
              </li>
              <li className="flex items-center text-sm text-invoice-lightText dark:text-invoice-darkText">
                <svg
                  className="h-4 w-4 mr-2 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Unlimited clients in portal
              </li>
              <li className="flex items-center text-sm text-invoice-lightText dark:text-invoice-darkText">
                <svg
                  className="h-4 w-4 mr-2 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                10+ premium templates
              </li>
              <li className="flex items-center text-sm text-invoice-lightText dark:text-invoice-darkText">
                <svg
                  className="h-4 w-4 mr-2 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Watermark-free exports
              </li>
              <li className="flex items-center text-sm text-invoice-lightText dark:text-invoice-darkText">
                <svg
                  className="h-4 w-4 mr-2 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Recurring invoices
              </li>
              <li className="flex items-center text-sm text-invoice-lightText dark:text-invoice-darkText">
                <svg
                  className="h-4 w-4 mr-2 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Send invoices directly via email
              </li>
              <li className="flex items-center text-sm text-invoice-lightText dark:text-invoice-darkText">
                <svg
                  className="h-4 w-4 mr-2 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Priority support (24hr)
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;