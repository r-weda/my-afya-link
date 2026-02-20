import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ReminderRequest {
  appointmentId: string;
  phoneNumber: string;
  patientName: string;
  clinicName: string;
  appointmentDate: string;
  appointmentTime: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("AFRICASTALKING_API_KEY");
    if (!apiKey) {
      throw new Error("AFRICASTALKING_API_KEY is not configured");
    }

    const username = Deno.env.get("AFRICASTALKING_USERNAME");
    if (!username) {
      throw new Error("AFRICASTALKING_USERNAME is not configured");
    }

    // Authenticate the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const {
      appointmentId,
      phoneNumber,
      patientName,
      clinicName,
      appointmentDate,
      appointmentTime,
    }: ReminderRequest = await req.json();

    // Verify ownership: if appointmentId is provided, confirm the authenticated user owns it
    if (appointmentId) {
      const authenticatedUserId = claimsData.claims.sub;
      const { data: appointment, error: apptError } = await supabase
        .from("appointments")
        .select("user_id")
        .eq("id", appointmentId)
        .single();

      if (apptError || !appointment) {
        return new Response(JSON.stringify({ error: "Appointment not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (appointment.user_id !== authenticatedUserId) {
        return new Response(JSON.stringify({ error: "Forbidden: you do not own this appointment" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (!phoneNumber || !clinicName || !appointmentDate || !appointmentTime) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: phoneNumber, clinicName, appointmentDate, appointmentTime" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format the message
    const message = `Hi ${patientName || "there"}! This is a reminder for your appointment at ${clinicName} on ${appointmentDate} at ${appointmentTime}. Please arrive 10 minutes early. - AfyaConnect`;

    // Determine API base URL (sandbox vs production)
    const baseUrl =
      username === "sandbox"
        ? "https://api.sandbox.africastalking.com"
        : "https://api.africastalking.com";

    // Send SMS via Africa's Talking
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("to", phoneNumber);
    formData.append("message", message);

    const smsResponse = await fetch(`${baseUrl}/version1/messaging`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        apiKey: apiKey,
      },
      body: formData.toString(),
    });

    const smsResult = await smsResponse.json();

    if (!smsResponse.ok) {
      throw new Error(`Africa's Talking API error [${smsResponse.status}]: ${JSON.stringify(smsResult)}`);
    }

    // Mark reminder as sent if appointmentId is provided
    if (appointmentId) {
      await supabase
        .from("appointments")
        .update({ reminder_sent: true })
        .eq("id", appointmentId);
    }

    console.log("SMS sent successfully:", smsResult);

    return new Response(JSON.stringify({ success: true, result: smsResult }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error sending SMS reminder:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
