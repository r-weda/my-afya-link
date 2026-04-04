import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Articles from "./pages/Articles";
import ArticleDetail from "./pages/ArticleDetail";
import SymptomChecker from "./pages/SymptomChecker";
import Clinics from "./pages/Clinics";
import Appointments from "./pages/Appointments";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import Feedback from "./pages/Feedback";
import Notifications from "./pages/Notifications";
import ClinicAction from "./pages/ClinicAction";
import SymptomHistory from "./pages/SymptomHistory";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/articles/:slug" element={<ArticleDetail />} />
            <Route path="/symptom-checker" element={<SymptomChecker />} />
            <Route path="/clinics" element={<Clinics />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/clinic-action" element={<ClinicAction />} />
            <Route path="/symptom-history" element={<SymptomHistory />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
