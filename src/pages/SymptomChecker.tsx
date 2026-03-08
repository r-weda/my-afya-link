import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "@/components/Footer";
import { Stethoscope, AlertTriangle, ChevronRight, RotateCcw, MapPin, CalendarPlus, Loader2, ShieldAlert } from "lucide-react";
import { analyzeSymptoms, type MatchResult } from "@/services/symptomRules";

const commonSymptoms = [
  "Headache", "Fever", "Cough", "Fatigue", "Sore throat",
  "Nausea", "Body aches", "Diarrhea", "Chest pain", "Dizziness",
  "Stomach pain", "Difficulty breathing",
];

export default function SymptomChecker() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [results, setResults] = useState<MatchResult[] | null>(null);
  const [isUrgent, setIsUrgent] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const toggleSymptom = (symptom: string) => {
    setSelected((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
    setError("");
  };

  const handleAnalyze = async () => {
    if (selected.length === 0) {
      setError("Please select at least one symptom before analyzing.");
      return;
    }
    setError("");
    setIsAnalyzing(true);

    // Simulate brief analysis delay for UX
    await new Promise((r) => setTimeout(r, 1200));

    const analysis = analyzeSymptoms(selected);
    setResults(analysis.results);
    setIsUrgent(analysis.isUrgent);
    setIsAnalyzing(false);
  };

  const handleReset = () => {
    setSelected([]);
    setAdditionalNotes("");
    setResults(null);
    setIsUrgent(false);
    setError("");
  };

  const likelihoodColors: Record<string, string> = {
    High: "bg-destructive/10 text-destructive border-destructive/20",
    Moderate: "bg-warning/10 text-warning border-warning/20",
    Low: "bg-health-green/10 text-health-green border-health-green/20",
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8 flex flex-col">
      <AppHeader title="Symptom Checker" />

      <main className="px-4 pt-4 max-w-lg md:max-w-2xl mx-auto space-y-5">
        <MedicalDisclaimer compact />

        <AnimatePresence mode="wait">
          {!results ? (
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
                  <h2 className="font-display font-semibold text-lg md:text-xl lg:text-2xl text-foreground">
                    What symptoms do you have?
                  </h2>
                  <p className="text-xs lg:text-sm text-muted-foreground">Select all that apply</p>
                </div>
              </div>

              {/* Symptom chips */}
              <div className="flex flex-wrap gap-2">
                {commonSymptoms.map((symptom) => (
                  <Badge
                    key={symptom}
                    variant={selected.includes(symptom) ? "default" : "outline"}
                    className={`cursor-pointer rounded-xl py-2 px-3 text-sm lg:text-base transition-all ${
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
                <label className="text-xs lg:text-sm font-medium text-muted-foreground">Additional details (optional)</label>
                <Textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Describe any other symptoms or how long you've been feeling this way..."
                  className="rounded-xl resize-none min-h-[80px] lg:text-base"
                />
              </div>

              {/* Error message */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-sm text-destructive font-medium"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full md:w-auto h-12 lg:h-13 rounded-xl font-semibold lg:text-base"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    Analyzing symptoms...
                  </>
                ) : (
                  <>
                    Analyze Symptoms
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
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
              {/* Urgent alert */}
              {isUrgent && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-2xl border-2 border-destructive/30 bg-destructive/10"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldAlert className="w-5 h-5 text-destructive" />
                    <span className="font-display font-bold text-sm lg:text-base text-destructive uppercase tracking-wider">
                      ⚠ Urgent Medical Attention Recommended
                    </span>
                  </div>
                  <p className="text-sm lg:text-base text-foreground leading-relaxed">
                    You've reported symptoms that may require immediate medical evaluation. Please seek emergency care or visit the nearest clinic right away.
                  </p>
                </motion.div>
              )}

              {/* Results heading */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-display font-semibold text-lg md:text-xl lg:text-2xl text-foreground">
                    Possible Health Conditions
                  </h2>
                  <p className="text-xs lg:text-sm text-muted-foreground">
                    Based on {selected.length} selected symptom{selected.length > 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* Condition cards */}
              <div className="space-y-3">
                {results.length > 0 ? (
                  results.map((r, i) => (
                    <motion.div
                      key={r.condition}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="elevated-card rounded-2xl p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-display font-bold text-base lg:text-lg text-foreground">
                          {r.condition}
                        </h3>
                        <Badge className={`rounded-lg text-xs shrink-0 ${likelihoodColors[r.likelihood]}`}>
                          {r.likelihood} ({r.matchScore}%)
                        </Badge>
                      </div>

                      <p className="text-sm lg:text-base text-muted-foreground leading-relaxed">
                        {r.description}
                      </p>

                      <div className="flex flex-wrap gap-1.5">
                        {r.matchedSymptoms.map((s) => (
                          <Badge key={s} variant="secondary" className="rounded-lg text-xs capitalize">
                            {s}
                          </Badge>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-border">
                        <p className="text-xs lg:text-sm font-semibold text-foreground mb-1">
                          Recommended Action:
                        </p>
                        <p className="text-xs lg:text-sm text-muted-foreground leading-relaxed">
                          {r.advice}
                        </p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="elevated-card rounded-2xl p-5 text-center">
                    <p className="text-sm text-muted-foreground">
                      No strong condition matches found. If you feel unwell, please consult a healthcare provider.
                    </p>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => navigate("/clinics")}
                  className="flex-1 h-11 rounded-xl font-semibold"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Find Nearby Clinics
                </Button>
                <Button
                  onClick={() => navigate("/appointments")}
                  variant="outline"
                  className="flex-1 h-11 rounded-xl font-semibold"
                >
                  <CalendarPlus className="w-4 h-4 mr-2" />
                  Book Appointment
                </Button>
              </div>

              <Button
                variant="ghost"
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

      <div className="flex-1" />
      <Footer />
      <BottomNav />
    </div>
  );
}
