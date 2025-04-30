import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import InvoicePromptInput, { InvoiceForm } from "./InvoiceForm";
import InvoicePreview from "./InvoicePreview";
import { Button } from "./ui/Button";
import { FileText, Loader2 } from "lucide-react";
import type { Invoice } from "@/types/invoice";
import { useInvoiceManager } from "@/hooks/useInvoiceManager";
import { useRoutes } from "react-router-dom";


const CreateInvoiceDialog = () => {
  const [open, setOpen] = useState(false);
  const [invoiceDraft, setInvoiceDraft] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { saveInvoice, isSaving, getNextInvoiceNumber } = useInvoiceManager();
  const router = useRoutes;

  // Initialize new invoice with next available number
  useEffect(() => {
    if (open && !invoiceDraft?.invoiceNumber) {
      const initializeInvoice = async () => {
        try {
          const nextNumber = await getNextInvoiceNumber();
          if (invoiceDraft) {
            setInvoiceDraft({
              ...invoiceDraft,
              invoiceNumber: nextNumber,
            });
          }
        } catch (error) {
          console.error("Error initializing invoice:", error);
        }
      };

      initializeInvoice();
    }
  }, [open, invoiceDraft]);

  const handleDraftChange = (draft: Invoice | null) => {
    setInvoiceDraft(draft);
  };

  const handleGenerate = (generatedInvoice: Invoice) => {
    setInvoiceDraft(generatedInvoice);
  };

  const handleSaveAndClose = async () => {
    if (!invoiceDraft) return;

    const savedInvoice = await saveInvoice(invoiceDraft);

    if (savedInvoice) {
      setInvoiceDraft(null);
      setIsLoading(false);
      setOpen(false);

      // Refresh the invoices list
      router.push("/invoices");
    }
  };

  const handleClose = () => {
    setInvoiceDraft(null);
    setIsLoading(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full md:w-auto">
          <FileText className="w-4 h-4 mr-2" />
          New invoice
        </Button>
      </DialogTrigger>

      <DialogContent
        className="w-screen h-screen max-w-none max-h-none p-0 overflow-hidden"
        onPointerDownOutside={handleClose}
      >
        <DialogHeader className="px-4 md:px-6 pt-2 md:pt-4 border-b sticky top-0 bg-background z-10">
          <div className="flex justify-between items-center">
            <DialogTitle className="invoice-section-title">
              Create Invoice
            </DialogTitle>

            <div className="flex gap-2">
              <DialogClose asChild>
                <Button variant="secondary" onClick={handleClose}>
                  Close
                </Button>
              </DialogClose>
              <Button
                disabled={!invoiceDraft || isSaving}
                onClick={handleSaveAndClose}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save and Close"
                )}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col md:flex-row gap-2 p-4 md:p-4 h-[calc(100vh-144px)] overflow-hidden">
          <div className="flex-1 md:border-r md:border-border md:pr-4 overflow-y-auto">
            <InvoiceForm
              onGenerate={handleGenerate}
              isLoading={isLoading}
              invoiceDraft={invoiceDraft}
              onDraftChange={handleDraftChange}
            />
          </div>

          <div className="flex-1 md:pl-4 overflow-y-auto pb-2">
            <InvoicePreview invoice={invoiceDraft} showSendByEmail />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateInvoiceDialog;
