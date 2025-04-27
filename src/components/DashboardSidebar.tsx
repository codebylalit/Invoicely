import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutGrid, Users, FileText, Package, FileSpreadsheet, Settings, LogOut } from "lucide-react";
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useEffect, useState } from 'react';
import ThemeToggle from "./ThemeToggle";

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
    name: 'Lalit Gaming',
    email: session?.user?.email || 'Loading...'
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!session?.user?.id) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          return;
        }

        if (data) {
          setUserProfile({
            name: data.name || 'User',
            email: session.user.email || ''
          });
        }
      } catch (error) {
        console.error('Error in fetchUserProfile:', error);
      }
    };

    fetchUserProfile();
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
    <aside className="w-64 h-screen bg-background border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <Link to="/app" className="flex items-center gap-2">
          <div className="bg-orange-500 h-8 w-8 rounded-md flex items-center justify-center">
            <div className="bg-gray-800 h-4 w-5 rounded-r-full"></div>
          </div>
          <span className="font-bold text-lg text-invoice-lightText dark:text-invoice-darkText ">Invoicely</span>
        </Link>
      </div>
      
      {/* Main navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors  ${
                isActive
                  ? "bg-gray-100 text-gray-800 font-medium"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
            
          );
        })}
      </nav>
      
      {/* Upgrade button */}
      <div className="px-2" onClick={goToSubscription}>
        <button className="w-full py-1 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors">
          Upgrade to Pro
        </button>
      </div>
      
      
      {/* User profile */}
      <div className="p-4 m-4 flex items-center justify-between border-t border-gray-100 pt-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden">
            <img
              src="/api/placeholder/40/40"
              alt="User avatar"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-700">{userProfile.name}</span>
            <span className="text-xs text-gray-500">{userProfile.email}</span>
          </div>
        </div>
        <button onClick={handleSignOut} className="text-gray-500 hover:text-gray-700">
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;