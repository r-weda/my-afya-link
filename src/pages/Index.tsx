import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import QuickActionCard from "@/components/QuickActionCard";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import DashboardWidgets from "@/components/DashboardWidgets";
import Footer from "@/components/Footer";
import LandingPageComponent from "@/components/LandingPage";
import { FileText, Stethoscope, MapPin, Calendar, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

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
    return <LandingPageComponent />;
  }

  const firstName = user.user_metadata?.first_name || "there";

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8 flex flex-col">
      <AppHeader />

      <motion.main
        className="px-4 md:px-6 pt-6 max-w-lg md:max-w-4xl lg:max-w-[1400px] mx-auto space-y-8"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Greeting + Primary CTA */}
        <motion.div variants={item} className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="font-display font-bold text-2xl md:text-3xl lg:text-4xl text-foreground">
              Habari, {firstName} 👋
            </h2>
            <p className="text-sm md:text-base lg:text-lg text-muted-foreground mt-1">How are you feeling today?</p>
          </div>
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            <button
              onClick={() => navigate("/symptom-checker")}
              className="flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-xs md:text-sm lg:text-base hover:opacity-90 transition-opacity shadow-md"
            >
              <Stethoscope className="w-4 h-4" />
              Check Symptoms
            </button>
            <button
              onClick={() => navigate("/appointments")}
              className="flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2.5 rounded-2xl bg-secondary text-secondary-foreground font-semibold text-xs md:text-sm lg:text-base hover:opacity-80 transition-opacity"
            >
              <Calendar className="w-4 h-4" />
              Book Appointment
            </button>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={item}>
          <h3 className="font-display font-semibold text-xs md:text-sm lg:text-sm text-muted-foreground uppercase tracking-wider mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 lg:gap-5">
            <QuickActionCard
              icon={Stethoscope}
              label="Check Symptoms"
              description="Describe what you feel"
              color="bg-primary/10 text-primary"
              onClick={() => navigate("/symptom-checker")}
              prominent
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
            <QuickActionCard
              icon={MessageSquare}
              label="Feedback"
              description="Share your thoughts"
              color="bg-primary/10 text-primary"
              onClick={() => navigate("/feedback")}
            />
          </div>
        </motion.div>

        {/* Dashboard Widgets */}
        <motion.div variants={item}>
          <h3 className="font-display font-semibold text-xs md:text-sm lg:text-base text-muted-foreground uppercase tracking-wider mb-4">
            At a Glance
          </h3>
          <DashboardWidgets />
        </motion.div>

        {/* Medical Disclaimer */}
        <motion.div variants={item} className="md:max-w-xl">
          <MedicalDisclaimer compact />
        </motion.div>
      </motion.main>

      <div className="flex-1" />

      <Footer />
      <BottomNav />
    </div>
  );
}
