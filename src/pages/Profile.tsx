import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { User, Phone, Mail, Calendar, Clock, MapPin, Loader2, Save } from "lucide-react";

interface Profile {
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
}

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  notes: string | null;
  clinics: { name: string; address: string; city: string } | null;
}

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  confirmed: "bg-health-green/10 text-health-green border-health-green/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  completed: "bg-primary/10 text-primary border-primary/20",
};

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profile, setProfile] = useState<Profile>({ first_name: "", last_name: "", phone_number: "" });
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth");
      return;
    }

    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("first_name, last_name, phone_number")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) setProfile(data);
      setLoadingProfile(false);
    };

    const fetchAppointments = async () => {
      const { data } = await supabase
        .from("appointments")
        .select("id, appointment_date, appointment_time, status, notes, clinics(name, address, city)")
        .eq("user_id", user.id)
        .order("appointment_date", { ascending: false });
      setAppointments((data as unknown as Appointment[]) || []);
      setLoadingAppointments(false);
    };

    fetchProfile();
    fetchAppointments();
  }, [user, authLoading, navigate]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone_number: profile.phone_number,
      })
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
    } else {
      toast({ title: "Profile updated", description: "Your changes have been saved." });
    }
    setSaving(false);
  };

  if (authLoading || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <AppHeader title="Profile" />

      <motion.main
        className="px-4 pt-4 max-w-lg md:max-w-4xl mx-auto md:flex md:gap-6 space-y-6 md:space-y-0"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Profile Info */}
        <section className="elevated-card rounded-2xl p-5 space-y-4 md:w-1/2 md:self-start md:sticky md:top-20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-card-foreground">
                {profile.first_name || "Your"} {profile.last_name || "Profile"}
              </h2>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Mail className="w-3 h-3" />
                <span>{user?.email}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">First Name</Label>
                <Input
                  value={profile.first_name || ""}
                  onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                  placeholder="First name"
                  className="rounded-xl h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Last Name</Label>
                <Input
                  value={profile.last_name || ""}
                  onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                  placeholder="Last name"
                  className="rounded-xl h-11"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={profile.phone_number || ""}
                  onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
                  placeholder="+254 7XX XXX XXX"
                  className="rounded-xl h-11 pl-10"
                />
              </div>
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full h-11 rounded-xl font-semibold">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </section>

        {/* Appointment History */}
        <section className="md:flex-1">
          <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
            Appointment History
          </h3>

          {loadingAppointments ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-12 elevated-card rounded-2xl">
              <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No appointments yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((apt) => (
                <div key={apt.id} className="elevated-card rounded-2xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-display font-semibold text-sm text-card-foreground">
                      {apt.clinics?.name || "Unknown Clinic"}
                    </h4>
                    <Badge variant="outline" className={`text-[10px] ${statusColors[apt.status] || ""}`}>
                      {apt.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>{apt.clinics?.address}, {apt.clinics?.city}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(apt.appointment_date).toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{apt.appointment_time}</span>
                    </div>
                  </div>
                  {apt.notes && <p className="text-xs text-muted-foreground mt-2 italic">{apt.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </section>
      </motion.main>

      <BottomNav />
    </div>
  );
}
