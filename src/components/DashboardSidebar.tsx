import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutGrid, Users, FileText, Package, FileSpreadsheet, Settings, LogOut } from "lucide-react";
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useEffect, useState } from 'react';
import ThemeToggle from "./ThemeToggle";
import { Button } from "@/components/ui/button";


const menuItems = [
  { icon: LayoutGrid, label: "Dashboard", path: "/app" },
  { icon: Users, label: "Clients", path: "/app/clients" },
  { icon: FileText, label: "Invoices", path: "/app/invoices" },
  // { icon: Package, label: "Items & Services", path: "/app/items" },
  { icon: Settings, label: "Settings", path: "/app/settings" },
];

const DashboardSidebar = () => {
  const location = useLocation();
  const session = useSession();
  const supabase = useSupabaseClient();
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: session?.user?.email || 'Loading...',
    tier: 'free',
    logo_url: null as string | null,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user?.id) return;

      try {
        // Fetch user tier from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('tier')
          .eq('user_id', session.user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          console.error('Error fetching user profile:', profileError);
        }

        // Fetch user's business details to get the contact name
        const { data: businessData, error: businessError } = await supabase
          .from('business_details')
          .select('contact_name, logo_url')
          .eq('user_id', session.user.id)
          .single();

        if (businessError && businessError.code !== "PGRST116") {
          console.error('Error fetching business details:', businessError);
        }

        // Update the user profile state with both data sources
        setUserProfile({
          name: businessData?.contact_name || 'User',
          email: session.user.email || '',
          tier: profileData?.tier || 'free',
          logo_url: businessData?.logo_url || null,
        });
      } catch (error) {
        console.error('Error in fetchUserData:', error);
      }
    };

    fetchUserData();
  }, [session, supabase]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  const navigate = useNavigate();

  const goToSubscription = () => {
    navigate("/app/settings?tab=subscription");
  };

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 bg-background dark:bg-invoice-darkBg border-r border-border dark:border-gray-700 flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <Link to="/app" className="flex items-center gap-2">
          <div className="bg-primary h-8 w-8 rounded-md flex items-center justify-center">
            <div className="bg-gray-800 dark:bg-gray-200 h-4 w-5 rounded-r-full"></div>
          </div>
          <span className="font-bold text-lg text-invoice-lightText dark:text-invoice-darkText">Invoicely</span>
        </Link>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${isActive
                ? "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-medium"
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200"
                }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Upgrade Button */}
      <div className="px-2 mt-auto">
        {userProfile.tier === "pro" ? (
          <div className="w-full flex flex-col items-center py-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-1">
              <svg className="w-4 h-4 mr-1 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Pro Plan Active
            </span>
            <Button
              className="w-full py-1 bg-primary text-white rounded-md cursor-default mt-1 font-semibold"
              disabled
            >
              You are Pro
            </Button>
          </div>
        ) : (
          <Button
            className="w-full py-1 bg-primary text-white rounded-md transition-colors font-semibold"
            onClick={goToSubscription}
          >
            Upgrade to Pro
          </Button>
        )}
      </div>

      {/* User profile */}
      <div className="p-4 flex items-center justify-between border-t border-transparent pt-4">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center">
            {userProfile.logo_url ? (
              <img
                src={userProfile.logo_url}
                alt="User avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-gray-400 text-lg font-bold">{userProfile.name?.charAt(0) || "U"}</span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold text-gray-800 dark:text-gray-100">{userProfile.name || "Hello there!"}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">{userProfile.email}</span>
          </div>
        </div>
        <Button onClick={handleSignOut} variant="ghost" size="icon" className="ml-2 text-gray-400 hover:text-primary p-2 rounded-full">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;