import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";
import { corsHeaders } from "../_shared/cors.ts";

interface CreateOrderPayload {
  registration_id: string;
  full_name: string;
  email: string;
  phone: string;
  workshop_name: string;
  amount: number;
}

interface RazorpayOrder {
  id: string;
  key_id: string;
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload: CreateOrderPayload = await req.json();

    // Validate required fields
    if (
      !payload.registration_id ||
      !payload.full_name ||
      !payload.email ||
      !payload.phone ||
      !payload.amount
    ) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Get Razorpay credentials from env
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!razorpayKeyId || !razorpayKeySecret) {
      return new Response(
        JSON.stringify({ error: "Razorpay credentials not configured" }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Create Razorpay order
    const orderData = {
      amount: payload.amount * 100, // Convert to paise (Razorpay uses paise)
      currency: "INR",
      receipt: `order_${payload.registration_id.slice(0, 8)}`,
      description: `Registration for ${payload.workshop_name}`,
      customer_notify: 1,
      notes: {
        registration_id: payload.registration_id,
        workshop_name: payload.workshop_name,
      },
    };

    // Make request to Razorpay API
    const auth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    if (!razorpayResponse.ok) {
      const error = await razorpayResponse.text();
      console.error("Razorpay API error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to create Razorpay order" }),
        { status: 500, headers: corsHeaders }
      );
    }

    const razorpayOrder = await razorpayResponse.json();

    // Update registration with razorpay_order_id
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    const { error: updateError } = await supabaseClient
      .from("registrations")
      .update({ razorpay_order_id: razorpayOrder.id })
      .eq("id", payload.registration_id);

    if (updateError) {
      console.error("Failed to update registration:", updateError);
      return new Response(
        JSON.stringify({
          error: "Failed to update registration with order ID",
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Return order details
    return new Response(
      JSON.stringify({
        order_id: razorpayOrder.id,
        key_id: razorpayKeyId,
        amount: payload.amount,
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
