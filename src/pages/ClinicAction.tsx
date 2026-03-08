import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function ClinicAction() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const action = searchParams.get("action");

  const [status, setStatus] = useState<"loading" | "success" | "error" | "already" | "prompt">("prompt");
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const executeAction = async (chosenAction: string) => {
    setStatus("loading");
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/clinic-action?token=${token}&action=${chosenAction}`,
        { method: "POST" }
      );
      const data = await res.json();

      if (res.ok && data.success) {
        setResult(data);
        setStatus("success");
      } else if (res.status === 409) {
        setResult(data);
        setStatus("already");
      } else {
        setErrorMsg(data.error || "Something went wrong");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  };

  useEffect(() => {
    if (action && token) {
      executeAction(action);
    }
  }, []);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
          <h1 className="text-lg font-bold text-foreground">Invalid Link</h1>
          <p className="text-sm text-muted-foreground mt-1">This link is missing required information.</p>
        </div>
      </div>
    );
  }

  // If no action in URL, show choice buttons
  if (!action && status === "prompt") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm space-y-6 text-center"
        >
          <div>
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary">A</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">AfyaConnect</h1>
            <p className="text-sm text-muted-foreground mt-1">Appointment Action Required</p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => executeAction("confirm")}
              className="w-full h-12 rounded-xl bg-health-green hover:bg-health-green/90 text-white text-base"
            >
              <CheckCircle2 className="w-5 h-5 mr-2" /> Confirm Appointment
            </Button>
            <Button
              onClick={() => executeAction("decline")}
              variant="destructive"
              className="w-full h-12 rounded-xl text-base"
            >
              <XCircle className="w-5 h-5 mr-2" /> Decline Appointment
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            The patient will be notified of your decision via SMS and in-app notification.
          </p>
        </motion.div>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Processing your response...</p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    const isConfirm = result?.status === "confirmed";
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm text-center space-y-4"
        >
          <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${
            isConfirm ? "bg-health-green/10" : "bg-destructive/10"
          }`}>
            {isConfirm ? (
              <CheckCircle2 className="w-8 h-8 text-health-green" />
            ) : (
              <XCircle className="w-8 h-8 text-destructive" />
            )}
          </div>
          <h1 className="text-xl font-bold text-foreground">
            Appointment {isConfirm ? "Confirmed" : "Declined"}
          </h1>
          <div className="elevated-card rounded-2xl p-4 space-y-2 text-left">
            <p className="text-sm"><span className="text-muted-foreground">Clinic:</span> <span className="font-medium">{result?.clinicName}</span></p>
            <p className="text-sm"><span className="text-muted-foreground">Date:</span> <span className="font-medium">{result?.date}</span></p>
            <p className="text-sm"><span className="text-muted-foreground">Time:</span> <span className="font-medium">{result?.time}</span></p>
          </div>
          <p className="text-xs text-muted-foreground">
            The patient has been notified. You can close this page.
          </p>
        </motion.div>
      </div>
    );
  }

  if (status === "already") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="text-center space-y-3">
          <AlertCircle className="w-12 h-12 text-warning mx-auto" />
          <h1 className="text-lg font-bold text-foreground">Already Processed</h1>
          <p className="text-sm text-muted-foreground">{result?.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="text-center space-y-3">
        <XCircle className="w-12 h-12 text-destructive mx-auto" />
        <h1 className="text-lg font-bold text-foreground">Error</h1>
        <p className="text-sm text-muted-foreground">{errorMsg}</p>
      </div>
    </div>
  );
}
