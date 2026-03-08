import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  Bell,
  Calendar,
  Heart,
  CheckCircle2,
  Phone,
  Save,
  MessageSquare,
  Clock,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";

interface Preferences {
  appointment_reminders: boolean;
  health_tips: boolean;
  booking_confirmations: boolean;
  phone_number: string;
}

interface HistoryItem {
  id: string;
  type: string;
  title: string;
  message: string;
  status: string;
  created_at: string;
}

const typeConfig: Record<string, { icon: typeof Bell; color: string; label: string }> = {
  appointment_reminder: { icon: Calendar, color: "bg-primary/10 text-primary", label: "Reminder" },
  health_tip: { icon: Heart, color: "bg-health-green/10 text-health-green", label: "Health Tip" },
  booking_confirmation: { icon: CheckCircle2, color: "bg-info/10 text-info", label: "Booking" },
};

export default function Notifications() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [prefs, setPrefs] = useState<Preferences>({
    appointment_reminders: true,
    health_tips: false,
    booking_confirmations: true,
    phone_number: "",
  });
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loadingPrefs, setLoadingPrefs] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    fetchPreferences();
    fetchHistory();
  }, [user]);

  async function fetchPreferences() {
    setLoadingPrefs(true);
    const { data, error } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", user!.id)
      .maybeSingle();

    if (!error && data) {
      setPrefs({
        appointment_reminders: data.appointment_reminders,
        health_tips: data.health_tips,
        booking_confirmations: data.booking_confirmations,
        phone_number: data.phone_number || "",
      });
    }
    setLoadingPrefs(false);
  }

  async function fetchHistory() {
    setLoadingHistory(true);
    const { data, error } = await supabase
      .from("notification_history")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      setHistory(data);
    }
    setLoadingHistory(false);
  }

  async function savePreferences() {
    if (!user) return;
    setSaving(true);

    const payload = {
      user_id: user.id,
      appointment_reminders: prefs.appointment_reminders,
      health_tips: prefs.health_tips,
      booking_confirmations: prefs.booking_confirmations,
      phone_number: prefs.phone_number || null,
    };

    const { error } = await supabase
      .from("notification_preferences")
      .upsert(payload, { onConflict: "user_id" });

    if (error) {
      toast({ title: "Error", description: "Failed to save preferences.", variant: "destructive" });
    } else {
      toast({ title: "Saved", description: "Your notification preferences have been updated." });
    }
    setSaving(false);
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8 flex flex-col">
      <AppHeader title="Notifications" />

      <motion.main
        className="px-4 md:px-6 pt-6 max-w-lg md:max-w-4xl lg:max-w-[1400px] mx-auto space-y-8 w-full"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Preferences Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="font-display font-bold text-lg md:text-xl lg:text-2xl text-foreground">
              SMS Preferences
            </h2>
          </div>

          {loadingPrefs ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {/* Phone number */}
              <div className="elevated-card rounded-2xl p-4 md:p-5 lg:p-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="phone" className="font-display font-semibold text-sm md:text-base text-foreground">
                      Phone Number
                    </Label>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Enter your phone number to receive SMS notifications (e.g. +254712345678)
                    </p>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+254712345678"
                      value={prefs.phone_number}
                      onChange={(e) => setPrefs((p) => ({ ...p, phone_number: e.target.value }))}
                      className="max-w-xs lg:h-12"
                    />
                  </div>
                </div>
              </div>

              {/* Toggle cards */}
              <ToggleCard
                icon={Calendar}
                color="bg-primary/10 text-primary"
                title="Appointment Reminders"
                description="Get an SMS reminder before your upcoming appointments"
                checked={prefs.appointment_reminders}
                onCheckedChange={(v) => setPrefs((p) => ({ ...p, appointment_reminders: v }))}
              />
              <ToggleCard
                icon={Heart}
                color="bg-health-green/10 text-health-green"
                title="Health Tips"
                description="Receive periodic health tips and article updates"
                checked={prefs.health_tips}
                onCheckedChange={(v) => setPrefs((p) => ({ ...p, health_tips: v }))}
              />
              <ToggleCard
                icon={CheckCircle2}
                color="bg-info/10 text-info"
                title="Booking Confirmations"
                description="Get an SMS when an appointment is booked or updated"
                checked={prefs.booking_confirmations}
                onCheckedChange={(v) => setPrefs((p) => ({ ...p, booking_confirmations: v }))}
              />

              <Button
                onClick={savePreferences}
                disabled={saving}
                className="rounded-2xl h-11 lg:h-12 px-6 lg:px-8 font-semibold"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Preferences"}
              </Button>
            </div>
          )}
        </section>

        {/* History Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-display font-bold text-lg md:text-xl lg:text-2xl text-foreground">
              Notification History
            </h2>
          </div>

          {loadingHistory ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 rounded-2xl" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="elevated-card rounded-2xl p-8 md:p-10 text-center">
              <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm md:text-base text-muted-foreground">
                No notifications yet. You'll see your SMS history here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => {
                const config = typeConfig[item.type] || {
                  icon: Bell,
                  color: "bg-muted text-muted-foreground",
                  label: item.type,
                };
                const Icon = config.icon;
                return (
                  <div key={item.id} className="elevated-card rounded-2xl p-4 md:p-5 lg:p-6">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 ${config.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-display font-semibold text-sm md:text-base text-foreground truncate">
                            {item.title}
                          </h3>
                          <Badge
                            variant={item.status === "sent" ? "default" : "destructive"}
                            className="text-[10px] md:text-xs shrink-0"
                          >
                            {item.status === "sent" ? "Sent" : "Failed"}
                          </Badge>
                        </div>
                        <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                          {item.message}
                        </p>
                        <p className="text-[10px] md:text-xs text-muted-foreground mt-1.5">
                          {format(new Date(item.created_at), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </motion.main>

      <div className="flex-1" />
      <Footer />
      <BottomNav />
    </div>
  );
}

function ToggleCard({
  icon: Icon,
  color,
  title,
  description,
  checked,
  onCheckedChange,
}: {
  icon: typeof Bell;
  color: string;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="elevated-card rounded-2xl p-4 md:p-5 lg:p-6">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-sm md:text-base text-foreground">{title}</h3>
          <p className="text-xs md:text-sm text-muted-foreground">{description}</p>
        </div>
        <Switch checked={checked} onCheckedChange={onCheckedChange} />
      </div>
    </div>
  );
}
