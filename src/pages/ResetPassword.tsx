import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Heart, ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsValidSession(true);
      }
    });

    // Also check if already in a recovery session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setIsValidSession(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Passwords don't match.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setIsLoading(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated!", description: "You can now sign in with your new password." });
      navigate("/auth");
    }
  };

  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display font-bold text-2xl text-foreground mb-2">Invalid or expired link</h1>
          <p className="text-sm text-muted-foreground mb-6">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Button onClick={() => navigate("/auth")} className="rounded-xl">Back to Sign In</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="px-4 pt-4 safe-top">
        <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => navigate("/auth")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 pb-8 max-w-md lg:max-w-lg mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 lg:w-10 lg:h-10 text-primary" />
          </div>
          <h1 className="font-display font-bold text-2xl lg:text-3xl text-foreground mb-1">Set new password</h1>
          <p className="text-sm lg:text-base text-muted-foreground">Enter your new password below</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs lg:text-sm font-medium">New Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="rounded-xl h-11 lg:h-12 lg:text-base pr-10"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-xs lg:text-sm font-medium">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="rounded-xl h-11 lg:h-12 lg:text-base"
              autoComplete="new-password"
            />
          </div>

          <Button type="submit" className="w-full h-12 rounded-xl font-semibold text-sm lg:text-base" disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Update Password
          </Button>
        </form>
      </div>
    </div>
  );
}
