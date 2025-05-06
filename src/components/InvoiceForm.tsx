import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { InvoiceDetails } from "./InvoiceDetails";
import { InvoiceItems } from "./InvoiceItems";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { Banknote } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface Invoice {
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
  onGenerate: (invoice: Invoice) => void;
  isLoading: boolean;
  invoiceDraft?: Invoice | null;
  onDraftChange?: (draft: Invoice | null) => void;
}

const generateInvoiceNumber = () => {
  return Math.floor(10000 + Math.random() * 90000).toString();
};

// Add the mockAiProcess function that was missing
const mockAiProcess = (prompt: string): Invoice => {
  // Mock AI processing for invoice generation
  const currentDate = new Date();
  const dueDate = new Date();
  dueDate.setDate(currentDate.getDate() + 0); // Default to 30 days

  let clientName = "";
  let clientEmail = "";
  let amount = 0;
  let description = prompt;

  // Extract email address - more flexible pattern
  const emailMatch = prompt.match(/(?:\(|\[)?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(?:\)|\])?/);
  if (emailMatch) {
    clientEmail = emailMatch[1].trim();
    // Remove the email part from the prompt for further processing
    description = prompt.replace(emailMatch[0], "").trim();
  }

  // Extract amount - more flexible pattern
  const amountMatch = prompt.match(/(?:USD|$|€|£)?\s*(\d+(?:\.\d{1,2})?)/i);
  if (amountMatch) {
    amount = parseFloat(amountMatch[1]);
    // Remove the amount part from the description
    description = description.replace(amountMatch[0], "").trim();
  }

  // Extract client name - more flexible pattern
  const nameMatch = description.match(/(?:for|to|client|customer)\s+([A-Za-z\s]+?)(?:\s*,|\s*\(|\s*$|\s*\[|\s*\]|\s*\-)/i);
  if (nameMatch) {
    clientName = nameMatch[1].trim();
    // Extract the description (everything before the name pattern)
    const descParts = description.split(/(?:for|to|client|customer)\s+[A-Za-z\s]+/i);
    if (descParts.length > 0) {
      description = descParts[0].trim();
    }
  }

  // Extract due date - more flexible pattern
  const dueDaysMatch = prompt.match(/(?:due|payment|payable)\s+(?:in|after|within)?\s*(\d+)\s*(?:days|day|d)?/i);
  if (dueDaysMatch) {
    const days = parseInt(dueDaysMatch[1]);
    dueDate.setDate(currentDate.getDate() + days);
  }

  // Clean up description
  description = description
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/^\s+|\s+$/g, '') // Trim whitespace
    .replace(/[.,]$/, ''); // Remove trailing punctuation

  return {
    status: "draft",
    dueDate: dueDate.toISOString().split("T")[0],
    name: clientName,
    email: clientEmail,
    details: "",
    items: [
      {
        id: "0",
        description: description || "Service provided",
        quantity: 1,
        unitPrice: amount,
        totalPrice: amount,
      },
    ],
    subtotal: amount,
    total: amount,
    fromCompany: "Your Company",
    invoiceNumber: generateInvoiceNumber(),
    invoiceTitle: "Invoice",
    issuedDate: currentDate.toISOString().split("T")[0],
    notes: "",
    paymentMethods: [
      {
        type: "bank",
        isEnabled: true,
        instructions: "",
      },
      {
        type: "stripe",
        isEnabled: false,
        connectURL: "",
      },
    ],
    taxes: [],
    discounts: [],
  };
};

