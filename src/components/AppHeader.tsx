import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Bell, Settings, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
}

export default function AppHeader({ title }: AppHeaderProps) {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const initials = user?.user_metadata?.first_name
    ? `${user.user_metadata.first_name[0]}${user.user_metadata.last_name?.[0] || ""}`
    : user?.email?.[0]?.toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 safe-top">
      <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-display font-bold text-sm">A</span>
          </div>
          <h1 className="font-display font-bold text-lg text-foreground">
            {title || "AfyaConnect"}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl">
            <Bell className="w-4 h-4 text-muted-foreground" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full p-0">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl">
              <DropdownMenuItem className="rounded-lg" onClick={() => navigate("/profile")}>
                <Settings className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem className="rounded-lg" onClick={() => navigate("/admin")}>
                  <Shield className="w-4 h-4 mr-2" />
                  Admin Dashboard
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="rounded-lg text-destructive" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
