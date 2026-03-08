import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Settings, LogOut, Shield, Home, FileText, Stethoscope, MapPin, Calendar, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const desktopNavItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/articles", icon: FileText, label: "Articles" },
  { path: "/symptom-checker", icon: Stethoscope, label: "Symptoms" },
  { path: "/clinics", icon: MapPin, label: "Clinics" },
  { path: "/appointments", icon: Calendar, label: "Bookings" },
];

interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
}

export default function AppHeader({ title }: AppHeaderProps) {
  const { user, isAdmin, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [hasUnread, setHasUnread] = useState(false);

  // Track the last time the user visited the notifications page
  useEffect(() => {
    if (location.pathname === "/notifications") {
      localStorage.setItem("lastNotifVisit", new Date().toISOString());
      setHasUnread(false);
    }
  }, [location.pathname]);

  // Check for new notifications since last visit
  useEffect(() => {
    if (!user) return;

    const checkUnread = async () => {
      const lastVisit = localStorage.getItem("lastNotifVisit") || "1970-01-01T00:00:00Z";
      const { count } = await supabase
        .from("notification_history")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gt("created_at", lastVisit);
      setHasUnread((count ?? 0) > 0);
    };

    checkUnread();

    // Subscribe to realtime inserts
    const channel = supabase
      .channel("notif-badge")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notification_history" }, (payload: { new: { user_id: string } }) => {
        if (payload.new.user_id === user.id) {
          setHasUnread(true);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const initials = user?.user_metadata?.first_name
    ? `${user.user_metadata.first_name[0]}${user.user_metadata.last_name?.[0] || ""}`
    : user?.email?.[0]?.toUpperCase() || "U";

  const showDesktopNav =
    location.pathname !== "/auth" && !location.pathname.startsWith("/admin");

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 safe-top">
      <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-3.5 max-w-lg md:max-w-4xl lg:max-w-[1400px] mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-display font-bold text-sm">A</span>
          </div>
          <h1 className="font-display font-bold text-lg md:text-xl lg:text-2xl text-foreground">
            {title || "AfyaConnect"}
          </h1>
        </div>

        {/* Desktop navigation links */}
        {showDesktopNav && (
          <nav className="hidden md:flex items-center gap-1">
            {desktopNavItems.map((navItem) => {
              const isActive = location.pathname === navItem.path;
              return (
                <button
                  key={navItem.path}
                  onClick={() => navigate(navItem.path)}
                  className={`flex items-center gap-2 px-3 lg:px-4 py-2 rounded-xl text-sm lg:text-[0.95rem] font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <navItem.icon className="w-4 h-4" />
                  {navItem.label}
                </button>
              );
            })}
          </nav>
        )}

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "light" ? <Moon className="w-4 h-4 text-muted-foreground" /> : <Sun className="w-4 h-4 text-muted-foreground" />}
          </Button>
          <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl" onClick={() => navigate("/notifications")} aria-label="Notifications">
            <Bell className="w-4 h-4 text-muted-foreground" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full p-0">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 lg:w-52 rounded-xl">
              <DropdownMenuItem className="rounded-lg" onClick={() => navigate("/profile")}>
                <Settings className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem className="rounded-lg" onClick={() => navigate("/admin")}>
                  <Shield className="w-4 h-4 mr-2" />
                  Admin Dashboard
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="rounded-lg text-destructive" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
