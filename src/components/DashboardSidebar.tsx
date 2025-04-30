import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutGrid, Users, FileText, Package, FileSpreadsheet, Settings, LogOut } from "lucide-react";
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useEffect, useState } from 'react';
import ThemeToggle from "./ThemeToggle";
import { toast } from "@/hooks/use-toast";

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
const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: session?.user?.email || 'Loading...',
    tier: 'free'
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!session?.user?.id) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('contact_name, tier')
          .eq('user_id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          return;
        }

        if (data) {
          setUserProfile({
            name: data.contact_name || 'User',
            email: session.user.email || '',
            tier: data.tier || 'free'
          });
        }
      } catch (error) {
        console.error('Error in fetchUserProfile:', error);
      }
    };

    fetchUserProfile();
  }, [session, supabase]);
// Business details form state
  const [businessDetails, setBusinessDetails] = useState({
    contact_name: "",
    business_name: "",
    email: "",
    address: "",
    city: "",
    postal_code: "",
    region_state: "",
    country: "",
    phone_number: "",
    vat_number: "",
    logo_url: null,
  });
  // Fetch business details from Supabase
  const fetchBusinessDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("business_details")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setBusinessDetails(data);
      }
    } catch (error) {
      console.error("Error fetching business details:", error);
      toast({
        title: "Error",
        description: "Failed to load business details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
    // Fetch user data on component mount
  useEffect(() => {
    if (session?.user?.id) {
      fetchBusinessDetails();
    }
  }, [session]);
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
          <div className="bg-orange-500 h-8 w-8 rounded-md flex items-center justify-center">
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
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                isActive
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
      
      {/* Upgrade button */}
      <div className="px-2 mt-auto">
        {userProfile.tier === "pro" ? (
          <div className="w-full flex flex-col items-center py-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 mb-1">
              <svg className="w-4 h-4 mr-1 text-orange-500 dark:text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Pro Plan Active
            </span>
            <button
              className="w-full py-1 bg-orange-500 dark:bg-orange-600 text-white rounded-md cursor-default mt-1 font-semibold"
              disabled
            >
              You are Pro
            </button>
          </div>
        ) : (
          <button
            className="w-full py-1 bg-gray-800 dark:bg-gray-700 text-white rounded-md hover:bg-orange-500 dark:hover:bg-orange-600 transition-colors font-semibold"
            onClick={goToSubscription}
          >
            Upgrade to Pro
          </button>
        )}
      </div>
            
      {/* User profile */}
      <div className="p-4 m-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <img
              src="/api/placeholder/40/40"
              alt="User avatar"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
  {businessDetails.contact_name || "Hello there!"}
</span>

            <span className="text-xs text-gray-500 dark:text-gray-400">{userProfile.email}</span>
          </div>
        </div>
        <button onClick={handleSignOut} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;