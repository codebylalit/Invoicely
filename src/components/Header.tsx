
import ThemeToggle from "./ThemeToggle";
import { FileText } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";

const Header = () => {
  const location = useLocation();
  const isAppPage = location.pathname === "/app";

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border">
      <Link to="/" className="flex items-center gap-2">
        <FileText className="text-invoice-orange" size={24} />
        <h1 className="text-xl font-bold text-invoice-lightText dark:text-invoice-darkText">
          InvoiceAI
        </h1>
      </Link>
      
      <div className="flex items-center gap-4">
        {isAppPage ? (
          <Link to="/">
            <Button variant="outline" size="sm">Back to Home</Button>
          </Link>
        ) : (
          <Link to="/app">
            <Button variant="outline" size="sm">Go to App</Button>
          </Link>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;
