import React, { useState, useRef, useEffect } from "react";
import { FileText, Download, Mail } from "lucide-react";
import {
  TemplateSelectionModal,
  invoiceTemplates,
  InvoiceTemplate,
} from "./InvoiceTemp";
import { useToast } from "@/hooks/use-toast";
import { Invoice } from "@/types/invoice";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useSession } from "@supabase/auth-helpers-react";
import emailjs from "@emailjs/browser";
import { useNavigate } from "react-router-dom";

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
    useState<InvoiceTemplate | null>(null);
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
    notes: "",
    showPaymentMethods: true,
    paymentMethods: [
      { type: "bank", isEnabled: true },
      { type: "stripe", isEnabled: false },
    ],
    taxes: [],
    discounts: [],
  };

  // Use the provided invoice or default to an empty one
  const displayInvoice = invoice || defaultInvoice;

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
      const fileName = `invoices/${session.user.id}/${
        displayInvoice?.invoiceNumber || "invoice"
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
                <td style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">${
                  item.description
                }</td>
                <td style="text-align: center; padding: 8px; border-bottom: 1px solid #ddd;">${
                  item.quantity
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
        subject: `Invoice #${displayInvoice?.invoiceNumber || ""} from ${
          businessDetails.business_name || "Your Business"
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
                `${item.description} (Qty: ${
                  item.quantity
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
        title: "Success",
        description: `Invoice sent to ${recipientEmail}`,
        variant: "default",
      });

      setShowEmailModal(false);
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Error",
        description: `Failed to send email: ${
          error.message || "Unknown error"
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

  const containerClasses = `bg-white dark:bg-invoice-darkBg p-6 rounded-md shadow-sm w-full h-full overflow-auto ${
    isPdfView ? "pdf-view-mode" : ""
  } ${selectedTemplate ? selectedTemplate.styles.font : ""} ${
    selectedTemplate ? selectedTemplate.styles.background : ""
  }`;

  return (
    <>
      <div className={containerClasses}>
        {!isPdfView && (
          <div
            ref={invoiceRef}
            className="p-8 max-w-3xl mx-auto relative pb-16"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-4">
                <h1
                  className={`text-2xl font-bold ${
                    selectedTemplate
                      ? selectedTemplate.styles.accent
                      : "text-invoice-lightText dark:text-invoice-darkText"
                  }`}
                ></h1>
              </div>
              <Button
                onClick={openTemplateSelection}
                variant="outline"
                className="text-sm"
              >
                Change Template
              </Button>
            </div>
            <div className="flex flex-col mb-12">
              <div className="mb-8 flex justify-between items-center">
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
                    <p className="text-sm">{businessDetails.contact_name}</p>
                    <p className="text-sm">
                      {businessDetails.address &&
                        `${businessDetails.address}, `}
                      {businessDetails.city && `${businessDetails.city}, `}
                      {businessDetails.postal_code}
                    </p>
                    <p className="text-sm">{businessDetails.email || "N/A"}</p>
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
                    <p className="text-sm">{displayInvoice.details || "N/A"}</p>
                    <p className="text-sm">{displayInvoice.email || "N/A"}</p>
                  </div>
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
                  <span>${displayInvoice.subtotal.toFixed(2)}</span>
                </div>
                {Array.isArray(displayInvoice.discounts) &&
                  displayInvoice.discounts.length > 0 &&
                  displayInvoice.discounts.map((discount, index) => (
                    <div
                      key={`discount-${discount.id || index}`}
                      className="flex justify-between text-sm py-2"
                    >
                      <span>Discount ({discount.rate.toFixed(0)}%)</span>
                      <span>-${discount.amount.toFixed(2)}</span>
                    </div>
                  ))}
                {Array.isArray(displayInvoice.taxes) &&
                displayInvoice.taxes.length > 0 ? (
                  displayInvoice.taxes.map((tax, index) => (
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
                  <div className="text-sm text-gray-500">No taxes applied</div>
                )}
                <div className="flex justify-between font-bold text-sm border-t border-gray-300 pt-2 mt-2">
                  <span>Total</span>
                  <span>${displayInvoice.total.toFixed(2)}</span>
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
        )}

        {isPdfView && (
          <div
            ref={pdfRef}
            className="p-8 bg-white text-black max-w-3xl mx-auto relative"
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
                    <p className="text-sm">
                      {businessDetails.address &&
                        `${businessDetails.address}, `}
                      {businessDetails.city && `${businessDetails.city}, `}
                      {businessDetails.postal_code}
                    </p>
                    <p className="text-sm">{businessDetails.email || "N/A"}</p>
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
                    <p className="text-sm">{invoice.details || "N/A"}</p>
                    <p className="text-sm">{invoice.email || "N/A"}</p>
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
                  <span>${invoice.subtotal.toFixed(2)}</span>
                </div>
                {Array.isArray(invoice.discounts) &&
                  invoice.discounts.length > 0 &&
                  invoice.discounts.map((discount, index) => (
                    <div
                      key={`discount-${discount.id || index}`}
                      className="flex justify-between text-sm py-2"
                    >
                      <span>Discount ({discount.rate.toFixed(0)}%)</span>
                      <span>${discount.amount.toFixed(2)}</span>
                    </div>
                  ))}
                {Array.isArray(invoice.taxes) && invoice.taxes.length > 0 ? (
                  invoice.taxes.map((tax, index) => (
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
                  <div className="text-sm text-gray-500">No taxes applied</div>
                )}
                <div className="flex justify-between font-bold text-sm border-t border-gray-300 pt-3 mb-12">
                  <span>Total</span>
                  <span>${invoice.total.toFixed(2)}</span>
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
            <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center text-gray-400 text-xs">
              {userSubscription.tier !== "pro" && (
                <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center text-gray-400 text-xs">
                  <div className="flex items-center">
                    <span>Made with</span>
                    <div className="mx-1 font-medium text-blue-500">
                      Invoicely
                    </div>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-blue-500"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {!isPdfView && (
          <div className="mt-8 flex justify-center gap-4 w-full">
            <button
              onClick={handleDownloadPDF}
              disabled={loading}
              className="flex items-center justify-center gap-2 invoice-btn-secondary w-1/2 py-3"
            >
              <Download size={16} />
              {loading ? "Generating..." : "Download PDF"}
            </button>
            {showSendByEmail && (
              <button
                onClick={handleSendByEmail}
                disabled={loading}
                className="flex items-center justify-center gap-2 invoice-btn-primary w-1/2 py-3"
              >
                <Mail size={16} />
                Send by Email
              </button>
            )}
          </div>
        )}
      </div>
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6 max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold dark:text-white">
                Send Invoice via email
              </h2>
              <button
                onClick={() => setShowEmailModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Securely send your invoice via email. Use comma to add several
              recipients to your email
            </p>

            {userSubscription.tier === "pro" ? (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email to
                  </label>
                  <div className="flex flex-wrap gap-1 p-2 border rounded-md focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400">
                    {emailFormData.to.map((email, index) => (
                      <div
                        key={`to-${index}`}
                        className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-md px-2 py-1"
                      >
                        <span className="text-sm mr-1">{email}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveEmail(index, "to")}
                          className="text-gray-500 hover:text-red-500"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <input
                      type="text"
                      onKeyDown={(e) => handleAddEmail(e, "to")}
                      placeholder="Add recipient..."
                      className="flex-grow outline-none min-w-[150px] p-1 bg-transparent"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    CC
                  </label>
                  <div className="flex flex-wrap gap-1 p-2 border rounded-md focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400">
                    {emailFormData.cc.map((email, index) => (
                      <div
                        key={`cc-${index}`}
                        className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-md px-2 py-1"
                      >
                        <span className="text-sm mr-1">{email}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveEmail(index, "cc")}
                          className="text-gray-500 hover:text-red-500"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <input
                      type="text"
                      onKeyDown={(e) => handleAddEmail(e, "cc")}
                      placeholder="Add CC..."
                      className="flex-grow outline-none min-w-[150px] p-1 bg-transparent"
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    value={emailFormData.message}
                    onChange={handleMessageChange}
                    rows={4}
                    className="w-full p-2 border rounded-md focus:border-blue-400 focus:ring-1 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Enter your message..."
                  ></textarea>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleSendEmail}
                    disabled={sendingEmail || emailFormData.to.length === 0}
                    className="invoice-btn-primary text-white font-medium py-2 px-6 rounded-md disabled:opacity-50"
                  >
                    {sendingEmail ? "Sending..." : "Send Now"}
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400 p-3 rounded-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>This feature is exclusive to Pro users.</span>
                </div>
                <button
                  onClick={goToSubscription}
                  className="flex items-center justify-center gap-2 invoice-btn-primary text-white py-3 px-4 rounded-md w-full"
                >
                  Upgrade to Pro
                </button>
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
      <div className="justify-center align-center text-center items-center">
        <div className="flex justify-center mt-4">
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={isPdfView}
                onChange={toggleViewMode}
              />
              <div
                className={`block w-10 h-5 rounded-full transition ${
                  isPdfView ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                }`}
              ></div>
              <div
                className={`absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition transform ${
                  isPdfView ? "translate-x-5" : "translate-x-0"
                }`}
              ></div>
            </div>
            <div className="ml-2 text-sm flex items-center gap-1">
              <FileText
                size={16}
                className={`${isPdfView ? "text-blue-500" : "text-gray-500"}`}
              />
              <span className={`${isPdfView ? "font-medium" : ""}`}>
                {isPdfView ? "PDF View" : "Edit Preview"}
              </span>
            </div>
          </label>
        </div>
      </div>
      <style jsx>{`
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
      `}</style>
    </>
  );
};

export default InvoicePreview;
