import React from 'react';
import InvoiceItemsTable from './InvoiceItemsTable';
import InvoiceSummary from './InvoiceSummary';
import PaymentDetails from './PaymentDetails';

// ─── Shared Types ─────────────────────────────────────────────────────────────
interface TemplateProps {
  businessDetails: any;
  displayInvoice: any;
  calculatedInvoice: any;
  paymentDetails: any;
  isPro?: boolean;
}

const PoweredByFooter = ({ isPro }: { isPro?: boolean }) => {
  if (isPro) return null;
  return (
    <div className="py-2.5 px-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 text-center text-[11px] text-gray-400 font-sans flex items-center justify-center gap-1">
      <span>Powered by</span>
      <strong className="text-gray-700 dark:text-gray-300">Invoicely</strong>
      <span>· Create free professional invoices for your business</span>
    </div>
  );
};

// ─── Shared Helpers ───────────────────────────────────────────────────────────
const StatusBadge = ({ status, variant = 'default' }: { status?: string; variant?: string }) => {
  const s = status?.toLowerCase();
  const map: Record<string, { label: string; cls: string }> = {
    paid:      { label: 'PAID',      cls: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
    pending:   { label: 'PENDING',   cls: 'bg-amber-100 text-amber-700 border border-amber-200' },
    overdue:   { label: 'OVERDUE',   cls: 'bg-red-100 text-red-700 border border-red-200' },
    draft:     { label: 'DRAFT',     cls: 'bg-gray-100 text-gray-600 border border-gray-200' },
    partial:   { label: 'PARTIAL',   cls: 'bg-blue-100 text-blue-700 border border-blue-200' },
    cancelled: { label: 'CANCELLED', cls: 'bg-gray-100 text-gray-500 border border-gray-200' },
  };
  if (variant === 'dark') {
    Object.assign(map, {
      paid:    { label: 'PAID',    cls: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' },
      pending: { label: 'PENDING', cls: 'bg-amber-500/20 text-amber-300 border border-amber-500/30' },
      overdue: { label: 'OVERDUE', cls: 'bg-red-500/20 text-red-300 border border-red-500/30' },
    });
  }
  const cfg = s && map[s] ? map[s] : { label: (status || 'DRAFT').toUpperCase(), cls: 'bg-gray-100 text-gray-600 border border-gray-200' };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-widest ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
};

const InfoBlock = ({ label, children, align = 'left' }: { label: string; children: React.ReactNode; align?: string }) => (
  <div className={`min-w-0 ${align === 'right' ? 'text-right' : ''}`}>
    <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-2">{label}</p>
    <div className="text-sm space-y-0.5 leading-relaxed min-w-0 break-words [overflow-wrap:anywhere]">{children}</div>
  </div>
);

const fmt = (v: number) => {
  if (typeof v !== 'number' || isNaN(v)) return '0.00';
  return v.toFixed(2);
};

/** Format an ISO date string for display inside invoice templates. */
const fmtDate = (d?: string) => {
  if (!d) return '—';
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? d : dt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
};

// ─── 1. Minimal White ─────────────────────────────────────────────────────────
export const MinimalWhiteTemplate: React.FC<TemplateProps> = ({ businessDetails, displayInvoice, calculatedInvoice, paymentDetails }) => (
  <div className="bg-white w-full font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
    {/* Header */}
    <div className="px-12 pt-12 pb-8 border-b border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          {businessDetails.logo_url ? (
            <img src={businessDetails.logo_url} alt="Logo" className="h-10 object-contain mb-4" crossOrigin="anonymous" />
          ) : (
            <div className="text-xl font-bold text-gray-900 mb-4">{businessDetails.business_name || 'Your Company'}</div>
          )}
          <p className="text-xs text-gray-400 uppercase tracking-widest">{displayInvoice.invoiceTitle || 'Invoice'}</p>
          <p className="text-3xl font-light text-gray-900 mt-1">#{displayInvoice.invoiceNumber || '—'}</p>
        </div>
        <div className="text-right">
          <StatusBadge status={displayInvoice.status} />
          <div className="mt-4 space-y-1 text-sm text-gray-500">
            <p><span className="text-gray-400">Issued</span> · {fmtDate(displayInvoice.issuedDate)}</p>
            <p><span className="text-gray-400">Due</span> · {fmtDate(displayInvoice.dueDate)}</p>
          </div>
        </div>
      </div>
    </div>

    {/* Parties */}
    <div className="px-12 py-8 grid grid-cols-2 gap-12 border-b border-gray-100">
      <InfoBlock label="From">
        <p className="font-semibold text-gray-800">{businessDetails.business_name || '—'}</p>
        <p className="text-gray-500">{businessDetails.email || '—'}</p>
        <p className="text-gray-500">{businessDetails.address}{businessDetails.city ? `, ${businessDetails.city}` : ''}</p>
        {businessDetails.phone_number && <p className="text-gray-500">{businessDetails.phone_number}</p>}
        {businessDetails.vat_number && <p className="text-gray-400 text-xs mt-1">VAT: {businessDetails.vat_number}</p>}
      </InfoBlock>
      <InfoBlock label="Bill To" align="right">
        <p className="font-semibold text-gray-800">{displayInvoice.name || '—'}</p>
        <p className="text-gray-500">{displayInvoice.email || '—'}</p>
        <p className="text-gray-500">{displayInvoice.details || '—'}</p>
      </InfoBlock>
    </div>

    {/* Items */}
    <div className="px-12 py-8">
      <InvoiceItemsTable items={displayInvoice.items} />
    </div>

    {/* Totals */}
    <div className="px-12 pb-8 flex justify-end">
      <div className="w-72">
        <div className="border-t border-gray-100 pt-4">
          <InvoiceSummary subtotal={calculatedInvoice.subtotal} discounts={calculatedInvoice.discounts} taxes={calculatedInvoice.taxes} total={calculatedInvoice.total} />
        </div>
        <div className="mt-4 pt-4 border-t-2 border-gray-900 flex justify-between items-center">
          <span className="text-sm font-bold uppercase tracking-widest text-gray-900">Total Due</span>
          <span className="text-2xl font-light text-gray-900">${fmt(calculatedInvoice.total)}</span>
        </div>
      </div>
    </div>

    {/* Payment + Notes */}
    {displayInvoice.notes && (
      <div className="px-12 pb-6">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Notes</p>
        <p className="text-sm text-gray-600">{displayInvoice.notes}</p>
      </div>
    )}
    <div className="px-12 pb-10">
      <PaymentDetails showPaymentMethods={displayInvoice.showPaymentMethods !== false} paymentMethods={displayInvoice.paymentMethods} paymentDetails={paymentDetails} theme="default" />
    </div>
    <div className="border-t border-gray-100 px-12 py-4 flex justify-between text-xs text-gray-300">
      <span>{businessDetails.business_name}</span>
      <span>Thank you for your business</span>
    </div>
    <PoweredByFooter isPro={isPro} />
  </div>
);

