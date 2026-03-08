import { MapPin, Phone, Clock, Star, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface ClinicCardProps {
  id?: string;
  name: string;
  address: string;
  city: string;
  phone?: string;
  operatingHours?: string;
  services?: string[];
  isVerified?: boolean;
  onClick?: () => void;
  onBook?: (clinicId: string) => void;
}

export default function ClinicCard({
  id,
  name,
  address,
  city,
  phone,
  operatingHours,
  services,
  isVerified,
  onClick,
  onBook,
}: ClinicCardProps) {
  return (
    <motion.button
      onClick={onClick}
      className="w-full text-left elevated-card rounded-2xl p-4 transition-all hover:scale-[1.01] active:scale-[0.99] overflow-hidden"
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-display font-semibold text-base lg:text-lg text-card-foreground truncate">
              {name}
            </h3>
            {isVerified && (
              <Badge variant="secondary" className="shrink-0 text-[10px] lg:text-xs px-1.5 py-0 bg-health-green/10 text-health-green border-health-green/20">
                <Star className="w-3 h-3 mr-0.5 fill-current" />
                Verified
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm lg:text-base text-muted-foreground min-w-0">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{address}, {city}</span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs lg:text-sm text-muted-foreground">
        {phone && (
          <div className="flex items-center gap-1 min-w-0">
            <Phone className="w-3 h-3 shrink-0" />
            <span className="truncate">{phone}</span>
          </div>
        )}
        {operatingHours && (
          <div className="flex items-center gap-1 min-w-0">
            <Clock className="w-3 h-3 shrink-0" />
            <span className="truncate">{operatingHours}</span>
          </div>
        )}
      </div>

      {services && services.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {services.slice(0, 3).map((s) => (
            <span key={s} className="text-[10px] lg:text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
              {s}
            </span>
          ))}
          {services.length > 3 && (
            <span className="text-[10px] lg:text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              +{services.length - 3} more
            </span>
          )}
        </div>
      )}

      {onBook && id && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBook(id);
            }}
            className="text-xs lg:text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Book Appointment →
          </button>
        </div>
      )}
    </motion.button>
  );
}
