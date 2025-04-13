
import { useState } from "react";
import Header from "@/components/Header";
import InvoicePromptInput from "@/components/InvoicePromptInput";
import InvoicePreview from "@/components/InvoicePreview";
import { Invoice } from "@/types/invoice";

const Index = () => {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateInvoice = (generatedInvoice: Invoice) => {
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      setInvoice(generatedInvoice);
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="flex flex-col min-h-screen bg-invoice-light dark:bg-invoice-darkBg">
      <Header />
      
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
        <div className="overflow-auto">
          <InvoicePromptInput
            onGenerate={handleGenerateInvoice}
            isLoading={isLoading}
          />
        </div>
        
        <div className="bg-invoice-light dark:bg-invoice-dark p-4 rounded-lg shadow-sm border border-border">
          <InvoicePreview invoice={invoice} />
        </div>
      </main>
      
      <footer className="py-3 px-4 text-center text-invoice-gray border-t border-border text-sm">
        <p>© 2025 InvoiceAI</p>
      </footer>
    </div>
  );
};

export default Index;
