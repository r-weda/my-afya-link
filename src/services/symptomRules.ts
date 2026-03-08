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

export const symptomCategories: Record<string, string[]> = {
  "Head & Neurological": [
    "Headache", "Dizziness", "Blurred vision", "Confusion", "Fainting",
    "Seizures", "Memory problems",
  ],
  "Chest & Heart": [
    "Chest pain", "Palpitations", "Shortness of breath", "Difficulty breathing",
    "Chest tightness",
  ],
  "Throat & Respiratory": [
    "Cough", "Sore throat", "Runny nose", "Sneezing", "Wheezing",
    "Coughing blood",
  ],
  "Stomach & Digestive": [
    "Nausea", "Vomiting", "Diarrhea", "Stomach pain", "Bloating",
    "Loss of appetite", "Constipation", "Blood in stool",
  ],
  "General & Systemic": [
    "Fever", "Fatigue", "Body aches", "Chills", "Night sweats",
    "Unexplained weight loss", "Swollen lymph nodes",
  ],
  "Skin & External": [
    "Rash", "Itching", "Skin discoloration", "Swelling", "Bruising easily",
  ],
  "Musculoskeletal": [
    "Joint pain", "Back pain", "Muscle weakness", "Stiffness",
  ],
  "Urinary & Reproductive": [
    "Painful urination", "Frequent urination", "Blood in urine",
    "Pelvic pain",
  ],
  "Eyes & Ears": [
    "Eye redness", "Ear pain", "Hearing loss", "Ringing in ears",
  ],
};