export const InvoiceForm = ({
  onGenerate,
  isLoading,
  invoiceDraft,
  onDraftChange,
}: InvoiceFormProps) => {
  const [invoiceTitle, setInvoiceTitle] = useState("Invoice");
  const [invoiceNumber, setInvoiceNumber] = useState(generateInvoiceNumber());
  const [issuedDate, setIssuedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dueDate, setDueDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split("T")[0];
  });
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerDetails, setCustomerDetails] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: "0", description: "", quantity: 1, unitPrice: 0, totalPrice: 0 },
  ]);
  const [taxes, setTaxes] = useState<TaxItem[]>([]);
  const [discounts, setDiscounts] = useState<DiscountItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);
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

  const supabase = useSupabaseClient();
  const session = useSession();
  const { toast } = useToast();
  const [paymentDetails, setPaymentDetails] = useState({
    bankTransferDetails: "",
    paymentMethod: null,
    paymentLink: "",
  });
  const [showPaymentInInvoice, setShowPaymentInInvoice] = useState(false);

  // Create current invoice object based on form state
  const generateCurrentInvoice = useCallback(() => {
    return {
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
  ]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchBusinessDetails();
      fetchClients();
      fetchPaymentDetails();
    }
  }, [session]);

  // Update the invoice preview whenever form state changes
  useEffect(() => {
    // Always update the preview whenever form state changes, regardless of hasUsedPrompt
    const currentInvoice = generateCurrentInvoice();
    onGenerate(currentInvoice);

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

  const [userSubscription, setUserSubscription] = useState({
    tier: "free", // Default to free
  });

  // Add this to your useEffect that fetches user data:
  useEffect(() => {
    if (session?.user?.id) {
      fetchBusinessDetails();
      fetchClients();
      fetchPaymentDetails();
      fetchUserSubscription(); // Add this line to fetch subscription
    }
  }, [session]);

  // Add this function to fetch the user's subscription:
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
  // Recalculate totals whenever items, taxes, or discounts change
  useEffect(() => {
    const newSubtotal = items.reduce(
      (sum, item) => sum + (item.totalPrice || 0),
      0
    );
    setSubtotal(newSubtotal);

    const updatedTaxes = taxes.map((tax) => ({
      ...tax,
      amount: (tax.rate / 100) * newSubtotal,
    }));
    setTaxes(updatedTaxes);

    const updatedDiscounts = discounts.map((discount) => ({
      ...discount,
      amount: (discount.rate / 100) * newSubtotal,
    }));
    setDiscounts(updatedDiscounts);

    const taxAmount = updatedTaxes.reduce(
      (sum, tax) => sum + (tax.amount || 0),
      0
    );
    const discountAmount = updatedDiscounts.reduce(
      (sum, discount) => sum + (discount.amount || 0),
      0
    );

    setTotal(newSubtotal + taxAmount - discountAmount);
  }, [items, taxes.length, discounts.length]);

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
        .single();

      if (error && error.code !== "PGRST116") throw error;
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
      setSubtotal(generatedInvoice.subtotal);
      setTotal(generatedInvoice.total);
      setNotes(generatedInvoice.notes);
      setPaymentMethods({
        bank: {
          enabled:
            generatedInvoice.paymentMethods.find((pm) => pm.type === "bank")
              ?.isEnabled || false,
          instructions: paymentMethods.bank.instructions,
        },
        stripe: {
          enabled:
            generatedInvoice.paymentMethods.find((pm) => pm.type === "stripe")
              ?.isEnabled || false,
          connectURL: paymentMethods.stripe.connectURL,
        },
      });

      // Set flag to enable real-time updates
      setHasUsedPrompt(true);

      // Generate current invoice
      const currentInvoice = {
        ...generatedInvoice,
        showPaymentMethods: showPaymentInInvoice,
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
        <h2 className="text-lg font-semibold mb-4">Generate with Promt</h2>
        <textarea
          className="w-full min-h-[100px] p-3 border rounded-md mb-4 dark:bg-gray-700 dark:border-gray-600 focus-within:border-yellow-400 outline-none"
          placeholder={
            userSubscription.tier === "pro"
              ? "Describe the work done and we'll generate an invoice (e.g., 'Website development for John Smith (john@example.com) - $500, due in 30 days')"
              : "Upgrade to Pro to use AI-powered invoice generation"
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
