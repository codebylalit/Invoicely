import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// CORS headers — must be on EVERY response, including errors
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // ── 1. Handle CORS preflight ──────────────────────────────────────────────
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    // ── 2. Parse body ─────────────────────────────────────────────────────
    const { plan, userId, amount, billingCycle } = await req.json();

    if (!plan || !userId || !amount) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: plan, userId, amount" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // ── 3. Get Razorpay credentials from env ──────────────────────────────
    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!keyId || !keySecret) {
      return new Response(
        JSON.stringify({ error: "Razorpay API keys are not configured in environment variables" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // ── 4. Create order in Razorpay ───────────────────────────────────────
    const receipt = `sub_${userId.slice(0, 8)}_${Date.now()}`;

    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`,
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Razorpay requires paise (smallest unit)
        currency: "INR",
        receipt: receipt,
        notes: {
          userId: userId,
          plan: plan,
          billingCycle: billingCycle || (amount > 1000 ? "yearly" : "monthly"),
        },
      }),
    });

    if (!razorpayResponse.ok) {
      const errBody = await razorpayResponse.json().catch(() => ({}));
      const errMsg = errBody?.error?.description || `Razorpay API returned ${razorpayResponse.status}`;
      return new Response(
        JSON.stringify({ error: errMsg }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const orderData = await razorpayResponse.json();

    // ── 5. Persist order in Supabase ──────────────────────────────────────
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { error: dbError } = await supabase.from("razorpay_orders").insert({
      order_id: orderData.id,
      user_id: userId,
      plan: plan,
      amount: amount,
      status: "created",
    });

    if (dbError) {
      // Non-fatal — the order was created in Razorpay; DB write failure shouldn't block checkout
      console.error("DB insert error:", dbError.message);
    }

    // ── 6. Return order details to frontend ───────────────────────────────
    return new Response(
      JSON.stringify({
        orderId: orderData.id,
        keyId: keyId,
        amount: orderData.amount,
        currency: orderData.currency,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err) {
    console.error("create-razorpay-order error:", err);
    return new Response(
      JSON.stringify({ error: err?.message ?? "Internal server error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});