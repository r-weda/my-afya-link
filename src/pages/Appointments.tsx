import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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
import { Calendar, Clock, MapPin, Plus, Loader2, X, CheckCircle2, Copy, Phone } from "lucide-react";

interface Clinic {
  id: string;
  name: string;
  address: string;
  city: string;
  phone_number: string | null;
}

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  notes: string | null;
  clinics: { name: string; address: string; city: string; phone_number: string | null } | null;
}

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  confirmed: "bg-health-green/10 text-health-green border-health-green/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  completed: "bg-primary/10 text-primary border-primary/20",
};

interface BookingConfirmation {
  ref: string;
  clinicName: string;
  date: string;
  time: string;
  userSms: boolean;
  clinicSms: boolean;
  clinicPhone: string | null;
}

export default function Appointments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);

  // Form state
  const preselectedClinic = searchParams.get("clinic") || "";
  const [clinicId, setClinicId] = useState(preselectedClinic);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (preselectedClinic) {
      setClinicId(preselectedClinic);
      setShowForm(true);
    }
  }, [preselectedClinic]);

  const fetchAppointments = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("appointments")
      .select("id, appointment_date, appointment_time, status, notes, clinics(name, address, city, phone_number)")
      .eq("user_id", user.id)
      .order("appointment_date", { ascending: false });
    setAppointments((data as unknown as Appointment[]) || []);
    setLoading(false);
  };

  const fetchClinics = async () => {
    const { data } = await supabase
      .from("clinics")
      .select("id, name, address, city, phone_number")
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

    // 1. Insert appointment
    const { error } = await supabase.from("appointments").insert({
      user_id: user.id,
      clinic_id: clinicId,
      appointment_date: date,
      appointment_time: time,
      notes: notes || null,
    });

    if (error) {
      toast({ title: "Error", description: "Failed to book appointment. Please try again.", variant: "destructive" });
      setSubmitting(false);
      return;
    }

    // 2. Get user info for SMS
    const selectedClinic = clinics.find((c) => c.id === clinicId);
    let userPhone: string | null = null;
    let firstName = "";

    try {
      const { data: notifPrefs } = await supabase
        .from("notification_preferences")
        .select("booking_confirmations, phone_number")
        .eq("user_id", user.id)
        .maybeSingle();

      const { data: profile } = await supabase
        .from("profiles")
        .select("phone_number, first_name")
        .eq("user_id", user.id)
        .single();

      userPhone = notifPrefs?.phone_number || profile?.phone_number || null;
      firstName = profile?.first_name || user.user_metadata?.first_name || "";
    } catch {
      console.warn("Could not fetch user profile for SMS");
    }

    // 3. Send notifications (SMS to user + clinic)
    let bookingRef = "";
    let userSms = false;
    let clinicSms = false;

    try {
      if (selectedClinic) {
        const { data: result } = await supabase.functions.invoke("send-appointment-reminder", {
          body: {
            phoneNumber: userPhone,
            patientName: firstName,
            clinicName: selectedClinic.name,
            clinicPhone: selectedClinic.phone_number,
            appointmentDate: date,
            appointmentTime: time,
            notes: notes || undefined,
            type: "booking_confirmation",
          },
        });
        bookingRef = result?.ref || "";
        userSms = result?.userSms || false;
        clinicSms = result?.clinicSms || false;
      }
    } catch (smsError) {
      console.warn("Notification failed (non-blocking):", smsError);
    }

    // 4. Show confirmation
    setConfirmation({
      ref: bookingRef,
      clinicName: selectedClinic?.name || "Clinic",
      date,
      time,
      userSms,
      clinicSms,
      clinicPhone: selectedClinic?.phone_number || null,
    });

    setShowForm(false);
    setClinicId("");
    setDate("");
    setTime("");
    setNotes("");
    fetchAppointments();
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

  const copyRef = (ref: string) => {
    navigator.clipboard.writeText(ref);
    toast({ title: "Reference copied!" });
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8 flex flex-col">
      <AppHeader title="Appointments" />

      <main className="px-4 pt-4 max-w-lg md:max-w-4xl mx-auto space-y-4 w-full">
        {/* ── Booking Confirmation Modal ── */}
        <AnimatePresence>
          {confirmation && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="elevated-card rounded-2xl p-5 md:p-6 space-y-4 border-2 border-health-green/30"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-health-green/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-health-green" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base md:text-lg text-foreground">Booking Confirmed!</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">Your appointment has been booked</p>
                </div>
              </div>

              <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Reference</span>
                  <button
                    onClick={() => copyRef(confirmation.ref)}
                    className="flex items-center gap-1.5 text-sm font-bold text-primary"
                  >
                    {confirmation.ref || "—"}
                    {confirmation.ref && <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Clinic</span>
                  <span className="text-sm font-medium text-foreground">{confirmation.clinicName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Date</span>
                  <span className="text-sm text-foreground">
                    {new Date(confirmation.date).toLocaleDateString("en-KE", { weekday: "short", month: "short", day: "numeric" })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Time</span>
                  <span className="text-sm text-foreground">{confirmation.time}</span>
                </div>
              </div>

              {/* Status indicators */}
              <div className="space-y-1.5 text-xs text-muted-foreground">
                {confirmation.userSms && (
                  <p className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-health-green" /> SMS confirmation sent to you
                  </p>
                )}
                {confirmation.clinicSms && (
                  <p className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-health-green" /> Clinic notified via SMS
                  </p>
                )}
                {!confirmation.clinicSms && confirmation.clinicPhone && (
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-warning" /> We couldn't reach the clinic by SMS. Call them to confirm:
                    <a href={`tel:${confirmation.clinicPhone}`} className="text-primary font-medium">{confirmation.clinicPhone}</a>
                  </p>
                )}
                {!confirmation.clinicSms && !confirmation.clinicPhone && (
                  <p className="text-warning">No clinic phone on file. Please contact the clinic directly to confirm your visit.</p>
                )}
              </div>

              <Button
                variant="outline"
                className="w-full rounded-xl h-10"
                onClick={() => setConfirmation(null)}
              >
                Done
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="md:flex md:gap-6">
          {/* Booking column */}
          <div className="md:w-1/2 space-y-4">
            <Button
              onClick={() => { setShowForm(!showForm); setConfirmation(null); }}
              className="w-full md:w-auto h-12 lg:h-13 rounded-xl font-semibold lg:text-base"
              variant={showForm ? "outline" : "default"}
            >
              {showForm ? (
                <><X className="w-4 h-4 mr-2" /> Cancel</>
              ) : (
                <><Plus className="w-4 h-4 mr-2" /> Book Appointment</>
              )}
            </Button>

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
                    <Label className="text-xs lg:text-sm font-medium">Clinic</Label>
                    <Select value={clinicId} onValueChange={setClinicId}>
                      <SelectTrigger className="rounded-xl h-11 lg:h-12 lg:text-base">
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
                      <Label className="text-xs lg:text-sm font-medium">Date</Label>
                      <Input
                        type="date"
                        value={date}
                        min={today}
                        onChange={(e) => setDate(e.target.value)}
                        className="rounded-xl h-11 lg:h-12 lg:text-base"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs lg:text-sm font-medium">Time</Label>
                      <Input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="rounded-xl h-11 lg:h-12 lg:text-base"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs lg:text-sm font-medium">Notes (optional)</Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any specific concerns..."
                      className="rounded-xl resize-none min-h-[60px] lg:text-base"
                    />
                  </div>

                  <Button type="submit" disabled={submitting || !clinicId || !date || !time} className="w-full h-11 lg:h-12 rounded-xl font-semibold lg:text-base">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Confirm Booking
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Appointments list */}
          <div className="mt-4 md:mt-0 md:flex-1">
            <h3 className="font-display font-semibold text-sm lg:text-base text-muted-foreground uppercase tracking-wider mb-3">
              Your Appointments
            </h3>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-12 elevated-card rounded-2xl">
                <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm lg:text-base text-muted-foreground">No appointments yet</p>
                <p className="text-xs lg:text-sm text-muted-foreground mt-1">Book your first visit above</p>
              </div>
            ) : (
              <motion.div className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {appointments.map((apt) => (
                  <div key={apt.id} className="elevated-card rounded-2xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-display font-semibold text-sm lg:text-base text-card-foreground">
                          {apt.clinics?.name || "Unknown Clinic"}
                        </h4>
                        <div className="flex items-center gap-1 text-xs lg:text-sm text-muted-foreground mt-0.5">
                          <MapPin className="w-3 h-3" />
                          <span>{apt.clinics?.address}, {apt.clinics?.city}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className={`text-[10px] lg:text-xs ${statusColors[apt.status] || ""}`}>
                        {apt.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs lg:text-sm text-muted-foreground mt-3">
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
                    <div className="flex items-center gap-2 mt-3">
                      {apt.status === "pending" && apt.clinics?.phone_number && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs rounded-lg h-8"
                          asChild
                        >
                          <a href={`tel:${apt.clinics.phone_number}`}>
                            <Phone className="w-3 h-3 mr-1" /> Call Clinic
                          </a>
                        </Button>
                      )}
                      {apt.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive text-xs rounded-lg h-8"
                          onClick={() => handleCancel(apt.id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
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
