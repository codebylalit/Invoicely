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
    // Log the incoming request
    console.log("Received request:", req.method, req.url);

    const { plan, userId, amount } = await req.json();
    console.log("Request data:", { plan, userId, amount });

    // Validate required fields
    if (!plan || !userId || !amount) {
      throw new Error("Missing required fields: plan, userId, or amount");
    }

    // Get PayPal credentials from Supabase secrets
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const paypalClientId = Deno.env.get("PAYPAL_CLIENT_ID") ?? "";
    const paypalSecret = Deno.env.get("PAYPAL_SECRET") ?? "";
    const siteUrl = Deno.env.get("SITE_URL") ?? "http://localhost:3000";

    // Log environment variables (without sensitive data)
    console.log("Environment check:", {
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      hasPaypalClientId: !!paypalClientId,
      hasPaypalSecret: !!paypalSecret,
      siteUrl
    });

    if (!supabaseUrl || !supabaseServiceKey || !paypalClientId || !paypalSecret) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create PayPal order
    const paypalResponse = await fetch("https://api-m.sandbox.paypal.com/v2/checkout/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(`${paypalClientId}:${paypalSecret}`)}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: amount.toString(),
            },
            description: `Pro Plan Subscription - ${plan}`,
          },
        ],
        application_context: {
  "return_url": "https://invoicely-five.vercel.app/paypal-success.html",
  "cancel_url": "https://invoicely-five.vercel.app/app/settings?from=paypal&cancel=1"
}
      }),
    });

    if (!paypalResponse.ok) {
      const errorData = await paypalResponse.json();
      console.error("PayPal API error:", errorData);
      throw new Error(`PayPal API error: ${errorData.message || 'Unknown error'}`);
    }

    const orderData = await paypalResponse.json();
    console.log("PayPal order created:", orderData.id);

    // Store the order in Supabase
    const { error: dbError } = await supabase.from("paypal_orders").insert({
      order_id: orderData.id,
      user_id: userId,
      plan: plan,
      amount: amount,
      status: "created",
      created_at: new Date().toISOString(),
    });

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error("Failed to store PayPal order");
    }

    const approveUrl = orderData.links.find((link: any) => link.rel === "approve")?.href;
    if (!approveUrl) {
      throw new Error("No approval URL found in PayPal response");
    }

    return new Response(
      JSON.stringify({
        orderId: orderData.id,
        approveUrl,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
}); 