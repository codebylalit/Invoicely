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

interface InvoicePreviewProps {
  invoice: Invoice | null;
  showSendByEmail?: boolean;
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

const InvoicePreview = ({ invoice, showSendByEmail }: InvoicePreviewProps) => {
  const { toast } = useToast();
  const supabase = useSupabaseClient();
  const session = useSession();
  const [loading, setLoading] = useState(false);
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

  const [selectedTemplate, setSelectedTemplate] =
    useState<InvoiceTemplate | null>(invoiceTemplates.find(t => t.id === 3) || null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  const navigate = useNavigate();

  const goToSubscription = () => {
    navigate("/app/settings?tab=subscription");
  };
  const [userSubscription, setUserSubscription] = useState({
    tier: "free", // Default to free
  });
  const fetchUserSubscription = async () => {
    try {
      if (!session?.user?.id) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("tier")
        .eq("user_id", session.user.id)
        .single();

      if (error) throw error;

      if (data) {
        setUserSubscription({
          tier: data.tier || "free",
        });
      }
    } catch (error) {
      console.error("Error fetching user subscription:", error);
      toast({
        title: "Error",
        description: "Failed to load subscription details",
        variant: "destructive",
      });
    }
  };

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
        .single();

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


  const handleSelectTemplate = (template: InvoiceTemplate) => {
    // Check if user is trying to use a premium template while on free tier
    if (userSubscription.tier !== "pro" && template.id > 3) {
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

  const generatePDF = async () => {
    const sourceElement = invoiceRef.current;
    if (!sourceElement) {
      console.error("Preview element not found");
      return null;
    }

    try {
      setLoading(true);
      toast({
        title: "PDF Generation",
        description: "Your invoice PDF is being prepared",
      });

      // Create a hidden, fixed-width A4 container (800px width) in document body
      // This guarantees standard desktop rendering regardless of screen/device size or viewport width
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.top = "-9999px";
      container.style.left = "-9999px";
      container.style.width = "800px";
      container.style.backgroundColor = "#FFFFFF";
      container.style.color = "#0f172a";

      // Clone the source preview element into the container
      const clone = sourceElement.cloneNode(true) as HTMLElement;
      clone.classList.remove("dark");
      clone.style.backgroundColor = "#FFFFFF";
      clone.style.color = "#0f172a";
      clone.style.width = "800px";
      clone.style.maxWidth = "800px";
      clone.style.padding = "24px";
      clone.style.margin = "0px";

      // Force explicit white text on dark cards inside clone tree
      const darkCards = clone.querySelectorAll(".bg-gray-900, .bg-slate-900, .bg-\\[\\#0f172a\\], .bg-\\[\\#18181b\\], .bg-black");
      darkCards.forEach((card) => {
        (card as HTMLElement).style.color = "#ffffff";
        const children = card.querySelectorAll("p, span, h1, h2, h3, div");
        children.forEach((c) => {
          const el = c as HTMLElement;
          if (!el.className.includes("text-gray-400") && !el.className.includes("opacity-60") && !el.className.includes("text-slate-400")) {
            el.style.color = "#ffffff";
          }
        });
      });

      container.appendChild(clone);
      document.body.appendChild(container);

      // Wait for fonts & images inside the cloned node to complete loading
      if (document.fonts) {
        await document.fonts.ready;
      }
      const images = Array.from(clone.querySelectorAll("img"));
      await Promise.all(
        images.map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })
      );
      await new Promise((r) => setTimeout(r, 100));

      // Render canvas with html2canvas
      const canvas = await html2canvas(clone, {
        scale: 3, // High DPI retina quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#FFFFFF",
        logging: false,
        windowWidth: 800,
      });

      // Clean up clone container from DOM immediately
      document.body.removeChild(container);

      // Create PDF with exact A4 proportions
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pdfWidth, pageHeight, "F");

      if (imgHeight <= pageHeight) {
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeight);
      } else {
        let heightLeft = imgHeight;
        let position = 0;
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
        heightLeft -= pageHeight;
        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.setFillColor(255, 255, 255);
          pdf.rect(0, 0, pdfWidth, pageHeight, "F");
          pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
          heightLeft -= pageHeight;
        }
      }

      return pdf;
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
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
    const pdf = await generatePDF();
    if (!pdf) return;

    pdf.save(`Invoice-${displayInvoice?.invoiceNumber || "unknown"}.pdf`);

    toast({
      title: "Success",
      description: "Invoice PDF downloaded successfully",
      variant: "default",
    });
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

      toast({
        title: (
          <div className="flex items-center gap-2 success-animation">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Success</span>
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
        .single();

      if (error && error.code !== "PGRST116") {
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

  return (
    <>
      <div className={containerClasses}>
        <div className="flex flex-col items-center">
          <div
            ref={invoiceRef}
            className={`p-6 sm:p-8 max-w-3xl w-full mx-auto pb-24 transition-all duration-200 ${
              isPdfView
                ? "bg-white text-slate-900 shadow-2xl rounded-none border border-gray-200 my-4 min-h-[1050px]"
                : ""
            }`}
          >
            {formatRecurrenceInfo(displayInvoice) && (
              <div className="mb-4">
                <h1
                  className={`text-xl font-bold ${
                    selectedTemplate
                      ? selectedTemplate.styles.accent
                      : "text-invoice-lightText dark:text-invoice-darkText"
                  }`}
                >
                  {formatRecurrenceInfo(displayInvoice)}
                </h1>
              </div>
            )}
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
          </div>

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
