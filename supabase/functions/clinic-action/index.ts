import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    const action = url.searchParams.get("action"); // "confirm" or "decline"

    if (!token || !action || !["confirm", "decline"].includes(action)) {
      return new Response(
        JSON.stringify({ error: "Invalid request. Token and action (confirm/decline) are required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find appointment by token
    const { data: appointment, error: fetchError } = await supabase
      .from("appointments")
      .select("id, status, user_id, appointment_date, appointment_time, clinic_id, clinics(name)")
      .eq("confirmation_token", token)
      .single();

    if (fetchError || !appointment) {
      return new Response(
        JSON.stringify({ error: "Appointment not found or link has expired." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (appointment.status !== "pending") {
      return new Response(
        JSON.stringify({
          error: `This appointment has already been ${appointment.status}.`,
          status: appointment.status,
        }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const newStatus = action === "confirm" ? "confirmed" : "declined";

    // Update appointment status
    const { error: updateError } = await supabase
      .from("appointments")
      .update({ status: newStatus })
      .eq("id", appointment.id);

    if (updateError) {
      console.error("Failed to update appointment:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update appointment status." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Notify the patient via in-app notification
    const clinicName = (appointment.clinics as any)?.name || "the clinic";
    const notifTitle = action === "confirm"
      ? `Appointment confirmed by ${clinicName}`
      : `Appointment declined by ${clinicName}`;
    const notifMsg = action === "confirm"
      ? `Great news! ${clinicName} has confirmed your appointment on ${appointment.appointment_date} at ${appointment.appointment_time}. Please arrive 10 minutes early.`
      : `${clinicName} was unable to accommodate your appointment on ${appointment.appointment_date} at ${appointment.appointment_time}. Please try booking a different time.`;

    await supabase.from("notification_history").insert({
      user_id: appointment.user_id,
      type: "appointment_update",
      title: notifTitle,
      message: notifMsg,
      status: "sent",
    });

    // Try to send SMS to patient
    const apiKey = Deno.env.get("AFRICASTALKING_API_KEY");
    const username = Deno.env.get("AFRICASTALKING_USERNAME");

    if (apiKey && username) {
      // Get patient phone
      const { data: notifPrefs } = await supabase
        .from("notification_preferences")
        .select("phone_number")
        .eq("user_id", appointment.user_id)
        .maybeSingle();

      const { data: profile } = await supabase
        .from("profiles")
        .select("phone_number, first_name")
        .eq("user_id", appointment.user_id)
        .single();

      const patientPhone = notifPrefs?.phone_number || profile?.phone_number;
      const patientName = profile?.first_name || "there";

      if (patientPhone) {
        const smsMsg = action === "confirm"
          ? `Hi ${patientName}! ${clinicName} has confirmed your appointment on ${appointment.appointment_date} at ${appointment.appointment_time}. Please arrive 10 min early. - AfyaConnect`
          : `Hi ${patientName}, unfortunately ${clinicName} couldn't accommodate your appointment on ${appointment.appointment_date} at ${appointment.appointment_time}. Please try a different time. - AfyaConnect`;

        const baseUrl = username === "sandbox"
          ? "https://api.sandbox.africastalking.com"
          : "https://api.africastalking.com";

        const formData = new URLSearchParams();
        formData.append("username", username);
        formData.append("to", patientPhone);
        formData.append("message", smsMsg);

        await fetch(`${baseUrl}/version1/messaging`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
            apiKey: apiKey,
          },
          body: formData.toString(),
        });
      }
    }

    console.log(`Appointment ${appointment.id} ${newStatus} via clinic token`);

    return new Response(
      JSON.stringify({
        success: true,
        status: newStatus,
        clinicName,
        date: appointment.appointment_date,
        time: appointment.appointment_time,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in clinic-action:", error);
    return new Response(
      JSON.stringify({ error: "Something went wrong. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
