import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  Users,
  FileText,
  Settings,
  LogOut,
  X,
  Crown,
  Sparkles,
} from "lucide-react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { Button } from "@/components/ui/button";

const menuItems = [
  { icon: LayoutGrid, label: "Dashboard", path: "/app" },
  { icon: Users, label: "Clients", path: "/app/clients" },
  { icon: FileText, label: "Invoices", path: "/app/invoices" },
  { icon: Settings, label: "Settings", path: "/app/settings" },
];

interface DashboardSidebarProps {
  onClose?: () => void;
}

const DashboardSidebar = ({ onClose }: DashboardSidebarProps = {}) => {
  const location = useLocation();
  const session = useSession();
  const supabase = useSupabaseClient();
  const [userProfile, setUserProfile] = useState({
    name: "",
    email: session?.user?.email || "",
    tier: "free",
    logo_url: null as string | null,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user?.id) return;

      try {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("tier")
          .eq("user_id", session.user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          console.error("Error fetching user profile:", profileError);
        }

        const { data: businessData, error: businessError } = await supabase
          .from("business_details")
          .select("contact_name, logo_url")
          .eq("user_id", session.user.id)
          .single();

        if (businessError && businessError.code !== "PGRST116") {
          console.error("Error fetching business details:", businessError);
        }

        setUserProfile({
          name: businessData?.contact_name || "",
          email: session.user.email || "",
          tier: profileData?.tier || "free",
          logo_url: businessData?.logo_url || null,
        });
      } catch (error) {
        console.error("Error in fetchUserData:", error);
      }
    };

    fetchUserData();
  }, [session, supabase]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.refreshSession();
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Error signing out:", error);
        if (
          error.message.includes("session_not_found") ||
          error.message.includes("does not exist")
        ) {
          localStorage.removeItem("supabase.auth.token");
          window.location.href = "/";
        }
      } else {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Error in sign out process:", error);
      localStorage.removeItem("supabase.auth.token");
      window.location.href = "/";
    }
  };

  const navigate = useNavigate();

  const goToSubscription = () => {
    navigate("/app/settings?tab=subscription");
    onClose?.();
  };

  const isPro = userProfile.tier === "pro";
  const initials = userProfile.name?.charAt(0)?.toUpperCase() || userProfile.email?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="w-64 h-full bg-background dark:bg-[hsl(var(--card))] flex flex-col overflow-hidden">
      {/* Logo Row */}
      <div className="p-5 flex items-center justify-between flex-shrink-0">
        <Link
          to="/app"
          className="flex items-center gap-2.5"
          onClick={onClose}
          aria-label="Go to Dashboard"
        >
          <div className="bg-primary h-8 w-8 rounded-lg flex items-center justify-center shadow-sm">
            <div className="bg-gray-800 h-4 w-5 rounded-r-full" />
          </div>
          <span className="font-bold text-lg text-foreground tracking-tight">
            invoicelly
          </span>
        </Link>
        {/* Close button — only visible inside mobile drawer */}
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto" aria-label="Main navigation">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === "/app"
              ? location.pathname === "/app"
              : location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              aria-current={isActive ? "page" : undefined}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-sm font-medium group
                ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }
              `}
            >
              <Icon
                className={`h-4 w-4 flex-shrink-0 transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground"
                }`}
              />
              <span>{item.label}</span>
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="flex-shrink-0 px-3 pb-4 pt-2 space-y-3 border-t border-border">
        {/* Upgrade / Pro Banner */}
        <div className="px-1">
          {isPro ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary">
                <Crown className="h-4 w-4" />
                <span className="text-xs font-semibold">Pro Plan Active</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs font-medium"
                onClick={goToSubscription}
              >
                Manage Subscription
              </Button>
            </div>
          ) : (
            <button
              onClick={goToSubscription}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-gradient-to-r from-primary to-amber-400 text-primary-foreground font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
            >
              <Sparkles className="h-4 w-4 flex-shrink-0" />
              <span>Upgrade to Pro</span>
            </button>
          )}
        </div>

        {/* Theme Toggle Row */}
        <div className="flex items-center justify-between px-2">
          <span className="text-xs text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2.5 px-2 pt-1">
          {/* Avatar */}
          <div className="h-9 w-9 flex-shrink-0 rounded-full bg-muted border border-border overflow-hidden flex items-center justify-center">
            {userProfile.logo_url ? (
              <img
                src={userProfile.logo_url}
                alt={`${userProfile.name} avatar`}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-sm font-bold text-muted-foreground">
                {initials}
              </span>
            )}
          </div>
          {/* Name & Email */}
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-semibold text-foreground truncate leading-tight">
              {userProfile.name || "Hello there!"}
            </span>
            <span className="text-xs text-muted-foreground truncate leading-tight">
              {userProfile.email}
            </span>
          </div>
          {/* Logout */}
          <Button
            onClick={handleSignOut}
            variant="ghost"
            size="icon"
            aria-label="Sign out"
            className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar;
