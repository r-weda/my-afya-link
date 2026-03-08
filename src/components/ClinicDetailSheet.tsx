import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Clock, Star, Navigation, CalendarPlus, Globe, Mail, ArrowLeft } from "lucide-react";
import DirectionsMap from "@/components/DirectionsMap";

interface ClinicDetail {
  id: string;
  name: string;
  address: string;
  city: string;
  county?: string | null;
  phone_number?: string | null;
  email?: string | null;
  website?: string | null;
  operating_hours?: string | null;
  services?: string[] | null;
  is_verified: boolean;
  latitude?: number | null;
  longitude?: number | null;
  description?: string | null;
}

interface ClinicDetailSheetProps {
  clinic: ClinicDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ClinicDetailSheet({ clinic, open, onOpenChange }: ClinicDetailSheetProps) {
  const navigate = useNavigate();
  const [showDirections, setShowDirections] = useState(false);

  if (!clinic) return null;

  const handleBook = () => {
    onOpenChange(false);
    navigate(`/appointments?clinic=${clinic.id}`);
  };

  const handleClose = (val: boolean) => {
    if (!val) setShowDirections(false);
    onOpenChange(val);
  };

  const hasCoords = clinic.latitude != null && clinic.longitude != null;

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[90vh] overflow-y-auto pb-8">
        {showDirections && hasCoords ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setShowDirections(false)}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h3 className="font-display font-semibold text-sm lg:text-base">Directions to {clinic.name}</h3>
            </div>
            <div className="h-[55vh] rounded-2xl overflow-hidden border border-border/50">
              <DirectionsMap
                clinicName={clinic.name}
                clinicLat={clinic.latitude!}
                clinicLng={clinic.longitude!}
              />
            </div>
            <p className="text-[10px] text-muted-foreground text-center">
              Route via OpenStreetMap & OSRM · Driving estimate
            </p>
          </div>
        ) : (
          <>
            <SheetHeader className="text-left pb-2">
              <div className="flex items-center gap-2">
                <SheetTitle className="font-display text-lg lg:text-xl">{clinic.name}</SheetTitle>
                {clinic.is_verified && (
                  <Badge variant="secondary" className="shrink-0 text-[10px] lg:text-xs px-1.5 py-0 bg-health-green/10 text-health-green border-health-green/20">
                    <Star className="w-3 h-3 mr-0.5 fill-current" />
                    Verified
                  </Badge>
                )}
              </div>
            </SheetHeader>

            <div className="space-y-4 mt-2">
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                <span>{clinic.address}, {clinic.city}{clinic.county ? `, ${clinic.county}` : ""}</span>
              </div>

              {clinic.phone_number && (
                <a href={`tel:${clinic.phone_number}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Phone className="w-4 h-4 shrink-0 text-primary" />
                  <span>{clinic.phone_number}</span>
                </a>
              )}
              {clinic.email && (
                <a href={`mailto:${clinic.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Mail className="w-4 h-4 shrink-0 text-primary" />
                  <span>{clinic.email}</span>
                </a>
              )}
              {clinic.website && (
                <a href={clinic.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Globe className="w-4 h-4 shrink-0 text-primary" />
                  <span className="truncate">{clinic.website}</span>
                </a>
              )}
              {clinic.operating_hours && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 shrink-0 text-primary" />
                  <span>{clinic.operating_hours}</span>
                </div>
              )}

              {clinic.description && (
                <p className="text-sm text-muted-foreground">{clinic.description}</p>
              )}

              {clinic.services && clinic.services.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Services</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {clinic.services.map((s) => (
                      <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 h-12 rounded-xl font-semibold"
                  onClick={() => setShowDirections(true)}
                  disabled={!hasCoords}
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Get Directions
                </Button>
                <Button onClick={handleBook} className="flex-1 h-12 rounded-xl font-semibold">
                  <CalendarPlus className="w-4 h-4 mr-2" />
                  Book Appointment
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
