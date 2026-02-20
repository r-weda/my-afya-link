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
      <div className="max-w-lg md:max-w-4xl lg:max-w-[1400px] mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-3 gap-10">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shrink-0">
                <span className="text-primary-foreground font-display font-bold text-sm">A</span>
              </div>
              <span className="font-display font-bold text-base text-foreground">AfyaConnect</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your trusted health companion. Access verified health information, find nearby clinics, and book appointments.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.path}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                  >
                    <link.icon className="w-3.5 h-3.5 text-primary/60" />
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-4">
              Support
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>support@afyaconnect.co.ke</li>
              <li>+254 700 000 000</li>
              <li>Nairobi, Kenya</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 mt-7 pt-5 flex items-center justify-between text-xs text-muted-foreground/70">
          <span>© {new Date().getFullYear()} AfyaConnect. All rights reserved.</span>
          <span>Not a substitute for professional medical advice.</span>
        </div>
      </div>
    </footer>
  );
}
