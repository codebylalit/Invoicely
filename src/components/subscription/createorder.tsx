import { createClient } from "@supabase/supabase-js";

// Define the subscription plan prices
const PLAN_PRICES = {
  pro: 5, // $5 per month
  advanced: 10, // $10 per month (if you have this plan)
};

// Edge function to create a Razorpay order
export async function createRazorpayOrder(
  plan: string,
  userId: string,
  currency = "INR"
) {
  // Get the Razorpay API key and secret from Supabase secrets
  const supabaseUrl = process.env.SUPABASE_URL || "";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase configuration");
  }

  // Initialize Supabase client with service role for admin access
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Get Razorpay API keys from Supabase secrets
    const { data: secretData, error: secretError } = await supabase
      .from("secrets")
      .select("value")
      .eq("name", "RAZORPAY_KEY_ID")
      .single();

    const { data: secretKeyData, error: secretKeyError } = await supabase
      .from("secrets")
      .select("value")
      .eq("name", "RAZORPAY_KEY_SECRET")
      .single();

    if (secretError || secretKeyError) {
      console.error(
        "Error fetching Razorpay keys:",
        secretError || secretKeyError
      );
      throw new Error("Failed to fetch Razorpay API keys");
    }

    const keyId = secretData?.value;
    const keySecret = secretKeyData?.value;

    if (!keyId || !keySecret) {
      throw new Error("Razorpay API keys not found");
    }

    // Get the price for the selected plan
    const amount = PLAN_PRICES[plan as keyof typeof PLAN_PRICES];
    if (!amount) {
      throw new Error("Invalid subscription plan");
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
        amount: amount * 100, // Convert to paise (Razorpay uses smallest currency unit)
        currency: currency,
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

    // Return the order ID and key ID for the client
    return {
      orderId: orderData.id,
      keyId: keyId,
    };
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);
    throw new Error(`Failed to create payment order: ${error.message}`);
  }
}
