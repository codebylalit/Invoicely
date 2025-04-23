import { useState } from "react";
import { Invoice } from "@/types/invoice";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon } from "lucide-react";

interface InvoicePromptInputProps {
  onGenerate: (invoice: Invoice) => void;
  isLoading: boolean;
  invoiceDraft?: Invoice | null;
  onDraftChange?: (draft: Invoice | null) => void;
}

const mockAiProcess = (prompt: string): Invoice => {
  const currentDate = new Date();
  const dueDate = new Date();
  dueDate.setDate(currentDate.getDate() + 30);
  
  let clientName = "N/A";
  let clientEmail = "N/A";
  let amount = 0;
  let description = "Service";
  
  if (prompt.includes("for") && prompt.includes("$")) {
    const nameMatch = prompt.match(/for\s+([A-Za-z\s]+)(?:\s+\(|$|\s)/);
    clientName = nameMatch ? nameMatch[1].trim() : "N/A";
    
    const emailMatch = prompt.match(/\(([^\)]+@[^\)]+)\)/);
    clientEmail = emailMatch ? emailMatch[1].trim() : "N/A";
    
    const amountMatch = prompt.match(/\$(\d+(\.\d{1,2})?)/);
    amount = amountMatch ? parseFloat(amountMatch[1]) : 0;

    description = prompt.split("for")[0].trim();
  }
  
  return {
    status: 'draft',
    dueDate: dueDate.toISOString().split('T')[0],
    name: clientName,
    email: clientEmail,
    details: '',
    items: [
      {
        id: '1',
        description: description,
        quantity: 1,
        unitPrice: amount,
        totalPrice: amount
      }
    ],
    subtotal: amount,
    total: amount,
    fromCompany: "Your Company"
  };
};

const InvoicePromptInput = ({
  onGenerate,
  isLoading,
  invoiceDraft,
  onDraftChange,
}: InvoicePromptInputProps) => {
  const [prompt, setPrompt] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerDetails, setCustomerDetails] = useState("");
  const [memo, setMemo] = useState("");

  const { toast } = useToast();

  React.useEffect(() => {
    if (invoiceDraft) {
      setPrompt(invoiceDraft.items?.[0]?.description || "");
      setDueDate(invoiceDraft.dueDate || "");
      setCustomerName(invoiceDraft.name || "");
      setCustomerEmail(invoiceDraft.email || "");
      setCustomerDetails(invoiceDraft.details || "");
    }
  }, [invoiceDraft]);

  React.useEffect(() => {
    if (!onDraftChange) return;

    let draft: Invoice = mockAiProcess(prompt);

    if (dueDate) draft.dueDate = dueDate;
    if (customerName) draft.name = customerName;
    if (customerEmail) draft.email = customerEmail;
    if (customerDetails) draft.details = customerDetails;

    onDraftChange(draft);
  }, [prompt, dueDate, customerName, customerEmail, customerDetails, memo]);

  const handleGenerate = () => {
    if (prompt.trim() === "") {
      toast({
        title: "Empty prompt",
        description: "Please enter a description to generate an invoice",
        variant: "destructive",
      });
      return;
    }

    try {
      const generatedInvoice = mockAiProcess(prompt);
      if (dueDate) generatedInvoice.dueDate = dueDate;
      if (customerName) generatedInvoice.name = customerName;
      if (customerEmail) generatedInvoice.email = customerEmail;
      if (customerDetails) generatedInvoice.details = customerDetails;
      onGenerate(generatedInvoice);
      toast({
        title: "Invoice generated",
        description: "Your invoice has been successfully generated",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Failed to generate invoice. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="invoice-section-title">Create invoice</h2>
        <p className="text-invoice-gray mb-4">Generate invoice with prompt</p>
        <textarea
          className="invoice-textarea h-32 mb-4"
          placeholder="Simply write down the task you did and we'll automatically generate a invoice based on the details"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button
          className="invoice-btn-primary"
          onClick={handleGenerate}
          disabled={isLoading}
        >
          {isLoading ? "Generating..." : "Generate"}
        </button>
      </div>

      <div>
        <h2 className="invoice-section-title">Details</h2>
        
        <div className="mb-4">
          <label htmlFor="dueDate" className="block text-invoice-lightText dark:text-invoice-darkText mb-2">
            Due date
          </label>
          <div className="relative">
            <input
              id="dueDate"
              type="date"
              className="invoice-input pr-10"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
            <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-invoice-gray" size={18} />
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="customerName" className="block text-invoice-lightText dark:text-invoice-darkText mb-2">
            Customer name
          </label>
          <input
            id="customerName"
            type="text"
            className="invoice-input"
            placeholder="Enter the full name for the invoice. Ensure correct spelling"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="customerEmail" className="block text-invoice-lightText dark:text-invoice-darkText mb-2">
            Customer email
          </label>
          <input
            id="customerEmail"
            type="email"
            className="invoice-input"
            placeholder="Enter a valid email for invoice delivery"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="customerDetails" className="block text-invoice-lightText dark:text-invoice-darkText mb-2">
              Additional customer details
            </label>
            <textarea
              id="customerDetails"
              className="invoice-textarea h-28"
              placeholder="Enter the full address for accurate billing, or any other information you want on the invoice"
              value={customerDetails}
              onChange={(e) => setCustomerDetails(e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="memo" className="block text-invoice-lightText dark:text-invoice-darkText mb-2">
              Memo
            </label>
            <textarea
              id="memo"
              className="invoice-textarea h-28"
              placeholder="Add any additional notes or details for this invoice"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePromptInput;
