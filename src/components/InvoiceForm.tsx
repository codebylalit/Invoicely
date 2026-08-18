import { useState, useEffect, useCallback, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { InvoiceDetails } from "./InvoiceDetails";
import { InvoiceItems } from "./InvoiceItems";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { Banknote, Sparkles, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RecurringInvoiceSettings } from "./RecurringInvoiceSettings";
import { CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useEntitlements } from "@/hooks/useEntitlements";

interface Invoice {
  id?: string;
  status: string;
  dueDate: string;
  name: string;
  email: string;
  details: string;
  items: InvoiceItem[];
  subtotal: number;
  total: number;
  fromCompany: string;
  invoiceNumber: string;
  invoiceTitle: string;
  issuedDate: string;
  notes: string;
  paymentMethods: PaymentMethod[];
  taxes: TaxItem[];
  discounts: DiscountItem[];
  showPaymentMethods?: boolean;
  is_recurring: boolean;
  recurrence_frequency?: 'weekly' | 'monthly' | 'custom';
  recurrence_interval?: number;
  recurrence_start_date?: string;
  recurrence_end_date?: string;
  template_id?: number | null;
  show_watermark?: boolean;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface TaxItem {
  id: string;
  name: string;
  rate: number;
  amount: number;
}

interface DiscountItem {
  id: string;
  name: string;
  rate: number;
  amount: number;
}

interface PaymentMethod {
  type: string;
  isEnabled: boolean;
  instructions?: string;
  connectURL?: string;
}

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
}

interface InvoiceFormProps {
  onGenerate?: (invoice: Invoice) => void;
  isLoading?: boolean;
  invoiceDraft?: Invoice | null;
  onDraftChange?: (draft: Invoice | null) => void;
  onSaved?: () => void;
  initialInvoice?: Invoice | null;
}

const generateInvoiceNumber = () => {
  return Math.floor(10000 + Math.random() * 90000).toString();
};

// Add the mockAiProcess function that was missing
// Advanced natural language parser for invoice generation
const mockAiProcess = (prompt: string): Invoice => {
  const currentDate = new Date();
  const dueDate = new Date();
  let dueDays = 30; // Default 30 days payment terms

  let clientName = "";
  let clientEmail = "";
  let clientDetails = "";
  let invoiceTitle = "Invoice";
  let notes = "";

  // 1. Extract email address
  const emailMatch = prompt.match(/(?:mailto:|\(|\[)?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(?:\)|\])?/i);
  if (emailMatch) {
    clientEmail = emailMatch[1].trim();
  }

  // 2. Extract due date / terms
  const dueDaysMatch = prompt.match(/(?:due|payable|payment|net)\s*(?:in|within|after)?\s*(\d+)\s*(?:days|day|d)?/i);
  if (dueDaysMatch) {
    dueDays = parseInt(dueDaysMatch[1], 10);
  } else if (/due\s+tomorrow/i.test(prompt)) {
    dueDays = 1;
  } else if (/due\s+(?:on\s+receipt|immediately|urgent)/i.test(prompt)) {
    dueDays = 0;
  } else if (/due\s+next\s+week/i.test(prompt)) {
    dueDays = 7;
  }
  dueDate.setDate(currentDate.getDate() + dueDays);

  // 3. Extract Client / Company Name
  const namePatterns = [
    /(?:bill\s+to|billed\s+to|client|customer|recipient|to)\s+([A-Za-z0-9\s.,&'-]+?)(?:\s*\(|\s*,|\s*email|\s*due|\s*for\s+\d|\s*\$|\s*₹|\s*rs|\s*inr|\s*$)/i,
    /(?:for)\s+([A-Z][A-Za-z0-9\s&'-]+?)(?:\s*\(|\s*,|\s*email|\s*due|\s*for|\s*\$|\s*₹|\s*rs|\s*inr|\s*$)/
  ];
  for (const pat of namePatterns) {
    const m = prompt.match(pat);
    if (m && m[1] && m[1].trim().length > 1 && !/^(an|a|the|invoice|bill|payment|services)$/i.test(m[1].trim())) {
      clientName = m[1].trim();
      break;
    }
  }

  // 4. Extract Tax (e.g., 18% GST, 10% tax)
  const taxes: TaxItem[] = [];
  const taxMatch = prompt.match(/(\d+(?:\.\d+)?)\%\s*(gst|vat|tax|sales tax)/i);
  if (taxMatch) {
    taxes.push({
      id: "tax_0",
      name: taxMatch[2].toUpperCase(),
      rate: parseFloat(taxMatch[1]),
      amount: 0,
    });
  }

  // 5. Extract Discount (e.g., 10% discount)
  const discounts: DiscountItem[] = [];
  const discountMatch = prompt.match(/(\d+(?:\.\d+)?)\%\s*(?:discount|off)/i);
  if (discountMatch) {
    discounts.push({
      id: "disc_0",
      name: "Discount",
      rate: parseFloat(discountMatch[1]),
      amount: 0,
    });
  }

  // 6. Extract Line Items (handles ₹, $, €, £, INR, Rs, comma-separated amounts)
  // Clean prompt helper for parsing numbers (convert 15,000 -> 15000)
  const parseNum = (str: string) => parseFloat(str.replace(/,/g, ""));

  const items: InvoiceItem[] = [];

  // Split prompt into candidate item clauses (separated by 'and', '+', ',', '\n', ';')
  const clauses = prompt.split(/(?:\band\b|\+|\n|;)/i);

  clauses.forEach((clause, index) => {
    // Match quantity & price patterns:
    // e.g., "2 logo designs at $150 each" OR "Web development ₹25,000" OR "5 hours @ Rs 500"
    const itemMatch = clause.match(
      /(?:(\d+)\s*(?:x|units?|hrs?|hours?|items?)?\s*(?:@|at)?\s*)?([A-Za-z0-9\s\-_/'.]+?)\s*(?:for|at|=|:|\$|₹|rs\.?|inr|usd|€|£)?\s*(?:(?:USD|\$|₹|Rs\.?|INR|EUR|€|GBP|£)\s*)?([\d,]+(?:\.\d{1,2})?)(?:\s*(?:each|per\s*item|per\s*hr|per\s*hour|total))?/i
    );

    if (itemMatch && itemMatch[3]) {
      const qty = itemMatch[1] ? parseInt(itemMatch[1], 10) : 1;
      const rawPrice = parseNum(itemMatch[3]);

      let desc = itemMatch[2]?.trim() || `Item ${index + 1}`;

      // Strip common non-item filler words from description
      desc = desc
        .replace(/^(invoice|bill|create|generate|send|charge|for|to|client|customer)\s+/i, "")
        .replace(/\s+(for|to|client|customer)$/i, "")
        .trim();

      if (desc.length > 0 && rawPrice > 0) {
        items.push({
          id: String(index),
          description: desc.charAt(0).toUpperCase() + desc.slice(1),
          quantity: qty,
          unitPrice: rawPrice,
          totalPrice: qty * rawPrice,
        });
      }
    }
  });

  // Fallback single item if clause splitter found nothing
  if (items.length === 0) {
    const singlePriceMatch = prompt.match(/(?:USD|\$|₹|Rs\.?|INR|EUR|€|GBP|£)\s*([\d,]+(?:\.\d{1,2})?)|([\d,]+(?:\.\d{1,2})?)\s*(?:USD|\$|₹|Rs\.?|INR|EUR|€|GBP|£)/i);
    const amount = singlePriceMatch ? parseNum(singlePriceMatch[1] || singlePriceMatch[2]) : 1000;

    let desc = prompt
      .replace(/(?:mailto:|\(|\[)?[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\)|\])?/gi, "")
      .replace(/(?:USD|\$|₹|Rs\.?|INR|EUR|€|GBP|£)\s*[\d,]+(?:\.\d{1,2})?/gi, "")
      .replace(/(?:due|payable|net)\s*[\w\s\d]+/gi, "")
      .replace(/(?:bill|billed|to|for|client|customer)\s+[A-Za-z0-9\s.,&'-]+/gi, "")
      .replace(/\s+/g, " ")
      .trim();

    items.push({
      id: "0",
      description: desc.length > 2 ? desc.charAt(0).toUpperCase() + desc.slice(1) : "Services Rendered",
      quantity: 1,
      unitPrice: amount,
      totalPrice: amount,
    });
  }

  const subtotal = items.reduce((sum, it) => sum + it.totalPrice, 0);

  // Recalculate tax & discount amounts
  taxes.forEach((t) => (t.amount = (t.rate / 100) * subtotal));
  discounts.forEach((d) => (d.amount = (d.rate / 100) * subtotal));

  const totalTax = taxes.reduce((s, t) => s + t.amount, 0);
  const totalDiscount = discounts.reduce((s, d) => s + d.amount, 0);
  const grandTotal = subtotal + totalTax - totalDiscount;

  return {
    status: "draft",
    dueDate: dueDate.toISOString().split("T")[0],
    name: clientName,
    email: clientEmail,
    details: clientDetails,
    items: items,
    subtotal: subtotal,
    total: grandTotal,
    fromCompany: "Your Company",
    invoiceNumber: generateInvoiceNumber(),
    invoiceTitle: invoiceTitle,
    issuedDate: currentDate.toISOString().split("T")[0],
    notes: notes,
    paymentMethods: [
      { type: "bank", isEnabled: true, instructions: "" },
      { type: "stripe", isEnabled: false, connectURL: "" },
    ],
    taxes: taxes,
    discounts: discounts,
    is_recurring: false,
  };
};

export const InvoiceForm = ({
  onGenerate,
  isLoading,
  invoiceDraft: propInvoiceDraft,
  onDraftChange,
  initialInvoice,
}: InvoiceFormProps) => {
  const activeDraft = propInvoiceDraft || initialInvoice || null;

  const [invoiceTitle, setInvoiceTitle] = useState(() => activeDraft?.invoiceTitle || "Invoice");
  const [invoiceNumber, setInvoiceNumber] = useState(() => activeDraft?.invoiceNumber || "");
  const [issuedDate, setIssuedDate] = useState(() => activeDraft?.issuedDate || new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(() => {
    if (activeDraft?.dueDate) return activeDraft.dueDate;
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split("T")[0];
  });
  const [customerName, setCustomerName] = useState(() => activeDraft?.name || "");
  const [customerEmail, setCustomerEmail] = useState(() => activeDraft?.email || "");
  const [customerDetails, setCustomerDetails] = useState(() => activeDraft?.details || "");
  const [items, setItems] = useState<InvoiceItem[]>(() => {
    if (activeDraft?.items && Array.isArray(activeDraft.items) && activeDraft.items.length > 0) {
      return activeDraft.items.map((it: any, idx: number) => {
        const q = Number(it.quantity) || 1;
        const rate = Number(it.unitPrice ?? it.rate ?? it.price ?? 0);
        const amt = Number(it.totalPrice ?? it.amount ?? (q * rate));
        return {
          id: String(it.id || idx),
          description: it.description || it.name || "Services Rendered",
          quantity: q,
          unitPrice: rate,
          totalPrice: amt,
        };
      });
    }
    return [{ id: "0", description: "", quantity: 1, unitPrice: 0, totalPrice: 0 }];
  });
  const [taxes, setTaxes] = useState<TaxItem[]>([]);
  const [discounts, setDiscounts] = useState<DiscountItem[]>([]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const itemTotal = Number(item.totalPrice) || (Number(item.quantity || 1) * Number(item.unitPrice || 0));
      return sum + itemTotal;
    }, 0);
  }, [items]);

  const total = useMemo(() => {
    const taxSum = taxes.reduce((s, t) => s + (Number(t.amount) || 0), 0);
    const discSum = discounts.reduce((s, d) => s + (Number(d.amount) || 0), 0);
    return subtotal + taxSum - discSum;
  }, [subtotal, taxes, discounts]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false);
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
  const [notes, setNotes] = useState("");
  const [paymentMethods, setPaymentMethods] = useState({
    bank: { enabled: false, instructions: "" },
    online: { enabled: false, url: "" },
  });
  const [promptText, setPromptText] = useState("");
  const [hasUsedPrompt, setHasUsedPrompt] = useState(false);
  const { isPro, tier } = useEntitlements();
  const userSubscription = useMemo(() => ({ tier }), [tier]);

  const supabase = useSupabaseClient();
  const session = useSession();
  const { toast } = useToast();
  const [paymentDetails, setPaymentDetails] = useState({
    bankTransferDetails: "",
    paymentMethod: null,
    paymentLink: "",
  });
  const [showPaymentInInvoice, setShowPaymentInInvoice] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<'weekly' | 'monthly' | 'custom'>('monthly');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [recurrenceStartDate, setRecurrenceStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');
  const [templateId, setTemplateId] = useState<number>(() => {
    const saved = activeDraft?.template_id;
    return (typeof saved === 'number' && !isNaN(saved)) ? saved : 0;
  });
  const [showWatermark, setShowWatermark] = useState<boolean>(() => activeDraft?.show_watermark ?? (isPro ? false : true));
  const [pageSize, setPageSize] = useState<'auto' | 'a4' | 'letter'>(() => {
    if (activeDraft?.page_size) return activeDraft.page_size;
    try {
      const saved = localStorage.getItem("invoicely_last_page_size") as any;
      if (saved === 'a4' || saved === 'letter' || saved === 'auto') return saved;
    } catch (_) {}
    return 'auto';
  });

  const generateCurrentInvoice = useCallback(() => {
    const effectiveIsRecurring = isPro ? isRecurring : false;
    return {
      id: activeDraft?.id,
      status: "draft",
      dueDate,
      name: customerName,
      email: customerEmail,
      details: customerDetails,
      items,
      subtotal,
      total,
      fromCompany: businessDetails.business_name || "Your Company",
      invoiceNumber,
      invoiceTitle,
      issuedDate,
      notes,
      paymentMethods: [
        {
          type: "bank",
          isEnabled: paymentMethods.bank.enabled,
          instructions: paymentDetails.bankTransferDetails,
        },
        {
          type: "stripe",
          isEnabled: paymentMethods.online.enabled,
          connectURL: paymentDetails.paymentLink,
        },
      ],
      taxes,
      discounts,
      showPaymentMethods: showPaymentInInvoice,
      is_recurring: effectiveIsRecurring,
      recurrence_frequency: effectiveIsRecurring ? recurrenceFrequency : undefined,
      recurrence_interval: effectiveIsRecurring ? recurrenceInterval : undefined,
      recurrence_start_date: effectiveIsRecurring ? recurrenceStartDate : undefined,
      recurrence_end_date: effectiveIsRecurring ? recurrenceEndDate || undefined : undefined,
      template_id: templateId,
      show_watermark: isPro ? showWatermark : true,
      page_size: pageSize,
    };
  }, [
    dueDate,
    customerName,
    customerEmail,
    customerDetails,
    items,
    subtotal,
    total,
    businessDetails.business_name,
    invoiceNumber,
    invoiceTitle,
    issuedDate,
    notes,
    paymentMethods,
    taxes,
    discounts,
    showPaymentInInvoice,
    isRecurring,
    recurrenceFrequency,
    recurrenceInterval,
    recurrenceStartDate,
    recurrenceEndDate,
    templateId,
    showWatermark,
    pageSize,
    userSubscription.tier,
    activeDraft?.id,
  ]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchBusinessDetails();
      fetchClients();
      fetchPaymentDetails();
    }
  }, [session]);

  // Pre-populate or reset form fields when activeDraft changes
  useEffect(() => {
    if (activeDraft) {
      setInvoiceTitle(activeDraft.invoiceTitle || "Invoice");
      setInvoiceNumber(activeDraft.invoiceNumber || generateInvoiceNumber());
      setIssuedDate(activeDraft.issuedDate || new Date().toISOString().split("T")[0]);
      setDueDate(activeDraft.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0]);
      setCustomerName(activeDraft.name || "");
      setCustomerEmail(activeDraft.email || "");
      setCustomerDetails(activeDraft.details || "");
      setNotes(activeDraft.notes || "");
      setIsRecurring(activeDraft.is_recurring ?? false);
      if (activeDraft.recurrence_frequency) setRecurrenceFrequency(activeDraft.recurrence_frequency as any);
      if (activeDraft.recurrence_interval) setRecurrenceInterval(activeDraft.recurrence_interval);
      if (activeDraft.recurrence_start_date) setRecurrenceStartDate(activeDraft.recurrence_start_date);
      if (activeDraft.template_id !== undefined && activeDraft.template_id !== null) {
        setTemplateId(Number(activeDraft.template_id) || 3);
      }
      if (activeDraft.show_watermark !== undefined) {
        setShowWatermark(activeDraft.show_watermark);
      }
      if (activeDraft.page_size) {
        setPageSize(activeDraft.page_size);
      }

      let rawItems = activeDraft.items;
      if (typeof rawItems === 'string') {
        try { rawItems = JSON.parse(rawItems); } catch (_) { rawItems = []; }
      }
      if (Array.isArray(rawItems) && rawItems.length > 0) {
        const parsedItems = rawItems.map((it: any, idx: number) => {
          const q = Number(it.quantity) || 1;
          const rate = Number(it.unitPrice ?? it.rate ?? it.price ?? 0);
          const amt = Number(it.totalPrice ?? it.amount ?? (q * rate));
          return {
            id: String(it.id || idx),
            description: it.description || it.name || "Services Rendered",
            quantity: q,
            unitPrice: rate,
            totalPrice: amt,
          };
        });
        setItems(parsedItems);
      }
    }
  }, [activeDraft?.id, activeDraft?.invoiceNumber, activeDraft?.template_id, activeDraft?.page_size]);

  // Update the invoice preview whenever form state changes
  useEffect(() => {
    // Always update the preview whenever form state changes, regardless of hasUsedPrompt
    const currentInvoice = generateCurrentInvoice();
    onGenerate?.(currentInvoice);

    // If we have draft saving functionality, update the draft
    if (onDraftChange) {
      onDraftChange(currentInvoice);
    }
  }, [
    invoiceTitle,
    invoiceNumber,
    issuedDate,
    dueDate,
    customerName,
    customerEmail,
    customerDetails,
    items,
    subtotal,
    total,
    notes,
    paymentMethods,
    taxes,
    discounts,
    showPaymentInInvoice,
    onGenerate,
    generateCurrentInvoice,
    onDraftChange,
  ]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchBusinessDetails();
      fetchClients();
      fetchPaymentDetails();
    }
  }, [session]);


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

        // Initialize payment methods based on fetched data
        setPaymentMethods({
          bank: {
            enabled: true,
            instructions: data.bank_transfer_details || ""
          },
          online: {
            enabled: !!data.payment_link,
            url: data.payment_link || ""
          },
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

  const fetchBusinessDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("business_details")
        .select("*")
        .eq("user_id", session?.user?.id)
        .maybeSingle();

      if (error) throw error;
      if (data) setBusinessDetails(data);
    } catch (error: any) {
      console.error("Error fetching business details:", error);
      toast({
        title: "Error",
        description: "Failed to load business details",
        variant: "destructive",
      });
    }
  };

  const fetchClients = async () => {
    try {
      if (!session?.user?.id) {
        console.warn("No user session found when fetching clients");
        return;
      }

      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setClients(data || []);
    } catch (error: any) {
      console.error("Error loading clients:", error);
      toast({
        title: "Error loading clients",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleClientSelect = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      setSelectedClient(client);
      setCustomerName(client.name || "");
      setCustomerEmail(client.email || "");
      setCustomerDetails(client.address || "");
    }
    setClientDropdownOpen(false);
  };

  const handleAIGenerate = () => {
    if (userSubscription.tier !== "pro") {
      toast({
        title: "Pro Feature",
        description:
          "AI-powered invoice generation is available for Pro users only",
        variant: "destructive",
      });
      return;
    }

    if (promptText.trim() === "") {
      toast({
        title: "Empty prompt",
        description: "Please enter a description to generate an invoice",
        variant: "destructive",
      });
      return;
    }

    try {
      const generatedInvoice = mockAiProcess(promptText);

      // Update form state with values from AI-generated invoice
      setInvoiceNumber(generatedInvoice.invoiceNumber);
      setInvoiceTitle(generatedInvoice.invoiceTitle);
      setIssuedDate(generatedInvoice.issuedDate);
      setDueDate(generatedInvoice.dueDate);
      setCustomerName(generatedInvoice.name);
      setCustomerEmail(generatedInvoice.email);
      setCustomerDetails(generatedInvoice.details);
      setItems(generatedInvoice.items);
      setNotes(generatedInvoice.notes);
      setPaymentMethods({
        bank: {
          enabled:
            generatedInvoice.paymentMethods.find((pm) => pm.type === "bank")
              ?.isEnabled || false,
          instructions: paymentMethods?.bank?.instructions || "",
        },
        online: {
          enabled:
            generatedInvoice.paymentMethods.find((pm) => pm.type === "stripe")
              ?.isEnabled || false,
          url: paymentMethods?.online?.url || "",
        },
      });

      // Set flag to enable real-time updates
      setHasUsedPrompt(true);

      // Generate current invoice
      const currentInvoice = {
        ...generatedInvoice,
        showPaymentMethods: showPaymentInInvoice,
        template_id: templateId,
      };

      onGenerate(currentInvoice);

      toast({
        title: "Invoice generated",
        description: "Your invoice has been successfully generated",
      });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Failed to generate invoice. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleItemChange = (
    id: string,
    field: string,
    value: string | number
  ) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === "quantity" || field === "unitPrice") {
            const quantity =
              field === "quantity" ? Number(value) : item.quantity;
            const unitPrice =
              field === "unitPrice" ? Number(value) : item.unitPrice;
            updatedItem.totalPrice = quantity * unitPrice;
          }
          return updatedItem;
        }
        return item;
      })
    );
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
    };
    setItems((prevItems) => [...prevItems, newItem]);
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) {
      toast({
        title: "Cannot remove item",
        description: "Invoice must have at least one item",
        variant: "destructive",
      });
      return;
    }
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const handleTaxChange = (
    id: string,
    field: string,
    value: string | number
  ) => {
    setTaxes((prevTaxes) =>
      prevTaxes.map((tax) => {
        if (tax.id === id) {
          const updatedTax = { ...tax, [field]: value };
          if (field === "rate") {
            updatedTax.amount = (Number(value) / 100) * subtotal;
          } else if (field === "amount") {
            updatedTax.rate =
              subtotal > 0 ? (Number(value) / subtotal) * 100 : 0;
          }
          return updatedTax;
        }
        return tax;
      })
    );
  };

  const handleDiscountChange = (
    id: string,
    field: string,
    value: string | number
  ) => {
    setDiscounts((prevDiscounts) =>
      prevDiscounts.map((discount) => {
        if (discount.id === id) {
          const updatedDiscount = { ...discount, [field]: value };
          if (field === "rate") {
            updatedDiscount.amount = (Number(value) / 100) * subtotal;
          } else if (field === "amount") {
            updatedDiscount.rate =
              subtotal > 0 ? (Number(value) / subtotal) * 100 : 0;
          }
          return updatedDiscount;
        }
        return discount;
      })
    );
  };

  const addTax = () => {
    setTaxes((prevTaxes) => [
      ...prevTaxes,
      { id: Date.now().toString(), name: "Tax", rate: 0, amount: 0 },
    ]);
  };

  const addDiscount = () => {
    setDiscounts((prevDiscounts) => [
      ...prevDiscounts,
      { id: Date.now().toString(), name: "Discount", rate: 0, amount: 0 },
    ]);
  };

  const removeTax = (id: string) => {
    setTaxes((prevTaxes) => prevTaxes.filter((tax) => tax.id !== id));
  };

  const removeDiscount = (id: string) => {
    setDiscounts((prevDiscounts) =>
      prevDiscounts.filter((discount) => discount.id !== id)
    );
  };

  function setActiveTab(arg0: string): void {
    throw new Error("Function not implemented.");
  }

  const navigate = useNavigate();

  const goToSubscription = () => {
    navigate("/app/settings?tab=subscription");
  };

  return (
    <div className="flex flex-col gap-6 p-2 rounded-lg w-full max-w-7xl mx-auto">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Generate with AI Prompt ✨</h2>
        <textarea
          className="w-full min-h-[100px] p-3 border rounded-md mb-4 dark:bg-gray-700 dark:border-gray-600 focus-within:border-primary outline-none"
          placeholder={
            userSubscription.tier === "pro"
              ? "Describe the work (e.g., '2 Logo designs @ ₹5,000 each and Web Dev for ₹25,000 to Rahul Corp (rahul@example.com) with 18% GST, due in 15 days')"
              : "Upgrade to Pro to use AI-powered natural language invoice generation"
          }
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          disabled={userSubscription.tier !== "pro"}
        />
        {userSubscription.tier === "pro" ? (
          <Button
            onClick={handleAIGenerate}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 py-3"
          >
            {isLoading ? "Generating..." : "Generate Invoice"}
          </Button>
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
              <span>
                AI-powered invoice generation is exclusive for Pro
                users.
              </span>
            </div>
            <Button
              onClick={goToSubscription}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-md w-full text-white"
            >
              Upgrade to Pro
            </Button>
          </div>
        )}
      </div>
      <InvoiceDetails
        invoiceTitle={invoiceTitle}
        setInvoiceTitle={setInvoiceTitle}
        invoiceNumber={invoiceNumber}
        setInvoiceNumber={setInvoiceNumber}
        issuedDate={issuedDate}
        setIssuedDate={setIssuedDate}
        dueDate={dueDate}
        setDueDate={setDueDate}
        customerName={customerName}
        setCustomerName={setCustomerName}
        customerEmail={customerEmail}
        setCustomerEmail={setCustomerEmail}
        customerDetails={customerDetails}
        setCustomerDetails={setCustomerDetails}
        businessDetails={businessDetails}
        clients={clients}
        selectedClient={selectedClient}
        handleClientSelect={handleClientSelect}
        clientDropdownOpen={clientDropdownOpen}
        setClientDropdownOpen={setClientDropdownOpen}
      />
      <InvoiceItems
        items={items}
        handleItemChange={handleItemChange}
        addItem={addItem}
        removeItem={removeItem}
        taxes={taxes}
        discounts={discounts}
        handleTaxChange={handleTaxChange}
        handleDiscountChange={handleDiscountChange}
        addTax={addTax}
        addDiscount={addDiscount}
        removeTax={removeTax}
        removeDiscount={removeDiscount}
        subtotal={subtotal}
        total={total}
      />
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Payment Methods</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Show in invoice
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={showPaymentInInvoice}
                onChange={() => setShowPaymentInInvoice(!showPaymentInInvoice)}
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-yellow-400"></div>
            </label>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          {/* Bank Transfer Option */}
          <div
            className={`p-5 border rounded-lg cursor-pointer transition-all duration-200 ${!showPaymentInInvoice
              ? "opacity-50 cursor-not-allowed"
              : paymentMethods.bank.enabled
                ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
                : "border-gray-200 dark:border-gray-700 hover:border-yellow-400 dark:hover:border-yellow-500"
              }`}
            onClick={() => {
              if (showPaymentInInvoice) {
                setPaymentMethods({
                  ...paymentMethods,
                  bank: {
                    ...paymentMethods.bank,
                    enabled: !paymentMethods.bank.enabled,
                  },
                });
              }
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-full flex items-center justify-center ${paymentMethods.bank.enabled
                  ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-800 dark:text-yellow-200"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                  }`}
              >
                <Banknote size={24} />
              </div>
              <div>
                <span className="font-medium text-gray-900 dark:text-gray-100">Bank Transfer</span>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Bank Details</p>
              </div>
            </div>
          </div>

          {/* Online Payment Link Option */}
          <div
            className={`p-5 border rounded-lg cursor-pointer transition-all duration-200 ${!showPaymentInInvoice
              ? "opacity-50 cursor-not-allowed"
              : paymentMethods.online.enabled
                ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
                : "border-gray-200 dark:border-gray-700 hover:border-yellow-400 dark:hover:border-yellow-500"
              }`}
            onClick={() => {
              if (showPaymentInInvoice) {
                setPaymentMethods({
                  ...paymentMethods,
                  online: {
                    ...paymentMethods.online,
                    enabled: !paymentMethods.online.enabled,
                  },
                });
              }
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-full flex items-center justify-center ${paymentMethods.online.enabled
                  ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-800 dark:text-yellow-200"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                  }`}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </div>
              <div>
                <span className="font-medium text-gray-900 dark:text-gray-100">Online Payment</span>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Payment Link</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Recurring Invoice Settings</h2>
        <RecurringInvoiceSettings
          isRecurring={isRecurring}
          onRecurringChange={setIsRecurring}
          frequency={recurrenceFrequency}
          onFrequencyChange={setRecurrenceFrequency}
          interval={recurrenceInterval}
          onIntervalChange={setRecurrenceInterval}
          startDate={recurrenceStartDate}
          onStartDateChange={setRecurrenceStartDate}
          endDate={recurrenceEndDate}
          onEndDateChange={setRecurrenceEndDate}
          isProUser={userSubscription.tier === "pro"}
        />
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Invoice Branding
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isPro
                  ? "Your invoices are completely white-label."
                  : "Upgrade to Pro to remove Invoicely branding."}
              </p>
            </div>
          </div>

          {isPro ? (
            <div className="flex items-center gap-2">
              <Switch
                id="watermark-toggle"
                checked={showWatermark}
                onCheckedChange={setShowWatermark}
              />
              <Label htmlFor="watermark-toggle" className="text-sm font-medium cursor-pointer text-gray-800 dark:text-gray-200 select-none">
                Invoicely branding [{showWatermark ? "ON" : "OFF"}]
              </Label>
            </div>
          ) : (
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => {
                toast({
                  title: "Pro Feature",
                  description: "Upgrade to Pro to remove Invoicely branding.",
                  variant: "default",
                });
              }}
            >
              <Switch id="watermark-toggle" checked={true} disabled />
              <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20 text-xs font-semibold gap-1">
                <Lock className="w-3 h-3" /> ON 🔒
              </Badge>
            </div>
          )}
        </div>

        {!isPro && (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/60 rounded-md flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <span>Upgrade to Pro to remove Invoicely branding.</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={goToSubscription}
              className="h-7 text-xs border-amber-400 text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40 font-medium"
            >
              Upgrade to Pro
            </Button>
          </div>
        )}
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Notes</h2>
        <textarea
          className="w-full min-h-[100px] p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 outline-none focus-within:border-yellow-400"
          placeholder="Add any additional notes or payment terms..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
    </div>
  );
};

export default InvoiceForm;
