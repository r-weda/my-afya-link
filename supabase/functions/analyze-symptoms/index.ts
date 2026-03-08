import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { symptoms, additionalNotes, age, symptomDetails } = await req.json();

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return new Response(JSON.stringify({ error: "At least one symptom is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build severity/duration context
    let detailsContext = "";
    if (symptomDetails && typeof symptomDetails === "object") {
      const entries = Object.entries(symptomDetails as Record<string, { severity: string; duration: string }>);
      if (entries.length > 0) {
        detailsContext = "\n\nSymptom details:\n" + entries.map(([name, d]) =>
          `- ${name}: severity ${d.severity}/5, duration: ${d.duration}`
        ).join("\n");
      }
    }

    const ageContext = age ? `\nPatient age: ${age} years old.` : "";

    const systemPrompt = `You are a medical triage assistant for AfyaConnect, a digital health platform serving Kenyan communities. You analyze symptoms and provide educational health guidance. You are NOT a doctor and must always remind users this is not a diagnosis.

Given a list of symptoms with severity ratings, duration, patient age, and optional additional details, return a structured analysis. Focus on:
1. Conditions that best match ALL provided information
2. How severity, duration, and age affect the likelihood and urgency
3. Whether any symptoms suggest urgency (especially for children <5 or elderly >65)
4. Age-appropriate advice and considerations

IMPORTANT: 
- Be conservative with likelihood scores
- Always recommend professional medical consultation
- Consider the African/Kenyan healthcare context (malaria, typhoid, TB prevalence)
- Maximum 5 conditions returned
- For children, consider pediatric conditions; for elderly, consider chronic disease complications
- Include specific clinic type recommendations (e.g., "Visit a Level 4 hospital" or "Any nearby dispensary can help")`;

    const userPrompt = `Selected symptoms: ${symptoms.join(", ")}${ageContext}${detailsContext}
${additionalNotes ? `\nAdditional details from patient: "${additionalNotes}"` : ""}

Analyze these symptoms and provide possible conditions with age-appropriate guidance.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_analysis",
              description: "Return the structured symptom analysis results",
              parameters: {
                type: "object",
                properties: {
                  conditions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        condition: { type: "string", description: "Name of the condition" },
                        matchScore: {
                          type: "number",
                          description: "Likelihood percentage 0-100 based on symptoms, severity, duration, and age",
                        },
                        description: {
                          type: "string",
                          description: "Brief explanation referencing the patient's specific details including age considerations",
                        },
                        advice: {
                          type: "string",
                          description: "Age-appropriate recommended next steps",
                        },
                        matchedSymptoms: {
                          type: "array",
                          items: { type: "string" },
                          description: "Which of the selected symptoms match this condition",
                        },
                        facilityLevel: {
                          type: "string",
                          description: "Recommended facility level: 'dispensary', 'health_center', 'hospital', 'emergency'",
                        },
                      },
                      required: ["condition", "matchScore", "description", "advice", "matchedSymptoms", "facilityLevel"],
                      additionalProperties: false,
                    },
                  },
                  isUrgent: {
                    type: "boolean",
                    description: "Whether the symptoms suggest urgent medical attention is needed",
                  },
                  aiInsight: {
                    type: "string",
                    description: "A brief personalized insight considering the patient's age, symptom severity, and duration. 2-3 sentences max.",
                  },
                  emergencyWarning: {
                    type: "string",
                    description: "If urgent, a specific emergency instruction. Otherwise empty string.",
                  },
                },
                required: ["conditions", "isUrgent", "aiInsight", "emergencyWarning"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_analysis" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI service credits exhausted. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      throw new Error("No structured response from AI");
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    analysis.conditions.sort((a: any, b: any) => b.matchScore - a.matchScore);
    analysis.conditions = analysis.conditions.map((c: any) => ({
      ...c,
      likelihood: c.matchScore >= 75 ? "High" : c.matchScore >= 50 ? "Moderate" : "Low",
    }));

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-symptoms error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Analysis failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
