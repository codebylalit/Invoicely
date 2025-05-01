import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { toast } from "@/components/ui/use-toast";

interface PayPalButtonProps {
  plan: string;
  amount: number;
  onSuccess: (plan: string) => void;
  disabled?: boolean;
  className?: string;
}

const PayPalButton = ({
  plan,
  amount,
  onSuccess,
  disabled = false,
  className = "",
}: PayPalButtonProps) => {
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
      console.log("Creating PayPal order...", {
        plan,
        userId: session.user.id,
        amount,
      });

      // Create a PayPal order
      const { data, error } = await supabase.functions.invoke(
        "create-paypal-order",
        {
          body: {
            plan,
            userId: session.user.id,
            amount,
          },
        }
      );

      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(error.message || "Failed to create PayPal order");
      }

      if (!data) {
        throw new Error("No data returned from PayPal order creation");
      }

      console.log("PayPal order created:", data);

      if (!data.approveUrl) {
        throw new Error("No PayPal approval URL received");
      }

      // Open PayPal checkout
      const paypalWindow = window.open(
        data.approveUrl,
        "PayPal",
        "width=500,height=600"
      );

      if (!paypalWindow) {
        throw new Error(
          "Failed to open PayPal window. Please check your popup blocker settings."
        );
      }

      // Listen for payment completion
      const handleMessage = async (event: MessageEvent) => {
        if (event.data.type === "PAYPAL_PAYMENT_COMPLETE") {
          try {
            console.log("Payment completed, verifying...", event.data);

            // Verify the payment
            const { data: verifyData, error: verifyError } =
              await supabase.functions.invoke("verify-paypal-payment", {
                body: {
                  orderId: event.data.orderId,
                  userId: session.user.id,
                },
              });

            if (verifyError) {
              console.error("Verification error:", verifyError);
              throw new Error(
                verifyError.message || "Payment verification failed"
              );
            }

            if (!verifyData?.success) {
              throw new Error("Payment verification failed");
            }

            // Close PayPal window immediately
            if (paypalWindow && !paypalWindow.closed) {
              paypalWindow.close();
            }

            // Show success toast
            toast({
              title: "Payment successful!",
              description: `You've successfully upgraded to the ${plan} plan!`,
            });

            // Update subscription
            onSuccess(plan);
          } catch (error: any) {
            console.error("Payment verification error:", error);
            toast({
              title: "Error",
              description: error.message || "Payment verification failed",
              variant: "destructive",
            });
          } finally {
            window.removeEventListener("message", handleMessage);
          }
        }
      };

      window.addEventListener("message", handleMessage);
    } catch (error: any) {
      console.error("PayPal error:", error);
      toast({
        title: "Payment failed",
        description:
          error.message ||
          "An error occurred during payment. Please try again.",
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
      className={`bg-[#0070BA] hover:bg-[#0070BA]/90 text-white ${className}`}
    >
      {loading ? "Processing..." : "Pay with PayPal"}
    </Button>
  );
};

export default PayPalButton;
