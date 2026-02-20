import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import QuickActionCard from "@/components/QuickActionCard";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import Footer from "@/components/Footer";
import { FileText, Stethoscope, MapPin, Calendar, ArrowRight, Shield, Clock, Users } from "lucide-react";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-health.jpg";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  const firstName = user.user_metadata?.first_name || "there";

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <AppHeader />

      <motion.main
        className="px-4 pt-6 max-w-lg md:max-w-4xl lg:max-w-6xl mx-auto space-y-8"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Greeting */}
        <motion.div variants={item}>
          <h2 className="font-display font-bold text-2xl md:text-3xl lg:text-4xl text-foreground">
            Habari, {firstName} 👋
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-muted-foreground mt-1">How are you feeling today?</p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={item}>
          <h3 className="font-display font-semibold text-xs md:text-sm text-muted-foreground uppercase tracking-wider mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-5">
            <QuickActionCard
              icon={Stethoscope}
              label="Check Symptoms"
              description="Describe what you feel"
              color="bg-primary/10 text-primary"
              onClick={() => navigate("/symptom-checker")}
            />
            <QuickActionCard
              icon={Calendar}
              label="Book Visit"
              description="Find & book a clinic"
              color="bg-health-green/10 text-health-green"
              onClick={() => navigate("/appointments")}
            />
            <QuickActionCard
              icon={FileText}
              label="Health Tips"
              description="Read verified articles"
              color="bg-info/10 text-info"
              onClick={() => navigate("/articles")}
            />
            <QuickActionCard
              icon={MapPin}
              label="Find Clinic"
              description="Nearby hospitals"
              color="bg-warning/10 text-warning"
              onClick={() => navigate("/clinics")}
            />
          </div>
        </motion.div>

        {/* Medical Disclaimer */}
        <motion.div variants={item} className="md:max-w-2xl">
          <MedicalDisclaimer compact />
        </motion.div>
      </motion.main>

      <Footer />
      <BottomNav />
    </div>
  );
}

const features = [
  {
    icon: Shield,
    title: "Verified Information",
    description: "All health content is reviewed and verified by medical professionals.",
  },
  {
    icon: Clock,
    title: "24/7 Access",
    description: "Check symptoms and find clinics anytime, anywhere.",
  },
  {
    icon: Users,
    title: "Community Trusted",
    description: "Serving thousands of users across Kenya with reliable healthcare guidance.",
  },
];

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Hero Section ── */}
      <section className="flex flex-col md:flex-row flex-1 min-h-[100svh] md:min-h-[90vh]">
        {/* Image column */}
        <div className="relative h-[42vh] md:h-auto md:w-[52%] lg:w-[58%] overflow-hidden shrink-0">
          <img
            src={heroImage}
            alt="Healthcare professionals"
            className="w-full h-full object-cover object-center"
          />
          {/* overlay fades into bg on the right edge (desktop) and bottom edge (mobile) */}
          <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-transparent via-transparent to-background" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent md:hidden" />
        </div>

        {/* Content column */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 md:py-0 md:px-12 lg:px-16 -mt-10 md:mt-0 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="w-full max-w-sm md:max-w-md lg:max-w-lg"
          >
            {/* Logo mark */}
            <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-primary flex items-center justify-center mb-6 shadow-lg">
              <span className="text-primary-foreground font-display font-bold text-xl lg:text-2xl">A</span>
            </div>

            <h1 className="font-display font-extrabold text-4xl md:text-5xl lg:text-6xl text-foreground leading-[1.1] mb-4">
              AfyaConnect
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground leading-relaxed mb-10 max-w-md">
              Your trusted health companion. Access verified health information, find nearby clinics,
              and book appointments — all in one place.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <button
                onClick={() => navigate("/auth")}
                className="flex-1 sm:flex-none sm:min-w-[160px] h-13 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity py-3.5 px-6 shadow-md"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate("/auth")}
                className="flex-1 sm:flex-none sm:min-w-[160px] h-12 rounded-2xl bg-secondary text-secondary-foreground font-semibold text-sm hover:opacity-80 transition-opacity px-6"
              >
                Sign In
              </button>
            </div>

            <MedicalDisclaimer compact />
          </motion.div>
        </div>
      </section>

      {/* ── Features Strip ── */}
      <section className="bg-card/60 border-y border-border/50 py-14 px-6 md:px-12 lg:px-16">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-10"
          >
            {features.map((f) => (
              <div key={f.title} className="flex flex-col items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-base text-foreground mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA Footer ── */}
      <section className="py-16 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="max-w-xl mx-auto"
        >
          <h2 className="font-display font-bold text-2xl md:text-3xl lg:text-4xl text-foreground mb-3">
            Ready to take control of your health?
          </h2>
          <p className="text-muted-foreground text-base md:text-lg mb-8">
            Join thousands of Kenyans using AfyaConnect every day.
          </p>
          <button
            onClick={() => navigate("/auth")}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity shadow-md"
          >
            Create Free Account
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </section>
    </div>
  );
}
