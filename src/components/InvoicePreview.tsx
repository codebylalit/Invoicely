import React, { useState, useRef, useEffect, useMemo } from "react";
import { FileText, Download, Mail } from "lucide-react";
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

interface InvoicePreviewProps {
  invoice: Invoice | null;
  showSendByEmail?: boolean;
}

interface EmailFormData {
  to: string[];
  cc: string[];
  message: string;
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
      { type: "stripe", isEnabled: false },
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
    if (!pdfRef.current) return null;

    try {
      setLoading(true);
      toast({
        title: "PDF Generation",
        description: "Your invoice PDF is being prepared",
      });

      const element = pdfRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: "#FFFFFF",
        letterRendering: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, imgWidth, pageHeight, "F");
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

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

  const fetchPaymentDetails = async () => {
    try {
      if (!session?.user?.id) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("payment_method, bank_transfer_details")
        .eq("user_id", session.user.id)
        .single();

      if (error) throw error;

      if (data) {
        setPaymentDetails({
          bankTransferDetails: data.bank_transfer_details || "",
          paymentMethod: data.payment_method || null,
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

  const handleDownloadPDF = async () => {
    setIsPdfView(true);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const pdf = await generatePDF();
    setIsPdfView(false);

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

      // Switch to PDF view for generation
      setIsPdfView(true);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const pdf = await generatePDF();
      setIsPdfView(false);

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

      // Send the email
      const result = await emailjs.send(
        "service_weenz74",
        "template_h6i0q4e",
        templateParams,
        "oEKkAS-XYQUnWfbKa"
      );

      console.log("Email sent successfully:", result);

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
    }`;

  const renderInvoiceLayout = (template: InvoiceTemplate | null) => {
    if (!template) return null;
    switch (template.styles.layout) {
      case 'classic':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">{displayInvoice.invoiceTitle}</h1>
                <p className="text-gray-600">Invoice #{displayInvoice.invoiceNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-600">Issued: {formattedIssueDate}</p>
                <p className="text-gray-600">Due: {formattedDueDate}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <h2 className="font-semibold">From</h2>
                <p>{businessDetails.business_name}</p>
                <p>{businessDetails.address}</p>
                <p>{businessDetails.email}</p>
              </div>
              <div className="space-y-2">
                <h2 className="font-semibold">To</h2>
                <p>{displayInvoice.name}</p>
                <p>{displayInvoice.details}</p>
                <p>{displayInvoice.email}</p>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-8">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2">Description</th>
                    <th className="text-center py-2">Quantity</th>
                    <th className="text-right py-2">Unit Price</th>
                    <th className="text-right py-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {displayInvoice.items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="py-2">{item.description}</td>
                      <td className="text-center py-2">{item.quantity}</td>
                      <td className="text-right py-2">${item.unitPrice.toFixed(2)}</td>
                      <td className="text-right py-2">${item.totalPrice.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'modern':
        return (
          <div className="space-y-12">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold mb-2">{displayInvoice.invoiceTitle}</h1>
                <div className="flex gap-4 text-gray-600">
                  <p>#{displayInvoice.invoiceNumber}</p>
                  <p>•</p>
                  <p>Issued: {formattedIssueDate}</p>
                  <p>•</p>
                  <p>Due: {formattedDueDate}</p>
                </div>
              </div>
              {businessDetails.logo_url && (
                <img src={businessDetails.logo_url} alt="Logo" className="h-16" />
              )}
            </div>
            <div className="grid grid-cols-2 gap-12">
              <div>
                <h2 className="text-lg font-semibold mb-4">From</h2>
                <div className="space-y-2">
                  <p className="font-medium">{businessDetails.business_name}</p>
                  <p className="text-gray-600">{businessDetails.address}</p>
                  <p className="text-gray-600">{businessDetails.email}</p>
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-4">To</h2>
                <div className="space-y-2">
                  <p className="font-medium">{displayInvoice.name}</p>
                  <p className="text-gray-600">{displayInvoice.details}</p>
                  <p className="text-gray-600">{displayInvoice.email}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3">Description</th>
                    <th className="text-center py-3">Quantity</th>
                    <th className="text-right py-3">Unit Price</th>
                    <th className="text-right py-3">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {displayInvoice.items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="py-3">{item.description}</td>
                      <td className="text-center py-3">{item.quantity}</td>
                      <td className="text-right py-3">${item.unitPrice.toFixed(2)}</td>
                      <td className="text-right py-3">${item.totalPrice.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'minimal':
        return (
          <div className="space-y-16">
            <div className="text-center">
              <h1 className="text-4xl font-light mb-2">{displayInvoice.invoiceTitle}</h1>
              <p className="text-gray-600">#{displayInvoice.invoiceNumber}</p>
            </div>
            <div className="grid grid-cols-2 gap-16">
              <div>
                <h2 className="text-sm font-medium mb-4">FROM</h2>
                <div className="space-y-1">
                  <p>{businessDetails.business_name}</p>
                  <p className="text-gray-600">{businessDetails.address}</p>
                  <p className="text-gray-600">{businessDetails.email}</p>
                </div>
              </div>
              <div>
                <h2 className="text-sm font-medium mb-4">TO</h2>
                <div className="space-y-1">
                  <p>{displayInvoice.name}</p>
                  <p className="text-gray-600">{displayInvoice.details}</p>
                  <p className="text-gray-600">{displayInvoice.email}</p>
                </div>
              </div>
            </div>
            <div>
              <div className="border-t border-gray-200 pt-8">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4">Description</th>
                      <th className="text-center py-4">Quantity</th>
                      <th className="text-right py-4">Unit Price</th>
                      <th className="text-right py-4">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayInvoice.items.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100">
                        <td className="py-4">{item.description}</td>
                        <td className="text-center py-4">{item.quantity}</td>
                        <td className="text-right py-4">${item.unitPrice.toFixed(2)}</td>
                        <td className="text-right py-4">${item.totalPrice.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'default':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-4">
                {businessDetails.logo_url && (
                  <img
                    src={businessDetails.logo_url}
                    alt="Business logo"
                    className="h-14 w-14 object-contain"
                  />
                )}
                <div>
                  <h1 className="text-2xl font-bold text-invoice-lightText dark:text-invoice-darkText">
                    {displayInvoice.invoiceTitle || "Invoice"}
                  </h1>
                  <p className="text-sm text-gray-600">
                    Issued: {formattedIssueDate}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  Invoice# {displayInvoice.invoiceNumber || "00000"}
                </p>
              </div>
            </div>
            <div className="flex justify-between">
              <div className="w-1/2">
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-1">Issued</p>
                  <p className="text-sm">{formattedIssueDate}</p>
                </div>
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-1">From</p>
                  <p className="text-sm">{businessDetails.business_name}</p>
                  <p className="text-sm">{businessDetails.email || "N/A"}</p>
                  <p className="text-sm">
                    {businessDetails.address && `${businessDetails.address}, `}
                    {businessDetails.city && `${businessDetails.city}, `}
                    {businessDetails.postal_code}
                  </p>
                </div>
              </div>
              <div className="w-1/2 text-right">
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-1">Due</p>
                  <p className="text-sm">{formattedDueDate}</p>
                </div>
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-1">Invoice For</p>
                  <p className="text-sm">{displayInvoice.name || "N/A"}</p>
                  <p className="text-sm">{displayInvoice.email || "N/A"}</p>
                  <p className="text-sm">{displayInvoice.details || "N/A"}</p>
                </div>
              </div>
            </div>
            <div className="mb-8">
              <div className="grid grid-cols-12 text-sm text-gray-600 border-b border-gray-200 pb-2 mb-4">
                <div className="col-span-6">DESCRIPTION</div>
                <div className="col-span-2 text-center">QUANTITY</div>
                <div className="col-span-2 text-right">UNIT PRICE</div>
                <div className="col-span-2 text-right">AMOUNT</div>
              </div>
              {displayInvoice.items && displayInvoice.items.length > 0 ? (
                displayInvoice.items.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 text-sm py-3 border-b border-gray-200"
                  >
                    <div className="col-span-6">
                      <p>{item.description}</p>
                      {item.additionalInfo && (
                        <p className="text-xs text-gray-500">
                          {item.additionalInfo}
                        </p>
                      )}
                    </div>
                    <div className="col-span-2 text-center">
                      {item.quantity}
                    </div>
                    <div className="col-span-2 text-right">
                      ${item.unitPrice.toFixed(2)}
                    </div>
                    <div className="col-span-2 text-right">
                      ${item.totalPrice.toFixed(2)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 italic">
                  No items added to this invoice yet
                </div>
              )}
            </div>
            <div className="flex justify-end mb-8">
              <div className="w-1/3">
                <div className="flex justify-between text-sm py-2">
                  <span>Subtotal</span>
                  <span>${calculatedInvoice.subtotal.toFixed(2)}</span>
                </div>
                {Array.isArray(calculatedInvoice.discounts) &&
                  calculatedInvoice.discounts.length > 0 &&
                  calculatedInvoice.discounts.map((discount, index) => (
                    <div
                      key={`discount-${discount.id || index}`}
                      className="flex justify-between text-sm py-2"
                    >
                      <span>Discount ({discount.rate.toFixed(0)}%)</span>
                      <span>-${discount.amount.toFixed(2)}</span>
                    </div>
                  ))}
                {Array.isArray(calculatedInvoice.taxes) &&
                  calculatedInvoice.taxes.length > 0 ? (
                  calculatedInvoice.taxes.map((tax, index) => (
                    <div
                      key={`tax-${tax.id || index}`}
                      className="flex justify-between text-sm py-2"
                    >
                      <span>Tax ({tax.rate ? tax.rate.toFixed(0) : 0}%)</span>
                      <span>
                        ${tax.amount ? tax.amount.toFixed(2) : "0.00"}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500"></div>
                )}
                <div className="flex justify-between font-bold text-sm border-t border-gray-300 pt-2 mt-2">
                  <span>Total</span>
                  <span>${calculatedInvoice.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            {displayInvoice.showPaymentMethods !== false && (
              <div className="border-t border-gray-200 pt-4 mb-8">
                <h2 className="text-sm font-semibold text-gray-600 mb-2">
                  PAYMENT INFORMATION
                </h2>
                {displayInvoice.paymentMethods?.some(
                  (pm) => pm.type === "bank" && pm.isEnabled
                ) &&
                  paymentDetails.bankTransferDetails && (
                    <div>
                      <p className="text-sm font-medium mb-1">Bank Transfer</p>
                      <p className="text-sm whitespace-pre-line">
                        {paymentDetails.bankTransferDetails}
                      </p>
                    </div>
                  )}
                {displayInvoice.paymentMethods?.some(
                  (pm) => pm.type === "stripe" && pm.isEnabled
                ) && (
                    <div className="mt-3">
                      <p className="text-sm font-medium mb-1">Online Payment</p>
                      <p className="text-sm">
                        Payment can be made securely via credit card or online
                        banking.
                      </p>
                    </div>
                  )}
                {!displayInvoice.paymentMethods?.some((pm) => pm.isEnabled) && (
                  <p className="text-sm text-gray-500">
                    No payment method specified
                  </p>
                )}
              </div>
            )}
            <div className="text-center text-gray-600 text-sm mt-12">
              {displayInvoice.notes || ""}
            </div>
          </div>
        );
      case 'billy':
        return (
          <div className={`p-8 rounded-lg`}>
            <div className="max-w-xl mx-auto flex flex-col items-center">
              <h1 className="text-xl font-semibold mb-2 text-center text-gray-900">
                Invoice from {businessDetails.business_name || 'Your Company'}
              </h1>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-900">" {displayInvoice.items[0]?.description} "</span>
              </div>
              <div className="text-center text-sm text-gray-500 mb-2">Total amount</div>
              <div className="text-center text-3xl font-bold text-gray-900 mb-6">
                ${calculatedInvoice.total.toFixed(2)}
              </div>
              <div className="w-full bg-white rounded-lg p-6 mb-6 border border-gray-200 shadow">
                {/* Vertical info section */}
                <div className="flex flex-col gap-2 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">Status</span>
                    <span className="px-2 py-1 rounded bg-blue-600 text-white text-xs font-bold">
                      {displayInvoice.status?.toUpperCase() || 'DRAFT'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">Due</span>
                    <span className="text-gray-900">{formattedDueDate || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">Name</span>
                    <span className="text-gray-900">{displayInvoice.name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">Email</span>
                    <span className="text-gray-900">{displayInvoice.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">Details</span>
                    <span className="text-gray-900">{displayInvoice.details || 'N/A'}</span>
                  </div>
                </div>
                {/* Items Table */}
                <div className="grid grid-cols-4 text-gray-500 border-t border-gray-200 pt-4 font-medium">
                  <div>Description</div>
                  <div className="text-center">Quantity</div>
                  <div className="text-right">Unit price</div>
                  <div className="text-right">Total price</div>
                </div>

                {displayInvoice.items && displayInvoice.items.length > 0 ? (
                  displayInvoice.items.map((item) => (
                    <div key={item.id} className="grid grid-cols-4 py-2 text-sm text-gray-800 border-b border-gray-100">
                      <div>{item.description}</div>
                      <div className="text-center">{item.quantity}</div>
                      <div className="text-right">${item.unitPrice.toFixed(2)}</div>
                      <div className="text-right">${item.totalPrice.toFixed(2)}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-400">No items</div>
                )}
                <div className="grid grid-cols-4 pt-4 text-sm">
                  <div className="col-span-2"></div>
                  <div className="text-right text-gray-500">SubTotal</div>
                  <div className="text-right font-semibold">${calculatedInvoice.subtotal.toFixed(2)}</div>
                </div>

                <div className="grid grid-cols-4 text-sm">
                  <div className="col-span-2"></div>
                  <div className="text-right text-gray-500">Total</div>
                  <div className="text-right font-semibold">${calculatedInvoice.total.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className={containerClasses}>
        <div className="flex flex-col items-center">
          {isPdfView && (
            <div
              ref={pdfRef}
              className="p-8 bg-white text-black max-w-3xl w-full mx-auto"
              style={{
                minHeight: "720px",
                width: "832px",
                paddingBottom: "60px",
              }}
            >
              <div className="flex flex-col mb-12">
                <div className="mb-8 flex justify-between items-center">
                  <div className="flex items-center space-x-4 ">
                    {businessDetails.logo_url && (
                      <img
                        src={businessDetails.logo_url}
                        alt="Business logo"
                        className="h-14 w-14 mt-6 object-contain"
                      />
                    )}
                    <div>
                      <h1 className="text-2xl font-bold text-invoice-lightText">
                        {invoice.invoiceTitle || "Invoice"}
                      </h1>
                      <p className="text-sm text-gray-600">
                        Issued: {formattedIssueDate}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      Invoice# {invoice.invoiceNumber || "00000"}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="w-1/2">
                    <div className="mb-6">
                      <p className="text-sm text-gray-600 mb-1">Issued</p>
                      <p className="text-sm">{formattedIssueDate}</p>
                    </div>
                    <div className="mb-6">
                      <p className="text-sm text-gray-600 mb-1">From</p>
                      <p className="text-sm">{businessDetails.contact_name}</p>
                      <p className="text-sm">{businessDetails.email || "N/A"}</p>
                      <p className="text-sm">
                        {businessDetails.address &&
                          `${businessDetails.address}, `}
                        {businessDetails.city && `${businessDetails.city}, `}
                        {businessDetails.postal_code}
                      </p>
                    </div>
                  </div>
                  <div className="w-1/2 text-right">
                    <div className="mb-6">
                      <p className="text-sm text-gray-600 mb-1">Due</p>
                      <p className="text-sm">{formattedDueDate}</p>
                    </div>
                    <div className="mb-6">
                      <p className="text-sm text-gray-600 mb-1">Invoice For</p>
                      <p className="text-sm">{invoice.name || "N/A"}</p>
                      <p className="text-sm">{invoice.email || "N/A"}</p>
                      <p className="text-sm">{invoice.details || "N/A"}</p>

                    </div>
                  </div>
                </div>
              </div>
              <div className="mb-6">
                <div className="grid grid-cols-12 text-sm text-gray-600 border-b border-gray-200 pb-2 mb-4">
                  <div className="col-span-6">DESCRIPTION</div>
                  <div className="col-span-2 text-center">QUANTITY</div>
                  <div className="col-span-2 text-right">UNIT PRICE</div>
                  <div className="col-span-2 text-right">AMOUNT</div>
                </div>
                {invoice.items &&
                  invoice.items.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-12 text-sm py-3 border-b border-gray-200"
                    >
                      <div className="col-span-6">
                        <p>{item.description}</p>
                        {item.additionalInfo && (
                          <p className="text-xs text-gray-500">
                            {item.additionalInfo}
                          </p>
                        )}
                      </div>
                      <div className="col-span-2 text-center">
                        {item.quantity}
                      </div>
                      <div className="col-span-2 text-right">
                        ${item.unitPrice.toFixed(2)}
                      </div>
                      <div className="col-span-2 text-right">
                        ${item.totalPrice.toFixed(2)}
                      </div>
                    </div>
                  ))}
              </div>
              <div className="flex justify-end mb-6">
                <div className="w-1/3">
                  <div className="flex justify-between text-sm py-2">
                    <span>Subtotal</span>
                    <span>${calculatedInvoice.subtotal.toFixed(2)}</span>
                  </div>
                  {Array.isArray(calculatedInvoice.discounts) &&
                    calculatedInvoice.discounts.length > 0 &&
                    calculatedInvoice.discounts.map((discount, index) => (
                      <div
                        key={`discount-${discount.id || index}`}
                        className="flex justify-between text-sm py-2"
                      >
                        <span>Discount ({discount.rate.toFixed(0)}%)</span>
                        <span>${discount.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  {Array.isArray(calculatedInvoice.taxes) && calculatedInvoice.taxes.length > 0 ? (
                    calculatedInvoice.taxes.map((tax, index) => (
                      <div
                        key={`tax-${tax.id || index}`}
                        className="flex justify-between text-sm py-2"
                      >
                        <span>Tax ({tax.rate ? tax.rate.toFixed(0) : 0}%)</span>
                        <span>
                          ${tax.amount ? tax.amount.toFixed(2) : "0.00"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500"></div>
                  )}
                  <div className="flex justify-between font-bold text-sm border-t border-gray-300 pt-3 mb-12">
                    <span>Total</span>
                    <span>${calculatedInvoice.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              {invoice.showPaymentMethods !== false && (
                <div className="border-t border-gray-200 pt-4 mb-8">
                  <h2 className="text-sm font-semibold text-gray-600 mb-2">
                    PAYMENT INFORMATION
                  </h2>
                  {invoice.paymentMethods?.some(
                    (pm) => pm.type === "bank" && pm.isEnabled
                  ) &&
                    paymentDetails.bankTransferDetails && (
                      <div>
                        <p className="text-sm font-medium mb-1">Bank Transfer</p>
                        <p className="text-sm whitespace-pre-line">
                          {paymentDetails.bankTransferDetails}
                        </p>
                      </div>
                    )}
                  {invoice.paymentMethods?.some(
                    (pm) => pm.type === "stripe" && pm.isEnabled
                  ) && (
                      <div className="mt-3">
                        <p className="text-sm font-medium mb-1">Online Payment</p>
                        <p className="text-sm">
                          Payment can be made securely via credit card or online
                          banking.
                        </p>
                      </div>
                    )}
                  {!invoice.paymentMethods?.some((pm) => pm.isEnabled) && (
                    <p className="text-sm text-gray-500">
                      No payment method specified
                    </p>
                  )}
                </div>
              )}
              <div className="text-center text-gray-600 text-sm mt-12">
                {invoice.notes || ""}
              </div>
              <div className=" bottom-8 mt-32 left-0 right-0 flex items-center justify-center text-gray-400 text-xs">
                {userSubscription.tier !== "pro" && (
                  <div className="flex  items-center">
                    <span>Made with</span>
                    <div className="mx-1 font-medium text-blue-500" >
                      <Link to="https://invoicelly.me" target="_blank" rel="noopener noreferrer">invoicelly</Link>
                    </div>
                    <div className="bg-primary h-4 w-4 rounded flex items-center justify-center">
                      <div className="bg-gray-800 dark:bg-gray-200 h-2 w-2 rounded-r-full"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {!isPdfView && (
            <div
              ref={invoiceRef}
              className="p-8 max-w-3xl w-full mx-auto pb-24"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-4">
                  <h1
                    className={`text-2xl font-bold ${selectedTemplate
                      ? selectedTemplate.styles.accent
                      : "text-invoice-lightText dark:text-invoice-darkText"
                      }`}
                  ></h1>
                </div>
              </div>
              {renderInvoiceLayout(selectedTemplate)}
            </div>
          )}

          {/* Bottom Control Panel - Centered */}
          <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
            <div className="max-w-3xl mx-auto px-32 mr-64 py-3 flex items-center justify-end">
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
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 m-4 animate-modal-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Send Invoice
              </h2>
              <Button
                onClick={() => setShowEmailModal(false)}
                variant="ghost"
                className="h-9 w-9 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>

            {userSubscription.tier === "pro" ? (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Recipients
                    </label>
                    <div className="min-h-[42px] flex flex-wrap gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 focus-within:border-blue-500 dark:focus-within:border-blue-400">
                      {emailFormData.to.map((email, index) => (
                        <div
                          key={`to-${index}`}
                          className="inline-flex items-center bg-white dark:bg-gray-800 rounded-md px-2 py-1 text-sm border border-gray-200 dark:border-gray-700"
                        >
                          <span className="mr-1">{email}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveEmail(index, "to")}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <input
                        type="text"
                        onKeyDown={(e) => handleAddEmail(e, "to")}
                        placeholder="Add email address..."
                        className="flex-1 min-w-[120px] bg-transparent outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      CC
                    </label>
                    <div className="min-h-[42px] flex flex-wrap gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 focus-within:border-yellow-400 dark:focus-within:border-yellow-400">
                      {emailFormData.cc.map((email, index) => (
                        <div
                          key={`cc-${index}`}
                          className="inline-flex items-center bg-white dark:bg-gray-800 rounded-md px-2 py-1 text-sm border border-gray-200 dark:border-gray-700"
                        >
                          <span className="mr-1">{email}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveEmail(index, "cc")}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <input
                        type="text"
                        onKeyDown={(e) => handleAddEmail(e, "cc")}
                        placeholder="Add CC..."
                        className="flex-1 min-w-[120px] bg-transparent outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message
                    </label>
                    <textarea
                      value={emailFormData.message}
                      onChange={handleMessageChange}
                      rows={4}
                      className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 focus:border-yellow-400 dark:focus:border-yellow-400 focus:outline-none text-sm resize-none"
                      placeholder="Add a message to your invoice email..."
                    ></textarea>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={handleSendEmail}
                    disabled={sendingEmail || emailFormData.to.length === 0}
                    className="disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {sendingEmail ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Mail size={16} />
                        <span>Send Invoice</span>
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400 p-4 rounded-lg">
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>This feature is exclusive to Pro users.</span>
                </div>
                <Button
                  onClick={goToSubscription}
                  className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all duration-200"
                >
                  Upgrade to Pro
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
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
