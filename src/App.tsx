import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { lazy, Suspense } from "react";

// Eager-loaded (critical path)
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Lazy-loaded (code-split by route)
const Articles = lazy(() => import("./pages/Articles"));
const ArticleDetail = lazy(() => import("./pages/ArticleDetail"));
const SymptomChecker = lazy(() => import("./pages/SymptomChecker"));
const Clinics = lazy(() => import("./pages/Clinics"));
const Appointments = lazy(() => import("./pages/Appointments"));
const Admin = lazy(() => import("./pages/Admin"));
const Profile = lazy(() => import("./pages/Profile"));
const Feedback = lazy(() => import("./pages/Feedback"));
const Notifications = lazy(() => import("./pages/Notifications"));
const ClinicAction = lazy(() => import("./pages/ClinicAction"));
const SymptomHistory = lazy(() => import("./pages/SymptomHistory"));

const queryClient = new QueryClient();

function RouteLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
          <Suspense fallback={<RouteLoader />}>
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
          </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
