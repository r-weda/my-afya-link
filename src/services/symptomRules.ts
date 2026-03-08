export interface SymptomRule {
  condition: string;
  symptoms: string[];
  description: string;
  advice: string;
}

export interface MatchResult {
  condition: string;
  matchScore: number;
  matchedSymptoms: string[];
  description: string;
  advice: string;
  likelihood: "High" | "Moderate" | "Low";
}

export const symptomRules: SymptomRule[] = [
  {
    condition: "Influenza (Flu)",
    symptoms: ["fever", "body aches", "fatigue", "cough"],
    description: "Symptoms such as fever, fatigue, and body aches are commonly associated with influenza.",
    advice: "Rest, drink fluids, and monitor symptoms. Consider antiviral medication if caught early.",
  },
  {
    condition: "Common Cold",
    symptoms: ["cough", "sore throat", "headache", "fatigue"],
    description: "Mild upper respiratory symptoms including sore throat and cough suggest a common cold.",
    advice: "Rest and hydration are recommended. Symptoms typically resolve within 7–10 days.",
  },
  {
    condition: "Food Poisoning",
    symptoms: ["nausea", "diarrhea", "stomach pain"],
    description: "Nausea, diarrhea, and stomach pain together often indicate foodborne illness.",
    advice: "Stay hydrated and seek medical attention if symptoms persist beyond 48 hours.",
  },
  {
    condition: "Respiratory Infection",
    symptoms: ["cough", "fever", "difficulty breathing", "fatigue"],
    description: "Persistent cough with fever and breathing difficulty may point to a lower respiratory infection.",
    advice: "Consult a healthcare provider, especially if breathing difficulty worsens.",
  },
  {
    condition: "Migraine",
    symptoms: ["headache", "nausea", "dizziness"],
    description: "Severe headache accompanied by nausea and dizziness can indicate a migraine episode.",
    advice: "Rest in a dark, quiet room. Over-the-counter pain relief may help. Seek care if frequent.",
  },
  {
    condition: "Gastroenteritis",
    symptoms: ["diarrhea", "nausea", "fever", "stomach pain"],
    description: "Inflammation of the stomach and intestines, often caused by viral or bacterial infection.",
    advice: "Oral rehydration is essential. Avoid solid foods until vomiting stops. Seek care if dehydrated.",
  },
  {
    condition: "Tension Headache",
    symptoms: ["headache", "fatigue", "body aches"],
    description: "Dull, aching head pain with fatigue and body tension is typical of tension headaches.",
    advice: "Rest, manage stress, and consider over-the-counter pain relief.",
  },
  {
    condition: "Allergic Reaction",
    symptoms: ["cough", "sore throat", "headache", "difficulty breathing"],
    description: "Respiratory symptoms without fever may suggest an allergic response.",
    advice: "Identify and avoid the allergen. Antihistamines may help. Seek emergency care if breathing is affected.",
  },
];

const urgentSymptoms = ["chest pain", "difficulty breathing"];

export function analyzeSymptoms(selectedSymptoms: string[]): {
  results: MatchResult[];
  isUrgent: boolean;
} {
  const normalized = selectedSymptoms.map((s) => s.toLowerCase());

  const isUrgent = normalized.some((s) => urgentSymptoms.includes(s));

  const results: MatchResult[] = symptomRules
    .map((rule) => {
      const matchedSymptoms = rule.symptoms.filter((s) => normalized.includes(s));
      const matchScore = Math.round((matchedSymptoms.length / rule.symptoms.length) * 100);

      return {
        condition: rule.condition,
        matchScore,
        matchedSymptoms,
        description: rule.description,
        advice: rule.advice,
        likelihood: (matchScore >= 75 ? "High" : matchScore >= 50 ? "Moderate" : "Low") as MatchResult["likelihood"],
      };
    })
    .filter((r) => r.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore);

  return { results, isUrgent };
}
