import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ReminderRequest {
  appointmentId?: string;
  phoneNumber: string;
  patientName: string;
  clinicName: string;
  appointmentDate: string;
  appointmentTime: string;
  type?: "appointment_reminder" | "booking_confirmation";
}

async function sendSms(
  phoneNumber: string,
  message: string,
  apiKey: string,
  username: string
): Promise<{ success: boolean; result?: unknown; error?: string }> {
  const baseUrl =
    username === "sandbox"
      ? "https://api.sandbox.africastalking.com"
      : "https://api.africastalking.com";

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
    console.error(`Africa's Talking API error [${smsResponse.status}]:`, smsResult);
    return { success: false, error: "SMS delivery failed" };
  }

  return { success: true, result: smsResult };
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("AFRICASTALKING_API_KEY");
    if (!apiKey) {
      console.error("AFRICASTALKING_API_KEY is not configured");
      return new Response(JSON.stringify({ success: false, error: "SMS service is currently unavailable." }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const username = Deno.env.get("AFRICASTALKING_USERNAME");
    if (!username) {
      console.error("AFRICASTALKING_USERNAME is not configured");
      return new Response(JSON.stringify({ success: false, error: "SMS service is currently unavailable." }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // User-scoped client for auth verification
    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    // Service role client for writing notification history (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
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
      type = "appointment_reminder",
    }: ReminderRequest = await req.json();

    // Verify ownership if appointmentId is provided
    if (appointmentId) {
      const { data: appointment, error: apptError } = await supabaseUser
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

      if (appointment.user_id !== user.id) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
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

    // Check notification preferences
    const prefField = type === "booking_confirmation" ? "booking_confirmations" : "appointment_reminders";
    const { data: prefs } = await supabaseAdmin
      .from("notification_preferences")
      .select(prefField)
      .eq("user_id", user.id)
      .maybeSingle();

    // If preferences exist and the relevant type is disabled, skip sending
    if (prefs && prefs[prefField] === false) {
      console.log(`User ${user.id} has ${prefField} disabled, skipping SMS`);
      return new Response(JSON.stringify({ success: true, skipped: true, reason: "Notification type disabled by user" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Format the message based on type
    let message: string;
    let notificationTitle: string;

    if (type === "booking_confirmation") {
      message = `Hi ${patientName || "there"}! Your appointment at ${clinicName} on ${appointmentDate} at ${appointmentTime} has been confirmed. We'll send you a reminder before your visit. - AfyaConnect`;
      notificationTitle = `Booking confirmed: ${clinicName}`;
    } else {
      message = `Hi ${patientName || "there"}! This is a reminder for your appointment at ${clinicName} on ${appointmentDate} at ${appointmentTime}. Please arrive 10 minutes early. - AfyaConnect`;
      notificationTitle = `Reminder: ${clinicName}`;
    }

    // Send SMS
    const smsResult = await sendSms(phoneNumber, message, apiKey, username);

    // Log to notification history using service role (bypasses RLS)
    await supabaseAdmin.from("notification_history").insert({
      user_id: user.id,
      type: type,
      title: notificationTitle,
      message: message,
      status: smsResult.success ? "sent" : "failed",
    });

    // Mark reminder as sent if appointmentId is provided and type is reminder
    if (appointmentId && type === "appointment_reminder" && smsResult.success) {
      await supabaseUser
        .from("appointments")
        .update({ reminder_sent: true })
        .eq("id", appointmentId);
    }

    if (!smsResult.success) {
      return new Response(JSON.stringify({ success: false, error: "SMS delivery failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("SMS sent successfully:", smsResult.result);

    return new Response(JSON.stringify({ success: true, result: smsResult.result }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error sending SMS:", error);
    return new Response(JSON.stringify({ success: false, error: "Unable to send SMS. Please try again later." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
