import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface QuickActionCardProps {
  icon: LucideIcon;
  label: string;
  description: string;
  color: string;
  onClick: () => void;
}

export default function QuickActionCard({ icon: Icon, label, description, color, onClick }: QuickActionCardProps) {
  return (
    <motion.button
      onClick={onClick}
      className="flex flex-col items-start p-4 rounded-2xl elevated-card transition-all hover:scale-[1.02] active:scale-[0.98] text-left"
      whileTap={{ scale: 0.97 }}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-display font-semibold text-sm text-card-foreground mb-0.5">{label}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
    </motion.button>
  );
}
