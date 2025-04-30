import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { InvoiceDetails } from "./InvoiceDetails";
import { InvoiceItems } from "./InvoiceItems";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { Banknote } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";

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
  dueDate.setDate(currentDate.getDate() + 30); // Default to 30 days

  let clientName = "";
  let clientEmail = "";
  let amount = 0;
  let description = prompt;

  // Extract email address
  const emailMatch = prompt.match(/\(([^\)]+@[^\)]+)\)/);
  if (emailMatch) {
    clientEmail = emailMatch[1].trim();
    // Remove the email part from the prompt for further processing
    description = prompt.replace(emailMatch[0], "");
  }

  // Extract client name (assuming it's before the email)
  const nameMatch = description.match(
    /for\s+([A-Za-z\s]+?)(?:\s*,|\s*\(|\s*$)/i
  );
  if (nameMatch) {
    clientName = nameMatch[1].trim();
    // Extract the description (everything before "for [name]")
    const descParts = description.split(/for\s+[A-Za-z\s]+/i);
    if (descParts.length > 0) {
      description = descParts[0].trim();
    }
  }

  // Extract amount
  const amountMatch = prompt.match(/\$(\d+(\.\d{1,2})?)/);
  if (amountMatch) {
    amount = parseFloat(amountMatch[1]);
  }

  // Extract due date
  const dueDaysMatch = prompt.match(/due\s+in\s+(\d+)\s+days/i);
  if (dueDaysMatch) {
    const days = parseInt(dueDaysMatch[1]);
    dueDate.setDate(currentDate.getDate() + days);
  }

  return {
    status: "draft",
    dueDate: dueDate.toISOString().split("T")[0],
    name: clientName,
    email: clientEmail,
    details: "",
    items: [
      {
        id: "0",
        description: description,
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
    stripe: { enabled: false, connectURL: "" },
  });
  const [promptText, setPromptText] = useState("");
  const [hasUsedPrompt, setHasUsedPrompt] = useState(false);

  const supabase = useSupabaseClient();
  const session = useSession();
  const { toast } = useToast();
  const [paymentDetails, setPaymentDetails] = useState({
    bankTransferDetails: "",
    paymentMethod: null,
  });
  const [showPaymentInInvoice, setShowPaymentInInvoice] = useState(true);

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
          instructions: paymentMethods.bank.instructions,
        },
        {
          type: "stripe",
          isEnabled: paymentMethods.stripe.enabled,
          connectURL: paymentMethods.stripe.connectURL,
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
      setShowPaymentInInvoice(true);

      // Set flag to enable real-time updates
      setHasUsedPrompt(true);

      // Generate current invoice
      const currentInvoice = {
        ...generatedInvoice,
        showPaymentMethods: true,
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
          className="w-full min-h-[100px] p-3 border rounded-md mb-4 dark:bg-gray-700 dark:border-gray-600"
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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Payment Methods</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Show in invoice
            </span>
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={showPaymentInInvoice}
                  onChange={() =>
                    setShowPaymentInInvoice(!showPaymentInInvoice)
                  }
                />
                <div
                  className={`block w-10 h-5 rounded-full transition ${showPaymentInInvoice
                    ? "bg-blue-600"
                    : "bg-gray-300 dark:bg-gray-600"
                    }`}
                ></div>
                <div
                  className={`absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition transform ${showPaymentInInvoice ? "translate-x-5" : "translate-x-0"
                    }`}
                ></div>
              </div>
            </label>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 max-w-md">
          {/* Bank Transfer Option */}
          <div
            className={`p-4 border rounded-md cursor-pointer transition-all h-full ${paymentMethods.bank.enabled
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : "border-gray-300 hover:border-gray-400"
              }`}
            onClick={() =>
              setPaymentMethods({
                ...paymentMethods,
                bank: {
                  ...paymentMethods.bank,
                  enabled: !paymentMethods.bank.enabled,
                },
              })
            }
          >
            <div className="flex flex-col items-center gap-2">
              <div
                className={`p-3 rounded-full flex items-center justify-center h-12 w-12 ${paymentMethods.bank.enabled
                  ? "bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-200"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                  }`}
              >
                <Banknote size={24} />
              </div>
              <span className="font-medium">Bank Transfer</span>
            </div>
          </div>

          {/* Stripe Option */}
          <div
            className={`p-4 border rounded-md cursor-pointer transition-all h-full ${paymentMethods.stripe.enabled
              ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
              : "border-gray-300 hover:border-gray-400"
              }`}
            onClick={() =>
              setPaymentMethods({
                ...paymentMethods,
                stripe: {
                  ...paymentMethods.stripe,
                  enabled: !paymentMethods.stripe.enabled,
                },
              })
            }
          >
            <div className="flex flex-col items-center gap-2">
              <div
                className={`p-3 rounded-full flex items-center justify-center h-12 w-12 ${paymentMethods.stripe.enabled
                  ? "bg-purple-100 dark:bg-purple-800"
                  : "bg-gray-100 dark:bg-gray-700"
                  }`}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 32 32"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15.338 14.258c0-1.088.904-1.5 2.385-1.5 1.977 0 4.65.6 6.702 1.65V9.042c-2.227-.894-4.417-1.235-6.7-1.235-5.464 0-9.1 2.85-9.1 7.236 0 7.115 9.79 5.971 9.79 9.044 0 1.19-1.033 1.578-2.486 1.578-2.152 0-4.907-.883-7.094-2.071v5.435c2.412 1.065 4.85 1.514 7.092 1.514 5.567 0 9.343-2.75 9.343-7.21-.026-7.35-9.932-6-9.932-9.075z"
                    fill={paymentMethods.stripe.enabled ? "#6772e5" : "#6B7280"}
                    fillRule="evenodd"
                  />
                </svg>
              </div>
              <span className="font-medium">Stripe</span>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Notes</h2>
        <textarea
          className="w-full min-h-[100px] p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          placeholder="Add any additional notes or payment terms..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
    </div>
  );
};

export default InvoiceForm;
