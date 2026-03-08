import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HistoryCardSkeleton } from "@/components/SkeletonCards";
import { motion, AnimatePresence } from "framer-motion";
import { History, Trash2, Stethoscope, ChevronRight, AlertTriangle, LogIn } from "lucide-react";
import { format } from "date-fns";
import type { MatchResult } from "@/services/symptomRules";

interface SymptomCheck {
  id: string;
  symptoms: string[];
  additional_notes: string | null;
  is_urgent: boolean;
  results: MatchResult[];
  created_at: string;
}

export default function SymptomHistory() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [checks, setChecks] = useState<SymptomCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("symptom_checks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setChecks((data as unknown as SymptomCheck[]) || []);
        setLoading(false);
      });
  }, [user]);

  const deleteCheck = async (id: string) => {
    await supabase.from("symptom_checks").delete().eq("id", id);
    setChecks((prev) => prev.filter((c) => c.id !== id));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-8 flex flex-col">
        <AppHeader title="Symptom History" />
        <main className="px-4 pt-4 max-w-lg md:max-w-3xl mx-auto space-y-3">
          {[1, 2, 3].map((i) => <HistoryCardSkeleton key={i} />)}
        </main>
        <BottomNav />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-8 flex flex-col">
        <AppHeader title="Symptom History" />
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <LogIn className="w-10 h-10 text-muted-foreground mb-4" />
          <h2 className="font-display font-bold text-lg text-foreground mb-2">Sign in to view history</h2>
          <Button onClick={() => navigate("/auth")} className="rounded-xl">Sign In</Button>
        </div>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  const likelihoodColors: Record<string, string> = {
    High: "bg-destructive/10 text-destructive border-destructive/20",
    Moderate: "bg-warning/10 text-warning border-warning/20",
    Low: "bg-health-green/10 text-health-green border-health-green/20",
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8 flex flex-col">
      <AppHeader title="Symptom History" />

      <motion.main
        className="px-4 pt-4 max-w-lg md:max-w-3xl mx-auto space-y-4 w-full"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            <h2 className="font-display font-bold text-lg text-foreground">
              Past Symptom Checks
            </h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={() => navigate("/symptom-checker")}
          >
            <Stethoscope className="w-4 h-4 mr-1" /> New Check
          </Button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <HistoryCardSkeleton key={i} />)}
          </div>
        ) : checks.length === 0 ? (
          <div className="text-center py-16 elevated-card rounded-2xl">
            <Stethoscope className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-4">No symptom checks yet</p>
            <Button onClick={() => navigate("/symptom-checker")} className="rounded-xl">
              Check Symptoms Now
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {checks.map((check) => (
              <motion.div
                key={check.id}
                layout
                className="elevated-card rounded-2xl p-4"
              >
                <button
                  onClick={() => setExpandedId(expandedId === check.id ? null : check.id)}
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(check.created_at), "MMM d, yyyy · h:mm a")}
                    </p>
                    <div className="flex items-center gap-2">
                      {check.is_urgent && (
                        <Badge variant="destructive" className="text-[10px] rounded-md px-1.5 py-0">
                          <AlertTriangle className="w-3 h-3 mr-0.5" /> Urgent
                        </Badge>
                      )}
                      <ChevronRight
                        className={`w-4 h-4 text-muted-foreground transition-transform ${
                          expandedId === check.id ? "rotate-90" : ""
                        }`}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {check.symptoms.map((s) => (
                      <Badge key={s} variant="secondary" className="text-[11px] rounded-lg">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </button>

                <AnimatePresence>
                  {expandedId === check.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 pt-3 border-t border-border/40 space-y-2">
                        {check.additional_notes && (
                          <p className="text-xs text-muted-foreground italic">
                            Notes: {check.additional_notes}
                          </p>
                        )}
                        {check.results.map((r, i) => (
                          <div key={i} className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-card-foreground">{r.condition}</p>
                              <p className="text-xs text-muted-foreground line-clamp-2">{r.description}</p>
                            </div>
                            <Badge
                              variant="outline"
                              className={`text-[10px] shrink-0 ${likelihoodColors[r.likelihood] || ""}`}
                            >
                              {r.likelihood}
                            </Badge>
                          </div>
                        ))}
                        <div className="flex justify-end pt-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive h-8 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteCheck(check.id);
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </motion.main>

      <div className="flex-1" />
      <Footer />
      <BottomNav />
    </div>
  );
}
