import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { toast } from "@/components/ui/use-toast";

interface RazorpayButtonProps {
    plan: string;
    amount: number;
    onSuccess: (plan: string) => void;
    disabled?: boolean;
    className?: string;
}

const RazorpayButton = ({
    plan,
    amount,
    onSuccess,
    disabled = false,
    className = "",
}: RazorpayButtonProps) => {
    const [loading, setLoading] = useState(false);
    const session = useSession();
    const supabase = useSupabaseClient();

    const loadRazorpayScript = (): Promise<void> => {
        return new Promise((resolve, reject) => {
            if (document.querySelector("script[src='https://checkout.razorpay.com/v1/checkout.js']")) {
                resolve(); // Script already loaded
                return;
            }

            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Failed to load Razorpay script"));
            document.body.appendChild(script);
        });
    };


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
            // Create a Razorpay order
            const { data, error } = await supabase.functions.invoke("create-razorpay-order", {
                body: {
                    plan,
                    userId: session.user.id,
                    amount,
                },
            });

            if (error || !data?.orderId) {
                throw new Error(error?.message || "Failed to create payment order");
            }

            // Ensure Razorpay script is loaded
            await loadRazorpayScript();

            const options = {
                key: data.keyId,
                amount: amount * 100,
                currency: "USD",
                name: "Invoicely",
                description: `${plan} Plan Subscription`,
                order_id: data.orderId,
                handler: async function (response: any) {
                    try {
                        const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
                            "verify-razorpay-payment",
                            {
                                body: {
                                    paymentId: response.razorpay_payment_id,
                                    orderId: response.razorpay_order_id,
                                    signature: response.razorpay_signature,
                                    userId: session.user.id,
                                },
                            }
                        );

                        if (verifyError || !verifyData?.success) {
                            throw new Error(verifyError?.message || "Payment verification failed");
                        }

                        toast({
                            title: "Payment successful",
                            description: `You've successfully upgraded to the ${plan} plan!`,
                        });

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
                prefill: {
                    name: session.user.user_metadata?.full_name || "",
                    email: session.user.email || "",
                },
                theme: {
                    color: "#6366F1",
                },
            };

            // @ts-ignore
            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error: any) {
            console.error("Razorpay error:", error);
            toast({
                title: "Payment failed",
                description: error.message || "An error occurred during payment. Please try again.",
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
            className={`bg-[#6366F1] hover:bg-[#6366F1]/90 text-white ${className}`}
        >
            {loading ? "Processing..." : "Pay with Razorpay"}
        </Button>
    );
};

export default RazorpayButton; 