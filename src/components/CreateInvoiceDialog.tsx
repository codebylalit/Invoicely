
import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import InvoicePromptInput from "./InvoicePromptInput";
import InvoicePreview from "./InvoicePreview";
import { Button } from "./ui/button";
import { FileText } from "lucide-react";
import type { Invoice } from "@/types/invoice";

const CreateInvoiceDialog = () => {
  const [open, setOpen] = useState(false);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = (generatedInvoice: Invoice) => {
    setInvoice(generatedInvoice);
  };

  // Reset state when closing dialog
  const handleClose = () => {
    setInvoice(null);
    setIsLoading(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-invoice-orange hover:bg-invoice-orange/90 w-full md:w-auto">
          <FileText className="w-4 h-4 mr-2" />
          Create invoice
        </Button>
      </DialogTrigger>
      <DialogContent 
        className="max-w-4xl w-full p-0 md:p-0 md:max-w-4xl"
        onPointerDownOutside={handleClose}
      >
        <DialogHeader className="px-6 pt-6 pb-0 border-b">
          <DialogTitle>Create Invoice</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col md:flex-row gap-0 md:gap-8 p-6 min-h-[500px]">
          <div className="flex-1 border-r border-border pr-0 md:pr-6 mb-6 md:mb-0">
            <InvoicePromptInput onGenerate={handleGenerate} isLoading={isLoading} />
          </div>
          <div className="flex-1 pl-0 md:pl-6">
            <InvoicePreview invoice={invoice} />
          </div>
        </div>
        <DialogClose asChild>
          <Button
            variant="secondary"
            className="absolute top-4 right-6"
            aria-label="Close"
            onClick={handleClose}
          >
            Close
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default CreateInvoiceDialog;

