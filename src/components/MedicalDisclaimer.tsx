import { AlertTriangle } from "lucide-react";

interface MedicalDisclaimerProps {
  compact?: boolean;
}

export default function MedicalDisclaimer({ compact = false }: MedicalDisclaimerProps) {
  if (compact) {
    return (
      <div className="flex items-start gap-2 p-2.5 rounded-xl bg-muted/60 border border-border/40">
        <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-[11px] text-muted-foreground/80 leading-relaxed">
          <span className="font-medium text-muted-foreground">Disclaimer:</span> For educational purposes only.
          Not a substitute for professional medical advice.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-2xl bg-muted/40 border border-border/30">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="w-4 h-4 text-muted-foreground" />
        <h4 className="font-display font-semibold text-xs text-muted-foreground uppercase tracking-wide">Medical Disclaimer</h4>
      </div>
      <p className="text-xs text-muted-foreground/80 leading-relaxed">
        The health information provided on AfyaConnect is for general educational and informational
        purposes only. It is not intended as a substitute for professional medical advice, diagnosis,
        or treatment. Always seek the advice of your doctor or other qualified health provider.
      </p>
    </div>
  );
}
