import { AlertTriangle } from "lucide-react";

interface MedicalDisclaimerProps {
  compact?: boolean;
}

export default function MedicalDisclaimer({ compact = false }: MedicalDisclaimerProps) {
  if (compact) {
    return (
      <div className="flex items-start gap-2 p-3 rounded-xl bg-warning/10 border border-warning/20">
        <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">Medical Disclaimer:</span> This information
          is for educational purposes only and is not a substitute for professional medical advice.
          Always consult a qualified healthcare provider.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-2xl bg-warning/5 border border-warning/15">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="w-5 h-5 text-warning" />
        <h4 className="font-display font-semibold text-sm text-foreground">Medical Disclaimer</h4>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        The health information provided on AfyaConnect is for general educational and informational
        purposes only. It is not intended as a substitute for professional medical advice, diagnosis,
        or treatment. Always seek the advice of your doctor or other qualified health provider with
        any questions you may have regarding a medical condition. Never disregard professional medical
        advice or delay in seeking it because of something you have read on this application.
      </p>
    </div>
  );
}
