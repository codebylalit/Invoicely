import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-razorpay-signature, paypal-transmission-id, paypal-transmission-sig",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Helper to verify Razorpay Webhook signature
async function verifyRazorpayWebhookSignature(body: string, signature: string, secret: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
    const computedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return computedSignature === signature;
  } catch (err) {
    console.error("Signature verification error:", err);
    return false;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const rawBody = await req.text();
    let payload: any = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const razorpaySignature = req.headers.get("x-razorpay-signature");
    const razorpayWebhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");

    // ── 1. Handle Razorpay Webhooks ──────────────────────────────────────────
    if (payload.event && payload.payload) {
      if (razorpayWebhookSecret && razorpaySignature) {
        const isValid = await verifyRazorpayWebhookSignature(rawBody, razorpaySignature, razorpayWebhookSecret);
        if (!isValid) {
          console.warn("[Webhook] Invalid Razorpay webhook signature");
          return new Response(JSON.stringify({ error: "Invalid signature" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 401,
          });
        }
      }

      const event = payload.event;
      console.log(`[Webhook] Processing Razorpay event: ${event}`);

      // Handle payment capture / success
      if (event === "payment.captured" || event === "order.paid") {
        const paymentEntity = payload.payload.payment?.entity;
        const notes = paymentEntity?.notes || {};
        const userId = notes.userId;
        const plan = notes.plan || "pro";
        const amount = (paymentEntity?.amount || 0) / 100;
        const isYearly = notes.billingCycle === "yearly" || amount >= 1000;
        const billingCycle = isYearly ? "yearly" : "monthly";

        if (userId) {
          const paidAt = paymentEntity?.created_at ? new Date(paymentEntity.created_at * 1000) : new Date();
          const renewalDate = new Date(paidAt);
          if (isYearly) {
            renewalDate.setFullYear(renewalDate.getFullYear() + 1);
          } else {
            renewalDate.setMonth(renewalDate.getMonth() + 1);
          }

          await supabase.from("profiles").upsert(
            {
              user_id: userId,
              tier: plan,
              subscription_status: "active",
              subscription_start_date: paidAt.toISOString(),
              subscription_renewal_date: renewalDate.toISOString(),
              subscription_end_date: null,
              billing_cycle: billingCycle,
              razorpay_payment_id: paymentEntity.id,
              payment_method: "razorpay",
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );

          if (paymentEntity.order_id) {
            await supabase
              .from("razorpay_orders")
              .update({ status: "paid", payment_id: paymentEntity.id })
              .eq("order_id", paymentEntity.order_id);
          }
        }
      }

      // Handle payment failure
      if (event === "payment.failed") {
        const paymentEntity = payload.payload.payment?.entity;
        const orderId = paymentEntity?.order_id;
        if (orderId) {
          await supabase
            .from("razorpay_orders")
            .update({ status: "failed" })
            .eq("order_id", orderId);
        }
      }

      // Handle subscription cancellations / expirations
      if (
        event === "subscription.cancelled" ||
        event === "subscription.halted" ||
        event === "subscription.completed" ||
        event === "subscription.expired"
      ) {
        const subEntity = payload.payload.subscription?.entity;
        const notes = subEntity?.notes || {};
        const userId = notes.userId;

        if (userId) {
          const isExpired = event === "subscription.expired" || event === "subscription.halted";
          await supabase
            .from("profiles")
            .update({
              subscription_status: isExpired ? "expired" : "cancelled",
              tier: isExpired ? "free" : undefined,
              subscription_end_date: isExpired ? new Date().toISOString() : undefined,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId);
        }
      }
    }

    // ── 2. Handle PayPal Webhooks ────────────────────────────────────────────
    if (payload.event_type) {
      const eventType = payload.event_type;
      console.log(`[Webhook] Processing PayPal event: ${eventType}`);

      if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
        const resource = payload.resource;
        const customId = resource.custom_id; // Usually contains userId if passed
        if (customId) {
          const now = new Date();
          const renewalDate = new Date(now);
          renewalDate.setMonth(renewalDate.getMonth() + 1);

          await supabase
            .from("profiles")
            .update({
              subscription_status: "active",
              tier: "pro",
              subscription_renewal_date: renewalDate.toISOString(),
              subscription_end_date: null,
              updated_at: now.toISOString(),
            })
            .eq("user_id", customId);
        }
      } else if (
        eventType === "BILLING.SUBSCRIPTION.CANCELLED" ||
        eventType === "BILLING.SUBSCRIPTION.EXPIRED" ||
        eventType === "BILLING.SUBSCRIPTION.SUSPENDED"
      ) {
        const resource = payload.resource;
        const customId = resource.custom_id;
        const isExpired = eventType.includes("EXPIRED") || eventType.includes("SUSPENDED");

        if (customId) {
          await supabase
            .from("profiles")
            .update({
              subscription_status: isExpired ? "expired" : "cancelled",
              tier: isExpired ? "free" : undefined,
              subscription_end_date: isExpired ? new Date().toISOString() : undefined,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", customId);
        }
      }
    }

    // Run database-level lifecycle cleanup
    await supabase.rpc("sync_subscription_lifecycle");

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err: any) {
    console.error("[Webhook] Handler error:", err);
    return new Response(JSON.stringify({ error: err?.message || "Webhook processing failed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
