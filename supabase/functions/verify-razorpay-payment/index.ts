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

  const computedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return computedSignature === signature;
}

/**
 * Fetch real payment details from Razorpay API.
 * Returns the payment object including created_at (Unix timestamp in seconds).
 */
async function fetchRazorpayPayment(
  paymentId: string,
  keyId: string,
  keySecret: string
): Promise<{ created_at: number; amount: number; status: string } | null> {
  try {
    const response = await fetch(
      `https://api.razorpay.com/v1/payments/${paymentId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error(
        `[verify-razorpay] Failed to fetch payment ${paymentId}: ${response.status}`
      );
      return null;
    }

    const data = await response.json();
    return {
      created_at: data.created_at as number, // Unix seconds
      amount: (data.amount as number) / 100,  // Razorpay stores in paise
      status: data.status as string,
    };
  } catch (err) {
    console.error("[verify-razorpay] Error fetching payment from Razorpay:", err);
    return null;
  }
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

    // ── 3. Get Razorpay credentials from env ──────────────────────────────
    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!keySecret || !keyId) {
      return new Response(
        JSON.stringify({ error: "Razorpay API keys not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // ── 4. Verify HMAC signature ──────────────────────────────────────────
    const isValid = await verifyRazorpaySignature(orderId, paymentId, signature, keySecret);

    if (!isValid) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Payment signature verification failed. Possible tampering detected.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // ── 5. Fetch REAL payment details from Razorpay ───────────────────────
    //    This gives us the actual payment timestamp — the true subscription start.
    const razorpayPayment = await fetchRazorpayPayment(paymentId, keyId, keySecret);

    // ── 6. Fetch plan from razorpay_orders table ───────────────────────────
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: orderRow, error: orderFetchErr } = await supabase
      .from("razorpay_orders")
      .select("plan, amount")
      .eq("order_id", orderId)
      .single();

    if (orderFetchErr) {
      console.error("Error fetching order:", orderFetchErr.message);
    }

    const plan = orderRow?.plan ?? "pro";
    const orderAmount = Number(orderRow?.amount) || 499;

    // ── 7. Compute subscription dates using REAL payment timestamp ────────
    //    If Razorpay API call failed, fall back to current time (still better
    //    than using a fixed 30-day offset from an unrelated moment).
    const paymentCreatedAt = razorpayPayment
      ? new Date(razorpayPayment.created_at * 1000) // Unix seconds → ms
      : new Date();

    const isYearly = orderAmount >= 1000;
    const billingCycle = isYearly ? "yearly" : "monthly";

    // Renewal date = exact payment date + billing period
    const renewalDate = new Date(paymentCreatedAt);
    if (isYearly) {
      renewalDate.setFullYear(renewalDate.getFullYear() + 1);
    } else {
      renewalDate.setMonth(renewalDate.getMonth() + 1);
    }

    console.log(
      `[verify-razorpay] Payment created_at: ${paymentCreatedAt.toISOString()}`,
      `| Renewal: ${renewalDate.toISOString()}`,
      `| Cycle: ${billingCycle}`
    );

    // ── 8. Mark order as paid ─────────────────────────────────────────────
    await supabase
      .from("razorpay_orders")
      .update({ status: "paid", payment_id: paymentId })
      .eq("order_id", orderId);

    // ── 9. Update profiles with real subscription dates ───────────────────
    const { error: profileErr } = await supabase
      .from("profiles")
      .upsert(
        {
          user_id: userId,
          tier: plan,
          subscription_status: "active",
          subscription_id: orderId,
          subscription_start_date: paymentCreatedAt.toISOString(),
          subscription_renewal_date: renewalDate.toISOString(),
          subscription_end_date: null, // Clear end date on new subscription
          billing_cycle: billingCycle,
          razorpay_payment_id: paymentId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (profileErr) {
      console.error("Profile update error:", profileErr.message);
    }

    // ── 10. Also update subscribers table for consistency ─────────────────
    await supabase
      .from("subscribers")
      .upsert(
        {
          user_id: userId,
          subscription_tier: plan,
          subscription_end: renewalDate.toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    // ── 11. Return success with date info ─────────────────────────────────
    return new Response(
      JSON.stringify({
        success: true,
        plan,
        billingCycle,
        subscriptionStartDate: paymentCreatedAt.toISOString(),
        subscriptionRenewalDate: renewalDate.toISOString(),
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