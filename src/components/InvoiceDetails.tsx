import { Calendar, User, Mail, FileText, Check, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
}

interface InvoiceDetailsProps {
  invoiceTitle: string;
  setInvoiceTitle: (title: string) => void;
  invoiceNumber: string;
  setInvoiceNumber: (number: string) => void;
  issuedDate: string;
  setIssuedDate: (date: string) => void;
  dueDate: string;
  setDueDate: (date: string) => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  customerEmail: string;
  setCustomerEmail: (email: string) => void;
  customerDetails: string;
  setCustomerDetails: (details: string) => void;
  businessDetails: any;
  clients: Client[];
  selectedClient: Client | null;
  handleClientSelect: (clientId: string) => void;
  clientDropdownOpen: boolean;
  setClientDropdownOpen: (open: boolean) => void;
}

export const InvoiceDetails = ({
  invoiceTitle,
  setInvoiceTitle,
  invoiceNumber,
  setInvoiceNumber,
  issuedDate,
  setIssuedDate,
  dueDate,
  setDueDate,
  customerName,
  setCustomerName,
  customerEmail,
  setCustomerEmail,
  customerDetails,
  setCustomerDetails,
  businessDetails,
  clients,
  selectedClient,
  handleClientSelect,
  clientDropdownOpen,
  setClientDropdownOpen,
}: InvoiceDetailsProps) => {
  const navigate = useNavigate();
  const [clientSuggestions, setClientSuggestions] = useState<Client[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Check if business details are complete
  const isBusinessDetailsComplete = () => {
    const requiredFields = {
      contact_name: businessDetails?.contact_name,
      email: businessDetails?.email,
      address: businessDetails?.address,
      // city: businessDetails?.city,
      // postal_code: businessDetails?.postal_code,
      // region_state: businessDetails?.region_state,
      // country: businessDetails?.country,
      // phone_number: businessDetails?.phone_number
    };

    // Log missing fields for debugging
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      console.log('Missing business details fields:', missingFields);
    }

    return Object.values(requiredFields).every(value => value);
  };

  // Filter clients as user types in the name field
  useEffect(() => {
    if (customerName.trim() === "") {
      setClientSuggestions([]);
      return;
    }

    const filteredClients = clients.filter((client) =>
      client.name.toLowerCase().includes(customerName.toLowerCase())
    );

    setClientSuggestions(filteredClients);
  }, [customerName, clients]);

  // Handle client selection from the suggestions
  const selectClient = (client: Client) => {
    setCustomerName(client.name);
    setCustomerEmail(client.email || "");

    let details = "";
    if (client.company) details += client.company + "\n";
    if (client.address) details += client.address + "\n";
    if (client.phone) details += client.phone;

    setCustomerDetails(details.trim());
    setShowSuggestions(false);

    // Set selected client in parent component
    handleClientSelect(client.id);
  };

  return (
    <>
      {/* Invoice Header Section */}
      <div className="bg-white dark:bg-invoice-darkBg p-6 rounded-lg dark:border-gray-700">
        <h2 className="invoice-section-title mb-2 text-invoice-lightText dark:text-invoice-darkText font-bold text-lg">
          Invoice Details
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-invoice-lightText dark:text-invoice-darkText mb-2">
              Invoice title
            </label>
            <input
              type="text"
              className="invoice-input w-full p-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus-within:border-yellow-400"
              value={invoiceTitle}
              onChange={(e) => setInvoiceTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-invoice-lightText dark:text-invoice-darkText mb-2">
              Invoice number
            </label>
            <input
              type="text"
              className="invoice-input w-full p-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus-within:border-yellow-400"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* From and Billed To */}
      <div className="bg-white dark:bg-invoice-darkBg p-6 rounded-lg dark:border-gray-700">
        <h2 className="invoice-section-title mb-4 text-invoice-lightText dark:text-invoice-darkText font-bold text-lg">
          Parties
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {/* From Section */}
          {!isBusinessDetailsComplete() ? (
            <div className="p-6 border-2 border-primary/20 rounded-lg space-y-4 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10 dark:bg-primary/20">
                  <Settings className="text-primary" size={20} />
                </div>
                <h3 className="text-lg font-semibold text-invoice-lightText dark:text-invoice-darkText">
                  Business Details Required
                </h3>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  To create professional invoices, you need to add your business details first. This information will be automatically used in all your invoices.
                </p>
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => navigate('/app/settings')}
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white"
                  >
                    <Settings size={16} />
                    Go to Settings
                  </Button>
                  {/* <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    <p className="font-medium">Required Information:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      <li>Contact Name</li>
                      <li>Email Address</li>
                      <li>Business Address</li>
                      <li>City & Postal Code</li>
                      <li>Region/State</li>
                      <li>Country</li>
                      <li>Phone Number</li>
                    </ul>
                  </div> */}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md space-y-3">
              <h3 className="invoice-section-title text-invoice-lightText dark:text-invoice-darkText font-semibold">
                From
              </h3>
              <div className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                <p className="font-medium">{businessDetails.business_name}</p>
                <p>{businessDetails.email}</p>
                <p>
                  {businessDetails.address}, {businessDetails.city},{" "}
                  {businessDetails.postal_code},<br />
                  {businessDetails.region_state}, {businessDetails.country}
                  <br />
                  {businessDetails.phone_number}
                </p>
              </div>
            </div>
          )}

          {/* Billed To Section */}
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md space-y-3">
            <h3 className="invoice-section-title text-invoice-lightText dark:text-invoice-darkText font-semibold">
              Billed To
            </h3>

            <div className="grid grid-cols-1 gap-3">
              <div className="relative">
                <input
                  type="text"
                  className="invoice-input pl-10 w-full p-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus-within:border-yellow-400"
                  placeholder="Client Name"
                  value={customerName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCustomerName(val);
                    const matches = clients.filter((c) =>
                      c.name.toLowerCase().includes(val.toLowerCase())
                    );
                    setClientSuggestions(matches);
                    setShowSuggestions(val.trim().length > 0 && matches.length > 0);
                  }}
                  onFocus={() => {
                    if (customerName.trim() !== "") {
                      const matches = clients.filter((c) =>
                        c.name.toLowerCase().includes(customerName.toLowerCase())
                      );
                      if (matches.length > 0) setShowSuggestions(true);
                    }
                  }}
                  onBlur={() => {
                    // Small delay to allow clicking on suggestions
                    setTimeout(() => setShowSuggestions(false), 200);
                  }}
                />
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                  size={16}
                />

                {/* Client Name Suggestions */}
                {showSuggestions && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
                    {clientSuggestions.map((client) => (
                      <div
                        key={client.id}
                        className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => selectClient(client)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedClient?.id === client.id
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        <div>
                          <div className="font-medium">{client.name}</div>
                          {client.email && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {client.email}
                            </div>
                          )}
                          {client.company && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {client.company}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <input
                  type="email"
                  className="invoice-input pl-10 w-full p-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus-within:border-yellow-400"
                  placeholder="client@email.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                  size={16}
                />
              </div>

              <div className="relative">
                <textarea
                  className="invoice-textarea pl-10 h-24 w-full p-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus-within:border-yellow-400"
                  placeholder="Additional client details or address"
                  value={customerDetails}
                  onChange={(e) => setCustomerDetails(e.target.value)}
                />
                <FileText
                  className="absolute left-3 top-3 text-gray-400 dark:text-gray-500"
                  size={16}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dates Section */}
      <div className="bg-white dark:bg-invoice-darkBg p-6 rounded-lg dark:border-gray-700">
        <h2 className="invoice-section-title mb-4 text-invoice-lightText dark:text-invoice-darkText font-bold text-lg">
          Dates
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 text-invoice-lightText dark:text-invoice-darkText">
              Issued On
            </label>
            <div className="relative">
              <input
                type="date"
                className="invoice-input pr-10 w-full p-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus-within:border-yellow-400"
                value={issuedDate}
                onChange={(e) => setIssuedDate(e.target.value)}
              />
              <Calendar
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                size={16}
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-invoice-lightText dark:text-invoice-darkText">
              Due Date
            </label>
            <div className="relative">
              <input
                type="date"
                className="invoice-input pr-10 w-full p-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus-within:border-yellow-400"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
              <Calendar
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                size={16}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InvoiceDetails;
