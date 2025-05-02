import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import crypto from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { paymentId, orderId, signature, userId } = await req.json();

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get Razorpay API keys from Supabase secrets
    const { data: keyData, error: keyError } = await supabase
      .from("secrets")
      .select("value")
      .eq("name", "RAZORPAY_KEY_ID")
      .single();

    const { data: secretData, error: secretError } = await supabase
      .from("secrets")
      .select("value")
      .eq("name", "RAZORPAY_KEY_SECRET")
      .single();

    if (keyError || secretError) {
      throw new Error("Failed to fetch Razorpay API keys");
    }

    const keySecret = secretData?.value;

    if (!keySecret) {
      throw new Error("Razorpay API key secret not found");
    }

    // Verify the signature
    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      throw new Error("Invalid payment signature");
    }

    // Update the order status in Supabase
    const { error: updateError } = await supabase
      .from("razorpay_orders")
      .update({
        status: "completed",
        payment_id: paymentId,
        updated_at: new Date().toISOString(),
      })
      .eq("order_id", orderId);

    if (updateError) {
      throw new Error("Failed to update order status");
    }

    // Get the plan from the order
    const { data: orderData, error: orderError } = await supabase
      .from("razorpay_orders")
      .select("plan")
      .eq("order_id", orderId)
      .single();

    if (orderError) {
      throw new Error("Failed to fetch order details");
    }

    // Update user subscription in Supabase
    const { error: subscriptionError } = await supabase
      .from("profiles")
      .update({
        tier: orderData.plan,
        payment_method: "razorpay",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (subscriptionError) {
      throw new Error("Failed to update user subscription");
    }

    return new Response(
      JSON.stringify({
        success: true,
        plan: orderData.plan,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
}); 