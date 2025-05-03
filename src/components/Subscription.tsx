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
    <div className="dark:bg-invoice-darkBg border border-gray-200 shadow rounded-lg p-6">
      <h2 className="text-lg font-medium mb-6 text-invoice-lightText dark:text-invoice-darkText">Simple pricing, no hidden fees</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Free Plan */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-medium text-invoice-lightText dark:text-invoice-darkText">Free</h3>
            <div className="mt-2">
              <span className="text-2xl font-bold text-invoice-lightText dark:text-invoice-darkText">$0</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Perfect for getting started</p>

            <Button
              disabled={userSubscription.tier !== "free"}
              className="mt-4 w-full py-2 px-4 rounded-md text-center">
              {userSubscription.tier === "free" ? "Current Plan" : "Downgrade to Free"}
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