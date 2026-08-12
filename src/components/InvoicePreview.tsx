import React, { useState, useRef, useEffect, useMemo } from "react";
import { FileText, Download, Mail, Calendar, RefreshCw } from "lucide-react";
import {
  TemplateSelectionModal,
  InvoiceTemplate,
  invoiceTemplates
} from "./InvoiceTemp";
import { useToast } from "@/hooks/use-toast";
import { Invoice, InvoiceItem, TaxItem, DiscountItem, PaymentMethod } from "@/types/invoice";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useSession } from "@supabase/auth-helpers-react";
import emailjs from "@emailjs/browser";
import { Link, useNavigate } from "react-router-dom";
import InvoiceLayout from './invoice/InvoiceLayout';
import EmailModal from './invoice/EmailModal';
import confetti from "canvas-confetti";
import { useEntitlements } from "@/hooks/useEntitlements";

interface InvoicePreviewProps {
  invoice: Invoice | null;
  showSendByEmail?: boolean;
  /** Called whenever the user picks a different template, so the parent can persist the id */
  onTemplateChange?: (templateId: number) => void;
  onPageSizeChange?: (pageSize: 'auto' | 'a4' | 'letter') => void;
}

interface EmailFormData {
  to: string[];
  cc: string[];
  message: string;
}

function formatDateSafe(dateStr) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString();
}

const PAGE_SIZE_CONFIGS: Record<string, {
  widthMm: number;
  heightMm: number;
  jsPdfFormat: string | [number, number];
  isAuto?: boolean;
  maxWClass: string;
  minHClass: string;
}> = {
  auto: {
    widthMm: 210,
    heightMm: 297,
    jsPdfFormat: 'a4',
    isAuto: true,
    maxWClass: 'max-w-[794px]',
    minHClass: 'h-fit',
  },
  a4: {
    widthMm: 210,
    heightMm: 297,
    jsPdfFormat: 'a4',
    maxWClass: 'max-w-[794px]',
    minHClass: 'min-h-[1123px]',
  },
  letter: {
    widthMm: 215.9,
    heightMm: 279.4,
    jsPdfFormat: 'letter',
    maxWClass: 'max-w-[816px]',
    minHClass: 'min-h-[1056px]',
  },
};

