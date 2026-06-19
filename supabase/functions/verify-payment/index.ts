import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { text, registrationId } = await req.json();

    if (!text || !registrationId) {
      return fail("Missing screenshot text or registration ID");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch registration → workshop_id
    const { data: registration, error: regError } = await supabase
      .from("registrations")
      .select("workshop_id")
      .eq("id", registrationId)
      .single();

    if (regError || !registration) return fail("Registration not found");

    // Fetch workshop price
    const { data: workshop, error: wsError } = await supabase
      .from("workshops")
      .select("price")
      .eq("id", registration.workshop_id)
      .single();

    if (wsError || !workshop) return fail("Workshop not found");

    const expectedAmount = workshop.price;

    // ── Check 1: Amount ──
    // Extract every number from OCR text and see if any equals the workshop price
    const allNumbers = (text.match(/\d+/g) ?? []).map(Number);
    if (!allNumbers.includes(expectedAmount)) {
      return fail(`Amount ₹${expectedAmount} not found in the screenshot`);
    }

    // ── Check 2: Success status ──
    if (!/transaction\s*successful|success|paid|debited/i.test(text)) {
      return fail('Payment success not confirmed — screenshot must show "Transaction Successful", "Success", "Paid", or "Debited"');
    }

    // ── Check 3: 12-digit UTR ──
    // First try after "UTR:" label, then fallback to any 12-digit number
    const utrLabelled = text.match(/UTR[:\s#]+(\d{12})/i);
    const utrFallback = text.match(/(?<!\d)(\d{12})(?!\d)/);
    const utr = (utrLabelled?.[1] ?? utrFallback?.[1]) ?? null;

    if (!utr) {
      return fail("12-digit UTR number not found in the screenshot");
    }

    // ── Check 4: Duplicate UTR ──
    const { data: existing } = await supabase
      .from("registrations")
      .select("id")
      .eq("utr", utr)
      .maybeSingle();

    if (existing) {
      return fail("This payment has already been used for another registration");
    }

    // ── All passed — save UTR + mark paid ──
    const { error: updateError } = await supabase
      .from("registrations")
      .update({ payment_status: "paid", utr })
      .eq("id", registrationId);

    if (updateError) throw updateError;

    return ok({ verified: true, utr });

  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ verified: false, reason: `Server error: ${message}` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function fail(reason: string) {
  return new Response(
    JSON.stringify({ verified: false, reason }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

function ok(data: object) {
  return new Response(
    JSON.stringify(data),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
