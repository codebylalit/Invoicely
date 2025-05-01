export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  additionalInfo?: string;
}

export interface TaxItem {
  id: string;
  name: string;
  rate: number;
  amount: number;
}

export interface DiscountItem {
  id: string;
  name: string;
  rate: number;
  amount: number;
}

export interface PaymentMethod {
  type: string;
  isEnabled: boolean;
  instructions?: string;
  connectURL?: string;
}

export interface Invoice {
  status: "draft" | "pending" | "paid";
  invoiceNumber: string;
  invoiceTitle: string;
  issuedDate: string;
  dueDate: string;
  name: string;
  email: string;
  details: string;
  items: InvoiceItem[];
  subtotal: number;
  total: number;
  fromCompany: string;
  taxes: TaxItem[];
  discounts: DiscountItem[];
  notes: string;
  showPaymentMethods?: boolean;
  paymentMethods: PaymentMethod[];
}

export interface AIGeneratedInvoice {
  invoice: Invoice;
  success: boolean;
  message?: string;
}
