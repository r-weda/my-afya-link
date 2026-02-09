import { useLocation, useNavigate } from "react-router-dom";
import { Home, FileText, Stethoscope, MapPin, Calendar } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/articles", icon: FileText, label: "Articles" },
  { path: "/symptom-checker", icon: Stethoscope, label: "Symptoms" },
  { path: "/clinics", icon: MapPin, label: "Clinics" },
  { path: "/appointments", icon: Calendar, label: "Bookings" },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  // Hide on auth and admin pages
  if (location.pathname === "/auth" || location.pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border/50 bottom-nav-shadow safe-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto px-2 pt-2 pb-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="relative flex flex-col items-center gap-0.5 py-1 px-3 min-w-0"
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-1 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <item.icon
                className={`w-5 h-5 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <span
                className={`text-[10px] font-medium transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
