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
  id?: string;
  status: "draft" | "pending" | "paid" | "overdue" | "partial" | "cancelled" | "Paid" | "Pending" | "Overdue" | "Partial" | "Cancelled" | "Draft";
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
  is_recurring?: boolean;
  recurrence_frequency?: 'weekly' | 'monthly' | 'custom';
  recurrence_interval?: number;
  recurrence_start_date?: string;
  recurrence_end_date?: string;
  parent_invoice_id?: string;
  next_recurrence_date?: string;
  template_id?: number | null;
  show_watermark?: boolean;
  page_size?: 'auto' | 'a4' | 'letter';
}

export interface AIGeneratedInvoice {
  invoice: Invoice;
  success: boolean;
  message?: string;
}
