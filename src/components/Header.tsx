
import ThemeToggle from "./ThemeToggle";
import { FileText } from "lucide-react";

const Header = () => {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border">
      <div className="flex items-center gap-2">
        <FileText className="text-invoice-orange" size={24} />
        <h1 className="text-xl font-bold text-invoice-lightText dark:text-invoice-darkText">
          InvoiceAI
        </h1>
      </div>
      <ThemeToggle />
    </header>
  );
};

export default Header;
