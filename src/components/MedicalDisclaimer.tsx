import { AlertTriangle } from "lucide-react";

interface MedicalDisclaimerProps {
  compact?: boolean;
}

export default function MedicalDisclaimer({ compact = false }: MedicalDisclaimerProps) {
  if (compact) {
    return (
      <div className="flex items-start gap-2 p-2.5 rounded-xl bg-muted border border-border">
        <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-medium text-foreground">Disclaimer:</span> For educational purposes only.
          Not a substitute for professional medical advice.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-2xl bg-muted border border-border">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="w-4 h-4 text-muted-foreground" />
        <h4 className="font-display font-semibold text-xs text-foreground uppercase tracking-wide">Medical Disclaimer</h4>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        The health information provided on AfyaConnect is for general educational and informational
        purposes only. It is not intended as a substitute for professional medical advice, diagnosis,
        or treatment. Always seek the advice of your doctor or other qualified health provider.
      </p>
    </div>
  );
}
