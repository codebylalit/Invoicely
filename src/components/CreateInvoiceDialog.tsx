import React, { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import type { Invoice } from "@/types/invoice";
import { useInvoiceManager } from "@/hooks/useInvoiceManager";
import { useRoutes } from "react-router-dom";
import { useEntitlements } from "@/hooks/useEntitlements";
import { useFreeLimits } from "@/hooks/useFreeLimits";
import UpgradePrompt from "./UpgradePrompt";


const CreateInvoiceDialog = () => {
  const [open, setOpen] = useState(false);
  const [invoiceDraft, setInvoiceDraft] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const { saveInvoice, isSaving, getNextInvoiceNumber } = useInvoiceManager();
  const router = useRoutes;

  const { isPro, canCreateInvoice } = useEntitlements();
  const { monthlyInvoiceCount, refetch: refetchLimits } = useFreeLimits();

  const handleOpenChange = async (isOpen: boolean) => {
    if (isOpen) {
      // ── Enforce Free plan invoice limit ─────────────────────────────────
      if (!isPro && !canCreateInvoice(monthlyInvoiceCount)) {
        setShowUpgradePrompt(true);
        return; // Do NOT open the dialog
      }

      let nextNumber = "1001";
      try {
        nextNumber = await getNextInvoiceNumber();
      } catch (_) {}

      setInvoiceDraft({
        invoiceNumber: nextNumber,
        invoiceTitle: "INVOICE",
        issuedDate: new Date().toISOString().split("T")[0],
        dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
        name: "",
        email: "",
        details: "",
        items: [{ id: "0", description: "", quantity: 1, unitPrice: 0, totalPrice: 0 }],
        subtotal: 0,
        total: 0,
        notes: "",
        paymentMethods: [],
        taxes: [],
        discounts: [],
        status: "draft",
        is_recurring: false,
      });
    } else {
      setInvoiceDraft(null);
    }
    setOpen(isOpen);
  };

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
      // Refresh usage counts after a new invoice is created
      refetchLimits();
    }
  };

  const handleClose = () => {
    setInvoiceDraft(null);
    setIsLoading(false);
    setOpen(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button className="w-full md:w-auto">
            <FileText className="w-4 h-4 mr-2" />
            Create invoice
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

            <div className="flex-1 md:pl-4 overflow-y-auto">
              <InvoicePreview
                invoice={invoiceDraft}
                showSendByEmail
                onTemplateChange={(templateId) =>
                  setInvoiceDraft((prev) =>
                    prev ? { ...prev, template_id: templateId } : prev,
                  )
                }
                onPageSizeChange={(pageSize) =>
                  setInvoiceDraft((prev) =>
                    prev ? { ...prev, page_size: pageSize } : prev,
                  )
                }
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Upgrade Prompt (shown when invoice limit reached) ─────────────── */}
      <UpgradePrompt
        open={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        limitType="invoices"
      />
    </>
  );
};

export default CreateInvoiceDialog;
