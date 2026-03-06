import { AlertTriangle } from "lucide-react";

interface MedicalDisclaimerProps {
  compact?: boolean;
}

export default function MedicalDisclaimer({ compact = false }: MedicalDisclaimerProps) {
  if (compact) {
    return (
      <div className="flex items-start gap-2 p-2.5 lg:p-3 rounded-xl bg-[hsl(45,100%,90%)] border border-[hsl(40,100%,50%)]">
        <AlertTriangle className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-destructive shrink-0 mt-0.5" />
        <p className="text-xs lg:text-sm text-[hsl(0,70%,30%)] leading-relaxed">
          <span className="font-bold text-destructive">Disclaimer:</span> For educational purposes only.
          Not a substitute for professional medical advice.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-2xl bg-[hsl(45,100%,90%)] border-2 border-[hsl(40,100%,50%)]">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="w-4 h-4 text-destructive" />
        <h4 className="font-display font-bold text-xs lg:text-sm text-destructive uppercase tracking-wide">Medical Disclaimer</h4>
      </div>
      <p className="text-xs lg:text-sm text-[hsl(0,70%,30%)] leading-relaxed">
        The health information provided on AfyaConnect is for general educational and informational
        purposes only. It is not intended as a substitute for professional medical advice, diagnosis,
        or treatment. Always seek the advice of your doctor or other qualified health provider.
      </p>
    </div>
  );
}
