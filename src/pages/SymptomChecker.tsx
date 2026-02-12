import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { Stethoscope, AlertTriangle, ChevronRight, RotateCcw } from "lucide-react";

const commonSymptoms = [
  "Headache", "Fever", "Cough", "Fatigue", "Sore throat",
  "Nausea", "Body aches", "Diarrhea", "Chest pain", "Dizziness",
  "Stomach pain", "Difficulty breathing",
];

interface Recommendation {
  severity: "low" | "moderate" | "high";
  title: string;
  description: string;
  action: string;
}

function getRecommendation(symptoms: string[]): Recommendation {
  const highSeverity = ["Chest pain", "Difficulty breathing"];
  const moderateSeverity = ["Fever", "Diarrhea", "Nausea"];

  const hasHigh = symptoms.some((s) => highSeverity.includes(s));
  const hasModerate = symptoms.some((s) => moderateSeverity.includes(s));

  if (hasHigh) {
    return {
      severity: "high",
      title: "Seek Immediate Medical Attention",
      description: "Your symptoms may require urgent care. Please visit the nearest hospital or call emergency services.",
      action: "Call 999 or 112 for emergencies",
    };
  }

  if (hasModerate || symptoms.length >= 3) {
    return {
      severity: "moderate",
      title: "Visit a Healthcare Provider",
      description: "Based on your symptoms, we recommend scheduling an appointment with a doctor within 24-48 hours.",
      action: "Book an appointment",
    };
  }

  return {
    severity: "low",
    title: "Monitor Your Symptoms",
    description: "Your symptoms appear mild. Rest, stay hydrated, and monitor. If symptoms persist beyond 3 days, visit a doctor.",
    action: "View health tips",
  };
}

export default function SymptomChecker() {
  const [selected, setSelected] = useState<string[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [result, setResult] = useState<Recommendation | null>(null);

  const toggleSymptom = (symptom: string) => {
    setSelected((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const handleCheck = () => {
    if (selected.length === 0) return;
    setResult(getRecommendation(selected));
  };

  const handleReset = () => {
    setSelected([]);
    setAdditionalNotes("");
    setResult(null);
  };

  const severityColors = {
    low: "bg-health-green/10 text-health-green border-health-green/20",
    moderate: "bg-warning/10 text-warning border-warning/20",
    high: "bg-destructive/10 text-destructive border-destructive/20",
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <AppHeader title="Symptom Checker" />

      <main className="px-4 pt-4 max-w-lg md:max-w-2xl mx-auto space-y-5">
        <MedicalDisclaimer compact />

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-display font-semibold text-lg text-foreground">
                    What symptoms do you have?
                  </h2>
                  <p className="text-xs text-muted-foreground">Select all that apply</p>
                </div>
              </div>

              {/* Symptom chips */}
              <div className="flex flex-wrap gap-2">
                {commonSymptoms.map((symptom) => (
                  <Badge
                    key={symptom}
                    variant={selected.includes(symptom) ? "default" : "outline"}
                    className={`cursor-pointer rounded-xl py-2 px-3 text-sm transition-all ${
                      selected.includes(symptom)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "hover:bg-secondary"
                    }`}
                    onClick={() => toggleSymptom(symptom)}
                  >
                    {symptom}
                  </Badge>
                ))}
              </div>

              {/* Additional notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Additional details (optional)</label>
                <Textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Describe any other symptoms or how long you've been feeling this way..."
                  className="rounded-xl resize-none min-h-[80px]"
                />
              </div>

              <Button
                onClick={handleCheck}
                disabled={selected.length === 0}
                className="w-full md:w-auto h-12 rounded-xl font-semibold"
              >
                Check Symptoms
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              {/* Result card */}
              <div className={`p-5 rounded-2xl border ${severityColors[result.severity]}`}>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-display font-bold text-sm uppercase tracking-wider">
                    {result.severity === "high" ? "Urgent" : result.severity === "moderate" ? "Moderate" : "Mild"}
                  </span>
                </div>
                <h3 className="font-display font-bold text-xl text-foreground mb-2">{result.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{result.description}</p>
                <Button variant="outline" className="rounded-xl w-full md:w-auto" onClick={() => {}}>
                  {result.action}
                </Button>
              </div>

              {/* Selected symptoms */}
              <div className="elevated-card rounded-2xl p-4">
                <h4 className="font-display font-semibold text-sm text-foreground mb-2">Your symptoms</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selected.map((s) => (
                    <Badge key={s} variant="secondary" className="rounded-lg text-xs">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                onClick={handleReset}
                className="w-full md:w-auto h-11 rounded-xl"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Start Over
              </Button>

              <MedicalDisclaimer />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BottomNav />
    </div>
  );
}
