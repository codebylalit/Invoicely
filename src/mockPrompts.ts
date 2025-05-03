
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  try {
    const { plan, userId, amount } = await req.json();
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error("Supabase environment variables are missing.");
    }
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!keyId || !keySecret) {
      throw new Error("Razorpay API keys not found in environment variables");
    }
    const receipt = `sub_${Date.now()}`; // keep under 40 chars
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`
      },
      body: JSON.stringify({
        amount: amount * 100,
        currency: "USD",
        receipt: receipt,
        notes: {
          userId: userId,
          plan: plan
        }
      })
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Razorpay API error: ${errorData.error.description}`);
    }
    const orderData = await response.json();
    const { error: dbError } = await supabase.from("razorpay_orders").insert({
      order_id: orderData.id,
      user_id: userId,
      plan: plan,
      amount: amount,
      status: "created",
      created_at: new Date().toISOString()
    });
    if (dbError) {
      throw new Error("Failed to store Razorpay order in Supabase");
    }
    return new Response(JSON.stringify({
      orderId: orderData.id,
      keyId: keyId
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 200
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 400
    });
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
// HMAC-SHA256 helper for Deno
async function hmacSHA256(key, message) {
  const encoder = new TextEncoder();
  const keyBytes = encoder.encode(key);
  const msgBytes = encoder.encode(message);
  const cryptoKey = await crypto.subtle.importKey("raw", keyBytes, {
    name: "HMAC",
    hash: "SHA-256"
  }, false, [
    "sign",
    "verify"
  ]);
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, msgBytes);
  return Array.from(new Uint8Array(signature)).map((b)=>b.toString(16).padStart(2, "0")).join("");
}
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  try {
    const { paymentId, orderId, signature, userId } = await req.json();
    // Supabase setup
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error("Supabase environment variables are missing.");
    }
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    // Razorpay secret
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!keySecret) {
      throw new Error("Razorpay API key secret not found in environment variables");
    }
    // Signature verification
    const body = `${orderId}|${paymentId}`;
    const expectedSignature = await hmacSHA256(keySecret, body);
    if (expectedSignature !== signature) {
      throw new Error("Invalid payment signature");
    }
    // Update order status in Supabase
    const { error: updateError } = await supabase.from("razorpay_orders").update({
      status: "completed",
      payment_id: paymentId,
      updated_at: new Date().toISOString()
    }).eq("order_id", orderId);
    if (updateError) {
      throw new Error("Failed to update order status");
    }
    // Retrieve order to get plan
    const { data: orderData, error: orderError } = await supabase.from("razorpay_orders").select("plan").eq("order_id", orderId).single();
    if (orderError || !orderData) {
      throw new Error("Failed to fetch order details");
    }
    // Update user's subscription tier
    const { error: subscriptionError } = await supabase.from("profiles").update({
      tier: orderData.plan,
      payment_method: "razorpay",
      updated_at: new Date().toISOString()
    }).eq("user_id", userId);
    if (subscriptionError) {
      throw new Error("Failed to update user subscription");
    }
    return new Response(JSON.stringify({
      success: true,
      plan: orderData.plan
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 200
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 400
    });
  }
});
