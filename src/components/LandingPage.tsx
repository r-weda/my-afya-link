import { useNavigate } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import {
  ArrowRight,
  Shield,
  Clock,
  Users,
  Stethoscope,
  MapPin,
  FileText,
  Calendar,
  Heart,
  Sun,
  Moon,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-health.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const stats = [
  { value: "266+", label: "Health Facilities" },
  { value: "31+", label: "Verified Articles" },
  { value: "24/7", label: "Always Available" },
  { value: "47", label: "Counties Covered" },
];

const features = [
  {
    icon: Stethoscope,
    title: "AI Symptom Checker",
    description: "Describe how you feel and get instant guidance on possible conditions and next steps.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: MapPin,
    title: "Find Nearby Clinics",
    description: "Locate verified hospitals and health centres near you with directions and contact info.",
    color: "bg-warning/10 text-warning",
  },
  {
    icon: Calendar,
    title: "Book Appointments",
    description: "Schedule visits to your preferred clinic with reminders so you never miss a check-up.",
    color: "bg-health-green/10 text-health-green",
  },
  {
    icon: FileText,
    title: "Health Articles",
    description: "Read expert-verified articles on nutrition, disease prevention, maternal health, and more.",
    color: "bg-info/10 text-info",
  },
];

const trustPoints = [
  { icon: Shield, text: "All content verified by medical professionals" },
  { icon: Heart, text: "Built for Kenyan communities" },
  { icon: Users, text: "Trusted by thousands of users" },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      {/* ── Sticky Nav ── */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md">
              <span className="text-primary-foreground font-display font-bold text-base">A</span>
            </div>
            <span className="font-display font-bold text-lg text-foreground">AfyaConnect</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={toggleTheme}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            <button
              onClick={() => navigate("/auth")}
              className="text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors px-2 sm:px-3 py-2"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/auth")}
              className="text-xs sm:text-sm font-semibold bg-primary text-primary-foreground px-3 sm:px-4 py-2 rounded-xl hover:opacity-90 transition-opacity shadow-sm"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative min-h-[92vh] md:min-h-[88vh] flex items-center">
        {/* Background image with overlay */}
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Healthcare professionals helping patients"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-5 py-20 md:py-0 w-full">
          <div className="max-w-xl lg:max-w-2xl">
            <motion.div
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6"
            >
              <Heart className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary tracking-wide">Your Health, Simplified</span>
            </motion.div>

            <motion.h1
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-foreground leading-[1.08] mb-3"
            >
              AfyaConnect
            </motion.h1>
            <motion.p
              custom={1.5}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="font-display font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl text-muted-foreground leading-tight mb-5"
            >
              Healthcare at your{" "}
              <span className="text-gradient-primary">fingertips</span>
            </motion.p>

            <motion.p
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-lg"
            >
              Access verified health information, find nearby clinics, check symptoms with AI,
              and book appointments — all in one place, built for Kenya.
            </motion.p>

            <motion.div
              custom={3}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="flex flex-col sm:flex-row gap-3 mb-10"
            >
              <button
                onClick={() => navigate("/auth")}
                className="group flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm sm:text-base hover:opacity-90 transition-all shadow-lg"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => navigate("/auth")}
                className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-secondary text-secondary-foreground font-semibold text-sm sm:text-base hover:opacity-80 transition-opacity border border-border"
              >
                Sign In
              </button>
            </motion.div>

            <motion.div custom={4} variants={fadeUp} initial="hidden" animate="show" className="max-w-sm">
              <MedicalDisclaimer compact />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="relative z-10 -mt-12 md:-mt-16 px-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-0 bg-card rounded-2xl border border-border/50 shadow-lg overflow-hidden"
        >
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`flex flex-col items-center py-6 md:py-8 ${
                i < stats.length - 1 ? "md:border-r md:border-border/40" : ""
              }`}
            >
              <span className="font-display font-extrabold text-2xl md:text-3xl text-primary">{stat.value}</span>
              <span className="text-xs md:text-sm text-muted-foreground mt-1 font-medium">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 md:py-28 px-5">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h2 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-foreground mb-4">
              Everything you need,{" "}
              <span className="text-gradient-primary">one app</span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
              From symptom checking to booking appointments, AfyaConnect makes managing your health simple and accessible.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="group elevated-card rounded-2xl p-6 md:p-7 flex flex-col"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${f.color}`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-lg text-card-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">{f.description}</p>
                <button
                  onClick={() => navigate("/auth")}
                  className="mt-5 flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2 transition-all"
                >
                  Try it <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust Strip ── */}
      <section className="bg-card/60 border-y border-border/40 py-12 px-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10"
        >
          {trustPoints.map((tp) => (
            <div key={tp.text} className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <tp.icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">{tp.text}</span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 md:py-28 px-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 rounded-3xl border border-primary/15 p-10 md:p-16">
            <h2 className="font-display font-bold text-2xl md:text-4xl lg:text-5xl text-foreground mb-4">
              Ready to take control of your health?
            </h2>
            <p className="text-muted-foreground text-base md:text-lg mb-8 max-w-md mx-auto">
              Join thousands of Kenyans using AfyaConnect for smarter healthcare decisions — completely free.
            </p>
            <button
              onClick={() => navigate("/auth")}
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-base hover:opacity-90 transition-all shadow-lg"
            >
              Create Free Account
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/40 bg-card/30 py-8 px-5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-xs">A</span>
            </div>
            <span className="font-display font-semibold text-sm text-foreground">AfyaConnect</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} AfyaConnect. All rights reserved. Not a substitute for professional medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
