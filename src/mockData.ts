export const mockBusinessDetails = {
  contact_name: "Sarah Johnson",
  business_name: "Design Studio",
  email: "hello@designstudio.com",
  address: "456 Creative Lane",
  city: "Austin",
  postal_code: "78701",
  region_state: "TX",
  country: "United States",
  phone_number: "+1 (512) 555-0123",
  vat_number: "US987654321",
  logo_url: "https://placehold.co/200x100/6366f1/FFFFFF?text=Design+Studio",
};

export const mockInvoice = {
  id: "DS-2024-042",
  invoiceNumber: "DS-2024-042",
  invoiceTitle: "Brand Identity Package",
  status: "pending",
  issueDate: "2024-04-20",
  dueDate: "2024-05-20",
  name: "Bloom Cafe",
  email: "finance@bloomcafe.com",
  details: "789 Market Street\nAustin, TX 78702\nUnited States",
  items: [
    {
      id: 1,
      description: "Logo Design",
      quantity: 1,
      unitPrice: 1200,
      totalPrice: 1200,
      additionalInfo: "Primary and secondary logo variations",
    },
    {
      id: 2,
      description: "Brand Guidelines",
      quantity: 1,
      unitPrice: 800,
      totalPrice: 800,
      additionalInfo: "Color palette, typography, and usage guidelines",
    },
    {
      id: 3,
      description: "Social Media Kit",
      quantity: 1,
      unitPrice: 600,
      totalPrice: 600,
      additionalInfo: "Profile images, cover photos, and post templates",
    },
  ],
  taxes: [
    {
      id: 1,
      name: "Sales Tax",
      rate: 8.25,
      amount: 214.5,
    },
  ],
  discounts: [
    {
      id: 1,
      name: "New Business Discount",
      amount: 200,
    },
  ],
  subtotal: 2600,
  total: 2614.5,
  notes: "Thank you for choosing Design Studio. Payment is due within 30 days. For any questions, please contact our billing team.",
  paymentMethods: [
    {
      type: "bank",
      isEnabled: true,
      details: "Bank: Wells Fargo\nAccount: 9876543210\nRouting: 121000248\nSWIFT: WFBIUS6S",
    },
    {
      type: "stripe",
      isEnabled: true,
    },
  ],
  showPaymentMethods: true,
};

export const mockPaymentDetails = {
  bankTransferDetails: "Bank: Wells Fargo\nAccount: 9876543210\nRouting: 121000248\nSWIFT: WFBIUS6S",
  paymentMethod: "bank",
}; 