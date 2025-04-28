import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import PayPalButton from "./subscription/PayPalButton";
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
  const [billingCycle, setBillingCycle] = useState("monthly");
  const navigate = useNavigate();
  const supabase = useSupabaseClient();

  // Handle subscription update after successful payment
  const handleSubscriptionSuccess = async (plan: string) => {
    try {
      setUpgrading(true);
      
      // Update subscription in database
      const { error } = await supabase
        .from("profiles")
        .update({
          tier: plan,
          payment_method: "paypal",
          updated_at: new Date()
        })
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id);
      
      if (error) throw error;
      
      // Update local state
      setUserSubscription((prev: any) => ({
        ...prev,
        tier: plan,
        paymentMethod: "paypal",
      }));
      
      // Show success message
      toast({
        title: "Subscription Upgraded!",
        description: `Your account has been successfully upgraded to the ${plan} plan.`,
      });
      
      // Refresh subscription tab
      navigate("/app/settings?from=paypal", { replace: true });
      
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

  // Handle upgrade to selected plan (mock function)
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
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium mb-6">Simple pricing, no hidden fees</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Free Plan */}
        <div className="border rounded-lg overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-medium">Free</h3>
            <div className="mt-2">
              <span className="text-2xl font-bold">$0</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Perfect for getting started</p>

            <button className="mt-4 w-full py-2 px-4 rounded-md text-center bg-gray-200 hover:bg-gray-300 text-gray-700">
              Current Plan
            </button>
          </div>

          <div className="px-6 py-4 border-t">
            <ul className="space-y-2">
              <li className="flex items-center text-sm">
                <svg
                  className="h-4 w-4 mr-2 text-green-500"
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
              <li className="flex items-center text-sm">
                <svg
                  className="h-4 w-4 mr-2 text-green-500"
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
              <li className="flex items-center text-sm">
                <svg
                  className="h-4 w-4 mr-2 text-green-500"
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
              <li className="flex items-center text-sm">
                <svg
                  className="h-4 w-4 mr-2 text-green-500"
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
              <li className="flex items-center text-sm">
                <svg
                  className="h-4 w-4 mr-2 text-green-500"
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
              <li className="flex items-center text-sm">
                <svg
                  className="h-4 w-4 mr-2 text-green-500"
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
        <div className="border rounded-lg overflow-hidden border-green-500">
          <div className="p-6">
            <h3 className="text-lg font-medium">Pro</h3>
            <div className="mt-2">
              <span className="text-2xl font-bold">$5</span>
              <span className="text-gray-500 ml-1">/mo</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">For growing businesses</p>

            {userSubscription.tier === "pro" ? (
              <button className="mt-4 w-full py-2 px-4 rounded-md text-center bg-gray-200 text-gray-700 cursor-not-allowed">
                Current Plan
              </button>
            ) : (
              <PayPalButton
                plan="pro"
                amount={5}
                onSuccess={handleSubscriptionSuccess}
                disabled={upgrading}
                className="mt-4 w-full"
              />
            )}
          </div>

          <div className="px-6 py-4 border-t">
            <ul className="space-y-2">
              <li className="flex items-center text-sm">
                <svg
                  className="h-4 w-4 mr-2 text-green-500"
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
              <li className="flex items-center text-sm">
                <svg
                  className="h-4 w-4 mr-2 text-green-500"
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
              <li className="flex items-center text-sm">
                <svg
                  className="h-4 w-4 mr-2 text-green-500"
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
              <li className="flex items-center text-sm">
                <svg
                  className="h-4 w-4 mr-2 text-green-500"
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
              <li className="flex items-center text-sm">
                <svg
                  className="h-4 w-4 mr-2 text-green-500"
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
              <li className="flex items-center text-sm">
                <svg
                  className="h-4 w-4 mr-2 text-green-500"
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
              <li className="flex items-center text-sm">
                <svg
                  className="h-4 w-4 mr-2 text-green-500"
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