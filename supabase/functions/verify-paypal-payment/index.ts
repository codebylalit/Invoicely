import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { orderId, userId } = await req.json();

    if (!orderId || !userId) {
      throw new Error("Missing required fields: orderId, userId");
    }

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
      const captureErr = await captureResponse.json().catch(() => ({}));
      throw new Error(`Failed to capture PayPal payment: ${captureErr.message || captureResponse.statusText}`);
    }

    const captureData = await captureResponse.json();
    const now = new Date();
    const plan = orderData.plan || "pro";
    const amount = Number(orderData.amount) || 6;
    const isYearly = amount >= 40;
    const billingCycle = isYearly ? "yearly" : "monthly";

    const renewalDate = new Date(now);
    if (isYearly) {
      renewalDate.setFullYear(renewalDate.getFullYear() + 1);
    } else {
      renewalDate.setMonth(renewalDate.getMonth() + 1);
    }

    // Update the order status in Supabase
    const { error: updateError } = await supabase
      .from("paypal_orders")
      .update({
        status: "completed",
        capture_id: captureData.id,
        updated_at: now.toISOString(),
      })
      .eq("order_id", orderId);

    if (updateError) {
      console.error("Order update error:", updateError);
    }

    // Update user subscription in Supabase with complete lifecycle details
    const { error: subscriptionError } = await supabase
      .from("profiles")
      .upsert(
        {
          user_id: userId,
          tier: plan,
          subscription_status: "active",
          subscription_id: orderId,
          subscription_start_date: now.toISOString(),
          subscription_renewal_date: renewalDate.toISOString(),
          subscription_end_date: null,
          billing_cycle: billingCycle,
          payment_method: "paypal",
          updated_at: now.toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (subscriptionError) {
      console.error("Subscription update error:", subscriptionError);
      throw new Error("Failed to update user subscription: " + JSON.stringify(subscriptionError));
    }

    // Sync subscribers table
    await supabase
      .from("subscribers")
      .upsert(
        {
          user_id: userId,
          subscription_tier: plan,
          subscription_end: renewalDate.toISOString(),
          updated_at: now.toISOString(),
        },
        { onConflict: "user_id" }
      );

    // Create a payment record
    const { error: paymentError } = await supabase.from("payments").insert({
      user_id: userId,
      payment_id: captureData.id || orderId,
      amount: orderData.amount,
      currency: "USD",
      plan: plan,
      status: "completed",
      provider: "paypal",
      created_at: now.toISOString(),
    });

    if (paymentError) {
      console.error("Error creating payment record:", paymentError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        plan: plan,
        billingCycle,
        subscriptionStartDate: now.toISOString(),
        subscriptionRenewalDate: renewalDate.toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("verify-paypal-payment error:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        details: error,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 400,
      }
    );
  }
});