export const symptomRules: SymptomRule[] = [
  {
    condition: "Influenza (Flu)",
    symptoms: ["fever", "body aches", "fatigue", "cough", "chills"],
    description: "Symptoms such as fever, fatigue, and body aches are commonly associated with influenza.",
    advice: "Rest, drink fluids, and monitor symptoms. Consider antiviral medication if caught early.",
  },
  {
    condition: "Common Cold",
    symptoms: ["cough", "sore throat", "headache", "fatigue", "runny nose", "sneezing"],
    description: "Mild upper respiratory symptoms including sore throat and cough suggest a common cold.",
    advice: "Rest and hydration are recommended. Symptoms typically resolve within 7–10 days.",
  },
  {
    condition: "Food Poisoning",
    symptoms: ["nausea", "diarrhea", "stomach pain", "vomiting"],
    description: "Nausea, diarrhea, and stomach pain together often indicate foodborne illness.",
    advice: "Stay hydrated and seek medical attention if symptoms persist beyond 48 hours.",
  },
  {
    condition: "Respiratory Infection",
    symptoms: ["cough", "fever", "difficulty breathing", "fatigue", "chest tightness"],
    description: "Persistent cough with fever and breathing difficulty may point to a lower respiratory infection.",
    advice: "Consult a healthcare provider, especially if breathing difficulty worsens.",
  },
  {
    condition: "Migraine",
    symptoms: ["headache", "nausea", "dizziness", "blurred vision"],
    description: "Severe headache accompanied by nausea and dizziness can indicate a migraine episode.",
    advice: "Rest in a dark, quiet room. Over-the-counter pain relief may help. Seek care if frequent.",
  },
  {
    condition: "Gastroenteritis",
    symptoms: ["diarrhea", "nausea", "fever", "stomach pain", "vomiting"],
    description: "Inflammation of the stomach and intestines, often caused by viral or bacterial infection.",
    advice: "Oral rehydration is essential. Avoid solid foods until vomiting stops. Seek care if dehydrated.",
  },
  {
    condition: "Tension Headache",
    symptoms: ["headache", "fatigue", "body aches", "stiffness"],
    description: "Dull, aching head pain with fatigue and body tension is typical of tension headaches.",
    advice: "Rest, manage stress, and consider over-the-counter pain relief.",
  },
  {
    condition: "Allergic Reaction",
    symptoms: ["cough", "sore throat", "headache", "difficulty breathing", "rash", "itching", "sneezing"],
    description: "Respiratory symptoms without fever may suggest an allergic response.",
    advice: "Identify and avoid the allergen. Antihistamines may help. Seek emergency care if breathing is affected.",
  },
  {
    condition: "Malaria",
    symptoms: ["fever", "fatigue", "headache", "body aches", "nausea", "chills", "night sweats"],
    description: "Recurring fever with chills, body aches, and fatigue may indicate malaria, especially in endemic regions.",
    advice: "Visit a healthcare facility immediately for a rapid diagnostic test and treatment.",
  },
  {
    condition: "Typhoid Fever",
    symptoms: ["fever", "headache", "stomach pain", "fatigue", "diarrhea", "loss of appetite"],
    description: "Prolonged fever with abdominal discomfort and fatigue can be signs of typhoid fever.",
    advice: "Seek medical attention promptly. A blood test can confirm the diagnosis.",
  },
  {
    condition: "Pneumonia",
    symptoms: ["cough", "fever", "difficulty breathing", "chest pain", "fatigue", "chills"],
    description: "Persistent cough with chest pain and difficulty breathing may indicate pneumonia.",
    advice: "Seek urgent medical care. Chest X-ray and antibiotics may be needed.",
  },
  {
    condition: "Urinary Tract Infection (UTI)",
    symptoms: ["painful urination", "frequent urination", "pelvic pain", "fever", "blood in urine"],
    description: "Burning or pain during urination with increased frequency may suggest a urinary tract infection.",
    advice: "Drink plenty of water and see a healthcare provider for antibiotics.",
  },
  {
    condition: "Anemia",
    symptoms: ["fatigue", "dizziness", "shortness of breath", "palpitations", "headache"],
    description: "Persistent fatigue with dizziness and shortness of breath may indicate anemia.",
    advice: "Get a blood test to check hemoglobin levels. Iron-rich foods and supplements may help.",
  },
  {
    condition: "Dengue Fever",
    symptoms: ["fever", "headache", "body aches", "joint pain", "rash", "nausea"],
    description: "High fever with severe joint/body pain and rash may indicate dengue fever.",
    advice: "Seek medical care. Rest and hydrate. Avoid aspirin/ibuprofen as they increase bleeding risk.",
  },
  {
    condition: "Tuberculosis (TB)",
    symptoms: ["cough", "coughing blood", "night sweats", "fatigue", "unexplained weight loss", "fever"],
    description: "Persistent cough lasting more than 2 weeks with night sweats and weight loss may suggest TB.",
    advice: "Get tested immediately. TB is treatable with a course of antibiotics but requires medical supervision.",
  },
  {
    condition: "Hypertension Crisis",
    symptoms: ["headache", "chest pain", "dizziness", "blurred vision", "shortness of breath", "nausea"],
    description: "Severe headache with chest pain, vision changes, and dizziness may indicate dangerously high blood pressure.",
    advice: "Seek emergency medical care immediately. Do not delay treatment.",
  },
  {
    condition: "Conjunctivitis (Pink Eye)",
    symptoms: ["eye redness", "itching", "swelling"],
    description: "Red, itchy eyes with discharge or swelling suggest conjunctivitis.",
    advice: "Avoid touching eyes, wash hands frequently. See a doctor if symptoms worsen or persist.",
  },
  {
    condition: "Ear Infection (Otitis)",
    symptoms: ["ear pain", "fever", "hearing loss", "headache"],
    description: "Ear pain with fever and reduced hearing may indicate an ear infection.",
    advice: "See a healthcare provider. Antibiotics may be needed for bacterial infections.",
  },
  {
    condition: "Asthma Exacerbation",
    symptoms: ["wheezing", "shortness of breath", "chest tightness", "cough"],
    description: "Wheezing, chest tightness, and difficulty breathing suggest an asthma flare-up.",
    advice: "Use your rescue inhaler if prescribed. Seek emergency care if symptoms don't improve quickly.",
  },
  {
    condition: "Skin Infection",
    symptoms: ["rash", "swelling", "fever", "skin discoloration"],
    description: "Redness, swelling, and warmth in the skin with fever may indicate a skin infection.",
    advice: "Keep the area clean. See a healthcare provider for possible antibiotic treatment.",
  },
];

const urgentSymptoms = [
  "chest pain", "difficulty breathing", "seizures", "fainting",
  "coughing blood", "blood in stool", "blood in urine", "confusion",
];

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
