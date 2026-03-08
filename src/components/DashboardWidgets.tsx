import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Calendar, Stethoscope, Bell, ChevronRight, AlertTriangle, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format, isAfter, parseISO } from "date-fns";

interface DashboardAppointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  clinics: { name: string; city: string } | null;
}

interface DashboardCheck {
  id: string;
  symptoms: string[];
  is_urgent: boolean;
  created_at: string;
}

export default function DashboardWidgets() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<DashboardAppointment[]>([]);
  const [checks, setChecks] = useState<DashboardCheck[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchAll = async () => {
      const today = new Date().toISOString().split("T")[0];

      const [aptsRes, checksRes, notifsRes] = await Promise.all([
        supabase
          .from("appointments")
          .select("id, appointment_date, appointment_time, status, clinics(name, city)")
          .eq("user_id", user.id)
          .gte("appointment_date", today)
          .in("status", ["pending", "confirmed"])
          .order("appointment_date", { ascending: true })
          .limit(3),
        supabase
          .from("symptom_checks")
          .select("id, symptoms, is_urgent, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(3),
        supabase
          .from("notification_history")
          .select("id", { count: "exact" })
          .eq("user_id", user.id)
          .eq("status", "sent"),
      ]);

      setAppointments((aptsRes.data as unknown as DashboardAppointment[]) || []);
      setChecks((checksRes.data as unknown as DashboardCheck[]) || []);
      setUnreadCount(notifsRes.count || 0);
      setLoading(false);
    };

    fetchAll();
  }, [user]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-border/40 bg-card p-4 space-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Upcoming Appointments */}
      <div className="elevated-card rounded-2xl p-4 md:p-3.5 lg:p-4 space-y-3 md:space-y-2">
        <button
          onClick={() => navigate("/appointments")}
          className="flex items-center justify-between w-full"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 md:w-8 md:h-8 rounded-lg bg-health-green/10 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-health-green" />
            </div>
            <h4 className="font-display font-semibold text-sm md:text-sm lg:text-sm text-card-foreground">Upcoming Visits</h4>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>

        {appointments.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">No upcoming appointments</p>
        ) : (
          <div className="space-y-2">
            {appointments.map((apt) => (
              <div key={apt.id} className="bg-muted/50 rounded-xl p-2.5 space-y-1">
                <p className="text-xs font-medium text-card-foreground truncate">
                  {apt.clinics?.name || "Clinic"}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>{format(parseISO(apt.appointment_date), "MMM d")}</span>
                  <Clock className="w-3 h-3" />
                  <span>{apt.appointment_time}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Symptom Checks */}
      <div className="elevated-card rounded-2xl p-4 md:p-3.5 lg:p-4 space-y-3 md:space-y-2">
        <button
          onClick={() => navigate("/symptom-history")}
          className="flex items-center justify-between w-full"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-primary" />
            </div>
            <h4 className="font-display font-semibold text-sm md:text-sm lg:text-sm text-card-foreground">Recent Checks</h4>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>

        {checks.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">No symptom checks yet</p>
        ) : (
          <div className="space-y-2">
            {checks.map((check) => (
              <div key={check.id} className="bg-muted/50 rounded-xl p-2.5 space-y-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-[11px] text-muted-foreground">
                    {format(new Date(check.created_at), "MMM d")}
                  </p>
                  {check.is_urgent && (
                    <AlertTriangle className="w-3 h-3 text-destructive" />
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {check.symptoms.slice(0, 3).map((s) => (
                    <Badge key={s} variant="secondary" className="text-[10px] rounded-md py-0 px-1.5">
                      {s}
                    </Badge>
                  ))}
                  {check.symptoms.length > 3 && (
                    <Badge variant="secondary" className="text-[10px] rounded-md py-0 px-1.5">
                      +{check.symptoms.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notifications */}
      <div className="elevated-card rounded-2xl p-4 md:p-3.5 lg:p-4 space-y-3 md:space-y-2">
        <button
          onClick={() => navigate("/notifications")}
          className="flex items-center justify-between w-full"
        >
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
              <Bell className="w-4 h-4 text-warning" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            <h4 className="font-display font-semibold text-sm md:text-sm lg:text-sm text-card-foreground">Notifications</h4>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>

        <div className="bg-muted/50 rounded-xl p-3 text-center">
          {unreadCount > 0 ? (
            <p className="text-xs text-card-foreground">
              You have <span className="font-semibold text-primary">{unreadCount}</span> notification{unreadCount !== 1 ? "s" : ""}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">All caught up! 🎉</p>
          )}
        </div>
      </div>
    </div>
  );
}
