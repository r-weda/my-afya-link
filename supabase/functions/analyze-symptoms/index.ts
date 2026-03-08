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

    const { symptoms, additionalNotes } = await req.json();

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return new Response(JSON.stringify({ error: "At least one symptom is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are a medical triage assistant for AfyaConnect, a digital health platform. You analyze symptoms and provide educational health guidance. You are NOT a doctor and must always remind users this is not a diagnosis.

Given a list of symptoms and optional additional details from the user, return a structured analysis using the tool provided. Focus on:
1. Conditions that best match ALL provided information (symptoms + context from additional details)
2. How the additional details (duration, severity, history, etc.) affect the likelihood
3. Whether any symptoms suggest urgency

IMPORTANT: 
- Be conservative with likelihood scores
- Always recommend professional medical consultation
- Consider the African healthcare context (e.g. malaria prevalence)
- Maximum 4 conditions returned
- Match scores should reflect how well the full picture matches, not just symptom count`;

    const userPrompt = `Selected symptoms: ${symptoms.join(", ")}
${additionalNotes ? `\nAdditional details from patient: "${additionalNotes}"` : ""}

Analyze these symptoms and provide possible conditions.`;

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
                          description: "Likelihood percentage 0-100 based on symptoms and context",
                        },
                        description: {
                          type: "string",
                          description: "Brief explanation of why this condition matches, referencing the patient's specific details",
                        },
                        advice: {
                          type: "string",
                          description: "Recommended next steps for this condition",
                        },
                        matchedSymptoms: {
                          type: "array",
                          items: { type: "string" },
                          description: "Which of the selected symptoms match this condition",
                        },
                      },
                      required: ["condition", "matchScore", "description", "advice", "matchedSymptoms"],
                      additionalProperties: false,
                    },
                  },
                  isUrgent: {
                    type: "boolean",
                    description: "Whether the symptoms suggest urgent medical attention is needed",
                  },
                  aiInsight: {
                    type: "string",
                    description: "A brief personalized insight based on the additional details provided, or general health guidance if no details were given. 1-2 sentences.",
                  },
                },
                required: ["conditions", "isUrgent", "aiInsight"],
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

    // Ensure conditions are sorted by score
    analysis.conditions.sort((a: any, b: any) => b.matchScore - a.matchScore);

    // Add likelihood labels
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
