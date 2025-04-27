import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

// Edge function to verify Razorpay payment
export async function verifyRazorpayPayment(
  paymentId: string, 
  orderId: string, 
  signature: string, 
  userId: string
) {
  // Get the Razorpay API key and secret from Supabase secrets
  const supabaseUrl = process.env.SUPABASE_URL || "";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase configuration");
  }

  // Initialize Supabase client with service role for admin access
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Get Razorpay secret key from Supabase secrets
    const { data: secretData, error: secretError } = await supabase
      .from("secrets")
      .select("value")
      .eq("name", "RAZORPAY_KEY_SECRET")
      .single();

    if (secretError) {
      console.error("Error fetching Razorpay key:", secretError);
      throw new Error("Failed to fetch Razorpay secret key");
    }

    const keySecret = secretData?.value;

    if (!keySecret) {
      throw new Error("Razorpay secret key not found");
    }

    // Verify the payment signature
    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body)
      .digest("hex");

    const isSignatureValid = expectedSignature === signature;

    if (!isSignatureValid) {
      throw new Error("Payment verification failed");
    }

    // Fetch the order details from Razorpay to get the plan
    const response = await fetch(`https://api.razorpay.com/v1/orders/${orderId}`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${btoa(`${secretData.value}:${keySecret}`)}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch order details");
    }

    const orderData = await response.json();
    const plan = orderData.notes.plan;

    // Update user subscription in Supabase
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        tier: plan,
        payment_method: "razorpay",
        payment_id: paymentId,
        updated_at: new Date(),
      })
      .eq("user_id", userId);

    if (updateError) {
      throw new Error(`Failed to update subscription: ${updateError.message}`);
    }

    // Create a payment record
    const { error: paymentError } = await supabase.from("payments").insert([
      {
        user_id: userId,
        payment_id: paymentId,
        order_id: orderId,
        amount: orderData.amount / 100, // Convert from paise to dollars
        currency: orderData.currency,
        plan: plan,
        status: "completed",
        provider: "razorpay",
        created_at: new Date(),
      },
    ]);

    if (paymentError) {
      console.error("Error creating payment record:", paymentError);
      // Not throwing error here as the payment has been verified and subscription updated
    }

    return {
      success: true,
      plan: plan,
    };
  } catch (error: any) {
    console.error("Payment verification error:", error);
    throw new Error(`Payment verification failed: ${error.message}`);
  }
}