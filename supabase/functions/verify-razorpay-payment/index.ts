import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

// CORS headers — must be on EVERY response
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Helper: HMAC-SHA256 signature verification (Razorpay standard)
async function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const payload = `${orderId}|${paymentId}`;
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload)
  );

  // Convert to hex string
  const computedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return computedSignature === signature;
}

serve(async (req) => {
  // ── 1. Handle CORS preflight ──────────────────────────────────────────────
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    // ── 2. Parse body ─────────────────────────────────────────────────────
    const { paymentId, orderId, signature, userId } = await req.json();

    if (!paymentId || !orderId || !signature || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: paymentId, orderId, signature, userId" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // ── 3. Get Razorpay secret from env ───────────────────────────────────
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!keySecret) {
      return new Response(
        JSON.stringify({ error: "Razorpay secret key not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // ── 4. Verify signature ───────────────────────────────────────────────
    const isValid = await verifyRazorpaySignature(orderId, paymentId, signature, keySecret);

    if (!isValid) {
      return new Response(
        JSON.stringify({ success: false, error: "Payment signature verification failed. Possible tampering detected." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // ── 5. Update Supabase records ─────────────────────────────────────────
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Update the razorpay_orders table
    const { data: orderRow, error: orderFetchErr } = await supabase
      .from("razorpay_orders")
      .select("plan, amount")
      .eq("order_id", orderId)
      .single();

    if (orderFetchErr) {
      console.error("Error fetching order:", orderFetchErr.message);
    }

    const plan = orderRow?.plan ?? "pro";
    const amount = Number(orderRow?.amount) || 499;

    // Mark order as paid
    await supabase
      .from("razorpay_orders")
      .update({ status: "paid", payment_id: paymentId })
      .eq("order_id", orderId);

    // Dynamic subscription duration: 365 days for Yearly (₹4,999), 30 days for Monthly (₹499)
    const subscriptionEnd = new Date();
    if (amount >= 1000) {
      subscriptionEnd.setDate(subscriptionEnd.getDate() + 365);
    } else {
      subscriptionEnd.setDate(subscriptionEnd.getDate() + 30);
    }

    // Update user's profile / subscribers table
    const { error: profileErr } = await supabase
      .from("profiles")
      .upsert(
        {
          user_id: userId,
          tier: plan,
          subscription_status: "active",
          subscription_id: orderId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (profileErr) {
      console.error("Profile update error:", profileErr.message);
    }

    // Also update subscribers table
    await supabase
      .from("subscribers")
      .upsert(
        {
          user_id: userId,
          subscription_tier: plan,
          subscription_end: subscriptionEnd.toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    // ── 6. Return success ─────────────────────────────────────────────────
    return new Response(
      JSON.stringify({
        success: true,
        plan: plan,
        message: `Successfully upgraded to ${plan} plan`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err) {
    console.error("verify-razorpay-payment error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err?.message ?? "Internal server error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});