import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Bell, Settings, LogOut, Shield, Home, FileText, Stethoscope, MapPin, Calendar } from "lucide-react";
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
  const navigate = useNavigate();
  const location = useLocation();

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
                  className={`flex items-center gap-2 px-3 lg:px-4 py-2 rounded-xl text-sm lg:text-base font-medium transition-colors ${
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
          <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl">
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
            <DropdownMenuContent align="end" className="w-48 rounded-xl">
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