// ─── 2. Modern SaaS ───────────────────────────────────────────────────────────
export const ModernSaasTemplate: React.FC<TemplateProps> = ({ businessDetails, displayInvoice, calculatedInvoice, paymentDetails }) => (
  <div className="bg-white font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
    {/* Top accent bar */}
    <div className="h-1.5 bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-600" />

    {/* Header */}
    <div className="px-10 pt-10 pb-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          {businessDetails.logo_url ? (
            <img src={businessDetails.logo_url} alt="Logo" className="h-12 object-contain" crossOrigin="anonymous" />
          ) : (
            <div className="h-10 w-10 rounded-xl bg-violet-600 flex items-center justify-center text-white font-bold text-lg">
              {(businessDetails.business_name || 'C').charAt(0)}
            </div>
          )}
          <div>
            <p className="font-bold text-gray-900 text-base">{businessDetails.business_name || 'Company Name'}</p>
            <p className="text-xs text-gray-400">{businessDetails.email}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">{displayInvoice.invoiceTitle || 'Invoice'}</p>
          <p className="text-2xl font-bold text-gray-900">#{displayInvoice.invoiceNumber || '—'}</p>
          <div className="mt-2"><StatusBadge status={displayInvoice.status} /></div>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex gap-6 text-sm text-gray-500 border-y border-gray-100 py-4">
        <div><span className="text-gray-400 text-xs uppercase tracking-wide block mb-0.5">Issue Date</span>{fmtDate(displayInvoice.issuedDate)}</div>
        <div className="border-l border-gray-200 pl-6"><span className="text-gray-400 text-xs uppercase tracking-wide block mb-0.5">Due Date</span>{fmtDate(displayInvoice.dueDate)}</div>
        <div className="border-l border-gray-200 pl-6 ml-auto text-right">
          <span className="text-gray-400 text-xs uppercase tracking-wide block mb-0.5">Bill To</span>
          <span className="font-semibold text-gray-800">{displayInvoice.name || '—'}</span>
          <span className="block text-xs">{displayInvoice.email}</span>
        </div>
      </div>
    </div>

    {/* Items table */}
    <div className="px-10">
      <div className="bg-gray-50 rounded-xl overflow-hidden">
        <div className="bg-violet-600 text-white text-xs font-semibold uppercase tracking-widest px-6 py-3 grid grid-cols-12 gap-2">
          <span className="col-span-6">Description</span>
          <span className="col-span-2 text-center">Qty</span>
          <span className="col-span-2 text-right">Unit Price</span>
          <span className="col-span-2 text-right">Amount</span>
        </div>
        <div className="px-6 py-2">
          {(displayInvoice.items || []).map((item: any, i: number) => (
            <div key={item.id || i} className={`grid grid-cols-12 gap-2 py-3 text-sm ${i < displayInvoice.items.length - 1 ? 'border-b border-gray-200' : ''}`}>
              <div className="col-span-6">
                <p className="font-medium text-gray-800">{item.description}</p>
                {item.additionalInfo && <p className="text-xs text-gray-400 mt-0.5">{item.additionalInfo}</p>}
              </div>
              <p className="col-span-2 text-center text-gray-600">{item.quantity}</p>
              <p className="col-span-2 text-right text-gray-600">${fmt(item.unitPrice)}</p>
              <p className="col-span-2 text-right font-semibold text-gray-900">${fmt(item.totalPrice)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Totals */}
    <div className="px-10 py-6 flex justify-end">
      <div className="w-72 space-y-2 text-sm">
        <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>${fmt(calculatedInvoice.subtotal)}</span></div>
        {(calculatedInvoice.discounts || []).map((d: any, i: number) => (
          <div key={i} className="flex justify-between text-red-500"><span>Discount ({d.rate?.toFixed(0)}%)</span><span>-${fmt(d.amount)}</span></div>
        ))}
        {(calculatedInvoice.taxes || []).map((t: any, i: number) => (
          <div key={i} className="flex justify-between text-gray-500"><span>Tax ({t.rate?.toFixed(0)}%)</span><span>${fmt(t.amount)}</span></div>
        ))}
        <div className="flex justify-between pt-3 border-t-2 border-violet-600">
          <span className="font-bold text-gray-900 text-base">Total</span>
          <span className="font-bold text-violet-600 text-xl">${fmt(calculatedInvoice.total)}</span>
        </div>
      </div>
    </div>

    {/* Notes + Payment */}
    {displayInvoice.notes && (
      <div className="px-10 pb-4 text-sm">
        <p className="font-semibold text-gray-700 mb-1">Notes</p>
        <p className="text-gray-500">{displayInvoice.notes}</p>
      </div>
    )}
    <div className="px-10 pb-10">
      <PaymentDetails showPaymentMethods={displayInvoice.showPaymentMethods !== false} paymentMethods={displayInvoice.paymentMethods} paymentDetails={paymentDetails} theme="default" />
    </div>
    <div className="h-1 bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-600" />
  </div>
);

// ─── 3. Stripe Inspired ───────────────────────────────────────────────────────
export const StripeInspiredTemplate: React.FC<TemplateProps> = ({ businessDetails, displayInvoice, calculatedInvoice, paymentDetails }) => (
  <div className="bg-[#f6f9fc] w-full font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
    <div className="max-w-2xl mx-auto py-12 px-6">
      {/* Header card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-4">
        <div className="flex items-start justify-between mb-6">
          {businessDetails.logo_url ? (
            <img src={businessDetails.logo_url} alt="Logo" className="h-8 object-contain" crossOrigin="anonymous" />
          ) : (
            <p className="font-bold text-gray-900 text-lg">{businessDetails.business_name || 'Company'}</p>
          )}
          <div className="text-right">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">{displayInvoice.invoiceTitle || 'Invoice'}</p>
            <p className="font-semibold text-gray-700">#{displayInvoice.invoiceNumber || '—'}</p>
          </div>
        </div>

        {/* Amount */}
        <div className="text-center py-6 border-y border-gray-100 mb-6">
          <p className="text-sm text-gray-500 mb-1">Amount Due</p>
          <p className="text-5xl font-light text-gray-900">${fmt(calculatedInvoice.total)}</p>
          <div className="mt-3"><StatusBadge status={displayInvoice.status} /></div>
        </div>

        {/* Meta */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div><p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Issue Date</p><p className="text-gray-700">{fmtDate(displayInvoice.issuedDate)}</p></div>
          <div><p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Due Date</p><p className="text-gray-700">{fmtDate(displayInvoice.dueDate)}</p></div>
          <div><p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Bill To</p><p className="text-gray-700 font-medium">{displayInvoice.name || '—'}</p></div>
        </div>
      </div>

      {/* Items card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-4">
        <p className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-widest">Line Items</p>
        {(displayInvoice.items || []).map((item: any, i: number) => (
          <div key={item.id || i} className={`flex items-center justify-between py-3 ${i < displayInvoice.items.length - 1 ? 'border-b border-gray-100' : ''}`}>
            <div>
              <p className="text-sm font-medium text-gray-800">{item.description}</p>
              <p className="text-xs text-gray-400">× {item.quantity} @ ${fmt(item.unitPrice)}</p>
            </div>
            <p className="text-sm font-semibold text-gray-900">${fmt(item.totalPrice)}</p>
          </div>
        ))}

        <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
          <div className="flex justify-between text-sm text-gray-500"><span>Subtotal</span><span>${fmt(calculatedInvoice.subtotal)}</span></div>
          {(calculatedInvoice.taxes || []).map((t: any, i: number) => (
            <div key={i} className="flex justify-between text-sm text-gray-500"><span>Tax</span><span>${fmt(t.amount)}</span></div>
          ))}
          <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
            <span>Total</span><span>${fmt(calculatedInvoice.total)}</span>
          </div>
        </div>
      </div>

      {/* From/To card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-4">
        <div className="grid grid-cols-2 gap-8 text-sm">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">From</p>
            <p className="font-semibold text-gray-800">{businessDetails.business_name || '—'}</p>
            <p className="text-gray-500">{businessDetails.email}</p>
            <p className="text-gray-500">{businessDetails.address}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">To</p>
            <p className="font-semibold text-gray-800">{displayInvoice.name || '—'}</p>
            <p className="text-gray-500">{displayInvoice.email}</p>
            <p className="text-gray-500">{displayInvoice.details}</p>
          </div>
        </div>
      </div>

      {/* Payment card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <PaymentDetails showPaymentMethods={displayInvoice.showPaymentMethods !== false} paymentMethods={displayInvoice.paymentMethods} paymentDetails={paymentDetails} theme="default" />
        {displayInvoice.notes && <p className="text-sm text-gray-500 mt-4 pt-4 border-t border-gray-100">{displayInvoice.notes}</p>}
      </div>
    </div>
  </div>
);

// ─── 4. Apple Minimal ─────────────────────────────────────────────────────────
export const AppleMinimalTemplate: React.FC<TemplateProps> = ({ businessDetails, displayInvoice, calculatedInvoice, paymentDetails }) => (
  <div className="bg-white w-full font-sans" style={{ fontFamily: "'SF Pro Display', 'Inter', system-ui, sans-serif" }}>
    <div className="max-w-xl mx-auto px-8 py-12">
      {/* Logo centered */}
      {businessDetails.logo_url ? (
        <div className="flex justify-center mb-10">
          <img src={businessDetails.logo_url} alt="Logo" className="h-12 object-contain" crossOrigin="anonymous" />
        </div>
      ) : (
        <p className="text-center font-medium text-gray-900 mb-10 text-xl">{businessDetails.business_name}</p>
      )}

      {/* Amount big */}
      <div className="text-center mb-10">
        <p className="text-xs text-gray-400 tracking-widest uppercase mb-2">Amount Due</p>
        <p className="text-6xl font-thin text-gray-900 tracking-tight">${fmt(calculatedInvoice.total)}</p>
        <div className="mt-3 flex justify-center"><StatusBadge status={displayInvoice.status} /></div>
      </div>

      {/* Invoice details pill */}
      <div className="bg-gray-50 rounded-2xl p-5 mb-8 text-sm text-gray-700 space-y-3">
        <div className="flex justify-between"><span className="text-gray-400">Invoice</span><span className="font-medium">#{displayInvoice.invoiceNumber || '—'}</span></div>
        <div className="flex justify-between border-t border-gray-200 pt-3"><span className="text-gray-400">Issued</span><span>{fmtDate(displayInvoice.issuedDate)}</span></div>
        <div className="flex justify-between border-t border-gray-200 pt-3"><span className="text-gray-400">Due</span><span>{fmtDate(displayInvoice.dueDate)}</span></div>
        <div className="flex justify-between border-t border-gray-200 pt-3"><span className="text-gray-400">Billed to</span><span className="font-medium">{displayInvoice.name || '—'}</span></div>
      </div>

      {/* Items */}
      <div className="mb-8">
        {(displayInvoice.items || []).map((item: any, i: number) => (
          <div key={item.id || i} className={`flex items-center justify-between py-4 ${i < displayInvoice.items.length - 1 ? 'border-b border-gray-100' : ''}`}>
            <div>
              <p className="text-sm font-medium text-gray-800">{item.description}</p>
              <p className="text-xs text-gray-400 mt-0.5">{item.quantity} × ${fmt(item.unitPrice)}</p>
            </div>
            <p className="text-sm text-gray-900">${fmt(item.totalPrice)}</p>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="bg-gray-900 text-white rounded-2xl p-6 mb-8">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>${fmt(calculatedInvoice.subtotal)}</span></div>
          {(calculatedInvoice.taxes || []).map((t: any, i: number) => <div key={i} className="flex justify-between text-gray-400"><span>Tax</span><span>${fmt(t.amount)}</span></div>)}
          <div className="flex justify-between pt-3 border-t border-gray-700 text-white font-semibold text-base"><span>Total</span><span>${fmt(calculatedInvoice.total)}</span></div>
        </div>
      </div>

      <PaymentDetails showPaymentMethods={displayInvoice.showPaymentMethods !== false} paymentMethods={displayInvoice.paymentMethods} paymentDetails={paymentDetails} theme="default" />
      {displayInvoice.notes && <p className="text-sm text-gray-400 mt-6 text-center">{displayInvoice.notes}</p>}
      <p className="text-center text-xs text-gray-300 mt-8">{businessDetails.business_name} · {businessDetails.email}</p>
    </div>
  </div>
);

// ─── 5. Corporate Blue ────────────────────────────────────────────────────────
export const CorporateBlueTemplate: React.FC<TemplateProps> = ({ businessDetails, displayInvoice, calculatedInvoice, paymentDetails }) => (
  <div className="bg-white w-full font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
    {/* Navy header */}
    <div className="bg-[#1e3a5f] text-white px-10 py-8">
      <div className="flex items-center justify-between">
        <div>
          {businessDetails.logo_url ? (
            <div className="bg-white/95 p-1.5 rounded-lg inline-block shadow-sm mb-3">
              <img src={businessDetails.logo_url} alt="Logo" className="h-10 object-contain" crossOrigin="anonymous" />
            </div>
          ) : (
            <p className="text-xl font-bold mb-1">{businessDetails.business_name || 'Company'}</p>
          )}
          <p className="text-blue-200 text-sm">{businessDetails.email}</p>
          <p className="text-blue-200 text-sm">{businessDetails.phone_number}</p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-bold text-white mb-1">{displayInvoice.invoiceTitle || 'INVOICE'}</p>
          <p className="text-blue-200">#{displayInvoice.invoiceNumber || '—'}</p>
          <div className="mt-3"><StatusBadge status={displayInvoice.status} variant="dark" /></div>
        </div>
      </div>
    </div>

    {/* Blue accent strip */}
    <div className="bg-[#2563eb] px-10 py-3 flex justify-between text-white text-sm">
      <span><span className="opacity-70">ISSUE DATE</span> · <strong>{fmtDate(displayInvoice.issuedDate)}</strong></span>
      <span><span className="opacity-70">DUE DATE</span> · <strong>{fmtDate(displayInvoice.dueDate)}</strong></span>
    </div>

    {/* Parties */}
    <div className="px-10 py-8 grid grid-cols-2 gap-12 border-b border-gray-200">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[#2563eb] mb-3">From</p>
        <p className="font-bold text-gray-900">{businessDetails.business_name}</p>
        <p className="text-gray-600 text-sm">{businessDetails.address}{businessDetails.city ? `, ${businessDetails.city}` : ''}</p>
        <p className="text-gray-600 text-sm">{businessDetails.email}</p>
        {businessDetails.vat_number && <p className="text-xs text-gray-400 mt-1">GST/VAT: {businessDetails.vat_number}</p>}
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[#2563eb] mb-3">Bill To</p>
        <p className="font-bold text-gray-900">{displayInvoice.name || '—'}</p>
        <p className="text-gray-600 text-sm">{displayInvoice.email}</p>
        <p className="text-gray-600 text-sm">{displayInvoice.details}</p>
      </div>
    </div>

    {/* Items */}
    <div className="px-10 py-6">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#f0f4ff] text-[#1e3a5f]">
            <th className="text-left px-4 py-3 rounded-l-lg font-semibold">Description</th>
            <th className="text-center px-4 py-3 font-semibold">Qty</th>
            <th className="text-right px-4 py-3 font-semibold">Unit Price</th>
            <th className="text-right px-4 py-3 rounded-r-lg font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody>
          {(displayInvoice.items || []).map((item: any, i: number) => (
            <tr key={item.id || i} className="border-b border-gray-100">
              <td className="px-4 py-3 text-gray-800">{item.description}{item.additionalInfo && <span className="block text-xs text-gray-400">{item.additionalInfo}</span>}</td>
              <td className="px-4 py-3 text-center text-gray-600">{item.quantity}</td>
              <td className="px-4 py-3 text-right text-gray-600">${fmt(item.unitPrice)}</td>
              <td className="px-4 py-3 text-right font-semibold text-gray-900">${fmt(item.totalPrice)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Totals */}
    <div className="px-10 pb-8 flex justify-end">
      <div className="w-72">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>${fmt(calculatedInvoice.subtotal)}</span></div>
          {(calculatedInvoice.discounts || []).map((d: any, i: number) => <div key={i} className="flex justify-between text-red-500"><span>Discount</span><span>-${fmt(d.amount)}</span></div>)}
          {(calculatedInvoice.taxes || []).map((t: any, i: number) => <div key={i} className="flex justify-between text-gray-500"><span>Tax</span><span>${fmt(t.amount)}</span></div>)}
        </div>
        <div className="bg-[#1e3a5f] text-white rounded-xl p-4 mt-4 flex justify-between items-center">
          <span className="font-bold">TOTAL DUE</span>
          <span className="text-2xl font-bold">${fmt(calculatedInvoice.total)}</span>
        </div>
      </div>
    </div>

    <div className="px-10 pb-8">
      {displayInvoice.notes && <p className="text-sm text-gray-500 mb-4 italic">{displayInvoice.notes}</p>}
      <PaymentDetails showPaymentMethods={displayInvoice.showPaymentMethods !== false} paymentMethods={displayInvoice.paymentMethods} paymentDetails={paymentDetails} theme="default" />
    </div>
    <div className="bg-[#1e3a5f] px-10 py-3 text-center text-xs text-blue-200">
      {businessDetails.business_name} · Thank you for your business
    </div>
  </div>
);

// ─── 6. Elegant Dark ──────────────────────────────────────────────────────────
export const ElegantDarkTemplate: React.FC<TemplateProps> = ({ businessDetails, displayInvoice, calculatedInvoice, paymentDetails, isPro }) => (
  <div className="bg-gray-950 w-full text-white font-sans overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
    {/* Gold accent line */}
    <div className="h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

    <div className="px-6 sm:px-12 py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-10 gap-4 min-w-0">
        <div className="min-w-0 flex-1 break-words [overflow-wrap:anywhere]">
          {businessDetails.logo_url ? (
            <img src={businessDetails.logo_url} alt="Logo" className="h-10 object-contain mb-4 opacity-90" crossOrigin="anonymous" />
          ) : (
            <p className="text-2xl font-light tracking-widest text-amber-400 mb-4 break-words [overflow-wrap:anywhere]">{businessDetails.business_name || 'COMPANY'}</p>
          )}
          <p className="text-gray-500 text-sm break-words [overflow-wrap:anywhere]">{businessDetails.email}</p>
          <p className="text-gray-500 text-sm break-words [overflow-wrap:anywhere]">{businessDetails.address}</p>
        </div>
        <div className="text-right min-w-0 flex-shrink-0">
          <p className="text-xs tracking-widest uppercase text-amber-400 mb-2">{displayInvoice.invoiceTitle || 'Invoice'}</p>
          <p className="text-2xl sm:text-3xl font-thin text-white break-words [overflow-wrap:anywhere]">#{displayInvoice.invoiceNumber || '—'}</p>
          <div className="mt-3"><StatusBadge status={displayInvoice.status} variant="dark" /></div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-800 mb-8" />

      {/* Meta */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-10 min-w-0">
        <div className="min-w-0 break-words [overflow-wrap:anywhere]"><p className="text-xs text-gray-600 uppercase tracking-widest mb-1">Issued</p><p className="text-sm text-gray-300">{fmtDate(displayInvoice.issuedDate)}</p></div>
        <div className="min-w-0 break-words [overflow-wrap:anywhere]"><p className="text-xs text-gray-600 uppercase tracking-widest mb-1">Due</p><p className="text-sm text-gray-300">{fmtDate(displayInvoice.dueDate)}</p></div>
        <div className="min-w-0 break-words [overflow-wrap:anywhere]"><p className="text-xs text-gray-600 uppercase tracking-widest mb-1">From</p><p className="text-sm text-gray-300 font-semibold">{businessDetails.business_name || '—'}</p><p className="text-xs text-gray-500">{businessDetails.email}</p></div>
        <div className="text-right min-w-0 break-words [overflow-wrap:anywhere]"><p className="text-xs text-gray-600 uppercase tracking-widest mb-1">Billed To</p><p className="text-sm text-gray-300 font-semibold">{displayInvoice.name || '—'}</p><p className="text-xs text-gray-500 break-words [overflow-wrap:anywhere]">{displayInvoice.email}</p></div>
      </div>

      {/* Items */}
      <div className="w-full overflow-x-auto mb-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left py-3 text-xs uppercase tracking-widest text-gray-500 font-normal">Description</th>
              <th className="text-center py-3 text-xs uppercase tracking-widest text-gray-500 font-normal w-16">Qty</th>
              <th className="text-right py-3 text-xs uppercase tracking-widest text-gray-500 font-normal w-24">Rate</th>
              <th className="text-right py-3 text-xs uppercase tracking-widest text-gray-500 font-normal w-28">Amount</th>
            </tr>
          </thead>
          <tbody>
            {(displayInvoice.items || []).map((item: any, i: number) => (
              <tr key={item.id || i} className="border-b border-gray-800/50">
                <td className="py-4 text-gray-200 break-words [overflow-wrap:anywhere] pr-4">{item.description}</td>
                <td className="py-4 text-center text-gray-400 tabular-nums">{item.quantity}</td>
                <td className="py-4 text-right text-gray-400 tabular-nums">${fmt(item.unitPrice)}</td>
                <td className="py-4 text-right text-white font-semibold tabular-nums">${fmt(item.totalPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-10">
        <div className="w-full sm:w-72 space-y-2 text-sm">
          <div className="flex justify-between text-gray-500"><span>Subtotal</span><span className="tabular-nums">${fmt(calculatedInvoice.subtotal)}</span></div>
          {(calculatedInvoice.taxes || []).map((t: any, i: number) => <div key={i} className="flex justify-between text-gray-500"><span>Tax</span><span className="tabular-nums">${fmt(t.amount)}</span></div>)}
          <div className="flex justify-between pt-3 border-t border-amber-400/30">
            <span className="text-amber-400 font-semibold">Total Due</span>
            <span className="text-amber-400 text-2xl font-thin tabular-nums">${fmt(calculatedInvoice.total)}</span>
          </div>
        </div>
      </div>

      {displayInvoice.notes && <p className="text-xs text-gray-600 italic mb-6 break-words [overflow-wrap:anywhere]">{displayInvoice.notes}</p>}
      <PaymentDetails showPaymentMethods={displayInvoice.showPaymentMethods !== false} paymentMethods={displayInvoice.paymentMethods} paymentDetails={paymentDetails} theme="executive" />
    </div>
    <div className="h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
    <PoweredByFooter isPro={isPro} />
  </div>
);

// ─── 7. Luxury Black ──────────────────────────────────────────────────────────
export const LuxuryBlackTemplate: React.FC<TemplateProps> = ({ businessDetails, displayInvoice, calculatedInvoice, paymentDetails }) => (
  <div className="bg-black w-full text-white font-serif" style={{ fontFamily: "'Georgia', serif" }}>
    <div className="px-14 py-14">
      {/* Monogram header */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-10 mb-10">
        <div>
          {businessDetails.logo_url ? (
            <img src={businessDetails.logo_url} alt="Logo" className="h-14 object-contain opacity-90" crossOrigin="anonymous" />
          ) : (
            <div>
              <div className="text-4xl font-bold tracking-widest text-white mb-1">
                {(businessDetails.business_name || 'CO').split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <p className="text-xs tracking-[0.3em] text-gray-500 uppercase">{businessDetails.business_name}</p>
            </div>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs tracking-[0.3em] text-gray-600 uppercase mb-2">{displayInvoice.invoiceTitle || 'Invoice'}</p>
          <p className="text-2xl font-light text-gray-300">No. {displayInvoice.invoiceNumber || '—'}</p>
        </div>
      </div>

      {/* Parties */}
      <div className="grid grid-cols-2 gap-16 mb-12">
        <div>
          <p className="text-xs tracking-[0.3em] text-gray-600 uppercase mb-4">From</p>
          <p className="font-semibold text-white">{businessDetails.business_name || '—'}</p>
          <p className="text-gray-500 text-sm mt-1">{businessDetails.address}</p>
          <p className="text-gray-500 text-sm">{businessDetails.email}</p>
        </div>
        <div>
          <p className="text-xs tracking-[0.3em] text-gray-600 uppercase mb-4">Prepared For</p>
          <p className="font-semibold text-white">{displayInvoice.name || '—'}</p>
          <p className="text-gray-500 text-sm mt-1">{displayInvoice.email}</p>
          <p className="text-gray-500 text-sm">{displayInvoice.details}</p>
        </div>
      </div>

      {/* Dates row */}
      <div className="flex gap-12 mb-12 text-sm">
        <div><p className="text-xs tracking-widest text-gray-600 uppercase mb-1">Date Issued</p><p className="text-gray-400">{fmtDate(displayInvoice.issuedDate)}</p></div>
        <div><p className="text-xs tracking-widest text-gray-600 uppercase mb-1">Due Date</p><p className="text-gray-400">{fmtDate(displayInvoice.dueDate)}</p></div>
        <div className="ml-auto"><StatusBadge status={displayInvoice.status} variant="dark" /></div>
      </div>

      {/* Items */}
      <table className="w-full text-sm mb-10">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="text-left pb-4 text-xs tracking-widest text-gray-600 font-normal uppercase">Service / Item</th>
            <th className="text-center pb-4 text-xs tracking-widest text-gray-600 font-normal uppercase">Qty</th>
            <th className="text-right pb-4 text-xs tracking-widest text-gray-600 font-normal uppercase">Rate</th>
            <th className="text-right pb-4 text-xs tracking-widest text-gray-600 font-normal uppercase">Total</th>
          </tr>
        </thead>
        <tbody>
          {(displayInvoice.items || []).map((item: any, i: number) => (
            <tr key={item.id || i} className="border-b border-gray-900">
              <td className="py-5 text-gray-300 italic">{item.description}</td>
              <td className="py-5 text-center text-gray-500">{item.quantity}</td>
              <td className="py-5 text-right text-gray-500">${fmt(item.unitPrice)}</td>
              <td className="py-5 text-right text-white">${fmt(item.totalPrice)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Total */}
      <div className="flex justify-end mb-10">
        <div className="w-72">
          <div className="space-y-3 text-sm text-gray-500">
            <div className="flex justify-between"><span>Subtotal</span><span>${fmt(calculatedInvoice.subtotal)}</span></div>
            {(calculatedInvoice.taxes || []).map((t: any, i: number) => <div key={i} className="flex justify-between"><span>Tax</span><span>${fmt(t.amount)}</span></div>)}
          </div>
          <div className="border-t border-gray-700 mt-4 pt-4 flex justify-between items-baseline">
            <span className="text-xs tracking-[0.3em] uppercase text-gray-500">Total Due</span>
            <span className="text-3xl font-light text-white">${fmt(calculatedInvoice.total)}</span>
          </div>
        </div>
      </div>

      {displayInvoice.notes && <p className="text-xs text-gray-600 italic mb-6 border-t border-gray-900 pt-6">{displayInvoice.notes}</p>}
      <PaymentDetails showPaymentMethods={displayInvoice.showPaymentMethods !== false} paymentMethods={displayInvoice.paymentMethods} paymentDetails={paymentDetails} theme="executive" />
    </div>
  </div>
);

// ─── 8. Modern Purple ─────────────────────────────────────────────────────────
export const ModernPurpleTemplate: React.FC<TemplateProps> = ({ businessDetails, displayInvoice, calculatedInvoice, paymentDetails }) => (
  <div className="bg-white w-full font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
    {/* Purple gradient header */}
    <div className="bg-gradient-to-br from-purple-700 to-indigo-600 px-10 py-10 text-white">
      <div className="flex items-start justify-between">
        <div>
          {businessDetails.logo_url ? (
            <div className="bg-white/95 p-1.5 rounded-lg inline-block shadow-sm mb-4">
              <img src={businessDetails.logo_url} alt="Logo" className="h-10 object-contain" crossOrigin="anonymous" />
            </div>
          ) : (
            <p className="text-2xl font-bold text-white mb-1">{businessDetails.business_name || 'Company'}</p>
          )}
          <p className="text-purple-200 text-sm">{businessDetails.email}</p>
          <p className="text-purple-200 text-sm">{businessDetails.address}</p>
        </div>
        <div className="text-right">
          <p className="text-purple-200 text-xs uppercase tracking-widest mb-1">{displayInvoice.invoiceTitle || 'Invoice'}</p>
          <p className="text-3xl font-bold text-white">#{displayInvoice.invoiceNumber || '—'}</p>
          <div className="mt-3 flex justify-end"><StatusBadge status={displayInvoice.status} variant="dark" /></div>
          <p className="text-purple-200 text-xs mt-3">Issued: {fmtDate(displayInvoice.issuedDate)} · Due: {fmtDate(displayInvoice.dueDate)}</p>
        </div>
      </div>
    </div>

    {/* Bill to strip */}
    <div className="bg-purple-50 px-10 py-5 border-b border-purple-100">
      <p className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-1">Bill To</p>
      <p className="font-bold text-gray-900">{displayInvoice.name || '—'}</p>
      <p className="text-gray-500 text-sm">{displayInvoice.email} · {displayInvoice.details}</p>
    </div>

    {/* Items */}
    <div className="px-10 py-6">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-purple-200">
            <th className="text-left pb-3 font-semibold text-purple-700">Item</th>
            <th className="text-center pb-3 font-semibold text-purple-700">Qty</th>
            <th className="text-right pb-3 font-semibold text-purple-700">Price</th>
            <th className="text-right pb-3 font-semibold text-purple-700">Total</th>
          </tr>
        </thead>
        <tbody>
          {(displayInvoice.items || []).map((item: any, i: number) => (
            <tr key={item.id || i} className={`${i % 2 === 0 ? '' : 'bg-purple-50/30'} border-b border-gray-100`}>
              <td className="py-3 text-gray-800">{item.description}</td>
              <td className="py-3 text-center text-gray-500">{item.quantity}</td>
              <td className="py-3 text-right text-gray-500">${fmt(item.unitPrice)}</td>
              <td className="py-3 text-right font-semibold text-gray-900">${fmt(item.totalPrice)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Totals */}
    <div className="px-10 pb-8 flex justify-end">
      <div className="w-72 space-y-2 text-sm">
        <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>${fmt(calculatedInvoice.subtotal)}</span></div>
        {(calculatedInvoice.taxes || []).map((t: any, i: number) => <div key={i} className="flex justify-between text-gray-500"><span>Tax</span><span>${fmt(t.amount)}</span></div>)}
        <div className="bg-gradient-to-r from-purple-700 to-indigo-600 text-white rounded-xl p-4 mt-2 flex justify-between items-center">
          <span className="font-bold">Total Due</span>
          <span className="text-xl font-bold">${fmt(calculatedInvoice.total)}</span>
        </div>
      </div>
    </div>

    <div className="px-10 pb-8">
      {displayInvoice.notes && <p className="text-sm text-gray-500 italic mb-4">{displayInvoice.notes}</p>}
      <PaymentDetails showPaymentMethods={displayInvoice.showPaymentMethods !== false} paymentMethods={displayInvoice.paymentMethods} paymentDetails={paymentDetails} theme="default" />
    </div>
    <div className="bg-gradient-to-r from-purple-700 to-indigo-600 h-1.5" />
  </div>
);

// ─── 9. Creative Agency ───────────────────────────────────────────────────────
export const CreativeAgencyTemplate: React.FC<TemplateProps> = ({ businessDetails, displayInvoice, calculatedInvoice, paymentDetails }) => (
  <div className="bg-white w-full font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
    <div className="grid grid-cols-3 w-full">
      {/* Left sidebar */}
      <div className="bg-[#ff6b35] text-white px-6 py-10 flex flex-col">
        {businessDetails.logo_url ? (
          <div className="bg-white/95 p-2 rounded-lg inline-block shadow-sm mb-6">
            <img src={businessDetails.logo_url} alt="Logo" className="h-10 object-contain" crossOrigin="anonymous" />
          </div>
        ) : (
          <p className="text-xl font-black mb-8 tracking-tight">{businessDetails.business_name || 'AGENCY'}</p>
        )}
        <div className="mb-8">
          <p className="text-orange-200 text-xs uppercase tracking-widest mb-3">Invoice</p>
          <p className="text-3xl font-black text-white">#{displayInvoice.invoiceNumber || '—'}</p>
        </div>
        <div className="mb-4">
          <p className="text-orange-200 text-xs uppercase tracking-widest mb-1">Status</p>
          <StatusBadge status={displayInvoice.status} variant="dark" />
        </div>
        <div className="mb-4">
          <p className="text-orange-200 text-xs uppercase tracking-widest mb-1">Issued</p>
          <p className="text-sm text-white">{fmtDate(displayInvoice.issuedDate)}</p>
        </div>
        <div className="mb-8">
          <p className="text-orange-200 text-xs uppercase tracking-widest mb-1">Due</p>
          <p className="text-sm text-white">{fmtDate(displayInvoice.dueDate)}</p>
        </div>
        <div className="mb-8">
          <p className="text-orange-200 text-xs uppercase tracking-widest mb-2">From</p>
          <p className="text-sm font-semibold">{businessDetails.business_name}</p>
          <p className="text-orange-200 text-xs mt-1">{businessDetails.email}</p>
          <p className="text-orange-200 text-xs">{businessDetails.address}</p>
        </div>
        <div>
          <p className="text-orange-200 text-xs uppercase tracking-widest mb-2">Bill To</p>
          <p className="text-sm font-semibold">{displayInvoice.name || '—'}</p>
          <p className="text-orange-200 text-xs mt-1">{displayInvoice.email}</p>
          <p className="text-orange-200 text-xs">{displayInvoice.details}</p>
        </div>
        {/* Total at bottom */}
        <div className="mt-auto pt-8 border-t border-orange-400/40">
          <p className="text-orange-200 text-xs uppercase tracking-widest mb-1">Total Due</p>
          <p className="text-3xl font-black">${fmt(calculatedInvoice.total)}</p>
        </div>
      </div>

      {/* Right content */}
      <div className="col-span-2 px-8 py-10">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">Line Items</p>
        <table className="w-full text-sm mb-8">
          <thead>
            <tr className="border-b-2 border-gray-900">
              <th className="text-left pb-3 font-bold text-gray-900">Description</th>
              <th className="text-center pb-3 font-bold text-gray-900">Qty</th>
              <th className="text-right pb-3 font-bold text-gray-900">Rate</th>
              <th className="text-right pb-3 font-bold text-gray-900">Amount</th>
            </tr>
          </thead>
          <tbody>
            {(displayInvoice.items || []).map((item: any, i: number) => (
              <tr key={item.id || i} className="border-b border-gray-100">
                <td className="py-4 text-gray-800">{item.description}</td>
                <td className="py-4 text-center text-gray-500">{item.quantity}</td>
                <td className="py-4 text-right text-gray-500">${fmt(item.unitPrice)}</td>
                <td className="py-4 text-right font-bold text-gray-900">${fmt(item.totalPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-8">
          <div className="w-56 space-y-2 text-sm">
            <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>${fmt(calculatedInvoice.subtotal)}</span></div>
            {(calculatedInvoice.taxes || []).map((t: any, i: number) => <div key={i} className="flex justify-between text-gray-500"><span>Tax</span><span>${fmt(t.amount)}</span></div>)}
            <div className="flex justify-between font-bold text-gray-900 border-t border-gray-300 pt-2"><span>Total</span><span>${fmt(calculatedInvoice.total)}</span></div>
          </div>
        </div>

        {displayInvoice.notes && <p className="text-sm text-gray-500 italic mb-4 pb-4 border-b border-gray-100">{displayInvoice.notes}</p>}
        <PaymentDetails showPaymentMethods={displayInvoice.showPaymentMethods !== false} paymentMethods={displayInvoice.paymentMethods} paymentDetails={paymentDetails} theme="default" />
      </div>
    </div>
  </div>
);

// ─── 10. Freelancer ───────────────────────────────────────────────────────────
export const FreelancerTemplate: React.FC<TemplateProps> = ({ businessDetails, displayInvoice, calculatedInvoice, paymentDetails }) => (
  <div className="bg-[#fafaf9] w-full font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
    <div className="px-10 py-10">
      {/* Header: Name big + invoice info */}
      <div className="flex items-end justify-between mb-10">
        <div>
          {businessDetails.logo_url ? (
            <img src={businessDetails.logo_url} alt="Logo" className="h-12 object-contain mb-2" crossOrigin="anonymous" />
          ) : (
            <p className="text-3xl font-bold text-gray-900">{businessDetails.business_name || 'Your Name'}</p>
          )}
          <p className="text-sm text-gray-400">{businessDetails.email} · {businessDetails.phone_number}</p>
          <p className="text-sm text-gray-400">{businessDetails.address}</p>
        </div>
        <div className="text-right">
          <div className="inline-block bg-gray-900 text-white px-6 py-4 rounded-2xl">
            <p className="text-xs uppercase tracking-widest opacity-60 mb-1">Invoice</p>
            <p className="text-2xl font-bold">#{displayInvoice.invoiceNumber || '—'}</p>
          </div>
        </div>
      </div>

      {/* Status + Dates */}
      <div className="flex items-center gap-4 mb-8">
        <StatusBadge status={displayInvoice.status} />
        <span className="text-sm text-gray-400">Issued {fmtDate(displayInvoice.issuedDate)}</span>
        <span className="text-sm text-gray-400">·</span>
        <span className="text-sm text-gray-400">Due {fmtDate(displayInvoice.dueDate)}</span>
      </div>

      {/* Client card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Billed To</p>
        <p className="font-bold text-gray-900">{displayInvoice.name || '—'}</p>
        <p className="text-sm text-gray-500">{displayInvoice.email}</p>
        <p className="text-sm text-gray-500">{displayInvoice.details}</p>
      </div>

      {/* Items */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-6">
        {(displayInvoice.items || []).map((item: any, i: number) => (
          <div key={item.id || i} className={`flex items-center justify-between px-6 py-4 ${i < displayInvoice.items.length - 1 ? 'border-b border-gray-100' : ''}`}>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">{item.description}</p>
              {item.additionalInfo && <p className="text-xs text-gray-400">{item.additionalInfo}</p>}
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span>{item.quantity} × ${fmt(item.unitPrice)}</span>
              <span className="font-bold text-gray-900 w-24 text-right">${fmt(item.totalPrice ?? item.quantity * item.unitPrice)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-72 bg-white border border-gray-200 rounded-2xl p-6 space-y-3 text-sm">
          <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>${fmt(calculatedInvoice.subtotal)}</span></div>
          {(calculatedInvoice.discounts || []).map((d: any, i: number) => <div key={i} className="flex justify-between text-gray-500"><span>Discount{d.name ? ` (${d.name})` : ''}</span><span>-${fmt(d.amount)}</span></div>)}
          {(calculatedInvoice.taxes || []).map((t: any, i: number) => <div key={i} className="flex justify-between text-gray-500"><span>Tax{t.name ? ` (${t.name})` : ''}</span><span>-${fmt(t.amount)}</span></div>)}
          <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-3 text-base"><span>Total Due</span><span>${fmt(calculatedInvoice.total)}</span></div>
        </div>
      </div>

      {displayInvoice.notes && <p className="text-sm text-gray-500 italic mb-6">{displayInvoice.notes}</p>}
      <PaymentDetails showPaymentMethods={displayInvoice.showPaymentMethods !== false} paymentMethods={displayInvoice.paymentMethods} paymentDetails={paymentDetails} theme="default" />
      <p className="text-center text-xs text-gray-400 mt-8">Thank you for working with me! 🙏</p>
    </div>
  </div>
);

// ─── 11. Startup ──────────────────────────────────────────────────────────────
export const StartupTemplate: React.FC<TemplateProps> = ({ businessDetails, displayInvoice, calculatedInvoice, paymentDetails }) => (
  <div className="bg-white w-full font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
    <div className="border-b-4 border-[#00d084] px-10 pt-10 pb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {businessDetails.logo_url ? (
            <img src={businessDetails.logo_url} alt="Logo" className="h-9 object-contain" crossOrigin="anonymous" />
          ) : (
            <div className="h-9 w-9 bg-[#00d084] rounded-lg flex items-center justify-center text-white font-black text-lg">
              {(businessDetails.business_name || 'S').charAt(0)}
            </div>
          )}
          <div>
            <p className="font-bold text-gray-900">{businessDetails.business_name || 'Startup Co.'}</p>
            <p className="text-xs text-gray-400">{businessDetails.email}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[#00d084] text-xs font-bold uppercase tracking-widest">{displayInvoice.invoiceTitle || 'Invoice'}</p>
          <p className="text-xl font-bold text-gray-900">#{displayInvoice.invoiceNumber || '—'}</p>
          <StatusBadge status={displayInvoice.status} />
        </div>
      </div>
    </div>

    <div className="px-10 py-6 grid grid-cols-3 gap-6 bg-gray-50 border-b border-gray-200 text-sm">
      <div><p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Issued</p><p className="font-medium text-gray-700">{fmtDate(displayInvoice.issuedDate)}</p></div>
      <div><p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Due</p><p className="font-medium text-gray-700">{fmtDate(displayInvoice.dueDate)}</p></div>
      <div className="text-right"><p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Bill To</p><p className="font-semibold text-gray-900">{displayInvoice.name || '—'}</p><p className="text-gray-400 text-xs">{displayInvoice.email}</p></div>
    </div>

    <div className="px-10 py-6">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[#00d084] border-b border-gray-200">
            <th className="text-left pb-3 font-semibold">Description</th>
            <th className="text-center pb-3 font-semibold">Qty</th>
            <th className="text-right pb-3 font-semibold">Price</th>
            <th className="text-right pb-3 font-semibold">Total</th>
          </tr>
        </thead>
        <tbody>
          {(displayInvoice.items || []).map((item: any, i: number) => (
            <tr key={item.id || i} className="border-b border-gray-100">
              <td className="py-3 text-gray-800">{item.description}</td>
              <td className="py-3 text-center text-gray-500">{item.quantity}</td>
              <td className="py-3 text-right text-gray-500">${fmt(item.unitPrice)}</td>
              <td className="py-3 text-right font-bold text-gray-900">${fmt(item.totalPrice)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="px-10 pb-8 flex justify-between items-end">
      <div>
        {displayInvoice.notes && <p className="text-sm text-gray-500 italic max-w-xs">{displayInvoice.notes}</p>}
      </div>
      <div className="w-64 space-y-2 text-sm">
        <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>${fmt(calculatedInvoice.subtotal)}</span></div>
        {(calculatedInvoice.taxes || []).map((t: any, i: number) => <div key={i} className="flex justify-between text-gray-500"><span>Tax</span><span>${fmt(t.amount)}</span></div>)}
        <div className="flex justify-between items-center bg-[#00d084] text-white rounded-xl px-4 py-3 mt-2">
          <span className="font-bold">Total</span>
          <span className="text-xl font-bold">${fmt(calculatedInvoice.total)}</span>
        </div>
      </div>
    </div>

    <div className="px-10 pb-8">
      <PaymentDetails showPaymentMethods={displayInvoice.showPaymentMethods !== false} paymentMethods={displayInvoice.paymentMethods} paymentDetails={paymentDetails} theme="default" />
    </div>
  </div>
);

// ─── 12. Finance ──────────────────────────────────────────────────────────────
export const FinanceTemplate: React.FC<TemplateProps> = ({ businessDetails, displayInvoice, calculatedInvoice, paymentDetails }) => (
  <div className="bg-white w-full font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
    {/* Header */}
    <div className="bg-[#0f4c81] text-white px-10 py-8">
      <div className="flex items-start justify-between">
        <div>
          {businessDetails.logo_url ? (
            <div className="bg-white/95 p-1.5 rounded-lg inline-block shadow-sm mb-3">
              <img src={businessDetails.logo_url} alt="Logo" className="h-10 object-contain" crossOrigin="anonymous" />
            </div>
          ) : (
            <p className="text-xl font-bold mb-1">{businessDetails.business_name}</p>
          )}
          <p className="text-blue-200 text-xs">{businessDetails.email} · {businessDetails.phone_number}</p>
          {businessDetails.vat_number && <p className="text-blue-300 text-xs mt-1">REG: {businessDetails.vat_number}</p>}
        </div>
        <div className="text-right">
          <p className="text-6xl font-thin text-white">{displayInvoice.invoiceTitle || 'INVOICE'}</p>
          <p className="text-blue-200 text-sm">Reference: {displayInvoice.invoiceNumber || '—'}</p>
        </div>
      </div>
    </div>

    {/* Info bar */}
    <div className="bg-[#1a6fa8] text-white px-10 py-3 text-xs flex gap-8">
      <span>ISSUE DATE: <strong>{fmtDate(displayInvoice.issuedDate)}</strong></span>
      <span>DUE DATE: <strong>{fmtDate(displayInvoice.dueDate)}</strong></span>
      <span className="ml-auto"><StatusBadge status={displayInvoice.status} variant="dark" /></span>
    </div>

    <div className="px-10 py-8 grid grid-cols-2 gap-12 border-b border-gray-200">
      <div>
        <p className="text-xs font-bold text-[#0f4c81] uppercase tracking-widest mb-2">Issued By</p>
        <p className="font-bold text-gray-900">{businessDetails.business_name || '—'}</p>
        <p className="text-sm text-gray-500">{businessDetails.address}{businessDetails.city ? `, ${businessDetails.city}` : ''} {businessDetails.postal_code}</p>
        <p className="text-sm text-gray-500">{businessDetails.country}</p>
      </div>
      <div>
        <p className="text-xs font-bold text-[#0f4c81] uppercase tracking-widest mb-2">Invoice To</p>
        <p className="font-bold text-gray-900">{displayInvoice.name || '—'}</p>
        <p className="text-sm text-gray-500">{displayInvoice.email}</p>
        <p className="text-sm text-gray-500">{displayInvoice.details}</p>
      </div>
    </div>

    <div className="px-10 py-6">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-[#f0f4f8] text-[#0f4c81]">
            <th className="text-left p-3 font-semibold border border-gray-200">Description</th>
            <th className="text-center p-3 font-semibold border border-gray-200">Qty</th>
            <th className="text-right p-3 font-semibold border border-gray-200">Unit Rate</th>
            <th className="text-right p-3 font-semibold border border-gray-200">Amount</th>
          </tr>
        </thead>
        <tbody>
          {(displayInvoice.items || []).map((item: any, i: number) => (
            <tr key={item.id || i} className={i % 2 === 0 ? 'bg-white' : 'bg-[#f9fafb]'}>
              <td className="p-3 border border-gray-200 text-gray-800">{item.description}</td>
              <td className="p-3 border border-gray-200 text-center text-gray-600">{item.quantity}</td>
              <td className="p-3 border border-gray-200 text-right text-gray-600">${fmt(item.unitPrice)}</td>
              <td className="p-3 border border-gray-200 text-right font-semibold text-gray-900">${fmt(item.totalPrice)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="px-10 pb-8 flex justify-end">
      <table className="text-sm w-64 border-collapse">
        <tbody>
          <tr><td className="py-2 text-gray-500 pr-8">Subtotal</td><td className="py-2 text-right font-medium">${fmt(calculatedInvoice.subtotal)}</td></tr>
          {(calculatedInvoice.taxes || []).map((t: any, i: number) => (
            <tr key={i}><td className="py-2 text-gray-500 pr-8">Tax</td><td className="py-2 text-right font-medium">${fmt(t.amount)}</td></tr>
          ))}
          <tr className="bg-[#0f4c81] text-white"><td className="p-3 font-bold rounded-l">TOTAL DUE</td><td className="p-3 text-right font-bold text-lg rounded-r">${fmt(calculatedInvoice.total)}</td></tr>
        </tbody>
      </table>
    </div>

    {displayInvoice.notes && <div className="px-10 pb-4 text-sm text-gray-500 italic border-t border-gray-100 pt-4">{displayInvoice.notes}</div>}
    <div className="px-10 pb-8">
      <PaymentDetails showPaymentMethods={displayInvoice.showPaymentMethods !== false} paymentMethods={displayInvoice.paymentMethods} paymentDetails={paymentDetails} theme="default" />
    </div>
    <div className="bg-[#0f4c81] text-blue-200 text-xs px-10 py-3 text-center">
      {businessDetails.business_name} · {businessDetails.email} · Thank you for your trust
    </div>
  </div>
);

// ─── 13. Healthcare ───────────────────────────────────────────────────────────
export const HealthcareTemplate: React.FC<TemplateProps> = ({ businessDetails, displayInvoice, calculatedInvoice, paymentDetails }) => (
  <div className="bg-white font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
    {/* Teal header */}
    <div className="bg-teal-600 text-white px-10 py-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center">
            <svg className="h-7 w-7 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-white text-lg">{businessDetails.business_name || 'Medical Center'}</p>
            <p className="text-teal-200 text-xs">{businessDetails.email} · {businessDetails.phone_number}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-teal-200 text-xs uppercase tracking-widest mb-1">Medical Invoice</p>
          <p className="text-2xl font-bold">#{displayInvoice.invoiceNumber || '—'}</p>
          <div className="mt-2"><StatusBadge status={displayInvoice.status} variant="dark" /></div>
        </div>
      </div>
    </div>

    <div className="px-10 py-6 grid grid-cols-2 gap-8 bg-teal-50 border-b border-teal-100">
      <div><p className="text-xs text-teal-400 uppercase tracking-widest mb-1">Date of Service</p><p className="text-sm font-medium text-gray-700">{fmtDate(displayInvoice.issuedDate)}</p></div>
      <div className="text-right"><p className="text-xs text-teal-400 uppercase tracking-widest mb-1">Payment Due</p><p className="text-sm font-medium text-gray-700">{fmtDate(displayInvoice.dueDate)}</p></div>
    </div>

    <div className="px-10 py-6 grid grid-cols-2 gap-8 border-b border-gray-200">
      <div>
        <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-2">Provider</p>
        <p className="font-semibold text-gray-900">{businessDetails.business_name || '—'}</p>
        <p className="text-sm text-gray-500">{businessDetails.address}</p>
        <p className="text-sm text-gray-500">{businessDetails.email}</p>
        {businessDetails.vat_number && <p className="text-xs text-gray-400 mt-1">License: {businessDetails.vat_number}</p>}
      </div>
      <div>
        <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-2">Patient / Client</p>
        <p className="font-semibold text-gray-900">{displayInvoice.name || '—'}</p>
        <p className="text-sm text-gray-500">{displayInvoice.email}</p>
        <p className="text-sm text-gray-500">{displayInvoice.details}</p>
      </div>
    </div>

    <div className="px-10 py-6">
      <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-4">Services Rendered</p>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-teal-50 text-teal-700">
            <th className="text-left p-3 rounded-l-lg font-semibold">Description</th>
            <th className="text-center p-3 font-semibold">Units</th>
            <th className="text-right p-3 font-semibold">Rate</th>
            <th className="text-right p-3 rounded-r-lg font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody>
          {(displayInvoice.items || []).map((item: any, i: number) => (
            <tr key={item.id || i} className="border-b border-gray-100">
              <td className="p-3 text-gray-800">{item.description}</td>
              <td className="p-3 text-center text-gray-500">{item.quantity}</td>
              <td className="p-3 text-right text-gray-500">${fmt(item.unitPrice)}</td>
              <td className="p-3 text-right font-semibold text-gray-900">${fmt(item.totalPrice)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="px-10 pb-8 flex justify-end">
      <div className="w-72 space-y-2 text-sm">
        <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>${fmt(calculatedInvoice.subtotal)}</span></div>
        {(calculatedInvoice.taxes || []).map((t: any, i: number) => <div key={i} className="flex justify-between text-gray-500"><span>Tax</span><span>${fmt(t.amount)}</span></div>)}
        <div className="flex justify-between bg-teal-600 text-white rounded-xl p-4 mt-2 items-center">
          <span className="font-bold">Total Due</span>
          <span className="text-xl font-bold">${fmt(calculatedInvoice.total)}</span>
        </div>
      </div>
    </div>

    {displayInvoice.notes && <div className="px-10 pb-4 text-sm text-gray-500 bg-teal-50 p-4 rounded-lg mx-10 mb-4">{displayInvoice.notes}</div>}
    <div className="px-10 pb-8">
      <PaymentDetails showPaymentMethods={displayInvoice.showPaymentMethods !== false} paymentMethods={displayInvoice.paymentMethods} paymentDetails={paymentDetails} theme="default" />
    </div>
    <div className="bg-teal-600 text-teal-200 text-xs px-10 py-3 text-center">
      Your health is our priority · Thank you for choosing {businessDetails.business_name}
    </div>
  </div>
);

// ─── 14. Construction ─────────────────────────────────────────────────────────
export const ConstructionTemplate: React.FC<TemplateProps> = ({ businessDetails, displayInvoice, calculatedInvoice, paymentDetails }) => (
  <div className="bg-white font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
    {/* Bold orange header */}
    <div className="bg-[#f97316] px-10 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-white rounded flex items-center justify-center">
            <svg className="h-7 w-7 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <p className="font-black text-white text-xl">{businessDetails.business_name || 'BUILD CO.'}</p>
            <p className="text-orange-100 text-xs">{businessDetails.phone_number} · {businessDetails.email}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-orange-100 text-xs uppercase tracking-widest">Invoice</p>
          <p className="text-3xl font-black text-white">#{displayInvoice.invoiceNumber || '—'}</p>
        </div>
      </div>
    </div>

    {/* Yellow safety stripe */}
    <div className="h-3" style={{ background: 'repeating-linear-gradient(45deg, #fbbf24, #fbbf24 10px, #f97316 10px, #f97316 20px)' }} />

    <div className="px-10 py-6 grid grid-cols-2 gap-8 border-b-2 border-gray-200">
      <div>
        <p className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-2">From</p>
        <p className="font-bold text-gray-900">{businessDetails.business_name}</p>
        <p className="text-sm text-gray-500">{businessDetails.address}</p>
        <p className="text-sm text-gray-500">{businessDetails.email}</p>
        {businessDetails.vat_number && <p className="text-xs text-gray-400 mt-1">License: {businessDetails.vat_number}</p>}
      </div>
      <div className="text-right">
        <p className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-2">Bill To</p>
        <p className="font-bold text-gray-900">{displayInvoice.name || '—'}</p>
        <p className="text-sm text-gray-500">{displayInvoice.email}</p>
        <p className="text-sm text-gray-500">{displayInvoice.details}</p>
      </div>
    </div>

    <div className="px-10 py-4 flex gap-8 bg-gray-50 border-b border-gray-200 text-sm">
      <div><span className="text-gray-400">Date:</span> <strong>{fmtDate(displayInvoice.issuedDate)}</strong></div>
      <div><span className="text-gray-400">Due:</span> <strong>{fmtDate(displayInvoice.dueDate)}</strong></div>
      <div className="ml-auto"><StatusBadge status={displayInvoice.status} /></div>
    </div>

    <div className="px-10 py-6">
      <p className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-4">Work Completed</p>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-900 text-white">
            <th className="text-left px-4 py-3 rounded-tl-lg">Description</th>
            <th className="text-center px-4 py-3">Units</th>
            <th className="text-right px-4 py-3">Rate</th>
            <th className="text-right px-4 py-3 rounded-tr-lg">Amount</th>
          </tr>
        </thead>
        <tbody>
          {(displayInvoice.items || []).map((item: any, i: number) => (
            <tr key={item.id || i} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
              <td className="px-4 py-3 text-gray-800">{item.description}</td>
              <td className="px-4 py-3 text-center text-gray-500">{item.quantity}</td>
              <td className="px-4 py-3 text-right text-gray-500">${fmt(item.unitPrice)}</td>
              <td className="px-4 py-3 text-right font-bold text-gray-900">${fmt(item.totalPrice)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="px-10 pb-8 flex justify-end">
      <div className="w-72 space-y-2 text-sm">
        <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>${fmt(calculatedInvoice.subtotal)}</span></div>
        {(calculatedInvoice.taxes || []).map((t: any, i: number) => <div key={i} className="flex justify-between text-gray-500"><span>Tax</span><span>${fmt(t.amount)}</span></div>)}
        <div className="flex justify-between bg-gray-900 text-white rounded-lg p-4 mt-2 items-center">
          <span className="font-bold text-orange-400">TOTAL DUE</span>
          <span className="text-xl font-bold">${fmt(calculatedInvoice.total)}</span>
        </div>
      </div>
    </div>

    {displayInvoice.notes && <div className="mx-10 mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg text-sm text-gray-600"><strong className="text-orange-600">Note:</strong> {displayInvoice.notes}</div>}
    <div className="px-10 pb-8">
      <PaymentDetails showPaymentMethods={displayInvoice.showPaymentMethods !== false} paymentMethods={displayInvoice.paymentMethods} paymentDetails={paymentDetails} theme="default" />
    </div>
    <div className="h-3" style={{ background: 'repeating-linear-gradient(45deg, #fbbf24, #fbbf24 10px, #f97316 10px, #f97316 20px)' }} />
  </div>
);

// ─── 15. Retail ───────────────────────────────────────────────────────────────
export const RetailTemplate: React.FC<TemplateProps> = ({ businessDetails, displayInvoice, calculatedInvoice, paymentDetails }) => (
  <div className="bg-white font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
    <div className="px-10 py-8">
      {/* Centered header */}
      <div className="text-center mb-8 pb-6 border-b-2 border-dashed border-gray-300">
        {businessDetails.logo_url ? (
          <img src={businessDetails.logo_url} alt="Logo" className="h-14 object-contain mx-auto mb-3" crossOrigin="anonymous" />
        ) : (
          <p className="text-2xl font-bold text-gray-900 mb-1">{businessDetails.business_name || 'STORE NAME'}</p>
        )}
        <p className="text-sm text-gray-500">{businessDetails.address}{businessDetails.city ? `, ${businessDetails.city}` : ''}</p>
        <p className="text-sm text-gray-500">{businessDetails.phone_number} · {businessDetails.email}</p>
      </div>

      {/* Receipt-style meta */}
      <div className="text-center mb-6">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">{displayInvoice.invoiceTitle || 'Sales Invoice'}</p>
        <p className="text-xl font-bold text-gray-900">#{displayInvoice.invoiceNumber || '—'}</p>
        <p className="text-sm text-gray-400 mt-1">{fmtDate(displayInvoice.issuedDate)} · Due: {fmtDate(displayInvoice.dueDate)}</p>
        <div className="flex justify-center mt-2"><StatusBadge status={displayInvoice.status} /></div>
      </div>

      {/* Customer */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Customer</p>
        <p className="font-semibold text-gray-900">{displayInvoice.name || '—'}</p>
        <p className="text-gray-500">{displayInvoice.email} · {displayInvoice.details}</p>
      </div>

      {/* Items receipt-style */}
      <div className="mb-6">
        {(displayInvoice.items || []).map((item: any, i: number) => (
          <div key={item.id || i} className={`flex items-center justify-between py-3 ${i < displayInvoice.items.length - 1 ? 'border-b border-dashed border-gray-200' : ''}`}>
            <div>
              <p className="text-sm font-medium text-gray-800">{item.description}</p>
              <p className="text-xs text-gray-400">{item.quantity} × ${fmt(item.unitPrice)}</p>
            </div>
            <p className="text-sm font-bold text-gray-900">${fmt(item.totalPrice)}</p>
          </div>
        ))}
      </div>

      {/* Totals receipt */}
      <div className="border-t-2 border-dashed border-gray-300 pt-4 space-y-2 text-sm mb-6">
        <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>${fmt(calculatedInvoice.subtotal)}</span></div>
        {(calculatedInvoice.discounts || []).map((d: any, i: number) => <div key={i} className="flex justify-between text-red-500"><span>Discount</span><span>-${fmt(d.amount)}</span></div>)}
        {(calculatedInvoice.taxes || []).map((t: any, i: number) => <div key={i} className="flex justify-between text-gray-500"><span>Tax</span><span>${fmt(t.amount)}</span></div>)}
        <div className="flex justify-between font-bold text-gray-900 text-base border-t-2 border-dashed border-gray-300 pt-3">
          <span>TOTAL</span><span>${fmt(calculatedInvoice.total)}</span>
        </div>
      </div>

      <PaymentDetails showPaymentMethods={displayInvoice.showPaymentMethods !== false} paymentMethods={displayInvoice.paymentMethods} paymentDetails={paymentDetails} theme="default" />

      {displayInvoice.notes && <p className="text-xs text-gray-400 text-center mt-4">{displayInvoice.notes}</p>}
      <div className="text-center mt-6 pt-4 border-t-2 border-dashed border-gray-200">
        <p className="text-sm font-semibold text-gray-700">Thank you for shopping with us!</p>
        <p className="text-xs text-gray-400 mt-1">www.{(businessDetails.business_name || 'store').toLowerCase().replace(/\s/g, '')}.com</p>
      </div>
    </div>
  </div>
);

// ─── 16. Restaurant ───────────────────────────────────────────────────────────
export const RestaurantTemplate: React.FC<TemplateProps> = ({ businessDetails, displayInvoice, calculatedInvoice, paymentDetails }) => (
  <div className="bg-[#1c1005] text-white font-serif" style={{ fontFamily: "'Georgia', serif" }}>
    {/* Gold border */}
    <div className="h-1 bg-gradient-to-r from-amber-700 via-yellow-400 to-amber-700" />
    <div className="px-10 py-10">
      {/* Logo + Name */}
      <div className="text-center mb-8">
        {businessDetails.logo_url ? (
          <img src={businessDetails.logo_url} alt="Logo" className="h-16 object-contain mx-auto mb-3" crossOrigin="anonymous" />
        ) : (
          <p className="text-3xl font-bold tracking-widest text-yellow-400 mb-1">{businessDetails.business_name || 'Restaurant'}</p>
        )}
        <p className="text-amber-300 text-xs tracking-[0.3em] uppercase">{businessDetails.address}</p>
        <p className="text-amber-400/60 text-xs mt-1">{businessDetails.phone_number} · {businessDetails.email}</p>
      </div>

      {/* Ornamental divider */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1 h-px bg-amber-700/40" />
        <span className="text-amber-600 text-lg">✦</span>
        <div className="flex-1 h-px bg-amber-700/40" />
      </div>

      {/* Invoice ref */}
      <div className="text-center mb-8">
        <p className="text-amber-400 text-xs uppercase tracking-widest">{displayInvoice.invoiceTitle || 'Invoice'} · #{displayInvoice.invoiceNumber || '—'}</p>
        <p className="text-amber-300/60 text-xs mt-1">{fmtDate(displayInvoice.issuedDate)} · Due: {fmtDate(displayInvoice.dueDate)}</p>
        <div className="flex justify-center mt-2"><StatusBadge status={displayInvoice.status} variant="dark" /></div>
      </div>

      {/* Guest */}
      <div className="bg-[#2c1f0a] rounded-xl p-4 mb-8 text-center">
        <p className="text-amber-600 text-xs uppercase tracking-widest mb-1">Guest</p>
        <p className="font-semibold text-white">{displayInvoice.name || '—'}</p>
        <p className="text-amber-400/70 text-xs">{displayInvoice.email}</p>
      </div>

      {/* Items */}
      <div className="mb-8">
        {(displayInvoice.items || []).map((item: any, i: number) => (
          <div key={item.id || i} className={`flex items-center justify-between py-3 ${i < displayInvoice.items.length - 1 ? 'border-b border-amber-900/30' : ''}`}>
            <div>
              <p className="text-sm text-amber-100 italic">{item.description}</p>
              {item.quantity > 1 && <p className="text-xs text-amber-400/60">× {item.quantity}</p>}
            </div>
            <p className="text-amber-300">${fmt(item.totalPrice)}</p>
          </div>
        ))}
      </div>

      {/* Ornamental divider */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-px bg-amber-700/40" />
        <span className="text-amber-600">✦</span>
        <div className="flex-1 h-px bg-amber-700/40" />
      </div>

      {/* Totals */}
      <div className="space-y-2 text-sm mb-8">
        <div className="flex justify-between text-amber-400/80"><span>Subtotal</span><span>${fmt(calculatedInvoice.subtotal)}</span></div>
        {(calculatedInvoice.taxes || []).map((t: any, i: number) => <div key={i} className="flex justify-between text-amber-400/80"><span>Tax & Service</span><span>${fmt(t.amount)}</span></div>)}
        <div className="flex justify-between text-xl font-bold text-yellow-400 border-t border-amber-700 pt-3 mt-3">
          <span>Total</span><span>${fmt(calculatedInvoice.total)}</span>
        </div>
      </div>

      <PaymentDetails showPaymentMethods={displayInvoice.showPaymentMethods !== false} paymentMethods={displayInvoice.paymentMethods} paymentDetails={paymentDetails} theme="executive" />

      {displayInvoice.notes && <p className="text-amber-400/60 text-xs text-center mt-4 italic">{displayInvoice.notes}</p>}

      <div className="text-center mt-8">
        <p className="text-amber-400 text-sm italic">We hope to see you again soon</p>
      </div>
    </div>
    <div className="h-1 bg-gradient-to-r from-amber-700 via-yellow-400 to-amber-700" />
  </div>
);

// ─── 17. Consulting ───────────────────────────────────────────────────────────
export const ConsultingTemplate: React.FC<TemplateProps> = ({ businessDetails, displayInvoice, calculatedInvoice, paymentDetails }) => (
  <div className="bg-white font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
    {/* Sophisticated header: left navy bar */}
    <div className="flex min-h-full">
      <div className="w-1.5 bg-[#2c3e50] flex-shrink-0" />
      <div className="flex-1">
        {/* Header */}
        <div className="px-10 pt-10 pb-8 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              {businessDetails.logo_url ? (
                <img src={businessDetails.logo_url} alt="Logo" className="h-10 object-contain mb-3" crossOrigin="anonymous" />
              ) : (
                <p className="text-2xl font-bold text-[#2c3e50] mb-1">{businessDetails.business_name || 'Consulting Firm'}</p>
              )}
              <p className="text-gray-500 text-sm">{businessDetails.email}</p>
              <p className="text-gray-500 text-sm">{businessDetails.phone_number}</p>
              <p className="text-gray-500 text-sm">{businessDetails.address}</p>
              {businessDetails.vat_number && <p className="text-xs text-gray-400 mt-1">Reg: {businessDetails.vat_number}</p>}
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">{displayInvoice.invoiceTitle || 'Professional Invoice'}</p>
              <p className="text-3xl font-light text-[#2c3e50]">#{displayInvoice.invoiceNumber || '—'}</p>
              <div className="mt-2"><StatusBadge status={displayInvoice.status} /></div>
              <p className="text-xs text-gray-400 mt-2">Issued: {fmtDate(displayInvoice.issuedDate)}</p>
              <p className="text-xs text-gray-400">Due: {fmtDate(displayInvoice.dueDate)}</p>
            </div>
          </div>
        </div>

        {/* Client */}
        <div className="px-10 py-6 border-b border-gray-200">
          <div className="grid grid-cols-2 gap-12">
            <div>
              <p className="text-xs font-bold text-[#2c3e50] uppercase tracking-widest mb-2">Prepared For</p>
              <p className="font-bold text-gray-900 text-lg">{displayInvoice.name || '—'}</p>
              <p className="text-gray-500 text-sm">{displayInvoice.email}</p>
              <p className="text-gray-500 text-sm">{displayInvoice.details}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-[#2c3e50] uppercase tracking-widest mb-2">Prepared By</p>
              <p className="font-bold text-gray-900">{businessDetails.contact_name || businessDetails.business_name}</p>
              <p className="text-gray-500 text-sm">{businessDetails.business_name}</p>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="px-10 py-6">
          <p className="text-xs font-bold text-[#2c3e50] uppercase tracking-widest mb-4">Services</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-[#2c3e50] text-[#2c3e50]">
                <th className="text-left pb-3 font-semibold">Description</th>
                <th className="text-center pb-3 font-semibold">Hours/Units</th>
                <th className="text-right pb-3 font-semibold">Rate</th>
                <th className="text-right pb-3 font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {(displayInvoice.items || []).map((item: any, i: number) => (
                <tr key={item.id || i} className="border-b border-gray-100">
                  <td className="py-4 text-gray-800">{item.description}{item.additionalInfo && <span className="block text-xs text-gray-400">{item.additionalInfo}</span>}</td>
                  <td className="py-4 text-center text-gray-500">{item.quantity}</td>
                  <td className="py-4 text-right text-gray-500">${fmt(item.unitPrice)}</td>
                  <td className="py-4 text-right font-semibold text-gray-900">${fmt(item.totalPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="px-10 pb-8 flex justify-end">
          <div className="w-72 space-y-2 text-sm">
            <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>${fmt(calculatedInvoice.subtotal)}</span></div>
            {(calculatedInvoice.discounts || []).map((d: any, i: number) => <div key={i} className="flex justify-between text-red-500"><span>Discount</span><span>-${fmt(d.amount)}</span></div>)}
            {(calculatedInvoice.taxes || []).map((t: any, i: number) => <div key={i} className="flex justify-between text-gray-500"><span>Tax</span><span>${fmt(t.amount)}</span></div>)}
            <div className="flex justify-between pt-3 border-t-2 border-[#2c3e50] font-bold text-gray-900 text-base">
              <span>Total Due</span><span className="text-[#2c3e50]">${fmt(calculatedInvoice.total)}</span>
            </div>
          </div>
        </div>

        {displayInvoice.notes && <div className="px-10 pb-4 text-sm text-gray-500 italic border-t border-gray-100 pt-4">{displayInvoice.notes}</div>}
        <div className="px-10 pb-10">
          <PaymentDetails showPaymentMethods={displayInvoice.showPaymentMethods !== false} paymentMethods={displayInvoice.paymentMethods} paymentDetails={paymentDetails} theme="default" />
        </div>
      </div>
    </div>
  </div>
);

// ─── 18. Green Eco ────────────────────────────────────────────────────────────
export const GreenEcoTemplate: React.FC<TemplateProps> = ({ businessDetails, displayInvoice, calculatedInvoice, paymentDetails }) => (
  <div className="bg-white font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
    <div className="bg-[#2d6a4f] text-white px-10 py-8">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {businessDetails.logo_url ? (
            <div className="bg-white/95 p-1.5 rounded-lg inline-block shadow-sm">
              <img src={businessDetails.logo_url} alt="Logo" className="h-9 object-contain" crossOrigin="anonymous" />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <svg className="h-8 w-8 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <p className="text-xl font-bold">{businessDetails.business_name || 'Eco Company'}</p>
            </div>
          )}
        </div>
        <div className="text-right">
          <p className="text-green-200 text-xs uppercase tracking-widest">{displayInvoice.invoiceTitle || 'Eco Invoice'}</p>
          <p className="text-2xl font-bold">#{displayInvoice.invoiceNumber || '—'}</p>
          <div className="mt-2"><StatusBadge status={displayInvoice.status} variant="dark" /></div>
        </div>
      </div>
    </div>

    {/* Leaf-green strip */}
    <div className="bg-[#40916c] text-white px-10 py-3 text-xs flex justify-between">
      <span>🌿 <strong>{businessDetails.business_name}</strong> is committed to sustainable business practices</span>
      <span>Issued: {fmtDate(displayInvoice.issuedDate)} · Due: {fmtDate(displayInvoice.dueDate)}</span>
    </div>

    <div className="px-10 py-6 grid grid-cols-2 gap-8 border-b border-gray-200">
      <div>
        <p className="text-xs font-bold text-[#2d6a4f] uppercase tracking-widest mb-2">From</p>
        <p className="font-bold text-gray-900">{businessDetails.business_name}</p>
        <p className="text-sm text-gray-500">{businessDetails.email}</p>
        <p className="text-sm text-gray-500">{businessDetails.address}</p>
      </div>
      <div>
        <p className="text-xs font-bold text-[#2d6a4f] uppercase tracking-widest mb-2">Bill To</p>
        <p className="font-bold text-gray-900">{displayInvoice.name || '—'}</p>
        <p className="text-sm text-gray-500">{displayInvoice.email}</p>
        <p className="text-sm text-gray-500">{displayInvoice.details}</p>
      </div>
    </div>

    <div className="px-10 py-6">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#d8f3dc] text-[#2d6a4f]">
            <th className="text-left p-3 rounded-l-lg font-semibold">Description</th>
            <th className="text-center p-3 font-semibold">Qty</th>
            <th className="text-right p-3 font-semibold">Price</th>
            <th className="text-right p-3 rounded-r-lg font-semibold">Total</th>
          </tr>
        </thead>
        <tbody>
          {(displayInvoice.items || []).map((item: any, i: number) => (
            <tr key={item.id || i} className={`border-b border-gray-100 ${i % 2 === 0 ? '' : 'bg-[#f0fdf4]'}`}>
              <td className="p-3 text-gray-800">{item.description}</td>
              <td className="p-3 text-center text-gray-500">{item.quantity}</td>
              <td className="p-3 text-right text-gray-500">${fmt(item.unitPrice)}</td>
              <td className="p-3 text-right font-bold text-gray-900">${fmt(item.totalPrice)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="px-10 pb-8 flex justify-end">
      <div className="w-72 space-y-2 text-sm">
        <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>${fmt(calculatedInvoice.subtotal)}</span></div>
        {(calculatedInvoice.taxes || []).map((t: any, i: number) => <div key={i} className="flex justify-between text-gray-500"><span>Tax</span><span>${fmt(t.amount)}</span></div>)}
        <div className="flex justify-between bg-[#2d6a4f] text-white rounded-xl p-4 mt-2 items-center">
          <span className="font-bold">Total Due</span>
          <span className="text-xl font-bold">${fmt(calculatedInvoice.total)}</span>
        </div>
      </div>
    </div>

    {displayInvoice.notes && <div className="mx-10 mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-gray-600">{displayInvoice.notes}</div>}
    <div className="px-10 pb-6">
      <PaymentDetails showPaymentMethods={displayInvoice.showPaymentMethods !== false} paymentMethods={displayInvoice.paymentMethods} paymentDetails={paymentDetails} theme="default" />
    </div>
    <div className="bg-[#2d6a4f] text-green-200 text-xs px-10 py-3 text-center">
      🌱 This invoice was generated without paper · {businessDetails.business_name}
    </div>
  </div>
);

// ─── 19. Professional Gray ────────────────────────────────────────────────────
export const ProfessionalGrayTemplate: React.FC<TemplateProps> = ({ businessDetails, displayInvoice, calculatedInvoice, paymentDetails }) => (
  <div className="bg-[#f8f8f8] font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
    <div className="bg-[#374151] text-white px-10 py-8">
      <div className="flex items-start justify-between">
        <div>
          {businessDetails.logo_url ? (
            <div className="bg-white/95 p-1.5 rounded-lg inline-block shadow-sm mb-3">
              <img src={businessDetails.logo_url} alt="Logo" className="h-10 object-contain" crossOrigin="anonymous" />
            </div>
          ) : (
            <p className="text-xl font-bold mb-1">{businessDetails.business_name || 'Company Name'}</p>
          )}
          <p className="text-gray-300 text-sm">{businessDetails.email} · {businessDetails.phone_number}</p>
          <p className="text-gray-400 text-sm">{businessDetails.address}</p>
        </div>
        <div className="text-right">
          <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">{displayInvoice.invoiceTitle || 'Invoice'}</p>
          <p className="text-3xl font-bold text-white">#{displayInvoice.invoiceNumber || '—'}</p>
          <div className="mt-2"><StatusBadge status={displayInvoice.status} variant="dark" /></div>
        </div>
      </div>
    </div>

    <div className="bg-[#4b5563] text-white px-10 py-3 text-xs flex gap-8">
      <span className="text-gray-300">ISSUED: <strong className="text-white">{fmtDate(displayInvoice.issuedDate)}</strong></span>
      <span className="text-gray-300">DUE: <strong className="text-white">{fmtDate(displayInvoice.dueDate)}</strong></span>
    </div>

    <div className="px-10 py-8 grid grid-cols-2 gap-12 bg-white border-b border-gray-200">
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">From</p>
        <p className="font-bold text-gray-900">{businessDetails.business_name || '—'}</p>
        <p className="text-sm text-gray-500">{businessDetails.address}{businessDetails.city ? `, ${businessDetails.city}` : ''}</p>
        <p className="text-sm text-gray-500">{businessDetails.email}</p>
        {businessDetails.vat_number && <p className="text-xs text-gray-400 mt-1">VAT: {businessDetails.vat_number}</p>}
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Bill To</p>
        <p className="font-bold text-gray-900">{displayInvoice.name || '—'}</p>
        <p className="text-sm text-gray-500">{displayInvoice.email}</p>
        <p className="text-sm text-gray-500">{displayInvoice.details}</p>
      </div>
    </div>

    <div className="px-10 py-6 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#374151] text-white">
            <th className="text-left px-4 py-3 rounded-tl-lg">Description</th>
            <th className="text-center px-4 py-3">Qty</th>
            <th className="text-right px-4 py-3">Unit Price</th>
            <th className="text-right px-4 py-3 rounded-tr-lg">Amount</th>
          </tr>
        </thead>
        <tbody>
          {(displayInvoice.items || []).map((item: any, i: number) => (
            <tr key={item.id || i} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
              <td className="px-4 py-3 text-gray-800">{item.description}</td>
              <td className="px-4 py-3 text-center text-gray-500">{item.quantity}</td>
              <td className="px-4 py-3 text-right text-gray-500">${fmt(item.unitPrice)}</td>
              <td className="px-4 py-3 text-right font-semibold text-gray-900">${fmt(item.totalPrice)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="px-10 py-6 bg-white flex justify-end border-t border-gray-200">
      <div className="w-72 space-y-2 text-sm">
        <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>${fmt(calculatedInvoice.subtotal)}</span></div>
        {(calculatedInvoice.taxes || []).map((t: any, i: number) => <div key={i} className="flex justify-between text-gray-500"><span>Tax</span><span>${fmt(t.amount)}</span></div>)}
        <div className="flex justify-between bg-[#374151] text-white rounded-xl p-4 mt-2 items-center">
          <span className="font-bold">TOTAL DUE</span>
          <span className="text-xl font-bold">${fmt(calculatedInvoice.total)}</span>
        </div>
      </div>
    </div>

    {displayInvoice.notes && <div className="px-10 pb-4 pt-2 text-sm text-gray-500 italic bg-white">{displayInvoice.notes}</div>}
    <div className="px-10 pb-8 bg-white">
      <PaymentDetails showPaymentMethods={displayInvoice.showPaymentMethods !== false} paymentMethods={displayInvoice.paymentMethods} paymentDetails={paymentDetails} theme="default" />
    </div>
    <div className="bg-[#374151] text-gray-400 text-xs px-10 py-3 text-center">
      {businessDetails.business_name} · {businessDetails.email} · Thank you for your business
    </div>
  </div>
);

// ─── 20. International Business ───────────────────────────────────────────────
export const InternationalBusinessTemplate: React.FC<TemplateProps> = ({ businessDetails, displayInvoice, calculatedInvoice, paymentDetails }) => (
  <div className="bg-white font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
    {/* Globe-inspired header */}
    <div className="relative overflow-hidden bg-gradient-to-r from-[#1a237e] to-[#283593] px-10 py-10">
      <div className="absolute right-0 top-0 h-full w-1/3 opacity-10" style={{
        backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }} />
      <div className="flex items-start justify-between relative z-10">
        <div>
          {businessDetails.logo_url ? (
            <div className="bg-white/95 p-1.5 rounded-lg inline-block shadow-sm mb-4">
              <img src={businessDetails.logo_url} alt="Logo" className="h-10 object-contain" crossOrigin="anonymous" />
            </div>
          ) : (
            <p className="text-2xl font-bold text-white mb-2">{businessDetails.business_name || 'Global Company'}</p>
          )}
          <p className="text-blue-200 text-sm">{businessDetails.email}</p>
          <p className="text-blue-200 text-sm">{businessDetails.address}, {businessDetails.country}</p>
          {businessDetails.vat_number && <p className="text-blue-300 text-xs mt-1">VAT/GST: {businessDetails.vat_number}</p>}
        </div>
        <div className="text-right">
          <div className="inline-block bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4">
            <p className="text-blue-200 text-xs uppercase tracking-widest mb-1">{displayInvoice.invoiceTitle || 'Commercial Invoice'}</p>
            <p className="text-white text-3xl font-bold">#{displayInvoice.invoiceNumber || '—'}</p>
            <div className="mt-2 flex justify-end"><StatusBadge status={displayInvoice.status} variant="dark" /></div>
          </div>
        </div>
      </div>
    </div>

    {/* Blue strip with dates */}
    <div className="bg-[#283593] text-blue-200 px-10 py-3 text-xs flex gap-8 border-t border-blue-800">
      <span>DATE OF ISSUE: <strong className="text-white">{fmtDate(displayInvoice.issuedDate)}</strong></span>
      <span>PAYMENT DUE: <strong className="text-white">{fmtDate(displayInvoice.dueDate)}</strong></span>
    </div>

    <div className="px-10 py-8 grid grid-cols-2 gap-12 border-b border-gray-200">
      <div>
        <p className="text-xs font-bold text-[#1a237e] uppercase tracking-widest mb-3">Seller / Exporter</p>
        <p className="font-bold text-gray-900">{businessDetails.business_name || '—'}</p>
        <p className="text-sm text-gray-500">{businessDetails.address}</p>
        <p className="text-sm text-gray-500">{businessDetails.city}, {businessDetails.region_state} {businessDetails.postal_code}</p>
        <p className="text-sm text-gray-500">{businessDetails.country}</p>
        <p className="text-sm text-gray-500">{businessDetails.phone_number}</p>
      </div>
      <div>
        <p className="text-xs font-bold text-[#1a237e] uppercase tracking-widest mb-3">Buyer / Consignee</p>
        <p className="font-bold text-gray-900">{displayInvoice.name || '—'}</p>
        <p className="text-sm text-gray-500">{displayInvoice.email}</p>
        <p className="text-sm text-gray-500">{displayInvoice.details}</p>
      </div>
    </div>

    <div className="px-10 py-6">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#1a237e] text-white">
            <th className="text-left px-4 py-3 rounded-tl-lg">Description of Goods/Services</th>
            <th className="text-center px-4 py-3">Qty</th>
            <th className="text-right px-4 py-3">Unit Value</th>
            <th className="text-right px-4 py-3 rounded-tr-lg">Total Value</th>
          </tr>
        </thead>
        <tbody>
          {(displayInvoice.items || []).map((item: any, i: number) => (
            <tr key={item.id || i} className={`border-b border-gray-200 ${i % 2 === 0 ? 'bg-white' : 'bg-blue-50/30'}`}>
              <td className="px-4 py-3 text-gray-800">{item.description}{item.additionalInfo && <span className="block text-xs text-gray-400">{item.additionalInfo}</span>}</td>
              <td className="px-4 py-3 text-center text-gray-500">{item.quantity}</td>
              <td className="px-4 py-3 text-right text-gray-500">${fmt(item.unitPrice)}</td>
              <td className="px-4 py-3 text-right font-bold text-gray-900">${fmt(item.totalPrice)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="px-10 pb-8 flex justify-between items-end">
      <div className="text-sm text-gray-500 max-w-xs">
        {displayInvoice.notes && <p className="italic mb-2">{displayInvoice.notes}</p>}
        <p className="text-xs text-gray-400">All transactions in USD. Currency conversion subject to rates on due date.</p>
      </div>
      <div className="w-72 space-y-2 text-sm">
        <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>${fmt(calculatedInvoice.subtotal)}</span></div>
        {(calculatedInvoice.discounts || []).map((d: any, i: number) => <div key={i} className="flex justify-between text-red-500"><span>Discount</span><span>-${fmt(d.amount)}</span></div>)}
        {(calculatedInvoice.taxes || []).map((t: any, i: number) => <div key={i} className="flex justify-between text-gray-500"><span>Tax</span><span>${fmt(t.amount)}</span></div>)}
        <div className="flex justify-between bg-[#1a237e] text-white rounded-xl p-4 mt-2 items-center">
          <span className="font-bold">TOTAL DUE</span>
          <span className="text-xl font-bold">${fmt(calculatedInvoice.total)}</span>
        </div>
      </div>
    </div>

    <div className="px-10 pb-8">
      <PaymentDetails showPaymentMethods={displayInvoice.showPaymentMethods !== false} paymentMethods={displayInvoice.paymentMethods} paymentDetails={paymentDetails} theme="default" />
    </div>
    <div className="bg-[#1a237e] text-blue-300 text-xs px-10 py-4 flex justify-between items-center">
      <span>{businessDetails.business_name} · {businessDetails.country}</span>
      <span>Thank you for your international business partnership</span>
    </div>
  </div>
);
