import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { plan, userId, amount } = await req.json();

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get Razorpay API keys from environment variables
    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!keyId || !keySecret) {
      throw new Error("Razorpay API keys not found in environment variables");
    }

    // Create a unique receipt ID
    const receipt = `sub_${userId}_${Date.now()}`;

    // Create order in Razorpay
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`,
      },
      body: JSON.stringify({
        amount: amount * 100, // Convert to paise
        currency: "INR",
        receipt: receipt,
        notes: {
          userId: userId,
          plan: plan,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Razorpay API error: ${errorData.error.description}`);
    }

    const orderData = await response.json();

    // Store the order in Supabase
    const { error: dbError } = await supabase.from("razorpay_orders").insert({
      order_id: orderData.id,
      user_id: userId,
      plan: plan,
      amount: amount,
      status: "created",
      created_at: new Date().toISOString(),
    });

    if (dbError) {
      throw new Error("Failed to store Razorpay order");
    }

    return new Response(
      JSON.stringify({
        orderId: orderData.id,
        keyId: keyId,
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