const InvoicePreview = ({ invoice, showSendByEmail, onTemplateChange, onPageSizeChange }: InvoicePreviewProps) => {
  const { toast } = useToast();
  const supabase = useSupabaseClient();
  const session = useSession();
  const [loading, setLoading] = useState(false);
  const [selectedPageSize, setSelectedPageSize] = useState<'auto' | 'a4' | 'letter'>(() => {
    if (invoice?.page_size) return invoice.page_size;
    try {
      const saved = localStorage.getItem("invoicely_last_page_size") as any;
      if (saved === 'a4' || saved === 'letter' || saved === 'auto') return saved;
    } catch (_) {}
    return 'auto';
  });
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailFormData, setEmailFormData] = useState<EmailFormData>({
    to: [],
    cc: [],
    message: "",
  });
  const [sendingEmail, setSendingEmail] = useState(false);
  const [isPdfView, setIsPdfView] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const [businessDetails, setBusinessDetails] = useState({
    contact_name: "",
    business_name: "",
    email: "",
    address: "",
    city: "",
    postal_code: "",
    region_state: "",
    country: "",
    phone_number: "",
    vat_number: "",
    logo_url: null,
  });

  const [paymentDetails, setPaymentDetails] = useState({
    bankTransferDetails: "",
    paymentMethod: null,
    paymentLink: "",
  });

  // Resolve the initial template from the invoice's saved template_id.
  // Falls back to template id=3 (Apple Minimal) for new/legacy invoices.
  const resolveTemplate = (templateId?: number | null) =>
    invoiceTemplates.find(t => t.id === (templateId ?? 3)) ||
    invoiceTemplates.find(t => t.id === 3) ||
    invoiceTemplates[0];

  const [selectedTemplate, setSelectedTemplate] =
    useState<InvoiceTemplate | null>(() => resolveTemplate(invoice?.template_id));
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  const navigate = useNavigate();

  const goToSubscription = () => {
    navigate("/app/settings?tab=subscription");
  };
  const { isPro, tier, canUseTemplate, canRemoveWatermark } = useEntitlements();
  const userSubscription = useMemo(() => ({ tier }), [tier]);

  // Default empty invoice for new/manual creation
  const defaultInvoice: Invoice = {
    status: "draft",
    invoiceNumber: "",
    invoiceTitle: "Invoice",
    name: "",
    email: "",
    details: "",
    issuedDate: new Date().toISOString(),
    dueDate: new Date(
      new Date().setDate(new Date().getDate() + 30)
    ).toISOString(),
    items: [],
    subtotal: 0,
    total: 0,
    fromCompany: "",
    taxes: [],
    discounts: [],
    notes: "",
    showPaymentMethods: false,
    paymentMethods: [
      { type: "bank", isEnabled: false },
      { type: "razorpay", isEnabled: false },
    ],
  };

  // Use the provided invoice or default to an empty one
  const displayInvoice = invoice || defaultInvoice;

  // --- Real-time calculation of subtotal, taxes, discounts, and total ---
  const calculatedInvoice = useMemo(() => {
    const items = displayInvoice.items || [];
    const discounts = Array.isArray(displayInvoice.discounts) ? displayInvoice.discounts : [];
    const taxes = Array.isArray(displayInvoice.taxes) ? displayInvoice.taxes : [];

    // Calculate subtotal
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

    // Calculate discounts (amounts should be recalculated based on current subtotal)
    const discountsWithAmount = discounts.map((discount) => ({
      ...discount,
      amount: subtotal * (discount.rate / 100),
    }));
    const totalDiscount = discountsWithAmount.reduce((sum, d) => sum + d.amount, 0);

    // Calculate taxes (amounts should be recalculated based on current subtotal)
    const taxesWithAmount = taxes.map((tax) => ({
      ...tax,
      amount: subtotal * (tax.rate / 100),
    }));
    const totalTax = taxesWithAmount.reduce((sum, t) => sum + t.amount, 0);

    // Calculate total
    const total = subtotal - totalDiscount + totalTax;

    return {
      ...displayInvoice,
      items,
      discounts: discountsWithAmount,
      taxes: taxesWithAmount,
      subtotal,
      total,
    };
  }, [displayInvoice.items, displayInvoice.discounts, displayInvoice.taxes]);

  const fetchPaymentDetails = async () => {
    try {
      if (!session?.user?.id) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("payment_method, bank_transfer_details, payment_link")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPaymentDetails({
          bankTransferDetails: data.bank_transfer_details || "",
          paymentMethod: data.payment_method || null,
          paymentLink: data.payment_link || "",

        });
      }
    } catch (error) {
      console.error("Error fetching payment details:", error);
      toast({
        title: "Error",
        description: "Failed to load payment details",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    console.log("Current payment details:", paymentDetails);
  }, [paymentDetails]);


  useEffect(() => {
    if (invoice?.page_size) {
      setSelectedPageSize(invoice.page_size);
    }
  }, [invoice?.id, invoice?.page_size]);

  /** Re-sync the selected template whenever the invoice changes (e.g. user closes and reopens invoice) */
  useEffect(() => {
    if (invoice?.template_id !== undefined && invoice?.template_id !== null) {
      const t = invoiceTemplates.find(tmpl => tmpl.id === Number(invoice.template_id));
      if (t) setSelectedTemplate(t);
    }
  }, [invoice?.id, invoice?.template_id]);

  const handleSelectTemplate = (template: InvoiceTemplate) => {
    // Check if user is trying to use a premium template while on free tier
    if (!canUseTemplate(template.id)) {
      toast({
        title: "Premium Template",
        description:
          "This template is only available for Pro users. Please upgrade to access it.",
        variant: "destructive",
      });
      return; // Don't apply the template
    }

    setSelectedTemplate(template);
    setIsTemplateModalOpen(false);
    // Notify parent so the template_id is persisted with the invoice
    onTemplateChange?.(template.id);
    toast({
      title: "Template Selected",
      description: `${template.name} template applied to your invoice`,
    });
  };
  const openTemplateSelection = () => {
    setIsTemplateModalOpen(true);
  };

  useEffect(() => {
    if (
      displayInvoice?.email &&
      !emailFormData.to.includes(displayInvoice.email)
    ) {
      setEmailFormData((prev) => ({
        ...prev,
        to: [displayInvoice.email],
      }));
    }
  }, [displayInvoice?.email]);

  // Safety reset: ensure loading/Generating state is never stuck on tab switches, template changes, or re-renders
  useEffect(() => {
    setLoading(false);
  }, [isPdfView, selectedTemplate?.id, invoice?.id, invoice?.invoiceNumber]);

  /** Wait for all web fonts in the document to be ready */
  /** Wait for all web fonts in the document to be ready */
  const waitForFonts = async () => {
    if (document.fonts) {
      await document.fonts.ready;
    }
  };

  /** Converts remote logo images inside a container into base64 data URIs to bypass CORS issues during PDF capture */
  const prepareImagesForCapture = async (el: HTMLElement): Promise<void> => {
    const imgs = Array.from(el.querySelectorAll<HTMLImageElement>('img'));
    await Promise.all(
      imgs.map(async (img) => {
        if (!img.getAttribute('crossorigin')) {
          img.setAttribute('crossorigin', 'anonymous');
        }
        if (img.src && !img.src.startsWith('data:') && !img.src.startsWith('blob:')) {
          try {
            const resp = await fetch(img.src, { mode: 'cors' });
            if (resp.ok) {
              const blob = await resp.blob();
              const base64 = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
              });
              img.src = base64;
            }
          } catch (e) {
            console.warn('[PDF Export] Failed to convert image to base64 data URI:', img.src, e);
          }
        }
      })
    );
  };

  /** Wait for all <img> elements inside a container to finish loading */
  const waitForImages = (el: HTMLElement): Promise<void[]> => {
    const imgs = Array.from(el.querySelectorAll<HTMLImageElement>('img'));
    return Promise.all(
      imgs.map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete && img.naturalWidth > 0) {
              resolve();
            } else {
              img.onload = () => resolve();
              img.onerror = () => resolve(); // still resolve so we don't hang
            }
          })
      )
    );
  };

  const generatePDF = async () => {
    // We capture the ACTUAL visible invoice, not a hidden clone.
    const element = invoiceRef.current;
    if (!element) {
      setLoading(false);
      return null;
    }

    try {
      setLoading(true);
      toast({
        title: 'PDF Generation',
        description: 'Preparing your invoice PDF…',
      });

      // 1. Resolve Page Size configuration FIRST
      const effectiveSizeKey = selectedPageSize || displayInvoice?.page_size || 'auto';
      const sizeConfig = PAGE_SIZE_CONFIGS[effectiveSizeKey] || PAGE_SIZE_CONFIGS.auto;
      const widthMm = sizeConfig.widthMm;
      const heightMm = sizeConfig.heightMm;

      // 2. Prepare images (convert remote URLs to base64 Data URIs) and wait for fonts
      await waitForFonts();
      await prepareImagesForCapture(element);
      await waitForImages(element);

      // 3. Record element dimensions & snapshot at target paper width (794px for A4/Auto, 816px for Letter)
      const targetPaperPx = Math.round(widthMm * 3.7795); // ~794px or ~816px
      const originalInlineWidth = element.style.width;
      const originalMaxWidth = element.style.maxWidth;
      const originalMinHeight = element.style.minHeight;

      element.style.width = `${targetPaperPx}px`;
      element.style.maxWidth = `${targetPaperPx}px`;
      if (sizeConfig.isAuto) {
        element.style.minHeight = 'auto';
      }

      const captureW = targetPaperPx;
      const captureH = element.scrollHeight;

      // 4. Snapshot with html2canvas at 3× resolution
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        width: captureW,
        height: captureH,
        windowWidth: captureW,
        scrollX: -window.scrollX,
        scrollY: -window.scrollY,
        x: 0,
        y: 0,
      });

      // Restore inline styles after capture
      element.style.width = originalInlineWidth;
      element.style.maxWidth = originalMaxWidth;
      element.style.minHeight = originalMinHeight;

      const pxPerMm = canvas.width / widthMm;
      const imgHeightMm = widthMm * (canvas.height / canvas.width);

      let pdf: jsPDF;

      if (sizeConfig.isAuto) {
        // Auto Mode: single dynamic-height PDF page if <= 594mm, else multi-page A4 fallback
        if (imgHeightMm <= 594) {
          pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [widthMm, imgHeightMm],
          });
          const sliceData = canvas.toDataURL('image/png', 1.0);
          pdf.addImage(sliceData, 'PNG', 0, 0, widthMm, imgHeightMm, undefined, 'FAST');
        } else {
          pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
          const pageH_px = 297 * pxPerMm;
          const totalPages = Math.ceil(canvas.height / pageH_px);

          for (let page = 0; page < totalPages; page++) {
            if (page > 0) pdf.addPage('a4');
            const srcY = page * pageH_px;
            const srcH = Math.min(pageH_px, canvas.height - srcY);

            const pageCanvas = document.createElement('canvas');
            pageCanvas.width = canvas.width;
            pageCanvas.height = pageH_px;
            const ctx = pageCanvas.getContext('2d')!;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
            ctx.drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH);

            const sliceData = pageCanvas.toDataURL('image/png', 1.0);
            pdf.addImage(sliceData, 'PNG', 0, 0, widthMm, 297, undefined, 'FAST');
          }
        }
      } else {
        // Fixed A4 or Letter Mode:
        pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: sizeConfig.jsPdfFormat,
        });

        if (imgHeightMm <= heightMm) {
          // Single page fixed mode
          const sliceData = canvas.toDataURL('image/png', 1.0);
          pdf.addImage(sliceData, 'PNG', 0, 0, widthMm, imgHeightMm, undefined, 'FAST');
        } else {
          // Multi-page slicing for A4 or Letter
          const pageH_px = heightMm * pxPerMm;
          const totalPages = Math.ceil(canvas.height / pageH_px);

          for (let page = 0; page < totalPages; page++) {
            if (page > 0) pdf.addPage(sizeConfig.jsPdfFormat);

            const srcY = page * pageH_px;
            const srcH = Math.min(pageH_px, canvas.height - srcY);

            const pageCanvas = document.createElement('canvas');
            pageCanvas.width = canvas.width;
            pageCanvas.height = pageH_px;
            const ctx = pageCanvas.getContext('2d')!;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
            ctx.drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH);

            const sliceData = pageCanvas.toDataURL('image/png', 1.0);
            pdf.addImage(sliceData, 'PNG', 0, 0, widthMm, heightMm, undefined, 'FAST');
          }
        }
      }

      // Embed clickable PDF hyperlink annotation for the watermark
      const watermarkEl = element.querySelector<HTMLElement>('[data-watermark-link="true"]');
      if (watermarkEl && effectiveShowWatermark) {
        const elRect = element.getBoundingClientRect();
        const wmRect = watermarkEl.getBoundingClientRect();

        const wmTopPx = wmRect.top - elRect.top;
        const wmHeightPx = wmRect.height;
        const wmLeftPx = wmRect.left - elRect.left;
        const wmWidthPx = wmRect.width;

        const targetPageH_mm = sizeConfig.isAuto && imgHeightMm <= 594 ? imgHeightMm : heightMm;
        const wmTopMm = (wmTopPx / element.scrollHeight) * imgHeightMm;
        const wmHeightMm = (wmHeightPx / element.scrollHeight) * imgHeightMm;
        const wmLeftMm = Math.max(0, (wmLeftPx / element.scrollWidth) * widthMm);
        const wmWidthMm = Math.min(widthMm, (wmWidthPx / element.scrollWidth) * widthMm);

        const targetPage = Math.min(Math.ceil(wmTopMm / targetPageH_mm), Math.ceil(imgHeightMm / targetPageH_mm));
        const wmYOnPage = wmTopMm % targetPageH_mm;

        pdf.setPage(targetPage || 1);
        const invoicelyUrl = "https://getinvoicely.online";
        pdf.link(wmLeftMm, wmYOnPage, wmWidthMm, wmHeightMm, { url: invoicelyUrl });
      }

      // Step 1 Verification log as requested in user prompt
      const finalPdfW = pdf.internal.pageSize.getWidth();
      const finalPdfH = pdf.internal.pageSize.getHeight();
      console.log(`[PDF EXPORT STEP 1 LOG]`, {
        rawInvoicePageSize: displayInvoice?.page_size,
        selectedPageSizeState: selectedPageSize,
        resolvedPageSizeKey: effectiveSizeKey,
        resolvedConfig: { widthMm, heightMm, isAuto: sizeConfig.isAuto },
        canvasDimensions: { width: canvas.width, height: canvas.height },
        elementScrollDimensions: { width: captureW, height: captureH },
        jsPdfFormat: sizeConfig.isAuto && imgHeightMm <= 594 ? [widthMm, Number(imgHeightMm.toFixed(1))] : sizeConfig.jsPdfFormat,
        pdfFinalDimensionsMm: { width: Number(finalPdfW.toFixed(1)), height: Number(finalPdfH.toFixed(1)) },
      });

      return pdf;
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate PDF. Please try again.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Function to upload PDF to Supabase storage
  const uploadPdfToStorage = async (pdf: any) => {
    try {
      if (!session?.user?.id || !pdf) {
        throw new Error("Missing user session or PDF data");
      }

      const pdfBlob = pdf.output("blob");
      const fileName = `invoices/${session.user.id}/${displayInvoice?.invoiceNumber || "invoice"
        }-${Date.now()}.pdf`;

      const { data, error } = await supabase.storage
        .from("invoice_pdfs")
        .upload(fileName, pdfBlob, {
          cacheControl: "3600",
          upsert: false,
          contentType: "application/pdf",
        });

      if (error) throw error;

      // Get public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from("invoice_pdfs")
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error("Error uploading PDF:", error);
      throw error;
    }
  };

  const handleDownloadPDF = async () => {
    if (loading) return;
    const wasInPdfView = isPdfView;
    try {
      setLoading(true);
      // Ensure we're on the Custom (live preview) view so invoiceRef is in the DOM
      if (isPdfView) {
        setIsPdfView(false);
        await new Promise((resolve) => setTimeout(resolve, 150)); // let React repaint
      }

      const pdf = await generatePDF();

      // Restore previous view
      if (wasInPdfView) setIsPdfView(true);

      if (!pdf) return;

      pdf.save(`Invoice-${displayInvoice?.invoiceNumber || 'invoice'}.pdf`);

      toast({
        title: 'Success',
        description: 'Invoice PDF downloaded successfully',
        variant: 'default',
      });
    } catch (err) {
      console.error("PDF download error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendByEmail = () => {
    if (!displayInvoice?.email) {
      toast({
        title: "No customer email",
        description: "Add a customer email address to send the invoice.",
        variant: "destructive",
      });
      return;
    }

    setEmailFormData({
      ...emailFormData,
      to: [displayInvoice.email],
    });

    setShowEmailModal(true);
  };

  const handleSendEmail = async () => {
    try {
      if (emailFormData.to.length === 0) {
        toast({
          title: "Error",
          description: "Please add at least one recipient email address",
          variant: "destructive",
        });
        return;
      }

      setSendingEmail(true);

      // Generate PDF from the actual visible invoice preview
      const pdf = await generatePDF();

      if (!pdf) {
        throw new Error("Failed to generate PDF");
      }

      // Initialize EmailJS with your public key
      emailjs.init("oEKkAS-XYQUnWfbKa");

      const formattedIssueDate = displayInvoice?.issuedDate
        ? new Date(displayInvoice.issuedDate).toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        })
        : "N/A";

      const formattedDueDate = displayInvoice?.dueDate
        ? new Date(displayInvoice.dueDate).toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        })
        : "N/A";

      // Use direct string for recipient email
      const recipientEmail = emailFormData.to[0];

      // Before setting up templateParams, verify the email exists
      if (!recipientEmail || recipientEmail.trim() === "") {
        throw new Error("Recipient email address is empty");
      }

      // Format items into a HTML table for better email display
      const itemsHtml = displayInvoice?.items?.length
        ? `
          <table style="width:100%; border-collapse: collapse; margin-bottom: 15px;">
            <tr style="background-color: #f2f2f2;">
              <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Description</th>
              <th style="text-align: center; padding: 8px; border-bottom: 1px solid #ddd;">Qty</th>
              <th style="text-align: right; padding: 8px; border-bottom: 1px solid #ddd;">Unit Price</th>
              <th style="text-align: right; padding: 8px; border-bottom: 1px solid #ddd;">Total</th>
            </tr>
            ${displayInvoice.items
          .map(
            (item) => `
              <tr>
                <td style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">${item.description
              }</td>
                <td style="text-align: center; padding: 8px; border-bottom: 1px solid #ddd;">${item.quantity
              }</td>
                <td style="text-align: right; padding: 8px; border-bottom: 1px solid #ddd;">$${item.unitPrice.toFixed(
                2
              )}</td>
                <td style="text-align: right; padding: 8px; border-bottom: 1px solid #ddd;">$${item.totalPrice.toFixed(
                2
              )}</td>
              </tr>
            `
          )
          .join("")}
          </table>
        `
        : "<p>No items included in this invoice.</p>";

      // Make sure parameter names exactly match template variables
      const templateParams = {
        to_email: recipientEmail,
        from_name: businessDetails.business_name || "Your Business",
        to_name: displayInvoice?.name || "Valued Customer",
        subject: `Invoice #${displayInvoice?.invoiceNumber || ""} from ${businessDetails.business_name || "Your Business"
          }`,
        invoice_number: displayInvoice?.invoiceNumber || "",
        invoice_date: formattedIssueDate,
        due_date: formattedDueDate,
        invoice_amount: `$${displayInvoice?.total?.toFixed(2) || "0.00"}`,
        subtotal: `$${displayInvoice?.subtotal?.toFixed(2) || "0.00"}`,
        taxes: displayInvoice?.taxes
          ? `$${displayInvoice?.taxes
            .reduce((sum, tax) => sum + tax.amount, 0)
            .toFixed(2)}`
          : "$0.00",
        discounts: displayInvoice?.discounts
          ? `-$${displayInvoice?.discounts
            .reduce((sum, discount) => sum + discount.amount, 0)
            .toFixed(2)}`
          : "$0.00",
        logo_url:
          businessDetails.logo_url || "https://yourdomain.com/default-logo.png",
        message: emailFormData.message || `Please find your invoice attached.`,
        items_html: itemsHtml,

        items_text:
          displayInvoice?.items
            ?.map(
              (item) =>
                `${item.description} (Qty: ${item.quantity
                }, Unit Price: $${item.unitPrice.toFixed(
                  2
                )}, Total: $${item.totalPrice.toFixed(2)})`
            )
            .join("\n") || "No items",
      };

      console.log("Email template params:", templateParams);

      toast({
        title: "Sending Invoice",
        description: `Invoice is being sent to ${recipientEmail}`,
        variant: "default",
      });

      // 1. Send via Supabase Edge Function (Resend API)
      let sentSuccessfully = false;
      try {
        const pdfBase64 = pdf ? pdf.output("datauristring").split(",")[1] : undefined;
        const payUrl = displayInvoice?.id ? `${window.location.origin}/pay/${displayInvoice.id}` : '';
        const { data: edgeData, error: edgeErr } = await supabase.functions.invoke('send-invoice-email', {
          body: {
            to: emailFormData.to,
            subject: emailFormData.subject || `Invoice #${displayInvoice?.invoiceNumber || ''} from ${businessDetails.business_name || 'Invoicely'}`,
            message: emailFormData.message || '',
            invoiceNumber: displayInvoice?.invoiceNumber || '',
            amount: displayInvoice?.total ? Number(displayInvoice.total).toFixed(2) : '0.00',
            dueDate: formattedDueDate,
            clientName: displayInvoice?.name || 'Valued Customer',
            businessName: businessDetails.business_name || 'Invoicely',
            payUrl,
            items: displayInvoice?.items || [],
            pdfBase64,
          }
        });
        if (!edgeErr && edgeData?.success) {
          sentSuccessfully = true;
        }
      } catch (e) {
        console.warn('Edge function email skipped, falling back to EmailJS', e);
      }

      if (!sentSuccessfully) {
        // 2. Fallback to EmailJS
        emailjs.init("oEKkAS-XYQUnWfbKa");
        await emailjs.send(
          "service_weenz74",
          "template_h6i0q4e",
          templateParams,
          "oEKkAS-XYQUnWfbKa"
        );
      }

      // ── Trigger invoice_sent automation for the Invoicely user ───────────
      if (session?.user?.email && displayInvoice?.invoiceNumber) {
        try {
          await supabase.functions.invoke('trigger-automation-email', {
            body: {
              triggerEvent: 'invoice_sent',
              idempotencyKey: `invoice_sent_${displayInvoice.id ?? displayInvoice.invoiceNumber}_${session.user.id}`,
              recipientEmail: session.user.email,
              recipientName: session.user.email.split('@')[0],
              variables: {
                userName: session.user.email.split('@')[0],
                userEmail: session.user.email,
                invoiceNumber: displayInvoice.invoiceNumber ?? '',
                invoiceAmount: `₹${Number(displayInvoice.total ?? 0).toFixed(2)}`,
                invoiceDueDate: displayInvoice.dueDate
                  ? new Date(displayInvoice.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                  : '',
              },
            },
          });
        } catch (autoErr) {
          console.warn('[automation] invoice_sent email failed:', autoErr);
        }
      }

      // ── Fire Confetti 🎉 ──────────────────────────────────────────────────
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        zIndex: 9999,
        colors: ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6']
      });

      toast({
        title: (
          <div className="flex items-center gap-2 success-animation">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Success 🎉</span>
          </div>
        ),
        description: (
          <div className="success-animation" style={{ animationDelay: "0.1s" }}>
            Invoice sent to {emailFormData.to[0]}
          </div>
        ),
        variant: "default",
      });

      setShowEmailModal(false);
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Error",
        description: `Failed to send email: ${error.message || "Unknown error"
          }`,
        variant: "destructive",
      });
    } finally {
      setSendingEmail(false);
      setIsPdfView(false);
    }
  };

  const fetchBusinessDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("business_details")
        .select("*")
        .eq("user_id", session?.user?.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        setBusinessDetails(data);
      }
    } catch (error) {
      console.error("Error fetching business details:", error);
      toast({
        title: "Error",
        description: "Failed to load business details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchBusinessDetails();
      fetchPaymentDetails();
      fetchUserSubscription(); // Add this line to fetch subscription
    }
  }, [session]);

  const handleRemoveEmail = (index: number, type: "to" | "cc") => {
    const updatedEmails = [...emailFormData[type]];
    updatedEmails.splice(index, 1);
    setEmailFormData({
      ...emailFormData,
      [type]: updatedEmails,
    });
  };

  const handleAddEmail = (
    e: React.KeyboardEvent<HTMLInputElement>,
    type: "to" | "cc"
  ) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const email = e.currentTarget.value.trim();

      // Remove comma if it was used as a separator
      const cleanEmail = email.endsWith(",") ? email.slice(0, -1) : email;

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        cleanEmail &&
        emailRegex.test(cleanEmail) &&
        !emailFormData[type].includes(cleanEmail)
      ) {
        setEmailFormData({
          ...emailFormData,
          [type]: [...emailFormData[type], cleanEmail],
        });
        e.currentTarget.value = "";
      } else if (cleanEmail && !emailRegex.test(cleanEmail)) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address",
          variant: "destructive",
        });
      }
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEmailFormData({
      ...emailFormData,
      message: e.target.value,
    });
  };

  const toggleViewMode = () => {
    setIsPdfView(!isPdfView);
  };

  const formattedIssueDate = displayInvoice.issuedDate
    ? new Date(displayInvoice.issuedDate).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    })
    : "N/A";

  const formattedDueDate = displayInvoice.dueDate
    ? new Date(displayInvoice.dueDate).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    })
    : "N/A";

  const containerClasses = ` h-full overflow-auto ${isPdfView ? "pdf-view-mode" : ""
    } ${selectedTemplate ? selectedTemplate.styles.font : ""} ${selectedTemplate ? selectedTemplate.styles.background : ""
    } bg-white text-invoice-lightText dark:bg-invoice-darkBg dark:text-invoice-darkText`;

  const formatRecurrenceInfo = (invoice: Invoice) => {
    if (!invoice.is_recurring) return null;

    const frequencyMap = {
      weekly: 'week',
      monthly: 'month',
      custom: 'day'
    };

    const frequency = frequencyMap[invoice.recurrence_frequency];
    const interval = invoice.recurrence_interval;
    const startDate = formatDateSafe(invoice.recurrence_start_date);
    const endDate = invoice.recurrence_end_date
      ? formatDateSafe(invoice.recurrence_end_date)
      : 'No end date';

    return (
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-2">
        <RefreshCw className="w-4 h-4" />
        <span>
          Repeats every {interval} {frequency}
          {interval > 1 ? 's' : ''} from {startDate} to {endDate}
        </span>
      </div>
    );
  };

  const isFreeTier = userSubscription.tier !== "pro";
  const effectiveShowWatermark = isFreeTier ? true : (displayInvoice?.show_watermark ?? true);

  return (
    <>
      <div className={containerClasses}>
        <div className="flex flex-col items-center">
          {/* Recurrence info – shown in the UI above the invoice, NOT inside the capture ref */}
          {displayInvoice.is_recurring && (
            <div className="flex justify-between items-center mb-4 px-8 pt-4 max-w-3xl w-full mx-auto">
              <div className="flex items-center space-x-4">
                <h1
                  className={`text-base font-medium ${selectedTemplate
                    ? selectedTemplate.styles.accent
                    : "text-invoice-lightText dark:text-invoice-darkText"
                    }`}
                >
                  {formatRecurrenceInfo(displayInvoice)}
                </h1>
              </div>
            </div>
          )}

          {/* Single invoice render — the ONLY source of truth for PDF capture */}
          {(() => {
            const activePageSizeKey = invoice?.page_size || selectedPageSize || 'auto';
            const activeSizeConfig = PAGE_SIZE_CONFIGS[activePageSizeKey] || PAGE_SIZE_CONFIGS.auto;
            const previewWidthClass = activeSizeConfig.maxWClass;
            const previewHeightClass = isPdfView
              ? `${activeSizeConfig.minHClass} flex flex-col justify-between`
              : 'h-fit flex flex-col justify-between';

            return (
              <div
                ref={invoiceRef}
                className={`bg-white ${previewWidthClass} ${previewHeightClass} w-full mx-auto p-6 sm:p-10 relative transition-all duration-200 ${isPdfView ? 'shadow-2xl' : ''}`}
                style={{ minWidth: '600px' }}
              >
                {selectedTemplate && (
                  <InvoiceLayout
                    layout={selectedTemplate.styles.layout}
                    businessDetails={businessDetails}
                    displayInvoice={displayInvoice}
                    calculatedInvoice={calculatedInvoice}
                    paymentDetails={paymentDetails}
                    isPro={userSubscription.tier === "pro"}
                  />
                )}

                {/* Invoicely Watermark - Enforced for Free tier & configurable for Pro tier */}
                {effectiveShowWatermark && (
                  <a
                    href="https://getinvoicely.online"
                    target="_blank"
                    rel="noopener noreferrer"
                    data-watermark-link="true"
                    className="pt-6 pb-4 mt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500 select-none hover:text-amber-600 transition-colors cursor-pointer no-underline block text-center"
                  >
                    <span className="inline-flex items-center justify-center gap-2">
                      <img src="/icon.png" alt="Invoicely Logo" className="h-4 w-4 object-contain opacity-80" />
                      <span>Created with <strong className="font-semibold text-gray-600 dark:text-gray-300">Invoicely</strong></span>
                    </span>
                  </a>
                )}
              </div>
            );
          })()}

          {/* Bottom Control Panel - Centered */}
          <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-invoice-darkBg border-t border-gray-200 dark:border-gray-800">
            <div className="max-w-3xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between sm:justify-end">
              {/* Controls Section */}
              <div className="flex items-center gap-3">
                {/* View Toggle */}
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1 flex items-center">
                  <button
                    onClick={toggleViewMode}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${!isPdfView
                      ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white"
                      : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                      }`}
                  >
                    Custom
                  </button>
                  <button
                    onClick={toggleViewMode}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${isPdfView
                      ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white"
                      : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                      }`}
                  >
                    PDF
                  </button>
                </div>

                {/* Template Button */}
                <Button
                  onClick={openTemplateSelection}
                  variant="ghost"
                  className="h-9 px-3 rounded-lg text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
                  title="Change Template"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="3" y1="9" x2="21" y2="9" />
                    <line x1="9" y1="21" x2="9" y2="9" />
                  </svg>
                </Button>

                {/* Page Size Selector */}
                <div className="flex items-center gap-1">
                  <select
                    value={invoice?.page_size || selectedPageSize}
                    onChange={(e) => {
                      const newSize = e.target.value as 'auto' | 'a4' | 'letter';
                      setSelectedPageSize(newSize);
                      onPageSizeChange?.(newSize);
                      try { localStorage.setItem("invoicely_last_page_size", newSize); } catch (_) {}
                    }}
                    className="h-9 px-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-200 outline-none focus:border-amber-500 cursor-pointer"
                    title="PDF Export Page Size"
                  >
                    <option value="auto">Auto (Fit)</option>
                    <option value="a4">A4 (210×297)</option>
                    <option value="letter">Letter (8.5×11)</option>
                  </select>
                </div>

                {/* Action Buttons */}
                <Button
                  onClick={handleDownloadPDF}
                  disabled={loading}
                >
                  <Download size={16} />
                  <span className="text-sm font-medium">
                    {loading ? "Generating..." : "Download"}
                  </span>
                </Button>
                {showSendByEmail && (
                  <Button
                    onClick={handleSendByEmail}
                    disabled={loading}
                  >
                    <Mail size={16} />
                    <span className="text-sm font-medium">Send</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <EmailModal
        open={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSend={handleSendEmail}
        emailFormData={emailFormData}
        onAddEmail={handleAddEmail}
        onRemoveEmail={handleRemoveEmail}
        onMessageChange={handleMessageChange}
        sending={sendingEmail}
        userSubscription={userSubscription}
        goToSubscription={goToSubscription}
      />
      <TemplateSelectionModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
        selectedTemplate={selectedTemplate}
        userSubscription={userSubscription}
      />
      <style>{`
        .pdf-view-mode {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding-top: 2rem;
          background-color: #f0f0f0;
        }

        @media print {
          .pdf-view-mode {
            background-color: white;
            padding: 0;
          }
        }

        @keyframes modal-slide-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-modal-slide-up {
          animation: modal-slide-up 0.1s ease-out;
        }
        
        @keyframes success-scale {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.2); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
        .success-animation {
          animation: success-scale 0.5s ease-out;
        }
      `}</style>
    </>
  );
};

export default InvoicePreview;
