
import { Download, FileText, Users } from "lucide-react";
import { Invoice, InvoiceItem } from "@/types/invoice";
import { useToast } from "@/hooks/use-toast";

interface InvoicePreviewProps {
  invoice: Invoice | null;
}

const InvoicePreview = ({ invoice }: InvoicePreviewProps) => {
  const { toast } = useToast();

  const handleDownloadPDF = () => {
    // In a real implementation, this would generate and download a PDF
    toast({
      title: "PDF Download",
      description: "Your invoice PDF is being prepared for download",
    });
    
    // Simulate download delay
    setTimeout(() => {
      toast({
        title: "Success",
        description: "Invoice PDF downloaded successfully",
        variant: "default",
      });
    }, 1500);
  };
  
  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <FileText className="text-invoice-orange mb-4" size={48} />
        <h2 className="text-xl font-medium text-invoice-lightText dark:text-invoice-darkText mb-2">
          No invoice generated yet
        </h2>
        <p className="text-invoice-gray max-w-md text-center">
          Generate an invoice using the prompt on the left side to see a preview here
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-center text-invoice-lightText dark:text-invoice-darkText">
            Invoice from {invoice.fromCompany}
          </h2>
          <div className="flex justify-end mt-2">
            <div className="text-right">
              <p className="text-invoice-gray text-sm">Total amount</p>
              <p className="text-2xl font-bold text-invoice-lightText dark:text-invoice-darkText">
                ${invoice.total.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-y-4 mb-8">
          <div>
            <p className="invoice-preview-label">Status</p>
          </div>
          <div className="text-right">
            <span className="inline-block bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded uppercase">
              {invoice.status}
            </span>
          </div>

          <div>
            <p className="invoice-preview-label">Due</p>
          </div>
          <div>
            <p className="invoice-preview-value">
              {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "Invalid Date"}
            </p>
          </div>

          <div>
            <p className="invoice-preview-label">Name</p>
          </div>
          <div>
            <p className="invoice-preview-value">{invoice.name || "N/A"}</p>
          </div>

          <div>
            <p className="invoice-preview-label">Email</p>
          </div>
          <div>
            <p className="invoice-preview-value">{invoice.email || "N/A"}</p>
          </div>

          <div>
            <p className="invoice-preview-label">Details</p>
          </div>
          <div>
            <p className="invoice-preview-value">{invoice.details || "N/A"}</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="grid grid-cols-12 invoice-table-header">
            <div className="col-span-5">Description</div>
            <div className="col-span-2 text-center">Quantity</div>
            <div className="col-span-2 text-right">Unit price</div>
            <div className="col-span-3 text-right">Total price</div>
          </div>
          <div className="space-y-2 mt-2">
            {invoice.items.map((item: InvoiceItem) => (
              <div key={item.id} className="grid grid-cols-12 py-2 border-b border-border">
                <div className="col-span-5 text-invoice-lightText dark:text-invoice-darkText">
                  {item.description}
                </div>
                <div className="col-span-2 text-center text-invoice-lightText dark:text-invoice-darkText">
                  {item.quantity}
                </div>
                <div className="col-span-2 text-right text-invoice-lightText dark:text-invoice-darkText">
                  ${item.unitPrice.toFixed(2)}
                </div>
                <div className="col-span-3 text-right text-invoice-lightText dark:text-invoice-darkText">
                  ${item.totalPrice.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <p className="text-invoice-lightText dark:text-invoice-darkText font-medium">
              SubTotal
            </p>
            <p className="text-invoice-lightText dark:text-invoice-darkText">
              ${invoice.subtotal.toFixed(2)}
            </p>
          </div>
          <div className="flex justify-between">
            <p className="text-invoice-lightText dark:text-invoice-darkText font-medium">
              Total
            </p>
            <p className="text-invoice-lightText dark:text-invoice-darkText font-bold">
              ${invoice.total.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 invoice-btn-secondary"
        >
          <Download size={16} />
          Download PDF
        </button>
      </div>
      
      <div className="mt-6 flex justify-between items-center pt-4 border-t border-border">
        <button className="flex items-center gap-2 text-invoice-gray hover:text-invoice-lightText dark:hover:text-invoice-darkText transition-colors">
          <FileText size={16} />
          Invoice PDF
        </button>
        <button className="flex items-center gap-2 text-invoice-gray hover:text-invoice-lightText dark:hover:text-invoice-darkText transition-colors">
          <Users size={16} />
          Customer page
        </button>
      </div>
    </div>
  );
};

export default InvoicePreview;
