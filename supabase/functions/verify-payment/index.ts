import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";
import { corsHeaders } from "../_shared/cors.ts";

interface VerifyPaymentPayload {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  registration_id: string;
}

// Helper to generate HMAC-SHA256
async function generateSignature(
  data: string,
  secret: string
): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(data);

  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, messageData);
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload: VerifyPaymentPayload = await req.json();

    // Validate required fields
    if (
      !payload.razorpay_payment_id ||
      !payload.razorpay_order_id ||
      !payload.razorpay_signature ||
      !payload.registration_id
    ) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Get Razorpay key secret from env
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!razorpayKeySecret) {
      return new Response(
        JSON.stringify({ error: "Razorpay secret not configured" }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Verify HMAC signature
    const message = `${payload.razorpay_order_id}|${payload.razorpay_payment_id}`;
    const expectedSignature = await generateSignature(
      message,
      razorpayKeySecret
    );

    if (expectedSignature !== payload.razorpay_signature) {
      console.error("Signature verification failed");
      return new Response(
        JSON.stringify({ error: "Payment signature verification failed" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Update registration in database
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    const { data: registration, error: fetchError } = await supabaseClient
      .from("registrations")
      .select("*")
      .eq("id", payload.registration_id)
      .single();

    if (fetchError || !registration) {
      console.error("Registration not found:", fetchError);
      return new Response(
        JSON.stringify({ error: "Registration not found" }),
        { status: 404, headers: corsHeaders }
      );
    }

    // Update registration to paid
    const { error: updateError } = await supabaseClient
      .from("registrations")
      .update({
        payment_status: "paid",
        payment_id: payload.razorpay_payment_id,
        razorpay_order_id: payload.razorpay_order_id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payload.registration_id);

    if (updateError) {
      console.error("Failed to update registration:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update payment status" }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Increment workshop enrolled count
    const { error: workshopError } = await supabaseClient
      .from("workshops")
      .update({ enrolled: registration.workshop_id ? (registration.enrolled || 0) + 1 : 0 })
      .eq("id", registration.workshop_id);

    if (workshopError) {
      console.warn("Failed to update workshop enrolled count:", workshopError);
      // Don't fail the payment verification if this fails
    }

    // Return success response with pass details
    return new Response(
      JSON.stringify({
        success: true,
        pass_id: registration.pass_id,
        message: "Payment verified successfully",
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
