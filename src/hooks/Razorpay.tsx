import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import {
  loadRazorpayScript,
  initializeRazorpayCheckout,
} from "../components/subscription/amazonpay";
import { toast } from "@/hooks/use-toast";

interface RazorpayCheckoutProps {
  plan: string;
  amount: number;
  onSuccess: (plan: string) => void;
  disabled?: boolean;
  className?: string;
}

const RazorpayCheckout = ({
  plan,
  amount,
  onSuccess,
  disabled = false,
  className = "",
}: RazorpayCheckoutProps) => {
  const [loading, setLoading] = useState(false);
  const session = useSession();
  const supabase = useSupabaseClient();

  const handlePayment = async () => {
    if (!session?.user) {
      toast({
        title: "Error",
        description: "You must be logged in to upgrade your subscription.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Load Razorpay script
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error("Failed to load Razorpay checkout");
      }

      // Call Supabase Edge function to create Razorpay order
      const { data, error } = await supabase.functions.invoke(
        "create-razorpay-order",
        {
          body: {
            plan: plan,
            userId: session.user.id,
          },
        }
      );

      if (error || !data) {
        console.error("Edge function error:", error);
        throw new Error(error?.message || "Failed to create payment order");
      }

      // Initialize Razorpay checkout with the order ID
      initializeRazorpayCheckout({
        razorpayOrderId: data.orderId,
        amount: amount,
        userEmail: session.user.email || "",
        userName: session.user.user_metadata?.full_name || "",
        keyId: data.keyId,
        subscriptionPlan: plan,
        onSuccess: async (paymentId, orderId, signature) => {
          try {
            // Verify the payment with our Supabase Edge function
            const { data: verifyData, error: verifyError } =
              await supabase.functions.invoke("verify-razorpay-payment", {
                body: {
                  paymentId,
                  orderId,
                  signature,
                  userId: session.user.id,
                },
              });

            if (verifyError || !verifyData?.success) {
              throw new Error(
                verifyError?.message || "Payment verification failed"
              );
            }

            toast({
              title: "Payment successful",
              description: `You've successfully upgraded to the ${plan} plan!`,
            });

            // Call the onSuccess callback to update the UI
            onSuccess(plan);
          } catch (error: any) {
            console.error("Payment verification error:", error);
            toast({
              title: "Error",
              description: error.message || "Payment verification failed",
              variant: "destructive",
            });
          }
        },
        onError: (error) => {
          console.error("Razorpay error:", error);
          toast({
            title: "Payment failed",
            description: "An error occurred during payment. Please try again.",
            variant: "destructive",
          });
        },
      });
    } catch (error: any) {
      console.error("Payment initiation error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to initiate payment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || loading}
      className={className}
    >
      {loading ? "Processing..." : "Pay with Razorpay"}
    </Button>
  );
};

export default RazorpayCheckout;