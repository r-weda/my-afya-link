import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "@/components/Footer";
import { Calendar, Clock, MapPin, Plus, Loader2, X } from "lucide-react";

interface Clinic {
  id: string;
  name: string;
  address: string;
  city: string;
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

export default function Appointments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [clinicId, setClinicId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");

  const fetchAppointments = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("appointments")
      .select("id, appointment_date, appointment_time, status, notes, clinics(name, address, city)")
      .eq("user_id", user.id)
      .order("appointment_date", { ascending: true });
    setAppointments((data as unknown as Appointment[]) || []);
    setLoading(false);
  };

  const fetchClinics = async () => {
    const { data } = await supabase
      .from("clinics")
      .select("id, name, address, city")
      .eq("is_verified", true)
      .order("name");
    setClinics(data || []);
  };

  useEffect(() => {
    fetchAppointments();
    fetchClinics();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !clinicId || !date || !time) return;

    setSubmitting(true);
    const { error } = await supabase.from("appointments").insert({
      user_id: user.id,
      clinic_id: clinicId,
      appointment_date: date,
      appointment_time: time,
      notes: notes || null,
    });

    if (error) {
      toast({ title: "Error", description: "Failed to book appointment. Please try again.", variant: "destructive" });
    } else {
      toast({ title: "Appointment booked!", description: "You will receive a confirmation soon." });

      // Send SMS reminder if user has a phone number
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("phone_number, first_name")
          .eq("user_id", user.id)
          .single();

        if (profile?.phone_number) {
          const selectedClinic = clinics.find((c) => c.id === clinicId);
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.access_token && selectedClinic) {
            await supabase.functions.invoke("send-appointment-reminder", {
              body: {
                phoneNumber: profile.phone_number,
                patientName: profile.first_name || "",
                clinicName: selectedClinic.name,
                appointmentDate: date,
                appointmentTime: time,
              },
            });
          }
        }
      } catch (smsError) {
        console.warn("SMS reminder failed (non-blocking):", smsError);
      }

      setShowForm(false);
      setClinicId("");
      setDate("");
      setTime("");
      setNotes("");
      fetchAppointments();
    }
    setSubmitting(false);
  };

  const handleCancel = async (id: string) => {
    const { error } = await supabase
      .from("appointments")
      .update({ status: "cancelled" })
      .eq("id", id);

    if (!error) {
      toast({ title: "Appointment cancelled" });
      fetchAppointments();
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <AppHeader title="Appointments" />

      <main className="px-4 pt-4 max-w-lg md:max-w-4xl mx-auto space-y-4">
        <div className="md:flex md:gap-6">
          {/* Booking column */}
          <div className="md:w-1/2 space-y-4">
            {/* Book button */}
            <Button
              onClick={() => setShowForm(!showForm)}
              className="w-full md:w-auto h-12 rounded-xl font-semibold"
              variant={showForm ? "outline" : "default"}
            >
              {showForm ? (
                <>
                  <X className="w-4 h-4 mr-2" /> Cancel
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" /> Book Appointment
                </>
              )}
            </Button>

            {/* Booking form */}
            <AnimatePresence>
              {showForm && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleSubmit}
                  className="elevated-card rounded-2xl p-4 space-y-4 overflow-hidden"
                >
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Clinic</Label>
                    <Select value={clinicId} onValueChange={setClinicId}>
                      <SelectTrigger className="rounded-xl h-11">
                        <SelectValue placeholder="Select a clinic" />
                      </SelectTrigger>
                      <SelectContent>
                        {clinics.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name} — {c.city}
                          </SelectItem>
                        ))}
                        {clinics.length === 0 && (
                          <div className="px-3 py-2 text-sm text-muted-foreground">No verified clinics available</div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Date</Label>
                      <Input
                        type="date"
                        value={date}
                        min={today}
                        onChange={(e) => setDate(e.target.value)}
                        className="rounded-xl h-11"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Time</Label>
                      <Input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="rounded-xl h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Notes (optional)</Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any specific concerns..."
                      className="rounded-xl resize-none min-h-[60px]"
                    />
                  </div>

                  <Button type="submit" disabled={submitting || !clinicId || !date || !time} className="w-full h-11 rounded-xl font-semibold">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Confirm Booking
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Appointments list */}
          <div className="mt-4 md:mt-0 md:flex-1">
            <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
              Your Appointments
            </h3>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-12 elevated-card rounded-2xl">
                <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No appointments yet</p>
                <p className="text-xs text-muted-foreground mt-1">Book your first visit above</p>
              </div>
            ) : (
              <motion.div className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {appointments.map((apt) => (
                  <div key={apt.id} className="elevated-card rounded-2xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-display font-semibold text-sm text-card-foreground">
                          {apt.clinics?.name || "Unknown Clinic"}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <MapPin className="w-3 h-3" />
                          <span>{apt.clinics?.address}, {apt.clinics?.city}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className={`text-[10px] ${statusColors[apt.status] || ""}`}>
                        {apt.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
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
                    {apt.status === "pending" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-3 text-destructive text-xs rounded-lg h-8"
                        onClick={() => handleCancel(apt.id)}
                      >
                        Cancel Appointment
                      </Button>
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
