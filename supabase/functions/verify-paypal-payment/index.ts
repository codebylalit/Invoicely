import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { orderId, userId } = await req.json();

    // Get PayPal credentials from Supabase secrets
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const paypalClientId = Deno.env.get("PAYPAL_CLIENT_ID") ?? "";
    const paypalSecret = Deno.env.get("PAYPAL_SECRET") ?? "";

    if (!supabaseUrl || !supabaseServiceKey || !paypalClientId || !paypalSecret) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the order details from Supabase
    const { data: orderData, error: orderError } = await supabase
      .from("paypal_orders")
      .select("*")
      .eq("order_id", orderId)
      .single();

    if (orderError || !orderData) {
      throw new Error("Order not found");
    }

    // Capture the PayPal payment
    const captureResponse = await fetch(
      `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${btoa(`${paypalClientId}:${paypalSecret}`)}`,
        },
      }
    );

    if (!captureResponse.ok) {
      throw new Error("Failed to capture PayPal payment");
    }

    const captureData = await captureResponse.json();

    // Update the order status in Supabase
    const { error: updateError } = await supabase
      .from("paypal_orders")
      .update({
        status: "completed",
        capture_id: captureData.id,
        updated_at: new Date().toISOString(),
      })
      .eq("order_id", orderId);

    if (updateError) {
      throw new Error("Failed to update order status");
    }

    // Update user subscription in Supabase
    const { error: subscriptionError } = await supabase
      .from("profiles")
      .update({
        tier: orderData.plan,
        payment_method: "paypal",
        payment_id: orderId,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (subscriptionError) {
      throw new Error("Failed to update user subscription");
    }

    // Create a payment record
    const { error: paymentError } = await supabase.from("payments").insert({
      user_id: userId,
      payment_id: orderId,
      amount: orderData.amount,
      currency: "USD",
      plan: orderData.plan,
      status: "completed",
      provider: "paypal",
      created_at: new Date().toISOString(),
    });

    if (paymentError) {
      console.error("Error creating payment record:", paymentError);
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
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
}); 