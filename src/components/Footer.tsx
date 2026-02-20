import { useLocation, useNavigate } from "react-router-dom";
import { FileText, Stethoscope, MapPin, Calendar, Home } from "lucide-react";

const footerLinks = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/articles", icon: FileText, label: "Articles" },
  { path: "/symptom-checker", icon: Stethoscope, label: "Symptom Checker" },
  { path: "/clinics", icon: MapPin, label: "Find Clinics" },
  { path: "/appointments", icon: Calendar, label: "Appointments" },
];

export default function Footer() {
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname === "/auth" || location.pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="hidden md:block border-t border-border/50 bg-card/50 mt-12">
      <div className="max-w-7xl mx-auto px-6 py-7">
        <div className="grid grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">A</span>
              </div>
              <span className="font-display font-bold text-base text-foreground">AfyaConnect</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your trusted health companion. Access verified health information, find nearby clinics, and book appointments.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-xs text-foreground mb-3 uppercase tracking-wide">Quick Links</h4>
            <ul className="space-y-1.5">
              {footerLinks.map((link) => (
                <li key={link.path}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
                  >
                    <link.icon className="w-3 h-3" />
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-xs text-foreground mb-3 uppercase tracking-wide">Support</h4>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li>support@afyaconnect.co.ke</li>
              <li>+254 700 000 000</li>
              <li>Nairobi, Kenya</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 mt-6 pt-4 flex items-center justify-between text-[11px] text-muted-foreground/70">
          <span>© {new Date().getFullYear()} AfyaConnect. All rights reserved.</span>
          <span>Not a substitute for professional medical advice.</span>
        </div>
      </div>
    </footer>
  );
}
