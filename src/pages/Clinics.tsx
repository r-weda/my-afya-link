import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import ClinicCard from "@/components/ClinicCard";
import { Search, Loader2, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
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
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchClinics = async () => {
      const { data } = await supabase
        .from("clinics")
        .select("id, name, address, city, phone_number, operating_hours, services, is_verified, latitude, longitude")
        .order("name");
      setClinics(data || []);
      setLoading(false);
    };
    fetchClinics();
  }, []);

  const filtered = clinics.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.address.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="Find Clinics" />

      <main className="px-4 pt-4 max-w-lg mx-auto space-y-4">
        {/* Map placeholder */}
        <div className="h-40 rounded-2xl bg-secondary/50 border border-border/50 flex items-center justify-center overflow-hidden">
          <div className="text-center">
            <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Google Maps integration coming soon</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search clinics, hospitals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-xl h-11 bg-secondary/50 border-0"
          />
        </div>

        {/* Clinic list */}
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
                name={clinic.name}
                address={clinic.address}
                city={clinic.city}
                phone={clinic.phone_number || undefined}
                operatingHours={clinic.operating_hours || undefined}
                services={clinic.services || undefined}
                isVerified={clinic.is_verified}
              />
            ))}
          </motion.div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
