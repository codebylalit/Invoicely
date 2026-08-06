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
import { Button } from "@/components/ui/button";
import Logo from "./Logo";

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
  const initials =
    userProfile.name?.charAt(0)?.toUpperCase() ||
    userProfile.email?.charAt(0)?.toUpperCase() ||
    "U";

  return (
    <div
      className="w-64 h-full flex flex-col overflow-hidden"
      style={{
        backgroundColor: "#FAFAF9",
        borderRight: "1px solid rgba(0,0,0,0.06)",
        fontFamily: "'Plus Jakarta Sans', 'Poppins', sans-serif",
      }}
    >
      {/* Logo Row */}
      <div className="p-5 flex items-center justify-between flex-shrink-0">
        <Logo onClick={onClose} href="/app" />
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="h-8 w-8 text-stone-400 hover:text-stone-700 hover:bg-stone-100"
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
                flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-sm font-semibold group relative
                ${
                  isActive
                    ? "bg-amber-50 text-amber-700"
                    : "text-stone-500 hover:bg-stone-100 hover:text-stone-800"
                }
              `}
            >
              {/* Left accent bar for active */}
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-amber-500"
                />
              )}
              <Icon
                className={`h-4 w-4 flex-shrink-0 transition-colors ${
                  isActive ? "text-amber-600" : "text-stone-400 group-hover:text-stone-600"
                }`}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="flex-shrink-0 px-3 pb-4 pt-3 space-y-3 border-t border-stone-200/60">
        {/* Upgrade / Pro Banner */}
        <div className="px-1">
          {isPro ? (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200/80">
              <Crown className="h-4 w-4 text-amber-600 flex-shrink-0" />
              <span className="text-xs font-bold text-amber-700">Pro Plan Active</span>
            </div>
          ) : (
            <button
              onClick={goToSubscription}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold text-sm text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
              style={{
                background: "linear-gradient(135deg, #F59E0B 0%, #F97316 100%)",
                boxShadow: "0 4px 12px rgba(245,158,11,0.35)",
              }}
            >
              <Sparkles className="h-4 w-4 flex-shrink-0" />
              <span>Upgrade to Pro</span>
            </button>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2.5 px-2 pt-1">
          {/* Avatar — rounded-2xl square */}
          <div
            className="h-9 w-9 flex-shrink-0 rounded-xl overflow-hidden flex items-center justify-center"
            style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}
          >
            {userProfile.logo_url ? (
              <img
                src={userProfile.logo_url}
                alt={`${userProfile.name} avatar`}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-sm font-black">{initials}</span>
            )}
          </div>
          {/* Name & Email */}
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-bold text-stone-800 truncate leading-tight">
              {userProfile.name || "Hello there!"}
            </span>
            <span className="text-xs text-stone-400 truncate leading-tight">
              {userProfile.email}
            </span>
          </div>
          {/* Logout */}
          <Button
            onClick={handleSignOut}
            variant="ghost"
            size="icon"
            aria-label="Sign out"
            className="h-8 w-8 flex-shrink-0 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar;
