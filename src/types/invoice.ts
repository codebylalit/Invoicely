
export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Invoice {
  status: 'draft' | 'pending' | 'paid';
  dueDate: string;
  name: string;
  email: string;
  details: string;
  items: InvoiceItem[];
  subtotal: number;
  total: number;
  fromCompany: string;
}

export interface AIGeneratedInvoice {
  invoice: Invoice;
  success: boolean;
  message?: string;
}
