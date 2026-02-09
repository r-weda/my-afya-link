import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import QuickActionCard from "@/components/QuickActionCard";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import { FileText, Stethoscope, MapPin, Calendar, ArrowRight } from "lucide-react";
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
    <div className="min-h-screen bg-background pb-20">
      <AppHeader />

      <motion.main
        className="px-4 pt-4 max-w-lg mx-auto space-y-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Greeting */}
        <motion.div variants={item}>
          <h2 className="font-display font-bold text-2xl text-foreground">
            Habari, {firstName} 👋
          </h2>
          <p className="text-sm text-muted-foreground mt-1">How are you feeling today?</p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={item}>
          <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
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
        <motion.div variants={item}>
          <MedicalDisclaimer compact />
        </motion.div>
      </motion.main>

      <BottomNav />
    </div>
  );
}

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero */}
      <div className="relative h-[45vh] min-h-[300px] overflow-hidden">
        <img src={heroImage} alt="Healthcare" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background" />
      </div>

      <div className="flex-1 px-6 -mt-8 relative z-10 max-w-md mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-lg">
            <span className="text-primary-foreground font-display font-bold text-xl">A</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl text-foreground leading-tight mb-2">
            AfyaConnect
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed mb-8">
            Your trusted health companion. Access verified health information, find nearby clinics,
            and book appointments — all in one place.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => navigate("/auth")}
              className="w-full h-13 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity py-3.5"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate("/auth")}
              className="w-full h-12 rounded-2xl bg-secondary text-secondary-foreground font-semibold text-sm hover:opacity-80 transition-opacity"
            >
              I already have an account
            </button>
          </div>
        </motion.div>

        <div className="mt-8 pb-8">
          <MedicalDisclaimer compact />
        </div>
      </div>
    </div>
  );
}
