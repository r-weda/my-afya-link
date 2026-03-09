import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import {
  Stethoscope, ChevronRight, ChevronLeft, RotateCcw, MapPin, CalendarPlus,
  Loader2, ShieldAlert, History, Trash2, ChevronDown, Brain, Search, X,
  AlertTriangle, Building2, User,
} from "lucide-react";
import { analyzeSymptoms, symptomCategories, type MatchResult } from "@/services/symptomRules";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

const allSymptoms = Object.values(symptomCategories).flat();

const durationOptions = [
  { value: "today", label: "Started today" },
  { value: "2-3_days", label: "2–3 days" },
  { value: "4-7_days", label: "4–7 days" },
  { value: "1-2_weeks", label: "1–2 weeks" },
  { value: "2+_weeks", label: "More than 2 weeks" },
];

interface SymptomDetail {
  severity: number;
  duration: string;
}

interface SymptomCheck {
  id: string;
  symptoms: string[];
  additional_notes: string | null;
  is_urgent: boolean;
  results: MatchResult[];
  created_at: string;
}

export default function SymptomChecker() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Wizard step: 1=select, 2=details, 3=notes+age, 4=results
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [symptomDetails, setSymptomDetails] = useState<Record<string, SymptomDetail>>({});
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [age, setAge] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [customSymptom, setCustomSymptom] = useState("");

  const [results, setResults] = useState<(MatchResult & { facilityLevel?: string })[] | null>(null);
  const [isUrgent, setIsUrgent] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [emergencyWarning, setEmergencyWarning] = useState<string | null>(null);

  const [history, setHistory] = useState<SymptomCheck[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (user) fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    if (!user) return;
    setLoadingHistory(true);
    const { data } = await supabase
      .from("symptom_checks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setHistory(data as unknown as SymptomCheck[]);
    setLoadingHistory(false);
  };

  const saveCheck = async (analysisResults: MatchResult[], urgent: boolean) => {
    if (!user) return;
    await supabase.from("symptom_checks").insert({
      user_id: user.id,
      symptoms: selected,
      additional_notes: additionalNotes || null,
      is_urgent: urgent,
      results: JSON.parse(JSON.stringify(analysisResults)),
    });
    fetchHistory();
  };

  const deleteCheck = async (id: string) => {
    await supabase.from("symptom_checks").delete().eq("id", id);
    setHistory((prev) => prev.filter((h) => h.id !== id));
    toast({ title: "Check deleted" });
  };

  const toggleSymptom = (symptom: string) => {
    setSelected((prev) => {
      if (prev.includes(symptom)) {
        const next = prev.filter((s) => s !== symptom);
        setSymptomDetails((d) => {
          const copy = { ...d };
          delete copy[symptom];
          return copy;
        });
        return next;
      }
      setSymptomDetails((d) => ({ ...d, [symptom]: { severity: 3, duration: "today" } }));
      return [...prev, symptom];
    });
    setError("");
  };

  const addCustomSymptom = () => {
    const trimmed = customSymptom.trim();
    if (!trimmed) return;
    if (!selected.includes(trimmed)) {
      toggleSymptom(trimmed);
    }
    setCustomSymptom("");
  };

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return symptomCategories;
    const q = searchQuery.toLowerCase();
    const filtered: Record<string, string[]> = {};
    for (const [cat, syms] of Object.entries(symptomCategories)) {
      const matched = syms.filter((s) => s.toLowerCase().includes(q));
      if (matched.length > 0) filtered[cat] = matched;
    }
    return filtered;
  }, [searchQuery]);

  const handleAnalyze = async () => {
    if (selected.length === 0) {
      setError("Please select at least one symptom.");
      return;
    }
    setError("");
    setIsAnalyzing(true);
    setAiInsight(null);
    setEmergencyWarning(null);
    setStep(4);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("analyze-symptoms", {
        body: {
          symptoms: selected,
          additionalNotes: additionalNotes || null,
          age: age ? parseInt(age) : null,
          symptomDetails,
        },
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      const aiResults: (MatchResult & { facilityLevel?: string })[] = (data.conditions || []).map((c: any) => ({
        condition: c.condition,
        matchScore: c.matchScore,
        matchedSymptoms: c.matchedSymptoms || [],
        description: c.description,
        advice: c.advice,
        likelihood: c.likelihood || (c.matchScore >= 75 ? "High" : c.matchScore >= 50 ? "Moderate" : "Low"),
        facilityLevel: c.facilityLevel,
      }));

      setResults(aiResults);
      setIsUrgent(data.isUrgent || false);
      setAiInsight(data.aiInsight || null);
      setEmergencyWarning(data.emergencyWarning || null);
      setIsAnalyzing(false);
      await saveCheck(aiResults, data.isUrgent || false);
    } catch (e: any) {
      console.error("AI analysis failed, falling back to rules:", e);
      toast({ title: "AI analysis unavailable", description: "Using rule-based analysis instead.", variant: "destructive" });
      const analysis = analyzeSymptoms(selected);
      setResults(analysis.results);
      setIsUrgent(analysis.isUrgent);
      setIsAnalyzing(false);
      await saveCheck(analysis.results, analysis.isUrgent);
    }
  };

  const handleReset = () => {
    setStep(1);
    setSelected([]);
    setSymptomDetails({});
    setAdditionalNotes("");
    setAge("");
    setSearchQuery("");
    setCustomSymptom("");
    setResults(null);
    setIsUrgent(false);
    setError("");
    setAiInsight(null);
    setEmergencyWarning(null);
  };

  const loadFromHistory = (check: SymptomCheck) => {
    setSelected(check.symptoms);
    setResults(check.results);
    setIsUrgent(check.is_urgent);
    setAdditionalNotes(check.additional_notes || "");
    setStep(4);
    setShowHistory(false);
  };

  const likelihoodColors: Record<string, string> = {
    High: "bg-destructive/10 text-destructive border-destructive/20",
    Moderate: "bg-warning/10 text-warning border-warning/20",
    Low: "bg-health-green/10 text-health-green border-health-green/20",
  };

  const facilityLabels: Record<string, string> = {
    dispensary: "Dispensary / Health Post",
    health_center: "Health Centre",
    hospital: "Hospital (Level 4+)",
    emergency: "🚨 Emergency / A&E",
  };

  const stepTitles = ["Select Symptoms", "Symptom Details", "Additional Info", "Results"];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8 flex flex-col">
      <AppHeader title="Symptom Checker" />

      <main className="px-4 pt-4 max-w-lg md:max-w-2xl mx-auto space-y-5 w-full">
        <MedicalDisclaimer compact />

        {/* Step Indicator */}
        {step < 4 && (
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-1 flex-1">
                <div
                  className={`h-1.5 rounded-full flex-1 transition-colors ${
                    s <= step ? "bg-primary" : "bg-muted"
                  }`}
                />
              </div>
            ))}
            <span className="text-xs lg:text-sm text-muted-foreground ml-2 shrink-0">
              Step {step}/3
            </span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* ── STEP 1: Select Symptoms ── */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-display font-semibold text-lg lg:text-2xl text-foreground">
                    What symptoms do you have?
                  </h2>
                  <p className="text-xs lg:text-sm text-muted-foreground">Select all that apply or search</p>
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search symptoms..."
                  className="pl-9 rounded-xl"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
              </div>

              {/* Selected chips */}
              {selected.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selected.map((s) => (
                    <Badge
                      key={s}
                      className="bg-primary text-primary-foreground rounded-lg py-1 px-2.5 text-xs lg:text-sm cursor-pointer gap-1"
                      onClick={() => toggleSymptom(s)}
                    >
                      {s} <X className="w-3 h-3" />
                    </Badge>
                  ))}
                </div>
              )}

              {/* Categories */}
              <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-1">
                {Object.entries(filteredCategories).map(([category, symptoms]) => (
                  <div key={category}>
                    <p className="text-xs lg:text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      {category}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {symptoms.map((symptom) => (
                        <Badge
                          key={symptom}
                          variant={selected.includes(symptom) ? "default" : "outline"}
                          className={`cursor-pointer rounded-xl py-1.5 px-3 text-xs lg:text-sm transition-all ${
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
                  </div>
                ))}
              </div>

              {/* Custom symptom */}
              <div className="flex gap-2">
                <Input
                  value={customSymptom}
                  onChange={(e) => setCustomSymptom(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCustomSymptom()}
                  placeholder="Add a symptom not listed..."
                  className="rounded-xl text-sm lg:text-base"
                />
                <Button variant="outline" onClick={addCustomSymptom} className="rounded-xl shrink-0" disabled={!customSymptom.trim()}>
                  Add
                </Button>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm lg:text-base text-destructive font-medium">
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <Button
                onClick={() => {
                  if (selected.length === 0) {
                    setError("Please select at least one symptom.");
                    return;
                  }
                  setError("");
                  setStep(2);
                }}
                className="w-full md:w-auto h-12 rounded-xl font-semibold"
              >
                Next: Symptom Details <ChevronRight className="w-4 h-4 ml-1" />
              </Button>

              {/* History */}
              {user && history.length > 0 && (
                <div className="space-y-3 pt-2">
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="flex items-center gap-2 text-sm lg:text-base font-semibold text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <History className="w-4 h-4" />
                    Past Checks ({history.length})
                    <ChevronDown className={`w-4 h-4 transition-transform ${showHistory ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {showHistory && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 overflow-hidden"
                      >
                        {history.map((check) => (
                          <div key={check.id} className="elevated-card rounded-xl p-3 flex items-center justify-between gap-3">
                            <button onClick={() => loadFromHistory(check)} className="flex-1 text-left space-y-1 min-w-0">
                              <div className="flex items-center gap-2">
                                 <p className="text-xs lg:text-sm text-muted-foreground">
                                  {format(new Date(check.created_at), "MMM d, yyyy · h:mm a")}
                                </p>
                                {check.is_urgent && (
                                  <Badge variant="destructive" className="text-[10px] rounded-md px-1.5 py-0">Urgent</Badge>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {check.symptoms.slice(0, 4).map((s) => (
                                  <Badge key={s} variant="secondary" className="text-[10px] rounded-md">{s}</Badge>
                                ))}
                                {check.symptoms.length > 4 && (
                                  <Badge variant="secondary" className="text-[10px] rounded-md">+{check.symptoms.length - 4}</Badge>
                                )}
                              </div>
                            </button>
                            <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteCheck(check.id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}

          {/* ── STEP 2: Severity & Duration ── */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <h2 className="font-display font-semibold text-lg lg:text-2xl text-foreground">
                    How severe are your symptoms?
                  </h2>
                  <p className="text-xs lg:text-sm text-muted-foreground">Rate each symptom's severity and duration</p>
                </div>
              </div>

              <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
                {selected.map((symptom) => {
                  const detail = symptomDetails[symptom] || { severity: 3, duration: "today" };
                  return (
                    <div key={symptom} className="elevated-card rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm lg:text-base text-foreground">{symptom}</h3>
                        <Badge variant="outline" className="rounded-lg text-xs lg:text-sm">
                          {detail.severity}/5
                        </Badge>
                      </div>

                      <div className="space-y-1.5">
                         <label className="text-xs lg:text-sm text-muted-foreground">Severity</label>
                        <div className="flex items-center gap-3">
                          <span className="text-xs lg:text-sm text-muted-foreground">Mild</span>
                          <Slider
                            value={[detail.severity]}
                            min={1}
                            max={5}
                            step={1}
                            onValueChange={([v]) =>
                              setSymptomDetails((d) => ({
                                ...d,
                                [symptom]: { ...d[symptom], severity: v },
                              }))
                            }
                            className="flex-1"
                          />
                          <span className="text-xs lg:text-sm text-muted-foreground">Severe</span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs lg:text-sm text-muted-foreground">Duration</label>
                        <Select
                          value={detail.duration}
                          onValueChange={(v) =>
                            setSymptomDetails((d) => ({
                              ...d,
                              [symptom]: { ...d[symptom], duration: v },
                            }))
                          }
                        >
                          <SelectTrigger className="rounded-xl h-9 lg:h-12 text-sm lg:text-base">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {durationOptions.map((o) => (
                              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="h-12 rounded-xl font-semibold">
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Button onClick={() => setStep(3)} className="flex-1 h-12 rounded-xl font-semibold">
                  Next: Additional Info <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: Notes & Age ── */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-info" />
                </div>
                <div>
                  <h2 className="font-display font-semibold text-lg lg:text-2xl text-foreground">
                    A few more details
                  </h2>
                  <p className="text-xs lg:text-sm text-muted-foreground">Helps provide more accurate analysis</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm lg:text-base font-medium text-foreground">Age (optional)</label>
                  <Input
                    type="number"
                    min={0}
                    max={120}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Enter your age"
                    className="rounded-xl"
                  />
                   <p className="text-xs lg:text-sm text-muted-foreground">
                    Age helps tailor recommendations (e.g., pediatric vs. adult conditions)
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm lg:text-base font-medium text-foreground">Additional details (optional)</label>
                  <Textarea
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="E.g., 'symptoms worsen at night', 'recently traveled', 'pregnant', medical history..."
                    className="rounded-xl resize-none min-h-[100px]"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="h-12 rounded-xl font-semibold">
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Button onClick={handleAnalyze} disabled={isAnalyzing} className="flex-1 h-12 rounded-xl font-semibold">
                  {isAnalyzing ? (
                    <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Analyzing...</>
                  ) : (
                    <><Brain className="w-4 h-4 mr-1" /> Analyze with AI</>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 4: Results ── */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              {/* Loading state */}
              {isAnalyzing && (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                  <div className="text-center">
                     <p className="font-display font-semibold text-foreground lg:text-lg">Analyzing your symptoms...</p>
                     <p className="text-sm lg:text-base text-muted-foreground mt-1">AI is reviewing {selected.length} symptoms</p>
                  </div>
                </div>
              )}

              {!isAnalyzing && results && (
                <>
                  {/* Emergency Warning */}
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
                        {emergencyWarning || "You've reported symptoms that may require immediate medical evaluation. Please seek emergency care or visit the nearest clinic right away."}
                      </p>
                      <Button
                        onClick={() => navigate("/clinics")}
                        variant="destructive"
                        className="mt-3 rounded-xl font-semibold"
                      >
                        <MapPin className="w-4 h-4 mr-1" /> Find Emergency Care Now
                      </Button>
                    </motion.div>
                  )}

                  {/* AI Insight */}
                  {aiInsight && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 rounded-2xl border border-primary/20 bg-primary/5"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-5 h-5 text-primary" />
                        <span className="font-display font-bold text-sm lg:text-base text-primary">AI Insight</span>
                      </div>
                      <p className="text-sm lg:text-base text-foreground leading-relaxed">{aiInsight}</p>
                    </motion.div>
                  )}

                  {/* Results heading */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Stethoscope className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                       <h2 className="font-display font-semibold text-lg lg:text-2xl text-foreground">
                         Possible Conditions
                       </h2>
                       <p className="text-xs lg:text-sm text-muted-foreground">
                         Based on {selected.length} symptom{selected.length > 1 ? "s" : ""}{age ? `, age ${age}` : ""}
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
                          transition={{ delay: i * 0.08 }}
                          className="elevated-card rounded-2xl p-4 space-y-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-display font-bold text-base lg:text-lg text-foreground">{r.condition}</h3>
                            <Badge className={`rounded-lg text-xs lg:text-sm shrink-0 ${likelihoodColors[r.likelihood]}`}>
                              {r.likelihood} ({r.matchScore}%)
                            </Badge>
                          </div>

                          <p className="text-sm lg:text-base text-muted-foreground leading-relaxed">{r.description}</p>

                          <div className="flex flex-wrap gap-1.5">
                            {r.matchedSymptoms.map((s) => (
                              <Badge key={s} variant="secondary" className="rounded-lg text-xs lg:text-sm capitalize">{s}</Badge>
                            ))}
                          </div>

                          <div className="pt-2 border-t border-border space-y-2">
                            <div>
                               <p className="text-xs lg:text-sm font-semibold text-foreground mb-1">Recommended Action:</p>
                               <p className="text-xs lg:text-sm text-muted-foreground leading-relaxed">{r.advice}</p>
                            </div>
                            {r.facilityLevel && facilityLabels[r.facilityLevel] && (
                              <div className="flex items-center gap-1.5 text-xs lg:text-sm">
                                <Building2 className="w-3.5 h-3.5 text-primary" />
                                <span className="font-medium text-primary">
                                  Recommended: {facilityLabels[r.facilityLevel]}
                                </span>
                              </div>
                            )}
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

                  {/* Quick Actions */}
                  <div className="elevated-card rounded-2xl p-4 space-y-3">
                    <h3 className="font-display font-semibold text-sm text-foreground">What to do next</h3>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button onClick={() => navigate("/clinics")} className="flex-1 h-11 rounded-xl font-semibold">
                        <MapPin className="w-4 h-4 mr-2" /> Find Nearby Clinics
                      </Button>
                      <Button onClick={() => navigate("/appointments")} variant="outline" className="flex-1 h-11 rounded-xl font-semibold">
                        <CalendarPlus className="w-4 h-4 mr-2" /> Book Appointment
                      </Button>
                    </div>
                  </div>

                  <Button variant="ghost" onClick={handleReset} className="w-full md:w-auto h-11 rounded-xl">
                    <RotateCcw className="w-4 h-4 mr-2" /> Start Over
                  </Button>

                  <MedicalDisclaimer />
                </>
              )}
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
