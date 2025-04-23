
import { Link, useLocation } from "react-router-dom";
import { LayoutGrid, Users, FileText, Package, FileSpreadsheet, Settings } from "lucide-react";

const menuItems = [
  { icon: LayoutGrid, label: "Dashboard", path: "/app" },
  { icon: Users, label: "Clients", path: "/app/clients" },
  { icon: FileText, label: "Invoices", path: "/app/invoices" },
  { icon: Package, label: "Items & Services", path: "/app/items" },
  { icon: FileSpreadsheet, label: "Page", path: "/app/page" },
  { icon: Settings, label: "Settings", path: "/app/settings" },
];

const DashboardSidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 h-screen bg-background border-r border-border">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
                isActive 
                  ? "bg-invoice-orange/10 text-invoice-orange"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default DashboardSidebar;
