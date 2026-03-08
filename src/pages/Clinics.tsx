import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import ClinicCard from "@/components/ClinicCard";
import ClinicMap from "@/components/ClinicMap";
import { Search, Loader2, LogIn } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

interface Clinic {
  id: string;
  name: string;
  address: string;
  city: string;
  phone_number: string | null;
  operating_hours: string | null;
  services: string[] | null;
  is_verified: boolean;
  latitude: number | null;
  longitude: number | null;
}

export default function Clinics() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user) return;
    const fetchClinics = async () => {
      const { data } = await supabase
        .from("clinics")
        .select("id, name, address, city, phone_number, operating_hours, services, is_verified, latitude, longitude")
        .order("name");
      setClinics(data || []);
      setLoading(false);
    };
    fetchClinics();
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-8 flex flex-col">
        <AppHeader title="Find Clinics" />
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <LogIn className="w-10 h-10 text-muted-foreground mb-4" />
          <h2 className="font-display font-bold text-lg lg:text-xl text-foreground mb-2">Sign in to view clinics</h2>
          <p className="text-sm lg:text-base text-muted-foreground mb-4 text-center">You need to be logged in to browse clinic information.</p>
          <Button onClick={() => navigate("/auth")} className="rounded-xl">Sign In</Button>
        </div>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  const filtered = clinics.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.address.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase())
  );

  const mapClinics = clinics.filter(
    (c) => c.latitude != null && c.longitude != null
  ) as { id: string; name: string; address: string; latitude: number; longitude: number }[];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8 flex flex-col overflow-x-hidden">
      <AppHeader title="Find Clinics" />

      <main className="px-4 pt-4 max-w-lg md:max-w-4xl lg:max-w-[1400px] mx-auto space-y-4 w-full overflow-hidden">
        {/* Desktop: side-by-side map + list. Mobile: stacked */}
        <div className="md:flex md:gap-6">
          {/* Map + search column */}
          <div className="md:w-1/2 lg:w-2/5 space-y-4 md:sticky md:top-20 md:self-start">
            {/* Map */}
            <div className="h-48 md:h-72 lg:h-96 rounded-2xl overflow-hidden border border-border/50">
              {loading ? (
                <div className="h-full flex items-center justify-center bg-secondary/50">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <ClinicMap clinics={mapClinics} />
              )}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search clinics, hospitals..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 rounded-xl h-11 lg:h-12 lg:text-base bg-secondary/50 border-0"
              />
            </div>
          </div>

          {/* Clinic list */}
          <div className="mt-4 md:mt-0 md:flex-1">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : filtered.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                <p className="text-muted-foreground text-sm">
                  {clinics.length === 0
                    ? "No clinics registered yet."
                    : "No clinics match your search."}
                </p>
              </motion.div>
            ) : (
              <motion.div className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {filtered.map((clinic) => (
                  <ClinicCard
                    key={clinic.id}
                    id={clinic.id}
                    name={clinic.name}
                    address={clinic.address}
                    city={clinic.city}
                    phone={clinic.phone_number || undefined}
                    operatingHours={clinic.operating_hours || undefined}
                    services={clinic.services || undefined}
                    isVerified={clinic.is_verified}
                    onBook={(clinicId) => navigate(`/appointments?clinic=${clinicId}`)}
                  />
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </main>

      <div className="flex-1" />
      <Footer />
      <BottomNav />
    </div>
  );
}
