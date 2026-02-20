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
      className="flex flex-col items-start p-4 md:p-5 lg:p-6 rounded-2xl elevated-card transition-all hover:scale-[1.02] active:scale-[0.98] text-left"
      whileTap={{ scale: 0.97 }}
    >
      <div className={`w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl flex items-center justify-center mb-3 md:mb-4 ${color}`}>
        <Icon className="w-5 h-5 md:w-6 md:h-6" />
      </div>
      <h3 className="font-display font-semibold text-sm md:text-base lg:text-lg text-card-foreground mb-0.5 md:mb-1">{label}</h3>
      <p className="text-xs md:text-sm lg:text-base text-muted-foreground leading-relaxed">{description}</p>
    </motion.button>
  );
}
