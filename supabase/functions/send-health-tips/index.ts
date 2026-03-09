import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Curated health tips relevant to Kenyan communities
const HEALTH_TIPS: string[] = [
  "💧 Drink at least 8 glasses of clean water daily. Boil or treat water if you're unsure of its safety. Staying hydrated helps your body fight infections.",
  "🦟 Malaria prevention: Sleep under a treated mosquito net every night. Remove stagnant water around your home to reduce breeding sites.",
  "🧼 Wash your hands with soap for at least 20 seconds before eating, after using the toilet, and after touching shared surfaces. This prevents cholera, typhoid, and diarrhoea.",
  "🥬 Eat a balanced diet with vegetables, fruits, and proteins daily. Sukuma wiki, spinach, and beans are affordable and nutritious options.",
  "🏃 Stay active! Walk for at least 30 minutes daily. Physical activity reduces the risk of diabetes, heart disease, and high blood pressure.",
  "👶 Ensure children under 5 complete all vaccination schedules. Visit your nearest clinic for free immunizations under the Kenya Expanded Programme on Immunization.",
  "🩸 Know your HIV status. Get tested regularly at any government health facility — it's free and confidential. Early treatment saves lives.",
  "🤰 Pregnant mothers should attend at least 4 antenatal clinic visits. Early and regular checkups help detect complications and keep mother and baby safe.",
  "🦷 Brush your teeth twice daily and limit sugary snacks. Dental infections can lead to serious health problems if untreated.",
  "😴 Get 7-8 hours of sleep each night. Good sleep strengthens your immune system and improves mental health.",
  "🧠 Mental health matters. Talk to someone you trust if you feel overwhelmed. You can also call the Kenya Red Cross helpline at 1199 for support.",
  "💊 If you're on medication, take it as prescribed — don't stop when you feel better. Incomplete treatment can cause drug resistance.",
  "🌞 Protect your skin from the sun, especially between 10am and 4pm. Wear a hat and seek shade to prevent heat-related illness.",
  "🚭 Avoid tobacco and excessive alcohol. They increase the risk of cancer, liver disease, and heart problems.",
  "🩺 Don't wait until you're very sick to visit a clinic. Regular health checkups can catch problems early when they're easier to treat.",
  "🍳 Cook food thoroughly, especially meat and eggs. Proper cooking kills harmful bacteria that cause food poisoning.",
  "💉 Adults need vaccinations too! Ask your doctor about tetanus, hepatitis B, and flu vaccines.",
  "🏥 Know the location of your nearest health facility. Save their phone number in case of emergencies. Use AfyaConnect to find clinics near you!",
  "👀 Rest your eyes every 20 minutes if you use a phone or computer for long periods. Look at something 20 feet away for 20 seconds.",
  "🫁 If you have a cough lasting more than 2 weeks, get tested for TB at your nearest health facility. TB is curable with proper treatment.",
  "🧴 Use sunscreen or protective clothing when working outdoors for extended periods. Skin health is important regardless of skin tone.",
  "🥛 Calcium keeps bones strong. Include milk, yoghurt, or omena (silver fish) in your diet, especially for children and the elderly.",
  "🤧 Cover your mouth and nose with a tissue or your elbow when coughing or sneezing. This prevents spreading respiratory infections.",
  "🩹 Clean wounds immediately with clean water and soap. Apply an antiseptic and cover with a clean bandage to prevent infection.",
  "🧒 Monitor your child's growth regularly. Sudden weight loss or poor appetite could be signs of illness — visit a clinic promptly.",
];

async function sendSms(
  phoneNumber: string,
  message: string,
  apiKey: string,
  username: string
): Promise<boolean> {
  const baseUrl =
    username === "sandbox"
      ? "https://api.sandbox.africastalking.com"
      : "https://api.africastalking.com";

  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("to", phoneNumber);
  formData.append("message", message);

  try {
    const res = await fetch(`${baseUrl}/version1/messaging`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        apiKey,
      },
      body: formData.toString(),
    });
    return res.ok;
  } catch (err) {
    console.error(`SMS send failed for ${phoneNumber}:`, err);
    return false;
  }
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("AFRICASTALKING_API_KEY");
    const username = Deno.env.get("AFRICASTALKING_USERNAME");

    if (!apiKey || !username) {
      console.error("Africa's Talking credentials not configured");
      return new Response(
        JSON.stringify({ error: "SMS credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get all users who opted in for health tips AND have a phone number
    const { data: subscribers, error: fetchError } = await supabase
      .from("notification_preferences")
      .select("user_id, phone_number")
      .eq("health_tips", true)
      .not("phone_number", "is", null);

    if (fetchError) {
      console.error("Failed to fetch subscribers:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch subscribers" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!subscribers || subscribers.length === 0) {
      console.log("No health tip subscribers found");
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: "No subscribers" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Pick a tip based on the current week number so all users get the same tip
    const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
    const tipIndex = weekNumber % HEALTH_TIPS.length;
    const tip = HEALTH_TIPS[tipIndex];
    const message = `[AfyaConnect Health Tip]\n\n${tip}\n\nStay healthy! Reply STOP to unsubscribe.`;

    let sentCount = 0;
    let failedCount = 0;

    // Process in batches of 10 to avoid overwhelming the API
    const batchSize = 10;
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);

      const results = await Promise.allSettled(
        batch.map(async (sub) => {
          const success = await sendSms(sub.phone_number!, message, apiKey, username);

          // Log to notification_history
          await supabase.from("notification_history").insert({
            user_id: sub.user_id,
            type: "health_tip",
            title: "Weekly Health Tip",
            message: tip,
            status: success ? "sent" : "failed",
          });

          return success;
        })
      );

      for (const r of results) {
        if (r.status === "fulfilled" && r.value) sentCount++;
        else failedCount++;
      }
    }

    console.log(`Health tips sent: ${sentCount} success, ${failedCount} failed out of ${subscribers.length} subscribers`);

    return new Response(
      JSON.stringify({
        success: true,
        sent: sentCount,
        failed: failedCount,
        total: subscribers.length,
        tipIndex,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-health-tips:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
