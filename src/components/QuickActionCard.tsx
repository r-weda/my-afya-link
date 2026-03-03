import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface QuickActionCardProps {
  icon: LucideIcon;
  label: string;
  description: string;
  color: string;
  onClick: () => void;
  prominent?: boolean;
}

export default function QuickActionCard({
  icon: Icon,
  label,
  description,
  color,
  onClick,
  prominent = false,
}: QuickActionCardProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`flex flex-col items-start rounded-2xl elevated-card text-left ${
        prominent
          ? "p-5 md:p-6 lg:p-8 ring-2 ring-primary/20"
          : "p-4 md:p-5 lg:p-6"
      }`}
      whileTap={{ scale: 0.97 }}
    >
      <div
        className={`flex items-center justify-center rounded-xl lg:rounded-2xl mb-3 md:mb-4 ${color} ${
          prominent
            ? "w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16"
            : "w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14"
        }`}
      >
        <Icon className={prominent ? "w-6 h-6 md:w-7 md:h-7" : "w-5 h-5 md:w-6 md:h-6"} />
      </div>
      <h3
        className={`font-display font-semibold text-card-foreground mb-1 ${
          prominent
            ? "text-base md:text-lg lg:text-xl"
            : "text-sm md:text-base lg:text-lg"
        }`}
      >
        {label}
      </h3>
      <p className="text-xs md:text-sm lg:text-base text-muted-foreground leading-relaxed">{description}</p>
    </motion.button>
  );
}
