import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ReminderRequest {
  appointmentId?: string;
  phoneNumber?: string;
  patientName: string;
  clinicName: string;
  clinicPhone?: string;
  appointmentDate: string;
  appointmentTime: string;
  notes?: string;
  type?: "appointment_reminder" | "booking_confirmation";
  confirmationToken?: string;
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

  const responseText = await smsResponse.text();
  let smsResult: unknown;
  try {
    smsResult = JSON.parse(responseText);
  } catch {
    console.error(`Africa's Talking returned non-JSON [${smsResponse.status}]:`, responseText);
    return { success: false, error: `SMS API returned non-JSON: ${responseText.substring(0, 200)}` };
  }

  if (!smsResponse.ok) {
    console.error(`Africa's Talking API error [${smsResponse.status}]:`, smsResult);
    return { success: false, error: "SMS delivery failed" };
  }

  return { success: true, result: smsResult };
}

/** Generate a short booking reference like "AC-7F3K" */
function generateRef(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `AC-${code}`;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("AFRICASTALKING_API_KEY");
    const username = Deno.env.get("AFRICASTALKING_USERNAME");
    const smsAvailable = !!(apiKey && username);

    if (!smsAvailable) {
      console.warn("Africa's Talking credentials missing — SMS will be skipped");
    }

    // Authenticate
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const supabaseAdmin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: ReminderRequest = await req.json();
    const {
      appointmentId,
      phoneNumber,
      patientName,
      clinicName,
      clinicPhone,
      appointmentDate,
      appointmentTime,
      notes,
      type = "appointment_reminder",
      confirmationToken,
    } = body;

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

    if (!clinicName || !appointmentDate || !appointmentTime) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: clinicName, appointmentDate, appointmentTime" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const bookingRef = generateRef();
    const results: { userSms: boolean; clinicSms: boolean; ref: string } = {
      userSms: false,
      clinicSms: false,
      ref: bookingRef,
    };

    // ── 1. Notify the PATIENT ──
    if (smsAvailable && phoneNumber) {
      // Check user notification prefs
      const prefField = type === "booking_confirmation" ? "booking_confirmations" : "appointment_reminders";
      const { data: prefs } = await supabaseAdmin
        .from("notification_preferences")
        .select(prefField)
        .eq("user_id", user.id)
        .maybeSingle();

      const shouldSend = !prefs || prefs[prefField] !== false;

      if (shouldSend) {
        let message: string;
        let notificationTitle: string;

        if (type === "booking_confirmation") {
          message = `Hi ${patientName || "there"}! Your appointment at ${clinicName} on ${appointmentDate} at ${appointmentTime} is booked. Ref: ${bookingRef}. We'll remind you before your visit. - AfyaConnect`;
          notificationTitle = `Booking confirmed: ${clinicName}`;
        } else {
          message = `Hi ${patientName || "there"}! Reminder: appointment at ${clinicName} on ${appointmentDate} at ${appointmentTime}. Ref: ${bookingRef}. Please arrive 10 min early. - AfyaConnect`;
          notificationTitle = `Reminder: ${clinicName}`;
        }

        const smsResult = await sendSms(phoneNumber, message, apiKey!, username!);
        results.userSms = smsResult.success;

        // Log to notification_history
        await supabaseAdmin.from("notification_history").insert({
          user_id: user.id,
          type,
          title: notificationTitle,
          message,
          status: smsResult.success ? "sent" : "failed",
        });
      }
    }

    // ── 2. Notify the CLINIC ──
    if (smsAvailable && clinicPhone) {
      const notesStr = notes ? ` Notes: ${notes}` : "";
      const clinicMsg = `[AfyaConnect Booking] New appointment request from ${patientName || "a patient"} on ${appointmentDate} at ${appointmentTime}. Ref: ${bookingRef}.${notesStr} Please confirm availability.`;

      const clinicSmsResult = await sendSms(clinicPhone, clinicMsg, apiKey!, username!);
      results.clinicSms = clinicSmsResult.success;

      if (clinicSmsResult.success) {
        console.log(`Clinic notified at ${clinicPhone} for booking ${bookingRef}`);
      } else {
        console.warn(`Failed to notify clinic at ${clinicPhone}:`, clinicSmsResult.error);
      }
    }

    // ── 3. Always log an in-app notification ──
    const inAppTitle = type === "booking_confirmation"
      ? `Booking confirmed — ${clinicName}`
      : `Appointment reminder — ${clinicName}`;
    const inAppMsg = `Your appointment on ${appointmentDate} at ${appointmentTime} is ${type === "booking_confirmation" ? "booked" : "coming up"}. Reference: ${bookingRef}.${!results.userSms ? " We couldn't send an SMS — please save this reference." : ""}`;

    await supabaseAdmin.from("notification_history").insert({
      user_id: user.id,
      type: "in_app",
      title: inAppTitle,
      message: inAppMsg,
      status: "sent",
    });

    // Mark reminder_sent if applicable
    if (appointmentId && type === "appointment_reminder" && results.userSms) {
      await supabaseUser
        .from("appointments")
        .update({ reminder_sent: true })
        .eq("id", appointmentId);
    }

    return new Response(
      JSON.stringify({ success: true, ref: bookingRef, userSms: results.userSms, clinicSms: results.clinicSms }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in send-appointment-reminder:", error);
    return new Response(JSON.stringify({ success: false, error: "Unable to process request. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
