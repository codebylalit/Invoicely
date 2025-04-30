import ThemeToggle from "./ThemeToggle";
import { FileText, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/Button";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from '@supabase/auth-helpers-react';
import { useToast } from "./ui/use-toast";

const Header = () => {
  const location = useLocation();
  const session = useSession();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isAppPage = location.pathname === "/app";

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
      toast({
        description: "Successfully signed out",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: "Error signing out",
      });
    }
  };

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-border">
      <Link to="/" className="flex items-center gap-2">
        <FileText className="text-primary" size={22} />
        <h1 className="text-lg font-bold text-invoice-lightText dark:text-invoice-darkText">
          Invoicely
        </h1>
      </Link>

      <div className="flex items-center gap-3">
        {session ? (
          <>
            {!isAppPage && (
              <Link to="/app">
                <Button variant="outline" size="sm">Create Invoice</Button>
              </Link>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </>
        ) : (
          <Link to="/auth">
            <Button variant="outline" size="sm">Sign In</Button>
          </Link>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;
